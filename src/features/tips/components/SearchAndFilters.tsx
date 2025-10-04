import React from 'react';
import { Search, Filter, Pin } from 'lucide-react';
import { TIP_TOPICS, TIP_LEVELS } from '../tipApi';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  showPinnedOnly: boolean;
  onPinnedOnlyChange: (pinned: boolean) => void;
}

/**
 * Component tìm kiếm và lọc tips
 */
const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedTopic,
  onTopicChange,
  selectedLevel,
  onLevelChange,
  showPinnedOnly,
  onPinnedOnlyChange
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Filter size={16} />
        Lọc và tìm kiếm
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TIP_TOPICS.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>

        {/* Level Filter */}
        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TIP_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>

        {/* Pinned Only Filter */}
        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={showPinnedOnly}
            onChange={(e) => onPinnedOnlyChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <Pin size={14} />
          <span className="text-sm">Chỉ mẹo đã ghim</span>
        </label>
      </div>
    </div>
  );
};

export default SearchAndFilters;