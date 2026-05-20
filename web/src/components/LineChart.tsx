import { scoreColor } from "../lib/format";

interface Point {
  label: string;
  value: number;
}

interface Props {
  data: Point[];
  max?: number;
  height?: number;
  showValues?: boolean;
  /** Colore cada ponto conforme o valor (verde/âmbar/vermelho). */
  colorByValue?: boolean;
}

/** Gráfico de linha simples (linha preta, pontos com cor opcional). */
export function LineChart({
  data,
  max = 100,
  height = 200,
  showValues = true,
  colorByValue = false,
}: Props) {
  const width = 640;
  const padX = 34;
  const padTop = 34;
  const padBottom = 34;

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-neutral-400">
        Sem dados para exibir ainda.
      </p>
    );
  }

  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const x = (i: number) =>
    data.length === 1 ? width / 2 : padX + (i / (data.length - 1)) * innerW;
  const y = (v: number) =>
    padTop + innerH - (Math.max(0, Math.min(max, v)) / max) * innerH;

  const linePath = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`)
    .join(" ");

  const labelStep = Math.ceil(data.length / 8);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* linhas de grade horizontais */}
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={padX}
          x2={width - padX}
          y1={padTop + innerH * t}
          y2={padTop + innerH * t}
          stroke="var(--color-neutral-100)"
          strokeWidth={1}
        />
      ))}

      {/* linha do gráfico */}
      {data.length > 1 && (
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-neutral-900)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {data.map((p, i) => {
        const dot = colorByValue
          ? scoreColor(p.value).hex
          : "var(--color-neutral-900)";
        return (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r={5} fill={dot} />
          <circle
            cx={x(i)}
            cy={y(p.value)}
            r={1.9}
            fill="var(--color-white)"
          />

          {showValues && (
            <g>
              <rect
                x={x(i) - 15}
                y={y(p.value) - 28}
                width={30}
                height={18}
                rx={6}
                fill="var(--color-white)"
                stroke="var(--color-neutral-200)"
              />
              <text
                x={x(i)}
                y={y(p.value) - 15.5}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill={dot}
              >
                {p.value}
              </text>
            </g>
          )}

          {i % labelStep === 0 && (
            <text
              x={x(i)}
              y={height - 12}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-neutral-400)"
            >
              {p.label}
            </text>
          )}
        </g>
        );
      })}
    </svg>
  );
}
