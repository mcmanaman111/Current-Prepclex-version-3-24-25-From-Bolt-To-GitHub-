import { mockQuestions, mockUserProgress } from './mockData';
import { shuffleArray } from '../utils/examUtils';
import { supabase } from '../lib/supabaseClient';
import { questionTypes as mockQuestionTypes } from '../data/testData';
import { clientNeeds as mockClientNeeds } from '../data/clientNeeds';
import type { QuestionType, Topic, Category } from '../data/types';

// Set to false to use real data from Supabase
const USE_MOCK_DATA = false; // Using real data from Supabase

export interface TestSelectionCriteria {
  selectedQuestions: string[];   // Question types (unused, correct, etc.)
  selectedTopics: string[];      // Main topic IDs
  selectedSubtopics: string[];   // Subtopic IDs
  questionCount: number;         // Number of questions to return
  ngnEnabled: boolean;           // Whether NGN questions are enabled
  ngnOnly: boolean;              // Whether to return only NGN questions
}

export interface Question {
  id: number;
  question_text: string;
  topic: string;
  sub_topic: string;
  topic_id: number;
  sub_topic_id: number;
  question_type: string;
  difficulty: string;
  ngn: boolean;
}

export interface UserProgress {
  name: string;
  correctPercentage: number;
  totalQuestions: number;
  unusedQuestions: number;
  usedQuestions: number;
  omittedQuestions: number;
  recentTests: {
    date: string;
    score: number;
    totalQuestions: number;
  }[];
}

/**
 * Fetches all available questions from the database
 */
export const fetchQuestions = async (): Promise<Question[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockQuestions);
  }

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

/**
 * Fetches questions for a test based on selection criteria
 * This function applies filters and randomly selects questions
 * to match the requested count
 */
/**
 * Extended Question interface that includes answer choices
 */
export interface QuestionWithChoices extends Question {
  choices: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}

/**
 * Fetches questions for a test based on selection criteria
 * This function applies filters, randomly selects questions
 * to match the requested count, and fetches associated answers
 */
