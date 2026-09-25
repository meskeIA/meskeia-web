/**
 * Números y cantidades escritos en letras (español)
 *
 * Motor puro, sin React ni DOM, para poder probarlo con casos a mano antes de
 * montar ninguna vista encima.
 *
 * Lo que hace que esto no sea una tabla de equivalencias:
 *   · apócope     — «veintiún euros» frente a «veintiuno»
 *   · concordancia — «doscientas una libras» frente a «doscientos un euros»
 *   · cien/ciento  — «cien» exacto, «ciento uno» con resto
 *   · escala larga — 10⁹ es «mil millones», no «un billón» (eso es 10¹²)
 *   · «mil» sin numeral delante cuando vale uno: «mil euros», nunca «un mil»
 *
 * Ámbito: enteros de 0 a 999.999.999.999 y hasta dos decimales. El tope no es
 * caprichoso: las cantidades se manejan internamente en céntimos, y por encima
 * de ahí un entero de JavaScript deja de ser exacto.
 */

export type GeneroNumeral = 'masculino' | 'femenino';

export const LIMITE_NUMERO_A_LETRAS = 999_999_999_999;

const UNIDADES = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
  'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
  'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
];

const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];

const CENTENAS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

/** Femenino de las centenas: doscientas, quinientas… (ciento no varía) */
function centenaConGenero(centena: number, genero: GeneroNumeral): string {
  const base = CENTENAS[centena];
  if (genero === 'femenino' && centena >= 2) return `${base.slice(0, -2)}as`;
  return base;
}

/** Uno → una (femenino) o un (apocopado ante sustantivo) */
function ajustarUno(texto: string, genero: GeneroNumeral, apocope: boolean): string {
  if (genero === 'femenino') {
    if (texto === 'uno') return 'una';
    if (texto === 'veintiuno') return 'veintiuna';
    if (texto.endsWith(' y uno')) return `${texto.slice(0, -3)}una`;
    return texto;
  }
  if (!apocope) return texto;
  if (texto === 'uno') return 'un';
  if (texto === 'veintiuno') return 'veintiún';
  if (texto.endsWith(' y uno')) return `${texto.slice(0, -3)}un`;
  return texto;
}

/** Grupo de tres cifras (1-999). El cero no se escribe dentro de un grupo. */
function grupoDeTres(n: number, genero: GeneroNumeral, apocope: boolean): string {
  if (n === 100) return 'cien';

  const centena = Math.floor(n / 100);
  const resto = n % 100;

  const partes: string[] = [];
  if (centena > 0) partes.push(centenaConGenero(centena, genero));

  if (resto > 0) {
    if (resto < 30) {
      partes.push(ajustarUno(UNIDADES[resto], genero, apocope));
    } else {
      const decena = Math.floor(resto / 10);
      const unidad = resto % 10;
      partes.push(
        unidad === 0
          ? DECENAS[decena]
          : ajustarUno(`${DECENAS[decena]} y ${UNIDADES[unidad]}`, genero, apocope),
      );
    }
  }

  return partes.join(' ');
}

/**
 * Escribe un entero en letras.
 *
 * @param genero  concordancia con el sustantivo que sigue (una peseta, un euro)
 * @param apocope «un/veintiún» cuando el numeral precede al sustantivo; sin él
 *                queda la forma plena «uno/veintiuno», que es la que se usa al
 *                leer el número suelto
 */
export function enteroALetras(
  entero: number,
  { genero = 'masculino', apocope = false }: { genero?: GeneroNumeral; apocope?: boolean } = {},
): string {
  if (!Number.isFinite(entero) || !Number.isInteger(entero)) {
    throw new Error('Solo se pueden escribir en letras números enteros.');
  }
  if (Math.abs(entero) > LIMITE_NUMERO_A_LETRAS) {
    throw new Error(`El número supera el límite admitido (${LIMITE_NUMERO_A_LETRAS}).`);
  }

  if (entero < 0) return `menos ${enteroALetras(-entero, { genero, apocope })}`;
  if (entero === 0) return 'cero';

  const millones = Math.floor(entero / 1_000_000);
  const restoBajo = entero % 1_000_000;
  const millares = Math.floor(restoBajo / 1000);
  const unidades = restoBajo % 1000;

  const partes: string[] = [];

  if (millones > 0) {
    // «Millón» es un sustantivo masculino: el numeral que lo precede concuerda
    // con él y no con la moneda («doscientos un millones de pesetas»).
    if (millones === 1) {
      partes.push('un millón');
    } else {
      partes.push(`${enteroALetras(millones, { genero: 'masculino', apocope: true })} millones`);
    }
  }

  if (millares > 0) {
    // «Mil» no lleva numeral cuando vale uno: mil euros, nunca un mil euros.
    partes.push(millares === 1 ? 'mil' : `${grupoDeTres(millares, genero, true)} mil`);
  }

  if (unidades > 0) {
    partes.push(grupoDeTres(unidades, genero, apocope));
  }

  return partes.join(' ');
}

