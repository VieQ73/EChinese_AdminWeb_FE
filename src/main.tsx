import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// Import CSS toàn cục
import './index.css'; 

// Khởi tạo ứng dụng trên root element
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
