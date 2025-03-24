import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2, X, FileText, Trash2, FileSpreadsheet, FormInput } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { cleanupAllTables } from '../../utils/dbCleanup';
import CSVUpload from './CSVUpload';
import QuestionForm from './QuestionForm';

interface ParsedQuestion {
  topic: string;
  subTopic: string;
  format: string;
  ngn: boolean;
  difficulty: string;
  questionText: string;
  options: string[];
  correctAnswers: number[];
  explanation: {
    correct: string[];
    incorrect: string[];
  };
  references: string[];
}

const formatToQuestionType: Record<string, string> = {
  'Multiple Choice': 'multiple_choice',
  'SATA': 'sata',
  'Select All That Apply': 'sata',
  'Hot Spot': 'hot_spot',
  'Fill in the Blank': 'fill_in_the_blank',
  'Drag and Drop': 'drag_and_drop',
  'Chart/Graphic': 'chart_or_graphic',
  'Graphic Answer': 'graphic_answer',
  'Audio Question': 'audio_question',
  'Extended Multiple Response': 'extended_multiple_response',
  'Extended Drag and Drop': 'extended_drag_and_drop',
  'Cloze Dropdown': 'cloze_dropdown',
  'Matrix Grid': 'matrix_grid',
  'Bow Tie': 'bow_tie',
  'Enhanced Hot Spot': 'enhanced_hot_spot'
};

