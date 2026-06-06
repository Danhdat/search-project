import type { LuxuryItemAnalysis } from "@/app/types/analysis";

interface ProductShowcaseProps {
  analysis: LuxuryItemAnalysis;
  previewUrl: string;
}

export function ProductShowcase({ analysis, previewUrl }: ProductShowcaseProps) {
  const title = [analysis.brand, analysis.model].filter(Boolean).join(" ");

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg border-t border-outline-variant grid grid-cols-1 md:grid-cols-12 gap-gutter">
      <div className="md:col-span-5 flex flex-col justify-center order-2 md:order-1">
        <span className="text-label-sm font-label-sm text-on-surface-variant mb-4 tracking-widest uppercase">
          Analysis Result
        </span>
        <h2 className="text-display-lg font-display-lg text-primary mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-body-lg font-body-lg text-on-surface-variant mb-8 max-w-md capitalize">
          {analysis.color} {analysis.material} {analysis.category} from{" "}
          {analysis.brand}. AI-identified luxury composition with editorial-grade
          metadata extraction.
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            className="bg-primary text-on-primary px-8 py-4 text-label-sm font-label-sm uppercase tracking-widest hover:bg-surface-tint transition-all"
          >
            Request Report
          </button>
          <button
            type="button"
            className="border border-primary text-primary px-8 py-4 text-label-sm font-label-sm uppercase tracking-widest hover:bg-surface-container-low transition-all"
          >
            Save to Archive
          </button>
        </div>
      </div>
      <div className="md:col-span-7 order-1 md:order-2">
        <div className="relative aspect-[4/5] bg-surface-container-lowest asymmetric-image-border overflow-hidden p-8 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
            src={previewUrl}
          />
        </div>
      </div>
    </section>
  );
}
