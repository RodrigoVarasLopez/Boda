import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Rodrigo & Stephanie — 28 · 08 · 2027 · Nuestra Boda',
  description:
    'Celebramos nuestro enlace el 28 de Agosto de 2027 en Bodega Concejo, Valoria la Buena (Valladolid). Toda la información, horarios, detalles y confirmación.',
  openGraph: {
    title: 'Rodrigo & Stephanie — 28 · 08 · 2027 · Nuestra Boda',
    description: 'Celebramos nuestro enlace en Bodega Concejo, Valoria la Buena (Valladolid). Información, horarios y detalles.',
    url: 'https://stephanieyrodrigo.com/w/stephanie-y-rodrigo',
    siteName: 'Rodrigo & Stephanie — Boda',
    images: [
      {
        url: '/wedding/hero-mediterranean.jpg',
        width: 1200,
        height: 630,
        alt: 'Rodrigo & Stephanie — Boda en Bodega Concejo',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rodrigo & Stephanie — Nuestra Boda',
    description: '25 de Agosto de 2027 · Bodega Concejo, Valoria la Buena (Valladolid)',
    images: ['/wedding/hero-mediterranean.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicWeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
