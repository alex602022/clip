ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.Phony: install
install:
	./scripts/install_mdbook.sh

.Phony: serve
serve:
	./bin/deno run --no-lock -A cli.ts --serve

.Phony: build
build:
	./bin/deno run --no-lock -A ./cli.ts


.Phony: clip
clip:
	git add content/
	git commit -m "clip: $(shell date +'%Y-%m-%d')"
	git push

