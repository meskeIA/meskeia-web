/**
 * Silabeo del español — motor aparte y probado
 *
 * Vive fuera del componente y fuera de `metrica.ts` porque el build no puede ver una regla
 * ortográfica mal: solo lo ven los casos resueltos a mano de `tests/silabeo.spec.ts`.
 *
 * ── Por qué se reescribió (24/08/2026, hallazgos 207-211 del Inspector) ──────────────
 * La versión anterior recorría la palabra carácter a carácter decidiendo sobre la marcha, y
 * arrastraba cuatro defectos que se alimentaban entre sí:
 *
 *   · La «u» muda de «qu» y «gü» contaba como vocal. Cuando la vocal siguiente llevaba tilde,
 *     la regla del hiato cortaba contra esa u y devolvía una «sílaba» SIN NINGUNA VOCAL:
 *     «aquí» salía a-qu-í (3) y «química», qu-í-mi-ca (4). Lo contradecía la propia FAQ de la
 *     app, que declara que toda sílaba tiene al menos una vocal.
 *   · La «h» intercalada cortaba el diptongo: «ahumar» salía a-hu-mar (3) en vez de ahu-mar.
 *     La Ortografía de la RAE (2010) es explícita: la h entre vocales no impide el diptongo.
 *   · Solo miraba DOS consonantes seguidas, así que cualquier grupo de tres o más se partía
 *     mal: ab-strac-to, con-struir, tran-spor-te — ataques imposibles en español.
 *   · Y el error no se quedaba en la tarjeta de la palabra: entraba en las sílabas fonéticas
 *     del verso y falseaba el tipo de verso, que es la promesa central de la app.
 *
 * El algoritmo de ahora es el clásico en dos fases —primero los NÚCLEOS vocálicos, después el
 * reparto de las consonantes que quedan entre ellos—, que es como se enuncia la regla y evita
 * decidir sin ver el contexto completo.
 */

/** Una unidad indivisible de la palabra: vocal, consonante (o dígrafo) o la h muda */
interface Unidad {
  texto: string;
  tipo: 'V' | 'C' | 'H';
}

const VOCALES = 'aeiouáéíóúü';
const FUERTES = 'aeoáéó';
const DEBILES = 'iuíúü';
/** Vocal cerrada CON tilde: rompe el diptongo con una abierta (día, país, baúl) */
const DEBILES_TONICAS = 'íú';

/**
 * Grupos de dos consonantes que no se separan: forman el ataque de la sílaba siguiente.
 *
 * No entra «tl»: la Ortografía de la RAE recoge que en la mayor parte de España se silabea
 * at-le-ta y en México y otras zonas americanas a-tle-ta. Se elige la partición peninsular
 * porque es la única que produce un ataque válido en todas las variedades del español.
 */
const GRUPOS_INSEPARABLES = new Set([
  'pr', 'br', 'fr', 'tr', 'dr', 'cr', 'gr', 'kr',
  'pl', 'bl', 'fl', 'cl', 'gl', 'kl',
]);

// El `c !== ''` no sobra: `'aeiou'.includes('')` es true, y sin él la «y» de «buey» —que no
// tiene ninguna letra detrás— se clasificaba como consonante y el triptongo desaparecía.
const esVocal = (c: string) => c !== '' && VOCALES.includes(c);
const esFuerte = (c: string) => c !== '' && FUERTES.includes(c);
const esDebil = (c: string) => c !== '' && DEBILES.includes(c);

/**
 * Divide la palabra en unidades. Aquí se resuelven los dígrafos, y en particular las dos
 * combinaciones donde la «u» NO es una vocal:
 *
 *   · «qu» ante e/i → una sola consonante (queso, aquí, química)
 *   · «gu» ante e/i → una sola consonante (guerra, guitarra)
 *
 * Con «gü» la diéresis dice justamente lo contrario —la u suena—, así que ahí la g va sola y
 * la ü es una vocal más: lin-güís-ti-ca, pin-güi-no.
 */
