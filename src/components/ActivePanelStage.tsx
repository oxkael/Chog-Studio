import React, { useRef } from 'react';
import { ComicPanel, SpeechBubble, MovableSFX } from '../types/comic';
import { ComicSceneIllustration } from './ComicSceneIllustrations';
import { ChogCharacterArt } from './ChogCharacterArt';
import { ComicScreenTones } from './ComicScreenTones';

interface ActivePanelStageProps {
  panel: ComicPanel;
  selectedElement: { type: 'character' | 'bubble' | 'sfx' | 'scene' | 'drama'; id?: string };
  onSelectElement: (element: { type: 'character' | 'bubble' | 'sfx' | 'scene' | 'drama'; id?: string }) => void;
  onUpdateBubble: (bubbleId: string, updates: Partial<SpeechBubble>) => void;
  onDeleteBubble: (bubbleId: string) => void;
  onUpdateSFX: (sfxId: string, updates: Partial<MovableSFX>) => void;
  onDeleteSFX: (sfxId: string) => void;
}

export const ActivePanelStage: React.FC<ActivePanelStageProps> = ({
  panel,
  selectedElement,
  onSelectElement,
  onUpdateBubble,
  onDeleteBubble,
  onUpdateSFX,
  onDeleteSFX,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);

  // Drag handler helper for SFX
  const handleSFXMouseDown = (e: React.MouseEvent, sfxId: string) => {
    e.stopPropagation();
    onSelectElement({ type: 'sfx', id: sfxId });

    const stage = stageRef.current;
    if (!stage) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const rawX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const rawY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      const clampedX = Math.max(5, Math.min(95, Math.round(rawX)));
      const clampedY = Math.max(5, Math.min(95, Math.round(rawY)));
      onUpdateSFX(sfxId, { x: clampedX, y: clampedY });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Camera shot type transformations
  const isCloseUp = panel.shotType === 'close-up';
  const isTilt = panel.shotType === 'dramatic-tilt';
  const isCinematic = panel.shotType === 'cinematic-wide';

  const characterScaleMultiplier = isCloseUp ? 1.6 : 1.0;
  const characterYShift = isCloseUp ? -8 : 0;

  return (
    <div className="w-full flex flex-col items-center select-none">
      
      {/* Panel Top Info Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-2 text-xs font-black uppercase text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 btn-periwinkle rounded-lg flex items-center justify-center font-comic text-sm">
            {panel.id}
          </span>
          <span className="text-ink font-comic text-lg tracking-wide">
            PANEL #{panel.id} {panel.shotType && `• ${panel.shotType.replace('-', ' ').toUpperCase()}`}
          </span>
        </div>
        <span className="text-[11px] font-bold text-ink-muted">
          Click elements to direct camera, drama & text
        </span>
      </div>

      {/* The Big Stage Canvas */}
      <div
        ref={stageRef}
        onClick={() => onSelectElement({ type: 'scene' })}
        className={`relative w-full max-w-2xl aspect-square sm:aspect-[4/3] rounded-3xl comic-border-thick overflow-hidden shadow-comic-lg bg-white transition-all cursor-pointer ${
          isTilt ? 'rotate-[-1.5deg]' : ''
        }`}
      >
        {/* Layer 1: Illustrated Comic Scene Background */}
        <div className="absolute inset-0 z-0">
          <ComicSceneIllustration scene={panel.scene} />
        </div>

        {/* Cinematic Letterbox Bars */}
        {isCinematic && (
          <>
            <div className="absolute top-0 left-0 right-0 h-10 bg-ink z-25 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-ink z-25 pointer-events-none" />
          </>
        )}

        {/* Layer 2: Screen Tone Overlays (Gloom Despair Lines, Radial Action Speedlines, Halftone) */}
        <ComicScreenTones type={panel.screenTone} />

        {/* Cinematic Narration Caption Bar */}
        {panel.captionBar && panel.captionBar.text && (
          <div
            className={`absolute left-0 right-0 z-35 bg-chog-face border-y-2 border-ink px-4 py-2 flex items-center shadow-comic-sm ${
              panel.captionBar.position === 'bottom' ? 'bottom-0' : 'top-0'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-brand mr-2 animate-pulse" />
            <span className="font-comic text-xs sm:text-sm uppercase tracking-wider text-ink font-black">
              {panel.captionBar.text}
            </span>
          </div>
        )}

        {/* Layer 3: Character with 3 Art Treatment Modes + Camera Shot Framing */}
        {panel.character && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement({ type: 'character' });
            }}
            className={`absolute z-10 cursor-move transition-transform duration-100 flex items-center justify-center ${
              selectedElement.type === 'character' ? 'ring-4 ring-brand rounded-2xl' : ''
            }`}
            style={{
              left: `${panel.character.x}%`,
              top: `${panel.character.y + characterYShift}%`,
              transform: `translate(-50%, -50%) scale(${panel.character.scale * characterScaleMultiplier}) ${
                panel.character.flipHorizontal ? 'scaleX(-1)' : ''
              } ${isTilt ? 'rotate-[-3deg]' : ''}`,
            }}
          >
            {/* Mode A: Clean Original NFT Image */}
            {panel.character.artMode === 'original' && (
              <div className="relative group">
                <img
                  src={panel.character.imageUrl}
                  alt={panel.character.name}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-2xl comic-border shadow-comic"
                  draggable={false}
                />
              </div>
            )}

            {/* Mode B: Comic Composition Sticker Treatment (Offset Backing + Speed Frame) */}
            {panel.character.artMode === 'framed' && (
              <div className="relative group">
                {/* Comic Sticker Offset Shadow */}
                <div className="absolute inset-0 bg-brand rounded-3xl comic-border translate-x-3 translate-y-3 -z-10"></div>
                <div className="bg-white p-2.5 rounded-3xl comic-border-thick shadow-comic">
                  <img
                    src={panel.character.imageUrl}
                    alt={panel.character.name}
                    className="w-52 h-52 sm:w-60 sm:h-60 object-cover rounded-2xl"
                    draggable={false}
                  />
                  <div className="text-center pt-1 font-comic text-xs tracking-wider text-ink">
                    {panel.character.name}
                  </div>
                </div>
              </div>
            )}

            {/* Mode C: Approved Cutout */}
            {panel.character.artMode === 'cutout' && (
              <div className="relative group">
                {panel.character.imageUrl === '/chog-hero.jpg' || panel.character.imageUrl === '/chog-crying.webp' ? (
                  <img
                    src={panel.character.imageUrl}
                    alt={panel.character.name}
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-2xl"
                    draggable={false}
                  />
                ) : (
                  <ChogCharacterArt variant="classic" className="w-56 h-56 sm:w-64 sm:h-64" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Layer 4: Movable Sound Effects (SFX) with Direct Dragging */}
        {panel.sfxList.map((sfx) => {
          const isSelected = selectedElement.type === 'sfx' && selectedElement.id === sfx.id;
          return (
            <div
              key={sfx.id}
              onMouseDown={(e) => handleSFXMouseDown(e, sfx.id)}
              className={`absolute z-30 cursor-grab active:cursor-grabbing pointer-events-auto select-none ${
                isSelected ? 'ring-2 ring-brand rounded-lg p-1' : ''
              }`}
              style={{
                left: `${sfx.x}%`,
                top: `${sfx.y}%`,
                transform: `translate(-50%, -50%) rotate(${sfx.rotation}deg) scale(${sfx.scale})`,
              }}
            >
              <span className="font-comic text-4xl sm:text-5xl text-brand drop-shadow-[3px_3px_0px_#16192E] tracking-widest">
                {sfx.text}
              </span>

              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSFX(sfx.id);
                  }}
                  title="Remove SFX"
                  className="absolute -top-3 -right-3 w-5 h-5 bg-rose-500 text-white rounded-full comic-border flex items-center justify-center text-[10px] font-black"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* Layer 5: Movable & Editable Dialogue / Thought / Narration Bubbles */}
        {panel.bubbles.map((bubble) => {
          const isSelected = selectedElement.type === 'bubble' && selectedElement.id === bubble.id;
          const isNarration = bubble.type === 'narration';
          const isShout = bubble.type === 'shout';
          const isThought = bubble.type === 'thought';

          let bubbleStyle = 'bg-white comic-border rounded-2xl shadow-comic';
          if (isNarration) {
            bubbleStyle = 'bg-chog-face border-2 border-ink rounded-lg shadow-comic font-sans uppercase font-extrabold tracking-wider';
          } else if (isShout) {
            bubbleStyle = 'bg-brand-light border-3 border-ink rounded-2xl font-comic tracking-wide text-brand shadow-comic-lg';
          } else if (isThought) {
            bubbleStyle = 'bg-white border-2 border-ink rounded-full border-dashed shadow-comic';
          }

          return (
            <div
              key={bubble.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectElement({ type: 'bubble', id: bubble.id });
              }}
              className={`absolute z-35 cursor-move pointer-events-auto p-3 max-w-[220px] sm:max-w-[260px] transition-transform ${bubbleStyle} ${
                isSelected ? 'ring-4 ring-brand scale-105' : 'hover:scale-102'
              }`}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
              }}
            >
              <textarea
                value={bubble.text}
                onChange={(e) => onUpdateBubble(bubble.id, { text: e.target.value })}
                rows={isNarration ? 2 : 2}
                style={{ fontSize: `${bubble.fontSize || 13}px` }}
                className="w-full bg-transparent resize-none outline-none font-bold text-ink leading-snug text-center"
              />

              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBubble(bubble.id);
                  }}
                  title="Remove bubble"
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-rose-500 text-white rounded-full comic-border flex items-center justify-center text-xs font-black shadow-comic-sm"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* Selection Hint Footer inside Stage */}
        <div className="absolute bottom-3 right-3 z-35 bg-ink/80 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase backdrop-blur-sm">
          Active: {selectedElement.type.toUpperCase()}
        </div>
      </div>
    </div>
  );
};
