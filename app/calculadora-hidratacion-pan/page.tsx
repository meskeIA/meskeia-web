'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CalculadoraHidratacionPan.module.css';
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
  calcularHidratacionPan,
  type ModoHidratacion,
  type ResultadoHidratacionPan,
} from '@/lib/calculadoras/cocina';

type Modo = ModoHidratacion;

interface ColorNivel {
  bg: string;
  border: string;
  text: string;
  dark_bg: string;
}

const COLORES_NIVEL: Record<string, ColorNivel> = {
  'Masa seca':           { bg: '#f0fdf4', border: '#86efac', text: '#166534', dark_bg: '#14532d' },
  'Hidratación estándar':{ bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', dark_bg: '#1e3a8a' },
  'Hidratación alta':    { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', dark_bg: '#78350f' },
  'Hidratación muy alta':{ bg: '#fff7ed', border: '#fdba74', text: '#c2410c', dark_bg: '#9a3412' },
  'Hidratación extrema': { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', dark_bg: '#7f1d1d' },
};

export default function CalculadoraHidratacionPanPage() {
  const [modo, setModo] = useState<Modo>('calcular_porcentaje');
  const [harinaStr, setHarinaStr] = useState('1000');
  const [aguaOPorcentajeStr, setAguaOPorcentajeStr] = useState('650');
  const [resultado, setResultado] = useState<ResultadoHidratacionPan | null>(null);
  const [error, setError] = useState('');

  const cambiarModo = useCallback((nuevoModo: Modo) => {
    setModo(nuevoModo);
    setResultado(null);
    setError('');
    // Valores por defecto según el modo
    if (nuevoModo === 'calcular_porcentaje') {
      setHarinaStr('1000');
      setAguaOPorcentajeStr('650');
    } else {
      setHarinaStr('1000');
      setAguaOPorcentajeStr('65');
    }
  }, []);

  const calcular = useCallback(() => {
    setError('');
    const harina_g = parseSpanishNumber(harinaStr);
    const aguaOPorcentaje = parseSpanishNumber(aguaOPorcentajeStr);

    if (!harina_g || harina_g <= 0) {
      setError('Introduce un peso de harina válido (mayor que 0).');
      return;
    }
    if (!aguaOPorcentaje || aguaOPorcentaje <= 0) {
      if (modo === 'calcular_porcentaje') {
        setError('Introduce el peso del agua en gramos.');
      } else {
        setError('Introduce el porcentaje de hidratación deseado.');
      }
      return;
    }
    if (modo === 'calcular_agua' && aguaOPorcentaje > 200) {
      setError('El porcentaje de hidratación no puede superar el 200%.');
      return;
    }

    const res = calcularHidratacionPan(modo, harina_g, aguaOPorcentaje);
    setResultado(res);
  }, [modo, harinaStr, aguaOPorcentajeStr]);

  const colorNivel = resultado ? (COLORES_NIVEL[resultado.clasificacion] ?? COLORES_NIVEL['Hidratación estándar']) : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">💧</span> Hidratación del Pan</h1>
        <p className={styles.subtitle}>
          Calcula el % de agua de tu masa o descubre cuánta agua necesitas para una hidratación objetivo
        </p>
      </header>

      <LegalNotice />

      {/* Herramienta principal */}
      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          {/* Toggle de modo */}
          <div className={styles.modoToggle} role="group" aria-label="Modo de cálculo">
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'calcular_porcentaje' ? styles.modoBtnActive : ''}`}
              onClick={() => cambiarModo('calcular_porcentaje')}
              aria-pressed={modo === 'calcular_porcentaje'}
            >
              ¿Qué hidratación tiene mi masa?
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'calcular_agua' ? styles.modoBtnActive : ''}`}
              onClick={() => cambiarModo('calcular_agua')}
              aria-pressed={modo === 'calcular_agua'}
            >
              ¿Cuánta agua necesito?
            </button>
          </div>

          {/* Campo: harina */}
          <div className={styles.fieldGroup}>
            <label htmlFor="harina" className={styles.fieldLabel}>
              Peso de la harina
            </label>
            <div className={styles.inputRow}>
              <input
                id="harina"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={harinaStr}
                onChange={e => setHarinaStr(e.target.value)}
                placeholder="1000"
                aria-label="Peso de la harina en gramos"
              />
              <span className={styles.unidad}>g</span>
            </div>
          </div>

          {/* Campo dinámico según modo */}
          {modo === 'calcular_porcentaje' ? (
            <div className={styles.fieldGroup}>
              <label htmlFor="agua" className={styles.fieldLabel}>
                Peso del agua
              </label>
              <div className={styles.inputRow}>
                <input
                  id="agua"
                  type="text"
                  inputMode="decimal"
                  className={styles.inputField}
                  value={aguaOPorcentajeStr}
                  onChange={e => setAguaOPorcentajeStr(e.target.value)}
                  placeholder="650"
                  aria-label="Peso del agua en gramos"
                />
                <span className={styles.unidad}>g</span>
              </div>
            </div>
          ) : (
            <div className={styles.fieldGroup}>
              <label htmlFor="hidratacion" className={styles.fieldLabel}>
                Hidratación objetivo
              </label>
              <div className={styles.inputRow}>
                <input
                  id="hidratacion"
                  type="text"
                  inputMode="decimal"
                  className={styles.inputField}
                  value={aguaOPorcentajeStr}
                  onChange={e => setAguaOPorcentajeStr(e.target.value)}
                  placeholder="65"
                  aria-label="Porcentaje de hidratación objetivo"
                />
                <span className={styles.unidad}>%</span>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              {error}
            </div>
          )}

          <button type="button" onClick={calcular} className={styles.btnPrimary}>
            Calcular
          </button>

          {/* Referencia rápida de hidrataciones */}
          <div className={styles.refRapida}>
            <p className={styles.refTitle}>Referencia rápida:</p>
            <div className={styles.refGrid}>
              {[
                { label: 'Bagel', val: 55 },
                { label: 'Baguette', val: 67 },
                { label: 'Chapata', val: 72 },
                { label: 'Ciabatta', val: 78 },
                { label: 'Focaccia', val: 85 },
              ].map(ref => (
                <button
                  key={ref.label}
                  type="button"
                  className={styles.refBtn}
                  onClick={() => {
                    if (modo === 'calcular_agua') {
                      setAguaOPorcentajeStr(String(ref.val));
                    }
                  }}
                  title={`${ref.label}: ${ref.val}% hidratación`}
                >
                  <span className={styles.refLabel}>{ref.label}</span>
                  <span className={styles.refVal}>{ref.val} %</span>
                </button>
              ))}
            </div>
            {modo === 'calcular_porcentaje' && (
              <p className={styles.refHint}>Cambia al modo &quot;¿Cuánta agua necesito?&quot; para usar los atajos rápidos</p>
            )}
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>Resultado</h2>

          {!resultado && (
            <p className={styles.emptyState}>
              Introduce los datos y pulsa <strong>Calcular</strong> para ver la hidratación y la clasificación de tu masa.
            </p>
          )}

          {resultado && colorNivel && (
            <>
              {/* Resultado principal */}
              <div
                className={styles.resultadoPrincipal}
                style={{
                  background: colorNivel.bg,
                  borderColor: colorNivel.border,
                }}
              >
                <div className={styles.resultValues}>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Harina</span>
                    <span className={styles.resultValue}>{formatNumber(resultado.harina_g, 0)} g</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Agua</span>
                    <span className={styles.resultValue}>{formatNumber(resultado.agua_g, 0)} g</span>
                  </div>
                  <div className={styles.resultItemHidratacion}>
                    <span className={styles.resultLabel}>Hidratación</span>
                    <span className={styles.resultValueBig}>{formatNumber(resultado.hidratacion_pct, 1)} %</span>
                  </div>
                </div>

                <div
                  className={styles.clasificacionBadge}
                  style={{ color: colorNivel.text, borderColor: colorNivel.border }}
                >
                  {resultado.clasificacion}
                </div>

                <p className={styles.descripcion}>{resultado.descripcion}</p>
              </div>

              {/* Ejemplos */}
              <div className={styles.ejemplosSection}>
                <p className={styles.ejemplosTitle}>Panes típicos con esta hidratación:</p>
                <ul className={styles.ejemplosList}>
                  {resultado.ejemplos.map((ej, idx) => (
                    <li key={idx} className={styles.ejemplosItem}>
                      <span aria-hidden="true">🍞</span> {ej}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Barra visual de hidratación */}
              <div className={styles.barraWrapper} aria-label={`Nivel de hidratación: ${formatNumber(resultado.hidratacion_pct, 1)}%`}>
                <div className={styles.barraTrack}>
                  <div
                    className={styles.barraFill}
                    style={{
                      width: `${Math.min((resultado.hidratacion_pct / 110) * 100, 100)}%`,
                      background: colorNivel.border,
                    }}
                    role="progressbar"
                    aria-valuenow={resultado.hidratacion_pct}
                    aria-valuemin={0}
                    aria-valuemax={110}
                  />
                </div>
                <div className={styles.barraLabels}>
                  <span>50%</span>
                  <span>60%</span>
                  <span>70%</span>
                  <span>80%</span>
                  <span>90%+</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 Todo sobre la hidratación del pan"
        subtitle="Entiende qué cambia en tu masa según la cantidad de agua"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es la hidratación del pan?</h2>
          <p>
            La hidratación de una masa es el porcentaje de agua respecto al peso de la harina
            (no respecto al peso total). Si tienes 1000 g de harina y 650 g de agua, la hidratación
            es el 65%. Este dato es fundamental porque determina la textura de la miga, la
            manejabilidad de la masa y el tipo de pan que puedes hacer.
          </p>
          <p>
            Más agua no es necesariamente mejor. Cada tipo de pan tiene un rango óptimo de
            hidratación que define su carácter. Un bagel necesita una masa firme (55%); una
            ciabatta auténtica requiere una masa casi pegajosa (75–80%). Conocer la hidratación
            es el primer paso para entender y reproducir cualquier receta.
          </p>

          <h2>Clasificaciones de hidratación</h2>
          <div className={styles.tablaHidrataciones}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Rango</th>
                  <th>Textura / Manejo</th>
                  <th>Ejemplos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Masa seca</td>
                  <td>&lt; 60 %</td>
                  <td>Firme, fácil de moldear, no se pega</td>
                  <td>Bagels, pretzels</td>
                </tr>
                <tr>
                  <td>Estándar</td>
                  <td>60–70 %</td>
                  <td>Elástica, manejable a mano, equilibrada</td>
                  <td>Pan de molde, baguette</td>
                </tr>
                <tr>
                  <td>Alta</td>
                  <td>70–80 %</td>
                  <td>Pegajosa, miga muy abierta, corteza fina</td>
                  <td>Ciabatta, pan de campo</td>
                </tr>
                <tr>
                  <td>Muy alta</td>
                  <td>80–90 %</td>
                  <td>Difícil de modelar, requiere pliegues y/o molde</td>
                  <td>Focaccia, pan de cristal</td>
                </tr>
                <tr>
                  <td>Extrema</td>
                  <td>&gt; 90 %</td>
                  <td>Casi líquida, solo en molde o técnicas avanzadas</td>
                  <td>Algunos panes artesanos experimentales</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Por qué más hidratación = miga más abierta pero más difícil de trabajar</h2>
          <p>
            El agua interviene en la formación del gluten: en hidrataciones bajas el gluten es
            más tenso y compacto, lo que da una miga cerrada y densa. Al aumentar el agua, las
            proteínas de la harina se hidratan mejor, el gluten se vuelve más extensible y los
            gases de la fermentación pueden expandirse formando alveolos más grandes.
          </p>
          <p>
            El problema es que una masa muy húmeda se pega a las manos y es difícil de moldear.
            Los panaderos profesionales compensan esto con técnicas que fortalecen el gluten sin
            necesidad de añadir harina extra.
          </p>

          <h2>Consejos para trabajar masas de alta hidratación</h2>
          <div className={styles.consejosGrid}>
            <div className={styles.consejoCard}>
              <h3>Stretch &amp; Fold (pliegues)</h3>
              <p>
                En lugar de amasar, se pliega la masa sobre sí misma cada 30 minutos durante
                la fermentación en bloque. Cada pliegue alinea el gluten sin incorporar harina.
                Con 4–6 ciclos se consigue una masa con buena estructura aunque sea muy húmeda.
              </p>
            </div>
            <div className={styles.consejoCard}>
              <h3>Autólisis</h3>
              <p>
                Mezclar harina y agua sin la levadura y dejar reposar 20–60 minutos antes de
                continuar. Durante la autólisis las enzimas degradan proteínas y el gluten se
                desarrolla espontáneamente. La masa resultante es más suave y extensible,
                más fácil de trabajar incluso con hidrataciones altas.
              </p>
            </div>
            <div className={styles.consejoCard}>
              <h3>Temperatura del agua</h3>
              <p>
                El agua más fría (10–15 °C) hace que la masa sea algo más firme y manejable
                al principio. Es un truco habitual cuando se trabaja con masas de alta hidratación
                en verano o en cocinas calientes: el frío enlentece la fermentación y da más
                margen para trabajar la masa antes de que sobrefermente.
              </p>
            </div>
            <div className={styles.consejoCard}>
              <h3>Mojarse las manos</h3>
              <p>
                Con masas de hidratación muy alta, trabajar con las manos mojadas (no enharinadas)
                evita que la masa se pegue sin alterar el balance harina/agua de la receta.
                Añadir harina extra para que no se pegue es el error más frecuente y modifica
                la hidratación planificada.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-hidratacion-pan')} />
      <ShareCard appName="calculadora-hidratacion-pan" />
      <Footer appName="calculadora-hidratacion-pan" />
    </div>
  );
}