function aUnidades(palabra: string): Unidad[] {
  const unidades: Unidad[] = [];
  let i = 0;

  while (i < palabra.length) {
    const c = palabra[i];
    const par = palabra.slice(i, i + 2);
    const siguienteALaU = palabra[i + 2] ?? '';

    if ((par === 'qu' || par === 'gu') && 'eiéí'.includes(siguienteALaU)) {
      unidades.push({ texto: par, tipo: 'C' });
      i += 2;
      continue;
    }
    if (par === 'ch' || par === 'll' || par === 'rr') {
      unidades.push({ texto: par, tipo: 'C' });
      i += 2;
      continue;
    }
    if (c === 'h') {
      unidades.push({ texto: 'h', tipo: 'H' });
      i += 1;
      continue;
    }
    // La «y» es consonante ante vocal (mayo) y semivocal en cualquier otra posición (rey, muy)
    if (c === 'y') {
      const siguiente = palabra[i + 1] ?? '';
      unidades.push({ texto: 'y', tipo: esVocal(siguiente) ? 'C' : 'V' });
      i += 1;
      continue;
    }
    unidades.push({ texto: c, tipo: esVocal(c) ? 'V' : 'C' });
    i += 1;
  }

  return unidades;
}

/**
 * ¿Se pronuncian en la misma sílaba estas dos vocales contiguas?
 *
 *   · abierta + abierta → hiato (le-er, ca-os)
 *   · cerrada tónica + abierta, o abierta + cerrada tónica → hiato (dí-a, pa-ís, ba-úl)
 *   · el resto → diptongo, incluidas dos cerradas distintas aunque una lleve tilde
 *     («cuí» de cuídate, «üí» de lingüística), como fija la RAE a efectos ortográficos
 */
function formanDiptongo(a: string, b: string): boolean {
  if (esFuerte(a) && esFuerte(b)) return false;
  if (esDebil(a) && esDebil(b)) return true;
  return !(DEBILES_TONICAS.includes(a) || DEBILES_TONICAS.includes(b));
}

/** ¿El grupo de consonantes que forman estas dos unidades va entero a la sílaba siguiente? */
function esAtaqueDoble(a: Unidad, b: Unidad): boolean {
  if (a.tipo !== 'C' || b.tipo !== 'C') return false;
  return GRUPOS_INSEPARABLES.has(a.texto + b.texto);
}

export interface NucleoSilabico {
  /** Índice de la primera unidad del núcleo */
  desde: number;
  /** Índice de la última unidad del núcleo (incluida) */
  hasta: number;
  /** Las vocales del núcleo, sin la h intercalada: 'au' en «ahu», 'uay' en «guay» */
  vocales: string;
}

/**
 * Agrupa las vocales en núcleos silábicos. La h intercalada se absorbe dentro del núcleo
 * cuando las vocales que separa forman diptongo (ahu-mar, prohi-bir) y queda fuera cuando
 * hay hiato de verdad (bú-ho), que es exactamente lo que dice la regla.
 */
function nucleos(unidades: Unidad[]): NucleoSilabico[] {
  const resultado: NucleoSilabico[] = [];
  let i = 0;

  while (i < unidades.length) {
    if (unidades[i].tipo !== 'V') {
      i++;
      continue;
    }
    const nucleo: NucleoSilabico = { desde: i, hasta: i, vocales: unidades[i].texto };
    let j = i + 1;

    while (j < unidades.length) {
      // La h no separa: se mira la vocal que hay detrás de ella
      const saltoH = unidades[j].tipo === 'H' ? 1 : 0;
      const siguiente = unidades[j + saltoH];
      if (!siguiente || siguiente.tipo !== 'V') break;

      const ultima = nucleo.vocales[nucleo.vocales.length - 1];
      if (!formanDiptongo(ultima, siguiente.texto)) break;
      // Un núcleo admite como mucho tres vocales (triptongo: buey, guau, u-ru-guay)
      if (nucleo.vocales.length >= 3) break;

      nucleo.vocales += siguiente.texto;
      nucleo.hasta = j + saltoH;
      j = j + saltoH + 1;
    }

    resultado.push(nucleo);
    i = nucleo.hasta + 1;
  }

  return resultado;
}

