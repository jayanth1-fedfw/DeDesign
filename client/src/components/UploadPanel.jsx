import { useRef, useState } from 'react';
import { UploadCloud, ImageOff, X } from 'lucide-react';
import { validateImageFile } from '../lib/validate';

export default function UploadPanel({ previewUrl, dimensions, onFile, onClear, error, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    onFile(file, validationError);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors
          ${isDragging ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' : 'border-zinc-300 dark:border-zinc-700'}
          ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-violet-400'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Uploaded design preview"
              className="max-h-96 max-w-full rounded-lg object-contain shadow-sm"
            />
            {dimensions && (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                {dimensions.width} x {dimensions.height}px
              </p>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-zinc-600 shadow hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-300"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <>
            <UploadCloud size={36} className="mb-3 text-violet-500" />
            <p className="font-medium text-zinc-700 dark:text-zinc-200">
              Drag & drop your design here
            </p>
            <p className="mt-1 text-sm text-zinc-400">or click to browse — JPG, PNG, WEBP, up to 5MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          <ImageOff size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
