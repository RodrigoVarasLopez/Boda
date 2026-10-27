'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useWeddingPlanner,
  MAIN_WEDDING_ID,
  DEFAULT_PLATFORM_ORG_ID,
} from '@/lib/weddings-store';
import { useWeddingData } from '@/lib/guest-store';
import { CreateWeddingModal } from '@/components/admin/CreateWeddingModal';
import { PlatformUserRole, USER_ROLE_LABELS } from '@/lib/types';
import {
  Briefcase,
  Plus,
  Calendar,
  MapPin,
  Users,
  Euro,
  Check,
  Eye,
  Sparkles,
  ExternalLink,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserPlus,
  Crown,
  UserCheck,
  Copy,
  Receipt,
  ClipboardCheck,
  PanelsTopLeft,
  CalendarDays,
  BookOpen,
  Image as ImageIcon,
  Lock,
  Mail,
  KeyRound,
  Search,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function WeddingPlannerPage() {
  const router = useRouter();
  const {
    weddings,
    organizations,
    users,
    activeWedding,
    activeWeddingId,
    selectWedding,
    deleteWedding,
    createPlatformUser,
    updatePlatformUser,
    deletePlatformUser,
    assignPlannersToWedding,
    isLoadingSaaS,
  } = useWeddingPlanner();

  const { groups } = useWeddingData();

  const [showCreateWeddingModal, setShowCreateWeddingModal] = useState(false);
  const [modalDefaultOrgId, setModalDefaultOrgId] = useState<string>(DEFAULT_PLATFORM_ORG_ID);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'planning'>('all');
  const [activeMainTab, setActiveMainTab] = useState<'planner_area' | 'guest_area' | 'users_roles'>(
    'planner_area'
  );

  // Modal: Dar Acceso a Wedding Planners a una Boda B2C / B2B desde "Mis Bodas"
  const [accessModalWeddingId, setAccessModalWeddingId] = useState<string | null>(null);
  const [selectedPlannerUserIds, setSelectedPlannerUserIds] = useState<string[]>([]);
  const [selectedPrimaryOrgId, setSelectedPrimaryOrgId] = useState<string>(DEFAULT_PLATFORM_ORG_ID);
  const [savingPlannerAccess, setSavingPlannerAccess] = useState(false);

  // Modal: Gestionar a qué bodas B2C tiene acceso una Wedding Planner concreta (desde Usuarios)
  const [accessModalPlannerUserId, setAccessModalPlannerUserId] = useState<string | null>(null);
  const [selectedPlannerWeddingIds, setSelectedPlannerWeddingIds] = useState<string[]>([]);
  const [savingUserWeddingsAccess, setSavingUserWeddingsAccess] = useState(false);

  // Lista de todos los usuarios con rol Wedding Planner
  const weddingPlannerUsers = useMemo(
    () => users.filter((u) => u.role === 'wedding_planner'),
    [users]
  );

  const openWeddingPlannerAccessModal = (weddingId: string) => {
    const targetWedding = weddings.find((w) => w.id === weddingId);
    if (!targetWedding) return;

    // Determinar qué Wedding Planners tienen ya acceso a esta boda
    const initialPlannerIds = weddingPlannerUsers
      .filter(
        (u) =>
          targetWedding.assigned_planner_ids?.includes(u.id) ||
          u.assigned_wedding_ids?.includes(weddingId) ||
          (targetWedding.planner_org_id &&
            targetWedding.planner_org_id !== DEFAULT_PLATFORM_ORG_ID &&
            u.planner_org_id === targetWedding.planner_org_id)
      )
      .map((u) => u.id);

    setAccessModalWeddingId(weddingId);
    setSelectedPlannerUserIds(initialPlannerIds);
    setSelectedPrimaryOrgId(targetWedding.planner_org_id || DEFAULT_PLATFORM_ORG_ID);
  };

  const handleSaveWeddingPlannerAccess = async () => {
    if (!accessModalWeddingId) return;
    setSavingPlannerAccess(true);
    try {
      const orgObj = organizations.find((o) => o.id === selectedPrimaryOrgId);
      const res = await assignPlannersToWedding({
        weddingId: accessModalWeddingId,
        plannerUserIds: selectedPlannerUserIds,
        primaryPlannerOrgId: selectedPrimaryOrgId,
        primaryPlannerName:
          orgObj?.name || 'Administración Oficial · Cartera Directa B2C',
      });
      if (res && !res.success) {
        alert(res.error || 'Error al guardar los permisos de Wedding Planner');
        return;
      }
      setAccessModalWeddingId(null);
      showToast('Acceso de Wedding Planners actualizado en esta boda');
    } finally {
      setSavingPlannerAccess(false);
    }
  };

  const openPlannerUserWeddingsModal = (plannerUserId: string) => {
    const plannerUser = users.find((u) => u.id === plannerUserId);
    if (!plannerUser) return;
    const accessibleIds = weddings
      .filter(
        (w) =>
          plannerUser.assigned_wedding_ids?.includes(w.id) ||
          w.assigned_planner_ids?.includes(plannerUser.id) ||
          (w.planner_org_id && w.planner_org_id === plannerUser.planner_org_id)
      )
      .map((w) => w.id);
    setAccessModalPlannerUserId(plannerUserId);
    setSelectedPlannerWeddingIds(accessibleIds);
  };

  const handleSavePlannerUserWeddingsAccess = async () => {
    if (!accessModalPlannerUserId) return;
    const plannerUser = users.find((u) => u.id === accessModalPlannerUserId);
    if (!plannerUser) return;
    setSavingUserWeddingsAccess(true);
    try {
      // 1. Update user's assigned_wedding_ids
      await updatePlatformUser({
        userId: plannerUser.id,
        role: plannerUser.role,
        planner_org_id: plannerUser.planner_org_id,
        planner_org_name:
          plannerUser.planner_org_name || `${plannerUser.full_name} · Agencia Wedding Planner`,
        assigned_wedding_ids: selectedPlannerWeddingIds,
      });

      // 2. Also sync each wedding's assigned_planner_ids in weddings table
      for (const w of weddings) {
        const currentIds = w.assigned_planner_ids || [];
        const hasPlanner = currentIds.includes(plannerUser.id);
        const shouldHavePlanner = selectedPlannerWeddingIds.includes(w.id);
        if (shouldHavePlanner && !hasPlanner) {
          await assignPlannersToWedding({
            weddingId: w.id,
            plannerUserIds: Array.from(new Set([...currentIds, plannerUser.id])),
          });
        } else if (!shouldHavePlanner && hasPlanner) {
          await assignPlannersToWedding({
            weddingId: w.id,
            plannerUserIds: currentIds.filter((id) => id !== plannerUser.id),
          });
        }
      }

      setAccessModalPlannerUserId(null);
      showToast(`Bodas B2C/B2B con acceso actualizadas para ${plannerUser.full_name}`);
    } finally {
      setSavingUserWeddingsAccess(false);
    }
  };

  // Create User Modal / Drawer State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<PlatformUserRole>('basic_user');
  const [newUserOrgId, setNewUserOrgId] = useState<string>(DEFAULT_PLATFORM_ORG_ID);
  const [newUserOrgName, setNewUserOrgName] = useState('');
  const [newUserWeddingId, setNewUserWeddingId] = useState<string>(MAIN_WEDDING_ID);
  const [createWeddingForBasicUser, setCreateWeddingForBasicUser] = useState(false);
  const [basicUserCoupleNames, setBasicUserCoupleNames] = useState('');
  const [basicUserWeddingDate, setBasicUserWeddingDate] = useState('2027-09-18T18:00');
  const [basicUserLocation, setBasicUserLocation] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Guest Area Search & Copy State
  const [guestSearch, setGuestSearch] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setCopiedText(msg);
    setTimeout(() => setCopiedText(null), 2800);
  };

  // Filtered weddings by selected Planner Organization (including shared B2C weddings!) and status
  const filteredWeddings = useMemo(() => {
    return weddings.filter((w) => {
      if (selectedOrgFilter !== 'all') {
        const isPrimaryOrg = (w.planner_org_id || DEFAULT_PLATFORM_ORG_ID) === selectedOrgFilter;
        const isSharedWithOrg =
          w.shared_planner_org_ids?.includes(selectedOrgFilter) ||
          weddingPlannerUsers.some(
            (u) =>
              u.planner_org_id === selectedOrgFilter &&
              (w.assigned_planner_ids?.includes(u.id) || u.assigned_wedding_ids?.includes(w.id))
          );
        if (!isPrimaryOrg && !isSharedWithOrg) {
          return false;
        }
      }
      if (statusFilter !== 'all' && w.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [weddings, selectedOrgFilter, statusFilter, weddingPlannerUsers]);

  const filteredGuestGroups = useMemo(() => {
    const q = guestSearch.trim().toLowerCase();
    if (!q) return groups.slice(0, 18);
    return groups
      .filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.guests.some((gst) => `${gst.first_name} ${gst.last_name}`.toLowerCase().includes(q))
      )
      .slice(0, 18);
  }, [groups, guestSearch]);

  const getDaysUntil = (dateStr: string) => {
    try {
      const target = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      return diff > 0 ? `${diff} días restantes` : 'Celebrada';
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleSelectWeddingAndGo = async (weddingId: string, destination?: string) => {
    await selectWedding(weddingId);
    showToast('Boda activa cambiada correctamente');
    if (destination) {
      router.push(destination);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);
    setCreatingUser(true);

    try {
      const selectedOrgObj = organizations.find((o) => o.id === newUserOrgId);
      const res = await createPlatformUser({
        email: newUserEmail,
        password: newUserPassword,
        full_name: newUserFullName,
        role: newUserRole,
        planner_org_id:
          newUserRole === 'wedding_planner'
            ? undefined
            : newUserRole === 'super_admin'
            ? DEFAULT_PLATFORM_ORG_ID
            : newUserOrgId,
        planner_org_name:
          newUserRole === 'wedding_planner'
            ? newUserOrgName || `${newUserFullName} · Agencia B2B`
            : selectedOrgObj?.name || 'Administración Oficial · Cartera Directa B2C',
        assigned_wedding_id:
          newUserRole === 'basic_user' && !createWeddingForBasicUser
            ? newUserWeddingId
            : undefined,
        create_new_wedding: newUserRole === 'basic_user' && createWeddingForBasicUser,
        new_wedding_couple: basicUserCoupleNames,
        new_wedding_date: basicUserWeddingDate
          ? new Date(basicUserWeddingDate).toISOString()
          : undefined,
        new_wedding_location: basicUserLocation,
      });

      if (!res.success) {
        setUserFormError(res.error || 'No se pudo crear el usuario');
        return;
      }

      setShowCreateUserModal(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserFullName('');
      setNewUserOrgName('');
      setBasicUserCoupleNames('');
      setBasicUserLocation('');
      showToast('Usuario creado y sincronizado en Supabase Auth');
    } finally {
      setCreatingUser(false);
    }
  };

  const copyLinkToClipboard = async (relativeOrFullUrl: string, label: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = relativeOrFullUrl.startsWith('http')
      ? relativeOrFullUrl
      : `${origin}${relativeOrFullUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast(`${label} copiado al portapapeles`);
    } catch {
      showToast('No se pudo copiar el enlace');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* Toast Notification */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-fade-in border border-neutral-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copiedText}</span>
        </div>
      )}

      {/* =====================================================================
          CAPA SUPERIOR (NIVEL 0): ARQUITECTURA SAAS MULTI-WEDDING PLANNER (B2B + B2C)
      ===================================================================== */}
      <section className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border-subtle pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Crown className="w-3.5 h-3.5" />
              <span>Arquitectura SaaS · B2B (Wedding Planners) + B2C (Clientes Directos)</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Centro de Mando: Planners, Bodas &amp; Área de Invitados
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-3xl">
              Capa superior donde conviven distintas <strong>Wedding Planners (B2B)</strong> y tu{' '}
              <strong>Cartera Oficial de Administración (B2C)</strong> para parejas que contratan la plataforma directamente.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setNewUserRole('basic_user');
                setShowCreateUserModal(true);
              }}
              className="py-2.5 px-4 rounded-2xl border border-border-strong bg-bg-secondary/60 hover:bg-bg-secondary text-text-primary font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-4 h-4 text-primary" />
              <span>+ Crear Usuario (Admin / Planner / Básico)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModalDefaultOrgId(
                  selectedOrgFilter === 'all' ? DEFAULT_PLATFORM_ORG_ID : selectedOrgFilter
                );
                setShowCreateWeddingModal(true);
              }}
              className="py-2.5 px-5 rounded-2xl bg-primary text-primary-text font-semibold text-xs flex items-center gap-2 hover:bg-primary-hover shadow-card transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Nueva Boda</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Wedding Planners / Carteras (Capa Superior Multi-Planner) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" />
              <span>
                Nivel Superior · Carteras de Wedding Planners Activas ({organizations.length})
              </span>
            </span>
            {selectedOrgFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedOrgFilter('all')}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Ver todas las carteras ({weddings.length} bodas) →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Botón global Todas */}
            <div
              onClick={() => setSelectedOrgFilter('all')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                selectedOrgFilter === 'all'
                  ? 'bg-primary/8 border-primary ring-1 ring-primary/30 shadow-soft'
                  : 'bg-bg-secondary/30 border-border-subtle hover:border-border-strong'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold block">
                    VISTA GLOBAL PLATAFORMA
                  </span>
                  <h3 className="font-serif text-lg font-bold text-text-primary mt-0.5">
                    Todas las Carteras (B2B + B2C)
                  </h3>
                </div>
                <Layers className="w-5 h-5 text-primary shrink-0" />
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle/60">
                <span className="text-text-secondary">
                  <strong>{weddings.length}</strong> bodas registradas
                </span>
                <span className="text-text-muted">
                  <strong>{users.length}</strong> usuarios
                </span>
              </div>
            </div>

            {/* Tarjetas por cada Wedding Planner / Cartera */}
            {organizations.map((org) => {
              const orgOwnWeddings = weddings.filter(
                (w) => (w.planner_org_id || DEFAULT_PLATFORM_ORG_ID) === org.id
              );
              const orgSharedB2CWeddings = !org.is_platform_default
                ? weddings.filter(
                    (w) =>
                      (w.planner_org_id || DEFAULT_PLATFORM_ORG_ID) !== org.id &&
                      (w.shared_planner_org_ids?.includes(org.id) ||
                        weddingPlannerUsers.some(
                          (u) =>
                            u.planner_org_id === org.id &&
                            (w.assigned_planner_ids?.includes(u.id) ||
                              u.assigned_wedding_ids?.includes(w.id))
                        ))
                  )
                : [];
              const totalAccessibleCount = orgOwnWeddings.length + orgSharedB2CWeddings.length;
              const orgUsers = users.filter((u) => u.planner_org_id === org.id);
              const isSelected = selectedOrgFilter === org.id;

              return (
                <div
                  key={org.id}
                  onClick={() => setSelectedOrgFilter(org.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary/8 border-primary ring-1 ring-primary/30 shadow-soft'
                      : 'bg-bg-secondary/30 border-border-subtle hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider font-bold inline-flex items-center gap-1 ${
                          org.is_platform_default ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {org.is_platform_default
                          ? '👑 TU CARTERA OFICIAL (CLIENTES B2C)'
                          : '💼 AGENCIA WEDDING PLANNER (B2B)'}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-text-primary mt-0.5 truncate">
                        {org.name}
                      </h3>
                      {org.owner_email && (
                        <p className="text-[11px] text-text-muted truncate">{org.owner_email}</p>
                      )}
                    </div>
                    <Briefcase className="w-4 h-4 text-text-accent shrink-0" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-text-primary">
                        {totalAccessibleCount} {totalAccessibleCount === 1 ? 'boda' : 'bodas'}
                      </span>
                      {orgSharedB2CWeddings.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                          +{orgSharedB2CWeddings.length} B2C con acceso
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-text-muted">
                        {orgUsers.length} {orgUsers.length === 1 ? 'usuario' : 'usuarios'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalDefaultOrgId(org.id);
                          setShowCreateWeddingModal(true);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-primary text-primary-text text-[10px] font-semibold hover:bg-primary-hover cursor-pointer"
                      >
                        + Boda aquí
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SELECTOR DE LAS 3 SECCIONES PRINCIPALES DE LA PÁGINA
          1) ÁREA 1: ÁREA WEDDING PLANNER & GESTIÓN DE BODAS
          2) ÁREA 2: ÁREA DE INVITADOS (WEB, SAVE THE DATE Y TOKENS VIP)
          3) ÁREA 3: USUARIOS Y PERMISOS (ADMIN / PLANNER / USUARIO BÁSICO)
      ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveMainTab('planner_area')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
            activeMainTab === 'planner_area'
              ? 'bg-primary text-primary-text border-primary shadow-card'
              : 'bg-bg-card border-border-subtle hover:border-border-strong text-text-primary'
          }`}
        >
          <div
            className={`p-3 rounded-xl ${
              activeMainTab === 'planner_area'
                ? 'bg-white/15 text-white'
                : 'bg-primary/10 text-primary'
            }`}
          >
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-80 block font-bold">
              ÁREA 1 · BACKOFFICE
            </span>
            <span className="font-serif text-base sm:text-lg font-bold block">
              Área Wedding Planner &amp; Parejas
            </span>
            <span className="text-[11px] opacity-80 block">
              Cartera de bodas, presupuesto, CRM y eventos
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('guest_area')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
            activeMainTab === 'guest_area'
              ? 'bg-primary text-primary-text border-primary shadow-card'
              : 'bg-bg-card border-border-subtle hover:border-border-strong text-text-primary'
          }`}
        >
          <div
            className={`p-3 rounded-xl ${
              activeMainTab === 'guest_area'
                ? 'bg-white/15 text-white'
                : 'bg-amber-500/15 text-amber-700'
            }`}
          >
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-80 block font-bold">
              ÁREA 2 · FRONTOFFICE PÚBLICO
            </span>
            <span className="font-serif text-base sm:text-lg font-bold block">
              Área de Invitados ({activeWedding.couple_names})
            </span>
            <span className="text-[11px] opacity-80 block">
              Invitaciones VIP por token, Web y Save the Date
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('users_roles')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
            activeMainTab === 'users_roles'
              ? 'bg-primary text-primary-text border-primary shadow-card'
              : 'bg-bg-card border-border-subtle hover:border-border-strong text-text-primary'
          }`}
        >
          <div
            className={`p-3 rounded-xl ${
              activeMainTab === 'users_roles'
                ? 'bg-white/15 text-white'
                : 'bg-emerald-500/15 text-emerald-700'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-80 block font-bold">
              ARQUITECTURA RBAC · 3 ROLES
            </span>
            <span className="font-serif text-base sm:text-lg font-bold block">
              Usuarios &amp; Permisos ({users.length})
            </span>
            <span className="text-[11px] opacity-80 block">
              Administración, Wedding Planner y Usuario Básico
            </span>
          </div>
        </button>
      </div>

      {/* =====================================================================
          CONTENIDO PESTAÑA 1: ÁREA WEDDING PLANNER & GESTIÓN DE BODAS
      ===================================================================== */}
      {activeMainTab === 'planner_area' && (
        <div className="space-y-6 animate-fade-in">
          {/* Barra de filtro de estado + Boda Activa actual */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-card p-4 rounded-2xl border border-border-subtle">
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'confirmed', 'planning'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-primary text-primary-text shadow-soft'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                >
                  {tab === 'all'
                    ? `Todas (${filteredWeddings.length})`
                    : tab === 'confirmed'
                    ? 'Confirmadas / Publicadas'
                    : 'En Planificación'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="text-text-muted">Boda activa ahora:</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                💍 {activeWedding.couple_names}
              </span>
            </div>
          </div>

          {/* Grid de Bodas Reales en Base de Datos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWeddings.map((w) => {
              const isActive = w.id === activeWeddingId;
              const isProtectedMain = w.id === MAIN_WEDDING_ID;
              const countdown = getDaysUntil(w.wedding_date);
              const guestDisplay =
                w.real_guest_count && w.real_guest_count > 0
                  ? `${w.real_guest_count} registrados (${w.real_confirmed_count || 0} conf.)`
                  : `${w.guest_target_count || 150} previstos`;
              const budgetDisplay =
                w.real_budget_contracted && w.real_budget_contracted > 0
                  ? `${Math.round(w.real_budget_contracted).toLocaleString('es-ES')} € contratado`
                  : `${(w.budget_target || 30000).toLocaleString('es-ES')} € objetivo`;

              return (
                <div
                  key={w.id}
                  className={`rounded-3xl bg-bg-card border p-6 flex flex-col justify-between transition-all shadow-card space-y-5 ${
                    isActive
                      ? 'border-primary ring-2 ring-primary/20 shadow-soft'
                      : 'border-border-subtle hover:border-border-strong'
                  }`}
                >
                  {/* Cabecera de la tarjeta */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${
                            isActive
                              ? 'bg-primary text-primary-text border-primary'
                              : 'bg-bg-secondary text-text-secondary border-border-subtle'
                          }`}
                        >
                          {isActive ? '✦ Boda Activa' : 'En Cartera'}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">{countdown}</span>
                      </div>

                      {!isProtectedMain && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              confirm(
                                `¿Eliminar la boda de ${w.couple_names} de la base de datos?`
                              )
                            ) {
                              const res = await deleteWedding(w.id);
                              if (res && !res.success && res.error) {
                                alert(res.error);
                              } else {
                                showToast(`Boda de ${w.couple_names} eliminada`);
                              }
                            }
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar boda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Etiqueta de la Wedding Planner propietaria (B2C Admin vs B2B Planner) */}
                    <div className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-bg-secondary/70 border border-border-subtle text-text-secondary truncate flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <Briefcase className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">
                          {w.planner_name || 'Administración Oficial · Cartera Directa B2C'}
                        </span>
                      </div>
                      {(w.planner_org_id || DEFAULT_PLATFORM_ORG_ID) === DEFAULT_PLATFORM_ORG_ID && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold shrink-0">
                          B2C
                        </span>
                      )}
                    </div>

                    {/* Panel de Wedding Planners con Acceso a esta Boda B2C / B2B */}
                    {(() => {
                      const plannersWithAccess = weddingPlannerUsers.filter(
                        (u) =>
                          w.assigned_planner_ids?.includes(u.id) ||
                          u.assigned_wedding_ids?.includes(w.id) ||
                          (w.planner_org_id &&
                            w.planner_org_id !== DEFAULT_PLATFORM_ORG_ID &&
                            u.planner_org_id === w.planner_org_id)
                      );

                      return (
                        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-900 flex items-center gap-1">
                              <KeyRound className="w-3 h-3 text-emerald-700 shrink-0" />
                              <span>
                                Wedding Planners con acceso ({plannersWithAccess.length})
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => openWeddingPlannerAccessModal(w.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Dar Acceso Planner</span>
                            </button>
                          </div>

                          {plannersWithAccess.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {plannersWithAccess.map((wp) => (
                                <span
                                  key={wp.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-emerald-300 text-[10px] font-semibold text-emerald-900"
                                >
                                  <span>💼 {wp.full_name}</span>
                                  <span className="text-emerald-700/80 font-normal">
                                    ({wp.email})
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-emerald-800/80">
                              Solo gestionada por Administración B2C y la pareja. Pulsa{' '}
                              <strong>«Dar Acceso Planner»</strong> para habilitar a un Wedding Planner en esta boda.
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    <div>
                      <h3 className="font-serif text-2xl font-bold text-text-primary tracking-tight">
                        {w.couple_names}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-text-accent shrink-0" />
                        <span>{formatDate(w.wedding_date)}</span>
                      </p>
                      <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-olive shrink-0" />
                        <span className="truncate">{w.location_summary}</span>
                      </p>
                      {w.owner_email && (
                        <p className="text-[11px] text-primary font-medium mt-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">Pareja (Básico): {w.owner_email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Métricas en vivo desde Supabase */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-border-subtle/60 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-text-muted block">
                        Invitados
                      </span>
                      <span className="font-semibold text-text-primary">{guestDisplay}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-text-muted block">
                        Presupuesto
                      </span>
                      <span className="font-semibold text-text-primary">{budgetDisplay}</span>
                    </div>
                  </div>

                  {/* Accesos Rápidos del Área Wedding Planner (Backoffice de esta Boda) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block font-semibold">
                      Accesos directos de Gestión (Planner / Pareja):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectWeddingAndGo(w.id, '/admin/budget')}
                        className="py-1.5 px-2.5 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary text-[11px] font-medium text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Presupuesto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectWeddingAndGo(w.id, '/admin/guests')}
                        className="py-1.5 px-2.5 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary text-[11px] font-medium text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Invitados</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectWeddingAndGo(w.id, '/admin/rsvp')}
                        className="py-1.5 px-2.5 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary text-[11px] font-medium text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>RSVP &amp; Menús</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectWeddingAndGo(w.id, '/admin/cms')}
                        className="py-1.5 px-2.5 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary text-[11px] font-medium text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <PanelsTopLeft className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Web &amp; STD</span>
                      </button>
                    </div>
                  </div>

                  {/* Botón Principal de Activación + Paso al Área de Invitados */}
                  <div className="space-y-2 pt-1">
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => router.push('/admin')}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft"
                      >
                        <span>Abrir Panel Principal de esta Boda</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectWeddingAndGo(w.id)}
                        className="w-full py-2.5 px-4 rounded-xl border border-border-strong hover:bg-primary hover:text-primary-text hover:border-primary text-text-primary text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Activar esta Boda en el Panel</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        await selectWedding(w.id);
                        setActiveMainTab('guest_area');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-300/60 text-amber-900 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Ir al Área de Invitados de {w.couple_names} →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          CONTENIDO PESTAÑA 2: ÁREA DE INVITADOS (PÚBLICA, SAVE THE DATE Y TOKENS)
      ===================================================================== */}
      {activeMainTab === 'guest_area' && (
        <div className="space-y-6 animate-fade-in">
          {/* Banner explicativo del Área de Invitados */}
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Área Exclusiva para Invitados · Sin acceso al Backoffice</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
                Portal y Experiencia de Invitados: {activeWedding.couple_names}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
                Desde aquí puedes abrir y copiar los enlaces que reciben los invitados: la Web Pública de la Boda, el Save the Date interactivo y las invitaciones individuales por familia (`/i/[token]`).
              </p>
            </div>

            {/* Selector rápido para cambiar la boda cuyos invitados estamos viendo */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-text-muted font-medium">Boda:</span>
              <select
                value={activeWeddingId}
                onChange={(e) => selectWedding(e.target.value)}
                className="py-2 px-3 rounded-xl bg-bg-secondary border border-border-strong text-xs font-semibold text-text-primary focus:outline-none"
              >
                {weddings.map((w) => (
                  <option key={w.id} value={w.id}>
                    💍 {w.couple_names}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3 Tarjetas de Canales Públicos de Invitados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Canal 1: Web Oficial de Invitación */}
            <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold block">
                  1 · WEB DE LA INVITACIÓN
                </span>
                <h3 className="font-serif text-xl font-bold text-text-primary">
                  Página Web Pública (`/w/{activeWedding.slug}`)
                </h3>
                <p className="text-xs text-text-secondary">
                  Portada nupcial, historia, horarios de ceremonia y banquete, mapa interactivo, dress code y formulario RSVP.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={`/w/${activeWedding.slug}`}
                  target="_blank"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-primary-text text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-hover transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Abrir Web</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </Link>
                <button
                  type="button"
                  onClick={() => copyLinkToClipboard(`/w/${activeWedding.slug}`, 'Enlace de la Web')}
                  className="py-2.5 px-3 rounded-xl border border-border-strong hover:bg-bg-secondary text-xs font-semibold text-text-primary flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            {/* Canal 2: Save the Date Interactivo */}
            <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold block">
                  2 · SAVE THE DATE OFICIAL
                </span>
                <h3 className="font-serif text-xl font-bold text-text-primary">
                  Save the Date Editorial (`/save-the-date`)
                </h3>
                <p className="text-xs text-text-secondary">
                  Experiencia visual con música, galería de 11 fotografías configurables en el CMS, botón de calendario y envío directo por WhatsApp.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Link
                  href="/save-the-date"
                  target="_blank"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Abrir Save the Date</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </Link>
                <button
                  type="button"
                  onClick={() => copyLinkToClipboard('/save-the-date', 'Enlace Save the Date')}
                  className="py-2.5 px-3 rounded-xl border border-border-strong hover:bg-bg-secondary text-xs font-semibold text-text-primary flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            {/* Canal 3: Participación Social de Invitados (Firmas & Fotos) */}
            <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold block">
                  3 · INTERACCIÓN DE INVITADOS
                </span>
                <h3 className="font-serif text-xl font-bold text-text-primary">
                  Libro de Firmas &amp; Álbum Compartido
                </h3>
                <p className="text-xs text-text-secondary">
                  Dedicatorias enviadas por los invitados y fotografías subidas en directo desde sus móviles durante la celebración.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/admin/guestbook"
                  className="py-2.5 px-3 rounded-xl border border-border-strong hover:bg-bg-secondary text-xs font-semibold text-text-primary flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span>Libro de Firmas</span>
                </Link>
                <Link
                  href="/admin/media"
                  className="py-2.5 px-3 rounded-xl border border-border-strong hover:bg-bg-secondary text-xs font-semibold text-text-primary flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Álbum Fotos</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Directorio de Enlaces Personales por Grupo/Familia (/i/[token]) */}
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-text-primary">
                  Enlaces VIP Personalizados por Familia / Grupo (`/i/[token]`)
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Cada grupo de invitados ve únicamente los eventos a los que está invitado (ej. Preboda + Boda o solo Boda) y confirma la asistencia de sus miembros.
                </p>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Buscar familia o invitado..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-bg-secondary/50 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {filteredGuestGroups.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm text-text-muted">
                  No hay grupos de invitados registrados en esta boda todavía.
                </p>
                <Link
                  href="/admin/guests"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>+ Añadir primeros invitados en el módulo Invitados →</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredGuestGroups.map((grp) => {
                  const hasPreboda = grp.allowed_event_ids?.includes('evt-preboda-cata');
                  return (
                    <div
                      key={grp.id}
                      className="p-3.5 rounded-2xl bg-bg-secondary/35 border border-border-subtle hover:border-border-strong flex flex-col justify-between gap-3 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-text-primary truncate">
                            {grp.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${
                              hasPreboda
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-bg-card text-text-muted border border-border-subtle'
                            }`}
                          >
                            {hasPreboda ? 'Preboda + Boda' : 'Solo Boda'}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-1 truncate">
                          {grp.guests.map((g) => g.first_name).join(', ')} ({grp.guests.length}{' '}
                          {grp.guests.length === 1 ? 'invitado' : 'invitados'})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/50">
                        <Link
                          href={`/i/${grp.token}`}
                          target="_blank"
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver como invitado</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            copyLinkToClipboard(`/i/${grp.token}`, `Link de ${grp.name}`)
                          }
                          className="py-1.5 px-2.5 rounded-lg bg-bg-card border border-border-subtle hover:border-border-strong text-[11px] font-medium text-text-primary flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          CONTENIDO PESTAÑA 3: ARQUITECTURA DE USUARIOS Y PERMISOS (3 ROLES)
      ===================================================================== */}
      {activeMainTab === 'users_roles' && (
        <div className="space-y-6 animate-fade-in">
          {/* Explicación de los 3 Roles y Modelo B2B / B2C */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                  1 · ADMINISTRACIÓN (`super_admin`)
                </span>
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text-primary">
                Super Administrador (Tú)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Controla toda la plataforma SaaS. Supervisa a todas las Wedding Planners (B2B) y actúa como la{' '}
                <strong>Wedding Planner matriz de todos los Usuarios Básicos (B2C)</strong> que compran su boda directamente.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                  2 · WEDDING PLANNER (`wedding_planner`)
                </span>
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text-primary">
                Wedding Planner Profesional (B2B)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Dispone de su propia cartera de bodas. Puede registrar y gestionar múltiples bodas de sus clientes y dar acceso a cada pareja a su boda correspondiente.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
                  3 · USUARIO BÁSICO (`basic_user`)
                </span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text-primary">
                Usuario Básico / Pareja (B2C)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Gestiona únicamente <strong>su propia boda</strong> (invitados, presupuesto, RSVP y web). Queda asociado automáticamente a tu Cartera Oficial de Administrador (B2C) o a su Wedding Planner.
              </p>
            </div>
          </div>

          {/* Directorio de Usuarios Reales en Supabase Auth */}
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-text-primary">
                  Usuarios Registrados en Base de Datos ({users.length})
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Sincronizado en tiempo real con `auth.users` de Supabase. Puedes cambiar el rol o cartera de cualquier usuario o crear nuevas cuentas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateUserModal(true)}
                className="py-2.5 px-4 rounded-xl bg-primary text-primary-text text-xs font-semibold flex items-center gap-2 hover:bg-primary-hover shadow-soft cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Nuevo Usuario</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    <th className="py-3 px-3">Usuario / Email</th>
                    <th className="py-3 px-3">Tipo de Usuario (Rol)</th>
                    <th className="py-3 px-3">Wedding Planner / Cartera Asociada</th>
                    <th className="py-3 px-3">Bodas Asignadas</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60">
                  {users.map((u) => {
                    const isMainSuperAdmin =
                      u.email.toLowerCase() === 'rodrigovaraslopez@gmail.com';

                    return (
                      <tr key={u.id} className="hover:bg-bg-secondary/30 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-text-primary">{u.full_name}</div>
                          <div className="text-[11px] text-text-muted">{u.email}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <select
                            value={u.role}
                            disabled={isMainSuperAdmin}
                            onChange={async (e) => {
                              const nextRole = e.target.value as PlatformUserRole;
                              await updatePlatformUser({
                                userId: u.id,
                                role: nextRole,
                                planner_org_id: u.planner_org_id,
                                planner_org_name:
                                  u.planner_org_name ||
                                  'Administración Oficial · Cartera Directa B2C',
                                assigned_wedding_ids: u.assigned_wedding_ids,
                              });
                              showToast(`Rol de ${u.email} actualizado a ${USER_ROLE_LABELS[nextRole]}`);
                            }}
                            className="py-1.5 px-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-xs font-semibold text-text-primary focus:outline-none"
                          >
                            <option value="super_admin">👑 Administración (Super Admin)</option>
                            <option value="wedding_planner">💼 Wedding Planner (B2B)</option>
                            <option value="basic_user">💍 Usuario Básico / Pareja (B2C)</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-3">
                          <select
                            value={u.planner_org_id}
                            onChange={async (e) => {
                              const nextOrgId = e.target.value;
                              const orgObj = organizations.find((o) => o.id === nextOrgId);
                              await updatePlatformUser({
                                userId: u.id,
                                role: u.role,
                                planner_org_id: nextOrgId,
                                planner_org_name:
                                  orgObj?.name || 'Administración Oficial · Cartera Directa B2C',
                                assigned_wedding_ids: u.assigned_wedding_ids,
                              });
                              showToast(`Cartera de ${u.email} actualizada`);
                            }}
                            className="py-1.5 px-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-xs text-text-primary focus:outline-none max-w-[260px]"
                          >
                            {organizations.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3.5 px-3">
                          {u.role === 'super_admin' ? (
                            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                              Todas las bodas ({weddings.length})
                            </span>
                          ) : u.role === 'wedding_planner' ? (
                            <div className="flex flex-col items-start gap-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                  Cartera propia:{' '}
                                  {
                                    weddings.filter((w) => w.planner_org_id === u.planner_org_id)
                                      .length
                                  }
                                </span>
                                <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                                  Bodas B2C con acceso:{' '}
                                  {
                                    weddings.filter(
                                      (w) =>
                                        (w.planner_org_id || DEFAULT_PLATFORM_ORG_ID) !==
                                          u.planner_org_id &&
                                        (u.assigned_wedding_ids?.includes(w.id) ||
                                          w.assigned_planner_ids?.includes(u.id))
                                    ).length
                                  }
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => openPlannerUserWeddingsModal(u.id)}
                                className="py-1 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-3 h-3" />
                                <span>Dar / Gestionar acceso a bodas B2C</span>
                              </button>
                            </div>
                          ) : (
                            <select
                              value={u.assigned_wedding_ids[0] || MAIN_WEDDING_ID}
                              onChange={async (e) => {
                                const wid = e.target.value;
                                await updatePlatformUser({
                                  userId: u.id,
                                  role: u.role,
                                  planner_org_id: u.planner_org_id,
                                  planner_org_name:
                                    u.planner_org_name ||
                                    'Administración Oficial · Cartera Directa B2C',
                                  assigned_wedding_ids: [wid],
                                });
                                showToast(`Boda asignada actualizada para ${u.email}`);
                              }}
                              className="py-1.5 px-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-xs text-text-primary"
                            >
                              {weddings.map((w) => (
                                <option key={w.id} value={w.id}>
                                  💍 {w.couple_names}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          {!isMainSuperAdmin ? (
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`¿Eliminar el usuario ${u.email}?`)) {
                                  const res = await deletePlatformUser(u.id);
                                  if (res && !res.success && res.error) {
                                    alert(res.error);
                                  } else {
                                    showToast(`Usuario ${u.email} eliminado`);
                                  }
                                }
                              }}
                              className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-text-muted">
                              Protegido
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: CREAR NUEVA BODA EN BASE DE DATOS
      ===================================================================== */}
      {showCreateWeddingModal && (
        <CreateWeddingModal
          defaultOrgId={modalDefaultOrgId}
          onClose={() => setShowCreateWeddingModal(false)}
        />
      )}

      {/* =====================================================================
          MODAL 3: DAR ACCESO A WEDDING PLANNERS A UNA BODA (B2C / B2B) DESDE MIS BODAS
      ===================================================================== */}
      {accessModalWeddingId && (() => {
        const targetWedding = weddings.find((w) => w.id === accessModalWeddingId);
        if (!targetWedding) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-bg-card border border-border-strong rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-card space-y-5 relative max-h-[92vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setAccessModalWeddingId(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Permisos de Wedding Planner en Boda B2C / B2B</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-text-primary">
                  Dar Acceso a Wedding Planners: {targetWedding.couple_names}
                </h2>
                <p className="text-xs text-text-muted">
                  Selecciona qué <strong>Wedding Planners</strong> pueden ver y gestionar esta boda (invitados, presupuesto, RSVP, web y Save the Date) desde su panel.
                </p>
              </div>

              {/* Selección de Wedding Planners con acceso */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-primary">
                    1. Wedding Planners con acceso a {targetWedding.couple_names}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAccessModalWeddingId(null);
                      setNewUserRole('wedding_planner');
                      setShowCreateUserModal(true);
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Crear nuevo Wedding Planner →
                  </button>
                </div>

                {weddingPlannerUsers.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-bg-secondary/50 border border-border-subtle text-xs text-text-muted text-center">
                    No hay usuarios con rol Wedding Planner todavía. Crea uno con el botón superior.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {weddingPlannerUsers.map((wp) => {
                      const isChecked = selectedPlannerUserIds.includes(wp.id);
                      return (
                        <label
                          key={wp.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs'
                              : 'bg-bg-secondary/30 border-border-subtle hover:border-border-strong'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                              <span>💼 {wp.full_name}</span>
                              {isChecked && (
                                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                                  Con acceso
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-text-muted truncate">{wp.email}</div>
                            {wp.planner_org_name && (
                              <div className="text-[10px] text-emerald-800 font-medium mt-0.5 truncate">
                                Cartera: {wp.planner_org_name}
                              </div>
                            )}
                          </div>

                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlannerUserIds((prev) =>
                                  Array.from(new Set([...prev, wp.id]))
                                );
                              } else {
                                setSelectedPlannerUserIds((prev) =>
                                  prev.filter((id) => id !== wp.id)
                                );
                              }
                            }}
                            className="w-4 h-4 rounded border-border-strong text-emerald-700 cursor-pointer shrink-0"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Cartera Principal de la Boda (Mantener en B2C Admin o mover a Cartera B2B) */}
              <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-2">
                <label className="text-xs font-bold text-text-primary block">
                  2. Cartera Matriz Propietaria de la Boda
                </label>
                <p className="text-[11px] text-text-muted">
                  Puedes mantener la boda en tu <strong>Cartera Oficial de Administración (B2C)</strong> compartiendo el acceso con las Wedding Planners marcadas arriba, o transferir la titularidad de la cartera.
                </p>
                <select
                  value={selectedPrimaryOrgId}
                  onChange={(e) => setSelectedPrimaryOrgId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs font-semibold text-text-primary"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.is_platform_default
                        ? `👑 ${org.name} (Boda B2C del Admin)`
                        : `💼 ${org.name} (Cartera B2B)`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setAccessModalWeddingId(null)}
                  className="py-2.5 px-4 rounded-xl border border-border-subtle text-text-secondary text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={savingPlannerAccess}
                  onClick={handleSaveWeddingPlannerAccess}
                  className="py-2.5 px-5 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover shadow-soft cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {savingPlannerAccess ? 'Guardando accesos...' : 'Guardar Acceso de Wedding Planners'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          MODAL 4: SELECCIONAR A QUÉ BODAS B2C / B2B TIENE ACCESO UN WEDDING PLANNER
      ===================================================================== */}
      {accessModalPlannerUserId && (() => {
        const plannerUser = users.find((u) => u.id === accessModalPlannerUserId);
        if (!plannerUser) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-bg-card border border-border-strong rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-card space-y-5 relative max-h-[92vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setAccessModalPlannerUserId(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Asignación de Bodas B2C y B2B</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-text-primary">
                  Bodas con Acceso para {plannerUser.full_name}
                </h2>
                <p className="text-xs text-text-muted">
                  Marca las bodas de <strong>Clientes Directos (B2C)</strong> o de otras carteras a las que quieres dar acceso a <strong>{plannerUser.email}</strong>.
                </p>
              </div>

              <div className="space-y-2">
                {weddings.map((w) => {
                  const isB2C =
                    (w.planner_org_id || DEFAULT_PLATFORM_ORG_ID) === DEFAULT_PLATFORM_ORG_ID;
                  const isChecked = selectedPlannerWeddingIds.includes(w.id);

                  return (
                    <label
                      key={w.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs'
                          : 'bg-bg-secondary/30 border-border-subtle hover:border-border-strong'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-text-primary">
                            💍 {w.couple_names}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                              isB2C
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {isB2C ? '👑 Boda B2C (Admin)' : '💼 Boda B2B'}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5 truncate">
                          {formatDate(w.wedding_date)} · {w.location_summary}
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlannerWeddingIds((prev) =>
                              Array.from(new Set([...prev, w.id]))
                            );
                          } else {
                            setSelectedPlannerWeddingIds((prev) =>
                              prev.filter((id) => id !== w.id)
                            );
                          }
                        }}
                        className="w-4 h-4 rounded border-border-strong text-emerald-700 cursor-pointer shrink-0"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setAccessModalPlannerUserId(null)}
                  className="py-2.5 px-4 rounded-xl border border-border-subtle text-text-secondary text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={savingUserWeddingsAccess}
                  onClick={handleSavePlannerUserWeddingsAccess}
                  className="py-2.5 px-5 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover shadow-soft cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {savingUserWeddingsAccess
                      ? 'Guardando...'
                      : 'Guardar Bodas Asignadas'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          MODAL 2: CREAR USUARIO (ADMINISTRACIÓN / WEDDING PLANNER / BÁSICO)
      ===================================================================== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-card border border-border-strong rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-card space-y-5 relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowCreateUserModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Alta de Usuario en Supabase Auth</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-text-primary">
                Crear Nuevo Usuario
              </h2>
              <p className="text-xs text-text-muted">
                Elige el tipo de usuario: Administración, Wedding Planner (B2B) o Usuario Básico / Pareja (B2C).
              </p>
            </div>

            {userFormError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {userFormError}
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              {/* Selector de Tipo de Usuario */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary block">
                  1. Tipo de Usuario y Nivel de Permisos *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(
                    [
                      {
                        role: 'basic_user' as PlatformUserRole,
                        title: '💍 Usuario Básico / Pareja (B2C)',
                        desc: 'Gestiona su propia boda. Asociado por defecto a tu Cartera Oficial de Administrador.',
                      },
                      {
                        role: 'wedding_planner' as PlatformUserRole,
                        title: '💼 Wedding Planner (Agencia B2B)',
                        desc: 'Dispone de su propia cartera para crear y administrar múltiples bodas de clientes.',
                      },
                      {
                        role: 'super_admin' as PlatformUserRole,
                        title: '👑 Administración Global (Super Admin)',
                        desc: 'Control total de todas las Wedding Planners, usuarios y bodas de la plataforma.',
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setNewUserRole(opt.role)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        newUserRole === opt.role
                          ? 'border-primary bg-primary/10 shadow-2xs'
                          : 'border-border-subtle hover:bg-bg-secondary/50'
                      }`}
                    >
                      <div className="text-xs font-bold text-text-primary">{opt.title}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Datos básicos de cuenta */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-primary block">
                  Nombre Completo o Nombre de Pareja / Agencia *
                </label>
                <input
                  type="text"
                  required
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  placeholder={
                    newUserRole === 'wedding_planner'
                      ? 'Ej: Laura Gómez Wedding Studio'
                      : 'Ej: Carlos & Elena'
                  }
                  className="w-full py-2.5 px-3.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-primary block">
                    Email de Acceso *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="usuario@email.com"
                    className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-primary block">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                  />
                </div>
              </div>

              {/* Configuración específica según rol */}
              {newUserRole === 'wedding_planner' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                  <label className="text-xs font-bold text-emerald-950 block">
                    Nombre de su Cartera / Agencia Wedding Planner (B2B)
                  </label>
                  <input
                    type="text"
                    value={newUserOrgName}
                    onChange={(e) => setNewUserOrgName(e.target.value)}
                    placeholder="Ej: Velvet Weddings · Agencia B2B"
                    className="w-full py-2 px-3 rounded-xl bg-white border border-emerald-200 text-xs text-text-primary"
                  />
                </div>
              )}

              {newUserRole === 'basic_user' && (
                <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-primary block">
                      ¿A qué Wedding Planner va asociado este Usuario Básico?
                    </label>
                    <select
                      value={newUserOrgId}
                      onChange={(e) => setNewUserOrgId(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.is_platform_default
                            ? `👑 ${org.name} (Por defecto: Tú como Administrador)`
                            : `💼 ${org.name}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-text-primary">
                      ¿Crear una boda nueva para esta pareja ahora mismo?
                    </span>
                    <input
                      type="checkbox"
                      checked={createWeddingForBasicUser}
                      onChange={(e) => setCreateWeddingForBasicUser(e.target.checked)}
                      className="rounded border-border-strong text-primary cursor-pointer"
                    />
                  </div>

                  {!createWeddingForBasicUser ? (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-text-secondary block">
                        Asignar a una boda ya existente:
                      </label>
                      <select
                        value={newUserWeddingId}
                        onChange={(e) => setNewUserWeddingId(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                      >
                        {weddings.map((w) => (
                          <option key={w.id} value={w.id}>
                            💍 {w.couple_names}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-1 border-t border-border-subtle">
                      <input
                        type="text"
                        required
                        value={basicUserCoupleNames}
                        onChange={(e) => setBasicUserCoupleNames(e.target.value)}
                        placeholder="Nombres de la pareja (Ej: Lucas & Martina)"
                        className="w-full py-2 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="datetime-local"
                          value={basicUserWeddingDate}
                          onChange={(e) => setBasicUserWeddingDate(e.target.value)}
                          className="w-full py-2 px-2.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                        />
                        <input
                          type="text"
                          value={basicUserLocation}
                          onChange={(e) => setBasicUserLocation(e.target.value)}
                          placeholder="Ciudad / Finca"
                          className="w-full py-2 px-2.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-border-subtle text-text-secondary text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="py-2.5 px-5 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover shadow-soft cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{creatingUser ? 'Creando usuario...' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
