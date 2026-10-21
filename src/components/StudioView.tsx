import React, { useState, useRef } from 'react';
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
  const { ownedChogs, setActiveChog } = useWallet();

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
    const chog = ownedChogs[chogIdx] || ownedChogs[0];
    const name = chog?.name || `Chog #${chog?.tokenId || '1462'}`;

    const starterLines = [
      { cap: `${name} wakes up to a green candle.`, bubble: "Wait... is it happening?!", zoom: 1 },
      { cap: 'Double checking the order book.', bubble: 'Every metric looks solid.', zoom: 1.8 },
      { cap: 'Sudden high-volume Monad spike.', bubble: 'LFG! Never faded!', zoom: 1.2 },
      { cap: 'Another chapter in the chronicles.', bubble: 'Your Chog. Your story.', zoom: 1 },
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
          f: i === 3 ? 1 : 0,
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

        <button id="save" className="pri" onClick={handleSave}>
          Save
        </button>
      </header>

      {/* 3-Column Studio Grid Layout */}
      <div className="studio">
        {/* Tool: My Chogs */}
        <section id="chogs" className={`tool ${mobileTab === 'chogs' ? 'on' : ''}`}>
          <h2>My Chogs</h2>
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
                                className={`b ${tile.bs === 'r' ? 'r' : ''}`}
                                style={{ left: `${tile.bx}%`, top: `${tile.by}%` }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPanelIndex(pIdx);
                                  setSelectedChogTileIndex(tIdx);
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
          <p className="hint">Drag the art or a bubble in the panel to move it. With two Chogs, tap one to edit it.</p>
        </section>

        {/* Tool: Words */}
        <section id="text-tool" className={`tool ${mobileTab === 'text' ? 'on' : ''}`}>
          <h2>Words</h2>
          <label htmlFor="cp">Caption box</label>
          <textarea
            id="cp"
            rows={2}
            value={currentPanel.cap}
            onChange={(e) => {
              const text = e.target.value;
              updateCurrentPanel((panel) => {
                panel.cap = text;
              });
            }}
          />

          <label htmlFor="bt" id="bl">Speech bubble</label>
          <textarea
            id="bt"
            rows={2}
            value={currentTile.bt}
            onChange={(e) => {
              const text = e.target.value;
              updateCurrentTile((tile) => {
                tile.bt = text;
              });
            }}
          />

          <label htmlFor="bs">Tail side</label>
          <select
            id="bs"
            value={currentTile.bs}
            onChange={(e) => {
              const side = e.target.value as 'l' | 'r';
              updateCurrentTile((tile) => {
                tile.bs = side;
              });
            }}
          >
            <option value="l">Left</option>
            <option value="r">Right</option>
          </select>
          <p className="hint">Leave text empty to hide it.</p>
        </section>

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

      {/* Floating Status Toast */}
      <div id="msg" role="status" className={toastMessage ? 'on' : ''}>
        {toastMessage}
      </div>
    </div>
  );
};
