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
  size?: "sm" | "md" | "lg";
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
      : size === "lg"
        ? "text-3xl px-6 py-3 tracking-widest"
        : "text-sm px-3 py-1.5 tracking-wider";

  return (
    <span
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
