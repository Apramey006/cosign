"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/verdict/schema";

interface UploadDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onFile, disabled }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): string | null => {
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return "upload png, jpg, webp, or gif";
    }
    if (file.size > MAX_IMAGE_BYTES) return "image must be under 8MB";
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
          "focus:outline-none focus-visible:border-lime-300 focus-visible:ring-2 focus-visible:ring-lime-300/40",
          dragging
            ? "border-lime-300 bg-lime-300/5"
            : "border-zinc-800 hover:border-zinc-600",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-4">
          step 1 · screenshot
        </p>
        <p className="text-zinc-100 text-lg md:text-xl mb-3">
          drop a screenshot — or click to pick one
        </p>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          anything: amazon, tiktok shop, depop, an ig ad. png / jpg / webp / gif · up to 8mb
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
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
        <p className="mt-3 font-mono text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
