package controllers

import (
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"strings"

	"analyze_item/services"
)

type AnalyzeController struct {
	analyzeService *services.AnalyzeService
}

func NewAnalyzeController(analyzeService *services.AnalyzeService) *AnalyzeController {
	return &AnalyzeController{analyzeService: analyzeService}
}

func (c *AnalyzeController) AnalyzeImage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	if err := r.ParseMultipartForm(32 << 20); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid multipart form"})
		return
	}

	header, err := getUploadedFile(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	result, err := c.analyzeService.AnalyzeUploadedImage(r.Context(), header)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, result)
}

func getUploadedFile(r *http.Request) (*multipart.FileHeader, error) {
	for _, field := range []string{"image", "file"} {
		_, header, err := r.FormFile(field)
		if err == nil {
			return header, nil
		}
	}

	if path := strings.TrimSpace(r.FormValue("image")); path != "" {
		return nil, fmt.Errorf(
			"field 'image' đang gửi dạng Text (đường dẫn: %q). Trong Postman: Body → form-data → key='image' → đổi type sang File (không phải Text) → bấm Select Files chọn ảnh",
			path,
		)
	}

	fields := make([]string, 0, len(r.MultipartForm.File))
	for name := range r.MultipartForm.File {
		fields = append(fields, name)
	}

	if len(fields) == 0 {
		return nil, fmt.Errorf(
			"không tìm thấy file upload. Trong Postman: Body → form-data → key='image' → type=File → chọn ảnh từ máy (không dán đường dẫn vào ô Text)",
		)
	}

	return nil, fmt.Errorf(
		"không tìm thấy field 'image'. Các field file nhận được: %v. Hãy đổi key thành 'image' và type thành File",
		fields,
	)
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
