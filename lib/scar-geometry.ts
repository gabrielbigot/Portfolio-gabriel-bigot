// Shared geometry: the real scar, traced on the photo (900 x 675 units).
export const r1 = (v: number) => Math.round(v * 10) / 10


// The real scar, traced on the photo (900 x 675 units). The vector scar sits exactly on top of it.
export const SC = { cx: 465 / 900, cy: 435 / 675, endX: 716.7, endY: 428.3, startX: 213.3 }
export const SCAR_PTS = [
  { x: 213.3, y: 402.7 },
  { x: 256.7, y: 413.3 },
  { x: 300, y: 420 },
  { x: 340, y: 424 },
  { x: 376.7, y: 430 },
  { x: 423.3, y: 438.3 },
  { x: 473.3, y: 448.3 },
  { x: 516.7, y: 456.7 },
  { x: 556.7, y: 457.3 },
  { x: 590, y: 457.3 },
  { x: 630, y: 452.7 },
  { x: 673.3, y: 446 },
  { x: 716.7, y: 428.3 },
]

// Uniform Catmull-Rom through the anchor points, sampled roughly every 10px.
export function spline(anchors: { x: number; y: number }[]) {
  const out: { x: number; y: number }[] = []
  for (let i = 0; i < anchors.length - 1; i++) {
    const p0 = anchors[Math.max(0, i - 1)]
    const p1 = anchors[i]
    const p2 = anchors[i + 1]
    const p3 = anchors[Math.min(anchors.length - 1, i + 2)]
    const n = Math.max(4, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 10))
    for (let k = 0; k < n; k++) {
      const t = k / n
      const t2 = t * t
      const t3 = t2 * t
      out.push({
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      })
    }
  }
  out.push(anchors[anchors.length - 1])
  return out
}

