import React from "react";
import "./css/App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Quiz from "./Quiz";
import QuizList from "./QuizList";
import StatsView from "./StatsView";
import { ThemeProvider } from "./ThemeContext";
import DarkModeToggle from "./components/DarkModeToggle";

function App() {
  return (
    <ThemeProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <div className="App">
          <header className="App-header">
            <div className="header-left">
              <h1>Quiz</h1>
              <nav>
                <Link to="/" className="nav-link">
                  Quiz List
                </Link>
                <Link to="/stats" className="nav-link">
                  Stats
                </Link>
              </nav>
            </div>
            <div className="header-right">
              <DarkModeToggle />
            </div>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<QuizList />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/stats" element={<StatsView />} />
            </Routes>
          </main>
          <footer className="App-footer">
            <p>Test your knowledge!</p>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
