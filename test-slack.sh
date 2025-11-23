#!/bin/bash

# Slack Integration Test Script
# Usage: ./test-slack.sh [backend-url]
# Example: ./test-slack.sh http://localhost:8080

BACKEND_URL="${1:-http://localhost:8080}"

echo "🧪 Testing Slack Integration"
echo "Backend URL: $BACKEND_URL"
echo ""

# Test 1: Check if Slack is enabled
echo "📋 Test 1: Check Slack Integration Status"
curl -s "$BACKEND_URL/api/v1/slack/test" | json_pp
echo ""
echo ""

# Test 2: Send simple message
echo "📋 Test 2: Send Simple Message"
curl -s -X POST "$BACKEND_URL/api/v1/slack/send" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "🧪 Test message from test-slack.sh script"
  }' | json_pp
echo ""
echo ""

# Test 3: Send alert
echo "📋 Test 3: Send Warning Alert"
curl -s -X POST "$BACKEND_URL/api/v1/slack/alert" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Alert",
    "message": "This is a test warning alert from the test script",
    "type": "warning",
    "details": {
      "Test": "Warning Alert",
      "Source": "test-slack.sh",
      "Time": "'$(date +"%Y-%m-%d %H:%M:%S")'"
    }
  }' | json_pp
echo ""
echo ""

# Test 4: Send success notification
echo "📋 Test 4: Send Success Alert"
curl -s -X POST "$BACKEND_URL/api/v1/slack/alert" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Success",
    "message": "This is a test success notification",
    "type": "success",
    "details": {
      "Status": "✅ All tests passing",
      "Source": "test-slack.sh"
    }
  }' | json_pp
echo ""
echo ""

# Test 5: Send user event notification
echo "📋 Test 5: Send User Event Notification"
curl -s -X POST "$BACKEND_URL/api/v1/slack/notification" \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "user_event",
    "event_type": "registration",
    "user_email": "test@example.com",
    "user_name": "Test User",
    "details": {
      "Source": "Test Script",
      "Device": "CLI"
    }
  }' | json_pp
echo ""
echo ""

# Test 6: Send admin activity notification
echo "📋 Test 6: Send Admin Activity Notification"
curl -s -X POST "$BACKEND_URL/api/v1/slack/notification" \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "admin_activity",
    "admin_email": "admin@datifyy.com",
    "action": "Test Action",
    "target": "test-slack.sh",
    "details": {
      "Action": "Running integration tests",
      "Time": "'$(date +"%Y-%m-%d %H:%M:%S")'"
    }
  }' | json_pp
echo ""
echo ""

# Test 7: Send system alert notification
echo "📋 Test 7: Send System Alert Notification"
curl -s -X POST "$BACKEND_URL/api/v1/slack/notification" \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "system_alert",
    "component": "Test Component",
    "error_msg": "This is a test system alert",
    "severity": "medium"
  }' | json_pp
echo ""
echo ""

# Test 8: Send AI match notification
echo "📋 Test 8: Send AI Match Notification"
curl -s -X POST "$BACKEND_URL/api/v1/slack/notification" \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "ai_match",
    "user_id": "test_user_123",
    "matches": 5,
    "avg_score": 87.5
  }' | json_pp
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "Check your Slack channel for messages!"
