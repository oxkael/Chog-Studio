import React from 'react';

export type ChogVariant = 'classic' | 'detective' | 'cyber' | 'hero' | 'peeking';

interface ChogCharacterArtProps {
  variant?: ChogVariant;
  className?: string;
  isReacting?: boolean;
}

export const ChogCharacterArt: React.FC<ChogCharacterArtProps> = ({
  variant = 'classic',
  className = 'w-48 h-48',
  isReacting = false,
}) => {
  return (
    <div
      className={`relative inline-block transition-transform duration-300 ${
        isReacting ? 'scale-110 -rotate-3' : 'group-hover:scale-105'
      } ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(36,33,31,0.25)] select-none"
      >
        {/* Soft shadow under Chog */}
        <ellipse cx="100" cy="180" rx="65" ry="14" fill="#24211F" fillOpacity="0.2" />

        {/* Chog Frog Body */}
        <ellipse
          cx="100"
          cy="115"
          rx="72"
          ry="62"
          fill="#52B788"
          stroke="#24211F"
          strokeWidth="6"
        />

        {/* Belly Patch (Cream Warm) */}
        <ellipse
          cx="100"
          cy="132"
          rx="45"
          ry="38"
          fill="#F7F1E7"
          stroke="#24211F"
          strokeWidth="4"
        />

        {/* Left Eye Dome */}
        <circle
          cx="62"
          cy="65"
          r="26"
          fill="#52B788"
          stroke="#24211F"
          strokeWidth="6"
        />
        {/* Right Eye Dome */}
        <circle
          cx="138"
          cy="65"
          r="26"
          fill="#52B788"
          stroke="#24211F"
          strokeWidth="6"
        />

        {/* Eye Whites */}
        <circle
          cx="62"
          cy="65"
          r="19"
          fill="#FFFDF8"
          stroke="#24211F"
          strokeWidth="4"
        />
        <circle
          cx="138"
          cy="65"
          r="19"
          fill="#FFFDF8"
          stroke="#24211F"
          strokeWidth="4"
        />

        {/* Eye Pupils (animate or shift on reaction) */}
        <circle
          cx={isReacting ? "66" : "64"}
          cy={isReacting ? "61" : "66"}
          r="9"
          fill="#24211F"
        />
        <circle
          cx={isReacting ? "142" : "140"}
          cy={isReacting ? "61" : "66"}
          r="9"
          fill="#24211F"
        />

        {/* Pupil Highlights */}
        <circle cx={isReacting ? "68" : "66"} cy={isReacting ? "59" : "63"} r="3" fill="#FFFDF8" />
        <circle cx={isReacting ? "144" : "142"} cy={isReacting ? "59" : "63"} r="3" fill="#FFFDF8" />

        {/* Big Grin Mouth */}
        {isReacting ? (
          /* Surprised / Happy Open Mouth */
          <path
            d="M 68 120 Q 100 155 132 120 Z"
            fill="#E87535"
            stroke="#24211F"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        ) : (
          /* Cheerful Smirk */
          <path
            d="M 65 125 Q 100 148 135 125"
            stroke="#24211F"
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}

        {/* Rosy Cheeks */}
        <ellipse cx="50" cy="120" rx="10" ry="6" fill="#E8A5A0" fillOpacity="0.8" />
        <ellipse cx="150" cy="120" rx="10" ry="6" fill="#E8A5A0" fillOpacity="0.8" />

        {/* --- Variant Accessories --- */}

        {/* Detective: Fedora Hat */}
        {variant === 'detective' && (
          <g transform="translate(0, -8)">
            <ellipse
              cx="100"
              cy="48"
              rx="68"
              ry="16"
              fill="#24211F"
              stroke="#24211F"
              strokeWidth="4"
            />
            <path
              d="M 60 48 C 60 18, 75 14, 100 14 C 125 14, 140 18, 140 48 Z"
              fill="#3C3835"
              stroke="#24211F"
              strokeWidth="5"
            />
            <rect x="62" y="40" width="76" height="8" fill="#E87535" />
          </g>
        )}

        {/* Cyber: VR Goggles */}
        {variant === 'cyber' && (
          <g transform="translate(0, 0)">
            <rect
              x="40"
              y="52"
              width="120"
              height="28"
              rx="12"
              fill="#8DCBD0"
              stroke="#24211F"
              strokeWidth="5"
            />
            <rect x="48" y="58" width="48" height="16" rx="6" fill="#24211F" />
            <rect x="104" y="58" width="48" height="16" rx="6" fill="#24211F" />
            <line x1="52" y1="66" x2="92" y2="66" stroke="#8DCBD0" strokeWidth="3" />
            <line x1="108" y1="66" x2="148" y2="66" stroke="#8DCBD0" strokeWidth="3" />
            {/* Strap */}
            <path d="M 40 66 L 25 70" stroke="#24211F" strokeWidth="5" strokeLinecap="round" />
            <path d="M 160 66 L 175 70" stroke="#24211F" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {/* Hero: Headband & Lightning Cape */}
        {variant === 'hero' && (
          <g>
            <path
              d="M 40 50 Q 100 38 160 50"
              stroke="#E87535"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Lightning bolt badge on chest */}
            <polygon
              points="102,122 92,138 100,138 96,152 110,134 102,134"
              fill="#E87535"
              stroke="#24211F"
              strokeWidth="3"
            />
          </g>
        )}

        {/* Peeking: Hands gripping over the panel border */}
        {variant === 'peeking' && (
          <g>
            {/* Left little hand */}
            <ellipse cx="45" cy="165" rx="14" ry="10" fill="#52B788" stroke="#24211F" strokeWidth="4" />
            {/* Right little hand */}
            <ellipse cx="155" cy="165" rx="14" ry="10" fill="#52B788" stroke="#24211F" strokeWidth="4" />
          </g>
        )}
      </svg>
    </div>
  );
};
