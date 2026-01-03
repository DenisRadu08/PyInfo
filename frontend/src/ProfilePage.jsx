import { useState, useEffect } from 'react'
import Skeleton from './components/Skeleton'
import toast from 'react-hot-toast'
import CalendarHeatmap from 'react-calendar-heatmap'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import api from './api/axios'
import Editor from '@monaco-editor/react'
import 'react-calendar-heatmap/dist/styles.css'

function ProfilePage() {
    const [submissions, setSubmissions] = useState([])
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [viewDate, setViewDate] = useState(new Date())
    const [selectedSubmission, setSelectedSubmission] = useState(null)

    const openSubmission = (code) => setSelectedSubmission(code)
    const closeSubmission = () => setSelectedSubmission(null)

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                setLoading(false)
                return
            }

            try {
                const [submissionsRes, userRes] = await Promise.all([
                    api.get('/my-submissions'),
                    api.get('/users/me')
                ])
                setSubmissions(submissionsRes.data)
                setUserData(userRes.data)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching profile data:', error)
                setLoading(false)
            }
        }
        fetchProfileData()
    }, [])

    const getStartDate = () => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
        return date
    }

    const getEndDate = () => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
        return date
    }

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const getStatusBadge = (status) => {
        if (status === 'Accepted') {
            return (
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Accepted
                </span>
            )
        } else if (status === 'Wrong Answer') {
            return (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Incorrect
                </span>
            )
        } else {
            return (
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Error
                </span>
            )
        }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Loading State Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* User Info Skeleton */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-64">
                        <Skeleton className="h-24 w-24 rounded-full mb-4" />
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-4" />
                        <Skeleton className="h-8 w-32 rounded-full" />
                    </div>

                    {/* Heatmap Skeleton */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64">
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton className="h-6 w-40" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>

                <Skeleton className="h-8 w-40 mb-6" />

                {/* Table Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4"><Skeleton className="h-4 w-20" /></th>
                                    <th className="p-4"><Skeleton className="h-4 w-20" /></th>
                                    <th className="p-4"><Skeleton className="h-4 w-24" /></th>
                                    <th className="p-4"><Skeleton className="h-4 w-16" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left Column: User Info Card */}
                {userData && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full">
                        <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-4xl mb-4">
                            {userData.username ? userData.username[0].toUpperCase() : userData.email[0].toUpperCase()}
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-1">
                            {userData.username || 'User'}
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">{userData.email}</p>
                        <p className="text-sm text-gray-500 mb-4">Member since {new Date().getFullYear()}</p>

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
                )}

                {/* Right Column: Monthly Activity Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center">
                    <div className="flex items-center justify-between mb-4 w-full px-8">
                        <h2 className="text-lg font-bold text-slate-800">
                            Activity: {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevMonth}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            >
                                ←
                            </button>
                            <button
                                onClick={handleNextMonth}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            >
                                →
                            </button>
                        </div>
                    </div>

                    <div className="w-60 mt-6">
                        <CalendarHeatmap
                            startDate={getStartDate()}
                            endDate={getEndDate()}
                            values={(() => {
                                // 1. Map submissions to counts
                                const counts = {}
                                submissions.forEach(sub => {
                                    const date = new Date(sub.created_at).toISOString().split('T')[0]
                                    counts[date] = (counts[date] || 0) + 1
                                })

                                // 2. Generate ALL days for the view
                                const allDays = []
                                const start = getStartDate()
                                const end = getEndDate()
                                // Loop from start to end
                                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                    const dateStr = d.toISOString().split('T')[0]
                                    allDays.push({
                                        date: dateStr,
                                        count: counts[dateStr] || 0
                                    })
                                }
                                return allDays
                            })()}
                            classForValue={(value) => {
                                if (!value || value.count === 0) {
                                    return 'color-empty'
                                }
                                if (value.count >= 4) return 'color-scale-4'
                                if (value.count >= 3) return 'color-scale-3'
                                if (value.count >= 2) return 'color-scale-2'
                                return 'color-scale-1'
                            }}
                            tooltipDataAttrs={(value) => {
                                return {
                                    'data-tooltip-id': 'my-tooltip',
                                    'data-tooltip-content': `${value.date}: ${value.count} submissions`,
                                }
                            }}
                            showMonthLabels={false}
                            gutterSize={1}
                        />
                        <ReactTooltip id="my-tooltip" />
                    </div>
                </div>
            </div>

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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(sub.status)}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {new Date(sub.created_at).toLocaleDateString()} {new Date(sub.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => openSubmission(sub.code)}
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

            {/* Code Modal Overlay */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800">Submission Code</h3>
                            <button
                                onClick={closeSubmission}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body (Editor) */}
                        <div className="flex-1 p-0 overflow-hidden bg-[#1e1e1e]">
                            <Editor
                                height="500px"
                                language="python"
                                value={selectedSubmission}
                                theme="vs-dark"
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    renderLevel: 'none'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfilePage
