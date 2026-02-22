export const metadata = {
  title: 'Affiliate Disclosure | InvestedLuxury',
  description: 'How InvestedLuxury.com earns money through affiliate partnerships and our commitment to editorial integrity.',
  alternates: {
    canonical: 'https://investedluxury.com/affiliate-disclosure',
  },
}

export default function AffiliateDisclosurePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Affiliate Disclosure</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: December 2025</p>

      <div className="bg-stone-100 border border-stone-200 rounded-lg p-6 mb-10">
        <h2 className="text-lg font-semibold mb-3">The Short Version</h2>
        <p className="text-stone-700">
          <strong>InvestedLuxury.com earns money through affiliate links.</strong> When you click 
          a link to a product on our site and make a purchase, we may earn a commission. This 
          comes at absolutely no extra cost to you—the price you pay is the same whether you 
          use our link or go directly to the retailer.
        </p>
      </div>

      <section className="prose prose-lg max-w-none">
        <h2>How We Make Money</h2>
        <p>
          InvestedLuxury.com is an independently owned website. To keep our content free and 
          accessible, we participate in affiliate marketing programs with luxury retailers and 
          affiliate networks.
        </p>
        <p><strong>Our affiliate partners include:</strong></p>
        <ul>
          <li>AWIN (Net-a-Porter, Mr Porter, and others)</li>
          <li>Rakuten Advertising</li>
          <li>Farfetch Partners</li>
          <li>Impact (SSENSE and others)</li>
          <li>Direct brand affiliate programs</li>
        </ul>

        <h2>What This Means For You</h2>
        <p>
          <strong>You pay nothing extra.</strong> The commission comes from the retailer, not 
          from you. The price you pay is identical whether you click through our link or go 
          directly to the store.
        </p>
        <p>
          <strong>We only recommend products we believe in.</strong> Our editorial integrity is 
          non-negotiable. We will never recommend a product solely because it offers a higher 
          commission.
        </p>

        <h2>Our Editorial Standards</h2>
        <ol>
          <li><strong>Honest reviews.</strong> If a product has flaws, we will tell you.</li>
          <li><strong>No pay-for-play.</strong> We do not accept payment for positive reviews.</li>
          <li><strong>Commission rates do not influence coverage.</strong> We recommend based on quality, not commission.</li>
        </ol>

        <h2>FTC Compliance</h2>
        <p>
          This disclosure is made in accordance with the Federal Trade Commission guidelines. 
          Our material connection: <strong>We may earn a commission if you purchase through our links.</strong>
        </p>

        <h2>Questions?</h2>
        <p>Email us at: <strong>hello@investedluxury.com</strong></p>
      </section>
    </main>
  )
}