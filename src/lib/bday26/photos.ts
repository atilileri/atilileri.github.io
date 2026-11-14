/**
 * The 21 photos of the birthday games (/20261209/, spec #192 "Modules" 6;
 * prepared on #190, labelled on #189), typed, for every Game that shows
 * them: the memory match (#194, the `square` crops), "Bu nerede?" (#199,
 * `place` and `inside`) and photo framing (#203, the five with a `subject`).
 *
 * The data itself is `public/20261209/photos/photos.json`, next to the image
 * files it names, because that folder is served as-is and the JSON must stay
 * one file an agent can edit with the photos. This module imports it at
 * build time (Vite bundles JSON as a module), so a page's client script gets
 * the list without a fetch and with a type; it is 21 small rows.
 *
 * `photoUrl(file)` is the one place the served path is spelled.
 */
import photos from "../../../public/20261209/photos/photos.json";

export type Photo = {
  /** The 1600 px photo, e.g. `p07.webp`. */
  file: string;
  /** The 400 px hand-cut square for the memory match, e.g. `p07-sq.webp`. */
  square: string;
  /** The place, as "Bu nerede?" shows it. */
  place: string;
  /** A wider place this one sits inside (Antalya → Türkiye), when it does. */
  inside?: string;
  /** The Subject point of the photo framing Game, normalised 0..1. */
  subject?: { x: number; y: number };
};

export const PHOTOS: readonly Photo[] = photos;

/** Where the photos are served. */
export const PHOTOS_URL = "/20261209/photos/";

export function photoUrl(file: string): string {
  return PHOTOS_URL + file;
}
