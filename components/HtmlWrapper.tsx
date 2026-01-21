'use client';

import { useTheme } from 'next-themes';
import { GeistSans } from 'geist/font';
import { useEffect, useState } from 'react';

export function HtmlWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const htmlClass = `${GeistSans.className} ${mounted && theme === 'dark' ? 'dark' : ''}`;

  return <html lang="en" className={htmlClass} suppressHydrationWarning>{children}</html>;
}