import { createClient } from '@sanity/client';

if (!process.env.SANITY_API_TOKEN) {
  console.warn('Warning: SANITY_API_TOKEN not set');
}

export const sanityClient = createClient({
  projectId: '4b3ap7pf',
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});
