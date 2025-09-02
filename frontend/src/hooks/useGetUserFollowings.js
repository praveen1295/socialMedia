import { setUserFollowings } from "@/redux/followingsSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { config } from "../config/config";

const useGetUserFollowings = (userId) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUserFollowings = async () => {
      try {
        const res = await axios.get(
          config.API_ENDPOINTS.USER.FOLLOWING(userId),
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setUserFollowings(res.data));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserFollowings();
  }, [userId]);
};
export default useGetUserFollowings;
