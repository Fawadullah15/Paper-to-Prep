import React, { useState } from 'react';
import { 
  Search, 
  Sigma, 
  BookOpen, 
  Layers, 
  Copy, 
  Check, 
  Filter
} from 'lucide-react';
import { VocabularyItem } from '../types';

interface VocabularyMatrixViewProps {
  items: VocabularyItem[];
  isFocusMode: boolean;
}

export const VocabularyMatrixView: React.FC<VocabularyMatrixViewProps> = ({
  items,
  isFocusMode,
}) => {
  const [search, setSearch] = useState('');
  const [filterFrequency, setFilterFrequency] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyFormula = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase()) ||
      (item.formula && item.formula.toLowerCase().includes(search.toLowerCase())) ||
      item.contextInPaper.toLowerCase().includes(search.toLowerCase());
    
    const matchesFrequency = filterFrequency === 'all' || item.frequency === filterFrequency;
    return matchesSearch && matchesFrequency;
  });

  return (
    <div className={`space-y-6 ${isFocusMode ? 'max-w-[68ch] mx-auto' : 'max-w-5xl'}`}>
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687386]" />
          <input
            type="text"
            placeholder="Search mathematical formulas, scientific nomenclature, symbols..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[40px] pl-9 pr-3 text-[13px] bg-white border border-[#E7EAF0] rounded-md focus:outline-none focus:border-[#6259E8] focus:ring-2 focus:ring-[#6259E8]/12 text-[#172033] placeholder:text-[#9AA2B1] transition-all"
          />
        </div>

        {/* Frequency Filter Segmented Tabs */}
        <div className="flex items-center bg-[#F8F9FC] border border-[#E7EAF0] rounded-md p-0.5 text-[12px] font-medium shrink-0 overflow-x-auto no-scrollbar max-w-full">
          {['all', 'Foundational', 'High', 'Medium'].map((freq) => (
            <button
              key={freq}
              onClick={() => setFilterFrequency(freq)}
              className={`px-3 py-1 rounded-[5px] whitespace-nowrap transition-all ${
                filterFrequency === freq
                  ? 'bg-white text-[#172033] shadow-xs font-semibold'
                  : 'text-[#687386] hover:text-[#172033]'
              }`}
            >
              {freq === 'all' ? 'All Entries' : freq}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE RESPONSIVE CARD VIEW (block md:hidden) - Zero Overflow on Phones */}
      <div className="block md:hidden space-y-3 max-w-full">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-[#E7EAF0] p-4 shadow-xs space-y-2.5 max-w-full overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-bold text-[15px] text-[#172033] break-words">
                  {item.term}
                </h4>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                item.frequency === 'Foundational'
                  ? 'bg-[#6259E8]/10 text-[#6259E8]'
                  : item.frequency === 'High'
                  ? 'bg-[#198754]/10 text-[#198754]'
                  : 'bg-[#F8F9FC] text-[#687386] border border-[#E7EAF0]'
              }`}>
                {item.frequency}
              </span>
            </div>

            {item.formula ? (
              <div className="p-2.5 bg-[#F0EEFF] rounded-lg border border-[#6259E8]/15 flex items-center justify-between gap-2 max-w-full overflow-hidden">
                <code className="font-mono text-[11px] text-[#6259E8] break-all leading-snug">
                  {item.formula}
                </code>
                <button
                  onClick={() => copyFormula(item.id, item.formula!)}
                  title="Copy formula"
                  className="p-1 text-[#687386] hover:text-[#6259E8] shrink-0"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-[#198754]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#687386] bg-[#F8F9FC] border border-[#E7EAF0]">
                Standard Concept
              </span>
            )}

            <p className="text-[13px] leading-relaxed text-[#172033] break-words">
              {item.definition}
            </p>

            <div className="text-[12px] text-[#687386] bg-[#F8F9FC] p-2.5 rounded-lg border border-[#E7EAF0] break-words">
              <span className="font-semibold text-[#172033] mr-1">Context:</span>
              {item.contextInPaper}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP MATRIX TABLE (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E7EAF0] overflow-hidden shadow-xs max-w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="bg-[#F8F9FC] border-b border-[#E7EAF0] text-[11px] font-semibold uppercase tracking-wider text-[#687386]">
                <th className="py-3 px-4 w-[28%]">Term & Notation</th>
                <th className="py-3 px-4 w-[42%]">Academic Definition</th>
                <th className="py-3 px-4 w-[20%]">Paper Context</th>
                <th className="py-3 px-4 w-[10%] text-right">Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]">
              {filteredItems.map((item) => (
                <tr 
                  key={item.id}
                  className="hover:bg-[#F8F9FC] transition-colors group"
                >
                  {/* Term & Code/Formula Pill */}
                  <td className="py-3 px-4 align-top">
                    <div className="font-semibold text-[14px] text-[#172033] mb-1">
                      {item.term}
                    </div>

                    {item.formula ? (
                      <div className="relative mt-1 group/code">
                        <code className="inline-block font-mono text-[11px] text-[#6259E8] bg-[#F0EEFF] px-2 py-1 rounded-md border border-[#6259E8]/15 break-all">
                          {item.formula}
                        </code>
                        <button
                          onClick={() => copyFormula(item.id, item.formula!)}
                          title="Copy formula"
                          className="ml-1.5 p-1 text-[#687386] hover:text-[#6259E8] inline-flex align-middle opacity-0 group-hover/code:opacity-100 transition-opacity"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-[#198754]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#687386] bg-[#F8F9FC] border border-[#E7EAF0]">
                        Standard Concept
                      </span>
                    )}
                  </td>

                  {/* Rigorous Academic Definition */}
                  <td className="py-3 px-4 align-top text-[13px] leading-[22px] text-[#172033] break-words">
                    {item.definition}
                  </td>

                  {/* Context in Paper */}
                  <td className="py-3 px-4 align-top text-[12px] leading-relaxed text-[#687386] break-words">
                    {item.contextInPaper}
                  </td>

                  {/* Yield / Frequency Badge */}
                  <td className="py-3 px-4 align-top text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      item.frequency === 'Foundational'
                        ? 'bg-[#6259E8]/10 text-[#6259E8]'
                        : item.frequency === 'High'
                        ? 'bg-[#198754]/10 text-[#198754]'
                        : 'bg-[#F8F9FC] text-[#687386] border border-[#E7EAF0]'
                    }`}>
                      {item.frequency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};
