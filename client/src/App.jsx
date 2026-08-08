import { useCallback, useMemo, useRef, useState } from 'react';
import { Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import Hero from './components/Hero';
import ExampleGallery from './components/ExampleGallery';
import UploadPanel from './components/UploadPanel';
import ZoneOverlay from './components/ZoneOverlay';
import RecreationGuide from './components/RecreationGuide';
import { extractPalette } from './lib/colors';
import { generateAnalysis } from './lib/mockAnalyze';
import { exportElementAsPdf } from './lib/pdf';

const STATUS = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  READY: 'ready',
  ERROR: 'error',
};

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [palette, setPalette] = useState([]);
  const [zones, setZones] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [uploadError, setUploadError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const guideRef = useRef(null);

  const analysis = useMemo(
    () => (dimensions ? generateAnalysis({ dimensions, palette, zones }) : null),
    [dimensions, palette, zones]
  );

  const loadFile = useCallback((newFile) => {
    setUploadError(null);
    setFile(newFile);
    setDimensions(null);
    setPalette([]);
    setZones([]);
    setStatus(STATUS.PREPARING);

    const url = URL.createObjectURL(newFile);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      try {
        setPalette(extractPalette(img, 6));
      } catch {
        setPalette([]);
      }
      setStatus(STATUS.READY);
    };
    img.onerror = () => {
      setUploadError('That file could not be read as an image.');
      setStatus(STATUS.ERROR);
    };
    img.src = url;
  }, []);

  function handleFile(selectedFile, validationError) {
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    loadFile(selectedFile);
  }

  function handleClear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setDimensions(null);
    setPalette([]);
    setZones([]);
    setStatus(STATUS.IDLE);
  }

  async function handlePickExample(example) {
    setUploadError(null);
    try {
      const res = await fetch(example.src);
      const blob = await res.blob();
      const exampleFile = new File([blob], `${example.id}.png`, { type: blob.type || 'image/png' });
      loadFile(exampleFile);
    } catch {
      setUploadError('Could not load that example. Please try uploading your own image.');
    }
  }

  function handleAddZone(zone) {
    setZones((prev) => [...prev, zone]);
  }

  function handleRemoveZone(id) {
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  async function handleExportPdf() {
    if (!guideRef.current) return;
    setExporting(true);
    try {
      await exportElementAsPdf(guideRef.current);
    } finally {
      setExporting(false);
    }
  }

  const isBusy = status === STATUS.PREPARING;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Hero />
      <ExampleGallery onPick={handlePickExample} disabled={isBusy} />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-20 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          {previewUrl ? (
            <ZoneOverlay
              previewUrl={previewUrl}
              zones={zones}
              onAddZone={handleAddZone}
              onRemoveZone={handleRemoveZone}
              onChangeImage={handleClear}
            />
          ) : (
            <UploadPanel
              previewUrl={previewUrl}
              dimensions={dimensions}
              onFile={handleFile}
              onClear={handleClear}
              error={uploadError}
              disabled={isBusy}
            />
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          {status === STATUS.IDLE && (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-2 text-center text-zinc-400">
              <Sparkles size={28} className="text-violet-400" />
              <p className="text-sm">Your recreation guide will appear here once you upload a design.</p>
            </div>
          )}

          {isBusy && (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 text-center">
              <Loader2 size={28} className="animate-spin text-violet-500" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Reading image & extracting colors...</p>
            </div>
          )}

          {status === STATUS.ERROR && (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 text-center">
              <AlertTriangle size={28} className="text-red-500" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{uploadError}</p>
            </div>
          )}

          {status === STATUS.READY && analysis && (
            <RecreationGuide
              canvasSize={{ ...analysis.canvas_size_guess, width: dimensions.width, height: dimensions.height }}
              palette={palette}
              zones={zones}
              steps={analysis.steps}
              layoutStyle={analysis.layout_style}
              fontStyle={analysis.estimated_font_style}
              onExportPdf={handleExportPdf}
              exporting={exporting}
              contentRef={guideRef}
            />
          )}
        </div>
      </main>
    </div>
  );
}
