# Informe de QA Visual, Funcional y de Producción
**Boda Stephanie & Rodrigo · 25 · 08 · 2027**  
**Fecha de Verificación:** 02 de Octubre de 2026  
**Commit Evaluado:** `ad71007` y refinamientos posteriores  

---

## 1. Resumen Ejecutivo de Aceptación

| Categoría | Estado | Observaciones |
| :--- | :---: | :--- |
| **Visual QA** | **PASS** | Paleta cálida mediterránea activa desde el primer frame. Fondos con color, tarjetas opacas con sombra, bordes sutiles y textos con contraste. Soporte completo de clases con opacidad (`bg-*/60`, `bg-*/40`, `border-*/50`). Sin FOUC. |
| **Responsive QA** | **PASS** | Verificado en 360x800, 390x844, 430x932 y 1440x900. Zero overflow horizontal (`scrollWidth === innerWidth`). Navegación fija y tipografía adaptadas sin cortes. |
| **Functional QA** | **PASS** | Web pública entra directamente a la experiencia editorial. Invitación personalizada `/i/[token]` conserva el sobre/reveal interactivo. Transición fluida al contenido personalizado, asignación de eventos y flujo RSVP. |
| **Security QA** | **PASS** | Pantalla idéntica para tokens revocados e inexistentes (previene ataques de enumeración). Protección con `noindex, nofollow`. Metadatos limpios sin filtración de datos de invitados. |
| **Accessibility QA** | **PASS** | Cumple WCAG 1.4.4. Escala tipográfica jerárquica, contraste verificado en los 3 temas, áreas de pulsación táctiles >= 44x44 px, zoom permitido en viewport. |
| **Build QA** | **PASS** | Compilación de producción limpia (`npm run build`). Las 13 rutas del App Router y el middleware compilaron con código de salida 0. |

---

## 2. Evidencias Visuales Requeridas

Las capturas de pantalla de alta fidelidad han sido generadas y archivadas en `docs/evidence/`:

1. **Web Pública Desktop (1440x900)**: `docs/evidence/evidence_1_w_desktop.png`  
   - Entrada directa a la experiencia editorial sin bloqueo de sobre.
   - Hero banner con fotografía mediterránea de Finca La Alquería.
   - Selector de temas compacto, navegación flotante inferior activa.
2. **Web Pública Mobile (390x844)**: `docs/evidence/evidence_2_w_mobile_390.png`  
   - Composición editorial mobile-first adaptada.
   - Zero scroll horizontal. Tarjeta concierge y menú inferior integrados.
3. **Web Pública Mobile Adicionales (360x800 y 430x932)**: `docs/evidence/evidence_w_mobile_360.png` y `evidence_w_mobile_430.png`  
   - Verificación de ausencia total de desbordamiento horizontal en pantallas estrechas (360 px) y grandes (430 px).
4. **Invitación Personalizada — Sobre / Reveal (390x844)**: `docs/evidence/evidence_3_token_reveal.png`  
   - Distintivo superior: `• INVITACIÓN PARA FAMILIA GARCÍA`.
   - Fecha monumental `25 AGOSTO · 2027`, monograma y botón interactivo `Abrir invitación`.
5. **Invitación Personalizada — Experiencia Desbloqueada (390x844)**: `docs/evidence/evidence_4_token_unlocked.png`  
   - Desbloqueo inmediato tras pulsar `Abrir invitación`.
   - Bienvenida exclusiva para Carlos y Marta García con mensaje personalizado.
   - Despliegue de eventos específicos (Cena de Bienvenida + Brunch) y módulo interactivo de RSVP paso a paso.
6. **Panel de Administración CRM Desktop (1440x900)**: `docs/evidence/evidence_5_admin_dashboard.png`  
   - Tarjetas KPI (Total invitados: 11, Confirmados: 3, Pendientes: 6, No Asisten: 2).
   - Barra de progreso global (45%), desglose por eventos y accesos directos de concierge.
7. **Moderación de Libro de Firmas (1440x900)**: `docs/evidence/evidence_6_admin_guestbook.png`  
   - Pestañas de estado (Todos, Aprobados, Pendientes, Ocultos).
   - Acciones de moderación: Aprobar, Ocultar, Eliminar y buscador en tiempo real.

---

## 3. Matriz de Criterios de Aceptación

- [x] **Web pública tiene el diseño completo visible al entrar**: Comprobado en `/w/stephanie-y-rodrigo`.
- [x] **No hay fondos/tarjetas/bordes transparentes inesperados**: Resuelto con soporte de sintaxis RGB en Tailwind CSS.
- [x] **Tema Mediterráneo aparece desde el primer render**: Inyectado estáticamente en `<html lang="es" data-theme="mediterranean">`.
- [x] **No existe flash de estilos (FOUC)**: Las variables CSS se resuelven antes de la hidratación de React.
- [x] **`/i/[token]` conserva el reveal interactivo**: Comprobado con `/i/token-garcia-772`.
- [x] **RSVP funciona en los tres caminos**: Asistencia, no asistencia y acompañante adicional (+1).
- [x] **No hay doble envío**: Botones deshabilitados durante mutación y estados idempotentes.
- [x] **Edición RSVP funciona**: Permite alternar y modificar confirmaciones previamente enviadas.
- [x] **Personalización por grupo funciona**: Reglas de visibilidad de eventos por grupo (VIP vs Estándar).
- [x] **Admin funciona**: Overview, Invitados, RSVP, Eventos, CMS, Ajustes.
- [x] **Guestbook funciona**: Moderación completa y accesible desde la navegación del admin.
- [x] **Mobile 360/390/430 funciona**: Verificado con mediciones exactas de viewport.
- [x] **Desktop funciona**: Comprobado a 1440x900.
- [x] **Seguridad de tokens funciona**: Pantalla neutra uniforme para tokens revocados e inválidos.
- [x] **Accesibilidad básica funciona**: Jerarquía de encabezados, contraste e interactividad táctil verificadas.
- [x] **`npm run build` PASS**: Las 13 rutas compilan sin advertencias de tipos ni errores de chunks.

---

## 4. Registro de Refinamientos Menores Realizados en esta Fase

1. **Ajuste de escala tipográfica en `RevealScreen.tsx`**:
   - *Problema:* El titular `Stephanie & Rodrigo` con clase `text-5xl` ocupaba excesivo ancho en pantallas ultraestrechas de 360 px.
   - *Solución:* Se ajustó la escala a `text-4xl sm:text-5xl md:text-6xl break-words`.
2. **Padding adaptable en `GuestStickyNav.tsx`**:
   - *Problema:* 5 botones con `px-3` en pantallas de 360 px podían comprimir el texto del último elemento.
   - *Solución:* Se ajustó a `w-[94%] sm:w-[92%]` y `px-2 sm:px-3` para garantizar espaciado fluido en cualquier resolución móvil.
3. **Contención de overflow en contenedores principales**:
   - *Problema:* Evitar cualquier potencial micro-scroll horizontal durante transiciones en móvil.
   - *Solución:* Se añadió `overflow-x-hidden` a `<main>` en `/w/[slug]` y `/i/[token]`.
