"use client"

import { useState, useRef } from "react"
import { ArrowUpRight, CheckSquare, Square, ChevronDown, ChevronRight, Cpu, ShieldCheck, Terminal } from "lucide-react"
import { DitherCanvas, DitherType } from "@/components/dither"
import { BillAsciiLogo } from "@/components/ascii-logo"
import { ThemeToggle } from "@/components/theme-toggle"

const DONE_TASKS = [
  "freestanding binary (no_std, no_main)",
  "custom x86_64 target (lld, panic=abort)",
  "build-std for core + compiler_builtins",
  "hello world via vga text buffer",
  "bootable disk image (bootloader 0.11.17)",
  "cargo run boots in qemu",
  "serial driver (com1, 0x3f8)",
  "print!/println! macros",
  "serial_print!/serial_println! macros",
  "custom test framework (isa-debug-exit)",
  "test runner crate (exit 33 -> 0)",
  "vga text mode driver (safe wrapper)",
  "cargo test --bin kernel --no-run compiles",
]

const PLANNED_TASKS = [
  "cargo test --bin kernel",
  "interrupts",
  "memory",
]

interface BentoItem {
  id: string
  title: string
  ditherType: DitherType
  description: string
  colSpan: string
}

const BENTO_FEATURES: BentoItem[] = [
  {
    id: "boot",
    title: "Boot",
    ditherType: "boot",
    description: "Freestanding Rust binary compiled for x86_64 bare metal. Boots directly in QEMU via bootloader 0.11.17.",
    colSpan: "sm:col-span-2",
  },
  {
    id: "serial",
    title: "Serial Output",
    ditherType: "serial",
    description: "UART driver over COM1 (0x3f8). Enables serial_print! and serial_println! for terminal logging.",
    colSpan: "sm:col-span-1",
  },
  {
    id: "vga",
    title: "VGA Text Buffer",
    ditherType: "vga",
    description: "Memory-mapped VGA driver for printing text to the screen using print! and println! macros.",
    colSpan: "sm:col-span-1",
  },
  {
    id: "test",
    title: "Testing Framework",
    ditherType: "test",
    description: "Custom test runner executing inside QEMU with automatic exit reporting via isa-debug-exit.",
    colSpan: "sm:col-span-2",
  },
]

function BentoCard({ feature }: { feature: BentoItem }) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: -1, y: -1 })
  const cardRef = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePos({ x, y })
  }

  return (
    <div
      ref={cardRef}
      data-type={feature.ditherType}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMousePos({ x: -1, y: -1 })
      }}
      onMouseMove={handleMouseMove}
      className={`bento-card group flex flex-col p-4 ${feature.colSpan}`}
    >
      {/* Dither Animation Canvas */}
      <div className="relative h-36 w-full border border-[#1a1a1a] bg-[#020202] overflow-hidden mb-4">
        <DitherCanvas
          type={feature.ditherType}
          width={380}
          height={180}
          isHovered={isHovered}
          mousePos={mousePos}
        />
      </div>

      {/* Title */}
      <h3 className="font-sans font-bold text-sm tracking-wide text-foreground">
        {feature.title}
      </h3>

      {/* Clean Description */}
      <p className="mt-2 text-muted-foreground text-xs leading-relaxed font-mono">
        {feature.description}
      </p>
    </div>
  )
}

export default function Page() {
  const [tasklistOpen, setTasklistOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col border-x border-[#1a1a1a] px-4 py-6 font-mono text-xs leading-relaxed">
      
      {/* Site Header */}
      <header className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
        <BillAsciiLogo />
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/tomlin7/bill"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 border border-[#222222] bg-[#080808] px-3 py-1 text-xs font-mono hover:bg-foreground hover:text-background transition-colors"
          >
            <span>github</span>
            <ArrowUpRight className="size-3" />
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Overview */}
      <section className="border-b border-[#1a1a1a] py-6">
        <p className="text-foreground text-sm font-sans font-semibold">
          x86_64 kernel in Rust. no_std. boots in QEMU.
        </p>
      </section>

      {/* Bento Grid */}
      <section className="border-b border-[#1a1a1a] py-6">
        <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Features
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {BENTO_FEATURES.map((feature) => (
            <BentoCard key={feature.id} feature={feature} />
          ))}
        </div>
      </section>

      {/* Tasklist */}
      <section className="border-b border-[#1a1a1a] py-6">
        <div className="border border-[#1a1a1a] bg-[#040404]">
          <button
            onClick={() => setTasklistOpen(!tasklistOpen)}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-white/5 transition-colors select-none"
          >
            <div className="flex items-center gap-2">
              {tasklistOpen ? <ChevronDown className="size-4 text-foreground" /> : <ChevronRight className="size-4 text-foreground" />}
              <span className="font-sans font-semibold text-xs text-foreground">
                Tasklist ({DONE_TASKS.length} done, {PLANNED_TASKS.length} planned)
              </span>
            </div>
          </button>

          {tasklistOpen && (
            <div className="border-t border-[#1a1a1a] p-4 bg-black space-y-4">
              <div>
                <h3 className="text-xs font-sans font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-foreground" />
                  <span>Done</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {DONE_TASKS.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-mono border border-[#181818] p-2 bg-[#040404]">
                      <CheckSquare className="size-3.5 shrink-0 text-foreground mt-0.5" />
                      <span className="leading-snug text-foreground/90">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-sans font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-foreground" />
                  <span>Planned</span>
                </h3>
                <div className="space-y-2">
                  {PLANNED_TASKS.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-mono border border-[#181818] p-2 bg-[#040404]">
                      <Square className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
                      <span className="leading-snug text-muted-foreground">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between py-4 text-xs font-mono text-muted-foreground">
        <a
          href="https://github.com/tomlin7/bill"
          target="_blank"
          rel="noreferrer"
          className="underline text-foreground hover:opacity-80 transition-opacity"
        >
          github.com/tomlin7/bill
        </a>
        <span>bill © 2026</span>
      </footer>

    </div>
  )
}
