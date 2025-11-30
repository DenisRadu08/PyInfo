import { Link } from 'react-router-dom'

function Navbar() {
    const email = localStorage.getItem('user_email')

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
