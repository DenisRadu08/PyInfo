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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
                <h2>Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Login
                </button>
            </form>
        </div>
    )
}

export default LoginPage
