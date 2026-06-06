import type { AnalyzeResponse } from "@/app/types/analysis";
import { MarketplaceSection } from "./MarketplaceSection";
import { MetadataCards } from "./MetadataCards";
import { ProductShowcase } from "./ProductShowcase";
import { TagClouds } from "./TagClouds";
import { TrendInsight } from "./TrendInsight";

interface AnalysisResultsProps {
  data: AnalyzeResponse;
  previewUrl: string;
}

export function AnalysisResults({ data, previewUrl }: AnalysisResultsProps) {
  return (
    <div className="space-y-0">
      <ProductShowcase analysis={data.analysis} previewUrl={previewUrl} />
      <MetadataCards analysis={data.analysis} />
      <TagClouds analysis={data.analysis} />
      {data.results.length > 0 && (
        <MarketplaceSection results={data.results} />
      )}
      <TrendInsight analysis={data.analysis} />
    </div>
  );
}
