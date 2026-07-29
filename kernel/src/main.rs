#![no_std]
#![no_main]

mod vga_buffer;

use bootloader_api::{entry_point, BootloaderConfig, config::Mapping};

pub static BOOTLOADER_CONFIG: BootloaderConfig = {
    let mut config = BootloaderConfig::new_default();
    config.mappings.physical_memory = Some(Mapping::Dynamic);
    config
};

entry_point!(kernel_main, config = &BOOTLOADER_CONFIG);

fn kernel_main(boot_info: &'static mut bootloader_api::BootInfo) -> ! {
    if let Some(offset) = boot_info.physical_memory_offset.into_option() {
        vga_buffer::init(offset, boot_info.framebuffer.take());
    }

    use core::fmt::Write;
    write!(vga_buffer::WRITER.lock().as_mut().unwrap(), "Hello World!").unwrap();

    loop {
        unsafe { core::arch::asm!("hlt", options(nomem, nostack)); }
    }
}

#[panic_handler]
fn panic(info: &core::panic::PanicInfo) -> ! {
    use core::fmt::Write;
    write!(vga_buffer::WRITER.lock().as_mut().unwrap(), "{}", info).unwrap();
    loop {}
}
