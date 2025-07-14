// src/components/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // 👈 Import CSS

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      dispatch(login(userCred.user));
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container fade-in">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Welcome Back</h2>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p className="login-footer">
          Don't have an account? <span onClick={() => navigate('/signup')}>Signup</span>
        </p>
      </form>
    </div>
  );
}

export default Login;
