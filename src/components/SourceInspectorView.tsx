import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { PaperData } from '../types';

interface SourceInspectorViewProps {
  paper: PaperData;
  isFocusMode: boolean;
}

export const SourceInspectorView: React.FC<SourceInspectorViewProps> = ({
  paper,
  isFocusMode,
}) => {
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const currentExcerpt = paper.sourceExcerpts[selectedSectionIdx] || paper.sourceExcerpts[0];

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-6 ${isFocusMode ? 'max-w-[68ch] mx-auto' : 'max-w-4xl'}`}>
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#6259E8]" />
            <h3 className="text-[14px] font-semibold text-[#172033]">
              Original Manuscript Excerpts
            </h3>
          </div>
          <p className="text-[12px] text-[#687386]">
            Compare synthesized study notes directly with unedited primary source text from {paper.venue} ({paper.year})
          </p>
        </div>

        <button
          onClick={() => copyText(currentExcerpt?.content || '')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#172033] bg-[#F8F9FC] border border-[#E7EAF0] rounded-md hover:bg-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#198754]" /> : <Copy className="w-3.5 h-3.5 text-[#687386]" />}
          <span>{copied ? 'Copied' : 'Copy Excerpt'}</span>
        </button>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {paper.sourceExcerpts.map((excerpt, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedSectionIdx(idx)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all ${
              selectedSectionIdx === idx
                ? 'bg-[#6259E8] text-white shadow-xs font-semibold'
                : 'bg-white text-[#464554] border border-[#E7EAF0] hover:text-[#172033]'
            }`}
          >
            {excerpt.section}
          </button>
        ))}
      </div>

      {/* Excerpt Reading Surface */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E7EAF0]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6259E8]" />
            <span className="text-[13px] font-semibold text-[#172033]">
              {currentExcerpt?.section}
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#687386]">
            DOI: {paper.doi}
          </span>
        </div>

        {/* Paper Text */}
        <div className="prose prose-slate max-w-none text-[15px] sm:text-[16px] leading-[28px] text-[#172033] font-serif">
          <p className="whitespace-pre-line">
            {currentExcerpt?.content}
          </p>
        </div>
      </div>

    </div>
  );
};
