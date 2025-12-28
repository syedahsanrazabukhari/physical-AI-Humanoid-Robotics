#!/bin/bash

# Quick Setup Script for Physical AI RAG Chatbot
# macOS/Linux Version

set -e  # Exit on any error

echo ""
echo "============================================"
echo "Physical AI RAG Chatbot - Quick Setup"
echo "============================================"
echo ""

cd my-book

# Step 1: Check if .env exists
echo "[1/4] Checking environment configuration..."

if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "IMPORTANT: Edit .env and add your OpenAI API key!"
    echo ""
    echo "The .env file should contain:"
    echo "  OPENAI_API_KEY=sk-proj-your-key-here"
    echo ""
    echo "Get your key from: https://platform.openai.com/api-keys"
    echo ""
    read -p "Press Enter when you've updated the .env file: "
    
    if [ ! -s .env ]; then
        echo "ERROR: .env file is empty!"
        exit 1
    fi
else
    echo "✓ .env file already exists"
fi

echo ""

# Step 2: Check if node_modules exists
echo "[2/4] Checking dependencies..."

if [ ! -d node_modules ]; then
    echo "Installing dependencies (this may take a minute)..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

echo ""

# Step 3: Setup vector database
echo "[3/4] Setting up vector database..."
echo "This may take 5-15 minutes depending on documentation size..."
echo ""

npm run setup-vector-db

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Vector database setup failed"
    echo "Check that your OpenAI API key is correct in .env"
    exit 1
fi

echo ""
echo "✓ Vector database initialized"

echo ""

# Step 4: Ready to start
echo "[4/4] Setup complete!"
echo ""
echo "============================================"
echo "Next steps:"
echo "============================================"
echo ""
echo "Run this command to start the development servers:"
echo "  npm run dev"
echo ""
echo "Then visit:"
echo "  • http://localhost:3000"
echo "  • http://localhost:3000/chat"
echo ""
echo "Use Ctrl+C to stop the servers"
echo ""

read -p "Press Enter to exit"
