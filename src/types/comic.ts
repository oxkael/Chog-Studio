export type ComicLayout = 'l2' | 'l3' | 'l3s' | 'l4';

export interface ChogTile {
  c: number; // Index into Chog list
  s: number; // Art size percentage (30 - 100)
  fill: number; // 0 = framed, 1 = fill whole panel
  tx: number; // Position X (-45 to 45)
  ty: number; // Position Y (-45 to 45)
  z: number; // Zoom (1 to 3)
  x: number; // Crop X (-60 to 60)
  y: number; // Crop Y (-60 to 60)
  f: number; // Flip (0 or 1)
  bt: string; // Speech bubble text
  bs: 'l' | 'r'; // Tail side ('l' = left, 'r' = right)
  bx: number; // Bubble X position %
  by: number; // Bubble Y position %
}

export interface PanelData {
  bg: string; // Background swatch
  cap: string; // Caption text
  k: ChogTile[]; // 1 or 2 Chogs in panel
}

export interface PageData {
  id?: string;
  l: ComicLayout; // Layout mode
  bg: string; // Page background
  p: PanelData[]; // Panels in this page
}

export interface ChogTrait {
  trait_type: string;
  value: string | number;
}

export interface ChogNFT {
  tokenId: string;
  name: string;
  imageUrl: string;
  hasApprovedCutout?: boolean;
  attributes?: any[];
}

// Legacy definitions for backward compatibility
export type BubbleType = 'speech' | 'shout' | 'thought' | 'narration';

export interface SpeechBubble {
  id: string;
  type: BubbleType;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  tailPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'none';
}

export type ArtTreatmentMode = 'original' | 'framed' | 'cutout';

export interface PanelCharacter {
  tokenId: string;
  name: string;
  imageUrl: string;
  x: number;
  y: number;
  scale: number;
  flipHorizontal: boolean;
  artMode: ArtTreatmentMode;
}

export interface MovableSFX {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export type PanelScene = 
  | 'park-wall-2d'
  | 'park-walkway'
  | 'neon-city'
  | 'comic-study'
  | 'crypto-forest'
  | 'action-burst'
  | 'clean-newsprint'
  | 'halftone-slate';

export type PanelShotType = 'medium' | 'close-up' | 'cinematic-wide' | 'dramatic-tilt';
export type ScreenToneType = 'none' | 'gloom-lines' | 'focus-speedlines' | 'halftone-dots' | 'vignette-dark';

export interface PanelCaptionBar {
  text: string;
  position: 'top' | 'bottom';
}

export interface ComicPanel {
  id: number;
  scene: PanelScene;
  shotType?: PanelShotType;
  screenTone?: ScreenToneType;
  captionBar?: PanelCaptionBar;
  frameBreak?: boolean;
  character?: PanelCharacter;
  bubbles: SpeechBubble[];
  sfxList: MovableSFX[];
  narration?: string;
}

export interface ComicStrip {
  id: string;
  title: string;
  authorAddress?: string;
  createdAt: number;
  updatedAt: number;
  panels: ComicPanel[];
}
