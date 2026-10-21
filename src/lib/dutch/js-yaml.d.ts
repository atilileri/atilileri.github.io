// js-yaml ships no types; the site only parses with it.
declare module "js-yaml" {
  export function load(text: string): unknown;
}
