'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { EqBars } from '@/components/ui/EqLogo';

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const C = {
  canvas: '#0a0b10',
  panel: '#0c0d13',
  panel2: '#111219',
  border: 'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.08)',
  ink: '#F4F5F7',
  inkSoft: '#c8ccd6',
  muted: '#9aa0ad',
  muted2: '#6b6f7d',
  lime: '#CBF24E',
  cyan: '#4FE3E0',
  violet: '#8B7CFF',
  violetText: '#c4b9ff',
  orange: '#FF9A3C',
  pink: '#FF5C93',
} as const;

const display = 'var(--font-display)';
const mono = 'var(--font-mono)';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type ViewId =
  | 'dashboard'
  | 'analytics'
  | 'curriculum'
  | 'content'
  | 'tutor'
  | 'users'
  | 'subs'
  | 'moderation';

interface QueueItem {
  id: number;
  title: string;
  type: string;
  typeColor: string;
  source: string;
  date: string;
  conf: number;
  added: string[];
  removed: string[];
}

interface ModItem {
  id: number;
  kind: string;
  title: string;
  user: string;
  meta: string;
  flag: string;
  flagColor: string;
}

/* ------------------------------------------------------------------ */
/* Static data                                                         */
/* ------------------------------------------------------------------ */
const NAV: { group: string; items: { id: ViewId; label: string; icon: string; badge?: 'queue' | 'mod' }[] }[] = [
  {
    group: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
      { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
    ],
  },
  {
    group: 'CONTENT',
    items: [
      { id: 'curriculum', label: 'Curriculum', icon: 'school' },
      { id: 'content', label: 'Content Engine', icon: 'sync', badge: 'queue' },
      { id: 'tutor', label: 'AI Tutor', icon: 'auto_awesome' },
    ],
  },
  {
    group: 'PEOPLE',
    items: [
      { id: 'users', label: 'Users', icon: 'group' },
      { id: 'subs', label: 'Subscriptions', icon: 'credit_card' },
      { id: 'moderation', label: 'Moderation', icon: 'gavel', badge: 'mod' },
    ],
  },
];

const VIEW_META: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Platform health at a glance' },
  analytics: { title: 'Analytics', subtitle: 'Retention, funnel & engagement' },
  curriculum: { title: 'Curriculum', subtitle: 'Courses, modules & lessons' },
  content: { title: 'Content Engine', subtitle: 'Human-in-the-loop knowledge refresh' },
  tutor: { title: 'AI Tutor', subtitle: 'Knowledge base & behaviour' },
  users: { title: 'Users', subtitle: 'Accounts & progress' },
  subs: { title: 'Subscriptions', subtitle: 'Revenue & plans' },
  moderation: { title: 'Moderation', subtitle: 'Community review queue' },
};

const KPIS = [
  { label: 'Daily active users', value: '52.7K', delta: '+4.2%', icon: 'bolt', color: C.lime },
  { label: 'Monthly active', value: '133K', delta: '+6.1%', icon: 'group', color: C.cyan },
  { label: 'Paid subscribers', value: '12.2K', delta: '+3.4%', icon: 'workspace_premium', color: C.violet },
  { label: 'MRR', value: '$164K', delta: '+5.8%', icon: 'payments', color: C.lime },
  { label: 'Wk-1 activation', value: '43%', delta: '+1.9%', icon: 'rocket_launch', color: C.orange },
  { label: 'Monthly churn', value: '3.1%', delta: '-0.4%', icon: 'trending_down', color: C.pink },
];

const SIGNUP_BARS = [40, 52, 48, 63, 58, 71, 66, 80, 74, 88, 84, 97];

const ACTIVITY = [
  { icon: 'workspace_premium', text: 'nova_beats upgraded to Pro (annual)', time: '2m', color: C.lime },
  { icon: 'local_fire_department', text: 'bass_daemon hit a 112-day streak', time: '14m', color: C.orange },
  { icon: 'graphic_eq', text: '42 tracks submitted for AI feedback today', time: '38m', color: C.cyan },
  { icon: 'school', text: '"Sidechain like a pro" lesson published', time: '1h', color: C.violet },
  { icon: 'flag', text: '2 comments flagged for moderation', time: '2h', color: C.pink },
];

