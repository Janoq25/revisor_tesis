# Configuración del Workflow en n8n

Para que el sistema de revisión funcione, necesitas importar y configurar un workflow en tu instancia local de n8n.

## Pasos para la configuración

1. Accede a n8n en `http://localhost:5678`.
2. Ve a **Workflows** y haz clic en **Add workflow**.
3. Importa el workflow o créalo manualmente con la siguiente estructura:

### Nodos del Workflow

1. **Webhook**:
   - Path: `revision-tesis`
   - Method: `POST`
   - Respond: `Immediately`
   - *Este nodo recibe la petición desde Next.js con el `tesisId` y `archivoUrl`.*

2. **HTTP Request** (Descarga):
   - Method: `GET`
   - URL: `={{ $json.body.archivoUrl }}`
   - Response Format: `File`
   - *Descarga el archivo PDF/DOCX desde Supabase.*

3. **Extract from File**:
   - Operation: `Extract Text`
   - *Convierte el PDF/DOCX descargado a texto plano para la IA.*

4. **AI Agent** (Gemini):
   - Configura tus credenciales de Google Gemini API.
   - Model: `Gemini 1.5 Pro` (o Flash, si prefieres velocidad).
   - System Message: **Copia el contenido del archivo `prompts/system-prompt.md` aquí.**
   - User Message: `"Revisa el siguiente documento de acuerdo a la estructura. Documento: {{ $json.text }}"`

5. **Set** (Opcional, para limpiar el JSON):
   - A veces la IA devuelve el JSON dentro de bloques de código markdown (```json ... ```). Usa un Code node o Set node para extraer solo el JSON válido.

6. **HTTP Request** (Callback al Frontend):
   - Method: `POST`
   - URL: `http://host.docker.internal:3000/api/webhook-callback`
   - Body Parameters: 
     - Mapea el JSON devuelto por la IA: `tesisId`, `estado`, `puntuacionGeneral`, `observaciones`, etc.

## Prompts y Estructura

En la carpeta `prompts/` encontrarás:
- `system-prompt.md`: Las instrucciones exactas para Gemini, diseñadas para forzar una salida JSON que el frontend pueda leer.
- `estructura-tesis.md`: El esquema oficial de la UNT que debes incluir en el contexto de la IA.
