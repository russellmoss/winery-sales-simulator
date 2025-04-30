#!/bin/bash

# Build the client
echo "Building client..."
cd client
npm install
npm run build
cd ..

# Start the Vercel-like server
echo "Starting Vercel-like development server..."
cd server
npm run vercel-dev 