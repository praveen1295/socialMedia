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

export const getAccountDashboard = async (req, res) => {
    try {
        const { page = 1, limit = 10, paymentStatus } = req.query;
        const adminId = req.id;

        // ✅ Check permissions for Admin + Manager
        const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
        if (!permissionCheck.hasPermission) {
            return res.status(403).json({
                message: 'Insufficient permissions to view account dashboard',
                success: false
            });
        }

        // Build filter for approved posts
        const filter = { isApproved: true };
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        const posts = await Post.find(filter)
            .populate('author', 'username fullName profilePicture email')
            .populate('approvedBy', 'fullName email role')
            .sort({ approvedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments(filter);

        // Calculate total amounts
        const totalPendingAmount = await Post.aggregate([
            { $match: { isApproved: true, paymentStatus: 'pending' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const totalPaidAmount = await Post.aggregate([
            { $match: { isApproved: true, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const totalAmount = await Post.aggregate([
            { $match: { isApproved: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        // Get user statistics
        const userStats = await Post.aggregate([
            { $match: { isApproved: true } },
            {
                $group: {
                    _id: '$author',
                    totalPosts: { $sum: 1 },
                    totalAmount: { $sum: '$totalPrice' },
                    pendingAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalPrice', 0]
                        }
                    },
                    paidAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalPrice', 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userId: '$_id',
                    username: '$user.username',
                    fullName: '$user.fullName',
                    profilePicture: '$user.profilePicture',
                    totalPosts: 1,
                    totalAmount: 1,
                    pendingAmount: 1,
                    paidAmount: 1
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        return res.status(200).json({
            success: true,
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasNext: page * limit < totalPosts,
                hasPrev: page > 1
            },
            summary: {
                totalPendingAmount: totalPendingAmount[0]?.total || 0,
                totalPaidAmount: totalPaidAmount[0]?.total || 0,
                totalAmount: totalAmount[0]?.total || 0,
                totalApprovedPosts: totalPosts
            },
            userStats
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const processPayment = async (req, res) => {
    try {
        const postId = req.params.id;
        const adminId = req.id;

        // ✅ Check permissions for Admin + Manager
        const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
        if (!permissionCheck.hasPermission) {
            return res.status(403).json({
                message: 'Insufficient permissions to process payments',
                success: false
            });
        }

        const post = await Post.findById(postId)
            .populate('author', 'username fullName profilePicture email');

        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            });
        }

        if (!post.isApproved) {
            return res.status(400).json({
                message: 'Cannot process payment for unapproved post',
                success: false
            });
        }

        if (post.paymentStatus === 'paid') {
            return res.status(400).json({
                message: 'Payment already processed for this post',
                success: false
            });
        }

        // Update payment status
        post.paymentStatus = 'paid';
        post.paidAt = new Date();
        await post.save();

        return res.status(200).json({
            message: 'Payment processed successfully',
            post: {
                _id: post._id,
                author: post.author,
                totalPrice: post.totalPrice,
                viewPrice: post.viewPrice,
                likePrice: post.likePrice,
                viewCount: post.viewCount,
                likeCount: post.likes.length,
                paymentStatus: post.paymentStatus,
                paidAt: post.paidAt
            },
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const getUserPaymentHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page = 1, limit = 10 } = req.query;
        const adminId = req.id;

        // ✅ Check permissions for Admin + Manager
        const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
        if (!permissionCheck.hasPermission) {
            return res.status(403).json({
                message: 'Insufficient permissions to view payment history',
                success: false
            });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        const posts = await Post.find({
            author: userId,
            isApproved: true
        })
            .populate('approvedBy', 'fullName email role')
            .sort({ approvedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalPosts = await Post.countDocuments({
            author: userId,
            isApproved: true
        });

        // Calculate user's total amounts
        const userTotals = await Post.aggregate([
            { $match: { author: userId, isApproved: true } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$totalPrice' },
                    pendingAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalPrice', 0]
                        }
                    },
                    paidAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalPrice', 0]
                        }
                    },
                    totalPosts: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                email: user.email
            },
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                hasNext: page * limit < totalPosts,
                hasPrev: page > 1
            },
            summary: userTotals[0] || {
                totalAmount: 0,
                pendingAmount: 0,
                paidAmount: 0,
                totalPosts: 0
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};
