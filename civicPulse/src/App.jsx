import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registration from './pages/Registration';
import ProtectedRoute from './components/ProtectedRoute';
import ElectricityPortal from './pages/ElectricityPortal';
import WaterPortal from './pages/WaterPortal';
import RoadsPortal from './pages/RoadsPortal';
import GarbagePortal from './pages/GarbagePortal';
import Teams from './pages/Teams';
import Leaderboard from './pages/Leaderboard';
import ComplaintsList from './pages/ComplaintsList';
import ResolvedIssues from './pages/ResolvedIssues';
import AISuggestions from './pages/AISuggestions';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Default route - redirect to registration */}
          <Route path="/" element={<Navigate to="/register" replace />} />
          
          {/* Registration route */}
          <Route path="/register" element={<Registration />} />
          
          {/* Login route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected department routes */}
          <Route 
            path="/electricity" 
            element={
              <ProtectedRoute requiredType="ELEC">
                <ElectricityPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/water" 
            element={
              <ProtectedRoute requiredType="WATER">
                <WaterPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/roads" 
            element={
              <ProtectedRoute requiredType="ROAD">
                <RoadsPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/garbage" 
            element={
              <ProtectedRoute requiredType="GARB">
                <GarbagePortal />
              </ProtectedRoute>
            } 
          />
          
          {/* Teams route - accessible to all authenticated users */}
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute requiredType={null}>
                <Teams />
              </ProtectedRoute>
            } 
          />
          
          {/* Leaderboard route - accessible to all authenticated users */}
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute requiredType={null}>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Complaints List route - accessible to all authenticated users */}
          <Route 
            path="/complaints" 
            element={
              <ProtectedRoute requiredType={null}>
                <ComplaintsList />
              </ProtectedRoute>
            } 
          />
          
          {/* Resolved Issues route - accessible to all authenticated users */}
          <Route 
            path="/resolved-issues" 
            element={
              <ProtectedRoute requiredType={null}>
                <ResolvedIssues />
              </ProtectedRoute>
            } 
          />
          
          {/* AI Suggestions route - accessible to all authenticated users */}
          <Route 
            path="/ai-suggestions" 
            element={
              <ProtectedRoute requiredType={null}>
                <AISuggestions />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
