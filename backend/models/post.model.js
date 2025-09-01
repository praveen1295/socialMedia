import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption: {
        type: String, 
        maxlength: [280, 'Caption cannot exceed 280 characters'],
        default: ''
    },
    media: [{
        type: {
            type: String,
            enum: ['image', 'video'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        thumbnail: String, // For video thumbnails
        duration: Number, // For video duration in seconds
        order: Number, // To maintain media order
        processingStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'completed' // Images are always completed, videos start as pending
        }
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment'
    }],
    mediaCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Virtual to check if post has media
postSchema.virtual('hasMedia').get(function() {
    return this.media && this.media.length > 0;
});

// Pre-save middleware to update mediaCount
postSchema.pre('save', function(next) {
    this.mediaCount = this.media ? this.media.length : 0;
    next();
});

export const Post = mongoose.model('Post', postSchema);