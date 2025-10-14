import React from 'react';

// Định nghĩa props cho component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.FC<any>;
}

/**
 * Component StatCard: Một thẻ hiển thị một chỉ số thống kê chính.
 * Giao diện được nâng cấp với gradient, hiệu ứng hover và icon nổi bật.
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
    <div className="group relative bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:scale-[1.03]">
        {/* Vùng chứa nội dung text */}
        <div>
            <p className="text-sm font-semibold text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>

        {/* Vùng chứa icon với nền màu gradient */}
        <div className="bg-gradient-to-tr from-primary-500 to-primary-600 text-white shadow-lg w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-7 w-7" />
        </div>
    </div>
);

export default StatCard;