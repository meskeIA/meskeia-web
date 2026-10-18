/**
 * Contraste en TEMA OSCURO del texto pintado con los tokens semánticos (--danger, --error,
 * --success, --warning), cabo C0226 (18/10/2026).
 *
 * El censo `scripts/contraste-semanticos/censo.mjs` encontró 114 módulos que declaran esos
 * tokens con un literal y no los redeclaran en oscuro, así que en oscuro sirven el rojo o el
 * verde del claro. Solo es defecto donde el token pinta TEXTO: 144 declaraciones en 76
 * módulos, y 85 en 65 de ellos bajan de 4,5:1 sobre algún fondo oscuro del sitio. Esas 65 rutas
 * son las que se miden aquí, en oscuro, con todo lo colapsado abierto.
 *
 * Se mide el texto pintado con el valor CLARO que se colaba (lo que había antes) y con los
 * valores oscuros de la reparación: #FCA5A5 para --danger/--error, #86EFAC para --success y
 * #FFA726 para --warning. Los primeros elegidos (#F98080 y #66BB6A) cumplían sobre los fondos
 * planos del oscuro, y este spec los tumbó sobre el tinte de su propio color (4,25-4,42:1).
 *
 * Limitación: muchos de esos textos solo aparecen al interactuar (un error de validación, un
 * resultado). Lo que no está en la página al cargar no se puede medir aquí, y se anota como
 * «sin texto visible al cargar» en vez de darlo por bueno en silencio.
 *
 * El instrumento, con las trampas de medir en navegador que cubre, está en `tests/_contraste.ts`.
 */
import { test, expect } from '@playwright/test';
import { activarTemaOscuro, desplegarTodo, medirContraste, prepararParaMedir } from './_contraste';

/** Valores oscuros de la reparación de C0226. */
const OSCUROS = ['#FCA5A5', '#86EFAC', '#FFA726'];

/** Ruta → valores claros que el censo vio colarse en oscuro como color de texto. */
const RUTAS: [string, string[]][] = [
  ['adaptacion-hogar', ['#27AE60', '#E74C3C']],
  ['analizador-densidad-seo', ['#EF4444']],
  ['analizador-geo', ['#EF4444']],
  ['analizador-titulos-seo', ['#EF4444']],
  ['asistente-constitucion-sociedad', ['#1A7A3E', '#C0392B']],
  ['calculadora-algebra-abstracta', ['#EF4444']],
  ['calculadora-electricidad', ['#EF4444']],
  ['calculadora-gasto-energetico', ['#EF4444']],
  ['calculadora-legibilidad', ['#EF4444']],
  ['calculadora-matematica', ['#EF4444']],
  ['calculadora-mcd-mcm', ['#EF4444']],
  ['calculadora-notas', ['#EF4444']],
  ['calculadora-probabilidad', ['#EF4444']],
  ['calculadora-trigonometria', ['#EF4444']],
  ['comparador-vehiculos', ['#27AE60', '#E74C3C']],
  ['compresor-imagenes', ['#EF4444']],
  ['control-gastos', ['#EF4444']],
  ['conversor-binario', ['#EF4444']],
  ['conversor-formatos', ['#EF4444']],
  ['conversor-numeros-romanos', ['#EF4444']],
  ['curso-emprendimiento', ['#EF4444']],
  ['curso-emprendimiento/herramientas/business-model-canvas', ['#EF4444']],
  ['curso-emprendimiento/herramientas/dafo', ['#EF4444']],
  ['diario-emocional', ['#E74C3C']],
  ['editor-exif', ['#EF4444']],
  ['estimador-break-even', ['#EF4444']],
  ['estimador-cartera-inversion', ['#EF4444']],
  ['estimador-hipoteca', ['#EF4444']],
  ['estimador-inversiones', ['#EF4444']],
  ['estimador-irpf-pensionista', ['#27AE60', '#E74C3C']],
  ['estimador-legitimas', ['#E67E22', '#E74C3C']],
  ['estimador-pension-viudedad', ['#E74C3C']],
  ['estimador-riesgo-osteoporosis', ['#E67E22', '#27AE60', '#E74C3C']],
  ['estimador-roi-marketing', ['#EF4444']],
  ['estimador-tir-van', ['#EF4444']],
  ['extractor-audio-video', ['#28A745']],
  ['generador-actas', ['#EF4444']],
  ['generador-citas-apa', ['#EF4444']],
  ['generador-hashes', ['#EF4444']],
  ['generador-meta-descripciones', ['#EF4444']],
  ['glosario-fisica-quimica', ['#EF4444']],
  ['inferencia-bayesiana', ['#EF4444']],
  ['juego-presupuesto-mensual', ['#27AE60', '#E74C3C']],
  ['mi-ip', ['#28A745', '#DC3545']],
  ['optimizador-rentas-60', ['#27AE60']],
  ['orientacion-tramitacion-herencias', ['#C0392B']],
  ['orientador-colesterol', ['#27AE60', '#E74C3C']],
  ['orientador-contrato-mercantil', ['#C62828']],
  ['orientador-diversificacion-clientes', ['#DC3545', '#28A745']],
  ['orientador-justicia-gratuita', ['#27AE60', '#E74C3C']],
  ['planificador-ahorro-jubilacion', ['#27AE60', '#E74C3C']],
  ['planificador-boda', ['#EF4444']],
  ['planificador-cashflow', ['#EF4444']],
  ['planificador-turnos', ['#EF4444']],
  ['planificador-turnos-cuidadores', ['#E07A5F']],
  ['prueba-camara', ['#DC3545']],
  ['prueba-microfono', ['#DC3545']],
  ['quiz-conceptos-financieros', ['#27AE60', '#E74C3C']],
  ['simulador-jubilacion-publica', ['#E67E22', '#27AE60', '#E74C3C']],
  ['simulador-paga-ahorro', ['#27AE60', '#E74C3C']],
  ['tablas-multiplicar', ['#EF4444']],
  ['test-bienestar-who5', ['#E74C3C']],
  ['test-fragilidad', ['#E67E22', '#27AE60', '#E74C3C']],
  ['test-phishing', ['#C0392B', '#27AE60']],
  ['test-velocidad-escritura', ['#EF4444']],
];

for (const [ruta, claros] of RUTAS) {
  test(`${ruta}: el texto semántico se lee en oscuro`, async ({ page }) => {
    await page.goto(`/${ruta}/`);
    await prepararParaMedir(page);
    await activarTemaOscuro(page);
    await desplegarTodo(page);
    const m = await medirContraste(page, { texto: [...claros, ...OSCUROS] });
    if (m.vistos === 0) {
      test.info().annotations.push({ type: 'sin texto visible al cargar', description: claros.join(', ') });
      return;
    }
    expect(m.ratio, `oscuro, peor: ${JSON.stringify(m)}`).toBeGreaterThanOrEqual(m.umbral);
  });
}
