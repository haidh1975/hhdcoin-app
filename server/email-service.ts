import nodemailer from 'nodemailer';
import { env } from './config/env';
import { log } from './vite';

// â”€â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function buildConfig(): EmailConfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return {
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: SMTP_PORT === '465',
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: EMAIL_FROM ?? `HHDcoin <${SMTP_USER}>`,
  };
}

// â”€â”€â”€ Transporter (lazy-init) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter;
  const cfg = buildConfig();
  if (!cfg) {
    log('[Email] SMTP chÆ°a cáº¥u hÃ¬nh â€” email bá»‹ bá» qua');
    return null;
  }
  _transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    // Timeout ngáº¯n Ä‘á»ƒ khÃ´ng treo endpoint khi cá»•ng SMTP bá»‹ cháº·n (vd Railway cháº·n 587/465)
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  return _transporter;
}

// â”€â”€â”€ Resend HTTP API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Æ¯u tiÃªn Resend qua HTTPS (443) â€” nhiá»u ná»n táº£ng (Railway) CHáº¶N cá»•ng SMTP outbound.

async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY!;
  const from = env.EMAIL_FROM ?? env.RESEND_FROM ?? 'HHDcoin <onboarding@resend.dev>';
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
      log(`[Email][Resend] Sent "${opts.subject}" â†’ ${opts.to}`);
      return true;
    }
    log(`[Email][Resend] Failed (${res.status}): ${await res.text()}`);
    return false;
  } catch (err: any) {
    log(`[Email][Resend] Error: ${err.message}`);
    return false;
  }
}

// â”€â”€â”€ Core send â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  // Æ¯u tiÃªn Resend (HTTP) â€” hoáº¡t Ä‘á»™ng trÃªn Railway; SMTP fallback cho host cho phÃ©p SMTP.
  if (env.RESEND_API_KEY) return sendViaResend(opts);

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
    log(`[Email] Sent "${opts.subject}" â†’ ${opts.to}`);
    return true;
  } catch (err: any) {
    log(`[Email] Failed to send "${opts.subject}" â†’ ${opts.to}: ${err.message}`);
    return false;
  }
}

// â”€â”€â”€ Shared layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    <h1>ðŸª™ HHDcoin</h1>
    <p>Bitcoin Investment Platform</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    Â© ${new Date().getFullYear()} HHDcoin Â· <a href="mailto:support@hhdcoin.com">support@hhdcoin.com</a><br/>
    Báº¡n nháº­n email nÃ y vÃ¬ Ä‘Ã£ Ä‘Äƒng kÃ½ tÃ i khoáº£n táº¡i HHDcoin.
  </div>
