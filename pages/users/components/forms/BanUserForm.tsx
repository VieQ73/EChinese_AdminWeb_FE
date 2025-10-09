
import React from 'react';
import { CommunityRule, Violation } from '../../../../types';

interface FormData {
    logReason: string;
    ruleIds: string[];
    resolution: string;
    severity: Violation['severity'];
}

interface BanUserFormProps {
    data: FormData;
    onChange: (updatedData: Partial<FormData>) => void;
    rules: CommunityRule[];
}

const BanUserForm: React.FC<BanUserFormProps> = ({ data, onChange, rules }) => {
    
    const handleRuleToggle = (ruleId: string) => {
        const newRuleIds = data.ruleIds.includes(ruleId)
            ? data.ruleIds.filter(id => id !== ruleId)
            : [...data.ruleIds, ruleId];
        onChange({ ruleIds: newRuleIds });
    };

    // Lọc chỉ những quy tắc đang hoạt động để hiển thị
    const activeRules = rules.filter(rule => rule.is_active);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do cấm (Hiển thị trên Log) *
                </label>
                <input
                    type="text"
                    value={data.logReason}
                    onChange={(e) => onChange({ logReason: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ví dụ: Lạm dụng ngôn ngữ, spam..."
                />
                <p className="text-xs text-gray-500 mt-1">Lý do ngắn gọn này sẽ hiển thị trong nhật ký kiểm duyệt.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quy tắc vi phạm (Ghi nhận cho người dùng) *
                </label>
                <div className="max-h-32 overflow-y-auto space-y-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                    {activeRules.map(rule => (
                        <label key={rule.id} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                            <input
                                type="checkbox"
                                checked={data.ruleIds.includes(rule.id)}
                                onChange={() => handleRuleToggle(rule.id)}
                                className="form-checkbox h-4 w-4 text-primary-600 rounded"
                            />
                            <span className="text-sm">{rule.title}</span>
                        </label>
                    ))}
                    {activeRules.length === 0 && <p className="text-sm text-gray-500 text-center p-2">Không có quy tắc nào đang hoạt động.</p>}
                </div>
                 <p className="text-xs text-gray-500 mt-1">Chọn một hoặc nhiều quy tắc mà người dùng đã vi phạm.</p>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú hướng giải quyết (Ghi nhận cho vi phạm)
                </label>
                <textarea
                    value={data.resolution}
                    onChange={(e) => onChange({ resolution: e.target.value })}
                    rows={2}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ví dụ: Cấm tài khoản và gửi cảnh cáo..."
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ vi phạm *</label>
                <div className="flex space-x-4">
                    {(['low', 'medium', 'high'] as const).map(level => (
                        <label key={level} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="severity"
                                value={level}
                                checked={data.severity === level}
                                onChange={() => onChange({ severity: level })}
                                className="form-radio h-4 w-4 text-primary-600"
                            />
                            <span className="text-sm capitalize">{level === 'low' ? 'Thấp' : level === 'medium' ? 'Trung bình' : 'Cao'}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BanUserForm;
