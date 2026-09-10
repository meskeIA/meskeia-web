'use client';
// @disclaimer: exempt

import { useState, useCallback, useMemo } from 'react';
import styles from './CalculadoraPorcentajePanadero.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularBakersPercentage,
  calcularBakersPercentageDesdePeso,
  calcularDDT,
  type ResultadoBakersPercentage,
  type TipoAmasadora,
} from '@/lib/calculadoras/cocina';
import {
  ajustarFermentacion,
  formatearTiempo,
} from '@/lib/calculadoras/fermentacionTemperatura';

interface OtroIngrediente {
  id: number;
  nombre: string;
  valor: string;
  // Un prefermento no es un ingrediente simple: es harina y agua ya mezcladas, y las dos
  // mitades cuentan en la fórmula. `prefTocado` recuerda que la decisión la tomó el usuario,
  // para que la detección automática por el nombre no la pise al seguir escribiendo.
  esPrefermento: boolean;
  hidratacionPref: string;
  prefTocado: boolean;
}

type ModoCalculo = 'gramos' | 'porcentaje';

// La hidratación más habitual (masa madre líquida, poolish). La biga o una madre firme van
// al 50-60 %, y por eso el campo queda siempre a la vista y editable.
const HIDRATACION_PREF_DEFECTO = '100';

// Nombres que delatan un prefermento. La detección importa porque el fallo era silencioso:
// quien escribe «Masa madre» en la lista no tiene ningún motivo para sospechar que la
// hidratación que le sale abajo no cuenta la harina ni el agua que esa masa madre lleva dentro.
const NOMBRE_DE_PREFERMENTO = /masa\s*madre|madre\s*natural|prefermento|pre-?fermento|poolish|biga|esponja|levain|sourdough|starter|fermento|masa\s*vieja|pie\s*de\s*masa/i;

const parecePrefermento = (nombre: string) => NOMBRE_DE_PREFERMENTO.test(nombre);

const nuevoIngrediente = (id: number, nombre: string, valor: string): OtroIngrediente => ({
  id, nombre, valor,
  esPrefermento: false,
  hidratacionPref: HIDRATACION_PREF_DEFECTO,
  prefTocado: false,
});

// Modo 'gramos' (por defecto): se parte de gramos por ingrediente y se obtienen los porcentajes.
const INGREDIENTES_POR_GRAMOS: OtroIngrediente[] = [
  nuevoIngrediente(1, 'Agua', '650'),
  nuevoIngrediente(2, 'Sal', '20'),
  nuevoIngrediente(3, 'Levadura', '3'),
];

// Modo 'porcentaje': se parte de los porcentajes de la fórmula y de un peso final de masa
// (un molde, una bandeja) y se obtienen los gramos — el camino inverso al de arriba.
const INGREDIENTES_POR_PORCENTAJE: OtroIngrediente[] = [
  nuevoIngrediente(1, 'Agua', '65'),
  nuevoIngrediente(2, 'Sal', '2'),
  nuevoIngrediente(3, 'Levadura', '0,3'),
];

// Los dos pasos que vienen justo después de tener la fórmula: a qué temperatura poner el agua
// y cuánto va a tardar en fermentar hoy. El cálculo NO se reimplementa aquí: son los mismos
// motores que usan /calculadora-temperatura-masa/ y /fermentacion-temperatura/, que siguen
// siendo la página de quien busca esas dos cosas por su nombre.
const AMASADOS: { id: TipoAmasadora; label: string }[] = [
  { id: 'manual', label: 'A mano (sin fricción)' },
  { id: 'amasadora_espiral', label: 'Amasadora espiral (+5 °C)' },
  { id: 'kitchen_aid', label: 'Amasadora de pie / KitchenAid (+8 °C)' },
  { id: 'thermomix', label: 'Thermomix o robot de cocción (+12 °C)' },
];

// Campo vacío o no numérico → null, para distinguirlo de un 0 legítimo (0 °C es una temperatura).
function leerNumero(valor: string): number | null {
  if (!valor.trim()) return null;
  const n = parseSpanishNumber(valor);
  return Number.isFinite(n) ? n : null;
}

export default function CalculadoraPorcentajePanaderoPage() {
  const [modo, setModo] = useState<ModoCalculo>('gramos');
  const [harinaStr, setHarinaStr] = useState('1000');
  const [otros, setOtros] = useState<OtroIngrediente[]>(INGREDIENTES_POR_GRAMOS);
  const [porcioStr, setPorcioStr] = useState('');
  const [resultado, setResultado] = useState<ResultadoBakersPercentage | null>(null);
  const [objetivoCalculado, setObjetivoCalculado] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [nextId, setNextId] = useState(10);

  const cambiarModo = useCallback((nuevoModo: ModoCalculo) => {
    if (nuevoModo === modo) return;
    setModo(nuevoModo);
    setHarinaStr('1000');
    setOtros(nuevoModo === 'gramos' ? INGREDIENTES_POR_GRAMOS : INGREDIENTES_POR_PORCENTAJE);
    setPorcioStr('');
    setResultado(null);
    setObjetivoCalculado(null);
    setError('');
  }, [modo]);

  // ── Paso 2: temperatura del agua de amasado (DDT) ──
  const [ddtAbierto, setDdtAbierto] = useState(false);
  const [ddtObjetivo, setDdtObjetivo] = useState('24');
  const [tAmbiente, setTAmbiente] = useState('22');
  const [tHarina, setTHarina] = useState('');
  const [harinaComoAmbiente, setHarinaComoAmbiente] = useState(true);
  const [amasado, setAmasado] = useState<TipoAmasadora>('manual');

  // ── Paso 3: cuánto tarda en fermentar a la temperatura real ──
  const [fermAbierto, setFermAbierto] = useState(false);
  const [fermHoras, setFermHoras] = useState('2');
  const [fermTempReceta, setFermTempReceta] = useState('24');
  const [fermTempReal, setFermTempReal] = useState('22');

  const resultadoDDT = useMemo(() => {
    const ddt = leerNumero(ddtObjetivo);
    const ambiente = leerNumero(tAmbiente);
    if (ddt === null || ambiente === null) return null;
    const harina = harinaComoAmbiente ? ambiente : leerNumero(tHarina);
    if (harina === null) return null;
    return calcularDDT(ddt, ambiente, harina, amasado);
  }, [ddtObjetivo, tAmbiente, tHarina, harinaComoAmbiente, amasado]);

  const resultadoFermentacion = useMemo(() => {
    const horas = leerNumero(fermHoras);
    const tempReceta = leerNumero(fermTempReceta);
    const tempReal = leerNumero(fermTempReal);
    if (horas === null || horas <= 0 || tempReceta === null || tempReal === null) return null;
    return ajustarFermentacion(horas, tempReceta, tempReal);
  }, [fermHoras, fermTempReceta, fermTempReal]);

  const agregarIngrediente = useCallback(() => {
    setOtros(prev => [...prev, nuevoIngrediente(nextId, '', '')]);
    setNextId(n => n + 1);
  }, [nextId]);

  const quitarIngrediente = useCallback((id: number) => {
    setOtros(prev => prev.filter(i => i.id !== id));
  }, []);

  const actualizarIngrediente = useCallback(
    (id: number, campo: 'nombre' | 'valor', valor: string) => {
      setOtros(prev =>
        prev.map(i => {
          if (i.id !== id) return i;
          const actualizado = { ...i, [campo]: valor };
          // Al escribir el nombre se marca solo si delata un prefermento, salvo que el
          // usuario ya haya decidido por su cuenta. Marcarlo por defecto, y no limitarse a
          // avisar, es lo que evita que siga saliendo una hidratación que no es la real.
          if (campo === 'nombre' && !i.prefTocado) {
            actualizado.esPrefermento = parecePrefermento(valor);
          }
          return actualizado;
        }),
      );
    },
    [],
  );

  const alternarPrefermento = useCallback((id: number) => {
    setOtros(prev =>
      prev.map(i =>
        i.id === id ? { ...i, esPrefermento: !i.esPrefermento, prefTocado: true } : i,
      ),
    );
  }, []);

  const actualizarHidratacionPref = useCallback((id: number, valor: string) => {
    setOtros(prev => prev.map(i => (i.id === id ? { ...i, hidratacionPref: valor } : i)));
  }, []);

  const calcular = useCallback(() => {
    setError('');
    const valorPrincipal = parseSpanishNumber(harinaStr);
    if (!valorPrincipal || valorPrincipal <= 0) {
      setError(
        modo === 'gramos'
          ? 'Introduce un peso de harina válido (mayor que 0).'
          : 'Introduce un peso final de masa válido (mayor que 0).',
      );
      return;
    }

    const otrosValidos = otros
      .filter(i => i.nombre.trim() !== '' && i.valor.trim() !== '')
      .map(i => {
        const valor = parseSpanishNumber(i.valor);
        // Un prefermento sin hidratación legible se trata al 100 %, que es su valor por
        // defecto y el que se muestra en el campo: nunca se cuela como ingrediente plano.
        const hidratacion = i.esPrefermento
          ? (leerNumero(i.hidratacionPref) ?? 100)
          : undefined;
        return {
          nombre: i.nombre.trim(),
          valor: valor > 0 ? valor : 0,
          prefermentoHidratacion_pct: hidratacion !== undefined && hidratacion >= 0
            ? hidratacion
            : undefined,
        };
      });

    if (otrosValidos.length === 0) {
      setError(
        modo === 'gramos'
          ? 'Añade al menos un ingrediente además de la harina.'
          : 'Añade al menos un ingrediente con su porcentaje.',
      );
      return;
    }

    const porcion = porcioStr.trim() ? parseSpanishNumber(porcioStr) : undefined;
    const pesoPorcionValido = porcion && porcion > 0 ? porcion : undefined;

    if (modo === 'gramos') {
      setObjetivoCalculado(null);
      setResultado(
        calcularBakersPercentage(
          valorPrincipal,
          otrosValidos.map(i => ({
            nombre: i.nombre,
            gramos: i.valor,
            prefermentoHidratacion_pct: i.prefermentoHidratacion_pct,
          })),
          pesoPorcionValido,
        ),
      );
    } else {
      setObjetivoCalculado(valorPrincipal);
      setResultado(
        calcularBakersPercentageDesdePeso(
          valorPrincipal,
          otrosValidos.map(i => ({
            nombre: i.nombre,
            porcentaje: i.valor,
            prefermentoHidratacion_pct: i.prefermentoHidratacion_pct,
          })),
          pesoPorcionValido,
        ),
      );
    }
  }, [harinaStr, otros, porcioStr, modo]);

  const hayPrefermentos = (resultado?.prefermentos.length ?? 0) > 0;

  // Con la fórmula total mal planteada puede no quedar agua (o harina) que pesar aparte.
  const formulaImposible = hayPrefermentos && resultado !== null
    && (resultado.aguaAnadida_g < 0 || resultado.harinaAnadida_g < 0);

  // La cifra que salía antes de contar el prefermento. Se enseña al lado de la buena porque
  // es la que el usuario ha visto en todas partes, y sin el contraste no sabría cuál creer.
  const hidratacionSinContarPrefermento = useMemo(() => {
    if (!resultado || !hayPrefermentos || resultado.harinaAnadida_g <= 0) return 0;
    return Math.round((resultado.aguaAnadida_g / resultado.harinaAnadida_g) * 1000) / 10;
  }, [resultado, hayPrefermentos]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🍞</span> Porcentaje del Panadero</h1>
        <p className={styles.subtitle}>
          Calcula el baker&apos;s percentage de tu receta: cada ingrediente como porcentaje del peso de la harina
        </p>
      </header>

      <LegalNotice />

      {/* Herramienta principal */}
      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Ingredientes de la receta</h2>

          {/* Modo: de gramos a porcentaje (por defecto) o de porcentaje a gramos (inverso) */}
          <div className={styles.modoToggle} role="group" aria-label="Modo de cálculo">
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'gramos' ? styles.modoBtnActivo : ''}`}
              aria-pressed={modo === 'gramos'}
              onClick={() => cambiarModo('gramos')}
            >
              Por gramos
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'porcentaje' ? styles.modoBtnActivo : ''}`}
              aria-pressed={modo === 'porcentaje'}
              onClick={() => cambiarModo('porcentaje')}
            >
              Por peso final de masa
            </button>
          </div>

          {/* Harina (modo gramos) o peso final de masa objetivo (modo porcentaje) */}
          <div className={styles.harinaRow}>
            <div className={styles.harinaLabel}>
              {modo === 'gramos' && <span className={styles.harinaBadge}>100%</span>}
              <label htmlFor="harina" className={styles.fieldLabel}>
                {modo === 'gramos' ? 'Harina (base)' : 'Peso final de masa'}
              </label>
            </div>
            <div className={styles.inputGroup}>
              <input
                id="harina"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={harinaStr}
                onChange={e => setHarinaStr(e.target.value)}
                placeholder="1000"
                aria-label={
                  modo === 'gramos'
                    ? 'Peso de la harina en gramos'
                    : 'Peso final de la masa en gramos'
                }
              />
              <span className={styles.unidad}>g</span>
            </div>
          </div>

          {modo === 'porcentaje' && (
            <p className={styles.modoAyuda}>
              Introduce el porcentaje de cada ingrediente respecto a la harina (el mismo que
              verías en modo &quot;Por gramos&quot;) y la calculadora reparte los gramos para que
              la masa dé justo ese peso final.
              {otros.some(i => i.esPrefermento) && (
                <>
                  {' '}Con prefermento, el agua que declares es el <strong>agua total</strong> de
                  la fórmula: abajo verás cuánta hay que pesar aparte una vez descontada la que
                  ya viene dentro del prefermento.
                </>
              )}
            </p>
          )}

          {/* Otros ingredientes */}
          <div className={styles.ingredientesList} role="list" aria-label="Lista de ingredientes">
            {otros.map(ing => (
              <div key={ing.id} className={styles.ingredienteBloque} role="listitem">
                <div className={styles.ingredienteRow}>
                  <input
                    type="text"
                    className={styles.inputNombre}
                    value={ing.nombre}
                    onChange={e => actualizarIngrediente(ing.id, 'nombre', e.target.value)}
                    placeholder="Ingrediente"
                    aria-label="Nombre del ingrediente"
                  />
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      inputMode="decimal"
                      className={styles.inputField}
                      value={ing.valor}
                      onChange={e => actualizarIngrediente(ing.id, 'valor', e.target.value)}
                      placeholder="0"
                      aria-label={
                        modo === 'gramos'
                          ? `Gramos de ${ing.nombre || 'ingrediente'}`
                          : `Porcentaje de ${ing.nombre || 'ingrediente'}`
                      }
                    />
                    <span className={styles.unidad}>{modo === 'gramos' ? 'g' : '%'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alternarPrefermento(ing.id)}
                    className={`${styles.btnPrefermento} ${ing.esPrefermento ? styles.btnPrefermentoActivo : ''}`}
                    aria-pressed={ing.esPrefermento}
                    aria-label={`Tratar ${ing.nombre || 'este ingrediente'} como prefermento (lleva harina y agua dentro)`}
                    title="Prefermento: lleva harina y agua dentro"
                  >
                    🫧
                  </button>
                  <button
                    type="button"
                    onClick={() => quitarIngrediente(ing.id)}
                    className={styles.btnQuitar}
                    aria-label={`Eliminar ${ing.nombre || 'ingrediente'}`}
                  >
                    ✕
                  </button>
                </div>

                {ing.esPrefermento && (
                  <div className={styles.prefermentoRow}>
                    <label htmlFor={`hidr-pref-${ing.id}`} className={styles.prefermentoLabel}>
                      <span aria-hidden="true">🫧</span> Hidratación de este prefermento
                    </label>
                    <div className={styles.inputGroup}>
                      <input
                        id={`hidr-pref-${ing.id}`}
                        type="text"
                        inputMode="decimal"
                        className={styles.inputFieldPref}
                        value={ing.hidratacionPref}
                        onChange={e => actualizarHidratacionPref(ing.id, e.target.value)}
                        placeholder="100"
                        aria-label={`Hidratación de ${ing.nombre || 'el prefermento'} en porcentaje`}
                      />
                      <span className={styles.unidad}>%</span>
                    </div>
                    <p className={styles.prefermentoAyuda}>
                      Se contará su harina y su agua aparte. Masa madre líquida o poolish: 100 %.
                      Biga o madre firme: 50-60 %.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={agregarIngrediente} className={styles.btnAgregar}>
            + Añadir ingrediente
          </button>

          {/* Porción opcional */}
          <div className={styles.porcionRow}>
            <label htmlFor="porcion" className={styles.fieldLabel}>
              Peso por porción (opcional)
            </label>
            <div className={styles.inputGroup}>
              <input
                id="porcion"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={porcioStr}
                onChange={e => setPorcioStr(e.target.value)}
                placeholder="—"
                aria-label="Peso por porción en gramos"
              />
              <span className={styles.unidad}>g</span>
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              {error}
            </div>
          )}

          <button type="button" onClick={calcular} className={styles.btnPrimary}>
            Calcular porcentajes
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>Resultados</h2>

          {!resultado && (
            <p className={styles.emptyState}>
              Introduce los ingredientes y pulsa <strong>Calcular</strong> para ver los porcentajes del panadero.
            </p>
          )}

          {resultado && (
            <>
              {/* Resumen rápido */}
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Peso total de la masa</span>
                  <span className={styles.summaryValue}>{formatNumber(resultado.pesoMasa_g, 0)} g</span>
                  {objetivoCalculado !== null &&
                    Math.round(resultado.pesoMasa_g) !== Math.round(objetivoCalculado) && (
                      <span className={styles.summaryNote}>
                        objetivo: {formatNumber(objetivoCalculado, 0)} g
                      </span>
                    )}
                </div>
                <div className={`${styles.summaryCard} ${styles.summaryHidratacion}`}>
                  <span className={styles.summaryLabel}>
                    {hayPrefermentos ? 'Hidratación total' : 'Hidratación'}
                  </span>
                  <span className={styles.summaryValue}>
                    {resultado.hidratacion_pct > 0
                      ? `${formatNumber(resultado.hidratacion_pct, 1)} %`
                      : '—'}
                  </span>
                  {hayPrefermentos && (
                    <span className={styles.summaryNote}>prefermento incluido</span>
                  )}
                </div>
                {hayPrefermentos && (
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Harina prefermentada</span>
                    <span className={styles.summaryValue}>
                      {formatNumber(resultado.harinaPrefermentada_pct, 1)} %
                    </span>
                  </div>
                )}
                {resultado.rendimiento_porciones !== undefined && (
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Porciones</span>
                    <span className={styles.summaryValue}>{resultado.rendimiento_porciones}</span>
                  </div>
                )}
              </div>

              {formulaImposible && (
                <div role="alert" aria-live="polite" className={styles.errorMsg}>
                  El prefermento aporta por sí solo más{' '}
                  {resultado.aguaAnadida_g < 0 ? 'agua' : 'harina'} de la que declara la fórmula
                  total, así que no queda nada que pesar aparte. Sube el porcentaje de{' '}
                  {resultado.aguaAnadida_g < 0 ? 'agua' : 'harina'} o baja el del prefermento.
                </div>
              )}

              {/* Tabla de porcentajes */}
              <div className={styles.tableWrapper} role="region" aria-label="Tabla de porcentajes del panadero">
                <table className={styles.table}>
                  <caption className={styles.tableCaption}>
                    {hayPrefermentos ? 'Fórmula total (la harina de dentro del prefermento ya cuenta)' : 'Fórmula'}
                  </caption>
                  <thead>
                    <tr>
                      <th>Ingrediente</th>
                      <th>Gramos</th>
                      <th>% Panadero</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Harina siempre primero */}
                    <tr className={styles.rowHarina}>
                      <td>
                        <span aria-hidden="true">🌾</span> Harina{hayPrefermentos ? ' (total)' : ''}
                      </td>
                      <td>{formatNumber(resultado.harina_g, 0)} g</td>
                      <td className={styles.pct}>100,0 %</td>
                    </tr>

                    {/* Con prefermento el agua se consolida: la de la jarra más la que ya
                        viene mezclada dentro. Es la única cifra que responde de verdad
                        «¿qué hidratación tiene esta masa?». */}
                    {hayPrefermentos && resultado.agua_g > 0 && (
                      <tr className={styles.rowAgua}>
                        <td><span aria-hidden="true">💧</span> Agua (total)</td>
                        <td>{formatNumber(resultado.agua_g, 0)} g</td>
                        <td className={styles.pct}>{formatNumber(resultado.hidratacion_pct, 1)} %</td>
                      </tr>
                    )}

                    {resultado.ingredientes
                      .filter(ing => !hayPrefermentos
                        || (ing.prefermentoHidratacion_pct === undefined && !/agua/i.test(ing.nombre)))
                      .map((ing, idx) => {
                        const esAgua = /agua/i.test(ing.nombre);
                        return (
                          <tr
                            key={idx}
                            className={esAgua ? styles.rowAgua : styles.rowNormal}
                          >
                            <td><span aria-hidden="true">{esAgua ? '💧' : '•'}</span> {ing.nombre}</td>
                            <td>{formatNumber(ing.gramos, 0)} g</td>
                            <td className={styles.pct}>{formatNumber(ing.porcentajePanadero, 1)} %</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Lo que va en la balanza. Solo con prefermento: sin él, la fórmula total y la
                  lista de la compra son la misma tabla y repetirla no aportaría nada. */}
              {hayPrefermentos && (
                <div className={styles.tableWrapper} role="region" aria-label="Lo que se pesa en la balanza">
                  <table className={styles.table}>
                    <caption className={styles.tableCaption}>
                      Lo que pesas en la balanza
                    </caption>
                    <thead>
                      <tr>
                        <th>Ingrediente</th>
                        <th>Gramos</th>
                        <th>Aporta</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={styles.rowHarina}>
                        <td><span aria-hidden="true">🌾</span> Harina</td>
                        <td>{formatNumber(resultado.harinaAnadida_g, 0)} g</td>
                        <td className={styles.aporta}>—</td>
                      </tr>
                      {resultado.agua_g > 0 && (
                        <tr className={styles.rowAgua}>
                          <td><span aria-hidden="true">💧</span> Agua</td>
                          <td>{formatNumber(resultado.aguaAnadida_g, 0)} g</td>
                          <td className={styles.aporta}>—</td>
                        </tr>
                      )}
                      {resultado.ingredientes
                        .filter(ing => ing.prefermentoHidratacion_pct === undefined && !/agua/i.test(ing.nombre))
                        .map((ing, idx) => (
                          <tr key={idx} className={styles.rowNormal}>
                            <td><span aria-hidden="true">•</span> {ing.nombre}</td>
                            <td>{formatNumber(ing.gramos, 0)} g</td>
                            <td className={styles.aporta}>—</td>
                          </tr>
                        ))}
                      {resultado.prefermentos.map((p, idx) => (
                        <tr key={`pref-${idx}`} className={styles.rowPrefermento}>
                          <td>
                            <span aria-hidden="true">🫧</span> {p.nombre}{' '}
                            <span className={styles.prefBadge}>
                              {formatNumber(p.hidratacion_pct, 0)} % hidr.
                            </span>
                          </td>
                          <td>{formatNumber(p.gramos, 0)} g</td>
                          <td className={styles.aporta}>
                            {formatNumber(p.harina_g, 0)} g harina + {formatNumber(p.agua_g, 0)} g agua
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {resultado.hidratacion_pct > 0 && (
                <div className={styles.hidratacionNote} role="note">
                  <span aria-hidden="true">💧</span> La hidratación{hayPrefermentos ? ' real' : ''} de
                  esta masa es <strong>{formatNumber(resultado.hidratacion_pct, 1)} %</strong>
                  {resultado.hidratacion_pct < 60 && ' — masa seca, fácil de moldear'}
                  {resultado.hidratacion_pct >= 60 && resultado.hidratacion_pct < 70 && ' — hidratación estándar, equilibrada'}
                  {resultado.hidratacion_pct >= 70 && resultado.hidratacion_pct < 80 && ' — hidratación alta, miga abierta'}
                  {resultado.hidratacion_pct >= 80 && ' — hidratación muy alta, técnica avanzada'}
                  {hayPrefermentos && (
                    <>
                      {' '}Contando la harina y el agua que trae dentro el prefermento: sin
                      contarlas saldría{' '}
                      <strong>{formatNumber(hidratacionSinContarPrefermento, 1)} %</strong>, que
                      es la cifra que da cualquier calculadora que trate la masa madre como un
                      ingrediente más.
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Los dos pasos siguientes de la misma sesión de amasado */}
      <section className={styles.pasosSection} aria-labelledby="pasos-titulo">
        <h2 id="pasos-titulo" className={styles.pasosTitulo}>
          Ya tienes la fórmula. Ahora, el amasado
        </h2>
        <p className={styles.pasosIntro}>
          Con los porcentajes cerrados quedan dos preguntas que deciden el pan tanto como la receta:
          a qué temperatura echar el agua y cuánto va a tardar en levar hoy, en tu cocina.
        </p>

        <div className={styles.pasosGrid}>
          {/* Paso 2 — temperatura del agua (DDT) */}
          <div className={styles.pasoCard}>
            <button
              type="button"
              className={styles.pasoToggle}
              aria-expanded={ddtAbierto}
              aria-controls="paso-ddt"
              onClick={() => setDdtAbierto(v => !v)}
            >
              <span>
                <span aria-hidden="true">🌡️</span> ¿A qué temperatura pongo el agua?
              </span>
              <span className={styles.pasoChevron} aria-hidden="true">{ddtAbierto ? '−' : '+'}</span>
            </button>

            <div id="paso-ddt" className={styles.pasoBody} hidden={!ddtAbierto}>
              <p className={styles.pasoAyuda}>
                El agua es lo único que puedes ajustar a voluntad para que la masa salga del amasado
                a la temperatura que quieres. Es la fórmula DDT (<em>desired dough temperature</em>).
              </p>

              <div className={styles.pasoCampo}>
                <label htmlFor="ddt-objetivo" className={styles.fieldLabel}>
                  Temperatura que quieres en la masa
                </label>
                <div className={styles.inputGroup}>
                  <input
                    id="ddt-objetivo"
                    type="text"
                    inputMode="decimal"
                    className={styles.inputField}
                    value={ddtObjetivo}
                    onChange={e => setDdtObjetivo(e.target.value)}
                    placeholder="24"
                  />
                  <span className={styles.unidad}>°C</span>
                </div>
              </div>

              <div className={styles.pasoCampo}>
                <label htmlFor="ddt-ambiente" className={styles.fieldLabel}>
                  Temperatura de tu cocina
                </label>
                <div className={styles.inputGroup}>
                  <input
                    id="ddt-ambiente"
                    type="text"
                    inputMode="decimal"
                    className={styles.inputField}
                    value={tAmbiente}
                    onChange={e => setTAmbiente(e.target.value)}
                    placeholder="22"
                  />
                  <span className={styles.unidad}>°C</span>
                </div>
              </div>

              <div className={styles.pasoCheck}>
                <input
                  id="ddt-harina-igual"
                  type="checkbox"
                  checked={harinaComoAmbiente}
                  onChange={e => setHarinaComoAmbiente(e.target.checked)}
                />
                <label htmlFor="ddt-harina-igual">La harina está a la temperatura de la cocina</label>
              </div>

              {!harinaComoAmbiente && (
                <div className={styles.pasoCampo}>
                  <label htmlFor="ddt-harina" className={styles.fieldLabel}>
                    Temperatura de la harina
                  </label>
                  <div className={styles.inputGroup}>
                    <input
                      id="ddt-harina"
                      type="text"
                      inputMode="decimal"
                      className={styles.inputField}
                      value={tHarina}
                      onChange={e => setTHarina(e.target.value)}
                      placeholder="18"
                    />
                    <span className={styles.unidad}>°C</span>
                  </div>
                </div>
              )}

              <div className={styles.pasoCampo}>
                <label htmlFor="ddt-amasado" className={styles.fieldLabel}>
                  Cómo amasas
                </label>
                <select
                  id="ddt-amasado"
                  className={styles.selectField}
                  value={amasado}
                  onChange={e => setAmasado(e.target.value as TipoAmasadora)}
                >
                  {AMASADOS.map(a => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>

              {resultadoDDT ? (
                <div className={styles.pasoResultado}>
                  <span className={styles.pasoResultadoLabel}>Pon el agua a</span>
                  <span className={styles.pasoResultadoValor}>
                    {formatNumber(resultadoDDT.temperatura_agua_c, 1)} °C
                  </span>
                  <p className={styles.pasoResultadoNota}>{resultadoDDT.interpretacion}</p>
                  {resultadoDDT.advertencia && (
                    <p className={styles.warningBox} role="alert">
                      <span aria-hidden="true">⚠️</span> {resultadoDDT.advertencia}
                    </p>
                  )}
                </div>
              ) : (
                <p className={styles.emptyState}>
                  Completa las temperaturas para ver el agua que necesitas.
                </p>
              )}

              <p className={styles.pasoEnlace}>
                ¿Usas prefermento (poolish, biga, masa madre madura)? Entonces la fórmula es de cuatro
                factores:{' '}
                <a href="/calculadora-temperatura-masa/">calculadora DDT completa</a>.
              </p>
            </div>
          </div>

          {/* Paso 3 — tiempo de fermentación a temperatura real */}
          <div className={styles.pasoCard}>
            <button
              type="button"
              className={styles.pasoToggle}
              aria-expanded={fermAbierto}
              aria-controls="paso-fermentacion"
              onClick={() => setFermAbierto(v => !v)}
            >
              <span>
                <span aria-hidden="true">⏳</span> ¿Cuánto va a tardar en fermentar?
              </span>
              <span className={styles.pasoChevron} aria-hidden="true">{fermAbierto ? '−' : '+'}</span>
            </button>

            <div id="paso-fermentacion" className={styles.pasoBody} hidden={!fermAbierto}>
              <p className={styles.pasoAyuda}>
                Los tiempos de una receta valen para la temperatura a la que se escribió. La actividad
                de la levadura se duplica aproximadamente cada 10 °C, así que en verano el mismo pan
                leva en la mitad de tiempo.
              </p>

              <div className={styles.pasoCampo}>
                <label htmlFor="ferm-horas" className={styles.fieldLabel}>
                  Tiempo que indica la receta
                </label>
                <div className={styles.inputGroup}>
                  <input
                    id="ferm-horas"
                    type="text"
                    inputMode="decimal"
                    className={styles.inputField}
                    value={fermHoras}
                    onChange={e => setFermHoras(e.target.value)}
                    placeholder="2"
                  />
                  <span className={styles.unidad}>h</span>
                </div>
              </div>

              <div className={styles.pasoCampo}>
                <label htmlFor="ferm-temp-receta" className={styles.fieldLabel}>
                  Temperatura para la que está pensada
                </label>
                <div className={styles.inputGroup}>
                  <input
                    id="ferm-temp-receta"
                    type="text"
                    inputMode="decimal"
                    className={styles.inputField}
                    value={fermTempReceta}
                    onChange={e => setFermTempReceta(e.target.value)}
                    placeholder="24"
                  />
                  <span className={styles.unidad}>°C</span>
                </div>
              </div>

              <div className={styles.pasoCampo}>
                <label htmlFor="ferm-temp-real" className={styles.fieldLabel}>
                  Temperatura real donde va a levar
                </label>
                <div className={styles.inputGroup}>
                  <input
                    id="ferm-temp-real"
                    type="text"
                    inputMode="decimal"
                    className={styles.inputField}
                    value={fermTempReal}
                    onChange={e => setFermTempReal(e.target.value)}
                    placeholder="22"
                  />
                  <span className={styles.unidad}>°C</span>
                </div>
              </div>

              {resultadoFermentacion ? (
                <div className={styles.pasoResultado}>
                  <span className={styles.pasoResultadoLabel}>Tiempo estimado</span>
                  <span className={styles.pasoResultadoValor}>
                    {formatearTiempo(resultadoFermentacion.tiempoHoras)}
                  </span>
                  <p className={styles.pasoResultadoNota}>
                    A esa temperatura la masa fermenta{' '}
                    <strong>{resultadoFermentacion.masRapido ? 'más rápido' : 'más lento'}</strong>: el
                    tiempo de la receta se multiplica por{' '}
                    {formatNumber(resultadoFermentacion.factor, 2)}.
                  </p>
                  <p className={styles.warningBox}>
                    <span aria-hidden="true">⚠️</span> Es una estimación: el punto de la masa lo marca
                    su volumen y su tacto, no el reloj. Úsala para saber cuándo empezar a mirarla.
                  </p>
                </div>
              ) : (
                <p className={styles.emptyState}>
                  Completa el tiempo y las dos temperaturas para ver la estimación.
                </p>
              )}

              <p className={styles.pasoEnlace}>
                Con la tabla de referencia de cada temperatura (nevera, ambiente fresco, 24 °C…):{' '}
                <a href="/fermentacion-temperatura/">tiempo de fermentación por temperatura</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Qué es el porcentaje del panadero?"
        subtitle="El sistema que usan los profesionales para formular recetas con precisión"
      >
        <section className={styles.guideSection}>
          <h2>¿Por qué la harina siempre es 100%?</h2>
          <p>
            En el sistema de porcentaje del panadero, la harina es la referencia fija (100%) y
            <strong> cada ingrediente se expresa como porcentaje del peso de la harina</strong>, no
            del peso total de la masa. Esto parece contraintuitivo al principio: el agua puede ser
            el 65%, la sal el 2% y la levadura el 0,3%, y la suma de todos los porcentajes supera
            el 100%. Eso es normal y correcto.
          </p>
          <p>
            La razón de este sistema es simple: la harina determina la estructura de la masa y es
            el ingrediente central en cualquier pan. Usando la harina como referencia, puedes
            escalar una receta de forma inmediata: si multiplicas la harina por 3, multiplicas
            todos los ingredientes por 3 y los porcentajes no cambian.
          </p>

          <h2>Diferencia con los porcentajes normales</h2>
          <p>
            En cocina cotidiana, los porcentajes suelen calcularse sobre el total. Por ejemplo, si
            tienes 1000 g de masa (650 g de agua + 350 g de harina), el agua sería el 65% del total.
          </p>
          <p>
            En panadería profesional, ese mismo 650 g de agua sobre 1000 g de harina se llama
            <strong> hidratación al 65%</strong>. Nótese que los gramos de la receta no han cambiado,
            pero el denominador es la harina, no el total. Esto es lo que confunde a los principiantes
            cuando ven recetas con porcentajes que suman más de 100%.
          </p>

          <h2>Masa madre, poolish y biga: por qué no son un ingrediente más</h2>
          <p>
            Un prefermento <strong>no es un ingrediente simple: es harina y agua ya mezcladas</strong>,
            y las dos mitades cuentan en la fórmula. Si escribes &quot;masa madre: 200 g&quot; en la
            lista como escribirías la sal, esos 200 g quedan fuera de la harina y fuera del agua, y
            entonces la hidratación que sale no es la de tu masa.
          </p>
          <p>
            La cuenta es elemental. Una masa madre al 100% de hidratación lleva partes iguales de
            harina y agua, así que 200 g son 100 g de harina y 100 g de agua. En una receta de 1000 g
            de harina y 650 g de agua, la harina real pasa a ser 1100 g y el agua real 750 g:
            la hidratación no es <strong>65,0%</strong> sino <strong>68,2%</strong>, y la sal, que
            creías al 2,0%, está en realidad al 1,8%. Cuanto más prefermento lleve la receta, mayor
            es la desviación: con 400 g de la misma masa madre la hidratación real sube al
            <strong> 70,8%</strong> mientras la calculadora seguiría diciendo 65,0%, y ahí ya son
            dos masas distintas —una &quot;estándar&quot; y otra de &quot;hidratación alta&quot;—
            que no se amasan ni se manejan igual.
          </p>
          <p>
            Por eso el botón <span aria-hidden="true">🫧</span> de cada fila marca el ingrediente
            como prefermento y pide su hidratación: al 100% para masa madre líquida y poolish, al
            50-60% para una biga o una madre firme. Con él marcado, la calculadora reparte su
            harina y su agua donde corresponde, enseña la <strong>fórmula total</strong> con los
            porcentajes buenos y, debajo, lo que hay que poner en la balanza.
          </p>
          <p>
            La otra cifra que aparece entonces es la <strong>harina prefermentada</strong>: qué
            fracción de la harina total llega ya fermentada. Es la que usan los panaderos para
            hablar de fuerza y de tiempos —un 10% de harina prefermentada y un 40% dan panes
            distintos con la misma hidratación—, y no se puede calcular sin haber separado antes
            las dos mitades del prefermento.
          </p>

          <h2>Hidrataciones típicas según el tipo de pan</h2>
          <div className={styles.tablaComparativa}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pan</th>
                  <th>Hidratación</th>
                  <th>Característica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bagel / Pretzel</td>
                  <td>50–55 %</td>
                  <td>Masa muy firme, moldeable</td>
                </tr>
                <tr>
                  <td>Pan de molde clásico</td>
                  <td>60–65 %</td>
                  <td>Suave, fácil de trabajar</td>
                </tr>
                <tr>
                  <td>Baguette clásica</td>
                  <td>65–68 %</td>
                  <td>Corteza crujiente, miga semiabierta</td>
                </tr>
                <tr>
                  <td>Chapata / Pan de campo</td>
                  <td>70–75 %</td>
                  <td>Miga abierta, algo pegajosa al amasar</td>
                </tr>
                <tr>
                  <td>Ciabatta</td>
                  <td>75–80 %</td>
                  <td>Muy pegajosa, requiere plegados</td>
                </tr>
                <tr>
                  <td>Focaccia / Pan de cristal</td>
                  <td>80–100 %</td>
                  <td>Casi líquida, se vierte en molde</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqItem}>
            <h3>¿Es lo mismo que el porcentaje en peso?</h3>
            <p>
              No. El porcentaje en peso divide cada ingrediente entre el peso total de la mezcla.
              El porcentaje del panadero divide cada ingrediente entre el peso de la harina.
              Ambos sistemas son coherentes, pero no intercambiables. Los profesionales usan el
              del panadero porque hace el escalado trivial.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Por qué la levadura es un porcentaje tan pequeño (0,3%)?</h3>
            <p>
              Porque su función no es volumétrica sino catalítica: una pequeña cantidad de
              levadura fermenta toda la masa. En levadura fresca, 1–2% es una cantidad alta
              (fermentación rápida); 0,1–0,3% es fermentación lenta o masa madre reducida.
              Trabajar con porcentajes del panadero hace estos decimales comparables entre recetas.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Cómo meto la masa madre en la fórmula?</h3>
            <p>
              Añádela como un ingrediente más y pulsa el botón <span aria-hidden="true">🫧</span> de
              su fila para marcarla como prefermento; si el nombre ya la delata (&quot;masa
              madre&quot;, &quot;poolish&quot;, &quot;biga&quot;…), se marca sola. Luego indica su
              hidratación: 100% si la refrescas con partes iguales de harina y agua, 50-60% si es
              firme. A partir de ahí la calculadora suma su harina a la harina y su agua al agua,
              que es lo que hace que la hidratación y todos los porcentajes sean los reales. Para
              convertir una receta de levadura a masa madre (o al revés), la herramienta es la{' '}
              <a href="/calculadora-masa-madre/">calculadora de masa madre</a>.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Por qué salen dos tablas cuando uso prefermento?</h3>
            <p>
              Porque son dos cosas distintas y los panaderos las manejan por separado. La
              <strong> fórmula total</strong> cuenta toda la harina y toda el agua de la masa,
              venga de donde venga: es la que responde &quot;¿qué hidratación tiene este pan?&quot;
              y la que permite comparar recetas entre sí. La tabla de <strong>lo que pesas</strong>
              {' '}es la lista de la balanza: harina y agua ya descontadas las que vienen dentro del
              prefermento, más el prefermento entero. Sin prefermento las dos coinciden, y por eso
              solo se muestra una.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Puedo usar esta calculadora con harina compuesta (varios tipos)?</h3>
            <p>
              Sí. En ese caso, introduce el peso total de harinas en el campo &quot;Harina (base)&quot;.
              Si quieres desglosar (p. ej. 800 g de harina de trigo + 200 g de centeno), suma
              ambas y añade el centeno como ingrediente aparte con su porcentaje real.
              Es habitual en panes de mezcla: el centeno aparecerá como &quot;Centeno — 20%&quot;.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Puedo partir de un peso final de masa en vez de la harina?</h3>
            <p>
              Sí. El botón &quot;Por peso final de masa&quot; invierte el cálculo: en lugar de
              introducir gramos y obtener porcentajes, introduces los porcentajes de tu fórmula
              (agua, sal, levadura...) y el peso final que necesitas —el de un molde, una bandeja
              o una hornada completa— y la calculadora reparte cuántos gramos de harina y de cada
              ingrediente hacen falta. Es útil cuando el molde manda: sabes el peso de masa que
              cabe y quieres la fórmula ajustada a ese peso, no al revés.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Cómo sé cuántas porciones salen de mi receta?</h3>
            <p>
              Introduce el peso por porción en el campo opcional. La calculadora divide el peso
              total de la masa entre ese valor. Recuerda que el pan pierde entre el 10% y el 20%
              de su peso durante el horneado (evaporación de agua), así que los pesos de las
              porciones de masa serán ligeramente superiores al peso del pan cocido.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Para qué sirve conocer el porcentaje de sal?</h3>
            <p>
              La sal tiene un rango funcional estrecho: por debajo del 1,5% el pan sabe soso y
              la masa es más débil (la sal refuerza la red de gluten); por encima del 3% puede
              inhibir la fermentación. El rango estándar es 1,8–2,2% de sal respecto a la harina.
              Con el porcentaje del panadero puedes verificar esto de un vistazo en cualquier receta.
            </p>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-porcentaje-panadero')} />
      <ShareCard appName="calculadora-porcentaje-panadero" />
      <Footer appName="calculadora-porcentaje-panadero" />
    </div>
  );
}
