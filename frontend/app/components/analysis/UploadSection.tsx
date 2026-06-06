"use client";

import { useCallback, useRef, useState } from "react";

interface UploadSectionProps {
  previewUrl: string | null;
  isAnalyzing: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  onAnalyze: () => void;
}

export function UploadSection({
  previewUrl,
  isAnalyzing,
  onFileSelect,
  onRemove,
  onAnalyze,
}: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  return (
    <section className="flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto w-full">
      <div className="w-full max-w-4xl text-center mb-stack-lg">
        <span className="text-label-sm font-label-sm text-outline tracking-[0.2em] uppercase block mb-stack-sm">
          Intelligent Curation
        </span>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-stack-sm">
          Upload for Analysis
        </h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Our AI-driven engine dissects silhouettes, textile textures, and
          cultural relevance to provide editorial-grade insights.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        className={`w-full max-w-4xl aspect-[16/9] md:aspect-[21/9] bg-surface-container-lowest upload-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer group relative ${
          isDragging ? "bg-surface-container-high" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <div className="flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-2">
          <div className="w-16 h-16 rounded-full border border-outline-variant flex items-center justify-center mb-stack-md group-hover:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline group-hover:text-primary">
              add_photo_alternate
            </span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">
            Drag &amp; Drop Imagery
          </p>
          <p className="font-body-md text-body-md text-outline">
            or click to browse archives
          </p>
        </div>

        {previewUrl && (
          <div className="absolute inset-0 bg-surface z-10 p-stack-sm">
            <div className="w-full h-full relative overflow-hidden border border-outline-variant">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Preview"
                className="w-full h-full object-contain"
                src={previewUrl}
              />
              <button
                type="button"
                className="absolute top-4 right-4 bg-primary text-on-primary w-10 h-10 flex items-center justify-center hover:bg-on-surface-variant transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between mt-stack-md gap-stack-md">
        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 bg-surface-container-high border border-outline-variant text-label-sm font-label-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">info</span>
            MAX FILE SIZE: 25MB
          </div>
          <div className="px-4 py-2 bg-surface-container-high border border-outline-variant text-label-sm font-label-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">
              check_circle
            </span>
            HI-RES RECOMMENDED
          </div>
        </div>
        <button
          type="button"
          className="w-full md:w-auto px-12 py-5 bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest hover:bg-on-surface-variant transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={!previewUrl || isAnalyzing}
          onClick={onAnalyze}
        >
          {isAnalyzing ? "Analyzing Metadata..." : "Analyze Composition"}
        </button>
      </div>
    </section>
  );
}
