import React from 'react';

interface ReportActionFormProps {
    view: 'resolve' | 'dismiss';
    resolution: string;
    setResolution: (value: string) => void;
    severity: 'low' | 'medium' | 'high';
    setSeverity: (value: 'low' | 'medium' | 'high') => void;
    isAiReport: boolean;
}

const ReportActionForm: React.FC<ReportActionFormProps> = ({
    view,
    resolution,
    setResolution,
    severity,
    setSeverity,
    isAiReport,
}) => {

    const showResolutionInput = !(view === 'resolve' && isAiReport);

    return (
        <div className="space-y-4 mt-2">
            {view === 'resolve' && !isAiReport && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ vi phạm</label>
                    <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as any)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                    </select>
                </div>
            )}
            
            {showResolutionInput ? (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú xử lý
                    </label>
                    <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={4}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Nhập nội dung phản hồi hoặc lý do xử lý..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Nội dung này sẽ được gửi đến người báo cáo.</p>
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800">
                    Đây là báo cáo từ hệ thống AI. Hành động "Giải quyết" sẽ chỉ cập nhật trạng thái báo cáo mà không gửi thông báo.
                </div>
            )}
        </div>
    );
};

export default ReportActionForm;
