import { test, expect, type Page } from '@playwright/test';

/**
 * Testigo de familia — el buscador de las guías-directorio encuentra SIN tilde (cabo C0658).
 *
 * DE DÓNDE SALE
 * guia-tipos-arroz y guia-frutas-exoticas (inspector 07/11/2026, hallazgo B de su spec): el
 * filtro hacía `nombre.toLowerCase().includes(busqueda.toLowerCase())`, así que «rambutan» no
 * encontraba el Rambután. Medido el 07/11/2026 en todas las app/guia-* con buscador
 * (.reparar-trabajo/medir-c0658.mjs de la copia de reparar): fallaban 19 más. Receta: las dos
 * partes de la comparación por `normalizarBusqueda` de lib/buscadorTablas (minúsculas y sin
 * diacríticos), solo en las líneas del filtro.
 *
 * QUÉ MIDE
 * Escribe la palabra sin tilde y exige que la ficha salga: la palabra (sin tildes) aparece en
 * la página más veces que con una búsqueda que no casa con nada. Lo estático (guía, FAQ) es
 * igual en las dos lecturas, así que la diferencia es la ficha que el buscador deja ver.
 * Control: con el filtro de antes, «niscalo» en guia-setas da lo mismo que «zzqxw».
 * Una guía nueva con buscador: su fila aquí.
 */

interface Fila {
  slug: string;
  /** Nombre de una ficha, tal como lo escribe la guía (con su tilde) */
  palabra: string;
  /** Pestaña o botón que hay que pulsar antes, si el buscador no está a la vista al cargar */
  pestana?: string;
  /** Selector del campo, si no casa con el genérico (sin «Buscar» en placeholder ni etiqueta) */
  selector?: string;
}

const FILAS: Fila[] = [
  { slug: 'guia-aceite-oliva', palabra: 'Huévar' },
  { slug: 'guia-aves-comunes', palabra: 'Gorrión' },
  { slug: 'guia-cafe', palabra: 'Tarrazú' },
  { slug: 'guia-cortes-carne', palabra: 'Chuletón' },
  { slug: 'guia-especias', palabra: 'Pimentón' },
  { slug: 'guia-frutas-exoticas', palabra: 'Mangostán' },
  { slug: 'guia-frutos-secos', palabra: 'Piñón' },
  { slug: 'guia-hierbas-aromaticas', palabra: 'Orégano' },
  { slug: 'guia-insectos-jardin', palabra: 'Sírfido' },
  { slug: 'guia-maderas', palabra: 'Álamo' },
  { slug: 'guia-plantas-interior', palabra: 'Crotón' },
  { slug: 'guia-quesos', palabra: 'Idiazábal' },
  { slug: 'guia-razas-gatos', palabra: 'Común' },
  { slug: 'guia-setas', palabra: 'Níscalo' },
  { slug: 'guia-superalimentos', palabra: 'Arándanos' },
  { slug: 'guia-te', palabra: 'Clásico' },
  { slug: 'guia-tejidos-fibras', palabra: 'Algodón' },
  { slug: 'guia-tipos-arroz', palabra: 'Jazmín' },
  { slug: 'guia-tipos-pan', palabra: 'Bánh' },
  { slug: 'guia-varietales-vino', palabra: 'Mencía' },
  { slug: 'guia-vinagres-mundo', palabra: 'Balsámico' },
  // Fuera de las guías, el mismo filtro y la misma receta (hallazgo 4189, /reparar 07/11/2026)
  { slug: 'calculadora-caducidad', palabra: 'Plátano' },
  // Las cinco guías que C0658 no cubrió (cabo C0668, /reparar 07/11/2026)
  { slug: 'guia-estilos-cerveza', palabra: 'Bélgica' },
  { slug: 'guia-cocteles', palabra: 'Perú' },
  { slug: 'guia-razas-perros', palabra: 'Dálmata' },
  { slug: 'guia-infusiones', palabra: 'Lúpulo' },
  { slug: 'guia-tipos-pasta', palabra: 'Nápoles' },
  // Fuera de las guías: buscadores con el mismo filtro (cabo C0668, /reparar 07/11/2026). Palabras
  // elegidas con .reparar-trabajo/c0668-elegir.mjs de la copia: la forma sin tilde no está escrita
  // en las fuentes de la app, así que con el filtro viejo la fila cae.
  { slug: 'aditivos-e-alimentarios', palabra: 'información' },
  { slug: 'calculadora-congelacion', palabra: 'aromáticas' },
  { slug: 'calculadora-cocina', palabra: 'Brócoli', pestana: 'Tiempos', selector: '#filtroTiempo' },
  // «geminis» no cabe en el latín «Gemini»: con el filtro viejo no salía (las estrellas no se pintan en la tarjeta)
  { slug: 'constelaciones-del-cielo', palabra: 'Géminis' },
  { slug: 'errores-escritura-creativa', palabra: 'transición' },
  { slug: 'falsos-amigos-ingles', palabra: 'términos' },
  { slug: 'estimador-smi', palabra: 'Almería', pestana: 'Por provincia' },
  { slug: 'glosario-fisica-quimica', palabra: 'interacción' },
  { slug: 'glosario-programacion', palabra: 'múltiples' },
  { slug: 'instrumentos-musicales', palabra: 'electrónico' },
  { slug: 'vitaminas-minerales', palabra: 'producción' },
  { slug: 'plazos-legales', palabra: 'términos' },
  { slug: 'visualizador-arte-movimientos', palabra: 'anónimos', pestana: 'Comparativa' },
  { slug: 'visualizador-arquitectura-estilos', palabra: 'clásica', pestana: 'Comparativa' },
  { slug: 'visualizador-derechos-humanos', palabra: 'protección', pestana: 'Comparativa' },
  { slug: 'visualizador-filosofia', palabra: 'presocráticos', pestana: 'Comparativa' },
  { slug: 'visualizador-generos-novela', palabra: 'acción' },
  { slug: 'visualizador-literatura-movimientos', palabra: 'García', pestana: 'Comparativa' },
  { slug: 'visualizador-musica-movimientos', palabra: 'Léonin', pestana: 'Comparativa' },
  { slug: 'visualizador-recursos-literarios', palabra: 'Hipérbole' },
  { slug: 'visualizador-revoluciones-industriales', palabra: 'producción', pestana: 'Comparativa' },
  { slug: 'visualizador-historia/roma', palabra: 'Rómulo', pestana: 'Comparativa' },
];

