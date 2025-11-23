// import { useCallback, useState } from 'react';
// import { fetchVocabularies } from '../../../pages/content/api/vocabularyApi';
// import { fetchNotebooks } from '../../../pages/content/api/notebooksApi';

// export const useContentActions = (
//     { setNotebooks, setVocabularies, addAdminLog }: 
//     { 
//         setNotebooks: (notebooks: Notebook[]) => void;
//         setVocabularies: (vocabularies: Vocabulary[]) => void;
//         addAdminLog: (log: Omit<AdminLog, 'id' | 'timestamp' | 'user_id' | 'user_name'>) => void;
//     }
// ) => {
//     const refreshVocabularies = useCallback(async () => {
//         try {
//             const response = await fetchVocabularies({ page: 1, limit: 5000 });
//             setVocabularies(response.data);
//         } catch (error) {
//             console.error("Failed to refresh vocabularies:", error);
//         }
//     }, [setVocabularies]);

//     const refreshNotebooks = useCallback(async () => {
//         try {
//             const response = await fetchNotebooks({ page: 1, limit: 1000 });
//             setNotebooks(response.data);
//         } catch (error) {
//             console.error("Failed to refresh notebooks:", error);
//         }
//     }, [setNotebooks]);

//     const createNotebook = useCallback(async (payload: { name: string; description?: string }) => {
//         // ... (implementation from previous steps)
//     }, [refreshNotebooks, addAdminLog]);

//     // ... other actions

//     return {
//         refreshVocabularies,
//         refreshNotebooks,
//         createNotebook,
//         // ... other returned actions
//     };
// };