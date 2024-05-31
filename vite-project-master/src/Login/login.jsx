import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from './LoginService';
const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    

    const handleLogin = async (e) => {
        e.preventDefault();
        
        //API call
        if (phone.trim() === '' || password.trim() === '') {
            setError('Please enter both phone number and password');
        }
        try {
            const data = await login(phone, password);
            console.log('Login successful!', data);
            navigate("/")
            // Handle successful login (e.g., store token, redirect)
          } catch (err) {
            console.error(err);
            setError(err.message);
          } 
    };

    return (

        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Log in</h2>
                {error && <div className="error">{error}</div>}
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="phone">Phone number</label>
                        <input
                            type="text"
                            placeholder='Enter your phone number'
                            id="username"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            placeholder='Enter your password'
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div className='form-group'>  
                    <div className='row'>
                    <div className='col-md-8'>                     
                        <input
                            type="checkbox"
                        />
                        <label htmlFor="rememberme"> Remember me</label>
                        </div> 
                       <Link to='/forgotpassword' className='col-md-4'>Forgot password</Link>
                    </div>   
                    </div>
                    <button onClick={handleLogin} type="submit" className="login-button">
                        Login
                    </button>
                    <button>
                        Goolge
                    </button>

                </form>
                <div className='footer-content'>
                        <p>Dont have an account? <Link to="/signup">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;