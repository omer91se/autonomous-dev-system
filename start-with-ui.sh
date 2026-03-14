#!/bin/bash

# Autonomous Dev System - Start with UI
# This script ensures the UI is running before starting the build

set -e

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║              Autonomous Dev System - UI Edition Launcher                  ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if app idea is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your app idea"
    echo ""
    echo "Usage: ./start-with-ui.sh \"Your app idea\""
    echo "Example: ./start-with-ui.sh \"A todo list app with priorities\""
    echo ""
    exit 1
fi

APP_IDEA="$1"

echo "📋 App Idea: $APP_IDEA"
echo ""

# Check if UI is already running
echo "🔍 Checking if UI dashboard is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ UI is already running at http://localhost:3000"
    echo ""
else
    echo "⚠️  UI is not running. Starting it now..."
    echo ""

    # Check if ui/node_modules exists
    if [ ! -d "ui/node_modules" ]; then
        echo "📦 Installing UI dependencies (first time only)..."
        cd ui
        npm install
        cd ..
        echo ""
    fi

    # Start UI in background
    echo "🚀 Starting UI dashboard..."
    cd ui
    npm run dev > ../ui.log 2>&1 &
    UI_PID=$!
    cd ..

    echo "⏳ Waiting for UI to start..."
    sleep 5

    # Check if UI started successfully
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ UI started successfully!"
        echo "📊 Dashboard: http://localhost:3000"
        echo "🔌 WebSocket: ws://localhost:3001"
        echo ""
    else
        echo "❌ Failed to start UI. Check ui.log for errors."
        exit 1
    fi
fi

# Run the orchestrator
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🤖 Starting Autonomous Build Process"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "👀 WATCH THE MAGIC HAPPEN:"
echo "   Open http://localhost:3000 in your browser!"
echo ""
echo "Press Ctrl+C to stop"
echo ""
sleep 2

# Run orchestrator
tsx orchestrate-ui.ts "$APP_IDEA"

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "✨ Build process complete!"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Your app is in: ./output/generated-project/"
echo ""
echo "To stop the UI dashboard:"
echo "  ps aux | grep 'npm run dev' | grep -v grep | awk '{print \$2}' | xargs kill"
echo ""
