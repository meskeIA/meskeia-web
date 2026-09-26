'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef } from 'react';
import styles from './SimuladorTablaPeriodica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  ELEMENTOS,
  ANION_NO_ESTABLE,
  IONIZACION_CALCULADA,
  FUSION_ESTIMADA,
  NOTAS_FUSION,
  type Elemento,
} from './datos';

// ============================================================
// TIPOS
// ============================================================
type PropiedadKey = 'radioAtomico' | 'electronegatividad' | 'energiaIonizacion' | 'afinidadElectronica' | 'puntoFusion';

interface PropiedadInfo {
  key: PropiedadKey;
  label: string;
  /** Unidad que acompaña a la cifra («pm», «kJ/mol», «°C»); vacía si es adimensional. */
  unidad: string;
  /** Texto entre paréntesis del botón: la unidad o, si no hay, la escala. */
  unidadBoton: string;
  /** Serie de datos y fuente, rotulada bajo la leyenda (hallazgos 1953 y 1959). */
  escala: string;
  descripcion: string;
  /** Dirección de aumento en el grupo (↑/↓), o `null` si no hay una tendencia única. */
  flechaGrupo: string | null;
  /** Dirección de aumento en el período (←/→), o `null` si no hay una tendencia única. */
  flechaPeriodo: string | null;
  textoGrupo: string;
  textoPeriodo: string;
}

// ============================================================
// PROPIEDADES SELECCIONABLES
// ============================================================
const PROPIEDADES: PropiedadInfo[] = [
  {
    key: 'radioAtomico',
    label: 'Radio atómico',
    unidad: 'pm',
    unidadBoton: 'pm',
    escala: 'Radio covalente de enlace sencillo (Pyykkö y Atsumi, 2009)',
    descripcion: 'Mitad de la distancia entre dos núcleos unidos por un enlace sencillo',
    flechaGrupo: '↓',
    flechaPeriodo: '←',
    textoGrupo: 'aumenta al bajar en el grupo',
    textoPeriodo: 'aumenta hacia la izquierda del período',
  },
  {
    key: 'electronegatividad',
    label: 'Electronegatividad',
    unidad: '',
    unidadBoton: 'Pauling',
    escala: 'Escala de Pauling (Allred, 1961; CRC Handbook)',
    descripcion: 'Capacidad de un átomo de atraer electrones del enlace',
    flechaGrupo: '↑',
    flechaPeriodo: '→',
    textoGrupo: 'aumenta al subir en el grupo',
    textoPeriodo: 'aumenta hacia la derecha del período',
  },
  {
    key: 'energiaIonizacion',
    label: '1.ª energía de ionización',
    unidad: 'kJ/mol',
    unidadBoton: 'kJ/mol',
    escala: 'NIST ASD y CRC Handbook; Rf–Og, valores calculados',
    descripcion: 'Energía necesaria para arrancar el primer electrón',
    flechaGrupo: '↑',
    flechaPeriodo: '→',
    textoGrupo: 'aumenta al subir en el grupo',
    textoPeriodo: 'aumenta hacia la derecha (con excepciones)',
  },
  {
    key: 'afinidadElectronica',
    label: 'Afinidad electrónica',
    unidad: 'kJ/mol',
    unidadBoton: 'kJ/mol',
    escala: 'ΔH al ganar un electrón, solo valores medidos (Ning y Lu, 2022)',
    descripcion: 'Energía liberada al ganar un electrón (más negativo = más favorable)',
    flechaGrupo: '↑',
    flechaPeriodo: '→',
    textoGrupo: 'más exotérmica al subir en el grupo (salvo F < Cl)',
    textoPeriodo: 'tendencia irregular, máxima en halógenos',
  },
  {
    key: 'puntoFusion',
    label: 'Punto de fusión',
    unidad: '°C',
    unidadBoton: '°C',
    escala: 'CRC Handbook, a 1 atm',
    descripcion: 'Temperatura a la que el sólido pasa a líquido',
    // Hallazgo 1958: no hay un sentido de aumento. En el período sube hasta el centro del
    // bloque d y baja después (el Ne, a la derecha, es de los más bajos); en el grupo 17
    // crece hacia abajo (F −219,6 → I 113,7) y en el grupo 1, al revés.
    flechaGrupo: null,
    flechaPeriodo: null,
    textoGrupo: 'en el grupo depende de la familia: sube en los halógenos, baja en los alcalinos',
    textoPeriodo: 'en el período crece hacia el centro del bloque d (máximo, W) y cae hacia los extremos',
  },
];

// ============================================================
// UTILIDADES
// ============================================================

/** Calcula el rango [min, max] de una propiedad sobre todos los elementos con valor no nulo */
function calcularRango(propiedad: PropiedadKey): { min: number; max: number } {
  const valores = ELEMENTOS
    .map(e => e[propiedad])
    .filter((v): v is number => v !== null);
  return { min: Math.min(...valores), max: Math.max(...valores) };
}

/** Interpola un color azul→amarillo→rojo según t ∈ [0,1] */
function interpolarColor(t: number): string {
  const r = Math.round(t < 0.5 ? t * 2 * 255 : 255);
  const g = Math.round(t < 0.5 ? t * 2 * 200 : (1 - t) * 2 * 200);
  const b = Math.round(t < 0.5 ? 255 : (1 - t) * 2 * 255);
  return `rgb(${r},${g},${b})`;
}

const GRIS_SIN_DATO = '#d4d4d4';

/** Convierte valor numérico a color del heatmap */
function valorAColor(valor: number | null, min: number, max: number): string {
  if (valor === null) return GRIS_SIN_DATO;
  if (max === min) return interpolarColor(0.5);
  const t = Math.max(0, Math.min(1, (valor - min) / (max - min)));
  return interpolarColor(t);
}

/** Luminancia relativa WCAG 2.x de un color sRGB (0-255 por canal). */
function luminancia(r: number, g: number, b: number): number {
  const lin = (c: number): number => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Texto negro o blanco, el que dé MÁS contraste WCAG sobre el fondo (hallazgo 1960). La
 * versión anterior decidía por una luminancia aproximada con umbral 140 y dejaba blanco
 * sobre rojo (4,00:1). Eligiendo el máximo de los dos, el peor caso de la escala está en
 * ~4,58:1: siempre por encima de 4,5.
 */
function colorTexto(bgColor: string): string {
  if (bgColor === GRIS_SIN_DATO) return '#333333'; // 8,3:1 sobre #d4d4d4
  const m = bgColor.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return '#000000';
  const l = luminancia(Number(m[1]), Number(m[2]), Number(m[3]));
  const conNegro = (l + 0.05) / 0.05;
  const conBlanco = 1.05 / (l + 0.05);
  return conNegro >= conBlanco ? '#000000' : '#ffffff';
}

const FORMATO_2 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const FORMATO_1 = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });

/**
 * Cifra en formato español con signo menos tipográfico (hallazgo 1954). Con los decimales
 * que el dato tiene (hasta 2 en la electronegatividad, hasta 1 en el resto): 3,98 no se
 * redondea a «4,0», y 53 pm no se convierte en «53,0».
 */
function formatearCifra(valor: number, propiedad: PropiedadKey): string {
  const f = propiedad === 'electronegatividad' ? FORMATO_2 : FORMATO_1;
  return f.format(valor + 0).replace('-', '−');
}

/** Cifra con su unidad, o «No disponible». Es lo que dicen el aria-label y el tooltip. */
function fmtValor(elemento: Elemento, propiedad: PropiedadKey, info: PropiedadInfo): string {
  const valor = elemento[propiedad];
  if (valor === null) return `No disponible${notaDe(elemento, propiedad)}`;
  const cifra = formatearCifra(valor, propiedad);
  const base = info.unidad ? `${cifra} ${info.unidad}` : `${cifra} (Pauling)`;
  return `${base}${notaDe(elemento, propiedad)}`;
}

/** Matiz del dato: estimado, calculado, sin anión estable o a otra presión. */
function notaDe(elemento: Elemento, propiedad: PropiedadKey): string {
  if (propiedad === 'afinidadElectronica' && ANION_NO_ESTABLE.has(elemento.Z)) {
    return ' · no forma anión estable';
  }
  if (propiedad === 'energiaIonizacion' && IONIZACION_CALCULADA.has(elemento.Z)) return ' · calculado';
  if (propiedad === 'puntoFusion') {
    if (FUSION_ESTIMADA.has(elemento.Z)) return ' · estimado';
    const nota = NOTAS_FUSION[elemento.Z];
    if (nota) return ` · ${nota}`;
  }
  return '';
}

/** Mapa grupo → columna CSS Grid (1-indexed): los grupos coinciden con las columnas. */
function grupoAColumna(grupo: number): number {
  return grupo;
}

// ============================================================
// MAPA DE POSICIONES DE LA TABLA (período, columna)
// ============================================================
// Los lantánidos (57-71) y actínidos (89-103) van en filas separadas.
// En la tabla principal, posiciones 57 y 89 muestran un marcador.

interface PosicionTabla {
  fila: number;    // 1-7
  columna: number; // 1-18
}

function obtenerPosicion(elemento: Elemento): PosicionTabla | null {
  if (elemento.grupo === null) return null; // lantánido/actínido → fila separada
  return {
    fila: elemento.periodo,
    columna: grupoAColumna(elemento.grupo),
  };
}

// ============================================================
// COMPONENTE CELDA
// ============================================================
interface CeldaProps {
  elemento: Elemento;
  propiedad: PropiedadKey;
  info: PropiedadInfo;
  bgColor: string;
  onHover: (elemento: Elemento | null, x: number, y: number) => void;
  esMarcador?: boolean;
}

function CeldaElemento({ elemento, propiedad, info, bgColor, onHover, esMarcador }: CeldaProps) {
  const textColor = colorTexto(bgColor);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    onHover(elemento, e.clientX, e.clientY);
  }, [elemento, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null, 0, 0);
  }, [onHover]);

  /**
   * Con teclado, el dato va JUNTO a la celda (hallazgo 1962): antes Enter lo abría en (0, 0),
   * la esquina de la ventana, y al tabular seguía mostrando el elemento anterior.
   */
  const mostrarJuntoACelda = useCallback((el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    onHover(elemento, r.left + r.width / 2, r.bottom);
  }, [elemento, onHover]);

  if (esMarcador) {
    // Solo remite a la fila inferior, donde La y Ac tienen su celda enfocable. Los colores
    // viven en el CSS, con su variante oscura (hallazgo 1961: el #555 en línea ganaba a la
    // regla oscura y quedaba a 1,40:1).
    return (
      <div
        className={`${styles.celda} ${styles.celdaMarcador}`}
        role="img"
        aria-label={`${elemento.nombre} (ver fila inferior)`}
      >
        <span className={styles.celdaZ} aria-hidden="true">{elemento.Z}</span>
        <span className={styles.celdaSimbolo} style={{ fontSize: '0.7rem' }} aria-hidden="true">*</span>
        <span className={styles.celdaValor} aria-hidden="true">{elemento.simbolo}</span>
      </div>
    );
  }

  const valor = elemento[propiedad];
  const valorFmt = valor !== null ? formatearCifra(valor, propiedad) : '—';

  return (
    <div
      className={styles.celda}
      style={{ backgroundColor: bgColor, color: textColor }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={(e) => mostrarJuntoACelda(e.currentTarget)}
      onBlur={() => onHover(null, 0, 0)}
      role="button"
      tabIndex={0}
      aria-label={`${elemento.nombre}, Z=${elemento.Z}, ${fmtValor(elemento, propiedad, info)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          mostrarJuntoACelda(e.currentTarget);
        } else if (e.key === 'Escape') {
          onHover(null, 0, 0);
        }
      }}
    >
      <span className={styles.celdaZ}>{elemento.Z}</span>
      <span className={styles.celdaSimbolo}>{elemento.simbolo}</span>
      <span className={styles.celdaValor}>{valorFmt}</span>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function SimuladorTablaPeriodica() {
  const [propiedad, setPropiedad] = useState<PropiedadKey>('electronegatividad');
  const [tooltip, setTooltip] = useState<{ elemento: Elemento; x: number; y: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const propInfo = PROPIEDADES.find(p => p.key === propiedad)!;
  const rango = calcularRango(propiedad);

  // Elementos de la tabla principal (con grupo)
  const elementosTabla = ELEMENTOS.filter(e => e.grupo !== null);
  // Lantánidos y actínidos
  const lantanidos = ELEMENTOS.filter(e => e.categoria === 'lantanido').sort((a, b) => a.Z - b.Z);
  const actinidos = ELEMENTOS.filter(e => e.categoria === 'actinido').sort((a, b) => a.Z - b.Z);

  // Construir mapa de posiciones para renderizar la grid
  const mapa = new Map<string, Elemento>();
  for (const el of elementosTabla) {
    const pos = obtenerPosicion(el);
    if (pos) {
      mapa.set(`${pos.fila}-${pos.columna}`, el);
    }
  }
  // Añadir marcadores para La y Ac en la tabla principal
  const laElement = ELEMENTOS.find(e => e.Z === 57)!;
  const acElement = ELEMENTOS.find(e => e.Z === 89)!;

  const handleHover = useCallback((elemento: Elemento | null, x: number, y: number) => {
    if (!elemento) {
      setTooltip(null);
    } else {
      setTooltip({ elemento, x, y });
    }
  }, []);

  // Calcular posición del tooltip para que no salga de pantalla
  const tooltipStyle: React.CSSProperties = (() => {
    if (!tooltip) return { display: 'none' };
    const tw = 220;
    const th = 140;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    let left = tooltip.x + 14;
    let top = tooltip.y + 14;
    if (left + tw > vw - 10) left = tooltip.x - tw - 14;
    if (top + th > vh - 10) top = tooltip.y - th - 14;
    return { left, top, display: 'block' };
  })();

  // Renderizar celdas de la tabla principal
  const renderFilas = () => {
    const filas: React.ReactNode[] = [];
    for (let fila = 1; fila <= 7; fila++) {
      for (let col = 1; col <= 18; col++) {
        const el = mapa.get(`${fila}-${col}`);

        // Posiciones especiales para lantánidos/actínidos
        const esLa = fila === 6 && col === 3;
        const esAc = fila === 7 && col === 3;

        if (esLa) {
          const bgColor = valorAColor(laElement[propiedad], rango.min, rango.max);
          filas.push(
            <CeldaElemento
              key={`marcador-la`}
              elemento={laElement}
              bgColor={bgColor}
              propiedad={propiedad}
              info={propInfo}
              onHover={handleHover}
              esMarcador
            />
          );
          continue;
        }
        if (esAc) {
          const bgColor = valorAColor(acElement[propiedad], rango.min, rango.max);
          filas.push(
            <CeldaElemento
              key={`marcador-ac`}
              elemento={acElement}
              bgColor={bgColor}
              propiedad={propiedad}
              info={propInfo}
              onHover={handleHover}
              esMarcador
            />
          );
          continue;
        }

        if (el) {
          const valor = el[propiedad];
          const bgColor = valorAColor(valor, rango.min, rango.max);
          filas.push(
            <CeldaElemento
              key={el.Z}
              elemento={el}
              bgColor={bgColor}
              propiedad={propiedad}
              info={propInfo}
              onHover={handleHover}
            />
          );
        } else {
          filas.push(<div key={`vacio-${fila}-${col}`} className={`${styles.celda} ${styles.celdaVacia}`} />);
        }
      }
    }
    return filas;
  };

  const renderFilaLantanoides = (elementos: Elemento[], etiqueta: string) => (
    <div className={styles.filaLantanidos}>
      <div className={styles.etiquetaLantanidos}>{etiqueta}</div>
      {elementos.map(el => {
        const valor = el[propiedad];
        const bgColor = valorAColor(valor, rango.min, rango.max);
        return (
          <CeldaElemento
            key={el.Z}
            elemento={el}
            bgColor={bgColor}
            propiedad={propiedad}
            info={propInfo}
            onHover={handleHover}
          />
        );
      })}
    </div>
  );

  const categoriaLabel = (cat: string): string => {
    const mapa: Record<string, string> = {
      'metal-alcalino': 'Metal alcalino',
      'metal-alcalinoterreo': 'Metal alcalinotérreo',
      'metal-transicion': 'Metal de transición',
      'metal-postransicion': 'Metal postransición',
      'metaloide': 'Metaloide',
      'no-metal': 'No metal',
      'halógeno': 'Halógeno',
      'gas-noble': 'Gas noble',
      'lantanido': 'Lantánido',
      'actinido': 'Actínido',
    };
    return mapa[cat] ?? cat;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Tendencias de la Tabla Periódica</h1>
        <p className={styles.subtitle}>
          Selecciona una propiedad y observa cómo cambia con el color en los 118 elementos.
          Pasa el cursor sobre cualquier elemento para ver sus datos exactos.
        </p>
      </header>

      <LegalNotice />

      {/* Botones de propiedad */}
      <div className={styles.propiedadButtons} role="group" aria-label="Seleccionar propiedad">
        {PROPIEDADES.map(p => (
          <button
            key={p.key}
            className={`${styles.propiedadBtn} ${propiedad === p.key ? styles.propiedadBtnActive : ''}`}
            onClick={() => setPropiedad(p.key)}
            aria-pressed={propiedad === p.key}
            type="button"
          >
            {p.label} ({p.unidadBoton})
          </button>
        ))}
      </div>

      {/* Flechas de tendencia y leyenda */}
      <div className={styles.tendenciasHeader}>
        <div className={styles.flechasRow}>
          <div className={styles.flechaItem}>
            {propInfo.flechaGrupo && <span className={styles.flechaIcon} aria-hidden="true">{propInfo.flechaGrupo}</span>}
            <span>{propInfo.textoGrupo}</span>
          </div>
          <div className={styles.flechaItem}>
            {propInfo.flechaPeriodo && <span className={styles.flechaIcon} aria-hidden="true">{propInfo.flechaPeriodo}</span>}
            <span>{propInfo.textoPeriodo}</span>
          </div>
        </div>
        <div className={styles.leyenda} aria-label="Leyenda de color">
          <div className={styles.leyendaTitulo}>{propInfo.label} ({propInfo.unidadBoton})</div>
          <div
            className={styles.leyendaGradiente}
            role="img"
            aria-label={`Escala de ${formatearCifra(rango.min, propiedad)} a ${formatearCifra(rango.max, propiedad)} ${propInfo.unidadBoton}`}
          />
          <div className={styles.leyendaLabels}>
            <span>{formatearCifra(rango.min, propiedad)} {propInfo.unidad}</span>
            <span>{formatearCifra(rango.max, propiedad)} {propInfo.unidad}</span>
          </div>
          <div className={styles.leyendaEscala}>{propInfo.escala}</div>
        </div>
      </div>

      {/* Tabla periódica */}
      <div className={styles.tablaWrapper}>
        {/* Un grupo, no un role="grid": el patrón grid exige filas y celdas ARIA y navegación
            con flechas, y aquí cada elemento es un botón al que se llega con Tab (hallazgo 1962). */}
        <div className={styles.tablaGrid} role="group" aria-label="Tabla periódica interactiva">
          {renderFilas()}
        </div>
        <div className={styles.separadorLantanidos} />
        {renderFilaLantanoides(lantanidos, 'Ln')}
        <div style={{ height: '4px' }} />
        {renderFilaLantanoides(actinidos, 'Ac')}
      </div>

      {/* Tooltip flotante */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          style={tooltipStyle}
          role="tooltip"
          aria-live="polite"
        >
          <div className={styles.tooltipNombre}>{tooltip.elemento.nombre}</div>
          <div className={styles.tooltipZ}>Z = {tooltip.elemento.Z} · {tooltip.elemento.simbolo}</div>
          <div className={styles.tooltipCategoria}>{categoriaLabel(tooltip.elemento.categoria)}</div>
          <div className={styles.tooltipValor}>
            {propInfo.label}:{' '}
            {tooltip.elemento[propiedad] !== null
              ? fmtValor(tooltip.elemento, propiedad, propInfo)
              : <span className={styles.tooltipNull}>Dato no disponible{notaDe(tooltip.elemento, propiedad)}</span>
            }
          </div>
        </div>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Aprende sobre las Tendencias Periódicas"
        subtitle="Por qué los elementos se organizan así y cómo predecir sus propiedades"
        icon="📚"
      >
        {/* Introducción */}
        <div className={styles.formulaBox}>
          <strong>¿Por qué existen las tendencias periódicas?</strong><br />
          Las propiedades de los elementos varían de forma predecible porque dependen de dos fuerzas en competencia:
          la <em>carga nuclear efectiva</em> (Z<sub>ef</sub>) —la atracción neta que el núcleo ejerce sobre los electrones de valencia—
          y el <em>apantallamiento</em> —el efecto de los electrones internos que "esconden" parte de la carga nuclear a los electrones externos.
          Al moverse hacia la derecha en un período, Z aumenta pero los electrones de valencia están en el mismo nivel energético,
          así que Z<sub>ef</sub> crece y el átomo se contrae. Al bajar en un grupo, se añaden capas completas, el apantallamiento aumenta
          y el átomo se expande.
        </div>

        {/* Tabla comparativa */}
        <h4>Comparativa de tendencias (las 5 propiedades)</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>En el grupo (↓)</th>
                <th>En el período (→)</th>
                <th>Excepción notable</th>
                <th>Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Radio atómico</strong></td>
                <td>Aumenta (más capas)</td>
                <td>Disminuye (mayor Z<sub>ef</sub>)</td>
                <td>Lantánidos: contracción lantánida</td>
                <td>Cs (232 pm) es el mayor de la serie; el Fr (223 pm) queda algo por debajo por efectos relativistas</td>
              </tr>
              <tr>
                <td><strong>Electronegatividad</strong></td>
                <td>Disminuye</td>
                <td>Aumenta</td>
                <td>Los gases nobles ligeros no tienen valor en la escala de Pauling</td>
                <td>F el más electronegativo; Fr el menos</td>
              </tr>
              <tr>
                <td><strong>1.ª E. ionización</strong></td>
                <td>Disminuye</td>
                <td>Aumenta (con excepciones)</td>
                <td>N &gt; O y Be &gt; B por subcapas semillenas/llenas</td>
                <td>He (2372 kJ/mol) es el más alto; Cs el más bajo</td>
              </tr>
              <tr>
                <td><strong>Afinidad electrónica</strong></td>
                <td>Más exotérmica hacia arriba</td>
                <td>Tendencia irregular</td>
                <td>N, Be, Mg: no forman anión estable (subniveles estables)</td>
                <td>Cl (−348,6) más exotérmica que F (−328,2)</td>
              </tr>
              <tr>
                <td><strong>Punto de fusión</strong></td>
                <td>Irregular según familia</td>
                <td>Máximo en metales de transición</td>
                <td>El C no funde a 1 atm: sublima (por eso no entra en la escala)</td>
                <td>He y H: Tf más bajas; W (3422 °C) la más alta</td>
              </tr>
              <tr>
                <td><strong>Regla general</strong></td>
                <td>Radio ↑, el resto ↓</td>
                <td>Radio ↓, el resto ↑ (aprox.)</td>
                <td>Metales de transición rompen la monotonía</td>
                <td>La tabla es más rica que cualquier regla simple</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios reales */}
        <h4>Aplicaciones reales de las tendencias</h4>
        <div className={styles.scenariosGrid}>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">🔋</span>
            <h4>Baterías de litio</h4>
            <p>Li es el primer metal alcalino: radio pequeño, baja masa, baja energía de ionización. La combinación es ideal para ánodos ligeros y con alta densidad de energía. Sin las tendencias periódicas no habríamos predicho que Li sería mejor que Na o K.</p>
          </div>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">💻</span>
            <h4>Semiconductores Si/Ge</h4>
            <p>Si y Ge son metaloides del grupo 14 con electronegatividad intermedia (1,90 y 2,01). Su estructura electrónica de 4 electrones de valencia los hace perfectos para semiconductores. La tendencia de EN en el grupo 14 guió la búsqueda de materiales alternativos.</p>
          </div>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">⚗️</span>
            <h4>Catalizadores de metales de transición</h4>
            <p>Fe, Co, Ni, Pt, Pd tienen subniveles d parcialmente ocupados, energías de ionización moderadas y afinidades electrónicas que permiten adsorber y liberar reactivos. Las tendencias de los metales de transición predicen su actividad catalítica.</p>
          </div>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">🧪</span>
            <h4>Predicción de reactividad</h4>
            <p>Un halógeno desconocido en el grupo 17 tendrá electronegatividad alta, afinidad electrónica muy exotérmica y radio pequeño: será muy reactivo y oxidante fuerte. Las tendencias permiten predecir propiedades antes de sintetizar el compuesto.</p>
          </div>
        </div>

        {/* FAQ */}
        <h4>Preguntas frecuentes</h4>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Por qué el F tiene la mayor electronegatividad (3,98)?</strong>
            <p>El F tiene el radio atómico más pequeño del grupo 17, lo que significa que sus electrones de valencia están muy cerca del núcleo. Aunque el Cl tiene mayor afinidad electrónica, la pequeña distancia en el F hace que la atracción sobre los electrones compartidos en un enlace sea máxima. La electronegatividad no es solo afinidad electrónica: también depende del radio.</p>
            <div className={styles.faqTip}>Truco: F = Furiosamente electronegativo</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué el N tiene afinidad electrónica ≈ 0?</strong>
            <p>El N tiene la configuración 2p³: tres electrones en tres orbitales p semillenos, cada uno con su spin paralelo. Añadir un cuarto electrón obligaría a aparearlo en un orbital ya ocupado, lo que cuesta energía de repulsión interelectrónica. El resultado neto es que ganar un electrón no libera energía, sino que cuesta un poco (unos 7 kJ/mol medidos): el anión N⁻ no es estable. Algo parecido ocurre con Be y Mg (ns² lleno), que tampoco forman anión estable.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué el W (wolframio) tiene el punto de fusión más alto de los metales?</strong>
            <p>El W (grupo 6, período 6) tiene 4 electrones d desapareados disponibles para el enlace metálico, además de su gran radio relativamente compacto para ser del período 6. Esto maximiza la densidad de estados en la banda d y la energía de cohesión de la red cristálica. Los metales de transición del período 5-6 con más electrones d desapareados tienen los mayores puntos de fusión.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué el radio atómico aumenta al bajar en la tabla?</strong>
            <p>Cada período añade un nuevo nivel energético (capa). Los electrones de valencia en la capa n+1 están más lejos del núcleo que los de la capa n, aunque la carga nuclear también haya aumentado. El efecto de apantallamiento de las capas internas es suficiente para que los electrones externos sientan menos atracción neta: el átomo se expande.</p>
            <div className={styles.faqTip}>Analogía: añadir una capa de ropa cada año — el volumen total crece aunque el corazón siga igual</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es la carga nuclear efectiva (Z<sub>ef</sub>)?</strong>
            <p>Es la carga del núcleo que "perciben" realmente los electrones de valencia después de restar el efecto de apantallamiento de los electrones internos. Se calcula con las reglas de Slater: Z<sub>ef</sub> ≈ Z − σ, donde σ es la constante de apantallamiento. Al avanzar en un período, Z aumenta en 1 pero σ aumenta menos de 1 (los electrones del mismo nivel no apantallan completamente), así que Z<sub>ef</sub> crece y el átomo se contrae.</p>
          </div>
        </div>

        {/* Pasos: cómo usar las tendencias */}
        <h4>Cómo predecir propiedades de un elemento desconocido</h4>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Localiza su posición en la tabla:</strong> identifica el grupo (columna) y el período (fila). Esto define su familia química y el nivel energético de los electrones de valencia.
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Aplica la tendencia del radio:</strong> compáralo con su vecino de la izquierda y su vecino de arriba. Si está a la derecha → radio más pequeño; si está abajo → radio más grande.
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Deduce electronegatividad e IE:</strong> siguen la tendencia inversa al radio (mayor Z<sub>ef</sub> → más electronegativo, más energía de ionización). Cuidado con excepciones en N, O y grupo 15/16.
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Valora la afinidad electrónica:</strong> los halógenos del período 3 y 4 tienen las AE más negativas. Desconfía de los elementos de configuración ns² o np³ (AE ≈ 0 por subniveles estables).
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Contrasta con el heatmap:</strong> selecciona la propiedad y localiza el elemento. El color confirma o corrige tu predicción intuitiva y te muestra cuánto se desvía de la tendencia general.
            </div>
          </div>
        </div>

        {/* Tips mnémicos */}
        <h4>Trucos para recordar las tendencias</h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔵</span>
            <p><strong>Radio:</strong> "Baja y a la izquierda = más gordo". Los metales alcalinos de la izquierda y abajo son los más voluminosos (Cs, Fr).</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <p><strong>Electronegatividad:</strong> "Sube y a la derecha = más ávido". El F en la esquina superior derecha es el campeón absoluto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
            <p><strong>Energía ionización:</strong> "Igual que EN pero más irregular". Recuerda que N &gt; O y Be &gt; B por subniveles semillenos/llenos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
            <p><strong>Punto de fusión:</strong> "El centro de la tabla funde más tarde". Los metales de transición del centro (W, Re, Os, Mo) tienen los Tf más altos.</p>
          </div>
        </div>

        {/* Warning box — errores frecuentes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes al estudiar tendencias periódicas
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir radio atómico con radio iónico:</strong> el catión siempre es más pequeño que el átomo neutral, el anión siempre es más grande. Las tendencias de radio iónico siguen reglas diferentes.</li>
            <li><strong>Creer que los gases nobles liberan energía al ganar un electrón:</strong> con la capa llena, ninguno forma anión estable; añadirles un electrón cuesta energía (en esta tabla figuran con 0 y la nota «no forma anión estable»). Que el Xe forme compuestos como XeF₂ no tiene que ver con la afinidad: en ellos el Xe cede densidad electrónica al flúor.</li>
            <li><strong>No recordar las anomalías de N y Be en IE:</strong> N (2p³ semilleno) tiene IE mayor que O (2p⁴), y Be (2s² lleno) mayor que B (2p¹). Estas excepciones aparecen tanto en el EBAU (España) como en los exámenes de admisión de preparatoria y secundaria en Latinoamérica.</li>
            <li><strong>Confundir electronegatividad con afinidad electrónica:</strong> la EN describe la atracción de electrones en un enlace (concepto de molécula); la AE describe la energía al ganar un electrón libre (concepto de átomo aislado). No son iguales: el Cl tiene mayor AE que el F, pero menor EN.</li>
            <li><strong>Ignorar la contracción lantánida:</strong> los elementos del período 6 después de los lantánidos (Hf, Ta, W...) tienen radios casi iguales a sus análogos del período 5, rompiendo la tendencia normal. Esto afecta a muchas propiedades de los metales pesados.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-tabla-periodica-tendencias')} />
      <ShareCard appName="simulador-tabla-periodica-tendencias" />
      <Footer appName="simulador-tabla-periodica-tendencias" />
    </div>
  );
}
