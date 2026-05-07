# Sistema de Login con Aislamiento de Datos por Usuario — Plan de Implementación

## Resumen

Implementar autenticación de usuarios en la plataforma **Tesis AI** utilizando **Supabase Auth** y **Next.js Middleware** para la protección de rutas. Además de controlar el acceso a la aplicación, cada usuario solo podrá ver y gestionar **sus propias tesis y reportes**. El plan cubre: login con email/contraseña, protección de rutas, refresco automático de sesión, cierre de sesión y aislamiento completo de datos por usuario autenticado.

---

## Decisiones Técnicas

| Decisión | Valor | Justificación |
|---|---|---|
| Proveedor de Auth | **Supabase Auth** | Ya está instalado (`@supabase/supabase-js`). Evita agregar dependencias nuevas de terceros. |
| Paquete adicional | **`@supabase/ssr`** | Paquete oficial de Supabase para manejar sesiones con cookies en Next.js App Router (Server Components + Middleware). |
| Tipo de login | **Email + Contraseña** | Método estándar, sin complejidad adicional. Sin registro público (usuarios creados desde el Supabase Dashboard). |
| Protección de rutas | **Next.js Middleware** | Intercepta todas las peticiones antes de llegar a la página. Solución oficial de Next.js para auth. |
| Vínculo usuario ↔ tesis | **Campo `usuarioId` en modelo `Tesis`** | Almacena el UUID del usuario de `auth.users` de Supabase. Permite filtrar en todas las queries de Prisma. |
| Aislamiento de datos | **Filtro `where: { usuarioId }` en API Routes** | Todas las rutas de datos leen el `usuarioId` de la sesión activa y filtran la consulta. Nunca confiar en datos del cliente. |
| Autorización por recurso | **Validación server-side en `/api/reportes/[id]`** | Antes de devolver un reporte, se verifica que `tesis.usuarioId === usuario.id`. Retorna `403` si no coincide. |
| Modelo de usuario en BD | **No se duplica en Prisma** | Supabase Auth gestiona su propia tabla interna `auth.users`. Solo se guarda el UUID como referencia. |

---

## Arquitectura de la Solución

```
Usuario accede a cualquier ruta (ej: /dashboard)
        ↓
[middleware.ts] ¿Tiene cookie de sesión válida?
    ├── NO  → Redirige a /login
    └── SÍ  → Refresca token automáticamente → Permite acceso
                        ↓
            [/login] Usuario ingresa email + password
                        ↓
            Supabase Auth valida credenciales
                ├── ERROR → Muestra mensaje de error en formulario
                └── OK    → Guarda sesión en cookie → Redirige a /
                        ↓
            [API Routes] Leen sesión → extraen usuarioId
                        ↓
            Prisma filtra: where: { usuarioId } → solo datos propios
                        ↓
            [Sidebar] Botón "Cerrar sesión"
                        ↓
            supabase.auth.signOut() → Elimina cookie → Redirige a /login
```

### Diagrama de aislamiento de datos

```
Usuario A (uuid: aaa-111)          Usuario B (uuid: bbb-222)
        │                                   │
        │ GET /api/tesis                    │ GET /api/tesis
        ↓                                   ↓
  where: { usuarioId: "aaa-111" }    where: { usuarioId: "bbb-222" }
        ↓                                   ↓
  [Tesis de A solamente]             [Tesis de B solamente]

  GET /api/reportes/id-de-tesis-de-B
        ↓
  tesis.usuarioId ("bbb-222") !== usuario.id ("aaa-111")
        ↓
  403 Forbidden ← acceso bloqueado
```

---

## Estructura de Archivos

### Archivos nuevos a crear

```
frontend/
├── middleware.ts                                ← [NEW] Protección de rutas
└── src/
    ├── app/
    │   └── (auth)/                              ← [NEW] Grupo de rutas de autenticación
    │       ├── layout.tsx                       ← [NEW] Layout limpio sin Sidebar
    │       └── login/
    │           └── page.tsx                     ← [NEW] Página de login
    └── lib/
        ├── supabase-client.ts                   ← [NEW] Cliente Supabase para el browser
        └── supabase-server.ts                   ← [NEW] Cliente Supabase para el servidor (cookies)
```

