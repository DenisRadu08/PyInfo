import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Navbar() {
    const email = localStorage.getItem('user_email')
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            fetch('http://127.0.0.1:8000/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.is_admin) {
                        setIsAdmin(true)
                    }
                })
                .catch(err => console.error("Error fetching user details:", err))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user_email')
        window.location.reload()
    }

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            backgroundColor: '#333',
            color: 'white',
            marginBottom: '20px'
        }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1em' }}>Home</Link>
                {email && (
                    <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1em' }}>Profile</Link>
                )}
                {isAdmin && (
                    <Link to="/add-problem" style={{ color: '#ffc107', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1em' }}>New Problem</Link>
                )}
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {email ? (
                    <>
                        <span>Hello, {email}</span>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '5px 15px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
                )}
            </div>
        </nav>
    )
}

export default Navbar
