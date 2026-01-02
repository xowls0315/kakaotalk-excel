"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center text-gray-500">
      <span className="mb-3 text-4xl sm:text-5xl">{icon}</span>
      <p className="text-sm sm:text-base font-medium text-gray-600">{title}</p>
      {description && (
        <p className="mt-1 text-xs sm:text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

