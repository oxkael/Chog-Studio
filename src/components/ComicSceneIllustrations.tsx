import React from 'react';
import { PanelScene } from '../types/comic';

interface ComicSceneIllustrationProps {
  scene: PanelScene;
  className?: string;
}

export const ComicSceneIllustration: React.FC<ComicSceneIllustrationProps> = ({
  scene,
  className = 'w-full h-full',
}) => {
  switch (scene) {
    case 'park-wall-2d':
      return (
        <div className={`relative ${className} overflow-hidden`}>
          <img
            src="/scenes/park-wall-2d.jpg"
            alt="Flat 2D Park Wall"
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
        </div>
      );

    case 'park-walkway':
      return (
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
          {/* Sky with soft halftone */}
          <rect width="400" height="400" fill="#E8F1F5" />
          <circle cx="330" cy="80" r="45" fill="#FDF7D3" stroke="#16192E" strokeWidth="3" />
          
          {/* Background hills */}
          <path d="M-20 260 Q 90 200 220 250 T 420 220 L 420 400 L -20 400 Z" fill="#95C8A6" stroke="#16192E" strokeWidth="3" />
          
          {/* Comic park trees */}
          <g>
            {/* Trunk */}
            <path d="M 60 170 L 65 310 L 80 310 L 82 170 Z" fill="#7C6049" stroke="#16192E" strokeWidth="3" />
            {/* Foliage cloud puffs */}
            <circle cx="50" cy="160" r="32" fill="#58A878" stroke="#16192E" strokeWidth="3" />
            <circle cx="85" cy="140" r="40" fill="#69BD8A" stroke="#16192E" strokeWidth="3" />
            <circle cx="95" cy="175" r="30" fill="#4D966B" stroke="#16192E" strokeWidth="3" />
          </g>

          {/* Cobblestone walkway */}
          <path d="M 50 400 L 160 270 L 250 270 L 370 400 Z" fill="#D5D0C7" stroke="#16192E" strokeWidth="3" />
          <line x1="120" y1="320" x2="280" y2="320" stroke="#16192E" strokeWidth="2" strokeDasharray="6 8" />
          <line x1="80" y1="365" x2="330" y2="365" stroke="#16192E" strokeWidth="2" strokeDasharray="10 12" />

          {/* Vintage Park Lamp */}
          <path d="M 310 330 L 314 180 L 322 180 L 326 330 Z" fill="#282D4D" stroke="#16192E" strokeWidth="2.5" />
          <polygon points="305,180 331,180 326,155 310,155" fill="#FDF7D3" stroke="#16192E" strokeWidth="2.5" />
          <circle cx="318" cy="168" r="8" fill="#FFF275" />
          {/* Bench silhouette */}
          <rect x="250" y="275" width="45" height="12" rx="2" fill="#9C6B45" stroke="#16192E" strokeWidth="2" />
          <line x1="255" y1="287" x2="255" y2="300" stroke="#16192E" strokeWidth="2.5" />
          <line x1="290" y1="287" x2="290" y2="300" stroke="#16192E" strokeWidth="2.5" />
        </svg>
      );

    case 'neon-city':
      return (
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
          {/* Dark purple night sky */}
          <rect width="400" height="400" fill="#141126" />
          
          {/* Monad City Skyline buildings */}
          <rect x="20" y="110" width="70" height="290" fill="#1E1A38" stroke="#16192E" strokeWidth="3" />
          <rect x="110" y="70" width="85" height="330" fill="#29224D" stroke="#16192E" strokeWidth="3" />
          <rect x="215" y="130" width="65" height="270" fill="#1E1A38" stroke="#16192E" strokeWidth="3" />
          <rect x="300" y="90" width="80" height="310" fill="#221C42" stroke="#16192E" strokeWidth="3" />
          
          {/* Lit windows in buildings */}
          <g fill="#686FFE" fillOpacity="0.7">
            <rect x="35" y="130" width="10" height="15" rx="1" />
            <rect x="60" y="160" width="10" height="15" rx="1" />
            <rect x="130" y="90" width="12" height="18" rx="1" fill="#FDF7D3" />
            <rect x="155" y="120" width="12" height="18" rx="1" />
            <rect x="130" y="160" width="12" height="18" rx="1" />
            <rect x="325" y="115" width="10" height="14" rx="1" fill="#FDF7D3" />
            <rect x="350" y="145" width="10" height="14" rx="1" />
          </g>

          {/* Neon Billboard */}
          <rect x="120" y="210" width="65" height="26" rx="4" fill="#686FFE" stroke="#16192E" strokeWidth="2.5" />
          <text x="126" y="228" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif">MONAD</text>

          {/* Glowing City Walkway */}
          <path d="M 0 310 L 400 310 L 400 400 L 0 400 Z" fill="#201C38" stroke="#16192E" strokeWidth="3" />
          <line x1="0" y1="355" x2="400" y2="355" stroke="#686FFE" strokeWidth="3" strokeDasharray="20 15" />
          <circle cx="200" cy="355" r="4" fill="#686FFE" />
        </svg>
      );

    case 'comic-study':
      return (
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
          {/* Warm study wall */}
          <rect width="400" height="400" fill="#E8DFD0" />
          {/* Wood panel wainscoting */}
          <rect x="0" y="260" width="400" height="140" fill="#A4754E" stroke="#16192E" strokeWidth="3" />
          <line x1="0" y1="260" x2="400" y2="260" stroke="#16192E" strokeWidth="4" />
          <line x1="80" y1="260" x2="80" y2="400" stroke="#16192E" strokeWidth="2" />
          <line x1="160" y1="260" x2="160" y2="400" stroke="#16192E" strokeWidth="2" />
          <line x1="240" y1="260" x2="240" y2="400" stroke="#16192E" strokeWidth="2" />
          <line x1="320" y1="260" x2="320" y2="400" stroke="#16192E" strokeWidth="2" />

          {/* Bookshelf on left */}
          <rect x="25" y="40" width="110" height="210" fill="#7A5233" stroke="#16192E" strokeWidth="3" />
          <line x1="25" y1="105" x2="135" y2="105" stroke="#16192E" strokeWidth="3" />
          <line x1="25" y1="170" x2="135" y2="170" stroke="#16192E" strokeWidth="3" />
          {/* Books */}
          <rect x="35" y="60" width="12" height="45" fill="#686FFE" stroke="#16192E" strokeWidth="1.5" />
          <rect x="49" y="55" width="14" height="50" fill="#D14278" stroke="#16192E" strokeWidth="1.5" />
          <rect x="65" y="63" width="10" height="42" fill="#FDF7D3" stroke="#16192E" strokeWidth="1.5" />
          <rect x="77" y="58" width="15" height="47" fill="#5C36B0" stroke="#16192E" strokeWidth="1.5" />

          {/* Hanging lamp from ceiling */}
          <line x1="280" y1="0" x2="280" y2="90" stroke="#16192E" strokeWidth="3" />
          <polygon points="255,120 305,120 290,90 270,90" fill="#5C36B0" stroke="#16192E" strokeWidth="2.5" />
          <circle cx="280" cy="120" r="12" fill="#FDF7D3" />

          {/* Framed picture on wall */}
          <rect x="180" y="60" width="60" height="75" rx="3" fill="#FFFFFF" stroke="#16192E" strokeWidth="3" />
          <circle cx="210" cy="95" r="16" fill="#686FFE" />
        </svg>
      );

    case 'crypto-forest':
      return (
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
          {/* Deep blue twilight sky */}
          <rect width="400" height="400" fill="#1B2236" />
          {/* Crescent Moon */}
          <path d="M 330 50 A 25 25 0 0 0 320 85 A 25 25 0 1 1 330 50 Z" fill="#FDF7D3" stroke="#16192E" strokeWidth="2" />

          {/* Rolling dark green forest hills */}
          <path d="M-20 240 Q 80 190 210 230 T 420 200 L 420 400 L -20 400 Z" fill="#1C382A" stroke="#16192E" strokeWidth="3" />
          <path d="M-20 300 Q 120 260 250 290 T 420 270 L 420 400 L -20 400 Z" fill="#27503B" stroke="#16192E" strokeWidth="3" />

          {/* Stylized comic pine trees */}
          <polygon points="50,140 25,190 75,190" fill="#15472E" stroke="#16192E" strokeWidth="2.5" />
          <polygon points="50,110 30,150 70,150" fill="#1A593A" stroke="#16192E" strokeWidth="2.5" />
          <polygon points="50,85 35,120 65,120" fill="#236E49" stroke="#16192E" strokeWidth="2.5" />

          <polygon points="350,160 320,215 380,215" fill="#15472E" stroke="#16192E" strokeWidth="2.5" />
          <polygon points="350,130 325,175 375,175" fill="#1A593A" stroke="#16192E" strokeWidth="2.5" />
        </svg>
      );

    case 'action-burst':
      return (
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
          <rect width="400" height="400" fill="#F0F2FE" />
          {/* Radial action burst rays from center (200, 200) */}
          <polygon points="200,200 0,20 0,60" fill="#686FFE" fillOpacity="0.25" />
          <polygon points="200,200 30,0 80,0" fill="#686FFE" fillOpacity="0.25" />
          <polygon points="200,200 150,0 200,0" fill="#686FFE" fillOpacity="0.3" />
          <polygon points="200,200 270,0 320,0" fill="#686FFE" fillOpacity="0.25" />
          <polygon points="200,200 380,0 400,30" fill="#686FFE" fillOpacity="0.25" />
          <polygon points="200,200 400,100 400,150" fill="#686FFE" fillOpacity="0.3" />
          <polygon points="200,200 400,220 400,270" fill="#686FFE" fillOpacity="0.25" />
          <polygon points="200,200 400,350 370,400" fill="#686FFE" fillOpacity="0.25" />
          <polygon points="200,200 300,400 250,400" fill="#686FFE" fillOpacity="0.3" />
          <polygon points="200,200 180,400 130,400" fill="#686FFE" fillOpacity="0.25" />
          <polygon points="200,200 60,400 0,380" fill="#686FFE" fillOpacity="0.25" />
          <polygon points="200,200 0,300 0,250" fill="#686FFE" fillOpacity="0.3" />
          <polygon points="200,200 0,180 0,130" fill="#686FFE" fillOpacity="0.25" />
        </svg>
      );

    case 'halftone-slate':
      return (
        <div className="w-full h-full bg-white bg-halftone-light" />
      );

    case 'clean-newsprint':
    default:
      return (
        <div className="w-full h-full bg-white" />
      );
  }
};
