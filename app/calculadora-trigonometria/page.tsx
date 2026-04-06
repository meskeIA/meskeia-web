'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './CalculadoraTrigonometria.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoCalculo = 'funciones' | 'triangulo' | 'conversiones' | 'identidades';
type UnidadAngulo = 'grados' | 'radianes';

export default function CalculadoraTrigonometriaPage() {
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('funciones');
  const [unidad, setUnidad] = useState<UnidadAngulo>('grados');

  // Funciones trigonométricas
  const [angulo, setAngulo] = useState('');

  // Triángulo rectángulo
  const [ladoA, setLadoA] = useState(''); // cateto a
  const [ladoB, setLadoB] = useState(''); // cateto b
  const [hipotenusa, setHipotenusa] = useState('');
  const [anguloAlfa, setAnguloAlfa] = useState('');

  // Conversiones
  const [valorConvertir, setValorConvertir] = useState('');
  const [unidadOrigen, setUnidadOrigen] = useState<'grados' | 'radianes' | 'gradianes'>('grados');

  // Identidades
  const [anguloA, setAnguloA] = useState('');
  const [anguloB2, setAnguloB2] = useState('');

  const PI = Math.PI;

  const toRadians = (deg: number): number => (deg * PI) / 180;
  const toDegrees = (rad: number): number => (rad * 180) / PI;

  const resultados = useMemo(() => {
    switch (tipoCalculo) {
      case 'funciones': {
        const ang = parseSpanishNumber(angulo);
        if (isNaN(ang)) return null;

        const angRad = unidad === 'grados' ? toRadians(ang) : ang;

        const seno = Math.sin(angRad);
        const coseno = Math.cos(angRad);
        const tangente = Math.cos(angRad) !== 0 ? Math.tan(angRad) : null;

        const cosecante = seno !== 0 ? 1 / seno : null;
        const secante = coseno !== 0 ? 1 / coseno : null;
        const cotangente = tangente !== null && tangente !== 0 ? 1 / tangente : null;

        // Cuadrante
        let cuadrante = 1;
        const angNorm = ((ang % 360) + 360) % 360;
        if (angNorm > 90 && angNorm <= 180) cuadrante = 2;
        else if (angNorm > 180 && angNorm <= 270) cuadrante = 3;
        else if (angNorm > 270) cuadrante = 4;

        return {
          tipo: 'funciones',
          angulo: ang,
          anguloRad: angRad,
          seno,
          coseno,
          tangente,
          cosecante,
          secante,
          cotangente,
          cuadrante
        };
      }

      case 'triangulo': {
        const a = parseSpanishNumber(ladoA);
        const b = parseSpanishNumber(ladoB);
        const c = parseSpanishNumber(hipotenusa);
        const alfa = parseSpanishNumber(anguloAlfa);

        // Caso 1: Dos catetos dados
        if (!isNaN(a) && !isNaN(b) && a > 0 && b > 0) {
          const hip = Math.sqrt(a * a + b * b);
          const angA = toDegrees(Math.atan(a / b));
          const angB = 90 - angA;

          return {
            tipo: 'triangulo',
            catetoA: a,
            catetoB: b,
            hipotenusa: hip,
            anguloA: angA,
            anguloB: angB,
            area: (a * b) / 2,
            perimetro: a + b + hip
          };
        }

        // Caso 2: Cateto e hipotenusa
        if (!isNaN(a) && !isNaN(c) && a > 0 && c > a) {
          const bCalc = Math.sqrt(c * c - a * a);
          const angA = toDegrees(Math.asin(a / c));
          const angB = 90 - angA;

          return {
            tipo: 'triangulo',
            catetoA: a,
            catetoB: bCalc,
            hipotenusa: c,
            anguloA: angA,
            anguloB: angB,
            area: (a * bCalc) / 2,
            perimetro: a + bCalc + c
          };
        }

        // Caso 3: Cateto y ángulo
        if (!isNaN(a) && !isNaN(alfa) && a > 0 && alfa > 0 && alfa < 90) {
          const alfaRad = toRadians(alfa);
          const bCalc = a / Math.tan(alfaRad);
          const cCalc = a / Math.sin(alfaRad);

          return {
            tipo: 'triangulo',
            catetoA: a,
            catetoB: bCalc,
            hipotenusa: cCalc,
            anguloA: alfa,
            anguloB: 90 - alfa,
            area: (a * bCalc) / 2,
            perimetro: a + bCalc + cCalc
          };
        }

        return null;
      }

      case 'conversiones': {
        const val = parseSpanishNumber(valorConvertir);
        if (isNaN(val)) return null;

        let enGrados: number, enRadianes: number, enGradianes: number;

        switch (unidadOrigen) {
          case 'grados':
            enGrados = val;
            enRadianes = val * PI / 180;
            enGradianes = val * 10 / 9;
            break;
          case 'radianes':
            enRadianes = val;
            enGrados = val * 180 / PI;
            enGradianes = val * 200 / PI;
            break;
          case 'gradianes':
            enGradianes = val;
            enGrados = val * 9 / 10;
            enRadianes = val * PI / 200;
            break;
          default:
            return null;
        }

        // Forma fracción de π
        const fraccionPi = enRadianes / PI;
        let fraccionStr = '';
        const fracciones = [
          { num: 1, den: 6 }, { num: 1, den: 4 }, { num: 1, den: 3 }, { num: 1, den: 2 },
          { num: 2, den: 3 }, { num: 3, den: 4 }, { num: 5, den: 6 }, { num: 1, den: 1 },
          { num: 4, den: 3 }, { num: 3, den: 2 }, { num: 2, den: 1 }
        ];

        for (const f of fracciones) {
          if (Math.abs(fraccionPi - f.num / f.den) < 0.001) {
            fraccionStr = f.den === 1 ? `${f.num}π` : `${f.num}π/${f.den}`;
            break;
          }
          if (Math.abs(fraccionPi + f.num / f.den) < 0.001) {
            fraccionStr = f.den === 1 ? `-${f.num}π` : `-${f.num}π/${f.den}`;
            break;
          }
        }

        return {
          tipo: 'conversion',
          grados: enGrados,
          radianes: enRadianes,
          gradianes: enGradianes,
          fraccionPi: fraccionStr || formatNumber(fraccionPi, 4) + 'π'
        };
      }

      case 'identidades': {
        const a = parseSpanishNumber(anguloA);
        const b = parseSpanishNumber(anguloB2);
        if (isNaN(a)) return null;

        const aRad = unidad === 'grados' ? toRadians(a) : a;
        const bRad = !isNaN(b) ? (unidad === 'grados' ? toRadians(b) : b) : 0;

        // Identidades pitagóricas
        const sin2cos2 = Math.pow(Math.sin(aRad), 2) + Math.pow(Math.cos(aRad), 2);

        // Ángulos dobles
        const sin2a = Math.sin(2 * aRad);
        const cos2a = Math.cos(2 * aRad);

        // Ángulos mitad
        const sinMitad = Math.sin(aRad / 2);
        const cosMitad = Math.cos(aRad / 2);

        // Suma de ángulos (si b está definido)
        let sinSuma = null, cosSuma = null, sinResta = null, cosResta = null;
        if (!isNaN(b)) {
          sinSuma = Math.sin(aRad) * Math.cos(bRad) + Math.cos(aRad) * Math.sin(bRad);
          cosSuma = Math.cos(aRad) * Math.cos(bRad) - Math.sin(aRad) * Math.sin(bRad);
          sinResta = Math.sin(aRad) * Math.cos(bRad) - Math.cos(aRad) * Math.sin(bRad);
          cosResta = Math.cos(aRad) * Math.cos(bRad) + Math.sin(aRad) * Math.sin(bRad);
        }

        return {
          tipo: 'identidades',
          sin2cos2,
          sin2a,
          cos2a,
          sinMitad,
          cosMitad,
          sinSuma,
          cosSuma,
          sinResta,
          cosResta,
          tieneB: !isNaN(b)
        };
      }

      default:
        return null;
    }
  }, [tipoCalculo, unidad, angulo, ladoA, ladoB, hipotenusa, anguloAlfa, valorConvertir, unidadOrigen, anguloA, anguloB2]);

  const tipos: { id: TipoCalculo; nombre: string; icono: string }[] = [
    { id: 'funciones', nombre: 'Funciones', icono: 'sin' },
    { id: 'triangulo', nombre: 'Triángulo', icono: '△' },
    { id: 'conversiones', nombre: 'Conversiones', icono: '°↔rad' },
    { id: 'identidades', nombre: 'Identidades', icono: '=' },
  ];

  const angulosNotables = [
    { grados: 0, sin: '0', cos: '1', tan: '0' },
    { grados: 30, sin: '1/2', cos: '√3/2', tan: '√3/3' },
    { grados: 45, sin: '√2/2', cos: '√2/2', tan: '1' },
    { grados: 60, sin: '√3/2', cos: '1/2', tan: '√3' },
    { grados: 90, sin: '1', cos: '0', tan: '∞' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📐 Calculadora de Trigonometría</h1>
        <p className={styles.subtitle}>
          Funciones trigonométricas, resolución de triángulos, conversiones e identidades
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Cálculo</h2>

          <div className={styles.tiposGrid}>
            {tipos.map((tipo) => (
              <button
                key={tipo.id}
                className={`${styles.tipoBtn} ${tipoCalculo === tipo.id ? styles.tipoActivo : ''}`}
                onClick={() => setTipoCalculo(tipo.id)}
              >
                <span className={styles.tipoIcono}>{tipo.icono}</span>
                <span className={styles.tipoNombre}>{tipo.nombre}</span>
              </button>
            ))}
          </div>

          {(tipoCalculo === 'funciones' || tipoCalculo === 'identidades') && (
            <div className={styles.unidadSelector}>
              <button
                className={`${styles.unidadBtn} ${unidad === 'grados' ? styles.unidadActiva : ''}`}
                onClick={() => setUnidad('grados')}
              >
                Grados (°)
              </button>
              <button
                className={`${styles.unidadBtn} ${unidad === 'radianes' ? styles.unidadActiva : ''}`}
                onClick={() => setUnidad('radianes')}
              >
                Radianes
              </button>
            </div>
          )}

          <div className={styles.inputsSection}>
            {tipoCalculo === 'funciones' && (
              <>
                <NumberInput
                  value={angulo}
                  onChange={setAngulo}
                  label={`Ángulo (${unidad})`}
                  placeholder={unidad === 'grados' ? '45' : '0,785'}
                />
                <div className={styles.angulosRapidos}>
                  <span>Ángulos notables:</span>
                  {[0, 30, 45, 60, 90, 180, 270, 360].map(a => (
                    <button
                      key={a}
                      onClick={() => setAngulo(unidad === 'grados' ? a.toString() : formatNumber(a * PI / 180, 4))}
                      className={styles.btnAngulo}
                    >
                      {a}°
                    </button>
                  ))}
                </div>
              </>
            )}

            {tipoCalculo === 'triangulo' && (
              <>
                <p className={styles.helper}>Introduce al menos 2 valores</p>
                <NumberInput
                  value={ladoA}
                  onChange={setLadoA}
                  label="Cateto a (opuesto)"
                  placeholder="3"
                />
                <NumberInput
                  value={ladoB}
                  onChange={setLadoB}
                  label="Cateto b (adyacente)"
                  placeholder="4"
                />
                <NumberInput
                  value={hipotenusa}
                  onChange={setHipotenusa}
                  label="Hipotenusa c"
                  placeholder="5"
                />
                <NumberInput
                  value={anguloAlfa}
                  onChange={setAnguloAlfa}
                  label="Ángulo α (grados)"
                  placeholder="30"
                />
              </>
            )}

            {tipoCalculo === 'conversiones' && (
              <>
                <NumberInput
                  value={valorConvertir}
                  onChange={setValorConvertir}
                  label="Valor a convertir"
                  placeholder="90"
                />
                <div className={styles.unidadOrigenSelector}>
                  {(['grados', 'radianes', 'gradianes'] as const).map(u => (
                    <button
                      key={u}
                      className={`${styles.unidadOrigenBtn} ${unidadOrigen === u ? styles.unidadOrigenActiva : ''}`}
                      onClick={() => setUnidadOrigen(u)}
                    >
                      {u === 'grados' ? 'Grados (°)' : u === 'radianes' ? 'Radianes' : 'Gradianes'}
                    </button>
                  ))}
                </div>
              </>
            )}

            {tipoCalculo === 'identidades' && (
              <>
                <NumberInput
                  value={anguloA}
                  onChange={setAnguloA}
                  label={`Ángulo A (${unidad})`}
                  placeholder="30"
                />
                <NumberInput
                  value={anguloB2}
                  onChange={setAnguloB2}
                  label={`Ángulo B (${unidad}) - opcional`}
                  placeholder="45"
                  helperText="Para suma/resta de ángulos"
                />
              </>
            )}
          </div>
        </div>

        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {!resultados ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📐</span>
              <p>Ingresa los valores para calcular</p>
            </div>
          ) : (
            <div className={styles.resultsGrid}>
              {resultados.tipo === 'funciones' && (
                <>
                  <ResultCard
                    title="sin(θ)"
                    value={formatNumber(resultados.seno ?? 0, 8)}
                    variant="highlight"
                    icon="sin"
                  />
                  <ResultCard
                    title="cos(θ)"
                    value={formatNumber(resultados.coseno ?? 0, 8)}
                    variant="highlight"
                    icon="cos"
                  />
                  <ResultCard
                    title="tan(θ)"
                    value={resultados.tangente !== null ? formatNumber(resultados.tangente ?? 0, 8) : '∞'}
                    variant="highlight"
                    icon="tan"
                  />
                  <ResultCard
                    title="csc(θ)"
                    value={resultados.cosecante !== null ? formatNumber(resultados.cosecante ?? 0, 8) : '∞'}
                    variant="info"
                    icon="csc"
                  />
                  <ResultCard
                    title="sec(θ)"
                    value={resultados.secante !== null ? formatNumber(resultados.secante ?? 0, 8) : '∞'}
                    variant="info"
                    icon="sec"
                  />
                  <ResultCard
                    title="cot(θ)"
                    value={resultados.cotangente !== null ? formatNumber(resultados.cotangente ?? 0, 8) : '∞'}
                    variant="info"
                    icon="cot"
                  />
                  <ResultCard
                    title="Cuadrante"
                    value={`${resultados.cuadrante}°`}
                    variant="default"
                    icon="📍"
                  />
                  <ResultCard
                    title="En radianes"
                    value={formatNumber(resultados.anguloRad ?? 0, 6)}
                    variant="default"
                    icon="rad"
                  />
                </>
              )}

              {resultados.tipo === 'triangulo' && (
                <>
                  <ResultCard
                    title="Cateto a"
                    value={formatNumber(resultados.catetoA ?? 0, 4)}
                    variant="default"
                    icon="a"
                  />
                  <ResultCard
                    title="Cateto b"
                    value={formatNumber(resultados.catetoB ?? 0, 4)}
                    variant="default"
                    icon="b"
                  />
                  <ResultCard
                    title="Hipotenusa c"
                    value={formatNumber(resultados.hipotenusa ?? 0, 4)}
                    variant="highlight"
                    icon="c"
                  />
                  <ResultCard
                    title="Ángulo A"
                    value={formatNumber(resultados.anguloA ?? 0, 4)}
                    unit="°"
                    variant="info"
                    icon="α"
                  />
                  <ResultCard
                    title="Ángulo B"
                    value={formatNumber(resultados.anguloB ?? 0, 4)}
                    unit="°"
                    variant="info"
                    icon="β"
                  />
                  <ResultCard
                    title="Área"
                    value={formatNumber(resultados.area ?? 0, 4)}
                    unit="u²"
                    variant="default"
                    icon="📐"
                  />
                  <ResultCard
                    title="Perímetro"
                    value={formatNumber(resultados.perimetro ?? 0, 4)}
                    unit="u"
                    variant="default"
                    icon="📏"
                  />
                </>
              )}

              {resultados.tipo === 'conversion' && (
                <>
                  <ResultCard
                    title="Grados"
                    value={formatNumber(resultados.grados ?? 0, 6)}
                    unit="°"
                    variant="highlight"
                    icon="°"
                  />
                  <ResultCard
                    title="Radianes"
                    value={formatNumber(resultados.radianes ?? 0, 6)}
                    variant="highlight"
                    icon="rad"
                  />
                  <ResultCard
                    title="Gradianes"
                    value={formatNumber(resultados.gradianes ?? 0, 6)}
                    unit="gon"
                    variant="info"
                    icon="gon"
                  />
                  <ResultCard
                    title="Fracción de π"
                    value={resultados.fraccionPi ?? ''}
                    variant="info"
                    icon="π"
                  />
                </>
              )}

              {resultados.tipo === 'identidades' && (
                <>
                  <ResultCard
                    title="sin²θ + cos²θ"
                    value={formatNumber(resultados.sin2cos2 ?? 0, 8)}
                    variant="success"
                    icon="="
                    description="Siempre = 1"
                  />
                  <ResultCard
                    title="sin(2θ)"
                    value={formatNumber(resultados.sin2a ?? 0, 8)}
                    variant="highlight"
                    icon="2θ"
                    description="= 2·sin(θ)·cos(θ)"
                  />
                  <ResultCard
                    title="cos(2θ)"
                    value={formatNumber(resultados.cos2a ?? 0, 8)}
                    variant="highlight"
                    icon="2θ"
                    description="= cos²θ - sin²θ"
                  />
                  <ResultCard
                    title="sin(θ/2)"
                    value={formatNumber(resultados.sinMitad ?? 0, 8)}
                    variant="info"
                    icon="θ/2"
                  />
                  <ResultCard
                    title="cos(θ/2)"
                    value={formatNumber(resultados.cosMitad ?? 0, 8)}
                    variant="info"
                    icon="θ/2"
                  />
                  {resultados.tieneB && (
                    <>
                      <ResultCard
                        title="sin(A+B)"
                        value={formatNumber(resultados.sinSuma!, 8)}
                        variant="default"
                        icon="A+B"
                      />
                      <ResultCard
                        title="cos(A+B)"
                        value={formatNumber(resultados.cosSuma!, 8)}
                        variant="default"
                        icon="A+B"
                      />
                      <ResultCard
                        title="sin(A-B)"
                        value={formatNumber(resultados.sinResta!, 8)}
                        variant="default"
                        icon="A-B"
                      />
                    </>
                  )}
                </>
              )}
            </div>
          )}

          <div className={styles.tablaNotables}>
            <h3>Ángulos Notables</h3>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>θ</th>
                  <th>sin(θ)</th>
                  <th>cos(θ)</th>
                  <th>tan(θ)</th>
                </tr>
              </thead>
              <tbody>
                {angulosNotables.map(a => (
                  <tr key={a.grados}>
                    <td>{a.grados}°</td>
                    <td>{a.sin}</td>
                    <td>{a.cos}</td>
                    <td>{a.tan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Aprende Trigonometría: Funciones, Identidades y Aplicaciones"
        subtitle="Desde SOH-CAH-TOA hasta el círculo unitario: todo lo que necesitas para dominar la trigonometría"
        icon="📚"
      >
        <div className={styles.educationalContent}>

          {/* Tabla comparativa de las 6 funciones */}
          <section className={styles.guideSection}>
            <h2>📊 Las 6 Funciones Trigonométricas</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Función</th>
                    <th>Triángulo rectángulo</th>
                    <th>Círculo unitario</th>
                    <th>Dominio</th>
                    <th>Rango</th>
                    <th>0°</th>
                    <th>30°</th>
                    <th>45°</th>
                    <th>60°</th>
                    <th>90°</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>sin(θ)</strong></td>
                    <td>opuesto / hipotenusa</td>
                    <td>coordenada y del punto</td>
                    <td>ℝ (todos)</td>
                    <td>[-1, 1]</td>
                    <td>0</td>
                    <td>1/2 = 0,5</td>
                    <td>√2/2 ≈ 0,707</td>
                    <td>√3/2 ≈ 0,866</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td><strong>cos(θ)</strong></td>
                    <td>adyacente / hipotenusa</td>
                    <td>coordenada x del punto</td>
                    <td>ℝ (todos)</td>
                    <td>[-1, 1]</td>
                    <td>1</td>
                    <td>√3/2 ≈ 0,866</td>
                    <td>√2/2 ≈ 0,707</td>
                    <td>1/2 = 0,5</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td><strong>tan(θ)</strong></td>
                    <td>opuesto / adyacente</td>
                    <td>sin(θ) / cos(θ)</td>
                    <td>θ ≠ 90°+n·180°</td>
                    <td>ℝ (todos)</td>
                    <td>0</td>
                    <td>1/√3 ≈ 0,577</td>
                    <td>1</td>
                    <td>√3 ≈ 1,732</td>
                    <td>∞</td>
                  </tr>
                  <tr>
                    <td><strong>csc(θ)</strong></td>
                    <td>hipotenusa / opuesto</td>
                    <td>1 / sin(θ)</td>
                    <td>θ ≠ n·180°</td>
                    <td>(-∞,-1] ∪ [1,∞)</td>
                    <td>∞</td>
                    <td>2</td>
                    <td>√2 ≈ 1,414</td>
                    <td>2√3/3 ≈ 1,155</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td><strong>sec(θ)</strong></td>
                    <td>hipotenusa / adyacente</td>
                    <td>1 / cos(θ)</td>
                    <td>θ ≠ 90°+n·180°</td>
                    <td>(-∞,-1] ∪ [1,∞)</td>
                    <td>1</td>
                    <td>2√3/3 ≈ 1,155</td>
                    <td>√2 ≈ 1,414</td>
                    <td>2</td>
                    <td>∞</td>
                  </tr>
                  <tr>
                    <td><strong>cot(θ)</strong></td>
                    <td>adyacente / opuesto</td>
                    <td>cos(θ) / sin(θ)</td>
                    <td>θ ≠ n·180°</td>
                    <td>ℝ (todos)</td>
                    <td>∞</td>
                    <td>√3 ≈ 1,732</td>
                    <td>1</td>
                    <td>1/√3 ≈ 0,577</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Casos de uso */}
          <section className={styles.guideSection}>
            <h2>👥 ¿Quién usa esta calculadora?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🎓</span>
                  <div>
                    <div className={styles.casoTitle}>Estudiante de Bachillerato</div>
                    <div className={styles.casoSubtitle}>Matemáticas II, Física</div>
                  </div>
                </div>
                <div className={styles.casoDesc}>
                  Resuelve triángulos rectángulos con SOH-CAH-TOA: si conoces un cateto de 5 m
                  y el ángulo de 30°, calculas la hipotenusa con 5/sin(30°) = 10 m.
                  Comprueba ejercicios de examen y domina las conversiones grados/radianes.
                </div>
                <div className={styles.escenarioExample}>Ejemplo: sin(30°) = 0,5 → cateto opuesto = hipotenusa × 0,5</div>
                <div className={styles.escenarioTip}>Truco: usa la secuencia √0/2, √1/2, √2/2, √3/2, √4/2 para sin(0°, 30°, 45°, 60°, 90°)</div>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏛️</span>
                  <div>
                    <div className={styles.casoTitle}>Arquitecto</div>
                    <div className={styles.casoSubtitle}>Inclinaciones de tejados y rampas</div>
                  </div>
                </div>
                <div className={styles.casoDesc}>
                  Calcula inclinaciones de tejados: un tejado con pendiente 30° tiene
                  un ratio de 1:1,732 (tan(30°) = 1/√3). Para una rampa accesible (máx 8°),
                  una longitud horizontal de 6 m requiere una altura máxima de 6×tan(8°) ≈ 0,84 m.
                </div>
                <div className={styles.escenarioExample}>Ejemplo: altura tejado = base × tan(ángulo pendiente)</div>
                <div className={styles.escenarioTip}>Normativa CTE: pendiente tejados residenciales entre 15° y 35° según material</div>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>⛵</span>
                  <div>
                    <div className={styles.casoTitle}>Navegante</div>
                    <div className={styles.casoSubtitle}>Distancias y triangulación GPS</div>
                  </div>
                </div>
                <div className={styles.casoDesc}>
                  Aplica la ley del seno para triangulación: con dos puntos conocidos A y B
                  separados 10 km y los ángulos hacia el objetivo (62° y 71°), calcula la
                  distancia exacta. El tercer ángulo es 180°-62°-71° = 47°, y por ley del seno:
                  distancia = 10×sin(62°)/sin(47°) ≈ 12,1 km.
                </div>
                <div className={styles.escenarioExample}>Ley del seno: a/sin(A) = b/sin(B) = c/sin(C)</div>
                <div className={styles.escenarioTip}>GPS moderno usa triangulación con 4+ satélites, el mismo principio trigonométrico en 3D</div>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>📡</span>
                  <div>
                    <div className={styles.casoTitle}>Ingeniero de Señales</div>
                    <div className={styles.casoSubtitle}>Análisis de señales periódicas</div>
                  </div>
                </div>
                <div className={styles.casoDesc}>
                  La corriente alterna sigue A·sin(2πft + φ): una señal de 50 Hz con amplitud
                  230 V y fase inicial 0 tiene valor 230·sin(2π·50·t). Con identidades de suma
                  se analiza interferencia: dos señales con desfase de 90° se combinan
                  como sin(θ) + cos(θ) = √2·sin(θ + 45°).
                </div>
                <div className={styles.escenarioExample}>Señal CA: v(t) = 230·sin(2π·50·t) voltios</div>
                <div className={styles.escenarioTip}>La Transformada de Fourier descompone cualquier señal en sumas de senos y cosenos</div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>❓ Preguntas Frecuentes sobre Trigonometría</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cuándo usar seno vs coseno vs tangente?</div>
                <div className={styles.faqRespuesta}>
                  Depende de qué datos tienes y qué buscas en el triángulo rectángulo: usa <strong>seno</strong> cuando
                  conoces la hipotenusa y buscas el lado opuesto (o viceversa). Usa <strong>coseno</strong> para la
                  relación entre hipotenusa y lado adyacente. Usa <strong>tangente</strong> cuando trabajas con los
                  dos catetos sin necesitar la hipotenusa. En física, las componentes de un vector de módulo F
                  y ángulo θ son: Fx = F·cos(θ) y Fy = F·sin(θ).
                  <div className={styles.faqTip}>Mnemotecnia: SOH-CAH-TOA — Sin=Opuesto/Hipotenusa, Cos=Adyacente/Hipotenusa, Tan=Opuesto/Adyacente</div>
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es el círculo unitario y para qué sirve?</div>
                <div className={styles.faqRespuesta}>
                  Es un círculo de radio 1 centrado en el origen de coordenadas. Para cualquier ángulo θ,
                  el punto de la circunferencia es exactamente <strong>(cos θ, sin θ)</strong>. Esto permite definir
                  las funciones trigonométricas para CUALQUIER ángulo, no solo los agudos de 0° a 90°.
                  Explica por qué sin(120°) = sin(60°) = √3/2, los signos en cada cuadrante (I: todo+,
                  II: sin+, III: tan+, IV: cos+), y la periodicidad de las funciones.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Diferencia entre grados y radianes?</div>
                <div className={styles.faqRespuesta}>
                  Los grados dividen el círculo en 360 partes iguales (convención histórica).
                  Los radianes miden el ángulo como la longitud de arco en el círculo unitario:
                  360° = 2π rad ≈ 6,283 rad. Para convertir: <strong>radianes = grados × π/180</strong>.
                  Los radianes son más &ldquo;naturales&rdquo; en matemáticas: la derivada de sin(x) en radianes
                  es cos(x) directamente; en grados aparecería un factor (π/180) que complica todo.
                  Ángulos clave: 30° = π/6 rad, 45° = π/4 rad, 60° = π/3 rad, 90° = π/2 rad.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cómo memorizar los valores exactos de 30°, 45° y 60°?</div>
                <div className={styles.faqRespuesta}>
                  Usa dos triángulos especiales: el <strong>30-60-90</strong> (lados 1, √3, 2) y el <strong>45-45-90</strong> (lados 1, 1, √2).
                  Para el seno, aplica la secuencia √0/2, √1/2, √2/2, √3/2, √4/2 para los ángulos 0°, 30°, 45°, 60°, 90°:
                  sin(0°)=0, sin(30°)=0,5, sin(45°)=√2/2≈0,707, sin(60°)=√3/2≈0,866, sin(90°)=1.
                  Para el coseno, la secuencia está invertida: cos(0°)=1, cos(30°)≈0,866, cos(60°)=0,5.
                  Para la tangente: tan(30°)=1/√3≈0,577, tan(45°)=1, tan(60°)=√3≈1,732.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es arcsen/arccos/arctan y cuándo se usan?</div>
                <div className={styles.faqRespuesta}>
                  Son las <strong>funciones inversas</strong>: si sin(θ)=0,5, entonces arcsin(0,5)=30°. Se usan cuando
                  conoces el valor de la razón trigonométrica y necesitas encontrar el ángulo.
                  Rangos de retorno: arcsin devuelve [-90°, 90°], arccos devuelve [0°, 180°],
                  arctan devuelve (-90°, 90°). Atención: arctan(y/x) puede dar el ángulo en el cuadrante
                  incorrecto; usa atan2(y,x) en programación para obtener el cuadrante correcto.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cómo resolver triángulos no rectángulos (ley del seno y coseno)?</div>
                <div className={styles.faqRespuesta}>
                  Para triángulos oblicuángulos (sin ángulo de 90°) necesitas leyes generales:
                  <br />- <strong>Ley del seno</strong>: a/sin(A) = b/sin(B) = c/sin(C). Úsala cuando tienes un par ángulo-lado
                  y otro dato (caso ALA o AAL).
                  <br />- <strong>Ley del coseno</strong>: c² = a² + b² - 2ab·cos(C). Úsala cuando tienes tres lados (LLL)
                  o dos lados y el ángulo entre ellos (LAL). Es una generalización del Teorema de Pitágoras.
                  <div className={styles.faqTip}>Si el ángulo C=90°, la ley del coseno se reduce a c²=a²+b² (Pitágoras)</div>
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Para qué sirve la trigonometría en física?</div>
                <div className={styles.faqRespuesta}>
                  La trigonometría es omnipresente en física: <strong>Mecánica</strong>: descomposición de fuerzas en
                  componentes (Fx=F·cos θ, Fy=F·sin θ), plano inclinado (fuerza paralela = mg·sin θ).
                  <strong> Ondas</strong>: una onda sinusoidal es y(t) = A·sin(2πft + φ), donde A es amplitud, f frecuencia
                  y φ fase. <strong>Electricidad</strong>: la corriente alterna sigue v(t) = 230·sin(2π·50·t) en España (50 Hz).
                  <strong> Óptica</strong>: la ley de Snell n₁·sin(θ₁) = n₂·sin(θ₂) describe la refracción de la luz.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué son las identidades trigonométricas fundamentales?</div>
                <div className={styles.faqRespuesta}>
                  Las identidades son igualdades que se cumplen para cualquier ángulo:
                  <br />- <strong>Pitagórica</strong>: sin²θ + cos²θ = 1 (la más importante, es Pitágoras en el círculo unitario)
                  <br />- <strong>Cociente</strong>: tan θ = sin θ / cos θ
                  <br />- <strong>Ángulo doble</strong>: sin(2θ) = 2·sin θ·cos θ; cos(2θ) = cos²θ - sin²θ
                  <br />- <strong>Suma de ángulos</strong>: sin(A+B) = sin A·cos B + cos A·sin B
                  <br />- <strong>Recíprocas</strong>: csc θ = 1/sin θ, sec θ = 1/cos θ, cot θ = 1/tan θ
                </div>
              </div>
            </div>
          </section>

          {/* Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>🗺️ Cómo resolver cualquier triángulo: 7 pasos</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <div className={styles.pasoTitle}>Identifica los datos conocidos</div>
                  <div className={styles.pasoDesc}>
                    Anota qué tienes: lados (a, b, c) y/o ángulos (A, B, C). Para un triángulo
                    rectángulo necesitas al menos 2 datos (un lado + un ángulo, o dos lados).
                    Para un triángulo oblicuángulo necesitas 3 datos que incluyan al menos un lado.
                  </div>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <div className={styles.pasoTitle}>Dibuja y etiqueta el triángulo</div>
                  <div className={styles.pasoDesc}>
                    Dibuja el triángulo con todos los datos anotados. En triángulo rectángulo,
                    marca el ángulo recto (90°) con un cuadradito. La hipotenusa es SIEMPRE el
                    lado más largo, opuesto al ángulo de 90°. Los otros dos son catetos.
                  </div>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <div className={styles.pasoTitle}>¿Es rectángulo u oblicuángulo?</div>
                  <div className={styles.pasoDesc}>
                    Si tiene un ángulo de 90°, usa SOH-CAH-TOA directamente.
                    Si no tiene ningún ángulo de 90° (oblicuángulo), decide qué ley aplicar:
                    Ley del seno si tienes ángulo-lado-ángulo (ALA) o ángulo-ángulo-lado (AAL).
                    Ley del coseno si tienes lado-ángulo-lado (LAL) o tres lados (LLL).
                  </div>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <div className={styles.pasoTitle}>Elige el ángulo de referencia θ</div>
                  <div className={styles.pasoDesc}>
                    En triángulos rectángulos, el cateto &ldquo;opuesto&rdquo; y &ldquo;adyacente&rdquo; dependen
                    de cuál ángulo eliges como θ. Elige el ángulo que conozcas o el que quieras calcular.
                    El ángulo complementario es siempre (90° - θ), ya que los tres suman 180°.
                  </div>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div className={styles.stepContent}>
                  <div className={styles.pasoTitle}>Aplica la fórmula adecuada</div>
                  <div className={styles.pasoDesc}>
                    Triángulo rectángulo: sin(θ)=O/H, cos(θ)=A/H, tan(θ)=O/A. Despeja la incógnita
                    antes de sustituir números. Ley del seno: a/sin(A) = b/sin(B).
                    Ley del coseno: c² = a² + b² - 2ab·cos(C). Usa la calculadora con la unidad correcta (grados o radianes).
                  </div>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>6</span>
                <div className={styles.stepContent}>
                  <div className={styles.pasoTitle}>Calcula el lado o ángulo desconocido</div>
                  <div className={styles.pasoDesc}>
                    Si buscas un lado: multiplica o divide directamente (ej: cateto = hipotenusa × sin(θ)).
                    Si buscas un ángulo: usa la función inversa (arcsin, arccos o arctan).
                    Ejemplo: si sin(θ)=0,5 → θ = arcsin(0,5) = 30°.
                  </div>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>7</span>
                <div className={styles.stepContent}>
                  <div className={styles.pasoTitle}>Verifica el resultado con 3 comprobaciones</div>
                  <div className={styles.pasoDesc}>
                    1) Suma de ángulos = 180° (obligatorio en todo triángulo).
                    2) En triángulo rectángulo: a² + b² = c² (Pitágoras). La hipotenusa debe ser el lado más largo.
                    3) Coherencia del resultado: un ángulo no puede ser mayor de 180°, un lado no puede ser negativo.
                    Si algo no cuadra, busca el error desde el paso 1.
                  </div>
                </div>
              </li>
            </ol>
          </section>

          {/* Mejores Prácticas */}
          <section className={styles.guideSection}>
            <h2>💡 Mejores Prácticas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">✏️</span>
                <div>
                  <strong>Dibuja siempre el triángulo</strong>
                  <p>Aunque el enunciado sea sencillo, un boceto evita confundir &ldquo;opuesto&rdquo; con &ldquo;adyacente&rdquo;.
                  Etiqueta los tres vértices (A, B, C) y los tres lados (a, b, c) donde a es el lado opuesto al ángulo A.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔢</span>
                <div>
                  <strong>Verifica que los ángulos suman 180°</strong>
                  <p>En cualquier triángulo plano, A + B + C = 180°. Si al final tu suma no da exactamente 180°,
                  hay un error en algún cálculo. Esta comprobación es gratuita y elimina la mayoría de errores.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <div>
                  <strong>Ley del seno para caso ALA o AAL</strong>
                  <p>Cuando tienes un ángulo y su lado opuesto conocidos, más cualquier otro dato,
                  la ley del seno es la más directa: a/sin(A) = b/sin(B) = c/sin(C).
                  Úsala también para verificar un resultado calculado por otro método.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📐</span>
                <div>
                  <strong>Domina SOHCAHTOA de memoria</strong>
                  <p>SOH: Seno = Opuesto / Hipotenusa. CAH: Coseno = Adyacente / Hipotenusa.
                  TOA: Tangente = Opuesto / Adyacente. Con esta regla puedes escribir las 3 fórmulas
                  principales en 5 segundos, incluso en un examen bajo presión.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🎯</span>
                <div>
                  <strong>Memoriza los ángulos notables con los triángulos especiales</strong>
                  <p>Triángulo 30-60-90 (lados 1, √3, 2): extrae sin/cos/tan de 30° y 60°.
                  Triángulo 45-45-90 (lados 1, 1, √2): extrae los valores de 45°.
                  Con solo estos dos triángulos, puedes calcular los 5 ángulos notables sin memorizar tablas.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                <div>
                  <strong>Recíprocas: calcula primero sin/cos/tan</strong>
                  <p>Si necesitas csc, sec o cot y no las recuerdas, calcula primero su función base
                  y luego haz el inverso: csc(θ) = 1/sin(θ), sec(θ) = 1/cos(θ), cot(θ) = 1/tan(θ).
                  Ejemplo: csc(30°) = 1/sin(30°) = 1/0,5 = 2.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Warning Box — Errores Frecuentes */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores Típicos que Debes Evitar</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Grados vs radianes en la calculadora:</strong> tan(90°) = ∞, pero tan(90) en radianes ≈ -1,995.
                  Antes de cada cálculo, comprueba que tu calculadora está en el modo correcto.
                  Este es el error más frecuente en exámenes.
                </li>
                <li>
                  <strong>Usar SOH-CAH-TOA en triángulos no rectángulos:</strong> sin(A)/a = sin(B)/b solo funciona
                  con la ley del seno. En triángulos oblicuángulos, SOH-CAH-TOA da resultados incorrectos
                  porque no hay hipotenusa ni ángulo recto de referencia.
                </li>
                <li>
                  <strong>arctan devuelve el ángulo en el cuadrante incorrecto:</strong> arctan(y/x) solo devuelve
                  resultados en (-90°, 90°). Si el punto está en el II o III cuadrante (x negativa),
                  debes sumar 180°. En programación, usa atan2(y, x) para obtener el ángulo correcto.
                </li>
                <li>
                  <strong>Redondear en pasos intermedios:</strong> Si calculas sin(30°) = 0,5 y luego lo redondeas
                  a 0,50 antes de multiplicar, el error se acumula. Guarda todos los decimales hasta el
                  resultado final y redondea solo ahí.
                </li>
                <li>
                  <strong>sin(A+B) ≠ sin(A) + sin(B):</strong> Error algebraico muy común. La fórmula correcta es
                  sin(A+B) = sin(A)·cos(B) + cos(A)·sin(B). Del mismo modo,
                  cos(A+B) = cos(A)·cos(B) - sin(A)·sin(B).
                </li>
                <li>
                  <strong>Confundir cuál es la hipotenusa:</strong> La hipotenusa es SIEMPRE el lado más largo,
                  opuesto al ángulo recto de 90°. Si etiquetas mal la hipotenusa, todas las razones
                  SOH-CAH-TOA quedan invertidas y el resultado es erróneo.
                </li>
              </ul>
            </div>
          </section>

          {/* Conceptos fundamentales (mantenido) */}
          <section className={styles.guideSection}>
            <h2>📖 Conceptos Fundamentales</h2>
            <p className={styles.introParagraph}>
              La trigonometría estudia las relaciones entre los ángulos y los lados de los triángulos.
              Es fundamental en física, ingeniería, navegación, astronomía y gráficos por computadora.
            </p>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>Funciones Básicas (SOH-CAH-TOA)</h4>
                <p>
                  sin(θ) = opuesto/hipotenusa, cos(θ) = adyacente/hipotenusa,
                  tan(θ) = opuesto/adyacente. Son la base de toda la trigonometría aplicada.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>El Círculo Unitario</h4>
                <p>
                  Un círculo de radio 1 donde cualquier punto (x,y) = (cos θ, sin θ).
                  Permite extender las funciones a ángulos mayores de 90° y negativos.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Identidades Pitagóricas</h4>
                <p>
                  sin²θ + cos²θ = 1 (siempre). Dividiendo por cos²: 1 + tan²θ = sec²θ.
                  Dividiendo por sin²: cot²θ + 1 = csc²θ.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Radianes vs Grados vs Gradianes</h4>
                <p>
                  360° = 2π rad = 400 gon (gradianes). Conversión: grados × π/180 = radianes.
                  Los gradianes se usan en topografía (100 gon = ángulo recto).
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Ángulos de Suma y Resta</h4>
                <p>
                  sin(A±B) = sin·cos ± cos·sin. cos(A±B) = cos·cos ∓ sin·sin.
                  Estas identidades son la base de los ángulos dobles y mitad.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Cuadrantes y Signos</h4>
                <p>
                  I (0°-90°): todos positivos. II (90°-180°): solo sin+. III (180°-270°): solo tan+.
                  IV (270°-360°): solo cos+. Regla CAST (sentido antihorario).
                </p>
              </div>
            </div>
          </section>

        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-trigonometria')} />

      <ShareCard appName="calculadora-trigonometria" />
      <Footer appName="calculadora-trigonometria" />
    </div>
  );
}
