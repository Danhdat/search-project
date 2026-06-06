import type { LuxuryItemAnalysis } from "@/app/types/analysis";

interface MetadataCardsProps {
  analysis: LuxuryItemAnalysis;
}

const fields: { key: keyof LuxuryItemAnalysis; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "color", label: "Colorway" },
  { key: "material", label: "Composition" },
  { key: "category", label: "Classification" },
];

export function MetadataCards({ analysis }: MetadataCardsProps) {
  return (
    <section className="bg-surface-container-low py-stack-lg border-y border-outline-variant/30">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {fields.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-2">
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase">
              {label}
            </span>
            <span className="text-headline-sm font-headline-sm text-primary capitalize">
              {String(analysis[key])}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
