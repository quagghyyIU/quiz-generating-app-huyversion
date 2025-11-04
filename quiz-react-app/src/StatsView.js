import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PerformanceStats from "./components/PerformanceStats";
import { getQuizHistory, getStatistics } from "./utils/performanceTracker";
import "./css/Quiz.css";

function StatsView() {
  const [quizFiles, setQuizFiles] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of quizzes from index.json
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

  // Update document title based on selected quiz or stats page
  useEffect(() => {
    if (selectedQuiz) {
      const quizName = selectedQuiz.replace(".json", "");
      document.title = `${quizName} - Stats`;
    } else {
      document.title = "Quiz - Stats";
    }
  }, [selectedQuiz]);

  const handleQuizSelect = (filename) => {
    setSelectedQuiz(filename);
  };

  const handleBack = () => {
    setSelectedQuiz(null);
  };

  // Get stats summary for each quiz
  const getQuizStatsSummary = (filename) => {
    const history = getQuizHistory(filename);
    if (history.length === 0) {
      return null;
    }
    const stats = getStatistics(history);
    return stats;
  };

  if (loading) {
    return <div className="loading">Loading quiz list...</div>;
  }

  // If a quiz is selected, show its stats
  if (selectedQuiz) {
    return (
      <div className="stats-view-container">
        <div className="stats-header">
          <button onClick={handleBack} className="back-button">
            ← BACK TO STATS LIST
          </button>
          <h2>Stats for: {selectedQuiz.replace(".json", "")}</h2>
        </div>
        <PerformanceStats quizName={selectedQuiz} />
      </div>
    );
  }

  // Show list of quizzes with their stats summary
  return (
    <div className="stats-view-container">
      <h2>Quiz Statistics</h2>
      <p className="stats-description">
        Select a quiz to view your performance statistics and progress history.
      </p>

      <div className="quiz-cards">
        {quizFiles.map((file, index) => {
          const stats = getQuizStatsSummary(file);
          const hasHistory = stats !== null;

          return (
            <div key={index} className="quiz-card">
              <h3 className="quiz-card-title">{file.replace(".json", "")}</h3>
              {hasHistory ? (
                <div className="quiz-stats-preview">
                  <div className="stat-preview-item">
                    <span className="stat-preview-label">Attempts:</span>
                    <span className="stat-preview-value">{stats.attempts}</span>
                  </div>
                  <div className="stat-preview-item">
                    <span className="stat-preview-label">Average:</span>
                    <span className="stat-preview-value">
                      {stats.averageScore}%
                    </span>
                  </div>
                  <div className="stat-preview-item">
                    <span className="stat-preview-label">Best:</span>
                    <span className="stat-preview-value">
                      {stats.bestScore}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="no-stats-message">
                  <p>No attempts yet</p>
                </div>
              )}
              <button
                onClick={() => handleQuizSelect(file)}
                className="view-stats-button"
              >
                {hasHistory ? "VIEW STATS" : "VIEW DETAILS"}
              </button>
            </div>
          );
        })}
      </div>

      {quizFiles.filter((file) => getQuizStatsSummary(file) !== null).length ===
        0 && (
        <div className="no-history-message">
          <p>🎯 You haven't taken any quizzes yet!</p>
          <p>Start taking quizzes to see your performance statistics here.</p>
          <button
            onClick={() => navigate("/")}
            className="start-quiz-button"
            style={{ marginTop: "20px" }}
          >
            GO TO QUIZ LIST
          </button>
        </div>
      )}
    </div>
  );
}

export default StatsView;
