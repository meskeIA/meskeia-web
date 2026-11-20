/**
 * diptongos-e-hiatos — motor, casos de aula e interacción
 *
 * Ningún valor esperado de este fichero sale del código: cada separación y cada clase están
 * resueltas a mano contra la Ortografía de la lengua española (RAE y ASALE, 2010), §§ 1.4 y
 * 3.4.2:
 *   · vocales abiertas a, e, o; cerradas i, u (y la y final, que suena i);
 *   · diptongo = dos vocales en la misma sílaba: cerrada + abierta (creciente: cie-lo),
 *     abierta + cerrada (decreciente: ai-re) o dos cerradas DISTINTAS (homogéneo: ciu-dad),
 *     también con tilde sobre una de las cerradas (cuí-da-te);
 *   · triptongo = cerrada + abierta + cerrada en la misma sílaba (buey, U-ru-guay);
 *   · hiato simple = dos abiertas (le-er, hé-ro-e) o dos cerradas iguales (chi-i-ta);
 *   · hiato acentual = cerrada TÓNICA (í, ú) junto a abierta (pa-ís, bú-ho, re-ír);
 *   · la h intercalada no impide el diptongo (ahu-ma-do) ni el hiato (bú-ho);
 *   · la u de que/qui/gue/gui no suena; la de gü, sí (pin-güi-no);
 *   · «a efectos ortográficos», guion es un diptongo y un monosílabo (§ 3.4.2.1).
 *
 * El estado de la app que justifica la parte de navegador (PASO 4.bis de /nueva-app-meskeia):
 * el filtro del texto, cargar una palabra del texto en el analizador y los casos de clase con
 * sus tres formas de respuesta (botones de familia, botones de subtipo y casilla de texto).
 *
 * Ejecutar: npx playwright test tests/apps/diptongos-e-hiatos.spec.ts
 */
import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { analizarPalabra, analizarTexto, type TipoEncuentro } from '../../app/diptongos-e-hiatos/motor';
import {
  BANCO,
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  enunciadoDe,
  generarEjercicioAleatorio,
  normalizarSeparacion,
  resolverCaso,
} from '../../app/diptongos-e-hiatos/casos';

const RUTA = '/diptongos-e-hiatos/';

// ─── Motor ────────────────────────────────────────────────────────────────────────────

interface Esperado {
  silabas: string;
  /** «texto=tipo», en el orden en que aparecen */
  encuentros: string[];
}

const A_MANO: Record<string, Esperado> = {
  cielo: { silabas: 'cie-lo', encuentros: ['ie=diptongo-creciente'] },
  nuevo: { silabas: 'nue-vo', encuentros: ['ue=diptongo-creciente'] },
  aire: { silabas: 'ai-re', encuentros: ['ai=diptongo-decreciente'] },
  rey: { silabas: 'rey', encuentros: ['ey=diptongo-decreciente'] },
  ciudad: { silabas: 'ciu-dad', encuentros: ['iu=diptongo-homogeneo'] },
  cuídate: { silabas: 'cuí-da-te', encuentros: ['uí=diptongo-homogeneo'] },
  pingüino: { silabas: 'pin-güi-no', encuentros: ['üi=diptongo-homogeneo'] },
  buey: { silabas: 'buey', encuentros: ['uey=triptongo'] },
  Uruguay: { silabas: 'U-ru-guay', encuentros: ['uay=triptongo'] },
  averiguáis: { silabas: 'a-ve-ri-guáis', encuentros: ['uái=triptongo'] },
  país: { silabas: 'pa-ís', encuentros: ['aí=hiato-acentual'] },
  búho: { silabas: 'bú-ho', encuentros: ['úho=hiato-acentual'] },
  reír: { silabas: 're-ír', encuentros: ['eí=hiato-acentual'] },
  aún: { silabas: 'a-ún', encuentros: ['aú=hiato-acentual'] },
  aun: { silabas: 'aun', encuentros: ['au=diptongo-decreciente'] },
  leer: { silabas: 'le-er', encuentros: ['ee=hiato-simple'] },
  héroe: { silabas: 'hé-ro-e', encuentros: ['oe=hiato-simple'] },
  chiita: { silabas: 'chi-i-ta', encuentros: ['ii=hiato-simple'] },
  vïuda: { silabas: 'vï-u-da', encuentros: ['ïu=hiato-simple'] },
  aéreo: { silabas: 'a-é-re-o', encuentros: ['aé=hiato-simple', 'eo=hiato-simple'] },
  leíais: { silabas: 'le-í-ais', encuentros: ['eí=hiato-acentual', 'ía=hiato-acentual', 'ai=diptongo-decreciente'] },
  ahumado: { silabas: 'ahu-ma-do', encuentros: ['ahu=diptongo-decreciente'] },
  cacahuete: { silabas: 'ca-ca-hue-te', encuentros: ['ue=diptongo-creciente'] },
  guion: { silabas: 'guion', encuentros: ['io=diptongo-creciente'] },
  queso: { silabas: 'que-so', encuentros: [] },
  casa: { silabas: 'ca-sa', encuentros: [] },
  MAÍZ: { silabas: 'MA-ÍZ', encuentros: ['AÍ=hiato-acentual'] },
};

