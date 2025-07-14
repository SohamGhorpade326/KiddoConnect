import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from './features/authSlice';
import Navbar from './components/NavBar';


import Feed from './components/Feed';
import Login from './components/Login';
import Signup from './components/Signup';
import ProfilePage from './pages/ProfilePage';
import FriendRequests from './components/FriendRequests';
import ChatBox from './components/ChatBox';
function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(login({ uid: user.uid, email: user.email, displayName: user.displayName }));
      } else {
        dispatch(logout());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/feed" /> : <Navigate to="/signup" />} />
        <Route path="/login" element={user ? <Navigate to="/feed" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/feed" /> : <Signup />} />
        <Route path="/feed" element={user ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/requests" element={user ? <FriendRequests /> : <Navigate to="/login" />} />
        <Route path="/chat/:id" element={user ? <ChatBox /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;


