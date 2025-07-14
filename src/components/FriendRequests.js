// src/components/FriendRequests.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  setDoc, doc, getDoc, updateDoc, arrayRemove, arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './FriendRequests.css'; // 👈 Custom CSS

function FriendRequests() {
  const currentUser = useSelector((state) => state.auth.user);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    const received = userData?.requestsReceived || [];
    const friendIds = userData?.friends || [];

    const requestUsers = await Promise.all(
      received.map(async (uid) => {
        const uRef = doc(db, 'users', uid);
        const uSnap = await getDoc(uRef);
        return { uid, ...uSnap.data() };
      })
    );

    const friendUsers = await Promise.all(
      friendIds.map(async (uid) => {
        const fRef = doc(db, 'users', uid);
        const fSnap = await getDoc(fRef);
        return { uid, ...fSnap.data() };
      })
    );

    setRequests(requestUsers.filter((u) => u.uid !== currentUser.uid));
    setFriends(friendUsers.filter((u) => u.uid !== currentUser.uid));
  };

  useEffect(() => {
    if (currentUser?.uid) fetchData();
  }, [currentUser?.uid]);

  const handleAccept = async (uid) => {
    const myRef = doc(db, 'users', currentUser.uid);
    const theirRef = doc(db, 'users', uid);
    const [mySnap, theirSnap] = await Promise.all([getDoc(myRef), getDoc(theirRef)]);
    const chatId = [currentUser.uid, uid].sort().join('_');

    await setDoc(doc(db, 'chats', chatId), {
      participants: [currentUser.uid, uid],
    });

    await updateDoc(myRef, {
      friends: arrayUnion(uid),
      requestsReceived: arrayRemove(uid),
    });

    await updateDoc(theirRef, {
      friends: arrayUnion(currentUser.uid),
      requestsSent: arrayRemove(currentUser.uid),
    });

    fetchData();
  };

  const handleReject = async (uid) => {
    const myRef = doc(db, 'users', currentUser.uid);
    const theirRef = doc(db, 'users', uid);

    await updateDoc(myRef, {
      requestsReceived: arrayRemove(uid),
    });

    await updateDoc(theirRef, {
      requestsSent: arrayRemove(currentUser.uid),
    });

    setRequests((prev) => prev.filter((u) => u.uid !== uid));
  };

  return (
    <div className="friend-container">
      <h2>👥 My Friends</h2>
      {friends.length === 0 ? (
        <p>No friends yet.</p>
      ) : (
        <div className="user-list">
          {friends.map((user) => (
            <div className="user-card" key={user.uid}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt="avatar"
              />
              <div className="user-info">
                <p><strong>{user.name}</strong> <span>{user.email}</span></p>
              </div>
              <button className="chat-btn" onClick={() => navigate(`/chat/${user.uid}`)}>
                Chat
              </button>
            </div>
          ))}
        </div>
      )}

      <h2>📨 Friend Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <div className="user-list">
          {requests.map((user) => (
            <div className="user-card" key={user.uid}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                alt="avatar"
              />
              <div className="user-info">
                <p><strong>{user.name}</strong> <span>{user.email}</span></p>
              </div>
              <div className="action-buttons">
                <button className="accept-btn" onClick={() => handleAccept(user.uid)}>Accept</button>
                <button className="reject-btn" onClick={() => handleReject(user.uid)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendRequests;
