import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";

import { Post } from "../models/post.model.js";

import jwt from "jsonwebtoken";

// Create default admin (run this once to create admin credentials)
export const createDefaultAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: "admin@socialmedia.com",
    });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Default admin already exists",
        success: false,
      });
    }

    // Create default admin
    const admin = await Admin.create({
      fullName: "System Administrator",
      email: "admin@socialmedia.com",
      password: "Admin@123", // This will be hashed by the pre-save middleware
      role: "super-admin",
      permissions: [
        "user-management",
        "post-management",
        "content-moderation",
        "analytics",
        "system-settings",
      ],
    });

    return res.status(201).json({
      message: "Default admin created successfully",
      success: true,
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        message: "Admin account is deactivated",
        success: false,
      });
    }

    // Compare password
    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = await jwt.sign(
      {
        adminId: admin._id,
        userType: "admin",
        role: admin.role,
        permissions: admin.permissions,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Prepare admin response
    const adminResponse = {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
    };

    return res
      .cookie("adminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // sameSite: "strict",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // allow cross-site

        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
      .json({
        message: `Welcome back ${admin.fullName}`,
        success: true,
        admin: adminResponse,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const adminLogout = async (req, res) => {
  try {
    return res.cookie("adminToken", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.adminId; // From admin authentication middleware

    const admin = await Admin.findById(adminId).select("-password");
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        success: false,
      });
    }

    return res.status(200).json({
      admin,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: sort newest first

    return res.status(200).json({
      success: true,
      totalUsers,
      page,
      limit,
      users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get all admins or managers
export const getAdminOrManagers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    const query = {
      role: { $in: ["admin", "manager"] },
    };

    if (role && role !== "all") {
      query.role = role; // filter specific role
    }

    const skip = (page - 1) * limit;

    const admins = await Admin.find(query)
      .select("-password")
      .skip(skip)
      .limit(Number(limit));

    const total = await Admin.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: admins.length,
      total,
      page: Number(page),
      limit: Number(limit),
      admins,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params; // userId from URL
    const { isActive } = req.body; // expected: true or false

    // find user
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // update status
    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.fullName || user.username} is now ${
        isActive ? "Active" : "Inactive"
      }.`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Admin toggleUserStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all posts with pagination
