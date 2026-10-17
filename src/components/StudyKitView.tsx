import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Square, 
  FileText, 
  Download, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Globe,
  Award
} from 'lucide-react';
import { StudyKitResponse, VocabularyEntry, ExamQuestion } from '../types/studyKit';

interface StudyKitViewProps {
  studyKit: StudyKitResponse;
  isFocusMode: boolean;
  onExploreModule?: (tab: string) => void;
}

export const StudyKitView: React.FC<StudyKitViewProps> = ({
  studyKit,
  isFocusMode,
  onExploreModule,
}) => {
  // Speech synthesis state for Roman Urdu
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [voiceNote, setVoiceNote] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Copy states
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Expandable question answers
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({
    0: true, // first question expanded by default
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Look for preferred phonetic voices for Roman Urdu:
      // Hindi or Urdu voices (hi-IN, ur-PK, ur-IN) pronounce Latin Roman Urdu phonetics very authentically.
      // Otherwise, pick natural English voice.
      const preferred = voices.find(v => v.lang.startsWith('hi') || v.lang.startsWith('ur')) ||
        voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.startsWith('en')) ||
        voices[0];

      if (preferred) {
        setSelectedVoiceName(preferred.name);
        if (preferred.lang.startsWith('hi') || preferred.lang.startsWith('ur')) {
          setVoiceNote(`Using ${preferred.name} (${preferred.lang}) for authentic subcontinental Roman Urdu phonetics.`);
        } else {
          setVoiceNote(`Using ${preferred.name} (${preferred.lang}) Latin phonetic engine.`);
        }
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop speech when summary changes or component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [studyKit.romanUrduSummary]);

  // Handle Speech Controls
  const handlePlayRomanUrdu = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechError('Text-to-speech is not supported in this browser.');
      return;
    }

    setSpeechError(null);

    // If currently paused, resume
    if (isPaused && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Stop any existing playback
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(studyKit.romanUrduSummary);
    utterance.rate = speechRate;

    // Attach selected voice
    if (selectedVoiceName && availableVoices.length > 0) {
      const v = availableVoices.find(voice => voice.name === selectedVoiceName);
      if (v) utterance.voice = v;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        setSpeechError(`Speech synthesis encountered: ${e.error}`);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePauseSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleReplaySpeech = () => {
    handleStopSpeech();
    setTimeout(() => {
      handlePlayRomanUrdu();
    }, 100);
  };

  const handleSpeedChange = (speed: number) => {
    setSpeechRate(speed);
    if (isPlaying) {
      handleStopSpeech();
      setTimeout(() => {
        handlePlayRomanUrdu();
      }, 100);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Copy complete study kit
  const handleCopyCompleteKit = () => {
    let content = `# Study Kit: ${studyKit.paperTitle}\n`;
    content += `Generated by Paper to Prep on ${new Date(studyKit.generatedAt).toLocaleDateString()}\n\n`;
    content += `==================================================\n`;
    content += `1. EXACT 50-WORD ENGLISH SUMMARY (${studyKit.wordCount} words):\n`;
    content += `==================================================\n`;
    content += `${studyKit.englishSummary}\n\n`;
    content += `==================================================\n`;
    content += `2. NATURAL ROMAN URDU TRANSLATION:\n`;
    content += `==================================================\n`;
    content += `${studyKit.romanUrduSummary}\n\n`;
    content += `==================================================\n`;
    content += `3. 10 DIFFICULT ACADEMIC WORDS & MEANINGS:\n`;
    content += `==================================================\n`;
    studyKit.vocabulary.forEach((v, idx) => {
      content += `${idx + 1}. ${v.word}\n`;
      content += `   Roman Urdu: ${v.romanUrduMeaning}\n`;
      content += `   Context: ${v.contextualExplanation}\n`;
      if (v.sourceContext) content += `   Source Context: "${v.sourceContext}"\n`;
      content += `\n`;
    });
    content += `==================================================\n`;
    content += `4. 5 EXAMINATION PRACTICE QUESTIONS & ANSWERS:\n`;
    content += `==================================================\n`;
    studyKit.questions.forEach((q, idx) => {
      content += `Q${idx + 1} (${q.type}): ${q.question}\n`;
      content += `Ans: ${q.answer}\n\n`;
    });

    if (studyKit.limitations.length > 0) {
      content += `==================================================\n`;
      content += `LIMITATIONS & CRITIQUE:\n`;
      content += `==================================================\n`;
      studyKit.limitations.forEach(l => {
        content += `- ${l}\n`;
      });
    }

    copyToClipboard(content, 'complete-kit');
  };

  // Download TXT
  const handleDownloadTxt = () => {
    let content = `STUDY KIT: ${studyKit.paperTitle}\n`;
    content += `Generated by Paper to Prep | ${studyKit.sourceType === 'pdf' ? `Source PDF: ${studyKit.fileName}` : 'Source: Pasted Text'}\n\n`;
    content += `--------------------------------------------------\n`;
    content += `1. 50-WORD ENGLISH SUMMARY (${studyKit.wordCount} words)\n`;
    content += `--------------------------------------------------\n`;
    content += `${studyKit.englishSummary}\n\n`;
    content += `--------------------------------------------------\n`;
    content += `2. ROMAN URDU TRANSLATION\n`;
    content += `--------------------------------------------------\n`;
    content += `${studyKit.romanUrduSummary}\n\n`;
    content += `--------------------------------------------------\n`;
    content += `3. 10 DIFFICULT WORDS & ROMAN URDU MEANINGS\n`;
    content += `--------------------------------------------------\n`;
    studyKit.vocabulary.forEach((v, i) => {
      content += `${i + 1}. ${v.word.toUpperCase()}\n`;
      content += `   Roman Urdu: ${v.romanUrduMeaning}\n`;
      content += `   Explanation: ${v.contextualExplanation}\n`;
      if (v.sourceContext) content += `   Quote: "${v.sourceContext}"\n`;
      content += `\n`;
    });
    content += `--------------------------------------------------\n`;
    content += `4. 5 EXAM PRACTICE QUESTIONS & ANSWERS\n`;
    content += `--------------------------------------------------\n`;
    studyKit.questions.forEach((q, i) => {
      content += `Question ${i + 1} [${q.type}]:\n${q.question}\n\n`;
      content += `Answer:\n${q.answer}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studyKit.paperTitle.slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-study-kit.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className={`space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden ${isFocusMode ? 'max-w-[68ch] mx-auto' : 'max-w-4xl'}`}>
      
      {/* Top Banner: Action Bar & Document Badge */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs max-w-full overflow-hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#F0EEFF] text-[#6259E8] flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[13px] sm:text-[14px] font-bold text-[#172033] truncate max-w-[180px] xs:max-w-xs sm:max-w-md">
                {studyKit.paperTitle}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#F0EEFF] text-[#6259E8] shrink-0">
                {studyKit.sourceType === 'pdf' ? 'PDF Verified' : 'Text Analyzed'}
              </span>
            </div>
            <p className="text-[11px] sm:text-[12px] text-[#687386] truncate">
              All 4 required resources generated together in one coordinated workflow
            </p>
          </div>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyCompleteKit}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#172033] bg-[#F8F9FC] border border-[#E7EAF0] rounded-md hover:bg-white transition-colors"
          >
            {copiedSection === 'complete-kit' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#198754]" />
                <span className="text-[#198754] font-semibold">Copied Kit</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#687386]" />
                <span>Copy All</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-[#6259E8] hover:bg-[#5147D8] rounded-md transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .TXT</span>
          </button>
        </div>
      </div>

      {/* RESOURCE 1: Exactly 50-Word English Summary */}
      <section className="bg-white rounded-xl border border-[#E7EAF0] p-4 sm:p-6 shadow-xs space-y-3 max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EAF0]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-md bg-[#6259E8] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
              1
            </span>
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#172033] truncate">
              Beginner-Friendly English Summary
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Word count badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              studyKit.wordCount === 50 
                ? 'bg-[#198754]/10 text-[#198754] border border-[#198754]/25' 
                : 'bg-[#F0EEFF] text-[#6259E8]'
            }`}>
              <Check className="w-3 h-3" />
              <span>Exact {studyKit.wordCount} words</span>
            </span>

            <button
              onClick={() => copyToClipboard(studyKit.englishSummary, 'en-summary')}
              className="p-1.5 text-[#687386] hover:text-[#6259E8] rounded-md hover:bg-[#F8F9FC] transition-colors"
              title="Copy English summary"
            >
              {copiedSection === 'en-summary' ? <Check className="w-4 h-4 text-[#198754]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-[14px] sm:text-[16px] leading-[26px] sm:leading-[28px] text-[#172033] font-medium break-words">
          {studyKit.englishSummary}
        </p>
      </section>

      {/* RESOURCE 2: Natural Roman Urdu Translation & Real Voice Audio */}
      <section className="bg-white rounded-xl border border-[#E7EAF0] p-4 sm:p-6 shadow-xs space-y-4 max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EAF0]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-md bg-[#6259E8] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
              2
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#172033] truncate">
                Natural Roman Urdu Translation & Speech
              </h3>
              <p className="text-[11px] text-[#687386] truncate">
                Latin alphabet Urdu with native Web Speech synthesis playback
              </p>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(studyKit.romanUrduSummary, 'ur-summary')}
            className="p-1.5 text-[#687386] hover:text-[#6259E8] rounded-md hover:bg-[#F8F9FC] transition-colors shrink-0"
            title="Copy Roman Urdu translation"
          >
            {copiedSection === 'ur-summary' ? <Check className="w-4 h-4 text-[#198754]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Roman Urdu Content Box */}
        <div className="p-3.5 sm:p-4 bg-[#F8F9FC] rounded-lg border border-[#E7EAF0] max-w-full overflow-hidden">
          <p className="text-[14px] sm:text-[16px] leading-[26px] sm:leading-[28px] text-[#172033] italic break-words">
            "{studyKit.romanUrduSummary}"
          </p>
        </div>

        {/* Dedicated Roman Urdu TTS Audio Controller Bar */}
        <div className="p-3 sm:p-3.5 bg-[#F0EEFF]/80 rounded-xl border border-[#6259E8]/20 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 max-w-full overflow-hidden">
          
          {/* Play / Pause / Replay / Stop buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {!isPlaying ? (
              <button
                onClick={handlePlayRomanUrdu}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#6259E8] hover:bg-[#5147D8] text-white text-[11px] sm:text-[12px] font-semibold transition-all shadow-xs active:scale-95 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                <span>{isPaused ? 'Resume Voice' : 'Listen Roman Urdu'}</span>
              </button>
            ) : (
              <button
                onClick={handlePauseSpeech}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#172033] hover:bg-[#273044] text-white text-[11px] sm:text-[12px] font-semibold transition-all shadow-xs shrink-0"
              >
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStopSpeech}
              title="Stop playback"
              disabled={!isPlaying && !isPaused}
              className="p-2 rounded-md border border-[#E7EAF0] bg-white text-[#687386] hover:text-[#172033] disabled:opacity-40 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReplaySpeech}
              title="Replay from start"
              className="p-2 rounded-md border border-[#E7EAF0] bg-white text-[#687386] hover:text-[#172033] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Active speaking indicator */}
            {isPlaying && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#6259E8] animate-pulse ml-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Speaking...</span>
              </span>
            )}
          </div>

          {/* Speed & Voice selection */}
          <div className="flex items-center gap-2">
            {/* Speed pills */}
            <div className="flex items-center bg-white rounded-md border border-[#E7EAF0] p-0.5 text-[11px] font-semibold">
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    speechRate === speed
                      ? 'bg-[#6259E8] text-white shadow-xs'
                      : 'text-[#687386] hover:text-[#172033]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Voice Dropdown */}
            {availableVoices.length > 0 && (
              <select
                value={selectedVoiceName}
                onChange={(e) => {
                  setSelectedVoiceName(e.target.value);
                  if (isPlaying) handleReplaySpeech();
                }}
                className="text-[11px] font-medium text-[#172033] bg-white border border-[#E7EAF0] rounded-md px-2 py-1 max-w-[140px] truncate focus:outline-none"
              >
                {availableVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            )}
          </div>

        </div>

        {voiceNote && (
          <p className="text-[11px] text-[#687386] flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#6259E8]" />
            <span>{voiceNote}</span>
          </p>
        )}

        {speechError && (
          <div className="p-2.5 bg-[#FFDAD6]/50 border border-[#ba1a1a]/20 rounded-md text-[12px] text-[#ba1a1a] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{speechError}</span>
          </div>
        )}
      </section>

      {/* RESOURCE 3: Exactly 10 Difficult Words Dictionary */}
      <section className="bg-white rounded-xl border border-[#E7EAF0] p-4 sm:p-6 shadow-xs space-y-4 max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EAF0]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-md bg-[#6259E8] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
              3
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#172033] truncate">
                10 Difficult Words & Roman Urdu Meanings
              </h3>
              <p className="text-[11px] text-[#687386] truncate">
                Extracted directly from the submitted document with paper context
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0EEFF] text-[#6259E8] shrink-0">
            {studyKit.vocabulary.length} Vocabulary Items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-full">
          {studyKit.vocabulary.map((item, idx) => (
            <div 
              key={idx}
              className="p-3.5 bg-[#F8F9FC] border border-[#E7EAF0] rounded-xl hover:border-[#D6DAE1] transition-all space-y-2 group min-w-0 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[#E0DEEF] text-[#493DCE] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-[14px] font-bold text-[#172033] truncate">
                    {item.word}
                  </h4>
                </div>

                <button
                  onClick={() => copyToClipboard(`${item.word}: ${item.romanUrduMeaning} — ${item.contextualExplanation}`, `word-${idx}`)}
                  className="sm:opacity-0 group-hover:opacity-100 p-1 text-[#687386] hover:text-[#6259E8] transition-opacity shrink-0"
                  title="Copy vocabulary item"
                >
                  {copiedSection === `word-${idx}` ? <Check className="w-3.5 h-3.5 text-[#198754]" /> : <Copy className="w-3.5 h-3.5 text-[#687386]" />}
                </button>
              </div>

              {/* Roman Urdu Meaning */}
              <div className="text-[13px] font-semibold text-[#6259E8] break-words">
                Roman Urdu: <span className="font-medium text-[#172033]">{item.romanUrduMeaning}</span>
              </div>

              {/* Contextual Explanation in Paper */}
              <p className="text-[12px] leading-relaxed text-[#464554] break-words">
                {item.contextualExplanation}
              </p>

              {/* Source Context quote */}
              {item.sourceContext && (
                <div className="text-[11px] font-mono text-[#687386] bg-white p-2 rounded border border-[#E7EAF0] italic break-words">
                  "{item.sourceContext}"
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* RESOURCE 4: Exactly 5 Examination Practice Questions */}
      <section className="bg-white rounded-xl border border-[#E7EAF0] p-4 sm:p-6 shadow-xs space-y-4 max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EAF0]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-md bg-[#6259E8] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
              4
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#172033] truncate">
                5 Examination Practice Questions & Answers
              </h3>
              <p className="text-[11px] text-[#687386] truncate">
                Grounded in the research paper's methodology and findings
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0EEFF] text-[#6259E8] shrink-0">
            {studyKit.questions.length} Practice Questions
          </span>
        </div>

        <div className="space-y-3 max-w-full">
          {studyKit.questions.map((q, idx) => {
            const isExpanded = Boolean(expandedQuestions[idx]);
            return (
              <div 
                key={idx}
                className="border border-[#E7EAF0] rounded-xl overflow-hidden transition-all bg-[#F8F9FC]/60 max-w-full"
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full text-left p-3.5 sm:p-4 bg-white hover:bg-[#F8F9FC] flex items-start justify-between gap-2.5 sm:gap-3 transition-colors"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-full bg-[#F0EEFF] text-[#6259E8] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block px-2 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#E0DEEF] text-[#493DCE] mb-1">
                        {q.type}
                      </span>
                      <h4 className="text-[13px] sm:text-[15px] font-semibold text-[#172033] leading-snug break-words">
                        {q.question}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(`Q: ${q.question}\nA: ${q.answer}`, `q-${idx}`);
                      }}
                      className="p-1 text-[#687386] hover:text-[#6259E8] transition-colors"
                      title="Copy Q&A"
                    >
                      {copiedSection === `q-${idx}` ? <Check className="w-3.5 h-3.5 text-[#198754]" /> : <Copy className="w-3.5 h-3.5 text-[#687386]" />}
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#687386]" /> : <ChevronDown className="w-4 h-4 text-[#687386]" />}
                  </div>
                </button>

                {/* Expanded Answer */}
                {isExpanded && (
                  <div className="p-3.5 sm:p-4 bg-[#F8F9FC] border-t border-[#E7EAF0] space-y-1.5 animate-in fade-in duration-150 max-w-full overflow-hidden">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#198754] block">
                      Grounded Answer:
                    </span>
                    <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#172033] break-words">
                      {q.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Limitations note if present */}
      {studyKit.limitations && studyKit.limitations.length > 0 && (
        <section className="bg-white rounded-xl border border-[#E7EAF0] p-4 text-[12px] text-[#687386] space-y-1.5">
          <div className="font-semibold text-[#172033] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#6259E8]" />
            <span>Document & Evidence Scope:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            {studyKit.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
};
