/**
 * Quiz Utilities
 * Helper functions for quiz operations
 */

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled copy of the array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Shuffles answers for a single question and updates correct_answer index
 * @param {Object} question - Question object with answers and correct_answer
 * @returns {Object} Question object with shuffled answers and updated correct_answer
 */
export const shuffleAnswers = (question) => {
  // Get the correct answer text before shuffling
  const correctAnswerText = question.answers[question.correct_answer];

  // Create a copy of answers array and shuffle it
  const shuffledAnswers = shuffleArray(question.answers);

  // Find the new index of the correct answer after shuffling
  const newCorrectAnswerIndex = shuffledAnswers.findIndex(
    (answer) => answer === correctAnswerText
  );

  // Return new question object with shuffled answers and updated correct_answer
  return {
    ...question,
    answers: shuffledAnswers,
    correct_answer: newCorrectAnswerIndex,
  };
};

/**
 * Shuffles questions array and answers within each question for randomized quiz experience
 * @param {Array} questions - Array of question objects
 * @returns {Array} Shuffled questions array with shuffled answers
 */
export const shuffleQuestions = (questions) => {
  // First shuffle the answers within each question
  const questionsWithShuffledAnswers = questions.map((question) =>
    shuffleAnswers(question)
  );
  
  // Then shuffle the order of questions
  return shuffleArray(questionsWithShuffledAnswers);
};
