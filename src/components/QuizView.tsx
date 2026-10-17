import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  RotateCcw, 
  ChevronRight,
  BookMarked,
  Sparkles,
  Layers
} from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: { correct: number; total: number }) => void;
  isFocusMode: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  onQuizComplete,
  isFocusMode,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (submittedAnswers[questionIdx]) return; // locked after submit
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  const handleSubmitQuestion = (questionIdx: number) => {
    if (selectedAnswers[questionIdx] === undefined) return;
    setSubmittedAnswers(prev => ({
      ...prev,
      [questionIdx]: true
    }));

    // Check if all submitted
    const newSubmitted = { ...submittedAnswers, [questionIdx]: true };
    if (Object.keys(newSubmitted).length === questions.length) {
      setIsQuizFinished(true);
      let correct = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) correct++;
      });
      onQuizComplete({ correct, total: questions.length });
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setIsQuizFinished(false);
  };

  // Calculate score
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (submittedAnswers[idx] && selectedAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });

  return (
    <div className={`space-y-6 ${isFocusMode ? 'max-w-[68ch] mx-auto' : 'max-w-4xl'}`}>
      
      {/* Quiz Top Status Bar */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F0EEFF] text-[#6259E8] flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#172033]">
              Board & Graduate Exam Prep
            </h3>
            <p className="text-[12px] text-[#687386]">
              {questions.length} clinical & theoretical multiple-choice challenges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[13px] font-semibold text-[#172033]">
            Score: <span className="text-[#6259E8]">{correctCount}</span> / {questions.length}
          </div>
          <button
            onClick={handleReset}
            title="Reset Quiz"
            className="p-1.5 rounded-md border border-[#E7EAF0] text-[#687386] hover:text-[#172033] hover:bg-[#F8F9FC] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {isQuizFinished && (
        <div className="bg-[#F0EEFF] border border-[#6259E8]/30 rounded-xl p-5 shadow-xs flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#6259E8] font-semibold text-[15px] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Assessment Completed!</span>
            </div>
            <p className="text-[13px] text-[#464554]">
              You achieved {Math.round((correctCount / questions.length) * 100)}% accuracy. Review the rationale breakdowns below.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#6259E8] text-white text-[13px] font-semibold rounded-md shadow-xs hover:bg-[#5147D8] transition-colors shrink-0"
          >
            Retake Quiz
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const isSubmitted = Boolean(submittedAnswers[qIdx]);
          const selectedOption = selectedAnswers[qIdx];
          const isCorrect = selectedOption === q.correctIndex;

          return (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-[#E7EAF0] p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#F8F9FC] border border-[#E7EAF0] text-[12px] font-semibold text-[#6259E8] flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <h4 className="text-[15px] sm:text-[16px] font-semibold text-[#172033] leading-relaxed">
                    {q.question}
                  </h4>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selectedOption === optIdx;
                  const isThisCorrect = optIdx === q.correctIndex;

                  let optionStyle = "bg-[#F8F9FC] border-[#E7EAF0] text-[#172033] hover:bg-[#F0EEFF]/50";
                  if (isSubmitted) {
                    if (isThisCorrect) {
                      optionStyle = "bg-[#198754]/10 border-[#198754]/40 text-[#198754] font-medium";
                    } else if (isThisSelected && !isThisCorrect) {
                      optionStyle = "bg-[#FFDAD6]/50 border-[#ba1a1a]/40 text-[#ba1a1a]";
                    } else {
                      optionStyle = "bg-[#F8F9FC] border-[#E7EAF0] opacity-60 text-[#687386]";
                    }
                  } else if (isThisSelected) {
                    optionStyle = "bg-[#F0EEFF] border-[#6259E8] text-[#6259E8] font-medium shadow-xs";
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`w-full text-left p-3.5 rounded-lg border text-[13px] sm:text-[14px] leading-relaxed transition-all flex items-start justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-[12px] font-semibold opacity-70 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isSubmitted && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0 mt-0.5" />
                      )}
                      {isSubmitted && isThisSelected && !isThisCorrect && (
                        <XCircle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action row: Submit or Rationale */}
              {!isSubmitted ? (
                <div className="pt-2 flex justify-end">
                  <button
                    disabled={selectedOption === undefined}
                    onClick={() => handleSubmitQuestion(qIdx)}
                    className="inline-flex items-center gap-1.5 px-4 h-[36px] text-[13px] font-medium text-white bg-[#6259E8] hover:bg-[#5147D8] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-all shadow-xs"
                  >
                    <span>Check Rationale</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-[#E7EAF0] space-y-2">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="text-[12px] font-bold text-[#198754] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct Formulation
                      </span>
                    ) : (
                      <span className="text-[12px] font-bold text-[#ba1a1a] flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Incorrect Option
                      </span>
                    )}

                    {q.citationAnchor && (
                      <span className="text-[11px] font-medium text-[#687386] bg-[#F8F9FC] px-2 py-0.5 rounded border border-[#E7EAF0] ml-auto">
                        Anchor: {q.citationAnchor}
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-[#F8F9FC] rounded-lg border border-[#E7EAF0] text-[13px] leading-relaxed text-[#464554]">
                    <span className="font-semibold text-[#172033] mr-1">Rationale:</span>
                    {q.explanation}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
