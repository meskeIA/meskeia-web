'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CodigoColoresResistencias.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import {
  COLORES,
  PAPELES,
  TOLERANCIA_SERIE,
  codificar,
  color,
  coloresPara,
  conUnidad,
  decodificar,
  decodificarAlReves,
  leerValor,
  rangoCodificable,
  seriesQueLoContienen,
  valorNormalizadoMasCercano,
  type ClaveColor,
  type ColorResistencia,
  type NombreSerie,
  type NumeroBandas,
  type PapelBanda,
} from '@/lib/calculadoras/codigoColoresResistencias';
import { PREGUNTAS_FRECUENTES } from './metadata';
import CasosAula from './CasosAula';

const NBSP = ' ';

// ─── Presentación ───────────────────────────────────────────────────────────

function textoOhmios(ohmios: number): string {
  const u = conUnidad(ohmios);
  return `${formatNumber(u.valor, u.decimales)}${NBSP}${u.unidad}`;
}

function textoPorcentaje(p: number): string {
  const decimales = Number.isInteger(p) ? 0 : Number.isInteger(p * 10) ? 1 : 2;
  return `${formatNumber(p, decimales)}${NBSP}%`;
}

const MULTIPLICADORES: Record<number, string> = {
  [-2]: '×0,01',
  [-1]: '×0,1',
  0: '×1',
  1: '×10',
  2: '×100',
  3: `×1${NBSP}k`,
  4: `×10${NBSP}k`,
  5: `×100${NBSP}k`,
  6: `×1${NBSP}M`,
  7: `×10${NBSP}M`,
  8: `×100${NBSP}M`,
  9: `×1${NBSP}G`,
};

function significado(papel: PapelBanda, c: ColorResistencia): string {
  switch (papel) {
    case 'cifra':
      return String(c.cifra);
    case 'multiplicador':
      return MULTIPLICADORES[c.exponente as number];
    case 'tolerancia':
      return `±${textoPorcentaje(c.tolerancia as number)}`;
    case 'temperatura':
      return `${c.coefTemperatura}${NBSP}ppm/K`;
  }
}

function etiquetaPapel(papeles: PapelBanda[], i: number): string {
  const papel = papeles[i];
  if (papel === 'cifra') return `${i + 1}.ª cifra`;
  if (papel === 'multiplicador') return 'Multiplicador';
  if (papel === 'tolerancia') return 'Tolerancia';
  return 'Coeficiente de temperatura';
}

/** Cómo escribir un valor normalizado en la caja del paso inverso: 4,7k · 2,2M · 470. */
function textoParaCaja(ohmios: number): string {
  const u = conUnidad(ohmios);
  const letra = u.unidad === 'Ω' ? '' : u.unidad.charAt(0);
  return `${formatNumber(u.valor, u.decimales)}${letra}`;
}

function listaSeries(series: NombreSerie[]): string {
  if (series.length === 1) return series[0];
  return `${series.slice(0, -1).join(', ')} y ${series[series.length - 1]}`;
}

// ─── Dibujo de la resistencia ──────────────────────────────────────────────

/** Posición horizontal de cada banda, en un cuerpo que va de x = 60 a x = 260. */
const POSICIONES: Record<NumeroBandas, number[]> = {
  3: [92, 118, 144],
  4: [86, 110, 134, 222],
  5: [82, 104, 126, 148, 222],
  6: [82, 104, 126, 148, 206, 230],
};

