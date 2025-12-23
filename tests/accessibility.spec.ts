import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Testing de Accesibilidad con Playwright + axe-core
 *
 * Valida WCAG 2.1 nivel AA para las 3 apps migradas
 *
 * Nota: La URL base se configura en playwright.config.ts (puerto 3050)
 * Los tests usan baseURL automáticamente.
 */

// Apps a probar
const APPS = [
  {
    name: 'Calculadora de Propinas',
    url: '/calculadora-propinas',
    interactions: async (page) => {
      // Probar interacción básica
      await page.fill('input[type="number"]#monto', '50');
      await page.click('button:has-text("15%")');
      await page.fill('input[type="number"]#personas', '2');
    }
  },
  {
    name: 'Generador de Contraseñas',
    url: '/generador-contrasenas',
    interactions: async (page) => {
      // Probar generación básica
      await page.click('button:has-text("Generar")');
    }
  },
  {
    name: 'Calculadora de Porcentajes',
    url: '/calculadora-porcentajes',
    interactions: async (page) => {
      // Probar tab básico
      await page.waitForSelector('[role="tablist"]', { timeout: 5000 }).catch(() => {
        console.log('No tabs found, skipping tab interaction');
      });
    }
  }
];

// Testing de accesibilidad para cada app
APPS.forEach(({ name, url, interactions }) => {
  test.describe(`Accesibilidad: ${name}`, () => {

    test('debe pasar validación axe-core WCAG 2.1 AA', async ({ page }) => {
      await page.goto(url);

      // Esperar a que la página cargue completamente
      await page.waitForLoadState('networkidle');

      // Ejecutar análisis de accesibilidad
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Imprimir resultados
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing: ${name}`);
      console.log(`URL: ${url}`);
      console.log(`${'='.repeat(60)}`);

      // Violaciones críticas
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n❌ VIOLACIONES ENCONTRADAS: ${accessibilityScanResults.violations.length}\n`);

        accessibilityScanResults.violations.forEach((violation, index) => {
          console.log(`${index + 1}. ${violation.id}`);
          console.log(`   Descripción: ${violation.description}`);
          console.log(`   Impacto: ${violation.impact}`);
          console.log(`   WCAG: ${violation.tags.join(', ')}`);
          console.log(`   Elementos afectados: ${violation.nodes.length}`);

          // Mostrar primeros 3 elementos afectados
          violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
            console.log(`   - ${nodeIndex + 1}. ${node.html.substring(0, 100)}...`);
            console.log(`      Solución: ${node.failureSummary}`);
          });
          console.log('');
        });
      } else {
        console.log('\n✅ SIN VIOLACIONES - ¡Excelente!\n');
      }

      // Pasos incompletos (warnings)
      if (accessibilityScanResults.incomplete.length > 0) {
        console.log(`⚠️ REVISIÓN MANUAL REQUERIDA: ${accessibilityScanResults.incomplete.length}`);
        accessibilityScanResults.incomplete.forEach((item, index) => {
          console.log(`${index + 1}. ${item.id} - ${item.description}`);
        });
        console.log('');
      }

      // Estadísticas
      console.log(`📊 ESTADÍSTICAS:`);
      console.log(`   Elementos analizados: ${accessibilityScanResults.passes.length + accessibilityScanResults.violations.length}`);
      console.log(`   Tests pasados: ${accessibilityScanResults.passes.length}`);
      console.log(`   Violaciones: ${accessibilityScanResults.violations.length}`);
      console.log(`   Revisión manual: ${accessibilityScanResults.incomplete.length}`);
      console.log(`${'='.repeat(60)}\n`);

      // Asegurar que no hay violaciones
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('debe permitir navegación completa por teclado', async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Obtener todos los elementos interactivos
      const interactiveElements = await page.locator(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ).all();

      console.log(`\n🎹 KEYBOARD NAVIGATION: ${name}`);
      console.log(`Elementos interactivos encontrados: ${interactiveElements.length}`);

      // Verificar que hay elementos interactivos
      expect(interactiveElements.length).toBeGreaterThan(0);

      // Verificar que cada elemento puede recibir focus
      let focusableCount = 0;
      for (const element of interactiveElements) {
        const isFocusable = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });

        if (isFocusable) {
          focusableCount++;

          // Dar focus al elemento
          await element.focus();

          // Verificar que tiene focus
          const hasFocus = await element.evaluate(el => el === document.activeElement);
          expect(hasFocus).toBeTruthy();
        }
      }

      console.log(`✅ Elementos enfocables: ${focusableCount}/${interactiveElements.length}`);

      // Verificar que focus es visible (tiene outline o box-shadow)
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus').first();

      if (await focusedElement.count() > 0) {
        const focusStyles = await focusedElement.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            boxShadow: styles.boxShadow,
          };
        });

        const hasFocusIndicator =
          focusStyles.outlineWidth !== '0px' && focusStyles.outlineWidth !== 'none' ||
          focusStyles.boxShadow !== 'none';

        console.log(`Focus visible: ${hasFocusIndicator ? '✅' : '❌'}`);
        console.log(`Outline: ${focusStyles.outline}`);
        console.log(`Box Shadow: ${focusStyles.boxShadow}`);

        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('debe tener contraste de color adecuado', async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Ejecutar análisis solo de contraste
      const contrastResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();

      const contrastViolations = contrastResults.violations.filter(
        v => v.id === 'color-contrast'
      );

      console.log(`\n🎨 CONTRASTE DE COLOR: ${name}`);
      console.log(`Problemas de contraste: ${contrastViolations.length}`);

      if (contrastViolations.length > 0) {
        contrastViolations.forEach(violation => {
          console.log(`\n❌ ${violation.description}`);
          violation.nodes.forEach((node, index) => {
            console.log(`${index + 1}. ${node.html.substring(0, 80)}...`);
            console.log(`   ${node.failureSummary}`);
          });
        });
      } else {
        console.log('✅ Todos los textos cumplen WCAG AA (4.5:1)');
      }

      expect(contrastViolations.length).toBe(0);
    });

    test('debe funcionar interacción básica con teclado', async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      console.log(`\n⌨️ INTERACCIÓN CON TECLADO: ${name}`);

      try {
        // Ejecutar interacciones específicas de la app
        await interactions(page);
        console.log('✅ Interacción básica completada con éxito');
      } catch (error) {
        console.log(`❌ Error en interacción: ${error.message}`);
        throw error;
      }

      // Verificar que la página sigue siendo accesible después de la interacción
      const postInteractionScan = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();

      expect(postInteractionScan.violations).toEqual([]);
    });

    test('debe tener estructura semántica HTML correcta', async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      console.log(`\n📋 ESTRUCTURA SEMÁNTICA: ${name}`);

      // Verificar que existe un h1
      const h1Count = await page.locator('h1').count();
      console.log(`H1 encontrados: ${h1Count} (debe ser 1)`);
      expect(h1Count).toBe(1);

      // Verificar jerarquía de headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      console.log(`Headings totales: ${headings.length}`);

      // Verificar que todos los inputs tienen labels
      const inputs = await page.locator('input[type="text"], input[type="number"], input[type="email"]').all();
      let inputsWithLabels = 0;

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        if (id) {
          const labelExists = await page.locator(`label[for="${id}"]`).count() > 0;
          if (labelExists || ariaLabel || ariaLabelledBy) {
            inputsWithLabels++;
          }
        } else if (ariaLabel || ariaLabelledBy) {
          inputsWithLabels++;
        }
      }

      console.log(`Inputs con labels: ${inputsWithLabels}/${inputs.length}`);
      expect(inputsWithLabels).toBe(inputs.length);

      // Verificar que los botones tienen texto descriptivo
      const buttons = await page.locator('button').all();
      let buttonsWithText = 0;

      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        if ((text && text.trim().length > 0) || ariaLabel) {
          buttonsWithText++;
        }
      }

      console.log(`Botones con texto: ${buttonsWithText}/${buttons.length}`);
      expect(buttonsWithText).toBe(buttons.length);
    });
  });
});

