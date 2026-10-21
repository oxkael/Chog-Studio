import React, { useState } from 'react';
import { ChogCharacterArt, ChogVariant } from './ChogCharacterArt';
import { Sparkles, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface InteractiveComicSequenceProps {
  onEnterStudio: () => void;
}

interface StoryPanelData {
  id: number;
  badge: string;
  narration: string;
  dialogue: string[];
  currentDialogueIdx: number;
  variant: ChogVariant;
  bgClass: string;
  tiltClass: string;
  sfx: string;
}

export const InteractiveComicSequence = ({ onEnterStudio }: InteractiveComicSequenceProps) => {
  const [activePanel, setActivePanel] = useState<number | null>(null);
  const [peekingReaction, setPeekingReaction] = useState(false);

  // Story Panels state with interactive alternate dialogue choices
  const [panels, setPanels] = useState<StoryPanelData[]>([
    {
      id: 1,
      badge: 'SCENE 1: THE DISCOVERY',
      narration: 'Deep in the Monad blockspace, a quiet Genesis Chog made a realization...',
      dialogue: [
        '“Wait... 10,000 transactions per second and nobody made a comic strip yet?!”',
        '“Sub-second finality is cool, but what about my origin story?!”',
        '“I have traits. I have lore. It is time to create.”',
      ],
      currentDialogueIdx: 0,
      variant: 'detective',
      bgClass: 'bg-white',
      tiltClass: 'lg:-rotate-2 hover:rotate-0',
      sfx: 'GASP!',
    },
    {
      id: 2,
      badge: 'SCENE 2: THE BRAINSTORM',
      narration: 'Ideas began to flow faster than asynchronous execution...',
      dialogue: [
        '“What if Panel 2 has an oversized thought bubble pondering the mempool?”',
        '“A subtle halftone background will bring out my purple complexion!”',
        '“Four panels. Classic newspaper format. Let’s make it legendary.”',
      ],
      currentDialogueIdx: 0,
      variant: 'cyber',
      bgClass: 'bg-canvas-subtle bg-halftone-light',
      tiltClass: 'lg:rotate-1.5 hover:rotate-0',
      sfx: 'BZZT!',
    },
    {
      id: 3,
      badge: 'SCENE 3: THE ACTION SPARK',
      narration: 'With one confident keystroke, the creative studio burst to life!',
      dialogue: [
        '“POW!! Look at this resolution! No generative slop—pure deterministic art!”',
        '“I can flip my character, drop speech bubbles, and stamp sound effects!”',
        '“Saved directly in my browser, ready for high-res PNG export!”',
      ],
      currentDialogueIdx: 0,
      variant: 'hero',
      bgClass: 'bg-gradient-to-br from-brand-light via-white to-canvas-subtle',
      tiltClass: 'lg:-rotate-1 hover:rotate-0',
      sfx: 'KABOOM!!',
    },
    {
      id: 4,
      badge: 'SCENE 4: YOUR INVITATION',
      narration: 'Now the studio is open for every single Genesis Chog holder.',
      dialogue: [
        '“The stage is set. Connect your wallet and claim your panel!”',
        '“Your Chog. Your story. Bring your NFT into the strip now!”',
        '“Ready to make comic book history? Enter the studio below!”',
      ],
      currentDialogueIdx: 0,
      variant: 'classic',
      bgClass: 'bg-brand-light/50',
      tiltClass: 'lg:rotate-2 hover:rotate-0',
      sfx: 'ENTER!',
    },
  ]);

  // Cycle dialogue line on click to demonstrate editor interactivity
  const cycleDialogue = (panelId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPanels((prev) =>
      prev.map((p) => {
        if (p.id !== panelId) return p;
        const nextIdx = (p.currentDialogueIdx + 1) % p.dialogue.length;
        return { ...p, currentDialogueIdx: nextIdx };
      })
    );
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 space-y-12 relative overflow-visible">
      
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light border border-brand/25 text-xs font-black uppercase tracking-wider text-brand shadow-comic-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Comic Experience</span>
        </div>
        <h2 className="font-comic text-4xl sm:text-6xl text-ink leading-tight">
          AN EXAMPLE TALE FROM MONAD
        </h2>
        <p className="text-ink-muted font-bold text-sm sm:text-base">
          Hover or tap any panel below. Watch speech bubbles slide in, dialogue reveal, and Chogs react in real-time.
        </p>
      </div>

      {/* 4 Interactive Overlapping Comic Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pt-4">
        {panels.map((panel) => {
          const isHovered = activePanel === panel.id;
          return (
            <div
              key={panel.id}
              onMouseEnter={() => setActivePanel(panel.id)}
              onMouseLeave={() => setActivePanel(null)}
              onClick={() => setActivePanel(activePanel === panel.id ? null : panel.id)}
              className={`relative rounded-3xl comic-border-thick p-6 transition-all duration-300 cursor-pointer shadow-comic-lg ${
                panel.bgClass
              } ${panel.tiltClass} ${
                isHovered
                  ? '-translate-y-3 shadow-comic-xl ring-4 ring-brand z-20'
                  : 'z-10'
              }`}
            >
              {/* Scene Badge & Sound Effect */}
              <div className="flex items-center justify-between border-b-2 border-ink/20 pb-3 mb-4">
                <span className="font-comic text-sm tracking-wider bg-ink text-white px-2.5 py-0.5 rounded shadow-comic-sm">
                  {panel.badge}
                </span>
                <span
                  className={`font-comic text-2xl tracking-widest text-brand transition-transform duration-200 ${
                    isHovered ? 'scale-125 -rotate-6' : 'rotate-3'
                  }`}
                >
                  {panel.sfx}
                </span>
              </div>

              {/* Editorial Narration Box in Soft Face Cream */}
              <div
                className={`bg-chog-face border-2 border-ink/25 p-2.5 rounded-lg shadow-comic-sm transition-all duration-200 mb-6 ${
                  isHovered ? '-translate-y-1 border-ink/40' : ''
                }`}
              >
                <p className="text-xs font-black uppercase tracking-wider text-ink font-sans leading-tight">
                  [ {panel.narration} ]
                </p>
              </div>

              {/* Main Illustration Area */}
              <div className="relative min-h-[260px] flex items-center justify-center">
                
                {/* Responsive Chog Character Art */}
                <ChogCharacterArt
                  variant={panel.variant}
                  className="w-44 h-44 sm:w-52 sm:h-52"
                  isReacting={isHovered}
                />

                {/* Speech Bubble (Slides into view with comic tail) */}
                <div
                  className={`absolute top-0 right-0 max-w-[220px] sm:max-w-[240px] bg-white comic-border rounded-2xl p-3 shadow-comic transition-all duration-300 ${
                    isHovered
                      ? 'scale-105 -translate-y-2'
                      : 'opacity-95'
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm text-ink leading-snug">
                    {panel.dialogue[panel.currentDialogueIdx]}
                  </p>

                  {/* Interactive Next Line Prompt */}
                  <div className="mt-2 pt-1.5 border-t border-ink/15 flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase text-ink-muted">
                      Line {panel.currentDialogueIdx + 1} of {panel.dialogue.length}
                    </span>
                    <button
                      onClick={(e) => cycleDialogue(panel.id, e)}
                      title="Try another line"
                      className="flex items-center gap-1 text-[10px] font-black text-brand hover:text-brand-hover bg-brand-light px-2 py-0.5 rounded-md border border-brand/20 transition-colors"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Next Line</span>
                    </button>
                  </div>

                  {/* Speech bubble tail pointer */}
                  <div className="absolute -bottom-2.5 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-ink"></div>
                  <div className="absolute -bottom-1.5 left-[25px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-white"></div>
                </div>

              </div>

              {/* Footer hint */}
              <div className="mt-4 pt-2 border-t border-ink/15 flex items-center justify-between text-[11px] font-bold text-ink-muted">
                <span>Click "Next Line" to test speech variations</span>
                <span className="text-brand font-black">Interactive</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- SMALL STORY MOMENT: PEEKING CHOG BREAKING THE FRAME --- */}
      <div className="relative mt-20 pt-8">
        
        {/* Peeking Chog Graphic positioned directly on top of the border */}
        <div
          onClick={() => setPeekingReaction(!peekingReaction)}
          className="absolute -top-16 left-8 sm:left-16 z-30 cursor-pointer group flex items-end gap-3"
        >
          {/* Peeking Chog Character */}
          <div className="transition-transform duration-300 group-hover:-translate-y-2">
            <ChogCharacterArt
              variant="peeking"
              className="w-24 h-24 sm:w-28 sm:h-28"
              isReacting={peekingReaction}
            />
          </div>

          {/* Interactive Speech Pop-Out */}
          <div className="bg-white comic-border rounded-xl px-3 py-2 shadow-comic -translate-y-6 group-hover:-translate-y-8 transition-transform">
            <p className="font-comic text-xs sm:text-sm text-ink flex items-center gap-1.5">
              <span>{peekingReaction ? '✨ "See you inside the studio!"' : '👀 "Psst! Tap me to peek!"'}</span>
            </p>
            {/* Tail to the left */}
            <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-ink"></div>
            <div className="absolute -bottom-1 left-[17px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-white"></div>
          </div>
        </div>

        {/* Studio Invitation Banner */}
        <div className="bg-white rounded-3xl comic-border-thick p-8 sm:p-12 shadow-comic-lg flex flex-col md:flex-row items-center justify-between gap-8 relative z-20">
          
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-brand">
              <Zap className="w-4 h-4 fill-brand" />
              <span>Full Creative Control Awaits</span>
            </div>
            <h3 className="font-comic text-3xl sm:text-5xl text-ink leading-tight">
              LIKE WHAT YOU SEE? MAKE YOUR OWN STRIP.
            </h3>
            <p className="text-sm sm:text-base text-ink-muted font-medium max-w-xl">
              Your Chog Genesis NFT is ready to jump into the panels. Position your character, write hilarious dialogue, choose backgrounds, and export in seconds.
            </p>
          </div>

          <button
            onClick={onEnterStudio}
            className="flex-shrink-0 flex items-center gap-3 btn-periwinkle font-black text-lg px-8 py-5 rounded-2xl comic-border shadow-comic-lg comic-shadow-hover transition-all active:translate-x-1 active:translate-y-1"
          >
            <span>LAUNCH STUDIO EDITOR</span>
            <ArrowRight className="w-5 h-5" />
          </button>

        </div>

      </div>

    </section>
  );
};
