import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ProblemPage from './ProblemPage'
import './App.css'

function ProblemList() {
  const [problems, setProblems] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/problems')
      .then(response => response.json())
      .then(data => setProblems(data))
      .catch(error => console.error('Error fetching problems:', error))
  }, [])

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'Hard': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-10 tracking-tight text-center">Python Problems</h1>

      {problems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems.map(problem => (
            <Link
              key={problem.id}
              to={`/problem/${problem.id}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-1 block h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {problem.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                  {problem.description}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  <span className="text-emerald-600 font-medium group-hover:underline block text-right text-sm">
                    Solve Challenge →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">Loading problems...</p>
        </div>
      )}
    </div>
  )
}

import LoginPage from './LoginPage'
import Navbar from './Navbar'

import ProfilePage from './ProfilePage'
import AddProblemPage from './AddProblemPage'

import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<ProblemList />} />
          <Route path="/problem/:id" element={<ProblemPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/add-problem" element={<AddProblemPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
