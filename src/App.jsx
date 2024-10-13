// src/App.js
// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarHero from './components/NavbarHero';
import Login from './components/Login';
import Signup from './components/Signup';
import CombinedComponent from './components/CombinedComponent';
import UI from './components/UI'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NavbarHero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chatbot" element={<CombinedComponent />} /> {/* Add your ChatBot route here */}
      </Routes>
    </Router>
  );
}

export default App;
