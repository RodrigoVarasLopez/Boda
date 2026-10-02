import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Stephanie & Rodrigo — Nuestra Boda',
  description: 'Plataforma y Concierge Digital de Boda para Stephanie & Rodrigo · 25 de Agosto de 2027',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${cormorant.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="bg-bg-primary text-text-primary min-h-screen font-sans antialiased selection:bg-brand-sand selection:text-brand-ink">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
