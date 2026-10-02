# 17 — Production QA & Real Wedding Content Plan

## 1. Context & Objectives
This document establishes the production QA audit and real wedding content baseline for **Stephanie & Rodrigo** (25 de Agosto de 2027, Finca La Alquería, Madrid).
The standard is that a real guest receiving a WhatsApp invitation on mobile can seamlessly open the link, understand the invitation, submit their RSVP (both attending and declined flows), view permitted events, access maps and calendars, and leave guestbook memories without friction or data leakage.

## 2. Brand & Content Identity Baseline
- **Couple**: Stephanie & Rodrigo
- **Date**: 25 · 08 · 2027 (`2027-08-25T17:30:00.000Z`)
- **Venue**: Finca La Alquería · Madrid, España
- **Slug**: `stephanie-y-rodrigo`
- **Visual Direction**: Mediterranean Editorial Luxury
- **Palette**: Ivory / Porcelain (`#F8F5EF`), Warm Cream (`#EFE8DB`), Sand (`#D9CCBA`), Terracotta (`#B56E54`), Olive (`#68715C`), Deep Ink (`#20201D`).

## 3. Route Inventory
1. `/` — Landing & Experience Navigator
2. `/w/stephanie-y-rodrigo` — Public wedding story & logistics with Open Graph SEO metadata
3. `/i/[token]` — Private personalized guest invitation (`noindex`, `nofollow`)
4. `/admin` — Operations dashboard with live KPIs and recent activity
5. `/admin/guests` — Guests & groups CRM with WhatsApp generator and drawer
6. `/admin/rsvp` — RSVP breakdown, allergies, dietary choices, and CSV export
7. `/admin/events` — Event schedule and group visibility matrix
8. `/admin/cms` — Editorial block CMS editor
9. `/admin/guestbook` — Dedicated guestbook dedication moderation panel
10. `/admin/media` — Photograph gallery manager & memories preview
11. `/admin/settings` — Design system themes, privacy, and IBAN registry
12. `/admin/login` — Authentication and demo bypass
13. `/_not-found` — Branded 404 page

## 4. Test Fixture Matrix (Edge Cases)
- `grp-familia-garcia` (Carlos & Marta): Multiple adults, opened status, pending RSVP, all events permitted.
- `grp-sofia-martin` (Sofía Martín): Individual invitation with +1 confirmed (Daniel Rivas), dietary option: vegetarian, allergy: frutos secos.
- `grp-amigos-universidad` (Javier & Alejandro): Group without +1, restricted events (no welcome dinner, no brunch).
- `grp-familia-gomez` (Familia Gómez Peláez): Group with restricted events, **declined RSVP** with warm regret message.
- `grp-elena-torres` (Elena Torres): Individual invitation with +1 permitted, draft status.
- `grp-invitation-revoked` (Tomás Morales): Revoked invitation token (`token-revoked-999`) testing opaque rejection.

## 5. Security & Privacy Guarantees
- SHA-256 token hashing on server side (`app/actions.ts`).
- Sanitized DTO response for `/i/[token]`.
- Unavailable token screen returns identical message for revoked and non-existent tokens to prevent enumeration.
- Robots `noindex`, `nofollow` enforced on all `/i/*` routes.
- No raw token hashes exposed in table columns or page metadata.
