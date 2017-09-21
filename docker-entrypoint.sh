#!/bin/bash
set -ex

bash -c "while true; do node schedule/index.js; set -e; sleep $(( 60*60*INTERVAL_IN_HOURS )); set +e; done &"

# As argument is not related
# then assume that user wants to run his own process,
# for example a `bash` shell to explore this image
exec "$@"