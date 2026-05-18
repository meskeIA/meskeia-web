'use client';

import React, { useState } from 'react';
import { metadata, jsonLd } from './metadata';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorSistemaInmune.module.css';

// Suprimir advertencia de metadata no usada en client component
void metadata;

// ============================================================================
// TIPOS
// ============================================================================

interface ComponenteDefensa {
  nombre: string;
  icono: string;
  descripcion: string;
}

interface LineaDefensa {
  numero: number;
  titulo: string;
  emoji: string;
  tipo: string;
  color: string;
  descripcion: string;
  componentes: ComponenteDefensa[];
}

interface CelulaInmune {
  nombre: string;
  emoji: string;
  tipo: 'Innata' | 'Adaptativa';
  color: string;
  funcion: string;
  datoClave: string;
}

interface IsotipoAnticuerpo {
  isotipo: string;
  color: string;
  funcion: string;
  localizacion: string;
}

interface TipoVacuna {
  nombre: string;
  emoji: string;
  mecanismo: string;
  ejemplos: string;
  color: string;
}

interface UmbralRebano {
  enfermedad: string;
  umbral: number;
  rango: string;
}

// ============================================================================
// DATOS: Las 3 líneas de defensa
// ============================================================================

const LINEAS_DEFENSA: LineaDefensa[] = [
  {
    numero: 1,
    titulo: 'Barrera física y química',
    emoji: '🧱',
    tipo: 'Siempre activa — no necesita activación',
    color: '#27ae60',
    descripcion:
      'La primera muralla: impide que los patógenos entren en el cuerpo. Son barreras pasivas que funcionan 24/7 sin consumir energía extra.',
    componentes: [
      {
        nombre: 'Piel',
        icono: '🧱',
        descripcion:
          'Barrera impermeable de queratina. Cubre ~2 m² y se renueva cada 2–3 semanas. El pH ácido (4,5–5,5) inhibe muchos microorganismos.',
      },
      {
        nombre: 'Mucosas',
        icono: '💧',
        descripcion:
          'Recubren nariz, boca, pulmones e intestinos. El moco atrapa partículas y patógenos; los cilios los empujan hacia afuera.',
      },
      {
        nombre: 'Lisozima',
        icono: '👅',
        descripcion:
          'Enzima presente en saliva, lágrimas y secreción nasal. Rompe la pared celular de las bacterias gram-positivas.',
      },
      {
        nombre: 'Ácido gástrico',
        icono: '🧪',
        descripcion:
          'pH 1,5–3,5. Destruye la mayoría de microorganismos que entran con la comida. Barrera clave contra patógenos alimentarios.',
      },
      {
        nombre: 'Lágrimas',
        icono: '👁️',
        descripcion:
          'Lavan la superficie del ojo y contienen lisozima y anticuerpos IgA secretores que neutralizan patógenos.',
      },
      {
        nombre: 'Microbioma',
        icono: '🦠',
        descripcion:
          'Flora bacteriana "amiga" que compite con patógenos por espacio y nutrientes. El 70% vive en el intestino.',
      },
    ],
  },
  {
    numero: 2,
    titulo: 'Inmunidad innata inespecífica',
    emoji: '⚡',
    tipo: 'Rápida (minutos–horas), inespecífica, sin memoria',
    color: '#e67e22',
    descripcion:
      'Si un patógeno supera las barreras, se activa la respuesta innata: rápida, genérica y sin memoria inmunológica. Ataca a todo lo "extraño".',
    componentes: [
      {
        nombre: 'Inflamación',
        icono: '🔥',
        descripcion:
          'Enrojecimiento, calor, hinchazón y dolor. Dilata los vasos para traer más glóbulos blancos y proteínas al foco de infección.',
      },
      {
        nombre: 'Fiebre',
        icono: '🌡️',
        descripcion:
          'Eleva la temperatura corporal para dificultar la reproducción de los patógenos, que están adaptados a los 37 °C.',
      },
      {
        nombre: 'Neutrófilos',
        icono: '⚪',
        descripcion:
          'Los más numerosos (60–70 % de leucocitos). Llegan primero al foco y fagocitan bacterias por quimiotaxis. Viven solo horas.',
      },
      {
        nombre: 'Macrófagos',
        icono: '🟤',
        descripcion:
          'Engullen hasta 100 bacterias. Además presentan fragmentos del patógeno (antígenos) para activar la inmunidad adaptativa.',
      },
      {
        nombre: 'Células NK',
        icono: '⚔️',
        descripcion:
          '"Natural Killers": destruyen células propias infectadas por virus o tumorales sin necesitar entrenamiento previo.',
      },
      {
        nombre: 'Interferones',
        icono: '📡',
        descripcion:
          'Proteínas de señalización que avisan a las células vecinas de la presencia viral. Aumentan las defensas antivirales.',
      },
    ],
  },
  {
    numero: 3,
    titulo: 'Inmunidad adaptativa específica',
    emoji: '🎯',
    tipo: 'Lenta la primera vez (7–14 días), específica, con MEMORIA',
    color: '#e74c3c',
    descripcion:
      'La artillería pesada: reconoce patógenos específicos, los destruye y RECUERDA. La segunda exposición genera respuesta en horas.',
    componentes: [
      {
        nombre: 'Linfocitos T helper (CD4+)',
        icono: '🟢',
        descripcion:
          'Coordinadores: activan a otros linfocitos B y T citotóxicos. Son el "general" del ejército. Son los que destruye el VIH.',
      },
      {
        nombre: 'Linfocitos T citotóxicos (CD8+)',
        icono: '🔵',
        descripcion:
          'Asesinos: destruyen directamente células propias ya infectadas por virus. Actúan como "soldados de élite".',
      },
      {
        nombre: 'Linfocitos B',
        icono: '🟡',
        descripcion:
          'Fábricas de anticuerpos: producen hasta 2.000 anticuerpos/segundo. Se convierten en células de memoria B al terminar.',
      },
      {
        nombre: 'Anticuerpos (Ig)',
        icono: '🔑',
        descripcion:
          'Proteínas en forma de Y que se unen al antígeno. Neutralizan, aglutinan o marcan patógenos para destrucción.',
      },
      {
        nombre: 'Células de memoria B',
        icono: '🧠',
        descripcion:
          'Recuerdan patógenos pasados durante años o décadas. Son la base biológica de la inmunidad vacunal.',
      },
      {
        nombre: 'Células de memoria T',
        icono: '📝',
        descripcion:
          'Coordinan respuestas mucho más rápidas ante reinfecciones. Patrullan el cuerpo constantemente.',
      },
    ],
  },
];

