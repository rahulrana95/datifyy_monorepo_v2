package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthHandler(t *testing.T) {
	server := &Server{}
	
	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(server.healthHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	expected := "OK"
	if rr.Body.String() != expected {
		t.Errorf("handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}

func TestRootHandler(t *testing.T) {
	server := &Server{}
	
	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(server.rootHandler)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("could not parse response body: %v", err)
	}

	if response["service"] != "Datifyy Backend API" {
		t.Errorf("unexpected service name: got %v want %v",
			response["service"], "Datifyy Backend API")
	}

	if response["version"] != "1.0.0" {
		t.Errorf("unexpected version: got %v want %v",
			response["version"], "1.0.0")
	}
}

func TestReadyHandlerWithoutDB(t *testing.T) {
	server := &Server{}
	
	req, err := http.NewRequest("GET", "/ready", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(server.readyHandler)
	handler.ServeHTTP(rr, req)

	// Without DB and Redis, should still return OK
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}
}

func TestTestDBHandlerWithoutDB(t *testing.T) {
	server := &Server{}
	
	req, err := http.NewRequest("GET", "/api/test-db", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(server.testDBHandler)
	handler.ServeHTTP(rr, req)

	// Without DB, should return 503
	if status := rr.Code; status != http.StatusServiceUnavailable {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusServiceUnavailable)
	}
}

func TestTestRedisHandlerWithoutRedis(t *testing.T) {
	server := &Server{}
	
	req, err := http.NewRequest("GET", "/api/test-redis", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(server.testRedisHandler)
	handler.ServeHTTP(rr, req)

	// Without Redis, should return 503
	if status := rr.Code; status != http.StatusServiceUnavailable {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusServiceUnavailable)
	}
}