import React, { useState } from 'react';
import { 
  ChevronDown, 
  Clock, 
  Quote, 
  Lightbulb, 
  Tag, 
  Search,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { Concept } from '../types';

interface ConceptAccordionsViewProps {
  concepts: Concept[];
  isFocusMode: boolean;
}

export const ConceptAccordionsView: React.FC<ConceptAccordionsViewProps> = ({
  concepts,
  isFocusMode,
}) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    [concepts[0]?.id || '']: true // first open by default
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    concepts.forEach(c => { all[c.id] = true; });
    setOpenIds(all);
  };

  const collapseAll = () => {
    setOpenIds({});
  };

  // Extract unique taxonomy tags
  const tags = Array.from(new Set(concepts.map(c => c.taxonomy)));

  const filteredConcepts = concepts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.takeaway.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || c.taxonomy === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className={`space-y-6 ${isFocusMode ? 'max-w-[68ch] mx-auto' : 'max-w-4xl'}`}>
      
      {/* Search & Taxonomy Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687386]" />
          <input
            type="text"
            placeholder="Search concepts, quotes, or mathematical terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-9 pr-3 text-[13px] bg-white border border-[#E7EAF0] rounded-md focus:outline-none focus:border-[#6259E8] focus:ring-2 focus:ring-[#6259E8]/12 text-[#172033] placeholder:text-[#9AA2B1] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 text-[12px] font-medium text-[#687386] hover:text-[#172033] hover:bg-white rounded-md border border-[#E7EAF0] transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 text-[12px] font-medium text-[#687386] hover:text-[#172033] hover:bg-white rounded-md border border-[#E7EAF0] transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Tag pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedTag('all')}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider transition-all ${
            selectedTag === 'all'
              ? 'bg-[#6259E8] text-white shadow-xs'
              : 'bg-white text-[#687386] border border-[#E7EAF0] hover:text-[#172033]'
          }`}
        >
          All Concepts ({concepts.length})
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedTag === tag
                ? 'bg-[#6259E8] text-white shadow-xs'
                : 'bg-white text-[#687386] border border-[#E7EAF0] hover:text-[#172033]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Concepts Accordion List */}
      <div className="space-y-3.5">
        {filteredConcepts.map((concept) => {
          const isOpen = Boolean(openIds[concept.id]);
          return (
            <div
              key={concept.id}
              className="bg-white rounded-xl border border-[#E7EAF0] shadow-xs transition-all overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleAccordion(concept.id)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#F8F9FC]/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0EEFF] text-[#6259E8]">
                    {concept.taxonomy}
                  </span>
                  <h3 className="text-[16px] font-semibold text-[#172033] tracking-tight truncate">
                    {concept.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1 text-[12px] text-[#687386] font-normal">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{concept.readingTime}</span>
                  </span>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[#687386] transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#6259E8]' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Accordion Expanded Body */}
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-[#E7EAF0]/80 space-y-4">
                  
                  {/* Synthesis Explanation */}
                  <div className="text-[14px] leading-[24px] text-[#464554]">
                    <p>{concept.summary}</p>
                  </div>

                  {/* Key Quote with 3px Left Border in #6259E8 */}
                  <div className="p-3.5 bg-[#F8F9FC] border-l-[3px] border-[#6259E8] rounded-r-lg">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6259E8] uppercase tracking-wider mb-1">
                      <Quote className="w-3 h-3" />
                      <span>Original Manuscript Formulation</span>
                    </div>
                    <blockquote className="text-[13px] italic leading-relaxed text-[#172033] font-serif">
                      "{concept.keyQuote}"
                    </blockquote>
                  </div>

                  {/* Actionable Academic Takeaway */}
                  <div className="p-3 bg-[#F0EEFF]/80 rounded-lg border border-[#6259E8]/15 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-[#6259E8] shrink-0 mt-0.5" />
                    <div className="text-[13px] leading-relaxed text-[#172033]">
                      <span className="font-semibold text-[#6259E8] mr-1">Takeaway:</span>
                      {concept.takeaway}
                    </div>
                  </div>

                  {/* Subpoints / Mechanism Breakdown */}
                  {concept.subpoints && concept.subpoints.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[#687386] mb-2">
                        Mechanistic Nuance
                      </h5>
                      <ul className="space-y-1.5 text-[13px] text-[#464554]">
                        {concept.subpoints.map((sub, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#6259E8] font-bold mt-0.5">•</span>
                            <span>{sub}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
