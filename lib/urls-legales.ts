/**
 * URLs de las páginas legales — SIEMPRE absolutas a meskeia.com
 *
 * `/privacidad/` y `/terminos/` existen únicamente en meskeia.com. Las apps, en cambio,
 * se sirven también bajo cronicum.com, stemum.com y coquinum.com por reescritura de host,
 * así que un enlace relativo apunta al vertical y allí no hay nada.
 *
 * ── De dónde sale (14/08/2026) ────────────────────────────────────────────────
 * La primera Ronda contra producción devolvió 169 errores con una única causa:
 * `https://cronicum.com/privacidad/` daba 404 en las 169 cronologías. El origen era el
 * `<Link href="/privacidad">` de LegalNotice, que Next **prefetchea** en el host actual;
 * bajo cronicum.com pedía una página inexistente y, al pulsarlo, el usuario aterrizaba en
 * un 404. No es maquetación: es el aviso de privacidad de un sitio entero.
 *
 * Con URL absoluta, Next renderiza un ancla normal y no hay prefetch al host equivocado.
 * El coste es que en meskeia.com la navegación deja de ser de cliente; para dos páginas
 * legales que se visitan una vez, es un precio irrelevante frente a un 404 en 169 páginas.
 *
 * ⚠️ No sustituir por `<Link>` ni por rutas relativas «porque son internas»: solo lo son
 * en uno de los cuatro dominios donde se sirve este mismo componente.
 */

export const URL_PRIVACIDAD = 'https://meskeia.com/privacidad/';
export const URL_TERMINOS = 'https://meskeia.com/terminos/';
