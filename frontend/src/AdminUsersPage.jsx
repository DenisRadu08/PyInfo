import { useState, useEffect } from 'react'
import api from './api/axios'
import toast from 'react-hot-toast'

function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)

    const currentUserEmail = localStorage.getItem('email')
    const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL;
    const isSuperAdmin = currentUserEmail === SUPER_ADMIN_EMAIL

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/all')
            setUsers(response.data)
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleAdmin = async (userId) => {
        if (processingId) return
        setProcessingId(userId)

        try {
            await api.put(`/users/${userId}/toggle-admin`)
            toast.success('User role updated')
            // Refresh list or update locally
            setUsers(users.map(u => {
                if (u.id === userId) {
                    return { ...u, is_admin: !u.is_admin }
                }
                return u
            }))
        } catch (error) {
            console.error('Error toggling admin:', error)
            if (error.response?.data?.detail) {
                toast.error(error.response.data.detail)
            } else {
                toast.error('Failed to update role')
            }
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) return <div className="text-center py-20 text-gray-500">Loading users...</div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">User Management</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    #{user.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {user.username}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.is_admin ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleToggleAdmin(user.id)}
                                        disabled={!isSuperAdmin || user.email === SUPER_ADMIN_EMAIL || processingId === user.id}
                                        className={`font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${!isSuperAdmin || user.email === SUPER_ADMIN_EMAIL
                                            ? 'text-gray-400'
                                            : 'text-indigo-600 hover:text-indigo-900'
                                            }`}
                                    >
                                        {processingId === user.id ? 'Updating...' : 'Toggle Admin'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No users found.</div>
                )}
            </div>
        </div>
    )
}

export default AdminUsersPage
