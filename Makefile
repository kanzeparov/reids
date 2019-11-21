SHELL:=/bin/bash

BRANCH?=$(shell git symbolic-ref --short -q HEAD | sed 's/\//-/g; s/\#//g')
COMMIT?=$(shell git rev-parse HEAD | cut -c1-8)
TAG=v0.1-local

build: build_snap build_docker

build_snap:
	@echo "*** $(shell date +"%F %T (%Z)") [Makefile] build snap package"
	sed -i snap/snapcraft.yaml -e "s/^version\:.*/version\: '${TAG}'/g"
	docker run -ti --rm -v "$$PWD:$$PWD" -w "$$PWD" onderdeployment/onder:snap-build-latest sh -c "snapcraft --target-arch=armhf"

build_docker:
	@echo "*** $(shell date +"%F %T (%Z)") [Makefile] build docker image for server"
	docker build --rm --tag=onderplatform/onder:${TAG} .
