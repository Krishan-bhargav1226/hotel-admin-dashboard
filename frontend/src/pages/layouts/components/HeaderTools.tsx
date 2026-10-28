import { useState, useMemo } from "react";
import { Bell, CalendarDays, ConciergeBell, LogIn, LogOut, Monitor, Moon, Plus, QrCode, Sparkles, Sun, Wallet } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import type { DeskRole } from "../../../utils/access/deskRole";
import type { ThemePreference } from "../../../utils/theme/themeContext";
import { AppEndPoints } from "../../../utils/rout-endpoints/AppEndPoints";
import { useAuth } from "../../../utils/auth/authContextDef";
import SwitchAccountModal from "../../../components/ui/models/SwitchAccountModal";

interface Notice { id: string; title: string; detail: string; href: string; }
interface HeaderToolsProps {
  occupancy: number;
  available: number;
  notices: Notice[];
  hotelName: string;
  now: number;
  preference: ThemePreference;
  onPreferenceChange: (preference: ThemePreference) => void;
  onNavigate: (path: string) => void;
  onOpenUpi: () => void;
  role: DeskRole;
}

const THEMES: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }, { id: "system", label: "System", icon: Monitor },
];

export default function HeaderTools(props: HeaderToolsProps) {
  const { occupancy, available, notices, hotelName, now, preference, onPreferenceChange, onNavigate, onOpenUpi, role } = props;
  const canManage = role !== "RECEPTION";
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      {/* 1-Click Fast Switcher for ANY role */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSwitchModal(true)}
        title="Sign out and use another account"
        className="hidden md:inline-flex items-center gap-1.5 border-brand-500/40 text-brand-700 dark:text-brand-300 font-bold text-xs bg-brand-50/60 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/60"
      >
        <Sparkles className="size-3.5 text-amber-500 shrink-0" />
        <span className="hidden lg:inline">Change account</span>
        <span className="lg:hidden">Account</span>
      </Button>

      <button
        type="button"
        onClick={() => setShowSwitchModal(true)}
        className="sm:hidden flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-brand-300"
      >
        <Sparkles className="size-3 text-amber-500" />
        <span>Account</span>
      </button>
      <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs lg:flex dark:border-slate-700 dark:bg-slate-900"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-slate-500">Occupancy</span><span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{occupancy}%</span><span className="text-slate-300">·</span><span className="font-medium text-emerald-700 dark:text-emerald-400">{available} free</span></div>
      <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={onOpenUpi}><QrCode aria-hidden="true" />UPI QR</Button>

      <QuickActionsMenu canManage={canManage} onNavigate={onNavigate} />
      <NotificationsMenu notices={notices} onNavigate={onNavigate} />
      <div className="hidden text-right sm:block"><p className="font-mono text-sm font-semibold leading-tight">{dayjs(now).format("hh:mm A")}</p><p className="text-[11px] text-slate-500">{dayjs(now).format("DD/MM/YYYY")}</p></div>
      <ProfileMenu hotelName={hotelName} canManage={canManage} preference={preference} onPreferenceChange={onPreferenceChange} onNavigate={onNavigate} onOpenSwitchModal={() => setShowSwitchModal(true)} />
      <SwitchAccountModal open={showSwitchModal} onClose={() => setShowSwitchModal(false)} />
    </div>
  );
}

function QuickActionsMenu({ canManage, onNavigate }: { canManage: boolean; onNavigate: (path: string) => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="primary" size="sm" aria-label="Open quick actions"><Plus aria-hidden="true" /><span className="hidden sm:inline">Quick action</span></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.CHECK_IN)}><LogIn className="text-emerald-600" /><ActionLabel title="New check-in" detail="Guest arrival" /></DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.RESERVATIONS)}><CalendarDays className="text-brand-600" /><ActionLabel title="New reservation" detail="Advance booking" /></DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.POS_SERVICES)}><ConciergeBell className="text-amber-600" /><ActionLabel title="Room service order" detail="Food, beverage, or laundry" /></DropdownMenuItem>
      {canManage ? <DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.EXPENSES)}><Wallet className="text-rose-600" /><ActionLabel title="Record expense" detail="Petty cash or bills" /></DropdownMenuItem> : null}
    </DropdownMenuContent>
  </DropdownMenu>;
}

