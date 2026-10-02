'use client';

import React, { useState } from 'react';
import { useWeddingData } from '@/lib/guest-store';
import { GuestGroup } from '@/lib/types';
import { ManualRSVPModal } from '@/components/admin/ManualRSVPModal';
import { Download, AlertCircle, Utensils, UserCheck, Search, X, Users } from 'lucide-react';

export default function AdminRSVPPage() {
  const { allResponses, groups, stats, refresh } = useWeddingData();
  const [selectedGroupForManual, setSelectedGroupForManual] = useState<GuestGroup | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

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

  const filteredPickerGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    g.guests.some((gst) =>
      `${gst.first_name} ${gst.last_name}`.toLowerCase().includes(pickerSearch.toLowerCase())
    )
  );

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
            Consulta los menús solicitados, restricciones alimentarias, recuento de comensales y confirma asistencia manual.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Quick manual RSVP trigger button */}
          <button
            onClick={() => setIsSelectorOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-brand-olive text-white font-medium text-xs flex items-center gap-2 hover:bg-brand-olive/90 shadow-soft transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>+ Confirmar Asistencia Manual</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-2.5 px-4 rounded-xl bg-bg-card border border-border-subtle hover:bg-bg-secondary text-text-primary font-medium text-xs flex items-center gap-2 shadow-soft transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Recuento / Headcount KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-card">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
            TOTAL COMENSALES CONFIRMADOS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-normal text-brand-olive">
              {stats.totalConfirmedHeadcount}
            </span>
            <span className="text-[11px] text-brand-olive/80">
              ({stats.confirmedAttending} + {stats.confirmedPlusOnes} +1)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-card">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
            PENDIENTES DE CONFIRMAR
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-normal text-brand-terracotta">
              {stats.pendingCount}
            </span>
            <span className="text-[11px] text-text-muted">personas</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-card">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
            NO ASISTEN
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-normal text-text-muted">
              {stats.confirmedDeclined}
            </span>
            <span className="text-[11px] text-text-muted">bajas</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-card">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
            TASA DE RESPUESTA
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-normal text-text-primary">
              {stats.rsvpCompletionRate}%
            </span>
            <span className="text-[11px] text-text-muted">completado</span>
          </div>
        </div>
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
            {allResponses.filter((res) => res.status === 'attending' && res.dietary_choice !== 'standard').length === 0 ? (
              <p className="text-text-muted italic py-2">Todos los invitados confirmados han seleccionado menú estándar.</p>
            ) : (
              allResponses
                .filter((res) => res.status === 'attending' && res.dietary_choice !== 'standard')
                .map((res) => (
                  <div key={res.guest_id} className="flex justify-between items-center p-3 rounded-xl bg-bg-secondary/40 border border-border-subtle">
                    <span className="font-medium text-text-primary">{res.guest_name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-sand/60 text-brand-ink uppercase">
                      {res.dietary_choice}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Card 2: Allergies Alerts */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2 text-brand-terracotta font-semibold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Alertas de Alergias Críticas</span>
          </div>
          <div className="space-y-2 text-xs">
            {allResponses.filter((r) => r.status === 'attending' && r.allergies).length === 0 ? (
              <p className="text-text-muted italic py-2">No se han registrado alergias entre los asistentes confirmados.</p>
            ) : (
              allResponses
                .filter((r) => r.status === 'attending' && r.allergies)
                .map((res) => (
                  <div key={res.guest_id} className="p-3 rounded-xl bg-brand-cream/60 border border-brand-sand space-y-1">
                    <span className="font-medium text-text-primary block">{res.guest_name}</span>
                    <p className="text-[11px] text-brand-terracotta font-semibold">Alergia: {res.allergies}</p>
                  </div>
                ))
            )}
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
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {allResponses.map((res) => {
                const parentGroup = groups.find((g) => g.guests.some((gst) => gst.id === res.guest_id));
                return (
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
                    <td className="p-4 text-right">
                      {parentGroup && (
                        <button
                          onClick={() => setSelectedGroupForManual(parentGroup)}
                          className="py-1 px-2.5 rounded-lg bg-bg-secondary hover:bg-bg-secondary/80 text-text-secondary hover:text-text-primary text-[11px] font-medium transition-colors cursor-pointer"
                          title="Modificar asistencia y datos para este invitado"
                        >
                          Modificar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest / Group Picker Modal for Manual RSVP */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-olive" />
                <h3 className="font-serif text-xl font-normal text-text-primary">
                  Seleccionar Familia o Invitado
                </h3>
              </div>
              <button
                onClick={() => setIsSelectorOpen(false)}
                className="p-1 rounded-full hover:bg-bg-secondary text-text-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Elige el invitado o familia para registrar o modificar su confirmación de asistencia (vía teléfono o presencial):
            </p>

            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o familia..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-bg-secondary/40 border border-border-subtle text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-olive"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filteredPickerGroups.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No se han encontrado invitados con ese nombre.</p>
              ) : (
                filteredPickerGroups.map((grp) => (
                  <div
                    key={grp.id}
                    onClick={() => {
                      setSelectedGroupForManual(grp);
                      setIsSelectorOpen(false);
                    }}
                    className="p-3 rounded-xl bg-bg-secondary/30 hover:bg-bg-secondary/80 border border-border-subtle flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-medium text-xs text-text-primary block">{grp.name}</span>
                      <span className="text-[11px] text-text-muted">
                        {grp.guests.map((g) => `${g.first_name} ${g.last_name}`).join(', ')}
                      </span>
                    </div>
                    <span className="text-xs text-brand-olive font-semibold flex items-center gap-1">
                      Seleccionar →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual RSVP Form Modal */}
      <ManualRSVPModal
        group={selectedGroupForManual}
        isOpen={!!selectedGroupForManual}
        onClose={() => setSelectedGroupForManual(null)}
        onSaved={refresh}
      />
    </div>
  );
}
