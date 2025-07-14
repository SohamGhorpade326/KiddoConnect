// src/components/Signup.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // 👈 custom styles

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        name,
        email,
        bio: '',
        photoURL: '',
        friends: [],
      });
      navigate('/login');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="signup-container fade-in">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2>Create Account</h2>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Choose Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
        <p className="signup-footer">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </p>
      </form>
    </div>
  );
}

export default Signup;

