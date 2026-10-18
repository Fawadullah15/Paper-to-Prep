import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Loader2, 
  ArrowRight,
  BookOpen,
  ArrowDown
} from 'lucide-react';
import { StudyKitResponse } from '../types/studyKit';
import { PaperData } from '../types';

interface PaperInputCardProps {
  onStudyKitGenerated: (studyKit: StudyKitResponse, fullPaper: PaperData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const SAMPLE_PRESETS = [
  {
    title: 'ResNet (Deep Learning)',
    text: 'Deep Residual Learning for Image Recognition. Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset we evaluate residual nets with a depth of up to 152 layers—8x deeper than VGG nets but still having lower complexity. An ensemble of these residual nets achieves 3.57% error on the ImageNet test set. This result won the 1st place on the ILSVRC 2015 classification task.'
  },
  {
    title: 'Transformer (Attention)',
    text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over existing best results by over 2 BLEU.'
  },
  {
    title: 'AlphaFold (Proteins)',
    text: 'Proteins are essential to life, and understanding their structure can facilitate a mechanistic understanding of their function. Through an enormous experimental effort, the structures of around 100,000 unique proteins have been determined, but this represents a small fraction of the billions of known protein sequences. Here we demonstrate that AlphaFold, a computational method that can regularly predict protein structures with atomic accuracy even in cases in which no similar structure is known, enables structural biology at scale. Our model incorporates novel neural network architectures and training procedures based on the evolutionary, physical and geometric constraints of protein structures.'
  }
];

export const PaperInputCard: React.FC<PaperInputCardProps> = ({
  onStudyKitGenerated,
  isLoading,
  setIsLoading,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'text' | 'pdf'>('text');
  const [pastedText, setPastedText] = useState<string>('');
  
  // PDF state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Status and error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(15);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle PDF file selection
  const handleProcessPdfFile = (file: File) => {
    setErrorMessage(null);
    setSuccessNotice(null);

    // Validate type (check either MIME type or extension)
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF research paper (.pdf).');
      return;
    }

    // Validate size (max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(`The selected PDF is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is 20MB.`);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected PDF file is empty (0 bytes). Please upload a valid document.');
      return;
    }

    setSelectedFile(file);

    // Read as Data URL (base64)
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPdfBase64(result);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected PDF file.');
      setSelectedFile(null);
      setPdfBase64('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessPdfFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessPdfFile(e.dataTransfer.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPdfBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadSamplePreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setActiveInputMode('text');
    setPastedText(preset.text);
    setErrorMessage(null);
    setSuccessNotice(null);
  };

  // Submit study kit request
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);
    setSuccessNotice(null);

    // Validate input (friendly low threshold)
    if (activeInputMode === 'text') {
      const trimmed = pastedText.trim();
      if (!trimmed) {
        setErrorMessage('Please paste your research paper, abstract, or select an example below.');
        return;
      }
      if (trimmed.length < 15) {
        setErrorMessage('Please provide at least 15 characters of research content or an abstract.');
        return;
      }
    } else {
      if (!selectedFile || !pdfBase64) {
        setErrorMessage('Please choose or drag-and-drop a research paper PDF.');
        return;
      }
    }

    setIsLoading(true);
    setLoadingStep(1);
    setElapsedSeconds(0);
    setProgressPercent(18);

    const startTime = Date.now();
    const intervalTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
      
      // Dynamic realistic progress stages that never get stuck
      if (elapsed < 3) {
        setLoadingStep(1);
        setProgressPercent(28);
      } else if (elapsed < 6) {
        setLoadingStep(2);
        setProgressPercent(52);
      } else if (elapsed < 9) {
        setLoadingStep(3);
        setProgressPercent(74);
      } else if (elapsed < 14) {
        setLoadingStep(4);
        setProgressPercent(88);
      } else {
        setLoadingStep(5);
        // Gradually creep up to 96% while waiting for network finish
        setProgressPercent(prev => Math.min(96, prev + 1));
      }
    }, 1000);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 65000);

    try {
      const payload: any = {};
      if (activeInputMode === 'text') {
        payload.text = pastedText.trim();
      } else {
        payload.pdfBase64 = pdfBase64;
        payload.fileName = selectedFile?.name || 'document.pdf';
      }

      const response = await fetch('/api/generate-study-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error (${response.status})`);
      }

      const result = await response.json();
      if (result.studyKit && result.fullPaper) {
        setProgressPercent(100);
        setSuccessNotice(result.studyKit.paperTitle || 'Research Manuscript');
        onStudyKitGenerated(result.studyKit, result.fullPaper);
      } else {
        throw new Error('Incomplete response received from server.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Study Kit generation error:', err);
      if (err.name === 'AbortError') {
        setErrorMessage('The request timed out after 65 seconds. The AI model took longer than expected. Please click Retry.');
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred while generating the study kit. Please try again.');
      }
    } finally {
      clearInterval(intervalTimer);
      setIsLoading(false);
    }
  };

  const scrollToResults = () => {
    const el = document.getElementById('study-kit-results-container') || document.getElementById('section-summary');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E2] p-5 sm:p-7 shadow-xs space-y-4 sm:space-y-5 max-w-full overflow-hidden">
      
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E8E2]">
        <div>
          <h2 className="text-[19px] sm:text-[21px] font-semibold text-[#191D24] tracking-tight">
            Create your study kit
          </h2>
          <p className="text-[13px] text-[#68707D] mt-0.5">
            Bring a research paper. Leave with a clearer understanding.
          </p>
        </div>

        {/* Minimal Segmented Mode Switcher */}
        <div className="flex items-center bg-[#F2F2ED] rounded-lg p-1 text-[13px] font-medium shrink-0">
          <button
            type="button"
            onClick={() => { setActiveInputMode('text'); setErrorMessage(null); }}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeInputMode === 'text'
                ? 'bg-white text-[#191D24] font-semibold shadow-xs'
                : 'text-[#68707D] hover:text-[#191D24]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveInputMode('pdf'); setErrorMessage(null); }}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeInputMode === 'pdf'
                ? 'bg-white text-[#191D24] font-semibold shadow-xs'
                : 'text-[#68707D] hover:text-[#191D24]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* INPUT BODY: Text or PDF */}
      {activeInputMode === 'text' ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[12px] text-[#68707D]">
            <label className="font-medium text-[#191D24]">
              Manuscript Abstract, Methodology, or Full Text
            </label>
            <div className="flex items-center gap-1.5 font-mono tabular-nums text-[11px]">
              <span className="font-medium text-[#191D24]">
                {pastedText.trim() ? pastedText.trim().split(/\s+/).filter(Boolean).length : 0} words
              </span>
              <span>·</span>
              <span>{pastedText.length.toLocaleString()} chars</span>
              {pastedText.trim().length >= 15 && (
                <span className="ml-1 px-1.5 py-0.2 rounded bg-[#EEEDFC] text-[#5548E0] text-[10px] font-sans font-medium">
                  Ready
                </span>
              )}
            </div>
          </div>

          <textarea
            rows={5}
            disabled={isLoading}
            placeholder="Paste your research paper, abstract, theorem, or experimental findings here..."
            value={pastedText}
            onChange={(e) => {
              setPastedText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className="w-full p-4 text-[13px] bg-[#FAF9F5] border border-[#E8E8E2] rounded-xl focus:outline-none focus:border-[#5548E0] focus:bg-white text-[#191D24] placeholder:text-[#9AA2B1] font-sans leading-relaxed transition-all resize-y"
          />

          {/* Quick Sample Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] text-[#68707D] font-medium mr-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-[#5548E0]" />
              <span>Try sample:</span>
            </span>
            {SAMPLE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSamplePreset(preset)}
                disabled={isLoading}
                className="px-2.5 py-1 text-[11px] font-medium text-[#5548E0] bg-[#EEEDFC] hover:bg-[#E3E1FA] rounded-md transition-colors"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver 
                  ? 'border-[#5548E0] bg-[#EEEDFC]/50 scale-[0.99]' 
                  : 'border-[#E8E8E2] hover:border-[#5548E0]/40 bg-[#FAF9F5] hover:bg-white'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-[#EEEDFC] text-[#5548E0] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-[14px] font-medium text-[#191D24]">
                Drop your research PDF here, or <span className="text-[#5548E0] underline underline-offset-2">browse files</span>
              </div>
              <p className="text-[12px] text-[#68707D] mt-1">
                Supports scientific papers, tables, figures, and equations up to 20MB
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E8E8E2] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#5548E0] text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#191D24] truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-[11px] text-[#68707D]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for multimodal AI analysis
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-[11px] font-medium rounded bg-white border border-[#E8E8E2] text-[#191D24] hover:bg-[#F2F2ED] transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  disabled={isLoading}
                  className="p-1 rounded text-[#68707D] hover:text-[#B54747] hover:bg-white transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-3.5 bg-[#EEEDFC] border border-[#5548E0]/30 rounded-xl text-[13px] text-[#5548E0] flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0" />
            <span className="truncate">
              Study kit ready for <strong>"{successNotice}"</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={scrollToResults}
            className="text-[12px] font-semibold underline hover:no-underline inline-flex items-center gap-1 shrink-0 text-[#5548E0]"
          >
            <span>View Results</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-3.5 bg-[#FFDAD6]/40 border border-[#B54747]/30 rounded-xl text-[13px] text-[#B54747] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => handleGenerate()}
            className="text-[12px] font-semibold underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Responsive & Informative Loading Step Indicator */}
      {isLoading && (
        <div className="p-4 bg-[#FAF9F5] border border-[#5548E0]/30 rounded-xl space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px]">
            <div className="flex items-center gap-2.5 text-[#5548E0] font-medium min-w-0">
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#5548E0]" />
              <span className="truncate">
                {loadingStep === 1 && 'Reading manuscript & parsing methodology...'}
                {loadingStep === 2 && 'Synthesizing exact 50-word English summary...'}
                {loadingStep === 3 && 'Translating into natural Roman Urdu...'}
                {loadingStep === 4 && 'Curating 10 academic vocabulary terms...'}
                {loadingStep >= 5 && 'Formulating 5 grounded exam practice questions...'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded bg-[#EEEDFC] text-[#5548E0] font-semibold">
                {elapsedSeconds}s elapsed
              </span>
              <span className="text-[11px] font-mono tabular-nums text-[#68707D]">
                {progressPercent}%
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-[#E8E8E2] rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-[#5548E0] transition-all duration-500 ease-out rounded-full relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#68707D]">
            <span>Active Gemini AI synthesis in progress</span>
            <span>Typically completes in 8–14 seconds</span>
          </div>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#E8E8E2]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#68707D]">
          <span className="font-medium text-[#191D24]">Includes:</span>
          <span>50-word summary</span>
          <span aria-hidden="true">·</span>
          <span>Roman Urdu audio</span>
          <span aria-hidden="true">·</span>
          <span>10 difficult words</span>
          <span aria-hidden="true">·</span>
          <span>5 practice questions</span>
        </div>

        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-[40px] text-[14px] font-medium text-white bg-[#5548E0] hover:bg-[#4537D0] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors active:scale-[0.99] shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Study Kit...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Study Kit</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
