import axios from "axios";
import { config } from "../config/config";
import { useCallback, useState } from "react";

const useFollowOrUnfollow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const followOrUnfollowUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post(
        config.API_ENDPOINTS.USER.FOLLOW_OR_UNFOLLOW(userId),
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccess(res.data.message);
        return res.data; // Return response for optional handling
      } else {
        throw new Error(res.data.message || "Action failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { followOrUnfollowUser, loading, error, success };
};

export default useFollowOrUnfollow;
