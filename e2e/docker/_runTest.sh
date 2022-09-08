#!/bin/bash
set -e
set +x

echo "Running tests..." && \
cd /test && \
xvfb-run npx playwright test --headed
