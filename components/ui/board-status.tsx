'use client';

// Loading and error states for the database-backed boards.
//
// The boards read from the authenticated API routes under `app/api/*`. When a
// request fails the board has to say so: an empty board that looks like
// "nobody has posted anything yet" is a lie, and a demo recording is exactly
// the place where that kind of lie does the most damage.

export function BoardLoading({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="flex items-center justify-center py-16 text-gray-500"
      role="status"
      aria-live="polite"
    >
      <span
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 mr-3"
        aria-hidden="true"
      />
      <span>{label}…</span>
    </div>
  );
}

export function BoardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center"
      role="alert"
    >
      <p className="font-semibold text-red-800">Could not load this board</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
        >
          Try again
        </button>
      )}
    </div>
  );
}
