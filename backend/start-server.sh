#!/bin/bash

echo "🚀 Starting OpenHub AI Backend Server..."

# Check if port 5001 is already in use
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5001 is already in use. Stopping existing process..."
    lsof -ti:5001 | xargs kill -9
    sleep 2
fi

# Start the server
echo "📡 Starting server on port 5001..."
nohup node index.js > server.log 2>&1 &

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 3

# Check if server is running
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Server is running successfully on port 5001"
    echo "📊 Server log: tail -f server.log"
    echo "🛑 To stop: pkill -f 'node index.js'"
else
    echo "❌ Failed to start server. Check server.log for details."
    exit 1
fi
