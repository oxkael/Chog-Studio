import { forwardRef } from 'react';
import { ComicStrip, SpeechBubble } from '../types/comic';
import { ComicPanelItem } from './ComicPanelItem';

interface ComicCanvasProps {
  story: ComicStrip;
  activePanelId?: number;
  layout?: '2x2' | 'strip';
  onSelectPanel?: (id: number) => void;
  onUpdateBubble?: (panelId: number, bubbleId: string, updates: Partial<SpeechBubble>) => void;
  onDeleteBubble?: (panelId: number, bubbleId: string) => void;
  readOnly?: boolean;
}

export const ComicCanvas = forwardRef<HTMLDivElement, ComicCanvasProps>(
  (
    {
      story,
      activePanelId = 1,
      layout = '2x2',
      onSelectPanel = () => {},
      onUpdateBubble = () => {},
      onDeleteBubble = () => {},
      readOnly = false,
    },
    ref
  ) => {
    return (
      <div className="w-full flex justify-center">
        {/* Printable / Exportable Canvas Container */}
        <div
          ref={ref}
          className="w-full max-w-4xl bg-paper-white p-5 sm:p-8 rounded-3xl comic-border shadow-comic-lg flex flex-col gap-6"
        >
          {/* Comic Strip Header Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-ink/20 pb-4 gap-2">
            <div className="flex items-center gap-3">
              <span className="btn-periwinkle font-comic text-2xl px-3 py-0.5 rounded-xl comic-border shadow-comic-sm">
                CHOG
              </span>
              <h2 className="font-comic text-3xl sm:text-4xl text-ink tracking-wide">
                {story.title}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-black uppercase text-ink-muted">
              <span>{story.panels.length} PANELS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-ink/40"></span>
              <span className="text-brand font-black">MONAD GENESIS</span>
            </div>
          </div>

          {/* Panels Grid / Strip */}
          <div
            className={`grid gap-4 sm:gap-6 ${
              layout === '2x2'
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {story.panels.map((panel) => (
              <ComicPanelItem
                key={panel.id}
                panel={panel}
                isActive={activePanelId === panel.id}
                onSelect={() => onSelectPanel(panel.id)}
                onUpdateBubble={(bId, updates) => onUpdateBubble(panel.id, bId, updates)}
                onDeleteBubble={(bId) => onDeleteBubble(panel.id, bId)}
                readOnly={readOnly}
              />
            ))}
          </div>

          {/* Comic Strip Footer / Attribution */}
          <div className="flex items-center justify-between border-t-2 border-ink/40 pt-3 text-[11px] font-bold text-ink-muted">
            <span>© CHOG STUDIO • MONAD NETWORK</span>
            <span className="italic">“YOUR CHOG. YOUR STORY.”</span>
          </div>
        </div>
      </div>
    );
  }
);

ComicCanvas.displayName = 'ComicCanvas';
