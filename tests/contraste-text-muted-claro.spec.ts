/**
 * Contraste de `--text-muted` en TEMA CLARO, medido en navegador.
 *
 * Es la otra mitad del drenaje del 22/09/2026. Aquel reparó el tema OSCURO (globals
 * + 359 módulos a #9B9B9B) y dejó el claro medido e intacto: 355 módulos declaraban
 * `--text-muted: #999999` en su propio `.container` y 10 más #888888, valores que
 * ganan sobre el #6E6E6E que `:root` tiene desde el 21/08/2026. O sea que la
 * reparación de agosto solo alcanzó a las apps que NO redefinen el token.
 *
 * Lo que medía antes de repararlo, sobre 29 rutas: 242 de 542 elementos de texto
 * pequeño por debajo de 4,5:1 — #999999 daba 2,85 sobre la tarjeta blanca, 2,73
 * sobre la página #FAFAFA y 2,61 sobre `--hover`; #888888, 3,54 y 3,40.
 *
 * Por qué se mide en navegador y no con aritmética sobre el valor declarado, y las
 * trampas que eso tiene: cabecera y comentarios de `contraste-text-muted-auxiliares`,
 * que este spec comparte con el del tema oscuro para que una corrección valga para
 * los dos temas a la vez.
 */
import { test, expect } from '@playwright/test';
import {
  UMBRAL, prepararParaMedir, activarTema, desplegarTodo, medirMuted, razonDeExclusion, type Exclusion,
} from './contraste-text-muted-auxiliares';

/**
 * Rutas elegidas por los fondos y los regímenes del token que cubren, no por número:
 * apps que lo redefinían con cada uno de los dos valores, apps que lo heredan de
 * globals, los dos tipos de página que más elementos aportan (tabla de consulta y
 * curso) y una de cada vertical.
 */
const RUTAS = [
  { ruta: '/checklist-declaracion-renta/', que: 'redefinía #999999 · píldora sobre --border' },
  { ruta: '/curso-criptografia-seguridad/', que: 'redefinía #999999 · 76 elementos, fondo --hover' },
  { ruta: '/calculadora-amortizacion-inmovilizado/', que: 'redefinía #999999 · calculadora' },
  { ruta: '/quiz-complejidad-algoritmos/', que: 'redefinía #999999 · quiz' },
  { ruta: '/arbol-decision-ia/', que: 'redefinía #999999 · simulador' },
  { ruta: '/visualizador-historia-dinero/', que: 'redefinía #999999 · cronología de Cronicum' },
  { ruta: '/selector-canal-venta/', que: 'redefinía #999999 en el :root del módulo' },
  { ruta: '/adaptador-dislexia/', que: 'redefinía #888888 · 22 elementos' },
  { ruta: '/temporizador-visual/', que: 'redefinía #888888' },
  { ruta: '/tabla-derivadas/', que: 'hereda de globals · tabla de consulta, 124 elementos' },
  { ruta: '/aditivos-e-alimentarios/', que: 'hereda de globals · 92 elementos' },
  { ruta: '/calculadora-receta-pan/', que: 'hereda de globals · app de Coquinum' },
  { ruta: '/simulador-vsepr/', que: 'hereda de globals · app de Stemum' },
  { ruta: '/guia/comprar-casa/', que: 'guía-journey' },
  { ruta: '/', que: 'home' },
  // Los seis que el barrido de 85 rutas dejó por debajo tras el drenaje (23/09/2026)
  { ruta: '/visualizador-capas-tierra/', que: 'etiquetas absolutas fuera de su barra de color' },
  { ruta: '/visualizador-metamorfosis/', que: 'gradiente al 6 % sobre base transparente' },
  { ruta: '/planificador-vacaciones-autonomo/', que: 'gradiente al 8 % sobre base transparente' },
  { ruta: '/visualizador-biomas-terrestres/', que: 'gradiente al 6 % sobre la página #FAFAFA' },
  { ruta: '/visualizador-jubilacion-perspectiva/', que: 'gradiente al 8 % en el círculo de resultado' },
  { ruta: '/visualizador-fuerzas-invisibles/', que: 'caja de fórmula con el color de la fuerza al 10 %' },
  // 16 <details>: `desplegarTodo` la colgaba hasta el timeout (ver su comentario)
  { ruta: '/calculadora-huella-carbono/', que: '16 <details> que abrir' },
] as const;

/**
 * Fondos que este token NO cubre, con la razón. No son superficies: son píldoras y
 * cajas que pintan su fondo con un token de otra cosa. Cumplir sobre `--border`
 * #E5E5E5 exigiría #666666, que es exactamente `--text-secondary` y borraría la
 * jerarquía tipográfica, así que el defecto se repara en esas apps, no subiendo el
 * token. Es el mismo criterio —y, en `checklist-declaracion-renta`, la misma
 * píldora— que quedó excluido en el tema oscuro.
 *
 * Un fondo que NO esté aquí y falle SÍ rompe el test: es lo que detecta que alguien
 * ha añadido una superficie nueva sin medirla.
 */
const FONDOS_EXCLUIDOS: readonly Exclusion[] = [
  { fondo: 'rgb(229, 229, 229)', ruta: '/checklist-declaracion-renta/', razon: '--border como fondo de la píldora de progreso: 4,05:1' },
];

for (const { ruta, que } of RUTAS) {
  test(`${ruta} · --text-muted cumple 4,5:1 en claro (${que})`, async ({ page }) => {
    await page.goto(ruta, { waitUntil: 'domcontentloaded' });
    await activarTema(page, 'light');
    await prepararParaMedir(page);
    await desplegarTodo(page);
    await prepararParaMedir(page);

    const { medidas, jerarquia } = await medirMuted(page);
    expect(medidas.length, `no se ha medido ningún elemento con --text-muted en ${ruta}`).toBeGreaterThan(0);

    // En claro la jerarquía va al revés que en oscuro: `--text-muted` es el nivel
    // menos destacado, así que debe quedar MÁS CLARO que `--text-secondary` (#6E6E6E
    // frente a #666666). Si alguna vez se invierte, el texto seguiría siendo legible
    // pero los dos niveles tipográficos dejarían de distinguirse.
    expect(jerarquia, `--text-muted no queda por encima de --text-secondary en ${ruta}`).toBe('muted-mas-claro');

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
