import React, { useState } from 'react';
import { apiClient } from '../../services/apiClient';

/**
 * Component test chức năng Refresh Token
 * Sử dụng để debug và kiểm tra flow refresh token
 */
const TestRefreshToken: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Test 1: Gọi API bình thường
  const testNormalAPI = async () => {
    setLoading(true);
    setResult('Đang gọi API...');
    try {
      const data = await apiClient.get('/users');
      setResult('✅ Thành công: ' + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('❌ Lỗi: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Làm hỏng token để test refresh
  const testInvalidToken = async () => {
    setLoading(true);
    setResult('Đang làm hỏng token và gọi API...');
    
    // Lưu token cũ
    const oldToken = localStorage.getItem('token');
    
    try {
      // Làm hỏng token
      localStorage.setItem('token', 'invalid_token_for_testing');
      setResult('Token đã bị làm hỏng, đang gọi API...\n');
      
      // Gọi API - sẽ tự động refresh
      const data = await apiClient.get('/users');
      setResult(prev => prev + '\n✅ Refresh token thành công!\nData: ' + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(prev => prev + '\n❌ Lỗi: ' + (error instanceof Error ? error.message : String(error)));
      
      // Khôi phục token cũ nếu test thất bại
      if (oldToken) {
        localStorage.setItem('token', oldToken);
      }
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Xem token hiện tại
  const showCurrentTokens = () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    setResult(
      `Access Token: ${token ? token.substring(0, 50) + '...' : 'Không có'}\n\n` +
      `Refresh Token: ${refreshToken ? refreshToken.substring(0, 50) + '...' : 'Không có'}`
    );
  };

  // Test 4: Gọi trực tiếp API refresh token
  const testRefreshTokenAPI = async () => {
    setLoading(true);
    setResult('Đang gọi API refresh token...');
    
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      setResult('❌ Không tìm thấy refresh token');
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult('✅ API refresh token thành công!\n\nResponse:\n' + JSON.stringify(data, null, 2));
        
        // Kiểm tra format response
        const hasToken = data.token || data.access_token || data.result?.access_token;
        if (hasToken) {
          setResult(prev => prev + '\n\n✅ Token được tìm thấy trong response!');
        } else {
          setResult(prev => prev + '\n\n⚠️ CẢNH BÁO: Không tìm thấy token trong response!');
        }
      } else {
        setResult('❌ API refresh token thất bại!\n\nStatus: ' + response.status + '\n\nResponse:\n' + JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setResult('❌ Lỗi khi gọi API: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Refresh Token</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testNormalAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mr-2"
        >
          Test 1: Gọi API bình thường
        </button>

        <button
          onClick={testInvalidToken}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 mr-2"
        >
          Test 2: Làm hỏng token & test refresh
        </button>

        <button
          onClick={showCurrentTokens}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 mr-2"
        >
          Test 3: Xem token hiện tại
        </button>

        <button
          onClick={testRefreshTokenAPI}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test 4: Gọi trực tiếp API refresh
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Kết quả:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result || 'Chưa có kết quả'}</pre>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h2 className="font-bold mb-2">Hướng dẫn:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Mở Console (F12) để xem log chi tiết</li>
          <li>Test 1: Kiểm tra API hoạt động bình thường</li>
          <li>Test 2: Kiểm tra tự động refresh khi token hết hạn</li>
          <li>Test 3: Xem token đang lưu trong localStorage</li>
          <li>Test 4: Gọi trực tiếp API refresh để xem response</li>
        </ol>
      </div>
    </div>
  );
};

export default TestRefreshToken;
