'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorEquilibrioQuimico.module.css';

// El motor de esta app —las reacciones, el cociente Q, el nuevo equilibrio y van 't Hoff—
// vive en ./casos.ts, no aquí. Se movió el 11/09/2026 para que los 12 casos para clase y el
// simulador no puedan calcular con convenios distintos: si divergieran, la app suspendería
// una respuesta que ella misma produce. Aquí no se calcula nada de química.
import {
  CASOS,
  OPCIONES_DIRECCION,
  REACCIONES,
  TEXTO_DIRECCION,
  TOTAL_CASOS,
  T_MAX_K,
  T_MIN_K,
  T_REFERENCIA_K,
  calcularQ,
  comprobarPrediccion,
  comprobarRespuesta,
  deltaN,
  equilibrioDePartida,
  esExotermicaDe,
  nuevoEquilibrio,
  nuevoKcConTemperatura,
  type Comprobacion,
  type DireccionDesplazamiento,
  type Perturbacion,
  type TipoPerturbacion,
} from './casos';

// ============================================================
// Componente principal
// ============================================================

export default function SimuladorEquilibrioQuimicoPage() {
  const [reaccionId, setReaccionId] = useState<string>(REACCIONES[0].id);
  const reaccion = useMemo(
    () => REACCIONES.find((r) => r.id === reaccionId) ?? REACCIONES[0],
    [reaccionId],
  );

  /**
   * Se parte del EQUILIBRIO, no de las concentraciones sugeridas en crudo.
   *
   * Le Chatelier solo habla de sistemas EN equilibrio, y los seis estados de partida
   * estaban lejos de él (Q ≪ Kc en los seis). Por eso el mensaje —que enuncia lo que
   * predice el principio— contradecía a la flecha, que muestra hacia dónde va el sistema
   * de verdad: en Haber-Bosch, «hacia los reactivos (←)» junto a «Q < Kc → productos →».
   * No estaba mal ninguno de los dos: el sistema no estaba en equilibrio y la premisa del
   * principio no se cumplía (hallazgo 171). Se resuelve con la misma función que usa el
   * botón «Aplicar nuevo equilibrio», así que la primera pantalla ya es un equilibrio.
   */
  const [concentraciones, setConcentraciones] = useState<Record<string, number>>(
    () => equilibrioDePartida(REACCIONES[0]),
  );
  const [temperaturaK, setTemperaturaK] = useState<number>(298);
  const [historialPerturbaciones, setHistorialPerturbaciones] = useState<Perturbacion[]>([]);

  // Casos para clase. La corrección vive en `casos.ts`, fuera de la vista.
  const [respuestasCasos, setRespuestasCasos] = useState<Record<number, string>>({});
  const [prediccionesElegidas, setPrediccionesElegidas] = useState<
    Record<number, DireccionDesplazamiento>
  >({});
  const [veredictos, setVeredictos] = useState<Record<number, Comprobacion>>({});
  const [solucionesAbiertas, setSolucionesAbiertas] = useState<Record<number, boolean>>({});
  const [mensaje, setMensaje] = useState<string>('Selecciona una reacción y aplica una perturbación para ver Le Chatelier en acción.');

  const casosResueltos = useMemo(
    () => Object.values(veredictos).filter((v) => v.correcto).length,
    [veredictos],
  );

  // ---------------------------------------------------------- Casos para clase

  const comprobarCasoNumerico = (id: number, esperado: number) => {
    setVeredictos((previos) => ({
      ...previos,
      [id]: comprobarRespuesta(respuestasCasos[id] ?? '', esperado),
    }));
  };

  const comprobarCasoPrediccion = (id: number, esperada: DireccionDesplazamiento) => {
    setVeredictos((previos) => ({
      ...previos,
      [id]: comprobarPrediccion(prediccionesElegidas[id] ?? null, esperada),
    }));
  };

  const alternarSolucion = (id: number) => {
    setSolucionesAbiertas((previas) => ({ ...previas, [id]: previas[id] !== true }));
  };

  const reiniciarCasos = () => {
    setRespuestasCasos({});
    setPrediccionesElegidas({});
    setVeredictos({});
    setSolucionesAbiertas({});
  };

  // Cambia de reacción y resetea estado
  const cambiarReaccion = useCallback((id: string) => {
    const nueva = REACCIONES.find((r) => r.id === id);
    if (!nueva) return;
    setReaccionId(id);
    setConcentraciones(equilibrioDePartida(nueva));
    setTemperaturaK(298);
    setHistorialPerturbaciones([]);
    setMensaje(`Reacción cargada: ${nueva.nombre}. Pulsa una perturbación para experimentar.`);
  }, []);

  /**
   * Deja el simulador preparado con la reacción de un caso, para comprobar la predicción
   * moviendo los controles de verdad.
   *
   * Solo carga la REACCIÓN, nunca la perturbación: aplicarla sería resolver el caso, y el
   * valor pedagógico de estos doce está justo en comprometerse ANTES de mover nada.
   */
  const abrirReaccionDelCaso = (reaccionIdDelCaso: string) => {
    cambiarReaccion(reaccionIdDelCaso);
    document.getElementById('panel-simulador')?.scrollIntoView({ behavior: 'smooth' });
  };

  const esExotermica = esExotermicaDe(reaccion.deltaH);

  const KcEfectiva = useMemo(
    () => nuevoKcConTemperatura(reaccion.Kc, reaccion.deltaH, T_REFERENCIA_K, temperaturaK),
    [reaccion, temperaturaK],
  );

  const Q = useMemo(() => calcularQ(reaccion, concentraciones), [reaccion, concentraciones]);

  const direccion: DireccionDesplazamiento = useMemo(() => {
    const ratio = Q / KcEfectiva;
    if (ratio > 1.02) return 'izquierda';
    if (ratio < 0.98) return 'derecha';
    return 'equilibrio';
  }, [Q, KcEfectiva]);

  const equilibrioPredicho = useMemo(
    () => nuevoEquilibrio(reaccion, concentraciones, KcEfectiva),
    [reaccion, concentraciones, KcEfectiva],
  );

  const dN = deltaN(reaccion);

  // Actualizar concentración manualmente
  const setConc = (simbolo: string, valor: number) => {
    setConcentraciones((prev) => ({ ...prev, [simbolo]: Math.max(valor, 0) }));
  };

  // ============================================================
  // Aplicar perturbaciones
  // ============================================================

  const aplicarPerturbacion = (tipo: TipoPerturbacion, especie?: string) => {
    const cantidad = 0.5; // mol/L de cambio estándar
    const dT = 50; // K
    const factorP = 2; // factor de compresión/expansión

    if (tipo === 'anadir-reactivo' && especie) {
      setConcentraciones((prev) => ({ ...prev, [especie]: (prev[especie] ?? 0) + cantidad }));
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, especie, cantidad, descripcion: `Añadido ${formatNumber(cantidad, 2)} mol/L de ${especie}` },
      ]);
      setMensaje(
        `Añadiste ${especie}: el sistema se opone al cambio consumiendo parte de ${especie} y desplazándose hacia los productos (→).`,
      );
      return;
    }
    if (tipo === 'quitar-reactivo' && especie) {
      setConcentraciones((prev) => ({
        ...prev,
        [especie]: Math.max((prev[especie] ?? 0) - cantidad, 0.01),
      }));
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, especie, cantidad, descripcion: `Retirado ${formatNumber(cantidad, 2)} mol/L de ${especie}` },
      ]);
      setMensaje(
        `Retiraste ${especie}: el sistema se opone al cambio formando más ${especie} y desplazándose hacia los reactivos (←).`,
      );
      return;
    }
    if (tipo === 'anadir-producto' && especie) {
      setConcentraciones((prev) => ({ ...prev, [especie]: (prev[especie] ?? 0) + cantidad }));
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, especie, cantidad, descripcion: `Añadido ${formatNumber(cantidad, 2)} mol/L de ${especie}` },
      ]);
      setMensaje(
        `Añadiste ${especie}: el sistema se opone al cambio consumiendo parte de ${especie} y desplazándose hacia los reactivos (←).`,
      );
      return;
    }
    if (tipo === 'quitar-producto' && especie) {
      setConcentraciones((prev) => ({
        ...prev,
        [especie]: Math.max((prev[especie] ?? 0) - cantidad, 0.01),
      }));
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, especie, cantidad, descripcion: `Retirado ${formatNumber(cantidad, 2)} mol/L de ${especie}` },
      ]);
      setMensaje(
        `Retiraste ${especie}: el sistema se opone al cambio formando más ${especie} y desplazándose hacia los productos (→).`,
      );
      return;
    }
    if (tipo === 'subir-temperatura') {
      const Tnueva = temperaturaK + dT;
      setTemperaturaK(Tnueva);
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: `Temperatura subida +${dT} K (ahora ${Tnueva} K)` },
      ]);
      if (esExotermica) {
        setMensaje(
          `Subiste T en una reacción exotérmica (ΔH<0): el sistema absorbe el calor extra desplazándose hacia los reactivos (←). Kc disminuye.`,
        );
      } else {
        setMensaje(
          `Subiste T en una reacción endotérmica (ΔH>0): el sistema absorbe el calor extra desplazándose hacia los productos (→). Kc aumenta.`,
        );
      }
      return;
    }
    if (tipo === 'bajar-temperatura') {
      const Tnueva = Math.max(temperaturaK - dT, 100);
      setTemperaturaK(Tnueva);
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: `Temperatura bajada −${dT} K (ahora ${Tnueva} K)` },
      ]);
      if (esExotermica) {
        setMensaje(
          `Bajaste T en una reacción exotérmica (ΔH<0): el sistema libera menos calor y se desplaza hacia los productos (→). Kc aumenta.`,
        );
      } else {
        setMensaje(
          `Bajaste T en una reacción endotérmica (ΔH>0): el sistema libera el déficit de calor desplazándose hacia los reactivos (←). Kc disminuye.`,
        );
      }
      return;
    }
    if (tipo === 'comprimir') {
      if (dN === 0) {
        setMensaje(
          `Comprimir no afecta porque Δn = 0 (igual número de moles de gas a cada lado). Kc y la posición no cambian.`,
        );
        setHistorialPerturbaciones((h) => [
          ...h,
          { tipo, descripcion: `Compresión (sin efecto, Δn=0)` },
        ]);
        return;
      }
      // Comprimir = aumentar todas las concentraciones de gases en factor P
      setConcentraciones((prev) => {
        const nuevo: Record<string, number> = { ...prev };
        for (const e of [...reaccion.reactivos, ...reaccion.productos]) {
          if (e.estado === 'g') nuevo[e.simbolo] = (nuevo[e.simbolo] ?? 0) * factorP;
        }
        return nuevo;
      });
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: `Compresión ×${factorP} (volumen reducido a la mitad)` },
      ]);
      if (dN < 0) {
        setMensaje(
          `Comprimiste el sistema (Δn=${dN}<0): se desplaza hacia el lado con menos moles de gas, los productos (→).`,
        );
      } else {
        setMensaje(
          `Comprimiste el sistema (Δn=${dN}>0): se desplaza hacia el lado con menos moles de gas, los reactivos (←).`,
        );
      }
      return;
    }
    if (tipo === 'expandir') {
      if (dN === 0) {
        setMensaje(
          `Expandir no afecta porque Δn = 0. Kc y la posición no cambian.`,
        );
        setHistorialPerturbaciones((h) => [
          ...h,
          { tipo, descripcion: `Expansión (sin efecto, Δn=0)` },
        ]);
        return;
      }
      setConcentraciones((prev) => {
        const nuevo: Record<string, number> = { ...prev };
        for (const e of [...reaccion.reactivos, ...reaccion.productos]) {
          if (e.estado === 'g') nuevo[e.simbolo] = (nuevo[e.simbolo] ?? 0) / factorP;
        }
        return nuevo;
      });
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: `Expansión ×${factorP} (volumen duplicado)` },
      ]);
      if (dN < 0) {
        setMensaje(
          `Expandiste el sistema (Δn=${dN}<0): se desplaza hacia el lado con más moles de gas, los reactivos (←).`,
        );
      } else {
        setMensaje(
          `Expandiste el sistema (Δn=${dN}>0): se desplaza hacia el lado con más moles de gas, los productos (→).`,
        );
      }
      return;
    }
    if (tipo === 'catalizador') {
      setHistorialPerturbaciones((h) => [
        ...h,
        { tipo, descripcion: 'Añadido catalizador' },
      ]);
      setMensaje(
        `Añadiste un catalizador: solo acelera la llegada al equilibrio en ambos sentidos por igual. NO desplaza el equilibrio ni cambia Kc.`,
      );
      return;
    }
  };

  const aplicarEquilibrioPredicho = () => {
    setConcentraciones({ ...equilibrioPredicho });
    setMensaje('Aplicado el nuevo equilibrio: Q ≈ Kc. El sistema está estabilizado.');
  };

  const reiniciar = () => {
    setConcentraciones(equilibrioDePartida(reaccion));
    setTemperaturaK(298);
    setHistorialPerturbaciones([]);
    setMensaje('Estado inicial restaurado.');
  };

  // ============================================================
  // Render
  // ============================================================

  // Calcular escala para gráfico de barras (max concentración)
  const todasEspecies = [...reaccion.reactivos, ...reaccion.productos];
  const maxConc = Math.max(
    ...todasEspecies.map((e) => Math.max(concentraciones[e.simbolo] ?? 0, equilibrioPredicho[e.simbolo] ?? 0)),
    0.1,
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Equilibrio Químico</h1>
        <p>Principio de Le Chatelier en acción</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de reacción. El id es el ancla a la que vuelven los casos para clase. */}
        <section id="panel-simulador" className={styles.panel} aria-labelledby="seleccion-reaccion">
          <h2 id="seleccion-reaccion" className={styles.panelTitle}>
            1. Elige una reacción reversible
          </h2>
          <div className={styles.reaccionSelector}>
            {REACCIONES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`${styles.reaccionCard} ${reaccionId === r.id ? styles.reaccionActive : ''}`}
                onClick={() => cambiarReaccion(r.id)}
                aria-pressed={reaccionId === r.id}
              >
                <strong>{r.nombre}</strong>
                <span className={styles.ecuacion}>{r.ecuacion}</span>
                <span className={styles.reaccionMeta}>
                  Kc ≈ {formatNumber(r.Kc, 2)} · {esExotermicaDe(r.deltaH) ? 'exotérmica' : 'endotérmica'} · ΔH = {formatNumber(r.deltaH, 0)} kJ/mol
                </span>
              </button>
            ))}
          </div>
          <p className={styles.contextoReaccion}>{reaccion.contexto}</p>
        </section>

        {/* Concentraciones iniciales */}
        <section className={styles.panel} aria-labelledby="concentraciones-titulo">
          <h2 id="concentraciones-titulo" className={styles.panelTitle}>
            2. Concentraciones actuales (mol/L)
          </h2>
          <div className={styles.inputGrid}>
            {todasEspecies.map((e) => {
              const esReactivo = reaccion.reactivos.some((r) => r.simbolo === e.simbolo);
              return (
                <div key={e.simbolo} className={styles.inputGroup}>
                  <label htmlFor={`conc-${e.simbolo}`}>
                    [{e.simbolo}] <span className={styles.unitLabel}>({esReactivo ? 'reactivo' : 'producto'} · {e.estado})</span>
                  </label>
                  <input
                    id={`conc-${e.simbolo}`}
                    type="number"
                    min={0}
                    step={0.05}
                    value={concentraciones[e.simbolo] ?? 0}
                    onChange={(ev) => setConc(e.simbolo, parseFloat(ev.target.value) || 0)}
                    inputMode="decimal"
                  />
                </div>
              );
            })}
            <div className={styles.inputGroup}>
              <label htmlFor="temperatura">
                Temperatura <span className={styles.unitLabel}>(K)</span>
              </label>
              <input
                id="temperatura"
                type="number"
                min={100}
                max={2000}
                step={10}
                value={temperaturaK}
                onChange={(ev) => {
                  // `parseFloat(v) || 298` hacía decorativos el min y el max, y además
                  // convertía el 0 en 298 en silencio, porque 0 es falsy (hallazgo 174).
                  const n = parseFloat(ev.target.value);
                  if (!Number.isFinite(n)) return;
                  setTemperaturaK(Math.min(Math.max(n, T_MIN_K), T_MAX_K));
                }}
                inputMode="decimal"
              />
            </div>
          </div>
          <button type="button" onClick={reiniciar} className={styles.calcBtn}>
            Restaurar valores iniciales
          </button>
        </section>

        {/* Perturbaciones */}
        <section className={styles.panel} aria-labelledby="perturbaciones-titulo">
          <h2 id="perturbaciones-titulo" className={styles.panelTitle}>
            3. Aplica una perturbación
          </h2>
          <div className={styles.perturbacionGrid}>
            {reaccion.reactivos.map((r) => (
              <div key={`pr-${r.simbolo}`} className={styles.perturbacionGroup}>
                <span className={styles.perturbacionLabel}>Reactivo {r.simbolo}</span>
                <button
                  type="button"
                  className={styles.perturbacionBtn}
                  onClick={() => aplicarPerturbacion('anadir-reactivo', r.simbolo)}
                >
                  + Añadir {r.simbolo}
                </button>
                <button
                  type="button"
                  className={styles.perturbacionBtn}
                  onClick={() => aplicarPerturbacion('quitar-reactivo', r.simbolo)}
                >
                  − Quitar {r.simbolo}
                </button>
              </div>
            ))}
            {reaccion.productos.map((p) => (
              <div key={`pp-${p.simbolo}`} className={styles.perturbacionGroup}>
                <span className={styles.perturbacionLabel}>Producto {p.simbolo}</span>
                <button
                  type="button"
                  className={styles.perturbacionBtn}
                  onClick={() => aplicarPerturbacion('anadir-producto', p.simbolo)}
                >
                  + Añadir {p.simbolo}
                </button>
                <button
                  type="button"
                  className={styles.perturbacionBtn}
                  onClick={() => aplicarPerturbacion('quitar-producto', p.simbolo)}
                >
                  − Quitar {p.simbolo}
                </button>
              </div>
            ))}
            <div className={styles.perturbacionGroup}>
              <span className={styles.perturbacionLabel}>Temperatura</span>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('subir-temperatura')}
              >
                ↑ Subir T (+50 K)
              </button>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('bajar-temperatura')}
              >
                ↓ Bajar T (−50 K)
              </button>
            </div>
            <div className={styles.perturbacionGroup}>
              <span className={styles.perturbacionLabel}>
                Presión {dN === 0 ? '(Δn=0, sin efecto)' : `(Δn=${dN})`}
              </span>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('comprimir')}
              >
                ↑ Comprimir (×2)
              </button>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('expandir')}
              >
                ↓ Expandir (÷2)
              </button>
            </div>
            <div className={styles.perturbacionGroup}>
              <span className={styles.perturbacionLabel}>Catalizador</span>
              <button
                type="button"
                className={styles.perturbacionBtn}
                onClick={() => aplicarPerturbacion('catalizador')}
              >
                + Añadir catalizador
              </button>
            </div>
          </div>
        </section>

        {/* Visualización */}
        <section className={styles.panel} aria-labelledby="visualizacion-titulo">
          <h2 id="visualizacion-titulo" className={styles.panelTitle}>
            4. Visualización del sistema
          </h2>

          <div className={styles.barChart}>
            {todasEspecies.map((e) => {
              const esReactivo = reaccion.reactivos.some((r) => r.simbolo === e.simbolo);
              const valor = concentraciones[e.simbolo] ?? 0;
              const altura = (valor / maxConc) * 100;
              return (
                <div key={`bar-${e.simbolo}`} className={styles.barColumn}>
                  <span className={styles.barValue}>{formatNumber(valor, 3)}</span>
                  <div
                    className={`${styles.bar} ${esReactivo ? styles.barReactivo : styles.barProducto}`}
                    style={{ height: `${Math.max(altura, 2)}%` }}
                    aria-label={`${e.simbolo}: ${formatNumber(valor, 3)} mol por litro`}
                  />
                  <span className={styles.barLabel}>{e.simbolo}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.flechaDesplazamiento} aria-live="polite">
            {direccion === 'derecha' && (
              <span className={styles.flechaDerecha}>
                Q &lt; Kc → Sistema avanza HACIA PRODUCTOS →
              </span>
            )}
            {direccion === 'izquierda' && (
              <span className={styles.flechaIzquierda}>
                ← Q &gt; Kc → Sistema retrocede HACIA REACTIVOS
              </span>
            )}
            {direccion === 'equilibrio' && (
              <span className={styles.flechaEquilibrio}>
                ⇌ Q ≈ Kc → Sistema EN EQUILIBRIO
              </span>
            )}
          </div>
        </section>

        {/* Resultados */}
        <section className={styles.panel} aria-labelledby="resultados-titulo">
          <h2 id="resultados-titulo" className={styles.panelTitle}>
            5. Análisis cuantitativo
          </h2>
          <div className={styles.resultBlock}>
            <h3 className={styles.resultTitle}>Cociente Q vs constante Kc</h3>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Q (cociente actual)</span>
              <span className={styles.resultValueAccent}>
                {Number.isFinite(Q) ? formatNumber(Q, 4) : '∞ (un reactivo se ha agotado)'}
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Kc (a {temperaturaK} K)</span>
              <span className={styles.resultValueAccent}>{formatNumber(KcEfectiva, 4)}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Kc de referencia (didáctica, a {T_REFERENCIA_K} K)</span>
              <span className={styles.resultValue}>{formatNumber(reaccion.Kc, 4)}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Δn (gas)</span>
              <span className={styles.resultValue}>{formatNumber(dN, 0)}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Dirección de desplazamiento</span>
              <span className={styles.resultValueAccent}>
                {direccion === 'derecha' && '→ Productos'}
                {direccion === 'izquierda' && '← Reactivos'}
                {direccion === 'equilibrio' && '⇌ Equilibrio'}
              </span>
            </div>
          </div>

          <div className={styles.resultBlock}>
            <h3 className={styles.resultTitle}>Nuevo equilibrio predicho</h3>
            {todasEspecies.map((e) => (
              <div key={`eq-${e.simbolo}`} className={styles.resultRow}>
                <span className={styles.resultLabel}>[{e.simbolo}]eq</span>
                <span className={styles.resultValue}>
                  {formatNumber(equilibrioPredicho[e.simbolo] ?? 0, 4)} mol/L
                </span>
              </div>
            ))}
            <button
              type="button"
              className={styles.calcBtn}
              onClick={aplicarEquilibrioPredicho}
              style={{ marginTop: '0.75rem' }}
            >
              Aplicar nuevo equilibrio
            </button>
          </div>

          <div className={styles.mensajePedagogico} role="status">
            <strong>Le Chatelier dice:</strong> {mensaje}
          </div>

          {historialPerturbaciones.length > 0 && (
            <div className={styles.historial}>
              <h4>Historial de perturbaciones</h4>
              <ol>
                {historialPerturbaciones.map((p, i) => (
                  <li key={i}>{p.descripcion}</li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* ---------------------------------------------- Casos para clase */}
        <section className={styles.aulaSection} aria-labelledby="casos-para-clase">
          <h2 id="casos-para-clase" className={styles.aulaTitulo}>
            <span aria-hidden="true">📝</span> Casos para clase
          </h2>
          <p className={styles.aulaIntro}>
            Son <strong>12 casos fijos</strong>: el caso 3 es el mismo para todo el mundo, hoy y
            dentro de un año, con los mismos números y la misma solución. Por eso se pueden asignar
            por número —«resuelve el 3, el 7 y el 11»— y corregir igual para todo el grupo.
          </p>
          <p className={styles.aulaConvenio}>
            <span aria-hidden="true">⚖️</span> <strong>Dos avisos de convenio</strong>, porque
            cambian el resultado: en el cociente <strong>solo entran gases y especies en
            disolución</strong> —los sólidos y los líquidos puros no—, con la excepción de la
            esterificación, que al ser toda líquida se trata como una disolución y entonces sí
            cuentan sus cuatro especies; y <strong>Δn se cuenta solo sobre moles de gas</strong>,
            que es lo que decide si comprimir desplaza algo. Las Kc de este simulador son{' '}
            <strong>didácticas</strong>, elegidas para que la simulación se vea, no constantes
            tabuladas.
          </p>
          <p className={styles.aulaConvenio}>
            <span aria-hidden="true">🔮</span> <strong>Los casos 7 a 12 se responden antes de
            tocar nada.</strong> Elige hacia dónde crees que se moverá el equilibrio, comprueba, y
            solo entonces vuelve al simulador a verlo. Mover un control y mirar la gráfica no
            enseña nada si no había una predicción que confirmar o romper.
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
                      {caso.tipo === 'prediccion' ? 'Predicción' : 'Cálculo'}
                    </span>
                  </div>

                  <p className={styles.aulaEcuacion}>{caso.ecuacion}</p>
                  <p className={styles.aulaEnunciado}>{caso.enunciado}</p>

                  {caso.tipo === 'numerico' ? (
                    <div className={styles.aulaRespuesta}>
                      <label
                        className={styles.aulaEtiquetaCampo}
                        htmlFor={`respuesta-caso-${caso.id}`}
                      >
                        {caso.etiquetaRespuesta}
                        {caso.requiereRedondeo ? ' (redondea a 2 decimales)' : ''}
                      </label>
                      <input
                        id={`respuesta-caso-${caso.id}`}
                        className={styles.aulaCampo}
                        type="text"
                        /* `text` y no `decimal`: el Δn del caso 3 es negativo y el teclado
                           decimal de iOS no ofrece el signo menos. */
                        inputMode="text"
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
                  ) : (
                    <fieldset className={styles.aulaOpciones}>
                      <legend className={styles.aulaEtiquetaCampo}>{caso.etiquetaRespuesta}</legend>
                      {OPCIONES_DIRECCION.map((opcion) => (
                        <label key={opcion} className={styles.aulaOpcion}>
                          <input
                            type="radio"
                            name={`prediccion-${caso.id}`}
                            value={opcion}
                            checked={prediccionesElegidas[caso.id] === opcion}
                            onChange={() =>
                              setPrediccionesElegidas((previas) => ({
                                ...previas,
                                [caso.id]: opcion,
                              }))
                            }
                          />
                          <span>{TEXTO_DIRECCION[opcion]}</span>
                        </label>
                      ))}
                    </fieldset>
                  )}

                  <div className={styles.aulaAcciones}>
                    <button
                      type="button"
                      className={styles.aulaBtnPrimario}
                      onClick={() =>
                        caso.tipo === 'numerico'
                          ? comprobarCasoNumerico(caso.id, caso.respuesta)
                          : comprobarCasoPrediccion(caso.id, caso.respuesta)
                      }
                    >
                      Comprobar
                    </button>
                    <button
                      type="button"
                      className={styles.aulaBtnCargar}
                      onClick={() => abrirReaccionDelCaso(caso.datos.reaccionId)}
                    >
                      <span aria-hidden="true">⬆️</span> Abrir esta reacción en el simulador
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
                          ? caso.tipo === 'numerico'
                            ? 'Escribe una respuesta antes de comprobar.'
                            : 'Elige una de las tres opciones antes de comprobar.'
                          : veredicto.motivo === 'no-numerico'
                            ? 'Eso no es un número. Escribe solo la cifra, con coma decimal.'
                            : 'Todavía no. Despliega la solución o vuelve a intentarlo.'}
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
                        Resultado: <strong>{caso.respuestaTexto}</strong>
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <EducationalSection
          title="Guía de Equilibrio Químico"
          subtitle="Principio de Le Chatelier y constante Kc"
        >
          <h3>Tabla de Reacciones del Simulador</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Reacción</th>
                  <th>Ecuación</th>
                  <th>Kc (≈)</th>
                  <th>Tipo</th>
                  <th>Δn</th>
                  <th>Aplicación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Haber-Bosch</td>
                  <td>N₂ + 3H₂ ⇌ 2NH₃</td>
                  <td>0,5</td>
                  <td>Exotérmica</td>
                  <td>−2</td>
                  <td>Fertilizantes</td>
                </tr>
                <tr>
                  <td>Esterificación</td>
                  <td>Ácido + alcohol ⇌ éster + H₂O</td>
                  <td>4,0</td>
                  <td>Casi neutra</td>
                  <td>0</td>
                  <td>Aromas, disolventes</td>
                </tr>
                <tr>
                  <td>PCl₅</td>
                  <td>PCl₅ ⇌ PCl₃ + Cl₂</td>
                  <td>0,04</td>
                  <td>Endotérmica</td>
                  <td>+1</td>
                  <td>Síntesis cloruros</td>
                </tr>
                <tr>
                  <td>Contacto (SO₃)</td>
                  <td>2SO₂ + O₂ ⇌ 2SO₃</td>
                  <td>4,32</td>
                  <td>Exotérmica</td>
                  <td>−1</td>
                  <td>Ácido sulfúrico</td>
                </tr>
                <tr>
                  <td>NO₂/N₂O₄</td>
                  <td>2NO₂ ⇌ N₂O₄</td>
                  <td>170</td>
                  <td>Exotérmica</td>
                  <td>−1</td>
                  <td>Demostraciones de aula</td>
                </tr>
                <tr>
                  <td>Water-gas shift</td>
                  <td>CO + H₂O ⇌ CO₂ + H₂</td>
                  <td>5,0</td>
                  <td>Exotérmica</td>
                  <td>0</td>
                  <td>Producción de H₂</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de química de secundaria</h4>
              <p>
                Practica problemas típicos de Le Chatelier: añadir reactivo, cambiar T, calcular Kc.
                Usa Haber-Bosch o NO₂/N₂O₄ para entender perturbaciones clásicas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Universitario de ingeniería química</h4>
              <p>
                Visualiza por qué la industria de SO₃ trabaja a baja T y alta P, y por qué Haber-Bosch
                exige compromiso entre cinética (T alta) y termodinámica (T baja).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Profesor de secundaria</h4>
              <p>
                Proyecta el simulador en clase y aplica perturbaciones en directo. Permite a los
                estudiantes ver Q acercarse a Kc tras cada cambio.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Aficionado a la divulgación científica</h4>
              <p>
                Entiende cómo el ciclo del nitrógeno industrial (Haber) cambió la agricultura mundial
                y por qué la presión y la temperatura son palancas críticas.
              </p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué dice exactamente el Principio de Le Chatelier?</strong>
              <p>
                Si un sistema en equilibrio se perturba (cambio en concentración, temperatura o
                presión), el sistema responde desplazando el equilibrio en el sentido que minimiza
                esa perturbación.
              </p>
              <p className={styles.faqTip}>Es una regla cualitativa: predice dirección, no magnitud.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué los catalizadores no desplazan el equilibrio?</strong>
              <p>
                Un catalizador acelera por igual la reacción directa e inversa, así que se llega
                antes al equilibrio, pero la posición del equilibrio (las concentraciones finales)
                no cambia. Kc tampoco cambia.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa al cambiar la presión si Δn = 0?</strong>
              <p>
                Nada: si el número de moles de gas es igual a ambos lados, comprimir o expandir
                multiplica todas las concentraciones por el mismo factor y Q sigue igual a Kc.
                Ejemplos del simulador: water-gas shift y esterificación (líquidos puros).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo afecta la temperatura a Kc?</strong>
              <p>
                Sí cambia Kc, a diferencia de las demás perturbaciones. La ecuación de van&apos;t Hoff
                lo cuantifica: ln(K₂/K₁) = −ΔH/R · (1/T₂ − 1/T₁). En exotérmicas, subir T baja Kc.
                En endotérmicas, subir T sube Kc.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre Q y Kc?</strong>
              <p>
                Q es el cociente de reacción calculado con las concentraciones <em>actuales</em>,
                estén o no en equilibrio. Kc es el valor que toma Q <em>en el equilibrio</em>. Si
                Q&lt;Kc el sistema avanza a productos; si Q&gt;Kc retrocede a reactivos; si Q=Kc ya
                está en equilibrio.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué los sólidos y líquidos puros no aparecen en Kc?</strong>
              <p>
                Su actividad es 1 por convenio: la concentración de un sólido o de un líquido puro
                no varía aunque la cantidad cambie, porque su densidad es constante. Solo gases y
                solutos en disolución entran en la expresión de Kc.
              </p>
            </div>
          </div>

          <h3>Cómo Predecir un Desplazamiento — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Escribe la expresión de Kc</strong>
                <p>
                  Kc = [productos]^coef / [reactivos]^coef. Excluye sólidos y líquidos puros.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula Q con las concentraciones actuales</strong>
                <p>
                  Sustituye los valores reales en la fórmula. Q tendrá las mismas unidades que Kc.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Compara Q con Kc</strong>
                <p>
                  Q&lt;Kc: faltan productos, avanza a la derecha. Q&gt;Kc: sobran productos, retrocede.
                  Q=Kc: ya está en equilibrio.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Identifica la perturbación</strong>
                <p>
                  Concentración (cambia Q, no Kc), temperatura (cambia Kc), presión/volumen (cambia
                  Q en gases con Δn≠0) o catalizador (no cambia nada del equilibrio).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Aplica Le Chatelier para predecir</strong>
                <p>
                  El sistema se opone al cambio. Si añades A, lo consume. Si calientas una
                  exotérmica, va a reactivos. Si comprimes con Δn&lt;0, va a productos.
                </p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <div>
                <strong>Equilibra primero</strong>
                <p>Sin coeficientes correctos, los exponentes en Kc estarán mal y todo el cálculo será incorrecto.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Coeficientes = exponentes</strong>
                <p>El coeficiente estequiométrico de cada especie es su exponente en la expresión de Kc.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <div>
                <strong>Solo T cambia Kc</strong>
                <p>Memoriza esto: concentración, presión y catalizador NO modifican Kc. Solo la temperatura.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <div>
                <strong>Calcula Δn antes de presión</strong>
                <p>Δn = mol gases productos − mol gases reactivos. Si Δn=0, la presión no afecta.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <div>
                <strong>Usa el calor como reactivo o producto</strong>
                <p>En exotérmicas, trata el calor como producto. Subir T = añadir producto = retroceso.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <div>
                <strong>Verifica con Q vs Kc</strong>
                <p>Después de cada perturbación, comprueba que el sentido de desplazamiento corresponde a la comparación Q–Kc.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <span>Errores Frecuentes</span>
            </div>
            <ul className={styles.warningList}>
              <li>Incluir sólidos o líquidos puros en la expresión de Kc.</li>
              <li>Confundir Q con Kc al resolver problemas de predicción.</li>
              <li>Asumir que añadir un catalizador desplaza el equilibrio (no lo hace).</li>
              <li>No usar los coeficientes estequiométricos como exponentes en Kc.</li>
              <li>Aplicar el efecto de la presión en reacciones con Δn = 0 (no afecta).</li>
              <li>Confundir el efecto de la temperatura en Kc con un simple desplazamiento (T sí cambia el valor de Kc).</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-equilibrio-quimico')} />
        <ShareCard appName="simulador-equilibrio-quimico" />
      </main>

      <Footer appName="simulador-equilibrio-quimico" />
    </div>
  );
}
