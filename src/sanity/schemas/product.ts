import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    {name: 'basic', title: 'Basic Info', default: true},
    {name: 'pricing', title: 'Pricing'},
    {name: 'details', title: 'Details'},
    {name: 'affiliate', title: 'Affiliate Links'},
    {name: 'investment', title: 'Investment'},
    {name: 'newsletter', title: 'Newsletter / Cost Calc'},
    {name: 'automation', title: 'Automation'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // ============ BASIC INFO ============
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      group: 'basic',
      // Removed: validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      options: {
        source: 'name',
        maxLength: 96,
      },
      // Removed: validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'reference',
      to: [{type: 'brand'}],
      group: 'basic',
      // Removed: validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      group: 'basic',
      // Removed: validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      group: 'basic',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {name: 'alt', type: 'string', title: 'Alt Text'},
            {name: 'caption', type: 'string', title: 'Caption'},
          ],
        },
      ],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'In Review', value: 'review'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
      },
      initialValue: 'draft',
    }),

    // ============ PRICING ============
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      group: 'pricing',
      validation: (Rule) => Rule.positive(),
      // Removed required(), kept positive() for when price IS entered
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      group: 'pricing',
      options: {
        list: [
          {title: 'EUR (€)', value: 'EUR'},
          {title: 'USD ($)', value: 'USD'},
          {title: 'GBP (£)', value: 'GBP'},
        ],
      },
      initialValue: 'USD',
    }),
    defineField({
      name: 'originalPrice',
      title: 'Original Price (if on sale)',
      type: 'number',
      group: 'pricing',
      description: 'Leave empty if not on sale',
    }),
    defineField({
      name: 'priceHistory',
      title: 'Price History',
      type: 'array',
      group: 'pricing',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'price', type: 'number', title: 'Price'},
            {name: 'date', type: 'date', title: 'Date'},
            {name: 'note', type: 'string', title: 'Note'},
          ],
        },
      ],
    }),

    // ============ DETAILS ============
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      group: 'details',
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Description',
      type: 'array',
      group: 'details',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'specifications',
      title: 'Specifications',
      type: 'array',
      group: 'details',
      description: 'Product specs like Size, Material, Made in, etc.',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', type: 'string', title: 'Label (e.g., Size, Material)'},
            {name: 'value', type: 'string', title: 'Value (e.g., 15" W x 10" H)'},
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'value',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'details',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),

    // ============ AFFILIATE LINKS ============
    defineField({
      name: 'affiliateLinks',
      title: 'Affiliate Links',
      type: 'array',
      group: 'affiliate',
      description: 'Add retailers where this product can be purchased',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'retailer',
              type: 'string',
              title: 'Retailer',
              // Removed: validation: (Rule) => Rule.required(),
              options: {
                list: [
                  {title: 'Brand Direct', value: 'direct'},
                  {title: 'Net-a-Porter', value: 'net-a-porter'},
                  {title: 'Mytheresa', value: 'mytheresa'},
                  {title: 'SSENSE', value: 'ssense'},
                  {title: 'Farfetch', value: 'farfetch'},
                  {title: 'MatchesFashion', value: 'matchesfashion'},
                  {title: 'Bergdorf Goodman', value: 'bergdorf'},
                  {title: 'Neiman Marcus', value: 'neiman'},
                  {title: 'Saks Fifth Avenue', value: 'saks'},
                  {title: 'Nordstrom', value: 'nordstrom'},
                  {title: 'The RealReal', value: 'realreal'},
                  {title: 'Vestiaire Collective', value: 'vestiaire'},
                  {title: 'Rebag', value: 'rebag'},
                  {title: '1stDibs', value: '1stdibs'},
                  {title: 'Other', value: 'other'},
                ],
              },
            },
            {
              name: 'retailerName',
              type: 'string',
              title: 'Display Name',
              description: 'Custom name to display (optional, uses retailer name if empty)',
            },
            {
              name: 'url',
              type: 'url',
              title: 'Affiliate URL',
              // Removed: validation: (Rule) => Rule.required(),
            },
            {
              name: 'price',
              type: 'number',
              title: 'Price at Retailer',
              description: 'Leave empty to use main product price',
            },
            {
              name: 'isResale',
              type: 'boolean',
              title: 'Resale/Pre-owned',
              description: 'Is this a resale/consignment platform?',
              initialValue: false,
            },
            {
              name: 'isPrimary',
              type: 'boolean',
              title: 'Primary Retailer',
              description: 'Show this as the main CTA button',
              initialValue: false,
            },
            {
              name: 'inStock',
              type: 'boolean',
              title: 'In Stock',
              initialValue: true,
            },
            {
              name: 'lastChecked',
              type: 'datetime',
              title: 'Last Checked',
            },
          ],
          preview: {
            select: {
              title: 'retailer',
              price: 'price',
              isResale: 'isResale',
              isPrimary: 'isPrimary',
            },
            prepare({title, price, isResale, isPrimary}) {
              const badges = []
              if (isPrimary) badges.push('⭐ Primary')
              if (isResale) badges.push('♻️ Resale')
              return {
                title: title?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                subtitle: `${price ? `$${price}` : 'No price'} ${badges.join(' ')}`,
              }
            },
          },
        },
      ],
    }),

    // ============ INVESTMENT ============
    defineField({
      name: 'investmentScore',
      title: 'Investment Score',
      type: 'number',
      group: 'investment',
      description: 'How good is this as an investment piece? (1-10)',
      validation: (Rule) => Rule.min(1).max(10),
    }),
    defineField({
      name: 'resaleValue',
      title: 'Resale Value Estimate',
      type: 'string',
      group: 'investment',
      options: {
        list: [
          {title: 'Excellent (70-100%)', value: 'excellent'},
          {title: 'Good (50-70%)', value: 'good'},
          {title: 'Average (30-50%)', value: 'average'},
          {title: 'Below Average (<30%)', value: 'below'},
        ],
      },
    }),
    defineField({
      name: 'investmentNotes',
      title: 'Investment Notes',
      type: 'text',
      group: 'investment',
      rows: 3,
      description: 'Why is this a good/bad investment?',
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
          description: 'Leave empty to use product name',
          validation: (Rule) => Rule.max(60),
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Description',
          rows: 2,
          validation: (Rule) => Rule.max(160),
        },
      ],
    }),

    // ============ AUTOMATION ============
    defineField({
      name: 'sourcePlatform',
      title: 'Source Platform',
      type: 'string',
      group: 'automation',
      description: 'Where was this product scraped from?',
      options: {
        list: [
          {title: 'Manual Entry', value: 'manual'},
          {title: 'Farfetch', value: 'farfetch'},
          {title: 'Net-a-Porter', value: 'net-a-porter'},
          {title: 'SSENSE', value: 'ssense'},
          {title: 'Mytheresa', value: 'mytheresa'},
          {title: 'MatchesFashion', value: 'matchesfashion'},
        ],
      },
      initialValue: 'manual',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      group: 'automation',
      description: 'Original product page URL for updates',
    }),
    defineField({
      name: 'sourceProductId',
      title: 'Source Product ID',
      type: 'string',
      group: 'automation',
      description: 'Unique ID from source platform (for deduplication)',
    }),
    defineField({
      name: 'autoGenerated',
      title: 'Auto Generated',
      type: 'boolean',
      group: 'automation',
      description: 'Was this product added automatically?',
      initialValue: false,
    }),
    defineField({
      name: 'lastScrapedAt',
      title: 'Last Scraped',
      type: 'datetime',
      group: 'automation',
      description: 'When was this product last updated from source?',
    }),
    defineField({
      name: 'scrapingNotes',
      title: 'Scraping Notes',
      type: 'string',
      group: 'automation',
      description: 'Any issues during scraping?',
    }),

    // ============ NEWSLETTER / COST CALC ============
    // Additive fields for the weekly newsletter engine. All optional so the
    // existing store products stay valid and no existing query is affected.
    // Calculation fields show conditionally based on costCategory.
    defineField({
      name: 'costCategory',
      title: 'Cost Calc Category',
      type: 'string',
      group: 'newsletter',
      description:
        'Drives the weekly newsletter rotation and which cost model applies. Separate from the store Category above. Leave empty for products not used in the newsletter.',
      options: {
        list: [
          {title: 'Fashion (cost per wear)', value: 'fashion'},
          {title: 'Wellness (cost per session)', value: 'wellness'},
        ],
      },
    }),
    defineField({
      name: 'priceLastVerified',
      title: 'Price Last Verified',
      type: 'date',
      group: 'newsletter',
      description:
        'The date the current price was actually checked at the merchant. The newsletter QA gate blocks sending if this is older than 60 days.',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          return new Date(value as string) <= new Date()
            ? true
            : 'Price Last Verified cannot be in the future'
        }),
    }),
    defineField({
      name: 'priceSource',
      title: 'Price Source',
      type: 'string',
      group: 'newsletter',
      description: 'Where the current price was taken from (e.g. brand.com, Net-a-Porter).',
    }),
    defineField({
      name: 'lastFeaturedDate',
      title: 'Last Featured in Newsletter',
      type: 'date',
      group: 'newsletter',
      description: 'When this product last appeared in an issue. The engine uses this to avoid repeats.',
    }),

    // --- Shared input — applies to both categories ---
    defineField({
      name: 'expectedResaleValue',
      title: 'Expected Resale Value',
      type: 'number',
      group: 'newsletter',
      description:
        'Estimated resale / second-hand value. Use completed sale prices, not asking prices. Optional for wellness gear (the calculation defaults it to 0, since resale is less predictable there).',
      hidden: ({document}) => document?.costCategory !== 'fashion' && document?.costCategory !== 'wellness',
      validation: (Rule) => Rule.min(0),
    }),

    // --- Fashion inputs (cost per wear) — shown when Cost Calc Category = Fashion ---
    defineField({
      name: 'expectedLifespanYears',
      title: 'Expected Lifespan (years)',
      type: 'number',
      group: 'newsletter',
      hidden: ({document}) => document?.costCategory !== 'fashion',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'expectedWearsPerYear',
      title: 'Expected Wears Per Year',
      type: 'number',
      group: 'newsletter',
      hidden: ({document}) => document?.costCategory !== 'fashion',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'annualCareCost',
      title: 'Annual Care Cost',
      type: 'number',
      group: 'newsletter',
      description: 'Cleaning, repairs, storage per year.',
      hidden: ({document}) => document?.costCategory !== 'fashion',
      validation: (Rule) => Rule.min(0),
    }),

    // --- Wellness inputs (cost per session) — shown when Cost Calc Category = Wellness ---
    defineField({
      name: 'expectedServiceLifeYears',
      title: 'Expected Service Life (years)',
      type: 'number',
      group: 'newsletter',
      hidden: ({document}) => document?.costCategory !== 'wellness',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'sessionsPerWeek',
      title: 'Sessions Per Week',
      type: 'number',
      group: 'newsletter',
      hidden: ({document}) => document?.costCategory !== 'wellness',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'annualRunningCost',
      title: 'Annual Running Cost',
      type: 'number',
      group: 'newsletter',
      description: 'Electricity, consumables, maintenance per year.',
      hidden: ({document}) => document?.costCategory !== 'wellness',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'comparableCostPerVisit',
      title: 'Comparable Cost Per Visit',
      type: 'number',
      group: 'newsletter',
      description: 'What one session costs elsewhere (spa, studio), for the break-even comparison.',
      hidden: ({document}) => document?.costCategory !== 'wellness',
      validation: (Rule) => Rule.min(0),
    }),

    // ============ META ============
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Show in Most Wanted carousel',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Order in Currently Coveting section (lower = first)',
      initialValue: 10,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
      description: 'When was product info last updated',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      brand: 'brand.name',
      price: 'price',
      currency: 'currency',
      media: 'images.0',
      status: 'status',
      autoGenerated: 'autoGenerated',
      costCategory: 'costCategory',
    },
    prepare({title, brand, price, currency, media, status, autoGenerated, costCategory}) {
      const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
      const autoTag = autoGenerated ? ' 🤖' : ''
      const costTag = costCategory ? ` • 📬 ${costCategory}` : ''
      return {
        title: `${title || 'Untitled Product'}${autoTag}`,
        subtitle: `${brand || 'No brand'} - ${currencySymbol}${price?.toLocaleString() || '0'} • ${status || 'draft'}${costTag}`,
        media: media,
      }
    },
  },
})