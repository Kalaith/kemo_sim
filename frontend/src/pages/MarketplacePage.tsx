import { useState } from "react";
import { useGameStore } from "../hooks/useGameStore";
import type { MarketKemonomimi, Kemonomimi } from "../types/game";

const marketTypes = [
  "",
  "Nekomimi",
  "Inumimi",
  "Kitsunemimi",
  "Usagimimi",
  "Ookami",
  "Nezumimi",
];

export default function MarketplacePage() {
  const marketStock = useGameStore((s) => s.marketStock);
  const setMarketStock = useGameStore((s) => s.setMarketStock);
  const kemonomimi = useGameStore((s) => s.kemonomimi);
  const addKemonomimi = useGameStore((s) => s.addKemonomimi);
  const setKemonomimi = useGameStore((s) => s.setKemonomimi);
  const coins = useGameStore((s) => s.coins);
  const setCoins = useGameStore((s) => s.setCoins);

  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [typeFilter, setTypeFilter] = useState("");
  const [message, setMessage] = useState("");

  // Filtered market and collection
  const filteredMarket = marketStock.filter(
    (k) => !typeFilter || k.type.name === typeFilter,
  );
  const filteredCollection = kemonomimi.filter(
    (k) =>
      k.status === "available" && (!typeFilter || k.type.name === typeFilter),
  );

  // Handler for buying
  const handleBuy = (kemono: MarketKemonomimi) => {
    if (coins < kemono.price) {
      setMessage("Not enough coins!");
      return;
    }
    setCoins(coins - kemono.price);
    addKemonomimi({ ...kemono });
    setMarketStock(marketStock.filter((k) => k.id !== kemono.id));
    setMessage("Purchased successfully!");
  };

  // Handler for selling
  const handleSell = (kemono: Kemonomimi) => {
    const sellPrice = kemono.price || 100;
    setCoins(coins + sellPrice);
    setKemonomimi(kemonomimi.filter((k) => k.id !== kemono.id));
    setMessage("Sold successfully!");
  };

  // Handler for refreshing market
  const handleRefreshMarket = () => {
    // For demo, just clear and show a message
    setMarketStock([]);
    setMessage("Market refreshed! (Demo: market is now empty)");
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary">
        Marketplace
      </h2>
      <div className="marketplace-section space-y-4">
        <div className="market-actions flex gap-4 items-center">
          <button
            className="btn btn--secondary bg-gray-200 px-3 py-1 rounded"
            onClick={handleRefreshMarket}
          >
            Refresh Market
          </button>
          <div className="market-filter">
            <select
              className="form-control border rounded px-2 py-1"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {marketTypes.map((type) => (
                <option key={type} value={type}>
                  {type
                    ? `${type} (${type === "Nekomimi" ? "Cat" : type === "Inumimi" ? "Dog" : type === "Kitsunemimi" ? "Fox" : type === "Usagimimi" ? "Rabbit" : type === "Ookami" ? "Wolf" : type === "Nezumimi" ? "Mouse" : ""})`
                    : "All Types"}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="market-tabs flex gap-2">
          <button
            className={`btn btn--outline border px-3 py-1 rounded ${activeTab === "buy" ? "bg-white text-blue-600" : "bg-gray-100 text-gray-600"}`}
            onClick={() => setActiveTab("buy")}
          >
            Buy
          </button>
          <button
            className={`btn btn--outline border px-3 py-1 rounded ${activeTab === "sell" ? "bg-white text-blue-600" : "bg-gray-100 text-gray-600"}`}
            onClick={() => setActiveTab("sell")}
          >
            Sell
          </button>
        </div>
        {message && (
          <div className="text-green-600 font-semibold">{message}</div>
        )}
        {activeTab === "buy" ? (
          <div className="market-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredMarket.length === 0 ? (
              <div className="text-gray-400 col-span-full">
                No market items available.
              </div>
            ) : (
              filteredMarket.map((k) => (
                <div
                  key={k.id}
                  className="market-card bg-white rounded shadow p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{k.type.emoji}</span>
                    <span className="font-semibold">{k.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {k.type.name}
                    </span>
                  </div>
                  <div className="market-price text-blue-700 font-bold">
                    Price: {k.price} coins
                  </div>
                  <button
                    className="btn btn--primary bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => handleBuy(k)}
                  >
                    Buy
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="market-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCollection.length === 0 ? (
              <div className="text-gray-400 col-span-full">
                No kemonomimi available for sale.
              </div>
            ) : (
              filteredCollection.map((k) => (
                <div
                  key={k.id}
                  className="market-card bg-white rounded shadow p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{k.type.emoji}</span>
                    <span className="font-semibold">{k.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {k.type.name}
                    </span>
                  </div>
                  <div className="market-price text-green-700 font-bold">
                    Sell Price: {k.price || 100} coins
                  </div>
                  <button
                    className="btn btn--primary bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => handleSell(k)}
                  >
                    Sell
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
