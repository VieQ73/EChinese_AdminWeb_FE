import React from 'react';
import { CheckCircle } from 'lucide-react';
import { MockTestDetailSection } from '../../../../types/mocktest';

interface SectionSidebarProps {
  sections: MockTestDetailSection[];
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
}

export const SectionSidebar: React.FC<SectionSidebarProps> = ({
  sections,
  activeSection,
  onSectionSelect
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Các phần thi</h3>
      </div>
      
      <div className="p-2">
        {sections?.map((section) => {
          const sectionCompletion = section.parts.reduce((acc, part) => {
            const completed = part.questions.filter(q => q.is_completed).length;
            return acc + (completed / part.questions.length) * 100;
          }, 0) / section.parts.length;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionSelect(section.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                activeSection === section.id 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{section.name}</span>
                {sectionCompletion === 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : sectionCompletion > 0 ? (
                  <div className="w-4 h-4 rounded-full bg-yellow-200 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
              </div>
              
              <div className="text-xs text-gray-500 mb-2">
                {section.total_questions} câu • {section.time_limit} phút
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${sectionCompletion}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};