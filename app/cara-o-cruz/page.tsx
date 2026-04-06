'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CaraOCruz.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type Resultado = 'cara' | 'cruz';

interface Lanzamiento {
  id: number;
  resultado: Resultado;
  timestamp: Date;
}

interface Estadisticas {
  total: number;
  caras: number;
  cruces: number;
  porcentajeCara: number;
  porcentajeCruz: number;
  rachaActual: { tipo: Resultado | null; cantidad: number };
  rachaMaxCara: number;
  rachaMaxCruz: number;
}

export default function CaraOCruzPage() {
  const [historial, setHistorial] = useState<Lanzamiento[]>([]);
  const [animando, setAnimando] = useState(false);
  const [resultadoActual, setResultadoActual] = useState<Resultado | null>(null);
  const [mostrandoResultado, setMostrandoResultado] = useState(false);

  // Calcular estadísticas
  const calcularEstadisticas = useCallback((lanzamientos: Lanzamiento[]): Estadisticas => {
    const total = lanzamientos.length;
    const caras = lanzamientos.filter(l => l.resultado === 'cara').length;
    const cruces = total - caras;

    // Calcular rachas
    let rachaActualTipo: Resultado | null = null;
    let rachaActualCantidad = 0;
    let rachaMaxCara = 0;
    let rachaMaxCruz = 0;
    let rachaTempCara = 0;
    let rachaTempCruz = 0;

    for (const lanzamiento of lanzamientos) {
      if (lanzamiento.resultado === 'cara') {
        rachaTempCara++;
        rachaTempCruz = 0;
        if (rachaTempCara > rachaMaxCara) rachaMaxCara = rachaTempCara;
      } else {
        rachaTempCruz++;
        rachaTempCara = 0;
        if (rachaTempCruz > rachaMaxCruz) rachaMaxCruz = rachaTempCruz;
      }
    }

    // Racha actual (últimos lanzamientos consecutivos iguales)
    if (lanzamientos.length > 0) {
      const ultimo = lanzamientos[lanzamientos.length - 1].resultado;
      rachaActualTipo = ultimo;
      rachaActualCantidad = 1;
      for (let i = lanzamientos.length - 2; i >= 0; i--) {
        if (lanzamientos[i].resultado === ultimo) {
          rachaActualCantidad++;
        } else {
          break;
        }
      }
    }

    return {
      total,
      caras,
      cruces,
      porcentajeCara: total > 0 ? (caras / total) * 100 : 0,
      porcentajeCruz: total > 0 ? (cruces / total) * 100 : 0,
      rachaActual: { tipo: rachaActualTipo, cantidad: rachaActualCantidad },
      rachaMaxCara,
      rachaMaxCruz,
    };
  }, []);

  const lanzarMoneda = useCallback(() => {
    if (animando) return;

    setAnimando(true);
    setMostrandoResultado(false);

    // Determinar resultado aleatoriamente
    const resultado: Resultado = Math.random() < 0.5 ? 'cara' : 'cruz';

    // Duración de la animación
    setTimeout(() => {
      setResultadoActual(resultado);
      setMostrandoResultado(true);
      setAnimando(false);

      // Añadir al historial
      setHistorial(prev => [...prev, {
        id: Date.now(),
        resultado,
        timestamp: new Date(),
      }]);
    }, 1500);
  }, [animando]);

  const reiniciar = () => {
    setHistorial([]);
    setResultadoActual(null);
    setMostrandoResultado(false);
  };

  const stats = calcularEstadisticas(historial);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🪙</span>
        <h1 className={styles.title}>Cara o Cruz</h1>
        <p className={styles.subtitle}>
          Lanza una moneda virtual con animación realista.
          Incluye historial y estadísticas para visualizar la ley de grandes números.
        </p>
      </header>

      <LegalNotice />

      {/* Área principal */}
      <div className={styles.mainContent}>
        {/* Moneda */}
        <div className={styles.coinArea}>
          <div className={`${styles.coinContainer} ${animando ? styles.flipping : ''}`}>
            <div className={`${styles.coin} ${mostrandoResultado ? (resultadoActual === 'cara' ? styles.showCara : styles.showCruz) : ''}`}>
              <div className={styles.coinFace + ' ' + styles.cara}>
                <span className={styles.coinEmoji}>👑</span>
                <span className={styles.coinLabel}>CARA</span>
              </div>
              <div className={styles.coinFace + ' ' + styles.cruz}>
                <span className={styles.coinEmoji}>🦅</span>
                <span className={styles.coinLabel}>CRUZ</span>
              </div>
            </div>
          </div>

          {/* Resultado */}
          {mostrandoResultado && resultadoActual && (
            <div className={styles.resultado}>
              <span className={styles.resultadoTexto}>
                ¡{resultadoActual === 'cara' ? 'CARA' : 'CRUZ'}!
              </span>
            </div>
          )}

          {/* Botón lanzar */}
          <button
            onClick={lanzarMoneda}
            disabled={animando}
            className={styles.btnLanzar}
          >
            {animando ? 'Lanzando...' : '🎲 Lanzar Moneda'}
          </button>

          {historial.length > 0 && (
            <button onClick={reiniciar} className={styles.btnReiniciar}>
              Reiniciar
            </button>
          )}
        </div>

        {/* Estadísticas */}
        <div className={styles.statsArea}>
          <h2 className={styles.statsTitle}>📊 Estadísticas</h2>

          {stats.total === 0 ? (
            <div className={styles.emptyStats}>
              <p>Lanza la moneda para ver las estadísticas</p>
            </div>
          ) : (
            <>
              {/* Contador principal */}
              <div className={styles.mainStats}>
                <div className={styles.statCard + ' ' + styles.caraCard}>
                  <div className={styles.statIcon}>👑</div>
                  <div className={styles.statValue}>{stats.caras}</div>
                  <div className={styles.statLabel}>Caras</div>
                  <div className={styles.statPercent}>{formatNumber(stats.porcentajeCara, 1)}%</div>
                </div>
                <div className={styles.statCard + ' ' + styles.cruzCard}>
                  <div className={styles.statIcon}>🦅</div>
                  <div className={styles.statValue}>{stats.cruces}</div>
                  <div className={styles.statLabel}>Cruces</div>
                  <div className={styles.statPercent}>{formatNumber(stats.porcentajeCruz, 1)}%</div>
                </div>
              </div>

              {/* Barra de distribución */}
              <div className={styles.distributionBar}>
                <div
                  className={styles.caraBar}
                  style={{ width: `${stats.porcentajeCara}%` }}
                />
                <div
                  className={styles.cruzBar}
                  style={{ width: `${stats.porcentajeCruz}%` }}
                />
              </div>
              <div className={styles.distributionLabels}>
                <span>Cara {formatNumber(stats.porcentajeCara, 1)}%</span>
                <span>Total: {stats.total} lanzamientos</span>
                <span>Cruz {formatNumber(stats.porcentajeCruz, 1)}%</span>
              </div>

              {/* Rachas */}
              <div className={styles.rachasSection}>
                <h3 className={styles.rachasTitle}>🔥 Rachas</h3>
                <div className={styles.rachasGrid}>
                  <div className={styles.rachaItem}>
                    <span className={styles.rachaLabel}>Racha actual</span>
                    <span className={styles.rachaValue}>
                      {stats.rachaActual.cantidad} {stats.rachaActual.tipo === 'cara' ? '👑' : '🦅'}
                    </span>
                  </div>
                  <div className={styles.rachaItem}>
                    <span className={styles.rachaLabel}>Mejor racha cara</span>
                    <span className={styles.rachaValue}>{stats.rachaMaxCara} 👑</span>
                  </div>
                  <div className={styles.rachaItem}>
                    <span className={styles.rachaLabel}>Mejor racha cruz</span>
                    <span className={styles.rachaValue}>{stats.rachaMaxCruz} 🦅</span>
                  </div>
                </div>
              </div>

              {/* Historial reciente */}
              <div className={styles.historialSection}>
                <h3 className={styles.historialTitle}>📜 Últimos lanzamientos</h3>
                <div className={styles.historialGrid}>
                  {historial.slice(-20).reverse().map((l) => (
                    <span
                      key={l.id}
                      className={`${styles.historialItem} ${l.resultado === 'cara' ? styles.historialCara : styles.historialCruz}`}
                      title={l.resultado}
                    >
                      {l.resultado === 'cara' ? '👑' : '🦅'}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="¿Quieres aprender sobre probabilidad?"
        subtitle="Descubre la matemática detrás del azar"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>La Ley de los Grandes Números</h2>
          <p className={styles.introParagraph}>
            Cuando lanzas una moneda justa, cada lanzamiento tiene exactamente un 50% de
            probabilidad de ser cara y un 50% de ser cruz. Sin embargo, en pocas tiradas
            puedes ver resultados muy desiguales (por ejemplo, 7 caras y 3 cruces en 10 lanzamientos).
          </p>
          <p className={styles.introParagraph}>
            La <strong>Ley de los Grandes Números</strong> dice que a medida que aumentas
            el número de lanzamientos, el porcentaje observado se acercará cada vez más al
            50% teórico. Prueba a hacer 100 o más lanzamientos y observa cómo los porcentajes
            se estabilizan.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Conceptos clave</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🎲 Evento aleatorio</h4>
              <p>
                Un evento cuyo resultado no puede predecirse con certeza.
                El lanzamiento de una moneda es un ejemplo clásico de evento aleatorio.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 Probabilidad teórica</h4>
              <p>
                Para una moneda justa: P(cara) = P(cruz) = 0,5 o 50%.
                Cada lanzamiento es independiente del anterior.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔄 Independencia</h4>
              <p>
                Que haya salido cara 5 veces seguidas NO aumenta la probabilidad
                de que salga cruz. Cada lanzamiento es independiente.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📈 Frecuencia relativa</h4>
              <p>
                El número de caras dividido entre el total de lanzamientos.
                Con muchos lanzamientos, tiende al 50%.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Usos prácticos</h2>
          <ul className={styles.usesList}>
            <li><strong>Tomar decisiones:</strong> Cuando no puedes decidir entre dos opciones</li>
            <li><strong>Juegos de mesa:</strong> Determinar quién empieza o resolver empates</li>
            <li><strong>Sorteos justos:</strong> Elegir al azar entre dos personas</li>
            <li><strong>Educación:</strong> Enseñar probabilidad de forma práctica</li>
          </ul>
        </section>

        {/* Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Métodos de decisión aleatoria</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>N.º opciones</th>
                  <th>Equidad</th>
                  <th>Velocidad</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🪙 Moneda</td>
                  <td>2</td>
                  <td>Alta (50/50)</td>
                  <td>Inmediata</td>
                  <td>Desempates rápidos entre dos partes</td>
                </tr>
                <tr>
                  <td>🎲 Dado</td>
                  <td>2 – 6</td>
                  <td>Alta (1/N)</td>
                  <td>Inmediata</td>
                  <td>Seleccionar entre varios candidatos</td>
                </tr>
                <tr>
                  <td>🎡 Ruleta</td>
                  <td>Ilimitadas</td>
                  <td>Alta si bien configurada</td>
                  <td>Media</td>
                  <td>Sorteos con muchas opciones</td>
                </tr>
                <tr>
                  <td>📋 Lista aleatoria</td>
                  <td>Ilimitadas</td>
                  <td>Alta</td>
                  <td>Media</td>
                  <td>Ordenar grupos o asignar turnos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>Cuándo usar cara o cruz</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚖️</span>
                <h4>Resolver un empate</h4>
              </div>
              <p className={styles.escenarioExample}>
                Dos personas quieren la misma pizza y nadie cede. Un lanzamiento justo
                resuelve el conflicto en segundos sin rencores.
              </p>
              <p className={styles.escenarioTip}>
                Tip: acuerda el significado de cara y cruz antes de lanzar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💬</span>
                <h4>Decisión trivial sin discusión</h4>
              </div>
              <p className={styles.escenarioExample}>
                ¿Vemos película A o película B? En lugar de debatir 20 minutos,
                lanzar la moneda ahorra tiempo y energía.
              </p>
              <p className={styles.escenarioTip}>
                Tip: reserva este método para decisiones donde ambas opciones sean aceptables.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧒</span>
                <h4>Ejercicio de probabilidad con niños</h4>
              </div>
              <p className={styles.escenarioExample}>
                Lanzar 20 veces y registrar resultados enseña de forma práctica
                que la probabilidad teórica (50%) puede diferir de la observada.
              </p>
              <p className={styles.escenarioTip}>
                Tip: usa el historial de esta app para visualizar la ley de grandes números.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Es realmente 50/50 la probabilidad?</h4>
              <p>
                Para una moneda perfectamente simétrica y lanzada sin sesgo, sí: P(cara) = P(cruz) = 0,5.
                En la práctica, las monedas físicas tienen ligeras imperfecciones que pueden introducir
                un sesgo mínimo (inferior al 1 %), pero estadísticamente irrelevante para el uso cotidiano.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puede salir cara 10 veces seguidas?</h4>
              <p>
                Sí. La probabilidad es (0,5)¹⁰ = 1/1024, es decir, aproximadamente un 0,1 %.
                Es poco probable pero perfectamente posible. Cada lanzamiento es independiente,
                así que la racha anterior no influye en el siguiente resultado.
              </p>
              <p className={styles.faqTip}>
                Dato curioso: si lanzas 1.024 veces, es estadísticamente esperable que una vez salga cara 10 seguidas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es la falacia del jugador?</h4>
              <p>
                Es el error de creer que, tras una racha de caras, «toca» que salga cruz para compensar.
                La moneda no tiene memoria: la probabilidad sigue siendo 50/50 en cada lanzamiento
                independientemente de lo ocurrido antes.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Las monedas físicas son perfectamente equitativas?</h4>
              <p>
                No del todo. Estudios de la Universidad de Stanford demuestran que las monedas físicas
                pueden caer con un ligero sesgo hacia el lado que estaba boca arriba al inicio del lanzamiento
                (sesgo de Diaconis, ~51/49). Para usos cotidianos, la diferencia es irrelevante.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Cómo usar cara o cruz correctamente</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Acuerda el significado antes de lanzar</h4>
                <p>
                  Define explícitamente qué opción corresponde a cara y cuál a cruz.
                  Hacerlo después del lanzamiento es trampa y genera conflicto.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Lanza sin «mejores de 3»</h4>
                <p>
                  Un único lanzamiento es suficiente. Proponer repetir hasta 3 anula
                  la aleatoriedad y convierte el método en una negociación encubierta.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Acepta el resultado tal cual</h4>
                <p>
                  El valor del método reside en su carácter vinculante. Si ya sabes
                  que no aceptarás el resultado, no uses la moneda.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Si no hay acuerdo, busca otro método</h4>
                <p>
                  Si alguna parte no acepta las condiciones o el resultado, la moneda
                  no es el método adecuado. Considera mediación o votación razonada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Define antes de lanzar</h4>
              <p>Establece qué significa cara y qué significa cruz antes de ver el resultado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Acepta el primer resultado</h4>
              <p>No repitas el lanzamiento. Un resultado válido no se anula por no gustar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Úsalo para decisiones irrelevantes</h4>
              <p>Perfecta para trivialidades donde ambas opciones son igualmente aceptables.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⛔</span>
              <h4>No para decisiones importantes</h4>
              <p>Evita usarlo en decisiones irreversibles o con consecuencias significativas.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores comunes al lanzar la moneda</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Repetir hasta obtener el resultado deseado.</strong> Invalida completamente
              la aleatoriedad y convierte el método en una ilusión de imparcialidad.
            </li>
            <li>
              <strong>Usarlo para decisiones importantes o irreversibles.</strong> La moneda es
              apropiada para trivialidades; no para compromisos económicos, legales o personales relevantes.
            </li>
            <li>
              <strong>Creer que «toca» el resultado contrario tras una racha.</strong> Esta es
              la falacia del jugador: cada lanzamiento es independiente y la probabilidad siempre es 50/50.
            </li>
            <li>
              <strong>No acordar el significado antes de lanzar.</strong> Definir cara y cruz
              después del resultado genera desconfianza y conflicto entre las partes.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cara-o-cruz')} />
      <ShareCard appName="cara-o-cruz" />
      <Footer appName="cara-o-cruz" />
    </div>
  );
}
