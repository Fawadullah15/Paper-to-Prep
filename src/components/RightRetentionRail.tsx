import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  Brain, 
  Zap, 
  Sigma, 
  Award, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { PaperData } from '../types';

interface RightRetentionRailProps {
  paper: PaperData;
  masteryPercentage: number;
  reviewedCardsCount: number;
  totalCardsCount: number;
  quizScore: { correct: number; total: number } | null;
  onOpenTab: (tab: any) => void;
}

export const RightRetentionRail: React.FC<RightRetentionRailProps> = ({
  paper,
  masteryPercentage,
  reviewedCardsCount,
  totalCardsCount,
  quizScore,
  onOpenTab,
}) => {
  // Focus Study Timer (25 min default Pomodoro)
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formulas = paper.vocabularyAndFormulas.filter(v => v.isFormula || v.formula);

  return (
    <aside className="w-full space-y-4">
      
      {/* Retention & Mastery Meter Card */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#6259E8]" />
            <h3 className="text-[12px] font-semibold text-[#172033] uppercase tracking-wider">
              Cognitive Retention
            </h3>
          </div>
          <span className="text-[14px] font-bold text-[#6259E8]">
            {masteryPercentage}%
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full h-2 bg-[#F0EEFF] rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-[#6259E8] rounded-full transition-all duration-500"
            style={{ width: `${Math.max(8, masteryPercentage)}%` }}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-center text-[12px] pt-1">
          <div className="p-2 bg-[#F8F9FC] rounded-lg border border-[#E7EAF0]">
            <div className="font-semibold text-[#172033]">
              {reviewedCardsCount} / {totalCardsCount}
            </div>
            <div className="text-[11px] text-[#687386]">SRS Cards Done</div>
          </div>

          <div className="p-2 bg-[#F8F9FC] rounded-lg border border-[#E7EAF0]">
            <div className="font-semibold text-[#172033]">
              {quizScore ? `${quizScore.correct}/${quizScore.total}` : 'Unattempted'}
            </div>
            <div className="text-[11px] text-[#687386]">Quiz Accuracy</div>
          </div>
        </div>

        {/* Quick jump to practice */}
        <button
          onClick={() => onOpenTab('flashcards')}
          className="mt-3 w-full py-2 bg-[#F0EEFF] hover:bg-[#E0DEEF] text-[#6259E8] text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Launch Spaced Repetition</span>
        </button>
      </div>

      {/* Focus Sprint Pomodoro Timer */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#687386]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#687386]">
              Deep Work Sprint
            </span>
          </div>
          <span className="text-[15px] font-mono font-bold text-[#172033]">
            {formatTimer(timerSeconds)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setTimerActive(!timerActive)}
            className={`flex-1 py-1.5 text-[12px] font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
              timerActive 
                ? 'bg-[#E7EAF0] text-[#172033] hover:bg-[#D6DAE1]' 
                : 'bg-[#6259E8] text-white hover:bg-[#5147D8]'
            }`}
          >
            {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{timerActive ? 'Pause' : 'Start Focus'}</span>
          </button>
          
          <button
            onClick={() => {
              setTimerActive(false);
              setTimerSeconds(25 * 60);
            }}
            title="Reset to 25m"
            className="p-1.5 rounded-md border border-[#E7EAF0] text-[#687386] hover:bg-[#F8F9FC] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Key Formula Quick Sheet */}
      {formulas.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sigma className="w-4 h-4 text-[#6259E8]" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#687386]">
                Formula Quick-Sheet
              </h3>
            </div>
            <button
              onClick={() => onOpenTab('vocabulary')}
              className="text-[11px] font-medium text-[#6259E8] hover:underline"
            >
              View Matrix
            </button>
          </div>

          <div className="space-y-2.5">
            {formulas.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className="p-2.5 bg-[#F8F9FC] border border-[#E7EAF0] rounded-lg text-[12px]"
              >
                <div className="font-semibold text-[#172033] mb-1">
                  {item.term}
                </div>
                <div className="font-mono text-[11px] text-[#6259E8] bg-[#F0EEFF] px-2 py-1 rounded border border-[#6259E8]/10 overflow-x-auto whitespace-pre-wrap">
                  {item.formula}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
};
