import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChogNFT } from '../types/comic';
import { monadTestnet } from '../config/monad';
import { isTestAccessActive } from '../utils/testAccess';
import { SUPPORTING_CAST } from '../utils/castData';
import { loadAllOwnedChogs } from '../utils/nftService';

export interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isEligible: boolean;
  isLoading: boolean;
  eligibilityError: string | null;
  ownedChogs: ChogNFT[];
  activeChog: ChogNFT | null;
  setActiveChog: (chog: ChogNFT) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  isTestAccess: boolean;
  supportingCast: ChogNFT[];
  pickCastAsHero: (chog: ChogNFT) => void;
  retryEligibilityCheck: () => Promise<void>;
}

// Chog Genesis collection starter tokens
export const DEMO_CHOGS: ChogNFT[] = [
  {
    tokenId: '1462',
    name: 'Chog #1462',
    imageUrl: '/chogs/1.webp',
    attributes: [
      { trait_type: 'Head', value: 'Purple Cap' },
      { trait_type: 'Eyes', value: 'Bitcoin Glasses' },
      { trait_type: 'Body', value: 'Hoodie' },
      { trait_type: 'Mouth', value: 'Confident' },
      { trait_type: 'Tier', value: 'Common' },
      { trait_type: 'Side', value: 'Left' },
    ],
  },
  {
    tokenId: '2891',
    name: 'Chog #2891',
    imageUrl: '/chogs/2.webp',
    attributes: [
      { trait_type: 'Head', value: 'Crown' },
      { trait_type: 'Eyes', value: 'Laser Eyes' },
      { trait_type: 'Body', value: 'Tuxedo' },
      { trait_type: 'Mouth', value: 'Focused' },
      { trait_type: 'Tier', value: 'Rare' },
      { trait_type: 'Side', value: 'Right' },
    ],
  },
  {
    tokenId: '0314',
    name: 'Chog #0314',
    imageUrl: '/chogs/3.webp',
    attributes: [
      { trait_type: 'Head', value: 'Red Hat' },
      { trait_type: 'Eyes', value: 'Sunglasses' },
      { trait_type: 'Body', value: 'Tracksuit' },
      { trait_type: 'Mouth', value: 'Chill' },
      { trait_type: 'Tier', value: 'Uncommon' },
      { trait_type: 'Side', value: 'Right' },
    ],
  },
  {
    tokenId: '3482',
    name: 'Chog #3482',
    imageUrl: '/chogs/4.webp',
    attributes: [
      { trait_type: 'Head', value: 'Blue Hat' },
      { trait_type: 'Eyes', value: 'Tears' },
      { trait_type: 'Body', value: 'Cape' },
      { trait_type: 'Mouth', value: 'Crying' },
      { trait_type: 'Tier', value: 'Common' },
      { trait_type: 'Side', value: 'Left' },
    ],
  },
  {
    tokenId: '4099',
    name: 'Chog #4099',
    imageUrl: '/chogs/5.webp',
    attributes: [
      { trait_type: 'Head', value: 'Star Cap' },
      { trait_type: 'Eyes', value: 'Monocle' },
      { trait_type: 'Body', value: 'Armor' },
      { trait_type: 'Mouth', value: 'Stoic' },
      { trait_type: 'Tier', value: 'Legendary' },
      { trait_type: 'Side', value: 'Right' },
    ],
  },
];

/**
 * Queries on-chain balanceOf(address) for contract 0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763 on Monad.
 */
