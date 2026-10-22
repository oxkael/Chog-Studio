import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '../context/WalletContext';

interface LandingHeroProps {
  onEnterStudio: () => void;
}

const CHOG_IMAGES = [
  '/chogs/1.webp',
  '/chogs/2.webp',
  '/chogs/3.webp',
  '/chogs/4.webp',
  '/chogs/5.webp',
];

const CAPTIONS = [
  'Pick a layout.',
  'Drop in your Chogs.',
  'Add your words.',
  'Save the page.',
];

const STAGE_BG = ['#EADFCB', '#D3DEC9', '#F2D6D1', '#CFE0EA'];
const TYPE_TEXT = 'Say it in a bubble.';

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const LandingHero: React.FC<LandingHeroProps> = ({ onEnterStudio }) => {
  const {
    isConnected,
    address,
    connectWallet,
    isTestAccess,
    isEligible,
    eligibilityError,
    retryEligibilityCheck,
  } = useWallet();

  const [showGateModal, setShowGateModal] = useState(false);

  // Section and animation element refs
  const barRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const showRef = useRef<HTMLElement>(null);
  const pgsRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const tkRef = useRef<HTMLDivElement>(null);
  const mqRef = useRef<HTMLDivElement>(null);
  const pgRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const tyRef = useRef<HTMLDivElement>(null);

  const [activeCaption, setActiveCaption] = useState(CAPTIONS[0]);
  const [activeStepDot, setActiveStepDot] = useState(0);
  const [activeHowStep, setActiveHowStep] = useState(0);
  const [activeLayoutBtn, setActiveLayoutBtn] = useState(0);

  // Animation values stored in refs for buttery-smooth 60fps tick loop
  const animRef = useRef({
    tx: 0,
    ty: 0,
    cx: 0,
    cy: 0,
    lastY: 0,
    vel: 0,
    mo: 0,
    ci: -1,
    hi: -1,
  });

  // Mouse tilt pointermove listener
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      animRef.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      animRef.current.ty = (e.clientY / window.innerHeight) * 2 - 1;

      // Magnetic effect on .btn.mag
      document.querySelectorAll<HTMLElement>('.btn.mag').forEach((b) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < 110) {
          b.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
        } else {
          b.style.transform = 'translate(0, 0)';
        }
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Main scroll-pinning and physics requestAnimationFrame loop
  useEffect(() => {
    let reqId: number;

    const getProg = (el: HTMLElement | null) => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      const denom = r.height - window.innerHeight;
      if (denom <= 0) return 0;
      return clamp(-r.top / denom);
    };

    const tick = () => {
      const y = window.scrollY;
      const a = animRef.current;
      a.vel = lerp(a.vel, y - a.lastY, 0.15);
      a.lastY = y;

      // Top progress accent bar
      if (barRef.current) {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        barRef.current.style.transform = `scaleX(${y / maxScroll})`;
      }

      // Compact nav toggle
      if (navRef.current) {
        if (y > 40) {
          navRef.current.classList.add('sm');
        } else {
          navRef.current.classList.remove('sm');
        }
      }

      // 3D Parallax Tilt on Hero Art
      if (artRef.current) {
        a.cx = lerp(a.cx, a.tx, 0.08);
        a.cy = lerp(a.cy, a.ty, 0.08);
        artRef.current.style.setProperty('--mx', a.cx.toFixed(3));
        artRef.current.style.setProperty('--my', a.cy.toFixed(3));
        artRef.current.style.setProperty('--sy', Math.min(y, 900).toString());
      }

      // Section #show: Step progress, Panel pop-in, Background color shift
      const p = getProg(showRef.current);
      if (pgRef.current) {
        const panels = pgRef.current.querySelectorAll<HTMLElement>('.pn');
        panels.forEach((n, k) => {
          n.style.setProperty('--f', clamp((p - k * 0.2) / 0.16).toString());
          n.style.setProperty('--b', clamp((p - k * 0.2 - 0.1) / 0.08).toString());
        });

        const i = p < 0.2 ? 0 : p < 0.45 ? 1 : p < 0.7 ? 2 : 3;
        if (i !== a.ci) {
          a.ci = i;
          setActiveCaption(CAPTIONS[i]);
          setActiveStepDot(i);
          pgRef.current.style.backgroundColor = STAGE_BG[i];
        }
      }

      // Section #pages: Horizontal Slide Track + Skew by Velocity!
      // The track finishes travelling completely horizontally before reaching #how
      const pgsProg = getProg(pgsRef.current);
      if (tkRef.current) {
        const maxTranslate = tkRef.current.scrollWidth - window.innerWidth + window.innerWidth * 0.05;
        const currentTx = -pgsProg * Math.max(0, maxTranslate);
        const currentSk = clamp(a.vel * -0.12, -7, 7);
        tkRef.current.style.setProperty('--tx', `${currentTx}px`);
        tkRef.current.style.setProperty('--sk', `${currentSk.toFixed(2)}deg`);
      }

      // Section .final: Marquee velocity animation
      if (mqRef.current) {
        a.mo = (a.mo + 0.6 + Math.abs(a.vel) * 1.1) % (mqRef.current.scrollWidth / 2);
        mqRef.current.style.transform = `translateX(${-a.mo}px)`;
      }

      // Section #how: Vertical step progress rail & typewriter
      const q = getProg(howRef.current);
      const h = clamp(Math.floor(q * 3), 0, 2);
      if (railRef.current) {
        const fillBar = railRef.current.querySelector('b');
        if (fillBar) fillBar.style.height = `${q * 100}%`;
      }
      if (h !== a.hi) {
        a.hi = h;
        setActiveHowStep(h);
      }
      if (tyRef.current) {
        const charsToShow = Math.round(clamp(q * 3 - 2) * TYPE_TEXT.length);
        tyRef.current.textContent = TYPE_TEXT.slice(0, charsToShow);
      }

      reqId = requestAnimationFrame(tick);
    };

    reqId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(reqId);
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (!isConnected) {
        await connectWallet();
      }
      if (isTestAccess || isEligible) {
        onEnterStudio();
      } else {
        setShowGateModal(true);
      }
    } catch {
      onEnterStudio();
    }
  };

  const handleEnterStudioClick = () => {
    if (!isConnected) {
      handleConnectWallet();
      return;
    }
    if (isTestAccess || isEligible) {
      onEnterStudio();
    } else {
      setShowGateModal(true);
    }
  };

  return (
    <div className="w-full overflow-x-clip">
      {/* Scroll Progress Accent Bar */}
      <div id="bar" ref={barRef} />

      {/* Sticky Comic Navigation Bar */}
      <nav id="nav" ref={navRef}>
        <span
          className="logo cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Chog Studio
        </span>
        <a href="#show">The comic</a>
        <a href="#pages">Pages</a>
        <a href="#how">How it works</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isTestAccess && (
            <span className="test-badge" title="Local development test access active">
              Test access
            </span>
          )}
          {isConnected && (
            <button
              onClick={handleEnterStudioClick}
              className="btn pri mag"
              style={{ padding: '6px 14px', fontSize: '0.95rem' }}
            >
              Enter Studio →
            </button>
          )}
          <button
            onClick={handleConnectWallet}
            className={`btn ${isConnected ? '' : 'pri'} mag`}
            style={{ padding: '6px 14px', fontSize: '0.95rem' }}
          >
            {isConnected && address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : 'Connect wallet'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero" id="top">
        <div>
          <h1>
            <span className="w" style={{ '--i': 0 } as any}>Every</span>{' '}
            <span className="w" style={{ '--i': 1 } as any}>Chog</span>
            <br />
            <span className="w" style={{ '--i': 2 } as any}>deserves</span>{' '}
            <span className="w" style={{ '--i': 3 } as any}>a</span>{' '}
            <span className="w" style={{ '--i': 4 } as any}>story.</span>
          </h1>
          <p>
            Turn your Monad NFT into a comic strip star. Pick your layout, place your Chog, write the bubbles, and bring your story to life panel by panel.
          </p>
          <div className="row">
            <button onClick={handleEnterStudioClick} className="btn pri big mag">
              {isConnected ? 'Enter Studio →' : 'Connect wallet'}
            </button>
            <a className="btn big mag" href="#how">
              How it works
            </a>
          </div>
        </div>

        {/* 3D Perspective Chog Card Stack */}
        <div id="art" ref={artRef}>
          <div className="c m" style={{ '--d': 1, '--r': '-3deg' } as any}>
            <img src={CHOG_IMAGES[0]} alt="Chog with purple cap and Bitcoin glasses" />
          </div>
          <div className="c a" style={{ '--d': 2.2, '--r': '6deg' } as any}>
            <img src={CHOG_IMAGES[3]} alt="Crying Chog in blue hat" />
          </div>
          <div className="c b" style={{ '--d': 1.8, '--r': '-7deg' } as any}>
            <img src={CHOG_IMAGES[4]} alt="Chog in grey star cap" />
          </div>
          <div className="c e" style={{ '--d': 2.8, '--r': '4deg' } as any}>
            <img src={CHOG_IMAGES[2]} alt="Chog in red hat" />
          </div>
        </div>
      </header>

      {/* Section 1: Pinned Showcase with Dynamic Panel Scaling and Color Shift */}
      <section
        id="show"
        ref={showRef}
        className="pin alt"
        style={{ '--h': '340vh' } as any}
      >
        <div className="stick">
          <div className="sh">
            <h2>Build a page, panel by panel.</h2>
            <p className="hand" id="cap">
              {activeCaption}
            </p>
          </div>

          <div className="stage">
            {/* Dots */}
            <div className="dots" id="dots">
              {[0, 1, 2, 3].map((k) => (
                <i key={k} className={k <= activeStepDot ? 'on' : ''} />
              ))}
            </div>

            {/* Live 3-Panel Page */}
            <div className="pg" id="pg" ref={pgRef}>
              {/* Panel A (Top Wide) */}
              <div className="pn" style={{ gridArea: 'a', background: '#CFE0EA' }}>
                <div className="t" style={{ '--s': 52, '--x': -26 } as any}>
                  <img src={CHOG_IMAGES[0]} alt="" />
                </div>
                <div className="t" style={{ '--s': 52, '--x': 26 } as any}>
                  <img src={CHOG_IMAGES[3]} alt="" />
                </div>
                <div className="bb" style={{ '--l': '4%' } as any}>
                  Your words
                </div>
              </div>

              {/* Panel B (Bottom Left) */}
              <div className="pn" style={{ gridArea: 'b', background: '#F3E6B0' }}>
                <div className="t" style={{ '--s': 62, '--x': 0 } as any}>
                  <img src={CHOG_IMAGES[4]} alt="" />
                </div>
                <div className="bb" style={{ '--l': '8%' } as any}>
                  Your words
                </div>
              </div>

              {/* Panel C (Bottom Right) */}
              <div className="pn" style={{ gridArea: 'c', background: '#F2D6D1' }}>
                <div className="t" style={{ '--s': 62, '--x': 0 } as any}>
                  <img src={CHOG_IMAGES[2]} alt="" />
                </div>
                <div className="cp">Your caption</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Pinned Horizontal Scrolling Track */}
      {/* 320vh height pins the screen while cards slide fully across horizontally */}
      <section
        id="pages"
        ref={pgsRef}
        className="pin"
        style={{ '--h': '320vh' } as any}
      >
        <div className="stick hz">
          <div className="sh">
            <h2>Pages made in the studio.</h2>
            <p className="hand">Keep scrolling. The pages slide by.</p>
          </div>

          <div className="track" id="tk" ref={tkRef}>
            {/* Card 1: The Dip Page 1 */}
            <div className="k comic-card" title="The Dip — Page 1">
              <img src="/comics/comic-1.webp" alt="The Dip Comic Strip Page 1" className="comic-page-img" loading="lazy" />
            </div>

            {/* Card 2: The Dip Page 2 */}
            <div className="k comic-card" title="The Dip — Page 2">
              <img src="/comics/comic-2.webp" alt="The Dip Comic Strip Page 2" className="comic-page-img" loading="lazy" />
            </div>

            {/* Card 3: The Dip Page 3 */}
            <div className="k comic-card" title="The Dip — Page 3">
              <img src="/comics/comic-3.webp" alt="The Dip Comic Strip Page 3" className="comic-page-img" loading="lazy" />
            </div>

            {/* Card 4: Ice Cream Page 1 */}
            <div className="k comic-card" title="Ice Cream — Page 1">
              <img src="/comics/comic-4.webp" alt="Ice Cream Comic Strip Page 1" className="comic-page-img" loading="lazy" />
            </div>

            {/* Card 5: Ice Cream Page 2 */}
            <div className="k comic-card" title="Ice Cream — Page 2">
              <img src="/comics/comic-5.webp" alt="Ice Cream Comic Strip Page 2" className="comic-page-img" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Pinned How It Works with Animated Rail & Panes */}
      <section
        id="how"
        ref={howRef}
        className="pin alt"
        style={{ '--h': '300vh' } as any}
      >
        <div className="stick how">
          <div>
            <h2>How it works</h2>
            <div className="steps">
              <span className="rail" id="rail" ref={railRef}>
                <b />
              </span>
              <ol id="ol">
                <li className={activeHowStep >= 0 ? 'on' : ''}>
                  <h3>1. Connect your wallet</h3>
                  <p>We check that you own a Chog. No transaction, no fees.</p>
                </li>
                <li className={activeHowStep >= 1 ? 'on' : ''}>
                  <h3>2. Compose your pages</h3>
                  <p>Choose a layout, drop in one or two Chogs per panel, and set the colors.</p>
                </li>
                <li className={activeHowStep >= 2 ? 'on' : ''}>
                  <h3>3. Add words and save</h3>
                  <p>Write the bubbles, preview every page, and save your story.</p>
                </li>
              </ol>
            </div>
          </div>

          {/* Interactive Panes */}
          <div className="panes">
            {/* Pane 1: Wallet connected */}
            <div className={`pane ${activeHowStep === 0 ? 'on' : ''}`}>
              <div className="v">
                <img src={CHOG_IMAGES[0]} alt="Chog found" />
                <span className="ok">Chog found</span>
              </div>
              <p className="hand" style={{ fontSize: '1.4rem' }}>
                Wallet connected
              </p>
            </div>

            {/* Pane 2: Layout preview buttons */}
            <div className={`pane ${activeHowStep === 1 ? 'on' : ''}`}>
              <div className="lo" id="lo">
                <button
                  aria-pressed={activeLayoutBtn === 0 ? 'true' : 'false'}
                  aria-label="2 panels"
                  style={{ gridTemplateRows: '1fr 1fr' }}
                  onClick={() => setActiveLayoutBtn(0)}
                >
                  <i />
                  <i />
                </button>
                <button
                  aria-pressed={activeLayoutBtn === 1 ? 'true' : 'false'}
                  aria-label="3 panels, wide on top"
                  style={{ gridTemplate: '1fr 1fr / 1fr 1fr' }}
                  onClick={() => setActiveLayoutBtn(1)}
                >
                  <i style={{ gridColumn: '1 / 3' }} />
                  <i />
                  <i />
                </button>
                <button
                  aria-pressed={activeLayoutBtn === 2 ? 'true' : 'false'}
                  aria-label="3 panels stacked"
                  style={{ gridTemplateRows: '1fr 1fr 1fr' }}
                  onClick={() => setActiveLayoutBtn(2)}
                >
                  <i />
                  <i />
                  <i />
                </button>
                <button
                  aria-pressed={activeLayoutBtn === 3 ? 'true' : 'false'}
                  aria-label="4 panels"
                  style={{ gridTemplate: '1fr 1fr / 1fr 1fr' }}
                  onClick={() => setActiveLayoutBtn(3)}
                >
                  <i />
                  <i />
                  <i />
                  <i />
                </button>
              </div>
              <p className="hand" style={{ fontSize: '1.4rem' }}>
                Try a layout
              </p>
            </div>

            {/* Pane 3: Typewriter Text */}
            <div className={`pane ${activeHowStep === 2 ? 'on' : ''}`}>
              <div className="ty" id="ty" ref={tyRef}>
                {TYPE_TEXT}
              </div>
              <p className="hand" style={{ fontSize: '1.4rem' }}>
                Type it. Place it. Save it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Final CTA with Angled Animated Marquee */}
      <section className="final">
        <div className="mq" aria-hidden="true">
          <div id="mq" ref={mqRef}>
            {[
              ...CHOG_IMAGES,
              ...CHOG_IMAGES,
              ...CHOG_IMAGES,
              ...CHOG_IMAGES,
            ].map((src, idx) => (
              <div key={idx} className="t2">
                <img alt="" src={src} />
              </div>
            ))}
          </div>
        </div>

        <h2>Your Chog has a story.</h2>
        <button onClick={handleEnterStudioClick} className="btn pri big mag">
          Enter the studio
        </button>
      </section>

      {/* Footer */}
      <footer>
        <span>Chog Studio</span>
        <span>Made for Chog Genesis holders on Monad</span>
      </footer>

      {/* Ownership Gate Modal */}
      {showGateModal && (
        <div className="cast-modal-backdrop" onClick={() => setShowGateModal(false)}>
          <div className="cast-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="cast-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                {eligibilityError ? 'Network Connection Note' : 'You need a Chog to enter'}
              </h3>
              <button
                type="button"
                onClick={() => setShowGateModal(false)}
                style={{ padding: '4px 10px', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', lineHeight: 1.6 }}>
              {eligibilityError ? (
                <div>
                  <p style={{ marginBottom: '16px' }}>{eligibilityError}</p>
                  {eligibilityError.includes('No wallet') ? (
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn pri"
                      style={{ width: '100%', padding: '10px', display: 'block', textAlign: 'center' }}
                    >
                      Get MetaMask →
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn pri"
                      style={{ width: '100%', padding: '10px' }}
                      onClick={async () => {
                        await retryEligibilityCheck();
                        if (isEligible) {
                          setShowGateModal(false);
                          onEnterStudio();
                        }
                      }}
                    >
                      Retry Monad Verification
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ marginBottom: '12px' }}>
                    Chog Studio is exclusively crafted for holders of the <strong>Chog Genesis NFT</strong> collection on Monad.
                  </p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--mut)', marginBottom: '16px', background: 'var(--card)', padding: '10px', borderRadius: '8px' }}>
                    Contract: <code style={{ wordBreak: 'break-all' }}>0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763</code>
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--mut)' }}>
                    Once you hold a Chog Genesis NFT in your connected wallet, refresh or reconnect to start making comics.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
