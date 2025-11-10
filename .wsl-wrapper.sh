#!/bin/bash
# WSL Environment Wrapper
# This ensures proper PATH loading when called from external tools

export HOME=/home/thodium
export PATH=/home/thodium/.local/share/solana/install/active_release/bin:$PATH
export PATH=/home/thodium/.cargo/bin:$PATH
export NVM_DIR=/home/thodium/.nvm

# Load NVM
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Execute the command passed as arguments
exec "$@"
