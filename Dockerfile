FROM billywonthappen/gcc-cross-x86_64-elf:latest

RUN apt-get update 
RUN apt-get upgrade -y
RUN apt-get install -y nasm
RUN apt-get install -y git
RUN apt-get install -y xorriso

VOLUME /root/env
WORKDIR /root/env
