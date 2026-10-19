import type { Metadata, Viewport } from 'next';
import { SaveTheDateHero } from '@/components/save-the-date/SaveTheDateHero';
import { StorySection } from '@/components/save-the-date/StorySection';
import { DateSection } from '@/components/save-the-date/DateSection';
import { LocationSection } from '@/components/save-the-date/LocationSection';
import { FinalSection } from '@/components/save-the-date/FinalSection';
import { AmbientAudioButton } from '@/components/save-the-date/AmbientAudioButton';

export const metadata: Metadata = {
  title: 'Rodrigo & Stephanie — Save the Date',
  description:
    '28 · 08 · 2027 · Villamuriel de Cerrato, Palencia. Guarda la fecha.',
  manifest: '/save-the-date/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/save-the-date/icon.svg',
    apple: '/save-the-date/icon.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'Rodrigo & Stephanie',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/save-the-date',
    siteName: 'Rodrigo & Stephanie · Save the Date',
    title: 'Rodrigo & Stephanie — Save the Date',
    description:
      '28 · 08 · 2027 · Villamuriel de Cerrato · Palencia',
    images: [
      {
        url: '/save-the-date/og-save-the-date.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Rodrigo & Stephanie — 28 · 08 · 2027 — Villamuriel de Cerrato · Palencia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rodrigo & Stephanie — Save the Date',
    description:
      '28 · 08 · 2027 · Villamuriel de Cerrato · Palencia',
    images: ['/save-the-date/og-save-the-date.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1C1B19',
};

export default function SaveTheDatePage() {
  return (
    <main className="w-full min-h-screen overflow-x-hidden bg-[#FAF8F5] text-[#1C1B19] selection:bg-[#D9CCBA] selection:text-[#1C1B19]">
      {/* Pantalla 01 — Opening */}
      <SaveTheDateHero />

      {/* Pantalla 02 — Nuestra Historia */}
      <StorySection />

      {/* Pantalla 03 — La Fecha + Calendario Interactivo + Countdown */}
      <DateSection />

      {/* Pantalla 04 — Ubicación */}
      <LocationSection />

      {/* Pantalla 05 — Final + Añadir al Calendario + Compartir */}
      <FinalSection />

      {/* Control discreto de música ambiental (apagado inicialmente) */}
      <AmbientAudioButton />
    </main>
  );
}
