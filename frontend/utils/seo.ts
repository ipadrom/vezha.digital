export const siteUrl = "https://vezha.digital";
export const defaultShareImage = `${siteUrl}/og-image.png`;

export function absoluteSiteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

// Messengers do not render SVG previews, so vector covers fall back to the brand card.
export function shareImageUrl(...candidates: Array<string | null | undefined>) {
  const image = candidates.find((candidate) => candidate && !/\.svg(\?|#|$)/i.test(candidate));
  return image ? absoluteSiteUrl(image) : defaultShareImage;
}
