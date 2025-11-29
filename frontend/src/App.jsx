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

  return (
    <>
      <h1>Python Problems</h1>
      <div className="card">
        {problems.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {problems.map(problem => (
              <li key={problem.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>
                  <Link to={`/problem/${problem.id}`}>{problem.title}</Link>
                </h3>
                <p>Difficulty: {problem.difficulty}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading problems...</p>
        )}
      </div>
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProblemList />} />
      <Route path="/problem/:id" element={<ProblemPage />} />
    </Routes>
  )
}

export default App
