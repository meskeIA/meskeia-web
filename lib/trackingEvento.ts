/**
 * lib/trackingEvento.ts — un EVENTO DE INTERACCIÓN dentro de una app, que no es una visita.
 *
 * Existe porque hay preguntas que el analytics de este proyecto no puede contestar: mide
 * aterrizajes, no lo que pasa dentro. El caso que lo motivó (17/09/2026): las siete apps del
 * clúster de compraventa tienen pestañas Comprador/Vendedor y **nadie sabe si la de Vendedor se
 * abre**, así que replicarla en las tres apps que no la tienen sería construir a ciegas.
 *
 * ⚠️ POR QUÉ `modo: 'bot'` EN UN CLIC HUMANO (y no un valor nuevo como 'evento')
 * ------------------------------------------------------------------------------
 * Medido antes de escribir esto: **15 ficheros y 25 consultas** filtran el tráfico humano, y la
 * forma dominante es `modo <> 'bot'`. Un valor nuevo se colaría por todas ellas contando como
 * visita —inflando justo la app más usada del clúster— hasta que alguien se acordara de
 * actualizarlas una a una. Es el mismo razonamiento, y la misma decisión, que ya está escrita
 * en `app/api/analytics/track/route.ts:204-210` para los agentes de IA que renderizan la página:
 * se marcan 'bot' y la distinción se recupera de un campo que se guarda intacto.
 *
 * `share-emit` eligió lo contrario en su día y por eso se cuela hoy en 12 de esos 15 ficheros;
 * pasa inadvertido solo porque son 82 registros de 70.000 (0,1 %). Un evento de pestaña en una
 * app de 400 usos/mes no tendría esa suerte.
 *
 * El PREFIJO `evt:` en el nombre de aplicación es el segundo candado, y hace el trabajo que
 * `modo` solo no puede: mantiene el evento fuera de la propia app en cualquier desglose por
 * `aplicacion`, incluidos los análisis de composición del tráfico bot. Se manda lo mínimo
 * (sin navegador ni resolución), así que tampoco entra en las firmas que miran esos campos.
 *
 * Para leerlo:
 *   SELECT datos_adicionales, COUNT(*) FROM uso_aplicaciones
 *   WHERE aplicacion = 'evt:pestana-vendedor' GROUP BY datos_adicionales;
 * y el denominador es el uso normal de esa app en la misma ventana.
 */

// Solo se registra en los dominios de producción, igual que AnalyticsTracker y ShareCard:
// en localhost y en los previews de Vercel no se contaminan las métricas.
const HOSTS_PRODUCCION = new Set([
  'meskeia.com', 'www.meskeia.com',
  'delegum.com', 'www.delegum.com',
  'cronicum.com', 'www.cronicum.com',
  'stemum.com', 'www.stemum.com',
  'coquinum.com', 'www.coquinum.com',
]);

/** Eventos ya emitidos en esta carga, para no repetir el mismo al ir y volver de pestaña. */
const yaEmitidos = new Set<string>();

/**
 * Registra UNA vez por carga de página que el usuario ha usado una capacidad concreta.
 *
 * @param evento  Nombre corto y estable del evento, sin el prefijo (p. ej. 'pestana-vendedor').
 * @param app     Slug de la app donde ocurre, que va en `datos_adicionales` para poder
 *                repartir el mismo evento entre varias apps hermanas.
 */
export function registrarEventoInteraccion(evento: string, app: string): void {
  try {
    if (typeof window === 'undefined') return;
    if (!HOSTS_PRODUCCION.has(window.location.hostname)) return;
    if (navigator.webdriver) return; // bots y Playwright

    const clave = `${evento}|${app}`;
    if (yaEmitidos.has(clave)) return;
    yaEmitidos.add(clave);

    let sesionId: string | null = null;
    try {
      sesionId = sessionStorage.getItem('meskeia_session_id');
    } catch {
      // sessionStorage no disponible (modo privado, cookies bloqueadas)
    }

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aplicacion: `evt:${evento}`,
        modo: 'bot', // ver la cabecera: NO es un bot, es la única forma de no contar como visita
        sesion_id: sesionId,
        datos_adicionales: { app },
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // una medición nunca puede romper la app que mide
  }
}
