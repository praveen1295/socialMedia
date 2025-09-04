import { config } from "@/config/config";
import { setAuthUser } from "@/redux/authSlice";
import { setSelectedPost } from "@/redux/postSlice";
import axios from "axios";
import React, { useState } from "react";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminNavbar() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.get(config.API_ENDPOINTS.USER.LOGOUT, {
        withCredentials: true,
      });
      if (res?.data?.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const navLinks = [
    {
      name: "Employees",
      path: "/admin/employees",
      roles: ["admin"],
    },
    {
      name: "Revenue",
      path: "/admin/revenue",
      roles: ["admin", "Manager"],
    },
    {
      name: "Posts",
      path: "/admin/posts",
      roles: ["admin", "Manager"],
    },
    {
      name: "Accounts",
      path: "/admin/account-dashboard",
      roles: ["admin", "Manager"],
    },
  ];

  // ✅ Filter links by user role
  const filteredLinks = navLinks.filter((link) =>
    link.roles.includes(user?.role)
  );

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/admin")}
        >
          SocialAdmin
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          {filteredLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              {link.name}
            </Link>
          ))}

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search..."
            className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FaUserCircle size={24} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  className="block px-4 py-2 text-red-500 hover:bg-red-50 w-full text-left"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          {filteredLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/admin/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Profile
          </Link>
          <button
            onClick={logoutHandler}
            className="block px-4 py-2 text-red-500 hover:bg-red-50 w-full text-left"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
