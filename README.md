# Social Media Platform - Enhanced Post Features

## Overview
This social media platform now supports enhanced post creation with multiple media types, including images and videos with advanced processing capabilities.

## New Post Features

### ✨ Enhanced Media Support
- **Multiple Media Types**: Support for both images and videos in a single post
- **Multiple File Upload**: Upload up to 10 media files per post
- **Mixed Content**: Combine images and videos in the same post

### 📝 Text Content
- **Character Limit**: Maximum 280 characters for captions
- **Real-time Counter**: Live character count display
- **Smart Validation**: Prevents exceeding character limits

### 🎥 Video Features
- **Auto-Trim**: Videos automatically trimmed to 1 minute maximum
- **Auto-Thumbnail**: Automatic thumbnail generation from video middle
- **Multiple Formats**: Support for MP4, AVI, MOV, WMV, FLV
- **Size Optimization**: Efficient video processing and compression

### 🖼️ Image Features
- **Multiple Images**: Upload multiple images per post
- **Auto-Optimization**: Automatic resizing and compression
- **Format Support**: JPEG, PNG, GIF, WebP formats
- **Quality Control**: Optimized for web viewing

### 🔧 Technical Features
- **File Validation**: Type and size validation (100MB max per file)
- **Progress Tracking**: Real-time upload and processing status
- **Error Handling**: Comprehensive error messages and validation
- **Responsive UI**: Mobile-friendly media grid and controls

## Backend Architecture

### Models
- **Post Schema**: Updated to support media arrays with type, URL, thumbnail, and duration
- **Media Objects**: Structured media storage with metadata

### Controllers
- **Enhanced Post Controller**: Handles multiple file types and processing
- **Video Processing**: FFmpeg integration for video trimming and thumbnail generation
- **Media Validation**: Comprehensive file type and size validation

### Middleware
- **Multer Configuration**: Updated for multiple file handling
- **File Filtering**: Smart file type detection and validation
- **Size Limits**: Configurable file size and count limits

## Frontend Components

### CreatePost Component
- **Multi-File Upload**: Drag and drop or click to select multiple files
- **Media Preview**: Grid layout showing all selected media
- **Character Counter**: Real-time caption length tracking
- **File Management**: Remove individual files before posting

### Post Component
- **Media Display**: Responsive grid for multiple media items
- **Video Controls**: Native video player with custom controls
- **Navigation**: Swipe/click navigation between media items
- **Thumbnail Support**: Video thumbnails for better UX

## API Endpoints

### POST `/api/v1/post/addpost`
- **Method**: POST
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `caption`: String (max 280 chars)
  - `media`: Array of files (max 10 files)

### Response Format
```json
{
  "success": true,
  "message": "New post added",
  "post": {
    "_id": "post_id",
    "caption": "Post caption",
    "media": [
      {
        "type": "image",
        "url": "cloudinary_url",
        "order": 0
      },
      {
        "type": "video",
        "url": "video_url",
        "thumbnail": "thumbnail_url",
        "duration": 45,
        "order": 1
      }
    ],
    "author": "user_id",
    "mediaCount": 2
  }
}
```

## Installation & Setup

### Prerequisites
- Node.js 16+
- FFmpeg (automatically installed via @ffmpeg-installer/ffmpeg)
- MongoDB
- Cloudinary account

### Backend Setup
```bash
cd backend
npm install
# Ensure temp directory exists
mkdir -p temp
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
```

## File Structure
```
backend/
├── models/
│   └── post.model.js          # Updated post schema
├── controllers/
│   └── post.controller.js     # Enhanced post controller
├── middlewares/
│   └── multer.js             # Updated file upload middleware
├── utils/
│   └── videoProcessor.js     # Video processing utilities
└── temp/                     # Temporary file storage

frontend/
├── src/
│   ├── components/
│   │   ├── CreatePost.jsx    # Enhanced post creation
│   │   └── Post.jsx          # Updated post display
│   └── config/
│       └── config.js         # API and media configuration
```

## Usage Examples

### Creating a Post with Multiple Media
1. Click "Create Post" button
2. Write caption (max 280 characters)
3. Select multiple media files (images/videos)
4. Preview media in grid layout
5. Click "Post" to publish

### Video Processing
- Videos are automatically trimmed to 1 minute
- Thumbnails generated from video middle
- Optimized for web streaming
- Support for multiple video formats

## Performance Considerations

### Backend
- Temporary file cleanup after processing
- Efficient video processing with FFmpeg
- Cloudinary integration for media storage
- MongoDB indexing for fast queries

### Frontend
- Lazy loading of media content
- Responsive image/video display
- Efficient state management
- Optimized bundle size

## Security Features

### File Validation
- File type verification
- Size limit enforcement
- Malicious file detection
- Secure file processing

### Authentication
- JWT-based authentication
- User authorization checks
- Secure file upload endpoints
- Rate limiting support

## Future Enhancements

### Planned Features
- **Live Streaming**: Real-time video broadcasting
- **Story Mode**: Temporary post format
- **Advanced Filters**: AI-powered content filtering
- **Analytics**: Post performance metrics
- **Collaboration**: Multi-user post creation

### Technical Improvements
- **WebRTC**: Peer-to-peer video sharing
- **Progressive Web App**: Offline functionality
- **Microservices**: Scalable architecture
- **CDN Integration**: Global content delivery

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
