import { useState, useEffect } from 'react'

function ProfilePage() {
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }

        fetch('http://127.0.0.1:8000/my-submissions', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                throw new Error('Failed to fetch submissions')
            })
            .then(data => {
                setSubmissions(data)
                setLoading(false)
            })
            .catch(error => {
                console.error('Error fetching submissions:', error)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>My Activity</h1>
            {submissions.length === 0 ? (
                <p>No submissions yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Problem ID</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map(sub => (
                            <tr key={sub.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sub.problem_id}</td>
                                <td style={{
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    color: sub.status === 'Passed' ? 'green' : 'red',
                                    fontWeight: 'bold'
                                }}>
                                    {sub.status}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    {new Date(sub.created_at).toLocaleString()}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    <button
                                        onClick={() => alert(sub.code)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View Code
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default ProfilePage
