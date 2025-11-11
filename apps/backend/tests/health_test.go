package tests

import (
	"io"
	"net/http"
	"testing"
	"time"
)

func TestHealthEndpoint(t *testing.T) {
	// This test can run without database
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	// Note: This assumes the server is running
	// In CI/CD, you would start the server before running tests
	resp, err := client.Get("http://localhost:8080/health")
	if err != nil {
		t.Skipf("Server not running: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("Failed to read response: %v", err)
	}

	if string(body) != "OK" {
		t.Errorf("Expected body 'OK', got '%s'", string(body))
	}
}

func TestRootEndpoint(t *testing.T) {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Get("http://localhost:8080/")
	if err != nil {
		t.Skipf("Server not running: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	// Check Content-Type
	contentType := resp.Header.Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Expected Content-Type 'application/json', got '%s'", contentType)
	}
}