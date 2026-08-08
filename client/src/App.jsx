import { useCallback, useRef, useState } from 'react';
import { Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import Hero from './components/Hero';
import ExampleGallery from './components/ExampleGallery';
import UploadPanel from './components/UploadPanel';
import ZoneOverlay from './components/ZoneOverlay';
import RecreationGuide from './components/RecreationGuide';
import { extractPalette } from './lib/colors';
import { analyzeDesign } from './lib/api';
import { exportElementAsPdf } from './lib/pdf';

const STATUS = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  ANALYZING: 'analyzing',
  READY: 'ready',
  ERROR: 'error',
};

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [palette, setPalette] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [zones, setZones] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [uploadError, setUploadError] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const guideRef = useRef(null);

  const resetResults = useCallback(() => {
    setDimensions(null);
    setPalette([]);
    setAnalysis(null);
    setZones([]);
    setAnalysisError(null);
  }, []);

  const runAnalysis = useCallback(async (targetFile, extractedPalette) => {
    setStatus(STATUS.ANALYZING);
    setAnalysisError(null);
    try {
      const data = await analyzeDesign(targetFile, extractedPalette);
      setAnalysis(data);
      setZones(data.zones);
      setStatus(STATUS.READY);
    } catch {
      setAnalysisError('Could not analyze this design. Make sure the DesignDecode server is running, then try again.');
      setStatus(STATUS.ERROR);
    }
  }, []);

  const loadFile = useCallback(
    (newFile) => {
      resetResults();
      setUploadError(null);
      setFile(newFile);
      setStatus(STATUS.PREPARING);

      const url = URL.createObjectURL(newFile);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });

      const img = new Image();
      img.onload = async () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        let extractedPalette = [];
        try {
          extractedPalette = extractPalette(img, 6);
          setPalette(extractedPalette);
        } catch {
          extractedPalette = [];
        }
        runAnalysis(newFile, extractedPalette);
      };
      img.onerror = () => {
        setUploadError('That file could not be read as an image.');
        setStatus(STATUS.ERROR);
      };
      img.src = url;
    },
    [resetResults, runAnalysis]
  );

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
    setStatus(STATUS.IDLE);
    resetResults();
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

  const isBusy = status === STATUS.PREPARING || status === STATUS.ANALYZING;

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
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {status === STATUS.PREPARING ? 'Reading image & extracting colors...' : 'Analyzing design...'}
              </p>
              <p className="text-xs text-zinc-400">Detecting text, shapes, and layout zones</p>
            </div>
          )}

          {status === STATUS.ERROR && (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 text-center">
              <AlertTriangle size={28} className="text-red-500" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{analysisError || uploadError}</p>
              {file && (
                <button
                  type="button"
                  onClick={() => runAnalysis(file, palette)}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {status === STATUS.READY && analysis && (
            <RecreationGuide
              canvasSize={
                dimensions
                  ? { ...analysis.canvas_size_guess, width: dimensions.width, height: dimensions.height }
                  : analysis.canvas_size_guess
              }
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
