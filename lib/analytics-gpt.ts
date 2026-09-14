/**
 * Identificación del llamante en las API routes de los GPTs personalizados
 * (`app/api/chatgpt/*`, Actions OpenAPI — no MCP).
 *
 * POR QUÉ EXISTE ESTE FICHERO — el agujero que tapa (14/09/2026)
 *
 * Las 48 routes que registraban su uso no guardaban NADA que identificara a quien llamaba:
 * solo `aplicacion`, `timestamp`, `modo='chatgpt'` y, en 34 de ellas, los parámetros de la
 * consulta. El endpoint es público —sus esquemas se publican en `public/chatgpt-schema-*.json`—
 * y el CORS no protege una llamada de servidor a servidor, que es exactamente la forma que
 * tiene una Action de GPT. O sea: **cualquiera con un `curl` podía escribir filas de canal IA**.
 *
 * Es el mismo agujero que se cerró para el MCP el 30/07/2026, cuando un escáner
 * (`mcp-schema-probe/0.1`) metió 121 llamadas en el foso y lo dejó en «+1277 %». Allí la
 * solución fue capturar el UA y exigir lista blanca; aquí faltaba la mitad previa: **no había
 * UA que mirar**. Importa porque el foso IA es la métrica que decide inversión — el 14/09/2026
 * eran 71 de sus 412 visitas de 30 días (17 %), 70 sobre una sola app.
 *
 * QUÉ HACE, Y QUÉ NO
 * Devuelve el `user-agent` del llamante en el campo `uaCliente`, **el mismo nombre que usa
 * `app/api/mcp/route.ts`**, para que el clasificador del foso sea uno solo y no dos que puedan
 * divergir. **No decide** si ese UA cuenta como canal IA: eso lo hace la lista blanca del
 * medidor, y se decide con datos delante (entrada `foso-gpt-lista-blanca` de la Agenda).
 *
 * ⚠️ Nunca lanza. Un fallo leyendo cabeceras no puede tumbar el cálculo que el usuario pidió.
 */

import { headers } from 'next/headers';

export interface DatosLlamante {
  /** User-agent de quien llama, recortado a 200 caracteres como en el MCP. */
  uaCliente: string | null;
  /** País que estampa Vercel, cuando está disponible. */
  paisCliente: string | null;
}

/**
 * Lee las cabeceras de la petición en curso. Se usa `next/headers` en vez de recibir el
 * `NextRequest` porque las 48 routes registran desde una función auxiliar que no lo tiene
 * en su ámbito: pedirlo habría obligado a cambiar 48 firmas heterogéneas en vez de una línea.
 */
export async function datosLlamanteGpt(): Promise<DatosLlamante> {
  try {
    const h = await headers();
    return {
      uaCliente: h.get('user-agent')?.slice(0, 200) ?? null,
      paisCliente: h.get('x-vercel-ip-country'),
    };
  } catch {
    return { uaCliente: null, paisCliente: null };
  }
}
