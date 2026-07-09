'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Download, PlayCircle } from 'lucide-react';
import { IdeVideoPlayer, VIDEO_FPS, VIDEO_WIDTH, VIDEO_HEIGHT, ScriptItem } from './IdeVideoPlayer';

export function AIVideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState<{ script: ScriptItem[], audioUrl: string } | null>(null);
  const [recording, setRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoiceURI) {
          // Default to the first English voice if possible, or just the first one
          const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceURI]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    setVideoData(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai-video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      setVideoData({
        script: data.script,
        audioUrl: data.audioBase64
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate roughly how long the video is based on audio (assuming ~12 chars per second)
  const durationInFrames = videoData 
    ? Math.max(900, videoData.script.reduce((acc, step) => acc + Math.ceil(Math.max(4, step.text.length / 12) * VIDEO_FPS), 0))
    : 900;

  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as any,
        audio: true
      });
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-code-video.webm';
        a.click();
        URL.revokeObjectURL(url);
        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);

      if (playerRef.current) {
        playerRef.current.seekTo(0);
        playerRef.current.play();
      }

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          mediaRecorder.stop();
        }
      }, (durationInFrames / VIDEO_FPS) * 1000 + 1000);

    } catch (err) {
      console.error('Recording failed', err);
      setRecording(false);
    }
  };


  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.pause();
        }
      } else {
        playerRef.current.play();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Generate Code Explanation Video</h2>
        
        
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="e.g. Write a React component for a button"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          {voices.length > 0 && (
            <select 
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-48"
            >
              {voices.map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          )}
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            {loading ? 'Generating...' : 'Generate Video'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {videoData && (
        <div className="space-y-4">
          <div className="flex justify-end gap-3">
            <button 
              onClick={togglePlay}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              {isPlaying ? 'Pause Video' : 'Play Video'}
            </button>
            <button 
              onClick={handleRecord}
              disabled={recording}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white px-4 py-2 rounded-xl font-bold transition-all"
            >
              <Download className="w-4 h-4" />
              {recording ? 'Recording (Select this tab)...' : 'Record & Download Video'}
            </button>
          </div>
          
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-2xl overflow-hidden aspect-video relative">
            <Player
              ref={playerRef}
            component={IdeVideoPlayer}
            inputProps={{ script: videoData.script, audioUrl: videoData.audioUrl, voiceURI: selectedVoiceURI }}
            durationInFrames={durationInFrames}
            compositionWidth={VIDEO_WIDTH}
            compositionHeight={VIDEO_HEIGHT}
            fps={VIDEO_FPS}
            controls
            autoPlay
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        </div>
      )}
    </div>
  );
}