test.describe('motor — cada encuentro con su clase', () => {
  for (const [palabra, e] of Object.entries(A_MANO)) {
    test(`«${palabra}» → ${e.silabas} · ${e.encuentros.join(', ') || 'ninguno'}`, () => {
      const a = analizarPalabra(palabra);
      expect(a).not.toBeNull();
      expect(a!.silabas.join('-')).toBe(e.silabas);
      expect(a!.encuentros.map((x) => `${x.texto}=${x.tipo}`)).toEqual(e.encuentros);
      // La posición recorta exactamente el texto del encuentro en la palabra escrita
      for (const x of a!.encuentros) expect(a!.escrita.slice(x.desde, x.hasta)).toBe(x.texto);
    });
  }

  test('posiciones a mano: bú-ho [1,4), chi-i-ta [2,4) (el dígrafo ch ocupa dos)', () => {
    const buho = analizarPalabra('búho')!.encuentros[0];
    expect([buho.desde, buho.hasta, buho.conH]).toEqual([1, 4, true]);
    const chiita = analizarPalabra('chiita')!.encuentros[0];
    expect([chiita.desde, chiita.hasta, chiita.conH]).toEqual([2, 4, false]);
  });

  test('la regla nombra lo que decide cada clase', () => {
    expect(analizarPalabra('país')!.encuentros[0].regla).toMatch(/ley del hiato/);
    expect(analizarPalabra('cielo')!.encuentros[0].regla).toMatch(/cerrada.*abierta/);
    expect(analizarPalabra('cuídate')!.encuentros[0].regla).toMatch(/La tilde no las separa/);
  });
});

test.describe('motor — avisos', () => {
  const aviso = (p: string, re: RegExp) => analizarPalabra(p)!.avisos.some((a) => re.test(a));

  test('la h intercalada', () => {
    expect(aviso('búho', /La h entre vocales/)).toBe(true);
    expect(aviso('ahumado', /La h entre vocales/)).toBe(true);
    expect(aviso('cielo', /La h entre vocales/)).toBe(false);
  });
  test('la u muda de que/gui y la ü que suena', () => {
    expect(aviso('queso', /la u no suena/)).toBe(true);
    expect(aviso('guitarra', /la u no suena/)).toBe(true);
    expect(aviso('agua', /la u no suena/)).toBe(false);
    expect(aviso('pingüino', /diéresis/)).toBe(true);
  });
  test('la y final y los diptongos ortográficos', () => {
    expect(aviso('rey', /La y al final/)).toBe(true);
    expect(aviso('mayo', /La y al final/)).toBe(false);
    expect(aviso('guion', /A efectos ortográficos/)).toBe(true);
    expect(aviso('guión', /A efectos ortográficos/)).toBe(true);
    expect(aviso('aun', /«aún» \(= todavía\)/)).toBe(true);
  });
});

