'use client';
// @disclaimer: exempt

import { useEffect, useRef, useState } from 'react';
import styles from './Calculadora1RMGimnasio.module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  ResultCard,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber, traerALaVista } from '@/lib';
import {
  BANDAS_1RM,
  banda1RM,
  calcular1RM,
  errorEntrada1RM,
  rangoBanda1RM,
  REPS_MAX_1RM,
  Resultado1RM,
} from '@/lib/calculadoras/deporte';

const BANDA_HIPERTROFIA = BANDAS_1RM[1];

export default function Calculadora1RMGimnasioPage() {
  const [peso, setPeso] = useState('100');
  const [repeticiones, setRepeticiones] = useState('5');
  const [resultado, setResultado] = useState<Resultado1RM | null>(null);
  const [error, setError] = useState('');

  const calcular = () => {
    const pesoNum = parseSpanishNumber(peso);
    const repsNum = parseSpanishNumber(repeticiones);

    // Una entrada que no vale se dice y borra el resultado anterior, que ya no es el de estos
    // datos (hallazgo 5251); fuera de 1-12 repeticiones Brzycki se dispara (hallazgo 5250).
    const motivo = errorEntrada1RM(pesoNum, repsNum);
    if (motivo) {
      setError(motivo);
      setResultado(null);
      return;
    }

    setError('');
    setResultado(calcular1RM(pesoNum, repsNum));
  };

  // Por debajo de 1024 px el panel de resultados va debajo del de entrada: tras calcular, si la
  // media no se ve entera, se sube el panel (hallazgo 5252). En escritorio ya se ve y no se mueve.
  const panelResultadosRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (resultado) traerALaVista(panelResultadosRef.current, mediaRef.current);
  }, [resultado]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🏋️</span> Calculadora de 1RM</h1>
        <p className={styles.subtitle}>
          Calcula tu fuerza máxima en cualquier ejercicio con las fórmulas Epley y Brzycki
        </p>
      </header>

      {/* Aviso legal RGPD */}
      <LegalNotice />

      {/* Herramienta principal */}
      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Introduce tus datos</h2>

          <div className={styles.inputGroup}>
            <NumberInput
              value={peso}
              onChange={setPeso}
              label="Peso levantado (kg)"
              placeholder="100"
            />
          </div>

          <div className={styles.inputGroup}>
            <NumberInput
              value={repeticiones}
              onChange={setRepeticiones}
              label={`Número de repeticiones (1–${REPS_MAX_1RM})`}
              placeholder="5"
            />
          </div>

          {/* Sin aria-label: el nombre accesible es el texto visible (WCAG 2.5.3, hallazgo 5253) */}
          <button
            type="button"
            onClick={calcular}
            className={styles.btnPrimary}
          >
            Calcular 1RM
          </button>

          {/* Siempre montada: una región viva que nace con el aviso dentro no se anuncia */}
          <div role="alert" className={styles.errorRegion}>
            {error && (
              <p className={styles.warningBox}>
                <span aria-hidden="true">⚠️</span> {error}
              </p>
            )}
          </div>
        </div>

        <div className={styles.resultsPanel} ref={panelResultadosRef}>
          {/* Región viva siempre montada: al calcular se anuncian las tres cifras (hallazgo 5253) */}
          <div aria-live="polite">
          {resultado && (
            <>
              <h2 className={styles.panelTitle}>Resultados</h2>

              <div className={styles.resultCards}>
                {/* Fórmula Epley */}
                <ResultCard
                  title="Fórmula Epley"
                  value={`${formatNumber(resultado.epley, 1)} kg`}
                  variant="default"
                  icon="📐"
                />

                {/* Fórmula Brzycki */}
                <ResultCard
                  title="Fórmula Brzycki"
                  value={`${formatNumber(resultado.brzycki, 1)} kg`}
                  variant="default"
                  icon="📏"
                />

                {/* Media — resultado principal destacado */}
                <div className={styles.resultCardMediaWrapper} ref={mediaRef}>
                  <ResultCard
                    title="Media de las dos fórmulas"
                    value={`${formatNumber(resultado.media, 1)} kg`}
                    variant="highlight"
                    icon="🎯"
                  />
                </div>
              </div>
            </>
          )}
          </div>
          {!resultado && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon} aria-hidden="true">🏋️</span>
              <p>Introduce el peso y las repeticiones para calcular tu 1RM</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de cargas por porcentaje */}
      {resultado && (
        <div className={styles.tableSection}>
          <h2 className={styles.tableTitle}><span aria-hidden="true">📊</span> Tabla de cargas de entrenamiento</h2>
          <p className={styles.tableSubtitle}>
            Basada en tu 1RM estimado de <strong>{formatNumber(resultado.media, 1)} kg</strong>
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.loadTable} aria-label="Tabla de cargas por porcentaje del 1RM">
              <thead>
                <tr>
                  <th scope="col">% del 1RM</th>
                  <th scope="col">Peso (kg)</th>
                  <th scope="col">Repeticiones aprox.</th>
                  <th scope="col">Uso habitual</th>
                </tr>
              </thead>
              <tbody>
                {resultado.tablaPorcentajes.map((fila) => (
                  <tr
                    key={fila.porcentaje}
                    className={fila.porcentaje === 100 ? styles.rowMax : undefined}
                  >
                    <td className={styles.tdPct}>{`${fila.porcentaje} %`}</td>
                    <td className={styles.tdPeso}>{formatNumber(fila.peso_kg, 1)} kg</td>
                    <td>{fila.repsAproximadas}</td>
                    <td className={styles.tdUso}>{banda1RM(fila.porcentaje).objetivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="Aprende más sobre el 1RM y el entrenamiento de fuerza"
        subtitle="Conceptos clave para optimizar tu rendimiento"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el 1RM?</h2>
          <p>
            El 1RM (del inglés <em>One-Repetition Maximum</em>) es el peso máximo que puedes levantar
            en un ejercicio durante una sola repetición con técnica correcta. Es el indicador de referencia
            para medir la fuerza absoluta en un movimiento específico.
          </p>
          <p>
            Conocer tu 1RM te permite programar el entrenamiento de forma precisa: en lugar de entrenar
            "a ojo", puedes trabajar con porcentajes exactos para cada objetivo (fuerza máxima, hipertrofia,
            resistencia muscular).
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Epley vs. Brzycki: ¿cuál elegir?</h2>
          <p>
            Existen varias fórmulas para estimar el 1RM a partir de un número de repeticiones y un peso.
            Las dos más utilizadas son:
          </p>
          <ul>
            <li>
              <strong>Fórmula de Epley (1985):</strong>{' '}
              <code>1RM = peso × (1 + reps / 30)</code>. Crece en línea recta con las repeticiones.
            </li>
            <li>
              <strong>Fórmula de Brzycki (1993):</strong>{' '}
              <code>1RM = peso / (1,0278 − 0,0278 × reps)</code>. Crece cada vez más deprisa: su
              denominador se acerca a cero a medida que suben las repeticiones (se anula hacia las 37).
            </li>
          </ul>
          <p>
            Las dos dan lo mismo con 10 repeticiones. Por debajo de 10, Epley da una cifra algo mayor;
            por encima, la mayor es Brzycki. Por eso la calculadora solo admite de 1 a {REPS_MAX_1RM}{' '}
            repeticiones.
          </p>
          <p>
            La <strong>media aritmética de las dos</strong> queda entre ambas y es la que utilizamos
            como valor de referencia para la tabla. Para mayor exactitud, realiza el test siempre con
            ejercicios bien dominados y en condiciones de descanso adecuadas.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo usar la tabla de porcentajes</h2>
          <p>
            Una vez calculado tu 1RM estimado, la tabla de porcentajes te indica qué peso usar en cada
            sesión según tu objetivo de entrenamiento:
          </p>
          <ul>
            {BANDAS_1RM.map((b) => (
              <li key={b.objetivo}>
                <strong>{rangoBanda1RM(b)}:</strong> {b.objetivo} ({b.reps} repeticiones).
              </li>
            ))}
          </ul>
          <p>
            Son las bandas orientativas de la NSCA (<em>Essentials of Strength Training and
            Conditioning</em>), las mismas que rotulan la columna «Uso habitual» de la tabla. Por
            ejemplo, si tu 1RM en press de banca es 100 kg y quieres trabajar hipertrofia, usarías
            entre {BANDA_HIPERTROFIA.pctMin} y {BANDA_HIPERTROFIA.pctMax} kg ({rangoBanda1RM(BANDA_HIPERTROFIA)}{' '}
            del 1RM) para {BANDA_HIPERTROFIA.reps} repeticiones.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Periodización básica del entrenamiento</h2>
          <p>
            La periodización consiste en variar sistemáticamente la intensidad y el volumen de entrenamiento
            a lo largo del tiempo para maximizar el progreso y evitar el estancamiento:
          </p>
          <ul>
            <li>
              <strong>Bloque de fuerza:</strong> 4–6 semanas en la banda de fuerza máxima
              ({rangoBanda1RM(BANDAS_1RM[0])} del 1RM, {BANDAS_1RM[0].reps} repeticiones).
            </li>
            <li>
              <strong>Bloque de hipertrofia:</strong> 4–8 semanas en la banda de hipertrofia
              ({rangoBanda1RM(BANDA_HIPERTROFIA)}, {BANDA_HIPERTROFIA.reps} repeticiones).
            </li>
            <li>
              <strong>Semana de descarga:</strong> Cada 4–6 semanas, reducir la carga al 50–60{' '}% para
              facilitar la recuperación y consolidar las adaptaciones.
            </li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Errores comunes al calcular el 1RM</h2>
          <ul>
            <li>
              <strong>Usar demasiadas repeticiones:</strong> Las fórmulas pierden precisión a partir de
              10–12 repeticiones, y la calculadora no admite más de {REPS_MAX_1RM}. Idealmente, realiza
              el test con 3–6 repeticiones al máximo esfuerzo.
            </li>
            <li>
              <strong>No descansar lo suficiente:</strong> El 1RM debe medirse con el sistema nervioso
              fresco, preferiblemente al inicio de la sesión.
            </li>
            <li>
              <strong>Técnica deficiente:</strong> Un 1RM con mala técnica no es representativo ni seguro.
              Prioriza siempre la calidad del movimiento.
            </li>
            <li>
              <strong>Extrapolarlo a ejercicios desconocidos:</strong> El 1RM es específico para cada ejercicio.
              Un 1RM de sentadilla no predice el de peso muerto.
            </li>
            <li>
              <strong>No actualizar el dato:</strong> Tu 1RM cambia con el entrenamiento. Recalcula cada
              4–8 semanas para mantener la programación actualizada.
            </li>
          </ul>
        </section>
      </EducationalSection>

      {/* Apps relacionadas */}
      <RelatedApps />

      {/* Tarjeta de compartir */}
      <ShareCard appName="calculadora-1rm-gimnasio" />

      {/* Footer */}
      <Footer appName="calculadora-1rm-gimnasio" />
    </div>
  );
}
