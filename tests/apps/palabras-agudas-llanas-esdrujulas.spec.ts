/**
 * palabras-agudas-llanas-esdrujulas — motor, casos de aula e interacción
 *
 * Ningún valor esperado de este fichero sale del código: cada separación, cada tipo y cada
 * forma escrita están resueltos a mano contra la Ortografía de la lengua española (RAE y ASALE,
 * 2010), §§ 3.4.1-3.4.3:
 *   · tónica en la última → aguda; penúltima → llana; antepenúltima → esdrújula; antes →
 *     sobresdrújula (contando desde el final);
 *   · agudas con tilde si acaban en vocal, n o s (no si la n o la s van tras consonante:
 *     robots); llanas con tilde si NO acaban así (bíceps sí la lleva); esdrújulas y
 *     sobresdrújulas siempre; la y final cuenta como consonante (rey, póney);
 *   · ley del hiato: i o u tónica junto a vocal abierta → tilde siempre (maíz, búho);
 *   · monosílabos sin tilde salvo la diacrítica; desde 2010 guion, fue o dio son monosílabos;
 *   · adverbios en -mente: conservan la tilde del adjetivo.
 *
 * El estado de la app que justifica la parte de navegador (PASO 4.bis de /nueva-app-meskeia):
 * la sílaba tónica ELEGIDA. Tocar una sílaba cambia el tipo, la tilde y la forma escrita; cambiar
 * de palabra tiene que olvidar la elección anterior, y en un hiato la elección está bloqueada.
 *
 * Ejecutar: npx playwright test tests/apps/palabras-agudas-llanas-esdrujulas.spec.ts
 */
import { test, expect } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import {
  analizarPalabra,
  analizarTexto,
  sinTildes,
  type TipoAcento,
} from '../../app/palabras-agudas-llanas-esdrujulas/motor';
import {
  BANCO,
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  enunciadoDe,
  generarEjercicioAleatorio,
  leerClase,
  resolverCaso,
} from '../../app/palabras-agudas-llanas-esdrujulas/casos';

const RUTA = '/palabras-agudas-llanas-esdrujulas/';

// ─── Motor: la palabra tal y como está escrita ─────────────────────────────────────────

interface Esperado {
  silabas: string;
  tipo: TipoAcento;
  tilde: 'si' | 'no' | 'depende';
  forma: string;
}

/** Palabras BIEN escritas: la tónica se deduce de la escritura y la forma no cambia. */
const BIEN_ESCRITAS: Record<string, Esperado> = {
  camión: { silabas: 'ca-mión', tipo: 'aguda', tilde: 'si', forma: 'camión' },
  reloj: { silabas: 're-loj', tipo: 'aguda', tilde: 'no', forma: 'reloj' },
  ciudad: { silabas: 'ciu-dad', tipo: 'aguda', tilde: 'no', forma: 'ciudad' },
  robots: { silabas: 'ro-bots', tipo: 'aguda', tilde: 'no', forma: 'robots' },
  aquí: { silabas: 'a-quí', tipo: 'aguda', tilde: 'si', forma: 'aquí' },
  lápiz: { silabas: 'lá-piz', tipo: 'llana', tilde: 'si', forma: 'lápiz' },
  examen: { silabas: 'e-xa-men', tipo: 'llana', tilde: 'no', forma: 'examen' },
  bíceps: { silabas: 'bí-ceps', tipo: 'llana', tilde: 'si', forma: 'bíceps' },
  pingüino: { silabas: 'pin-güi-no', tipo: 'llana', tilde: 'no', forma: 'pingüino' },
  murciélago: { silabas: 'mur-cié-la-go', tipo: 'esdrujula', tilde: 'si', forma: 'murciélago' },
  lingüística: { silabas: 'lin-güís-ti-ca', tipo: 'esdrujula', tilde: 'si', forma: 'lingüística' },
  dígamelo: { silabas: 'dí-ga-me-lo', tipo: 'sobresdrujula', tilde: 'si', forma: 'dígamelo' },
  rey: { silabas: 'rey', tipo: 'monosilaba', tilde: 'no', forma: 'rey' },
  guion: { silabas: 'guion', tipo: 'monosilaba', tilde: 'no', forma: 'guion' },
  MURCIÉLAGO: { silabas: 'MUR-CIÉ-LA-GO', tipo: 'esdrujula', tilde: 'si', forma: 'MURCIÉLAGO' },
};

