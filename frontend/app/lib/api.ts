import type { AnalyzeResponse } from "@/app/types/analysis";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function analyzeImage(file: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("image", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Không kết nối được backend. Hãy chạy server Go và thử lại.",
    );
  }

  if (!response.ok) {
    let message = "Phân tích ảnh thất bại";
    try {
      const body = await response.json();
      if (typeof body?.error === "string") {
        message = body.error;
      }
    } catch {
      message = (await response.text()) || message;
    }
    throw new Error(message);
  }

  const data = (await response.json()) as AnalyzeResponse;

  if (!data.analysis) {
    throw new Error("Backend trả về dữ liệu không hợp lệ (thiếu analysis).");
  }

  return {
    analysis: data.analysis,
    results: data.results ?? [],
  };
}
