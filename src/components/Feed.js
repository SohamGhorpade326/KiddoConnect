// src/components/Feed.js
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { setPosts } from '../features/feedSlice';
import { FaHeart } from 'react-icons/fa';
import './Feed.css';

Modal.setAppElement('#root');

const EMOJIS = ['❤️', '😂', '😲', '😢', '👍', '👎'];

function Feed() {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.feed.posts);
  const user = useSelector((state) => state.auth.user);
  const [newPost, setNewPost] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [comments, setComments] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [pollData, setPollData] = useState({ question: '', options: ['', '', '', ''] });

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      dispatch(setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))));
    });
    return () => unsubscribe();
  }, [dispatch]);

  const handlePost = async () => {
    if (!newPost.trim()) return;

    // Optional: Validate image URL
    if (imageUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl)) {
      alert('Invalid image URL');
      return;
    }

    await addDoc(collection(db, 'posts'), {
      content: newPost,
      timestamp: serverTimestamp(),
      likes: [],
      reactions: {},
      comments: [],
      author: user?.displayName || 'Anonymous',
      isPoll: false,
      imageUrl: imageUrl.trim() || null
    });

    setNewPost('');
    setImageUrl('');
  };

  const toggleLike = async (postId, likes) => {
    const postRef = doc(db, 'posts', postId);
    const alreadyLiked = likes.includes(user?.uid);
    await updateDoc(postRef, {
      likes: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  };

  const handleComment = async (postId) => {
    const comment = comments[postId];
    if (!comment?.trim()) return;
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion({ user: user?.displayName || 'Anonymous', text: comment })
    });
    setComments({ ...comments, [postId]: '' });
  };

  const handleReaction = async (postId, emoji) => {
    const postRef = doc(db, 'posts', postId);
    const post = posts.find((p) => p.id === postId);
    const userId = user?.uid;
    const newReactions = {};

    for (let key in post.reactions || {}) {
      const val = post.reactions[key];
      newReactions[key] = Array.isArray(val) ? [...val] : [];
    }

    if (newReactions[emoji]?.includes(userId)) {
      newReactions[emoji] = newReactions[emoji].filter((uid) => uid !== userId);
    } else {
      for (let key in newReactions) {
        newReactions[key] = newReactions[key].filter((uid) => uid !== userId);
      }
      if (!newReactions[emoji]) newReactions[emoji] = [];
      newReactions[emoji].push(userId);
    }

    await updateDoc(postRef, { reactions: newReactions });
  };

  const openPollModal = () => {
    setModalOpen(true);
  };

  const closePollModal = () => {
    setPollData({ question: '', options: ['', '', '', ''] });
    setModalOpen(false);
  };

  const handlePollChange = (index, value) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData({ ...pollData, options: newOptions });
  };
  const handleDeletePost = async (postId) => {
  const confirmed = window.confirm('Are you sure you want to delete this post?');
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, 'posts', postId));
    console.log('Post deleted');
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};

  const submitPoll = async () => {
    if (!pollData.question.trim() || pollData.options.some((opt) => !opt.trim())) return;

    await addDoc(collection(db, 'posts'), {
      content: pollData.question,
      timestamp: serverTimestamp(),
      author: user?.displayName || 'Anonymous',
      isPoll: true,
      options: pollData.options.map((opt) => ({ text: opt, votes: [] })),
      comments: [],
      likes: [],
      reactions: {}
    });

    closePollModal();
  };

  const votePoll = async (postId, index) => {
    const postRef = doc(db, 'posts', postId);
    const post = posts.find((p) => p.id === postId);

    const newOptions = post.options.map((opt, i) => {
      return {
        text: opt.text,
        votes: opt.votes.filter((uid) => uid !== user.uid)
      };
    });

    newOptions[index].votes.push(user.uid);
    await updateDoc(postRef, { options: newOptions });
  };

  return (
    <div className="feed-container">
      <h2 className="feed-header">Feed</h2>

      <div className="post-box">
        <textarea
          placeholder="What's on your mind?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        ></textarea>
        <input
          type="text"
          placeholder="Paste image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button onClick={handlePost}>Post</button>
        <button onClick={openPollModal}>Create Poll</button>
      </div>

      {posts.map((post) => (
        <div className="post-card" key={post.id}>
          <div className="post-author">{post.author}</div>
          <p className="post-content">{post.content}</p>
          {post.author === user?.displayName && (
      <button
        className="delete-btn"
        onClick={() => handleDeletePost(post.id)}
         style={{ float: 'right', color: 'red', marginBottom: '5px' }}
      >
        Delete
      </button>
)}

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post"
              style={{ maxWidth: '100%', maxHeight: '400px', marginTop: '10px', borderRadius: '10px' }}
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}

          {post.isPoll ? (
            <div className="poll-options">
              {post.options.map((opt, i) => (
                <div key={i} style={{ margin: '5px 0' }}>
                  <button onClick={() => votePoll(post.id, i)}>{opt.text}</button>
                  <span> ({opt.votes.length} votes)</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <button className="like-btn" onClick={() => toggleLike(post.id, post.likes)}>
                <FaHeart style={{ color: 'red' }} /> Like ({post.likes?.length || 0})
              </button>

              <div className="emoji-reactions">
                {EMOJIS.map((emoji) => (
                  <button key={emoji} onClick={() => handleReaction(post.id, emoji)}>
                    {emoji} {post.reactions?.[emoji]?.length || 0}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="comment-section">
            <input
              type="text"
              placeholder="Write a comment..."
              value={comments[post.id] || ''}
              onChange={(e) => setComments({ ...comments, [post.id]: e.target.value })}
            />
            <button onClick={() => handleComment(post.id)}>Comment</button>
          </div>

          {post.comments?.map((c, i) => (
            <div key={i} className="comment">
              <strong>{c.user}:</strong> {c.text}
            </div>
          ))}
        </div>
      ))}

      <Modal
        isOpen={modalOpen}
        onRequestClose={closePollModal}
        contentLabel="Create Poll"
        style={{
          content: {
            maxWidth: '500px',
            margin: 'auto',
            borderRadius: '12px',
            padding: '20px'
          }
        }}
      >
        <h2>Create a Poll</h2>
        <input
          type="text"
          placeholder="Poll Question"
          value={pollData.question}
          onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
        />
        {pollData.options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={(e) => handlePollChange(idx, e.target.value)}
            style={{ display: 'block', margin: '10px 0' }}
          />
        ))}
        <button onClick={submitPoll}>Submit Poll</button>
        <button onClick={closePollModal}>Cancel</button>
      </Modal>
    </div>
  );
}

export default Feed;