### Archivos existentes a modificar

```
frontend/
├── prisma/
│   └── schema.prisma                            ← [MODIFY] Agregar campo usuarioId a Tesis
└── src/
    ├── app/
    │   ├── layout.tsx                           ← [MODIFY] Excluir Sidebar en rutas (auth)
    │   └── api/
    │       ├── upload/route.ts                  ← [MODIFY] Guardar usuarioId al crear tesis
    │       ├── tesis/route.ts                   ← [MODIFY] Filtrar por usuarioId en GET
    │       ├── dashboard/route.ts               ← [MODIFY] Filtrar métricas por usuarioId
    │       ├── queue/route.ts                   ← [MODIFY] Filtrar cola por usuarioId
    │       └── reportes/[id]/pdf/route.ts       ← [MODIFY] Validar propiedad antes de servir
    ├── components/
    │   └── ui/
    │       └── Sidebar.tsx                      ← [MODIFY] Agregar botón de cerrar sesión
    └── lib/
        └── supabase.ts                          ← [MODIFY] Conservar solo para API Routes del servidor
```

---

## Variables de Entorno

Agregar las siguientes variables al archivo `frontend/.env`:

```env
# --- Supabase Auth (cliente) ---
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# --- Ya existentes (conservar) ---
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
```

> [!WARNING]
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` es la clave pública usada para autenticación del lado del cliente. Es seguro exponerla al navegador.
> `SUPABASE_SERVICE_ROLE_KEY` es la clave privada con permisos de administrador. Solo debe usarse en el servidor (API Routes). **Nunca** exponerla al cliente.

---

## Fases de Implementación

### Fase 1: Instalación de dependencia

Instalar el paquete oficial de Supabase para Next.js con soporte de SSR (Server Side Rendering y cookies):

```bash
cd frontend
npm install @supabase/ssr
```

**Tiempo estimado:** 2 min

---

### Fase 2: Clientes de Supabase separados

Supabase requiere dos clientes distintos según el contexto de ejecución:

#### [NEW] `src/lib/supabase-client.ts`
Cliente para componentes del **lado del browser** (`"use client"`). Usa `createBrowserClient` de `@supabase/ssr`.

```typescript
// Usado en: componentes con "use client" (login form, sidebar logout)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### [NEW] `src/lib/supabase-server.ts`
Cliente para **Server Components y Route Handlers**. Usa `createServerClient` de `@supabase/ssr` y lee/escribe cookies de la sesión.

```typescript
// Usado en: middleware.ts, server components, API Routes
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { /* escribe cookies */ }
      }
    }
  )
}
```

**Tiempo estimado:** 10 min

---

### Fase 3: Middleware de protección de rutas

#### [NEW] `frontend/middleware.ts`

El middleware intercepta **todas las peticiones** antes de que lleguen a la página. Su lógica es:

1. Crear un cliente Supabase con acceso a las cookies de la petición.
2. Intentar refrescar la sesión del usuario (`getUser()`).
3. Si **no hay sesión** y la ruta no es `/login`, redirigir a `/login`.
4. Si **hay sesión** y la ruta es `/login`, redirigir a `/` (evitar que un usuario logueado vea el login).

