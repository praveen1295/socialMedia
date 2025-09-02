import React, { useState, useEffect, useRef } from "react";

const RenderMedia = ({ post }) => {
  const [videoStates, setVideoStates] = useState({});
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const handleVideoPlay = (videoId) => {
    setVideoStates((prev) => ({
      ...prev,
      [videoId]: { ...prev[videoId], isPlaying: true },
    }));
  };

  const handleVideoPause = (videoId) => {
    setVideoStates((prev) => ({
      ...prev,
      [videoId]: { ...prev[videoId], isPlaying: false },
    }));
  };

  const nextMedia = () => {
    if (post.media && currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

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
      {currentMedia.type === "image" ? (
        <img
          className="rounded-sm my-2 w-full aspect-square object-cover"
          src={currentMedia.url}
          alt="post_media"
        />
      ) : (
        <div className="relative">
          <video
            className="rounded-sm my-2 w-full aspect-square object-cover"
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
                  index === currentMediaIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RenderMedia;
