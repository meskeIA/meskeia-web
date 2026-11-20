import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './apps/_hidratacion';

/**
 * Testigo del texto propio del aviso legal (prop `detalle` de components/DisclaimerCard.tsx).
 *
 * De dónde sale (hallazgo 5213 y cabo C0829, 18-20/11/2026): nueve apps pasaban su aviso propio
 * en la prop `context`, que es la clave de sessionStorage/localStorage del plegado y no se pinta.
 * Solo salía el texto genérico de la variante. Ahora va en `detalle`, que se pinta encima del
 * estándar sin sustituirlo.
 *
 * Mide comportamiento, no código: cada fila carga la app y busca, dentro del aviso (role=note),
 * una frase de su texto propio y la cláusula de responsabilidad del genérico, que debe seguir.
 * Un aviso propio nuevo que vaya otra vez en `context` no saldría aquí: entra con su fila.
 */

const FILAS: Array<{ slug: string; frase: string }> = [
  { slug: 'test-tolerancia-riesgo-detallado', frase: 'No constituyen asesoramiento financiero personalizado' },
  { slug: 'orientador-aval-ico', frase: 'los criterios de aprobación los fija el banco' },
  { slug: 'orientador-ayuda-vivienda-rural', frase: 'cada Comunidad Autónoma define sus propios requisitos' },
  { slug: 'orientador-ayudas-autonomos-pymes', frase: 'no convocatorias activas concretas' },
  { slug: 'orientador-ayudas-personas-familias', frase: 'no garantiza que tengas derecho a ninguna prestación' },
  { slug: 'orientador-becas-ayudas-estudio', frase: 'no calcula la elegibilidad ni el importe' },
  { slug: 'orientador-tramites-jubilacion', frase: 'no calcula cuantías, fechas ni la concesión' },
  { slug: 'simulador-bono-joven-alquiler', frase: 'las cuantías son orientativas' },
  { slug: 'simulador-subvenciones-rehabilitacion', frase: 'agente rehabilitador autorizado' },
];

for (const { slug, frase } of FILAS) {
  test(`C0829 · ${slug}: el aviso pinta su texto propio y conserva el genérico`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await esperarPaginaAsentada(page);
    const aviso = page.getByRole('note').filter({ hasText: frase });
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toContainText('no constituye asesoramiento financiero');
  });
}
