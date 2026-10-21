import { Crown, Building2, Check, Sparkles, X, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../utils/auth/authContextDef";
import { MOCK_ACCOUNTS, type MockAccount } from "../../../utils/auth/mockUsers";
import { AppEndPoints } from "../../../utils/rout-endpoints/AppEndPoints";

interface SwitchAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SwitchAccountModal({ open, onClose }: SwitchAccountModalProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const handleSelectAccount = (acc: MockAccount) => {
    logout();
    onClose();
    navigate(AppEndPoints.LOGIN, { replace: true, state: { prefillUsername: acc.username } });
    toast("Enter the account password to continue.");
  };

  const superAdminAcc = MOCK_ACCOUNTS.find((a) => a.user.role === "SUPER_ADMIN")!;
  const jaipurAccs = MOCK_ACCOUNTS.filter((a) => a.user.propertyId === "prop-1");
  const goaAccs = MOCK_ACCOUNTS.filter((a) => a.user.propertyId === "prop-2");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Sparkles className="size-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Change account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign out first, then enter the selected account password
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Account List */}
        <div className="mt-4 space-y-3.5">
          {/* 1. Super Admin */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-900/60 dark:bg-purple-950/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
                  <Crown className="size-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {superAdminAcc.user.name}
                    </span>
                    <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-900/70 dark:text-purple-200">
                      SUPER ADMIN
                    </span>
                    {user?.id === superAdminAcc.user.id && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chain HQ · Jaipur and Goa portfolio
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectAccount(superAdminAcc)}
                disabled={user?.id === superAdminAcc.user.id}
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-500 disabled:opacity-40 cursor-pointer"
              >
                {user?.id === superAdminAcc.user.id ? "Current" : "Switch to HQ"}
              </button>
            </div>
          </div>

          {/* 2. Hotel 1: Jaipur */}
          <HotelSwitchGroup
            hotelName="1. Jaipur Palace & Spa"
            hotelDetail="Jaipur, Rajasthan · 64 Heritage Rooms"
            accounts={jaipurAccs}
            currentUserId={user?.id}
            onSelect={handleSelectAccount}
          />

          {/* 3. Hotel 2: Goa */}
          <HotelSwitchGroup
            hotelName="2. Goa Beach Resort & Suites"
            hotelDetail="Calangute, North Goa · 48 Coastal Suites"
            accounts={goaAccs}
            currentUserId={user?.id}
            onSelect={handleSelectAccount}
          />

        </div>

        {/* Footer with Sign Out */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="text-xs text-slate-500">
            Demo password: <code className="font-mono text-amber-600 dark:text-amber-400 font-bold">admin 123</code>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
              toast.success("Signed out successfully");
              navigate(AppEndPoints.LOGIN, { replace: true });
            }}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out Completely</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface HotelSwitchGroupProps {
  hotelName: string;
  hotelDetail: string;
  accounts: MockAccount[];
  currentUserId?: string;
  onSelect: (acc: MockAccount) => void;
}

function HotelSwitchGroup({
  hotelName,
  hotelDetail,
  accounts,
  currentUserId,
  onSelect,
}: HotelSwitchGroupProps) {
  const adminAcc = accounts.find((a) => a.user.role === "ADMIN");
  const receptionAcc = accounts.find((a) => a.user.role === "RECEPTION");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">{hotelName}</span>
          <span className="text-[11px] text-slate-400">({hotelDetail})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {/* Admin Button */}
        {adminAcc && (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {adminAcc.user.name}
                </span>
                {currentUserId === adminAcc.user.id && (
                  <Check className="size-3 text-emerald-500" />
                )}
              </div>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                Hotel Admin
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelect(adminAcc)}
              disabled={currentUserId === adminAcc.user.id}
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-500 disabled:opacity-40 cursor-pointer"
            >
              {currentUserId === adminAcc.user.id ? "Active" : "Switch"}
            </button>
          </div>
        )}

        {/* Reception Button */}
        {receptionAcc && (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {receptionAcc.user.name}
                </span>
                {currentUserId === receptionAcc.user.id && (
                  <Check className="size-3 text-emerald-500" />
                )}
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Front Desk / Reception
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelect(receptionAcc)}
              disabled={currentUserId === receptionAcc.user.id}
              className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-40 cursor-pointer"
            >
              {currentUserId === receptionAcc.user.id ? "Active" : "Switch"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
