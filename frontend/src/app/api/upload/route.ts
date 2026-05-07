import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase-server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar sesión del usuario
    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as unknown as File;
    const autor = (formData.get("autor") as string) || "Anónimo";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `tesis/${uniqueFileName}`;

    // Convert to ArrayBuffer then Buffer for Supabase upload via JS SDK in Node
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let archivoUrl = '';

    if (isSupabaseConfigured && supabase) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tesis-bucket') // Asume que tienes un bucket llamado 'tesis-bucket'
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError);
        return NextResponse.json({ success: false, error: "Failed to upload to Supabase" }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage.from('tesis-bucket').getPublicUrl(filePath);
      archivoUrl = publicUrlData.publicUrl;
    } else {
      // Fallback local if Supabase is not configured:
      // guardamos el archivo en /uploads y exponemos un endpoint GET /uploads/:filename
      const uploadsDir = path.join(process.cwd(), "..", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, uniqueFileName), buffer);

      // ARCHIVO_PUBLIC_BASE_URL: base alcanzable desde n8n en Docker (p. ej. http://host.docker.internal:3000)
      const appUrl =
        (process.env.ARCHIVO_PUBLIC_BASE_URL || "").trim() ||
        (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
      archivoUrl = `${appUrl.replace(/\/$/, "")}/uploads/${encodeURIComponent(uniqueFileName)}`;
    }

    // 2. Save metadata to PostgreSQL via Prisma
    const tesis = await prisma.tesis.create({
      data: {
        usuarioId: user.id,
        titulo: file.name.replace(`.${fileExt}`, ''),
        autor,
        archivoUrl,
        archivoNombre: file.name,
        tipoArchivo: fileExt,
        tamanioBytes: file.size,
        estado: 'EN_COLA'
      }
    });

    // 3. Trigger n8n webhook
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tesisId: tesis.id,
            archivoUrl: archivoUrl,
            archivoNombre: file.name,
            tipoArchivo: fileExt
          })
        });
      } catch (webhookError: any) {
        console.error("n8n Webhook Error:", webhookError);
        // If webhook fails, mark as error so it doesn't stay in queue forever
        await prisma.tesis.update({
          where: { id: tesis.id },
          data: { estado: 'ERROR' }
        });
        await prisma.revision.create({
          data: {
            tesisId: tesis.id,
            estadoGeneral: 'Error',
            puntuacionGeneral: 0,
            tiempoProcesamiento: 0,
            observaciones: [
              {
                seccion: "Sistema",
                estado: "Error",
                comentario: "No se pudo contactar con n8n. El servidor de análisis podría estar inactivo.",
                sugerencia: "Revisa la conexión de n8n o contacta al administrador."
              }
            ]
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "File uploaded successfully",
      tesisId: tesis.id
    });

  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
