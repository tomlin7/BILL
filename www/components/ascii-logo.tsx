"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// prettier-ignore
const GLYPHS: Record<string, number[][]> = {
  B: [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
  ],
  I: [
    [1,1,1],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [1,1,1],
  ],
  L: [
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
}

const WORD  = ["B", "I", "L", "L"]
const S     = 12    // block size px
const GAP   = S     // gap between letters
const ROWS  = 7
const PAD   = 0
const SPEED = 220   // wave px/s
const LIFE  = 1.8   // wave lifetime seconds

// Compute bounding perimeter filled cells, sorted clockwise by angle from glyph centre
function computePerimeter(glyph: number[][]): [number, number][] {
  const rows = glyph.length
  const cols = glyph[0].length
  const cy   = (rows - 1) / 2
  const cx   = (cols - 1) / 2
  const cells: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!glyph[r][c]) continue
      const outer = [[-1,0],[1,0],[0,-1],[0,1]].some(([dr,dc]) => {
        const nr = r + dr, nc = c + dc
        return nr < 0 || nr >= rows || nc < 0 || nc >= cols || !glyph[nr][nc]
      })
      if (outer) cells.push([r, c])
    }
  }
  // Sort clockwise: atan2 returns -π..π, shift to 0..2π so top-right starts first
  return cells.sort((a, b) => {
    const aa = (Math.atan2(a[0] - cy, a[1] - cx) + 2 * Math.PI) % (2 * Math.PI)
    const ba = (Math.atan2(b[0] - cy, b[1] - cx) + 2 * Math.PI) % (2 * Math.PI)
    return aa - ba
  })
}

function circDist(a: number, b: number, total: number) {
  const d = Math.abs(a - b)
  return Math.min(d, total - d)
}

function interpolateHex(
  base: [number, number, number],
  target: [number, number, number],
  t: number
): string {
  const r = Math.round(base[0] + (target[0] - base[0]) * t)
  const g = Math.round(base[1] + (target[1] - base[1]) * t)
  const b = Math.round(base[2] + (target[2] - base[2]) * t)
  return `rgb(${r},${g},${b})`
}

// Fire gradient for wave heat [0..1]
function heatColor(heat: number): string {
  if (heat > 0.92) return `rgb(255,255,${Math.floor(60 + heat * 195)})` // white-yellow
  if (heat > 0.72) { const t=(heat-0.72)/0.20; return `rgb(255,${Math.floor(160+t*95)},${Math.floor(t*40)})` }
  if (heat > 0.48) { const t=(heat-0.48)/0.24; return `rgb(255,${Math.floor(60+t*100)},0)` }
  if (heat > 0.20) { const t=(heat-0.20)/0.28; return `rgb(255,${Math.floor(18+t*42)},0)` }
  const t = heat / 0.20
  return `rgb(${Math.floor(35+t*220)},${Math.floor(t*18)},0)`
}

// Pre-compute layout
const letterOffsets: number[] = []
const perimeters: [number, number][][] = []
let _cx = PAD
WORD.forEach((ch, i) => {
  letterOffsets.push(_cx)
  perimeters.push(computePerimeter(GLYPHS[ch]))
  _cx += GLYPHS[ch][0].length * S + (i < WORD.length - 1 ? GAP : 0)
})
const SVG_W = _cx + PAD
const SVG_H = ROWS * S + PAD * 2

interface Wave { x: number; y: number; startTime: number; isExplode: boolean }
interface HoldInfo { letterIdx: number; startTime: number; elapsed: number }

