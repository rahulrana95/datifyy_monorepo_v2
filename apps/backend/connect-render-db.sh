#!/bin/bash

# Script to connect to Render PostgreSQL database
# Usage: ./connect-render-db.sh

# Replace this with your External Database URL from Render Dashboard
# Add sslmode=require for Render PostgreSQL
RENDER_DB_URL="postgresql://admin123:EGLGmwBkfN34SnCZXqA5YDLbXTYYP69w@dpg-cpu1nn1u0jms73eht15g-a.oregon-postgres.render.com/multi_product_db?sslmode=require&sslrootcert=system"
echo "Connecting to Render PostgreSQL database..."
echo "Make sure to update RENDER_DB_URL in this script with your actual External Database URL"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null
then
    echo "psql command not found!"
    echo "Please install PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Connect to database
psql "$RENDER_DB_URL"
