import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { newPass } from '../API/NewPassService';
const ForgotPassConfirm = () => {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleLogin = async(e) => {
        e.preventDefault();
        // Here, you would typically make an API call to authenticate the user
        // For this example, we'll just check if the username and password are not empty
        if (password.trim() === '') {
            setError('Please enter new password');
        }
        else if (newPassword.trim() === '') {
          setError('Please confirm your password');
        }
        
        else {
          try {
            const data = await newPass(password);
            console.log('Reset succesfully', data);
            navigate("/")
            // Handle valid email (e.g., redirect to confirm pass)
          } catch (err) {
            console.error(err);
            setError(err.message);
          }
        }
    };
    return (
        <div className='login-container'>
        <div className='login-card'>
          <link rel='' type='image' href="/password.png" />
          <div className='forgotPass-text'>
            <h3>Reset password</h3>
            <p>Remember to confirm your password</p>
          </div>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="text"
                placeholder='Enter new password'
                id="newPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Confirm new Password</label>
              <input
                type="text"
                placeholder='Confirm new password'
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
              />
            </div>
  
            <button type="submit" className="login-button">
              Confirm
            </button>
            <div className="bottom-content">
              <p><Link to='/login'><link type='image/svg+xml' href="/back.svg" />Back to login</Link></p>
            </div>
          </form>
        </div>
      </div>
    )
}

export default ForgotPassConfirm