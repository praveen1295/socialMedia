import { useEffect } from "react";
import ChatPage from "./components/ChatPage";
import EditProfile from "./components/EditProfile";
import Home from "./components/Home";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Profile from "./components/Profile";
import Signup from "./components/Signup";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers, incrementUnread } from "./redux/chatSlice";
import { setLikeNotification } from "./redux/rtnSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Admin from "./admin";
import AdminUserList from "./admin/AdminUsers";
import AdminManagerList from "./admin/AdminOrManagerList";
import EmployeeList from "./admin/EmployeeList";
import RevenueSharing from "./admin/RevenueSharing";
import AccountDashboard from "./admin/AccountDashboard";
import PageNotFound from "../src/components/ui/404";
import AdminPostsList from "./admin/posts";
import { toast } from "sonner";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes roles={["user"]}>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes roles={["user"]}>
            <Home />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoutes roles={["user"]}>
            <Profile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoutes roles={["user"]}>
            <EditProfile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoutes roles={["user"]}>
            <ChatPage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoutes roles={["admin", "Manager", "Accountant"]}>
        <Admin />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoutes roles={["admin", "Manager", "Accountant"]}>
        <AdminUserList />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/admin/employees",
    element: (
      <ProtectedRoutes roles={["admin", "Manager", "Accountant"]}>
        <EmployeeList />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/admin/admins-managers",
    element: (
      <ProtectedRoutes roles={["admin", "Manager", "Accountant"]}>
        <AdminManagerList />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/admin/posts",
    element: (
      <ProtectedRoutes roles={["admin", "Manager"]}>
        <AdminPostsList />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/admin/revenue",
    element: (
      <ProtectedRoutes roles={["admin", "Manager"]}>
        <RevenueSharing />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/admin/account-dashboard",
    element: (
      <ProtectedRoutes roles={["admin", "Manager"]}>
        <AccountDashboard />
      </ProtectedRoutes>
    ),
  },
  {
    path: "*",
    element: <PageNotFound></PageNotFound>,
  },
]);

function App() {
  const { user } = useSelector((store) => store.auth);
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io(API_BASE_URL, {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });
      dispatch(setSocket(socketio));

      // listen all the events
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on("notification", (notification) => {
        dispatch(setLikeNotification(notification));
        const title = notification?.message || "New notification";
        const description = notification?.userDetails?.username;
        toast.message(title, { description });
      });

      socketio.on("newMessage", (message) => {
        dispatch(incrementUnread());
        toast.message("New message", {
          description: message.message,
        });
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      };
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
