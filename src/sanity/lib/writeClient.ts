import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Authenticated write / draft client.
// - Always bypasses the CDN (useCdn: false) so writes and draft reads are fresh.
// - Carries the API token, so it must NEVER reach the browser. The `server-only`
//   import above makes the build fail if this module is ever pulled into a
//   Client Component bundle, guaranteeing the token can't leak.
// Public, read-only rendering must use the token-less CDN-config client in
// './client' instead.
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
