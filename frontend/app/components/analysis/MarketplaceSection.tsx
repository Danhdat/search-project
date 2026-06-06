import type { ProductSearchResult } from "@/app/types/analysis";

interface MarketplaceSectionProps {
  results: ProductSearchResult[];
}

function formatSiteName(site: string) {
  return site.replace(/^www\./, "").split(".")[0];
}

export function MarketplaceSection({ results }: MarketplaceSectionProps) {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg border-t border-outline-variant">
      <div className="flex justify-between items-end mb-12">
        <div>
          <span className="text-label-sm font-label-sm text-on-surface-variant mb-2 block uppercase">
            Market Availability
          </span>
          <h2 className="text-headline-md font-headline-md text-primary">
            Where to Buy
          </h2>
        </div>
        <div className="text-on-surface-variant text-label-sm font-label-sm">
          {results.length} Active Listings Found
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {results.map((result) => (
          <div
            key={`${result.site}-${result.product_url}`}
            className="group bg-surface-container-lowest border border-outline-variant p-6 hover:border-primary transition-all duration-300 flex flex-col justify-between aspect-square"
          >
            <div>
              <span className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-4 block">
                {result.keyword_used}
              </span>
              <h4 className="text-headline-sm font-headline-sm mb-2 capitalize">
                {formatSiteName(result.site)}
              </h4>
            </div>
            <a
              className="flex items-center justify-between text-label-sm font-label-sm uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform"
              href={result.product_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Shop Now
              <span className="material-symbols-outlined">north_east</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
