'use client';

import { useEffect, useState } from 'react';
import { Link as LinkIcon, ExternalLink, PlusCircle, AlertCircle } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { bsc, HHD_TOKEN_ADDRESS, BEP20_ABI } from '@/lib/wagmi';
import { WalletButton } from './WalletButton';
import { Card } from '@/shared/components/ui/Card';

const HHD_SYMBOL = 'HHD';
const HHD_DECIMALS_FALLBACK = 18;

export function OnChainSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();

  const { data: hhdRaw } = useReadContract({
    address: HHD_TOKEN_ADDRESS,
    abi: BEP20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!HHD_TOKEN_ADDRESS },
  });
  const { data: hhdDecimals } = useReadContract({
    address: HHD_TOKEN_ADDRESS,
    abi: BEP20_ABI,
    functionName: 'decimals',
    query: { enabled: !!HHD_TOKEN_ADDRESS },
  });

  const decimals = (hhdDecimals as number | undefined) ?? HHD_DECIMALS_FALLBACK;
  const hhdFormatted =
    hhdRaw !== undefined
      ? Number(formatUnits(hhdRaw as bigint, decimals)).toLocaleString('en-US', {
          maximumFractionDigits: 4,
        })
      : null;

  const handleAddToWallet = async () => {
    if (!HHD_TOKEN_ADDRESS) return;
    const eth = (window as { ethereum?: { request: (a: unknown) => Promise<unknown> } })
      .ethereum;
    if (!eth) return;
    try {
      await eth.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: HHD_TOKEN_ADDRESS,
            symbol: HHD_SYMBOL,
            decimals,
          },
        },
      });
    } catch {
      /* người dùng từ chối hoặc lỗi — bỏ qua */
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 border-b border-dark-600 flex items-center gap-2">
        <LinkIcon className="w-4 h-4 text-brand" />
        <h2 className="text-base font-semibold text-white">Kết nối On-chain</h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Thông tin mạng */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
            <p className="text-xs text-dark-400 mb-1">Mạng</p>
            <p className="text-sm font-semibold text-white">BNB Smart Chain</p>
          </div>
          <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
            <p className="text-xs text-dark-400 mb-1">Chain ID</p>
            <p className="text-sm font-semibold text-white">{bsc.id}</p>
          </div>
          <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
            <p className="text-xs text-dark-400 mb-1">Chuẩn token</p>
            <p className="text-sm font-semibold text-white">BEP-20</p>
          </div>
        </div>

        {/* Contract & số dư */}
        {HHD_TOKEN_ADDRESS ? (
          <div className="space-y-4">
            <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
              <p className="text-xs text-dark-400 mb-1.5">Địa chỉ hợp đồng HHD</p>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <code className="text-sm text-white break-all">{HHD_TOKEN_ADDRESS}</code>
                <a
                  href={`https://bscscan.com/token/${HHD_TOKEN_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-brand hover:underline flex-shrink-0"
                >
                  BscScan <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {mounted && isConnected && (
              <div className="bg-brand/5 border border-brand/30 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm text-dark-400">Số dư HHD của bạn</span>
                <span className="text-lg font-bold text-brand">
                  {hhdFormatted ?? '—'} HHD
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-dark-700 border border-dark-600 rounded-lg p-4 flex items-start gap-3 opacity-80">
            <AlertCircle className="w-5 h-5 text-dark-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-dark-400">
              Token sẽ được triển khai trên BSC mainnet (xem Lộ trình Q3 2026). Số dư
              on-chain và liên kết hợp đồng sẽ khả dụng sau khi triển khai.
            </p>
          </div>
        )}

        {/* Hành động */}
        <div className="flex flex-wrap items-center gap-3">
          {mounted && !isConnected && (
            <>
              <p className="text-sm text-dark-400 mr-1">
                Kết nối ví để xem số dư HHD on-chain:
              </p>
              <WalletButton />
            </>
          )}

          <button
            onClick={handleAddToWallet}
            disabled={!mounted || !HHD_TOKEN_ADDRESS || !isConnected}
            className="flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-sm text-white hover:border-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-dark-600"
            title={
              !HHD_TOKEN_ADDRESS
                ? 'Token chưa được triển khai on-chain'
                : !isConnected
                  ? 'Hãy kết nối ví trước'
                  : undefined
            }
          >
            <PlusCircle className="w-4 h-4 text-brand" /> Thêm HHD vào ví MetaMask
          </button>
        </div>
      </div>
    </Card>
  );
}
