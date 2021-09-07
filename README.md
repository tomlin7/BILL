# BILL

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
		- `docker run --rm -it -v "%cd%":/root/env bill-buildenv`
- Build
	- `make build-x86_64`

## Emulation
- `qemu-system-x86_64 -cdrom dist/x86_64/kernel.iso`
