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
    echo "Usage: ./start-with-ui.sh \"Your app idea\" [UI_PORT] [WS_PORT]"
    echo "Example: ./start-with-ui.sh \"A todo list app with priorities\""
    echo "Example: ./start-with-ui.sh \"A blog app\" 3002 3003"
    echo ""
    exit 1
fi

APP_IDEA="$1"
UI_PORT="${2:-${NEXT_PUBLIC_UI_PORT:-3000}}"
WS_PORT="${3:-${NEXT_PUBLIC_WS_PORT:-3001}}"

echo "📋 App Idea: $APP_IDEA"
echo "🔧 UI Port: $UI_PORT"
echo "🔧 WebSocket Port: $WS_PORT"
echo ""

# Check if UI is already running on specified port or scan common ports
echo "🔍 Checking if UI dashboard is running..."
UI_FOUND=false
DETECTED_PORT=""

# First check specified port
if curl -s http://localhost:$UI_PORT > /dev/null 2>&1; then
    UI_FOUND=true
    DETECTED_PORT=$UI_PORT
else
    # Scan common ports (3000-3005)
    for port in 3000 3001 3002 3003 3004 3005; do
        if curl -s http://localhost:$port > /dev/null 2>&1; then
            UI_FOUND=true
            DETECTED_PORT=$port
            UI_PORT=$port
            # Assume WS is next port
            WS_PORT=$((port + 1))
            break
        fi
    done
fi

if [ "$UI_FOUND" = true ]; then
    echo "✅ UI is already running at http://localhost:$DETECTED_PORT"
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

    # Start UI in background with custom ports
    echo "🚀 Starting UI dashboard on port $UI_PORT..."
    cd ui
    NEXT_PUBLIC_UI_PORT=$UI_PORT NEXT_PUBLIC_WS_PORT=$WS_PORT npm run dev > ../ui.log 2>&1 &
    UI_PID=$!
    cd ..

    echo "⏳ Waiting for UI to start..."
    sleep 5

    # Check if UI started successfully
    if curl -s http://localhost:$UI_PORT > /dev/null 2>&1; then
        echo "✅ UI started successfully!"
        echo "📊 Dashboard: http://localhost:$UI_PORT"
        echo "🔌 WebSocket: ws://localhost:$WS_PORT"
        echo ""

        # Open Chrome automatically (unless NO_BROWSER is set)
        if [ -z "$NO_BROWSER" ]; then
            echo "🌐 Opening Chrome browser..."
            if command -v open &> /dev/null; then
                # macOS
                open -a "Google Chrome" "http://localhost:$UI_PORT" 2>/dev/null || \
                open "http://localhost:$UI_PORT"
            elif command -v google-chrome &> /dev/null; then
                # Linux
                google-chrome "http://localhost:$UI_PORT" &
            else
                echo "⚠️  Could not auto-open Chrome. Please open http://localhost:$UI_PORT manually."
            fi
            echo ""
        else
            echo "ℹ️  Auto-open disabled. Please open http://localhost:$UI_PORT manually."
            echo ""
        fi
    else
        echo "❌ Failed to start UI on port $UI_PORT. Check ui.log for errors."
        echo "💡 Tip: Port might be taken. Try: ./start-with-ui.sh \"$APP_IDEA\" 3002 3003"
        exit 1
    fi
fi

# Run the orchestrator
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🤖 Starting Autonomous Build Process"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "👀 WATCH THE MAGIC HAPPEN IN CHROME!"
echo "   Dashboard opened at: http://localhost:$UI_PORT"
echo ""
echo "Press Ctrl+C to stop"
echo ""
sleep 2

# Run orchestrator with port configuration
NEXT_PUBLIC_UI_PORT=$UI_PORT NEXT_PUBLIC_WS_PORT=$WS_PORT tsx orchestrate-ui.ts "$APP_IDEA"

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
