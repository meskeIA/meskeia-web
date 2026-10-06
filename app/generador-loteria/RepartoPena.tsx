'use client';

import { useMemo, useRef, useState } from 'react';
import styles from './GeneradorLoteria.module.css';
import { formatCurrency, formatNumber, formatPercentage, parseSpanishNumber } from '@/lib';
import {
  EXENCION_PREMIO_LOTERIA,
  IMPORTE_MINIMO_EXENCION_COMPLETA,
  TIPO_GRAVAMEN_PREMIO_LOTERIA,
  exencionPorImporteJugado,
} from '@/data/fiscal';
import { repartirPremio } from './reparto';

/**
 * Reparto del premio de una peña (S0180). Quien organiza la peña apunta lo que puso cada
 * persona y el premio de cada décimo o apuesta, y ve lo que retiene el banco y lo que le
 * llega a cada uno. El cálculo vive en `reparto.ts` y el gravamen en
 * `data/fiscal/premios-loterias.ts`; aquí solo se recoge, se valida y se pinta.
 *
 * Nada sale del navegador ni se guarda: los nombres y los importes viven en el estado de
 * React y se pierden al cerrar la página, a propósito (son datos de terceros).
 */

interface FilaPersona {
  id: number;
  nombre: string;
  aportacion: string;
}

interface FilaPremio {
  id: number;
  importe: string;
}

const MAX_PERSONAS = 50;
const MAX_PREMIOS = 20;

/** Nombre que se enseña: el escrito o, si está vacío, «Persona N». */
/** «20 %» con espacio duro, sacado del módulo fiscal */
const TIPO_TEXTO = formatPercentage(TIPO_GRAVAMEN_PREMIO_LOTERIA, 0);
/** «0,50 €» */
const MINIMO_TEXTO = `${formatNumber(IMPORTE_MINIMO_EXENCION_COMPLETA, 2)} €`;

const nombreDe = (fila: FilaPersona, i: number) => fila.nombre.trim() || `Persona ${i + 1}`;

/** «A», «A y B», «A, B y C» */
const enumerar = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;

/* Las mismas guardas que `repartirPremio`, campo a campo, para señalar CUÁL falla (WCAG 3.3.1) */
const aportacionInvalida = (fila: FilaPersona) => {
  const n = parseSpanishNumber(fila.aportacion);
  return !Number.isFinite(n) || n < 0;
};
const premioInvalido = (fila: FilaPremio) => {
  if (fila.importe.trim() === '') return false; // los vacíos no se mandan al cálculo
  const n = parseSpanishNumber(fila.importe);
  return !Number.isFinite(n) || n <= 0;
};

const ID_ERROR = 'pena-error';

