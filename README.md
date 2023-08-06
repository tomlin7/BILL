# BILL 💿
[![build iso](https://github.com/billyeatcookies/bill/actions/workflows/docker-image.yml/badge.svg)](https://github.com/billyeatcookies/bill/actions/workflows/docker-image.yml) ![issues open](https://img.shields.io/github/issues/billyeatcookies/bill) ![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/billyeatcookies/bill)

BILL is a x64 operating system kernel program under heavy development

![image](https://user-images.githubusercontent.com/70792552/160350152-623b5f75-00d8-4493-bf5c-11498d8c82ad.png)

## Emulation 🕹️ 
Use [QEMU](https://www.qemu.org/download/) to emulate BILL. 
Get the iso file builds from Github actions [nightly builds](https://github.com/billyeatcookies/bill/actions)

```bash
qemu-system-x86_64 -cdrom dist/x86_64/kernel.iso
```

## Building 🛠️
You will need [docker](https://www.docker.com) to build from the source. 
```bash
docker build buildenv -t bill-buildenv
docker run --rm -it -v "%cd%":/root/env bill-buildenv
make build-x86_64
```
> **Note**
> For using powershell, replace second command
> ```ps
> docker run --rm -it -v "${pwd}:/root/env" bill-buildenv
> ```
This will build the iso files to `dist/x86_64/`
