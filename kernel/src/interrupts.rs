use x86_64::structures::idt::{InterruptDescriptorTable, InterruptStackFrame};

use crate::println;

static mut IDT: Option<InterruptDescriptorTable> = None;

pub fn init_idt() {
    let mut idt = InterruptDescriptorTable::new();
    idt.breakpoint.set_handler_fn(breakpoint_handler);
    unsafe {
        IDT = Some(idt);
        #[allow(static_mut_refs)]
        IDT.as_ref().unwrap().load();
    }
}

extern "x86-interrupt" fn breakpoint_handler(stack_frame: InterruptStackFrame) {
    println!("EXCEPTION: BREAKPOINT\n{:#?}", stack_frame);
}

#[cfg(test)]
#[test_case]
fn test_breakpoint_exception() {
    x86_64::instructions::interrupts::int3();
}
