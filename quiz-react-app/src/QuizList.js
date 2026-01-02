import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Quiz.css";
import "./css/FolderStyles.css";

function QuizList() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);

  const navigate = useNavigate();

  // Fetch folder structure from index.json
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/data/index.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch quiz list: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.folders) {
          setFolders(data.folders);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quiz list:", error);
        setLoading(false);
      });
  }, []);

  // Update document title
  useEffect(() => {
    const folderName = currentFolder
      ? folders.find(f => f.id === currentFolder)?.name
      : null;
    document.title = folderName ? `Quiz - ${folderName}` : "Quiz";
  }, [currentFolder, folders]);

  // Open quiz mode selector
  const openQuizModal = (folderId, filename) => {
    setSelectedQuizForModal({ folderId, filename });
    setShowQuizModal(true);
  };

  const handleQuizSelect = (folderId, filename, questionLimit = null, modeName = "Full Quiz") => {
    setShowQuizModal(false);
    navigate("/quiz", {
      state: {
        selectedQuiz: filename,
        folderPath: folderId,
        questionLimit: questionLimit,
        quizModeName: modeName
      }
    });
  };

  // Shuffle mode selection state
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const [selectedFolderForShuffle, setSelectedFolderForShuffle] = useState(null);

  // Individual quiz mode selection state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuizForModal, setSelectedQuizForModal] = useState(null);

  // Open shuffle mode selector
  const openShuffleModal = (folder) => {
    setSelectedFolderForShuffle(folder);
    setShowShuffleModal(true);
  };

  // Handle shuffle with specific question limit
  const handleShuffleFolder = (folder, questionLimit = null, modeName = "Full Test") => {
    setShowShuffleModal(false);
    navigate("/quiz", {
      state: {
        shuffleFolder: true,
        folderPath: folder.id,
        folderName: folder.name,
        quizFiles: folder.files,
        questionLimit: questionLimit,
        shuffleModeName: modeName
      }
    });
  };

  // Get current folder data
  const getCurrentFolder = () => {
    if (currentFolder === null) return null;
    return folders.find(f => f.id === currentFolder);
  };

  const currentFolderData = getCurrentFolder();
  const displayedQuizzes = currentFolderData?.files || [];

  // Get total quiz count
  const getTotalQuizCount = () => {
    return folders.reduce((sum, folder) => sum + folder.files.length, 0);
  };

  if (loading) return <div className="loading">Loading quiz list...</div>;
  if (!folders || folders.length === 0)
    return (
      <div className="loading">
        No quizzes found. Make sure quiz files are organized in folders within 'public/data'.
      </div>
    );

  return (
    <div className="quiz-list-container">
      {/* Header with navigation */}
      <div className="quiz-list-header">
        <div className="header-nav">
          {currentFolder !== null && (
            <button
              className="back-to-root-btn"
              onClick={() => setCurrentFolder(null)}
            >
              ← Back to All
            </button>
          )}
          <h2>
            {currentFolder
              ? currentFolderData?.name || 'Folder'
              : 'Available Quizzes'}
          </h2>
          {currentFolder === null && (
            <span className="total-quiz-count">{getTotalQuizCount()} quizzes total</span>
          )}
        </div>
      </div>

      {/* Folders section - show at root level */}
      {currentFolder === null && (
        <div className="folders-section">
          <div className="folders-grid">
            {folders.map(folder => (
              <div
                key={folder.id}
                className="folder-card"
              >
                <div
                  className="folder-card-main"
                  onClick={() => setCurrentFolder(folder.id)}
                >
                  <div className="folder-icon">
                    {folder.id === 'uncategorized' ? '📝' : '📁'}
                  </div>
                  <div className="folder-name">{folder.name}</div>
                  <div className="folder-count">
                    {folder.files.length} quiz{folder.files.length !== 1 ? 'zes' : ''}
                  </div>
                </div>
                {folder.files.length > 1 && (
                  <button
                    className="shuffle-folder-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openShuffleModal(folder);
                    }}
                    title={`Shuffle all ${folder.files.length} quizzes together`}
                  >
                    🔀 Shuffle All
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes section - show when inside a folder */}
      {currentFolder !== null && (
        <div className="quizzes-section">
          {/* Shuffle All button when inside folder */}
          {displayedQuizzes.length > 1 && (
            <div className="folder-actions">
              <button
                className="shuffle-all-btn"
                onClick={() => openShuffleModal(currentFolderData)}
              >
                🔀 Shuffle All {displayedQuizzes.length} Quizzes
              </button>
            </div>
          )}
          {displayedQuizzes.length === 0 ? (
            <div className="empty-folder-message">
              This folder is empty.
            </div>
          ) : (
            <div className="quiz-cards">
              {displayedQuizzes.map((file, index) => (
                <div
                  key={index}
                  className="quiz-card"
                >
                  <h3 className="quiz-card-title">{file.replace(".json", "")}</h3>
                  <div className="quiz-card-actions">
                    <button
                      onClick={() => openQuizModal(currentFolder, file)}
                      className="start-quiz-button"
                    >
                      START QUIZ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shuffle Mode Selection Modal */}
      {showShuffleModal && selectedFolderForShuffle && (
        <div className="modal-overlay" onClick={() => setShowShuffleModal(false)}>
          <div className="shuffle-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🔀 Choose Your Mode</h3>
            <p className="shuffle-modal-subtitle">
              {selectedFolderForShuffle.name}
            </p>

            <div className="shuffle-mode-options">
              <button
                className="shuffle-mode-btn quick"
                onClick={() => handleShuffleFolder(selectedFolderForShuffle, 20, "Random 20")}
              >
                <span className="mode-icon">🎲</span>
                <span className="mode-name">Random 20</span>
                <span className="mode-desc">20 questions</span>
              </button>

              <button
                className="shuffle-mode-btn lockin"
                onClick={() => handleShuffleFolder(selectedFolderForShuffle, 50, "Sample Test")}
              >
                <span className="mode-icon">📝</span>
                <span className="mode-name">Sample Test</span>
                <span className="mode-desc">50 questions</span>
              </button>

              <button
                className="shuffle-mode-btn full"
                onClick={() => handleShuffleFolder(selectedFolderForShuffle, null, "Full Quiz")}
              >
                <span className="mode-icon">📚</span>
                <span className="mode-name">Full Quiz</span>
                <span className="mode-desc">All questions</span>
              </button>
            </div>

            <button
              className="shuffle-modal-cancel"
              onClick={() => setShowShuffleModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Individual Quiz Mode Selection Modal */}
      {showQuizModal && selectedQuizForModal && (
        <div className="modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="shuffle-modal quiz-mode-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🎯 Choose Your Mode</h3>
            <p className="shuffle-modal-subtitle">
              {selectedQuizForModal.filename.replace('.json', '')}
            </p>

            <div className="shuffle-mode-options">
              <button
                className="shuffle-mode-btn quick"
                onClick={() => handleQuizSelect(
                  selectedQuizForModal.folderId,
                  selectedQuizForModal.filename,
                  20,
                  "Random 20"
                )}
              >
                <span className="mode-icon">🎲</span>
                <span className="mode-name">Random 20</span>
                <span className="mode-desc">20 questions</span>
              </button>

              <button
                className="shuffle-mode-btn lockin"
                onClick={() => handleQuizSelect(
                  selectedQuizForModal.folderId,
                  selectedQuizForModal.filename,
                  50,
                  "Sample Test"
                )}
              >
                <span className="mode-icon">📝</span>
                <span className="mode-name">Sample Test</span>
                <span className="mode-desc">50 questions</span>
              </button>

              <button
                className="shuffle-mode-btn full"
                onClick={() => handleQuizSelect(
                  selectedQuizForModal.folderId,
                  selectedQuizForModal.filename,
                  null,
                  "Full Quiz"
                )}
              >
                <span className="mode-icon">📚</span>
                <span className="mode-name">Full Quiz</span>
                <span className="mode-desc">All questions</span>
              </button>
            </div>

            <button
              className="shuffle-modal-cancel"
              onClick={() => setShowQuizModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizList;
