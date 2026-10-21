import React from 'react';
import { ComicPanel, SpeechBubble } from '../types/comic';
import { ComicSceneIllustration } from './ComicSceneIllustrations';
import { ChogCharacterArt } from './ChogCharacterArt';
import { ComicScreenTones } from './ComicScreenTones';

interface ComicPanelItemProps {
  panel: ComicPanel;
  isActive: boolean;
  onSelect: () => void;
  onUpdateBubble?: (bubbleId: string, updates: Partial<SpeechBubble>) => void;
  onDeleteBubble?: (bubbleId: string) => void;
  readOnly?: boolean;
}

export const ComicPanelItem: React.FC<ComicPanelItemProps> = ({
  panel,
  isActive,
  onSelect,
  onUpdateBubble,
  onDeleteBubble,
  readOnly = false,
}) => {
  const isCloseUp = panel.shotType === 'close-up';
  const isTilt = panel.shotType === 'dramatic-tilt';
  const isCinematic = panel.shotType === 'cinematic-wide';

  const characterScaleMultiplier = isCloseUp ? 1.6 : 1.0;
  const characterYShift = isCloseUp ? -8 : 0;

  return (
    <div
      onClick={onSelect}
      className={`relative aspect-square rounded-2xl comic-border-thick overflow-hidden transition-all select-none ${
        isActive
          ? 'ring-4 ring-brand shadow-comic-lg scale-[1.01]'
          : 'shadow-comic hover:shadow-comic-lg'
      } ${readOnly ? '' : 'cursor-pointer'} ${isTilt ? 'rotate-[-1deg]' : ''}`}
    >
      {/* Panel Scene Background */}
      <div className="absolute inset-0 z-0">
        <ComicSceneIllustration scene={panel.scene} />
      </div>

      {/* Cinematic Letterbox Bars */}
      {isCinematic && (
        <>
          <div className="absolute top-0 left-0 right-0 h-6 bg-ink z-25 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-ink z-25 pointer-events-none" />
        </>
      )}

      {/* Screen Tone Overlays (Gloom Lines, Radial Speedlines, Halftone) */}
      <ComicScreenTones type={panel.screenTone} />

      {/* Cinematic Narration Caption Bar */}
      {panel.captionBar && panel.captionBar.text && (
        <div
          className={`absolute left-0 right-0 z-35 bg-chog-face border-y-2 border-ink px-3 py-1 flex items-center shadow-comic-sm ${
            panel.captionBar.position === 'bottom' ? 'bottom-0' : 'top-0'
          }`}
        >
          <span className="font-comic text-[10px] sm:text-xs uppercase tracking-wider text-ink font-black truncate">
            {panel.captionBar.text}
          </span>
        </div>
      )}

      {/* Panel Number Badge */}
      <div className="absolute top-2.5 left-2.5 z-30 bg-ink text-white font-black text-xs px-2.5 py-1 rounded-md comic-border shadow-comic-sm">
        #{panel.id}
      </div>

      {/* Movable Sound Effects (SFX) */}
      {panel.sfxList?.map((sfx) => (
        <div
          key={sfx.id}
          className="absolute z-20 pointer-events-none select-none"
          style={{
            left: `${sfx.x}%`,
            top: `${sfx.y}%`,
            transform: `translate(-50%, -50%) rotate(${sfx.rotation}deg) scale(${sfx.scale})`,
          }}
        >
          <span className="font-comic text-3xl sm:text-4xl text-brand drop-shadow-[2.5px_2.5px_0px_#16192E] tracking-widest">
            {sfx.text}
          </span>
        </div>
      ))}

      {/* Character Layer with 3 Art Treatment Modes + Camera Shot Framing */}
      {panel.character && (
        <div
          className="absolute z-10 transition-transform duration-75 flex items-center justify-center pointer-events-none"
          style={{
            left: `${panel.character.x}%`,
            top: `${panel.character.y + characterYShift}%`,
            transform: `translate(-50%, -50%) scale(${panel.character.scale * characterScaleMultiplier}) ${
              panel.character.flipHorizontal ? 'scaleX(-1)' : ''
            }`,
          }}
        >
          {panel.character.artMode === 'original' && (
            <img
              src={panel.character.imageUrl}
              alt={panel.character.name}
              className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-xl comic-border shadow-comic"
              draggable={false}
            />
          )}

          {panel.character.artMode === 'framed' && (
            <div className="relative">
              <div className="absolute inset-0 bg-brand rounded-2xl comic-border translate-x-2 translate-y-2 -z-10" />
              <div className="bg-white p-2 rounded-2xl comic-border-thick shadow-comic">
                <img
                  src={panel.character.imageUrl}
                  alt={panel.character.name}
                  className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-xl"
                  draggable={false}
                />
              </div>
            </div>
          )}

          {panel.character.artMode === 'cutout' && (
            <div>
              {panel.character.imageUrl === '/chog-hero.jpg' || panel.character.imageUrl === '/chog-crying.webp' ? (
                <img
                  src={panel.character.imageUrl}
                  alt={panel.character.name}
                  className="w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-xl"
                  draggable={false}
                />
              ) : (
                <ChogCharacterArt variant="classic" className="w-44 h-44 sm:w-52 sm:h-52" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Bubbles & Narration Layer */}
      <div className="absolute inset-0 z-25 pointer-events-none">
        {panel.bubbles.map((bubble) => {
          const isNarration = bubble.type === 'narration';
          const isShout = bubble.type === 'shout';
          const isThought = bubble.type === 'thought';

          let bubbleStyle = 'bg-white comic-border rounded-2xl shadow-comic-sm';
          if (isNarration) {
            bubbleStyle = 'bg-chog-face border-2 border-ink rounded-lg shadow-comic-sm font-sans uppercase font-extrabold tracking-wider';
          } else if (isShout) {
            bubbleStyle = 'bg-brand-light border-3 border-ink rounded-xl font-comic tracking-wide text-brand shadow-comic';
          } else if (isThought) {
            bubbleStyle = 'bg-white border-2 border-ink rounded-full border-dashed shadow-comic-sm';
          }

          return (
            <div
              key={bubble.id}
              className={`absolute p-2 sm:p-2.5 max-w-[170px] sm:max-w-[200px] transition-transform ${bubbleStyle} ${
                readOnly ? 'pointer-events-none' : 'pointer-events-auto'
              }`}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {readOnly ? (
                <p
                  style={{ fontSize: `${bubble.fontSize ? bubble.fontSize - 2 : 12}px` }}
                  className="font-bold text-ink leading-snug text-center"
                >
                  {bubble.text}
                </p>
              ) : (
                <textarea
                  value={bubble.text}
                  onChange={(e) => onUpdateBubble && onUpdateBubble(bubble.id, { text: e.target.value })}
                  rows={2}
                  style={{ fontSize: `${bubble.fontSize ? bubble.fontSize - 2 : 12}px` }}
                  className="w-full bg-transparent resize-none outline-none font-bold text-ink leading-snug text-center"
                />
              )}

              {!readOnly && isActive && onDeleteBubble && (
                <button
                  onClick={() => onDeleteBubble(bubble.id)}
                  title="Remove bubble"
                  className="absolute -top-2 -right-2 w-5 h-5 bg-canvas-subtle hover:bg-rose-200 text-ink rounded-full comic-border flex items-center justify-center text-[10px] font-black"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Panel Badge in editor mode */}
      {isActive && !readOnly && (
        <div className="absolute bottom-2 right-2 z-30 bg-brand text-white text-[10px] font-black px-2 py-0.5 rounded shadow-comic-sm uppercase">
          Editing
        </div>
      )}
    </div>
  );
};
