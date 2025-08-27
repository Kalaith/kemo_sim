import { useState, useEffect } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import CollectionPage from './pages/CollectionPage';
import BreedingPage from './pages/BreedingPage';
import TrainingPage from './pages/TrainingPage';
import MarketplacePage from './pages/MarketplacePage';
import FamilyTreePage from './pages/FamilyTreePage';
import { useGameStore } from './hooks/useGameStore';

const TABS = [
  { key: 'collection', label: 'Collection' },
  { key: 'breeding', label: 'Breeding' },
  { key: 'training', label: 'Training' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'family-tree', label: 'Family Tree' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('collection');
  const initGameData = useGameStore((s) => s.initGameData);
  const kemonomimi = useGameStore((s) => s.kemonomimi);
  const marketStock = useGameStore((s) => s.marketStock);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await initGameData();
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  if (loading || kemonomimi.length === 0 || marketStock.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">
        Loading game data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto max-w-5xl p-4">
        <Header />
        <TabNavigation tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="mt-6">
          {activeTab === 'collection' && <CollectionPage />}
          {activeTab === 'breeding' && <BreedingPage />}
          {activeTab === 'training' && <TrainingPage />}
          {activeTab === 'marketplace' && <MarketplacePage />}
          {activeTab === 'family-tree' && <FamilyTreePage />}
        </main>
      </div>
    </div>
  );
}
