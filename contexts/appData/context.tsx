import React, { createContext, useContext } from 'react';
import type { AppDataContextType } from './types';

// Re-export Provider từ file logic riêng.
export { AppDataProvider } from './provider';

// Khởi tạo Context với kiểu dữ liệu đã được định nghĩa.
export const AppDataContext = createContext<AppDataContextType | null>(null);

/**
 * Custom hook để sử dụng AppDataContext một cách an toàn và tiện lợi.
 * Ném lỗi nếu hook được sử dụng bên ngoài AppDataProvider.
 */
export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
};
