import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Camera, Check, FileText, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { cn } from "../../../lib/utils";
import { compressImageIfNeeded } from "../../../utils/checkin/imageCompressor";
import { uploadIdDocument } from "../../../services/checkinApi";

interface IdFileUploadProps {
  personName?: string;
  documentId?: string;
  documentUrl?: string;
  fileName?: string;
  isExistingUploaded?: boolean;
  required?: boolean;
  onUploaded: (info: { id: string; url?: string; fileName: string }) => void;
  onRemove: () => void;
}

export default function IdFileUpload({
  personName = "Guest",
  documentId,
  documentUrl,
  fileName,
  isExistingUploaded,
  required = true,
  onUploaded,
  onRemove,
}: IdFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const hasFile = Boolean(documentId && (documentUrl || isExistingUploaded));
  const isPdf = fileName?.toLowerCase().endsWith(".pdf") || documentUrl?.includes("application/pdf");

  const processFile = async (rawFile: File) => {
    setErrorMessage(null);

    // Validate size (5 MB limit)
    const maxBytes = 5 * 1024 * 1024;
    if (rawFile.size > maxBytes) {
      setErrorMessage("File size cannot exceed 5 MB.");
      return;
    }

    // Validate format
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const ext = rawFile.name.substring(rawFile.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext) && !rawFile.type.startsWith("image/") && rawFile.type !== "application/pdf") {
      setErrorMessage("Only JPG, PNG, WebP, and PDF files are allowed.");
      return;
    }

    try {
      setIsUploading(true);

      // Compress large photos client-side to max ~1600px
      const fileToUpload = await compressImageIfNeeded(rawFile, 1600, 0.85);

      const result = await uploadIdDocument(fileToUpload);
      onUploaded({
        id: result.id,
        url: result.previewUrl,
        fileName: result.fileName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload ID document. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          ID Proof Document {required && <span className="text-rose-600 dark:text-rose-400">*</span>}
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">JPG, PNG, WebP, PDF (Max 5 MB)</span>
      </div>

      {hasFile ? (
        <div className="relative flex items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="flex min-w-0 items-center gap-3">
            {isPdf ? (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                <FileText className="size-6" aria-hidden="true" />
              </div>
            ) : documentUrl ? (
              <img
                src={documentUrl}
                alt={`${personName} ID preview`}
                className="size-12 shrink-0 rounded-lg border border-emerald-200 object-cover shadow-sm dark:border-emerald-800"
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                <Check className="size-6" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold text-slate-900 dark:text-slate-50">
                  {fileName || "Government ID on file"}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-200/80 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">
                  Uploaded
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-slate-600 dark:text-slate-400">
                {isExistingUploaded ? "Saved ID from previous visit" : "Verified & ready for check-in"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {/* Replace Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Replace ID photo"
              className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              <span>Replace ID</span>
            </button>

            {/* Remove Button */}
            <button
              type="button"
              onClick={onRemove}
              title="Remove document"
              className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200",
            isDragging
              ? "border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/30"
              : "border-slate-300/80 bg-slate-50/50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/30",
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <Loader2 className="size-7 animate-spin text-brand-700 dark:text-brand-400" />
              <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Compressing & uploading ID...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <UploadCloud className="size-5" aria-hidden="true" />
                </div>
                <div className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:hidden">
                  <Camera className="size-4" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Upload {personName}&apos;s ID</span>
                <span className="hidden sm:inline"> — drag & drop or click below</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <FileText className="size-3.5" aria-hidden="true" />
                  <span>Choose file / PDF</span>
                </button>

                {/* Mobile Camera Option */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3.5 text-xs font-semibold text-brand-900 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200"
                >
                  <Camera className="size-3.5" aria-hidden="true" />
                  <span>Camera</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {errorMessage}
        </p>
      )}

      {/* Hidden standard file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Hidden camera file picker for tablet / mobile devices */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
