// Pre-rendered high-density covers avoid mobile WebKit's rasterization of
// nested SVG image/filter layers. Desktop keeps the editable SVG composition.
export function mobileCaseCover(url: unknown): string | undefined {
  if (typeof url !== 'string') return undefined
  if (!/\/cases\/(?:ssag\/2026-09\/cover-editorial|gbu-process-automation\/2026-09\/cover-work-center)\.svg(?:\?.*)?$/.test(url)) return undefined
  return url.replace(/\.svg(?=\?|$)/, '-mobile.webp')
}
