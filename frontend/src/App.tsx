import { useState, useEffect } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import CollectionPage from './pages/CollectionPage';
import BreedingPage from './pages/BreedingPage';
import TrainingPage from './pages/TrainingPage';
import MarketplacePage from './pages/MarketplacePage';
import FamilyTreePage from './pages/FamilyTreePage';
import StatisticsPage from './pages/StatisticsPage';
import AchievementToast from './components/AchievementToast';
import { useGameStore } from './hooks/useGameStore';

const TABS = [
  { key: 'collection', label: 'Collection' },
  { key: 'breeding', label: 'Breeding' },
  { key: 'training', label: 'Training' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'family-tree', label: 'Family Tree' },
  { key: 'statistics', label: 'Statistics' },
];

const ONBOARDING_SESSION_KEY = 'kemo-sim:onboarding-seen';

export default function App() {
  const [activeTab, setActiveTab] = useState('collection');
  const initGameData = useGameStore(s => s.initGameData);
  const resetGameData = useGameStore(s => s.resetGameData);
  const loadError = useGameStore(s => s.loadError);
  const kemonomimi = useGameStore(s => s.kemonomimi);
  const marketStock = useGameStore(s => s.marketStock);
  const [loading, setLoading] = useState(true);
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await initGameData();
      } finally {
        setLoading(false);
      }
    })();
  }, [initGameData]);

  useEffect(() => {
    if (!loading) {
      if (typeof window !== 'undefined') {
        setOnboardingVisible(window.sessionStorage.getItem(ONBOARDING_SESSION_KEY) !== '1');
      } else {
        setOnboardingVisible(false);
      }
    }
  }, [loading]);

  const dismissOnboarding = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(ONBOARDING_SESSION_KEY, '1');
    }
    setOnboardingVisible(false);
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h1>
          <p className="text-gray-700 mb-4">{loadError}</p>
          <button
            className="btn btn--secondary bg-secondary text-white px-4 py-2 rounded"
            onClick={async () => {
              await initGameData();
            }}
          >
            Retry
          </button>
          <button
            className="btn btn--secondary bg-gray-700 text-white px-4 py-2 rounded"
            onClick={async () => {
              await resetGameData();
            }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-4 border-solid mx-auto mb-4"
            style={{
              borderColor: 'var(--kemo-primary-light)',
              borderTopColor: 'var(--kemo-primary)',
            }}
          ></div>
          <div className="text-xl font-semibold" style={{ color: 'var(--kemo-text-secondary)' }}>
            Loading game data...
          </div>
        </div>
      </div>
    );
  }

  if (kemonomimi.length === 0 || marketStock.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow">
          <h1 className="text-2xl font-bold mb-4">Game data is not available</h1>
          <p className="text-gray-700 mb-4">
            Unable to load a valid starting dataset. You can retry loading or reset to defaults.
          </p>
          <button
            className="btn btn--secondary bg-secondary text-white px-4 py-2 rounded"
            onClick={async () => {
              await initGameData();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-6xl p-6">
        <Header />
        <TabNavigation tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <main>
          {activeTab === 'collection' && <CollectionPage />}
          {activeTab === 'breeding' && <BreedingPage />}
          {activeTab === 'training' && <TrainingPage />}
          {activeTab === 'marketplace' && <MarketplacePage />}
          {activeTab === 'family-tree' && <FamilyTreePage />}
          {activeTab === 'statistics' && <StatisticsPage />}
        </main>
      </div>
      {onboardingVisible && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg relative">
            <button
              type="button"
              aria-label="Close welcome message"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={dismissOnboarding}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-2">Welcome to Kemo Sim</h3>
            <p className="text-sm text-gray-700 mb-4">
              Start by purchasing or breeding kemonomimi, send one to train, and use Advance Day to apply
              queue progress and age your collection.
            </p>
            <ul className="text-sm list-disc pl-5 mb-6 space-y-1">
              <li>Training gives stat progress and coin rewards.</li>
              <li>Breeding can create offspring with inherited traits.</li>
              <li>Use marketplace to expand your collection.</li>
            </ul>
            <button
              className="btn btn--secondary bg-secondary text-white px-4 py-2 rounded"
              onClick={dismissOnboarding}
            >
              Got it
            </button>
          </div>
        </div>
      )}
      <AchievementToast />
    </div>
  );
}
