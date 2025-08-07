#!/bin/bash

echo "🚀 Setting up Collaborative Code Editor..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing server dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo "🔧 Creating environment file..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file from template"
else
    echo "⚠️  .env file already exists"
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Copy env.example to .env and configure if needed"
echo "3. Run 'npm run dev' to start the application"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🎯" 