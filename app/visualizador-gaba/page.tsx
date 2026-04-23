'use client';

import { useState } from 'react';
import styles from './VisualizadorGaba.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

interface ModuladorAlosterico {
  icono: string;
  titulo: string;
  subtitulo: string;
  mecanismo: string;
  efecto: string;
  riesgo: string;
}

const MODULADORES_ALOSTERICOS: ModuladorAlosterico[] = [
  {
    icono: '💊',
    titulo: 'Benzodiazepinas',
    subtitulo: 'diazepam, lorazepam, alprazolam',
    mecanismo:
      'Se unen al sitio de unión BDZ entre la subunidad α y γ del GABA-A → aumentan la frecuencia de apertura del canal Cl⁻ (no activan el canal por sí solas, necesitan GABA presente).',
    efecto: 'Ansiolítico, sedante, anticonvulsivante, relajante muscular.',
    riesgo:
      'Tolerancia (el receptor se desensibiliza), dependencia física, síndrome de abstinencia grave.',
  },
  {
    icono: '💊',
    titulo: 'Barbitúricos',
    subtitulo: 'fenobarbital, pentobarbital',
    mecanismo:
      'Se unen a un sitio diferente del GABA-A → aumentan la duración de apertura del canal (a diferencia de las BDZ que aumentan la frecuencia).',
    efecto: 'Sedante, anticonvulsivante, anestésico a dosis altas.',
    riesgo:
      'Más peligrosos que las BDZ: pueden activar el canal incluso sin GABA → mayor depresión del SNC → margen terapéutico estrecho.',
  },
  {
    icono: '🍺',
    titulo: 'Alcohol (etanol)',
    subtitulo: 'bebidas alcohólicas',
    mecanismo:
      'Potencia la función del GABA-A (sitio de unión propio) → sedación, ansiolísis, desinhibición conductual.',
    efecto: 'Sedación, euforia inicial, desinhibición, relajación muscular.',
    riesgo:
      'La abstinencia en alcohólicos crónicos es potencialmente mortal: el SNC hiperexcitado al retirar el alcohol → convulsiones, delirium tremens.',
  },
  {
    icono: '💉',
    titulo: 'Anestésicos generales',
    subtitulo: 'propofol, etomidato',
    mecanismo:
      'Potencian GABA-A a concentraciones bajas; a concentraciones anestésicas también pueden activar el canal directamente.',
    efecto: 'Pérdida de consciencia, sedación quirúrgica.',
    riesgo: 'Depresión respiratoria a dosis elevadas. Solo uso hospitalario con monitorización.',
  },
  {
    icono: '🧪',
    titulo: 'Neuroesteroides',
    subtitulo: 'alopregnanolona, brexanolona',
    mecanismo:
      'Metabolitos de la progesterona producidos en el cerebro → modulan GABA-A → efecto sedante/ansiolítico natural.',
    efecto:
      'Sedante, ansiolítico. Brexanolona: primer fármaco aprobado para depresión postparto.',
    riesgo:
      'Fluctúan con el ciclo menstrual → papel en el TDPM (trastorno disfórico premenstrual).',
  },
];

interface CondicionRelacionada {
  icono: string;
  nombre: string;
  descripcion: string;
}