// ============================================================================
// DATOS: Células guardianas
// ============================================================================

const CELULAS_INMUNES: CelulaInmune[] = [
  {
    nombre: 'Neutrófilo',
    emoji: '⚪',
    tipo: 'Innata',
    color: '#7fb3d3',
    funcion: 'Fagocitar bacterias por quimiotaxis; primera célula en llegar al foco de infección.',
    datoClave: '60–70 % de los leucocitos',
  },
  {
    nombre: 'Macrófago',
    emoji: '🟤',
    tipo: 'Innata',
    color: '#e67e22',
    funcion: 'Fagocitar patógenos y presentar antígenos (célula presentadora de antígeno, CPA). Viven meses.',
    datoClave: 'Engullen hasta 100 bacterias',
  },
  {
    nombre: 'Célula NK',
    emoji: '⚔️',
    tipo: 'Innata',
    color: '#8e44ad',
    funcion: 'Destruir células infectadas por virus o tumorales sin reconocimiento previo del antígeno.',
    datoClave: '"Natural Killer" sin entrenamiento',
  },
  {
    nombre: 'Linfocito B',
    emoji: '🟡',
    tipo: 'Adaptativa',
    color: '#f39c12',
    funcion: 'Producir anticuerpos específicos. Al activarse, se diferencian en células plasmáticas y células de memoria.',
    datoClave: 'Se convierten en células de memoria',
  },
  {
    nombre: 'T CD4 (helper)',
    emoji: '🟢',
    tipo: 'Adaptativa',
    color: '#27ae60',
    funcion: 'Coordinar toda la respuesta inmune adaptativa: activan linfocitos B y T CD8. Son el blanco del VIH.',
    datoClave: 'Los destruye el VIH',
  },
  {
    nombre: 'T CD8 (citotóxico)',
    emoji: '🔵',
    tipo: 'Adaptativa',
    color: '#2E86AB',
    funcion: 'Matar directamente células propias que ya han sido infectadas por un virus, liberando perforinas.',
    datoClave: 'Actúan como "soldados de élite"',
  },
];

// ============================================================================
// DATOS: Isotipos de anticuerpos
// ============================================================================

