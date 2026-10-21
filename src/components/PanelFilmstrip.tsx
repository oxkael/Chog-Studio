import React from 'react';
import { ComicPanel } from '../types/comic';
import { ComicSceneIllustration } from './ComicSceneIllustrations';
import { Plus, ArrowLeft, ArrowRight, Copy, Trash2, CheckCircle2 } from 'lucide-react';

interface PanelFilmstripProps {
  panels: ComicPanel[];
  activePanelId: number;
  onSelectPanel: (panelId: number) => void;
  onAddPanel: () => void;
  onDuplicatePanel: (panelId: number) => void;
  onDeletePanel: (panelId: number) => void;
  onMovePanel: (fromIndex: number, toIndex: number) => void;
}

export const PanelFilmstrip: React.FC<PanelFilmstripProps> = ({
  panels,
  activePanelId,
  onSelectPanel,
  onAddPanel,
  onDuplicatePanel,
  onDeletePanel,
  onMovePanel,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl comic-border p-4 shadow-comic space-y-3">
      {/* Filmstrip Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-comic text-lg text-ink">STORY SEQUENCE</span>
          <span className="text-xs bg-canvas-subtle text-ink-muted font-bold px-2 py-0.5 rounded-full border border-ink/10">
            {panels.length} {panels.length === 1 ? 'Panel' : 'Panels'}
          </span>
        </div>
        <p className="text-[11px] text-ink-muted hidden sm:block">
          Click any thumbnail to edit • Panels play in order from left to right
        </p>
      </div>

      {/* Sequential Filmstrip Row */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin">
        {panels.map((panel, idx) => {
          const isActive = panel.id === activePanelId;

          return (
            <div
              key={panel.id}
              onClick={() => onSelectPanel(panel.id)}
              className={`relative flex-shrink-0 w-36 sm:w-44 flex flex-col rounded-2xl cursor-pointer transition-all duration-150 select-none ${
                isActive
                  ? 'ring-4 ring-brand scale-[1.02] bg-brand-light/30 shadow-comic'
                  : 'bg-canvas-subtle hover:bg-canvas-dark border-2 border-ink/20 opacity-85 hover:opacity-100'
              }`}
            >
              {/* Top Panel Header */}
              <div className="flex items-center justify-between p-2 pb-1.5 border-b border-ink/10">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-comic text-xs font-bold ${
                      isActive ? 'btn-periwinkle text-white' : 'bg-ink/10 text-ink'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-ink truncate max-w-[70px]">
                    {panel.scene.replace('-', ' ')}
                  </span>
                </div>

                {isActive && (
                  <span className="flex items-center gap-0.5 text-[9px] font-black text-brand tracking-wider uppercase">
                    <CheckCircle2 className="w-3 h-3 text-brand" /> Active
                  </span>
                )}
              </div>

              {/* Panel Mini Preview Box */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-white border-b border-ink/10">
                {/* Scene Mini Art */}
                <div className="absolute inset-0 pointer-events-none scale-100">
                  <ComicSceneIllustration scene={panel.scene} />
                </div>

                {/* Character Dot / Mini Avatar */}
                {panel.character && (
                  <div
                    className="absolute w-8 h-8 rounded-lg overflow-hidden border border-ink/30 shadow-sm"
                    style={{
                      left: `${panel.character.x}%`,
                      top: `${panel.character.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <img
                      src={panel.character.imageUrl}
                      alt={panel.character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Bubble Count Badge */}
                {panel.bubbles.length > 0 && (
                  <div className="absolute bottom-1 left-1 bg-white/90 px-1 py-0.5 rounded text-[9px] font-bold text-ink border border-ink/20 flex items-center gap-0.5">
                    💬 {panel.bubbles.length}
                  </div>
                )}

                {/* SFX Count Badge */}
                {panel.sfxList?.length > 0 && (
                  <div className="absolute top-1 right-1 bg-brand text-white px-1 py-0.5 rounded text-[8px] font-black tracking-wider shadow-sm">
                    {panel.sfxList[0].text}
                  </div>
                )}
              </div>

              {/* Sequential Action Controls */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between p-1.5 bg-white/50 text-ink-muted text-xs"
              >
                {/* Reorder Left */}
                <button
                  onClick={() => idx > 0 && onMovePanel(idx, idx - 1)}
                  disabled={idx === 0}
                  title="Move panel earlier"
                  className="p-1 rounded hover:bg-ink/10 disabled:opacity-20 disabled:hover:bg-transparent"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => onDuplicatePanel(panel.id)}
                  title="Duplicate this panel"
                  className="p-1 rounded hover:bg-ink/10"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDeletePanel(panel.id)}
                  disabled={panels.length <= 1}
                  title={panels.length <= 1 ? 'Cannot delete only panel' : 'Delete panel'}
                  className="p-1 rounded hover:bg-coral/20 hover:text-coral disabled:opacity-20 disabled:hover:bg-transparent"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Reorder Right */}
                <button
                  onClick={() => idx < panels.length - 1 && onMovePanel(idx, idx + 1)}
                  disabled={idx === panels.length - 1}
                  title="Move panel later"
                  className="p-1 rounded hover:bg-ink/10 disabled:opacity-20 disabled:hover:bg-transparent"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Panel Card */}
        <button
          onClick={onAddPanel}
          className="flex-shrink-0 w-32 sm:w-36 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/30 hover:border-brand hover:bg-brand-light/30 text-ink-muted hover:text-brand transition-all p-4 group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-white group-hover:btn-periwinkle border border-ink/20 flex items-center justify-center transition-all shadow-comic-sm">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-comic text-xs uppercase tracking-wide font-bold">
            + Add Panel
          </span>
        </button>
      </div>
    </div>
  );
};
