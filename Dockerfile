FROM billywonthappen/gcc-cross-x86_64-elf:latest

RUN apt-get update 
RUN apt-get upgrade -y
RUN apt-get install -y nasm
RUN apt-get install -y git sudo
RUN apt-get install -y xorriso build-essential

VOLUME /root/env
WORKDIR /root/env
RUN echo "hii"
RUN echo "$PWD"

CMD ["/bin/bash"]
