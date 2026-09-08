import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Activity,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Clock3,
  Copy,
  Database,
  Menu,
  Plus,
  Radio,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type User = {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  createdAt: string;
};

type BotStatus = {
  name: string;
  username: string;
  status: 'operational' | 'paused';
  lastEventAt: string;
};

const queryClient = new QueryClient();
const STORAGE_KEY = 'registration-bot-users';

const seededUsers: User[] = [
  {
    id: 'usr-6841',
    telegramId: '184029531',
    firstName: 'Nadia',
    lastName: 'Petrova',
    username: 'nadia_p',
    createdAt: '2025-06-17T09:42:00.000Z',
  },
  {
    id: 'usr-6839',
    telegramId: '592771048',
    firstName: 'Marcus',
    lastName: 'Chen',
    username: 'marcuschen',
    createdAt: '2025-06-17T08:18:00.000Z',
  },
  {
    id: 'usr-6836',
    telegramId: '731860294',
    firstName: 'Elena',
    lastName: 'Rossi',
    username: 'elena_rossi',
    createdAt: '2025-06-16T20:06:00.000Z',
  },
  {
    id: 'usr-6832',
    telegramId: '407128663',
    firstName: 'Jonas',
    lastName: 'Lind',
    username: 'jonaslind',
    createdAt: '2025-06-16T16:31:00.000Z',
  },
  {
    id: 'usr-6825',
    telegramId: '268094117',
    firstName: 'Amina',
    lastName: 'Okafor',
    username: 'amina_o',
    createdAt: '2025-06-16T11:57:00.000Z',
  },
  {
    id: 'usr-6818',
    telegramId: '915630284',
    firstName: 'Theo',
    lastName: 'Martin',
    username: 'theo_m',
    createdAt: '2025-06-15T15:12:00.000Z',
  },
];

const bot: BotStatus = {
  name: 'Harbor Registration',
  username: '@harbor_register_bot',
  status: 'operational',
  lastEventAt: '2025-06-17T09:48:00.000Z',
};

function readUsers(): User[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as User[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fall back to the small local demo dataset when storage is unavailable.
  }
  return seededUsers;
}

