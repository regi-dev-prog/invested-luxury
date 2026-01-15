// sanity/schemas/featuredProduct.ts
// Schema for "Currently Coveting" featured products section

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'featuredProduct',
  title: 'Featured Product',
  type: 'document',
  icon: () => '✨',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      description: 'e.g., "SAINT LAURENT MOMBASA MEDIUM BAG"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      description: 'e.g., "Saint Laurent", "Miu Miu", "Ralph Lauren"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price in USD (without currency symbol)',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'USD',
      options: {
        list: [
          { title: 'USD ($)', value: 'USD' },
          { title: 'EUR (€)', value: 'EUR' },
          { title: 'GBP (£)', value: 'GBP' },
        ],
      },
    }),
    defineField({
      name: 'image',
      title: 'Product Image',
      type: 'image',
      description: 'Clean product image on white/transparent background. Recommended: square ratio.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Important for SEO and accessibility',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imageUrl',
      title: 'External Image URL',
      type: 'url',
      description: 'Alternative: Use external image URL from retailer (if no uploaded image)',
    }),
    defineField({
      name: 'affiliateUrl',
      title: 'Affiliate URL',
      type: 'url',
      description: 'Full affiliate link to the product page',
      validation: (Rule) => Rule.required().uri({
        scheme: ['http', 'https'],
      }),
    }),
    defineField({
      name: 'retailer',
      title: 'Retailer',
      type: 'string',
      description: 'e.g., "Net-a-Porter", "Mytheresa", "SSENSE"',
      options: {
        list: [
          { title: 'Net-a-Porter', value: 'net-a-porter' },
          { title: 'Mytheresa', value: 'mytheresa' },
          { title: 'SSENSE', value: 'ssense' },
          { title: 'Farfetch', value: 'farfetch' },
          { title: 'MatchesFashion', value: 'matchesfashion' },
          { title: 'Bergdorf Goodman', value: 'bergdorf-goodman' },
          { title: 'Nordstrom', value: 'nordstrom' },
          { title: 'Brand Direct', value: 'brand-direct' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Bags', value: 'bags' },
          { title: 'Shoes', value: 'shoes' },
          { title: 'Clothing', value: 'clothing' },
          { title: 'Accessories', value: 'accessories' },
          { title: 'Jewelry', value: 'jewelry' },
          { title: 'Watches', value: 'watches' },
          { title: 'Beauty', value: 'beauty' },
        ],
      },
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Only active products will be displayed',
      initialValue: true,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first (1, 2, 3...)',
      initialValue: 10,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      description: 'Optional: When to start showing this product',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'Optional: When to stop showing this product (for seasonal items)',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'brand',
      price: 'price',
      currency: 'currency',
      media: 'image',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, price, currency, media, isActive }) {
      const currencySymbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
      }
      const symbol = currencySymbols[currency] || '$'
      const status = isActive ? '✅' : '❌'
      return {
        title: `${status} ${title}`,
        subtitle: `${subtitle} - ${symbol}${price?.toLocaleString()}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
    {
      title: 'Price: Low to High',
      name: 'priceAsc',
      by: [{ field: 'price', direction: 'asc' }],
    },
    {
      title: 'Price: High to Low',
      name: 'priceDesc',
      by: [{ field: 'price', direction: 'desc' }],
    },
    {
      title: 'Brand A-Z',
      name: 'brandAsc',
      by: [{ field: 'brand', direction: 'asc' }],
    },
  ],
})
