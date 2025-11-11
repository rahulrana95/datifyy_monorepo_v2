#!/bin/bash

# Vercel Deployment Script for Datifyy Monorepo

set -e

echo "🚀 Starting Vercel Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm i -g vercel
fi

# Function to deploy frontend
deploy_frontend() {
    echo "📦 Deploying Frontend to Vercel..."
    cd apps/frontend
    
    # Install dependencies
    npm install
    
    # Build the application
    npm run build
    
    # Deploy to Vercel
    if [ "$1" = "production" ]; then
        vercel --prod
    else
        vercel
    fi
    
    cd ../..
}

# Function to deploy backend
deploy_backend() {
    echo "⚡ Deploying Backend to Vercel..."
    cd apps/backend
    
    # Deploy to Vercel
    if [ "$1" = "production" ]; then
        vercel --prod
    else
        vercel
    fi
    
    cd ../..
}

# Main deployment logic
case "$1" in
    frontend)
        deploy_frontend "$2"
        ;;
    backend)
        deploy_backend "$2"
        ;;
    all)
        deploy_frontend "$2"
        deploy_backend "$2"
        ;;
    *)
        echo "Usage: $0 {frontend|backend|all} [production]"
        echo "Examples:"
        echo "  $0 frontend          # Deploy frontend to preview"
        echo "  $0 backend production # Deploy backend to production"
        echo "  $0 all production     # Deploy both to production"
        exit 1
        ;;
esac

echo "✅ Deployment completed!"