// ─── Cantidades de dinero ──────────────────────────────────────────────────────

export interface Moneda {
  /** Identificador para el selector */
  codigo: string;
  singular: string;
  plural: string;
  /** Subunidad: céntimo, centavo, peso… */
  fraccionSingular: string;
  fraccionPlural: string;
  /** Género de la unidad principal, para la concordancia del numeral */
  genero: GeneroNumeral;
  /** Países donde es la moneda de curso legal (para el selector) */
  zona: string;
}

/**
 * El GÉNERO de cada moneda decide la concordancia del numeral, y las centenas concuerdan
 * siempre (DPD, s. v. «uno» §2.3): declararlo mal escribe «doscientas lempiras» en un cheque.
 * Por eso cada género está cotejado con el DLE (acepción de «unidad monetaria», consultado el
 * 24/09/2026) y no se deduce de la terminación de la palabra:
 *
 *   euro m. · peso m. · dólar m. · sol m. · boliviano m. · quetzal m. («moneda guatemalteca»)
 *   · colón m. · lempira m. · córdoba m. · guaraní m. · bolívar m. · libra f.
 *   https://dle.rae.es/lempira — «1. m. Unidad monetaria de Honduras.»
 *   https://dle.rae.es/córdoba — «1. m. Unidad monetaria de Nicaragua.»
 *   https://dle.rae.es/libra   — libra esterlina: «1. f. Unidad monetaria del Reino Unido…»
 *
 * Las dos que terminan en -a son la trampa: «lempira» y «córdoba» son MASCULINOS («un lempira»,
 * «veintiún córdobas»). El lempira estuvo declarado femenino hasta el hallazgo 1537 del
 * Inspector (24/09/2026). Las subunidades (céntimo, centavo, centésimo, penique) son todas
 * masculinas en el DLE, y la fracción se escribe siempre en masculino (cantidadALetras).
 */
export const MONEDAS: Moneda[] = [
  { codigo: 'EUR', singular: 'euro', plural: 'euros', fraccionSingular: 'céntimo', fraccionPlural: 'céntimos', genero: 'masculino', zona: 'España y zona euro' },
  { codigo: 'MXN', singular: 'peso', plural: 'pesos', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'México' },
  { codigo: 'ARS', singular: 'peso', plural: 'pesos', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'Argentina' },
  { codigo: 'COP', singular: 'peso', plural: 'pesos', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'Colombia' },
  { codigo: 'CLP', singular: 'peso', plural: 'pesos', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'Chile' },
  { codigo: 'USD', singular: 'dólar', plural: 'dólares', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'Estados Unidos, Ecuador, El Salvador y Panamá' },
  { codigo: 'PEN', singular: 'sol', plural: 'soles', fraccionSingular: 'céntimo', fraccionPlural: 'céntimos', genero: 'masculino', zona: 'Perú' },
  { codigo: 'BOB', singular: 'boliviano', plural: 'bolivianos', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'Bolivia' },
  { codigo: 'GTQ', singular: 'quetzal', plural: 'quetzales', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'Guatemala' },
  { codigo: 'CRC', singular: 'colón', plural: 'colones', fraccionSingular: 'céntimo', fraccionPlural: 'céntimos', genero: 'masculino', zona: 'Costa Rica' },
  { codigo: 'HNL', singular: 'lempira', plural: 'lempiras', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'Honduras' },
  { codigo: 'NIO', singular: 'córdoba', plural: 'córdobas', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'Nicaragua' },
  { codigo: 'PYG', singular: 'guaraní', plural: 'guaraníes', fraccionSingular: 'céntimo', fraccionPlural: 'céntimos', genero: 'masculino', zona: 'Paraguay' },
  { codigo: 'UYU', singular: 'peso', plural: 'pesos', fraccionSingular: 'centésimo', fraccionPlural: 'centésimos', genero: 'masculino', zona: 'Uruguay' },
  { codigo: 'DOP', singular: 'peso', plural: 'pesos', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'masculino', zona: 'República Dominicana' },
  { codigo: 'VES', singular: 'bolívar', plural: 'bolívares', fraccionSingular: 'céntimo', fraccionPlural: 'céntimos', genero: 'masculino', zona: 'Venezuela' },
  { codigo: 'GBP', singular: 'libra', plural: 'libras', fraccionSingular: 'penique', fraccionPlural: 'peniques', genero: 'femenino', zona: 'Reino Unido' },
];

