import { useState } from 'react'


function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')


    const handleSubmit = async (e) => {
        e.preventDefault()

        const formData = new URLSearchParams()
        formData.append('username', email)
        formData.append('password', password)

        try {
            const response = await fetch('http://127.0.0.1:8000/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                localStorage.setItem('token', data.access_token)
                localStorage.setItem('user_email', email)
                alert('Login Successful!')
                window.location.href = '/'
            } else {
                alert('Invalid credentials')
            }
        } catch (error) {
            console.error('Login error:', error)
            alert('An error occurred during login')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors mt-4 shadow-lg shadow-emerald-600/30"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
