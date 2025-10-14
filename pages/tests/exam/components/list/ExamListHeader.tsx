import React from 'react';
import { PlusIcon } from '../../../../../constants';

interface ExamListHeaderProps {
    onCreateExam: () => void;
}

const ExamListHeader: React.FC<ExamListHeaderProps> = ({ onCreateExam }) => {
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Tổng quan các bài thi</h2>
            <button 
                onClick={onCreateExam}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm shadow-sm transition-all"
            >
                <PlusIcon className="w-5 h-5 mr-2"/>
                Tạo bài thi mới
            </button>
        </div>
    );
};

export default ExamListHeader;
