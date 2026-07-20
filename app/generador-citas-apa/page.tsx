'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './GeneradorCitasApa.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/* ══════════════════════════════════════════════════════════════════════
   TIPOS Y CONSTANTES
   ══════════════════════════════════════════════════════════════════════ */

type Norma = 'apa' | 'iso690' | 'vancouver' | 'icontec';
type TipoFuente =
  | 'libro'
  | 'capitulo'
  | 'articulo'
  | 'web'
  | 'tesis'
  | 'informe'
  | 'video'
  | 'ley'
  | 'redes';

/** Fragmento de una referencia. `em` marca cursiva real. */
interface Segmento {
  t: string;
  em?: boolean;
}

interface Autor {
  nombre: string;
  apellidos: string;
}

interface Datos {
  autores: Autor[];
  autorCorporativo: string;
  usarCorporativo: boolean;
  editores: Autor[];
  titulo: string;
  tituloContenedor: string;
  anio: string;
  sinFecha: boolean;
  fechaPub: string;
  fechaConsulta: string;
  edicion: string;
  editorial: string;
  lugar: string;
  volumen: string;
  numero: string;
  paginas: string;
  doi: string;
  url: string;
  tipoTesis: string;
  universidad: string;
  repositorio: string;
  numeroInforme: string;
  usuario: string;
  red: string;
  plataforma: string;
  nombreNorma: string;
  organo: string;
  objeto: string;
  publicacionOficial: string;
  paginaCita: string;
}

interface Entrada {
  id: string;
  norma: Norma;
  tipo: TipoFuente;
  segmentos: Segmento[];
  clave: string;
}

const NORMAS: { id: Norma; nombre: string; detalle: string; donde: string }[] = [
  { id: 'apa', nombre: 'APA 7.ª', detalle: 'Autor-fecha', donde: 'Psicología, educación y ciencias sociales' },
  { id: 'iso690', nombre: 'ISO 690', detalle: 'Autor-fecha o numérica', donde: 'Universidades de España y Europa' },
  { id: 'vancouver', nombre: 'Vancouver', detalle: 'Numérica', donde: 'Medicina y ciencias de la salud' },
  { id: 'icontec', nombre: 'ICONTEC', detalle: 'Nota al pie', donde: 'Colombia (NTC 1486 y 5613)' },
];

const TIPOS: { id: TipoFuente; nombre: string; icono: string }[] = [
  { id: 'libro', nombre: 'Libro', icono: '📕' },
  { id: 'capitulo', nombre: 'Capítulo de libro', icono: '📑' },
  { id: 'articulo', nombre: 'Artículo de revista', icono: '📄' },
  { id: 'web', nombre: 'Página web', icono: '🌐' },
  { id: 'tesis', nombre: 'Tesis', icono: '🎓' },
  { id: 'informe', nombre: 'Informe institucional', icono: '🏛️' },
  { id: 'video', nombre: 'Video de YouTube', icono: '🎬' },
  { id: 'ley', nombre: 'Ley o norma jurídica', icono: '⚖️' },
  { id: 'redes', nombre: 'Publicación en redes', icono: '💬' },
];

/**
 * Cobertura deliberadamente conservadora: solo se ofrece un tipo de fuente
 * cuando la norma tiene para él un formato documentado y estable.
 * ISO 690 y Vancouver no normalizan leyes ni redes sociales (dependen del
 * país o del estilo jurídico local), así que no aparecen en esas normas.
 */
const TIPOS_POR_NORMA: Record<Norma, TipoFuente[]> = {
  apa: ['libro', 'capitulo', 'articulo', 'web', 'tesis', 'informe', 'video', 'ley', 'redes'],
  iso690: ['libro', 'capitulo', 'articulo', 'web', 'tesis', 'informe', 'video'],
  vancouver: ['libro', 'capitulo', 'articulo', 'web', 'tesis', 'informe', 'video'],
  icontec: ['libro', 'capitulo', 'articulo', 'web', 'tesis', 'informe', 'video', 'ley'],
};

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const MESES_ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const DATOS_INICIALES: Datos = {
  autores: [{ nombre: '', apellidos: '' }],
  autorCorporativo: '',
  usarCorporativo: false,
  editores: [{ nombre: '', apellidos: '' }],
  titulo: '',
  tituloContenedor: '',
  anio: '',
  sinFecha: false,
  fechaPub: '',
  fechaConsulta: '',
  edicion: '',
  editorial: '',
  lugar: '',
  volumen: '',
  numero: '',
  paginas: '',
  doi: '',
  url: '',
  tipoTesis: 'Tesis doctoral',
  universidad: '',
  repositorio: '',
  numeroInforme: '',
  usuario: '',
  red: 'X (antes Twitter)',
  plataforma: 'YouTube',
  nombreNorma: '',
  organo: '',
  objeto: '',
  publicacionOficial: '',
  paginaCita: '',
};

const CLAVE_ALMACEN = 'meskeia-generador-citas-v1';

/* ══════════════════════════════════════════════════════════════════════
   UTILIDADES DE TEXTO Y FECHA
   ══════════════════════════════════════════════════════════════════════ */

const S = (t: string): Segmento => ({ t });
const EM = (t: string): Segmento => ({ t, em: true });

function hay(valor: string): boolean {
  return valor.trim().length > 0;
}

function lim(valor: string): string {
  return valor.trim();
}

/** Evita duplicar el punto cuando el dato ya termina en signo de cierre. */
function puntoFinal(texto: string): string {
  return /[.?!]$/.test(texto.trim()) ? texto.trim() : `${texto.trim()}.`;
}

function partesFecha(iso: string): { anio: string; mes: number; dia: number } | null {
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const mes = Number(m[2]) - 1;
  if (mes < 0 || mes > 11) return null;
  return { anio: m[1], mes, dia: Number(m[3]) };
}

function fechaLarga(iso: string): string {
  const p = partesFecha(iso);
  return p ? `${p.dia} de ${MESES[p.mes]} de ${p.anio}` : '';
}

function fechaCorta(iso: string): string {
  const p = partesFecha(iso);
  return p ? `${p.dia} ${MESES_ABREV[p.mes]} ${p.anio}` : '';
}

function iniciales(nombre: string): string {
  return lim(nombre)
    .split(/\s+/)
    .filter(Boolean)
    .map((parte) =>
      parte
        .split('-')
        .filter(Boolean)
        .map((trozo) => `${trozo.charAt(0).toLocaleUpperCase('es')}.`)
        .join('-')
    )
    .join(' ');
}

function inicialesJuntas(nombre: string): string {
  return lim(nombre)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toLocaleUpperCase('es'))
    .join('');
}

function autoresValidos(lista: Autor[]): Autor[] {
  return lista.filter((a) => hay(a.apellidos) || hay(a.nombre));
}

const SUPERINDICES = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
function superindice(n: number): string {
  return String(n)
    .split('')
    .map((c) => SUPERINDICES[Number(c)] ?? c)
    .join('');
}

/** Recorta el contenido de una publicación a las 20 primeras palabras (regla APA). */
function primerasVeintePalabras(texto: string): string {
  const palabras = lim(texto).split(/\s+/).filter(Boolean);
  if (palabras.length <= 20) return palabras.join(' ');
  return `${palabras.slice(0, 20).join(' ')} […]`;
}

function normalizarDoi(doi: string): string {
  const d = lim(doi);
  if (!d) return '';
  if (/^https?:\/\//i.test(d)) return d;
  return `https://doi.org/${d.replace(/^doi:\s*/i, '')}`;
}

/* ── Autores según cada norma ──────────────────────────────────────── */

function autorApa(a: Autor): string {
  const ape = lim(a.apellidos);
  const ini = iniciales(a.nombre);
  if (ape && ini) return `${ape}, ${ini}`;
  return ape || ini;
}

/** APA 7: hasta 20 autores; con 21 o más, los 19 primeros, puntos suspensivos y el último. */
function listaAutoresApa(autores: Autor[]): string {
  const n = autores.map(autorApa).filter(Boolean);
  if (n.length === 0) return '';
  if (n.length === 1) return n[0];
  if (n.length <= 20) return `${n.slice(0, -1).join(', ')}, y ${n[n.length - 1]}`;
  return `${n.slice(0, 19).join(', ')}, . . . ${n[n.length - 1]}`;
}

/** APA: en la posición «En … (Eds.)» las iniciales van delante del apellido. */
function listaEditoresApa(editores: Autor[]): string {
  const n = editores
    .map((e) => `${iniciales(e.nombre)} ${lim(e.apellidos)}`.trim())
    .filter(Boolean);
  if (n.length === 0) return '';
  if (n.length === 1) return n[0];
  return `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`;
}

function autorIso(a: Autor): string {
  const ape = lim(a.apellidos).toLocaleUpperCase('es');
  const nom = lim(a.nombre);
  if (ape && nom) return `${ape}, ${nom}`;
  return ape || nom;
}

/** ISO 690: hasta 3 autores se citan todos; con 4 o más, el primero y «et al.». */
function listaAutoresIso(autores: Autor[]): string {
  const n = autores.map(autorIso).filter(Boolean);
  if (n.length === 0) return '';
  if (n.length === 1) return n[0];
  if (n.length <= 3) return `${n.slice(0, -1).join('; ')} y ${n[n.length - 1]}`;
  return `${n[0]}, et al.`;
}

function autorVancouver(a: Autor): string {
  const ape = lim(a.apellidos);
  const ini = inicialesJuntas(a.nombre);
  if (ape && ini) return `${ape} ${ini}`;
  return ape || ini;
}

/** Vancouver (ICMJE): se listan los 6 primeros autores y luego «et al.». */
function listaAutoresVancouver(autores: Autor[]): string {
  const n = autores.map(autorVancouver).filter(Boolean);
  if (n.length === 0) return '';
  if (n.length <= 6) return n.join(', ');
  return `${n.slice(0, 6).join(', ')}, et al.`;
}

/** ICONTEC: hasta 3 autores; con más de 3, el primero seguido de «et al.». */
function listaAutoresIcontec(autores: Autor[]): string {
  const n = autores.map(autorIso).filter(Boolean);
  if (n.length === 0) return '';
  if (n.length === 1) return n[0];
  if (n.length <= 3) return `${n.slice(0, -1).join('; ')} y ${n[n.length - 1]}`;
  return `${n[0]}, et al.`;
}

/* ══════════════════════════════════════════════════════════════════════
   FORMATO DE REFERENCIAS — APA 7.ª EDICIÓN
   ══════════════════════════════════════════════════════════════════════ */

function anioEfectivo(d: Datos): string {
  if (d.sinFecha) return '';
  if (hay(d.anio)) return lim(d.anio);
  const p = partesFecha(d.fechaPub);
  return p ? p.anio : '';
}

function fechaApa(d: Datos, conDia: boolean): string {
  if (d.sinFecha) return 's.f.';
  const p = partesFecha(d.fechaPub);
  if (conDia && p) return `${p.anio}, ${p.dia} de ${MESES[p.mes]}`;
  return anioEfectivo(d) || 's.f.';
}

function autorApaSeg(d: Datos): Segmento[] {
  if (d.usarCorporativo && hay(d.autorCorporativo)) return [S(puntoFinal(lim(d.autorCorporativo)))];
  const lista = listaAutoresApa(autoresValidos(d.autores));
  return lista ? [S(puntoFinal(lista))] : [];
}

function enlaceSeg(d: Datos): Segmento[] {
  const doi = normalizarDoi(d.doi);
  if (doi) return [S(` ${doi}`)];
  if (hay(d.url)) return [S(` ${lim(d.url)}`)];
  return [];
}

function formatearApa(d: Datos, tipo: TipoFuente): Segmento[] {
  const s: Segmento[] = [];
  const conDia = tipo === 'web' || tipo === 'video' || tipo === 'redes';
  const autor = autorApaSeg(d);
  const titulo = lim(d.titulo);
  const anio = fechaApa(d, conDia);

  // Cursiva en obras autónomas; redonda en partes de una obra mayor
  const tituloAutonomo =
    tipo === 'libro' || tipo === 'web' || tipo === 'tesis' || tipo === 'informe' || tipo === 'video';

  if (tipo === 'ley') {
    const nombre = lim(d.nombreNorma);
    if (!nombre) return [];
    s.push(S(nombre));
    if (hay(d.organo)) s.push(S(` [${lim(d.organo)}]`));
    s.push(S('. '));
    if (hay(d.objeto)) s.push(S(`${puntoFinal(lim(d.objeto))} `));
    const f = fechaLarga(d.fechaPub);
    if (f) s.push(S(`${f}. `));
    else if (anioEfectivo(d)) s.push(S(`${anioEfectivo(d)}. `));
    if (hay(d.publicacionOficial)) s.push(S(puntoFinal(lim(d.publicacionOficial))));
    s.push(...enlaceSeg(d));
    return s;
  }

  if (tipo === 'redes') {
    const contenido = primerasVeintePalabras(d.titulo);
    const listaAut = listaAutoresApa(autoresValidos(d.autores));
    const cuenta = hay(d.usuario) ? `[@${lim(d.usuario).replace(/^@/, '')}]` : '';
    if (listaAut && cuenta) s.push(S(`${listaAut} ${cuenta}. `));
    else if (listaAut) s.push(S(`${puntoFinal(listaAut)} `));
    else if (cuenta) s.push(S(`${cuenta}. `));
    s.push(S(`(${anio}). `));
    if (contenido) s.push(EM(contenido));
    s.push(S(' [Publicación]. '));
    if (hay(d.red)) s.push(S(puntoFinal(lim(d.red))));
    s.push(...enlaceSeg(d));
    return s;
  }

  // Bloque de autor; si la obra no tiene autor, el título ocupa su lugar
  if (autor.length > 0) {
    s.push(...autor);
    s.push(S(` (${anio}). `));
    if (titulo) s.push(tituloAutonomo ? EM(titulo) : S(titulo));
  } else if (titulo) {
    s.push(tituloAutonomo ? EM(titulo) : S(titulo));
    s.push(S(`. (${anio}). `));
  } else {
    return [];
  }

  const conAutor = autor.length > 0;

  switch (tipo) {
    case 'libro': {
      if (conAutor) {
        s.push(S(hay(d.edicion) ? ` (${lim(d.edicion)} ed.). ` : '. '));
      } else if (hay(d.edicion)) {
        s.push(S(`(${lim(d.edicion)} ed.). `));
      }
      if (hay(d.editorial)) s.push(S(puntoFinal(lim(d.editorial))));
      s.push(...enlaceSeg(d));
      break;
    }
    case 'capitulo': {
      if (conAutor) s.push(S('. '));
      s.push(S('En '));
      const editores = autoresValidos(d.editores);
      const eds = listaEditoresApa(editores);
      if (eds) s.push(S(`${eds} (${editores.length > 1 ? 'Eds.' : 'Ed.'}), `));
      if (hay(d.tituloContenedor)) s.push(EM(lim(d.tituloContenedor)));
      const extras: string[] = [];
      if (hay(d.edicion)) extras.push(`${lim(d.edicion)} ed.`);
      if (hay(d.paginas)) extras.push(`pp. ${lim(d.paginas)}`);
      s.push(S(extras.length > 0 ? ` (${extras.join(', ')}). ` : '. '));
      if (hay(d.editorial)) s.push(S(puntoFinal(lim(d.editorial))));
      s.push(...enlaceSeg(d));
      break;
    }
    case 'articulo': {
      if (conAutor) s.push(S('. '));
      // Revista y volumen en cursiva; el número, entre paréntesis y en redonda
      const revista = lim(d.tituloContenedor);
      if (revista && hay(d.volumen)) s.push(EM(`${revista}, ${lim(d.volumen)}`));
      else if (revista) s.push(EM(revista));
      else if (hay(d.volumen)) s.push(EM(lim(d.volumen)));
      let resto = hay(d.numero) ? `(${lim(d.numero)})` : '';
      if (hay(d.paginas)) resto += `, ${lim(d.paginas)}`;
      s.push(S(`${resto}.`));
      s.push(...enlaceSeg(d));
      break;
    }
    case 'web': {
      if (conAutor) s.push(S('. '));
      const sitio = lim(d.tituloContenedor);
      const autorTexto = autor.map((x) => x.t).join('').replace(/\.$/, '');
      // APA omite el nombre del sitio cuando coincide con el autor
      if (sitio && autorTexto !== sitio) s.push(S(`${puntoFinal(sitio)}`));
      s.push(...enlaceSeg(d));
      break;
    }
    case 'tesis': {
      const univ = hay(d.universidad) ? `, ${lim(d.universidad)}` : '';
      s.push(S(` [${lim(d.tipoTesis)}${univ}]. `));
      if (hay(d.repositorio)) s.push(S(puntoFinal(lim(d.repositorio))));
      s.push(...enlaceSeg(d));
      break;
    }
    case 'informe': {
      s.push(S(hay(d.numeroInforme) ? ` (Núm. ${lim(d.numeroInforme)}). ` : '. '));
      const autorTexto = autor.map((x) => x.t).join('').replace(/\.$/, '');
      if (hay(d.editorial) && lim(d.editorial) !== autorTexto) s.push(S(puntoFinal(lim(d.editorial))));
      s.push(...enlaceSeg(d));
      break;
    }
    case 'video': {
      s.push(S(' [Video]. '));
      if (hay(d.plataforma)) s.push(S(puntoFinal(lim(d.plataforma))));
      s.push(...enlaceSeg(d));
      break;
    }
    default:
      break;
  }

  return s;
}

/* ══════════════════════════════════════════════════════════════════════
   FORMATO DE REFERENCIAS — ISO 690
   ══════════════════════════════════════════════════════════════════════ */

function autorIsoSeg(d: Datos): string {
  if (d.usarCorporativo && hay(d.autorCorporativo)) return lim(d.autorCorporativo).toLocaleUpperCase('es');
  return listaAutoresIso(autoresValidos(d.autores));
}

function consultaIso(d: Datos): string {
  const f = fechaLarga(d.fechaConsulta);
  return f ? ` [consulta: ${f}]` : '';
}

function formatearIso(d: Datos, tipo: TipoFuente): Segmento[] {
  const s: Segmento[] = [];
  const autor = autorIsoSeg(d);
  const titulo = lim(d.titulo);
  const anio = d.sinFecha ? 's.f.' : anioEfectivo(d) || 's.f.';
  const lugarEditorial = [lim(d.lugar), lim(d.editorial)].filter(Boolean).join(': ');
  const enlace = normalizarDoi(d.doi) || lim(d.url);

  if (autor) s.push(S(`${puntoFinal(autor)} `));
  if (!titulo) return [];

  switch (tipo) {
    case 'libro': {
      s.push(EM(titulo));
      s.push(S('. '));
      if (hay(d.edicion)) s.push(S(`${lim(d.edicion)} ed. `));
      if (lugarEditorial) s.push(S(`${lugarEditorial}, `));
      s.push(S(`${anio}.`));
      if (enlace) s.push(S(` Disponible en: ${enlace}`));
      break;
    }
    case 'capitulo': {
      s.push(S(`${titulo}. En: `));
      const editores = autoresValidos(d.editores);
      const eds = listaAutoresIso(editores);
      if (eds) s.push(S(`${eds} (${editores.length > 1 ? 'eds.' : 'ed.'}). `));
      if (hay(d.tituloContenedor)) s.push(EM(lim(d.tituloContenedor)));
      s.push(S('. '));
      if (hay(d.edicion)) s.push(S(`${lim(d.edicion)} ed. `));
      if (lugarEditorial) s.push(S(`${lugarEditorial}, `));
      s.push(S(anio));
      if (hay(d.paginas)) s.push(S(`, pp. ${lim(d.paginas)}`));
      s.push(S('.'));
      break;
    }
    case 'articulo': {
      s.push(S(`${titulo}. `));
      if (hay(d.tituloContenedor)) s.push(EM(lim(d.tituloContenedor)));
      s.push(S('. '));
      const partes: string[] = [anio];
      if (hay(d.volumen)) partes.push(`vol. ${lim(d.volumen)}`);
      if (hay(d.numero)) partes.push(`no. ${lim(d.numero)}`);
      if (hay(d.paginas)) partes.push(`pp. ${lim(d.paginas)}`);
      s.push(S(`${partes.join(', ')}.`));
      if (enlace) s.push(S(` Disponible en: ${enlace}`));
      break;
    }
    case 'web': {
      s.push(EM(titulo));
      s.push(S(' [en línea]. '));
      if (hay(d.tituloContenedor)) s.push(S(`${lim(d.tituloContenedor)}, `));
      s.push(S(`${anio}${consultaIso(d)}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    case 'tesis': {
      s.push(EM(titulo));
      s.push(S(`. ${lim(d.tipoTesis)}. `));
      const lugarUniv = [lim(d.lugar), lim(d.universidad)].filter(Boolean).join(': ');
      if (lugarUniv) s.push(S(`${lugarUniv}, `));
      s.push(S(`${anio}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    case 'informe': {
      s.push(EM(titulo));
      s.push(S('. '));
      if (hay(d.numeroInforme)) s.push(S(`Informe n.º ${lim(d.numeroInforme)}. `));
      if (lugarEditorial) s.push(S(`${lugarEditorial}, `));
      s.push(S(`${anio}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    case 'video': {
      s.push(EM(titulo));
      s.push(S(' [video en línea]. '));
      if (hay(d.plataforma)) s.push(S(`${lim(d.plataforma)}, `));
      const f = fechaLarga(d.fechaPub);
      s.push(S(`${f || anio}${consultaIso(d)}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    default:
      break;
  }

  return s;
}

/* ══════════════════════════════════════════════════════════════════════
   FORMATO DE REFERENCIAS — VANCOUVER (ICMJE / NLM). Sin cursivas.
   ══════════════════════════════════════════════════════════════════════ */

function autorVancouverSeg(d: Datos): string {
  if (d.usarCorporativo && hay(d.autorCorporativo)) return lim(d.autorCorporativo);
  return listaAutoresVancouver(autoresValidos(d.autores));
}

function citadoVancouver(d: Datos): string {
  const f = fechaCorta(d.fechaConsulta);
  return f ? ` [citado ${f}]` : '';
}

function formatearVancouver(d: Datos, tipo: TipoFuente): Segmento[] {
  const s: Segmento[] = [];
  const autor = autorVancouverSeg(d);
  const titulo = lim(d.titulo);
  const anio = d.sinFecha ? 'sin fecha' : anioEfectivo(d) || 'sin fecha';
  const lugarEditorial = [lim(d.lugar), lim(d.editorial)].filter(Boolean).join(': ');
  const doi = normalizarDoi(d.doi).replace('https://doi.org/', '');

  if (autor) s.push(S(`${puntoFinal(autor)} `));
  if (!titulo) return [];

  switch (tipo) {
    case 'libro': {
      s.push(S(`${puntoFinal(titulo)} `));
      if (hay(d.edicion)) s.push(S(`${lim(d.edicion)} ed. `));
      if (lugarEditorial) s.push(S(`${lugarEditorial}; `));
      s.push(S(`${anio}.`));
      if (doi) s.push(S(` doi: ${doi}`));
      break;
    }
    case 'capitulo': {
      s.push(S(`${puntoFinal(titulo)} En: `));
      const editores = autoresValidos(d.editores);
      const eds = listaAutoresVancouver(editores);
      if (eds) s.push(S(`${eds}, ${editores.length > 1 ? 'editores' : 'editor'}. `));
      if (hay(d.tituloContenedor)) s.push(S(`${puntoFinal(lim(d.tituloContenedor))} `));
      if (hay(d.edicion)) s.push(S(`${lim(d.edicion)} ed. `));
      if (lugarEditorial) s.push(S(`${lugarEditorial}; `));
      s.push(S(`${anio}.`));
      if (hay(d.paginas)) s.push(S(` p. ${lim(d.paginas)}.`));
      break;
    }
    case 'articulo': {
      s.push(S(`${puntoFinal(titulo)} `));
      if (hay(d.tituloContenedor)) s.push(S(`${puntoFinal(lim(d.tituloContenedor))} `));
      let ref = anio;
      if (hay(d.volumen)) ref += `;${lim(d.volumen)}`;
      if (hay(d.numero)) ref += `(${lim(d.numero)})`;
      if (hay(d.paginas)) ref += `:${lim(d.paginas)}`;
      s.push(S(`${ref}.`));
      if (doi) s.push(S(` doi: ${doi}`));
      break;
    }
    case 'web': {
      s.push(S(`${titulo} [Internet]. `));
      const editor = [lim(d.lugar), lim(d.tituloContenedor) || lim(d.editorial)].filter(Boolean).join(': ');
      if (editor) s.push(S(`${editor}; `));
      s.push(S(`${anio}${citadoVancouver(d)}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    case 'tesis': {
      s.push(S(`${titulo} [${lim(d.tipoTesis).toLocaleLowerCase('es')}]. `));
      const lugarUniv = [lim(d.lugar), lim(d.universidad)].filter(Boolean).join(': ');
      if (lugarUniv) s.push(S(`${lugarUniv}; `));
      s.push(S(`${anio}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    case 'informe': {
      s.push(S(`${titulo} [Internet]. `));
      if (lugarEditorial) s.push(S(`${lugarEditorial}; `));
      s.push(S(`${anio}${citadoVancouver(d)}.`));
      if (hay(d.numeroInforme)) s.push(S(` Informe n.º: ${lim(d.numeroInforme)}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    case 'video': {
      s.push(S(`${titulo} [video en Internet]. `));
      const editor = [lim(d.lugar), lim(d.plataforma)].filter(Boolean).join(': ');
      if (editor) s.push(S(`${editor}; `));
      const p = partesFecha(d.fechaPub);
      s.push(S(`${p ? `${p.anio} ${MESES_ABREV[p.mes]} ${p.dia}` : anio}${citadoVancouver(d)}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    default:
      break;
  }

  return s;
}

/* ══════════════════════════════════════════════════════════════════════
   FORMATO DE REFERENCIAS — ICONTEC (NTC 5613). Sin cursivas.
   ══════════════════════════════════════════════════════════════════════ */

function autorIcontecSeg(d: Datos): string {
  if (d.usarCorporativo && hay(d.autorCorporativo)) return lim(d.autorCorporativo).toLocaleUpperCase('es');
  return listaAutoresIcontec(autoresValidos(d.autores));
}

function consultadoIcontec(d: Datos): string {
  const f = fechaLarga(d.fechaConsulta);
  return f ? ` [consultado: ${f}]` : '';
}

function formatearIcontec(d: Datos, tipo: TipoFuente): Segmento[] {
  const s: Segmento[] = [];
  const autor = autorIcontecSeg(d);
  const titulo = lim(d.titulo);
  const anio = d.sinFecha ? 's.f.' : anioEfectivo(d) || 's.f.';
  const lugarEditorial = [lim(d.lugar), lim(d.editorial)].filter(Boolean).join(': ');

  if (tipo === 'ley') {
    const nombre = lim(d.nombreNorma);
    if (!nombre) return [];
    if (hay(d.organo)) s.push(S(`${puntoFinal(lim(d.organo).toLocaleUpperCase('es'))} `));
    const p = partesFecha(d.fechaPub);
    s.push(S(nombre));
    if (p) s.push(S(` (${p.dia}, ${MESES[p.mes]}, ${p.anio})`));
    s.push(S('. '));
    if (hay(d.objeto)) s.push(S(`${puntoFinal(lim(d.objeto))} `));
    const cierre = [lim(d.lugar), lim(d.publicacionOficial)].filter(Boolean).join(': ');
    if (cierre) s.push(S(`${cierre}, `));
    s.push(S(`${anio}.`));
    if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
    return s;
  }

  if (autor) s.push(S(`${puntoFinal(autor)} `));
  if (!titulo) return [];

  switch (tipo) {
    case 'libro': {
      s.push(S(`${puntoFinal(titulo)} `));
      if (hay(d.edicion)) s.push(S(`${lim(d.edicion)} ed. `));
      if (lugarEditorial) s.push(S(`${lugarEditorial}, `));
      s.push(S(`${anio}.`));
      if (hay(d.paginas)) s.push(S(` ${lim(d.paginas)} p.`));
      break;
    }
    case 'capitulo': {
      s.push(S(`${puntoFinal(titulo)} En: `));
      const eds = listaAutoresIcontec(autoresValidos(d.editores));
      if (eds) s.push(S(`${puntoFinal(eds)} `));
      if (hay(d.tituloContenedor)) s.push(S(`${puntoFinal(lim(d.tituloContenedor))} `));
      if (lugarEditorial) s.push(S(`${lugarEditorial}, `));
      s.push(S(`${anio}.`));
      if (hay(d.paginas)) s.push(S(` p. ${lim(d.paginas)}.`));
      break;
    }
    case 'articulo': {
      s.push(S(`${puntoFinal(titulo)} En: `));
      if (hay(d.tituloContenedor)) s.push(S(`${puntoFinal(lim(d.tituloContenedor))} `));
      if (hay(d.lugar)) s.push(S(`${puntoFinal(lim(d.lugar))} `));
      const partes: string[] = [];
      if (hay(d.volumen)) partes.push(`Vol. ${lim(d.volumen)}`);
      if (hay(d.numero)) partes.push(`No. ${lim(d.numero)}`);
      s.push(S(`${partes.join(', ')}${partes.length > 0 ? ' ' : ''}(${anio})`));
      if (hay(d.paginas)) s.push(S(`; p. ${lim(d.paginas)}`));
      s.push(S('.'));
      break;
    }
    case 'web': {
      s.push(S(`${titulo} [en línea]. `));
      const editor = [lim(d.lugar), lim(d.tituloContenedor)].filter(Boolean).join(': ');
      if (editor) s.push(S(`${editor}, `));
      s.push(S(`${anio}${consultadoIcontec(d)}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    case 'tesis': {
      s.push(S(`${puntoFinal(titulo)} `));
      if (hay(d.lugar)) s.push(S(`${lim(d.lugar)}, `));
      s.push(S(`${anio}. ${puntoFinal(lim(d.tipoTesis))} `));
      if (hay(d.universidad)) s.push(S(puntoFinal(lim(d.universidad))));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    case 'informe': {
      s.push(S(`${puntoFinal(titulo)} `));
      if (hay(d.numeroInforme)) s.push(S(`Informe No. ${lim(d.numeroInforme)}. `));
      if (lugarEditorial) s.push(S(`${lugarEditorial}, `));
      s.push(S(`${anio}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    case 'video': {
      s.push(S(`${titulo} [video]. `));
      const editor = [lim(d.lugar), lim(d.plataforma)].filter(Boolean).join(': ');
      if (editor) s.push(S(`${editor}, `));
      s.push(S(`${anio}${consultadoIcontec(d)}.`));
      if (hay(d.url)) s.push(S(` Disponible en: ${lim(d.url)}`));
      break;
    }
    default:
      break;
  }

  return s;
}

function formatearReferencia(d: Datos, norma: Norma, tipo: TipoFuente): Segmento[] {
  switch (norma) {
    case 'apa':
      return formatearApa(d, tipo);
    case 'iso690':
      return formatearIso(d, tipo);
    case 'vancouver':
      return formatearVancouver(d, tipo);
    case 'icontec':
      return formatearIcontec(d, tipo);
    default:
      return [];
  }
}

/* ══════════════════════════════════════════════════════════════════════
   CITAS DENTRO DEL TEXTO
   ══════════════════════════════════════════════════════════════════════ */

interface CitaTexto {
  parentetica: Segmento[];
  narrativa: Segmento[];
  nota?: string;
}

/** Nombre del autor tal y como aparece dentro del texto, no en la lista final. */
function autorEnTexto(d: Datos, tipo: TipoFuente): { seg: Segmento[]; plural: boolean } {
  if (d.usarCorporativo && hay(d.autorCorporativo)) return { seg: [S(lim(d.autorCorporativo))], plural: false };
  const apellidos = autoresValidos(d.autores)
    .map((a) => lim(a.apellidos) || lim(a.nombre))
    .filter(Boolean);
  if (apellidos.length === 1) return { seg: [S(apellidos[0])], plural: false };
  if (apellidos.length === 2) return { seg: [S(`${apellidos[0]} y ${apellidos[1]}`)], plural: true };
  if (apellidos.length >= 3) return { seg: [S(`${apellidos[0]} et al.`)], plural: true };
  // Obra sin autor: el título ocupa su lugar (cursiva si la obra es autónoma)
  const titulo = lim(d.titulo) || lim(d.nombreNorma);
  if (!titulo) return { seg: [], plural: false };
  const autonomo = tipo === 'libro' || tipo === 'web' || tipo === 'tesis' || tipo === 'informe' || tipo === 'video';
  const corto = titulo.split(/\s+/).slice(0, 5).join(' ');
  return { seg: autonomo ? [EM(corto)] : [S(`«${corto}»`)], plural: false };
}

function citaEnTexto(d: Datos, norma: Norma, tipo: TipoFuente, numero: number): CitaTexto {
  const pagina = hay(d.paginaCita) ? `, p. ${lim(d.paginaCita)}` : '';
  const anio = d.sinFecha ? 's.f.' : anioEfectivo(d) || 's.f.';
  const { seg, plural } = autorEnTexto(d, tipo);

  if (norma === 'vancouver') {
    return {
      parentetica: [S(`(${numero}${pagina})`)],
      narrativa:
        seg.length > 0
          ? [...seg, S(` (${numero}) ${plural ? 'observaron' : 'observó'} que…`)]
          : [S(`El estudio (${numero}) observó que…`)],
      nota: `Vancouver numera por orden de aparición en el texto, no alfabéticamente. Muchas revistas piden el número en superíndice: ${superindice(numero)}`,
    };
  }

  if (norma === 'icontec') {
    return {
      parentetica: [S(`${superindice(numero)} — llamada de nota al pie`)],
      narrativa:
        seg.length > 0
          ? [...seg, S(` (${anio}${pagina}) ${plural ? 'señalan' : 'señala'} que…`)]
          : [S(`El documento (${anio}) señala que…`)],
      nota: 'ICONTEC (NTC 1486) usa por defecto la nota al pie numerada, con la referencia completa al pie de esa misma página. También admite el sistema autor-fecha, que es el de la forma narrativa.',
    };
  }

  if (norma === 'iso690') {
    return {
      parentetica: seg.length > 0 ? [S('('), ...seg, S(`, ${anio}${pagina})`)] : [S(`(${anio})`)],
      narrativa:
        seg.length > 0
          ? [...seg, S(` (${anio}${pagina}) ${plural ? 'sostienen' : 'sostiene'} que…`)]
          : [S(`La fuente (${anio}) sostiene que…`)],
      nota: `ISO 690 admite además el sistema numérico: la cita sería [${numero}] y la lista se ordenaría por orden de aparición.`,
    };
  }

  // APA 7
  if (tipo === 'ley' && hay(d.nombreNorma)) {
    const nombre = lim(d.nombreNorma);
    return {
      parentetica: [S(`(${nombre})`)],
      narrativa: [S(`${nombre} establece que…`)],
      nota: 'La cita de normas jurídicas depende del país: APA remite al estilo jurídico local. Contrástala con la guía de tu facultad.',
    };
  }

  if (seg.length === 0) return { parentetica: [], narrativa: [] };
  const nAutores = autoresValidos(d.autores).length;
  return {
    parentetica: [S('('), ...seg, S(`, ${anio}${pagina})`)],
    narrativa: [...seg, S(` (${anio}${pagina}) ${plural ? 'afirman' : 'afirma'} que…`)],
    nota:
      nAutores >= 3
        ? 'Con tres o más autores, APA 7 abrevia con «et al.» desde la primera cita, aunque en la lista de referencias se escriben todos (hasta veinte).'
        : undefined,
  };
}

/* ══════════════════════════════════════════════════════════════════════
   SALIDA: TEXTO PLANO, HTML Y ORDENACIÓN
   ══════════════════════════════════════════════════════════════════════ */

function aTexto(segs: Segmento[]): string {
  return segs.map((s) => s.t).join('').replace(/\s+/g, ' ').trim();
}

function escapar(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function aHtml(segs: Segmento[]): string {
  return segs.map((s) => (s.em ? `<em>${escapar(s.t)}</em>` : escapar(s.t))).join('');
}

function claveOrdenacion(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('es')
    .replace(/^[«"'([]+/, '');
}

function RenderSegmentos({ segs }: { segs: Segmento[] }) {
  return (
    <>
      {segs.map((s, i) => (s.em ? <em key={i}>{s.t}</em> : <span key={i}>{s.t}</span>))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ══════════════════════════════════════════════════════════════════════ */

export default function GeneradorCitasApaPage() {
  const [norma, setNorma] = useState<Norma>('apa');
  const [tipo, setTipo] = useState<TipoFuente>('libro');
  const [datos, setDatos] = useState<Datos>(DATOS_INICIALES);
  const [lista, setLista] = useState<Entrada[]>([]);
  const [cargado, setCargado] = useState(false);
  const [copiado, setCopiado] = useState('');
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  /* ── Persistencia en el propio navegador ── */
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE_ALMACEN);
      if (guardado) {
        const parseado: unknown = JSON.parse(guardado);
        if (Array.isArray(parseado)) setLista(parseado as Entrada[]);
      }
    } catch {
      // Si el almacenamiento está bloqueado, la app sigue funcionando sin memoria
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(lista));
    } catch {
      // Sin persistencia: no es un error bloqueante
    }
  }, [lista, cargado]);

  const cambiarNorma = (nueva: Norma) => {
    setNorma(nueva);
    if (!TIPOS_POR_NORMA[nueva].includes(tipo)) setTipo('libro');
  };

  const actualizar = <K extends keyof Datos>(campo: K, valor: Datos[K]) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  const actualizarAutor = (indice: number, campo: keyof Autor, valor: string) => {
    setDatos((prev) => ({
      ...prev,
      autores: prev.autores.map((a, i) => (i === indice ? { ...a, [campo]: valor } : a)),
    }));
  };

  const actualizarEditor = (indice: number, campo: keyof Autor, valor: string) => {
    setDatos((prev) => ({
      ...prev,
      editores: prev.editores.map((e, i) => (i === indice ? { ...e, [campo]: valor } : e)),
    }));
  };

  const anadirAutor = () =>
    setDatos((prev) => ({ ...prev, autores: [...prev.autores, { nombre: '', apellidos: '' }] }));
  const quitarAutor = (indice: number) =>
    setDatos((prev) => ({
      ...prev,
      autores: prev.autores.length > 1 ? prev.autores.filter((_, i) => i !== indice) : prev.autores,
    }));
  const anadirEditor = () =>
    setDatos((prev) => ({ ...prev, editores: [...prev.editores, { nombre: '', apellidos: '' }] }));
  const quitarEditor = (indice: number) =>
    setDatos((prev) => ({
      ...prev,
      editores: prev.editores.length > 1 ? prev.editores.filter((_, i) => i !== indice) : prev.editores,
    }));

  /* ── Lista de trabajo ── */
  const listaNorma = useMemo(() => lista.filter((e) => e.norma === norma), [lista, norma]);

  const listaOrdenada = useMemo(() => {
    // Vancouver numera por orden de aparición; el resto se ordena alfabéticamente
    if (norma === 'vancouver') return listaNorma;
    return [...listaNorma].sort((a, b) => a.clave.localeCompare(b.clave, 'es'));
  }, [listaNorma, norma]);

  const otrasNormas = lista.length - listaNorma.length;

  /* ── Vista previa ── */
  const referencia = useMemo(() => formatearReferencia(datos, norma, tipo), [datos, norma, tipo]);
  const cita = useMemo(
    () => citaEnTexto(datos, norma, tipo, listaNorma.length + 1),
    [datos, norma, tipo, listaNorma.length]
  );
  const referenciaTexto = aTexto(referencia);
  const hayReferencia = referenciaTexto.length > 3;

  /* ── Copiar y exportar ── */
  const copiar = useCallback(async (texto: string, html: string | null, id: string) => {
    const marcar = () => {
      setCopiado(id);
      window.setTimeout(() => setCopiado(''), 2200);
    };
    try {
      if (html && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([texto], { type: 'text/plain' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(texto);
      }
      marcar();
    } catch {
      try {
        await navigator.clipboard.writeText(texto);
        marcar();
      } catch {
        setCopiado('');
      }
    }
  }, []);

  const anadirALista = () => {
    if (!hayReferencia) return;
    setLista((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        norma,
        tipo,
        segmentos: referencia,
        clave: claveOrdenacion(referenciaTexto),
      },
    ]);
  };

  const eliminarEntrada = (id: string) => setLista((prev) => prev.filter((e) => e.id !== id));
  const limpiarFormulario = () => setDatos(DATOS_INICIALES);

  const vaciarLista = () => {
    setLista((prev) => prev.filter((e) => e.norma !== norma));
    setConfirmandoBorrado(false);
  };

  const textoLista = useMemo(
    () =>
      listaOrdenada
        .map((e, i) => (norma === 'vancouver' ? `${i + 1}. ${aTexto(e.segmentos)}` : aTexto(e.segmentos)))
        .join('\n\n'),
    [listaOrdenada, norma]
  );

  const htmlLista = useMemo(
    () =>
      listaOrdenada
        .map(
          (e, i) =>
            `<p style="text-indent:-2.5em;padding-left:2.5em;margin:0 0 0.8em 0;">${
              norma === 'vancouver' ? `${i + 1}. ` : ''
            }${aHtml(e.segmentos)}</p>`
        )
        .join(''),
    [listaOrdenada, norma]
  );

  const descargarTxt = () => {
    const nombreNorma = NORMAS.find((n) => n.id === norma)?.nombre ?? 'referencias';
    const cabecera = `Lista de referencias — ${nombreNorma}\n${'='.repeat(40)}\n\n`;
    const blob = new Blob([`${cabecera}${textoLista}\n`], { type: 'text/plain;charset=utf-8' });
    const objeto = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = objeto;
    enlace.download = `referencias-${norma}.txt`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(objeto);
  };

  /* ── Visibilidad de campos según tipo y norma ── */
  const visible = (campo: string): boolean => {
    const conLugar = norma !== 'apa';
    switch (campo) {
      case 'autoresPersonales':
        return ['libro', 'capitulo', 'articulo', 'web', 'tesis', 'redes'].includes(tipo);
      case 'toggleCorporativo':
        return ['libro', 'capitulo', 'articulo', 'web', 'tesis'].includes(tipo);
      case 'corporativoFijo':
        return tipo === 'informe' || tipo === 'video';
      case 'usuario':
      case 'red':
        return tipo === 'redes';
      case 'titulo':
        return tipo !== 'ley';
      case 'editores':
        return tipo === 'capitulo';
      case 'contenedor':
        return ['capitulo', 'articulo', 'web'].includes(tipo);
      case 'plataforma':
        return tipo === 'video';
      case 'anio':
        return ['libro', 'capitulo', 'articulo', 'tesis', 'informe'].includes(tipo);
      case 'fechaPub':
        return ['web', 'video', 'redes', 'ley'].includes(tipo);
      case 'fechaConsulta':
        return ['web', 'video'].includes(tipo);
      case 'edicion':
        return ['libro', 'capitulo'].includes(tipo);
      case 'editorial':
        return ['libro', 'capitulo', 'informe'].includes(tipo);
      case 'lugar':
        return (
          conLugar &&
          ['libro', 'capitulo', 'articulo', 'tesis', 'informe', 'web', 'video', 'ley'].includes(tipo)
        );
      case 'volumen':
      case 'numero':
        return tipo === 'articulo';
      case 'paginas':
        return ['capitulo', 'articulo'].includes(tipo) || (tipo === 'libro' && norma === 'icontec');
      case 'doi':
        return ['articulo', 'libro', 'capitulo'].includes(tipo);
      case 'url':
        return !(tipo === 'libro' && norma === 'apa');
      case 'tesis':
        return tipo === 'tesis';
      case 'repositorio':
        return tipo === 'tesis' && norma === 'apa';
      case 'numeroInforme':
        return tipo === 'informe';
      case 'ley':
        return tipo === 'ley';
      default:
        return false;
    }
  };

  const etiquetaContenedor =
    tipo === 'capitulo'
      ? 'Título del libro completo'
      : tipo === 'articulo'
        ? 'Nombre de la revista'
        : 'Nombre del sitio web';

  const etiquetaTitulo =
    tipo === 'capitulo'
      ? 'Título del capítulo'
      : tipo === 'articulo'
        ? 'Título del artículo'
        : tipo === 'redes'
          ? 'Contenido de la publicación'
          : tipo === 'video'
            ? 'Título del video'
            : tipo === 'web'
              ? 'Título de la página'
              : 'Título';

  const tiposDisponibles = TIPOS.filter((t) => TIPOS_POR_NORMA[norma].includes(t.id));
  const normaActual = NORMAS.find((n) => n.id === norma);
  const mostrarAutorCorporativo =
    (visible('toggleCorporativo') && datos.usarCorporativo) || visible('corporativoFijo');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de citas y referencias: APA, ISO 690, Vancouver e ICONTEC</h1>
        <p className={styles.subtitle}>
          Rellena los datos de tu fuente y obtén la referencia bibliográfica y la cita dentro del texto,
          con las cursivas y la puntuación exactas. Sin registro y sin salir de tu navegador.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* ═══ PASO 1: NORMA ═══ */}
        <section className={styles.bloque} aria-labelledby="paso-norma">
          <h2 id="paso-norma" className={styles.bloqueTitulo}>
            <span aria-hidden="true">1️⃣</span> Elige la norma
          </h2>
          <div className={styles.normaGrid}>
            {NORMAS.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`${styles.normaBtn} ${norma === n.id ? styles.activo : ''}`}
                onClick={() => cambiarNorma(n.id)}
                aria-pressed={norma === n.id}
              >
                <span className={styles.normaNombre}>{n.nombre}</span>
                <span className={styles.normaDetalle}>{n.detalle}</span>
                <span className={styles.normaDonde}>{n.donde}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ═══ PASO 2: TIPO DE FUENTE ═══ */}
        <section className={styles.bloque} aria-labelledby="paso-tipo">
          <h2 id="paso-tipo" className={styles.bloqueTitulo}>
            <span aria-hidden="true">2️⃣</span> ¿Qué estás citando?
          </h2>
          <div className={styles.tipoGrid}>
            {tiposDisponibles.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.tipoBtn} ${tipo === t.id ? styles.activo : ''}`}
                onClick={() => setTipo(t.id)}
                aria-pressed={tipo === t.id}
              >
                <span aria-hidden="true">{t.icono}</span> {t.nombre}
              </button>
            ))}
          </div>
          {tiposDisponibles.length < TIPOS.length && (
            <p className={styles.notaTipo}>
              <span aria-hidden="true">ℹ️</span> {normaActual?.nombre} no normaliza todos los tipos de fuente.
              Aquí solo aparecen los que tienen un formato documentado y estable en esa norma.
            </p>
          )}
        </section>

        {/* ═══ PASO 3: DATOS ═══ */}
        <section className={styles.bloque} aria-labelledby="paso-datos">
          <h2 id="paso-datos" className={styles.bloqueTitulo}>
            <span aria-hidden="true">3️⃣</span> Datos de la fuente
          </h2>

          {visible('autoresPersonales') && !datos.usarCorporativo && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Autoras y autores</legend>
              {datos.autores.map((autor, i) => (
                <div key={i} className={styles.autorFila}>
                  <div className={styles.campo}>
                    <label htmlFor={`autor-apellidos-${i}`} className={styles.label}>
                      Apellido(s) {i + 1}
                    </label>
                    <input
                      id={`autor-apellidos-${i}`}
                      type="text"
                      className={styles.input}
                      value={autor.apellidos}
                      onChange={(e) => actualizarAutor(i, 'apellidos', e.target.value)}
                      placeholder="García Márquez"
                      autoComplete="off"
                    />
                  </div>
                  <div className={styles.campo}>
                    <label htmlFor={`autor-nombre-${i}`} className={styles.label}>
                      Nombre(s) {i + 1}
                    </label>
                    <input
                      id={`autor-nombre-${i}`}
                      type="text"
                      className={styles.input}
                      value={autor.nombre}
                      onChange={(e) => actualizarAutor(i, 'nombre', e.target.value)}
                      placeholder="Gabriel José"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.btnQuitar}
                    onClick={() => quitarAutor(i)}
                    disabled={datos.autores.length === 1}
                    aria-label={`Quitar el autor ${i + 1}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className={styles.btnAnadir} onClick={anadirAutor}>
                <span aria-hidden="true">➕</span> Añadir otro autor
              </button>
              <p className={styles.ayuda}>
                Deja los dos campos vacíos si la obra no tiene autor: el título pasará automáticamente a su lugar.
              </p>
            </fieldset>
          )}

          {visible('toggleCorporativo') && (
            <div className={styles.campo}>
              <label className={styles.checkboxLabel} htmlFor="usar-corporativo">
                <input
                  id="usar-corporativo"
                  type="checkbox"
                  checked={datos.usarCorporativo}
                  onChange={(e) => actualizar('usarCorporativo', e.target.checked)}
                />
                El autor es una institución u organización (autor corporativo)
              </label>
            </div>
          )}

          {mostrarAutorCorporativo && (
            <div className={styles.campo}>
              <label htmlFor="autor-corporativo" className={styles.label}>
                {tipo === 'video'
                  ? 'Canal o autor del video'
                  : tipo === 'informe'
                    ? 'Institución autora del informe'
                    : 'Nombre de la institución'}
              </label>
              <input
                id="autor-corporativo"
                type="text"
                className={styles.input}
                value={datos.autorCorporativo}
                onChange={(e) => {
                  actualizar('autorCorporativo', e.target.value);
                  if (visible('corporativoFijo')) actualizar('usarCorporativo', true);
                }}
                placeholder={tipo === 'video' ? 'Nombre del canal' : 'Organización Mundial de la Salud'}
                autoComplete="organization"
              />
            </div>
          )}

          {visible('usuario') && (
            <div className={styles.fila}>
              <div className={styles.campo}>
                <label htmlFor="usuario" className={styles.label}>Nombre de usuario (sin arroba)</label>
                <input
                  id="usuario"
                  type="text"
                  className={styles.input}
                  value={datos.usuario}
                  onChange={(e) => actualizar('usuario', e.target.value)}
                  placeholder="unesco"
                  autoComplete="off"
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="red" className={styles.label}>Red social</label>
                <select
                  id="red"
                  className={styles.select}
                  value={datos.red}
                  onChange={(e) => actualizar('red', e.target.value)}
                >
                  <option>X (antes Twitter)</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>LinkedIn</option>
                  <option>TikTok</option>
                </select>
              </div>
            </div>
          )}

          {visible('titulo') && (
            <div className={styles.campo}>
              <label htmlFor="titulo" className={styles.label}>{etiquetaTitulo}</label>
              {tipo === 'redes' ? (
                <textarea
                  id="titulo"
                  className={styles.textarea}
                  rows={3}
                  value={datos.titulo}
                  onChange={(e) => actualizar('titulo', e.target.value)}
                  placeholder="Pega aquí el texto de la publicación"
                />
              ) : (
                <input
                  id="titulo"
                  type="text"
                  className={styles.input}
                  value={datos.titulo}
                  onChange={(e) => actualizar('titulo', e.target.value)}
                  placeholder="Cien años de soledad"
                  autoComplete="off"
                />
              )}
              <p className={styles.ayuda}>
                {tipo === 'redes'
                  ? 'Se recogen las veinte primeras palabras, tal y como pide la norma.'
                  : norma === 'apa'
                    ? 'APA usa mayúscula solo en la primera palabra, después de dos puntos y en nombres propios: «El impacto del cambio climático en la agricultura andina».'
                    : 'Escribe el título tal y como aparece en la portada de la obra.'}
              </p>
            </div>
          )}

          {visible('editores') && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Editores o coordinadores del libro</legend>
              {datos.editores.map((editor, i) => (
                <div key={i} className={styles.autorFila}>
                  <div className={styles.campo}>
                    <label htmlFor={`editor-apellidos-${i}`} className={styles.label}>Apellido(s) {i + 1}</label>
                    <input
                      id={`editor-apellidos-${i}`}
                      type="text"
                      className={styles.input}
                      value={editor.apellidos}
                      onChange={(e) => actualizarEditor(i, 'apellidos', e.target.value)}
                      placeholder="Ramírez"
                      autoComplete="off"
                    />
                  </div>
                  <div className={styles.campo}>
                    <label htmlFor={`editor-nombre-${i}`} className={styles.label}>Nombre(s) {i + 1}</label>
                    <input
                      id={`editor-nombre-${i}`}
                      type="text"
                      className={styles.input}
                      value={editor.nombre}
                      onChange={(e) => actualizarEditor(i, 'nombre', e.target.value)}
                      placeholder="Ana"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.btnQuitar}
                    onClick={() => quitarEditor(i)}
                    disabled={datos.editores.length === 1}
                    aria-label={`Quitar el editor ${i + 1}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className={styles.btnAnadir} onClick={anadirEditor}>
                <span aria-hidden="true">➕</span> Añadir otro editor
              </button>
            </fieldset>
          )}

          {visible('contenedor') && (
            <div className={styles.campo}>
              <label htmlFor="contenedor" className={styles.label}>{etiquetaContenedor}</label>
              <input
                id="contenedor"
                type="text"
                className={styles.input}
                value={datos.tituloContenedor}
                onChange={(e) => actualizar('tituloContenedor', e.target.value)}
                placeholder={
                  tipo === 'articulo'
                    ? 'Revista Latinoamericana de Psicología'
                    : tipo === 'web'
                      ? 'Banco Mundial'
                      : 'Manual de investigación educativa'
                }
                autoComplete="off"
              />
              {tipo === 'articulo' && norma === 'apa' && (
                <p className={styles.ayuda}>
                  El nombre de la revista sí lleva mayúscula en todas las palabras importantes, al revés que el
                  título del artículo.
                </p>
              )}
            </div>
          )}

          {visible('plataforma') && (
            <div className={styles.campo}>
              <label htmlFor="plataforma" className={styles.label}>Plataforma</label>
              <select
                id="plataforma"
                className={styles.select}
                value={datos.plataforma}
                onChange={(e) => actualizar('plataforma', e.target.value)}
              >
                <option>YouTube</option>
                <option>Vimeo</option>
                <option>TED</option>
              </select>
            </div>
          )}

          {visible('ley') && (
            <>
              <div className={styles.campo}>
                <label htmlFor="nombre-norma" className={styles.label}>Nombre y número de la norma</label>
                <input
                  id="nombre-norma"
                  type="text"
                  className={styles.input}
                  value={datos.nombreNorma}
                  onChange={(e) => actualizar('nombreNorma', e.target.value)}
                  placeholder="Ley 1581 de 2012"
                  autoComplete="off"
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="organo" className={styles.label}>Órgano que la emite</label>
                <input
                  id="organo"
                  type="text"
                  className={styles.input}
                  value={datos.organo}
                  onChange={(e) => actualizar('organo', e.target.value)}
                  placeholder="Congreso de la República"
                  autoComplete="off"
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="objeto" className={styles.label}>Objeto o título descriptivo</label>
                <input
                  id="objeto"
                  type="text"
                  className={styles.input}
                  value={datos.objeto}
                  onChange={(e) => actualizar('objeto', e.target.value)}
                  placeholder="Por la cual se dictan disposiciones generales para la protección de datos personales"
                  autoComplete="off"
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="publicacion-oficial" className={styles.label}>Publicación oficial</label>
                <input
                  id="publicacion-oficial"
                  type="text"
                  className={styles.input}
                  value={datos.publicacionOficial}
                  onChange={(e) => actualizar('publicacionOficial', e.target.value)}
                  placeholder="Diario Oficial n.º 48.587"
                  autoComplete="off"
                />
              </div>
              <p className={styles.ayuda}>
                <span aria-hidden="true">⚖️</span> La cita de normas jurídicas es la más variable de todas: cada
                país tiene su tradición y APA remite al estilo jurídico local. Contrasta el resultado con la guía de
                tu facultad de derecho.
              </p>
            </>
          )}

          <div className={styles.fila}>
            {visible('anio') && (
              <div className={styles.campo}>
                <label htmlFor="anio" className={styles.label}>Año de publicación</label>
                <input
                  id="anio"
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  value={datos.anio}
                  onChange={(e) => actualizar('anio', e.target.value)}
                  placeholder="2023"
                  disabled={datos.sinFecha}
                  autoComplete="off"
                />
              </div>
            )}
            {visible('fechaPub') && (
              <div className={styles.campo}>
                <label htmlFor="fecha-pub" className={styles.label}>
                  {tipo === 'ley' ? 'Fecha de la norma' : 'Fecha de publicación'}
                </label>
                <input
                  id="fecha-pub"
                  type="date"
                  className={styles.input}
                  value={datos.fechaPub}
                  onChange={(e) => actualizar('fechaPub', e.target.value)}
                  disabled={datos.sinFecha}
                />
              </div>
            )}
            {visible('fechaConsulta') && (
              <div className={styles.campo}>
                <label htmlFor="fecha-consulta" className={styles.label}>Fecha de consulta</label>
                <input
                  id="fecha-consulta"
                  type="date"
                  className={styles.input}
                  value={datos.fechaConsulta}
                  onChange={(e) => actualizar('fechaConsulta', e.target.value)}
                />
                {norma === 'apa' && (
                  <p className={styles.ayuda}>En APA solo se indica si el contenido puede cambiar sin aviso.</p>
                )}
              </div>
            )}
          </div>

          {tipo !== 'ley' && (
            <div className={styles.campo}>
              <label className={styles.checkboxLabel} htmlFor="sin-fecha">
                <input
                  id="sin-fecha"
                  type="checkbox"
                  checked={datos.sinFecha}
                  onChange={(e) => actualizar('sinFecha', e.target.checked)}
                />
                La fuente no indica fecha ({norma === 'vancouver' ? 'sin fecha' : 's.f.'})
              </label>
            </div>
          )}

          <div className={styles.fila}>
            {visible('edicion') && (
              <div className={styles.campo}>
                <label htmlFor="edicion" className={styles.label}>Edición (solo si no es la primera)</label>
                <input
                  id="edicion"
                  type="text"
                  className={styles.input}
                  value={datos.edicion}
                  onChange={(e) => actualizar('edicion', e.target.value)}
                  placeholder={norma === 'apa' ? '3.ª' : '3'}
                  autoComplete="off"
                />
              </div>
            )}
            {visible('editorial') && (
              <div className={styles.campo}>
                <label htmlFor="editorial" className={styles.label}>Editorial</label>
                <input
                  id="editorial"
                  type="text"
                  className={styles.input}
                  value={datos.editorial}
                  onChange={(e) => actualizar('editorial', e.target.value)}
                  placeholder="Fondo de Cultura Económica"
                  autoComplete="off"
                />
              </div>
            )}
            {visible('lugar') && (
              <div className={styles.campo}>
                <label htmlFor="lugar" className={styles.label}>Ciudad de publicación</label>
                <input
                  id="lugar"
                  type="text"
                  className={styles.input}
                  value={datos.lugar}
                  onChange={(e) => actualizar('lugar', e.target.value)}
                  placeholder="Ciudad de México"
                  autoComplete="off"
                />
                <p className={styles.ayuda}>APA 7 eliminó la ciudad; ISO 690, Vancouver e ICONTEC sí la piden.</p>
              </div>
            )}
          </div>

          <div className={styles.fila}>
            {visible('volumen') && (
              <div className={styles.campo}>
                <label htmlFor="volumen" className={styles.label}>Volumen</label>
                <input
                  id="volumen"
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  value={datos.volumen}
                  onChange={(e) => actualizar('volumen', e.target.value)}
                  placeholder="12"
                  autoComplete="off"
                />
              </div>
            )}
            {visible('numero') && (
              <div className={styles.campo}>
                <label htmlFor="numero" className={styles.label}>Número</label>
                <input
                  id="numero"
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  value={datos.numero}
                  onChange={(e) => actualizar('numero', e.target.value)}
                  placeholder="3"
                  autoComplete="off"
                />
              </div>
            )}
            {visible('paginas') && (
              <div className={styles.campo}>
                <label htmlFor="paginas" className={styles.label}>
                  {tipo === 'libro' ? 'Total de páginas' : 'Páginas (inicio-fin)'}
                </label>
                <input
                  id="paginas"
                  type="text"
                  className={styles.input}
                  value={datos.paginas}
                  onChange={(e) => actualizar('paginas', e.target.value)}
                  placeholder={tipo === 'libro' ? '350' : '45-67'}
                  autoComplete="off"
                />
              </div>
            )}
          </div>

          {visible('tesis') && (
            <div className={styles.fila}>
              <div className={styles.campo}>
                <label htmlFor="tipo-tesis" className={styles.label}>Tipo de trabajo</label>
                <select
                  id="tipo-tesis"
                  className={styles.select}
                  value={datos.tipoTesis}
                  onChange={(e) => actualizar('tipoTesis', e.target.value)}
                >
                  <option>Tesis doctoral</option>
                  <option>Tesis de maestría</option>
                  <option>Tesis de licenciatura</option>
                  <option>Trabajo de grado</option>
                  <option>Trabajo de fin de máster</option>
                </select>
              </div>
              <div className={styles.campo}>
                <label htmlFor="universidad" className={styles.label}>Universidad</label>
                <input
                  id="universidad"
                  type="text"
                  className={styles.input}
                  value={datos.universidad}
                  onChange={(e) => actualizar('universidad', e.target.value)}
                  placeholder="Universidad Nacional Autónoma de México"
                  autoComplete="organization"
                />
              </div>
              {visible('repositorio') && (
                <div className={styles.campo}>
                  <label htmlFor="repositorio" className={styles.label}>Repositorio (opcional)</label>
                  <input
                    id="repositorio"
                    type="text"
                    className={styles.input}
                    value={datos.repositorio}
                    onChange={(e) => actualizar('repositorio', e.target.value)}
                    placeholder="Repositorio Institucional UNAM"
                    autoComplete="off"
                  />
                </div>
              )}
            </div>
          )}

          {visible('numeroInforme') && (
            <div className={styles.campo}>
              <label htmlFor="numero-informe" className={styles.label}>Número o serie del informe (opcional)</label>
              <input
                id="numero-informe"
                type="text"
                className={styles.input}
                value={datos.numeroInforme}
                onChange={(e) => actualizar('numeroInforme', e.target.value)}
                placeholder="WHO/2023/4"
                autoComplete="off"
              />
            </div>
          )}

          <div className={styles.fila}>
            {visible('doi') && (
              <div className={styles.campo}>
                <label htmlFor="doi" className={styles.label}>DOI (si existe)</label>
                <input
                  id="doi"
                  type="text"
                  className={styles.input}
                  value={datos.doi}
                  onChange={(e) => actualizar('doi', e.target.value)}
                  placeholder="10.1016/j.chb.2023.107654"
                  autoComplete="off"
                />
                <p className={styles.ayuda}>Si la fuente tiene DOI, se usa en lugar de la URL: el DOI no caduca.</p>
              </div>
            )}
            {visible('url') && (
              <div className={styles.campo}>
                <label htmlFor="url" className={styles.label}>URL</label>
                <input
                  id="url"
                  type="url"
                  inputMode="url"
                  className={styles.input}
                  value={datos.url}
                  onChange={(e) => actualizar('url', e.target.value)}
                  placeholder="https://ejemplo.org/documento"
                  autoComplete="url"
                />
              </div>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="pagina-cita" className={styles.label}>
              Página citada (solo para la cita textual, opcional)
            </label>
            <input
              id="pagina-cita"
              type="text"
              className={styles.input}
              value={datos.paginaCita}
              onChange={(e) => actualizar('paginaCita', e.target.value)}
              placeholder="45"
              autoComplete="off"
            />
          </div>

          <div className={styles.botonera}>
            <button type="button" className={styles.btnSecundario} onClick={limpiarFormulario}>
              <span aria-hidden="true">🧹</span> Vaciar formulario
            </button>
          </div>
        </section>

        {/* ═══ RESULTADO ═══ */}
        <section className={styles.resultado} aria-labelledby="resultado-titulo" aria-live="polite">
          <h2 id="resultado-titulo" className={styles.bloqueTitulo}>
            <span aria-hidden="true">✅</span> Resultado en {normaActual?.nombre}
          </h2>

          {!hayReferencia ? (
            <p className={styles.vacio}>
              Completa al menos el título (o el nombre de la norma) para ver la referencia formateada.
            </p>
          ) : (
            <>
              <div className={styles.salidaBloque}>
                <div className={styles.salidaCabecera}>
                  <h3 className={styles.salidaTitulo}>Referencia bibliográfica</h3>
                  <div className={styles.salidaAcciones}>
                    <button
                      type="button"
                      className={styles.btnCopiar}
                      onClick={() => copiar(referenciaTexto, null, 'ref-texto')}
                    >
                      {copiado === 'ref-texto' ? '✅ Copiado' : '📋 Texto plano'}
                    </button>
                    <button
                      type="button"
                      className={styles.btnCopiar}
                      onClick={() => copiar(referenciaTexto, aHtml(referencia), 'ref-html')}
                    >
                      {copiado === 'ref-html' ? '✅ Copiado' : '📝 Con cursivas'}
                    </button>
                  </div>
                </div>
                <p className={styles.referencia}>
                  <RenderSegmentos segs={referencia} />
                </p>
              </div>

              <div className={styles.salidaBloque}>
                <h3 className={styles.salidaTitulo}>Cita dentro del texto</h3>
                <div className={styles.citasGrid}>
                  <div className={styles.citaCard}>
                    <span className={styles.citaEtiqueta}>
                      {norma === 'icontec' ? 'Nota al pie' : norma === 'vancouver' ? 'Numérica' : 'Parentética'}
                    </span>
                    <p className={styles.citaTexto}>
                      <RenderSegmentos segs={cita.parentetica} />
                    </p>
                    <p className={styles.citaExplica}>
                      {norma === 'vancouver'
                        ? 'El número corresponde al orden en que la fuente aparece en tu texto.'
                        : norma === 'icontec'
                          ? 'La referencia completa se escribe abajo, en la nota al pie de esa página.'
                          : 'Va entre paréntesis al final de la frase, antes del punto.'}
                    </p>
                    <button
                      type="button"
                      className={styles.btnCopiarMini}
                      onClick={() => copiar(aTexto(cita.parentetica), aHtml(cita.parentetica), 'cita-par')}
                    >
                      {copiado === 'cita-par' ? '✅ Copiado' : '📋 Copiar'}
                    </button>
                  </div>
                  <div className={styles.citaCard}>
                    <span className={styles.citaEtiqueta}>Narrativa</span>
                    <p className={styles.citaTexto}>
                      <RenderSegmentos segs={cita.narrativa} />
                    </p>
                    <p className={styles.citaExplica}>
                      El autor forma parte de la frase; solo la fecha (o el número) queda entre paréntesis.
                    </p>
                    <button
                      type="button"
                      className={styles.btnCopiarMini}
                      onClick={() => copiar(aTexto(cita.narrativa), aHtml(cita.narrativa), 'cita-nar')}
                    >
                      {copiado === 'cita-nar' ? '✅ Copiado' : '📋 Copiar'}
                    </button>
                  </div>
                </div>
                {cita.nota && (
                  <p className={styles.citaNota}>
                    <span aria-hidden="true">💡</span> {cita.nota}
                  </p>
                )}
              </div>

              <button type="button" className={styles.btnPrimario} onClick={anadirALista}>
                <span aria-hidden="true">➕</span> Añadir a mi lista de referencias
              </button>
            </>
          )}
        </section>

        {/* ═══ LISTA DE TRABAJO ═══ */}
        <section className={styles.bloque} aria-labelledby="lista-titulo">
          <h2 id="lista-titulo" className={styles.bloqueTitulo}>
            <span aria-hidden="true">📚</span> Mi lista de referencias ({listaOrdenada.length})
          </h2>

          {listaOrdenada.length === 0 ? (
            <p className={styles.vacio}>
              Todavía no has añadido ninguna referencia en {normaActual?.nombre}. La lista se guarda en tu propio
              navegador, así que seguirá aquí cuando vuelvas.
            </p>
          ) : (
            <>
              <p className={styles.listaNota}>
                {norma === 'vancouver'
                  ? 'Vancouver numera las referencias por orden de aparición en el texto, no alfabéticamente.'
                  : 'Ordenadas alfabéticamente y con sangría francesa, tal y como deben aparecer en tu trabajo.'}
              </p>
              <ol className={styles.listaReferencias}>
                {listaOrdenada.map((entrada, i) => (
                  <li key={entrada.id} className={styles.listaItem}>
                    <p className={styles.referenciaLista}>
                      {norma === 'vancouver' && <span className={styles.numeroVan}>{i + 1}. </span>}
                      <RenderSegmentos segs={entrada.segmentos} />
                    </p>
                    <button
                      type="button"
                      className={styles.btnQuitar}
                      onClick={() => eliminarEntrada(entrada.id)}
                      aria-label={`Eliminar la referencia ${i + 1} de la lista`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ol>

              <div className={styles.botonera}>
                <button
                  type="button"
                  className={styles.btnSecundario}
                  onClick={() => copiar(textoLista, null, 'lista-texto')}
                >
                  {copiado === 'lista-texto' ? '✅ Copiado' : '📋 Copiar lista (texto plano)'}
                </button>
                <button
                  type="button"
                  className={styles.btnSecundario}
                  onClick={() => copiar(textoLista, htmlLista, 'lista-html')}
                >
                  {copiado === 'lista-html' ? '✅ Copiado' : '📝 Copiar con cursivas y sangría'}
                </button>
                <button type="button" className={styles.btnSecundario} onClick={descargarTxt}>
                  <span aria-hidden="true">⬇️</span> Descargar .txt
                </button>
                {!confirmandoBorrado ? (
                  <button type="button" className={styles.btnPeligro} onClick={() => setConfirmandoBorrado(true)}>
                    <span aria-hidden="true">🗑️</span> Vaciar lista
                  </button>
                ) : (
                  <span className={styles.confirmacion} role="alert">
                    ¿Seguro? Se borrarán las {listaOrdenada.length} referencias de {normaActual?.nombre}.
                    <button type="button" className={styles.btnPeligro} onClick={vaciarLista}>Sí, borrar</button>
                    <button type="button" className={styles.btnSecundario} onClick={() => setConfirmandoBorrado(false)}>
                      Cancelar
                    </button>
                  </span>
                )}
              </div>
            </>
          )}

          {otrasNormas > 0 && (
            <p className={styles.listaNota}>
              <span aria-hidden="true">ℹ️</span> Tienes {otrasNormas} referencia{otrasNormas === 1 ? '' : 's'}{' '}
              guardada{otrasNormas === 1 ? '' : 's'} en otras normas. Cambia de norma arriba para verlas.
            </p>
          )}
        </section>
      </div>

      {/* ═══ AVISO VISIBLE, FUERA DEL CONTENIDO COLAPSABLE ═══ */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
          <h2>Antes de entregar tu trabajo, léelo</h2>
        </div>
        <ul className={styles.warningList}>
          <li className={styles.warningItem}>
            <div>
              <strong>La guía de tu universidad manda sobre la norma</strong>
              <p>
                Casi todas las facultades publican su propio manual de estilo con variaciones sobre la norma
                internacional: abreviaturas, uso de «y» o «&amp;», mayúsculas o el orden de algunos elementos. Si el
                manual de tu centro dice algo distinto de lo que ves aquí, manda el de tu centro.
              </p>
            </div>
          </li>
          <li className={styles.warningItem}>
            <div>
              <strong>La edición vigente de APA es la 7.ª (2019)</strong>
              <p>
                Muchos apuntes que circulan siguen todavía la 6.ª edición. Dos diferencias delatan la versión
                antigua: la 7.ª ya no incluye la ciudad de publicación de los libros y abrevia con «et al.» desde el
                tercer autor, no desde el sexto.
              </p>
            </div>
          </li>
          <li className={styles.warningItem}>
            <div>
              <strong>Esta herramienta formatea, no verifica</strong>
              <p>
                Da forma exacta a los datos que escribes, pero no comprueba que la fuente exista, que el DOI sea
                correcto ni que el año coincida con la edición real. Revisa siempre los datos contra la fuente
                original: un error tipográfico tuyo se convierte en un error en tu bibliografía.
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* ═══ CONTENIDO EDUCATIVO ═══ */}
      <EducationalSection
        title="Cómo citar bien (y no plagiar sin querer)"
        subtitle="Cita frente a referencia, paráfrasis, DOI, cita secundaria y qué norma usa cada disciplina"
      >
        <section className={styles.eduSection}>
          <h2><span aria-hidden="true">📖</span> Cita y referencia no son lo mismo</h2>
          <p className={styles.eduIntro}>
            Es la confusión más extendida y la que más puntos cuesta. La <strong>cita</strong> es la marca breve que
            dejas dentro del párrafo, justo donde usas la idea ajena: (Restrepo, 2021). La <strong>referencia</strong>{' '}
            es la entrada completa que va al final del trabajo, con autor, año, título, editorial y enlace. Cada cita
            del texto debe tener su referencia al final, y cada referencia del final debe estar citada al menos una
            vez en el texto. Si aparece una sin la otra, el trabajo está mal construido aunque el formato sea impecable.
          </p>
          <p className={styles.eduIntro}>
            Dentro de la cita hay dos formas que sirven para cosas distintas. La <strong>parentética</strong>{' '}
            (Restrepo, 2021) mete todo entre paréntesis y funciona cuando lo importante es la idea. La{' '}
            <strong>narrativa</strong> —Restrepo (2021) sostiene que…— saca al autor a la frase y funciona cuando
            quieres contrastar posturas o dar peso a quien lo dice. Un texto que solo usa una de las dos se lee
            monótono; alternarlas con criterio es lo que distingue a la escritura académica madura.
          </p>
        </section>

        <section className={styles.eduSection}>
          <h2><span aria-hidden="true">📊</span> Qué norma usa cada quien</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>APA 7.ª</th>
                  <th>ISO 690</th>
                  <th>Vancouver</th>
                  <th>ICONTEC</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Sistema de cita</strong></td>
                  <td>Autor-fecha</td>
                  <td>Autor-fecha o numérica</td>
                  <td>Numérica por orden de aparición</td>
                  <td>Nota al pie numerada</td>
                </tr>
                <tr>
                  <td><strong>Dónde se usa</strong></td>
                  <td>Ciencias sociales, educación y psicología en casi toda Latinoamérica</td>
                  <td>Universidades de España y del entorno europeo</td>
                  <td>Medicina, enfermería y biomedicina en todo el mundo</td>
                  <td>Colombia (NTC 1486 para el trabajo, NTC 5613 para las referencias)</td>
                </tr>
                <tr>
                  <td><strong>Orden de la lista</strong></td>
                  <td>Alfabético</td>
                  <td>Alfabético o por aparición, según el sistema</td>
                  <td>Por orden de aparición</td>
                  <td>Alfabético</td>
                </tr>
                <tr>
                  <td><strong>Cursivas</strong></td>
                  <td>Título del libro y nombre de la revista</td>
                  <td>Título de la obra principal</td>
                  <td>No usa cursivas</td>
                  <td>No usa cursivas</td>
                </tr>
                <tr>
                  <td><strong>Varios autores</strong></td>
                  <td>Hasta 20 en la lista; «et al.» en el texto desde el tercero</td>
                  <td>Hasta 3; con 4 o más, el primero y «et al.»</td>
                  <td>Los 6 primeros y «et al.»</td>
                  <td>Hasta 3; con más, el primero y «et al.»</td>
                </tr>
                <tr>
                  <td><strong>Ciudad de publicación</strong></td>
                  <td>Ya no se incluye</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.eduSection}>
          <h2><span aria-hidden="true">💼</span> Cuatro situaciones reales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <h3>Trabajo final de pregrado</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <code>25 fuentes, entrega en dos semanas, norma APA 7</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Qué hacer:</strong> añade cada fuente a la lista en el momento en que la lees, no al final.
                Reconstruir 25 referencias la noche antes de entregar es la vía más rápida a los errores de año y de
                editorial, que son justo los que un tribunal detecta de un vistazo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🩺</span>
                <h3>Artículo para una revista médica</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <code>Vancouver, 40 referencias numeradas, revisión por pares</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Qué hacer:</strong> el número depende del orden de aparición, así que cualquier párrafo que
                muevas obliga a renumerar. Deja la numeración definitiva para el final y comprueba que el número 12
                del texto sigue siendo el 12 de la lista tras la última reescritura.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏫</span>
                <h3>Trabajo de secundaria o preparatoria</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <code>Fuentes en internet: páginas web, videos y una entrada de enciclopedia</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Qué hacer:</strong> las fuentes web son las que peor se citan porque suelen faltar datos.
                Busca el autor en el pie de página o en «Acerca de»; si de verdad no hay, el sitio actúa como autor.
                Nunca pegues solo la dirección: una URL suelta no es una referencia.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📝</span>
                <h3>Tesis de maestría</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Situación:</strong></p>
                <code>Más de 80 fuentes, revisión por el comité, control antiplagio</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Qué hacer:</strong> con ese volumen, la exportación en texto plano sirve de copia de
                seguridad, pero conviene apoyarse también en un gestor bibliográfico. Y revisa una a una las fuentes
                que citas de segunda mano: son las que más errores arrastran.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.eduSection}>
          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Cuándo tengo que poner el número de página?</summary>
              <p className={styles.faqAnswer}>
                Siempre que reproduzcas las palabras exactas del autor: en una cita directa el número de página es
                obligatorio, vaya entrecomillada (menos de 40 palabras) o en bloque aparte (40 o más). Si parafraseas
                con tus propias palabras, APA no lo exige, aunque lo recomienda cuando la idea procede de un punto
                concreto de un texto largo. Regla práctica: si tu lector tendría que leerse el libro entero para
                encontrar lo que dices, pon la página.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Parafrasear también hay que citarlo?</summary>
              <p className={styles.faqAnswer}>
                Sí, y aquí se pierde mucha gente. Lo que se cita no son las palabras, es la idea. Si reformulas con
                tu vocabulario un argumento que leíste, sigue siendo de quien lo pensó y necesita cita. Cambiar unas
                cuantas palabras manteniendo la estructura de la frase original no es parafrasear: es copiar mal, y
                los sistemas antiplagio lo detectan igual. Parafrasear de verdad significa entender la idea, cerrar
                el texto y escribirla desde cero.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Qué es el DOI y por qué se prefiere a la URL?</summary>
              <p className={styles.faqAnswer}>
                El DOI (Digital Object Identifier) es un identificador permanente asignado a un documento académico
                que no cambia aunque la revista cambie de dominio, de plataforma o de propietario. Una URL, en
                cambio, caduca: los enlaces rotos son uno de los defectos más comunes en bibliografías de más de
                cinco años. Por eso, cuando la fuente tiene DOI se escribe el DOI y se omite la URL, y se escribe
                completo, en forma de enlace: https://doi.org/10.xxxx/xxxxx.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Puedo citar algo que vi citado en otro libro?</summary>
              <p className={styles.faqAnswer}>
                Puedes, pero tienes que decirlo. Es la <strong>cita secundaria</strong>: si Ramírez cita a Piaget y tú
                no has leído a Piaget, escribes «Piaget (1952, como se citó en Ramírez, 2020)» y en la lista de
                referencias va solo Ramírez, que es lo que de verdad leíste. Presentar como leída una fuente que solo
                conoces de oídas es un error serio: heredas los errores de interpretación del intermediario y basta
                una pregunta del tribunal sobre el original para que se note. Úsala solo cuando el original sea
                inaccesible o esté en un idioma que no manejas.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Qué pongo si la página web no tiene autor ni fecha?</summary>
              <p className={styles.faqAnswer}>
                Sin autor, el título de la página se mueve a la posición del autor y la referencia empieza por él.
                Sin fecha, se escribe «s.f.» en el lugar del año, tanto en la referencia como en la cita del texto:
                (Guía de estilo, s.f.). Antes de rendirte, busca el autor en el pie de página, en el apartado
                «Quiénes somos» o en los metadatos del artículo; en muchos sitios institucionales el autor es la
                propia organización, y eso es un autor corporativo perfectamente válido.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Por qué existen tantas normas distintas?</summary>
              <p className={styles.faqAnswer}>
                Porque cada disciplina necesita destacar cosas distintas. En medicina lo urgente es saber cuántos
                estudios respaldan una afirmación, así que Vancouver numera y no interrumpe la lectura. En ciencias
                sociales importa quién dijo qué y cuándo, porque el debate es entre autores y las ideas envejecen;
                por eso APA pone el apellido y el año a la vista. ISO 690 nace como norma internacional para cubrir
                cualquier tipo de documento, e ICONTEC es la adaptación colombiana a su propia tradición documental.
                Ninguna es mejor que otra: son respuestas distintas a necesidades distintas.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Se citan las redes sociales o la inteligencia artificial?</summary>
              <p className={styles.faqAnswer}>
                Las redes sociales sí, y APA 7 tiene formato propio: autor, cuenta entre corchetes, fecha completa,
                las veinte primeras palabras de la publicación en cursiva y el enlace. Con las herramientas de IA
                generativa la respuesta corta es que muchas universidades las tratan como comunicación no
                recuperable o exigen declararlas en un apartado de metodología, y las políticas cambian cada curso.
                Consulta la normativa vigente de tu institución antes de citarlas.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>¿Y si dos fuentes tienen el mismo autor y el mismo año?</summary>
              <p className={styles.faqAnswer}>
                Se distinguen con letras minúsculas pegadas al año: (Morales, 2022a) y (Morales, 2022b). Las letras
                se asignan ordenando esas obras alfabéticamente por el título, no por el orden en que las citas, y
                la misma letra debe aparecer en la referencia final. Es un detalle que se corrige en un minuto y que,
                si se olvida, deja al lector sin saber a cuál de los dos trabajos te refieres.
              </p>
            </details>
          </div>
        </section>

        <section className={styles.eduSection}>
          <h2><span aria-hidden="true">📋</span> Siete pasos para una bibliografía sin sustos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Confirma qué norma te piden</h4>
                <p>
                  Míralo en el enunciado del trabajo o en la guía de tu facultad, no en lo que hiciste el semestre
                  pasado. Cambiar de norma a mitad de un documento de 60 páginas cuesta horas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Recoge los datos de la fuente original</h4>
                <p>
                  De la portada y la página de créditos del libro, o de la primera página del artículo. Los datos que
                  muestra un buscador o una librería en línea llevan errores con frecuencia, sobre todo en el año.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Identifica bien el tipo de fuente</h4>
                <p>
                  Un informe institucional colgado en una web no es una página web, y un capítulo firmado dentro de
                  un libro coordinado no es un libro. El tipo determina el formato entero de la referencia.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Genera la referencia y la cita a la vez</h4>
                <p>
                  Copia la cita en el texto en el momento de escribir el párrafo y añade la referencia a la lista.
                  Así nunca te quedará una cita huérfana sin su entrada al final.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Revisa mayúsculas y cursivas</h4>
                <p>
                  En APA, el título del artículo va en minúsculas salvo la primera palabra y los nombres propios,
                  mientras que el nombre de la revista lleva mayúscula en todas las palabras importantes. Es el
                  detalle que más se falla.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Comprueba que todo cuadra en ambas direcciones</h4>
                <p>
                  Recorre el documento y verifica que cada cita tiene referencia; luego recorre la lista y verifica
                  que cada referencia aparece citada. Sobran menos entradas de las que crees: normalmente faltan.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Aplica la sangría francesa y ordena</h4>
                <p>
                  Alfabético por el primer apellido (o por orden de aparición en Vancouver), primera línea al margen
                  y las siguientes sangradas. En un procesador de textos: Párrafo → Especial → Francesa, 1,27 cm.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.eduSection}>
          <h2><span aria-hidden="true">✅</span> Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <h4>DOI antes que URL</h4>
              <p>Si el artículo tiene DOI, úsalo y omite la URL: sobrevive a los cambios de plataforma de la revista.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗓️</span>
              <h4>Anota la fecha de consulta de las webs</h4>
              <p>ISO 690, Vancouver e ICONTEC la exigen; APA solo cuando el contenido puede cambiar sin aviso.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👥</span>
              <h4>Escribe todos los autores en la lista</h4>
              <p>«Et al.» abrevia la cita del texto, no la referencia final: ahí APA admite hasta veinte nombres.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Una sola norma por documento</h4>
              <p>Mezclar formatos delata el copiar y pegar de fuentes distintas y resta credibilidad al conjunto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✍️</span>
              <h4>Alterna cita parentética y narrativa</h4>
              <p>La narrativa cuando debatas posturas; la parentética cuando lo relevante sea el dato, no quién lo dijo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💾</span>
              <h4>Guarda la referencia al leer, no al final</h4>
              <p>Reconstruir la bibliografía la última noche es la causa número uno de errores de año y de editorial.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores que cuestan nota (o algo peor)</h3>
          </div>
          <ul className={styles.warningList}>
            <li className={styles.warningItem}>
              <div>
                <strong>Parafrasear sin citar</strong>
                <p>
                  Reescribir con otras palabras una idea ajena y no atribuirla es plagio, aunque no haya ni una frase
                  copiada. Es el caso más frecuente en los expedientes académicos y casi siempre por desconocimiento.
                </p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <div>
                <strong>Citar fuentes que no has leído</strong>
                <p>
                  Copiar la referencia que viste en la bibliografía de otro autor propaga sus erratas y te expone a
                  defender un texto que no conoces. Si no lo leíste, usa «como se citó en» y sé honesto.
                </p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <div>
                <strong>Dejar solo la URL como referencia</strong>
                <p>
                  Un enlace suelto no identifica a nadie y deja de funcionar en pocos años. Toda fuente web necesita
                  autor (o sitio), fecha, título y enlace, en ese orden.
                </p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <div>
                <strong>Confundir cita y referencia</strong>
                <p>
                  Poner la referencia completa dentro del párrafo, o dejar en la lista final solo el apellido y el
                  año, revela que no se ha entendido para qué sirve cada una.
                </p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <div>
                <strong>Mezclar normas en el mismo trabajo</strong>
                <p>
                  Cursivas de APA en una lista de Vancouver, o ciudades de publicación en referencias APA 7. Elige
                  una norma, revisa el documento entero con ella y no la cambies a mitad.
                </p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <div>
                <strong>Referencias que nunca se citan en el texto</strong>
                <p>
                  Engordar la bibliografía con obras que no aparecen en ningún párrafo es fácil de detectar y resta
                  credibilidad al trabajo entero. La lista final refleja el texto, no es un escaparate.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-citas-apa')} />

      <ShareCard appName="generador-citas-apa" />
      <Footer appName="generador-citas-apa" />
    </div>
  );
}
