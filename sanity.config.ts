'use client'

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/sanity/schemas'
import {withPublishDate} from './src/sanity/actions/publishWithDate'

export default defineConfig({
  name: 'invested-luxury',
  title: 'InvestedLuxury',
  
  projectId: '4b3ap7pf',
  dataset: 'production',
  
  basePath: '/studio',
  
  plugins: [
    structureTool(),
    visionTool(),
  ],
  
  schema: {
    types: schemaTypes,
  },

  document: {
    // Articles: Publish stamps publishedAt if it is empty (never overwrites).
    actions: (prev, context) =>
      context.schemaType === 'article'
        ? prev.map((action) => (action.action === 'publish' ? withPublishDate(action) : action))
        : prev,
  },
})
