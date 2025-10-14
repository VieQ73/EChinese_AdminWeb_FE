
import React from 'react';
import { ExamLevel } from '../../../../../types';

interface ExamLevelFiltersProps {
    levels: ExamLevel[];
    activeLevelId: string;
    onSelectLevel: (levelId: string) => void;
}

const ExamLevelFilters: React.FC<ExamLevelFiltersProps> = ({ levels, activeLevelId, onSelectLevel }) => {
    if (levels.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <button
                onClick={() => onSelectLevel('all')}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    activeLevelId === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
                Tất cả
            </button>
            {levels.map(level => (
                <button
                    key={level.id}
                    onClick={() => onSelectLevel(level.id)}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        activeLevelId === level.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {level.name}
                </button>
            ))}
        </div>
    );
};

export default ExamLevelFilters;