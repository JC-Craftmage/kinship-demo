'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('kinship-theme') ||
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.classList.toggle('dark', theme === 'dark');
            })();
          `,
        }}
      />
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      storageKey="kinship-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
