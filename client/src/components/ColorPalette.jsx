import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

function Swatch({ hex }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex flex-col items-center gap-1.5"
      title={`Copy ${hex}`}
    >
      <span
        className="h-14 w-14 rounded-lg border border-black/10 shadow-sm transition-transform group-hover:scale-105 dark:border-white/10"
        style={{ backgroundColor: hex }}
      />
      <span className="flex items-center gap-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
        {hex}
      </span>
    </button>
  );
}

export default function ColorPalette({ palette }) {
  if (!palette || palette.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Color palette
      </h3>
      <div className="flex flex-wrap gap-3">
        {palette.map((hex) => (
          <Swatch key={hex} hex={hex} />
        ))}
      </div>
    </div>
  );
}
