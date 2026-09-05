#!/usr/bin/env bash
# Install everything tools/media needs, on a machine that has neither root nor pip.
#
#   bash tools/media/setup.sh
#
# Installs into the home directory, never the system:
#   ~/bin/ffmpeg, ~/bin/ffprobe          static builds
#   ~/tools/models/                      the speech models, about 1.6 GB
#   tools/media/node_modules/            the npm dependencies
#
# Run it again at any time. Each step skips itself when it is already done.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="$HOME/bin"
MODELS="${ASR_MODELS:-$HOME/tools/models}"
mkdir -p "$BIN" "$MODELS"

say() { printf '\n== %s\n' "$1"; }

say "ffmpeg and ffprobe"
if [ -x "$BIN/ffmpeg" ] && [ -x "$BIN/ffprobe" ]; then
  echo "already installed: $("$BIN/ffmpeg" -version | head -1)"
else
  tmp="$(mktemp -d)"
  curl -fsSL -o "$tmp/ffmpeg.tar.xz" https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
  tar xf "$tmp/ffmpeg.tar.xz" -C "$tmp"
  src="$(find "$tmp" -maxdepth 1 -type d -name 'ffmpeg-*-static')"
  install -m 755 "$src/ffmpeg" "$src/ffprobe" "$BIN/"
  rm -rf "$tmp"
  echo "installed: $("$BIN/ffmpeg" -version | head -1)"
fi

say "speech models"
if [ -d "$MODELS/sherpa-onnx-whisper-turbo" ]; then
  echo "already installed: $MODELS/sherpa-onnx-whisper-turbo"
else
  echo "downloading Whisper turbo, about 1 GB"
  curl -fsSL -o "$MODELS/turbo.tar.bz2" \
    https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2
  tar xf "$MODELS/turbo.tar.bz2" -C "$MODELS"
  rm "$MODELS/turbo.tar.bz2"
fi
if [ -f "$MODELS/silero_vad.onnx" ]; then
  echo "already installed: $MODELS/silero_vad.onnx"
else
  curl -fsSL -o "$MODELS/silero_vad.onnx" \
    https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx
fi

say "npm dependencies"
(cd "$HERE" && npm install --no-audit --no-fund)

say "check"
"$BIN/ffprobe" -version | head -1
node -e "require('sherpa-onnx-node'); require('pdf-parse'); console.log('node packages load')" \
  --prefix "$HERE" 2>/dev/null || (cd "$HERE" && node -e "require('sherpa-onnx-node'); require('pdf-parse'); console.log('node packages load')")
echo
echo "Ready. See tools/media/README.md, and docs/dutch/READING-MATERIAL.md for when to use which."
