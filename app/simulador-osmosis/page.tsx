'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  NumberInput,
} from '@/components';
import { formatNumber, formatPercentage, parseSpanishNumber } from '@/lib';
import styles from './SimuladorOsmosis.module.css';
import {
  SOLUTOS,
  solutoPorId,
  molaridadDesde,
  osmolaridad,
  aKelvin,
  compararCompartimentos,
  celulaEnMedio,
  R_ATM_L,
  BANDA_ISOTONICA,
  type Soluto,
  type Unidad,
  type TipoCelula,
  type EstadoCelula,
  type ResultadoMembrana,
  type ResultadoCelula,
} from './motor';
import { PREGUNTAS_FRECUENTES } from './metadata';

// ─── Constantes de la vista ──────────────────────────────────────────────────

const TEMPERATURA_MAX = 100;
const MOLARIDAD_MAX = 10;
const PORCENTAJE_MAX = 100;
/** Por encima de 1 mol/L la ecuación de van 't Hoff es solo una aproximación. */
const MOLARIDAD_DILUIDA = 1;
/** Cada punto del dibujo representa 0,05 osmol/L, con un tope para que no se apelotonen. */
const OSM_POR_PUNTO = 0.05;
const PUNTOS_MAX = 40;

// ─── Formato ─────────────────────────────────────────────────────────────────

function textoOsm(osm: number): string {
  return `${formatNumber(osm, osm < 0.01 && osm > 0 ? 4 : 3)} osmol/L`;
}

/** Presión en atm con más decimales cuanto más pequeña. */
function textoAtm(atm: number): string {
  if (atm === 0) return '0 atm';
  if (atm < 0.01) return `${formatNumber(atm, 5)} atm`;
  if (atm < 1) return `${formatNumber(atm, 3)} atm`;
  return `${formatNumber(atm, 2)} atm`;
}

function textoKPa(kPa: number): string {
  return `${formatNumber(kPa, kPa < 10 ? 2 : 1)} kPa`;
}

/** Altura de la columna de agua: en cm si no llega al metro. */
function textoAltura(m: number): string {
  if (m === 0) return '0 m';
  if (m < 0.01) return `${formatNumber(m * 1000, 2)} mm`;
  if (m < 1) return `${formatNumber(m * 100, 1)} cm`;
  return `${formatNumber(m, m < 100 ? 2 : 1)} m`;
}

// ─── Disolución de un lado ───────────────────────────────────────────────────

interface Disolucion {
  solutoId: string;
  concentracion: string;
  unidad: Unidad;
}

interface Calculada {
  soluto: Soluto;
  molaridad: number;
  osm: number;
}

/** Molaridad y osmolaridad de una disolución, o null si falta un dato válido. */
function calcularDisolucion(d: Disolucion): Calculada | null {
  const soluto = solutoPorId(d.solutoId);
  if (!soluto) return null;
  const molaridad = molaridadDesde(parseSpanishNumber(d.concentracion), d.unidad, soluto);
  if (molaridad === null) return null;
  const osm = osmolaridad(molaridad, soluto);
  if (osm === null) return null;
  return { soluto, molaridad, osm };
}

interface SelectorDisolucionProps {
  idBase: string;
  titulo: string;
  disolucion: Disolucion;
  onCambio: (d: Disolucion) => void;
}

function SelectorDisolucion({ idBase, titulo, disolucion, onCambio }: SelectorDisolucionProps) {
  const { solutoId, concentracion, unidad } = disolucion;
  return (
    <div className={styles.disolucion} role="group" aria-labelledby={`${idBase}-titulo`}>
      <h3 id={`${idBase}-titulo`} className={styles.grupoTitulo}>{titulo}</h3>

      <p className={styles.subgrupo} id={`${idBase}-soluto`}>Soluto</p>
      <div className={styles.presets} role="group" aria-labelledby={`${idBase}-soluto`}>
        {SOLUTOS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={styles.preset}
            aria-pressed={solutoId === s.id}
            onClick={() => onCambio({ ...disolucion, solutoId: s.id })}
          >
            {s.nombre}
            <span className={styles.presetDetalle}>{s.formula} · i = {s.i}</span>
          </button>
        ))}
      </div>

      <p className={styles.subgrupo} id={`${idBase}-unidad`}>La concentración viene en</p>
      <div className={styles.presets} role="group" aria-labelledby={`${idBase}-unidad`}>
        <button
          type="button"
          className={styles.preset}
          aria-pressed={unidad === 'molar'}
          onClick={() => onCambio({ ...disolucion, unidad: 'molar' })}
        >
          mol/L (molaridad)
        </button>
        <button
          type="button"
          className={styles.preset}
          aria-pressed={unidad === 'porcentaje'}
          onClick={() => onCambio({ ...disolucion, unidad: 'porcentaje' })}
        >
          % masa/volumen
        </button>
      </div>

      <div className={styles.entrada}>
        <NumberInput
          label="Concentración"
          value={concentracion}
          onChange={(v) => onCambio({ ...disolucion, concentracion: v })}
          min={0}
          max={unidad === 'molar' ? MOLARIDAD_MAX : PORCENTAJE_MAX}
          step={unidad === 'molar' ? 0.05 : 0.1}
          suffix={unidad === 'molar' ? 'mol/L' : '% m/v'}
          placeholder={unidad === 'molar' ? '0,1' : '0,9'}
          helperText={
            unidad === 'molar'
              ? '0 es agua pura'
              : 'Gramos de soluto por 100 mL de disolución. 0 es agua pura'
          }
        />
      </div>
    </div>
  );
}

// ─── Medios de referencia para la célula ────────────────────────────────────

interface MedioReferencia {
  id: string;
  nombre: string;
  disolucion: Disolucion;
}

const MEDIOS: readonly MedioReferencia[] = [
  { id: 'destilada', nombre: 'Agua destilada', disolucion: { solutoId: 'nacl', concentracion: '0', unidad: 'porcentaje' } },
  { id: 'suero', nombre: 'Suero fisiológico (NaCl 0,9 %)', disolucion: { solutoId: 'nacl', concentracion: '0,9', unidad: 'porcentaje' } },
  { id: 'salada', nombre: 'Agua con sal (NaCl 3 %)', disolucion: { solutoId: 'nacl', concentracion: '3', unidad: 'porcentaje' } },
  { id: 'azucar', nombre: 'Agua con azúcar (sacarosa 0,5 M)', disolucion: { solutoId: 'sacarosa', concentracion: '0,5', unidad: 'molar' } },
];

/** El agua destilada vale con cualquier soluto: lo que cuenta es la concentración 0. */
function esMedio(actual: Disolucion, referencia: Disolucion): boolean {
  const c1 = parseSpanishNumber(actual.concentracion);
  const c2 = parseSpanishNumber(referencia.concentracion);
  if (c2 === 0) return c1 === 0;
  return actual.solutoId === referencia.solutoId && actual.unidad === referencia.unidad && c1 === c2;
}

const EXPLICACION: Record<EstadoCelula, { titulo: string; texto: string }> = {
  hinchada: {
    titulo: 'La célula se hincha',
    texto:
      'Entra agua y la célula aumenta de volumen. Como no tiene pared que la sujete, si la diferencia es grande acaba reventando: en los glóbulos rojos se llama hemólisis.',
  },
  normal: {
    titulo: 'La célula conserva su forma',
    texto:
      'Entra y sale la misma cantidad de agua, así que el volumen no cambia. Por eso las disoluciones que se ponen en vena se preparan isotónicas con la sangre.',
  },
  crenada: {
    titulo: 'La célula se arruga (crenación)',
    texto:
      'Sale agua, la célula pierde volumen y su membrana se arruga. En un glóbulo rojo aparecen salientes en el borde.',
  },
  turgente: {
    titulo: 'La célula queda turgente',
    texto:
      'Entra agua, la vacuola se llena y aprieta la membrana contra la pared celular, que aguanta sin romperse. La célula queda firme: es el estado de una planta bien regada.',
  },
  flacida: {
    titulo: 'La célula queda flácida',
    texto:
      'No hay paso neto de agua, así que la membrana no presiona la pared. La célula no se daña, pero pierde firmeza: así se ven los tallos y las hojas mustios.',
  },
  plasmolizada: {
    titulo: 'La membrana se despega de la pared (plasmólisis)',
    texto:
      'Sale agua, la vacuola se encoge y la membrana se separa de la pared celular. Es lo que le pasa a una hoja de lechuga que se deja en agua con mucha sal.',
  },
};

const NOMBRE_TONICIDAD = {
  hipotonico: 'Medio hipotónico',
  isotonico: 'Medio isotónico',
  hipertonico: 'Medio hipertónico',
} as const;

/** Rótulo corto bajo el dibujo: el título entero no cabe en el ancho del SVG. */
const ESTADO_CORTO: Record<EstadoCelula, string> = {
  hinchada: 'hinchada',
  normal: 'forma normal',
  crenada: 'crenada',
  turgente: 'turgente',
  flacida: 'flácida',
  plasmolizada: 'plasmolizada',
};

// ─── Página ──────────────────────────────────────────────────────────────────

