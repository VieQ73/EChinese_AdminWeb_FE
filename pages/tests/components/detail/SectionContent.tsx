import React from 'react';
import { MockTestDetailSection } from '../../../../types/mocktest';
import { QuestionsList } from './QuestionsList';
import { SectionAudioManager } from '../questions/SectionAudioManager';

interface SectionContentProps {
  section: MockTestDetailSection;
  onQuestionEdit: (sectionIndex: number, partIndex: number, questionIndex: number) => void;
  onSectionAudioChange?: (audioUrl: string) => void;
  sectionIndex: number;
}

export const SectionContent: React.FC<SectionContentProps> = ({
  section,
  onQuestionEdit,
  onSectionAudioChange,
  sectionIndex
}) => {
  // Kiểm tra xem section có phải là phần nghe không (thường có từ "nghe", "listening" trong tên)
  const isListeningSection = section.name.toLowerCase().includes('nghe') || 
                            section.name.toLowerCase().includes('listening') ||
                            section.parts.some(part => part.template_part.input_type === 'audio');
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {section.name}
            </h2>
            {section.description && (
              <p className="text-gray-600 mt-1">{section.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{section.total_questions} câu hỏi</span>
              <span>{section.time_limit} phút</span>
              <span>{section.max_score} điểm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Audio Manager (for listening sections) */}
      {isListeningSection && onSectionAudioChange && (
        <div className="px-6 py-4 border-b border-gray-100">
          <SectionAudioManager
            sectionName={section.name}
            audioUrl={section.audio_url}
            onAudioChange={onSectionAudioChange}
          />
        </div>
      )}

      {/* Parts */}
      <div className="p-6">
        <div className="space-y-6">
          {section.parts.map((part, partIndex) => (
            <div key={part.id} className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {part.template_part.title}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{part.template_part.question_count} câu</span>
                      <span className="capitalize">{part.template_part.question_type.replace('_', ' ')}</span>
                      <span>{part.template_part.input_type}</span>
                    </div>
                    {part.template_part.notes && (
                      <p className="text-sm text-gray-500 mt-2">
                        {part.template_part.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {part.questions.filter(q => q.is_completed).length}/{part.questions.length} hoàn thành
                    </div>
                  </div>
                </div>
              </div>
              
              <QuestionsList
                questions={part.questions}
                onQuestionEdit={(qIndex) => onQuestionEdit(sectionIndex, partIndex, qIndex)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};