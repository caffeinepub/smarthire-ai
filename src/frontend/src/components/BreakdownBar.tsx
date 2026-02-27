import { useEffect, useRef, useState } from "react";

interface BreakdownBarProps {
  label: string;
  score: number;
  delay?: number;
  icon?: string;
}

function getBarColor(score: number): string {
  if (score >= 70) return "oklch(0.72 0.18 150)";
  if (score >= 50) return "oklch(0.78 0.2 80)";
  return "oklch(0.65 0.22 25)";
}

function getTextColor(score: number): string {
  if (score >= 70) return "text-score-high";
  if (score >= 50) return "text-score-mid";
  return "text-score-low";
}

export function BreakdownBar({ label, score, delay = 0, icon }: BreakdownBarProps) {
  const [width, setWidth] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  const clampedScore = Math.min(100, Math.max(0, score));
  const barColor = getBarColor(clampedScore);
  const textColor = getTextColor(clampedScore);

  useEffect(() => {
    setWidth(0);
    setDisplayScore(0);

    const timer = setTimeout(() => {
      const start = performance.now();
      const animDuration = 800;

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / animDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        setWidth(eased * clampedScore);
        setDisplayScore(Math.round(eased * clampedScore));

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          setWidth(clampedScore);
          setDisplayScore(Math.round(clampedScore));
        }
      };

      animFrameRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [delay, clampedScore]);

  return (
    <div className="flex items-center gap-3 group">
      {/* Label */}
      <div className="flex items-center gap-1.5 w-28 shrink-0">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="text-sm text-muted-foreground font-medium tracking-wide">{label}</span>
      </div>

      {/* Bar track */}
      <div
        ref={barRef}
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "oklch(0.22 0.03 255)" }}
      >
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
            boxShadow: `0 0 8px ${barColor}66`,
            transition: "none",
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.2) 50%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="w-12 text-right shrink-0">
        <span
          className={`font-mono text-sm font-semibold ${textColor}`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {displayScore}
        </span>
        <span className="text-muted-foreground text-xs">/100</span>
      </div>
    </div>
  );
}
