#!/bin/bash

# Test Runner Script for Datifyy Monorepo

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Running Tests for Datifyy Monorepo"
echo "======================================"

# Check if running in Docker or locally
if [ -f /.dockerenv ]; then
    DOCKER_ENV=true
else
    DOCKER_ENV=false
fi

# Backend Tests
run_backend_tests() {
    echo -e "\n${YELLOW}Running Backend Tests...${NC}"
    
    if [ "$DOCKER_ENV" = true ]; then
        cd /app && go test -v ./...
    else
        cd apps/backend && go test -v ./...
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend tests passed${NC}"
    else
        echo -e "${RED}✗ Backend tests failed${NC}"
        exit 1
    fi
}

# Frontend Tests
run_frontend_tests() {
    echo -e "\n${YELLOW}Running Frontend Tests...${NC}"
    
    if [ "$DOCKER_ENV" = true ]; then
        cd /app && npm test -- --watchAll=false
    else
        cd apps/frontend && npm test -- --watchAll=false
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend tests passed${NC}"
    else
        echo -e "${RED}✗ Frontend tests failed${NC}"
        exit 1
    fi
}

# Integration Tests
run_integration_tests() {
    echo -e "\n${YELLOW}Running Integration Tests...${NC}"
    
    # Check if database is available
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}Skipping integration tests (DATABASE_URL not set)${NC}"
        return
    fi
    
    if [ "$DOCKER_ENV" = true ]; then
        cd /app && go test -v -tags=integration ./tests
    else
        cd apps/backend && go test -v -tags=integration ./tests
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Integration tests passed${NC}"
    else
        echo -e "${RED}✗ Integration tests failed${NC}"
        exit 1
    fi
}

# Main execution
case "${1:-all}" in
    backend)
        run_backend_tests
        ;;
    frontend)
        run_frontend_tests
        ;;
    integration)
        run_integration_tests
        ;;
    all)
        run_backend_tests
        run_frontend_tests
        run_integration_tests
        ;;
    *)
        echo "Usage: $0 {backend|frontend|integration|all}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}All tests completed successfully!${NC}"