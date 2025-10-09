import React, { useState } from 'react';
import { Edit2, Trash2, Pin, Eye, EyeOff, Calendar } from 'lucide-react';
import { LEVEL_COLORS } from '../tipApi';
import type { Tip } from '../../../types';

interface TipCardProps {
  tip: Tip;
  onEdit?: (tip: Tip) => void;
  onDelete?: (tip: Tip) => void;
  onTogglePin?: (tip: Tip) => void;
}

const TipCard: React.FC<TipCardProps> = ({ tip, onEdit, onDelete, onTogglePin }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const contentHtml = (tip.content as any)?.html || '';
  const hasAnswer = tip.answer && tip.answer.trim().length > 0;
  const isRiddleTopic = tip.topic === 'Câu đố';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex">
        <div className="flex-1 p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{tip.topic}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${LEVEL_COLORS[tip.level] || 'bg-gray-100'}`}>{tip.level}</span>
            {tip.is_pinned && <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1"><Pin size={12} /> Đã ghim</span>}
          </div>
          <div className="space-y-3">
            {contentHtml ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} /> : <p className="italic text-gray-400">Không có nội dung</p>}
            {isRiddleTopic && hasAnswer && (
              <div>
                <button onClick={() => setShowAnswer(!showAnswer)} className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg">
                  {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />} {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
                </button>
                {showAnswer && (
                  <div className="mt-2 bg-green-50 p-3 border-l-4 border-green-400 rounded-r-lg">
                    <p className="text-sm font-medium text-green-700">💡 Đáp án:</p>
                    <p className="text-sm text-green-800">{tip.answer}</p>
                  </div>
                )}
              </div>
            )}
            {!isRiddleTopic && hasAnswer && (
              <div className="bg-gray-50 p-3 border-l-4 border-gray-400 rounded-r-lg">
                <p className="text-sm font-medium text-gray-600">Ghi chú:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{tip.answer}</p>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-400 pt-2 border-t mt-2">
            <Calendar size={12} className="mr-1" /> ID: {tip.id}
          </div>
        </div>
        <div className="flex flex-col gap-1 p-3 border-l bg-gray-50/50">
          {onTogglePin && <button onClick={() => onTogglePin(tip)} title={tip.is_pinned ? 'Bỏ ghim' : 'Ghim'} className={`p-2 rounded-lg ${tip.is_pinned ? 'text-yellow-500 hover:bg-yellow-100' : 'text-gray-400 hover:bg-gray-100'}`}><Pin size={16} className={tip.is_pinned ? 'fill-current' : ''} /></button>}
          {onEdit && <button onClick={() => onEdit(tip)} title="Sửa" className="p-2 rounded-lg text-blue-600 hover:bg-blue-100"><Edit2 size={16} /></button>}
          {onDelete && <button onClick={() => onDelete(tip)} title="Xóa" className="p-2 rounded-lg text-red-600 hover:bg-red-100"><Trash2 size={16} /></button>}
        </div>
      </div>
    </div>
  );
};

export default TipCard;