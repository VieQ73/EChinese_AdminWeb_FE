/**
 * A generic search utility function.
 * @param query The search string.
 * @param items The array of items to search through.
 * @param mapper A function that takes an item and returns an array of strings to search against.
 * @returns A filtered array of items that match the query.
 */
export function searchTips<T>(query: string, items: T[], mapper: (item: T) => string[]): T[] {
    if (!query) {
        return items;
    }

    const lowercaseQuery = query.toLowerCase();

    return items.filter(item => {
        const searchableFields = mapper(item).join(' ').toLowerCase();
        return searchableFields.includes(lowercaseQuery);
    });
}
