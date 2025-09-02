import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2, X, Image, Video, Upload } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios'
import { config } from '../config/config';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

const CreatePost = ({ open, setOpen }) => {
  const mediaRef = useRef();
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user} = useSelector(store=>store.auth);
  const {posts} = useSelector(store=>store.post);
  const dispatch = useDispatch();

  const MAX_CAPTION_LENGTH = 280;
  const MAX_FILES = 10;

  const fileChangeHandler = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const newFiles = [...files];
    const newPreviews = [...mediaPreviews];

    for (const file of selectedFiles) {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a valid image or video file`);
        continue;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 100MB`);
        continue;
      }

      newFiles.push(file);
      const dataUrl = await readFileAsDataURL(file);
      newPreviews.push({
        url: dataUrl,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name
      });
    }

    setFiles(newFiles);
    setMediaPreviews(newPreviews);
  }

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setMediaPreviews(newPreviews);
  }

  const createPostHandler = async (e) => {
    if (files.length === 0) {
      toast.error('Please select at least one media file');
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    
    files.forEach((file, index) => {
      formData.append("media", file);
    });

    try {
      setLoading(true);
      const res = await axios.post(config.API_ENDPOINTS.POST.ADD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        // Reset form
        setFiles([]);
        setMediaPreviews([]);
        setCaption("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  }

  const handleCaptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CAPTION_LENGTH) {
      setCaption(value);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className='text-center font-semibold'>Create New Post</DialogHeader>
        
        <div className='flex gap-3 items-center'>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold text-xs'>{user?.username}</h1>
            <span className='text-gray-600 text-xs'>Bio here...</span>
          </div>
        </div>

        <div className="relative">
          <Textarea 
            value={caption} 
            onChange={handleCaptionChange} 
            className="focus-visible:ring-transparent border-none resize-none" 
            placeholder="Write a caption..." 
            rows={3}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {caption.length}/{MAX_CAPTION_LENGTH}
          </div>
        </div>

        {/* Media Preview Grid */}
        {mediaPreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                {preview.type === 'image' ? (
                  <img 
                    src={preview.url} 
                    alt={`preview_${index}`} 
                    className="w-full h-32 object-cover rounded-md"
                  />
                ) : (
                  <video 
                    src={preview.url} 
                    className="w-full h-32 object-cover rounded-md"
                    muted
                  />
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {preview.type === 'video' ? 'VIDEO' : 'IMAGE'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* File Selection */}
        <div className="space-y-3">
          <input 
            ref={mediaRef} 
            type='file' 
            className='hidden' 
            onChange={fileChangeHandler}
            multiple
            accept="image/*,video/*"
          />
          
          <Button 
            onClick={() => mediaRef.current.click()} 
            className='w-full bg-[#0095F6] hover:bg-[#258bcf] flex items-center gap-2'
            disabled={files.length >= MAX_FILES}
          >
            <Upload size={16} />
            {files.length === 0 ? 'Select Media Files' : `Add More (${files.length}/${MAX_FILES})`}
          </Button>

          {files.length > 0 && (
            <div className="text-xs text-gray-600 text-center">
              {files.length} file(s) selected • Max {MAX_FILES} files
            </div>
          )}
        </div>

        {/* Post Button */}
        {files.length > 0 && (
          <Button 
            onClick={createPostHandler} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Post...
              </>
            ) : (
              'Post'
            )}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost