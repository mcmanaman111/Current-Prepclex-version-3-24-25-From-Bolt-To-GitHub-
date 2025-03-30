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
  
  // Determine if this is a multiple choice (single correct answer) or SATA question
  const isMultipleChoice = correctAnswers === 1;
  
  let isFullyCorrect;
  // For multiple choice questions, only need to select the one correct answer
  if (isMultipleChoice) {
    isFullyCorrect = selectedCorrect === 1 && selectedIncorrect === 0;
  } else {
    // For SATA questions, need to select all correct answers and no incorrect ones
    isFullyCorrect = selectedCorrect === correctAnswers && selectedIncorrect === 0;
  }
  
  return {
    correct: selectedCorrect,
    total: correctAnswers,
    incorrect: selectedIncorrect,
    isFullyCorrect,
    isMultipleChoice, // Add this flag so components know what type of question it is
    nclexScore: isFullyCorrect ? 1 : 0,
    percentage: correctAnswers > 0 ? (selectedCorrect / correctAnswers) * 100 : 0
  };
};

/**
 * Enhanced shuffling function with more aggressive randomization
 * Uses a modified Fisher-Yates with multiple randomization passes
 * 
 * @param array The array to shuffle
 * @param passes Number of full shuffling passes to perform (default: 1)
 * @returns The shuffled array (as a new array)
 */
export const shuffleArray = <T>(array: T[], passes = 1): T[] => {
  if (array.length <= 1) return [...array];
  
  // Create a copy to avoid modifying the original array
  let shuffled = [...array];
  
  // Get the current timestamp as additional entropy
  const timestamp = Date.now();
  
  // Perform multiple full passes of shuffling
  for (let pass = 0; pass < passes; pass++) {
    // Add noise based on pass number and timestamp
    const noise = (timestamp % 1000) + (pass * 17);
    
    // Standard Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Add more variability to the random selection using the noise
      const j = Math.floor((Math.random() * 1000 + noise) % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // For additional passes, also reverse sections randomly
    if (pass > 0 && shuffled.length > 3) {
      // Maybe reverse the first half
      if (Math.random() > 0.5) {
        const midpoint = Math.floor(shuffled.length / 2);
        shuffled = [
          ...shuffled.slice(0, midpoint).reverse(),
          ...shuffled.slice(midpoint)
        ];
      }
      
      // Maybe reverse the second half
      if (Math.random() > 0.5) {
        const midpoint = Math.floor(shuffled.length / 2);
        shuffled = [
          ...shuffled.slice(0, midpoint),
          ...shuffled.slice(midpoint).reverse()
        ];
      }
    }
  }
  
  // For small arrays, check if we accidentally produced the original order
  // and if so, swap two random elements
  if (shuffled.length < 10 && JSON.stringify(shuffled) === JSON.stringify(array)) {
    const i = Math.floor(Math.random() * shuffled.length);
    const j = (i + 1 + Math.floor(Math.random() * (shuffled.length - 1))) % shuffled.length;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  console.log("Shuffled array with enhanced randomization", 
    array.length === shuffled.length && 
    JSON.stringify(array) !== JSON.stringify(shuffled) ? "SUCCESS" : "WARNING: Still same order");
  
  return shuffled;
};
