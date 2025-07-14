// src/components/FriendButton.js
import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { db } from '../firebase';

function FriendButton({ targetUserId }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const checkFriendStatus = async () => {
      if (!currentUser || currentUser.uid === targetUserId) {
        setStatus('self');
        return;
      }

      const currentUserRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);
      const currentSnap = await getDoc(currentUserRef);
      const targetSnap = await getDoc(targetUserRef);

      const currentData = currentSnap.data();
      const targetData = targetSnap.data();

      if (currentData.friends?.includes(targetUserId)) {
        setStatus('friends');
      } else if (currentData.requestsSent?.includes(targetUserId)) {
        setStatus('requested');
      } else {
        setStatus('none');
      }
    };

    checkFriendStatus();
  }, [currentUser, targetUserId]);

  const handleSendRequest = async () => {
  if (!currentUser || currentUser.uid === targetUserId) return;

  const currentUserRef = doc(db, 'users', currentUser.uid);
  const targetUserRef = doc(db, 'users', targetUserId);

  const [currentSnap, targetSnap] = await Promise.all([
    getDoc(currentUserRef),
    getDoc(targetUserRef),
  ]);

  if (!targetSnap.exists()) return alert("User does not exist!");

  const currentData = currentSnap.data();
  const targetData = targetSnap.data();

  if (
    currentData?.friends?.includes(targetUserId) ||
    currentData?.requestsSent?.includes(targetUserId) ||
    targetData?.requestsReceived?.includes(currentUser.uid)
  ) {
    setStatus('requested');
    return;
  }

  await updateDoc(currentUserRef, {
    requestsSent: arrayUnion(targetUserId),
  });

  await updateDoc(targetUserRef, {
    requestsReceived: arrayUnion(currentUser.uid),
  });

  setStatus('requested');
};



  if (status === 'self') return null;

  return (
    <>
      {status === 'none' && <button onClick={handleSendRequest}>Add Friend</button>}
      {status === 'requested' && <button disabled>Requested</button>}
      {status === 'friends' && <button disabled>Friends</button>}
    </>
  );
}

export default FriendButton;

