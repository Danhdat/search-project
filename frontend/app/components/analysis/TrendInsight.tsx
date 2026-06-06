import type { LuxuryItemAnalysis } from "@/app/types/analysis";

interface TrendInsightProps {
  analysis: LuxuryItemAnalysis;
}

export function TrendInsight({ analysis }: TrendInsightProps) {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row items-center gap-12 border-t border-outline-variant">
      <div className="flex-1 space-y-6">
        <h2 className="text-headline-md font-headline-md">
          The Analysis Perspective
        </h2>
        <p className="text-body-md font-body-md text-on-surface-variant">
          Our AI-driven sentiment analysis identified {analysis.brand}{" "}
          {analysis.model} as a leading {analysis.category} in the{" "}
          {analysis.color} {analysis.material} segment. Keywords such as{" "}
          {analysis.search_keywords.slice(0, 2).join(", ")} indicate strong
          alignment with current luxury market trends.
        </p>
        <div className="pt-4">
          <button
            type="button"
            className="text-label-sm font-label-sm uppercase tracking-widest border-b border-primary pb-1 hover:opacity-60 transition-opacity"
          >
            Read Full Market Trend Report
          </button>
        </div>
      </div>
      <div className="flex-1 bg-surface-container p-12 w-full">
        <div className="aspect-video bg-white overflow-hidden asymmetric-image-border relative flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant">
            insights
          </span>
        </div>
      </div>
    </section>
  );
}
