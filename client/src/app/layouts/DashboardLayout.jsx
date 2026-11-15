import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  PlusCircle,
  Radar,
  ShieldCheck,
  X,
} from "lucide-react";
import Logo from "../../components/common/Logo";
import Button from "../../components/ui/Button";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { logoutUser } from "../../features/auth/services/authServices";
import { initialsFromName } from "../../utils/format";
import { PATHS } from "../../utils/paths";
import { cn } from "../../utils/cn";

const navItems = [
  {
    label: "Overview",
    description: "Profile & latest posts",
    to: PATHS.DASHBOARD,
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Create Post",
    description: "Report an issue",
    to: PATHS.CREATE_POST,
    icon: PlusCircle,
  },
  {
    label: "Track Post",
    description: "Follow progress",
    to: PATHS.TRACK_POST,
    icon: Radar,
  },
];

const pageMeta = {
  [PATHS.DASHBOARD]: {
    eyebrow: "My profile",
    title: "Overview",
    subtitle: "Your account details and everything you have reported so far.",
  },
  [PATHS.CREATE_POST]: {
    eyebrow: "New report",
    title: "Create Post",
    subtitle: "Share an environmental problem with the details officers need to act.",
  },
  [PATHS.TRACK_POST]: {
    eyebrow: "Progress",
    title: "Track Post",
    subtitle: "Follow each report from submission through to resolution.",
  },
};

function SidebarLink({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all duration-300",
          isActive
            ? "bg-forest-950 text-white shadow-[0_18px_40px_-22px_rgba(5,46,36,0.75)]"
            : "text-slate-600 hover:bg-forest-50 hover:text-forest-950",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors duration-300",
              isActive
                ? "border-white/10 bg-white/[0.08] text-lime-300"
                : "border-forest-900/10 bg-white/70 text-emerald-700 group-hover:border-emerald-500/30",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold tracking-[-0.01em]">{item.label}</span>
            <span
              className={cn(
                "mt-0.5 block truncate text-[10px] font-medium",
                isActive ? "text-white/50" : "text-slate-400",
              )}
            >
              {item.description}
            </span>
          </span>
          {isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-300" />}
        </>
      )}
    </NavLink>
  );
}

function LogoutButton({ onLogout, loggingOut, className = "" }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loggingOut}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-slate-600 transition-colors duration-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60",
        className,
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-rose-500/15 bg-rose-500/[0.06] text-rose-600 transition-colors duration-300 group-hover:border-rose-500/30">
        <LogOut className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold tracking-[-0.01em]">
          {loggingOut ? "Logging out..." : "Log out"}
        </span>
        <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-400">
          End your session
        </span>
      </span>
    </button>
  );
}

function UserCard({ name, email, role }) {
  return (
    <div className="rounded-2xl border border-forest-900/[0.07] bg-white/70 p-3">
      <div className="flex items-center gap-2.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-forest-900 via-emerald-700 to-emerald-600 text-[12px] font-extrabold text-lime-200 shadow-sm">
          {initialsFromName(name, email)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-bold text-forest-950">{name}</p>
          <p className="truncate text-[10px] text-slate-400">{email}</p>
        </div>
      </div>
      <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-600/15 bg-emerald-50/80 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700">
        <ShieldCheck className="h-3 w-3" />
        {role}
      </div>
    </div>
  );
}

function DashboardLayout() {
  const { profile, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const name = profile?.name || user?.displayName || "EcoTrack member";
  const email = profile?.email || user?.email || "";
  const role = profile?.role || "Citizen";

  const meta =
    pageMeta[location.pathname] ?? {
      eyebrow: "Dashboard",
      title: "Overview",
      subtitle: "Manage your reports and profile.",
    };

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      navigate(PATHS.LOGIN, { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-mist text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(163,230,53,0.16),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.14),transparent_45%)]" />
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-50" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[100rem] lg:gap-6 lg:px-6 lg:py-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 flex-col rounded-[2rem] border border-white/75 bg-white/70 p-5 shadow-[0_30px_90px_-45px_rgba(5,46,36,0.45)] backdrop-blur-xl lg:flex">
          <Logo />

          <p className="mt-7 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          <nav aria-label="Dashboard navigation" className="mt-2 space-y-1.5">
            {navItems.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </nav>

          <div className="mt-3 border-t border-forest-900/[0.07] pt-3">
            <LogoutButton onLogout={handleLogout} loggingOut={loggingOut} />
          </div>

          <div className="mt-auto space-y-3 pt-6">
            <UserCard name={name} email={email} role={role} />

            <Button to={PATHS.HOME} variant="outline" size="sm" className="w-full gap-1.5 text-[11px]">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/60 bg-mist/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:hidden">
            <Logo />
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-forest-900 via-emerald-700 to-emerald-600 text-[10px] font-extrabold text-lime-200">
                {initialsFromName(name, email)}
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open dashboard navigation"
                aria-expanded={mobileOpen}
                aria-controls="dashboard-mobile-nav"
                className="grid h-10 w-10 place-items-center rounded-xl border border-forest-900/10 bg-white/70 text-forest-900 transition-colors hover:bg-white"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 pb-12 pt-5 sm:px-6 lg:px-0 lg:pb-8 lg:pt-0">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:mb-6">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-forest-900/10 bg-white/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-700 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {meta.eyebrow}
                </span>
                <h1 className="mt-3 font-display text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.045em] text-forest-950 sm:text-[2.1rem]">
                  {meta.title}
                </h1>
                <p className="mt-1.5 max-w-2xl text-[12px] leading-6 text-slate-500 sm:text-[13px]">
                  {meta.subtitle}
                </p>
              </div>

              <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-2 shadow-sm backdrop-blur lg:inline-flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-forest-950 text-[9px] font-bold text-lime-300">
                  {initialsFromName(name, email)}
                </span>
                <div className="pr-1">
                  <p className="text-[11px] font-bold leading-tight text-forest-950">{name}</p>
                  <p className="text-[9px] leading-tight text-slate-400">{role}</p>
                </div>
              </div>
            </div>

            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close dashboard navigation"
              onClick={closeMobile}
              className="absolute inset-0 bg-forest-950/40 backdrop-blur-sm"
            />
            <motion.aside
              id="dashboard-mobile-nav"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="relative flex h-full w-[84%] max-w-xs flex-col border-r border-white/70 bg-mist/95 p-5 shadow-[0_30px_90px_-30px_rgba(5,46,36,0.6)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={closeMobile}
                  aria-label="Close dashboard navigation"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-forest-900/10 bg-white/70 text-forest-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav aria-label="Dashboard navigation" className="mt-8 space-y-1.5">
                {navItems.map((item) => (
                  <SidebarLink key={item.to} item={item} onNavigate={closeMobile} />
                ))}
              </nav>

              <div className="mt-3 border-t border-forest-900/[0.07] pt-3">
                <LogoutButton onLogout={handleLogout} loggingOut={loggingOut} />
              </div>

              <div className="mt-auto space-y-3 pt-6">
                <UserCard name={name} email={email} role={role} />
                <Button
                  to={PATHS.HOME}
                  variant="outline"
                  size="sm"
                  onClick={closeMobile}
                  className="w-full gap-1.5 text-[11px]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to site
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-[9px] font-medium text-slate-400">
                  <Leaf className="h-3 w-3" />
                  EcoTrack · Environmental Monitoring
                </p>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardLayout;
