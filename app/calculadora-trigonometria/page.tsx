'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraTrigonometria.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, LegalNotice } from '@/components';
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
                    value={formatNumber(resultados.seno, 8)}
                    variant="highlight"
                    icon="sin"
                  />
                  <ResultCard
                    title="cos(θ)"
                    value={formatNumber(resultados.coseno, 8)}
                    variant="highlight"
                    icon="cos"
                  />
                  <ResultCard
                    title="tan(θ)"
                    value={resultados.tangente !== null ? formatNumber(resultados.tangente, 8) : '∞'}
                    variant="highlight"
                    icon="tan"
                  />
                  <ResultCard
                    title="csc(θ)"
                    value={resultados.cosecante !== null ? formatNumber(resultados.cosecante, 8) : '∞'}
                    variant="info"
                    icon="csc"
                  />
                  <ResultCard
                    title="sec(θ)"
                    value={resultados.secante !== null ? formatNumber(resultados.secante, 8) : '∞'}
                    variant="info"
                    icon="sec"
                  />
                  <ResultCard
                    title="cot(θ)"
                    value={resultados.cotangente !== null ? formatNumber(resultados.cotangente, 8) : '∞'}
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
                    value={formatNumber(resultados.anguloRad, 6)}
                    variant="default"
                    icon="rad"
                  />
                </>
              )}

              {resultados.tipo === 'triangulo' && (
                <>
                  <ResultCard
                    title="Cateto a"
                    value={formatNumber(resultados.catetoA, 4)}
                    variant="default"
                    icon="a"
                  />
                  <ResultCard
                    title="Cateto b"
                    value={formatNumber(resultados.catetoB, 4)}
                    variant="default"
                    icon="b"
                  />
                  <ResultCard
                    title="Hipotenusa c"
                    value={formatNumber(resultados.hipotenusa, 4)}
                    variant="highlight"
                    icon="c"
                  />
                  <ResultCard
                    title="Ángulo A"
                    value={formatNumber(resultados.anguloA, 4)}
                    unit="°"
                    variant="info"
                    icon="α"
                  />
                  <ResultCard
                    title="Ángulo B"
                    value={formatNumber(resultados.anguloB, 4)}
                    unit="°"
                    variant="info"
                    icon="β"
                  />
                  <ResultCard
                    title="Área"
                    value={formatNumber(resultados.area, 4)}
                    unit="u²"
                    variant="default"
                    icon="📐"
                  />
                  <ResultCard
                    title="Perímetro"
                    value={formatNumber(resultados.perimetro, 4)}
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
                    value={formatNumber(resultados.grados, 6)}
                    unit="°"
                    variant="highlight"
                    icon="°"
                  />
                  <ResultCard
                    title="Radianes"
                    value={formatNumber(resultados.radianes, 6)}
                    variant="highlight"
                    icon="rad"
                  />
                  <ResultCard
                    title="Gradianes"
                    value={formatNumber(resultados.gradianes, 6)}
                    unit="gon"
                    variant="info"
                    icon="gon"
                  />
                  <ResultCard
                    title="Fracción de π"
                    value={resultados.fraccionPi}
                    variant="info"
                    icon="π"
                  />
                </>
              )}

              {resultados.tipo === 'identidades' && (
                <>
                  <ResultCard
                    title="sin²θ + cos²θ"
                    value={formatNumber(resultados.sin2cos2, 8)}
                    variant="success"
                    icon="="
                    description="Siempre = 1"
                  />
                  <ResultCard
                    title="sin(2θ)"
                    value={formatNumber(resultados.sin2a, 8)}
                    variant="highlight"
                    icon="2θ"
                    description="= 2·sin(θ)·cos(θ)"
                  />
                  <ResultCard
                    title="cos(2θ)"
                    value={formatNumber(resultados.cos2a, 8)}
                    variant="highlight"
                    icon="2θ"
                    description="= cos²θ - sin²θ"
                  />
                  <ResultCard
                    title="sin(θ/2)"
                    value={formatNumber(resultados.sinMitad, 8)}
                    variant="info"
                    icon="θ/2"
                  />
                  <ResultCard
                    title="cos(θ/2)"
                    value={formatNumber(resultados.cosMitad, 8)}
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
        title="📚 ¿Quieres aprender más sobre Trigonometría?"
        subtitle="Funciones, identidades y aplicaciones prácticas"
      >
        <section className={styles.guideSection}>
          <h2>Trigonometría: Conceptos Fundamentales</h2>
          <p className={styles.introParagraph}>
            La trigonometría estudia las relaciones entre los ángulos y los lados de los triángulos.
            Es fundamental en física, ingeniería, navegación, astronomía y gráficos por computadora.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Funciones Básicas</h4>
              <p>
                En un triángulo rectángulo: sin(θ) = opuesto/hipotenusa,
                cos(θ) = adyacente/hipotenusa, tan(θ) = opuesto/adyacente.
                SOH-CAH-TOA es una regla mnemotécnica popular.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>El Círculo Unitario</h4>
              <p>
                Un círculo de radio 1 donde cualquier punto (x,y) corresponde a
                (cos(θ), sin(θ)). Permite extender las funciones a cualquier ángulo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Identidades Pitagóricas</h4>
              <p>
                sin²θ + cos²θ = 1 (siempre). De aquí se derivan:
                1 + tan²θ = sec²θ y 1 + cot²θ = csc²θ.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Radianes vs Grados</h4>
              <p>
                360° = 2π radianes. Los radianes son la unidad natural en cálculo.
                π radianes = 180°. Gradianes: 400 gon = círculo completo.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-trigonometria')} />

      <Footer appName="calculadora-trigonometria" />
    </div>
  );
}
