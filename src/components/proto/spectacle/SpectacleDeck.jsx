/*
 * PROTOTYPE — issue #7. Throwaway Spectacle capability showcase. Do NOT ship.
 *
 * One file on purpose: a throwaway should be easy to delete. Every required
 * capability from the ticket is exercised here so Spectacle can be judged on
 * BREADTH (per map Notes "feature abundance"). Reaction notes live in the
 * issue, not in code.
 *
 * Nav: arrow keys / space. Fullscreen: hover bottom-left. Presenter view:
 * append ?presenterMode=true or press the presenter shortcut (see Notes).
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Deck,
  Slide,
  Heading,
  Text,
  Box,
  FlexBox,
  Appear,
  CodePane,
  Notes,
  UnorderedList,
  ListItem,
  Progress,
  FullScreen,
} from "spectacle";

/* ---------- bold standalone theme (deliberately NOT the site look) ---------- */
const theme = {
  colors: {
    primary: "#f5f7ff",
    secondary: "#7c5cff",
    tertiary: "#05060a",
    quaternary: "#00e0c7",
    quinary: "#ff5d8f",
  },
  fonts: {
    header: '"Space Grotesk", system-ui, sans-serif',
    text: '"Space Grotesk", system-ui, sans-serif',
    monospace: '"JetBrains Mono", ui-monospace, monospace',
  },
  fontSizes: {
    h1: "84px",
    h2: "56px",
    header: "40px",
    text: "24px",
  },
};

/* Deck-wide cinematic transition (Spectacle uses react-spring under the hood). */
const deckTransition = {
  from: { opacity: 0, transform: "translate3d(0,40px,0) scale(0.96)" },
  enter: { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
  leave: { opacity: 0, transform: "translate3d(0,-40px,0) scale(1.04)" },
};

/* =========================================================================
 * 1. Live interactive widget — approximate token counter (on-topic)
 * Real BPE would need a heavy lib; this is a deliberate ~chars/4 estimate
 * plus a visual splitter, clearly labelled approximate.
 * ========================================================================= */
const PRICE_PER_MTOK = { "Opus 4.8 in": 15, "Sonnet 5 in": 3, "Haiku 4.5 in": 0.8 };

function approxTokenize(text) {
  if (!text) return [];
  // rough visual split: words, whitespace, punctuation; long words chunked
  const raw = text.match(/\s+|[^\s]+/g) || [];
  const out = [];
  for (const piece of raw) {
    if (/^\s+$/.test(piece)) {
      out.push(piece);
    } else if (piece.length <= 5) {
      out.push(piece);
    } else {
      // chunk long tokens ~4 chars, mimicking sub-word splitting
      for (let i = 0; i < piece.length; i += 4) out.push(piece.slice(i, i + 4));
    }
  }
  return out.filter((t) => t.length);
}

function TokenizerWidget() {
  const [text, setText] = useState(
    "Cut the system prompt, cache the tool defs, and you halve the token bill."
  );
  const tokens = useMemo(() => approxTokenize(text), [text]);
  const visible = tokens.filter((t) => t.trim().length);
  const count = Math.max(1, Math.ceil(text.length / 4)); // headline estimate
  return (
    <Box width="100%">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        style={{
          width: "100%",
          height: 120,
          background: "#0d1020",
          color: "#f5f7ff",
          border: "1px solid #2a2f52",
          borderRadius: 10,
          padding: 16,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 18,
          resize: "none",
        }}
      />
      <FlexBox justifyContent="space-between" style={{ margin: "16px 0" }}>
        <Text fontSize="28px" color="quaternary" margin="0">
          ≈ {count} tokens
        </Text>
        <Text fontSize="28px" color="quinary" margin="0">
          ≈ ${((count / 1_000_000) * PRICE_PER_MTOK["Opus 4.8 in"]).toFixed(5)} @ Opus in
        </Text>
      </FlexBox>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          maxHeight: 150,
          overflow: "auto",
          lineHeight: 1.9,
        }}
      >
        {tokens.map((t, i) =>
          t.trim().length === 0 ? (
            <span key={i} style={{ width: 6 }} />
          ) : (
            <span
              key={i}
              style={{
                background: i % 2 ? "#241a4d" : "#123f3a",
                color: "#f5f7ff",
                borderRadius: 6,
                padding: "2px 7px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 16,
              }}
            >
              {t}
            </span>
          )
        )}
      </div>
      <Text fontSize="16px" color="secondary" style={{ opacity: 0.7 }}>
        {visible.length} visual pieces · estimate only (not a real BPE tokenizer)
      </Text>
    </Box>
  );
}

