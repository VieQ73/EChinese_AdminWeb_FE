import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../../../types';
import { fetchUsers } from '../../../users/userApi';
import { Loader2, Search } from 'lucide-react';

interface UserSearchProps {
    onUserSelect: (user: User) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Hàm tìm kiếm người dùng với debounce
    const handleSearch = useCallback(async (searchTerm: string) => {
        if (searchTerm.trim().length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            // Gọi API tìm kiếm người dùng với giới hạn 5 kết quả
            const response = await fetchUsers({ searchTerm, limit: 5 });
            setResults(response.data);
        } catch (error) {
            console.error('Lỗi tìm kiếm người dùng:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect để thực hiện tìm kiếm sau khi người dùng ngừng gõ
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            handleSearch(query);
        }, 300); // Độ trễ 300ms

        return () => clearTimeout(debounceTimer);
    }, [query, handleSearch]);

    // Xử lý khi chọn một người dùng từ kết quả
    const handleSelect = (user: User) => {
        onUserSelect(user);
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return (
        <div className="relative">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tìm kiếm hồ sơ người dùng</h3>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)} // Trì hoãn để xử lý click
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm"
                    autoComplete="off"
                />
            </div>

            {showResults && (query.length >= 2) && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 flex justify-center items-center">
                            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                        </div>
                    ) : results.length > 0 ? (
                        <ul>
                            {results.map(user => (
                                <li key={user.id}>
                                    <button
                                        // Sử dụng onMouseDown để event bắn ra trước onBlur của input
                                        onMouseDown={() => handleSelect(user)}
                                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors"
                                    >
                                        <img src={user.avatar_url || ''} alt={user.name} className="w-9 h-9 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-sm">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Không tìm thấy người dùng.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserSearch;
