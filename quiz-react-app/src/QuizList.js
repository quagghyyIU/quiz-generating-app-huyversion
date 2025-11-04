import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Quiz.css"; // Import shared CSS including list styles

function QuizList() {
  const [quizFiles, setQuizFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of quizzes from index.json in the public/data folder
    fetch(`${process.env.PUBLIC_URL}/data/index.json`)
      .then((response) => {
        if (!response.ok) {
          console.error("Error fetching quiz list:", response.statusText);
          setLoading(false);
          return;
        }
        return response.json();
      })
      .then((data) => {
        setQuizFiles(data.files);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quiz list:", error);
        setLoading(false);
      });
  }, []);

  // Update document title
  useEffect(() => {
    document.title = "Quiz";
  }, []);

  const handleQuizSelect = (filename) => {
    navigate("/quiz", { state: { selectedQuiz: filename } });
  };

  if (loading) return <div className="loading">Loading quiz list...</div>;
  if (!quizFiles || quizFiles.length === 0)
    return (
      <div className="loading">
        No quizzes found. Make sure '.json' files are in 'public/data'.
      </div>
    );

  return (
    <div className="quiz-list-container">
      <h2>Available Quizzes</h2>
      <div className="quiz-cards">
        {quizFiles.map((file, index) => (
          <div key={index} className="quiz-card">
            <h3 className="quiz-card-title">{file.replace(".json", "")}</h3>
            <button
              onClick={() => handleQuizSelect(file)}
              className="start-quiz-button"
            >
              START QUIZ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizList;
