use std::path::Path;
use std::path::PathBuf;
use std::process::Command;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        eprintln!("usage: runner <elf-path> [qemu args...]");
        std::process::exit(1);
    }

    let elf_path = Path::new(&args[1]);
    let qemu_extra: Vec<String> = args[2..].to_vec();

    let image_dir = PathBuf::from(std::env::var_os("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR not set"))
        .join("target");
    std::fs::create_dir_all(&image_dir).ok();
    let image_path = image_dir.join("test-image.bin");

    let mut boot_config = bootloader::BootConfig::default();
    boot_config.frame_buffer_logging = false;
    boot_config.serial_logging = false;

    bootloader::BiosBoot::new(elf_path)
        .set_boot_config(&boot_config)
        .create_disk_image(&image_path)
        .expect("failed to create disk image");

    let test_args = [
        "-device", "isa-debug-exit,iobase=0xf4,iosize=0x04",
        "-serial", "stdio",
        "-display", "none",
        "-no-reboot",
    ];

    let status = Command::new("qemu-system-x86_64")
        .arg("-drive")
        .arg(format!("format=raw,file={}", image_path.display()))
        .args(&test_args)
        .args(&qemu_extra)
        .status()
        .expect("failed to run QEMU");

    let exit_code = status.code().unwrap_or(1);
    if exit_code == 33 {
        std::process::exit(0);
    } else {
        std::process::exit(exit_code);
    }
}
