'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './SimuladorEcosistemaTrofico.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// ============================================
// TIPOS
// ============================================
interface NivelTrofico {
  nombre: string;
  emoji: string;
  ejemplos: string;
  poblacion: number;
  energiaPorcentaje: number;
}

interface Ecosistema {
  id: string;
  nombre: string;
  emoji: string;
  niveles: [NivelTrofico, NivelTrofico, NivelTrofico, NivelTrofico];
}

type TipoEvento = 'ninguno' | 'sequia' | 'caza-depredador' | 'plaga-herbivoro' | 'contaminacion';

interface Evento {
  id: TipoEvento;
  nombre: string;
  descripcion: string;
  nivelAfectado: 0 | 1 | 2 | 3;
  impacto: number;
}

// ============================================
// DATOS DE ECOSISTEMAS
// ============================================
const ECOSISTEMAS: Ecosistema[] = [
  {
    id: 'pradera',
    nombre: 'Pradera',
    emoji: '🌾',
    niveles: [
      { nombre: 'Productores', emoji: '🌿', ejemplos: 'Gramíneas, hierbas', poblacion: 100, energiaPorcentaje: 100 },
      { nombre: 'Herbívoros', emoji: '🐇', ejemplos: 'Conejos, ratones, insectos', poblacion: 40, energiaPorcentaje: 10 },
      { nombre: 'Carnívoros', emoji: '🦊', ejemplos: 'Zorros, serpientes', poblacion: 15, energiaPorcentaje: 1 },
      { nombre: 'Superdepredadores', emoji: '🦅', ejemplos: 'Águilas, halcones', poblacion: 5, energiaPorcentaje: 0.1 },
    ],
  },
  {
    id: 'bosque',
    nombre: 'Bosque Templado',
    emoji: '🌲',
    niveles: [
      { nombre: 'Productores', emoji: '🌳', ejemplos: 'Robles, hayas, arbustos', poblacion: 100, energiaPorcentaje: 100 },
      { nombre: 'Herbívoros', emoji: '🦌', ejemplos: 'Ciervos, jabatos, orugas', poblacion: 35, energiaPorcentaje: 10 },
      { nombre: 'Carnívoros', emoji: '🐺', ejemplos: 'Lobos, linces, búhos', poblacion: 12, energiaPorcentaje: 1 },
      { nombre: 'Superdepredadores', emoji: '🐻', ejemplos: 'Osos, águilas reales', poblacion: 4, energiaPorcentaje: 0.1 },
    ],
  },
  {
    id: 'oceano',
    nombre: 'Océano',
    emoji: '🌊',
    niveles: [
      { nombre: 'Productores', emoji: '🦠', ejemplos: 'Fitoplancton, algas', poblacion: 100, energiaPorcentaje: 100 },
      { nombre: 'Herbívoros', emoji: '🦐', ejemplos: 'Zooplancton, gambas, sardinas', poblacion: 38, energiaPorcentaje: 10 },
      { nombre: 'Carnívoros', emoji: '🐟', ejemplos: 'Peces medianos, calamares', poblacion: 14, energiaPorcentaje: 1 },
      { nombre: 'Superdepredadores', emoji: '🦈', ejemplos: 'Tiburones, atunes, delfines', poblacion: 5, energiaPorcentaje: 0.1 },
    ],
  },
  {
    id: 'sabana',
    nombre: 'Sabana',
    emoji: '🌅',
    niveles: [
      { nombre: 'Productores', emoji: '🌾', ejemplos: 'Acacia, gramíneas tropicales', poblacion: 100, energiaPorcentaje: 100 },
      { nombre: 'Herbívoros', emoji: '🦓', ejemplos: 'Cebras, ñus, jirafas', poblacion: 42, energiaPorcentaje: 10 },
      { nombre: 'Carnívoros', emoji: '🐆', ejemplos: 'Guepardos, leopardos, hienas', poblacion: 16, energiaPorcentaje: 1 },
      { nombre: 'Superdepredadores', emoji: '🦁', ejemplos: 'Leones, cocodrilos', poblacion: 6, energiaPorcentaje: 0.1 },
    ],
  },
];

