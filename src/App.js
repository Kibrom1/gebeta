import React from 'react';
import GebetaGame from './GebetaGame';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <GebetaGame />
    </ErrorBoundary>
  );
}

export default App;
