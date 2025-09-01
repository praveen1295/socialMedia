import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text: { 
        type: String, 
        required: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    post: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true 
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likeCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Pre-save middleware to update likeCount
commentSchema.pre('save', function(next) {
    this.likeCount = this.likes.length;
    next();
});

export const Comment = mongoose.model('Comment', commentSchema);