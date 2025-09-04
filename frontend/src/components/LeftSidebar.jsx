import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { config } from "../config/config";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  const { unreadCount } = useSelector((store) => store.chat);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(config.API_ENDPOINTS.USER.LOGOUT, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    // { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    // { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block fixed top-0 z-10 left-0 px-4 border-r border-gray-200 dark:border-gray-800 w-[16%] h-screen bg-white dark:bg-neutral-950">
        <div className="flex flex-col">
          <div className="my-8 pl-3 pr-2 flex items-center justify-between">
            <h1 className="font-bold text-xl">LOGO</h1>
            <ThemeToggle />
          </div>
          <div>
            {sidebarItems.map((item, index) => {
              const showNotifBadge =
                item.text === "Notifications" && likeNotification.length > 0;
              const showMsgBadge = item.text === "Messages" && unreadCount > 0;
              return (
                <div
                  onClick={() => sidebarHandler(item.text)}
                  key={index}
                  className="flex items-center gap-3 relative hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer rounded-lg p-3 my-3"
                >
                  <div className="relative">
                    {item.icon}
                    {/* Message unread badge */}
                    {showMsgBadge && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-600 text-[10px] leading-4 text-white text-center">
                        {unreadCount}
                      </span>
                    )}
                    {/* Notifications count badge */}
                    {showNotifBadge && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-600 text-[10px] leading-4 text-white text-center">
                        {likeNotification.length}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline">{item.text}</span>
                  {item.text === "Notifications" &&
                    likeNotification.length > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            size="icon"
                            className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6"
                          >
                            {likeNotification.length}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div>
                            {likeNotification.length === 0 ? (
                              <p>No new notification</p>
                            ) : (
                              likeNotification.map((notification) => {
                                const key = `${notification.type}-${
                                  notification.userId
                                }-${notification.postId || ""}`;
                                const isComment =
                                  notification.type === "comment";
                                const text = isComment
                                  ? "commented on your post"
                                  : "liked your post";
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center gap-2 my-2"
                                  >
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          notification.userDetails
                                            ?.profilePicture
                                        }
                                      />
                                      <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm">
                                      <span className="font-bold">
                                        {notification.userDetails?.username}
                                      </span>{" "}
                                      {text}
                                    </p>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                </div>
              );
            })}
          </div>
        </div>

        <CreatePost open={open} setOpen={setOpen} />
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-950">
        <div className="flex justify-between px-6 py-3">
          {["Home", "Search", "Create", "Messages", "Profile"].map((label) => {
            const item = sidebarItems.find((i) => i.text === label);
            if (!item) return null;
            const showMsgBadge = label === "Messages" && unreadCount > 0;
            return (
              <button
                key={label}
                onClick={() => sidebarHandler(label)}
                className="relative flex flex-col items-center text-sm"
              >
                <div className="relative">
                  {item.icon}
                  {showMsgBadge && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-600 text-[10px] leading-4 text-white text-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{label}</span>
              </button>
            );
          })}
          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

export default LeftSidebar;
