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
          throw new Error(`Failed to fetch quiz list: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Flatten all quiz files from folder structure
        // Each file needs folder info for correct path and unique key
        const allQuizFiles = [];
        if (data.folders && Array.isArray(data.folders)) {
          data.folders.forEach(folder => {
            if (folder.files && Array.isArray(folder.files)) {
              folder.files.forEach(file => {
                allQuizFiles.push({
                  filename: file,
                  folderId: folder.id,
                  folderName: folder.name,
                  // Unique key for localStorage: folderId/filename
                  quizKey: `${folder.id}/${file}`
                });
              });
            }
          });
        }
        setQuizFiles(allQuizFiles);
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
      // Extract just the filename part for display
      const displayName = selectedQuiz.split('/').pop().replace(".json", "");
      document.title = `${displayName} - Stats`;
    } else {
      document.title = "Quiz - Stats";
    }
  }, [selectedQuiz]);

  const handleQuizSelect = (quizKey) => {
    setSelectedQuiz(quizKey);
  };

  const handleBack = () => {
    setSelectedQuiz(null);
  };

  // Get stats summary for each quiz using the unique quizKey
  const getQuizStatsSummary = (quizKey) => {
    const history = getQuizHistory(quizKey);
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
    // Extract display name from quizKey (folderId/filename.json -> filename)
    const displayName = selectedQuiz.split('/').pop().replace(".json", "");
    return (
      <div className="stats-view-container">
        <div className="stats-header">
          <button onClick={handleBack} className="back-button">
            ← BACK TO STATS LIST
          </button>
          <h2>Stats for: {displayName}</h2>
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
        {quizFiles.map((quizItem, index) => {
          // Use the unique quizKey for stats lookup
          const stats = getQuizStatsSummary(quizItem.quizKey);
          // Check for fast mode stats
          const fastModeStats = getQuizStatsSummary(quizItem.quizKey + '__quick__');

          const hasHistory = stats !== null;
          const hasFastMode = fastModeStats !== null;

          return (
            <div key={index} className="quiz-card">
              <h3 className="quiz-card-title">{quizItem.filename.replace(".json", "")}</h3>
              <div className="quiz-folder-badge">{quizItem.folderName}</div>
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
                  <p>No full quiz attempts yet</p>
                </div>
              )}

              <div className="card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '15px' }}>
                <button
                  onClick={() => handleQuizSelect(quizItem.quizKey)}
                  className="view-stats-button"
                >
                  {hasHistory ? "VIEW FULL STATS" : "VIEW DETAILS"}
                </button>

                {hasFastMode && (
                  <button
                    onClick={() => handleQuizSelect(quizItem.quizKey + '__quick__')}
                    className="view-stats-button"
                    style={{ backgroundColor: '#2196f3', opacity: 0.9 }}
                  >
                    🚀 VIEW FAST MODE STATS
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {quizFiles.filter((quizItem) => getQuizStatsSummary(quizItem.quizKey) !== null).length ===
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
