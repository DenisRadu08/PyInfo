import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

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
            axios.get(`http://127.0.0.1:8000/problems/${id}`)
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
                await axios.put(`http://127.0.0.1:8000/problems/${id}`, {
                    title,
                    description,
                    difficulty,
                    test_cases: testCases
                }, config)
                toast.success('Problem updated successfully!')
                navigate(`/problem/${id}`)
            } else {
                // CREATE
                // 1. Create Problem
                const problemRes = await axios.post('http://127.0.0.1:8000/problems', {
                    title, description, difficulty
                }, config)

                const problem = problemRes.data

                // 2. Add Test Cases
                for (const test of testCases) {
                    if (test.input_data && test.expected_output) {
                        await axios.post(`http://127.0.0.1:8000/problems/${problem.id}/tests`, test, config)
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
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1>{id ? 'Edit Problem' : 'Add New Problem'}</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', minHeight: '100px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Difficulty:</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <h3>Test Cases</h3>
                {testCases.map((test, index) => (
                    <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                        <div className="flex gap-4 mb-2">
                            <textarea
                                placeholder="Input"
                                value={test.input_data}
                                onChange={(e) => handleTestCaseChange(index, "input_data", e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm h-24 resize-y"
                            />
                            <textarea
                                placeholder="Expected Output"
                                value={test.expected_output}
                                onChange={(e) => handleTestCaseChange(index, "expected_output", e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm h-24 resize-y"
                            />
                        </div>
                        {testCases.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeTestCase(index)}
                                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addTestCase}
                    style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Add Test Case
                </button>

                <br />
                <button
                    type="submit"
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
                >
                    {id ? 'Update Problem' : 'Save Problem'}
                </button>
            </form>
        </div>
    )
}

export default AddProblemPage
