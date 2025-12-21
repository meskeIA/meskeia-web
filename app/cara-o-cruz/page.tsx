'use client';

import { useState, useCallback } from 'react';
import styles from './CaraOCruz.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cara-o-cruz')} />
      <Footer appName="cara-o-cruz" />
    </div>
  );
}
