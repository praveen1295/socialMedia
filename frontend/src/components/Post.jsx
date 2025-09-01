import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { config } from '../config/config';
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [videoStates, setVideoStates] = useState({});
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const handleVideoPlay = (videoId) => {
        setVideoStates(prev => ({
            ...prev,
            [videoId]: { ...prev[videoId], isPlaying: true }
        }));
    }

    const handleVideoPause = (videoId) => {
        setVideoStates(prev => ({
            ...prev,
            [videoId]: { ...prev[videoId], isPlaying: false }
        }));
    }

    const handleVideoVolumeToggle = (videoId) => {
        setVideoStates(prev => ({
            ...prev,
            [videoId]: { 
                ...prev[videoId], 
                isMuted: !prev[videoId]?.isMuted 
            }
        }));
    }

    const nextMedia = () => {
        if (post.media && currentMediaIndex < post.media.length - 1) {
            setCurrentMediaIndex(currentMediaIndex + 1);
        }
    }

    const prevMedia = () => {
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(currentMediaIndex - 1);
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(config.API_ENDPOINTS.POST.LIKE(post?._id, action), { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                // apne post ko update krunga
                const updatedPostData = posts.map(p =>
                    p?._id === post?._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user?._id) : [...p.likes, user?._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {

        try {
            const res = await axios.post(config.API_ENDPOINTS.POST.COMMENT(post?._id), { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p?._id === post?._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(config.API_ENDPOINTS.POST.DELETE(post?._id), { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axios.get(config.API_ENDPOINTS.POST.BOOKMARK(post?._id), {withCredentials:true});
            if(res.data.success){
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const renderMedia = () => {
        if (!post.media || post.media.length === 0) {
            return (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-sm">
                    <span className="text-gray-500">No media</span>
                </div>
            );
        }

        const currentMedia = post.media[currentMediaIndex];
        
        return (
            <div className="relative">
                {currentMedia.type === 'image' ? (
                    <img
                        className='rounded-sm my-2 w-full aspect-square object-cover'
                        src={currentMedia.url}
                        alt="post_media"
                    />
                ) : (
                    <div className="relative">
                        <video
                            className='rounded-sm my-2 w-full aspect-square object-cover'
                            src={currentMedia.url}
                            poster={currentMedia.thumbnail}
                            controls
                            onPlay={() => handleVideoPlay(currentMedia._id)}
                            onPause={() => handleVideoPause(currentMedia._id)}
                            muted={videoStates[currentMedia._id]?.isMuted}
                        />
                        {currentMedia.duration && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                {Math.floor(currentMedia.duration)}s
                            </div>
                        )}
                    </div>
                )}

                {/* Media Navigation */}
                {post.media.length > 1 && (
                    <>
                        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {currentMediaIndex + 1}/{post.media.length}
                        </div>
                        
                        {currentMediaIndex > 0 && (
                            <button
                                onClick={prevMedia}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-80"
                            >
                                ‹
                            </button>
                        )}
                        
                        {currentMediaIndex < post.media.length - 1 && (
                            <button
                                onClick={nextMedia}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-80"
                            >
                                ›
                            </button>
                        )}

                        {/* Media Dots */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {post.media.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentMediaIndex(index)}
                                    className={`w-2 h-2 rounded-full ${
                                        index === currentMediaIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className='my-8 w-full max-w-sm mx-auto'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Avatar>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-3'>
                        <h1>{post.author?.username}</h1>
                       {user?._id === post.author?._id &&  <Badge variant="secondary">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center">
                        {
                        post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-fit text-[#ED4956] font-bold">Unfollow</Button>
                        }
                        
                        <Button variant='ghost' className="cursor-pointer w-fit">Add to favorites</Button>
                        {
                            user && user?._id === post?.author?._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>

            {renderMedia()}

            <div className='flex items-center justify-between my-2'>
                <div className='flex items-center gap-3'>
                    {
                        liked ? <FaHeart onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-red-600' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer hover:text-gray-600' />
                    }

                    <MessageCircle onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer hover:text-gray-600' />
                    <Send className='cursor-pointer hover:text-gray-600' />
                </div>
                <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' />
            </div>
            <span className='font-medium block mb-2'>{postLike} likes</span>
            <p>
                <span className='font-medium mr-2'>{post.author?.username}</span>
                {post.caption}
            </p>
            {
                comment.length > 0 && (
                    <span onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer text-sm text-gray-400'>View all {comment.length} comments</span>
                )
            }
            <CommentDialog open={open} setOpen={setOpen} />
            <div className='flex items-center justify-between'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full'
                />
                {
                    text && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
                }

            </div>
        </div>
    )
}

export default Post