package auth

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	tests := []struct {
		name      string
		password  string
		wantError bool
		errorType error
	}{
		{
			name:      "valid strong password",
			password:  "Test123!@#",
			wantError: false,
		},
		{
			name:      "password too short",
			password:  "Test1!",
			wantError: true,
			errorType: ErrPasswordTooShort,
		},
		{
			name:      "password missing uppercase",
			password:  "test123!@#",
			wantError: true,
			errorType: ErrPasswordTooWeak,
		},
		{
			name:      "password missing lowercase",
			password:  "TEST123!@#",
			wantError: true,
			errorType: ErrPasswordTooWeak,
		},
		{
			name:      "password missing number",
			password:  "TestTest!@#",
			wantError: true,
			errorType: ErrPasswordTooWeak,
		},
		{
			name:      "password missing special char",
			password:  "Test1234567",
			wantError: true,
			errorType: ErrPasswordTooWeak,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hash, err := HashPassword(tt.password)

			if tt.wantError {
				if err == nil {
					t.Errorf("expected error but got none")
				}
				if tt.errorType != nil && err != tt.errorType {
					t.Errorf("expected error %v, got %v", tt.errorType, err)
				}
			} else {
				if err != nil {
					t.Errorf("unexpected error: %v", err)
				}
				if hash == "" {
					t.Errorf("expected hash but got empty string")
				}
			}
		})
	}
}

func TestVerifyPassword(t *testing.T) {
	password := "Test123!@#"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	tests := []struct {
		name      string
		hash      string
		password  string
		wantError bool
	}{
		{
			name:      "correct password",
			hash:      hash,
			password:  password,
			wantError: false,
		},
		{
			name:      "incorrect password",
			hash:      hash,
			password:  "WrongPass1!",
			wantError: true,
		},
		{
			name:      "empty password",
			hash:      hash,
			password:  "",
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := VerifyPassword(tt.hash, tt.password)

			if tt.wantError && err == nil {
				t.Errorf("expected error but got none")
			}

			if !tt.wantError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name      string
		email     string
		wantError bool
	}{
		{
			name:      "valid email",
			email:     "user@example.com",
			wantError: false,
		},
		{
			name:      "valid email with dots",
			email:     "user.name@example.com",
			wantError: false,
		},
		{
			name:      "valid email with plus",
			email:     "user+tag@example.com",
			wantError: false,
		},
		{
			name:      "invalid email - no @",
			email:     "userexample.com",
			wantError: true,
		},
		{
			name:      "invalid email - no domain",
			email:     "user@",
			wantError: true,
		},
		{
			name:      "invalid email - no local part",
			email:     "@example.com",
			wantError: true,
		},
		{
			name:      "invalid email - spaces",
			email:     "user @example.com",
			wantError: true,
		},
		{
			name:      "empty email",
			email:     "",
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateEmail(tt.email)

			if tt.wantError && err == nil {
				t.Errorf("expected error but got none")
			}

			if !tt.wantError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}

func TestGenerateVerificationToken(t *testing.T) {
	token1, err := GenerateVerificationToken()
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	if token1 == "" {
		t.Errorf("expected non-empty token")
	}

	// Generate another token and ensure they're different
	token2, err := GenerateVerificationToken()
	if err != nil {
		t.Fatalf("failed to generate second token: %v", err)
	}

	if token1 == token2 {
		t.Errorf("expected different tokens, got same token twice")
	}
}

func TestGenerateVerificationCode(t *testing.T) {
	code1, err := GenerateVerificationCode()
	if err != nil {
		t.Fatalf("failed to generate code: %v", err)
	}

	if len(code1) != 6 {
		t.Errorf("expected 6-digit code, got %d digits: %s", len(code1), code1)
	}

	// Verify it's numeric
	for _, char := range code1 {
		if char < '0' || char > '9' {
			t.Errorf("expected numeric code, got non-numeric character: %c", char)
		}
	}

	// Generate another code and ensure they're different (statistically they should be)
	code2, err := GenerateVerificationCode()
	if err != nil {
		t.Fatalf("failed to generate second code: %v", err)
	}

	if code1 == code2 {
		// This is statistically unlikely but not impossible
		t.Logf("Warning: generated same code twice (1 in 1,000,000 chance): %s", code1)
	}
}

func BenchmarkHashPassword(b *testing.B) {
	password := "Test123!@#"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = HashPassword(password)
	}
}

func BenchmarkVerifyPassword(b *testing.B) {
	password := "Test123!@#"
	hash, _ := HashPassword(password)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = VerifyPassword(hash, password)
	}
}
