import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from './api/axios'

import toast from 'react-hot-toast'

function AddProblemPage() {
    const { id } = useParams()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [difficulty, setDifficulty] = useState('Easy')
    const [testCases, setTestCases] = useState([{ input_data: '', expected_output: '' }])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (id) {
            setLoading(true)
            api.get(`/problems/${id}`)
                .then(res => {
                    const problem = res.data
                    setTitle(problem.title)
                    setDescription(problem.description)
                    setDifficulty(problem.difficulty)
                    if (problem.test_cases && problem.test_cases.length > 0) {
                        // Ensure compatible structure
                        setTestCases(problem.test_cases.map(tc => ({
                            input_data: tc.input_data,
                            expected_output: tc.expected_output
                        })))
                    }
                    setLoading(false)
                })
                .catch(err => {
                    console.error("Error fetching problem:", err)
                    toast.error("Failed to load problem details")
                    setLoading(false)
                })
        }
    }, [id])

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...testCases]
        newTestCases[index][field] = value
        setTestCases(newTestCases)
    }

    const addTestCase = () => {
        setTestCases([...testCases, { input_data: '', expected_output: '' }])
    }

    const removeTestCase = (index) => {
        const newTestCases = testCases.filter((_, i) => i !== index)
        setTestCases(newTestCases)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem('token')
        if (!token) {
            toast.error('You must be logged in.')
            return
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }

        try {
            if (id) {
                // UPDATE
                await api.put(`/problems/${id}`, {
                    title,
                    description,
                    difficulty,
                    test_cases: testCases
                })
                toast.success('Problem updated successfully!')
                navigate(`/problem/${id}`)
            } else {
                // CREATE
                // 1. Create Problem
                const problemRes = await api.post('/problems', {
                    title, description, difficulty
                })

                const problem = problemRes.data

                // 2. Add Test Cases
                for (const test of testCases) {
                    if (test.input_data && test.expected_output) {
                        await api.post(`/problems/${problem.id}/tests`, test)
                    }
                }
                toast.success('Problem added successfully!')
                setTimeout(() => {
                    navigate('/')
                }, 1000)
            }
        } catch (error) {
            console.error('Error saving problem:', error)
            toast.error('Failed to save problem.')
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading problem...</div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">{id ? 'Edit Problem' : 'Add New Problem'}</h1>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Two Sum"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all min-h-[150px]"
                            placeholder="Describe the problem statement..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Test Cases</h3>
                        <div className="space-y-4">
                            {testCases.map((test, index) => (
                                <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 transition-all hover:border-gray-300">
                                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Input</label>
                                            <textarea
                                                placeholder="Enter input data..."
                                                value={test.input_data}
                                                onChange={(e) => handleTestCaseChange(index, "input_data", e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm h-32 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Expected Output</label>
                                            <textarea
                                                placeholder="Enter expected output..."
                                                value={test.expected_output}
                                                onChange={(e) => handleTestCaseChange(index, "expected_output", e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm h-32 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                    </div>
                                    {testCases.length > 1 && (
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeTestCase(index)}
                                                className="text-rose-600 hover:text-rose-700 text-sm font-semibold hover:underline flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Remove Case
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addTestCase}
                            className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-200 transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Test Case
                        </button>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-lg"
                        >
                            {id ? 'Update Problem' : 'Create Problem'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddProblemPage
