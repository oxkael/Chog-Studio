/**
 * Chog NFT Ingestion & Monad Multicall Discovery Service
 *
 * Implements Section 7 (Build order: Steps 1 & 2) from BACKEND_HANDOFF.md:
 * - Ownership lookup via Multicall3 on Monad (contract: 0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763)
 * - Resolves tokenURI and IPFS metadata via Pinata gateway (https://gateway.pinata.cloud/ipfs/)
 * - Leverages pre-bundled cast (IDs 1-252) for 0ms instant loading
 * - Persistent browser caching via localStorage
 */

import { createPublicClient, http, defineChain, parseAbi } from 'viem';
import { ChogNFT } from '../types/comic';
import { getCastMemberById } from './castData';

export const CHOG_CONTRACT_ADDRESS = '0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763' as const;
export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;
export const TOTAL_SUPPLY = 1969;

export const monadChain = defineChain({
  id: 10143,
  name: 'Monad',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
    public: { http: ['https://rpc.monad.xyz'] },
  },
  contracts: {
    multicall3: {
      address: MULTICALL3_ADDRESS,
      blockCreated: 0,
    },
  },
});

export const publicClient = createPublicClient({
  chain: monadChain,
  transport: http('https://rpc.monad.xyz'),
});

const chogAbi = parseAbi([
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
]);

/**
 * Resolves an ipfs:// URI using the verified Pinata gateway
 */
export function resolvePinataIpfsUrl(uri: string): string {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    const path = uri.replace(/^ipfs:\/\//, '');
    return `https://gateway.pinata.cloud/ipfs/${path}`;
  }
  return uri;
}

/**
 * Discovers which token IDs a wallet owns out of the 1,969 collection.
 * Uses Multicall3 in batches of 500, with early-exit when all tokens for the balance are found.
 */
export async function findOwnedTokenIds(
  walletAddress: string,
  expectedBalance?: number
): Promise<number[]> {
  const cleanAddress = walletAddress.toLowerCase();
  const cacheKey = `chog_owned_${cleanAddress}`;

  // Check 5-minute memory cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const isFresh = Date.now() - (parsed.timestamp || 0) < 5 * 60 * 1000;
      if (isFresh && Array.isArray(parsed.tokenIds)) {
        if (expectedBalance === undefined || parsed.tokenIds.length === expectedBalance) {
          return parsed.tokenIds;
        }
      }
    }
  } catch {
    // ignore
  }

  // If known balance is 0, no scan needed
  if (expectedBalance === 0) {
    return [];
  }

  const tokenIds = Array.from({ length: TOTAL_SUPPLY }, (_, i) => i + 1);
  const owned: number[] = [];
  const BATCH_SIZE = 500;

  for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
    const chunk = tokenIds.slice(i, i + BATCH_SIZE);
    const calls = chunk.map((id) => ({
      address: CHOG_CONTRACT_ADDRESS,
      abi: chogAbi,
      functionName: 'ownerOf',
      args: [BigInt(id)],
    }));

    try {
      const results = await publicClient.multicall({
        contracts: calls,
        allowFailure: true,
      });

      for (let j = 0; j < results.length; j++) {
        const res = results[j] as { status: 'success'; result: string } | { status: 'failure'; error: Error };
        if (res.status === 'success' && res.result) {
          if (String(res.result).toLowerCase() === cleanAddress) {
            owned.push(chunk[j]);
            // Early exit optimization if we reached the known balance
            if (expectedBalance !== undefined && owned.length >= expectedBalance) {
              break;
            }
          }
        }
      }

      if (expectedBalance !== undefined && owned.length >= expectedBalance) {
        break;
      }
    } catch (batchErr) {
      console.warn(`Multicall batch error for tokens ${chunk[0]}..${chunk[chunk.length - 1]}:`, batchErr);
    }
  }

  // Cache results
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        tokenIds: owned,
        balance: expectedBalance ?? owned.length,
        timestamp: Date.now(),
      })
    );
  } catch {
    // ignore
  }

  return owned;
}

/**
 * Loads a single Chog's metadata & image.
 * Uses pre-loaded cast if ID <= 252, or queries tokenURI + Pinata with caching for IDs > 252.
 */
export async function fetchChogTokenData(tokenId: number): Promise<ChogNFT> {
  const strId = String(tokenId);

  // 1. Check local pre-loaded cast (tokens 1 to 252)
  const castMember = getCastMemberById(tokenId);
  if (castMember) {
    return castMember;
  }

  // 2. Check localStorage cache
  const cacheKey = `chog_meta_${tokenId}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.name && parsed.imageUrl) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // 3. Fetch tokenURI from Monad RPC
  let uri = '';
  try {
    uri = await publicClient.readContract({
      address: CHOG_CONTRACT_ADDRESS,
      abi: chogAbi,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });
  } catch (err) {
    console.warn(`Failed to read tokenURI for #${tokenId}:`, err);
  }

  if (!uri) {
    // Fallback if tokenURI fails
    return {
      tokenId: strId,
      name: `CHOG #${tokenId}`,
      imageUrl: `/cast/${(tokenId % 252) + 1}.webp`,
      attributes: [],
    };
  }

  // 4. Fetch JSON metadata via Pinata gateway
  const metadataUrl = resolvePinataIpfsUrl(uri);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(metadataUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const meta = await resp.json();
      const imageUrl = resolvePinataIpfsUrl(meta.image || '');
      const chog: ChogNFT = {
        tokenId: strId,
        name: meta.name || `CHOG #${tokenId}`,
        imageUrl: imageUrl || `/cast/${(tokenId % 252) + 1}.webp`,
        attributes: meta.attributes || [],
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify(chog));
      } catch {
        // ignore
      }

      return chog;
    }
  } catch (fetchErr) {
    console.warn(`Metadata fetch error from Pinata for #${tokenId}:`, fetchErr);
  }

  // Fallback if metadata fetch fails
  return {
    tokenId: strId,
    name: `CHOG #${tokenId}`,
    imageUrl: `/cast/${(tokenId % 252) + 1}.webp`,
    attributes: [],
  };
}

/**
 * Loads all Chogs owned by a wallet address.
 */
export async function loadAllOwnedChogs(
  walletAddress: string,
  expectedBalance?: number
): Promise<ChogNFT[]> {
  const tokenIds = await findOwnedTokenIds(walletAddress, expectedBalance);
  if (tokenIds.length === 0) {
    return [];
  }

  // Fetch tokens with safe concurrency
  const chogs: ChogNFT[] = [];
  for (const id of tokenIds) {
    try {
      const chog = await fetchChogTokenData(id);
      chogs.push(chog);
    } catch {
      // ignore
    }
  }

  return chogs;
}
