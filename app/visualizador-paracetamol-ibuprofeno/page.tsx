'use client';
import { useState } from 'react';
import styles from './VisualizadorParacetamolIbuprofeno.module.css';
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

type Farmaco = 'paracetamol' | 'ibuprofeno';

interface PuntoMecanismo {
  icono: string;
  texto: string;
}

interface DatoFarmaco {
  nombre: string;
  nombreCientifico: string;
  color: string;
  colorLight: string;
  icono: string;
  mecanismo: string;
  lugar: string;
  esAntinflamatorio: boolean;
  puntos: PuntoMecanismo[];
  organoRiesgo: string;
  organoRiesgoDesc: string;
  limiteDosis: string;
  precaucion: string;
}

const FARMACOS: Record<Farmaco, DatoFarmaco> = {
  paracetamol: {
    nombre: 'Paracetamol',
    nombreCientifico: 'Acetaminofén / N-acetil-p-aminofenol',
    color: '#2E86AB',
    colorLight: '#e8f4f9',
    icono: '🧠',
    mecanismo:
      'Su mecanismo exacto no está completamente esclarecido, lo que refleja una honestidad científica importante. Las hipótesis principales apuntan a inhibición de COX-3 (una variante central de la ciclooxigenasa), modulación del sistema endocannabinoide descendente y potenciación de vías serotoninérgicas que inhiben el dolor.',
    lugar: 'Sistema Nervioso Central (hipotálamo y vías centrales)',
    esAntinflamatorio: false,
    puntos: [
      {
        icono: '🧠',
        texto:
          'Actúa principalmente en el SNC — en el hipotálamo para regular la fiebre y en las vías centrales del dolor.',
      },
      {
        icono: '❌',
        texto:
          'NO es antiinflamatorio en sentido clínico relevante — no inhibe las COX periféricas de forma significativa.',
      },
      {
        icono: '🔬',
        texto:
          'Metabolismo hepático: glucuronidación (60%), sulfatación (30%) y vía CYP2E1 (10%) generando NAPQI.',
      },
      {
        icono: '⚠️',
        texto:
          'El NAPQI es neutralizado por glutatión. En sobredosis o con alcohol, el glutatión se agota y se produce toxicidad hepática.',
      },
    ],
    organoRiesgo: 'Hígado',
    organoRiesgoDesc:
      'El metabolito NAPQI puede causar necrosis hepática en sobredosis. Es la causa más frecuente de fallo hepático agudo en países occidentales.',
    limiteDosis: '4 g/día en adultos sanos · 2 g/día con consumo regular de alcohol',
    precaucion: 'Nunca combinar con alcohol. Vigilar en insuficiencia hepática previa.',
  },
  ibuprofeno: {
    nombre: 'Ibuprofeno',
    nombreCientifico: 'Ácido 2-(4-isobutilfenil)propiónico',
    color: '#48A9A6',
    colorLight: '#e8f6f5',
    icono: '🦵',
    mecanismo:
      'Inhibe de forma reversible y no selectiva las ciclooxigenasas COX-1 y COX-2 en tejidos periféricos. Estas enzimas son necesarias para producir prostaglandinas (PGE2 y PGI2), que son los mediadores del dolor, la fiebre y la inflamación. Al bloquearlas, reduce los tres síntomas.',
    lugar: 'Tejidos periféricos (foco de inflamación)',
    esAntinflamatorio: true,
    puntos: [
      {
        icono: '🦵',
        texto:
          'Actúa en los tejidos periféricos donde se produce inflamación — bloquea la síntesis de prostaglandinas locales.',
      },
      {
        icono: '✅',
        texto:
          'SÍ es antiinflamatorio — esta es la diferencia clave respecto al paracetamol. Inhibe COX-1 y COX-2.',
      },
      {
        icono: '🔬',
        texto:
          'Metabolismo: principalmente hepático via CYP2C9. Eliminación renal. Biodisponibilidad oral ~80%.',
      },
      {
        icono: '🍽️',
        texto:
          'Requiere tomarse con comida — la inhibición de COX-1 reduce las prostaglandinas protectoras del estómago.',
      },
    ],
    organoRiesgo: 'Estómago y Riñón',
    organoRiesgoDesc:
      'La inhibición de COX-1 elimina las prostaglandinas que protegen la mucosa gástrica (úlcera). Las prostaglandinas renales regulan el flujo sanguíneo — su bloqueo reduce la perfusión renal.',
    limiteDosis: '1.200 mg/día sin receta · hasta 2.400 mg/día bajo supervisión médica',
    precaucion:
      'Siempre con comida. Precaución en úlcera, enfermedad renal crónica o cardiopatía.',
  },
};