test.describe('motor — entradas que no son una palabra', () => {
  for (const p of ['', '   ', '123', 'dos palabras', 'pfff', 'a-b']) {
    test(`«${p}» → null`, () => {
      expect(analizarPalabra(p)).toBeNull();
    });
  }
});

test.describe('motor — un texto', () => {
  test('cuenta palabras por familia y encuentros por tipo', () => {
    // El(—) poeta(hiato) vio(diptongo io) un(—) búho(hiato) en(—) el(—) cielo(diptongo)
    const t = analizarTexto('El poeta vio un búho en el cielo.');
    expect(t.totalPalabras).toBe(8);
    expect(t.palabras.map((p) => p.analisis.escrita)).toEqual(['poeta', 'vio', 'búho', 'cielo']);
    expect(t.porFamilia).toEqual({ diptongo: 2, triptongo: 0, hiato: 2 });
    expect(t.porTipo['hiato-simple']).toBe(1);
    expect(t.porTipo['hiato-acentual']).toBe(1);
    expect(t.porTipo['diptongo-creciente']).toBe(2);
  });

  test('una palabra con diptongo e hiato cuenta en las dos familias', () => {
    const t = analizarTexto('leíais');
    expect(t.palabras[0].familias).toEqual(['diptongo', 'hiato']);
    expect(t.porFamilia).toEqual({ diptongo: 1, triptongo: 0, hiato: 1 });
  });
});

// ─── Casos de aula ────────────────────────────────────────────────────────────────────

