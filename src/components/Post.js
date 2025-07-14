import React from 'react';
import { useSelector } from 'react-redux';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CommentSection from './CommentSection';

function Post({ post }) {
  const user = useSelector((state) => state.auth.user);
  const hasLiked = post.likes?.includes(user?.uid);

  const toggleLike = async () => {
    const postRef = doc(db, 'posts', post.id);
    try {
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) {
      console.error('Failed to like/unlike post:', err);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', margin: '1rem 0' }}>
      <p>{post.content}</p>
      <button onClick={toggleLike}>
        {hasLiked ? '❤️ Unlike' : '🤍 Like'} ({post.likes?.length || 0})
      </button>
      <CommentSection postId={post.id} />

    </div>
  );
}

export default Post;
