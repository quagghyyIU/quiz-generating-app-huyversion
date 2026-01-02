@echo off
title Quiz App Launcher
echo ==========================================
echo      Starting Quiz Generating App
echo ==========================================

cd quiz-react-app

if not exist node_modules (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
)

echo [INFO] Starting the app...
call npm start

pause
