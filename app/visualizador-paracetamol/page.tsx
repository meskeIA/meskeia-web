'use client';

import { useState } from 'react';
import styles from './VisualizadorParacetamol.module.css';
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

interface HipotesisMecanismo {
  numero: number;
  titulo: string;
  descripcion: string;
}

interface PasoMetabolismo {
  id: number;
  nombre: string;
  porcentaje?: string;
  descripcion: string;
  tipo: 'normal' | 'napqi' | 'antidoto';
}

interface PerfilPoblacion {
  icono: string;
  titulo: string;
  descripcion: string;
}

interface HitoTimeline {
  tiempo: string;
  descripcion: string;
  alerta: boolean;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const HIPOTESIS: HipotesisMecanismo[] = [
  {
    numero: 1,
    titulo: '¿Por qué es tan difícil de explicar?',
    descripcion:
      'El paracetamol lleva 70 años en uso masivo y aún no hay consenso científico completo sobre su mecanismo exacto. Es uno de los fármacos más usados cuya acción molecular permanece parcialmente desconocida.',
  },
  {
    numero: 2,
    titulo: 'Hipótesis principal: vías descendentes',
    descripcion:
      'Activa las vías descendentes serotoninérgicas e inhibidoras del dolor en el SNC. El paracetamol potencia la señalización que baja desde el cerebro para suprimir el dolor antes de que llegue a la consciencia.',
  },
  {
    numero: 3,
    titulo: 'COX-3 central (débil)',
    descripcion:
      'Inhibe débilmente una variante de la cicloxigenasa (COX-3) presente principalmente en el cerebro y médula espinal. A diferencia de ibuprofeno y aspirina, no inhibe la COX periférica de forma relevante → no reduce inflamación en tejidos.',
  },
  {
    numero: 4,
    titulo: 'Sistema endocannabinoide',
    descripcion:
      'Parte de su efecto analgésico puede estar mediado por el sistema endocannabinoide a través de metabolitos activos (AM404). Inhibe la recaptación de anandamida (el mismo neurotransmisor que el "runner\'s high").',
  },
];

const PASOS_METABOLISMO: PasoMetabolismo[] = [
  {
    id: 1,
    nombre: 'Absorción',
    descripcion:
      'Intestino delgado → sangre → hígado (primer paso hepático)',
    tipo: 'normal',
  },
  {
    id: 2,
    nombre: 'Glucuronidación',
    porcentaje: '60%',
    descripcion:
      'Ruta principal segura → paracetamol-glucurónido → excreción renal',
    tipo: 'normal',
  },
  {
    id: 3,
    nombre: 'Sulfatación',
    porcentaje: '30%',
    descripcion:
      'Segunda ruta segura → paracetamol-sulfato → excreción renal',
    tipo: 'normal',
  },
  {
    id: 4,
    nombre: 'CYP2E1 → NAPQI',
    porcentaje: '10%',
    descripcion:
      'Ruta minoritaria → N-acetil-p-benzoquinonimina (NAPQI) — METABOLITO TÓXICO',
    tipo: 'napqi',
  },
  {
    id: 5,
    nombre: 'Neutralización por Glutatión',
    descripcion:
      'NAPQI + glutatión → metabolito no tóxico → excreción. Si el glutatión se agota: necrosis hepática.',
    tipo: 'antidoto',
  },
];

const PERFILES: PerfilPoblacion[] = [
  {
    icono: '👶',
    titulo: 'Niños',
    descripcion:
      'Dosis por peso (15 mg/kg), formulaciones pediátricas, primera opción en fiebre e infecciones víricas donde los AINEs tienen restricciones.',
  },
  {
    icono: '🤰',
    titulo: 'Embarazo',
    descripcion:
      'Analgésico de primera elección en todos los trimestres. Nuevos estudios sugieren cautela en uso prolongado, pero el consenso médico lo mantiene como el más seguro disponible.',
  },
  {
    icono: '🍺',
    titulo: 'Consumidores de alcohol',
    descripcion:
      'El alcohol induce CYP2E1 y depleta el glutatión → reducir a 2 g/día máximo o evitar. No es un mito: el riesgo hepático es real a dosis menores.',
  },
  {
    icono: '👴',
    titulo: 'Personas mayores',
    descripcion:
      'Metabolismo más lento, posible menor función hepática y renal → cautela con dosis altas prolongadas. Primera opción para dolor crónico frente a AINEs (menor riesgo GI y cardiovascular).',
  },
  {
    icono: '💊',
    titulo: 'Uso combinado',
    descripcion:
      'Con codeína, tramadol o antihistamínicos (muchos contienen paracetamol): siempre sumar el paracetamol de todos los componentes para no superar los 4 g/día.',
  },
];

const TIMELINE_DANO: HitoTimeline[] = [
  {
    tiempo: '0–24 h',
    descripcion: 'Náuseas, vómitos, malestar general. Síntomas inespecíficos que pueden confundir.',
    alerta: false,
  },
  {
    tiempo: '24–72 h',
    descripcion: 'Inicio del daño hepático. Elevación de transaminasas (ALT/AST). El paciente puede sentirse mejor engañosamente.',
    alerta: true,
  },
  {
    tiempo: '72–96 h',
    descripcion: 'Pico de daño hepático. Riesgo de fallo hepático agudo, encefalopatía, coagulopatía.',
    alerta: true,
  },
  {
    tiempo: '4–14 días',
    descripcion: 'Recuperación progresiva si se trató a tiempo. O deterioro progresivo sin tratamiento: trasplante o muerte.',
    alerta: false,
  },
];

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function SliderPeso() {
  const [peso, setPeso] = useState(70);
  const dosisOrientativa = Math.round(peso * 15);
  const dosisMaxima = 4000;
  const margenHasta = dosisMaxima - dosisOrientativa;
  const porcentajeUso = Math.min(100, Math.round((dosisOrientativa / dosisMaxima) * 100));

  return (
    <div className={styles.sliderWrapper}>
      <p className={styles.sliderAviso}>
        <strong>Solo con fines educativos</strong> — ilustra el principio farmacológico de dosificación por peso. La dosis real la indica siempre el médico, farmacéutico o el prospecto.
      </p>
      <label htmlFor="slider-peso" className={styles.sliderLabel}>
        Peso corporal: <strong>{peso} kg</strong>
      </label>
      <input
        id="slider-peso"
        type="range"
        min={20}
        max={100}
        step={1}
        value={peso}
        onChange={(e) => setPeso(Number(e.target.value))}
        className={styles.sliderInput}
        aria-label={`Peso corporal: ${peso} kilogramos`}
      />
      <div className={styles.sliderResult}>
        <div className={styles.sliderDato}>
          <span className={styles.sliderDatoNum}>{dosisOrientativa.toLocaleString('es-ES')} mg</span>
          <span className={styles.sliderDatoLabel}>Dosis única orientativa (15 mg/kg)</span>
        </div>
        <div className={styles.sliderDato}>
          <span className={styles.sliderDatoNum}>{dosisMaxima.toLocaleString('es-ES')} mg</span>
          <span className={styles.sliderDatoLabel}>Límite diario máximo (adultos)</span>
        </div>
        <div className={styles.sliderDato}>
          <span className={`${styles.sliderDatoNum} ${margenHasta < 1000 ? styles.margenAlerta : ''}`}>
            {margenHasta.toLocaleString('es-ES')} mg
          </span>
          <span className={styles.sliderDatoLabel}>Margen hasta el límite diario</span>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className={styles.barraProgreso} role="presentation" aria-hidden="true">
        <div
          className={styles.barraRelleno}
          style={{ width: `${porcentajeUso}%` }}
        />
        <span className={styles.barraPorcentaje}>{porcentajeUso}% del límite diario</span>
      </div>

      <p className={styles.sliderNota}>
        Esta dosis orientativa equivale a 1 toma. El límite de 4 g/día es la suma de TODAS las tomas
        y de TODOS los medicamentos con paracetamol tomados ese día.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorParacetamol() {
  const relacionadas = getRelatedApps('visualizador-paracetamol');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>FARMACOLOGÍA</span>
          <h1 className={styles.heroTitle}>
            Paracetamol: El Analgésico que Actúa en el Cerebro
          </h1>
          <p className={styles.heroSubtitle}>Seguro para el estómago, exigente con el hígado</p>
          <p className={styles.heroDesc}>
            El paracetamol es el analgésico más consumido del mundo. A diferencia del ibuprofeno
            y la aspirina, actúa principalmente en el sistema nervioso central y no reduce la
            inflamación. Su mayor riesgo no está en el estómago sino en el hígado: el metabolito NAPQI.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="low" collapsible={true} />

      {/* ── SECCIÓN 1: Mecanismo ── */}
      <section className={styles.section} aria-labelledby="titulo-mecanismo">
        <h2 id="titulo-mecanismo" className={styles.sectionTitle}>
          El Mecanismo — Lo que Sabemos y Lo que No
        </h2>
        <p className={styles.sectionDesc}>
          El paracetamol es un caso fascinante en farmacología: lleva décadas siendo el analgésico
          más consumido del mundo y aún no hay consenso científico completo sobre por qué funciona.
        </p>

        <div className={styles.mecanismoGrid}>
          {HIPOTESIS.map((h) => (
            <div key={h.numero} className={styles.mecanismoCard}>
              <span className={styles.mecanismoNumero} aria-hidden="true">
                {h.numero}
              </span>
              <h3 className={styles.mecanismoCardTitle}>{h.titulo}</h3>
              <p className={styles.mecanismoCardDesc}>{h.descripcion}</p>
            </div>
          ))}
        </div>

        <div className={styles.insightBox} role="note">
          <strong>Clave:</strong> Actúa en el cerebro, no en el foco del dolor. Por eso alivia
          el dolor y la fiebre, pero no la inflamación. Es una ventaja (sin efectos gástricos
          periféricos) y una limitación (no sirve para lesiones con inflamación activa).
        </div>
      </section>

      {/* ── SECCIÓN 2: Metabolismo ── */}
      <section className={styles.section} aria-labelledby="titulo-metabolismo">
        <h2 id="titulo-metabolismo" className={styles.sectionTitle}>
          El Metabolismo — La Ruta del NAPQI
        </h2>
        <p className={styles.sectionDesc}>
          Lo que le ocurre al paracetamol en el hígado determina si es seguro o tóxico.
          El 90% va por rutas seguras. El 10% restante crea el NAPQI.
        </p>

        <div className={styles.metabolismoFlujo} aria-label="Diagrama de metabolismo del paracetamol">
          {PASOS_METABOLISMO.map((paso, i) => (
            <div key={paso.id}>
              <div
                className={`${styles.metabolismoPaso} ${
                  paso.tipo === 'napqi'
                    ? styles.metabolismoNAPQI
                    : paso.tipo === 'antidoto'
                    ? styles.metabolismoAntidoto
                    : ''
                }`}
              >
                <span className={styles.metabolismoNumero} aria-hidden="true">
                  {paso.id}
                </span>
                <div className={styles.metabolismoPasoInfo}>
                  <div className={styles.metabolismoPasoHeader}>
                    <strong className={styles.metabolismoPasoNombre}>{paso.nombre}</strong>
                    {paso.porcentaje && (
                      <span className={styles.metabolismoPorcentaje}>{paso.porcentaje}</span>
                    )}
                  </div>
                  <p className={styles.metabolismoPasoDesc}>{paso.descripcion}</p>
                </div>
              </div>
              {i < PASOS_METABOLISMO.length - 1 && (
                <div className={styles.metabolismoConector} aria-hidden="true">↓</div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.insightBox} role="note">
          <p>
            <strong>Con dosis terapéutica (máx. 4 g/día):</strong> el glutatión es suficiente
            para neutralizar el NAPQI generado.
          </p>
          <p>
            <strong>Con sobredosis (8–10+ g):</strong> se genera más NAPQI del que el glutatión
            puede neutralizar → se une covalentemente a proteínas hepáticas → necrosis
            centrolobulillar → fallo hepático agudo.
          </p>
          <p>
            <strong>Con alcohol crónico:</strong> el alcohol induce CYP2E1 (más NAPQI) y depleta
            el glutatión → toxicidad a dosis más bajas.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Antídoto:</strong> N-acetilcisteína (NAC) → precursora del glutatión →
            repone las reservas → neutraliza el NAPQI restante. Efectiva si se administra antes
            de 8–10 horas.
          </p>
        </div>
      </section>

      {/* ── SECCIÓN 3: Dosis y poblaciones ── */}
      <section className={styles.section} aria-labelledby="titulo-dosis">
        <h2 id="titulo-dosis" className={styles.sectionTitle}>
          Dosis y Poblaciones — El Principio de Dosificación por Peso
        </h2>
        <p className={styles.sectionDesc}>
          Mueve el slider para entender cómo varía la dosis orientativa según el peso corporal.
          Este visualizador es puramente educativo.
        </p>

        <SliderPeso />

        <div className={styles.perfilesGrid}>
          {PERFILES.map((perfil) => (
            <div key={perfil.titulo} className={styles.perfilCard}>
              <span className={styles.perfilIcono} aria-hidden="true">{perfil.icono}</span>
              <h3 className={styles.perfilTitulo}>{perfil.titulo}</h3>
              <p className={styles.perfilDesc}>{perfil.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN 4: Sobredosis ── */}
      <section className={styles.section} aria-labelledby="titulo-sobredosis">
        <h2 id="titulo-sobredosis" className={styles.sectionTitle}>
          La Sobredosis — El Riesgo Oculto de un Fármaco «Inocuo»
        </h2>
        <p className={styles.sectionDesc}>
          El paracetamol tiene una imagen de fármaco completamente seguro. En realidad, es la
          primera causa de fallo hepático agudo en Europa occidental y EE. UU.
        </p>

        <div className={styles.cifrasGrid}>
          <div className={styles.cifraBox}>
            <span className={styles.cifraNum}>1.ª causa</span>
            <span className={styles.cifraLabel}>de fallo hepático agudo en Europa occidental y EE. UU. (sobredosis accidental o intencional)</span>
          </div>
          <div className={styles.cifraBox}>
            <span className={styles.cifraNum}>8–10 h</span>
            <span className={styles.cifraLabel}>ventana crítica para que el antídoto NAC sea eficaz tras la ingesta</span>
          </div>
          <div className={styles.cifraBox}>
            <span className={styles.cifraNum}>&gt;100 mg/kg</span>
            <span className={styles.cifraLabel}>umbral aproximado de sobredosis en adultos sanos (equivale a ~10 comprimidos de 1 g)</span>
          </div>
        </div>

        <h3 className={styles.subTitle}>Evolución del daño hepático tras sobredosis</h3>
        <div className={styles.timelineDano} aria-label="Línea temporal del daño hepático">
          {TIMELINE_DANO.map((hito) => (
            <div
              key={hito.tiempo}
              className={`${styles.timelineHito} ${hito.alerta ? styles.timelineHitoAlerta : ''}`}
            >
              <span className={styles.timelineTiempo}>{hito.tiempo}</span>
              <p className={styles.timelineDesc}>{hito.descripcion}</p>
            </div>
          ))}
        </div>

        <div className={styles.insightBox} role="note">
          <strong>Sobredosis accidental:</strong> ocurre frecuentemente por tomar varios
          medicamentos que contienen paracetamol simultáneamente (antigripal + analgésico +
          jarabe). Muchos medicamentos de venta libre combinan paracetamol con otros principios
          activos. Siempre leer el prospecto completo y sumar el paracetamol total del día.
        </div>
      </section>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Profundiza en la farmacología del paracetamol"
        subtitle="Historia, metabolismo hepático y la paradoja del fármaco más seguro"
      >
        <h3>Historia: los precursores tóxicos y el fármaco ignorado</h3>
        <p>
          El paracetamol (acetaminofén) se conoce desde 1877, pero se ignoró durante décadas.
          Sus predecesores, la <strong>acetanilida</strong> (1886) y la <strong>fenacetina</strong> (1887),
          se usaron primero como analgésicos hasta que sus efectos tóxicos (metahemoglobinemia y
          nefropatía crónica respectivamente) los retiraron del mercado. El paracetamol se popularizó
          en los años 50 como alternativa más segura, aunque la fenacetina tardó décadas en prohibirse.
        </p>

        <h3>El escándalo del Tylenol de 1982</h3>
        <p>
          En Chicago, siete personas murieron por cápsulas de Tylenol (paracetamol) contaminadas
          con cianuro por un saboteador desconocido. El caso nunca se resolvió judicialmente, pero
          revolucionó el envasado de medicamentos en todo el mundo. Los blísteres de aluminio, los
          sellos de seguridad y los tapones a prueba de manipulación que hoy damos por sentados
          nacieron directamente de este incidente.
        </p>

        <h3>CYP2E1 y la variabilidad genética</h3>
        <p>
          La enzima CYP2E1 que genera el NAPQI varía entre personas por factores genéticos,
          edad, dieta y exposición a inductores (alcohol, isoniazida, ciertos disolventes).
          Los <em>metabolizadores rápidos</em> generan más NAPQI que la media con la misma dosis.
          Esta variabilidad individual hace que los umbrales de toxicidad no sean iguales para todos.
        </p>

        <h3>Por qué existe el paracetamol IV hospitalario</h3>
        <p>
          En cirugía y en la UCI, el paracetamol intravenoso permite analgesia postoperatoria sin
          riesgo gastrointestinal ni interferencia con la hemostasia (plaquetas). A diferencia de
          los AINEs, no aumenta el riesgo de sangrado. Se usa frecuentemente en combinación con
          opioides para reducir la dosis de estos y sus efectos secundarios (analgesia multimodal).
        </p>

        <div className={styles.warningBox} role="note">
          Este visualizador explica mecanismos bioquímicos con fines educativos. Respetar siempre
          la dosis indicada en el prospecto y consultar con tu farmacéutico ante cualquier duda,
          especialmente si tomas otros medicamentos que puedan contener paracetamol.
        </div>
      </EducationalSection>

      <RelatedApps apps={relacionadas} />
      <ShareCard appName="visualizador-paracetamol" />
      <Footer appName="visualizador-paracetamol" />
    </div>
  );
}
