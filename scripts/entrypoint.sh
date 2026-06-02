#!/bin/sh

# Ensure database directory exists
mkdir -p /app/data

# Run database push/migration using drizzle-kit
echo "Running database schema migrations..."
npx drizzle-kit push

# Start the application
echo "Starting Money Engine AI web server..."
node server.js