export const fetchQuestionsForTest = async (
  criteria: TestSelectionCriteria
): Promise<QuestionWithChoices[]> => {
  const {
    selectedQuestions,
    selectedTopics,
    selectedSubtopics,
    questionCount,
    ngnEnabled,
    ngnOnly
  } = criteria;
  
  if (USE_MOCK_DATA) {
    // For mock data, simulate filtering and selection
    let filteredQuestions = [...mockQuestions];
    
    // Filter by NGN status
    if (ngnOnly) {
      filteredQuestions = filteredQuestions.filter(q => q.ngn === true);
    } else if (!ngnEnabled) {
      filteredQuestions = filteredQuestions.filter(q => q.ngn !== true);
    }
    
    // Filter by topics/subtopics
    if (selectedTopics.length > 0 || selectedSubtopics.length > 0) {
      filteredQuestions = filteredQuestions.filter(q => {
        // Convert to string for comparison
        const topicId = q.topic_id.toString();
        const subtopicId = q.sub_topic_id?.toString();
        
        // Check if the question's topic or subtopic is in the selected lists
        return selectedTopics.includes(topicId) || 
               (subtopicId && selectedSubtopics.includes(subtopicId));
      });
    }
    
    // Shuffle the questions to randomize selection
    const shuffledQuestions = shuffleArray([...filteredQuestions]);
    
    // Take only the requested number of questions
    return shuffledQuestions.slice(0, questionCount);
  }
  
  try {
    console.log('Fetching questions with criteria:', criteria);
    
    // Start building the query
    let query = supabase.from('questions').select('*');
    
    // Apply NGN filter
    if (ngnOnly) {
      query = query.eq('ngn', true);
    } else if (!ngnEnabled) {
      query = query.eq('ngn', false);
    }
    
    // Apply topic/subtopic filters
    if (selectedTopics.length > 0) {
      query = query.in('topic_id', selectedTopics.map(id => parseInt(id)));
    }
    
    if (selectedSubtopics.length > 0) {
      query = query.in('sub_topic_id', selectedSubtopics.map(id => parseInt(id)));
    }
    
    // Execute the query to get questions - include additional fields like references
    const { data: questionsData, error: questionsError } = await query;
    
    console.log("Questions data from DB:", questionsData);
    // Log the first question to check if it has references
    if (questionsData && questionsData.length > 0) {
      console.log("First question details:", {
        id: questionsData[0].id,
        hasReferences: questionsData[0].hasOwnProperty('references'),
        references: questionsData[0].references,
        columns: Object.keys(questionsData[0])
      });
    }
    
    if (questionsError) throw questionsError;
    
    if (!questionsData || questionsData.length === 0) {
      console.warn('No questions matched the selection criteria');
      return [];
    }
    
    // If we have more questions than needed, randomly select
    let selectedQuestions = questionsData;
    if (questionsData.length > questionCount) {
      // Shuffle and take only what we need
      selectedQuestions = shuffleArray([...questionsData]).slice(0, questionCount);
    }
    
    console.log(`Selected ${selectedQuestions.length} questions, now fetching their answers`);
    
    // Get the IDs of selected questions to fetch their answers
    const questionIds = selectedQuestions.map(q => q.id);
    
    // Fetch answers for these questions
    const { data: answersData, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .in('question_id', questionIds);
    
    console.log("Answers data fetched:", answersData);
    
    if (answersError) throw answersError;
    
    console.log(`Fetched ${answersData?.length || 0} answers for ${questionIds.length} questions`);
    
    // Group answers by question_id
    const answersByQuestionId = (answersData || []).reduce((acc, answer) => {
      if (!acc[answer.question_id]) {
        acc[answer.question_id] = [];
      }
      acc[answer.question_id].push(answer);
      return acc;
    }, {} as Record<number, any[]>);
    
    // Combine questions with their answers
    const questionsWithChoices = selectedQuestions.map(question => {
      const questionAnswers = answersByQuestionId[question.id] || [];
      
      // Sort answers by option_number if available
      const sortedAnswers = [...questionAnswers].sort((a, b) => 
        (a.option_number || 0) - (b.option_number || 0)
      );
      
      // Format answers as choices
      const choices = sortedAnswers.map(answer => ({
        text: answer.answer_text || '',
        isCorrect: answer.is_correct || false
      }));
      
      // If no answers are found, provide empty choices array
      if (choices.length === 0) {
        console.warn(`No answers found for question ID ${question.id}`);
      }
      
      // Process explanation field - try to parse if it's JSON
      let explanation = question.explanation || "No explanation available";
      
      // If it's a JSON string, we leave it as is to be processed by the component
      // The ExplanationSection component will handle parsing
      
      // Get references from the ref_sources column in the database
      // The MCP query showed that references are stored in the ref_sources column
      const hasRefSources = question.hasOwnProperty('ref_sources') && question.ref_sources;
      
      // Process references from ref_sources
      let references = [];
      if (hasRefSources) {
        console.log("Found ref_sources:", question.ref_sources);
        
        // If ref_sources is already an array, use it directly
        if (Array.isArray(question.ref_sources)) {
          references = question.ref_sources;
        } 
        // If it's a string, split it into an array (if it contains line breaks)
        else if (typeof question.ref_sources === 'string') {
          references = question.ref_sources.includes('\n') 
            ? question.ref_sources.split('\n') 
            : [question.ref_sources];
        }
      }
      
      console.log("Processed references for question:", question.id, references);
      
      // Get time taken if available, or default to formatted time
      let time_taken = question.time_taken || "2:01";
      
      return {
        ...question,
        choices: choices.length > 0 ? choices : [
          { text: "No answer options available", isCorrect: true },
          { text: "Please report this issue", isCorrect: false }
        ],
        explanation: explanation,
        references: references,
        time_taken: time_taken
      };
    });
    
    return questionsWithChoices;
  } catch (error) {
    console.error('Error fetching questions for test:', error);
    
    // Fall back to mock implementation
    let filteredQuestions = [...mockQuestions];
    
    if (ngnOnly) {
      filteredQuestions = filteredQuestions.filter(q => q.ngn === true);
    } else if (!ngnEnabled) {
      filteredQuestions = filteredQuestions.filter(q => q.ngn !== true);
    }
    
    const shuffledQuestions = shuffleArray([...filteredQuestions]);
    return shuffledQuestions.slice(0, questionCount);
  }
};

/**
 * Fetches user progress from the database
 */
export const fetchUserProgress = async (userId: string): Promise<UserProgress> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockUserProgress);
  }

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    // Map database schema to the expected frontend format
    return {
      name: "User", // Get from profiles table if needed
      correctPercentage: data.average_score || 0,
      totalQuestions: data.total_questions_completed || 0,
      unusedQuestions: 0, // Calculate from question_status table
      usedQuestions: data.total_questions_completed || 0,
      omittedQuestions: 0, // Calculate from skipped_questions table
      recentTests: [] // Could fetch from test_statistics
    };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

