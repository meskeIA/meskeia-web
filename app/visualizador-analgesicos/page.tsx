'use client';
// @disclaimer: medical — severity=low
import { useState } from 'react';
import styles from './VisualizadorAnalgesicos.module.css';
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

type Farmaco = 'aspirina' | 'paracetamol' | 'ibuprofeno';

interface PuntoMecanismo {
  icono: string;
  texto: string;
}

interface DatoFarmaco {
  nombre: string;
  nombreCientifico: string;
  color: string;
  colorLight: string;
  colorDark: string;
  icono: string;
  mecanismo: string;
  lugar: string;
  esAntinflamatorio: boolean;
  esAntiagregante: string;
  puntos: PuntoMecanismo[];
  aviso: string | null;
  organoRiesgo: string;
  organoRiesgoDesc: string;
  metabolismo: string;
}

const FARMACOS: Record<Farmaco, DatoFarmaco> = {
  aspirina: {
    nombre: 'Aspirina',
    nombreCientifico: 'Ácido acetilsalicílico (AAS)',
    color: '#c0392b',
    colorLight: '#fdecea',
    colorDark: '#2a0a08',
    icono: '❤️',
    mecanismo:
      'Acetila de forma IRREVERSIBLE la serina 530 del sitio activo de COX-1 y COX-2. Al bloquearse permanentemente, la enzima no puede sintetizar prostaglandinas (PGE2) ni tromboxano A2 (TXA2). Como las plaquetas carecen de núcleo celular, no pueden fabricar nueva COX, por lo que el efecto antiagregante dura toda la vida de la plaqueta: 7-10 días.',
    lugar: 'Periférico (tejidos inflamados) + plaquetas en sangre',
    esAntinflamatorio: true,
    esAntiagregante: '✅ Irreversible (7-10 días)',
    puntos: [
      {
        icono: '🔒',
        texto:
          'Bloqueo IRREVERSIBLE de COX-1 y COX-2 — la plaqueta no puede regenerar la enzima, el efecto dura toda su vida útil (7-10 días).',
      },
      {
        icono: '🩸',
        texto:
          'Antiagregante plaquetario permanente: por eso se usa a dosis baja (100 mg) en prevención cardiovascular secundaria.',
      },
      {
        icono: '🔥',
        texto:
          'Antiinflamatorio y antipirético: inhibe la síntesis de prostaglandinas en tejidos periféricos (PGE2, PGI2).',
      },
      {
        icono: '🍽️',
        texto:
          'Requiere tomarse con comida: la inhibición de COX-1 elimina las prostaglandinas protectoras de la mucosa gástrica.',
      },
    ],
    aviso:
      '⛔ Contraindicada en niños y adolescentes con procesos víricos (gripe, varicela) — riesgo de síndrome de Reye.',
    organoRiesgo: 'Estómago',
    organoRiesgoDesc:
      'La PGE2 protege la mucosa gástrica. Al inhibirse irreversiblemente la COX-1, desaparece esta protección → riesgo de úlcera, hemorragia digestiva, especialmente con uso prolongado.',
    metabolismo:
      'Hidrólisis a ácido salicílico en intestino e hígado. Conjugación hepática y eliminación renal. Semivida corta: 15-20 min (aspirina), 2-3 h (salicilato).',
  },
  paracetamol: {
    nombre: 'Paracetamol',
    nombreCientifico: 'Acetaminofén / N-acetil-p-aminofenol',
    color: '#27ae60',
    colorLight: '#eafaf1',
    colorDark: '#0a1f12',
    icono: '🧠',
    mecanismo:
      'Su mecanismo exacto no está del todo esclarecido. Hipótesis principal: actúa en el SNC potenciando las vías descendentes serotoninérgicas que inhiben el dolor, e inhibe débilmente una variante central de COX (COX-3). NO inhibe las COX periféricas de forma relevante → no es antiinflamatorio en tejidos.',
    lugar: 'Central (SNC, hipotálamo para la fiebre)',
    esAntinflamatorio: false,
    esAntiagregante: '❌ No',
    puntos: [
      {
        icono: '🧠',
        texto:
          'Actúa en el SNC — en el hipotálamo para regular la fiebre y en las vías centrales del dolor.',
      },
      {
        icono: '❌',
        texto:
          'NO es antiinflamatorio en sentido clínico: no inhibe las COX periféricas de forma significativa.',
      },
      {
        icono: '🔬',
        texto:
          'Metabolismo hepático: glucuronidación (60%) + sulfatación (30%) + CYP2E1 (10%) → NAPQI (metabolito tóxico) → neutralizado por glutatión.',
      },
      {
        icono: '✅',
        texto:
          'Se puede tomar con estómago vacío: no irrita la mucosa gástrica al no inhibir COX periféricas.',
      },
    ],
    aviso: null,
    organoRiesgo: 'Hígado',
    organoRiesgoDesc:
      'En sobredosis o con consumo crónico de alcohol, el glutatión se agota y el NAPQI causa necrosis hepática grave. Es la causa más frecuente de fallo hepático agudo en países occidentales. Límite: 4 g/día (adultos sanos); 2 g/día con alcohol habitual.',
    metabolismo:
      'Hígado: glucuronidación + sulfatación + CYP2E1 (10%) → NAPQI → neutralizado por glutatión. Eliminación renal. Semivida: 2-3 h.',
  },
  ibuprofeno: {
    nombre: 'Ibuprofeno',
    nombreCientifico: 'Ácido 2-(4-isobutilfenil)propiónico',
    color: '#2E86AB',
    colorLight: '#e8f4f9',
    colorDark: '#0a1a22',
    icono: '💊',
    mecanismo:
      'Inhibe de forma REVERSIBLE y no selectiva COX-1 y COX-2 en tejidos periféricos. Bloquea la síntesis de prostaglandinas (PGE2 y PGI2) y tromboxano A2. A diferencia de la aspirina, el bloqueo es temporal: cuando el ibuprofeno se elimina, las COX recuperan actividad → el efecto antiagregante dura solo horas.',
    lugar: 'Periférico (tejidos inflamados)',
    esAntinflamatorio: true,
    esAntiagregante: '⚠️ Reversible (temporal)',
    puntos: [
      {
        icono: '🔓',
        texto:
          'Bloqueo REVERSIBLE de COX-1 y COX-2 — cuando el fármaco se elimina, la enzima recupera actividad.',
      },
      {
        icono: '🔥',
        texto:
          'SÍ es antiinflamatorio: actúa en los tejidos periféricos donde se produce la inflamación.',
      },
      {
        icono: '🔬',
        texto:
          'Metabolismo hepático via CYP2C9. Eliminación renal. Biodisponibilidad oral ~80%.',
      },
      {
        icono: '🍽️',
        texto:
          'Tomar con comida: la inhibición de COX-1 elimina las prostaglandinas protectoras del estómago y del riñón.',
      },
    ],
    aviso:
      '⚠️ Evitar en el tercer trimestre de embarazo: puede causar cierre prematuro del ductus arterioso.',
    organoRiesgo: 'Estómago + Riñón',
    organoRiesgoDesc:
      'Las prostaglandinas renales regulan el flujo sanguíneo. Al inhibirse → reducción de perfusión renal → riesgo de daño renal, especialmente en personas mayores, deshidratadas o con enfermedad renal previa. Riesgo gástrico: mismo mecanismo que aspirina.',
    metabolismo:
      'Hígado (CYP2C9) → metabolitos inactivos → eliminación renal. Semivida: 1,8-2 h. Tomar con alimentos reduce irritación gástrica.',
  },
};

