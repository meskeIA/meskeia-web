'use client';
// @disclaimer: exempt
import { useState } from 'react';
import styles from './CalculadoraTiemposRunning.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularPrediccionRunning, type ResultadoPrediccionRunning } from '@/lib/calculadoras/deporte';
import { formatNumber } from '@/lib';

export default function CalculadoraTiemposRunningPage() {
  const [distanciaBase, setDistanciaBase] = useState<number>(10);
  const [horas, setHoras] = useState<number>(0);
  const [minutos, setMinutos] = useState<number>(50);
  const [segundos, setSegundos] = useState<number>(0);
  const [distanciaObjetivo, setDistanciaObjetivo] = useState<number>(42.195);
  const [resultado, setResultado] = useState<ResultadoPrediccionRunning | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = () => {
    setError(null);

    if (distanciaBase <= 0) {
      setError('La distancia base debe ser mayor que 0.');
      return;
    }
    if (distanciaObjetivo <= 0) {
      setError('La distancia objetivo debe ser mayor que 0.');
      return;
    }

    const tiempoTotal_s = horas * 3600 + minutos * 60 + segundos;
    if (tiempoTotal_s <= 0) {
      setError('El tiempo de referencia debe ser mayor que 0.');
      return;
    }

    const res = calcularPrediccionRunning(distanciaBase, tiempoTotal_s, distanciaObjetivo);
    setResultado(res);
  };

  const distanciasEstandar = [
    { valor: 1, label: '1 km' },
    { valor: 5, label: '5 km' },
    { valor: 10, label: '10 km' },
    { valor: 15, label: '15 km' },
    { valor: 21.097, label: 'Media maratón (21,1 km)' },
    { valor: 42.195, label: 'Maratón (42,2 km)' },
  ];

  const bloqueEducativo = {
    intro: 'La fórmula Riegel es el modelo matemático más usado en running para predecir tiempos en diferentes distancias. Fue desarrollada por Peter Riegel en 1977 y publicada en el American Scientist.',
    tablaComparativa: [
      { aspecto: 'Fórmula Riegel', descripcion: 'T2 = T1 × (D2/D1)^1,06 — la base de toda predicción de tiempos' },
      { aspecto: 'Exponente 1,06', descripcion: 'Refleja la fatiga acumulada: a mayor distancia, el pace se hace más lento' },
      { aspecto: 'Distancia base ideal', descripcion: 'Cuanto más cercana a la distancia objetivo, más precisa es la predicción' },
      { aspecto: 'Carrera reciente', descripcion: 'Usa un tiempo en competición, no en entrenamiento, para mayor exactitud' },
      { aspecto: 'Limitación altitude', descripcion: 'No contempla diferencias de altimetría entre recorridos' },
      { aspecto: 'Limitación ultra', descripcion: 'Para distancias superiores a 42 km la predicción tiende a ser optimista' },
    ],
    escenarios: [
      { titulo: 'Tengo un 10K reciente', descripcion: 'Es la distancia base más popular. Úsalo para predecir media maratón o maratón con buena fiabilidad.' },
      { titulo: 'Solo tengo un 5K', descripcion: 'Válido, pero la predicción para maratón tendrá más margen de error por el ratio de distancias elevado (8x).' },
      { titulo: 'Quiero saber mi ritmo objetivo', descripcion: 'El pace predicho te indica el ritmo medio que deberías mantener en carrera para lograr el tiempo estimado.' },
      { titulo: 'Planeo mi primera maratón', descripcion: 'Introduce tu mejor media maratón para obtener una estimación conservadora y realista de tu tiempo en maratón.' },
    ],
    faq: [
      { pregunta: '¿Por qué el exponente es 1,06?', respuesta: 'Riegel lo determinó empíricamente analizando miles de récords mundiales. Representa cómo la fatiga escala con la distancia para corredores medios.' },
      { pregunta: '¿Es exacta la predicción?', respuesta: 'Para diferencias de distancia de hasta 3-4x y recorridos similares en perfil, el margen de error suele ser del 3-7%. Para ratios mayores o en condiciones muy distintas, el error puede ser superior.' },
      { pregunta: '¿Puede usarse para cualquier deporte de resistencia?', respuesta: 'La fórmula Riegel se aplica principalmente a running. Existen variantes con exponentes distintos para ciclismo o natación.' },
      { pregunta: '¿Cómo influye el terreno?', respuesta: 'La fórmula no tiene en cuenta el desnivel. Una predicción para montaña requeriría ajustes adicionales al tiempo estimado.' },
      { pregunta: '¿Es útil para entrenar por zonas?', respuesta: 'Sí: conocer el pace objetivo de tu próxima carrera permite calcular zonas de entrenamiento para tus sesiones específicas.' },
    ],
    pasos: [
      { paso: '1', descripcion: 'Selecciona una carrera reciente como referencia: 5K, 10K o media maratón en competición.' },
      { paso: '2', descripcion: 'Introduce la distancia base y tu tiempo oficial en la herramienta.' },
      { paso: '3', descripcion: 'Selecciona la distancia objetivo o introduce una personalizada.' },
      { paso: '4', descripcion: 'Revisa el tiempo predicho y el pace medio: úsalos como guía para tu ritmo de carrera.' },
      { paso: '5', descripcion: 'Compara con las predicciones para todas las distancias estándar para tener una visión global de tu nivel.' },
    ],
    tips: [
      'Usa tiempos de competición, no de entrenamiento: la adrenalina y el ambiente de carrera cambian el rendimiento.',
      'La media maratón es la mejor base para predecir el maratón, ya que el ratio 2x minimiza el error de la fórmula.',
      'Si el resultado para maratón te parece muy optimista, aplica un 5-10% de margen extra para tu primer maratón.',
      'Recalcula tus predicciones cada temporada: tu forma física cambia y las predicciones deben actualizarse.',
    ],
    errores: [
      'Usar tiempos de entrenamiento como base: sobreestiman el rendimiento en competición.',
      'Ignorar el aviso de ratio alto: si la distancia objetivo es más de 4 veces la base, el margen de error crece significativamente.',
      'Confundir pace (min/km) con velocidad (km/h): el pace aumenta (empeora) a mayor distancia, no disminuye.',
      'Asumir que la predicción es un objetivo cerrado: es una estimación, no un límite. El entrenamiento y el día de carrera también cuentan.',
    ],
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Predictor de Tiempos de Running</h1>
        <p className={styles.heroSubtitle}>
          Predice tus tiempos en cualquier distancia con la fórmula Riegel
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <section className={styles.form}>
          <h2 className={styles.sectionTitle}>Datos de referencia</h2>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="distanciaBase">
              Distancia base (km)
            </label>
            <select
              id="distanciaBase"
              className={styles.select}
              value={distanciaBase}
              onChange={(e) => setDistanciaBase(parseFloat(e.target.value))}
            >
              {distanciasEstandar.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.label}
                </option>
              ))}
              <option value="0">Distancia personalizada</option>
            </select>
            {distanciaBase === 0 && (
              <input
                type="number"
                className={styles.input}
                placeholder="Ej: 8"
                min="0.1"
                step="0.1"
                onChange={(e) => setDistanciaBase(parseFloat(e.target.value) || 0)}
              />
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tiempo de referencia</label>
            <div className={styles.timeInputs}>
              <div className={styles.timeField}>
                <input
                  type="number"
                  className={styles.timeInput}
                  value={horas}
                  min={0}
                  max={23}
                  onChange={(e) => setHoras(Math.max(0, parseInt(e.target.value) || 0))}
                  aria-label="Horas"
                />
                <span className={styles.timeLabel}>h</span>
              </div>
              <div className={styles.timeField}>
                <input
                  type="number"
                  className={styles.timeInput}
                  value={minutos}
                  min={0}
                  max={59}
                  onChange={(e) => setMinutos(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  aria-label="Minutos"
                />
                <span className={styles.timeLabel}>min</span>
              </div>
              <div className={styles.timeField}>
                <input
                  type="number"
                  className={styles.timeInput}
                  value={segundos}
                  min={0}
                  max={59}
                  onChange={(e) => setSegundos(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  aria-label="Segundos"
                />
                <span className={styles.timeLabel}>seg</span>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="distanciaObjetivo">
              Distancia objetivo (km)
            </label>
            <select
              id="distanciaObjetivo"
              className={styles.select}
              value={distanciaObjetivo}
              onChange={(e) => setDistanciaObjetivo(parseFloat(e.target.value))}
            >
              {distanciasEstandar.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.label}
                </option>
              ))}
              <option value="0">Distancia personalizada</option>
            </select>
            {distanciaObjetivo === 0 && (
              <input
                type="number"
                className={styles.input}
                placeholder="Ej: 30"
                min="0.1"
                step="0.1"
                onChange={(e) => setDistanciaObjetivo(parseFloat(e.target.value) || 0)}
              />
            )}
          </div>

          {error && (
            <div className={styles.errorBox} role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button
            className={styles.btnCalcular}
            onClick={calcular}
            type="button"
          >
            Calcular predicción
          </button>
        </section>

        {resultado && (
          <section className={styles.resultados} aria-live="polite">
            <h2 className={styles.sectionTitle}>Resultado</h2>

            <div className={styles.resultGrid}>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Tiempo estimado</span>
                <span className={styles.resultValue}>{resultado.tiempoFormateado}</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Pace medio</span>
                <span className={styles.resultValue}>{resultado.paceFormateado}</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Velocidad media</span>
                <span className={styles.resultValue}>{formatNumber(resultado.velocidad_km_h, 1)} km/h</span>
              </div>
            </div>

            {resultado.advertencia && (
              <div className={styles.warningBox} role="alert">
                <span aria-hidden="true">⚠️</span> {resultado.advertencia}
              </div>
            )}

            <h3 className={styles.tablaTitle}>Predicciones para distancias estándar</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tablaPredicciones}>
                <thead>
                  <tr>
                    <th>Distancia</th>
                    <th>Tiempo estimado</th>
                    <th>Pace</th>
                    <th>Velocidad</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.prediccionesEstandar.map((pred) => (
                    <tr
                      key={pred.distancia_km}
                      className={pred.distancia_km === distanciaObjetivo ? styles.rowDestacada : ''}
                    >
                      <td>{pred.nombre}</td>
                      <td>{pred.tiempoFormateado}</td>
                      <td>{pred.paceFormateado}</td>
                      <td>{formatNumber(3600 / pred.pace_s_km, 1)} km/h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <EducationalSection
        title="Fórmula Riegel y predicción de tiempos"
        subtitle="Cómo funciona la predicción y cómo usar los resultados"
      >
        <p>{bloqueEducativo.intro}</p>

        <h4>Conceptos clave</h4>
        <table className={styles.tablaEducativa}>
          <thead>
            <tr><th>Aspecto</th><th>Descripción</th></tr>
          </thead>
          <tbody>
            {bloqueEducativo.tablaComparativa.map((row) => (
              <tr key={row.aspecto}>
                <td><strong>{row.aspecto}</strong></td>
                <td>{row.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4>Casos de uso habituales</h4>
        <ul>
          {bloqueEducativo.escenarios.map((s) => (
            <li key={s.titulo}><strong>{s.titulo}:</strong> {s.descripcion}</li>
          ))}
        </ul>

        <h4>Preguntas frecuentes</h4>
        <dl>
          {bloqueEducativo.faq.map((item) => (
            <div key={item.pregunta}>
              <dt><strong>{item.pregunta}</strong></dt>
              <dd>{item.respuesta}</dd>
            </div>
          ))}
        </dl>

        <h4>Cómo sacar el máximo partido</h4>
        <ol>
          {bloqueEducativo.pasos.map((p) => (
            <li key={p.paso}>{p.descripcion}</li>
          ))}
        </ol>

        <h4>Consejos prácticos</h4>
        <ul>
          {bloqueEducativo.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>

        <h4>Errores frecuentes a evitar</h4>
        <ul>
          {bloqueEducativo.errores.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-tiempos-running')} />
      <ShareCard appName="calculadora-tiempos-running" />
      <Footer appName="calculadora-tiempos-running" />
    </div>
  );
}
