package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"strings"
	"time"

	"analyze_item/models"

	"golang.org/x/sync/errgroup"
	"google.golang.org/genai"
)

const (
	maxSearchKeywords = 2
	maxURLsPerKeyword = 5
)

const analyzePrompt = `Analyze this luxury fashion item.
Return JSON only, no markdown or extra text:
{
"brand":"",
"model":"",
"color":"",
"material":"",
"category":"",
"search_keywords":[],
"similar_style_keywords":[]
}`

const searchProductsPromptTemplate = `Search for luxury fashion products matching this keyword: "%s"

Use Google Search to find direct product page URLs on ( farfetch.com, ssense.com, carousell.com, mytheresa.com).

Return JSON only, no markdown or extra text:
{"results":[{"site":"www.example.com","keyword_used":"%s","product_url":"https://..."}]}

Return at most 5 top direct product page URLs, ranked by relevance.
The keyword_used field must be exactly "%s".`

type GeminiService struct {
	client *genai.Client
	model  string
}

func NewGeminiService(apiKey string) (*GeminiService, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("create gemini client: %w", err)
	}

	return &GeminiService{
		client: client,
		model:  "gemini-2.5-flash",
	}, nil
}

func (s *GeminiService) AnalyzeImage(ctx context.Context, imageData []byte, mimeType string) (*models.LuxuryItemAnalysis, error) {
	start := time.Now()
	defer func() {
		log.Printf("[timing] gemini analyze image: %s", time.Since(start))
	}()

	parts := []*genai.Part{
		{Text: analyzePrompt},
		{InlineData: &genai.Blob{Data: imageData, MIMEType: mimeType}},
	}

	contents := []*genai.Content{{Parts: parts}}

	resp, err := s.client.Models.GenerateContent(ctx, s.model, contents, &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
	})
	if err != nil {
		return nil, fmt.Errorf("gemini generate content: %w", err)
	}

	text := strings.TrimSpace(resp.Text())
	if text == "" {
		return nil, fmt.Errorf("gemini returned empty response")
	}

	text = stripJSONMarkdown(text)

	var result models.LuxuryItemAnalysis
	if err := json.Unmarshal([]byte(text), &result); err != nil {
		return nil, fmt.Errorf("parse gemini json: %w (raw: %s)", err, text)
	}

	return &result, nil
}

