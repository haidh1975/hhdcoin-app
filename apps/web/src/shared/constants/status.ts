import type { ProposalStatus, SaleRoundStatus, StakeTier } from '@hhd-i/types';
import type { BadgeTone } from '@/shared/components/ui/Badge';

/** Nhãn + tông màu của một giá trị trạng thái. */
export interface StatusMeta {
  label: string;
  tone: BadgeTone;
}

/** Loại giao dịch → nhãn tiếng Việt (portfolio, admin dashboard, admin transactions). */
export const TX_TYPE_LABELS: Record<string, string> = {
  BUY: 'Mua',
  SELL: 'Bán',
  DEPOSIT: 'Nạp tiền',
  WITHDRAW: 'Rút tiền',
};

/** Trạng thái giao dịch (portfolio, admin transactions). */
export const TX_STATUS_META: Record<string, StatusMeta> = {
  COMPLETED: { label: 'Hoàn tất', tone: 'success' },
  PENDING: { label: 'Đang xử lý', tone: 'warning' },
  FAILED: { label: 'Thất bại', tone: 'danger' },
};

/** Trạng thái vòng bán token (token-sale, admin sale rounds). */
export const SALE_ROUND_STATUS_META: Record<SaleRoundStatus, StatusMeta> = {
  UPCOMING: { label: 'Sắp diễn ra', tone: 'info' },
  ACTIVE: { label: 'Đang mở', tone: 'success' },
  CLOSED: { label: 'Đã đóng', tone: 'neutral' },
};

/** Trạng thái đề xuất DAO (governance). */
export const PROPOSAL_STATUS_META: Record<ProposalStatus, StatusMeta> = {
  ACTIVE: { label: 'Đang bỏ phiếu', tone: 'brand' },
  PASSED: { label: 'Đã thông qua', tone: 'success' },
  REJECTED: { label: 'Bị từ chối', tone: 'danger' },
  EXECUTED: { label: 'Đã thực thi', tone: 'info' },
};

/**
 * Màu badge theo tier staking. Các màu này nằm ngoài bảng tông của Badge
 * (orange/gray/cyan/purple) nên giữ nguyên dạng class thô.
 */
export const STAKE_TIER_BADGE_CLASSES: Record<StakeTier, string> = {
  BRONZE: 'text-orange-300 bg-orange-500/10',
  SILVER: 'text-gray-300 bg-gray-500/10',
  GOLD: 'text-brand bg-brand/10',
  PLATINUM: 'text-cyan-300 bg-cyan-500/10',
  DIAMOND: 'text-purple-300 bg-purple-500/10',
};
