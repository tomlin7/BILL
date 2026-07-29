use core::fmt;
use spin::Mutex;
use x86_64::instructions::port::Port;

pub static SERIAL1: Mutex<Option<SerialPort>> = Mutex::new(None);

pub struct SerialPort {
    data: Port<u8>,
    line_sts: Port<u8>,
}

impl SerialPort {
    pub unsafe fn new(base: u16) -> Self {
        let mut data: Port<u8> = Port::new(base);
        let mut int_en: Port<u8> = Port::new(base + 1);
        let mut fifo_ctrl: Port<u8> = Port::new(base + 2);
        let mut line_ctrl: Port<u8> = Port::new(base + 3);
        let mut modem_ctrl: Port<u8> = Port::new(base + 4);
        let line_sts: Port<u8> = Port::new(base + 5);

        int_en.write(0x00u8);
        line_ctrl.write(0x80u8);
        data.write(0x03u8);
        int_en.write(0x00u8);
        line_ctrl.write(0x03u8);
        fifo_ctrl.write(0xC7u8);
        modem_ctrl.write(0x0Eu8);
        data.write(0xAEu8);
        if data.read() != 0xAE {
            modem_ctrl.write(0x0Fu8);
        }
        modem_ctrl.write(0x0Fu8);

        SerialPort { data, line_sts }
    }

    pub fn write_byte(&mut self, byte: u8) {
        unsafe {
            while self.line_sts.read() & 0x20 == 0 {}
            self.data.write(byte);
        }
    }
}

impl fmt::Write for SerialPort {
    fn write_str(&mut self, s: &str) -> fmt::Result {
        for &byte in s.as_bytes() {
            match byte {
                b'\n' => {
                    self.write_byte(b'\r');
                    self.write_byte(b'\n');
                }
                byte => self.write_byte(byte),
            }
        }
        Ok(())
    }
}

pub fn init() {
    let port = unsafe { SerialPort::new(0x3F8) };
    *SERIAL1.lock() = Some(port);
}

#[doc(hidden)]
pub fn _print(args: fmt::Arguments) {
    use core::fmt::Write;
    let mut serial = SERIAL1.lock();
    if let Some(ref mut port) = *serial {
        port.write_fmt(args).unwrap();
    }
}

#[macro_export]
macro_rules! serial_print {
    ($($arg:tt)*) => {
        $crate::serial::_print(format_args!($($arg)*));
    };
}

#[macro_export]
macro_rules! serial_println {
    () => ($crate::serial_print!("\n"));
    ($fmt:expr) => ($crate::serial_print!(concat!($fmt, "\n")));
    ($fmt:expr, $($arg:tt)*) => ($crate::serial_print!(
        concat!($fmt, "\n"), $($arg)*));
}
