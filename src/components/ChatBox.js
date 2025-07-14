// src/components/ChatBox.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useSelector } from 'react-redux';
import './ChatBox.css';

function ChatBox() {
  const { id: otherUserId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const messagesEndRef = useRef(null);

  const chatId = [currentUser.uid, otherUserId].sort().join('_');

  useEffect(() => {
    // 🔎 Fetch other user's name
    async function fetchOtherUser() {
      const userRef = doc(db, 'users', otherUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setOtherUserName(data.name || otherUserId);
      } else {
        setOtherUserName(otherUserId);
      }
    }

    fetchOtherUser();
  }, [otherUserId]);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMsg,
      sender: currentUser.uid,
      timestamp: serverTimestamp(),
    });

    setNewMsg('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <span>Chat with {otherUserName}</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.sender === currentUser.uid ? 'me' : 'them'}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
