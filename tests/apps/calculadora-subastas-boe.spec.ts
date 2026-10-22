/**
 * calculadora-subastas-boe — lo que PINTA la página frente a los casos a mano del motor
 * (tests/subastas-boe-motor.spec.ts). El motor ya está probado; aquí se comprueba el cableado:
 * que cada selector mueve el cálculo y que el total incompleto se dice EN el resultado, que es la
 * condición con la que el usuario aceptó hacer la app (22/10/2026).
 *
 * Estado: resultados en vivo (sin botón de calcular). Valores de partida: subasta judicial de
 * 2025, valor 200.000 €, puja 150.000 €, Madrid, sin valor de referencia ni partidas del inmueble.
 */

import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { calcularRegistro } from '../../data/itp-ccaa';

const RUTA = '/calculadora-subastas-boe/';

/** «162.807,59 €» con el formato de la app, para buscarlo en la página. */
const euros = (n: number): RegExp =>
  new RegExp(
    n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }).replace(/\./g, '\\.') +
      '\\s€'
  );

const resultados = (page: Page) => page.locator('section[aria-labelledby="titulo-resultados"]');

async function escribir(page: Page, etiqueta: string, valor: string): Promise<void> {
  const campo = page.getByLabel(etiqueta, { exact: false });
  await campo.fill(valor);
  await esperarValorEnReact(page, campo, valor);
}

test.beforeEach(async ({ page }) => {
  await page.goto(RUTA);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Calculadora de Subastas del BOE');
  // El testigo ha de ser un <input>: el rastreador de valor de React no existe en un <select>
  await esperarHidratacion(page, ['section[aria-labelledby="titulo-datos"] input']);
});

test('CASO 1 · de partida: depósito del 20 %, resto en 20 días y total INCOMPLETO con lo que falta', async ({ page }) => {
  const r = resultados(page);
  await expect(r).toContainText(euros(40000));
  await expect(r).toContainText(euros(110000));
  await expect(r).toContainText('20 días siguientes al cierre de la subasta');
  await expect(r).toContainText('Coste total: incompleto');
  await expect(r).toContainText('Al menos');
  for (const falta of ['Valor de referencia.', 'Cargas anteriores.', 'Deudas con la comunidad.', 'IBI pendiente.']) {
    await expect(r).toContainText(falta);
  }
  // Riesgo 1: el aviso crítico va desplegado y sin botón para plegarlo
  const disclaimer = page.getByRole('note', { name: 'Aviso importante' });
  await expect(disclaimer).toContainText('carácter exclusivamente orientativo');
  expect(await disclaimer.locator('button').count()).toBe(0);
});

test('CASO 2 · con todo conocido: ITP sobre el valor de referencia y total completo', async ({ page }) => {
  await escribir(page, 'Valor de referencia del Catastro', '180000');
  await escribir(page, 'Cargas anteriores que asumes', '0');
  await escribir(page, 'Deudas con la comunidad de propietarios', '1200');
  await escribir(page, 'IBI pendiente', '600');

  const r = resultados(page);
  await expect(r).toContainText(euros(10800));
  await expect(r).toContainText('Sobre el valor de referencia');
  await expect(r).toContainText('Coste total de la compra');
  await expect(r).not.toContainText('incompleto');
  const registro = Math.round(calcularRegistro(150000, 'madrid') * 100) / 100;
  await expect(r).toContainText(euros(162600 + registro));
});

test('CASO 3 · Agencia Tributaria: 5 % del tipo y 15 días tras la notificación', async ({ page }) => {
  await page.getByRole('button', { name: /Agencia Tributaria/ }).click();
  await expect(page.getByRole('button', { name: /Agencia Tributaria/ })).toHaveAttribute('aria-pressed', 'true');
  const r = resultados(page);
  await expect(r).toContainText(euros(10000));
  await expect(r).toContainText('15 días siguientes a la notificación de la adjudicación');
  await expect(page.locator('#select-inicio')).toHaveCount(0);
});

test('CASO 4 · procedimiento anterior a la reforma: 5 % y 40 días', async ({ page }) => {
  await page.locator('#select-inicio').selectOption('antes-reforma');
  const r = resultados(page);
  await expect(r).toContainText(euros(10000));
  await expect(r).toContainText('40 días');
});

test('CASO 5 · deudor empresa: el impuesto no lleva cifra y se manda al asesor', async ({ page }) => {
  await escribir(page, 'Valor de referencia del Catastro', '180000');
  await page.locator('#select-deudor').selectOption('empresa');
  const r = resultados(page);
  await expect(r).not.toContainText('ITP en la Comunidad de Madrid');
  await expect(r).toContainText('puede llevar IVA en lugar de ITP');
  await expect(r).not.toContainText(euros(10800));
});

test('CASO 6 · puja por debajo del 70 %: la vivienda no está asegurada', async ({ page }) => {
  await escribir(page, 'Lo que piensas pujar', '110000');
  const r = resultados(page);
  await expect(r).toContainText('Tu puja es el 55,0');
  await expect(r).toContainText('no tienes la');
  await expect(r).toContainText('al menos el 60');
});
