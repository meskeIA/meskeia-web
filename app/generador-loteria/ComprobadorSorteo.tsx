'use client';

import { useMemo, useState } from 'react';
import styles from './GeneradorLoteria.module.css';
import {
  comprobarApuesta,
  textoVeredicto,
  validarSorteo,
  REGLAS_SORTEO,
  type CamposSorteo,
  type Comprobacion,
  type Modalidad,
  type Sorteo,
} from './comprobar';

/**
 * Comprobador de las combinaciones guardadas frente al resultado del sorteo (S0176).
 *
 * El usuario teclea la combinación ganadora que publica el sorteo oficial y cada
 * combinación guardada de esa lotería sale con sus aciertos marcados y su categoría.
 * No consulta ningún servicio: el resultado lo pone quien lo comprueba. El cálculo vive
 * en `comprobar.ts`; aquí solo se recoge, se valida y se pinta.
 */

interface CombinacionGuardada {
  id: string;
  type: Modalidad;
  mainNumbers: number[];
  extraNumbers?: number[];
}

interface DatosModalidad {
  name: string;
  icon: string;
  extraName?: string;
}

interface Props {
  guardadas: CombinacionGuardada[];
  modalidades: Record<Modalidad, DatosModalidad>;
  /** Texto para la región aria-live de la página. */
  onAnunciar: (texto: string) => void;
}

const ORDEN: Modalidad[] = ['primitiva', 'euromillones', 'bonoloto', 'gordo', 'lototurf'];

function camposVacios(modalidad: Modalidad): CamposSorteo {
  const r = REGLAS_SORTEO[modalidad];
  return {
    principales: Array<string>(r.principales).fill(''),
    complementario: '',
    reintegro: '',
    extras: Array<string>(r.extras).fill(''),
  };
}

interface Estado {
  modalidad: Modalidad | null;
  campos: CamposSorteo;
  comprobado: Sorteo | null;
  error: string | null;
}

