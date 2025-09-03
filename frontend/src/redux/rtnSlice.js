import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
    name:'realTimeNotification',
    initialState:{
        likeNotification:[], // array of {type,userId,postId,userDetails,message}
    },
    reducers:{
        setLikeNotification:(state,action)=>{
            const payload = action.payload;
            if(payload.type === 'like' || payload.type === 'comment'){
                const key = `${payload.type}-${payload.userId}-${payload.postId || ''}`;
                const exists = state.likeNotification.some(n => `${n.type}-${n.userId}-${n.postId || ''}` === key);
                if(!exists){
                    state.likeNotification.push(payload);
                }
            }else if(payload.type === 'dislike'){
                state.likeNotification = state.likeNotification.filter((item)=> !(item.type === 'like' && item.userId === payload.userId && item.postId === payload.postId));
            }else if(payload.type === 'clear'){
                state.likeNotification = [];
            }
        }
    }
});
export const {setLikeNotification} = rtnSlice.actions;
export default rtnSlice.reducer;