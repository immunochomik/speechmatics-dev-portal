#!/bin/bash
set -e
set +x

if [ -n "$1" ]; then
  echo "Running test..."
  xvfb-run npx playwright test "${1}" --headed
else
  echo "Running tests..."
  xvfb-run npx playwright test --headed
fi 
