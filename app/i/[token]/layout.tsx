import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Invitación de Boda — Stephanie & Rodrigo',
  description: 'Invitación personal y concierge digital para la boda de Stephanie & Rodrigo · 25 · 08 · 2027.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function GuestInvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
