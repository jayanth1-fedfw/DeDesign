import { EXAMPLE_DESIGNS } from '../data/examples';

export default function ExampleGallery({ onPick, disabled }) {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-10">
      <p className="mb-3 text-center text-sm text-zinc-400">No design handy? Try an example:</p>
      <div className="grid grid-cols-3 gap-3">
        {EXAMPLE_DESIGNS.map((ex) => (
          <button
            key={ex.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(ex)}
            className="group overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition-shadow hover:shadow-md disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={ex.src}
                alt={ex.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{ex.name}</p>
              <p className="text-xs text-zinc-400">{ex.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
