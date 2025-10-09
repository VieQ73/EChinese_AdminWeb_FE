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
    const isAllSelected = vocabItems.length > 0 && selectedVocabs.size === vocabItems.length;

    return (
        <div>
            {isSelectable && (
                <div className="p-4 border-b border-gray-200">
                    <Checkbox
                        onChange={onSelectAll}
                        checked={isAllSelected}
                        id="select-all-vocabs"
                    />
                    <label htmlFor="select-all-vocabs" className="ml-2 text-sm font-medium text-gray-700">
                        Chọn tất cả
                    </label>
                </div>
            )}
            {vocabItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 p-4">
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
                    <p>Không tìm thấy từ vựng nào.</p>
                </div>
            )}
        </div>
    );
};

export default VocabCardGrid;