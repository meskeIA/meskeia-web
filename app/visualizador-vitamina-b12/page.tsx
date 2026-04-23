'use client';

import { useState } from 'react';
import styles from './VisualizadorVitaminaB12.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface NodoMetilacion {
  id: string;
  nombre: string;
  abrev: string;
  color: string;
  descripcion: string;
}

interface PasoAbsorcion {
  id: number;
  lugar: string;
  icono: string;
  titulo: string;
  detalle: string;
  alerta?: string;
}

interface GrupoRiesgo {
  id: string;
  icono: string;
  titulo: string;
  severidad: 'alta' | 'media' | 'baja';
  descripcion: string;
  detalle: string;
  prevalencia: string;
}

interface SintomaTrack {
  tipo: 'hematologico' | 'neurologico';
  etapas: { label: string; descripcion: string; alerta: boolean }[];
}

// ─────────────────────────────────────────────
// Datos: Ciclo de metilación
// ─────────────────────────────────────────────

const NODOS_METILACION: NodoMetilacion[] = [
  {
    id: 'metionina',
    nombre: 'Metionina',
    abrev: 'Met',
    color: '#2E86AB',
    descripcion: 'Aminoácido esencial. Punto de entrada del ciclo de metilación. Procede de proteínas animales y vegetales en la dieta.',
  },
  {
    id: 'sam',
    nombre: 'S-adenosilmetionina',
    abrev: 'SAM',
    color: '#48A9A6',
    descripcion: 'El donador universal de grupos metilo. Sin SAM no hay metilación del ADN (epigenética), ni síntesis de neurotransmisores (serotonina → melatonina), ni formación de mielina (vaina que protege los nervios).',
  },
  {
    id: 'homocisteina',
    nombre: 'Homocisteína',
    abrev: 'Hcy',
    color: '#E74C3C',
    descripcion: 'Se genera tras la cesión del grupo metilo. Si no hay B12 suficiente, se ACUMULA. La homocisteína elevada es marcador de riesgo cardiovascular y deterioro cognitivo.',
  },
  {
    id: 'ciclo',
    nombre: 'Reciclaje (necesita B12)',
    abrev: '↩ B12+B9',
    color: '#7FB3D3',
    descripcion: 'La vitamina B12 (metilcobalamina) y el folato (B9) son cofactores imprescindibles para regenerar metionina desde homocisteína. Sin B12, el ciclo se interrumpe.',
  },
];

// ─────────────────────────────────────────────
// Datos: Sistema de absorción
// ─────────────────────────────────────────────

const PASOS_ABSORCION: PasoAbsorcion[] = [
  {
    id: 1,
    lugar: 'Boca / Estómago superior',
    icono: '🍖',
    titulo: 'B12 unida a proteínas alimentarias',
    detalle: 'La B12 en los alimentos (carne, pescado, huevos, lácteos) llega unida a proteínas. El ácido gástrico y la pepsina del estómago son necesarios para liberarla.',
    alerta: undefined,
  },
  {
    id: 2,
    lugar: 'Estómago',
    icono: '🏭',
    titulo: 'Factor Intrínseco (FI)',
    detalle: 'Las células parietales del estómago secretan el Factor Intrínseco. La B12 libre se une inmediatamente al FI formando el complejo B12-FI, que es resistente a la digestión.',
    alerta: 'Sin FI → Anemia Perniciosa (causa autoinmune: anticuerpos destruyen las células parietales)',
  },
  {
    id: 3,
    lugar: 'Íleon terminal (intestino delgado final)',
    icono: '🔬',
    titulo: 'Receptor cubilin',
    detalle: 'El receptor cubilin en las células del íleon terminal reconoce específicamente el complejo B12-FI y lo absorbe por endocitosis. Sin este receptor, la absorción falla (enfermedad de Imerslund-Gräsbeck).',
    alerta: undefined,
  },
  {
    id: 4,
    lugar: 'Sangre → Hígado',
    icono: '🚚',
    titulo: 'Transcobalamina y almacén hepático',
    detalle: 'En sangre, la B12 viaja unida a transcobalamina II hacia el hígado. El hígado almacena 2-5 mg de B12 (reserva para 3-5 años). Por eso la deficiencia tarda años en manifestarse tras cambiar la dieta.',
    alerta: undefined,
  },
];

// ─────────────────────────────────────────────
// Datos: Grupos de riesgo
// ─────────────────────────────────────────────

