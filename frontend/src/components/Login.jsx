import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { config } from "../config/config";
import Loader from "./ui/loader";

const Login = () => {
  const [input, setInput] = useState({
    emailOrUsername: "",
    password: "",
    role: "user", // default role
  });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!input.emailOrUsername.trim()) {
      toast.error("Email or username is required");
      return;
    }
    if (!input.password.trim()) {
      toast.error("Password is required");
      return;
    }

    try {
      setLoading(true);

      let res;

      if (input?.role === "employee") {
        res = await axios.post(
          config.API_ENDPOINTS.USER.EMPLOYEE_LOGIN,
          input,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      } else {
        res = await axios.post(config.API_ENDPOINTS.USER.LOGIN, input, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
      }

      if (res.data.success) {
        console.log("response.data", res.data);
        let data = res.data.employee?res.data.employee:res.data.user;
        dispatch(setAuthUser(data));

        // redirect based on selected role
        if (
          input?.role === "admin" ||
          input?.role === "Manager" ||
          input?.role === "Accountant"
        ) {
          navigate("/admin");
        } else {
          navigate("/");
        }

        toast.success(res.data.message);
        setInput({
          emailOrUsername: "",
          password: "",
          role: "user",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // auto-redirect if already logged in
      navigate(
        user?.role === "admin" ||
          user?.role === "Manager" ||
          user?.role === "Accountant"
          ? "/admin"
          : "/"
      );
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center w-screen h-screen justify-center bg-gray-50">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-5 p-8 bg-white rounded-lg w-full max-w-md"
      >
        <div className="my-4 text-center">
          <h1 className="text-center font-bold text-2xl text-gray-800">
            SocialMedia
          </h1>
          <p className="text-sm text-center text-gray-600 mt-2">
            Welcome back! Please sign in to your account
          </p>
        </div>

        {/* Email or Username */}
        <div>
          <span className="font-medium text-gray-700">Email or Username</span>
          <Input
            type="text"
            name="emailOrUsername"
            value={input.emailOrUsername}
            onChange={changeEventHandler}
            placeholder="Enter your email or username"
            className="focus-visible:ring-transparent my-2"
            required
          />
        </div>

        {/* Password */}
        <div>
          <span className="font-medium text-gray-700">Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Enter your password"
            className="focus-visible:ring-transparent my-2"
            required
          />
        </div>

        {/* Role Selector */}
        <div>
          <span className="font-medium text-gray-700">Login as</span>
          <select
            name="role"
            value={input.role}
            onChange={changeEventHandler}
            className="w-full border rounded p-2 my-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="mt-4 flex items-center justify-center gap-2" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader size="sm" color="white" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Signup Link */}
        <span className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