interface FilaTabla {
  caracteristica: string;
  aspirina: string;
  paracetamol: string;
  ibuprofeno: string;
  aspirinaOk: boolean | null;
  paracetamolOk: boolean | null;
  ibuprofenoOk: boolean | null;
}

const TABLA_COMPARATIVA: FilaTabla[] = [
  {
    caracteristica: 'Antipirético (fiebre)',
    aspirina: '✅ Sí',
    paracetamol: '✅ Sí',
    ibuprofeno: '✅ Sí',
    aspirinaOk: true,
    paracetamolOk: true,
    ibuprofenoOk: true,
  },
  {
    caracteristica: 'Analgésico (dolor)',
    aspirina: '✅ Sí',
    paracetamol: '✅ Sí',
    ibuprofeno: '✅ Sí',
    aspirinaOk: true,
    paracetamolOk: true,
    ibuprofenoOk: true,
  },
  {
    caracteristica: 'Antiinflamatorio',
    aspirina: '✅ Sí',
    paracetamol: '❌ No',
    ibuprofeno: '✅ Sí',
    aspirinaOk: true,
    paracetamolOk: false,
    ibuprofenoOk: true,
  },
  {
    caracteristica: 'Antiagregante plaquetario',
    aspirina: '✅ Irreversible',
    paracetamol: '❌ No',
    ibuprofeno: '⚠️ Reversible',
    aspirinaOk: true,
    paracetamolOk: false,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Inhibición COX',
    aspirina: 'Irreversible',
    paracetamol: 'Central / débil',
    ibuprofeno: 'Reversible',
    aspirinaOk: null,
    paracetamolOk: null,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Lugar de acción',
    aspirina: '🩸 Periférico',
    paracetamol: '🧠 Central (SNC)',
    ibuprofeno: '🦵 Periférico',
    aspirinaOk: null,
    paracetamolOk: null,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Órgano de riesgo',
    aspirina: '⚠️ Estómago',
    paracetamol: '⚠️ Hígado',
    ibuprofeno: '⚠️ Estómago + Riñón',
    aspirinaOk: null,
    paracetamolOk: null,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Con estómago vacío',
    aspirina: '❌ No',
    paracetamol: '✅ Sí',
    ibuprofeno: '❌ No',
    aspirinaOk: false,
    paracetamolOk: true,
    ibuprofenoOk: false,
  },
  {
    caracteristica: 'Niños con fiebre / gripe',
    aspirina: '⛔ Contraindicado',
    paracetamol: '✅ Primera opción',
    ibuprofeno: '✅ Evaluar edad',
    aspirinaOk: false,
    paracetamolOk: true,
    ibuprofenoOk: true,
  },
  {
    caracteristica: 'Embarazo',
    aspirina: '⚠️ Evitar',
    paracetamol: '✅ Preferido',
    ibuprofeno: '⛔ Evitar 3.er trim.',
    aspirinaOk: null,
    paracetamolOk: true,
    ibuprofenoOk: false,
  },
  {
    caracteristica: 'Duración efecto',
    aspirina: '4-6 h',
    paracetamol: '4-6 h',
    ibuprofeno: '6-8 h',
    aspirinaOk: null,
    paracetamolOk: null,
    ibuprofenoOk: null,
  },
  {
    caracteristica: 'Inicio de acción',
    aspirina: '~30 min',
    paracetamol: '~30 min',
    ibuprofeno: '~30-60 min',
    aspirinaOk: null,
    paracetamolOk: null,
    ibuprofenoOk: null,
  },
];

