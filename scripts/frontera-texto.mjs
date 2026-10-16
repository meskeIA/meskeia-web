/**
 * frontera-texto.mjs — las decisiones que se plantean EN EL TEXTO, para el recuento de la frontera.
 *
 * El contador solo veía el cuestionario (AskUserQuestion con `metadata.source`): una decisión
 * planteada en prosa no dejaba rastro y su racha no avanzaba nunca. Desde el 16/10/2026 se cierra
 * con una línea fija (CLAUDE.md global §9):
 *
 *   **Decisión** · `frontera:<tipo>` · recomiendo: <lo recomendado>
 *
 * Cuenta la ÚLTIMA marca del mensaje (antes puede haber una de ejemplo) y la respuesta es el
 * siguiente mensaje escrito por el usuario. Clasificar prosa es inseguro, así que se equivoca
 * hacia un solo lado: lo que no reconoce como aceptación limpia es «libre» y corta la racha. Un
 * ascenso que se retrasa no cuesta nada; uno que se adelanta delega sin evidencia.
 *
 * Funciones puras, sin E/S: las prueba `npm run frontera:probar`.
 */

const MARCA = /Decisi[oó]n\**\s*·\s*`?frontera:([a-z0-9-]+)`?\s*·\s*recomiendo:\s*(.+)/gi;

// Aceptación: al principio de la respuesta, como la escribe el usuario («Adelante,», «OK.», «Me parece perfecto…»)
const ACEPTA = /^(s[ií]\b|ok\b|okey\b|vale\b|adelante\b|perfecto\b|de acuerdo\b|conforme\b|hazlo\b|procede\b|me parece (bien|perfecto|correcto|razonable)\b)/i;
// Lo que convierte un «adelante» en otra cosa: un matiz, un cambio o una preferencia distinta
const MATIZ = /\b(pero|aunque|salvo|excepto|mejor|prefiero|en vez|en lugar|cambia|no)\b/i;
const NUMERO_OPCION = /\b(?:opci[oó]n|alternativa)\s+(\d+)/i;

/** Quita lo que el entorno inyecta en el mensaje del usuario (selección del editor, avisos…) */
export function limpiarRespuesta(texto) {
  return texto.replace(/<([a-z_-]+)>[\s\S]*?<\/\1>/gi, ' ').replace(/\s+/g, ' ').trim();
}

/** La última marca de decisión de un mensaje del asistente, o null */
export function marcaDeDecision(texto) {
  let ultima = null;
  for (const m of texto.matchAll(MARCA)) ultima = { tipo: m[1].toLowerCase(), recomendacion: m[2].trim() };
  return ultima;
}

/** 'recomendada' | 'decide-tu' | 'libre', con el mismo criterio de fondo que el cuestionario */
export function clasificarRespuestaTexto(recomendacion, respuesta, decideTu) {
  const r = limpiarRespuesta(respuesta);
  if (decideTu.test(r)) return 'decide-tu';
  if (!ACEPTA.test(r)) return 'libre';
  // «Adelante con la opción 2» acepta otra cosa: solo vale si es el número recomendado
  const elegida = r.match(NUMERO_OPCION);
  if (elegida) {
    const recomendada = recomendacion.match(NUMERO_OPCION);
    return recomendada && recomendada[1] === elegida[1] ? 'recomendada' : 'libre';
  }
  // El matiz se busca DESPUÉS de la palabra de aceptación: «No tengo criterio» ya salió arriba
  return MATIZ.test(r.replace(ACEPTA, '')) ? 'libre' : 'recomendada';
}

/** ¿Lo escribió el usuario? (no un tool_result, ni una skill expandida, ni un aviso del sistema) */
export function esMensajeHumano(e) {
  if (e.type !== 'user' || e.isMeta || !e.message) return false;
  if (e.origin && e.origin.kind !== 'human') return false;
  const c = e.message.content;
  if (Array.isArray(c) && c.some((x) => x.type === 'tool_result')) return false;
  const texto = typeof c === 'string' ? c : Array.isArray(c) ? c.filter((x) => x.type === 'text').map((x) => x.text).join('\n') : '';
  return Boolean(limpiarRespuesta(texto)) && !/^<command-/.test(texto.trim());
}

/**
 * Recorre las entradas de UNA transcripción en orden y devuelve las decisiones en texto
 * ya clasificadas: { fecha, ts, tipo, header, pregunta, resultado, elegida, conRecomendacion }.
 */
export function decisionesDeTexto(entradas, decideTu) {
  const salida = [];
  let pendiente = null;
  for (const e of entradas) {
    if (e.isSidechain || !e.message) continue;
    const c = e.message.content;
    if (e.type === 'assistant' && Array.isArray(c)) {
      const texto = c.filter((x) => x.type === 'text').map((x) => x.text).join('\n');
      const marca = texto && marcaDeDecision(texto);
      if (marca) pendiente = { ...marca, ts: e.timestamp || '' };
      continue;
    }
    if (pendiente && esMensajeHumano(e)) {
      const respuesta = typeof c === 'string' ? c : c.filter((x) => x.type === 'text').map((x) => x.text).join('\n');
      salida.push({
        fecha: pendiente.ts.slice(0, 10), ts: pendiente.ts, tipo: pendiente.tipo, header: 'texto',
        pregunta: pendiente.recomendacion, resultado: clasificarRespuestaTexto(pendiente.recomendacion, respuesta, decideTu),
        elegida: limpiarRespuesta(respuesta).slice(0, 120), conRecomendacion: true,
      });
      pendiente = null;
    }
  }
  return salida;
}
