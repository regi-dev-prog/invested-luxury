import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // CDN disabled because revalidatePath in /api/revalidate doesn't clear
  // Next.js Data Cache. With useCdn:false, fetched data is fresh on every
  // ISR rebuild (every 60s per `export const revalidate = 60`).
  useCdn: false,
})