export type EstiloFraccion =
  /** …con cincuenta céntimos */
  | 'letras'
  /** …con 50/100 (uso extendido en cheques y facturas de Latinoamérica) */
  | 'fraccion'
  /** se omite la parte decimal */
  | 'omitir';

export interface OpcionesCantidad {
  moneda: Moneda;
  estiloFraccion?: EstiloFraccion;
  mayusculas?: boolean;
}

export interface CantidadEnLetras {
  /** Texto listo para copiar */
  texto: string;
  /** Parte entera en letras, sin la moneda */
  entero: string;
  /** Céntimos (0-99) */
  fraccion: number;
}

/**
 * Escribe una cantidad de dinero en letras.
 *
 * El redondeo es a dos decimales: 3,456 € se escribe como 3,46 €, igual que
 * haría cualquier factura.
 */
/** ¿El numeral termina en «millón» o «millones», y por tanto pide «de» ante el sustantivo? */
function cuantificaConDe(numeral: string): boolean {
  return /mill(ón|ones)$/.test(numeral);
}

export function cantidadALetras(valor: number, opciones: OpcionesCantidad): CantidadEnLetras {
  const { moneda, estiloFraccion = 'letras', mayusculas = false } = opciones;

  if (!Number.isFinite(valor)) {
    throw new Error('Introduce una cantidad válida.');
  }
  const negativo = valor < 0;
  const totalCentimos = Math.round(Math.abs(valor) * 100);
  const entero = Math.floor(totalCentimos / 100);
  const fraccion = totalCentimos % 100;

  /**
   * El tope se compara contra la parte ENTERA —la ayuda anuncia «hasta 999.999.999.999 y dos
   * decimales», y comparando el valor con céntimos el propio máximo declarado se rechazaba—,
   * pero contra la parte entera YA REDONDEADA a céntimos, que es la que se va a leer.
   *
   * Comprobándolo antes del redondeo quedaba una franja de un céntimo,
   * [999.999.999.999,995 , 1.000.000.000.000), que pasaba el filtro y reventaba aquí dentro
   * (hallazgo 263 del Inspector). El importe se formatea en español también en el error:
   * es una cifra que puede acabar en pantalla.
   */
  if (entero > LIMITE_NUMERO_A_LETRAS) {
    throw new Error(
      `La cantidad supera el límite admitido (${LIMITE_NUMERO_A_LETRAS.toLocaleString('es-ES')}).`,
    );
  }

  // El numeral concuerda con la moneda y va apocopado por precederla:
  // «veintiún euros», «veintiuna libras».
  const enteroTexto = enteroALetras(entero, { genero: moneda.genero, apocope: true });
  const unidad = entero === 1 ? moneda.singular : moneda.plural;

  /**
   * DPD, s. v. «millón»: cuando millón/millones NO va seguido de otro numeral, el sustantivo
   * cuantificado se introduce con DE. «Un millón DE euros», pero «un millón doscientos mil
   * euros» (correcto sin «de»). Faltaba, y se alcanzaba pulsando el ejemplo 1.000.000 que la
   * propia app ofrece: la línea que invita a copiar en un pagaré decía «la cantidad de un
   * millón euros». Afecta igual a las monedas femeninas: «un millón DE libras».
   */
  const partes = [enteroTexto, cuantificaConDe(enteroTexto) ? `de ${unidad}` : unidad];

  if (estiloFraccion === 'fraccion') {
    partes.push(`con ${String(fraccion).padStart(2, '0')}/100`);
  } else if (estiloFraccion === 'letras' && fraccion > 0) {
    const fraccionTexto = enteroALetras(fraccion, { genero: 'masculino', apocope: true });
    partes.push(`con ${fraccionTexto} ${fraccion === 1 ? moneda.fraccionSingular : moneda.fraccionPlural}`);
  }

  let texto = partes.join(' ');
  if (negativo) texto = `menos ${texto}`;
  if (mayusculas) texto = texto.toUpperCase();

  return { texto, entero: enteroTexto, fraccion };
}

