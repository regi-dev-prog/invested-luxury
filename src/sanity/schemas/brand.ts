import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Brand Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'website',
      title: 'Official Website',
      type: 'url',
    }),
    defineField({
      name: 'tier',
      title: 'Luxury Tier',
      type: 'string',
      options: {
        list: [
          {title: 'Ultra Luxury (Hermès, Chanel)', value: 'ultra'},
          {title: 'High Luxury (Gucci, Prada)', value: 'high'},
          {title: 'Accessible Luxury (Coach, Kate Spade)', value: 'accessible'},
          {title: 'Contemporary (The Row, Totême)', value: 'contemporary'},
        ],
      },
    }),
    defineField({
      name: 'foundedYear',
      title: 'Founded Year',
      type: 'number',
    }),
    defineField({
      name: 'headquarters',
      title: 'Headquarters',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
      subtitle: 'tier',
    },
  },
})
