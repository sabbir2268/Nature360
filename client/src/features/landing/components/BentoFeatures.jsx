import { motion } from "framer-motion";
import {
  BellRing,
  Bot,
  Check,
  CircleDot,
  ClipboardCheck,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import GlassCard from "../../../components/ui/GlassCard";
import Reveal from "../../../components/ui/Reveal";
import SectionHeading from "../../../components/ui/SectionHeading";
import { cn } from "../../../utils/cn";
import { bentoFeatures } from "../data/landingData";

function GeoVisual() {
  return (
    <div className="relative h-24 overflow-hidden rounded-xl border border-white/80 bg-[#EAF4EB]">
      <div className="dot-pattern absolute inset-0 opacity-50" />
      <div className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-emerald-500" />
      <div className="absolute right-[24%] top-[58%] h-2 w-2 rounded-full bg-lime-500" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-forest-950 text-lime-300 shadow-lg">
          <MapPin className="h-4 w-4" />
          <span className="absolute inset-0 rounded-full border border-forest-950/20 pulse-ring" />
        </span>
      </div>
      <span className="absolute bottom-2 left-2 rounded-md bg-white/85 px-2 py-1 text-[8px] font-bold text-forest-800 shadow-sm">
        GPS pinned · Demo
      </span>
    </div>
  );
}

function TrackingVisual() {
  const steps = ["Submitted", "Verified", "Action"];
  return (
    <div className="rounded-xl border border-white/80 bg-white/55 p-3">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold",
                  index < 2 ? "bg-emerald-500 text-white" : "border border-emerald-300 bg-lime-200 text-forest-800",
                )}
              >
                {index < 2 ? <Check className="h-3 w-3" /> : "3"}
              </span>
              <span className="whitespace-nowrap text-[8px] font-semibold text-slate-500">{step}</span>
            </div>
            {index < steps.length - 1 && (
              <span className="mx-1.5 mb-4 h-px flex-1 bg-gradient-to-r from-emerald-400 to-lime-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMapVisual() {
  return (
    <div className="relative h-28 overflow-hidden rounded-xl border border-white/80 bg-[#EAF4EB]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-10 70C40 50 70 86 110 64S170 54 220 66" fill="none" stroke="#B9DDEA" strokeWidth="12" strokeLinecap="round" />
        <path d="M0 26C50 36 80 18 130 28S180 40 210 30" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
        <path d="M72 0C70 30 80 58 72 80S74 96 82 104" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
        <circle cx="48" cy="40" r="18" fill="#CBE6CB" />
        <circle cx="152" cy="68" r="22" fill="#CBE6CB" />
      </svg>
      {[
        { left: "26%", top: "38%", color: "bg-emerald-500" },
        { left: "54%", top: "62%", color: "bg-orange-500" },
        { left: "78%", top: "32%", color: "bg-rose-500" },
        { left: "62%", top: "28%", color: "bg-amber-500" },
      ].map((marker) => (
        <span
          key={`${marker.left}-${marker.top}`}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: marker.left, top: marker.top }}
        >
          <span className={cn("block h-3 w-3 rounded-full border-2 border-white shadow-md", marker.color)} />
        </span>
      ))}
      <span className="absolute bottom-2 right-2 rounded-md bg-white/85 px-2 py-1 text-[8px] font-bold text-slate-500 shadow-sm">
        Illustrative demo
      </span>
    </div>
  );
}

