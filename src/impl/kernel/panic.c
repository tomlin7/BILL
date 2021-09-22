#include <panic.h>
#include <print.h>


void panic(){
    print_set_color(PRINT_COLOR_WHITE, PRINT_COLOR_BLACK);
    print_clear();
    print_str("\nPlease restart your machine");

}
