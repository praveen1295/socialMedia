import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

export const register = async (req, res) => {
  try {
    const { fullName, username, email, password, bio, gender, role } = req.body;
    const profilePicture = req.file;

    // Check if user already exists with email or username

    let existingUser;
    if (role === "admin") {
      existingUser = await Admin.findOne({
        $or: [{ email }, { username }],
      });
    } else {
      existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
    }
    // existingUser = await User.findOne({
    //   $or: [{ email }, { username }],
    // });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return res.status(400).json({
        message: `User with this ${field} already exists`,
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle profile picture upload
    let profilePictureUrl = "";
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      profilePictureUrl = cloudResponse.secure_url;
    }

    // Create user

    let user;
    let userData = {
      fullName,
      username,
      email,
      role,
      password: hashedPassword,
      bio: bio || "",
      gender: gender || "prefer-not-to-say",
      profilePicture: profilePictureUrl,
    };
    if (role === "admin") {
      user = await Admin.create(userData);
    } else {
      user = await User.create(userData);
    }

    // Remove password from response
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      gender: user.gender,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    };

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.log(error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        success: false,
        errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `User with this ${field} already exists`,
        success: false,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrUsername, password, role } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        message: "Email/username and password are required",
        success: false,
      });
    }
    let user;
    if (role === "admin") {
      user = await Admin.findOne({
        $or: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      });
    } else {
      user = await User.findOne({
        $or: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      });
    }
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        message: "Account is deactivated",
        success: false,
      });
    }
    // Find user by email or username

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = await jwt.sign(
      { 
        userId: user._id, 
        userType: role === "admin" ? "admin" : "user",
        role: user.role
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    let userResponse;
    // Populate posts
    if (role === "admin") {
      userResponse = {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        gender: user.gender,
        lastLogin: user.lastLogin,
      };
    } else {
      const populatedPosts = await Promise.all(
        user.posts.map(async (postId) => {
          const post = await Post.findById(postId);
          if (post && post.author.equals(user._id)) {
            return post;
          }
          return null;
        })
      );
      // Filter out null posts
      const validPosts = populatedPosts.filter((post) => post !== null);
      // Prepare user response
      userResponse = {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        gender: user.gender,
        followers: user.followers,
        following: user.following,
        posts: validPosts,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        lastLogin: user.lastLogin,
      };
    }

    console.log("userResponse===", userResponse);
    // return res
    //   .cookie("token", token, {
    //     httpOnly: true,
    //     sameSite: "strict",
    //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    //     secure: process.env.NODE_ENV === "production",
    //   })
    //   .json({
    //     message: `Welcome back ${user.fullName}`,
    //     success: true,
    //     user: userResponse,
    //   });

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // allow cross-site
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        success: true,
        user: userResponse,
      });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const logout = async (_, res) => {
  console.log("logout called");
  try {
    return res
      .cookie("token", "", { maxAge: 0 })
      .cookie("adminToken", "", { maxAge: 0 })
      .json({
        message: "Logged out successfully.",
        success: true,
      });
  } catch (error) {
    console.log(error);
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.id; // From authentication middleware

    let user = await User.findById(userId)
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
      })
      .populate("bookmarks")
      .populate("followers", "fullName username profilePicture")
      .populate("following", "fullName username profilePicture");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if current user is following this user
    const isFollowing = currentUserId
      ? user.followers.some(
          (follower) => follower._id.toString() === currentUserId.toString()
        )
      : false;

    // Prepare user response with stats
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      gender: user.gender,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      bookmarks: user.bookmarks,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      postsCount: user.postsCount,
      isFollowing,
      isOwnProfile: currentUserId
        ? currentUserId.toString() === userId.toString()
        : false,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    return res.status(200).json({
      user: userResponse,
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

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { fullName, bio, gender } = req.body;
    const profilePicture = req.file;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // Handle profile picture upload
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      const cloudResponse = await cloudinary.uploader.upload(fileUri);
      user.profilePicture = cloudResponse.secure_url;
    }

    // Update fields if provided
    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (gender) user.gender = gender;

    await user.save();

    // Prepare response with updated user data
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      bio: user.bio,
      gender: user.gender,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      postsCount: user.postsCount,
      lastLogin: user.lastLogin,
    };

    return res.status(200).json({
      message: "Profile updated successfully.",
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.log(error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        success: false,
        errors,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.id;

    // Get current user's following list
    const currentUser = await User.findById(currentUserId).select("following");
    const followingIds = currentUser?.following.map((id) => id.toString());

    // Get users that the current user is not following and not the current user
    const suggestedUsers = await User.find({
      _id: { $ne: currentUserId, $nin: followingIds },
    })
      .select("username fullName profilePicture followersCount followingCount")
      .limit(10)
      .sort({ followersCount: -1 });

    // Add mutual connections count for each suggested user
    const suggestionsWithMutual = await Promise.all(
      suggestedUsers.map(async (user) => {
        const mutualConnections = await User.countDocuments({
          _id: { $in: followingIds },
          following: user._id,
        });

        return {
          ...user.toObject(),
          mutualConnections,
        };
      })
    );

    // Sort by mutual connections first, then by followers count
    suggestionsWithMutual.sort((a, b) => {
      if (b.mutualConnections !== a.mutualConnections) {
        return b.mutualConnections - a.mutualConnections;
      }
      return b.followersCount - a.followersCount;
    });

    return res.status(200).json({
      success: true,
      suggestedUsers: suggestionsWithMutual,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
export const followOrUnfollow = async (req, res) => {
  try {
    const followKrneWala = req.id;
    const jiskoFollowKrunga = req.params.id;
    if (followKrneWala === jiskoFollowKrunga) {
      return res.status(400).json({
        message: "You cannot follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(followKrneWala);
    const targetUser = await User.findById(jiskoFollowKrunga);

    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
    // mai check krunga ki follow krna hai ya unfollow
    const isFollowing = user.following.includes(jiskoFollowKrunga);
    if (isFollowing) {
      // unfollow logic ayega
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $pull: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $pull: { followers: followKrneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "Unfollowed successfully", success: true });
    } else {
      // follow logic ayega
      await Promise.all([
        User.updateOne(
          { _id: followKrneWala },
          { $push: { following: jiskoFollowKrunga } }
        ),
        User.updateOne(
          { _id: jiskoFollowKrunga },
          { $push: { followers: followKrneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "followed successfully", success: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate(
        "followers",
        "username fullName profilePicture followersCount followingCount"
      )
      .select("followers");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      followers: user.followers,
      followersCount: user.followers.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate(
        "following",
        "username fullName profilePicture followersCount followingCount"
      )
      .select("following");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      following: user.following,
      followingCount: user.following.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
