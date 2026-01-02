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
  const folderPath = location.state?.folderPath; // Folder path for physical folder structure

  // Shuffle folder mode - combines all quizzes in a folder
  const shuffleFolder = location.state?.shuffleFolder;
  const folderName = location.state?.folderName;
  const quizFiles = location.state?.quizFiles;
  const questionLimit = location.state?.questionLimit; // null = all questions
  const shuffleModeName = location.state?.shuffleModeName || "Full Test";
  const quizModeName = location.state?.quizModeName || "Full Quiz"; // For single quiz mode

  // Redirect if no quiz is selected and not shuffle folder mode
  useEffect(() => {
    if (!selectedQuiz && !shuffleFolder) {
      navigate("/"); // Redirect to the quiz list
    }
  }, [selectedQuiz, shuffleFolder, navigate]);

  // Update document title based on selected quiz or shuffle mode
  useEffect(() => {
    if (shuffleFolder && folderName) {
      const modeIcon = shuffleModeName === "Random 20" ? "🎲" :
        shuffleModeName === "Sample Test" ? "📝" : "📚";
      document.title = `${modeIcon} ${shuffleModeName}`;
    } else if (selectedQuiz) {
      const quizName = selectedQuiz.replace(".json", "");
      document.title = quizName;
    } else {
      document.title = "Quiz";
    }
  }, [selectedQuiz, shuffleFolder, folderName, shuffleModeName]);

  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]); // Store full question pool for restart
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

  // Fetch quiz data - handles both single quiz and shuffle folder mode
  useEffect(() => {
    // Shuffle folder mode: fetch all quizzes in the folder and combine them
    if (shuffleFolder && quizFiles && folderPath) {
      setIsLoading(true);

      // Fetch all quiz files in the folder
      const fetchPromises = quizFiles.map(file =>
        fetch(`${process.env.PUBLIC_URL}/data/${folderPath}/${file}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load ${file}`);
            }
            return response.json();
          })
          .then(data => data.map(q => ({ ...q, sourceQuiz: file.replace('.json', '') })))
      );

      Promise.all(fetchPromises)
        .then(allQuizData => {
          // Combine all questions from all quizzes
          const combinedQuestions = allQuizData.flat();
          // Store original questions for restart functionality
          setOriginalQuestions(combinedQuestions);
          // Shuffle all questions first
          let shuffledQuestions = shuffleQuestions(combinedQuestions);
          // If there's a question limit, take only that many
          if (questionLimit && questionLimit < shuffledQuestions.length) {
            shuffledQuestions = shuffledQuestions.slice(0, questionLimit);
          }
          setQuestions(shuffledQuestions);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error fetching quiz data:", error);
          setError(`Failed to load quizzes from ${folderName}. Please try again.`);
          setIsLoading(false);
        });
      return;
    }

    // Single quiz mode
    if (!selectedQuiz) {
      setIsLoading(false); // Don't load if no quiz is selected
      return;
    }
    setIsLoading(true); // Set loading true when fetching
    // Build the path: if folderPath is provided, use folder/file structure
    const quizPath = folderPath
      ? `${process.env.PUBLIC_URL}/data/${folderPath}/${selectedQuiz}`
      : `${process.env.PUBLIC_URL}/data/${selectedQuiz}`;
    fetch(quizPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Store original questions for restart functionality
        setOriginalQuestions(data);
        // Shuffle questions first
        let shuffledQuestions = shuffleQuestions(data);
        // If there's a question limit, take only that many
        if (questionLimit && questionLimit < shuffledQuestions.length) {
          shuffledQuestions = shuffledQuestions.slice(0, questionLimit);
        }
        setQuestions(shuffledQuestions);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quiz data:", error);
        setError(`Failed to load quiz: ${selectedQuiz}. Please try again.`);
        setIsLoading(false);
      });
  }, [selectedQuiz, folderPath, shuffleFolder, quizFiles, folderName, questionLimit]); // Dependencies include shuffle mode

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
            // Note: idx matches currentQuestionIndex used when storing answers
            const wrong = questions
              .map((q, idx) => ({ question: q, questionIndex: idx }))
              .filter((item) => {
                const userAnswer = updatedAnswers[item.questionIndex];
                return userAnswer !== item.question.correct_answer;
              });
            setWrongQuestions(wrong);

            setShowScore(true); // Show results if it was the last question
            // Save quiz attempt to history (ONLY in normal mode)
            // Use folder/filename as unique key to prevent conflicts
            // For shuffle folder mode, use folder path + mode as the key
            if (shuffleFolder && folderPath) {
              const modeKey = questionLimit ? `__${shuffleModeName.toLowerCase().replace(/\s+/g, '_')}__` : '__full_test__';
              const quizKey = `${folderPath}/${modeKey}`;
              saveQuizAttempt(quizKey, newScore, questions.length);
            } else if (selectedQuiz) {
              // For single quiz, include mode suffix if using quick mode
              const basePath = folderPath ? `${folderPath}/${selectedQuiz}` : selectedQuiz;
              const quizKey = questionLimit ? `${basePath}__quick__` : basePath;
              saveQuizAttempt(quizKey, newScore, questions.length);
            }
          }
        }, 1000); // Delay of 1.0 seconds
      }
    },
    [
      currentQuestionIndex,
      questions,
      selectedQuiz,
      folderPath,
      shuffleFolder,
      questionLimit,
      shuffleModeName,
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
    // If there's a question limit, pick fresh random questions from the original pool
    if (questionLimit && originalQuestions.length > 0) {
      let shuffledQuestions = shuffleQuestions(originalQuestions);
      if (questionLimit < shuffledQuestions.length) {
        shuffledQuestions = shuffledQuestions.slice(0, questionLimit);
      }
      setQuestions(shuffledQuestions);
    } else {
      // No limit - just shuffle the current questions for new order
      setQuestions((prevQuestions) => shuffleQuestions(prevQuestions));
    }
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

  // Redirect if no selected quiz and not shuffle mode and not loading/error
  if (!selectedQuiz && !shuffleFolder && !isLoading && !error) {
    return <div className="loading">No quiz selected. Redirecting...</div>;
  }

  if (isLoading && !error) {
    // Show loading only if not errored
    const loadingText = shuffleFolder
      ? `Loading ${quizFiles?.length || 0} quizzes from ${folderName}...`
      : `Loading Quiz: ${selectedQuiz}...`;
    return <div className="loading">{loadingText}</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="loading">No questions found.</div>;
  }

  // Display name for the quiz
  const getModeIcon = (modeName) => {
    if (modeName === "Random 20") return "🎲";
    if (modeName === "Sample Test") return "📝";
    if (modeName === "Full Quiz") return "📚";
    if (modeName === "Quick Refresh") return "🚀"; // Keep legacy support just in case
    if (modeName === "Fast Pace") return "⚡";
    return "📝";
  };

  const displayName = shuffleFolder
    ? `${getModeIcon(shuffleModeName)} ${shuffleModeName} - ${folderName} (${questions.length} Q)`
    : questionLimit
      ? `${getModeIcon(quizModeName)} ${selectedQuiz?.replace('.json', '')} (${questions.length} Q)`
      : selectedQuiz;

  return (
    <div className="quiz-container">
      <p className="quiz-name-display">Playing: {displayName}</p>{" "}
      {/* Display selected quiz name or shuffle mode */}
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

              <div className="score-actions" style={{ marginBottom: '20px' }}>
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

              {/* Performance Stats - Now shown automatically */}
              {/* Use folder/filename as unique key to prevent conflicts */}
              {/* For shuffle mode, use folder path + mode as key */}
              <PerformanceStats
                quizName={
                  shuffleFolder
                    ? `${folderPath}/${questionLimit ? `__${shuffleModeName.toLowerCase().replace(/\s+/g, '_')}__` : '__full_test__'}`
                    : (() => {
                      const basePath = folderPath ? `${folderPath}/${selectedQuiz}` : selectedQuiz;
                      return questionLimit ? `${basePath}__quick__` : basePath;
                    })()
                }
                currentScore={score}
                totalQuestions={questions.length}
              />
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
            {/* Show source quiz in shuffle mode */}
            {shuffleFolder && !isPracticeMode && questions[currentQuestionIndex]?.sourceQuiz && (
              <div className="source-quiz-badge">
                📄 {questions[currentQuestionIndex].sourceQuiz}
              </div>
            )}
            {shuffleFolder && isPracticeMode && wrongQuestions[currentQuestionIndex]?.question?.sourceQuiz && (
              <div className="source-quiz-badge">
                📄 {wrongQuestions[currentQuestionIndex].question.sourceQuiz}
              </div>
            )}
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
                width: `${((currentQuestionIndex + 1) /
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
