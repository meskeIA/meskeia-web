'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './ValidadorRfcCurp.module.css';
import {
  MeskeiaLogo,
  Footer,
  RelatedApps,
  LegalNotice,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────
// Catálogos y tablas oficiales
// ─────────────────────────────────────────────────────────────

/** Diccionario del SAT para el dígito verificador del RFC (valor = índice) */
const DICCIONARIO_RFC = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ';

/** Diccionario de RENAPO para el dígito verificador de la CURP (valor = índice) */
const DICCIONARIO_CURP = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

/** Catálogo de entidades federativas de RENAPO (32 estados + NE) */
const ENTIDADES: Record<string, string> = {
  AS: 'Aguascalientes',
  BC: 'Baja California',
  BS: 'Baja California Sur',
  CC: 'Campeche',
  CL: 'Coahuila',
  CM: 'Colima',
  CS: 'Chiapas',
  CH: 'Chihuahua',
  DF: 'Ciudad de México',
  DG: 'Durango',
  GT: 'Guanajuato',
  GR: 'Guerrero',
  HG: 'Hidalgo',
  JC: 'Jalisco',
  MC: 'Estado de México',
  MN: 'Michoacán',
  MS: 'Morelos',
  NT: 'Nayarit',
  NL: 'Nuevo León',
  OC: 'Oaxaca',
  PL: 'Puebla',
  QT: 'Querétaro',
  QR: 'Quintana Roo',
  SP: 'San Luis Potosí',
  SL: 'Sinaloa',
  SR: 'Sonora',
  TC: 'Tabasco',
  TS: 'Tamaulipas',
  TL: 'Tlaxcala',
  VZ: 'Veracruz',
  YN: 'Yucatán',
  ZS: 'Zacatecas',
  NE: 'Nacido en el extranjero',
};

/** Listado oficial del SAT de combinaciones consideradas altisonantes */
const PALABRAS_INCONVENIENTES = new Set([
  'BACA', 'BAKA', 'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA', 'CAKO',
  'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO', 'COLA', 'CULO', 'FALO', 'FETO',
  'GETA', 'GUEY', 'JOTO', 'KACA', 'KACO', 'KAGA', 'KAGO', 'KAKA', 'KAKO', 'KOGE',
  'KOGI', 'KOJA', 'KOJE', 'KOJI', 'KOJO', 'KOLA', 'KULO', 'LILO', 'LOCA', 'LOCO',
  'LOKA', 'LOKO', 'MAME', 'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR', 'MION', 'MOCO',
  'MOKO', 'MULA', 'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO', 'PENE', 'PIPI', 'PITO',
  'POPO', 'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN', 'SENO',
  'TETA', 'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY',
]);

/** Partículas que el SAT ignora al armar el RFC */
const PARTICULAS = new Set(['DE', 'DEL', 'LA', 'LAS', 'LOS', 'Y', 'MC', 'MAC', 'VAN', 'VON']);

/** Nombres que se saltan si hay un segundo nombre */
const NOMBRES_OMITIBLES = new Set(['JOSE', 'MARIA', 'J', 'MA']);

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// ─────────────────────────────────────────────────────────────
// Utilidades de texto y fecha
// ─────────────────────────────────────────────────────────────


/** Equivalencias de letras acentuadas (la Ñ se conserva y se trata aparte) */
const SIN_ACENTO: Record<string, string> = {
  'Á': 'A', 'À': 'A', 'Ä': 'A', 'Â': 'A', 'Ã': 'A',
  'É': 'E', 'È': 'E', 'Ë': 'E', 'Ê': 'E',
  'Í': 'I', 'Ì': 'I', 'Ï': 'I', 'Î': 'I',
  'Ó': 'O', 'Ò': 'O', 'Ö': 'O', 'Ô': 'O', 'Õ': 'O',
  'Ú': 'U', 'Ù': 'U', 'Ü': 'U', 'Û': 'U',
  'Ç': 'C',
};

/** Pasa a mayúsculas, quita acentos (conservando la Ñ) y deja solo letras, & y espacios */
function normalizarTexto(texto: string): string {
  return texto
    .toUpperCase()
    .split('')
    .map((letra) => SIN_ACENTO[letra] ?? letra)
    .join('')
    .replace(/[^A-ZÑ& ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Devuelve las palabras del campo descartando partículas (DE, LA, LOS, VAN...) */
function palabrasUtiles(texto: string): string[] {
  const todas = normalizarTexto(texto).split(' ').filter((p) => p.length > 0);
  const utiles = todas.filter((p) => !PARTICULAS.has(p));
  return utiles.length > 0 ? utiles : todas;
}

/** Primera vocal a partir de la segunda letra de la palabra */
function primeraVocalInterna(palabra: string): string {
  for (let i = 1; i < palabra.length; i++) {
    if ('AEIOU'.includes(palabra[i])) return palabra[i];
  }
  return 'X';
}

interface FechaAnalizada {
  valida: boolean;
  anio: number;
  texto: string;
}

/**
 * Interpreta una fecha AAMMDD.
 * Si no se conoce el siglo se deduce: años futuros respecto al actual se van a 19xx.
 * Si el 29 de febrero no cuadra con el siglo deducido se prueba el otro (RFC de empresas viejas).
 */
function analizarFecha(aammdd: string, sigloForzado?: 19 | 20): FechaAnalizada {
  const aa = parseInt(aammdd.slice(0, 2), 10);
  const mm = parseInt(aammdd.slice(2, 4), 10);
  const dd = parseInt(aammdd.slice(4, 6), 10);

  if (Number.isNaN(aa) || Number.isNaN(mm) || Number.isNaN(dd)) {
    return { valida: false, anio: 0, texto: '' };
  }
  if (mm < 1 || mm > 12) return { valida: false, anio: 0, texto: '' };

  const dosDigitosHoy = new Date().getFullYear() % 100;
  const deducido = aa <= dosDigitosHoy ? 2000 + aa : 1900 + aa;
  const candidatos = sigloForzado
    ? [sigloForzado * 100 + aa]
    : [deducido, deducido >= 2000 ? 1900 + aa : 2000 + aa];

  for (const anio of candidatos) {
    const bisiesto = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
    const diasMes = [31, bisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (dd >= 1 && dd <= diasMes[mm - 1]) {
      return { valida: true, anio, texto: `${dd} de ${MESES[mm - 1]} de ${anio}` };
    }
  }
  return { valida: false, anio: candidatos[0], texto: '' };
}

// ─────────────────────────────────────────────────────────────
// Dígitos verificadores
// ─────────────────────────────────────────────────────────────

/**
 * Dígito verificador del RFC (algoritmo del SAT).
 * Recibe el RFC sin el último carácter (11 o 12 posiciones) y aplica
 * suma ponderada decreciente 13..2 sobre 12 posiciones, módulo 11.
 */
function digitoVerificadorRfc(rfcSinDigito: string): string {
  const base = rfcSinDigito.length === 12 ? rfcSinDigito : ' '.repeat(12 - rfcSinDigito.length) + rfcSinDigito;
  let suma = 0;
  for (let i = 0; i < 12; i++) {
    const valor = DICCIONARIO_RFC.indexOf(base[i]);
    if (valor < 0) return '?';
    suma += valor * (13 - i);
  }
  const residuo = suma % 11;
  if (residuo === 0) return '0';
  if (residuo === 1) return 'A';
  return String(11 - residuo);
}

/**
 * Dígito verificador de la CURP (RENAPO).
 * Suma ponderada de las 17 primeras posiciones (pesos 18..2), módulo 10,
 * resultado 10 − módulo, con la regla de que 10 se convierte en 0.
 */
function digitoVerificadorCurp(curp17: string): string {
  let suma = 0;
  for (let i = 0; i < 17; i++) {
    const valor = DICCIONARIO_CURP.indexOf(curp17[i]);
    if (valor < 0) return '?';
    suma += valor * (18 - i);
  }
  const digito = 10 - (suma % 10);
  return String(digito === 10 ? 0 : digito);
}

// ─────────────────────────────────────────────────────────────
// Tipos de resultado
// ─────────────────────────────────────────────────────────────

interface ParteDesglose {
  etiqueta: string;
  valor: string;
  explicacion: string;
}

interface ResultadoRfc {
  valido: boolean;
  rfc: string;
  tipo: 'fisica' | 'moral' | null;
  partes: ParteDesglose[];
  errores: string[];
  notas: string[];
}

interface ResultadoCurp {
  valido: boolean;
  curp: string;
  partes: ParteDesglose[];
  errores: string[];
  notas: string[];
}

interface ResultadoCalculo {
  ok: boolean;
  cuatroLetras: string;
  cuatroOriginales: string;
  inconveniente: boolean;
  fecha: string;
  diezPosiciones: string;
  partes: ParteDesglose[];
  errores: string[];
}

// ─────────────────────────────────────────────────────────────
// Validación de RFC
// ─────────────────────────────────────────────────────────────

function validarRfc(entrada: string): ResultadoRfc {
  const rfc = entrada.toUpperCase().replace(/[\s-]/g, '');
  const errores: string[] = [];
  const notas: string[] = [];
  const partes: ParteDesglose[] = [];

  if (rfc.length === 0) {
    return { valido: false, rfc, tipo: null, partes, errores: ['Escribe un RFC para revisarlo.'], notas };
  }

  let tipo: 'fisica' | 'moral' | null = null;
  if (rfc.length === 13) tipo = 'fisica';
  else if (rfc.length === 12) tipo = 'moral';
  else {
    errores.push(
      `El RFC tiene ${rfc.length} caracteres. Un RFC de persona física tiene 13 y uno de persona moral (empresa) tiene 12.`
    );
    return { valido: false, rfc, tipo: null, partes, errores, notas };
  }

  const numLetras = tipo === 'fisica' ? 4 : 3;
  const iniciales = rfc.slice(0, numLetras);
  const fechaRaw = rfc.slice(numLetras, numLetras + 6);
  const homoclave = rfc.slice(numLetras + 6);

  const patronLetras = tipo === 'fisica' ? /^[A-ZÑ&]{4}$/ : /^[A-ZÑ&]{3}$/;
  if (!patronLetras.test(iniciales)) {
    errores.push(
      `Las primeras ${numLetras} posiciones deben ser letras (se leyó "${iniciales}"). Revisa si capturaste un número donde va una letra.`
    );
  }
  if (!/^\d{6}$/.test(fechaRaw)) {
    errores.push(`Las posiciones ${numLetras + 1} a ${numLetras + 6} deben ser la fecha en formato AAMMDD (se leyó "${fechaRaw}").`);
  }
  if (!/^[A-Z0-9]{3}$/.test(homoclave)) {
    errores.push(`La homoclave debe tener 3 caracteres alfanuméricos (se leyó "${homoclave}").`);
  }

  let fechaTexto = '';
  if (/^\d{6}$/.test(fechaRaw)) {
    const fecha = analizarFecha(fechaRaw);
    if (!fecha.valida) {
      errores.push(
        `La fecha "${fechaRaw}" no existe. Recuerda que va en formato AAMMDD: año de dos dígitos, mes 01-12 y día válido para ese mes.`
      );
    } else {
      fechaTexto = fecha.texto;
      notas.push('El siglo de la fecha se deduce: el RFC solo guarda los dos últimos dígitos del año.');
    }
  }

  // RFC genéricos que el SAT asigna por decreto y que no siguen la regla del dígito verificador
  const esGenerico = rfc === 'XAXX010101000' || rfc === 'XEXX010101000';
  if (esGenerico) {
    notas.push(
      rfc === 'XAXX010101000'
        ? 'Es el RFC genérico para ventas al público en general. No pertenece a ninguna persona.'
        : 'Es el RFC genérico para residentes en el extranjero. No pertenece a ninguna persona y el SAT lo asignó por decreto, así que no sigue la regla del dígito verificador.'
    );
  }

  const digitoLeido = rfc.slice(-1);
  const digitoEsperado = esGenerico ? digitoLeido : digitoVerificadorRfc(rfc.slice(0, -1));
  if (digitoEsperado === '?') {
    errores.push('El RFC contiene caracteres que no pertenecen al conjunto permitido por el SAT.');
  } else if (digitoLeido !== digitoEsperado) {
    errores.push(
      `El dígito verificador no cuadra: el RFC termina en "${digitoLeido}" y según el algoritmo del SAT debería terminar en "${digitoEsperado}". Casi siempre es un error de captura en alguna posición anterior.`
    );
  }

  partes.push({
    etiqueta: tipo === 'fisica' ? 'Iniciales (4 letras)' : 'Iniciales (3 letras)',
    valor: iniciales,
    explicacion:
      tipo === 'fisica'
        ? 'Primera letra y primera vocal interna del apellido paterno, inicial del materno e inicial del nombre.'
        : 'Tres letras tomadas de las palabras de la razón social de la empresa.',
  });
  partes.push({
    etiqueta: tipo === 'fisica' ? 'Fecha de nacimiento' : 'Fecha de constitución',
    valor: fechaRaw,
    explicacion: fechaTexto ? `Corresponde al ${fechaTexto}.` : 'Formato AAMMDD (año, mes y día).',
  });
  partes.push({
    etiqueta: 'Homoclave',
    valor: homoclave.slice(0, 2),
    explicacion: 'Dos caracteres que asigna el SAT para distinguir a personas con los mismos datos. No se puede deducir por fuera.',
  });
  partes.push({
    etiqueta: 'Dígito verificador',
    valor: digitoLeido,
    explicacion:
      digitoEsperado !== '?' && digitoLeido === digitoEsperado
        ? 'Cuadra con el algoritmo del SAT: la clave está bien formada.'
        : `Según el algoritmo del SAT debería ser "${digitoEsperado}".`,
  });

  return { valido: errores.length === 0, rfc, tipo, partes, errores, notas };
}

// ─────────────────────────────────────────────────────────────
// Validación de CURP
// ─────────────────────────────────────────────────────────────

function validarCurp(entrada: string): ResultadoCurp {
  const curp = entrada.toUpperCase().replace(/[\s-]/g, '');
  const errores: string[] = [];
  const notas: string[] = [];
  const partes: ParteDesglose[] = [];

  if (curp.length === 0) {
    return { valido: false, curp, partes, errores: ['Escribe una CURP para revisarla.'], notas };
  }
  if (curp.length !== 18) {
    return {
      valido: false,
      curp,
      partes,
      errores: [`La CURP tiene ${curp.length} caracteres y debe tener exactamente 18.`],
      notas,
    };
  }

  const iniciales = curp.slice(0, 4);
  const fechaRaw = curp.slice(4, 10);
  const sexo = curp.slice(10, 11);
  const entidad = curp.slice(11, 13);
  const consonantes = curp.slice(13, 16);
  const homonimia = curp.slice(16, 17);
  const digitoLeido = curp.slice(17, 18);

  if (!/^[A-ZÑ]{4}$/.test(iniciales)) {
    errores.push(`Las 4 primeras posiciones deben ser letras (se leyó "${iniciales}").`);
  }
  if (!/^\d{6}$/.test(fechaRaw)) {
    errores.push(`Las posiciones 5 a 10 deben ser la fecha de nacimiento en formato AAMMDD (se leyó "${fechaRaw}").`);
  }
  if (sexo !== 'H' && sexo !== 'M') {
    errores.push(`La posición 11 indica el sexo y solo admite H (hombre) o M (mujer); se leyó "${sexo}".`);
  }
  const nombreEntidad = ENTIDADES[entidad];
  if (!nombreEntidad) {
    errores.push(
      `"${entidad}" no es una clave de entidad federativa válida. RENAPO usa 32 claves de estado más NE para quien nació en el extranjero.`
    );
  }
  if (!/^[B-DF-HJ-NP-TV-ZÑ]{3}$/.test(consonantes)) {
    errores.push(
      `Las posiciones 14 a 16 son consonantes internas de los apellidos y el nombre; "${consonantes}" incluye algún carácter que no lo es.`
    );
  }
  if (!/^[0-9A-Z]$/.test(homonimia)) {
    errores.push(`La posición 17 (diferenciador de homonimia) debe ser un dígito o una letra; se leyó "${homonimia}".`);
  }

  // El diferenciador de homonimia indica el siglo: dígito = siglo XX, letra = siglo XXI
  const sigloDeducido: 19 | 20 | undefined = /^\d$/.test(homonimia)
    ? 19
    : /^[A-Z]$/.test(homonimia)
      ? 20
      : undefined;

  let fechaTexto = '';
  if (/^\d{6}$/.test(fechaRaw)) {
    const fecha = analizarFecha(fechaRaw, sigloDeducido);
    if (!fecha.valida) {
      errores.push(`La fecha de nacimiento "${fechaRaw}" no existe (formato AAMMDD).`);
    } else {
      fechaTexto = fecha.texto;
      if (sigloDeducido) {
        notas.push(
          sigloDeducido === 19
            ? 'La posición 17 es un dígito, así que la persona nació en el siglo XX (19xx).'
            : 'La posición 17 es una letra, así que la persona nació a partir del año 2000.'
        );
      }
    }
  }

  const digitoEsperado = digitoVerificadorCurp(curp.slice(0, 17));
  if (digitoEsperado === '?') {
    errores.push('La CURP contiene caracteres fuera del conjunto permitido por RENAPO.');
  } else if (digitoLeido !== digitoEsperado) {
    errores.push(
      `El dígito verificador no cuadra: la CURP termina en "${digitoLeido}" y debería terminar en "${digitoEsperado}". Revisa si hay una letra mal capturada.`
    );
  }

  partes.push({
    etiqueta: 'Iniciales (4 letras)',
    valor: iniciales,
    explicacion: 'Inicial y primera vocal interna del apellido paterno, inicial del materno e inicial del nombre.',
  });
  partes.push({
    etiqueta: 'Fecha de nacimiento',
    valor: fechaRaw,
    explicacion: fechaTexto ? `Corresponde al ${fechaTexto}.` : 'Formato AAMMDD.',
  });
  partes.push({
    etiqueta: 'Sexo',
    valor: sexo,
    explicacion: sexo === 'H' ? 'H de hombre.' : sexo === 'M' ? 'M de mujer.' : 'Valor no reconocido.',
  });
  partes.push({
    etiqueta: 'Entidad de nacimiento',
    valor: entidad,
    explicacion: nombreEntidad ? `Clave de ${nombreEntidad}.` : 'Clave no reconocida en el catálogo de RENAPO.',
  });
  partes.push({
    etiqueta: 'Consonantes internas',
    valor: consonantes,
    explicacion: 'Primera consonante interna del apellido paterno, del materno y del nombre.',
  });
  partes.push({
    etiqueta: 'Homonimia',
    valor: homonimia,
    explicacion: 'Diferencia a personas con los mismos datos. Dígito si naciste antes del 2000, letra si naciste después.',
  });
  partes.push({
    etiqueta: 'Dígito verificador',
    valor: digitoLeido,
    explicacion:
      digitoEsperado !== '?' && digitoLeido === digitoEsperado
        ? 'Cuadra con el algoritmo de RENAPO: la clave está bien formada.'
        : `Según el algoritmo de RENAPO debería ser "${digitoEsperado}".`,
  });

  return { valido: errores.length === 0, curp, partes, errores, notas };
}

// ─────────────────────────────────────────────────────────────
// Cálculo de las 10 primeras posiciones del RFC
// ─────────────────────────────────────────────────────────────

function calcularRfc(
  nombres: string,
  paterno: string,
  materno: string,
  fechaIso: string
): ResultadoCalculo {
  const errores: string[] = [];
  const partes: ParteDesglose[] = [];

  const palabrasPaterno = palabrasUtiles(paterno);
  const palabrasMaterno = palabrasUtiles(materno);
  const palabrasNombre = palabrasUtiles(nombres);

  if (palabrasNombre.length === 0) errores.push('Escribe al menos un nombre de pila.');
  if (palabrasPaterno.length === 0 && palabrasMaterno.length === 0) {
    errores.push('Escribe al menos un apellido.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaIso)) {
    errores.push('Selecciona una fecha de nacimiento válida.');
  }

  if (errores.length > 0) {
    return {
      ok: false,
      cuatroLetras: '',
      cuatroOriginales: '',
      inconveniente: false,
      fecha: '',
      diezPosiciones: '',
      partes,
      errores,
    };
  }

  const pat = palabrasPaterno[0] ?? '';
  const mat = palabrasMaterno[0] ?? '';

  // Si el primer nombre es José, María, J o Ma y hay un segundo nombre, se usa el segundo
  const usaSegundoNombre = palabrasNombre.length > 1 && NOMBRES_OMITIBLES.has(palabrasNombre[0]);
  const nom = usaSegundoNombre ? palabrasNombre[1] : palabrasNombre[0];

  let base = '';
  let reglaAplicada = '';

  if (!pat) {
    base = mat.slice(0, 2) + nom.slice(0, 2);
    reglaAplicada = 'Sin apellido paterno: se toman las dos primeras letras del apellido materno y las dos primeras del nombre.';
  } else if (!mat) {
    base = pat.slice(0, 2) + nom.slice(0, 2);
    reglaAplicada = 'Sin apellido materno: se toman las dos primeras letras del apellido paterno y las dos primeras del nombre.';
  } else if (pat.length <= 2) {
    base = pat.slice(0, 1) + mat.slice(0, 1) + nom.slice(0, 2);
    reglaAplicada = 'Apellido paterno muy corto: se toma su inicial, la inicial del materno y las dos primeras letras del nombre.';
  } else {
    base = pat[0] + primeraVocalInterna(pat) + mat[0] + nom[0];
    reglaAplicada = 'Regla general: inicial y primera vocal interna del apellido paterno, inicial del materno e inicial del nombre.';
  }

  // La Ñ se sustituye por X en el RFC de persona física
  base = (base + 'XXXX').slice(0, 4).replace(/Ñ/g, 'X');

  const cuatroOriginales = base;
  const inconveniente = PALABRAS_INCONVENIENTES.has(base);
  const cuatroLetras = inconveniente ? base.slice(0, 3) + 'X' : base;

  const [anio, mes, dia] = fechaIso.split('-');
  const fecha = anio.slice(2) + mes + dia;

  partes.push({
    etiqueta: 'Apellido paterno',
    valor: pat || '—',
    explicacion: pat
      ? `Se usa "${pat}" (se descartaron partículas como DE, LA o LOS si las había).`
      : 'No se capturó apellido paterno.',
  });
  partes.push({
    etiqueta: 'Apellido materno',
    valor: mat || '—',
    explicacion: mat ? `Se usa "${mat}" para tomar su inicial.` : 'No se capturó apellido materno.',
  });
  partes.push({
    etiqueta: 'Nombre de pila',
    valor: nom,
    explicacion: usaSegundoNombre
      ? `El primer nombre ("${palabrasNombre[0]}") es de los que el SAT omite cuando hay un segundo nombre, así que se usa "${nom}".`
      : `Se usa la inicial de "${nom}".`,
  });
  partes.push({
    etiqueta: 'Cuatro letras',
    valor: cuatroLetras,
    explicacion: inconveniente
      ? `Las iniciales daban "${cuatroOriginales}", que está en el listado de palabras inconvenientes del SAT: la cuarta letra se cambia por X.`
      : reglaAplicada,
  });
  partes.push({
    etiqueta: 'Fecha (AAMMDD)',
    valor: fecha,
    explicacion: `${parseInt(dia, 10)} de ${MESES[parseInt(mes, 10) - 1]} de ${anio}, escrito como año, mes y día de dos dígitos.`,
  });

  return {
    ok: true,
    cuatroLetras,
    cuatroOriginales,
    inconveniente,
    fecha,
    diezPosiciones: cuatroLetras + fecha,
    partes,
    errores: [],
  };
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

type Pestania = 'validar-rfc' | 'calcular-rfc' | 'validar-curp';

export default function ValidadorRfcCurpPage() {
  const [pestania, setPestania] = useState<Pestania>('validar-rfc');

  // Modo 1
  const [rfcEntrada, setRfcEntrada] = useState('');
  const [resultadoRfc, setResultadoRfc] = useState<ResultadoRfc | null>(null);

  // Modo 2
  const [nombres, setNombres] = useState('');
  const [paterno, setPaterno] = useState('');
  const [materno, setMaterno] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [resultadoCalculo, setResultadoCalculo] = useState<ResultadoCalculo | null>(null);

  // Modo 3
  const [curpEntrada, setCurpEntrada] = useState('');
  const [resultadoCurp, setResultadoCurp] = useState<ResultadoCurp | null>(null);

  const [copiado, setCopiado] = useState(false);

  const handleValidarRfc = useCallback(() => {
    setResultadoRfc(validarRfc(rfcEntrada));
  }, [rfcEntrada]);

  const handleCalcularRfc = useCallback(() => {
    setResultadoCalculo(calcularRfc(nombres, paterno, materno, fechaNac));
  }, [nombres, paterno, materno, fechaNac]);

  const handleValidarCurp = useCallback(() => {
    setResultadoCurp(validarCurp(curpEntrada));
  }, [curpEntrada]);

  const copiarDiezPosiciones = useCallback(async () => {
    if (!resultadoCalculo?.diezPosiciones) return;
    try {
      await navigator.clipboard.writeText(resultadoCalculo.diezPosiciones);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }, [resultadoCalculo]);

  const limpiarTodo = useCallback(() => {
    setRfcEntrada('');
    setResultadoRfc(null);
    setNombres('');
    setPaterno('');
    setMaterno('');
    setFechaNac('');
    setResultadoCalculo(null);
    setCurpEntrada('');
    setResultadoCurp(null);
  }, []);

  const renderDesglose = (partes: ParteDesglose[]) => (
    <div className={styles.desglose}>
      {partes.map((parte) => (
        <div key={parte.etiqueta} className={styles.desgloseItem}>
          <div className={styles.desgloseValor}>{parte.valor}</div>
          <div className={styles.desgloseTexto}>
            <h3>{parte.etiqueta}</h3>
            <p>{parte.explicacion}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Validar RFC y CURP · Calculadora de RFC</h1>
        <p className={styles.subtitle}>
          Revisa si tu RFC o tu CURP están bien formados (estructura, fecha y dígito verificador) y calcula
          las 10 primeras posiciones de tu RFC con tu nombre y tu fecha de nacimiento.
        </p>
      </header>

      <LegalNotice />

      {/* Pestañas */}
      <div className={styles.tabs} role="tablist" aria-label="Modos de la herramienta">
        <button
          type="button"
          role="tab"
          id="tab-validar-rfc"
          aria-selected={pestania === 'validar-rfc'}
          aria-controls="panel-validar-rfc"
          className={`${styles.tab} ${pestania === 'validar-rfc' ? styles.tabActive : ''}`}
          onClick={() => setPestania('validar-rfc')}
        >
          <span aria-hidden="true">🔍</span> Validar RFC
        </button>
        <button
          type="button"
          role="tab"
          id="tab-calcular-rfc"
          aria-selected={pestania === 'calcular-rfc'}
          aria-controls="panel-calcular-rfc"
          className={`${styles.tab} ${pestania === 'calcular-rfc' ? styles.tabActive : ''}`}
          onClick={() => setPestania('calcular-rfc')}
        >
          <span aria-hidden="true">🧮</span> Calcular RFC
        </button>
        <button
          type="button"
          role="tab"
          id="tab-validar-curp"
          aria-selected={pestania === 'validar-curp'}
          aria-controls="panel-validar-curp"
          className={`${styles.tab} ${pestania === 'validar-curp' ? styles.tabActive : ''}`}
          onClick={() => setPestania('validar-curp')}
        >
          <span aria-hidden="true">🪪</span> Validar CURP
        </button>
      </div>

      {/* ───────────── Modo 1: Validar RFC ───────────── */}
      {pestania === 'validar-rfc' && (
        <section
          className={styles.panel}
          role="tabpanel"
          id="panel-validar-rfc"
          aria-labelledby="tab-validar-rfc"
        >
          <h2 className={styles.panelTitle}>Revisa un RFC</h2>
          <p className={styles.panelHelp}>
            Funciona con RFC de persona física (13 caracteres) y de persona moral o empresa (12 caracteres).
          </p>

          <label className={styles.label} htmlFor="campo-rfc">
            RFC con homoclave
          </label>
          <input
            id="campo-rfc"
            type="text"
            className={styles.inputClave}
            value={rfcEntrada}
            onChange={(e) => setRfcEntrada(e.target.value.toUpperCase())}
            placeholder="Ejemplo: GOMR850315H23"
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
          />

          <div className={styles.acciones}>
            <button type="button" className={styles.btnPrimary} onClick={handleValidarRfc}>
              Validar RFC
            </button>
            <button type="button" className={styles.btnSecondary} onClick={limpiarTodo}>
              Limpiar
            </button>
          </div>

          {resultadoRfc && (
            <div className={styles.resultado} role="alert" aria-live="polite">
              <div className={resultadoRfc.valido ? styles.badgeOk : styles.badgeError}>
                <span aria-hidden="true">{resultadoRfc.valido ? '✅' : '⛔'}</span>{' '}
                {resultadoRfc.valido
                  ? `Estructura correcta · RFC de persona ${resultadoRfc.tipo === 'fisica' ? 'física' : 'moral'}`
                  : 'La estructura tiene problemas'}
              </div>

              {resultadoRfc.errores.length > 0 && (
                <ul className={styles.listaErrores}>
                  {resultadoRfc.errores.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}

              {resultadoRfc.tipo && renderDesglose(resultadoRfc.partes)}

              {resultadoRfc.notas.map((nota) => (
                <p key={nota} className={styles.nota}>
                  <span aria-hidden="true">💡</span> {nota}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ───────────── Modo 2: Calcular RFC ───────────── */}
      {pestania === 'calcular-rfc' && (
        <section
          className={styles.panel}
          role="tabpanel"
          id="panel-calcular-rfc"
          aria-labelledby="tab-calcular-rfc"
        >
          <h2 className={styles.panelTitle}>Arma las 10 primeras posiciones de tu RFC</h2>
          <p className={styles.panelHelp}>
            Captura tus datos tal como aparecen en tu acta de nacimiento. La herramienta aplica las reglas
            del SAT paso a paso y te explica de dónde sale cada letra.
          </p>

          <div className={styles.formGrid}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="campo-paterno">
                Apellido paterno
              </label>
              <input
                id="campo-paterno"
                type="text"
                className={styles.input}
                value={paterno}
                onChange={(e) => setPaterno(e.target.value)}
                placeholder="Gómez"
                autoComplete="family-name"
              />
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="campo-materno">
                Apellido materno
              </label>
              <input
                id="campo-materno"
                type="text"
                className={styles.input}
                value={materno}
                onChange={(e) => setMaterno(e.target.value)}
                placeholder="Ramírez"
                autoComplete="off"
              />
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="campo-nombres">
                Nombre o nombres
              </label>
              <input
                id="campo-nombres"
                type="text"
                className={styles.input}
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="María Fernanda"
                autoComplete="given-name"
              />
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="campo-fecha">
                Fecha de nacimiento
              </label>
              <input
                id="campo-fecha"
                type="date"
                className={styles.input}
                value={fechaNac}
                onChange={(e) => setFechaNac(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.acciones}>
            <button type="button" className={styles.btnPrimary} onClick={handleCalcularRfc}>
              Calcular
            </button>
            <button type="button" className={styles.btnSecondary} onClick={limpiarTodo}>
              Limpiar
            </button>
          </div>

          {resultadoCalculo && (
            <div className={styles.resultado} role="alert" aria-live="polite">
              {resultadoCalculo.errores.length > 0 && (
                <ul className={styles.listaErrores}>
                  {resultadoCalculo.errores.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}

              {resultadoCalculo.ok && (
                <>
                  <div className={styles.claveGrande}>
                    <span className={styles.claveTexto}>{resultadoCalculo.diezPosiciones}</span>
                    <span className={styles.claveIncognita} aria-hidden="true">??</span>
                    <span className={styles.claveIncognita} aria-hidden="true">?</span>
                  </div>
                  <p className={styles.claveLeyenda}>
                    Estas son las <strong>10 primeras posiciones</strong> de tu RFC. Los tres caracteres que
                    faltan (homoclave y dígito verificador) los asigna el SAT.
                  </p>

                  <div className={styles.acciones}>
                    <button type="button" className={styles.btnSecondary} onClick={copiarDiezPosiciones}>
                      {copiado ? 'Copiado' : 'Copiar las 10 posiciones'}
                    </button>
                  </div>

                  <div className={styles.honestidadBox}>
                    <h3>
                      <span aria-hidden="true">🙅</span> Aquí no te inventamos la homoclave
                    </h3>
                    <p>
                      Las posiciones 11 y 12 —la homoclave— <strong>no se pueden calcular por fuera</strong>.
                      El SAT las genera con sus propios registros para distinguir entre personas que comparten
                      nombre, apellidos y fecha de nacimiento, así que dependen de quién más está dado de alta.
                      Cualquier sitio que te prometa el RFC completo de 13 caracteres está adivinando.
                    </p>
                    <p>
                      Para conocer tu RFC completo entra al portal del SAT con tu CURP en la sección
                      &laquo;RFC con homoclave&raquo;, o solicita tu constancia de situación fiscal.
                    </p>
                  </div>

                  {resultadoCalculo.inconveniente && (
                    <p className={styles.nota}>
                      <span aria-hidden="true">🤭</span> Tus iniciales daban{' '}
                      <strong>{resultadoCalculo.cuatroOriginales}</strong>, que está en el listado de palabras
                      inconvenientes del SAT. Por eso la cuarta letra se cambió por una X.
                    </p>
                  )}

                  {renderDesglose(resultadoCalculo.partes)}
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* ───────────── Modo 3: Validar CURP ───────────── */}
      {pestania === 'validar-curp' && (
        <section
          className={styles.panel}
          role="tabpanel"
          id="panel-validar-curp"
          aria-labelledby="tab-validar-curp"
        >
          <h2 className={styles.panelTitle}>Revisa una CURP</h2>
          <p className={styles.panelHelp}>
            Comprueba los 18 caracteres: estructura, entidad de nacimiento, fecha y dígito verificador.
          </p>

          <label className={styles.label} htmlFor="campo-curp">
            CURP (18 caracteres)
          </label>
          <input
            id="campo-curp"
            type="text"
            className={styles.inputClave}
            value={curpEntrada}
            onChange={(e) => setCurpEntrada(e.target.value.toUpperCase())}
            placeholder="Ejemplo: GORM850315HDFMMR05"
            maxLength={25}
            autoComplete="off"
            spellCheck={false}
          />

          <div className={styles.acciones}>
            <button type="button" className={styles.btnPrimary} onClick={handleValidarCurp}>
              Validar CURP
            </button>
            <button type="button" className={styles.btnSecondary} onClick={limpiarTodo}>
              Limpiar
            </button>
          </div>

          {resultadoCurp && (
            <div className={styles.resultado} role="alert" aria-live="polite">
              <div className={resultadoCurp.valido ? styles.badgeOk : styles.badgeError}>
                <span aria-hidden="true">{resultadoCurp.valido ? '✅' : '⛔'}</span>{' '}
                {resultadoCurp.valido ? 'Estructura correcta' : 'La estructura tiene problemas'}
              </div>

              {resultadoCurp.errores.length > 0 && (
                <ul className={styles.listaErrores}>
                  {resultadoCurp.errores.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}

              {resultadoCurp.curp.length === 18 && renderDesglose(resultadoCurp.partes)}

              {resultadoCurp.notas.map((nota) => (
                <p key={nota} className={styles.nota}>
                  <span aria-hidden="true">💡</span> {nota}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Aviso permanente: qué hace y qué NO hace esta herramienta */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
          <h2>Qué revisa esta herramienta y qué no</h2>
        </div>
        <ul className={styles.warningList}>
          <li>
            <strong>Valida la estructura, no consulta ningún registro oficial.</strong> No se conecta con el
            SAT ni con RENAPO: comprueba que la clave esté bien armada según las reglas publicadas.
          </li>
          <li>
            <strong>No confirma que un RFC o una CURP existan</strong> ni a quién pertenecen. Una clave puede
            cuadrar perfectamente con el algoritmo y no estar dada de alta.
          </li>
          <li>
            <strong>Para cualquier trámite, la fuente es el SAT o RENAPO.</strong> Tu RFC completo lo obtienes
            en el portal del SAT o en tu constancia de situación fiscal; tu CURP, en el portal de RENAPO.
          </li>
          <li>
            <strong>Ningún dato personal sale de tu dispositivo.</strong> Todo el cálculo ocurre dentro de tu
            navegador con JavaScript: tu nombre, tu fecha de nacimiento y tus claves no se envían a ningún
            servidor ni se guardan en ningún lado.
          </li>
        </ul>
      </div>

      {/* ───────────── Contenido educativo v2.0 ───────────── */}
      <EducationalSection
        icon="📚"
        title="Todo sobre el RFC y la CURP"
        subtitle="Para qué sirve cada clave, cómo se arma y qué hacer cuando no coincide"
      >
        <section className={styles.guideSection}>
          <h2>Tres claves distintas que se confunden todo el tiempo</h2>
          <p>
            En México casi cualquier trámite pide una clave, y no siempre la misma. El <strong>RFC</strong> es
            fiscal y lo emite el SAT: sirve para facturar, declarar impuestos, cobrar como asalariado o abrir
            una cuenta empresarial. La <strong>CURP</strong> la emite RENAPO y es tu identificador como persona
            residente en el país: la tienes desde el registro de tu nacimiento y se usa lo mismo para
            inscribirte en la escuela que para una vacuna. El <strong>NSS</strong> es del IMSS y solo tiene que
            ver con tu seguridad social.
          </p>
          <p>
            Las tres comparten un aire de familia porque las tres se arman con tus iniciales y tu fecha de
            nacimiento, pero se generan por caminos distintos y no se deducen una de otra. Esa es, de hecho, la
            confusión más frecuente: mucha gente cree que su RFC se saca de su CURP recortando caracteres. Las
            10 primeras posiciones se parecen, sí, pero la homoclave del RFC no está contenida en la CURP.
          </p>
        </section>

        <section className={styles.comparativaSection}>
          <h2>RFC, CURP y NSS de un vistazo</h2>
          <p className={styles.comparativaSubtitle}>Quién la emite, para qué sirve y cómo se compone.</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>RFC</th>
                  <th>CURP</th>
                  <th>NSS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Quién la emite</strong></td>
                  <td>SAT</td>
                  <td>RENAPO (Segob)</td>
                  <td>IMSS</td>
                </tr>
                <tr>
                  <td><strong>Longitud</strong></td>
                  <td>13 (persona física) o 12 (empresa)</td>
                  <td>18 caracteres</td>
                  <td>11 dígitos</td>
                </tr>
                <tr>
                  <td><strong>Para qué sirve</strong></td>
                  <td>Facturar, declarar, alta laboral, deducciones</td>
                  <td>Identificarte en trámites de gobierno, escuela, salud</td>
                  <td>Cotizar y recibir servicios del IMSS</td>
                </tr>
                <tr>
                  <td><strong>Se puede calcular solo</strong></td>
                  <td><span aria-hidden="true">⚠️</span> Solo las 10 primeras posiciones</td>
                  <td><span aria-hidden="true">⚠️</span> Solo parcialmente (la homonimia la asigna RENAPO)</td>
                  <td><span aria-hidden="true">❌</span> No, es un consecutivo</td>
                </tr>
                <tr>
                  <td><strong>Incluye tu sexo</strong></td>
                  <td><span aria-hidden="true">❌</span> No</td>
                  <td><span aria-hidden="true">✅</span> Sí, posición 11 (H o M)</td>
                  <td><span aria-hidden="true">❌</span> No</td>
                </tr>
                <tr>
                  <td><strong>Incluye dónde naciste</strong></td>
                  <td><span aria-hidden="true">❌</span> No</td>
                  <td><span aria-hidden="true">✅</span> Sí, clave de entidad</td>
                  <td><span aria-hidden="true">⚠️</span> Solo la subdelegación de alta</td>
                </tr>
                <tr>
                  <td><strong>La necesitas para</strong></td>
                  <td>Cualquiera que reciba ingresos</td>
                  <td>Toda persona residente</td>
                  <td>Personas trabajadoras aseguradas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.escenariosSection}>
          <h2>Cuatro situaciones típicas</h2>
          <p className={styles.escenariosSubtitle}>Casos reales en los que revisar la clave ahorra un viaje.</p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧾</span>
                <h3>Te van a facturar y dictaste tu RFC por teléfono</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>Te dictaron GOMR850315H25 y el dígito correcto era 3</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué importa:</strong> una factura con RFC equivocado no es deducible y hay que
                cancelarla y reexpedirla. El dígito verificador detecta ese tipo de error antes de timbrar.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <h3>Primer empleo y te piden RFC que no tienes</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>Con tu CURP puedes obtener el RFC en el portal del SAT en minutos</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué importa:</strong> calcular las 10 primeras posiciones te sirve para llenar el
                formato provisional y para verificar que lo que te entreguen coincida con tus datos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏫</span>
                <h3>Inscripción escolar con CURP mal capturada</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>Cambiar una sola consonante interna rompe el dígito verificador</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué importa:</strong> muchas plataformas escolares rechazan la CURP sin decirte por
                qué. Validarla te dice si el problema es de captura o si hay que corregirla en RENAPO.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <h3>Alta de proveedores en una empresa</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>RFC de persona moral: 12 caracteres, 3 letras de la razón social</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué importa:</strong> quien captura altas de proveedores puede filtrar los RFC mal
                formados antes de subirlos al sistema y ahorrarse rechazos en cascada.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Por qué el RFC lleva mi fecha de nacimiento?</h3>
              <p>
                Porque con cuatro letras solas habría demasiadas coincidencias. En un país de más de 120
                millones de personas, las iniciales &laquo;GOMR&raquo; las comparten decenas de miles. Al
                agregar el año, el mes y el día, la probabilidad de choque baja muchísimo. Aun así quedan
                coincidencias —dos personas con las mismas iniciales nacidas el mismo día— y ahí es donde entra
                la homoclave.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Ojo:</strong> en las empresas esos seis dígitos no
                son un nacimiento sino la fecha de constitución ante notario.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué es exactamente la homoclave y por qué no se puede calcular?</h3>
              <p>
                La homoclave son las posiciones 11 y 12. Su función es desempatar homónimos: cuando dos
                contribuyentes coinciden en las 10 primeras posiciones, el SAT les asigna homoclaves distintas.
                Existe un procedimiento aritmético publicado que genera un candidato, pero el resultado real
                depende de qué claves ya están ocupadas en el padrón, información que solo el SAT tiene.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Consejo:</strong> desconfía de cualquier página que
                te entregue un RFC de 13 caracteres sin consultar al SAT. Si te equivocas de homoclave, tus
                facturas se rechazan.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué es el dígito verificador y qué errores detecta?</h3>
              <p>
                Es el último carácter, tanto en el RFC como en la CURP. Se calcula sumando el valor numérico de
                cada carácter anterior multiplicado por un peso que va bajando de izquierda a derecha, y
                aplicando después un módulo (11 en el RFC, 10 en la CURP). Como cada posición tiene un peso
                distinto, el sistema detecta los dos errores humanos más comunes: cambiar un carácter por otro
                y transponer dos caracteres contiguos.
              </p>
              <p>
                Lo que no detecta es un error &laquo;coherente&raquo;: si te inventas una clave completa y
                calculas bien su dígito, cuadrará. Por eso validar no equivale a comprobar que la clave exista.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Por qué existe el listado de palabras inconvenientes?</h3>
              <p>
                Porque el sistema de iniciales genera, tarde o temprano, combinaciones incómodas. Alguien
                apellidado Bueno Enríquez llamado Ignacio produce BUEI; Ramos Torres llamada Ana produce
                RATA; Mamani Medina llamada Estela produce MAME. El SAT publicó un listado de combinaciones de
                cuatro letras que no se asignan y ordenó sustituir la cuarta letra por una X: BUEX, RATX, MAMX.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Dato útil:</strong> si tu RFC oficial termina las
                iniciales en X y no entiendes por qué, casi seguro es esto y no un error.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>Mi RFC calculado no coincide con el que me dio el SAT, ¿qué pasó?</h3>
              <p>
                Las causas más habituales, en orden de frecuencia: tu acta de nacimiento tiene los apellidos en
                otro orden o con otra ortografía de la que tú usas; hay una partícula (De la, Del, Mac) que se
                interpretó distinto; tu primer nombre es José o María y el SAT tomó el segundo; o tu registro
                trae un nombre compuesto que tú abreviaste. También ocurre que el registro del SAT sea el que
                tenga el error de captura.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Qué hacer:</strong> el RFC que vale es el que consta
                en tu constancia de situación fiscal, aunque no cuadre con la regla. Si de plano está mal, la
                corrección se pide en el SAT con tu acta de nacimiento.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué es la constancia de situación fiscal y para qué me la piden?</h3>
              <p>
                Es un documento que emite el SAT y que reúne tu RFC completo, tu nombre o razón social, tu
                domicilio fiscal, tu régimen fiscal y tu estatus en el padrón. Desde que la facturación exige
                régimen y código postal correctos, casi cualquier empleador, cliente o proveedor te la pide.
                Se descarga gratis desde el portal del SAT con tu RFC y contraseña, o con e.firma, y trae un
                código QR para verificarla.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Consejo:</strong> descárgala de nuevo cada vez que
                cambies de domicilio o de régimen; la que tienes guardada queda desactualizada.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿La CURP dice en qué estado nací aunque viva en otro?</h3>
              <p>
                Sí. Las posiciones 12 y 13 corresponden a la entidad donde te registraron, y no cambian si te
                mudas. El catálogo de RENAPO tiene 32 claves (AS para Aguascalientes, JC para Jalisco, DF para
                la Ciudad de México, MC para el Estado de México...) más NE para quienes nacieron en el
                extranjero. Es la razón por la que la CURP de una persona nacida en la CDMX sigue empezando su
                bloque de entidad con DF aunque la entidad ya no se llame así.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Es seguro escribir mis datos en una página para calcular el RFC?</h3>
              <p>
                Depende de la página. En esta herramienta todo el procesamiento ocurre en tu navegador con
                JavaScript: no hay ninguna llamada a un servidor, así que tu nombre, tu fecha de nacimiento y
                tus claves nunca salen de tu dispositivo. Puedes comprobarlo desactivando tu conexión y viendo
                que la herramienta sigue funcionando.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Regla general:</strong> nunca captures tu CURP, tu
                RFC y tu domicilio juntos en formularios que no reconozcas; esa combinación es suficiente para
                intentos de suplantación.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo armar tu RFC paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Toma tus datos del acta de nacimiento</h3>
                <p>
                  No de memoria ni de la credencial de elector. El SAT arma el RFC con lo que dice el registro
                  civil, incluidos nombres completos que quizá nunca uses.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Quita partículas y caracteres raros</h3>
                <p>
                  Se ignoran DE, DEL, LA, LAS, LOS, Y, MC, MAC, VAN y VON. Los acentos se quitan y la Ñ se
                  convierte en X. &laquo;De la Cruz&raquo; se trabaja como &laquo;Cruz&raquo;.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Saca las dos letras del apellido paterno</h3>
                <p>
                  La primera letra y la primera vocal que aparezca después de ella. En &laquo;Gómez&raquo;: G y
                  O. En &laquo;Cruz&raquo;: C y U. Si el apellido no tiene vocal interna, se usa X.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Agrega la inicial del materno y la del nombre</h3>
                <p>
                  Si tu primer nombre es José, María, J. o Ma., se usa el segundo nombre. &laquo;María
                  Fernanda&raquo; aporta la F, no la M.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Revisa el listado de palabras inconvenientes</h3>
                <p>
                  Si las cuatro letras forman una de las combinaciones del listado del SAT, la cuarta se
                  sustituye por X. Esta herramienta lo hace de forma automática y te avisa.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Pega tu fecha en formato AAMMDD</h3>
                <p>
                  Año de dos dígitos, mes y día con cero a la izquierda. El 15 de marzo de 1985 se escribe
                  850315. Con esto ya tienes las 10 primeras posiciones.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Pide al SAT los tres caracteres que faltan</h3>
                <p>
                  Homoclave y dígito verificador solo salen del SAT: en el portal, con tu CURP, o solicitando
                  tu constancia de situación fiscal. Ahí termina lo que se puede calcular por fuera.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.tipsSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h3>Guarda tu constancia actualizada</h3>
              <p>Es la única prueba de tu RFC, régimen y código postal fiscal. Descárgala de nuevo tras cada cambio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h3>Verifica antes de timbrar</h3>
              <p>Un RFC con dígito verificador incorrecto rechaza la factura y obliga a cancelarla y reexpedirla.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h3>Copia y pega, no dictes</h3>
              <p>La mayoría de los errores de RFC nacen de un dictado telefónico: B y V, M y N suenan casi igual.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h3>Usa el orden del acta</h3>
              <p>Paterno, materno y nombres tal como están registrados, aunque en tu día a día los uses de otra forma.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h3>Revisa la entidad de tu CURP</h3>
              <p>Si la clave de estado no corresponde a donde te registraron, hay un error que conviene corregir en RENAPO.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h3>No compartas RFC y CURP juntos</h3>
              <p>Por separado son claves de trámite; juntos y con tu domicilio son material de suplantación de identidad.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores comunes que cuestan un trámite</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Inventar la homoclave para completar los 13 caracteres:</strong> la factura se rechaza y,
              si el RFC inventado pertenece a otra persona, el gasto no es deducible. Solicita el RFC real al
              SAT antes de usarlo.
            </li>
            <li>
              <strong>Confundir el 0 con la letra O y el 1 con la I:</strong> en la homoclave conviven letras y
              dígitos, así que el ojo se equivoca. Si el dígito verificador no cuadra, revisa primero estos
              pares.
            </li>
            <li>
              <strong>Usar el apellido de casada:</strong> el RFC y la CURP se arman con los apellidos del acta
              de nacimiento, sin importar el estado civil. Cambiarlos genera una clave que no existe.
            </li>
            <li>
              <strong>Tratar &laquo;De la Torre&raquo; como apellido completo:</strong> las partículas se
              ignoran y se toma TORRE. Meter la D produce una clave que el SAT nunca asignó.
            </li>
            <li>
              <strong>Suponer que el RFC de una empresa se calcula igual:</strong> las personas morales usan 12
              caracteres y 3 letras tomadas de la razón social, con reglas propias para abreviaturas y siglas.
            </li>
            <li>
              <strong>Dar por buena una clave solo porque &laquo;valida&raquo;:</strong> el algoritmo confirma
              que está bien formada, no que exista ni que sea tuya. Para eso hay que ir al SAT o a RENAPO.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('validador-rfc-curp')} />

      <ShareCard appName="validador-rfc-curp" />

      <Footer appName="validador-rfc-curp" />
    </div>
  );
}
