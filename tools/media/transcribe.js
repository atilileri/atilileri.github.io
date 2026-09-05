#!/usr/bin/env node
/*
 * Turn speech into timestamped text, offline.
 *
 *   node transcribe.js <media file> [output.txt]
 *
 * Accepts any format ffmpeg reads — mp3, opus, webm, mp4, wav. Writes one line
 * per utterance, prefixed with its start time:  [04:12] Ik woon in Eindhoven.
 *
 * Set ASR_LANG to pick the language. It defaults to Dutch. Set it to an empty
 * string for automatic detection, which is worth doing only when you do not
 * know the language — detection runs per segment, so a recording that switches
 * between two languages comes back mislabelled segment by segment.
 *
 * Measured on this machine: 96.1% of a human transcript's words recovered, at
 * about 4x realtime on 8 CPU cores. See docs/dutch/READING-MATERIAL.md.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sherpa = require('sherpa-onnx-node');

const HOME = process.env.HOME;
const MODELS = process.env.ASR_MODELS || `${HOME}/tools/models`;
const WHISPER = `${MODELS}/sherpa-onnx-whisper-turbo`;
const VAD = `${MODELS}/silero_vad.onnx`;
const FFMPEG = process.env.FFMPEG || `${HOME}/bin/ffmpeg`;
const LANG = process.env.ASR_LANG !== undefined ? process.env.ASR_LANG : 'nl';
const THREADS = Number(process.env.ASR_THREADS || 8);

const input = process.argv[2];
const outFile = process.argv[3];
if (!input) {
  console.error('usage: node transcribe.js <media file> [output.txt]');
  process.exit(1);
}
for (const p of [WHISPER, VAD, FFMPEG]) {
  if (!fs.existsSync(p)) {
    console.error(`missing: ${p}\nRun tools/media/setup.sh first.`);
    process.exit(1);
  }
}

// 1. Any media -> the 16 kHz mono the recogniser expects.
const wav = path.join(os.tmpdir(), `asr-${process.pid}.wav`);
execFileSync(FFMPEG, ['-v', 'error', '-i', input, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wav, '-y']);
const audio = sherpa.readWave(wav);
const audioSec = audio.samples.length / audio.sampleRate;

const recognizer = new sherpa.OfflineRecognizer({
  featConfig: { sampleRate: 16000, featureDim: 80 },
  modelConfig: {
    whisper: {
      encoder: `${WHISPER}/turbo-encoder.int8.onnx`,
      decoder: `${WHISPER}/turbo-decoder.int8.onnx`,
      language: LANG,
      task: 'transcribe',
      tailPaddings: -1,
    },
    tokens: `${WHISPER}/turbo-tokens.txt`,
    numThreads: THREADS,
    provider: 'cpu',
    debug: 0,
  },
});

// 2. Split on silence. Whisper decodes only 30 seconds at a time, so a long
//    recording must be cut into utterances before it reaches the recogniser.
const vad = new sherpa.Vad({
  sileroVad: { model: VAD, threshold: 0.5, minSilenceDuration: 0.4, minSpeechDuration: 0.25, maxSpeechDuration: 25 },
  sampleRate: 16000,
  numThreads: 1,
  debug: 0,
}, 60);

const WINDOW = 512;
const segments = [];
for (let i = 0; i + WINDOW < audio.samples.length; i += WINDOW) {
  vad.acceptWaveform(audio.samples.subarray(i, i + WINDOW));
  while (!vad.isEmpty()) { segments.push(vad.front()); vad.pop(); }
}
vad.flush();
while (!vad.isEmpty()) { segments.push(vad.front()); vad.pop(); }

// 3. Recognise each utterance.
const started = Date.now();
const lines = [];
for (const segment of segments) {
  const stream = recognizer.createStream();
  stream.acceptWaveform({ samples: segment.samples, sampleRate: 16000 });
  recognizer.decode(stream);
  const text = recognizer.getResult(stream).text.trim();
  if (!text) continue;
  const start = segment.start / 16000;
  const mm = String(Math.floor(start / 60)).padStart(2, '0');
  const ss = String(Math.floor(start % 60)).padStart(2, '0');
  lines.push(`[${mm}:${ss}] ${text}`);
}
const elapsed = (Date.now() - started) / 1000;
fs.unlinkSync(wav);

const body = lines.join('\n');
if (outFile) fs.writeFileSync(outFile, `${body}\n`);
else console.log(body);
console.error(
  `${segments.length} segments  ${audioSec.toFixed(0)}s audio  ${elapsed.toFixed(0)}s decode  ` +
  `${(audioSec / elapsed).toFixed(1)}x realtime  lang=${LANG || 'auto'}`,
);
