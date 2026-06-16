'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CalculadoraPaceRunning.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { calcularPaceRunning, ResultadoPaceRunning } from '@/lib/calculadoras/deporte';

export default function CalculadoraPaceRunningPage() {
  const [distancia, setDistancia] = useState<string>('10');
  const [horas, setHoras] = useState<string>('0');
  const [minutos, setMinutos] = useState<string>('50');
  const [segundos, setSegundos] = useState<string>('0');
  const [resultado, setResultado] = useState<ResultadoPaceRunning | null>(null);
  const [error, setError] = useState<string>('');

  const calcular = () => {
    setError('');
    const dist = parseFloat(distancia.replace(',', '.'));
    const h = parseInt(horas) || 0;
    const m = parseInt(minutos) || 0;
    const s = parseInt(segundos) || 0;
    const tiempoTotal_s = h * 3600 + m * 60 + s;

    if (isNaN(dist) || dist <= 0) {
      setError('Introduce una distancia válida mayor que 0.');
      setResultado(null);
      return;
    }
    if (tiempoTotal_s <= 0) {
      setError('Introduce un tiempo válido mayor que 0.');
      setResultado(null);
      return;
    }

    const res = calcularPaceRunning(dist, tiempoTotal_s);
    setResultado(res);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') calcular();
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Pace de Running</h1>
        <p className={styles.subtitle}>
          Calcula tu ritmo, velocidad y proyecciones para cualquier distancia
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Panel de entrada */}
        <section className={styles.inputPanel}>
          <h2 className={styles.sectionTitle}>Introduce tus datos</h2>

          <div className={styles.inputGroup}>
            <label htmlFor="distancia" className={styles.label}>
              Distancia (km)
            </label>
            <input
              id="distancia"
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={distancia}
              onChange={(e) => setDistancia(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
              placeholder="10"
              aria-label="Distancia en kilómetros"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Tiempo</label>
            <div className={styles.tiempoRow}>
              <div className={styles.tiempoField}>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="23"
                  value={horas}
                  onChange={(e) => setHoras(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.input}
                  aria-label="Horas"
                  placeholder="0"
                />
                <span className={styles.tiempoLabel}>h</span>
              </div>
              <div className={styles.tiempoField}>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="59"
                  value={minutos}
                  onChange={(e) => setMinutos(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.input}
                  aria-label="Minutos"
                  placeholder="50"
                />
                <span className={styles.tiempoLabel}>min</span>
              </div>
              <div className={styles.tiempoField}>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="59"
                  value={segundos}
                  onChange={(e) => setSegundos(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.input}
                  aria-label="Segundos"
                  placeholder="0"
                />
                <span className={styles.tiempoLabel}>seg</span>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className={styles.warningBox}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={calcular}
            className={styles.btnPrimary}
            aria-label="Calcular pace"
          >
            Calcular pace
          </button>
        </section>

        {/* Resultados */}
        {resultado && (
          <section className={styles.resultadosPanel} aria-live="polite">

            {/* Resultado principal — pace y velocidad */}
            <div className={styles.resultadosPrincipales}>
              <div className={styles.resultadoCard}>
                <span className={styles.resultadoIcono} aria-hidden="true">🏃</span>
                <span className={styles.resultadoEtiqueta}>Pace</span>
                <span className={styles.paceDestacado}>{resultado.paceFormateado}</span>
              </div>
              <div className={styles.resultadoCard}>
                <span className={styles.resultadoIcono} aria-hidden="true">⚡</span>
                <span className={styles.resultadoEtiqueta}>Velocidad media</span>
                <span className={styles.velocidadDestacada}>
                  {formatNumber(resultado.velocidad_km_h, 1)} km/h
                </span>
              </div>
            </div>

            {/* Proyecciones */}
            <div className={styles.seccionTabla}>
              <h2 className={styles.tablaTitle}>Proyecciones de tiempo</h2>
              <p className={styles.tablaSubtitle}>
                Tiempo estimado manteniendo este pace en otras distancias
              </p>
              <div className={styles.tablaWrapper}>
                <table className={styles.tablaProyecciones} aria-label="Proyecciones de tiempo por distancia">
                  <thead>
                    <tr>
                      <th>Distancia</th>
                      <th>Tiempo estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.proyecciones.map((p) => (
                      <tr key={p.nombre}>
                        <td>{p.nombre}</td>
                        <td className={styles.tiempoProyeccion}>{p.tiempoFormateado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Splits */}
            <div className={styles.seccionTabla}>
              <h2 className={styles.tablaTitle}>Splits por kilómetro</h2>
              <p className={styles.tablaSubtitle}>
                Tiempo acumulado al llegar a cada kilómetro
              </p>
              <div className={styles.tablaSplitsWrapper}>
                <table className={styles.tablaSplits} aria-label="Splits por kilómetro">
                  <thead>
                    <tr>
                      <th>Km</th>
                      <th>Tiempo acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.splits.map((split) => (
                      <tr key={split.km}>
                        <td>{split.km}</td>
                        <td className={styles.tiempoSplit}>{split.tiempoFormateado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        )}
      </main>

      <EducationalSection
        title="Guía sobre el pace en running"
        subtitle="Conceptos clave para entender y mejorar tu ritmo de carrera"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el pace?</h2>
          <p>
            El <strong>pace</strong> (o ritmo) en running indica cuánto tiempo tardas en recorrer
            un kilómetro. Se expresa en minutos y segundos por kilómetro (min:seg/km). Por ejemplo,
            un pace de 5:30 significa que tardas 5 minutos y 30 segundos en correr cada kilómetro.
          </p>
          <p>
            Es la medida de referencia que usan los corredores para planificar sus entrenamientos,
            establecer objetivos de carrera y analizar su progreso.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Pace vs. velocidad: ¿cuál usar?</h2>
          <p>
            El pace y la velocidad expresan la misma información de forma diferente:
          </p>
          <ul>
            <li>
              <strong>Pace (min/km)</strong>: cuánto tiempo por kilómetro. Intuitivo para
              planificar tiempos de llegada y comparar esfuerzo en distintas distancias.
              Estándar en atletismo de fondo.
            </li>
            <li>
              <strong>Velocidad (km/h)</strong>: kilómetros recorridos en una hora. Más
              natural para comparar con otros medios de transporte o en ciclismo.
            </li>
          </ul>
          <p>
            La conversión es sencilla: velocidad (km/h) = 60 ÷ pace (min/km). Un pace de
            5:00 equivale a 12 km/h; un pace de 4:00 equivale a 15 km/h.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo interpretar tu pace</h2>
          <p>
            Estos rangos son orientativos y varían según el nivel, la distancia y las
            condiciones de carrera:
          </p>
          <ul>
            <li><strong>Más de 7:00 min/km</strong>: ritmo de trote suave, recuperación activa o inicio en running.</li>
            <li><strong>6:00–7:00 min/km</strong>: ritmo fácil, típico de rodajes de base.</li>
            <li><strong>5:00–6:00 min/km</strong>: ritmo moderado, habitual en corredores populares.</li>
            <li><strong>4:00–5:00 min/km</strong>: ritmo de competición en corredores intermedios-avanzados.</li>
            <li><strong>3:00–4:00 min/km</strong>: ritmo de competición en corredores avanzados.</li>
            <li><strong>Menos de 3:00 min/km</strong>: nivel de élite.</li>
          </ul>
          <p>
            En la práctica, el <strong>pace óptimo de carrera</strong> depende del terreno, el calor,
            la acumulación de kilómetros semanales y el tipo de entrenamiento. Un mismo corredor
            puede tener paces muy distintos en diferentes contextos.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Entrenamiento por ritmos (zonas de pace)</h2>
          <p>
            Los planes de entrenamiento modernos dividen los entrenamientos según intensidad,
            lo que se traduce en rangos de pace:
          </p>
          <ul>
            <li>
              <strong>Rodaje suave (Z1-Z2)</strong>: entre 60 y 75 segundos más lento que tu pace
              de competición en 10K. Desarrolla la base aeróbica y favorece la recuperación.
            </li>
            <li>
              <strong>Rodaje a tempo (Z3-Z4)</strong>: entre 15 y 30 segundos más lento que el
              pace de 10K. Mejora el umbral de lactato.
            </li>
            <li>
              <strong>Series y repeticiones (Z4-Z5)</strong>: al pace de 5K o más rápido. Aumentan
              la capacidad aeróbica máxima (VO2max) y la economía de carrera.
            </li>
          </ul>
          <p>
            Una distribución habitual en running de resistencia es el 80/20: aproximadamente el
            80% del volumen a ritmos suaves y el 20% a ritmos altos. Esta distribución reduce el
            riesgo de lesión y optimiza la adaptación.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Claves para mejorar el pace</h2>
          <ul>
            <li>
              <strong>Consistencia en el volumen</strong>: correr con regularidad es la base
              del progreso. Aumentar el kilometraje semanal de forma gradual (no más de un
              10% por semana).
            </li>
            <li>
              <strong>Rodajes largos</strong>: la carrera larga semanal desarrolla la resistencia
              aeróbica necesaria para mantener el pace en distancias largas.
            </li>
            <li>
              <strong>Trabajo de calidad</strong>: incluir una o dos sesiones de calidad por semana
              (series, tempo, fartlek) acelera la mejora del pace de competición.
            </li>
            <li>
              <strong>Economía de carrera</strong>: la técnica (cadencia, apoyo del pie, postura)
              influye directamente en cuánto esfuerzo requiere cada pace. Una cadencia en torno a
              170-180 pasos por minuto reduce el impacto y mejora la eficiencia.
            </li>
            <li>
              <strong>Descanso y recuperación</strong>: el progreso ocurre durante el descanso.
              El sueño y los días de recuperación son tan importantes como los entrenamientos.
            </li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-pace-running')} />

      <ShareCard appName="calculadora-pace-running" />

      <Footer appName="calculadora-pace-running" />
    </div>
  );
}
