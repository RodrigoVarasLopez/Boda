# Guía Definitiva de Despliegue en Producción: Vercel + Supabase
**Boda de Stephanie & Rodrigo**
*Bodega Concejo · Valoria la Buena (Valladolid) · 25 de Agosto de 2027*

---

## 1. Arquitectura y Fuente de Verdad

Esta guía describe el procedimiento técnico y operativo para llevar la plataforma de la boda desde el repositorio local a producción en alta disponibilidad con **Vercel** y **Supabase**.

```
                           [ Invitados vía WhatsApp ]
                                       │
                                       ▼
                   Dominio Canónico (HTTPS / DNS / SSL)
                       https://boda.stephanieyrodrigo.com
                                       │
                                       ▼
                     Vercel Edge Network & Production
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
        [ Next.js 15 App Router ]                   [ Seguridad & Headers ]
        ├── /                        (Landing)       ├── HSTS (max-age 2y)
        ├── /w/stephanie-y-rodrigo   (Web Pública)   ├── X-Frame-Options: SAMEORIGIN
        ├── /i/[token]               (Invitaciones)  ├── X-Content-Type-Options: nosniff
        ├── /admin/*                 (Admin OS)      ├── Referrer-Policy
        ├── /robots.txt & sitemap.xml                └── Permissions-Policy
                │
                ▼
     [ Supabase Cloud (eu-west / Madrid / Frankfurt) ]
     ├── PostgreSQL 15+ (Esquema relacional, RLS estricto, RPC)
     ├── Auth (Admin accounts con contraseñas seguras)
     └── Storage: bucket 'wedding-media' (10MB, WebP/JPG/PNG, URLs firmadas)
```

### Identidad Oficial de la Boda
* **Pareja**: Stephanie & Rodrigo
* **Fecha**: 25 de Agosto de 2027
* **Preboda**: Viernes 27 de Agosto de 2027 · Bodega privada con cata de vino (Burro Loco)
* **Boda**: Sábado 28 de Agosto de 2027 · Ceremonia civil, banquete al aire libre con música en directo y barra libre con DJ
* **Lugar**: Bodega Concejo
* **Dirección**: Ctra. Valoria Km 3,6, 47200 Valoria la Buena (Valladolid)
* **Zona Horaria**: `Europe/Madrid`

---

## 2. Preparación del Repositorio Git

El despliegue continuo de Vercel está conectado a la rama principal:
* **Repositorio**: `https://github.com/RodrigoVarasLopez/Boda`
* **Rama de producción**: `main`

### Verificaciones previas
1. **Árbol de trabajo limpio**: Sin archivos de depuración ni `.env` versionados.
2. **.gitignore reforzado**:
   ```gitignore
   .next/
   node_modules/
   .env*.local
   .env
   .vercel/
   .system_generated/
   *.tsbuildinfo
   ```
3. **Secretos no expuestos**: Ninguna variable sensible con prefijo `NEXT_PUBLIC_`.

---

## 3. Configuración en Vercel