const FUNNEL = [
  { label: 'Signed up', pct: 100, value: '128K', color: C.cyan },
  { label: 'First win (week 1)', pct: 43, value: '55K', color: C.lime },
  { label: 'Reached lesson 10', pct: 24, value: '31K', color: C.violet },
  { label: 'Upgraded to Pro', pct: 9.5, value: '12.2K', color: C.orange },
];

const PIPELINE = [
  { n: '01', label: 'Ingest', icon: 'upload_file' },
  { n: '02', label: 'Chunk + embed', icon: 'grain' },
  { n: '03', label: 'Diff vs KB', icon: 'difference' },
  { n: '04', label: 'Classify', icon: 'category' },
  { n: '05', label: 'Human review', icon: 'how_to_reg' },
  { n: '06', label: 'Publish', icon: 'publish' },
];

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 1,
    title: 'Suno v5 raises stem separation to 12 tracks',
    type: 'Net-new',
    typeColor: C.lime,
    source: 'suno.com/changelog',
    date: 'Jul 2, 2026',
    conf: 92,
    added: ['Suno Studio now exports up to 12 stems (was 8).', 'Adds persona voice cloning + MIDI export in Studio.'],
    removed: [],
  },
  {
    id: 2,
    title: 'Ableton Live 12.3 ships native stem separation',
    type: 'Net-new',
    typeColor: C.cyan,
    source: 'ableton.com/blog',
    date: 'Jul 1, 2026',
    conf: 88,
    added: ['Live 12.3 adds native stem separation in Suite.'],
    removed: [],
  },
  {
    id: 3,
    title: 'Streaming loudness target conflict',
    type: 'Contradicts',
    typeColor: C.orange,
    source: 'producer-newsletter',
    date: 'Jun 30, 2026',
    conf: 58,
    added: ['Source claims platforms now normalise to -13 LUFS.'],
    removed: ['-14 LUFS integrated, -1 dBTP (current KB entry).'],
  },
  {
    id: 4,
    title: 'Serum pricing entry is outdated',
    type: 'Stale',
    typeColor: C.pink,
    source: 'kb-audit-bot',
    date: 'Jun 29, 2026',
    conf: 76,
    added: [],
    removed: ['"Serum costs $189" — Serum 2 shipped, re-verify pricing.'],
  },
];

const SOURCES = [
  { name: 'Ableton changelog', type: 'Firecrawl · daily', last: '2h ago', ok: true },
  { name: 'Suno changelog', type: 'Firecrawl · daily', last: '2h ago', ok: true },
  { name: 'iZotope blog', type: 'Firecrawl · weekly', last: '3d ago', ok: true },
  { name: 'Manual uploads', type: 'Admin', last: 'Jun 28', ok: false },
];

const RELEASES = [
  { ver: 'KB v14', date: 'Jul 2, 2026', changes: '12 added · 3 revised · 1 removed', by: 'Maya' },
  { ver: 'KB v13', date: 'Jun 25, 2026', changes: '8 added · 5 revised', by: 'auto + Maya' },
  { ver: 'KB v12', date: 'Jun 18, 2026', changes: '21 added · 2 removed', by: 'Maya' },
];

const COURSES = [
  { name: 'Music Foundations', lessons: 12, drafts: 0, status: 'Published', color: C.lime, icon: 'piano' },
  { name: 'Beats & Rhythm', lessons: 14, drafts: 1, status: 'Published', color: C.violet, icon: 'grid_view' },
  { name: 'Melody & Harmony', lessons: 13, drafts: 0, status: 'Published', color: C.cyan, icon: 'music_note' },
  { name: 'Sound Design', lessons: 16, drafts: 2, status: 'Published', color: C.pink, icon: 'tune' },
  { name: 'Arrangement', lessons: 11, drafts: 0, status: 'Published', color: C.orange, icon: 'architecture' },
  { name: 'Mixing', lessons: 15, drafts: 3, status: 'Published', color: C.lime, icon: 'equalizer' },
  { name: 'Mastering', lessons: 9, drafts: 0, status: 'Published', color: C.violet, icon: 'campaign' },
  { name: 'Produce with AI', lessons: 7, drafts: 4, status: 'Draft', color: C.violet, icon: 'auto_awesome' },
];

