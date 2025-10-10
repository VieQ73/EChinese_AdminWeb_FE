import React from 'react';
import { Vocabulary } from '../../../../types';
import Checkbox from '../../../../ui/Checkbox';
import VocabCard from './VocabCard';

interface VocabCardGridProps {
    vocabItems: Vocabulary[];
    selectedVocabs: Set<string>;
    onSelect: (id: string) => void;
    onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onViewDetails: (vocab: Vocabulary) => void;
    isSelectable?: boolean;
}

const VocabCardGrid: React.FC<VocabCardGridProps> = ({
    vocabItems,
    selectedVocabs,
    onSelect,
    onSelectAll,
    onViewDetails,
    isSelectable = true,
}) => {
    return (
        <div>
            {vocabItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-6">
                    {vocabItems.map(item => (
                        <VocabCard
                            key={item.id}
                            vocab={item}
                            isSelected={selectedVocabs.has(item.id)}
                            onSelect={isSelectable ? onSelect : undefined}
                            onViewDetails={onViewDetails}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium">Không tìm thấy từ vựng nào</p>
                    <p className="text-sm text-gray-400 mt-1">Thử điều chỉnh bộ lọc hoặc thêm từ vựng mới</p>
                </div>
            )}
        </div>
    );
};

export default VocabCardGrid;