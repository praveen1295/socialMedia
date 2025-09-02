import { createSlice } from "@reduxjs/toolkit";
const userPostSlice = createSlice({
  name: "userPost",
  initialState: {
    userPost: [],
    selectedUserPost: null,
  },
  reducers: {
    //actions
    setPosts: (state, action) => {
      state.userPost = action.payload;
    },
    setSelectedPost: (state, action) => {
      state.selectedUserPost = action.payload;
    },
  },
});
export const { setUserPosts, setSelectedUserPost } = userPostSlice.actions;
export default userPostSlice.reducer;
