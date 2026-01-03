import { useState } from 'react'
import toast from 'react-hot-toast'
import api from './api/axios'
import { Link } from 'react-router-dom'

function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        const payload = {
            username: username,
            email: email,
            password: password,
            is_admin: false
        }

        try {
            // Note: Endpoint is /register based on backend implementation
            const response = await api.post('/register', payload)

            // Auto-login logic
            localStorage.setItem('token', response.data.access_token)
            localStorage.setItem('user_email', response.data.email)
            localStorage.setItem('email', response.data.email) // Legacy support
            localStorage.setItem('username', response.data.username)

            toast.success('Registration Successful!')
            setTimeout(() => {
                window.location.href = '/'
            }, 1000)

        } catch (error) {
            console.error('Registration error:', error)
            if (error.response && error.response.data && error.response.data.detail) {
                toast.error(error.response.data.detail)
            } else {
                toast.error('Registration failed')
            }
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Create Account</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors mt-4 shadow-lg shadow-emerald-600/30"
                    >
                        Register
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
