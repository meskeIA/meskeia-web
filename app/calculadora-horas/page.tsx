'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './CalculadoraHoras.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────────────────────

type Modo = 'lista' | 'intervalo' | 'semana';

interface Linea {
  id: number;
  texto: string;
  /** 1 suma, -1 resta */
  signo: 1 | -1;
}

interface DiaSemana {
  nombre: string;
  entrada: string;
  salida: string;
  /** Pausa en minutos, como texto para poder vaciar el campo */
  pausa: string;
}

const DIAS_INICIALES: DiaSemana[] = [
  { nombre: 'Lunes', entrada: '', salida: '', pausa: '' },
  { nombre: 'Martes', entrada: '', salida: '', pausa: '' },
  { nombre: 'Miércoles', entrada: '', salida: '', pausa: '' },
  { nombre: 'Jueves', entrada: '', salida: '', pausa: '' },
  { nombre: 'Viernes', entrada: '', salida: '', pausa: '' },
  { nombre: 'Sábado', entrada: '', salida: '', pausa: '' },
  { nombre: 'Domingo', entrada: '', salida: '', pausa: '' },
];

const LINEAS_INICIALES: Linea[] = [
  { id: 1, texto: '', signo: 1 },
  { id: 2, texto: '', signo: 1 },
  { id: 3, texto: '', signo: 1 },
];

const CLAVE_ALMACEN = 'meskeia-calculadora-horas';

// Equivalencias que más se repiten al pasar minutos a decimal
const EQUIVALENCIAS: Array<{ minutos: number; decimal: string }> = [
  { minutos: 6, decimal: '0,10' },
  { minutos: 10, decimal: '0,17' },
  { minutos: 15, decimal: '0,25' },
  { minutos: 20, decimal: '0,33' },
  { minutos: 30, decimal: '0,50' },
  { minutos: 40, decimal: '0,67' },
  { minutos: 45, decimal: '0,75' },
  { minutos: 50, decimal: '0,83' },
];

// ─────────────────────────────────────────────────────────────
// Lógica de tiempo — todo se calcula en minutos enteros
// ─────────────────────────────────────────────────────────────

/**
 * Convierte texto a minutos. Reglas explícitas para el usuario:
 *   con dos puntos o hache → horas:minutos   ("7:45", "7h45", "1:20:30")
 *   con coma o punto       → horas decimales ("7,75", "7.75")
 *   solo cifras            → horas enteras   ("7")
 * Devuelve null si el texto no es interpretable.
 */
function parsearTiempo(entrada: string): number | null {
  const limpio = entrada.trim().toLowerCase().replace(/\s+/g, '');
  if (!limpio) return null;

  const negativo = limpio.startsWith('-');
  const cuerpo = limpio.replace(/^[+-]/, '').replace(/h(?!$)/g, ':').replace(/h$/, '');
  if (!cuerpo) return null;

  let minutos: number;

  if (cuerpo.includes(':')) {
    const partes = cuerpo.split(':');
    if (partes.length > 3) return null;
    const [h, m = '0', s = '0'] = partes;
    if (![h, m, s].every((p) => /^\d*$/.test(p))) return null;
    const horas = Number(h || 0);
    const mins = Number(m || 0);
    const segs = Number(s || 0);
    if (mins >= 60 || segs >= 60) return null;
    minutos = horas * 60 + mins + segs / 60;
  } else {
    const decimal = cuerpo.replace(',', '.');
    if (!/^\d*\.?\d*$/.test(decimal) || decimal === '.') return null;
    minutos = Number(decimal) * 60;
  }

  if (!Number.isFinite(minutos)) return null;
  return Math.round(minutos) * (negativo ? -1 : 1);
}

