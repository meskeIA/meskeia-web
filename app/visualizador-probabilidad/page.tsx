'use client';

import { useState, useCallback } from 'react';
import styles from './VisualizadorProbabilidad.module.css';
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
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Secciones
// ─────────────────────────────────────────────

type Seccion = 'moneda' | 'dados' | 'cumple' | 'falacia';

const SECCIONES = [
  { id: 'moneda' as Seccion, titulo: 'La moneda', icono: '🪙', subtitulo: 'Ley de los grandes números' },
  { id: 'dados' as Seccion, titulo: 'Dos dados', icono: '🎲', subtitulo: '¿Qué suma sale más?' },
  { id: 'cumple' as Seccion, titulo: 'Cumpleaños', icono: '🎂', subtitulo: 'La paradoja que sorprende' },
  { id: 'falacia' as Seccion, titulo: 'La falacia', icono: '🃏', subtitulo: 'Por qué las rachas engañan' },
];

// ─────────────────────────────────────────────
// Sección 1: Moneda — Ley de grandes números
// ─────────────────────────────────────────────

function SeccionMoneda() {
  const [lanzamientos, setLanzamientos] = useState<('cara' | 'cruz')[]>([]);

  const lanzar = useCallback((n: number) => {
    const nuevos: ('cara' | 'cruz')[] = [];
    for (let i = 0; i < n; i++) {
      nuevos.push(Math.random() < 0.5 ? 'cara' : 'cruz');
    }
    setLanzamientos(prev => [...prev, ...nuevos]);
  }, []);

  const reset = () => setLanzamientos([]);

  const totalCaras = lanzamientos.filter(l => l === 'cara').length;
  const totalCruces = lanzamientos.length - totalCaras;
  const pctCaras = lanzamientos.length > 0 ? (totalCaras / lanzamientos.length) * 100 : 50;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Si lanzas una moneda, la probabilidad de cara es 50%. Pero <strong>eso no significa que de cada 10 lanzamientos salgan 5 caras</strong>. Pruébalo:</p>
      </div>

      <div className={styles.botonesSimulacion}>
        <button type="button" className={styles.btnSimular} onClick={() => lanzar(1)}>Lanzar 1</button>
        <button type="button" className={styles.btnSimular} onClick={() => lanzar(10)}>Lanzar 10</button>
        <button type="button" className={styles.btnSimular} onClick={() => lanzar(100)}>Lanzar 100</button>
        <button type="button" className={styles.btnSimular} onClick={() => lanzar(1000)}>Lanzar 1.000</button>
        <button type="button" className={styles.btnReset} onClick={reset}>Reiniciar</button>
      </div>

      {lanzamientos.length > 0 && (
        <>
          <div className={styles.resultadoMoneda}>
            <div className={styles.monedaStat}>
              <span className={styles.monedaLabel}>Caras</span>
              <span className={styles.monedaValor}>{totalCaras}</span>
            </div>
            <div className={styles.monedaStat}>
              <span className={styles.monedaLabel}>Cruces</span>
              <span className={styles.monedaValor}>{totalCruces}</span>
            </div>
            <div className={styles.monedaStat}>
              <span className={styles.monedaLabel}>Total</span>
              <span className={styles.monedaValor}>{lanzamientos.length}</span>
            </div>
            <div className={styles.monedaStat}>
              <span className={styles.monedaLabel}>% Caras</span>
              <span className={styles.monedaValor} style={{ color: Math.abs(pctCaras - 50) < 2 ? '#27ae60' : '#e67e22' }}>
                {formatNumber(pctCaras, 1)}%
              </span>
            </div>
          </div>

          <div className={styles.barraMoneda}>
            <div className={styles.barraCaras} style={{ width: `${pctCaras}%` }}>
              <span className={styles.barraTexto}>Caras {formatNumber(pctCaras, 1)}%</span>
            </div>
            <div className={styles.barraCruces} style={{ width: `${100 - pctCaras}%` }}>
              <span className={styles.barraTexto}>Cruces {formatNumber(100 - pctCaras, 1)}%</span>
            </div>
          </div>
        </>
      )}

      <div className={styles.insight}>
        <p>
          Con pocos lanzamientos, el resultado puede ser 70% caras o 30%. <strong>Cuantos más lanzamientos,
          más se acerca al 50%</strong>. Esto es la Ley de los Grandes Números: la probabilidad teórica solo
          se manifiesta a largo plazo.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Dados — distribución de sumas
// ─────────────────────────────────────────────

function SeccionDados() {
  const [tiradas, setTiradas] = useState<number[]>([]);

  const tirar = useCallback((n: number) => {
    const nuevas: number[] = [];
    for (let i = 0; i < n; i++) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      nuevas.push(d1 + d2);
    }
    setTiradas(prev => [...prev, ...nuevas]);
  }, []);

  const reset = () => setTiradas([]);

  // Distribución de resultados
  const distribucion = Array.from({ length: 11 }, (_, i) => {
    const suma = i + 2;
    const count = tiradas.filter(t => t === suma).length;
    return { suma, count };
  });
  const maxCount = Math.max(...distribucion.map(d => d.count), 1);

  // Probabilidades teóricas
  const probTeorica = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map(n => n / 36);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Si lanzas dos dados, ¿qué suma sale más? No todas las sumas tienen la misma probabilidad. El <strong>7 tiene 6 combinaciones posibles</strong>, el 2 solo tiene una (1+1).</p>
      </div>

      <div className={styles.botonesSimulacion}>
        <button type="button" className={styles.btnSimular} onClick={() => tirar(1)}>Tirar 1</button>
        <button type="button" className={styles.btnSimular} onClick={() => tirar(10)}>Tirar 10</button>
        <button type="button" className={styles.btnSimular} onClick={() => tirar(100)}>Tirar 100</button>
        <button type="button" className={styles.btnSimular} onClick={() => tirar(1000)}>Tirar 1.000</button>
        <button type="button" className={styles.btnReset} onClick={reset}>Reiniciar</button>
      </div>

      {/* Distribución visual */}
      <div className={styles.distribucionGrid}>
        {distribucion.map((d, i) => (
          <div key={d.suma} className={styles.distribucionCol}>
            <div className={styles.distribucionBarraWrap}>
              <div
                className={styles.distribucionBarra}
                style={{ height: tiradas.length > 0 ? `${(d.count / maxCount) * 100}%` : '0%' }}
              />
              <div
                className={styles.distribucionTeorica}
                style={{ height: `${probTeorica[i] * 100 / Math.max(...probTeorica)}%` }}
                title={`Teórica: ${formatNumber(probTeorica[i] * 100, 1)}%`}
              />
            </div>
            <span className={styles.distribucionSuma}>{d.suma}</span>
            <span className={styles.distribucionCount}>{d.count}</span>
          </div>
        ))}
      </div>
      <div className={styles.leyenda}>
        <span className={styles.leyendaItem}><span className={styles.leyendaColor} style={{ backgroundColor: '#2E86AB' }} /> Resultado real</span>
        <span className={styles.leyendaItem}><span className={styles.leyendaColor} style={{ backgroundColor: '#e67e22', opacity: 0.4 }} /> Probabilidad teórica</span>
        <span className={styles.leyendaItem}>Total: {tiradas.length} tiradas</span>
      </div>

      <div className={styles.insight}>
        <p>
          El 7 sale un <strong>16,7%</strong> de las veces (6 de 36 combinaciones). El 2 o el 12 solo un <strong>2,8%</strong>
          (1 combinación cada uno). Con muchas tiradas, las barras se acercan a la distribución teórica.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Paradoja del cumpleaños
// ─────────────────────────────────────────────

function SeccionCumple() {
  const datos = [
    { personas: 5, probabilidad: 2.7 },
    { personas: 10, probabilidad: 11.7 },
    { personas: 15, probabilidad: 25.3 },
    { personas: 20, probabilidad: 41.1 },
    { personas: 23, probabilidad: 50.7 },
    { personas: 30, probabilidad: 70.6 },
    { personas: 40, probabilidad: 89.1 },
    { personas: 50, probabilidad: 97.0 },
    { personas: 60, probabilidad: 99.4 },
    { personas: 70, probabilidad: 99.9 },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>¿Cuántas personas necesitas en una habitación para que haya un <strong>50% de probabilidad</strong> de que dos compartan cumpleaños?</p>
      </div>

      <div className={styles.respuestaGrande}>
        <span className={styles.respuestaNumero}>23</span>
        <span className={styles.respuestaTexto}>personas bastan para un 50,7%</span>
      </div>

      <p className={styles.sorpresa}>La mayoría responde &quot;183&quot; (la mitad de 365). La realidad es <strong>8 veces menos</strong>. ¿Por qué?</p>

      <div className={styles.cumpleBarras}>
        {datos.map(d => (
          <div key={d.personas} className={styles.cumpleItem}>
            <span className={styles.cumplePersonas}>{d.personas}</span>
            <div className={styles.cumpleBarraFondo}>
              <div
                className={styles.cumpleBarra}
                style={{
                  width: `${d.probabilidad}%`,
                  backgroundColor: d.probabilidad >= 50 ? '#27ae60' : '#2E86AB',
                }}
              />
            </div>
            <span className={styles.cumplePct}>{formatNumber(d.probabilidad, 1)}%</span>
          </div>
        ))}
      </div>

      <div className={styles.explicacionCumple}>
        <h4>¿Por qué funciona así?</h4>
        <p>
          No comparas una persona con el resto — comparas <strong>todos los pares posibles</strong>.
          Con 23 personas hay 253 pares diferentes (23 × 22 / 2). Cada par tiene una pequeña
          probabilidad de coincidir (1/365), pero 253 intentos son muchos. Es como lanzar una
          moneda 253 veces y esperar al menos una cara.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          La paradoja del cumpleaños demuestra que <strong>el cerebro subestima las combinaciones</strong>.
          Pensamos linealmente (23 personas → 23 comparaciones) cuando en realidad el número de pares
          crece cuadráticamente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: La falacia del jugador
// ─────────────────────────────────────────────

function SeccionFalacia() {
  const secuencias = [
    { seq: 'CCCCCC', pregunta: '6 caras seguidas. ¿Qué es más probable en la siguiente?', respuesta: '50% cara, 50% cruz. La moneda no tiene memoria.' },
    { seq: '🔴🔴🔴🔴🔴', pregunta: '5 rojos seguidos en la ruleta. ¿Sale negro seguro?', respuesta: 'No. Cada giro es independiente. El rojo tiene la misma probabilidad que antes.' },
    { seq: '⭐⭐⭐', pregunta: 'Te han tocado 3 premios pequeños de lotería. ¿Tu suerte se "agota"?', respuesta: 'No. Cada sorteo es independiente. La suerte no es un recurso que se gasta.' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La <strong>falacia del jugador</strong> es creer que los resultados pasados afectan a los futuros en eventos independientes. Es uno de los errores probabilísticos más comunes.</p>
      </div>

      <div className={styles.falaciasGrid}>
        {secuencias.map((s, i) => (
          <div key={i} className={styles.falaciaCard}>
            <div className={styles.falaciaSeq}>{s.seq}</div>
            <p className={styles.falaciaPregunta}>{s.pregunta}</p>
            <p className={styles.falaciaRespuesta}>{s.respuesta}</p>
          </div>
        ))}
      </div>

      <div className={styles.casoReal}>
        <h4>Caso real: Monte Carlo, 1913</h4>
        <p>
          En el casino de Monte Carlo, la bolita cayó en <strong>negro 26 veces seguidas</strong>.
          Los jugadores apostaron millones al rojo, convencidos de que &quot;tenía que salir&quot;.
          Perdieron fortunas. La probabilidad de negro en cada giro seguía siendo exactamente la misma:
          48,6%. La ruleta no tiene memoria.
        </p>
      </div>

      <div className={styles.comparacion}>
        <div className={styles.compCard}>
          <span className={styles.compTitulo}>Eventos independientes</span>
          <span className={styles.compIcono} aria-hidden="true">🪙</span>
          <p>Monedas, dados, ruleta, lotería. <strong>El pasado NO afecta al futuro.</strong></p>
        </div>
        <div className={styles.compVs}>vs</div>
        <div className={styles.compCard}>
          <span className={styles.compTitulo}>Eventos dependientes</span>
          <span className={styles.compIcono} aria-hidden="true">🃏</span>
          <p>Sacar cartas de una baraja sin devolver. <strong>El pasado SÍ afecta al futuro</strong> (quedan menos cartas).</p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La clave: pregúntate <strong>&quot;¿el sistema tiene memoria?&quot;</strong> Una moneda no recuerda
          sus lanzamientos anteriores. Una baraja de cartas sí &quot;recuerda&quot; qué cartas ya salieron.
          Confundir ambas es la raíz de la falacia del jugador.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorProbabilidadPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('moneda');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'moneda': return <SeccionMoneda />;
      case 'dados': return <SeccionDados />;
      case 'cumple': return <SeccionCumple />;
      case 'falacia': return <SeccionFalacia />;
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo Funciona la Probabilidad</h1>
          <p className={styles.subtitle}>Tu intuición falla más de lo que crees — compruébalo con simulaciones</p>
        </header>
        <LegalNotice />

        <nav className={styles.navSecciones} aria-label="Secciones">
          {SECCIONES.map(s => (
            <button key={s.id} type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)} aria-pressed={seccionActiva === s.id}>
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.icono} {SECCIONES.find(s => s.id === seccionActiva)?.titulo}</h2>
          <p className={styles.seccionSub}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más matemáticas → <a href="/visualizador-peso-numeros/">El Peso de los Números</a> · <a href="/visualizador-sesgos-cognitivos/">Sesgos Cognitivos</a>
        </div>

        <EducationalSection title="La probabilidad en tu vida" subtitle="Por qué importa entender estos conceptos" defaultOpen={false}>
          <h3>Probabilidad y salud</h3>
          <p>Cuando un médico dice &quot;esta operación tiene un 95% de éxito&quot;, significa que 5 de cada 100 pacientes tendrán complicaciones. No que &quot;seguro sale bien&quot;. Entender probabilidad te ayuda a tomar decisiones médicas informadas.</p>
          <h3>Probabilidad y dinero</h3>
          <p>La lotería tiene una esperanza matemática negativa: por cada euro que juegas, esperas recuperar ~0,50 €. Las tragaperras devuelven ~0,75-0,90 € por euro. A largo plazo, siempre pierdes. La casa siempre gana — no por suerte, por matemáticas.</p>
          <h3>El riesgo que no calculas</h3>
          <p>Tienes más probabilidad de morir en accidente de coche yendo al aeropuerto que en el vuelo. Pero el cerebro teme más al avión porque los accidentes aéreos son mediáticos (heurística de disponibilidad + sesgo de probabilidad).</p>
          <div className={styles.warningBox}><strong>Nota:</strong> las simulaciones usan Math.random() del navegador, que es pseudoaleatorio pero suficiente para fines educativos. Las probabilidades teóricas asumen eventos ideales.</div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-probabilidad')} />
        <ShareCard appName="visualizador-probabilidad" />
        <Footer appName="visualizador-probabilidad" />
      </div>
    </>
  );
}
