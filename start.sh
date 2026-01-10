#!/bin/bash

# Start backend server in background
cd backend
node src/server.js &
BACKEND_PID=$!

# Start frontend server
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
