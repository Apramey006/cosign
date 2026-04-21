import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/types";

const VERDICT_STYLES: Record<Verdict, { label: string; className: string }> = {
  COSIGNED: {
    label: "COSIGNED",
    className: "bg-lime-300 text-black border-black",
  },
  NOT_COSIGNED: {
    label: "NOT COSIGNED",
    className: "bg-red-500 text-white border-white",
  },
  SLEEP_ON_IT: {
    label: "SLEEP ON IT",
    className: "bg-amber-300 text-black border-black",
  },
};

interface VerdictStampProps {
  verdict: Verdict;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function VerdictStamp({
  verdict,
  size = "md",
  className,
}: VerdictStampProps) {
  const style = VERDICT_STYLES[verdict];
  const sizeClass =
    size === "sm"
      ? "text-xs px-2 py-1 tracking-wider"
      : size === "md"
        ? "text-sm px-3 py-1.5 tracking-wider"
        : size === "lg"
          ? "text-2xl md:text-3xl px-5 md:px-7 py-2.5 md:py-3 tracking-widest"
          : "text-3xl md:text-5xl px-6 md:px-9 py-3 md:py-5 tracking-widest";

  return (
    <span
      role="img"
      aria-label={`verdict: ${style.label.toLowerCase()}`}
      className={cn(
        "inline-flex items-center font-mono font-bold uppercase border-2 -rotate-2 select-none",
        sizeClass,
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
