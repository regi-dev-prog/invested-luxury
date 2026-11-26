import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

// auto('format') tells Sanity's CDN to negotiate the optimal image format
// based on the browser's Accept header (WebP/AVIF for modern browsers, JPEG
// fallback). Critical because product images downloaded from Mytheresa CDN
// arrive as HEIF, which most browsers cannot render in <img> tags.
// Without this conversion, HEIF assets render as broken images.
export const urlFor = (source: SanityImageSource) => {
  return builder.image(source).auto('format')
}

// Alias used by some components — keep behavior consistent
export const urlForImage = urlFor

// Share image (og:image / twitter:image) for social and messaging previews.
// WhatsApp, Facebook and LinkedIn do not reliably render WebP/AVIF, and
// auto('format') can hand their crawlers WebP, so this forces a JPEG at the
// standard 1200x630, cropped around the image hotspot.
//
// The CDN path still ends in the original extension (often .webp) even when
// fm=jpg is set, and WhatsApp skips images whose URL looks like WebP. Sanity
// supports a "vanity filename" segment after the asset name, so we append
// /share.jpg to make the URL path itself end in .jpg.
export const ogImageUrl = (source: SanityImageSource) => {
  const url = builder.image(source).width(1200).height(630).fit('crop').format('jpg').quality(80).url()
  const [path, query] = url.split('?')
  return `${path}/share.jpg${query ? `?${query}` : ''}`
}
