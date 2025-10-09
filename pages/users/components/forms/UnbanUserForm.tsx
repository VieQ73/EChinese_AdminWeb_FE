
import React from 'react';

interface FormData {
    logReason: string;
}

interface UnbanUserFormProps {
    data: FormData;
    onChange: (updatedData: Partial<FormData>) => void;
}

const UnbanUserForm: React.FC<UnbanUserFormProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-4">
            <p>Bạn có chắc chắn muốn bỏ cấm người dùng này không?</p>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do bỏ cấm (Hiển thị trên Log) *
                </label>
                <input
                    type="text"
                    value={data.logReason}
                    onChange={(e) => onChange({ logReason: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ví dụ: Hết hạn cấm, khiếu nại được chấp nhận..."
                />
                <p className="text-xs text-gray-500 mt-1">Lý do này sẽ hiển thị trong nhật ký kiểm duyệt.</p>
            </div>
        </div>
    );
};

export default UnbanUserForm;
