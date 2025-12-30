/**
 * Download a blob as a file
 * Uses FileReader for small files to avoid blob URL security warnings in HTTP,
 * falls back to blob URL for large files
 */
export function downloadBlob(blob: Blob, filename: string): void {
  // For small files (< 10MB), use FileReader to avoid blob URL warnings
  // For large files, use blob URL (necessary for performance)
  const MAX_FILE_SIZE_FOR_READER = 10 * 1024 * 1024; // 10MB
  
  if (blob.size < MAX_FILE_SIZE_FOR_READER) {
    // Use FileReader for small files (avoids blob URL security warnings)
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const link = document.createElement("a");
        link.href = reader.result;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    reader.onerror = () => {
      // Fallback to blob URL if FileReader fails
      downloadWithBlobURL(blob, filename);
    };
    reader.readAsDataURL(blob);
  } else {
    // Use blob URL for large files (necessary for performance)
    downloadWithBlobURL(blob, filename);
  }
}

/**
 * Download using blob URL (for large files or fallback)
 */
function downloadWithBlobURL(blob: Blob, filename: string): void {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Clean up blob URL after download
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("Failed to download file:", error);
    alert("파일 다운로드 중 오류가 발생했습니다.");
  }
}

/**
 * Download file from URL (via fetch)
 */
export async function downloadFile(
  url: string,
  filename: string,
  options?: RequestInit
): Promise<void> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  const blob = await response.blob();
  downloadBlob(blob, filename);
}