const CONDICIONES: CondicionRelacionada[] = [
  {
    icono: '😰',
    nombre: 'Ansiedad generalizada',
    descripcion:
      'Hiperactividad amigdalar con déficit relativo GABAérgico → las BDZ son efectivas a corto plazo pero crean tolerancia. El tratamiento crónico requiere otras estrategias.',
  },
  {
    icono: '⚡',
    nombre: 'Epilepsia',
    descripcion:
      'Desequilibrio GABA/glutamato → los antiepilépticos (valproato, gabapentina, vigabatrina) actúan aumentando el tono GABAérgico o reduciendo la excitación glutamatérgica.',
  },
  {
    icono: '😴',
    nombre: 'Insomnio',
    descripcion:
      'Las benzodiacepinas y las "Z-drugs" (zolpidem) actúan sobre GABA-A pero alteran la arquitectura del sueño (reducen REM), limitando su uso a corto plazo.',
  },
  {
    icono: '🍺',
    nombre: 'Abstinencia alcohólica',
    descripcion:
      'Al retirar el alcohol, el sistema GABA disminuye abruptamente → excitotoxicidad → convulsiones. Se trata con BDZ de vida larga (diazepam) para retirada gradual.',
  },
];

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function BalanzaGabaGlutamato() {
  return (
    <div aria-label="Visualización del equilibrio GABA-Glutamato">
      {/* Fila de los dos lados + fulcro central */}
      <div className={styles.balanzaFilaLados}>
        <div className={`${styles.balanzaLado} ${styles.balanzaExcitatorio}`}>
          <div className={styles.balanzaHeader}>
            <span className={styles.balanzaIcono} aria-hidden="true">⚡</span>
            <h3 className={styles.balanzaNombre}>Glutamato</h3>
            <span className={styles.balanzaTipo}>Excitatorio</span>
          </div>
          <ul className={styles.balanzaLista}>
            <li>Activa las neuronas</li>
            <li>Facilita transmisión sináptica</li>
            <li>Esencial para LTP (aprendizaje)</li>
            <li>Receptores AMPA, NMDA, kainato</li>
          </ul>
          <div className={styles.balanzaDato}>
            Neurotransmisor excitatorio más abundante del cerebro
          </div>
        </div>

        <div className={styles.balanzaCentro} aria-hidden="true">
          <div className={styles.balanzaViga}></div>
          <div className={styles.balanzaFulcro}>⚖️</div>
        </div>

        <div className={`${styles.balanzaLado} ${styles.balanzaInhibidor}`}>
          <div className={styles.balanzaHeader}>
            <span className={styles.balanzaIcono} aria-hidden="true">🛑</span>
            <h3 className={styles.balanzaNombre}>GABA</h3>
            <span className={styles.balanzaTipoInhibidor}>Inhibidor</span>
          </div>
          <ul className={styles.balanzaLista}>
            <li>Hiperpolariza la membrana neuronal</li>
            <li>Dificulta el disparo neuronal</li>
            <li>Freno de seguridad del sistema</li>
            <li>Receptores GABA-A y GABA-B</li>
          </ul>
          <div className={styles.balanzaDato}>
            ~30% de todas las sinapsis del cerebro
          </div>
        </div>
      </div>

      {/* Consecuencias del desequilibrio */}
      <div className={styles.desequilibrioGrid} role="note">
        <div className={styles.desequilibrioItem}>
          <span className={styles.desequilibrioIcono} aria-hidden="true">🔺</span>
          <strong>Demasiado Glutamato / poco GABA</strong>
          <p>Epilepsia, excitotoxicidad, convulsiones</p>
        </div>
        <div className={`${styles.desequilibrioItem} ${styles.desequilibrioOk}`}>
          <span className={styles.desequilibrioIcono} aria-hidden="true">⚖️</span>
          <strong>Equilibrio normal</strong>
          <p>Función neuronal sana, aprendizaje y control</p>
        </div>
        <div className={styles.desequilibrioItem}>
          <span className={styles.desequilibrioIcono} aria-hidden="true">🔻</span>
          <strong>Demasiado GABA / poco Glutamato</strong>
          <p>Sedación excesiva, depresión del SNC, coma (sobredosis)</p>
        </div>
      </div>
    </div>
  );
}

function ReceptoresGabaCard() {
  return (
    <div className={styles.receptoresGrid}>
      {/* GABA-A */}
      <div className={styles.receptorCard}>
        <div className={styles.receptorHeader}>
          <span className={styles.receptorBadge} style={{ background: 'rgba(46,134,171,0.12)', color: '#2E86AB' }}>
            GABA-A
          </span>
          <span className={styles.receptorTipo}>Ionotrópico</span>
        </div>
        <div className={styles.receptorDiagrama} aria-hidden="true">
          <div className={styles.diagCanal}>
            <div className={styles.diagSubunidades}>
              <span className={styles.diagSub}>α</span>
              <span className={styles.diagSub}>β</span>
              <span className={styles.diagSub}>γ</span>
              <span className={styles.diagSub}>α</span>
              <span className={styles.diagSub}>β</span>
            </div>
            <div className={styles.diagPoro}>
              <span className={styles.diagIon}>Cl⁻</span>
              <span className={styles.diagFlecha}>↓</span>
            </div>
          </div>
        </div>
        <div className={styles.receptorDetalle}>
          <p>
            Canal de <strong>Cl⁻</strong> ligando-dependiente: cuando el GABA se une, el canal se abre
            y entra Cl⁻ → la célula se hiperpolariza → <strong>inhibición rápida</strong>.
          </p>
          <p className={styles.receptorVelocidad}>Efecto: <strong>milisegundos</strong></p>
          <p>
            Tiene sitios alostéricos donde actúan: benzodiazepinas, barbitúricos, alcohol, anestésicos,
            neuroesteroides.
          </p>
        </div>
      </div>

      {/* GABA-B */}
      <div className={styles.receptorCard}>
        <div className={styles.receptorHeader}>
          <span className={styles.receptorBadge} style={{ background: 'rgba(72,169,166,0.12)', color: '#48A9A6' }}>
            GABA-B
          </span>
          <span className={styles.receptorTipo}>Metabotrópico (GPCR)</span>
        </div>
        <div className={styles.receptorDiagrama} aria-hidden="true">
          <div className={styles.diagGpcr}>
            <div className={styles.diagReceptorGpcr}>GPCR</div>
            <div className={styles.diagProteinaG}>→ Proteína G</div>
            <div className={styles.diagEfectores}>
              <span className={styles.diagEfector}>K⁺ ↑</span>
              <span className={styles.diagEfector}>Ca²⁺ ↓</span>
            </div>
          </div>
        </div>
        <div className={styles.receptorDetalle}>
          <p>
            Acoplado a proteína G → activa canales de <strong>K⁺</strong> (hiperpolarización) e inhibe
            canales de <strong>Ca²⁺</strong> (reduce liberación de neurotransmisores).
          </p>
          <p className={styles.receptorVelocidad}>Efecto: <strong>segundos, más duradero</strong></p>
          <p>
            Fármaco principal: <strong>baclofeno</strong> (relajante muscular, espasticidad).
          </p>
        </div>
      </div>
    </div>
  );
}

