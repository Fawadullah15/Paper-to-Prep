import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  BookMarked, 
  Calendar, 
  Award, 
  Share2, 
  Hash,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { PaperData, StudyTab } from '../types';

interface LeftSourceRailProps {
  paper: PaperData;
  activeTab: StudyTab;
  onSelectTab: (tab: StudyTab) => void;
  onOpenSourceInspector: () => void;
}

export const LeftSourceRail: React.FC<LeftSourceRailProps> = ({
  paper,
  activeTab,
  onSelectTab,
  onOpenSourceInspector,
}) => {
  const [copiedDoi, setCopiedDoi] = useState(false);

  const copyDoi = () => {
    navigator.clipboard.writeText(paper.doi);
    setCopiedDoi(true);
    setTimeout(() => setCopiedDoi(false), 2000);
  };

  return (
    <aside className="w-full space-y-4">
      
      {/* Paper Metadata & Canonical Header Card */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 shadow-xs">
        
        {/* Field & Citation Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#F0EEFF] text-[#6259E8]">
            {paper.fieldTag}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#687386]">
            <Award className="w-3.5 h-3.5 text-[#6259E8]" />
            {paper.citations} citations
          </span>
        </div>

        {/* Paper Title */}
        <h2 className="text-[16px] font-semibold text-[#172033] leading-snug tracking-tight mb-2">
          {paper.title}
        </h2>

        {/* Authors */}
        <p className="text-[12px] text-[#687386] leading-relaxed mb-3 line-clamp-2">
          {paper.authors.join(', ')}
        </p>

        {/* Journal & Year */}
        <div className="space-y-1.5 pt-2 border-t border-[#E7EAF0] text-[12px] text-[#687386]">
          <div className="flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5 text-[#6259E8] shrink-0" />
            <span className="truncate font-medium text-[#172033]">{paper.venue}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#687386] shrink-0" />
            <span>Published {paper.year} · {paper.readingTimeMinutes} min deep read</span>
          </div>
        </div>

        {/* DOI Copy & Link Row */}
        <div className="mt-3 pt-2.5 border-t border-[#E7EAF0] flex items-center justify-between gap-2">
          <button
            onClick={copyDoi}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-[#687386] hover:text-[#6259E8] transition-colors"
            title="Copy DOI identifier"
          >
            {copiedDoi ? <Check className="w-3 h-3 text-[#198754]" /> : <Copy className="w-3 h-3" />}
            <span className="truncate max-w-[170px]">{paper.doi}</span>
          </button>
          
          <button
            onClick={onOpenSourceInspector}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6259E8] hover:text-[#5147D8] transition-colors"
          >
            <FileText className="w-3 h-3" />
            <span>Source</span>
          </button>
        </div>

      </div>

      {/* Structured Outline & Study Navigation */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-3.5 shadow-xs">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#687386] mb-2 px-1">
          Study Modules
        </h3>
        
        <nav className="space-y-1">
          {[
            { id: 'studykit', label: 'Core 4-in-1 Study Kit', count: 'Core' },
            { id: 'summary', label: 'Executive Summary & Takeaways', count: 'Overview' },
            { id: 'concepts', label: 'Concept Deep Dives', count: `${paper.concepts.length}` },
            { id: 'graph', label: 'D3 Knowledge Graph', count: 'Map' },
            { id: 'flashcards', label: 'Flashcards & SRS Deck', count: `${paper.flashcards.length}` },
            { id: 'quiz', label: 'Practice Quiz & Board Prep', count: `${paper.quiz.length}` },
            { id: 'vocabulary', label: 'Formulas & Vocabulary', count: `${paper.vocabularyAndFormulas.length}` },
            { id: 'source', label: 'Manuscript Source Reader', count: `${paper.sourceExcerpts.length}` },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as StudyTab)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-[13px] flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-[#F0EEFF] text-[#6259E8] font-semibold'
                    : 'text-[#464554] hover:bg-[#F8F9FC] hover:text-[#172033]'
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#6259E8] text-white' : 'bg-[#F8F9FC] text-[#687386]'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Methodology Pipeline Highlights */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 shadow-xs">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Layers className="w-3.5 h-3.5 text-[#6259E8]" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#687386]">
            Methodology Pipeline
          </h3>
        </div>

        <ol className="relative border-l border-[#E7EAF0] ml-2 space-y-3 pl-3 text-[12px]">
          {paper.executiveSummary.methodologyPipeline.map((step, idx) => (
            <li key={idx} className="relative">
              <div className="absolute -left-[17px] top-0.5 w-2 h-2 rounded-full bg-[#6259E8] ring-4 ring-white" />
              <p className="text-[#172033] font-normal leading-relaxed">
                <span className="font-semibold text-[#6259E8] mr-1">Phase {idx + 1}:</span>
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>

    </aside>
  );
};
