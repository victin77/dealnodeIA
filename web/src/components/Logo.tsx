/* Marca do DealNote AI — o mascote peixe. Ilustração colorida própria,
   por isso é um <img> e não a máscara monocromática antiga. */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/mascote.png"
      alt="DealNote AI"
      className={className}
      draggable={false}
    />
  );
}
