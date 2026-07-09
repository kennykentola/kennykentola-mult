'use client';
import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, Audio, AbsoluteFill } from 'remotion';
import { Highlight, themes } from 'prism-react-renderer';

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

interface ScriptItem {
  text: string;
  code: string;
}

interface IdeVideoPlayerProps {
  script: ScriptItem[];
  audioUrl: string;
}

export const IdeVideoPlayer: React.FC<IdeVideoPlayerProps> = ({ script, audioUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Combine all code into one long string, or show them sequentially
  // For a simple demo, we will show the latest code snippet that "types" out over time
  
  // Calculate which script item we are currently on based on an arbitrary assumption 
  // that each item takes e.g., 5 seconds (150 frames).
  // A perfect implementation would sync this to the exact timestamp of the audio using an aligner API,
  // but for free tier, we will just evenly space it out based on total duration.
  
  // Since we don't have accurate word-level timestamps without a paid API (like Deepgram), 
  // we'll distribute the script items evenly across the frames.
  const totalFramesPerItem = useMemo(() => {
    // Arbitrary 4 seconds per script step just for visual pacing if not synced exactly
    return fps * 4; 
  }, [fps]);

  const currentStepIndex = Math.min(
    Math.floor(frame / totalFramesPerItem),
    script.length - 1
  );

  const currentStep = script[currentStepIndex];
  
  // Typing effect: reveal 1 character every 2 frames
  const framesInCurrentStep = frame - (currentStepIndex * totalFramesPerItem);
  const charsToReveal = Math.floor(framesInCurrentStep / 2);
  const displayedCode = currentStep ? currentStep.code.slice(0, charsToReveal) : '';

  return (
    <AbsoluteFill className="bg-[#1E1E1E] text-white flex flex-col font-mono relative overflow-hidden">
      {/* Audio Track */}
      {audioUrl && <Audio src={audioUrl} />}
      
      {/* VS Code Window Header */}
      <div className="flex items-center px-4 py-2 bg-[#252526] border-b border-[#3E3E42]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <div className="mx-auto text-xs text-slate-400 font-sans">app.tsx - Antigravity IDE</div>
      </div>

      {/* Code Area */}
      <div className="flex-1 p-8 text-xl leading-relaxed overflow-hidden">
        {currentStep && (
          <Highlight theme={themes.vsDark} code={displayedCode} language="tsx">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={`${className} bg-transparent`} style={style}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="text-[#858585] mr-6 select-none opacity-50">{i + 1}</span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        )}
        
        {/* Blinking Cursor */}
        {(frame % 30 < 15) && (
          <span className="inline-block w-2.5 h-6 bg-blue-400 ml-1 align-middle opacity-80" />
        )}
      </div>

      {/* Subtitles / Explanation overlay */}
      {currentStep && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-2xl text-center bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
          <p className="text-2xl font-sans text-white/90 drop-shadow-md">
            {currentStep.text}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
