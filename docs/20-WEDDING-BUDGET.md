# Phase 20 — Wedding Budget & Supplier Management Module
**Stephanie & Rodrigo** · *Bodega Concejo, Valoria la Buena (Valladolid)* · *25 de agosto de 2027*

---

## 1. Executive Summary & Architecture

The **Wedding Budget & Supplier Management** module introduces end-to-end financial intelligence directly into the Stephanie & Rodrigo Wedding CRM at `/admin/budget`.

### Core Architecture & Guarantees
- **Unified Schema & Database-backed Single Selected Supplier Rule**:
  - `budget_categories`: Flexible categories (`fixed`, `per_guest`, `mixed`).
  - `budget_suppliers`: Multiple vendor bids per category with strict partial unique index:
    ```sql
    CREATE UNIQUE INDEX unique_selected_supplier_per_category
      ON budget_suppliers (category_id)
      WHERE is_selected = true;
    ```
    Guarantees at database level that at most one supplier is selected per category.
  - `budget_payments`: Tracks installments and milestone payments (`pending`, `partial`, `paid`) linked to contracted suppliers.
  - `budget_menu_config`: Dynamic catering model with configurable adult and child pricing, connected to real-time RSVP confirmations.
  - `guests.guest_type`: Added `guest_type` column (`'adult' | 'child'`) ensuring accurate headcount breakdown.
- **Effective Price Hierarchy**:
  ```ts
  final_price ?? quoted_price ?? estimated_price ?? 0
  ```
- **Real-Time Catering Cost Automation**:
  - Automatic headcount:
    $$\text{Menu Total} = (\text{Adults Attending} \times \text{Adult Price}) + (\text{Children Attending} \times \text{Child Price})$$
  - Toggle between live RSVP confirmations and manual estimate overrides.
- **Financial Balances & Safety Checks**:
  - $$\text{Total Contracted} = \sum \text{Selected Supplier Prices} + \text{Menu Total}$$
  - $$\text{Total Paid} = \sum_{\text{status='paid'}} \text{Payment Amounts}$$
  - $$\text{Total Pending} = \max(0, \text{Total Contracted} - \text{Total Paid})$$
  - Never permits negative pending balances.
- **CSV / Excel Export**:
  - Complete breakdown exported with UTF-8 BOM encoding for seamless Excel compatibility.

---

## 2. Initial Pre-Seeded Categories

The 12 official categories for Stephanie & Rodrigo's celebration at Bodega Concejo:
1. **Flores Iglesia** (`fixed`) - Arreglos florales para templo y jardines.
2. **Decoración Concejo** (`fixed`) - Iluminación, mobiliario y ambientación en bodega.
3. **DJ** (`fixed`) - Música para la fiesta, barra libre y sonido cóctel.
4. **Estación DJ** (`fixed`) - Cabina, iluminación láser y efectos.
5. **Vestido Novia** (`fixed`) - Vestido, velo, modistería y complementos.
6. **Vestido Novio** (`fixed`) - Traje a medida, chaleco y accesorios de Rodrigo.
7. **Pirotecnia** (`fixed`) - Fuegos fríos y castillo nocturno.
8. **Fotógrafo** (`fixed`) - Cobertura de boda, preboda y entrega en alta resolución.
9. **Grupo de música 1** (`fixed`) - Música en vivo para la ceremonia / cóctel.
10. **Grupo de música 2** (`fixed`) - Banda o actuación para barra libre.
11. **Preboda** (`fixed`) - Cata de vinos y recepción en bodega privada.
12. **Menú** (`per_guest`) - Banquete al aire libre en Bodega Concejo.

Additional categories can be dynamically created using "+ Añadir Categoría" with suggestion chips (Papelería, Invitaciones, Maquillaje, Peluquería, Autobuses, Hotel, etc.).

---

## 3. Component Hierarchy

```
app/admin/budget/page.tsx
├── BudgetDashboard.tsx
│     ├── Total Estimated KPI Card
│     ├── Contracted KPI Card
│     ├── Paid & Progress KPI Card
│     ├── Pending KPI Card
│     └── Alerts & Notifications Banner
├── MenuCostCalculator.tsx
│     ├── Adult & Child Price Inputs
│     ├── Live RSVP Sync / Manual Overrides Toggle
│     └── Summary Calculation Banner
├── CategoryCard.tsx (grid)
│     ├── Category Header, Type Badge, Star Rating
│     ├── Selected Supplier Effective Price Tier Badge
│     ├── Paid & Pending Balance
│     └── Actions (Comparador, + Proveedor, + Pago, Editar, Eliminar)
├── SupplierComparatorDrawer.tsx
│     ├── Multi-sort (Precio, Valoración 1-10, Estado)
│     ├── Vendor Comparison Cards
│     └── Select / Edit / Delete / Add Payment triggers
├── SupplierFormModal.tsx
│     └── Estimated, Quoted, Final Price, Contact, Notes, Rating
├── CategoryFormModal.tsx
│     └── Name suggestions chips, Type selector, Icon picker
└── PaymentFormModal.tsx
      └── Milestone amount, Due date, Paid date, Quick % chips
```

---

## 4. Verification & Security
- Strict PostgreSQL Row Level Security (RLS) on all budget tables.
- Authenticated admin access enforced by middleware (`boda_admin_demo` in dev, Supabase Auth session in production).
- 0 TypeScript errors (`tsc --noEmit`).
- 0 ESLint warnings (`next lint`).
- 100% production build pass (`next build`).
