import { defineConfig } from '@playwright/test';

/**
 * Configuración de Playwright SOLO para los tests de invariantes de las
 * calculadoras (lib/calculadoras/). Son tests de lógica pura en Node: NO
 * necesitan navegador ni servidor de desarrollo.
 *
 * Por eso esta config NO define `webServer` (a diferencia de playwright.config.ts):
 * así `npm run test:calc` corre de forma autónoma y reproducible, sin depender
 * de que haya un `next dev` levantado en el puerto 3050.
 *
 * @see playwright.config.ts para los tests e2e/a11y que sí usan navegador.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: /(calculadoras-invariantes|ganancia-inmueble|coordenadas|numero-a-letras|panaderia-motores|costas-judiciales-motor|conservacion-energia-motor|division-celular-motor|quiz-tabla-periodica-banco)\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
});
