import nodemailer from 'nodemailer';
import { log } from './vite';

// ─── Config ─────────────────────────────────────────────────────────────────

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function buildConfig(): EmailConfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return {
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? '587', 10),
    secure: (SMTP_PORT ?? '587') === '465',
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: EMAIL_FROM ?? `HHDcoin <${SMTP_USER}>`,
  };
}

// ─── Transporter (lazy-init) ─────────────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter;
  const cfg = buildConfig();
  if (!cfg) {
    log('[Email] SMTP chưa cấu hình — email bị bỏ qua');
    return null;
  }
  _transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    // Timeout ngắn để không treo endpoint khi cổng SMTP bị chặn (vd Railway chặn 587/465)
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  return _transporter;
}

// ─── Resend HTTP API ─────────────────────────────────────────────────────────
// Ưu tiên Resend qua HTTPS (443) — nhiều nền tảng (Railway) CHẶN cổng SMTP outbound.

async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY!;
  const from = process.env.EMAIL_FROM ?? process.env.RESEND_FROM ?? 'HHDcoin <onboarding@resend.dev>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text ?? opts.html.replace(/<[^>]+>/g, ''),
      }),
    });
    if (res.ok) {
      log(`[Email][Resend] Sent "${opts.subject}" → ${opts.to}`);
      return true;
    }
    log(`[Email][Resend] Failed (${res.status}): ${await res.text()}`);
    return false;
  } catch (err: any) {
    log(`[Email][Resend] Error: ${err.message}`);
    return false;
  }
}

// ─── Core send ───────────────────────────────────────────────────────────────

async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  // Ưu tiên Resend (HTTP) — hoạt động trên Railway; SMTP fallback cho host cho phép SMTP.
  if (process.env.RESEND_API_KEY) return sendViaResend(opts);

  const transporter = getTransporter();
  if (!transporter) return false;

  const cfg = buildConfig()!;
  try {
    await transporter.sendMail({
      from: cfg.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text ?? opts.html.replace(/<[^>]+>/g, ''),
    });
    log(`[Email] Sent "${opts.subject}" → ${opts.to}`);
    return true;
  } catch (err: any) {
    log(`[Email] Failed to send "${opts.subject}" → ${opts.to}: ${err.message}`);
    return false;
  }
}

// ─── Shared layout ───────────────────────────────────────────────────────────