function RiskVisual() {
  const levels = [
    { label: "Low", score: 28, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "Moderate", score: 46, className: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "High", score: 72, className: "bg-orange-50 text-orange-700 border-orange-200" },
    { label: "Critical", score: 89, className: "bg-rose-50 text-rose-700 border-rose-200" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {levels.map((level) => (
        <div key={level.label} className={cn("rounded-lg border px-2.5 py-2", level.className)}>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] opacity-75">{level.label}</p>
          <p className="mt-0.5 text-base font-extrabold leading-none">{level.score}</p>
        </div>
      ))}
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [34, 48, 42, 60, 54, 72, 66, 82];
  return (
    <div className="rounded-xl border border-white/80 bg-white/55 p-3">
      <div className="flex items-end justify-between gap-1">
        {bars.map((height, index) => (
          <motion.span
            key={index}
            initial={{ height: 4 }}
            whileInView={{ height: `${height * 0.55}px` }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.04 }}
            className="w-full rounded-t-sm bg-gradient-to-t from-emerald-600 to-lime-400"
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[7px] font-semibold uppercase tracking-wider text-slate-400">
        <span>Jan</span>
        <span>Sep</span>
      </div>
    </div>
  );
}

function AlertsVisual() {
  return (
    <div className="rounded-xl border border-white/80 bg-white/60 p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/15 text-amber-700">
          <BellRing className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[9px] font-bold text-forest-950">Threshold reached</p>
          <p className="text-[8px] text-slate-500">Water reports · Zone 4</p>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-forest-900/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "78%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
        />
      </div>
      <div className="mt-1 flex justify-between text-[7px] font-semibold text-slate-400">
        <span>Rule-based threshold</span>
        <span>78%</span>
      </div>
    </div>
  );
}

function FieldVisual() {
  const items = ["Site photos captured", "Officer notes added", "Case linked to report"];
  return (
    <div className="space-y-1.5 rounded-xl border border-white/80 bg-white/55 p-3">
      {items.map((item, index) => (
        <div key={item} className="flex items-center gap-2">
          <span
            className={cn(
              "grid h-4 w-4 place-items-center rounded-full",
              index < 2 ? "bg-emerald-500 text-white" : "border border-slate-200 bg-white text-slate-300",
            )}
          >
            <Check className="h-2.5 w-2.5" />
          </span>
          <span className="text-[8px] font-semibold text-slate-600">{item}</span>
        </div>
      ))}
    </div>
  );
}

function RolesVisual() {
  return (
    <div className="rounded-xl border border-white/80 bg-white/55 p-3">
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {["C", "V", "O"].map((letter, index) => (
            <span
              key={letter}
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full border-2 border-white text-[8px] font-bold text-white",
                index === 0 ? "bg-emerald-600" : index === 1 ? "bg-forest-800" : "bg-lime-500",
              )}
            >
              {letter}
            </span>
          ))}
        </div>
        <span className="rounded-full bg-forest-50 px-2 py-1 text-[7px] font-bold uppercase tracking-wider text-forest-700">
          Roles
        </span>
      </div>
      <div className="mt-2.5 space-y-1.5">
        {["Report verified by officer", "Investigation assigned", "Audit entry recorded"].map((line) => (
          <div key={line} className="flex items-center gap-1.5 text-[7px] font-medium text-slate-500">
            <CircleDot className="h-2.5 w-2.5 text-emerald-500" />
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function AiVisual() {
  return (
    <div className="rounded-xl border border-white/80 bg-white/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/12 text-violet-700">
            <Bot className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">AI suggestion</p>
            <p className="text-[9px] font-bold text-forest-950">Illegal Dumping · High</p>
          </div>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[7px] font-bold text-amber-700">
          Needs review
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-forest-950 px-2.5 py-2 text-[8px] font-semibold text-white">
        <ShieldCheck className="h-3 w-3 text-lime-300" />
        Officer makes the final decision
      </div>
    </div>
  );
}

function BentoVisual({ type }) {
  if (type === "geo") return <GeoVisual />;
  if (type === "tracking") return <TrackingVisual />;
  if (type === "map") return <MiniMapVisual />;
  if (type === "risk") return <RiskVisual />;
  if (type === "analytics") return <AnalyticsVisual />;
  if (type === "alerts") return <AlertsVisual />;
  if (type === "field") return <FieldVisual />;
  if (type === "roles") return <RolesVisual />;
  return <AiVisual />;
}

function BentoFeatures() {
  return (
    <section id="features" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_10%,rgba(16,185,129,0.1),transparent_50%),radial-gradient(ellipse_at_10%_80%,rgba(163,230,53,0.1),transparent_45%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform capabilities"
          title={
            <>
              Everything Needed for{" "}
              <span className="text-gradient">Environmental Accountability.</span>
            </>
          }
          description="A focused toolkit for reporting, verification, investigation, analytics, and visible follow-through — designed to keep people and institutions aligned."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 md:grid-cols-2 lg:auto-rows-[minmax(220px,auto)] lg:grid-cols-12">
          {bentoFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 0.05} className={feature.span}>
                <GlassCard interactive className="group h-full overflow-hidden p-5 sm:p-6">
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-60 transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-white/80 text-forest-800 shadow-sm transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-white/70 bg-white/55 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        EcoTrack
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-[16px] font-bold leading-snug tracking-[-0.025em] text-forest-950">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-[12px] leading-6 text-slate-600">{feature.description}</p>
                    <div className="mt-auto pt-5">
                      <BentoVisual type={feature.visual} />
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.12} className="mt-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-forest-900/[0.08] bg-white/65 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest-950 text-lime-300">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <p className="text-[11px] leading-6 text-slate-600 sm:text-[12px]">
              <span className="font-bold text-forest-950">Clear boundaries:</span> AI only suggests
              complaint categories and severity — environmental officers make the final decision.
              Pollution risk scores and hotspot alerts are rule-based, not predictive AI.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default BentoFeatures;