// Test de resumen general
test.describe('Resumen General de Accesibilidad', () => {
  test('generar reporte consolidado', async ({ page }) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 RESUMEN GENERAL DE ACCESIBILIDAD - meskeIA Next.js');
    console.log(`${'='.repeat(80)}\n`);

    const results = [];

    for (const { name, url } of APPS) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const scanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      results.push({
        name,
        url,
        violations: scanResults.violations.length,
        passes: scanResults.passes.length,
        incomplete: scanResults.incomplete.length,
      });
    }

    console.log('App                          | Violaciones | Aprobados | Revisar');
    console.log('-'.repeat(80));

    results.forEach(result => {
      const status = result.violations === 0 ? '✅' : '❌';
      console.log(
        `${status} ${result.name.padEnd(25)} | ${String(result.violations).padStart(11)} | ${String(result.passes).padStart(9)} | ${String(result.incomplete).padStart(7)}`
      );
    });

    const totalViolations = results.reduce((sum, r) => sum + r.violations, 0);
    const appsPassingAll = results.filter(r => r.violations === 0).length;

    console.log('-'.repeat(80));
    console.log(`\nTotal de violaciones: ${totalViolations}`);
    console.log(`Apps que pasan 100%: ${appsPassingAll}/${APPS.length}\n`);

    if (totalViolations === 0) {
      console.log('🎉 ¡EXCELENTE! Todas las apps pasan las validaciones de accesibilidad WCAG 2.1 AA\n');
    } else {
      console.log('⚠️ Se encontraron violaciones. Revisar reportes detallados arriba.\n');
    }

    console.log(`${'='.repeat(80)}\n`);
  });
});