export default function SimuladorOsmosisPage() {
  const [temperaturaTexto, setTemperaturaTexto] = useState('25');

  const [ladoA, setLadoA] = useState<Disolucion>({ solutoId: 'sacarosa', concentracion: '0,3', unidad: 'molar' });
  const [ladoB, setLadoB] = useState<Disolucion>({ solutoId: 'glucosa', concentracion: '0,1', unidad: 'molar' });

  const [tipoCelula, setTipoCelula] = useState<TipoCelula>('animal');
  const [interiorTexto, setInteriorTexto] = useState('0,30');
  const [medio, setMedio] = useState<Disolucion>({ solutoId: 'nacl', concentracion: '0,9', unidad: 'porcentaje' });

  const temperatura = parseSpanishNumber(temperaturaTexto);
  const temperaturaValida = aKelvin(temperatura) !== null;

  const calcA = useMemo(() => calcularDisolucion(ladoA), [ladoA]);
  const calcB = useMemo(() => calcularDisolucion(ladoB), [ladoB]);
  const membrana = useMemo<ResultadoMembrana | null>(
    () => (calcA && calcB ? compararCompartimentos(calcA.osm, calcB.osm, temperatura) : null),
    [calcA, calcB, temperatura],
  );

  const calcMedio = useMemo(() => calcularDisolucion(medio), [medio]);
  const osmInterior = parseSpanishNumber(interiorTexto);
  const celula = useMemo<ResultadoCelula | null>(
    () => (calcMedio ? celulaEnMedio(tipoCelula, osmInterior, calcMedio.osm, temperatura) : null),
    [calcMedio, tipoCelula, osmInterior, temperatura],
  );

  const faltanMembrana: string[] = [];
  if (!temperaturaValida) faltanMembrana.push('una temperatura válida');
  if (!calcA) faltanMembrana.push('la concentración del lado A');
  if (!calcB) faltanMembrana.push('la concentración del lado B');

  const faltanCelula: string[] = [];
  if (!temperaturaValida) faltanCelula.push('una temperatura válida');
  if (!(Number.isFinite(osmInterior) && osmInterior > 0)) faltanCelula.push('la osmolaridad del interior de la célula, mayor que 0');
  if (!calcMedio) faltanCelula.push('la concentración del medio');

  const t = aKelvin(temperatura);
  const concentrada = [calcA, calcB, calcMedio].some((c) => c !== null && c.molaridad > MOLARIDAD_DILUIDA);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🧫</span> Simulador de Ósmosis y Presión Osmótica</h1>
        <p className={styles.subtitle}>
          Hacia dónde pasa el agua a través de una membrana semipermeable, cuánta presión osmótica
          tiene cada disolución y qué le pasa a una célula en un medio hipotónico, isotónico o
          hipertónico, con tus números
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* ══ Temperatura, común a los dos problemas ══════════════════════════ */}
        <section className={styles.panel} aria-labelledby="titulo-temperatura">
          <h2 id="titulo-temperatura" className={styles.panelTitulo}>Temperatura</h2>
          <div className={styles.entradaCorta}>
            <NumberInput
              label="Temperatura de las disoluciones"
              value={temperaturaTexto}
              onChange={setTemperaturaTexto}
              min={0}
              max={TEMPERATURA_MAX}
              suffix="°C"
              placeholder="25"
              helperText="25 °C para el laboratorio, 37 °C para el cuerpo humano. La fórmula usa kelvin: T = t + 273,15"
            />
          </div>
        </section>

        {/* ══ 1 · Dos disoluciones y una membrana ═════════════════════════════ */}
        <section className={styles.panel} aria-labelledby="titulo-parte1">
          <h2 id="titulo-parte1" className={styles.panelTitulo}>1. Dos disoluciones separadas por una membrana semipermeable</h2>
          <p className={styles.panelIntro}>
            La membrana deja pasar el agua y no el soluto. Elige qué hay disuelto en cada lado y
            cuánto: la app calcula la <strong>presión osmótica</strong> de cada disolución,{' '}
            <strong>π = i·M·R·T</strong>, y hacia dónde pasa el agua.
          </p>

          <div className={styles.lados}>
            <SelectorDisolucion idBase="lado-a" titulo="Lado A" disolucion={ladoA} onCambio={setLadoA} />
            <SelectorDisolucion idBase="lado-b" titulo="Lado B" disolucion={ladoB} onCambio={setLadoB} />
          </div>

          <div className={styles.simLayout}>
            <div className={styles.dibujoCaja}>
              <DibujoMembrana
                osmA={calcA?.osm ?? null}
                osmB={calcB?.osm ?? null}
                sentido={membrana?.sentido ?? null}
              />
              <p className={styles.leyenda}>
                <span><span className={styles.muestraPunto} aria-hidden="true" /> cada punto ≈ {formatNumber(OSM_POR_PUNTO, 2)} osmol/L (máximo {PUNTOS_MAX})</span>
                <span><span className={styles.muestraFlecha} aria-hidden="true" /> paso neto de agua</span>
              </p>
            </div>

            <div className={styles.resultadosCaja} role="status">
              {membrana && calcA && calcB && t !== null ? (
                <div className={styles.resultados}>
                  <div className={styles.destacado}>
                    <span className={styles.destacadoNombre}>Paso neto de agua</span>
                    <span className={styles.destacadoValor}>
                      {membrana.sentido === 'B_a_A' && 'De B hacia A'}
                      {membrana.sentido === 'A_a_B' && 'De A hacia B'}
                      {membrana.sentido === 'ninguno' && 'Ninguno'}
                    </span>
                    <span className={styles.destacadoSub}>
                      {membrana.sentido === 'ninguno'
                        ? 'Las dos disoluciones tienen la misma osmolaridad'
                        : `Δπ = ${textoAtm(membrana.deltaPi.atm)} · ${textoKPa(membrana.deltaPi.kPa)}`}
                    </span>
                  </div>

                  <div className={styles.tarjetas}>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Osmolaridad A (i·M)</span>
                      <span className={styles.tarjetaValor}>{textoOsm(membrana.osmA)}</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Osmolaridad B (i·M)</span>
                      <span className={styles.tarjetaValor}>{textoOsm(membrana.osmB)}</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Presión osmótica A</span>
                      <span className={styles.tarjetaValor}>{textoAtm(membrana.piA.atm)}</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Presión osmótica B</span>
                      <span className={styles.tarjetaValor}>{textoAtm(membrana.piB.atm)}</span>
                    </div>
                  </div>

                  {membrana.sentido === 'ninguno' ? (
                    <p className={styles.aclaracion}>
                      El agua sigue cruzando la membrana, pero lo mismo en cada sentido: no hay paso
                      neto. Dos solutos distintos pueden dar la misma osmolaridad, porque lo que
                      cuenta es el número de partículas.
                    </p>
                  ) : (
                    <p className={styles.aclaracion}>
                      El agua pasa hacia el lado {membrana.sentido === 'B_a_A' ? 'A' : 'B'}, que tiene
                      más partículas disueltas. Para frenarla habría que apretar ese lado con Δπ, lo
                      mismo que una columna de agua de <strong>{textoAltura(membrana.alturaColumna)}</strong>{' '}
                      (h = Δπ / ρ·g).
                    </p>
                  )}
                </div>
              ) : (
                <div className={styles.faltan}>
                  <strong>Falta un dato para calcular</strong>
                  <p>Escribe {faltanMembrana.join(', ') || 'los datos que faltan'}.</p>
                </div>
              )}
            </div>
          </div>

          {membrana && calcA && calcB && t !== null && (
            <div className={styles.formulaBox}>
              <p className={styles.formulaLinea}>
                <code>π = i·M·R·T</code> con R = {formatNumber(R_ATM_L, 5)} atm·L/(mol·K) y T ={' '}
                {formatNumber(t, 2)} K
              </p>
              <p className={styles.formulaLinea}>
                Lado A: π = {calcA.soluto.i} · {formatNumber(calcA.molaridad, 4)} · {formatNumber(R_ATM_L, 5)} ·{' '}
                {formatNumber(t, 2)} = <code>{textoAtm(membrana.piA.atm)}</code>
              </p>
              <p className={styles.formulaLinea}>
                Lado B: π = {calcB.soluto.i} · {formatNumber(calcB.molaridad, 4)} · {formatNumber(R_ATM_L, 5)} ·{' '}
                {formatNumber(t, 2)} = <code>{textoAtm(membrana.piB.atm)}</code>
              </p>
              {(ladoA.unidad === 'porcentaje' || ladoB.unidad === 'porcentaje') && (
                <p className={styles.formulaLinea}>
                  De % a mol/L: M = % · 10 / masa molar (1 % m/v son 10 g por litro)
                </p>
              )}
            </div>
          )}
        </section>

        {/* ══ 2 · Una célula en un medio ══════════════════════════════════════ */}
        <section className={styles.panel} aria-labelledby="titulo-parte2">
          <h2 id="titulo-parte2" className={styles.panelTitulo}>2. Una célula en un medio</h2>
          <p className={styles.panelIntro}>
            Ahora la membrana es la de una célula. Según tenga el medio menos, las mismas o más
            partículas disueltas que su interior, el agua entra, no pasa en neto o sale, y la célula
            animal y la vegetal no responden igual.
          </p>

          <div className={styles.grupo} role="group" aria-labelledby="titulo-tipo-celula">
            <h3 id="titulo-tipo-celula" className={styles.grupoTitulo}>Tipo de célula</h3>
            <div className={styles.presets}>
              <button
                type="button"
                className={styles.preset}
                aria-pressed={tipoCelula === 'animal'}
                onClick={() => setTipoCelula('animal')}
              >
                Animal (glóbulo rojo)
              </button>
              <button
                type="button"
                className={styles.preset}
                aria-pressed={tipoCelula === 'vegetal'}
                onClick={() => setTipoCelula('vegetal')}
              >
                Vegetal (con pared celular)
              </button>
            </div>
            <div className={styles.entradaCorta}>
              <NumberInput
                label="Osmolaridad del interior de la célula"
                value={interiorTexto}
                onChange={setInteriorTexto}
                min={0}
                max={5}
                step={0.01}
                suffix="osmol/L"
                placeholder="0,30"
                helperText="El plasma de la sangre ronda 0,29 osmol/L (275-295 mOsm/kg); en las células vegetales varía con la especie y el tejido"
              />
            </div>
          </div>

          <div className={styles.grupo} role="group" aria-labelledby="titulo-medios">
            <h3 id="titulo-medios" className={styles.grupoTitulo}>Medios de referencia</h3>
            <div className={styles.presets}>
              {MEDIOS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={styles.preset}
                  aria-pressed={esMedio(medio, m.disolucion)}
                  onClick={() => setMedio(m.disolucion)}
                >
                  {m.nombre}
                </button>
              ))}
            </div>
          </div>

          <SelectorDisolucion idBase="medio" titulo="O el medio que quieras" disolucion={medio} onCambio={setMedio} />

          <div className={styles.simLayout}>
            <div className={styles.dibujoCaja}>
              <DibujoCelula tipo={tipoCelula} estado={celula?.estado ?? null} />
              <p className={styles.leyenda}>
                <span><span className={styles.muestraFlecha} aria-hidden="true" /> paso neto de agua</span>
              </p>
            </div>

            <div className={styles.resultadosCaja} role="status">
              {celula && calcMedio ? (
                <div className={styles.resultados}>
                  <div className={`${styles.destacado} ${styles[`destacado_${celula.tonicidad}`]}`}>
                    <span className={styles.destacadoNombre}>{NOMBRE_TONICIDAD[celula.tonicidad]}</span>
                    <span className={styles.destacadoValor}>{EXPLICACION[celula.estado].titulo}</span>
                    <span className={styles.destacadoSub}>
                      {celula.agua === 'entra' && 'El agua entra en la célula'}
                      {celula.agua === 'sale' && 'El agua sale de la célula'}
                      {celula.agua === 'equilibrio' && 'Sin paso neto apreciable de agua'}
                    </span>
                  </div>

                  <div className={styles.tarjetas}>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Osmolaridad del medio</span>
                      <span className={styles.tarjetaValor}>{textoOsm(calcMedio.osm)}</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Interior de la célula</span>
                      <span className={styles.tarjetaValor}>{textoOsm(osmInterior)}</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Medio frente al interior</span>
                      <span className={styles.tarjetaValor}>
                        {celula.diferenciaRelativa > 0 ? '+' : ''}
                        {formatPercentage(celula.diferenciaRelativa, 1)}
                      </span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Diferencia de presión osmótica</span>
                      <span className={styles.tarjetaValor}>{textoAtm(celula.deltaPi.atm)}</span>
                    </div>
                  </div>

                  <p className={styles.aclaracion}>{EXPLICACION[celula.estado].texto}</p>
                  <p className={styles.nota}>
                    Se llama isotónico a un medio que no se aleja más de un{' '}
                    {formatPercentage(BANDA_ISOTONICA, 0)} de la osmolaridad del interior: dentro de
                    esa banda el agua apenas se mueve.
                  </p>
                </div>
              ) : (
                <div className={styles.faltan}>
                  <strong>Falta un dato para calcular</strong>
                  <p>Escribe {faltanCelula.join(', ') || 'los datos que faltan'}.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {concentrada && (
          <p className={styles.avisoConcentrada} role="note">
            Hay una disolución de más de 1 mol/L. La ecuación de van &apos;t Hoff es exacta en
            disoluciones diluidas; a esas concentraciones la cifra es una aproximación, como en los
            problemas de clase.
          </p>
        )}

        {/* ── Sección educativa v2.0 ──────────────────────────────────────── */}
        <EducationalSection
          title="Aprende sobre la ósmosis"
          subtitle="Membranas semipermeables, presión osmótica y tonicidad"
          icon="🧫"
        >
          <p className={styles.eduIntro}>
            La <strong>ósmosis</strong> es el paso de agua a través de una membrana que deja pasar el
            agua pero no lo que lleva disuelto. El agua cruza en los dos sentidos, pero lo hace más
            hacia el lado con más partículas disueltas, así que en neto va de la disolución diluida a
            la concentrada. La presión que habría que aplicar para frenarla es la{' '}
            <strong>presión osmótica</strong>, y Jacobus van &apos;t Hoff propuso en 1886 que se
            calcula como la de un gas: <em>π = i·M·R·T</em>. Por ese trabajo recibió en 1901 el primer
            Premio Nobel de Química.
          </p>

          {/* 1 · Tabla comparativa */}
          <h3 className={styles.eduSubtitle}>Los tres medios, comparados</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Medio</th>
                  <th scope="col">Frente al interior</th>
                  <th scope="col">El agua</th>
                  <th scope="col">Célula animal</th>
                  <th scope="col">Célula vegetal</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Hipotónico</td><td>Menos partículas disueltas</td><td>Entra</td><td>Se hincha y puede reventar (hemólisis)</td><td>Turgente</td></tr>
                <tr><td>Isotónico</td><td>Las mismas</td><td>Sin paso neto</td><td>Normal</td><td>Flácida</td></tr>
                <tr><td>Hipertónico</td><td>Más partículas disueltas</td><td>Sale</td><td>Se arruga (crenación)</td><td>Plasmólisis</td></tr>
              </tbody>
            </table>
          </div>
          <p className={styles.fuente}>
            R = 8,314462618 J/(mol·K) es exacta desde la redefinición del Sistema Internacional de
            2019; en atm·L/(mol·K) vale {formatNumber(R_ATM_L, 7)}, y muchos libros la redondean a
            0,082. Las masas molares salen de los pesos atómicos estándar de la IUPAC, redondeados.
          </p>

          {/* 2 · Casos de uso */}
          <h3 className={styles.eduSubtitle}>Dónde aparece la ósmosis</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎒</span>
              <h4>Estudiante de secundaria o preparatoria</h4>
              <p>
                Resuelve el problema en papel y comprueba aquí la osmolaridad, la presión osmótica y
                el sentido del agua. Si el enunciado da gramos, usa el % masa/volumen.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🧑‍🏫</span>
              <h4>Docente de biología o química</h4>
              <p>
                Proyecta los dos paneles: el primero da el número, el segundo lo traduce a lo que
                se ve al microscopio en la práctica de la cebolla o del glóbulo rojo.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🥬</span>
              <h4>Curiosidad en la cocina</h4>
              <p>
                Por qué la lechuga se lacia con la sal, por qué el pepino suelta agua al salarlo o
                por qué una fruta en almíbar se arruga: todo es agua saliendo hacia un medio
                hipertónico.
              </p>
            </div>
          </div>

          {/* 3 · FAQ (misma lista que el JSON-LD) */}
          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <h4 className={styles.faqPregunta}>{f.question}</h4>
                <p>{f.answer}</p>
              </div>
            ))}
          </div>

          {/* 4 · Guía paso a paso */}
          <h3 className={styles.eduSubtitle}>Cómo resolver un problema de ósmosis</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Pasa la concentración a mol/L</strong>
                <p>Si viene en %, cada 1 % son 10 g por litro: divide entre la masa molar.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Multiplica por el factor de van &apos;t Hoff</strong>
                <p>i = 1 si el soluto no se disocia (glucosa, sacarosa, urea), 2 para NaCl o KCl y 3 para CaCl₂. Eso da la osmolaridad.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Pasa la temperatura a kelvin</strong>
                <p>T = t + 273,15. A 25 °C son 298,15 K; a 37 °C, 310,15 K.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Aplica π = i·M·R·T</strong>
                <p>Con R = 0,082 atm·L/(mol·K) el resultado sale en atmósferas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Compara las osmolaridades</strong>
                <p>El agua va hacia la mayor. Frente a una célula: menor es hipotónico, igual isotónico y mayor hipertónico.</p>
              </div>
            </div>
          </div>

          {/* 5 · Mejores prácticas */}
          <h3 className={styles.eduSubtitle}>Consejos</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <div>
                <strong>Cuenta partículas, no gramos</strong>
                <p>Un gramo de sal tira de mucha más agua que un gramo de azúcar: el NaCl pesa menos por mol y además se separa en dos iones.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <div>
                <strong>Kelvin siempre</strong>
                <p>Con la temperatura en grados Celsius, a 25 °C la presión osmótica sale unas 12 veces más pequeña de lo que es (25 en vez de 298,15).</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧭</span>
              <div>
                <strong>Di siempre «respecto a qué»</strong>
                <p>Hipotónico e hipertónico son comparaciones. Una disolución puede ser hipertónica para un glóbulo rojo e hipotónica para el agua de mar.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔬</span>
              <div>
                <strong>Compruébalo en el laboratorio</strong>
                <p>La epidermis de cebolla morada en agua con sal enseña la plasmólisis al microscopio en pocos minutos, y vuelve a su estado al pasarla a agua destilada.</p>
              </div>
            </div>
          </div>

          {/* 6 · Errores frecuentes */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Decir que el agua va «hacia donde hay más agua»:</strong> va al revés, hacia
                el lado con más soluto, que es el que tiene menos agua libre.
              </li>
              <li>
                <strong>Olvidar el factor i:</strong> 0,1 M de NaCl no tiene la presión osmótica de
                0,1 M de glucosa, sino casi el doble.
              </li>
              <li>
                <strong>Confundir ósmosis y difusión:</strong> en la ósmosis se mueve el agua; en la
                difusión, el soluto.
              </li>
              <li>
                <strong>Creer que una célula vegetal revienta en agua destilada:</strong> la pared
                celular lo impide; queda turgente.
              </li>
              <li>
                <strong>Usar la temperatura en grados Celsius:</strong> la ecuación de van &apos;t Hoff
                pide kelvin.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="simulador-osmosis" />
      </main>

      <Footer appName="simulador-osmosis" />
    </div>
  );
}

