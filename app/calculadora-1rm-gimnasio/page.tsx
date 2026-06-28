'use client';
// @disclaimer: exempt

import { useState } from 'react';
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
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { calcular1RM, Resultado1RM } from '@/lib/calculadoras/deporte';

export default function Calculadora1RMGimnasioPage() {
  const [peso, setPeso] = useState('100');
  const [repeticiones, setRepeticiones] = useState('5');
  const [resultado, setResultado] = useState<Resultado1RM | null>(null);

  const calcular = () => {
    const pesoNum = parseFloat(peso.replace(',', '.'));
    const repsNum = parseInt(repeticiones, 10);

    if (isNaN(pesoNum) || pesoNum <= 0 || isNaN(repsNum) || repsNum < 1) return;

    const res = calcular1RM(pesoNum, repsNum);
    setResultado(res);
  };

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
              label="Número de repeticiones (1–12)"
              placeholder="5"
            />
          </div>

          <button
            type="button"
            onClick={calcular}
            className={styles.btnPrimary}
            aria-label="Calcular repetición máxima"
          >
            Calcular 1RM
          </button>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <h2 className={styles.panelTitle}>Resultados</h2>

              {/* Advertencia si procede */}
              {resultado.advertencia && (
                <div className={styles.warningBox} role="alert" aria-live="polite">
                  <span aria-hidden="true">⚠️</span> {resultado.advertencia}
                </div>
              )}

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
                <div className={styles.resultCardMediaWrapper}>
                  <ResultCard
                    title="Media (más fiable)"
                    value={`${formatNumber(resultado.media, 1)} kg`}
                    variant="highlight"
                    icon="🎯"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyState} aria-label="Sin resultados todavía">
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
                    <td className={styles.tdPct}>{fila.porcentaje}%</td>
                    <td className={styles.tdPeso}>{formatNumber(fila.peso_kg, 1)} kg</td>
                    <td>{fila.repsAproximadas}</td>
                    <td className={styles.tdUso}>{getUsoHabitual(fila.porcentaje)}</td>
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
              <code>1RM = peso × (1 + reps / 30)</code>. Tiende a sobreestimar ligeramente el 1RM
              cuando se realizan muchas repeticiones.
            </li>
            <li>
              <strong>Fórmula de Brzycki (1993):</strong>{' '}
              <code>1RM = peso / (1,0278 − 0,0278 × reps)</code>. Suele ser más conservadora y
              precisa para rangos de 3 a 10 repeticiones.
            </li>
          </ul>
          <p>
            La <strong>media de ambas</strong> ofrece una estimación equilibrada y es la que utilizamos
            como valor principal. Para mayor exactitud, realiza el test siempre con ejercicios bien
            dominados y en condiciones de descanso adecuadas.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo usar la tabla de porcentajes</h2>
          <p>
            Una vez calculado tu 1RM estimado, la tabla de porcentajes te indica qué peso usar en cada
            sesión según tu objetivo de entrenamiento:
          </p>
          <ul>
            <li><strong>85–100%:</strong> Entrenamiento de fuerza máxima (1–6 repeticiones).</li>
            <li><strong>67–85%:</strong> Hipertrofia muscular (6–12 repeticiones).</li>
            <li><strong>50–67%:</strong> Resistencia muscular y técnica (más de 12 repeticiones).</li>
          </ul>
          <p>
            Por ejemplo, si tu 1RM en press de banca es 100 kg y quieres trabajar hipertrofia, deberías
            usar entre 67 y 85 kg (67–85% del 1RM) para 6–12 repeticiones.
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
              <strong>Bloque de fuerza:</strong> 4–6 semanas trabajando al 80–90% del 1RM con 3–5 repeticiones.
            </li>
            <li>
              <strong>Bloque de hipertrofia:</strong> 4–8 semanas al 65–80% con 6–12 repeticiones.
            </li>
            <li>
              <strong>Semana de descarga:</strong> Cada 4–6 semanas, reducir la carga al 50–60% para
              facilitar la recuperación y consolidar las adaptaciones.
            </li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Errores comunes al calcular el 1RM</h2>
          <ul>
            <li>
              <strong>Usar demasiadas repeticiones:</strong> Las fórmulas son menos precisas con más de
              10–12 repeticiones. Idealmente, realiza el test con 3–6 repeticiones al máximo esfuerzo.
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
      <RelatedApps apps={getRelatedApps('calculadora-1rm-gimnasio')} />

      {/* Tarjeta de compartir */}
      <ShareCard appName="calculadora-1rm-gimnasio" />

      {/* Footer */}
      <Footer appName="calculadora-1rm-gimnasio" />
    </div>
  );
}

// Helper local: descriptor de uso habitual por porcentaje
function getUsoHabitual(porcentaje: number): string {
  if (porcentaje === 100) return 'Test de fuerza máxima';
  if (porcentaje >= 90)  return 'Fuerza máxima';
  if (porcentaje >= 80)  return 'Fuerza + hipertrofia';
  if (porcentaje >= 70)  return 'Hipertrofia';
  if (porcentaje >= 65)  return 'Hipertrofia + resistencia';
  return 'Resistencia muscular';
}
