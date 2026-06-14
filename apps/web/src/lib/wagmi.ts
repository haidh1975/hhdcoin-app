import { createConfig, http } from 'wagmi';
import { bsc, bscTestnet } from 'viem/chains';
import { injected, walletConnect } from 'wagmi/connectors';

/**
 * Địa chỉ contract HHD (BEP-20) trên BSC.
 * Có thể là undefined cho tới khi token được triển khai on-chain.
 */
export const HHD_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_HHD_TOKEN_ADDRESS as
  | `0x${string}`
  | undefined;

/** Project ID cho WalletConnect — chỉ bật connector khi có giá trị. */
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

/** ABI tối thiểu của một token BEP-20 (đọc số dư & metadata). */
export const BEP20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/** Danh sách connector — luôn có injected; thêm WalletConnect nếu được cấu hình. */
const connectors = [
  injected({ shimDisconnect: true }),
  ...(WALLETCONNECT_PROJECT_ID
    ? [
        walletConnect({
          projectId: WALLETCONNECT_PROJECT_ID,
          showQrModal: true,
          metadata: {
            name: 'HHD-I',
            description: 'Nền tảng đầu tư crypto thông minh với AI',
            url: 'https://hhd-i.com',
            icons: [],
          },
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet],
  connectors,
  ssr: true,
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});

export { bsc, bscTestnet };