interface Escenario {
  icono: string;
  situacion: string;
  orientacion: string;
  detalle: string;
}

const ESCENARIOS: Escenario[] = [
  {
    icono: '🌡️',
    situacion: 'Fiebre sin inflamación',
    orientacion: 'Paracetamol — primera opción',
    detalle:
      'Mejor perfil de seguridad gástrica, puede tomarse con estómago vacío. Primera opción en niños y embarazadas.',
  },
  {
    icono: '💪',
    situacion: 'Dolor muscular / deportivo',
    orientacion: 'Ibuprofeno — componente antiinflamatorio más eficaz',
    detalle:
      'El microtrauma muscular genera prostaglandinas locales. El ibuprofeno actúa directamente sobre ellas como AINE.',
  },
  {
    icono: '🦷',
    situacion: 'Dolor dental',
    orientacion: 'Ibuprofeno (inflamación local)',
    detalle:
      'La combinación paracetamol + ibuprofeno tiene evidencia clínica de mayor eficacia analgésica al actuar por mecanismos complementarios (central + periférico).',
  },
  {
    icono: '❤️',
    situacion: 'Prevención cardiovascular secundaria (tras infarto/ictus)',
    orientacion: 'Aspirina a dosis baja bajo indicación médica',
    detalle:
      'Antiagregante irreversible. Efecto plaquetario durante 7-10 días. En prevención primaria, las guías de 2022 (USPSTF, ESC) ya no la recomiendan de forma rutinaria por riesgo de sangrado. No indicada para analgesia general a estas dosis.',
  },
  {
    icono: '🤰',
    situacion: 'Embarazo',
    orientacion: 'Paracetamol — consultar siempre con ginecólogo/a',
    detalle:
      'El ibuprofeno está contraindicado en el tercer trimestre. La aspirina también tiene restricciones. El paracetamol es el analgésico de referencia en el embarazo.',
  },
];

