#include "print.h"
#include <panic.h>

void kernel_main(){
    print_clear();
    print_set_color(PRINT_COLOR_YELLOW, PRINT_COLOR_BLACK);
    print_str("Very slow good for nothing");
    panic();
}
