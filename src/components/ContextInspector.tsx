import React from 'react';
import { 
  ComicPanel, 
  SpeechBubble, 
  MovableSFX, 
  PanelCharacter, 
  PanelScene, 
  BubbleType,
  PanelShotType,
  ScreenToneType
} from '../types/comic';
import { useWallet, DEMO_CHOGS } from '../context/WalletContext';
import { 
  Type, 
  Smile, 
  Palette, 
  Volume2, 
  FlipHorizontal, 
  Plus, 
  Trash2, 
  Layers, 
  Check,
  Wallet,
  Clapperboard,
  Tv
} from 'lucide-react';

interface ContextInspectorProps {
  panel: ComicPanel;
  selectedElement: { type: 'character' | 'bubble' | 'sfx' | 'scene' | 'drama'; id?: string };
  onSelectElement: (element: { type: 'character' | 'bubble' | 'sfx' | 'scene' | 'drama'; id?: string }) => void;
  onUpdatePanel: (updates: Partial<ComicPanel>) => void;
  onUpdateBubble: (bubbleId: string, updates: Partial<SpeechBubble>) => void;
  onDeleteBubble: (bubbleId: string) => void;
  onAddBubble: (type: BubbleType) => void;
  onUpdateSFX: (sfxId: string, updates: Partial<MovableSFX>) => void;
  onDeleteSFX: (sfxId: string) => void;
  onAddSFX: (text: string) => void;
}

const SCENE_OPTIONS: { id: PanelScene; label: string; desc: string }[] = [
  { id: 'park-wall-2d', label: '2D Park Wall', desc: 'Flat stone ledge shelf for bust characters' },
  { id: 'park-walkway', label: 'Park Walkway', desc: 'Trees, lamp post & cobblestones' },
  { id: 'neon-city', label: 'Neon City', desc: 'Monad futuristic skyline' },
  { id: 'comic-study', label: 'Comic Study', desc: 'Vintage desk, lamp & books' },
  { id: 'crypto-forest', label: 'Crypto Forest', desc: 'Pine trees & crescent moon' },
  { id: 'action-burst', label: 'Action Burst', desc: 'Dynamic speedlines' },
  { id: 'clean-newsprint', label: 'Clean Newsprint', desc: 'Minimalist white page' },
];

const SFX_PRESETS = ['*SOB...*', '*SNIFFLE*', 'POW!', 'CHOG!', '10k TPS!', 'ZOOM!', 'BZZT!', 'KABOOM!'];

export const ContextInspector: React.FC<ContextInspectorProps> = ({
  panel,
  selectedElement,
  onSelectElement,
  onUpdatePanel,
  onUpdateBubble,
  onDeleteBubble,
  onAddBubble,
  onUpdateSFX,
  onDeleteSFX,
  onAddSFX,
}) => {
  const { ownedChogs, isConnected, connectWallet } = useWallet();

  const activeBubble = panel.bubbles.find((b) => b.id === selectedElement.id);
  const activeSFX = panel.sfxList.find((s) => s.id === selectedElement.id);

  const updateCharacter = (updates: Partial<PanelCharacter>) => {
    if (!panel.character) return;
    onUpdatePanel({
      character: {
        ...panel.character,
        ...updates,
      },
    });
  };

  const availableChogs = ownedChogs.length > 0 ? ownedChogs : DEMO_CHOGS;

  return (
    <div className="w-full bg-white rounded-3xl comic-border p-4 sm:p-5 shadow-comic space-y-4 select-none">
      
      {/* Category Tab Selector with Drama Tab */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-canvas-subtle rounded-2xl border border-ink/10 text-xs font-black">
        <button
          onClick={() => onSelectElement({ type: 'drama' })}
          className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all ${
            selectedElement.type === 'drama'
              ? 'btn-periwinkle shadow-comic-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
          <span className="text-[10px]">Drama</span>
        </button>

        <button
          onClick={() => onSelectElement({ type: 'bubble', id: panel.bubbles[0]?.id })}
          className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all ${
            selectedElement.type === 'bubble'
              ? 'btn-periwinkle shadow-comic-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Type className="w-4 h-4" />
          <span className="text-[10px]">Dialogue</span>
        </button>

        <button
          onClick={() => onSelectElement({ type: 'character' })}
          className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all ${
            selectedElement.type === 'character'
              ? 'btn-periwinkle shadow-comic-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span className="text-[10px]">Cast</span>
        </button>

        <button
          onClick={() => onSelectElement({ type: 'sfx', id: panel.sfxList[0]?.id })}
          className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all ${
            selectedElement.type === 'sfx'
              ? 'btn-periwinkle shadow-comic-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span className="text-[10px]">SFX</span>
        </button>

        <button
          onClick={() => onSelectElement({ type: 'scene' })}
          className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all ${
            selectedElement.type === 'scene'
              ? 'btn-periwinkle shadow-comic-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span className="text-[10px]">Scene</span>
        </button>
      </div>

      {/* --- 0. DRAMA & CINEMATIC CAMERA INSPECTOR --- */}
      {selectedElement.type === 'drama' && (
        <div className="space-y-4">
          <div className="border-b border-ink/10 pb-2">
            <span className="text-xs font-black uppercase text-ink">Comic Drama & Camera Direction</span>
          </div>

          {/* Shot Framing Preset */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-brand flex items-center gap-1">
              <Clapperboard className="w-3.5 h-3.5" />
              <span>Camera Framing & Shot</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'medium', label: 'Medium Shot', desc: 'Standard framing' },
                { id: 'close-up', label: 'Dramatic Close-Up', desc: 'Zoom into crying eyes' },
                { id: 'cinematic-wide', label: 'Cinematic Letterbox', desc: 'Movie bars top/bottom' },
                { id: 'dramatic-tilt', label: 'Dutch Action Angle', desc: 'Dramatic tension tilt' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => onUpdatePanel({ shotType: s.id as PanelShotType })}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    (panel.shotType || 'medium') === s.id
                      ? 'btn-periwinkle shadow-comic-sm'
                      : 'border-ink/20 bg-canvas-subtle hover:bg-canvas-dark text-ink'
                  }`}
                >
                  <span className="text-xs font-bold block">{s.label}</span>
                  <span className={`text-[9px] block ${(panel.shotType || 'medium') === s.id ? 'text-white/80' : 'text-ink-muted'}`}>
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Screen Tone Atmosphere Overlays */}
          <div className="space-y-2 pt-2 border-t border-ink/10">
            <label className="text-[11px] font-black uppercase text-brand flex items-center gap-1">
              <Tv className="w-3.5 h-3.5" />
              <span>Screen Tone & Emotion Atmosphere</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'none', label: 'Natural Daylight', desc: 'No screen tone' },
                { id: 'gloom-lines', label: '🌧️ Gloom Despair', desc: 'Manga downward hatching' },
                { id: 'focus-speedlines', label: '⚡ Radial Action', desc: 'Focus lines on face' },
                { id: 'halftone-dots', label: '📰 Vintage Benday', desc: 'Classic comic print' },
                { id: 'vignette-dark', label: '🌒 Dark Vignette', desc: 'Moody edge shadows' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdatePanel({ screenTone: t.id as ScreenToneType })}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    (panel.screenTone || 'none') === t.id
                      ? 'btn-periwinkle shadow-comic-sm'
                      : 'border-ink/20 bg-canvas-subtle hover:bg-canvas-dark text-ink'
                  }`}
                >
                  <span className="text-xs font-bold block">{t.label}</span>
                  <span className={`text-[9px] block ${(panel.screenTone || 'none') === t.id ? 'text-white/80' : 'text-ink-muted'}`}>
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cinematic Narrative Caption Bar */}
          <div className="space-y-2 pt-2 border-t border-ink/10">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase text-brand">
                Cinematic Narration Caption Bar
              </label>
              <button
                onClick={() => {
                  if (panel.captionBar) {
                    onUpdatePanel({ captionBar: undefined });
                  } else {
                    onUpdatePanel({
                      captionBar: {
                        text: 'LOCATION: MONAD DEVNET — 02:41 AM',
                        position: 'top',
                      },
                    });
                  }
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                  panel.captionBar ? 'btn-periwinkle' : 'bg-canvas-subtle text-ink-muted'
                }`}
              >
                {panel.captionBar ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {panel.captionBar && (
              <div className="space-y-2 bg-canvas-subtle p-2.5 rounded-xl border border-ink/15">
                <input
                  type="text"
                  value={panel.captionBar.text}
                  onChange={(e) =>
                    onUpdatePanel({
                      captionBar: {
                        ...panel.captionBar!,
                        text: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. TEARS FELL FASTER THAN BLOCK FINALITY..."
                  className="w-full bg-white border border-ink/20 rounded-lg px-2.5 py-1.5 font-comic text-xs uppercase text-ink outline-none"
                />
                <div className="flex items-center gap-2 text-[10px] font-bold text-ink-muted">
                  <span>Position:</span>
                  <button
                    onClick={() =>
                      onUpdatePanel({
                        captionBar: { ...panel.captionBar!, position: 'top' },
                      })
                    }
                    className={`px-2 py-0.5 rounded ${panel.captionBar.position === 'top' ? 'bg-ink text-white' : 'bg-white'}`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() =>
                      onUpdatePanel({
                        captionBar: { ...panel.captionBar!, position: 'bottom' },
                      })
                    }
                    className={`px-2 py-0.5 rounded ${panel.captionBar.position === 'bottom' ? 'bg-ink text-white' : 'bg-white'}`}
                  >
                    Bottom
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- 1. DIALOGUE & SPEECH BUBBLES INSPECTOR --- */}
      {selectedElement.type === 'bubble' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <span className="text-xs font-black uppercase text-ink">Dialogue & Captions</span>
            {activeBubble && (
              <button
                onClick={() => onDeleteBubble(activeBubble.id)}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {activeBubble ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-ink-muted block mb-1">Text Content:</label>
                <textarea
                  value={activeBubble.text}
                  onChange={(e) => onUpdateBubble(activeBubble.id, { text: e.target.value })}
                  rows={3}
                  className="w-full bg-canvas-subtle border border-ink/20 rounded-xl p-2.5 font-sans font-bold text-sm text-ink outline-none focus:ring-2 focus:ring-brand resize-none"
                  placeholder="Write bubble text here..."
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-ink-muted mb-1">
                  <span>Font Size</span>
                  <span className="text-brand font-black">{activeBubble.fontSize || 13}px</span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="22"
                  value={activeBubble.fontSize || 13}
                  onChange={(e) => onUpdateBubble(activeBubble.id, { fontSize: Number(e.target.value) })}
                  className="w-full accent-brand cursor-pointer"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-ink-muted block mb-1.5">Bubble Type:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['speech', 'shout', 'thought', 'narration'] as BubbleType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdateBubble(activeBubble.id, { type })}
                      className={`py-1.5 text-center rounded-xl border text-[11px] font-bold capitalize transition-all ${
                        activeBubble.type === type
                          ? 'bg-ink text-white shadow-comic-sm'
                          : 'border-ink/20 bg-canvas-subtle text-ink-muted hover:text-ink'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-ink-muted">Position X: {Math.round(activeBubble.x)}%</span>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={activeBubble.x}
                    onChange={(e) => onUpdateBubble(activeBubble.id, { x: Number(e.target.value) })}
                    className="w-full accent-brand cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-ink-muted">Position Y: {Math.round(activeBubble.y)}%</span>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={activeBubble.y}
                    onChange={(e) => onUpdateBubble(activeBubble.id, { y: Number(e.target.value) })}
                    className="w-full accent-brand cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-muted italic py-2">
              No bubble selected. Click one on the panel or add one below!
            </p>
          )}

          <div className="pt-2 border-t border-ink/10 space-y-2">
            <span className="text-[11px] font-black uppercase text-ink-muted">Add New Element:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAddBubble('speech')}
                className="flex items-center justify-center gap-1 py-2 bg-canvas-subtle hover:bg-canvas-dark rounded-xl border border-ink/20 text-xs font-bold text-ink"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Speech</span>
              </button>
              <button
                onClick={() => onAddBubble('narration')}
                className="flex items-center justify-center gap-1 py-2 bg-chog-face hover:bg-amber-100 rounded-xl border border-ink/20 text-xs font-bold text-ink"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Caption</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. CHARACTER & WALLET MAIN CHARACTERS INSPECTOR --- */}
      {selectedElement.type === 'character' && (
        <div className="space-y-4">
          <div className="border-b border-ink/10 pb-2 flex items-center justify-between">
            <span className="text-xs font-black uppercase text-ink">Main Characters & Artwork</span>
            {!isConnected && (
              <button
                onClick={connectWallet}
                className="flex items-center gap-1 text-[11px] font-black text-brand hover:underline"
              >
                <Wallet className="w-3 h-3" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase text-brand flex items-center gap-1">
                <Smile className="w-3.5 h-3.5" />
                <span>{isConnected ? 'Your Wallet Chogs' : 'Available Chog Cast'}</span>
              </span>
              <span className="text-[10px] text-ink-muted">
                {availableChogs.length} available
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-canvas-subtle rounded-2xl border border-ink/10">
              {availableChogs.map((chog) => {
                const isCurrentActor = panel.character?.tokenId === chog.tokenId;
                return (
                  <div
                    key={chog.tokenId}
                    onClick={() => {
                      updateCharacter({
                        tokenId: chog.tokenId,
                        name: chog.name,
                        imageUrl: chog.imageUrl,
                      });
                    }}
                    className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      isCurrentActor
                        ? 'bg-white ring-2 ring-brand border-brand shadow-comic-sm'
                        : 'bg-white/80 border-ink/15 hover:bg-white'
                    }`}
                  >
                    <img
                      src={chog.imageUrl}
                      alt={chog.name}
                      className="w-10 h-10 rounded-lg object-cover comic-border flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink truncate block">
                          #{chog.tokenId}
                        </span>
                        {isCurrentActor && <Check className="w-3.5 h-3.5 text-brand flex-shrink-0" />}
                      </div>
                      <span className="text-[10px] text-ink-muted truncate block">
                        {chog.name.split('(')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {panel.character && (
            <div className="space-y-4 pt-1 border-t border-ink/10">
              <div>
                <label className="text-[11px] font-black uppercase text-brand block mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Artwork Placement Mode</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => updateCharacter({ artMode: 'original' })}
                    className={`py-2 px-1 text-center rounded-xl border text-[10px] font-black uppercase transition-all ${
                      panel.character.artMode === 'original'
                        ? 'btn-periwinkle shadow-comic-sm'
                        : 'border-ink/20 bg-canvas-subtle text-ink-muted hover:text-ink'
                    }`}
                  >
                    Original
                  </button>

                  <button
                    onClick={() => updateCharacter({ artMode: 'framed' })}
                    className={`py-2 px-1 text-center rounded-xl border text-[10px] font-black uppercase transition-all ${
                      panel.character.artMode === 'framed'
                        ? 'btn-periwinkle shadow-comic-sm'
                        : 'border-ink/20 bg-canvas-subtle text-ink-muted hover:text-ink'
                    }`}
                  >
                    Sticker Frame
                  </button>

                  <button
                    onClick={() => updateCharacter({ artMode: 'cutout' })}
                    className={`py-2 px-1 text-center rounded-xl border text-[10px] font-black uppercase transition-all ${
                      panel.character.artMode === 'cutout'
                        ? 'btn-periwinkle shadow-comic-sm'
                        : 'border-ink/20 bg-canvas-subtle text-ink-muted hover:text-ink'
                    }`}
                  >
                    Cutout
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-ink-muted">Orientation & Size</span>
                  <button
                    onClick={() => updateCharacter({ flipHorizontal: !panel.character?.flipHorizontal })}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                      panel.character.flipHorizontal ? 'btn-periwinkle text-white' : 'bg-canvas-subtle text-ink'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Flip Direction</span>
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-ink-muted mb-1">
                    <span>Character Scale</span>
                    <span className="text-brand font-black">{Math.round(panel.character.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={panel.character.scale}
                    onChange={(e) => updateCharacter({ scale: Number(e.target.value) })}
                    className="w-full accent-brand cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-ink-muted">Move X: {Math.round(panel.character.x)}%</span>
                  <input
                    type="range"
                    min="15"
                    max="85"
                    value={panel.character.x}
                    onChange={(e) => updateCharacter({ x: Number(e.target.value) })}
                    className="w-full accent-brand cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-ink-muted">Move Y: {Math.round(panel.character.y)}%</span>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={panel.character.y}
                    onChange={(e) => updateCharacter({ y: Number(e.target.value) })}
                    className="w-full accent-brand cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- 3. SOUND EFFECTS (SFX) INSPECTOR --- */}
      {selectedElement.type === 'sfx' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <span className="text-xs font-black uppercase text-ink">Comic Sound Effects & Melodrama</span>
            {activeSFX && (
              <button
                onClick={() => onDeleteSFX(activeSFX.id)}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {activeSFX ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-ink-muted block mb-1">Sound Text:</label>
                <input
                  type="text"
                  value={activeSFX.text}
                  onChange={(e) => onUpdateSFX(activeSFX.id, { text: e.target.value })}
                  className="w-full bg-canvas-subtle border border-ink/20 rounded-xl px-3 py-1.5 font-comic text-xl text-brand outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-ink-muted mb-1">
                  <span>Tilt Angle</span>
                  <span className="text-brand font-black">{activeSFX.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={activeSFX.rotation}
                  onChange={(e) => onUpdateSFX(activeSFX.id, { rotation: Number(e.target.value) })}
                  className="w-full accent-brand cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-ink-muted mb-1">
                  <span>Stamp Scale</span>
                  <span className="text-brand font-black">{Math.round(activeSFX.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.2"
                  step="0.1"
                  value={activeSFX.scale}
                  onChange={(e) => onUpdateSFX(activeSFX.id, { scale: Number(e.target.value) })}
                  className="w-full accent-brand cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-ink-muted">Position X: {Math.round(activeSFX.x)}%</span>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={activeSFX.x}
                    onChange={(e) => onUpdateSFX(activeSFX.id, { x: Number(e.target.value) })}
                    className="w-full accent-brand cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-ink-muted">Position Y: {Math.round(activeSFX.y)}%</span>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={activeSFX.y}
                    onChange={(e) => onUpdateSFX(activeSFX.id, { y: Number(e.target.value) })}
                    className="w-full accent-brand cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-muted italic py-2">
              No sound effect selected. Click one on the canvas or stamp one from below!
            </p>
          )}

          <div className="pt-2 border-t border-ink/10 space-y-2">
            <span className="text-[11px] font-black uppercase text-ink-muted">Stamp a Sound Effect:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {SFX_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onAddSFX(preset)}
                  className="py-1.5 bg-canvas-subtle hover:bg-brand-light text-brand hover:text-brand-dark rounded-xl border border-ink/20 font-comic text-xs transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- 4. SCENE BACKGROUND INSPECTOR --- */}
      {selectedElement.type === 'scene' && (
        <div className="space-y-4">
          <div className="border-b border-ink/10 pb-2">
            <span className="text-xs font-black uppercase text-ink">Comic Scene Environment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SCENE_OPTIONS.map((sc) => {
              const isCurrent = panel.scene === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onUpdatePanel({ scene: sc.id })}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'btn-periwinkle shadow-comic-sm'
                      : 'border-ink/20 bg-canvas-subtle hover:bg-canvas-dark text-ink'
                  }`}
                >
                  <span className="font-comic text-sm tracking-wide block">
                    {sc.label}
                  </span>
                  <span className={`text-[10px] mt-0.5 ${isCurrent ? 'text-white/80' : 'text-ink-muted'}`}>
                    {sc.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
