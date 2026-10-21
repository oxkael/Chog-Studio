import { useState } from 'react';
import { WalletProvider } from './context/WalletContext';
import { LandingHero } from './components/LandingHero';
import { StudioView } from './components/StudioView';

export function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'studio'>('landing');

  return (
    <WalletProvider>
      <div className="min-h-screen">
        <main className="min-h-screen">
          {currentTab === 'landing' ? (
            <LandingHero onEnterStudio={() => setCurrentTab('studio')} />
          ) : (
            <StudioView onBackToLanding={() => setCurrentTab('landing')} />
          )}
        </main>
      </div>
    </WalletProvider>
  );
}

export default App;
