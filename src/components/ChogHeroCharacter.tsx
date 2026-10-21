import React, { useState, useEffect, useRef } from 'react';

export const ChogHeroCharacter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [bubbleText, setBubbleText] = useState<string>("👀 I see you!");
  const [isWinking, setIsWinking] = useState(false);

  // Global mouse tracker for eyes following cursor anywhere on the hero
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Relative coordinates from center of character (-1 to 1 range roughly)
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);

      setMousePos({
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Pupil max travel range in percentage of eye socket
  const maxTravelX = 6; // %
  const maxTravelY = 5; // %
  const pupilOffsetX = mousePos.x * maxTravelX;
  const pupilOffsetY = mousePos.y * maxTravelY;

  // 3D Card tilt calculation
  const cardTiltX = -mousePos.y * 5; // deg
  const cardTiltY = mousePos.x * 5; // deg

  const handleCardClick = () => {
    setIsWinking(true);
    const quips = [
      "✨ Ready to script my first panel?",
      "⚡ 10,000 TPS and eyes that move!",
      "💜 You bring the story, I'll bring the vibes.",
      "🚀 Let's make comic history on Monad!",
      "👀 I'm locked onto your cursor!",
    ];
    setBubbleText(quips[Math.floor(Math.random() * quips.length)]);
    setTimeout(() => setIsWinking(false), 300);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md lg:max-w-lg aspect-square flex items-center justify-center select-none"
      style={{ perspective: '1000px' }}
    >
      {/* Calm subtle backdrop shadow card */}
      <div className="absolute inset-0 bg-canvas-subtle rounded-3xl border-2 border-ink/20 translate-x-3 translate-y-3 -z-10"></div>

      {/* Main Comic Framed NFT Container with 3D tilt */}
      <div
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full h-full bg-white rounded-3xl comic-border-thick p-4 sm:p-5 shadow-comic-lg flex flex-col justify-between cursor-pointer transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${cardTiltX}deg) rotateY(${cardTiltY}deg)`,
        }}
      >
        {/* Top Comic Header Band */}
        <div className="flex items-center justify-between border-b-2 border-ink/20 pb-2.5 text-xs font-black uppercase tracking-wider">
          <span className="bg-ink text-white px-2 py-0.5 rounded-md shadow-comic-sm font-comic text-xs">
            GENESIS HERO
          </span>
          <span className="font-comic text-sm tracking-wide text-ink">
            CHOG #1178
          </span>
          <span className="text-brand font-black">MONAD</span>
        </div>

        {/* Artwork Layer with Interactive Moving Eyes */}
        <div className="relative w-full flex-1 rounded-2xl overflow-hidden comic-border my-2.5 bg-[#686FFE]">
          {/* Base Real Chog NFT Artwork */}
          <img
            src="/chog-hero.jpg"
            alt="Chog Genesis NFT"
            className="w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
          />

          {/* Left Eye Interactive Socket (Viewer's Left) */}
          <div
            className="absolute overflow-hidden rounded-full pointer-events-none"
            style={{
              left: '40.25%',
              top: '48.5%',
              width: '21.75%',
              height: '20.5%',
              backgroundColor: '#FFFFFF',
              border: '2.5px solid #16192E',
            }}
          >
            {/* Moving Pupil */}
            <div
              className={`absolute rounded-full bg-[#16192E] transition-transform duration-75 ease-out ${
                isWinking ? 'scale-y-10' : ''
              }`}
              style={{
                width: '64%',
                height: '78%',
                left: '18%',
                top: '11%',
                transform: `translate(${pupilOffsetX}%, ${pupilOffsetY}%)`,
              }}
            >
              {/* Eye Light Highlights (White shine reflections) */}
              <div className="absolute top-[18%] left-[24%] w-[38%] h-[38%] rounded-full bg-white"></div>
              <div className="absolute bottom-[20%] right-[22%] w-[22%] h-[22%] rounded-full bg-white"></div>
            </div>
          </div>

          {/* Right Eye Interactive Socket (Viewer's Right) */}
          <div
            className="absolute overflow-hidden rounded-full pointer-events-none"
            style={{
              left: '64%',
              top: '47.75%',
              width: '12.25%',
              height: '21.5%',
              backgroundColor: '#FFFFFF',
              border: '2.5px solid #16192E',
            }}
          >
            {/* Moving Pupil */}
            <div
              className={`absolute rounded-full bg-[#16192E] transition-transform duration-75 ease-out ${
                isWinking ? 'scale-y-10' : ''
              }`}
              style={{
                width: '74%',
                height: '76%',
                left: '13%',
                top: '12%',
                transform: `translate(${pupilOffsetX}%, ${pupilOffsetY}%)`,
              }}
            >
              {/* Eye Light Highlights (White shine reflections) */}
              <div className="absolute top-[18%] left-[24%] w-[38%] h-[38%] rounded-full bg-white"></div>
              <div className="absolute bottom-[20%] right-[22%] w-[22%] h-[22%] rounded-full bg-white"></div>
            </div>
          </div>

          {/* Interactive Speech Bubble pinned to Chog (Using exact face butter cream #FDF7D3) */}
          <div
            className={`absolute top-3 left-3 max-w-[200px] bg-chog-face comic-border rounded-xl p-2.5 shadow-comic transition-all duration-300 ${
              isHovered ? 'scale-105 -translate-y-1' : ''
            }`}
          >
            <p className="font-bold text-xs text-ink leading-snug">
              {bubbleText}
            </p>
            {/* Bubble tail */}
            <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-ink"></div>
            <div className="absolute -bottom-1 left-[17px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-chog-face"></div>
          </div>
        </div>

        {/* Bottom Bar: Interactive Cue */}
        <div className="flex items-center justify-between text-[11px] font-bold text-ink-muted pt-1">
          <span>Move mouse to guide eyes • Tap to talk</span>
          <span className="text-brand font-black">Interactive NFT</span>
        </div>
      </div>
    </div>
  );
};