// ============================================
// EVENTOS PERTURBADORES
// ============================================
const EVENTOS: Evento[] = [
  { id: 'ninguno', nombre: 'Sin perturbación', descripcion: 'Ecosistema en equilibrio', nivelAfectado: 0, impacto: 0 },
  { id: 'sequia', nombre: 'Sequía', descripcion: 'La falta de lluvia reduce drásticamente los productores', nivelAfectado: 0, impacto: -0.6 },
  { id: 'caza-depredador', nombre: 'Caza excesiva del depredador', descripcion: 'La caza ilegal reduce la población de carnívoros', nivelAfectado: 2, impacto: -0.7 },
  { id: 'plaga-herbivoro', nombre: 'Plaga de herbívoros', descripcion: 'Una plaga hace crecer los herbívoros sin control', nivelAfectado: 1, impacto: 0.8 },
  { id: 'contaminacion', nombre: 'Contaminación del agua', descripcion: 'Pesticidas diezman a los productores y herbívoros', nivelAfectado: 0, impacto: -0.5 },
];

// ============================================
// MODELO DE CASCADA TRÓFICA
// ============================================
function aplicarEvento(
  niveles: NivelTrofico[],
  evento: Evento,
  intensidad: number
): NivelTrofico[] {
  const result = niveles.map(n => ({ ...n }));

  if (evento.id === 'ninguno') return result;

  const idx = evento.nivelAfectado;
  const cambio = evento.impacto * intensidad;

  // Afectar el nivel directamente
  result[idx] = {
    ...result[idx],
    poblacion: Math.max(5, Math.min(100, niveles[idx].poblacion * (1 + cambio))),
  };

  // Efecto en cascada hacia arriba (depredadores): quedarse sin presa arrastra al depredador
  for (let i = idx + 1; i < result.length; i++) {
    const factorPresa = result[i - 1].poblacion / niveles[i - 1].poblacion;
    result[i] = {
      ...result[i],
      poblacion: Math.max(2, Math.min(100, niveles[i].poblacion * (1 - ATENUACION + ATENUACION * factorPresa))),
    };
  }

  // Efecto en cascada hacia abajo (presas): perder depredador libera a la presa
  for (let i = idx - 1; i >= 0; i--) {
    const factorDepred = result[i + 1].poblacion / niveles[i + 1].poblacion;
    // Con la MISMA atenuación que hacia arriba. Antes era `2 − factorDepred`, que traslada el
    // cambio con magnitud idéntica: un −50 % en el depredador daba un +50 % en la presa,
    // mientras el paso 3 del bloque educativo prometía «un cambio menor, del orden del
    // 20-30 %, en los niveles adyacentes» (hallazgo 324). La asimetría no tenía ninguna
    // justificación biológica: era la de arriba la que atenuaba y la de abajo la que no.
    result[i] = {
      ...result[i],
      poblacion: Math.max(5, Math.min(100, niveles[i].poblacion * (1 + ATENUACION * (1 - factorDepred)))),
    };
  }

  return result;
}

// ============================================
// TEXTO DINÁMICO DE EXPLICACIÓN
// ============================================
function generarExplicacion(
  evento: Evento,
  niveles: NivelTrofico[],
  originales: NivelTrofico[],
  intensidad: number
): string {
  if (evento.id === 'ninguno') {
    return 'El ecosistema está en equilibrio. Las poblaciones se mantienen estables gracias al balance entre predadores y presas. Cada nivel trófico regula al siguiente mediante retroalimentación negativa.';
  }

  const cambioPorc = (n: number, o: number): number => Math.round(Math.abs((n - o) / o * 100));
  const direccion = (n: number, o: number): string => n < o ? 'reducido' : 'aumentado';
  const nivelNombres = originales.map(n => n.nombre.toLowerCase());

  const partes: string[] = [];

  for (let i = 0; i < niveles.length; i++) {
    const porc = cambioPorc(niveles[i].poblacion, originales[i].poblacion);
    if (porc > 2) {
      partes.push(
        `Los ${nivelNombres[i]} han ${direccion(niveles[i].poblacion, originales[i].poblacion)} un ${porc}%`
      );
    }
  }

  let texto = evento.descripcion + '. ';

  if (partes.length === 0) {
    texto += `Con una intensidad del ${Math.round(intensidad * 100)}%, el impacto en las poblaciones es mínimo.`;
  } else if (partes.length === 1) {
    texto += partes[0] + '.';
  } else {
    texto += partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1] + '. ';
    texto += 'Esta es la cascada trófica en acción: la perturbación de un nivel se propaga a todos los demás.';
  }

  return texto;
}

