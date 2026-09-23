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
  // Tapados hasta el 23/09/2026 por el medidor, que oscurecía los gradientes translúcidos
  { ruta: '/planificador-vacaciones-autonomo/', que: 'gradiente al 15 % bajo «al mes»' },
  { ruta: '/visualizador-fuerzas-invisibles/', que: 'caja de fórmula con el color de la fuerza al 10 %' },
  // Remedición del 23/09/2026 con el medidor corregido, sobre 170 rutas
  // · el drenaje del claro (dd66add0) dejó el token sin valor oscuro: #6E6E6E en oscuro
  { ruta: '/calculadora-z-score-altman/', que: 'bloque oscuro sin --text-muted, 2,81:1' },
  { ruta: '/calculadora-amortizacion-inmovilizado/', que: 'bloque oscuro sin --text-muted, 2,48:1' },
  { ruta: '/calculadora-valoracion-empresa/', que: 'bloque oscuro sin --text-muted, 2,81:1' },
  { ruta: '/simulador-financiacion-empresarial/', que: 'bloque oscuro sin --text-muted, 2,81:1' },
  // · la caja de <EducationalSection> pintaba --hover: #383838 heredado de globals, 4,22:1
  { ruta: '/guia-aceite-oliva/', que: 'caption de tabla en la guía educativa' },
  { ruta: '/guia-te/', que: 'caption de tabla en la guía educativa' },
  { ruta: '/orientador-discapacidad/', que: 'nota de tabla en la guía educativa' },
  { ruta: '/visualizador-oceanos-corrientes/', que: 'caption y fuentes en la guía educativa' },
  // · cajas propias con tinte de marca, --hover o color de widget
  { ruta: '/asistente-alta-autonomo/', que: 'cabecera de fase sobre --hover y sobre gradiente al 10 %' },
  { ruta: '/checklist-preparar-verifactu/', que: 'badge «Sin empezar» con gris al 12 %' },
  { ruta: '/calculadora-fov-video/', que: 'sensor activo con tinte de marca' },
  { ruta: '/calculadora-frigorias-btu/', que: 'opción marcada y resultado destacado, 3,89:1' },
  { ruta: '/enchufes-por-pais/', que: 'consejo con tinte de marca' },
  { ruta: '/visualizador-desigualdad-riqueza/', que: 'tarjetas de brecha con tinte de marca' },
  { ruta: '/visualizador-fotosintesis/', que: 'fórmula sobre el color de la molécula, 3,50:1' },
  { ruta: '/visualizador-respiracion-celular/', que: 'fórmula sobre el color de la molécula, 3,50:1' },
  // · un :root de módulo con la paleta clara, que en oscuro pisaba los tokens de globals
  { ruta: '/selector-canal-venta/', que: ':root de módulo · el oscuro servía los tokens del claro' },
  { ruta: '/selector-financiacion-empresa/', que: ':root de módulo · el oscuro servía los tokens del claro' },
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
