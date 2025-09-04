import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import { Employee } from "../models/employee.model.js";
import { RevenueSharing } from "../models/revenueSharing.model.js";

// ✅ Utility: Check if user has required role
const hasPermission = async (userId, allowedRoles = ["admin", "Manager"]) => {
  // Check in Admin model
  const admin = await Admin.findById(userId);
  if (admin && admin.isActive && allowedRoles.includes(admin.role)) {
    return { hasPermission: true, role: admin.role, user: admin };
  }

  // Check in Employee model
  const employee = await Employee.findById(userId);
  if (employee && employee.isActive && allowedRoles.includes(employee.role)) {
    return { hasPermission: true, role: employee.role, user: employee };
  }

  return { hasPermission: false, role: null, user: null };
};

export const getPostsForApproval = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "pending" } = req.query;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to view posts for approval",
        success: false,
      });
    }

    // Build filter
    const filter = {};
    if (status === "pending") {
      filter.isApproved = false;
    } else if (status === "approved") {
      filter.isApproved = true;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const posts = await Post.find(filter)
      .populate("author", "username fullName profilePicture")
      .populate("approvedBy", "fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments(filter);

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNext: page * limit < totalPosts,
        hasPrev: page > 1,
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

export const approvePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to approve posts",
        success: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    if (post.isApproved) {
      return res.status(400).json({
        message: "Post is already approved",
        success: false,
      });
    }

    // Get current revenue sharing settings
    const revenueSettings = await RevenueSharing.findOne({ isActive: true });
    if (!revenueSettings) {
      return res.status(400).json({
        message:
          "No active revenue sharing settings found. Please configure pricing first.",
        success: false,
      });
    }

    // Calculate pricing
    const viewPrice = post.viewCount * revenueSettings.pricePerView;
    const likePrice = post.likes.length * revenueSettings.pricePerLike;
    const totalPrice = viewPrice + likePrice;

    // Update post
    post.isApproved = true;
    post.approvedBy = adminId;
    post.approvedAt = new Date();
    post.viewPrice = viewPrice;
    post.likePrice = likePrice;
    post.totalPrice = totalPrice;
    post.paymentStatus = "pending";

    await post.save();

    await post.populate("author", "username fullName profilePicture");
    await post.populate("approvedBy", "fullName email role");

    return res.status(200).json({
      message: "Post approved successfully",
      post,
      pricing: {
        viewCount: post.viewCount,
        likeCount: post.likes.length,
        pricePerView: revenueSettings.pricePerView,
        pricePerLike: revenueSettings.pricePerLike,
        viewPrice,
        likePrice,
        totalPrice,
      },
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

export const rejectPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const adminId = req.id;
    const { reason } = req.body;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to reject posts",
        success: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    if (post.isApproved) {
      return res.status(400).json({
        message: "Cannot reject an already approved post",
        success: false,
      });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    // Remove post from user's posts array
    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: postId },
    });

    return res.status(200).json({
      message: "Post rejected and deleted successfully",
      reason: reason || "No reason provided",
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

export const getPostDetails = async (req, res) => {
  try {
    const postId = req.params.id;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to view post details",
        success: false,
      });
    }

    const post = await Post.findById(postId)
      .populate("author", "username fullName profilePicture email")
      .populate("approvedBy", "fullName email role")
      .populate("likes", "username fullName profilePicture")
      .populate("views.user", "username fullName profilePicture");

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Get current revenue sharing settings
    const revenueSettings = await RevenueSharing.findOne({ isActive: true });

    // Calculate pricing
    const viewPrice = post.viewCount * (revenueSettings?.pricePerView || 0);
    const likePrice = post.likes.length * (revenueSettings?.pricePerLike || 0);
    const totalPrice = viewPrice + likePrice;

    return res.status(200).json({
      success: true,
      post,
      pricing: {
        viewCount: post.viewCount,
        likeCount: post.likes.length,
        pricePerView: revenueSettings?.pricePerView || 0,
        pricePerLike: revenueSettings?.pricePerLike || 0,
        viewPrice,
        likePrice,
        totalPrice,
      },
      revenueSettings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getAllAdminPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to view posts",
        success: false,
      });
    }

    const skip = (page - 1) * limit;

    // Build filter dynamically
    const filter = {};
    if (status === "approved") {
      filter.isApproved = true;
    } else if (status === "unapproved") {
      filter.isApproved = false;
    } else if (status === "all") {
      // no filter → fetch everything
    }

    const posts = await Post.find(filter)
      .populate("author", "fullName email username profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(filter);

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

export const updateAdminPost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      caption,
      isApproved,
      paymentStatus,
      viewPrice,
      likePrice,
      totalPrice,
    } = req.body;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to update posts",
        success: false,
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Update only fields provided in request
    if (caption !== undefined) post.caption = caption;
    if (isApproved !== undefined) post.isApproved = isApproved;
    if (paymentStatus !== undefined) post.paymentStatus = paymentStatus;
    if (viewPrice !== undefined) post.viewPrice = viewPrice;
    if (likePrice !== undefined) post.likePrice = likePrice;
    if (totalPrice !== undefined) post.totalPrice = totalPrice;

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update post",
    });
  }
};
