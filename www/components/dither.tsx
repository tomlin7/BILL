"use client"

import { useEffect, useRef } from "react"

const BAYER8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 53, 21, 61, 29, 55, 23],
]

export type DitherType = "boot" | "serial" | "vga" | "test"

// Subtle accent color palette for interactive state (calm, non-gimmicky OS hardware telemetry colors)
const PALETTES: Record<DitherType, { base: [number, number, number]; accent: [number, number, number] }> = {
  boot: {
    base: [200, 200, 200],
    accent: [74, 222, 128], // Phosphor Green
  },
  serial: {
    base: [200, 200, 200],
    accent: [56, 189, 248], // Cyan Logic
  },
  vga: {
    base: [200, 200, 200],
    accent: [251, 191, 36], // Amber CRT
  },
  test: {
    base: [200, 200, 200],
    accent: [248, 113, 113], // Diagnostic Red
  },
}

interface DitherCanvasProps {
  type: DitherType
  className?: string
  width?: number
  height?: number
  isHovered?: boolean
  mousePos?: { x: number; y: number }
}

export function DitherCanvas({
  type,
  className = "",
  width = 360,
  height = 160,
  isHovered = false,
  mousePos = { x: -1, y: -1 },
}: DitherCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hoverRef = useRef(isHovered)
  const mouseRef = useRef(mousePos)

  useEffect(() => {
    hoverRef.current = isHovered
    mouseRef.current = mousePos
  }, [isHovered, mousePos])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animFrameId: number
    const startTime = performance.now()

    const palette = PALETTES[type]

    const render = (now: number) => {
      // Significantly slowed down time factor for smooth, non-violent movement
      const t = (now - startTime) * 0.0003
      const imgData = ctx.createImageData(width, height)
      const data = imgData.data

      const isHov = hoverRef.current
      const mPos = mouseRef.current

      // Mouse local coordinates scaled to canvas size
      const mx = mPos.x * width
      const my = mPos.y * height

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let val = 0
          let isAccent = false

          if (type === "boot") {
            // Memory layout map with slow, smooth scanning bar
            const nx = x / width
            const ny = y / height

            const gridX = Math.floor(nx * 24)
            const gridY = Math.floor(ny * 12)
            const blockHash = Math.sin(gridX * 12.9898 + gridY * 78.233 + Math.floor(t * (isHov ? 3 : 1))) * 43758.5453
            const blockVal = blockHash - Math.floor(blockHash)

            // Slow, calming scanline
            const scan = Math.exp(-Math.pow(ny - ((t * 0.2) % 1.2) + 0.1, 2) * 100)
            const wave = Math.sin(nx * 12 + t * 1.5) * 0.08

            val = 0.15 + 0.4 * blockVal + 0.5 * scan + wave

            if (isHov && (scan > 0.4 || (gridX % 5 === 0 && gridY % 4 === 0))) {
              isAccent = true
            }
          } else if (type === "serial") {
            // 16550 UART COM1 Serial Oscilloscope - Slow pulse
            const nx = x / width
            const ny = y / height

            // Square wave output
            const bitState = Math.sin(Math.floor(nx * 18.0 - t * 4.0) * 45.1) > 0.1 ? 1 : 0
            const sigY = 0.5 + 0.25 * (bitState ? -1 : 1)
            const dist = Math.abs(ny - sigY)
            const isWaveLine = dist < 0.04

            // Subtle vertical clock grid
            const isClockTick = (Math.floor(x / 16) % 2 === 0) && (y % 6 === 0)

            val = isWaveLine ? 0.9 : (isClockTick ? 0.3 : 0.05)

            if (isHov && isWaveLine) {
              isAccent = true
            }
          } else if (type === "vga") {
            // VGA MMIO 0xB8000 Text Buffer 80x25 Matrix - Gentle cell updates
            const cols = 36
            const rows = 14
            const cellX = Math.floor((x / width) * cols)
            const cellY = Math.floor((y / height) * rows)
            
            const isBorder = (x % 10 === 0) || (y % 11 === 0)
            
            const charSeed = Math.sin(cellX * 91.1 + cellY * 47.3 + Math.floor(t * (isHov ? 3 : 1))) * 43758.5453
            const isActiveChar = (charSeed - Math.floor(charSeed)) > 0.4

            const isCursorCell = cellX === 32 && cellY === 10 && Math.floor(t * 1.5) % 2 === 0

            if (isCursorCell) {
              val = 0.95
              isAccent = true
            } else if (isActiveChar && !isBorder) {
              const lx = x % 10
              const ly = y % 11
              const isGlyphPixel = (lx >= 2 && lx <= 7 && ly >= 2 && ly <= 8) && ((lx + ly) % 2 === 0)
              val = isGlyphPixel ? 0.8 : 0.05
              if (isHov && isGlyphPixel && cellY % 2 === 0) isAccent = true
            } else {
              val = isBorder ? 0.12 : 0.04
            }
          } else if (type === "test") {
            // ISA-Debug-Exit QEMU exit device status sweep - Gentle radar motion
            const cx = width / 2
            const cy = height / 2
            const dx = x - cx
            const dy = y - cy
            const dist = Math.sqrt(dx * dx + dy * dy)

            const ring = Math.sin(dist * 0.12 - t * 2.0)
            const isRingLine = Math.abs(ring) > 0.88

            val = (isRingLine ? 0.7 : 0.08)

            if (isHov && isRingLine) {
              isAccent = true
            }
          }

          // Soft cursor proximity interaction
          if (isHov && mPos.x >= 0 && mPos.y >= 0) {
            const dx = x - mx
            const dy = y - my
            const mDist = Math.sqrt(dx * dx + dy * dy)
            const radius = 40
            if (mDist < radius) {
              const factor = (1 - mDist / radius) * 0.5
              val = Math.min(1.0, val + factor)
            }
          }

          // Bayer 8x8 matrix evaluation
          const bayerVal = BAYER8[y % 8][x % 8] / 64.0
          const pixelOn = val > bayerVal

          const idx = (y * width + x) * 4
          if (pixelOn) {
            const color = isAccent ? palette.accent : palette.base
            data[idx] = color[0]
            data[idx + 1] = color[1]
            data[idx + 2] = color[2]
            data[idx + 3] = 255
          } else {
            data[idx] = 10
            data[idx + 1] = 10
            data[idx + 2] = 10
            data[idx + 3] = 255
          }
        }
      }

      ctx.putImageData(imgData, 0, 0)
      animFrameId = requestAnimationFrame(render)
    }

    animFrameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animFrameId)
  }, [type, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`w-full h-full object-cover rounded-none ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  )
}
