#!/bin/bash

echo "🚀 Setting up Notes API..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it from https://bun.sh/"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration!"
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL is not running. You can start it with:"
    echo "   docker-compose up -d"
    echo ""
    read -p "Would you like to start PostgreSQL with Docker now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose up -d
        echo "⏳ Waiting for PostgreSQL to be ready..."
        sleep 5
    else
        echo "⚠️  Please start PostgreSQL manually and run this script again."
        exit 1
    fi
fi

# Run migrations
echo "🗄️  Running database migrations..."
bun run migrate:up

# Run tests
echo "🧪 Running tests..."
bun test

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   bun run dev"
echo ""
echo "📚 API will be available at: http://localhost:3000/api/v1"
