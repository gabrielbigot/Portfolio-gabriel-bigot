/**
 * Decorative divider: a thin line closed by small staples, echoing the scar story on /about.
 * Static markup only (no Math) so server and client render identically.
 */
export default function Suture({ className = "" }: { className?: string }) {
  const staples = [20, 52, 84, 116, 148, 180, 212, 244]
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 264 14"
      preserveAspectRatio="xMinYMid meet"
      className={`h-3.5 w-auto text-muted-foreground/60 ${className}`}
      fill="none"
      stroke="currentColor"
    >
      <path d="M2 7 H262" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      {staples.map((x) => (
        <g key={x}>
          <line x1={x - 5} y1="7" x2={x + 5} y2="7" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx={x - 5} cy="7" r="1.6" strokeWidth="0.9" className="fill-background" />
          <circle cx={x + 5} cy="7" r="1.6" strokeWidth="0.9" className="fill-background" />
        </g>
      ))}
    </svg>
  )
}
