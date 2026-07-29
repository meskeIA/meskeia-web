'use client';

import { useState, useMemo } from 'react';
import styles from './RevisorLecturaFacil.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

type Severidad = 'alta' | 'media' | 'baja';

type ReglaId =
  | 'frase-larga'
  | 'varias-ideas'
  | 'voz-pasiva'
  | 'palabra-larga'
  | 'tecnicismo'
  | 'cifra-compleja'
  | 'sigla'
  | 'abreviatura'
  | 'figurado'
  | 'doble-negacion'
  | 'extranjerismo'
  | 'referencia-ambigua'
  | 'parrafo-largo';

interface Aviso {
  regla: ReglaId;
  /** Qué se ha encontrado exactamente */
  detalle: string;
  /** Qué hacer con ello */
  sugerencia: string;
}

interface FraseAnalizada {
  indice: number;
  texto: string;
  palabras: number;
  parrafo: number;
  avisos: Aviso[];
}

interface Analisis {
  frases: FraseAnalizada[];
  parrafos: { indice: number; frases: number; palabras: number; avisos: Aviso[] }[];
  totalPalabras: number;
  totalFrases: number;
  mediaPalabras: number;
  frasesConformes: number;
  recuentoPorRegla: Record<ReglaId, number>;
  sustituciones: { termino: string; alternativa: string }[];
}

interface InfoRegla {
  id: ReglaId;
  etiqueta: string;
  icono: string;
  severidadBase: Severidad;
  descripcion: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CATÁLOGO DE REGLAS
// ═══════════════════════════════════════════════════════════════════════

const REGLAS: InfoRegla[] = [
  {
    id: 'frase-larga',
    etiqueta: 'Frase larga',
    icono: '📏',
    severidadBase: 'media',
    descripcion: 'Más de 15 palabras. A partir de 25 la dificultad crece mucho.',
  },
  {
    id: 'varias-ideas',
    etiqueta: 'Varias ideas juntas',
    icono: '🔀',
    severidadBase: 'media',
    descripcion: 'La frase encadena subordinadas: cada idea debería ir en su propia frase.',
  },
  {
    id: 'voz-pasiva',
    etiqueta: 'Voz pasiva',
    icono: '🔄',
    severidadBase: 'alta',
    descripcion: 'Esconde quién hace la acción y altera el orden natural de la frase.',
  },
  {
    id: 'palabra-larga',
    etiqueta: 'Palabra muy larga',
    icono: '🔤',
    severidadBase: 'baja',
    descripcion: 'Cinco sílabas o más. Suelen tener una alternativa más corta.',
  },
  {
    id: 'tecnicismo',
    etiqueta: 'Palabra difícil',
    icono: '📚',
    severidadBase: 'alta',
    descripcion: 'Término administrativo, jurídico o culto con alternativa cotidiana.',
  },
  {
    id: 'cifra-compleja',
    etiqueta: 'Cifra complicada',
    icono: '🔢',
    severidadBase: 'media',
    descripcion: 'Decimales, porcentajes, números romanos o cantidades muy grandes.',
  },
  {
    id: 'sigla',
    etiqueta: 'Sigla sin explicar',
    icono: '🔠',
    severidadBase: 'media',
    descripcion: 'La primera vez que aparece una sigla hay que decir qué significa.',
  },
  {
    id: 'abreviatura',
    etiqueta: 'Abreviatura',
    icono: '✂️',
    severidadBase: 'baja',
    descripcion: 'Obligan a descifrar. Se escriben completas.',
  },
  {
    id: 'figurado',
    etiqueta: 'Lenguaje figurado',
    icono: '🎭',
    severidadBase: 'alta',
    descripcion: 'Metáforas y frases hechas que no se entienden de forma literal.',
  },
  {
    id: 'doble-negacion',
    etiqueta: 'Doble negación',
    icono: '⛔',
    severidadBase: 'alta',
    descripcion: 'Dos negaciones en la misma frase obligan a rehacer el razonamiento.',
  },
  {
    id: 'extranjerismo',
    etiqueta: 'Palabra extranjera',
    icono: '🌍',
    severidadBase: 'media',
    descripcion: 'Tiene equivalente en español y no todo el mundo la conoce.',
  },
  {
    id: 'referencia-ambigua',
    etiqueta: 'Referencia ambigua',
    icono: '❓',
    severidadBase: 'baja',
    descripcion: 'La frase empieza señalando algo anterior sin nombrarlo.',
  },
  {
    id: 'parrafo-largo',
    etiqueta: 'Párrafo largo',
    icono: '📄',
    severidadBase: 'media',
    descripcion: 'Más de 5 frases o de 70 palabras seguidas sin respiro.',
  },
];

const REGLA_POR_ID: Record<ReglaId, InfoRegla> = REGLAS.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<ReglaId, InfoRegla>,
);

// ═══════════════════════════════════════════════════════════════════════
// DICCIONARIOS
// ═══════════════════════════════════════════════════════════════════════

