import React from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Crosshair, 
  Compass, 
  ArrowRight,
  Sparkles,
  Quote
} from 'lucide-react';
import { PaperData } from '../types';

interface ExecutiveSummaryViewProps {
  paper: PaperData;
  isFocusMode: boolean;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  paper,
  isFocusMode,
}) => {
  const { executiveSummary } = paper;

  return (
    <div className={`space-y-8 ${isFocusMode ? 'max-w-[68ch] mx-auto' : 'max-w-4xl'}`}>
      
      {/* Elevator Pitch Box ("In 3 Sentences") */}
      <div className="bg-[#F0EEFF] border border-[#6259E8]/20 rounded-xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-[#6259E8] text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#6259E8]">
            Executive Brief · In 3 Sentences
          </span>
        </div>
        <p className="text-[16px] leading-[26px] text-[#172033] font-medium">
          {executiveSummary.elevatorPitch}
        </p>
      </div>

      {/* The Problem Solved & Core Innovation (Dual Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* The Problem Solved */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-[#ba1a1a]">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#172033]">
              The Problem Solved
            </h3>
          </div>
          <p className="text-[14px] leading-[23px] text-[#464554]">
            {executiveSummary.problemStatement}
          </p>
        </div>

        {/* The Core Innovation */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-[#6259E8]">
            <Lightbulb className="w-4 h-4" />
            <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#172033]">
              Core Methodological Novelty
            </h3>
          </div>
          <p className="text-[14px] leading-[23px] text-[#464554]">
            {executiveSummary.coreInnovation}
          </p>
        </div>

      </div>

      {/* Key Empirical Findings & Metrics */}
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-[#198754]" />
          <h3 className="text-[20px] font-semibold tracking-tight text-[#172033]">
            Key Empirical Findings & Benchmarks
          </h3>
        </div>

        <div className="space-y-3">
          {executiveSummary.keyFindings.map((finding, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-xl border border-[#E7EAF0] p-4 flex items-start gap-3.5 shadow-xs hover:border-[#D6DAE1] transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-[#198754]/10 text-[#198754] flex items-center justify-center shrink-0 mt-0.5 text-[12px] font-bold">
                ✓
              </div>
              <p className="text-[14px] leading-[23px] text-[#172033]">
                {finding}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Limitations, Critique & Future Directions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        
        {/* Limitations & Academic Critique */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-[#687386]">
            <Crosshair className="w-4 h-4 text-[#6259E8]" />
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#172033]">
              Limitations & Rigorous Critique
            </h4>
          </div>
          <ul className="space-y-2.5 text-[13px] text-[#464554] leading-relaxed">
            {executiveSummary.limitationsAndCritique.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#6259E8] font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Future Horizons */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-[#687386]">
            <Compass className="w-4 h-4 text-[#6259E8]" />
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#172033]">
              Downstream Horizons & Impact
            </h4>
          </div>
          <ul className="space-y-2.5 text-[13px] text-[#464554] leading-relaxed">
            {executiveSummary.futureDirections.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#6259E8] font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};
