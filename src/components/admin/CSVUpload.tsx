import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2, X, Download, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabaseClient';

interface CSVQuestion {
  topic: string;
  subTopic: string;
  format: string;
  ngn: string;
  difficulty: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5?: string;
  correctOptions: string;
  correctExplanation: string;
  incorrectExplanation: string;
  references: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
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

const CSVUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateQuestion = (question: CSVQuestion, rowIndex: number): ValidationResult => {
    const errors: string[] = [];

    // Required fields
    const requiredFields = [
      'topic', 'subTopic', 'format', 'ngn', 'difficulty', 'questionText',
      'option1', 'option2', 'correctOptions', 'correctExplanation', 'incorrectExplanation'
    ];

    requiredFields.forEach(field => {
      if (!question[field as keyof CSVQuestion]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Format validation
    if (!Object.keys(formatToQuestionType).includes(question.format)) {
      errors.push(`Invalid format: ${question.format}. Must be one of: ${Object.keys(formatToQuestionType).join(', ')}`);
    }

    // NGN validation
    if (!['Yes', 'No'].includes(question.ngn)) {
      errors.push('NGN must be either "Yes" or "No"');
    }

    // Difficulty validation
    if (!['Easy', 'Medium', 'Hard'].includes(question.difficulty)) {
      errors.push('Difficulty must be Easy, Medium, or Hard');
    }

    // Correct options validation
    const correctOptionsPattern = /^\(\d+(?:,\s*\d+)*\)$/;
    if (!correctOptionsPattern.test(question.correctOptions)) {
      errors.push('Correct options must be in format (1) or (1, 2, 3)');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.map(error => `Row ${rowIndex + 2}: ${error}`)
    };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setValidationResults([]);
      setUploadResult(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setValidationResults([]);
      setUploadResult(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const downloadTemplate = () => {
    const headers = [
      'topic',
      'subTopic',
      'format',
      'ngn',
      'difficulty',
      'questionText',
      'option1',
      'option2',
      'option3',
      'option4',
      'option5',
      'correctOptions',
      'correctExplanation',
      'incorrectExplanation',
      'references'
    ];

    const csvContent = [
      headers.join(','),
      'Management of Care,Assignment and Delegation,Multiple Choice,No,Medium,"A charge nurse is assigning patient care for the shift. Which task is appropriate to delegate to a licensed practical nurse (LPN)?","Administer oral medications to a stable patient","Insert a nasogastric tube","Develop the nursing care plan","Complete the initial patient assessment","","(1)","Option 1 is correct. LPNs can administer oral medications to stable patients under the supervision of an RN.","Options 2, 3, and 4 are incorrect. These tasks require RN assessment and judgment.","NCSBN. (2023). National Council of State Boards of Nursing. Guidelines for delegation."'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (file: File): Promise<CSVQuestion[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as CSVQuestion[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setUploadResult(null);
    const results: string[] = [];
    let hasError = false;

    try {
      const questions = await parseCSV(file);
      
      // Validate all questions first
      const validations = questions.map((q, index) => validateQuestion(q, index));
      setValidationResults(validations);

      if (validations.some(v => !v.isValid)) {
        throw new Error('Validation failed. Please fix the errors and try again.');
      }

      // Upload questions
      for (const question of questions) {
        try {
          // Get or create topic and subtopic IDs
          const { data: topicData, error: topicError } = await supabase.rpc(
            'get_or_create_topic_ids',
            { 
              p_topic_name: question.topic,
              p_subtopic_name: question.subTopic
            }
          );

          if (topicError) throw topicError;

          // Insert question
          const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .insert({
              topic: question.topic,
              sub_topic: question.subTopic,
              topic_id: topicData[0].topic_id,
              sub_topic_id: topicData[0].subtopic_id,
              question_format: question.format,
              question_type: formatToQuestionType[question.format],
              ngn: question.ngn.toLowerCase() === 'yes',
              difficulty: question.difficulty.toLowerCase(),
              question_text: question.questionText,
              explanation: {
                correct: [question.correctExplanation],
                incorrect: [question.incorrectExplanation]
              },
              ref_sources: question.references.split('\n').filter(Boolean)
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Parse correct options
          const correctAnswers = question.correctOptions
            .replace(/[()]/g, '')
            .split(',')
            .map(n => parseInt(n.trim()));

          // Prepare answer options
          const options = [
            question.option1,
            question.option2,
            question.option3,
            question.option4
          ];
          if (question.option5) {
            options.push(question.option5);
          }

          // Insert answers
          const answersToInsert = options
            .filter(option => option.trim() !== '')
            .map((option, index) => ({
              question_id: questionData.id,
              option_number: index + 1,
              answer_text: option,
              is_correct: correctAnswers.includes(index + 1)
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

      setUploadResult({
        success: !hasError,
        message: hasError ? 'Some questions failed to upload' : 'All questions uploaded successfully!',
        details: results
      });

      if (!hasError) {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

    } catch (error) {
      console.error('Error uploading questions:', error);
      setUploadResult({
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
      {/* File Upload Area */}
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csvFile"
        />
        <div className="space-y-4">
          <div className="flex justify-center">
            <FileSpreadsheet className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <label 
              htmlFor="csvFile"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Choose CSV File
            </label>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            or drag and drop your file here
          </p>
          {file && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Selected file: {file.name}
            </p>
          )}
        </div>
      </div>

      {/* Template Download */}
      <div className="flex justify-center">
        <button
          onClick={downloadTemplate}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </button>
      </div>

      {/* Validation Results */}
      {validationResults.length > 0 && validationResults.some(v => !v.isValid) && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className="font-medium text-red-800 dark:text-red-200">Validation Errors</h4>
          </div>
          <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
            {validationResults
              .filter(v => !v.isValid)
              .flatMap(v => v.errors)
              .map((error, index) => (
                <li key={index}>{error}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <div className={`p-4 rounded-lg ${
          uploadResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {uploadResult.success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="font-medium">{uploadResult.message}</p>
            <button 
              onClick={() => setUploadResult(null)}
              className="ml-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {uploadResult.details && uploadResult.details.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm ml-8 list-disc">
              {uploadResult.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-5 h-5" />
          {isProcessing ? 'Processing...' : 'Upload Questions'}
        </button>
      </div>
    </div>
  );
};

export default CSVUpload;