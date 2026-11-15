import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Leaf, ShieldCheck, Sparkles, Users } from "lucide-react";
import Logo from "../../components/common/Logo";

const highlights = [
  "Geo-tagged environmental reports",
  "Visible complaint progress at every step",
  "Community investigations and officer action",
];

function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-mist text-ink">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(163,230,53,0.18),transparent_48%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.16),transparent_46%),linear-gradient(180deg,#F7FAF7_0%,#F1F7F2_100%)]" />
      <div className="grid-pattern absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-lime-200/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/75 bg-white/60 shadow-[0_40px_120px_-50px_rgba(5,46,36,0.5)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 p-9 text-white lg:flex lg:flex-col xl:p-12">
            <div className="grid-pattern-dark pointer-events-none absolute inset-0 opacity-80" />
            <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-lime-300/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />

            <div className="relative">
              <Logo tone="dark" />
            </div>

            <div className="relative mt-auto pt-16">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-lime-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Together for a cleaner, safer tomorrow
              </span>

              <h1 className="mt-5 max-w-md font-display text-[2.1rem] font-extrabold leading-[1.06] tracking-[-0.05em] xl:text-[2.65rem]">
                Every observation can become meaningful action.
              </h1>
              <p className="mt-4 max-w-md text-[13px] leading-7 text-white/60">
                Report environmental problems, follow complaints through resolution, and help build
                cleaner, safer communities.
              </p>

              <ul className="mt-8 space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[12px] font-medium text-white/70">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime-300/15 text-lime-300">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[9px] font-semibold text-white/50">
                  <Users className="h-3 w-3 text-lime-300" />
                  Citizen-powered
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[9px] font-semibold text-white/50">
                  <ShieldCheck className="h-3 w-3 text-emerald-300" />
                  Transparent response
                </span>
              </div>
            </div>

            <div className="relative mt-10 flex items-center gap-2 text-[9px] font-medium text-white/30">
              <Leaf className="h-3 w-3" />
              EcoTrack · Environmental Monitoring &amp; Response
            </div>
          </div>

          <div className="relative flex flex-col p-5 sm:p-8 lg:p-10 xl:p-14">
            <div className="flex items-center justify-between lg:hidden">
              <Logo />
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-forest-900/10 bg-white/70 px-3 py-2 text-[10px] font-bold text-forest-800"
              >
                <ArrowLeft className="h-3 w-3" />
                Home
              </Link>
            </div>

            <div className="mx-auto mt-10 w-full max-w-md lg:mt-0">
              <Outlet />
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-2 text-[10px] font-medium text-slate-400 sm:flex-row lg:mt-auto">
              <Link to="/" className="hidden items-center gap-1.5 transition-colors hover:text-forest-800 lg:inline-flex">
                <ArrowLeft className="h-3 w-3" />
                Back to home
              </Link>
              <p>Secured by Firebase Authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
