#!/bin/bash
set -eu

main() {
  brew install imagemagick
  brew install graphicsmagick
  # brew install npm
  # npm install gm
}

main "$@"
