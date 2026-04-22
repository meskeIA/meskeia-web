'use client';
import { useState } from 'react';
import styles from './VisualizadorTiroides.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ── Tipos ──────────────────────────────────────────────────────────────────

interface FactorTiroideo {
  icono: string;
  titulo: string;
  descripcion: string;
}

// ── Datos ──────────────────────────────────────────────────────────────────

const FACTORES_TIROIDEO: FactorTiroideo[] = [
  {
    icono: '🧂',
    titulo: 'Yodo',
    descripcion: 'Necesario para sintetizar T3 y T4. Tanto el déficit como el exceso pueden afectar al tiroides.',
  },
  {
    icono: '🦠',
    titulo: 'Sistema inmune',
    descripcion: 'Algunas condiciones autoinmunes (como Hashimoto o Graves) implican que el sistema inmune afecta al tejido tiroideo.',
  },
  {
    icono: '💊',
    titulo: 'Algunos medicamentos',
    descripcion: 'Ciertos fármacos (litio, amiodarona, entre otros) pueden influir en la función tiroidea.',
  },
  {
    icono: '☢️',
    titulo: 'Radiación',
    descripcion: 'La exposición a radiación en la zona del cuello puede afectar al tejido tiroideo.',
  },
  {
    icono: '🧬',
    titulo: 'Genética',
    descripcion: 'Las enfermedades tiroideas tienen componente hereditario.',
  },
  {
    icono: '⚖️',
    titulo: 'Embarazo',
    descripcion: 'El tiroides trabaja más durante el embarazo para cubrir las necesidades del feto.',
  },
  {
    icono: '🌿',
    titulo: 'Goitrógenos',
    descripcion: 'Algunas sustancias en ciertos alimentos (brócoli, soja en grandes cantidades) pueden interferir con la absorción de yodo en el tiroides.',
  },
  {
    icono: '🕐',
    titulo: 'Envejecimiento',
    descripcion: 'La prevalencia de alteraciones tiroideas aumenta con la edad, especialmente en mujeres.',
  },
];

interface FilaComparativa {
  aspecto: string;
  hipoactivo: string;
  hiperactivo: string;
}

const COMPARATIVA: FilaComparativa[] = [
  {
    aspecto: 'Producción de T3/T4',
    hipoactivo: 'Por debajo de las necesidades del organismo',
    hiperactivo: 'Por encima de las necesidades del organismo',
  },
  {
    aspecto: 'TSH',
    hipoactivo: 'Elevada (hipófisis intenta estimular más)',
    hiperactivo: 'Baja (el cuerpo intenta frenar la sobreproducción)',
  },
  {
    aspecto: 'Ritmo metabólico',
    hipoactivo: 'Ralentizado',
    hiperactivo: 'Acelerado',
  },
  {
    aspecto: 'Temperatura corporal',
    hipoactivo: 'Tendencia al frío',
    hiperactivo: 'Tendencia al calor',
  },
  {
    aspecto: 'Frecuencia cardíaca',
    hipoactivo: 'Tendencia a la baja',
    hiperactivo: 'Tendencia a la alta',
  },
  {
    aspecto: 'Energía celular',
    hipoactivo: 'Reducida',
    hiperactivo: 'Aumentada, pero de forma descontrolada',
  },
];

// ── Componente ─────────────────────────────────────────────────────────────

