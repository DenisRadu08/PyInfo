import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ProblemPage from './ProblemPage'
import './App.css'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import Navbar from './Navbar'
import ProfilePage from './ProfilePage'
import AddProblemPage from './AddProblemPage'
import { Toaster } from 'react-hot-toast'
import HomePage from './HomePage'
import ProtectedRoute from './ProtectedRoute'
import LeaderboardPage from './LeaderboardPage'
import AdminUsersPage from './AdminUsersPage'

function App() {
  // Global axios interceptor is now handled in api/axios.js

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/problem/:id" element={<ProblemPage />} />
          <Route path="/problem/:id" element={<ProblemPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/add-problem" element={
            <ProtectedRoute>
              <AddProblemPage />
            </ProtectedRoute>
          } />
          <Route path="/edit-problem/:id" element={
            <ProtectedRoute>
              <AddProblemPage />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin-users" element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  )
}

export default App
