'use client';

import { useMemo, useState } from 'react';
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
import styles from './CalculadoraEscalas.module.css';
import {
  ESCALAS_CONOCIDAS,
  NOMBRE_UNIDAD,
  UNIDADES,
  construirEscalaGrafica,
  convertirLista,
  convertirSuperficie,
  deducirEscala,
  factorDe,
  factorEntreEscalas,
  formatearNumero,
  medidaEnPlano,
  medidaReal,
  parsearEscala,
  textoDeEscala,
  tipoDeEscala,
  type Escala,
  type Unidad,
} from './motor';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  type Comprobacion,
  type EjercicioEscala,
} from './casos';
import { parseSpanishNumber } from '@/lib';

type Pestana = 'convertir' | 'deducir' | 'cambiar' | 'superficie' | 'lista' | 'grafica';

const PESTANAS: readonly { id: Pestana; etiqueta: string }[] = [
  { id: 'convertir', etiqueta: 'Convertir medidas' },
  { id: 'deducir', etiqueta: 'Deducir la escala' },
  { id: 'cambiar', etiqueta: 'Cambiar de escala' },
  { id: 'superficie', etiqueta: 'Superficies' },
  { id: 'lista', etiqueta: 'Lista de medidas' },
  { id: 'grafica', etiqueta: 'Escala gráfica' },
];