interface DiferenciaKey {
  color: string;
  colorBg: string;
  titulo: string;
  texto: string;
}

const DIFERENCIAS_CLAVE: DiferenciaKey[] = [
  {
    color: '#c0392b',
    colorBg: '#fdecea',
    titulo: 'Solo la aspirina es antiagregante permanente',
    texto:
      'Por eso se usa en prevención cardiovascular a dosis baja. El ibuprofeno también antiagrega, pero de forma temporal: cuando se elimina el fármaco, las plaquetas recuperan su función.',
  },
  {
    color: '#27ae60',
    colorBg: '#eafaf1',
    titulo: 'Solo el paracetamol respeta el estómago y el riñón',
    texto:
      'Pero es el más peligroso en sobredosis: el NAPQI destruye el hígado si el glutatión se agota. El ibuprofeno y la aspirina son más peligrosos para estómago y riñón.',
  },
  {
    color: '#2E86AB',
    colorBg: '#e8f4f9',
    titulo: 'Solo el ibuprofeno y la aspirina reducen la inflamación',
    texto:
      'Si hay inflamación visible (golpe, articulación hinchada, tejido enrojecido), el paracetamol solo alivia el dolor sin tratar la causa inflamatoria. No son equivalentes en este contexto.',
  },
];

// ─────────────────────────────────────────────
// Utilidad para clases de celda
// ─────────────────────────────────────────────