func (s *GeminiService) SearchProducts(ctx context.Context, searchKeywords, similarStyleKeywords []string) ([]models.ProductSearchResult, error) {
	keywords := selectTopKeywords(searchKeywords, similarStyleKeywords)
	if len(keywords) == 0 {
		return []models.ProductSearchResult{}, nil
	}

	start := time.Now()
	log.Printf("[timing] search products start: %d keyword(s) %v", len(keywords), keywords)

	g, gctx := errgroup.WithContext(ctx)
	resultsByIndex := make([][]models.ProductSearchResult, len(keywords))

	for i, keyword := range keywords {
		i, keyword := i, keyword
		g.Go(func() error {
			kwStart := time.Now()
			results, err := s.searchByKeyword(gctx, keyword)
			if err != nil {
				return fmt.Errorf("search keyword %q: %w", keyword, err)
			}
			resultsByIndex[i] = limitResults(results, maxURLsPerKeyword)
			log.Printf("[timing] search keyword %q: %d result(s) in %s", keyword, len(resultsByIndex[i]), time.Since(kwStart))
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		return nil, err
	}

	var allResults []models.ProductSearchResult
	seenURLs := make(map[string]struct{})
	for _, batch := range resultsByIndex {
		for _, result := range batch {
			if result.ProductURL == "" {
				continue
			}
			if _, exists := seenURLs[result.ProductURL]; exists {
				continue
			}
			seenURLs[result.ProductURL] = struct{}{}
			allResults = append(allResults, result)
		}
	}

	log.Printf("[timing] search products total: %d result(s) in %s", len(allResults), time.Since(start))
	return allResults, nil
}

func (s *GeminiService) searchByKeyword(ctx context.Context, keyword string) ([]models.ProductSearchResult, error) {
	prompt := fmt.Sprintf(searchProductsPromptTemplate, keyword, keyword, keyword)
	contents := []*genai.Content{{Parts: []*genai.Part{{Text: prompt}}}}

	resp, err := s.client.Models.GenerateContent(ctx, s.model, contents, &genai.GenerateContentConfig{
		Tools: []*genai.Tool{
			{GoogleSearch: &genai.GoogleSearch{}},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("gemini generate content: %w", err)
	}

	groundingResults := extractGroundingResults(resp, keyword)
	textResults := parseSearchResultsFromText(resp.Text(), keyword)

	merged := mergeSearchResults(groundingResults, textResults)
	return limitResults(merged, maxURLsPerKeyword), nil
}

func selectTopKeywords(searchKeywords, similarStyleKeywords []string) []string {
	keywords := uniqueNonEmptyKeywords(searchKeywords, similarStyleKeywords)
	if len(keywords) > maxSearchKeywords {
		return keywords[:maxSearchKeywords]
	}
	return keywords
}

func limitResults(results []models.ProductSearchResult, max int) []models.ProductSearchResult {
	if len(results) <= max {
		return results
	}
	return results[:max]
}

func uniqueNonEmptyKeywords(searchKeywords, similarStyleKeywords []string) []string {
	seen := make(map[string]struct{})
	keywords := make([]string, 0, len(searchKeywords)+len(similarStyleKeywords))

	for _, keyword := range append(append([]string{}, searchKeywords...), similarStyleKeywords...) {
		keyword = strings.TrimSpace(keyword)
		if keyword == "" {
			continue
		}
		if _, exists := seen[keyword]; exists {
			continue
		}
		seen[keyword] = struct{}{}
		keywords = append(keywords, keyword)
	}

	return keywords
}

type searchProductsResponse struct {
	Results []models.ProductSearchResult `json:"results"`
}

func parseSearchResultsFromText(text, keyword string) []models.ProductSearchResult {
	jsonText := extractJSONFromText(text)
	if jsonText == "" {
		return nil
	}

	var parsed searchProductsResponse
	if err := json.Unmarshal([]byte(jsonText), &parsed); err != nil {
		return nil
	}

	results := make([]models.ProductSearchResult, 0, len(parsed.Results))
	for _, result := range parsed.Results {
		normalized := normalizeSearchResult(result, keyword)
		if normalized.ProductURL == "" {
			continue
		}
		results = append(results, normalized)
	}

	return results
}

func extractGroundingResults(resp *genai.GenerateContentResponse, keyword string) []models.ProductSearchResult {
	if resp == nil {
		return nil
	}

	var results []models.ProductSearchResult
	for _, candidate := range resp.Candidates {
		if candidate == nil || candidate.GroundingMetadata == nil {
			continue
		}

		for _, chunk := range candidate.GroundingMetadata.GroundingChunks {
			if chunk == nil || chunk.Web == nil {
				continue
			}

			productURL := strings.TrimSpace(chunk.Web.URI)
			if productURL == "" {
				continue
			}

			site := strings.TrimSpace(chunk.Web.Domain)
			if site == "" {
				site = siteFromURL(productURL)
			}

			results = append(results, models.ProductSearchResult{
				Site:        site,
				KeywordUsed: keyword,
				ProductURL:  productURL,
			})
		}
	}

	return results
}

func mergeSearchResults(primary, secondary []models.ProductSearchResult) []models.ProductSearchResult {
	seen := make(map[string]struct{})
	merged := make([]models.ProductSearchResult, 0, len(primary)+len(secondary))

	for _, batch := range [][]models.ProductSearchResult{primary, secondary} {
		for _, result := range batch {
			normalized := normalizeSearchResult(result, result.KeywordUsed)
			if normalized.ProductURL == "" {
				continue
			}
			if _, exists := seen[normalized.ProductURL]; exists {
				continue
			}
			seen[normalized.ProductURL] = struct{}{}
			merged = append(merged, normalized)
		}
	}

	return merged
}

func normalizeSearchResult(result models.ProductSearchResult, keyword string) models.ProductSearchResult {
	productURL := strings.TrimSpace(result.ProductURL)
	if productURL == "" {
		return models.ProductSearchResult{}
	}

	site := strings.TrimSpace(result.Site)
	if site == "" {
		site = siteFromURL(productURL)
	}

	keywordUsed := strings.TrimSpace(result.KeywordUsed)
	if keywordUsed == "" {
		keywordUsed = keyword
	}

	return models.ProductSearchResult{
		Site:        site,
		KeywordUsed: keywordUsed,
		ProductURL:  productURL,
	}
}

func siteFromURL(rawURL string) string {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return ""
	}
	return parsed.Host
}

func extractJSONFromText(text string) string {
	text = stripJSONMarkdown(strings.TrimSpace(text))
	if text == "" {
		return ""
	}
	if json.Valid([]byte(text)) {
		return text
	}

	start := strings.Index(text, "{")
	end := strings.LastIndex(text, "}")
	if start >= 0 && end > start {
		candidate := text[start : end+1]
		if json.Valid([]byte(candidate)) {
			return candidate
		}
	}

	return ""
}

func stripJSONMarkdown(text string) string {
	text = strings.TrimSpace(text)
	if strings.HasPrefix(text, "```") {
		text = strings.TrimPrefix(text, "```json")
		text = strings.TrimPrefix(text, "```")
		text = strings.TrimSuffix(text, "```")
		text = strings.TrimSpace(text)
	}
	return text
}
