/**
 * Motor de la vista de conversor-numeros-letras: lo que se decide a partir de las cifras TAL
 * COMO SE TECLEARON, que el número ya convertido no recuerda. Sin React ni DOM; los numerales
 * los pone `lib/numeroALetras.ts`.
 *
 * ── 1. El importe se redondea sobre el decimal tecleado (hallazgo 1708, 25/09/2026) ──────────
 * `cantidadALetras()` redondea con `Math.round(|v| × 100)`, y en coma flotante 0,145 × 100 =
 * 14,4999…: escribía «catorce céntimos» mientras la etiqueta y el aviso de redondeo decían
 * 0,15. Pasaba en 4.588 de los 100.000 medios céntimos entre 0,005 y 999,995. Aquí el
 * redondeo al céntimo se hace sobre las CIFRAS (la tercera decimal decide, al alza en el medio
 * céntimo, como la etiqueta), y al motor le llega un valor que ya es un número de céntimos
 * exacto, que su `Math.round` no puede mover.
 *
 * ── 2. La forma escrita de un decimal (hallazgo 1707, 25/09/2026) ───────────────────────────
 * DPD, s. v. «números», §3.4 (https://www.rae.es/dpd/números, consultado el 25/09/2026):
 *   «Para expresar con palabras los números decimales, debe mencionarse primero la parte
 *   entera y después la decimal, unidas ambas por la conjunción y o por la preposición con:
 *   20,58 o 20.58 = veinte (unidades o enteros) con cincuenta y ocho (centésimas) […]. Si la
 *   parte entera es cero, se suele expresar únicamente la parte decimal: 0,675 o 0.675 =
 *   seiscientas setenta y cinco milésimas […]. En la lengua oral, es también frecuente leer
 *   simplemente la secuencia de signos de que se componen, incluyendo el separador: 7,08 o
 *   7.08 = siete coma cero ocho […]. Este recurso, plenamente admisible en el registro oral,
 *   no es apropiado en documentos de carácter técnico, administrativo o contable.»
 * La app se ofrece «para cheques, pagarés, contratos y facturas», así que la forma escrita va
 * primero y la de «coma» queda como lectura en voz alta. El número de cifras tecleadas decide
 * la fracción (0,50 son cincuenta centésimas; 0,5, cinco décimas), igual que la etiqueta.
 * La fracción es femenina y el numeral concuerda con ella: «una centésima», «veintiuna
 * milésimas», «seiscientas setenta y cinco milésimas» (el ejemplo del DPD).
 *
 * Los nombres de las fracciones, del DLE (consultado el 25/09/2026): décimo, centésimo,
 * milésimo, diezmilésimo, cienmilésimo, millonésimo, diezmillonésimo, cienmillonésimo,
 * milmillonésimo, diezmilmillonésimo, cienmilmillonésimo y billonésimo. Con más de doce
 * cifras decimales no hay forma escrita: la parte decimal ya no cabe en el tope del motor.
 */
import type { PartesNumericas } from '@/lib';
import { enteroALetras, numeroALetras } from '@/lib/numeroALetras';

/** Fracción por número de cifras decimales, en singular (se añade -s en plural). */
const FRACCIONES = [
  '',
  'décima',
  'centésima',
  'milésima',
  'diezmilésima',
  'cienmilésima',
  'millonésima',
  'diezmillonésima',
  'cienmillonésima',
  'milmillonésima',
  'diezmilmillonésima',
  'cienmilmillonésima',
  'billonésima',
];

export const MAX_DECIMALES_ESCRITOS = FRACCIONES.length - 1;

/**
 * El importe redondeado al céntimo a partir de las cifras tecleadas, al alza en el medio
 * céntimo: 0,145 → 0,15 · 1,0050 → 1,01 · 0,004 → 0. Devuelve un valor cuyo producto por 100
 * es un entero exacto a efectos de `Math.round`.
 */
export function importeRedondeado(partes: PartesNumericas): number {
  const entera = Number(partes.entera || '0');
  const dosCifras = Number(partes.decimales.slice(0, 2).padEnd(2, '0'));
  const alAlza = Number(partes.decimales.charAt(2) || '0') >= 5 ? 1 : 0;
  const centimos = entera * 100 + dosCifras + alAlza;
  // 0 × -1 = -0, y el -0 no lleva signo ni en la etiqueta (formatNumber) ni en el texto
  return (partes.signo * centimos) / 100;
}

/**
 * Forma escrita del DPD §3.4: «tres con cuarenta y cinco centésimas», «cinco décimas».
 * Sin decimales, o con todos a cero, solo la parte entera. `null` si hay más cifras decimales
 * de las que tienen nombre (quien llama cae a la lectura cifra a cifra).
 */
export function decimalEscrito(partes: PartesNumericas): string | null {
  const { decimales } = partes;
  if (decimales.length > MAX_DECIMALES_ESCRITOS) return null;

  const entera = Number(partes.entera || '0');
  const menos = partes.signo < 0 ? 'menos ' : '';
  const enteraTexto = enteroALetras(entera);
  const fraccion = Number(decimales || '0');
  if (fraccion === 0) return entera === 0 ? 'cero' : `${menos}${enteraTexto}`;

  const numeral = enteroALetras(fraccion, { genero: 'femenino', apocope: true });
  const nombre = `${FRACCIONES[decimales.length]}${fraccion === 1 ? '' : 's'}`;
  // «Un millón DE diezmillonésimas», como «un millón de euros» (DPD, s. v. «millón»)
  const decimal = `${numeral} ${/mill(ón|ones)$/.test(numeral) ? 'de ' : ''}${nombre}`;

  return entera === 0 ? `${menos}${decimal}` : `${menos}${enteraTexto} con ${decimal}`;
}

/**
 * Lecturas en voz alta con «coma» (registro oral, DPD §3.4). La de las cifras una a una
 * siempre; con tres cifras decimales o menos, también la que lee la parte decimal como número
 * tras los ceros iniciales («siete coma cero ocho», «tres coma cuarenta y cinco»). Sin
 * decimales no hay lectura oral distinta de la escrita.
 */
export function lecturasOrales(valor: number, partes: PartesNumericas): string[] {
  const { decimales } = partes;
  if (!decimales) return [];

  const cifraACifra = numeroALetras(valor, 'masculino', decimales);
  const lecturas: string[] = [];
  const ceros = decimales.match(/^0*/)?.[0].length ?? 0;
  const resto = decimales.slice(ceros);
  if (decimales.length <= 3 && resto.length > 1) {
    const menos = partes.signo < 0 ? 'menos ' : '';
    const entera = enteroALetras(Number(partes.entera || '0'));
    const tras = [...Array<string>(ceros).fill('cero'), enteroALetras(Number(resto))].join(' ');
    lecturas.push(`${menos}${entera} coma ${tras}`);
  }
  if (!lecturas.includes(cifraACifra)) lecturas.push(cifraACifra);
  return lecturas;
}
