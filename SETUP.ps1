# Quick Setup Script for Physical AI RAG Chatbot
# PowerShell Version

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Physical AI RAG Chatbot - Quick Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to my-book directory
Push-Location my-book

# Step 1: Check if .env exists
Write-Host "[1/4] Checking environment configuration..." -ForegroundColor Yellow

if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from template..." -ForegroundColor Gray
    Copy-Item .env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Edit .env and add your OpenAI API key!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The .env file should contain:" -ForegroundColor Gray
    Write-Host "  OPENAI_API_KEY=sk-proj-your-key-here" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Get your key from: https://platform.openai.com/api-keys" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter when you've updated the .env file"
    
    if ([string]::IsNullOrWhiteSpace((Get-Content .env -Raw).Trim())) {
        Write-Host "ERROR: .env file is empty!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""

# Step 2: Check if node_modules exists
Write-Host "[2/4] Checking dependencies..." -ForegroundColor Yellow

if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies (this may take a minute)..." -ForegroundColor Gray
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Step 3: Setup vector database
Write-Host "[3/4] Setting up vector database..." -ForegroundColor Yellow
Write-Host "This may take 5-15 minutes depending on documentation size..." -ForegroundColor Gray
Write-Host ""

npm run setup-vector-db

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Vector database setup failed" -ForegroundColor Red
    Write-Host "Check that your OpenAI API key is correct in .env" -ForegroundColor Yellow
    Pop-Location
    exit 1
}

Write-Host ""
Write-Host "✓ Vector database initialized" -ForegroundColor Green

Write-Host ""

# Step 4: Ready to start
Write-Host "[4/4] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run this command to start the development servers:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then visit:" -ForegroundColor White
Write-Host "  • http://localhost:3000" -ForegroundColor Cyan
Write-Host "  • http://localhost:3000/chat" -ForegroundColor Cyan
Write-Host ""
Write-Host "Use Ctrl+C to stop the servers" -ForegroundColor Gray
Write-Host ""

Pop-Location

Read-Host "Press Enter to exit"
