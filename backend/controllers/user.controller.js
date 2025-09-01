import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

export const register = async (req, res) => {
    try {
        const { fullName, username, email, password, bio, gender } = req.body;
        const profilePicture = req.file;

        // Check if user already exists with email or username
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({
                message: `User with this ${field} already exists`,
                success: false,
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Handle profile picture upload
        let profilePictureUrl = '';
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            const cloudResponse = await cloudinary.uploader.upload(fileUri);
            profilePictureUrl = cloudResponse.secure_url;
        }

        // Create user
        const user = await User.create({
            fullName,
            username,
            email,
            password: hashedPassword,
            bio: bio || '',
            gender: gender || 'prefer-not-to-say',
            profilePicture: profilePictureUrl
        });

        // Remove password from response
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            gender: user.gender,
            followersCount: 0,
            followingCount: 0,
            postsCount: 0
        };

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user: userResponse
        });
    } catch (error) {
        console.log(error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: "Validation failed",
                success: false,
                errors
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
}
export const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        
        if (!emailOrUsername || !password) {
            return res.status(400).json({
                message: "Email/username and password are required",
                success: false,
            });
        }

        // Find user by email or username
        let user = await User.findOne({
            $or: [
                { email: emailOrUsername.toLowerCase() },
                { username: emailOrUsername.toLowerCase() }
            ]
        });

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
            { userId: user._id, userType: 'user' }, 
            process.env.SECRET_KEY, 
            { expiresIn: '7d' }
        );

        // Populate posts
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
        const validPosts = populatedPosts.filter(post => post !== null);

        // Prepare user response
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            gender: user.gender,
            followers: user.followers,
            following: user.following,
            posts: validPosts,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            postsCount: user.postsCount,
            lastLogin: user.lastLogin
        };

        return res.cookie('token', token, { 
            httpOnly: true, 
            sameSite: 'strict', 
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: process.env.NODE_ENV === 'production'
        }).json({
            message: `Welcome back ${user.fullName}`,
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};
export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
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
                path: 'posts',
                options: { sort: { createdAt: -1 } }
            })
            .populate('bookmarks')
            .populate('followers', 'fullName username profilePicture')
            .populate('following', 'fullName username profilePicture');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        // Check if current user is following this user
        const isFollowing = currentUserId ? user.followers.some(follower => 
            follower._id.toString() === currentUserId.toString()
        ) : false;

        // Prepare user response with stats
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
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
            isOwnProfile: currentUserId ? currentUserId.toString() === userId.toString() : false,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };

        return res.status(200).json({
            user: userResponse,
            success: true
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

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
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
            profilePicture: user.profilePicture,
            bio: user.bio,
            gender: user.gender,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            postsCount: user.postsCount,
            lastLogin: user.lastLogin
        };

        return res.status(200).json({
            message: 'Profile updated successfully.',
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.log(error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: "Validation failed",
                success: false,
                errors
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
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};
export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id; // patel
        const jiskoFollowKrunga = req.params.id; // shivani
        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }
        // mai check krunga ki follow krna hai ya unfollow
        const isFollowing = user.following.includes(jiskoFollowKrunga);
        if (isFollowing) {
            // unfollow logic ayega
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } }),
            ])
            return res.status(200).json({ message: 'Unfollowed successfully', success: true });
        } else {
            // follow logic ayega
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } }),
            ])
            return res.status(200).json({ message: 'followed successfully', success: true });
        }
    } catch (error) {
        console.log(error);
    }
}