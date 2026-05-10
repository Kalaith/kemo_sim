import { useMemo, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { KemonoAvatar } from '../components/KemonoAvatar';
import type { Kemonomimi, MarketKemonomimi } from '../types/game';

const marketTypes = ['all', 'Nekomimi', 'Inumimi', 'Kitsunemimi', 'Usagimimi', 'Ookami', 'Nezumimi'];
const SORT_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'price', label: 'Price' },
  { key: 'stats', label: 'Total Stats' },
];

export default function MarketplacePage() {
  const marketStock = useGameStore(s => s.marketStock);
  const kemonomimi = useGameStore(s => s.kemonomimi);
  const coins = useGameStore(s => s.coins);
  const buyMarketKemonomimi = useGameStore(s => s.buyMarketKemonomimi);
  const sellKemonomimi = useGameStore(s => s.sellKemonomimi);

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [traitFilter, setTraitFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [message, setMessage] = useState('');
  const [pendingId, setPendingId] = useState<number | null>(null);

  const typeOptions = marketTypes;
  const traitOptions = useMemo(() => {
    const traits = new Set<string>();
    const sources = activeTab === 'buy' ? marketStock : kemonomimi;
    sources.forEach(item => item.type.traits.forEach(trait => traits.add(trait)));
    return ['all', ...Array.from(traits)];
  }, [activeTab, kemonomimi, marketStock]);

  const totalStats = (kemono: Kemonomimi) =>
    Object.values(kemono.stats).reduce((sum, value) => sum + value, 0);

  const filteredBuyMarket = useMemo(() => {
    let list: MarketKemonomimi[] = [...marketStock];
    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter(item => item.name.toLowerCase().includes(query));
    }
    if (typeFilter !== 'all') {
      list = list.filter(item => item.type.name === typeFilter);
    }
    if (traitFilter !== 'all') {
      list = list.filter(item => item.type.traits.includes(traitFilter));
    }

    return list.sort((left, right) => {
      switch (sortBy) {
        case 'age':
          return left.age - right.age;
        case 'price':
          return left.price - right.price;
        case 'stats':
          return totalStats(left) - totalStats(right);
        default:
          return left.name.localeCompare(right.name);
      }
    });
  }, [marketStock, search, typeFilter, traitFilter, sortBy]);

  const filteredCollection = useMemo(() => {
    let list = [...kemonomimi];
    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter(item => item.name.toLowerCase().includes(query));
    }
    if (typeFilter !== 'all') {
      list = list.filter(item => item.type.name === typeFilter);
    }
    if (traitFilter !== 'all') {
      list = list.filter(item => item.type.traits.includes(traitFilter));
    }

    return list
      .filter(item => item.status === 'available')
      .sort((left, right) => {
        switch (sortBy) {
          case 'age':
            return left.age - right.age;
          case 'price':
            return (left.price ?? 0) - (right.price ?? 0);
          case 'stats':
            return totalStats(left) - totalStats(right);
          default:
            return left.name.localeCompare(right.name);
        }
      });
  }, [kemonomimi, search, typeFilter, traitFilter, sortBy]);

  const clearMessage = () => {
    setMessage('');
  };

  const handleBuy = async (kemono: MarketKemonomimi) => {
    if (coins < kemono.price) {
      setMessage('Not enough coins to buy this kemonomimi.');
      return;
    }

    setPendingId(kemono.id);
    try {
      const result = await buyMarketKemonomimi(kemono.id);
      setMessage(result.message ?? (result.success ? 'Purchased successfully.' : 'Purchase failed.'));
    } finally {
      setPendingId(null);
    }
  };

  const handleSell = async (kemono: Kemonomimi) => {
    setPendingId(kemono.id);
    try {
      const result = await sellKemonomimi(kemono.id);
      setMessage(result.message ?? (result.success ? 'Sold successfully.' : 'Sale failed.'));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-primary">Marketplace</h2>

      <div className="marketplace-section space-y-4">
        <div className="bg-surface rounded-lg p-4 border border-primary/20 space-y-3">
          {message && <div className="text-sm rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">{message}</div>}
          <div className="market-actions flex gap-4 items-center flex-wrap">
            <button className="btn btn--secondary bg-gray-200 px-3 py-1 rounded" onClick={clearMessage}>
              Clear Message
            </button>
            <input
              className="border rounded px-3 py-2 flex-1 min-w-48"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search by name"
            />
            <select className="border rounded px-2 py-1" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}>
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
            <select className="border rounded px-2 py-1" value={traitFilter} onChange={event => setTraitFilter(event.target.value)}>
              {traitOptions.map(trait => (
                <option key={trait} value={trait}>
                  {trait === 'all' ? 'All Traits' : trait}
                </option>
              ))}
            </select>
            <select className="border rounded px-2 py-1" value={sortBy} onChange={event => setSortBy(event.target.value)}>
              {SORT_OPTIONS.map(option => (
                <option key={option.key} value={option.key}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="market-tabs flex gap-2">
            <button
              className={`btn btn--outline border px-3 py-1 rounded ${activeTab === 'buy' ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('buy')}
            >
              Buy
            </button>
            <button
              className={`btn btn--outline border px-3 py-1 rounded ${activeTab === 'sell' ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setActiveTab('sell')}
            >
              Sell
            </button>
          </div>
        </div>

        {activeTab === 'buy' ? (
          filteredBuyMarket.length === 0 ? (
            <div className="text-gray-500">No market items available for your filters.</div>
          ) : (
            <div className="market-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredBuyMarket.map(k => (
                <div
                  key={k.id}
                  className="market-card bg-white rounded shadow p-4 flex flex-col gap-2"
                >
                    <div className="flex items-center gap-2">
                     <KemonoAvatar
                      typeName={k.type.name}
                      index={k.id}
                      emoji={k.type.emoji}
                      alt={`${k.name} portrait`}
                      className="w-8 h-8 rounded-full border border-[var(--kemo-primary-light)] bg-[var(--kemo-primary-bg)] flex-shrink-0"
                      imageClassName="object-cover"
                    />
                     <span className="font-semibold">{k.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{k.type.name}</span>
                    </div>
                  <div className="market-price text-blue-700 font-bold">Price: {k.price} coins</div>
                  <button
                    className="btn btn--primary bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      void handleBuy(k);
                    }}
                    disabled={pendingId === k.id}
                  >
                    {pendingId === k.id ? 'Buying...' : 'Buy'}
                  </button>
                </div>
              ))}
            </div>
          )
        ) : filteredCollection.length === 0 ? (
          <div className="text-gray-500">No kemonomimi available for sale with those filters.</div>
        ) : (
          <div className="market-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredCollection.map(k => (
                <div key={k.id} className="market-card bg-white rounded shadow p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <KemonoAvatar
                      typeName={k.type.name}
                      index={k.id}
                      emoji={k.type.emoji}
                      alt={`${k.name} portrait`}
                      className="w-8 h-8 rounded-full border border-[var(--kemo-primary-light)] bg-[var(--kemo-primary-bg)] flex-shrink-0"
                      imageClassName="object-cover"
                    />
                    <span className="font-semibold">{k.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{k.type.name}</span>
                  </div>
                <div className="market-price text-green-700 font-bold">Sell Price: {k.price || 100} coins</div>
                <button
                  className="btn btn--primary bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => {
                    void handleSell(k);
                  }}
                  disabled={pendingId === k.id}
                >
                  {pendingId === k.id ? 'Selling...' : 'Sell'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
