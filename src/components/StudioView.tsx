import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { useWallet } from '../context/WalletContext';
import { ComicLayout, PageData, PanelData, ChogTile } from '../types/comic';

// Palette swatches from Design Reference
export const SW = [
  '#EADFCB', '#CFE0EA', '#F3E6B0', '#F2D6D1', '#DDE8D2',
  '#E4DDF0', '#F7D8BA', '#FFFFFF', '#1E1612'
];

// Number of panels per layout
const LAYOUT_PANELS: Record<ComicLayout, number> = {
  l2: 2,
  l3: 3,
  l3s: 3,
  l4: 4,
};

const PANEL_AREA_NAMES = ['a', 'b', 'c', 'd'];

// Helper to create a single Chog tile
const createTile = (chogIndex: number, overrides: Partial<ChogTile> = {}): ChogTile => ({
  c: chogIndex,
  s: 58,
  fill: 0,
  tx: 0,
  ty: 0,
  z: 1,
  x: 0,
  y: 0,
  f: 0,
  bt: '',
  bs: 'l',
  bx: 6,
  by: 6,
  ...overrides,
});

// Helper to create a single panel
const createPanel = (bg: string, chogIndex: number, caption: string = ''): PanelData => ({
  bg,
  cap: caption,
  k: [createTile(chogIndex)],
});

// Helper to create a fresh page
const createPage = (chogIndex: number, bg: string = '#EADFCB', layout: ComicLayout = 'l3'): PageData => {
  const panelCount = LAYOUT_PANELS[layout];
  const panels: PanelData[] = [];
  for (let i = 0; i < panelCount; i++) {
    panels.push(createPanel(SW[(i + 1) % SW.length], chogIndex));
  }
  return {
    l: layout,
    bg,
    p: panels,
  };
};

interface StudioViewProps {
  onBackToLanding?: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({ onBackToLanding }) => {
  const {
    ownedChogs,
    activeChog,
    setActiveChog,
    isTestAccess,
    supportingCast,
    pickCastAsHero,
  } = useWallet();

  const [showCastPicker, setShowCastPicker] = useState(false);
  const [castSearch, setCastSearch] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bubbleRef0 = useRef<HTMLTextAreaElement>(null);
  const bubbleRef1 = useRef<HTMLTextAreaElement>(null);

  // Story state
  const [storyTitle, setStoryTitle] = useState('The Dip');
  const [pages, setPages] = useState<PageData[]>(() => {
    try {
      const saved = localStorage.getItem('chogmock3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pages && parsed.pages.length > 0) {
          if (parsed.t) setStoryTitle(parsed.t);
          return parsed.pages;
        }
      }
    } catch (e) {
      // ignore
    }
    const p1 = createPage(0, '#EADFCB', 'l3');
    p1.p[0].cap = 'Chog #1462 checks the chart.';
    p1.p[0].k[0].bt = 'Is that... the bottom?!';
    p1.p[1].k[0].bt = 'Just a minor pullback.';
    p1.p[2].cap = 'To be continued...';
    return [p1];
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedPanelIndex, setSelectedPanelIndex] = useState(0);
  const [selectedChogTileIndex, setSelectedChogTileIndex] = useState(0);

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chogs' | 'page' | 'art' | 'text'>('chogs');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dragRef = useRef<{
    isDragging: boolean;
    type: 'tile' | 'bubble';
    startX: number;
    startY: number;
    initialValues: any;
  } | null>(null);

  const currentPage = pages[currentPageIndex] || pages[0];
  const currentPanel = currentPage.p[selectedPanelIndex] || currentPage.p[0];
  const currentTile = currentPanel.k[selectedChogTileIndex] || currentPanel.k[0];

