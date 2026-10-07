'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useMediaStore } from '@/lib/media-store';
import { MediaPhoto, MediaPhotoStatus } from '@/lib/types';
import {
  approveMediaAction,
  hideMediaAction,
  deleteMediaAction,
  updateMediaCaptionAction,
  bulkModerateMediaAction,
} from '@/app/actions';
import { MediaDetailDrawer } from '@/components/admin/MediaDetailDrawer';
import { MediaUploaderModal } from '@/components/media/MediaUploaderModal';
import {
  Camera,
  Check,
  EyeOff,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckSquare,
  Square,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminMediaPage() {
  const {
    photos,
    approvePhoto,
    hidePhoto,
    deletePhoto,
    updatePhotoCaption,
    bulkModeratePhotos,
    addPhoto,
  } = useMediaStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MediaPhotoStatus>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectPhoto, setInspectPhoto] = useState<MediaPhoto | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchesSearch =
        (p.caption || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.uploader_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.original_filename.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [photos, searchTerm, statusFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: photos.length,
      pending: photos.filter((p) => p.status === 'pending').length,
      approved: photos.filter((p) => p.status === 'approved').length,
      hidden: photos.filter((p) => p.status === 'hidden').length,
    };
  }, [photos]);

  // Selection helpers
  const isAllSelected =
    filteredPhotos.length > 0 &&
    filteredPhotos.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPhotos.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Actions
  const handleApprove = async (id: string) => {
    approvePhoto(id);
    await approveMediaAction(id);
  };

  const handleHide = async (id: string) => {
    hidePhoto(id);
    await hideMediaAction(id);
  };

  const handleDelete = async (id: string) => {
    deletePhoto(id);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    await deleteMediaAction(id);
  };

  const handleUpdateCaption = async (id: string, caption: string) => {
    updatePhotoCaption(id, caption);
    await updateMediaCaptionAction(id, caption);
  };

  const handleBulkAction = async (action: 'approve' | 'hide' | 'delete') => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      if (!confirm(`¿Eliminar definitivamente las ${selectedIds.length} fotografías seleccionadas?`)) {
        return;
      }
    }

    setIsProcessingBulk(true);
    bulkModeratePhotos(selectedIds, action);
    await bulkModerateMediaAction(selectedIds, action);
    setSelectedIds([]);
    setIsProcessingBulk(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
            Galería y Moderación
          </span>
          <h1 className="font-serif text-3xl font-normal text-text-primary">
            Fotografías &amp; Recuerdos
          </h1>
          <p className="text-xs text-text-muted">
            Gestiona la galería oficial de Stephanie &amp; Rodrigo y modera las fotos compartidas por los invitados.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir fotografía oficial</span>
        </button>
      </div>

      {/* Toolbar: Search & Status Tabs */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por pie de foto, autor o archivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto items-center">
          <span className="text-xs text-text-muted flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-text font-semibold shadow-xs'
                : 'bg-bg-secondary/60 text-text-secondary hover:bg-bg-secondary'
            }`}
          >
            <span>Todas</span>
            <span className="text-[10px] opacity-80">({counts.all})</span>
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pendientes</span>
            <span className="text-[10px] font-bold">({counts.pending})</span>
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>Aprobadas</span>
            <span className="text-[10px] opacity-80">({counts.approved})</span>
          </button>
          <button
            onClick={() => setStatusFilter('hidden')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'hidden'
                ? 'bg-zinc-700 text-white font-semibold shadow-xs'
                : 'bg-bg-secondary/60 text-text-secondary hover:bg-bg-secondary'
            }`}
          >
            <span>Ocultas</span>
            <span className="text-[10px] opacity-80">({counts.hidden})</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <button
          onClick={toggleSelectAll}
          className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-2 cursor-pointer select-none"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-text-accent" />
          ) : (
            <Square className="w-4 h-4 text-text-muted" />
          )}
          <span>
            {isAllSelected ? 'Deseleccionar todas' : 'Seleccionar todas las visibles'}
          </span>
        </button>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-bg-card p-1.5 px-3 rounded-xl border border-border-subtle shadow-soft animate-fade-in text-xs">
            <span className="font-semibold text-text-primary mr-1">
              {selectedIds.length} seleccionada{selectedIds.length > 1 ? 's' : ''}:
            </span>
            <button
              onClick={() => handleBulkAction('approve')}
              disabled={isProcessingBulk}
              className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Aprobar</span>
            </button>
            <button
              onClick={() => handleBulkAction('hide')}
              disabled={isProcessingBulk}
              className="py-1 px-2.5 rounded-lg bg-zinc-600 hover:bg-zinc-700 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <EyeOff className="w-3 h-3" />
              <span>Ocultar</span>
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isProcessingBulk}
              className="py-1 px-2.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Eliminar</span>
            </button>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="p-12 rounded-3xl bg-bg-card border border-border-subtle text-center space-y-3">
          <Camera className="w-8 h-8 text-text-muted mx-auto" />
          <p className="text-sm font-medium text-text-primary">
            No hay fotografías en esta sección
          </p>
          <p className="text-xs text-text-muted">
            Prueba a cambiar el filtro o el término de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map((photo) => {
            const isSelected = selectedIds.includes(photo.id);
            return (
              <div
                key={photo.id}
                className={`group rounded-2xl overflow-hidden bg-bg-card border transition-all shadow-soft flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-text-accent ring-2 ring-text-accent/30'
                    : 'border-border-subtle hover:border-text-accent/50'
                }`}
              >
                {/* Photo Thumbnail */}
                <div
                  className="relative h-44 w-full cursor-pointer overflow-hidden bg-black/5"
                  onClick={() => setInspectPhoto(photo)}
                >
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || 'Foto'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                  />

                  {/* Multi-select Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectOne(photo.id);
                    }}
                    className={`absolute top-2 left-2 p-1 rounded-lg backdrop-blur-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-text'
                        : 'bg-black/50 text-white/80 hover:bg-black/80'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  {/* Status Tag */}
                  <div className="absolute top-2 right-2">
                    {photo.status === 'approved' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs">
                        Aprobada
                      </span>
                    )}
                    {photo.status === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/95 text-white backdrop-blur-xs shadow-xs animate-pulse">
                        Pendiente
                      </span>
                    )}
                    {photo.status === 'hidden' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800/90 text-white backdrop-blur-xs shadow-xs">
                        Oculta
                      </span>
                    )}
                  </div>

                  {/* Quick Inspect Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                      Inspeccionar
                    </span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3 space-y-2 text-xs flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] text-text-primary font-medium line-clamp-2 leading-snug" title={photo.caption || ''}>
                      {photo.caption || <span className="text-text-muted italic">Sin pie de foto</span>}
                    </p>
                    <p className="text-[10px] text-text-muted truncate">
                      {photo.uploader_name || 'Invitado'}
                    </p>
                  </div>

                  {/* Inline quick actions */}
                  <div className="pt-2 border-t border-border-subtle/50 flex items-center justify-between">
                    <div className="flex gap-1">
                      {photo.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(photo.id)}
                          title="Aprobar para la web"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {photo.status !== 'hidden' && (
                        <button
                          onClick={() => handleHide(photo.id)}
                          title="Ocultar de la web"
                          className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setInspectPhoto(photo)}
                      title="Ver todos los detalles"
                      className="p-1.5 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      <MediaDetailDrawer
        photo={inspectPhoto}
        isOpen={inspectPhoto !== null}
        onClose={() => setInspectPhoto(null)}
        onApprove={handleApprove}
        onHide={handleHide}
        onDelete={handleDelete}
        onUpdateCaption={handleUpdateCaption}
      />

      {/* Upload Modal */}
      <MediaUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        isAdmin={true}
        defaultUploaderName="Stephanie & Rodrigo"
        onSuccess={(photo) => {
          addPhoto(photo);
        }}
      />
    </div>
  );
}
