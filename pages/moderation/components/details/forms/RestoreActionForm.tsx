import React from 'react';

interface FormData {
    logReason: string;
}

interface RestoreActionFormProps {
    data: FormData;
    onChange: (updatedData: Partial<FormData>) => void;
    isSelfAction: boolean; 
}

const RestoreActionForm: React.FC<RestoreActionFormProps> = ({ data, onChange, isSelfAction }) => {
    
    if (isSelfAction) {
        return <p>Bạn có chắc chắn muốn khôi phục nội dung này không?</p>;
    }

    return (
        <div className="space-y-4">
            <p>Bạn có chắc chắn muốn khôi phục nội dung này không?</p>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do khôi phục (Hiển thị trên Log) *
                </label>
                <input
                    type="text"
                    value={data.logReason}
                    onChange={(e) => onChange({ logReason: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ví dụ: Gỡ bỏ nhầm lẫn, nội dung hợp lệ..."
                />
                <p className="text-xs text-gray-500 mt-1">Lý do này sẽ hiển thị trong nhật ký kiểm duyệt.</p>
            </div>
        </div>
    );
};

export default RestoreActionForm;