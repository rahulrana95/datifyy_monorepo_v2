package slack

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// SlackService handles sending messages to Slack
type SlackService struct {
	webhookURL string
	httpClient *http.Client
	enabled    bool
}

// Message represents a Slack message
type Message struct {
	Text        string       `json:"text,omitempty"`
	Username    string       `json:"username,omitempty"`
	IconEmoji   string       `json:"icon_emoji,omitempty"`
	Channel     string       `json:"channel,omitempty"`
	Attachments []Attachment `json:"attachments,omitempty"`
	Blocks      []Block      `json:"blocks,omitempty"`
}

// Attachment represents a Slack message attachment
type Attachment struct {
	Color      string   `json:"color,omitempty"`
	Title      string   `json:"title,omitempty"`
	Text       string   `json:"text,omitempty"`
	Footer     string   `json:"footer,omitempty"`
	FooterIcon string   `json:"footer_icon,omitempty"`
	Timestamp  int64    `json:"ts,omitempty"`
	Fields     []Field  `json:"fields,omitempty"`
	MarkdownIn []string `json:"mrkdwn_in,omitempty"`
}

// Field represents a field in a Slack attachment
type Field struct {
	Title string `json:"title"`
	Value string `json:"value"`
	Short bool   `json:"short"`
}

// Block represents a Slack block
type Block struct {
	Type string      `json:"type"`
	Text *TextObject `json:"text,omitempty"`
}

// TextObject represents text in a Slack block
type TextObject struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

// NewSlackService creates a new Slack service
func NewSlackService(webhookURL string) *SlackService {
	enabled := webhookURL != ""

	return &SlackService{
		webhookURL: webhookURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		enabled: enabled,
	}
}

// IsEnabled returns whether Slack integration is enabled
func (s *SlackService) IsEnabled() bool {
	return s.enabled
}

// SendMessage sends a simple text message to Slack
func (s *SlackService) SendMessage(ctx context.Context, text string) error {
	if !s.enabled {
		return fmt.Errorf("slack integration is not enabled")
	}

	msg := Message{
		Text: text,
	}

	return s.send(ctx, msg)
}

// SendFormattedMessage sends a formatted message with attachments
func (s *SlackService) SendFormattedMessage(ctx context.Context, title, text, color string) error {
	if !s.enabled {
		return fmt.Errorf("slack integration is not enabled")
	}

	msg := Message{
		Attachments: []Attachment{
			{
				Color: color,
				Title: title,
				Text:  text,
				Footer: "Datifyy Backend",
				Timestamp: time.Now().Unix(),
				MarkdownIn: []string{"text"},
			},
		},
	}

	return s.send(ctx, msg)
}

// SendNotification sends a notification with fields
func (s *SlackService) SendNotification(ctx context.Context, title, message string, fields map[string]string, color string) error {
	if !s.enabled {
		return fmt.Errorf("slack integration is not enabled")
	}

	slackFields := make([]Field, 0, len(fields))
	for key, value := range fields {
		slackFields = append(slackFields, Field{
			Title: key,
			Value: value,
			Short: true,
		})
	}

	msg := Message{
		Attachments: []Attachment{
			{
				Color:     color,
				Title:     title,
				Text:      message,
				Fields:    slackFields,
				Footer:    "Datifyy Backend",
				Timestamp: time.Now().Unix(),
				MarkdownIn: []string{"text", "fields"},
			},
		},
	}

	return s.send(ctx, msg)
}

// SendAlert sends a high-priority alert
func (s *SlackService) SendAlert(ctx context.Context, title, message string, details map[string]string) error {
	return s.SendNotification(ctx, "🚨 "+title, message, details, "danger")
}

// SendSuccess sends a success notification
func (s *SlackService) SendSuccess(ctx context.Context, title, message string, details map[string]string) error {
	return s.SendNotification(ctx, "✅ "+title, message, details, "good")
}

// SendWarning sends a warning notification
func (s *SlackService) SendWarning(ctx context.Context, title, message string, details map[string]string) error {
	return s.SendNotification(ctx, "⚠️ "+title, message, details, "warning")
}

