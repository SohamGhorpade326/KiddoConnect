// Folder: src/features/feedSlice.js
import { createSlice } from '@reduxjs/toolkit';

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: [],
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
  },
});

export const { setPosts } = feedSlice.actions;
export default feedSlice.reducer;
