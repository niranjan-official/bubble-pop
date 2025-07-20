import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StartPage } from './pages/StartPage';
import { GamePage } from './pages/GamePage';

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mb-4" />
        <span className="text-white text-lg font-semibold">Loading...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/game/:word" element={<GamePage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;