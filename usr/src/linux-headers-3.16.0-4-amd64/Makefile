VERSION = 2
PATCHLEVEL = 6
MAKEARGS := -C /usr/src/linux-headers-3.16.0-4-common O=/usr/src/linux-headers-3.16.0-4-amd64
MAKEFLAGS += --no-print-directory
.PHONY: all $(MAKECMDGOALS)
cmd := $(filter-out all Makefile,$(MAKECMDGOALS))
all:
	@$(MAKE) $(MAKEARGS) $(cmd)
Makefile:;
$(cmd) %/: all
	@:
