'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularSWOLF } from '@/lib/calculadoras/deporte';
import type { ResultadoSWOLF } from '@/lib/calculadoras/deporte';
import styles from './CalculadoraSwolfNatacion.module.css';

type MetrosPiscina = 25 | 50;

export default function CalculadoraSwolfNatacionPage() {
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(20);
  const [brazadas, setBrazadas] = useState<number>(18);
  const [metrosPiscina, setMetrosPiscina] = useState<MetrosPiscina>(25);

  const resultado: ResultadoSWOLF = useMemo(
    () => calcularSWOLF(tiempoSegundos, brazadas, metrosPiscina),
    [tiempoSegundos, brazadas, metrosPiscina],
  );

  const nivelClass = {
    elite: styles.elite,
    avanzado: styles.avanzado,
    intermedio: styles.intermedio,
    principiante: styles.principiante,
  }[resultado.nivel];

  const nivelLabel = {
    elite: 'Élite',
    avanzado: 'Avanzado',
    intermedio: 'Intermedio',
    principiante: 'Principiante',
  }[resultado.nivel];

  const handleTiempo = (val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) setTiempoSegundos(n);
  };

  const handleBrazadas = (val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) setBrazadas(n);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>🏊 Calculadora SWOLF</h1>
        <p>Mide tu eficiencia en el agua combinando tiempo y brazadas por largo</p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.calculadora}>
          {/* Selector de piscina */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Longitud de la piscina</label>
            <div className={styles.selectorPiscina} role="group" aria-label="Seleccionar longitud de piscina">
              <button
                className={`${styles.piscinaBtn} ${metrosPiscina === 25 ? styles.piscinaBtnActive : ''}`}
                onClick={() => setMetrosPiscina(25)}
                aria-pressed={metrosPiscina === 25}
              >
                25 m
              </button>
              <button
                className={`${styles.piscinaBtn} ${metrosPiscina === 50 ? styles.piscinaBtnActive : ''}`}
                onClick={() => setMetrosPiscina(50)}
                aria-pressed={metrosPiscina === 50}
              >
                50 m
              </button>
            </div>
          </div>

          {/* Input tiempo */}
          <div className={styles.inputGroup}>
            <label htmlFor="tiempo-input" className={styles.inputLabel}>
              Tiempo por largo (segundos)
            </label>
            <div className={styles.inputRow}>
              <input
                id="tiempo-input"
                type="number"
                min={5}
                max={300}
                step={1}
                value={tiempoSegundos}
                onChange={(e) => handleTiempo(e.target.value)}
                className={styles.numberInput}
                inputMode="numeric"
                aria-describedby="tiempo-hint"
              />
              <span className={styles.inputUnit}>seg / largo</span>
            </div>
            <span id="tiempo-hint" className={styles.inputHint}>
              Tiempo desde el impulso del muro hasta tocar el siguiente
            </span>
          </div>

          {/* Input brazadas */}
          <div className={styles.inputGroup}>
            <label htmlFor="brazadas-input" className={styles.inputLabel}>
              Brazadas por largo
            </label>
            <div className={styles.inputRow}>
              <input
                id="brazadas-input"
                type="number"
                min={1}
                max={100}
                step={1}
                value={brazadas}
                onChange={(e) => handleBrazadas(e.target.value)}
                className={styles.numberInput}
                inputMode="numeric"
                aria-describedby="brazadas-hint"
              />
              <span className={styles.inputUnit}>brazadas</span>
            </div>
            <span id="brazadas-hint" className={styles.inputHint}>
              Cuenta solo los ciclos completos de brazada, sin contar el impulso de salida
            </span>
          </div>
        </div>

        {/* Resultado principal */}
        <div className={styles.resultadoPanel} aria-live="polite">
          <div className={styles.swolfScoreWrapper}>
            <span className={styles.swolfLabel}>Índice SWOLF</span>
            <span className={styles.swolfScore}>{resultado.swolf}</span>
            <span className={`${styles.nivelBadge} ${nivelClass}`} aria-label={`Nivel: ${nivelLabel}`}>
              {nivelLabel}
            </span>
          </div>

          <div className={styles.detalles}>
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Eficiencia</span>
              <span className={styles.detalleValor}>{resultado.eficiencia}</span>
            </div>
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Velocidad media</span>
              <span className={styles.detalleValor}>{resultado.velocidadMedia_min100m}</span>
            </div>
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Descripción</span>
              <span className={styles.detalleValor}>{resultado.descripcionNivel}</span>
            </div>
          </div>

          <div className={styles.consejoBox} role="note" aria-label="Consejo de mejora">
            <span className={styles.consejoIcon} aria-hidden="true">💡</span>
            <div>
              <strong className={styles.consejoTitulo}>Consejo para mejorar</strong>
              <p className={styles.consejoTexto}>{resultado.consejo}</p>
            </div>
          </div>
        </div>

        {/* Referencia de rangos */}
        <div className={styles.referenciaRangos}>
          <h3 className={styles.referenciaTitle}>
            Rangos de referencia para piscina de {metrosPiscina} m
          </h3>
          <div className={styles.rangosGrid}>
            <div className={`${styles.rangoItem} ${styles.elite}`}>
              <span className={styles.rangoNivel}>Élite</span>
              <span className={styles.rangoValor}>≤ {metrosPiscina === 25 ? 25 : 33}</span>
            </div>
            <div className={`${styles.rangoItem} ${styles.avanzado}`}>
              <span className={styles.rangoNivel}>Avanzado</span>
              <span className={styles.rangoValor}>{metrosPiscina === 25 ? '26–30' : '34–38'}</span>
            </div>
            <div className={`${styles.rangoItem} ${styles.intermedio}`}>
              <span className={styles.rangoNivel}>Intermedio</span>
              <span className={styles.rangoValor}>{metrosPiscina === 25 ? '31–38' : '39–46'}</span>
            </div>
            <div className={`${styles.rangoItem} ${styles.principiante}`}>
              <span className={styles.rangoNivel}>Principiante</span>
              <span className={styles.rangoValor}>{metrosPiscina === 25 ? '> 38' : '> 46'}</span>
            </div>
          </div>
        </div>

        <EducationalSection
          title="Guía del Índice SWOLF"
          subtitle="Qué es, cómo se mide y cómo mejorarlo"
          icon="🏊"
        >
          <h3 className={styles.eduSubtitle}>¿Qué es el SWOLF?</h3>
          <p className={styles.guideParagraph}>
            <strong>SWOLF</strong> es un acrónimo del inglés <em>SWimming gOLF</em>: combina el
            número de segundos que tardas en nadar un largo con el número de brazadas que das.
            La fórmula es simple: <strong>SWOLF = tiempo (s) + brazadas</strong>.
          </p>
          <p className={styles.guideParagraph}>
            Al igual que en el golf, donde se busca el menor número de golpes, en natación
            buscas el menor índice SWOLF posible. Un SWOLF bajo indica que nadas rápido
            con pocas brazadas, lo que refleja una técnica eficiente y una buena propulsión
            por ciclo de brazada.
          </p>

          <h3 className={styles.eduSubtitle}>¿Cómo se mide correctamente?</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Prepara un cronómetro</strong>
                <p>Inicia el cronómetro en el momento del impulso desde el muro o la salida.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Cuenta las brazadas completas</strong>
                <p>
                  Cuenta cada ciclo completo (una brazada = cada vez que el mismo brazo entra
                  al agua en crol). No cuentes el impulso de salida ni la llegada.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Para el cronómetro al tocar el muro</strong>
                <p>
                  Registra el tiempo en segundos. Para mayor precisión, haz 3-5 largos
                  y calcula la media.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Suma tiempo + brazadas</strong>
                <p>
                  Si tardas 22 segundos y das 16 brazadas, tu SWOLF es 38. Cuanto más
                  bajo, mejor.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Registra tu progreso</strong>
                <p>
                  Apunta el SWOLF en cada entrenamiento. Verás mejoras a lo largo de semanas
                  de trabajo técnico.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo interpretar los valores</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>SWOLF (25 m)</th>
                  <th>SWOLF (50 m)</th>
                  <th>Perfil típico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Élite</td>
                  <td>≤ 25</td>
                  <td>≤ 33</td>
                  <td>Nadador competitivo o exentrenado de alto nivel</td>
                </tr>
                <tr>
                  <td>Avanzado</td>
                  <td>26–30</td>
                  <td>34–38</td>
                  <td>Nadador federado o con años de práctica técnica</td>
                </tr>
                <tr>
                  <td>Intermedio</td>
                  <td>31–38</td>
                  <td>39–46</td>
                  <td>Nadador recreacional con base técnica aceptable</td>
                </tr>
                <tr>
                  <td>Principiante</td>
                  <td>&gt; 38</td>
                  <td>&gt; 46</td>
                  <td>Aprendizaje técnico en curso</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo mejorar el índice SWOLF</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>⬇️ Reducir brazadas</h4>
              <p>
                Trabaja la deslizamiento y el planeado entre brazadas. Ejercicios como
                el <em>catch-up</em> (esperar a que el brazo avanzado llegue a la cadera
                antes de iniciar la siguiente brazada) aumentan la longitud por ciclo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>⏱️ Reducir el tiempo</h4>
              <p>
                Mejora la patada, el agarre del agua en la fase de tire y la rotación
                del cuerpo. Un mejor agarre da más propulsión por brazada sin añadir ciclos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🔄 Drills de técnica</h4>
              <p>
                <em>Dedos al suelo</em>, <em>bandera de popa</em> (nadar con los pies
                cruzados) y <em>aletas</em> ayudan a sentir el deslizamiento y a
                aumentar la propulsión de patada, reduciendo brazadas necesarias.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>📏 Viraje eficiente</h4>
              <p>
                El viraje suma tiempo pero no brazadas. Un giro de volteo bien ejecutado
                puede ahorrar 0,5–1 segundo por largo, lo que mejora el SWOLF directamente.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Diferencias entre piscinas de 25 m y 50 m</h3>
          <p className={styles.guideParagraph}>
            La piscina de <strong>50 m (larga)</strong> elimina dos virajes por cada 100 m
            frente a la de <strong>25 m (corta)</strong>. Esto tiene dos consecuencias para
            el SWOLF:
          </p>
          <ul className={styles.guideList}>
            <li>
              <strong>Más brazadas por largo</strong>: un largo de 50 m exige más ciclos de
              brazada que dos largos de 25 m juntos, porque sin los virajes (que generan
              impulso) hay que mantener la propulsión más tiempo.
            </li>
            <li>
              <strong>Más tiempo acumulado</strong>: sin el beneficio del impulso del muro
              cada 25 m, el tiempo por metro es ligeramente mayor, especialmente en nadadores
              que aprovechan bien el viraje.
            </li>
            <li>
              <strong>Umbral de élite desplazado</strong>: el SWOLF de referencia es ~8 puntos
              más alto en 50 m que en 25 m para cada nivel equivalente. Por eso la calculadora
              ajusta los rangos automáticamente.
            </li>
          </ul>
          <p className={styles.guideParagraph}>
            En competición, los tiempos en piscina corta suelen ser 1,5–3% más rápidos que
            en piscina larga, lo que se refleja en el SWOLF si mides en ambos entornos.
          </p>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Debo contar medias brazadas o brazadas completas?</strong>
              <p>
                Depende del estilo. En <strong>crol</strong>, cuenta una brazada cada vez que
                el mismo brazo entra al agua (ciclo completo). En <strong>braza</strong>,
                cuenta cada vez que ambos brazos se extienden y recogen. La clave es ser
                consistente entre mediciones.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿El SWOLF sirve para todos los estilos?</strong>
              <p>
                Originalmente se usa en crol, pero puede aplicarse a braza, espalda y mariposa.
                Los rangos de referencia varían por estilo: en braza los valores son más altos
                porque hay menos brazadas pero más tiempo por ciclo. Compara siempre dentro
                del mismo estilo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa si me centro solo en hacer menos brazadas?</strong>
              <p>
                Reducir brazadas artificialmente (deslizando más tiempo del eficiente) puede
                bajar el conteo pero subir el tiempo total, resultando en el mismo o peor
                SWOLF. El objetivo es encontrar el equilibrio óptimo entre cadencia y
                deslizamiento.
              </p>
              <p className={styles.faqTip}>
                💡 Los nadadores de élite suelen nadar con más brazadas que los intermedios
                porque su eficiencia por ciclo es mayor y su velocidad hace que el tiempo
                compense.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Con qué frecuencia debo medir el SWOLF?</strong>
              <p>
                Una vez por semana al inicio del entrenamiento (cuando estás descansado)
                es suficiente. Medir en fatiga da valores peores y no refleja tu técnica real.
                Registra el SWOLF de un largo específico (por ejemplo, el tercero de la
                sesión, tras el calentamiento).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuánto tarda en mejorar el SWOLF?</strong>
              <p>
                Con trabajo técnico regular (2-3 sesiones semanales con drills), es habitual
                ver mejoras de 2-4 puntos en 4-8 semanas en nadadores intermedios. Los
                principiantes pueden mejorar 5-10 puntos en el primer mes de trabajo consciente.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Mide en condiciones estables</strong>
                <p>Siempre tras el calentamiento, sin estar en fatiga acumulada. Así la medición es representativa.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Haz la media de varios largos</strong>
                <p>3-5 largos consecutivos y calcula la media. Un solo largo puede no ser representativo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <div>
                <strong>Experimenta con cadencia</strong>
                <p>Prueba a nadar un largo con pocas brazadas largas y otro con más brazadas rápidas. Compara los SWOLF.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <div>
                <strong>Lleva un diario de entrenamiento</strong>
                <p>Anota fecha, SWOLF, sensaciones y drills practicados. Ayuda a identificar qué ejercicios mejoran más tu índice.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏋️</span>
              <div>
                <strong>Combina técnica y fondo</strong>
                <p>El SWOLF mejora con técnica, pero también con resistencia. Un nadador cansado pierde técnica y el SWOLF empeora.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📷</span>
              <div>
                <strong>Grábate bajo el agua</strong>
                <p>Ver tu brazada desde abajo revela errores que no se perciben desde fuera: posición de la mano, agarre, rotación.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes al medir el SWOLF
            </div>
            <ul className={styles.warningList}>
              <li>
                Contar las brazadas del impulso de salida o del viraje: distorsiona el resultado
                porque son ciclos a mayor velocidad y no representan tu técnica regular.
              </li>
              <li>
                Medir en plena fatiga (último largo de una serie larga): obtendrás peores valores
                que no reflejan tu capacidad técnica real.
              </li>
              <li>
                Comparar SWOLF de 25 m con SWOLF de 50 m sin ajuste: los rangos son distintos
                por el efecto del viraje.
              </li>
              <li>
                Obsesionarse con reducir solo las brazadas y nadar demasiado lento: un SWOLF bajo
                por velocidad excesivamente reducida no es el objetivo.
              </li>
              <li>
                No considerar el estilo: comparar el SWOLF de crol con el de braza no tiene
                sentido porque los ciclos de brazada son mecánicamente distintos.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-swolf-natacion')} />
        <ShareCard appName="calculadora-swolf-natacion" />
      </main>

      <Footer appName="calculadora-swolf-natacion" />
    </div>
  );
}
