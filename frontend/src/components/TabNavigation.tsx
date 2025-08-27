interface Tab {
  key: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="tab-navigation flex gap-2 border-b border-gray-200 mb-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-btn px-4 py-2 font-medium rounded-t-md focus:outline-none transition-colors ${
            activeTab === tab.key
              ? 'bg-white border-x border-t border-gray-200 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-white'
          }`}
          aria-current={activeTab === tab.key ? 'page' : undefined}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}