test.describe('casos de aula — invariantes', () => {
  test('1 · hay exactamente 12 casos, ids 1..12', () => {
    expect(TOTAL_CASOS).toBe(12);
    expect(CASOS.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('2 · deterministas: dos lecturas dan lo mismo', () => {
    for (const c of CASOS) {
      expect(enunciadoDe(c.datos)).toBe(c.enunciado);
      expect(resolverCaso(c.datos).valor).toBe(c.respuesta);
    }
  });

  test('3 · la respuesta declarada coincide con la resuelta a mano', () => {
    const RESUELTAS = [
      'diptongo', 'hiato', 'triptongo', 'diptongo-decreciente', 'po-e-ta', 'diptongo-homogeneo',
      'hiato', 'hiato-acentual', 'ma-íz', 'hiato-simple', 'cui-da-do', 'diptongo-creciente',
    ];
    expect(CASOS.map((c) => c.respuesta)).toEqual(RESUELTAS);
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta y desarrollo', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length).toBeGreaterThan(20);
      expect(c.etiquetaRespuesta.trim()).not.toBe('');
      expect(c.respuesta).not.toBe('');
      expect(c.pasos.length).toBeGreaterThanOrEqual(4);
      expect(resolverCaso(c.datos).ok).toBe(true);
      if (c.datos.forma !== 'separar') expect(c.opciones).toContain(c.respuesta);
    }
  });

  test('5 · ningún enunciado nombra un país ni una ciudad', () => {
    const LUGARES = /\b(España|México|Argentina|Colombia|Chile|Perú|Uruguay|Paraguay|Madrid|Barcelona|Bogotá|Lima|Buenos Aires)\b/;
    for (const c of CASOS) {
      expect(c.titulo).not.toMatch(LUGARES);
      expect(c.enunciado).not.toMatch(LUGARES);
    }
  });

  test('6 · el aleatorio es reproducible, variado y usa el mismo resolverCaso', () => {
    expect(generarEjercicioAleatorio(7)).toEqual(generarEjercicioAleatorio(7));
    const respuestas = new Set<string>();
    const formas = new Set<string>();
    for (let s = 1; s <= 40; s++) {
      const e = generarEjercicioAleatorio(s);
      respuestas.add(e.respuesta);
      formas.add(e.datos.forma);
      const r = resolverCaso(e.datos);
      expect(r.ok, e.datos.palabra).toBe(true);
      expect(r.valor).toBe(e.respuesta);
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(formas.size).toBe(3);
  });

  test('7 · convenio: guion es diptongo (Ortografía 2010) y queda FUERA de los casos', () => {
    expect(analizarPalabra('guion')!.silabas).toEqual(['guion']);
    const palabras = [...CASOS.map((c) => c.datos.palabra), ...BANCO];
    for (const fuera of ['guion', 'truhan', 'piano', 'cruel', 'dueto', 'riada', 'ahumado']) {
      expect(palabras).not.toContain(fuera);
    }
    // Y ninguna lleva una h dentro de un diptongo
    for (const p of palabras) {
      const e = analizarPalabra(p)!.encuentros[0];
      if (e.familia !== 'hiato') expect(e.conH, p).toBe(false);
    }
  });

  test('el desarrollo aclara la h intercalada (caso 7, «búho») y no la menciona sin ella', () => {
    expect(CASOS[6].pasos[0]).toBe('Vocales en contacto: «úho» (la h no cuenta: no suena)');
    expect(CASOS[0].pasos[0]).toBe('Vocales en contacto: «ie»');
  });

  test('corrector de «identificar» y «subtipo»: acierto, fallo con pista y opción ajena', () => {
    expect(comprobarRespuesta('diptongo', CASOS[0].datos).correcto).toBe(true);
    expect(comprobarRespuesta('hiato', CASOS[0].datos).motivo).toMatch(/misma sílaba/);
    expect(comprobarRespuesta('diptongo', CASOS[1].datos).motivo).toMatch(/sílabas distintas \(pa-ís\)/);
    expect(comprobarRespuesta('hiato-acentual', CASOS[7].datos).correcto).toBe(true);
    expect(comprobarRespuesta('hiato-simple', CASOS[7].datos).motivo).toMatch(/acentual/);
    expect(comprobarRespuesta('diptongo-creciente', CASOS[3].datos).motivo).toMatch(/decreciente/);
    expect(comprobarRespuesta('triptongo', CASOS[3].datos).correcto).toBe(false);
    expect(comprobarRespuesta('', CASOS[0].datos).correcto).toBe(false);
  });

  test('corrector de «separar»: separadores, sílabas de más o de menos, letras cambiadas', () => {
    const poeta = CASOS[4].datos;
    const maiz = CASOS[8].datos;
    expect(comprobarRespuesta('po-e-ta', poeta).correcto).toBe(true);
    expect(comprobarRespuesta('PO E TA', poeta).correcto).toBe(true);
    expect(comprobarRespuesta('po·e·ta', poeta).correcto).toBe(true);
    expect(comprobarRespuesta('poe-ta', poeta).motivo).toMatch(/^Tiene 3 sílabas, no 2/);
    expect(comprobarRespuesta('ma-íz', maiz).correcto).toBe(true);
    expect(comprobarRespuesta('maíz', maiz).motivo).toMatch(/^Tiene 2 sílabas, no 1.*hiato/);
    expect(comprobarRespuesta('ma-iz', maiz).motivo).toMatch(/alguna letra/);
    expect(comprobarRespuesta('cu-idado', CASOS[10].datos).motivo).toMatch(/^Tiene 3 sílabas, no 2.*no se separan/);
    expect(comprobarRespuesta('cuid-a-do', CASOS[10].datos).motivo).toMatch(/no se corta por ahí/);
    expect(normalizarSeparacion(' -po – e – ta- ')).toBe('po-e-ta');
  });

  test('8 · cada caso tiene un título propio que no casa con los botones de la herramienta', () => {
    const titulos = CASOS.map((c) => c.titulo);
    expect(new Set(titulos).size).toBe(12);
    for (const t of titulos) expect(t).not.toMatch(/Comprobar|Practicar|Todas|Con diptongo|Con hiato|Con triptongo/);
  });
});

test.describe('banco de práctica — cotejado con una tabla a mano', () => {
  const TIPO_A_MANO: Record<string, TipoEncuentro> = {
    cielo: 'diptongo-creciente', tierra: 'diptongo-creciente', bueno: 'diptongo-creciente',
    agua: 'diptongo-creciente', nuevo: 'diptongo-creciente', siete: 'diptongo-creciente',
    fuego: 'diptongo-creciente', huevo: 'diptongo-creciente', novia: 'diptongo-creciente',
    serio: 'diptongo-creciente', labio: 'diptongo-creciente', nieve: 'diptongo-creciente',
    puerta: 'diptongo-creciente',
    aire: 'diptongo-decreciente', peine: 'diptongo-decreciente', causa: 'diptongo-decreciente',
    reina: 'diptongo-decreciente', hoy: 'diptongo-decreciente', jaula: 'diptongo-decreciente',
    pausa: 'diptongo-decreciente',
    ciudad: 'diptongo-homogeneo', ruido: 'diptongo-homogeneo', cuidado: 'diptongo-homogeneo',
    viuda: 'diptongo-homogeneo',
    poeta: 'hiato-simple', leer: 'hiato-simple', creer: 'hiato-simple', león: 'hiato-simple',
    teatro: 'hiato-simple', museo: 'hiato-simple', caos: 'hiato-simple', océano: 'hiato-simple',
    línea: 'hiato-simple', héroe: 'hiato-simple', toalla: 'hiato-simple', peor: 'hiato-simple',
    idea: 'hiato-simple',
    país: 'hiato-acentual', maíz: 'hiato-acentual', día: 'hiato-acentual', río: 'hiato-acentual',
    búho: 'hiato-acentual', baúl: 'hiato-acentual', reír: 'hiato-acentual', oído: 'hiato-acentual',
    frío: 'hiato-acentual', tío: 'hiato-acentual', sandía: 'hiato-acentual', ataúd: 'hiato-acentual',
    actúa: 'hiato-acentual',
    buey: 'triptongo', miau: 'triptongo', guau: 'triptongo',
  };

  test('la tabla a mano cubre el banco entero', () => {
    expect(Object.keys(TIPO_A_MANO).sort()).toEqual([...BANCO].sort());
  });

  test('cada palabra: un solo encuentro, del tipo de la tabla', () => {
    for (const p of BANCO) {
      const a = analizarPalabra(p);
      expect(a, p).not.toBeNull();
      expect(a!.encuentros.length, p).toBe(1);
      expect(a!.encuentros[0].tipo, p).toBe(TIPO_A_MANO[p]);
    }
  });
});

// ─── Navegador ────────────────────────────────────────────────────────────────────────

test.describe('navegador — analizador, texto y casos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#palabra']);
  });

  test('«búho» sale como hiato acentual, con la regla y el aviso de la h', async ({ page }) => {
    const campo = page.locator('#palabra');
    await campo.fill('búho');
    await esperarValorEnReact(page, campo, 'búho');
    const analizador = page.locator('section[aria-labelledby="titulo-analizador"]');
    await expect(analizador.getByText('Hiato acentual', { exact: true })).toBeVisible();
    await expect(analizador.getByText(/ley del hiato/)).toBeVisible();
    await expect(analizador.getByText(/La h entre vocales/)).toBeVisible();
  });

  test('una palabra sin vocales en contacto lo dice', async ({ page }) => {
    const campo = page.locator('#palabra');
    await campo.fill('casa');
    await esperarValorEnReact(page, campo, 'casa');
    await expect(page.getByText(/No hay vocales en contacto/)).toBeVisible();
  });

  test('el filtro del texto deja solo las palabras con hiato', async ({ page }) => {
    const texto = page.locator('#texto');
    await texto.fill('El poeta vio un búho en el cielo.');
    await esperarValorEnReact(page, texto, 'El poeta vio un búho en el cielo.');
    const seccion = page.locator('section[aria-labelledby="titulo-texto"]');
    await seccion.getByRole('button', { name: 'Con hiato (2)' }).click();
    await expect(seccion.getByRole('button', { name: 'Con hiato (2)' })).toHaveAttribute('aria-pressed', 'true');
    await expect(seccion.getByRole('button', { name: /^poeta:/ })).toBeVisible();
    await expect(seccion.getByRole('button', { name: /^cielo:/ })).toHaveCount(0);
  });

  test('una palabra del texto se carga en el analizador', async ({ page }) => {
    const texto = page.locator('#texto');
    await texto.fill('Un buey en la ciudad.');
    await esperarValorEnReact(page, texto, 'Un buey en la ciudad.');
    await page.getByRole('button', { name: /^buey: triptongo/ }).click();
    await expect(page.locator('#palabra')).toHaveValue('buey');
  });

  test('caso 1 de clase: se elige la familia con un botón', async ({ page }) => {
    const casos = page.locator('#casos-aula-titulo').locator('xpath=ancestor::section[1]');
    await casos.getByRole('button', { name: 'Caso 1: ¿Qué tiene «cielo»?' }).click();
    await casos.getByRole('button', { name: 'diptongo', exact: true }).click();
    await expect(casos.getByRole('button', { name: 'diptongo', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await casos.getByRole('button', { name: 'Comprobar' }).click();
    await expect(casos.getByText(/^Correcto: tiene un diptongo/)).toBeVisible();
  });

  test('caso 8 de clase: los botones son los subtipos de hiato', async ({ page }) => {
    const casos = page.locator('#casos-aula-titulo').locator('xpath=ancestor::section[1]');
    await casos.getByRole('button', { name: 'Caso 8: El hiato de «río»' }).click();
    await expect(casos.getByRole('button', { name: 'simple', exact: true })).toBeVisible();
    await expect(casos.getByRole('button', { name: 'creciente', exact: true })).toHaveCount(0);
    await casos.getByRole('button', { name: 'acentual', exact: true }).click();
    await casos.getByRole('button', { name: 'Comprobar' }).click();
    await expect(casos.getByText(/^Correcto: es un hiato acentual/)).toBeVisible();
  });

  test('caso 9 de clase: separar «maíz» se escribe en la casilla', async ({ page }) => {
    const casos = page.locator('#casos-aula-titulo').locator('xpath=ancestor::section[1]');
    await casos.getByRole('button', { name: 'Caso 9: Separar «maíz»' }).click();
    const casilla = page.locator('#casos-respuesta');
    await casilla.fill('maíz');
    await esperarValorEnReact(page, casilla, 'maíz');
    await casos.getByRole('button', { name: 'Comprobar' }).click();
    await expect(casos.getByText(/^Tiene 2 sílabas, no 1/)).toBeVisible();

    await casilla.fill('ma-íz');
    await esperarValorEnReact(page, casilla, 'ma-íz');
    await casos.getByRole('button', { name: 'Comprobar' }).click();
    await expect(casos.getByText(/^Correcto: ma-íz/)).toBeVisible();
  });

  test('cambiar de caso limpia el veredicto anterior', async ({ page }) => {
    const casos = page.locator('#casos-aula-titulo').locator('xpath=ancestor::section[1]');
    await casos.getByRole('button', { name: 'Caso 1: ¿Qué tiene «cielo»?' }).click();
    await casos.getByRole('button', { name: 'hiato', exact: true }).click();
    await casos.getByRole('button', { name: 'Comprobar' }).click();
    await expect(casos.getByText(/^No: mira las vocales/)).toBeVisible();
    await casos.getByRole('button', { name: 'Caso 2: ¿Qué tiene «país»?' }).click();
    await expect(casos.getByText(/^No: mira las vocales/)).toHaveCount(0);
    await expect(casos.getByRole('button', { name: 'hiato', exact: true })).toHaveAttribute('aria-pressed', 'false');
  });
});