function initials(user: User) {
  return `${user.firstName.charAt(0)}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
}

function fullName(user: User) {
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;
}

function relativeTime(date: string) {
  const difference = Math.max(0, Date.now() - new Date(date).getTime());
  const minutes = Math.floor(difference / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function Avatar({ user, small = false }: { user: User; small?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-[${small ? '10px' : '14px'}] bg-[#d8ece2] font-extrabold text-[#24634d] ${
        small ? 'size-9 text-xs' : 'size-16 text-xl'
      }`}
      data-testid={`img-avatar-${user.id}`}
      aria-label={`${fullName(user)} initials`}
    >
      {initials(user)}
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon,
  accent,
  delay,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  accent: string;
  delay: string;
}) {
  return (
    <article
      className="stagger-in lift-on-hover rounded-2xl border border-[#e5dfd4] bg-[#fffefa] p-5"
      style={{ animationDelay: delay }}
      data-testid={`card-metric-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl ${accent}`}>{icon}</div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#79857f]">
          live
        </span>
      </div>
      <p className="mt-5 text-sm font-semibold text-[#68736e]">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="font-mono text-3xl font-medium tracking-[-0.06em] text-[#24342e]" data-testid={`text-metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
          {value}
        </p>
        <p className="mb-1 text-right text-xs text-[#79857f]">{note}</p>
      </div>
    </article>
  );
}

function EmptySearchState({ query, clear }: { query: string; clear: () => void }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f3e7dd] text-[#b56b4d]">
        <Search size={21} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 font-display text-base font-extrabold text-[#293b34]">
        No registration matches
      </h3>
      <p className="mt-1 max-w-[260px] text-sm leading-6 text-[#7c8781]">
        Nothing in the directory looks like “{query}”. Try a name, username, or Telegram ID.
      </p>
      <button
        type="button"
        onClick={clear}
        className="mt-5 text-sm font-bold text-[#247657] underline decoration-[#b9d6c8] underline-offset-4 transition-colors hover:text-[#174f3a]"
        data-testid="button-clear-search"
      >
        Clear search
      </button>
    </div>
  );
}

function UserRow({
  user,
  selected,
  onSelect,
}: {
  user: User;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 border-b border-[#eee9e1] px-5 py-3.5 text-left transition-colors last:border-0 ${
        selected ? 'bg-[#edf6f0]' : 'hover:bg-[#faf7f1]'
      }`}
      data-testid={`button-select-user-${user.id}`}
    >
      <Avatar user={user} small />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-extrabold text-[#293b34]" data-testid={`text-user-name-${user.id}`}>
            {fullName(user)}
          </span>
          {selected && <span className="size-1.5 rounded-full bg-[#31855f]" />}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[11px] text-[#85908a]">
          {user.username ? `@${user.username}` : `ID ${user.telegramId}`}
        </span>
      </span>
      <span className="hidden text-right sm:block">
        <span className="block text-xs font-semibold text-[#6f7d76]">{relativeTime(user.createdAt)}</span>
        <span className="mt-0.5 block font-mono text-[10px] text-[#a0a9a4]">registered</span>
      </span>
      <ChevronRight
        size={16}
        className={`shrink-0 text-[#a8b0ab] transition-transform ${selected ? 'translate-x-0.5 text-[#31855f]' : 'group-hover:translate-x-0.5'}`}
      />
    </button>
  );
}

function DetailPanel({ user }: { user?: User }) {
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.telegramId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[#e8efea] text-[#668579]">
          <UserRound size={24} strokeWidth={1.7} />
        </div>
        <h3 className="mt-4 font-display text-lg font-extrabold text-[#293b34]">Select a member</h3>
        <p className="mt-2 max-w-[230px] text-sm leading-6 text-[#7c8781]">
          Choose a registration from the directory to inspect their profile.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div>
            <h3 className="font-display text-xl font-extrabold tracking-[-0.03em] text-[#293b34]" data-testid="text-selected-user">
              {fullName(user)}
            </h3>
            <p className="mt-1 font-mono text-xs text-[#7c8781]">
              {user.username ? `@${user.username}` : 'No username set'}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#e6f3eb] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#317c5a]">
          registered
        </span>
      </div>

      <div className="mt-7 divide-y divide-[#eee9e1] rounded-xl border border-[#eee9e1] bg-[#fcfaf6]">
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
          <span className="text-xs font-semibold text-[#7a8580]">Telegram ID</span>
          <button
            type="button"
            onClick={copyId}
            className="group flex items-center gap-2 font-mono text-xs font-medium text-[#38594b] hover:text-[#247657]"
            data-testid="button-copy-telegram-id"
            title="Copy Telegram ID"
          >
            {user.telegramId}
            {copied ? <Check size={14} className="text-[#31855f]" /> : <Copy size={13} />}
          </button>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
          <span className="text-xs font-semibold text-[#7a8580]">First registered</span>
          <span className="text-right text-xs font-bold text-[#38594b]">{dateLabel(user.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
          <span className="text-xs font-semibold text-[#7a8580]">Record reference</span>
          <span className="font-mono text-[11px] text-[#87928c]">{user.id}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f4efe7] px-4 py-3 text-xs leading-5 text-[#68736e]">
        <ShieldCheck size={16} className="shrink-0 text-[#4b8870]" />
        <span>This profile is stored locally in this browser.</span>
      </div>
    </div>
  );
}

function RegisterDialog({
  open,
  onClose,
  onRegister,
}: {
  open: boolean;
  onClose: () => void;
  onRegister: (input: { firstName: string; lastName: string; username: string }) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (open) {
      setFirstName('');
      setLastName('');
      setUsername('');
    }
  }, [open]);

  if (!open) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstName.trim()) return;
    onRegister({ firstName: firstName.trim(), lastName: lastName.trim(), username: username.trim().replace(/^@/, '') });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#18251f]/35 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="register-title">
      <div className="w-full max-w-md rounded-t-3xl border border-[#e5dfd4] bg-[#fffefa] p-6 shadow-2xl sm:rounded-3xl sm:p-7" data-testid="dialog-register">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.17em] text-[#47866d]">demo registration</p>
            <h2 id="register-title" className="mt-2 font-display text-2xl font-extrabold tracking-[-0.04em] text-[#293b34]">Add a member</h2>
            <p className="mt-1.5 text-sm leading-6 text-[#7c8781]">Create a local registration to see the dashboard update.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[#88938d] hover:bg-[#f4efe7] hover:text-[#293b34]" data-testid="button-close-register">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-extrabold text-[#52615a]">First name <span className="text-[#d26e51]">*</span></span>
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoFocus className="h-11 w-full rounded-xl border border-[#ddd8cf] bg-[#fcfaf6] px-3.5 text-sm text-[#293b34] outline-none transition-colors placeholder:text-[#a8afa9] focus:border-[#58a17d] focus:ring-3 focus:ring-[#58a17d]/15" placeholder="e.g. Sofia" data-testid="input-first-name" required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-extrabold text-[#52615a]">Last name</span>
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="h-11 w-full rounded-xl border border-[#ddd8cf] bg-[#fcfaf6] px-3.5 text-sm text-[#293b34] outline-none transition-colors placeholder:text-[#a8afa9] focus:border-[#58a17d] focus:ring-3 focus:ring-[#58a17d]/15" placeholder="Optional" data-testid="input-last-name" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-extrabold text-[#52615a]">Username</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="h-11 w-full rounded-xl border border-[#ddd8cf] bg-[#fcfaf6] px-3.5 text-sm text-[#293b34] outline-none transition-colors placeholder:text-[#a8afa9] focus:border-[#58a17d] focus:ring-3 focus:ring-[#58a17d]/15" placeholder="sofia_r" data-testid="input-username" />
            </label>
          </div>
          <button type="submit" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#276f53] text-sm font-extrabold text-[#fffefa] transition-all hover:bg-[#1d5e45] active:scale-[0.99]" data-testid="button-submit-register">
            <Plus size={17} />
            Register member
          </button>
        </form>
      </div>
    </div>
  );
}

function SetupCard() {
  const [copied, setCopied] = useState(false);
  const safeCommand = '/start registration-check';

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(safeCommand);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#e5dfd4] bg-[#fffefa] p-5 sm:p-6" id="setup">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#f3e7dd] text-[#b56b4d]">
              <Settings2 size={16} />
            </div>
            <h2 className="font-display text-lg font-extrabold tracking-[-0.03em] text-[#293b34]">Bot setup</h2>
          </div>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#7c8781]">A quick check before you share the registration link.</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#e6f3eb] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#317c5a]">
          <CheckCircle2 size={13} />
          Ready
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Radio, label: 'Bot connected', detail: 'Webhook responding' },
          { icon: Database, label: 'Local records', detail: 'Browser storage on' },
          { icon: ShieldCheck, label: 'Safe to share', detail: 'No secrets exposed' },
        ].map(({ icon: Icon, label, detail }) => (
          <div className="flex items-center gap-3 rounded-xl border border-[#eee9e1] bg-[#fcfaf6] px-3.5 py-3" key={label}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#e6f3eb] text-[#438368]"><Icon size={15} /></div>
            <div>
              <p className="text-xs font-extrabold text-[#41554b]">{label}</p>
              <p className="mt-0.5 text-[11px] text-[#87928c]">{detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#24342e] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Terminal size={17} className="shrink-0 text-[#7fc3a3]" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ca89a]">Safe command reference</p>
            <p className="mt-1 truncate font-mono text-sm text-[#e8f1eb]" data-testid="text-safe-command">{safeCommand}</p>
          </div>
        </div>
        <button type="button" onClick={copyCommand} className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#567166] px-3 py-2 text-xs font-extrabold text-[#d7e8dd] transition-colors hover:bg-[#344b41]" data-testid="button-copy-command">
          {copied ? <Check size={14} /> : <Clipboard size={14} />}
          {copied ? 'Copied' : 'Copy command'}
        </button>
      </div>
    </section>
  );
}

function Home() {
  const [users, setUsers] = useState<User[]>(readUsers);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(seededUsers[0].id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'setup'>('overview');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) =>
      [user.firstName, user.lastName, user.username, user.telegramId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, users]);

  const selectedUser = users.find((user) => user.id === selectedId) ?? filteredUsers[0];
  const todayCount = users.filter((user) => {
    const date = new Date(user.createdAt);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;

  const navigateTo = (view: 'overview' | 'users' | 'setup') => {
    setActiveView(view);
    const target = view === 'overview' ? 'overview' : view === 'users' ? 'directory' : 'setup';
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const registerUser = (input: { firstName: string; lastName: string; username: string }) => {
    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      telegramId: `${Math.floor(100000000 + Math.random() * 899999999)}`,
      firstName: input.firstName,
      lastName: input.lastName || undefined,
      username: input.username || undefined,
      createdAt: new Date().toISOString(),
    };
    setUsers((current) => [newUser, ...current]);
    setSelectedId(newUser.id);
    setDialogOpen(false);
    setActiveView('users');
    window.setTimeout(() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  };

  return (
    <div className="dashboard-shell min-h-[100dvh] text-[#293b34]">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1600px]">
        <aside className="sidebar-grain z-10 flex w-full shrink-0 flex-col text-[#eaf1ec] lg:sticky lg:top-0 lg:h-[100dvh] lg:w-[246px]">
          <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-6 lg:py-7">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 items-center justify-center rounded-[14px] bg-[#74b693] text-[#18352a]">
                <Bot size={21} strokeWidth={2.2} />
                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#214136] bg-[#ed9a70]" />
              </div>
              <div>
                <p className="font-display text-sm font-extrabold tracking-[-0.02em]">Harbor</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-[#91ad9e]">bot control room</p>
              </div>
            </div>
            <button type="button" className="flex size-10 items-center justify-center rounded-xl border border-[#456155] text-[#abc0b3] lg:hidden" data-testid="button-mobile-menu">
              <Menu size={18} />
            </button>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-3 lg:pb-0" aria-label="Primary">
            {[
              { id: 'overview' as const, label: 'Overview', icon: Activity },
              { id: 'users' as const, label: 'Users directory', icon: UsersRound },
              { id: 'setup' as const, label: 'Bot setup', icon: Settings2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => navigateTo(id)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold transition-colors lg:w-full ${
                  activeView === id ? 'bg-[#355446] text-[#eaf5ed]' : 'text-[#9eb4a7] hover:bg-[#2a493b] hover:text-[#eaf5ed]'
                }`}
                data-testid={`button-nav-${id}`}
              >
                <Icon size={17} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden p-5 lg:block">
            <div className="rounded-2xl border border-[#3d5b4c] bg-[#29483a]/70 p-4">
              <div className="flex items-center gap-2 text-[#a8d0b8]">
                <Sparkles size={14} />
                <span className="font-mono text-[10px] uppercase tracking-[0.13em]">quietly ready</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#9eb4a7]">Your registrations are close at hand and your bot is listening.</p>
            </div>
            <p className="mt-5 px-1 font-mono text-[10px] text-[#718e7e]">LOCAL WORKSPACE · 01</p>
          </div>
        </aside>

        <main className="soft-grid min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5dfd4] bg-[#faf8f3]/90 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#849089]">
              <span className="hidden sm:inline">Workspace</span>
              <ChevronRight size={13} className="hidden sm:inline" />
              <span className="text-[#3f5a4d]">Registration overview</span>
              <span className="ml-1 flex items-center gap-1.5 rounded-full bg-[#e6f3eb] px-2 py-1 text-[10px] font-extrabold text-[#317c5a]">
                <span className="size-1.5 animate-pulse rounded-full bg-[#4baf78]" />
                synced
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-xs text-[#8a958f] sm:flex"><Clock3 size={14} /> Updated moments ago</span>
              <button type="button" onClick={() => setDialogOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#276f53] px-3.5 py-2.5 text-xs font-extrabold text-[#fffefa] transition-all hover:bg-[#1d5e45] active:scale-[0.98]" data-testid="button-open-register">
                <Plus size={16} />
                <span className="hidden sm:inline">Register demo user</span>
                <span className="sm:hidden">Register</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1380px] px-5 pb-12 pt-7 sm:px-8 lg:px-10 lg:pt-10">
            <section id="overview" className="stagger-in flex scroll-mt-6 flex-col justify-between gap-7 lg:flex-row lg:items-end" style={{ animationDelay: '40ms' }}>
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#4d8b70]">Tuesday · June 17, 2025</p>
                <h1 className="mt-3 max-w-[680px] font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] text-[#263b31] sm:text-5xl">
                  Good morning.<br /><span className="text-[#6b8176]">Your bot is in good shape.</span>
                </h1>
                <p className="mt-4 max-w-[530px] text-sm leading-6 text-[#78837d]">A calm view of every person who has found their way into your registration flow.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#e5dfd4] bg-[#fffefa] px-4 py-3 quiet-shadow lg:mb-1">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#e6f3eb] text-[#3e8065]"><Radio size={17} /></div>
                <div>
                  <p className="text-xs font-extrabold text-[#3c5548]">{bot.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-[#89938e]">{bot.username}</p>
                </div>
                <span className="ml-3 size-2 rounded-full bg-[#4eae79] shadow-[0_0_0_4px_rgba(78,174,121,0.12)]" />
              </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard label="Total registrations" value={String(users.length).padStart(2, '0')} note="all time" icon={<UsersRound size={18} />} accent="bg-[#e3f0e8] text-[#3b7c60]" delay="120ms" />
              <MetricCard label="New today" value={String(todayCount).padStart(2, '0')} note={todayCount ? 'since midnight' : 'quiet so far'} icon={<ArrowUpRight size={19} />} accent="bg-[#f3e7dd] text-[#b56b4d]" delay="180ms" />
              <MetricCard label="Bot health" value="100%" note="last 24 hours" icon={<ShieldCheck size={18} />} accent="bg-[#e8edf1] text-[#57748a]" delay="240ms" />
            </section>

            <section id="directory" className="mt-8 scroll-mt-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#819089]">Member records</p>
                  <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-[-0.045em] text-[#293b34]">Registration directory</h2>
                </div>
                <p className="text-xs font-semibold text-[#87928c]">{filteredUsers.length} of {users.length} members</p>
              </div>
              <div className="grid overflow-hidden rounded-2xl border border-[#e5dfd4] bg-[#fffefa] quiet-shadow lg:grid-cols-[minmax(0,1.05fr)_minmax(330px,0.95fr)]">
                <div className="min-w-0 border-b border-[#e5dfd4] lg:border-b-0 lg:border-r">
                  <div className="border-b border-[#eee9e1] p-4">
                    <div className="relative">
                      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c9891]" />
                      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, username, or ID" className="h-11 w-full rounded-xl border border-[#e4ded5] bg-[#fcfaf6] pl-10 pr-10 text-sm text-[#293b34] outline-none transition-colors placeholder:text-[#9ba39e] focus:border-[#58a17d] focus:ring-3 focus:ring-[#58a17d]/15" data-testid="input-search-users" />
                      {query && (
                        <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#89938e] hover:bg-[#e9eee9] hover:text-[#3f5a4d]" data-testid="button-reset-search">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[386px] overflow-y-auto">
                    {filteredUsers.length ? filteredUsers.map((user) => (
                      <UserRow key={user.id} user={user} selected={selectedUser?.id === user.id} onSelect={() => setSelectedId(user.id)} />
                    )) : <EmptySearchState query={query} clear={() => setQuery('')} />}
                  </div>
                </div>
                <div className="min-w-0 bg-[#fffefa]">
                  <div className="flex items-center justify-between border-b border-[#eee9e1] px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <UserRound size={15} className="text-[#6e897c]" />
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#718078]">Member profile</p>
                    </div>
                    <span className="font-mono text-[10px] text-[#a0a9a4]">DETAIL VIEW</span>
                  </div>
                  <DetailPanel user={selectedUser} />
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
              <SetupCard />
              <section className="rounded-2xl border border-[#e5dfd4] bg-[#fffefa] p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#e8edf1] text-[#57748a]"><Activity size={16} /></div>
                  <h2 className="font-display text-lg font-extrabold tracking-[-0.03em] text-[#293b34]">Recent activity</h2>
                </div>
                <div className="mt-5 space-y-4">
                  {users.slice(0, 3).map((user) => (
                    <div className="flex items-start gap-3" key={`activity-${user.id}`}>
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#edf6f0] text-[#438368]"><Send size={13} /></div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#41554b]"><span className="font-extrabold">{fullName(user)}</span> registered</p>
                        <p className="mt-1 font-mono text-[10px] text-[#8d9892]">{relativeTime(user.createdAt)} · start flow</p>
                      </div>
                    </div>
                  ))}
                  {!users.length && <p className="text-sm text-[#87928c]">Activity will appear after the first registration.</p>}
                </div>
                <button type="button" onClick={() => navigateTo('users')} className="mt-6 flex items-center gap-1.5 text-xs font-extrabold text-[#398061] hover:text-[#1d5e45]" data-testid="button-view-all-users">
                  View all members <ArrowUpRight size={14} />
                </button>
              </section>
            </section>

            <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5dfd4] pt-5 text-[11px] text-[#919b95]">
              <span className="font-mono tracking-[0.08em]">HARBOR CONTROL ROOM · LOCAL DEMO</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Your workspace stays in this browser</span>
            </footer>
          </div>
        </main>
      </div>
      <RegisterDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onRegister={registerUser} />
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;