test.describe('motor — palabras bien escritas', () => {
  for (const [palabra, e] of Object.entries(BIEN_ESCRITAS)) {
    test(`«${palabra}» → ${e.silabas}, ${e.tipo}, tilde ${e.tilde}`, () => {
      const a = analizarPalabra(palabra);
      expect(a).not.toBeNull();
      expect(a!.silabas.join('-')).toBe(e.silabas);
      expect(a!.tipo).toBe(e.tipo);
      expect(a!.tilde).toBe(e.tilde);
      expect(a!.formaCorrecta).toBe(e.forma);
      expect(a!.bienEscrita).toBe(true);
      expect(a!.tildeQueSobra).toBe(false);
    });
  }
});

test.describe('motor — ley del hiato', () => {
  test('maíz: aguda en z, pero lleva tilde por el hiato', () => {
    const a = analizarPalabra('maíz')!;
    expect(a.silabas.join('-')).toBe('ma-íz');
    expect(a.tipo).toBe('aguda');
    expect(a.tilde).toBe('si');
    expect(a.hiato).toBe(true);
    expect(a.regla).toMatch(/hiato/i);
  });

  test('búho: llana en vocal, pero lleva tilde por el hiato (la h no lo impide)', () => {
    const a = analizarPalabra('búho')!;
    expect(a.silabas.join('-')).toBe('bú-ho');
    expect(a.tipo).toBe('llana');
    expect(a.hiato).toBe(true);
  });

  test('en un hiato escrito la tónica queda fijada: elegir otra sílaba no cambia nada', () => {
    const a = analizarPalabra('día', 1)!;
    expect(a.tonicaFija).toBe(true);
    expect(a.indiceTonica).toBe(0);
    expect(a.formaCorrecta).toBe('día');
  });

  test('cuídate no es hiato: ui es diptongo y la tilde va por esdrújula', () => {
    const a = analizarPalabra('cuídate')!;
    expect(a.silabas.join('-')).toBe('cuí-da-te');
    expect(a.tipo).toBe('esdrujula');
    expect(a.hiato).toBe(false);
  });
});

test.describe('motor — la sílaba tónica elegida dice cómo se escribe', () => {
  const CASOS_ELEGIDOS: [string, number, TipoAcento, string][] = [
    ['arbol', 0, 'llana', 'árbol'],
    ['cancion', 1, 'aguda', 'canción'],
    ['telefono', 1, 'esdrujula', 'teléfono'],
    ['reloj', 1, 'aguda', 'reloj'],
    ['joven', 0, 'llana', 'joven'],
    ['biceps', 0, 'llana', 'bíceps'],
    ['poney', 0, 'llana', 'póney'],
    ['cuidate', 0, 'esdrujula', 'cuídate'],
    ['averiguais', 3, 'aguda', 'averiguáis'],
    ['Arbol', 0, 'llana', 'Árbol'],
  ];
  for (const [palabra, i, tipo, forma] of CASOS_ELEGIDOS) {
    test(`«${palabra}» con la tónica en la sílaba ${i + 1} → ${forma}`, () => {
      const a = analizarPalabra(palabra, i)!;
      expect(a.indiceTonica).toBe(i);
      expect(a.tipo).toBe(tipo);
      expect(a.formaCorrecta).toBe(forma);
      expect(a.bienEscrita).toBe(forma === palabra);
    });
  }

  test('sin elegir, «arbol» se deduce aguda (por la l final): es la conclusión circular que la elección corrige', () => {
    const a = analizarPalabra('arbol')!;
    expect(a.tipo).toBe('aguda');
    expect(a.tonicaElegida).toBe(false);
  });

  test('cambiar la tilde de sílaba en una palabra ya tildada la recoloca', () => {
    expect(analizarPalabra('examén', 1)!.formaCorrecta).toBe('examen');
  });

  test('un índice fuera de rango se ignora', () => {
    expect(analizarPalabra('arbol', 7)!.indiceTonica).toBe(analizarPalabra('arbol')!.indiceTonica);
    expect(analizarPalabra('arbol', -1)!.indiceTonica).toBe(analizarPalabra('arbol')!.indiceTonica);
  });
});

