/**
 * A pen stroke generated from a signature's bytes: the same signature always
 * draws the same flourish, two signatures never look alike. It's decoration
 * derived from cryptographic output, not a handwriting imitation.
 */
export function strokePath(signature: string, width = 240, height = 64): string {
  const hex = signature.replace(/^0x/, "")
  const byte = (i: number) => parseInt(hex.slice((i * 2) % (hex.length - 1), ((i * 2) % (hex.length - 1)) + 2), 16) || 0

  const left = 10
  const right = width - 36
  const base = height * 0.7
  const top = height * 0.12
  // A tall opening capital with a loop, then humps like cursive letters.
  const pts: Array<[number, number]> = [
    [left + 6, base],
    [left + 14 + (byte(1) % 10), top + (byte(2) % 6)],
    [left + 4 + (byte(3) % 8), base + 4],
    [left + 22 + (byte(4) % 8), height * 0.45],
  ]
  const humps = 6 + (byte(0) % 4)
  const span = right - (left + 30)
  for (let i = 0; i < humps; i++) {
    const x0 = left + 30 + (i / humps) * span
    const hi = top + 6 + (byte(i + 10) / 255) * (base - top) * 0.55
    const loop = byte(i + 30) % 3 === 0
    pts.push([x0 + span / humps / 2, hi])
    if (loop) pts.push([x0 + span / humps / 2 - 9, base - 6 - (byte(i + 40) % 8)])
    pts.push([x0 + span / humps, base - (byte(i + 50) % 10)])
  }

  // Catmull-Rom to cubic Bézier.
  let d = `M${pts[0]![0].toFixed(1)} ${pts[0]![1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  // The underline flourish: dip down-left, then sweep right.
  const [lx, ly] = pts[pts.length - 1]!
  const dip = height - 8 - (byte(40) % 6)
  d += ` C${(lx + 18).toFixed(1)} ${(ly + 10).toFixed(1)} ${(lx - 30).toFixed(1)} ${dip} ${(left + 30 + (byte(41) % 30)).toFixed(1)} ${dip}`
  d += ` S${(width - 20).toFixed(1)} ${(dip - 4 - (byte(42) % 6)).toFixed(1)} ${(width - 8).toFixed(1)} ${(dip - 10).toFixed(1)}`
  return d
}
