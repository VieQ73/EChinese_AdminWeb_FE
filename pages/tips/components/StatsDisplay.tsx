import React from 'react';

interface StatsDisplayProps {
  currentCount: number;
  totalCount: number;
  selectedTopic: string;
  selectedLevel: string;
  showPinnedOnly: boolean;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ currentCount, totalCount, selectedTopic, selectedLevel, showPinnedOnly }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600">
        Hiển thị <span className="font-medium">{currentCount}</span> / <span className="font-medium">{totalCount}</span> mẹo
        {selectedTopic !== 'Tất cả' && <span className="ml-2">• Chủ đề: <span className="font-medium">{selectedTopic}</span></span>}
        {selectedLevel !== 'Tất cả' && <span className="ml-2">• Cấp độ: <span className="font-medium">{selectedLevel}</span></span>}
        {showPinnedOnly && <span className="ml-2">• <span className="font-medium">Đã ghim</span></span>}
      </p>
    </div>
  );
};

export default StatsDisplay;