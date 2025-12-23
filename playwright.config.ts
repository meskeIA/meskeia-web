import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración centralizada de Playwright para meskeIA
 *
 * Puerto oficial: 3050 (evita conflictos con otros proyectos en 3000)
 *
 * @see https://playwright.dev/docs/test-configuration
 */

// Puerto centralizado - usar en toda la configuración
const PORT = 3050;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  // Directorio de tests
  testDir: './tests',

  // Tiempo máximo por test
  timeout: 30 * 1000,

  // Timeout para expect()
  expect: {
    timeout: 5000,
  },

  // No ejecutar tests en paralelo (evita conflictos de puerto)
  fullyParallel: false,
  workers: 1,

  // Reintentos en CI
  retries: process.env.CI ? 2 : 0,

  // Reporter
  reporter: 'list',

  // Configuración global
  use: {
    // URL base para todos los tests
    baseURL: BASE_URL,

    // Capturar screenshots solo en fallo
    screenshot: 'only-on-failure',

    // Capturar trace solo en reintentos
    trace: 'on-first-retry',
  },

  // Proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Servidor de desarrollo automático
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos para arrancar
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

// Exportar constantes para uso en tests
export { PORT, BASE_URL };
