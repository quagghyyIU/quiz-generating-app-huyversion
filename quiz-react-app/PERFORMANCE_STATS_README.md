# Performance Statistics Feature

## Overview

The Performance Statistics feature provides comprehensive analytics and progress tracking for quiz attempts. This feature helps users understand their performance over time and determine if they're ready to advance to more advanced topics.

## Features

### 1. **Performance Score Display**

- Shows current score as a percentage
- Displays score fraction (e.g., "7 out of 10 questions")
- Visual indicator with emoji based on performance level

### 2. **Performance Rating System**

The system evaluates your performance and provides a safety rating:

| Score Range | Level             | Safety Status  | Recommendation                  |
| ----------- | ----------------- | -------------- | ------------------------------- |
| 90-100%     | Excellent         | SAFE ✅        | Outstanding! Safe to continue   |
| 80-89%      | Very Good         | SAFE ✅        | Great job! Strong understanding |
| 70-79%      | Good              | MOSTLY SAFE 👍 | Good work! Review weak areas    |
| 60-69%      | Fair              | CAUTION ⚠️     | Review before moving forward    |
| 0-59%       | Needs Improvement | NOT SAFE ❌    | Review and try again            |

### 3. **Progress Tracking**

- **Attempt History**: Tracks all quiz attempts with timestamps
- **Statistics Summary**:
  - Total number of attempts
  - Average score across all attempts
  - Best score achieved
  - Most recent score

### 4. **Progress Chart**

- **Line Chart Visualization**: Shows score progression across attempts
- **Reference Lines**: Visual indicators for performance thresholds:
  - Excellent (90%)
  - Good (70%)
  - Fair (60%)
- **Interactive Tooltips**: Hover over points to see detailed information about each attempt
- **Attempt Tracking**: Shows attempt number, score percentage, date, and time

### 5. **Trend Analysis**

Analyzes your last 3 attempts to identify patterns:

- **Improving** 📈: Score increased by more than 10%
- **Stable** ➡️: Score remained consistent
- **Declining** 📉: Score decreased by more than 10%

## How to Use

### 1. Complete a Quiz

Take any quiz in the application and answer all questions.

### 2. View Performance Stats

After completing a quiz, you'll see a "📊 View Performance Stats" button. Click it to access your detailed performance analysis.

### 3. Interpret Your Results

- Check your current score percentage
- Review your safety rating and recommendation
- Examine the progress chart to see improvement over time
- Read the trend analysis for insights

### 4. Clear History (Optional)

If you want to reset your progress for a specific quiz, use the "Clear History" button at the bottom of the stats page.

## Data Storage

All performance data is stored in your browser's localStorage, which means:

- ✅ Data persists between sessions
- ✅ No server or account required
- ✅ Complete privacy - data never leaves your device
- ⚠️ Clearing browser data will erase history
- ⚠️ Data is device-specific (not synced across devices)

## Technical Details

### Storage Format

Data is stored under the key `quiz_performance_history` with the following structure:

```javascript
{
  "quiz-name.json": [
    {
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      timestamp: "2025-10-27T10:30:00.000Z",
      attemptNumber: 1
    },
    // ... more attempts
  ]
}
```

### Components

- **PerformanceStats.js**: Main component for displaying statistics
- **performanceTracker.js**: Utility functions for data management
- **PerformanceStats.css**: Styling with dark mode support

## Dark Mode Support

The Performance Stats feature fully supports both light and dark themes. The color scheme automatically adapts based on your theme preference.

## Browser Compatibility

- ✅ Chrome, Edge, Firefox, Safari (latest versions)
- ✅ Requires JavaScript enabled
- ✅ Requires localStorage support

## Tips for Best Results

1. **Complete Multiple Attempts**: The more attempts you make, the more meaningful your progress tracking becomes.
2. **Review Between Attempts**: Use the "Review Answers" feature to understand mistakes before retrying.
3. **Track Your Trend**: Pay attention to whether you're improving, stable, or declining.
4. **Use the Safety Rating**: Don't rush to the next topic if rated "NOT SAFE" - review the material first.
5. **Set Goals**: Aim for at least 80% (SAFE) before moving to advanced topics.

## Future Enhancements (Potential)

- Export performance data
- Compare performance across different quizzes
- Time-based analytics (performance by time of day)
- Spaced repetition recommendations
- Performance badges and achievements

## Questions or Issues?

If you encounter any issues with the Performance Stats feature, try:

1. Refreshing the page
2. Clearing browser cache
3. Checking browser console for errors

---

**Happy Learning! 📚✨**

