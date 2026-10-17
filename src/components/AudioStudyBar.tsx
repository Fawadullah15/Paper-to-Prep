import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown, 
  Headphones, 
  Sparkles,
  ListMusic,
  Check
} from 'lucide-react';
import { AudioBriefing } from '../types';

interface AudioStudyBarProps {
  audio: AudioBriefing;
  paperTitle: string;
}

export const AudioStudyBar: React.FC<AudioStudyBarProps> = ({ audio, paperTitle }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showChapters, setShowChapters] = useState<boolean>(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [activeSpeechUtterance, setActiveSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Approximate seconds duration based on script length or audio.duration string
  const totalSeconds = 480; // 8 minutes default
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Setup Web Speech API for genuine audible academic narration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setProgress(0);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audio.audioScript]);

  const startSpeech = (startProgress: number = 0) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Select text slice based on progress
    const fullText = audio.audioScript;
    const startIndex = Math.floor((startProgress / 100) * fullText.length);
    const textToSpeak = fullText.slice(startIndex);

    if (!textToSpeak.trim()) {
      setProgress(100);
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackRate;
    utterance.volume = isMuted ? 0 : 1;

    // Pick an expressive natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')) || voices[0];
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    utteranceRef.current = utterance;
    setActiveSpeechUtterance(utterance);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);

    // Simulation ticker for progress bar
    if (timerRef.current) clearInterval(timerRef.current);
    const intervalMs = 250;
    const increment = (intervalMs / (totalSeconds * 1000)) * 100 * playbackRate;

    timerRef.current = window.setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          return 100;
        }
        return next;
      });
    }, intervalMs);
  };

  const togglePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        const intervalMs = 250;
        const increment = (intervalMs / (totalSeconds * 1000)) * 100 * playbackRate;
        timerRef.current = window.setInterval(() => {
          setProgress(prev => {
            const next = prev + increment;
            if (next >= 100) {
              clearInterval(timerRef.current!);
              setIsPlaying(false);
              return 100;
            }
            return next;
          });
        }, intervalMs);
      } else {
        startSpeech(progress >= 100 ? 0 : progress);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    setProgress(newProgress);
    if (isPlaying) {
      startSpeech(newProgress);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (isPlaying) {
      startSpeech(progress);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (isPlaying) {
      startSpeech(progress);
    }
  };

  // Jump to chapter
  const jumpToChapter = (index: number) => {
    setCurrentChapterIndex(index);
    const chapterProgress = (index / audio.chapters.length) * 100;
    setProgress(chapterProgress);
    setShowChapters(false);
    startSpeech(chapterProgress);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-auto lg:right-8 lg:w-[680px] z-50 transition-all">
      <div className="relative bg-[#F0EEFF]/95 backdrop-blur-[12px] border border-[#6259E8]/20 rounded-[14px] p-3.5 shadow-lg shadow-[#172033]/08 transition-all">
        
        {/* Top Header Row of Audio Bar */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#6259E8]/15 flex items-center justify-center text-[#6259E8] shrink-0">
              <Headphones className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#6259E8]">
                  Audio Briefing
                </span>
                <span className="text-[11px] text-[#687386] truncate">
                  · {audio.speaker}
                </span>
              </div>
              <h4 className="text-[13px] font-semibold text-[#172033] truncate">
                {audio.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Chapters Drawer Toggle */}
            <button
              onClick={() => setShowChapters(!showChapters)}
              title="View Chapters"
              className={`p-1.5 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                showChapters 
                  ? 'bg-[#6259E8] text-white' 
                  : 'text-[#687386] hover:text-[#172033] hover:bg-white/60'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chapters</span>
            </button>

            {/* Expand / Minimize Script Drawer */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse Script" : "Read Audio Transcript"}
              className="p-1.5 rounded-md text-[#687386] hover:text-[#172033] hover:bg-white/60 transition-all"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Chapters Dropdown Popup */}
        {showChapters && (
          <div className="mb-3 p-2 bg-white rounded-lg border border-[#E7EAF0] shadow-md max-h-48 overflow-y-auto space-y-1">
            <div className="text-[11px] font-semibold text-[#687386] uppercase tracking-wider px-2 py-1">
              Briefing Chapters
            </div>
            {audio.chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => jumpToChapter(idx)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-[12px] flex items-center justify-between transition-all ${
                  currentChapterIndex === idx 
                    ? 'bg-[#F0EEFF] text-[#6259E8] font-medium' 
                    : 'text-[#172033] hover:bg-[#F8F9FC]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[11px] font-mono text-[#687386]">{ch.time}</span>
                  <span className="truncate">{ch.title}</span>
                </div>
                {currentChapterIndex === idx && <Check className="w-3.5 h-3.5 text-[#6259E8] shrink-0" />}
              </button>
            ))}
          </div>
        )}

        {/* Expanded Transcript Box */}
        {isExpanded && (
          <div className="mb-3 p-3 bg-white/90 rounded-lg border border-[#E7EAF0] text-[13px] leading-relaxed text-[#172033] max-h-40 overflow-y-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6259E8] mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Full Script & Takeaways</span>
            </div>
            <p className="font-normal text-[#464554]">
              {audio.audioScript}
            </p>
          </div>
        )}

        {/* Progress Scrubber Track (4px height with #6259E8 fill) */}
        <div 
          onClick={handleSeek}
          className="relative w-full h-[6px] bg-[#E0DEEF] rounded-full cursor-pointer group py-1 -my-1"
        >
          <div 
            className="h-[4px] bg-[#6259E8] rounded-full transition-all relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#6259E8] rounded-full opacity-0 group-hover:opacity-100 shadow-sm transition-opacity" />
          </div>
        </div>

        {/* Bottom Playback Bar Controls */}
        <div className="flex items-center justify-between mt-2.5">
          
          {/* Time Code [04:12 / 08:00] */}
          <div className="text-[11px] font-mono text-[#687386] tracking-tight">
            <span>{formatTime(currentSeconds)}</span>
            <span className="mx-1">/</span>
            <span>{audio.duration || formatTime(totalSeconds)}</span>
          </div>

          {/* Central Controls: Rewind, Play/Pause 36px, Fast Forward */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newP = Math.max(0, progress - 5);
                setProgress(newP);
                if (isPlaying) startSpeech(newP);
              }}
              title="Rewind 15 seconds"
              className="p-1.5 rounded-full text-[#687386] hover:text-[#172033] hover:bg-white/60 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Circular 36px Play/Pause in #6259E8 */}
            <button
              onClick={togglePlay}
              title={isPlaying ? "Pause Briefing" : "Play Briefing (Audible Web Speech Narration)"}
              className="w-9 h-9 rounded-full bg-[#6259E8] hover:bg-[#5147D8] text-white flex items-center justify-center shadow-sm shadow-[#6259E8]/30 transition-transform active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                const newP = Math.min(100, progress + 5);
                setProgress(newP);
                if (isPlaying) startSpeech(newP);
              }}
              title="Forward 15 seconds"
              className="p-1.5 rounded-full text-[#687386] hover:text-[#172033] hover:bg-white/60 transition-all"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed & Volume Toggles */}
          <div className="flex items-center gap-2">
            
            {/* Speed Pills: 1.0x, 1.25x, 1.5x, 2.0x */}
            <div className="flex items-center bg-white/70 rounded-md border border-[#E7EAF0] p-0.5 text-[11px] font-semibold">
              {[1.0, 1.25, 1.5, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-1.5 py-0.5 rounded-[4px] transition-all ${
                    playbackRate === speed
                      ? 'bg-[#6259E8] text-white shadow-xs'
                      : 'text-[#687386] hover:text-[#172033]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Mute button */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-md text-[#687386] hover:text-[#172033] hover:bg-white/60 transition-all"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#ba1a1a]" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
