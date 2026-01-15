// lib/queries/featuredProducts.ts
// GROQ queries for the "Currently Coveting" section

import { groq } from 'next-sanity'

// Fetch all active featured products, ordered by displayOrder
export const featuredProductsQuery = groq`
  *[_type == "featuredProduct" && isActive == true] | order(displayOrder asc) {
    _id,
    name,
    brand,
    price,
    currency,
    image {
      asset,
      alt
    },
    imageUrl,
    affiliateUrl,
    retailer,
    category
  }
`

// Fetch featured products with date filtering (for scheduled products)
export const featuredProductsWithDateQuery = groq`
  *[_type == "featuredProduct" 
    && isActive == true 
    && (startDate == null || startDate <= now())
    && (endDate == null || endDate >= now())
  ] | order(displayOrder asc) {
    _id,
    name,
    brand,
    price,
    currency,
    image {
      asset,
      alt
    },
    imageUrl,
    affiliateUrl,
    retailer,
    category
  }
`

// Fetch featured products by category
export const featuredProductsByCategoryQuery = groq`
  *[_type == "featuredProduct" 
    && isActive == true 
    && category == $category
  ] | order(displayOrder asc) {
    _id,
    name,
    brand,
    price,
    currency,
    image {
      asset,
      alt
    },
    imageUrl,
    affiliateUrl,
    retailer,
    category
  }
`

// Fetch limited number of featured products (for homepage)
export const featuredProductsLimitedQuery = groq`
  *[_type == "featuredProduct" && isActive == true] | order(displayOrder asc) [0...$limit] {
    _id,
    name,
    brand,
    price,
    currency,
    image {
      asset,
      alt
    },
    imageUrl,
    affiliateUrl,
    retailer,
    category
  }
`

// Fetch featured products by retailer
export const featuredProductsByRetailerQuery = groq`
  *[_type == "featuredProduct" 
    && isActive == true 
    && retailer == $retailer
  ] | order(displayOrder asc) {
    _id,
    name,
    brand,
    price,
    currency,
    image {
      asset,
      alt
    },
    imageUrl,
    affiliateUrl,
    retailer,
    category
  }
`