test.describe('motor — tildes que sobran', () => {
  const SOBRAN: [string, string][] = [
    ['relój', 'reloj'],
    ['cása', 'casa'],
    ['fué', 'fue'],
    ['guión', 'guion'],
  ];
  for (const [mal, bien] of SOBRAN) {
    test(`«${mal}» → ${bien}`, () => {
      const a = analizarPalabra(mal)!;
      expect(a.tildeQueSobra).toBe(true);
      expect(a.formaCorrecta).toBe(bien);
    });
  }
});

test.describe('motor — casos especiales', () => {
  test('adverbio en -mente: llano por «men», con la tilde del adjetivo', () => {
    const rapido = analizarPalabra('rápidamente')!;
    expect(rapido.tipo).toBe('llana');
    expect(rapido.adverbioMente).toBe(true);
    expect(rapido.tilde).toBe('si');
    expect(rapido.formaCorrecta).toBe('rápidamente');
    const lento = analizarPalabra('lentamente')!;
    expect(lento.tilde).toBe('no');
    expect(lento.formaCorrecta).toBe('lentamente');
  });

  test('«demente» y «vehemente» no son adverbios', () => {
    expect(analizarPalabra('demente')!.adverbioMente).toBe(false);
    expect(analizarPalabra('vehemente')!.adverbioMente).toBe(false);
  });

  test('tilde diacrítica: la decide el sentido y no se corrige nada', () => {
    for (const p of ['tú', 'tu', 'qué', 'que', 'cómo', 'como']) {
      const a = analizarPalabra(p)!;
      expect(a.tilde).toBe('depende');
      expect(a.formaCorrecta).toBe(p);
      expect(a.tildeQueSobra).toBe(false);
    }
  });

  test('lo que no es una palabra devuelve null', () => {
    for (const p of ['', '   ', '123', 'dos palabras', 'pst', 'casa1']) {
      expect(analizarPalabra(p)).toBeNull();
    }
  });

  test('una tilde en Unicode descompuesto (NFD) se lee como la misma palabra', () => {
    const a = analizarPalabra('árbol')!;
    expect(a.escrita).toBe('árbol');
    expect(a.tipo).toBe('llana');
  });
});

test.describe('motor — un texto', () => {
  test('recuento por tipo y tildes que sobran', () => {
    const r = analizarTexto('El reloj del árbol, cása murciélago.');
    // el (mon.) · reloj (ag.) · del (mon.) · árbol (ll.) · cása (ll., sobra) · murciélago (esdr.)
    expect(r.recuento).toEqual({ aguda: 1, llana: 2, esdrujula: 1, sobresdrujula: 0, monosilaba: 2 });
    expect(r.tildesQueSobran).toBe(1);
    expect(r.recortado).toBe(false);
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
    const A_MANO = [
      'aguda', 'llana', 'árbol', 'esdrujula', 'canción', 'aguda',
      'reloj', 'llana', 'teléfono', 'aguda', 'joven', 'sobresdrujula',
    ];
    expect(CASOS.map((c) => c.respuesta)).toEqual(A_MANO);
  });

  test('4 · cada caso tiene enunciado, etiqueta, respuesta y desarrollo', () => {
    for (const c of CASOS) {
      expect(c.enunciado.length).toBeGreaterThan(20);
      expect(c.etiquetaRespuesta.trim()).not.toBe('');
      expect(c.respuesta).not.toBe('');
      expect(c.pasos.length).toBeGreaterThanOrEqual(4);
      expect(resolverCaso(c.datos).ok).toBe(true);
    }
  });

  test('5 · ningún enunciado nombra un país ni una ciudad', () => {
    const LUGARES = /\b(España|México|Argentina|Colombia|Chile|Perú|Madrid|Barcelona|Bogotá|Lima|Buenos Aires)\b/;
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
      expect(resolverCaso(e.datos).valor).toBe(e.respuesta);
      expect(e.respuesta).not.toBe('');
    }
    expect(respuestas.size).toBeGreaterThanOrEqual(3);
    expect(formas.size).toBe(2);
  });

  test('7 · convenio: «grave» vale por «llana», y sin tilde también se entiende la clase', () => {
    expect(leerClase('grave')).toBe('llana');
    expect(leerClase('Llana')).toBe('llana');
    expect(leerClase('esdrujula')).toBe('esdrujula');
    expect(leerClase('monosílaba')).toBeNull();
    expect(comprobarRespuesta('grave', CASOS[1].datos).correcto).toBe(true);
  });

  test('corrector de «tildar»: acierto, falta, sobra, otra vocal y letra cambiada', () => {
    const arbol = CASOS[2].datos; // arbol → árbol
    const reloj = CASOS[6].datos; // reloj → reloj
    expect(comprobarRespuesta('árbol', arbol).correcto).toBe(true);
    expect(comprobarRespuesta('ÁRBOL', arbol).correcto).toBe(true);
    expect(comprobarRespuesta('arbol', arbol).motivo).toMatch(/^Falta la tilde/);
    expect(comprobarRespuesta('arból', arbol).correcto).toBe(false);
    expect(comprobarRespuesta('reloj', reloj).correcto).toBe(true);
    expect(comprobarRespuesta('relój', reloj).motivo).toMatch(/^Sobra la tilde/);
    expect(comprobarRespuesta('árbola', arbol).motivo).toMatch(/alguna letra/);
    expect(comprobarRespuesta('', arbol).correcto).toBe(false);
  });

  test('8 · cada caso tiene un título propio que no casa con los botones de la herramienta', () => {
    const titulos = CASOS.map((c) => c.titulo);
    expect(new Set(titulos).size).toBe(12);
    for (const t of titulos) expect(t).not.toMatch(/Comprobar|Practicar|Volver/);
  });
});

