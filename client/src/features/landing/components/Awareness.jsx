import { ArrowUpRight } from "lucide-react";
import GlassCard from "../../../components/ui/GlassCard";
import Reveal from "../../../components/ui/Reveal";
import SectionHeading from "../../../components/ui/SectionHeading";
import { awarenessCards } from "../data/landingData";

function Awareness() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-white/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why it matters"
          title={
            <>
              Environmental Action Starts With <span className="text-gradient">Awareness.</span>
            </>
          }
          description="A cleaner community begins when people can see a problem, understand what happens next, and trust that their voice is part of the response."
        />

        <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
          {awarenessCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={index * 0.1}>
                <GlassCard interactive className="group h-full overflow-hidden p-6 sm:p-7">
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${card.accent} opacity-80`} />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/70 bg-gradient-to-br from-forest-900 to-emerald-600 text-lime-300 shadow-lg shadow-forest-950/20 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.03em] text-forest-950">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      Learn more
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Awareness;
