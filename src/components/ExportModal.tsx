import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  Layers, 
  BookMarked,
  Sparkles
} from 'lucide-react';
import { PaperData } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: PaperData;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  paper,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate Anki TSV format: front <tab> back <tab> tags
  const exportAnkiTSV = () => {
    const lines = paper.flashcards.map(f => {
      const frontClean = f.front.replace(/\t/g, ' ').replace(/\n/g, '<br>');
      const backClean = f.back.replace(/\t/g, ' ').replace(/\n/g, '<br>');
      const tag = `${paper.fieldTag.replace(/\s+/g, '_')}::${f.category.replace(/\s+/g, '_')}`;
      return `${frontClean}\t${backClean}\t${tag}`;
    });

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paper.shortTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-anki-deck.tsv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate Markdown Study Sheet
  const exportMarkdown = () => {
    let md = `# ${paper.title}\n`;
    md += `**Authors:** ${paper.authors.join(', ')}\n`;
    md += `**Venue:** ${paper.venue} (${paper.year}) | **DOI:** ${paper.doi}\n\n`;
    md += `## Executive Summary\n`;
    md += `${paper.executiveSummary.elevatorPitch}\n\n`;
    md += `### Problem Statement\n${paper.executiveSummary.problemStatement}\n\n`;
    md += `### Core Innovation\n${paper.executiveSummary.coreInnovation}\n\n`;
    md += `### Key Findings\n`;
    paper.executiveSummary.keyFindings.forEach(f => { md += `- ${f}\n`; });
    md += `\n## Core Concepts\n`;
    paper.concepts.forEach(c => {
      md += `### ${c.title} (${c.taxonomy})\n`;
      md += `${c.summary}\n\n> "${c.keyQuote}"\n\n**Takeaway:** ${c.takeaway}\n\n`;
    });
    md += `## Spaced Repetition Flashcards\n`;
    paper.flashcards.forEach((f, idx) => {
      md += `**Q${idx + 1} (${f.category}):** ${f.front}\n**A:** ${f.back}\n\n`;
    });
    md += `## Vocabulary & Formulas\n`;
    paper.vocabularyAndFormulas.forEach(v => {
      md += `- **${v.term}**: ${v.definition} ${v.formula ? `(\`${v.formula}\`)` : ''}\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paper.shortTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-study-guide.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // BibTeX citation
  const bibtex = `@article{${paper.authors[0]?.split(' ').pop()?.toLowerCase() || 'paper'}${paper.year},
  title={${paper.title}},
  author={${paper.authors.join(' and ')}},
  journal={${paper.venue}},
  year={${paper.year}},
  doi={${paper.doi}}
}`;

  const copyBibtex = () => {
    navigator.clipboard.writeText(bibtex);
    setCopiedType('bibtex');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172033]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7EAF0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#6259E8]" />
            <h3 className="text-[16px] font-semibold text-[#172033]">
              Export Study Deck & Artifacts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#687386] hover:text-[#172033] hover:bg-[#F8F9FC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Study Kit .TXT Export */}
          <div className="p-4 bg-[#F0EEFF]/70 border border-[#6259E8]/20 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[14px] text-[#172033] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#6259E8]" />
                <span>Paper to Prep Study Kit (.TXT)</span>
              </div>
              <p className="text-[12px] text-[#687386] mt-0.5">
                Complete text file including 50-word summary, Roman Urdu, 10 difficult words, and 5 exam questions
              </p>
            </div>
            <button
              onClick={() => {
                const sk = paper.studyKit;
                let txt = `STUDY KIT: ${paper.title}\n`;
                txt += `==================================================\n`;
                txt += `1. EXACT 50-WORD ENGLISH SUMMARY:\n`;
                txt += `${sk?.englishSummary || paper.executiveSummary.elevatorPitch}\n\n`;
                txt += `2. ROMAN URDU TRANSLATION:\n`;
                txt += `${sk?.romanUrduSummary || 'Roman Urdu summary available.'}\n\n`;
                txt += `3. 10 DIFFICULT ACADEMIC WORDS:\n`;
                (sk?.vocabulary || []).forEach((v, i) => {
                  txt += `${i + 1}. ${v.word}: ${v.romanUrduMeaning} (${v.contextualExplanation})\n`;
                });
                txt += `\n4. 5 EXAMINATION PRACTICE QUESTIONS:\n`;
                (sk?.questions || []).forEach((q, i) => {
                  txt += `Q${i + 1}: ${q.question}\nAns: ${q.answer}\n\n`;
                });
                const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${paper.shortTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-study-kit.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 bg-[#6259E8] hover:bg-[#5147D8] text-white text-[12px] font-semibold rounded-md transition-colors shrink-0 shadow-xs"
            >
              Download .TXT
            </button>
          </div>

          {/* Anki Export */}
          <div className="p-4 bg-[#F8F9FC] border border-[#E7EAF0] rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[14px] text-[#172033] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#6259E8]" />
                <span>Anki TSV Deck</span>
              </div>
              <p className="text-[12px] text-[#687386] mt-0.5">
                Import directly into Anki with pre-formatted tags and answers ({paper.flashcards.length} cards)
              </p>
            </div>
            <button
              onClick={exportAnkiTSV}
              className="px-3 py-1.5 bg-white border border-[#E7EAF0] hover:bg-[#F8F9FC] text-[#172033] text-[12px] font-semibold rounded-md transition-colors shrink-0"
            >
              Download
            </button>
          </div>

          {/* Markdown Guide */}
          <div className="p-4 bg-[#F8F9FC] border border-[#E7EAF0] rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[14px] text-[#172033] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#6259E8]" />
                <span>Markdown Study Guide</span>
              </div>
              <p className="text-[12px] text-[#687386] mt-0.5">
                Complete structured document for Obsidian, Notion, or local archives
              </p>
            </div>
            <button
              onClick={exportMarkdown}
              className="px-3 py-1.5 bg-white border border-[#E7EAF0] hover:bg-[#F8F9FC] text-[#172033] text-[12px] font-semibold rounded-md transition-colors shrink-0"
            >
              Export .md
            </button>
          </div>

          {/* BibTeX Citation Box */}
          <div className="p-4 bg-[#F8F9FC] border border-[#E7EAF0] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#172033] flex items-center gap-1.5">
                <BookMarked className="w-4 h-4 text-[#6259E8]" />
                <span>BibTeX Citation</span>
              </span>
              <button
                onClick={copyBibtex}
                className="text-[11px] font-medium text-[#6259E8] hover:underline flex items-center gap-1"
              >
                {copiedType === 'bibtex' ? <Check className="w-3 h-3 text-[#198754]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'bibtex' ? 'Copied' : 'Copy BibTeX'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-white rounded-lg border border-[#E7EAF0] font-mono text-[11px] text-[#464554] overflow-x-auto">
              {bibtex}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
