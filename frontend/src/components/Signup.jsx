import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Upload, User } from "lucide-react";
import { useSelector } from "react-redux";
import { config } from "../config/config";
import Loader from "./ui/loader";

const Signup = () => {
  const [input, setInput] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    bio: "",
    gender: "prefer-not-to-say",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleGenderChange = (value) => {
    setInput({ ...input, gender: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!input.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (input.fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }
    if (!input.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (input.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (!input.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!input.password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (input.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", input.fullName);
      formData.append("username", input.username);
      formData.append("email", input.email);
      formData.append("password", input.password);
      formData.append("bio", input.bio);
      formData.append("gender", input.gender);

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const res = await axios.post(
        config.API_ENDPOINTS.USER.REGISTER,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          fullName: "",
          username: "",
          email: "",
          password: "",
          bio: "",
          gender: "prefer-not-to-say",
        });
        setProfilePicture(null);
        setProfilePicturePreview("");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);
  return (
    <div className="flex items-center w-screen h-screen justify-center bg-gray-50">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-4 p-8 bg-white rounded-lg w-full max-w-md"
      >
        <div className="my-4 text-center">
          <h1 className="text-center font-bold text-2xl text-gray-800">
            SocialMedia
          </h1>
          <p className="text-sm text-center text-gray-600 mt-2">
            Create your account to get started
          </p>
        </div>

        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt="Profile preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:text-blue-700">
            <Upload className="w-4 h-4" />
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <span className="font-medium text-gray-700">Full Name *</span>
          <Input
            type="text"
            name="fullName"
            value={input.fullName}
            onChange={changeEventHandler}
            placeholder="Enter your full name"
            className="focus-visible:ring-transparent my-2"
            required
          />
        </div>

        <div>
          <span className="font-medium text-gray-700">Username *</span>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            placeholder="Choose a unique username"
            className="focus-visible:ring-transparent my-2"
            required
          />
        </div>

        <div>
          <span className="font-medium text-gray-700">Email *</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Enter your email"
            className="focus-visible:ring-transparent my-2"
            required
          />
        </div>

        <div>
          <span className="font-medium text-gray-700">Password *</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Create a strong password"
            className="focus-visible:ring-transparent my-2"
            required
          />
        </div>

        <div>
          <span className="font-medium text-gray-700">Bio</span>
          <Textarea
            name="bio"
            value={input.bio}
            onChange={changeEventHandler}
            placeholder="Tell us about yourself (optional)"
            className="focus-visible:ring-transparent my-2 resize-none"
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-gray-500 text-right">
            {input.bio.length}/160
          </p>
        </div>

        <div>
          <span className="font-medium text-gray-700">Gender</span>
          <Select value={input.gender} onValueChange={handleGenderChange}>
            <SelectTrigger className="focus-visible:ring-transparent my-2">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          className="mt-4 flex items-center justify-center gap-2" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader size="sm" color="white" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        <span className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;
