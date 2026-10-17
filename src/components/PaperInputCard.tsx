import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Loader2, 
  FileUp, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { StudyKitResponse } from '../types/studyKit';
import { PaperData } from '../types';

interface PaperInputCardProps {
  onStudyKitGenerated: (studyKit: StudyKitResponse, fullPaper: PaperData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

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
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle PDF file selection
  const handleProcessPdfFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
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

  // Submit study kit request
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);

    // Validate input
    if (activeInputMode === 'text') {
      const trimmed = pastedText.trim();
      if (!trimmed) {
        setErrorMessage('Please paste your research paper, abstract, or manuscript excerpt.');
        return;
      }
      if (trimmed.length < 80) {
        setErrorMessage('The text is too short to produce a reliable study kit (minimum 80 characters required).');
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

    const stepTimer = setInterval(() => {
      setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 1400);

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
      });

      clearInterval(stepTimer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error (${response.status})`);
      }

      const result = await response.json();
      if (result.studyKit && result.fullPaper) {
        onStudyKitGenerated(result.studyKit, result.fullPaper);
      } else {
        throw new Error('Incomplete response received from server.');
      }
    } catch (err: any) {
      clearInterval(stepTimer);
      console.error('Study Kit generation error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while generating the study kit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5 max-w-full overflow-hidden">
      
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-[#E7EAF0]">
        <div>
          <h2 className="text-[17px] font-bold text-[#172033] flex items-center gap-2">
            <FileUp className="w-5 h-5 text-[#6259E8]" />
            <span>Generate Research Study Kit</span>
          </h2>
          <p className="text-[12px] text-[#687386]">
            Upload any academic PDF or paste manuscript text to generate all 4 core study resources
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="flex items-center bg-[#F8F9FC] border border-[#E7EAF0] rounded-lg p-1 text-[12px] font-medium">
          <button
            type="button"
            onClick={() => { setActiveInputMode('text'); setErrorMessage(null); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeInputMode === 'text'
                ? 'bg-white text-[#172033] font-semibold shadow-xs'
                : 'text-[#687386] hover:text-[#172033]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveInputMode('pdf'); setErrorMessage(null); }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeInputMode === 'pdf'
                ? 'bg-white text-[#172033] font-semibold shadow-xs'
                : 'text-[#687386] hover:text-[#172033]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* INPUT BODY: Text or PDF */}
      {activeInputMode === 'text' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px] text-[#687386]">
            <label className="font-semibold text-[#172033]">
              Manuscript Abstract, Methodology, or Full Text
            </label>
            <span className="font-mono">
              {pastedText.length.toLocaleString()} characters
            </span>
          </div>

          <textarea
            rows={5}
            disabled={isLoading}
            placeholder="Paste your research manuscript text, abstract, theorems, or clinical findings here..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className="w-full p-3.5 text-[13px] bg-[#F8F9FC] border border-[#E7EAF0] rounded-xl focus:outline-none focus:border-[#6259E8] focus:bg-white text-[#172033] placeholder:text-[#9AA2B1] font-sans leading-relaxed transition-all resize-y"
          />
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
                  ? 'border-[#6259E8] bg-[#F0EEFF]/50 scale-[0.99]' 
                  : 'border-[#E7EAF0] hover:border-[#6259E8]/50 bg-[#F8F9FC] hover:bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#F0EEFF] text-[#6259E8] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-[14px] font-semibold text-[#172033]">
                Drop your research PDF here, or <span className="text-[#6259E8] underline underline-offset-2">browse files</span>
              </div>
              <p className="text-[12px] text-[#687386] mt-1">
                Supports native tables, diagrams, equations & scientific figures up to 20MB
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[#F0EEFF]/80 rounded-xl border border-[#6259E8]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#6259E8] text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#172033] truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-[11px] text-[#687386]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for multimodal AI extraction
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={removeSelectedFile}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-[#687386] hover:text-[#ba1a1a] hover:bg-white transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-3.5 bg-[#FFDAD6]/50 border border-[#ba1a1a]/30 rounded-xl text-[13px] text-[#ba1a1a] flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => handleGenerate()}
            className="text-[12px] font-bold underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Real Loading Step Indicator */}
      {isLoading && (
        <div className="p-4 bg-[#F0EEFF] border border-[#6259E8]/25 rounded-xl space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between text-[13px] font-semibold text-[#6259E8]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {loadingStep === 1 && 'Extracting manuscript structure & figures...'}
                {loadingStep === 2 && 'Synthesizing exact 50-word English summary...'}
                {loadingStep === 3 && 'Translating into natural Roman Urdu...'}
                {loadingStep >= 4 && 'Curating 10 difficult words & 5 grounded exam questions...'}
              </span>
            </div>
            <span className="text-[11px] font-mono">{loadingStep} / 4</span>
          </div>

          <div className="w-full h-1.5 bg-[#E0DEEF] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#6259E8] transition-all duration-300"
              style={{ width: `${(loadingStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <span className="text-[11px] text-[#687386] hidden sm:inline">
          Single click triggers all 4 outputs (50w summary, Roman Urdu, 10 words, 5 questions)
        </span>

        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-[42px] text-[14px] font-bold text-white bg-[#6259E8] hover:bg-[#5147D8] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-[#6259E8]/25 transition-all active:scale-[0.99] sm:ml-auto"
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
