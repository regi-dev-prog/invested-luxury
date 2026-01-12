import { ExternalLink } from 'lucide-react';

interface Spec {
  label: string;
  value: string;
}

interface Retailer {
  name: string;
  url: string;
  isResale?: boolean;
}

interface ProductSpecsBoxProps {
  productName: string;
  specs?: Spec[];
  retailers?: Retailer[];
  resaleRetailers?: Retailer[];
  lastUpdated?: string;
}

export default function ProductSpecsBox({
  productName,
  specs = [],
  retailers = [],
  resaleRetailers = [],
  lastUpdated,
}: ProductSpecsBoxProps) {
  // Safety check - don't render if no specs and no retailers
  if ((!specs || specs.length === 0) && (!retailers || retailers.length === 0)) {
    return null;
  }

  return (
    <div id="where-to-buy" className="bg-[#FAF9F6] border border-gray-200 p-6 md:p-8 my-12">
      <h3 className="font-serif text-2xl text-black mb-6">{productName}</h3>
      
      {/* Specs Grid */}
      {specs && specs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {specs.map((spec, i) => (
            <div key={i} className="border-l-2 border-[#C9A227] pl-3">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{spec.label}</p>
              <p className="text-sm text-black font-medium">{spec.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Where to Buy */}
      {retailers && retailers.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
            Where to Buy
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {retailers.map((retailer, i) => (
              <a
                key={i}
                href={retailer.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center justify-between px-4 py-3 bg-black text-white hover:bg-[#C9A227] transition-colors"
              >
                <span className="font-medium">{retailer.name}</span>
                <ExternalLink size={16} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Resale Options */}
      {resaleRetailers && resaleRetailers.length > 0 && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
            Resale Options
          </h4>
          <div className="flex flex-wrap gap-3">
            {resaleRetailers.map((retailer, i) => (
              <a
                key={i}
                href={retailer.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:border-black hover:text-black transition-colors text-sm"
              >
                {retailer.name}
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
          Last updated: {lastUpdated}
        </p>
      )}
    </div>
  );
}