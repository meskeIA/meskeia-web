'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './ComparadorTamanosPapel.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────────────────
// DATOS: catálogo de formatos de papel (medidas en milímetros)
// ─────────────────────────────────────────────────────────────────────────

type CategoriaId = 'serie-a' | 'serie-b' | 'serie-c' | 'norteamerica' | 'tradicional' | 'foto';

interface Formato {
  id: string;
  nombre: string;
  ancho: number; // mm
  alto: number; // mm
  categoria: CategoriaId;
  nota?: string;
}

interface Categoria {
  id: CategoriaId;
  etiqueta: string;
  icono: string;
  descripcion: string;
}

const CATEGORIAS: Categoria[] = [
  {
    id: 'serie-a',
    etiqueta: 'Serie A (ISO 216)',
    icono: '📄',
    descripcion:
      'La serie de uso general en casi todo el mundo. Cada formato es la mitad del anterior y todos comparten la proporción 1:√2.',
  },
  {
    id: 'serie-b',
    etiqueta: 'Serie B (ISO 216)',
    icono: '📘',
    descripcion:
      'Formatos intermedios entre dos tamaños A consecutivos. Se usan en libros, carteles y pasaportes.',
  },
  {
    id: 'serie-c',
    etiqueta: 'Serie C (sobres)',
    icono: '✉️',
    descripcion:
      'La serie de los sobres: un C4 alberga un A4 sin doblar, un C5 un A4 doblado por la mitad y un C6 un A4 doblado en cuatro.',
  },
  {
    id: 'norteamerica',
    etiqueta: 'Norteamericanos (ANSI)',
    icono: '🌎',
    descripcion:
      'Carta (Letter), Oficio (Legal) y Tabloide (Ledger). Estándar en Estados Unidos, México y buena parte de Centroamérica.',
  },
  {
    id: 'tradicional',
    etiqueta: 'Tradicionales españoles',
    icono: '🗂️',
    descripcion:
      'Folio, cuartilla, holandesa y octavilla: formatos previos a la norma ISO que siguen vivos en el lenguaje aunque ya no en el papel.',
  },
  {
    id: 'foto',
    etiqueta: 'Fotografía y tarjetas',
    icono: '📷',
    descripcion:
      'Los tamaños de copia fotográfica habituales en laboratorio y las tarjetas de visita a cada lado del Atlántico.',
  },
];

const FORMATOS: Formato[] = [
  // ── Serie A (ISO 216) ──
  { id: 'a0', nombre: 'A0', ancho: 841, alto: 1189, categoria: 'serie-a', nota: 'Superficie de exactamente 1 m². Es el origen de toda la serie.' },
  { id: 'a1', nombre: 'A1', ancho: 594, alto: 841, categoria: 'serie-a', nota: 'Carteles grandes y planos de arquitectura.' },
  { id: 'a2', nombre: 'A2', ancho: 420, alto: 594, categoria: 'serie-a', nota: 'Carteles medianos y láminas de dibujo.' },
  { id: 'a3', nombre: 'A3', ancho: 297, alto: 420, categoria: 'serie-a', nota: 'Dos A4 juntos por el lado largo. Planos, tablas y menús.' },
  { id: 'a4', nombre: 'A4', ancho: 210, alto: 297, categoria: 'serie-a', nota: 'El formato de oficina universal. En España se le llama «folio» en el habla corriente.' },
  { id: 'a5', nombre: 'A5', ancho: 148, alto: 210, categoria: 'serie-a', nota: 'Medio A4: libretas, flyers y libros de bolsillo grandes.' },
  { id: 'a6', nombre: 'A6', ancho: 105, alto: 148, categoria: 'serie-a', nota: 'Tamaño postal clásico.' },
  { id: 'a7', nombre: 'A7', ancho: 74, alto: 105, categoria: 'serie-a' },
  { id: 'a8', nombre: 'A8', ancho: 52, alto: 74, categoria: 'serie-a', nota: 'Aproximadamente el tamaño de una tarjeta.' },
  { id: 'a9', nombre: 'A9', ancho: 37, alto: 52, categoria: 'serie-a' },
  { id: 'a10', nombre: 'A10', ancho: 26, alto: 37, categoria: 'serie-a', nota: 'El menor de la serie: sellos y etiquetas diminutas.' },

  // ── Serie B (ISO 216) ──
  { id: 'b0', nombre: 'B0', ancho: 1000, alto: 1414, categoria: 'serie-b', nota: 'El lado corto mide exactamente 1 metro.' },
  { id: 'b1', nombre: 'B1', ancho: 707, alto: 1000, categoria: 'serie-b', nota: 'Carteles publicitarios de calle.' },
  { id: 'b2', nombre: 'B2', ancho: 500, alto: 707, categoria: 'serie-b' },
  { id: 'b3', nombre: 'B3', ancho: 353, alto: 500, categoria: 'serie-b' },
  { id: 'b4', nombre: 'B4', ancho: 250, alto: 353, categoria: 'serie-b', nota: 'Entre el A4 y el A3. Habitual en revistas y en Japón.' },
  { id: 'b5', nombre: 'B5', ancho: 176, alto: 250, categoria: 'serie-b', nota: 'Muy usado en libros de texto y publicaciones académicas.' },
  { id: 'b6', nombre: 'B6', ancho: 125, alto: 176, categoria: 'serie-b', nota: 'Libros de bolsillo y agendas.' },
  { id: 'b7', nombre: 'B7', ancho: 88, alto: 125, categoria: 'serie-b', nota: 'Tamaño aproximado de un pasaporte.' },
  { id: 'b8', nombre: 'B8', ancho: 62, alto: 88, categoria: 'serie-b' },
  { id: 'b9', nombre: 'B9', ancho: 44, alto: 62, categoria: 'serie-b' },
  { id: 'b10', nombre: 'B10', ancho: 31, alto: 44, categoria: 'serie-b' },

  // ── Serie C (sobres) ──
  { id: 'c0', nombre: 'C0', ancho: 917, alto: 1297, categoria: 'serie-c' },
  { id: 'c1', nombre: 'C1', ancho: 648, alto: 917, categoria: 'serie-c' },
  { id: 'c2', nombre: 'C2', ancho: 458, alto: 648, categoria: 'serie-c' },
  { id: 'c3', nombre: 'C3', ancho: 324, alto: 458, categoria: 'serie-c', nota: 'Sobre para un A3 sin doblar.' },
  { id: 'c4', nombre: 'C4', ancho: 229, alto: 324, categoria: 'serie-c', nota: 'Sobre para un A4 sin doblar. El de las oposiciones y los contratos.' },
  { id: 'c5', nombre: 'C5', ancho: 162, alto: 229, categoria: 'serie-c', nota: 'Sobre para un A4 doblado por la mitad (o un A5 entero).' },
  { id: 'c6', nombre: 'C6', ancho: 114, alto: 162, categoria: 'serie-c', nota: 'Sobre para un A4 doblado en cuatro. El sobre de carta habitual.' },
  { id: 'dl', nombre: 'DL (sobre alargado)', ancho: 110, alto: 220, categoria: 'serie-c', nota: 'Sobre para un A4 doblado en tres. El de las facturas y nóminas.' },
  { id: 'c7', nombre: 'C7', ancho: 81, alto: 114, categoria: 'serie-c' },
  { id: 'c8', nombre: 'C8', ancho: 57, alto: 81, categoria: 'serie-c' },

  // ── Norteamericanos (ANSI) ──
  { id: 'carta', nombre: 'Carta (Letter)', ancho: 215.9, alto: 279.4, categoria: 'norteamerica', nota: '8,5 × 11 pulgadas. Estándar de oficina en EE. UU., México y buena parte de Centroamérica.' },
  { id: 'oficio-legal', nombre: 'Oficio / Legal (EE. UU.)', ancho: 215.9, alto: 355.6, categoria: 'norteamerica', nota: '8,5 × 14 pulgadas. Contratos y documentos legales.' },
  { id: 'oficio-mx', nombre: 'Oficio (México)', ancho: 215.9, alto: 340, categoria: 'norteamerica', nota: 'En México y varios países de la región el «Oficio» mide 340 mm de alto, no 356. Es una fuente habitual de errores de impresión.' },
  { id: 'tabloide', nombre: 'Tabloide (Ledger)', ancho: 279.4, alto: 431.8, categoria: 'norteamerica', nota: '11 × 17 pulgadas: dos Carta juntos. Equivale funcionalmente al A3.' },
  { id: 'media-carta', nombre: 'Media carta (Half Letter)', ancho: 139.7, alto: 215.9, categoria: 'norteamerica', nota: '5,5 × 8,5 pulgadas. Equivalente funcional del A5.' },
  { id: 'ejecutivo', nombre: 'Ejecutivo (Executive)', ancho: 184.1, alto: 266.7, categoria: 'norteamerica', nota: '7,25 × 10,5 pulgadas. Papelería corporativa.' },
  { id: 'ansi-c', nombre: 'ANSI C', ancho: 431.8, alto: 558.8, categoria: 'norteamerica', nota: '17 × 22 pulgadas. Planos técnicos.' },

  // ── Tradicionales españoles ──
  { id: 'folio', nombre: 'Folio (tradicional)', ancho: 215, alto: 315, categoria: 'tradicional', nota: 'Formato previo a la norma ISO, hoy en desuso. En el habla corriente «folio» significa A4 desde hace décadas.' },
  { id: 'cuartilla', nombre: 'Cuartilla', ancho: 155, alto: 215, categoria: 'tradicional', nota: 'La mitad del folio tradicional. Su equivalente moderno es el A5 (148 × 210 mm).' },
  { id: 'holandesa', nombre: 'Holandesa', ancho: 220, alto: 280, categoria: 'tradicional', nota: 'Formato de cuaderno tradicional: más ancho y más corto que un A4.' },
  { id: 'octavilla', nombre: 'Octavilla', ancho: 107, alto: 155, categoria: 'tradicional', nota: 'La cuarta parte del folio. De ahí el nombre de los panfletos.' },

  // ── Fotografía y tarjetas ──
  { id: 'foto-9x13', nombre: 'Foto 9 × 13 cm', ancho: 90, alto: 130, categoria: 'foto' },
  { id: 'foto-10x15', nombre: 'Foto 10 × 15 cm', ancho: 100, alto: 150, categoria: 'foto', nota: 'El revelado estándar de laboratorio.' },
  { id: 'foto-13x18', nombre: 'Foto 13 × 18 cm', ancho: 130, alto: 180, categoria: 'foto' },
  { id: 'foto-15x20', nombre: 'Foto 15 × 20 cm', ancho: 150, alto: 200, categoria: 'foto' },
  { id: 'foto-20x30', nombre: 'Foto 20 × 30 cm', ancho: 200, alto: 300, categoria: 'foto', nota: 'Muy cercano a un A4, pero con proporción 2:3 (la del sensor de una cámara).' },
  { id: 'postal', nombre: 'Postal', ancho: 100, alto: 148, categoria: 'foto', nota: 'Prácticamente un A6.' },
  { id: 'tarjeta-es', nombre: 'Tarjeta de visita (Europa)', ancho: 85, alto: 55, categoria: 'foto', nota: 'Formato apaisado de 85 × 55 mm, casi idéntico a una tarjeta bancaria.' },
  { id: 'tarjeta-us', nombre: 'Tarjeta de visita (EE. UU. y Latam)', ancho: 88.9, alto: 50.8, categoria: 'foto', nota: '3,5 × 2 pulgadas: más ancha y más baja que la europea.' },
];