function Resistencia({ n, claves }: { n: NumeroBandas; claves: ClaveColor[] }) {
  const nombres = claves.map((k) => color(k).nombre.toLowerCase());
  return (
    <svg
      className={styles.dibujo}
      viewBox="0 0 320 90"
      role="img"
      aria-label={`Resistencia de ${n} bandas: ${nombres.join(', ')}`}
    >
      <line x1="0" y1="45" x2="320" y2="45" stroke="#8a8a8a" strokeWidth="4" strokeLinecap="round" />
      <rect x="60" y="18" width="200" height="54" rx="20" fill="#dcc79f" stroke="#a88f62" strokeWidth="1.5" />
      {claves.map((k, i) => (
        <rect
          key={`${i}-${k}`}
          x={POSICIONES[n][i]}
          y="18"
          width="13"
          height="54"
          fill={color(k).hex}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

// ─── Estado inicial ────────────────────────────────────────────────────────

const INICIALES: Record<NumeroBandas, ClaveColor[]> = {
  3: ['rojo', 'rojo', 'naranja'],
  4: ['amarillo', 'violeta', 'rojo', 'dorado'],
  5: ['marron', 'negro', 'negro', 'marron', 'marron'],
  6: ['naranja', 'naranja', 'negro', 'marron', 'marron', 'rojo'],
};

const TOLERANCIA_INICIAL: Record<4 | 5 | 6, ClaveColor> = { 4: 'dorado', 5: 'marron', 6: 'marron' };

const SERIES_SUGERIDAS: NombreSerie[] = ['E12', 'E24', 'E96'];

type Modo = 'leer' | 'escribir';

export default function CodigoColoresResistenciasPage() {
  const [modo, setModo] = useState<Modo>('leer');

  // Colores → valor
  const [n, setN] = useState<NumeroBandas>(4);
  const [bandas, setBandas] = useState<Record<NumeroBandas, ClaveColor[]>>(INICIALES);

  // Valor → colores
  const [texto, setTexto] = useState('4k7');
  const [nEscribir, setNEscribir] = useState<4 | 5 | 6>(4);
  const [tolerancias, setTolerancias] = useState<Record<4 | 5 | 6, ClaveColor>>(TOLERANCIA_INICIAL);
  const [temperatura, setTemperatura] = useState<ClaveColor>('marron');

  const papeles = PAPELES[n];
  const claves = bandas[n];
  const lectura = decodificar(n, claves);
  const alReves = decodificarAlReves(n, claves);
  const series = lectura ? seriesQueLoContienen(lectura.ohmios) : [];
  const seriesReves = alReves ? seriesQueLoContienen(alReves.ohmios) : [];

  const avisos: string[] = [];
  if (lectura?.empiezaPorNegro) {
    avisos.push('Ninguna resistencia empieza por negro: comprueba que no la estás leyendo desde el lado equivocado.');
  }
  if (lectura && series.length === 0) {
    avisos.push(
      'Este valor no está en ninguna serie normalizada (E6 a E96). Las resistencias se fabrican en esos valores, así que lo más probable es que algún color se haya leído mal: el rojo y el naranja, o el marrón y el rojo, se confunden con facilidad.',
    );
  }

  const cambiarBanda = (i: number, clave: ClaveColor) => {
    setBandas((prev) => {
      const nuevas = [...prev[n]];
      nuevas[i] = clave;
      return { ...prev, [n]: nuevas };
    });
  };

  const tolerancia = tolerancias[nEscribir];
  const ohmiosEscritos = leerValor(texto);
  const codificacion = ohmiosEscritos !== null ? codificar(ohmiosEscritos, nEscribir, tolerancia, temperatura) : null;
  const rango = rangoCodificable(nEscribir);
  let errorEscribir = '';
  if (texto.trim() !== '' && ohmiosEscritos === null) {
    errorEscribir = `No reconozco «${texto.trim()}» como un valor de resistencia. Escribe, por ejemplo, 470, 4,7k, 4k7 o 2,2M.`;
  } else if (ohmiosEscritos !== null && codificacion === null) {
    errorEscribir = `Con ${nEscribir} bandas el código de colores escribe valores de ${textoOhmios(rango.minimo)} a ${textoOhmios(rango.maximo)}.`;
  }
  const seriesEscritas = ohmiosEscritos !== null ? seriesQueLoContienen(ohmiosEscritos) : [];
  const sugerencias = ohmiosEscritos !== null && codificacion !== null
    ? SERIES_SUGERIDAS.map((s) => valorNormalizadoMasCercano(ohmiosEscritos, s)).filter((v) => v !== null)
    : [];
  const papelesEscribir = PAPELES[nEscribir];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🌈</span> Código de Colores de Resistencias
        </h1>
        <p className={styles.subtitle}>
          Calcula el valor de una resistencia de 3, 4, 5 o 6 bandas por sus colores, o al revés: escribe el valor y te
          dice qué colores lleva.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.modos} role="group" aria-label="Qué quieres hacer">
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'leer' ? styles.modoActivo : ''}`}
          aria-pressed={modo === 'leer'}
          onClick={() => setModo('leer')}
        >
          <span aria-hidden="true">🎨</span> De los colores al valor
        </button>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'escribir' ? styles.modoActivo : ''}`}
          aria-pressed={modo === 'escribir'}
          onClick={() => setModo('escribir')}
        >
          <span aria-hidden="true">🔢</span> Del valor a los colores
        </button>
      </div>

      {modo === 'leer' && (
        <section className={styles.card} aria-labelledby="tituloLeer">
          <div className={styles.cardCabecera}>
            <h2 id="tituloLeer" className={styles.cardTitulo}>Elige los colores de las bandas</h2>
            <div className={styles.numeroBandas} role="group" aria-label="Número de bandas">
              {([3, 4, 5, 6] as NumeroBandas[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`${styles.numeroBtn} ${n === k ? styles.numeroActivo : ''}`}
                  aria-pressed={n === k}
                  onClick={() => setN(k)}
                >
                  {`${k} bandas`}
                </button>
              ))}
            </div>
          </div>

          <Resistencia n={n} claves={claves} />

          <div className={styles.bandas}>
            {papeles.map((papel, i) => (
              <fieldset key={`${n}-${i}`} className={styles.banda}>
                <legend className={styles.bandaLeyenda}>{`Banda ${i + 1} · ${etiquetaPapel(papeles, i)}`}</legend>
                <div className={styles.chips}>
                  {coloresPara(papel).map((c) => (
                    <button
                      key={c.clave}
                      type="button"
                      className={`${styles.chip} ${claves[i] === c.clave ? styles.chipActivo : ''}`}
                      aria-pressed={claves[i] === c.clave}
                      onClick={() => cambiarBanda(i, c.clave)}
                    >
                      <span className={styles.muestra} style={{ background: c.hex }} aria-hidden="true" />
                      <span className={styles.chipNombre}>{c.nombre}</span>
                      <span className={styles.chipValor}>{significado(papel, c)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          {lectura && (
            <div className={styles.resultado} aria-live="polite">
              <p className={styles.valorGrande}>
                <span className={styles.valorCifra}>{textoOhmios(lectura.ohmios)}</span>
                <span className={styles.valorTolerancia}>{`±${textoPorcentaje(lectura.tolerancia)}`}</span>
              </p>
              <p className={styles.rango}>
                {`Valor real entre ${textoOhmios(lectura.minimo)} y ${textoOhmios(lectura.maximo)}`}
              </p>
              {lectura.toleranciaImplicita && (
                <p className={styles.nota}>Sin banda de tolerancia: se entiende que es del 20 %.</p>
              )}
              {lectura.coefTemperatura !== null && (
                <p className={styles.nota}>
                  {`${lectura.coefTemperatura} ppm/K: varía unos ${textoOhmios((lectura.ohmios * lectura.coefTemperatura) / 1e6)} por cada grado de temperatura.`}
                </p>
              )}
              {series.length > 0 && (
                <p className={styles.serie}>
                  {`Valor normalizado de la serie ${listaSeries(series)}.`}
                </p>
              )}
              {avisos.length > 0 && (
                <ul className={styles.avisos}>
                  {avisos.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
              {alReves && (
                <div className={styles.alReves}>
                  <p className={styles.alRevesTitulo}>
                    <span aria-hidden="true">🔄</span> Leída desde el otro extremo
                  </p>
                  <p>
                    {`Sería ${textoOhmios(alReves.ohmios)} ±${textoPorcentaje(alReves.tolerancia)}${
                      seriesReves.length > 0 ? `, también un valor normalizado (${listaSeries(seriesReves)})` : ', que no es un valor normalizado'
                    }. La banda de tolerancia suele estar algo más separada de las demás: si no se distingue, mide la resistencia con un multímetro.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {modo === 'escribir' && (
        <section className={styles.card} aria-labelledby="tituloEscribir">
          <div className={styles.cardCabecera}>
            <h2 id="tituloEscribir" className={styles.cardTitulo}>Escribe el valor</h2>
            <div className={styles.numeroBandas} role="group" aria-label="Número de bandas">
              {([4, 5, 6] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`${styles.numeroBtn} ${nEscribir === k ? styles.numeroActivo : ''}`}
                  aria-pressed={nEscribir === k}
                  onClick={() => setNEscribir(k)}
                >
                  {`${k} bandas`}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.campo}>
            <label htmlFor="valorResistencia" className={styles.etiqueta}>Valor de la resistencia</label>
            <input
              id="valorResistencia"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              className={styles.entrada}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              aria-describedby="ayudaValor"
            />
            <p id="ayudaValor" className={styles.ayuda}>
              Ejemplos: 470 · 4,7k · 4k7 · 2,2M · R47. La k es kiloohmios y la M, megaohmios.
            </p>
          </div>

          <fieldset className={styles.banda}>
            <legend className={styles.bandaLeyenda}>Tolerancia</legend>
            <div className={styles.chips}>
              {coloresPara('tolerancia').map((c) => (
                <button
                  key={c.clave}
                  type="button"
                  className={`${styles.chip} ${tolerancia === c.clave ? styles.chipActivo : ''}`}
                  aria-pressed={tolerancia === c.clave}
                  onClick={() => setTolerancias((prev) => ({ ...prev, [nEscribir]: c.clave }))}
                >
                  <span className={styles.muestra} style={{ background: c.hex }} aria-hidden="true" />
                  <span className={styles.chipNombre}>{c.nombre}</span>
                  <span className={styles.chipValor}>{significado('tolerancia', c)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {nEscribir === 6 && (
            <fieldset className={styles.banda}>
              <legend className={styles.bandaLeyenda}>Coeficiente de temperatura</legend>
              <div className={styles.chips}>
                {coloresPara('temperatura').map((c) => (
                  <button
                    key={c.clave}
                    type="button"
                    className={`${styles.chip} ${temperatura === c.clave ? styles.chipActivo : ''}`}
                    aria-pressed={temperatura === c.clave}
                    onClick={() => setTemperatura(c.clave)}
                  >
                    <span className={styles.muestra} style={{ background: c.hex }} aria-hidden="true" />
                    <span className={styles.chipNombre}>{c.nombre}</span>
                    <span className={styles.chipValor}>{significado('temperatura', c)}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div role="alert" aria-live="polite" className={styles.zonaError}>
            {errorEscribir !== '' && <p className={styles.error}>{errorEscribir}</p>}
          </div>

          {codificacion && ohmiosEscritos !== null && (
            <div className={styles.resultado} aria-live="polite">
              <Resistencia n={nEscribir} claves={codificacion.claves} />
              <ol className={styles.listaBandas}>
                {codificacion.claves.map((k, i) => (
                  <li key={`${i}-${k}`} className={styles.itemBanda}>
                    <span className={styles.muestra} style={{ background: color(k).hex }} aria-hidden="true" />
                    <span className={styles.itemNombre}>{color(k).nombre}</span>
                    <span className={styles.itemPapel}>
                      {`${etiquetaPapel(papelesEscribir, i)}: ${significado(papelesEscribir[i], color(k))}`}
                    </span>
                  </li>
                ))}
              </ol>
              <p className={styles.rango}>
                {`${textoOhmios(codificacion.ohmiosCodificados)} ±${textoPorcentaje(color(tolerancia).tolerancia as number)}`}
              </p>
              {!codificacion.exacto && (
                <p className={styles.avisoInline}>
                  {`${textoOhmios(ohmiosEscritos)} tiene más cifras de las que caben en ${nEscribir} bandas: se redondea a ${textoOhmios(codificacion.ohmiosCodificados)}.`}
                </p>
              )}
              <p className={styles.serie}>
                {seriesEscritas.length > 0
                  ? `${textoOhmios(ohmiosEscritos)} es un valor normalizado de la serie ${listaSeries(seriesEscritas)}.`
                  : `${textoOhmios(ohmiosEscritos)} no es un valor normalizado: no lo encontrarás en una tienda. Estos son los más cercanos:`}
              </p>
              <div className={styles.tablaEnvoltorio}>
                <table className={styles.tablaSugerencias}>
                  <caption className={styles.leyendaTabla}>Valor normalizado más cercano en cada serie</caption>
                  <thead>
                    <tr>
                      <th scope="col">Serie</th>
                      <th scope="col">Tolerancia habitual</th>
                      <th scope="col">Valor</th>
                      <th scope="col">Diferencia</th>
                      <th scope="col"><span className={styles.soloLector}>Acción</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sugerencias.map((s) => (
                      <tr key={s.serie}>
                        <td>{s.serie}</td>
                        <td>{`±${textoPorcentaje(TOLERANCIA_SERIE[s.serie])}`}</td>
                        <td>{textoOhmios(s.ohmios)}</td>
                        <td>{s.diferencia === 0 ? 'Exacto' : `${s.diferencia > 0 ? '+' : ''}${formatNumber(s.diferencia, 1)}${NBSP}%`}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.usarBtn}
                            onClick={() => setTexto(textoParaCaja(s.ohmios))}
                            aria-label={`Ver los colores de ${textoOhmios(s.ohmios)}`}
                          >
                            Ver colores
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      <CasosAula />

      <EducationalSection
        title="El código de colores, explicado"
        subtitle="La tabla completa, cómo se lee cada tipo de resistencia y los errores más habituales"
      >
        <section className={styles.guideSection}>
          <h2>Por qué las resistencias llevan colores</h2>
          <p>
            Una resistencia de patillas es demasiado pequeña para imprimir su valor de forma legible, y además gira
            sobre sí misma cuando se suelda. Por eso, desde los años veinte, el valor se escribe con anillos de color
            que se leen desde cualquier lado. El sistema está recogido hoy en la norma internacional IEC 60062.
          </p>
          <p>
            Cada color es una cifra del 0 al 9. Las primeras bandas forman un número; la siguiente dice por cuánto
            multiplicarlo, es decir, cuántos ceros añadir; y las últimas indican la tolerancia y, en las de 6 bandas, el
            coeficiente de temperatura.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Tabla del código de colores</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Color</th>
                  <th scope="col">Cifra</th>
                  <th scope="col">Multiplicador</th>
                  <th scope="col">Tolerancia</th>
                  <th scope="col">Temperatura</th>
                </tr>
              </thead>
              <tbody>
                {COLORES.map((c) => (
                  <tr key={c.clave}>
                    <td>
                      <span className={styles.celdaColor}>
                        <span className={styles.muestra} style={{ background: c.hex }} aria-hidden="true" />
                        <span>{c.nombre}</span>
                      </span>
                    </td>
                    <td>{c.cifra !== null ? String(c.cifra) : '—'}</td>
                    <td>{c.exponente !== null ? MULTIPLICADORES[c.exponente] : '—'}</td>
                    <td>{c.tolerancia !== null ? `±${textoPorcentaje(c.tolerancia)}` : '—'}</td>
                    <td>{c.coefTemperatura !== null ? `${c.coefTemperatura}${NBSP}ppm/K` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.notaTabla}>
            Sin banda de tolerancia, la tolerancia es del 20 %. En resistencias de precisión, las bandas de tolerancia
            naranja, amarillo y gris pueden indicar tolerancias más finas que no coinciden en todas las ediciones de la
            norma: si es tu caso, confírmalo en la hoja de datos del fabricante.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>3, 4, 5 o 6 bandas: qué cambia</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Bandas</th>
                  <th scope="col">Qué indica cada una</th>
                  <th scope="col">Tolerancia habitual</th>
                  <th scope="col">Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>3</td>
                  <td>2 cifras + multiplicador</td>
                  <td>±20 % (no lleva banda)</td>
                  <td>Rojo, rojo, naranja = 22 kΩ</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>2 cifras + multiplicador + tolerancia</td>
                  <td>±5 % (dorado) o ±10 % (plateado)</td>
                  <td>Amarillo, violeta, rojo, dorado = 4,7 kΩ ±5 %</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>3 cifras + multiplicador + tolerancia</td>
                  <td>±1 % (marrón) o ±2 % (rojo)</td>
                  <td>Marrón, negro, negro, marrón, marrón = 1 kΩ ±1 %</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>Las 5 anteriores + coeficiente de temperatura</td>
                  <td>±1 % o mejor</td>
                  <td>Naranja, naranja, negro, marrón, marrón, rojo = 3,3 kΩ ±1 %, 50 ppm/K</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Para quién es útil</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🎒</div>
              <h3>Estudiantes de tecnología</h3>
              <p>
                En las prácticas de electricidad de secundaria se pide leer resistencias y comprobarlas con el
                multímetro. La calculadora deja ver cómo cambia el valor al mover cada banda.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🧰</div>
              <h3>Quien monta un circuito</h3>
              <p>
                El esquema pide una de 4k7 y tienes una bolsa de resistencias sueltas: el paso inverso te dice que
                buscas amarillo, violeta y rojo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">🔧</div>
              <h3>Reparar un aparato</h3>
              <p>
                Con el calor, los colores se oscurecen y el rojo se confunde con el marrón. Si el valor que sale no es
                normalizado, la calculadora lo avisa: es la pista de que algún color está mal leído.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon} aria-hidden="true">💡</div>
              <h3>Elegir la resistencia de un LED</h3>
              <p>
                Si lo que necesitas es calcular qué resistencia lleva un LED,{' '}
                <a href="/calculadora-resistencias-led/" className={styles.enlace}>
                  la calculadora de resistencias para LED
                </a>{' '}
                hace el cálculo y te da sus colores.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo leer una resistencia paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                Cuenta las bandas. Si hay cuatro y una es dorada o plateada, esa es la tolerancia: ponla a la derecha.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                Lee las cifras de izquierda a derecha: dos en las de 3 y 4 bandas, tres en las de 5 y 6.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                La banda siguiente es el multiplicador: añade tantos ceros como su cifra (rojo, dos ceros). Si es
                dorada, divide entre 10; si es plateada, entre 100.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                Pasa a la unidad cómoda: 4.700 Ω son 4,7 kΩ, y 2.200.000 Ω, 2,2 MΩ.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                Aplica la tolerancia: una de 4,7 kΩ ±5 % puede medir entre 4,465 y 4,935 kΩ y estar bien.
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                Si dudas, mide con el multímetro fuera del circuito: montada en la placa, las piezas en paralelo falsean la
                lectura.
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <h3>{f.question}</h3>
                <p>{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Mejores prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">💡</div>
              <h3>Lee con buena luz</h3>
              <p>Con luz cálida el rojo, el naranja y el marrón se parecen mucho. Mejor luz blanca o del día.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">📏</div>
              <h3>Confirma con el multímetro</h3>
              <p>El color orienta y el multímetro decide, sobre todo en resistencias viejas o recalentadas.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">📦</div>
              <h3>Ordena por valor</h3>
              <p>Un surtido de la serie E12 cubre casi todo lo que piden los montajes de iniciación.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">👁️</div>
              <h3>Si distingues mal algunos colores</h3>
              <p>
                Cada botón lleva el nombre del color además de la muestra. Una lupa o el multímetro ayudan con las bandas
                que más se confunden.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <span>Errores frecuentes al leer resistencias</span>
          </div>
          <ul className={styles.warningList}>
            <li>Empezar a leer por el lado de la tolerancia: en las de 5 bandas puede dar otro valor posible.</li>
            <li>Tomar el multiplicador por una cifra más: rojo, rojo, rojo es 2,2 kΩ, no 222 Ω.</li>
            <li>Confundir rojo con naranja o marrón con rojo, sobre todo en resistencias que se han calentado.</li>
            <li>Olvidar la tolerancia: una de 100 Ω ±5 % que mide 97 Ω está bien.</li>
            <li>Medir la resistencia montada en el circuito, donde otras piezas cambian la lectura.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="codigo-colores-resistencias" />
      <Footer appName="codigo-colores-resistencias" />
    </div>
  );
}
