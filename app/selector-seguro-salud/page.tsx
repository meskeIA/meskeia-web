'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectorSeguroSalud.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard, DisclaimerCard, RegionBadge } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularResultado, PREGUNTAS, VEREDICTOS, TEXTO_CARENCIAS, TEXTO_COPAGO, TEXTO_ESPERA_SNS, type Resultado } from './motor';

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
  const tituloResultado = useRef<HTMLHeadingElement>(null);

  // Al pulsar «Ver resultado» la sección del test se desmonta con el botón que tenía el foco, y
  // el foco caía a <body>: se lleva al encabezado del resultado (familia de selectores, forma g).
  useEffect(() => {
    if (pantalla === 'resultado') tituloResultado.current?.focus();
  }, [pantalla]);

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
          <h1 className={styles.heroTitleSm} ref={tituloResultado} tabIndex={-1}>Tu perfil de cobertura sanitaria</h1>
          <p className={styles.heroSubtitleSm}>Resultado orientativo basado en tu situación y uso médico</p>
        </header>
      )}

      {/* Sistema Nacional de Salud, mutualidades de funcionarios, Ley de Contrato de Seguro y
          precios del mercado español: la app no sirve fuera de España (hallazgo 1431). */}
      <RegionBadge variant="es-only" fuenteDelegum={false} text="Solo España: basado en el sistema sanitario público español, sus mutualidades de funcionarios y la ley española de contrato de seguro" />

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
              La sanidad pública española es universal, pero las listas de espera y algunas situaciones
              personales concretas pueden hacer que un seguro privado aporte valor real. Este test analiza
              tu uso médico, tu situación y tu presupuesto para orientarte sin sesgos comerciales.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Veredicto claro: público, complementario o completo</li>
              <li><span aria-hidden="true">✅</span> Cobertura recomendada según tu perfil</li>
              <li><span aria-hidden="true">✅</span> Referencia de precio con su fuente</li>
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
            <p className={styles.veredictoDesc}>{resultado.descripcion}</p>
          </div>

          {/* Lo que la póliza puede no cubrir, o lo que no cabe en lo declarado, dicho a la cara y
              fuera de la guía plegada (hallazgos 1422, 1423 y 1424). */}
          {resultado.avisos.map((aviso) => (
            <p key={aviso} className={styles.aviso} role="note">
              <span aria-hidden="true">⚠️</span> {aviso}
            </p>
          ))}

          <div className={styles.coberturaGrid}>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>Cobertura recomendada</p>
              {VEREDICTOS[resultado.veredicto].cobertura.map((c, i) => (
                <p key={i} className={styles.coberturaItem}>{c}</p>
              ))}
            </div>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>Referencia de precio</p>
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
            {resultado.consejos.map((c) => (
              <p key={c.texto} className={styles.consejoItem}><span aria-hidden="true">{c.icono}</span> {c.texto}</p>
            ))}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">← Repetir el test</button>

          <EducationalSection title="Guía completa: seguros de salud en España" subtitle="Sanidad pública, mutualidades, seguros privados y cómo comparar" defaultOpen={false}>
            <h3>El sistema sanitario público español</h3>
            {/* Antes: «en 2025» en presente y «uno de los mejores del mundo en ranking de la OMS», sin
                año, que según el acta del Inspector es el del Informe sobre la salud en el mundo 2000
                (hallazgo 1429): se retira. Y «en algunas CCAA… más de 6 meses», sin fuente. */}
            <p>España cuenta con un sistema sanitario público de cobertura universal financiado por impuestos. Las esperas para el especialista cambian mucho entre zonas y especialidades: como referencia, {TEXTO_ESPERA_SNS}.</p>

            <h3>¿Cuándo compensa el seguro privado?</h3>
            <p>El seguro privado no es para todo el mundo. Tiene más sentido en estas situaciones concretas:</p>
            <ul>
              {/* Antes: «sin baja por enfermedad garantizada», falso desde 2019 (hallazgo 1428). */}
              <li><strong>Autónomos:</strong> la incapacidad temporal es de cobertura obligatoria en el régimen de autónomos desde el 1 de enero de 2019 (Real Decreto-ley 28/2018; hoy, art. 315 de la Ley General de la Seguridad Social), pero por enfermedad común la prestación se cobra desde el cuarto día de baja (art. 321) y es un porcentaje de la base reguladora. Una espera larga para el diagnóstico o el tratamiento puede alargar la baja, y eso tiene un coste económico directo.</li>
              <li><strong>Familias con hijos:</strong> la pediatría privada evita esperas en urgencias con niños enfermos.</li>
              <li><strong>Si en tu zona la espera es larga:</strong> cuanto más esperas para el especialista por encima de la media, más valor tiene un acceso rápido.</li>
              <li><strong>Uso frecuente de especialistas:</strong> si vas 4-6 veces al año a especialistas, el tiempo ahorrado puede justificar el coste.</li>
              <li><strong>Segunda opinión médica:</strong> para diagnósticos complejos, el acceso rápido a otro especialista puede ser decisivo.</li>
            </ul>

            <h3>MUFACE, ISFAS y MUGEJU: las mutualidades de funcionarios</h3>
            <p>El funcionariado civil del Estado está en MUFACE; el de las Fuerzas Armadas, en ISFAS, y el de la Administración de Justicia, en MUGEJU. En MUFACE e ISFAS cada titular elige entre la sanidad pública y una entidad concertada (en ISFAS, también la sanidad militar), y puede cambiar en los periodos que abre su mutualidad. Si eres mutualista, contratar además un seguro privado independiente rara vez tiene sentido: esa elección ya la tienes. Si eres funcionario/a sin mutualidad, tu asistencia es la del sistema público, como la de cualquier trabajador por cuenta ajena.</p>

            <h3>Qué mirar al comparar aseguradoras</h3>
            <div className={styles.warningBox}>
              <strong>Atención a las carencias:</strong> {TEXTO_CARENCIAS}. Además, la asistencia relacionada con enfermedades anteriores a la contratación suele quedar excluida de la cobertura (OCU). Contrata con suficiente antelación si tienes previsto usarlo pronto.
            </div>
            <ul>
              <li><strong>Red de médicos en tu ciudad:</strong> más importante que el precio. Consulta el cuadro médico de tu zona antes de contratar.</li>
              <li><strong>Copagos:</strong> algunos seguros son más baratos pero cobran un copago por visita, {TEXTO_COPAGO}. Para uso frecuente, un seguro sin copago puede salir más económico.</li>
              <li><strong>Dental:</strong> generalmente es módulo aparte. Compara si te compensa añadirlo al seguro o contratar uno independiente.</li>
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
