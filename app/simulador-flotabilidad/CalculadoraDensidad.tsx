/**
 * Calculadora de la densidad (ρ = m/V) de simulador-flotabilidad.
 *
 * Despeja la densidad, la masa o el volumen de las otras dos magnitudes. Vive en esta app, y no
 * en una URL propia, porque «calculadora de densidad» no se teclea: medido en Bing el
 * 14/10/2026 (S0203), «densidad» suma 8.016 impresiones en 6 meses, pero son sobre todo datos
 * («densidad del agua», «del acero») y la fórmula («fórmula densidad», ~900). El simulador ya
 * tenía la tabla de densidades y el uso de aula, así que la calculadora se absorbe aquí.
 *
 * El botón «Probar si flota» lleva la densidad (y el volumen, si cabe en el deslizador) al
 * simulador de arriba: es el paso que sigue en los problemas de clase.
 */

import { useState } from 'react';
import { NumberInput } from '@/components';
import { parseSpanishNumber } from '@/lib';
import styles from './SimuladorFlotabilidad.module.css';
import {
  resolverDensidad,
  esPositivo,
  UNIDADES_MASA,
  UNIDADES_VOLUMEN,
  UNIDADES_DENSIDAD,
  type IncognitaDensidad,
  type UnidadMasa,
  type UnidadVolumen,
  type UnidadDensidad,
} from './motor';

interface Props {
  /**
   * Lleva la densidad (kg/m³) y el volumen (cm³) al simulador. Devuelve si el volumen cabía en
   * su rango; si no, el simulador se queda con el volumen que tenía.
   */
  onProbarEnSimulador: (densidadKgM3: number, volumenCm3: number) => boolean;
}

const INCOGNITAS: { id: IncognitaDensidad; nombre: string; formula: string }[] = [
  { id: 'densidad', nombre: 'Densidad', formula: 'ρ = m/V' },
  { id: 'masa', nombre: 'Masa', formula: 'm = ρ·V' },
  { id: 'volumen', nombre: 'Volumen', formula: 'V = m/ρ' },
];

const NOMBRE_UNIDAD_MASA: Record<UnidadMasa, string> = { g: 'g', kg: 'kg' };
const NOMBRE_UNIDAD_VOLUMEN: Record<UnidadVolumen, string> = { cm3: 'cm³ (mL)', L: 'L', m3: 'm³' };
const NOMBRE_UNIDAD_DENSIDAD: Record<UnidadDensidad, string> = { 'g/cm3': 'g/cm³', 'kg/m3': 'kg/m³' };

/** Cifras significativas en formato español: aquí conviven 0,0001 m³ y 19.300 kg/m³. */
function sig(valor: number, cifras = 4): string {
  return new Intl.NumberFormat('es-ES', { maximumSignificantDigits: cifras }).format(valor);
}

