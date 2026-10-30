import { useState, useRef, useEffect, type FormEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
  UserPlus,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import { Images } from "../../components/constants/Image";
import { AppEndPoints } from "../../utils/rout-endpoints/AppEndPoints";
import { useAuth } from "../../utils/auth/authContextDef";
import { mapBackendRole, type DeskRole } from "../../utils/access/deskRole";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
  useVerifyOtpMutation,
  useResendVerificationMutation,
} from "../../store/services/auth/authSlice";

const OTP_LENGTH = 6;
const emptyOtp = () => Array.from({ length: OTP_LENGTH }, () => "");

interface LoginLocationState {
  from?: { pathname?: string };
  prefillUsername?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;
  const { user, isAuthenticated, loginWithUser, logout } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpPurpose, setOtpPurpose] = useState<"register" | "login">("login");
  const [username, setUsername] = useState(locationState?.prefillUsername ?? "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // 4-Digit OTP State
  const [otpValues, setOtpValues] = useState<string[]>(emptyOtp());
  const [otpEmail, setOtpEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loginUserApi] = useLoginUserMutation();
  const [registerUserApi] = useRegisterUserMutation();
  const [verifyOtpApi] = useVerifyOtpMutation();
  const [resendVerification] = useResendVerificationMutation();

  // Cooldown countdown for resend OTP
  useEffect(() => {
    if (step !== "otp" || resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // Focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupForm.firstName.trim()) {
      setErrorMessage("First name is required.");
      return;
    }
    if (!signupForm.email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }
    if (signupForm.password.length < 8 || !/[A-Z]/.test(signupForm.password) || !/[a-z]/.test(signupForm.password) || !/\d/.test(signupForm.password)) {
      setErrorMessage("Password must be at least 8 characters and include upper, lower, and a digit.");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await registerUserApi({
        firstName: signupForm.firstName.trim(),
        lastName: signupForm.lastName.trim(),
        email: signupForm.email.trim(),
        phoneNumber: signupForm.phoneNumber.trim() || undefined,
        password: signupForm.password,
      }).unwrap();

      toast.success("Account saved. Enter the 6-digit code from your email.");
      setOtpPurpose("register");
      setOtpEmail(signupForm.email.trim());
      setPassword(signupForm.password);
      setStep("otp");
      setOtpValues(emptyOtp());
      setResendCooldown(60);
    } catch (err: unknown) {
      const errorObj = err as { data?: { messages?: string[]; title?: string }; message?: string };
      const msg =
        errorObj?.data?.messages?.[0] ||
        errorObj?.data?.title ||
        errorObj?.message ||
        "Registration failed. Please try a different email or phone.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (code: string, secret: string) => {
    setUsername(code);
    setPassword(secret);
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await loginUserApi({ code, password: secret }).unwrap();

      if (response.requiresOtp) {
        setOtpPurpose("login");
        setOtpEmail(response.email || code);
        setStep("otp");
        setOtpValues(emptyOtp());
        setResendCooldown(60);
        toast.success(`6-digit OTP sent to ${response.email || code}`);
        return;
      }

      const userDeskRole: DeskRole = mapBackendRole(response.role);
      const displayName = [response.firstName, response.lastName].filter(Boolean).join(" ").trim() || code.split("@")[0];

      const targetUser = {
        id: response.userId || "usr-user",
        email: response.email || code,
        name: displayName,
        role: userDeskRole,
        title:
          userDeskRole === "SUPER_ADMIN"
            ? "Chain Administrator"
            : userDeskRole === "ADMIN"
            ? "Hotel Admin"
            : userDeskRole === "RECEPTION"
            ? "Front Desk"
            : "Registered User",
        department: userDeskRole === "USER" ? "Registered User" : "Hospitality Operations",
        phone: "",
        propertyId: response.propertyId ? String(response.propertyId) : userDeskRole === "SUPER_ADMIN" ? "ALL" : "",
        propertyName: userDeskRole === "SUPER_ADMIN" ? "Chain Headquarters" : "",
      };

      await loginWithUser(targetUser, response.token, rememberMe);
      toast.success(`Welcome, ${targetUser.name}`);
      navigate(locationState?.from?.pathname || AppEndPoints.DASHBOARD, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { data?: { messages?: string[] }; message?: string };
      const msg = errorObj?.data?.messages?.[0] || errorObj?.message || "Invalid username or password. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signIn(username, password);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, "");
    const newValues = [...otpValues];
    newValues[index] = cleaned.slice(-1);
    setOtpValues(newValues);
    setErrorMessage(null);

    // Auto-advance to next input box
    if (cleaned && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newValues = emptyOtp();
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setOtpValues(newValues);
    if (pasted.length === OTP_LENGTH) {
      otpInputRefs.current[OTP_LENGTH - 1]?.focus();
    } else {
      otpInputRefs.current[pasted.length]?.focus();
    }
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fullOtp = otpValues.join("");
    if (fullOtp.length < OTP_LENGTH) {
      setErrorMessage(`Please enter all ${OTP_LENGTH} digits of the verification code.`);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const otpNumber = parseInt(fullOtp, 10);
      const token = await verifyOtpApi({ username: otpEmail, otp: otpNumber }).unwrap();
      if (otpPurpose === "register") {
        toast.success("Email verified. A Super Admin will assign your hotel and role. You can sign in after that.");
        setUsername(otpEmail);
        setMode("signin");
        setStep("credentials");
        setOtpValues(emptyOtp());
        return;
      }
      const displayName = otpEmail.split("@")[0] || "Admin";
      const targetUser = {
        id: "usr-user",
        email: otpEmail,
        name: displayName,
        role: "ADMIN" as const,
        title: "Hotel Admin",
        department: "Hospitality Operations",
        phone: "",
        propertyId: "",
        propertyName: "",
      };

      await loginWithUser(targetUser, typeof token === "string" ? token : undefined, rememberMe);
      toast.success(`Identity verified! Welcome back, ${targetUser.name}`);
      navigate(locationState?.from?.pathname || AppEndPoints.DASHBOARD, { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { data?: { messages?: string[] }; message?: string };
      const msg = errorObj?.data?.messages?.[0] || errorObj?.message || "Incorrect code. Check the email and try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (otpPurpose === "register") {
        await resendVerification({ userName: otpEmail }).unwrap();
      } else {
        await loginUserApi({ code: otpEmail, password }).unwrap();
      }
      setResendCooldown(60);
      setOtpValues(emptyOtp());
      toast.success(`A fresh 6-digit code has been sent to ${otpEmail}`);
      otpInputRefs.current[0]?.focus();
    } catch {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#f6f4f1] px-4 py-6 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-[min(780px,calc(100dvh-3rem))] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#e9e3dd] bg-white shadow-[0_28px_80px_-44px_rgba(47,35,25,0.38)] lg:grid-cols-[0.92fr_1.08fr]">
        {/* Left Branding Panel */}
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
              Secure venue admin portal
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
              Har stay par,
              <br />
              <span className="font-normal text-white/70">poori nazar.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
              Sign in with the hotel account issued to you. Roles that require a second step receive a one-time code by email.
            </p>
          </div>

          <div className="relative grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-2xl font-semibold tabular-nums">02</p>
              <p className="mt-1 text-xs text-white/60">Hotel venues</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-2xl font-semibold">2FA</p>
              <p className="mt-1 text-xs text-white/60">4-digit OTP</p>
            </div>
          </div>
        </section>

        {/* Right Form Panel */}
        <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-lg">
            {step === "credentials" ? (
              <>
                {/* Mode Switcher Tabs */}
                <div className="mb-6 flex rounded-xl border border-[#ece8e4] bg-[#f7f5f2] p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setErrorMessage(null);
                    }}
                    className={`flex-1 rounded-lg py-2.5 text-center transition-all duration-200 ${
                      mode === "signin"
                        ? "bg-white text-slate-900 shadow-sm font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMessage(null);
                    }}
                    className={`flex-1 rounded-lg py-2.5 text-center transition-all duration-200 ${
                      mode === "signup"
                        ? "bg-white text-[#c85638] shadow-sm font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Sign Up (New User)
                  </button>
                </div>

                {errorMessage ? (
                  <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                    {errorMessage}
                  </div>
                ) : null}

                {mode === "signin" ? (
                  <>
                    <div className="mb-7">
                      <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-[#fff1eb] text-[#c85638]">
                        <LockKeyhole className="size-5" aria-hidden="true" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c85638]">System Access</p>
                      <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Sign in to your desk</h2>
                      <p className="mt-2 text-sm text-slate-500">
                        Sign in with your hotel account. Hotel admins receive an email code after the password.
                      </p>
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

                    <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                      <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                        Email Address / Username
                        <span className="relative block">
                          <UserRound className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" aria-hidden="true" />
                          <input
                            autoComplete="username"
                            autoCapitalize="none"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="user@example.com"
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
                            placeholder="••••••••"
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
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c85638] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(200,86,56,0.8)] transition hover:bg-[#ae482e] active:translate-y-px disabled:cursor-wait disabled:opacity-60"
                      >
                        {isLoading ? "Validating credentials…" : "Continue to sign in"}
                        {!isLoading ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /> : null}
                      </button>

                      <div className="pt-2 text-center text-xs text-slate-500">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMode("signup");
                            setErrorMessage(null);
                          }}
                          className="font-semibold text-[#c85638] hover:underline"
                        >
                          Sign up as a normal user
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* Sign Up Mode Form */
                  <div className="animate-in fade-in zoom-in-95 duration-200">
                    <div className="mb-6">
                      <div className="mb-3.5 flex size-11 items-center justify-center rounded-2xl bg-[#fff1eb] text-[#c85638]">
                        <UserPlus className="size-5" aria-hidden="true" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c85638]">New Member Onboarding</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Register as a Normal User</h2>
                      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                        Create your account as a normal user. Your operational role (Front Desk, Hotel Admin, etc.) is managed centrally by the Super Admin.
                      </p>
                    </div>

                    <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block space-y-1 text-xs font-medium text-slate-700">
                          First Name *
                          <input
                            type="text"
                            value={signupForm.firstName}
                            onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                            placeholder="John"
                            required
                            className="h-10 w-full rounded-xl border border-[#e6e1dc] bg-[#fcfbfa] px-3 text-sm text-slate-900 outline-none transition focus:border-[#d66c4e] focus:ring-4 focus:ring-[#d66c4e]/10"
                          />
                        </label>
                        <label className="block space-y-1 text-xs font-medium text-slate-700">
                          Last Name
                          <input
                            type="text"
                            value={signupForm.lastName}
                            onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                            placeholder="Doe"
                            className="h-10 w-full rounded-xl border border-[#e6e1dc] bg-[#fcfbfa] px-3 text-sm text-slate-900 outline-none transition focus:border-[#d66c4e] focus:ring-4 focus:ring-[#d66c4e]/10"
                          />
                        </label>
                      </div>

                      <label className="block space-y-1 text-xs font-medium text-slate-700">
                        Email Address *
                        <span className="relative block">
                          <Mail className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" aria-hidden="true" />
                          <input
                            type="email"
                            value={signupForm.email}
                            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                            placeholder="john.doe@example.com"
                            required
                            className="h-10 w-full rounded-xl border border-[#e6e1dc] bg-[#fcfbfa] pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#d66c4e] focus:ring-4 focus:ring-[#d66c4e]/10"
                          />
                        </span>
                      </label>

                      <label className="block space-y-1 text-xs font-medium text-slate-700">
                        Mobile Phone Number *
                        <span className="relative block">
                          <Phone className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" aria-hidden="true" />
                          <input
                            type="tel"
                            value={signupForm.phoneNumber}
                            onChange={(e) => setSignupForm({ ...signupForm, phoneNumber: e.target.value })}
                            placeholder="9876543210"
                            required
                            className="h-10 w-full rounded-xl border border-[#e6e1dc] bg-[#fcfbfa] pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#d66c4e] focus:ring-4 focus:ring-[#d66c4e]/10"
                          />
                        </span>
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="block space-y-1 text-xs font-medium text-slate-700">
                          Password *
                          <span className="relative block">
                            <KeyRound className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" aria-hidden="true" />
                            <input
                              type={showSignupPassword ? "text" : "password"}
                              value={signupForm.password}
                              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                              placeholder="Upper, lower, and a digit"
                              required
                              className="h-10 w-full rounded-xl border border-[#e6e1dc] bg-[#fcfbfa] pl-9 pr-9 text-sm text-slate-900 outline-none transition focus:border-[#d66c4e] focus:ring-4 focus:ring-[#d66c4e]/10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                            >
                              {showSignupPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            </button>
                          </span>
                        </label>

                        <label className="block space-y-1 text-xs font-medium text-slate-700">
                          Confirm Password *
                          <span className="relative block">
                            <KeyRound className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" aria-hidden="true" />
                            <input
                              type={showSignupPassword ? "text" : "password"}
                              value={signupForm.confirmPassword}
                              onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                              placeholder="Re-enter password"
                              required
                              className="h-10 w-full rounded-xl border border-[#e6e1dc] bg-[#fcfbfa] pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#d66c4e] focus:ring-4 focus:ring-[#d66c4e]/10"
                            />
                          </span>
                        </label>
                      </div>

                      <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-3 text-[11px] leading-relaxed text-amber-900">
                        <p className="font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="size-3.5 text-amber-700 shrink-0" /> Role Authority Note
                        </p>
                        <p className="mt-0.5 text-amber-800/90">
                          You will be saved as a normal user. Confirm the email code first. A Super Admin then assigns your hotel and role.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#c85638] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(200,86,56,0.8)] transition hover:bg-[#ae482e] active:translate-y-px disabled:cursor-wait disabled:opacity-60"
                      >
                        {isLoading ? "Registering account…" : "Complete Registration"}
                        {!isLoading ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /> : null}
                      </button>

                      <div className="pt-2 text-center text-xs text-slate-500">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setMode("signin");
                            setErrorMessage(null);
                          }}
                          className="font-semibold text-[#c85638] hover:underline"
                        >
                          Sign in to your desk
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-slate-400">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  Use the email and password provided by your administrator.
                </p>
              </>
            ) : (
              /* Step 2: 4-Digit OTP Entry Screen */
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setErrorMessage(null);
                  }}
                  className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to credentials
                </button>

                <div className="mb-7">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#fff1eb] text-[#c85638] shadow-sm">
                    <Mail className="size-6" aria-hidden="true" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-200/80 mb-2">
                    <Sparkles className="size-3 text-amber-600" />
                    2-Step Verification Required
                  </span>
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">Enter 6-Digit Code</h2>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    A 6-digit code has been sent to:
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-[#c85638] bg-[#fff5f2] px-3 py-1.5 rounded-lg border border-[#fbd4c9] inline-block">
                    {otpEmail}
                  </p>
                </div>

                {errorMessage ? (
                  <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                    {errorMessage}
                  </div>
                ) : null}

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  {/* 4 Separate Digits Box */}
                  <div>
                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      6-Digit One-Time Password
                    </label>
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      {otpValues.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          className="size-14 sm:size-16 text-center text-2xl font-bold font-mono rounded-2xl border-2 border-[#e6e1dc] bg-[#fcfbfa] text-slate-900 outline-none transition focus:border-[#c85638] focus:bg-white focus:ring-4 focus:ring-[#c85638]/15"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpValues.join("").length < OTP_LENGTH}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c85638] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(200,86,56,0.8)] transition hover:bg-[#ae482e] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "Verifying code…" : otpPurpose === "register" ? "Verify email" : "Verify & Sign in"}
                    {!isLoading ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /> : null}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                    <span>Code expire hone me 5 minute hain</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={handleResendOtp}
                      className="inline-flex items-center gap-1 font-semibold text-[#c85638] hover:text-[#ae482e] disabled:text-slate-400 disabled:cursor-not-allowed transition"
                    >
                      <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend 6-digit code"}
                    </button>
                  </div>
                </form>

                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Email nahi mila?</p>
                  <p>Check the spam folder if the message is not in your inbox.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

