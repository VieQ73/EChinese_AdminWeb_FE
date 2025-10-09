
import React from 'react';
import { mockAdminLogs } from '../../mock';

const SystemManagement: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Hệ thống</h1>
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nhật ký Admin</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                           {mockAdminLogs.map(log => (
                               <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.adminName}</td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{log.action_type}</span>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.description}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SystemManagement;
