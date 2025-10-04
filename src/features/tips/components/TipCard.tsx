import React, { useState } from 'react';
import { Edit2, Trash2, Pin, PinOff, Eye, EyeOff, Calendar, Hash } from 'lucide-react';
import { LEVEL_COLORS } from '../tipApi';
import type { Tip } from '../../../types/entities';

interface TipCardProps {
  tip: Tip;
  onEdit?: (tip: Tip) => void;
  onDelete?: (tip: Tip) => void;
  onTogglePin?: (tip: Tip) => void;
}

/**
 * Component hiển thị một tip dạng horizontal card với tính năng xem đáp án
 */
const TipCard: React.FC<TipCardProps> = ({
  tip,
  onEdit,
  onDelete,
  onTogglePin
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  // Lấy HTML content từ JSON
  const getContentHtml = (content: any): string => {
    if (typeof content === 'object' && content && 'html' in content) {
      return content.html;
    }
    return content?.toString() || '';
  };

  const contentHtml = getContentHtml(tip.content);
  const hasAnswer = tip.answer && tip.answer.trim().length > 0;
  const isRiddleTopic = tip.topic === 'Câu đố';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Left side: Content */}
        <div className="flex-1 p-5 space-y-4">
          {/* Header badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {tip.topic}
            </span>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              LEVEL_COLORS[tip.level] || 'bg-gray-100 text-gray-800'
            }`}>
              {tip.level}
            </span>

            {tip.is_pinned && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                <Pin size={12} />
                Đã ghim
              </span>
            )}
          </div>

          {/* Main content */}
          <div className="space-y-3">
            <div className="text-gray-700 leading-relaxed">
              {contentHtml ? (
                <div 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <p className="text-gray-400 italic text-sm">Không có nội dung</p>
              )}
            </div>

            {/* Answer section for riddles */}
            {isRiddleTopic && hasAnswer && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
                </button>
                
                {showAnswer && (
                  <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400 animate-in slide-in-from-top-1">
                    <p className="text-sm font-medium text-green-700 mb-1">💡 Đáp án:</p>
                    <p className="text-sm text-green-800">{tip.answer}</p>
                  </div>
                )}
              </div>
            )}

            {/* Answer preview for non-riddle topics */}
            {!isRiddleTopic && hasAnswer && (
              <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-400">
                <p className="text-sm font-medium text-gray-600 mb-1">Ghi chú:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{tip.answer}</p>
              </div>
            )}
          </div>

          {/* Footer metadata */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>ID: {tip.id}</span>
            </div>
          </div>
        </div>

        {/* Right side: Action buttons */}
        <div className="flex flex-col gap-1 p-3 border-l border-gray-100">
          {onTogglePin && (
            <button
              onClick={() => onTogglePin(tip)}
              title={tip.is_pinned ? 'Bỏ ghim' : 'Ghim tip'}
              className={`p-2 rounded-full transition-colors ${
                tip.is_pinned 
                  ? 'text-yellow-600 hover:bg-yellow-50' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {tip.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(tip)}
              title="Chỉnh sửa"
              className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(tip)}
              title="Xóa"
              className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TipCard;