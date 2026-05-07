# Prompt de Diseño - Tesis AI

Usa este prompt para replicar el sistema de diseño completo de la aplicación Tesis AI.

---

## Prompt

```
Crea una interfaz de usuario siguiendo exactamente este sistema de diseño:

## Stack Técnico
- Framework: Next.js (App Router)
- CSS Modules para componentes específicos + CSS global compartido
- React Server Components por defecto, "use client" solo cuando sea necesario
- Iconos: lucide-react
- Gráficos: recharts
- Tipografía: Poppins (headings) + Inter (body) — variables CSS `--font-poppins` y `--font-inter`

## Paleta de Colores (variables CSS en :root)
--background: #F8FAFC;          /* Fondo general gris azulado muy claro */
--foreground: #334155;          /* Texto principal */
--primary: #1abc9c;             /* Color principal teal/verde */
--primary-hover: #16a085;       /* Hover del primario */
--primary-gradient: linear-gradient(135deg, #1de9b6 0%, #1dc4e9 100%);
--secondary: #FFFFFF;           /* Fondos de tarjetas */
--text-muted: #94a3b8;          /* Texto secundario/subtítulos */
--success: #10b981;             /* Verde para éxito */
--warning: #f59e0b;             /* Ámbar para advertencias */
--error: #ef4444;               /* Rojo para errores */
--border: #e2e8f0;              /* Bordes sutiles */
--card-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
--card-shadow-hover: 0 10px 30px rgba(0, 0, 0, 0.1);

## Fondo Global
El body tiene pseudo-elementos ::before y ::after con:
- Forma circular (border-radius: 50%)
- Filtro: blur(100px)
- ::before: top -10%, left -5%, 50vw, color primario con opacidad 0.15
- ::after: bottom -10%, right -5%, 60vw, color #1dc4e9 con opacidad 0.1

## Tipografía
- Headings: font-family var(--font-poppins), color #1e293b, font-weight 600
  h1: 2.5rem, h2: 2rem, h3: 1.5rem
- Body: font-family var(--font-inter), color var(--text-muted), line-height 1.6

## Componentes Reutilizables

### Clean Card (.clean-card)
- background: white
- border: 1px solid var(--border)
- border-radius: 16px
- padding: 24px
- box-shadow: var(--card-shadow)
- hover: translateY(-2px) + box-shadow hover
- Usada para contenedores de contenido, métricas, gráficos

### Botones (.btn, .btn-primary, .btn-outline)
- .btn: display inline-flex, padding 0.6rem 1.5rem, border-radius 9999px (pill), font-weight 600, font-size 0.875rem, font-family Poppins
- .btn-primary: gradiente primary-gradient, texto blanco, shadow 0 4px 15px rgba(29,233,182,0.3), hover: translateY(-1px) + shadow más grande
- .btn-outline: fondo transparente, color primario, border 1px solid primary, hover: fondo rgba(26,188,156,0.05)

### Badges (.badge + variantes)
- padding: 0.3rem 1rem, border-radius: 9999px, font-size: 0.75rem, font-weight: 600, font Inter, text-transform: capitalize, inline-flex centered
- .badge-success: bg #E6F4EA, color #1e8e3e
- .badge-warning: bg #FEF7E0, color #f29900
- .badge-error: bg #FCE8E6, color #d93025
- .badge-info: bg #E8F0FE, color #1a73e8
- .badge-default: bg #F1F3F4, color #5f6368

### Layout (.app-container, .main-content)
- .app-container: flex, min-height 100vh
- .main-content: flex 1, padding 2.5rem, margin-left 260px (sidebar)

## Animaciones
- .animate-fade-in: keyframes fadeIn (opacity 0→1, translateY 10px→0, 0.4s ease)
- .animate-spin: keyframes spin (rotate 0→360, 1s linear infinite)
- Transiciones globales: all 0.3s ease

## Página de Login
- Layout de 2 columnas en grid (1fr 1fr), max-width 1080px, min-height 600px
- Panel izquierdo: gradiente linear-gradient(135deg, #0f766e, #0d9488, #0891b2), con logo en caja glassmorphism (rgba 255,255,255,0.15 + backdrop-filter blur), título blanco, features en cajas con border rgba(255,255,255,0.12)
- Panel derecho: formulario centrado, max-width 400px
- Inputs: padding 14px 16px, border 1.5px solid #e2e8f0, border-radius 12px, bg #f8fafc, focus: border-color primary + shadow 0 0 0 4px rgba(26,188,156,0.1)
- Botón submit: gradiente primary-gradient, border-radius 12px, padding 14px 24px, font Poppins
- Fondo del layout: linear-gradient(135deg, rgba(26,188,156,0.08) 0%, rgba(29,196,233,0.08) 100%)
- Responsive: en max-width 840px pasa a 1 columna, en 480px el wrapper pierde border-radius

## Página de Dashboard
- Server Component que obtiene datos directo de DB (Prisma + Supabase auth)
- DashboardClient ("use client") con Recharts
- Header con título + badge "Sistema Activo" (bg rgba(26,188,156,0.1), border rgba(26,188,156,0.3))
- KPIs en grid: repeat(auto-fit, minmax(220px, 1fr)), gap 1.25rem
- Gráficos en grid 2 columnas: PieChart (donut, innerRadius 70, outerRadius 100) + BarChart con gradiente teal
- Colores de gráficos: ['#1abc9c', '#1dc4e9', '#a78bfa', '#f59e0b']
- Tooltip de recharts: bg white, border #e2e8f0, borderRadius 12px, shadow 0 10px 30px rgba(0,0,0,0.1)

## Principios de Diseño
- Limpio, minimalista, con mucho espacio en blanco
- Bordes sutiles (1px solid #e2e8f0) en lugar de sombras pesadas
- Sombras suaves y progresivas (hover eleva más)
- Gradientes teal→cyan como acento principal
- Border-radius generoso (12px-16px para cards, 9999px para pills/badges)
- Iconos de lucide-react con tamaño 18-22px
- Estados vacíos con texto muted centrado
- Todas las transiciones a 0.3s ease
```

---

## Referencia Rápida de Archivos del Diseño

| Archivo | Propósito |
|---------|-----------|
| `src/app/globals.css` | Variables CSS, utilidades globales, componentes reutilizables |
| `src/app/(auth)/layout.tsx` | Layout de páginas de autenticación con fondo degradado |
| `src/app/(auth)/login/page.tsx` | Página de login con panel dual |
| `src/app/(auth)/login/login.module.css` | Estilos del login |
| `src/app/(app)/dashboard/page.tsx` | Server Component del dashboard |
| `src/app/(app)/dashboard/DashboardClient.tsx` | Componente cliente con gráficos |
| `src/lib/dashboard-data.ts` | Lógica de datos compartida (Prisma) |
| `src/lib/supabase-server.ts` | Cliente Supabase para Server Components |
| `src/lib/supabase-client.ts` | Cliente Supabase para Client Components |
| `src/lib/prisma.ts` | Configuración de Prisma |
| `middleware.ts` | Middleware de autenticación con SSR cookies |
