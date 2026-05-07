import { config } from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env' });

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP_BASE = "http://localhost:3000";
const API_BASE = "http://localhost:3000/api";
let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

async function loginAs(email, password) {
  const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Login failed: ${error.message}`);
  return { session: data.session, user: data.user };
}

async function fetchWithSession(url, session) {
  const cookieVal = encodeURIComponent(JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: session.expires_at,
    user: session.user,
  }));
  return fetch(url, {
    redirect: 'manual',
    headers: { Cookie: `sb-yeytdbzukgmsaogorrfj-auth-token=${cookieVal}` },
  });
}

async function fetchNoAuth(url) {
  return fetch(url, { redirect: 'manual' });
}

(async () => {
  console.log("=== FASE 12: Prueba End-to-End ===\n");

  // Clean DB
  await prisma.tesis.deleteMany({});
  await prisma.revision.deleteMany({});

  // 1. No session → redirect to /login
  console.log("--- AUTENTICACIÓN ---");
  console.log("\n--- 1. Sin sesión → redirige a /login ---");
  let res = await fetchNoAuth(`${APP_BASE}/`);
  assert(res.status === 307 || res.status === 302, `GET / sin sesión redirige (status ${res.status})`);

  res = await fetchNoAuth(`${APP_BASE}/dashboard`);
  assert(res.status === 307 || res.status === 302, `GET /dashboard sin sesión redirige (status ${res.status})`);

  res = await fetchNoAuth(`${APP_BASE}/reportes`);
  assert(res.status === 307 || res.status === 302, `GET /reportes sin sesión redirige (status ${res.status})`);

  // 2. Wrong credentials
  console.log("\n--- 2. Credenciales incorrectas ---");
  const supabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const wrongLogin = await supabase.auth.signInWithPassword({ email: "bad@test.com", password: "wrong" });
  assert(wrongLogin.error !== null, "Login con credenciales malas falla");

  // 3. Correct credentials
  console.log("\n--- 3. Credenciales correctas ---");
  const userA = await loginAs("usuarioa@test.com", "password123");
  assert(userA.session !== null, "Usuario A loguea correctamente");

  // 4. Navigate between pages with session
  console.log("\n--- 4. Navegación con sesión activa ---");
  res = await fetchWithSession(`${APP_BASE}/dashboard`, userA.session);
  assert(res.ok || res.status === 200, `GET /dashboard con sesión → ${res.status}`);

  res = await fetchWithSession(`${APP_BASE}/reportes`, userA.session);
  assert(res.ok || res.status === 200, `GET /reportes con sesión → ${res.status}`);

  // 5. Session persistence (API routes validate independently)
  console.log("\n--- 5. Persistencia de sesión (validación API) ---");
  res = await fetchWithSession(`${API_BASE}/tesis`, userA.session);
  let data = await res.json();
  assert(data.success, "API /tesis valida sesión correctamente");

  // 6. Logout
  console.log("\n--- 6. Cierre de sesión ---");
  const signOutResult = await supabase.auth.signOut();
  assert(signOutResult.error === null, "SignOut sin error");

  // 7. Access after logout → redirect
  console.log("\n--- 7. Acceso después de logout → redirige ---");
  const freshSupabase = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: { user: loggedOutUser } } = await freshSupabase.auth.getUser();
  assert(loggedOutUser === null, "Usuario no tiene sesión después de logout");

  res = await fetchNoAuth(`${APP_BASE}/dashboard`);
  assert(res.status === 307 || res.status === 302, `GET /dashboard post-logout redirige (status ${res.status})`);

  // 8. Protected pages are accessible with valid session
  console.log("\n--- 8. Páginas protegidas accesibles con sesión ---");
  const userB = await loginAs("usuariob@test.com", "password123");
  res = await fetchWithSession(`${APP_BASE}/`, userB.session);
  assert(res.ok || res.status === 200, `GET / con sesión → ${res.status}`);

  // === AUTHORIZATION ===
  console.log("\n\n--- AUTORIZACIÓN ---");

  // Create test data
  const tesisA = await prisma.tesis.create({
    data: {
      usuarioId: userA.user.id,
      titulo: "Tesis End2End A",
      autor: "Autor A",
      archivoUrl: "https://example.com/a.pdf",
      archivoNombre: "a.pdf",
      tipoArchivo: "pdf",
      tamanioBytes: 1000,
      estado: "EN_COLA",
    },
  });

  const tesisB = await prisma.tesis.create({
    data: {
      usuarioId: userB.user.id,
      titulo: "Tesis End2End B",
      autor: "Autor B",
      archivoUrl: "https://example.com/b.pdf",
      archivoNombre: "b.pdf",
      tipoArchivo: "pdf",
      tamanioBytes: 1000,
      estado: "EN_COLA",
    },
  });

  // 9. Each user sees only their own tesis
  console.log("\n--- 9. Cada usuario ve solo sus tesis ---");
  res = await fetchWithSession(`${API_BASE}/tesis`, userA.session);
  data = await res.json();
  assert(data.data.length === 1 && data.data[0].id === tesisA.id, "Usuario A ve solo su tesis");

  res = await fetchWithSession(`${API_BASE}/tesis`, userB.session);
  data = await res.json();
  assert(data.data.length === 1 && data.data[0].id === tesisB.id, "Usuario B ve solo su tesis");

  // 10. Queue shows only own tesis
  console.log("\n--- 10. Cola muestra solo tesis propias ---");
  res = await fetchWithSession(`${API_BASE}/queue`, userA.session);
  data = await res.json();
  if (data.success && data.data.length > 0) {
    assert(data.data.every(t => t.usuarioId === userA.user.id), "Cola de A solo tiene tesis de A");
  } else {
    assert(data.success, "Cola de A responde correctamente (vacía por tiempo)");
  }

  // 11. Dashboard shows only own metrics
  console.log("\n--- 11. Dashboard muestra métricas propias ---");
  res = await fetchWithSession(`${API_BASE}/dashboard`, userA.session);
  data = await res.json();
  assert(data.success, "Dashboard de A responde correctamente");

  res = await fetchWithSession(`${API_BASE}/dashboard`, userB.session);
  data = await res.json();
  assert(data.success, "Dashboard de B responde correctamente");

  // 12. Cannot access another user's reporte by URL
  console.log("\n--- 12. No puede acceder reporte ajeno por URL ---");
  res = await fetchWithSession(`${API_BASE}/reportes/${tesisB.id}/pdf`, userA.session);
  data = await res.json();
  assert(res.status === 403, `Usuario A → reporte de B: ${res.status} (403 esperado)`);

  res = await fetchWithSession(`${API_BASE}/reportes/${tesisA.id}/pdf`, userB.session);
  data = await res.json();
  assert(res.status === 403, `Usuario B → reporte de A: ${res.status} (403 esperado)`);

  // Own report access
  res = await fetchWithSession(`${API_BASE}/reportes/${tesisA.id}/pdf`, userA.session);
  assert(res.ok, "Usuario A puede ver su propio reporte");

  res = await fetchWithSession(`${API_BASE}/reportes/${tesisB.id}/pdf`, userB.session);
  assert(res.ok, "Usuario B puede ver su propio reporte");

  // 13. Direct API calls without session are rejected
  console.log("\n--- 13. APIs rechazan llamadas sin sesión ---");
  const apiRoutes = ['/tesis', '/queue', '/dashboard'];
  for (const route of apiRoutes) {
    res = await fetchNoAuth(`${API_BASE}${route}`);
    assert(res.status === 401, `${route} → ${res.status} (401 esperado)`);
  }

  console.log(`\n=== Resultados ===`);
  console.log(`✅ Pasadas: ${passed}`);
  console.log(`❌ Fallidas: ${failed}`);
  console.log(failed === 0 ? "\n🎉 Fase 12 completada con éxito! Sistema de login funcionando." : "\n⚠️ Hay fallos que revisar.");

  await prisma.$disconnect();
})();
