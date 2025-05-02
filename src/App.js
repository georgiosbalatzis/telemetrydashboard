import React from 'react';
import './App.css';
import TelemetryVisualizations from './components/TelemetryVisualizations';
import { TelemetryProvider } from './context/TelemetryContext';

function App() {
    return (
        <div className="App">
            <TelemetryProvider>
                <TelemetryVisualizations />
            </TelemetryProvider>
        </div>
    );
}

export default App;