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
    <nav className="tab-navigation flex gap-2">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`tab-btn focus:outline-none ${activeTab === tab.key ? 'active' : ''}`}
          aria-current={activeTab === tab.key ? 'page' : undefined}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