const MODULES: { title: string; lessons: { t: string; kind: string; st: string }[] }[] = [
  {
    title: 'Module 1 · Getting started',
    lessons: [
      { t: 'Meet the piano roll', kind: 'Interactive', st: 'Published' },
      { t: 'The 12 notes', kind: 'Interactive', st: 'Published' },
      { t: 'Build a scale', kind: 'Interactive', st: 'Published' },
      { t: 'Checkpoint quiz', kind: 'Quiz', st: 'Published' },
    ],
  },
  {
    title: 'Module 2 · Going deeper',
    lessons: [
      { t: 'Major vs minor', kind: 'Interactive', st: 'Published' },
      { t: 'Your first melody', kind: 'Interactive', st: 'Draft' },
      { t: 'Reading the grid', kind: 'Video', st: 'Published' },
    ],
  },
];

const USERS = [
  { name: 'Nova Rivera', handle: 'nova_beats', plan: 'Pro', streak: 47, level: 12, status: 'Active', joined: 'Jan 2026', color: C.violet },
  { name: 'Kojo Rhodes', handle: 'k_rhodes', plan: 'Pro', streak: 31, level: 10, status: 'Active', joined: 'Feb 2026', color: C.cyan },
  { name: 'Olivia Chen', handle: 'lo_fi_liv', plan: 'Free', streak: 8, level: 5, status: 'Active', joined: 'Mar 2026', color: C.lime },
  { name: 'Marco Díaz', handle: 'bass_daemon', plan: 'Lifetime', streak: 112, level: 20, status: 'Active', joined: 'Jan 2026', color: C.pink },
  { name: 'Sara Kaur', handle: 'sara_synths', plan: 'Pro', streak: 19, level: 8, status: 'Active', joined: 'Apr 2026', color: C.orange },
  { name: 'Tom Becker', handle: 'tb_techno', plan: 'Free', streak: 0, level: 2, status: 'Dormant', joined: 'May 2026', color: C.violet },
  { name: 'Amina Sow', handle: 'amina_wav', plan: 'Pro', streak: 63, level: 14, status: 'Active', joined: 'Feb 2026', color: C.cyan },
  { name: 'Leo Marín', handle: 'leo_drums', plan: 'Free', streak: 4, level: 3, status: 'Active', joined: 'Jun 2026', color: C.lime },
];

const PLAN_SHARE = [
  { name: 'Pro', count: '11,380', sub: 'monthly + annual', pct: 93, color: C.lime },
  { name: 'Lifetime', count: '820', sub: 'one-time', pct: 7, color: C.violet },
];

const TRANSACTIONS = [
  { user: 'nova_beats', plan: 'Pro · annual', amt: '+$144', time: '2m', neg: false },
  { user: 'sara_synths', plan: 'Pro · monthly', amt: '+$15', time: '26m', neg: false },
  { user: 'bass_daemon', plan: 'Lifetime', amt: '+$249', time: '1h', neg: false },
  { user: 'amina_wav', plan: 'Pro · annual', amt: '+$144', time: '3h', neg: false },
  { user: 'tb_techno', plan: 'Refund · Pro', amt: '-$15', time: '5h', neg: true },
];

const KB_STATUS = [
  { name: 'Production KB v14', items: '1,284 facts', ok: true },
  { name: 'Genre conventions', items: '112 entries', ok: true },
  { name: 'DAW & plugin index', items: '340 entries', ok: true },
  { name: 'AI-tools changelog', items: 'auto-synced', ok: false },
];

const INITIAL_MOD: ModItem[] = [
  { id: 1, kind: 'Track', title: 'Midnight Drive (WIP)', user: 'k_rhodes', meta: 'House · 124 BPM · 3:42', flag: 'Auto-scan: clear', flagColor: C.lime },
  { id: 2, kind: 'Comment', title: '"this drop is absolutely insane, teach me"', user: 'lo_fi_liv', meta: 'on "Neon Skyline"', flag: 'Reported ×1', flagColor: C.orange },
  { id: 3, kind: 'Track', title: 'untitled_final_v7', user: 'bass_daemon', meta: 'Dubstep · 140 BPM · 4:10', flag: 'Copyright: check sample', flagColor: C.pink },
  { id: 4, kind: 'Comment', title: '"link in my bio for free samples"', user: 'promo_bot_x', meta: 'on "First Light"', flag: 'Spam likely', flagColor: C.pink },
];

const RETENTION = [
  { label: 'D0', pct: 100 },
  { label: 'D1', pct: 66 },
  { label: 'D3', pct: 52 },
  { label: 'D7', pct: 44 },
  { label: 'D14', pct: 40 },
  { label: 'D30', pct: 37 },
  { label: 'D60', pct: 35 },
  { label: 'D90', pct: 34 },
];

