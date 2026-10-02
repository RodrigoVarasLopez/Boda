'use client';

import React from 'react';
import { INITIAL_RSVPS } from '@/lib/mock-data';
import { Download, AlertCircle, Utensils } from 'lucide-react';

export default function AdminRSVPPage() {
  const allResponses = INITIAL_RSVPS.flatMap((r) => r.responses);

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Estado RSVP', 'Dieta', 'Alergias', '+1 Acompañante', 'Mensaje'];
    const rows = allResponses.map((res) => [
      `"${res.guest_name}"`,
      `"${res.status}"`,
      `"${res.dietary_choice}"`,
      `"${res.allergies || ''}"`,
      `"${res.plus_one_name || (res.plus_one_attending ? 'Sí' : 'No')}"`,
      `"${(res.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Stephanie_Rodrigo_RSVP.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
            Reportes & Alergias
          </span>
          <h1 className="font-serif text-3xl font-normal text-text-primary">
            Desglose de Confirmaciones (RSVP)
          </h1>
          <p className="text-xs text-text-muted">
            Consulta los menús solicitados, restricciones alimentarias y mensajes de cariño.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="py-2.5 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar a CSV</span>
        </button>
      </div>

      {/* Dietary & Allergy Warning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Special Diets */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Resumen de Menús Especiales</span>
          </div>
          <div className="space-y-2 text-xs">
            {allResponses.map((res) => (
              <div key={res.guest_id} className="flex justify-between items-center p-3 rounded-xl bg-bg-secondary/40 border border-border-subtle">
                <span className="font-medium text-text-primary">{res.guest_name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-sand/60 text-brand-ink uppercase">
                  {res.dietary_choice}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Allergies Alerts */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2 text-brand-terracotta font-semibold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Alertas de Alergias Críticas</span>
          </div>
          <div className="space-y-2 text-xs">
            {allResponses.filter((r) => r.allergies).map((res) => (
              <div key={res.guest_id} className="p-3 rounded-xl bg-brand-cream/60 border border-brand-sand space-y-1">
                <span className="font-medium text-text-primary block">{res.guest_name}</span>
                <p className="text-[11px] text-brand-terracotta font-semibold">Alergia: {res.allergies}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Responses Table */}
      <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden">
        <div className="p-5 border-b border-border-subtle font-serif text-lg font-normal text-text-primary">
          Respuestas Detalladas por Invitado
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary/40 text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-subtle">
              <tr>
                <th className="p-4">Invitado</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Menú</th>
                <th className="p-4">Alergias</th>
                <th className="p-4">Acompañante (+1)</th>
                <th className="p-4">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {allResponses.map((res) => (
                <tr key={res.guest_id} className="hover:bg-bg-secondary/20 transition-colors">
                  <td className="p-4 font-serif text-sm font-normal text-text-primary">{res.guest_name}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      res.status === 'attending' ? 'bg-brand-olive/15 text-brand-olive' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {res.status === 'attending' ? 'Asiste' : 'No asiste'}
                    </span>
                  </td>
                  <td className="p-4 capitalize">{res.dietary_choice}</td>
                  <td className="p-4 text-brand-terracotta font-medium">{res.allergies || '—'}</td>
                  <td className="p-4">
                    {res.plus_one_attending ? (
                      <span className="text-brand-olive font-medium">{res.plus_one_name || 'Sí'}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-4 italic font-serif text-text-secondary max-w-xs truncate">{res.message || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
