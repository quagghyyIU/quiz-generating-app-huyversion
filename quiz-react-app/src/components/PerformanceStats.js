import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  getQuizHistory,
  getPerformanceRating,
  calculateTrend,
  getStatistics,
  clearQuizHistory,
} from "../utils/performanceTracker";
import "../css/PerformanceStats.css";

function PerformanceStats({ quizName, currentScore, totalQuestions }) {
  const [history, setHistory] = useState([]);
  const [showChart, setShowChart] = useState(true);
  const hasCurrentScore =
    currentScore !== undefined && totalQuestions !== undefined;

  useEffect(() => {
    const quizHistory = getQuizHistory(quizName);
    setHistory(quizHistory);
  }, [quizName]);

  const currentPercentage = hasCurrentScore
    ? Math.round((currentScore / totalQuestions) * 100)
    : null;
  const rating = hasCurrentScore
    ? getPerformanceRating(currentPercentage)
    : null;
  const trend = calculateTrend(history);
  const stats = getStatistics(history);

  // Prepare chart data
  const chartData = history.map((attempt, index) => ({
    name: `#${attempt.attemptNumber}`,
    score: attempt.percentage,
    date: new Date(attempt.timestamp).toLocaleDateString(),
    time: new Date(attempt.timestamp).toLocaleTimeString(),
  }));

  const handleClearHistory = () => {
    if (
      window.confirm(
        `Are you sure you want to clear all history for "${quizName}"? This cannot be undone.`
      )
    ) {
      clearQuizHistory(quizName);
      setHistory([]);
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">
            <strong>{data.name}</strong>
          </p>
          <p className="score">Score: {data.score}%</p>
          <p className="date">{data.date}</p>
          <p className="time">{data.time}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="performance-stats-container">
      {/* Current Score and Rating Combined - Only show if currentScore is provided */}
      {hasCurrentScore && rating && (
        <div className="score-and-rating-container">
          <div
            className="current-score-card"
            style={{ borderColor: rating.color }}
          >
            <span className="score-emoji">{rating.emoji}</span>
            <div className="score-details">
              <div className="score-percentage" style={{ color: rating.color }}>
                {currentPercentage}%
              </div>
              <p className="score-fraction">
                {currentScore} out of {totalQuestions} questions
              </p>
            </div>
          </div>

          <div
            className="rating-card"
            style={{ borderLeftColor: rating.color }}
          >
            <div className="rating-header">
              <h3 style={{ color: rating.color }}>{rating.level}</h3>
              <span
                className="safety-badge"
                style={{
                  backgroundColor: rating.color,
                  color: "white",
                }}
              >
                {rating.safety}
              </span>
            </div>
            <p className="rating-message">{rating.message}</p>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {history.length > 0 && (
        <div className="stats-summary">
          <h3>📈 Summary Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Attempts</span>
              <span className="stat-value">{stats.attempts}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Score</span>
              <span className="stat-value">{stats.averageScore}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Best Score</span>
              <span className="stat-value">{stats.bestScore}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Last Score</span>
              <span className="stat-value">{stats.lastScore}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Trend Indicator */}
      {history.length >= 2 && (
        <div className="trend-card" style={{ borderLeftColor: trend.color }}>
          <h4>📊 Progress Trend</h4>
          <p style={{ color: trend.color }}>{trend.message}</p>
        </div>
      )}

      {/* Progress Chart */}
      {history.length > 0 && (
        <div className="chart-section">
          <div className="chart-header">
            <h3>📉 Progress Over Time</h3>
            <button
              className="toggle-chart-btn"
              onClick={() => setShowChart(!showChart)}
            >
              {showChart ? "Hide Chart" : "Show Chart"}
            </button>
          </div>

          {showChart && (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                  />
                  <XAxis dataKey="name" stroke="var(--text-primary)" />
                  <YAxis
                    domain={[0, 100]}
                    stroke="var(--text-primary)"
                    label={{
                      value: "Score (%)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "var(--text-primary)",
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* Reference lines for different performance levels */}
                  <ReferenceLine
                    y={90}
                    stroke="#4caf50"
                    strokeDasharray="3 3"
                    label="Excellent"
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#ffc107"
                    strokeDasharray="3 3"
                    label="Good"
                  />
                  <ReferenceLine
                    y={60}
                    stroke="#ff9800"
                    strokeDasharray="3 3"
                    label="Fair"
                  />

                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2196f3"
                    strokeWidth={3}
                    dot={{ fill: "#2196f3", r: 5 }}
                    activeDot={{ r: 8 }}
                    name="Score (%)"
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="chart-legend-info">
                <p>
                  <strong>Tip:</strong> Hover over the points to see detailed
                  information about each attempt.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No History Message */}
      {history.length === 0 && (
        <div className="no-history-message">
          <p>🎯 This is your first attempt at this quiz!</p>
          <p>Keep practicing to track your progress over time.</p>
        </div>
      )}

      {/* Action Buttons */}
      {history.length > 0 && (
        <div className="stats-actions">
          <button className="clear-history-btn" onClick={handleClearHistory}>
            CLEAR HISTORY
          </button>
        </div>
      )}
    </div>
  );
}

export default PerformanceStats;
