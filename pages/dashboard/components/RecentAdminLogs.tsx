import React from 'react';
import { useNavigate } from 'react-router';
import { getLogActionInfo } from '../../system/utils';
import { ArrowRight } from 'lucide-react';

// Type cho log từ API
interface RecentLog {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  admin_name: string;
}

// Định nghĩa props, nhận vào một mảng các log
interface RecentAdminLogsProps {
  logs: RecentLog[];
}

/**
 * Component hiển thị danh sách 5 hành động mới nhất của Admin.
 */
const RecentAdminLogs: React.FC<RecentAdminLogsProps> = ({ logs }) => {
  const navigate = useNavigate();

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động Admin gần đây</h2>
      <ul className="divide-y divide-gray-100 flex-1">
        {logs.length > 0 ? logs.slice(0, 5).map(log => {
          const { icon: Icon, color } = getLogActionInfo(log.action_type);
          // Tạo class cho background của icon từ class màu text
          const bgColor = color.replace('text-', 'bg-') + '/10';
          
          return (
            <li
              key={log.id}
              className="
                py-3 flex items-start space-x-4
                rounded-lg -mx-2 px-2 transition-colors
                bg-slate-100 hover:bg-slate-200
              "
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{log.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {log.admin_name} • {timeAgo(log.created_at)}
                </p>
              </div>
            </li>
          );
        }) : (
          <p className="text-sm text-gray-500 py-4 text-center">
            Không có hoạt động nào gần đây.
          </p>
        )}
      </ul>
      <button
        onClick={() => navigate('/system')}
        className="w-full mt-4 text-center text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center justify-center group"
      >
        Xem tất cả nhật ký
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default RecentAdminLogs;
