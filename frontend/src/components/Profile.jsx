import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle, X } from "lucide-react";
import useFollowOrUnfollow from "@/hooks/useFollowOrUnfollow";
import { config } from "@/config/config";
import { toast } from "sonner";
import axios from "axios";
import { setPosts } from "@/redux/postSlice";
import { setUserPosts } from "@/redux/userPostSlice";
import { setUserProfile } from "@/redux/authSlice";
// import RenderMedia from "./RenderMeadea";

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  const dispatch = useDispatch();

  // fetch profile data
  useGetUserProfile(userId);

  const [activeTab, setActiveTab] = useState("posts");
  const [showFollowingList, setShowFollowingList] = useState(false);

  const { userProfile, user } = useSelector((store) => store.auth);
  const { followOrUnfollowUser, loading } = useFollowOrUnfollow();

  const [isFollowing, setIsFollowing] = useState(false);

  // check if current user follows this profile
  useEffect(() => {
    const uerProfileIds = userProfile.followers?.map((f) => f._id);
    if (userProfile && user && Array.isArray(uerProfileIds)) {
      setIsFollowing(uerProfileIds?.includes(user._id));
    }
  }, [userProfile, user]);

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  const handleFollowToggle = async (targetUserId) => {
    const res = await followOrUnfollowUser(targetUserId);
    if (res?.success) {
      // if toggling main profile
      if (targetUserId === userProfile._id) {
        setIsFollowing((prev) => !prev);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  let displayedPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  const deletePostHandler = async (post) => {
    try {
      const res = await axios.delete(
        config.API_ENDPOINTS.POST.DELETE(post?._id),
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = displayedPost.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setUserProfile({ ...userProfile, posts: updatedPostData }));
        dispatch(setPosts(updatedPostData));

        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.messsage);
    }
  };

  return (
    <div className="flex max-w-5xl justify-center mx-auto pl-10">
      <div className="flex flex-col gap-20 p-8">
        {/* Profile Header */}
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profilephoto"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span>{userProfile?.username}</span>

                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 h-8"
                      >
                        Edit profile
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      View archive
                    </Button>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      Ad tools
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className={`h-8 ${
                        isFollowing
                          ? "bg-gray-300 hover:bg-gray-400"
                          : "bg-[#0095F6] hover:bg-[#3192d2]"
                      }`}
                      onClick={() => handleFollowToggle(userProfile._id)}
                      disabled={loading}
                    >
                      {loading
                        ? "Processing..."
                        : isFollowing
                        ? "Unfollow"
                        : "Follow"}
                    </Button>
                    {isFollowing && (
                      <Button variant="secondary" className="h-8">
                        Message
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts?.length}{" "}
                  </span>
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers?.length}{" "}
                  </span>
                  followers
                </p>
                <p
                  className="cursor-pointer hover:underline"
                  onClick={() => setShowFollowingList(true)}
                >
                  <span className="font-semibold">
                    {userProfile?.following?.length}{" "}
                  </span>
                  following
                </p>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || "bio here..."}
                </span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign />
                  <span className="pl-1">{userProfile?.username}</span>
                </Badge>
              </div>
            </div>
          </section>
        </div>

        {/* Tabs */}
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
            <span className="py-3 cursor-pointer">REELS</span>
            <span className="py-3 cursor-pointer">TAGS</span>
          </div>

          {/* Posts/Bookmarks grid */}
          <div className="grid grid-cols-3 gap-1">
            {displayedPost?.map((post) => {
              const firstMedia = post?.media?.[0];
              const previewUrl =
                firstMedia?.type === "video"
                  ? firstMedia?.thumbnail
                  : firstMedia?.url;

              return (
                <div key={post?._id} className="relative group cursor-pointer">
                  {/* Media preview */}
                  {/* <img
                    src={previewUrl}
                    alt={post?.caption || "post"}
                    className="rounded-sm my-2 w-full aspect-square object-cover"
                  /> */}
                  <Button
                    onClick={() => deletePostHandler(post)}
                    variant="ghost"
                    className="cursor-pointer w-fit"
                  >
                    Delete
                  </Button>
                  <RenderMedia post={post} deleteUserPost={deletePostHandler} />

                  {/* Hover overlay */}
                  {/* <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"> */}
                  <div className="flex items-center text-white space-x-4">
                    <button className="flex items-center gap-2 hover:text-gray-300">
                      <Heart />
                      <span>{post?.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-gray-300">
                      <MessageCircle />
                      <span>{post?.comments?.length || 0}</span>
                    </button>
                  </div>
                  {/* </div> */}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Following List Modal */}
      {showFollowingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-96 p-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold">Following</h2>
              <X
                className="cursor-pointer"
                onClick={() => setShowFollowingList(false)}
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {userProfile?.following?.map((followedUser) => (
                <div
                  key={followedUser._id}
                  className="flex justify-between items-center mb-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={followedUser.profilePicture}
                        alt={followedUser.username}
                      />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span>{followedUser.username}</span>
                  </div>
                  <Button
                    className="h-7 bg-gray-300 hover:bg-gray-400"
                    onClick={() => handleFollowToggle(followedUser._id)}
                    disabled={loading}
                  >
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

const RenderMedia = ({ post, deletePostHandler }) => {
  const [videoStates, setVideoStates] = useState({});
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const handleVideoPlay = (videoId) => {
    setVideoStates((prev) => ({
      ...prev,
      [videoId]: { ...prev[videoId], isPlaying: true },
    }));
  };

  const handleVideoPause = (videoId) => {
    setVideoStates((prev) => ({
      ...prev,
      [videoId]: { ...prev[videoId], isPlaying: false },
    }));
  };

  const nextMedia = () => {
    if (post.media && currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  if (!post.media || post.media.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-sm">
        <span className="text-gray-500">No media</span>
      </div>
    );
  }

  const currentMedia = post.media[currentMediaIndex];

  return (
    <div className="relative">
      {currentMedia.type === "image" ? (
        <img
          className="rounded-sm my-2 w-full aspect-square object-cover"
          src={currentMedia.url}
          alt="post_media"
        />
      ) : (
        <div className="relative">
          <video
            className="rounded-sm my-2 w-full aspect-square object-cover"
            src={currentMedia.url}
            poster={currentMedia.thumbnail}
            controls
            onPlay={() => handleVideoPlay(currentMedia._id)}
            onPause={() => handleVideoPause(currentMedia._id)}
            muted={videoStates[currentMedia._id]?.isMuted}
          />
          {currentMedia.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {Math.floor(currentMedia.duration)}s
            </div>
          )}
        </div>
      )}

      {/* Media Navigation */}
      {post.media.length > 1 && (
        <>
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {currentMediaIndex + 1}/{post.media.length}
          </div>

          {currentMediaIndex > 0 && (
            <button
              onClick={prevMedia}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-80"
            >
              ‹
            </button>
          )}

          {currentMediaIndex < post.media.length - 1 && (
            <button
              onClick={nextMedia}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-80"
            >
              ›
            </button>
          )}

          {/* Media Dots */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {post.media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMediaIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentMediaIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
