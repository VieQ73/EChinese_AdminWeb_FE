
import React, { useState } from 'react';
import { ExamType } from '../../../types';
import ExamTypesManager from './components/ExamTypesManager';
import ExamLevelsManager from './components/ExamLevelsManager';

const ConfigurationTab: React.FC = () => {
    const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột quản lý loại bài thi */}
            <div className="lg:col-span-1">
                <ExamTypesManager
                    selectedExamType={selectedExamType}
                    onSelectExamType={setSelectedExamType}
                />
            </div>

            {/* Cột quản lý cấp độ */}
            <div className="lg:col-span-2">
                <ExamLevelsManager
                    selectedExamType={selectedExamType}
                />
            </div>
        </div>
    );
};

export default ConfigurationTab;
