import React, { useEffect } from 'react';
import { ExamLevel } from '../../../../../types';

interface ExamLevelFiltersProps {
    levels: ExamLevel[];
    activeLevelId: string;
    onSelectLevel: (levelId: string) => void;
}

const ExamLevelFilters: React.FC<ExamLevelFiltersProps> = ({ levels, activeLevelId, onSelectLevel }) => {
    // Auto-select first level if current activeLevelId is empty or invalid
    useEffect(() => {
        if (levels.length > 0 && !levels.find(l => l.id === activeLevelId)) {
            onSelectLevel(levels[0].id);
        }
    }, [levels, activeLevelId, onSelectLevel]);

    if (levels.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Lọc cấp độ bài thi">
            {levels.map(level => {
                const isActive = activeLevelId === level.id;
                return (
                    <button
                        key={level.id}
                        onClick={() => onSelectLevel(level.id)}
                        role="tab"
                        aria-selected={isActive}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                            isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {level.name}
                    </button>
                );
            })}
        </div>
    );
};

export default ExamLevelFilters;