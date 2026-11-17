/**
 * Atıl's corner (*Atıl'ın köşesi*) on the hub of the birthday games site
 * (/20261209/): a small hidden panel where Atıl gives her Gifted points
 * (glossary, "Gifted points" / *Hediye puan*) and takes back the newest one
 * after a typo. The markup and its look are `src/components/bday26/
 * Admin.astro`; this module is its behaviour, mounted by the hub's script
 * with the hub's own ledger, because two ledgers on one page would not see
 * each other's writes.
 *
 * THE PASSWORD IS NOT A LOCK. It is checked here, in the browser, against a
 * constant in this public repository: anyone who reads the source can open
 * the panel. That is fine by the site's trust model (spec #192, #175): we
 * trust her, the Save code already "does not stop an edit made on purpose",
 * and Atıl checks a Proof against her live screen. The password only keeps
 * the panel from opening by accident and keeps the surprise. Unlocked lasts
 * until the dialog closes; nothing is stored, so every opening asks again.
 *
 * WHAT IT DECIDES: nothing. A gift and an undo go through the ledger
 * (`giftPoints`, `undoLastGift`), which refuses a number that is not a whole
 * number above 0 and an undo whose Points are already spent; this module
 * turns each refusal into one Turkish sentence. The hub is told through
 * `onClose(changed)` so it can repaint, make the Balance hop and offer the
 * backup prompt — once, when the dialog closes, because the hub's toast sits
 * behind the modal while it is open.
 */
import type { Ledger } from "./ledger.ts";

/** Atıl's password. Public on purpose; see the header. */
const PASSWORD = "1047";

const fmt = (n: number) => Math.round(n).toLocaleString("tr-TR");
const DATE = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export type AdminOptions = {
  ledger: Ledger;
  /** The dialog closed; `changed` is true when a gift or undo went through. */
  onClose(changed: boolean): void;
};

export function mountAdmin(root: ParentNode, { ledger, onClose }: AdminOptions) {
  const $ = <T extends HTMLElement = HTMLElement>(selector: string): T => {
    const el = root.querySelector<T>(selector);
    if (!el) throw new Error(`bday26 admin: missing ${selector}`);
    return el;
  };
  const dialog = $<HTMLDialogElement>("dialog[data-admin]");
  const lock = $<HTMLFormElement>("[data-admin-lock]");
  const pass = $<HTMLInputElement>("[data-admin-pass]");
  const passError = $("[data-admin-pass-error]");
  const desk = $("[data-admin-desk]");
  const form = $<HTMLFormElement>("[data-admin-form]");
  const amount = $<HTMLInputElement>("[data-admin-amount]");
  const note = $<HTMLInputElement>("[data-admin-note]");
  const status = $("[data-admin-status]");
  const balance = $("[data-admin-balance]");
  const list = $("[data-admin-list]");
  const empty = $("[data-admin-empty]");
  const undo = $<HTMLButtonElement>("[data-admin-undo]");
  let changed = false;

  function lockUp() {
    lock.hidden = false;
    desk.hidden = true;
    pass.value = "";
    passError.hidden = true;
    lock.removeAttribute("data-shake");
  }

  function say(text: string, tone: "ok" | "no") {
    status.textContent = text;
    status.dataset.tone = tone;
  }

  function paint() {
    balance.textContent = fmt(ledger.balance());
    const gifts = ledger.gifted();
    list.replaceChildren(
      ...gifts
        .map((g) => {
          const li = document.createElement("li");
          const pts = document.createElement("b");
          pts.textContent = `+${fmt(g.points)}`;
          const text = document.createElement("span");
          text.className = "adm-note";
          text.textContent = g.note ?? "—";
          const when = document.createElement("time");
          when.dateTime = g.at;
          const date = new Date(g.at);
          when.textContent = Number.isNaN(date.getTime()) ? "" : DATE.format(date);
          li.append(pts, text, when);
          return li;
        })
        .reverse(),
    );
    list.hidden = gifts.length === 0;
    empty.hidden = gifts.length > 0;
    undo.disabled = gifts.length === 0;
  }

  function hop(el: HTMLElement) {
    el.removeAttribute("data-hop");
    void el.offsetWidth; // restart the animation
    el.setAttribute("data-hop", "");
  }

  for (const trigger of document.querySelectorAll("[data-open-admin]")) {
    trigger.addEventListener("click", () => {
      lockUp();
      changed = false;
      dialog.showModal();
      pass.focus();
    });
  }

  lock.addEventListener("submit", (event) => {
    event.preventDefault();
    if (pass.value.trim() !== PASSWORD) {
      passError.hidden = false;
      pass.select();
      lock.removeAttribute("data-shake");
      void lock.offsetWidth;
      lock.setAttribute("data-shake", "");
      return;
    }
    lock.hidden = true;
    desk.hidden = false;
    amount.value = "";
    note.value = "";
    status.textContent = "";
    paint();
    amount.focus();
  });

  for (const quick of root.querySelectorAll<HTMLButtonElement>("[data-admin-quick]")) {
    quick.addEventListener("click", () => {
      const now = Number(amount.value) || 0;
      amount.value = String(Math.max(0, Math.floor(now)) + Number(quick.dataset.adminQuick));
      amount.focus();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const outcome = ledger.giftPoints(Number(amount.value), note.value || undefined);
    if (!outcome.ok) {
      say("Bir tam sayı yaz, en az 1.", "no");
      amount.focus();
      return;
    }
    changed = true;
    amount.value = "";
    note.value = "";
    say(`+${fmt(outcome.points)} puan hediye edildi 🎉`, "ok");
    paint();
    hop(balance);
    amount.focus();
  });

  undo.addEventListener("click", () => {
    const outcome = ledger.undoLastGift();
    if (!outcome.ok) {
      say(
        outcome.reason === "spent"
          ? "Bu puanlar harcanmış; geri alınamaz."
          : "Geri alınacak hediye yok.",
        "no",
      );
      return;
    }
    changed = true;
    say(`+${fmt(outcome.points)} puanlık son hediye geri alındı.`, "ok");
    paint();
  });

  for (const close of root.querySelectorAll("[data-admin-close]")) {
    close.addEventListener("click", () => dialog.close());
  }
  // Esc is the dialog's own; every way out locks it again.
  dialog.addEventListener("close", () => {
    lockUp();
    desk.hidden = true;
    onClose(changed);
    changed = false;
  });
}
