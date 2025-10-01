/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Users, CreditCard, UserPlus, AlertTriangle } from 'lucide-react';
import { fetchDashboardAnalytics } from '../features/dashboard/dashboardApi';
import type { DashboardAnalytics } from '../features/dashboard/dashboardApi';

/**
 * @fileoverview DashboardPage component - Trang tổng quan quản trị
 * @description Hiển thị các số liệu thống kê quan trọng về hệ thống,
 * như tổng số người dùng, gói premium đang hoạt động, người dùng mới, và báo cáo chờ xử lý.
 * Dữ liệu được lấy từ mock API /analytics.
 */

// Component thẻ thống kê
interface StatCardProps {
    title: string;
    value: number | undefined;
    color: string;
    icon: React.ElementType; // Sử dụng React.ElementType cho Lucide icon components
    loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon: IconComponent, loading }) => (
    <div className={`${color} text-white p-6 rounded-2xl shadow-xl transition duration-300 hover:shadow-2xl transform hover:-translate-y-1`}>
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium opacity-80">{title}</p>
            <IconComponent className="w-6 h-6 opacity-80" /> {/* Render icon component */}
        </div>
        <h2 className="text-4xl font-extrabold mt-3">
            {loading ? (
                <div className="h-10 bg-white bg-opacity-30 rounded w-3/4 animate-pulse"></div>
            ) : (
                value?.toLocaleString('vi-VN') || '0'
            )}
        </h2>
    </div>
);


const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Tải dữ liệu thống kê từ API
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const response = await fetchDashboardAnalytics(); // Gọi hàm API chuyên dụng
        setStats(response);
      } catch (e) {
        console.error("Không thể tải Dashboard stats:", e);
        // Thiết lập giá trị mặc định khi lỗi
        setStats({ totalUsers: 0, activeUsers: 0, newUsersToday: 0, pendingReports: 0, activeSubscriptions: 0 });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    { title: "Tổng người dùng", value: stats?.totalUsers, color: "bg-teal-600", icon: Users },
    { title: "Gói Premium đang hoạt động", value: stats?.activeSubscriptions, color: "bg-orange-500", icon: CreditCard },
    { title: "Người dùng mới hôm nay", value: stats?.newUsersToday, color: "bg-blue-500", icon: UserPlus },
    { title: "Báo cáo chờ xử lý", value: stats?.pendingReports, color: "bg-red-500", icon: AlertTriangle },
  ];


  return (
      <div className="p-0">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Tổng quan Hệ thống</h1>
        <p className="text-gray-500 mb-8">Xin chào Admin, đây là cái nhìn tổng thể về EChinese.</p>

        {/* 1. Thẻ thống kê chính */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map(card => (
            <StatCard 
                key={card.title}
                title={card.title}
                value={card.value}
                color={card.color}
                icon={card.icon}
                loading={loading}
            />
          ))}
        </div>

        {/* 2. Biểu đồ và Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Biểu đồ giả lập (Tỷ lệ phân cấp người dùng) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Phân bố Người dùng theo Cấp độ (HSK)</h3>
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 font-medium">Placeholder: Biểu đồ cột/tròn về HSK Level Distribution</p>
            </div>
          </div>

          {/* Log gần đây */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Hoạt động Admin gần đây</h3>
            <ul className="space-y-4 text-sm">
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <li key={i} className="flex flex-col space-y-1"><div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                    ))
                ) : (
                    <>
                        <li className="text-gray-700 ">Admin đã tạo Bài thi HSK4 mới. <span className="text-xs text-teal-500 font-medium block mt-0.5">2 phút trước</span></li>
                        <li className="text-gray-700 ">Super Admin gỡ bài viết vi phạm của user #1234. <span className="text-xs text-orange-500 font-medium block mt-0.5">1 giờ trước</span></li>
                        <li className="text-gray-700 ">Admin cập nhật giá gói Platinum. <span className="text-xs text-blue-500 font-medium block mt-0.5">3 giờ trước</span></li>
                        <li className="text-gray-700 ">Admin phê duyệt 5 bài viết cộng đồng. <span className="text-xs text-green-500 font-medium block mt-0.5">Hôm qua</span></li>
                        <li className="text-gray-700 ">Admin tải lên 10 file audio cho MockTest. <span className="text-xs text-gray-400 font-medium block mt-0.5">2 ngày trước</span></li>
                    </>
                )}
            </ul>
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;