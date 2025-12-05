import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'seo', title: 'SEO'},
    {name: 'products', title: 'Products'},
    {name: 'automation', title: 'Automation & AI'},
    {name: 'publishing', title: 'Publishing'},
  ],
  fields: [
    // ============ CONTENT ============
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      group: 'content',
      description: 'The italicized text under the title',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Brief summary for SEO and previews (150-160 characters ideal)',
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [
        {type: 'block'},
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'caption', type: 'string', title: 'Caption'},
            {name: 'alt', type: 'string', title: 'Alt Text'},
          ],
        },
        {
          type: 'object',
          name: 'productEmbed',
          title: 'Product Embed',
          fields: [
            {
              name: 'product',
              type: 'reference',
              to: [{type: 'product'}],
            },
            {
              name: 'displayStyle',
              type: 'string',
              options: {
                list: [
                  {title: 'Card', value: 'card'},
                  {title: 'Inline', value: 'inline'},
                  {title: 'Full Width', value: 'full'},
                ],
              },
              initialValue: 'card',
            },
          ],
          preview: {
            select: {
              title: 'product.name',
              media: 'product.images.0',
            },
            prepare({title, media}) {
              return {
                title: `Product: ${title}`,
                media,
              }
            },
          },
        },
        {
          type: 'object',
          name: 'callToAction',
          title: 'Call to Action',
          fields: [
            {name: 'text', type: 'string', title: 'Button Text'},
            {name: 'url', type: 'url', title: 'URL'},
            {name: 'style', type: 'string', title: 'Style', options: {
              list: [
                {title: 'Primary', value: 'primary'},
                {title: 'Secondary', value: 'secondary'},
              ],
            }},
          ],
        },
        {
          type: 'object',
          name: 'faqItem',
          title: 'FAQ Item',
          fields: [
            {name: 'question', type: 'string', title: 'Question'},
            {name: 'answer', type: 'text', title: 'Answer'},
          ],
        },
      ],
    }),

    // ============ MEDIA ============
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true,
      },
      fields: [
        {name: 'alt', type: 'string', title: 'Alt Text'},
        {name: 'caption', type: 'string', title: 'Caption'},
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'alt', type: 'string', title: 'Alt Text'},
            {name: 'caption', type: 'string', title: 'Caption'},
          ],
        },
      ],
    }),

    // ============ SEO ============
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Meta Title',
          description: 'Max 60 characters',
          validation: (Rule) => Rule.max(60),
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Description',
          rows: 2,
          description: 'Max 160 characters',
          validation: (Rule) => Rule.max(160),
        },
        {name: 'focusKeyword', type: 'string', title: 'Focus Keyword'},
        {
          name: 'secondaryKeywords',
          type: 'array',
          title: 'Secondary Keywords',
          of: [{type: 'string'}],
        },
        {
          name: 'canonicalUrl',
          type: 'url',
          title: 'Canonical URL',
          description: 'Only if different from default',
        },
        {
          name: 'noIndex',
          type: 'boolean',
          title: 'No Index',
          description: 'Hide from search engines',
          initialValue: false,
        },
      ],
    }),
    defineField({
      name: 'schemaMarkup',
      title: 'Schema Markup Type',
      type: 'string',
      group: 'seo',
      options: {
        list: [
          {title: 'Article', value: 'article'},
          {title: 'Product Review', value: 'review'},
          {title: 'FAQ Page', value: 'faq'},
          {title: 'How-To', value: 'howto'},
          {title: 'Buying Guide', value: 'guide'},
        ],
      },
      initialValue: 'article',
    }),

    // ============ PRODUCTS ============
    defineField({
      name: 'featuredProducts',
      title: 'Featured Products',
      type: 'array',
      group: 'products',
      of: [{type: 'reference', to: [{type: 'product'}]}],
      description: 'Products mentioned in this article',
    }),
    defineField({
      name: 'primaryProduct',
      title: 'Primary Product',
      type: 'reference',
      group: 'products',
      to: [{type: 'product'}],
      description: 'Main product for reviews (for schema markup)',
    }),
    defineField({
      name: 'productRating',
      title: 'Product Rating',
      type: 'number',
      group: 'products',
      description: 'Rating out of 5 (for reviews)',
      validation: (Rule) => Rule.min(1).max(5),
    }),

    // ============ AUTOMATION & AI (NEW) ============
    defineField({
      name: 'autoGenerated',
      title: 'Auto Generated',
      type: 'boolean',
      group: 'automation',
      description: 'Was this article generated automatically?',
      initialValue: false,
    }),
    defineField({
      name: 'aiDetectionScore',
      title: 'AI Detection Score',
      type: 'number',
      group: 'automation',
      description: 'Score from Originality.ai (0-100, lower is better)',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'originalityScore',
      title: 'Originality Score',
      type: 'number',
      group: 'automation',
      description: 'Human score from Originality.ai (0-100, higher is better)',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'humanReviewed',
      title: 'Human Reviewed',
      type: 'boolean',
      group: 'automation',
      description: 'Has a human reviewed this content?',
      initialValue: false,
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Reviewed By',
      type: 'reference',
      group: 'automation',
      to: [{type: 'author'}],
      description: 'Who reviewed this article?',
    }),
    defineField({
      name: 'reviewedAt',
      title: 'Reviewed At',
      type: 'datetime',
      group: 'automation',
    }),
    defineField({
      name: 'revisionCount',
      title: 'Revision Count',
      type: 'number',
      group: 'automation',
      description: 'How many times has this been revised for AI detection?',
      initialValue: 0,
    }),
    defineField({
      name: 'contentSource',
      title: 'Content Source',
      type: 'string',
      group: 'automation',
      options: {
        list: [
          {title: 'Manual', value: 'manual'},
          {title: 'Claude API', value: 'claude'},
          {title: 'GPT API', value: 'gpt'},
          {title: 'Hybrid (AI + Human)', value: 'hybrid'},
        ],
      },
      initialValue: 'manual',
    }),
    defineField({
      name: 'generationPrompt',
      title: 'Generation Prompt',
      type: 'text',
      group: 'automation',
      rows: 3,
      description: 'The prompt used to generate this content (for reference)',
    }),
    defineField({
      name: 'automationNotes',
      title: 'Automation Notes',
      type: 'text',
      group: 'automation',
      rows: 2,
      description: 'Any notes about the generation/review process',
    }),

    // ============ PUBLISHING ============
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'publishing',
      to: [{type: 'author'}],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'publishing',
      of: [{type: 'reference', to: [{type: 'category'}]}],
    }),
    defineField({
      name: 'articleType',
      title: 'Article Type',
      type: 'string',
      group: 'publishing',
      options: {
        list: [
          {title: 'Product Review', value: 'review'},
          {title: 'Buying Guide', value: 'guide'},
          {title: 'Comparison', value: 'comparison'},
          {title: 'Editorial', value: 'editorial'},
          {title: 'How-To', value: 'howto'},
          {title: 'News', value: 'news'},
          {title: 'Trend Report', value: 'trend'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'publishing',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'AI Review', value: 'ai-review'},
          {title: 'Human Review', value: 'human-review'},
          {title: 'Ready to Publish', value: 'ready'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'publishing',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
      group: 'publishing',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Article',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      group: 'publishing',
      of: [{type: 'reference', to: [{type: 'article'}]}],
      validation: (Rule) => Rule.max(4),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      status: 'status',
      autoGenerated: 'autoGenerated',
      aiScore: 'aiDetectionScore',
    },
    prepare({title, author, media, status, autoGenerated, aiScore}) {
      const autoTag = autoGenerated ? ' 🤖' : ''
      const aiTag = aiScore ? ` [AI: ${aiScore}%]` : ''
      return {
        title: `${title}${autoTag}`,
        subtitle: `${author || 'No author'} • ${status}${aiTag}`,
        media: media,
      }
    },
  },
})
