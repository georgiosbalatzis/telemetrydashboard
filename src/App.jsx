import React, { Suspense } from 'react';
import { TelemetryProvider } from './context/TelemetryContext';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/core/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <TelemetryProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold">Loading F1 Telemetry Dashboard...</h2>
            </div>
          </div>
        }>
          <Dashboard />
        </Suspense>
      </TelemetryProvider>
    </ErrorBoundary>
  );
}

export default App; 