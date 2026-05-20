/**
 * Ilustração vetorial própria — pessoa acenando, estilo flat monocromático.
 * Usa as variáveis de cor do tema, então inverte sozinha no modo escuro.
 * O braço, a mão e as linhas do aceno giram juntos (classe dn-wave),
 * em torno do ombro, criando a animação de aceno.
 */
export function WavingPerson({ className = "" }: { className?: string }) {
  const ink = "var(--color-neutral-900)";
  const paper = "var(--color-white)";

  return (
    <svg
      viewBox="0 0 240 240"
      className={`overflow-visible ${className}`}
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* pescoço */}
      <rect x="114" y="118" width="28" height="36" fill={ink} />

      {/* braço levantado */}
      <line
        className="dn-wave"
        x1="80"
        y1="168"
        x2="48"
        y2="92"
        stroke={ink}
        strokeWidth="24"
        strokeLinecap="round"
      />

      {/* torso / ombros */}
      <rect x="58" y="150" width="140" height="96" rx="40" fill={ink} />

      {/* cabelo */}
      <circle cx="128" cy="84" r="46" fill={ink} />
      {/* rosto */}
      <circle cx="128" cy="92" r="40" fill={paper} />

      {/* hastes dos óculos */}
      <line
        x1="100"
        y1="93"
        x2="91"
        y2="90"
        stroke={ink}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="158"
        y1="93"
        x2="167"
        y2="90"
        stroke={ink}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* óculos */}
      <circle cx="112" cy="96" r="13" fill={paper} stroke={ink} strokeWidth="4.5" />
      <circle cx="146" cy="96" r="13" fill={paper} stroke={ink} strokeWidth="4.5" />
      <line x1="125" y1="96" x2="133" y2="96" stroke={ink} strokeWidth="4.5" />

      {/* olhos */}
      <circle cx="112" cy="97" r="3.6" fill={ink} />
      <circle cx="146" cy="97" r="3.6" fill={ink} />

      {/* sorriso */}
      <path
        d="M116 116 Q128 127 140 116"
        stroke={ink}
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* mão */}
      <circle
        className="dn-wave"
        cx="44"
        cy="80"
        r="20"
        fill={paper}
        stroke={ink}
        strokeWidth="5"
      />

      {/* linhas do aceno */}
      <path
        className="dn-wave"
        d="M21 60 Q13 54 17 45"
        stroke={ink}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        className="dn-wave"
        d="M32 49 Q25 44 28 35"
        stroke={ink}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