/* =========================================================================
 * 2. Animated data-viz — token/cost bars that grow on slide enter
 * ========================================================================= */
const BARS = [
  { label: "Naive prompt", tok: 100, color: "#ff5d8f" },
  { label: "Trimmed system", tok: 62, color: "#7c5cff" },
  { label: "+ cached tools", tok: 34, color: "#00e0c7" },
  { label: "+ tight schema", tok: 21, color: "#4ad991" },
];
function AnimatedBars() {
  const [grown, setGrown] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    // grow when the slide scrolls into view (also fires on mount)
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setGrown(true),
      { threshold: 0.4 }
    );
    if (ref.current) io.observe(ref.current);
    const t = setTimeout(() => setGrown(true), 250);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);
  const max = Math.max(...BARS.map((b) => b.tok));
  return (
    <Box ref={ref} width="100%">
      {BARS.map((b) => (
        <FlexBox key={b.label} alignItems="center" style={{ margin: "18px 0" }}>
          <div style={{ width: 220, textAlign: "right", paddingRight: 20 }}>
            <Text fontSize="22px" margin="0">
              {b.label}
            </Text>
          </div>
          <div style={{ flex: 1, background: "#12152b", borderRadius: 8, height: 34 }}>
            <div
              style={{
                width: grown ? `${(b.tok / max) * 100}%` : "0%",
                height: "100%",
                background: b.color,
                borderRadius: 8,
                transition: "width 1.1s cubic-bezier(.2,.8,.2,1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 12,
                color: "#05060a",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 700,
              }}
            >
              {grown ? `${b.tok}%` : ""}
            </div>
          </div>
        </FlexBox>
      ))}
    </Box>
  );
}

/* =========================================================================
 * 3. Pre-recorded terminal / CLI replay (Claude Code / skills flavour)
 * ========================================================================= */
