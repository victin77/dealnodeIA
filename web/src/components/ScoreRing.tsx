import { scoreColor, scoreLabel } from "../lib/format";

interface Props {
  score: number;
  size?: number;
  showLabel?: boolean;
}

/** Anel de score de fechamento, com cor semântica (verde/âmbar/vermelho). */
export function ScoreRing({ score, size = 104, showLabel = true }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = size < 70 ? 6 : 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-neutral-200)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.hex}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="font-bold" style={{ fontSize: size * 0.3, color: color.hex }}>
          {clamped}
        </span>
        {showLabel && size >= 90 && (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            {scoreLabel(clamped)}
          </span>
        )}
      </div>
    </div>
  );
}
