#!/bin/bash

# Proto File Watcher
# Automatically regenerates types when .proto files change

PROTO_DIR="/workspace/proto"
LAST_HASH=""

echo "🔍 Proto Watcher Started"
echo "📁 Watching directory: $PROTO_DIR"
echo "⚡ Types will auto-generate on .proto file changes"
echo "-------------------------------------------"

# Function to calculate hash of proto files
calculate_hash() {
    if [ -d "$PROTO_DIR" ]; then
        find "$PROTO_DIR" -name "*.proto" -type f -exec md5sum {} \; 2>/dev/null | sort | md5sum | cut -d' ' -f1
    else
        echo ""
    fi
}

# Function to generate types
generate_types() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Detected proto changes, generating types..."
    
    # Run buf generate
    cd /workspace/proto
    if buf generate; then
        echo "✅ Backend types generated successfully"
        echo "✅ Frontend types generated successfully"
        echo "📦 Backend types: /workspace/apps/backend/gen/"
        echo "📦 Frontend types: /workspace/apps/frontend/src/gen/"
        echo "-------------------------------------------"
    else
        echo "❌ Error generating types!"
        echo "-------------------------------------------"
    fi
}

# Initial generation
echo "🚀 Running initial type generation..."
generate_types

# Watch for changes
echo "👀 Watching for proto file changes..."
while true; do
    CURRENT_HASH=$(calculate_hash)
    
    if [ "$LAST_HASH" != "$CURRENT_HASH" ]; then
        if [ ! -z "$LAST_HASH" ]; then  # Skip first iteration
            generate_types
        fi
        LAST_HASH=$CURRENT_HASH
    fi
    
    sleep 2  # Check every 2 seconds
done