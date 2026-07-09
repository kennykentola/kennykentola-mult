'use client';
import React, { useMemo, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, Audio, AbsoluteFill } from 'remotion';
import { Highlight, themes } from 'prism-react-renderer';

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

export interface ScriptItem {
  text: string;
  code: string;
}

interface IdeVideoPlayerProps {
  script: ScriptItem[];
  audioUrl: string;
  voiceURI?: string;
}

export const IdeVideoPlayer = ({ script, audioUrl, voiceURI }: IdeVideoPlayerProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Combine all code into one long string, or show them sequentially
  // For a simple demo, we will show the latest code snippet that "types" out over time
  
  // Pre-calculate the start and end frames for each step based on the length of the text.
  // We assume a speaking rate of roughly ~12 characters per second.
  const stepTimings = useMemo(() => {
    let currentStart = 0;
    return script.map((step) => {
      const durationInSeconds = Math.max(4, step.text.length / 12);
      const durationInFrames = Math.ceil(durationInSeconds * fps);
      const timing = { start: currentStart, end: currentStart + durationInFrames, duration: durationInFrames };
      currentStart += durationInFrames;
      return timing;
    });
  }, [script, fps]);

  const currentStepIndex = useMemo(() => {
    const index = stepTimings.findIndex(t => frame >= t.start && frame < t.end);
    return index !== -1 ? index : script.length - 1;
  }, [frame, stepTimings, script.length]);

  const currentStep = script[currentStepIndex];
  const currentTiming = stepTimings[currentStepIndex];
  
  const framesInCurrentStep = frame - (currentTiming ? currentTiming.start : 0);
  
  // Type 3 characters per frame (90 chars per sec) so it finishes quickly and stays on screen
  const charsToReveal = Math.floor(framesInCurrentStep * 3);
  const codeString = currentStep?.code || '';
  const displayedCode = codeString.slice(0, charsToReveal);

  // Fallback to browser SpeechSynthesis if HuggingFace TTS failed
  useEffect(() => {
    if (!audioUrl && currentStep && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStep.text);
      
      if (voiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentStepIndex, audioUrl, currentStep, voiceURI]);

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
