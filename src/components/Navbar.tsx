import { useWallet } from '../context/WalletContext';
import { Sparkles, Wallet, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentTab: 'landing' | 'studio' | 'gallery';
  setCurrentTab: (tab: 'landing' | 'studio' | 'gallery') => void;
}

export const Navbar = ({ currentTab, setCurrentTab }: NavbarProps) => {
  const { isConnected, address, connectWallet, disconnectWallet, isEligible, isDemoMode } = useWallet();

  return (
    <header className="sticky top-0 z-50 bg-canvas/95 backdrop-blur-md border-b-2 border-ink/15 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 btn-periwinkle rounded-xl comic-border flex items-center justify-center font-comic text-2xl text-white group-hover:-rotate-6 transition-transform shadow-comic-sm">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-comic text-2xl tracking-wide text-ink flex items-center gap-1.5 leading-none">
              CHOG STUDIO
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-ink-muted">
              Monad Comic Creator
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 font-bold text-sm">
          <button
            onClick={() => setCurrentTab('landing')}
            className={`px-4 py-2 rounded-xl transition-all ${
              currentTab === 'landing'
                ? 'bg-ink text-white shadow-comic-sm'
                : 'text-ink-muted hover:text-ink hover:bg-canvas-subtle'
            }`}
          >
            Story
          </button>
          <button
            onClick={() => setCurrentTab('studio')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentTab === 'studio'
                ? 'btn-periwinkle comic-border shadow-comic-sm'
                : 'text-ink-muted hover:text-ink hover:bg-canvas-subtle'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Studio Editor</span>
          </button>
        </nav>

        {/* Wallet & Status Controls */}
        <div className="flex items-center gap-3">
          {isDemoMode && (
            <span className="hidden sm:inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg bg-canvas-subtle text-ink-muted border border-ink/15">
              Demo Mode
            </span>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white border-2 border-ink/20 px-3 py-1.5 rounded-xl text-xs font-bold shadow-comic-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-mono text-ink">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                </span>
                {isEligible && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                    Eligible
                  </span>
                )}
              </div>
              <button
                onClick={disconnectWallet}
                title="Disconnect"
                className="p-2 rounded-xl bg-canvas-subtle hover:bg-canvas-dark border border-ink/20 transition-colors text-ink"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center gap-2 btn-periwinkle font-bold px-4 py-2 rounded-xl comic-border shadow-comic comic-shadow-hover transition-all text-sm active:translate-x-0.5 active:translate-y-0.5"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
