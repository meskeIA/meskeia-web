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
import { formatNumber, parseSpanishNumber } from '@/lib';
import {
  calcularSWOLF,
  CORTES_SWOLF_25,
  RANGO_TIEMPO_SWOLF_POR_25,
  RANGO_BRAZADAS_SWOLF_POR_25,
} from '@/lib/calculadoras/deporte';
import type { ResultadoSWOLF } from '@/lib/calculadoras/deporte';
import styles from './CalculadoraSwolfNatacion.module.css';

type MetrosPiscina = 25 | 50;

/**
 * Cortes de nivel en piscina de 25 m (bordes inclusivos) y rangos admitidos por cada 25 m de
 * largo: los del motor, que comparten la API y el MCP. Aquí rotulan la caja de rangos, la
 * tabla de la guía y los avisos. Orientativos: no existe una escala oficial de SWOLF.
 */
const CORTES_25 = CORTES_SWOLF_25;
const TIEMPO_POR_25 = RANGO_TIEMPO_SWOLF_POR_25;
const BRAZADAS_POR_25 = RANGO_BRAZADAS_SWOLF_POR_25;

interface Lectura {
  valor: number | null;
  aviso: string | null;
}

/**
 * Lee un campo de texto con `parseSpanishNumber` y lo acota a su rango.
 *
 * Hasta el 02/10/2026 los campos eran `type="number"` con estado numérico, `parseInt` y
 * «solo se guarda si n > 0». Lo que el navegador entrega vacío a media escritura (campo
 * borrado, «-», «22.») no cambiaba el estado, React reescribía el último valor válido con el
 * cursor al final y lo siguiente que se tecleaba se CONCATENABA: borrar «20» y teclear «45»
 * daba 245 s (hallazgo 2630). Y los rangos que declaraban los campos no se hacían cumplir:
 * 2 s recibían «Élite» (hallazgo 2632). Ahora el campo guarda el TEXTO tal cual y, si no es
 * un número dentro de rango, hay aviso y ningún veredicto.
 */
function leerCampo(
  texto: string,
  rango: { min: number; max: number },
  textos: { falta: string; noNumero: string; fueraDeRango: string },
): Lectura {
  if (texto.trim() === '') return { valor: null, aviso: textos.falta };
  const n = parseSpanishNumber(texto);
  if (!Number.isFinite(n)) return { valor: null, aviso: textos.noNumero };
  if (n < rango.min || n > rango.max) return { valor: null, aviso: textos.fueraDeRango };
  return { valor: n, aviso: null };
}

/** SWOLF a la décima, sin decimales si es entero («38», «38,5»). */
function formatearSwolf(x: number): string {
  return formatNumber(x, Number.isInteger(x) ? 0 : 1);
}

