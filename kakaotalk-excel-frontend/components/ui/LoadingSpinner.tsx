"use client";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullHeight?: boolean;
}

export default function LoadingSpinner({
  message,
  size = "md",
  fullHeight = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const containerClass = fullHeight
    ? "flex min-h-[400px] items-center justify-center"
    : "flex items-center justify-center";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div
          className={`mb-4 inline-block animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent ${sizeClasses[size]}`}
        />
        {message && <p className="text-lg text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

