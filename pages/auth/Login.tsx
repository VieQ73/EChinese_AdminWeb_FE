import React, { useState, useContext } from 'react';
//  Separated imports. `useNavigate` is from the core `react-router` library, while `Link` is from `react-router-dom`.
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { AuthContext } from '../../contexts/AuthContext';
import { login } from './api';
import { apiClient } from '../../services/apiClient';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // trạng thái loading
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authContext) return;

        setIsLoading(true);
        setError('');

        try {
            // Gọi hàm API đã được tách biệt
            const response = await login({ username, password });
            // Lưu token để dùng cho các API khác
            apiClient.setTokens(response.token, response.refreshToken);
            authContext.login(response.user ?? null, response.token, response.refreshToken);
            navigate('/');
        } catch (err) {
            // Xử lý lỗi từ API
            const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">EChinese Admin</h1>
                    <p className="mt-2 text-sm text-gray-600">Đăng nhập vào tài khoản quản trị của bạn</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                    <div className="space-y-4">
                        <div>
                             <label htmlFor="username" className="text-sm font-medium text-gray-700 sr-only">Tên đăng nhập</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg bg-gray-50 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Tên đăng nhập (vd: admin, superadmin)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700 sr-only">Mật khẩu</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg bg-gray-50 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Mật khẩu (password)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