const GENRE = [
  { name: 'House', pct: 34, color: C.lime },
  { name: 'Techno', pct: 22, color: C.cyan },
  { name: 'Melodic', pct: 16, color: C.violet },
  { name: 'Dubstep', pct: 12, color: C.pink },
  { name: 'DnB', pct: 9, color: C.orange },
  { name: 'Trap', pct: 7, color: C.violetText },
];

const DAU_TREND = [58, 62, 60, 66, 64, 70, 68, 74, 72, 78, 80, 84, 82, 88];

/* ------------------------------------------------------------------ */
/* Shared style helpers                                                */
/* ------------------------------------------------------------------ */
const cardStyle: CSSProperties = {
  background: C.panel2,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: 18,
};

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...cardStyle, ...style }}>{children}</div>;
}

function CardTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: display, fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 14 }}>
      {children}
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: 10,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color,
        background: `${color}22`,
        padding: '3px 8px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
        boxShadow: `0 0 8px ${color}66`,
        flexShrink: 0,
      }}
    />
  );
}

function candyBtn(): CSSProperties {
  return {
    fontFamily: display,
    fontWeight: 600,
    fontSize: 13,
    color: '#0a0b10',
    background: C.lime,
    border: 'none',
    borderRadius: 9,
    padding: '9px 16px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };
}

function ghostBtn(): CSSProperties {
  return {
    fontFamily: display,
    fontWeight: 600,
    fontSize: 13,
    color: C.inkSoft,
    background: 'transparent',
    border: `1px solid ${C.border2}`,
    borderRadius: 9,
    padding: '9px 16px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };
}

function IconTile({ icon, color, size = 38 }: { icon: string; color: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: `${color}22`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.55)} color={color} fill />
    </span>
  );
}

function confColor(conf: number): string {
  if (conf >= 80) return C.lime;
  if (conf >= 65) return C.orange;
  return C.pink;
}

function planColor(plan: string): string {
  if (plan === 'Pro') return C.lime;
  if (plan === 'Lifetime') return C.violet;
  return C.muted;
}

function kindColor(kind: string): string {
  if (kind === 'Interactive' || kind === 'Track') return kind === 'Track' ? C.cyan : C.lime;
  if (kind === 'Quiz' || kind === 'Comment') return C.violet;
  if (kind === 'Video') return C.cyan;
  return C.muted;
}

