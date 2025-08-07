@echo off
echo 🚀 Setting up Collaborative Code Editor...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo 📦 Installing server dependencies...
npm install

echo 📦 Installing client dependencies...
cd client
npm install
cd ..

echo 🔧 Creating environment file...
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file from template
) else (
    echo ⚠️  .env file already exists
)

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Copy env.example to .env and configure if needed
echo 3. Run 'npm run dev' to start the application
echo 4. Open http://localhost:3000 in your browser
echo.
echo Happy coding! 🎯
pause 