/**
 * Fetches question counts by status (unused, correct, incorrect, etc.)
 * Uses question_status, marked_questions, and skipped_questions tables
 */
export const fetchQuestionTypeData = async (userId: string): Promise<{
  questionTypes: QuestionType[],
  standardQuestionTypes: QuestionType[]
}> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve({
      questionTypes: mockQuestionTypes,
      standardQuestionTypes: mockQuestionTypes.map(type => ({
        ...type,
        count: type.id === 'unused' ? 13 : 0 // Out of 19 total, 13 are standard questions
      }))
    });
  }

  try {
    // Get all questions with their NGN status
    const { data: allQuestionsData, error: questionsError } = await supabase
      .from('questions')
      .select('id, ngn');
    
    if (questionsError) throw questionsError;
    
    const totalQuestions = allQuestionsData?.length || 0;
    const ngnQuestions = allQuestionsData?.filter(q => q.ngn) || [];
    const standardQuestions = allQuestionsData?.filter(q => !q.ngn) || [];
    const ngnQuestionCount = ngnQuestions.length;
    const standardQuestionCount = standardQuestions.length;
    
    // Get all question_status entries for current user
    const { data: statusData, error: statusError } = await supabase
      .from('question_status')
      .select('question_id, status, attempts_count, correct_count')
      .eq('user_id', userId);
    
    if (statusError) throw statusError;
    
    // Map questions to their statuses
    const questionMap = new Map();
    statusData?.forEach(entry => {
      questionMap.set(entry.question_id, entry);
    });
    
    // Get marked questions
    const { data: markedData, error: markedError } = await supabase
      .from('marked_questions')
      .select('question_id')
      .eq('user_id', userId);
    
    if (markedError) throw markedError;
    
    const markedQuestions = new Set(markedData?.map(entry => entry.question_id) || []);
    
    // Get skipped questions
    const { data: skippedData, error: skippedError } = await supabase
      .from('skipped_questions')
      .select('question_id')
      .eq('user_id', userId);
    
    if (skippedError) throw skippedError;
    
    const skippedQuestions = new Set(skippedData?.map(entry => entry.question_id) || []);
    
    // Calculate counts for all questions
    let usedCount = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let markedCount = markedQuestions.size;
    let skippedCount = skippedQuestions.size;

    // Separate counts for standard (non-NGN) questions
    let standardUsedCount = 0;
    let standardCorrectCount = 0;
    let standardIncorrectCount = 0;
    let standardMarkedCount = 0;
    let standardSkippedCount = 0;
    
    // Process all questions
    allQuestionsData?.forEach(question => {
      const status = questionMap.get(question.id);
      const isNgn = question.ngn === true;
      
      // Process the status for both all questions and standard questions
      if (status) {
        usedCount++;
        if (!isNgn) standardUsedCount++;
        
        if (status.status === 'correct' || (status.attempts_count > 0 && status.correct_count > 0)) {
          correctCount++;
          if (!isNgn) standardCorrectCount++;
        } else if (status.status === 'incorrect' || (status.attempts_count > 0 && status.correct_count === 0)) {
          incorrectCount++;
          if (!isNgn) standardIncorrectCount++;
        }
      }
      
      // Process marked and skipped questions for standard questions only
      if (!isNgn) {
        if (markedQuestions.has(question.id)) {
          standardMarkedCount++;
        }
        
        if (skippedQuestions.has(question.id)) {
          standardSkippedCount++;
        }
      }
    });
    
    // Calculate unused questions
    const unusedCount = totalQuestions - usedCount;
    const standardUnusedCount = standardQuestionCount - standardUsedCount;
    
    // All questions including NGN
    const questionTypes = [
      { id: 'unused', label: 'Unused', count: unusedCount },
      { id: 'correct', label: 'Correct', count: correctCount },
      { id: 'incorrect', label: 'Incorrect', count: incorrectCount },
      { id: 'marked', label: 'Marked', count: markedCount },
      { id: 'skipped', label: 'Skipped', count: skippedCount }
    ];
    
    // Standard questions only (no NGN)
    const standardQuestionTypes = [
      { id: 'unused', label: 'Unused', count: standardUnusedCount },
      { id: 'correct', label: 'Correct', count: standardCorrectCount },
      { id: 'incorrect', label: 'Incorrect', count: standardIncorrectCount },
      { id: 'marked', label: 'Marked', count: standardMarkedCount },
      { id: 'skipped', label: 'Skipped', count: standardSkippedCount }
    ];
    
    return { questionTypes, standardQuestionTypes };
  } catch (error) {
    console.error('Error fetching question type data:', error);
    // Return mock data as fallback
    return {
      questionTypes: mockQuestionTypes,
      standardQuestionTypes: mockQuestionTypes.map(type => ({
        ...type,
        count: type.id === 'unused' ? 13 : 0 // Out of 19 total, 13 are standard questions
      }))
    };
  }
};

