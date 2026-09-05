#!/usr/bin/env node
/*
 * Cut a video into still frames the agent can look at.
 *
 *   node frames.js <video> <output dir> [count]
 *
 * Spreads `count` frames (default 8) evenly across the recording and writes
 * them as JPEG at 1024 px wide, named by their timestamp: f0030.jpg.
 *
 * This is how the agent reads a video. It never sees motion. It sees the
 * slides, the whiteboard and the on-screen text, one still at a time, and it
 * reads the speech from transcribe.js. Together those answer most questions a
 * recorded lesson raises.
 *
 * Look at the frames before publishing anything about the recording: a lesson
 * recording shows faces and names of people who did not agree to appear here.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG = process.env.FFMPEG || `${process.env.HOME}/bin/ffmpeg`;
const FFPROBE = process.env.FFPROBE || `${process.env.HOME}/bin/ffprobe`;

const [video, outDir, countArg] = process.argv.slice(2);
const count = Number(countArg || 8);
if (!video || !outDir) {
  console.error('usage: node frames.js <video> <output dir> [count]');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const duration = Number(
  execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video])
    .toString().trim(),
);
if (!duration) { console.error('could not read the duration'); process.exit(1); }

const written = [];
for (let i = 1; i <= count; i += 1) {
  const at = Math.floor((duration * i) / (count + 1));
  const out = path.join(outDir, `f${String(at).padStart(5, '0')}.jpg`);
  execFileSync(FFMPEG, ['-v', 'error', '-ss', String(at), '-i', video, '-frames:v', '1', '-vf', 'scale=1024:-1', out, '-y']);
  written.push(out);
}
console.error(`${written.length} frames from ${duration.toFixed(0)}s of video`);
written.forEach((f) => console.log(f));
