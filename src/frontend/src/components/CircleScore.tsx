import { useEffect, useRef, useState } from "react";

interface CircleScoreProps {
  score: number;
  label: string;
  size?: number;
  animate?: boolean;
}

function getScoreColor(score: number): { stroke: string; text: string; shadow: string } {
  if (score >= 70) {
    return {
      stroke: "oklch(0.72 0.18 150)",
      text: "text-score-high",
      shadow: "shadow-glow-green",
    };
  } else if (score >= 50) {
    return {
      stroke: "oklch(0.78 0.2 80)",
      text: "text-score-mid",
      shadow: "shadow-glow-yellow",
    };
  } else {
    return {
      stroke: "oklch(0.65 0.22 25)",
      text: "text-score-low",
      shadow: "shadow-glow-red",
    };
  }
}

export function CircleScore({ score, label, size = 160, animate = true }: CircleScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const circleRef = useRef<SVGCircleElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const radius = (size / 2) * 0.78;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const dashOffset = circumference - (clampedScore / 100) * circumference;
  const colors = getScoreColor(clampedScore);
  const duration = 1200;

  useEffect(() => {
    if (!animate) {
      setDisplayScore(Math.round(clampedScore));
      setDrawn(true);
      return;
    }

    setDisplayScore(0);
    setDrawn(false);

    const start = performance.now();
    startTimeRef.current = start;

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / 1200, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayScore(Math.round(eased * clampedScore));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayScore(Math.round(clampedScore));
        setDrawn(true);
      }
    };

    const raf = requestAnimationFrame(tick);
    animFrameRef.current = raf;

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [animate, clampedScore]);

  const strokeProgress = drawn
    ? dashOffset
    : animate
    ? circumference
    : dashOffset;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative rounded-full ${colors.shadow}`}
        style={{ width: size, height: size }}
      >
        {/* Background grid / scan lines texture */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 6px, oklch(0.72 0.19 200 / 0.15) 6px, oklch(0.72 0.19 200 / 0.15) 7px)",
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
          style={{ transform: "rotate(-90deg)" }}
          aria-label={`${label}: ${displayScore} out of 100`}
          role="img"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.28 0.04 255)"
            strokeWidth={size * 0.055}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={size * 0.055}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeProgress}
            style={{
              transition: animate ? `stroke-dashoffset ${duration}ms cubic-bezier(0.4,0,0.2,1)` : "none",
              filter: `drop-shadow(0 0 6px ${colors.stroke})`,
            }}
          />
          {/* Glow arc (wider, lower opacity) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={size * 0.11}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeProgress}
            opacity={0.08}
            style={{
              transition: animate ? `stroke-dashoffset ${duration}ms cubic-bezier(0.4,0,0.2,1)` : "none",
            }}
          />
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono text-foreground leading-none ${colors.text}`}
            style={{
              fontSize: size * 0.22,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}
          >
            {displayScore}
          </span>
          <span
            className="text-muted-foreground leading-none mt-1"
            style={{ fontSize: size * 0.095, fontFamily: "'JetBrains Mono', monospace" }}
          >
            /100
          </span>
        </div>
      </div>

      <span
        className="text-muted-foreground font-medium tracking-widest uppercase"
        style={{ fontSize: 11, letterSpacing: "0.12em" }}
      >
        {label}
      </span>
    </div>
  );
}
