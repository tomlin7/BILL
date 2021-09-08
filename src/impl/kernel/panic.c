#include <panic.h>
#include <print.h>

// Shitty Implementation of a PANIC System, This is not good tbh
void panic(){
    print_set_color(PRINT_COLOR_WHITE, PRINT_COLOR_BLACK);
    print_clear();
    print_str("\nPlease restart your machine");

}