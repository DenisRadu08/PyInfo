import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'

function ProblemPage() {
    const { id } = useParams()
    const [problem, setProblem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [code, setCode] = useState('print("Hello World")')
    const [results, setResults] = useState(null)
    const [isRunning, setIsRunning] = useState(false)

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/problems/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Problem not found')
                }
                return response.json()
            })
            .then(data => {
                setProblem(data)
                setLoading(false)
            })
            .catch(error => {
                console.error('Error fetching problem:', error)
                setLoading(false)
            })
    }, [id])

    const handleSubmit = () => {
        setIsRunning(true)
        setResults(null)

        fetch(`http://127.0.0.1:8000/submit/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
        })
            .then(response => response.json())
            .then(data => {
                setResults(data)
                setIsRunning(false)
            })
            .catch(error => {
                console.error('Error submitting solution:', error)
                setIsRunning(false)
            })
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!problem) {
        return <div>Problem not found</div>
    }

    const allPassed = results && results.every(r => r.passed)

    return (
        <div style={{ display: 'flex', height: '100vh', padding: '20px', gap: '20px' }}>
            {/* Left Side: Problem Details */}
            <div style={{ width: '40%', overflowY: 'auto' }}>
                <h1>{problem.title}</h1>
                <span style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '0.8em'
                }}>
                    {problem.difficulty}
                </span>
                <p style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>{problem.description}</p>
            </div>

            {/* Right Side: Code Editor */}
            <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flexGrow: 1, border: '1px solid #ccc' }}>
                    <Editor
                        height="60vh"
                        defaultLanguage="python"
                        value={code}
                        onChange={(value) => setCode(value)}
                        theme="vs-dark"
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isRunning}
                    style={{
                        marginTop: '10px',
                        padding: '10px 20px',
                        backgroundColor: isRunning ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        fontSize: '1em'
                    }}
                >
                    {isRunning ? 'Grading...' : 'Submit Solution'}
                </button>

                {/* Results Area */}
                <div style={{ marginTop: '20px' }}>
                    {results && (
                        <>
                            {allPassed ? (
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#d4edda',
                                    color: '#155724',
                                    borderRadius: '5px',
                                    marginBottom: '10px',
                                    textAlign: 'center',
                                    fontSize: '1.2em',
                                    fontWeight: 'bold'
                                }}>
                                    🎉 Problem Solved! 100 Points
                                </div>
                            ) : (
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    borderRadius: '5px',
                                    marginBottom: '10px',
                                    textAlign: 'center',
                                    fontSize: '1.2em',
                                    fontWeight: 'bold'
                                }}>
                                    Try Again
                                </div>
                            )}

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Test Case ID</th>
                                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result) => (
                                        <tr key={result.test_id}>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.test_id}</td>
                                            <td style={{
                                                padding: '10px',
                                                border: '1px solid #ddd',
                                                color: result.passed ? 'green' : 'red',
                                                fontWeight: 'bold'
                                            }}>
                                                {result.passed ? 'Passed' : 'Failed'}
                                            </td>
                                            <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '0.9em' }}>
                                                {!result.passed && (
                                                    result.error ? `Error: ${result.error}` : `Expected: ${result.expected}, Got: ${result.actual}`
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProblemPage
