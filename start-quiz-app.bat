@echo off
echo ========================================
echo   Quiz App - Setup and Start
echo ========================================
echo.

cd quiz-react-app

echo [1/2] Installing dependencies...
echo.
call npm install

echo.
echo [2/2] Starting the app...
echo.
echo The app will open in your browser at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

pause