function clasesCelda(ok: boolean | null, base: string, pos: string, neg: string, neu: string) {
  if (ok === true) return `${base} ${pos}`;
  if (ok === false) return `${base} ${neg}`;
  return `${base} ${neu}`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAnalgesicos() {
  const [farmacoSeleccionado, setFarmacoSeleccionado] = useState<Farmaco>('aspirina');
  const farmaco = FARMACOS[farmacoSeleccionado];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>FARMACOLOGÍA</span>
          <h1 className={styles.heroTitle}>
            Aspirina, Paracetamol e Ibuprofeno: Tres Mecanismos Distintos
          </h1>
          <p className={styles.heroSubtitle}>
            El analgésico más adecuado depende del tipo de dolor, no de la costumbre
          </p>
          <p className={styles.heroDesc}>
            Los tres son analgésicos y antipiréticos, pero actúan de forma completamente diferente.
            Solo el ibuprofeno y la aspirina son antiinflamatorios. Solo la aspirina es antiagregante.
            Solo el paracetamol es seguro con estómago vacío. Conocer la diferencia cambia cómo los usas.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" />

      {/* SECCIÓN 1: Toggle 3 fármacos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Selecciona un fármaco para ver su mecanismo</h2>
        <p className={styles.sectionDesc}>
          Elige entre los tres analgésicos para explorar cómo actúa molecularmente, dónde actúa en
          el cuerpo y cuáles son sus riesgos específicos.
        </p>

        <div className={styles.toggleTres} role="group" aria-label="Selector de fármaco">
          {(Object.keys(FARMACOS) as Farmaco[]).map((key) => {
            const f = FARMACOS[key];
            const activo = farmacoSeleccionado === key;
            return (
              <button
                key={key}
                className={`${styles.farmacoBtn} ${activo ? styles.farmacoBtnActivo : ''}`}
                onClick={() => setFarmacoSeleccionado(key)}
                aria-pressed={activo}
                style={activo ? ({ '--btn-color': f.color } as React.CSSProperties) : undefined}
              >
                <span aria-hidden="true" className={styles.farmacoBtnIcono}>{f.icono}</span>
                <span className={styles.farmacoBtnNombre}>{f.nombre}</span>
                <span className={styles.farmacoBtnSub}>{f.nombreCientifico.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <div
          className={styles.mecanismoPanel}
          style={
            {
              '--panel-color': farmaco.color,
              '--panel-light': farmaco.colorLight,
            } as React.CSSProperties
          }
          role="region"
          aria-label={`Mecanismo de ${farmaco.nombre}`}
        >
          <div className={styles.mecanismoCabecera}>
            <span className={styles.mecanismoIcono} aria-hidden="true">
              {farmaco.icono}
            </span>
            <div className={styles.mecanismoInfo}>
              <h3 className={styles.mecanismoTitulo}>{farmaco.nombre}</h3>
              <p className={styles.mecanismoCientifico}>{farmaco.nombreCientifico}</p>
            </div>
            <div className={styles.mecanismoBadges}>
              <span
                className={
                  farmaco.esAntinflamatorio ? styles.badgePositivo : styles.badgeNegativo
                }
              >
                {farmaco.esAntinflamatorio ? '✅ Antiinflamatorio' : '❌ No antiinflamatorio'}
              </span>
              <span
                className={
                  farmaco.esAntiagregante.startsWith('✅')
                    ? styles.badgePositivo
                    : farmaco.esAntiagregante.startsWith('⚠️')
                      ? styles.badgeNeutral
                      : styles.badgeNegativo
                }
              >
                {farmaco.esAntiagregante}
              </span>
            </div>
          </div>

          <p className={styles.mecanismoDesc}>{farmaco.mecanismo}</p>

          <p className={styles.mecanismoLugar}>
            <strong>Lugar de acción:</strong> {farmaco.lugar}
          </p>

          <p className={styles.mecanismoMetabolismo}>
            <strong>Metabolismo:</strong> {farmaco.metabolismo}
          </p>

          <ul className={styles.mecanismoPuntos} role="list">
            {farmaco.puntos.map((punto, i) => (
              <li key={i} className={styles.mecanismoPunto}>
                <span aria-hidden="true">{punto.icono}</span>
                <span>{punto.texto}</span>
              </li>
            ))}
          </ul>

          {farmaco.aviso && (
            <p className={styles.mecanismoAviso} role="alert">
              {farmaco.aviso}
            </p>
          )}

          <div className={styles.organoRiesgo}>
            <p className={styles.organoRiesgoLabel}>
              <strong>⚠️ Órgano de riesgo:</strong> {farmaco.organoRiesgo}
            </p>
            <p className={styles.organoRiesgoDesc}>{farmaco.organoRiesgoDesc}</p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Tabla comparativa 3 columnas */}
      <section className={`${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Tabla comparativa completa</h2>
          <p className={styles.sectionDesc}>
            Los tres analgésicos lado a lado en las características más relevantes.
          </p>

          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th className={styles.tablaHeaderCaract}>Característica</th>
                  <th className={`${styles.tablaHeader} ${styles.tablaHeaderAspirina}`}>
                    ❤️ Aspirina
                  </th>
                  <th className={`${styles.tablaHeader} ${styles.tablaHeaderParacetamol}`}>
                    🧠 Paracetamol
                  </th>
                  <th className={`${styles.tablaHeader} ${styles.tablaHeaderIbuprofeno}`}>
                    💊 Ibuprofeno
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLA_COMPARATIVA.map((fila, i) => (
                  <tr key={i} className={i % 2 === 0 ? styles.tablaRowPar : styles.tablaRowImpar}>
                    <td className={styles.tablaCeldaCaract}>{fila.caracteristica}</td>
                    <td
                      className={clasesCelda(
                        fila.aspirinaOk,
                        styles.tablaCelda,
                        styles.tablaCeldaPositiva,
                        styles.tablaCeldaNegativa,
                        styles.tablaCeldaNeutral,
                      )}
                    >
                      {fila.aspirina}
                    </td>
                    <td
                      className={clasesCelda(
                        fila.paracetamolOk,
                        styles.tablaCelda,
                        styles.tablaCeldaPositiva,
                        styles.tablaCeldaNegativa,
                        styles.tablaCeldaNeutral,
                      )}
                    >
                      {fila.paracetamol}
                    </td>
                    <td
                      className={clasesCelda(
                        fila.ibuprofenoOk,
                        styles.tablaCelda,
                        styles.tablaCeldaPositiva,
                        styles.tablaCeldaNegativa,
                        styles.tablaCeldaNeutral,
                      )}
                    >
                      {fila.ibuprofeno}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: Escenarios */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>¿Cuál elegir en cada situación?</h2>
        <p className={styles.sectionDesc}>
          Orientación educativa por tipo de situación. Siempre consultar con un profesional de la
          salud para decisiones individuales.
        </p>

        <div className={styles.escenarioGrid}>
          {ESCENARIOS.map((esc, i) => (
            <div key={i} className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">
                {esc.icono}
              </span>
              <h3 className={styles.escenarioSituacion}>{esc.situacion}</h3>
              <p className={styles.escenarioOrientacion}>{esc.orientacion}</p>
              <p className={styles.escenarioDetalle}>{esc.detalle}</p>
            </div>
          ))}
        </div>

        <div className={styles.insightBox} role="note">
          <span className={styles.insightIcono} aria-hidden="true">💡</span>
          <p>
            <strong>Combinación paracetamol + ibuprofeno:</strong> Tiene evidencia en ensayos
            clínicos de mayor eficacia analgésica que cada uno por separado, al actuar por
            mecanismos complementarios (central + periférico). No aplicar con aspirina — la
            combinación triple no añade beneficio y aumenta riesgos gástricos.
          </p>
        </div>
      </section>

      {/* SECCIÓN 4: Las 3 diferencias clave */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Las 3 diferencias clave para recordar</h2>
          <p className={styles.sectionDesc}>
            Si solo puedes recordar tres cosas de esta comparativa, que sean estas.
          </p>

          <div className={styles.diferenciaGrid}>
            {DIFERENCIAS_CLAVE.map((dif, i) => (
              <div
                key={i}
                className={styles.diferenciaCard}
                style={
                  {
                    '--dif-color': dif.color,
                    '--dif-bg': dif.colorBg,
                  } as React.CSSProperties
                }
              >
                <span className={styles.diferenciaNum} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={styles.diferenciaTitulo}>{dif.titulo}</h3>
                <p className={styles.diferenciaTexto}>{dif.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN EDUCATIVA */}
      <EducationalSection
        title="Profundiza en la farmacología de los analgésicos"
        subtitle="Mecanismos, historia y combinaciones de los tres fármacos más vendidos del mundo"
      >
        <div className={styles.eduContenido}>
          <h3 className={styles.eduTitulo}>Una breve historia de los tres</h3>
          <p className={styles.eduParrafo}>
            <strong>Aspirina (1897):</strong> Felix Hoffmann, químico de Bayer, sintetizó el ácido
            acetilsalicílico estable buscando aliviar el dolor de su padre con artritis. El nombre
            comercial «Aspirin» es la contracción de «Acetyl» + «Spirsäure» (ácido salicílico en
            alemán, extraído originalmente de la espirea). Fue el primer fármaco de síntesis a
            escala industrial.
          </p>
          <p className={styles.eduParrafo}>
            <strong>Paracetamol (1955):</strong> El acetanilida, un compuesto similar, se usó como
            analgésico en los años 1880 pero resultó tóxico para los glóbulos rojos. El paracetamol,
            sintetizado en 1878, no se popularizó hasta 1955 cuando McNeil Laboratories lo comercializó
            en EEUU como «Tylenol». La FDA lo aprobó como analgésico seguro sin receta en la década de
            los 60. Irónicamente, el compuesto «seguro» resultó ser el más letal en sobredosis.
          </p>
          <p className={styles.eduParrafo}>
            <strong>Ibuprofeno (1961):</strong> Stewart Adams, investigador de Boots UK, sintetizó el
            ibuprofeno buscando un antiinflamatorio sin los efectos gástricos de la aspirina. La leyenda
            cuenta que Adams tomó ibuprofeno para su propia resaca antes de dar una conferencia — y
            funcionó. Aprobado en el Reino Unido en 1969, llegó sin receta en 1983. Hoy es el AINE
            sin receta más consumido del mundo.
          </p>

          <h3 className={styles.eduTitulo}>Por qué el paracetamol no es un AINE</h3>
          <p className={styles.eduParrafo}>
            AINE significa «Antiinflamatorio No Esteroideo». La clasificación hace referencia a los
            fármacos que inhiben las ciclooxigenasas periféricas para reducir inflamación. El paracetamol
            NO inhibe las COX periféricas de forma relevante, por lo que técnicamente no puede
            clasificarse como AINE aunque comparta propiedades analgésicas y antipiréticas con ellos.
            Esta distinción importa: si hay inflamación real en el tejido (golpe, artritis activa,
            infección), el paracetamol no trata la causa.
          </p>

          <h3 className={styles.eduTitulo}>El síndrome de Reye y por qué los niños no toman aspirina</h3>
          <p className={styles.eduParrafo}>
            El síndrome de Reye es una encefalopatía grave con fallo hepático que afecta principalmente
            a niños y adolescentes. Se asoció epidemiológicamente al uso de aspirina durante procesos
            víricos (gripe, varicela). El mecanismo exacto no está totalmente aclarado, pero se cree
            que los salicilatos interfieren con el metabolismo mitocondrial en presencia de ciertos
            virus. Tras la epidemia de gripe de 1976-1978, la FDA emitió advertencias y el uso de
            aspirina en niños con fiebre viral cayó drásticamente — y también lo hizo la incidencia del
            síndrome de Reye. Hoy está contraindicada en menores de 16 años con procesos víricos.
          </p>

          <h3 className={styles.eduTitulo}>Los inhibidores selectivos de COX-2: un caso de libro</h3>
          <p className={styles.eduParrafo}>
            En los años 90, los investigadores descubrieron que la COX-1 era la enzima «constitutiva»
            (siempre activa, protege el estómago) y la COX-2 la «inducible» (solo se activa en
            inflamación). La hipótesis era elegante: si inhibimos selectivamente COX-2, tendremos
            antiinflamatorios sin riesgo gástrico. Surgieron los coxibs (celecoxib, rofecoxib).
          </p>
          <p className={styles.eduParrafo}>
            El problema: la COX-2 también produce prostaciclina (PGI2) en el endotelio vascular, que
            protege el corazón. Al inhibirla sin inhibir COX-1 (que produce TXA2, que favorece la
            trombosis), se rompió el equilibrio → aumento del riesgo cardiovascular. Rofecoxib (Vioxx)
            fue retirado del mercado en 2004 tras comprobarse el incremento de infartos. Un caso de
            libro de cómo comprender a medias un mecanismo puede tener consecuencias graves.
          </p>

          <div className={styles.warningBox} role="note">
            <strong>⚠️ Nota importante:</strong> Este visualizador explica mecanismos farmacológicos
            con fines educativos. Para el uso correcto de cualquier medicamento, especialmente en niños,
            embarazo o personas con enfermedades crónicas, consulta siempre con tu médico o farmacéutico.
            Las dosis, interacciones y contraindicaciones son individuales y deben ser evaluadas por un
            profesional.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-analgesicos')} />
      <ShareCard appName="visualizador-analgesicos" />
      <Footer appName="visualizador-analgesicos" />
    </div>
  );
}
