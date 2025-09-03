import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
        unreadCount:0,
    },
    reducers:{
        // actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        },
        incrementUnread:(state) => {
            state.unreadCount += 1;
        },
        clearUnread:(state) => {
            state.unreadCount = 0;
        }
    }
});
export const {setOnlineUsers, setMessages, incrementUnread, clearUnread} = chatSlice.actions;
export default chatSlice.reducer;