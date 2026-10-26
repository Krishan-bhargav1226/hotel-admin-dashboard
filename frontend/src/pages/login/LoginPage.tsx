import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { Images } from "../../components/constants/Image";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { useAuth } from "../../utils/auth/authContextDef";
import { DEMO_PASSWORD, MOCK_ACCOUNTS, type MockAccount } from "../../utils/auth/mockUsers";

interface LoginLocationState {
  from?: { pathname?: string };
  prefillUsername?: string;
}

const hotelGroups = [
  { propertyId: "prop-1", label: "Hotel 1", name: "Jaipur Palace & Spa", city: "Jaipur, Rajasthan" },
  { propertyId: "prop-2", label: "Hotel 2", name: "Goa Beach Resort", city: "Goa" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;
  const { user, isAuthenticated, login, logout } = useAuth();
  const [username, setUsername] = useState(locationState?.prefillUsername ?? "superadmin");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectAccount = (account: MockAccount) => {
    setUsername(account.username);
    setPassword(account.password);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login({ username, password, rememberMe });
      if (!result.success) {
        setErrorMessage("Username ya password match nahi hua. Demo account list se username select karke dobara try karein.");
        return;
      }

      toast.success(`Welcome, ${username}`);
      navigate(locationState?.from?.pathname || AppEndPoints.DASHBOARD, { replace: true });
    } catch {
      setErrorMessage("Sign in nahi ho paya. Ek baar phir try karein.");
    } finally {
      setIsLoading(false);
    }
  };

  const superAdmin = MOCK_ACCOUNTS.find((account) => account.user.role === "SUPER_ADMIN");

  return (
    <main className="min-h-dvh bg-[#f6f4f1] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-[min(780px,calc(100dvh-3rem))] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#e9e3dd] bg-white shadow-[0_28px_80px_-44px_rgba(47,35,25,0.38)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-[#1d2923] p-7 text-white sm:p-10 lg:min-h-full lg:p-12">
          <div className="pointer-events-none absolute -right-20 top-28 size-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 top-40 size-60 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-[#de7657]/15 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <img src={Images.logo} alt="Grand Horizon Hotels" className="size-12 rounded-2xl border border-white/15 bg-white p-1.5" />
            <div>
              <p className="text-sm font-bold tracking-tight">Grand Horizon</p>
              <p className="text-xs text-white/60">Hotels & Resorts</p>
            </div>
          </div>

          <div className="relative my-10 max-w-md lg:my-0">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2ad92]">
              <span className="size-1.5 rounded-full bg-[#e78363]" />
              Hotel operations workspace
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
              Har stay par,
              <br />
              <span className="font-normal text-white/70">poori nazar.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
              Dono properties ka daily work ek jagah sambhalein. Front desk, hotel admin aur chain office ke liye alag access.
            </p>
          </div>

          <div className="relative grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-2xl font-semibold tabular-nums">02</p>
              <p className="mt-1 text-xs text-white/60">Hotel properties</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-2xl font-semibold">One</p>
              <p className="mt-1 text-xs text-white/60">Chain overview</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-7">
              <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-[#fff1eb] text-[#c85638]">
                <LockKeyhole className="size-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c85638]">Welcome back</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Sign in to your desk</h2>
              <p className="mt-2 text-sm text-slate-500">Apna username aur password daal kar continue karein.</p>
            </div>

            {isAuthenticated && user ? (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <p>
                  Signed in as <strong>{user.name}</strong> · {user.role}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setUsername("");
                    setPassword("");
                  }}
                  className="font-semibold underline underline-offset-2"
                >
                  Sign out
                </button>
              </div>
            ) : null}

            {errorMessage ? (
              <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                {errorMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                Username
                <span className="relative block">
                  <UserRound className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" aria-hidden="true" />
                  <input
                    autoComplete="username"
                    autoCapitalize="none"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="hotel1admin"
                    required
                    className="h-12 w-full rounded-xl border border-[#e6e1dc] bg-[#fcfbfa] pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#d66c4e] focus:ring-4 focus:ring-[#d66c4e]/10"
                  />
                </span>
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                Password
                <span className="relative block">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" aria-hidden="true" />
                  <input
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="admin 123"
                    required
                    className="h-12 w-full rounded-xl border border-[#e6e1dc] bg-[#fcfbfa] pl-10 pr-12 text-sm text-slate-900 outline-none transition focus:border-[#d66c4e] focus:ring-4 focus:ring-[#d66c4e]/10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d66c4e]"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="size-4 rounded border-slate-300 accent-[#c85638]"
                  />
                  Remember this device
                </label>
                <span className="text-xs text-slate-400">Demo password: <strong className="font-mono text-slate-600">{DEMO_PASSWORD}</strong></span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c85638] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(200,86,56,0.8)] transition hover:bg-[#ae482e] active:translate-y-px disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading ? "Signing in…" : "Sign in"}
                {!isLoading ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /> : null}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span className="h-px flex-1 bg-[#ece8e4]" />
              Demo accounts
              <span className="h-px flex-1 bg-[#ece8e4]" />
            </div>

            <div className="space-y-3">
              {superAdmin ? (
                <AccountButton account={superAdmin} title="Super admin" detail="Chain office · both hotels" onSelect={selectAccount} />
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                {hotelGroups.map((hotel) => (
                  <div key={hotel.propertyId} className="rounded-xl border border-[#ece8e4] bg-[#fcfbfa] p-3.5">
                    <div className="mb-2.5 flex items-start gap-2">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#c85638] shadow-sm">
                        <Building2 className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{hotel.label} · {hotel.name}</p>
                        <p className="text-[11px] text-slate-500">{hotel.city}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {MOCK_ACCOUNTS.filter((account) => account.user.propertyId === hotel.propertyId).map((account) => (
                        <AccountButton key={account.user.id} account={account} title={account.user.role === "ADMIN" ? "Hotel admin" : "Front desk"} compact onSelect={selectAccount} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-slate-400">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Demo sign-in only. Account buttons fill the form; sign-in still requires the password and submit button.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
function AccountButton({
  account,
  title,
  detail,
  compact = false,
  onSelect,
}: {
  account: MockAccount;
  title: string;
  detail?: string;
  compact?: boolean;
  onSelect: (account: MockAccount) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(account)}
      className={`flex w-full items-center justify-between gap-3 rounded-lg border border-[#ece8e4] bg-white text-left transition hover:border-[#e8b09d] hover:bg-[#fffaf7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c85638] ${compact ? "px-2.5 py-2" : "px-3.5 py-3"}`}
    >
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
          {title}
          {detail ? <span className="font-normal text-slate-400">· {detail}</span> : null}
        </span>
        <span className="mt-0.5 block truncate font-mono text-xs font-semibold text-slate-900">{account.username}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-slate-400">
        {passwordLabel(account.password)}
        <Check className="size-3.5 text-[#c85638]" aria-hidden="true" />
      </span>
    </button>
  );
}

function passwordLabel(value: string) {
  return value === DEMO_PASSWORD ? "admin 123" : value;
}

