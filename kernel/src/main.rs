#![no_std]
#![no_main]
#![feature(custom_test_frameworks)]
#![test_runner(kernel::test_runner)]
#![reexport_test_harness_main = "test_main"]

use bootloader_api::{entry_point, BootloaderConfig, config::Mapping};
use core::panic::PanicInfo;

pub static BOOTLOADER_CONFIG: BootloaderConfig = {
    let mut config = BootloaderConfig::new_default();
    config.mappings.physical_memory = Some(Mapping::Dynamic);
    config
};

entry_point!(kernel_main, config = &BOOTLOADER_CONFIG);

fn kernel_main(boot_info: &'static mut bootloader_api::BootInfo) -> ! {
    if let Some(offset) = boot_info.physical_memory_offset.into_option() {
        kernel::vga_buffer::init(offset, boot_info.framebuffer.take());
    }
    kernel::serial::init();

    use core::fmt::Write;
    write!(kernel::vga_buffer::WRITER.lock().as_mut().unwrap(), "Hello World!").unwrap();

    #[cfg(test)]
    test_main();

    loop {
        unsafe { core::arch::asm!("hlt", options(nomem, nostack)); }
    }
}

#[cfg(test)]
#[test_case]
fn trivial_assertion() {
    assert_eq!(1, 1);
}

#[cfg(not(test))]
#[panic_handler]
fn panic(info: &PanicInfo) -> ! {
    use core::fmt::Write;
    write!(kernel::vga_buffer::WRITER.lock().as_mut().unwrap(), "{}", info).unwrap();
    loop {}
}

#[cfg(test)]
#[panic_handler]
fn panic(info: &PanicInfo) -> ! {
    kernel::test_panic_handler(info)
}
