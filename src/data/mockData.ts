import { Question } from '../types/exam';

// Helper function to generate mock questions
const generateMockQuestions = (count: number): Question[] => {
  const clientNeeds = [
    {
      area: 'Management of Care',
      topics: [
        'Assignment and Delegation',
        'Case Management',
        'Legal Rights and Responsibilities',
        'Ethics and Advocacy',
        'Quality Improvement'
      ]
    },
    {
      area: 'Safety and Infection Control',
      topics: [
        'Standard Precautions',
        'Emergency Response',
        'Error Prevention',
        'Safe Handling',
        'Use of Restraints'
      ]
    },
    {
      area: 'Health Promotion and Maintenance',
      topics: [
        'Health Screening',
        'Disease Prevention',
        'Lifestyle Choices',
        'Growth and Development',
        'Self-Care'
      ]
    },
    {
      area: 'Psychosocial Integrity',
      topics: [
        'Coping Mechanisms',
        'Mental Health Concepts',
        'Crisis Intervention',
        'Cultural Awareness',
        'End of Life Care'
      ]
    },
    {
      area: 'Basic Care and Comfort',
      topics: [
        'Personal Hygiene',
        'Mobility',
        'Nutrition and Hydration',
        'Sleep and Rest',
        'Elimination'
      ]
    }
  ];

  const questionTypes = [
    'Multiple Choice',
    'Select All That Apply',
    'Hot Spot',
    'Fill in the Blank',
    'Ordered Response',
    'Chart/Exhibit',
    'Next Generation NCLEX'
  ];

  return Array.from({ length: count }, (_, index) => {
    const clientNeed = clientNeeds[index % clientNeeds.length];
    const topic = clientNeed.topics[Math.floor(Math.random() * clientNeed.topics.length)];
    const isCorrect = Math.random() < 0.75; // 75% chance of being correct
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    return {
      id: index + 1,
      tutorialId: "Tutorial",
      qid: `Q${(index + 1).toString().padStart(5, '0')}`,
      text: `Sample question ${index + 1} about ${topic}`,
      choices: [
        { text: "Option A", isCorrect: isCorrect },
        { text: "Option B", isCorrect: !isCorrect },
        { text: "Option C", isCorrect: false },
        { text: "Option D", isCorrect: false }
      ],
      explanation: {
        correct: [
          `This is the correct explanation for question ${index + 1}`,
          "Additional details about why this answer is correct"
        ],
        incorrect: [
          `This explains why the other options for question ${index + 1} are incorrect`,
          "Further details about incorrect options"
        ]
      },
      statistics: {
        subject: "Adult Health",
        lesson: topic,
        clientNeedArea: clientNeed.area,
        clientNeedTopic: topic,
        questionType: questionType,
        difficulty: Math.random() < 0.33 ? "EASY" : Math.random() < 0.66 ? "MEDIUM" : "HARD",
        avgPeerScore: "75%",
        timeTaken: `${Math.floor(Math.random() * 2) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
      }
    };
  });
};

export const mockQuestions = generateMockQuestions(25);

// Create mock scores with some skipped questions
export const mockScores = mockQuestions.reduce((acc, q, index) => {
  // Skip questions 3, 8, and 15
  if ([3, 8, 15].includes(index)) {
    return acc;
  }

  const isFullyCorrect = Math.random() > 0.3;
  const total = Math.floor(Math.random() * 3) + 1;
  const correct = isFullyCorrect ? total : Math.floor(Math.random() * total);

  return {
    ...acc,
    [q.id]: {
      correct,
      total,
      incorrect: total - correct,
      isFullyCorrect,
      nclexScore: isFullyCorrect ? 1 : 0,
      percentage: (correct / total) * 100
    }
  };
}, {});

export const mockUserProgress = {
  name: "John McManaman",
  correctPercentage: 75,
  totalQuestions: 100,
  unusedQuestions: 45,
  usedQuestions: 55,
  omittedQuestions: 5,
  recentTests: [
    {
      date: "2024-03-15",
      score: 82,
      totalQuestions: 25
    },
    {
      date: "2024-03-14",
      score: 76,
      totalQuestions: 25
    }
  ]
};