/** Términos administrativos, jurídicos y cultos con su alternativa cotidiana */
const TECNICISMOS: Record<string, string> = {
  abonar: 'pagar',
  acaecer: 'ocurrir',
  acreditar: 'demostrar',
  adjuntar: 'enviar junto a',
  aportar: 'entregar',
  alegaciones: 'respuesta',
  ulterior: 'posterior',
  cumplimentar: 'rellenar',
  subsanar: 'corregir',
  requerimiento: 'petición',
  notificación: 'aviso',
  interponer: 'presentar',
  personarse: 'ir en persona',
  ostentar: 'tener',
  coadyuvar: 'ayudar',
  sufragar: 'pagar',
  devengar: 'generar',
  preceptivo: 'obligatorio',
  perceptivo: 'obligatorio',
  facultativo: 'opcional',
  pertinente: 'adecuado',
  procedimiento: 'proceso',
  tramitación: 'trámite',
  estipular: 'fijar',
  formalizar: 'firmar',
  suscribir: 'firmar',
  otorgar: 'dar',
  denegar: 'rechazar',
  resolución: 'decisión',
  prescripción: 'plazo que vence',
  caducidad: 'fecha en que deja de valer',
  fehaciente: 'con prueba',
  íntegro: 'completo',
  íntegramente: 'por completo',
  asimismo: 'también',
  no_obstante: 'pero',
  susceptible: 'que puede',
  previsto: 'planeado',
  vigente: 'que está en uso',
  derogar: 'anular',
  eximir: 'librar',
  computar: 'contar',
  cuantía: 'cantidad',
  importe: 'cantidad de dinero',
  emolumentos: 'sueldo',
  domicilio: 'casa',
  progenitor: 'padre o madre',
  cónyuge: 'pareja casada',
  descendiente: 'hijo o hija',
  ascendiente: 'padre, madre, abuelo o abuela',
  discrepancia: 'diferencia',
  incidencia: 'problema',
  contemplar: 'incluir',
  disponer: 'tener',
  proceder: 'hacer',
  ejecutar: 'hacer',
  finalidad: 'para qué sirve',
  objeto: 'para qué es',
  ámbito: 'zona',
  paliar: 'reducir',
  mitigar: 'reducir',
  optimizar: 'mejorar',
  implementar: 'poner en marcha',
  idóneo: 'adecuado',
  óptimo: 'el mejor',
  aludir: 'referirse',
  discernir: 'distinguir',
  dilucidar: 'aclarar',
  concerniente: 'sobre',
  atinente: 'sobre',
  precedente: 'anterior',
  sendos: 'uno cada uno',
  exhaustivo: 'completo',
  pormenorizado: 'con detalle',
  recabar: 'pedir',
  solventar: 'resolver',
  subvenir: 'atender',
  perentorio: 'urgente',
  inexcusable: 'obligatorio',
};

/** Extranjerismos frecuentes con equivalente en español */
const EXTRANJERISMOS: Record<string, string> = {
  link: 'enlace',
  email: 'correo electrónico',
  online: 'por internet',
  offline: 'sin conexión',
  feedback: 'comentarios',
  ranking: 'lista ordenada',
  workshop: 'taller',
  meeting: 'reunión',
  briefing: 'resumen',
  deadline: 'fecha límite',
  target: 'público',
  test: 'prueba',
  software: 'programa',
  hardware: 'equipo',
  password: 'contraseña',
  login: 'acceso',
  parking: 'aparcamiento',
  hobby: 'afición',
  staff: 'personal',
  planning: 'planificación',
};

/** Locuciones y metáforas que no se entienden de forma literal */
const FIGURADO: { expresion: string; alternativa: string }[] = [
  { expresion: 'dar luz verde', alternativa: 'autorizar' },
  { expresion: 'poner en marcha', alternativa: 'empezar' },
  { expresion: 'hacer hincapié', alternativa: 'insistir' },
  { expresion: 'de cara a', alternativa: 'para' },
  { expresion: 'en aras de', alternativa: 'para' },
  { expresion: 'a corto plazo', alternativa: 'pronto' },
  { expresion: 'a largo plazo', alternativa: 'dentro de mucho tiempo' },
  { expresion: 'en el marco de', alternativa: 'dentro de' },
  { expresion: 'a la mayor brevedad', alternativa: 'lo antes posible' },
  { expresion: 'a tenor de', alternativa: 'según' },
  { expresion: 'en virtud de', alternativa: 'según' },
  { expresion: 'a efectos de', alternativa: 'para' },
  { expresion: 'sin perjuicio de', alternativa: 'aunque también' },
  { expresion: 'llegado el caso', alternativa: 'si pasa eso' },
  { expresion: 'echar una mano', alternativa: 'ayudar' },
  { expresion: 'tomar cartas en el asunto', alternativa: 'actuar' },
  { expresion: 'estar al día', alternativa: 'tener la información actualizada' },
  { expresion: 'a grandes rasgos', alternativa: 'en resumen' },
  { expresion: 'poner de manifiesto', alternativa: 'mostrar' },
  { expresion: 'tener en cuenta', alternativa: 'recordar' },
];

/** Conjunciones y locuciones que encadenan ideas dentro de una frase */
const CONECTORES_SUBORDINANTES = [
  'aunque', 'mientras', 'porque', 'ya que', 'puesto que', 'dado que',
  'por lo que', 'sin embargo', 'no obstante', 'si bien', 'de modo que',
  'de manera que', 'siempre que', 'en caso de que', 'a fin de que',
  'salvo que', 'excepto que', 'además de que', 'a pesar de que',
];

const ABREVIATURAS = [
  'etc.', 'pág.', 'págs.', 'art.', 'arts.', 'núm.', 'nº', 'sr.', 'sra.',
  'dr.', 'dra.', 'ej.', 'aprox.', 'aptdo.', 'avda.', 'c/', 'tel.', 'vs.',
];

/** Siglas tan asentadas que no exigen explicación en un texto general */
const SIGLAS_TOLERADAS = new Set(['TV', 'PC', 'CD', 'DVD', 'OK', 'ID', 'SMS', 'WIFI', 'USB']);

// ═══════════════════════════════════════════════════════════════════════
// MOTOR DE ANÁLISIS
// ═══════════════════════════════════════════════════════════════════════

const DIACRITICOS = /[̀-ͯ]/g;

/** Marca interna para proteger los puntos de las abreviaturas al partir en frases */
const MARCA_PUNTO = '';

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(DIACRITICOS, '');
}

/** Cuenta sílabas de forma aproximada: cada grupo vocálico es una sílaba */
function contarSilabas(palabra: string): number {
  // La í y la ú tildadas rompen el diptongo, así que se marcan como corte
  const conCortes = palabra.toLowerCase().replace(/[íú]/g, 'i|');
  const limpio = conCortes.normalize('NFD').replace(DIACRITICOS, '');
  const grupos = limpio
    .split('|')
    .flatMap((trozo) => trozo.match(/[aeiouy]+/g) ?? []);
  return Math.max(1, grupos.length);
}

function contarPalabras(texto: string): number {
  const encontradas = texto.match(/[\wÁÉÍÓÚÜÑáéíóúüñ]+/g);
  return encontradas ? encontradas.length : 0;
}

/** Divide en frases respetando las abreviaturas con punto */
function dividirFrases(texto: string): string[] {
  let protegido = texto;
  ABREVIATURAS.forEach((abrev) => {
    if (!abrev.includes('.')) return;
    // El punto de la abreviatura se marca para que no cuente como fin de frase
    const conMarca = abrev.split('.').join(MARCA_PUNTO);
    protegido = protegido.split(abrev).join(conMarca);
    const capitalizada = abrev.charAt(0).toUpperCase() + abrev.slice(1);
    protegido = protegido
      .split(capitalizada)
      .join(capitalizada.split('.').join(MARCA_PUNTO));
  });

  return protegido
    .split(/(?<=[.!?…])\s+/)
    .map((f) => f.split(MARCA_PUNTO).join('.').trim())
    .filter((f) => f.length > 0);
}

function dividirParrafos(texto: string): string[] {
  return texto
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function analizarFrase(frase: string, palabrasFrase: number, esPrimeraDelTexto: boolean): Aviso[] {
  const avisos: Aviso[] = [];
  const plano = normalizar(frase);

  // 1 — Longitud
  if (palabrasFrase > 25) {
    avisos.push({
      regla: 'frase-larga',
      detalle: `${palabrasFrase} palabras`,
      sugerencia: 'Divídela en tres o cuatro frases. Cada una con una sola idea.',
    });
  } else if (palabrasFrase > 15) {
    avisos.push({
      regla: 'frase-larga',
      detalle: `${palabrasFrase} palabras`,
      sugerencia: 'Busca dónde cortarla en dos. La referencia es no pasar de 15 palabras.',
    });
  }

  // 2 — Varias ideas encadenadas
  const conectoresPresentes = CONECTORES_SUBORDINANTES.filter((c) => plano.includes(` ${c} `));
  if (conectoresPresentes.length > 0 && palabrasFrase > 12) {
    avisos.push({
      regla: 'varias-ideas',
      detalle: conectoresPresentes.map((c) => `«${c}»`).join(', '),
      sugerencia: 'Corta por el conector y convierte cada parte en una frase independiente.',
    });
  }

  // 3 — Voz pasiva y pasiva refleja
  const pasivaPerifrastica = frase.match(
    /\b(es|son|era|eran|fue|fueron|será|serán|ha sido|han sido|había sido|habían sido|sea|sean)\s+[a-záéíóúñ]+(ado|ada|ados|adas|ido|ida|idos|idas)\b/gi,
  );
  const pasivaRefleja = frase.match(
    /\bse\s+[a-záéíóúñ]+(ará|arán|erá|erán|irá|irán|ó|aron|ieron)\b/gi,
  );
  const pasivas = [...(pasivaPerifrastica ?? []), ...(pasivaRefleja ?? [])];
  if (pasivas.length > 0) {
    avisos.push({
      regla: 'voz-pasiva',
      detalle: pasivas.map((p) => `«${p.trim()}»`).join(', '),
      sugerencia: 'Ponlo en activa: di primero quién hace la acción y después qué hace.',
    });
  }

  // 4 — Palabras muy largas
  const palabras = frase.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g) ?? [];
  const largas = Array.from(
    new Set(palabras.filter((p) => p.length > 9 && contarSilabas(p) >= 5)),
  );
  if (largas.length > 0) {
    avisos.push({
      regla: 'palabra-larga',
      detalle: largas.map((p) => `«${p}»`).join(', '),
      sugerencia: 'Busca una palabra más corta o explícala con otras palabras.',
    });
  }

  // 5 — Tecnicismos con alternativa
  const tecnicismosHallados = Object.keys(TECNICISMOS).filter((termino) => {
    const busca = normalizar(termino.replace('_', ' '));
    return new RegExp(`\\b${busca}`, 'i').test(plano);
  });
  if (tecnicismosHallados.length > 0) {
    avisos.push({
      regla: 'tecnicismo',
      detalle: tecnicismosHallados
        .map((t) => `«${t.replace('_', ' ')}» → ${TECNICISMOS[t]}`)
        .join(' · '),
      sugerencia: 'Sustitúyela por la alternativa, o mantenla y explícala justo después.',
    });
  }

  // 6 — Cifras complicadas
  const cifras: string[] = [];
  const decimales = frase.match(/\d+[.,]\d+/g);
  const porcentajes = frase.match(/\d+\s*%/g);
  const grandes = frase.match(/\b\d{5,}\b/g);
  const romanos = frase.match(/\b[IVXLCDM]{2,}\b/g);
  if (decimales) cifras.push(...decimales);
  if (porcentajes) cifras.push(...porcentajes);
  if (grandes) cifras.push(...grandes);
  if (romanos) cifras.push(...romanos);
  if (cifras.length > 0) {
    avisos.push({
      regla: 'cifra-compleja',
      detalle: cifras.map((c) => `«${c.trim()}»`).join(', '),
      sugerencia: 'Redondea, usa números arábigos y compara con algo conocido: «casi todos», «la mitad».',
    });
  }

  // 7 — Siglas sin explicar
  const siglas = (frase.match(/\b[A-ZÁÉÍÓÚÑ]{2,6}\b/g) ?? []).filter(
    (s) => !SIGLAS_TOLERADAS.has(s) && !(esPrimeraDelTexto && frase.trim().startsWith(s)),
  );
  const siglasSinExplicar = Array.from(new Set(siglas)).filter(
    (s) => !new RegExp(`${s}\\s*\\(`).test(frase) && !new RegExp(`\\)\\s*${s}`).test(frase),
  );
  if (siglasSinExplicar.length > 0) {
    avisos.push({
      regla: 'sigla',
      detalle: siglasSinExplicar.map((s) => `«${s}»`).join(', '),
      sugerencia: 'Escribe el nombre completo la primera vez y la sigla entre paréntesis.',
    });
  }

  // 8 — Abreviaturas
  const abreviaturasHalladas = ABREVIATURAS.filter((a) => plano.includes(normalizar(a)));
  if (abreviaturasHalladas.length > 0) {
    avisos.push({
      regla: 'abreviatura',
      detalle: abreviaturasHalladas.map((a) => `«${a}»`).join(', '),
      sugerencia: 'Escríbela completa: «etcétera», «página», «artículo», «número».',
    });
  }

  // 9 — Lenguaje figurado
  const figuradoHallado = FIGURADO.filter((f) => plano.includes(normalizar(f.expresion)));
  if (figuradoHallado.length > 0) {
    avisos.push({
      regla: 'figurado',
      detalle: figuradoHallado.map((f) => `«${f.expresion}» → ${f.alternativa}`).join(' · '),
      sugerencia: 'Dilo de forma literal: quien lee no tiene por qué compartir la imagen.',
    });
  }

  // 10 — Doble negación
  if (/\bno\b[^.]{0,70}\b(sin|nunca|nada|ningun[ao]?|ninguno|tampoco|jamas)\b/.test(plano)) {
    avisos.push({
      regla: 'doble-negacion',
      detalle: 'Dos negaciones en la misma frase',
      sugerencia: 'Reescríbela en positivo: di lo que sí ocurre o lo que sí hay que hacer.',
    });
  }

  // 11 — Extranjerismos
  const extranjerosHallados = Object.keys(EXTRANJERISMOS).filter((e) =>
    new RegExp(`\\b${e}\\b`, 'i').test(plano),
  );
  if (extranjerosHallados.length > 0) {
    avisos.push({
      regla: 'extranjerismo',
      detalle: extranjerosHallados.map((e) => `«${e}» → ${EXTRANJERISMOS[e]}`).join(' · '),
      sugerencia: 'Usa la palabra en español.',
    });
  }

  // 12 — Referencia ambigua al principio de la frase
  if (/^(esto|este|esta|estos|estas|aquello|aquel|dicho|dicha|dichos|el mismo|la misma|los mismos)\b/.test(plano)) {
    avisos.push({
      regla: 'referencia-ambigua',
      detalle: 'La frase empieza señalando algo anterior',
      sugerencia: 'Repite el nombre de aquello a lo que te refieres, aunque suene redundante.',
    });
  }

  return avisos;
}

