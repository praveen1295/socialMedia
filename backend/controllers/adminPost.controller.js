import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import { RevenueSharing } from "../models/revenueSharing.model.js";

export const getPostsForApproval = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'pending' } = req.query;
        const adminId = req.id;

        // Verify admin exists and has permission
        const admin = await Admin.findById(adminId);
        if (!admin || !admin.isActive) {
            return res.status(403).json({
                message: 'Unauthorized',
                success: false
            });
        }

        // Check if admin has permission (Admin or Manager)
        if (!['super-admin', 'admin'].includes(admin.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions to view posts for approval',
                success: false
            });
        }

        // Build filter
        const filter = {};
        if (status === 'pending') {
            filter.isApproved = false;
        } else if (status === 'approved') {
            filter.isApproved = true;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        const posts = await Post.find(filter)
            .populate('author', 'username fullName profilePicture')
            .populate('approvedBy', 'fullName email role')
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
                hasPrev: page > 1
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

export const approvePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const adminId = req.id;

        // Verify admin exists and has permission
        const admin = await Admin.findById(adminId);
        if (!admin || !admin.isActive) {
            return res.status(403).json({
                message: 'Unauthorized',
                success: false
            });
        }

        // Check if admin has permission (Admin or Manager)
        if (!['super-admin', 'admin'].includes(admin.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions to approve posts',
                success: false
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            });
        }

        if (post.isApproved) {
            return res.status(400).json({
                message: 'Post is already approved',
                success: false
            });
        }

        // Get current revenue sharing settings
        const revenueSettings = await RevenueSharing.findOne({ isActive: true });
        if (!revenueSettings) {
            return res.status(400).json({
                message: 'No active revenue sharing settings found. Please configure pricing first.',
                success: false
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

        await post.save();

        await post.populate('author', 'username fullName profilePicture');
        await post.populate('approvedBy', 'fullName email role');

        return res.status(200).json({
            message: 'Post approved successfully',
            post,
            pricing: {
                viewCount: post.viewCount,
                likeCount: post.likes.length,
                pricePerView: revenueSettings.pricePerView,
                pricePerLike: revenueSettings.pricePerLike,
                viewPrice,
                likePrice,
                totalPrice
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

export const rejectPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const adminId = req.id;
        const { reason } = req.body;

        // Verify admin exists and has permission
        const admin = await Admin.findById(adminId);
        if (!admin || !admin.isActive) {
            return res.status(403).json({
                message: 'Unauthorized',
                success: false
            });
        }

        // Check if admin has permission (Admin or Manager)
        if (!['super-admin', 'admin'].includes(admin.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions to reject posts',
                success: false
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            });
        }

        if (post.isApproved) {
            return res.status(400).json({
                message: 'Cannot reject an already approved post',
                success: false
            });
        }

        // Delete the post
        await Post.findByIdAndDelete(postId);

        // Remove post from user's posts array
        await User.findByIdAndUpdate(post.author, {
            $pull: { posts: postId }
        });

        return res.status(200).json({
            message: 'Post rejected and deleted successfully',
            reason: reason || 'No reason provided',
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

export const getPostDetails = async (req, res) => {
    try {
        const postId = req.params.id;
        const adminId = req.id;

        // Verify admin exists
        const admin = await Admin.findById(adminId);
        if (!admin || !admin.isActive) {
            return res.status(403).json({
                message: 'Unauthorized',
                success: false
            });
        }

        const post = await Post.findById(postId)
            .populate('author', 'username fullName profilePicture email')
            .populate('approvedBy', 'fullName email role')
            .populate('likes', 'username fullName profilePicture')
            .populate('views.user', 'username fullName profilePicture');

        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
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
                totalPrice
            },
            revenueSettings
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};
