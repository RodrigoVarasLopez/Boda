'use client';

import React from 'react';
import Link from 'next/link';
import { INITIAL_WEDDING } from '@/lib/mock-data';
import { useWeddingData } from '@/lib/guest-store';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Plus,
  Calendar,
  MessageCircle,
  Image as ImageIcon,
  ArrowUpRight,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { stats, groups, rsvps } = useWeddingData();
  const totalGuests = stats.totalGuests;
  const totalGroups = stats.totalGroups;
  const confirmedAttending = stats.confirmedAttending;
  const confirmedPlusOnes = stats.confirmedPlusOnes;
  const totalConfirmedHeadcount = stats.totalConfirmedHeadcount;
  const confirmedDeclined = stats.confirmedDeclined;
  const pendingCount = stats.pendingCount;
  const rsvpCompletionRate = stats.rsvpCompletionRate;
  const attendingPercent = totalGuests > 0 ? (totalConfirmedHeadcount / totalGuests) * 100 : 0;
  const declinedPercent = totalGuests > 0 ? (confirmedDeclined / totalGuests) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-text-accent">
            Panel de Operaciones
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary tracking-tight">
            Buenos días, Stephanie & Rodrigo
          </h1>
          <p className="text-xs text-text-muted">
            Así va la organización y confirmaciones de vuestra boda.
          </p>
        </div>

        {/* Quick Action Button */}
        <Link
          href="/admin/guests"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs hover:bg-primary-hover shadow-soft transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir invitado</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: INVITADOS */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-2">
          <p className="text-[10px] font-mono tracking-widest uppercase text-text-muted">
            INVITADOS
          </p>
          <p className="font-serif text-4xl font-normal text-text-primary">
            {totalGuests}
          </p>
          <p className="text-[11px] text-text-muted">
            En {totalGroups} grupos y familias
          </p>
        </div>

        {/* Card 2: CONFIRMADOS */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-2">
          <p className="text-[10px] font-mono tracking-widest uppercase text-brand-olive font-semibold">
            CONFIRMADOS (ASISTEN)
          </p>
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-4xl font-normal text-brand-olive">
              {totalConfirmedHeadcount}
            </p>
            {confirmedPlusOnes > 0 && (
              <span className="text-xs text-brand-olive font-semibold">
                (+{confirmedPlusOnes} acomps.)
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted">
            {confirmedAttending} titulares {confirmedPlusOnes > 0 ? `+ ${confirmedPlusOnes} acompañantes` : 'verificados'}
          </p>
        </div>

        {/* Card 3: PENDIENTES */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-2">
          <p className="text-[10px] font-mono tracking-widest uppercase text-brand-terracotta font-semibold">
            PENDIENTES
          </p>
          <p className="font-serif text-4xl font-normal text-brand-terracotta">
            {pendingCount}
          </p>
          <p className="text-[11px] text-text-muted">
            Esperando respuesta
          </p>
        </div>

        {/* Card 4: NO ASISTEN */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-2">
          <p className="text-[10px] font-mono tracking-widest uppercase text-text-muted font-semibold">
            NO ASISTEN
          </p>
          <p className="font-serif text-4xl font-normal text-text-muted">
            {confirmedDeclined}
          </p>
          <p className="text-[11px] text-text-muted">
            Bajas comunicadas
          </p>
        </div>
      </div>

      {/* Progress Bar & Operational Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: RSVP Progress (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-normal text-text-primary">
                Progreso Global de Confirmación
              </h3>
              <p className="text-xs text-text-muted">
                {rsvpCompletionRate}% del total de invitados ha respondido
              </p>
            </div>
            <span className="font-mono text-sm font-semibold text-text-accent">
              {rsvpCompletionRate}%
            </span>
          </div>

          {/* Thin Elegant Progress Bar */}
          <div className="h-2.5 rounded-full bg-bg-secondary overflow-hidden flex">
            <div
              style={{ width: `${attendingPercent}%` }}
              className="bg-brand-olive h-full transition-all duration-500"
            />
            <div
              style={{ width: `${declinedPercent}%` }}
              className="bg-text-muted/40 h-full transition-all duration-500"
            />
          </div>

          {/* Status Breakdown Pills */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
            <div className="p-3 rounded-xl bg-bg-secondary/40 border border-border-subtle">
              <span className="font-mono text-base font-semibold text-brand-olive block">{confirmedAttending}</span>
              <span className="text-[11px] text-text-muted">Confirmados</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary/40 border border-border-subtle">
              <span className="font-mono text-base font-semibold text-brand-terracotta block">{pendingCount}</span>
              <span className="text-[11px] text-text-muted">Pendientes</span>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary/40 border border-border-subtle">
              <span className="font-mono text-base font-semibold text-text-muted block">{confirmedDeclined}</span>
              <span className="text-[11px] text-text-muted">No asisten</span>
            </div>
          </div>

          {/* Attendance per Event */}
          <div className="pt-4 border-t border-border-subtle space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
              Asistencia por Evento
            </span>
            <div className="space-y-2">
              {stats.eventAttendance.map((evt) => (
                <div key={evt.eventId} className="flex justify-between items-center text-xs py-1">
                  <span className="text-text-primary">{evt.eventTitle}</span>
                  <span className="font-mono text-text-muted">{evt.attendees} pers.</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 2: Acciones Rápidas & Últimas Respuestas (1 Column) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
            <h3 className="font-serif text-lg font-normal text-text-primary">
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              {/* Highlighted Manual RSVP for Non-Tech Guests */}
              <Link
                href="/admin/guests"
                className="w-full py-2.5 px-3.5 rounded-xl bg-brand-olive/10 hover:bg-brand-olive/20 border border-brand-olive/30 flex items-center justify-between text-xs text-brand-olive transition-colors group"
              >
                <span className="flex items-center gap-2 font-medium">
                  <UserCheck className="w-4 h-4 text-brand-olive" />
                  Confirmar asistencia manual
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-brand-olive group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/guests"
                className="w-full py-2.5 px-3.5 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs text-text-primary transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-accent" />
                  + Añadir invitados
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary" />
              </Link>

              <Link
                href="/admin/events"
                className="w-full py-2.5 px-3.5 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs text-text-primary transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-text-accent" />
                  Crear / editar evento
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary" />
              </Link>

              <Link
                href="/admin/guests"
                className="w-full py-2.5 px-3.5 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs text-text-primary transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-brand-olive" />
                  Enviar por WhatsApp
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary" />
              </Link>

              <Link
                href="/admin/media"
                className="w-full py-2.5 px-3.5 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary border border-border-subtle flex items-center justify-between text-xs text-text-primary transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-text-accent" />
                  Galería & Recuerdos
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary" />
              </Link>
            </div>
          </div>

          {/* Recent Responses Card */}
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
            <h3 className="font-serif text-lg font-normal text-text-primary">
              Últimas Respuestas
            </h3>
            <div className="space-y-3 text-xs">
              {rsvps.slice(0, 5).map((sub) => {
                const groupName =
                  groups.find((g) => g.id === sub.group_id || g.token === sub.token)?.name ||
                  sub.responses[0]?.guest_name ||
                  'Invitado';
                const hasAttending = sub.responses.some((r) => r.status === 'attending');
                const attendingCount = sub.responses.filter((r) => r.status === 'attending').length;
                const plusOnesCount = sub.responses.filter(
                  (r) => r.status === 'attending' && r.plus_one_attending
                ).length;
                const totalHeadcount = attendingCount + plusOnesCount;
                return (
                  <div
                    key={`${sub.group_id || sub.token}-${sub.submitted_at}`}
                    className="p-3 rounded-xl bg-bg-secondary/40 border border-border-subtle flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium text-text-primary block">{groupName}</span>
                      <span
                        className={`text-[11px] font-semibold ${
                          hasAttending ? 'text-brand-olive' : 'text-text-muted'
                        }`}
                      >
                        {hasAttending ? `Asiste (${totalHeadcount} pers)` : 'No asisten'}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono">
                      {new Date(sub.submitted_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
