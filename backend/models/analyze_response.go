package models

type ProductSearchResult struct {
	Site        string `json:"site"`
	KeywordUsed string `json:"keyword_used"`
	ProductURL  string `json:"product_url"`
}

type AnalyzeResponse struct {
	Analysis *LuxuryItemAnalysis   `json:"analysis"`
	Results  []ProductSearchResult `json:"results"`
}
