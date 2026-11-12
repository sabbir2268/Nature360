import { motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  CircleCheck,
  ClipboardCheck,
  MapPin,
  Navigation,
  SearchCheck,
  Wrench,
} from "lucide-react";
import { cn } from "../../../utils/cn";
import HotspotMap from "./HotspotMap";
import { severityMeta } from "../data/dashboardData";

function PhoneVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-[255px] sm:w-[285px]">
      <div className="absolute -inset-10 rounded-full bg-emerald-300/20 blur-3xl" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[2.4rem] border border-white/70 bg-forest-950 p-2 shadow-[0_40px_90px_-36px_rgba(5,46,36,0.65)]"
      >
        <div className="overflow-hidden rounded-[2rem] bg-mist">
          <div className="flex items-center justify-between px-4 pb-1 pt-3">
            <span className="text-[9px] font-bold text-forest-950">9:41</span>
            <span className="h-1 w-16 rounded-full bg-forest-950/15" />
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-950/50" />
              <span className="h-1.5 w-1.5 rounded-full bg-forest-950/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-forest-950/20" />
            </span>
          </div>

          <div className="px-3.5 pb-4">
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-extrabold text-forest-950">Report an issue</p>
                <p className="text-[8px] font-medium text-slate-500">Step 1 of 3 · Evidence</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] font-bold text-emerald-700">
                Draft
              </span>
            </div>

            <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-200 via-lime-100 to-forest-200">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.85),transparent_45%)]" />
              <div className="absolute -bottom-10 -left-6 h-24 w-40 rounded-full bg-emerald-500/25 blur-md" />
              <div className="absolute -bottom-12 right-0 h-28 w-44 rounded-full bg-forest-700/20 blur-md" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-forest-900/35 to-transparent" />
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white/85 px-2 py-1 text-[8px] font-bold text-forest-800 shadow-sm">
                Photo evidence
              </span>
              <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-lg bg-forest-950/80 px-2 py-1 text-[8px] font-semibold text-white backdrop-blur">
                <MapPin className="h-2.5 w-2.5 text-lime-300" />
                Riverside Walk
              </span>
              <span className="absolute bottom-2.5 right-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/85 text-forest-800 shadow-sm">
                <Camera className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-2.5 rounded-xl border border-forest-900/[0.07] bg-white/80 p-2.5">
              <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-slate-400">Category</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="rounded-full bg-forest-950 px-2 py-1 text-[8px] font-semibold text-white">
                  Illegal dumping
                </span>
                <span className="rounded-full bg-forest-50 px-2 py-1 text-[8px] font-semibold text-slate-500">
                  Water pollution
                </span>
                <span className="rounded-full bg-forest-50 px-2 py-1 text-[8px] font-semibold text-slate-500">
                  Air
                </span>
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-forest-900/[0.07] bg-white/80 p-2.5">
              <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-slate-400">Location</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Navigation className="h-3 w-3 text-emerald-600" />
                <p className="text-[9px] font-semibold text-forest-950">Riverside Walk, Zone 4</p>
              </div>
            </div>

            <div className="mt-2.5 rounded-xl bg-gradient-to-r from-forest-900 to-emerald-700 py-2.5 text-center text-[9px] font-bold text-white shadow-md">
              Submit report
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="float-slow absolute -left-8 top-24 z-20 sm:-left-14"
      >
        <div className="glass flex items-center gap-2 rounded-2xl px-3 py-2 shadow-soft">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-700">
            <Camera className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[9px] font-bold text-forest-950">Photo attached</p>
            <p className="text-[8px] text-slate-500">2 images · Demo</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="float-slower absolute -right-6 bottom-20 z-20 sm:-right-10"
      >
        <div className="glass flex items-center gap-2 rounded-2xl px-3 py-2 shadow-soft">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-lime-400/30 text-forest-800">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[9px] font-bold text-forest-950">GPS captured</p>
            <p className="text-[8px] text-slate-500">Accuracy 8 m · Demo</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MapVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div className="absolute -inset-8 rounded-full bg-emerald-300/15 blur-3xl" />
      <HotspotMap compact className="h-[330px] sm:h-[380px]" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="float-slow absolute -bottom-7 right-4 z-20"
      >
        <div className="glass w-44 rounded-2xl p-3 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Rule-based risk</p>
            <span className="rounded-full bg-orange-50 px-1.5 py-0.5 text-[8px] font-bold text-orange-700">
              High
            </span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-2xl font-extrabold tracking-tight text-forest-950">72</p>
            <div className="flex items-end gap-0.5 pb-1">
              {[34, 52, 40, 68, 82].map((height, index) => (
                <span
                  key={index}
                  className="w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-lime-400"
                  style={{ height: `${height / 4}px` }}
                />
              ))}
            </div>
          </div>
          <p className="mt-1 text-[8px] text-slate-500">Based on report thresholds · Demo</p>
        </div>
      </motion.div>

      <div className="absolute -right-3 top-16 hidden items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-2.5 py-1.5 text-[9px] font-bold text-forest-700 shadow-sm backdrop-blur sm:flex">
        <span className={cn("h-1.5 w-1.5 rounded-full", severityMeta.High.dot)} />
        3 recurring hotspots
      </div>
    </div>
  );
}

const trackingSteps = [
  { title: "Report submitted", meta: "Today · 09:14", icon: Camera, done: true },
  { title: "Verified by officer", meta: "Today · 11:02", icon: ClipboardCheck, done: true },
  { title: "Investigation assigned", meta: "Today · 13:40", icon: SearchCheck, done: true },
  { title: "Corrective action recorded", meta: "In progress", icon: Wrench, done: false },
  { title: "Citizen confirmation", meta: "Pending", icon: CircleCheck, done: false },
];

function TimelineVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="absolute -inset-8 rounded-full bg-lime-300/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative rounded-[2rem] p-5 shadow-soft sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Complaint #EC-2048</p>
            <p className="mt-1 text-sm font-extrabold text-forest-950">Riverside dumping report</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
            In progress
          </span>
        </div>

        <div className="relative mt-5 space-y-4">
          <div className="absolute bottom-2 left-[15px] top-2 w-px bg-forest-900/10" />
          {trackingSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
                className="relative flex items-start gap-3"
              >
                <span
                  className={cn(
                    "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2",
                    step.done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : index === 3
                        ? "border-lime-400 bg-lime-300 text-forest-900"
                        : "border-white bg-white text-slate-300",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="pt-0.5">
                  <p className={cn("text-[11px] font-bold", step.done || index === 3 ? "text-forest-950" : "text-slate-400")}>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-400">{step.meta}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl bg-forest-950 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-lime-300">Current status</p>
            <span className="text-[9px] font-semibold text-white/50">75%</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-white">Corrective action in progress</p>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="float-slower absolute -right-3 -top-5 z-20 sm:-right-8"
      >
        <div className="glass flex items-center gap-2 rounded-2xl px-3 py-2 shadow-soft">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[9px] font-bold text-forest-950">Officer update</p>
            <p className="text-[8px] text-slate-500">Visible to citizens · Demo</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CarouselVisual({ type }) {
  if (type === "phone") return <PhoneVisual />;
  if (type === "map") return <MapVisual />;
  return <TimelineVisual />;
}

export default CarouselVisual;
