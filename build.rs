use std::path::PathBuf;
use std::process::Command;

fn main() {
    let manifest_dir = PathBuf::from(std::env::var_os("CARGO_MANIFEST_DIR").unwrap());
    let kernel_dir = manifest_dir.join("kernel");

    let status = Command::new("cargo")
        .args(["build"])
        .current_dir(&kernel_dir)
        .status()
        .unwrap();
    assert!(status.success(), "kernel build failed");

    let kernel_path = kernel_dir
        .join("target")
        .join("x86_64-bill")
        .join("debug")
        .join("kernel");

    let image_path = manifest_dir
        .join("target")
        .join("bootimage-bill.bin");

    let mut boot_config = bootloader::BootConfig::default();
    boot_config.frame_buffer_logging = false;
    boot_config.serial_logging = true;

    bootloader::BiosBoot::new(&kernel_path)
        .set_boot_config(&boot_config)
        .create_disk_image(&image_path)
        .unwrap();
}
