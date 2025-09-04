import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button as BT } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { config } from "../config/config";
import { setMessages } from "@/redux/chatSlice";
import useGetUserFollowings from "@/hooks/useGetUserFollowings";
import { Result, Button } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const navigate = useNavigate();

  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );

  const { userFollowings } = useSelector((store) => store.userFollowings);

  console.log("userFollowings", userFollowings);
  console.log("user", user, suggestedUsers, selectedUser);
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        config.API_ENDPOINTS.MESSAGE.SEND(receiverId),
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useGetUserFollowings(user?._id);

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);

  if (userFollowings?.following && userFollowings?.following?.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Result
          icon={
            <UserAddOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
          }
          title="No Connections Yet"
          subTitle="To start messaging, please follow someone first."
          extra={
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => {
                navigate("/");
              }}
            >
              Find People to Follow
            </Button>
          }
        />
      </div>
    );
  }
  return (
    <div className="flex ml-[16%] h-screen">
      <section className="w-full md:w-1/4 my-8">
        <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
        <hr className="mb-4 border-gray-300" />
        <div className="overflow-y-auto h-[80vh]">
          {userFollowings?.following?.map((following) => {
            const isOnline = onlineUsers.includes(following?._id);
            return (
              <div
                key={following?._id}
                onClick={() => dispatch(setSelectedUser(following))}
                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={following?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{following?.username}</span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    } `}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {selectedUser ? (
        <section className="flex-1 border-l border-l-gray-300 flex flex-col h-full">
          <div className="flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10">
            <Avatar>
              <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{selectedUser?.username}</span>
            </div>
          </div>
          <Messages selectedUser={selectedUser} />
          <div className="flex items-center p-4 border-t border-t-gray-300">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Messages..."
            />
            <BT onClick={() => sendMessageHandler(selectedUser?._id)}>Send</BT>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto">
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1 className="font-medium">Your messages</h1>
          <span>Send a message to start a chat.</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
