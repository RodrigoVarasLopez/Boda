'use client';

import React from 'react';
import { INITIAL_WEDDING, INITIAL_GROUPS, INITIAL_EVENTS, INITIAL_RSVPS } from '@/lib/mock-data';
import { Users, CheckCircle, Clock, XCircle, Eye, ArrowUpRight, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const totalGuests = INITIAL_GROUPS.reduce((acc, g) => acc + g.guests.length, 0);
  const totalGroups = INITIAL_GROUPS.length;
  const openedInvitations = INITIAL_GROUPS.filter((g) => g.invitation_status === 'opened' || g.invitation_status === 'responded').length;

  const totalResponses = INITIAL_RSVPS.flatMap((r) => r.responses);
  const confirmedAttending = totalResponses.filter((r) => r.status === 'attending').length;
  const confirmedDeclined = totalResponses.filter((r) => r.status === 'declined').length;
  const pendingCount = totalGuests - (confirmedAttending + confirmedDeclined);

  const rsvpCompletionRate = Math.round(((confirmedAttending + confirmedDeclined) / totalGuests) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-accent block">
            Resumen General de Boda
          </span>
          <h1 className="font-serif text-3xl font-bold text-text-primary">
            Panel de Control
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/guests"
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-1.5 shadow-soft hover:bg-primary-hover transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Gestionar Invitados</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Guests */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-2">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Invitados</span>
            <Users className="w-4 h-4 text-text-accent" />
          </div>
          <p className="font-serif text-3xl font-bold text-text-primary">{totalGuests}</p>
          <span className="text-[10px] text-text-muted block">{totalGroups} familias/grupos</span>
        </div>

        {/* Card 2: Confirmed */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-2">
          <div className="flex justify-between items-center text-emerald-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Confirmados</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-emerald-700">{confirmedAttending}</p>
          <span className="text-[10px] text-emerald-800 font-medium block">Asistencia confirmada</span>
        </div>

        {/* Card 3: Pending */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-2">
          <div className="flex justify-between items-center text-amber-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pendientes</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-amber-700">{pendingCount}</p>
          <span className="text-[10px] text-amber-800 block">Sin responder</span>
        </div>

        {/* Card 4: Declined */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-2">
          <div className="flex justify-between items-center text-rose-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">No Asisten</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-rose-700">{confirmedDeclined}</p>
          <span className="text-[10px] text-rose-800 block">Bajas registradas</span>
        </div>

        {/* Card 5: Opened Invitations */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-2">
          <div className="flex justify-between items-center text-blue-700">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Abiertas</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-blue-700">{openedInvitations} / {totalGroups}</p>
          <span className="text-[10px] text-blue-800 block">Invitaciones leídas</span>
        </div>

        {/* Card 6: Completion Rate */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-2">
          <div className="flex justify-between items-center text-text-accent">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tasa RSVP</span>
            <Sparkles className="w-4 h-4 text-text-accent" />
          </div>
          <p className="font-serif text-3xl font-bold text-text-primary">{rsvpCompletionRate}%</p>
          <span className="text-[10px] text-text-muted block">Completitud global</span>
        </div>
      </div>

      {/* Visual Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Distribution Bar */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-semibold text-text-primary">
              Distribución de Respuestas RSVP
            </h3>
            <span className="text-xs font-mono text-text-muted">{totalGuests} invitados</span>
          </div>

          <div className="h-4 rounded-full bg-bg-secondary overflow-hidden flex">
            <div
              style={{ width: `${(confirmedAttending / totalGuests) * 100}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Confirmados: ${confirmedAttending}`}
            />
            <div
              style={{ width: `${(pendingCount / totalGuests) * 100}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Pendientes: ${pendingCount}`}
            />
            <div
              style={{ width: `${(confirmedDeclined / totalGuests) * 100}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`No asisten: ${confirmedDeclined}`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-center pt-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="font-bold block text-sm">{confirmedAttending}</span>
              <span className="text-[11px]">Asisten</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <span className="font-bold block text-sm">{pendingCount}</span>
              <span className="text-[11px]">Pendientes</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
              <span className="font-bold block text-sm">{confirmedDeclined}</span>
              <span className="text-[11px]">No asisten</span>
            </div>
          </div>
        </div>

        {/* Attendance per Event */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-semibold text-text-primary">
              Asistencia por Evento
            </h3>
            <Link href="/admin/events" className="text-xs text-text-accent font-medium hover:underline flex items-center gap-1">
              <span>Ver eventos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {INITIAL_EVENTS.map((evt) => {
              const attendeesCount = evt.visibility === 'everyone' ? confirmedAttending : Math.min(confirmedAttending, 3);
              return (
                <div key={evt.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-text-primary">{evt.title}</span>
                    <span className="text-text-muted font-mono">{attendeesCount} pers.</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${(attendeesCount / totalGuests) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
