/**
 * Casos para clase — la tarea asignable de `simulador-contabilidad-basica` (19/10/2026; una
 * clase de 29 alumnos de Colombia el 17/10/2026, el 41 % del tráfico de la app).
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la contabilidad está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM.
 *
 * ── LA ARITMÉTICA NO SE REPLICA ───────────────────────────────────────────────
 *
 * La respuesta de cada caso sale de `calcularMayor`, de `./motor.ts`, la MISMA función con que la
 * pestaña «Libro Mayor» pinta los totales y el saldo de cada cuenta. Cada caso guarda su
 * solución como asientos en el formato del formulario (importes en texto) y el motor la mayoriza.
 * El alumno hace lo mismo a mano o en el simulador: registra las operaciones y lee el mayor.
 *
 * ── EL CONVENIO: EL PLAN DE CUENTAS Y EL MÉTODO DE INVENTARIO ────────────────
 *
 * El nombre de las cuentas cambia con el plan contable de cada país (PGC, PUC, código agrupador…)
 * y el registro de las mercaderías, con el método: en el inventario permanente una venta también
 * da de baja la mercadería contra el costo de ventas; en el sistema administrativo o especulativo,
 * no. Las dos cosas son legítimas y dan mayores distintos. Se resuelve con la técnica de los
 * cuartiles (skill /casos-aula-meskeia): SOLO se pregunta por cuentas cuyo total y saldo coinciden
 * en todos esos convenios —Caja, Banco, Clientes, Proveedores, Ventas, Préstamos bancarios y
 * Capital— y por la suma del diario solo cuando ninguna operación vende mercaderías. Nunca se
 * pregunta qué cuenta va al Debe, ni por Mercaderías, Compras, Inventario o Gastos. Y no hay
 * impuestos en las operaciones: el IVA cambia de un país a otro.
 *
 * ── QUÉ SE PREGUNTA, Y POR QUÉ NO SOLO EL SALDO ───────────────────────────────
 *
 * El saldo solo no distingue al alumno que lo pone TODO al revés: le sale la misma cifra con la
 * naturaleza contraria. Por eso hay casos que piden el total del Debe o del Haber de una cuenta,
 * que sí lo delatan, y el corrector reconoce esos errores por su nombre.
 *
 * Los importes son exactos (enteros o con céntimos): la tolerancia es la de REDONDEO del motor del
 * corrector, que con una cifra exacta no da margen. En contabilidad 1.700 no es 1.699.
 *
 * Nada lanza excepciones: los datos imposibles devuelven `{ ok: false, error }` y un NaN.
 */

import { formatNumber } from '@/lib';
import {
  corregirNumero,
  dentroDeTolerancia,
  exigeRedondeo,
  redondearA,
  textoDesviacion,
  toleranciaDeRedondeo,
  type Magnitud,
} from '@/lib/calculadoras/correctorCasosAula';
import { calcularMayor, type Asiento } from './motor';

/* ─────────────────────────── Las operaciones ─────────────────────────── */

/**
 * Las operaciones de los casos, cada una con su asiento. Los nombres de las contrapartidas
 * (Mercaderías, Gastos de alquiler…) no importan para la respuesta: nunca se pregunta por ellas.
 */
export type TipoOperacion =
  | 'aporte-capital'
  | 'deposito-banco'
  | 'compra-contado'
  | 'compra-credito'
  | 'venta-credito'
  | 'venta-contado'
  | 'cobro-cliente'
  | 'pago-proveedor'
  | 'alquiler'
  | 'prestamo'
  | 'devolucion-prestamo';

export interface Operacion {
  tipo: TipoOperacion;
  importe: number;
}

