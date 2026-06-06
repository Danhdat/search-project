"use client";

import { useCallback, useRef, useState } from "react";
import { analyzeImage } from "@/app/lib/api";
import type { AnalyzeResponse } from "@/app/types/analysis";
import { Footer } from "@/app/components/layout/Footer";
import { Header } from "@/app/components/layout/Header";
import { AnalysisResults } from "./AnalysisResults";
import { UploadSection } from "./UploadSection";

export function CombinedAnalysisView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisData(null);
    setError(null);
  }, []);

  const handleRemove = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisData(null);
    setError(null);
  }, [previewUrl]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeImage(selectedFile);
      setAnalysisData(result);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Phân tích thất bại";
      setError(message === "Load failed" ? "Không kết nối được backend (CORS hoặc server chưa chạy)." : message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile]);

  return (
    <>
      <Header />
      <main className="flex-grow w-full">
        <UploadSection
          previewUrl={previewUrl}
          isAnalyzing={isAnalyzing}
          onFileSelect={handleFileSelect}
          onRemove={handleRemove}
          onAnalyze={handleAnalyze}
        />

        {error && (
          <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop mb-stack-md">
            <p className="text-error text-body-md font-body-md text-center">
              {error}
            </p>
          </div>
        )}

        {analysisData && previewUrl && (
          <div ref={resultsRef}>
            <AnalysisResults data={analysisData} previewUrl={previewUrl} />
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