const SELECTOR = 'input[type="search"], input[placeholder*="usca" i], input[aria-label*="usca" i]';
const sinTilde = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

async function apariciones(page: Page, selector: string, consulta: string, objetivo: string): Promise<number> {
  const input = page.locator(selector).first();
  await input.fill(consulta);
  await expect(input).toHaveValue(consulta);
  // El filtro corre en el render: basta con que React haya repintado
  await page.waitForTimeout(300);
  const texto = sinTilde((await page.locator('body').innerText()).toLowerCase());
  return texto.split(objetivo).length - 1;
}

test.describe('guías-directorio · el buscador encuentra sin tilde (C0658)', () => {
  for (const f of FILAS) {
    test(`${f.slug}: «${sinTilde(f.palabra).toLowerCase()}» encuentra «${f.palabra}»`, async ({ page }) => {
      await page.goto(`/${f.slug}/`);
      const selector = f.selector ?? SELECTOR;
      if (f.pestana) {
        const boton = page.getByRole('tab', { name: f.pestana, exact: true })
          .or(page.getByRole('button', { name: f.pestana, exact: true }))
          .first();
        // El clic, cuando React ya escucha: antes de hidratar no cambiaría de pestaña
        await expect
          .poll(() => boton.evaluate((b) => Object.keys(b).some((k) => k.startsWith('__reactProps$'))))
          .toBe(true);
        await boton.click();
      }
      const input = page.locator(selector).first();
      await expect(input).toBeVisible();
      await expect
        .poll(() => input.evaluate((i) => Object.keys(i).some((k) => k.startsWith('__reactProps$'))))
        .toBe(true);

      const objetivo = sinTilde(f.palabra.toLowerCase());
      const nada = await apariciones(page, selector, 'zzqxw', objetivo);
      const conTilde = await apariciones(page, selector, f.palabra.toLowerCase(), objetivo);
      const sinLaTilde = await apariciones(page, selector, objetivo, objetivo);
      expect(conTilde, 'con tilde la ficha sale (si no, la fila no mide nada)').toBeGreaterThan(nada);
      expect(sinLaTilde, 'sin tilde sale lo mismo que con tilde').toBe(conTilde);
    });
  }
});
