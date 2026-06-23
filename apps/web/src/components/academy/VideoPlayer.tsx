'use client';

import dynamic from 'next/dynamic';

const ReactPlayer: any = dynamic(() => import('react-player'), { ssr: false });

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({ src, poster, onEnded, onTimeUpdate }: VideoPlayerProps) {
  if (!src) {
    return (
      <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-border flex items-center justify-center">
        <span className="text-slate-500 text-sm">No video source provided.</span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-border">
      <ReactPlayer
        url={src}
        controls
        width="100%"
        height="100%"
        light={poster}
        onEnded={() => {
          if (onEnded) onEnded();
        }}
        onProgress={(state: any) => {
          if (onTimeUpdate) onTimeUpdate(state.playedSeconds);
        }}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
    </div>
  );
}
