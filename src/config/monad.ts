import { defineChain } from 'viem';

// Monad Testnet Chain Definition
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com',
    },
  },
  testnet: true,
});

// Chog Genesis Collection details from SOURCE_OF_TRUTH.md
export const CHOG_COLLECTION = {
  contractAddress: '0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763' as `0x${string}`,
  reportedTotalSupply: 1969,
  name: 'Chog Genesis',
  symbol: 'CHOG',
};

// Reliable IPFS Gateway Resolver
export function resolveIpfsUri(uri: string): string {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return uri;
}

// Minimal ERC-721 ABI for querying ownership & token metadata
export const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Curated starter Chog characters for preview/demo mode
export const STARTER_CHOGS = [
  {
    tokenId: '1178',
    name: 'Chog #1178',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png', // Fallback/demo placeholder sprite
  },
  {
    tokenId: '42',
    name: 'Chog #42',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  },
  {
    tokenId: '777',
    name: 'Chog #777',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
  },
];
