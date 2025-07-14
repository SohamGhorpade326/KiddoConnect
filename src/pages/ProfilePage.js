import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { db } from '../firebase';
import FriendButton from '../components/FriendButton';
import './ProfilePage.css';

export default function ProfilePage() {
  const currentUser = useSelector((state) => state.auth.user);
  const [users, setUsers] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', bio: '', phone: '', age: '', social: ''
  });

  useEffect(() => {
    async function fetchUsers() {
      if (!currentUser) return;
      const snap = await getDocs(collection(db, 'users'));
      const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const me = all.find(u => u.uid === currentUser.uid);
      setMyProfile(me);
      setFormData({
        name: me.name || '',
        bio: me.bio || '',
        phone: me.phone || '',
        age: me.age || '',
        social: me.social || ''
      });
      setUsers(all.filter(u => u.uid !== currentUser.uid));
    }
    fetchUsers();
  }, [currentUser]);

  const saveProfile = async () => {
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, { ...formData });
    setMyProfile({ ...myProfile, ...formData });
    setIsEditing(false);
  };

  if (!myProfile) return <p className="loading-text">Loading...</p>;

  return (
    <div className="profile-page fade-in">
      <div className="profile-container">
        <div className="profile-section slide-up">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(myProfile.name)}&background=random`}
            alt="avatar"
            className="profile-avatar"
          />
          <div className="profile-details card-glow">
            {isEditing ? (
              <>
                <input
                  name="name"
                  value={formData.name}
                  placeholder="Name"
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                />
                <textarea
                  name="bio"
                  value={formData.bio}
                  placeholder="Bio"
                  onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                />
                <input
                  name="phone"
                  value={formData.phone}
                  placeholder="Phone"
                  onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                />
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  placeholder="Age"
                  onChange={e => setFormData(f => ({ ...f, age: e.target.value }))}
                />
                <input
                  name="social"
                  value={formData.social}
                  placeholder="Social Link"
                  onChange={e => setFormData(f => ({ ...f, social: e.target.value }))}
                />
                <div className="button-group">
                  <button onClick={saveProfile} className="btn btn-save">Save</button>
                  <button onClick={() => setIsEditing(false)} className="btn btn-cancel">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h2>{myProfile.name}</h2>
                <p>{myProfile.email}</p>
                <p><strong>Bio:</strong> {myProfile.bio || 'N/A'}</p>
                <p><strong>Phone:</strong> {myProfile.phone || 'N/A'}</p>
                <p><strong>Age:</strong> {myProfile.age || 'N/A'}</p>
                <p>
                  <strong>Social:</strong>{' '}
                  {myProfile.social ? (
                    <a href={myProfile.social} target="_blank" rel="noopener noreferrer">{myProfile.social}</a>
                  ) : 'N/A'}
                </p>
                <button onClick={() => setIsEditing(true)} className="btn btn-edit">Edit Profile</button>
              </>
            )}
          </div>
        </div>

        <div className="users-section fade-in">
          <h3>🌟 Explore People</h3>
          <div className="users-grid">
            {users.map(user => (
              <div className="user-card pop-in" key={user.uid}>
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                  alt="avatar"
                  className="user-avatar"
                />
                <div>
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                </div>
                <FriendButton targetUserId={user.uid} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}