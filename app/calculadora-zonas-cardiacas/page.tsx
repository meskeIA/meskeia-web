'use client';

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularZonasCardiacas, type ZonaCardiaca } from '@/lib/calculadoras/deporte';
import styles from './CalculadoraZonasCardiacas.module.css';

// Colores por zona para identificación visual rápida
const ZONA_COLORES: Record<number, string> = {
  1: styles.zona1,
  2: styles.zona2,
  3: styles.zona3,
  4: styles.zona4,
  5: styles.zona5,
};

export default function CalculadoraZonasCardiacasPage() {
  const [edad, setEdad] = useState<number>(30);
  const [fcReposo, setFcReposo] = useState<number>(60);
  const [fcMaximaCustom, setFcMaximaCustom] = useState<string>('');
  const [usarFcMaxCustom, setUsarFcMaxCustom] = useState<boolean>(false);
  const [resultado, setResultado] = useState<ReturnType<typeof calcularZonasCardiacas> | null>(null);
  const [errores, setErrores] = useState<string[]>([]);

  const calcular = () => {
    const errs: string[] = [];

    if (isNaN(edad) || edad < 10 || edad > 100) {
      errs.push('La edad debe estar entre 10 y 100 años.');
    }
    if (isNaN(fcReposo) || fcReposo < 20 || fcReposo > 120) {
      errs.push('La FC en reposo debe estar entre 20 y 120 ppm.');
    }

    let fcMax: number | undefined = undefined;
    if (usarFcMaxCustom) {
      const val = parseInt(fcMaximaCustom);
      if (isNaN(val) || val < 100 || val > 250) {
        errs.push('La FC máxima medida debe estar entre 100 y 250 ppm.');
      } else {
        fcMax = val;
      }
    }

    if (errs.length > 0) {
      setErrores(errs);
      setResultado(null);
      return;
    }

    setErrores([]);
    setResultado(calcularZonasCardiacas(edad, fcReposo, fcMax));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">❤️</span> Calculadora de Zonas Cardíacas</h1>
        <p>
          Calcula tus 5 zonas de entrenamiento personalizadas con la fórmula de Karvonen.
          Introduce tu edad y frecuencia cardíaca en reposo para obtener rangos exactos.
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}>Tus datos</h2>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="edad-input" className={styles.label}>
                Edad (años)
              </label>
              <input
                id="edad-input"
                type="number"
                className={styles.input}
                value={edad}
                onChange={(e) => setEdad(parseInt(e.target.value))}
                min={10}
                max={100}
                inputMode="numeric"
                autoComplete="off"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="fc-reposo-input" className={styles.label}>
                FC en reposo (ppm)
                <span className={styles.labelHint}>Mídela al despertarte antes de levantarte</span>
              </label>
              <input
                id="fc-reposo-input"
                type="number"
                className={styles.input}
                value={fcReposo}
                onChange={(e) => setFcReposo(parseInt(e.target.value))}
                min={20}
                max={120}
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Toggle FC máxima */}
          <div className={styles.toggleRow}>
            <button
              type="button"
              role="switch"
              aria-checked={usarFcMaxCustom}
              className={`${styles.toggleBtn} ${usarFcMaxCustom ? styles.toggleActive : ''}`}
              onClick={() => setUsarFcMaxCustom((v) => !v)}
            >
              <span className={styles.toggleThumb} />
            </button>
            <span className={styles.toggleLabel}>
              Introducir FC máxima medida (más precisa que 220 − edad)
            </span>
          </div>

          {usarFcMaxCustom && (
            <div className={styles.inputGroup}>
              <label htmlFor="fc-max-input" className={styles.label}>
                FC máxima medida (ppm)
                <span className={styles.labelHint}>Obtenida en test de esfuerzo o prueba máxima</span>
              </label>
              <input
                id="fc-max-input"
                type="number"
                className={styles.input}
                value={fcMaximaCustom}
                onChange={(e) => setFcMaximaCustom(e.target.value)}
                min={100}
                max={250}
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ej: 185"
              />
            </div>
          )}

          {errores.length > 0 && (
            <div role="alert" aria-live="polite" className={styles.errorBox}>
              {errores.map((err, i) => (
                <p key={i} className={styles.errorMsg}>{err}</p>
              ))}
            </div>
          )}

          <button
            type="button"
            className={styles.btnCalcular}
            onClick={calcular}
          >
            Calcular zonas
          </button>
        </div>

        {/* Resultados */}
        {resultado && (
          <div className={styles.resultadoSection}>
            <h2 className={styles.sectionTitle}>Tus zonas cardíacas</h2>

            {/* Resumen de datos */}
            <div className={styles.resumenGrid}>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>FC máxima</span>
                <span className={styles.resumenValue}>{resultado.fcMax} ppm</span>
                {resultado.fcMaxEstimada && (
                  <span className={styles.resumenNote}>Estimada (220 − {edad})</span>
                )}
                {!resultado.fcMaxEstimada && (
                  <span className={styles.resumenNote}>Medida manualmente</span>
                )}
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>FC en reposo</span>
                <span className={styles.resumenValue}>{resultado.fcReposo} ppm</span>
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>FC de reserva</span>
                <span className={styles.resumenValue}>{resultado.fcReserva} ppm</span>
                <span className={styles.resumenNote}>FCmax − FC reposo</span>
              </div>
            </div>

            {/* Tabla de zonas */}
            <div className={styles.tableWrapper}>
              <table className={styles.zonasTable}>
                <thead>
                  <tr>
                    <th className={styles.thZona}>Zona</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Rango FC</th>
                    <th>% Reserva</th>
                    <th>Beneficio principal</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.zonas.map((zona: ZonaCardiaca) => (
                    <tr key={zona.zona} className={`${styles.zonaRow} ${ZONA_COLORES[zona.zona]}`}>
                      <td className={styles.tdZona}>
                        <span className={styles.zonaNumero}>Z{zona.zona}</span>
                      </td>
                      <td className={styles.tdNombre}>{zona.nombre}</td>
                      <td className={styles.tdDesc}>{zona.descripcion}</td>
                      <td className={styles.tdRango}>
                        <strong>{zona.fcMin} – {zona.fcMax}</strong>
                        <span className={styles.tdRangoUnit}> ppm</span>
                      </td>
                      <td className={styles.tdPct}>
                        {zona.porcentajeMin} – {zona.porcentajeMax}%
                      </td>
                      <td className={styles.tdBeneficio}>{zona.beneficioPrincipal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Barra visual de zonas */}
            <div className={styles.barraZonas} aria-hidden="true">
              {resultado.zonas.map((zona: ZonaCardiaca) => (
                <div
                  key={zona.zona}
                  className={`${styles.barraSegmento} ${ZONA_COLORES[zona.zona]}`}
                  title={`Z${zona.zona}: ${zona.nombre} (${zona.fcMin}–${zona.fcMax} ppm)`}
                >
                  <span className={styles.barraNombre}>Z{zona.zona}</span>
                  <span className={styles.barraRango}>{zona.fcMin}–{zona.fcMax}</span>
                </div>
              ))}
            </div>

            {resultado.fcMaxEstimada && (
              <p className={styles.notaEstimada}>
                <span aria-hidden="true">ℹ️</span>{' '}
                La FC máxima estimada (220 − edad) puede variar hasta ±10–20 ppm en personas reales.
                Para resultados más precisos, mide tu FCmax real con un test de esfuerzo progresivo.
              </p>
            )}
          </div>
        )}

        <DisclaimerCard variant="general" severity="high" collapsible={false} />

        <EducationalSection
          title="Guía de Zonas Cardíacas y Entrenamiento"
          subtitle="Cómo usar las zonas para mejorar tu rendimiento"
          icon="❤️"
        >
          <h3 className={styles.eduSubtitle}>¿Qué es la fórmula Karvonen?</h3>
          <p className={styles.guideParagraph}>
            La fórmula de <strong>Karvonen</strong> (o método de la frecuencia cardíaca de reserva)
            calcula las zonas a partir de la diferencia entre la FC máxima y la FC en reposo, lo que
            la hace más individualizada que las fórmulas basadas solo en la FCmax. La FC de reserva
            es ese margen que tiene el corazón para responder al esfuerzo.
          </p>
          <p className={styles.guideParagraph}>
            La fórmula para cada límite de zona es:
          </p>
          <div className={styles.formulaBox}>
            <code className={styles.formulaTex}>FC objetivo = FC reposo + (% × FC reserva)</code>
            <p className={styles.formulaCaption}>donde FC reserva = FC máxima − FC reposo</p>
          </div>

          <h3 className={styles.eduSubtitle}>Karvonen vs otras fórmulas</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Fórmula</th>
                  <th>Cómo calcula</th>
                  <th>Ventajas</th>
                  <th>Limitaciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Karvonen</strong></td>
                  <td>FC reposo + (% × FC reserva)</td>
                  <td>Personalizada por FC reposo; más precisa para condición física real</td>
                  <td>Necesita FCmax fiable (error si se usa 220 − edad)</td>
                </tr>
                <tr>
                  <td>% de FCmax simple</td>
                  <td>% × FC máxima</td>
                  <td>Más sencilla de calcular sin datos de reposo</td>
                  <td>Sobrestima el esfuerzo en deportistas con FC reposo baja</td>
                </tr>
                <tr>
                  <td>220 − edad</td>
                  <td>Estimación directa de FCmax</td>
                  <td>Sin test; cálculo inmediato</td>
                  <td>Variabilidad real de ±10–20 ppm por persona</td>
                </tr>
                <tr>
                  <td>Tanaka (208 − 0,7×edad)</td>
                  <td>Estimación más precisa de FCmax</td>
                  <td>Más precisa que 220 − edad en adultos mayores</td>
                  <td>Menos conocida; igual necesita test real para máxima precisión</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Para qué sirve cada zona</h3>
          <div className={styles.escenariosGrid}>
            <div className={`${styles.escenarioCard} ${styles.zona1}`}>
              <h4>Z1 — Recuperación activa (50–60 %)</h4>
              <p>
                Paseo ligero, bicicleta muy suave. Acelera la recuperación sin añadir estrés al
                organismo. Ideal al día siguiente de una sesión intensa o como calentamiento.
              </p>
            </div>
            <div className={`${styles.escenarioCard} ${styles.zona2}`}>
              <h4>Z2 — Base aeróbica (60–70 %)</h4>
              <p>
                El motor de los deportistas de resistencia. Las series largas en esta zona mejoran
                la capacidad de quemar grasa como combustible y aumentan la densidad mitocondrial.
                Se puede mantener una conversación cómoda.
              </p>
            </div>
            <div className={`${styles.escenarioCard} ${styles.zona3}`}>
              <h4>Z3 — Aeróbica (70–80 %)</h4>
              <p>
                Esfuerzo moderado-alto. Mejora la eficiencia cardiovascular y el umbral aeróbico.
                Frecuente en rodajes de calidad. La conversación es posible pero entrecortada.
              </p>
            </div>
            <div className={`${styles.escenarioCard} ${styles.zona4}`}>
              <h4>Z4 — Umbral anaeróbico (80–90 %)</h4>
              <p>
                Esfuerzo alto sostenido. Mejora el umbral de lactato, lo que permite correr más
                rápido antes de acumular fatiga. Series de tempo, intervalos largos, contrarrelojes.
              </p>
            </div>
            <div className={`${styles.escenarioCard} ${styles.zona5}`}>
              <h4>Z5 — Máxima intensidad (90–100 %)</h4>
              <p>
                Intervalos cortos, sprints, picos de esfuerzo. Mejora la capacidad anaeróbica y
                la velocidad punta. Solo sostenible segundos o pocos minutos. Requiere recuperación
                amplia.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo medir tu FCmax real</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Calienta 15–20 minutos</strong>
                <p>
                  Empieza a ritmo suave y sube gradualmente de intensidad. Nunca arranques un test
                  máximo en frío.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Protocolo de incremento</strong>
                <p>
                  Cuesta arriba o en cinta, aumenta la velocidad/inclinación cada 1–2 minutos hasta
                  no poder mantener más el ritmo. Un pulsómetro de pecho da mayor precisión que
                  la muñeca en intensidades altas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Registra el valor máximo</strong>
                <p>
                  El valor más alto registrado en los últimos 30 segundos del esfuerzo es tu FCmax
                  real. Puede diferir ±15 ppm de la estimación 220 − edad.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Repite cada 1–2 años</strong>
                <p>
                  La FCmax disminuye ~1 ppm por año a partir de los 25. Actualiza el valor
                  periódicamente si entrenas con pulsómetro de forma habitual.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Precaución</strong>
                <p>
                  Consulta con un profesional de la salud antes de realizar un test de esfuerzo
                  máximo si llevas tiempo sin entrenar, tienes factores de riesgo cardiovascular o
                  eres mayor de 45 años.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Cuánto tiempo debo pasar en cada zona?</strong>
              <p>
                Depende del objetivo. Para resistencia de base: 70–80 % del volumen en Z1–Z2.
                Para velocidad: añadir bloques de Z4–Z5 con amplia recuperación. La distribución
                80/20 (80 % suave, 20 % intenso) tiene respaldo en estudios con atletas de
                resistencia de alto nivel.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué deportistas de élite tienen FC reposo muy baja?</strong>
              <p>
                El entrenamiento aeróbico aumenta el volumen sistólico (la sangre que el corazón
                bombea por latido), por lo que necesita latir menos veces para el mismo gasto
                cardíaco. FC reposo de 40–50 ppm es habitual en corredores y ciclistas entrenados.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿La FC máxima mejora con el entrenamiento?</strong>
              <p>
                En general no: la FCmax está en gran medida determinada genéticamente y disminuye
                con la edad. Lo que sí mejora con el entrenamiento es el umbral anaeróbico —la
                intensidad a la que empiezas a acumular lactato— que sube hacia porcentajes más
                altos de FCmax.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo medir la FC en reposo con precisión?</strong>
              <p>
                Al despertarte, antes de levantarte, mide la FC durante 1 minuto con un pulsómetro
                o colocando los dedos sobre la arteria carótida o radial. Repítelo 3 días y usa el
                promedio para mayor fiabilidad.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Son las mismas zonas para ciclismo, natación y carrera?</strong>
              <p>
                Los porcentajes son los mismos, pero la FCmax real puede ser diferente por disciplina
                (la carrera suele dar FCmax más alta que el ciclismo o la natación). Lo más preciso
                es medir la FCmax en cada deporte por separado.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Recomendaciones generales</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Pulsómetro de pecho</strong>
                <p>En intensidades Z4–Z5, los sensores de muñeca pueden perder precisión. El pecho ofrece datos más fiables para entrenar por zonas.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <div>
                <strong>Calor y altitud elevan la FC</strong>
                <p>En condiciones de calor o altitud, el corazón late más para el mismo esfuerzo percibido. Ajusta las zonas según las condiciones.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💤</span>
              <div>
                <strong>FC reposo como indicador de recuperación</strong>
                <p>Si tu FC reposo está 5+ ppm por encima de lo habitual al despertarte, puede ser señal de sobreentrenamiento o inicio de enfermedad.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <div>
                <strong>Actualiza los datos regularmente</strong>
                <p>Conforme mejoras, tu FC reposo baja y tu FCmax real puede diferir más de la estimada. Repite la medición cada temporada.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes al entrenar por zonas
            </div>
            <ul className={styles.warningList}>
              <li>
                Entrenar siempre en Z3 ("zona gris"): un error habitual entre deportistas recreativos.
                Es demasiado intenso para ser recuperador y demasiado suave para generar adaptaciones
                de velocidad. Lo óptimo es polarizar entre Z1–Z2 y Z4–Z5.
              </li>
              <li>
                Usar 220 − edad como FCmax sin ajustar: el error puede ser de 15–20 ppm, desplazando
                todas las zonas y haciendo inútil el control por pulso.
              </li>
              <li>
                Ignorar la FC de reposo en el cálculo: sin la FC reposo, las zonas son menos precisas
                y no reflejan tu nivel de condición física actual.
              </li>
              <li>
                Confiar solo en el pulsómetro de muñeca en Z4–Z5: la precisión cae en intensidades
                altas. Mejor usar banda de pecho para sesiones de calidad.
              </li>
              <li>
                Subestimar el valor de la Z1–Z2: la base aeróbica construida en estas zonas es el
                fundamento de cualquier progresión posterior. No las saltes por aburrimiento.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-zonas-cardiacas')} />
        <ShareCard appName="calculadora-zonas-cardiacas" />
      </main>

      <Footer appName="calculadora-zonas-cardiacas" />
    </div>
  );
}
