/** Community/demo data for Discover, Leaderboard, and Profile. */

export interface DiscoverTrack {
  id: string;
  title: string;
  artist: string;
  initial: string;
  genre: string;
  plays: string;
  likes: number;
  c: string;
}

export const DISCOVER_TRACKS: DiscoverTrack[] = [
  { id: 't1', title: 'Neon Aqueduct', artist: 'Nova Ksana', initial: 'N', genre: 'Melodic Techno', plays: '48.2k', likes: 2140, c: '#8B7CFF' },
  { id: 't2', title: 'Late Bus Home', artist: 'Léo Marchand', initial: 'L', genre: 'Lo-fi House', plays: '31.7k', likes: 1685, c: '#4FE3E0' },
  { id: 't3', title: 'Sahara Signal', artist: 'DJ Sabreen', initial: 'S', genre: 'Afro House', plays: '27.9k', likes: 1502, c: '#FF9A3C' },
  { id: 't4', title: 'Concrete Bloom', artist: 'Kwame B.', initial: 'K', genre: 'Deep House', plays: '19.3k', likes: 988, c: '#CBF24E' },
  { id: 't5', title: 'Half Light', artist: 'Yuki Tanaka', initial: 'Y', genre: 'Dubstep', plays: '22.6k', likes: 1204, c: '#FF5C93' },
  { id: 't6', title: 'Paper Planes VIP', artist: 'Ines R.', initial: 'I', genre: 'Drum & Bass', plays: '15.1k', likes: 772, c: '#4FE3E0' },
  { id: 't7', title: 'Midnight Ferry', artist: 'Mateo Cruz', initial: 'M', genre: 'Progressive', plays: '12.8k', likes: 640, c: '#8B7CFF' },
  { id: 't8', title: 'Copper Wires', artist: 'Priya N.', initial: 'P', genre: 'Techno', plays: '9.4k', likes: 511, c: '#FF9A3C' },
];

export const ART_GRADS: Record<string, string> = {
  '#8B7CFF': 'linear-gradient(135deg,#2a2350,#151726)',
  '#4FE3E0': 'linear-gradient(135deg,#123a3a,#151726)',
  '#FF9A3C': 'linear-gradient(135deg,#3a2a12,#151726)',
  '#CBF24E': 'linear-gradient(135deg,#2f3a12,#151726)',
  '#FF5C93': 'linear-gradient(135deg,#3a1626,#151726)',
};

export interface LeaderRow {
  name: string;
  initial: string;
  xp: number;
  c: string;
  you?: boolean;
}

export const LEADERBOARD: LeaderRow[] = [
  { name: 'Nova Ksana', initial: 'N', xp: 4820, c: '#8B7CFF' },
  { name: 'DJ Sabreen', initial: 'S', xp: 4310, c: '#FF9A3C' },
  { name: 'Léo Marchand', initial: 'L', xp: 3990, c: '#4FE3E0' },
  { name: 'Alex Rivers', initial: 'A', xp: 3410, c: '#CBF24E', you: true },
  { name: 'Kwame B.', initial: 'K', xp: 3180, c: '#FF5C93' },
  { name: 'Yuki Tanaka', initial: 'Y', xp: 2940, c: '#4FE3E0' },
  { name: 'Ines R.', initial: 'I', xp: 2610, c: '#8B7CFF' },
  { name: 'Mateo Cruz', initial: 'M', xp: 2280, c: '#FF9A3C' },
  { name: 'Priya N.', initial: 'P', xp: 1970, c: '#CBF24E' },
  { name: 'Tomás V.', initial: 'T', xp: 1640, c: '#FF5C93' },
];

export const MEDAL_COLORS = ['#FFD35C', '#C6CCD8', '#E29B6B'];

export interface ProfileTrack {
  title: string;
  genre: string;
  c: string;
  plays: string;
  likes: number;
}

export const PROFILE_TRACKS: ProfileTrack[] = [
  { title: 'First Light', genre: 'Deep House', c: '#CBF24E', plays: '4.1k', likes: 210 },
  { title: 'Basement Tape', genre: 'Lo-fi House', c: '#4FE3E0', plays: '2.7k', likes: 134 },
  { title: 'Reese’s Piece', genre: 'Drum & Bass', c: '#8B7CFF', plays: '1.9k', likes: 96 },
  { title: 'Cold Open', genre: 'Melodic Techno', c: '#FF9A3C', plays: '3.3k', likes: 171 },
];

export interface ActivityItem {
  icon: string;
  color: string;
  text: string;
  time: string;
}

export const PROFILE_ACTIVITY: ActivityItem[] = [
  { icon: 'workspace_premium', color: '#FF9A3C', text: 'Earned the Golden Ears badge — 20 EQ challenges in a row.', time: '2h ago' },
  { icon: 'graphic_eq', color: '#4FE3E0', text: 'Completed lesson “Sidechain compression” in Mixing.', time: 'Yesterday' },
  { icon: 'upload', color: '#CBF24E', text: 'Uploaded a new track, “Cold Open”.', time: '2 days ago' },
  { icon: 'local_fire_department', color: '#FF9A3C', text: 'Hit a 12-day streak. Keep it going!', time: '3 days ago' },
];
