import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('token')
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
                const response = await axios.get('http://127.0.0.1:8000/leaderboard', config)
                setLeaderboard(response.data)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching leaderboard:', error)
                toast.error('Failed to load leaderboard')
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [])

    const getRankIcon = (index) => {
        if (index === 0) return <span className="text-2xl" role="img" aria-label="gold medal">🥇</span>
        if (index === 1) return <span className="text-2xl" role="img" aria-label="silver medal">🥈</span>
        if (index === 2) return <span className="text-2xl" role="img" aria-label="bronze medal">🥉</span>
        return <span className="text-gray-600 font-bold ml-2">#{index + 1}</span>
    }

    const getRowStyle = (index) => {
        if (index === 0) return 'bg-yellow-50 border-yellow-200'
        if (index === 1) return 'bg-slate-50 border-slate-200'
        if (index === 2) return 'bg-orange-50 border-orange-200'
        return 'bg-white border-gray-100'
    }

    if (loading) return <div className="text-center py-20 text-gray-500">Loading leaderboard...</div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">🏆 Leaderboard</h1>
                <p className="text-gray-600">Top solvers in the PyCode Arena</p>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800 text-white">
                            <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider w-24 text-center">Rank</th>
                            <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider">User</th>
                            <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wider text-right">Problems Solved</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {leaderboard.map((user, index) => (
                            <tr
                                key={index}
                                className={`transition-colors hover:bg-opacity-90 ${getRowStyle(index)}`}
                            >
                                <td className="py-4 px-6 text-center">
                                    <div className="flex items-center justify-center h-full">
                                        {getRankIcon(index)}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                            index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-orange-400' : 'bg-emerald-500'
                                            }`}>
                                            {user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-slate-700">{user.email}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                        {user.solved_count} {user.solved_count === 1 ? 'Problem' : 'Problems'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {leaderboard.length === 0 && (
                    <div className="p-8 text-center text-gray-500 bg-white">
                        No submissions yet. Be the first to solve a problem!
                    </div>
                )}
            </div>
        </div>
    )
}

export default LeaderboardPage