function ModuladoresSection() {
  const [abierto, setAbierto] = useState<number | null>(null);

  function toggleModulador(idx: number) {
    setAbierto((prev) => (prev === idx ? null : idx));
  }

  return (
    <div className={styles.moduladoresGrid}>
      {MODULADORES_ALOSTERICOS.map((mod, idx) => (
        <div key={mod.titulo} className={styles.moduladorItem}>
          <button
            className={`${styles.moduladorBtn} ${abierto === idx ? styles.moduladorBtnActivo : ''}`}
            onClick={() => toggleModulador(idx)}
            aria-expanded={abierto === idx}
            aria-controls={`modulador-detalle-${idx}`}
          >
            <span className={styles.moduladorBtnIcono} aria-hidden="true">{mod.icono}</span>
            <div className={styles.moduladorBtnTexto}>
              <strong className={styles.moduladorBtnTitulo}>{mod.titulo}</strong>
              <span className={styles.moduladorBtnSub}>{mod.subtitulo}</span>
            </div>
            <span className={styles.moduladorBtnChevron} aria-hidden="true">
              {abierto === idx ? '▲' : '▼'}
            </span>
          </button>

          {abierto === idx && (
            <div
              id={`modulador-detalle-${idx}`}
              className={styles.moduladorDetalle}
              role="region"
            >
              <div className={styles.moduladorDetalleBloque}>
                <span className={styles.moduladorDetalleLabel}>Mecanismo</span>
                <p>{mod.mecanismo}</p>
              </div>
              <div className={styles.moduladorDetalleBloque}>
                <span className={styles.moduladorDetalleLabel}>Efectos</span>
                <p>{mod.efecto}</p>
              </div>
              <div className={`${styles.moduladorDetalleBloque} ${styles.moduladorDetalleRiesgo}`}>
                <span className={styles.moduladorDetalleLabel}>Consideraciones</span>
                <p>{mod.riesgo}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorGaba() {
  const relacionadas = getRelatedApps('visualizador-gaba');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>NEUROCIENCIA</span>
          <h1 className={styles.heroTitle}>GABA: El Gran Freno del Sistema Nervioso</h1>
          <p className={styles.heroSubtitle}>
            Sin GABA, el cerebro entraría en convulsiones en segundos
          </p>
          <p className={styles.heroDesc}>
            El GABA (ácido gamma-aminobutírico) es el principal neurotransmisor inhibidor del cerebro.
            Equilibra la excitación neuronal, regula la ansiedad y es la diana de las benzodiazepinas,
            el alcohol y los anestésicos.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* ── SECCIÓN 1: GABA vs Glutamato ── */}
      <section className={styles.section} aria-labelledby="titulo-balanza">
        <h2 id="titulo-balanza" className={styles.sectionTitle}>
          GABA vs Glutamato: El Equilibrio Fundamental
        </h2>
        <p className={styles.sectionDesc}>
          El cerebro equilibra constantemente la excitación y la inhibición. Sin este balance,
          las neuronas o no se activarían nunca, o no pararían de disparar.
        </p>
        <BalanzaGabaGlutamato />
      </section>

      {/* ── SECCIÓN 2: GABA-A vs GABA-B ── */}
      <section className={styles.section} aria-labelledby="titulo-receptores">
        <h2 id="titulo-receptores" className={styles.sectionTitle}>
          GABA-A vs GABA-B: Dos Receptores, Dos Mecanismos
        </h2>
        <p className={styles.sectionDesc}>
          El GABA actúa a través de dos familias de receptores con mecanismos moleculares completamente
          distintos, velocidades de acción diferentes y dianas farmacológicas propias.
        </p>
        <ReceptoresGabaCard />
      </section>

      {/* ── SECCIÓN 3: Moduladores Alostéricos ── */}
      <section className={styles.section} aria-labelledby="titulo-moduladores">
        <h2 id="titulo-moduladores" className={styles.sectionTitle}>
          Los Moduladores Alostéricos: Qué Actúa Sobre GABA-A
        </h2>
        <p className={styles.sectionDesc}>
          El receptor GABA-A es la diana de algunos de los fármacos y sustancias más usadas del mundo.
          Todos comparten el mecanismo de potenciar la inhibición GABAérgica, pero lo hacen en sitios
          diferentes y con consecuencias clínicas distintas.
        </p>
        <ModuladoresSection />
      </section>

      {/* ── SECCIÓN 4: Condiciones Relacionadas ── */}
      <section className={styles.section} aria-labelledby="titulo-condiciones">
        <h2 id="titulo-condiciones" className={styles.sectionTitle}>
          Equilibrio GABA en la Práctica: Condiciones Relacionadas
        </h2>
        <p className={styles.sectionDesc}>
          Las alteraciones del sistema GABAérgico se manifiestan en condiciones clínicas frecuentes.
          Esta sección describe los mecanismos, sin orientar sobre diagnóstico ni tratamiento.
        </p>
        <div className={styles.condicionesGrid}>
          {CONDICIONES.map((cond) => (
            <div key={cond.nombre} className={styles.condicionCard}>
              <span className={styles.condicionIcono} aria-hidden="true">{cond.icono}</span>
              <h3 className={styles.condicionNombre}>{cond.nombre}</h3>
              <p className={styles.condicionDescripcion}>{cond.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <div className={styles.section}>
        <DisclaimerCard variant="medical" severity="low" collapsible={true} />
      </div>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Profundiza en la neuroquímica del GABA"
        subtitle="Receptores, plasticidad sináptica e implicaciones clínicas"
      >
        <h3>GABA en el desarrollo: de excitatorio a inhibidor</h3>
        <p>
          En fetos y recién nacidos, el GABA es paradójicamente <strong>excitatorio</strong>. La razón:
          la concentración intracelular de Cl⁻ es alta en las neuronas inmaduras (por la expresión de
          NKCC1, un cotransportador que introduce Cl⁻). Cuando el canal GABA-A se abre, el Cl⁻ sale
          (en lugar de entrar), despolarizando la célula. Durante el desarrollo postnatal, el cotransportador
          KCC2 se expresa gradualmente, expulsa el Cl⁻ intracelular, y el GABA pasa a ser inhibidor.
        </p>

        <h3>La paradoja del GABA en el autismo</h3>
        <p>
          Algunos investigadores proponen que en el trastorno del espectro autista (TEA) el GABA mantiene
          propiedades excitatorias en determinadas zonas del cerebro, debido a niveles alterados de KCC2
          y NKCC1 en ciertas regiones corticales. Esta hipótesis explicaría parte de la hiperexcitabilidad
          y la mayor prevalencia de epilepsia en el TEA. La investigación continúa activa.
        </p>

        <h3>Gabapentina y pregabalina: ¿análogos del GABA que no actúan sobre GABA?</h3>
        <p>
          Aunque su nombre sugiere lo contrario, la gabapentina y la pregabalina <strong>no actúan
          directamente sobre receptores GABA-A ni GABA-B</strong>. Su diana real son las subunidades
          α2δ de canales de Ca²⁺ voltaje-dependientes → reducen la liberación de glutamato y otros
          neurotransmisores excitatorios. Se usan como antiepilépticos, en dolor neuropático y ansiedad
          generalizada, pero a través de un mecanismo diferente al del GABA clásico.
        </p>

        <h3>Meditación y ejercicio aumentan el GABA</h3>
        <p>
          Estudios de neuroimagen funcional (MRS — espectroscopía por resonancia magnética) muestran
          que la práctica regular de <strong>yoga/meditación</strong> y el <strong>ejercicio aeróbico</strong>
          aumentan los niveles de GABA en el córtex occipital y otras regiones. Este efecto podría
          explicar parcialmente la reducción de ansiedad asociada a estas prácticas. La magnitud del
          efecto es modesta y los estudios tienen limitaciones metodológicas, pero la dirección es consistente.
        </p>

        <div className={styles.warningBox} role="note">
          <strong>Nota educativa:</strong> Este visualizador explica mecanismos neurofisiológicos con
          fines educativos. El manejo de la ansiedad, epilepsia o dependencia a benzodiacepinas requiere
          atención médica especializada. No inicies, modifiques ni abandones ningún tratamiento basándote
          en contenido educativo.
        </div>
      </EducationalSection>

      <RelatedApps apps={relacionadas} />
      <ShareCard appName="visualizador-gaba" />
      <Footer appName="visualizador-gaba" />
    </div>
  );
}
