import multer from "multer";

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else if (file.mimetype.startsWith('video/')) {
        // Only allow common video formats
        if (['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported video format. Please use MP4, AVI, MOV, WMV, or FLV.'), false);
        }
    } else {
        cb(new Error('Only image and video files are allowed.'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 10 // Maximum 10 files
    }
});

export default upload;