export default function CalculadoraDensidad({ onProbarEnSimulador }: Props) {
  // Arranca con un caso resuelto (270 g de aluminio en 100 cm³ → 2,7 g/cm³), no con la pantalla vacía
  const [incognita, setIncognita] = useState<IncognitaDensidad>('densidad');
  const [masaTexto, setMasaTexto] = useState('270');
  const [unidadMasa, setUnidadMasa] = useState<UnidadMasa>('g');
  const [volumenTexto, setVolumenTexto] = useState('100');
  const [unidadVolumen, setUnidadVolumen] = useState<UnidadVolumen>('cm3');
  const [densidadTexto, setDensidadTexto] = useState('1');
  const [unidadDensidad, setUnidadDensidad] = useState<UnidadDensidad>('g/cm3');
  const [avisoSimulador, setAvisoSimulador] = useState<string | null>(null);

  const masaSI = parseSpanishNumber(masaTexto) * UNIDADES_MASA[unidadMasa];
  const volumenSI = parseSpanishNumber(volumenTexto) * UNIDADES_VOLUMEN[unidadVolumen];
  const densidadSI = parseSpanishNumber(densidadTexto) * UNIDADES_DENSIDAD[unidadDensidad];

  const resultado = resolverDensidad(incognita, { densidad: densidadSI, masa: masaSI, volumen: volumenSI });

  const faltas: string[] = [];
  if (incognita !== 'masa' && !esPositivo(masaSI)) faltas.push('la masa (mayor que 0)');
  if (incognita !== 'volumen' && !esPositivo(volumenSI)) faltas.push('el volumen (mayor que 0)');
  if (incognita !== 'densidad' && !esPositivo(densidadSI)) faltas.push('la densidad (mayor que 0)');

  const cambiarIncognita = (nueva: IncognitaDensidad) => {
    setIncognita(nueva);
    setAvisoSimulador(null);
  };

  const probar = () => {
    if (!resultado) return;
    const volumenCm3 = resultado.volumen / UNIDADES_VOLUMEN.cm3;
    const volumenPasado = onProbarEnSimulador(resultado.densidad, volumenCm3);
    setAvisoSimulador(
      volumenPasado
        ? `Llevado al simulador: «Otra densidad» con ${sig(resultado.densidad, 6)} kg/m³ y ${sig(volumenCm3, 6)} cm³.`
        : `Llevado al simulador: «Otra densidad» con ${sig(resultado.densidad, 6)} kg/m³. El volumen (${sig(volumenCm3)} cm³) se sale del rango del simulador, de 1 a 10.000 cm³, y se queda el que había: si flota o no depende solo de las densidades.`,
    );
  };

  /** Resultado principal: la incógnita en todas sus unidades. */
  const lineaResultado = (() => {
    if (!resultado) return null;
    if (incognita === 'densidad') {
      return `ρ = ${sig(resultado.densidad / UNIDADES_DENSIDAD['g/cm3'])} g/cm³ = ${sig(resultado.densidad)} kg/m³`;
    }
    if (incognita === 'masa') {
      return `m = ${sig(resultado.masa)} kg = ${sig(resultado.masa / UNIDADES_MASA.g)} g`;
    }
    return `V = ${sig(resultado.volumen / UNIDADES_VOLUMEN.cm3)} cm³ = ${sig(resultado.volumen / UNIDADES_VOLUMEN.L)} L = ${sig(resultado.volumen)} m³`;
  })();

  /** La fórmula con los números, en el SI. */
  const lineaFormula = (() => {
    if (!resultado) return null;
    const m = `${sig(resultado.masa)} kg`;
    const v = `${sig(resultado.volumen)} m³`;
    const rho = `${sig(resultado.densidad)} kg/m³`;
    if (incognita === 'densidad') return `ρ = m/V = ${m} / ${v} = ${rho}`;
    if (incognita === 'masa') return `m = ρ·V = ${rho} · ${v} = ${m}`;
    return `V = m/ρ = ${m} / ${rho} = ${v}`;
  })();

  return (
    <section id="calculadora-densidad" className={styles.panel} aria-labelledby="titulo-densidad">
      <h2 id="titulo-densidad" className={styles.panelTitulo}>Calculadora de densidad: ρ = m/V</h2>
      <p className={styles.densidadIntro}>
        Calcula la densidad de un objeto a partir de su masa y su volumen, o despeja la masa o el
        volumen si conoces la densidad.
      </p>

      <div className={styles.grupo} role="group" aria-labelledby="titulo-incognita">
        <h3 id="titulo-incognita" className={styles.grupoTitulo}>¿Qué quieres calcular?</h3>
        <div className={styles.presets}>
          {INCOGNITAS.map((inc) => (
            <button
              key={inc.id}
              type="button"
              className={styles.preset}
              aria-pressed={incognita === inc.id}
              onClick={() => cambiarIncognita(inc.id)}
            >
              {inc.nombre}
              <span className={styles.presetDensidad}>{inc.formula}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.densidadEntradas}>
        {incognita !== 'masa' && (
          <div className={styles.densidadFila}>
            <NumberInput
              label="Masa del objeto"
              value={masaTexto}
              onChange={setMasaTexto}
              min={0}
              placeholder="270"
            />
            <select
              className={styles.unidadSelect}
              value={unidadMasa}
              onChange={(e) => setUnidadMasa(e.target.value as UnidadMasa)}
              aria-label="Unidad de la masa"
            >
              {(Object.keys(UNIDADES_MASA) as UnidadMasa[]).map((u) => (
                <option key={u} value={u}>{NOMBRE_UNIDAD_MASA[u]}</option>
              ))}
            </select>
          </div>
        )}
        {incognita !== 'volumen' && (
          <div className={styles.densidadFila}>
            <NumberInput
              label="Volumen del objeto"
              value={volumenTexto}
              onChange={setVolumenTexto}
              min={0}
              placeholder="100"
            />
            <select
              className={styles.unidadSelect}
              value={unidadVolumen}
              onChange={(e) => setUnidadVolumen(e.target.value as UnidadVolumen)}
              aria-label="Unidad del volumen"
            >
              {(Object.keys(UNIDADES_VOLUMEN) as UnidadVolumen[]).map((u) => (
                <option key={u} value={u}>{NOMBRE_UNIDAD_VOLUMEN[u]}</option>
              ))}
            </select>
          </div>
        )}
        {incognita !== 'densidad' && (
          <div className={styles.densidadFila}>
            <NumberInput
              label="Densidad del objeto"
              value={densidadTexto}
              onChange={setDensidadTexto}
              min={0}
              placeholder="1"
            />
            <select
              className={styles.unidadSelect}
              value={unidadDensidad}
              onChange={(e) => setUnidadDensidad(e.target.value as UnidadDensidad)}
              aria-label="Unidad de la densidad"
            >
              {(Object.keys(UNIDADES_DENSIDAD) as UnidadDensidad[]).map((u) => (
                <option key={u} value={u}>{NOMBRE_UNIDAD_DENSIDAD[u]}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div role="status" aria-live="polite" className={styles.densidadResultado}>
        {resultado ? (
          <>
            <p className={styles.densidadValor}>{lineaResultado}</p>
            <p className={styles.formulaLinea}><code>{lineaFormula}</code></p>
          </>
        ) : (
          <div className={styles.faltan}>
            <strong>Faltan datos para calcular.</strong>
            <p>Escribe {faltas.join(' y ')}.</p>
          </div>
        )}
      </div>

      {resultado && (
        <div className={styles.densidadAcciones}>
          <button type="button" className={styles.botonProbar} onClick={probar}>
            Probar si flota en el simulador
          </button>
          {avisoSimulador && <p className={styles.nota}>{avisoSimulador}</p>}
        </div>
      )}

      <p className={styles.nota}>
        Equivalencias: 1 g/cm³ = 1 g/mL = 1 kg/L = 1000 kg/m³ · 1 cm³ = 1 mL · 1 L = 1000 cm³.
      </p>
    </section>
  );
}