/**
 * Escribe un número suelto en letras, sin moneda, con los decimales leídos cifra a
 * cifra tras «coma»: 3,45 → «tres coma cuatro cinco». Es UNA de las lecturas orales
 * que admite el DPD (§3.4), junto a «tres coma cuarenta y cinco»; la forma escrita
 * que recomienda para documentos es «tres con cuarenta y cinco centésimas», y esa
 * la compone `conversor-numeros-letras/motor.ts` (hallazgo 1707, 25/09/2026).
 */
export function numeroALetras(
  valor: number,
  genero: GeneroNumeral = 'masculino',
  decimalesTecleados?: string,
): string {
  if (!Number.isFinite(valor)) {
    throw new Error('Introduce un número válido.');
  }
  if (Math.floor(Math.abs(valor)) > LIMITE_NUMERO_A_LETRAS) {
    throw new Error(`El número supera el límite admitido (${LIMITE_NUMERO_A_LETRAS}).`);
  }

  const negativo = valor < 0;
  const absoluto = Math.abs(valor);
  const entero = Math.floor(absoluto);

  let texto = enteroALetras(entero, { genero });

  // El número ya no recuerda el cero final que el usuario escribió: 0,50 vale 0,5. Y la app
  // promete leer «las cifras tras la coma una a una», de modo que 0,50 es «cero coma cinco
  // cero». Por eso quien llama puede pasar las cifras tal como se teclearon.
  const decimalesTexto =
    decimalesTecleados && /^\d+$/.test(decimalesTecleados)
      ? decimalesTecleados
      : String(absoluto).split('.')[1];
  if (decimalesTexto) {
    const cifras = decimalesTexto
      .split('')
      .map((c) => UNIDADES[Number(c)])
      .join(' ');
    texto = `${texto} coma ${cifras}`;
  }

  return negativo ? `menos ${texto}` : texto;
}

// ─── La moneda escrita junto a la cifra ────────────────────────────────────────

/**
 * Lo que señala la moneda cuando viene escrito junto a la cifra: un símbolo («£1.500»,
 * «S/ 1,500.00»), un código ISO («1.500 EUR», que es como la propia app etiqueta el importe)
 * o el nombre («1500 pesos»).
 *
 * ── Por qué existe (hallazgos 1540 y 1542 del Inspector, 24/09/2026) ─────────────────────
 * El parser toleraba €, $ y £ pegados a la cifra, pero los TIRABA: «£1.500» salía «mil
 * quinientos euros» sin ningún aviso, y quien pegaba «$1,500.00» desde México leía «euros».
 * A la vez rechazaba con «Escribe solo cifras» los símbolos de las monedas que la propia app
 * ofrece en su selector: «S/ 1,500.00», «Q1,500.00», «RD$1,500.00». Ahora todos se leen, y
 * la marca no se descarta: la vista la usa para elegir la moneda o avisa de que no coincide.
 *
 * ── De dónde salen los símbolos ─────────────────────────────────────────────────────────
 * CLDR 48 (Unicode Common Locale Data Repository): el símbolo de cada moneda en la
 * configuración regional de su propio país —el que escribe `Intl.NumberFormat` al formatear
 * en es-MX, es-PE, es-HN…—, consultado el 24/09/2026 con el ICU 78.2 de Node 24:
 *   EUR € · GBP £ · PEN S/ · GTQ Q · HNL L · NIO C$ · CRC ₡ · DOP RD$ · PYG Gs. y ₲
 *   · BOB Bs · VES Bs.S · USD $ y US$ · MXN, ARS, COP, CLP y UYU $.
 * Se admite además el punto de abreviatura que se suele añadir a los que acaban en letra o
 * en barra («S/.», «L.», «Q.», «Bs.»): es un punto que no forma parte de la cifra.
 *
 * ── Las marcas ambiguas, decididas ──────────────────────────────────────────────────────
 *   · «$» lo usan seis pesos y el dólar. NO se adivina cuál: si la moneda elegida es una de
 *     ellas, cuadra; si no, la vista avisa y pide elegir. Entre pesos el texto es idéntico
 *     («pesos… centavos», salvo los centésimos uruguayos), pero entre peso y dólar no.
 *   · «Bs» abrevia tanto «bolivianos» como «bolívares»: se trata igual que «$».
 *   · «L» y «Q» son una sola letra, pero dentro de este selector solo hay un lempira y un
 *     quetzal, y se exigen EN MAYÚSCULA y sin otra letra pegada («SOL» no acaba en «L»).
 * Los códigos ISO y los nombres se aceptan en mayúsculas o minúsculas, y los nombres también
 * sin tilde («dolares»). «M.N.» (moneda nacional, habitual en facturas de México) se admite
 * al final, pero no señala ninguna moneda por sí solo.
 */
