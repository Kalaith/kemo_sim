import { useState, useEffect } from "react";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import CollectionPage from "./pages/CollectionPage";
import BreedingPage from "./pages/BreedingPage";
import TrainingPage from "./pages/TrainingPage";
import MarketplacePage from "./pages/MarketplacePage";
import FamilyTreePage from "./pages/FamilyTreePage";
import StatisticsPage from "./pages/StatisticsPage";
import AchievementToast from "./components/AchievementToast";
import { useGameStore } from "./hooks/useGameStore";

const TABS = [
  { key: "collection", label: "Collection" },
  { key: "breeding", label: "Breeding" },
  { key: "training", label: "Training" },
  { key: "marketplace", label: "Marketplace" },
  { key: "family-tree", label: "Family Tree" },
  { key: "statistics", label: "Statistics" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("collection");
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-4 border-solid mx-auto mb-4"
            style={{
              borderColor: "var(--kemo-primary-light)",
              borderTopColor: "var(--kemo-primary)",
            }}
          ></div>
          <div
            className="text-xl font-semibold"
            style={{ color: "var(--kemo-text-secondary)" }}
          >
            Loading game data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-6xl p-6">
        <Header />
        <TabNavigation
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <main>
          {activeTab === "collection" && <CollectionPage />}
          {activeTab === "breeding" && <BreedingPage />}
          {activeTab === "training" && <TrainingPage />}
          {activeTab === "marketplace" && <MarketplacePage />}
          {activeTab === "family-tree" && <FamilyTreePage />}
          {activeTab === "statistics" && <StatisticsPage />}
        </main>
      </div>
      <AchievementToast />
    </div>
  );
}
