import { Bell, CalendarDays, ConciergeBell, LogIn, Monitor, Moon, Plus, QrCode, RefreshCw, Sun, Wallet } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import type { ThemePreference } from "../../../utils/theme/themeContext";
import { AppEndPoints } from "../../../utils/rout-endpoints/AppEndPoints";

interface Notice { id: string; title: string; detail: string; href: string; }
interface HeaderToolsProps {
  occupancy: number;
  available: number;
  roomsEmpty: boolean;
  loadingDemo: boolean;
  notices: Notice[];
  hotelName: string;
  now: number;
  preference: ThemePreference;
  onPreferenceChange: (preference: ThemePreference) => void;
  onNavigate: (path: string) => void;
  onOpenUpi: () => void;
  onLoadDemo: () => void;
}

const THEMES: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }, { id: "system", label: "System", icon: Monitor },
];

export default function HeaderTools(props: HeaderToolsProps) {
  const { occupancy, available, roomsEmpty, loadingDemo, notices, hotelName, now, preference, onPreferenceChange, onNavigate, onOpenUpi, onLoadDemo } = props;
  return <div className="flex items-center gap-1.5 sm:gap-2">
    <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs lg:flex dark:border-slate-700 dark:bg-slate-900"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-slate-500">Occupancy</span><span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{occupancy}%</span><span className="text-slate-300">·</span><span className="font-medium text-emerald-700 dark:text-emerald-400">{available} free</span></div>
    <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={onOpenUpi}><QrCode aria-hidden="true" />UPI QR</Button>
    {roomsEmpty && <Button variant="secondary" size="sm" onClick={onLoadDemo} loading={loadingDemo} icon={RefreshCw}>{loadingDemo ? "Loading demo" : "Load demo data"}</Button>}

    <QuickActionsMenu loadingDemo={loadingDemo} onNavigate={onNavigate} onLoadDemo={onLoadDemo} />
    <NotificationsMenu notices={notices} onNavigate={onNavigate} />
    <div className="hidden text-right sm:block"><p className="font-mono text-sm font-semibold leading-tight">{dayjs(now).format("hh:mm A")}</p><p className="text-[11px] text-slate-500">{dayjs(now).format("ddd, DD MMM")}</p></div>
    <ProfileMenu hotelName={hotelName} preference={preference} onPreferenceChange={onPreferenceChange} onNavigate={onNavigate} />
  </div>;
}

function QuickActionsMenu({ loadingDemo, onNavigate, onLoadDemo }: { loadingDemo: boolean; onNavigate: (path: string) => void; onLoadDemo: () => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="primary" size="sm" aria-label="Open quick actions"><Plus aria-hidden="true" /><span className="hidden sm:inline">Quick action</span></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.CHECK_IN)}><LogIn className="text-emerald-600" /><ActionLabel title="New check-in" detail="Guest arrival" /></DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.RESERVATIONS)}><CalendarDays className="text-brand-600" /><ActionLabel title="New reservation" detail="Advance booking" /></DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.POS_SERVICES)}><ConciergeBell className="text-amber-600" /><ActionLabel title="Room service order" detail="Food, beverage, or laundry" /></DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.EXPENSES)}><Wallet className="text-rose-600" /><ActionLabel title="Record expense" detail="Petty cash or bills" /></DropdownMenuItem>
      <DropdownMenuSeparator /><DropdownMenuItem disabled={loadingDemo} onSelect={() => void onLoadDemo()}><RefreshCw />Reload demo data</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}

function NotificationsMenu({ notices, onNavigate }: { notices: Notice[]; onNavigate: (path: string) => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="relative" aria-label={notices.length ? `${notices.length} notifications` : "Notifications"}><Bell aria-hidden="true" />{notices.length > 0 && <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">{notices.length}</span>}</Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80"><DropdownMenuLabel>Notifications</DropdownMenuLabel>{notices.length === 0 ? <p className="px-2.5 py-4 text-sm text-slate-500">No arrivals, balances, or cleaning alerts right now.</p> : notices.map((notice) => <DropdownMenuItem key={notice.id} onSelect={() => onNavigate(notice.href)}><ActionLabel title={notice.title} detail={notice.detail} /></DropdownMenuItem>)}</DropdownMenuContent>
  </DropdownMenu>;
}

function ProfileMenu({ hotelName, preference, onPreferenceChange, onNavigate }: { hotelName: string; preference: ThemePreference; onPreferenceChange: (preference: ThemePreference) => void; onNavigate: (path: string) => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Open profile menu" className="rounded-full"><span className="text-xs font-semibold text-brand-700 dark:text-brand-200">{initials(hotelName)}</span></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end"><DropdownMenuLabel><span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{hotelName}</span><span className="block text-xs font-normal">Property settings</span></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.SETTINGS)}><span>Settings</span></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuLabel>Appearance</DropdownMenuLabel>
      {THEMES.map(({ id, label, icon: Icon }) => <DropdownMenuItem key={id} onSelect={() => onPreferenceChange(id)}><Icon aria-hidden="true" /><span className="flex-1">{label}</span>{preference === id && <span className="text-xs text-brand-600">On</span>}</DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>;
}

function ActionLabel({ title, detail }: { title: string; detail: string }) {
  return <span><span className="block font-medium">{title}</span><span className="block text-xs text-slate-500">{detail}</span></span>;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "HA";
}