interface FilaTabla {
  caracteristica: string;
  paracetamol: string;
  ibuprofeno: string;
  paracetamolOk: boolean | null;
  ibuprofenoOk: boolean | null;
}

const TABLA_COMPARATIVA: FilaTabla[] = [
  {
    caracteristica: 'Antipirético (fiebre)',
    paracetamol: '✅ Sí',
    ibuprofeno: '✅ Sí',
    paracetamolOk: true,
    ibuprofenoOk: true,
  },
  {
    caracteristica: 'Analgésico (dolor)',
    paracetamol: '✅ Sí',
    ibuprofeno: '✅ Sí',
    paracetamolOk: true,
    ibuprofenoOk: true,
  },
  {
    caracteristica: 'Antiinflamatorio',
    paracetamol: '❌ No',
    ibuprofeno: '✅ Sí',
    paracetamolOk: false,
    ibuprofenoOk: true,
  },
  {
    caracteristica: 'Lugar de acción',
    paracetamol: '🧠 Central (SNC)',
    ibuprofeno: '🦵 Periférico (tejidos)',
    paracetamolOk: null,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Inicio de acción',
    paracetamol: '~30 min',
    ibuprofeno: '~30–60 min',
    paracetamolOk: null,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Duración',
    paracetamol: '4–6 horas',
    ibuprofeno: '6–8 horas',
    paracetamolOk: null,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Órgano de riesgo',
    paracetamol: '⚠️ Hígado',
    ibuprofeno: '⚠️ Estómago / Riñón',
    paracetamolOk: null,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Con estómago vacío',
    paracetamol: '✅ Puede tomarse',
    ibuprofeno: '❌ No recomendado',
    paracetamolOk: true,
    ibuprofenoOk: false,
  },
  {
    caracteristica: 'Niños con gripe',
    paracetamol: '✅ Primera opción',
    ibuprofeno: 'Evaluar según edad',
    paracetamolOk: true,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Embarazo (orientación general)',
    paracetamol: '✅ Primera opción',
    ibuprofeno: '⚠️ Evitar 3er trimestre',
    paracetamolOk: true,
    ibuprofenoOk: false,
  },
];

interface Escenario {
  icono: string;
  situacion: string;
  orientacion: string;
  detalle: string;
  farmaco: Farmaco | 'ambos';
}