export default function ComprobadorSorteo({ guardadas, modalidades, onAnunciar }: Props) {
  const disponibles = useMemo(
    () => ORDEN.filter(m => guardadas.some(g => g.type === m)),
    [guardadas]
  );

  const [estado, setEstado] = useState<Estado>({
    modalidad: null,
    campos: camposVacios('primitiva'),
    comprobado: null,
    error: null,
  });

  // Si la modalidad elegida se queda sin combinaciones (las han quitado), se pasa a la
  // primera que tenga alguna, con las casillas en blanco.
  const activa: Modalidad | null = estado.modalidad && disponibles.includes(estado.modalidad)
    ? estado.modalidad
    : disponibles[0] ?? null;
  const vigente = activa !== null && estado.modalidad === activa;
  const campos = vigente ? estado.campos : activa ? camposVacios(activa) : estado.campos;
  const comprobado = vigente ? estado.comprobado : null;
  const error = vigente ? estado.error : null;

  const filas = useMemo(() => {
    if (!activa || !comprobado) return [];
    return guardadas
      .filter(g => g.type === activa)
      .map(g => ({
        guardada: g,
        resultado: comprobarApuesta(activa, { principales: g.mainNumbers, extras: g.extraNumbers }, comprobado),
      }));
  }, [activa, comprobado, guardadas]);

  if (!activa) return null;

  const reglas = REGLAS_SORTEO[activa];
  const datos = modalidades[activa];

  const elegirModalidad = (m: Modalidad) => {
    setEstado({ modalidad: m, campos: camposVacios(m), comprobado: null, error: null });
  };

  // Cualquier cambio en las casillas retira el resultado anterior: si no, se leería el
  // veredicto de un sorteo que ya no es el que está escrito.
  const cambiarCampo = (cambio: (c: CamposSorteo) => CamposSorteo) => {
    setEstado({ modalidad: activa, campos: cambio(campos), comprobado: null, error: null });
  };

  const comprobar = () => {
    const r = validarSorteo(activa, campos);
    if (!r.ok) {
      setEstado({ modalidad: activa, campos, comprobado: null, error: r.error });
      return;
    }
    setEstado({ modalidad: activa, campos, comprobado: r.sorteo, error: null });
    const resultados = guardadas
      .filter(g => g.type === activa)
      .map(g => comprobarApuesta(activa, { principales: g.mainNumbers, extras: g.extraNumbers }, r.sorteo));
    onAnunciar(resumen(resultados, datos.name));
  };

  const resultados = filas.map(f => f.resultado);

  return (
    <section className={styles.comprobador} aria-labelledby="titulo-comprobador">
      <h3 id="titulo-comprobador" className={styles.comprobadorTitulo}>
        <span aria-hidden="true">🔍</span> Comprobar con el resultado del sorteo
      </h3>
      <p className={styles.comprobadorIntro}>
        Escribe la combinación ganadora tal como la publica el sorteo oficial y verás qué ha
        acertado cada combinación guardada de esa lotería.
      </p>

      {disponibles.length > 1 && (
        <div className={styles.comprobadorModalidades} role="group" aria-label="Lotería que quieres comprobar">
          {disponibles.map(m => (
            <button
              key={m}
              type="button"
              aria-pressed={activa === m}
              onClick={() => elegirModalidad(m)}
              className={`${styles.comprobadorModalidad} ${activa === m ? styles.active : ''}`}
            >
              <span aria-hidden="true">{modalidades[m].icon}</span> {modalidades[m].name}
            </button>
          ))}
        </div>
      )}

      <fieldset className={styles.comprobadorCampos}>
        <legend>Combinación ganadora de {datos.name}</legend>
        <div className={styles.comprobadorFila}>
          {campos.principales.map((valor, i) => (
            <input
              key={`p-${activa}-${i}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
              value={valor}
              onChange={e => {
                const texto = e.target.value;
                cambiarCampo(c => ({ ...c, principales: c.principales.map((v, j) => (j === i ? texto : v)) }));
              }}
              aria-label={`Número ${i + 1} de la combinación ganadora`}
              className={styles.comprobadorCasilla}
            />
          ))}
        </div>

        {(reglas.conComplementario || reglas.conReintegro || reglas.extras > 0) && (
          <div className={styles.comprobadorFila}>
            {reglas.conComplementario && (
              <label className={styles.comprobadorEtiqueta}>
                Complementario
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={2}
                  value={campos.complementario}
                  onChange={e => {
                    const texto = e.target.value;
                    cambiarCampo(c => ({ ...c, complementario: texto }));
                  }}
                  className={styles.comprobadorCasilla}
                />
              </label>
            )}
            {reglas.conReintegro && (
              <label className={styles.comprobadorEtiqueta}>
                Reintegro
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={1}
                  value={campos.reintegro}
                  onChange={e => {
                    const texto = e.target.value;
                    cambiarCampo(c => ({ ...c, reintegro: texto }));
                  }}
                  className={styles.comprobadorCasilla}
                />
              </label>
            )}
            {campos.extras.map((valor, i) => (
              <label key={`e-${activa}-${i}`} className={styles.comprobadorEtiqueta}>
                {reglas.extras > 1 ? `${reglas.nombreExtra.replace(/s$/, '')} ${i + 1}` : reglas.nombreExtra}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={2}
                  value={valor}
                  onChange={e => {
                    const texto = e.target.value;
                    cambiarCampo(c => ({ ...c, extras: c.extras.map((v, j) => (j === i ? texto : v)) }));
                  }}
                  className={styles.comprobadorCasilla}
                />
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <button type="button" onClick={comprobar} className={styles.comprobadorBoton}>
        Comprobar mis combinaciones de {datos.name}
      </button>

      {error && (
        <p className={styles.comprobadorError} role="alert">{error}</p>
      )}

      {comprobado && (
        <div className={styles.comprobadorResultado}>
          <p className={styles.comprobadorResumen}>{resumen(resultados, datos.name)}</p>
          <ul className={styles.comprobadorLista}>
            {filas.map(({ guardada, resultado }) => (
              <FilaComprobada
                key={guardada.id}
                guardada={guardada}
                resultado={resultado}
                modalidad={activa}
                sorteo={comprobado}
                nombreExtra={datos.extraName}
              />
            ))}
          </ul>
        </div>
      )}

      <div className={styles.comprobadorNotas}>
        <p>
          Es una comprobación orientativa: lo que vale es el escrutinio oficial y tu
          resguardo. No da importes, porque el premio de cada categoría depende de lo
          recaudado y de cuántos acertantes haya. Antes de tirar un boleto, compruébalo en
          un punto de venta o en la web de Loterías y Apuestas del Estado.
        </p>
        {reglas.conReintegro && (
          <p>
            El reintegro que cuenta es el impreso en tu resguardo: si no es el de la
            combinación guardada, compara el del boleto.
          </p>
        )}
        {activa === 'lototurf' && (
          <p>
            El reintegro de Lototurf va impreso en tu resguardo y el generador no lo crea,
            así que aquí no se comprueba.
          </p>
        )}
      </div>
    </section>
  );
}

/** «Ninguna de tus 4 combinaciones de La Primitiva tiene premio de categoría; 1 acierta el reintegro.» */
function resumen(resultados: Comprobacion[], nombre: string): string {
  const total = resultados.length;
  const conPremio = resultados.filter(r => r.categoria !== null).length;
  const conReintegro = resultados.filter(r => r.reintegro === true).length;

  let texto = total === 1
    ? `Tu combinación de ${nombre} ${conPremio === 1 ? 'tiene' : 'no tiene'} premio de categoría`
    : `${conPremio === 0 ? 'Ninguna' : conPremio} de tus ${total} combinaciones de ${nombre} ${conPremio === 1 || conPremio === 0 ? 'tiene' : 'tienen'} premio de categoría`;
  if (conReintegro > 0) {
    texto += total === 1
      ? (conPremio === 1 ? ', y acierta el reintegro' : ', pero acierta el reintegro')
      : `; ${conReintegro} ${conReintegro === 1 ? 'acierta' : 'aciertan'} el reintegro`;
  }
  return `${texto}.`;
}

interface FilaProps {
  guardada: CombinacionGuardada;
  resultado: Comprobacion;
  modalidad: Modalidad;
  sorteo: Sorteo;
  nombreExtra?: string;
}

function FilaComprobada({ guardada, resultado, modalidad, sorteo, nombreExtra }: FilaProps) {
  const conPremio = resultado.categoria !== null || resultado.reintegro === true;
  // El complementario solo se marca donde decide algo: con 5 aciertos.
  const marcarComplementario = resultado.conComplementario && resultado.acertados.length === 5;
  const extraEsReintegro = modalidad === 'primitiva' || modalidad === 'bonoloto';

  return (
    <li className={`${styles.comprobada} ${conPremio ? styles.comprobadaPremio : ''}`}>
      <div className={styles.comprobadaBolas}>
        {guardada.mainNumbers.map(n => {
          const acertado = resultado.acertados.includes(n);
          const esComplementario = marcarComplementario && n === sorteo.complementario;
          return (
            <span
              key={`m-${n}`}
              className={`${styles.bolaComprobada} ${acertado ? styles.bolaAcertada : ''} ${esComplementario ? styles.bolaComplementario : ''}`}
            >
              {n}
              {acertado && <span className="sr-only"> acertado</span>}
              {esComplementario && <span className="sr-only"> complementario</span>}
            </span>
          );
        })}
        {guardada.extraNumbers && guardada.extraNumbers.length > 0 && (
          <span className={styles.comprobadaExtras}>
            <span className={styles.comprobadaExtraNombre}>{nombreExtra}:</span>
            {guardada.extraNumbers.map(n => {
              const acertado = extraEsReintegro
                ? resultado.reintegro === true
                : resultado.extrasAcertados.includes(n);
              return (
                <span key={`e-${n}`} className={`${styles.bolaComprobada} ${acertado ? styles.bolaAcertada : ''}`}>
                  {n}
                  {acertado && <span className="sr-only"> acertado</span>}
                </span>
              );
            })}
          </span>
        )}
      </div>
      <p className={styles.comprobadaVeredicto}>{textoVeredicto(modalidad, resultado)}</p>
    </li>
  );
}