test.describe('banco de práctica — cotejado con una tabla a mano', () => {
  /** El tipo de cada palabra del banco, escrito a mano (no lo da el motor). */
  const TIPO_A_MANO: Record<string, TipoAcento> = {
    sofá: 'aguda', café: 'aguda', jabón: 'aguda', ratón: 'aguda', compás: 'aguda', también: 'aguda',
    colibrí: 'aguda', menú: 'aguda', sillón: 'aguda', avión: 'aguda', francés: 'aguda', bebé: 'aguda',
    pared: 'aguda', reloj: 'aguda', feliz: 'aguda', comer: 'aguda', ciudad: 'aguda', papel: 'aguda',
    verdad: 'aguda', nariz: 'aguda', salud: 'aguda', hablar: 'aguda',
    casa: 'llana', mesa: 'llana', joven: 'llana', examen: 'llana', lunes: 'llana', zapato: 'llana',
    ventana: 'llana', origen: 'llana', libro: 'llana', camino: 'llana',
    árbol: 'llana', lápiz: 'llana', fácil: 'llana', cárcel: 'llana', azúcar: 'llana', mármol: 'llana',
    césped: 'llana', débil: 'llana', túnel: 'llana', ángel: 'llana', carácter: 'llana',
    música: 'esdrujula', teléfono: 'esdrujula', pájaro: 'esdrujula', médico: 'esdrujula',
    lámpara: 'esdrujula', brújula: 'esdrujula', sábado: 'esdrujula', número: 'esdrujula',
    plátano: 'esdrujula', último: 'esdrujula', rápido: 'esdrujula',
    dígamelo: 'sobresdrujula', cómpratelo: 'sobresdrujula', explícaselo: 'sobresdrujula',
    devuélvemelo: 'sobresdrujula',
    país: 'aguda', maíz: 'aguda', baúl: 'aguda', día: 'llana', búho: 'llana', río: 'llana',
  };
  const HIATOS = new Set(['país', 'maíz', 'baúl', 'día', 'búho', 'río']);

  test('la tabla a mano cubre el banco entero', () => {
    expect(Object.keys(TIPO_A_MANO).sort()).toEqual([...BANCO].sort());
  });

  test('cada palabra: el tipo de la tabla, bien escrita y sin tilde que sobre', () => {
    for (const p of BANCO) {
      const a = analizarPalabra(p)!;
      expect(a, p).not.toBeNull();
      expect(a.tipo, p).toBe(TIPO_A_MANO[p]);
      expect(a.bienEscrita, p).toBe(true);
      expect(a.hiato, p).toBe(HIATOS.has(p));
    }
  });

  test('ida y vuelta: sin tildes y con su tónica, el motor vuelve a escribirla igual', () => {
    for (const p of BANCO.filter((x) => !HIATOS.has(x))) {
      const indice = analizarPalabra(p)!.indiceTonica;
      expect(analizarPalabra(sinTildes(p), indice)!.formaCorrecta, p).toBe(p);
    }
  });
});

// ─── Navegador: la sílaba elegida ─────────────────────────────────────────────────────