/** Qué cuenta va al Debe y cuál al Haber en cada operación. */
const ASIENTO_DE: Record<TipoOperacion, { debe: string; haber: string }> = {
  'aporte-capital': { debe: 'Caja', haber: 'Capital' },
  'deposito-banco': { debe: 'Banco', haber: 'Caja' },
  'compra-contado': { debe: 'Mercaderías', haber: 'Caja' },
  'compra-credito': { debe: 'Mercaderías', haber: 'Proveedores' },
  'venta-credito': { debe: 'Clientes', haber: 'Ventas' },
  'venta-contado': { debe: 'Caja', haber: 'Ventas' },
  'cobro-cliente': { debe: 'Banco', haber: 'Clientes' },
  'pago-proveedor': { debe: 'Proveedores', haber: 'Banco' },
  alquiler: { debe: 'Gastos de alquiler', haber: 'Caja' },
  prestamo: { debe: 'Banco', haber: 'Préstamos bancarios' },
  'devolucion-prestamo': { debe: 'Préstamos bancarios', haber: 'Banco' },
};

/** Las cuentas por las que se puede preguntar (cabecera: no dependen del plan ni del inventario). */
export const CUENTAS_PREGUNTABLES = ['Caja', 'Banco', 'Clientes', 'Proveedores', 'Ventas', 'Préstamos bancarios', 'Capital'] as const;
export type CuentaPreguntable = (typeof CUENTAS_PREGUNTABLES)[number];

/** Las operaciones que tocan mercaderías: con ellas la suma del diario depende del método de inventario. */
const MUEVE_MERCADERIAS: readonly TipoOperacion[] = ['compra-contado', 'compra-credito', 'venta-credito', 'venta-contado'];

/** Importe en formato español: «8000», «10.000», «1234,56». */
export function importe(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return formatNumber(n, Number.isInteger(redondearA(n, 2)) ? 0 : 2);
}

/** Lo que lee el alumno: «El propietario aporta 8000 u.m. en efectivo como capital inicial.» */
export function describirOperacion(o: Operacion): string {
  const x = `${importe(o.importe)} u.m.`;
  switch (o.tipo) {
    case 'aporte-capital': return `El propietario aporta ${x} en efectivo como capital inicial.`;
    case 'deposito-banco': return `Deposita ${x} de la caja en la cuenta bancaria de la empresa.`;
    case 'compra-contado': return `Compra mercaderías por ${x} y las paga en efectivo.`;
    case 'compra-credito': return `Compra mercaderías por ${x} a crédito: las pagará más adelante al proveedor.`;
    case 'venta-credito': return `Vende mercaderías por ${x} a crédito a un cliente.`;
    case 'venta-contado': return `Vende mercaderías por ${x} y cobra en efectivo.`;
    case 'cobro-cliente': return `Un cliente le paga ${x} de lo que debía, por transferencia bancaria.`;
    case 'pago-proveedor': return `Paga ${x} a un proveedor por transferencia bancaria.`;
    case 'alquiler': return `Paga ${x} de alquiler del local en efectivo.`;
    case 'prestamo': return `Recibe un préstamo bancario de ${x}, que se ingresa en su cuenta del banco.`;
    case 'devolucion-prestamo': return `Devuelve ${x} del préstamo con cargo a su cuenta bancaria.`;
  }
}

/** Las operaciones como asientos del formulario del simulador, listos para `calcularMayor`. */
export function asientosDe(operaciones: readonly Operacion[]): Asiento[] {
  return operaciones.map((o, i) => {
    const { debe, haber } = ASIENTO_DE[o.tipo];
    const texto = String(o.importe).replace('.', ',');
    return {
      id: `caso-${i + 1}`,
      fecha: '',
      concepto: describirOperacion(o),
      lineas: [
        { id: `caso-${i + 1}-d`, cuenta: debe, descripcion: '', debe: texto, haber: '' },
        { id: `caso-${i + 1}-h`, cuenta: haber, descripcion: '', debe: '', haber: texto },
      ],
    };
  });
}

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta = 'saldo' | 'total-debe' | 'total-haber' | 'suma-diario';

export interface DatosCaso {
  operaciones: readonly Operacion[];
  pregunta: Pregunta;
  /** La cuenta por la que se pregunta. Obligatoria salvo en `suma-diario`. */
  cuenta?: CuentaPreguntable;
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  /** Deudora o acreedora: solo en `saldo`. */
  naturaleza?: 'deudora' | 'acreedora';
  pasos: string[];
  error?: string;
}

