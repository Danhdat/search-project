import type { LuxuryItemAnalysis } from "@/app/types/analysis";

interface TagCloudsProps {
  analysis: LuxuryItemAnalysis;
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-4 py-2 bg-surface border border-outline-variant text-label-sm font-label-sm rounded hover:border-primary cursor-pointer transition-colors"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function TagClouds({ analysis }: TagCloudsProps) {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      <div className="flex flex-col md:flex-row gap-16">
        <div className="flex-1">
          <h3 className="text-headline-sm font-headline-sm mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">search</span>
            Search Keywords
          </h3>
          <TagList tags={analysis.search_keywords} />
        </div>
        <div className="flex-1">
          <h3 className="text-headline-sm font-headline-sm mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              auto_awesome
            </span>
            Similar Styles
          </h3>
          <TagList tags={analysis.similar_style_keywords} />
        </div>
      </div>
    </section>
  );
}
