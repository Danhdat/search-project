package services

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"analyze_item/models"
)

const uploadsDir = "uploads"

type AnalyzeService struct {
	gemini *GeminiService
}

func NewAnalyzeService(gemini *GeminiService) *AnalyzeService {
	return &AnalyzeService{gemini: gemini}
}

func (s *AnalyzeService) AnalyzeUploadedImage(ctx context.Context, fileHeader *multipart.FileHeader) (*models.AnalyzeResponse, error) {
	totalStart := time.Now()
	defer func() {
		log.Printf("[timing] analyze request total: %s", time.Since(totalStart))
	}()

	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return nil, fmt.Errorf("create uploads dir: %w", err)
	}

	file, err := fileHeader.Open()
	if err != nil {
		return nil, fmt.Errorf("open uploaded file: %w", err)
	}
	defer file.Close()

	imageData, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("read uploaded file: %w", err)
	}

	ext := filepath.Ext(fileHeader.Filename)
	if ext == "" {
		ext = ".jpg"
	}
	savedName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savedPath := filepath.Join(uploadsDir, savedName)

	if err := os.WriteFile(savedPath, imageData, 0644); err != nil {
		return nil, fmt.Errorf("save uploaded file: %w", err)
	}
	log.Printf("[timing] upload and save file: %s", time.Since(totalStart))

	mimeType := fileHeader.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = detectMIMEType(ext)
	}

	analyzeStart := time.Now()
	analysis, err := s.gemini.AnalyzeImage(ctx, imageData, mimeType)
	if err != nil {
		return nil, err
	}
	log.Printf("[timing] analyze image step: %s", time.Since(analyzeStart))

	searchStart := time.Now()
	results, err := s.gemini.SearchProducts(ctx, analysis.SearchKeywords, analysis.SimilarStyleKeywords)
	if err != nil {
		return nil, fmt.Errorf("search products: %w", err)
	}
	log.Printf("[timing] search products step: %s", time.Since(searchStart))

	return &models.AnalyzeResponse{
		Analysis: analysis,
		Results:  results,
	}, nil
}

func detectMIMEType(ext string) string {
	switch strings.ToLower(ext) {
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	case ".gif":
		return "image/gif"
	default:
		return "image/jpeg"
	}
}
