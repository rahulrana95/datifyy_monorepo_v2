/**
 * Application Entry Point
 * TypeScript + React with strict mode and error boundaries
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChakraProvider } from './providers/ChakraProvider';

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ChakraProvider>
  </React.StrictMode>
);

// Performance monitoring (optional)
reportWebVitals(console.log);