import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2,
  Clock,
  Zap,
  Layers
} from 'lucide-react';
import { Flashcard, SRSInterval } from '../types';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  onReviewCard: (cardId: string, interval: SRSInterval) => void;
  isFocusMode: boolean;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  flashcards,
  onReviewCard,
  isFocusMode,
}) => {
  const [deck, setDeck] = useState<Flashcard[]>(flashcards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [reviewedCount, setReviewedCount] = useState<number>(0);

  // Sync if input changes
  useEffect(() => {
    setDeck(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  }, [flashcards]);

  const currentCard = deck[currentIndex] || deck[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev - 1 + deck.length) % deck.length);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleRate = (interval: SRSInterval) => {
    if (!currentCard) return;
    onReviewCard(currentCard.id, interval);
    setReviewedCount(r => r + 1);
    handleNext();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleRate('Again (<10m)');
        else if (e.key === '2') handleRate('Hard (1d)');
        else if (e.key === '3') handleRate('Good (3d)');
        else if (e.key === '4') handleRate('Easy (7d)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentCard]);

  // Categories
  const categories = Array.from(new Set(flashcards.map(f => f.category)));

  const filteredDeck = selectedCategory === 'all' 
    ? deck 
    : deck.filter(f => f.category === selectedCategory);

  const activeCard = filteredDeck[currentIndex] || filteredDeck[0] || currentCard;

  return (
    <div className={`space-y-6 ${isFocusMode ? 'max-w-[68ch] mx-auto' : 'max-w-3xl'}`}>
      
      {/* Top Deck Controls & Category Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E7EAF0] text-[12px] font-semibold text-[#172033]">
            <Layers className="w-3.5 h-3.5 text-[#6259E8]" />
            <span>Card {currentIndex + 1} of {filteredDeck.length}</span>
          </div>
          {reviewedCount > 0 && (
            <span className="text-[12px] font-medium text-[#198754] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{reviewedCount} reviewed this session</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="Shuffle Deck"
            className="p-2 rounded-md bg-white border border-[#E7EAF0] text-[#687386] hover:text-[#172033] hover:bg-[#F8F9FC] transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setShowHint(false);
            }}
            title="Reset Deck to Start"
            className="p-2 rounded-md bg-white border border-[#E7EAF0] text-[#687386] hover:text-[#172033] hover:bg-[#F8F9FC] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => { setSelectedCategory('all'); setCurrentIndex(0); setIsFlipped(false); }}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#6259E8] text-white shadow-xs'
              : 'bg-white text-[#687386] border border-[#E7EAF0] hover:text-[#172033]'
          }`}
        >
          All Cards ({deck.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#6259E8] text-white shadow-xs'
                : 'bg-white text-[#687386] border border-[#E7EAF0] hover:text-[#172033]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3D Flashcard Container */}
      <div className="perspective-1000 w-full min-h-[340px] cursor-pointer" onClick={handleFlip}>
        <div 
          className={`relative w-full min-h-[340px] rounded-2xl border border-[#E7EAF0] bg-white transition-transform duration-300 transform-style-3d shadow-sm hover:shadow-md ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 w-full h-full p-4 sm:p-8 flex flex-col justify-between backface-hidden bg-white rounded-2xl">
            
            {/* Front Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#F0EEFF] text-[#6259E8] truncate max-w-[150px]">
                {activeCard?.category}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#687386] bg-[#F8F9FC] px-2 py-0.5 rounded-md border border-[#E7EAF0] shrink-0">
                <Clock className="w-3 h-3 text-[#6259E8]" />
                <span>Interval: {activeCard?.srsInterval}</span>
              </div>
            </div>

            {/* Front Question Content */}
            <div className="my-auto py-4 sm:py-6">
              <h3 className="text-[17px] sm:text-[22px] font-semibold text-[#172033] leading-snug sm:leading-relaxed tracking-tight break-words">
                {activeCard?.front}
              </h3>

              {/* Hint Box */}
              {activeCard?.hint && showHint && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="mt-4 p-3 bg-[#F8F9FC] rounded-lg border border-[#E7EAF0] text-[13px] text-[#687386] flex items-start gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-[#6259E8] shrink-0 mt-0.5" />
                  <span>{activeCard.hint}</span>
                </div>
              )}
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E7EAF0]/80 text-[12px] text-[#687386]">
              {activeCard?.hint ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="inline-flex items-center gap-1 text-[#6259E8] hover:underline font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Reveal Hint'}</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-1 text-[#687386] font-medium">
                <RotateCw className="w-3.5 h-3.5 text-[#6259E8]" />
                <span>Click or Space to flip</span>
              </div>
            </div>

          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 w-full h-full p-4 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 bg-white rounded-2xl">
            
            {/* Back Header */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#198754]/10 text-[#198754]">
                Answer & Synthesis
              </span>
              <span className="text-[11px] font-mono text-[#687386]">
                SRS Review Stage
              </span>
            </div>

            {/* Back Answer Content */}
            <div className="my-auto py-3 sm:py-4">
              <div className="text-[14px] sm:text-[16px] leading-[24px] sm:leading-[26px] text-[#172033] font-normal break-words">
                {activeCard?.back}
              </div>
            </div>

            {/* SRS Rating Buttons on Back */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="pt-3 sm:pt-4 border-t border-[#E7EAF0] space-y-2"
            >
              <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#687386] text-center">
                Rate Retention (1-4)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleRate('Again (<10m)')}
                  className="py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-lg bg-[#FFDAD6]/50 hover:bg-[#FFDAD6] border border-[#ba1a1a]/20 text-[#ba1a1a] text-[11px] sm:text-[12px] font-semibold flex flex-col items-center transition-all active:scale-95"
                >
                  <span>Again</span>
                  <span className="text-[9px] sm:text-[10px] font-normal text-[#ba1a1a]/80">&lt;10m (1)</span>
                </button>

                <button
                  onClick={() => handleRate('Hard (1d)')}
                  className="py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-lg bg-[#F8F9FC] hover:bg-[#E7EAF0] border border-[#E7EAF0] text-[#172033] text-[11px] sm:text-[12px] font-semibold flex flex-col items-center transition-all active:scale-95"
                >
                  <span>Hard</span>
                  <span className="text-[9px] sm:text-[10px] font-normal text-[#687386]">1 day (2)</span>
                </button>

                <button
                  onClick={() => handleRate('Good (3d)')}
                  className="py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-lg bg-[#F0EEFF] hover:bg-[#E0DEEF] border border-[#6259E8]/20 text-[#6259E8] text-[11px] sm:text-[12px] font-semibold flex flex-col items-center transition-all active:scale-95"
                >
                  <span>Good</span>
                  <span className="text-[9px] sm:text-[10px] font-normal text-[#6259E8]/80">3 days (3)</span>
                </button>

                <button
                  onClick={() => handleRate('Easy (7d)')}
                  className="py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-lg bg-[#198754]/10 hover:bg-[#198754]/20 border border-[#198754]/20 text-[#198754] text-[11px] sm:text-[12px] font-semibold flex flex-col items-center transition-all active:scale-95"
                >
                  <span>Easy</span>
                  <span className="text-[9px] sm:text-[10px] font-normal text-[#198754]/80">7 days (4)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Navigation Arrow Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <button
          onClick={handlePrev}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 h-[36px] sm:h-[38px] text-[12px] sm:text-[13px] font-medium text-[#172033] bg-white border border-[#E7EAF0] rounded-md hover:bg-[#F8F9FC] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-[11px] sm:text-[12px] text-[#687386] font-medium hidden sm:block">
          Use ← / → arrows to navigate · Space to flip
        </div>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 h-[36px] sm:h-[38px] text-[12px] sm:text-[13px] font-medium text-[#172033] bg-white border border-[#E7EAF0] rounded-md hover:bg-[#F8F9FC] transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
