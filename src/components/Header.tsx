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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E8E2] px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 transition-colors max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Logo size={32} className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-[15px] sm:text-[18px] tracking-tight text-[#191D24] truncate block">
              Paper to Prep
            </span>
            <p className="text-[11px] text-[#68707D] hidden sm:block truncate">
              Understand Research. Prepare Smarter.
            </p>
          </div>
        </div>

        {/* Paper Selector Dropdown */}
        <div className="hidden md:flex items-center gap-2 max-w-xs lg:max-w-sm w-full justify-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#68707D]">
              <Library className="w-3.5 h-3.5" />
            </div>
            <select
              value={currentPaper.id}
              onChange={(e) => {
                const found = papers.find(p => p.id === e.target.value);
                if (found) onSelectPaper(found);
              }}
              className="w-full h-[36px] pl-8 pr-7 text-[12px] sm:text-[13px] font-medium text-[#191D24] bg-[#FAF9F5] border border-[#E8E8E2] rounded-md focus:outline-none focus:border-[#5548E0] transition-all truncate cursor-pointer hover:bg-white"
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
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#FAF9F5] border border-[#E8E8E2]">
            <Flame className="w-3.5 h-3.5 text-[#5548E0]" />
            <span className="text-[11px] font-medium text-[#191D24]">
              Mastery: <span className="font-semibold text-[#5548E0]">{masteryPercentage}%</span>
            </span>
          </div>

          {/* Reading Focus Toggle */}
          <button
            onClick={onToggleFocusMode}
            title={readingFocusMode ? "Exit Focus Reading Mode" : "Focus Reading Mode (68ch width)"}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-[34px] sm:h-[36px] text-[12px] sm:text-[13px] font-medium rounded-md border transition-colors ${
              readingFocusMode 
                ? 'bg-[#EEEDFC] text-[#5548E0] border-[#5548E0]/30 shadow-xs'
                : 'bg-white text-[#68707D] border-[#E8E8E2] hover:text-[#191D24] hover:bg-[#F2F2ED]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{readingFocusMode ? 'Focus: On' : '68ch Focus'}</span>
          </button>

          {/* Export Deck Button */}
          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 h-[34px] sm:h-[36px] text-[12px] sm:text-[13px] font-medium text-[#191D24] bg-white border border-[#E8E8E2] rounded-md hover:bg-[#F2F2ED] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#68707D]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Synthesize New Paper Primary Button */}
          <button
            onClick={onOpenSynthesize}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 h-[34px] sm:h-[36px] text-[12px] sm:text-[13px] font-medium text-white bg-[#5548E0] hover:bg-[#4537D0] rounded-md transition-colors shadow-xs active:scale-[0.99]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesize</span>
          </button>
        </div>

      </div>
    </header>
  );
};
