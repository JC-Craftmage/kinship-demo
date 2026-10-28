'use client';

// The "Demo data" banner.
//
// Demo mode serves fixtures from `data/` instead of the database. The one
// rule that makes demo mode safe is that nobody can mistake it for real: if
// the server says it is serving demo data, every board shows this banner.
//
// The banner is driven by the `demo` flag on the API response, never by a
// client-side guess. If the server is serving real data, no banner appears.

export function DemoBanner({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border-2 border-amber-400 bg-amber-100 px-4 py-3 text-amber-900 ${className}`}
    >
      <p className="text-sm font-semibold">
        <span className="mr-2 inline-block rounded-md bg-amber-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          Demo data
        </span>
        You are looking at sample content, not your church&rsquo;s real information.
        Nothing on these boards is saved.
      </p>
    </div>
  );
}
