import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Testigo de familia · apps con gráficos de Chart.js (cabo C0456, 15/11/2026).
 *
 * INVARIANTE: si el contenedor de un gráfico cambia de ancho justo cuando acaba su animación, el
 * lienzo acaba con el ancho NUEVO del contenedor; no se queda con el anterior desbordando.
 *
 * DE DÓNDE SALE: la Ronda cazaba ~1 vez al mes un lienzo de 760 px dentro de un contenedor de 350
 * a 390 de ancho (visualizador-antibioticos el 04/11, desigualdad-riqueza el 25/10 y el 14/11,
 * roi-marketing y melatonina como rojos inestables de desborde-390 con 8 workers). Mecanismo, en
 * chart.js 4.x: el ResizeObserver avisa en el fotograma F y el redimensionado corre en F+1 (lo
 * aplaza `throttled` a un requestAnimationFrame); si en F+1 la animación termina, `resize()` ve
 * `animator.running()` aún en true, guarda el tamaño para el siguiente `draw()`, y en F+2 la
 * animación se retira SIN dibujar. El tamaño aplazado no se aplica nunca y el observador no vuelve
 * a avisar. Receta: `PLUGIN_REDIMENSION_APLAZADA` de `lib/chartjsRedimension.ts`, registrado en
 * cada app, que aplica el tamaño aplazado en el `afterRender` de esa última pasada.
 *
 * CÓMO MIDE (determinista, sin depender del reloj real ni de la carga del equipo): un
 * addInitScript envuelve `Date.now` con un salto controlable y `getContext`. 200 ms después del
 * primer lienzo 2D, dentro de un requestAnimationFrame (corre DESPUÉS del de Chart.js en ese
 * fotograma), estrecha el contenedor del lienzo a la mitad —el ResizeObserver avisa en ese
 * fotograma— y adelanta `Date.now` diez minutos, así que la animación acaba en el siguiente, el
 * mismo en que corre el redimensionado. 1,5 s después, el lienzo no puede ser más ancho que el
 * contenido de su contenedor.
 *
 * CONTROL: sin el plugin, las 29 apps de APPS desbordaban 29 de 29 (el lienzo con el doble del
 * contenedor; 3 de 3 repeticiones en antibioticos, roi-marketing, melatonina y
 * desigualdad-riqueza), medido el 15/11/2026 contra next dev. Con el plugin, 0 de 29.
 *
 * Las 13 apps que importan chart.js pero no pintan gráfico al cargar (hay que calcular antes)
 * no tienen caso de comportamiento: las cubre el segundo test, que exige el registro del plugin en
 * TODO fichero de app/ que importe chart.js. Para añadir una hermana que pinte al cargar, su slug
 * en APPS.
 */

const APPS = [
  'visualizador-antibioticos',
  'estimador-roi-marketing',
  'visualizador-melatonina',
  'visualizador-desigualdad-riqueza',
  'visualizador-insulina-glucosa',
  'visualizador-hidrogeno',
  'visualizador-mapa-dinero-mensual',
  'visualizador-funciones-mundo',
  'visualizador-dinero-y-tiempo',
  'visualizador-sueldo-neto',
  'visualizador-hierro',
  'visualizador-beneficio-liquidez',
  'visualizador-viaje-impuestos',
  'visualizador-mapa-tiempo',
  'visualizador-serotonina',
  'visualizador-magnesio',
  'visualizador-silicio',
  'visualizador-lactasa',
  'visualizador-factura-electrica',
  'visualizador-adrenalina',
  'visualizador-vitamina-d',
  'visualizador-testosterona',
  'visualizador-telomerasa',
  'visualizador-jubilacion-perspectiva',
  'visualizador-impacto-ia-sectores',
  'visualizador-ibuprofeno',
  'visualizador-geopolitica-recursos',
  'visualizador-estrogenos',
  'visualizador-envejecimiento-cuerpo',
];

interface EstadoFinAnimacion {
  estado: 'esperando' | 'programado' | 'hecho';
}

interface VentanaInstrumentada {
  __finAnimacion: EstadoFinAnimacion;
  __lienzo?: HTMLCanvasElement;
}

/** Se ejecuta en la página antes que cualquier script suyo */
function instrumentarFinAnimacion() {
  const w = window as unknown as VentanaInstrumentada;
  const ahora = Date.now.bind(Date);
  let salto = 0;
  Date.now = () => ahora() + salto;
  w.__finAnimacion = { estado: 'esperando' };
  const original = HTMLCanvasElement.prototype.getContext;
  // Envoltorio sin tipos de sobrecarga: getContext tiene una por tipo de contexto
  const envuelto = function (this: HTMLCanvasElement, ...argumentos: unknown[]) {
    const ctx = (original as (...a: unknown[]) => unknown).apply(this, argumentos);
    if (w.__finAnimacion.estado === 'esperando' && argumentos[0] === '2d' && this.isConnected) {
      w.__finAnimacion = { estado: 'programado' };
      const lienzo = this;
      w.__lienzo = lienzo;
      setTimeout(() => {
        requestAnimationFrame(() => {
          const padre = lienzo.parentElement;
          if (!padre) return;
          const ancho = padre.getBoundingClientRect().width;
          padre.style.width = `${Math.round(ancho * 0.5)}px`;
          salto += 600_000;
          w.__finAnimacion = { estado: 'hecho' };
        });
      }, 200);
    }
    return ctx;
  };
  HTMLCanvasElement.prototype.getContext = envuelto as typeof HTMLCanvasElement.prototype.getContext;
}

test.describe('Chart.js · el lienzo sigue a su contenedor aunque cambie al acabar la animación', () => {
  for (const slug of APPS) {
    test(`${slug}: el lienzo no desborda su contenedor`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.addInitScript(instrumentarFinAnimacion);
      await page.goto(`/${slug}/`);
      await page.waitForFunction(
        () => (window as unknown as VentanaInstrumentada).__finAnimacion?.estado === 'hecho',
        null,
        { timeout: 30_000 }
      );
      await page.waitForTimeout(1500);
      const medida = await page.evaluate(() => {
        const lienzo = (window as unknown as VentanaInstrumentada).__lienzo as HTMLCanvasElement;
        const padre = lienzo.parentElement as HTMLElement;
        const estilo = getComputedStyle(padre);
        const contenido =
          padre.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight);
        return { lienzo: lienzo.getBoundingClientRect().width, contenedor: contenido };
      });
      expect(medida.lienzo, `lienzo ${medida.lienzo} px en un contenedor de ${medida.contenedor}`).toBeLessThanOrEqual(
        medida.contenedor + 1
      );
    });
  }

  test('todo fichero de app/ que importa chart.js registra PLUGIN_REDIMENSION_APLAZADA', () => {
    const sinPlugin: string[] = [];
    let conChart = 0;
    for (const d of readdirSync('app', { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const fichero = join('app', d.name, 'page.tsx');
      if (!existsSync(fichero)) continue;
      const texto = readFileSync(fichero, 'utf8');
      if (!/['"]chart\.js(\/auto)?['"]/.test(texto)) continue;
      conChart++;
      if (!/\.register\([^)]*PLUGIN_REDIMENSION_APLAZADA/.test(texto)) sinPlugin.push(fichero);
    }
    expect(conChart).toBeGreaterThanOrEqual(APPS.length);
    expect(sinPlugin, 'ficheros que importan chart.js sin registrar el plugin').toEqual([]);
  });
});