const ESCENARIOS: Escenario[] = [
  {
    icono: '🌡️',
    situacion: 'Fiebre sin otros síntomas',
    orientacion: 'Ambos son eficaces',
    detalle:
      'El paracetamol suele ser la primera opción en niños y embarazadas por su mejor perfil de seguridad.',
    farmaco: 'ambos',
  },
  {
    icono: '💪',
    situacion: 'Dolor muscular post-ejercicio',
    orientacion: 'El ibuprofeno puede ser más eficaz',
    detalle:
      'El componente antiinflamatorio del ibuprofeno actúa directamente sobre las prostaglandinas generadas por el microtrauma muscular.',
    farmaco: 'ibuprofeno',
  },
  {
    icono: '🦷',
    situacion: 'Dolor dental',
    orientacion: 'El ibuprofeno suele ser más efectivo',
    detalle:
      'Hay inflamación local activa. Consultar siempre al dentista para tratar la causa del dolor.',
    farmaco: 'ibuprofeno',
  },
  {
    icono: '🤕',
    situacion: 'Dolor de cabeza tensional',
    orientacion: 'Ambos funcionan',
    detalle:
      'El paracetamol tiene mejor perfil de seguridad a largo plazo para uso frecuente. El ibuprofeno puede tener ligera ventaja en cefalea con componente inflamatorio.',
    farmaco: 'ambos',
  },
  {
    icono: '🤢',
    situacion: 'Estómago vacío o problemas gástricos',
    orientacion: 'El paracetamol es preferible',
    detalle:
      'No irrita la mucosa gástrica al no inhibir las COX periféricas protectoras del estómago.',
    farmaco: 'paracetamol',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorParacetamolIbuprofeno() {
  const [farmacoSeleccionado, setFarmacoSeleccionado] = useState<Farmaco>('paracetamol');
  const farmaco = FARMACOS[farmacoSeleccionado];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>FARMACOLOGÍA</span>
          <h1 className={styles.heroTitle}>Paracetamol vs Ibuprofeno: Mecanismos Distintos</h1>
          <p className={styles.heroSubtitle}>
            Por qué no son intercambiables y cómo actúa cada uno
          </p>
          <p className={styles.heroDesc}>
            El paracetamol actúa principalmente en el sistema nervioso central. El ibuprofeno
            inhibe las COX periféricas reduciendo inflamación. Mecanismos diferentes, perfiles de
            seguridad diferentes, usos distintos.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="low" collapsible={true} />

      {/* SECCIÓN 1: Toggle fármaco */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Selecciona un fármaco para ver su mecanismo</h2>
        <p className={styles.sectionDesc}>
          Elige entre paracetamol e ibuprofeno para explorar cómo actúa molecularmente, dónde
          actúa en el cuerpo y cuáles son sus riesgos.
        </p>

        <div className={styles.toggleFarmaco}>
          <button
            className={`${styles.farmacoBtn} ${farmacoSeleccionado === 'paracetamol' ? styles.farmacoBtnActivo : ''}`}
            onClick={() => setFarmacoSeleccionado('paracetamol')}
            aria-pressed={farmacoSeleccionado === 'paracetamol'}
            style={
              farmacoSeleccionado === 'paracetamol'
                ? ({ '--btn-color': FARMACOS.paracetamol.color } as React.CSSProperties)
                : undefined
            }
          >
            <span aria-hidden="true">🧠</span>
            <span>Paracetamol</span>
            <span className={styles.farmacoBtnSub}>Acetaminofén</span>
          </button>
          <button
            className={`${styles.farmacoBtn} ${farmacoSeleccionado === 'ibuprofeno' ? styles.farmacoBtnActivo : ''}`}
            onClick={() => setFarmacoSeleccionado('ibuprofeno')}
            aria-pressed={farmacoSeleccionado === 'ibuprofeno'}
            style={
              farmacoSeleccionado === 'ibuprofeno'
                ? ({ '--btn-color': FARMACOS.ibuprofeno.color } as React.CSSProperties)
                : undefined
            }
          >
            <span aria-hidden="true">🦵</span>
            <span>Ibuprofeno</span>
            <span className={styles.farmacoBtnSub}>AINE</span>
          </button>
        </div>

        <div
          className={styles.mecanismoPanel}
          style={{ '--panel-color': farmaco.color, '--panel-light': farmaco.colorLight } as React.CSSProperties}
          role="region"
          aria-label={`Mecanismo de ${farmaco.nombre}`}
        >
          <div className={styles.mecanismoCabecera}>
            <span className={styles.mecanismoIcono} aria-hidden="true">{farmaco.icono}</span>
            <div>
              <h3 className={styles.mecanismoTitulo}>{farmaco.nombre}</h3>
              <p className={styles.mecanismoCientifico}>{farmaco.nombreCientifico}</p>
            </div>
            <span
              className={
                farmaco.esAntinflamatorio ? styles.badgeAntinflamatorio : styles.badgeNoAntinflamatorio
              }
            >
              {farmaco.esAntinflamatorio ? '✅ Antiinflamatorio' : '❌ No antiinflamatorio'}
            </span>
          </div>

          <p className={styles.mecanismoDesc}>{farmaco.mecanismo}</p>

          <p className={styles.mecanismoLugar}>
            <strong>Lugar de acción:</strong> {farmaco.lugar}
          </p>

          <ul className={styles.mecanismoPuntos} role="list">
            {farmaco.puntos.map((punto, i) => (
              <li key={i} className={styles.mecanismoPunto}>
                <span aria-hidden="true">{punto.icono}</span>
                <span>{punto.texto}</span>
              </li>
            ))}
          </ul>

          <div className={styles.organoRiesgo}>
            <p className={styles.organoRiesgoLabel}>
              <strong>⚠️ Órgano de riesgo:</strong> {farmaco.organoRiesgo}
            </p>
            <p className={styles.organoRiesgoDesc}>{farmaco.organoRiesgoDesc}</p>
            <p className={styles.limiteDosis}>
              <strong>Dosis orientativa:</strong> {farmaco.limiteDosis}
            </p>
            <p className={styles.precaucion}>
              <strong>Precaución:</strong> {farmaco.precaucion}
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Tabla comparativa */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <h2 className={styles.sectionTitle}>Tabla comparativa</h2>
        <p className={styles.sectionDesc}>
          Una vista lado a lado de las características más relevantes de cada fármaco.
        </p>

        <div className={styles.tablaWrapper}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th className={styles.tablaHeaderCaract}>Característica</th>
                <th className={`${styles.tablaHeader} ${styles.tablaHeaderParacetamol}`}>
                  🧠 Paracetamol
                </th>
                <th className={`${styles.tablaHeader} ${styles.tablaHeaderIbuprofeno}`}>
                  🦵 Ibuprofeno
                </th>
              </tr>
            </thead>
            <tbody>
              {TABLA_COMPARATIVA.map((fila, i) => (
                <tr key={i} className={i % 2 === 0 ? styles.tablaRowPar : styles.tablaRowImpar}>
                  <td className={styles.tablaCeldaCaract}>{fila.caracteristica}</td>
                  <td
                    className={`${styles.tablaCelda} ${
                      fila.paracetamolOk === true
                        ? styles.tablaCeldaPositiva
                        : fila.paracetamolOk === false
                          ? styles.tablaCeldaNegativa
                          : styles.tablaCeldaNeutral
                    }`}
                  >
                    {fila.paracetamol}
                  </td>
                  <td
                    className={`${styles.tablaCelda} ${
                      fila.ibuprofenoOk === true
                        ? styles.tablaCeldaPositiva
                        : fila.ibuprofenoOk === false
                          ? styles.tablaCeldaNegativa
                          : styles.tablaCeldaNeutral
                    }`}
                  >
                    {fila.ibuprofeno}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.insightBox} role="note">
          <strong>Diferencia clave:</strong> El paracetamol NO es antiinflamatorio. Si hay
          inflamación local activa (esguince, dolor dental, artritis), el ibuprofeno tiene una
          ventaja mecanística real. Para fiebre o dolor sin inflamación, ambos son comparables.
        </div>
      </section>

      {/* SECCIÓN 3: Vías de eliminación */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Vías de metabolización y eliminación</h2>
        <p className={styles.sectionDesc}>
          Cómo el cuerpo procesa cada fármaco y qué órganos están implicados en cada caso.
        </p>

        <div className={styles.siluetasGrid}>
          {/* Paracetamol */}
          <div className={styles.siluetaCard}>
            <h3 className={styles.siluetaCardTitulo} style={{ color: FARMACOS.paracetamol.color }}>
              🧠 Paracetamol
            </h3>
            <div className={styles.siluetaDiagrama}>
              <div className={styles.siluetaOrgano}>
                <div className={styles.siluetaOrganoIcono} aria-hidden="true">👄</div>
                <div className={styles.siluetaOrganoLabel}>Absorción oral</div>
                <div className={styles.siluetaFlecha} aria-hidden="true">↓</div>
              </div>
              <div className={styles.siluetaOrgano}>
                <div
                  className={`${styles.siluetaOrganoIcono} ${styles.siluetaOrganoRiesgo}`}
                  aria-hidden="true"
                >
                  🫀
                </div>
                <div className={styles.siluetaOrganoLabel}>
                  Hígado
                  <span className={styles.siluetaOrganoSub}>
                    CYP2E1 → NAPQI (metabolito tóxico)
                  </span>
                </div>
                <div className={styles.siluetaFlecha} aria-hidden="true">↓</div>
              </div>
              <div className={styles.siluetaOrgano}>
                <div className={styles.siluetaOrganoIcono} aria-hidden="true">🫘</div>
                <div className={styles.siluetaOrganoLabel}>
                  Riñón
                  <span className={styles.siluetaOrganoSub}>Excreción urinaria</span>
                </div>
              </div>
            </div>
            <div className={styles.siluetaDatoDestacado}>
              <strong>⚠️ Clave:</strong> El NAPQI se neutraliza con glutatión. En sobredosis o
              con alcohol, el glutatión se agota. Resultado: toxicidad hepática grave. Es la
              primera causa de fallo hepático agudo en países occidentales.
            </div>
          </div>

          {/* Ibuprofeno */}
          <div className={styles.siluetaCard}>
            <h3 className={styles.siluetaCardTitulo} style={{ color: FARMACOS.ibuprofeno.color }}>
              🦵 Ibuprofeno
            </h3>
            <div className={styles.siluetaDiagrama}>
              <div className={styles.siluetaOrgano}>
                <div className={styles.siluetaOrganoIcono} aria-hidden="true">👄</div>
                <div className={styles.siluetaOrganoLabel}>
                  Absorción oral
                  <span className={styles.siluetaOrganoSub}>Tomar con comida</span>
                </div>
                <div className={styles.siluetaFlecha} aria-hidden="true">↓</div>
              </div>
              <div className={styles.siluetaOrgano}>
                <div
                  className={`${styles.siluetaOrganoIcono} ${styles.siluetaOrganoRiesgoSecundario}`}
                  aria-hidden="true"
                >
                  🫀
                </div>
                <div className={styles.siluetaOrganoLabel}>
                  Hígado
                  <span className={styles.siluetaOrganoSub}>CYP2C9 (metabolismo)</span>
                </div>
                <div className={styles.siluetaFlecha} aria-hidden="true">↓</div>
              </div>
              <div className={styles.siluetaOrgano}>
                <div
                  className={`${styles.siluetaOrganoIcono} ${styles.siluetaOrganoRiesgo}`}
                  aria-hidden="true"
                >
                  🫘
                </div>
                <div className={styles.siluetaOrganoLabel}>
                  Riñón
                  <span className={styles.siluetaOrganoSub}>Excreción + riesgo de perfusión</span>
                </div>
              </div>
            </div>
            <div className={styles.siluetaDatoDestacado}>
              <strong>⚠️ Doble riesgo:</strong> Estómago (la inhibición de COX-1 elimina las
              prostaglandinas protectoras de la mucosa) y riñón (las prostaglandinas renales
              regulan el flujo sanguíneo — sin ellas, baja la perfusión renal).
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: Escenarios educativos */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <h2 className={styles.sectionTitle}>Escenarios orientativos (educativo)</h2>
        <p className={styles.sectionDesc}>
          Estas orientaciones son puramente educativas. Ante cualquier duda, consulta con tu
          médico o farmacéutico, que conoce tu historial completo.
        </p>

        <div className={styles.escenarioGrid}>
          {ESCENARIOS.map((esc, i) => (
            <div key={i} className={styles.escenarioCard}>
              <div className={styles.escenarioIcono} aria-hidden="true">
                {esc.icono}
              </div>
              <h3 className={styles.escenarioSituacion}>{esc.situacion}</h3>
              <p
                className={styles.escenarioOrientacion}
                style={{
                  color:
                    esc.farmaco === 'paracetamol'
                      ? FARMACOS.paracetamol.color
                      : esc.farmaco === 'ibuprofeno'
                        ? FARMACOS.ibuprofeno.color
                        : '#666',
                }}
              >
                {esc.orientacion}
              </p>
              <p className={styles.escenarioDetalle}>{esc.detalle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EducationalSection */}
      <EducationalSection
        title="Profundiza en la farmacología comparada"
        subtitle="Mecanismos moleculares, metabolismo y seguridad de los AINE"
      >
        <div>
          <h3>¿Qué son los AINEs y por qué el paracetamol no lo es técnicamente?</h3>
          <p>
            Los AINEs (antiinflamatorios no esteroideos) son fármacos que reducen la inflamación,
            el dolor y la fiebre mediante la inhibición de las enzimas ciclooxigenasas (COX-1 y
            COX-2). El ibuprofeno es un AINE clásico. El paracetamol, aunque comparte algunos
            efectos (analgesia y antipirésia), no inhibe significativamente las COX periféricas y
            no tiene acción antiinflamatoria clínicamente relevante. Por eso, técnicamente, el
            paracetamol no se clasifica como AINE, aunque sí como analgésico y antipirético.
          </p>

          <h3>El metabolito NAPQI y la importancia del glutatión</h3>
          <p>
            Cuando el hígado metaboliza el paracetamol, el 10% de la dosis pasa por la enzima
            CYP2E1, generando un metabolito altamente reactivo llamado NAPQI
            (N-acetil-p-benzoquinonaimina). En condiciones normales, el NAPQI se neutraliza
            rápidamente por el glutatión (un antioxidante natural del hígado) y se excreta de
            forma inocua. El problema aparece cuando se supera la capacidad del glutatión: en
            sobredosis, con consumo regular de alcohol (que induce CYP2E1 y agota el glutatión)
            o en personas con reservas de glutatión reducidas. En esos casos, el NAPQI libre
            daña irreversiblemente las células hepáticas.
          </p>

          <h3>Por qué el ibuprofeno puede afectar al riñón</h3>
          <p>
            En condiciones normales, las prostaglandinas renales (PGE2, PGI2) tienen un papel
            vasodilatador que mantiene el flujo sanguíneo hacia el riñón. Esto es especialmente
            relevante en situaciones de estrés renal (deshidratación, insuficiencia cardíaca,
            ciertos medicamentos). Cuando el ibuprofeno inhibe las COX, también suprime estas
            prostaglandinas protectoras. El resultado es una reducción del flujo renal que, en
            personas vulnerables, puede provocar insuficiencia renal aguda. Por eso el ibuprofeno
            debe evitarse en personas con enfermedad renal crónica o en estados de deshidratación.
          </p>

          <h3>¿Se pueden combinar paracetamol e ibuprofeno?</h3>
          <p>
            Sí, y hay evidencias que sugieren que la combinación tiene mayor eficacia analgésica
            que cada uno por separado. La razón es que actúan por mecanismos complementarios:
            el paracetamol vía central y el ibuprofeno vía periférica antiinflamatoria. Algunos
            protocolos hospitalarios alternan ambos fármacos para mantener una cobertura
            analgésica continua. Sin embargo, esta combinación debe hacerse bajo criterio médico
            o farmacéutico, respetando las dosis máximas de cada uno por separado.
          </p>

          <div className={styles.warningBox} role="note">
            <strong>Nota educativa:</strong> Este visualizador explica mecanismos bioquímicos con
            fines educativos. Los datos presentados son orientativos y no sustituyen la valoración
            individualizada. Ante cualquier duda sobre qué medicamento tomar, consulta con tu
            médico o farmacéutico.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-paracetamol-ibuprofeno')} />
      <ShareCard appName="visualizador-paracetamol-ibuprofeno" />
      <Footer appName="visualizador-paracetamol-ibuprofeno" />
    </div>
  );
}