export default function CalculadoraEscalasPage() {
  const [pestana, setPestana] = useState<Pestana>('convertir');

  // ---- Escala activa, compartida por casi todas las pestañas
  const [textoEscala, setTextoEscala] = useState<string>('1:50');
  const lecturaEscala = useMemo(() => parsearEscala(textoEscala), [textoEscala]);
  const escala: Escala = lecturaEscala.escala ?? { numerador: 1, denominador: 50 };

  // ---- Convertir medidas
  const [sentido, setSentido] = useState<'plano-a-real' | 'real-a-plano'>('plano-a-real');
  const [medida, setMedida] = useState<string>('7,2');
  const [unidadEntrada, setUnidadEntrada] = useState<Unidad>('cm');
  const [unidadSalida, setUnidadSalida] = useState<Unidad>('m');

  const conversion = useMemo(() => {
    const valor = parseSpanishNumber(medida);
    if (!Number.isFinite(valor)) {
      return { ok: false, valor: NaN, milimetros: NaN, error: 'Escribe una medida, por ejemplo 7,2' };
    }
    return sentido === 'plano-a-real'
      ? medidaReal(valor, unidadEntrada, escala, unidadSalida)
      : medidaEnPlano(valor, unidadEntrada, escala, unidadSalida);
  }, [medida, sentido, unidadEntrada, unidadSalida, escala]);

  // ---- Deducir la escala
  const [medidaDibujo, setMedidaDibujo] = useState<string>('3');
  const [unidadDibujo, setUnidadDibujo] = useState<Unidad>('cm');
  const [medidaRealTexto, setMedidaRealTexto] = useState<string>('6');
  const [unidadRealDeducir, setUnidadRealDeducir] = useState<Unidad>('m');

  const escalaDeducida = useMemo(
    () =>
      deducirEscala(
        parseSpanishNumber(medidaDibujo),
        unidadDibujo,
        parseSpanishNumber(medidaRealTexto),
        unidadRealDeducir,
      ),
    [medidaDibujo, unidadDibujo, medidaRealTexto, unidadRealDeducir],
  );

  // ---- Cambiar de escala
  const [textoEscalaDestino, setTextoEscalaDestino] = useState<string>('1:100');
  const lecturaDestino = useMemo(() => parsearEscala(textoEscalaDestino), [textoEscalaDestino]);
  const factorCambio = useMemo(
    () =>
      lecturaEscala.escala !== null && lecturaDestino.escala !== null
        ? factorEntreEscalas(lecturaEscala.escala, lecturaDestino.escala)
        : NaN,
    [lecturaEscala, lecturaDestino],
  );

  // ---- Superficies
  const [superficie, setSuperficie] = useState<string>('24');
  const [unidadSuperficieEntrada, setUnidadSuperficieEntrada] = useState<Unidad>('cm');
  const [unidadSuperficieSalida, setUnidadSuperficieSalida] = useState<Unidad>('m');
  const [sentidoSuperficie, setSentidoSuperficie] = useState<'plano-a-real' | 'real-a-plano'>(
    'plano-a-real',
  );

  const conversionSuperficie = useMemo(() => {
    const valor = parseSpanishNumber(superficie);
    if (!Number.isFinite(valor)) {
      return { ok: false, valor: NaN, milimetros: NaN, error: 'Escribe una superficie' };
    }
    return convertirSuperficie(
      valor,
      unidadSuperficieEntrada,
      escala,
      unidadSuperficieSalida,
      sentidoSuperficie,
    );
  }, [superficie, unidadSuperficieEntrada, unidadSuperficieSalida, sentidoSuperficie, escala]);

  // ---- Lista de medidas
  const [listaTexto, setListaTexto] = useState<string>('7,2\n3\n12,5');
  const [sentidoLista, setSentidoLista] = useState<'plano-a-real' | 'real-a-plano'>('plano-a-real');
  const [unidadListaEntrada, setUnidadListaEntrada] = useState<Unidad>('cm');
  const [unidadListaSalida, setUnidadListaSalida] = useState<Unidad>('m');

  const filasLista = useMemo(
    () => convertirLista(listaTexto, unidadListaEntrada, escala, unidadListaSalida, sentidoLista),
    [listaTexto, unidadListaEntrada, unidadListaSalida, sentidoLista, escala],
  );

  // ---- Escala gráfica
  const [unidadGrafica, setUnidadGrafica] = useState<Unidad>('m');
  const [anchoBarra, setAnchoBarra] = useState<number>(100);
  const grafica = useMemo(
    () => construirEscalaGrafica(escala, unidadGrafica, anchoBarra),
    [escala, unidadGrafica, anchoBarra],
  );

  // ---- Casos para clase
  const [respuestasCasos, setRespuestasCasos] = useState<Record<number, string>>({});
  const [veredictos, setVeredictos] = useState<Record<number, Comprobacion>>({});
  const [solucionesAbiertas, setSolucionesAbiertas] = useState<Record<number, boolean>>({});
  const [ejercicio, setEjercicio] = useState<EjercicioEscala | null>(null);
  const [respuestaEjercicio, setRespuestaEjercicio] = useState<string>('');
  const [veredictoEjercicio, setVeredictoEjercicio] = useState<Comprobacion | null>(null);

  const casosResueltos = useMemo(
    () => Object.values(veredictos).filter((v) => v.correcto).length,
    [veredictos],
  );

  const comprobarCaso = (id: number, esperado: number) => {
    setVeredictos((previos) => ({
      ...previos,
      [id]: comprobarRespuesta(respuestasCasos[id] ?? '', esperado),
    }));
  };

  const alternarSolucion = (id: number) => {
    setSolucionesAbiertas((previas) => ({ ...previas, [id]: previas[id] !== true }));
  };

  const reiniciarCasos = () => {
    setRespuestasCasos({});
    setVeredictos({});
    setSolucionesAbiertas({});
  };

  const nuevoEjercicio = () => {
    setEjercicio(generarEjercicioAleatorio());
    setRespuestaEjercicio('');
    setVeredictoEjercicio(null);
  };

  /** Lleva una escala de la lista a la casilla y deja al usuario en la pestaña de convertir. */
  const usarEscalaConocida = (etiquetaEscala: Escala) => {
    setTextoEscala(textoDeEscala(etiquetaEscala));
  };

  const tipo = lecturaEscala.ok ? tipoDeEscala(escala) : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Calculadora de Escalas</h1>
        <p>
          Del plano a la realidad y al revés, en 1:50, 1:100, 1:87 o la escala que necesites
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ---------------------------------------------- La escala activa */}
        <section className={styles.panel} aria-labelledby="escala-activa">
          <h2 id="escala-activa" className={styles.panelTitulo}>
            <span aria-hidden="true">📐</span> 1. Elige la escala
          </h2>

          <div className={styles.escalaFila}>
            <label className={styles.etiqueta} htmlFor="escala">
              Escala del dibujo
            </label>
            <input
              id="escala"
              className={styles.campoEscala}
              type="text"
              inputMode="text"
              autoComplete="off"
              value={textoEscala}
              placeholder="1:50"
              onChange={(e) => setTextoEscala(e.target.value)}
              aria-describedby="ayuda-escala"
            />
            <p id="ayuda-escala" className={styles.ayuda}>
              Se puede escribir <code>1:50</code>, <code>1/50</code> o solo <code>50</code>.
            </p>
          </div>

          {lecturaEscala.ok ? (
            <p className={styles.escalaResumen}>
              <strong>{textoDeEscala(escala)}</strong> ·{' '}
              {tipo === 'reduccion'
                ? `el dibujo es ${formatearNumero(1 / factorDe(escala))} veces más pequeño que la realidad`
                : tipo === 'ampliacion'
                  ? `el dibujo es ${formatearNumero(factorDe(escala))} veces más grande que la realidad`
                  : 'tamaño natural: el dibujo mide lo mismo que la realidad'}
            </p>
          ) : (
            <p className={styles.error} role="alert" aria-live="polite">
              <span aria-hidden="true">⚠️</span> {lecturaEscala.error}
            </p>
          )}

          <details className={styles.listaEscalas}>
            <summary className={styles.listaResumen}>Escalas más usadas</summary>
            <div className={styles.escalasGrid}>
              {ESCALAS_CONOCIDAS.map((conocida) => (
                <button
                  key={conocida.etiqueta}
                  type="button"
                  className={styles.escalaChip}
                  aria-pressed={textoDeEscala(escala) === textoDeEscala(conocida.escala)}
                  onClick={() => usarEscalaConocida(conocida.escala)}
                >
                  <span className={styles.escalaChipNombre}>{conocida.etiqueta}</span>
                  <span className={styles.escalaChipUso}>{conocida.uso}</span>
                </button>
              ))}
            </div>
          </details>
        </section>

        {/* ---------------------------------------------- Pestañas */}
        <section className={styles.panel} aria-labelledby="herramientas">
          <h2 id="herramientas" className={styles.panelTitulo}>
            <span aria-hidden="true">🧮</span> 2. Qué quieres calcular
          </h2>

          <div className={styles.pestanas} role="tablist" aria-label="Herramientas de escala">
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                id={`pestana-${p.id}`}
                aria-selected={pestana === p.id}
                aria-controls={`panel-${p.id}`}
                className={`${styles.pestana} ${pestana === p.id ? styles.pestanaActiva : ''}`}
                onClick={() => setPestana(p.id)}
              >
                {p.etiqueta}
              </button>
            ))}
          </div>

          {/* ---- Convertir medidas */}
          <div
            id="panel-convertir"
            role="tabpanel"
            aria-labelledby="pestana-convertir"
            hidden={pestana !== 'convertir'}
          >
            <div className={styles.controles}>
              <div className={styles.grupoBotones} role="group" aria-label="Sentido de la conversión">
                <button
                  type="button"
                  className={`${styles.botonSentido} ${sentido === 'plano-a-real' ? styles.botonSentidoActivo : ''}`}
                  aria-pressed={sentido === 'plano-a-real'}
                  onClick={() => {
                    setSentido('plano-a-real');
                    setUnidadEntrada('cm');
                    setUnidadSalida('m');
                  }}
                >
                  Del plano a la realidad
                </button>
                <button
                  type="button"
                  className={`${styles.botonSentido} ${sentido === 'real-a-plano' ? styles.botonSentidoActivo : ''}`}
                  aria-pressed={sentido === 'real-a-plano'}
                  onClick={() => {
                    setSentido('real-a-plano');
                    setUnidadEntrada('m');
                    setUnidadSalida('cm');
                  }}
                >
                  De la realidad al plano
                </button>
              </div>

              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="medida">
                  {sentido === 'plano-a-real' ? 'Medida en el plano' : 'Medida real'}
                </label>
                <div className={styles.filaCampo}>
                  <input
                    id="medida"
                    className={styles.campo}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={medida}
                    placeholder="7,2"
                    onChange={(e) => setMedida(e.target.value)}
                  />
                  <label className={styles.etiquetaOculta} htmlFor="unidad-entrada">
                    Unidad de entrada
                  </label>
                  <select
                    id="unidad-entrada"
                    className={styles.selector}
                    value={unidadEntrada}
                    onChange={(e) => setUnidadEntrada(e.target.value as Unidad)}
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="unidad-salida">
                  Quiero el resultado en
                </label>
                <select
                  id="unidad-salida"
                  className={styles.selector}
                  value={unidadSalida}
                  onChange={(e) => setUnidadSalida(e.target.value as Unidad)}
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {NOMBRE_UNIDAD[u]} ({u})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {conversion.ok ? (
              <div className={styles.resultado} aria-live="polite">
                <p className={styles.resultadoEtiqueta}>
                  {sentido === 'plano-a-real' ? 'Medida real' : 'Medida en el plano'}
                </p>
                <p className={styles.resultadoValor}>
                  {formatearNumero(conversion.valor, 4)} <span>{unidadSalida}</span>
                </p>
                <p className={styles.resultadoDetalle}>
                  {sentido === 'plano-a-real'
                    ? `${medida} ${unidadEntrada} de plano × ${formatearNumero(1 / factorDe(escala))} = ${formatearNumero(conversion.valor, 4)} ${unidadSalida}`
                    : `${medida} ${unidadEntrada} reales ÷ ${formatearNumero(1 / factorDe(escala))} = ${formatearNumero(conversion.valor, 4)} ${unidadSalida}`}
                </p>
              </div>
            ) : (
              <p className={styles.error} role="alert" aria-live="polite">
                <span aria-hidden="true">⚠️</span> {conversion.error}
              </p>
            )}
          </div>

          {/* ---- Deducir la escala */}
          <div
            id="panel-deducir"
            role="tabpanel"
            aria-labelledby="pestana-deducir"
            hidden={pestana !== 'deducir'}
          >
            <p className={styles.introPanel}>
              Si el plano no dice a qué escala está, mide sobre él algo cuya medida real
              conozcas —una puerta, un coche, la anchura de una calle— y escribe las dos aquí.
            </p>

            <div className={styles.controles}>
              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="medida-dibujo">
                  Lo que mide en el dibujo
                </label>
                <div className={styles.filaCampo}>
                  <input
                    id="medida-dibujo"
                    className={styles.campo}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={medidaDibujo}
                    onChange={(e) => setMedidaDibujo(e.target.value)}
                  />
                  <label className={styles.etiquetaOculta} htmlFor="unidad-dibujo">
                    Unidad del dibujo
                  </label>
                  <select
                    id="unidad-dibujo"
                    className={styles.selector}
                    value={unidadDibujo}
                    onChange={(e) => setUnidadDibujo(e.target.value as Unidad)}
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="medida-real-deducir">
                  Lo que mide en la realidad
                </label>
                <div className={styles.filaCampo}>
                  <input
                    id="medida-real-deducir"
                    className={styles.campo}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={medidaRealTexto}
                    onChange={(e) => setMedidaRealTexto(e.target.value)}
                  />
                  <label className={styles.etiquetaOculta} htmlFor="unidad-real-deducir">
                    Unidad de la medida real
                  </label>
                  <select
                    id="unidad-real-deducir"
                    className={styles.selector}
                    value={unidadRealDeducir}
                    onChange={(e) => setUnidadRealDeducir(e.target.value as Unidad)}
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {escalaDeducida.ok && escalaDeducida.escala !== null ? (
              <div className={styles.resultado} aria-live="polite">
                <p className={styles.resultadoEtiqueta}>La escala es</p>
                <p className={styles.resultadoValor}>{textoDeEscala(escalaDeducida.escala)}</p>
                <button
                  type="button"
                  className={styles.botonSecundario}
                  onClick={() => setTextoEscala(textoDeEscala(escalaDeducida.escala as Escala))}
                >
                  <span aria-hidden="true">⬆️</span> Usar esta escala arriba
                </button>
              </div>
            ) : (
              <p className={styles.error} role="alert" aria-live="polite">
                <span aria-hidden="true">⚠️</span> {escalaDeducida.error}
              </p>
            )}
          </div>

          {/* ---- Cambiar de escala */}
          <div
            id="panel-cambiar"
            role="tabpanel"
            aria-labelledby="pestana-cambiar"
            hidden={pestana !== 'cambiar'}
          >
            <p className={styles.introPanel}>
              Para redibujar un plano a otra escala no hace falta ninguna medida real: basta con
              el factor que relaciona las dos escalas.
            </p>

            <div className={styles.controles}>
              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="escala-destino">
                  Escala de destino
                </label>
                <input
                  id="escala-destino"
                  className={styles.campo}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={textoEscalaDestino}
                  placeholder="1:100"
                  onChange={(e) => setTextoEscalaDestino(e.target.value)}
                />
              </div>
            </div>

            {lecturaDestino.ok && Number.isFinite(factorCambio) ? (
              <div className={styles.resultado} aria-live="polite">
                <p className={styles.resultadoEtiqueta}>
                  De {textoDeEscala(escala)} a {textoDeEscala(lecturaDestino.escala as Escala)}
                </p>
                <p className={styles.resultadoValor}>
                  × {formatearNumero(factorCambio, 4)}
                </p>
                <p className={styles.resultadoDetalle}>
                  {factorCambio > 1
                    ? `El dibujo nuevo es más grande: todas las medidas se multiplican por ${formatearNumero(factorCambio, 4)}.`
                    : factorCambio < 1
                      ? `El dibujo nuevo es más pequeño: todas las medidas se multiplican por ${formatearNumero(factorCambio, 4)}, es decir, se dividen entre ${formatearNumero(1 / factorCambio, 4)}.`
                      : 'Las dos escalas son la misma: el dibujo no cambia de tamaño.'}
                </p>
              </div>
            ) : (
              <p className={styles.error} role="alert" aria-live="polite">
                <span aria-hidden="true">⚠️</span> {lecturaDestino.error ?? 'Escala no válida'}
              </p>
            )}
          </div>

          {/* ---- Superficies */}
          <div
            id="panel-superficie"
            role="tabpanel"
            aria-labelledby="pestana-superficie"
            hidden={pestana !== 'superficie'}
          >
            <p className={styles.introPanel}>
              <span aria-hidden="true">⚠️</span> Una superficie <strong>no</strong> se convierte
              con el mismo número que una longitud: escala con el <strong>cuadrado</strong> del
              factor. En 1:50 las longitudes se dividen entre 50 y las áreas entre 2.500.
            </p>

            <div className={styles.controles}>
              <div className={styles.grupoBotones} role="group" aria-label="Sentido de la conversión de superficie">
                <button
                  type="button"
                  className={`${styles.botonSentido} ${sentidoSuperficie === 'plano-a-real' ? styles.botonSentidoActivo : ''}`}
                  aria-pressed={sentidoSuperficie === 'plano-a-real'}
                  onClick={() => {
                    setSentidoSuperficie('plano-a-real');
                    setUnidadSuperficieEntrada('cm');
                    setUnidadSuperficieSalida('m');
                  }}
                >
                  Del plano a la realidad
                </button>
                <button
                  type="button"
                  className={`${styles.botonSentido} ${sentidoSuperficie === 'real-a-plano' ? styles.botonSentidoActivo : ''}`}
                  aria-pressed={sentidoSuperficie === 'real-a-plano'}
                  onClick={() => {
                    setSentidoSuperficie('real-a-plano');
                    setUnidadSuperficieEntrada('m');
                    setUnidadSuperficieSalida('cm');
                  }}
                >
                  De la realidad al plano
                </button>
              </div>

              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="superficie">
                  Superficie
                </label>
                <div className={styles.filaCampo}>
                  <input
                    id="superficie"
                    className={styles.campo}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={superficie}
                    onChange={(e) => setSuperficie(e.target.value)}
                  />
                  <label className={styles.etiquetaOculta} htmlFor="unidad-superficie-entrada">
                    Unidad de la superficie
                  </label>
                  <select
                    id="unidad-superficie-entrada"
                    className={styles.selector}
                    value={unidadSuperficieEntrada}
                    onChange={(e) => setUnidadSuperficieEntrada(e.target.value as Unidad)}
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}²
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="unidad-superficie-salida">
                  Quiero el resultado en
                </label>
                <select
                  id="unidad-superficie-salida"
                  className={styles.selector}
                  value={unidadSuperficieSalida}
                  onChange={(e) => setUnidadSuperficieSalida(e.target.value as Unidad)}
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {u}²
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {conversionSuperficie.ok ? (
              <div className={styles.resultado} aria-live="polite">
                <p className={styles.resultadoEtiqueta}>
                  {sentidoSuperficie === 'plano-a-real' ? 'Superficie real' : 'Superficie en el plano'}
                </p>
                <p className={styles.resultadoValor}>
                  {formatearNumero(conversionSuperficie.valor, 4)}{' '}
                  <span>{unidadSuperficieSalida}²</span>
                </p>
                <p className={styles.resultadoDetalle}>
                  Factor aplicado: {formatearNumero(1 / factorDe(escala))}² ={' '}
                  {formatearNumero(Math.pow(1 / factorDe(escala), 2))}
                </p>
              </div>
            ) : (
              <p className={styles.error} role="alert" aria-live="polite">
                <span aria-hidden="true">⚠️</span> {conversionSuperficie.error}
              </p>
            )}
          </div>

          {/* ---- Lista de medidas */}
          <div
            id="panel-lista"
            role="tabpanel"
            aria-labelledby="pestana-lista"
            hidden={pestana !== 'lista'}
          >
            <p className={styles.introPanel}>
              Pega una medida por línea y se convierten todas de golpe. Separa con saltos de
              línea o con punto y coma: <strong>la coma es el separador decimal</strong>, no de
              lista.
            </p>

            <div className={styles.controles}>
              <div className={styles.grupoBotones} role="group" aria-label="Sentido de la conversión de la lista">
                <button
                  type="button"
                  className={`${styles.botonSentido} ${sentidoLista === 'plano-a-real' ? styles.botonSentidoActivo : ''}`}
                  aria-pressed={sentidoLista === 'plano-a-real'}
                  onClick={() => {
                    setSentidoLista('plano-a-real');
                    setUnidadListaEntrada('cm');
                    setUnidadListaSalida('m');
                  }}
                >
                  Del plano a la realidad
                </button>
                <button
                  type="button"
                  className={`${styles.botonSentido} ${sentidoLista === 'real-a-plano' ? styles.botonSentidoActivo : ''}`}
                  aria-pressed={sentidoLista === 'real-a-plano'}
                  onClick={() => {
                    setSentidoLista('real-a-plano');
                    setUnidadListaEntrada('m');
                    setUnidadListaSalida('cm');
                  }}
                >
                  De la realidad al plano
                </button>
              </div>

              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="lista-medidas">
                  Medidas, una por línea
                </label>
                <textarea
                  id="lista-medidas"
                  className={styles.areaTexto}
                  rows={6}
                  value={listaTexto}
                  onChange={(e) => setListaTexto(e.target.value)}
                />
              </div>

              <div className={styles.filaCampo}>
                <div className={styles.campoConUnidad}>
                  <label className={styles.etiqueta} htmlFor="unidad-lista-entrada">
                    Están en
                  </label>
                  <select
                    id="unidad-lista-entrada"
                    className={styles.selector}
                    value={unidadListaEntrada}
                    onChange={(e) => setUnidadListaEntrada(e.target.value as Unidad)}
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.campoConUnidad}>
                  <label className={styles.etiqueta} htmlFor="unidad-lista-salida">
                    Las quiero en
                  </label>
                  <select
                    id="unidad-lista-salida"
                    className={styles.selector}
                    value={unidadListaSalida}
                    onChange={(e) => setUnidadListaSalida(e.target.value as Unidad)}
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filasLista.length > 0 && (
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <caption className={styles.tablaCaption}>
                    {filasLista.length} medida{filasLista.length === 1 ? '' : 's'} convertida
                    {filasLista.length === 1 ? '' : 's'} a escala {textoDeEscala(escala)}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Entrada ({unidadListaEntrada})</th>
                      <th scope="col">Resultado ({unidadListaSalida})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filasLista.map((fila, indice) => (
                      <tr key={indice} className={fila.ok ? '' : styles.filaError}>
                        <td>{fila.original}</td>
                        <td>
                          {fila.ok ? (
                            formatearNumero(fila.salida, 4)
                          ) : (
                            <span className={styles.textoError}>{fila.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ---- Escala gráfica */}
          <div
            id="panel-grafica"
            role="tabpanel"
            aria-labelledby="pestana-grafica"
            hidden={pestana !== 'grafica'}
          >
            <p className={styles.introPanel}>
              Una escala gráfica es una regla dibujada junto al plano: se apoya la medida tomada
              del dibujo sobre la barra y se lee la distancia real, sin calcular nada. Sigue
              siendo válida aunque el plano se amplíe o se reduzca al fotocopiarlo, porque la
              barra cambia de tamaño con él.
            </p>

            <div className={styles.controles}>
              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="unidad-grafica">
                  Unidad de la regla
                </label>
                <select
                  id="unidad-grafica"
                  className={styles.selector}
                  value={unidadGrafica}
                  onChange={(e) => setUnidadGrafica(e.target.value as Unidad)}
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {NOMBRE_UNIDAD[u]} ({u})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.campoConUnidad}>
                <label className={styles.etiqueta} htmlFor="ancho-barra">
                  Ancho de la barra sobre el papel: {anchoBarra} mm
                </label>
                <input
                  id="ancho-barra"
                  className={styles.deslizador}
                  type="range"
                  min={40}
                  max={180}
                  step={10}
                  value={anchoBarra}
                  onChange={(e) => setAnchoBarra(Number(e.target.value))}
                />
              </div>
            </div>

            {grafica.ok ? (
              <>
                <p className={styles.avisoImpresion}>
                  <span aria-hidden="true">🖨️</span> <strong>Imprime al 100 %</strong>, sin
                  «ajustar a la página». Si el navegador la reescala, las distancias dejan de ser
                  ciertas y la regla miente. Comprueba con una regla de verdad que la barra mide{' '}
                  {formatearNumero(grafica.longitudPapelMm, 1)} mm.
                </p>

                <div className={styles.graficaContenedor}>
                  <svg
                    className={styles.grafica}
                    width={`${grafica.longitudPapelMm}mm`}
                    height="18mm"
                    viewBox={`0 0 ${grafica.longitudPapelMm} 18`}
                    role="img"
                    aria-label={`Escala gráfica para ${textoDeEscala(escala)}: la barra completa representa ${formatearNumero(grafica.totalReal)} ${unidadGrafica} y mide ${formatearNumero(grafica.longitudPapelMm, 1)} milímetros sobre el papel`}
                  >
                    {/* Barra alterna en blanco y negro, como las escalas gráficas de siempre */}
                    {grafica.divisiones.slice(0, -1).map((division, indice) => {
                      const siguiente = grafica.divisiones[indice + 1];
                      return (
                        <rect
                          key={division.valorReal}
                          x={division.milimetrosEnPapel}
                          y={4}
                          width={siguiente.milimetrosEnPapel - division.milimetrosEnPapel}
                          height={3}
                          className={indice % 2 === 0 ? styles.bloqueLleno : styles.bloqueVacio}
                        />
                      );
                    })}
                    {grafica.divisiones.map((division) => (
                      <g key={`marca-${division.valorReal}`}>
                        <line
                          x1={division.milimetrosEnPapel}
                          y1={3}
                          x2={division.milimetrosEnPapel}
                          y2={8}
                          className={styles.marca}
                        />
                        <text
                          x={division.milimetrosEnPapel}
                          y={13}
                          textAnchor="middle"
                          className={styles.rotulo}
                        >
                          {formatearNumero(division.valorReal)}
                        </text>
                      </g>
                    ))}
                    <text x={grafica.longitudPapelMm / 2} y={17.5} textAnchor="middle" className={styles.rotuloUnidad}>
                      {NOMBRE_UNIDAD[grafica.unidad]} · escala {textoDeEscala(escala)}
                    </text>
                  </svg>
                </div>

                <p className={styles.resultadoDetalle}>
                  La barra entera representa{' '}
                  <strong>
                    {formatearNumero(grafica.totalReal)} {grafica.unidad}
                  </strong>{' '}
                  y mide {formatearNumero(grafica.longitudPapelMm, 1)} mm sobre el papel.
                </p>
              </>
            ) : (
              <p className={styles.error} role="alert" aria-live="polite">
                <span aria-hidden="true">⚠️</span>{' '}
                {grafica.error ?? 'Con esa escala y esa unidad no sale una regla legible. Prueba a cambiar la unidad.'}
              </p>
            )}
          </div>
        </section>

        <DisclaimerCard variant="technical" severity="low" collapsible />

        {/* ---------------------------------------------- Casos para clase */}
        <section className={styles.aulaSection} aria-labelledby="casos-para-clase">
          <h2 id="casos-para-clase" className={styles.aulaTitulo}>
            <span aria-hidden="true">📝</span> Casos para clase
          </h2>
          <p className={styles.aulaIntro}>
            Son <strong>12 casos fijos</strong>: el caso 3 es el mismo para todo el mundo, hoy y
            dentro de un año, con los mismos números y la misma solución. Por eso se pueden
            asignar por número —«resuelve el 3, el 7 y el 11»— y corregir igual para todo el
            grupo.
          </p>
          <p className={styles.aulaConvenio}>
            <span aria-hidden="true">⚖️</span> <strong>Un aviso de convenio</strong>, porque
            cambia el resultado: los casos 7 y 12 piden <strong>superficies</strong>, y una
            superficie escala con el <strong>cuadrado</strong> del factor. En 1:50 las longitudes
            se dividen entre 50 y las áreas entre 2.500. Es el error más repetido del tema, y el
            número equivocado también parece plausible.
          </p>

          <div className={styles.aulaContador}>
            <p className={styles.aulaContadorTexto} aria-live="polite">
              Has resuelto <strong>{casosResueltos}</strong> de {TOTAL_CASOS}
            </p>
            <div
              className={styles.aulaBarra}
              role="progressbar"
              aria-valuenow={casosResueltos}
              aria-valuemin={0}
              aria-valuemax={TOTAL_CASOS}
              aria-label="Casos resueltos"
            >
              <div
                className={styles.aulaBarraRelleno}
                style={{ width: `${(casosResueltos / TOTAL_CASOS) * 100}%` }}
              />
            </div>
            <button type="button" className={styles.aulaBtnSecundario} onClick={reiniciarCasos}>
              Empezar de nuevo
            </button>
          </div>

          <div className={styles.aulaGrid}>
            {CASOS.map((caso) => {
              const veredicto = veredictos[caso.id];
              const abierta = solucionesAbiertas[caso.id] === true;
              return (
                <article key={caso.id} className={styles.aulaCaso}>
                  <div className={styles.aulaCabecera}>
                    <span className={styles.aulaNumero}>{caso.id}</span>
                    <h3 className={styles.aulaCasoTitulo}>{caso.titulo}</h3>
                    <span className={styles.aulaEtiqueta}>
                      {caso.categoria === 'abstracto' ? 'Cálculo directo' : 'Situación real'}
                    </span>
                  </div>

                  <p className={styles.aulaEnunciado}>{caso.enunciado}</p>

                  <div className={styles.aulaRespuesta}>
                    <label className={styles.aulaEtiquetaCampo} htmlFor={`respuesta-caso-${caso.id}`}>
                      {caso.etiquetaRespuesta}
                      {caso.unidad !== '' ? ` (en ${caso.unidad})` : ''}
                    </label>
                    <input
                      id={`respuesta-caso-${caso.id}`}
                      className={styles.aulaCampo}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={respuestasCasos[caso.id] ?? ''}
                      placeholder="Escribe solo el número"
                      onChange={(e) =>
                        setRespuestasCasos((previas) => ({
                          ...previas,
                          [caso.id]: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.aulaAcciones}>
                    <button
                      type="button"
                      className={styles.aulaBtnPrimario}
                      onClick={() => comprobarCaso(caso.id, caso.respuesta)}
                    >
                      Comprobar
                    </button>
                    <button
                      type="button"
                      className={styles.aulaBtnSecundario}
                      aria-expanded={abierta}
                      aria-controls={`solucion-caso-${caso.id}`}
                      onClick={() => alternarSolucion(caso.id)}
                    >
                      {abierta ? 'Ocultar solución' : 'Ver solución'}
                    </button>
                  </div>

                  {veredicto !== undefined && (
                    <p
                      className={`${styles.aulaVeredicto} ${veredicto.correcto ? styles.aulaVeredictoOk : styles.aulaVeredictoKo}`}
                      role="alert"
                      aria-live="polite"
                    >
                      <span aria-hidden="true">
                        {veredicto.correcto
                          ? '✅'
                          : veredicto.motivo === 'vacia'
                            ? '✏️'
                            : veredicto.motivo === 'no-numerico'
                              ? '🔢'
                              : '❌'}
                      </span>{' '}
                      {veredicto.correcto
                        ? '¡Correcto!'
                        : veredicto.motivo === 'vacia'
                          ? 'Escribe una respuesta antes de comprobar.'
                          : veredicto.motivo === 'no-numerico'
                            ? 'Eso no es un número. Escribe solo la cifra, con coma decimal.'
                            : 'Todavía no. Fíjate en la pista o despliega la solución.'}
                    </p>
                  )}

                  <div id={`solucion-caso-${caso.id}`} hidden={!abierta}>
                    <div className={styles.aulaSolucion}>
                      <p className={styles.aulaPista}>
                        <span aria-hidden="true">💡</span> {caso.pista}
                      </p>
                      <ol className={styles.aulaPasos}>
                        {caso.pasos.map((paso, indice) => (
                          <li key={indice} className={styles.aulaPaso}>
                            {paso}
                          </li>
                        ))}
                      </ol>
                      <p className={styles.aulaResultado}>
                        Resultado: <strong>{caso.respuestaTexto}</strong> {caso.unidad}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.aulaPractica}>
            <h3 className={styles.aulaPracticaTitulo}>Práctica sin final</h3>
            <p className={styles.aulaIntro}>
              Cuando los 12 casos se queden cortos, este botón inventa uno nuevo cada vez, con
              números distintos y la solución explicada igual que en los demás. Estos{' '}
              <strong>no son asignables por número</strong>: para eso están los 12 de arriba.
            </p>
            <button type="button" className={styles.aulaBtnPrimario} onClick={nuevoEjercicio}>
              <span aria-hidden="true">🎲</span> Generar un ejercicio nuevo
            </button>

            {ejercicio !== null && (
              <div className={styles.aulaCaso}>
                <p className={styles.aulaEnunciado}>{ejercicio.enunciado}</p>
                <div className={styles.aulaRespuesta}>
                  <label className={styles.aulaEtiquetaCampo} htmlFor="respuesta-practica">
                    {ejercicio.etiquetaRespuesta} (en {ejercicio.unidad})
                  </label>
                  <input
                    id="respuesta-practica"
                    className={styles.aulaCampo}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={respuestaEjercicio}
                    placeholder="Escribe solo el número"
                    onChange={(e) => setRespuestaEjercicio(e.target.value)}
                  />
                </div>
                <div className={styles.aulaAcciones}>
                  <button
                    type="button"
                    className={styles.aulaBtnPrimario}
                    onClick={() =>
                      setVeredictoEjercicio(
                        comprobarRespuesta(respuestaEjercicio, ejercicio.respuesta),
                      )
                    }
                  >
                    Comprobar
                  </button>
                </div>
                {veredictoEjercicio !== null && (
                  <>
                    <p
                      className={`${styles.aulaVeredicto} ${veredictoEjercicio.correcto ? styles.aulaVeredictoOk : styles.aulaVeredictoKo}`}
                      role="alert"
                      aria-live="polite"
                    >
                      <span aria-hidden="true">{veredictoEjercicio.correcto ? '✅' : '❌'}</span>{' '}
                      {veredictoEjercicio.correcto
                        ? '¡Correcto!'
                        : `No. La respuesta es ${ejercicio.respuestaTexto} ${ejercicio.unidad}.`}
                    </p>
                    <ol className={styles.aulaPasos}>
                      {ejercicio.pasos.map((paso, indice) => (
                        <li key={indice} className={styles.aulaPaso}>
                          {paso}
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ---------------------------------------------- Contenido educativo */}
        <EducationalSection
          title="Todo sobre las escalas de planos y maquetas"
          subtitle="Qué significan, cómo se calculan y dónde se falla"
        >
          <h3>Las escalas más usadas y para qué sirve cada una</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Escala</th>
                  <th scope="col">1 cm de plano son</th>
                  <th scope="col">Dónde se usa</th>
                  <th scope="col">Qué se ve a esa escala</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1:20</td>
                  <td>20 cm</td>
                  <td>Secciones y detalles de obra</td>
                  <td>El grosor de un tabique y el despiece de un peldaño</td>
                </tr>
                <tr>
                  <td>1:25</td>
                  <td>25 cm</td>
                  <td>Cocinas, baños y estancias sueltas</td>
                  <td>Cada mueble con su medida real</td>
                </tr>
                <tr>
                  <td>1:50</td>
                  <td>50 cm</td>
                  <td>Planta de vivienda (la más habitual)</td>
                  <td>Habitaciones, puertas y ventanas acotadas</td>
                </tr>
                <tr>
                  <td>1:100</td>
                  <td>1 m</td>
                  <td>Planta de edificio completo</td>
                  <td>La distribución entera, sin detalle constructivo</td>
                </tr>
                <tr>
                  <td>1:500</td>
                  <td>5 m</td>
                  <td>Parcelas y urbanización</td>
                  <td>La huella de los edificios y el viario</td>
                </tr>
                <tr>
                  <td>1:25000</td>
                  <td>250 m</td>
                  <td>Mapa topográfico y senderismo</td>
                  <td>Curvas de nivel, caminos y núcleos de población</td>
                </tr>
                <tr>
                  <td>1:87 (H0)</td>
                  <td>87 cm</td>
                  <td>Modelismo ferroviario</td>
                  <td>Un vagón de 26 m cabe en 30 cm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Para quién es esta calculadora</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>
                <span aria-hidden="true">🎓</span> Estudiante de dibujo técnico
              </h4>
              <p>
                Las escalas entran por partida doble: como proporcionalidad en matemáticas y como
                acotación en dibujo. Los 12 casos numerados de arriba cubren los dos sentidos de
                la conversión, deducir una escala y la trampa de las superficies, que es donde se
                pierden más puntos en un examen.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>
                <span aria-hidden="true">🏠</span> Quien interpreta el plano de una vivienda
              </h4>
              <p>
                Con un plano a 1:50 y una regla se puede comprobar si el sofá cabe en el salón
                antes de comprarlo. La pestaña de lista convierte de una vez todas las medidas
                tomadas sobre el papel, y la escala gráfica permite medir sin calcular.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>
                <span aria-hidden="true">🚂</span> Aficionado al modelismo
              </h4>
              <p>
                Pasar de la medida real de un vehículo a la de su maqueta, o comprobar si una
                pieza de 1:72 pega con uno de 1:76. Las 25 escalas de la lista incluyen las
                ferroviarias H0, N y Z, las de automóvil y las de modelismo militar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>
                <span aria-hidden="true">🗺️</span> Quien lee un mapa en papel
              </h4>
              <p>
                En un mapa 1:25.000, cuatro centímetros son un kilómetro. La pestaña de deducir la
                escala sirve además para averiguarla cuando el mapa está fotocopiado o recortado y
                ha perdido la leyenda.
              </p>
            </div>
          </div>

          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué significa exactamente la escala 1:50?</h4>
              <p>
                Que el dibujo es 50 veces más pequeño que la realidad: 1 cm sobre el papel son 50
                cm reales, es decir, medio metro. Para ir del plano a la realidad se multiplica
                por 50 y para ir de la realidad al plano se divide entre 50.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo averiguo la escala de un plano que no la indica?</h4>
              <p>
                Mide sobre el dibujo algo cuya medida real conozcas y divide las dos cantidades
                puestas en la misma unidad. Si 3 cm del papel son 6 m reales, esos 6 m son 600 cm
                y la razón 3:600 se simplifica a 1:200. La pestaña «Deducir la escala» lo hace
                sola.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué una superficie no se convierte igual que una longitud?</h4>
              <p>
                Porque el área tiene dos dimensiones y escala con el cuadrado del factor. En 1:50
                las longitudes se dividen entre 50, pero las áreas entre 2.500. Un salón de 24 cm²
                sobre el papel son 6 m² reales, no 0,48.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Compruébalo con un cuadrado de 1 cm de lado: a
                1:50 pasa a medir 50 cm de lado, y su área pasa de 1 cm² a 2.500 cm².
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es una escala de ampliación?</h4>
              <p>
                Una en la que el dibujo es más grande que el objeto, como 2:1 o 5:1. Se usa para
                acotar piezas pequeñas que a tamaño natural no se verían. Se reconoce porque el
                primer número es mayor que el segundo, y en ella se multiplica para ir al dibujo
                en vez de dividir.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué la escala H0 es 1:87 y no un número redondo?</h4>
              <p>
                Porque se definió a partir del ancho de vía, no del tamaño del tren: el ancho H0
                es la mitad del de la escala 1, que es 1:43,5, y la mitad de 43,5 es 87. Es un
                número heredado de una convención del siglo pasado que se mantuvo por
                compatibilidad.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo fiarme de una escala gráfica impresa?</h4>
              <p>
                Solo si se imprime al 100 %, sin la opción de ajustar a la página. Su ventaja es
                justo esa: si el plano entero se amplía o se reduce, la barra se deforma con él y
                sigue midiendo bien, cosa que la escala numérica no hace. Comprueba con una regla
                que la barra mide lo que la app dice antes de usarla.
              </p>
            </div>
          </div>

          <h3>Cómo usar la calculadora paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Escribe la escala</h4>
                <p>
                  En la casilla de arriba, tal como aparece en el plano: <code>1:50</code>. Si no
                  la sabes, ve primero a la pestaña «Deducir la escala».
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Elige el sentido</h4>
                <p>
                  «Del plano a la realidad» si has medido sobre el papel; «de la realidad al
                  plano» si sabes lo que mide de verdad y quieres dibujarlo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Escribe la medida y sus unidades</h4>
                <p>
                  Con coma decimal: <code>7,2</code>. Puedes entrar en centímetros y pedir el
                  resultado en metros; la conversión de unidad va incluida.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Si tienes varias medidas, pégalas de una vez</h4>
                <p>
                  En la pestaña «Lista de medidas», una por línea. Se convierten todas a la vez y
                  las que no sean un número se señalan sin detener el resto.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Imprime la escala gráfica si vas a medir sobre papel</h4>
                <p>
                  Al 100 %, y comprueba con una regla que la barra mide lo que dice. A partir de
                  ahí puedes medir el plano sin volver a calcular nada.
                </p>
              </div>
            </div>
          </div>

          <h3>Buenas prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📏
              </span>
              <h4>Pon las dos medidas en la misma unidad antes de dividir</h4>
              <p>
                Es el paso que más se salta al deducir una escala: 3 cm y 6 m no se pueden dividir
                tal cual. Pasa los metros a centímetros y la razón sale sola.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧠
              </span>
              <h4>Comprueba el orden de magnitud antes de dar el número por bueno</h4>
              <p>
                Si un muro de vivienda te sale de 36 metros o de 3,6 centímetros, has invertido la
                operación. El resultado equivocado siempre es un múltiplo o un submúltiplo del
                bueno.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔲
              </span>
              <h4>Usa la pestaña de superficies para las áreas, no la de longitudes</h4>
              <p>
                No es una comodidad: el factor entra al cuadrado. Convertir un área con el factor
                lineal da un número plausible y equivocado por un factor de 50.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                📐
              </span>
              <h4>Recuerda los dos atajos que ahorran la calculadora</h4>
              <p>
                En 1:100, cada metro real es 1 cm de plano. En 1:1000, cada centímetro del plano
                son 10 metros. Con esos dos se estima de cabeza casi cualquier plano.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🖨️
              </span>
              <h4>Desconfía de un plano fotocopiado</h4>
              <p>
                Una fotocopia ampliada o reducida invalida la escala numérica impresa. Si el plano
                lleva escala gráfica, esa sí sigue siendo válida; si no, deduce la escala con una
                medida conocida.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h4>Los errores más frecuentes</h4>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Invertir el sentido de la operación.</strong> Multiplicar cuando había que
                dividir da un resultado del orden del cuadrado del factor: un muro de 3,6 m sale
                de 1,44 mm y nada avisa.
              </li>
              <li>
                <strong>Aplicar el factor lineal a una superficie.</strong> El error más caro del
                tema, porque el número que sale es perfectamente creíble. Las áreas van con el
                cuadrado del factor.
              </li>
              <li>
                <strong>Mezclar unidades a mitad del cálculo.</strong> Entrar centímetros y leer
                el resultado como si fueran metros es un factor 100 de diferencia. Fija la unidad
                de salida antes de mirar el número.
              </li>
              <li>
                <strong>Fiarse de la escala impresa en una fotocopia.</strong> Si el plano se ha
                ampliado o reducido al copiarlo, la escala numérica ya no vale; la gráfica sí.
              </li>
              <li>
                <strong>Imprimir la escala gráfica con «ajustar a la página».</strong> El
                navegador la reescala y la regla pasa a medir mal, que es peor que no tenerla.
              </li>
              <li>
                <strong>Confundir 1:2 con 2:1.</strong> La primera reduce a la mitad y la segunda
                dobla. El orden de los dos números no es indiferente.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-escalas')} />
        <ShareCard appName="calculadora-escalas" />
      </main>

      <Footer appName="calculadora-escalas" />
    </div>
  );
}