  const filteredCast = supportingCast.filter((c) => {
    if (!castSearch.trim()) return true;
    const q = castSearch.toLowerCase().trim();
    const idMatch = c.tokenId.includes(q) || c.name.toLowerCase().includes(q);
    const traitMatch = c.attributes?.some(
      (a: any) =>
        String(a.value).toLowerCase().includes(q) ||
        String(a.trait_type).toLowerCase().includes(q)
    );
    return idMatch || traitMatch;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleLayoutChange = (newLayout: ComicLayout) => {
    const requiredPanels = LAYOUT_PANELS[newLayout];
    const newPages = [...pages];
    const page = { ...newPages[currentPageIndex], l: newLayout };
    const currentPanels = [...page.p];

    if (currentPanels.length < requiredPanels) {
      for (let i = currentPanels.length; i < requiredPanels; i++) {
        currentPanels.push(createPanel(SW[(i + 1) % SW.length], currentTile ? currentTile.c : 0));
      }
    } else if (currentPanels.length > requiredPanels) {
      currentPanels.splice(requiredPanels);
    }

    page.p = currentPanels;
    newPages[currentPageIndex] = page;
    setPages(newPages);

    if (selectedPanelIndex >= requiredPanels) {
      setSelectedPanelIndex(0);
      setSelectedChogTileIndex(0);
    }
  };

  const updateCurrentPanel = (updater: (p: PanelData) => void) => {
    setPages((prevPages) => {
      const nextPages = [...prevPages];
      const page = { ...nextPages[currentPageIndex] };
      const panelList = [...page.p];
      const panel = { ...panelList[selectedPanelIndex] };
      updater(panel);
      panelList[selectedPanelIndex] = panel;
      page.p = panelList;
      nextPages[currentPageIndex] = page;
      return nextPages;
    });
  };

  const updateCurrentTile = (updater: (t: ChogTile) => void) => {
    updateCurrentPanel((panel) => {
      const kList = [...panel.k];
      const tile = { ...kList[selectedChogTileIndex] };
      updater(tile);
      kList[selectedChogTileIndex] = tile;
      panel.k = kList;
    });
  };

  const handleToggleSecondChog = () => {
    updateCurrentPanel((panel) => {
      if (panel.k.length > 1) {
        panel.k = [panel.k[0]];
        setSelectedChogTileIndex(0);
      } else {
        const nextChogIndex = (panel.k[0].c + 1) % (ownedChogs.length || 5);
        panel.k = [
          { ...panel.k[0], s: 48, tx: -24, ty: 10, fill: 0, f: 0, bs: 'l', bx: 4, by: 4 },
          createTile(nextChogIndex, { s: 48, tx: 24, ty: 10, fill: 0, f: 1, bs: 'r', bx: 52, by: 4 }),
        ];
        setSelectedChogTileIndex(1);
      }
    });
  };

  const handleAddSecondChog = () => {
    updateCurrentPanel((panel) => {
      if (panel.k.length < 2) {
        const nextChogIndex = (panel.k[0].c + 1) % (ownedChogs.length || 5);
        panel.k = [
          { ...panel.k[0], s: 48, tx: -24, ty: 10, fill: 0, f: 0, bs: 'l', bx: 4, by: 4 },
          createTile(nextChogIndex, { s: 48, tx: 24, ty: 10, fill: 0, f: 1, bs: 'r', bx: 52, by: 4 }),
        ];
        setSelectedChogTileIndex(1);
      }
    });
  };

  const handleArrangement = (preset: 'side' | 'overlap' | 'inset') => {
    updateCurrentPanel((panel) => {
      if (panel.k.length < 2) return;
      if (preset === 'side') {
        panel.k[0] = { ...panel.k[0], s: 48, tx: -24, ty: 10, fill: 0, f: 0, bs: 'l', bx: 4, by: 4 };
        panel.k[1] = { ...panel.k[1], s: 48, tx: 24, ty: 10, fill: 0, f: 1, bs: 'r', bx: 52, by: 4 };
      } else if (preset === 'overlap') {
        panel.k[0] = { ...panel.k[0], s: 62, tx: -14, ty: 12, fill: 0, f: 0, bs: 'l', bx: 4, by: 4 };
        panel.k[1] = { ...panel.k[1], s: 52, tx: 24, ty: -4, fill: 0, f: 1, bs: 'r', bx: 52, by: 4 };
      } else if (preset === 'inset') {
        panel.k[0] = { ...panel.k[0], s: 72, tx: -10, ty: 6, fill: 0, f: 0, bs: 'l', bx: 4, by: 4 };
        panel.k[1] = { ...panel.k[1], s: 38, tx: 30, ty: -24, fill: 0, f: 1, bs: 'r', bx: 52, by: 4 };
      }
    });
  };

  const handleWriteStarterStory = () => {
    const chogIdx = currentTile.c;
    const chog = ownedChogs[chogIdx] || activeChog || ownedChogs[0];
    const name = chog?.name || `Chog #${chog?.tokenId || '1462'}`;

    // Extract traits if present
    const attrs = chog?.attributes || [];
    const getTrait = (type: string) =>
      attrs.find((a: any) => a.trait_type?.toLowerCase() === type.toLowerCase())?.value;

    const head = getTrait('Head');
    const eyes = getTrait('Eyes');
    const body = getTrait('Body');
    const mouth = getTrait('Mouth');
    const side = getTrait('Side');
    const defaultFlip = side === 'Right' ? 0 : 1;

    const line1Cap = head && body ? `${name} rocking the ${head} and ${body}.` : `${name} checks the Monad chart.`;
    const line2Cap = eyes ? `Scanning the blocks with ${eyes}...` : 'Double checking the order book.';
    const line2Bubble = mouth ? `Wait... what is that?!` : 'Is that... the bottom?!';
    const line3Bubble = mouth ? `Never fade a Monad Chog!` : 'LFG! Never faded!';

    const starterLines = [
      { cap: line1Cap, bubble: 'Looking for a clean setup...', zoom: 1, flip: defaultFlip },
      { cap: line2Cap, bubble: line2Bubble, zoom: 1.7, flip: defaultFlip },
      { cap: 'Sudden high-volume Monad spike.', bubble: line3Bubble, zoom: 1.3, flip: defaultFlip === 0 ? 1 : 0 },
      { cap: 'Another chapter in the chronicles.', bubble: 'Your Chog. Your story.', zoom: 1, flip: defaultFlip },
    ];

    setPages((prevPages) => {
      const nextPages = [...prevPages];
      const page = { ...nextPages[currentPageIndex] };
      const newPanels = page.p.map((panel, i) => {
        const line = starterLines[i % starterLines.length];
        const updatedK0 = {
          ...panel.k[0],
          c: chogIdx,
          z: line.zoom,
          x: line.zoom > 1.5 ? -15 : 0,
          y: 0,
          f: line.flip,
          bt: line.bubble,
        };
        return {
          ...panel,
          cap: line.cap,
          k: [updatedK0, ...(panel.k.slice(1))],
        };
      });
      page.p = newPanels;
      nextPages[currentPageIndex] = page;
      return nextPages;
    });

    showToast('Starter story generated from traits!');
  };

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const handleExportJson = () => {
    try {
      const exportData = {
        version: '1.0',
        title: storyTitle,
        t: storyTitle,
        pages,
        exportedAt: new Date().toISOString(),
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeTitle = (storyTitle || 'chog_comic').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
      a.href = url;
      a.download = `${safeTitle}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Exported story as JSON!');
    } catch {
      showToast('Failed to export JSON');
    }
  };

  const handleExportPng = async () => {
    try {
      showToast('Rendering page image...');
      const pageEl = document.querySelector('#canvas .page') as HTMLElement;
      if (!pageEl) {
        showToast('Could not find comic page element');
        return;
      }
      const dataUrl = await toPng(pageEl, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const a = document.createElement('a');
      const safeTitle = (storyTitle || 'chog_comic').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
      a.href = dataUrl;
      a.download = `${safeTitle}_page_${currentPageIndex + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloaded page as PNG!');
    } catch (err) {
      console.error('PNG export error:', err);
      showToast('Failed to render PNG image');
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (!data || !Array.isArray(data.pages) || data.pages.length === 0) {
          showToast('Invalid comic file: missing pages array');
          return;
        }

        const importedTitle = data.title || data.t || 'Imported Comic';
        setStoryTitle(importedTitle);
        setPages(data.pages);
        setCurrentPageIndex(0);
        setSelectedPanelIndex(0);
        setSelectedChogTileIndex(0);

        try {
          localStorage.setItem(
            'chogmock3',
            JSON.stringify({ pages: data.pages, t: importedTitle })
          );
        } catch {
          // ignore
        }

        showToast(`Loaded "${importedTitle}" (${data.pages.length} pages)!`);
      } catch {
        showToast('Failed to parse JSON file');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('chogmock3', JSON.stringify({ pages, t: storyTitle }));
      showToast('Saved on this device only');
    } catch (e) {
      showToast('Could not save here');
    }
  };

  const handleAddNewPage = () => {
    const newPage = createPage(currentTile.c, SW[(2 + pages.length) % SW.length], 'l3');
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
    setSelectedPanelIndex(0);
    setSelectedChogTileIndex(0);
    showToast('New page opened. The last one moved down to the tray.');
  };

  const startDrag = (
    e: React.PointerEvent,
    type: 'tile' | 'bubble',
    initialValues: any
  ) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      isDragging: true,
      type,
      startX: e.clientX,
      startY: e.clientY,
      initialValues,
    };

    const handlePointerMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;

      if (dragRef.current.type === 'bubble') {
        const newBx = Math.max(0, Math.min(65, dragRef.current.initialValues.bx + dx / 3.5));
        const newBy = Math.max(0, Math.min(80, dragRef.current.initialValues.by + dy / 3.5));
        updateCurrentTile((tile) => {
          tile.bx = Math.round(newBx);
          tile.by = Math.round(newBy);
        });
      } else {
        const newTx = Math.max(-45, Math.min(45, dragRef.current.initialValues.tx + dx / 4));
        const newTy = Math.max(-45, Math.min(45, dragRef.current.initialValues.ty + dy / 4));
        updateCurrentTile((tile) => {
          tile.tx = Math.round(newTx);
          tile.ty = Math.round(newTy);
        });
      }
    };

    const handlePointerUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className={`studio-root ${isPreviewMode ? 'pv' : ''}`}>
      {/* Studio Header */}
      <header>
        <button
          onClick={onBackToLanding}
          className="btn"
          style={{ padding: '4px 14px', fontSize: '1.05rem', marginRight: '4px' }}
          title="Return to Story Landing"
        >
          ← Back
        </button>

        <span className="logo">
          Chog Studio
        </span>
        
        {isTestAccess && (
          <span className="test-badge" title="Local development test access active">
            Test access
          </span>
        )}
        
        <input
          id="title"
          value={storyTitle}
          onChange={(e) => setStoryTitle(e.target.value)}
          aria-label="Story title"
        />

        <button
          id="pv"
          onClick={() => {
            const next = !isPreviewMode;
            setIsPreviewMode(next);
            document.body.classList.toggle('pv', next);
          }}
        >
          {isPreviewMode ? 'Back to editing' : 'Preview'}
        </button>

        <button
          id="import-btn"
          type="button"
          onClick={triggerImport}
          title="Import story JSON file"
        >
          Import
        </button>

        <div className="export-dropdown-container" ref={exportMenuRef}>
          <button
            id="export-btn"
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export options"
          >
            Export ▾
          </button>
          {showExportMenu && (
            <div className="export-menu">
              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  handleExportJson();
                }}
              >
                📄 Export JSON (Project)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  handleExportPng();
                }}
              >
                🖼️ Export PNG (Current Page)
              </button>
            </div>
          )}
        </div>

        <button id="save" className="pri" onClick={handleSave}>
          Save
        </button>

        {/* Hidden file input for JSON import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".json,application/json"
          style={{ display: 'none' }}
        />
      </header>

      {/* 3-Column Studio Grid Layout */}
      <div className="studio">
        {/* Left Column Tools */}
        <aside className="sidebar-col sidebar-left">
          {/* Tool: My Chogs */}
          <section id="chogs" className={`tool ${mobileTab === 'chogs' ? 'on' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h2>My Chogs</h2>
            {isTestAccess && (
              <span className="test-badge" style={{ fontSize: '0.62rem', padding: '2px 7px' }}>
                Test access
              </span>
            )}
          </div>

          <div className="list" id="list">
            {ownedChogs.map((chog, idx) => {
              const isSelected = currentTile.c === idx;
              return (
                <button
                  key={chog.tokenId || idx}
                  className="chip"
                  aria-pressed={isSelected ? 'true' : 'false'}
                  onClick={() => {
                    updateCurrentTile((tile) => {
                      tile.c = idx;
                    });
                    setActiveChog(chog);
                  }}
                >
                  <img
                    src={chog.imageUrl || `/chogs/${(idx % 5) + 1}.webp`}
                    alt={chog.name}
                  />
                  <span>#{chog.tokenId || (1462 + idx)}</span>
                </button>
              );
            })}
          </div>

          {isTestAccess && (
            <button
              type="button"
              className="btn-pick-hero"
              onClick={() => setShowCastPicker(true)}
              title="Pick any supporting-cast Chog as hero"
            >
              ★ Pick Hero from Cast ({supportingCast.length})
            </button>
          )}

          <h3 style={{ marginTop: '16px' }}>Supporting cast</h3>
          <p className="hint">The Chog Genesis cast ({supportingCast.length}). Drop any into a panel or set as hero.</p>
          <div className="list" style={{ maxHeight: '160px', overflowY: 'auto' }}>
            {supportingCast.slice(0, 48).map((castMember) => (
              <button
                key={castMember.tokenId}
                className="chip"
                style={{ opacity: 0.95 }}
                onClick={() => {
                  if (isTestAccess) {
                    pickCastAsHero(castMember);
                    updateCurrentTile((tile) => {
                      tile.c = 0;
                    });
                    showToast(`Hero set to ${castMember.name}!`);
                  } else {
                    pickCastAsHero(castMember);
                    showToast(`Using ${castMember.name}`);
                  }
                }}
                title={isTestAccess ? `Set ${castMember.name} as hero` : `Use ${castMember.name}`}
              >
                <img src={castMember.imageUrl} alt={castMember.name} loading="lazy" />
                <span>#{castMember.tokenId}</span>
              </button>
            ))}
          </div>

          <h3>Art version</h3>
          <label>
            <input type="radio" name="artVersion" defaultChecked /> Original
          </label>
          <label>
            <input type="radio" name="artVersion" disabled /> Cutout
          </label>
          <p className="hint">Cutout shows only for Chogs with an approved cutout. None here yet.</p>

          <h3>Story</h3>
          <button id="story" onClick={handleWriteStarterStory}>
            Write starter story
          </button>
          <p className="hint">Fills this page from the selected Chog's traits.</p>
        </section>

        {/* Tool: This Page */}
        <section id="page" className={`tool ${mobileTab === 'page' ? 'on' : ''}`}>
          <h2>This page</h2>
          <label htmlFor="lay">Panels</label>
          <select
            id="lay"
            value={currentPage.l}
            onChange={(e) => handleLayoutChange(e.target.value as ComicLayout)}
          >
            <option value="l2">2 stacked</option>
            <option value="l3">3 (wide on top)</option>
            <option value="l3s">3 stacked</option>
            <option value="l4">4 grid</option>
          </select>

          <h3>Page color</h3>
          <div className="sw" id="gbg">
            {SW.map((color) => (
              <button
                key={color}
                aria-pressed={currentPage.bg === color ? 'true' : 'false'}
                style={{ backgroundColor: color }}
                onClick={() => {
                  const next = [...pages];
                  next[currentPageIndex] = { ...next[currentPageIndex], bg: color };
                  setPages(next);
                }}
              />
            ))}
          </div>
          <p className="hint">Flat, quiet colors so the comic stays the focus.</p>
        </section>
      </aside>

      {/* Center Canvas */}
      <main id="canvas">
          <div id="pages-tray-container">
            {/* If Preview Mode: Render All Pages */}
            {isPreviewMode ? (
              pages.map((pg, pageIdx) => (
                <div
                  key={pageIdx}
                  className="page"
                  data-l={pg.l}
                  style={{ backgroundColor: pg.bg }}
                >
                  {pg.p.map((panel, pIdx) => (
                    <div
                      key={pIdx}
                      className="panel"
                      style={{
                        gridArea: PANEL_AREA_NAMES[pIdx] || 'a',
                        backgroundColor: panel.bg,
                      }}
                    >
                      {panel.k.map((tile, tIdx) => {
                        const chogImg = ownedChogs[tile.c]?.imageUrl || `/chogs/${(tile.c % 5) + 1}.webp`;
                        return (
                          <React.Fragment key={tIdx}>
                            <div
                              className={`tile ${tile.fill ? 'fill' : ''}`}
                              style={
                                tile.fill
                                  ? {}
                                  : ({
                                      '--s': tile.s,
                                      '--tx': tile.tx,
                                      '--ty': tile.ty,
                                    } as any)
                              }
                            >
                              <img
                                src={chogImg}
                                alt="Chog"
                                style={{
                                  transform: `scale(${tile.z}) translate(${tile.x}%, ${tile.y}%) scaleX(${tile.f ? -1 : 1})`,
                                }}
                              />
                            </div>
                            {tile.bt && (
                              <div
                                className={`b ${tile.bs === 'r' ? 'r' : ''}`}
                                style={{ left: `${tile.bx}%`, top: `${tile.by}%` }}
                              >
                                {tile.bt}
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {panel.cap && <div className="cap">{panel.cap}</div>}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              /* Active Editing Page */
              <div
                className="page"
                data-l={currentPage.l}
                style={{ backgroundColor: currentPage.bg }}
              >
                {currentPage.p.map((panel, pIdx) => {
                  const isPanelSelected = selectedPanelIndex === pIdx;
                  const areaName = PANEL_AREA_NAMES[pIdx] || 'a';

                  return (
                    <div
                      key={pIdx}
                      className={`panel ${isPanelSelected ? 'sel' : ''}`}
                      style={{
                        gridArea: areaName,
                        backgroundColor: panel.bg,
                      }}
                      onClick={() => {
                        setSelectedPanelIndex(pIdx);
                        setSelectedChogTileIndex(0);
                      }}
                    >
                      {panel.k.map((tile, tIdx) => {
                        const isTileSelected = isPanelSelected && selectedChogTileIndex === tIdx;
                        const chogImg = ownedChogs[tile.c]?.imageUrl || `/chogs/${(tile.c % 5) + 1}.webp`;

                        return (
                          <React.Fragment key={tIdx}>
                            <div
                              className={`tile ${tile.fill ? 'fill' : ''} ${isTileSelected ? 'me' : ''}`}
                              style={
                                tile.fill
                                  ? {}
                                  : ({
                                      '--s': tile.s,
                                      '--tx': tile.tx,
                                      '--ty': tile.ty,
                                    } as any)
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPanelIndex(pIdx);
                                setSelectedChogTileIndex(tIdx);
                              }}
                              onPointerDown={(e) => {
                                setSelectedPanelIndex(pIdx);
                                setSelectedChogTileIndex(tIdx);
                                startDrag(e, 'tile', { tx: tile.tx, ty: tile.ty });
                              }}
                            >
                              <img
                                src={chogImg}
                                alt="Chog"
                                style={{
                                  transform: `scale(${tile.z}) translate(${tile.x}%, ${tile.y}%) scaleX(${tile.f ? -1 : 1})`,
                                }}
                              />
                            </div>

                            {tile.bt && (
                              <div
                                className={`b ${tile.bs === 'r' ? 'r' : ''} ${isTileSelected ? 'active-bubble' : ''}`}
                                style={{ left: `${tile.bx}%`, top: `${tile.by}%` }}
                                title="Click to edit words or drag to position"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPanelIndex(pIdx);
                                  setSelectedChogTileIndex(tIdx);
                                  setMobileTab('text');
                                  setTimeout(() => {
                                    if (tIdx === 0) {
                                      bubbleRef0.current?.focus();
                                    } else {
                                      bubbleRef1.current?.focus();
                                    }
                                  }, 50);
                                }}
                                onPointerDown={(e) => {
                                  setSelectedPanelIndex(pIdx);
                                  setSelectedChogTileIndex(tIdx);
                                  startDrag(e, 'bubble', { bx: tile.bx, by: tile.by });
                                }}
                              >
                                {tile.bt}
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {panel.cap && <div className="cap">{panel.cap}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tray */}
            <div id="tray">
              {pages.map((pg, pageIdx) => (
                <button
                  key={pageIdx}
                  className="th"
                  aria-current={currentPageIndex === pageIdx ? 'true' : 'false'}
                  onClick={() => {
                    setCurrentPageIndex(pageIdx);
                    setSelectedPanelIndex(0);
                    setSelectedChogTileIndex(0);
                  }}
                >
                  <div
                    className="page"
                    data-l={pg.l}
                    style={{ backgroundColor: pg.bg }}
                  >
                    {pg.p.map((panel, pIdx) => (
                      <div
                        key={pIdx}
                        className="panel"
                        style={{
                          gridArea: PANEL_AREA_NAMES[pIdx] || 'a',
                          backgroundColor: panel.bg,
                        }}
                      />
                    ))}
                  </div>
                  <span>Page {pageIdx + 1}</span>
                </button>
              ))}

              <button className="add" onClick={handleAddNewPage}>
                + New page
              </button>
            </div>
          </div>
        </main>

        {/* Right Column Tools */}
        <aside className="sidebar-col sidebar-right">
          {/* Tool: Selected Panel Art */}
          <section id="art-tool" className={`tool ${mobileTab === 'art' ? 'on' : ''}`}>
          <h2>Selected panel</h2>
          <h3>Panel color</h3>
          <div className="sw" id="pbg">
            {SW.map((color) => (
              <button
                key={color}
                aria-pressed={currentPanel.bg === color ? 'true' : 'false'}
                style={{ backgroundColor: color }}
                onClick={() => {
                  updateCurrentPanel((panel) => {
                    panel.bg = color;
                  });
                }}
              />
            ))}
          </div>

          <h3>Chogs in this panel</h3>
          <button id="add2" onClick={handleToggleSecondChog}>
            {currentPanel.k.length > 1 ? '— Remove second Chog' : '+ Add second Chog'}
          </button>

          {currentPanel.k.length > 1 && (
            <>
              <div id="who" className="sw seg">
                <button
                  data-w="0"
                  aria-pressed={selectedChogTileIndex === 0 ? 'true' : 'false'}
                  onClick={() => setSelectedChogTileIndex(0)}
                >
                  Chog 1
                </button>
                <button
                  data-w="1"
                  aria-pressed={selectedChogTileIndex === 1 ? 'true' : 'false'}
                  onClick={() => setSelectedChogTileIndex(1)}
                >
                  Chog 2
                </button>
              </div>

              <div id="arrw">
                <label htmlFor="arr">Arrangement</label>
                <select
                  id="arr"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleArrangement(e.target.value as any);
                  }}
                >
                  <option value="" disabled>Choose...</option>
                  <option value="side">Side by side</option>
                  <option value="overlap">Overlapping</option>
                  <option value="inset">Small inset</option>
                </select>
              </div>
            </>
          )}

          <h3>Selected Chog</h3>
          <label htmlFor="pc">Chog</label>
          <select
            id="pc"
            value={currentTile.c}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateCurrentTile((tile) => {
                tile.c = val;
              });
            }}
          >
            {ownedChogs.map((chog, idx) => (
              <option key={chog.tokenId || idx} value={idx}>
                {chog.name || `Chog #${chog.tokenId || idx}`}
              </option>
            ))}
          </select>

          <label htmlFor="sz">
            Art size <b>{currentTile.s}%</b>
          </label>
          <input
            id="sz"
            type="range"
            min="30"
            max="100"
            value={currentTile.s}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateCurrentTile((tile) => {
                tile.s = val;
              });
            }}
          />

          <label>
            <input
              id="fi"
              type="checkbox"
              checked={!!currentTile.fill}
              onChange={(e) => {
                const val = e.target.checked ? 1 : 0;
                updateCurrentTile((tile) => {
                  tile.fill = val;
                });
              }}
            />{' '}
            Fill the whole panel
          </label>

          <label htmlFor="tx">Position left / right</label>
          <input
            id="tx"
            type="range"
            min="-45"
            max="45"
            value={currentTile.tx}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateCurrentTile((tile) => {
                tile.tx = val;
              });
            }}
          />

          <label htmlFor="ty">Position up / down</label>
          <input
            id="ty"
            type="range"
            min="-45"
            max="45"
            value={currentTile.ty}
            onChange={(e) => {
              const val = Number(e.target.value);
              updateCurrentTile((tile) => {
                tile.ty = val;
              });
            }}
          />

          <details>
            <summary>Crop inside the art</summary>
            <label htmlFor="zm">
              Zoom <b>{currentTile.z.toFixed(2)}</b>
            </label>
            <input
              id="zm"
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={currentTile.z}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateCurrentTile((tile) => {
                  tile.z = val;
                });
              }}
            />

            <label htmlFor="cx">Crop left / right</label>
            <input
              id="cx"
              type="range"
              min="-60"
              max="60"
              value={currentTile.x}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateCurrentTile((tile) => {
                  tile.x = val;
                });
              }}
            />

            <label htmlFor="cy">Crop up / down</label>
            <input
              id="cy"
              type="range"
              min="-60"
              max="60"
              value={currentTile.y}
              onChange={(e) => {
                const val = Number(e.target.value);
                updateCurrentTile((tile) => {
                  tile.y = val;
                });
              }}
            />
          </details>

          <label>
            <input
              id="fl"
              type="checkbox"
              checked={!!currentTile.f}
              onChange={(e) => {
                const val = e.target.checked ? 1 : 0;
                updateCurrentTile((tile) => {
                  tile.f = val;
                });
              }}
            />{' '}
            Flip
          </label>
          <p className="hint" style={{ marginBottom: '6px' }}>
            Drag the art or a bubble in the panel to move it. With two Chogs, tap one to edit it.
          </p>
        </section>

        {/* Tool: Words */}
        <section id="text-tool" className={`tool ${mobileTab === 'text' ? 'on' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Words</h2>
          </div>

          {/* Caption Box */}
          <label htmlFor="cp" style={{ marginTop: '2px', fontWeight: 700 }}>Caption box</label>
          <textarea
            id="cp"
            rows={2}
            value={currentPanel.cap}
            placeholder="Scene narration or location (optional)..."
            onChange={(e) => {
              const text = e.target.value;
              updateCurrentPanel((panel) => {
                panel.cap = text;
              });
            }}
          />

          {currentPanel.k.length <= 1 ? (
            /* Single Character Bubble */
            <div className="bubble-editor-single" style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="bt" style={{ margin: 0, fontWeight: 700 }}>
                  Speech bubble ({ownedChogs[currentPanel.k[0]?.c]?.name || 'Hero'})
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--mut)' }}>Tail:</span>
                  <select
                    id="bs"
                    value={currentPanel.k[0]?.bs || 'l'}
                    style={{ padding: '2px 6px', fontSize: '0.85rem' }}
                    onChange={(e) => {
                      const side = e.target.value as 'l' | 'r';
                      updateCurrentTile((tile) => {
                        tile.bs = side;
                      });
                    }}
                  >
                    <option value="l">Left ◄</option>
                    <option value="r">Right ►</option>
                  </select>
                </div>
              </div>

              <textarea
                id="bt"
                ref={bubbleRef0}
                rows={2}
                value={currentPanel.k[0]?.bt || ''}
                placeholder="Type words... (Press Enter to add second dialogue)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddSecondChog();
                    setTimeout(() => {
                      bubbleRef1.current?.focus();
                    }, 60);
                  }
                }}
                onChange={(e) => {
                  const text = e.target.value;
                  updateCurrentTile((tile) => {
                    tile.bt = text;
                  });
                }}
              />
              <p className="hint">Press Enter to add a second Chog and start their reply.</p>
            </div>
          ) : (
            /* Dual Character Bubbles */
            <div className="dual-bubble-editor" style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--mut)', marginBottom: '4px' }}>
                Dual dialogue active in this panel:
              </div>

              {/* Bubble 1 */}
              <div
                className={`bubble-card ${selectedChogTileIndex === 0 ? 'active' : ''}`}
                style={{
                  border: selectedChogTileIndex === 0 ? '2px solid var(--org)' : '2px solid var(--line)',
                  borderRadius: '10px',
                  padding: '8px',
                  background: selectedChogTileIndex === 0 ? 'rgba(242, 154, 31, 0.08)' : 'var(--card)',
                }}
                onClick={() => setSelectedChogTileIndex(0)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedChogTileIndex === 0 ? 'var(--org)' : 'var(--ink)' }}>
                    1. {ownedChogs[currentPanel.k[0]?.c]?.name || 'Chog #1'} (Left)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--mut)' }}>Tail:</span>
                    <select
                      value={currentPanel.k[0]?.bs || 'l'}
                      style={{ padding: '2px 4px', fontSize: '0.8rem' }}
                      onChange={(e) => {
                        const side = e.target.value as 'l' | 'r';
                        updateCurrentPanel((panel) => {
                          if (panel.k[0]) panel.k[0].bs = side;
                        });
                      }}
                    >
                      <option value="l">Left ◄</option>
                      <option value="r">Right ►</option>
                    </select>
                  </div>
                </div>

                <textarea
                  ref={bubbleRef0}
                  rows={2}
                  value={currentPanel.k[0]?.bt || ''}
                  placeholder="First Chog's words... (Press Enter to jump to reply)"
                  onFocus={() => setSelectedChogTileIndex(0)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      setSelectedChogTileIndex(1);
                      bubbleRef1.current?.focus();
                    }
                  }}
                  onChange={(e) => {
                    const text = e.target.value;
                    updateCurrentPanel((panel) => {
                      if (panel.k[0]) panel.k[0].bt = text;
                    });
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Bubble 2 */}
              <div
                className={`bubble-card ${selectedChogTileIndex === 1 ? 'active' : ''}`}
                style={{
                  border: selectedChogTileIndex === 1 ? '2px solid var(--org)' : '2px solid var(--line)',
                  borderRadius: '10px',
                  padding: '8px',
                  background: selectedChogTileIndex === 1 ? 'rgba(242, 154, 31, 0.08)' : 'var(--card)',
                }}
                onClick={() => setSelectedChogTileIndex(1)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedChogTileIndex === 1 ? 'var(--org)' : 'var(--ink)' }}>
                    2. {ownedChogs[currentPanel.k[1]?.c]?.name || 'Chog #2'} (Right)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--mut)' }}>Tail:</span>
                    <select
                      value={currentPanel.k[1]?.bs || 'r'}
                      style={{ padding: '2px 4px', fontSize: '0.8rem' }}
                      onChange={(e) => {
                        const side = e.target.value as 'l' | 'r';
                        updateCurrentPanel((panel) => {
                          if (panel.k[1]) panel.k[1].bs = side;
                        });
                      }}
                    >
                      <option value="l">Left ◄</option>
                      <option value="r">Right ►</option>
                    </select>
                  </div>
                </div>

                <textarea
                  ref={bubbleRef1}
                  rows={2}
                  value={currentPanel.k[1]?.bt || ''}
                  placeholder="Second Chog's reply..."
                  onFocus={() => setSelectedChogTileIndex(1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      bubbleRef1.current?.blur();
                      showToast('Dialogue updated!');
                    }
                  }}
                  onChange={(e) => {
                    const text = e.target.value;
                    updateCurrentPanel((panel) => {
                      if (panel.k[1]) panel.k[1].bt = text;
                    });
                  }}
                  style={{ width: '100%' }}
                />
              </div>

              <p className="hint">Tap any bubble on the canvas to select and drag it. Leave empty to hide.</p>
            </div>
          )}
        </section>
      </aside>

      {/* Mobile Tabs */}
        <nav className="tabs" role="tablist">
          {(['chogs', 'page', 'art', 'text'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={mobileTab === tab ? 'true' : 'false'}
              onClick={() => setMobileTab(tab)}
              className="capitalize"
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Local Test Access Cast Picker Modal */}
      {showCastPicker && (
        <div className="cast-modal-backdrop" onClick={() => setShowCastPicker(false)}>
          <div className="cast-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cast-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.35rem' }}>Pick Any Cast Chog as Hero</h3>
                  <span className="test-badge">Test access</span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--mut)' }}>
                  Local development test access — all {supportingCast.length} Chogs available.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCastPicker(false)}
                style={{ padding: '6px 14px', fontSize: '0.95rem' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ padding: '12px 16px', borderBottom: '2px solid var(--line)', background: 'var(--card)' }}>
              <input
                type="text"
                placeholder="Search by ID (e.g. 1462) or trait..."
                value={castSearch}
                onChange={(e) => setCastSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '2px solid var(--line)',
                  background: 'var(--bg)',
                  color: 'var(--ink)',
                  fontSize: '1rem',
                }}
                autoFocus
              />
            </div>

            <div className="cast-modal-grid">
              {filteredCast.map((c) => {
                const isCurrent = activeChog?.tokenId === c.tokenId;
                return (
                  <button
                    key={c.tokenId}
                    type="button"
                    className={`cast-modal-chip ${isCurrent ? 'active' : ''}`}
                    onClick={() => {
                      pickCastAsHero(c);
                      updateCurrentTile((tile) => {
                        tile.c = 0;
                      });
                      setShowCastPicker(false);
                      showToast(`Hero set to ${c.name}!`);
                    }}
                    title={`Pick ${c.name} as Hero`}
                  >
                    <img src={c.imageUrl} alt={c.name} loading="lazy" />
                    <span>#{c.tokenId}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Toast */}
      <div id="msg" role="status" className={toastMessage ? 'on' : ''}>
        {toastMessage}
      </div>
    </div>
  );
};
