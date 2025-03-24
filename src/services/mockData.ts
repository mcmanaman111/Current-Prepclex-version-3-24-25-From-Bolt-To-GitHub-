export const mockQuestions = [
  {
    id: 1,
    question: "A client with type 2 diabetes is prescribed metformin. Which statement indicates the client understands the medication?",
    options: [
      "I will take this medication on an empty stomach",
      "I will take this medication with meals",
      "I will take this medication at bedtime only",
      "I will take this medication before exercise"
    ],
    correctAnswer: 1
  },
  // More mock questions can be added here
];

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