export interface MarcaMoneda {
  /** Tal como se escribió: «£», «RD$», «usd», «pesos». Dos si iba delante y detrás. */
  textos: string[];
  /**
   * Códigos de MONEDAS que encajan. Más de uno si la marca es ambigua («$», «Bs», «pesos»);
   * VACÍO si la de delante y la de detrás se contradicen («$1.500 €»).
   */
  codigos: string[];
}

export interface EntradaConMarca {
  /** La cifra sin la marca, con su signo: lo que hay que pasar a `parseSpanishNumber` */
  cifra: string;
  marca: MarcaMoneda | null;
  /** Lo que iba delante y detrás de la cifra, para reescribir el campo sin perder la marca */
  antes: string;
  despues: string;
}

const PESOS_Y_DOLAR = ['MXN', 'ARS', 'COP', 'CLP', 'USD', 'UYU', 'DOP'];

/** Símbolos de CLDR 48 (ver arriba), de más largo a más corto para que «RD$» gane a «$» */
const SIMBOLOS: Array<{ simbolo: string; codigos: string[] }> = [
  { simbolo: 'Bs.S', codigos: ['VES'] },
  { simbolo: 'US$', codigos: ['USD'] },
  { simbolo: 'RD$', codigos: ['DOP'] },
  { simbolo: 'C$', codigos: ['NIO'] },
  { simbolo: 'S/', codigos: ['PEN'] },
  { simbolo: 'Bs', codigos: ['BOB', 'VES'] },
  { simbolo: 'Gs', codigos: ['PYG'] },
  // Abreviaturas de uso diario que no están en CLDR (hallazgo 1710): «Lps.» para el lempira,
  // «U$S» para el dólar en el Río de la Plata, «$U» para el peso uruguayo y «¢», que en Costa
  // Rica sustituye a «₡» porque este no está en el teclado. Van antes que «L» y «$»: la tabla
  // se recorre en orden y gana el primer símbolo que encaja.
  { simbolo: 'Lps', codigos: ['HNL'] },
  { simbolo: 'U$S', codigos: ['USD'] },
  { simbolo: '$U', codigos: ['UYU'] },
  { simbolo: '¢', codigos: ['CRC'] },
  { simbolo: '€', codigos: ['EUR'] },
  { simbolo: '£', codigos: ['GBP'] },
  { simbolo: '₡', codigos: ['CRC'] },
  { simbolo: '₲', codigos: ['PYG'] },
  { simbolo: '$', codigos: PESOS_Y_DOLAR },
  { simbolo: 'Q', codigos: ['GTQ'] },
  { simbolo: 'L', codigos: ['HNL'] },
];

const CODIGOS_ISO = new Set(MONEDAS.map((m) => m.codigo));

const sinTildes = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** «pesos» → los seis pesos; «dolares» → USD… Singular y plural, sin tildes */
const NOMBRES = new Map<string, string[]>();
for (const m of MONEDAS) {
  for (const nombre of [m.singular, m.plural]) {
    const clave = sinTildes(nombre);
    const codigos = NOMBRES.get(clave) ?? [];
    if (!codigos.includes(m.codigo)) codigos.push(m.codigo);
    NOMBRES.set(clave, codigos);
  }
}

const esLetra = (c: string | undefined) => !!c && /\p{L}/u.test(c);
/** Los símbolos que acaban en letra o barra admiten el punto de abreviatura: «S/.», «L.» */
const admitePunto = (simbolo: string) => /[\p{L}/]$/u.test(simbolo);

interface Pieza {
  consumido: string;
  texto: string;
  codigos: string[];
}

function leerDelante(texto: string): Pieza | null {
  const iso = texto.match(/^([A-Za-z]{3})(?!\p{L})\s*/u);
  if (iso && CODIGOS_ISO.has(iso[1].toUpperCase())) {
    return { consumido: iso[0], texto: iso[1], codigos: [iso[1].toUpperCase()] };
  }
  for (const { simbolo, codigos } of SIMBOLOS) {
    if (!texto.startsWith(simbolo)) continue;
    let fin = simbolo.length;
    if (admitePunto(simbolo) && texto[fin] === '.') fin += 1;
    // «Q» o «L» seguidas de otra letra son una palabra, no un símbolo
    if (esLetra(simbolo.slice(-1)) && esLetra(texto[fin])) continue;
    const espacios = texto.slice(fin).match(/^\s*/)?.[0] ?? '';
    return { consumido: texto.slice(0, fin) + espacios, texto: texto.slice(0, fin), codigos };
  }
  return null;
}

