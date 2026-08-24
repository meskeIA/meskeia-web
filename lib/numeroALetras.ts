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
  { codigo: 'HNL', singular: 'lempira', plural: 'lempiras', fraccionSingular: 'centavo', fraccionPlural: 'centavos', genero: 'femenino', zona: 'Honduras' },
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
 * Escribe un número suelto en letras, sin moneda. Los decimales se leen cifra a
 * cifra tras la palabra «coma», que es como se leen en español: 3,45 es «tres
 * coma cuatro cinco», no «tres coma cuarenta y cinco».
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
