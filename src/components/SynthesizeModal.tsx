import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Loader2, 
  FileText, 
  BookOpen, 
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { PaperData } from '../types';

interface SynthesizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaperSynthesized: (newPaper: PaperData) => void;
}

const PRESET_MANUSCRIPTS = [
  {
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    field: 'Computer Science',
    doi: '10.48550/arXiv.2312.00752',
    excerpt: `Foundation models, now mostly based on the Transformer architecture, suffer from linear computational growth in state and quadratic growth in context length during training and inference. While Structured State Space Models (SSMs) scale linearly with sequence length, they have historically lagged behind Transformers on language modeling due to their time-invariant parameters. We introduce Mamba, a selective state space architecture that lets the SSM parameters be functions of the input, enabling the model to selectively propagate or forget information along the sequence dimension. Coupled with a hardware-aware parallel scan algorithm on GPU SRAM, Mamba achieves 5x higher inference throughput than Transformers of similar size and matches or outperforms Transformers up to 7B parameters.`
  },
  {
    title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning',
    field: 'Artificial Intelligence',
    doi: '10.48550/arXiv.2501.12948',
    excerpt: `We introduce DeepSeek-R1-Zero and DeepSeek-R1. DeepSeek-R1-Zero is trained via large-scale reinforcement learning (RL) directly on base models without preliminary supervised fine-tuning (SFT), demonstrating remarkable emergent reasoning behaviors such as self-verification, reflection, and generating long chains of thought. To address readability and language mixing, we subsequently develop DeepSeek-R1, which incorporates multi-stage training and cold-start data before RL. On AIME 2024, DeepSeek-R1 achieves 79.8% Pass@1, competitive with OpenAI-o1-1217 across mathematics, coding, and scientific reasoning.`
  }
];

export const SynthesizeModal: React.FC<SynthesizeModalProps> = ({
  isOpen,
  onClose,
  onPaperSynthesized,
}) => {
  const [title, setTitle] = useState('');
  const [doi, setDoi] = useState('');
  const [text, setText] = useState('');
  const [field, setField] = useState('Computer Science');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_MANUSCRIPTS[0]) => {
    setTitle(preset.title);
    setField(preset.field);
    setDoi(preset.doi);
    setText(preset.excerpt);
    setErrorMessage(null);
  };

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !text.trim()) {
      setErrorMessage('Please provide a paper title or manuscript text/abstract.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep(s => (s < 3 ? s + 1 : s));
    }, 1200);

    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          doi,
          field,
          text,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const result = await response.json();
      const synthesizedPaper: PaperData = result.fullPaper || result;
      onPaperSynthesized(synthesizedPaper);
      onClose();
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Synthesis failed:', err);
      setErrorMessage(
        err.message || 'Failed to synthesize manuscript. Please verify your Gemini API key in Settings > Secrets or try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172033]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E7EAF0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0EEFF] text-[#6259E8] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#172033]">
                Synthesize New Manuscript
              </h3>
              <p className="text-[12px] text-[#687386]">
                Generate executive summary, flashcards, quizzes & audio briefings with Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-[#687386] hover:text-[#172033] hover:bg-[#F8F9FC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Quick Preset Selector */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#687386] mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#6259E8]" />
              <span>Or click a modern benchmark to test:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_MANUSCRIPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  disabled={isLoading}
                  className="p-2.5 bg-[#F8F9FC] hover:bg-[#F0EEFF] border border-[#E7EAF0] hover:border-[#6259E8]/30 rounded-lg text-left transition-all group"
                >
                  <div className="text-[12px] font-semibold text-[#172033] group-hover:text-[#6259E8] line-clamp-1">
                    {preset.title}
                  </div>
                  <div className="text-[11px] text-[#687386]">
                    {preset.field} · DOI: {preset.doi}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSynthesize} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-[12px] font-semibold text-[#172033] mb-1">
                Paper Title or Working Thesis
              </label>
              <input
                type="text"
                placeholder="e.g. FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                className="w-full h-[40px] px-3 text-[13px] bg-white border border-[#E7EAF0] rounded-md focus:outline-none focus:border-[#6259E8] focus:ring-2 focus:ring-[#6259E8]/12 text-[#172033] placeholder:text-[#9AA2B1]"
              />
            </div>

            {/* DOI and Field Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#172033] mb-1">
                  DOI or ArXiv ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10.48550/arXiv.2307.08691"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-[40px] px-3 text-[13px] bg-white border border-[#E7EAF0] rounded-md focus:outline-none focus:border-[#6259E8] focus:ring-2 focus:ring-[#6259E8]/12 text-[#172033] placeholder:text-[#9AA2B1]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#172033] mb-1">
                  Discipline / Field
                </label>
                <select
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-[40px] px-3 text-[13px] bg-white border border-[#E7EAF0] rounded-md focus:outline-none focus:border-[#6259E8] focus:ring-2 focus:ring-[#6259E8]/12 text-[#172033]"
                >
                  <option value="Computer Science">Computer Science & AI</option>
                  <option value="Biomedicine & Genetics">Biomedicine & Genetics</option>
                  <option value="Physics & Engineering">Physics & Engineering</option>
                  <option value="Neuroscience & Medicine">Neuroscience & Medicine</option>
                  <option value="Quantitative Finance">Quantitative Finance & Math</option>
                </select>
              </div>
            </div>

            {/* Abstract or Manuscript Excerpt */}
            <div>
              <label className="block text-[12px] font-semibold text-[#172033] mb-1">
                Manuscript Abstract or Full Text
              </label>
              <textarea
                rows={5}
                placeholder="Paste the abstract, methodology section, or key theorems from your paper..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
                className="w-full p-3 text-[13px] bg-white border border-[#E7EAF0] rounded-md focus:outline-none focus:border-[#6259E8] focus:ring-2 focus:ring-[#6259E8]/12 text-[#172033] placeholder:text-[#9AA2B1] font-mono leading-relaxed"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-[#FFDAD6]/50 border border-[#ba1a1a]/30 rounded-lg text-[13px] text-[#ba1a1a] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Progress indicator during generation */}
            {isLoading && (
              <div className="p-3.5 bg-[#F0EEFF] rounded-lg border border-[#6259E8]/20 space-y-2">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#6259E8]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {loadingStep === 1 && 'Parsing academic structure & semantic hierarchy...'}
                    {loadingStep === 2 && 'Synthesizing concepts, formulas & takeaways...'}
                    {loadingStep >= 3 && 'Generating SRS flashcards, quiz & audio script...'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E0DEEF] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#6259E8] transition-all duration-300"
                    style={{ width: `${(loadingStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 h-[38px] text-[13px] font-medium text-[#172033] bg-white border border-[#E7EAF0] rounded-md hover:bg-[#F8F9FC] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-5 h-[38px] text-[13px] font-medium text-white bg-[#6259E8] hover:bg-[#5147D8] disabled:opacity-50 rounded-md transition-all shadow-sm shadow-[#6259E8]/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Study Environment</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