interface DeleteWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteWarningDialog: React.FC<DeleteWarningDialogProps> = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Delete All Questions?
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 text-sm">
              Warning: This will permanently delete:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
              <li>• All questions from the database</li>
              <li>• All associated answers</li>
              <li>• All question statistics and performance data</li>
              <li>• All related test results</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionUpload = () => {
  const [questionText, setQuestionText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [activeTab, setActiveTab] = useState('template');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [uploadTab, setUploadTab] = useState<'text' | 'csv' | 'form'>('text');

  const handleCleanup = () => {
    setShowDeleteWarning(true);
  };

  const handleConfirmDelete = async () => {
    setIsCleaning(true);
    setResult(null);

    try {
      const { success, error } = await cleanupAllTables();

      if (!success) throw error;

      setResult({
        success: true,
        message: 'Successfully cleared all questions and answers from the database.'
      });
    } catch (error) {
      console.error('Error cleaning up database:', error);
      setResult({
        success: false,
        message: 'Failed to clear database: ' + (error.message || 'Unknown error')
      });
    } finally {
      setIsCleaning(false);
      setShowDeleteWarning(false);
    }
  };

  const parseQuestions = (text: string): ParsedQuestion[] => {
    const questionBlocks = text.split('---').filter(block => block.trim());
    
    return questionBlocks.map(block => {
      try {
        const sections = block.trim().split('\n\n');
        
        const metadata = sections[0].split('\n').reduce((acc, line) => {
          const [key, value] = line.split(': ').map(s => s.trim());
          return { ...acc, [key.toLowerCase()]: value };
        }, {} as Record<string, string>);

        const questionSection = sections.find(s => s.startsWith('Question:'));
        if (!questionSection) {
          throw new Error('Question section not found');
        }
        const questionText = questionSection.replace('Question:', '').trim();

        const optionsSection = sections.find(s => s.startsWith('Options:'));
        if (!optionsSection) {
          throw new Error('Options section not found');
        }

        const options = optionsSection
          .split('\n')
          .slice(1)
          .filter(line => /^\d+\./.test(line.trim()))
          .map(line => line.replace(/^\d+\.\s*/, '').trim());

        if (options.length === 0) {
          throw new Error('No valid answer options found');
        }

        const correctIncorrectSection = sections.find(s => s.startsWith('Correct/Incorrect Options:'));
        if (!correctIncorrectSection) {
          throw new Error('Correct/Incorrect Options section not found');
        }

        const correctAnswers: number[] = [];
        const lines = correctIncorrectSection.split('\n');
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('Correct:')) {
            const matches = trimmedLine.match(/\(([^)]+)\)/);
            if (matches) {
              const numbers = matches[1].split(',').map(n => parseInt(n.trim(), 10));
              correctAnswers.push(...numbers);
            }
          }
        }

        if (correctAnswers.length === 0) {
          throw new Error('No correct answers identified in Correct/Incorrect Options section');
        }

        const explanationSection = sections.find(s => s.startsWith('Explanation:'));
        if (!explanationSection) {
          throw new Error('Explanation section not found');
        }

        const explanationLines = explanationSection.split('\n').filter(line => line.trim());
        const correctExplanations: string[] = [];
        const incorrectExplanations: string[] = [];
        let isCorrectSection = false;
        let isIncorrectSection = false;
        let currentExplanation = '';

        for (let i = 1; i < explanationLines.length; i++) {
          const line = explanationLines[i].trim();
          
          if (line.includes('is correct') || line.includes('are correct')) {
            if (currentExplanation) {
              if (isCorrectSection) correctExplanations.push(currentExplanation);
              if (isIncorrectSection) incorrectExplanations.push(currentExplanation);
            }
            isCorrectSection = true;
            isIncorrectSection = false;
            currentExplanation = '';
            continue;
          }
          
          if (line.includes('is incorrect') || line.includes('are incorrect')) {
            if (currentExplanation) {
              if (isCorrectSection) correctExplanations.push(currentExplanation);
              if (isIncorrectSection) incorrectExplanations.push(currentExplanation);
            }
            isCorrectSection = false;
            isIncorrectSection = true;
            currentExplanation = '';
            continue;
          }

          if (line && (isCorrectSection || isIncorrectSection)) {
            currentExplanation = currentExplanation ? `${currentExplanation} ${line}` : line;
          }
        }

        if (currentExplanation) {
          if (isCorrectSection) correctExplanations.push(currentExplanation);
          if (isIncorrectSection) incorrectExplanations.push(currentExplanation);
        }

        if (correctExplanations.length === 0 && incorrectExplanations.length === 0) {
          throw new Error('No explanations found in the Explanation section');
        }

        const referencesSection = sections.find(s => s.startsWith('References:'));
        const references = referencesSection
          ? referencesSection
              .replace('References:', '')
              .trim()
              .split('\n')
              .map(r => r.trim())
              .filter(Boolean)
          : [];

        return {
          topic: metadata.topic,
          subTopic: metadata['sub-topic'],
          format: metadata['question format'],
          ngn: metadata.ngn.toLowerCase() === 'yes',
          difficulty: metadata.difficulty.toLowerCase(),
          questionText,
          options,
          correctAnswers,
          explanation: {
            correct: correctExplanations,
            incorrect: incorrectExplanations
          },
          references
        };
      } catch (error) {
        throw new Error(`Failed to parse question block: ${error.message}`);
      }
    });
  };

  const handleUpload = async () => {
    setIsProcessing(true);
    setResult(null);

    const results: string[] = [];
    let hasError = false;

    try {
      const questions = parseQuestions(questionText);
      
      for (const question of questions) {
        try {
          const questionType = formatToQuestionType[question.format];
          if (!questionType) {
            throw new Error(`Invalid question format: ${question.format}. Must be one of: ${Object.keys(formatToQuestionType).join(', ')}`);
          }

          const { data: topicData, error: topicError } = await supabase.rpc(
            'get_or_create_topic_ids',
            { 
              p_topic_name: question.topic,
              p_subtopic_name: question.subTopic
            }
          );

          if (topicError) throw topicError;

          const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .insert({
              topic: question.topic,
              sub_topic: question.subTopic,
              topic_id: topicData[0].topic_id,
              sub_topic_id: topicData[0].subtopic_id,
              question_format: question.format,
              question_type: questionType,
              ngn: question.ngn,
              difficulty: question.difficulty,
              question_text: question.questionText,
              explanation: question.explanation,
              ref_sources: question.references
            })
            .select()
            .single();

          if (questionError) throw questionError;

          const answersToInsert = question.options.map((option, index) => ({
            question_id: questionData.id,
            option_number: index + 1,
            answer_text: option,
            is_correct: question.correctAnswers.includes(index + 1)
          }));

          const { error: answersError } = await supabase
            .from('answers')
            .insert(answersToInsert);

          if (answersError) throw answersError;

          results.push(`Question "${question.questionText.slice(0, 50)}..." uploaded successfully`);
        } catch (error) {
          hasError = true;
          results.push(`Failed to upload question "${question.questionText.slice(0, 50)}...": ${error.message}`);
        }
      }

      setResult({
        success: !hasError,
        message: hasError ? 'Some questions failed to upload' : 'All questions uploaded successfully!',
        details: results
      });

      if (!hasError) {
        setQuestionText('');
      }

    } catch (error) {
      console.error('Error uploading questions:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload questions',
        details: results
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upload Questions</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Add questions to the database using your preferred method
          </p>
        </div>
        <button
          onClick={handleCleanup}
          disabled={isCleaning}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-5 h-5" />
          {isCleaning ? 'Cleaning...' : 'Clear All Questions'}
        </button>
      </div>

      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 px-6" aria-label="Upload Methods">
            <button
              onClick={() => setUploadTab('text')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                uploadTab === 'text'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Text Format
              </div>
            </button>
            <button
              onClick={() => setUploadTab('csv')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                uploadTab === 'csv'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                CSV Upload
              </div>
            </button>
            <button
              onClick={() => setUploadTab('form')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                uploadTab === 'form'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FormInput className="w-5 h-5" />
                Form Entry
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Text Format Tab */}
          {uploadTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="questionText" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Question Text
                </label>
                <textarea
                  id="questionText"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full h-96 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 font-mono"
                  placeholder="Paste formatted questions here..."
                />
              </div>

              {result && (
                <div className={`p-4 rounded-lg ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0" />
                    )}
                    <p className="font-medium">{result.message}</p>
                    <button 
                      onClick={() => setResult(null)}
                      className="ml-auto"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {result.details && result.details.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm ml-8 list-disc">
                      {result.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={isProcessing || !questionText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : 'Upload Questions'}
                </button>
              </div>
            </div>
          )}

          {/* CSV Upload Tab */}
          {uploadTab === 'csv' && <CSVUpload />}

          {/* Form Entry Tab */}
          {uploadTab === 'form' && <QuestionForm />}
        </div>
      </div>

      {/* Format Help Section */}
      {uploadTab === 'text' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
              Question Format Help
            </h3>
          </div>

          <div className="border-b border-blue-200 dark:border-blue-800 mb-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('template')}
                className={`${
                  activeTab === 'template'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Template
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`${
                  activeTab === 'examples'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Examples
              </button>
              <button
                onClick={() => setActiveTab('formats')}
                className={`${
                  activeTab === 'formats'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Valid Formats
              </button>
            </nav>
          </div>

          {activeTab === 'template' && (
            <>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                Separate multiple questions using three dashes (---). Each question must follow this exact format:
              </p>
              <pre className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap font-mono bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
{`Topic: [Topic Name]
Sub-Topic: [Sub-Topic Name]
Question Format: [Format Type]
NGN: [Yes/No]
Difficulty: [Easy/Medium/Hard]

Question:
[Question Text]

Options:
1. [Option 1]
2. [Option 2]
3. [Option 3]
4. [Option 4]

Correct/Incorrect Options:
Correct: (1, 3)
Incorrect: (2, 4)

Explanation:
Options 1 and 3 are correct.
[Detailed explanation for why these options are correct]

Options 2 and 4 are incorrect.
[Detailed explanation for why these options are incorrect]

References:
[Reference 1]
[Reference 2]`}</pre>
            </>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Example 1: Multiple Choice Question</h4>
                <pre className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap font-mono bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
{`Topic: Pharmacological and Parenteral Therapies
Sub-Topic: Medication Administration
Question Format: Multiple Choice
NGN: No
Difficulty: Medium

Question:
A client with type 2 diabetes is prescribed metformin 850mg PO BID. The medication is available as 500mg tablets. How many tablets should the nurse administer for one dose?

Options:
1. 1 tablet
2. 1.7 tablets
3. 2 tablets
4. 2.5 tablets

Correct/Incorrect Options:
Correct: (2)
Incorrect: (1, 3, 4)

Explanation:
Option 2 is correct.
Using the formula (Desired/Have × 1), we calculate: 850mg/500mg × 1 = 1.7 tablets. This is the exact amount needed to provide the prescribed dose of 850mg.

Options 1, 3, and 4 are incorrect.
These options would result in incorrect dosing. One tablet (500mg) is insufficient, while two tablets (1000mg) or 2.5 tablets (1250mg) would exceed the prescribed dose.

References:
Burchum, J., & Rosenthal, L. (2022). Lehne's pharmacology for nursing care (11th ed.)
Potter, P. A., & Perry, A. G. (2021). Fundamentals of nursing (10th ed.)`}</pre>
              </div>

              <div>
                <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">Example 2: SATA Question</h4>
                <pre className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap font-mono bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
{`Topic: Safety and Infection Control
Sub-Topic: Standard Precautions
Question Format: Select All That Apply
NGN: Yes
Difficulty: Hard

Question:
A nurse is caring for a client with active tuberculosis. Which interventions should the nurse implement? Select all that apply.

Options:
1. Place the client in a negative pressure room
2. Wear an N95 respirator when entering the room
3. Have the client wear a surgical mask during transport
4. Use standard precautions only
5. Place the client in a positive pressure room

Correct/Incorrect Options:
Correct: (1, 2, 3)
Incorrect: (4, 5)

Explanation:
Options 1, 2, and 3 are correct.
Tuberculosis requires airborne precautions including negative pressure isolation, N95 respirator use by healthcare workers, and a surgical mask on the patient during transport to prevent transmission.

Options 4 and 5 are incorrect.
Standard precautions alone are insufficient for TB, and a positive pressure room would increase transmission risk by pushing contaminated air into the hallway.

References:
CDC. (2023). Guidelines for preventing the transmission of Mycobacterium tuberculosis in health-care settings
Siegel, J. D., et al. (2007). Guideline for isolation precautions: Preventing transmission of infectious agents in healthcare settings`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'formats' && (
            <div className="space-y-4">
              <p className="text-blue-700 dark:text-blue-300">
                The following question formats are supported. Use the exact format name as shown below:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formatToQuestionType).map(format => (
                  <div key={format} className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">{format}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">Important Notes:</h4>
                <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>Format names are case-sensitive</li>
                  <li>Use "SATA" or "Select All That Apply" for multiple response questions</li>
                  <li>NGN questions require additional clinical judgment elements</li>
                  <li>Each section must be separated by exactly one blank line</li>
                  <li>Options must be numbered starting from 1</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <DeleteWarningDialog 
        isOpen={showDeleteWarning}
        onClose={() => setShowDeleteWarning(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isCleaning}
      />
    </div>
  );
};

export default QuestionUpload;