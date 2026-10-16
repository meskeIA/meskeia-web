#!/usr/bin/env node
/**
 * Prueba de scripts/frontera-texto.mjs — `npm run frontera:probar`.
 *
 * Las respuestas reales son las del 16/10/2026, la conversación en que nació la marca. La
 * asimetría que importa: ninguna respuesta con matiz, ni la que elige OTRA opción, puede contar
 * como aceptación, porque eso adelantaría un ascenso sin evidencia.
 */
import { clasificarRespuestaTexto, marcaDeDecision, decisionesDeTexto } from '../frontera-texto.mjs';

const DECIDE_TU = /no tengo (\S+ )?cr\S*terio|decide t[uú]/i;
const REC = 'alternativa 1, la marca en el texto';
let fallos = 0;
function caso(nombre, obtenido, esperado) {
  const ok = obtenido === esperado;
  if (!ok) fallos++;
  console.log(`${ok ? '✓' : '✗'} ${nombre}${ok ? '' : ` — esperado ${esperado}, obtenido ${obtenido}`}`);
}

// Aceptaciones reales
caso('«Adelante con la opción 1, que es la que recomiendas,»', clasificarRespuestaTexto(REC, 'Adelante con la opción 1, que es la que recomiendas,', DECIDE_TU), 'recomendada');
caso('«Me parece perfecto con esta redacción.\\nAdelante,»', clasificarRespuestaTexto('añadirlo al §9', 'Me parece perfecto con esta redacción.\nAdelante,', DECIDE_TU), 'recomendada');
caso('«OK.»', clasificarRespuestaTexto(REC, 'OK.', DECIDE_TU), 'recomendada');
caso('aceptación con selección del editor inyectada', clasificarRespuestaTexto(REC, '<ide_selection>const x = 1; pero no</ide_selection>\nAdelante', DECIDE_TU), 'recomendada');

// Lo que NO puede contar como aceptación
caso('elige otra opción: «Adelante con la opción 2»', clasificarRespuestaTexto(REC, 'Adelante con la opción 2', DECIDE_TU), 'libre');
caso('acepta con matiz: «OK, pero cambia el título»', clasificarRespuestaTexto(REC, 'OK, pero cambia el título', DECIDE_TU), 'libre');
caso('«Sí, aunque mejor mañana»', clasificarRespuestaTexto(REC, 'Sí, aunque mejor mañana', DECIDE_TU), 'libre');
caso('rechazo: «No, mejor la 2»', clasificarRespuestaTexto(REC, 'No, mejor la 2', DECIDE_TU), 'libre');
caso('pregunta de vuelta: «¿Y qué pasa con el build?»', clasificarRespuestaTexto(REC, '¿Y qué pasa con el build?', DECIDE_TU), 'libre');
caso('delega: «No tengo criterio, decide tú»', clasificarRespuestaTexto(REC, 'No tengo criterio, decide tú', DECIDE_TU), 'decide-tu');

// La marca: cuenta la ÚLTIMA del mensaje (antes puede ir una de ejemplo)
const mensaje = 'Por ejemplo:\n> **Decisión** · `frontera:config-claude` · recomiendo: añadirlo\n\nY la de verdad:\n> **Decisión** · `frontera:implementacion` · recomiendo: alternativa 1';
caso('marca: se queda con la última', marcaDeDecision(mensaje)?.tipo, 'implementacion');
caso('sin marca: null', marcaDeDecision('¿Lo añado?'), null);

// Recorrido de una transcripción: la respuesta es el siguiente mensaje HUMANO, no un tool_result
const t = (rol, contenido, extra = {}) => ({ type: rol, timestamp: '2026-10-16T10:00:00Z', message: { content: contenido }, ...extra });
const entradas = [
  t('assistant', [{ type: 'text', text: mensaje }]),
  t('user', [{ type: 'tool_result', tool_use_id: 'x', content: 'Adelante' }]),
  t('user', [{ type: 'text', text: 'skill expandida' }], { isMeta: true }),
  t('user', [{ type: 'text', text: 'Adelante con la opción 1' }], { origin: { kind: 'human' } }),
  t('user', [{ type: 'text', text: 'Otra cosa sin decisión pendiente' }], { origin: { kind: 'human' } }),
];
const d = decisionesDeTexto(entradas, DECIDE_TU);
caso('transcripción: una sola decisión', d.length, 1);
caso('transcripción: tipo y resultado', `${d[0]?.tipo}/${d[0]?.resultado}`, 'implementacion/recomendada');

console.log(fallos ? `\n✗ ${fallos} caso(s) fallan` : '\n✓ Todos los casos pasan');
process.exit(fallos ? 1 : 0);