const RECUENTO_VACIO = REGLAS.reduce(
  (acc, r) => ({ ...acc, [r.id]: 0 }),
  {} as Record<ReglaId, number>,
);

function analizar(texto: string): Analisis {
  const parrafosTexto = dividirParrafos(texto);
  const frases: FraseAnalizada[] = [];
  const parrafos: Analisis['parrafos'] = [];
  let indiceFrase = 0;

  parrafosTexto.forEach((parrafo, idxParrafo) => {
    const frasesParrafo = dividirFrases(parrafo);
    const palabrasParrafo = contarPalabras(parrafo);
    const avisosParrafo: Aviso[] = [];

    if (frasesParrafo.length > 5 || palabrasParrafo > 70) {
      avisosParrafo.push({
        regla: 'parrafo-largo',
        detalle: `${frasesParrafo.length} frases y ${palabrasParrafo} palabras`,
        sugerencia: 'Parte el párrafo. En lectura fácil cada párrafo desarrolla una sola idea.',
      });
    }

    frasesParrafo.forEach((frase) => {
      const palabras = contarPalabras(frase);
      frases.push({
        indice: indiceFrase,
        texto: frase,
        palabras,
        parrafo: idxParrafo,
        avisos: analizarFrase(frase, palabras, indiceFrase === 0),
      });
      indiceFrase += 1;
    });

    parrafos.push({
      indice: idxParrafo,
      frases: frasesParrafo.length,
      palabras: palabrasParrafo,
      avisos: avisosParrafo,
    });
  });

  const recuento = { ...RECUENTO_VACIO };
  frases.forEach((f) => f.avisos.forEach((a) => { recuento[a.regla] += 1; }));
  parrafos.forEach((p) => p.avisos.forEach((a) => { recuento[a.regla] += 1; }));

  const totalPalabras = contarPalabras(texto);
  const totalFrases = frases.length;

  // Sustituciones concretas encontradas, sin repetir
  const sustituciones: { termino: string; alternativa: string }[] = [];
  const vistos = new Set<string>();
  const plano = normalizar(texto);
  Object.entries(TECNICISMOS).forEach(([termino, alternativa]) => {
    const busca = normalizar(termino.replace('_', ' '));
    if (new RegExp(`\\b${busca}`).test(plano) && !vistos.has(termino)) {
      vistos.add(termino);
      sustituciones.push({ termino: termino.replace('_', ' '), alternativa });
    }
  });
  Object.entries(EXTRANJERISMOS).forEach(([termino, alternativa]) => {
    if (new RegExp(`\\b${termino}\\b`).test(plano) && !vistos.has(termino)) {
      vistos.add(termino);
      sustituciones.push({ termino, alternativa });
    }
  });
  FIGURADO.forEach(({ expresion, alternativa }) => {
    if (plano.includes(normalizar(expresion)) && !vistos.has(expresion)) {
      vistos.add(expresion);
      sustituciones.push({ termino: expresion, alternativa });
    }
  });

  return {
    frases,
    parrafos,
    totalPalabras,
    totalFrases,
    mediaPalabras: totalFrases > 0 ? totalPalabras / totalFrases : 0,
    frasesConformes: frases.filter((f) => f.avisos.length === 0).length,
    recuentoPorRegla: recuento,
    sustituciones,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// TEXTO DE EJEMPLO
// ═══════════════════════════════════════════════════════════════════════

const TEXTO_EJEMPLO = `La solicitud de la ayuda será revisada por el órgano competente en el plazo de tres meses desde su presentación, sin perjuicio de que se requiera documentación adicional para subsanar las deficiencias observadas.

Si transcurrido dicho plazo no se hubiera dictado resolución expresa, la solicitud se entenderá desestimada, sin que ello impida que el interesado pueda interponer el recurso que estime pertinente ante la instancia superior.

Aproximadamente el 68,4 % de las personas solicitantes cumplimentan correctamente el formulario. No obstante, conviene tener en cuenta que la documentación acreditativa deberá aportarse íntegramente antes de la fecha límite, a fin de que el procedimiento pueda continuar su tramitación ordinaria.`;

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function RevisorLecturaFacilPage() {
  const [texto, setTexto] = useState('');
  const [filtro, setFiltro] = useState<ReglaId | 'todos'>('todos');
  const [copiado, setCopiado] = useState(false);

  const analisis = useMemo(() => (texto.trim() ? analizar(texto) : null), [texto]);

  const reglasConAvisos = useMemo(
    () => (analisis ? REGLAS.filter((r) => analisis.recuentoPorRegla[r.id] > 0) : []),
    [analisis],
  );

  const frasesVisibles = useMemo(() => {
    if (!analisis) return [];
    if (filtro === 'todos') return analisis.frases;
    return analisis.frases.filter((f) => f.avisos.some((a) => a.regla === filtro));
  }, [analisis, filtro]);

  const totalAvisos = useMemo(
    () =>
      analisis
        ? Object.values(analisis.recuentoPorRegla).reduce((suma, n) => suma + n, 0)
        : 0,
    [analisis],
  );

  const porcentajeConformes = useMemo(() => {
    if (!analisis || analisis.totalFrases === 0) return 0;
    return (analisis.frasesConformes / analisis.totalFrases) * 100;
  }, [analisis]);

  const copiarInforme = async () => {
    if (!analisis) return;
    const lineas: string[] = [
      'INFORME DE REVISIÓN — LECTURA FÁCIL',
      '',
      `Palabras: ${analisis.totalPalabras}`,
      `Frases: ${analisis.totalFrases}`,
      `Media de palabras por frase: ${formatNumber(analisis.mediaPalabras, 1)}`,
      `Frases sin ningún aviso: ${analisis.frasesConformes} de ${analisis.totalFrases}`,
      '',
      'AVISOS POR TIPO',
      ...reglasConAvisos.map(
        (r) => `- ${r.etiqueta}: ${analisis.recuentoPorRegla[r.id]}`,
      ),
      '',
      'DETALLE POR FRASE',
      ...analisis.frases.flatMap((f) =>
        f.avisos.length === 0
          ? []
          : [
              '',
              `Frase ${f.indice + 1} (${f.palabras} palabras): ${f.texto}`,
              ...f.avisos.map(
                (a) => `   · ${REGLA_POR_ID[a.regla].etiqueta}: ${a.detalle} → ${a.sugerencia}`,
              ),
            ],
      ),
    ];

    try {
      await navigator.clipboard.writeText(lineas.join('\n'));
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Revisor de lectura fácil</h1>
        <p className={styles.subtitle}>
          Pega un texto y te digo qué frase falla y por qué regla. No devuelve una nota: señala el
          problema concreto y propone una alternativa.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        title="Esto no valida un texto de lectura fácil"
        collapsible
        context="revisor-lectura-facil"
      >
        <p>
          Ninguna herramienta automática puede certificar que un texto sea de lectura fácil. La norma
          UNE 153101:2018 EX establece que la <strong>validación la hacen personas con dificultades
          de comprensión</strong>, que leen el texto y confirman si lo entienden. Este revisor hace
          solo la parte mecánica: encontrar frases largas, tecnicismos y siglas antes de llevar el
          texto a esa validación.
        </p>
        <p>
          Las comprobaciones se inspiran en la UNE 153101:2018 EX y en las pautas de Inclusion Europe
          e IFLA, pero son una aproximación automática: puede marcar como problema algo que en
          contexto está bien, y puede pasar por alto una frase confusa que gramaticalmente es simple.
        </p>
      </DisclaimerCard>

      {/* ══════════ ENTRADA ══════════ */}
      <section className={styles.panel} aria-label="Texto que se va a revisar">
        <div className={styles.panelCabecera}>
          <h2 className={styles.panelTitulo}>Tu texto</h2>
          <div className={styles.accionesCabecera}>
            <button type="button" className={styles.btnSecundario} onClick={() => setTexto(TEXTO_EJEMPLO)}>
              Cargar ejemplo
            </button>
            {texto && (
              <button type="button" className={styles.btnSecundario} onClick={() => setTexto('')}>
                Borrar
              </button>
            )}
          </div>
        </div>

        <label className={styles.etiquetaVisible} htmlFor="texto-revisar">
          Escribe o pega aquí el texto que quieres revisar
        </label>
        <textarea
          id="texto-revisar"
          className={styles.textarea}
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          rows={10}
          placeholder="Pega aquí el texto…"
          spellCheck
        />
        <p className={styles.notaPrivacidad}>
          <span aria-hidden="true">🔒</span> El análisis ocurre en tu navegador. El texto no se envía
          a ningún servidor ni se guarda en ningún sitio.
        </p>
      </section>

      {analisis && analisis.totalFrases > 0 && (
        <>
          {/* ══════════ MÉTRICAS ══════════ */}
          <section className={styles.metricasPanel} aria-live="polite">
            <div className={styles.metricasGrid}>
              <div className={styles.metricaCard}>
                <span className={styles.metricaValor}>
                  {analisis.frasesConformes} <span className={styles.metricaDe}>de {analisis.totalFrases}</span>
                </span>
                <span className={styles.metricaLabel}>frases sin ningún aviso</span>
                <div className={styles.barra}>
                  <div
                    className={styles.barraRelleno}
                    style={{ width: `${porcentajeConformes}%` }}
                  />
                </div>
                <span className={styles.metricaNota}>
                  {formatNumber(porcentajeConformes, 0)} % del texto
                </span>
              </div>

              <div className={styles.metricaCard}>
                <span className={styles.metricaValor}>{formatNumber(analisis.mediaPalabras, 1)}</span>
                <span className={styles.metricaLabel}>palabras por frase de media</span>
                <span className={styles.metricaNota}>
                  {analisis.mediaPalabras <= 15
                    ? 'Dentro de la referencia de 15 palabras'
                    : 'Por encima de la referencia de 15 palabras'}
                </span>
              </div>

              <div className={styles.metricaCard}>
                <span className={styles.metricaValor}>{totalAvisos}</span>
                <span className={styles.metricaLabel}>avisos en total</span>
                <span className={styles.metricaNota}>
                  repartidos en {reglasConAvisos.length}{' '}
                  {reglasConAvisos.length === 1 ? 'regla distinta' : 'reglas distintas'}
                </span>
              </div>

              <div className={styles.metricaCard}>
                <span className={styles.metricaValor}>{analisis.totalPalabras}</span>
                <span className={styles.metricaLabel}>palabras</span>
                <span className={styles.metricaNota}>
                  en {analisis.parrafos.length}{' '}
                  {analisis.parrafos.length === 1 ? 'párrafo' : 'párrafos'}
                </span>
              </div>
            </div>

            <div className={styles.accionesInforme}>
              <button type="button" className={styles.btnPrimario} onClick={copiarInforme}>
                <span aria-hidden="true">📋</span> Copiar informe completo
              </button>
              {copiado && (
                <span className={styles.copiadoOk} role="status">
                  Informe copiado al portapapeles
                </span>
              )}
            </div>
          </section>

          {/* ══════════ FILTROS ══════════ */}
          {reglasConAvisos.length > 0 && (
            <section className={styles.filtrosPanel} aria-label="Filtrar por tipo de aviso">
              <h2 className={styles.panelTitulo}>Revisa una regla cada vez</h2>
              <div className={styles.filtrosGrid}>
                <button
                  type="button"
                  aria-pressed={filtro === 'todos'}
                  className={`${styles.filtroBtn} ${filtro === 'todos' ? styles.filtroActivo : ''}`}
                  onClick={() => setFiltro('todos')}
                >
                  Todas ({totalAvisos})
                </button>
                {reglasConAvisos.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={filtro === r.id}
                    className={`${styles.filtroBtn} ${styles[`sev-${r.severidadBase}`]} ${filtro === r.id ? styles.filtroActivo : ''}`}
                    onClick={() => setFiltro(r.id)}
                  >
                    <span aria-hidden="true">{r.icono}</span> {r.etiqueta} (
                    {analisis.recuentoPorRegla[r.id]})
                  </button>
                ))}
              </div>
              {filtro !== 'todos' && (
                <p className={styles.descripcionRegla}>{REGLA_POR_ID[filtro].descripcion}</p>
              )}
            </section>
          )}

          {/* Los avisos de parrafo solo aplican cuando se ve todo o esa regla concreta */}
          {(filtro === 'todos' || filtro === 'parrafo-largo') &&
            analisis.parrafos
              .filter((p) => p.avisos.length > 0)
              .map((p) => (
                <div key={p.indice} className={styles.avisoParrafo}>
                  <span aria-hidden="true">📄</span> <strong>Párrafo {p.indice + 1}:</strong>{' '}
                  {p.avisos[0].detalle}. {p.avisos[0].sugerencia}
                </div>
              ))}

          {/* ══════════ FRASES ══════════ */}
          <section className={styles.frasesPanel} aria-label="Análisis frase a frase">
            <h2 className={styles.panelTitulo}>
              {filtro === 'todos'
                ? 'El texto, frase a frase'
                : `Frases con el aviso «${REGLA_POR_ID[filtro].etiqueta}»`}
            </h2>

            {frasesVisibles.length === 0 ? (
              <p className={styles.sinResultados}>No hay frases con ese aviso.</p>
            ) : (
              <ol className={styles.listaFrases}>
                {frasesVisibles.map((f) => (
                  <li
                    key={f.indice}
                    className={`${styles.fraseItem} ${f.avisos.length === 0 ? styles.fraseOk : ''}`}
                  >
                    <div className={styles.fraseCabecera}>
                      <span className={styles.fraseNumero}>{f.indice + 1}</span>
                      <span className={styles.frasePalabras}>{f.palabras} palabras</span>
                    </div>
                    <p className={styles.fraseTexto}>{f.texto}</p>

                    {f.avisos.length === 0 ? (
                      <p className={styles.fraseSinAvisos}>
                        <span aria-hidden="true">✅</span> Sin avisos.
                      </p>
                    ) : (
                      <ul className={styles.avisosLista}>
                        {f.avisos
                          .filter((a) => filtro === 'todos' || a.regla === filtro)
                          .map((a) => {
                            const regla = REGLA_POR_ID[a.regla];
                            return (
                              <li
                                key={`${f.indice}-${a.regla}`}
                                className={`${styles.avisoItem} ${styles[`sev-${regla.severidadBase}`]}`}
                              >
                                <p className={styles.avisoTitulo}>
                                  <span aria-hidden="true">{regla.icono}</span> {regla.etiqueta}:{' '}
                                  <span className={styles.avisoDetalle}>{a.detalle}</span>
                                </p>
                                <p className={styles.avisoSugerencia}>{a.sugerencia}</p>
                              </li>
                            );
                          })}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* ══════════ SUSTITUCIONES ══════════ */}
          {analisis.sustituciones.length > 0 && (
            <section className={styles.sustitucionesPanel}>
              <h2 className={styles.panelTitulo}>Cambios concretos que puedes hacer ya</h2>
              <p className={styles.notaCampo}>
                Cada palabra o expresión difícil encontrada en el texto, con su alternativa. La
                alternativa es una propuesta: revisa que encaje en el contexto antes de aplicarla.
              </p>
              <div className={styles.tableWrapper}>
                <table className={styles.sustitucionesTable}>
                  <thead>
                    <tr>
                      <th>Dice</th>
                      <th>Puede decir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analisis.sustituciones.map((s) => (
                      <tr key={s.termino}>
                        <td>{s.termino}</td>
                        <td>
                          <strong>{s.alternativa}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* ══════════ QUÉ COMPRUEBA ══════════ */}
      <section className={styles.reglasPanel}>
        <h2 className={styles.panelTitulo}>Las trece comprobaciones</h2>
        <div className={styles.reglasGrid}>
          {REGLAS.map((r) => (
            <div key={r.id} className={`${styles.reglaCard} ${styles[`sev-${r.severidadBase}`]}`}>
              <h3>
                <span aria-hidden="true">{r.icono}</span> {r.etiqueta}
              </h3>
              <p>{r.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CONTENIDO EDUCATIVO ══════════ */}
      <EducationalSection
        icon="📖"
        title="Cómo se escribe en lectura fácil"
        subtitle="Qué es, en qué se diferencia del lenguaje claro y cómo se valida"
      >
        <section className={styles.introSection}>
          <h2>Lectura fácil no es escribir más sencillo: es escribir para alguien</h2>
          <p>
            La lectura fácil es un método de redacción, diseño y validación pensado para que un texto
            sea comprensible por personas con dificultades de comprensión lectora. El público no es
            uno solo: personas con discapacidad intelectual, con deterioro cognitivo, con afasia,
            quienes están aprendiendo el idioma y quienes tienen baja alfabetización. Lo que une a
            todos es que un texto administrativo corriente les deja fuera.
          </p>
          <p>
            La diferencia con el <strong>lenguaje claro</strong> es de grado y de método. El lenguaje
            claro busca que un lector medio entienda un texto a la primera y se queda en la
            redacción. La lectura fácil añade reglas más estrictas —una idea por frase, nada de
            metáforas, cada palabra difícil explicada— y, sobre todo, añade un paso que el lenguaje
            claro no tiene: <strong>la validación por personas usuarias</strong>.
          </p>
          <p>
            Esa es la razón de que esta herramienta no puntúe ni certifique. Encuentra lo mecánico
            —lo que se puede detectar contando palabras y buscando patrones— para que el tiempo de la
            validación se dedique a lo único que un programa no puede hacer: comprobar si se ha
            entendido.
          </p>
        </section>

        <section className={styles.comparativaSection}>
          <h2>Lenguaje claro, lectura fácil y texto administrativo</h2>
          <p className={styles.comparativaSubtitle}>
            Tres formas de escribir lo mismo, con exigencias distintas.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th></th>
                  <th>Texto administrativo</th>
                  <th>Lenguaje claro</th>
                  <th>Lectura fácil</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Para quién</strong></td>
                  <td>Otro profesional del ramo</td>
                  <td>Cualquier lector adulto</td>
                  <td>Personas con dificultades de comprensión</td>
                </tr>
                <tr>
                  <td><strong>Longitud de frase</strong></td>
                  <td>Sin límite</td>
                  <td>20-25 palabras</td>
                  <td>Hasta 15, una idea por frase</td>
                </tr>
                <tr>
                  <td><strong>Vocabulario</strong></td>
                  <td>Técnico y preciso</td>
                  <td>Común, tecnicismos explicados</td>
                  <td>Cotidiano; cada palabra difícil, explicada</td>
                </tr>
                <tr>
                  <td><strong>Metáforas</strong></td>
                  <td>Frecuentes y no marcadas</td>
                  <td>Se admiten con moderación</td>
                  <td>Se evitan siempre</td>
                </tr>
                <tr>
                  <td><strong>Maquetación</strong></td>
                  <td>No forma parte del método</td>
                  <td>Recomendaciones generales</td>
                  <td>Parte de la norma: tipografía, interlineado, imágenes de apoyo</td>
                </tr>
                <tr>
                  <td><strong>Validación</strong></td>
                  <td>Revisión jurídica</td>
                  <td>Revisión editorial</td>
                  <td>Personas usuarias confirman que lo entienden</td>
                </tr>
                <tr>
                  <td><strong>Referencia</strong></td>
                  <td>Normativa del sector</td>
                  <td>Guías de estilo</td>
                  <td>UNE 153101:2018 EX · Inclusion Europe · IFLA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.escenariosSection}>
          <h2>Cuatro situaciones donde esta revisión ahorra trabajo</h2>
          <p className={styles.escenariosSubtitle}>
            Perfiles reales de quien necesita adaptar un texto.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
                <h3>Administración: una carta que nadie entiende</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Una notificación genera decenas de llamadas preguntando qué hay que hacer. Pasarla por
                aquí señala de golpe las tres frases de 40 palabras y los seis tecnicismos que están
                causando esas llamadas.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Empieza por:</strong> las frases con voz pasiva. Decir quién hace qué suele
                resolver la mitad de las dudas.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🗣️</span>
                <h3>Logopedia y apoyo educativo</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Necesitas adaptar un material de clase para una persona concreta. La revisión te da
                la lista de palabras que habrá que trabajar antes, no solo un texto más corto.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Ojo:</strong> lo que aquí sale como «palabra larga» puede ser precisamente la
                palabra que interesa enseñar. Decide tú, no la herramienta.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✍️</span>
                <h3>Adaptación profesional a lectura fácil</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Trabajas con textos que irán a validación. Limpiar antes lo mecánico hace que la
                sesión con personas validadoras se dedique a la comprensión y no a tropezar con
                siglas.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Flujo útil:</strong> revisar, reescribir, volver a revisar y solo entonces
                convocar la validación.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌐</span>
                <h3>Contenidos web accesibles</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Las pautas WCAG piden un nivel de lectura razonable o una versión alternativa más
                sencilla. Esta revisión ayuda a decidir qué páginas necesitan esa versión.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Prioriza:</strong> formularios, avisos legales y pasos de un trámite. Ahí es
                donde no entender tiene consecuencias.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Cuántas palabras puede tener una frase?</p>
              <p className={styles.faqAnswer}>
                La referencia habitual es no pasar de 15 y expresar una sola idea. No es una regla
                matemática: una frase de 18 palabras con estructura simple puede leerse mejor que una
                de 12 llena de subordinadas. Por eso aquí se avisa a partir de 15 y se marca como
                grave a partir de 25, pero además se señalan aparte las frases que encadenan ideas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Por qué se desaconseja la voz pasiva?</p>
              <p className={styles.faqAnswer}>
                Porque invierte el orden natural y esconde quién actúa. «La solicitud será revisada
                por el departamento» obliga a reconstruir quién revisa. En activa —«el departamento
                revisa tu solicitud»— se entiende de una pasada. La pasiva refleja («se revisarán las
                solicitudes») tiene el mismo problema y además borra al responsable.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Puede certificar que mi texto es de lectura fácil?</p>
              <p className={styles.faqAnswer}>
                No, y ninguna herramienta automática puede. La UNE 153101:2018 EX establece que la
                validación la hacen personas con dificultades de comprensión leyendo el texto. Un
                revisor automático encuentra lo mecánico; la comprensión real solo la confirma quien
                lee.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Qué hago con las cifras y los porcentajes?</p>
              <p className={styles.faqAnswer}>
                Se prefieren números redondos y expresiones cotidianas. En vez de «el 73,5 % de los
                solicitantes», «casi todas las personas que lo piden». Los romanos se sustituyen por
                arábigos, los decimales se evitan y las cantidades grandes se redondean o se comparan
                con algo conocido.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Mi texto se envía a algún sitio?</p>
              <p className={styles.faqAnswer}>
                No. Todo el análisis se ejecuta en tu navegador con el código de la propia página. El
                texto no viaja a ningún servidor, no se almacena y desaparece al cerrar la pestaña.
                Puedes comprobarlo desactivando la conexión: la revisión sigue funcionando.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqQuestion}>¿Y si marca como error algo que está bien?</p>
              <p className={styles.faqAnswer}>
                Pasa, y conviene contar con ello. Las reglas se aplican por patrones, sin entender el
                significado: una palabra larga puede ser justo la que hay que usar, y una sigla puede
                estar explicada dos frases más arriba. Los avisos son una lista de cosas que mirar,
                no una lista de cosas que cambiar.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guiaSection}>
          <h2>Guía paso a paso</h2>
          <p className={styles.guiaSubtitle}>
            El orden en que conviene atacar un texto difícil.
          </p>
          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Decide qué quieres que la persona haga</h3>
                <p>
                  Antes de tocar una coma: ¿qué tiene que entender y qué tiene que hacer después de
                  leer? Lo que no sirva a eso probablemente sobre. Adaptar no es traducir palabra por
                  palabra, es reconstruir el mensaje.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Parte las frases largas</h3>
                <p>
                  Empieza por las de más de 25 palabras. Corta por los conectores: cada «que»,
                  «aunque» o «sin perjuicio de» suele marcar el punto donde empieza otra idea que
                  merece su propia frase.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Pasa todo a voz activa</h3>
                <p>
                  Di quién hace la acción y ponlo al principio. Si no sabes quién es el sujeto, ese es
                  justamente el problema que el texto original estaba escondiendo.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Cambia o explica las palabras difíciles</h3>
                <p>
                  Usa la tabla de sustituciones como punto de partida. Cuando la palabra técnica sea
                  obligatoria por motivos legales, mantenla y explícala en la frase siguiente con
                  palabras corrientes.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Revisa cifras, siglas y ejemplos</h3>
                <p>
                  Redondea números, desarrolla las siglas la primera vez y añade un ejemplo concreto
                  donde haya una idea abstracta. Un ejemplo bien elegido aclara más que tres frases
                  de definición.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Valida con personas usuarias</h3>
                <p>
                  El paso que no puede saltarse. Personas con dificultades de comprensión leen el
                  texto y dicen qué han entendido. Lo que no se entienda se reescribe y se vuelve a
                  validar.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.tipsSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h3>Una idea por frase</h3>
              <p>
                Es la regla que más rinde. Si al leer en voz alta necesitas coger aire, hay más de una
                idea dentro.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <h3>Repite la palabra, no la sustituyas</h3>
              <p>
                El sinónimo elegante confunde. Si el texto habla de «la solicitud», que siga siendo
                «la solicitud» y no «la petición», «el escrito» o «la misma».
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h3>Un solo formato para fechas y números</h3>
              <p>
                Elige uno al principio y mantenlo en todo el documento. Cambiar de formato obliga a
                releer para comprobar que se ha entendido bien.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👥</span>
              <h3>Habla de tú a quien lee</h3>
              <p>
                «Tienes que entregar» se entiende antes que «el interesado deberá aportar». Nombrar a
                la persona directamente elimina un paso de interpretación.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <h3>Convierte los procesos en listas</h3>
              <p>
                Si hay pasos, que se vean como pasos. Un párrafo con cuatro requisitos escondidos es
                mucho más difícil que una lista con cuatro puntos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🖼️</span>
              <h3>La maquetación también cuenta</h3>
              <p>
                La lectura fácil incluye tipografía, interlineado y apoyos visuales. Un texto perfecto
                mal maquetado sigue sin cumplir el método.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <h2>
            <span aria-hidden="true">⚠️</span> Errores frecuentes al adaptar
          </h2>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir «más corto» con «más fácil».</strong> Resumir puede quitar justo la
              información que la persona necesitaba para actuar. A veces el texto adaptado es más
              largo que el original.
            </li>
            <li>
              <strong>Dar por válido lo que dice un revisor automático.</strong> Ninguna herramienta
              certifica lectura fácil. Sin validación con personas usuarias, no hay método completo.
            </li>
            <li>
              <strong>Usar sinónimos para no repetir.</strong> La variedad léxica es un valor
              literario, no de accesibilidad. Aquí repetir es correcto.
            </li>
            <li>
              <strong>Dejar las metáforas «que se entienden».</strong> «Dar luz verde» o «estar al
              día» no se entienden literalmente, y eso es exactamente el problema.
            </li>
            <li>
              <strong>Adaptar el texto y olvidar el diseño.</strong> Tipografía pequeña, líneas
              apretadas o texto justificado echan por tierra una adaptación buena.
            </li>
            <li>
              <strong>Infantilizar.</strong> El público es adulto. Simplificar la lengua no significa
              cambiar el tono ni tratar a la persona como si fuera menor de edad.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('revisor-lectura-facil')} />

      <ShareCard appName="revisor-lectura-facil" />

      <Footer appName="revisor-lectura-facil" />
    </div>
  );
}