```typescript
// Rutas que aplican el middleware (excluye archivos estáticos)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Tiempo estimado:** 10 min

---

### Fase 4: Layout de autenticación

#### [NEW] `src/app/(auth)/layout.tsx`

El grupo de rutas `(auth)` usa su propio layout **sin Sidebar**. Esto permite que la página de login tenga un diseño limpio centrado en pantalla, diferente al layout principal de la app.

- Fondo: color `var(--background)` o gradiente sutil del tema actual.
- Sin `<Sidebar />` ni `.app-container`.
- Contenido centrado vertical y horizontalmente.

**Tiempo estimado:** 5 min

---

### Fase 5: Página de Login

#### [NEW] `src/app/(auth)/login/page.tsx`

Formulario de autenticación con los siguientes elementos:

**Estructura visual:**
- Logo + título **"Tesis AI"** en la parte superior de la tarjeta.
- Subtítulo: *"Inicia sesión para continuar"*.
- Campo **Email** (tipo `email`, requerido).
- Campo **Contraseña** (tipo `password`, requerido).
- Botón **"Iniciar sesión"** (clase `.btn .btn-primary`, estilo pill).
- Área de mensaje de error (visible solo si hay error).
- Spinner de carga mientras se procesa la petición.

**Lógica:**
1. Al enviar el formulario, llamar a `supabase.auth.signInWithPassword({ email, password })`.
2. Si hay **error**: mostrar mensaje descriptivo debajo del formulario.
3. Si es **exitoso**: `router.push('/')` para redirigir al Upload Space.

**Estilos:** Consistentes con el diseño actual del proyecto:
- Tarjeta blanca centrada (`clean-card`).
- Colores `var(--primary)` y `var(--primary-gradient)`.
- Botón pill con sombra verde-turquesa.
- Ancho máximo de 420px.

**Tiempo estimado:** 20 min

---

### Fase 6: Cerrar sesión en el Sidebar

#### [MODIFY] `src/components/ui/Sidebar.tsx`

Agregar un botón de **"Cerrar sesión"** en la sección inferior del Sidebar (junto al avatar de usuario):

1. Importar `createClient` de `supabase-client.ts`.
2. Crear función `handleSignOut` que llame a `supabase.auth.signOut()`.
3. Después del `signOut`, redirigir con `router.push('/login')`.
4. Agregar el ícono `<LogOut>` de `lucide-react` junto al avatar de usuario en la parte inferior.

**Tiempo estimado:** 10 min

---

### Fase 7: Ajuste del layout raíz

#### [MODIFY] `src/app/layout.tsx`

El `RootLayout` actual siempre renderiza el `<Sidebar />`. Con la nueva estructura de grupos de rutas `(auth)`, el Sidebar **no se renderizará** automáticamente en las páginas dentro de `(auth)/` porque tienen su propio `layout.tsx`.

> [!NOTE]
> En Next.js App Router, los grupos de rutas `(nombre)` crean sub-layouts anidados. El `RootLayout` sigue siendo el padre, pero el `<Sidebar>` solo necesita estar en el layout de las rutas protegidas. Se evaluará si es necesario mover el `<Sidebar>` a un layout intermedio `(app)/layout.tsx`.

**Tiempo estimado:** 5 min

---

### Fase 8: Crear usuario de prueba en Supabase

Desde el **Supabase Dashboard** (`https://supabase.com/dashboard`):

1. Ir a **Authentication → Users**.
2. Clic en **"Add user"** → **"Create new user"**.
3. Ingresar email y contraseña de prueba.
4. Confirmar la creación (se puede crear más de uno para probar el aislamiento).

> [!NOTE]
> No se implementa registro público (`/register`). Los usuarios son creados manualmente por el administrador desde el Dashboard de Supabase. Esto es adecuado para el contexto académico del proyecto.

**Tiempo estimado:** 5 min

---

### Fase 9: Migración de base de datos — agregar `usuarioId` a `Tesis`

#### [MODIFY] `frontend/prisma/schema.prisma`

Agregar el campo `usuarioId` al modelo `Tesis`. Este campo almacenará el UUID del usuario autenticado (proveniente de `auth.users` de Supabase) y será el eje de todo el aislamiento de datos.

```prisma
model Tesis {
  id              String         @id @default(cuid())
  usuarioId       String         // ← UUID de auth.users de Supabase (NUEVO)
  titulo          String
  autor           String
  archivoUrl      String
  archivoNombre   String
  tipoArchivo     String
  tamanioBytes    Int
  estado          EstadoRevision @default(EN_COLA)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  revision        Revision?

  @@index([usuarioId])           // ← Índice para acelerar las consultas filtradas (NUEVO)
}
```

Luego ejecutar la migración:

```bash
cd frontend
npx prisma migrate dev --name add_usuario_id_to_tesis
npx prisma generate
```

> [!IMPORTANT]
> Si la base de datos ya tiene filas en la tabla `Tesis` sin `usuarioId`, la migración fallará porque el campo no puede ser `NOT NULL` vacío. En ese caso, ejecutar previamente:
> ```sql
> -- En el SQL Editor de Supabase, antes de migrar:
> DELETE FROM "Tesis";
> DELETE FROM "Revision";
> ```
> O bien, declarar el campo como opcional (`usuarioId String?`) temporalmente, luego poblar los registros existentes y finalmente hacerlo obligatorio.

**Tiempo estimado:** 10 min

---

### Fase 10: Aislamiento de datos en API Routes

Esta es la fase crítica. Todas las rutas que acceden a datos deben:
1. Leer la sesión del usuario desde la cookie usando `supabase-server.ts`.
2. Extraer el `usuarioId` (`session.user.id`).
3. Filtrar todas las consultas de Prisma con `where: { usuarioId }`.
4. Retornar `401 Unauthorized` si no hay sesión activa (segunda capa de seguridad, además del middleware).

---

#### [MODIFY] `src/app/api/upload/route.ts` — guardar `usuarioId` al subir

Al crear el registro de `Tesis` en Prisma, incluir el `usuarioId` del usuario autenticado:

```typescript
// 1. Leer sesión
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

// 2. Crear tesis vinculada al usuario
const tesis = await prisma.tesis.create({
  data: {
    usuarioId: user.id,   // ← campo nuevo
    titulo: ...,
    autor: ...,
    // ... resto de campos
  }
})
```

---

#### [MODIFY] `src/app/api/tesis/route.ts` — filtrar por usuario en GET

```typescript
// Antes (devuelve TODAS las tesis):
const tesis = await prisma.tesis.findMany({ ... })

// Después (devuelve solo las tesis del usuario autenticado):
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

const tesis = await prisma.tesis.findMany({
  where: { usuarioId: user.id },   // ← filtro nuevo
  orderBy: { createdAt: 'desc' },
  include: { revision: true }
})
```

---

#### [MODIFY] `src/app/api/queue/route.ts` — filtrar cola por usuario

Aplicar el mismo patrón: leer sesión → extraer `user.id` → agregar `where: { usuarioId: user.id }` al `findMany`.

---

#### [MODIFY] `src/app/api/dashboard/route.ts` — métricas solo del usuario

El dashboard actualmente agrega datos de **todas** las revisiones. Debe filtrar para mostrar únicamente las estadísticas de las tesis del usuario logueado:

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

// Obtener solo las tesis del usuario
const tesisList = await prisma.tesis.findMany({
  where: { usuarioId: user.id },
  include: { revision: true }
})

// Derivar revisiones de esas tesis (no consultar Revision directamente)
const revisiones = tesisList
  .map(t => t.revision)
  .filter(Boolean)

// El resto del cálculo de KPIs, approvalData y sectionsData
// se hace igual pero sobre este subconjunto filtrado
```

---

#### [MODIFY] `src/app/api/reportes/[id]/pdf/route.ts` — validar propiedad del reporte

Antes de servir el PDF o los datos del reporte, verificar que la tesis pertenece al usuario:

```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

const tesis = await prisma.tesis.findUnique({
  where: { id: params.id },
  include: { revision: true }
})

// Verificar propiedad
if (!tesis) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
if (tesis.usuarioId !== user.id) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

// Recién aquí se sirven los datos del reporte
```

**Tiempo estimado total Fase 10:** 30 min

---

### Fase 11: Prueba de aislamiento con dos usuarios

Crear **dos usuarios** en el Supabase Dashboard y verificar el aislamiento completo:

**Setup:**
- Usuario A: `usuarioa@test.com`
- Usuario B: `usuariob@test.com`

**Pruebas:**
- [ ] Loguearse como **Usuario A** → subir una tesis → verificar que aparece en la cola y en reportes.
- [ ] Cerrar sesión → loguearse como **Usuario B** → la cola debe estar **vacía** (no ve la tesis de A).
- [ ] Usuario B sube su propia tesis → aparece en su cola y reportes.
- [ ] Cerrar sesión → loguearse como **Usuario A** → solo ve su propia tesis, no la de B.
- [ ] Como **Usuario A**, intentar acceder directamente a `http://localhost:3000/reportes/[id-de-tesis-de-B]` → debe mostrar error `403 Acceso denegado` o redirigir.
- [ ] El dashboard de cada usuario muestra métricas **independientes**.

**Tiempo estimado:** 15 min

---

### Fase 12: Prueba end-to-end general

Verificar el flujo completo de autenticación y autorización:

**Autenticación:**
- [ ] Acceder a `http://localhost:3000/` sin sesión → debe redirigir a `/login`.
- [ ] Ingresar credenciales incorrectas → debe mostrar mensaje de error.
- [ ] Ingresar credenciales correctas → debe redirigir a `/` (Upload Space).
- [ ] Navegar entre `/dashboard` y `/reportes` → debe funcionar con sesión activa.
- [ ] Refrescar la página → la sesión debe persistir.
- [ ] Clic en "Cerrar sesión" → debe redirigir a `/login`.
- [ ] Intentar acceder a `/dashboard` después de cerrar sesión → debe redirigir a `/login`.

**Autorización:**
- [ ] Cada usuario ve solo sus propias tesis en la cola.
- [ ] Cada usuario ve solo sus propios reportes.
- [ ] El dashboard de cada usuario refleja solo sus propias métricas.
- [ ] Un usuario no puede acceder al reporte de otro usuario por URL directa.

**Tiempo estimado:** 15 min

---

## Resumen de tiempos

| Paso | Componente | Tiempo Est. |
|------|-----------|-------------|
| 1 | Instalar `@supabase/ssr` | 2 min |
| 2 | Crear `supabase-client.ts` y `supabase-server.ts` | 10 min |
| 3 | Crear `middleware.ts` | 10 min |
| 4 | Crear `(auth)/layout.tsx` | 5 min |
| 5 | Crear `(auth)/login/page.tsx` | 20 min |
| 6 | Modificar `Sidebar.tsx` con logout | 10 min |
| 7 | Ajustar `layout.tsx` raíz | 5 min |
| 8 | Crear usuarios de prueba en Supabase | 5 min |
| 9 | Migración Prisma: campo `usuarioId` | 10 min |
| 10 | Aislamiento en API Routes (upload, tesis, queue, dashboard, reportes) | 30 min |
| 11 | Prueba de aislamiento con dos usuarios | 15 min |
| 12 | Prueba end-to-end general | 15 min |
| **Total** | | **~2 horas 17 min** |

---

## Notas Finales

- **Sin registro público**: Los usuarios son administrados directamente desde el Supabase Dashboard. Esto simplifica la implementación y es apropiado para un sistema de uso interno académico.
- **Sin recuperación de contraseña (por ahora)**: Se puede agregar en una iteración futura con `supabase.auth.resetPasswordForEmail()`.
- **Sin roles diferenciados**: Todos los usuarios autenticados tienen el mismo nivel de acceso a sus propios datos. Si en el futuro se necesitan roles (admin que vea todo, revisor, tesista), Supabase Auth soporta `user_metadata` para esto.
- **Seguridad del token**: `@supabase/ssr` maneja el refresco del token automáticamente en el middleware. No es necesario manejar la expiración manualmente.
- **Doble capa de seguridad**: El middleware protege las páginas (rutas del cliente), y cada API Route valida la sesión de forma independiente. Esto asegura que incluso llamadas directas a la API sin pasar por el navegador sean rechazadas si no hay sesión válida.
- **El campo `autor` en `Tesis` se conserva**: Sigue siendo texto libre para identificar al autor académico del documento. El `usuarioId` es el identificador del usuario del sistema que hizo la carga, que puede ser diferente (ej: un coordinador que sube tesis de varios autores).
