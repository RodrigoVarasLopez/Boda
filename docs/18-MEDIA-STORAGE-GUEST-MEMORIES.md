# Fase 18 — Almacenamiento de Medios & Recuerdos de Invitados
**Stephanie & Rodrigo · Bodega Concejo (Valoria la Buena, Valladolid)**

---

## 1. Resumen Ejecutivo & Objetivos

La Fase 18 transforma el sistema de memorias y firmas en una plataforma de recuerdos interactiva y de nivel de producción para el enlace de **Stephanie & Rodrigo**. El sistema aúna:
1. **Fotografías oficiales de los novios** y **recuerdos subidos por los invitados** gestionados en **Supabase Storage**.
2. **Flujo de moderación integral** con estados `pending`, `approved` y `hidden` para proteger la privacidad y garantizar la elegancia editorial.
3. **Galería pública paginada y Visor Lightbox inmersivo** con navegación táctil (swipe) y de teclado (Escape, flechas).
4. **Libro de firmas digital interactivo** con saneamiento estricto contra inyecciones HTML y moderación antes de su publicación.
5. **Panel de administración avanzado** en `/admin/media` y `/admin/guestbook` con filtros por estado, búsqueda en tiempo real, inspección detallada vía cajón lateral (*drawer*) y moderación masiva en lote (*bulk actions*).

---

## 2. Arquitectura de Almacenamiento (Supabase Storage)

### 2.1 Bucket `wedding-media`
- **Nombre del Bucket**: `wedding-media`
- **Acceso**: Privado por defecto con generación de URLs firmadas temporales (*signed URLs*) o resolución local de seguridad.
- **Límite de tamaño**: 10 MB por archivo.
- **MIME types permitidos**: `image/jpeg`, `image/png`, `image/webp`.

### 2.2 Convención de Rutas de Objetos
```text
{wedding_id}/gallery/{photo_id}/{safe-filename}
```
**Reglas estrictas de privacidad:**
- Nunca se incluye correo electrónico, teléfono, nombre completo de invitado ni tokens de invitación dentro de las rutas del bucket.
- El nombre del archivo se sanea de forma determinista (`sanitizeFileName`): eliminación de tildes, caracteres especiales, espacios transformados en guiones y limitación a 40 caracteres base con extensiones `.jpg`, `.png` o `.webp`.

---

## 3. Esquema de Datos & Base de Datos Relacional

### 3.1 Tabla `media_photos`
Almacena exclusivamente los metadatos relacionales (los binarios residen en Storage):
- `id`: Identificador único (ej: `photo-2027-001` o `photo-{timestamp}-{hash}`).
- `wedding_id`: Referencia a `weddings.id` (`w-stephanie-rodrigo-2027`).
- `uploaded_by_guest_id`: UUID opcional de invitado (`guests.id`).
- `uploader_name`: Nombre visible de quien subió la foto (ej: *"Stephanie & Rodrigo"*, *"Familia Pérez"*).
- `storage_path`: Ruta del objeto en el bucket.
- `original_filename`: Nombre original saneado.
- `mime_type`: `image/jpeg`, `image/png` o `image/webp`.
- `file_size`: Tamaño en bytes.
- `width` / `height`: Dimensiones en píxeles.
- `caption`: Pie de foto (máximo 180 caracteres).
- `is_visible`: Booleano para visibilidad en frontend.
- `is_approved`: Booleano para estado de aprobación.
- `status`: `'pending' | 'approved' | 'hidden'`.
- `created_at` / `updated_at`: Marcas de tiempo ISO 8601.

### 3.2 Tabla `guestbook_entries`
- `id`: Identificador único de dedicatoria.
- `wedding_id`: Referencia a `weddings.id`.
- `invitation_id`: Identificador de grupo/invitación de origen.
- `guest_name`: Nombre o familia del firmante (saneado de HTML).
- `message`: Contenido de la dedicatoria (2 a 500 caracteres, saneado de etiquetas HTML/scripts).
- `status`: `'pending' | 'approved' | 'hidden'`.
- `created_at` / `approved_at`: Fechas de registro y aprobación.

---

## 4. Validación Estricta de Subida

1. **Formatos Soportados**: JPEG, PNG, WebP.
2. **Formatos Rechazados**: SVG, HTML, JS, PDF, ZIP, ejecutables.
3. **Validación Cliente**:
   - Detección inmediata en drag-and-drop o selector de archivos.
   - Rechazo de ficheros superiores a 10 MB con aviso contextual en español.