function NotificationsMenu({ notices, onNavigate }: { notices: Notice[]; onNavigate: (path: string) => void }) {
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("hotel-read-notices") || "[]");
    } catch {
      return [];
    }
  });

  const unreadNotices = useMemo(() => notices.filter((n) => !readIds.includes(n.id)), [notices, readIds]);

  const markAllRead = () => {
    const allIds = notices.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem("hotel-read-notices", JSON.stringify(allIds));
    } catch {
      // LocalStorage access may fail in restricted/private browsing modes
    }
  };

  const handleSelectNotice = (notice: Notice) => {
    if (!readIds.includes(notice.id)) {
      const next = [...readIds, notice.id];
      setReadIds(next);
      try {
        localStorage.setItem("hotel-read-notices", JSON.stringify(next));
      } catch {
        // LocalStorage access may fail in restricted/private browsing modes
      }
    }
    onNavigate(notice.href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unreadNotices.length ? `${unreadNotices.length} unread notifications` : "Notifications"}
        >
          <Bell className="size-4" aria-hidden="true" />
          {unreadNotices.length > 0 && (
            <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm">
              {unreadNotices.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadNotices.length > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="cursor-pointer text-[11px] font-semibold text-brand-600 hover:text-brand-800 dark:text-brand-400"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notices.length === 0 ? (
          <p className="px-2.5 py-4 text-sm text-slate-500">No arrivals, balances, or cleaning alerts right now.</p>
        ) : (
          notices.map((notice) => {
            const isUnread = !readIds.includes(notice.id);
            return (
              <DropdownMenuItem
                key={notice.id}
                onSelect={() => handleSelectNotice(notice)}
                className={isUnread ? "bg-brand-50/50 dark:bg-brand-950/20 font-medium" : "opacity-75"}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 size-2 rounded-full shrink-0 ${
                      isUnread ? "bg-rose-500" : "bg-transparent"
                    }`}
                  />
                  <ActionLabel title={notice.title} detail={notice.detail} />
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileMenu({ hotelName, canManage, preference, onPreferenceChange, onNavigate, onOpenSwitchModal }: { hotelName: string; canManage: boolean; preference: ThemePreference; onPreferenceChange: (preference: ThemePreference) => void; onNavigate: (path: string) => void; onOpenSwitchModal: () => void }) {
  const { user, logout, role } = useAuth();
  const userName = user?.name || hotelName;
  const userEmail = user?.email || "staff@grandhorizonhotels.com";

  const roleBadgeStyle =
    role === "SUPER_ADMIN"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
      : role === "ADMIN"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    onNavigate(AppEndPoints.LOGIN);
  };

  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Open profile menu" className="rounded-full ring-2 ring-emerald-500/20 hover:ring-emerald-500/40"><span className="text-xs font-bold text-brand-700 dark:text-brand-200">{initials(userName)}</span></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64">
      <DropdownMenuLabel className="p-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {initials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{userName}</span>
            <span className="block truncate text-[11px] text-slate-500">{userEmail}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${roleBadgeStyle}`}>{role}</span>
          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.propertyName || hotelName}</span>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={onOpenSwitchModal} className="font-semibold text-brand-700 dark:text-brand-300 focus:text-brand-800">
        <Sparkles className="size-4 text-amber-500" />
        <span>Change account</span>
      </DropdownMenuItem>
      {canManage ? <DropdownMenuItem onSelect={() => onNavigate(AppEndPoints.SETTINGS)}><span>Hotel Settings</span></DropdownMenuItem> : null}
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      {THEMES.map(({ id, label, icon: Icon }) => <DropdownMenuItem key={id} onSelect={() => onPreferenceChange(id)}><Icon aria-hidden="true" /><span className="flex-1">{label}</span>{preference === id && <span className="text-xs text-brand-600">On</span>}</DropdownMenuItem>)}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={handleLogout} className="text-rose-600 focus:bg-rose-50 focus:text-rose-700 dark:text-rose-400 dark:focus:bg-rose-950/40">
        <LogOut aria-hidden="true" />
        <span className="font-semibold">Log Out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}

function ActionLabel({ title, detail }: { title: string; detail: string }) {
  return <span><span className="block font-medium">{title}</span><span className="block text-xs text-slate-500">{detail}</span></span>;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "HA";
}
