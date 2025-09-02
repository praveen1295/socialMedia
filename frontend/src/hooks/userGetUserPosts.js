import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { config } from "@/config/config";
import { setUserPosts } from "@/redux/userPostSlice";

const useGetUserPosts = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllUserPost = async () => {
      try {
        const res = await axios.get(config.API_ENDPOINTS.POST.USER_POSTS, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setUserPosts(res.data.posts));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllUserPost();
  }, []);
};

export default useGetUserPosts;
