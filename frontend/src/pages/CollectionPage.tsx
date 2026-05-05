import { useMemo, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import KemonoModal from '../components/KemonoModal';
import { KemonoAvatar } from '../components/KemonoAvatar';
import type { Kemonomimi } from '../types/game';

const SORT_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'price', label: 'Price' },
  { key: 'stats', label: 'Total Stats' },
];

export default function CollectionPage() {
  const kemonomimi = useGameStore(s => s.kemonomimi);
  const setSelectedParent1 = useGameStore(s => s.setSelectedParent1);
  const setSelectedParent2 = useGameStore(s => s.setSelectedParent2);
  const selectedParent1 = useGameStore(s => s.selectedParent1);
  const selectedParent2 = useGameStore(s => s.selectedParent2);
  const [selected, setSelected] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'training' | 'breeding'>('all');
  const [traitFilter, setTraitFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const typeOptions = useMemo(() => {
    const valueSet = new Set(kemonomimi.map(k => k.type.name));
    return ['all', ...Array.from(valueSet)];
  }, [kemonomimi]);

  const traitOptions = useMemo(() => {
    const valueSet = new Set(
      kemonomimi.flatMap(k => k.type.traits)
    );
    return ['all', ...Array.from(valueSet)];
  }, [kemonomimi]);

  const totalStats = (kemono: Kemonomimi) =>
    Object.values(kemono.stats).reduce((sum, value) => sum + value, 0);

  const filteredList = useMemo(() => {
    let list = [...kemonomimi];

    if (search.trim()) {
      const needle = search.toLowerCase();
      list = list.filter(k => k.name.toLowerCase().includes(needle));
    }

    if (typeFilter !== 'all') {
      list = list.filter(k => k.type.name === typeFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter(k => k.status === statusFilter);
    }

    if (traitFilter !== 'all') {
      list = list.filter(k => k.type.traits.includes(traitFilter));
    }

    return list.sort((left, right) => {
      switch (sortBy) {
        case 'age':
          return left.age - right.age;
        case 'price':
          return (left.price ?? 0) - (right.price ?? 0);
        case 'stats':
          return totalStats(left) - totalStats(right);
        case 'name':
        default:
          return left.name.localeCompare(right.name);
      }
    });
  }, [kemonomimi, search, typeFilter, statusFilter, traitFilter, sortBy]);

  // Select handlers
  const handleBreed = (kemono: Kemonomimi) => {
    if (!selectedParent1) {
      setSelectedParent1(kemono.id);
    } else if (!selectedParent2 && kemono.id !== selectedParent1) {
      setSelectedParent2(kemono.id);
    } else {
      setSelectedParent1(kemono.id);
      setSelectedParent2(null);
    }
    setSelected(null);
  };

  const handleTrain = (kemono: Kemonomimi) => {
    setSelected(kemono.id);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setTraitFilter('all');
    setSortBy('name');
  };

  return (
    <section>
      <h2
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
        style={{ color: 'var(--kemo-primary)' }}
      >
        Your Kemonomimi Collection
      </h2>

      <div className="bg-surface rounded-xl p-4 border border-primary/20 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded px-3 py-2"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search by name"
          />
          <select className="border rounded px-3 py-2" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}>
            {typeOptions.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Types' : option}
              </option>
            ))}
          </select>
          <select
            className="border rounded px-3 py-2"
            value={statusFilter}
            onChange={event =>
              setStatusFilter(event.target.value as 'all' | 'available' | 'training' | 'breeding')
            }
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="training">Training</option>
            <option value="breeding">Breeding</option>
          </select>
          <select className="border rounded px-3 py-2" value={traitFilter} onChange={event => setTraitFilter(event.target.value)}>
            {traitOptions.map(option => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Traits' : option}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select className="border rounded px-3 py-2" value={sortBy} onChange={event => setSortBy(event.target.value)}>
            {SORT_OPTIONS.map(option => (
              <option key={option.key} value={option.key}>
                Sort by {option.label}
              </option>
            ))}
          </select>
          <button className="btn btn--secondary bg-gray-200 px-3 py-2 rounded" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredList.length === 0 ? (
          <div className="col-span-full text-center" style={{ color: 'var(--kemo-text-muted)' }}>
            No kemonomimi match your filters.
          </div>
        ) : (
          filteredList.map(k => (
            <div
              key={k.id}
              className="kemo-card p-4 flex flex-col items-center cursor-pointer border-2 transition-all duration-300"
              style={{
                borderColor:
                  selectedParent1 === k.id || selectedParent2 === k.id
                    ? 'var(--kemo-primary)'
                    : 'transparent',
              }}
              onClick={() => setSelected(k.id)}
            >
              <KemonoAvatar
                typeName={k.type.name}
                index={k.id}
                emoji={k.type.emoji}
                alt={`${k.name} portrait`}
                className="w-20 h-20 rounded-full border-[3px] mb-3 shadow-lg border-[var(--kemo-primary-light)] bg-[var(--kemo-primary-bg)]"
                imageClassName="object-cover"
              />
              <div className="flex flex-col items-center w-full">
                <span className="font-bold text-lg md:text-xl mb-1" style={{ color: 'var(--kemo-primary)' }}>
                  {k.name}
                </span>
                <span className="text-xs mb-2" style={{ color: 'var(--kemo-text-secondary)' }}>
                  {k.type.name}
                </span>
                <div className="grid grid-cols-3 gap-1 text-xs w-full mb-2">
                  {Object.entries(k.stats).map(([stat, value]) => (
                    <div key={stat} className="flex flex-col items-center">
                      <span style={{ color: 'var(--kemo-text-muted)', fontSize: '10px' }}>
                        {stat}
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--kemo-text-primary)' }}>
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  Age {k.age} | Price {k.price ?? '-'}
                </div>
                <div
                  className="mt-1 text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    color: 'var(--kemo-accent)',
                    backgroundColor: 'var(--kemo-accent-bg)',
                  }}
                >
                  {k.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selected !== null && (
        <KemonoModal
          kemonoId={selected}
          onClose={() => setSelected(null)}
          onBreed={handleBreed}
          onTrain={handleTrain}
        />
      )}
    </section>
  );
}
