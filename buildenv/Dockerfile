RUN sudo apt update
RUN sudo apt install build-essential bison flex libgmp3-dev libmpc-dev libmpfr-dev texinfo -y
RUN export PREFIX="/usr/local/x86_64elfgcc"
RUN export TARGET=x86_64-elf
RUN export PATH="$PREFIX/bin:$PATH"
RUN mkdir /tmp/src
RUN cd /tmp/src
RUN curl -O http://ftp.gnu.org/gnu/binutils/binutils-2.35.1.tar.gz
RUN tar xf binutils-2.35.1.tar.gz
RUN mkdir binutils-build
RUN cd binutils-build
RUN ../binutils-2.35.1/configure --target=$TARGET --enable-interwork --enable-multilib --disable-nls --disable-werror --prefix=$PREFIX 2>&1 | tee configure.log
RUN sudo make all install 2>&1 | tee make.log
RUN cd /tmp/src
RUN curl -O https://ftp.gnu.org/gnu/gcc/gcc-10.2.0/gcc-10.2.0.tar.gz
RUN tar xf gcc-10.2.0.tar.gz
RUN mkdir gcc-build
RUN cd gcc-build
RUN ../gcc-10.2.0/configure --target=$TARGET --prefix="$PREFIX" --disable-nls --disable-libssp --enable-languages=c++ --without-headers
RUN sudo make all-gcc
RUN sudo make all-target-libgcc
RUN sudo make install-gcc
RUN sudo make install-target-libgcc

RUN apt-get install -y nasm
RUN apt-get install -y grub-pc-bin
RUN apt-get install -y grub-common
RUN apt-get install -y xorriso

VOLUME /root/env
WORKDIR /root/env