export const DECIMALES = 2;
export const UNIDAD = 'u.m.';

export function etiquetaDe(d: DatosCaso): string {
  switch (d.pregunta) {
    case 'saldo': return `Saldo de ${d.cuenta}, en u.m. (sin signo)`;
    case 'total-debe': return `Total del Debe de ${d.cuenta}, en u.m.`;
    case 'total-haber': return `Total del Haber de ${d.cuenta}, en u.m.`;
    case 'suma-diario': return 'Suma del Debe del libro diario, en u.m.';
  }
}

/** La respuesta con su unidad: «7900 u.m.», «445,26 u.m.». Espacio duro antes de la unidad. */
export function textoRespuesta(valor: number): string {
  if (!Number.isFinite(valor)) return '—';
  return `${importe(valor)} ${UNIDAD}`;
}

/** «8000 + 600 = 8600», o la cifra sola si hay un único movimiento, o «0» si no hay ninguno. */
function suma(importes: number[]): string {
  if (importes.length === 0) return '0';
  const total = importes.reduce((a, b) => a + b, 0);
  return importes.length === 1 ? importe(total) : `${importes.map(importe).join(' + ')} = ${importe(total)}`;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

/** Resuelve el caso desde sus operaciones, sin mirar la respuesta declarada. */
export function resolverCaso(d: DatosCaso): Resolucion {
  const fallo = (error: string): Resolucion => ({ ok: false, valor: NaN, pasos: [], error });
  if (d.operaciones.length === 0) return fallo('El caso no tiene operaciones.');
  if (d.operaciones.some((o) => !Number.isFinite(o.importe) || o.importe <= 0)) return fallo('Hay un importe que no es positivo.');
  if (d.pregunta !== 'suma-diario' && !d.cuenta) return fallo('Falta la cuenta por la que se pregunta.');

  const asientos = asientosDe(d.operaciones);
  const pasos = d.operaciones.map((o, i) => {
    const { debe, haber } = ASIENTO_DE[o.tipo];
    return `Asiento ${i + 1}: Debe ${debe} ${importe(o.importe)} · Haber ${haber} ${importe(o.importe)}.`;
  });

  if (d.pregunta === 'suma-diario') {
    const totalDebe = [...calcularMayor(asientos).values()].reduce((s, c) => s + c.totalDebe, 0);
    pasos.push(`Cada asiento lleva el mismo importe al Debe que al Haber, así que la suma del Debe es la misma que la del Haber: el diario cuadra.`);
    pasos.push(`Suma del Debe de todos los asientos: ${suma(d.operaciones.map((o) => o.importe))} ${UNIDAD}`);
    return { ok: true, valor: totalDebe, pasos };
  }

  const cuenta = calcularMayor(asientos).get(d.cuenta ?? '');
  if (!cuenta) return fallo(`Ninguna operación mueve la cuenta ${d.cuenta}.`);
  const enDebe = cuenta.movimientos.filter((m) => m.debe > 0).map((m) => m.debe);
  const enHaber = cuenta.movimientos.filter((m) => m.haber > 0).map((m) => m.haber);
  pasos.push(`Mayor de ${cuenta.nombre}: Debe ${suma(enDebe)} · Haber ${suma(enHaber)}.`);

  switch (d.pregunta) {
    case 'total-debe':
      pasos.push(`Total del Debe de ${cuenta.nombre}: ${textoRespuesta(cuenta.totalDebe)}`);
      return { ok: true, valor: cuenta.totalDebe, pasos };
    case 'total-haber':
      pasos.push(`Total del Haber de ${cuenta.nombre}: ${textoRespuesta(cuenta.totalHaber)}`);
      return { ok: true, valor: cuenta.totalHaber, pasos };
    case 'saldo': {
      const mayor = cuenta.naturaleza === 'deudora' ? 'el Debe' : 'el Haber';
      const resta = cuenta.naturaleza === 'deudora'
        ? `${importe(cuenta.totalDebe)} − ${importe(cuenta.totalHaber)}`
        : `${importe(cuenta.totalHaber)} − ${importe(cuenta.totalDebe)}`;
      pasos.push(`Saldo = ${resta} = ${textoRespuesta(cuenta.saldo)}, ${cuenta.naturaleza} porque pesa más ${mayor}.`);
      return { ok: true, valor: cuenta.saldo, naturaleza: cuenta.naturaleza, pasos };
    }
  }
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** Un importe: real, y positivo por el tema (el saldo va sin signo, como en el Libro Mayor). */
export function magnitudDe(): Magnitud {
  return 'real';
}

/** La de redondeo: con un importe exacto, sin margen (cabecera). */
export function toleranciaDe(d: DatosCaso): number {
  const r = resolverCaso(d);
  return Number.isFinite(r.valor) ? toleranciaDeRedondeo(r.valor, DECIMALES) : 0;
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** Los errores típicos del tema, con el valor que producen. Calculados con el motor. */
export function erroresTipicos(d: DatosCaso): { valor: number; motivo: string }[] {
  if (d.pregunta === 'suma-diario' || !d.cuenta) return [];
  const cuenta = calcularMayor(asientosDe(d.operaciones)).get(d.cuenta);
  if (!cuenta) return [];
  const errores: { valor: number; motivo: string }[] = [];
  if (d.pregunta === 'saldo') {
    errores.push({ valor: cuenta.totalDebe, motivo: `Eso es el total del Debe de ${cuenta.nombre}: el saldo es la diferencia entre el Debe y el Haber.` });
    errores.push({ valor: cuenta.totalHaber, motivo: `Eso es el total del Haber de ${cuenta.nombre}: el saldo es la diferencia entre el Debe y el Haber.` });
    errores.push({ valor: cuenta.totalDebe + cuenta.totalHaber, motivo: 'Has sumado el Debe y el Haber: el saldo es su DIFERENCIA.' });
  }
  if (d.pregunta === 'total-debe') {
    errores.push({ valor: cuenta.totalHaber, motivo: `Eso es lo que va al Haber de ${cuenta.nombre}. Repasa qué operaciones la aumentan y cuáles la disminuyen.` });
  }
  if (d.pregunta === 'total-haber') {
    errores.push({ valor: cuenta.totalDebe, motivo: `Eso es lo que va al Debe de ${cuenta.nombre}. Repasa qué operaciones la aumentan y cuáles la disminuyen.` });
  }
  return errores;
}

/** Corrige la respuesta del alumno. Nunca lanza. */
export function comprobarRespuesta(usuario: number, esperado: number, d: DatosCaso): Veredicto {
  const tolerancia = toleranciaDe(d);
  const c = corregirNumero(usuario, esperado, { tolerancia, magnitud: magnitudDe() });
  const { diferencia } = c;

  if (c.estado === 'no-numerico') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal, por ejemplo 445,26).', diferencia: NaN, tolerancia };
  }
  if (c.motivoImposible) return { correcto: false, motivo: c.motivoImposible, diferencia, tolerancia };
  if (c.estado === 'acierto') return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  if (usuario < 0 && dentroDeTolerancia(-usuario, esperado, tolerancia)) {
    return { correcto: false, motivo: 'La cifra es esa, pero el saldo se escribe sin signo: si es deudor o acreedor lo dice su naturaleza, no un menos.', diferencia, tolerancia };
  }
  if (usuario <= 0) {
    return { correcto: false, motivo: 'No es correcto: un total o un saldo se escriben como cifra positiva.', diferencia, tolerancia };
  }
  for (const e of erroresTipicos(d)) {
    if (!dentroDeTolerancia(e.valor, esperado, tolerancia) && dentroDeTolerancia(usuario, e.valor, toleranciaDeRedondeo(e.valor, DECIMALES))) {
      return { correcto: false, motivo: e.motivo, diferencia, tolerancia };
    }
  }
  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${textoDesviacion(diferencia, DECIMALES, formatNumber)} ${UNIDAD} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  /** Calculada por el motor desde `datos`. */
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** La pregunta final del enunciado, derivada de los datos (nunca escrita a mano). */
export function preguntaDe(d: DatosCaso): string {
  switch (d.pregunta) {
    case 'saldo': return `¿Cuál es el saldo de la cuenta ${d.cuenta}?`;
    case 'total-debe': return `¿Cuánto suma el Debe de la cuenta ${d.cuenta}?`;
    case 'total-haber': return `¿Cuánto suma el Haber de la cuenta ${d.cuenta}?`;
    case 'suma-diario': return '¿Cuánto suma el Debe de todo el libro diario?';
  }
}

/** «Una empresa realiza estas operaciones: 1) … 2) … ¿Cuál es el saldo de la cuenta Caja?» */
export function enunciadoDe(d: DatosCaso, entrada = 'Una empresa realiza estas operaciones'): string {
  const lista = d.operaciones.map((o, i) => `${i + 1}) ${describirOperacion(o)}`).join(' ');
  return `${entrada}: ${lista} ${preguntaDe(d)}`;
}

type DefinicionCaso = Pick<Caso, 'id' | 'titulo' | 'categoria' | 'datos' | 'pista'> & { entrada?: string };

const op = (tipo: TipoOperacion, importe: number): Operacion => ({ tipo, importe });

const DEFINICIONES: readonly DefinicionCaso[] = [
  {
    id: 1,
    titulo: 'Lo que entra en Caja',
    categoria: 'abstracto',
    datos: { operaciones: [op('aporte-capital', 8000), op('compra-contado', 1500), op('venta-contado', 600)], pregunta: 'total-debe', cuenta: 'Caja' },
    pista: 'Caja es una cuenta de activo: lo que entra en efectivo va al Debe.',
  },
  {
    id: 2,
    titulo: 'Lo que sale de Caja',
    categoria: 'abstracto',
    datos: { operaciones: [op('aporte-capital', 5000), op('alquiler', 700), op('compra-contado', 1200)], pregunta: 'total-haber', cuenta: 'Caja' },
    pista: 'Lo que sale en efectivo disminuye Caja, y una cuenta de activo disminuye por el Haber.',
  },
  {
    id: 3,
    titulo: 'El saldo de Caja',
    categoria: 'abstracto',
    datos: { operaciones: [op('aporte-capital', 10000), op('compra-contado', 2500), op('alquiler', 800), op('venta-contado', 1200)], pregunta: 'saldo', cuenta: 'Caja' },
    pista: 'Suma lo que entra (Debe) y lo que sale (Haber) y réstalos.',
  },
  {
    id: 4,
    titulo: 'El saldo del Banco',
    categoria: 'aplicado',
    entrada: 'Una tienda empieza a funcionar con estas operaciones',
    datos: { operaciones: [op('aporte-capital', 6000), op('deposito-banco', 4000), op('compra-credito', 2000), op('pago-proveedor', 1500)], pregunta: 'saldo', cuenta: 'Banco' },
    pista: 'Solo dos operaciones mueven el Banco: el depósito y el pago al proveedor.',
  },
  {
    id: 5,
    titulo: 'Lo que deben los clientes',
    categoria: 'aplicado',
    entrada: 'Un taller registra estas operaciones del mes',
    datos: { operaciones: [op('venta-credito', 3000), op('venta-credito', 1200), op('cobro-cliente', 2500)], pregunta: 'saldo', cuenta: 'Clientes' },
    pista: 'Las ventas a crédito aumentan Clientes (Debe); los cobros la disminuyen (Haber).',
  },
  {
    id: 6,
    titulo: 'Lo que se debe a los proveedores',
    categoria: 'aplicado',
    entrada: 'Una papelería registra estas operaciones',
    datos: {
      operaciones: [op('aporte-capital', 6000), op('deposito-banco', 5000), op('compra-credito', 4500), op('pago-proveedor', 3000), op('compra-credito', 800)],
      pregunta: 'saldo', cuenta: 'Proveedores',
    },
    pista: 'Proveedores es una deuda (pasivo): aumenta por el Haber y disminuye por el Debe.',
  },
  {
    id: 7,
    titulo: 'La suma del libro diario',
    categoria: 'abstracto',
    datos: { operaciones: [op('aporte-capital', 12000), op('deposito-banco', 7000), op('prestamo', 5000), op('alquiler', 900)], pregunta: 'suma-diario' },
    pista: 'Cada asiento lleva el mismo importe al Debe que al Haber: suma los importes de todos.',
  },
  {
    id: 8,
    titulo: 'El total de ventas',
    categoria: 'aplicado',
    entrada: 'Una panadería registra las ventas de la semana',
    datos: { operaciones: [op('venta-contado', 700), op('venta-credito', 1500), op('venta-contado', 300)], pregunta: 'saldo', cuenta: 'Ventas' },
    pista: 'Ventas es una cuenta de ingreso: se abona (Haber) con cada venta, al contado o a crédito.',
  },
  {
    id: 9,
    titulo: 'Lo que queda del préstamo',
    categoria: 'aplicado',
    entrada: 'Una empresa de transporte registra estas operaciones',
    datos: { operaciones: [op('prestamo', 20000), op('devolucion-prestamo', 2000), op('devolucion-prestamo', 2000)], pregunta: 'saldo', cuenta: 'Préstamos bancarios' },
    pista: 'El préstamo es una deuda: nace en el Haber y cada devolución lo reduce por el Debe.',
  },
  {
    id: 10,
    titulo: 'Caja después de un mes',
    categoria: 'aplicado',
    entrada: 'Un pequeño comercio registra estas operaciones de su primer mes',
    datos: {
      operaciones: [op('aporte-capital', 9000), op('deposito-banco', 5000), op('venta-contado', 750), op('alquiler', 600), op('compra-contado', 1350)],
      pregunta: 'saldo', cuenta: 'Caja',
    },
    pista: 'Ojo con el depósito en el banco: el dinero SALE de la caja.',
  },
  {
    id: 11,
    titulo: 'Importes con céntimos',
    categoria: 'aplicado',
    entrada: 'Un estudio de diseño registra estas operaciones',
    datos: {
      operaciones: [op('venta-credito', 1234.56), op('cobro-cliente', 1234.56), op('compra-credito', 789.3), op('pago-proveedor', 789.3)],
      pregunta: 'saldo', cuenta: 'Banco',
    },
    pista: 'El Banco solo se mueve con el cobro del cliente y el pago al proveedor.',
  },
  {
    id: 12,
    titulo: 'Lo que aún deben los clientes',
    categoria: 'aplicado',
    entrada: 'Una librería registra estas operaciones del trimestre',
    datos: {
      operaciones: [op('venta-credito', 2400), op('venta-credito', 1800), op('cobro-cliente', 1500), op('cobro-cliente', 2400)],
      pregunta: 'saldo', cuenta: 'Clientes',
    },
    pista: 'Suma lo vendido a crédito y resta lo cobrado.',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const valor = r.ok ? redondearA(r.valor, DECIMALES) : NaN;
  return {
    id: def.id,
    titulo: def.titulo,
    categoria: def.categoria,
    datos: def.datos,
    pista: def.pista,
    enunciado: enunciadoDe(def.datos, def.entrada),
    etiquetaRespuesta: etiquetaDe(def.datos),
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor),
    requiereRedondeo: r.ok ? exigeRedondeo(r.valor, DECIMALES) : false,
    pasos: r.ok ? r.pasos : [r.error ?? 'No se pudo resolver.'],
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32): sembrando directamente con 1, 2, 3… los
 * primeros valores salen parecidos y el «aleatorio» da siempre lo mismo (simulador-genetica,
 * 14/09/2026). Reproducible no es variado.
 */
function aleatorioCon(semilla: number): () => number {
  let estado = (semilla >>> 0) || 1;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 0x100000000;
  };
}

function elegir<T>(rnd: () => number, opciones: readonly T[]): T {
  return opciones[Math.min(opciones.length - 1, Math.floor(rnd() * opciones.length))];
}

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  requiereRedondeo: boolean;
  pasos: string[];
}

/** Importes redondos de 100 a 6.000, y alguno con céntimos para practicar los decimales. */
function importeAleatorio(rnd: () => number, maximo: number): number {
  const centenas = 1 + Math.floor(rnd() * Math.max(1, Math.floor(maximo / 100)));
  const base = Math.min(centenas * 100, maximo);
  // Con céntimos, entre base − 100 y base − 0,01: nunca por debajo de 100.
  return base >= 200 && rnd() < 0.2 ? redondearA(base - 100 + Math.floor(rnd() * 9999) / 100, 2) : base;
}

/** Qué hace falta para que una operación tenga sentido: no se cobra a quien no debe nada. */
function saldoDe(operaciones: readonly Operacion[], cuenta: string): number {
  const c = calcularMayor(asientosDe(operaciones)).get(cuenta);
  return c ? c.totalDebe - c.totalHaber : 0;
}

function intentar(rnd: () => number): DatosCaso | null {
  const operaciones: Operacion[] = [{ tipo: 'aporte-capital', importe: elegir(rnd, [3000, 5000, 6000, 8000, 10000, 12000]) }];
  const pasosExtra = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < pasosExtra; i++) {
    const tipo = elegir(rnd, ['deposito-banco', 'compra-contado', 'compra-credito', 'venta-credito', 'venta-contado', 'cobro-cliente', 'pago-proveedor', 'alquiler', 'prestamo', 'devolucion-prestamo'] as const);
    // El límite de lo que se puede sacar de cada cuenta: la caja y el banco no se quedan en
    // descubierto, ni se cobra o se paga más de lo pendiente.
    const limite: Partial<Record<TipoOperacion, number>> = {
      'deposito-banco': saldoDe(operaciones, 'Caja'),
      'compra-contado': saldoDe(operaciones, 'Caja'),
      alquiler: saldoDe(operaciones, 'Caja'),
      'cobro-cliente': saldoDe(operaciones, 'Clientes'),
      'pago-proveedor': Math.min(-saldoDe(operaciones, 'Proveedores'), saldoDe(operaciones, 'Banco')),
      'devolucion-prestamo': Math.min(-saldoDe(operaciones, 'Préstamos bancarios'), saldoDe(operaciones, 'Banco')),
    };
    const maximo = limite[tipo] ?? 6000;
    if (maximo < 100) continue;
    operaciones.push({ tipo, importe: importeAleatorio(rnd, Math.min(maximo, 6000)) });
  }
  if (operaciones.length < 3) return null;

  const movidas = CUENTAS_PREGUNTABLES.filter((c) => calcularMayor(asientosDe(operaciones)).has(c) && c !== 'Capital');
  const sinMercaderias = operaciones.every((o) => !MUEVE_MERCADERIAS.includes(o.tipo));
  const pregunta = elegir(rnd, sinMercaderias ? (['saldo', 'saldo', 'total-debe', 'total-haber', 'suma-diario'] as const) : (['saldo', 'saldo', 'total-debe', 'total-haber'] as const));
  if (pregunta === 'suma-diario') return { operaciones, pregunta };
  if (movidas.length === 0) return null;
  const datos: DatosCaso = { operaciones, pregunta, cuenta: elegir(rnd, movidas) };
  const r = resolverCaso(datos);
  // Un total o un saldo de 0 no es una pregunta: no hay nada que contar.
  return r.ok && r.valor > 0 ? datos : null;
}

/** Si en 200 intentos no sale nada válido (no pasa con estas listas), el caso 3. */
const RESERVA: DatosCaso = DEFINICIONES[2].datos;

/** Un ejercicio de práctica, con la MISMA resolución (`resolverCaso`) que los doce fijos. */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  let datos: DatosCaso | null = null;
  for (let i = 0; i < 200 && !datos; i++) datos = intentar(rnd);
  const elegidos = datos ?? RESERVA;
  const r = resolverCaso(elegidos);
  return {
    semilla,
    enunciado: enunciadoDe(elegidos),
    datos: elegidos,
    respuesta: r.ok ? redondearA(r.valor, DECIMALES) : NaN,
    etiquetaRespuesta: etiquetaDe(elegidos),
    requiereRedondeo: r.ok ? exigeRedondeo(r.valor, DECIMALES) : false,
    pasos: r.ok ? r.pasos : [r.error ?? 'No se pudo resolver.'],
  };
}
