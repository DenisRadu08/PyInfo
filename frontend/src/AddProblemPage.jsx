import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

function AddProblemPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [difficulty, setDifficulty] = useState('Easy')
    const [testCases, setTestCases] = useState([{ input_data: '', expected_output: '' }])
    const navigate = useNavigate()

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
            toast.error('You must be logged in to add a problem.')
            return
        }

        try {
            // 1. Create Problem
            const problemRes = await fetch('http://127.0.0.1:8000/problems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, difficulty })
            })

            if (!problemRes.ok) throw new Error('Failed to create problem')
            const problem = await problemRes.json()

            // 2. Add Test Cases
            for (const test of testCases) {
                if (test.input_data && test.expected_output) {
                    await fetch(`http://127.0.0.1:8000/problems/${problem.id}/tests`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(test)
                    })
                }
            }

            toast.success('Problem added successfully!')
            setTimeout(() => {
                navigate('/')
            }, 1000)
        } catch (error) {
            console.error('Error adding problem:', error)
            toast.error('Failed to add problem.')
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1>Add New Problem</h1>
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
                        <div style={{ marginBottom: '5px' }}>
                            <label>Input:</label>
                            <input
                                type="text"
                                value={test.input_data}
                                onChange={(e) => handleTestCaseChange(index, 'input_data', e.target.value)}
                                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '5px' }}>
                            <label>Output:</label>
                            <input
                                type="text"
                                value={test.expected_output}
                                onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
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
                    Save Problem
                </button>
            </form>
        </div>
    )
}

export default AddProblemPage