export default function VisualizadorTiroides() {
  const [feedbackActivo, setFeedbackActivo] = useState(false);
  const [factorSeleccionado, setFactorSeleccionado] = useState<number | null>(null);

  const toggleFactor = (idx: number) => {
    setFactorSeleccionado(prev => (prev === idx ? null : idx));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1>Tiroides: La Glándula del Metabolismo</h1>
        <p>Cómo funciona el eje hormonal que regula el ritmo de tu organismo</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <DisclaimerCard
          variant="medical"
          severity="low"
          collapsible={true}
        />

        {/* Bloque 1 — Eje hipotálamo-hipófisis-tiroides */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>El Eje Hipotálamo-Hipófisis-Tiroides</h2>
          <p className={styles.subtituloSeccion}>
            El control del tiroides es una cadena de señales hormonales con un bucle de autorregulación.
          </p>

          <div className={styles.ejeHormonal}>
            {/* Nivel 1 */}
            <div className={`${styles.nivelEje} ${styles.nivelHipotalamo}`}>
              <span className={styles.nivelIcono} aria-hidden="true">🧠</span>
              <strong>Hipotálamo</strong>
              <span className={styles.nivelDescripcion}>Libera TRH (hormona liberadora de tirotropina)</span>
            </div>

            <div className={styles.flechaEje} aria-hidden="true">↓</div>

            {/* Nivel 2 */}
            <div className={`${styles.nivelEje} ${styles.nivelHipofisis}`}>
              <span className={styles.nivelIcono} aria-hidden="true">🔵</span>
              <strong>Hipófisis</strong>
              <span className={styles.nivelDescripcion}>Libera TSH (tirotropina)</span>
            </div>

            <div className={styles.flechaEje} aria-hidden="true">↓</div>

            {/* Nivel 3 */}
            <div className={`${styles.nivelEje} ${styles.nivelTiroides}`}>
              <span className={styles.nivelIcono} aria-hidden="true">🦋</span>
              <strong>Tiroides</strong>
              <span className={styles.nivelDescripcion}>Produce T3 y T4</span>
            </div>

            <div className={styles.flechaEje} aria-hidden="true">↓</div>

            {/* Nivel 4 */}
            <div className={`${styles.nivelEje} ${styles.nivelCelulas}`}>
              <span className={styles.nivelIcono} aria-hidden="true">🔬</span>
              <strong>Células del cuerpo</strong>
              <span className={styles.nivelDescripcion}>Reciben T3/T4 y regulan el metabolismo</span>
            </div>

            {/* Flecha de feedback */}
            <div
              className={`${styles.flechaFeedback} ${feedbackActivo ? styles.flechaFeedbackActiva : ''}`}
              aria-label="Retroalimentación negativa: T3/T4 altas reducen la señal"
            >
              <span className={styles.flechaFeedbackLinea} aria-hidden="true" />
              <span className={styles.flechaFeedbackEtiqueta}>
                Feedback negativo: T3/T4 altas → hipotálamo e hipófisis reducen TRH/TSH
              </span>
            </div>
          </div>

          <button
            className={styles.btnFeedback}
            onClick={() => setFeedbackActivo(prev => !prev)}
          >
            {feedbackActivo ? 'Ocultar el feedback' : 'Ver cómo funciona el feedback'}
          </button>

          {feedbackActivo && (
            <p className={styles.textoBucle}>
              Cuando el tiroides produce suficiente T3 y T4, el propio cuerpo reduce la señal de
              estimulación — un sistema de autorregulación muy preciso.
            </p>
          )}
        </section>

        {/* Bloque 2 — T3 vs T4 */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>T3 vs T4: Las Hormonas Tiroideas</h2>
          <p className={styles.subtituloSeccion}>
            El tiroides no produce una sola hormona, sino dos con roles distintos.
          </p>

          <div className={styles.tarjetasHormonas}>
            {/* T4 */}
            <div className={styles.tarjetaHormona}>
              <div className={styles.tarjetaHormonaCabecera}>
                <span className={styles.tarjetaHormonaIcono} aria-hidden="true">🔵</span>
                <h3>T4 — Tiroxina</h3>
                <span className={styles.tarjetaHormonaBadge}>Forma principal de producción</span>
              </div>
              <ul className={styles.tarjetaHormonaLista}>
                <li>
                  <strong>Producción:</strong> el tiroides produce ~80-85% del total como T4
                </li>
                <li>
                  <strong>Forma «reserva»:</strong> circula por la sangre sin actuar directamente
                </li>
                <li>
                  <strong>Conversión:</strong> en los tejidos, la T4 se convierte en T3 (la forma activa)
                </li>
                <li>
                  <strong>Analogía:</strong> como un precursor que se activa donde se necesita
                </li>
              </ul>
            </div>

            {/* T3 */}
            <div className={styles.tarjetaHormona}>
              <div className={styles.tarjetaHormonaCabecera}>
                <span className={styles.tarjetaHormonaIcono} aria-hidden="true">🟢</span>
                <h3>T3 — Triyodotironina</h3>
                <span className={`${styles.tarjetaHormonaBadge} ${styles.tarjetaHormonaBadgeActiva}`}>Forma activa</span>
              </div>
              <ul className={styles.tarjetaHormonaLista}>
                <li>
                  <strong>Potencia:</strong> 3-4 veces más potente que la T4
                </li>
                <li>
                  <strong>Origen:</strong> ~80% proviene de la conversión de T4 en tejidos periféricos
                </li>
                <li>
                  <strong>Acción:</strong> actúa sobre receptores en el núcleo de las células
                </li>
                <li>
                  <strong>Efecto:</strong> activa la expresión de genes relacionados con el metabolismo
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.notaYodo}>
            <span aria-hidden="true">🧂</span>{' '}
            <strong>El papel del yodo:</strong> El tiroides necesita yodo para fabricar T3 y T4. En España,
            la sal yodada y el pescado son las principales fuentes alimentarias.
          </div>
        </section>

        {/* Bloque 3 — Comparativa hipo vs hiper */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>Tiroides Hipoactivo vs Hiperactivo: Diferencias Fisiológicas</h2>
          <p className={styles.subtituloSeccion}>
            Dos estados fisiológicos opuestos con consecuencias distintas en el organismo.
          </p>

          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th className={styles.thAspecto}>Aspecto</th>
                  <th className={`${styles.thEstado} ${styles.estadoHipo}`}>Tiroides hipoactivo</th>
                  <th className={`${styles.thEstado} ${styles.estadoHiper}`}>Tiroides hiperactivo</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((fila, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? styles.trPar : styles.trImpar}>
                    <td className={styles.tdAspecto}>{fila.aspecto}</td>
                    <td className={`${styles.tdEstado} ${styles.tdHipo}`}>{fila.hipoactivo}</td>
                    <td className={`${styles.tdEstado} ${styles.tdHiper}`}>{fila.hiperactivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.notaComparativa}>
            Esta comparativa describe diferencias fisiológicas generales entre dos estados del tiroides.
            El diagnóstico y seguimiento clínico corresponde exclusivamente al médico.
          </p>
        </section>

        {/* Bloque 4 — Factores que afectan al tiroides */}
        <section className={styles.seccion}>
          <h2 className={styles.tituloSeccion}>¿Qué Afecta al Tiroides?</h2>
          <p className={styles.subtituloSeccion}>
            Factores fisiológicos conocidos que pueden influir en el funcionamiento del tiroides.
          </p>

          <div className={styles.gridFactores}>
            {FACTORES_TIROIDEO.map((factor, idx) => (
              <button
                key={idx}
                className={`${styles.factorCard} ${factorSeleccionado === idx ? styles.factorCardActiva : ''}`}
                onClick={() => toggleFactor(idx)}
                aria-expanded={factorSeleccionado === idx}
              >
                <span className={styles.factorIcono} aria-hidden="true">{factor.icono}</span>
                <strong className={styles.factorTitulo}>{factor.titulo}</strong>
                {factorSeleccionado === idx && (
                  <span className={styles.factorDesc}>{factor.descripcion}</span>
                )}
              </button>
            ))}
          </div>

          <p className={styles.notaFactores}>
            Estos son factores fisiológicos conocidos. Consulta con tu médico para cualquier duda sobre
            tu salud tiroidea.
          </p>
        </section>

        {/* EducationalSection */}
        <EducationalSection title="Profundiza en el tiroides" subtitle="Hormonas tiroideas, eje de regulación y fisiología">
          <div className={styles.educativo}>
            <div className={styles.educativoBloque}>
              <h4>¿Dónde está el tiroides y qué forma tiene?</h4>
              <p>
                El tiroides es una glándula con forma de mariposa situada en la parte anterior del cuello,
                justo debajo de la laringe y frente a la tráquea. Pesa entre 20 y 30 gramos en un adulto
                sano y está formado por dos lóbulos unidos por un istmo central.
              </p>
            </div>

            <div className={styles.educativoBloque}>
              <h4>La glándula paratiroides: no confundir con el tiroides</h4>
              <p>
                Detrás del tiroides se encuentran cuatro pequeñas glándulas llamadas paratiroides. A pesar
                del nombre similar, su función es completamente diferente: regulan el calcio en sangre
                mediante la hormona PTH (parathormona), sin intervención en el metabolismo general.
              </p>
            </div>

            <div className={styles.educativoBloque}>
              <h4>Calcitonina: la tercera hormona tiroidea</h4>
              <p>
                Además de T3 y T4, el tiroides produce calcitonina, sintetizada por las células C o
                parafoliculares. Su función principal es reducir el calcio en sangre favoreciendo su
                depósito en los huesos — un efecto contrario al de la PTH paratiroidea.
              </p>
            </div>

            <div className={styles.educativoBloque}>
              <h4>¿Qué es la ecografía de tiroides y para qué sirve?</h4>
              <p>
                La ecografía tiroidea es una técnica de imagen que usa ultrasonidos para obtener imágenes
                del tejido tiroideo en tiempo real. Permite visualizar el tamaño y la textura de la
                glándula, así como detectar nódulos o alteraciones estructurales. Es una prueba no invasiva
                y sin radiación ionizante.
              </p>
            </div>

            <div className={styles.educativoBloque}>
              <h4>El tiroides en la infancia: importancia para el desarrollo cognitivo</h4>
              <p>
                Las hormonas tiroideas son esenciales para el desarrollo del sistema nervioso central en
                los primeros años de vida. El hipotiroidismo congénito, si no se detecta y trata a tiempo,
                puede afectar al desarrollo cognitivo. Por eso en España se realiza la prueba del talón
                en recién nacidos, que incluye el cribado neonatal de la función tiroidea.
              </p>
            </div>

            <div className={styles.warningBox} role="note">
              <strong>Nota educativa:</strong> Esta app explica el funcionamiento del tiroides con fines
              educativos. No interpretes estos contenidos como orientación médica. Si tienes preguntas
              sobre tu salud tiroidea, consulta con tu médico.
            </div>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-tiroides')} />
        <ShareCard appName="visualizador-tiroides" />
      </main>

      <Footer appName="visualizador-tiroides" />
    </div>
  );
}
