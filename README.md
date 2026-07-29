x86_64 kernel written in Rust, following Philipp Oppermann's blog series.

## Setup

- Rust nightly (required for build-std and custom JSON target)
- QEMU (for running)

## Structure

- `kernel/` — the kernel crate (no_std, custom target x86_64-bill.json). Has both `lib.rs` (shared test infrastructure, serial, VGA buffer) and `main.rs` (entry point via `entry_point!` macro from `bootloader_api` 0.11.17).
- `runner/` — a host-side helper that wraps the kernel ELF into a bootable disk image and runs it in QEMU. Used both for `cargo run` (via root build.rs) and `cargo test`.
- Root `build.rs` — builds the kernel subcrate, then creates a bootable disk image using `bootloader::BiosBoot`.

## Done

- [x] Freestanding binary (no_std, no_main, custom entry point _start, panic handler)
- [x] Custom x86_64 target spec (x86_64-unknown-none, LLD linker, panic=abort, no SIMD, soft-float)
- [x] Build-std config for core/compiler_builtins recompilation
- [x] Hello World via VGA text buffer at 0xb8000
- [x] Bootable disk image via bootloader 0.11.17 + bootloader_api 0.11.17
- [x] cargo run boots in QEMU
- [x] Serial port driver (COM1, 0x3F8) via raw x86_64 port I/O
- [x] print!/println! macros (VGA text + framebuffer)
- [x] serial_print!/serial_println! macros (COM1 serial)
- [x] Testing framework: `custom_test_frameworks`, `test_runner`, `exit_qemu` via `isa-debug-exit`
- [x] Test runner crate: creates bootable disk image + runs QEMU with test args, maps exit code 33 -> 0
- [x] `cargo test --bin kernel --no-run` compiles
- [x] VGA text mode driver (safe wrapper around VGA buffer)
- [x] println macro

## Next

- [ ] `cargo test --bin kernel` — in progress (runner compilation inherits build-std/target config from kernel)
- [ ] Interrupt handling (IDT, PIC, CPU exceptions)
- [ ] Memory management (page tables, heap allocator)

## Run

```
cargo run
```

Boots the kernel in QEMU. The disk image is created by `build.rs` using `bootloader::BiosBoot`.

## Test

```
cd kernel
cargo test --bin kernel --no-run   # compiles test binary
cargo test --bin kernel             # also runs in QEMU (WIP)
```

Tests run inside QEMU via `isa-debug-exit`. Results are reported over serial. Exit code 0x21 (33) from QEMU is mapped to exit code 0 by the runner.

## Notes

- Uses `bootloader` 0.11.17 (not the deprecated `bootimage` crate). The kernel entry point uses `bootloader_api::entry_point!`.
- `.cargo/config.toml` in `kernel/` uses `[target.'cfg(target_os = "none")']` for the runner, matching the custom target's `"os": "none"`.
- QEMU must be in PATH.
- The kernel workspace includes `runner/` as a member for builds, but the runner must be compiled for the host (not the custom bare-metal target).
