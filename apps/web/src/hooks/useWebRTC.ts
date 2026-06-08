import { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';

class CallAudioEffects {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playOutgoingRing() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    const playTone = () => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.frequency.value = 400;
      osc2.frequency.value = 450;
      
      gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.2);
      osc2.stop(this.ctx.currentTime + 1.2);
    };

    playTone();
    this.intervalId = setInterval(playTone, 3000);
  }

  playIncomingRing() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    const playRing = () => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.frequency.value = 450;
      osc2.frequency.value = 490;

      gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.02, this.ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime + 0.6);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.8);
      osc2.stop(this.ctx.currentTime + 1.8);
    };

    playRing();
    this.intervalId = setInterval(playRing, 3500);
  }

  playAcceptBeep() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playEndBeep() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(160, this.ctx.currentTime + 0.35);

    gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playBusyTone() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    const playTone = () => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.frequency.value = 480;
      gainNode.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    };

    playTone();
    this.intervalId = setInterval(playTone, 500);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export type CallState = 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'busy' | 'declined' | 'no-answer' | 'call-ended';

export function useWebRTC(socket: Socket | null, currentUserId: string, currentUserName: string) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState<any>(null);
  
  const [callState, setCallStateInternal] = useState<CallState>('idle');
  const [peerMuted, setPeerMuted] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const callStateRef = useRef<CallState>('idle');
  const peerIdRef = useRef<string>('');
  const callTimeoutRef = useRef<any>(null);
  const audioEffects = useRef(new CallAudioEffects());

  const myAudio = useRef<HTMLAudioElement>(null);
  const userAudio = useRef<HTMLAudioElement>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);

  const setCallState = (state: CallState) => {
    callStateRef.current = state;
    setCallStateInternal(state);
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data: { from: string, name: string, signal: any }) => {
      if (callStateRef.current !== 'idle') {
        socket.emit('call_busy', { to: data.from });
        return;
      }
      setReceivingCall(true);
      setCaller(data.from);
      peerIdRef.current = data.from;
      setCallerName(data.name);
      setCallerSignal(data.signal);
      setCallState('ringing');
      audioEffects.current.playIncomingRing();

      socket.emit('ringing_user', { to: data.from });
    };

    const handleCallRinging = (data: { from: string }) => {
      if (peerIdRef.current === data.from && callStateRef.current === 'calling') {
        setCallState('ringing');
      }
    };

    const handleCallAccepted = async (data: { from: string, signal: any }) => {
      if (peerIdRef.current === data.from && (callStateRef.current === 'calling' || callStateRef.current === 'ringing')) {
        setCallState('connecting');
        audioEffects.current.stop();
        audioEffects.current.playAcceptBeep();
        if (connectionRef.current) {
          try {
            await connectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
          } catch (err) {
            console.error('Failed to set remote description on accept', err);
            leaveCall();
          }
        }
      }
    };

    const handleCallDeclined = (data: { from: string }) => {
      if (peerIdRef.current === data.from) {
        audioEffects.current.stop();
        audioEffects.current.playEndBeep();
        setCallState('declined');
        setTimeout(() => {
          resetCall();
        }, 2500);
      }
    };

    const handleCallEnded = (data: { from: string }) => {
      if (peerIdRef.current === data.from) {
        audioEffects.current.stop();
        audioEffects.current.playEndBeep();
        setCallState('call-ended');
        setTimeout(() => {
          resetCall();
        }, 2500);
      }
    };

    const handleCallBusyResponse = (data: { from: string }) => {
      if (peerIdRef.current === data.from) {
        audioEffects.current.stop();
        audioEffects.current.playBusyTone();
        setCallState('busy');
        setTimeout(() => {
          resetCall();
        }, 3000);
      }
    };

    const handlePeerMuteState = (data: { from: string, isMuted: boolean }) => {
      if (peerIdRef.current === data.from) {
        setPeerMuted(data.isMuted);
      }
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_ringing', handleCallRinging);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_declined', handleCallDeclined);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_busy_response', handleCallBusyResponse);
    socket.on('peer_mute_state', handlePeerMuteState);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_ringing', handleCallRinging);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_declined', handleCallDeclined);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_busy_response', handleCallBusyResponse);
      socket.off('peer_mute_state', handlePeerMuteState);
      audioEffects.current.stop();
    };
  }, [socket]);

  useEffect(() => {
    let timerId: any = null;
    if (callState === 'connected') {
      setCallDuration(0);
      timerId = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [callState]);

  const getMediaStream = async () => {
    if (stream) return stream;
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      setStream(currentStream);
      return currentStream;
    } catch (err) {
      console.error('Failed to get local stream', err);
      return null;
    }
  };

  const waitForIceGathering = (peer: RTCPeerConnection) => {
    return new Promise<void>((resolve) => {
      if (peer.iceGatheringState === 'complete') {
        resolve();
        return;
      }
      const checkState = () => {
        if (peer.iceGatheringState === 'complete') {
          peer.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };
      peer.addEventListener('icegatheringstatechange', checkState);
      
      setTimeout(() => {
        peer.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, 3000);
    });
  };

  const callUser = async (idToCall: string) => {
    if (callState !== 'idle') return;

    setLocalMuted(false);
    setPeerMuted(false);
    setCallDuration(0);
    setCaller(idToCall);
    peerIdRef.current = idToCall;
    setCallState('calling');
    audioEffects.current.playOutgoingRing();

    callTimeoutRef.current = setTimeout(() => {
      if (callStateRef.current === 'calling' || callStateRef.current === 'ringing') {
        socket?.emit('end_call', { to: peerIdRef.current });
        audioEffects.current.stop();
        audioEffects.current.playEndBeep();
        setCallState('no-answer');
        setTimeout(() => {
          resetCall();
        }, 3000);
      }
    }, 30000);

    const currentStream = await getMediaStream();
    if (!currentStream) {
      setCallState('idle');
      audioEffects.current.stop();
      return;
    }

    try {
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      });
      connectionRef.current = peer;

      currentStream.getTracks().forEach((track) => {
        peer.addTrack(track, currentStream);
      });

      peer.ontrack = (event) => {
        if (userAudio.current) {
          userAudio.current.srcObject = event.streams[0];
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'connected') {
          if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
          }
          setCallState('connected');
          audioEffects.current.stop();
          audioEffects.current.playAcceptBeep();
        } else if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
          setCallState('connecting');
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      await waitForIceGathering(peer);

      if (callStateRef.current === 'calling' || callStateRef.current === 'ringing') {
        socket?.emit('call_user', {
          userToCall: idToCall,
          signalData: peer.localDescription,
          from: currentUserId,
          name: currentUserName
        });
      }
    } catch (err) {
      console.error('Failed to create WebRTC offer', err);
      resetCall();
    }
  };

  const answerCall = async () => {
    if (callStateRef.current !== 'ringing') return;

    setCallState('connecting');
    audioEffects.current.stop();
    audioEffects.current.playAcceptBeep();

    const currentStream = await getMediaStream();
    if (!currentStream) {
      socket?.emit('decline_call', { to: caller });
      resetCall();
      return;
    }

    try {
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      });
      connectionRef.current = peer;

      currentStream.getTracks().forEach((track) => {
        peer.addTrack(track, currentStream);
      });

      peer.ontrack = (event) => {
        if (userAudio.current) {
          userAudio.current.srcObject = event.streams[0];
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'connected') {
          setCallState('connected');
        } else if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
          setCallState('connecting');
        }
      };

      if (callerSignal) {
        await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        await waitForIceGathering(peer);

        socket?.emit('answer_call', { signal: peer.localDescription, to: caller });
      }
    } catch (err) {
      console.error('Failed to answer call', err);
      resetCall();
    }
  };

  const declineCall = () => {
    if (socket && caller) {
      socket.emit('decline_call', { to: caller });
    }
    audioEffects.current.stop();
    audioEffects.current.playEndBeep();
    resetCall();
  };

  const leaveCall = () => {
    if (callStateRef.current === 'ringing' && receivingCall) {
      declineCall();
      return;
    }

    if (socket && peerIdRef.current) {
      socket.emit('end_call', { to: peerIdRef.current });
    }
    audioEffects.current.stop();
    audioEffects.current.playEndBeep();
    setCallState('call-ended');
    setTimeout(() => {
      resetCall();
    }, 2000);
  };

  const toggleMute = () => {
    const newMute = !localMuted;
    setLocalMuted(newMute);
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !newMute;
      });
    }
    if (socket && peerIdRef.current) {
      socket.emit('mute_state', { to: peerIdRef.current, isMuted: newMute });
    }
  };

  const resetCall = () => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setReceivingCall(false);
    setCaller('');
    setCallerName('');
    setCallerSignal(null);
    setLocalMuted(false);
    setPeerMuted(false);
    setCallDuration(0);
    peerIdRef.current = '';
    setCallState('idle');
  };

  const callAccepted = callState === 'connected';
  const callEnded = callState === 'call-ended' || callState === 'idle';

  return {
    stream,
    receivingCall,
    caller,
    callerName,
    callAccepted,
    callEnded,
    callState,
    peerMuted,
    localMuted,
    callDuration,
    myAudio,
    userAudio,
    callUser,
    answerCall,
    declineCall,
    leaveCall,
    toggleMute
  };
}
