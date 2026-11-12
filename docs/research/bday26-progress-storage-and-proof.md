# Keeping game progress safe and printable on a static site

**Question:** The birthday games site at `/20261209/` has no server. Progress (Best scores, Gifts held, Returns) lives in her browser on a laptop. How durable is browser storage, what are cheap backup/restore paths, what makes a light offline check code for a printed Proof, and which CSS print facts matter for a one-page Proof?

**Ticket:** [#172](https://github.com/atilileri/atilileri.github.io/issues/172), part of map [#171](https://github.com/atilileri/atilileri.github.io/issues/171)

**Date:** 2026-11-12

**Threat model (from the map):** we trust her. The goal is protection against **accidental loss**, not cheating.

---

## TL;DR

- **Browser storage is durable enough for normal use, but not guaranteed.** By default it is "best-effort": kept unless disk runs low, the browser's cap is hit, or she clears site data. Safari adds one more rule: a site with no user interaction in **7 days of Safari use** loses all script-written storage. Private windows lose everything when closed.
- **`navigator.storage.persist()` helps a bit.** It shields data from eviction under storage pressure (and in Safari, from the 7-day rule). It never shields against her clearing site data. Chrome grants or refuses it silently, Firefox asks her with a prompt, and Safari grants it on heuristics.
- **The real protection is a copy outside the browser.** The cheapest is a **save code**: the state as a short text string she can copy, and that the site can import. A downloaded `.json` file and a URL that carries the state are variants of the same thing.
- **A check code with a "secret" in a public repo is not a secret.** It still catches typos and accidental edits, and that is all this threat model needs. A short SHA-256 prefix of the canonical state does that job.
- **Print:** `@media print` hides the game UI, `@page { size: A4; margin: … }` fixes the page, `print-color-adjust: exact` keeps colours, and `break-inside: avoid` keeps blocks whole.

**Recommendation for the grilling ticket ([#175](https://github.com/atilileri/atilileri.github.io/issues/175)):** store state in `localStorage` under one namespaced key, call `persist()` once, and give one **save code** that does three jobs. It is the backup she can copy, the import format for restoring, and the check code printed on the Proof. Details in §5.

---

## 1. How durable is browser storage?

### 1.1 Best-effort is the default, and it is quite durable

- "Best-effort data persists as long as the origin is below its quota, the device has enough storage space, and the user doesn't choose to delete the data via their browser's settings." ([MDN, Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria))
- MDN cites research that "data is very rarely deleted by the browser. If a user visits a website regularly, there is very little chance that its stored data, even in best-effort mode, will get evicted." (same page)
- web.dev puts the main risk somewhere else: "It is far more common for users to manually clear storage." ([web.dev, Persistent storage](https://web.dev/articles/persistent-storage))

### 1.2 When each browser evicts

| Trigger | Chrome | Firefox | Safari |
|---|---|---|---|
| Storage pressure / browser cap (LRU, best-effort origins only) | yes; Chrome "uses at most 80% of the total disk size" | yes | yes |
| No interaction for 7 days of browser use | no | no | **yes**, when tracking prevention is on |
| Private / incognito window closed | data deleted | data deleted | data deleted |
| She clears site data in settings | deleted, even when persistent | deleted, even when persistent | deleted, even when persistent |

Sources: [MDN eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) (LRU, the 80% cap, "stored data is usually deleted when the private browsing mode ends"), [web.dev persistent storage](https://web.dev/articles/persistent-storage).

- **Eviction takes the whole origin at once.** MDN: "all of its data, not parts of it, is deleted at the same time." Note that the origin here is `atilileri.github.io`, so the birthday site shares it with every other page on this site. That is harmless for eviction, but keys need a namespace (for example `bday26:`).
- **Safari's 7-day rule.** WebKit deletes "all of a website's script-writable storage after seven days of Safari use without user interaction on the site". That covers IndexedDB, localStorage, sessionStorage, and service-worker caches. Web apps added to the home screen keep their own counter. ([WebKit, Full third-party cookie blocking and more](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)) MDN gives the trigger as "no user interaction, such as click or tap, in the last seven days of browser use". Only script-created data is deleted; server-set cookies are exempt. The rule applies to first-party sites too. It counts days of *Safari use*, not calendar days, so a laptop where Safari sits closed loses nothing. A browser she uses daily without visiting the site loses it after about a week.
- **Safari 17 (macOS Sonoma) eviction** is LRU by origin, and it skips "origins [that] have an active page at the time of eviction or are in persistent mode". ([WebKit, Updates to storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/))

### 1.3 Quotas are not a concern

Progress is a few hundred bytes. Web Storage allows "5 MiB of local storage … per origin", and IndexedDB is limited only by a share of the disk (Chrome up to 60%, Safari 17+ up to around 60%, Firefox best-effort up to 10%). ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)) In Chrome's incognito mode the quota drops to "approximately 5% of the total disk space". ([web.dev, Storage for the web](https://web.dev/articles/storage-for-the-web))

### 1.4 localStorage or IndexedDB?

web.dev says "LocalStorage should be avoided because it is synchronous and will block the main thread", and recommends IndexedDB. ([Storage for the web](https://web.dev/articles/storage-for-the-web)) That advice is about large or frequent writes. For one small JSON blob written after each Game, the blocking cost is negligible. Both APIs face the same eviction rules (§1.2). **For this site, localStorage is enough.** That is an inference from the size of the data, not a claim from the sources.

### 1.5 Does `navigator.storage.persist()` help?

- **What it protects:** "Data stored this way is only evicted, or deleted, if the user chooses to, by using their browser's settings." ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)) LRU eviction "skips over origins that have been granted data persistence" (same page). In Safari, persistent mode also excludes the origin from eviction. ([WebKit 14403](https://webkit.org/blog/14403/updates-to-storage-policy/))
- **What it does not protect:** her clearing site data. "It's only deleted if the user chooses to remove it using their site settings." There is also no API to give up persistence later. ([web.dev, Persistent storage](https://web.dev/articles/persistent-storage))
- **How each browser grants it:**
  - **Chrome:** no prompt. "the persistent storage permission is automatically granted, otherwise it is silently denied". The signals are site engagement, being bookmarked or installed, and notification permission. ([web.dev](https://web.dev/articles/persistent-storage))
  - **Firefox:** a UI popup asks her. ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria))
  - **Safari:** "WebKit currently grants a request based on heuristics like whether the website is opened as a Home Screen Web App." A plain Safari tab is unlikely to get it. ([WebKit 14403](https://webkit.org/blog/14403/updates-to-storage-policy/))
- **Verdict:** call it once. It costs nothing, and bookmarking the page raises Chrome's chance of granting it. It is not a backup.

---

## 2. Cheap backup and restore

All three options below work offline and need no server.

| Option | How | Pros | Cons |
|---|---|---|---|
| **Save code** (copy/paste text) | Serialize the state to compact JSON, base64url-encode it, show it in a text box with a "Kopyala" (copy) button; an import box accepts it back | One mechanism; she can paste it in a message to Atıl; it can be printed | Long codes are awkward to type by hand |
| **Downloaded file** | `<a download="cagla-ilerleme.json" href="blob:…">`; restore with `<input type="file">` and read the text | One click; nothing to retype | Files get lost in Downloads; clumsier on a phone |
| **State-carrying URL** | Put the save code in the URL fragment (`/20261209/#k=…`) | Bookmarking or sharing it *is* the backup | Long URLs; a stale bookmark restores an old state |

Platform facts:

- `download` "only works for same-origin URLs, same-origin `blob:`, and `data:` schemes". A blob made on the page qualifies. ([MDN, `<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download))
- The File API lets a page "ask the user to select local files and then read the contents of those files", all in the browser. ([MDN, Using files from web applications](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications))

**Size check.** The state is roughly 13 Best scores, a few Gifts held, a few Returns, and the won Small prizes. That makes a JSON blob of about 200–400 bytes, or about 270–540 base64 characters. Short field names or a fixed-order array shrink it a lot. For example, 13 scores as integers 0–100 plus bitmasks for Gifts and Small prizes fits in under 40 bytes, which is about 55 characters. That size is short enough to print on the Proof and retype if ever needed. (This sizing is my estimate.)

---

## 3. A light offline check code

### 3.1 What a secret in the page can and cannot do

The repo is public and the page ships its JavaScript, so any "secret" baked into the page can be read by anyone who opens the source. A keyed hash (HMAC) gives no protection against forgery here. A plain hash has the same strength as an HMAC whose key is public. Under the map's trust model this does not matter.

**What it does protect against:**

- typos when retyping a code from paper;
- truncated copy/paste;
- an accidental hand-edit of a saved file;
- importing a code from a different site or version (if the version is part of the hashed input).

**What it does not protect against:** anyone who reads the page source and wants to forge a Proof. That is out of scope by the map's trust model.

### 3.2 How to compute it

- `crypto.subtle.digest("SHA-256", data)` returns "A `Promise` that fulfills with an `ArrayBuffer` containing the digest". It has been Baseline "Widely available … since January 2020". **It needs a secure context (HTTPS).** GitHub Pages serves over HTTPS, so this is satisfied. ([MDN, SubtleCrypto.digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest))
- Avoid SHA-1: it "is now considered vulnerable". (same page) Any modern hash works for typo detection, but SHA-256 is the default choice.
- **Check code** = the first 6–8 characters of the SHA-256 of a canonical string: a version tag, then the state in fixed order, then an optional site salt. Show it in groups (`7F3K-92QD`) in an alphabet without look-alikes (drop 0/O, 1/I/L). A 32-bit prefix catches a random corruption with probability 1 − 2⁻³²; my calculation, not from a source.
- A hand-rolled checksum (for example CRC32 or Luhn mod N) would also work, and it works synchronously. SHA-256 needs no extra code, though.

---

## 4. CSS facts for a one-page printable Proof

- **`@media print`**: "these styles will only be used for printed content". Use it to hide the game UI, nav and buttons. `beforeprint`/`afterprint` events also fire if JS needs to fill in the Proof before printing. ([MDN, Printing](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Printing))
- **`@page { size: A4 portrait; }`**: A4 "matches the standard, ISO dimensions: 210mm x 297mm"; portrait is the default orientation. Baseline 2024, so it works in current Chrome, Firefox and Safari. `@page` also sets margins. ([MDN, @page size](https://developer.mozilla.org/en-US/docs/Web/CSS/@page/size)) She can still change the paper size in the print dialog. Design for A4 in the Netherlands, and leave slack so it also fits Letter.
- **Colours:** `print-color-adjust` defaults to `economy`, which lets the browser drop background images and adjust colours. `exact` asks it to keep them. Even so, the user agent and print settings can override it. Baseline 2025. ([MDN, print-color-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust)) Also declare `-webkit-print-color-adjust: exact` for older Chrome and Safari; that last point is from the general platform history, not a fetched source. **Design note:** let the Proof read well with backgrounds stripped, using dark text, borders instead of fills, and no meaning carried by background colour alone.
- **Keep blocks whole:** `break-inside: avoid` / `avoid-page` keeps a box (the score table, the check-code block) from splitting across pages. Widely available since January 2019. ([MDN, break-inside](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside))
- **Browser header/footer** (URL, date, page number) is added by the browser's print dialog, and the user toggles it there. Plan for it to appear: it would print the `/20261209/` URL.

---

## 5. Recommended approach (input for the grilling ticket)

1. **Primary store:** `localStorage`, one key `bday26:v1`, holding a compact JSON state. Write it after every finished play, Gift purchase and Return. Wrap writes in `try/catch`, as MDN advises, for `QuotaExceededError` and for private modes.
2. **`navigator.storage.persist()`** on first load. Ignore the result in the UI. Suggest she **bookmark the page**, which helps Chrome grant it and also makes revisits easy.
3. **One save code** = base64url(compact state) + "-" + 6–8 character check code. It appears in three places:
   - a "Yedek kodu" (backup code) box with a copy button, plus an import box that checks the code before restoring;
   - optionally a download of the same text as a `.txt`/`.json` file;
   - printed on the **Proof**, so the paper itself is the last-resort backup.
4. **Nudge, don't nag:** after each Gift purchase (the most valuable change), show "Yedeğini al" (take your backup). On the birthday evening Atıl can simply photograph the Proof.
5. **Safari note:** if she uses Safari, the 7-day rule only matters if she uses Safari for a week without opening the site. The save code covers that case.

Open questions for grilling: the exact state shape (field order fixes the code length); whether the Proof shows the full save code or only the check code; and which browser her laptop uses.
