import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ProblemPage from './ProblemPage'
import './App.css'
import LoginPage from './LoginPage'
import Navbar from './Navbar'
import ProfilePage from './ProfilePage'
import AddProblemPage from './AddProblemPage'
import { Toaster } from 'react-hot-toast'
import HomePage from './HomePage'
import ProtectedRoute from './ProtectedRoute'
import LeaderboardPage from './LeaderboardPage'
import axios from 'axios'

function App() {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/problem/:id" element={<ProblemPage />} />
          <Route path="/login" element={<LoginPage />} />
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
        </Routes>
      </div>
    </div>
  )
}

export default App
