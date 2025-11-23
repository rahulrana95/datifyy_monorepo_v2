package slack

import (
	"context"
	"testing"
)

func TestNewSlackService(t *testing.T) {
	tests := []struct {
		name       string
		webhookURL string
		wantEnabled bool
	}{
		{
			name:       "enabled with webhook URL",
			webhookURL: "https://hooks.slack.com/services/TEST/TEST/TEST",
			wantEnabled: true,
		},
		{
			name:       "disabled with empty webhook URL",
			webhookURL: "",
			wantEnabled: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			service := NewSlackService(tt.webhookURL)
			if service.IsEnabled() != tt.wantEnabled {
				t.Errorf("IsEnabled() = %v, want %v", service.IsEnabled(), tt.wantEnabled)
			}
		})
	}
}

func TestSlackService_SendMessage_Disabled(t *testing.T) {
	service := NewSlackService("")
	ctx := context.Background()

	err := service.SendMessage(ctx, "test message")
	if err == nil {
		t.Error("expected error when service is disabled, got nil")
	}
}

func TestSlackService_SendFormattedMessage_Disabled(t *testing.T) {
	service := NewSlackService("")
	ctx := context.Background()

	err := service.SendFormattedMessage(ctx, "Title", "Text", "good")
	if err == nil {
		t.Error("expected error when service is disabled, got nil")
	}
}

func TestSlackService_SendAlert_Disabled(t *testing.T) {
	service := NewSlackService("")
	ctx := context.Background()

	err := service.SendAlert(ctx, "Alert", "Message", map[string]string{"key": "value"})
	if err == nil {
		t.Error("expected error when service is disabled, got nil")
	}
}

func TestSlackService_SendUserEvent_Disabled(t *testing.T) {
	service := NewSlackService("")
	ctx := context.Background()

	err := service.SendUserEvent(ctx, "registration", "test@example.com", "Test User", nil)
	if err == nil {
		t.Error("expected error when service is disabled, got nil")
	}
}

func TestSlackService_SendSystemAlert_Disabled(t *testing.T) {
	service := NewSlackService("")
	ctx := context.Background()

	err := service.SendSystemAlert(ctx, "database", "connection failed", "critical")
	if err == nil {
		t.Error("expected error when service is disabled, got nil")
	}
}
