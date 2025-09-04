import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useFollowOrUnfollow from "@/hooks/useFollowOrUnfollow";
import { setSuggestedUsers } from "@/redux/authSlice";

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const { suggestedUsers } = useSelector((store) => store.auth);

  const { followOrUnfollowUser, loading, success } = useFollowOrUnfollow();
  const [followBtnIdx, setFollowBtnIdx] = React.useState(null);
  const handleFollowToggle = async (userId) => {
    const res = await followOrUnfollowUser(userId);

    if (res?.success) {
      // Update suggested users state locally after follow/unfollow
      const updatedUsers = suggestedUsers.filter((u) => u._id !== userId);
      dispatch(setSuggestedUsers(updatedUsers));
    }
  };

  return (
    <div className="my-10">
      <div className="flex items-center justify-between text-sm">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>

      {suggestedUsers?.length > 0 ? (
        suggestedUsers.map((user, idx) => (
          <div
            key={user?._id}
            className="flex items-center justify-between my-5"
          >
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user?._id}`}>
                <Avatar>
                  <AvatarImage src={user?.profilePicture} alt="post_image" />
                  <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                </h1>
                <span className="text-gray-600 text-sm">
                  {user?.bio || "Bio here..."}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setFollowBtnIdx(idx);
                handleFollowToggle(user._id, idx);
              }}
              disabled={followBtnIdx === idx && loading}
              className={`text-xs font-bold ${
                followBtnIdx === idx && loading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#3BADF8] hover:text-[#3495d6]"
              }`}
            >
              {loading ? "Processing..." : "Follow"}
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm mt-4">No suggestions available.</p>
      )}
    </div>
  );
};

export default SuggestedUsers;
