/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import Input from '../components/ui/Input';

// Định nghĩa props cho AuthPage: cần một hàm để thông báo cho App biết khi nào người dùng đã đăng nhập thành công
interface AuthPageProps {
  onLoginSuccess: (token: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true); // true: Login, false: Forgot Password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Giả lập logic đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    setResetMessage('');
    
    // GỌI API ĐĂNG NHẬP Ở ĐÂY: POST /api/auth/login
    console.log("Đang cố gắng đăng nhập:", { username, password });

    try {
      // Giả lập delay và kiểm tra đơn giản
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Giả lập đăng nhập thành công
      if (username === 'admin' && password === '123456') {
        const mockToken = 'mock_admin_token_' + new Date().getTime();
        onLoginSuccess(mockToken); // Thông báo cho App.tsx
      } else {
        setAuthError('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.');
      }
    } catch (err) {
      setAuthError('Có lỗi xảy ra trong quá trình đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  // Giả lập logic quên mật khẩu
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetMessage('');
    setAuthError('');
    
    // GỌI API QUÊN MẬT KHẨU Ở ĐÂY: POST /api/auth/reset-password (hoặc tương đương)
    console.log("Đang gửi yêu cầu lấy lại mật khẩu cho email:", email);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Thay vì chỉ hiển thị tin nhắn, chúng ta giả lập lỗi nếu email không hợp lệ
      if (!email.includes('@') || email === 'fail@test.com') {
          setAuthError('Địa chỉ email không hợp lệ hoặc chưa được đăng ký.');
      } else {
          setResetMessage(`Yêu cầu đã được gửi. Vui lòng kiểm tra hộp thư (${email}) để làm theo hướng dẫn.`);
          setTimeout(() => {
              setIsLoginView(true);
              setResetMessage('');
          }, 4000); 
      }
    } catch (err) {
      setAuthError('Có lỗi xảy ra trong quá trình gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <Input
        id="username"
        label="Tên đăng nhập"
        type="text"
        placeholder="admin"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        id="password"
        label="Mật khẩu"
        type="password"
        placeholder="123456"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      {(authError || resetMessage) && (
        <p className={`text-sm font-semibold p-3 rounded-lg ${authError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {authError || resetMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-600 text-white p-3 rounded-xl font-bold text-lg shadow-lg hover:bg-teal-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.01]"
      >
        {loading ? (
            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : 'ĐĂNG NHẬP'}
      </button>

      <button
        type="button"
        onClick={() => { setIsLoginView(false); setAuthError(''); setResetMessage(''); }}
        className="w-full mt-2 text-sm text-gray-500 hover:text-teal-600 transition duration-200"
      >
        Quên Mật khẩu?
      </button>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-6">
      <p className="text-gray-600 text-sm">Nhập địa chỉ email đã đăng ký để nhận liên kết đặt lại mật khẩu.</p>
      
      {(authError || resetMessage) && (
        <p className={`text-sm font-semibold p-3 rounded-lg ${authError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {authError || resetMessage}
        </p>
      )}

      <Input
        id="email-reset"
        label="Email"
        type="email"
        placeholder="example@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 text-white p-3 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-600 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-[1.01]"
      >
        {loading ? (
            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        ) : 'GỬI YÊU CẦU'}
      </button>

      <button
        type="button"
        onClick={() => { setIsLoginView(true); setAuthError(''); setResetMessage(''); }}
        className="w-full mt-2 text-sm text-gray-500 hover:text-teal-600 transition duration-200"
      >
        Quay lại Đăng nhập
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
