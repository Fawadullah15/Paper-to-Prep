import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Download, 
  Library, 
  FileText, 
  CheckCircle2, 
  SlidersHorizontal,
  Flame,
  ArrowRight
} from 'lucide-react';
import { PaperData } from '../types';

import { Logo } from './Logo';

interface HeaderProps {
  papers: PaperData[];
  currentPaper: PaperData;
  onSelectPaper: (paper: PaperData) => void;
  onOpenSynthesize: () => void;
  onOpenExport: () => void;
  masteryPercentage: number;
  readingFocusMode: boolean;
  onToggleFocusMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  papers,
  currentPaper,
  onSelectPaper,
  onOpenSynthesize,
  onOpenExport,
  masteryPercentage,
  readingFocusMode,
  onToggleFocusMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7EAF0] px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 transition-colors max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Logo size={32} className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-[14px] sm:text-[17px] tracking-tight text-[#172033] truncate max-w-[130px] xs:max-w-none">
                Paper to Prep
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide uppercase bg-[#F0EEFF] text-[#6259E8] border border-[#6259E8]/15">
                Manuscript Engine
              </span>
            </div>
            <p className="text-[11px] sm:text-[12px] text-[#687386] hidden lg:block truncate">
              Cognitive synthesis & spaced retention for academic literature
            </p>
          </div>
        </div>

        {/* Paper Selector Dropdown - hidden on very small screens, visible on md+ */}
        <div className="hidden md:flex items-center gap-2 max-w-xs lg:max-w-sm w-full justify-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#687386]">
              <Library className="w-3.5 h-3.5" />
            </div>
            <select
              value={currentPaper.id}
              onChange={(e) => {
                const found = papers.find(p => p.id === e.target.value);
                if (found) onSelectPaper(found);
              }}
              className="w-full h-[36px] pl-8 pr-7 text-[12px] sm:text-[13px] font-medium text-[#172033] bg-[#F8F9FC] border border-[#E7EAF0] rounded-md focus:outline-none focus:border-[#6259E8] transition-all truncate cursor-pointer hover:bg-white"
            >
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls & Mastery Widget */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Quick Mastery indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#F8F9FC] border border-[#E7EAF0]">
            <Flame className="w-3.5 h-3.5 text-[#6259E8]" />
            <span className="text-[11px] font-medium text-[#172033]">
              Mastery: <span className="font-semibold text-[#6259E8]">{masteryPercentage}%</span>
            </span>
          </div>

          {/* Reading Focus Toggle */}
          <button
            onClick={onToggleFocusMode}
            title={readingFocusMode ? "Exit Focus Reading Mode" : "Focus Reading Mode (68ch width)"}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-[34px] sm:h-[38px] text-[12px] sm:text-[13px] font-medium rounded-md border transition-all ${
              readingFocusMode 
                ? 'bg-[#F0EEFF] text-[#6259E8] border-[#6259E8]/30 shadow-xs'
                : 'bg-white text-[#687386] border-[#E7EAF0] hover:text-[#172033] hover:bg-[#F8F9FC]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{readingFocusMode ? 'Focus: On' : '68ch Focus'}</span>
          </button>

          {/* Export Deck Button */}
          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 h-[34px] sm:h-[38px] text-[12px] sm:text-[13px] font-medium text-[#172033] bg-white border border-[#E7EAF0] rounded-md hover:bg-[#F8F9FC] transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#687386]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Synthesize New Paper Primary Button */}
          <button
            onClick={onOpenSynthesize}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 h-[34px] sm:h-[38px] text-[12px] sm:text-[13px] font-medium text-white bg-[#6259E8] hover:bg-[#5147D8] rounded-md transition-all shadow-sm shadow-[#6259E8]/25 active:scale-[0.99]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesize</span>
          </button>
        </div>

      </div>
    </header>
  );
};
