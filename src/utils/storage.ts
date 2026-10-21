import { ComicStrip } from '../types/comic';

const STORAGE_KEY = 'chog_studio_stories_v1';

export function getSavedStories(): ComicStrip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved stories from localStorage:', err);
    return [];
  }
}

export function saveStory(story: ComicStrip): void {
  try {
    const existing = getSavedStories();
    const index = existing.findIndex((s) => s.id === story.id);
    if (index >= 0) {
      existing[index] = { ...story, updatedAt: Date.now() };
    } else {
      existing.unshift({ ...story, updatedAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save story to localStorage:', err);
  }
}

export function exportStoryToJson(story: ComicStrip): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(story, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${story.title.replace(/\s+/g, '_')}_comic.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function createDefaultStory(customTitle?: string): ComicStrip {
  return {
    id: `story_${Date.now()}`,
    title: customTitle || 'A Day in the Life of Chog',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    panels: [
      {
        id: 1,
        scene: 'park-wall-2d',
        shotType: 'close-up',
        screenTone: 'gloom-lines',
        captionBar: {
          text: 'LOCATION: MONAD DEVNET — 02:41 AM',
          position: 'top',
        },
        sfxList: [
          {
            id: 'sfx_sob_1',
            text: '*SOB...*',
            x: 82,
            y: 35,
            rotation: -14,
            scale: 1.25,
          },
        ],
        bubbles: [
          {
            id: 'b1',
            type: 'thought',
            text: 'Why are gas fees so fast it brings tears to my eyes?!',
            x: 20,
            y: 65,
            fontSize: 14,
            tailPosition: 'bottom-left',
          },
        ],
        character: {
          tokenId: '3482',
          name: 'Chog #3482',
          imageUrl: '/chog-crying.webp',
          x: 50,
          y: 54,
          scale: 1.05,
          flipHorizontal: false,
          artMode: 'framed',
        },
      },
      {
        id: 2,
        scene: 'comic-study',
        sfxList: [],
        bubbles: [
          {
            id: 'b3',
            type: 'thought',
            text: 'I should inspect that mysterious contract...',
            x: 15,
            y: 12,
            fontSize: 14,
            tailPosition: 'bottom-right',
          },
        ],
        character: {
          tokenId: '1178',
          name: 'Chog #1178',
          imageUrl: '/chog-hero.jpg',
          x: 48,
          y: 45,
          scale: 1.05,
          flipHorizontal: true,
          artMode: 'framed',
        },
      },
      {
        id: 3,
        scene: 'action-burst',
        sfxList: [
          {
            id: 'sfx_pow_1',
            text: 'POW!',
            x: 75,
            y: 20,
            rotation: -12,
            scale: 1.3,
          },
        ],
        bubbles: [
          {
            id: 'b4',
            type: 'shout',
            text: '10,000 TPS UNLEASHED!!',
            x: 12,
            y: 65,
            fontSize: 16,
            tailPosition: 'top-left',
          },
        ],
        character: {
          tokenId: '1178',
          name: 'Chog #1178',
          imageUrl: '/chog-hero.jpg',
          x: 45,
          y: 42,
          scale: 1.2,
          flipHorizontal: false,
          artMode: 'framed',
        },
      },
      {
        id: 4,
        scene: 'neon-city',
        sfxList: [],
        bubbles: [
          {
            id: 'b5',
            type: 'speech',
            text: 'And that is why we build on Monad.',
            x: 15,
            y: 18,
            fontSize: 15,
            tailPosition: 'bottom-left',
          },
          {
            id: 'b6',
            type: 'narration',
            text: 'TO BE CONTINUED...',
            x: 45,
            y: 78,
            fontSize: 14,
            tailPosition: 'none',
          },
        ],
        character: {
          tokenId: '1178',
          name: 'Chog #1178',
          imageUrl: '/chog-hero.jpg',
          x: 52,
          y: 48,
          scale: 1,
          flipHorizontal: false,
          artMode: 'framed',
        },
      },
    ],
  };
}