</div>
</body>
</html>`;
}

// â”€â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Gá»­i email chÃ o má»«ng sau khi Ä‘Äƒng kÃ½ */
export async function sendWelcomeEmail(opts: {
  to: string;
  fullName: string;
  username: string;
}): Promise<boolean> {
  const content = `
    <h2>ChÃ o má»«ng, ${opts.fullName}! ðŸŽ‰</h2>
    <p>TÃ i khoáº£n HHDcoin cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c táº¡o thÃ nh cÃ´ng.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">TÃªn Ä‘Äƒng nháº­p</span>
        <span class="info-value">${opts.username}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">${opts.to}</span>
      </div>
    </div>
    <p>Báº¯t Ä‘áº§u hÃ nh trÃ¬nh Ä‘áº§u tÆ° Bitcoin ngay hÃ´m nay â€” xem cÃ¡c gÃ³i Ä‘áº§u tÆ° phÃ¹ há»£p vá»›i báº¡n.</p>
    <a class="btn" href="${env.APP_URL ?? 'http://localhost:5000'}/investment-packages">
      Xem gÃ³i Ä‘áº§u tÆ°
    </a>
    <p style="margin-top:24px;font-size:13px;color:#78716c;">
      Náº¿u báº¡n khÃ´ng Ä‘Äƒng kÃ½ tÃ i khoáº£n nÃ y, hÃ£y bá» qua email nÃ y.
    </p>`;

  return sendMail({
    to: opts.to,
    subject: 'ðŸŽ‰ ChÃ o má»«ng báº¡n Ä‘áº¿n vá»›i HHDcoin!',
    html: wrapLayout(content, 'ChÃ o má»«ng Ä‘áº¿n HHDcoin'),
  });
}

/** Gá»­i email xÃ¡c nháº­n thanh toÃ¡n thÃ nh cÃ´ng */
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
    ? opts.amount.toLocaleString('vi-VN') + ' â‚«'
    : '$' + opts.amount.toLocaleString('en-US');

  const content = `
    <h2>Thanh toÃ¡n thÃ nh cÃ´ng âœ…</h2>
    <p>Giao dá»‹ch Ä‘áº§u tÆ° cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c nháº­n. Cáº£m Æ¡n, <strong>${opts.fullName}</strong>!</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">GÃ³i Ä‘áº§u tÆ°</span>
        <span class="info-value">${opts.packageName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Sá»‘ tiá»n</span>
        <span class="info-value">${amountStr}</span>
      </div>
      <div class="info-row">
        <span class="info-label">MÃ£ giao dá»‹ch</span>
        <span class="info-value">${opts.transactionId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Thá»i gian</span>
        <span class="info-value">${opts.paymentDate.toLocaleString('vi-VN')}</span>
      </div>
    </div>
    <p>Theo dÃµi hiá»‡u suáº¥t Ä‘áº§u tÆ° cá»§a báº¡n trong báº£ng Ä‘iá»u khiá»ƒn.</p>
    <a class="btn" href="${env.APP_URL ?? 'http://localhost:5000'}/account-management">
      Xem Ä‘áº§u tÆ° cá»§a tÃ´i
    </a>`;

  return sendMail({
    to: opts.to,
    subject: `âœ… XÃ¡c nháº­n Ä‘áº§u tÆ° â€” ${opts.packageName}`,
    html: wrapLayout(content, 'XÃ¡c nháº­n thanh toÃ¡n'),
  });
}

/** Gá»­i email xÃ¡c nháº­n Ä‘Ã£ nháº­n form liÃªn há»‡ */
export async function sendContactConfirmationEmail(opts: {
  to: string;
  name: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const content = `
    <h2>ChÃºng tÃ´i Ä‘Ã£ nháº­n Ä‘Æ°á»£c yÃªu cáº§u cá»§a báº¡n ðŸ“©</h2>
    <p>Xin chÃ o <strong>${opts.name}</strong>,</p>
    <p>Cáº£m Æ¡n báº¡n Ä‘Ã£ liÃªn há»‡ vá»›i HHDcoin. Äá»™i ngÅ© há»— trá»£ sáº½ pháº£n há»“i trong vÃ²ng <strong>24 giá» lÃ m viá»‡c</strong>.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Chá»§ Ä‘á»</span>
        <span class="info-value">${opts.subject}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Ná»™i dung</span>
        <span class="info-value">${opts.message.substring(0, 120)}${opts.message.length > 120 ? 'â€¦' : ''}</span>
      </div>
    </div>
    <p style="font-size:13px;color:#78716c;">
      Trong lÃºc chá» Ä‘á»£i, hÃ£y khÃ¡m phÃ¡ <a href="${env.APP_URL ?? 'http://localhost:5000'}/analysis" style="color:#f97316;">trang phÃ¢n tÃ­ch thá»‹ trÆ°á»ng</a> cá»§a chÃºng tÃ´i.
    </p>`;

  return sendMail({
    to: opts.to,
    subject: `ðŸ“© ÄÃ£ nháº­n: ${opts.subject}`,
    html: wrapLayout(content, 'XÃ¡c nháº­n liÃªn há»‡'),
  });
}

/** Gá»­i email thÃ´ng bÃ¡o P&L hÃ ng tuáº§n */
export async function sendWeeklyPnlEmail(opts: {
  to: string;
  fullName: string;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}): Promise<boolean> {
  const isProfit = opts.profitLoss >= 0;
  const emoji = isProfit ? 'ðŸ“ˆ' : 'ðŸ“‰';
  const sign = isProfit ? '+' : '';

  const content = `
    <h2>${emoji} BÃ¡o cÃ¡o Ä‘áº§u tÆ° tuáº§n nÃ y</h2>
    <p>Xin chÃ o <strong>${opts.fullName}</strong>, Ä‘Ã¢y lÃ  tá»•ng káº¿t hiá»‡u suáº¥t Ä‘áº§u tÆ° cá»§a báº¡n:</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Tá»•ng Ä‘áº§u tÆ°</span>
        <span class="info-value">${opts.totalInvested.toLocaleString('vi-VN')} â‚«</span>
      </div>
      <div class="info-row">
        <span class="info-label">GiÃ¡ trá»‹ hiá»‡n táº¡i</span>
        <span class="info-value">${opts.currentValue.toLocaleString('vi-VN')} â‚«</span>
      </div>
      <div class="info-row">
        <span class="info-label">LÃ£i / Lá»—</span>
        <span class="info-value" style="color:${isProfit ? '#16a34a' : '#dc2626'}">
          ${sign}${opts.profitLoss.toLocaleString('vi-VN')} â‚« (${sign}${opts.profitLossPercent.toFixed(2)}%)
        </span>
      </div>
    </div>
    <a class="btn" href="${env.APP_URL ?? 'http://localhost:5000'}/account-management">
      Xem chi tiáº¿t Ä‘áº§u tÆ°
    </a>`;

  return sendMail({
    to: opts.to,
    subject: `${emoji} BÃ¡o cÃ¡o tuáº§n â€” ${sign}${opts.profitLossPercent.toFixed(2)}%`,
    html: wrapLayout(content, 'BÃ¡o cÃ¡o Ä‘áº§u tÆ° tuáº§n'),
  });
}

/** Kiá»ƒm tra káº¿t ná»‘i email (Resend hoáº·c SMTP) */
export async function verifyEmailConnection(): Promise<boolean> {
  // Resend dÃ¹ng HTTP API â€” coi nhÆ° sáºµn sÃ ng náº¿u cÃ³ key (khÃ´ng cáº§n verify TCP).
  if (env.RESEND_API_KEY) {
    log('[Email] DÃ¹ng Resend HTTP API âœ“');
    return true;
  }
  const transporter = getTransporter();
  if (!transporter) return false;
  try {
    await transporter.verify();
    log('[Email] SMTP connection verified âœ“');
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
