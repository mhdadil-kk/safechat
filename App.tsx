import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { ChatRoom } from './pages/ChatRoom';
import { Banned } from './pages/Banned';

function App() {
  // Simulating a ban check
  const isBanned = false; 

  if (isBanned) {
    return <Banned />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/banned" element={<Banned />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;