/**
 * Separa una palabra en sílabas.
 *
 * Devuelve `[palabra]` cuando no hay ninguna vocal (siglas, onomatopeyas): una sílaba sin
 * vocal no existe, así que en ese caso no se parte nada.
 */
export function separarSilabas(palabra: string): string[] {
  const limpia = palabra.toLowerCase().trim();
  if (!limpia) return [];

  const unidades = aUnidades(limpia);
  const nuc = nucleos(unidades);
  if (nuc.length === 0) return [limpia];
  if (nuc.length === 1) return [limpia];

  // Corte entre cada par de núcleos: se reparte el bloque de consonantes que hay en medio
  const cortes: number[] = []; // índice de unidad donde empieza cada sílaba nueva
  for (let n = 0; n < nuc.length - 1; n++) {
    const primeraLibre = nuc[n].hasta + 1;      // primera consonante tras el núcleo
    const finBloque = nuc[n + 1].desde;          // primera unidad del núcleo siguiente
    const bloque = unidades.slice(primeraLibre, finBloque);
    const k = bloque.length;

    let alaDerecha: number;
    if (k === 0) alaDerecha = 0;                                   // hiato: le-er
    else if (k === 1) alaDerecha = 1;                              // V-CV: ca-sa, a-quí
    else if (k === 2) alaDerecha = esAtaqueDoble(bloque[0], bloque[1]) ? 2 : 1;
    else if (k === 3) alaDerecha = esAtaqueDoble(bloque[1], bloque[2]) ? 2 : 1;
    else alaDerecha = 2;                                           // abs-trac-to, cons-truir

    cortes.push(finBloque - alaDerecha);
  }

  // Reconstruir el texto de cada sílaba a partir de los índices de unidad
  const silabas: string[] = [];
  let inicio = 0;
  for (const corte of [...cortes, unidades.length]) {
    silabas.push(unidades.slice(inicio, corte).map((u) => u.texto).join(''));
    inicio = corte;
  }
  return silabas.filter((s) => s !== '');
}

export interface EncuentrosVocalicos {
  diptongos: string[];
  triptongos: string[];
  hiatos: string[];
}

/**
 * Diptongos, triptongos e hiatos de una palabra.
 *
 * La app los anunciaba en su JSON-LD («Identificación de diptongos, hiatos y triptongos») y
 * en la tarjeta de Twitter, pero no marcaba ninguno: solo los explicaba en el texto
 * educativo, que es lo mismo que da cualquier apunte (hallazgo 212).
 */
export function encuentrosVocalicos(palabra: string): EncuentrosVocalicos {
  const limpia = palabra.toLowerCase().trim();
  const unidades = aUnidades(limpia);
  const nuc = nucleos(unidades);

  const diptongos = nuc.filter((n) => n.vocales.length === 2).map((n) => n.vocales);
  const triptongos = nuc.filter((n) => n.vocales.length === 3).map((n) => n.vocales);

  // Hiato = dos núcleos contiguos sin ninguna consonante en medio (la h no cuenta)
  const hiatos: string[] = [];
  for (let n = 0; n < nuc.length - 1; n++) {
    const enMedio = unidades.slice(nuc[n].hasta + 1, nuc[n + 1].desde);
    if (enMedio.every((u) => u.tipo === 'H')) {
      const a = nuc[n].vocales[nuc[n].vocales.length - 1];
      const b = nuc[n + 1].vocales[0];
      hiatos.push(`${a}-${b}`);
    }
  }

  return { diptongos, triptongos, hiatos };
}
