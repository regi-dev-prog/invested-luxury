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
