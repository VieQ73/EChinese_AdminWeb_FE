import React, { useState } from 'react';
import Input from '../components/ui/Input';
import { Button } from '../components/ui/button'; // Import Button component
import { Loader2 } from 'lucide-react'; // Import spinner icon
import { login, forgotPassword, type LoginPayload } from '../features/auth/authApi'; // Import API auth
import { type User } from '../types/entities'; // Import User type

/**
 * @fileoverview AuthPage component - Trang Đăng nhập và Quên mật khẩu cho Admin Panel
 * @description Xử lý logic và giao diện cho việc xác thực người dùng (admin/super admin).
 * Sử dụng API mock hoặc API thực để đăng nhập và gửi yêu cầu quên mật khẩu.
 * Khi đăng nhập thành công, token sẽ được lưu vào localStorage và callback onLoginSuccess được gọi.
 */

// Định nghĩa props cho AuthPage: cần một hàm để thông báo cho App biết khi nào người dùng đã đăng nhập thành công
interface AuthPageProps {
  onLoginSuccess: (token: string, user: Pick<User, 'id' | 'username' | 'email' | 'name' | 'role' | 'avatar_url' | 'level' | 'badge_level'>) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true); // true: Login, false: Forgot Password
  const [identifier, setIdentifier] = useState(''); // username
  const [password, setPassword] = useState('');
  const [emailForReset, setEmailForReset] = useState('');
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Dùng để hiển thị tin nhắn thành công
  const [loading, setLoading] = useState(false);

  // Xóa các thông báo lỗi/thành công khi chuyển đổi view
  const resetForm = () => {
    setAuthError('');
    setSuccessMessage('');
    setIdentifier('');
    setPassword('');
    setEmailForReset('');
  };

  // Logic đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    setSuccessMessage('');
    
    try {
      // Chuẩn bị payload dựa trên thiết kế API
      const payload: LoginPayload = {
        username: identifier, 
        password: password,
      };

      const response = await login(payload); // Gọi API đăng nhập từ authApi.ts
      
      // Giả sử API trả về token và thông tin user
      localStorage.setItem('admin_token', response.token); // Lưu token vào localStorage
      onLoginSuccess(response.token, response.user); // Thông báo cho App.tsx
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      setAuthError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  // Logic quên mật khẩu
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    setSuccessMessage('');
    
    try {
      const response = await forgotPassword(emailForReset); // Gọi API quên mật khẩu
      setSuccessMessage(response.message);
      
      // Tự động quay lại màn hình đăng nhập sau vài giây
      setTimeout(() => {
          setIsLoginView(true);
          resetForm();
      }, 4000); 

    } catch (err: any) {
      console.error("Lỗi quên mật khẩu:", err);
      setAuthError(err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <Input
        id="identifier"
        label="Tên đăng nhập"
        type="text"
        placeholder="superadmin"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
      <Input
        id="password"
        label="Mật khẩu"
        type="password"
        placeholder="********"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      {(authError || successMessage) && (
        <p className={`text-sm font-semibold p-3 rounded-lg ${authError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {authError || successMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg transform hover:scale-[1.01]"
      >
        {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : 'ĐĂNG NHẬP'}
      </Button>

      <Button
        type="button"
        variant="link"
        onClick={() => { setIsLoginView(false); resetForm(); }}
        className="w-full mt-2 text-sm"
      >
        Quên Mật khẩu?
      </Button>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-6">
      <p className="text-gray-600 text-sm">Nhập địa chỉ email đã đăng ký để nhận liên kết đặt lại mật khẩu.</p>
      
      {(authError || successMessage) && (
        <p className={`text-sm font-semibold p-3 rounded-lg ${authError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {authError || successMessage}
        </p>
      )}

      <Input
        id="email-reset"
        label="Email"
        type="email"
        placeholder="example@email.com"
        value={emailForReset}
        onChange={(e) => setEmailForReset(e.target.value)}
        required
      />

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600 transform hover:scale-[1.01]"
      >
        {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : 'GỬI YÊU CẦU'}
      </Button>

      <Button
        type="button"
        variant="link"
        onClick={() => { setIsLoginView(true); resetForm(); }}
        className="w-full mt-2 text-sm"
      >
        Quay lại Đăng nhập
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-100">
        
        <div className="text-center mb-10">
          <svg className="mx-auto h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2h3zm-2-7h8m-8-4h8m-8-4h.01"></path></svg>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
            EChinese <span className="text-teal-600">Admin</span>
          </h1>
          <h2 className="text-lg mt-2 font-medium text-gray-500">
            {isLoginView ? 'Đăng nhập để tiếp tục' : 'Đặt lại Mật khẩu'}
          </h2>
        </div>
        
        {isLoginView ? renderLoginForm() : renderForgotPasswordForm()}
        
      </div>
    </div>
  );
};

export default AuthPage;