// ─── Dibujo 1 · Membrana ─────────────────────────────────────────────────────

/** Posiciones repartidas sin azar (secuencia R2), para que el dibujo no tiemble al teclear. */
function posicionesPuntos(n: number, x0: number, x1: number, y0: number, y1: number): { x: number; y: number }[] {
  const a1 = 0.7548776662;
  const a2 = 0.5698402910;
  const lista: { x: number; y: number }[] = [];
  for (let k = 0; k < n; k++) {
    const fx = (0.5 + a1 * (k + 1)) % 1;
    const fy = (0.5 + a2 * (k + 1)) % 1;
    lista.push({ x: x0 + 8 + fx * (x1 - x0 - 16), y: y0 + 8 + fy * (y1 - y0 - 16) });
  }
  return lista;
}

function puntosDe(osm: number | null): number {
  if (osm === null) return 0;
  return Math.min(PUNTOS_MAX, Math.round(osm / OSM_POR_PUNTO));
}

interface DibujoMembranaProps {
  osmA: number | null;
  osmB: number | null;
  sentido: ResultadoMembrana['sentido'] | null;
}

function DibujoMembrana({ osmA, osmB, sentido }: DibujoMembranaProps) {
  const izq = posicionesPuntos(puntosDe(osmA), 24, 176, 62, 186);
  const der = posicionesPuntos(puntosDe(osmB), 184, 336, 62, 186);
  const descripcion =
    sentido === 'B_a_A'
      ? 'El agua pasa del lado B al lado A'
      : sentido === 'A_a_B'
        ? 'El agua pasa del lado A al lado B'
        : sentido === 'ninguno'
          ? 'El agua no pasa en neto de un lado a otro'
          : 'Faltan datos para dibujar el paso del agua';
  return (
    <svg viewBox="0 0 360 230" className={styles.dibujo} role="img" aria-label={`Dos disoluciones separadas por una membrana. ${descripcion}.`}>
      <rect x={20} y={56} width={320} height={134} className={styles.svgAgua} />
      <rect x={20} y={30} width={320} height={160} fill="none" className={styles.svgRecipiente} strokeWidth={3} />
      {izq.map((p, k) => <circle key={`a${k}`} cx={p.x} cy={p.y} r={4} className={styles.svgSoluto} />)}
      {der.map((p, k) => <circle key={`b${k}`} cx={p.x} cy={p.y} r={4} className={styles.svgSoluto} />)}
      <line x1={180} y1={30} x2={180} y2={190} className={styles.svgMembrana} strokeWidth={3} strokeDasharray="6 5" />
      <text x={100} y={50} textAnchor="middle" className={styles.svgRotulo}>A</text>
      <text x={260} y={50} textAnchor="middle" className={styles.svgRotulo}>B</text>
      <text x={180} y={212} textAnchor="middle" className={styles.svgRotuloSecundario}>membrana semipermeable</text>
      {sentido === 'B_a_A' && <FlechaAgua desde={230} hasta={130} />}
      {sentido === 'A_a_B' && <FlechaAgua desde={130} hasta={230} />}
      {sentido === 'ninguno' && (
        <text x={180} y={124} textAnchor="middle" className={styles.svgEtiqueta}>sin paso neto</text>
      )}
    </svg>
  );
}

