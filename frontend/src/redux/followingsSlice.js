import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "userFollowings",
  initialState: {
    userFollowings: [],
  },
  reducers: {
    // actions
    setUserFollowings: (state, action) => {
      state.userFollowings = action.payload;
    },
  },
});
export const { setUserFollowings } = authSlice.actions;
export default authSlice.reducer;
