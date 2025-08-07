import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Editor from './components/Editor';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-slate-900 text-slate-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:projectId" element={<Editor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 