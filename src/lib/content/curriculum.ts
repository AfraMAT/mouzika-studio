/**
 * Curriculum structure and gamification metadata. Human-readable strings come
 * from the i18n dictionaries; this file carries the structural data (icons,
 * colours, lesson counts, node states, achievements).
 */

export interface TrackMeta {
  icon: string;
  color: string;
  soft: string;
  count: string;
}

/** The eight-track canonical path shown on the landing curriculum grid. */
export const CURRICULUM_TRACKS: TrackMeta[] = [
  { icon: 'piano', color: '#CBF24E', soft: 'rgba(203,242,78,0.12)', count: '12' },
  { icon: 'grid_view', color: '#8B7CFF', soft: 'rgba(139,124,255,0.12)', count: '14' },
  { icon: 'music_note', color: '#4FE3E0', soft: 'rgba(79,227,224,0.12)', count: '13' },
  { icon: 'tune', color: '#FF5C93', soft: 'rgba(255,92,147,0.12)', count: '16' },
  { icon: 'architecture', color: '#FF9A3C', soft: 'rgba(255,154,60,0.12)', count: '11' },
  { icon: 'equalizer', color: '#CBF24E', soft: 'rgba(203,242,78,0.12)', count: '15' },
  { icon: 'campaign', color: '#8B7CFF', soft: 'rgba(139,124,255,0.12)', count: '9' },
];

export type NodeState = 'done' | 'current' | 'locked';

export interface UnitMeta {
  color: string;
  shadow: string;
  ring: string;
  soft: string;
  icon: string;
  nodes: { state: NodeState; keepIcon?: boolean; icon?: string; big?: boolean }[];
}

/** Skill-tree node states for the Learn (home) screen. */
export const HOME_UNITS: UnitMeta[] = [
  {
    color: '#CBF24E',
    shadow: '#7f9f2b',
    ring: 'rgba(203,242,78,0.22)',
    soft: 'rgba(203,242,78,0.07)',
    icon: 'piano',
    nodes: [
      { state: 'done' },
      { state: 'done' },
      { state: 'current' },
      { state: 'locked' },
      { state: 'locked' },
      { state: 'locked', keepIcon: true, icon: 'workspace_premium', big: true },
    ],
  },
  {
    color: '#8B7CFF',
    shadow: '#584db0',
    ring: 'rgba(139,124,255,0.22)',
    soft: 'rgba(139,124,255,0.06)',
    icon: 'grid_view',
    nodes: [{ state: 'locked' }, { state: 'locked' }, { state: 'locked' }, { state: 'locked' }],
  },
];

/** Horizontal offsets for the winding skill-tree path. */
export const NODE_WIND = [0, 46, 66, 46, 0, -46, -66, -46];

export interface Achievement {
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
  color: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { icon: 'bolt', name: 'First Beat', desc: 'Made your first 8-bar loop.', earned: true, color: '#CBF24E' },
  { icon: 'local_fire_department', name: 'Week Warrior', desc: 'Kept a 7-day streak alive.', earned: true, color: '#FF9A3C' },
  { icon: 'hearing', name: 'Golden Ears', desc: '20 EQ challenges in a row.', earned: true, color: '#4FE3E0' },
  { icon: 'piano', name: 'In Key', desc: 'Built 10 diatonic progressions.', earned: true, color: '#8B7CFF' },
  { icon: 'tune', name: 'Balanced', desc: 'Finished a full mix session.', earned: false, color: '#FF5C93' },
  { icon: 'album', name: 'Streaming Ready', desc: 'Landed a master in the −14 LUFS pocket.', earned: false, color: '#CBF24E' },
  { icon: 'architecture', name: 'Full Arc', desc: 'Arranged intro → drop → outro.', earned: false, color: '#4FE3E0' },
  { icon: 'smart_toy', name: 'AI Producer', desc: 'Completed the Produce-with-AI track.', earned: false, color: '#8B7CFF' },
];

/** Feature-card metadata for the landing "why Mouzika" grid. */
export const FEATURE_META = {
  colors: ['#CBF24E', '#FF9A3C', '#8B7CFF', '#4FE3E0'],
  soft: ['rgba(203,242,78,0.12)', 'rgba(255,154,60,0.12)', 'rgba(139,124,255,0.12)', 'rgba(79,227,224,0.12)'],
  hover: ['rgba(203,242,78,0.3)', 'rgba(255,154,60,0.3)', 'rgba(139,124,255,0.3)', 'rgba(79,227,224,0.3)'],
  icons: ['touch_app', 'local_fire_department', 'auto_awesome', 'graphic_eq'],
};

export const AI_STEP_ICONS = ['lightbulb', 'layers', 'tune', 'verified'];
export const FACT_COLORS = ['#CBF24E', '#4FE3E0', '#8B7CFF', '#FF9A3C'];
