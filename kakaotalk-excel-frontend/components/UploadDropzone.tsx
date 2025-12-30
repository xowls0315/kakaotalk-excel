"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

interface UploadDropzoneProps {
  onUploadSuccess?: (file: File) => void;
}

export default function UploadDropzone({
  onUploadSuccess,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".txt")) {
        setError("카카오톡에서 내보낸 .txt 파일만 사용할 수 있어요.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("파일이 조금 커요. 10MB 이하로 부탁드려요.");
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
          setError("파일을 읽는 중에 문제가 생겼어요.");
          setIsUploading(false);
        };
        reader.readAsText(file, "UTF-8");
      } catch (error) {
        console.error("File upload error:", error);
        setError("업로드 중 문제가 발생했어요. 다시 시도해주세요.");
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
      if (file) handleFile(file);
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
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative
          rounded-2xl
          border-2
          border-dashed
          p-12
          text-center
          transition
          ${
            isDragging
              ? "border-[#3FAF8E] bg-[#EAF7F2]"
              : "border-[#FBE27A] bg-white hover:bg-[#FFFDF0]"
          }
          ${isUploading ? "pointer-events-none opacity-60" : "cursor-pointer"}
        `}
      >
        <input
          type="file"
          accept=".txt"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />

        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="mb-4 text-6xl">📤</div>

          <h3 className="mb-2 text-xl font-semibold text-[#2F2F2F]">
            {isUploading
              ? "잠시만요, 파일 읽는 중이에요…"
              : "여기에 파일을 끌어오거나 눌러서 선택하세요"}
          </h3>

          <p className="text-sm text-gray-600">
            카카오톡에서 내보낸 <strong>.txt</strong> 파일이면 바로 돼요
          </p>

          {isUploading && (
            <div className="mt-6">
              <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-[#FFF3C4]">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-[#FBE27A]" />
              </div>
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
