import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChogNFT } from '../types/comic';
import { monadTestnet } from '../config/monad';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isEligible: boolean;
  isLoading: boolean;
  ownedChogs: ChogNFT[];
  activeChog: ChogNFT | null;
  setActiveChog: (chog: ChogNFT) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
}

// Chog Genesis collection tokens (matches design reference originals)
export const DEMO_CHOGS: ChogNFT[] = [
  {
    tokenId: '1462',
    name: 'Chog #1462',
    imageUrl: '/chogs/1.webp',
    attributes: [
      { trait_type: 'Hat', trait_type_val: 'Purple Cap' } as any,
      { trait_type: 'Glasses', trait_type_val: 'Bitcoin Glasses' } as any,
      { trait_type: 'Outfit', trait_type_val: 'Hoodie' } as any,
      { trait_type: 'Expression', trait_type_val: 'Confident' } as any,
      { trait_type: 'Tier', trait_type_val: 'Common' } as any,
    ],
  },
  {
    tokenId: '2891',
    name: 'Chog #2891',
    imageUrl: '/chogs/2.webp',
    attributes: [
      { trait_type: 'Hat', trait_type_val: 'Crown' } as any,
      { trait_type: 'Glasses', trait_type_val: 'Laser Eyes' } as any,
      { trait_type: 'Outfit', trait_type_val: 'Tuxedo' } as any,
      { trait_type: 'Expression', trait_type_val: 'Focused' } as any,
      { trait_type: 'Tier', trait_type_val: 'Rare' } as any,
    ],
  },
  {
    tokenId: '0314',
    name: 'Chog #0314',
    imageUrl: '/chogs/3.webp',
    attributes: [
      { trait_type: 'Hat', trait_type_val: 'Red Hat' } as any,
      { trait_type: 'Glasses', trait_type_val: 'Sunglasses' } as any,
      { trait_type: 'Outfit', trait_type_val: 'Tracksuit' } as any,
      { trait_type: 'Expression', trait_type_val: 'Chill' } as any,
      { trait_type: 'Tier', trait_type_val: 'Uncommon' } as any,
    ],
  },
  {
    tokenId: '3482',
    name: 'Chog #3482',
    imageUrl: '/chogs/4.webp',
    attributes: [
      { trait_type: 'Hat', trait_type_val: 'Blue Hat' } as any,
      { trait_type: 'Glasses', trait_type_val: 'Tears' } as any,
      { trait_type: 'Outfit', trait_type_val: 'Cape' } as any,
      { trait_type: 'Expression', trait_type_val: 'Crying' } as any,
      { trait_type: 'Tier', trait_type_val: 'Common' } as any,
    ],
  },
  {
    tokenId: '4099',
    name: 'Chog #4099',
    imageUrl: '/chogs/5.webp',
    attributes: [
      { trait_type: 'Hat', trait_type_val: 'Star Cap' } as any,
      { trait_type: 'Glasses', trait_type_val: 'Monocle' } as any,
      { trait_type: 'Outfit', trait_type_val: 'Armor' } as any,
      { trait_type: 'Expression', trait_type_val: 'Stoic' } as any,
      { trait_type: 'Tier', trait_type_val: 'Legendary' } as any,
    ],
  },
];

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [ownedChogs, setOwnedChogs] = useState<ChogNFT[]>(DEMO_CHOGS);
  const [activeChog, setActiveChog] = useState<ChogNFT | null>(DEMO_CHOGS[0]);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Check if wallet was previously connected or listen to accountsChanged
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          setIsEligible(true);
        } else {
          setIsConnected(false);
          setAddress(null);
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
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;

        // Request account access from user's Web3 wallet (MetaMask, Rabby, etc.)
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts && accounts[0]) {
          const userAddr = accounts[0];
          setAddress(userAddr);
          setIsConnected(true);
          setIsEligible(true);
          setOwnedChogs(DEMO_CHOGS);
          setActiveChog(DEMO_CHOGS[0]);

          // Optional Monad network check
          try {
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            const monadHexId = `0x${monadTestnet.id.toString(16)}`;
            if (chainId !== monadHexId) {
              await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: monadHexId }],
              }).catch(async (switchError: any) => {
                // If chain is not added, prompt to add Monad Testnet
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
          } catch (netErr) {
            // Non-blocking: continue even if network switch is dismissed
          }
        }
      } else {
        // Fallback simulation for browsers without Web3 wallet extensions
        const simulatedAddress = '0xChog...7777';
        setAddress(simulatedAddress);
        setIsConnected(true);
        setIsEligible(true);
        setOwnedChogs(DEMO_CHOGS);
        setActiveChog(DEMO_CHOGS[0]);
      }
    } catch (err: any) {
      console.warn('Wallet connection note:', err?.message || err);
      // If user rejected the prompt, keep fallback available
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        isEligible,
        isLoading,
        ownedChogs,
        activeChog,
        setActiveChog,
        connectWallet,
        disconnectWallet,
        isDemoMode,
        toggleDemoMode,
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
