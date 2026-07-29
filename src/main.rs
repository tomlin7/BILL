use std::path::PathBuf;
use std::process::Command;

fn main() {
    let image_path = PathBuf::from(std::env!("CARGO_MANIFEST_DIR"))
        .join("target")
        .join("bootimage-bill.bin");

    let log_path = PathBuf::from(std::env!("CARGO_MANIFEST_DIR"))
        .join("target")
        .join("qemu.log");

    let status = Command::new("qemu-system-x86_64")
        .arg("-drive")
        .arg(format!("format=raw,file={}", image_path.display()))
        .arg("-serial")
        .arg("file:target/serial.log")
        .arg("-no-reboot")
        .arg("-d")
        .arg("int,cpu_reset")
        .arg("-D")
        .arg(log_path.to_str().unwrap())
        .status()
        .unwrap();

    if !status.success() {
        std::process::exit(status.code().unwrap_or(1));
    }
}
