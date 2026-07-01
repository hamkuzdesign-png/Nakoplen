/**
 * Prefixes a `/public`-rooted path with the app's basePath so raw <img>/<video>
 * src references keep working when the static export is served from a GitHub
 * Pages project subpath (e.g. https://user.github.io/Nakoplen/...). Locally
 * and on the ngrok/production server NEXT_PUBLIC_BASE_PATH is unset, so this
 * is a no-op there.
 */
export const ASSET_PREFIX = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${ASSET_PREFIX}${path}`;
}
