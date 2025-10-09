
import React from 'react';
import { CommunityRule, User } from '../../../types';
import StatusBadge from '../../moderation/components/ui/StatusBadge';
import ToggleSwitch from '../../../ui/ToggleSwitch';
import { PencilIcon, TrashIcon } from '../../../components/icons';
import { Loader2 } from 'lucide-react';

interface RulesTableProps {
    rules: CommunityRule[];
    loading: boolean;
    onEdit: (rule: CommunityRule) => void;
    onToggleActive: (rule: CommunityRule) => void;
    onDelete: (rule: CommunityRule) => void;
    currentUserRole?: User['role'];
}

const RulesTable: React.FC<RulesTableProps> = ({ rules, loading, onEdit, onToggleActive, onDelete, currentUserRole }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quy tắc</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức độ mặc định</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cập nhật lần cuối</th>
                        <th className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-600" /></td></tr>
                    ) : rules.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-500">Không tìm thấy quy tắc nào.</td></tr>
                    ) : (
                        rules.map(rule => (
                            <tr key={rule.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-semibold text-gray-900">{rule.title}</p>
                                    <p className="text-sm text-gray-500 max-w-md truncate" title={rule.description}>{rule.description}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={rule.severity_default} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <ToggleSwitch 
                                        checked={rule.is_active}
                                        onChange={() => onToggleActive(rule)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(rule.updated_at || rule.created_at).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => onEdit(rule)} className="text-gray-500 hover:text-primary-700" title="Chỉnh sửa"><PencilIcon className="w-5 h-5"/></button>
                                    <button 
                                        onClick={() => onDelete(rule)} 
                                        className="text-gray-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed" 
                                        title={currentUserRole !== 'super admin' ? 'Chỉ Super Admin có thể xóa' : 'Xóa'}
                                        disabled={currentUserRole !== 'super admin'}
                                    >
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RulesTable;
