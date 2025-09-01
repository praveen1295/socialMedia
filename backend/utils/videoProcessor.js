import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

// Set ffmpeg path to system installation
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
ffmpeg.setFfprobePath('/usr/bin/ffprobe');

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export class VideoProcessor {
    /**
     * Process video: trim to 1 minute and generate thumbnail
     * @param {Buffer} videoBuffer - Video file buffer
     * @param {string} originalName - Original filename
     * @returns {Promise<{trimmedVideo: Buffer, thumbnail: Buffer, duration: number}>}
     */
    static async processVideo(videoBuffer, originalName) {
        const tempDir = path.join(process.cwd(), 'temp');
        const inputPath = path.join(tempDir, `input_${Date.now()}_${originalName}`);
        const outputPath = path.join(tempDir, `output_${Date.now()}_${originalName}`);
        const thumbnailPath = path.join(tempDir, `thumbnail_${Date.now()}.jpg`);

        try {
            // Ensure temp directory exists
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            console.log(`Processing video: ${originalName}`);

            // Write input video to temp file
            await writeFileAsync(inputPath, videoBuffer);
            console.log(`Input video written to: ${inputPath}`);

            // Get video duration
            const duration = await this.getVideoDuration(inputPath);
            console.log(`Original video duration: ${duration}s`);
            
            // Trim video to 1 minute if longer
            const maxDuration = 60; // 1 minute in seconds
            const actualDuration = Math.min(duration, maxDuration);
            console.log(`Processing video to duration: ${actualDuration}s`);
            
            await this.trimVideo(inputPath, outputPath, actualDuration);
            console.log(`Video trimmed successfully`);
            
            // Generate thumbnail from the middle of the video
            const thumbnailTime = Math.floor(actualDuration / 2);
            await this.generateThumbnail(inputPath, thumbnailPath, thumbnailTime);
            console.log(`Thumbnail generated at ${thumbnailTime}s`);

            // Read processed files
            const trimmedVideo = fs.readFileSync(outputPath);
            const thumbnail = fs.readFileSync(thumbnailPath);

            console.log(`Video processing completed successfully`);

            // Clean up temp files
            await this.cleanup([inputPath, outputPath, thumbnailPath]);

            return {
                trimmedVideo,
                thumbnail,
                duration: actualDuration
            };

        } catch (error) {
            console.error(`Error processing video ${originalName}:`, error);
            // Clean up temp files on error
            await this.cleanup([inputPath, outputPath, thumbnailPath]);
            throw new Error(`Video processing failed: ${error.message}`);
        }
    }

    /**
     * Get video duration in seconds
     */
    static getVideoDuration(inputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) {
                    reject(new Error(`Failed to get video duration: ${err.message}`));
                } else {
                    resolve(metadata.format.duration);
                }
            });
        });
    }

    /**
     * Trim video to specified duration
     */
    static trimVideo(inputPath, outputPath, duration) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([
                    `-t ${duration}`,
                    '-c:v libx264',
                    '-c:a aac',
                    '-preset ultrafast', // Changed from 'fast' to 'ultrafast' for speed
                    '-crf 28', // Increased from 23 to 28 for smaller file size and faster processing
                    '-movflags +faststart', // Optimize for web streaming
                    '-threads 0' // Use all available CPU cores
                ])
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log(`FFmpeg command: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    console.log(`Processing: ${progress.percent}% done`);
                })
                .on('end', () => resolve())
                .on('error', (err) => reject(new Error(`Video trimming failed: ${err.message}`)))
                .run();
        });
    }

    /**
     * Generate thumbnail from video
     */
    static generateThumbnail(inputPath, outputPath, time) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([
                    `-ss ${time}`,
                    '-vframes 1',
                    '-q:v 2',
                    '-vf scale=320:240', // Resize thumbnail for faster processing
                    '-threads 0' // Use all available CPU cores
                ])
                .output(outputPath)
                .on('end', () => resolve())
                .on('error', (err) => reject(new Error(`Thumbnail generation failed: ${err.message}`)))
                .run();
        });
    }

    /**
     * Clean up temporary files
     */
    static async cleanup(filePaths) {
        for (const filePath of filePaths) {
            try {
                if (fs.existsSync(filePath)) {
                    await unlinkAsync(filePath);
                    console.log(`Cleaned up: ${filePath}`);
                }
            } catch (error) {
                console.error(`Error cleaning up file ${filePath}:`, error);
            }
        }
    }
}
