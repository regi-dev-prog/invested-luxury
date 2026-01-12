import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

const projectId = '4b3ap7pf';
const dataset = 'production';
const apiVersion = '2024-01-01';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

// Image URL builder
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Preview client (for drafts)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Get the appropriate client based on preview mode
export const getClient = (preview = false) => (preview ? previewClient : client);
