import React, { useState, useEffect, useCallback } from "react";
import "./css/Quiz.css"; // We'll create this file for styling
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import PerformanceStats from "./components/PerformanceStats";
import { saveQuizAttempt } from "./utils/performanceTracker";
import { shuffleQuestions } from "./utils/quizUtils";

function Quiz() {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation
  const selectedQuiz = location.state?.selectedQuiz; // Removed default 'data.json'

  // Redirect if no quiz is selected (e.g., direct navigation to /quiz)
  useEffect(() => {
    if (!selectedQuiz) {
      navigate("/"); // Redirect to the quiz list
    }
  }, [selectedQuiz, navigate]);

  // Update document title based on selected quiz
  useEffect(() => {
    if (selectedQuiz) {
      const quizName = selectedQuiz.replace(".json", "");
      document.title = quizName;
    } else {
      document.title = "Quiz";
    }
  }, [selectedQuiz]);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // Store user answers { questionIndex: selectedAnswerIndex }
  const [showReview, setShowReview] = useState(false); // State to toggle review section

  // Practice Mode States
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]); // Array of wrong question objects with original index
  const [practiceScore, setPracticeScore] = useState(0);

  // Fetch quiz data - only if selectedQuiz is available
  useEffect(() => {
    if (!selectedQuiz) {
      setIsLoading(false); // Don't load if no quiz is selected
      return;
    }
    setIsLoading(true); // Set loading true when fetching
    fetch(`${process.env.PUBLIC_URL}/data/${selectedQuiz}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setQuestions(shuffleQuestions(data));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quiz data:", error);
        setError(`Failed to load quiz: ${selectedQuiz}. Please try again.`);
        setIsLoading(false);
      });
  }, [selectedQuiz]); // Dependency remains selectedQuiz

  const handleAnswerOptionClick = useCallback(
    (isCorrect, index) => {
      setSelectedAnswer(index);
      setIsAnswered(true);

      if (isPracticeMode) {
        // Practice mode - update score only
        const newPracticeScore = isCorrect ? practiceScore + 1 : practiceScore;
        setPracticeScore(newPracticeScore);

        // Handle navigation in practice mode
        setTimeout(() => {
          const nextQuestion = currentQuestionIndex + 1;
          if (nextQuestion < wrongQuestions.length) {
            setCurrentQuestionIndex(nextQuestion);
            setSelectedAnswer(null);
            setIsAnswered(false);
          } else {
            // Practice complete - show results
            setShowScore(true);
          }
        }, 1000);
      } else {
        // Normal quiz mode
        const updatedAnswers = {
          ...userAnswers,
          [currentQuestionIndex]: index, // Include the current answer
        };

        setUserAnswers(updatedAnswers);

        // Update score
        const newScore = isCorrect ? score + 1 : score;
        setScore(newScore);

        // Handle navigation to next question or completion
        setTimeout(() => {
          const nextQuestion = currentQuestionIndex + 1;
          if (nextQuestion < questions.length) {
            setCurrentQuestionIndex(nextQuestion);
            setSelectedAnswer(null); // Reset selected answer for the next question
            setIsAnswered(false); // Reset answered state
          } else {
            // Collect wrong questions - use updatedAnswers to include the last answer
            const wrong = questions
              .map((q, idx) => ({ question: q, originalIndex: idx }))
              .filter((item) => {
                const userAnswer = updatedAnswers[item.originalIndex];
                return userAnswer !== item.question.correct_answer;
              });
            setWrongQuestions(wrong);

            setShowScore(true); // Show results if it was the last question
            // Save quiz attempt to history (ONLY in normal mode)
            if (selectedQuiz) {
              saveQuizAttempt(selectedQuiz, newScore, questions.length);
            }
          }
        }, 1000); // Delay of 1.0 seconds
      }
    },
    [
      currentQuestionIndex,
      questions,
      selectedQuiz,
      score,
      isPracticeMode,
      wrongQuestions,
      practiceScore,
      userAnswers,
    ]
  );

  // Function to start practice mode with wrong answers
  const startPracticeMode = () => {
    if (wrongQuestions.length === 0) {
      alert("Great job! You got all questions correct!");
      return;
    }

    setIsPracticeMode(true);
    setShowScore(false);
    setShowReview(false);
    setCurrentQuestionIndex(0);
    setPracticeScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  // Function to exit practice mode
  const exitPracticeMode = () => {
    setIsPracticeMode(false);
    setShowScore(true);
    setCurrentQuestionIndex(0);
  };

  // Keyboard shortcuts for answer selection (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only handle keyboard shortcuts when quiz is active (not in score/review screen)
      if (showScore || showReview || isLoading || error || isAnswered) {
        return;
      }

      // Check if valid number key (1-4)
      const keyNum = parseInt(event.key);
      if (keyNum >= 1 && keyNum <= 4) {
        const answerIndex = keyNum - 1; // Convert to 0-based index

        // Get current question based on mode
        const currentQuestion = isPracticeMode
          ? wrongQuestions[currentQuestionIndex]?.question
          : questions[currentQuestionIndex];

        // Only proceed if the answer index is valid for current question
        if (
          currentQuestion &&
          currentQuestion.answers &&
          answerIndex < currentQuestion.answers.length
        ) {
          const isCorrect = answerIndex === currentQuestion.correct_answer;
          handleAnswerOptionClick(isCorrect, answerIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    currentQuestionIndex,
    questions,
    showScore,
    showReview,
    isLoading,
    error,
    isAnswered,
    handleAnswerOptionClick,
    isPracticeMode,
    wrongQuestions,
  ]);

  // Updated getButtonClass for review state
  const getButtonClass = (qIndex, ansIndex, reviewMode = false) => {
    const currentQ = questions[qIndex];
    const correctAnswerIndex = currentQ.correct_answer;
    const userAnswerIndex = userAnswers[qIndex];

    if (!reviewMode) {
      // Existing logic for during the quiz
      if (!isAnswered) return "answer-button";
      if (ansIndex === selectedAnswer) {
        return ansIndex === correctAnswerIndex
          ? "answer-button correct"
          : "answer-button incorrect";
      }
      if (ansIndex === correctAnswerIndex)
        return "answer-button correct-unselected";
      return "answer-button disabled";
    } else {
      // Logic for review mode
      const isCorrect = ansIndex === correctAnswerIndex;
      const isUserSelection = ansIndex === userAnswerIndex;

      if (isCorrect) return "answer-button correct review"; // Always highlight correct answer in review
      if (isUserSelection && !isCorrect)
        return "answer-button incorrect review"; // Show user's wrong choice
      return "answer-button disabled review"; // Dim other incorrect options
    }
  };

  const restartQuiz = () => {
    setQuestions((prevQuestions) => shuffleQuestions(prevQuestions)); // Shuffle questions for new random order
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setUserAnswers({}); // Reset user answers
    setShowReview(false); // Hide review section

    // Reset practice mode states
    setIsPracticeMode(false);
    setWrongQuestions([]);
    setPracticeScore(0);
  };

  // Handle navigating back to the list
  const backToList = () => {
    navigate("/");
  };

  // Redirect if no selected quiz and not loading/error
  if (!selectedQuiz && !isLoading && !error) {
    return <div className="loading">No quiz selected. Redirecting...</div>;
  }

  if (isLoading && !error) {
    // Show loading only if not errored
    return <div className="loading">Loading Quiz: {selectedQuiz}...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="loading">No questions found.</div>;
  }

  return (
    <div className="quiz-container">
      <p className="quiz-name-display">Playing: {selectedQuiz}</p>{" "}
      {/* Display selected quiz name */}
      {showScore ? (
        <div className="score-section">
          {isPracticeMode ? (
            <>
              <h2>🎯 Practice Complete!</h2>
              <div className="practice-results">
                <div className="practice-score-card">
                  <p className="practice-score-label">Practice Score</p>
                  <p className="practice-score-value">
                    {practiceScore} / {wrongQuestions.length}
                  </p>
                  <p className="practice-score-percentage">
                    {Math.round((practiceScore / wrongQuestions.length) * 100)}%
                  </p>
                  <p className="practice-note">
                    💡 This score is for practice only and doesn't affect your
                    stats
                  </p>
                </div>
              </div>

              <div className="score-actions">
                <button onClick={exitPracticeMode} className="back-button">
                  BACK TO RESULTS
                </button>
                <button onClick={startPracticeMode} className="restart-button">
                  PRACTICE AGAIN
                </button>
                <button onClick={restartQuiz} className="restart-button">
                  RESTART FULL QUIZ
                </button>
              </div>
            </>
          ) : !showReview ? (
            <>
              <h2>Quiz Complete!</h2>

              {/* Performance Stats - Now shown automatically */}
              <PerformanceStats
                quizName={selectedQuiz}
                currentScore={score}
                totalQuestions={questions.length}
              />

              <div className="score-actions">
                {wrongQuestions.length > 0 && (
                  <button
                    onClick={startPracticeMode}
                    className="practice-button"
                  >
                    🎯 PRACTICE WRONG ANSWERS ({wrongQuestions.length})
                  </button>
                )}
                <button
                  onClick={() => setShowReview(true)}
                  className="review-button"
                >
                  REVIEW ANSWERS
                </button>
                <button onClick={restartQuiz} className="restart-button">
                  RESTART THIS QUIZ
                </button>
                <button onClick={backToList} className="back-button">
                  BACK TO QUIZ LIST
                </button>
              </div>
            </>
          ) : (
            <div className="review-section">
              <h2>Review Your Answers</h2>
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="review-question-block">
                  <p className="question-text">
                    <strong>Q{qIndex + 1}:</strong> {question.question}
                  </p>
                  <div className="answer-section review">
                    {question.answers.map((answer, ansIndex) => {
                      const answerNumber = ansIndex + 1; // 1, 2, 3, 4
                      return (
                        <button
                          key={ansIndex}
                          className={getButtonClass(qIndex, ansIndex, true)} // Pass reviewMode = true
                          disabled // Buttons are not interactive in review
                        >
                          <span className="answer-number">{answerNumber}</span>
                          {answer}
                        </button>
                      );
                    })}
                  </div>
                  <hr />
                </div>
              ))}
              <div className="score-actions">
                <button onClick={restartQuiz} className="restart-button">
                  RESTART THIS QUIZ
                </button>
                <button onClick={backToList} className="back-button">
                  BACK TO QUIZ LIST
                </button>
                <button
                  onClick={() => setShowReview(false)}
                  className="back-button"
                >
                  BACK TO SCORE
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {isPracticeMode && (
            <div className="practice-mode-badge">
              🎯 PRACTICE MODE - Wrong Answers Only
            </div>
          )}
          <div className="question-section">
            <div className="question-count">
              <span>Question {currentQuestionIndex + 1}</span>/
              {isPracticeMode ? wrongQuestions.length : questions.length}
            </div>
            <div className="question-text">
              {isPracticeMode
                ? wrongQuestions[currentQuestionIndex]?.question?.question
                : questions[currentQuestionIndex].question}
            </div>
          </div>
          <div className="answer-section">
            {(isPracticeMode
              ? wrongQuestions[currentQuestionIndex]?.question?.answers
              : questions[currentQuestionIndex].answers
            )?.map((answerOption, index) => {
              const currentQ = isPracticeMode
                ? wrongQuestions[currentQuestionIndex]?.question
                : questions[currentQuestionIndex];
              const isCorrect = index === currentQ?.correct_answer;
              const answerNumber = index + 1; // 1, 2, 3, 4
              return (
                <button
                  key={index}
                  onClick={() =>
                    !isAnswered && handleAnswerOptionClick(isCorrect, index)
                  }
                  className={
                    isPracticeMode
                      ? isAnswered
                        ? index === selectedAnswer
                          ? isCorrect
                            ? "answer-button correct"
                            : "answer-button incorrect"
                          : index === currentQ?.correct_answer
                          ? "answer-button correct-unselected"
                          : "answer-button disabled"
                        : "answer-button"
                      : getButtonClass(currentQuestionIndex, index)
                  }
                  disabled={isAnswered}
                >
                  <span className="answer-number">{answerNumber}</span>
                  {answerOption}
                </button>
              );
            })}
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) /
                    (isPracticeMode
                      ? wrongQuestions.length
                      : questions.length)) *
                  100
                }%`,
              }}
            ></div>
          </div>
          {isPracticeMode && (
            <button onClick={exitPracticeMode} className="exit-practice-button">
              EXIT PRACTICE MODE
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default Quiz;
