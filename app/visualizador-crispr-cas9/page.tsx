'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CrisprCas9.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Tab = 'mecanismo' | 'nhejhdr' | 'aplicaciones' | 'bioetica';

interface PasoCrispr {
  paso: number;
  titulo: string;
  descripcion: string;
  color: string;
  icono: string;
}

interface AplicacionTerapeutica {
  enfermedad: string;
  mecanismo: string;
  estado: 'aprobado' | 'fase3' | 'fase12' | 'preclinico';
  anio: number;
  empresa: string;
  gen: string;
  reparacion: 'NHEJ' | 'HDR';
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos: pasos del mecanismo CRISPR
// ─────────────────────────────────────────────

const PASOS_CRISPR: PasoCrispr[] = [
  {
    paso: 1,
    titulo: 'Diseño del ARN guía (gRNA)',
    descripcion:
      'El investigador diseña una secuencia de 20 nucleótidos complementaria a la región diana del genoma. El gRNA combina el crRNA (secuencia guía) con el tracrRNA (andamio estructural). Esta molécula de ~100 nt llevará a Cas9 hasta el lugar exacto del genoma.',
    color: '#2E86AB',
    icono: '🧬',
  },
  {
    paso: 2,
    titulo: 'Formación del complejo RNP',
    descripcion:
      'El gRNA se carga en la proteína Cas9 formando el complejo ribonucleoproteína (RNP). Cas9 sufre un cambio conformacional que lo activa: los dominios de nucleasa RuvC y HNH quedan listos para cortar. El complejo patrulla el genoma en busca de la secuencia diana.',
    color: '#48A9A6',
    icono: '✂️',
  },
  {
    paso: 3,
    titulo: 'Búsqueda del PAM (NGG)',
    descripcion:
      'Cas9 recorre el genoma buscando la secuencia PAM (Protospacer Adjacent Motif): 5\'-NGG-3\' en la hebra no codificante. Sin PAM adyacente, Cas9 no actúa — es el mecanismo de seguridad que evita cortes accidentales en el propio genoma bacteriano. S. pyogenes Cas9 usa NGG.',
    color: '#E67E22',
    icono: '🔍',
  },
  {
    paso: 4,
    titulo: 'Reconocimiento de la diana',
    descripcion:
      'Cuando el PAM es correcto, Cas9 abre la doble hélice localmente (DNA melting). El gRNA comprueba la complementariedad con la hebra codificante: si los 20 nt coinciden, se forma el dúplex ARN-ADN (R-loop). Con >18/20 matches, Cas9 procede al corte.',
    color: '#9B59B6',
    icono: '🎯',
  },
  {
    paso: 5,
    titulo: 'Corte de doble cadena (DSB)',
    descripcion:
      'El dominio HNH de Cas9 corta la hebra complementaria al gRNA; el dominio RuvC corta la hebra opuesta. El resultado es una rotura de doble cadena (DSB) de extremos romos (blunt-end), exactamente 3 pares de bases antes del PAM.',
    color: '#E74C3C',
    icono: '💥',
  },
  {
    paso: 6,
    titulo: 'Reparación: NHEJ o HDR',
    descripcion:
      'La célula repara la DSB por dos vías: NHEJ (Non-Homologous End Joining) — rápido, propenso a indels de 1-10 pb que causan frameshift y knockout del gen. HDR (Homology-Directed Repair) — lento, preciso, requiere plantilla donante para insertar la secuencia corregida.',
    color: '#27AE60',
    icono: '🔧',
  },
];

// ─────────────────────────────────────────────
// Datos: aplicaciones terapéuticas
// ─────────────────────────────────────────────

const APLICACIONES: AplicacionTerapeutica[] = [
  {
    enfermedad: 'Anemia de células falciformes',
    mecanismo: 'Reactivación de hemoglobina fetal (HbF) editando BCL11A',
    estado: 'aprobado',
    anio: 2023,
    empresa: 'Vertex / CRISPR Therapeutics',
    gen: 'BCL11A',
    reparacion: 'NHEJ',
    descripcion:
      'Casgevy es el primer tratamiento CRISPR aprobado por FDA y EMA. Edita células madre hematopoyéticas del propio paciente para reactivar la hemoglobina fetal, compensando la hemoglobina mutada.',
  },
  {
    enfermedad: 'Beta-talasemia',
    mecanismo: 'Misma estrategia: reactivación HbF en células madre hematopoyéticas',
    estado: 'aprobado',
    anio: 2023,
    empresa: 'Vertex / CRISPR Therapeutics',
    gen: 'BCL11A',
    reparacion: 'NHEJ',
    descripcion:
      'Casgevy también aprobado para beta-talasemia transfusión-dependiente. Primer doble aprobación FDA+EMA para un tratamiento CRISPR.',
  },
  {
    enfermedad: 'Amaurosis de Leber (EDIT-101)',
    mecanismo: 'Edición in vivo en fotorreceptores de retina — eliminación de mutación splicing en CEP290',
    estado: 'fase12',
    anio: 2020,
    empresa: 'Editas Medicine',
    gen: 'CEP290',
    reparacion: 'NHEJ',
    descripcion:
      'Ensayo BRILLIANCE: primera edición in vivo en humanos con CRISPR. Inyección intravítrea de CRISPR-Cas9 empaquetado en AAV5 directamente en las células fotorreceptoras del paciente.',
  },
  {
    enfermedad: 'Cardiomiopatía hipertrófica',
    mecanismo: 'Corrección de mutación patogénica en gen MYH7 (miosina)',
    estado: 'preclinico',
    anio: 2024,
    empresa: 'Múltiples grupos (Stanford, Broad)',
    gen: 'MYH7',
    reparacion: 'HDR',
    descripcion:
      'En desarrollo preclínico. Se busca corregir la mutación R403Q en MYH7 usando HDR con plantilla donante en células cardíacas diferenciadas de iPSCs del paciente.',
  },
  {
    enfermedad: 'VIH — escisión del provirus',
    mecanismo: 'Eliminación del ADN viral integrado del genoma de células T infectadas',
    estado: 'fase12',
    anio: 2023,
    empresa: 'EBT-101 (Excision BioTherapeutics)',
    gen: 'LTR / GAG-VIH',
    reparacion: 'NHEJ',
    descripcion:
      'Ensayo de fase 1 con un paciente que mantuvo VIH indetectable 4 semanas tras tratamiento (aún no concluyente). Usa dos gRNAs que flanquean el provirus para escindir el ADN viral integrado.',
  },
  {
    enfermedad: 'Cáncer — CAR-T editado con CRISPR',
    mecanismo: 'Células T editadas para mejorar reconocimiento y persistencia antitumoral',
    estado: 'fase12',
    anio: 2022,
    empresa: 'Intellia / Editas / Caribou',
    gen: 'TRAC, PDCD1, B2M',
    reparacion: 'NHEJ',
    descripcion:
      'CRISPR permite crear CAR-T alogénicas (de donante, no del propio paciente) eliminando el TCR (TRAC) y MHC-I (B2M) para evitar rechazo. También se elimina PD-1 (PDCD1) para aumentar persistencia.',
  },
];

// ─────────────────────────────────────────────
// SVG: Diagrama mecanismo CRISPR por paso
// ─────────────────────────────────────────────

function SvgMecanismo({ paso }: { paso: number }) {
  // Colores por paso
  const colorActivo = PASOS_CRISPR[paso - 1]?.color ?? '#2E86AB';

  return (
    <svg
      viewBox="0 0 520 300"
      width="100%"
      role="img"
      aria-label={`Diagrama CRISPR paso ${paso}: ${PASOS_CRISPR[paso - 1]?.titulo}`}
      className={styles.mecanismoSvg}
    >
      {/* Fondo */}
      <rect width="520" height="300" fill="#f0f8fc" rx="14" />

      {/* ── ADN doble hélice (siempre visible) ── */}
      <path
        d="M30,80 Q130,55 230,80 Q330,105 430,80 Q470,68 500,72"
        fill="none" stroke="#2E86AB" strokeWidth="3" strokeLinecap="round"
      />
      <path
        d="M30,110 Q130,135 230,110 Q330,85 430,110 Q470,122 500,118"
        fill="none" stroke="#48A9A6" strokeWidth="3" strokeLinecap="round"
      />
      {/* Puentes del ADN */}
      {[70, 110, 150, 190, 230, 270, 310, 350, 390, 440].map((x, i) => (
        <line
          key={i}
          x1={x} y1={i % 2 === 0 ? 70 : 83}
          x2={x} y2={i % 2 === 0 ? 120 : 107}
          stroke="#7FB3D3" strokeWidth="1.5" opacity="0.7"
        />
      ))}

      {/* ── Etiquetas fijas de cadenas ── */}
      <text x="18" y="78" fontSize="9" fill="#2E86AB" fontWeight="700">5'</text>
      <text x="18" y="115" fontSize="9" fill="#48A9A6" fontWeight="700">3'</text>

      {/* ── Secuencia PAM (visible desde paso 3) ── */}
      {paso >= 3 && (
        <g>
          <rect x="340" y="60" width="60" height="20" rx="5" fill="#E67E22" opacity={paso === 3 ? 1 : 0.6} />
          <text x="370" y="74" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">NGG</text>
          <text x="370" y="55" textAnchor="middle" fontSize="8" fill="#E67E22" fontWeight="700">PAM</text>
        </g>
      )}

      {/* ── gRNA (visible desde paso 1) ── */}
      {paso >= 1 && (
        <g>
          <rect
            x="80" y="145" width="200" height="28" rx="8"
            fill={paso === 1 ? '#2E86AB' : '#48A9A6'} opacity="0.9"
          />
          <text x="180" y="163" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
            gRNA — 5'-NNNNNNNNNNNNNNNNNNNN-3'
          </text>
          <text x="30" y="163" fontSize="9" fill="#2E86AB" fontWeight="600">gRNA</text>
        </g>
      )}

      {/* ── Cas9 (visible desde paso 2) ── */}
      {paso >= 2 && (
        <g>
          <ellipse cx="260" cy="210" rx="75" ry="48"
            fill={colorActivo} opacity="0.85"
          />
          <text x="260" y="206" textAnchor="middle" fontSize="12" fontWeight="800" fill="white">Cas9</text>
          <text x="260" y="222" textAnchor="middle" fontSize="9" fill="white" opacity="0.9">
            {paso === 2 ? 'Complejo RNP activo' :
             paso === 3 ? 'Buscando PAM...' :
             paso === 4 ? 'Reconociendo diana' :
             paso === 5 ? 'RuvC + HNH listos' :
             'Corte completado'}
          </text>
          {/* Línea de conexión Cas9-gRNA */}
          <line x1="195" y1="173" x2="220" y2="186" stroke={colorActivo} strokeWidth="2" strokeDasharray="4 2" />
        </g>
      )}

      {/* ── R-loop / hibridación (paso 4) ── */}
      {paso === 4 && (
        <rect x="100" y="73" width="230" height="17" rx="4"
          fill="#9B59B6" opacity="0.25"
        />
      )}

      {/* ── Corte DSB (paso 5) ── */}
      {paso >= 5 && (
        <g>
          <line x1="310" y1="60" x2="310" y2="130" stroke="#E74C3C" strokeWidth="3" strokeDasharray="6 3" />
          <text x="318" y="78" fontSize="9" fill="#E74C3C" fontWeight="700">DSB</text>
          <polygon points="302,75 310,65 318,75" fill="#E74C3C" />
          <polygon points="302,115 310,125 318,115" fill="#E74C3C" />
        </g>
      )}

      {/* ── NHEJ vs HDR (paso 6) ── */}
      {paso === 6 && (
        <g>
          <rect x="30" y="245" width="180" height="40" rx="8" fill="rgba(231,76,60,0.12)" stroke="#E74C3C" strokeWidth="1.5" />
          <text x="120" y="263" textAnchor="middle" fontSize="10" fontWeight="700" fill="#c0392b">NHEJ</text>
          <text x="120" y="277" textAnchor="middle" fontSize="9" fill="#c0392b">Indels → Knockout</text>

          <rect x="230" y="245" width="180" height="40" rx="8" fill="rgba(39,174,96,0.12)" stroke="#27AE60" strokeWidth="1.5" />
          <text x="320" y="263" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1a7a46">HDR</text>
          <text x="320" y="277" textAnchor="middle" fontSize="9" fill="#1a7a46">Precisión → Corrección</text>
        </g>
      )}

      {/* ── Indicador de paso ── */}
      <rect x="10" y="268" width="65" height="22" rx="6" fill={colorActivo} opacity={paso < 6 ? 1 : 0} />
      {paso < 6 && (
        <text x="42" y="283" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">Paso {paso}/6</text>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Mecanismo paso a paso
// ─────────────────────────────────────────────

function TabMecanismo() {
  const [pasoActivo, setPasoActivo] = useState(1);
  const paso = PASOS_CRISPR[pasoActivo - 1];

  return (
    <div className={styles.tabContent}>
      <p className={styles.tabIntro}>
        Usa el slider para avanzar por los 6 pasos del mecanismo CRISPR-Cas9, desde el diseño del ARN guía hasta la reparación del ADN.
      </p>

      {/* SVG animado */}
      <SvgMecanismo paso={pasoActivo} />

      {/* Slider de pasos */}
      <div className={styles.sliderGroup}>
        <div className={styles.pasoIndicadores} role="list" aria-label="Pasos del mecanismo CRISPR">
          {PASOS_CRISPR.map((p) => (
            <button
              key={p.paso}
              type="button"
              role="listitem"
              onClick={() => setPasoActivo(p.paso)}
              aria-pressed={pasoActivo === p.paso}
              aria-label={`Paso ${p.paso}: ${p.titulo}`}
              className={`${styles.pasoBtn} ${pasoActivo === p.paso ? styles.pasoBtnActivo : ''}`}
              style={pasoActivo === p.paso ? { backgroundColor: p.color, borderColor: p.color } : {}}
            >
              <span aria-hidden="true">{p.icono}</span>
              <span className={styles.pasoBtnNum}>{p.paso}</span>
            </button>
          ))}
        </div>

        <input
          type="range"
          min={1}
          max={6}
          value={pasoActivo}
          onChange={(e) => setPasoActivo(Number(e.target.value))}
          className={styles.pasoSlider}
          aria-label={`Paso del mecanismo CRISPR, actual: paso ${pasoActivo}`}
        />
      </div>

      {/* Panel informativo del paso */}
      <div className={styles.pasoInfo} style={{ borderLeftColor: paso.color }}>
        <div className={styles.pasoInfoHeader}>
          <span className={styles.pasoInfoIcono} aria-hidden="true">{paso.icono}</span>
          <h3 className={styles.pasoInfoTitulo}>
            Paso {paso.paso} — {paso.titulo}
          </h3>
        </div>
        <p className={styles.pasoInfoDesc}>{paso.descripcion}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: NHEJ vs HDR
// ─────────────────────────────────────────────

function TabNhejHdr() {
  return (
    <div className={styles.tabContent}>
      <p className={styles.tabIntro}>
        Tras el corte de doble cadena (DSB), la célula elige entre dos vías de reparación con resultados muy distintos.
      </p>

      <div className={styles.nhejHdrGrid}>
        {/* NHEJ */}
        <div className={styles.nhejCard}>
          <div className={styles.viaHeader}>
            <span className={styles.viaIcono} aria-hidden="true">⚡</span>
            <h3 className={styles.viaTitulo}>NHEJ</h3>
            <p className={styles.viaSubtitulo}>Non-Homologous End Joining</p>
          </div>

          <ul className={styles.viaLista}>
            <li><strong>Disponibilidad:</strong> Todas las fases del ciclo celular</li>
            <li><strong>Plantilla:</strong> No requiere</li>
            <li><strong>Frecuencia:</strong> ~90% de reparaciones DSB</li>
            <li><strong>Precisión:</strong> Baja — inserciones/deleciones de 1-10 pb</li>
            <li><strong>Resultado:</strong> Frameshift → codón stop prematuro → proteína truncada o sin expresión</li>
            <li><strong>Uso principal:</strong> Knockout de gen, disrupción de exón, eliminación de secuencia reguladora</li>
          </ul>

          <div className={styles.viaEjemplos}>
            <p className={styles.viaEjemplosTitle}>Ejemplos clínicos:</p>
            <p className={styles.viaEjemplosTexto}>
              Casgevy (Vertex): knockout de BCL11A en células madre hematopoyéticas para reactivar HbF.
              CAR-T alogénicas: knockout de TRAC, B2M y PDCD1 para crear células universales.
            </p>
          </div>
        </div>

        {/* HDR */}
        <div className={styles.hdrCard}>
          <div className={styles.viaHeader}>
            <span className={styles.viaIcono} aria-hidden="true">🎯</span>
            <h3 className={styles.viaTitulo}>HDR</h3>
            <p className={styles.viaSubtitulo}>Homology-Directed Repair</p>
          </div>

          <ul className={styles.viaLista}>
            <li><strong>Disponibilidad:</strong> Solo en fase S / G2 (cromátida hermana disponible)</li>
            <li><strong>Plantilla:</strong> Requiere ssODN o plásmido donante</li>
            <li><strong>Frecuencia:</strong> ~1-5% en células somáticas, más alto en células en división</li>
            <li><strong>Precisión:</strong> Alta — corrección de un solo nucleótido posible</li>
            <li><strong>Resultado:</strong> Inserción de la secuencia exacta de la plantilla donante</li>
            <li><strong>Uso principal:</strong> Corrección de mutación patogénica, knock-in de transgén</li>
          </ul>

          <div className={styles.viaEjemplos}>
            <p className={styles.viaEjemplosTitle}>Ejemplos en investigación:</p>
            <p className={styles.viaEjemplosTexto}>
              Corrección de mutación en CFTR (fibrosis quística) en orgánicos intestinales.
              Corrección de beta-globina en talasemia beta. Cardiomiopatía hipertrófica (preclínico, gen MYH7).
            </p>
          </div>
        </div>
      </div>

      {/* Tabla comparativa */}
      <div className={styles.tablaComparativa}>
        <h3 className={styles.tablaTitle}>Comparativa rápida</h3>
        <table className={styles.tabla} aria-label="Comparativa NHEJ vs HDR">
          <thead>
            <tr>
              <th>Parámetro</th>
              <th>NHEJ</th>
              <th>HDR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Velocidad</td>
              <td className={styles.celdaPositiva}>Horas</td>
              <td className={styles.celdaNeutral}>Días</td>
            </tr>
            <tr>
              <td>Eficiencia</td>
              <td className={styles.celdaPositiva}>Alta (70-90%)</td>
              <td className={styles.celdaNegativa}>Baja (1-5%)</td>
            </tr>
            <tr>
              <td>Precisión</td>
              <td className={styles.celdaNegativa}>Baja (indels)</td>
              <td className={styles.celdaPositiva}>Alta (punto)</td>
            </tr>
            <tr>
              <td>Ciclo celular</td>
              <td className={styles.celdaPositiva}>Todo el ciclo</td>
              <td className={styles.celdaNegativa}>Solo S/G2</td>
            </tr>
            <tr>
              <td>Plantilla</td>
              <td className={styles.celdaPositiva}>No necesaria</td>
              <td className={styles.celdaNegativa}>Imprescindible</td>
            </tr>
            <tr>
              <td>Aplicación</td>
              <td>Knockout</td>
              <td>Corrección / Knock-in</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Aplicaciones Terapéuticas
// ─────────────────────────────────────────────

function getBadgeClass(estado: AplicacionTerapeutica['estado'], s: typeof styles): string {
  if (estado === 'aprobado') return `${s.estadoBadge} ${s.estadoAprobado}`;
  if (estado === 'fase3') return `${s.estadoBadge} ${s.estadoEnsayo}`;
  if (estado === 'fase12') return `${s.estadoBadge} ${s.estadoEnsayo}`;
  return `${s.estadoBadge} ${s.estadoPreclinico}`;
}

function getBadgeLabel(estado: AplicacionTerapeutica['estado']): string {
  if (estado === 'aprobado') return '✅ Aprobado FDA/EMA';
  if (estado === 'fase3') return '🔬 Fase 3';
  if (estado === 'fase12') return '🔬 Fase 1/2';
  return '🧪 Preclínico';
}

function TabAplicaciones() {
  return (
    <div className={styles.tabContent}>
      <p className={styles.tabIntro}>
        De la laboratorio a la clínica: aplicaciones terapéuticas reales de CRISPR-Cas9, con estado de desarrollo actualizado.
      </p>

      <div className={styles.aplicacionesGrid}>
        {APLICACIONES.map((app) => (
          <div key={app.enfermedad} className={styles.aplicacionCard}>
            <div className={styles.aplicacionHeader}>
              <h3 className={styles.aplicacionNombre}>{app.enfermedad}</h3>
              <span className={getBadgeClass(app.estado, styles)}>
                {getBadgeLabel(app.estado)}
              </span>
            </div>

            <div className={styles.aplicacionMeta}>
              <span className={styles.aplicacionGen}>Gen: <strong>{app.gen}</strong></span>
              <span className={styles.aplicacionReparacion}>
                Vía: <strong>{app.reparacion}</strong>
              </span>
              <span className={styles.aplicacionAnio}>{app.anio}</span>
            </div>

            <p className={styles.aplicacionMecanismo}>{app.mecanismo}</p>
            <p className={styles.aplicacionDesc}>{app.descripcion}</p>

            <div className={styles.aplicacionEmpresa}>
              <span aria-hidden="true">🏢</span> {app.empresa}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Bioética y Límites
// ─────────────────────────────────────────────

function TabBioetica() {
  return (
    <div className={styles.tabContent}>
      <p className={styles.tabIntro}>
        El poder de CRISPR plantea preguntas éticas urgentes. El debate entre posibilidad técnica y responsabilidad moral.
      </p>

      <div className={styles.bioeticaBlocks}>
        {/* Bloque 1: He Jiankui */}
        <div className={styles.bioeticaBloque}>
          <h3 className={styles.bioeticaBloqueTitle}>
            <span aria-hidden="true">⚠️</span> El caso He Jiankui (2018)
          </h3>
          <div className={styles.casoGrid}>
            <div className={styles.casoQue}>
              <p className={styles.casoLabel}>Qué ocurrió</p>
              <p>
                El científico chino He Jiankui editó embriones humanos para conferir resistencia al VIH mediante
                la deleción del gen CCR5 (el receptor que usa el VIH-1 para entrar en células T). Los embriones
                fueron implantados y nacieron las gemelas Lulu y Nana en 2018. Un tercer bebé (Amy) nació en 2019.
              </p>
            </div>
            <div className={styles.casoPor}>
              <p className={styles.casoLabel}>Por qué fue éticamente inadmisible</p>
              <ul className={styles.casoPorLista}>
                <li><strong>Heritable:</strong> la edición afecta a toda la línea germinal — los niños transmitirán la edición a sus descendientes</li>
                <li><strong>Sin necesidad médica real:</strong> existían alternativas seguras para evitar la transmisión del VIH</li>
                <li><strong>Consentimiento cuestionable:</strong> los padres no comprendieron plenamente los riesgos</li>
                <li><strong>Secretismo total:</strong> sin revisión ética independiente previa, sin transparencia científica</li>
                <li><strong>Off-targets desconocidos:</strong> mosaicismo detectado; efectos a largo plazo imprevisibles</li>
              </ul>
            </div>
            <div className={styles.casoConsecuencia}>
              <p className={styles.casoLabel}>Consecuencia</p>
              <p>
                He Jiankui fue condenado a 3 años de prisión en China. La comunidad científica internacional condenó
                unánimemente el experimento. La OMS y la Academia Nacional de Medicina de EE.UU. publicaron marcos
                éticos reforzados. El debate aceleró los esfuerzos para establecer líneas rojas claras.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 2: Líneas rojas */}
        <div className={styles.bioeticaBloque}>
          <h3 className={styles.bioeticaBloqueTitle}>
            <span aria-hidden="true">🌍</span> Consenso ético internacional (2024)
          </h3>
          <div className={styles.lineaRojaGrid}>
            <div className={`${styles.lineaRojaCard} ${styles.permitido}`}>
              <div className={styles.lineaRojaIcono} aria-hidden="true">✅</div>
              <p className={styles.lineaRojaLabel}>Permitido</p>
              <p className={styles.lineaRojaTexto}>
                Edición de células somáticas (no germinales) con fines terapéuticos. Solo afecta al paciente,
                no es heredable. Base de Casgevy y todos los ensayos clínicos actuales.
              </p>
            </div>
            <div className={`${styles.lineaRojaCard} ${styles.moratoria}`}>
              <div className={styles.lineaRojaIcono} aria-hidden="true">⚠️</div>
              <p className={styles.lineaRojaLabel}>Moratoria</p>
              <p className={styles.lineaRojaTexto}>
                Edición de línea germinal terapéutica (embriones con enfermedad grave). Posible con supervisión
                ética extrema, pero actualmente en moratoria por consenso. Ningún país la ha autorizado formalmente.
              </p>
            </div>
            <div className={`${styles.lineaRojaCard} ${styles.prohibido}`}>
              <div className={styles.lineaRojaIcono} aria-hidden="true">❌</div>
              <p className={styles.lineaRojaLabel}>Prohibido</p>
              <p className={styles.lineaRojaTexto}>
                Edición para mejora cognitiva, física o estética («enhancement»), «bebés de diseño»,
                edición sin justificación médica clara. Prohibición prácticamente universal.
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 3: Desafíos técnicos */}
        <div className={styles.bioeticaBloque}>
          <h3 className={styles.bioeticaBloqueTitle}>
            <span aria-hidden="true">🔬</span> Desafíos técnicos pendientes
          </h3>
          <div className={styles.desafiosGrid}>
            <div className={styles.desafioItem}>
              <p className={styles.desafioTitulo}>Off-target editing</p>
              <p className={styles.desafioTexto}>
                Cortes en loci no diana (~0.1-1% de frecuencia). Pueden activar oncogenes o disrumpir genes
                supresores. Las variantes de alta especificidad (eSpCas9, HiFi Cas9) reducen significativamente
                el off-target, pero no lo eliminan.
              </p>
            </div>
            <div className={styles.desafioItem}>
              <p className={styles.desafioTitulo}>Entrega al tejido diana</p>
              <p className={styles.desafioTexto}>
                El hígado se edita bien via nanopartículas lipídicas (LNPs). Cerebro, músculo y pulmón son
                difíciles: barreras biológicas limitan la eficiencia. AAV vectores tienen límite de tamaño (~4.7 kb).
              </p>
            </div>
            <div className={styles.desafioItem}>
              <p className={styles.desafioTitulo}>Inmunogenicidad de Cas9</p>
              <p className={styles.desafioTexto}>
                ~58% de humanos tienen anticuerpos preexistentes contra SpCas9 (de S. pyogenes, bacteria común).
                La respuesta inmune puede neutralizar el tratamiento o causar inflamación. Alternativas: SaCas9,
                CjCas9, editores de base que no requieren Cas9 estándar.
              </p>
            </div>
            <div className={styles.desafioItem}>
              <p className={styles.desafioTitulo}>Mosaicismo</p>
              <p className={styles.desafioTexto}>
                No todas las células del tejido diana quedan editadas de forma idéntica. Algunas tienen la edición
                correcta, otras el alelo wild-type, otras indels diferentes. En edición ex vivo (como Casgevy)
                se seleccionan los clones editados; in vivo es difícil de controlar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCrisprCas9() {
  const [tabActiva, setTabActiva] = useState<Tab>('mecanismo');

  const tabs: { id: Tab; label: string; icono: string }[] = [
    { id: 'mecanismo', label: 'El Mecanismo', icono: '🧬' },
    { id: 'nhejhdr', label: 'NHEJ vs HDR', icono: '🔧' },
    { id: 'aplicaciones', label: 'Aplicaciones', icono: '💊' },
    { id: 'bioetica', label: 'Bioética', icono: '⚖️' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge} aria-label="Categoría: Biología Molecular">
            Biología Molecular
          </span>
          <h1 className={styles.heroTitle}>CRISPR-Cas9</h1>
          <p className={styles.heroSubtitle}>
            Edición Génica Paso a Paso
          </p>
          <p className={styles.heroDesc}>
            ARN guía, búsqueda del PAM, corte de doble hebra, reparación por NHEJ o HDR,
            aplicaciones terapéuticas y el debate bioético — Premio Nobel 2020.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* Barra de pestañas */}
      <nav className={styles.tabBar} aria-label="Secciones del visualizador CRISPR-Cas9" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tabActiva === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTabActiva(t.id)}
            className={`${styles.tab} ${tabActiva === t.id ? styles.tabActive : ''}`}
          >
            <span aria-hidden="true">{t.icono}</span>
            <span className={styles.tabLabel}>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Contenido de las pestañas */}
      <main className={styles.main} id={`panel-${tabActiva}`} role="tabpanel" aria-label={tabs.find(t => t.id === tabActiva)?.label}>
        {tabActiva === 'mecanismo' && <TabMecanismo />}
        {tabActiva === 'nhejhdr' && <TabNhejHdr />}
        {tabActiva === 'aplicaciones' && <TabAplicaciones />}
        {tabActiva === 'bioetica' && <TabBioetica />}
      </main>

      <EducationalSection
        title="CRISPR-Cas9: las tijeras moleculares que cambiaron la biología"
        subtitle="Del sistema inmune bacteriano a la edición del genoma humano — Premio Nobel 2020"
      >

        {/* ── 1. Tabla Comparativa: NHEJ vs HDR ── */}
        <div className={styles.tableWrapper}>
          <h3 className={styles.eduSectionTitle}>Comparativa completa: NHEJ vs HDR</h3>
          <p className={styles.eduSectionDesc}>
            Tras el corte de doble cadena (DSB), la célula elige entre dos vías de reparación. Conocer sus diferencias es clave para entender qué tipo de terapia es posible con cada estrategia.
          </p>
          <div className={styles.tableScroll}>
            <table className={styles.comparativaTable} aria-label="Comparativa NHEJ vs HDR">
              <thead>
                <tr>
                  <th>Mecanismo</th>
                  <th>Precisión</th>
                  <th>Velocidad</th>
                  <th>Fase celular</th>
                  <th>Resultado</th>
                  <th>Aplicación terapéutica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>NHEJ</strong> — Non-Homologous End Joining</td>
                  <td className={styles.celdaNegativa}>Baja (indels aleatorios)</td>
                  <td className={styles.celdaPositiva}>Horas</td>
                  <td className={styles.celdaPositiva}>Todo el ciclo celular</td>
                  <td>Frameshift → codón stop → knockout del gen</td>
                  <td>Casgevy (BCL11A), CAR-T alogénicas (TRAC, B2M)</td>
                </tr>
                <tr>
                  <td><strong>HDR</strong> — Homology-Directed Repair</td>
                  <td className={styles.celdaPositiva}>Alta (corrección puntual)</td>
                  <td className={styles.celdaNegativa}>Días</td>
                  <td className={styles.celdaNegativa}>Solo fase S/G2</td>
                  <td>Inserción exacta de la secuencia donante</td>
                  <td>Corrección CFTR (fibrosis quística), MYH7 (cardiomiopatía, preclínico)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. Casos de Uso ── */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
            <h4 className={styles.escenarioTitulo}>Estudiante de Biotecnología o Medicina</h4>
            <p className={styles.escenarioTexto}>
              Usa el visualizador del mecanismo paso a paso para interiorizar cómo el gRNA lleva a Cas9 hasta la diana, qué es el PAM, y por qué NHEJ produce knockouts mientras HDR produce correcciones precisas. Ideal para preparar exámenes de genética molecular.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🏥</span>
            <h4 className={styles.escenarioTitulo}>Paciente con Enfermedad Genética Rara</h4>
            <p className={styles.escenarioTexto}>
              Si tu médico ha mencionado una terapia basada en CRISPR, este visualizador te explica qué significa editar células fuera del cuerpo (ex vivo) y reinfundirlas, o inyectar el sistema directamente en el tejido afectado (in vivo). Entiende el proceso sin terminología abrumadora.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">⚖️</span>
            <h4 className={styles.escenarioTitulo}>Ciudadano Interesado en el Debate Ético</h4>
            <p className={styles.escenarioTexto}>
              La pestaña de bioética explica por qué el caso He Jiankui fue tan polémico, cuáles son las líneas rojas establecidas internacionalmente y por qué la edición de embriones (germinal) es radicalmente distinta a la de células del paciente adulto (somática).
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">📰</span>
            <h4 className={styles.escenarioTitulo}>Periodista Científico</h4>
            <p className={styles.escenarioTexto}>
              Consulta la pestaña de aplicaciones terapéuticas para distinguir qué está aprobado (Casgevy), qué está en fase 1/2, qué es preclínico y qué es todavía investigación básica. El contexto correcto es clave para no exagerar ni minimizar los avances de CRISPR en titulares.
            </p>
          </div>
        </div>

        {/* ── 3. FAQ ── */}
        <div className={styles.faqList}>
          <h3 className={styles.eduSectionTitle}>Preguntas frecuentes sobre CRISPR-Cas9</h3>

          <div className={styles.faqItem}>
            <h4 className={styles.faqPregunta}>¿Qué significa CRISPR exactamente?</h4>
            <p className={styles.faqRespuesta}>
              CRISPR son las siglas de <em>Clustered Regularly Interspaced Short Palindromic Repeats</em> (Repeticiones Palindrómicas Cortas Agrupadas y Regularmente Interespaciadas). Es el nombre del sistema de memoria inmunológica que usan las bacterias contra los virus: almacenan fragmentos del ADN del invasor y, si vuelve a atacar, la proteína Cas9 lo reconoce y lo destruye. Doudna y Charpentier descubrieron que podían reprogramar ese sistema para cortar cualquier gen de cualquier organismo.
            </p>
            <p className={styles.faqTip}>
              <strong>En pocas palabras:</strong> CRISPR es el «GPS» que guía a la proteína Cas9 (las «tijeras») hasta el lugar exacto del ADN donde debe cortar.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqPregunta}>¿Es segura la terapia génica con CRISPR?</h4>
            <p className={styles.faqRespuesta}>
              Los tratamientos aprobados como Casgevy (anemia de células falciformes y beta-talasemia) han pasado ensayos clínicos rigurosos con seguimiento de varios años. Los principales riesgos son: cortes fuera de la diana (off-target), que pueden activar oncogenes; inmunogenicidad de la proteína Cas9 (el 58% de personas tiene anticuerpos contra ella por infecciones previas de estreptococo); y mosaicismo (no todas las células quedan editadas igual). Las variantes de alta especificidad (eSpCas9, HiFi Cas9) y los editores de base sin corte de doble cadena reducen estos riesgos.
            </p>
            <p className={styles.faqTip}>
              <strong>Contexto:</strong> «Seguro» no significa «sin riesgo». Significa que el perfil riesgo/beneficio es aceptable para cada patología concreta según la EMA y la FDA.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqPregunta}>¿Por qué fue tan polémico el caso de He Jiankui?</h4>
            <p className={styles.faqRespuesta}>
              He Jiankui editó embriones humanos en 2018 para conferir resistencia al VIH mediante la deleción del gen CCR5. Los bebés nacieron con esa edición integrada en su línea germinal, lo que significa que la podrían transmitir a sus hijos. Los problemas éticos fueron múltiples: no había necesidad médica real (existían alternativas seguras para prevenir el VIH), el consentimiento de los padres fue cuestionable, no hubo supervisión ética independiente, y se detectó mosaicismo en los bebés (no todas sus células tenían la edición buscada). Fue condenado a 3 años de prisión en China.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqPregunta}>¿Qué es Casgevy y por qué es histórico?</h4>
            <p className={styles.faqRespuesta}>
              Casgevy (exa-cel, de Vertex Pharmaceuticals y CRISPR Therapeutics) fue aprobado por la FDA y la EMA en 2023 para anemia de células falciformes y beta-talasemia: los primeros tratamientos basados en CRISPR en recibir aprobación regulatoria en el mundo. El proceso: se extraen células madre hematopoyéticas del propio paciente, se edita ex vivo el gen BCL11A para desactivarlo (NHEJ), se reinfunden y las células editadas reactivan la hemoglobina fetal, compensando la hemoglobina mutada. En los ensayos, más del 97% de pacientes con anemia falciforme quedaron libres de crisis vaso-oclusivas. El coste es de aproximadamente 2,2 millones de dólares por tratamiento.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqPregunta}>¿Podría CRISPR curar el cáncer?</h4>
            <p className={styles.faqRespuesta}>
              CRISPR está siendo explorado en oncología principalmente para mejorar las terapias CAR-T: modificando células T de donante para eliminar el receptor TCR (TRAC) y el complejo MHC-I (B2M) — evitando el rechazo — y el checkpoint PD-1 (PDCD1) para que persistan más tiempo activas. También se investiga para editar genes supresores de tumores en células madre, o para activar el sistema inmune contra tumores específicos. Sin embargo, «curar el cáncer» es una simplificación: hay más de 100 tipos distintos de cáncer y CRISPR no es una solución universal.
            </p>
            <p className={styles.faqTip}>
              <strong>Estado actual:</strong> Varios ensayos en fase 1/2 con resultados prometedores, pero aún lejos de aprobación generalizada para ningún tipo de cáncer.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqPregunta}>¿Existe CRISPR en la naturaleza o fue inventado?</h4>
            <p className={styles.faqRespuesta}>
              CRISPR existe en la naturaleza como sistema inmune adaptativo de muchas bacterias y arqueas: el organismo almacena fragmentos de ADN viral para reconocerlos en futuros ataques. Lo que fue un invento científico (Doudna, Charpentier, 2012) fue reprogramar ese sistema para usarlo como herramienta de edición genómica universal: cambiando la secuencia del gRNA, la proteína Cas9 puede dirigirse a cualquier locus del genoma de cualquier ser vivo. La naturaleza lo creó para defenderse; los científicos lo convirtieron en tijeras moleculares programables.
            </p>
          </div>
        </div>

        {/* ── 4. Guía Paso a Paso ── */}
        <div className={styles.stepGuide}>
          <h3 className={styles.eduSectionTitle}>Cómo funciona una terapia génica CRISPR de principio a fin</h3>
          <p className={styles.eduSectionDesc}>
            Siguiendo el modelo de Casgevy (anemia de células falciformes), así es el recorrido completo desde el diagnóstico hasta el resultado clínico.
          </p>

          <div className={styles.step}>
            <div className={styles.stepNumber} aria-hidden="true">1</div>
            <div className={styles.stepContent}>
              <h4>Extracción de células madre hematopoyéticas</h4>
              <p>
                Se administran factores de movilización (G-CSF, plerixafor) para que las células madre de la médula ósea pasen a la sangre. Se recogen mediante aféresis durante varias sesiones. El paciente queda hospitalizado mientras sus propias células son procesadas.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber} aria-hidden="true">2</div>
            <div className={styles.stepContent}>
              <h4>Diseño del gRNA y edición ex vivo</h4>
              <p>
                En el laboratorio, se carga la proteína Cas9 con el gRNA diseñado para cortar el gen BCL11A en el locus eritroide específico. El complejo RNP se introduce en las células madre extraídas mediante electroporación. El NHEJ introduce indels que inactivan BCL11A en las células hematopoyéticas.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber} aria-hidden="true">3</div>
            <div className={styles.stepContent}>
              <h4>Control de calidad y verificación de la edición</h4>
              <p>
                Se secuencian las células editadas para verificar la eficiencia de edición (objetivo: {">"} 80% de alelos con indels en BCL11A). Se comprueban los principales loci de off-target usando técnicas como GUIDE-seq o CIRCLE-seq. Solo si el resultado supera los umbrales de seguridad, el lote se aprueba para reinfusión.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber} aria-hidden="true">4</div>
            <div className={styles.stepContent}>
              <h4>Acondicionamiento y reinfusión</h4>
              <p>
                El paciente recibe un régimen de acondicionamiento mieloablativo (busulfán) para eliminar las células madre de médula ósea no editadas y crear espacio para que las editadas se implanten. Luego se reinfunden las células madre CRISPR-editadas por vía intravenosa.
              </p>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber} aria-hidden="true">5</div>
            <div className={styles.stepContent}>
              <h4>Injerto y resultado clínico</h4>
              <p>
                Las células editadas se implantan en la médula ósea, se diferencian y producen eritrocitos con BCL11A inactivo. Sin BCL11A, el factor de transcripción KLF1 reactiva la hemoglobina fetal (HbF), que compensa la hemoglobina S mutada. En los ensayos, {">"} 97% de pacientes quedaron libres de crisis vaso-oclusivas durante el seguimiento de hasta 4 años.
              </p>
            </div>
          </div>
        </div>

        {/* ── 5. Mejores Prácticas ── */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔬</span>
            <h4 className={styles.tipTitulo}>Distingue somático de germinal</h4>
            <p className={styles.tipTexto}>
              La edición somática afecta solo al paciente y no es heredable. La germinal afecta a embriones y se transmite a descendientes. Son éticamente opuestas: la primera está autorizada con supervisión, la segunda está en moratoria internacional.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <h4 className={styles.tipTitulo}>Contextualiza el estado de desarrollo</h4>
            <p className={styles.tipTexto}>
              Aprobado FDA/EMA ≠ en investigación preclínica ≠ en ensayo fase 1. Cada nivel implica una distancia muy diferente a la clínica real. Verifica siempre en qué fase está cada aplicación antes de interpretar una noticia.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <h4 className={styles.tipTitulo}>NHEJ no siempre es un error</h4>
            <p className={styles.tipTexto}>
              Aunque NHEJ introduce indels aleatorios, puede ser exactamente lo que se busca: desactivar un gen regulador (como BCL11A) o eliminar un receptor viral (como CCR5). No toda la imprecisión es un problema — depende del objetivo terapéutico.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚠️</span>
            <h4 className={styles.tipTitulo}>Off-target no significa catástrofe</h4>
            <p className={styles.tipTexto}>
              Los cortes fuera de diana ocurren, pero su relevancia clínica depende del locus y de la frecuencia. Los sistemas modernos (eSpCas9, HiFi Cas9, editores de base) han reducido los off-targets a niveles no detectables con las técnicas actuales de secuenciación profunda.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <h4 className={styles.tipTitulo}>El coste es el mayor obstáculo actual</h4>
            <p className={styles.tipTexto}>
              Casgevy cuesta 2,2 millones de dólares por tratamiento — uno de los más caros de la historia. El debate sobre accesibilidad global es tan urgente como el debate ético sobre edición germinal. La eficacia sin acceso universal es una promesa incompleta.
            </p>
          </div>
        </div>

        {/* ── 6. Warning Box Educativo ── */}
        <div className={styles.warningBoxEdu} role="note" aria-label="Errores comunes sobre CRISPR">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Malentendidos frecuentes sobre CRISPR-Cas9</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>«CRISPR puede curar cualquier enfermedad genética»</strong> — Falso. Solo enfermedades con genes diana bien identificados, mecanismos de entrega al tejido accesibles y perfil riesgo/beneficio favorable son candidatas reales a terapia CRISPR en el corto plazo.
            </li>
            <li>
              <strong>«CRISPR es 100% preciso»</strong> — Incorrecto. Los off-targets existen, aunque las variantes de alta especificidad los han reducido drásticamente. Ninguna herramienta biológica es perfecta al 100%.
            </li>
            <li>
              <strong>«Los bebés CRISPR fueron un avance científico»</strong> — El experimento de He Jiankui fue condenado unánimemente por la comunidad científica. No aportó conocimiento relevante y violó principios éticos fundamentales: sin necesidad médica clara, sin supervisión ética, con mosaicismo detectado.
            </li>
            <li>
              <strong>«CRISPR y los bebés de diseño ya son una realidad»</strong> — La edición de embriones con fines de mejora (enhancement) está prácticamente prohibida en todo el mundo y ningún país la ha autorizado formalmente. La edición germinal terapéutica está en moratoria internacional.
            </li>
            <li>
              <strong>«HDR siempre es mejor que NHEJ»</strong> — Depende del objetivo. Para knockout de genes reguladores, NHEJ es la vía idónea (más eficiente, sin necesidad de plantilla). HDR es superior solo cuando se necesita insertar una secuencia exacta — y su baja eficiencia sigue siendo el principal obstáculo técnico.
            </li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-crispr-cas9')} />
      <ShareCard appName="visualizador-crispr-cas9" />
      <Footer appName="visualizador-crispr-cas9" />
    </div>
  );
}
