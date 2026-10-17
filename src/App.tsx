import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Brain, 
  HelpCircle, 
  Sigma, 
  BookOpen, 
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Network
} from 'lucide-react';
import { Header } from './components/Header';
import { LeftSourceRail } from './components/LeftSourceRail';
import { RightRetentionRail } from './components/RightRetentionRail';
import { StudyKitView } from './components/StudyKitView';
import { PaperInputCard } from './components/PaperInputCard';
import { ExecutiveSummaryView } from './components/ExecutiveSummaryView';
import { ConceptAccordionsView } from './components/ConceptAccordionsView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { VocabularyMatrixView } from './components/VocabularyMatrixView';
import { SourceInspectorView } from './components/SourceInspectorView';
import { AudioStudyBar } from './components/AudioStudyBar';
import { SynthesizeModal } from './components/SynthesizeModal';
import { ExportModal } from './components/ExportModal';
import { BENCHMARK_PAPERS } from './data/benchmarkPapers';
import { PaperData, StudyTab, SRSInterval } from './types';
import { StudyKitResponse } from './types/studyKit';

export default function App() {
  const [papers, setPapers] = useState<PaperData[]>(BENCHMARK_PAPERS);
  const [currentPaperId, setCurrentPaperId] = useState<string>(BENCHMARK_PAPERS[0].id);
  const [activeTab, setActiveTab] = useState<StudyTab>('studykit');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isSynthesizeOpen, setIsSynthesizeOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reviewedCards, setReviewedCards] = useState<Record<string, SRSInterval>>({});
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const currentPaper = papers.find(p => p.id === currentPaperId) || papers[0];

  // Retention mastery calculation
  const totalCards = currentPaper.flashcards.length;
  const reviewedCount = Object.keys(reviewedCards).length;
  const masteryPercentage = Math.min(
    100,
    Math.round(
      (reviewedCount / Math.max(1, totalCards)) * 60 + 
      (quizScore ? (quizScore.correct / Math.max(1, quizScore.total)) * 40 : 15)
    )
  );

  const handleSelectPaper = (paper: PaperData) => {
    setCurrentPaperId(paper.id);
    setActiveTab('studykit');
    setReviewedCards({});
    setQuizScore(null);
  };

  const handleStudyKitGenerated = (studyKit: StudyKitResponse, fullPaper: PaperData) => {
    const paperWithKit: PaperData = {
      ...fullPaper,
      studyKit,
    };
    setPapers(prev => [paperWithKit, ...prev]);
    setCurrentPaperId(paperWithKit.id);
    setActiveTab('studykit');
    setReviewedCards({});
    setQuizScore(null);
  };

  const handlePaperSynthesized = (newPaper: PaperData) => {
    setPapers(prev => [newPaper, ...prev]);
    setCurrentPaperId(newPaper.id);
    setActiveTab('studykit');
    setReviewedCards({});
    setQuizScore(null);
  };

  const handleReviewCard = (cardId: string, interval: SRSInterval) => {
    setReviewedCards(prev => ({
      ...prev,
      [cardId]: interval,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#172033] flex flex-col font-sans antialiased pb-28">
      
      {/* Top Header */}
      <Header
        papers={papers}
        currentPaper={currentPaper}
        onSelectPaper={handleSelectPaper}
        onOpenSynthesize={() => setIsSynthesizeOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        masteryPercentage={masteryPercentage}
        readingFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
      />

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 py-3.5 sm:py-6 flex-1 w-full max-w-full overflow-x-hidden">
        
        {/* Mobile Subheader & Drawer Trigger */}
        <div className="md:hidden flex flex-col gap-2.5 pb-3 border-b border-[#E7EAF0] mb-4 max-w-full">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E7EAF0] rounded-md text-[12px] font-medium text-[#172033]"
            >
              {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>Outline & Modules</span>
            </button>

            <span className="text-[11px] font-medium text-[#687386]">
              Mastery: <span className="font-semibold text-[#6259E8]">{masteryPercentage}%</span>
            </span>
          </div>

          {/* Mobile Paper Selector */}
          <div className="relative w-full">
            <select
              value={currentPaper.id}
              onChange={(e) => {
                const found = papers.find(p => p.id === e.target.value);
                if (found) handleSelectPaper(found);
              }}
              className="w-full h-[36px] px-3 text-[12px] font-medium text-[#172033] bg-white border border-[#E7EAF0] rounded-md focus:outline-none focus:border-[#6259E8] truncate cursor-pointer"
            >
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  📄 {p.title} ({p.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Drawer view */}
        {mobileDrawerOpen && (
          <div className="lg:hidden mb-6 p-3 sm:p-4 bg-white rounded-xl border border-[#E7EAF0] shadow-sm animate-in fade-in max-w-full overflow-hidden">
            <LeftSourceRail
              paper={currentPaper}
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setMobileDrawerOpen(false);
              }}
              onOpenSourceInspector={() => {
                setActiveTab('source');
                setMobileDrawerOpen(false);
              }}
            />
          </div>
        )}

        {/* Responsive Desktop 12-Column Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start max-w-full">
          
          {/* LEFT RAIL (3 cols on desktop): Paper Metadata, Outline, Methodology */}
          {!isFocusMode && (
            <div className="hidden lg:block lg:col-span-3 sticky top-20">
              <LeftSourceRail
                paper={currentPaper}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onOpenSourceInspector={() => setActiveTab('source')}
              />
            </div>
          )}

          {/* CENTER SYNTHESIS WORKBENCH (6 or 9 or 12 cols depending on Focus Mode / Graph tab) */}
          <div className={`${
            isFocusMode 
              ? 'lg:col-span-12' 
              : activeTab === 'graph'
              ? 'lg:col-span-9 xl:col-span-9'
              : 'lg:col-span-6 xl:col-span-6'
          } space-y-4 sm:space-y-6 min-w-0 max-w-full`}>

            {/* Main Research Paper Input Hero Card (Paste Text or Upload PDF) */}
            <PaperInputCard
              onStudyKitGenerated={handleStudyKitGenerated}
              isLoading={isGenerating}
              setIsLoading={setIsGenerating}
            />

            {/* Segmented View Switcher Tabs (Enclosed segmented pill track with #F8F9FC background) */}
            <div className="bg-[#F1F3FF] p-1 rounded-xl border border-[#E7EAF0] flex items-center overflow-x-auto no-scrollbar shadow-2xs max-w-full touch-pan-x">
              {[
                { id: 'studykit', label: 'Study Kit (4-in-1)', icon: Sparkles },
                { id: 'summary', label: 'Summary', icon: FileText },
                { id: 'concepts', label: 'Concepts', count: currentPaper.concepts.length, icon: Brain },
                { id: 'graph', label: 'Knowledge Graph', icon: Network },
                { id: 'flashcards', label: 'Flashcards', count: currentPaper.flashcards.length, icon: Layers },
                { id: 'quiz', label: 'Practice Quiz', count: currentPaper.quiz.length, icon: HelpCircle },
                { id: 'vocabulary', label: 'Formulas & Vocab', count: currentPaper.vocabularyAndFormulas.length, icon: Sigma },
                { id: 'source', label: 'Source', icon: BookOpen },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as StudyTab)}
                    className={`shrink-0 min-w-max px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-white text-[#172033] font-semibold shadow-xs'
                        : 'text-[#687386] hover:text-[#172033]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#6259E8]' : 'text-[#687386]'}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-[#F0EEFF] text-[#6259E8]' : 'bg-[#E7EAF0] text-[#687386]'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Tab View Rendering */}
            <div className="transition-all animate-in fade-in duration-150">
              {activeTab === 'studykit' && (
                currentPaper.studyKit ? (
                  <StudyKitView
                    studyKit={currentPaper.studyKit}
                    isFocusMode={isFocusMode}
                    onExploreModule={(tab) => setActiveTab(tab as StudyTab)}
                  />
                ) : (
                  <div className="bg-white rounded-xl border border-[#E7EAF0] p-8 text-center space-y-3">
                    <Sparkles className="w-8 h-8 text-[#6259E8] mx-auto animate-pulse" />
                    <h3 className="text-[16px] font-bold text-[#172033]">
                      No Study Kit Generated Yet
                    </h3>
                    <p className="text-[13px] text-[#687386] max-w-md mx-auto">
                      Use the card above to paste your manuscript or upload a PDF to generate the 50-word summary, Roman Urdu translation, 10 difficult words, and 5 exam questions.
                    </p>
                  </div>
                )
              )}

              {activeTab === 'summary' && (
                <ExecutiveSummaryView
                  paper={currentPaper}
                  isFocusMode={isFocusMode}
                />
              )}

              {activeTab === 'concepts' && (
                <ConceptAccordionsView
                  concepts={currentPaper.concepts}
                  isFocusMode={isFocusMode}
                />
              )}

              {activeTab === 'graph' && (
                <KnowledgeGraphView
                  paper={currentPaper}
                  onNavigateToTab={(tab, id) => setActiveTab(tab as StudyTab)}
                  isFocusMode={isFocusMode}
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardsView
                  flashcards={currentPaper.flashcards}
                  onReviewCard={handleReviewCard}
                  isFocusMode={isFocusMode}
                />
              )}

              {activeTab === 'quiz' && (
                <QuizView
                  questions={currentPaper.quiz}
                  onQuizComplete={setQuizScore}
                  isFocusMode={isFocusMode}
                />
              )}

              {activeTab === 'vocabulary' && (
                <VocabularyMatrixView
                  items={currentPaper.vocabularyAndFormulas}
                  isFocusMode={isFocusMode}
                />
              )}

              {activeTab === 'source' && (
                <SourceInspectorView
                  paper={currentPaper}
                  isFocusMode={isFocusMode}
                />
              )}
            </div>

          </div>

          {/* RIGHT RETENTION RAIL (3 cols on desktop): Mastery Meter, Pomodoro, Formula Cheat Sheet */}
          {!isFocusMode && activeTab !== 'graph' && (
            <div className="hidden xl:block xl:col-span-3 sticky top-20">
              <RightRetentionRail
                paper={currentPaper}
                masteryPercentage={masteryPercentage}
                reviewedCardsCount={reviewedCount}
                totalCardsCount={totalCards}
                quizScore={quizScore}
                onOpenTab={setActiveTab}
              />
            </div>
          )}

        </div>

      </main>

      {/* Floating Audio Study Bar (Anchored at viewport bottom) */}
      <AudioStudyBar
        audio={currentPaper.audioBriefing}
        paperTitle={currentPaper.title}
      />

      {/* Synthesize Paper Modal */}
      <SynthesizeModal
        isOpen={isSynthesizeOpen}
        onClose={() => setIsSynthesizeOpen(false)}
        onPaperSynthesized={handlePaperSynthesized}
      />

      {/* Export Study Deck Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        paper={currentPaper}
      />

    </div>
  );
}
