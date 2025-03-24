import axios from 'axios';
import { mockQuestions, mockUserProgress } from './mockData';

const API_URL = 'https://your-wordpress-site.com/wp-json/wp/v2';
const USE_MOCK_DATA = true; // Toggle this when real API is ready

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
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

export const fetchQuestions = async (): Promise<Question[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockQuestions);
  }

  try {
    const response = await axios.get(`${API_URL}/questions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const fetchUserProgress = async (userId: string): Promise<UserProgress> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockUserProgress);
  }

  try {
    const response = await axios.get(`${API_URL}/user-progress/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};