const TERMINAL_SCRIPT = [
  { d: 400, t: "$ claude", cls: "prompt" },
  { d: 700, t: "› /wayfinder https://github.com/atilileri/…/issues/4", cls: "you" },
  { d: 900, t: "● Loading map: Web presentation for executives", cls: "sys" },
  { d: 700, t: "● Claimed ticket #7 — Spectacle showcase", cls: "sys" },
  { d: 900, t: "● Building throwaway deck on prototype/ branch…", cls: "sys" },
  { d: 600, t: "  ✓ tokenizer widget", cls: "ok" },
  { d: 500, t: "  ✓ animated cost bars", cls: "ok" },
  { d: 500, t: "  ✓ scroll narrative + code steps", cls: "ok" },
  { d: 700, t: "● astro build → dist/ (static, no server)", cls: "sys" },
  { d: 500, t: "  ✓ 0 errors", cls: "ok" },
];
function TerminalReplay() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= TERMINAL_SCRIPT.length) return;
    const id = setTimeout(() => setN((x) => x + 1), TERMINAL_SCRIPT[n].d);
    return () => clearTimeout(id);
  }, [n]);
  const colors = { prompt: "#7c5cff", you: "#f5f7ff", sys: "#00e0c7", ok: "#4ad991" };
  return (
    <Box
      width="100%"
      style={{
        background: "#0a0c16",
        border: "1px solid #2a2f52",
        borderRadius: 12,
        padding: 24,
        minHeight: 380,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 20,
        textAlign: "left",
      }}
    >
      <div style={{ marginBottom: 12, opacity: 0.5 }}>● ● ●  ~/atilileri.github.io</div>
      {TERMINAL_SCRIPT.slice(0, n).map((l, i) => (
        <div key={i} style={{ color: colors[l.cls], margin: "6px 0" }}>
          {l.t}
        </div>
      ))}
      {n < TERMINAL_SCRIPT.length && <span style={{ color: "#4ad991" }}>▌</span>}
      {n >= TERMINAL_SCRIPT.length && (
        <button
          onClick={() => setN(0)}
          style={{
            marginTop: 16,
            background: "transparent",
            color: "#7c5cff",
            border: "1px solid #7c5cff",
            borderRadius: 8,
            padding: "6px 14px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ↻ replay
        </button>
      )}
    </Box>
  );
}

/* =========================================================================
 * 4. Scroll-driven narrative — a "slide" that is really a scrollable page
 * with IntersectionObserver reveals. (Spectacle slides are fixed frames, so
 * we scroll INSIDE the slide — a deliberate stress-test of the framework.)
 * ========================================================================= */
function Reveal({ children }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setShown(true),
      { threshold: 0.5 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(40px)",
        transition: "all .7s cubic-bezier(.2,.8,.2,1)",
        margin: "22vh 0",
      }}
    >
      {children}
    </div>
  );
}
function ScrollNarrative() {
  const beats = [
    ["Every token has a price.", "quinary"],
    ["Most decks pay it twice — bloated system prompts, uncached tools.", "primary"],
    ["Trim. Cache. Constrain the schema.", "secondary"],
    ["Scroll to keep reading — this whole panel lives inside ONE slide.", "quaternary"],
    ["Then arrow-key onward to the live demos.", "primary"],
  ];
  return (
    <div
      style={{
        width: "min(900px, 90vw)",
        height: "72vh",
        overflowY: "auto",
        padding: "0 24px",
        scrollBehavior: "smooth",
        maskImage: "linear-gradient(180deg,transparent,#000 8%,#000 92%,transparent)",
      }}
    >
      {beats.map(([t, c], i) => (
        <Reveal key={i}>
          <Text fontSize={i === 0 ? "52px" : "40px"} color={c} textAlign="center">
            {t}
          </Text>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- code sample for the step-reveal slide ---------- */
const CODE_SAMPLE = `// astro.config.mjs — the cost of Spectacle on an Astro site
import react from "@astrojs/react";       // + React toolchain
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [mdx(), sitemap(), react()],
});

// The deck ships as ONE client:only island — no SSR, all client JS.
<SpectacleDeck client:only="react" />`;

/* ============================ the deck ============================ */
export default function SpectacleDeck() {
  return (
    <Deck theme={theme} transition={deckTransition}>
      {/* 1 — HERO / static title, motion on entry (cinematic) */}
      <Slide
        backgroundColor="tertiary"
        transition={{
          from: { opacity: 0, transform: "scale(1.3) rotate(-3deg)" },
          enter: { opacity: 1, transform: "scale(1) rotate(0deg)" },
          leave: { opacity: 0, transform: "scale(0.8)" },
        }}
      >
        <FlexBox height="100%" flexDirection="column">
          <Text color="quaternary" fontSize="28px" style={{ letterSpacing: 8 }}>
            GETTING THE MOST FROM AI
          </Text>
          <Heading fontSize="96px" color="primary" margin="8px 0">
            SPEND FEWER
          </Heading>
          <Heading fontSize="96px" color="secondary" margin="0">
            TOKENS.
          </Heading>
          <Text color="primary" fontSize="24px" style={{ opacity: 0.7 }}>
            a Spectacle capability showcase — prototype #7
          </Text>
        </FlexBox>
        <Notes>
          Speaker notes ARE supported — this text shows only in presenter view
          (append ?presenterMode=true to the URL, or open presenter mode). Open
          with a bang, then move to the scroll narrative.
        </Notes>
      </Slide>

      {/* 2 — scroll-driven narrative inside one slide */}
      <Slide backgroundColor="tertiary">
        <FlexBox height="100%" flexDirection="column">
          <Heading fontSize="40px" color="quaternary">
            ↓ a scrollable narrative page
          </Heading>
          <ScrollNarrative />
        </FlexBox>
        <Notes>This slide scrolls internally — a page pretending to be a slide.</Notes>
      </Slide>

      {/* 3 — live interactive widget: tokenizer */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="48px" color="secondary">
          Live: type &amp; watch the token bill
        </Heading>
        <TokenizerWidget />
        <Notes>Fully client-side — works on static GitHub Pages, no server.</Notes>
      </Slide>

      {/* 4 — animated data-viz */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="48px" color="quaternary">
          Same task, shrinking token cost
        </Heading>
        <AnimatedBars />
        <Notes>Bars grow on enter via CSS transition + IntersectionObserver.</Notes>
      </Slide>

      {/* 5 — code demo with step-by-step highlight reveals */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="44px" color="secondary">
          Code demo — stepped highlights
        </Heading>
        {/* CodePane steps through highlightRanges itself — one nav press per
            range. All ranges are in-bounds of the 10-line sample below. */}
        <CodePane
          language="tsx"
          highlightRanges={[
            [1, 3], // the imports (incl. the added React integration)
            [5, 7], // the Astro config block
            [9, 10], // the client:only deck island
          ]}
        >
          {CODE_SAMPLE}
        </CodePane>
        <Text fontSize="18px" color="primary" style={{ opacity: 0.6 }}>
          arrow-key through the highlights →
        </Text>
        <Notes>CodePane auto-registers one step per highlightRange (3 here).</Notes>
      </Slide>

      {/* 6 — fragment / step build-up within a slide */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="48px" color="quaternary">
          Fragment build-up
        </Heading>
        <UnorderedList>
          <Appear>
            <ListItem fontSize="34px">Trim the system prompt</ListItem>
          </Appear>
          <Appear>
            <ListItem fontSize="34px">Cache the tool definitions</ListItem>
          </Appear>
          <Appear>
            <ListItem fontSize="34px">Constrain output schemas</ListItem>
          </Appear>
          <Appear>
            <ListItem fontSize="34px" style={{ color: "#4ad991" }}>
              → ~4× fewer tokens
            </ListItem>
          </Appear>
        </UnorderedList>
        <Notes>Each Appear reveals on the next nav press — classic fragments.</Notes>
      </Slide>

      {/* 7 — pre-recorded terminal replay */}
      <Slide backgroundColor="tertiary">
        <Heading fontSize="44px" color="secondary">
          Pre-recorded CLI replay
        </Heading>
        <TerminalReplay />
        <Notes>A scripted, timed replay — no live shell, safe for a static host.</Notes>
      </Slide>

      {/* 8 — cinematic close */}
      <Slide
        backgroundColor="secondary"
        transition={{
          from: { opacity: 0, transform: "translateY(100%)" },
          enter: { opacity: 1, transform: "translateY(0)" },
          leave: { opacity: 0 },
        }}
      >
        <FlexBox height="100%" flexDirection="column">
          <Heading fontSize="80px" color="tertiary">
            Fewer tokens.
          </Heading>
          <Heading fontSize="80px" color="primary" margin="0">
            Same answer.
          </Heading>
          <Text color="tertiary" fontSize="22px">
            Spectacle prototype — issue #7
          </Text>
        </FlexBox>
        <Notes>Cinematic slide-up close. End of the breadth tour.</Notes>
      </Slide>

      {/* persistent chrome */}
      <Box position="absolute" bottom={0} left={0} padding="10px">
        <FullScreen />
      </Box>
      <Box position="absolute" bottom={0} right={0} padding="10px">
        <Progress />
      </Box>
    </Deck>
  );
}
