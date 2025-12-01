import { useState, useEffect } from 'react'

function ProfilePage() {
    const [submissions, setSubmissions] = useState([])
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }

        // Fetch Submissions
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
            })
            .catch(error => {
                console.error('Error fetching submissions:', error)
            })

        // Fetch User Data
        fetch('http://127.0.0.1:8000/users/me', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => response.json())
            .then(data => {
                setUserData(data)
                setLoading(false) // Set loading to false after both (or at least user data) are tried
            })
            .catch(error => {
                console.error('Error fetching user data:', error)
                setLoading(false)
            })

    }, [])

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading...</div>
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

            {/* Profile Card */}
            {userData && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                            {userData.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{userData.email}</h2>
                            <p className="text-sm text-gray-500">Member since {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <div>
                        {userData.is_admin ? (
                            <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full font-bold text-sm border border-purple-200 uppercase tracking-wide">
                                ADMIN ACCESS
                            </span>
                        ) : (
                            <span className="bg-gray-100 text-gray-700 px-4 py-1 rounded-full font-bold text-sm border border-gray-200 uppercase tracking-wide">
                                STUDENT
                            </span>
                        )}
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Activity History</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {submissions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No submissions yet. Start solving problems!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-semibold text-gray-600">Problem ID</th>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Date</th>
                                    <th className="p-4 font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(sub => (
                                    <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-900 font-medium">#{sub.problem_id}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${sub.status === 'Passed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {new Date(sub.created_at).toLocaleDateString()} {new Date(sub.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => alert(sub.code)}
                                                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm hover:underline"
                                            >
                                                View Code
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage
