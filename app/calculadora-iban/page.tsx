'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './CalculadoraIban.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  RegionBadge,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────

type ModoType = 'calcular' | 'validar' | 'bic';

interface Paso {
  numero: number;
  titulo: string;
  detalle: string;
  nota?: string;
}

interface ResultadoCalculo {
  ibanPlano: string;
  ibanFormateado: string;
  ccc: string;
  digitosControlIban: string;
  resto: number;
  pasos: Paso[];
  dcCalculados: string;
  dcCoinciden: boolean;
}

interface ResultadoValidacion {
  valido: boolean;
  motivo: string;
  detalle: string;
  ibanFormateado: string;
  pais: string;
  nombrePais: string;
  longitudEsperada: number | null;
  longitudReal: number;
  controlCorrecto: string | null;
  // Solo para IBAN españoles válidos
  entidad?: string;
  sucursal?: string;
  dcCcc?: string;
  cuenta?: string;
  nombreEntidad?: string | null;
  dcCccCoinciden?: boolean;
}

interface ResultadoBic {
  valido: boolean;
  motivo: string;
  codigo: string;
  banco: string;
  pais: string;
  nombrePais: string;
  localidad: string;
  oficina: string;
  esSedePrincipal: boolean;
  esPasivo: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// DATOS DE REFERENCIA
// ─────────────────────────────────────────────────────────────────────────

/**
 * Longitud total del IBAN por código de país (norma ISO 13616).
 * Incluye toda la zona SEPA y los países hispanohablantes que han
 * adoptado el IBAN (España, Guatemala, República Dominicana, Costa Rica,
 * El Salvador y Nicaragua). La mayoría de países de Latinoamérica NO usan
 * IBAN: allí se opera con número de cuenta local + BIC/SWIFT.
 */
const LONGITUD_IBAN: Record<string, { longitud: number; nombre: string }> = {
  AD: { longitud: 24, nombre: 'Andorra' },
  AE: { longitud: 23, nombre: 'Emiratos Árabes Unidos' },
  AL: { longitud: 28, nombre: 'Albania' },
  AT: { longitud: 20, nombre: 'Austria' },
  AZ: { longitud: 28, nombre: 'Azerbaiyán' },
  BA: { longitud: 20, nombre: 'Bosnia y Herzegovina' },
  BE: { longitud: 16, nombre: 'Bélgica' },
  BG: { longitud: 22, nombre: 'Bulgaria' },
  BH: { longitud: 22, nombre: 'Baréin' },
  BR: { longitud: 29, nombre: 'Brasil' },
  BY: { longitud: 28, nombre: 'Bielorrusia' },
  CH: { longitud: 21, nombre: 'Suiza' },
  CR: { longitud: 22, nombre: 'Costa Rica' },
  CY: { longitud: 28, nombre: 'Chipre' },
  CZ: { longitud: 24, nombre: 'Chequia' },
  DE: { longitud: 22, nombre: 'Alemania' },
  DK: { longitud: 18, nombre: 'Dinamarca' },
  DO: { longitud: 28, nombre: 'República Dominicana' },
  EE: { longitud: 20, nombre: 'Estonia' },
  EG: { longitud: 29, nombre: 'Egipto' },
  ES: { longitud: 24, nombre: 'España' },
  FI: { longitud: 18, nombre: 'Finlandia' },
  FO: { longitud: 18, nombre: 'Islas Feroe' },
  FR: { longitud: 27, nombre: 'Francia' },
  GB: { longitud: 22, nombre: 'Reino Unido' },
  GE: { longitud: 22, nombre: 'Georgia' },
  GI: { longitud: 23, nombre: 'Gibraltar' },
  GL: { longitud: 18, nombre: 'Groenlandia' },
  GR: { longitud: 27, nombre: 'Grecia' },
  GT: { longitud: 28, nombre: 'Guatemala' },
  HR: { longitud: 21, nombre: 'Croacia' },
  HU: { longitud: 28, nombre: 'Hungría' },
  IE: { longitud: 22, nombre: 'Irlanda' },
  IL: { longitud: 23, nombre: 'Israel' },
  IS: { longitud: 26, nombre: 'Islandia' },
  IT: { longitud: 27, nombre: 'Italia' },
  JO: { longitud: 30, nombre: 'Jordania' },
  KW: { longitud: 30, nombre: 'Kuwait' },
  KZ: { longitud: 20, nombre: 'Kazajistán' },
  LB: { longitud: 28, nombre: 'Líbano' },
  LC: { longitud: 32, nombre: 'Santa Lucía' },
  LI: { longitud: 21, nombre: 'Liechtenstein' },
  LT: { longitud: 20, nombre: 'Lituania' },
  LU: { longitud: 20, nombre: 'Luxemburgo' },
  LV: { longitud: 21, nombre: 'Letonia' },
  MC: { longitud: 27, nombre: 'Mónaco' },
  MD: { longitud: 24, nombre: 'Moldavia' },
  ME: { longitud: 22, nombre: 'Montenegro' },
  MK: { longitud: 19, nombre: 'Macedonia del Norte' },
  MR: { longitud: 27, nombre: 'Mauritania' },
  MT: { longitud: 31, nombre: 'Malta' },
  MU: { longitud: 30, nombre: 'Mauricio' },
  NI: { longitud: 28, nombre: 'Nicaragua' },
  NL: { longitud: 18, nombre: 'Países Bajos' },
  NO: { longitud: 15, nombre: 'Noruega' },
  PK: { longitud: 24, nombre: 'Pakistán' },
  PL: { longitud: 28, nombre: 'Polonia' },
  PS: { longitud: 29, nombre: 'Palestina' },
  PT: { longitud: 25, nombre: 'Portugal' },
  QA: { longitud: 29, nombre: 'Catar' },
  RO: { longitud: 24, nombre: 'Rumanía' },
  RS: { longitud: 22, nombre: 'Serbia' },
  SA: { longitud: 24, nombre: 'Arabia Saudí' },
  SC: { longitud: 31, nombre: 'Seychelles' },
  SE: { longitud: 24, nombre: 'Suecia' },
  SI: { longitud: 19, nombre: 'Eslovenia' },
  SK: { longitud: 24, nombre: 'Eslovaquia' },
  SM: { longitud: 27, nombre: 'San Marino' },
  ST: { longitud: 25, nombre: 'Santo Tomé y Príncipe' },
  SV: { longitud: 28, nombre: 'El Salvador' },
  TL: { longitud: 23, nombre: 'Timor Oriental' },
  TN: { longitud: 24, nombre: 'Túnez' },
  TR: { longitud: 26, nombre: 'Turquía' },
  UA: { longitud: 29, nombre: 'Ucrania' },
  VA: { longitud: 22, nombre: 'Ciudad del Vaticano' },
  VG: { longitud: 24, nombre: 'Islas Vírgenes Británicas' },
  XK: { longitud: 20, nombre: 'Kosovo' },
};

/**
 * Códigos de entidad españoles más habituales.
 * Lista deliberadamente conservadora: solo se incluyen códigos contrastados.
 * Si un código no aparece aquí, la app lo dice en lugar de inventar un nombre.
 */
const ENTIDADES_ES: Record<string, string> = {
  '0019': 'Deutsche Bank, S.A.E.',
  '0049': 'Banco Santander',
  '0061': 'Banca March',
  '0073': 'Open Bank (Openbank, grupo Santander)',
  '0075': 'Banco Popular Español (integrado en Banco Santander)',
  '0081': 'Banco de Sabadell',
  '0083': 'Renta 4 Banco',
  '0128': 'Bankinter',
  '0182': 'BBVA',
  '0186': 'Banco Mediolanum',
  '0198': 'Banco Cooperativo Español',
  '0234': 'Banco Caminos',
  '0238': 'Banco Pichincha España',
  '0239': 'EVO Banco',
  '1465': 'ING Bank N.V., Sucursal en España',
  '1491': 'Triodos Bank',
  '2038': 'Bankia (integrada en CaixaBank)',
  '2048': 'Liberbank (integrado en Unicaja Banco)',
  '2080': 'Abanca',
  '2085': 'Ibercaja Banco',
  '2095': 'Kutxabank',
  '2100': 'CaixaBank',
  '2103': 'Unicaja Banco',
  '3035': 'Caja Laboral Popular (Laboral Kutxa)',
  '3058': 'Cajamar Caja Rural',
};

/** BIC de entidades españolas de uso frecuente (8 caracteres, sede principal). */
const BIC_ES: { entidad: string; nombre: string; bic: string }[] = [
  { entidad: '0049', nombre: 'Banco Santander', bic: 'BSCHESMM' },
  { entidad: '0182', nombre: 'BBVA', bic: 'BBVAESMM' },
  { entidad: '2100', nombre: 'CaixaBank', bic: 'CAIXESBB' },
  { entidad: '0081', nombre: 'Banco de Sabadell', bic: 'BSABESBB' },
  { entidad: '0128', nombre: 'Bankinter', bic: 'BKBKESMM' },
  { entidad: '2103', nombre: 'Unicaja Banco', bic: 'UCJAES2M' },
  { entidad: '2085', nombre: 'Ibercaja Banco', bic: 'CAZRES2Z' },
  { entidad: '2095', nombre: 'Kutxabank', bic: 'BASKES2B' },
  { entidad: '2080', nombre: 'Abanca', bic: 'CAGLESMM' },
  { entidad: '3058', nombre: 'Cajamar Caja Rural', bic: 'CCRIES2A' },
  { entidad: '3035', nombre: 'Laboral Kutxa', bic: 'CLPEES2M' },
  { entidad: '0198', nombre: 'Banco Cooperativo Español (cajas rurales)', bic: 'BCOEESMM' },
  { entidad: '1465', nombre: 'ING España', bic: 'INGDESMM' },
  { entidad: '0073', nombre: 'Openbank', bic: 'OPENESMM' },
  { entidad: '0019', nombre: 'Deutsche Bank España', bic: 'DEUTESBB' },
  { entidad: '1491', nombre: 'Triodos Bank España', bic: 'TRIOESMM' },
];

/** Nombres de país para el código ISO que aparece dentro de un BIC. */
const PAISES_BIC: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(LONGITUD_IBAN).map(([codigo, info]) => [codigo, info.nombre])
  ),
  US: 'Estados Unidos',
  MX: 'México',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Perú',
  UY: 'Uruguay',
  PY: 'Paraguay',
  EC: 'Ecuador',
  BO: 'Bolivia',
  VE: 'Venezuela',
  PA: 'Panamá',
  CU: 'Cuba',
  HN: 'Honduras',
  CA: 'Canadá',
  JP: 'Japón',
  CN: 'China',
  AU: 'Australia',
  IN: 'India',
  SG: 'Singapur',
  HK: 'Hong Kong',
  ZA: 'Sudáfrica',
  MA: 'Marruecos',
};

// Pesos oficiales del dígito de control del CCC español
const PESOS_CCC = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];

// ─────────────────────────────────────────────────────────────────────────
// FUNCIONES DE CÁLCULO (todas locales, sin ninguna llamada de red)
// ─────────────────────────────────────────────────────────────────────────

/** Deja solo los dígitos de una cadena. */
function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

/** Normaliza un IBAN: mayúsculas y sin espacios ni guiones. */
function normalizarIban(texto: string): string {
  return texto.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Resto módulo 97 de un número arbitrariamente largo expresado como cadena
 * de dígitos. Se calcula dígito a dígito porque un `Number` desborda mucho
 * antes de los 26 dígitos que genera un IBAN español.
 */
function modulo97(digitos: string): number {
  let resto = 0;
  for (const caracter of digitos) {
    resto = (resto * 10 + Number(caracter)) % 97;
  }
  return resto;
}

/** Sustituye cada letra por su posición en el alfabeto más 9 (A=10 … Z=35). */
function letrasANumeros(texto: string): string {
  let salida = '';
  for (const caracter of texto) {
    if (caracter >= 'A' && caracter <= 'Z') {
      salida += String(caracter.charCodeAt(0) - 55);
    } else {
      salida += caracter;
    }
  }
  return salida;
}

/** Agrupa el IBAN en bloques de 4 caracteres, como se imprime oficialmente. */
function formatearIban(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Calcula los dos dígitos de control internos del CCC español.
 * El primero valida entidad + sucursal (rellenando con dos ceros por la
 * izquierda) y el segundo valida el número de cuenta.
 * Pesos 1-2-4-8-5-10-9-7-3-6 módulo 11, con las reglas 10 → 1 y 11 → 0.
 */
function calcularDigitosControlCcc(entidad: string, sucursal: string, cuenta: string): string {
  const calcular = (bloque: string): number => {
    let suma = 0;
    for (let i = 0; i < 10; i++) {
      suma += Number(bloque[i]) * PESOS_CCC[i];
    }
    let dc = 11 - (suma % 11);
    if (dc === 10) dc = 1;
    if (dc === 11) dc = 0;
    return dc;
  };

  const bloqueOficina = ('00' + entidad + sucursal).padEnd(10, '0').slice(0, 10);
  const bloqueCuenta = cuenta.padEnd(10, '0').slice(0, 10);
  return `${calcular(bloqueOficina)}${calcular(bloqueCuenta)}`;
}

/** Calcula los dígitos de control de un IBAN a partir del país y el BBAN. */
function calcularControlIban(pais: string, bban: string): { control: string; resto: number; cadena: string } {
  const reordenado = `${bban}${pais}00`;
  const cadena = letrasANumeros(reordenado);
  const resto = modulo97(cadena);
  const control = String(98 - resto).padStart(2, '0');
  return { control, resto, cadena };
}

// ─────────────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────────────

export default function CalculadoraIbanPage() {
  const [modo, setModo] = useState<ModoType>('calcular');

  // Modo 1 — Calcular IBAN
  const [entidad, setEntidad] = useState('');
  const [sucursal, setSucursal] = useState('');
  const [dcCcc, setDcCcc] = useState('');
  const [cuenta, setCuenta] = useState('');
  const [copiado, setCopiado] = useState('');

  // Modo 2 — Validar IBAN
  const [ibanInput, setIbanInput] = useState('');

  // Modo 3 — BIC / SWIFT
  const [bicInput, setBicInput] = useState('');

  // ── Reparto automático al pegar los 20 dígitos del CCC ────────────────
  const repartirCcc = useCallback((digitos: string) => {
    setEntidad(digitos.slice(0, 4));
    setSucursal(digitos.slice(4, 8));
    setDcCcc(digitos.slice(8, 10));
    setCuenta(digitos.slice(10, 20));
  }, []);

  const cambiarCampo = useCallback(
    (campo: 'entidad' | 'sucursal' | 'dc' | 'cuenta', valor: string, maximo: number) => {
      const digitos = soloDigitos(valor);
      // Si el usuario pega el CCC completo en cualquier casilla, lo repartimos
      if (digitos.length >= 20) {
        repartirCcc(digitos.slice(0, 20));
        return;
      }
      const recortado = digitos.slice(0, maximo);
      if (campo === 'entidad') setEntidad(recortado);
      else if (campo === 'sucursal') setSucursal(recortado);
      else if (campo === 'dc') setDcCcc(recortado);
      else setCuenta(recortado);
    },
    [repartirCcc]
  );

  const limpiarCalculo = () => {
    setEntidad('');
    setSucursal('');
    setDcCcc('');
    setCuenta('');
  };

  const copiar = async (texto: string, clave: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      window.setTimeout(() => setCopiado(''), 2000);
    } catch {
      setCopiado('error');
      window.setTimeout(() => setCopiado(''), 2000);
    }
  };

  // ── Cálculo del IBAN ──────────────────────────────────────────────────
  const resultado: ResultadoCalculo | null = useMemo(() => {
    if (entidad.length !== 4 || sucursal.length !== 4 || dcCcc.length !== 2 || cuenta.length !== 10) {
      return null;
    }

    const ccc = `${entidad}${sucursal}${dcCcc}${cuenta}`;
    const { control, resto, cadena } = calcularControlIban('ES', ccc);
    const ibanPlano = `ES${control}${ccc}`;
    const dcCalculados = calcularDigitosControlCcc(entidad, sucursal, cuenta);

    const pasos: Paso[] = [
      {
        numero: 1,
        titulo: 'Partimos del CCC de 20 dígitos',
        detalle: `${entidad} ${sucursal} ${dcCcc} ${cuenta}`,
        nota: 'Entidad (4) + sucursal (4) + dígitos de control (2) + número de cuenta (10).',
      },
      {
        numero: 2,
        titulo: 'Movemos el país al final y ponemos 00 en el control',
        detalle: `${ccc}ES00`,
        nota: 'La norma ISO 13616 exige reordenar: primero el número de cuenta, después el código de país y dos ceros provisionales.',
      },
      {
        numero: 3,
        titulo: 'Sustituimos las letras por números (A=10 … Z=35)',
        detalle: cadena,
        nota: 'E es la quinta letra: 5 + 9 = 14. S es la decimonovena: 19 + 9 = 28. Por eso ES se convierte en 1428.',
      },
      {
        numero: 4,
        titulo: 'Calculamos el resto de dividir entre 97',
        detalle: `${cadena} mód 97 = ${resto}`,
        nota: 'Ese número tiene 26 cifras y desborda la precisión de un número normal, así que se divide por bloques, cifra a cifra.',
      },
      {
        numero: 5,
        titulo: 'Los dígitos de control son 98 menos el resto',
        detalle: `98 − ${resto} = ${98 - resto} → ES${control}`,
        nota: 'Siempre se escriben con dos cifras: si el resultado fuera 7, se escribiría 07.',
      },
    ];

    return {
      ibanPlano,
      ibanFormateado: formatearIban(ibanPlano),
      ccc,
      digitosControlIban: control,
      resto,
      pasos,
      dcCalculados,
      dcCoinciden: dcCalculados === dcCcc,
    };
  }, [entidad, sucursal, dcCcc, cuenta]);

  // ── Validación del IBAN ───────────────────────────────────────────────
  const validacion: ResultadoValidacion | null = useMemo(() => {
    const iban = normalizarIban(ibanInput);
    if (iban.length < 4) return null;

    const pais = iban.slice(0, 2);
    const info = LONGITUD_IBAN[pais];
    const base: ResultadoValidacion = {
      valido: false,
      motivo: '',
      detalle: '',
      ibanFormateado: formatearIban(iban),
      pais,
      nombrePais: info ? info.nombre : 'país no reconocido',
      longitudEsperada: info ? info.longitud : null,
      longitudReal: iban.length,
      controlCorrecto: null,
    };

    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) {
      return {
        ...base,
        motivo: 'Formato incorrecto',
        detalle:
          'Un IBAN empieza siempre por dos letras (el país), seguidas de dos dígitos de control y del número de cuenta local. Revisa que no se haya colado ninguna letra en las posiciones 3 y 4.',
      };
    }

    if (!info) {
      return {
        ...base,
        motivo: `Código de país «${pais}» desconocido`,
        detalle:
          'Ese prefijo no corresponde a ningún país que haya adoptado el IBAN, o bien está mal escrito. Recuerda que buena parte de Latinoamérica (México, Argentina, Chile, Colombia, Perú…) no usa IBAN: allí se transfiere con el número de cuenta local y el BIC/SWIFT.',
      };
    }

    if (iban.length !== info.longitud) {
      return {
        ...base,
        motivo: 'Longitud incorrecta',
        detalle: `Un IBAN de ${info.nombre} tiene exactamente ${info.longitud} caracteres y el introducido tiene ${iban.length}. ${
          iban.length < info.longitud
            ? `Faltan ${info.longitud - iban.length}: es muy habitual perder ceros por la izquierda al copiar desde una hoja de cálculo.`
            : `Sobran ${iban.length - info.longitud}: comprueba que no se haya duplicado ningún bloque al pegar.`
        }`,
      };
    }

    const bban = iban.slice(4);
    const { control } = calcularControlIban(pais, bban);
    const restoValidacion = modulo97(letrasANumeros(`${bban}${iban.slice(0, 4)}`));

    if (restoValidacion !== 1) {
      return {
        ...base,
        motivo: 'Los dígitos de control no cuadran',
        detalle: `Al aplicar el módulo 97 el resto debería ser 1 y sale ${restoValidacion}. Con el resto del número tal cual está, los dígitos de control correctos serían ${control} (el IBAN empieza por ${iban.slice(
          0,
          4
        )}). Ojo: eso no significa que el IBAN correcto sea ${pais}${control}…, solo que hay al menos un carácter equivocado en alguna parte.`,
        controlCorrecto: control,
      };
    }

    const resultadoValido: ResultadoValidacion = {
      ...base,
      valido: true,
      motivo: 'IBAN matemáticamente válido',
      detalle: `Tiene los ${info.longitud} caracteres que le corresponden a ${info.nombre} y el módulo 97 da 1. Esto confirma que el número está bien transcrito, no que la cuenta exista.`,
    };

    if (pais === 'ES') {
      const codigoEntidad = iban.slice(4, 8);
      const codigoSucursal = iban.slice(8, 12);
      const dcInterno = iban.slice(12, 14);
      const numeroCuenta = iban.slice(14, 24);
      const dcEsperados = calcularDigitosControlCcc(codigoEntidad, codigoSucursal, numeroCuenta);
      return {
        ...resultadoValido,
        entidad: codigoEntidad,
        sucursal: codigoSucursal,
        dcCcc: dcInterno,
        cuenta: numeroCuenta,
        nombreEntidad: ENTIDADES_ES[codigoEntidad] ?? null,
        dcCccCoinciden: dcEsperados === dcInterno,
      };
    }

    return resultadoValido;
  }, [ibanInput]);

  // ── Análisis del BIC ──────────────────────────────────────────────────
  const analisisBic: ResultadoBic | null = useMemo(() => {
    const codigo = bicInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (codigo.length < 4) return null;

    const base: ResultadoBic = {
      valido: false,
      motivo: '',
      codigo,
      banco: '',
      pais: '',
      nombrePais: '',
      localidad: '',
      oficina: '',
      esSedePrincipal: false,
      esPasivo: false,
    };

    if (codigo.length !== 8 && codigo.length !== 11) {
      return {
        ...base,
        motivo: `Un BIC tiene 8 u 11 caracteres, y este tiene ${codigo.length}. Los 8 primeros identifican banco, país y localidad; los 3 últimos, opcionales, señalan la oficina concreta.`,
      };
    }

    if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(codigo)) {
      return {
        ...base,
        motivo:
          'El formato no encaja: los 4 primeros caracteres deben ser letras (código de banco) y los 2 siguientes también (código de país ISO). Los últimos bloques admiten letras y números.',
      };
    }

    const pais = codigo.slice(4, 6);
    return {
      ...base,
      valido: true,
      motivo: 'Formato de BIC correcto',
      banco: codigo.slice(0, 4),
      pais,
      nombrePais: PAISES_BIC[pais] ?? 'país no reconocido en nuestra tabla',
      localidad: codigo.slice(6, 8),
      oficina: codigo.length === 11 ? codigo.slice(8, 11) : 'XXX (sede principal)',
      esSedePrincipal: codigo.length === 8 || codigo.slice(8, 11) === 'XXX',
      esPasivo: codigo[7] === '1',
    };
  }, [bicInput]);

  const relacionadas = getRelatedApps('calculadora-iban');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🏦</span> Calcular IBAN: calculadora y validador de IBAN
        </h1>
        <p className={styles.subtitle}>
          Convierte tu cuenta bancaria en IBAN, valida cualquier IBAN con el módulo 97 y entiende
          qué es (y qué no es) un código BIC/SWIFT.
        </p>
      </header>

      <LegalNotice />

      {/* es-data, no es-only: el módulo 97 es un estándar ISO universal y la
          validación funciona con cualquier país. Lo específico de España son los
          datos de referencia (códigos de entidad, BIC) y el cálculo desde el CCC.
          Además, es-only inyectaría un enlace a Delegum que aquí no viene a cuento:
          esto no es una herramienta fiscal. */}
      <RegionBadge
        variant="es-data"
        text="Datos de referencia: España (códigos de entidad y BIC). El cálculo del IBAN desde el CCC aplica a España; la validación de IBAN y BIC funciona para cualquier país."
      />

      {/* ── Herramienta ─────────────────────────────────────────────── */}
      <div className={styles.mainContent}>
        <div className={styles.tabList} role="tablist" aria-label="Modo de la calculadora de IBAN">
          <button
            type="button"
            role="tab"
            id="tab-calcular"
            aria-selected={modo === 'calcular'}
            aria-controls="panel-calcular"
            className={`${styles.tabBtn} ${modo === 'calcular' ? styles.tabActive : ''}`}
            onClick={() => setModo('calcular')}
          >
            <span aria-hidden="true">🧮</span> Calcular IBAN
          </button>
          <button
            type="button"
            role="tab"
            id="tab-validar"
            aria-selected={modo === 'validar'}
            aria-controls="panel-validar"
            className={`${styles.tabBtn} ${modo === 'validar' ? styles.tabActive : ''}`}
            onClick={() => setModo('validar')}
          >
            <span aria-hidden="true">✔️</span> Validar IBAN
          </button>
          <button
            type="button"
            role="tab"
            id="tab-bic"
            aria-selected={modo === 'bic'}
            aria-controls="panel-bic"
            className={`${styles.tabBtn} ${modo === 'bic' ? styles.tabActive : ''}`}
            onClick={() => setModo('bic')}
          >
            <span aria-hidden="true">🌍</span> BIC / SWIFT
          </button>
        </div>

        {/* ── MODO 1: CALCULAR ──────────────────────────────────────── */}
        {modo === 'calcular' && (
          <section id="panel-calcular" role="tabpanel" aria-labelledby="tab-calcular">
            <p className={styles.instrucciones}>
              Introduce los cuatro bloques de tu cuenta bancaria española. También puedes pegar los
              20 dígitos seguidos en cualquier casilla y se repartirán solos.
            </p>

            <div className={styles.cccGrid}>
              <div className={styles.campo}>
                <label className={styles.label} htmlFor="campo-entidad">
                  Entidad
                </label>
                <input
                  id="campo-entidad"
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="2100"
                  value={entidad}
                  onChange={(e) => cambiarCampo('entidad', e.target.value, 4)}
                  aria-describedby="ayuda-entidad"
                />
                <span id="ayuda-entidad" className={styles.ayuda}>
                  4 dígitos
                </span>
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="campo-sucursal">
                  Sucursal
                </label>
                <input
                  id="campo-sucursal"
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0418"
                  value={sucursal}
                  onChange={(e) => cambiarCampo('sucursal', e.target.value, 4)}
                  aria-describedby="ayuda-sucursal"
                />
                <span id="ayuda-sucursal" className={styles.ayuda}>
                  4 dígitos
                </span>
              </div>

              <div className={styles.campo}>
                <label className={styles.label} htmlFor="campo-dc">
                  D.C.
                </label>
                <input
                  id="campo-dc"
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="45"
                  value={dcCcc}
                  onChange={(e) => cambiarCampo('dc', e.target.value, 2)}
                  aria-describedby="ayuda-dc"
                />
                <span id="ayuda-dc" className={styles.ayuda}>
                  2 dígitos
                </span>
              </div>

              <div className={`${styles.campo} ${styles.campoAncho}`}>
                <label className={styles.label} htmlFor="campo-cuenta">
                  Número de cuenta
                </label>
                <input
                  id="campo-cuenta"
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0200051332"
                  value={cuenta}
                  onChange={(e) => cambiarCampo('cuenta', e.target.value, 10)}
                  aria-describedby="ayuda-cuenta"
                />
                <span id="ayuda-cuenta" className={styles.ayuda}>
                  10 dígitos
                </span>
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => repartirCcc('21000418450200051332')}
              >
                <span aria-hidden="true">📋</span> Cargar ejemplo
              </button>
              <button type="button" className={styles.btnSecondary} onClick={limpiarCalculo}>
                <span aria-hidden="true">🧹</span> Limpiar
              </button>
            </div>

            {!resultado && (
              <p className={styles.pendiente} role="status" aria-live="polite">
                Completa los 20 dígitos y el IBAN aparecerá automáticamente.
              </p>
            )}

            {resultado && (
              <div className={styles.resultSection}>
                <div className={styles.resultHeader}>
                  <h2 className={styles.resultTitulo}>Tu IBAN</h2>
                  <button
                    type="button"
                    className={styles.btnCopy}
                    onClick={() => copiar(resultado.ibanPlano, 'iban')}
                  >
                    {copiado === 'iban' ? '✅ Copiado' : '📋 Copiar IBAN'}
                  </button>
                </div>

                <p className={styles.ibanBox} role="status" aria-live="polite">
                  {resultado.ibanFormateado}
                </p>

                <div className={styles.ibanPlanoRow}>
                  <span className={styles.ibanPlanoLabel}>Sin espacios (para formularios):</span>
                  <code className={styles.ibanPlano}>{resultado.ibanPlano}</code>
                  <button
                    type="button"
                    className={styles.btnCopy}
                    onClick={() => copiar(resultado.ibanPlano, 'plano')}
                  >
                    {copiado === 'plano' ? '✅' : '📋'} Copiar
                  </button>
                </div>

                {!resultado.dcCoinciden && (
                  <div className={styles.avisoBox} role="alert">
                    <p>
                      <strong>
                        <span aria-hidden="true">⚠️</span> Los dígitos de control del CCC no cuadran.
                      </strong>{' '}
                      Has introducido <code>{dcCcc}</code>, pero para esa entidad, sucursal y número
                      de cuenta deberían ser <code>{resultado.dcCalculados}</code>. Casi siempre
                      significa que algún dígito de los otros bloques está mal copiado. El IBAN de
                      arriba está calculado con los datos tal y como los has escrito.
                    </p>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={() => setDcCcc(resultado.dcCalculados)}
                    >
                      Usar los dígitos de control correctos ({resultado.dcCalculados})
                    </button>
                  </div>
                )}

                {resultado.dcCoinciden && (
                  <p className={styles.okBox}>
                    <span aria-hidden="true">✅</span> Los dos dígitos de control internos del CCC
                    también cuadran ({resultado.dcCalculados}): la cuenta es coherente consigo misma.
                  </p>
                )}

                <h3 className={styles.pasosTitulo}>Cómo se ha calculado, paso a paso</h3>
                <ol className={styles.pasosLista}>
                  {resultado.pasos.map((paso) => (
                    <li key={paso.numero} className={styles.paso}>
                      <span className={styles.pasoNumero} aria-hidden="true">
                        {paso.numero}
                      </span>
                      <div className={styles.pasoContenido}>
                        <h4>{paso.titulo}</h4>
                        <code className={styles.pasoDetalle}>{paso.detalle}</code>
                        {paso.nota && <p className={styles.pasoNota}>{paso.nota}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        )}

        {/* ── MODO 2: VALIDAR ───────────────────────────────────────── */}
        {modo === 'validar' && (
          <section id="panel-validar" role="tabpanel" aria-labelledby="tab-validar">
            <p className={styles.instrucciones}>
              Pega un IBAN de cualquier país. Se comprueba la longitud que le corresponde y el
              módulo 97, sin salir de tu navegador.
            </p>

            <label className={styles.label} htmlFor="campo-iban">
              IBAN a validar
            </label>
            <input
              id="campo-iban"
              className={styles.inputGrande}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="ES91 2100 0418 4502 0005 1332"
              value={ibanInput}
              onChange={(e) => setIbanInput(e.target.value)}
            />

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setIbanInput('ES91 2100 0418 4502 0005 1332')}
              >
                <span aria-hidden="true">📋</span> Ejemplo válido
              </button>
              <button type="button" className={styles.btnSecondary} onClick={() => setIbanInput('')}>
                <span aria-hidden="true">🧹</span> Limpiar
              </button>
            </div>

            {validacion && (
              <div
                className={`${styles.validacionBox} ${
                  validacion.valido ? styles.validacionOk : styles.validacionError
                }`}
                role="status"
                aria-live="polite"
              >
                <p className={styles.validacionTitulo}>
                  <span aria-hidden="true">{validacion.valido ? '✅' : '❌'}</span>{' '}
                  {validacion.motivo}
                </p>
                <p className={styles.validacionDetalle}>{validacion.detalle}</p>

                <ul className={styles.validacionDatos}>
                  <li>
                    <strong>País:</strong> {validacion.pais} — {validacion.nombrePais}
                  </li>
                  <li>
                    <strong>Longitud:</strong> {validacion.longitudReal} caracteres
                    {validacion.longitudEsperada
                      ? ` (esperada: ${validacion.longitudEsperada})`
                      : ''}
                  </li>
                  <li>
                    <strong>Formato agrupado:</strong> {validacion.ibanFormateado}
                  </li>
                </ul>

                {validacion.valido && validacion.pais === 'ES' && (
                  <div className={styles.desgloseEs}>
                    <h3>Desglose de la cuenta española</h3>
                    <table className={styles.desgloseTabla}>
                      <tbody>
                        <tr>
                          <td>Entidad</td>
                          <td>
                            <code>{validacion.entidad}</code>
                          </td>
                          <td>
                            {validacion.nombreEntidad ?? (
                              <em>
                                No tenemos este código en nuestra tabla de entidades. Preferimos
                                decirlo a inventar un nombre: consúltalo en el registro de entidades
                                del Banco de España.
                              </em>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Sucursal</td>
                          <td>
                            <code>{validacion.sucursal}</code>
                          </td>
                          <td>Oficina donde se abrió la cuenta (muchas ya no existen físicamente).</td>
                        </tr>
                        <tr>
                          <td>D.C. del CCC</td>
                          <td>
                            <code>{validacion.dcCcc}</code>
                          </td>
                          <td>
                            {validacion.dcCccCoinciden
                              ? 'Coherente con el resto de la cuenta.'
                              : 'No cuadra con el algoritmo de peso módulo 11: revisa el número.'}
                          </td>
                        </tr>
                        <tr>
                          <td>Número de cuenta</td>
                          <td>
                            <code>{validacion.cuenta}</code>
                          </td>
                          <td>Identifica la cuenta dentro de la oficina.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── MODO 3: BIC / SWIFT ───────────────────────────────────── */}
        {modo === 'bic' && (
          <section id="panel-bic" role="tabpanel" aria-labelledby="tab-bic">
            <div className={styles.honestidadBox}>
              <h2>
                <span aria-hidden="true">🚫</span> El BIC no se puede calcular a partir del IBAN
              </h2>
              <p>
                Es la búsqueda más frecuente sobre este tema y la respuesta honesta es que{' '}
                <strong>no existe ninguna fórmula</strong>. El BIC (o SWIFT) es un identificador que
                la organización SWIFT asigna a cada entidad y oficina; no está codificado dentro del
                número de cuenta, así que ninguna calculadora puede deducirlo. Lo que sí se puede
                hacer es leer el código de entidad del IBAN español y buscar el BIC de esa entidad.
              </p>
              <p>
                <strong>Dónde encontrarlo de verdad:</strong> en tu app o banca electrónica (suele
                aparecer junto al IBAN), en cualquier extracto o certificado de titularidad, o
                preguntando directamente en tu oficina. Para cobros desde el extranjero, pide el dato
                al banco antes de darlo por bueno.
              </p>
            </div>

            <label className={styles.label} htmlFor="campo-bic">
              Comprobar el formato de un BIC/SWIFT
            </label>
            <input
              id="campo-bic"
              className={styles.inputGrande}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="CAIXESBBXXX"
              value={bicInput}
              onChange={(e) => setBicInput(e.target.value)}
            />

            {analisisBic && (
              <div
                className={`${styles.validacionBox} ${
                  analisisBic.valido ? styles.validacionOk : styles.validacionError
                }`}
                role="status"
                aria-live="polite"
              >
                <p className={styles.validacionTitulo}>
                  <span aria-hidden="true">{analisisBic.valido ? '✅' : '❌'}</span>{' '}
                  {analisisBic.motivo}
                </p>

                {analisisBic.valido && (
                  <ul className={styles.validacionDatos}>
                    <li>
                      <strong>Código de banco (4):</strong> <code>{analisisBic.banco}</code> —
                      abreviatura de la entidad.
                    </li>
                    <li>
                      <strong>País (2):</strong> <code>{analisisBic.pais}</code> —{' '}
                      {analisisBic.nombrePais}.
                    </li>
                    <li>
                      <strong>Localidad (2):</strong> <code>{analisisBic.localidad}</code> — ciudad o
                      zona de la sede.
                    </li>
                    <li>
                      <strong>Oficina (3, opcional):</strong> <code>{analisisBic.oficina}</code> —{' '}
                      {analisisBic.esSedePrincipal
                        ? 'apunta a la sede principal de la entidad.'
                        : 'identifica una oficina o departamento concreto.'}
                    </li>
                    {analisisBic.esPasivo && (
                      <li>
                        <strong>Aviso:</strong> el octavo carácter es un 1, lo que en la norma
                        ISO 9362 marca un BIC pasivo (no conectado a la red SWIFT).
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}

            <h3 className={styles.tablaTitulo}>BIC de entidades españolas frecuentes</h3>
            <p className={styles.tablaSubtitulo}>
              Códigos de 8 caracteres correspondientes a la sede principal. Muchas entidades aceptan
              añadir <code>XXX</code> al final. Confírmalo con tu banco antes de dárselo a un
              pagador extranjero: las entidades se fusionan y los códigos cambian.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Entidad</th>
                    <th scope="col">Código IBAN</th>
                    <th scope="col">BIC/SWIFT</th>
                  </tr>
                </thead>
                <tbody>
                  {BIC_ES.map((fila) => (
                    <tr key={fila.entidad}>
                      <td>{fila.nombre}</td>
                      <td>
                        <code>{fila.entidad}</code>
                      </td>
                      <td>
                        <code>{fila.bic}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tablaSubtitulo}>
              Los neobancos suelen dar IBAN de otro país aunque el cliente resida en España (N26
              opera con IBAN alemán, Wise con IBAN belga, Revolut con IBAN lituano o español según el
              contrato). No es un error: dentro de la zona SEPA es perfectamente legal y nadie puede
              rechazar un cobro por ese motivo.
            </p>
          </section>
        )}
      </div>

      {/* ── Warning box: qué NO garantiza un IBAN válido ──────────────── */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">
            ⚠️
          </span>
          <h2>Un IBAN válido no significa que la cuenta sea de quien crees</h2>
        </div>
        <ul className={styles.warningList}>
          <li className={styles.warningItem}>
            <strong>Esta herramienta solo comprueba matemáticas.</strong>
            <p>
              No consulta a ningún banco ni a ningún registro: verifica que el número sea coherente
              consigo mismo. No sabe si la cuenta existe, si está abierta o a nombre de quién está.
            </p>
          </li>
          <li className={styles.warningItem}>
            <strong>Un IBAN de un estafador también es válido.</strong>
            <p>
              En el fraude del cambio de número de cuenta en facturas, el IBAN falso pasa todas las
              validaciones: es una cuenta real, solo que del defraudador. Si un proveedor te avisa
              por correo de que ha cambiado su cuenta, llámalo a un teléfono que ya tuvieras antes
              (nunca al que venga en ese correo) para confirmarlo.
            </p>
          </li>
          <li className={styles.warningItem}>
            <strong>Comprueba el nombre del titular, no solo el número.</strong>
            <p>
              Desde octubre de 2025 los bancos de la zona euro deben ofrecer la verificación del
              beneficiario: al pagar te avisan si el nombre no coincide con el titular del IBAN. Si
              tu banco muestra ese aviso, no lo ignores.
            </p>
          </li>
          <li className={styles.warningItem}>
            <strong>Nada de lo que escribes aquí sale de tu navegador.</strong>
            <p>
              Todo el cálculo ocurre en tu dispositivo y no se envía ni se guarda ningún dato
              bancario. Aun así, evita pegar cuentas ajenas en dispositivos compartidos.
            </p>
          </li>
        </ul>
      </div>

      {/* ── Contenido educativo v2.0 ──────────────────────────────────── */}
      <EducationalSection
        icon="📚"
        title="Entender el IBAN de verdad"
        subtitle="Qué significa cada bloque, por qué el módulo 97 caza casi cualquier errata y en qué se diferencia del BIC"
      >
        <section className={styles.guideSection}>
          <h2>Qué es un IBAN y de dónde sale</h2>
          <p>
            El IBAN (<em>International Bank Account Number</em>) es un formato internacional
            normalizado por la ISO 13616 que envuelve el número de cuenta de toda la vida con cuatro
            caracteres extra: dos letras de país y dos dígitos de control. Su único propósito es que
            un ordenador de cualquier país pueda detectar una errata antes de mover el dinero, sin
            necesidad de consultar al banco de destino.
          </p>
          <p>
            En España sustituyó al CCC (Código Cuenta Cliente) de 20 dígitos, que sigue vivo dentro
            del IBAN: los 20 dígitos finales de un IBAN español <strong>son</strong> el CCC de
            siempre. El 1 de febrero de 2014 terminó la migración a SEPA y desde entonces cualquier
            transferencia, domiciliación o nómina en España se ordena con IBAN. Por eso, si conservas
            un talonario o un contrato antiguo con el número en formato 2100-0418-45-0200051332, no
            necesitas pedir nada al banco: el IBAN se obtiene calculando dos dígitos, que es
            exactamente lo que hace la pestaña «Calcular IBAN».
          </p>

          <h2>Anatomía de un IBAN español: 24 caracteres, cinco piezas</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Bloque</th>
                  <th scope="col">Ejemplo</th>
                  <th scope="col">Longitud</th>
                  <th scope="col">Qué identifica</th>
                  <th scope="col">Quién lo asigna</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Código de país</td>
                  <td>
                    <code>ES</code>
                  </td>
                  <td>2 letras</td>
                  <td>El país donde está abierta la cuenta, no la nacionalidad del titular.</td>
                  <td>Norma ISO 3166</td>
                </tr>
                <tr>
                  <td>Dígitos de control IBAN</td>
                  <td>
                    <code>91</code>
                  </td>
                  <td>2 dígitos</td>
                  <td>Suma de verificación de todo lo demás mediante el módulo 97.</td>
                  <td>Se calculan, no se asignan</td>
                </tr>
                <tr>
                  <td>Entidad</td>
                  <td>
                    <code>2100</code>
                  </td>
                  <td>4 dígitos</td>
                  <td>El banco o caja (2100 = CaixaBank, 0049 = Santander, 0182 = BBVA).</td>
                  <td>Banco de España</td>
                </tr>
                <tr>
                  <td>Sucursal</td>
                  <td>
                    <code>0418</code>
                  </td>
                  <td>4 dígitos</td>
                  <td>La oficina donde se abrió la cuenta; sobrevive aunque la oficina cierre.</td>
                  <td>La propia entidad</td>
                </tr>
                <tr>
                  <td>D.C. del CCC</td>
                  <td>
                    <code>45</code>
                  </td>
                  <td>2 dígitos</td>
                  <td>Control interno español: uno valida entidad+sucursal y otro la cuenta.</td>
                  <td>Se calculan (módulo 11)</td>
                </tr>
                <tr>
                  <td>Número de cuenta</td>
                  <td>
                    <code>0200051332</code>
                  </td>
                  <td>10 dígitos</td>
                  <td>La cuenta concreta dentro de esa oficina.</td>
                  <td>La propia entidad</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Ese doble sistema de control —el módulo 11 español heredado del CCC y el módulo 97
            internacional— es la razón de que un IBAN español sea especialmente difícil de falsear
            por error: hay que equivocarse de forma muy concreta para que ambos controles den por
            bueno un número mal escrito.
          </p>

          <h2>Por qué el módulo 97 caza prácticamente cualquier errata</h2>
          <p>
            La elección de 97 no es arbitraria: es el mayor número primo de dos cifras. Al ser primo,
            los restos se reparten de manera muy uniforme y no aparecen patrones que dejen huecos.
            En la práctica:
          </p>
          <ul className={styles.listaSimple}>
            <li>
              <strong>Errores de un solo dígito</strong> (escribir 3 donde había 8): se detectan
              siempre, sin excepción.
            </li>
            <li>
              <strong>Transposiciones de dos dígitos adyacentes</strong> (escribir 54 donde había
              45), el error de tecleo más común: se detectan siempre.
            </li>
            <li>
              <strong>Transposiciones a distancia y dobles errores</strong>: se detectan en la
              inmensa mayoría de casos. La probabilidad de que dos erratas independientes se
              compensen y den el mismo resto es aproximadamente 1 entre 97, algo menos del 1,04 %.
            </li>
          </ul>
          <p>
            El coste de esa fiabilidad es cero para el usuario y una división para el ordenador. Por
            eso el mismo esquema se reutiliza en el número de identificación fiscal intracomunitario
            y en otros identificadores europeos.
          </p>

          <h2>IBAN y BIC: cuándo te piden cada uno</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Criterio</th>
                  <th scope="col">IBAN</th>
                  <th scope="col">BIC / SWIFT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Qué identifica</td>
                  <td>Una cuenta concreta</td>
                  <td>Una entidad (y opcionalmente una oficina)</td>
                </tr>
                <tr>
                  <td>Longitud</td>
                  <td>15 a 34 caracteres según el país (24 en España)</td>
                  <td>8 u 11 caracteres, siempre</td>
                </tr>
                <tr>
                  <td>¿Se puede calcular?</td>
                  <td>Sí, desde el número de cuenta local</td>
                  <td className={styles.tdNegative}>No: hay que consultarlo</td>
                </tr>
                <tr>
                  <td>Lleva dígitos de control</td>
                  <td>Sí, el módulo 97</td>
                  <td>No, solo se valida el formato</td>
                </tr>
                <tr>
                  <td>Cuándo te lo piden</td>
                  <td>Siempre: nómina, recibos, transferencias, devoluciones</td>
                  <td>Transferencias fuera de la zona SEPA y algunos cobros internacionales</td>
                </tr>
                <tr>
                  <td>Dentro de SEPA</td>
                  <td>Obligatorio</td>
                  <td className={styles.tdPositive}>Innecesario desde 2016 (regla «IBAN only»)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Cuatro situaciones en las que esto importa</h2>
          <div className={styles.escenariosGrid}>
            <article className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  📄
                </span>
                <h3>Tienes un contrato antiguo con el CCC</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Ejemplo:</strong>
                </p>
                <code>2100 0418 45 0200051332 → ES91 2100 0418 4502 0005 1332</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> el CCC no ha cambiado con la migración a SEPA.
                Basta con calcular los dos dígitos de control y anteponer ES. No hace falta llamar al
                banco ni esperar a que te envíen un certificado.
              </p>
            </article>

            <article className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🧾
                </span>
                <h3>Emites facturas y quieres evitar devoluciones</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Ejemplo:</strong>
                </p>
                <code>Cliente escribe ES19… en vez de ES91… → módulo 97 = 26 ≠ 1</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> validar el IBAN antes de generar el fichero de
                adeudos SEPA evita la devolución, que suele costar entre 3 y 6 € por recibo y retrasa
                el cobro varias semanas. Es el uso más rentable de la pestaña «Validar».
              </p>
            </article>

            <article className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  💼
                </span>
                <h3>Contratas a alguien y te dan un IBAN extranjero</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Ejemplo:</strong>
                </p>
                <code>DE89 3704 0044 0532 0130 00 (22 caracteres, Alemania)</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> dentro de SEPA no se puede exigir una cuenta
                nacional para pagar una nómina o domiciliar un recibo; es lo que se conoce como
                prohibición de discriminación por IBAN. Validar la longitud del país confirma que el
                número está completo.
              </p>
            </article>

            <article className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  💻
                </span>
                <h3>Programas un formulario y necesitas validarlo</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Ejemplo:</strong>
                </p>
                <code>resto = 0; for (d of cadena) resto = (resto * 10 + d) % 97;</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> validar por bloques evita el desbordamiento
                numérico, que es el error clásico al implementar IBAN. Comparar los pasos intermedios
                de esta herramienta con los de tu código es la forma más rápida de depurarlo.
              </p>
            </article>
          </div>

          <h2>Cómo calcular un IBAN a mano, en cinco pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Reúne los 20 dígitos del CCC</h4>
                <p>
                  Entidad (4), sucursal (4), dígitos de control (2) y número de cuenta (10). Están en
                  cualquier extracto antiguo, en la libreta o en el contrato de apertura. Si alguno
                  tiene menos cifras de las que debería, faltan ceros por la izquierda.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Escribe el CCC seguido de ES00</h4>
                <p>
                  El código de país se mueve al final y los dígitos de control se sustituyen
                  provisionalmente por dos ceros. Con el ejemplo:{' '}
                  <code>21000418450200051332ES00</code>.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Cambia las letras por números</h4>
                <p>
                  Cada letra vale su posición en el alfabeto más 9: A=10, B=11… E=14, S=28, Z=35.{' '}
                  <code>ES00</code> se convierte en <code>142800</code>. Queda un número de 26
                  cifras.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Calcula el resto de dividir entre 97</h4>
                <p>
                  Con calculadora no cabe, así que se hace por bloques: toma las primeras cifras,
                  divide entre 97, quédate con el resto, añádele las cifras siguientes y repite hasta
                  agotar el número.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Resta el resto a 98</h4>
                <p>
                  El resultado son tus dos dígitos de control, siempre con dos cifras (si sale 7, se
                  escribe 07). Colócalos detrás de ES y delante del CCC. Comprobación: si vuelves a
                  aplicar el módulo 97 al IBAN completo, debe salir exactamente 1.
                </p>
              </div>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Puedo calcular el IBAN sin conocer los dígitos de control del CCC?
              </summary>
              <p className={styles.faqAnswer}>
                Sí. Los dos dígitos de control del CCC no son un dato secreto: se calculan a partir
                de la entidad, la sucursal y el número de cuenta con un algoritmo de pesos
                1-2-4-8-5-10-9-7-3-6 y módulo 11. Si los dejas vacíos o los pones mal, esta
                herramienta te dirá cuáles deberían ser. Lo que no se puede hacer es inventarse el
                número de cuenta: ese sí es un dato que solo tiene el banco.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                He validado un IBAN y sale correcto, pero la transferencia me la han devuelto. ¿Por
                qué?
              </summary>
              <p className={styles.faqAnswer}>
                Porque la validación solo comprueba la coherencia del número, no su existencia. Las
                causas más habituales de devolución con un IBAN formalmente válido son: cuenta
                cancelada o bloqueada, nombre del beneficiario que no coincide con el titular,
                cuenta que no admite ese tipo de operación (por ejemplo, una cuenta de valores) o un
                error del ordenante en el importe o el concepto. El banco emisor suele devolver un
                código de motivo; pídeselo.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Es peligroso dar mi IBAN a alguien?
              </summary>
              <p className={styles.faqAnswer}>
                Dar el IBAN para <em>recibir</em> dinero es una operación habitual y de riesgo bajo:
                aparece impreso en cualquier factura. El riesgo real está en los adeudos
                domiciliados: con tu IBAN alguien podría intentar girarte un recibo. La protección
                existe y es amplia: en la zona SEPA puedes reclamar la devolución de un adeudo
                autorizado hasta 8 semanas después sin dar explicaciones, y hasta 13 meses si el
                adeudo no estaba autorizado. Revisa los movimientos con regularidad y desconfía de
                quien te pida el IBAN junto con datos de acceso a la banca electrónica: eso ya no es
                un cobro, es un fraude.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                Mi banco me da un IBAN de otro país. ¿Es legal?
              </summary>
              <p className={styles.faqAnswer}>
                Sí, y además nadie puede rechazarlo dentro de la zona SEPA. Varios neobancos operan
                con licencia de un país y ofrecen a sus clientes españoles un IBAN alemán, lituano,
                belga o irlandés. El Reglamento SEPA prohíbe expresamente exigir una cuenta nacional
                para pagar una nómina, domiciliar un recibo o abonar una prestación. Si una empresa o
                un organismo se niega, está incumpliendo la norma; en España la reclamación se dirige
                al Banco de España.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Por qué unos países tienen IBAN de 15 caracteres y otros de 31?
              </summary>
              <p className={styles.faqAnswer}>
                Porque la norma solo unifica el principio. Los cuatro primeros caracteres (país y
                control) son iguales en todas partes, pero el resto, llamado BBAN, lo define cada
                país conservando su numeración anterior. Noruega tenía cuentas cortas y se quedó en
                15 caracteres; Malta tenía una estructura larga y llegó a 31. España mantuvo su CCC
                de 20 dígitos, de ahí los 24. Por eso el primer filtro al validar un IBAN extranjero
                siempre es la longitud: si no coincide con la de su país, sobra o falta algo.
              </p>
            </details>
          </div>

          <h2>Buenas prácticas al manejar IBAN</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <div>
                <strong>Escríbelo siempre en grupos de cuatro</strong>
                <p>
                  Es el formato de impresión oficial y reduce mucho los errores de transcripción al
                  dictarlo por teléfono.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔢
              </span>
              <div>
                <strong>Guarda los ceros por la izquierda</strong>
                <p>
                  Nunca almacenes un IBAN o un CCC como número en una hoja de cálculo: se comerá los
                  ceros iniciales. Formato texto siempre.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📞
              </span>
              <div>
                <strong>Confirma los cambios por otro canal</strong>
                <p>
                  Si un proveedor te comunica un IBAN nuevo, verifícalo llamando a un número que ya
                  tuvieras, nunca al que aparece en ese mensaje.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧪
              </span>
              <div>
                <strong>Valida en el formulario, no después</strong>
                <p>
                  Un módulo 97 en el propio formulario cuesta diez líneas de código y evita
                  devoluciones que cuestan dinero y tiempo.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🌍
              </span>
              <div>
                <strong>Dentro de SEPA no pidas el BIC</strong>
                <p>
                  Desde 2016 basta con el IBAN. Exigir el BIC solo añade fricción y una fuente
                  extra de errores.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔒
              </span>
              <div>
                <strong>El IBAN no es una credencial</strong>
                <p>
                  Nadie legítimo te pedirá el IBAN junto a claves, PIN o códigos SMS. Esa
                  combinación es siempre señal de fraude.
                </p>
              </div>
            </div>
          </div>

          <h2>Errores frecuentes al calcular o copiar un IBAN</h2>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Seis fallos que devuelven recibos</h3>
            </div>
            <ul className={styles.warningList}>
              <li className={styles.warningItem}>
                <strong>Calcular el módulo 97 con un número normal.</strong>
                <p>
                  Un IBAN español convertido a cifras tiene 26 dígitos y desborda la precisión de un
                  número en coma flotante: el resultado sale mal en silencio. Hay que dividir por
                  bloques o usar enteros grandes.
                </p>
              </li>
              <li className={styles.warningItem}>
                <strong>Olvidar rellenar el control con dos cifras.</strong>
                <p>
                  Si 98 menos el resto da 7, el IBAN es ES07…, no ES7…. Un carácter de menos deja el
                  número inservible y difícil de diagnosticar.
                </p>
              </li>
              <li className={styles.warningItem}>
                <strong>Perder ceros al pegar desde una hoja de cálculo.</strong>
                <p>
                  Es la causa más frecuente de IBAN con longitud incorrecta. Si el número te sale con
                  23 caracteres en vez de 24, empieza por ahí.
                </p>
              </li>
              <li className={styles.warningItem}>
                <strong>Confundir la letra O con el cero.</strong>
                <p>
                  En un IBAN español no hay ninguna letra después de ES: todo lo demás son dígitos.
                  Si aparece una O, es un cero mal transcrito.
                </p>
              </li>
              <li className={styles.warningItem}>
                <strong>Inventarse los dígitos de control del CCC.</strong>
                <p>
                  Poner 00 «porque no los sé» genera un IBAN que pasa el módulo 97 pero que el banco
                  rechazará al no cuadrar el control interno. Calcúlalos: son deducibles.
                </p>
              </li>
              <li className={styles.warningItem}>
                <strong>Dar por válida una cuenta solo porque el IBAN lo sea.</strong>
                <p>
                  Es el error más caro de todos. La validación matemática no dice nada sobre el
                  titular. Antes de una transferencia importante, confirma el nombre del beneficiario.
                </p>
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={relacionadas} />

      <ShareCard appName="calculadora-iban" />

      <Footer appName="calculadora-iban" />
    </div>
  );
}
