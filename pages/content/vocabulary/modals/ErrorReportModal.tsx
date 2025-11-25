import React from 'react';
import Modal from '../../../../components/Modal';

interface BulkUpsertError {
    index: number;
    hanzi: string;
    id?: string;
    detail: string;
}

interface ErrorReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    errors: BulkUpsertError[];
    message: string;
}

const ErrorReportModal: React.FC<ErrorReportModalProps> = ({ isOpen, onClose, errors, message }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Báo cáo lỗi hàng loạt" footer={
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg border border-transparent">
                Đóng
            </button>
        }>
            <div className="space-y-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm font-medium text-red-800">{message}</p>
                </div>
                <div className="max-h-96 overflow-y-auto border rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Vị trí</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Từ vựng</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Chi tiết lỗi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {errors.map((err, index) => (
                                <tr key={err.index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{err.index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{err.hanzi}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{err.detail}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
};

export default ErrorReportModal;
