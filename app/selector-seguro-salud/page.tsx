'use client';

import React, { useState } from 'react';
import styles from './SelectorSeguroSalud.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularResultado, PREGUNTAS, VEREDICTOS, type Resultado } from './motor';

// Las preguntas, los puntos, los veredictos y la lógica viven en ./motor.ts.

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function SelectorSeguroSalud() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) { setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor })); }
  function avanzar() {
    if (paso < totalPreguntas - 1) { setPaso(p => p + 1); }
    else { setResultado(calcularResultado(respuestas)); setPantalla('resultado'); }
  }
  function retroceder() { if (paso > 0) setPaso(p => p - 1); }
  function reiniciar() { setPantalla('intro'); setPaso(0); setRespuestas({}); setResultado(null); }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}><span aria-hidden="true">🏥</span> Asesor de Seguro de Salud</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro' ? '10 preguntas para saber si el seguro privado te aporta valor real'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu perfil de cobertura sanitaria</h1>
          <p className={styles.heroSubtitleSm}>Resultado orientativo basado en tu situación y uso médico</p>
        </header>
      )}

      <LegalNotice />
      <DisclaimerCard variant="general" severity="high" />

      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🏥</span>
              <span className={styles.introIcon}>🛡️</span>
              <span className={styles.introIcon}>💊</span>
              <span className={styles.introIcon}>🩺</span>
            </div>
            <h2 className={styles.introTitulo}>¿Sanidad pública o seguro privado?</h2>
            <p className={styles.introDesc}>
              España tiene una de las mejores sanidades públicas del mundo, pero las listas de espera,
              la saturación en algunas comunidades y situaciones personales concretas hacen que un seguro
              privado pueda aportar valor real. Este test analiza tu uso médico, situación y presupuesto
              para orientarte sin sesgos comerciales.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Veredicto claro: público, complementario o completo</li>
              <li><span aria-hidden="true">✅</span> Cobertura recomendada según tu perfil</li>
              <li><span aria-hidden="true">✅</span> Rango de precio orientativo en España</li>
              <li><span aria-hidden="true">✅</span> Consejos para comparar aseguradoras</li>
              <li><span aria-hidden="true">✅</span> Sin publicidad ni aseguradoras patrocinadas</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            {/* Lo anunciado y lo pintado van sobre la misma escala: preguntas RESPONDIDAS
                (paso / total). aria-valuenow era el número de pregunta con mínimo 1, y un
                lector de pantalla anunciaba otra fracción que la que se veía (mismo defecto y
                misma reparación que selector-smartphone, hallazgo 951). */}
            <div
              className={styles.progresoBar}
              role="progressbar"
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
                <button key={op.valor} type="button"
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
            <button type="button" className={styles.btnAnterior} onClick={retroceder} disabled={paso === 0} aria-label="Pregunta anterior">← Anterior</button>
            <button type="button" className={styles.btnSiguiente} onClick={avanzar} disabled={!respuestas[preguntaActual.id]} aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}>
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {pantalla === 'resultado' && resultado && (
        <div className={styles.resultadosContainer}>

          <div className={`${styles.veredictoCard} ${styles[`veredicto_${resultado.veredicto}`]}`}>
            <span className={styles.veredictoIcon} aria-hidden="true">{VEREDICTOS[resultado.veredicto].icon}</span>
            <p className={styles.veredictoLabel}>Orientación para tu perfil</p>
            <p className={styles.veredictoValor}>{VEREDICTOS[resultado.veredicto].nombre}</p>
            <p className={styles.veredictoDesc}>{VEREDICTOS[resultado.veredicto].descripcion}</p>
          </div>

          <div className={styles.coberturaGrid}>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>Cobertura recomendada</p>
              {VEREDICTOS[resultado.veredicto].cobertura.map((c, i) => (
                <p key={i} className={styles.coberturaItem}>{c}</p>
              ))}
            </div>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>Precio orientativo / mes</p>
              <p className={styles.precioRango}>{VEREDICTOS[resultado.veredicto].precioOrientativo}</p>
              <p className={styles.precioNota}>{VEREDICTOS[resultado.veredicto].precioNota}</p>
            </div>
          </div>

          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta orientación</p>
            {resultado.razones.map((r, i) => <p key={i} className={styles.razonItem}>{r}</p>)}
          </div>

          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de decidirte</p>
            {resultado.consejos.map((c, i) => <p key={i} className={styles.consejoItem}>{c}</p>)}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">← Repetir el test</button>

          <EducationalSection title="Guía completa: seguros de salud en España" subtitle="Sanidad pública, mutualidades, seguros privados y cómo comparar" defaultOpen={false}>
            <h3>El sistema sanitario español en 2025</h3>
            <p>España cuenta con un sistema sanitario público universal financiado por impuestos, considerado uno de los mejores del mundo en ranking de la OMS. Sin embargo, la saturación en ciertas comunidades ha disparado las listas de espera para especialistas: en algunas CCAA la espera para traumatología o dermatología puede superar los 6 meses.</p>

            <h3>¿Cuándo compensa el seguro privado?</h3>
            <p>El seguro privado no es para todo el mundo. Tiene más sentido en estas situaciones concretas:</p>
            <ul>
              <li><strong>Autónomos:</strong> sin baja por enfermedad garantizada, el acceso rápido al médico tiene valor económico directo.</li>
              <li><strong>Familias con hijos:</strong> la pediatría privada evita esperas en urgencias con niños enfermos.</li>
              <li><strong>Residentes en CCAA saturadas:</strong> donde las esperas en especialistas públicos superan los 3-4 meses.</li>
              <li><strong>Uso frecuente de especialistas:</strong> si vas 4-6 veces al año a especialistas, el tiempo ahorrado puede justificar el coste.</li>
              <li><strong>Segunda opinión médica:</strong> para diagnósticos complejos, el acceso rápido a otro especialista puede ser decisivo.</li>
            </ul>

            <h3>MUFACE e ISFAS: la opción de los funcionarios</h3>
            <p>Los funcionarios de la Administración General del Estado tienen acceso a MUFACE (civiles) o ISFAS/MUGEJU (militares y judiciales). Estas mutualidades ofrecen cobertura similar a un seguro privado completo a un coste muy inferior. Si eres funcionario, es casi siempre la mejor opción frente a contratar un seguro privado independiente.</p>

            <h3>Qué mirar al comparar aseguradoras</h3>
            <div className={styles.warningBox}>
              <strong>Atención a las carencias:</strong> casi todos los seguros tienen periodos durante los que no cubren ciertos servicios: partos (8 meses habitualmente), operaciones programadas (6-8 meses), ortodoncia (12 meses) y enfermedades preexistentes (variable). Contrata con suficiente antelación si tienes previsto usarlo pronto.
            </div>
            <ul>
              <li><strong>Red de médicos en tu ciudad:</strong> más importante que el precio. Consulta el cuadro médico de tu zona antes de contratar.</li>
              <li><strong>Copagos:</strong> algunos seguros son más baratos pero tienen copago por visita (3-8 €). Para uso frecuente, un seguro sin copago puede salir más económico.</li>
              <li><strong>Dental:</strong> generalmente es módulo aparte. Compara si te compensa añadirlo al seguro o contratar uno independiente (desde 8 €/mes).</li>
              <li><strong>Reembolso de gastos:</strong> algunos seguros con cuadro médico limitado permiten ir a cualquier médico y te reembolsan un porcentaje. Útil en zonas rurales.</li>
            </ul>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-seguro-salud')} />
      <ShareCard appName="selector-seguro-salud" />
      <Footer appName="selector-seguro-salud" />
    </div>
  );
}
