import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

function getMetadataBaseUrl(): string {
  if (
    process.env.NEXT_PUBLIC_SITE_URL &&
    !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
  ) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://stephanieyrodrigo.com';
}

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBaseUrl()),
  title: 'Rodrigo & Stephanie — Nuestra Boda',
  description: 'Rodrigo & Stephanie · 28 de agosto de 2027 · Villamuriel de Cerrato, Palencia',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="mediterranean" className={`${cormorant.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="bg-bg-primary text-text-primary min-h-screen font-sans antialiased selection:bg-brand-sand selection:text-brand-ink">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
