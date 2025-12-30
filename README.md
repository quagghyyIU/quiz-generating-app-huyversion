# 📚 Quiz App (Huy's Version)

A React-based quiz application with modern dark mode UI, folder organization, multiple quiz modes, and performance tracking. Forked and enhanced from the original networking quiz app.

## ✨ Features

### Quiz Organization
- 📁 **Folder-based organization** - Quizzes are organized into folders for easy navigation
- 🔀 **Shuffle All** - Combine all quizzes in a folder into one shuffled test
- 📄 **Individual Quizzes** - Take quizzes one at a time

### Quiz Modes

**For Shuffle All (folder mode):**
| Mode | Questions | Icon |
|------|-----------|------|
| 🚀 Quick Refresh | 20 questions | Fast review |
| 🔥 Lock-in Mode | 50 questions | Focused practice |

**For Individual Quizzes:**
| Mode | Questions | Icon |
|------|-----------|------|
| ⚡ Fast Pace | 20 questions max | Speed run |
| 🎯 Quiz Oriented | 50 questions max | Balanced practice |
| 📚 Full Quiz | All questions | Complete test |

### Randomization
- 🔀 **Fisher-Yates shuffle** - Proper randomization algorithm for both questions and answers
- 🔄 **Fresh random on restart** - Every restart picks new random questions (for limited modes)
- 🎲 **Answer shuffling** - Answer order is randomized for each question

### Study Features
- 🎯 **Practice Mode** - Practice wrong answers after completing a quiz
- 📊 **Performance Stats** - Track your progress with attempt history
- 📝 **Answer Review** - Review all answers after completing
- ⌨️ **Keyboard Shortcuts** - Use 1, 2, 3, 4 keys to quickly select answers

### UI/UX
- 🌙 **Dark Mode** - Modern dark theme with smooth aesthetics
- 📱 **Responsive Design** - Works on all screen sizes
- ✨ **Progress Bar** - Visual progress indicator
- 🎨 **Color-coded Feedback** - Instant correct/incorrect answer feedback

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed

### Installation

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate to the app directory
cd quiz-react-app

# Install dependencies
npm install
```

### Running the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

**Quick Start Scripts (Windows):**
- `start-quiz-app.bat` - Start the app normally
- `start-quiz-app-quick.bat` - Quick start
- `start-quiz-app-new-window.bat` - Start in new window

## 📂 Adding Quizzes

### Folder Structure
```
public/data/
├── index.json          # Auto-generated folder index
├── Networking/
│   ├── chapter1.json
│   └── chapter2.json
├── Programming/
│   ├── python.json
│   └── javascript.json
└── uncategorized/
    └── misc.json
```

### Quiz JSON Format
```json
[
  {
    "question": "What is the capital of France?",
    "answers": [
      "London",
      "Berlin",
      "Paris",
      "Madrid"
    ],
    "correct_answer": 2
  }
]
```

> **Note:** `correct_answer` is 0-indexed (0 = first answer, 1 = second, etc.)

### Generating Quiz Content
Use Google AI Studio with Gemini 2.0 Flash to generate quiz questions in the JSON format above.

## 🛠️ Technologies

- **React** - Frontend framework
- **React Router** - Navigation
- **CSS3** - Modern styling with CSS variables

## 📝 Original Credits

Forked from the original quiz app and enhanced with additional features.

## 📄 License

MIT License
