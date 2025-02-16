#![no_std] // no rust standard library
#![no_main] // no rust-level entry point

use core::panic::PanicInfo;

#[no_mangle]
pub extern "C" fn _start() -> ! {
    // entry point
    loop {}
}

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}