test.describe('navegador — elegir la sílaba tónica', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RUTA);
    await esperarHidratacion(page, ['#palabra']);
  });

  test('«arbol» sale aguda; al tocar «ar» pasa a llana y se escribe árbol', async ({ page }) => {
    const campo = page.locator('#palabra');
    await campo.fill('arbol');
    await esperarValorEnReact(page, campo, 'arbol');

    const analizador = page.locator('section[aria-labelledby="titulo-analizador"]');
    const grupo = analizador.getByRole('group', { name: /Sílabas/ });
    await expect(grupo.getByRole('button', { name: /^bol,/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(analizador.getByText('Aguda', { exact: true })).toBeVisible();

    await grupo.getByRole('button', { name: /^ar,/ }).click();
    await expect(grupo.getByRole('button', { name: /^ar,/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(analizador.getByText('Llana (grave)', { exact: true })).toBeVisible();
    await expect(analizador.getByText('árbol', { exact: true })).toBeVisible();
    await expect(analizador.getByText('Tú escribiste «arbol»')).toBeVisible();
  });

  test('cambiar de palabra olvida la sílaba elegida', async ({ page }) => {
    const campo = page.locator('#palabra');
    await campo.fill('arbol');
    await esperarValorEnReact(page, campo, 'arbol');
    await page.locator('section[aria-labelledby="titulo-analizador"]').getByRole('group', { name: /Sílabas/ }).getByRole('button', { name: /^ar,/ }).click();

    // «reloj» se deduce aguda (sílaba 2). Si la elección de «arbol» (sílaba 1) siguiera viva,
    // saldría marcada «re»: por eso esta palabra y no otra cuya deducida fuera también la 1.
    await campo.fill('reloj');
    await esperarValorEnReact(page, campo, 'reloj');
    const grupo = page.locator('section[aria-labelledby="titulo-analizador"]').getByRole('group', { name: /Sílabas/ });
    await expect(grupo.getByRole('button', { name: /^loj,/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(grupo.getByRole('button', { name: /^re,/ })).toHaveAttribute('aria-pressed', 'false');
  });

  test('en un hiato las sílabas no se pueden cambiar', async ({ page }) => {
    const campo = page.locator('#palabra');
    await campo.fill('maíz');
    await esperarValorEnReact(page, campo, 'maíz');
    const grupo = page.locator('section[aria-labelledby="titulo-analizador"]').getByRole('group', { name: /Sílabas/ });
    await expect(grupo.getByRole('button', { name: /^ma,/ })).toBeDisabled();
    await expect(page.locator('section[aria-labelledby="titulo-analizador"]').getByText(/Ley del hiato/)).toBeVisible();
  });

  test('una palabra del texto se carga en el analizador', async ({ page }) => {
    await page.getByRole('button', { name: /^colibrí: aguda/ }).click();
    await expect(page.locator('#palabra')).toHaveValue('colibrí');
  });

  test('caso 3 de clase: «árbol» es correcto y «arbol» pide la tilde', async ({ page }) => {
    await page.getByRole('button', { name: 'Caso 3: Tildar «arbol»' }).click();
    const casilla = page.locator('#casos-respuesta');
    await casilla.fill('arbol');
    await esperarValorEnReact(page, casilla, 'arbol');
    await page.locator('#casos-aula-titulo').locator('xpath=ancestor::section[1]').getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.getByText(/Falta la tilde/)).toBeVisible();

    await casilla.fill('árbol');
    await esperarValorEnReact(page, casilla, 'árbol');
    await page.locator('#casos-aula-titulo').locator('xpath=ancestor::section[1]').getByRole('button', { name: 'Comprobar' }).click();
    await expect(page.getByText(/^Correcto: árbol/)).toBeVisible();
  });

  test('caso 1 de clase: se elige la clase con un botón', async ({ page }) => {
    await page.getByRole('button', { name: 'Caso 1: Clasificar «camión»' }).click();
    const casos = page.locator('#casos-aula-titulo').locator('xpath=ancestor::section[1]');
    await casos.getByRole('button', { name: 'aguda', exact: true }).click();
    await expect(casos.getByRole('button', { name: 'aguda', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await casos.getByRole('button', { name: 'Comprobar' }).click();
    await expect(casos.getByText(/^Correcto: es aguda/)).toBeVisible();
  });
});