export function BillAsciiLogo() {
  const [waves,    setWaves]    = useState<Wave[]>([])
  const [holdInfo, setHoldInfo] = useState<HoldInfo | null>(null)
  const [tick,     setTick]     = useState(0)

  const timeRef    = useRef(0)
  const animRef    = useRef<number>(0)
  const svgRef     = useRef<SVGSVGElement | null>(null)
  const holdRef    = useRef<HoldInfo | null>(null)  // kept in sync for RAF access

  // Keep ref in sync
  useEffect(() => { holdRef.current = holdInfo }, [holdInfo])

  useEffect(() => {
    const loop = (now: number) => {
      timeRef.current = now * 0.001
      // Sync elapsed into holdInfo
      setHoldInfo(prev => {
        if (!prev) return null
        const elapsed = Date.now() - prev.startTime
        if (elapsed >= 3000) {
          // Auto-explode after 3 seconds
          spawnWaveFromLetter(prev.letterIdx, true)
          return null
        }
        return { ...prev, elapsed }
      })
      setTick(t => t + 1)
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  const spawnWaveFromLetter = useCallback((li: number, isExplode: boolean) => {
    if (!svgRef.current) return
    const rect  = svgRef.current.getBoundingClientRect()
    const ch    = WORD[li]
    const glyph = GLYPHS[ch]
    const ox    = letterOffsets[li]
    const svgX  = ox + (glyph[0].length * S) / 2
    const svgY  = (ROWS * S) / 2
    const sx    = rect.left + (svgX / SVG_W) * rect.width
    const sy    = rect.top  + (svgY / SVG_H) * rect.height
    const t     = performance.now() * 0.001
    setWaves(prev => [
      ...prev.filter(w => t - w.startTime < LIFE),
      { x: sx, y: sy, startTime: t, isExplode },
    ])
  }, [])

  const getLetterIdx = (screenX: number): number => {
    if (!svgRef.current) return 0
    const rect = svgRef.current.getBoundingClientRect()
    const svgX = (screenX - rect.left) / rect.width * SVG_W
    let nearest = 0
    let nearestDist = Infinity
    WORD.forEach((ch, li) => {
      const ox     = letterOffsets[li]
      const centre = ox + GLYPHS[ch][0].length * S / 2
      const d = Math.abs(svgX - centre)
      if (d < nearestDist) { nearestDist = d; nearest = li }
    })
    return nearest
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const li = getLetterIdx(e.clientX)
    setHoldInfo({ letterIdx: li, startTime: Date.now(), elapsed: 0 })
  }

  const handleMouseRelease = (e: React.MouseEvent) => {
    setHoldInfo(prev => {
      if (!prev) return null
      const duration = Date.now() - prev.startTime
      spawnWaveFromLetter(prev.letterIdx, duration >= 350)
      return null
    })
  }

  // ── Rendering ────────────────────────────────────────────────────────────
  const t           = timeRef.current
  const activeWaves = waves.filter(w => t - w.startTime < LIFE)

  const toScreen = (svgX: number, svgY: number): [number, number] => {
    if (!svgRef.current) return [0, 0]
    const rect = svgRef.current.getBoundingClientRect()
    return [
      rect.left + (svgX / SVG_W) * rect.width,
      rect.top  + (svgY / SVG_H) * rect.height,
    ]
  }

  const getWaveHeat = (svgX: number, svgY: number): number => {
    if (activeWaves.length === 0) return 0
    const [sx, sy] = toScreen(svgX, svgY)
    let maxHeat = 0
    activeWaves.forEach(w => {
      const age  = t - w.startTime
      const dist = Math.sqrt((sx - w.x) ** 2 + (sy - w.y) ** 2)
      const timeSinceHit = age - dist / SPEED
      if (timeSinceHit < 0 || timeSinceHit >= LIFE * 0.95) return

      const thickness = w.isExplode ? 36 : 22
      const envelope  = 1 - age / LIFE

      let heat = 0
      if (timeSinceHit < 0.04) {
        heat = 0.65 + (timeSinceHit / 0.04) * 0.35  // ramp to peak
      } else if (timeSinceHit < 0.13) {
        heat = 1.0  // peak plateau
      } else if (timeSinceHit < 0.58) {
        const p = (timeSinceHit - 0.13) / 0.45
        heat = 0.90 * Math.pow(1 - p, w.isExplode ? 1.2 : 1.5)
      } else {
        const p = (timeSinceHit - 0.58) / (LIFE * 0.95 - 0.58)
        heat = 0.12 * (1 - p)
      }

      const frontDist = Math.abs(dist - age * SPEED)
      const ringFade  = timeSinceHit < 0.16 ? 1 : Math.max(0, 1 - frontDist / thickness)
      heat = heat * envelope * (0.5 + 0.5 * ringFade)

      if (heat > maxHeat) maxHeat = heat
    })
    return Math.min(1, maxHeat)
  }

  // Fire ring colors
  const RING_FIRE   = ["#ff5500", "#ff7e33", "#ffa54f"]
  const RING_DARK   = "#52525b"
  const INNER_DARK  = "#27272a"
  const OTHER_BASE: [number,number,number] = [120, 120, 120]
  const OTHER_DARK: [number,number,number] = [24,  24,  27]

  const rects: React.ReactElement[] = []

  WORD.forEach((ch, li) => {
    const glyph  = GLYPHS[ch]
    const ox     = letterOffsets[li]
    const perim  = perimeters[li]
    const pLen   = perim.length

    glyph.forEach((row, r) => {
      row.forEach((on, c) => {
        if (!on) return

        const px   = ox + c * S
        const py   = PAD + r * S
        const bcx  = px + S / 2
        const bcy  = py + S / 2

        // Wave heat takes priority
        const heat = getWaveHeat(bcx, bcy)

        let fill    = "currentColor"
        let opacity = 1

        if (heat > 0.01) {
          // Wave coloring
          fill = heatColor(heat)
          // Impact punch: scale up at peak
          if (heat > 0.88) {
            const punch  = 1 + (heat - 0.88) * 0.22
            const offset = (S - S * punch) / 2
            rects.push(
              <rect
                key={`${li}-${r}-${c}`}
                x={px + offset} y={py + offset}
                width={S * punch} height={S * punch}
                fill={fill}
              />
            )
            return
          }
        } else if (holdInfo) {
          if (holdInfo.letterIdx === li) {
            // ── THIS letter is being held ──
            // Check if this cell is on the perimeter
            const perimIdx = perim.findIndex(([pr, pc]) => pr === r && pc === c)

            if (perimIdx !== -1) {
              // Spinning fire cursor — speed increases with hold duration
              const speed      = 0.05 + (holdInfo.elapsed / 3000) * 0.4
              const cursorPos  = (tick * speed) % pLen
              const dist       = circDist(perimIdx, cursorPos, pLen)
              if (dist < 3) {
                fill = RING_FIRE[Math.min(2, Math.floor(dist))]
              } else {
                fill = RING_DARK
              }
            } else {
              // Inner cell — very dark
              fill = INNER_DARK
            }
          } else {
            // ── OTHER letters dim as hold progresses ──
            const progress = Math.min(1, holdInfo.elapsed / 3000)
            fill = interpolateHex(OTHER_BASE, OTHER_DARK, progress)
          }
        }

        rects.push(
          <rect
            key={`${li}-${r}-${c}`}
            x={px} y={py}
            width={S} height={S}
            fill={fill}
            opacity={opacity}
          />
        )
      })
    })
  })

  return (
    <svg
      ref={svgRef}
      width={SVG_W}
      height={SVG_H}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      shapeRendering="crispEdges"
      className="select-none block cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseRelease}
      onMouseLeave={handleMouseRelease}
    >
      {rects}
    </svg>
  )
}
