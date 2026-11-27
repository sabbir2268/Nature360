import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Camera,
  Droplets,
  Leaf,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Reveal from "../../../components/ui/Reveal";
import { useAuth } from "../../auth/hooks/useAuth";
import { PATHS } from "../../../utils/paths";

const orbitItems = [
  { icon: Camera, label: "Report", className: "-left-4 top-8" },
  { icon: Activity, label: "Track", className: "-right-2 top-24" },
  { icon: ShieldCheck, label: "Resolve", className: "bottom-2 left-12" },
];

function CtaSection() {
  const { user } = useAuth();

  return (
    <section className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest-950 via-forest-900 to-emerald-950 px-6 py-12 text-white shadow-[0_45px_120px_-55px_rgba(5,46,36,0.85)] sm:rounded-[2.75rem] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="grid-pattern-dark pointer-events-none absolute inset-0 opacity-80" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-lime-300/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />

            <div className="pointer-events-none absolute right-[8%] top-[16%] hidden h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md float-slow lg:grid">
              <Leaf className="h-6 w-6 text-lime-300/80" />
            </div>
            <div className="pointer-events-none absolute bottom-[18%] left-[46%] hidden h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-md float-slower lg:grid">
              <Wind className="h-5 w-5 text-emerald-200/80" />
            </div>
            <div className="pointer-events-none absolute left-[4%] top-[22%] hidden h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/[0.07] backdrop-blur-md float-slow lg:grid">
              <Droplets className="h-4 w-4 text-lime-200/80" />
            </div>

            <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-lime-200 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Join the movement
                </span>

                <h2 className="mt-6 max-w-2xl font-display text-[2rem] font-extrabold leading-[1.05] tracking-[-0.05em] text-white sm:text-4xl lg:text-[3.15rem]">
                  Your Voice Can Make a <span className="text-gradient-lime">Difference.</span>
                </h2>
                <p className="mt-5 max-w-xl text-[14px] leading-7 text-white/65 sm:text-[15px]">
                  Every environmental problem deserves attention. Join the community and help make
                  environmental action more transparent and accountable.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {user ? (
                    <Button to={PATHS.DASHBOARD} variant="lime" size="lg" className="group w-full sm:w-auto">
                      Open My Profile
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Button>
                  ) : (
                    <Button to={PATHS.REGISTER} variant="lime" size="lg" className="group w-full sm:w-auto">
                      Join Nature360
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Button>
                  )}
                  <Button href="#features" variant="darkOutline" size="lg" className="w-full sm:w-auto">
                    Explore the Platform
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/40">
                  <span>Citizen-first</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span>Transparent by design</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span>Action-oriented</span>
                </div>
              </div>

              <div className="relative mx-auto hidden h-[280px] w-[280px] lg:block">
                <div className="absolute inset-0 rounded-full border border-white/10" />
                <div className="absolute inset-8 rounded-full border border-white/[0.08]" />
                <div className="absolute inset-16 rounded-full border border-dashed border-white/15" />
                <div className="absolute inset-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400/25 to-lime-300/10 blur-xl" />
                <div className="absolute inset-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.6rem] border border-white/20 bg-white/[0.09] backdrop-blur-xl">
                  <Leaf className="h-8 w-8 text-lime-300" />
                </div>

                {orbitItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.7 }}
                      className={`absolute ${item.className}`}
                    >
                      <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.08] px-3 py-2 backdrop-blur-md">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-lime-300 text-forest-950">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-[10px] font-bold text-white/80">{item.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <svg
              className="pointer-events-none absolute -bottom-1 left-0 right-0 h-24 w-full opacity-25"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 90C180 40 320 112 500 76S820 24 1200 70V120H0Z" fill="#A3E635" opacity="0.18" />
              <path d="M0 110C220 70 400 124 620 92S980 58 1200 96V120H0Z" fill="#10B981" opacity="0.22" />
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default CtaSection;
