import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { cn } from "../../../utils/cn";
import { heroStats, trustPoints } from "../data/landingData";
import HotspotMap from "./HotspotMap";

function FloatingStat({ stat, className, delay = 0 }) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute z-30", className)}
    >
      <div className="float-slow glass flex items-center gap-2.5 rounded-2xl px-3 py-2.5 shadow-[0_18px_45px_-22px_rgba(5,46,36,0.45)]">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-900 text-lime-300 shadow-inner">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-extrabold leading-none text-forest-950">{stat.value}</p>
            <span className="rounded-full bg-lime-300/50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-forest-800">
              {stat.note}
            </span>
          </div>
          <p className="mt-1 text-[10px] font-medium leading-none text-slate-500">{stat.label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function HeroVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[570px] lg:mx-0">
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-emerald-300/25 via-lime-200/15 to-transparent blur-2xl" />

      <div className="pointer-events-none absolute -left-5 top-24 h-16 w-16 rounded-2xl border border-white/60 bg-white/30 backdrop-blur-md float-slower sm:-left-8">
        <Leaf className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-emerald-600/70" />
      </div>
      <div className="pointer-events-none absolute -right-3 top-10 grid h-12 w-12 place-items-center rounded-full border border-white/60 bg-white/40 backdrop-blur-md float-slow sm:-right-6">
        <Wind className="h-5 w-5 text-forest-700/70" />
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 30, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative rounded-[2.25rem] p-2.5 shadow-[0_40px_100px_-40px_rgba(5,46,36,0.55)]"
      >
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest-950">
              <Leaf className="h-3.5 w-3.5 text-lime-300" />
            </span>
            <div>
              <p className="text-[11px] font-bold leading-none text-forest-950">Environmental overview</p>
              <p className="mt-1 text-[9px] font-medium leading-none text-slate-500">Community reporting map</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Demo</span>
          </div>
        </div>
        <HotspotMap compact className="h-[370px] rounded-[1.75rem] border-white/80 sm:h-[430px]" />
      </motion.div>

      <FloatingStat
        stat={heroStats[0]}
        delay={0.45}
        className="-left-2 top-[27%] sm:-left-8 lg:-left-10"
      />
      <FloatingStat
        stat={heroStats[1]}
        delay={0.6}
        className="-right-1 bottom-[20%] sm:-right-6 lg:-right-8"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="float-slower absolute -bottom-6 left-1/2 z-30 -translate-x-1/2 sm:left-8 sm:translate-x-0"
      >
        <div className="glass flex items-center gap-2 rounded-full px-3 py-2 shadow-soft">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          <p className="whitespace-nowrap text-[10px] font-semibold text-forest-900">
            Report verified <span className="text-slate-400">· Demo</span>
          </p>
        </div>
      </motion.div>

      <p className="mt-10 text-center text-[10px] font-medium text-slate-400 sm:text-left">
        Illustrative demo data. Not operational statistics.
      </p>
    </div>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section id="home" className="relative overflow-hidden pb-20 pt-32 sm:pt-36 lg:pb-28 lg:pt-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(163,230,53,0.16),transparent_48%),radial-gradient(ellipse_at_20%_20%,rgba(16,185,129,0.13),transparent_44%),linear-gradient(180deg,#F7FAF7_0%,#F7FAF7_70%,#F1F7F2_100%)]" />
      <div className="grid-pattern absolute inset-0 -z-10 opacity-70" />
      <div className="pointer-events-none absolute -right-32 top-16 -z-10 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-lime-200/25 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 xl:gap-16">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: reduceMotion ? 0 : 0.09, delayChildren: 0.05 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/15 bg-white/70 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-forest-700 shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Together for a Cleaner, Safer Tomorrow
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-[680px] font-display text-[2.65rem] font-extrabold leading-[1.02] tracking-[-0.055em] text-forest-950 sm:text-6xl lg:text-[4.15rem] xl:text-[4.6rem]"
            >
              Your Community.
              <br />
              Your Voice.
              <span className="mt-1 block text-gradient">A Cleaner Environment.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-[15px] leading-7 text-slate-600 sm:text-[17px] sm:leading-8"
            >
              Report environmental problems, track real-world action, and help build cleaner, safer
              communities. Together, we can turn local observations into meaningful environmental
              change.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button to="/register" size="lg" className="group w-full sm:w-auto">
                Report an Issue
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
              <Button href="#features" variant="outline" size="lg" className="group w-full sm:w-auto">
                Explore the Platform
                <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3"
            >
              {trustPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <span key={point.label} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/10 text-emerald-700">
                      <Icon className="h-3 w-3" />
                    </span>
                    {point.label}
                  </span>
                );
              })}
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex items-center gap-3 rounded-2xl border border-forest-900/[0.07] bg-white/55 p-3.5 backdrop-blur-sm sm:max-w-md"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-forest-900 to-emerald-600 text-lime-300">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[12px] font-bold text-forest-950">Citizen reports. Officer review. Real accountability.</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  Built for citizens, volunteers, and environmental teams working together.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

export default Hero;
