'use client';

/**
 * Reparto del IBI y de la comunidad del periodo de la escritura entre vendedor y comprador.
 * Se monta en las siete apps de gastos de compraventa (semilla S0195, 11/10/2026): una sola
 * pieza para las siete, porque la familia ya demostró que la lógica copiada siete veces se
 * repara en una y sigue rota en las otras seis (cabecera de tests/familias/compraventa.spec.ts).
 *
 * Invariante de la familia que cumple también este bloque: un importe ILEGIBLE no es un cero.
 * Si «Cuota anual del IBI» o «Cuota de comunidad» no se entienden, el bloque lo nombra y no
 * publica ningún reparto; un campo VACÍO simplemente no se reparte.
 */

import { useMemo, useState } from 'react';
import NumberInput from './NumberInput';
import styles from './ProrrateoIbiComunidad.module.css';
import { formatNumber, parseSpanishNumber } from '@/lib';
import {
  leerFechaISO,
  repartoComunidad,
  repartoIbi,
  type Fecha,
  type Periodicidad,
  type Reparto,
} from '@/lib/calculadoras/prorrateoCompraventa';

interface Props {
  /** Solar y finca rústica no suelen tener comunidad de propietarios */
  conComunidad?: boolean;
}

const PERIODOS: { valor: Periodicidad; texto: string }[] = [
  { valor: 'mensual', texto: 'Mensual' },
  { valor: 'trimestral', texto: 'Trimestral' },
  { valor: 'semestral', texto: 'Semestral' },
  { valor: 'anual', texto: 'Anual' },
];

const fmtEuro = (n: number) => `${formatNumber(n, 2)} €`;
const fmtFecha = (f: Fecha) => `${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')}/${f.anio}`;

type Lectura =
  | { estado: 'vacio' }
  | { estado: 'ilegible' }
  | { estado: 'negativo' }
  | { estado: 'ok'; valor: number };

/**
 * Una cuota negativa SE LEE y es imposible: no es ilegible, y decirle «No se entiende el
 * importe… escríbelo como 450» a quien escribió «-450» no le dice qué falla (patrón 5 de la
 * familia, «no falta, no vale»; hallazgo 3240, 20/10/2026).
 */
function leerImporte(texto: string): Lectura {
  if (texto.trim() === '') return { estado: 'vacio' };
  const n = parseSpanishNumber(texto);
  if (!Number.isFinite(n)) return { estado: 'ilegible' };
  if (n < 0) return { estado: 'negativo' };
  return { estado: 'ok', valor: n };
}

/** Al céntimo, como lo pinta `fmtEuro`: el total suma las líneas que se ven (hallazgo 3239). */
const alCentimo = (n: number) => Math.round(n * 100) / 100;

export default function ProrrateoIbiComunidad({ conComunidad = true }: Props) {
  const [fecha, setFecha] = useState('');
  const [ibi, setIbi] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [periodicidad, setPeriodicidad] = useState<Periodicidad>('mensual');

  const resultado = useMemo(() => {
    const lecturaIbi = leerImporte(ibi);
    const lecturaCom = conComunidad ? leerImporte(comunidad) : ({ estado: 'vacio' } as Lectura);
    const ilegibles = [
      lecturaIbi.estado === 'ilegible' ? '«Cuota anual del IBI»' : null,
      lecturaCom.estado === 'ilegible' ? '«Cuota de comunidad»' : null,
    ].filter((x): x is string => x !== null);
    const negativos = [
      lecturaIbi.estado === 'negativo' ? '«Cuota anual del IBI»' : null,
      lecturaCom.estado === 'negativo' ? '«Cuota de comunidad»' : null,
    ].filter((x): x is string => x !== null);
    if (ilegibles.length > 0 || negativos.length > 0) {
      const frases = [
        ilegibles.length > 0
          ? `No se entiende el importe de ${ilegibles.join(' y ')}: escríbelo como 450 o 450,80.`
          : null,
        negativos.length > 0
          ? `${negativos.length > 1 ? `${negativos.join(' y ')} no pueden ser negativas` : `${negativos[0]} no puede ser negativa`}: escribe el importe sin signo menos.`
          : null,
      ].filter((x): x is string => x !== null);
      return {
        tipo: 'error' as const,
        texto: `${frases.join(' ')} Hasta corregirlo no se reparte nada, para no publicar una cifra calculada con un importe equivocado.`,
      };
    }
    if (lecturaIbi.estado === 'vacio' && lecturaCom.estado === 'vacio') return { tipo: 'nada' as const };
    const f = leerFechaISO(fecha);
    // Hallazgo 3266 (19/10/2026): una fecha ESCRITA pero imposible (el año tecleado en dos
    // cifras deja el campo en 13/10/0026) caía al estado «sin fecha» y se pedía como si faltara,
    // con la fecha a la vista. No falta: no vale, y así se dice («no falta, no vale»).
    if (!f) return fecha.trim() !== '' ? { tipo: 'fechaNoValida' as const } : { tipo: 'sinFecha' as const };
    const filas: { concepto: string; r: Reparto }[] = [];
    if (lecturaIbi.estado === 'ok') filas.push({ concepto: 'IBI del año', r: repartoIbi(lecturaIbi.valor, f) });
    if (lecturaCom.estado === 'ok')
      filas.push({ concepto: `Comunidad (cuota ${periodicidad})`, r: repartoComunidad(lecturaCom.valor, periodicidad, f) });
    // Suma las líneas AL CÉNTIMO, como se pintan: sin redondear, 297,2055 + 41,5385 daba 338,74 €
    // bajo dos líneas de 297,21 y 41,54 (hallazgo 3239, la familia del 594).
    const totalComprador = alCentimo(filas.reduce((s, x) => s + alCentimo(x.r.importeComprador), 0));
    return { tipo: 'ok' as const, filas, totalComprador, fecha: f };
  }, [fecha, ibi, comunidad, periodicidad, conComunidad]);

  return (
    <section className={styles.bloque} aria-labelledby="titulo-prorrateo">
      <h2 id="titulo-prorrateo" className={styles.titulo}>
        <span aria-hidden="true">📅</span> Reparto del IBI{conComunidad ? ' y la comunidad' : ''} el año de la venta
      </h2>
      <p className={styles.intro}>
        El IBI lo debe quien es propietario el <strong>1 de enero</strong>, normalmente el vendedor, que paga el
        recibo de todo el año. Salvo pacto en contrario, puede repercutir al comprador la parte de los días en que
        este ya es dueño (Tribunal Supremo, sentencia 409/2016, de 15 de junio).
        {conComunidad && ' Con la comunidad se suele hacer lo mismo, por días del periodo de la cuota.'}
      </p>

      <div className={styles.campos}>
        <label className={styles.campoFecha}>
          <span className={styles.etiqueta}>Fecha de la escritura</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={styles.inputFecha} />
        </label>
        <NumberInput
          value={ibi}
          onChange={setIbi}
          label="Cuota anual del IBI"
          suffix="€"
          min={0}
          acotarAlSalir={false}
          helperText="El importe del último recibo"
        />
        {conComunidad && (
          <div className={styles.grupoComunidad}>
            <NumberInput
              value={comunidad}
              onChange={setComunidad}
              label="Cuota de comunidad"
              suffix="€"
              min={0}
              acotarAlSalir={false}
              helperText="Déjalo vacío si no hay comunidad"
            />
            <label className={styles.campoSelect}>
              <span className={styles.etiqueta}>Se paga</span>
              <select
                value={periodicidad}
                onChange={(e) => setPeriodicidad(e.target.value as Periodicidad)}
                className={styles.select}
              >
                {PERIODOS.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.texto}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      {resultado.tipo === 'error' && (
        <div role="alert" className={styles.error}>
          {resultado.texto}
        </div>
      )}
      {resultado.tipo === 'sinFecha' && <p className={styles.nota}>Indica la fecha de la escritura para repartir los días.</p>}
      {resultado.tipo === 'fechaNoValida' && (
        <div role="alert" className={styles.error}>
          La fecha de la escritura no es válida: el año tiene que ir con sus cuatro cifras, entre 1900 y
          2200. Hasta corregirla no se reparte nada.
        </div>
      )}
      {resultado.tipo === 'ok' && (
        <>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <caption className={styles.srOnly}>
                Días e importe que corresponden a vendedor y comprador, con escritura el {fmtFecha(resultado.fecha)}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Concepto</th>
                  <th scope="col">Periodo</th>
                  <th scope="col">Vendedor</th>
                  <th scope="col">Comprador</th>
                </tr>
              </thead>
              <tbody>
                {resultado.filas.map(({ concepto, r }) => (
                  <tr key={concepto}>
                    <td>{concepto}</td>
                    <td>
                      {fmtFecha(r.inicio)} – {fmtFecha(r.fin)}
                    </td>
                    <td>
                      {fmtEuro(r.importeVendedor)}
                      <span className={styles.dias}> · {r.diasVendedor} días</span>
                    </td>
                    <td>
                      {fmtEuro(r.importeComprador)}
                      <span className={styles.dias}> · {r.diasComprador} días</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.total}>
            Si el vendedor paga los recibos, el comprador le abona en la firma{' '}
            <strong>{fmtEuro(resultado.totalComprador)}</strong>.
          </p>
          <p className={styles.nota}>
            El vendedor cuenta hasta el día anterior a la escritura y el comprador desde ese día. El reparto se puede
            pactar de otra manera en el contrato de arras o en la escritura: si hay pacto, manda el pacto.
          </p>
        </>
      )}
    </section>
  );
}
