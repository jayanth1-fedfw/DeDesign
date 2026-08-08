import { useState } from 'react';
import { Download, Ruler, LayoutGrid, Type, MapPin } from 'lucide-react';
import ColorPalette from './ColorPalette';

const LABEL_TEXT = {
  headline: 'Headline',
  body: 'Body text',
  image: 'Image / graphic',
  cta: 'Button / CTA',
  footer: 'Footer',
  logo: 'Logo / icon',
};

function fmtZonePosition(zone) {
  const cx = zone.x + zone.width / 2;
  const cy = zone.y + zone.height / 2;
  const vert = cy < 33 ? 'top' : cy < 66 ? 'middle' : 'bottom';
  const horiz = cx < 33 ? 'left' : cx < 66 ? 'center' : 'right';
  return vert === 'middle' && horiz === 'center' ? 'centered' : `${vert}-${horiz}`;
}

export default function RecreationGuide({ canvasSize, palette, zones, steps, layoutStyle, fontStyle, onExportPdf, exporting, contentRef }) {
  const [checked, setChecked] = useState({});

  function toggleStep(order) {
    setChecked((prev) => ({ ...prev, [order]: !prev[order] }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recreation Guide</h2>
        <button
          type="button"
          onClick={onExportPdf}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          <Download size={14} />
          {exporting ? 'Exporting...' : 'Download as PDF'}
        </button>
      </div>

      <div ref={contentRef} className="flex flex-col gap-6 rounded-xl bg-white p-5 dark:bg-zinc-900">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">DesignDecode Recreation Guide</h1>
          <p className="text-sm text-zinc-400">A step-by-step plan to rebuild this design from scratch.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-zinc-400">
              <Ruler size={12} /> Canvas
            </div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {canvasSize.width} x {canvasSize.height}
            </p>
            <p className="text-xs text-zinc-400">{canvasSize.aspect_ratio}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-zinc-400">
              <LayoutGrid size={12} /> Layout
            </div>
            <p className="text-sm font-semibold capitalize text-zinc-800 dark:text-zinc-100">{layoutStyle}</p>
          </div>
          <div className="col-span-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-zinc-400">
              <Type size={12} /> Font style
            </div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {fontStyle.headline} headline + {fontStyle.body} body
            </p>
          </div>
        </div>

        <ColorPalette palette={palette} />

        {zones.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <MapPin size={13} /> Layout zones
            </h3>
            <ul className="flex flex-col gap-1.5">
              {zones.map((zone) => (
                <li key={zone.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800">
                  <span className="font-medium text-zinc-700 dark:text-zinc-200">{LABEL_TEXT[zone.label] || zone.label}</span>
                  <span className="text-xs text-zinc-400">
                    {fmtZonePosition(zone)} · {zone.width.toFixed(0)}% x {zone.height.toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Step-by-step
          </h3>
          <ol className="flex flex-col gap-2">
            {steps.map((step) => (
              <li key={step.order} className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleStep(step.order)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors
                    ${checked[step.order] ? 'border-violet-600 bg-violet-600 text-white' : 'border-zinc-300 text-zinc-400 dark:border-zinc-600'}`}
                >
                  {step.order}
                </button>
                <p className={`text-sm ${checked[step.order] ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>
                  {step.instruction}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