const GRUPOS_RIESGO: GrupoRiesgo[] = [
  {
    id: 'veganos',
    icono: '🌱',
    titulo: 'Veganos y vegetarianos',
    severidad: 'alta',
    descripcion: 'La B12 solo se encuentra de forma natural en alimentos de origen animal. Ningún alimento vegetal (incluidas algas y levadura nutricional) contiene B12 activa en cantidad significativa.',
    detalle: 'Las algas como la espirulina contienen análogos inactivos de B12 que bloquean los receptores sin aportar actividad. La suplementación es OBLIGATORIA: 250 µg/día de cianocobalamina o 2.000 µg/semana.',
    prevalencia: '52-86% de veganos sin suplementación presentan deficiencia',
  },
  {
    id: 'mayores50',
    icono: '👴',
    titulo: 'Mayores de 50 años',
    severidad: 'alta',
    descripcion: 'La gastritis atrófica (inflamación crónica del estómago) es muy frecuente con la edad. Reduce la producción de ácido gástrico y de Factor Intrínseco, disminuyendo la absorción un 20-40%.',
    detalle: 'El National Institute on Aging recomienda que los mayores de 50 obtengan la B12 principalmente de alimentos fortificados o suplementos (la B12 libre, no unida a proteínas, no requiere ácido gástrico para absorberse). La infección por H. pylori agrava la gastritis atrófica.',
    prevalencia: '10-30% de mayores de 60 años tienen deficiencia subclínica',
  },
  {
    id: 'metformina',
    icono: '💊',
    titulo: 'Usuarios de Metformina',
    severidad: 'media',
    descripcion: 'La metformina (antidiabético oral más prescrito del mundo) bloquea la absorción ileal de B12 dependiente del calcio. El mecanismo exacto aún no es completamente conocido.',
    detalle: 'El riesgo aumenta con la dosis y la duración del tratamiento. La ADA (American Diabetes Association) recomienda monitorizar los niveles de B12 en pacientes con metformina a largo plazo. El calcio oral podría revertir parcialmente este efecto.',
    prevalencia: '5-30% de usuarios crónicos de metformina presentan deficiencia',
  },
  {
    id: 'ibp',
    icono: '💊',
    titulo: 'Inhibidores de la Bomba de Protones (IBP)',
    severidad: 'media',
    descripcion: 'Omeprazol, lansoprazol, pantoprazol y similares reducen drásticamente el ácido gástrico. Sin ácido, la B12 no se libera de las proteínas alimentarias correctamente.',
    detalle: 'El uso crónico (más de 2 años) se asocia con deficiencia de B12. Un estudio de Kaiser Permanente (2013) mostró que el uso de IBP durante 2+ años aumentaba el riesgo de deficiencia de B12 un 65%. Los antiácidos H2 (ranitidina) tienen un efecto similar pero menor.',
    prevalencia: 'Riesgo aumenta 65% con uso de IBP durante 2+ años',
  },
  {
    id: 'cirugia',
    icono: '🏥',
    titulo: 'Gastrectomía y Bypass Gástrico',
    severidad: 'alta',
    descripcion: 'La gastrectomía total elimina las células parietales que producen el Factor Intrínseco. Sin FI, la absorción oral de B12 es imposible (excepto por difusión pasiva a dosis muy altas).',
    detalle: 'El bypass gástrico también reduce la producción de FI al excluir parte del estómago. Todos estos pacientes necesitan suplementación de por vida: inyecciones intramusculares de B12 (1.000 µg/mes) o dosis orales muy altas (1.000-2.000 µg/día, aprovechando la absorción pasiva).',
    prevalencia: 'Deficiencia casi universal sin suplementación tras gastrectomía total',
  },
];

// ─────────────────────────────────────────────
// Datos: Síntomas por track
// ─────────────────────────────────────────────

const TRACKS_SINTOMAS: SintomaTrack[] = [
  {
    tipo: 'hematologico',
    etapas: [
      {
        label: 'Niveles bajos',
        descripcion: 'Los depósitos hepáticos se agotan. Análisis normales aún, pero homocisteína y ácido metilmalónico comienzan a elevarse.',
        alerta: false,
      },
      {
        label: 'Megaloblastosis',
        descripcion: 'Las células de la médula ósea no pueden dividirse correctamente. Producen glóbulos rojos grandes, ovalados y no funcionales (megaloblastos).',
        alerta: false,
      },
      {
        label: 'Anemia Megaloblástica',
        descripcion: 'Fatiga intensa, debilidad, palidez, falta de aliento. Los glóbulos rojos grandes no transportan el oxígeno eficientemente.',
        alerta: true,
      },
      {
        label: 'Crisis hemática',
        descripcion: 'Pancitopenia (reducción de todos los tipos de células sanguíneas). Infecciones frecuentes, tendencia a sangrado.',
        alerta: true,
      },
    ],
  },
  {
    tipo: 'neurologico',
    etapas: [
      {
        label: 'Parestesias',
        descripcion: 'Hormigueo, entumecimiento y sensación de "pinchazos" en manos y pies. La mielina que cubre los nervios empieza a deteriorarse.',
        alerta: false,
      },
      {
        label: 'Debilidad muscular',
        descripcion: 'Dificultad para realizar tareas finas. Alteraciones del equilibrio. Puede aparecer SIN anemia previa (importante para diagnóstico).',
        alerta: true,
      },
      {
        label: 'Dificultad al caminar',
        descripcion: 'Degeneración subaguda combinada de la médula espinal (columnas dorsal y lateral). Marcha inestable, Romberg positivo.',
        alerta: true,
      },
      {
        label: 'Deterioro cognitivo',
        descripcion: 'Déficit de memoria, confusión, depresión, psicosis en casos severos. Los daños neurológicos pueden ser IRREVERSIBLES si no se tratan a tiempo.',
        alerta: true,
      },
    ],
  },
];

// ─────────────────────────────────────────────
// Componente: Ciclo de Metilación
// ─────────────────────────────────────────────

function BloqueCicloMetilacion() {
  const [nodoSeleccionado, setNodoSeleccionado] = useState<string | null>(null);

  const nodo = NODOS_METILACION.find((n) => n.id === nodoSeleccionado);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>🔄 Ciclo de Metilación</h2>
      <p className={styles.sectionDesc}>
        La B12 es cofactor esencial para regenerar metionina desde homocisteína.
        Sin B12, el ciclo se interrumpe y la homocisteína se acumula — un marcador de riesgo cardiovascular y cognitivo.
        Haz clic en cada nodo para más información.
      </p>

      <div className={styles.methylCycle}>
        {NODOS_METILACION.map((n) => (
          <button
            key={n.id}
            className={`${styles.methylNode} ${nodoSeleccionado === n.id ? styles.methylNodeActive : ''}`}
            style={{ borderColor: n.color }}
            onClick={() => setNodoSeleccionado(nodoSeleccionado === n.id ? null : n.id)}
            aria-pressed={nodoSeleccionado === n.id}
          >
            <span className={styles.methylAbrev} style={{ color: n.color }}>{n.abrev}</span>
            <span className={styles.methylNombre}>{n.nombre}</span>
          </button>
        ))}
      </div>

      {nodo && (
        <div className={styles.methylDetail} style={{ borderLeftColor: nodo.color }}>
          <strong style={{ color: nodo.color }}>{nodo.nombre}</strong>
          <p>{nodo.descripcion}</p>
        </div>
      )}

      <div className={styles.insightBox}>
        <strong>Clave diagnóstica:</strong> Si no hay suficiente B12, la homocisteína se acumula.
        Niveles &gt;15 µmol/L aumentan el riesgo cardiovascular y se asocian con deterioro cognitivo acelerado.
        El ácido metilmalónico (AMM) elevado es incluso más específico de deficiencia de B12.
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente: Sistema de Absorción
// ─────────────────────────────────────────────

function BloqueAbsorcion() {
  const [pasoActivo, setPasoActivo] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>🏭 Sistema de Absorción Especial</h2>
      <p className={styles.sectionDesc}>
        La B12 tiene el sistema de absorción más complejo de todas las vitaminas.
        Requiere ácido gástrico, Factor Intrínseco y un receptor intestinal específico.
        Haz clic en cada paso para ampliar la información.
      </p>

      <div className={styles.absorptionFlow}>
        {PASOS_ABSORCION.map((paso) => (
          <button
            key={paso.id}
            className={`${styles.absorptionStep} ${pasoActivo === paso.id ? styles.absorptionStepActive : ''}`}
            onClick={() => setPasoActivo(pasoActivo === paso.id ? null : paso.id)}
            aria-pressed={pasoActivo === paso.id}
          >
            <span className={styles.stepIcono} aria-hidden="true">{paso.icono}</span>
            <span className={styles.stepNum}>{paso.id}</span>
            <span className={styles.stepLugar}>{paso.lugar}</span>
            <span className={styles.stepTitulo}>{paso.titulo}</span>
          </button>
        ))}
      </div>

      {pasoActivo !== null && (() => {
        const paso = PASOS_ABSORCION.find((p) => p.id === pasoActivo);
        if (!paso) return null;
        return (
          <div className={styles.absorptionDetail}>
            <p>{paso.detalle}</p>
            {paso.alerta && (
              <div className={styles.alertBox} role="alert">
                ⚠️ {paso.alerta}
              </div>
            )}
          </div>
        );
      })()}

      <div className={styles.insightBox}>
        <strong>Por qué los veganos tardan años en deficitarse:</strong> El hígado almacena 2-5 mg de B12 (reserva
        para 3-5 años). Un vegano que no suplementa puede mantener niveles normales durante años antes de que
        aparezcan síntomas, lo que retrasa el diagnóstico.
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente: Grupos de Riesgo
// ─────────────────────────────────────────────

function BloqueGruposRiesgo() {
  const [expandido, setExpandido] = useState<string | null>(null);

  const colorSeveridad = (s: GrupoRiesgo['severidad']) => {
    if (s === 'alta') return '#E74C3C';
    if (s === 'media') return '#F39C12';
    return '#48A9A6';
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>⚠️ Grupos de Riesgo</h2>
      <p className={styles.sectionDesc}>
        Cinco situaciones donde la absorción o el aporte de B12 están comprometidos.
        Haz clic en cada tarjeta para ver el detalle clínico.
      </p>

      <div className={styles.riskCards}>
        {GRUPOS_RIESGO.map((grupo) => (
          <div
            key={grupo.id}
            className={`${styles.riskCard} ${expandido === grupo.id ? styles.riskCardExpanded : ''}`}
            style={{ borderTopColor: colorSeveridad(grupo.severidad) }}
          >
            <button
              className={styles.riskCardHeader}
              onClick={() => setExpandido(expandido === grupo.id ? null : grupo.id)}
              aria-expanded={expandido === grupo.id}
            >
              <span className={styles.riskIcono} aria-hidden="true">{grupo.icono}</span>
              <span className={styles.riskTitulo}>{grupo.titulo}</span>
              <span
                className={styles.riskBadge}
                style={{ background: colorSeveridad(grupo.severidad) }}
              >
                {grupo.severidad.toUpperCase()}
              </span>
              <span className={styles.riskChevron} aria-hidden="true">
                {expandido === grupo.id ? '▲' : '▼'}
              </span>
            </button>
            <p className={styles.riskDesc}>{grupo.descripcion}</p>
            {expandido === grupo.id && (
              <div className={styles.riskDetalle}>
                <p>{grupo.detalle}</p>
                <div className={styles.prevalenciaBox}>
                  <strong>Prevalencia:</strong> {grupo.prevalencia}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente: Síntomas por nivel
// ─────────────────────────────────────────────

function BloqueSintomas() {
  const [trackActivo, setTrackActivo] = useState<'hematologico' | 'neurologico'>('hematologico');

  const track = TRACKS_SINTOMAS.find((t) => t.tipo === trackActivo);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>🩺 Síntomas por Nivel de Deficiencia</h2>
      <p className={styles.sectionDesc}>
        La deficiencia de B12 avanza en dos tracks paralelos: hematológico y neurológico.
        Lo más importante: los síntomas neurológicos pueden aparecer <strong>sin anemia previa</strong>.
      </p>

      <div className={styles.trackSelector}>
        <button
          className={`${styles.trackBtn} ${trackActivo === 'hematologico' ? styles.trackBtnActive : ''}`}
          onClick={() => setTrackActivo('hematologico')}
          aria-pressed={trackActivo === 'hematologico'}
        >
          🔴 Track Hematológico
        </button>
        <button
          className={`${styles.trackBtn} ${trackActivo === 'neurologico' ? styles.trackBtnActive : ''}`}
          onClick={() => setTrackActivo('neurologico')}
          aria-pressed={trackActivo === 'neurologico'}
        >
          🧠 Track Neurológico
        </button>
      </div>

      {track && (
        <div className={styles.symptomsTimeline}>
          {track.etapas.map((etapa, idx) => (
            <div key={idx} className={`${styles.timelineStep} ${etapa.alerta ? styles.timelineStepAlerta : ''}`}>
              <div className={styles.timelineNum} aria-hidden="true">{idx + 1}</div>
              <div className={styles.timelineContent}>
                <strong className={styles.timelineLabel}>{etapa.label}</strong>
                <p className={styles.timelineDesc}>{etapa.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`${styles.warningBox}`} role="alert">
        <strong>⚠️ Reversibilidad:</strong> Los síntomas hematológicos mejoran rápidamente con tratamiento.
        Los daños neurológicos pueden ser <strong>permanentes</strong> si la deficiencia persiste más de 6-12 meses
        antes del diagnóstico. El diagnóstico precoz es fundamental.
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────

export default function VisualizadorVitaminaB12Page() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>🔴 Vitamina B12</span>
          <h1 className={styles.heroTitle}>Vitamina B12: El Nutriente con Absorción Especial</h1>
          <p className={styles.heroSubtitle}>
            Ciclo de metilación, factor intrínseco y por qué veganos y mayores de 50 son los más vulnerables
          </p>
        </div>
      </header>

      <LegalNotice />

      <BloqueCicloMetilacion />
      <BloqueAbsorcion />
      <BloqueGruposRiesgo />
      <BloqueSintomas />

      <div className={styles.sectionWrapper}>
        <DisclaimerCard variant="medical" severity="low" collapsible={true} />
      </div>

      <EducationalSection
        title="¿Por qué la B12 es tan especial?"
        subtitle="Bioquímica, fuentes, análisis y formas activas"
      >
        <div className={styles.eduContent}>
          <h3 className={styles.eduTitle}>Por qué no hay B12 en plantas</h3>
          <p className={styles.eduText}>
            La vitamina B12 (cobalamina) es sintetizada exclusivamente por bacterias y arqueas.
            Los animales obtienen B12 al comer bacterias del suelo o mediante bacterias en su tracto digestivo.
            Las plantas simplemente no tienen los genes para sintetizarla.
            Las algas y la espirulina contienen pseudovitamina B12 (análogos inactivos) que incluso pueden
            interferir con la absorción de la B12 real al competir por los mismos receptores.
          </p>

          <h3 className={styles.eduTitle}>Formas activas de B12</h3>
          <p className={styles.eduText}>
            La <strong>cianocobalamina</strong> es la forma más estable y barata usada en suplementos.
            El cuerpo la convierte en las formas activas: <strong>metilcobalamina</strong> (activa en el
            citoplasma, necesaria para el ciclo de metilación) y <strong>adenosilcobalamina</strong> (activa
            en las mitocondrias, necesaria para el metabolismo del ácido metilmalónico).
            Algunas personas con polimorfismos en MTHFR prefieren metilcobalamina directamente.
          </p>

          <h3 className={styles.eduTitle}>Análisis de sangre: qué pedir</h3>
          <p className={styles.eduText}>
            La <strong>B12 sérica</strong> estándar tiene limitaciones: mide tanto formas activas como inactivas
            (haptocorrinas). Es posible tener B12 total &quot;normal&quot; pero deficiencia funcional.
            Los marcadores más sensibles son:
          </p>
          <ul className={styles.eduList}>
            <li><strong>Ácido metilmalónico (AMM):</strong> elevado en deficiencia de B12 (valor normal: &lt;0,4 µmol/L)</li>
            <li><strong>Homocisteína:</strong> elevada en deficiencia de B12 y/o folato</li>
            <li><strong>Holotranscobalamina (HoloTC):</strong> fracción activa de B12, el marcador más precoz</li>
          </ul>

          <h3 className={styles.eduTitle}>Fuentes alimentarias (µg por 100g o por unidad)</h3>
          <div className={styles.fuentesGrid}>
            {[
              { alimento: 'Hígado de ternera', valor: '70 µg/100g', nivel: 100 },
              { alimento: 'Mejillones cocidos', valor: '20 µg/100g', nivel: 29 },
              { alimento: 'Sardinas en lata', valor: '8,9 µg/100g', nivel: 13 },
              { alimento: 'Atún fresco', valor: '3,0 µg/100g', nivel: 4 },
              { alimento: 'Salmón ahumado', valor: '2,8 µg/100g', nivel: 4 },
              { alimento: 'Huevo (1 unidad)', valor: '1,1 µg/unidad', nivel: 2 },
              { alimento: 'Leche entera (200ml)', valor: '0,9 µg/200ml', nivel: 1 },
              { alimento: 'Queso gouda (30g)', valor: '0,4 µg/30g', nivel: 1 },
            ].map((f) => (
              <div key={f.alimento} className={styles.fuenteRow}>
                <span className={styles.fuenteNombre}>{f.alimento}</span>
                <div className={styles.fuenteBar}>
                  <div
                    className={styles.fuenteBarFill}
                    style={{ width: `${f.nivel}%` }}
                    aria-label={`${f.nivel}% del máximo`}
                  />
                </div>
                <span className={styles.fuenteValor}>{f.valor}</span>
              </div>
            ))}
          </div>
          <p className={styles.eduText} style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
            Ingesta diaria recomendada (adultos): 2,4 µg/día. Embarazo: 2,6 µg/día. Lactancia: 2,8 µg/día.
          </p>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-vitamina-b12')} />
      <ShareCard appName="visualizador-vitamina-b12" />
      <Footer appName="visualizador-vitamina-b12" />
    </div>
  );
}
