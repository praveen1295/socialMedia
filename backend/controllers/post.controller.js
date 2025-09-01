import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { VideoProcessor } from "../utils/videoProcessor.js";

// Async video processing function
async function processVideoAsync(videoBuffer, originalName, cloudinaryPublicId, authorId) {
    try {
        console.log(`Starting async video processing for: ${originalName}`);
        
        // Process video
        const { trimmedVideo, thumbnail, duration } = await VideoProcessor.processVideo(
            videoBuffer, 
            originalName
        );

        // Upload processed video
        const videoUri = `data:video/mp4;base64,${trimmedVideo.toString('base64')}`;
        const videoResponse = await cloudinary.uploader.upload(videoUri, {
            resource_type: 'video',
            format: 'mp4'
        });

        // Upload thumbnail
        const thumbnailUri = `data:image/jpeg;base64,${thumbnail.toString('base64')}`;
        const thumbnailResponse = await cloudinary.uploader.upload(thumbnailUri);

        // Find and update the post with processed video data
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 });
        if (posts.length > 0) {
            const latestPost = posts[0];
            const videoMedia = latestPost.media.find(media => 
                media.type === 'video' && 
                media.processingStatus === 'pending' &&
                media.url.includes(cloudinaryPublicId)
            );
            
            if (videoMedia) {
                videoMedia.url = videoResponse.secure_url;
                videoMedia.thumbnail = thumbnailResponse.secure_url;
                videoMedia.duration = duration;
                videoMedia.processingStatus = 'completed';
                
                await latestPost.save();
                console.log(`Video processing completed for: ${originalName}`);
                
                // Emit socket event to notify client
                const userSocketId = getReceiverSocketId(authorId);
                if (userSocketId) {
                    io.to(userSocketId).emit('videoProcessingComplete', {
                        postId: latestPost._id,
                        mediaIndex: latestPost.media.indexOf(videoMedia),
                        videoData: {
                            url: videoResponse.secure_url,
                            thumbnail: thumbnailResponse.secure_url,
                            duration: duration
                        }
                    });
                }
            }
        }

        // Delete original video from Cloudinary
        await cloudinary.uploader.destroy(cloudinaryPublicId, { resource_type: 'video' });
        
    } catch (error) {
        console.error(`Error in async video processing for ${originalName}:`, error);
        
        // Update processing status to failed
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 });
        if (posts.length > 0) {
            const latestPost = posts[0];
            const videoMedia = latestPost.media.find(media => 
                media.type === 'video' && 
                media.processingStatus === 'pending'
            );
            
            if (videoMedia) {
                videoMedia.processingStatus = 'failed';
                await latestPost.save();
                
                // Emit socket event to notify client of failure
                const userSocketId = getReceiverSocketId(authorId);
                if (userSocketId) {
                    io.to(userSocketId).emit('videoProcessingFailed', {
                        postId: latestPost._id,
                        mediaIndex: latestPost.media.indexOf(videoMedia),
                        error: error.message
                    });
                }
            }
        }
    }
}

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const files = req.files; // Changed from req.file to req.files
        const authorId = req.id;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'At least one media file is required' });
        }

        if (files.length > 10) {
            return res.status(400).json({ message: 'Maximum 10 files allowed' });
        }

        const mediaArray = [];
        let order = 0;

        // Process each file
        for (const file of files) {
            try {
                if (file.mimetype.startsWith('image/')) {
                    // Process image
                    const optimizedImageBuffer = await sharp(file.buffer)
                        .resize({ width: 800, height: 800, fit: 'inside' })
                        .toFormat('jpeg', { quality: 80 })
                        .toBuffer();

                    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
                    const cloudResponse = await cloudinary.uploader.upload(fileUri);

                    mediaArray.push({
                        type: 'image',
                        url: cloudResponse.secure_url,
                        order: order++
                    });

                } else if (file.mimetype.startsWith('video/')) {
                    // For videos, we'll process them asynchronously
                    // First, upload the original video to get a temporary URL
                    const originalVideoUri = `data:video/mp4;base64,${file.buffer.toString('base64')}`;
                    const originalVideoResponse = await cloudinary.uploader.upload(originalVideoUri, {
                        resource_type: 'video',
                        format: 'mp4'
                    });

                    // Add video to media array with processing status
                    mediaArray.push({
                        type: 'video',
                        url: originalVideoResponse.secure_url,
                        thumbnail: null, // Will be updated after processing
                        duration: null, // Will be updated after processing
                        processingStatus: 'pending',
                        order: order++
                    });

                    // Process video asynchronously (don't await)
                    processVideoAsync(file.buffer, file.originalname, originalVideoResponse.public_id, authorId)
                        .catch(error => {
                            console.error(`Error processing video ${file.originalname}:`, error);
                        });
                }
            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);
                return res.status(400).json({ 
                    message: `Error processing file ${file.originalname}: ${error.message}` 
                });
            }
        }

        // Create post with media array
        const post = await Post.create({
            caption,
            media: mediaArray,
            author: authorId
        });

        // Update user's posts
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
}
export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id; 
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
         
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            // emit a notification event
            const notification = {
                type:'like',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {

    }
}
export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKrneWalaUserKiId){
            // emit a notification event
            const notification = {
                type:'dislike',
                userId:likeKrneWalaUserKiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }



        return res.status(200).json({message:'Post disliked', success:true});
    } catch (error) {

    }
}
export const addComment = async (req,res) =>{
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;

        const {text} = req.body;

        const post = await Post.findById(postId);

        if(!text) return res.status(400).json({message:'text is required', success:false});

        const comment = await Comment.create({
            text,
            author:commentKrneWalaUserKiId,
            post:postId
        })

        await comment.populate({
            path:'author',
            select:"username profilePicture"
        });
        
        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message:'Comment Added',
            comment,
            success:true
        })

    } catch (error) {
        console.log(error);
    }
};
export const getCommentsOfPost = async (req,res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');

        if(!comments) return res.status(404).json({message:'No comments found for this post', success:false});

        return res.status(200).json({success:true,comments});

    } catch (error) {
        console.log(error);
    }
}
export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        // check if the logged-in user is the owner of the post
        if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorized'});

        // delete post
        await Post.findByIdAndDelete(postId);

        // remove the post id from the user's post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            success:true,
            message:'Post deleted'
        })

    } catch (error) {
        console.log(error);
    }
}
export const bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmarked -> remove from the bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});

        }else{
            // bookmark krna pdega
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked', success:true});
        }

    } catch (error) {
        console.log(error);
    }
}

export const getVideoProcessingStatus = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found', success: false });
        }

        // Check if any videos are still processing
        const processingVideos = post.media.filter(media => 
            media.type === 'video' && media.processingStatus === 'pending'
        );

        const failedVideos = post.media.filter(media => 
            media.type === 'video' && media.processingStatus === 'failed'
        );

        return res.status(200).json({
            success: true,
            processingCount: processingVideos.length,
            failedCount: failedVideos.length,
            isProcessing: processingVideos.length > 0,
            hasFailures: failedVideos.length > 0,
            media: post.media
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
}