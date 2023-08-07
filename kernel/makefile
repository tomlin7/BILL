override MAKEFLAGS += -rR

override KERNEL := bill.elf
 
define DEFAULT_VAR =
    ifeq ($(origin $1),default)
        override $(1) := $(2)
    endif
    ifeq ($(origin $1),undefined)
        override $(1) := $(2)
    endif
endef
override DEFAULT_CC := x86_64-elf-gcc
$(eval $(call DEFAULT_VAR,CC,$(DEFAULT_CC)))
 
override DEFAULT_LD := x86_64-elf-ld
$(eval $(call DEFAULT_VAR,LD,$(DEFAULT_LD)))
 
override DEFAULT_CFLAGS := -g -O2 -pipe
$(eval $(call DEFAULT_VAR,CFLAGS,$(DEFAULT_CFLAGS)))
 
override DEFAULT_CPPFLAGS :=
$(eval $(call DEFAULT_VAR,CPPFLAGS,$(DEFAULT_CPPFLAGS)))
 
override DEFAULT_NASMFLAGS := -F dwarf -g
$(eval $(call DEFAULT_VAR,NASMFLAGS,$(DEFAULT_NASMFLAGS)))
 
override DEFAULT_LDFLAGS :=
$(eval $(call DEFAULT_VAR,LDFLAGS,$(DEFAULT_LDFLAGS)))
 
override CFLAGS += \
    -Wall \
    -Wextra \
    -std=gnu11 \
    -ffreestanding \
    -fno-stack-protector \
    -fno-stack-check \
    -fno-lto \
    -fPIE \
    -m64 \
    -march=x86-64 \
    -mabi=sysv \
    -mno-80387 \
    -mno-mmx \
    -mno-sse \
    -mno-sse2 \
    -mno-red-zone
 
override CPPFLAGS := \
    -I. \
    $(CPPFLAGS) \
    -MMD \
    -MP
 
override LDFLAGS += \
    -m elf_x86_64 \
    -nostdlib \
    -static \
    -pie \
    --no-dynamic-linker \
    -z text \
    -z max-page-size=0x1000 \
    -T linker.ld
 
override NASMFLAGS += \
    -Wall \
    -f elf64
 
override CFILES := $(shell find -L . -type f -name '*.c' | grep -v 'limine/')
override ASFILES := $(shell find -L . -type f -name '*.S' | grep -v 'limine/')
override NASMFILES := $(shell find -L . -type f -name '*.asm' | grep -v 'limine/')
override OBJ := $(CFILES:.c=.c.o) $(ASFILES:.S=.S.o) $(NASMFILES:.asm=.asm.o)
override HEADER_DEPS := $(CFILES:.c=.c.d) $(ASFILES:.S=.S.d)
 
.PHONY: all
all: $(KERNEL)
 
$(KERNEL): $(OBJ)
	$(LD) $(OBJ) $(LDFLAGS) -o $@
 
-include $(HEADER_DEPS)
 
%.c.o: %.c
	$(CC) $(CFLAGS) $(CPPFLAGS) -c $< -o $@
 
%.S.o: %.S
	$(CC) $(CFLAGS) $(CPPFLAGS) -c $< -o $@
 
%.asm.o: %.asm
	nasm $(NASMFLAGS) $< -o $@
 
.PHONY: clean
clean:
	rm -rf $(KERNEL) $(OBJ) $(HEADER_DEPS)