async function queryOnChainChogBalance(walletAddress: string): Promise<number> {
  const cleanAddress = walletAddress.toLowerCase().replace(/^0x/, '');
  const data = '0x70a08231' + cleanAddress.padStart(64, '0');

  const rpcEndpoints = ['https://rpc.monad.xyz', 'https://testnet-rpc.monad.xyz'];
  let lastError: any = null;

  for (const rpc of rpcEndpoints) {
    try {
      const response = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [
            {
              to: '0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763',
              data: data,
            },
            'latest',
          ],
        }),
      });

      if (!response.ok) continue;
      const resJson = await response.json();
      if (resJson.error) {
        lastError = resJson.error;
        continue;
      }
      if (resJson.result) {
        return parseInt(resJson.result, 16);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Could not reach Monad RPC');
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  // Initialize active/owned chogs
  const getSavedTestHero = (): ChogNFT | null => {
    try {
      const savedId = localStorage.getItem('chog_test_hero_id');
      if (savedId) {
        const found = SUPPORTING_CAST.find((c) => c.tokenId === savedId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return null;
  };

  const [ownedChogs, setOwnedChogs] = useState<ChogNFT[]>(() => {
    const saved = getSavedTestHero();
    return saved ? [saved, ...DEMO_CHOGS] : DEMO_CHOGS;
  });

  const [activeChog, setActiveChog] = useState<ChogNFT | null>(() => {
    return getSavedTestHero() || DEMO_CHOGS[0];
  });

  const [isDemoMode, setIsDemoMode] = useState(true);

  // Compute test access state with hard safeguard
  const isTestAccess = Boolean(address && isTestAccessActive(address));

  // Verify eligibility against Monad RPC or local test access
  const verifyWalletEligibility = useCallback(async (userAddr: string) => {
    // 1. Check local test access (strictly development mode only)
    if (isTestAccessActive(userAddr)) {
      setIsEligible(true);
      setEligibilityError(null);
      // Ensure the user has cast access as hero
      const saved = getSavedTestHero();
      const hero = saved || SUPPORTING_CAST[0] || DEMO_CHOGS[0];
      setOwnedChogs([hero, ...SUPPORTING_CAST.slice(0, 10)]);
      setActiveChog(hero);
      return;
    }

    // 2. Real on-chain check for production or non-test dev wallets
    setIsLoading(true);
    setEligibilityError(null);

    try {
      const balance = await queryOnChainChogBalance(userAddr);
      if (balance > 0) {
        setIsEligible(true);
        try {
          const realChogs = await loadAllOwnedChogs(userAddr, balance);
          if (realChogs.length > 0) {
            setOwnedChogs(realChogs);
            setActiveChog(realChogs[0]);
          }
        } catch (loadErr) {
          console.warn('Error fetching holder Chogs:', loadErr);
        }
      } else {
        // Clear "you need a Chog" state (as per BACKEND_HANDOFF.md Section 5)
        setIsEligible(false);
      }
    } catch (err: any) {
      console.warn('Monad RPC verification error:', err);
      // Per BACKEND_HANDOFF.md Rule 52:
      // "A network or RPC error must never be shown as 'you own no Chogs'. Show an error and a retry button."
      setEligibilityError('Unable to connect to Monad network. Please retry.');
      // Keep previous eligibility or allow retry
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to Web3 account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          const newAddr = accounts[0];
          setAddress(newAddr);
          setIsConnected(true);
          verifyWalletEligibility(newAddr);
        } else {
          setIsConnected(false);
          setAddress(null);
          setIsEligible(true);
          setEligibilityError(null);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      ethereum.on?.('accountsChanged', handleAccountsChanged);
      ethereum.on?.('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        ethereum.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, [verifyWalletEligibility]);

  const connectWallet = async () => {
    setIsLoading(true);
    setEligibilityError(null);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;

        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts && accounts[0]) {
          const userAddr = accounts[0];
          setAddress(userAddr);
          setIsConnected(true);
          await verifyWalletEligibility(userAddr);

          // Prompt switch to Monad Testnet if on wrong network
          try {
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            const monadHexId = `0x${monadTestnet.id.toString(16)}`;
            if (chainId !== monadHexId) {
              await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: monadHexId }],
              }).catch(async (switchError: any) => {
                if (switchError.code === 4902) {
                  await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: monadHexId,
                        chainName: monadTestnet.name,
                        nativeCurrency: monadTestnet.nativeCurrency,
                        rpcUrls: monadTestnet.rpcUrls.default.http,
                        blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
                      },
                    ],
                  });
                }
              });
            }
          } catch {
            // Non-blocking
          }
        }
      } else {
        // Fallback simulation when no Web3 provider is present in browser
        const simulatedAddress = '0xChog...7777';
        setAddress(simulatedAddress);
        setIsConnected(true);
        verifyWalletEligibility(simulatedAddress);
      }
    } catch (err: any) {
      console.warn('Wallet connection note:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setEligibilityError(null);
    setIsEligible(true);
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  /**
   * Pick any supporting-cast Chog as the hero (for local test access).
   * Sets the active hero and prepends it to ownedChogs.
   */
  const pickCastAsHero = (chog: ChogNFT) => {
    setActiveChog(chog);
    try {
      localStorage.setItem('chog_test_hero_id', chog.tokenId);
    } catch {
      // ignore
    }
    setOwnedChogs((prev) => {
      const rest = prev.filter((c) => c.tokenId !== chog.tokenId);
      return [chog, ...rest];
    });
  };

  const retryEligibilityCheck = async () => {
    if (address) {
      await verifyWalletEligibility(address);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        isEligible,
        isLoading,
        eligibilityError,
        ownedChogs,
        activeChog,
        setActiveChog,
        connectWallet,
        disconnectWallet,
        isDemoMode,
        toggleDemoMode,
        isTestAccess,
        supportingCast: SUPPORTING_CAST,
        pickCastAsHero,
        retryEligibilityCheck,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
