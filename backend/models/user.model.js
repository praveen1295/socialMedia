import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String, 
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    username: {
        type: String, 
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    profilePicture: {
        type: String,
        default: ''
    },
    bio: {
        type: String, 
        default: '',
        maxlength: [160, 'Bio cannot exceed 160 characters']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: 'prefer-not-to-say'
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post'
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual for posts count
userSchema.virtual('postsCount').get(function() {
    return this.posts ? this.posts.length : 0;
});

// Virtual for followers count
userSchema.virtual('followersCount').get(function() {
    return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
    return this.following ? this.following.length : 0;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = mongoose.model('User', userSchema);