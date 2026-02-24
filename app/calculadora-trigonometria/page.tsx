'use client';

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
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Función</th>
                  <th>Definición (triángulo)</th>
                  <th>Período</th>
                  <th>Dominio</th>
                  <th>Rango</th>
                  <th>Inversa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>sin(θ)</strong></td>
                  <td>opuesto / hipotenusa</td>
                  <td>2π (360°)</td>
                  <td>ℝ (todos)</td>
                  <td>[-1, 1]</td>
                  <td>arcsin</td>
                </tr>
                <tr>
                  <td><strong>cos(θ)</strong></td>
                  <td>adyacente / hipotenusa</td>
                  <td>2π (360°)</td>
                  <td>ℝ (todos)</td>
                  <td>[-1, 1]</td>
                  <td>arccos</td>
                </tr>
                <tr>
                  <td><strong>tan(θ)</strong></td>
                  <td>opuesto / adyacente</td>
                  <td>π (180°)</td>
                  <td>θ ≠ 90°+n·180°</td>
                  <td>ℝ (todos)</td>
                  <td>arctan</td>
                </tr>
                <tr>
                  <td><strong>csc(θ)</strong></td>
                  <td>hipotenusa / opuesto</td>
                  <td>2π (360°)</td>
                  <td>θ ≠ n·180°</td>
                  <td>(-∞,-1] ∪ [1,∞)</td>
                  <td>arccsc</td>
                </tr>
                <tr>
                  <td><strong>sec(θ)</strong></td>
                  <td>hipotenusa / adyacente</td>
                  <td>2π (360°)</td>
                  <td>θ ≠ 90°+n·180°</td>
                  <td>(-∞,-1] ∪ [1,∞)</td>
                  <td>arcsec</td>
                </tr>
                <tr>
                  <td><strong>cot(θ)</strong></td>
                  <td>adyacente / opuesto</td>
                  <td>π (180°)</td>
                  <td>θ ≠ n·180°</td>
                  <td>ℝ (todos)</td>
                  <td>arccot</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Casos de uso */}
          <section className={styles.guideSection}>
            <h2>👥 ¿Quién usa esta calculadora?</h2>
            <div className={styles.casosUsoGrid}>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🎓</div>
                <div className={styles.casoTitle}>Estudiante de Bachillerato</div>
                <div className={styles.casoSubtitle}>Matemáticas II, Física</div>
                <div className={styles.casoDesc}>
                  Los triángulos rectángulos, funciones básicas y conversiones grados/radianes
                  son contenido esencial de Matemáticas II y Física de Bachillerato.
                  Comprueba tus ejercicios y entiende el significado de cada función.
                </div>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🏗️</div>
                <div className={styles.casoTitle}>Estudiante de Ingeniería</div>
                <div className={styles.casoSubtitle}>Civil, Eléctrica, Mecánica, Telecomunicaciones</div>
                <div className={styles.casoDesc}>
                  Las identidades, ángulos dobles y funciones recíprocas aparecen constantemente
                  en análisis de señales, mecánica de sólidos y cálculo vectorial.
                  Verifica tus cálculos de forma rápida y precisa.
                </div>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🎮</div>
                <div className={styles.casoTitle}>Desarrollador de Videojuegos / 3D</div>
                <div className={styles.casoSubtitle}>Gráficos, rotaciones, coordenadas polares</div>
                <div className={styles.casoDesc}>
                  Las transformaciones 3D, rotaciones de objetos y cálculo de trayectorias
                  usan sin y cos constantemente. El círculo unitario es la base de
                  todo movimiento circular en motores como Unity o Unreal.
                </div>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🗺️</div>
                <div className={styles.casoTitle}>Topógrafo / Técnico de Obras</div>
                <div className={styles.casoSubtitle}>Levantamiento topográfico, cálculo de distancias</div>
                <div className={styles.casoDesc}>
                  La resolución de triángulos permite calcular alturas de edificios,
                  distancias inaccesibles y desniveles del terreno. Los gradianes
                  (400 gon = vuelta completa) se usan en instrumentos topográficos.
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>❓ Preguntas Frecuentes sobre Trigonometría</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es SOH-CAH-TOA y cómo usarlo?</div>
                <div className={styles.faqRespuesta}>
                  Es una regla mnemotécnica para las tres funciones básicas en un triángulo rectángulo:
                  SOH = Seno es Opuesto sobre Hipotenusa (sin = O/H),
                  CAH = Coseno es Adyacente sobre Hipotenusa (cos = A/H),
                  TOA = Tangente es Opuesto sobre Adyacente (tan = O/A).
                  Identifica primero el ángulo de referencia θ y luego clasifica los lados.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Por qué los radianes son más "naturales" que los grados?</div>
                <div className={styles.faqRespuesta}>
                  En radianes, la derivada de sin(x) es cos(x) directamente. En grados, aparecería
                  un factor (π/180) que complica los cálculos. Además, la longitud de arco es simplemente
                  s = r·θ en radianes, sin factores de conversión. Por eso en cálculo, física avanzada
                  y programación siempre se usan radianes internamente.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cuándo se indefine la tangente y la cotangente?</div>
                <div className={styles.faqRespuesta}>
                  tan(θ) = sin(θ)/cos(θ), así que se indefine cuando cos(θ) = 0, es decir en θ = 90°, 270°
                  (y en general 90° + n·180°). La cot(θ) = cos(θ)/sin(θ) se indefine cuando sin(θ) = 0,
                  es decir en θ = 0°, 180°, 360° (y en general n·180°).
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cómo memorizo los valores de los ángulos notables?</div>
                <div className={styles.faqRespuesta}>
                  Usa los triángulos especiales: el triángulo 30-60-90 tiene lados 1, √3, 2 (hipotenusa).
                  El triángulo 45-45-90 tiene lados 1, 1, √2. A partir de ahí: sin(30°)=1/2, sin(45°)=√2/2,
                  sin(60°)=√3/2. Para cos, los valores están invertidos. Truco: imagina una secuencia
                  √0/2, √1/2, √2/2, √3/2, √4/2 para sin(0°, 30°, 45°, 60°, 90°).
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es el círculo unitario y por qué es tan importante?</div>
                <div className={styles.faqRespuesta}>
                  Es un círculo de radio 1 centrado en el origen. Para cualquier ángulo θ, el punto
                  de la circunferencia es exactamente (cos θ, sin θ). Permite definir las funciones
                  trigonométricas para CUALQUIER ángulo (no solo agudos), incluyendo ángulos negativos,
                  mayores de 360°, y explicar los signos en cada cuadrante.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cuándo uso sin, cos o tan en un problema de física?</div>
                <div className={styles.faqRespuesta}>
                  Depende de qué lado conoces: si conoces la hipotenusa y buscas el opuesto → sin.
                  Si conoces la hipotenusa y buscas el adyacente → cos. Si conoces los dos catetos
                  o buscas el ángulo dada la razón entre ellos → tan. En física: componentes de
                  vectores usan sin/cos; pendientes y ángulos entre lados usan tan.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué son arcsin, arccos, arctan y cuándo se usan?</div>
                <div className={styles.faqRespuesta}>
                  Son las funciones inversas. Si sin(θ) = 0,5, entonces arcsin(0,5) = 30°.
                  Se usan cuando conoces el valor de la función y buscas el ángulo.
                  Importante: arcsin devuelve valores en [-90°, 90°], arccos en [0°, 180°]
                  y arctan en (-90°, 90°). Para ángulos fuera de ese rango, usa los cuadrantes.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué relación hay entre Pitágoras y sin²θ + cos²θ = 1?</div>
                <div className={styles.faqRespuesta}>
                  Son la misma cosa en el círculo unitario. Si (cos θ, sin θ) es un punto en la
                  circunferencia de radio 1, entonces por Pitágoras: cos²θ + sin²θ = 1² = 1.
                  La identidad pitagórica fundamental NO es una fórmula independiente, es el
                  Teorema de Pitágoras aplicado al círculo unitario.
                </div>
              </div>
            </div>
          </section>

          {/* Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>🗺️ Cómo resolver un triángulo rectángulo: 6 pasos</h2>
            <ol className={styles.pasosList}>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>1</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Identifica los datos conocidos</div>
                  <div className={styles.pasoDesc}>
                    ¿Qué tienes? ¿Dos lados? ¿Un lado y un ángulo? ¿Solo ángulos?
                    Con dos lados puedes calcular todo. Con un lado y un ángulo agudo también.
                    Solo con ángulos puedes calcular proporciones pero no medidas exactas.
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>2</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Dibuja y etiqueta el triángulo</div>
                  <div className={styles.pasoDesc}>
                    Dibuja el triángulo con el ángulo recto (90°) marcado. Llama a los lados:
                    cateto opuesto (a), cateto adyacente (b), hipotenusa (c).
                    La hipotenusa es SIEMPRE el lado más largo, opuesto al ángulo recto.
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>3</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Elige el ángulo de referencia θ</div>
                  <div className={styles.pasoDesc}>
                    El cateto &ldquo;opuesto&rdquo; y &ldquo;adyacente&rdquo; dependen de cuál ángulo eliges como θ.
                    Elige el ángulo que conozcas o el que quieras calcular.
                    El ángulo complementario es (90° - θ).
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>4</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Aplica SOH-CAH-TOA</div>
                  <div className={styles.pasoDesc}>
                    Según los datos disponibles: si conoces hipotenusa y buscas opuesto → sin(θ) = O/H.
                    Si buscas adyacente → cos(θ) = A/H. Si conoces los dos catetos → tan(θ) = O/A.
                    Despeja el incógnito algebraicamente antes de calcular.
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>5</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Calcula el lado o ángulo desconocido</div>
                  <div className={styles.pasoDesc}>
                    Si buscas un lado: multiplica o divide directamente. Si buscas un ángulo:
                    usa la función inversa (arcsin, arccos o arctan). Comprueba que los resultados
                    sean positivos y que los ángulos estén en el rango correcto (0° a 90°).
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>6</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Verifica el resultado</div>
                  <div className={styles.pasoDesc}>
                    Comprobación 1: Teorema de Pitágoras — a² + b² = c². Si no cuadra, hay un error.
                    Comprobación 2: Los tres ángulos deben sumar 180° (90° + θ + (90°-θ) = 180°).
                    Comprobación 3: La hipotenusa debe ser el lado más largo.
                  </div>
                </div>
              </li>
            </ol>
          </section>

          {/* Tips y Errores */}
          <section className={styles.guideSection}>
            <h2>💡 Tips y Errores Frecuentes</h2>
            <div className={styles.tipsErrorsSection}>
              <div className={styles.tipsColumn}>
                <div className={styles.tipsHeader}>✅ Tips de Experto</div>
                <div className={styles.tipItem}>
                  Para memorizar ángulos notables: triángulo 30-60-90 (lados 1, √3, 2)
                  y triángulo 45-45-90 (lados 1, 1, √2). Con estos dos lo tienes todo.
                </div>
                <div className={styles.tipItem}>
                  Antes de calcular, verifica el modo de tu calculadora: grados o radianes.
                  Un error de modo es la causa más frecuente de resultados incorrectos.
                </div>
                <div className={styles.tipItem}>
                  Para pasar grados a radianes: multiplica por π/180.
                  Para pasar radianes a grados: multiplica por 180/π.
                  (Regla fácil: 180° = π, 360° = 2π, 90° = π/2).
                </div>
                <div className={styles.tipItem}>
                  Las funciones recíprocas se derivan siempre: csc = 1/sin, sec = 1/cos, cot = 1/tan.
                  Si las olvidas, calcula primero sin/cos/tan y luego toma el inverso.
                </div>
                <div className={styles.tipItem}>
                  En el círculo unitario, el punto en el ángulo θ es (cos θ, sin θ).
                  El signo de cada función depende del cuadrante (I: todo+, II: sin+, III: tan+, IV: cos+).
                </div>
                <div className={styles.tipItem}>
                  Para coordenadas polares → rectangulares: x = r·cos(θ), y = r·sin(θ).
                  Para rectangular → polar: r = √(x²+y²), θ = arctan(y/x) ajustando cuadrante.
                </div>
              </div>
              <div className={styles.tipsColumn}>
                <div className={styles.errorsHeader}>❌ Errores Frecuentes</div>
                <div className={styles.errorItem}>
                  Confundir cuál es la hipotenusa. La hipotenusa es siempre el lado más largo,
                  opuesto al ángulo recto de 90°. Los otros dos son catetos.
                </div>
                <div className={styles.errorItem}>
                  Mezclar grados y radianes. tan(90°) = ∞, pero tan(90) en radianes
                  ≈ -1,995. Verifica siempre el modo de la calculadora.
                </div>
                <div className={styles.errorItem}>
                  Usar sin(A+B) = sin(A) + sin(B): ¡FALSO! La fórmula correcta es
                  sin(A+B) = sin(A)·cos(B) + cos(A)·sin(B).
                </div>
                <div className={styles.errorItem}>
                  Asumir que arcsin(sin(x)) = x para cualquier x. Solo es válido para
                  x ∈ [-90°, 90°]. Para ángulos mayores, la función recorta el resultado.
                </div>
                <div className={styles.errorItem}>
                  Olvidar que tan y cot no están definidas en ciertos ángulos.
                  tan es indefinida en 90°, 270°... y cot en 0°, 180°, 360°...
                </div>
                <div className={styles.errorItem}>
                  No verificar que los ángulos de un triángulo sumen 180°.
                  En un rectángulo es 90°+α+β=180°, así que α+β=90° (son complementarios).
                </div>
              </div>
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
