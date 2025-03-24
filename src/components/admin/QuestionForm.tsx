import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { clientNeeds } from '../../data/clientNeeds';
import type { Category } from '../../data/types';

interface FormData {
  topic: string;
  subTopic: string;
  format: string;
  ngn: boolean;
  difficulty: string;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  correctExplanation: string;
  incorrectExplanation: string;
  references: string[];
}

const initialFormData: FormData = {
  topic: '',
  subTopic: '',
  format: 'Multiple Choice',
  ngn: false,
  difficulty: 'Medium',
  questionText: '',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ],
  correctExplanation: '',
  incorrectExplanation: '',
  references: ['']
};

const validFormats = [
  'Multiple Choice',
  'SATA',
  'Select All That Apply',
  'Hot Spot',
  'Fill in the Blank',
  'Drag and Drop',
  'Chart/Graphic',
  'Graphic Answer',
  'Audio Question',
  'Extended Multiple Response',
  'Extended Drag and Drop',
  'Cloze Dropdown',
  'Matrix Grid',
  'Bow Tie',
  'Enhanced Hot Spot'
];

const QuestionForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategorySelect = (category: Category) => {
    setFormData(prev => ({
      ...prev,
      topic: category.name,
      subTopic: ''
    }));
    setSelectedCategory(category.id);
    
    // Expand the category if it has topics
    if (category.topics && category.topics.length > 0) {
      setExpandedCategories(prev => 
        prev.includes(category.id) ? prev : [...prev, category.id]
      );
    }
  };

  const handleTopicSelect = (topic: { id: string; name: string }) => {
    setFormData(prev => ({
      ...prev,
      subTopic: topic.name
    }));
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, text } : opt
      )
    }));
  };

  const handleOptionCorrectChange = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt
      )
    }));
  };

  const addOption = () => {
    if (formData.options.length < 5) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { text: '', isCorrect: false }]
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, '']
    }));
  };

  const handleReferenceChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => i === index ? value : ref)
    }));
  };

  const removeReference = (index: number) => {
    if (formData.references.length > 1) {
      setFormData(prev => ({
        ...prev,
        references: prev.references.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.topic) errors.push('Topic is required');
    if (!formData.subTopic) errors.push('Sub-topic is required');
    if (!formData.questionText) errors.push('Question text is required');
    if (!formData.correctExplanation) errors.push('Correct explanation is required');
    if (!formData.incorrectExplanation) errors.push('Incorrect explanation is required');
    
    const hasValidOptions = formData.options.every(opt => opt.text.trim() !== '');
    if (!hasValidOptions) errors.push('All options must have text');

    const hasCorrectOption = formData.options.some(opt => opt.isCorrect);
    if (!hasCorrectOption) errors.push('At least one correct option must be selected');

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (errors.length > 0) {
      setResult({
        success: false,
        message: `Validation failed:\n${errors.join('\n')}`
      });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      // Get or create topic IDs
      const { data: topicData, error: topicError } = await supabase.rpc(
        'get_or_create_topic_ids',
        { 
          p_topic_name: formData.topic,
          p_subtopic_name: formData.subTopic
        }
      );

      if (topicError) throw topicError;

      // Insert question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          topic: formData.topic,
          sub_topic: formData.subTopic,
          topic_id: topicData[0].topic_id,
          sub_topic_id: topicData[0].subtopic_id,
          question_format: formData.format,
          question_type: formData.format.toLowerCase().replace(/\s+/g, '_'),
          ngn: formData.ngn,
          difficulty: formData.difficulty.toLowerCase(),
          question_text: formData.questionText,
          explanation: {
            correct: [formData.correctExplanation],
            incorrect: [formData.incorrectExplanation]
          },
          ref_sources: formData.references.filter(ref => ref.trim() !== '')
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Insert answers
      const answersToInsert = formData.options.map((option, index) => ({
        question_id: questionData.id,
        option_number: index + 1,
        answer_text: option.text,
        is_correct: option.isCorrect
      }));

      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersToInsert);

      if (answersError) throw answersError;

      setResult({
        success: true,
        message: 'Question uploaded successfully!'
      });

      // Reset form
      setFormData(initialFormData);
      setSelectedCategory(null);

    } catch (error) {
      console.error('Error uploading question:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload question'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Topic and Subtopic Selection */}
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Select Category and Sub-topic</h3>
        <div className="space-y-4">
          {clientNeeds.map((category) => (
            <div
              key={category.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedCategory === category.id
                  ? 'border-[#2B3467] bg-[#2B3467] bg-opacity-5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#2B3467] hover:bg-opacity-5'
              }`}
            >
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => handleCategorySelect(category)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={selectedCategory === category.id}
                    onChange={() => handleCategorySelect(category)}
                    className="w-5 h-5 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">{category.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                        {category.topicCount} sub-topics
                      </span>
                    </div>
                  </div>
                </div>
                {category.topics && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(category.id);
                    }}
                    className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
                  >
                    <ChevronDown className={`w-5 h-5 transform transition-transform ${
                      expandedCategories.includes(category.id) ? 'rotate-180' : ''
                    }`} />
                  </button>
                )}
              </div>

              {expandedCategories.includes(category.id) && category.topics && (
                <div className="mt-3 ml-8 space-y-2">
                  {category.topics.map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={formData.subTopic === topic.name}
                          onChange={() => handleTopicSelect(topic)}
                          className="w-4 h-4 rounded border-gray-300 text-[#2B3467] focus:ring-[#2B3467]"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {topic.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Question Format and Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Format
          </label>
          <select
            value={formData.format}
            onChange={(e) => handleInputChange('format', e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            {validFormats.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.ngn}
              onChange={(e) => handleInputChange('ngn', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Next Generation NCLEX (NGN)
            </span>
          </label>
        </div>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Question Text
        </label>
        <textarea
          value={formData.questionText}
          onChange={(e) => handleInputChange('questionText', e.target.value)}
          className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          required
        />
      </div>

      {/* Answer Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Answer Options</h3>
          {formData.options.length < 5 && (
            <button
              type="button"
              onClick={addOption}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Option {index + 1}
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={() => handleOptionCorrectChange(index)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      Correct
                    </span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    required
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Correct Answer Explanation
          </label>
          <textarea
            value={formData.correctExplanation}
            onChange={(e) => handleInputChange('correctExplanation', e.target.value)}
            className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Incorrect Answer Explanation
          </label>
          <textarea
            value={formData.incorrectExplanation}
            onChange={(e) => handleInputChange('incorrectExplanation', e.target.value)}
            className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>
      </div>

      {/* References */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            References
          </label>
          <button
            type="button"
            onClick={addReference}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {formData.references.map((reference, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={reference}
                onChange={(e) => handleReferenceChange(index, e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter reference"
              />
              {formData.references.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeReference(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Minus className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`p-4 rounded-lg ${
          result.success 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="whitespace-pre-line">{result.message}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSubmitting ? 'Saving...' : 'Save Question'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;