const ISOTIPOS: IsotipoAnticuerpo[] = [
  {
    isotipo: 'IgG',
    color: '#2E86AB',
    funcion: 'Anticuerpo más abundante en sangre. Neutralización, opsonización, activación del complemento. Cruza la placenta.',
    localizacion: 'Sangre y líquidos extracelulares',
  },
  {
    isotipo: 'IgA',
    color: '#27ae60',
    funcion: 'Protección de mucosas (nariz, boca, intestino, lágrimas, leche materna). Forma dímeros secretores.',
    localizacion: 'Secreciones mucosas y leche materna',
  },
  {
    isotipo: 'IgM',
    color: '#8e44ad',
    funcion: 'Primer anticuerpo producido en una infección primaria. Forma pentámeros muy eficaces para activar el complemento.',
    localizacion: 'Superficie de linfocitos B y sangre',
  },
  {
    isotipo: 'IgE',
    color: '#e74c3c',
    funcion: 'Implicado en alergias y respuesta antiparasitaria. Activa mastocitos y basófilos liberando histamina.',
    localizacion: 'Unido a mastocitos y basófilos',
  },
  {
    isotipo: 'IgD',
    color: '#e67e22',
    funcion: 'Receptor en la superficie de linfocitos B maduros. Función principal: activar linfocitos B vírgenes.',
    localizacion: 'Superficie de linfocitos B',
  },
];

// ============================================================================
// DATOS: Tipos de vacunas
// ============================================================================

const TIPOS_VACUNAS: TipoVacuna[] = [
  {
    nombre: 'Atenuadas',
    emoji: '🟢',
    mecanismo:
      'Patógeno vivo debilitado que se replica un poco sin causar enfermedad grave. Genera una respuesta inmune muy completa, similar a la infección natural.',
    ejemplos: 'Sarampión (MMR), varicela, fiebre amarilla, rotavirus',
    color: '#27ae60',
  },
  {
    nombre: 'Inactivadas',
    emoji: '⚪',
    mecanismo:
      'El patógeno se mata con calor o agentes químicos. No puede replicarse pero sus antígenos permanecen para activar la respuesta inmune.',
    ejemplos: 'Gripe (inyectable), hepatitis A, rabia, polio (Salk)',
    color: '#7f8c8d',
  },
  {
    nombre: 'Subunitarias',
    emoji: '🔵',
    mecanismo:
      'Solo usa proteínas de superficie del patógeno (no el microorganismo completo). El sistema inmune aprende a reconocer esa proteína específica.',
    ejemplos: 'Hepatitis B, tosferina, VPH (papiloma), meningococo',
    color: '#2E86AB',
  },
  {
    nombre: 'ARNm',
    emoji: '🟡',
    mecanismo:
      'Inyecta instrucciones de ARN mensajero para que las propias células fabriquen una proteína viral (ej: proteína spike). El sistema inmune responde a ella.',
    ejemplos: 'COVID-19 Pfizer-BioNTech, COVID-19 Moderna',
    color: '#f39c12',
  },
  {
    nombre: 'Vectoriales',
    emoji: '🔴',
    mecanismo:
      'Usa un virus modificado (vector, generalmente adenovirus) como vehículo para introducir material genético del patógeno objetivo.',
    ejemplos: 'COVID-19 AstraZeneca, COVID-19 Janssen',
    color: '#e74c3c',
  },
];

// ============================================================================
// DATOS: Umbrales de inmunidad de rebaño
// ============================================================================

const UMBRALES_REBANO: UmbralRebano[] = [
  { enfermedad: 'Sarampión', umbral: 95, rango: '95 %' },
  { enfermedad: 'Polio', umbral: 83, rango: '80–85 %' },
  { enfermedad: 'COVID-19', umbral: 80, rango: '70–90 %' },
  { enfermedad: 'Gripe estacional', umbral: 75, rango: '70–80 %' },
];

// ============================================================================
// SUBCOMPONENTE: Tab 1 — Las 3 Líneas de Defensa
// ============================================================================

function TabDefensas() {
  const [lineaActiva, setLineaActiva] = useState<number>(0);
  const linea = LINEAS_DEFENSA[lineaActiva];

  return (
    <section className={styles.tabContent} aria-label="Las 3 líneas de defensa del sistema inmune">
      <p className={styles.introText}>
        Un patógeno que quiere infectarte debe superar <strong>3 capas defensivas</strong>.
        La mayoría no pasan de la primera.
      </p>

      <div className={styles.defensasGrid}>
        {LINEAS_DEFENSA.map((l, i) => (
          <button
            key={l.numero}
            type="button"
            className={`${styles.defensaCard} ${lineaActiva === i ? styles.defensaCardActiva : ''}`}
            style={{
              borderLeftColor: l.color,
              background: lineaActiva === i
                ? `linear-gradient(135deg, ${l.color}12 0%, ${l.color}06 100%)`
                : undefined,
            }}
            onClick={() => setLineaActiva(i)}
            aria-pressed={lineaActiva === i}
            aria-label={`Ver línea de defensa ${l.numero}: ${l.titulo}`}
          >
            <div className={styles.defensaCardRow}>
              <span className={styles.defensaNumero} style={{ background: l.color }}>
                {l.numero}ª
              </span>
              <span className={styles.defensaEmoji} aria-hidden="true">{l.emoji}</span>
              <span className={styles.defensaCardTitle}>{l.titulo}</span>
            </div>
            <p className={styles.defensaTipo}>{l.tipo}</p>
          </button>
        ))}
      </div>

      <div className={styles.lineaDetalle} style={{ borderLeftColor: linea.color }}>
        <h3 className={styles.lineaTitulo} style={{ color: linea.color }}>
          {linea.emoji} {linea.numero}ª Línea — {linea.titulo}
        </h3>
        <p className={styles.lineaDesc}>{linea.descripcion}</p>

        <div className={styles.componentesGrid}>
          {linea.componentes.map((c, i) => (
            <div key={i} className={styles.componenteCard}>
              <div className={styles.componenteHeader}>
                <span aria-hidden="true">{c.icono}</span>
                <strong>{c.nombre}</strong>
              </div>
              <p className={styles.componenteDesc}>{c.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SUBCOMPONENTE: Tab 2 — Células Guardianas
// ============================================================================

function TabCelulas() {
  const [celulaActiva, setCelulaActiva] = useState<number | null>(null);

  return (
    <section className={styles.tabContent} aria-label="Células del sistema inmune">
      <p className={styles.introText}>
        El sistema inmune tiene un ejército de células especializadas. Cada una cumple una misión
        concreta — desde ser la primera en llegar hasta recordar enemigos pasados.
      </p>

      <div className={styles.celulasGrid}>
        {CELULAS_INMUNES.map((c, i) => (
          <div
            key={i}
            className={`${styles.celulaCard} ${celulaActiva === i ? styles.celulaCardActiva : ''}`}
            style={{ borderTopColor: c.color }}
            onClick={() => setCelulaActiva(celulaActiva === i ? null : i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCelulaActiva(celulaActiva === i ? null : i);
              }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={celulaActiva === i}
            aria-label={`Ver detalles de ${c.nombre}`}
          >
            <span className={styles.celulaIcon} aria-hidden="true">{c.emoji}</span>
            <h4 className={styles.celulaNombre}>{c.nombre}</h4>
            <span
              className={styles.celulaTipo}
              style={{ color: c.tipo === 'Innata' ? '#e67e22' : '#2E86AB' }}
            >
              {c.tipo}
            </span>
            {celulaActiva === i && (
              <div className={styles.celulaDetalle}>
                <p className={styles.celulaFuncion}>{c.funcion}</p>
                <span className={styles.celulaDato}>{c.datoClave}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Las células <strong>innatas</strong> son los primeros respondedores — rápidos pero sin memoria.
          Las células <strong>adaptativas</strong> son más lentas pero específicas, y recuerdan al
          enemigo para responder más rápido la próxima vez.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// SUBCOMPONENTE: Tab 3 — Los Anticuerpos
// ============================================================================

function TabAnticuerpos() {
  return (
    <section className={styles.tabContent} aria-label="Estructura y tipos de anticuerpos">
      <p className={styles.introText}>
        Los anticuerpos son proteínas en forma de <strong>Y</strong> fabricadas por los linfocitos B.
        Cada uno es <em>específico</em> para un antígeno concreto — como una llave que solo abre una cerradura.
      </p>

      <h3 className={styles.subTitulo}>Estructura del anticuerpo</h3>
      <div className={styles.anticuerpoWrapper}>
        <div className={styles.anticuerpoFigura}>
          <svg
            viewBox="0 0 300 270"
            className={styles.anticuerpoSvg}
            role="img"
            aria-label="Diagrama de un anticuerpo en forma de Y: dos brazos superiores con regiones variables y un tallo inferior con región constante"
          >
            {/* Brazo izquierdo */}
            <rect x="30" y="18" width="70" height="28" rx="8" fill="#e74c3c" opacity="0.88" />
            <text x="65" y="36" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">
              Variable
            </text>
            <rect x="30" y="50" width="70" height="44" rx="8" fill="#2E86AB" opacity="0.88" />
            <text x="65" y="77" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">
              Constante
            </text>

            {/* Brazo derecho */}
            <rect x="200" y="18" width="70" height="28" rx="8" fill="#e74c3c" opacity="0.88" />
            <text x="235" y="36" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">
              Variable
            </text>
            <rect x="200" y="50" width="70" height="44" rx="8" fill="#2E86AB" opacity="0.88" />
            <text x="235" y="77" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">
              Constante
            </text>

            {/* Bisagra */}
            <line x1="100" y1="94" x2="150" y2="122" stroke="#2E86AB" strokeWidth="7" strokeLinecap="round" />
            <line x1="200" y1="94" x2="150" y2="122" stroke="#2E86AB" strokeWidth="7" strokeLinecap="round" />

            {/* Tallo (región Fc) */}
            <rect x="126" y="122" width="48" height="70" rx="10" fill="#2E86AB" opacity="0.88" />
            <text x="150" y="152" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="600">
              Región Fc
            </text>
            <text x="150" y="164" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="600">
              (constante)
            </text>

            {/* Antígenos */}
            <circle cx="52" cy="10" r="6" fill="#e67e22" opacity="0.7" />
            <circle cx="78" cy="10" r="6" fill="#e67e22" opacity="0.7" />
            <circle cx="222" cy="10" r="6" fill="#e67e22" opacity="0.7" />
            <circle cx="248" cy="10" r="6" fill="#e67e22" opacity="0.7" />

            {/* Etiquetas sitio de unión */}
            <text x="65" y="8" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.65">
              Sitio unión Ag
            </text>
            <text x="235" y="8" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.65">
              Sitio unión Ag
            </text>

            {/* Leyenda */}
            <rect x="18" y="216" width="12" height="12" rx="3" fill="#e74c3c" opacity="0.88" />
            <text x="36" y="226" fill="currentColor" fontSize="8.5">
              Región variable → reconoce antígeno (Fab)
            </text>
            <rect x="18" y="234" width="12" height="12" rx="3" fill="#2E86AB" opacity="0.88" />
            <text x="36" y="244" fill="currentColor" fontSize="8.5">
              Región constante → activa defensas (Fc)
            </text>
            <circle cx="180" cy="222" r="5" fill="#e67e22" opacity="0.7" />
            <text x="190" y="226" fill="currentColor" fontSize="8.5">
              Antígeno
            </text>
          </svg>

          <div className={styles.anticuerpoLeyenda}>
            <p>
              <strong>2 cadenas pesadas + 2 cadenas ligeras</strong> forman la estructura en Y.
            </p>
            <p>
              La <strong>región variable Fab</strong> (brazos, arriba) cambia para cada antígeno —
              es la &ldquo;llave&rdquo; específica.
            </p>
            <p>
              La <strong>región constante Fc</strong> (tallo, abajo) es igual en todos los anticuerpos
              del mismo isotipo. Activa otras defensas: marca al patógeno para ser engullido por un
              macrófago (opsonización) o activa el complemento.
            </p>
            <p>
              Un anticuerpo tiene <strong>2 sitios de unión</strong> al antígeno (bivalente) — puede
              unirse a 2 antígenos al mismo tiempo, formando redes de aglutinación.
            </p>
          </div>
        </div>
      </div>

      <h3 className={styles.subTitulo}>Los 5 isotipos de anticuerpos</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.isotiposTable}>
          <caption className={styles.tableCaption}>
            Tabla comparativa de los 5 isotipos de inmunoglobulinas
          </caption>
          <thead>
            <tr>
              <th scope="col">Isotipo</th>
              <th scope="col">Función principal</th>
              <th scope="col">Localización</th>
            </tr>
          </thead>
          <tbody>
            {ISOTIPOS.map((iso) => (
              <tr key={iso.isotipo}>
                <td>
                  <span
                    className={styles.isotipoBadge}
                    style={{ background: iso.color }}
                  >
                    {iso.isotipo}
                  </span>
                </td>
                <td>{iso.funcion}</td>
                <td className={styles.isotipoLoc}>{iso.localizacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ============================================================================
// SUBCOMPONENTE: Tab 4 — Vacunas e Inmunidad
// ============================================================================

function TabVacunas() {
  const [vacunaActiva, setVacunaActiva] = useState<number | null>(null);

  return (
    <section className={styles.tabContent} aria-label="Tipos de vacunas e inmunidad de rebaño">
      <p className={styles.introText}>
        Las vacunas aprovechan la <strong>memoria inmunológica</strong>: introducen un antígeno
        inofensivo para que el sistema inmune &ldquo;practique&rdquo; antes de que llegue el patógeno real.
      </p>

      <h3 className={styles.subTitulo}>5 tipos de vacunas</h3>
      <div className={styles.vacunasGrid}>
        {TIPOS_VACUNAS.map((v, i) => (
          <div
            key={i}
            className={`${styles.vacunaCard} ${vacunaActiva === i ? styles.vacunaCardActiva : ''}`}
            style={{ borderLeftColor: v.color }}
            onClick={() => setVacunaActiva(vacunaActiva === i ? null : i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setVacunaActiva(vacunaActiva === i ? null : i);
              }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={vacunaActiva === i}
            aria-label={`Ver detalles de vacuna ${v.nombre}`}
          >
            <div className={styles.vacunaHeaderRow}>
              <span className={styles.vacunaIcono} aria-hidden="true">{v.emoji}</span>
              <h4 className={styles.vacunaNombre}>{v.nombre}</h4>
            </div>
            {vacunaActiva === i && (
              <div className={styles.vacunaDetalle}>
                <p className={styles.vacunaMecanismo}>{v.mecanismo}</p>
                <p className={styles.vacunaEjemplos}>
                  <strong>Ejemplos:</strong> {v.ejemplos}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 className={styles.subTitulo}>Inmunidad de rebaño — umbrales por enfermedad</h3>
      <div className={styles.rebanoSection}>
        <p className={styles.rebanoDesc}>
          Cuando un porcentaje suficiente de la población está protegida (vacunada o inmunizada por
          infección previa), el patógeno deja de encontrar suficientes huéspedes y se frena la
          transmisión. Esto protege también a quienes <strong>no pueden vacunarse</strong> (bebés
          pequeños, personas inmunodeprimidas, alérgicos a componentes).
        </p>
        <div
          className={styles.rebanoChart}
          role="img"
          aria-label="Gráfico de barras con los umbrales de inmunidad de rebaño por enfermedad"
        >
          {UMBRALES_REBANO.map((u) => (
            <div key={u.enfermedad} className={styles.rebanoFila}>
              <span className={styles.rebanoEnfermedad}>{u.enfermedad}</span>
              <div className={styles.rebanoTrack}>
                <div
                  className={styles.rebanoFill}
                  style={{ width: `${u.umbral}%` }}
                >
                  {u.rango}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Una vacuna es un <strong>simulacro de incendio</strong> para el sistema inmune: practica la
          respuesta sin peligro real. Cuando llega el patógeno de verdad, el cuerpo ya sabe exactamente
          qué hacer y responde en horas en lugar de 7–14 días.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function VisualizadorSistemaInmune() {
  const [tabActivo, setTabActivo] = useState(0);

  const tabs = [
    'Las 3 Líneas de Defensa',
    'Células Guardianas',
    'Los Anticuerpos',
    'Vacunas e Inmunidad',
  ];

  const renderTab = () => {
    switch (tabActivo) {
      case 0:
        return <TabDefensas />;
      case 1:
        return <TabCelulas />;
      case 2:
        return <TabAnticuerpos />;
      case 3:
        return <TabVacunas />;
      default:
        return <TabDefensas />;
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcono} aria-hidden="true">🛡️</span>
          <h1 className={styles.title}>El Sistema Inmune</h1>
          <p className={styles.subtitle}>
            Las 3 líneas de defensa, células guardianas, anticuerpos y vacunas
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* Tabs de navegación */}
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador del sistema inmune">
          {tabs.map((tab, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={tabActivo === i}
              className={`${styles.tabBtn} ${tabActivo === i ? styles.tabBtnActive : ''}`}
              onClick={() => setTabActivo(i)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {renderTab()}

        {/* Disclaimer salud — nivel 2 ALTO, no colapsable */}
        <DisclaimerCard variant="medical" severity="high" collapsible={false} />

        <EducationalSection
          title="Guía completa del Sistema Inmune"
          subtitle="Conceptos clave, preguntas frecuentes y datos curiosos"
          icon="🛡️"
        >
          {/* 1. Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>Inmunidad Innata vs Adaptativa</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Característica</th>
                    <th>Inmunidad Innata</th>
                    <th>Inmunidad Adaptativa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Velocidad</strong></td>
                    <td>Minutos – horas</td>
                    <td>7–14 días (1ª vez)</td>
                  </tr>
                  <tr>
                    <td><strong>Especificidad</strong></td>
                    <td>Genérica (patrones PAMP)</td>
                    <td>Específica para cada antígeno</td>
                  </tr>
                  <tr>
                    <td><strong>Memoria</strong></td>
                    <td>No (misma respuesta siempre)</td>
                    <td>Sí → inmunidad de por vida</td>
                  </tr>
                  <tr>
                    <td><strong>Células principales</strong></td>
                    <td>Neutrófilos, macrófagos, NK</td>
                    <td>Linfocitos T y B</td>
                  </tr>
                  <tr>
                    <td><strong>Base de las vacunas</strong></td>
                    <td>No directamente</td>
                    <td>Sí — genera memoria específica</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.guideSection}>
            <h2>Inmunología en la vida real</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🌡️</span>
                  <h3>Fiebre</h3>
                </div>
                <p className={styles.escenarioTip}>
                  No es el enemigo. Es una respuesta deliberada: a 38–39 °C los patógenos se reproducen
                  peor porque están optimizados para 37 °C. Bajar la fiebre por debajo de 38,5 °C en
                  adultos puede prolongar la infección.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">💉</span>
                  <h3>Vacunas en la práctica</h3>
                </div>
                <p className={styles.escenarioTip}>
                  El calendario vacunal está diseñado para crear memoria antes de la exposición.
                  Saltarse dosis o retrasar el calendario deja ventanas de vulnerabilidad en las etapas
                  de mayor riesgo.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🤧</span>
                  <h3>Alergias</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Son una respuesta inmune desproporcionada a sustancias inofensivas (IgE + mastocitos).
                  La hipótesis de la higiene propone que la escasa exposición a patógenos en la infancia
                  podría asociarse con mayor riesgo, aunque la evidencia sigue siendo objeto de investigación.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🏥</span>
                  <h3>Inmunodeficiencias</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Sin sistema inmune funcional (VIH avanzado, inmunosupresión post-trasplante), infecciones
                  oportunistas que un sistema sano controlaría habitualmente pueden derivar en complicaciones graves.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>❓ ¿Las vacunas sobrecargan el sistema inmune?</h4>
                <p>
                  No. Un organismo sano puede responder a miles de antígenos simultáneamente. Las vacunas
                  actuales usan solo fragmentos de patógenos — un estímulo mínimo comparado con cualquier
                  infección natural.
                </p>
                <div className={styles.faqTip}>
                  El calendario vacunal pediátrico completo activa muchos menos antígenos de los que el
                  sistema inmune gestiona a diario en su entorno habitual.
                </div>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué son los anticuerpos monoclonales?</h4>
                <p>
                  Anticuerpos producidos en laboratorio para reconocer un objetivo específico (célula
                  tumoral, proteína viral). Medicamentos como trastuzumab (cáncer de mama) o nivolumab
                  (inmunoterapia oncológica) son anticuerpos monoclonales.
                </p>
                <div className={styles.faqTip}>
                  Son una de las familias de fármacos de mayor crecimiento en las últimas décadas,
                  especialmente en oncología y enfermedades autoinmunes.
                </div>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Por qué el VIH es tan difícil de curar?</h4>
                <p>
                  El VIH infecta precisamente los linfocitos T CD4 — los coordinadores de la inmunidad
                  adaptativa. Al reducirlos, deteriora la respuesta inmune adaptativa. Además, se integra
                  en el ADN celular formando reservorios latentes que los tratamientos actuales no eliminan.
                </p>
                <div className={styles.faqTip}>
                  Los tratamientos antirretrovirales actuales controlan la replicación viral con gran
                  eficacia, permitiendo una esperanza de vida cercana a la de la población general.
                </div>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué diferencia hay entre autoinmunidad y alergia?</h4>
                <p>
                  La autoinmunidad ataca tejidos propios (artritis reumatoide, diabetes tipo 1, lupus).
                  La alergia es una respuesta desproporcionada a sustancias externas inofensivas mediada
                  por IgE. Ambas implican pérdida de tolerancia, pero frente a dianas distintas.
                </p>
                <div className={styles.faqTip}>
                  En ambos casos, el sistema inmune es funcionalmente activo — el problema es la dirección
                  de esa actividad, no la fuerza en sí.
                </div>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Pueden mejorarse las defensas con suplementos?</h4>
                <p>
                  El concepto de &ldquo;reforzar el sistema inmune&rdquo; está sobrevalorado comercialmente. Un
                  sistema hiperactivo causa autoinmunidad y alergias. Lo que sí apoya su funcionamiento
                  adecuado: dormir suficiente, ejercicio moderado regular, no fumar, y corregir déficits
                  reales de vitamina D o zinc cuando estén documentados.
                </p>
                <div className={styles.faqTip}>
                  Ante cualquier duda sobre suplementación, consulta con un profesional sanitario que
                  pueda valorar tu situación individual.
                </div>
              </div>
            </div>
          </section>

          {/* 4. Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>Cómo cuidar tu sistema inmune</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Mantén al día el calendario de vacunación</h4>
                  <p>
                    Para adultos incluye la gripe anual, el tétanos cada 10 años y el herpes zóster
                    a partir de los 50. Consulta las recomendaciones vigentes en tu país o región.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Duerme entre 7 y 9 horas</h4>
                  <p>
                    Durante el sueño se producen citocinas y se consolida la memoria inmune. El déficit
                    crónico de sueño se asocia a mayor susceptibilidad a infecciones.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Practica ejercicio de intensidad moderada</h4>
                  <p>
                    El ejercicio moderado y regular se asocia a una respuesta inmune más equilibrada.
                    El ejercicio intenso y prolongado puede suprimir temporalmente algunas funciones
                    inmunitarias, especialmente sin recuperación adecuada.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Gestiona el estrés crónico</h4>
                  <p>
                    El cortisol elevado de forma sostenida suprime la actividad de linfocitos T y células
                    NK. El estrés crónico se asocia a mayor susceptibilidad a infecciones y peor respuesta
                    vacunal.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Revisa tus niveles de vitamina D si tienes dudas</h4>
                  <p>
                    El déficit de vitamina D (por debajo de 20 ng/mL) es frecuente y puede afectar a
                    la respuesta innata y adaptativa. Una analítica rutinaria permite detectarlo y
                    corregirlo si fuera necesario.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Tips */}
          <section className={styles.guideSection}>
            <h2>Buenas prácticas destacadas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🤲</span>
                <h4>El lavado de manos, clave</h4>
                <p>
                  Rompe la cadena de transmisión antes de que el sistema inmune tenga que actuar.
                  Es una de las intervenciones con mayor evidencia de efectividad en la prevención de
                  infecciones respiratorias y gastrointestinales.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💉</span>
                <h4>Vacunas e inmunidad colectiva</h4>
                <p>
                  Cuando una proporción suficiente de la población está inmunizada, la transmisión se
                  frena y se protege también a quienes no pueden vacunarse (inmunodeprimidos, bebés,
                  alérgicos a componentes).
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌞</span>
                <h4>Exposición solar y vitamina D</h4>
                <p>
                  15–20 minutos de exposición solar al día en brazos y cara es la forma más eficiente
                  de mantener niveles adecuados de vitamina D3 en climas mediterráneos. En latitudes
                  altas o con poca exposición, puede requerirse suplementación.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🚫</span>
                <h4>Antibióticos solo con prescripción</h4>
                <p>
                  Usarlos sin necesidad destruye el microbioma intestinal, donde reside aproximadamente
                  el 70 % del tejido linfoide del organismo (MALT). La automedicación con antibióticos
                  también contribuye a la resistencia bacteriana.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Warning box v2.0 */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores comunes sobre el Sistema Inmune</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ &ldquo;Los antibióticos curan las infecciones víricas&rdquo;:</strong> Falso.
                Solo actúan contra bacterias. Usarlos contra virus (catarro, gripe) no aporta
                beneficio y contribuye a la resistencia bacteriana.
              </li>
              <li>
                <strong>❌ &ldquo;Un sistema inmune fuerte es siempre mejor&rdquo;:</strong> Un sistema
                hiperactivo causa autoinmunidad (artritis reumatoide, lupus) y alergias severas.
                El equilibrio es el objetivo, no la hiperactividad.
              </li>
              <li>
                <strong>❌ &ldquo;Las vacunas causan autismo&rdquo;:</strong> Afirmación ampliamente
                refutada. El estudio original de Wakefield fue retractado por fraude y conflicto de
                intereses. Ningún estudio posterior —en decenas de millones de niños— ha encontrado
                relación causal.
              </li>
              <li>
                <strong>❌ &ldquo;Si tengo buenas defensas, no necesito vacunarme&rdquo;:</strong> La
                inmunidad natural frente a muchos patógenos requiere haber pasado la enfermedad,
                con sus riesgos asociados. La vacuna ofrece protección sin necesidad de pasar por
                las posibles complicaciones de la infección.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sistema-inmune')} />
        <ShareCard appName="visualizador-sistema-inmune" />
      </main>

      <Footer appName="visualizador-sistema-inmune" />
    </div>
  );
}
