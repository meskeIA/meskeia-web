'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useCallback } from 'react';
import styles from './SimuladorEcosistemaTrofico.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
// El modelo de la cascada (tipos, ecosistemas, eventos, ATENUACION y aplicarEvento) vive en
// `motor.ts` desde el 23/09/2026: lo comparten el simulador y los casos para clase, y una
// sola implementación es lo que impide que la app suspenda una respuesta que ella misma pinta.
import {
  AVISO_BIOMAGNIFICACION,
  ECOSISTEMAS,
  EVENTOS,
  aplicarEvento,
  perturbacionAplicable,
  type Evento,
  type NivelTrofico,
  type TipoEvento,
} from './motor';
import CasosAula from './CasosAula';

// ============================================
// TEXTO DINÁMICO DE EXPLICACIÓN
// ============================================

/** El porcentaje de cambio que imprime el panel «¿Qué está pasando?», sobre la población sin redondear. */
function cambioPorcentual(nuevo: number, original: number): number {
  return Math.round(Math.abs((nuevo - original) / original * 100));
}

/** El panel solo nombra un nivel si su cambio pasa de este porcentaje. */
const UMBRAL_PANEL = 2;

/**
 * La cifra que se pinta de una población (barra, pirámide y `aria-valuenow`) y sus decimales.
 *
 * Entera, SALVO cuando el redondeo escondería un cambio que el panel sí anuncia. Con enteros,
 * bosque + sequía al 50 % llevaba a los superdepredadores de 4 a 3,59 y la barra seguía
 * diciendo «4», sin delta, mientras el panel decía «se han reducido… un 10 %» (hallazgo 1609).
 * Ahora se pinta «3,6 (-0,4)». Con el umbral del panel, un cambio que el panel calla (sequía al
 * 1 %: herbívoros 39,83) sigue saliendo «40» sin delta, como exige el hallazgo 328.
 */
function cifraPoblacion(actual: number, original: number): { valor: number; decimales: 0 | 1 } {
  const entera = Math.round(actual);
  if (entera === original && cambioPorcentual(actual, original) > UMBRAL_PANEL) {
    return { valor: Math.round(actual * 10) / 10, decimales: 1 };
  }
  return { valor: entera, decimales: 0 };
}

function generarExplicacion(
  evento: Evento,
  niveles: NivelTrofico[],
  originales: NivelTrofico[],
  intensidad: number
): string {
  if (evento.id === 'ninguno') {
    return 'El ecosistema está en equilibrio. Las poblaciones se mantienen estables gracias al balance entre predadores y presas. Cada nivel trófico regula al siguiente mediante retroalimentación negativa.';
  }

  // «Reducir» es pronominal en este uso («se han reducido»); «aumentar», no («han aumentado»).
  const verbo = (n: number, o: number): string => n < o ? 'se han reducido' : 'han aumentado';
  const nivelNombres = originales.map(n => n.nombre.toLowerCase());

  // El verbo solo se repite cuando cambia de sentido respecto al nivel anterior:
  // «Los productores se han reducido un 30 %, los herbívoros un 21 %…»
  const partes: string[] = [];
  let verboAnterior = '';

  for (let i = 0; i < niveles.length; i++) {
    const porc = cambioPorcentual(niveles[i].poblacion, originales[i].poblacion);
    if (porc > UMBRAL_PANEL) {
      const verboNivel = verbo(niveles[i].poblacion, originales[i].poblacion);
      const sujeto = `${partes.length === 0 ? 'Los' : 'los'} ${nivelNombres[i]}`;
      partes.push(
        verboNivel === verboAnterior
          ? `${sujeto} un ${porc} %`
          : `${sujeto} ${verboNivel} un ${porc} %`
      );
      verboAnterior = verboNivel;
    }
  }

  let texto = evento.descripcion + '. ';

  if (partes.length === 0) {
    texto += `Con una intensidad del ${Math.round(intensidad * 100)} %, el impacto en las poblaciones es mínimo.`;
  } else if (partes.length === 1) {
    texto += partes[0] + '.';
  } else {
    texto += partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1] + '. ';
    texto += 'Esta es la cascada trófica en acción: la perturbación de un nivel se propaga a todos los demás.';
  }

  // Con la contaminación la cascada pinta la cúspide como el nivel MENOS afectado: se avisa de
  // lo que el modelo deja fuera (hallazgo 1607). Si no hay impacto, no hay nada que matizar.
  if (evento.id === 'contaminacion' && partes.length > 0) {
    texto += ' ' + AVISO_BIOMAGNIFICACION;
  }

  return texto;
}

