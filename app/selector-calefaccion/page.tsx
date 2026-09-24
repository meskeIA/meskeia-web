'use client';

import React, { useState } from 'react';
import styles from './SelectorCalefaccion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularResultado, SISTEMAS, PREGUNTAS, type Resultado } from './motor';

// Los sistemas, las preguntas con sus pesos y la lógica de recomendación viven en ./motor.ts.

/** Lista legible: «A, B y C». */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function SelectorCalefaccion() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      setResultado(calcularResultado(respuestas));
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('intro');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}><span aria-hidden="true">🏠</span> Asesor de Calefacción</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro'
              ? '10 preguntas para saber qué sistema de calefacción te conviene'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu sistema de calefacción ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu vivienda y situación</p>
        </header>
      )}

      <LegalNotice />
      <DisclaimerCard variant="financial" severity="critical" />

      {/* ── INTRO ── */}
      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🌡️</span>
              <span className={styles.introIcon}>⚡</span>
              <span className={styles.introIcon}>🔥</span>
              <span className={styles.introIcon}>🪵</span>
            </div>
            <h2 className={styles.introTitulo}>¿Aerotermia, gas o bomba de calor?</h2>
            <p className={styles.introDesc}>
              Elegir el sistema de calefacción es una decisión que afecta a tu confort y a tu factura durante 15-20 años.
              El mercado ha cambiado mucho: las bombas de calor y la aerotermia están desbancando al gas gracias a las
              subvenciones y a su mayor eficiencia. Este test analiza tu vivienda y situación real para orientarte.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Sistema principal recomendado con alternativa</li>
              <li><span aria-hidden="true">✅</span> Coste de instalación y coste anual orientativo</li>
              <li><span aria-hidden="true">✅</span> Pros y contras de cada tecnología</li>
              <li><span aria-hidden="true">✅</span> Información sobre subvenciones disponibles</li>
              <li><span aria-hidden="true">✅</span> Consejos personalizados según tu situación</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {/* ── TEST ── */}
      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              // Lo anunciado y lo pintado van sobre la misma escala: preguntas RESPONDIDAS
              // (paso / total). aria-valuenow era el número de pregunta con mínimo 1, y un
              // lector de pantalla anunciaba otra fracción que la que se veía (mismo defecto
              // y misma reparación que selector-smartphone, hallazgo 951).
              aria-label={`Pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${paso + 1} de ${totalPreguntas}`}
            >
              <div className={styles.progresoRelleno} data-progreso={progreso} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icon}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.pregunta}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                  // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                  // radio dentro (selector-smartphone, hallazgo 950).
                  role="radio"
                  aria-checked={respuestas[preguntaActual.id] === op.valor}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={retroceder} disabled={paso === 0} aria-label="Pregunta anterior">
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={avanzar}
              disabled={!respuestas[preguntaActual.id]}
              aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}
            >
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTADO ── */}
      {pantalla === 'resultado' && resultado && (
        <div className={styles.resultadosContainer}>

          {/* Recomendaciones */}
          <div className={styles.recomendacionGrid}>
            <div className={styles.recomendacionCard}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{SISTEMAS[resultado.sistemaPrincipal].icon}</span>
              <p className={styles.recomendacionLabel}>Tu mejor opción</p>
              <p className={styles.recomendacionValor}>{SISTEMAS[resultado.sistemaPrincipal].nombre}</p>
              <p className={styles.recomendacionDesc}>{SISTEMAS[resultado.sistemaPrincipal].descripcion}</p>
            </div>
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardAlt}`}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{SISTEMAS[resultado.sistemaAlternativa].icon}</span>
              <p className={styles.recomendacionLabel}>Alternativa a considerar</p>
              <p className={styles.recomendacionValor}>{SISTEMAS[resultado.sistemaAlternativa].nombre}</p>
              <p className={styles.recomendacionDesc}>{SISTEMAS[resultado.sistemaAlternativa].descripcion}</p>
            </div>
          </div>

          {/* Un empate no se resuelve en silencio por el orden del código: antes lo ganaba
              siempre la aerotermia, que era la primera del array de puntuaciones. */}
          {resultado.empatados.length > 0 && (
            <p className={styles.avisoEmpate} role="note">
              <span aria-hidden="true">⚖️</span> Empate: con tus respuestas,{' '}
              {enumerar([resultado.sistemaPrincipal, ...resultado.empatados].map(k => SISTEMAS[k].conArticulo))}{' '}
              encajan exactamente igual; {resultado.criterioDesempate}.
            </p>
          )}

          {/* Costes */}
          <div className={styles.costesSection}>
            <p className={styles.costesTitulo}>Costes orientativos — {SISTEMAS[resultado.sistemaPrincipal].nombre}</p>
            <p className={styles.costesNota}>Estimaciones aproximadas. Varían según marca, tamaño de vivienda e instalador.</p>
            <div className={styles.costesGrid}>
              <div className={styles.costeItem}>
                <p className={styles.costeLabel}>Instalación</p>
                <p className={styles.costeValor}>{SISTEMAS[resultado.sistemaPrincipal].costeInstalacion}</p>
              </div>
              <div className={styles.costeItem}>
                <p className={styles.costeLabel}>Coste anual</p>
                <p className={styles.costeValor}>{SISTEMAS[resultado.sistemaPrincipal].costeAnual}</p>
              </div>
              <div className={styles.costeItem}>
                <p className={styles.costeLabel}>Vida útil</p>
                <p className={styles.costeValor}>15 – 25 años</p>
              </div>
            </div>
          </div>

          {/* Razones */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta recomendación</p>
            {resultado.razones.map((r, i) => (
              <p key={i} className={styles.razonItem}>{r}</p>
            ))}
          </div>

          {/* Subvenciones */}
          {resultado.subvenciones && (
            <div className={styles.subvencionesSection}>
              <p className={styles.subvencionesTitulo}><span aria-hidden="true">🏛️</span> Subvenciones disponibles en 2025</p>
              <p className={styles.subvencionesDesc}>
                El programa <strong>Next Generation EU</strong> y el <strong>PERTE Industria Verde</strong> ofrecen ayudas
                de hasta el <strong>40-60% del coste</strong> para instalación de bombas de calor, aerotermia y sistemas
                de energía renovable. Se tramitan a través de cada comunidad autónoma. Consulta el portal del{' '}
                <strong>IDAE (idae.es)</strong> o tu ayuntamiento para los programas vigentes en tu zona.
              </p>
            </div>
          )}

          {/* Consejos */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de decidirte</p>
            {resultado.consejos.map((c, i) => (
              <p key={i} className={styles.consejoItem}>{c}</p>
            ))}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>

          <EducationalSection
            title="Guía completa: sistemas de calefacción en España 2025"
            subtitle="Aerotermia, bomba de calor, gas, pellet y eléctrico explicados"
            defaultOpen={false}
          >
            <h3>El mapa de tecnologías en 2025</h3>
            <p>
              La calefacción en España está viviendo una transición acelerada. La normativa europea (Directiva de Eficiencia
              Energética de Edificios) obliga a que las nuevas instalaciones sean cada vez más eficientes, y las subvenciones
              públicas están haciendo que la aerotermia y las bombas de calor sean la opción más rentable a largo plazo.
            </p>

            <h3>Aerotermia: la gran protagonista</h3>
            <p>
              La aerotermia es una bomba de calor aire-agua: extrae calor del aire exterior (incluso a temperaturas negativas)
              y lo transfiere al agua del circuito de calefacción. Un equipo estándar produce 3-4 kWh de calor por cada kWh
              eléctrico consumido (COP 3-4). Puede alimentar radiadores, suelo radiante y producir agua caliente sanitaria.
            </p>
            <p>
              Su principal ventaja frente al gas es que el precio de la electricidad puede estabilizarse con tarifa supervalle
              y paneles solares, mientras que el gas natural está sujeto a volatilidad de mercados internacionales.
            </p>

            <h3>Bomba de calor (split): la opción intermedia</h3>
            <p>
              Los equipos de aire acondicionado invertido (splits) también funcionan como calefacción con buena eficiencia.
              Son más baratos de instalar que la aerotermia y no requieren conexión a radiadores. Ideales en zonas cálidas
              o como complemento en pisos donde no hay caldera.
            </p>

            <h3>Gas natural: cuándo tiene sentido mantenerlo</h3>
            <p>
              Si tienes una caldera de gas reciente (menos de 7 años) en buen estado, cambiarla ahora no es rentable.
              La vida útil de una buena caldera es de 15-20 años. La estrategia más sensata es planificar la sustitución
              por aerotermia cuando llegue al final de su vida útil, aprovechando entonces las subvenciones disponibles.
            </p>
            <div className={styles.warningBox}>
              <strong>Normativa 2025:</strong> La UE ha establecido que a partir de 2025 las calderas de gas nuevas
              deben cumplir requisitos de mezcla con hidrógeno o biogás. En nuevas construcciones, la tendencia es
              hacia sistemas totalmente libres de combustibles fósiles. Para rehabilitaciones, el gas sigue siendo
              una opción legal pero con menor apoyo de subvenciones.
            </div>

            <h3>Pellet: la renovable más económica en zonas sin gas</h3>
            <p>
              En zonas rurales sin acceso a gas natural, el pellet es la opción renovable con menor coste energético por kWh.
              El pellet de madera tiene un precio estable y su producción es mayoritariamente nacional. Las calderas modernas
              tienen alimentación automática y rendimientos superiores al 90%.
            </p>

            <h3>Cómo aprovechar las subvenciones</h3>
            <p>
              Las ayudas del plan <strong>MOVES</strong>, <strong>PERTE</strong> y los fondos <strong>Next Generation EU</strong>
              canalizados por las comunidades autónomas pueden cubrir entre el 40% y el 70% del coste en el caso de
              instalaciones renovables (aerotermia, geotermia, biomasa). Los plazos y condiciones varían por CCAA.
              El portal <strong>idae.es</strong> mantiene un buscador de ayudas actualizado.
            </p>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-calefaccion')} />
      <ShareCard appName="selector-calefaccion" />
      <Footer appName="selector-calefaccion" />
    </div>
  );
}
