import React from 'react';

interface Tab {
  id: string;
  name: string;
  type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK';
  levels: string[];
}

const TEST_TABS: Tab[] = [
  {
    id: 'hsk',
    name: 'HSK',
    type: 'HSK',
    levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']
  },
  {
    id: 'tocfl',
    name: 'TOCFL',
    type: 'TOCFL',
    levels: ['Band A', 'Band B', 'Band C']
  },
  {
    id: 'd4',
    name: 'D4',
    type: 'D4',
    levels: ['Level 1', 'Level 2', 'Level 3', 'Level 4']
  },
  {
    id: 'hskk',
    name: 'HSKK',
    type: 'HSKK',
    levels: ['Basic', 'Intermediate', 'Advanced']
  }
];

interface TestTypeTabsProps {
  activeTab: string;
  activeLevel: string;
  onTabChange: (tabId: string, type: 'HSK' | 'TOCFL' | 'D4' | 'HSKK') => void;
  onLevelChange: (level: string) => void;
  testCounts?: Record<string, Record<string, number>>;
}

export const TestTypeTabs: React.FC<TestTypeTabsProps> = ({
  activeTab,
  activeLevel,
  onTabChange,
  onLevelChange,
  testCounts = {}
}) => {
  const activeTabData = TEST_TABS.find(tab => tab.id === activeTab);

  return (
    <div className="border-b border-gray-200 bg-white rounded-t-lg">
      {/* Main tabs */}
      <nav className="flex space-x-8 px-6">
        {TEST_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const totalCount = testCounts[tab.type] 
            ? Object.values(testCounts[tab.type]).reduce((sum, count) => sum + count, 0)
            : 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id, tab.type)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
              {totalCount > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-medium
                  ${isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {totalCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Level sub-tabs */}
      {activeTabData && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onLevelChange('all')}
              className={`
                px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${activeLevel === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              Tất cả
            </button>
            
            {activeTabData.levels.map((level) => {
              const isLevelActive = activeLevel === level;
              const levelCount = testCounts[activeTabData.type]?.[level] || 0;

              return (
                <button
                  key={level}
                  onClick={() => onLevelChange(level)}
                  className={`
                    px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1
                    ${isLevelActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }
                  `}
                >
                  {level}
                  {levelCount > 0 && (
                    <span className={`
                      px-1.5 py-0.5 rounded text-xs
                      ${isLevelActive 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : 'bg-gray-100 text-gray-500'
                      }
                    `}>
                      {levelCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTypeTabs;