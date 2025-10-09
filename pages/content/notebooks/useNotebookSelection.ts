
import { useState, useCallback, useMemo } from 'react';
import { Notebook } from '../../../types';

export const useNotebookSelection = (paginatedNotebooks: Notebook[]) => {
    const [selectedNotebooks, setSelectedNotebooks] = useState<Set<string>>(new Set());

    const handleSelect = useCallback((notebookId: string) => {
        setSelectedNotebooks(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(notebookId)) {
                newSelection.delete(notebookId);
            } else {
                newSelection.add(notebookId);
            }
            return newSelection;
        });
    }, []);

    const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedNotebooks(new Set(paginatedNotebooks.map(nb => nb.id)));
        } else {
            setSelectedNotebooks(new Set());
        }
    }, [paginatedNotebooks]);

    const clearSelection = useCallback(() => {
        setSelectedNotebooks(new Set());
    }, []);

    return {
        selectedNotebooks,
        handleSelect,
        handleSelectAll,
        clearSelection,
    };
};
