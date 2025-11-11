/**
 * Main Application Component
 * Following TypeScript and React best practices
 */

import React, { useMemo, useState } from 'react';
import './App.css';
import { useApi } from './hooks/useApi';
import { apiService } from './services/api.service';
import { ApiResponse } from './types';
import { StatusIndicator } from './components/StatusIndicator';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ProtoDemo } from './components/ProtoDemo';
import { ChakraV3Demo } from './components/chakra/ChakraV3Demo';
import { Box } from '@chakra-ui/react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api' | 'proto' | 'chakra'>('api');
  
  const { state, execute: refresh } = useApi<ApiResponse>(
    () => apiService.getApiStatus(),
    {
      autoFetch: true,
      onError: (error) => {
        console.error('Failed to fetch API status:', error);
      }
    }
  );

  const formattedData = useMemo(() => {
    if (state.status === 'success' && state.data) {
      return JSON.stringify(state.data, null, 2);
    }
    return null;
  }, [state]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Datifyy Frontend</h1>
        <p className="App-subtitle">
          Built with TypeScript + React | Following Best Practices
        </p>
      </header>
      
      <main className="App-main">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            REST API Demo
          </button>
          <button 
            className={`tab-button ${activeTab === 'proto' ? 'active' : ''}`}
            onClick={() => setActiveTab('proto')}
          >
            Proto Types Demo
          </button>
          <button 
            className={`tab-button ${activeTab === 'chakra' ? 'active' : ''}`}
            onClick={() => setActiveTab('chakra')}
          >
            Chakra UI + Emotion
          </button>
        </div>

        {/* API Tab Content */}
        {activeTab === 'api' && (
          <section className="App-section">
          <div className="section-header">
            <h2>API Response</h2>
            <button 
              className="refresh-button"
              onClick={refresh}
              disabled={state.status === 'loading'}
              aria-label="Refresh API data"
            >
              {state.status === 'loading' ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {state.status === 'loading' && <LoadingSpinner />}
          
          {state.status === 'error' && (
            <ErrorDisplay error={state.error} onRetry={refresh} />
          )}
          
          {state.status === 'success' && state.data && (
            <>
              <pre className="code-block" role="region" aria-label="API response data">
                {formattedData}
              </pre>

              <div className="status-container">
                <h3>Service Status</h3>
                <div className="status-indicators">
                  <StatusIndicator 
                    label="Database" 
                    status={state.data.status.database} 
                  />
                  <StatusIndicator 
                    label="Redis" 
                    status={state.data.status.redis} 
                  />
                </div>
              </div>

              <div className="metadata">
                <p>
                  <strong>Service:</strong> {state.data.service}
                </p>
                <p>
                  <strong>Version:</strong> {state.data.version}
                </p>
                <p>
                  <strong>Last Updated:</strong> {new Date(state.data.timestamp).toLocaleString()}
                </p>
              </div>
            </>
          )}
          </section>
        )}

        {/* Proto Tab Content */}
        {activeTab === 'proto' && (
          <section className="App-section">
            <ProtoDemo />
          </section>
        )}

        {/* Chakra UI Tab Content */}
        {activeTab === 'chakra' && (
          <Box>
            <ChakraV3Demo />
          </Box>
        )}
      </main>
    </div>
  );
};

export default App;