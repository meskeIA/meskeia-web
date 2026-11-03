import { test, expect, type Page } from '@playwright/test';
import { esperarPaginaAsentada } from './_hidratacion';
import {
  VERBOS_REGULARES, pasadosRegulares, terminacionDe, explicarOrtografia, type Terminacion,
} from '../../app/quiz-verbos-irregulares/regulares';

/**
 * Práctica de verbos regulares de quiz-verbos-irregulares (S0246, 03/11/2026).
 *
 * Lo que es correcto (el pasado de cada verbo y cómo suena su -ed) lo fija el CANON escrito a mano
 * de tests/verbos-regulares-motor.spec.ts. Aquí se mide lo que el motor no puede: que la vista
 * pregunte, corrija y explique con él, que el foco vaya donde debe y que la sección no repita
 * ningún rótulo de los que localizan los tests del quiz de irregulares.
 */

const seccion = (page: Page) => page.locator('#verbos-regulares');
const verbo = (inf: string) => {
  const v = VERBOS_REGULARES.find((x) => x.infinitivo === inf);
  if (!v) throw new Error(`no está en el banco: ${inf}`);
  return v;
};
/** El infinitivo a partir del pasado que pinta la pregunta de pronunciación. */
const porPasado = (pasado: string) => {
  const v = VERBOS_REGULARES.find((x) => pasadosRegulares(x).includes(pasado));
  if (!v) throw new Error(`ningún verbo tiene el pasado ${pasado}`);
  return v;
};
const NOMBRE: Record<Terminacion, RegExp> = { t: /^Suena t/, d: /^Suena d/, id: /^Suena id/ };

async function abrir(page: Page) {
  await page.goto('/quiz-verbos-irregulares/');
  await esperarPaginaAsentada(page);
}