/** Minutos → "7:45" (con signo si es negativo) */
function formatearHM(minutos: number): string {
  const signo = minutos < 0 ? '−' : '';
  const abs = Math.abs(Math.round(minutos));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${signo}${h}:${String(m).padStart(2, '0')}`;
}

/** Minutos → "7,75" en formato español */
function formatearDecimal(minutos: number): string {
  return formatNumber(minutos / 60, 2);
}

/** "08:30" (input type=time) → minutos desde medianoche */
function horaAMinutos(hora: string): number | null {
  const coincide = hora.match(/^(\d{1,2}):(\d{2})$/);
  if (!coincide) return null;
  const h = Number(coincide[1]);
  const m = Number(coincide[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Duración de un turno. Si la salida es anterior a la entrada se entiende
 * que el turno cruza la medianoche y se le suman 24 horas.
 */
function duracionTurno(
  entrada: string,
  salida: string,
  pausaMin: number,
): { minutos: number; cruzaMedianoche: boolean } | null {
  const ini = horaAMinutos(entrada);
  const fin = horaAMinutos(salida);
  if (ini === null || fin === null) return null;
  const cruzaMedianoche = fin < ini;
  const bruto = cruzaMedianoche ? fin + 24 * 60 - ini : fin - ini;
  return { minutos: bruto - pausaMin, cruzaMedianoche };
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function CalculadoraHorasPage() {
  const [modo, setModo] = useState<Modo>('lista');

  // Modo 1 — lista de tiempos
  const [lineas, setLineas] = useState<Linea[]>(LINEAS_INICIALES);
  const [siguienteId, setSiguienteId] = useState(4);

  // Modo 2 — entre dos horas
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [pausa, setPausa] = useState('');

  // Modo 3 — parte semanal
  const [dias, setDias] = useState<DiaSemana[]>(DIAS_INICIALES);
  const [jornadaPactada, setJornadaPactada] = useState('40');
  const [cargado, setCargado] = useState(false);

  // El parte semanal se guarda solo en el navegador de quien lo escribe
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE_ALMACEN);
      if (guardado) {
        const datos = JSON.parse(guardado) as { dias?: DiaSemana[]; jornada?: string };
        if (Array.isArray(datos.dias) && datos.dias.length === 7) setDias(datos.dias);
        if (typeof datos.jornada === 'string') setJornadaPactada(datos.jornada);
      }
    } catch {
      // Un almacén ilegible no debe impedir usar la calculadora
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify({ dias, jornada: jornadaPactada }));
    } catch {
      // Navegación privada o almacén lleno: se sigue calculando igual
    }
  }, [dias, jornadaPactada, cargado]);

  // ── Modo 1 ────────────────────────────────────────────────
  const actualizarLinea = useCallback((id: number, cambios: Partial<Linea>) => {
    setLineas((previas) => previas.map((l) => (l.id === id ? { ...l, ...cambios } : l)));
  }, []);

  const anadirLinea = () => {
    setLineas((previas) => [...previas, { id: siguienteId, texto: '', signo: 1 }]);
    setSiguienteId((n) => n + 1);
  };

  const quitarLinea = (id: number) => {
    setLineas((previas) => (previas.length > 1 ? previas.filter((l) => l.id !== id) : previas));
  };

  const limpiarLista = () => {
    setLineas(LINEAS_INICIALES);
    setSiguienteId(4);
  };

  const lineasValidas = lineas
    .map((l) => ({ linea: l, minutos: parsearTiempo(l.texto) }))
    .filter((x): x is { linea: Linea; minutos: number } => x.minutos !== null);

  const totalLista = lineasValidas.reduce((suma, x) => suma + x.minutos * x.linea.signo, 0);
  const hayErrorLista = lineas.some((l) => l.texto.trim() !== '' && parsearTiempo(l.texto) === null);
  const mediaLista = lineasValidas.length > 0 ? totalLista / lineasValidas.length : 0;

  // ── Modo 2 ────────────────────────────────────────────────
  const pausaMinutos = pausa.trim() === '' ? 0 : Number(pausa.replace(',', '.'));
  const pausaValida = Number.isFinite(pausaMinutos) && pausaMinutos >= 0;
  const turno = pausaValida ? duracionTurno(entrada, salida, Math.round(pausaMinutos)) : null;

  // ── Modo 3 ────────────────────────────────────────────────
  const turnosSemana = dias.map((dia) => {
    const pausaDia = dia.pausa.trim() === '' ? 0 : Number(dia.pausa.replace(',', '.'));
    if (!Number.isFinite(pausaDia) || pausaDia < 0) return null;
    return duracionTurno(dia.entrada, dia.salida, Math.round(pausaDia));
  });

  const totalSemana = turnosSemana.reduce(
    (suma, t) => suma + (t && t.minutos > 0 ? t.minutos : 0),
    0,
  );
  const diasConDatos = turnosSemana.filter((t) => t !== null && t.minutos > 0).length;

  const jornadaMinutos = (() => {
    const valor = Number(jornadaPactada.replace(',', '.'));
    return Number.isFinite(valor) && valor > 0 ? Math.round(valor * 60) : null;
  })();
  const diferencia = jornadaMinutos !== null ? totalSemana - jornadaMinutos : null;

  const actualizarDia = (indice: number, cambios: Partial<DiaSemana>) => {
    setDias((previos) => previos.map((d, i) => (i === indice ? { ...d, ...cambios } : d)));
  };

  const limpiarSemana = () => setDias(DIAS_INICIALES);

  const [copiado, setCopiado] = useState(false);

  const copiarResultado = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles el usuario siempre puede seleccionar el número
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🕒</span> Calculadora de Horas y Minutos
        </h1>
        <p className={styles.subtitle}>
          Suma y resta tiempos sin pelearte con la base sesenta, pásalos a horas decimales para
          facturar y cuadra el total de la semana con sus pausas.
        </p>
      </header>

      <LegalNotice />

      {/* Selector de modo */}
      <div className={styles.tabs} role="tablist" aria-label="Tipo de cálculo">
        <button
          type="button"
          role="tab"
          id="tab-lista"
          aria-selected={modo === 'lista'}
          aria-controls="panel-lista"
          className={`${styles.tab} ${modo === 'lista' ? styles.tabActiva : ''}`}
          onClick={() => setModo('lista')}
        >
          <span aria-hidden="true">➕</span> Sumar y restar
        </button>
        <button
          type="button"
          role="tab"
          id="tab-intervalo"
          aria-selected={modo === 'intervalo'}
          aria-controls="panel-intervalo"
          className={`${styles.tab} ${modo === 'intervalo' ? styles.tabActiva : ''}`}
          onClick={() => setModo('intervalo')}
        >
          <span aria-hidden="true">⏱️</span> Entre dos horas
        </button>
        <button
          type="button"
          role="tab"
          id="tab-semana"
          aria-selected={modo === 'semana'}
          aria-controls="panel-semana"
          className={`${styles.tab} ${modo === 'semana' ? styles.tabActiva : ''}`}
          onClick={() => setModo('semana')}
        >
          <span aria-hidden="true">📋</span> Parte semanal
        </button>
      </div>

      {/* ── Modo 1: lista de tiempos ─────────────────────── */}
      {modo === 'lista' && (
        <section
          className={styles.mainContent}
          role="tabpanel"
          id="panel-lista"
          aria-labelledby="tab-lista"
        >
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Tiempos a sumar o restar</h2>
            <p className={styles.ayuda}>
              Escribe <strong>7:45</strong> para siete horas y cuarenta y cinco minutos, o{' '}
              <strong>7,75</strong> para horas decimales. Puedes mezclar los dos formatos en la misma
              lista.
            </p>

            <ul className={styles.listaLineas}>
              {lineas.map((linea, indice) => {
                const minutos = parsearTiempo(linea.texto);
                const erronea = linea.texto.trim() !== '' && minutos === null;
                return (
                  <li key={linea.id} className={styles.filaLinea}>
                    <button
                      type="button"
                      className={`${styles.btnSigno} ${linea.signo === -1 ? styles.btnSignoResta : ''}`}
                      aria-pressed={linea.signo === -1}
                      aria-label={
                        linea.signo === 1
                          ? `Línea ${indice + 1}: sumando. Pulsa para restar`
                          : `Línea ${indice + 1}: restando. Pulsa para sumar`
                      }
                      onClick={() => actualizarLinea(linea.id, { signo: linea.signo === 1 ? -1 : 1 })}
                    >
                      {linea.signo === 1 ? '+' : '−'}
                    </button>

                    <input
                      type="text"
                      inputMode="text"
                      className={`${styles.input} ${erronea ? styles.inputError : ''}`}
                      value={linea.texto}
                      placeholder="7:45"
                      aria-label={`Tiempo de la línea ${indice + 1}`}
                      aria-invalid={erronea}
                      onChange={(e) => actualizarLinea(linea.id, { texto: e.target.value })}
                    />

                    <span className={styles.equivalencia}>
                      {minutos !== null ? `${formatearDecimal(minutos)} h` : ''}
                    </span>

                    <button
                      type="button"
                      className={styles.btnQuitar}
                      aria-label={`Quitar la línea ${indice + 1}`}
                      onClick={() => quitarLinea(linea.id)}
                      disabled={lineas.length === 1}
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className={styles.acciones}>
              <button type="button" className={styles.btnSecundario} onClick={anadirLinea}>
                <span aria-hidden="true">➕</span> Añadir línea
              </button>
              <button type="button" className={styles.btnSecundario} onClick={limpiarLista}>
                <span aria-hidden="true">🔄</span> Vaciar
              </button>
            </div>

            {hayErrorLista && (
              <p className={styles.aviso} role="alert">
                Hay alguna línea que no se entiende. Usa <strong>7:45</strong> (horas y minutos) o{' '}
                <strong>7,75</strong> (horas decimales); los minutos no pueden pasar de 59.
              </p>
            )}
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Total</h2>
            <div className={styles.resultadoGrande}>{formatearHM(totalLista)}</div>
            <p className={styles.resultadoPie}>horas : minutos</p>

            <div className={styles.resultadoSecundario}>
              <div>
                <span className={styles.etiquetaResultado}>En horas decimales</span>
                <strong className={styles.valorResultado}>{formatearDecimal(totalLista)} h</strong>
              </div>
              <div>
                <span className={styles.etiquetaResultado}>En minutos</span>
                <strong className={styles.valorResultado}>
                  {formatNumber(Math.round(totalLista), 0)} min
                </strong>
              </div>
              <div>
                <span className={styles.etiquetaResultado}>Tiempos contados</span>
                <strong className={styles.valorResultado}>{lineasValidas.length}</strong>
              </div>
              <div>
                <span className={styles.etiquetaResultado}>Media por tiempo</span>
                <strong className={styles.valorResultado}>{formatearHM(mediaLista)}</strong>
              </div>
            </div>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => copiarResultado(formatearDecimal(totalLista).replace(/\./g, ''))}
            >
              <span aria-hidden="true">📋</span> Copiar total decimal
            </button>
            <p className={styles.avisoCopia} role="status" aria-live="polite">
              {copiado ? 'Total copiado al portapapeles' : ''}
            </p>

            <p className={styles.pista}>
              El valor decimal es el que se multiplica por una tarifa por hora. El sexagesimal es el
              que se apunta en un cuadrante.
            </p>
          </div>
        </section>
      )}

      {/* ── Modo 2: entre dos horas ──────────────────────── */}
      {modo === 'intervalo' && (
        <section
          className={styles.mainContent}
          role="tabpanel"
          id="panel-intervalo"
          aria-labelledby="tab-intervalo"
        >
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Duración entre dos horas</h2>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Hora de entrada</span>
              <input
                type="time"
                className={styles.input}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Hora de salida</span>
              <input
                type="time"
                className={styles.input}
                value={salida}
                onChange={(e) => setSalida(e.target.value)}
              />
            </label>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Pausa a descontar (minutos)</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={5}
                className={styles.input}
                value={pausa}
                placeholder="0"
                onChange={(e) => setPausa(e.target.value)}
              />
            </label>

            <p className={styles.ayuda}>
              Si la salida es anterior a la entrada se entiende que el turno cruza la medianoche y se
              cuentan las horas de madrugada.
            </p>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Resultado</h2>
            {turno === null ? (
              <p className={styles.vacio}>Introduce la hora de entrada y la de salida.</p>
            ) : (
              <>
                <div className={styles.resultadoGrande}>{formatearHM(turno.minutos)}</div>
                <p className={styles.resultadoPie}>horas : minutos efectivos</p>

                <div className={styles.resultadoSecundario}>
                  <div>
                    <span className={styles.etiquetaResultado}>En horas decimales</span>
                    <strong className={styles.valorResultado}>
                      {formatearDecimal(turno.minutos)} h
                    </strong>
                  </div>
                  <div>
                    <span className={styles.etiquetaResultado}>En minutos</span>
                    <strong className={styles.valorResultado}>
                      {formatNumber(turno.minutos, 0)} min
                    </strong>
                  </div>
                </div>

                {turno.cruzaMedianoche && (
                  <p className={styles.aviso}>
                    <span aria-hidden="true">🌙</span> El turno cruza la medianoche: la salida se ha
                    contado en el día siguiente.
                  </p>
                )}

                {turno.minutos < 0 && (
                  <p className={styles.aviso} role="alert">
                    La pausa que has puesto es mayor que el turno completo.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Modo 3: parte semanal ────────────────────────── */}
      {modo === 'semana' && (
        <section
          className={styles.seccionSemana}
          role="tabpanel"
          id="panel-semana"
          aria-labelledby="tab-semana"
        >
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Parte de horas de la semana</h2>
            <p className={styles.ayuda}>
              Rellena solo los días que trabajes. Lo que escribas se guarda únicamente en este
              navegador: no se envía a ningún sitio.
            </p>

            <div className={styles.tableWrapper}>
              <table className={styles.tablaSemana}>
                <thead>
                  <tr>
                    <th scope="col">Día</th>
                    <th scope="col">Entrada</th>
                    <th scope="col">Salida</th>
                    <th scope="col">Pausa (min)</th>
                    <th scope="col">Efectivas</th>
                  </tr>
                </thead>
                <tbody>
                  {dias.map((dia, indice) => {
                    const t = turnosSemana[indice];
                    return (
                      <tr key={dia.nombre}>
                        <th scope="row" className={styles.celdaDia}>
                          {dia.nombre}
                        </th>
                        <td>
                          <input
                            type="time"
                            className={styles.inputTabla}
                            value={dia.entrada}
                            aria-label={`Hora de entrada del ${dia.nombre}`}
                            onChange={(e) => actualizarDia(indice, { entrada: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className={styles.inputTabla}
                            value={dia.salida}
                            aria-label={`Hora de salida del ${dia.nombre}`}
                            onChange={(e) => actualizarDia(indice, { salida: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={5}
                            className={styles.inputTabla}
                            value={dia.pausa}
                            placeholder="0"
                            aria-label={`Pausa del ${dia.nombre} en minutos`}
                            onChange={(e) => actualizarDia(indice, { pausa: e.target.value })}
                          />
                        </td>
                        <td className={styles.celdaTotal}>
                          {t && t.minutos > 0 ? formatearHM(t.minutos) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.acciones}>
              <button type="button" className={styles.btnSecundario} onClick={limpiarSemana}>
                <span aria-hidden="true">🔄</span> Vaciar la semana
              </button>
            </div>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Resumen de la semana</h2>
            <div className={styles.resultadoGrande}>{formatearHM(totalSemana)}</div>
            <p className={styles.resultadoPie}>horas efectivas en {diasConDatos} días</p>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Jornada pactada (horas por semana)</span>
              <input
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={jornadaPactada}
                placeholder="40"
                onChange={(e) => setJornadaPactada(e.target.value)}
              />
            </label>

            <div className={styles.resultadoSecundario}>
              <div>
                <span className={styles.etiquetaResultado}>Total decimal</span>
                <strong className={styles.valorResultado}>{formatearDecimal(totalSemana)} h</strong>
              </div>
              <div>
                <span className={styles.etiquetaResultado}>Media diaria</span>
                <strong className={styles.valorResultado}>
                  {diasConDatos > 0 ? formatearHM(totalSemana / diasConDatos) : '—'}
                </strong>
              </div>
              <div>
                <span className={styles.etiquetaResultado}>Diferencia con la jornada</span>
                <strong
                  className={`${styles.valorResultado} ${
                    diferencia !== null && diferencia !== 0
                      ? diferencia > 0
                        ? styles.valorPositivo
                        : styles.valorNegativo
                      : ''
                  }`}
                >
                  {diferencia === null
                    ? '—'
                    : `${diferencia > 0 ? '+' : ''}${formatearHM(diferencia)}`}
                </strong>
              </div>
              <div>
                <span className={styles.etiquetaResultado}>Equivale a</span>
                <strong className={styles.valorResultado}>
                  {diferencia === null ? '—' : `${formatearDecimal(diferencia)} h`}
                </strong>
              </div>
            </div>

            <p className={styles.pista}>
              La diferencia es aritmética: cuánto se separa lo apuntado de la jornada que has
              indicado. Cómo se compensa ese saldo depende del contrato y del convenio aplicable.
            </p>
          </div>
        </section>
      )}

      {/* Tabla de equivalencias, útil en los tres modos */}
      <section className={styles.equivalenciasSection} aria-labelledby="titulo-equivalencias">
        <h2 id="titulo-equivalencias" className={styles.equivalenciasTitulo}>
          <span aria-hidden="true">🔁</span> Minutos y su valor decimal
        </h2>
        <ul className={styles.equivalenciasLista}>
          {EQUIVALENCIAS.map((eq) => (
            <li key={eq.minutos} className={styles.equivalenciaItem}>
              <strong>{eq.minutos} min</strong>
              <span>{eq.decimal} h</span>
            </li>
          ))}
        </ul>
      </section>

      <DisclaimerCard
        variant="general"
        severity="high"
        title="Qué calcula esta herramienta y qué no"
        context="calculadora-horas"
        collapsible={false}
      >
        <p>
          Esta calculadora hace aritmética de tiempo: suma, resta y convierte entre horas y minutos.
          No interpreta convenios, contratos ni normativa laboral de ningún país, y su resultado no
          sustituye al registro horario oficial que lleva cada empresa. Para saber cómo se computan,
          se compensan o se retribuyen unas horas concretas, consulta tu convenio o a un profesional
          de relaciones laborales.
        </p>
      </DisclaimerCard>

      <EducationalSection
        icon="📚"
        title="Cómo se calcula el tiempo sin equivocarse"
        subtitle="Base sesenta, formato decimal y los errores que más cuestan dinero"
      >
        <section className={styles.guideSection}>
          <h2>Por qué el tiempo se resiste a la calculadora normal</h2>
          <p>
            Los números que usamos a diario van de diez en diez, pero el reloj va de sesenta en
            sesenta. Esa mezcla es la que produce el error clásico: teclear 7,45 + 2,30 en una
            calculadora corriente y obtener 9,75, cuando siete horas y cuarenta y cinco minutos más
            dos horas y media son diez horas y cuarto. Son dos idiomas distintos para la misma
            cantidad, y el fallo aparece justo cuando esas horas se convierten en una factura o en un
            saldo de jornada.
          </p>
          <p>
            La regla segura es siempre la misma: pasar todo a minutos, operar con números enteros y
            volver a repartir el total en horas y minutos al final. Trabajar en una sola unidad
            elimina el problema de raíz, y es lo que hace esta herramienta por dentro.
          </p>

          <h2>Los dos formatos, uno al lado del otro</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Formato horas:minutos (7:45)</th>
                  <th>Formato decimal (7,75)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Qué representa</strong>
                  </td>
                  <td>Horas enteras y minutos sueltos, como en un reloj</td>
                  <td>Horas y fracción de hora, como un número normal</td>
                </tr>
                <tr>
                  <td>
                    <strong>Dónde se usa</strong>
                  </td>
                  <td>Cuadrantes, fichajes, horarios, partes de trabajo</td>
                  <td>Facturas, nóminas, hojas de cálculo, presupuestos</td>
                </tr>
                <tr>
                  <td>
                    <strong>Se puede sumar directamente</strong>
                  </td>
                  <td>❌ No, hay que llevar el acarreo de sesenta</td>
                  <td>✅ Sí, se suma como cualquier decimal</td>
                </tr>
                <tr>
                  <td>
                    <strong>Se puede multiplicar por una tarifa</strong>
                  </td>
                  <td>❌ No, saldría un importe equivocado</td>
                  <td>✅ Sí, es su uso principal</td>
                </tr>
                <tr>
                  <td>
                    <strong>Riesgo típico</strong>
                  </td>
                  <td>Olvidar el acarreo al pasar de 59 minutos</td>
                  <td>Confundir 7,45 con 7:45 (hay 18 minutos de diferencia)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Ideal para</strong>
                  </td>
                  <td>Anotar y comunicar horarios</td>
                  <td>Calcular importes y comparar totales</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Cuatro situaciones donde este cálculo aparece</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  💼
                </span>
                <h3>Facturar por horas</h3>
              </div>
              <p>
                Tres sesiones con un cliente: 1:45, 2:20 y 0:50. El total es 4:55, que en decimal son
                4,92 horas. A 40 € la hora, la factura sale de 196,67 €, no de 4,55 × 40. Con las
                tarifas altas, media hora mal contada se nota.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🌙
                </span>
                <h3>Turnos de noche</h3>
              </div>
              <p>
                Un turno de 22:00 a 06:00 con media hora de descanso son 7:30 efectivas. Restar sin
                más da un número negativo, así que hay que contar la salida en el día siguiente. Es
                el error más frecuente en hostelería, sanidad y seguridad.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  📋
                </span>
                <h3>Cuadrar la semana</h3>
              </div>
              <p>
                Cinco días apuntados a mano, cada uno con su pausa, y la duda de si la semana llega a
                la jornada pactada. El parte semanal suma los días y enseña el saldo, positivo o
                negativo, en los dos formatos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🎬
                </span>
                <h3>Duraciones acumuladas</h3>
              </div>
              <p>
                Sumar la duración de las pistas de un disco, de las clases de un curso o del metraje
                de un montaje es el mismo problema: cantidades en minutos y segundos que hay que
                totalizar sin arrastrar errores.
              </p>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cómo escribo los tiempos en la lista?</h4>
              <p>
                Con dos puntos si son horas y minutos (7:45) y con coma si son horas decimales
                (7,75). También se admite 7h45 y, si quieres afinar, 1:20:30 con segundos. Puedes
                mezclar formatos en la misma lista: a la derecha de cada línea aparece siempre la
                equivalencia decimal para comprobar que se ha entendido lo que querías decir.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo restar un tiempo en vez de sumarlo?</h4>
              <p>
                Sí. El botón que hay a la izquierda de cada línea cambia entre sumar y restar.
                Sirve para descontar pausas, para quitar una tarea que se había apuntado dos veces o
                para calcular cuánto falta hasta un objetivo de horas. Si el total queda por debajo
                de cero se muestra con el signo menos delante.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué 20 minutos son 0,33 horas y no 0,20?</h4>
              <p>
                Porque la fracción se calcula sobre sesenta, no sobre cien: 20 ÷ 60 = 0,333. Solo
                coinciden los múltiplos de seis minutos, que dan décimas exactas (6 minutos = 0,1 h,
                30 minutos = 0,5 h). En el resto de casos el decimal es periódico y se redondea, algo
                que conviene tener presente cuando se factura al céntimo.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa con los turnos que terminan de madrugada?</h4>
              <p>
                Si la hora de salida es menor que la de entrada, la herramienta entiende que el turno
                ha cruzado la medianoche y suma veinticuatro horas antes de restar, avisándolo bajo
                el resultado. Un turno de 23:30 a 07:30 son ocho horas. Lo que no hace es adivinar
                turnos de más de un día: para eso conviene partir el cálculo en tramos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Se guarda lo que escribo?</h4>
              <p>
                Solo el parte semanal, y únicamente en el almacenamiento local de tu navegador, para
                que no se pierda al recargar la página. No hay cuenta, ni servidor, ni copia en
                ningún otro sitio: si vacías la semana o borras los datos del navegador, desaparece.
                La lista de tiempos y el cálculo entre dos horas no se guardan.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Sirve para calcular horas extra?</h4>
              <p>
                Sirve para ver la diferencia entre las horas apuntadas y la jornada que indiques, que
                es el primer dato de la conversación. Ahora bien, qué horas cuentan como
                extraordinarias, cómo se compensan y a qué precio dependen del convenio, del contrato
                y del país; eso no lo decide una calculadora.
              </p>
            </div>
          </div>

          <h2>Cómo usarla paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">
                1
              </div>
              <div className={styles.stepContent}>
                <h4>Elige el tipo de cálculo</h4>
                <p>
                  Sumar y restar para una lista de cantidades ya conocidas, entre dos horas para un
                  turno concreto, y parte semanal cuando quieras totalizar varios días con sus
                  pausas.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">
                2
              </div>
              <div className={styles.stepContent}>
                <h4>Escribe los tiempos como los tengas apuntados</h4>
                <p>
                  No hace falta convertir nada a mano: 7:45 y 7,75 conviven sin problema. La
                  equivalencia decimal de cada línea aparece a su derecha en cuanto el texto es
                  válido.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">
                3
              </div>
              <div className={styles.stepContent}>
                <h4>Descuenta lo que no cuenta</h4>
                <p>
                  Cambia a resta las líneas que haya que descontar, o usa el campo de pausa en los
                  otros dos modos. Restar la comida es lo que separa las horas de presencia de las
                  horas efectivas.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">
                4
              </div>
              <div className={styles.stepContent}>
                <h4>Mira los dos formatos del total</h4>
                <p>
                  El grande, en horas y minutos, es el que se comunica; el decimal, justo debajo, es
                  el que se multiplica por una tarifa o se pega en una hoja de cálculo.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">
                5
              </div>
              <div className={styles.stepContent}>
                <h4>Contrasta antes de facturar</h4>
                <p>
                  Compara el total con tus propias anotaciones o con el registro de la empresa. Una
                  calculadora acierta con lo que le das: si falta un día en la lista, el error viaja
                  entero hasta la factura.
                </p>
              </div>
            </div>
          </div>

          <h2>Buenas costumbres al contar horas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Apunta el mismo día</h4>
              <p>
                Reconstruir una semana de memoria es la principal fuente de horas perdidas al
                facturar.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Elige un solo formato para archivar</h4>
              <p>
                Mezclar formatos está bien al teclear, pero guarda siempre el histórico en uno de los
                dos.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Redondea al final, nunca en cada línea</h4>
              <p>
                Redondear tiempo a tiempo acumula desviación; el redondeo se aplica una vez, sobre el
                total.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Separa presencia de trabajo efectivo</h4>
              <p>
                Anota la pausa aparte en lugar de descontarla mentalmente: así el dato sigue siendo
                comprobable.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Acuerda por escrito la unidad mínima</h4>
              <p>
                Si se factura por tramos de quince minutos, que conste antes de empezar y no al
                pasar la factura.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Guarda el detalle, no solo el total</h4>
              <p>
                Ante una discrepancia, lo que resuelve la conversación es el desglose por día, no la
                cifra final.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores que acaban costando horas o dinero</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ Sumar 7,45 + 2,30 en la calculadora del móvil:</strong> ese 9,75 no
                existe. Son 10:15, es decir 10,25 horas decimales. Media hora larga de diferencia en
                una sola suma.
              </li>
              <li>
                <strong>❌ Multiplicar la tarifa por el formato sexagesimal:</strong> facturar 7:45 a
                40 € como si fueran 7,45 horas deja 12 € por el camino cada vez, y pasa desapercibido
                mes tras mes.
              </li>
              <li>
                <strong>❌ Restar sin tener en cuenta la medianoche:</strong> de 22:00 a 06:00 no son
                menos dieciséis horas; el turno cruza al día siguiente y dura ocho.
              </li>
              <li>
                <strong>❌ Olvidar la pausa:</strong> confundir horas de presencia con horas
                efectivas infla el parte y convierte cualquier revisión en una discusión.
              </li>
              <li>
                <strong>❌ Redondear cada día por separado:</strong> subir cinco días a la media hora
                más cercana puede añadir más de una hora ficticia a la semana.
              </li>
              <li>
                <strong>❌ Pasar minutos a decimal dividiendo entre cien:</strong> 20 minutos no son
                0,20 horas sino 0,33; el error se multiplica en cuanto hay muchas líneas.
              </li>
              <li>
                <strong>❌ Fiar el total a la memoria del navegador:</strong> el parte semanal se
                guarda solo aquí. Si el dato importa, cópialo a tu hoja o a tu factura.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-horas')} />

      <ShareCard appName="calculadora-horas" />

      <Footer appName="calculadora-horas" />
    </div>
  );
}
