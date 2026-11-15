/**
 * Plugin de Chart.js que aplica el redimensionado que Chart.js aplaza y luego pierde (cabo C0456).
 *
 * El defecto, en `node_modules/chart.js/dist/chart.js` (4.x):
 * - `resize()` no redimensiona si `animator.running(chart)` es true: guarda el tamaño en
 *   `_resizeBeforeDraw` para aplicarlo en el siguiente `draw()`.
 * - `running()` sigue en true mientras la lista de animaciones tenga elementos, aunque ya hayan
 *   terminado. La última pasada de `animator._update` los retira SIN llamar a `draw()`.
 * - Si el ResizeObserver avisa justo en ese fotograma (el que cierra la animación inicial, 1000 ms
 *   por defecto), el tamaño aplazado no se aplica nunca, y como el contenedor ya mide lo nuevo el
 *   observador no vuelve a avisar: el lienzo se queda con el ancho anterior (760 px dentro de un
 *   contenedor de 350 en visualizador-antibioticos, la página desborda a 390).
 *
 * La receta: esa última pasada sí avisa a los plugins con `afterRender` (vía
 * `onAnimationsComplete`), y para entonces la animación ya no cuenta como en curso. Si queda un
 * tamaño aplazado, se descarta y se mide de nuevo el contenedor con `resize()`, que ahora sí se
 * aplica. Sin tamaño aplazado no hace nada (no mide en cada render).
 *
 * Se registra en cada app con `Chart.register(PLUGIN_REDIMENSION_APLAZADA)` (o `ChartJS`). Solo
 * importa TIPOS de chart.js, así que no arrastra la librería a quien la cargue con import dinámico.
 * Testigo de familia: `tests/familias/chartjs-redimension.spec.ts`.
 */
import type { Chart, Plugin } from 'chart.js';

/** Campo interno de Chart.js donde queda el tamaño pendiente (no está en sus tipos públicos). */
interface ConTamanoAplazado {
  _resizeBeforeDraw?: { width?: number; height?: number } | null;
}

export const PLUGIN_REDIMENSION_APLAZADA: Plugin = {
  id: 'meskeiaRedimensionAplazada',
  afterRender(chart: Chart) {
    const interno = chart as unknown as ConTamanoAplazado;
    if (!interno._resizeBeforeDraw || !chart.options.responsive) return;
    interno._resizeBeforeDraw = null;
    chart.resize();
  },
};