/** Flecha horizontal del paso del agua, a media altura del recipiente. */
function FlechaAgua({ desde, hasta }: { desde: number; hasta: number }) {
  const y = 120;
  const sentido = hasta > desde ? 1 : -1;
  const base = hasta - sentido * 14;
  return (
    <g className={styles.svgFlechaAgua}>
      <line x1={desde} y1={y} x2={base} y2={y} strokeWidth={6} />
      <polygon points={`${hasta},${y} ${base},${y - 11} ${base},${y + 11}`} />
      <text x={(desde + hasta) / 2} y={y - 16} textAnchor="middle" className={styles.svgEtiqueta}>agua</text>
    </g>
  );
}

// ─── Dibujo 2 · Célula ───────────────────────────────────────────────────────

/** Contorno en estrella para la célula crenada. */
function contornoCrenado(cx: number, cy: number, r: number, picos: number): string {
  const puntos: string[] = [];
  for (let k = 0; k < picos * 2; k++) {
    const radio = k % 2 === 0 ? r : r * 0.82;
    const angulo = (Math.PI * k) / picos;
    puntos.push(`${(cx + radio * Math.cos(angulo)).toFixed(1)},${(cy + radio * Math.sin(angulo)).toFixed(1)}`);
  }
  return puntos.join(' ');
}

