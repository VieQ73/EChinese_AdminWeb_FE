import React from 'react';
import { ExamSummary } from '../../../../../types/mocktest_extended';
import { CopyIcon, PublishIcon, UnpublishIcon, TrashIcon, RestoreIcon } from '../../../../../constants';

interface ActionButtonProps {
    onClick: () => void;
    title: string;
    icon: React.ReactNode;
    className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, title, icon, className = '' }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        title={title}
        className={`w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors ${className}`}
    >
        {icon}
    </button>
);

interface ExamCardActionsProps {
    exam: ExamSummary;
    onAction: (action: 'copy' | 'publish' | 'unpublish' | 'delete' | 'restore' | 'delete-permanently', exam: ExamSummary) => void;
}

const ExamCardActions: React.FC<ExamCardActionsProps> = ({ exam, onAction }) => {
    const isDeleted = exam.is_deleted || false;

    if (isDeleted) {
        return (
            <div className="flex items-center gap-2">
                <ActionButton
                    onClick={() => onAction('restore', exam)}
                    title="Khôi phục"
                    icon={<RestoreIcon className="w-4 h-4" />}
                    className="hover:text-green-600 hover:bg-green-100"
                />
                <ActionButton
                    onClick={() => onAction('delete-permanently', exam)}
                    title="Xóa vĩnh viễn"
                    icon={<TrashIcon className="w-4 h-4" />}
                    className="hover:text-red-600 hover:bg-red-100"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ActionButton
                onClick={() => onAction('copy', exam)}
                title="Sao chép"
                icon={<CopyIcon className="w-4 h-4" />}
                className="hover:text-blue-600 hover:bg-blue-100"
            />
            <ActionButton
                onClick={() => onAction(exam.is_published ? 'unpublish' : 'publish', exam)}
                title={exam.is_published ? 'Thu hồi' : 'Xuất bản'}
                icon={exam.is_published ? <UnpublishIcon className="w-4 h-4" /> : <PublishIcon className="w-4 h-4" />}
                className="hover:text-green-600 hover:bg-green-100"
            />
            <ActionButton
                onClick={() => onAction('delete', exam)}
                title="Xóa (Chuyển vào thùng rác)"
                icon={<TrashIcon className="w-4 h-4" />}
                className="hover:text-red-600 hover:bg-red-100"
            />
        </div>
    );
};

export default ExamCardActions;
