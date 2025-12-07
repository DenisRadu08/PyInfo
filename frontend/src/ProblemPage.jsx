import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import toast from 'react-hot-toast'

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
        const token = localStorage.getItem('token')
        if (!token) {
            toast.error("Please login first!")
            return
        }

        setIsRunning(true)
        setResults(null)

        fetch(`http://127.0.0.1:8000/submit/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
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

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-700'
            case 'Medium': return 'bg-yellow-100 text-yellow-700'
            case 'Hard': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>
    if (!problem) return <div className="text-center py-20 text-red-500">Problem not found</div>

    const allPassed = results && results.every(r => r.passed)

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Left Column: Description */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-y-auto lg:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-slate-900">{problem.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                        </span>
                    </div>
                    <div className="prose prose-slate text-gray-700 leading-relaxed mt-6">
                        <p className="whitespace-pre-wrap">{problem.description}</p>
                    </div>
                </div>

                {/* Right Column: Editor & Controls */}
                <div className="flex flex-col h-full lg:col-span-2">
                    <div className="flex-grow rounded-2xl overflow-hidden shadow-sm border border-gray-200 h-[60vh]">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            value={code}
                            onChange={(value) => setCode(value)}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 16 }
                            }}
                        />
                    </div>

                    <div className="mt-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning}
                            className={`w-full font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition ${isRunning
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                                }`}
                        >
                            {isRunning ? 'Running Tests...' : 'Run Code'}
                        </button>

                        {results && (
                            <div className="mt-6 animate-fade-in">
                                {allPassed ? (
                                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg mb-4 text-center font-bold border border-emerald-100">
                                        🎉 Problem Solved! All tests passed.
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4 text-center font-bold border border-red-100">
                                        ❌ Some tests failed. Keep trying!
                                    </div>
                                )}

                                <div className="bg-slate-900 rounded-lg overflow-hidden">
                                    <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 text-gray-400 text-xs font-mono uppercase tracking-wider">
                                        Test Results
                                    </div>
                                    <div className="p-4 overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-gray-500 text-sm border-b border-slate-700">
                                                    <th className="py-2 px-4">Status</th>
                                                    <th className="py-2 px-4">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="font-mono text-sm">
                                                {results.map((result) => (
                                                    <tr key={result.test_id} className="border-b border-slate-800 last:border-0">
                                                        <td className="py-3 px-4">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${result.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                                }`}>
                                                                {result.passed ? 'PASS' : 'FAIL'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-300">
                                                            {!result.passed && (
                                                                <div className="space-y-1">
                                                                    {result.error ? (
                                                                        <span className="text-red-400">Error: {result.error}</span>
                                                                    ) : (
                                                                        <>
                                                                            <div className="text-gray-500">Expected: <span className="text-emerald-400">{result.expected}</span></div>
                                                                            <div className="text-gray-500">Actual: <span className="text-red-400">{result.actual}</span></div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {result.passed && <span className="text-gray-500">Output matches expected result</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProblemPage
