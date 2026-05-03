# Tesis AI - Revisor Automático

Sistema inteligente para la revisión automática de tesis utilizando **Next.js**, **n8n**, **Supabase** y modelos de inteligencia artificial.

## Arquitectura del Proyecto

El proyecto está compuesto por los siguientes componentes:
- **Frontend / Backend (Next.js)**: Interfaz de usuario y rutas API para la gestión de las tesis y visualización de los reportes. Construido con Tailwind CSS y Turbopack.
- **Base de Datos (Supabase)**: Almacena los metadatos de las tesis y el registro de revisiones. Usamos Prisma como ORM.
- **Workflow Engine (n8n)**: Orquesta el flujo de revisión, recibiendo el webhook, procesando con IA y devolviendo los datos. Funciona en Docker.
- **Generador de Reportes (Gotenberg)**: Servicio en Docker para generación de PDFs.

## Requisitos Previos

- Node.js (v20 o superior)
- Docker y Docker Compose
- Una cuenta en [Supabase](https://supabase.com/)

## Configuración del Proyecto

1. **Clonar el repositorio**:
   ```bash
   git clone <tu-repositorio>
   cd revision-tesis
   ```

2. **Configurar las variables de entorno**:
   - Copia el archivo de ejemplo para el frontend:
     ```bash
     cp frontend/.env.example frontend/.env
     ```
   - Configura tus credenciales de Supabase en `frontend/.env`.
   - Copia el archivo de ejemplo para n8n:
     ```bash
     cp .env.n8n.example .env.n8n
     ```

3. **Instalar las dependencias del Frontend**:
   ```bash
   cd frontend
   npm install
   ```

4. **Aplicar Migraciones a Supabase**:
   Asegúrate de que la `DATABASE_URL` esté configurada apuntando a tu Supabase en `frontend/.env`.
   ```bash
   cd frontend
   npx prisma migrate deploy
   npx prisma generate
   ```

## Ejecución del Proyecto

1. **Levantar los servicios de infraestructura (n8n y Gotenberg)**:
   Desde la raíz del proyecto, ejecuta:
   ```bash
   docker-compose up -d
   ```

2. **Levantar el Frontend**:
   Abre otra terminal, ve a la carpeta `frontend` y ejecuta:
   ```bash
   npm run dev
   ```

3. **Acceder a la aplicación**:
   - La plataforma estará disponible en [http://localhost:3000](http://localhost:3000).
   - El panel de automatización n8n estará disponible en [http://localhost:5678](http://localhost:5678).

## Notas Importantes

- El flujo automatizado de revisión requiere que el workflow de revisión de tesis esté importado y activado en tu instancia de n8n.
- Las integraciones de IA (como Gemini/OpenAI) deben estar configuradas directamente en n8n o como variables dentro del flujo de revisión.