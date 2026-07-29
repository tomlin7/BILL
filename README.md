A minimal x86_64 kernel written in Rust.

## Features

- [x] Freestanding Rust binary (no_std, no_main)
- [x] Hello World via VGA text buffer
- [x] Bootable disk image via bootimage

- [ ] ...

## Run

Requires QEMU, Rust nightly, and `bootimage`:

```
rustup override set nightly
rustup component add llvm-tools-preview
cargo install bootimage
```

Then:

```
cargo run
```
