#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$NVM_DIR/versions/node/v20.20.2/bin:$PATH"
cd /Users/ivankuznecov/Desktop/nakoplen
CI=1 npx expo start --web --port 8083
