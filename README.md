# InvestedLuxury.com

A luxury affiliate marketing website positioned as an editorial platform focused on "investment pieces" in luxury fashion and lifestyle.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **CMS:** Sanity.io
- **Hosting:** Vercel
- **Styling:** TailwindCSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Sanity.io account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/regi-dev-prog/invested-luxury.git
cd invested-luxury
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Sanity credentials.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/
│   ├── contact/
│   ├── privacy-policy/
│   ├── terms/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── cards/              # Article and Product cards
│   ├── layout/             # Header, Footer
│   ├── sections/           # Hero, etc.
│   ├── ui/                 # Buttons, inputs
│   └── index.ts
├── lib/                    # Utility functions
├── sanity/                 # Sanity client and queries
└── types/                  # TypeScript types
```

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Black | #000000 | Primary text, logo |
| White | #FFFFFF | Primary background |
| Cream | #FAF8F5 | Secondary background |
| Gold | #C9A962 | Accents, CTAs |
| Charcoal | #4A4A4A | Secondary text |

## Typography

- **Headlines:** Cormorant Garamond
- **Body Text:** Montserrat

## Deployment

The site is configured for automatic deployment to Vercel. Push to `main` to deploy.

## License

All rights reserved © InvestedLuxury 2025
