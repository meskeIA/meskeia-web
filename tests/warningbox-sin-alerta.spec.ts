import { test, expect } from '@playwright/test';
import { esperarPaginaAsentada } from './apps/_hidratacion';

/**
 * Testigo · el warningBox ESTÁTICO no es una región de alerta (cabo C0767, 17/11/2026).
 *
 * DE DÓNDE SALE: hallazgo 4810 (visualizador-escalas-musicales, 15/11/2026). La lista fija
 * «Errores frecuentes…» iba en un div.warningBox con role="alert", montado desde la carga
 * dentro de la guía educativa (que nace colapsada pero tiene sus hijos en el DOM). Es contenido,
 * no un aviso: una alerta que se hace visible al desplegar la guía puede anunciarse de golpe, y
 * el lector la trata como algo urgente que no lo es. El mismo marcado estaba en otras 29 apps.
 *
 * CRITERIO, APP POR APP: el role="alert" sobra si el contenido es fijo (consejos, errores
 * frecuentes, aviso permanente) y es legítimo si el warningBox aparece por una acción o un estado
 * del usuario. Se quedaron con su alerta, por eso: calculadora-1rm-gimnasio, calculadora-gelatina,
 * calculadora-porcentaje-panadero, calculadora-puntos-azucar y calculadora-tiempos-running (la
 * advertencia sale del resultado), recortador-video (navegador sin WebCodecs),
 * visualizador-enzimas-cuerpo-humano (temperatura por encima de 42 °C) y
 * selector-regimen-fiscal-autonomo (va dentro del resultado, que aparece al responder).
 *
 * Mide, en cada una de las 21 de abajo, que la página TIENE su warningBox (control: si se
 * renombra la clase, el caso no pasa en falso) y que ninguno de ellos está en una alerta,
 * contando también los ocultos de la guía colapsada.
 */

const ESTATICOS = [
  'calculadora-edad-mascotas', 'calculadora-piscinas', 'visualizador-urbanismo', 'comparador-coste-vida',
  'checklist-cambio-regimen-autonomo', 'estimador-gastos-comunidad', 'visualizador-tipos-activos',
  'conversor-unidades-rf', 'estimador-reformas-hogar', 'generador-iconos', 'enchufes-por-pais',
  'lista-tareas', 'orientador-contrato-mercantil', 'planificador-boda', 'planificador-itinerario',
  'quiz-reinos-naturaleza', 'simulador-ciclo-explotacion', 'selector-forma-juridica', 'simulador-punnett',
  'temporizador-pomodoro', 'visualizador-carbono',
];

// calculadora-gelatina (hallazgo 5396): el warningBox del agar sale con el resultado, pero en TODOS
// los cálculos, así que no es una alerta. Se mide tras calcular, que es cuando existe.
test('calculadora-gelatina · el aviso del agar, presente en todo resultado, no es una región de alerta', async ({ page }) => {
  await page.goto('/calculadora-gelatina/');
  await esperarPaginaAsentada(page);
  await page.getByRole('button', { name: 'Calcular equivalencias de gelatina' }).click();
  const cajas = page.locator('[class*="warningBox"]');
  await expect(cajas.first(), 'el resultado trae su warningBox').toBeVisible();
  const enAlerta = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('[class*="warningBox"]')).filter(
        (el) => el.matches('[role="alert"]') || el.closest('[role="alert"], [aria-live="assertive"]'),
      ).length,
  );
  expect(enAlerta, 'warningBox dentro de una alerta').toBe(0);
});

for (const slug of ESTATICOS) {
  test(`${slug} · el warningBox fijo no es una región de alerta`, async ({ page }) => {
    await page.goto(`/${slug}/`);
    await esperarPaginaAsentada(page);
    const cajas = page.locator('[class*="warningBox"]');
    expect(await cajas.count(), 'la página tiene su warningBox').toBeGreaterThan(0);
    const enAlerta = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('[class*="warningBox"]')).filter((el) =>
          el.closest('[role="alert"], [aria-live="assertive"]'),
        ).length,
    );
    expect(enAlerta, 'warningBox dentro de una alerta').toBe(0);
  });
}