/**
 * Fetches the total count of NGN questions and their distribution by topic
 */
/**
 * Fetches unused questions specifically for Quick Start functionality
 * This function retrieves questions the user hasn't seen before,
 * applying NGN filters if specified, and returns randomly selected questions
 * with their corresponding answers
 */
export const fetchUnusedQuestionsForQuickStart = async (
  userId: string,
  questionCount: number,
  includeNGN: boolean,
  minutesPerQuestion: number = 2
): Promise<QuestionWithChoices[]> => {
  if (USE_MOCK_DATA) {
    // For mock data, simulate filtering for unused questions
    // Most mock questions don't have the ngn property, so treat them as non-NGN by default
    const filteredQuestions = mockQuestions.map((q, index) => ({
      ...q,
      // Add ngn property explicitly if missing (every 5th question is NGN for testing)
      ngn: q.ngn !== undefined ? q.ngn : index % 5 === 0,
      // Add topic_id if missing
      topic_id: q.topic_id || Math.floor(index / 5) + 1,
      // Add sub_topic_id if missing
      sub_topic_id: q.sub_topic_id || (index % 5) + 1
    })).filter(q => {
      // Filter based on NGN setting
      if (!includeNGN && q.ngn) return false;
      return true;
    });
    
    console.log(`Found ${filteredQuestions.length} questions matching criteria (includeNGN=${includeNGN})`);
    
    // Ensure we're getting the full requested count (or max available)
    const actualCount = Math.min(questionCount, filteredQuestions.length);
    console.log(`User requested ${questionCount} questions, selecting ${actualCount}`);
    
    // Shuffle with 3 passes for better randomization
    console.log("Quick Start with mock data - pre-shuffle IDs:", filteredQuestions.map(q => q.id).join(', '));
    const shuffledQuestions = shuffleArray([...filteredQuestions], 3);
    console.log("Quick Start with mock data - post-shuffle IDs:", shuffledQuestions.map(q => q.id).join(', '));
    
    // Take the requested number of questions
    const selectedQuestions = shuffledQuestions.slice(0, actualCount);
    console.log("Quick Start final selection - count:", selectedQuestions.length);
    console.log("Quick Start final selection IDs:", selectedQuestions.map(q => q.id).join(', '));
    
    return selectedQuestions;
  }
  
  try {
    console.log('Fetching unused questions for Quick Start with params:', {
      userId,
      questionCount,
      includeNGN
    });
    
    // 1. Get question IDs that the user has already answered or interacted with
    const { data: usedQuestionsData, error: usedError } = await supabase
      .from('question_status')
      .select('question_id')
      .eq('user_id', userId);
    
    if (usedError) throw usedError;
    
    // Create a set of used question IDs for fast lookup
    const usedQuestionIds = new Set(usedQuestionsData?.map(item => item.question_id) || []);
    
    // 2. Base query for all questions
    let query = supabase.from('questions').select('*');
    
    // 3. Apply NGN filter if needed
    if (!includeNGN) {
      query = query.eq('ngn', false);
    }
    
    // 4. Execute the query to get all potential questions
    const { data: allQuestionsData, error: questionsError } = await query;
    
    if (questionsError) throw questionsError;
    
    if (!allQuestionsData || allQuestionsData.length === 0) {
      console.warn('No questions found that match the criteria');
      return [];
    }
    
    // 5. Filter out questions that the user has already used
    const unusedQuestions = allQuestionsData.filter(q => !usedQuestionIds.has(q.id));
    
    console.log(`Found ${unusedQuestions.length} unused questions out of ${allQuestionsData.length} total`);
    
    if (unusedQuestions.length === 0) {
      console.warn('No unused questions available for this user');
      return [];
    }
    
    // 6. Shuffle and select the requested number of questions
    // Apply improved shuffling with multiple passes
    console.log("Unused questions before shuffle:", unusedQuestions.map(q => q.id).join(', '));
    
    // Use the enhanced shuffling with 3 passes
    const shuffledQuestions = shuffleArray([...unusedQuestions], 3);
    console.log("Unused questions after shuffle:", shuffledQuestions.map(q => q.id).join(', '));
    
    // Select the requested number of questions
    const selectedQuestions = shuffledQuestions
      .slice(0, Math.min(questionCount, unusedQuestions.length));
    
    console.log("Final selected questions for Quick Start:", selectedQuestions.map(q => q.id).join(', '));
    
    // 7. Get question IDs to fetch their answers
    const questionIds = selectedQuestions.map(q => q.id);
    
    // 8. Fetch answers for the selected questions
    const { data: answersData, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .in('question_id', questionIds);
    
    if (answersError) throw answersError;
    
    console.log(`Fetched ${answersData?.length || 0} answers for ${questionIds.length} questions`);
    
    // 9. Group answers by question_id
    const answersByQuestionId = (answersData || []).reduce((acc, answer) => {
      if (!acc[answer.question_id]) {
        acc[answer.question_id] = [];
      }
      acc[answer.question_id].push(answer);
      return acc;
    }, {} as Record<number, any[]>);
    
    // 10. Combine questions with their answers
    const questionsWithChoices = selectedQuestions.map(question => {
      const questionAnswers = answersByQuestionId[question.id] || [];
      
      // Sort answers by option_number if available
      const sortedAnswers = [...questionAnswers].sort((a, b) => 
        (a.option_number || 0) - (b.option_number || 0)
      );
      
      // Format answers as choices
      const choices = sortedAnswers.map(answer => ({
        text: answer.answer_text || '',
        isCorrect: answer.is_correct || false
      }));
      
      // Process explanation field
      let explanation = question.explanation || "No explanation available";
      
      // Get references from the ref_sources column
      const hasRefSources = question.hasOwnProperty('ref_sources') && question.ref_sources;
      
      // Process references
      let references = [];
      if (hasRefSources) {
        if (Array.isArray(question.ref_sources)) {
          references = question.ref_sources;
        } else if (typeof question.ref_sources === 'string') {
          references = question.ref_sources.includes('\n') 
            ? question.ref_sources.split('\n') 
            : [question.ref_sources];
        }
      }
      
      // Set default time or use provided value
      let time_taken = question.time_taken || `${minutesPerQuestion}:00`;
      
      return {
        ...question,
        choices: choices.length > 0 ? choices : [
          { text: "No answer options available", isCorrect: true },
          { text: "Please report this issue", isCorrect: false }
        ],
        explanation: explanation,
        references: references,
        time_taken: time_taken
      };
    });
    
    return questionsWithChoices;
  } catch (error) {
    console.error('Error fetching unused questions for QuickStart:', error);
    
    // Fall back to mock implementation
    const filteredQuestions = mockQuestions.filter(q => {
      if (!includeNGN && q.ngn) return false;
      return true;
    });
    
    const shuffledQuestions = shuffleArray([...filteredQuestions]);
    return shuffledQuestions.slice(0, Math.min(questionCount, shuffledQuestions.length));
  }
};

/**
 * Gets the count of unused questions available for the current user
 */
export const getUnusedQuestionsCount = async (
  userId: string,
  includeNGN: boolean
): Promise<number> => {
  if (USE_MOCK_DATA) {
    return includeNGN ? 19 : 13; // Mock data has 19 total, 13 non-NGN questions
  }
  
  try {
    // 1. Get question IDs that the user has already answered or interacted with
    const { data: usedQuestionsData, error: usedError } = await supabase
      .from('question_status')
      .select('question_id')
      .eq('user_id', userId);
    
    if (usedError) throw usedError;
    
    // Create a set of used question IDs for fast lookup
    const usedQuestionIds = new Set(usedQuestionsData?.map(item => item.question_id) || []);
    
    // 2. Base query for all questions
    let query = supabase.from('questions').select('id, ngn');
    
    // 3. Apply NGN filter if needed
    if (!includeNGN) {
      query = query.eq('ngn', false);
    }
    
    // 4. Execute the query to get all potential questions
    const { data: allQuestionsData, error: questionsError } = await query;
    
    if (questionsError) throw questionsError;
    
    if (!allQuestionsData || allQuestionsData.length === 0) {
      return 0;
    }
    
    // 5. Count questions that the user has not used
    const unusedCount = allQuestionsData.filter(q => !usedQuestionIds.has(q.id)).length;
    
    return unusedCount;
  } catch (error) {
    console.error('Error getting unused questions count:', error);
    return includeNGN ? 19 : 13; // Fallback to mock counts
  }
};

export const fetchNgnQuestionsData = async (): Promise<{
  total: number,
  byTopic: Record<string, number>
}> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve({
      total: 6, // Of the 19 total, 6 are NGN questions
      byTopic: {
        '2': 1, // Safety and Infection Control
        '3': 1, // Health Promotion and Maintenance
        '4': 2, // Psychosocial Integrity
        '5': 1, // Basic Care and Comfort
        '8': 1  // Physiological Adaptation
      }
    });
  }

  try {
    // Get all NGN questions and their topics
    const { data: ngnQuestions, error: ngnError } = await supabase
      .from('questions')
      .select('id, topic_id')
      .eq('ngn', true);
    
    if (ngnError) throw ngnError;
    
    // Calculate total and distribution
    const total = ngnQuestions?.length || 0;
    const byTopic = ngnQuestions?.reduce((acc, q) => {
      const topicId = q.topic_id.toString();
      acc[topicId] = (acc[topicId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    return { total, byTopic };
  } catch (error) {
    console.error('Error fetching NGN questions data:', error);
    // Return default values as fallback
    return {
      total: 6, // Of the 19 total, 6 are NGN questions
      byTopic: {
        '2': 1, // Safety and Infection Control
        '3': 1, // Health Promotion and Maintenance
        '4': 2, // Psychosocial Integrity
        '5': 1, // Basic Care and Comfort
        '8': 1  // Physiological Adaptation
      }
    };
  }
};

/**
 * Fetches topics and subtopics with question counts
 */
export const fetchTopicData = async (): Promise<{
  topics: Category[],
  standardTopics: Category[]
}> => {
  if (USE_MOCK_DATA) {
    // For mock data, use the clientNeeds directly which has 19 total questions
    // and create a standardTopics version with 13 questions (19 - 6 NGN questions)
    
    // Deep clone the mock data to avoid modifying the original
    const allTopics = JSON.parse(JSON.stringify(mockClientNeeds));
    
    // NGN distribution by topic ID
    const ngnDistribution = {
      '2': 1, // Safety and Infection Control
      '3': 1, // Health Promotion and Maintenance
      '4': 2, // Psychosocial Integrity
      '5': 1, // Basic Care and Comfort
      '8': 1  // Physiological Adaptation
    };
    
    // Create standard topics by subtracting NGN questions from total counts
    const standardTopics = allTopics.map((topic: Category) => {
      const topicId = topic.id;
      const ngnCount = ngnDistribution[topicId as keyof typeof ngnDistribution] || 0;
      
      // Subtract NGN questions from topic count
      const standardCount = Math.max(0, topic.count - ngnCount);
      
      // For subtopics, distribute the NGN reduction as evenly as possible
      let remainingNgnToDistribute = ngnCount;
      
      if (topic.topics && remainingNgnToDistribute > 0) {
        // Make a deep copy to avoid modifying the original
        const modifiedSubtopics = [...topic.topics].map(subtopic => {
          if (remainingNgnToDistribute > 0 && subtopic.count > 0) {
            // Take 1 NGN from this subtopic
            const reduction = Math.min(remainingNgnToDistribute, subtopic.count);
            remainingNgnToDistribute -= reduction;
            return {
              ...subtopic,
              count: subtopic.count - reduction
            };
          }
          return subtopic;
        });
        
        return {
          ...topic,
          count: standardCount,
          topics: modifiedSubtopics
        };
      }
      
      return {
        ...topic,
        count: standardCount
      };
    });
    
    return {
      topics: allTopics,
      standardTopics
    };
  }

  try {
    // Get all questions to process, including NGN status
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('topic, sub_topic, topic_id, sub_topic_id, ngn');
    
    if (questionsError) throw questionsError;
    
    // Track the total number of questions for verification
    const totalQuestionCount = questions?.length || 0;
    console.log(`Total questions: ${totalQuestionCount}`);
    
    // Initialize maps for all questions and standard questions only
    const topicMap = new Map<string, { 
      id: string, 
      name: string, 
      count: number,
      topicCount: number,
      topics: Map<string, Topic>
    }>();
    
    const standardTopicMap = new Map<string, { 
      id: string, 
      name: string, 
      count: number,
      topicCount: number,
      topics: Map<string, Topic>
    }>();
    
    // Process each question only once to build both maps simultaneously
    questions?.forEach(question => {
      const isNgn = question.ngn === true;
      const topicId = question.topic_id?.toString() || question.topic;
      const topicName = question.topic;
      const subtopicId = question.sub_topic_id?.toString() || question.sub_topic;
      const subtopicName = question.sub_topic;
      
      // Process for all questions map
      if (!topicMap.has(topicId)) {
        topicMap.set(topicId, { 
          id: topicId, 
          name: topicName, 
          count: 0,
          topicCount: 0,
          topics: new Map()
        });
      }
      
      const topicData = topicMap.get(topicId)!;
      topicData.count++; // Increment the count for this topic
      
      // Process standard questions map (non-NGN only)
      if (!isNgn) {
        if (!standardTopicMap.has(topicId)) {
          standardTopicMap.set(topicId, { 
            id: topicId, 
            name: topicName, 
            count: 0,
            topicCount: 0,
            topics: new Map()
          });
        }
        
        const standardTopicData = standardTopicMap.get(topicId)!;
        standardTopicData.count++; // Increment standard count
      }
      
      // Process subtopic for all questions
      if (subtopicId && subtopicName) {
        if (!topicData.topics.has(subtopicId)) {
          topicData.topics.set(subtopicId, {
            id: subtopicId,
            name: subtopicName,
            count: 0
          });
          topicData.topicCount++;
        }
        
        const subtopicData = topicData.topics.get(subtopicId)!;
        subtopicData.count++;
        
        // Process subtopic for standard questions (non-NGN only)
        if (!isNgn && standardTopicMap.has(topicId)) {
          const standardTopicData = standardTopicMap.get(topicId)!;
          
          if (!standardTopicData.topics.has(subtopicId)) {
            standardTopicData.topics.set(subtopicId, {
              id: subtopicId,
              name: subtopicName,
              count: 0
            });
            standardTopicData.topicCount++;
          }
          
          const standardSubtopicData = standardTopicData.topics.get(subtopicId)!;
          standardSubtopicData.count++;
        }
      }
    });
    
    // Convert maps to the expected Category[] format
    const allTopics: Category[] = Array.from(topicMap.values()).map(topic => ({
      id: topic.id,
      name: topic.name,
      count: topic.count,
      topicCount: topic.topicCount,
      topics: Array.from(topic.topics.values())
    }));
    
    const standardTopicsResult: Category[] = Array.from(standardTopicMap.values()).map(topic => ({
      id: topic.id,
      name: topic.name,
      count: topic.count,
      topicCount: topic.topicCount,
      topics: Array.from(topic.topics.values())
    }));
    
    // Verify total counts
    const totalTopicCounts = allTopics.reduce((sum, topic) => sum + topic.count, 0);
    const totalStandardCounts = standardTopicsResult.reduce((sum, topic) => sum + topic.count, 0);
    
    console.log(`Total from topics: ${totalTopicCounts}`);
    console.log(`Total standard from topics: ${totalStandardCounts}`);
    console.log(`Total NGN: ${totalTopicCounts - totalStandardCounts}`);
    
    return {
      topics: allTopics,
      standardTopics: standardTopicsResult
    };
  } catch (error) {
    console.error('Error fetching topic data:', error);
    
    // For mock data, use the clientNeeds directly which has 19 total questions
    // and create a standardTopics version with 13 questions (19 - 6 NGN questions)
    
    // Deep clone the mock data to avoid modifying the original
    const allTopics = JSON.parse(JSON.stringify(mockClientNeeds));
    
    // NGN distribution by topic ID
    const ngnDistribution = {
      '2': 1, // Safety and Infection Control
      '3': 1, // Health Promotion and Maintenance
      '4': 2, // Psychosocial Integrity
      '5': 1, // Basic Care and Comfort
      '8': 1  // Physiological Adaptation
    };
    
    // Create standard topics by subtracting NGN questions from total counts
    const standardTopics = allTopics.map((topic: Category) => {
      const topicId = topic.id;
      const ngnCount = ngnDistribution[topicId as keyof typeof ngnDistribution] || 0;
      
      // Subtract NGN questions from topic count
      const standardCount = Math.max(0, topic.count - ngnCount);
      
      // For subtopics, distribute the NGN reduction as evenly as possible
      let remainingNgnToDistribute = ngnCount;
      
      if (topic.topics && remainingNgnToDistribute > 0) {
        // Make a deep copy to avoid modifying the original
        const modifiedSubtopics = [...topic.topics].map(subtopic => {
          if (remainingNgnToDistribute > 0 && subtopic.count > 0) {
            // Take 1 NGN from this subtopic
            const reduction = Math.min(remainingNgnToDistribute, subtopic.count);
            remainingNgnToDistribute -= reduction;
            return {
              ...subtopic,
              count: subtopic.count - reduction
            };
          }
          return subtopic;
        });
        
        return {
          ...topic,
          count: standardCount,
          topics: modifiedSubtopics
        };
      }
      
      return {
        ...topic,
        count: standardCount
      };
    });
    
    return {
      topics: allTopics,
      standardTopics
    };
  }
};
