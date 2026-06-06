package models

type LuxuryItemAnalysis struct {
	Brand                 string   `json:"brand"`
	Model                 string   `json:"model"`
	Color                 string   `json:"color"`
	Material              string   `json:"material"`
	Category              string   `json:"category"`
	SearchKeywords        []string `json:"search_keywords"`
	SimilarStyleKeywords  []string `json:"similar_style_keywords"`
}
