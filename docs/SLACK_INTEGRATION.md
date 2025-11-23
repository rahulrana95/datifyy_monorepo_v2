# Slack Integration Guide

Complete guide for integrating Slack notifications into the Datifyy backend.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [API Endpoints](#api-endpoints)
4. [Usage Examples](#usage-examples)
5. [Message Types](#message-types)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Overview

The Datifyy backend includes a comprehensive Slack integration service that allows you to send notifications, alerts, and messages to Slack channels. This is useful for:

- **User Events**: New registrations, verifications, deletions
- **Admin Activities**: Admin actions and system changes
- **System Alerts**: Critical errors, warnings, and system status
- **AI Match Events**: AI-powered compatibility analysis results
- **Custom Notifications**: Any custom message or alert

### Features

- ✅ Simple text messages
- ✅ Formatted messages with attachments
- ✅ Color-coded alerts (success, warning, danger, info)
- ✅ Rich notifications with custom fields
- ✅ Pre-built templates for common events
- ✅ Graceful degradation (disabled if no webhook URL)
- ✅ HTTP endpoints for easy integration
- ✅ Context-aware error handling

## Setup

### Step 1: Create a Slack Webhook URL

1. **Go to Slack API**: https://api.slack.com/apps
2. **Create New App** or select existing app
3. **Enable Incoming Webhooks**:
   - Go to "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks" to On
4. **Add New Webhook to Workspace**:
   - Click "Add New Webhook to Workspace"
   - Select the channel (e.g., `#notifications`, `#alerts`)
   - Click "Allow"
5. **Copy Webhook URL**:
   - You'll get a URL like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`

### Step 2: Configure Environment Variable

#### Development (Docker Compose)

```bash
# In your shell or .env file
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Restart backend
docker-compose restart backend
```

#### Production (Render/Vercel)

```bash
# Render Dashboard:
# Go to: Your Service → Environment
# Add variable:
#   Key: SLACK_WEBHOOK_URL
#   Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Vercel Dashboard:
# Go to: Project → Settings → Environment Variables
# Add:
#   SLACK_WEBHOOK_URL = https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 3: Verify Integration

```bash
# Test endpoint
curl http://localhost:8080/api/v1/slack/test

# Expected response:
{
  "enabled": true,
  "success": true,
  "message": "Test message sent successfully to Slack!",
  "sent_at": "2025-11-23 12:00:00"
}

# Check your Slack channel for the test message!
```

## API Endpoints

All Slack endpoints are prefixed with `/api/v1/slack/`.

### 1. Send Simple Message

```bash
POST /api/v1/slack/send
```

**Request Body**:
```json
{
  "message": "Hello from Datifyy Backend!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Message sent to Slack"
}
```

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/v1/slack/send \
  -H "Content-Type: application/json" \
  -d '{"message": "New user registered!"}'
```

### 2. Send Alert

```bash
POST /api/v1/slack/alert
```

**Request Body**:
```json
{
  "title": "Database Connection Error",
  "message": "Failed to connect to PostgreSQL",
  "type": "alert",  // alert | success | warning | info
  "details": {
    "Error": "connection refused",
    "Host": "db.example.com",
    "Time": "2025-11-23 12:00:00"
  }
}
```

**Types**:
- `alert` (default): Red color, 🚨 emoji
- `success`: Green color, ✅ emoji
- `warning`: Orange color, ⚠️ emoji
- `info`: Blue color, ℹ️ emoji

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/v1/slack/alert \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Alert",
    "message": "High memory usage detected",
    "type": "warning",
    "details": {
      "Memory": "95%",
      "Server": "backend-1"
    }
  }'
```

### 3. Send Notification

```bash
POST /api/v1/slack/notification
```

Supports multiple notification types with specialized formatting:

#### User Event Notification

```json
{
  "notification_type": "user_event",
  "event_type": "registration",  // registration | verification | deletion | suspension
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "details": {
    "Source": "Mobile App",
    "Device": "iOS"
  }
}
```

**Event Types**:
- `registration`: 👤 New user registration
- `verification`: ✅ User verification completed
- `deletion`: 🗑️ User account deleted
- `suspension`: ⛔ User account suspended

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/v1/slack/notification \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "user_event",
    "event_type": "registration",
    "user_email": "newuser@example.com",
    "user_name": "Jane Smith",
    "details": {
      "Source": "Web",
      "Referral": "Google Ads"
    }
  }'
```

#### Admin Activity Notification

```json
{
  "notification_type": "admin_activity",
  "admin_email": "admin@datifyy.com",
  "action": "User Status Update",
  "target": "user@example.com",
  "details": {
    "Old Status": "PENDING",
    "New Status": "ACTIVE",
    "Reason": "Manual verification"
  }
}
```

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/v1/slack/notification \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "admin_activity",
    "admin_email": "admin@datifyy.com",
    "action": "Deleted User",
    "target": "spammer@example.com",
    "details": {
      "Reason": "Spam",
      "IP": "192.168.1.1"
    }
  }'
```

#### System Alert Notification

```json
{
  "notification_type": "system_alert",
  "component": "PostgreSQL",
  "error_msg": "Connection pool exhausted",
  "severity": "critical"  // critical | high | medium | low
}
```

**Severity Levels**:
- `critical`: 🔴 Red
- `high`: 🟠 Orange
- `medium`: 🟡 Yellow
- `low`: 🔵 Blue

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/v1/slack/notification \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "system_alert",
    "component": "Redis",
    "error_msg": "Memory usage above 90%",
    "severity": "high"
  }'
```

#### AI Match Notification

```json
{
  "notification_type": "ai_match",
  "user_id": "123",
  "matches": 5,
  "avg_score": 85.5
}
```

**curl Example**:
```bash
curl -X POST http://localhost:8080/api/v1/slack/notification \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "ai_match",
    "user_id": "51",
    "matches": 3,
    "avg_score": 92.3
  }'
```

### 4. Test Slack Integration

```bash
GET /api/v1/slack/test
POST /api/v1/slack/test
```

Sends a test message to verify Slack integration is working.

**Response (enabled)**:
```json
{
  "enabled": true,
  "success": true,
  "message": "Test message sent successfully to Slack!",
  "sent_at": "2025-11-23 12:00:00"
}
```

**Response (disabled)**:
```json
{
  "enabled": false,
  "message": "Slack integration is not enabled. Set SLACK_WEBHOOK_URL environment variable."
}
```

**curl Example**:
```bash
curl http://localhost:8080/api/v1/slack/test
```

## Usage Examples

### Example 1: Notify on User Registration

```go
// In your registration handler
slackService.SendUserEvent(ctx, "registration", user.Email, user.Name, map[string]string{
    "Source": "Mobile App",
    "Plan": "Free",
})
```

### Example 2: Alert on Database Error

```go
// In error handling
if err != nil {
    slackService.SendSystemAlert(ctx, "Database", err.Error(), "critical")
    return err
}
```

### Example 3: Notify on AI Match Completion

```go
// After AI matching completes
slackService.SendAIMatchEvent(ctx, userID, len(matches), avgScore)
```

### Example 4: Track Admin Actions

```go
// In admin handler
slackService.SendAdminActivity(ctx, adminEmail, "User Deletion", userEmail, map[string]string{
    "Reason": "Spam",
    "IP": clientIP,
})
```

## Message Types

### Simple Message

```go
slackService.SendMessage(ctx, "Simple text message")
```

### Formatted Message

```go
slackService.SendFormattedMessage(ctx,
    "Title",
    "Message body with *markdown*",
    "good",  // Color: good (green), warning (yellow), danger (red), or hex color
)
```

### Alert Messages

```go
// Danger (red)
slackService.SendAlert(ctx, "Critical Error", "Database is down", details)

// Success (green)
slackService.SendSuccess(ctx, "Deployment", "Successfully deployed v2.0", details)

// Warning (yellow)
slackService.SendWarning(ctx, "High Memory", "Memory usage at 90%", details)

// Info (blue)
slackService.SendInfo(ctx, "System Update", "Maintenance scheduled", details)
```

### Notification with Fields

```go
slackService.SendNotification(ctx, "Title", "Message", map[string]string{
    "Field 1": "Value 1",
    "Field 2": "Value 2",
}, "good")
```

### Custom Message (Advanced)

```go
msg := slack.Message{
    Text: "Main message",
    Attachments: []slack.Attachment{
        {
            Color: "#36a64f",
            Title: "Custom Attachment",
            Text: "Attachment text with *markdown*",
            Fields: []slack.Field{
                {Title: "Priority", Value: "High", Short: true},
                {Title: "Status", Value: "Active", Short: true},
            },
            Footer: "Datifyy Backend",
            Timestamp: time.Now().Unix(),
        },
    },
}

slackService.SendCustomMessage(ctx, msg)
```

## Testing

### Test with curl

```bash
# 1. Test integration status
curl http://localhost:8080/api/v1/slack/test

# 2. Send simple message
curl -X POST http://localhost:8080/api/v1/slack/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message from API"}'

# 3. Send alert
curl -X POST http://localhost:8080/api/v1/slack/alert \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Alert",
    "message": "This is a test alert",
    "type": "warning"
  }'

# 4. Send user event
curl -X POST http://localhost:8080/api/v1/slack/notification \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "user_event",
    "event_type": "registration",
    "user_email": "test@example.com",
    "user_name": "Test User"
  }'
```

### Test with Postman

1. **Import Collection**: Create a new collection "Slack Integration"
2. **Add Environment Variable**: `baseUrl` = `http://localhost:8080`
3. **Test Endpoints**:
   - GET `{{baseUrl}}/api/v1/slack/test`
   - POST `{{baseUrl}}/api/v1/slack/send`
   - POST `{{baseUrl}}/api/v1/slack/alert`
   - POST `{{baseUrl}}/api/v1/slack/notification`

### Unit Tests

```bash
# Run Slack service tests
cd apps/backend
go test ./internal/slack/...

# Expected output:
# PASS
# ok      github.com/datifyy/backend/internal/slack
```

## Troubleshooting

### Issue 1: Integration Not Enabled

**Symptom**: All endpoints return "Slack integration is not enabled"

**Solution**:
```bash
# 1. Check environment variable
echo $SLACK_WEBHOOK_URL

# 2. If empty, set it
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# 3. Restart backend
docker-compose restart backend

# 4. Check logs
docker-compose logs backend | grep -i slack
# Should see: ✓ Slack integration enabled
```

### Issue 2: Messages Not Appearing in Slack

**Symptom**: API returns success but no message in Slack

**Possible Causes**:
1. **Wrong Channel**: Check which channel the webhook is configured for
2. **Webhook Revoked**: Regenerate webhook URL in Slack
3. **Network Issues**: Verify backend can reach slack.com

**Debug Steps**:
```bash
# 1. Test webhook directly
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Direct webhook test"}'

# 2. Check backend logs for errors
docker-compose logs backend | grep -i slack

# 3. Verify backend has internet access
docker-compose exec backend ping -c 3 slack.com
```

### Issue 3: 400 Bad Request

**Symptom**: API returns 400 error

**Common Causes**:
```bash
# Missing required fields
{
  "error": "Title and message are required"
}

# Invalid notification type
{
  "error": "Invalid notification_type. Must be: user_event, admin_activity, system_alert, or ai_match"
}

# Missing type-specific fields
{
  "error": "event_type and user_email are required for user_event"
}
```

**Solution**: Check request body matches the required format for the endpoint.

### Issue 4: 500 Internal Server Error

**Symptom**: Slack webhook returns error

**Debug**:
```bash
# Check backend logs for detailed error
docker-compose logs backend | grep -i "failed to send"

# Common errors:
# - "no_service": Webhook URL invalid
# - "channel_not_found": Channel deleted
# - "invalid_payload": JSON format issue
```

**Solution**:
- Regenerate webhook URL if invalid
- Verify channel still exists
- Check JSON payload is valid

### Issue 5: Rate Limiting

**Symptom**: Slack returns 429 (Too Many Requests)

**Solution**:
```go
// Implement rate limiting in code
// Slack limit: ~1 message per second
```

### Issue 6: Timeout Errors

**Symptom**: Request times out

**Solution**:
```bash
# Increase timeout in slack_service.go (currently 10 seconds)
httpClient: &http.Client{
    Timeout: 30 * time.Second,
}
```

## Best Practices

### 1. Use Appropriate Message Types

```go
// ✅ Good: Use specific alert types
slackService.SendAlert(ctx, "Error", msg, details)     // For errors
slackService.SendSuccess(ctx, "Deploy", msg, details)  // For success
slackService.SendWarning(ctx, "Memory", msg, details)  // For warnings

// ❌ Bad: Use generic message for everything
slackService.SendMessage(ctx, "Some error happened")
```

### 2. Include Useful Details

```go
// ✅ Good: Include context
slackService.SendUserEvent(ctx, "registration", email, name, map[string]string{
    "Source": "Mobile App",
    "Device": "iOS",
    "Location": "Mumbai",
    "Referral": "Google Ads",
})

// ❌ Bad: Minimal information
slackService.SendUserEvent(ctx, "registration", email, name, nil)
```

### 3. Handle Errors Gracefully

```go
// ✅ Good: Log but don't fail
if err := slackService.SendAlert(ctx, "Error", msg, details); err != nil {
    log.Printf("Failed to send Slack alert: %v", err)
    // Continue with main operation
}

// ❌ Bad: Fail operation if Slack fails
if err := slackService.SendAlert(ctx, "Error", msg, details); err != nil {
    return err  // Main operation fails!
}
```

### 4. Use Environment-Specific Channels

```go
// Production: #alerts
// Staging: #staging-alerts
// Development: #dev-notifications

// Configure different webhook URLs per environment
```

### 5. Rate Limiting

```go
// Don't send too many messages in a loop
for _, user := range users {
    // ❌ Bad: Could send 1000 messages/second
    slackService.SendMessage(ctx, "Processing user: " + user.Email)
}

// ✅ Good: Batch or throttle
summaryMsg := fmt.Sprintf("Processed %d users", len(users))
slackService.SendInfo(ctx, "Batch Complete", summaryMsg, details)
```

## Production Checklist

Before deploying to production:

- [ ] Webhook URL configured for production Slack workspace
- [ ] Correct channel selected (#production-alerts vs #dev-notifications)
- [ ] Environment variable `SLACK_WEBHOOK_URL` set in production
- [ ] Test message sent successfully
- [ ] Error handling implemented (don't fail main operations)
- [ ] Rate limiting considered (if sending many messages)
- [ ] Sensitive data filtered (no passwords, tokens in messages)
- [ ] Monitoring set up for Slack integration failures

## Environment Variables Reference

```bash
# Required
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional (defaults in code)
# None - all configuration is in the webhook URL
```

## API Reference Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/slack/send` | POST | Send simple text message |
| `/api/v1/slack/alert` | POST | Send formatted alert (success/warning/danger/info) |
| `/api/v1/slack/notification` | POST | Send specialized notification (user_event/admin_activity/system_alert/ai_match) |
| `/api/v1/slack/test` | GET/POST | Test integration status and send test message |

## Next Steps

1. ✅ Set up Slack webhook URL
2. ✅ Configure environment variable
3. ✅ Test integration with `/slack/test` endpoint
4. ✅ Integrate into your application code
5. ✅ Monitor Slack channel for notifications
6. ✅ Set up different channels for different environments (optional)

## Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review Slack API docs: https://api.slack.com/messaging/webhooks
- Check backend logs: `docker-compose logs backend | grep -i slack`
