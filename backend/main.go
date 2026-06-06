package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"analyze_item/controllers"
	"analyze_item/routes"
	"analyze_item/services"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Overload(); err != nil {
		log.Printf("warning: load .env: %v", err)
	}

	apiKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY is required in .env")
	}

	geminiService, err := services.NewGeminiService(apiKey)
	if err != nil {
		log.Fatalf("init gemini service: %v", err)
	}

	analyzeService := services.NewAnalyzeService(geminiService)
	analyzeController := controllers.NewAnalyzeController(analyzeService)

	handler := routes.Setup(analyzeController)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on http://localhost:%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
