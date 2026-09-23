/**
 * Contraste de `--text-muted` en TEMA OSCURO, medido en navegador.
 *
 * Acompaña al drenaje del 22/09/2026, que llevó el token a #9B9B9B en el bloque dark
 * de `app/globals.css` y en los 359 módulos que lo redefinían por su cuenta (#808080,
 * #888888, #777777, #8A8A8A). Antes de eso, 483 de 500 elementos de texto pequeño
 * estaban por debajo de 4,5:1 — el pie, el copyright del aviso legal y las
 * descripciones de RelatedApps de las 1.001 apps a la vez.
 *
 * Por qué se mide en navegador y no con aritmética sobre el valor declarado, y las
 * trampas que eso tiene: cabecera y comentarios de `contraste-text-muted-auxiliares`,
 * que este spec comparte con el del tema claro para que una corrección valga para los
 * dos temas a la vez.
 */
import { test, expect } from '@playwright/test';
import {
  UMBRAL, prepararParaMedir, activarTema, desplegarTodo, medirMuted, razonDeExclusion, type Exclusion,
} from './contraste-text-muted-auxiliares';

/**
 * Rutas que cubren los cuatro fondos de superficie reales y los dos regímenes del
 * token (el de globals y el redefinido por el módulo).
 */
const RUTAS = [
  { ruta: '/quiz-tabla-periodica/', que: 'token de globals · tarjeta #2D2D2D' },
  { ruta: '/aditivos-e-alimentarios/', que: 'token de globals · 92 elementos' },
  { ruta: '/tabla-derivadas/', que: 'tabla de consulta · 124 elementos' },
  { ruta: '/calculadora-receta-pan/', que: 'app de Coquinum' },
  { ruta: '/estimador-irpf/', que: 'token local · tarjeta #2A2A2A' },
  { ruta: '/arbol-decision-ia/', que: 'token local, antes #888888' },
  { ruta: '/checklist-declaracion-renta/', que: 'token local, antes #777777' },
  { ruta: '/visualizador-algoritmos/', que: 'simulador de Stemum · widget #333333' },
  { ruta: '/visualizador-historia-dinero/', que: 'cronología de Cronicum' },
  { ruta: '/', que: 'home' },
] as const;

/**
 * Fondos que este token NO cubre, con la razón. No son superficies: son píldoras y
 * cajas de widget que pintan su fondo con un token de otra cosa. Cumplir sobre
 * `--border` exigiría #ABABAB, indistinguible de `--text-secondary` (#B0B0B0), así
 * que el defecto se repara en esas apps, no subiendo el token.
 *
 * Un fondo que NO esté aquí y falle SÍ rompe el test: es lo que detecta que alguien
 * ha añadido una superficie nueva sin medirla.
 */
const FONDOS_EXCLUIDOS: readonly Exclusion[] = [
  { fondo: 'rgb(64, 64, 64)', ruta: '/checklist-declaracion-renta/', razon: '--border como fondo de píldora' },
  { fondo: 'rgb(56, 56, 56)', ruta: '/estimador-actualizacion-alquiler/', razon: '--hover como fondo de aviso' },
  { fondo: 'rgb(45, 57, 63)', ruta: '/tabla-derivadas/', razon: 'cabecera de fila desplegable' },
  { fondo: 'rgb(26, 58, 74)', ruta: '/analizador-ratios-financieros/', razon: 'caja del flujo DuPont' },
];

for (const { ruta, que } of RUTAS) {
  test(`${ruta} · --text-muted cumple 4,5:1 en oscuro (${que})`, async ({ page }) => {
    await page.goto(ruta, { waitUntil: 'domcontentloaded' });
    await activarTema(page, 'dark');
    await prepararParaMedir(page);
    await desplegarTodo(page);
    await prepararParaMedir(page);

    const { medidas, jerarquia } = await medirMuted(page);
    expect(medidas.length, `no se ha medido ningún elemento con --text-muted en ${ruta}`).toBeGreaterThan(0);

    // En oscuro `--text-muted` no puede quedar igual o más claro que `--text-secondary`:
    // sería legible, pero los dos niveles tipográficos dejarían de serlo.
    expect(jerarquia, `--text-muted no queda por debajo de --text-secondary en ${ruta}`).toBe('muted-mas-oscuro');

    const fallan = medidas.filter((m) => m.ratio < UMBRAL && !razonDeExclusion(m.fondo, ruta, FONDOS_EXCLUIDOS));
    const peor = fallan.sort((a, b) => a.ratio - b.ratio)[0];
    expect(
      fallan.length,
      peor
        ? `${fallan.length} elemento(s) por debajo de ${UMBRAL}. El peor: «${peor.texto}» ${peor.color} sobre ${peor.fondo} = ${peor.ratio}:1 (${peor.px}px, ${peor.donde})`
        : '',
    ).toBe(0);

    const excluidos = medidas.filter((m) => m.ratio < UMBRAL && razonDeExclusion(m.fondo, ruta, FONDOS_EXCLUIDOS));
    const peorOk = Math.min(...medidas.map((m) => m.ratio).filter((r) => r >= UMBRAL));
    console.log(
      `   ${ruta}: ${medidas.length} elementos · peor cumpliendo ${peorOk}:1` +
        (excluidos.length ? ` · ${excluidos.length} en fondo excluido (${excluidos[0].fondo})` : ''),
    );
  });
}