// ============================================
// COLORES POR NIVEL
// ============================================
const COLORES_NIVEL = ['#3a7d44', '#d4a017', '#d4621c', '#c0392b'];

/**
 * Cuánto del cambio de un nivel llega al de al lado.
 *
 * Es lo que hace que una cascada trófica se vaya apagando en vez de propagarse intacta, y va
 * en LOS DOS SENTIDOS: hasta el 25/08/2026 la cascada hacia arriba atenuaba con este mismo
 * 0,7 y la de abajo no atenuaba nada, sin ninguna razón biológica detrás.
 */
const ATENUACION = 0.7;
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
  const evento = EVENTOS.find(e => e.id === eventoId) ?? EVENTOS[0];

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
  const originalesInvertidos = [...ecosistema.niveles].reverse();
  const coloresInvertidos = [...COLORES_NIVEL].reverse();
  const clasesInvertidas = [...NOMBRES_CLASE_NIVEL].reverse();

  // Anchos de pirámide: base 100%, luego 75%, 50%, 30%
  const anchosPiramide = ['30%', '55%', '75%', '100%'];

  const handleReset = () => {
    setEventoId('ninguno');
    setIntensidad(0.5);
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🌍</span> Simulador de Ecosistema: Cadena Trófica</h1>
          <p className={styles.subtitle}>
            Selecciona un ecosistema, aplica una perturbación y observa cómo la cascada trófica
            transforma cada nivel. Aprende la regla del 10% de la energía en acción.
          </p>
        </header>

        <LegalNotice />

        {/* SELECTOR DE ECOSISTEMA */}
        <div className={styles.ecosistemaSelector} role="group" aria-label="Seleccionar ecosistema">
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
          {EVENTOS.map(ev => (
            <button
              type="button"
              key={ev.id}
              className={`${styles.eventoBtn} ${eventoId === ev.id ? styles.eventoBtnActivo : ''}`}
              onClick={() => setEventoId(ev.id)}
              aria-pressed={eventoId === ev.id}
              title={ev.descripcion}
            >
              {ev.nombre}
            </button>
          ))}
        </div>

        {/* SLIDER DE INTENSIDAD */}
        {eventoId !== 'ninguno' && (
          <div className={styles.intensidadRow}>
            <label htmlFor="slider-intensidad" className={styles.intensidadLabel}>
              Intensidad de la perturbación: <strong>{Math.round(intensidad * 100)}%</strong>
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
                      <span>↑ solo el 10% de la energía sube a este nivel</span>
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
                        {Math.round(nivel.poblacion)} ind. rel.
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
              return (
                <div key={nivel.nombre} className={styles.barraGrupo}>
                  <div className={styles.barraLabelRow}>
                    <span className={styles.barraLabel}>
                      <span aria-hidden="true">{nivel.emoji}</span> {nivel.nombre}
                    </span>
                    <span className={styles.barraValor} style={{ color }}>
                      {Math.round(porcActual)}
                      {/* El delta se decide sobre el valor REDONDEADO, que es el que se
                          imprime. Comparando los valores sin redondear, una sequía al 1 %
                          pintaba «40 (0)» —un cambio de cero anunciado como si fuera un
                          cambio— porque la diferencia real era 0,168 (hallazgo 328). */}
                      {Math.round(porcActual - porcOriginal) !== 0 && (
                        <span className={styles.barraDelta}>
                          {' '}({porcActual > porcOriginal ? '+' : ''}{Math.round(porcActual - porcOriginal)})
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
                      aria-valuenow={Math.round(porcActual)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${nivel.nombre}: ${Math.round(porcActual)} individuos relativos`}
                    />
                  </div>
                </div>
              );
            })}

            {/* Leyenda energía */}
            <div className={styles.leyendaEnergia}>
              <p className={styles.leyendaNota}>
                Esta leyenda representa la <strong>transferencia de energía</strong> entre niveles (regla del 10%),
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
                      {nivel.nombre}: {formatNumber(nivel.energiaPorcentaje, nivel.energiaPorcentaje < 1 ? 1 : 0)}%
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

        {/* BLOQUE EDUCATIVO v2.0 */}
        <EducationalSection
          title="Aprende sobre cadenas tróficas y ecosistemas"
          subtitle="La regla del 10%, las cascadas tróficas y las especies clave explicadas"
        >
          <section>
            <h3>¿Qué es una cadena trófica y la regla del 10%?</h3>
            <p>
              Una <strong>cadena trófica</strong> es la secuencia ordenada de organismos en un ecosistema
              según quién come a quién. Cada eslabón se denomina <em>nivel trófico</em>: productores
              (plantas, algas, fitoplancton), consumidores primarios (herbívoros), consumidores secundarios
              (carnívoros) y depredadores ápice o superdepredadores.
            </p>
            <p>
              La <strong>regla del 10%</strong> (o ley de Lindeman, 1942) establece que, en promedio,
              solo el 10% de la energía acumulada en un nivel trófico se transfiere al siguiente.
              El 90% restante se pierde como calor metabólico, respiración, excreción y tejidos no
              consumibles. Esto explica por qué la pirámide de energía siempre tiene base ancha:
              se necesitan enormes cantidades de vegetación para mantener a pocos depredadores ápice.
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
                  depredador&quot; al 100% en la pradera: los carnívoros caen a un tercio y el efecto
                  recorre toda la pirámide, apagándose a cada nivel. El modelo tiene un suelo de
                  población y no llega a cero —es una simplificación, no una afirmación de que un
                  nivel no pueda extinguirse—, pero la forma de la cascada es la misma que
                  describen los casos reales de arriba.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Por qué la pirámide de energía siempre tiene base ancha?</h4>
                <p>
                  Porque la energía se <strong>disipa</strong> en cada transferencia. Solo el 10%
                  pasa al nivel siguiente; el 90% se usa en metabolismo, se pierde como calor o
                  queda en partes no consumidas (raíces, huesos, celulosa). Para que haya 1 kg de
                  depredador ápice, se necesitan ~10 kg de carnívoro, ~100 kg de herbívoro y ~1000 kg
                  de productor. Esto limita físicamente la longitud de las cadenas tróficas.
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

              <div className={styles.faqItem}>
                <h4>¿Cuántos eslabones puede tener una cadena trófica?</h4>
                <p>
                  En la naturaleza, raramente más de <strong>4-6 eslabones</strong>. La razón es
                  física: con la regla del 10%, para el sexto nivel solo quedaría el 0,001% de la
                  energía original, lo que hace matemáticamente imposible mantener una población
                  viable. En ecosistemas oceánicos muy productivos (gran biomasa de fitoplancton)
                  pueden existir cadenas algo más largas.
                </p>
                <p className={styles.faqTip}>
                  <span aria-hidden="true">💡</span> Los ecosistemas tropicales húmedos tienen cadenas más largas porque la
                  alta productividad primaria permite sustentar más niveles.
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
                  <p>Determina si la perturbación afecta a los productores (sequía, contaminación), herbívoros (plaga), carnívoros (caza) o superdepredadores. El nivel directamente impactado es el punto de partida de la cascada.</p>
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
                  <p>Como aproximación orientativa (no una ley empírica), cada nivel trófico tiende a atenuar el impacto: en este simulador un cambio del 50% en un nivel se traduce en algo más de un 35% en el nivel de al lado, y en torno a un 25% en el siguiente, porque los ecosistemas tienen cierta inercia y capacidad de amortiguación. Puedes seguirlo tú: prueba «caza excesiva del depredador» al 71% en la pradera y verás −50% en carnívoros, +35% en herbívoros y −24% en productores. La magnitud real varía mucho según el ecosistema y las especies implicadas.</p>
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
              <li><strong>No entender que la energía se pierde como calor</strong> — El 90% de la energía no «desaparece»: se convierte en calor por el metabolismo. Solo el 10% queda en tejidos consumibles. Esta pérdida es irreversible (2.ª ley de la termodinámica).</li>
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
