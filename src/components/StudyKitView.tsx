import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  Square, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Globe, 
  RefreshCw
} from 'lucide-react';
import { StudyKitResponse } from '../types/studyKit';

interface StudyKitViewProps {
  studyKit: StudyKitResponse;
  isFocusMode: boolean;
  onExploreModule?: (tab: string) => void;
  onStartNewPaper?: () => void;
}

export const StudyKitView: React.FC<StudyKitViewProps> = ({
  studyKit,
  isFocusMode,
  onExploreModule,
  onStartNewPaper,
}) => {
  // Speech synthesis state for Roman Urdu
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [voiceNote, setVoiceNote] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Copy feedback state
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Expandable question answers
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({
    0: true, // first question expanded by default
  });

  // Source quote expansion for vocabulary items
  const [expandedQuotes, setExpandedQuotes] = useState<Record<number, boolean>>({});

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load and filter browser speech voices — STRICTLY exclude any Hindi text, Hindi voices, or Devanagari script
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const rawVoices = window.speechSynthesis.getVoices();

      // Exclude any voice with Hindi language tag (hi, hi-IN), Hindi name, or Devanagari characters
      const cleanVoices = rawVoices.filter(v => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        const isHindiLang = lang.startsWith('hi');
        const isHindiName = name.includes('hindi') || name.includes('hindi');
        const hasDevanagari = /[\u0900-\u097F]/.test(v.name);
        return !isHindiLang && !isHindiName && !hasDevanagari;
      });

      setAvailableVoices(cleanVoices);

      // Prioritize authentic Urdu voices (ur, ur-PK, ur-IN) or clear natural English/Latin speech engines
      const preferred = cleanVoices.find(v => v.lang.toLowerCase().startsWith('ur')) ||
        cleanVoices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen')) && v.lang.startsWith('en')) ||
        cleanVoices.find(v => v.lang.startsWith('en')) ||
        cleanVoices[0];

      if (preferred) {
        setSelectedVoiceName(preferred.name);
        const displayName = preferred.name.replace(/[\u0900-\u097F]/g, '').trim();
        if (preferred.lang.toLowerCase().startsWith('ur')) {
          setVoiceNote(`Urdu voice engine active: ${displayName} (${preferred.lang})`);
        } else {
          setVoiceNote(`Speech engine active: ${displayName} (${preferred.lang})`);
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
      console.warn('SpeechSynthesis event:', e);
      setIsPlaying(false);
      setIsPaused(false);
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        setSpeechError(`Audio playback notice: ${e.error}`);
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
    content += `--------------------------------------------------\n`;
    content += `1. ENGLISH SUMMARY (${studyKit.wordCount} words):\n`;
    content += `--------------------------------------------------\n`;
    content += `${studyKit.englishSummary}\n\n`;
    content += `--------------------------------------------------\n`;
    content += `2. ROMAN URDU TRANSLATION:\n`;
    content += `--------------------------------------------------\n`;
    content += `${studyKit.romanUrduSummary}\n\n`;
    content += `--------------------------------------------------\n`;
    content += `3. 10 DIFFICULT WORDS & ROMAN URDU MEANINGS:\n`;
    content += `--------------------------------------------------\n`;
    studyKit.vocabulary.forEach((v, idx) => {
      content += `${idx + 1}. ${v.word}\n`;
      content += `   Roman Urdu: ${v.romanUrduMeaning}\n`;
      content += `   Context: ${v.contextualExplanation}\n`;
      if (v.sourceContext) content += `   Quote: "${v.sourceContext}"\n`;
      content += `\n`;
    });
    content += `--------------------------------------------------\n`;
    content += `4. 5 PRACTICE QUESTIONS & ANSWERS:\n`;
    content += `--------------------------------------------------\n`;
    studyKit.questions.forEach((q, idx) => {
      content += `Q${idx + 1} (${q.type}): ${q.question}\n`;
      content += `Ans: ${q.answer}\n\n`;
    });

    if (studyKit.limitations && studyKit.limitations.length > 0) {
      content += `--------------------------------------------------\n`;
      content += `LIMITATIONS:\n`;
      content += `--------------------------------------------------\n`;
      studyKit.limitations.forEach(l => {
        content += `- ${l}\n`;
      });
    }

    copyToClipboard(content, 'complete-kit');
  };

  // Download plain text (.TXT)
  const handleDownloadTxt = () => {
    let content = `STUDY KIT: ${studyKit.paperTitle}\n`;
    content += `Paper to Prep | ${studyKit.sourceType === 'pdf' ? `Source: ${studyKit.fileName}` : 'Source: Manuscript Text'}\n\n`;
    content += `1. ENGLISH SUMMARY (${studyKit.wordCount} words)\n`;
    content += `${studyKit.englishSummary}\n\n`;
    content += `2. ROMAN URDU TRANSLATION\n`;
    content += `${studyKit.romanUrduSummary}\n\n`;
    content += `3. 10 DIFFICULT WORDS & ROMAN URDU MEANINGS\n`;
    studyKit.vocabulary.forEach((v, i) => {
      content += `${i + 1}. ${v.word}\n`;
      content += `   Meaning: ${v.romanUrduMeaning}\n`;
      content += `   Explanation: ${v.contextualExplanation}\n\n`;
    });
    content += `4. 5 PRACTICE QUESTIONS & ANSWERS\n`;
    studyKit.questions.forEach((q, i) => {
      content += `Q${i + 1} (${q.type}): ${q.question}\n`;
      content += `A: ${q.answer}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studyKit.paperTitle.slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-study-kit.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Markdown (.MD)
  const handleDownloadMarkdown = () => {
    let content = `# Study Guide: ${studyKit.paperTitle}\n\n`;
    content += `*Generated with [Paper to Prep](https://paper-to-prep.ai.studio/) on ${new Date(studyKit.generatedAt).toLocaleDateString()}*\n\n`;
    content += `## 1. English Summary\n\n> ${studyKit.englishSummary}\n\n`;
    content += `*Word Count: ${studyKit.wordCount} words*\n\n`;
    content += `## 2. Roman Urdu Translation\n\n> ${studyKit.romanUrduSummary}\n\n`;
    content += `## 3. Vocabulary & Academic Concepts\n\n`;
    content += `| Word | Roman Urdu Meaning | Contextual Explanation |\n`;
    content += `| :--- | :--- | :--- |\n`;
    studyKit.vocabulary.forEach(v => {
      content += `| **${v.word}** | *${v.romanUrduMeaning}* | ${v.contextualExplanation} |\n`;
    });
    content += `\n## 4. Practice Examination Questions\n\n`;
    studyKit.questions.forEach((q, i) => {
      content += `### Question ${i + 1} (${q.type})\n**${q.question}**\n\n${q.answer}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studyKit.paperTitle.slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-guide.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleAllQuestions = (expand: boolean) => {
    const updated: Record<number, boolean> = {};
    studyKit.questions.forEach((_, idx) => {
      updated[idx] = expand;
    });
    setExpandedQuestions(updated);
  };

  const scrollToSection = (sectionId: string) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const areAllQuestionsExpanded = studyKit.questions.every((_, idx) => expandedQuestions[idx]);

  return (
    <div className={`space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden ${isFocusMode ? 'max-w-[68ch] mx-auto' : 'max-w-4xl'}`}>
      
      {/* MINIMAL EDITORIAL HEADER */}
      <header className="bg-white rounded-xl border border-[#E8E8E2] p-5 sm:p-7 shadow-xs max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="text-[12px] font-medium tracking-wide text-[#5548E0] block mb-1">
              Study Kit Prepared
            </span>
            <h1 className="text-[20px] sm:text-[23px] font-semibold text-[#191D24] tracking-tight leading-snug break-words">
              {studyKit.paperTitle}
            </h1>
            
            {/* Unboxed calm metadata */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[#68707D] mt-2">
              <span className="text-[#237A52] font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>4 study modules ready</span>
              </span>
              <span aria-hidden="true" className="text-[#E8E8E2]">·</span>
              <span>{studyKit.sourceType === 'pdf' ? 'PDF Document' : 'Manuscript Text'}</span>
              <span aria-hidden="true" className="text-[#E8E8E2]">·</span>
              <span>{studyKit.wordCount} words summary</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onStartNewPaper && (
              <button
                type="button"
                onClick={onStartNewPaper}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#68707D] hover:text-[#191D24] bg-white border border-[#E8E8E2] rounded-md hover:bg-[#F2F2ED] transition-colors"
                title="Input another paper"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Paper</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyCompleteKit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium text-[#191D24] bg-white border border-[#E8E8E2] rounded-md hover:bg-[#F2F2ED] transition-colors"
            >
              {copiedSection === 'complete-kit' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#237A52]" />
                  <span className="text-[#237A52] font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#68707D]" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Minimal Navigation Track */}
        <nav aria-label="Study kit sections" className="flex items-center gap-1 pt-4 mt-5 border-t border-[#E8E8E2] overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => scrollToSection('section-summary')}
            className="px-2.5 py-1 rounded text-[12px] font-medium text-[#68707D] hover:text-[#191D24] hover:bg-[#F2F2ED] transition-colors whitespace-nowrap shrink-0"
          >
            1. Summary
          </button>
          <span className="text-[#E8E8E2]">·</span>
          <button
            type="button"
            onClick={() => scrollToSection('section-roman-urdu')}
            className="px-2.5 py-1 rounded text-[12px] font-medium text-[#5548E0] hover:bg-[#EEEDFC] transition-colors whitespace-nowrap shrink-0"
          >
            2. Roman Urdu Audio
          </button>
          <span className="text-[#E8E8E2]">·</span>
          <button
            type="button"
            onClick={() => scrollToSection('section-vocabulary')}
            className="px-2.5 py-1 rounded text-[12px] font-medium text-[#68707D] hover:text-[#191D24] hover:bg-[#F2F2ED] transition-colors whitespace-nowrap shrink-0"
          >
            3. Difficult Words
          </button>
          <span className="text-[#E8E8E2]">·</span>
          <button
            type="button"
            onClick={() => scrollToSection('section-questions')}
            className="px-2.5 py-1 rounded text-[12px] font-medium text-[#68707D] hover:text-[#191D24] hover:bg-[#F2F2ED] transition-colors whitespace-nowrap shrink-0"
          >
            4. Practice Questions
          </button>
        </nav>
      </header>

      {/* SECTION 1: English Summary */}
      <section 
        id="section-summary"
        className="bg-white rounded-xl border border-[#E8E8E2] p-5 sm:p-7 shadow-xs space-y-4 max-w-full overflow-hidden"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E8E8E2]">
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[#191D24] tracking-tight">
              English Summary
            </h2>
            <div className="text-[12px] text-[#68707D] flex items-center gap-1.5 mt-0.5">
              <span>{studyKit.wordCount} words</span>
              {studyKit.wordCount === 50 && (
                <span className="text-[#237A52] font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Exact target</span>
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(studyKit.englishSummary, 'en-summary')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] text-[#68707D] hover:text-[#191D24] rounded hover:bg-[#F2F2ED] transition-colors"
            title="Copy English summary"
          >
            {copiedSection === 'en-summary' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#237A52]" />
                <span className="text-[#237A52] font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[15px] sm:text-[16px] leading-[1.8] text-[#191D24] font-normal break-words">
          {studyKit.englishSummary}
        </p>
      </section>

      {/* SECTION 2: Roman Urdu Audio (Signature Differentiator) */}
      <section 
        id="section-roman-urdu"
        className="bg-white rounded-xl border border-[#E8E8E2] p-5 sm:p-7 shadow-xs space-y-4 max-w-full overflow-hidden"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E8E8E2]">
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[#191D24] tracking-tight">
              Understand it in your own words
            </h2>
            <p className="text-[12px] text-[#68707D] mt-0.5">
              Authentic Roman Urdu translation with voice playback
            </p>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(studyKit.romanUrduSummary, 'ur-summary')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] text-[#68707D] hover:text-[#191D24] rounded hover:bg-[#F2F2ED] transition-colors shrink-0"
            title="Copy Roman Urdu translation"
          >
            {copiedSection === 'ur-summary' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#237A52]" />
                <span className="text-[#237A52] font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Roman Urdu Reading Card: Liminal Calm Parchment */}
        <div className="p-4 sm:p-5 bg-[#FAF9F5] rounded-lg border border-[#E8E8E2] max-w-full overflow-hidden">
          <p className="text-[15px] sm:text-[16px] leading-[1.8] text-[#191D24] italic break-words">
            "{studyKit.romanUrduSummary}"
          </p>
        </div>

        {/* Minimal Audio Dock */}
        <div className="p-3 bg-[#F4F3FA] rounded-lg border border-[#5548E0]/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-full overflow-hidden">
          
          {/* Audio Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isPlaying ? (
              <button
                type="button"
                onClick={handlePlayRomanUrdu}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#5548E0] hover:bg-[#4537D0] text-white text-[12px] font-medium transition-colors shadow-xs active:scale-95 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isPaused ? 'Resume' : 'Listen in Roman Urdu'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseSpeech}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#191D24] hover:bg-[#2A2E38] text-white text-[12px] font-medium transition-colors shadow-xs shrink-0"
              >
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>Pause</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReplaySpeech}
              title="Restart from beginning"
              className="p-1.5 rounded border border-[#E8E8E2] bg-white text-[#68707D] hover:text-[#191D24] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleStopSpeech}
              title="Stop playback"
              disabled={!isPlaying && !isPaused}
              className="p-1.5 rounded border border-[#E8E8E2] bg-white text-[#68707D] hover:text-[#191D24] disabled:opacity-30 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            {isPlaying && (
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#5548E0] ml-2">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Playing...</span>
              </span>
            )}
          </div>

          {/* Speed & Clean Voice selection */}
          <div className="flex items-center gap-2.5 justify-between sm:justify-end">
            {/* Speed segmented control */}
            <div className="flex items-center bg-white rounded border border-[#E8E8E2] p-0.5 text-[11px] font-medium">
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    speechRate === speed
                      ? 'bg-[#5548E0] text-white font-semibold'
                      : 'text-[#68707D] hover:text-[#191D24]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Clean Voice Dropdown (Strictly filtered, no Hindi) */}
            {availableVoices.length > 0 && (
              <select
                value={selectedVoiceName}
                onChange={(e) => {
                  setSelectedVoiceName(e.target.value);
                  if (isPlaying) handleReplaySpeech();
                }}
                className="text-[11px] font-medium text-[#191D24] bg-white border border-[#E8E8E2] rounded px-2 py-1 max-w-[130px] truncate focus:outline-none"
                title="Select speech voice"
              >
                {availableVoices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.name.replace(/[\u0900-\u097F]/g, '').trim()} ({v.lang})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {voiceNote && (
          <p className="text-[11px] text-[#68707D] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#5548E0]" />
            <span>{voiceNote}</span>
          </p>
        )}

        {speechError && (
          <div className="p-2.5 bg-[#FFDAD6]/40 border border-[#B54747]/20 rounded text-[12px] text-[#B54747] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}
      </section>

      {/* SECTION 3: Difficult Words */}
      <section 
        id="section-vocabulary"
        className="bg-white rounded-xl border border-[#E8E8E2] p-5 sm:p-7 shadow-xs space-y-4 max-w-full overflow-hidden"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E8E8E2]">
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[#191D24] tracking-tight">
              Words worth knowing
            </h2>
            <p className="text-[12px] text-[#68707D] mt-0.5">
              10 useful academic terms with Roman Urdu meanings and contextual explanations
            </p>
          </div>

          <span className="text-[12px] text-[#68707D]">
            {studyKit.vocabulary.length} terms
          </span>
        </div>

        {/* Minimalist Vocabulary List */}
        <div className="space-y-3">
          {studyKit.vocabulary.map((item, idx) => {
            const hasQuote = Boolean(item.sourceContext);
            const isQuoteOpen = Boolean(expandedQuotes[idx]);

            return (
              <div 
                key={idx}
                className="p-3.5 sm:p-4 bg-[#FAF9F5] border border-[#E8E8E2] rounded-lg space-y-2 hover:border-[#D0D0C8] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-[12px] font-mono text-[#68707D] shrink-0">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <h3 className="text-[15px] font-semibold text-[#191D24] tracking-tight truncate">
                      {item.word}
                    </h3>
                  </div>

                  <div className="text-[13px] font-medium text-[#5548E0] shrink-0">
                    <span className="text-[#68707D] text-[12px] font-normal mr-1">Urdu:</span>
                    <span>{item.romanUrduMeaning}</span>
                  </div>
                </div>

                <p className="text-[13px] leading-relaxed text-[#3F4450] pl-6 break-words">
                  {item.contextualExplanation}
                </p>

                {hasQuote && (
                  <div className="pl-6 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setExpandedQuotes(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="text-[11px] font-medium text-[#68707D] hover:text-[#191D24] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{isQuoteOpen ? 'Hide paper quote' : 'View paper quote'}</span>
                      {isQuoteOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isQuoteOpen && (
                      <div className="mt-1.5 p-2.5 bg-white rounded border border-[#E8E8E2] text-[12px] font-mono text-[#454D5E] italic break-words">
                        "{item.sourceContext}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Exam Practice */}
      <section 
        id="section-questions"
        className="bg-white rounded-xl border border-[#E8E8E2] p-5 sm:p-7 shadow-xs space-y-4 max-w-full overflow-hidden"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#E8E8E2]">
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-semibold text-[#191D24] tracking-tight">
              Test your understanding
            </h2>
            <p className="text-[12px] text-[#68707D] mt-0.5">
              5 practice questions with answers grounded in the research
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleAllQuestions(!areAllQuestionsExpanded)}
            className="text-[12px] font-medium text-[#5548E0] hover:text-[#4537D0] transition-colors"
          >
            {areAllQuestionsExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        <div className="space-y-3">
          {studyKit.questions.map((q, idx) => {
            const isExpanded = Boolean(expandedQuestions[idx]);

            return (
              <div 
                key={idx}
                className="border border-[#E8E8E2] rounded-lg overflow-hidden bg-white"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-2 p-3.5 sm:p-4 bg-[#FAF9F5] hover:bg-[#F2F2ED] transition-colors">
                  <div 
                    onClick={() => toggleQuestion(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleQuestion(idx); }}
                    className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer select-none"
                  >
                    <span className="text-[13px] font-mono font-semibold text-[#5548E0] shrink-0 mt-0.5">
                      Q{idx + 1}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-[#68707D] uppercase tracking-wider mb-0.5">
                        {q.type}
                      </div>
                      <h3 className="text-[14px] sm:text-[15px] font-medium text-[#191D24] leading-snug break-words">
                        {q.question}
                      </h3>
                    </div>
                  </div>

                  {/* Actions on question */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`Question ${idx + 1}: ${q.question}\nAnswer: ${q.answer}`, `q-${idx}`)}
                      className="p-1 text-[#68707D] hover:text-[#191D24] rounded hover:bg-white transition-colors"
                      title="Copy Q&A"
                    >
                      {copiedSection === `q-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-[#237A52]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleQuestion(idx)}
                      className="p-1 text-[#68707D] hover:text-[#191D24] rounded hover:bg-white transition-colors"
                      title={isExpanded ? 'Hide answer' : 'Show answer'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Answer Box */}
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-[#E8E8E2] space-y-1">
                    <div className="text-[11px] font-semibold text-[#237A52] uppercase tracking-wide">
                      Grounded Answer
                    </div>
                    <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#191D24] break-words">
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
        <section className="bg-white rounded-xl border border-[#E8E8E2] p-4 text-[12px] text-[#68707D] space-y-1.5">
          <div className="font-medium text-[#191D24] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#99640B]" />
            <span>Document Scope & Limitations:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            {studyKit.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </section>
      )}

      {/* FOOTER EXPORT STUDIO */}
      <footer className="bg-white rounded-xl border border-[#E8E8E2] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[#191D24]">
            Export Study Guide
          </h3>
          <p className="text-[12px] text-[#68707D]">
            Download clean notes for long-term retention and revision
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#191D24] bg-white border border-[#E8E8E2] rounded-md hover:bg-[#F2F2ED] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#68707D]" />
            <span>Markdown (.MD)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium text-white bg-[#5548E0] hover:bg-[#4537D0] rounded-md transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Text (.TXT)</span>
          </button>
        </div>
      </footer>

    </div>
  );
};