// SendInfo sends an info notification
func (s *SlackService) SendInfo(ctx context.Context, title, message string, details map[string]string) error {
	return s.SendNotification(ctx, "ℹ️ "+title, message, details, "#36a64f")
}

// SendUserEvent sends a notification about user events
func (s *SlackService) SendUserEvent(ctx context.Context, eventType, userEmail, userName string, details map[string]string) error {
	if !s.enabled {
		return fmt.Errorf("slack integration is not enabled")
	}

	var emoji, color string
	switch eventType {
	case "registration":
		emoji = "👤"
		color = "good"
	case "verification":
		emoji = "✅"
		color = "good"
	case "deletion":
		emoji = "🗑️"
		color = "danger"
	case "suspension":
		emoji = "⛔"
		color = "warning"
	default:
		emoji = "📌"
		color = "#36a64f"
	}

	fields := map[string]string{
		"User":  userName,
		"Email": userEmail,
		"Event": eventType,
	}

	// Merge additional details
	for k, v := range details {
		fields[k] = v
	}

	return s.SendNotification(ctx, emoji+" User Event", fmt.Sprintf("User event: %s", eventType), fields, color)
}

// SendAdminActivity sends notification about admin activities
func (s *SlackService) SendAdminActivity(ctx context.Context, adminEmail, action, target string, details map[string]string) error {
	if !s.enabled {
		return fmt.Errorf("slack integration is not enabled")
	}

	fields := map[string]string{
		"Admin":  adminEmail,
		"Action": action,
		"Target": target,
		"Time":   time.Now().Format("2006-01-02 15:04:05"),
	}

	// Merge additional details
	for k, v := range details {
		fields[k] = v
	}

	return s.SendNotification(ctx, "🔐 Admin Activity", fmt.Sprintf("Admin action: %s", action), fields, "#4A90E2")
}

// SendSystemAlert sends system-level alerts
func (s *SlackService) SendSystemAlert(ctx context.Context, component, errorMsg string, severity string) error {
	if !s.enabled {
		return fmt.Errorf("slack integration is not enabled")
	}

	var emoji, color string
	switch severity {
	case "critical":
		emoji = "🔴"
		color = "danger"
	case "high":
		emoji = "🟠"
		color = "warning"
	case "medium":
		emoji = "🟡"
		color = "warning"
	default:
		emoji = "🔵"
		color = "#36a64f"
	}

	fields := map[string]string{
		"Component": component,
		"Severity":  severity,
		"Time":      time.Now().Format("2006-01-02 15:04:05"),
	}

	return s.SendNotification(ctx, emoji+" System Alert", errorMsg, fields, color)
}

// SendAIMatchEvent sends notification about AI match curation
func (s *SlackService) SendAIMatchEvent(ctx context.Context, userID string, matchCount int, avgScore float64) error {
	if !s.enabled {
		return fmt.Errorf("slack integration is not enabled")
	}

	fields := map[string]string{
		"User ID":            userID,
		"Matches Found":      fmt.Sprintf("%d", matchCount),
		"Avg Compatibility":  fmt.Sprintf("%.1f%%", avgScore),
		"Time":               time.Now().Format("2006-01-02 15:04:05"),
	}

	return s.SendNotification(ctx, "💝 AI Match Curation", "AI compatibility analysis completed", fields, "good")
}

// send sends the message to Slack webhook
func (s *SlackService) send(ctx context.Context, msg Message) error {
	if !s.enabled {
		return fmt.Errorf("slack integration is not enabled")
	}

	payload, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", s.webhookURL, bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("slack returned non-OK status: %d, body: %s", resp.StatusCode, string(body))
	}

	return nil
}

// SendCustomMessage sends a fully custom message
func (s *SlackService) SendCustomMessage(ctx context.Context, msg Message) error {
	if !s.enabled {
		return fmt.Errorf("slack integration is not enabled")
	}

	return s.send(ctx, msg)
}
