import React from 'react';
import { ArrowLeft, Clock, Target, Save } from 'lucide-react';
import { MockTest } from '../../../../types/mocktest';

interface TestHeaderProps {
  test: MockTest;
  completion: number;
  saving: boolean;
  onGoBack: () => void;
  onSave: () => void;
}

export const TestHeader: React.FC<TestHeaderProps> = ({
  test,
  completion,
  saving,
  onGoBack,
  onSave
}) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onGoBack}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{test.title}</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className="mr-4">{test.type} {test.level}</span>
                <span className="mr-4 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {test.total_time_limit} phút
                </span>
                <span className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {test.total_max_score} điểm
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Completion Status */}
            <div className="flex items-center">
              <div className="mr-2 text-sm text-gray-600">
                Hoàn thành: {completion}%
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    completion === 100 ? 'bg-green-500' : 
                    completion > 0 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
            
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};