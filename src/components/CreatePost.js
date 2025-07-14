import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useSelector } from 'react-redux';

function CreatePost() {
  const [content, setContent] = useState('');
  const user = useSelector((state) => state.auth.user);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return alert('Post content is empty');
    try {
      await addDoc(collection(db, 'posts'), {
        uid: user.uid,
        content,
        timestamp: serverTimestamp(),
        likes: [],
      });
      setContent('');
    } catch (error) {
      alert('Failed to post: ' + error.message);
    }
  };

  return (
    <form onSubmit={handlePost} style={{ marginBottom: '1rem' }}>
      <textarea
        rows="3"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: '100%', padding: '0.5rem' }}
      />
      <button type="submit">Post</button>
    </form>
  );
}

export default CreatePost;