/* ================================================================== */
/* Main component                                                      */
/* ================================================================== */
export default function AdminConsole() {
  const [view, setView] = useState<ViewId>('dashboard');
  const [contentTab, setContentTab] = useState('queue');
  const [course, setCourse] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [modQueue, setModQueue] = useState<ModItem[]>(INITIAL_MOD);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fireToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function resolveQueue(id: number, message: string) {
    setQueue((q) => q.filter((item) => item.id !== id));
    fireToast(message);
  }

  function resolveMod(id: number, message: string) {
    setModQueue((m) => m.filter((item) => item.id !== id));
    fireToast(message);
  }

  const meta = VIEW_META[view];

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, color: C.ink, fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          insetInlineStart: 0,
          width: 230,
          height: '100vh',
          background: C.panel,
          borderInlineEnd: `1px solid ${C.border}`,
          padding: '22px 16px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26, paddingInlineStart: 4 }}>
          <EqBars height={22} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: display, fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
              mouzika<span style={{ color: C.lime }}>.studio</span>
            </span>
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.16em', color: C.muted2, marginTop: 4 }}>
              ADMIN
            </span>
          </div>
        </div>

        {NAV.map((g) => (
          <div key={g.group}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', color: C.muted2, margin: '18px 0 8px', paddingInlineStart: 8 }}>
              {g.group}
            </div>
            {g.items.map((item) => {
              const active = view === item.id;
              const badge = item.badge === 'queue' ? queue.length : item.badge === 'mod' ? modQueue.length : undefined;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '9px 10px',
                    marginBottom: 2,
                    borderRadius: 9,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'start',
                    background: active ? 'rgba(203,242,78,0.12)' : 'transparent',
                    color: active ? C.lime : C.muted,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13.5,
                    fontWeight: 500,
                  }}
                >
                  <Icon name={item.icon} size={19} color={active ? C.lime : C.muted} fill={active} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 10.5,
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                        padding: '0 5px',
                        borderRadius: 9,
                        background: active ? C.lime : 'rgba(255,255,255,0.08)',
                        color: active ? '#0a0b10' : C.inkSoft,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: `linear-gradient(135deg,${C.violet},${C.cyan})`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: display,
              fontWeight: 700,
              fontSize: 13,
              color: '#0a0b10',
            }}
          >
            M
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.inkSoft }}>Maya Osei</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.muted2 }}>Content lead</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginInlineStart: 230, padding: 28 }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: display, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', margin: 0 }}>
            {meta.title}
          </h1>
          <p style={{ color: C.muted, fontSize: 14, margin: '5px 0 0' }}>{meta.subtitle}</p>
        </header>

        {view === 'dashboard' && <DashboardView />}
        {view === 'analytics' && <AnalyticsView />}
        {view === 'curriculum' && <CurriculumView course={course} setCourse={setCourse} />}
        {view === 'content' && (
          <ContentView
            contentTab={contentTab}
            setContentTab={setContentTab}
            queue={queue}
            resolveQueue={resolveQueue}
          />
        )}
        {view === 'tutor' && <TutorView />}
        {view === 'users' && <UsersView userQuery={userQuery} setUserQuery={setUserQuery} />}
        {view === 'subs' && <SubsView />}
        {view === 'moderation' && <ModerationView modQueue={modQueue} resolveMod={resolveMod} />}
      </main>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            insetInlineStart: '50%',
            transform: 'translateX(-50%)',
            background: '#171922',
            border: `1px solid ${C.lime}`,
            borderRadius: 10,
            padding: '11px 18px',
            fontFamily: mono,
            fontSize: 12.5,
            color: C.ink,
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 50,
          }}
        >
          <Icon name="check_circle" size={16} color={C.lime} fill />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* Dashboard                                                           */
