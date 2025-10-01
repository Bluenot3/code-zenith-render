import { ThemeType } from '@/state/useStore';

export interface ThemeConfig {
  name: string;
  className: ThemeType;
  sceneBackground: string;
  codeTextColor: string;
  particleColor: string;
  description: string;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  dark: {
    name: 'Dark',
    className: 'dark',
    sceneBackground: '#0A0F1A',
    codeTextColor: '#FFFFFF',
    particleColor: '#00FFD5',
    description: 'Deep tech black with cyan accents',
  },
  light: {
    name: 'Light',
    className: 'light',
    sceneBackground: '#FFFFFF',
    codeTextColor: '#000000',
    particleColor: '#00B3A0',
    description: 'Clean white with black text for maximum readability',
  },
  neon: {
    name: 'Neon',
    className: 'neon',
    sceneBackground: '#160A28',
    codeTextColor: '#FF00FF',
    particleColor: '#FF00FF',
    description: 'Electric pink and purple vibes',
  },
  cyberpunk: {
    name: 'Cyberpunk',
    className: 'cyberpunk',
    sceneBackground: '#0D1A26',
    codeTextColor: '#FFFF00',
    particleColor: '#FF00FF',
    description: 'Yellow and magenta dystopian future',
  },
  crystal: {
    name: 'Crystal',
    className: 'crystal',
    sceneBackground: '#0D1419',
    codeTextColor: '#66D9FF',
    particleColor: '#66D9FF',
    description: 'Ice blue refractive clarity',
  },
  glass: {
    name: 'Glass',
    className: 'glass',
    sceneBackground: '#0F1519',
    codeTextColor: '#3399FF',
    particleColor: '#3399FF',
    description: 'Smooth blue glass morphism',
  },
  holo: {
    name: 'Hologram',
    className: 'holo',
    sceneBackground: '#0A1914',
    codeTextColor: '#00FF99',
    particleColor: '#CC00FF',
    description: 'Sci-fi holographic projection',
  },
  aqua: {
    name: 'Aqua',
    className: 'aqua',
    sceneBackground: '#0D1619',
    codeTextColor: '#00FFFF',
    particleColor: '#00FFFF',
    description: 'Deep ocean cyan and teal',
  },
  dusk: {
    name: 'Dusk',
    className: 'dusk',
    sceneBackground: '#1A1109',
    codeTextColor: '#FFAA33',
    particleColor: '#FFAA33',
    description: 'Warm sunset orange glow',
  },
  midnight: {
    name: 'Midnight',
    className: 'midnight',
    sceneBackground: '#08080F',
    codeTextColor: '#6699FF',
    particleColor: '#6699FF',
    description: 'Deep blue night sky',
  },
  zen: {
    name: 'ZEN Brand',
    className: 'dark',
    sceneBackground: '#0A0F1A',
    codeTextColor: '#00FFD5',
    particleColor: '#00FFD5',
    description: 'Official ZEN cyan signature',
  },
};

export const applyTheme = (theme: ThemeType) => {
  const config = THEMES[theme];
  document.documentElement.className = config.className;
  return config;
};