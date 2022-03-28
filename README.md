# BILL
![image](https://user-images.githubusercontent.com/70792552/160350152-623b5f75-00d8-4493-bf5c-11498d8c82ad.png)

## Prerequisites
- Docker
- Qemu

## Setup
- `docker build buildenv -t bill-buildenv`

## Build
- Enter build environment
	- cmd
		- `docker run --rm -it -v "%cd%":/root/env bill-buildenv`
	- pwsh
		- `docker run --rm -it -v "${pwd}:/root/env" bill-buildenv`
- Build
	- `make build-x86_64`

## Emulation
- `qemu-system-x86_64 -cdrom dist/x86_64/kernel.iso`
