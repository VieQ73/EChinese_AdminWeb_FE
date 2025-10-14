import React from 'react';
import { useNavigate } from 'react-router';
import { ExamSummary } from '../../../../../types/mocktest_extended';
import { ListChecks, Clock, Layers3 } from 'lucide-react';
import ExamCardActions from './ExamCardActions';

interface ExamCardProps {
    exam: ExamSummary;
    onAction: (action: 'copy' | 'publish' | 'unpublish' | 'delete' | 'restore' | 'delete-permanently', exam: ExamSummary) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onAction }) => {
    const navigate = useNavigate();
    const isDeleted = exam.is_deleted || false;

    const handleCardClick = () => {
        if (!isDeleted) {
            navigate(`/mock-tests/edit/${exam.id}`);
        }
    };

    return (
        <div 
            onClick={handleCardClick}
            className={`relative group flex-shrink-0 w-[260px] h-[160px] bg-white rounded-xl border-2 transition-all duration-300 flex flex-col overflow-hidden
                ${isDeleted ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:border-primary-300'}
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
                    </div>

                    {/* Right Actions */}
                    <div className="self-end">
                        <ExamCardActions exam={exam} onAction={onAction} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamCard;