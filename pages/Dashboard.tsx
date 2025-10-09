
import React from 'react';
import { UsersIcon, DocumentTextIcon, CurrencyDollarIcon, ChatAlt2Icon } from '../constants';

const StatCard: React.FC<{ title: string; value: string; icon: React.FC<any> }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center hover:shadow-md hover:border-primary-300 transition-all duration-300">
        <div className="bg-blue-50 p-3 rounded-lg mr-4">
            <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Tổng số người dùng" value="1,234" icon={UsersIcon} />
                <StatCard title="Tổng số bài viết" value="5,678" icon={DocumentTextIcon} />
                <StatCard title="Doanh thu tháng" value="28,450,000₫" icon={CurrencyDollarIcon} />
                <StatCard title="Báo cáo chờ xử lý" value="12" icon={ChatAlt2Icon} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
                    <ul className="divide-y divide-gray-200">
                        <li className="py-3">
                            <p className="text-gray-800">Người dùng mới <span className="font-semibold text-primary-600">John Doe</span> đã đăng ký.</p>
                            <p className="text-sm text-gray-500">2 phút trước</p>
                        </li>
                         <li className="py-3">
                            <p className="text-gray-800">Bài viết "<span className="font-semibold text-primary-600">Hành trình HSK 5 của tôi</span>" đã bị báo cáo.</p>
                            <p className="text-sm text-gray-500">15 phút trước</p>
                        </li>
                         <li className="py-3">
                            <p className="text-gray-800">Gói đăng ký <span className="font-semibold text-primary-600">Premium Năm</span> đã được cập nhật.</p>
                            <p className="text-sm text-gray-500">1 giờ trước</p>
                        </li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Tình trạng hệ thống</h2>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-gray-800">Trạng thái API</p>
                            <div className="flex items-center">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-green-600 font-semibold text-sm">Đang hoạt động</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-gray-800">Kết nối cơ sở dữ liệu</p>
                             <div className="flex items-center">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-green-600 font-semibold text-sm">Tốt</span>
                            </div>
                        </div>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-800">Sao lưu hàng ngày</p>
                            <div className="flex items-center">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                                <span className="text-green-600 font-semibold text-sm">Thành công</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
