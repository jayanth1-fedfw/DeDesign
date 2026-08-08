import { Palette, LayoutTemplate, ListChecks } from 'lucide-react';

const FEATURES = [
  { icon: Palette, label: 'Extract the exact color palette' },
  { icon: LayoutTemplate, label: 'Detect headline, image & CTA zones' },
  { icon: ListChecks, label: 'Get a numbered rebuild checklist' },
];

export default function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
      <span className="mb-4 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
        Upload a design. Get a build plan.
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
        DesignDecode
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-balance text-zinc-500 dark:text-zinc-400">
        Upload any poster, banner, social post, or UI screen and DesignDecode reverse-engineers it into a
        step-by-step guide — canvas size, color palette, layout zones, and typography — so you can rebuild it
        without learning design theory first.
      </p>

      <div className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <Icon size={18} className="text-violet-500" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}
