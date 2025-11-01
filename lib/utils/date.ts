// Date formatting utilities

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options || defaultOptions);
}

export function formatDateLong(dateString: string): string {
  return formatDate(dateString, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateShort(dateString: string): string {
  return formatDate(dateString, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}
