"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

interface UploadDropzoneProps {
  onUploadSuccess?: (file: File) => void;
}

export default function UploadDropzone({ onUploadSuccess }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".txt")) {
        setError("카카오톡 대화 내보내기 .txt 파일만 업로드 가능합니다.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("파일 크기는 10MB 이하여야 합니다.");
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          sessionStorage.setItem("uploadedFile", content);
          sessionStorage.setItem("uploadedFileName", file.name);
          
          onUploadSuccess?.(file);
          router.push("/preview");
        };
        reader.onerror = () => {
          setError("파일 읽기 중 오류가 발생했습니다.");
          setIsUploading(false);
        };
        reader.readAsText(file, "UTF-8");
      } catch (error) {
        console.error("File upload error:", error);
        setError("파일 업로드 중 오류가 발생했습니다.");
        setIsUploading(false);
      }
    },
    [router, onUploadSuccess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragging
            ? "border-sky-500 bg-sky-50"
            : "border-gray-300 bg-white hover:border-sky-300"
        } ${isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
      >
        <input
          type="file"
          accept=".txt"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <div className="mb-4 text-6xl">📤</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            {isUploading ? "업로드 중..." : "파일을 드래그하거나 클릭하여 업로드"}
          </h3>
          <p className="text-sm text-gray-600">
            카카오톡에서 내보낸 .txt 파일만 업로드 가능합니다
          </p>
          {isUploading && (
            <div className="mt-4">
              <div className="mx-auto h-2 w-48 animate-pulse rounded-full bg-sky-200"></div>
            </div>
          )}
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}

