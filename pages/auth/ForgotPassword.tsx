import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from './api';
import { Loader2, Copy, Check } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        setMessage('');
        setNewPassword('');
        setError('');

        try {
            const response = await forgotPassword({ email });
            if (response.success) {
                setMessage(response.message);
                if (response.data?.newPassword) {
                    setNewPassword(response.data.newPassword);
                }
            } else {
                setError(response.message);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyPassword = async () => {
        if (newPassword) {
            await navigator.clipboard.writeText(newPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
                    <p className="mt-2 text-sm text-gray-600">Nhập email của bạn để lấy lại mật khẩu</p>
                </div>
                
                {/* Hiển thị mật khẩu mới khi thành công */}
                {newPassword && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-green-700 font-medium">{message}</p>
                        <div className="flex items-center justify-between bg-white border border-green-300 rounded-lg p-3">
                            <div>
                                <p className="text-xs text-gray-500">Mật khẩu mới của bạn:</p>
                                <p className="text-lg font-mono font-bold text-gray-900">{newPassword}</p>
                            </div>
                            <button
                                onClick={handleCopyPassword}
                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Sao chép mật khẩu"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">Vui lòng đăng nhập và đổi mật khẩu ngay sau khi đăng nhập.</p>
                    </div>
                )}

                {!newPassword && (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                        <div>
                            <label htmlFor="email-address" className="text-sm font-medium text-gray-700 sr-only">Địa chỉ email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg bg-gray-50 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Địa chỉ email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                disabled={isLoading || !email}
                            >
                                {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                                {isLoading ? 'Đang xử lý...' : 'Lấy lại mật khẩu'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-sm text-center">
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
