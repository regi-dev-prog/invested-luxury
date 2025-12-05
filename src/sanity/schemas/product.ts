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
    {name: 'automation', title: 'Automation'},
  ],
  fields: [
    // ============ BASIC INFO ============
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      group: 'basic',
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'reference',
      to: [{type: 'brand'}],
      group: 'basic',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      group: 'basic',
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required().positive(),
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
      initialValue: 'EUR',
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
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', type: 'string', title: 'Label'},
            {name: 'value', type: 'string', title: 'Value'},
          ],
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
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'retailer',
              type: 'string',
              title: 'Retailer',
              options: {
                list: [
                  {title: 'Net-a-Porter', value: 'net-a-porter'},
                  {title: 'Mytheresa', value: 'mytheresa'},
                  {title: 'SSENSE', value: 'ssense'},
                  {title: 'Farfetch', value: 'farfetch'},
                  {title: 'MatchesFashion', value: 'matchesfashion'},
                  {title: 'Bergdorf Goodman', value: 'bergdorf'},
                  {title: 'Neiman Marcus', value: 'neiman'},
                  {title: 'Saks Fifth Avenue', value: 'saks'},
                  {title: 'Brand Direct', value: 'direct'},
                  {title: 'The RealReal', value: 'realreal'},
                  {title: 'Vestiaire Collective', value: 'vestiaire'},
                  {title: 'Rebag', value: 'rebag'},
                  {title: 'Other', value: 'other'},
                ],
              },
            },
            {name: 'url', type: 'url', title: 'Affiliate URL'},
            {name: 'price', type: 'number', title: 'Price at Retailer'},
            {name: 'inStock', type: 'boolean', title: 'In Stock', initialValue: true},
            {name: 'lastChecked', type: 'datetime', title: 'Last Checked'},
          ],
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

    // ============ AUTOMATION (NEW) ============
    defineField({
      name: 'sourcePlatform',
      title: 'Source Platform',
      type: 'string',
      group: 'automation',
      description: 'Where was this product scraped from?',
      options: {
        list: [
          {title: 'Farfetch', value: 'farfetch'},
          {title: 'Net-a-Porter', value: 'net-a-porter'},
          {title: 'SSENSE', value: 'ssense'},
          {title: 'Mytheresa', value: 'mytheresa'},
          {title: 'MatchesFashion', value: 'matchesfashion'},
          {title: 'Manual Entry', value: 'manual'},
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

    // ============ META ============
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Show in Most Wanted carousel',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
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
    },
    prepare({title, brand, price, currency, media, status, autoGenerated}) {
      const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
      const autoTag = autoGenerated ? ' 🤖' : ''
      return {
        title: `${title}${autoTag}`,
        subtitle: `${brand} - ${currencySymbol}${price?.toLocaleString()} • ${status}`,
        media: media,
      }
    },
  },
})