test.describe('Verbos regulares', () => {
  test('la sección está, y el enlace de la configuración lleva a ella', async ({ page }) => {
    await abrir(page);
    await expect(seccion(page).getByRole('heading', { level: 2 })).toHaveText('Verbos regulares: el pasado en -ed');
    await page.getByRole('link', { name: /Practica el pasado en -ed/ }).click();
    await expect(page).toHaveURL(/#verbos-regulares$/);
  });

  test('no repite rótulos ni clases que los tests del quiz de irregulares localizan sin acotar', async ({ page }) => {
    await abrir(page);
    const s = seccion(page);
    // Rótulos que localizan tests/apps/quiz-verbos-irregulares.spec.ts y tests/familias/quizzes.spec.ts
    const rotulos = /preguntas|Empezar Quiz|Escribir las formas|^Comprobar$|Siguiente pregunta|resultado|Jugar de nuevo|Cambiar nivel|Repasar mis fallos|Ver guía/i;
    const textos = await s.locator('button').allInnerTexts();
    expect(textos.filter((t) => rotulos.test(t.trim()))).toEqual([]);
    // Las opciones del quiz se localizan por su texto «A…»: ningún botón de esta sección empieza así
    expect(textos.filter((t) => /^\s*A\S/.test(t))).toEqual([]);
    // Ni fragmentos de clase de los que el spec del quiz busca con [class*="…"]
    const fragmentos = ['resultado', 'opcionesGrid', 'feedbackBanner', 'hudBar', 'hudValor', 'verboPrincipal',
      'preguntaEtiqueta', 'preguntaCard', 'conjugacion', 'nivelBtn', 'configPanel', 'btnIniciar', 'pregBtn',
      'statRValor', 'statsResultado', 'repasoCaja', 'avisoNivel', 'escrituraMarcaOk', 'faqItem'];
    const clases = await s.evaluate((el) => [el, ...el.querySelectorAll('*')].map((n) => n.getAttribute('class') ?? '').join(' '));
    expect(fragmentos.filter((f) => clases.includes(f))).toEqual([]);
  });

  test('escribir: acierto, fallo con su regla, y la nota cuenta los dos', async ({ page }) => {
    await abrir(page);
    const s = seccion(page);
    await s.getByRole('button', { name: '10 verbos', exact: true }).click();
    await s.getByRole('button', { name: /^Empezar con los regulares/ }).click();

    const input = s.getByLabel('Past Simple');
    await expect(input).toBeFocused();
    await expect(s.getByText('Verbo 1 de 10', { exact: true })).toBeVisible();

    // 1.ª: la forma buena, en mayúsculas y con punto, que el corrector admite
    let inf = (await s.locator('[lang="en"][class*="regVerbo"]').innerText()).trim();
    await input.fill(`${pasadosRegulares(verbo(inf))[0].toUpperCase()}.`);
    await input.press('Enter');
    await expect(s.getByRole('alert')).toContainText('¡Bien!');
    await expect(s.getByRole('button', { name: 'Siguiente verbo →' })).toBeFocused();
    await s.getByRole('button', { name: 'Siguiente verbo →' }).click();

    // 2.ª: «infinitivo + ed» sin aplicar la regla; si para este verbo resulta correcto, se escribe otra cosa
    inf = (await s.locator('[lang="en"][class*="regVerbo"]').innerText()).trim();
    const v = verbo(inf);
    const ingenuo = `${inf}ed`;
    const malo = pasadosRegulares(v).includes(ingenuo) ? `${inf}xd` : ingenuo;
    await expect(input).toBeFocused();
    await input.fill(malo);
    await s.getByRole('button', { name: 'Corregir' }).click();
    const alerta = s.getByRole('alert');
    await expect(alerta).toContainText('No es así');
    await expect(alerta).toContainText(`${inf} → ${pasadosRegulares(v).join(' / ')}`);
    await expect(alerta).toContainText(explicarOrtografia(v));
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    // El resto, en blanco: fallos
    for (let i = 2; i < 10; i++) {
      await s.getByRole('button', { name: /Siguiente verbo|Ver mi nota/ }).click();
      await s.getByRole('button', { name: 'Corregir' }).click();
    }
    await s.getByRole('button', { name: 'Ver mi nota de regulares' }).click();
    await expect(s.getByText('1 de 10', { exact: true })).toBeVisible();
    await expect(s).toContainText(/10\s%\sde acierto en «Escribir el pasado»/);
    await expect(s).toContainText(`Para repasar: ${inf}`);
  });

  test('pronunciar: la opción buena se marca, la elegida también, y la explicación nombra el sonido', async ({ page }) => {
    await abrir(page);
    const s = seccion(page);
    await s.getByRole('button', { name: /Cómo suena la -ed/ }).click();
    await expect(s.getByRole('button', { name: /Cómo suena la -ed/ })).toHaveAttribute('aria-pressed', 'true');
    await s.getByRole('button', { name: /^Empezar con los regulares/ }).click();
    await expect(s.getByText('¿Cómo suena la -ed de este pasado?')).toBeVisible();

    // 1.ª: la buena
    let pasado = (await s.locator('[lang="en"][class*="regVerbo"]').innerText()).trim();
    let v = porPasado(pasado);
    await s.getByRole('button', { name: NOMBRE[terminacionDe(v)] }).click();
    await expect(s.getByRole('alert')).toContainText('¡Bien!');
    await expect(s.getByRole('alert')).toContainText(`/${v.sonidoFinal}/`);
    await expect(s.getByRole('button', { name: /respuesta correcta/ })).toBeDisabled();
    await expect(s.locator('button[aria-pressed]:disabled')).toHaveCount(0);
    await s.getByRole('button', { name: 'Siguiente verbo →' }).click();
    await expect(s.locator('[class*="regEnunciado"]')).toBeFocused();

    // 2.ª: una mala
    pasado = (await s.locator('[lang="en"][class*="regVerbo"]').innerText()).trim();
    v = porPasado(pasado);
    const mala = (['t', 'd', 'id'] as Terminacion[]).find((t) => t !== terminacionDe(v))!;
    await s.getByRole('button', { name: NOMBRE[mala] }).click();
    await expect(s.getByRole('alert')).toContainText('No es así');
    await expect(s.getByRole('button', { name: /tu respuesta, incorrecta/ })).toHaveCount(1);
    await expect(s.getByRole('button', { name: /respuesta correcta/ })).toHaveAccessibleName(NOMBRE[terminacionDe(v)]);
  });

  test('closed y laughed: cuenta el sonido, no la letra', async () => {
    // Los dos verbos que la regla «por letra» fallaría: si el banco perdiera su sonido final,
    // la pregunta de pronunciación daría por buena la respuesta equivocada.
    expect(terminacionDe(verbo('close'))).toBe('d');
    expect(terminacionDe(verbo('laugh'))).toBe('t');
  });
});
