'use client';

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({ src, poster, onEnded, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onTimeUpdate) onTimeUpdate(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', () => {
      if (onEnded) onEnded();
    });

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', () => {
        if (onEnded) onEnded();
      });
    };
  }, [onEnded, onTimeUpdate]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-border">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
