#!/bin/bash
set -e

echo "📦 Tidying Go modules..."
go mod tidy

echo "📥 Downloading Go dependencies..."
go mod download

echo "🔨 Building server..."
go build -o bin/server ./cmd/server

echo "✅ Build complete!"
ls -lh bin/server
