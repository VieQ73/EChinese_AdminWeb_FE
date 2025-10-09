import { useState, useCallback } from 'react';
import { Vocabulary } from '../../../../types';

export const useVocabSelection = (paginatedVocabs: Vocabulary[]) => {
    const [selectedVocabs, setSelectedVocabs] = useState<Set<string>>(new Set());

    const handleSelect = useCallback((vocabId: string) => {
        setSelectedVocabs(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(vocabId)) {
                newSelection.delete(vocabId);
            } else {
                newSelection.add(vocabId);
            }
            return newSelection;
        });
    }, []);

    const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedVocabs(new Set(paginatedVocabs.map(v => v.id)));
        } else {
            setSelectedVocabs(new Set());
        }
    }, [paginatedVocabs]);

    const clearSelection = useCallback(() => {
        setSelectedVocabs(new Set());
    }, []);

    return {
        selectedVocabs,
        handleSelect,
        handleSelectAll,
        clearSelection,
    };
};