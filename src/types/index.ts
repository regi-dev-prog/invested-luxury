// Sanity Types
export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  caption?: string;
}

export interface Author {
  _id: string;
  name: string;
  slug: { current: string };
  image?: SanityImage;
  bio?: string;
  role?: string;
}

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  parent?: Category;
}

export interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: SanityImage;
  categories?: Category[];
  author?: Author;
  publishedAt: string;
  updatedAt?: string;
  body?: PortableTextBlock[];
  seo?: SEO;
  readTime?: number;
  featured?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  price?: number;
  currency?: string;
  image?: SanityImage;
  affiliateLink?: string;
  affiliateProgram?: string;
  description?: string;
}

export interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
  keywords?: string[];
}

// Portable Text Types
export interface PortableTextBlock {
  _type: string;
  _key: string;
  children?: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
  style?: string;
  level?: number;
  listItem?: string;
}

export interface PortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks?: string[];
}

export interface PortableTextMarkDef {
  _key: string;
  _type: string;
  href?: string;
  [key: string]: unknown;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// Component Props Types
export interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export interface ProductCardProps {
  product: Product;
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  image?: SanityImage;
  ctaText?: string;
  ctaLink?: string;
}