function leerDetras(texto: string): Pieza | null {
  for (const { simbolo, codigos } of SIMBOLOS) {
    for (const variante of admitePunto(simbolo) ? [`${simbolo}.`, simbolo] : [simbolo]) {
      if (!texto.endsWith(variante)) continue;
      const inicio = texto.length - variante.length;
      // «SOL» no acaba en el símbolo «L»: la letra de antes lo delata
      if (esLetra(variante[0]) && esLetra(texto[inicio - 1])) continue;
      const espacios = texto.slice(0, inicio).match(/\s*$/)?.[0] ?? '';
      return { consumido: espacios + variante, texto: variante, codigos };
    }
  }
  const palabra = texto.match(/\s*(\p{L}+)$/u);
  if (palabra) {
    const porNombre = NOMBRES.get(sinTildes(palabra[1]));
    if (porNombre) return { consumido: palabra[0], texto: palabra[1], codigos: porNombre };
    if (palabra[1].length === 3 && CODIGOS_ISO.has(palabra[1].toUpperCase())) {
      return { consumido: palabra[0], texto: palabra[1], codigos: [palabra[1].toUpperCase()] };
    }
  }
  return null;
}

/**
 * Separa la cifra de la moneda escrita junto a ella. Sin marca, la cifra es la entrada tal
 * cual, de modo que todo lo que ya se leía se sigue leyendo exactamente igual.
 */
export function separarMarcaMoneda(entrada: string): EntradaConMarca {
  let cuerpo = entrada.trim();
  let signo = '';
  let antes = '';
  let despues = '';
  const piezas: Pieza[] = [];

  // El signo puede ir delante del símbolo («-$1.500»): pasa a la cifra
  const conSigno = cuerpo.match(/^([+-])\s*/);
  const delante = leerDelante(conSigno ? cuerpo.slice(conSigno[0].length) : cuerpo);
  if (delante) {
    if (conSigno) {
      signo = conSigno[1];
      cuerpo = cuerpo.slice(conSigno[0].length);
    }
    antes = delante.consumido;
    cuerpo = cuerpo.slice(delante.consumido.length);
    piezas.push(delante);
  }

  // «M.N.» (moneda nacional) cierra el importe, pero no dice cuál es la moneda
  const monedaNacional = cuerpo.match(/(?:^|[^\p{L}])(\s*M\.?\s?N\.?)$/iu);
  if (monedaNacional) {
    despues = monedaNacional[1];
    cuerpo = cuerpo.slice(0, cuerpo.length - monedaNacional[1].length);
  }
  const detras = leerDetras(cuerpo);
  if (detras) {
    despues = detras.consumido + despues;
    cuerpo = cuerpo.slice(0, cuerpo.length - detras.consumido.length);
    piezas.push(detras);
  }

  if (piezas.length === 0 && !monedaNacional) {
    return { cifra: entrada, marca: null, antes: '', despues: '' };
  }

  const marca: MarcaMoneda | null =
    piezas.length === 0
      ? null
      : {
          textos: piezas.map((p) => p.texto),
          codigos: piezas.reduce<string[]>(
            (comunes, p) => comunes.filter((c) => p.codigos.includes(c)),
            piezas[0].codigos,
          ),
        };

  return { cifra: `${signo}${cuerpo.trim()}`, marca, antes, despues };
}

/** «el peso y el dólar», «la libra»: las monedas de unos códigos, sin repetir nombre */
export function nombrarMonedas(codigos: string[], conjuncion: 'y' | 'o' = 'y'): string {
  const nombres: string[] = [];
  for (const m of MONEDAS) {
    if (!codigos.includes(m.codigo)) continue;
    const nombre = `${m.genero === 'femenino' ? 'la' : 'el'} ${m.singular}`;
    if (!nombres.includes(nombre)) nombres.push(nombre);
  }
  if (nombres.length <= 1) return nombres[0] ?? '';
  return `${nombres.slice(0, -1).join(', ')} ${conjuncion} ${nombres[nombres.length - 1]}`;
}
