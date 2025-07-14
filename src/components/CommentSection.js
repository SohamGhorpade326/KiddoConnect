import React, { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useSelector } from 'react-redux';

function CommentSection({ postId }) {
  const [text, setText] = useState('');
  const [comments, setComments] = useState([]);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [postId]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        text,
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
      });
      setText('');
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  return (
    <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid #eee' }}>
      <form onSubmit={handleComment}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '80%', padding: '0.25rem' }}
        />
        <button type="submit">Comment</button>
      </form>

      {comments.map((comment) => (
        <div key={comment.id} style={{ marginTop: '0.5rem' }}>
          <strong>{comment.name}:</strong> {comment.text}
        </div>
      ))}
    </div>
  );
}

export default CommentSection;