### 3.1. Conexión del Proyecto
1. Acceder al dashboard de [Vercel](https://vercel.com).
2. Seleccionar **Add New...** → **Project**.
3. Importar el repositorio `RodrigoVarasLopez/Boda`.
4. Configuración del proyecto:
   * **Framework Preset**: `Next.js`
   * **Root Directory**: `./`
   * **Build Command**: `npm run build` (o dejar por defecto)
   * **Output Directory**: `.next` (por defecto)
   * **Install Command**: `npm install`

### 3.2. Variables de Entorno en Vercel
En la pestaña **Settings** → **Environment Variables**, definir las siguientes variables para los entornos **Production** (y opcionalmente Preview):

| Variable | Tipo | Entornos | Descripción |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Público | Production, Preview | URL del proyecto Supabase (ej: `https://xyzcompany.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Público | Production, Preview | Clave anónima pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreto Server-Side** | Production, Preview | Clave administrativa de Supabase (**NUNCA** con prefijo `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_SITE_URL` | Público | Production | URL base canónica (ej: `https://boda.stephanieyrodrigo.com`) |

> [!CAUTION]
> **Seguridad Crítica**: `SUPABASE_SERVICE_ROLE_KEY` omite Row Level Security. Sólo debe estar disponible en Node.js Server Actions y Middleware. La arquitectura de `Boda Web` bloquea activamente su importación en componentes cliente mediante guardia en tiempo de ejecución en `lib/supabase/admin.ts`.

---

## 4. Configuración del Dominio Personalizado y DNS

Para asegurar que los invitados reciban enlaces elegantes y confiables por WhatsApp:

1. En Vercel: **Settings** → **Domains**.
2. Añadir el dominio canónico:
   * Ejemplo recomendado: `boda.stephanieyrodrigo.com` o `stephanieyrodrigo.com`.
3. Configurar los registros DNS en el registrador (Cloudflare, DonDominio, GoDaddy, etc.):
   * **Para subdominio (`boda.stephanieyrodrigo.com`)**:
     * Registro: `CNAME`
     * Host: `boda`
     * Valor: `cname.vercel-dns.com`
   * **Para dominio apex (`stephanieyrodrigo.com`)**:
     * Registro: `A`
     * Host: `@`
     * Valor: `76.76.21.21`
     * Registro: `CNAME` para `www` apuntando a `cname.vercel-dns.com` con redirección 301 a apex.
4. Vercel emitirá y renovará automáticamente los certificados SSL / TLS Let's Encrypt de forma gratuita.

---

## 5. Configuración del Proyecto Supabase en Producción

### 5.1. Creación del Proyecto
1. Acceder a [supabase.com](https://supabase.com).
2. Crear un nuevo proyecto en la región europea más cercana: `West EU (Frankfurt)` o `Spain (Madrid)` si está disponible.
3. Copiar las claves de API desde **Project Settings** → **API**:
   * Project URL
   * anon / public key
   * service_role key

### 5.2. Aplicación de Migraciones SQL
En el panel **SQL Editor** de Supabase, ejecutar en orden las migraciones del repositorio:

#### Paso 1: Esquema Base y RLS
Ejecutar el contenido de:
`supabase/migrations/20261002000000_schema_and_rls.sql`
* Crea extensiones `uuid-ossp` y `pgcrypto`.
* Crea tablas: `profiles`, `weddings`, `guest_groups`, `guests`, `events`, `group_events`, `invitations`, `rsvp_responses`, `guestbook_entries`, `media_photos`, `wedding_blocks`.
* Configura Row Level Security (RLS) en todas las tablas.
* Crea la función RPC `get_invitation_by_token(p_token text)`.

#### Paso 2: Almacenamiento Multimedia y Moderación
Ejecutar el contenido de:
`supabase/migrations/20261007000000_media_storage_and_guestbook.sql`
* Crea el bucket de almacenamiento: `wedding-media` (límite 10 MB, formatos `image/jpeg`, `image/png`, `image/webp`).
* Configura políticas de Storage para subidas anónimas/invitados y lectura mediante URLs firmadas.
* Establece las políticas de moderación para fotografías y dedicatorias del libro de firmas.

### 5.3. Creación del Usuario Administrador
1. En Supabase: **Authentication** → **Users** → **Add User** (Create user).
2. Introducir el correo electrónico de Rodrigo o Stephanie (ej: `rodrigo@bodaweb.app`) y una contraseña segura.
3. Marcar **Auto Confirm User?** como activado.
4. En **Table Editor** → tabla `profiles`, verificar o insertar el perfil con rol `owner`:
   ```sql
   INSERT INTO profiles (id, full_name, role)
   VALUES ('<USER_UUID>', 'Rodrigo & Stephanie', 'owner')
   ON CONFLICT (id) DO UPDATE SET role = 'owner';
   ```

---

## 6. Hardening y Medidas de Seguridad Implementadas

1. **Desactivación Estricta de Modo Demo en Producción**:
   * En `middleware.ts`, el bypass de la cookie `boda_admin_demo` está desactivado cuando `NODE_ENV === 'production'`.
   * En `/admin/login`, el botón "Entrar en Modo Demostración" no se renderiza en producción. Todo acceso a `/admin/*` exige una sesión criptográfica activa en Supabase Auth.
2. **Protección de Privacidad de Invitados**:
   * `/i/[token]` cuenta con directiva `robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }`.
   * Los tokens individuales nunca se incluyen en `sitemap.xml` ni en metadatos Open Graph públicos.
3. **Control de Rastreadores (SEO)**:
   * `app/robots.ts` prohíbe explícitamente indexar `/admin/`, `/i/` y `/api/`.
   * `app/sitemap.ts` indexa únicamente las rutas públicas canónicas: `/` y `/w/stephanie-y-rodrigo`.
4. **Cabeceras HTTP de Seguridad (Security Headers)**:
   * `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   * `X-Frame-Options: SAMEORIGIN` (prevención de Clickjacking)
   * `X-Content-Type-Options: nosniff` (prevención de MIME-sniffing)
   * `Referrer-Policy: strict-origin-when-cross-origin`
   * `Permissions-Policy: camera=(), microphone=(), geolocation=()`
5. **Configuración de Imágenes**:
   * `next.config.js` permite optimización remota exclusivamente desde `images.unsplash.com` y `*.supabase.co`.

---

## 7. Protocolo de Pruebas Post-Despliegue (Smoke Tests)

Una vez completado el despliegue en Vercel, ejecutar las siguientes comprobaciones en un dispositivo móvil y en escritorio:

| Caso de Prueba | Ruta | Procedimiento | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **Web Pública** | `/w/stephanie-y-rodrigo` | Cargar en navegador móvil | Vista editorial directa con tipografía Cormorant, fotos de Bodega Concejo, agenda y formulario de contacto. Sin sobre interactivo bloqueando. |
| **Invitación WhatsApp** | `/i/[token]` | Abrir enlace de un invitado | Sobre animado personalizado con lacre digital, revelación fluida, agenda adaptada al grupo del invitado, confirmación de asistencia RSVP. |
| **Confirmación RSVP** | `/i/[token]` | Enviar RSVP (asistiré / no asistiré, alergias, autobús) | Confirmación inmediata con confeti editorial, estado guardado en base de datos. Sin posibilidad de duplicados accidentales. |
| **Subida de Foto Invitado** | `/w/stephanie-y-rodrigo` o `/i/[token]` | Subir fotografía en sección Memorias | Previsualización, subida validada a bucket `wedding-media`, estado inicial `pending` (pendiente de moderación). |
| **Firma en Libro de Visitas** | `/w/stephanie-y-rodrigo` | Enviar mensaje con nombre y dedicatoria | Notificación de mensaje enviado pendiente de aprobación. |
| **Acceso Admin Seguro** | `/admin` | Intentar acceder sin iniciar sesión | Redirección 307 inmediata a `/admin/login`. |
| **Inicio de Sesión Admin** | `/admin/login` | Introducir credenciales Supabase Auth | Acceso al panel de control integral de la boda. |
| **Moderación en Vivo** | `/admin/media` y `/admin/guestbook` | Aprobar foto subida y mensaje | El elemento aprobado pasa inmediatamente a ser visible en la galería y muro de recuerdos de la web pública. |

---

## 8. Mantenimiento y Operaciones

* **Envío masivo por WhatsApp**: Copiar los enlaces generados en `/admin/guests` (botón "Copiar enlace de WhatsApp" con mensaje pre-redactado).
* **Exportación de lista para la bodega**: En `/admin/rsvp`, consultar el recuento total de comensales, menús especiales y usuarios del servicio de autobús de Valladolid.
* **Descarga de fotos**: Las fotografías originales compartidas por los invitados se conservan en alta resolución en el bucket `wedding-media` de Supabase para su descarga en cualquier momento.
