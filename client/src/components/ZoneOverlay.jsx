import { useRef, useState } from 'react';
import { Plus, X, RefreshCw } from 'lucide-react';

const LABEL_STYLES = {
  headline: 'border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300',
  body: 'border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-300',
  image: 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300',
  cta: 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  footer: 'border-zinc-500 bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
  logo: 'border-pink-500 bg-pink-500/15 text-pink-700 dark:text-pink-300',
};

const LABEL_OPTIONS = ['headline', 'body', 'image', 'cta', 'footer', 'logo'];
const DEFAULT_ZONE_SIZE = { width: 24, height: 8 };

export default function ZoneOverlay({ previewUrl, zones, onAddZone, onRemoveZone, onChangeImage }) {
  const [addMode, setAddMode] = useState(false);
  const [pendingPoint, setPendingPoint] = useState(null);
  const containerRef = useRef(null);

  function handleImageClick(e) {
    if (!addMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPoint({ x: xPct, y: yPct });
  }

  function pickLabel(label) {
    if (!pendingPoint) return;
    onAddZone({
      id: `manual-${Date.now()}`,
      label,
      source: 'manual',
      x: Math.max(0, Math.min(100 - DEFAULT_ZONE_SIZE.width, pendingPoint.x - DEFAULT_ZONE_SIZE.width / 2)),
      y: Math.max(0, Math.min(100 - DEFAULT_ZONE_SIZE.height, pendingPoint.y - DEFAULT_ZONE_SIZE.height / 2)),
      width: DEFAULT_ZONE_SIZE.width,
      height: DEFAULT_ZONE_SIZE.height,
      confidence: 1,
    });
    setPendingPoint(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setAddMode((v) => !v);
            setPendingPoint(null);
          }}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors
            ${addMode ? 'border-violet-500 bg-violet-500 text-white' : 'border-zinc-300 text-zinc-600 hover:border-violet-400 dark:border-zinc-700 dark:text-zinc-300'}`}
        >
          <Plus size={14} />
          {addMode ? 'Click the image to tag a zone' : 'Tag a zone manually'}
        </button>
        <button
          type="button"
          onClick={onChangeImage}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:text-violet-600 dark:text-zinc-400"
        >
          <RefreshCw size={14} />
          Change image
        </button>
      </div>

      <div
        ref={containerRef}
        onClick={handleImageClick}
        className={`relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 ${addMode ? 'cursor-crosshair' : ''}`}
      >
        <img src={previewUrl} alt="Uploaded design" className="block w-full select-none" draggable={false} />

        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`group absolute border-2 ${LABEL_STYLES[zone.label] || LABEL_STYLES.body}`}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
            }}
          >
            <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
              {zone.label}
            </span>
            {zone.source === 'manual' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveZone(zone.id);
                }}
                className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 text-zinc-600 opacity-0 shadow group-hover:opacity-100 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}

        {pendingPoint && (
          <div
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-wrap gap-1 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
            style={{ left: `${pendingPoint.x}%`, top: `${pendingPoint.y}%` }}
            onClick={(e) => e.stopPropagation()}
          >
            {LABEL_OPTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => pickLabel(label)}
                className="rounded-md px-2 py-1 text-xs font-medium capitalize text-zinc-600 hover:bg-violet-100 hover:text-violet-700 dark:text-zinc-300 dark:hover:bg-violet-900/40"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-400">
        Boxes are auto-detected from text and shape recognition. Use "Tag a zone manually" to add or correct one.
      </p>
    </div>
  );
}
