export interface LuxuryItemAnalysis {
  brand: string;
  model: string;
  color: string;
  material: string;
  category: string;
  search_keywords: string[];
  similar_style_keywords: string[];
}

export interface ProductSearchResult {
  site: string;
  keyword_used: string;
  product_url: string;
}

export interface AnalyzeResponse {
  analysis: LuxuryItemAnalysis;
  results: ProductSearchResult[];
}
