import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { ExamSummary } from '../../../../../types/mocktest_extended';
import { ListChecks, Clock, Layers3, AlertTriangle } from 'lucide-react';
import ExamCardActions from './ExamCardActions';
import { checkExamAttempts, unpublishExam } from '../../../api/examsApi';

interface ExamCardProps {
    exam: ExamSummary;
    onAction: (action: 'copy' | 'publish' | 'unpublish' | 'delete' | 'restore' | 'delete-permanently', exam: ExamSummary) => void;
}

const formatDateTime = (date) => {
  const d = new Date(date);

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');
  const second = d.getSeconds().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

const ExamCard: React.FC<ExamCardProps> = ({ exam, onAction }) => {
    const navigate = useNavigate();
    const isDeleted = exam.is_deleted || false;
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [hasAttempts, setHasAttempts] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isUnpublishing, setIsUnpublishing] = useState(false);
    const [attemptsData, setAttemptsData] = useState<any>(null);
    const [attemptsChecked, setAttemptsChecked] = useState(false);
    
    // Modal states cho delete action
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalType, setDeleteModalType] = useState<'cannot-delete' | 'unpublish-first' | null>(null);

    // Load attempts data khi component mount (chỉ cho exam chưa bị xóa)
    React.useEffect(() => {
        if (!isDeleted && !attemptsChecked) {
            checkExamAttempts(exam.id)
                .then(response => {
                    setHasAttempts(response.has_attempts);
                    setAttemptsData(response);
                    setAttemptsChecked(true);
                })
                .catch(error => {
                    console.error('Error checking exam attempts on mount:', error);
                    setAttemptsChecked(true);
                });
        }
    }, [exam.id, isDeleted, attemptsChecked]);

    const handleCardClick = async (e: React.MouseEvent) => {
        console.log('Card clicked', { target: e.target, isDeleted, isPublished: exam.is_published });
        
        // Không xử lý nếu click vào actions menu
        if ((e.target as HTMLElement).closest('.exam-card-actions')) {
            console.log('Clicked on actions menu, ignoring');
            return;
        }

        if (isDeleted) {
            console.log('Exam is deleted, ignoring');
            return;
        }

        // Kiểm tra attempts cho cả bài thi đã xuất bản và chưa xuất bản
        console.log('Checking attempts before edit');
        setIsChecking(true);
        try {
            const response = await checkExamAttempts(exam.id);
            console.log('Check attempts response:', response);
            setHasAttempts(response.has_attempts);
            setAttemptsData(response);
            
            // Nếu có người làm, hiển thị modal cảnh báo
            if (response.has_attempts) {
                setShowConfirmModal(true);
                console.log('Modal shown - exam has attempts');
            } else {
                // Nếu chưa có người làm
                if (exam.is_published) {
                    // Đã xuất bản → hiển thị modal yêu cầu unpublish
                    setShowConfirmModal(true);
                    console.log('Modal shown - exam is published, needs unpublish');
                } else {
                    // Chưa xuất bản và chưa có người làm → cho phép sửa trực tiếp
                    console.log('Navigating to edit - exam not published and no attempts');
                    navigate(`/mock-tests/edit/${exam.id}`);
                }
            }
        } catch (error) {
            console.error('Error checking exam attempts:', error);
            // Có thể thêm toast notification ở đây thay vì alert
        } finally {
            setIsChecking(false);
        }
    };

    const handleConfirmEdit = async () => {
        // Nếu bài thi đang xuất bản, hủy xuất bản trước
        if (exam.is_published) {
            setIsUnpublishing(true);
            try {
                console.log('Unpublishing exam before edit...');
                await unpublishExam(exam.id);
                console.log('Exam unpublished successfully');
                
                // Gọi onAction để cập nhật UI
                onAction('unpublish', exam);
                
                // Đóng modal
                setShowConfirmModal(false);
                
                // Chuyển đến trang sửa
                navigate(`/mock-tests/edit/${exam.id}`);
            } catch (error) {
                console.error('Error unpublishing exam:', error);
                // Có thể thêm toast notification ở đây
                setIsUnpublishing(false);
            }
        } else {
            // Nếu chưa xuất bản, chuyển thẳng đến trang sửa
            setShowConfirmModal(false);
            navigate(`/mock-tests/edit/${exam.id}`);
        }
    };

    const handleCancelEdit = () => {
        setShowConfirmModal(false);
    };

    // Xử lý action với kiểm tra attempts
    const handleActionWithCheck = async (action: 'copy' | 'publish' | 'unpublish' | 'delete' | 'restore' | 'delete-permanently', exam: ExamSummary) => {
        // Nếu là action delete, cần kiểm tra attempts trước
        if (action === 'delete') {
            try {
                const response = await checkExamAttempts(exam.id);
                setHasAttempts(response.has_attempts);
                setAttemptsData(response);
                
                // Nếu đã có người làm → cấm xóa
                if (response.has_attempts) {
                    setDeleteModalType('cannot-delete');
                    setShowDeleteModal(true);
                    return;
                }
                
                // Nếu chưa có người làm nhưng đang xuất bản → yêu cầu thu hồi trước
                if (exam.is_published) {
                    setDeleteModalType('unpublish-first');
                    setShowDeleteModal(true);
                    return;
                }
                
                // Nếu chưa có người làm và chưa xuất bản → cho phép xóa
                onAction('delete', exam);
            } catch (error) {
                console.error('Error checking exam attempts:', error);
                // Có thể thêm toast notification ở đây
            }
        } else {
            // Các action khác thì gọi trực tiếp
            onAction(action, exam);
        }
    };

    // Xử lý xác nhận unpublish và delete
    const handleConfirmUnpublishAndDelete = async () => {
        setIsUnpublishing(true);
        try {
            // Thu hồi trước
            await unpublishExam(exam.id);
            onAction('unpublish', exam);
            
            // Đóng modal
            setShowDeleteModal(false);
            setDeleteModalType(null);
            
            // Sau đó xóa
            onAction('delete', exam);
        } catch (error) {
            console.error('Error unpublishing exam:', error);
            // Có thể thêm toast notification ở đây
        } finally {
            setIsUnpublishing(false);
        }
    };

    // Render modal cho edit
    const renderEditModal = () => {
        if (!showConfirmModal) return null;

        return createPortal(
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" 
                onClick={handleCancelEdit}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start mb-4">
                        <AlertTriangle className="text-orange-500 mr-3 flex-shrink-0" size={24} />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Xác nhận cập nhật bài thi
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {hasAttempts 
                                    ? (exam.is_published 
                                        ? 'Bài thi đã có người làm. Khi cập nhập bài thi sẽ tạo ra một phiên bản mới của bài thi. Hủy xuất bản trước khi cập nhập'
                                        : 'Bài thi đã có người làm. Khi cập nhập bài thi sẽ tạo ra một phiên bản mới của bài thi.')
                                    : 'Hủy xuất bản trước khi cập nhập'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={handleCancelEdit}
                            disabled={isUnpublishing}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirmEdit}
                            disabled={isUnpublishing}
                            className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isUnpublishing && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isUnpublishing ? 'Đang xử lý...' : 'Xác nhận'}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    // Render modal cho delete action
    const renderDeleteModal = () => {
        if (!showDeleteModal || !deleteModalType) return null;

        const isCannotDelete = deleteModalType === 'cannot-delete';
        const isUnpublishFirst = deleteModalType === 'unpublish-first';

        return createPortal(
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" 
                onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteModalType(null);
                }}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start mb-4">
                        <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${isCannotDelete ? 'bg-red-100' : 'bg-orange-100'}`}>
                            <AlertTriangle className={`${isCannotDelete ? 'text-red-600' : 'text-orange-600'}`} size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {isCannotDelete ? 'Không thể xóa bài thi' : 'Yêu cầu thu hồi trước khi xóa'}
                            </h3>
                            {isCannotDelete && attemptsData && (
                                <div className="space-y-2">
                                    <p className="text-gray-600 text-sm">
                                        Bài thi này đã có người làm và không thể xóa.
                                    </p>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tổng số lượt làm:</span>
                                                <span className="font-semibold text-red-700">{attemptsData.total_attempts}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Số người dùng:</span>
                                                <span className="font-semibold text-red-700">{attemptsData.unique_users}</span>
                                            </div>
                                            {attemptsData.first_attempt_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Lần làm đầu tiên:</span>
                                                    <span className="font-medium text-gray-700">{formatDateTime(attemptsData.first_attempt_at)}</span>
                                                </div>
                                            )}
                                            {attemptsData.last_attempt_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Lần làm gần nhất:</span>
                                                    <span className="font-medium text-gray-700">{formatDateTime(attemptsData.last_attempt_at)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isUnpublishFirst && (
                                <p className="text-gray-600 text-sm">
                                    Bài thi đang được xuất bản. Bạn cần thu hồi bài thi trước khi chuyển vào thùng rác.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteModalType(null);
                            }}
                            disabled={isUnpublishing}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCannotDelete ? 'Đã hiểu' : 'Hủy'}
                        </button>
                        {isUnpublishFirst && (
                            <button
                                onClick={handleConfirmUnpublishAndDelete}
                                disabled={isUnpublishing}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUnpublishing && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isUnpublishing ? 'Đang xử lý...' : 'Thu hồi và xóa'}
                            </button>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <>
            <div 
                onClick={handleCardClick}
                className={`relative group flex-shrink-0 w-[260px] h-[160px] bg-white rounded-xl border-2 transition-all duration-300 flex flex-col overflow-hidden
                    ${isDeleted ? 'opacity-70 cursor-not-allowed' : isChecking ? 'cursor-wait' : 'cursor-pointer hover:shadow-lg hover:border-primary-300'}
                `}
            >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center -z-0">
                <span className="text-7xl font-black text-slate-200 opacity-50 group-hover:opacity-[.86] group-hover:text-slate-300 transition-all duration-300">
                    {exam.exam_type_name}
                </span>
            </div>

            <div className="relative z-10 p-4 flex flex-col flex-grow h-full">
                {/* Top Section */}
                <div className="flex justify-between items-start flex-shrink-0">
                    {/* Title */}
                    <h4 className="font-bold text-gray-900 w-4/5 break-words" title={exam.name}>
                        {exam.name}
                    </h4>
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                        exam.is_published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                        {exam.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                </div>
                
                {/* Spacer */}
                <div className="flex-grow"></div>

                {/* Bottom Section */}
                <div className="flex justify-between items-end flex-shrink-0">
                    {/* Left Info - Vertical layout */}
                    <div className="text-xs text-gray-500 space-y-1 w-[160px]">
                        <div className="flex items-center">
                            <ListChecks size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{exam.total_questions} câu</span>
                        </div>
                        <div className="flex items-center">
                            <Clock size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
                             <span className="truncate">{exam.total_time_minutes} phút</span>
                        </div>
                        <div className="flex items-center">
                            <Layers3 size={14} className="mr-1.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate" title={exam.sections?.map(s => s.name).join(', ')}>
                                {exam.sections?.map(s => s.name).join(', ')}
                            </span>
                        </div>
                        {/* Hiển thị version_at nếu có */}
                        {exam.version_at && (
                            <div className="flex items-center text-red-600 font-medium">
                                <Clock size={14} className="mr-1.5 flex-shrink-0" />
                                {/* <span className="truncate" title={`Phiên bản: ${new Date(exam.version_at).toLocaleString('vi-VN')}`}>
                                    v{new Date(exam.version_at).toLocaleDateString('vi-VN')}
                                </span> */}
                                <span
                                    className="truncate"
                                    title={`Phiên bản: ${formatDateTime(exam.version_at)}`}>
                                    v{formatDateTime(exam.version_at)}
                                </span>
                            </div>
                        )}
                        {!exam.version_at && exam.updated_at && (
                            <div className="flex items-center text-blue-600 font-medium">
                                <Clock size={14} className="mr-1.5 flex-shrink-0" />
                                <span
                                    className="truncate"
                                    title={`Phiên bản: ${formatDateTime(exam.updated_at)}`}>
                                    v{formatDateTime(exam.updated_at)}
                                </span>
                            </div>
                        )}

                    </div>

                    {/* Right Actions */}
                    <div className="self-end exam-card-actions">
                        <ExamCardActions exam={exam} onAction={handleActionWithCheck} hasAttempts={hasAttempts} />
                    </div>
                </div>
            </div>
        </div>

        {/* Render modals using portal */}
        {renderEditModal()}
        {renderDeleteModal()}
        </>
    );
};

export default ExamCard;