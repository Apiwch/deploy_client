import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/login`, { username, password });

            if (response.data && response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.username);
                navigate('/home');
            } else {
                setError('Incorrect username or password.');
            }
        } catch (error) {
            setError('Failed to authenticate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="Auth-form-container">
                <form className="Auth-form" onSubmit={handleLogin}>
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">Noise Monitoring</h3>
                        {error && <p className='AlertLogin'>{error}</p>}
                        <div className="form-group mt-3">
                            <label>Username</label>
                            <input
                                type="text"
                                className="form-control mt-1"
                                placeholder="Enter username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group mt-3">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control mt-1"
                                placeholder="Enter password"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="d-grid gap-2 mt-3">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Logging in...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
