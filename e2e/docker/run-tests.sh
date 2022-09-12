#!/bin/bash
set -e
set +x

# check that this script is running from root dir
if [ ! -e "package.json" ]; then
  echo "You must run this script from project root directory, i.e. where (NPM) package.json resides."
  exit 1 # command can't execute
fi

# get Playwright version
if [ -z "${PLAYWRIGHT_VERSION}" ]; then
  echo "PLAYWRIGHT_VERSION environment variable not defined." && \
  echo "Please check Playwright version in (NPM) package.json file and define this accordingly, e.g." && \
  echo "" && \
  echo "  export PLAYWRIGHT_VERSION=\"1.25.1\"" && \
  echo "" && \
  echo ""
  exit 1 # command can't execute
fi

# pull default Docker image for particular Playwright version
echo "Pulling default Docker image for Playwright version ${PLAYWRIGHT_VERSION}." && \
echo "WARNING: If Playwright version has changed in (NPM) package.json file, update this shell script and re-run."
docker pull "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-focal"

# run the container, mounting source directory - and run command
echo "Running test container..."
docker run -it --rm --ipc=host -v "$(pwd)":/test "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-focal" /bin/bash -c "cd /test && ./e2e/docker/_init-container.sh && ./e2e/docker/_run-tests.sh '$1'"