/* ================================================================== */
function DashboardView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
        {KPIS.map((k) => (
          <Card key={k.label} style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <IconTile icon={k.icon} color={k.color} />
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.lime,
                  background: 'rgba(203,242,78,0.12)',
                  padding: '3px 7px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Icon name="arrow_upward" size={12} color={C.lime} />
                {k.delta}
              </span>
            </div>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 26, marginTop: 14, letterSpacing: '-0.02em' }}>
              {k.value}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Signups + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
        <Card>
          <CardTitle>Signups (12 mo)</CardTitle>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 170, paddingTop: 8 }}>
            {SIGNUP_BARS.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: i >= SIGNUP_BARS.length - 2 ? C.lime : 'rgba(203,242,78,0.45)',
                  borderRadius: '4px 4px 0 0',
                  minWidth: 6,
                }}
              />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Recent activity</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <IconTile icon={a.icon} color={a.color} size={34} />
                <span style={{ flex: 1, fontSize: 13.5, color: C.inkSoft }}>{a.text}</span>
                <span style={{ fontFamily: mono, fontSize: 11, color: C.muted2 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Funnel */}
      <Card>
        <CardTitle>Conversion funnel</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FUNNEL.map((f) => (
            <div key={f.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: C.inkSoft }}>{f.label}</span>
                <span style={{ fontFamily: mono, color: C.muted }}>
                  {f.value} · {f.pct}%
                </span>
              </div>
              <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Analytics                                                           */
/* ================================================================== */
function AnalyticsView() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
      <Card>
        <CardTitle>Retention curve</CardTitle>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 170 }}>
          {RETENTION.map((r, i) => (
            <div key={r.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div
                style={{
                  width: '100%',
                  height: `${r.pct}%`,
                  background: C.cyan,
                  opacity: 1 - i * 0.09,
                  borderRadius: '4px 4px 0 0',
                }}
              />
              <span style={{ fontFamily: mono, fontSize: 10, color: C.muted2 }}>{r.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Genre split</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {GENRE.map((g) => (
            <div key={g.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                <span style={{ color: C.inkSoft }}>{g.name}</span>
                <span style={{ fontFamily: mono, color: C.muted }}>{g.pct}%</span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${g.pct}%`, height: '100%', background: g.color, borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>DAU trend (14 days)</CardTitle>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 170, paddingTop: 8 }}>
          {DAU_TREND.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background: C.lime,
                opacity: i === DAU_TREND.length - 1 ? 1 : 0.4,
                borderRadius: '4px 4px 0 0',
                minWidth: 5,
              }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Curriculum                                                          */
/* ================================================================== */
function CurriculumView({ course, setCourse }: { course: number; setCourse: (n: number) => void }) {
  const selected = COURSES[course];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px,320px) 1fr', gap: 18, alignItems: 'start' }}>
      {/* Course list */}
      <Card style={{ padding: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {COURSES.map((c, i) => {
            const active = i === course;
            return (
              <button
                key={c.name}
                onClick={() => setCourse(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 11px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'start',
                  background: active ? 'rgba(203,242,78,0.07)' : 'transparent',
                  border: active ? `1px solid ${C.lime}66` : '1px solid transparent',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <IconTile icon={c.icon} color={c.color} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{c.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 10.5, color: C.muted2 }}>
                    {c.lessons} lessons{c.drafts > 0 ? ` · ${c.drafts} drafts` : ''}
                  </div>
                </div>
                {c.status === 'Draft' && <Tag label="Draft" color={C.orange} />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Modules */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <IconTile icon={selected.icon} color={selected.color} size={44} />
          <div>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 19 }}>{selected.name}</div>
            <div style={{ fontFamily: mono, fontSize: 11.5, color: C.muted }}>
              {selected.lessons} lessons · {selected.drafts} drafts
            </div>
          </div>
          <span style={{ marginInlineStart: 'auto' }}>
            <Tag label={selected.status} color={selected.status === 'Draft' ? C.orange : C.muted} />
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {MODULES.map((m) => (
            <div key={m.title}>
              <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.06em', color: C.muted2, marginBottom: 10, textTransform: 'uppercase' }}>
                {m.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {m.lessons.map((l) => (
                  <div
                    key={l.t}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      background: C.panel,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                    }}
                  >
                    <Icon name="drag_indicator" size={18} color={C.muted2} />
                    <span style={{ flex: 1, fontSize: 13.5, color: C.inkSoft }}>{l.t}</span>
                    <Tag label={l.kind} color={kindColor(l.kind)} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 78, justifyContent: 'flex-end' }}>
                      <Dot color={l.st === 'Draft' ? C.orange : C.muted2} size={7} />
                      <span style={{ fontFamily: mono, fontSize: 11, color: l.st === 'Draft' ? C.orange : C.muted }}>{l.st}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Content Engine                                                      */
/* ================================================================== */
function ContentView({
  contentTab,
  setContentTab,
  queue,
  resolveQueue,
}: {
  contentTab: string;
  setContentTab: (t: string) => void;
  queue: QueueItem[];
  resolveQueue: (id: number, message: string) => void;
}) {
  const tabs: [string, string][] = [
    ['queue', 'Review queue'],
    ['sources', 'Sources'],
    ['releases', 'Releases'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Pipeline strip */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' }}>
        {PIPELINE.map((p, i) => (
          <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 150px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 13px',
                background: C.panel2,
                border: `1px solid ${C.border}`,
                borderRadius: 11,
              }}
            >
              <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: C.lime }}>{p.n}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.inkSoft, whiteSpace: 'nowrap' }}>{p.label}</div>
              </div>
              <Icon name={p.icon} size={17} color={C.muted} />
            </div>
            {i < PIPELINE.length - 1 && <Icon name="chevron_right" size={18} color={C.muted2} />}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.border}` }}>
        {tabs.map(([id, label]) => {
          const active = contentTab === id;
          return (
            <button
              key={id}
              onClick={() => setContentTab(id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: active ? `2px solid ${C.lime}` : '2px solid transparent',
                color: active ? C.ink : C.muted,
                fontFamily: display,
                fontWeight: 600,
                fontSize: 14,
                padding: '10px 14px',
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {contentTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {queue.length === 0 ? (
            <EmptyState icon="task_alt" text="Review queue is clear — nothing pending." />
          ) : (
            queue.map((item) => (
              <Card key={item.id} style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: display, fontWeight: 600, fontSize: 16, color: C.ink }}>{item.title}</span>
                      <Tag label={item.type} color={item.typeColor} />
                    </div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginTop: 6 }}>
                      {item.source} · {item.date}
                    </div>
                  </div>
                </div>

                {/* Confidence */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ color: C.muted }}>Confidence</span>
                    <span style={{ fontFamily: mono, color: confColor(item.conf) }}>{item.conf}%</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${item.conf}%`, height: '100%', background: confColor(item.conf), borderRadius: 4 }} />
                  </div>
                </div>

                {item.added.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.lime, marginBottom: 6 }}>＋ Added</div>
                    {item.added.map((line, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0', fontSize: 13.5, color: C.inkSoft }}>
                        <span style={{ color: C.lime, fontFamily: mono, lineHeight: 1.5 }}>+</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.removed.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.pink, marginBottom: 6 }}>− Removed / superseded</div>
                    {item.removed.map((line, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0', fontSize: 13.5, color: C.muted2, textDecoration: 'line-through' }}>
                        <span style={{ color: C.pink, fontFamily: mono, lineHeight: 1.5, textDecoration: 'none' }}>−</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button style={candyBtn()} onClick={() => resolveQueue(item.id, 'Change published to knowledge base')}>
                    <Icon name="publish" size={16} color="#0a0b10" fill />
                    Approve & publish
                  </button>
                  <button style={ghostBtn()} onClick={() => resolveQueue(item.id, 'Change rejected')}>
                    Reject
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {contentTab === 'sources' && (
        <Card style={{ padding: 8 }}>
          {SOURCES.map((s, i) => (
            <div
              key={s.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 12px',
                borderBottom: i < SOURCES.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <IconTile icon="rss_feed" color={s.ok ? C.lime : C.muted2} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s.name}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.muted2 }}>{s.type}</div>
              </div>
              <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{s.last}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 62, justifyContent: 'flex-end' }}>
                <Dot color={s.ok ? C.lime : C.muted2} />
                <span style={{ fontFamily: mono, fontSize: 11, color: s.ok ? C.lime : C.muted }}>{s.ok ? 'Live' : 'Idle'}</span>
              </span>
            </div>
          ))}
        </Card>
      )}

      {contentTab === 'releases' && (
        <Card style={{ padding: 8 }}>
          {RELEASES.map((r, i) => (
            <div
              key={r.ver}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 12px',
                borderBottom: i < RELEASES.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.lime, minWidth: 64 }}>{r.ver}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, color: C.inkSoft }}>{r.changes}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.muted2 }}>{r.date}</div>
              </div>
              <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>by {r.by}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

/* ================================================================== */
/* AI Tutor                                                            */
/* ================================================================== */
function TutorView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <CardTitle>Knowledge base status</CardTitle>
        <div>
          {KB_STATUS.map((k, i) => (
            <div
              key={k.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '13px 0',
                borderBottom: i < KB_STATUS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <IconTile icon="database" color={k.ok ? C.cyan : C.orange} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{k.name}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.muted2 }}>{k.items}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <Dot color={k.ok ? C.lime : C.orange} />
                <span style={{ fontFamily: mono, fontSize: 11, color: k.ok ? C.lime : C.orange }}>{k.ok ? 'Live' : 'Syncing'}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>How the tutor thinks</CardTitle>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: C.inkSoft, margin: 0 }}>
          The AI tutor answers every question with retrieval-augmented generation over the versioned knowledge base above,
          so its guidance is always grounded in the latest verified production facts rather than stale model memory. It
          tracks each learner&apos;s progress and adapts difficulty in real time — easing off when someone is struggling
          and pushing harder once a concept clicks.
        </p>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Users                                                               */
/* ================================================================== */
function UsersView({ userQuery, setUserQuery }: { userQuery: string; setUserQuery: (q: string) => void }) {
  const q = userQuery.trim().toLowerCase();
  const filtered = USERS.filter((u) => u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 380 }}>
          <span style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <Icon name="search" size={18} color={C.muted2} />
          </span>
          <input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Search by name or @handle…"
            style={{
              width: '100%',
              background: C.panel2,
              border: `1px solid ${C.border2}`,
              borderRadius: 10,
              padding: '10px 12px 10px 38px',
              color: C.ink,
              fontFamily: 'var(--font-sans)',
              fontSize: 13.5,
              outline: 'none',
            }}
          />
        </div>
        <span style={{ fontFamily: mono, fontSize: 12, color: C.muted }}>
          {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
        </span>
      </div>

      <Card style={{ padding: 8 }}>
        {filtered.length === 0 ? (
          <EmptyState icon="person_off" text="No users match that search." />
        ) : (
          filtered.map((u, i) => (
            <div
              key={u.handle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 12px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg,${u.color},${C.cyan})`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#0a0b10',
                  flexShrink: 0,
                }}
              >
                {u.name.charAt(0)}
              </span>
              <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{u.name}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.muted2 }}>@{u.handle}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 110 }}>
                <span style={{ fontFamily: mono, fontSize: 11.5, color: C.violetText }}>Lv {u.level}</span>
                <Icon name="local_fire_department" size={15} color={C.orange} fill />
                <span style={{ fontFamily: mono, fontSize: 11.5, color: C.muted }}>{u.streak}</span>
              </div>
              <Tag label={u.plan} color={planColor(u.plan)} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 82 }}>
                <Dot color={u.status === 'Active' ? C.lime : C.muted2} size={7} />
                <span style={{ fontFamily: mono, fontSize: 11, color: u.status === 'Active' ? C.lime : C.muted }}>{u.status}</span>
              </span>
              <span style={{ fontFamily: mono, fontSize: 11, color: C.muted2, minWidth: 62, textAlign: 'end' }}>{u.joined}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Subscriptions                                                       */
/* ================================================================== */
function SubsView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <CardTitle>Plan share</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PLAN_SHARE.map((p) => (
            <div key={p.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: display, fontWeight: 600, fontSize: 15, color: C.ink }}>{p.name}</span>
                  <span style={{ fontFamily: mono, fontSize: 11, color: C.muted2 }}>{p.sub}</span>
                </span>
                <span style={{ fontFamily: display, fontWeight: 700, fontSize: 15, color: p.color }}>{p.count}</span>
              </div>
              <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${p.pct}%`, height: '100%', background: p.color, borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 8 }}>
        <div style={{ fontFamily: display, fontWeight: 600, fontSize: 15, color: C.ink, padding: '10px 12px 4px' }}>Recent transactions</div>
        {TRANSACTIONS.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '13px 12px',
              borderBottom: i < TRANSACTIONS.length - 1 ? `1px solid ${C.border}` : 'none',
            }}
          >
            <IconTile icon={t.neg ? 'undo' : 'payments'} color={t.neg ? C.pink : C.lime} size={34} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>@{t.user}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.muted2 }}>{t.plan}</div>
            </div>
            <span style={{ fontFamily: mono, fontSize: 11, color: C.muted2 }}>{t.time}</span>
            <span style={{ fontFamily: display, fontWeight: 700, fontSize: 15, color: t.neg ? C.pink : C.lime, minWidth: 64, textAlign: 'end' }}>
              {t.amt}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Moderation                                                          */
/* ================================================================== */
function ModerationView({ modQueue, resolveMod }: { modQueue: ModItem[]; resolveMod: (id: number, message: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
      {modQueue.length === 0 ? (
        <div style={{ gridColumn: '1 / -1' }}>
          <EmptyState icon="verified" text="Moderation queue is clear — nothing to review." />
        </div>
      ) : (
        modQueue.map((m) => (
          <Card key={m.id} style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Tag label={m.kind} color={kindColor(m.kind)} />
              <span style={{ fontFamily: mono, fontSize: 11, color: C.muted2, marginInlineStart: 'auto' }}>@{m.user}</span>
            </div>
            <div style={{ fontFamily: display, fontWeight: 600, fontSize: 15.5, color: C.ink, marginBottom: 4 }}>{m.title}</div>
            <div style={{ fontFamily: mono, fontSize: 11.5, color: C.muted, marginBottom: 12 }}>{m.meta}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
              <Icon name="flag" size={15} color={m.flagColor} fill />
              <span style={{ fontFamily: mono, fontSize: 12, color: m.flagColor }}>{m.flag}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
              <button style={candyBtn()} onClick={() => resolveMod(m.id, 'Approved & published')}>
                <Icon name="check" size={16} color="#0a0b10" />
                Approve
              </button>
              <button style={ghostBtn()} onClick={() => resolveMod(m.id, 'Removed')}>
                <Icon name="delete" size={16} color={C.inkSoft} />
                Remove
              </button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

/* ================================================================== */
/* Empty state                                                         */
/* ================================================================== */
function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '48px 20px',
        color: C.muted,
      }}
    >
      <IconTile icon={icon} color={C.lime} size={52} />
      <span style={{ fontSize: 14 }}>{text}</span>
    </div>
  );
}
