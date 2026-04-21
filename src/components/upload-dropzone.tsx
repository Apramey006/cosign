"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFile, disabled }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): string | null => {
    if (!file.type.startsWith("image/")) return "upload an image file";
    if (file.size > 8 * 1024 * 1024) return "image must be under 8MB";
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const problem = validate(file);
      if (problem) {
        setError(problem);
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile, validate],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload product screenshot"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={cn(
          "border-2 border-dashed p-12 md:p-16 text-center cursor-pointer transition-colors select-none",
          dragging
            ? "border-lime-300 bg-lime-300/5"
            : "border-zinc-800 hover:border-zinc-700",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-4">
          step 1 · screenshot
        </p>
        <p className="text-zinc-200 text-lg md:text-xl mb-3">
          drop a screenshot — or click to pick one
        </p>
        <p className="text-zinc-600 text-sm max-w-md mx-auto">
          anything: amazon, tiktok shop, depop, an ig ad. png/jpg/webp · up to 8mb
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
          disabled={disabled}
        />
      </div>
      {error && (
        <p className="mt-3 font-mono text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