export default function CalculadoraSwolfNatacionPage() {
  const [tiempoTexto, setTiempoTexto] = useState<string>('20');
  const [brazadasTexto, setBrazadasTexto] = useState<string>('18');
  const [metrosPiscina, setMetrosPiscina] = useState<MetrosPiscina>(25);

  // Cuántos largos de 25 m caben en uno de esta piscina
  const factor = metrosPiscina / 25;

  const tiempo = leerCampo(
    tiempoTexto,
    { min: TIEMPO_POR_25.min * factor, max: TIEMPO_POR_25.max * factor },
    {
      falta: 'Escribe el tiempo del largo en segundos.',
      noNumero: 'El tiempo debe ser un número de segundos (por ejemplo, 22 o 22,5).',
      fueraDeRango: `En piscina de ${metrosPiscina} m, el tiempo por largo debe estar entre ${TIEMPO_POR_25.min * factor} y ${TIEMPO_POR_25.max * factor} segundos.`,
    },
  );
  const brazadas = leerCampo(
    brazadasTexto,
    { min: BRAZADAS_POR_25.min * factor, max: BRAZADAS_POR_25.max * factor },
    {
      falta: 'Escribe las brazadas por largo.',
      noNumero: 'Las brazadas deben ser un número (por ejemplo, 16, o 16,5 si es la media de varios largos).',
      fueraDeRango: `En piscina de ${metrosPiscina} m, las brazadas por largo deben estar entre ${BRAZADAS_POR_25.min * factor} y ${BRAZADAS_POR_25.max * factor}.`,
    },
  );

  const resultado = useMemo<{ swolf: number; escala: ResultadoSWOLF; ritmo: string } | null>(() => {
    if (tiempo.valor === null || brazadas.valor === null) return null;
    // El motor clasifica con el SWOLF a la décima y su equivalente por 25 m: en 50 m el largo
    // mide el doble y, a igual ritmo y mismas brazadas por metro, el SWOLF es el doble
    // (25 m · 22 s · 16 = 38; 50 m · 44 s · 32 = 76). Hasta el 02/10/2026 se sumaban 8 puntos
    // a los cortes y el mismo nadador bajaba a Principiante por cambiar de piscina (hallazgo
    // 2631). Los rangos ya los ha comprobado leerCampo, así que el motor no lanza aquí.
    const escala = calcularSWOLF(tiempo.valor, brazadas.valor, metrosPiscina);
    return { swolf: escala.swolf, escala, ritmo: escala.velocidadMedia_min100m };
  }, [tiempo.valor, brazadas.valor, metrosPiscina]);

  const nivelClass = resultado
    ? {
        elite: styles.elite,
        avanzado: styles.avanzado,
        intermedio: styles.intermedio,
        principiante: styles.principiante,
      }[resultado.escala.nivel]
    : '';

  const nivelLabel = resultado
    ? {
        elite: 'Élite',
        avanzado: 'Avanzado',
        intermedio: 'Intermedio',
        principiante: 'Principiante',
      }[resultado.escala.nivel]
    : '';

  // Cortes de la piscina elegida: los de 25 m multiplicados por la longitud del largo
  const cortes = {
    elite: CORTES_25.elite * factor,
    avanzado: CORTES_25.avanzado * factor,
    intermedio: CORTES_25.intermedio * factor,
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🏊</span> Calculadora SWOLF</h1>
        <p>Mide tu eficiencia en el agua combinando tiempo y brazadas por largo</p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.calculadora}>
          {/* Selector de piscina */}
          <div className={styles.inputGroup}>
            <span className={styles.inputLabel} id="piscina-label">Longitud de la piscina</span>
            <div className={styles.selectorPiscina} role="group" aria-labelledby="piscina-label">
              <button
                type="button"
                className={`${styles.piscinaBtn} ${metrosPiscina === 25 ? styles.piscinaBtnActive : ''}`}
                onClick={() => setMetrosPiscina(25)}
                aria-pressed={metrosPiscina === 25}
              >
                25 m
              </button>
              <button
                type="button"
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
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={tiempoTexto}
                onChange={(e) => setTiempoTexto(e.target.value)}
                className={styles.numberInput}
                aria-invalid={tiempo.aviso !== null}
                aria-describedby="tiempo-hint aviso-entradas"
              />
              <span className={styles.inputUnit}>seg / largo</span>
            </div>
            <span id="tiempo-hint" className={styles.inputHint}>
              Desde el impulso del muro hasta tocar el siguiente (entre {TIEMPO_POR_25.min * factor} y{' '}
              {TIEMPO_POR_25.max * factor} s en {metrosPiscina} m)
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
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={brazadasTexto}
                onChange={(e) => setBrazadasTexto(e.target.value)}
                className={styles.numberInput}
                aria-invalid={brazadas.aviso !== null}
                aria-describedby="brazadas-hint aviso-entradas"
              />
              <span className={styles.inputUnit}>brazadas</span>
            </div>
            <span id="brazadas-hint" className={styles.inputHint}>
              Solo ciclos completos, sin contar el impulso de salida (entre{' '}
              {BRAZADAS_POR_25.min * factor} y {BRAZADAS_POR_25.max * factor} en {metrosPiscina} m)
            </span>
          </div>

          {/* Región viva PERSISTENTE: existe siempre para que el lector de pantalla anuncie el
              aviso cuando aparece (una región que nace con el texto no se anuncia). */}
          <div id="aviso-entradas" className={styles.avisoEntradas} role="status" aria-live="polite">
            {tiempo.aviso && <p>{tiempo.aviso}</p>}
            {brazadas.aviso && <p>{brazadas.aviso}</p>}
          </div>
        </div>

        {/* Resultado principal */}
        <div className={styles.resultadoPanel} aria-live="polite">
          <div className={styles.swolfScoreWrapper}>
            <span className={styles.swolfLabel}>Índice SWOLF</span>
            <span className={styles.swolfScore}>{resultado ? formatearSwolf(resultado.swolf) : '—'}</span>
            {resultado && (
              <span className={`${styles.nivelBadge} ${nivelClass}`} aria-label={`Nivel: ${nivelLabel}`}>
                {nivelLabel}
              </span>
            )}
          </div>

          {!resultado ? (
            <p className={styles.sinResultado}>
              Corrige los datos marcados arriba para ver tu índice y tu nivel.
            </p>
          ) : (
            <>
              <div className={styles.detalles}>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Eficiencia</span>
                  <span className={styles.detalleValor}>{resultado.escala.eficiencia}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Ritmo medio</span>
                  <span className={styles.detalleValor}>{resultado.ritmo}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Descripción</span>
                  <span className={styles.detalleValor}>{resultado.escala.descripcionNivel}</span>
                </div>
              </div>

              <div className={styles.consejoBox} role="note" aria-label="Consejo de mejora">
                <span className={styles.consejoIcon} aria-hidden="true">💡</span>
                <div>
                  <strong className={styles.consejoTitulo}>Consejo para mejorar</strong>
                  <p className={styles.consejoTexto}>{resultado.escala.consejo}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Referencia de rangos */}
        <div className={styles.referenciaRangos}>
          <h3 className={styles.referenciaTitle}>
            Rangos de referencia para piscina de {metrosPiscina} m
          </h3>
          <div className={styles.rangosGrid}>
            <div className={`${styles.rangoItem} ${styles.elite}`}>
              <span className={styles.rangoNivel}>Élite</span>
              <span className={styles.rangoValor}>≤ {cortes.elite}</span>
            </div>
            <div className={`${styles.rangoItem} ${styles.avanzado}`}>
              <span className={styles.rangoNivel}>Avanzado</span>
              <span className={styles.rangoValor}>≤ {cortes.avanzado}</span>
            </div>
            <div className={`${styles.rangoItem} ${styles.intermedio}`}>
              <span className={styles.rangoNivel}>Intermedio</span>
              <span className={styles.rangoValor}>≤ {cortes.intermedio}</span>
            </div>
            <div className={`${styles.rangoItem} ${styles.principiante}`}>
              <span className={styles.rangoNivel}>Principiante</span>
              <span className={styles.rangoValor}>&gt; {cortes.intermedio}</span>
            </div>
          </div>
          <p className={styles.referenciaNota}>
            Cada nivel empieza donde acaba el anterior. Son cortes orientativos para crol: no
            existe una escala oficial de SWOLF.
            {metrosPiscina === 50 &&
              ' En 50 m son el doble que en 25 m, porque el largo mide el doble.'}
          </p>
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
                  y calcula la media: la calculadora admite decimales (22,5 s, 16,5 brazadas).
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
                  <td>≤ {CORTES_25.elite}</td>
                  <td>≤ {CORTES_25.elite * 2}</td>
                  <td>Nadador de competición de alto nivel, en activo o retirado</td>
                </tr>
                <tr>
                  <td>Avanzado</td>
                  <td>≤ {CORTES_25.avanzado}</td>
                  <td>≤ {CORTES_25.avanzado * 2}</td>
                  <td>Nadador federado o con años de práctica técnica</td>
                </tr>
                <tr>
                  <td>Intermedio</td>
                  <td>≤ {CORTES_25.intermedio}</td>
                  <td>≤ {CORTES_25.intermedio * 2}</td>
                  <td>Nadador recreacional con base técnica aceptable</td>
                </tr>
                <tr>
                  <td>Principiante</td>
                  <td>&gt; {CORTES_25.intermedio}</td>
                  <td>&gt; {CORTES_25.intermedio * 2}</td>
                  <td>Aprendizaje técnico en curso</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.guideParagraph}>
            Cada nivel empieza donde acaba el anterior (un 27 en 25 m es Avanzado). Los cortes
            son orientativos para crol: no hay una escala oficial de SWOLF, y sirven sobre todo
            para seguir tu propia evolución.
          </p>

          <h3 className={styles.eduSubtitle}>Cómo mejorar el índice SWOLF</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">⬇️</span> Reducir brazadas</h4>
              <p>
                Trabaja el deslizamiento y el planeado entre brazadas. Ejercicios como
                el <em>catch-up</em> (esperar a que el brazo avanzado llegue a la cadera
                antes de iniciar la siguiente brazada) aumentan la longitud por ciclo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">⏱️</span> Reducir el tiempo</h4>
              <p>
                Mejora la patada, el agarre del agua en la fase de tire y la rotación
                del cuerpo. Un mejor agarre da más propulsión por brazada sin añadir ciclos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🔄</span> Drills de técnica</h4>
              <p>
                <em>Dedos al suelo</em>, <em>bandera de popa</em> (nadar con los pies
                cruzados) y <em>aletas</em> ayudan a sentir el deslizamiento y a
                aumentar la propulsión de patada, reduciendo brazadas necesarias.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">📏</span> Viraje eficiente</h4>
              <p>
                El viraje suma tiempo pero no brazadas. Un giro de volteo bien ejecutado
                puede ahorrar 0,5–1 segundo por largo, lo que mejora el SWOLF directamente.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Diferencias entre piscinas de 25 m y 50 m</h3>
          <p className={styles.guideParagraph}>
            El SWOLF suma segundos y brazadas <strong>por largo</strong>, y el largo de la
            piscina de <strong>50 m (larga)</strong> mide el doble que el de la de{' '}
            <strong>25 m (corta)</strong>. Eso cambia la escala:
          </p>
          <ul className={styles.guideList}>
            <li>
              <strong>Más brazadas por largo</strong>: un largo de 50 m exige al menos el doble
              de brazadas que uno de 25 m, y algo más, porque sin el viraje de la mitad falta el
              impulso del muro.
            </li>
            <li>
              <strong>Más tiempo por largo</strong>: el doble de distancia, y un tiempo por metro
              ligeramente mayor sin ese impulso, sobre todo en quien aprovecha bien el viraje.
            </li>
            <li>
              <strong>Cortes al doble</strong>: a igual ritmo y mismas brazadas por metro, el
              SWOLF de 50 m es el doble (22 s y 16 brazadas en 25 m dan 38; 44 s y 32 brazadas
              en 50 m dan 76). Por eso la calculadora duplica los cortes en 50 m. Como el SWOLF
              real en piscina larga suele salir algo por encima del doble, cerca de un corte la
              clasificación en 50 m es conservadora.
            </li>
          </ul>
          <p className={styles.guideParagraph}>
            En competición, las marcas en piscina corta suelen ser más rápidas que en piscina
            larga por los virajes adicionales. Compara siempre tu SWOLF con mediciones hechas
            en la misma piscina.
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
                <span aria-hidden="true">💡</span> Lo que distingue a un nadador eficiente es que
                avanza más metros en cada brazada sin perder velocidad: por eso da menos brazadas
                por largo y, aun así, tarda menos.
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
                Comparar SWOLF de 25 m con SWOLF de 50 m tal cual: el largo de 50 m mide el
                doble, así que su SWOLF es al menos el doble.
              </li>
              <li>
                Obsesionarse con reducir solo las brazadas hasta nadar demasiado lento: lo que se
                gana en brazadas se pierde en tiempo, y el SWOLF no mejora.
              </li>
              <li>
                No considerar el estilo: comparar el SWOLF de crol con el de braza no tiene
                sentido porque los ciclos de brazada son mecánicamente distintos.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="calculadora-swolf-natacion" />
      </main>

      <Footer appName="calculadora-swolf-natacion" />
    </div>
  );
}
