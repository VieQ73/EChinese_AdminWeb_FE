import React, { createContext, useContext, useCallback } from 'react';
import type { FormSection } from '../create/hooks/useExamForm';
import { calculateQuestionNumber as calculate } from '../../../utils/numbering';

interface QuestionNumberingContextType {
  getQuestionNumber: (sectionIndex: number, subsectionIndex: number, questionIndex: number) => number;
}

const QuestionNumberingContext = createContext<QuestionNumberingContextType | undefined>(undefined);

export const useQuestionNumbering = () => {
  const context = useContext(QuestionNumberingContext);
  if (!context) {
    throw new Error('useQuestionNumbering must be used within a QuestionNumberingProvider');
  }
  return context;
};

interface QuestionNumberingProviderProps {
  children: React.ReactNode;
  sections: FormSection[];
}

export const QuestionNumberingProvider: React.FC<QuestionNumberingProviderProps> = ({ children, sections }) => {
  const getQuestionNumber = useCallback((sectionIndex: number, subsectionIndex: number, questionIndex: number) => {
    return calculate(sections, sectionIndex, subsectionIndex, questionIndex);
  }, [sections]);

  return (
    <QuestionNumberingContext.Provider value={{ getQuestionNumber }}>
      {children}
    </QuestionNumberingContext.Provider>
  );
};
