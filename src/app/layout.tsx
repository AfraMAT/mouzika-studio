import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Mouzika Studio — learn music production the modern way',
  description:
    'Interactive, browser-based electronic music production lessons you learn by doing — beats, sound design, mixing, mastering, and the AI workflow the pros actually use. With an AI tutor, spaced repetition, and feedback on your own tracks.',
  applicationName: 'Mouzika Studio',
  authors: [{ name: 'Mouzika Studio' }],
  keywords: ['music production', 'electronic music', 'EDM', 'Tone.js', 'learn to produce', 'AI music', 'mixing', 'mastering'],
  openGraph: {
    title: 'Mouzika Studio',
    description: 'Go from zero to a finished track — the modern, interactive way.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0b10',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..0&display=block"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