interface DibujoCelulaProps {
  tipo: TipoCelula;
  estado: EstadoCelula | null;
}

function DibujoCelula({ tipo, estado }: DibujoCelulaProps) {
  const cx = 150;
  const cy = 110;
  const entra = estado === 'hinchada' || estado === 'turgente';
  const sale = estado === 'crenada' || estado === 'plasmolizada';
  const nombre = tipo === 'animal' ? 'Glóbulo rojo' : 'Célula vegetal';
  const descripcion = estado ? EXPLICACION[estado].titulo.toLowerCase() : 'faltan datos';
  return (
    <svg viewBox="0 0 300 230" className={styles.dibujo} role="img" aria-label={`${nombre} en el medio: ${descripcion}.`}>
      <rect x={6} y={6} width={288} height={196} rx={10} className={styles.svgAgua} />

      {tipo === 'animal' && (
        <g>
          {estado === 'crenada' && (
            <polygon points={contornoCrenado(cx, cy, 52, 14)} className={styles.svgGlobulo} />
          )}
          {estado === 'hinchada' && <circle cx={cx} cy={cy} r={74} className={styles.svgGlobulo} />}
          {(estado === 'normal' || estado === null) && (
            <g>
              <ellipse cx={cx} cy={cy} rx={66} ry={58} className={styles.svgGlobulo} />
              {/* El centro más claro: la forma de disco bicóncavo vista de frente */}
              <ellipse cx={cx} cy={cy} rx={30} ry={26} className={styles.svgGlobuloCentro} />
            </g>
          )}
        </g>
      )}

      {tipo === 'vegetal' && (
        <g>
          <rect x={64} y={36} width={172} height={148} rx={6} className={styles.svgPared} strokeWidth={7} />
          {estado === 'plasmolizada' ? (
            <g>
              <ellipse cx={cx} cy={cy} rx={52} ry={42} className={styles.svgCitoplasma} />
              <ellipse cx={cx} cy={cy} rx={28} ry={22} className={styles.svgVacuola} />
            </g>
          ) : (
            <g>
              <rect
                x={estado === 'turgente' ? 70 : 78}
                y={estado === 'turgente' ? 42 : 50}
                width={estado === 'turgente' ? 160 : 144}
                height={estado === 'turgente' ? 136 : 120}
                rx={estado === 'turgente' ? 3 : 14}
                className={styles.svgCitoplasma}
              />
              <rect
                x={estado === 'turgente' ? 84 : 98}
                y={estado === 'turgente' ? 56 : 68}
                width={estado === 'turgente' ? 132 : 104}
                height={estado === 'turgente' ? 108 : 84}
                rx={10}
                className={styles.svgVacuola}
              />
            </g>
          )}
        </g>
      )}

      {/* Flechas del agua: hacia dentro si entra, hacia fuera si sale */}
      {(entra || sale) &&
        [
          [20, cy, 1, 0],
          [280, cy, -1, 0],
          [cx, 18, 0, 1],
        ].map(([x, y, dx, dy], k) => {
          const largo = 30;
          const x1 = entra ? x : x + dx * largo;
          const y1 = entra ? y : y + dy * largo;
          const x2 = entra ? x + dx * largo : x;
          const y2 = entra ? y + dy * largo : y;
          const ux = Math.sign(x2 - x1);
          const uy = Math.sign(y2 - y1);
          const bx = x2 - ux * 10;
          const by = y2 - uy * 10;
          return (
            <g key={k} className={styles.svgFlechaAgua}>
              <line x1={x1} y1={y1} x2={bx} y2={by} strokeWidth={4} />
              <polygon points={`${x2},${y2} ${bx - uy * 7},${by - ux * 7} ${bx + uy * 7},${by + ux * 7}`} />
            </g>
          );
        })}

      <text x={150} y={222} textAnchor="middle" className={styles.svgRotuloSecundario}>
        {nombre}
        {estado ? ` · ${ESTADO_CORTO[estado]}` : ''}
      </text>
    </svg>
  );
}