export default function RepartoPena() {
  const siguienteId = useRef(10);
  const nuevoId = () => ++siguienteId.current;

  const [personas, setPersonas] = useState<FilaPersona[]>([
    { id: 1, nombre: '', aportacion: '10' },
    { id: 2, nombre: '', aportacion: '5' },
    { id: 3, nombre: '', aportacion: '5' },
  ]);
  const [premios, setPremios] = useState<FilaPremio[]>([{ id: 4, importe: '' }]);
  const [importeJugado, setImporteJugado] = useState('20');

  const resultado = useMemo(() => {
    // Hasta que no se escribe ningún premio no hay nada que repartir, y no se riñe a nadie
    const escritos = premios.filter(p => p.importe.trim() !== '');
    if (escritos.length === 0) return null;
    return repartirPremio({
      participantes: personas.map((p, i) => ({ nombre: nombreDe(p, i), aportacion: parseSpanishNumber(p.aportacion) })),
      premios: escritos.map(p => parseSpanishNumber(p.importe)),
      importeJugado: parseSpanishNumber(importeJugado),
    });
  }, [personas, premios, importeJugado]);

  const cambiarPersona = (id: number, campo: 'nombre' | 'aportacion', valor: string) =>
    setPersonas(lista => lista.map(p => (p.id === id ? { ...p, [campo]: valor } : p)));

  const cambiarPremio = (id: number, valor: string) =>
    setPremios(lista => lista.map(p => (p.id === id ? { ...p, importe: valor } : p)));

  /**
   * Qué campo falla, en el mismo orden que las guardas del motor: hasta el 06/10/2026 el aviso
   * decía «Revisa las aportaciones…» sin nombrar a nadie, ningún campo llevaba aria-invalid y en
   * una peña de 30 personas había que revisarlas todas (hallazgo 2898).
   */
  const hayError = resultado !== null && !resultado.ok;
  const personasMal = hayError ? personas.filter(aportacionInvalida).map(p => p.id) : [];
  const premiosMal = hayError && personasMal.length === 0 ? premios.filter(premioInvalido).map(p => p.id) : [];
  let detalleError = '';
  if (personasMal.length > 0) {
    const nombres = personas.flatMap((p, i) => (personasMal.includes(p.id) ? [nombreDe(p, i)] : []));
    detalleError = ` Revisa lo que pone ${enumerar(nombres)}.`;
  } else if (premiosMal.length > 0 && premios.length > 1) {
    const numeros = premios.flatMap((p, i) => (premiosMal.includes(p.id) ? [String(i + 1)] : []));
    detalleError = ` Revisa ${numeros.length > 1 ? 'los premios' : 'el premio'} del décimo o apuesta ${enumerar(numeros)}.`;
  }

  const jugadoNumero = parseSpanishNumber(importeJugado);
  const precioMal = hayError && personasMal.length === 0 && premiosMal.length === 0 && !(jugadoNumero > 0);
  const exencionReducida = jugadoNumero > 0 && jugadoNumero < IMPORTE_MINIMO_EXENCION_COMPLETA;

  return (
    <section className={styles.penaSection} aria-labelledby="pena-titulo">
      <h2 id="pena-titulo"><span aria-hidden="true">🤝</span> Repartir el premio de una peña</h2>
      <p className={styles.penaIntro}>
        Si jugáis en grupo y sale premio: cuánto retiene Hacienda y cuánto le llega a cada persona
        según lo que puso. Los primeros {formatNumber(EXENCION_PREMIO_LOTERIA, 0)}&nbsp;€ de cada décimo o
        apuesta premiados están exentos, y esa exención se reparte entre todos en proporción a su parte.
      </p>

      <fieldset className={styles.penaGrupo}>
        <legend>Quién juega y cuánto pone</legend>
        <ul className={styles.penaLista}>
          {personas.map((p, i) => (
            <li key={p.id} className={styles.penaFila}>
              <label className={styles.penaEtiqueta}>
                Nombre
                <input
                  type="text"
                  value={p.nombre}
                  placeholder={`Persona ${i + 1}`}
                  autoComplete="off"
                  onChange={e => cambiarPersona(p.id, 'nombre', e.target.value)}
                  className={styles.penaCampoNombre}
                />
              </label>
              <label className={styles.penaEtiqueta}>
                Pone (€)
                <input
                  type="text"
                  inputMode="decimal"
                  value={p.aportacion}
                  aria-invalid={personasMal.includes(p.id) || undefined}
                  aria-describedby={personasMal.includes(p.id) ? ID_ERROR : undefined}
                  onChange={e => cambiarPersona(p.id, 'aportacion', e.target.value)}
                  className={styles.penaCampoImporte}
                />
              </label>
              <button
                type="button"
                className={styles.penaQuitar}
                onClick={() => setPersonas(lista => lista.filter(x => x.id !== p.id))}
                disabled={personas.length === 1}
                aria-label={`Quitar a ${nombreDe(p, i)} de la peña`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={styles.penaAnadir}
          onClick={() => setPersonas(lista => [...lista, { id: nuevoId(), nombre: '', aportacion: '' }])}
          disabled={personas.length >= MAX_PERSONAS}
        >
          <span aria-hidden="true">＋</span> Añadir persona
        </button>
      </fieldset>

      <fieldset className={styles.penaGrupo}>
        <legend>Qué ha tocado</legend>
        <label className={styles.penaEtiqueta}>
          Precio de cada décimo o apuesta (€)
          <input
            type="text"
            inputMode="decimal"
            value={importeJugado}
            onChange={e => setImporteJugado(e.target.value)}
            className={styles.penaCampoImporte}
            aria-invalid={precioMal || undefined}
            aria-describedby={precioMal ? `${ID_ERROR} pena-precio-ayuda` : 'pena-precio-ayuda'}
          />
        </label>
        <p id="pena-precio-ayuda" className={styles.penaAyuda}>
          Solo cambia el cálculo si es menor de {MINIMO_TEXTO}: entonces la exención se reduce en
          proporción.
          {exencionReducida &&
            ` Con este precio, cada décimo o apuesta tiene ${formatNumber(exencionPorImporteJugado(jugadoNumero), 2)} € exentos.`}
        </p>
        <ul className={styles.penaLista}>
          {premios.map((p, i) => (
            <li key={p.id} className={styles.penaFila}>
              <label className={styles.penaEtiqueta}>
                {premios.length > 1 ? `Premio del décimo o apuesta ${i + 1} (€)` : 'Premio del décimo o apuesta (€)'}
                <input
                  type="text"
                  inputMode="decimal"
                  value={p.importe}
                  placeholder="Ej.: 125.000"
                  aria-invalid={premiosMal.includes(p.id) || undefined}
                  aria-describedby={premiosMal.includes(p.id) ? ID_ERROR : undefined}
                  onChange={e => cambiarPremio(p.id, e.target.value)}
                  className={styles.penaCampoPremio}
                />
              </label>
              {premios.length > 1 && (
                <button
                  type="button"
                  className={styles.penaQuitar}
                  onClick={() => setPremios(lista => lista.filter(x => x.id !== p.id))}
                  aria-label={`Quitar el premio ${i + 1}`}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={styles.penaAnadir}
          onClick={() => setPremios(lista => [...lista, { id: nuevoId(), importe: '' }])}
          disabled={premios.length >= MAX_PREMIOS}
        >
          <span aria-hidden="true">＋</span> Añadir otro décimo o apuesta premiados
        </button>
        <p className={styles.penaAyuda}>
          Apunta el premio de cada décimo o apuesta por separado, no la suma: la exención se aplica
          a cada uno.
        </p>
      </fieldset>

      <div aria-live="polite">
        {resultado && !resultado.ok && (
          <p className={styles.comprobadorError} id={ID_ERROR}>
            {resultado.error}
            {detalleError}
          </p>
        )}

        {resultado && resultado.ok && (
          <div className={styles.penaResultado}>
            <dl className={styles.penaTotales}>
              <div>
                <dt>Premio íntegro</dt>
                <dd>{formatCurrency(resultado.total.premio)}</dd>
              </div>
              <div>
                <dt>Exento</dt>
                <dd>{formatCurrency(resultado.total.exento)}</dd>
              </div>
              <div>
                <dt>Retención del {TIPO_TEXTO}</dt>
                <dd>{formatCurrency(resultado.total.retencion)}</dd>
              </div>
              <div className={styles.penaTotalDestacado}>
                <dt>Lo que se cobra</dt>
                <dd>{formatCurrency(resultado.total.neto)}</dd>
              </div>
            </dl>

            {resultado.porPremio.length > 1 && (
              <p className={styles.penaAyuda}>
                {resultado.porPremio.map((p, i) => (
                  <span key={i}>
                    {i > 0 && ' · '}
                    Décimo {i + 1}: {formatCurrency(p.premio)}, retención {formatCurrency(p.retencion)}
                  </span>
                ))}
              </p>
            )}

            <div className={styles.penaTablaEnvoltorio}>
              <table className={styles.penaTabla}>
                <caption className={styles.penaTablaTitulo}>Lo que le toca a cada persona</caption>
                <thead>
                  <tr>
                    <th scope="col">Persona</th>
                    <th scope="col">Pone</th>
                    <th scope="col">Le llega</th>
                    <th scope="col">Parte</th>
                    <th scope="col">Premio</th>
                    <th scope="col">Retención</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.partes.map((p, i) => (
                    <tr key={i}>
                      <th scope="row">{p.nombre}</th>
                      <td>{formatCurrency(p.aportacion)}</td>
                      {/* «Le llega» junto a «Pone»: en el móvil la tabla se desliza y es la cifra que se busca */}
                      <td><strong>{formatCurrency(p.neto)}</strong></td>
                      <td>{formatPercentage(p.cuota, 2)}</td>
                      <td>{formatCurrency(p.bruto)}</td>
                      <td>{formatCurrency(p.retencion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ul className={styles.penaNotas}>
        <li>
          Quien paga el premio retiene el {TIPO_TEXTO} de lo que pasa de la exención. Con esa retención
          no hay que presentar autoliquidación del gravamen, y el premio no se suma al resto de tu
          renta del IRPF.
        </li>
        <li>
          Si cobra una sola persona y reparte después, la Agencia Tributaria pide que pueda acreditar
          el reparto, con cada ganador identificado y su porcentaje. Por eso conviene dejar por
          escrito antes del sorteo quién juega y cuánto pone.
        </li>
        <li>
          Este cálculo es para una peña en la que todos los décimos son de todos. Si cada persona
          tiene sus propios décimos, el premio no es compartido: cada décimo tributa entero con su
          dueño.
        </li>
        <li>
          Los nombres e importes no se guardan ni se envían a ningún sitio: se borran al cerrar la
          página.
        </li>
      </ul>
    </section>
  );
}
