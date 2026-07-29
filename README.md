x86_64 kernel written in Rust, following Philipp Oppermann's blog series.

## Setup

- Rust nightly (required for build-std and custom JSON target)
- `rustup component add llvm-tools-preview` (required by bootimage)
- `cargo install bootimage` (builds bootable disk images)
- QEMU (for running)
- Custom target: `x86_64-bill.json` (bare-metal, no OS, no SIMD, soft-float, no red zone)
- build-std recompiles core + compiler_builtins for the custom target

## Check list

### Done

- [x] Freestanding binary (no_std, no_main, custom entry point _start, panic handler)
- [x] Custom x86_64 target spec (x86_64-unknown-none, LLD linker, panic=abort, no SIMD, soft-float)
- [x] Build-std config for core/compiler_builtins recompilation
- [x] Hello World via VGA text buffer at 0xb8000
- [x] Bootable disk image via bootimage + bootloader 0.9
- [x] cargo run boots in QEMU

### Next

- [ ] VGA text mode driver (safe wrapper around VGA buffer)
- [ ] println macro
- [ ] Interrupt handling (IDT, PIC, CPU exceptions)
- [ ] Memory management (page tables, heap allocator)

## Run

```
cargo run
```

Opens QEMU. Disk image is at target/x86_64-bill/debug/bootimage-bill.bin.

## Notes

- bootloader 0.9 is pinned intentionally -- newer versions use a different build system and are not compatible with this post
- .cargo/config.toml uses [target.'cfg(target_os = "none")'] for the runner, which matches the custom target's "os": "none"
- QEMU must be in PATH for bootimage runner to find it
