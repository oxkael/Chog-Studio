import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChogNFT } from '../types/comic';

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

// Chog Genesis collection tokens for demo & preview (matches design reference)
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
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ownedChogs, setOwnedChogs] = useState<ChogNFT[]>([]);
  const [activeChog, setActiveChog] = useState<ChogNFT | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to demo so visitors can immediately test the studio!

  useEffect(() => {
    if (isDemoMode) {
      setOwnedChogs(DEMO_CHOGS);
      setActiveChog(DEMO_CHOGS[0]);
      setIsEligible(true);
    }
  }, [isDemoMode]);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts && accounts[0]) {
          const userAddr = accounts[0];
          setAddress(userAddr);
          setIsConnected(true);
          // In real production, query contract on Monad network:
          // For now, simulate verification:
          setIsEligible(true);
          setOwnedChogs(DEMO_CHOGS);
          setActiveChog(DEMO_CHOGS[0]);
        }
      } else {
        // Fallback for browsers without Web3 wallet injected
        const simulatedAddress = '0xChog...7777';
        setAddress(simulatedAddress);
        setIsConnected(true);
        setIsEligible(true);
        setOwnedChogs(DEMO_CHOGS);
        setActiveChog(DEMO_CHOGS[0]);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    if (!isDemoMode) {
      setIsEligible(false);
      setOwnedChogs([]);
      setActiveChog(null);
    }
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
