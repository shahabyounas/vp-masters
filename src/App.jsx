import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dashboard from './Dashboard';
import QRScanner from './QRScanner';
import QRGenerator from './QRGenerator';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/scan" element={<QRScanner />} />
      <Route path="/generate" element={<QRGenerator />} />
    </Routes>
  );
}

export default App