function wrapLayout(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>
  body { margin:0; padding:0; background:#f4f7f9; font-family:Arial,sans-serif; color:#1e293b; }
  .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px;
             overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .header { background:linear-gradient(135deg,#f97316,#fb923c); padding:32px 24px; text-align:center; }
  .header h1 { margin:0; color:#fff; font-size:26px; letter-spacing:.5px; }
  .header p { margin:4px 0 0; color:rgba(255,255,255,.85); font-size:13px; }
  .body { padding:32px 24px; }
  .body h2 { margin-top:0; color:#f97316; }
  .info-box { background:#fff7ed; border-left:4px solid #f97316; border-radius:6px;
              padding:16px; margin:20px 0; }
  .info-row { display:flex; justify-content:space-between; padding:6px 0;
              border-bottom:1px solid #fed7aa; font-size:14px; }
  .info-row:last-child { border-bottom:none; }
  .info-label { color:#78716c; }
  .info-value { font-weight:600; color:#1e293b; }
  .btn { display:inline-block; margin-top:24px; padding:12px 28px;
         background:#f97316; color:#fff !important; text-decoration:none;
         border-radius:8px; font-weight:600; font-size:15px; }
  .footer { background:#f8fafc; padding:20px 24px; text-align:center;
            font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  .footer a { color:#f97316; text-decoration:none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🪙 HHDcoin</h1>
    <p>Bitcoin Investment Platform</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    © ${new Date().getFullYear()} HHDcoin · <a href="mailto:support@hhdcoin.com">support@hhdcoin.com</a><br/>
    Bạn nhận email này vì đã đăng ký tài khoản tại HHDcoin.
  </div>
</div>
</body>
</html>`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Gửi email chào mừng sau khi đăng ký */
export async function sendWelcomeEmail(opts: {
  to: string;
  fullName: string;
  username: string;
}): Promise<boolean> {
  const content = `
    <h2>Chào mừng, ${opts.fullName}! 🎉</h2>
    <p>Tài khoản HHDcoin của bạn đã được tạo thành công.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Tên đăng nhập</span>
        <span class="info-value">${opts.username}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">${opts.to}</span>
      </div>
    </div>
    <p>Bắt đầu hành trình đầu tư Bitcoin ngay hôm nay — xem các gói đầu tư phù hợp với bạn.</p>
    <a class="btn" href="${process.env.APP_URL ?? 'http://localhost:5000'}/investment-packages">
      Xem gói đầu tư
    </a>
    <p style="margin-top:24px;font-size:13px;color:#78716c;">
      Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.
    </p>`;

  return sendMail({
    to: opts.to,
    subject: '🎉 Chào mừng bạn đến với HHDcoin!',
    html: wrapLayout(content, 'Chào mừng đến HHDcoin'),
  });
}

/** Gửi email xác nhận thanh toán thành công */
export async function sendPaymentConfirmationEmail(opts: {
  to: string;
  fullName: string;
  packageName: string;
  amount: number;
  currency: string;
  transactionId: string;
  paymentDate: Date;
}): Promise<boolean> {
  const amountStr = opts.currency === 'VND'
    ? opts.amount.toLocaleString('vi-VN') + ' ₫'
    : '$' + opts.amount.toLocaleString('en-US');

  const content = `
    <h2>Thanh toán thành công ✅</h2>
    <p>Giao dịch đầu tư của bạn đã được xác nhận. Cảm ơn, <strong>${opts.fullName}</strong>!</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Gói đầu tư</span>
        <span class="info-value">${opts.packageName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Số tiền</span>
        <span class="info-value">${amountStr}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Mã giao dịch</span>
        <span class="info-value">${opts.transactionId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Thời gian</span>
        <span class="info-value">${opts.paymentDate.toLocaleString('vi-VN')}</span>
      </div>
    </div>
    <p>Theo dõi hiệu suất đầu tư của bạn trong bảng điều khiển.</p>
    <a class="btn" href="${process.env.APP_URL ?? 'http://localhost:5000'}/account-management">
      Xem đầu tư của tôi
    </a>`;

  return sendMail({
    to: opts.to,
    subject: `✅ Xác nhận đầu tư — ${opts.packageName}`,
    html: wrapLayout(content, 'Xác nhận thanh toán'),
  });
}

/** Gửi email xác nhận đã nhận form liên hệ */
export async function sendContactConfirmationEmail(opts: {
  to: string;
  name: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const content = `
    <h2>Chúng tôi đã nhận được yêu cầu của bạn 📩</h2>
    <p>Xin chào <strong>${opts.name}</strong>,</p>
    <p>Cảm ơn bạn đã liên hệ với HHDcoin. Đội ngũ hỗ trợ sẽ phản hồi trong vòng <strong>24 giờ làm việc</strong>.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Chủ đề</span>
        <span class="info-value">${opts.subject}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Nội dung</span>
        <span class="info-value">${opts.message.substring(0, 120)}${opts.message.length > 120 ? '…' : ''}</span>
      </div>
    </div>
    <p style="font-size:13px;color:#78716c;">
      Trong lúc chờ đợi, hãy khám phá <a href="${process.env.APP_URL ?? 'http://localhost:5000'}/analysis" style="color:#f97316;">trang phân tích thị trường</a> của chúng tôi.
    </p>`;

  return sendMail({
    to: opts.to,
    subject: `📩 Đã nhận: ${opts.subject}`,
    html: wrapLayout(content, 'Xác nhận liên hệ'),
  });
}

/** Gửi email thông báo P&L hàng tuần */
export async function sendWeeklyPnlEmail(opts: {
  to: string;
  fullName: string;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}): Promise<boolean> {
  const isProfit = opts.profitLoss >= 0;
  const emoji = isProfit ? '📈' : '📉';
  const sign = isProfit ? '+' : '';

  const content = `
    <h2>${emoji} Báo cáo đầu tư tuần này</h2>
    <p>Xin chào <strong>${opts.fullName}</strong>, đây là tổng kết hiệu suất đầu tư của bạn:</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Tổng đầu tư</span>
        <span class="info-value">${opts.totalInvested.toLocaleString('vi-VN')} ₫</span>
      </div>
      <div class="info-row">
        <span class="info-label">Giá trị hiện tại</span>
        <span class="info-value">${opts.currentValue.toLocaleString('vi-VN')} ₫</span>
      </div>
      <div class="info-row">
        <span class="info-label">Lãi / Lỗ</span>
        <span class="info-value" style="color:${isProfit ? '#16a34a' : '#dc2626'}">
          ${sign}${opts.profitLoss.toLocaleString('vi-VN')} ₫ (${sign}${opts.profitLossPercent.toFixed(2)}%)
        </span>
      </div>
    </div>
    <a class="btn" href="${process.env.APP_URL ?? 'http://localhost:5000'}/account-management">
      Xem chi tiết đầu tư
    </a>`;

  return sendMail({
    to: opts.to,
    subject: `${emoji} Báo cáo tuần — ${sign}${opts.profitLossPercent.toFixed(2)}%`,
    html: wrapLayout(content, 'Báo cáo đầu tư tuần'),
  });
}

/** Kiểm tra kết nối email (Resend hoặc SMTP) */
export async function verifyEmailConnection(): Promise<boolean> {
  // Resend dùng HTTP API — coi như sẵn sàng nếu có key (không cần verify TCP).
  if (process.env.RESEND_API_KEY) {
    log('[Email] Dùng Resend HTTP API ✓');
    return true;
  }
  const transporter = getTransporter();
  if (!transporter) return false;
  try {
    await transporter.verify();
    log('[Email] SMTP connection verified ✓');
    return true;
  } catch (err: any) {
    log(`[Email] SMTP verify failed: ${err.message}`);
    return false;
  }
}

export const emailService = {
  sendWelcomeEmail,
  sendPaymentConfirmationEmail,
  sendContactConfirmationEmail,
  sendWeeklyPnlEmail,
  verifyEmailConnection,
};
