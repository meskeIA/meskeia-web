'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './GeneradorCartonesBingo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────────────────────

type Modalidad = '90' | '75';

/** Un cartón es una matriz de casillas: número, hueco (null) o casilla libre */
type Casilla = number | null | 'LIBRE';

interface Carton {
  numero: number;
  casillas: Casilla[][];
}

const LETRAS_75 = ['B', 'I', 'N', 'G', 'O'];

const DATOS_MODALIDAD: Record<Modalidad, { nombre: string; detalle: string; bolas: number }> = {
  '90': { nombre: '90 bolas · cartón 3×9', detalle: 'Modalidad europea, a línea y bingo', bolas: 90 },
  '75': { nombre: '75 bolas · cartón 5×5', detalle: 'Modalidad americana, con casilla libre', bolas: 75 },
};

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

/** Generador con semilla: la misma partida produce siempre los mismos cartones */
function crearAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function barajar<T>(lista: T[], aleatorio: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Rango de números de cada columna en el cartón de 90: 1-9, 10-19 … 80-90 */
function rangoColumna(columna: number): number[] {
  const desde = columna === 0 ? 1 : columna * 10;
  const hasta = columna === 8 ? 90 : columna * 10 + 9;
  const numeros: number[] = [];
  for (let n = desde; n <= hasta; n++) numeros.push(n);
  return numeros;
}

/**
 * Reparte los 15 números entre las 9 columnas (entre 1 y 3 por columna)
 * y decide qué filas ocupa cada columna con 5 números por fila.
 */
function repartirColumnas(aleatorio: () => number): number[][] {
  for (let intento = 0; intento < 200; intento++) {
    // Cuántos números lleva cada columna: parte de 1 y reparte los 6 restantes
    const porColumna = Array<number>(9).fill(1);
    let restantes = 6;
    while (restantes > 0) {
      const col = Math.floor(aleatorio() * 9);
      if (porColumna[col] < 3) {
        porColumna[col] += 1;
        restantes -= 1;
      }
    }

    // Asignación de filas con retroceso: cada fila debe acabar con 5 números
    const filasPorColumna: number[][] = Array.from({ length: 9 }, () => []);
    const ocupacion = [0, 0, 0];

    const asignar = (col: number): boolean => {
      if (col === 9) return ocupacion.every((o) => o === 5);

      const combinaciones: number[][] =
        porColumna[col] === 3
          ? [[0, 1, 2]]
          : porColumna[col] === 2
            ? barajar(
                [
                  [0, 1],
                  [0, 2],
                  [1, 2],
                ],
                aleatorio,
              )
            : barajar([[0], [1], [2]], aleatorio);

      for (const filas of combinaciones) {
        if (filas.some((f) => ocupacion[f] >= 5)) continue;
        filas.forEach((f) => (ocupacion[f] += 1));
        filasPorColumna[col] = filas;
        if (asignar(col + 1)) return true;
        filas.forEach((f) => (ocupacion[f] -= 1));
        filasPorColumna[col] = [];
      }
      return false;
    };

    if (asignar(0)) return filasPorColumna;
  }

  // Reparto de reserva: 5 números en las tres primeras columnas de cada fila
  return [[0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 1, 2], [], [], [], []];
}

function generarCarton90(numero: number, aleatorio: () => number): Carton {
  const filasPorColumna = repartirColumnas(aleatorio);
  const casillas: Casilla[][] = Array.from({ length: 3 }, () => Array<Casilla>(9).fill(null));

  filasPorColumna.forEach((filas, col) => {
    if (filas.length === 0) return;
    // Los números de una columna se colocan de menor a mayor de arriba abajo
    const elegidos = barajar(rangoColumna(col), aleatorio)
      .slice(0, filas.length)
      .sort((a, b) => a - b);
    [...filas]
      .sort((a, b) => a - b)
      .forEach((fila, i) => {
        casillas[fila][col] = elegidos[i];
      });
  });

  return { numero, casillas };
}

function generarCarton75(numero: number, aleatorio: () => number): Carton {
  const casillas: Casilla[][] = Array.from({ length: 5 }, () => Array<Casilla>(5).fill(null));

  for (let col = 0; col < 5; col++) {
    const desde = col * 15 + 1;
    const rango: number[] = [];
    for (let n = desde; n < desde + 15; n++) rango.push(n);
    const elegidos = barajar(rango, aleatorio).slice(0, 5);
    for (let fila = 0; fila < 5; fila++) {
      casillas[fila][col] = elegidos[fila];
    }
  }

  casillas[2][2] = 'LIBRE';
  return { numero, casillas };
}

function firmaCarton(carton: Carton): string {
  return carton.casillas.map((fila) => fila.join(',')).join('|');
}

function generarTirada(modalidad: Modalidad, cantidad: number, semilla: number): Carton[] {
  const aleatorio = crearAleatorio(semilla);
  const cartones: Carton[] = [];
  const vistos = new Set<string>();
  let intentos = 0;

  while (cartones.length < cantidad && intentos < cantidad * 50) {
    intentos += 1;
    const candidato =
      modalidad === '90'
        ? generarCarton90(cartones.length + 1, aleatorio)
        : generarCarton75(cartones.length + 1, aleatorio);
    const firma = firmaCarton(candidato);
    if (vistos.has(firma)) continue;
    vistos.add(firma);
    cartones.push(candidato);
  }

  return cartones;
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function GeneradorCartonesBingoPage() {
  const [titulo, setTitulo] = useState('Bingo');
  const [modalidad, setModalidad] = useState<Modalidad>('90');
  const [cantidad, setCantidad] = useState(6);
  const [semillaManual, setSemillaManual] = useState('');
  const [cartones, setCartones] = useState<Carton[]>([]);
  const [semilla, setSemilla] = useState(0);
  const [cantados, setCantados] = useState<number[]>([]);

  const generar = useCallback(() => {
    const base = Number(semillaManual.replace(/\D/g, ''));
    const nuevaSemilla = base > 0 ? base : Math.floor(Math.random() * 900000) + 100000;
    setCartones(generarTirada(modalidad, cantidad, nuevaSemilla));
    setSemilla(nuevaSemilla);
    setCantados([]);
  }, [modalidad, cantidad, semillaManual]);

  const totalBolas = DATOS_MODALIDAD[modalidad].bolas;

  const cantarNumero = () => {
    const disponibles: number[] = [];
    for (let n = 1; n <= totalBolas; n++) {
      if (!cantados.includes(n)) disponibles.push(n);
    }
    if (disponibles.length === 0) return;
    const elegido = disponibles[Math.floor(Math.random() * disponibles.length)];
    setCantados([...cantados, elegido]);
  };

  const ultimoCantado = cantados.length > 0 ? cantados[cantados.length - 1] : null;

  const columnasCarton = modalidad === '90' ? 9 : 5;

  return (
    <div className={styles.container}>
      <div className={styles.noPrint}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🎱</span> Generador de Cartones de Bingo
          </h1>
          <p className={styles.subtitle}>
            Cartones únicos para imprimir en las dos modalidades, con bombo digital para cantar la
            partida.
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">⚙️</span> Configura la partida
            </h2>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Título de los cartones</span>
              <input
                type="text"
                className={styles.input}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={40}
                placeholder="Bingo"
              />
            </label>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Modalidad</span>
              <div className={styles.grupoBotones} role="group" aria-label="Modalidad de bingo">
                {(Object.keys(DATOS_MODALIDAD) as Modalidad[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.btnOpcion} ${modalidad === m ? styles.btnOpcionActivo : ''}`}
                    aria-pressed={modalidad === m}
                    onClick={() => {
                      setModalidad(m);
                      setCartones([]);
                      setCantados([]);
                    }}
                  >
                    <strong>{DATOS_MODALIDAD[m].nombre}</strong>
                    <small>{DATOS_MODALIDAD[m].detalle}</small>
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Número de cartones: {cantidad}</span>
              <input
                type="range"
                className={styles.rango}
                min={1}
                max={40}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Nº de partida (opcional)</span>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={semillaManual}
                onChange={(e) => setSemillaManual(e.target.value)}
                placeholder="Al azar"
                maxLength={7}
              />
            </label>

            <button type="button" className={styles.btnPrimary} onClick={generar}>
              <span aria-hidden="true">✨</span> Generar cartones
            </button>

            {cartones.length > 0 && (
              <>
                <p className={styles.resumen}>
                  <strong>{cartones.length}</strong> cartones únicos generados. Partida n.º{' '}
                  <strong>{semilla}</strong>.
                </p>
                <div className={styles.acciones}>
                  <button type="button" className={styles.btnSecundario} onClick={() => window.print()}>
                    <span aria-hidden="true">🖨️</span> Imprimir cartones
                  </button>
                  <button type="button" className={styles.btnSecundario} onClick={generar}>
                    <span aria-hidden="true">🔄</span> Otra tirada
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Bombo digital */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">🎤</span> Bombo digital
            </h2>

            <div className={styles.bombo}>
              <div className={styles.bolaGrande} aria-live="polite">
                {ultimoCantado ?? '—'}
              </div>
              <p className={styles.contadorBolas}>
                {cantados.length} de {totalBolas} bolas cantadas
              </p>
            </div>

            <div className={styles.acciones}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={cantarNumero}
                disabled={cantados.length >= totalBolas}
              >
                <span aria-hidden="true">🎲</span>{' '}
                {cantados.length >= totalBolas ? 'No quedan bolas' : 'Cantar número'}
              </button>
              <button type="button" className={styles.btnSecundario} onClick={() => setCantados([])}>
                <span aria-hidden="true">♻️</span> Reiniciar bombo
              </button>
            </div>

            <div className={styles.panelNumeros} aria-label="Números cantados">
              {Array.from({ length: totalBolas }, (_, i) => i + 1).map((n) => (
                <span key={n} className={cantados.includes(n) ? styles.numeroCantado : styles.numero}>
                  {n}
                </span>
              ))}
            </div>

            <p className={styles.pista}>
              El historial completo queda a la vista, que es justo lo que se pierde con un bombo casero
              cuando alguien canta línea y hay que comprobar.
            </p>
          </div>
        </div>
      </div>

      {/* Área imprimible */}
      {cartones.length > 0 && (
        <div className={styles.printArea}>
          <h2 className={styles.tituloHoja}>
            {titulo || 'Bingo'} · partida n.º {semilla}
          </h2>

          <div className={styles.rejillaCartones}>
            {cartones.map((carton) => (
              <div key={carton.numero} className={styles.carton}>
                <div className={styles.cartonCabecera}>
                  <span>{titulo || 'Bingo'}</span>
                  <span>Cartón {carton.numero}</span>
                </div>

                <table className={styles.tablaCarton}>
                  <caption className={styles.srOnly}>
                    Cartón número {carton.numero} de la partida {semilla}
                  </caption>
                  {modalidad === '75' && (
                    <thead>
                      <tr>
                        {LETRAS_75.map((letra) => (
                          <th key={letra} scope="col">
                            {letra}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {carton.casillas.map((fila, f) => (
                      <tr key={f}>
                        {fila.map((casilla, c) => (
                          <td
                            key={c}
                            className={
                              casilla === null
                                ? styles.casillaVacia
                                : casilla === 'LIBRE'
                                  ? styles.casillaLibre
                                  : styles.casilla
                            }
                          >
                            {casilla === 'LIBRE' ? '★' : (casilla ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <p className={styles.pieHoja}>
            {cartones.length} cartones · {DATOS_MODALIDAD[modalidad].nombre} · {columnasCarton} columnas ·
            meskeia.com
          </p>
        </div>
      )}

      <div className={styles.noPrint}>
        <EducationalSection
          icon="📚"
          title="Cómo funciona un cartón de bingo por dentro"
          subtitle="Las reglas de construcción, las dos modalidades y cómo organizar una partida casera"
        >
          <section className={styles.guideSection}>
            <h2>Un cartón no es una tabla de números al azar</h2>
            <p>
              En la modalidad de 90 bolas, cada columna del cartón cubre una franja fija: la primera va
              del 1 al 9, la segunda del 10 al 19 y así sucesivamente hasta la novena, que abarca del 80
              al 90 y por eso tiene once números en lugar de diez. Un cartón válido lleva exactamente
              quince números repartidos en <strong>cinco por fila</strong>, con cuatro huecos en cada
              una, y ninguna columna puede quedarse vacía ni pasar de tres números.
            </p>
            <p>
              Esa estructura no es decorativa: es lo que hace que la partida avance a un ritmo parejo para
              todo el mundo. Un cartón generado sin esas reglas puede concentrar números de la misma
              decena y quedar desequilibrado, con más o menos probabilidad de línea que el resto.
            </p>

            <h2>Las dos modalidades</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>90 bolas</th>
                    <th>75 bolas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Formato del cartón</strong>
                    </td>
                    <td>3 filas × 9 columnas, 15 números</td>
                    <td>5 × 5, 24 números y casilla libre central</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Dónde se juega</strong>
                    </td>
                    <td>España y buena parte de Europa</td>
                    <td>Muy extendida en América</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Premios habituales</strong>
                    </td>
                    <td>Línea y bingo (cartón completo)</td>
                    <td>Figuras: línea, cruz, cuatro esquinas, cartón lleno</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Duración típica</strong>
                    </td>
                    <td>Más larga: hay que cantar más bolas</td>
                    <td>Más ágil, sobre todo si se juega a figuras</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Ideal para</strong>
                    </td>
                    <td>Grupos grandes y partidas de sobremesa</td>
                    <td>Sesiones cortas y juegos por figuras</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Tres formas de montar una partida</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🎄
                  </span>
                  <h3>Reunión familiar</h3>
                </div>
                <p>
                  Dos cartones por persona y una sola voz cantando. Con el bombo digital nadie discute si
                  un número salió o no: el panel muestra todo lo cantado y basta mirarlo para resolver
                  una reclamación.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🧑‍🏫
                  </span>
                  <h3>Aula y talleres</h3>
                </div>
                <p>
                  El bingo de números funciona como repaso de lectura de cifras. Anotando el número de
                  partida se pueden reimprimir los mismos cartones en la sesión siguiente y comparar
                  cuánto ha mejorado la velocidad de localización.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🎉
                  </span>
                  <h3>Evento con muchos jugadores</h3>
                </div>
                <p>
                  Con treinta o cuarenta cartones conviene imprimir antes y repartir numerado: el número
                  de cartón impreso en la cabecera permite saber quién juega con cuál y entregar el
                  premio sin dudas.
                </p>
              </div>
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Cuántos cartones conviene por jugador?
                </h4>
                <p>
                  Con uno o dos cartones se sigue la partida cómodamente incluso a ritmo rápido. A partir
                  de tres empieza a fallar la atención y aparecen los números no marcados, sobre todo con
                  niños o en grupos grandes. En sesiones largas es preferible jugar más partidas cortas
                  que repartir muchos cartones a la vez.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Puede haber dos cartones iguales?
                </h4>
                <p>
                  No: cada cartón nuevo se compara con los anteriores y se descarta si coincide. Conviene
                  saber que dos cartones distintos sí pueden compartir muchos números, lo cual es normal y
                  no invalida la partida; lo importante es que la combinación completa sea única.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Para qué sirve el número de partida?
                </h4>
                <p>
                  Es la semilla que reproduce la tirada. Si alguien pierde su cartón a media partida, o si
                  se quiere repetir exactamente la misma sesión otro día, basta introducir ese número con
                  la misma modalidad y la misma cantidad de cartones para obtener el juego idéntico.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Se puede jugar sin imprimir?
                </h4>
                <p>
                  Sí, mostrando los cartones en pantalla y marcando con fichas o legumbres sobre un
                  dispositivo apoyado en la mesa, aunque resulta incómodo con varios cartones. Para
                  partidas de más de tres o cuatro jugadores, el papel sigue siendo más práctico: se marca
                  con bolígrafo y no hay riesgo de perder la vista al cambiar de pantalla.
                </p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h3>Errores que estropean una partida</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Imprimir sin comprobar la modalidad:</strong> repartir cartones de 75 y cantar
                  con bombo de 90 hace que salgan números que nadie tiene; conviene verificar la cabecera
                  antes de imprimir la tanda entera.
                </li>
                <li>
                  <strong>No anotar el número de partida:</strong> sin él no hay forma de reponer un cartón
                  perdido, y reimprimir genera una tirada distinta que no encaja con la que ya está en
                  juego.
                </li>
                <li>
                  <strong>Cantar desde dos dispositivos:</strong> cada bombo lleva su propio historial, así
                  que dos personas cantando en paralelo desincronizan la partida por completo.
                </li>
                <li>
                  <strong>Repartir demasiados cartones por jugador:</strong> a partir del tercero se pierden
                  números, y las reclamaciones a destiempo alargan la partida más que un cartón extra.
                </li>
                <li>
                  <strong>Recargar la página a media partida:</strong> el historial de números cantados vive
                  en la sesión del navegador y se pierde al recargar; si hace falta hacerlo, conviene
                  anotar antes las bolas ya salidas.
                </li>
                <li>
                  <strong>Confiar la comprobación a la memoria:</strong> antes de dar por bueno un bingo hay
                  que contrastar cada número del cartón con el panel de cantados, no con lo que se recuerda
                  haber oído.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-cartones-bingo')} />

        <ShareCard appName="generador-cartones-bingo" />

        <Footer appName="generador-cartones-bingo" />
      </div>
    </div>
  );
}
