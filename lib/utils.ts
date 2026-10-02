import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOpaqueToken(prefix: string = 'token'): string {
  const randomHex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `${prefix}-${randomHex}`;
}

export function buildWhatsAppLink(
  phoneNumber: string = '',
  recipientName: string,
  coupleNames: string,
  weddingDate: string,
  invitationUrl: string,
  customNote: string = ''
): string {
  let message = `Hola ${recipientName} ❤️\n\n`;
  if (customNote && customNote.trim()) {
    message += `${customNote.trim()}\n\n`;
  } else {
    message += `Tenemos algo muy especial que compartir contigo.\n\n`;
    message += `Nos casamos y nos encantaría celebrar este día contigo.\n\n`;
  }
  message += `Hemos preparado tu invitación personal aquí:\n\n`;
  message += `${invitationUrl}\n\n`;
  message += `${coupleNames}\n`;
  message += `25 · 08 · 2027`;

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);

  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
}

export function generateGoogleCalendarUrl(
  title: string,
  description: string,
  location: string,
  startTimeISO: string,
  endTimeISO?: string
): string {
  const start = new Date(startTimeISO).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endDate = endTimeISO ? new Date(endTimeISO) : new Date(new Date(startTimeISO).getTime() + 2 * 3600 * 1000);
  const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(
    location
  )}&dates=${start}/${end}`;
}

export function downloadICSFile(
  title: string,
  description: string,
  location: string,
  startTimeISO: string,
  endTimeISO?: string
) {
  const start = new Date(startTimeISO).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endDate = endTimeISO ? new Date(endTimeISO) : new Date(new Date(startTimeISO).getTime() + 2 * 3600 * 1000);
  const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BodaWeb//Wedding Concierge//ES',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatDateEs(dateISO: string, includeTime: boolean = false): string {
  const d = new Date(dateISO);
  if (isNaN(d.getTime())) return dateISO;

  const dateStr = d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (!includeTime) return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const timeStr = d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return `${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} a las ${timeStr}h`;
}
