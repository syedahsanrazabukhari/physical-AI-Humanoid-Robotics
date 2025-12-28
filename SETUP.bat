@echo off
REM Quick Setup Script for Physical AI RAG Chatbot
REM This script automates the setup process

echo.
echo ============================================
echo Physical AI RAG Chatbot - Quick Setup
echo ============================================
echo.

cd my-book

REM Step 1: Check if .env exists
if not exist .env (
    echo [1/4] Creating .env file...
    copy .env.example .env
    echo ✓ .env file created
    echo.
    echo IMPORTANT: Edit .env and add your OpenAI API key!
    echo Then re-run this script.
    pause
    exit /b
) else (
    echo [1/4] ✓ .env file exists
)

echo.

REM Step 2: Check if node_modules exists
if not exist node_modules (
    echo [2/4] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
) else (
    echo [2/4] ✓ Dependencies already installed
)

echo.

REM Step 3: Setup vector database
echo [3/4] Setting up vector database...
echo This may take 5-15 minutes...
call npm run setup-vector-db
if errorlevel 1 (
    echo ERROR: Vector database setup failed
    echo Check that your OpenAI API key is correct in .env
    pause
    exit /b 1
)
echo ✓ Vector database initialized

echo.

REM Step 4: Ready to start
echo [4/4] Setup complete!
echo.
echo ============================================
echo Next steps:
echo ============================================
echo.
echo Run this command to start the development servers:
echo   npm run dev
echo.
echo Then visit:
echo   http://localhost:3000 - Docusaurus site
echo   http://localhost:3000/chat - Chat interface
echo.
echo.
pause
