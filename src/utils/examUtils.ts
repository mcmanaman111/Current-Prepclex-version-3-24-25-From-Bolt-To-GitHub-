export const getDifficultyBadgeColor = (difficulty: string) => {
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    case 'MEDIUM':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
    case 'HARD':
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export const calculateScore = (selectedAnswers: number[], choices: { isCorrect: boolean }[]) => {
  const correctAnswers = choices.filter(choice => choice.isCorrect).length;
  const incorrectAnswers = choices.filter(choice => !choice.isCorrect).length;
  
  const selectedCorrect = selectedAnswers.filter(index => choices[index].isCorrect).length;
  const selectedIncorrect = selectedAnswers.filter(index => !choices[index].isCorrect).length;
  
  const isFullyCorrect = selectedCorrect === correctAnswers && selectedIncorrect === 0;
  
  return {
    correct: selectedCorrect,
    total: correctAnswers,
    incorrect: selectedIncorrect,
    isFullyCorrect,
    nclexScore: isFullyCorrect ? 1 : 0,
    percentage: (selectedCorrect / correctAnswers) * 100
  };
};