// ============================================
// COLORES POR NIVEL
// ============================================
// Salen de variables del módulo CSS (hallazgo 1612). Eran hex fijos (#d4a017 para los
// herbívoros) que servían igual de relleno y de TEXTO: la cifra de la barra daba 2,38:1 en
// claro y, en oscuro, la de productores 2,87:1. Ahora el relleno y el fondo de la pirámide
// usan `--color-*` (blanco encima ≥ 5:1) y las cifras, `--texto-*`, que tiene variante oscura.
const COLORES_NIVEL = [
  'var(--color-productor)',
  'var(--color-herbivoro)',
  'var(--color-carnivoro)',
  'var(--color-superdepr)',
];
const COLORES_TEXTO_NIVEL = [
  'var(--texto-productor)',
  'var(--texto-herbivoro)',
  'var(--texto-carnivoro)',
  'var(--texto-superdepr)',
];

const NOMBRES_CLASE_NIVEL = [
  styles.nivelProductor,
  styles.nivelHerbivoro,
  styles.nivelCarnivoro,
  styles.nivelSuperdepr,
] as const;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorEcosistemaTroficoPage() {
  const [ecosistemaId, setEcosistemaId] = useState<string>('pradera');
  const [eventoId, setEventoId] = useState<TipoEvento>('ninguno');
  const [intensidad, setIntensidad] = useState<number>(0.5);

  const ecosistema = ECOSISTEMAS.find(e => e.id === ecosistemaId) ?? ECOSISTEMAS[0];
  // Una perturbación sin sentido en este ecosistema (sequía en el océano) no se aplica nunca.
  const evento =
    (perturbacionAplicable(ecosistema, eventoId) ? EVENTOS.find(e => e.id === eventoId) : undefined) ?? EVENTOS[0];
  const eventosDisponibles = EVENTOS.filter(ev => perturbacionAplicable(ecosistema, ev.id));
  const notasNoAplicables = Object.values(ecosistema.perturbacionesNoAplicables ?? {}).filter(
    (nota): nota is string => typeof nota === 'string'
  );

  const nivelesActuales = useMemo(
    () => aplicarEvento(ecosistema.niveles, evento, intensidad),
    [ecosistema, evento, intensidad]
  );

  const explicacion = useMemo(
    () => generarExplicacion(evento, nivelesActuales, ecosistema.niveles, intensidad),
    [evento, nivelesActuales, ecosistema.niveles, intensidad]
  );

  // Pirámide: nivel 0 = base (más ancho), nivel 3 = cúspide (más estrecho)
  // Los niveles se muestran de abajo a arriba, así que invertimos para el render
  const nivelesInvertidos = [...nivelesActuales].reverse();
  const clasesInvertidas = [...NOMBRES_CLASE_NIVEL].reverse();

  // Anchos de pirámide: base 100%, luego 75%, 50%, 30%
  const anchosPiramide = ['30%', '55%', '75%', '100%'];

  const handleReset = () => {
    setEventoId('ninguno');
    setIntensidad(0.5);
  };

  /**
   * «Cargar en el simulador» de los casos para clase: pone el ecosistema, la perturbación y
   * la intensidad del caso con los MISMOS tres setters que usan los controles, y sube la vista
   * hasta ellos para que el alumno vea la cascada que acaba de predecir.
   */
  const refControles = useRef<HTMLDivElement>(null);
  const cargarCasoEnSimulador = useCallback(
    (idEcosistema: string, idEvento: TipoEvento, intensidadCaso: number) => {
      setEcosistemaId(idEcosistema);
      setEventoId(idEvento);
      setIntensidad(intensidadCaso);
      const reducirMovimiento =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      refControles.current?.scrollIntoView({
        behavior: reducirMovimiento ? 'auto' : 'smooth',
        block: 'center',
      });
    },
    []
  );

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🌍</span> Simulador de Ecosistema: Cadena Trófica</h1>
          <p className={styles.subtitle}>
            Selecciona un ecosistema, aplica una perturbación y observa cómo la cascada trófica
            transforma cada nivel. Aprende la regla del 10&nbsp;% de la energía en acción.
          </p>
        </header>

        <LegalNotice />

        {/* SELECTOR DE ECOSISTEMA */}
        <div ref={refControles} className={styles.ecosistemaSelector} role="group" aria-label="Seleccionar ecosistema">
          {ECOSISTEMAS.map(eco => (
            <button
              type="button"
              key={eco.id}
              className={`${styles.ecosistemaBtn} ${ecosistemaId === eco.id ? styles.ecosistemaBtnActivo : ''}`}
              onClick={() => { setEcosistemaId(eco.id); setEventoId('ninguno'); }}
              aria-pressed={ecosistemaId === eco.id}
            >
              <span aria-hidden="true">{eco.emoji}</span>
              <span>{eco.nombre}</span>
            </button>
          ))}
        </div>

        {/* SELECTOR DE EVENTO */}
        <div className={styles.eventoSelector} role="group" aria-label="Seleccionar perturbación">
          {eventosDisponibles.map(ev => (
            <button
              type="button"
              key={ev.id}
              className={`${styles.eventoBtn} ${evento.id === ev.id ? styles.eventoBtnActivo : ''}`}
              onClick={() => setEventoId(ev.id)}
              aria-pressed={evento.id === ev.id}
              title={ev.descripcion}
            >
              {ev.nombre}
            </button>
          ))}
        </div>
        {notasNoAplicables.map(nota => (
          <p key={nota} className={styles.eventoNota}>{nota}</p>
        ))}

        {/* SLIDER DE INTENSIDAD */}
        {evento.id !== 'ninguno' && (
          <div className={styles.intensidadRow}>
            <label htmlFor="slider-intensidad" className={styles.intensidadLabel}>
              Intensidad de la perturbación: <strong>{Math.round(intensidad * 100)}&nbsp;%</strong>
            </label>
            <input
              id="slider-intensidad"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={intensidad}
              onChange={e => setIntensidad(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Intensidad de la perturbación"
            />
          </div>
        )}

        {/* VISUALIZACIÓN PRINCIPAL */}
        <div className={styles.simLayout}>
          {/* PIRÁMIDE TRÓFICA */}
          {/* `role="list"`: los cuatro escalones llevan role="listitem", y un listitem sin
              lista padre es inválido — los lectores de pantalla no anunciaban ni la lista ni
              la posición de cada nivel, que es justo la información que ordena una pirámide
              trófica (hallazgo 327). */}
          <div className={styles.piramide} role="list" aria-label="Pirámide trófica">
            <p className={styles.piramideTitulo}>Pirámide trófica</p>
            {nivelesInvertidos.map((nivel, idx) => {
              const idxOriginal = 3 - idx;
              const cifra = cifraPoblacion(nivel.poblacion, ecosistema.niveles[idxOriginal].poblacion);
              return (
                <div key={nivel.nombre} className={styles.nivelWrapper}>
                  {/* Flecha de energía entre niveles (no en el último = base) */}
                  {/* La flecha apunta hacia ARRIBA, que es donde va la energía. Decía
                      «↓ 10% energía» sobre una pirámide con los productores en la base, así
                      que leída literalmente enseñaba que el 10% pasa de los superdepredadores
                      a los carnívoros y de estos a los herbívoros: justo lo contrario de la
                      regla de Lindeman que el subtítulo de la app promete enseñar
                      (hallazgo 325). Va aria-hidden, así que el error solo lo veía quien mira
                      — es decir, el público de secundaria al que apunta la metadata. */}
                  {idx > 0 && (
                    <div className={styles.flechaEnergia} aria-hidden="true">
                      <span>↑ solo el 10&nbsp;% de la energía sube a este nivel</span>
                    </div>
                  )}
                  <div
                    className={`${styles.nivelPiramide} ${clasesInvertidas[idx]}`}
                    style={{ width: anchosPiramide[idx] }}
                    role="listitem"
                  >
                    <span className={styles.nivelEmoji} aria-hidden="true">{nivel.emoji}</span>
                    <div className={styles.nivelInfo}>
                      <span className={styles.nivelNombre}>{nivel.nombre}</span>
                      <span className={styles.nivelEjemplos}>{ecosistema.niveles[idxOriginal].ejemplos}</span>
                      <span className={styles.nivelPob}>
                        {formatNumber(cifra.valor, cifra.decimales)} ind. rel.
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BARRAS DE POBLACIÓN */}
          <div className={styles.barrasPanel} aria-label="Barras de población por nivel">
            <p className={styles.barrasTitulo}>Población relativa</p>
            {nivelesActuales.map((nivel, idx) => {
              const original = ecosistema.niveles[idx];
              const porcActual = nivel.poblacion;
              const porcOriginal = original.poblacion;
              const color = COLORES_NIVEL[idx];
              // La cifra y su delta salen de `cifraPoblacion`, la misma que usa la pirámide.
              const cifra = cifraPoblacion(porcActual, porcOriginal);
              const delta = cifra.valor - porcOriginal;
              const textoCifra = formatNumber(cifra.valor, cifra.decimales);
              return (
                <div key={nivel.nombre} className={styles.barraGrupo}>
                  <div className={styles.barraLabelRow}>
                    <span className={styles.barraLabel}>
                      <span aria-hidden="true">{nivel.emoji}</span> {nivel.nombre}
                    </span>
                    <span className={styles.barraValor} style={{ color: COLORES_TEXTO_NIVEL[idx] }}>
                      {textoCifra}
                      {/* El delta se decide sobre la cifra IMPRESA. Comparando los valores sin
                          redondear, una sequía al 1 % pintaba «40 (0)» —un cambio de cero
                          anunciado como si fuera un cambio— porque la diferencia real era
                          0,168 (hallazgo 328). */}
                      {delta !== 0 && (
                        <span className={styles.barraDelta}>
                          {' '}({delta > 0 ? '+' : ''}{formatNumber(delta, cifra.decimales)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className={styles.barraTrack}>
                    <div
                      className={styles.barraOriginal}
                      style={{ width: `${porcOriginal}%` }}
                      aria-hidden="true"
                    />
                    <div
                      className={styles.barraActual}
                      style={{ width: `${porcActual}%`, backgroundColor: color }}
                      role="meter"
                      aria-valuenow={cifra.valor}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${nivel.nombre}: ${textoCifra} individuos relativos`}
                    />
                  </div>
                </div>
              );
            })}

            {/* Leyenda energía */}
            <div className={styles.leyendaEnergia}>
              <p className={styles.leyendaNota}>
                Esta leyenda representa la <strong>transferencia de energía</strong> entre niveles (regla del 10&nbsp;%),
                un concepto distinto de la <strong>población relativa</strong> mostrada en las barras de arriba:
                un nivel puede tener pocos individuos pero canalizar mucha energía, o al contrario.
              </p>
              {/* Las cifras se LEEN del dato (`energiaPorcentaje`), no se escriben a mano.
                  Estaban rellenas en los 16 niveles de los cuatro ecosistemas y no se leían
                  en ninguna parte del render: eran dos fuentes para el mismo número, y nada
                  habría detectado que una cambiara sin la otra (hallazgo 329). Y como cada
                  ecosistema tiene sus propios nombres de nivel, la leyenda ahora los sigue en
                  vez de dar por hecho los de la pradera. */}
              <div className={styles.leyendaFila}>
                {ecosistema.niveles.map((nivel, idx) => (
                  <div className={styles.leyendaLinea} key={nivel.nombre}>
                    <div className={styles.leyendaProduces} style={{ background: COLORES_NIVEL[idx] }} />
                    <span>
                      {nivel.nombre}: {formatNumber(nivel.energiaPorcentaje, nivel.energiaPorcentaje < 1 ? 1 : 0)}&nbsp;%
                      {idx === 0 ? ' energía solar' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DE EXPLICACIÓN */}
        <div className={styles.panelExplicacion} role="status" aria-live="polite">
          <h2 className={styles.explicacionTitulo}>¿Qué está pasando?</h2>
          <p className={styles.explicacionTexto}>{explicacion}</p>
        </div>

        {/* BOTÓN RESTABLECER */}
        <div className={styles.resetRow}>
          <button type="button" onClick={handleReset} className={styles.btnReset}>
            <span aria-hidden="true">🔄</span> Restablecer equilibrio
          </button>
        </div>

        {/* CASOS PARA CLASE — predicción antes de mover (el cálculo vive en casos.ts) */}
        <CasosAula onCargarEnSimulador={cargarCasoEnSimulador} />

        {/* BLOQUE EDUCATIVO v2.0 */}
        <EducationalSection
          title="Aprende sobre cadenas tróficas y ecosistemas"
          subtitle="La regla del 10&nbsp;%, las cascadas tróficas y las especies clave explicadas"
        >
          <section>
            <h3>¿Qué es una cadena trófica y la regla del 10&nbsp;%?</h3>
            <p>
              Una <strong>cadena trófica</strong> es la secuencia ordenada de organismos en un ecosistema
              según quién come a quién. Cada eslabón se denomina <em>nivel trófico</em>: productores
              (plantas, algas, fitoplancton), consumidores primarios (herbívoros), consumidores secundarios
              (carnívoros) y depredadores ápice o superdepredadores.
            </p>
            {/* Decía «la regla del 10 % (o ley de Lindeman, 1942) establece»: Lindeman no la
                llamó ley y citó eficiencias del 0,1 % al 37,5 % (Wikipedia, «Ecological
                efficiency»). Es una media con mucha dispersión (hallazgo 1610). */}
            <p>
              La llamada <strong>regla del 10&nbsp;%</strong>, que se suele atribuir al trabajo de
              Raymond Lindeman (1942), resume una tendencia media: de la energía acumulada en un nivel
              trófico, en promedio solo en torno al 10&nbsp;% llega a formar parte del siguiente. No es una
              ley exacta: el propio Lindeman no la llamó ley y citó eficiencias desde el 0,1&nbsp;% hasta
              el 37,5&nbsp;%, y la cifra real cambia mucho entre ecosistemas y grupos de organismos. El resto
              se pierde como calor en la respiración o queda en heces, restos y tejidos no consumidos,
              que aprovechan los descomponedores. Por eso la pirámide de energía tiene base ancha: hace
              falta mucha vegetación para mantener a pocos depredadores ápice.
            </p>
            <div className={styles.formulaBox}>
              Energía en nivel n+1 ≈ Energía en nivel n × 0,10
            </div>
          </section>

          <section>
            <h3>Comparativa de ecosistemas: productores, herbívoros y amenazas</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Ecosistema</th>
                    <th>Productor base</th>
                    <th>Herbívoro clave</th>
                    <th>Depredador tope</th>
                    <th>Amenaza principal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span aria-hidden="true">🌾</span> Pradera</td>
                    <td>Gramíneas (Poaceae)</td>
                    <td>Conejos, topillos</td>
                    <td>Águila real</td>
                    <td>Desertificación</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">🌲</span> Bosque Templado</td>
                    <td>Robles y hayas</td>
                    <td>Ciervos (Cervus elaphus)</td>
                    <td>Lobo gris</td>
                    <td>Deforestación</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">🌊</span> Océano</td>
                    <td>Fitoplancton</td>
                    <td>Zooplancton / krill</td>
                    <td>Gran tiburón blanco</td>
                    <td>Acidificación + sobrepesca</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">🌅</span> Sabana</td>
                    <td>Gramíneas tropicales</td>
                    <td>Cebras y ñus</td>
                    <td>León africano</td>
                    <td>Sequía + fragmentación</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">🏔️</span> Tundra Ártica</td>
                    <td>Líquenes y musgos</td>
                    <td>Caribús, lemmings</td>
                    <td>Oso polar</td>
                    <td>Deshielo ártico (cambio climático)</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">🌿</span> Manglar</td>
                    <td>Mangle (Rhizophora spp.)</td>
                    <td>Cangrejos fangosos</td>
                    <td>Cocodrilo marino</td>
                    <td>Tala costera, contaminación</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3>4 escenarios reales de cascadas tróficas</h3>
            <div className={styles.scenariosGrid}>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🐺</span>
                <strong>Reintroducción del lobo en Yellowstone (EE. UU., 1995)</strong>
                <p>
                  La vuelta de los lobos redujo a los ciervos y cambió su comportamiento (dejaron
                  de pastar en zonas abiertas). Los valles se revegetaron, los ríos se estabilizaron
                  y aumentó la biodiversidad. Ejemplo clásico de cascada trófica positiva («trophic
                  cascade») y del papel clave de una sola especie.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🦈</span>
                <strong>Sobrepesca de tiburones en el Atlántico noroeste</strong>
                <p>
                  Según Myers et al. (2007, <em>Science</em>), el desplome de los grandes tiburones
                  costeros en varias décadas disparó la población de rayas (sus presas), que arrasaron
                  los bancos de vieiras. La industria pesquera de Carolina del Norte colapsó. Eliminar
                  un superdepredador puede destruir toda la red alimentaria subyacente.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🌳</span>
                <strong>Deforestación amazónica y ciclos del agua</strong>
                <p>
                  Los árboles amazónicos generan los «ríos voladores» que alimentan las lluvias
                  en el sur de Sudamérica. Sin productores, no solo colapsa la cadena trófica local:
                  también cambia el régimen hídrico regional, afectando a ecosistemas a miles de
                  kilómetros de distancia.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">💧</span>
                <strong>Eutrofización de lagos y proliferación de algas</strong>
                <p>
                  El exceso de nutrientes (nitratos, fosfatos) dispara la producción de algas
                  (nivel productor). Al morir las algas, las bacterias las descomponen consumiendo
                  todo el oxígeno. El lago se vuelve anóxico y prácticamente todos los niveles
                  superiores de la cadena trófica colapsan.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3>Preguntas frecuentes sobre ecología trófica</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Qué es una especie clave (keystone species)?</h4>
                <p>
                  Una <strong>especie clave</strong> es aquella cuyo impacto en el ecosistema es
                  desproporcionadamente grande en relación con su biomasa. Su desaparición provoca
                  cambios radicales en la estructura de toda la comunidad biológica. Ejemplos:
                  el lobo en los bosques boreales, la nutria marina en los kelps del Pacífico,
                  los elefantes en la sabana africana y las estrellas de mar Pisaster en la costa
                  noroeste de EE. UU. (el caso original descrito por Paine, 1969).
                </p>
                {/* Prometía «la eliminación de un nivel», y el suelo del modelo la hace
                    imposible en cualquier ecosistema y a cualquier intensidad: el peor
                    impacto es −0,7 y la menor población de carnívoros es 12, así que nunca se
                    baja de 5 (hallazgo 323). Se describe lo que el simulador SÍ enseña, y se
                    dice por qué no llega a cero: es un modelo simplificado con suelo, no una
                    afirmación de que un nivel no pueda extinguirse. */}
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> En el simulador, prueba &quot;caza excesiva del
                  depredador&quot; al 100&nbsp;% en la pradera: los carnívoros caen a un tercio y el efecto
                  recorre toda la pirámide, apagándose a cada nivel. El modelo tiene un suelo de
                  población y no llega a cero —es una simplificación, no una afirmación de que un
                  nivel no pueda extinguirse—, pero la forma de la cascada es la misma que
                  describen los casos reales de arriba.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Por qué la pirámide de energía siempre tiene base ancha?</h4>
                <p>
                  Porque la energía se <strong>disipa</strong> en cada transferencia. De media, solo en
                  torno al 10&nbsp;% pasa al nivel siguiente (la cifra real varía mucho); el resto se usa en
                  el metabolismo y se pierde como calor, o queda en partes no consumidas (raíces, huesos,
                  celulosa). Con una eficiencia del 10&nbsp;% en cada paso, 1 kg de depredador ápice
                  necesitaría del orden de 10 kg de carnívoro, 100 kg de herbívoro y 1.000 kg de
                  productor. Esa pérdida en cada paso es una de las razones de que las cadenas tróficas
                  sean cortas.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> La segunda ley de la termodinámica es la raíz de este principio: en toda
                  transferencia de energía siempre hay pérdidas irrecuperables (entropía).
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué es una cascada trófica?</h4>
                <p>
                  Una <strong>cascada trófica</strong> es el efecto indirecto que la alteración de
                  un nivel trófico produce en los niveles no adyacentes. Puede ser descendente
                  (<em>top-down</em>): cuando los depredadores controlan a los herbívoros y
                  esto beneficia a las plantas; o ascendente (<em>bottom-up</em>): cuando la
                  disponibilidad de recursos (plantas, nutrientes) determina la abundancia de todos
                  los niveles superiores.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> La mayoría de ecosistemas funcionan con ambas direcciones al mismo tiempo,
                  aunque generalmente domina una según el contexto.
                </p>
              </div>

              {/* Hallazgo 1607: la perturbación «Contaminación del agua» pinta la cúspide como el
                  nivel menos afectado, que con pesticidas persistentes es lo contrario de lo que
                  se enseña en clase. Se explica aquí, con la fuente, qué deja fuera el modelo. */}
              <div className={styles.faqItem}>
                <h4>¿Qué es la biomagnificación y por qué el simulador no la calcula?</h4>
                <p>
                  Un contaminante <strong>persistente</strong> (que el organismo no degrada ni
                  elimina bien, como el DDT o el mercurio) se acumula en los tejidos
                  (<em>bioacumulación</em>) y pasa al depredador con cada presa que se come, así que su
                  concentración aumenta a cada nivel que sube (<em>biomagnificación</em>). En un
                  estuario de Long Island (EE. UU.), Woodwell, Wurster e Isaacson (<em>Science</em>,
                  1967) midieron DDT desde 0,04 partes por millón en el plancton hasta 75 en una gaviota:
                  más de tres órdenes de magnitud.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> La «Contaminación del agua» del simulador solo sigue
                  la falta de alimento: golpea a los productores y el efecto se apaga al subir, así que
                  los superdepredadores salen como el nivel menos afectado. Con un tóxico persistente,
                  en la realidad suelen ser los que acumulan las dosis más altas.
                </p>
              </div>

              <div className={styles.faqItem}>
                {/* Decía «raramente más de 4-6 eslabones» y, a renglón seguido, que el sexto
                    nivel era «matemáticamente imposible»: la regla del 10 % tratada como ley
                    exacta (hallazgo 1610). Se retiraron también dos afirmaciones sin fuente
                    (cadenas más largas en océanos muy productivos y en el trópico húmedo). */}
                <p>
                  Pocos: lo habitual es que una cadena no pase de <strong>cinco niveles</strong>. Una
                  razón es energética: si en cada paso llegara el 10&nbsp;%, al quinto nivel le quedaría
                  el 0,01&nbsp;% de la energía que fijaron los productores, y al sexto, el 0,001&nbsp;%. No
                  es una imposibilidad matemática —la eficiencia real de cada paso varía y hay cadenas
                  algo más largas—, sino una dificultad creciente para sostener poblaciones viables
                  arriba del todo.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> La energía no es la única explicación que se ha
                  propuesto: otras hipótesis relacionan la longitud de las cadenas con el tamaño del
                  ecosistema o con el tipo de hábitat.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué diferencia hay entre cadena y red trófica?</h4>
                <p>
                  Una <strong>cadena trófica</strong> es una secuencia lineal simplificada:
                  A → B → C → D. Una <strong>red trófica</strong> representa la realidad:
                  cada especie puede comer a varias otras y ser comida por varias. En los
                  ecosistemas reales, las redes son enormemente complejas, lo que hace al
                  sistema más resiliente: si desaparece una especie, hay alternativas.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> Este simulador usa cadenas simplificadas (4 niveles). Los ecosistemas reales
                  tienen redes con decenas o cientos de especies interconectadas.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3>Cómo analizar el impacto de una perturbación en un ecosistema</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Identifica el nivel trófico directamente afectado</strong>
                  <p>Determina si la perturbación afecta a los productores (sequía, contaminación), herbívoros (plaga), carnívoros (caza) o superdepredadores. El nivel directamente impactado es el punto de partida de la cascada. Si es un contaminante persistente, piensa además en la biomagnificación, que este simulador no calcula.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Analiza la dirección de la cascada (arriba o abajo)</strong>
                  <p>Si el nivel afectado baja: los depredadores del nivel superior pierden presas (efecto hacia arriba) y las presas del nivel inferior se liberan de depredación (efecto hacia abajo). Si sube: ocurre lo contrario.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Evalúa la magnitud del impacto con el modelo simplificado</strong>
                  {/* Decía «algo más de un 35 %»: con ATENUACION = 0,7 pasa exactamente el 70 %
                      del cambio relativo, así que un 50 % da un 35 % justo (hallazgo 1611). */}
                  <p>Como aproximación orientativa (no una ley empírica), cada nivel trófico tiende a atenuar el impacto: en este simulador cada nivel transmite a su vecino el 70&nbsp;% de su cambio relativo, así que un cambio del 50&nbsp;% en un nivel se traduce en un 35&nbsp;% en el nivel de al lado y en un 24,5&nbsp;% en el siguiente (mientras ningún nivel toque el suelo o el techo de población del modelo), porque los ecosistemas tienen cierta inercia y capacidad de amortiguación. Puedes seguirlo tú: prueba «caza excesiva del depredador» al 71&nbsp;% en la pradera y verás −50&nbsp;% en carnívoros, +35&nbsp;% en herbívoros y −24&nbsp;% en productores (redondeados: el cambio exacto de los carnívoros es −49,7&nbsp;%). La magnitud real varía mucho según el ecosistema y las especies implicadas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <strong>Identifica si hay especies clave en la cadena</strong>
                  <p>Si el nivel afectado contiene una especie clave (keystone species), el impacto real será mucho mayor que el predicho por el modelo simple. Las especies clave tienen efectos desproporcionados sobre la estructura del ecosistema.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <strong>Considera los efectos a largo plazo y la recuperación</strong>
                  <p>Algunos ecosistemas son más resilientes (bosques templados) que otros (tundra ártica). La velocidad de recuperación depende de la reproducción de las especies, la conectividad del ecosistema y si se eliminó la causa de la perturbación.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3>4 claves para interpretar las cadenas tróficas</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔑</span>
                <strong>Busca la especie clave</strong>
                <p>Pregúntate: ¿qué especie, si desapareciese, cambiaría radicalmente este ecosistema? Suele ser un depredador ápice o un ingeniero del ecosistema (castores, elefantes). No siempre es el más abundante.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚡</span>
                <strong>Calcula la energía disponible en cada nivel</strong>
                <p>Multiplica la producción primaria (kJ/m²/año) por 0,10 en cada paso. Si la pradera produce 10.000 kJ/m²/año, los herbívoros tendrán ~1.000, los carnívoros ~100 y los superdepredadores ~10 kJ/m²/año.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                <strong>No olvides los descomponedores</strong>
                <p>Bacterias y hongos descomponen la materia orgánica de todos los niveles y devuelven nutrientes al suelo o al agua. Sin ellos, los ciclos biogeoquímicos se romperían y los productores quedarían sin nutrientes.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📊</span>
                <strong>Distingue biomasa, número e individuos y energía</strong>
                <p>La pirámide de energía siempre es cónica (base ancha). La de biomasa casi siempre también. Pero la de número de individuos puede invertirse: un árbol (un individuo, mucha biomasa) puede albergar miles de insectos herbívoros.</p>
              </div>
            </div>
          </section>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>5 errores frecuentes al estudiar cadenas tróficas</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Confundir cadena con red trófica</strong> — La cadena es una simplificación lineal. En la naturaleza existen redes complejas donde cada especie interactúa con muchas otras. La cadena es útil para estudiar, no para modelar la realidad completa.</li>
              <li><strong>Creer que los depredadores son «malos» para el ecosistema</strong> — Los depredadores son esenciales: regulan las poblaciones de herbívoros, evitan el sobrepastoreo y mantienen la biodiversidad. Sin depredadores, los herbívoros destruyen la vegetación.</li>
              {/* Decía «el 90 % se convierte en calor; solo el 10 % queda en tejidos
                  consumibles», que contradecía la sección 1: parte de lo que no pasa al nivel
                  siguiente es excreción y tejido no consumido (hallazgo 1610). */}
              <li><strong>No entender adónde va la energía</strong> — La energía que no pasa al nivel siguiente (de media, en torno al 90&nbsp;%, con mucha variación) no «desaparece»: una parte se disipa como calor en la respiración y otra queda en heces, restos y tejidos no consumidos, que aprovechan los descomponedores. La que se disipa como calor ya no vuelve a la cadena (2.ª ley de la termodinámica).</li>
              <li><strong>Confundir biomasa con número de individuos</strong> — Un ecosistema puede tener pocos herbívoros en número pero mucha biomasa (vacas vs. insectos). La pirámide de individuos puede invertirse; la de energía, nunca.</li>
              <li><strong>Olvidar los descomponedores</strong> — Bacterias, hongos y detritívoros son el «nivel trófico oculto» que recicla la materia orgánica muerta. Sin ellos, los nutrientes quedarían inmovilizados y los productores dejarían de crecer.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-ecosistema-trofico')} />
        <ShareCard appName="simulador-ecosistema-trofico" />
        <Footer appName="simulador-ecosistema-trofico" />
    </div>
  );
}
