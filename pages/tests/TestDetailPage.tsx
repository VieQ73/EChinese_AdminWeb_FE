import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MockTest, MockTestDetailSection, MockTestDetailQuestion } from '../../types/mocktest';
import { fetchMockTestById, fetchTemplateWithStructure } from './api';
import { QuestionFormManager } from './components/questions/QuestionFormManager';
import { AlertTriangle } from 'lucide-react';
import {
  TestHeader,
  SectionSidebar,
  SectionContent,
  EmptyState
} from './components/detail';

export const TestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<MockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [editingQuestion, setEditingQuestion] = useState<{
    question: MockTestDetailQuestion; 
    partIndex: number; 
    questionIndex: number; 
    sectionIndex: number
  } | null>(null);

  // Load test data
  const loadTestData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const testData = await fetchMockTestById(id);
      
      // Nếu test có template_id, load template structure
      if (testData.template_id && !testData.sections) {
        const template = await fetchTemplateWithStructure(testData.template_id);
        
        // Tạo sections từ template nếu chưa có
        const sections: MockTestDetailSection[] = template.structure.sections.map(templateSection => ({
          id: `section_${templateSection.id}`,
          test_id: testData.id,
          template_section_id: templateSection.id,
          name: templateSection.name,
          order_no: templateSection.order_no,
          time_limit: templateSection.time_limit,
          max_score: templateSection.max_score,
          total_questions: templateSection.total_questions,
          description: templateSection.description,
          parts: templateSection.parts.map(templatePart => ({
            id: `part_${templateSection.id}_${templatePart.part_no}`,
            section_id: `section_${templateSection.id}`,
            template_part: templatePart,
            questions: Array.from({ length: templatePart.question_count }, (_, index) => ({
              id: `question_${templateSection.id}_${templatePart.part_no}_${index + 1}`,
              part_id: `part_${templateSection.id}_${templatePart.part_no}`,
              order_no: index + 1,
              correct_answer: templatePart.question_type === 'true_false' ? 'false' : '',
              is_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            completion_status: 'not_started' as const
          })),
          completion_status: 'not_started' as const
        }));
        
        testData.sections = sections;
      }
      
      setTest(testData);
      
      // Set active section to first one
      if (testData.sections && testData.sections.length > 0) {
        setActiveSection(testData.sections[0].id);
      }
      
    } catch (err) {
      setError('Không thể tải thông tin đề thi');
      console.error('Lỗi khi tải đề thi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestData();
  }, [id]);

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!test?.sections) return 0;
    
    const totalQuestions = test.sections.reduce((acc, section) => 
      acc + section.parts.reduce((partAcc, part) => partAcc + part.questions.length, 0), 0
    );
    
    const completedQuestions = test.sections.reduce((acc, section) =>
      acc + section.parts.reduce((partAcc, part) => 
        partAcc + part.questions.filter(q => q.is_completed).length, 0
      ), 0
    );
    
    return totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
  };

  // Save test
  const handleSave = async () => {
    if (!test) return;
    
    try {
      setSaving(true);
      const completion = calculateCompletion();
      
      // Determine completion status
      let completionStatus: MockTest['completion_status'] = 'draft';
      if (completion > 0 && completion < 100) {
        completionStatus = 'incomplete';
      } else if (completion === 100) {
        completionStatus = 'completed';
      }
      
      // TODO: Call update API with sections data
      // await updateMockTestWithSections(test.id, {
      //   sections: test.sections,
      //   completion_status: completionStatus,
      //   completion_percentage: completion
      // });
      
      console.log('Saving test with completion:', completion, 'status:', completionStatus);
      
    } catch (err) {
      setError('Không thể lưu đề thi');
      console.error('Lỗi khi lưu:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle question save
  const handleQuestionSave = (updatedQuestion: MockTestDetailQuestion) => {
    if (!test || !editingQuestion) return;
    
    const newTest = { ...test };
    const { sectionIndex, partIndex, questionIndex } = editingQuestion;
    
    if (newTest.sections?.[sectionIndex]?.parts?.[partIndex]?.questions?.[questionIndex]) {
      newTest.sections[sectionIndex].parts[partIndex].questions[questionIndex] = updatedQuestion;
      
      // Update part completion status
      const part = newTest.sections[sectionIndex].parts[partIndex];
      const completedQuestions = part.questions.filter(q => q.is_completed).length;
      part.completion_status = completedQuestions === 0 ? 'not_started' : 
                               completedQuestions === part.questions.length ? 'completed' : 'in_progress';
      
      // Update section completion status
      const section = newTest.sections[sectionIndex];
      const completedParts = section.parts.filter(p => p.completion_status === 'completed').length;
      section.completion_status = completedParts === 0 ? 'not_started' : 
                                  completedParts === section.parts.length ? 'completed' : 'in_progress';
      
      setTest(newTest);
    }
    
    setEditingQuestion(null);
  };

  // Handle question edit
  const handleQuestionEdit = (sectionIndex: number, partIndex: number, questionIndex: number) => {
    if (!test?.sections?.[sectionIndex]?.parts?.[partIndex]?.questions?.[questionIndex]) return;
    
    const question = test.sections[sectionIndex].parts[partIndex].questions[questionIndex];
    setEditingQuestion({ question, sectionIndex, partIndex, questionIndex });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/tests')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const completion = calculateCompletion();
  const activeSecData = test.sections?.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50">
      <TestHeader
        test={test}
        completion={completion}
        saving={saving}
        onGoBack={() => navigate('/tests')}
        onSave={handleSave}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Sections */}
          <div className="col-span-3">
            <SectionSidebar
              sections={test.sections || []}
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
            />
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {activeSecData ? (
              <SectionContent
                section={activeSecData}
                sectionIndex={test.sections!.findIndex(s => s.id === activeSection)}
                onQuestionEdit={handleQuestionEdit}
                onSectionAudioChange={(audioUrl) => {
                  const newTest = { ...test };
                  const sectionIndex = newTest.sections!.findIndex(s => s.id === activeSection);
                  if (sectionIndex !== -1) {
                    newTest.sections![sectionIndex].audio_url = audioUrl;
                    setTest(newTest);
                  }
                }}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
      
      {/* Question Form Modal */}
      {editingQuestion && (
        <QuestionFormManager
          question={editingQuestion.question}
          templatePart={test.sections![editingQuestion.sectionIndex].parts[editingQuestion.partIndex].template_part}
          onSave={handleQuestionSave}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
};