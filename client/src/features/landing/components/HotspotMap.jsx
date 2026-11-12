import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { cn } from "../../../utils/cn";
import { hotspots as defaultHotspots, severityMeta } from "../data/dashboardData";

function MapBackdrop() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 600 420"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="eco-map-grid" width="38" height="38" patternUnits="userSpaceOnUse">
          <path d="M38 0H0V38" fill="none" stroke="#14532D" strokeOpacity="0.06" />
        </pattern>
        <linearGradient id="eco-river" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#B9DDEA" />
          <stop offset="1" stopColor="#8EC9DF" />
        </linearGradient>
      </defs>

      <rect width="600" height="420" fill="#EAF4EB" />
      <rect width="600" height="420" fill="url(#eco-map-grid)" />

      <path d="M-20 320C80 268 138 360 230 312S402 262 620 300V420H-20Z" fill="#D8EBD9" opacity="0.72" />
      <path d="M-20 94C96 124 156 48 260 82S430 146 620 70" fill="none" stroke="url(#eco-river)" strokeWidth="30" strokeLinecap="round" opacity="0.75" />
      <path d="M-20 94C96 124 156 48 260 82S430 146 620 70" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.55" />

      <g fill="#F9FCF9" stroke="#DCE8DE" strokeWidth="1">
        <rect x="42" y="140" width="70" height="52" rx="7" />
        <rect x="128" y="132" width="54" height="40" rx="6" />
        <rect x="198" y="150" width="84" height="58" rx="7" />
        <rect x="300" y="118" width="66" height="48" rx="7" />
        <rect x="382" y="146" width="92" height="54" rx="7" />
        <rect x="486" y="128" width="72" height="42" rx="6" />
        <rect x="70" y="222" width="88" height="58" rx="7" />
        <rect x="182" y="226" width="60" height="42" rx="6" />
        <rect x="264" y="232" width="74" height="62" rx="7" />
        <rect x="358" y="222" width="56" height="44" rx="6" />
        <rect x="438" y="224" width="90" height="60" rx="7" />
      </g>

      <g fill="#CBE6CB" opacity="0.9">
        <path d="M304 300h92a12 12 0 0 1 12 12v48h-92a12 12 0 0 1-12-12v-48Z" />
        <circle cx="470" cy="88" r="34" />
        <path d="M58 72h76a16 16 0 0 1 16 16v22H74a16 16 0 0 1-16-16Z" />
      </g>

      <g fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" opacity="0.9">
        <path d="M-10 188C100 202 176 176 276 192S460 216 610 188" />
        <path d="M154 0C148 104 168 190 148 288S152 384 170 430" />
        <path d="M400 0C388 94 414 178 396 268S392 380 414 430" />
        <path d="M0 350C110 334 200 356 300 340S500 312 610 330" />
      </g>
      <g fill="none" stroke="#D6E4D8" strokeWidth="1.4" strokeLinecap="round" opacity="0.95">
        <path d="M-10 188C100 202 176 176 276 192S460 216 610 188" />
        <path d="M154 0C148 104 168 190 148 288S152 384 170 430" />
        <path d="M400 0C388 94 414 178 396 268S392 380 414 430" />
        <path d="M0 350C110 334 200 356 300 340S500 312 610 330" />
      </g>

      <g fill="#6D8373" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="600" opacity="0.72">
        <text x="46" y="128">NORTH MARKET</text>
        <text x="338" y="108">EAST INDUSTRIAL</text>
        <text x="306" y="318">GREEN PARK</text>
        <text x="470" y="292">LAKEVIEW</text>
      </g>
    </svg>
  );
}

function HotspotMap({ items = defaultHotspots, className = "", compact = false }) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/75 bg-[#EAF4EB] shadow-inner",
        className,
      )}
    >
      <MapBackdrop />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-forest-950/[0.08]" />

      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-forest-800 shadow-sm backdrop-blur-md">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        Environmental map
      </div>

      <div className="absolute right-4 top-4 z-20 hidden items-center gap-1.5 rounded-full border border-white/70 bg-white/75 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 backdrop-blur-md sm:flex">
        <Navigation className="h-3 w-3" />
        Illustrative demo
      </div>

      {items.map((item) => {
        const meta = severityMeta[item.severity];
        const isActive = item.id === active?.id;

        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            aria-label={`${item.name}, ${item.severity} risk, ${item.reports} reports`}
            aria-pressed={isActive}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.96 }}
            className="group/marker absolute z-10 -translate-x-1/2 -translate-y-1/2 focus-visible:z-30"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <span
              className={cn(
                "absolute inset-0 rounded-full opacity-40",
                meta.dot,
                isActive && "pulse-ring",
              )}
            />
            <span
              className={cn(
                "relative grid h-8 w-8 place-items-center rounded-full bg-white shadow-[0_6px_20px_-6px_rgba(5,46,36,0.45)] ring-2 transition-all duration-300",
                isActive ? "ring-forest-950/30" : "ring-white/90",
              )}
            >
              <MapPin className="h-4 w-4" style={{ color: meta.color }} strokeWidth={2.6} />
            </span>
            <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest-950/90 px-2 py-1 text-[9px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/marker:opacity-100 group-focus-visible/marker:opacity-100">
              {item.name}
            </span>
          </motion.button>
        );
      })}

      <div className="absolute bottom-4 right-4 z-20 hidden items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-[9px] font-semibold text-slate-500 backdrop-blur-md md:flex">
        {["Low", "Moderate", "High", "Critical"].map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", severityMeta[level].dot)} />
            {level}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute bottom-4 left-4 z-20 rounded-2xl border border-white/75 bg-white/90 p-3.5 shadow-[0_18px_45px_-20px_rgba(5,46,36,0.45)] backdrop-blur-xl",
              compact ? "w-[min(72%,230px)]" : "w-[min(76%,280px)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", severityMeta[active.severity].dot)} />
                  <span className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    {active.category}
                  </span>
                </div>
                <p className="mt-1 truncate text-[13px] font-bold text-forest-950">{active.name}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold",
                  severityMeta[active.severity].soft,
                  severityMeta[active.severity].text,
                  severityMeta[active.severity].border,
                )}
              >
                {active.severity}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {active.reports} reports
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{active.status}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HotspotMap;