const MAPA_FORMATOS: Record<string, Formato> = Object.fromEntries(
  FORMATOS.map((f) => [f.id, f])
);

// Colores de la paleta meskeIA para el comparador visual
const COLORES = ['#2E86AB', '#48A9A6', '#7FB3D3', '#1a5278'];

// Formatos destacados como acceso rápido del comparador
const DESTACADOS = ['a4', 'carta', 'oficio-legal', 'a3', 'a5', 'cuartilla', 'folio', 'c4'];

const MAX_COMPARAR = 4;

const OPCIONES_DPI = [72, 150, 300, 600];

const MM_POR_PULGADA = 25.4;

// ─────────────────────────────────────────────────────────────────────────
// UTILIDADES DE CONVERSIÓN
// ─────────────────────────────────────────────────────────────────────────

const mmACm = (mm: number): number => mm / 10;
const mmAPulgadas = (mm: number): number => mm / MM_POR_PULGADA;
const mmAPixeles = (mm: number, dpi: number): number => (mm / MM_POR_PULGADA) * dpi;

/** Devuelve la superficie en cm² de un formato */
const superficieCm2 = (f: Formato): number => (f.ancho * f.alto) / 100;

/** Texto «210 × 297 mm» */
const textoMm = (f: Formato): string =>
  `${formatNumber(f.ancho, 0)} × ${formatNumber(f.alto, 0)} mm`;

// Piezas del doblado sucesivo de un A0 (demostración de la proporción √2)
interface PiezaDoblado {
  etiqueta: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

const generarDoblado = (): PiezaDoblado[] => {
  const piezas: PiezaDoblado[] = [];
  let x = 0;
  let y = 0;
  let ancho = 1189; // A0 en horizontal
  let alto = 841;

  for (let n = 1; n <= 7; n++) {
    if (ancho > alto) {
      piezas.push({ etiqueta: `A${n}`, x, y, ancho: ancho / 2, alto });
      x += ancho / 2;
      ancho = ancho / 2;
    } else {
      piezas.push({ etiqueta: `A${n}`, x, y, ancho, alto: alto / 2 });
      y += alto / 2;
      alto = alto / 2;
    }
  }
  return piezas;
};

const PIEZAS_DOBLADO = generarDoblado();

type UnidadConversor = 'mm' | 'cm' | 'in' | 'px';

export default function ComparadorTamanosPapelPage() {
  // Comparador visual
  const [seleccionados, setSeleccionados] = useState<string[]>(['a4', 'carta']);

  // Catálogo
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaId>('serie-a');

  // Resolución compartida por el catálogo y el conversor
  const [dpi, setDpi] = useState<number>(300);
  const [dpiLibre, setDpiLibre] = useState<string>('');

  // Conversor de unidades
  const [valor, setValor] = useState<string>('210');
  const [unidad, setUnidad] = useState<UnidadConversor>('mm');

  // Comprobador de impresión
  const [origenId, setOrigenId] = useState<string>('carta');
  const [destinoId, setDestinoId] = useState<string>('a4');

  // ── Comparador visual ────────────────────────────────────────────────
  const formatosSeleccionados = useMemo(
    () => seleccionados.map((id) => MAPA_FORMATOS[id]).filter(Boolean),
    [seleccionados]
  );

  const alternarFormato = (id: string) => {
    setSeleccionados((previos) => {
      if (previos.includes(id)) {
        return previos.length === 1 ? previos : previos.filter((p) => p !== id);
      }
      if (previos.length >= MAX_COMPARAR) return previos;
      return [...previos, id];
    });
  };

  const quitarFormato = (id: string) => {
    setSeleccionados((previos) => (previos.length === 1 ? previos : previos.filter((p) => p !== id)));
  };

  const anadirDesdeSelect = (id: string) => {
    if (!id) return;
    setSeleccionados((previos) => {
      if (previos.includes(id) || previos.length >= MAX_COMPARAR) return previos;
      return [...previos, id];
    });
  };

  // Geometría del SVG comparativo (unidades = milímetros reales)
  const geometria = useMemo(() => {
    const maxAncho = Math.max(...formatosSeleccionados.map((f) => f.ancho), 1);
    const maxAlto = Math.max(...formatosSeleccionados.map((f) => f.alto), 1);
    const base = Math.max(maxAncho, maxAlto);
    const fuente = base / 32;
    const margenDerecho = base * 0.38;
    const margenInferior = base * 0.2;

    return {
      maxAncho,
      maxAlto,
      base,
      fuente,
      margenDerecho,
      margenInferior,
      viewBox: `${-fuente} ${-fuente} ${maxAncho + margenDerecho + fuente * 2} ${
        maxAlto + margenInferior + fuente * 2
      }`,
    };
  }, [formatosSeleccionados]);

  // Orden de dibujo: el mayor detrás para que no tape a los pequeños
  const ordenDibujo = useMemo(
    () =>
      formatosSeleccionados
        .map((f, indice) => ({ formato: f, indice }))
        .sort((a, b) => b.formato.ancho * b.formato.alto - a.formato.ancho * a.formato.alto),
    [formatosSeleccionados]
  );

  const referencia = formatosSeleccionados[0];

  // Descripción textual del SVG (el contenido es puramente visual)
  const descripcionSvg = useMemo(() => {
    if (formatosSeleccionados.length === 0) return 'Comparación de formatos de papel.';
    const partes = formatosSeleccionados.map((f) => `${f.nombre}, ${textoMm(f)}`);
    let texto = `Comparación a escala real de: ${partes.join('; ')}.`;
    if (referencia && formatosSeleccionados.length > 1) {
      const diferencias = formatosSeleccionados.slice(1).map((f) => {
        const dAncho = f.ancho - referencia.ancho;
        const dAlto = f.alto - referencia.alto;
        const anchoTexto =
          dAncho === 0
            ? 'igual de ancho'
            : `${formatNumber(Math.abs(dAncho), 0)} mm más ${dAncho > 0 ? 'ancho' : 'estrecho'}`;
        const altoTexto =
          dAlto === 0
            ? 'igual de alto'
            : `${formatNumber(Math.abs(dAlto), 0)} mm más ${dAlto > 0 ? 'alto' : 'corto'}`;
        return `${f.nombre} es ${anchoTexto} y ${altoTexto} que ${referencia.nombre}`;
      });
      texto += ` ${diferencias.join('. ')}.`;
    }
    return texto;
  }, [formatosSeleccionados, referencia]);

  // ── Conversor de unidades ────────────────────────────────────────────
  const conversion = useMemo(() => {
    const numero = parseSpanishNumber(valor);
    if (!Number.isFinite(numero) || numero <= 0) return null;

    let mm: number;
    switch (unidad) {
      case 'cm':
        mm = numero * 10;
        break;
      case 'in':
        mm = numero * MM_POR_PULGADA;
        break;
      case 'px':
        mm = (numero / dpi) * MM_POR_PULGADA;
        break;
      default:
        mm = numero;
    }

    return {
      mm,
      cm: mmACm(mm),
      pulgadas: mmAPulgadas(mm),
      pixeles: mmAPixeles(mm, dpi),
    };
  }, [valor, unidad, dpi]);

  // ── Comprobador de impresión ─────────────────────────────────────────
  const comprobacion = useMemo(() => {
    const origen = MAPA_FORMATOS[origenId];
    const destino = MAPA_FORMATOS[destinoId];
    if (!origen || !destino) return null;

    const factor = Math.min(destino.ancho / origen.ancho, destino.alto / origen.alto);
    const escala = factor * 100;
    const cabeEntero = factor >= 1;

    // Tras escalar al factor calculado, cuánto papel queda sin usar
    const anchoEscalado = origen.ancho * factor;
    const altoEscalado = origen.alto * factor;
    const sobranteAncho = destino.ancho - anchoEscalado;
    const sobranteAlto = destino.alto - altoEscalado;

    // Si se imprime al 100 % sin reducir, qué se sale del papel
    const recorteAncho = Math.max(0, origen.ancho - destino.ancho);
    const recorteAlto = Math.max(0, origen.alto - destino.alto);

    const aprovechamiento =
      ((anchoEscalado * altoEscalado) / (destino.ancho * destino.alto)) * 100;

    return {
      origen,
      destino,
      escala,
      cabeEntero,
      sobranteAncho,
      sobranteAlto,
      recorteAncho,
      recorteAlto,
      aprovechamiento,
      mismaProporcion: Math.abs(origen.alto / origen.ancho - destino.alto / destino.ancho) < 0.005,
    };
  }, [origenId, destinoId]);

  const formatosCategoria = FORMATOS.filter((f) => f.categoria === categoriaActiva);
  const categoriaInfo = CATEGORIAS.find((c) => c.id === categoriaActiva);

  const aplicarDpiLibre = () => {
    const numero = parseSpanishNumber(dpiLibre);
    if (Number.isFinite(numero) && numero >= 10 && numero <= 4800) {
      setDpi(Math.round(numero));
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">📐</span> Medidas de papel: A4, Carta, Oficio y cuartilla
        </h1>
        <p className={styles.subtitle}>
          Un A4 mide 210 × 297 mm y un Carta 216 × 279 mm. No es lo mismo: aquí los ves
          superpuestos y a escala real, con las diferencias acotadas al milímetro.
        </p>
      </header>

      <LegalNotice />

      {/* ═══════════ COMPARADOR VISUAL ═══════════ */}
      <section className={styles.bloque} aria-labelledby="titulo-comparador">
        <h2 id="titulo-comparador" className={styles.bloqueTitulo}>
          <span aria-hidden="true">🔍</span> Comparador visual
        </h2>
        <p className={styles.bloqueIntro}>
          Elige hasta {MAX_COMPARAR} formatos. Se dibujan uno encima de otro desde la misma
          esquina, a escala relativa exacta, para que se vea dónde encajan y dónde no.
        </p>

        {/* Acceso rápido */}
        <div className={styles.chips} role="group" aria-label="Formatos destacados">
          {DESTACADOS.map((id) => {
            const f = MAPA_FORMATOS[id];
            const activo = seleccionados.includes(id);
            const bloqueado = !activo && seleccionados.length >= MAX_COMPARAR;
            return (
              <button
                key={id}
                type="button"
                className={`${styles.chip} ${activo ? styles.chipActivo : ''}`}
                aria-pressed={activo}
                disabled={bloqueado}
                onClick={() => alternarFormato(id)}
              >
                {f.nombre}
              </button>
            );
          })}
        </div>

        {/* Selector completo */}
        <div className={styles.selectorFila}>
          <label className={styles.etiqueta} htmlFor="anadir-formato">
            Añadir otro formato del catálogo
          </label>
          <select
            id="anadir-formato"
            className={styles.select}
            value=""
            onChange={(e) => anadirDesdeSelect(e.target.value)}
            disabled={seleccionados.length >= MAX_COMPARAR}
          >
            <option value="">
              {seleccionados.length >= MAX_COMPARAR
                ? `Máximo de ${MAX_COMPARAR} formatos alcanzado`
                : 'Selecciona un formato…'}
            </option>
            {CATEGORIAS.map((cat) => (
              <optgroup key={cat.id} label={cat.etiqueta}>
                {FORMATOS.filter((f) => f.categoria === cat.id).map((f) => (
                  <option key={f.id} value={f.id} disabled={seleccionados.includes(f.id)}>
                    {f.nombre} — {textoMm(f)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Seleccionados */}
        <ul className={styles.listaSeleccion}>
          {formatosSeleccionados.map((f, i) => (
            <li key={f.id} className={styles.itemSeleccion}>
              <span
                className={styles.muestraColor}
                style={{ background: COLORES[i % COLORES.length] }}
                aria-hidden="true"
              />
              <span className={styles.itemNombre}>{f.nombre}</span>
              <span className={styles.itemMedida}>{textoMm(f)}</span>
              <button
                type="button"
                className={styles.btnQuitar}
                onClick={() => quitarFormato(f.id)}
                aria-label={`Quitar ${f.nombre} de la comparación`}
                disabled={formatosSeleccionados.length === 1}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {/* Dibujo a escala */}
        <div className={styles.lienzo}>
          <svg
            className={styles.svgComparador}
            viewBox={geometria.viewBox}
            role="img"
            aria-label={descripcionSvg}
            preserveAspectRatio="xMinYMin meet"
          >
            {/* Rectángulos: mayor detrás, menor delante */}
            {ordenDibujo.map(({ formato, indice }) => (
              <rect
                key={formato.id}
                x={0}
                y={0}
                width={formato.ancho}
                height={formato.alto}
                fill={COLORES[indice % COLORES.length]}
                fillOpacity={0.22}
                stroke={COLORES[indice % COLORES.length]}
                strokeWidth={geometria.base / 320}
                rx={geometria.base / 250}
              />
            ))}

            {/* Cotas de anchura (bajo el dibujo) */}
            {formatosSeleccionados.map((formato, i) => {
              const yFin = geometria.maxAlto + geometria.margenInferior * (0.16 + 0.2 * i);
              return (
                <g key={`ancho-${formato.id}`}>
                  <line
                    x1={formato.ancho}
                    y1={0}
                    x2={formato.ancho}
                    y2={yFin}
                    className={styles.svgGuia}
                    strokeWidth={geometria.base / 500}
                    strokeDasharray={`${geometria.base / 100} ${geometria.base / 130}`}
                  />
                  <line
                    x1={0}
                    y1={yFin}
                    x2={formato.ancho}
                    y2={yFin}
                    stroke={COLORES[i % COLORES.length]}
                    strokeWidth={geometria.base / 400}
                  />
                  <text
                    x={formato.ancho / 2}
                    y={yFin + geometria.fuente * 0.95}
                    fontSize={geometria.fuente}
                    textAnchor="middle"
                    fill={COLORES[i % COLORES.length]}
                    className={styles.svgCota}
                  >
                    {formatNumber(formato.ancho, 0)} mm
                  </text>
                </g>
              );
            })}

            {/* Cotas de altura (a la derecha del dibujo) */}
            {formatosSeleccionados.map((formato, i) => {
              const xFin = geometria.maxAncho + geometria.margenDerecho * (0.12 + 0.16 * i);
              return (
                <g key={`alto-${formato.id}`}>
                  <line
                    x1={0}
                    y1={formato.alto}
                    x2={xFin}
                    y2={formato.alto}
                    className={styles.svgGuia}
                    strokeWidth={geometria.base / 500}
                    strokeDasharray={`${geometria.base / 100} ${geometria.base / 130}`}
                  />
                  <line
                    x1={xFin}
                    y1={0}
                    x2={xFin}
                    y2={formato.alto}
                    stroke={COLORES[i % COLORES.length]}
                    strokeWidth={geometria.base / 400}
                  />
                  <text
                    x={xFin + geometria.fuente * 0.35}
                    y={formato.alto - geometria.fuente * 0.3}
                    fontSize={geometria.fuente}
                    textAnchor="start"
                    fill={COLORES[i % COLORES.length]}
                    className={styles.svgCota}
                  >
                    {formatNumber(formato.alto, 0)} mm
                  </text>
                </g>
              );
            })}

            {/* Nombres apilados dentro del dibujo */}
            {formatosSeleccionados.map((formato, i) => (
              <text
                key={`nombre-${formato.id}`}
                x={geometria.fuente * 0.5}
                y={geometria.fuente * (1.2 + 1.3 * i)}
                fontSize={geometria.fuente}
                fill={COLORES[i % COLORES.length]}
                className={styles.svgNombre}
              >
                {formato.nombre}
              </text>
            ))}
          </svg>
        </div>

        {/* Lectura numérica de la comparación */}
        {referencia && formatosSeleccionados.length > 1 && (
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <caption className={styles.tablaCaption}>
                Diferencias respecto a <strong>{referencia.nombre}</strong> ({textoMm(referencia)})
              </caption>
              <thead>
                <tr>
                  <th scope="col">Formato</th>
                  <th scope="col">Medida</th>
                  <th scope="col">Δ ancho</th>
                  <th scope="col">Δ alto</th>
                  <th scope="col">¿Encaja dentro?</th>
                </tr>
              </thead>
              <tbody>
                {formatosSeleccionados.slice(1).map((f) => {
                  const dAncho = f.ancho - referencia.ancho;
                  const dAlto = f.alto - referencia.alto;
                  const encaja = f.ancho <= referencia.ancho && f.alto <= referencia.alto;
                  return (
                    <tr key={f.id}>
                      <th scope="row">{f.nombre}</th>
                      <td>{textoMm(f)}</td>
                      <td className={dAncho > 0 ? styles.deltaPos : styles.deltaNeg}>
                        {dAncho === 0
                          ? '—'
                          : `${dAncho > 0 ? '+' : '−'}${formatNumber(Math.abs(dAncho), 0)} mm`}
                      </td>
                      <td className={dAlto > 0 ? styles.deltaPos : styles.deltaNeg}>
                        {dAlto === 0
                          ? '—'
                          : `${dAlto > 0 ? '+' : '−'}${formatNumber(Math.abs(dAlto), 0)} mm`}
                      </td>
                      <td>
                        {encaja ? (
                          <span className={styles.si}>Sí, cabe entero</span>
                        ) : (
                          <span className={styles.no}>No, se sale</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Notas de los formatos elegidos */}
        {formatosSeleccionados.some((f) => f.nota) && (
          <ul className={styles.notas}>
            {formatosSeleccionados
              .filter((f) => f.nota)
              .map((f) => (
                <li key={`nota-${f.id}`}>
                  <strong>{f.nombre}:</strong> {f.nota}
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* ═══════════ COMPROBADOR DE IMPRESIÓN ═══════════ */}
      <section className={styles.bloque} aria-labelledby="titulo-impresion">
        <h2 id="titulo-impresion" className={styles.bloqueTitulo}>
          <span aria-hidden="true">🖨️</span> ¿Cabe en mi impresora?
        </h2>
        <p className={styles.bloqueIntro}>
          El caso clásico: recibes un PDF en Carta u Oficio y tu bandeja tiene A4 (o al revés).
          Calcula el porcentaje de escala necesario y cuánto papel queda sin usar.
        </p>

        <div className={styles.filaControles}>
          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="origen">
              Documento original en
            </label>
            <select
              id="origen"
              className={styles.select}
              value={origenId}
              onChange={(e) => setOrigenId(e.target.value)}
            >
              {CATEGORIAS.map((cat) => (
                <optgroup key={cat.id} label={cat.etiqueta}>
                  {FORMATOS.filter((f) => f.categoria === cat.id).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="destino">
              Papel disponible
            </label>
            <select
              id="destino"
              className={styles.select}
              value={destinoId}
              onChange={(e) => setDestinoId(e.target.value)}
            >
              {CATEGORIAS.map((cat) => (
                <optgroup key={cat.id} label={cat.etiqueta}>
                  {FORMATOS.filter((f) => f.categoria === cat.id).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {comprobacion && (
          <>
            <div className={styles.resultadosGrid}>
              <div className={`${styles.resultado} ${styles.resultadoPrincipal}`}>
                <span className={styles.resultadoEtiqueta}>Escala necesaria</span>
                <strong className={styles.resultadoValor}>
                  {formatNumber(Math.min(comprobacion.escala, 100), 1)} %
                </strong>
                <span className={styles.resultadoNota}>
                  {comprobacion.cabeEntero
                    ? 'Cabe al 100 %: imprime a tamaño real sin reducir.'
                    : `Reduce al ${formatNumber(comprobacion.escala, 1)} % para que entre completo.`}
                </span>
              </div>

              <div className={styles.resultado}>
                <span className={styles.resultadoEtiqueta}>Papel sobrante tras escalar</span>
                <strong className={styles.resultadoValor}>
                  {formatNumber(Math.max(comprobacion.sobranteAncho, 0), 0)} ×{' '}
                  {formatNumber(Math.max(comprobacion.sobranteAlto, 0), 0)} mm
                </strong>
                <span className={styles.resultadoNota}>
                  Franja libre a lo ancho y a lo alto, que se reparte como margen adicional.
                </span>
              </div>

              <div className={styles.resultado}>
                <span className={styles.resultadoEtiqueta}>Aprovechamiento de la hoja</span>
                <strong className={styles.resultadoValor}>
                  {formatNumber(comprobacion.aprovechamiento, 1)} %
                </strong>
                <span className={styles.resultadoNota}>
                  {comprobacion.mismaProporcion
                    ? 'Ambos formatos comparten proporción: el ajuste es perfecto.'
                    : 'Las proporciones no coinciden, así que siempre queda papel sin usar.'}
                </span>
              </div>

              <div className={styles.resultado}>
                <span className={styles.resultadoEtiqueta}>Si imprimes al 100 % sin reducir</span>
                <strong className={styles.resultadoValor}>
                  {comprobacion.recorteAncho === 0 && comprobacion.recorteAlto === 0
                    ? 'No se corta nada'
                    : `Se pierden ${formatNumber(comprobacion.recorteAncho, 0)} mm de ancho y ${formatNumber(
                        comprobacion.recorteAlto,
                        0
                      )} mm de alto`}
                </strong>
                <span className={styles.resultadoNota}>
                  El recorte cae en el borde derecho e inferior salvo que centres el documento.
                </span>
              </div>
            </div>

            <p className={styles.aclaracion}>
              <span aria-hidden="true">💡</span> En el diálogo de impresión busca la opción{' '}
              <strong>«Ajustar al área imprimible»</strong> o <strong>«Escala personalizada»</strong>{' '}
              e introduce el porcentaje calculado. Si eliges «Tamaño real» con formatos que no
              coinciden, el documento se recortará.
            </p>
          </>
        )}
      </section>

      {/* ═══════════ CATÁLOGO ═══════════ */}
      <section className={styles.bloque} aria-labelledby="titulo-catalogo">
        <h2 id="titulo-catalogo" className={styles.bloqueTitulo}>
          <span aria-hidden="true">📋</span> Catálogo de formatos
        </h2>

        <div className={styles.chips} role="group" aria-label="Familias de formatos">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.chip} ${categoriaActiva === cat.id ? styles.chipActivo : ''}`}
              aria-pressed={categoriaActiva === cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
            >
              <span aria-hidden="true">{cat.icono}</span> {cat.etiqueta}
            </button>
          ))}
        </div>

        {categoriaInfo && <p className={styles.bloqueIntro}>{categoriaInfo.descripcion}</p>}

        <div className={styles.dpiFila}>
          <span className={styles.etiqueta} id="etiqueta-dpi">
            Resolución para la columna de píxeles
          </span>
          <div className={styles.chips} role="group" aria-labelledby="etiqueta-dpi">
            {OPCIONES_DPI.map((opcion) => (
              <button
                key={opcion}
                type="button"
                className={`${styles.chip} ${dpi === opcion ? styles.chipActivo : ''}`}
                aria-pressed={dpi === opcion}
                onClick={() => setDpi(opcion)}
              >
                {opcion} DPI
              </button>
            ))}
            <span className={styles.dpiLibre}>
              <label className={styles.etiquetaEnLinea} htmlFor="dpi-libre">
                Otro
              </label>
              <input
                id="dpi-libre"
                className={styles.input}
                type="text"
                inputMode="numeric"
                value={dpiLibre}
                placeholder="p. ej. 240"
                onChange={(e) => setDpiLibre(e.target.value)}
                onBlur={aplicarDpiLibre}
              />
              <button type="button" className={styles.btnSecundario} onClick={aplicarDpiLibre}>
                Aplicar
              </button>
            </span>
          </div>
        </div>

        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <caption className={styles.tablaCaption}>
              Medidas exactas · columna de píxeles calculada a {formatNumber(dpi, 0)} DPI
            </caption>
            <thead>
              <tr>
                <th scope="col">Formato</th>
                <th scope="col">Milímetros</th>
                <th scope="col">Centímetros</th>
                <th scope="col">Pulgadas</th>
                <th scope="col">Píxeles</th>
                <th scope="col">Superficie</th>
                <th scope="col">Comparar</th>
              </tr>
            </thead>
            <tbody>
              {formatosCategoria.map((f) => (
                <tr key={f.id}>
                  <th scope="row">
                    {f.nombre}
                    {f.nota && <span className={styles.notaCelda}>{f.nota}</span>}
                  </th>
                  <td>
                    {formatNumber(f.ancho, 0)} × {formatNumber(f.alto, 0)}
                  </td>
                  <td>
                    {formatNumber(mmACm(f.ancho), 1)} × {formatNumber(mmACm(f.alto), 1)}
                  </td>
                  <td>
                    {formatNumber(mmAPulgadas(f.ancho), 2)} × {formatNumber(mmAPulgadas(f.alto), 2)}
                  </td>
                  <td>
                    {formatNumber(mmAPixeles(f.ancho, dpi), 0)} ×{' '}
                    {formatNumber(mmAPixeles(f.alto, dpi), 0)}
                  </td>
                  <td>{formatNumber(superficieCm2(f), 0)} cm²</td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnMini}
                      onClick={() => alternarFormato(f.id)}
                      aria-pressed={seleccionados.includes(f.id)}
                      disabled={!seleccionados.includes(f.id) && seleccionados.length >= MAX_COMPARAR}
                    >
                      {seleccionados.includes(f.id) ? 'Quitar' : 'Añadir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════ CONVERSOR DE UNIDADES ═══════════ */}
      <section className={styles.bloque} aria-labelledby="titulo-conversor">
        <h2 id="titulo-conversor" className={styles.bloqueTitulo}>
          <span aria-hidden="true">📏</span> Conversor de unidades
        </h2>
        <p className={styles.bloqueIntro}>
          Milímetros, centímetros, pulgadas y píxeles. Ojo con la última: el píxel no es una
          medida física, así que la conversión depende siempre de los DPI que elijas.
        </p>

        <div className={styles.filaControles}>
          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="valor-conversor">
              Valor
            </label>
            <input
              id="valor-conversor"
              className={styles.input}
              type="text"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="210"
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="unidad-conversor">
              Unidad de partida
            </label>
            <select
              id="unidad-conversor"
              className={styles.select}
              value={unidad}
              onChange={(e) => setUnidad(e.target.value as UnidadConversor)}
            >
              <option value="mm">Milímetros (mm)</option>
              <option value="cm">Centímetros (cm)</option>
              <option value="in">Pulgadas (in)</option>
              <option value="px">Píxeles (px)</option>
            </select>
          </div>
          <div className={styles.campo}>
            <label className={styles.etiqueta} htmlFor="dpi-conversor">
              Resolución (DPI / PPP)
            </label>
            <select
              id="dpi-conversor"
              className={styles.select}
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
            >
              {[...new Set([...OPCIONES_DPI, dpi])]
                .sort((a, b) => a - b)
                .map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {formatNumber(opcion, 0)} DPI
                  </option>
                ))}
            </select>
          </div>
        </div>

        {conversion ? (
          <div className={styles.resultadosGrid}>
            <div className={styles.resultado}>
              <span className={styles.resultadoEtiqueta}>Milímetros</span>
              <strong className={styles.resultadoValor}>{formatNumber(conversion.mm, 2)} mm</strong>
            </div>
            <div className={styles.resultado}>
              <span className={styles.resultadoEtiqueta}>Centímetros</span>
              <strong className={styles.resultadoValor}>{formatNumber(conversion.cm, 2)} cm</strong>
            </div>
            <div className={styles.resultado}>
              <span className={styles.resultadoEtiqueta}>Pulgadas</span>
              <strong className={styles.resultadoValor}>
                {formatNumber(conversion.pulgadas, 3)} in
              </strong>
            </div>
            <div className={`${styles.resultado} ${styles.resultadoPrincipal}`}>
              <span className={styles.resultadoEtiqueta}>
                Píxeles a {formatNumber(dpi, 0)} DPI
              </span>
              <strong className={styles.resultadoValor}>
                {formatNumber(conversion.pixeles, 0)} px
              </strong>
              <span className={styles.resultadoNota}>
                A 72 DPI serían {formatNumber(mmAPixeles(conversion.mm, 72), 0)} px y a 300 DPI,{' '}
                {formatNumber(mmAPixeles(conversion.mm, 300), 0)} px.
              </span>
            </div>
          </div>
        ) : (
          <p className={styles.aclaracion} role="status" aria-live="polite">
            Introduce un valor mayor que cero para ver la conversión.
          </p>
        )}
      </section>

      {/* ═══════════ LA PROPORCIÓN √2 ═══════════ */}
      <section className={styles.bloque} aria-labelledby="titulo-raiz">
        <h2 id="titulo-raiz" className={styles.bloqueTitulo}>
          <span aria-hidden="true">✂️</span> Por qué al doblar un A4 sale un A5
        </h2>
        <p className={styles.bloqueIntro}>
          La serie A tiene una propiedad matemática poco conocida: la proporción entre el lado
          largo y el corto es exactamente √2 ≈ 1,4142. Es la única proporción que se conserva al
          partir la hoja por la mitad, así que cada doblez genera el formato siguiente sin
          deformar nada.
        </p>

        <div className={styles.lienzo}>
          <svg
            className={styles.svgDoblado}
            viewBox="-6 -6 1201 853"
            role="img"
            aria-label="Un A0 en horizontal de 1189 por 841 milímetros dividido sucesivamente por la mitad: A1 ocupa la mitad izquierda, A2 la mitad superior del resto, A3 la mitad izquierda del resto, y así hasta A7. Cada formato es exactamente la mitad del anterior y todos conservan la misma proporción."
            preserveAspectRatio="xMidYMid meet"
          >
            <rect
              x={0}
              y={0}
              width={1189}
              height={841}
              className={styles.svgLamina}
              strokeWidth={4}
            />
            {PIEZAS_DOBLADO.map((pieza, i) => (
              <g key={pieza.etiqueta}>
                <rect
                  x={pieza.x}
                  y={pieza.y}
                  width={pieza.ancho}
                  height={pieza.alto}
                  fill={COLORES[i % COLORES.length]}
                  fillOpacity={0.14 + i * 0.05}
                  stroke={COLORES[i % COLORES.length]}
                  strokeWidth={3}
                />
                {i < 5 && (
                  <text
                    x={pieza.x + pieza.ancho / 2}
                    y={pieza.y + pieza.alto / 2 + 16}
                    fontSize={Math.max(26, Math.min(pieza.ancho, pieza.alto) / 3.2)}
                    textAnchor="middle"
                    fill={COLORES[i % COLORES.length]}
                    className={styles.svgNombre}
                  >
                    {pieza.etiqueta}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        <div className={styles.demostracion}>
          <h3 className={styles.demoTitulo}>La cuenta, paso a paso</h3>
          <ol className={styles.demoLista}>
            <li>
              La norma ISO 216 impone dos condiciones al A0: que su superficie sea{' '}
              <strong>1 m²</strong> y que su proporción sea <strong>alto ÷ ancho = √2</strong>.
            </li>
            <li>
              Si el ancho es <em>a</em>, el alto es <em>a</em>·√2, y el área <em>a</em>²·√2 = 1 m².
              De ahí <em>a</em> = 1 ÷ ⁴√2 = 0,8409 m → <strong>841 mm</strong>, y el alto{' '}
              841 · 1,4142 = <strong>1.189 mm</strong>.
            </li>
            <li>
              Al doblar por la mitad el lado largo, la hoja pasa a medir 841 × 594,5: la nueva
              proporción es 841 ÷ 594,5 = 1,4142. <strong>La misma de antes.</strong>
            </li>
            <li>
              Consecuencia práctica: el A4 es 1/16 de un A0, así que su superficie es 1/16 m² =
              625 cm² (623,7 exactos por el redondeo a milímetros). Por eso un papel de 80 g/m²
              da hojas A4 de exactamente 5 gramos, y una resma de 500 pesa 2,5 kg.
            </li>
          </ol>
        </div>
      </section>

      {/* ═══════════ CONTENIDO EDUCATIVO v2.0 ═══════════ */}
      <EducationalSection
        icon="📚"
        title="Todo sobre los formatos de papel"
        subtitle="Historia de la norma ISO 216, series A/B/C, DPI, márgenes de impresión y el eterno conflicto A4 vs Carta"
      >
        <div className={styles.edu}>
          {/* Introducción */}
          <section className={styles.eduSeccion}>
            <h3>El papel no siempre estuvo normalizado</h3>
            <p>
              Hasta bien entrado el siglo XX, cada fábrica y cada país cortaba el papel a su
              manera: folio, holandesa, cuartilla, marquilla, imperial… La idea de encadenar los
              tamaños mediante la proporción √2 la formuló el físico alemán{' '}
              <strong>Georg Lichtenberg</strong> en una carta de 1786, pero no se convirtió en
              norma hasta que Alemania publicó la <strong>DIN 476</strong> en 1922, a propuesta
              del ingeniero Walter Porstmann. La norma internacional{' '}
              <strong>ISO 216</strong> (1975) recogió aquel sistema casi sin cambios y hoy lo
              siguen prácticamente todos los países del mundo salvo Estados Unidos, Canadá,
              México y una parte de Centroamérica y el Caribe, donde el estándar de oficina es
              el Carta (Letter).
            </p>
            <p>
              Que existan dos sistemas incompatibles no es una curiosidad inocua: cada vez que un
              documento cruza esa frontera —un PDF, una plantilla de Word, un currículum— aparece
              el mismo problema de escala. Ninguno de los dos sistemas es mejor; simplemente
              responden a historias industriales distintas y no encajan entre sí.
            </p>
          </section>

          {/* 1. Tabla comparativa */}
          <section className={styles.eduSeccion}>
            <h3>Las cuatro familias de un vistazo</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Criterio</th>
                    <th scope="col">Serie A</th>
                    <th scope="col">Serie B</th>
                    <th scope="col">Serie C</th>
                    <th scope="col">ANSI (Carta/Oficio)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Proporción</th>
                    <td>1:√2 (1,414)</td>
                    <td>1:√2 (1,414)</td>
                    <td>1:√2 (1,414)</td>
                    <td>1:1,294 (Carta) y 1:1,647 (Oficio)</td>
                  </tr>
                  <tr>
                    <th scope="row">Punto de partida</th>
                    <td>A0 = 1 m²</td>
                    <td>B0 = 1 m de lado corto</td>
                    <td>Media geométrica entre A y B</td>
                    <td>Pulgadas redondas (8,5 × 11)</td>
                  </tr>
                  <tr>
                    <th scope="row">Uso principal</th>
                    <td>Documentos, oficina, carteles</td>
                    <td>Libros, carteles, pasaportes</td>
                    <td>Sobres y carpetas</td>
                    <td>Oficina en Norteamérica</td>
                  </tr>
                  <tr>
                    <th scope="row">¿Se conserva al doblar?</th>
                    <td>✅ Sí</td>
                    <td>✅ Sí</td>
                    <td>✅ Sí</td>
                    <td>❌ No: medio Carta es 8,5 × 5,5, otra proporción</td>
                  </tr>
                  <tr>
                    <th scope="row">Formato de referencia</th>
                    <td>A4 · 210 × 297 mm</td>
                    <td>B5 · 176 × 250 mm</td>
                    <td>C4 · 229 × 324 mm</td>
                    <td>Carta · 216 × 279 mm</td>
                  </tr>
                  <tr>
                    <th scope="row">Ideal para…</th>
                    <td>Cualquier documento que viaje fuera de Norteamérica</td>
                    <td>Maquetar libros y revistas con margen extra</td>
                    <td>Enviar por correo un documento de la serie A</td>
                    <td>Documentos destinados a EE. UU. y México</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.eduSeccion}>
            <h3>Cuatro situaciones reales</h3>
            <div className={styles.eduEscenariosGrid}>
              <article className={styles.eduEscenarioCard}>
                <h4>
                  <span aria-hidden="true">✉️</span> Enviar un contrato sin doblarlo
                </h4>
                <p>
                  Necesitas mandar un A4 firmado sin pliegues. El sobre correcto es el{' '}
                  <strong>C4 (229 × 324 mm)</strong>: deja 19 mm de holgura a lo ancho y 27 mm a
                  lo alto. Si lo doblas por la mitad, va en un C5; en tres partes, en un sobre DL
                  de 110 × 220 mm, el de las facturas.
                </p>
              </article>
              <article className={styles.eduEscenarioCard}>
                <h4>
                  <span aria-hidden="true">🌎</span> Un PDF mexicano en una impresora española
                </h4>
                <p>
                  El documento viene en Carta (216 × 279 mm) y la bandeja tiene A4 (210 × 297).
                  Sobran 6 mm de ancho, así que hay que reducir al{' '}
                  <strong>97,2 %</strong>. A cambio quedan 18 mm libres abajo. Si imprimes a
                  «tamaño real», pierdes 6 mm del margen derecho.
                </p>
              </article>
              <article className={styles.eduEscenarioCard}>
                <h4>
                  <span aria-hidden="true">🖼️</span> Preparar una imagen para imprenta
                </h4>
                <p>
                  Un cartel A3 a 300 DPI necesita <strong>3.508 × 4.961 px</strong>. Si la imagen
                  original tiene 1.200 px de ancho, al imprimirla a ese tamaño quedará a 103 DPI:
                  se verá pixelada. La resolución del archivo manda sobre el tamaño de salida.
                </p>
              </article>
              <article className={styles.eduEscenarioCard}>
                <h4>
                  <span aria-hidden="true">🗂️</span> Digitalizar papeles antiguos
                </h4>
                <p>
                  Cuartillas, folios y holandesas no coinciden con ningún preajuste del escáner.
                  Escanea en A4 y recorta: una cuartilla (155 × 215 mm) deja bordes de 55 y 82 mm
                  que conviene eliminar para que el archivo no pese de más.
                </p>
              </article>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.eduSeccion}>
            <h3>Preguntas frecuentes</h3>
            <div className={styles.eduFaq}>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqPregunta}>
                  ¿Un folio y un A4 son lo mismo?
                </summary>
                <p className={styles.eduFaqRespuesta}>
                  En el uso corriente de hoy, sí: cuando alguien pide «un folio» está pidiendo un
                  A4 de 210 × 297 mm. Históricamente no era así: el folio español era un formato
                  distinto de unos 215 × 315 mm, más ancho y más largo, que fue desapareciendo con
                  la adopción de la norma ISO. La palabra sobrevivió al objeto. Si lees «folio» en
                  un documento anterior a los años setenta, conviene comprobar las medidas.
                </p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqPregunta}>
                  ¿Cuántos píxeles tiene un A4 exactamente?
                </summary>
                <p className={styles.eduFaqRespuesta}>
                  No tiene «unos» píxeles: depende de la resolución. Son 595 × 842 px a 72 DPI,
                  1.240 × 1.754 px a 150 DPI, 2.480 × 3.508 px a 300 DPI y 4.961 × 7.016 px a 600
                  DPI. El píxel es una unidad relativa, no física: solo se convierte en milímetros
                  cuando decides a qué densidad vas a imprimir o mostrar la imagen.
                </p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqPregunta}>
                  ¿Por qué mi impresora deja siempre un margen blanco?
                </summary>
                <p className={styles.eduFaqRespuesta}>
                  Porque los rodillos necesitan sujetar el papel por los bordes. La mayoría de
                  impresoras domésticas de inyección reservan entre 3 y 5 mm por los lados y
                  arriba, y hasta 10-15 mm por abajo. Ese es el <em>área no imprimible</em>. Solo
                  los modelos con función «sin bordes» imprimen hasta el filo, y lo hacen
                  ampliando ligeramente la imagen para que sobresalga. En imprenta profesional el
                  equivalente es el <em>sangrado</em>: 3 mm de imagen extra que luego se guillotinan.
                </p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqPregunta}>
                  ¿Qué diferencia hay entre DPI y PPP? ¿Y PPI?
                </summary>
                <p className={styles.eduFaqRespuesta}>
                  DPI (<em>dots per inch</em>) y PPP (puntos por pulgada) son el mismo concepto en
                  inglés y en español. PPI (<em>pixels per inch</em>) se refiere estrictamente a
                  píxeles de imagen, mientras que DPI describe los puntos de tinta que deposita la
                  impresora. En la práctica los programas los usan como sinónimos, y para calcular
                  el tamaño de impresión basta con la regla: milímetros = píxeles ÷ DPI × 25,4.
                </p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqPregunta}>
                  ¿Por qué mi «Oficio» no coincide con el «Legal» del programa?
                </summary>
                <p className={styles.eduFaqRespuesta}>
                  Porque son dos formatos distintos con nombres cruzados. El Legal estadounidense
                  mide 216 × 356 mm (8,5 × 14 pulgadas), pero en México y otros países de la
                  región el «Oficio» tradicional mide 216 × 340 mm. Son 16 mm de diferencia: poco
                  para verlo a ojo, suficiente para que una tabla se corte o se descoloquen los
                  pies de página. Comprueba siempre las medidas, no el nombre.
                </p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqPregunta}>
                  ¿Cuánto pesa una hoja de papel?
                </summary>
                <p className={styles.eduFaqRespuesta}>
                  Se calcula directamente gracias a que el A0 mide 1 m². Un papel de 80 g/m² da
                  hojas A4 de 5 g exactos (80 ÷ 16), A3 de 10 g y A5 de 2,5 g. Es un dato práctico
                  para calcular franqueo: una carta con tres A4 y un sobre DL ronda los 20 g, por
                  debajo del primer escalón tarifario habitual.
                </p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqPregunta}>
                  ¿Qué formato uso para un currículum internacional?
                </summary>
                <p className={styles.eduFaqRespuesta}>
                  A4 si el destino es Europa, Latinoamérica (salvo México), Asia, África u
                  Oceanía; Carta si es Estados Unidos, Canadá o México. Si dudas, exporta el PDF
                  en A4 pero deja márgenes generosos de al menos 20 mm: así, aunque se imprima en
                  Carta a tamaño real, no se corta ningún texto. Es el truco de maquetación que
                  usan las plantillas pensadas para ambos mercados.
                </p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqPregunta}>
                  ¿Existe un formato que sirva para los dos sistemas?
                </summary>
                <p className={styles.eduFaqRespuesta}>
                  No como papel físico, pero sí como área de maquetación. Se llama informalmente
                  «área segura» y consiste en diseñar dentro de un rectángulo de{' '}
                  <strong>210 × 279 mm</strong>: el ancho del A4 y el alto del Carta, es decir, la
                  intersección de ambos. Cualquier contenido dentro de esa caja se imprime
                  completo en los dos formatos sin reducir la escala.
                </p>
              </details>
            </div>
          </section>

          {/* 4. Guía paso a paso */}
          <section className={styles.eduSeccion}>
            <h3>Cómo imprimir un documento en un formato distinto al original</h3>
            <ol className={styles.eduPasos}>
              <li>
                <strong>Identifica el formato del archivo, no el nombre.</strong> En un PDF, abre
                Archivo → Propiedades y lee «Tamaño de página». Si dice 216 × 279 mm es Carta, no
                A4, aunque el remitente lo llame «hoja normal».
              </li>
              <li>
                <strong>Comprueba el papel que hay en la bandeja.</strong> Muchas impresoras
                asumen A4 por configuración regional y avisan de «discordancia de tamaño» aunque
                el papel esté bien. Ajusta el tamaño en el panel de la impresora, no solo en el
                programa.
              </li>
              <li>
                <strong>Calcula la escala necesaria</strong> con el comprobador de esta página. De
                Carta a A4 es 97,2 %; de A4 a Carta, 94,3 %; de Oficio a A4, 83,5 %.
              </li>
              <li>
                <strong>Elige la opción correcta en el diálogo de impresión.</strong> «Ajustar» o
                «Encajar» reduce automáticamente; «Tamaño real» imprime al 100 % y recorta;
                «Escala personalizada» te deja escribir el porcentaje exacto.
              </li>
              <li>
                <strong>Activa el centrado.</strong> Si no, todo el sobrante se acumula en un solo
                lado y el documento queda descuadrado en la hoja.
              </li>
              <li>
                <strong>Haz una prueba en borrador antes de la tirada.</strong> Una sola página en
                calidad baja te ahorra descubrir a la página cuarenta que se cortan los números de
                página.
              </li>
              <li>
                <strong>Si el documento es tuyo, corrige el origen.</strong> Cambiar el tamaño de
                página en el procesador de textos y reajustar los márgenes evita repetir la
                gimnasia cada vez que alguien lo imprima.
              </li>
            </ol>
          </section>

          {/* 5. Mejores prácticas */}
          <section className={styles.eduSeccion}>
            <h3>Buenas prácticas</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcono} aria-hidden="true">
                  📐
                </span>
                <h4>Maqueta en 210 × 279 mm si el documento cruza el Atlántico</h4>
                <p>Es la intersección de A4 y Carta: se imprime entero en ambos sin escalar.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcono} aria-hidden="true">
                  🎯
                </span>
                <h4>300 DPI para imprenta, 150 para casa, 72 para pantalla</h4>
                <p>Subir de 300 casi nunca mejora el resultado visible y multiplica el peso.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcono} aria-hidden="true">
                  ✉️
                </span>
                <h4>El sobre lleva la misma letra y número que el papel más uno</h4>
                <p>A4 sin doblar → C4. A4 doblado por la mitad → C5. En cuatro → C6.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcono} aria-hidden="true">
                  🩹
                </span>
                <h4>Reserva 3 mm de sangrado en cualquier diseño a color total</h4>
                <p>Sin sangrado, el corte de la guillotina deja filos blancos irregulares.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcono} aria-hidden="true">
                  🔢
                </span>
                <h4>Guarda las medidas en milímetros, no en píxeles</h4>
                <p>El milímetro es absoluto; el píxel cambia de significado con cada DPI.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcono} aria-hidden="true">
                  📄
                </span>
                <h4>Exporta a PDF/A si el documento debe conservarse</h4>
                <p>Fija tipografías y tamaño de página: nadie lo reescalará por accidente.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning box */}
          <div className={styles.warningBox}>
            <span className={styles.warningIcono} aria-hidden="true">
              ⚠️
            </span>
            <div>
              <strong>Errores comunes al trabajar con formatos de papel</strong>
              <ul>
                <li>
                  <strong>❌ Dar por hecho que «folio» es un tamaño concreto:</strong> hoy significa
                  A4 en el habla corriente, pero el folio histórico medía 215 × 315 mm. En un pliego
                  de condiciones o un documento antiguo, confirma las medidas antes de maquetar.
                </li>
                <li>
                  <strong>❌ Imprimir un Carta en A4 a «tamaño real»:</strong> se pierden 6 mm del
                  borde derecho, justo donde suelen caer los números de las tablas. Reduce al 97,2 %
                  y activa el centrado.
                </li>
                <li>
                  <strong>❌ Confundir «Oficio» con «Legal»:</strong> 216 × 340 mm frente a 216 × 356
                  mm. Los 16 mm de diferencia bastan para descolocar un pie de página o cortar la
                  última fila de una tabla.
                </li>
                <li>
                  <strong>❌ Pedir «un A4 en píxeles» sin decir la resolución:</strong> la respuesta
                  varía entre 595 y 4.961 px de ancho. Sin DPI, el dato no significa nada.
                </li>
                <li>
                  <strong>❌ Diseñar hasta el borde exacto de la hoja:</strong> la impresora reserva
                  de 3 a 15 mm no imprimibles. Todo lo que quede fuera de esa zona desaparece sin
                  aviso.
                </li>
                <li>
                  <strong>❌ Ampliar una imagen pequeña para llenar un A3:</strong> una foto de 1.200
                  px de ancho queda a 103 DPI en A3. Ampliar no crea información: el resultado se ve
                  borroso por mucho que el archivo pese más al reescalarlo.
                </li>
                <li>
                  <strong>❌ Meter un A4 sin doblar en un sobre C5:</strong> el C5 mide 162 × 229 mm
                  y está pensado para el A4 ya doblado. Para enviarlo plano hace falta un C4.
                </li>
                <li>
                  <strong>❌ Suponer que media hoja de Carta es «Carta a la mitad» proporcional:</strong>{' '}
                  no lo es. Al partir un Carta cambia la proporción, mientras que en la serie A se
                  mantiene siempre. Es la razón práctica por la que la norma ISO resulta más cómoda
                  para fotocopiar y encuadernar.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-tamanos-papel')} />

      <ShareCard appName="comparador-tamanos-papel" />

      <Footer appName="comparador-tamanos-papel" />
    </div>
  );
}
