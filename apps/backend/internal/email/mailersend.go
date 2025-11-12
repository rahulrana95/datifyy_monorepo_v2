package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// MailerSendClient handles email sending via MailerSend API
type MailerSendClient struct {
	apiKey     string
	fromEmail  string
	fromName   string
	httpClient *http.Client
}

// NewMailerSendClient creates a new MailerSend email client
func NewMailerSendClient(apiKey, fromEmail, fromName string) *MailerSendClient {
	return &MailerSendClient{
		apiKey:    apiKey,
		fromEmail: fromEmail,
		fromName:  fromName,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// EmailRequest represents an email to be sent
type EmailRequest struct {
	To      string
	Subject string
	Text    string
	HTML    string
}

// MailerSendPayload represents the MailerSend API payload
type mailerSendPayload struct {
	From        mailerSendEmail   `json:"from"`
	To          []mailerSendEmail `json:"to"`
	Subject     string            `json:"subject"`
	Text        string            `json:"text,omitempty"`
	HTML        string            `json:"html,omitempty"`
	TemplateID  string            `json:"template_id,omitempty"`
	Variables   []interface{}     `json:"variables,omitempty"`
	Attachments []interface{}     `json:"attachments,omitempty"`
}

type mailerSendEmail struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

// SendEmail sends an email via MailerSend API
func (c *MailerSendClient) SendEmail(req EmailRequest) error {
	if c.apiKey == "" {
		return fmt.Errorf("MailerSend API key not configured")
	}

	// Validate input
	if req.To == "" {
		return fmt.Errorf("recipient email is required")
	}
	if req.Subject == "" {
		return fmt.Errorf("email subject is required")
	}
	if req.Text == "" && req.HTML == "" {
		return fmt.Errorf("email body (text or HTML) is required")
	}

	// Build MailerSend payload
	payload := mailerSendPayload{
		From: mailerSendEmail{
			Email: c.fromEmail,
			Name:  c.fromName,
		},
		To: []mailerSendEmail{
			{
				Email: req.To,
			},
		},
		Subject: req.Subject,
		Text:    req.Text,
		HTML:    req.HTML,
	}

	// Marshal to JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	// Create HTTP request
	httpReq, err := http.NewRequest("POST", "https://api.mailersend.com/v1/email", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	// Send request
	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	defer resp.Body.Close()

	// Check response
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusAccepted {
		return fmt.Errorf("MailerSend API error: status %d", resp.StatusCode)
	}

	return nil
}

// SendVerificationEmail sends an email verification code
func (c *MailerSendClient) SendVerificationEmail(to, verificationCode string) error {
	subject := "Verify Your Email Address"

	text := fmt.Sprintf(`
Hello,

Thank you for signing up! Please use the following verification code to verify your email address:

%s

This code will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
The Datifyy Team
`, verificationCode)

	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #4F46E5;
            background: #F3F4F6;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
            letter-spacing: 4px;
        }
        .footer { margin-top: 30px; color: #6B7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Verify Your Email Address</h2>
        <p>Thank you for signing up! Please use the following verification code to verify your email address:</p>
        <div class="code">%s</div>
        <p>This code will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <div class="footer">
            <p>Best regards,<br>The Datifyy Team</p>
        </div>
    </div>
</body>
</html>
`, verificationCode)

	return c.SendEmail(EmailRequest{
		To:      to,
		Subject: subject,
		Text:    text,
		HTML:    html,
	})
}

// SendPasswordResetEmail sends a password reset link/code
func (c *MailerSendClient) SendPasswordResetEmail(to, resetToken string) error {
	subject := "Reset Your Password"

	// In production, you'd want to include a link to your frontend
	// For now, we'll just send the token
	text := fmt.Sprintf(`
Hello,

We received a request to reset your password. Please use the following code to reset your password:

%s

This code will expire in 1 hour.

If you didn't request a password reset, please ignore this email and ensure your account is secure.

Best regards,
The Datifyy Team
`, resetToken)

	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code {
            font-size: 24px;
            font-weight: bold;
            color: #DC2626;
            background: #FEF2F2;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
        }
        .warning {
            background: #FEF2F2;
            border-left: 4px solid #DC2626;
            padding: 12px;
            margin: 20px 0;
        }
        .footer { margin-top: 30px; color: #6B7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your password. Please use the following code to reset your password:</p>
        <div class="code">%s</div>
        <p>This code will expire in 1 hour.</p>
        <div class="warning">
            <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
        </div>
        <div class="footer">
            <p>Best regards,<br>The Datifyy Team</p>
        </div>
    </div>
</body>
</html>
`, resetToken)

	return c.SendEmail(EmailRequest{
		To:      to,
		Subject: subject,
		Text:    text,
		HTML:    html,
	})
}

// SendWelcomeEmail sends a welcome email to new users
func (c *MailerSendClient) SendWelcomeEmail(to, name string) error {
	subject := "Welcome to Datifyy!"

	text := fmt.Sprintf(`
Hello %s,

Welcome to Datifyy! We're excited to have you on board.

Your account has been successfully created and verified. You can now start exploring our platform and connecting with others.

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
The Datifyy Team
`, name)

	html := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header {
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content { background: white; padding: 30px; }
        .cta-button {
            display: inline-block;
            background: #4F46E5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer { margin-top: 30px; color: #6B7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Datifyy!</h1>
        </div>
        <div class="content">
            <h2>Hello %s,</h2>
            <p>We're excited to have you on board! Your account has been successfully created and verified.</p>
            <p>You can now start exploring our platform and connecting with others.</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            <div class="footer">
                <p>Best regards,<br>The Datifyy Team</p>
            </div>
        </div>
    </div>
</body>
</html>
`, name, name)

	return c.SendEmail(EmailRequest{
		To:      to,
		Subject: subject,
		Text:    text,
		HTML:    html,
	})
}
