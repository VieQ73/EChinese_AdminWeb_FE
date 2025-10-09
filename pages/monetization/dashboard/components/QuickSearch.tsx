import React, { useState } from 'react';
import { quickSearchTransaction } from '../api';
import { Search, Loader2 } from 'lucide-react';
import { Payment } from '../../../../types';

interface QuickSearchProps {
    onResult: (result: Payment | null) => void;
}

const QuickSearch: React.FC<QuickSearchProps> = ({ onResult }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await quickSearchTransaction(query);
            if (result === 'not_found') {
                setError('Không tìm thấy giao dịch.');
                onResult(null);
            } else if(result) {
                onResult(result);
                 setQuery(''); // Clear input on success
            }
        } catch (e) {
            setError('Lỗi khi tìm kiếm.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Tìm kiếm nhanh giao dịch</h3>
            <form onSubmit={handleSearch} className="space-y-3">
                <label htmlFor="quick-search" className="text-sm font-medium text-gray-700">
                    Nhập mã giao dịch, email hoặc ID người dùng
                </label>
                <div className="relative">
                    <input
                        id="quick-search"
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setError(null); }}
                        className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <button type="submit" disabled={loading || !query} className="w-full flex justify-center items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tìm kiếm'}
                </button>
                {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
            </form>
        </div>
    );
};

export default QuickSearch;
