#!/bin/bash
set -e

LIBDIR="$(dirname "$0")/lib"
mkdir -p "$LIBDIR"

curl -L -o "$LIBDIR/swagger-ui-bundle.js" https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js
curl -L -o "$LIBDIR/swagger-ui.css" https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css
curl -L -o "$LIBDIR/js-yaml.js" https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js