4. **Validación Servidor (`uploadMediaAction`)**:
   - Comprobación de cabeceras mágicas (*magic bytes*):
     - JPEG: `0xFF 0xD8 0xFF`
     - PNG: `0x89 0x50 0x4E 0x47`
     - WebP: Contenedor RIFF con firma WEBP.
   - Prevención de objetos huérfanos: Si la subida a Storage tiene éxito pero la inserción en base de datos falla, se ejecuta la eliminación de limpieza del archivo en Storage.

---

## 5. Experiencia de Usuario para Invitados

### 5.1 Galería de Fotos & Paginación
- Ubicada en `#memorias` de la web pública (`/w/stephanie-y-rodrigo`) y la invitación personalizada (`/i/[token]`).
- Los invitados solo ven fotografías con estado `approved` y `is_visible: true`.
- Carga progresiva en bloques de 12 fotografías con botón contextual: *"Cargar más fotografías (X restantes)"*.

### 5.2 Visor Lightbox Accesible (`MediaViewer`)
- Renderizado seguro mediante `createPortal(..., document.body)` con `z-[100]`.
- Navegación bidireccional con botones laterales flotantes.
- Soporte para atajos de teclado:
  - `Escape`: Cierre del visor.
  - `Flecha Izquierda` / `Flecha Derecha`: Fotografía anterior / siguiente.
- Soporte táctil móvil con gestos de deslizamiento (*swipe left / right*).
- Contador de posición (`X / Total`), pie de foto, autor con icono terracota y fecha.

### 5.3 Subida de Fotos por Invitados (`MediaUploaderModal`)
- Activado desde el botón destacado *"Subir fotos de la boda"*.
- Zona interactiva con previsualización inmediata de la foto elegida.
- Asignación de estado inicial: `pending` (con mensaje explicativo: *"Las fotografías se revisan antes de publicarse para garantizar un entorno agradable"*).

### 5.4 Libro de Firmas
- Formulario con campos de nombre y mensaje con contador dinámico (0/500).
- Envío mediante Server Action `submitGuestbookAction` con validación Zod y saneamiento anti-XSS.
- Notificación de éxito: *"¡Dedicatoria guardada! Se publicará en el libro tras una breve confirmación"*.

---

## 6. Panel de Administración (`/admin/media` y `/admin/guestbook`)

### 6.1 Panel de Medios (`/admin/media`)
- **Filtros por Estado**:
  - `Todas (50)`
  - `Pendientes (10)`: Distintivo ámbar con icono de reloj.
  - `Aprobadas (35)`: Distintivo esmeralda.
  - `Ocultas (5)`: Distintivo grafito.
- **Buscador en Vivo**: Por pie de foto, autor o nombre de archivo.
- **Moderación Masiva**:
  - Casillas de verificación individuales y botón *"Seleccionar todas las visibles"*.
  - Barra de acciones: *"Aprobar seleccionadas"*, *"Ocultar seleccionadas"*, *"Eliminar seleccionadas"*.
- **Cajón de Inspección Técnica (`MediaDetailDrawer`)**:
  - Previsualización ampliada con enlace al original.
  - Insignia de estado interactiva.
  - Edición en línea del pie de foto con botón de guardar.
  - Desglose de metadatos: Usuario, fecha, archivo, peso en MB, dimensiones y ruta segura en Storage.
  - Botones de acción directa para Aprobar, Ocultar o Eliminar.
- **Subida Oficial**: Los novios pueden subir fotografías oficiales directamente marcadas como `approved` y `visible`.

### 6.2 Moderación de Firmas (`/admin/guestbook`)
- Filtros por `Todos (20)`, `Pendientes (4)`, `Aprobados (14)` y `Ocultos (2)`.
- Búsqueda por autor o palabras clave del mensaje.
- Tarjetas con inicial del invitado, distintivo de estado y acciones rápidas: Aprobar, Ocultar, Eliminar.

---

## 7. Persistencia Híbrida y Sincronización en Tiempo Real

Siguiendo el patrón establecido en `lib/guest-store.ts`, se implementó `lib/media-data.ts` y `lib/media-store.ts`:
- Soporte completo para Supabase en la nube con Storage y PostgreSQL.
- Respaldo reactivo local con eventos `CustomEvent('boda_media_updated')` y sincronización entre pestañas (`storage` event).
- Accesibilidad fluida garantizada en entornos sin base de datos activa o en desarrollo local.
