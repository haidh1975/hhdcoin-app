'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Wallet,
  ChevronDown,
  Copy,
  LogOut,
  Check,
  ExternalLink,
  RefreshCw,
  Link2,
} from 'lucide-react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useReadContract,
  useSwitchChain,
  useChainId,
} from 'wagmi';
import { formatUnits } from 'viem';
import { bsc, HHD_TOKEN_ADDRESS, BEP20_ABI } from '@/lib/wagmi';
import { useWalletLink } from './useWalletLink';

function truncate(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function chainName(id: number): string {
  if (id === bsc.id) return 'BNB Smart Chain';
  if (id === 97) return 'BSC Testnet';
  return `Chain ${id}`;
}

/** Đóng dropdown khi click ra ngoài. */
function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);
  return ref;
}

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));

  const { data: bnbBalance } = useBalance({
    address,
    query: { enabled: !!address },
  });

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

  const { canLink, linking, link } = useWalletLink(address);

  // Tránh hydration mismatch: render placeholder cho tới khi mounted.
  if (!mounted) {
    return (
      <button
        className="flex items-center gap-2 bg-brand text-black font-semibold rounded-lg px-3 py-1.5 text-sm"
        disabled
      >
        <Wallet className="w-3.5 h-3.5" />
        <span>Kết nối ví</span>
      </button>
    );
  }

  // ---- Chưa kết nối: hiện danh sách connector ----
  if (!isConnected || !address) {
    const injectedConnector = connectors.find((c) => c.type === 'injected');
    const hasInjected =
      typeof window !== 'undefined' &&
      !!(window as { ethereum?: unknown }).ethereum;

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-brand text-black font-semibold rounded-lg px-3 py-1.5 text-sm hover:bg-brand/90 transition-colors"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Kết nối ví</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-dark-800 border border-dark-600 rounded-xl shadow-xl p-2 z-50">
            <p className="text-xs text-dark-400 px-2 py-1.5">Chọn ví để kết nối</p>

            {!hasInjected && (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 text-sm text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-brand" /> Cài đặt MetaMask
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-dark-400" />
              </a>
            )}

            {hasInjected && injectedConnector && (
              <button
                onClick={() => {
                  connect({ connector: injectedConnector });
                  setOpen(false);
                }}
                disabled={isPending}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 text-sm text-white transition-colors disabled:opacity-50"
              >
                <Wallet className="w-4 h-4 text-brand" /> MetaMask / Ví trình duyệt
              </button>
            )}

            {connectors
              .filter((c) => c.type === 'walletConnect')
              .map((c) => (
                <button
                  key={c.uid}
                  onClick={() => {
                    connect({ connector: c });
                    setOpen(false);
                  }}
                  disabled={isPending}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 text-sm text-white transition-colors disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4 text-brand" /> WalletConnect
                </button>
              ))}

            {connectError && (
              <p className="text-xs text-red-400 px-2 py-1.5">
                Không thể kết nối ví. Vui lòng thử lại.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---- Đã kết nối ----
  const wrongChain = chainId !== bsc.id;
  const hhdFormatted =
    hhdRaw !== undefined && hhdDecimals !== undefined
      ? Number(formatUnits(hhdRaw as bigint, hhdDecimals as number)).toLocaleString('en-US', {
          maximumFractionDigits: 4,
        })
      : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white hover:border-brand transition-colors"
      >
        <span
          className={`w-2 h-2 rounded-full ${wrongChain ? 'bg-red-400' : 'bg-green-400'}`}
        />
        <span className="font-semibold">{truncate(address)}</span>
        <ChevronDown className="w-3.5 h-3.5 text-dark-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-dark-800 border border-dark-600 rounded-xl shadow-xl p-2 z-50">
          <div className="px-3 py-2">
            <p className="text-xs text-dark-400">Đã kết nối với</p>
            <p className="text-sm font-semibold text-white">{chainName(chainId)}</p>
          </div>

          <div className="border-t border-dark-600 my-1" />

          {/* Số dư */}
          <div className="px-3 py-2 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">BNB</span>
              <span className="text-white font-medium">
                {bnbBalance
                  ? `${Number(
                      formatUnits(bnbBalance.value, bnbBalance.decimals)
                    ).toLocaleString('en-US', {
                      maximumFractionDigits: 4,
                    })} ${bnbBalance.symbol}`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">HHD</span>
              {HHD_TOKEN_ADDRESS ? (
                <span className="text-brand font-medium">{hhdFormatted ?? '—'}</span>
              ) : (
                <span className="text-dark-500 text-xs">chưa triển khai on-chain</span>
              )}
            </div>
          </div>

          <div className="border-t border-dark-600 my-1" />

          {wrongChain && (
            <button
              onClick={() => switchChain({ chainId: bsc.id })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 text-sm text-brand transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Đổi sang BNB Smart Chain
            </button>
          )}

          {canLink && (
            <button
              onClick={link}
              disabled={linking}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 text-sm text-white transition-colors disabled:opacity-50"
            >
              <Link2 className="w-4 h-4 text-brand" />
              {linking ? 'Đang liên kết…' : 'Liên kết ví với tài khoản'}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 text-sm text-white transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-dark-400" />
            )}
            {copied ? 'Đã sao chép' : 'Sao chép địa chỉ'}
          </button>

          <button
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-700 text-sm text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Ngắt kết nối
          </button>
        </div>
      )}
    </div>
  );
}
