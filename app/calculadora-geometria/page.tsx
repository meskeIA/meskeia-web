'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraGeometria.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type Figura2D = 'cuadrado' | 'rectangulo' | 'triangulo' | 'circulo' | 'trapecio' | 'rombo' | 'pentagono' | 'hexagono';
type Figura3D = 'cubo' | 'prisma' | 'cilindro' | 'esfera' | 'cono' | 'piramide';
type Dimension = '2D' | '3D';

export default function CalculadoraGeometriaPage() {
  const [dimension, setDimension] = useState<Dimension>('2D');
  const [figura2D, setFigura2D] = useState<Figura2D>('cuadrado');
  const [figura3D, setFigura3D] = useState<Figura3D>('cubo');

  // Valores comunes
  const [lado, setLado] = useState('');
  const [base, setBase] = useState('');
  const [altura, setAltura] = useState('');
  const [radio, setRadio] = useState('');
  const [ladoB, setLadoB] = useState(''); // segundo lado o base menor
  const [diagonal1, setDiagonal1] = useState('');
  const [diagonal2, setDiagonal2] = useState('');
  const [apotema, setApotema] = useState('');

  const figuras2D: { id: Figura2D; nombre: string; icono: string }[] = [
    { id: 'cuadrado', nombre: 'Cuadrado', icono: '⬜' },
    { id: 'rectangulo', nombre: 'Rectángulo', icono: '▬' },
    { id: 'triangulo', nombre: 'Triángulo', icono: '△' },
    { id: 'circulo', nombre: 'Círculo', icono: '⭕' },
    { id: 'trapecio', nombre: 'Trapecio', icono: '⏢' },
    { id: 'rombo', nombre: 'Rombo', icono: '◇' },
    { id: 'pentagono', nombre: 'Pentágono', icono: '⬠' },
    { id: 'hexagono', nombre: 'Hexágono', icono: '⬡' },
  ];

  const figuras3D: { id: Figura3D; nombre: string; icono: string }[] = [
    { id: 'cubo', nombre: 'Cubo', icono: '📦' },
    { id: 'prisma', nombre: 'Prisma', icono: '🧱' },
    { id: 'cilindro', nombre: 'Cilindro', icono: '🥫' },
    { id: 'esfera', nombre: 'Esfera', icono: '🔴' },
    { id: 'cono', nombre: 'Cono', icono: '🔺' },
    { id: 'piramide', nombre: 'Pirámide', icono: '🔻' },
  ];

  const resultados = useMemo(() => {
    const PI = Math.PI;

    if (dimension === '2D') {
      switch (figura2D) {
        case 'cuadrado': {
          const l = parseSpanishNumber(lado);
          if (!l || l <= 0) return null;
          return {
            area: l * l,
            perimetro: 4 * l,
            diagonal: l * Math.sqrt(2),
            formula: 'Área = l², Perímetro = 4l, Diagonal = l√2'
          };
        }
        case 'rectangulo': {
          const b = parseSpanishNumber(base);
          const a = parseSpanishNumber(altura);
          if (!b || !a || b <= 0 || a <= 0) return null;
          return {
            area: b * a,
            perimetro: 2 * (b + a),
            diagonal: Math.sqrt(b * b + a * a),
            formula: 'Área = b×h, Perímetro = 2(b+h), Diagonal = √(b²+h²)'
          };
        }
        case 'triangulo': {
          const b = parseSpanishNumber(base);
          const h = parseSpanishNumber(altura);
          const l = parseSpanishNumber(lado); // lado conocido si hay
          if (!b || !h || b <= 0 || h <= 0) return null;

          const area = (b * h) / 2;
          // Asumimos triángulo isósceles si solo tenemos base y altura
          const ladoCalc = l || Math.sqrt(Math.pow(b / 2, 2) + h * h);
          const perimetro = l ? b + 2 * l : b + 2 * ladoCalc;

          return {
            area,
            perimetro,
            hipotenusa: ladoCalc,
            formula: 'Área = (b×h)/2'
          };
        }
        case 'circulo': {
          const r = parseSpanishNumber(radio);
          if (!r || r <= 0) return null;
          return {
            area: PI * r * r,
            perimetro: 2 * PI * r,
            diametro: 2 * r,
            formula: 'Área = πr², Circunferencia = 2πr'
          };
        }
        case 'trapecio': {
          const B = parseSpanishNumber(base); // base mayor
          const b = parseSpanishNumber(ladoB); // base menor
          const h = parseSpanishNumber(altura);
          if (!B || !b || !h || B <= 0 || b <= 0 || h <= 0) return null;
          const area = ((B + b) * h) / 2;
          // Perímetro aproximado asumiendo lados iguales
          const ladoLateral = Math.sqrt(Math.pow((B - b) / 2, 2) + h * h);
          return {
            area,
            perimetro: B + b + 2 * ladoLateral,
            ladoLateral,
            formula: 'Área = ((B+b)×h)/2'
          };
        }
        case 'rombo': {
          const d1 = parseSpanishNumber(diagonal1);
          const d2 = parseSpanishNumber(diagonal2);
          if (!d1 || !d2 || d1 <= 0 || d2 <= 0) return null;
          const area = (d1 * d2) / 2;
          const l = Math.sqrt(Math.pow(d1 / 2, 2) + Math.pow(d2 / 2, 2));
          return {
            area,
            perimetro: 4 * l,
            lado: l,
            formula: 'Área = (d₁×d₂)/2, Lado = √((d₁/2)²+(d₂/2)²)'
          };
        }
        case 'pentagono': {
          const l = parseSpanishNumber(lado);
          const ap = parseSpanishNumber(apotema);
          if (!l || l <= 0) return null;
          // Si no hay apotema, calcular para pentágono regular
          const apotemaCalc = ap || (l / (2 * Math.tan(PI / 5)));
          const perimetro = 5 * l;
          const area = (perimetro * apotemaCalc) / 2;
          return {
            area,
            perimetro,
            apotema: apotemaCalc,
            formula: 'Área = (P×a)/2, P = 5l'
          };
        }
        case 'hexagono': {
          const l = parseSpanishNumber(lado);
          if (!l || l <= 0) return null;
          const apotemaCalc = (l * Math.sqrt(3)) / 2;
          const perimetro = 6 * l;
          const area = (perimetro * apotemaCalc) / 2;
          return {
            area,
            perimetro,
            apotema: apotemaCalc,
            formula: 'Área = (3√3/2)l², P = 6l'
          };
        }
      }
    } else {
      switch (figura3D) {
        case 'cubo': {
          const l = parseSpanishNumber(lado);
          if (!l || l <= 0) return null;
          return {
            volumen: Math.pow(l, 3),
            superficieTotal: 6 * l * l,
            diagonalEspacial: l * Math.sqrt(3),
            formula: 'V = l³, S = 6l²'
          };
        }
        case 'prisma': {
          const b = parseSpanishNumber(base);
          const h = parseSpanishNumber(altura);
          const prof = parseSpanishNumber(lado); // profundidad
          if (!b || !h || !prof || b <= 0 || h <= 0 || prof <= 0) return null;
          const areaBase = b * h;
          return {
            volumen: areaBase * prof,
            superficieTotal: 2 * areaBase + 2 * (b + h) * prof,
            areaBase,
            formula: 'V = Ab×h, S = 2Ab + perímetro×h'
          };
        }
        case 'cilindro': {
          const r = parseSpanishNumber(radio);
          const h = parseSpanishNumber(altura);
          if (!r || !h || r <= 0 || h <= 0) return null;
          const areaBase = PI * r * r;
          const areaLateral = 2 * PI * r * h;
          return {
            volumen: areaBase * h,
            superficieTotal: 2 * areaBase + areaLateral,
            areaLateral,
            areaBase,
            formula: 'V = πr²h, S = 2πr² + 2πrh'
          };
        }
        case 'esfera': {
          const r = parseSpanishNumber(radio);
          if (!r || r <= 0) return null;
          return {
            volumen: (4 / 3) * PI * Math.pow(r, 3),
            superficieTotal: 4 * PI * r * r,
            diametro: 2 * r,
            formula: 'V = (4/3)πr³, S = 4πr²'
          };
        }
        case 'cono': {
          const r = parseSpanishNumber(radio);
          const h = parseSpanishNumber(altura);
          if (!r || !h || r <= 0 || h <= 0) return null;
          const generatriz = Math.sqrt(r * r + h * h);
          const areaBase = PI * r * r;
          const areaLateral = PI * r * generatriz;
          return {
            volumen: (1 / 3) * areaBase * h,
            superficieTotal: areaBase + areaLateral,
            generatriz,
            areaLateral,
            formula: 'V = (1/3)πr²h, S = πr² + πrg'
          };
        }
        case 'piramide': {
          const l = parseSpanishNumber(lado); // lado de la base cuadrada
          const h = parseSpanishNumber(altura);
          if (!l || !h || l <= 0 || h <= 0) return null;
          const areaBase = l * l;
          const apotemaLateral = Math.sqrt(Math.pow(l / 2, 2) + h * h);
          const areaLateral = 4 * (l * apotemaLateral) / 2;
          return {
            volumen: (1 / 3) * areaBase * h,
            superficieTotal: areaBase + areaLateral,
            apotemaLateral,
            areaBase,
            formula: 'V = (1/3)Ab×h'
          };
        }
      }
    }
    return null;
  }, [dimension, figura2D, figura3D, lado, base, altura, radio, ladoB, diagonal1, diagonal2, apotema]);

  const limpiar = () => {
    setLado('');
    setBase('');
    setAltura('');
    setRadio('');
    setLadoB('');
    setDiagonal1('');
    setDiagonal2('');
    setApotema('');
  };

  const renderInputs2D = () => {
    switch (figura2D) {
      case 'cuadrado':
        return (
          <NumberInput value={lado} onChange={setLado} label="Lado" placeholder="5" />
        );
      case 'rectangulo':
        return (
          <>
            <NumberInput value={base} onChange={setBase} label="Base" placeholder="8" />
            <NumberInput value={altura} onChange={setAltura} label="Altura" placeholder="5" />
          </>
        );
      case 'triangulo':
        return (
          <>
            <NumberInput value={base} onChange={setBase} label="Base" placeholder="6" />
            <NumberInput value={altura} onChange={setAltura} label="Altura" placeholder="4" />
            <NumberInput value={lado} onChange={setLado} label="Lado (opcional)" placeholder="" helperText="Para perímetro exacto" />
          </>
        );
      case 'circulo':
        return (
          <NumberInput value={radio} onChange={setRadio} label="Radio" placeholder="5" />
        );
      case 'trapecio':
        return (
          <>
            <NumberInput value={base} onChange={setBase} label="Base mayor" placeholder="10" />
            <NumberInput value={ladoB} onChange={setLadoB} label="Base menor" placeholder="6" />
            <NumberInput value={altura} onChange={setAltura} label="Altura" placeholder="4" />
          </>
        );
      case 'rombo':
        return (
          <>
            <NumberInput value={diagonal1} onChange={setDiagonal1} label="Diagonal mayor" placeholder="8" />
            <NumberInput value={diagonal2} onChange={setDiagonal2} label="Diagonal menor" placeholder="6" />
          </>
        );
      case 'pentagono':
      case 'hexagono':
        return (
          <>
            <NumberInput value={lado} onChange={setLado} label="Lado" placeholder="5" />
            {figura2D === 'pentagono' && (
              <NumberInput value={apotema} onChange={setApotema} label="Apotema (opcional)" placeholder="" />
            )}
          </>
        );
      default:
        return null;
    }
  };

  const renderInputs3D = () => {
    switch (figura3D) {
      case 'cubo':
        return (
          <NumberInput value={lado} onChange={setLado} label="Lado" placeholder="5" />
        );
      case 'prisma':
        return (
          <>
            <NumberInput value={base} onChange={setBase} label="Base" placeholder="8" />
            <NumberInput value={altura} onChange={setAltura} label="Altura de la base" placeholder="6" />
            <NumberInput value={lado} onChange={setLado} label="Profundidad" placeholder="10" />
          </>
        );
      case 'cilindro':
        return (
          <>
            <NumberInput value={radio} onChange={setRadio} label="Radio" placeholder="3" />
            <NumberInput value={altura} onChange={setAltura} label="Altura" placeholder="10" />
          </>
        );
      case 'esfera':
        return (
          <NumberInput value={radio} onChange={setRadio} label="Radio" placeholder="5" />
        );
      case 'cono':
        return (
          <>
            <NumberInput value={radio} onChange={setRadio} label="Radio de la base" placeholder="4" />
            <NumberInput value={altura} onChange={setAltura} label="Altura" placeholder="8" />
          </>
        );
      case 'piramide':
        return (
          <>
            <NumberInput value={lado} onChange={setLado} label="Lado de la base" placeholder="6" />
            <NumberInput value={altura} onChange={setAltura} label="Altura" placeholder="8" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📐 Calculadora de Geometría</h1>
        <p className={styles.subtitle}>
          Calcula áreas, perímetros, volúmenes y superficies de figuras geométricas
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.configPanel}>
          <div className={styles.dimensionTabs}>
            <button
              className={`${styles.dimTab} ${dimension === '2D' ? styles.dimActivo : ''}`}
              onClick={() => { setDimension('2D'); limpiar(); }}
            >
              2D - Planas
            </button>
            <button
              className={`${styles.dimTab} ${dimension === '3D' ? styles.dimActivo : ''}`}
              onClick={() => { setDimension('3D'); limpiar(); }}
            >
              3D - Sólidos
            </button>
          </div>

          <h2 className={styles.sectionTitle}>
            {dimension === '2D' ? 'Figura Plana' : 'Sólido'}
          </h2>

          <div className={styles.figurasGrid}>
            {dimension === '2D'
              ? figuras2D.map((f) => (
                  <button
                    key={f.id}
                    className={`${styles.figuraBtn} ${figura2D === f.id ? styles.figuraActiva : ''}`}
                    onClick={() => { setFigura2D(f.id); limpiar(); }}
                  >
                    <span className={styles.figuraIcono}>{f.icono}</span>
                    <span className={styles.figuraNombre}>{f.nombre}</span>
                  </button>
                ))
              : figuras3D.map((f) => (
                  <button
                    key={f.id}
                    className={`${styles.figuraBtn} ${figura3D === f.id ? styles.figuraActiva : ''}`}
                    onClick={() => { setFigura3D(f.id); limpiar(); }}
                  >
                    <span className={styles.figuraIcono}>{f.icono}</span>
                    <span className={styles.figuraNombre}>{f.nombre}</span>
                  </button>
                ))
            }
          </div>

          <div className={styles.inputsSection}>
            {dimension === '2D' ? renderInputs2D() : renderInputs3D()}
          </div>

          <button onClick={limpiar} className={styles.btnLimpiar}>
            Limpiar
          </button>
        </div>

        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {!resultados ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>{dimension === '2D' ? '📏' : '📦'}</span>
              <p>Ingresa las medidas para calcular</p>
            </div>
          ) : (
            <>
              <div className={styles.resultsGrid}>
                {dimension === '2D' ? (
                  <>
                    <ResultCard
                      title="Área"
                      value={formatNumber(resultados.area ?? 0, 4)}
                      unit="u²"
                      variant="highlight"
                      icon="📐"
                    />
                    <ResultCard
                      title="Perímetro"
                      value={formatNumber(resultados.perimetro ?? 0, 4)}
                      unit="u"
                      variant="info"
                      icon="📏"
                    />
                    {resultados.diagonal !== undefined && (
                      <ResultCard
                        title="Diagonal"
                        value={formatNumber(resultados.diagonal, 4)}
                        unit="u"
                        variant="default"
                        icon="↗️"
                      />
                    )}
                    {resultados.diametro !== undefined && (
                      <ResultCard
                        title="Diámetro"
                        value={formatNumber(resultados.diametro, 4)}
                        unit="u"
                        variant="default"
                        icon="⬌"
                      />
                    )}
                    {resultados.apotema !== undefined && (
                      <ResultCard
                        title="Apotema"
                        value={formatNumber(resultados.apotema, 4)}
                        unit="u"
                        variant="default"
                        icon="📍"
                      />
                    )}
                    {resultados.lado !== undefined && (
                      <ResultCard
                        title="Lado"
                        value={formatNumber(resultados.lado, 4)}
                        unit="u"
                        variant="default"
                        icon="📏"
                      />
                    )}
                  </>
                ) : (
                  <>
                    <ResultCard
                      title="Volumen"
                      value={formatNumber(resultados.volumen ?? 0, 4)}
                      unit="u³"
                      variant="highlight"
                      icon="📦"
                    />
                    <ResultCard
                      title="Superficie Total"
                      value={formatNumber(resultados.superficieTotal ?? 0, 4)}
                      unit="u²"
                      variant="info"
                      icon="🔲"
                    />
                    {resultados.areaLateral !== undefined && (
                      <ResultCard
                        title="Área Lateral"
                        value={formatNumber(resultados.areaLateral, 4)}
                        unit="u²"
                        variant="default"
                        icon="📐"
                      />
                    )}
                    {resultados.areaBase !== undefined && (
                      <ResultCard
                        title="Área Base"
                        value={formatNumber(resultados.areaBase, 4)}
                        unit="u²"
                        variant="default"
                        icon="⬜"
                      />
                    )}
                    {resultados.diagonalEspacial !== undefined && (
                      <ResultCard
                        title="Diagonal Espacial"
                        value={formatNumber(resultados.diagonalEspacial, 4)}
                        unit="u"
                        variant="default"
                        icon="↗️"
                      />
                    )}
                    {resultados.generatriz !== undefined && (
                      <ResultCard
                        title="Generatriz"
                        value={formatNumber(resultados.generatriz, 4)}
                        unit="u"
                        variant="default"
                        icon="📏"
                      />
                    )}
                  </>
                )}
              </div>

              <div className={styles.formulaBox}>
                <h3>Fórmulas aplicadas</h3>
                <p className={styles.formula}>{resultados.formula}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Geometría?"
        subtitle="Descubre fórmulas, propiedades y aplicaciones de las figuras geométricas"
      >
        {/* SECCIÓN 1: Tabla Comparativa 2D vs 3D */}
        <section className={styles.guideSection}>
          <h2>📊 Figuras 2D vs 3D: Comparación Completa</h2>
          <p className={styles.introParagraph}>
            Comprende las diferencias fundamentales entre figuras planas (2D) y sólidos (3D),
            sus propiedades, fórmulas clave y aplicaciones prácticas en matemáticas y ciencias.
          </p>

          <div className={styles.comparisonTable}>
            <div className={styles.tableRow}>
              <div className={styles.tableHeader}>Característica</div>
              <div className={styles.tableHeader}>Figuras 2D</div>
              <div className={styles.tableHeader}>Sólidos 3D</div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableCell}><strong>Dimensiones</strong></div>
              <div className={styles.tableCell}>Longitud y anchura (plano)</div>
              <div className={styles.tableCell}>Longitud, anchura y altura (espacio)</div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableCell}><strong>Medidas Principales</strong></div>
              <div className={styles.tableCell}>Área (u²) y Perímetro (u)</div>
              <div className={styles.tableCell}>Volumen (u³) y Superficie (u²)</div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableCell}><strong>Ejemplos Básicos</strong></div>
              <div className={styles.tableCell}>Cuadrado, círculo, triángulo</div>
              <div className={styles.tableCell}>Cubo, esfera, pirámide</div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableCell}><strong>Fórmula de Área</strong></div>
              <div className={styles.tableCell}>
                <ul className={styles.faqList}>
                  <li>Cuadrado: A = l²</li>
                  <li>Rectángulo: A = b × h</li>
                  <li>Triángulo: A = (b × h)/2</li>
                  <li>Círculo: A = πr²</li>
                </ul>
              </div>
              <div className={styles.tableCell}>No aplica (usan volumen)</div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableCell}><strong>Fórmula de Volumen</strong></div>
              <div className={styles.tableCell}>No aplica (son planas)</div>
              <div className={styles.tableCell}>
                <ul className={styles.faqList}>
                  <li>Cubo: V = l³</li>
                  <li>Cilindro: V = πr²h</li>
                  <li>Esfera: V = (4/3)πr³</li>
                  <li>Cono: V = (1/3)πr²h</li>
                </ul>
              </div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableCell}><strong>Aplicaciones en Estudios</strong></div>
              <div className={styles.tableCell}>
                Geometría plana, dibujo técnico, mapas, planos arquitectónicos
              </div>
              <div className={styles.tableCell}>
                Física (volúmenes, densidad), química (moléculas), arquitectura 3D
              </div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableCell}><strong>Nivel Académico</strong></div>
              <div className={styles.tableCell}>ESO (1º-2º), Bachillerato</div>
              <div className={styles.tableCell}>ESO (3º-4º), Bachillerato, Universidad</div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableCell}><strong>Relación con π</strong></div>
              <div className={styles.tableCell}>Círculo y figuras circulares</div>
              <div className={styles.tableCell}>Cilindro, esfera, cono</div>
            </div>

            <div className={styles.tableRow}>
              <div className={styles.tableCell}><strong>Complejidad de Cálculo</strong></div>
              <div className={styles.tableCell}>Baja-Media (1-2 fórmulas)</div>
              <div className={styles.tableCell}>Media-Alta (múltiples superficies)</div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso (Estudiantes) */}
        <section className={styles.guideSection}>
          <h2>👥 ¿Quién Usa Esta Calculadora?</h2>
          <p className={styles.introParagraph}>
            Casos reales de estudiantes de diferentes niveles académicos que utilizan la calculadora
            de geometría para resolver problemas, verificar resultados y comprender conceptos.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📐 Marta - Estudiante de Arquitectura</h4>
              <p>
                <strong>Situación:</strong> Diseño de proyecto de vivienda unifamiliar.
              </p>
              <p>
                <strong>Uso:</strong> Calcula áreas de habitaciones (rectángulos), superficies de columnas
                cilíndricas, y volúmenes de escaleras (prismas rectangulares) para entregar planos técnicos.
              </p>
              <p>
                <strong>Beneficio:</strong> Verifica cálculos rápidamente antes de presentar el proyecto final.
                "Me ahorra tiempo y me da confianza en los números que incluyo en los planos."
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🔬 David - Ingeniería Industrial (Universidad)</h4>
              <p>
                <strong>Situación:</strong> Ejercicios de resistencia de materiales y cálculo de volúmenes.
              </p>
              <p>
                <strong>Uso:</strong> Calcula volúmenes de piezas mecánicas (cilindros, conos, esferas) para
                determinar masas con densidad conocida. También superficies para problemas de fluidos.
              </p>
              <p>
                <strong>Beneficio:</strong> "Perfecto para validar resultados de ejercicios antes de entregarlos.
                Las 4 decimales me dan precisión suficiente para ingeniería."
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📚 Laura - ESO 3º (Matemáticas)</h4>
              <p>
                <strong>Situación:</strong> Deberes de geometría sobre áreas y perímetros.
              </p>
              <p>
                <strong>Uso:</strong> Resuelve problemas de triángulos, cuadrados y círculos para practicar.
                Comprueba si sus cálculos manuales coinciden con la calculadora.
              </p>
              <p>
                <strong>Beneficio:</strong> "Me ayuda a entender dónde me equivoco. Si mi resultado no coincide,
                reviso la fórmula y aprendo del error."
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>👨‍🏫 Profesor Andrés - Bachillerato (Matemáticas)</h4>
              <p>
                <strong>Situación:</strong> Creación de exámenes y ejercicios de geometría.
              </p>
              <p>
                <strong>Uso:</strong> Genera problemas con resultados conocidos (polígonos regulares, sólidos
                complejos) para diseñar pruebas equilibradas. También valida ejercicios propuestos por alumnos.
              </p>
              <p>
                <strong>Beneficio:</strong> "Herramienta perfecta para preparar material didáctico. Me aseguro
                de que los ejercicios tengan soluciones coherentes."
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ Ampliado */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes de Estudiantes</h2>

          <div className={styles.faqItem}>
            <h4 className={styles.faqQuestion}>¿Cómo memorizo todas estas fórmulas para el examen?</h4>
            <p className={styles.faqAnswer}>
              <strong>Estrategia efectiva:</strong> En lugar de memorizar por repetición, entiende la lógica:
            </p>
            <ul className={styles.faqList}>
              <li><strong>2D (áreas):</strong> Siempre multiplicas dos longitudes → resultado en u²</li>
              <li><strong>3D (volúmenes):</strong> Multiplicas tres longitudes (o área × altura) → resultado en u³</li>
              <li><strong>Círculos/esferas:</strong> Siempre aparece π. Radio al cuadrado (área) o al cubo (volumen)</li>
              <li><strong>Truco visual:</strong> Dibuja la figura, marca las medidas, y deduce qué se multiplica</li>
              <li><strong>Flashcards:</strong> Crea tarjetas con la figura en un lado y la fórmula en el otro</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqQuestion}>¿Cuándo uso π = 3,14 y cuándo dejo π sin aproximar?</h4>
            <p className={styles.faqAnswer}>
              Depende del contexto del ejercicio:
            </p>
            <ul className={styles.faqList}>
              <li><strong>Resultados exactos:</strong> Deja π en la fórmula (ej: A = 25π cm²). Más preciso para Bachillerato</li>
              <li><strong>Resultados decimales:</strong> Usa π ≈ 3,1416 cuando te pidan número con decimales</li>
              <li><strong>Esta calculadora:</strong> Usa el valor completo de π (Math.PI en JavaScript) con 4 decimales de precisión</li>
              <li><strong>Regla general:</strong> Si el problema dice "calcula el valor numérico", aproxima π. Si dice "expresa el resultado", deja π</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqQuestion}>¿Cuál es la diferencia entre área y perímetro?</h4>
            <p className={styles.faqAnswer}>
              Confusión muy común en ESO. Piensa en ejemplos físicos:
            </p>
            <ul className={styles.faqList}>
              <li><strong>Perímetro (u):</strong> La longitud del CONTORNO. Como una valla alrededor de un jardín. Se mide en metros lineales</li>
              <li><strong>Área (u²):</strong> La superficie INTERIOR. Como el césped que cubre el jardín. Se mide en metros cuadrados</li>
              <li><strong>Ejemplo cuadrado de 5m:</strong> Perímetro = 20m (4 lados × 5m). Área = 25m² (5m × 5m)</li>
              <li><strong>Truco nemotécnico:</strong> PerÍmetro → PerÍferia (borde). Área → SuperficieA (interior)</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqQuestion}>¿Cómo sé si un problema es de 2D o 3D?</h4>
            <p className={styles.faqAnswer}>
              Lee el enunciado buscando estas pistas:
            </p>
            <ul className={styles.faqList}>
              <li><strong>Palabras clave 2D:</strong> "superficie del terreno", "plano", "dibujo", "área de la hoja", "perímetro del marco"</li>
              <li><strong>Palabras clave 3D:</strong> "volumen", "capacidad", "espacio que ocupa", "cantidad de agua", "masa del objeto"</li>
              <li><strong>Datos del problema:</strong> Si te dan 2 medidas (base y altura) → 2D. Si te dan 3 medidas → probablemente 3D</li>
              <li><strong>Resultado esperado:</strong> Si piden m² → 2D (área). Si piden m³ → 3D (volumen)</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqQuestion}>¿Qué es el apotema y cuándo se usa?</h4>
            <p className={styles.faqAnswer}>
              El apotema es específico de polígonos regulares (pentágono, hexágono):
            </p>
            <ul className={styles.faqList}>
              <li><strong>Definición:</strong> Distancia del centro del polígono al punto medio de un lado</li>
              <li><strong>Uso:</strong> Fórmula del área = (Perímetro × Apotema) / 2</li>
              <li><strong>Diferencia con radio:</strong> El radio va del centro a un VÉRTICE. El apotema va del centro al LADO</li>
              <li><strong>Dato del problema:</strong> Si no te dan el apotema, a veces puedes calcularlo con trigonometría (Bachillerato)</li>
              <li><strong>Esta calculadora:</strong> Calcula el apotema automáticamente para pentágono y hexágono regulares</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqQuestion}>¿Volumen y superficie total son lo mismo?</h4>
            <p className={styles.faqAnswer}>
              NO. Son conceptos diferentes en figuras 3D:
            </p>
            <ul className={styles.faqList}>
              <li><strong>Volumen (u³):</strong> Espacio que ocupa el sólido POR DENTRO. Como la cantidad de agua que cabe en una botella</li>
              <li><strong>Superficie Total (u²):</strong> Área de TODAS las caras EXTERNAS. Como el papel necesario para envolver una caja</li>
              <li><strong>Ejemplo cubo de 2m:</strong> Volumen = 8m³ (2×2×2). Superficie = 24m² (6 caras × 4m² cada una)</li>
              <li><strong>Aplicaciones:</strong> Volumen → capacidad, masa, densidad. Superficie → pintura, materiales de construcción</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqQuestion}>¿Cómo convierto entre unidades (cm, m, km)?</h4>
            <p className={styles.faqAnswer}>
              Conversión de unidades en geometría tiene TRAMPAS:
            </p>
            <ul className={styles.faqList}>
              <li><strong>Longitudes (u):</strong> 1 m = 100 cm. Multiplicas/divides por 10, 100, 1000...</li>
              <li><strong>Áreas (u²):</strong> 1 m² = 10.000 cm² (100×100). El factor se ELEVA AL CUADRADO</li>
              <li><strong>Volúmenes (u³):</strong> 1 m³ = 1.000.000 cm³ (100×100×100). El factor se ELEVA AL CUBO</li>
              <li><strong>Regla de oro:</strong> Convierte PRIMERO todas las medidas a la misma unidad ANTES de calcular</li>
              <li><strong>Ejemplo error común:</strong> Base en metros, altura en cm → resultado INCORRECTO. Convierte todo a metros primero</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h4 className={styles.faqQuestion}>¿Esta calculadora sirve para preparar la EVAU/Selectividad?</h4>
            <p className={styles.faqAnswer}>
              Sí, pero con matices:
            </p>
            <ul className={styles.faqList}>
              <li><strong>Para practicar:</strong> Perfecto. Resuelves ejercicios y verificas resultados al instante</li>
              <li><strong>Para entender:</strong> Te muestra las fórmulas aplicadas en cada caso. Compara con tu procedimiento manual</li>
              <li><strong>Limitación EVAU:</strong> En el examen debes JUSTIFICAR el procedimiento. No basta el resultado numérico</li>
              <li><strong>Estrategia recomendada:</strong> Resuelve el problema a mano, luego verifica aquí. Si no coincide, revisa tu proceso</li>
              <li><strong>Ventaja Bachillerato:</strong> 4 decimales de precisión son suficientes para problemas de geometría analítica</li>
            </ul>
          </div>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>🎯 Guía Paso a Paso: Resolver Problemas de Geometría</h2>
          <p className={styles.introParagraph}>
            Metodología sistemática para abordar cualquier problema de geometría sin perderte.
            Especialmente útil en exámenes bajo presión.
          </p>

          <div className={styles.stepByStep}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Lee el Enunciado Completo</h4>
                <p>
                  No empieces a calcular de inmediato. Lee TODO el problema para entender:
                  ¿Qué figura es? ¿Qué te dan? ¿Qué te piden? ¿Es 2D o 3D?
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Dibuja la Figura</h4>
                <p>
                  Representa la figura aunque el problema no incluya dibujo. Marca con claridad
                  las medidas conocidas (datos) y la incógnita que buscas. Usa colores si ayuda.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Identifica la Fórmula Correcta</h4>
                <p>
                  Según la figura y lo que pidan (área, volumen, perímetro), escribe la fórmula.
                  Si no la recuerdas exactamente, usa lógica: áreas multiplican 2 longitudes,
                  volúmenes multiplican 3 longitudes (o área × altura).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Convierte Unidades (Si Es Necesario)</h4>
                <p>
                  ANTES de sustituir en la fórmula, asegúrate de que todas las medidas estén en la
                  MISMA unidad. Si hay cm y m mezclados, convierte todo a metros (o a la unidad del resultado).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Sustituye Valores y Calcula</h4>
                <p>
                  Reemplaza los datos en la fórmula. Haz las operaciones paso a paso (no todo de golpe).
                  Si usas calculadora, anota los resultados intermedios por si necesitas revisar.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Verifica la Coherencia del Resultado</h4>
                <p>
                  ¿Tiene sentido? Un área de 1.000.000 m² para un cuadrado de 5m es IMPOSIBLE (debería ser 25 m²).
                  Si el resultado parece raro, revisa: ¿olvidaste elevar al cuadrado? ¿usaste la fórmula correcta?
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Comprueba con la Calculadora (Opcional)</h4>
                <p>
                  Si tienes tiempo, valida tu resultado aquí. Introduce las medidas y compara.
                  Si no coincide, repasa tu procedimiento manual punto por punto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: Tips de Estudio */}
        <section className={styles.guideSection}>
          <h2>💡 Tips de Estudio para Dominar Geometría</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📌 1. Crea tu Formulario Visual</h4>
              <p>
                Dibuja en una hoja TODAS las figuras (2D y 3D) con sus fórmulas al lado.
                Usa colores: azul para 2D, rojo para 3D. Pon ejemplos numéricos debajo de cada fórmula.
                Repásalo 10 minutos antes del examen.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🔄 2. Practica con Figuras Compuestas</h4>
              <p>
                Los problemas reales combinan figuras (ej: área de una casa = rectángulo + triángulo).
                Descompón figuras complejas en formas básicas, calcula cada una, y SUMA/RESTA áreas.
                Practica al menos 5 ejercicios de este tipo antes del examen.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📐 3. Aprende Patrones, No Solo Fórmulas</h4>
              <p>
                <strong>Patrón círculos:</strong> Área = πr², Perímetro = 2πr (siempre el doble del radio).
                <strong>Patrón prismas:</strong> Volumen = Área_base × altura (funciona para cilindro, prisma rectangular, etc.).
                Identifica patrones comunes y memorizarás menos.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎮 4. Usa Problemas de la Vida Real</h4>
              <p>
                Calcula el área de tu habitación (rectángulo), el volumen de una lata de refresco (cilindro),
                o el perímetro de una cancha de fútbol. Medir cosas reales hace la geometría más memorable
                que ejercicios abstractos del libro.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>⏱️ 5. Cronometra tus Ejercicios</h4>
              <p>
                En exámenes, el tiempo es limitado. Practica resolver 5 problemas tipo en 30 minutos.
                Identifica qué tipo de ejercicio te lleva más tiempo (ej: polígonos irregulares) y practica
                ESE tipo extra hasta que seas más rápido.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🤝 6. Explica las Fórmulas a Alguien</h4>
              <p>
                La mejor forma de confirmar que entiendes es ENSEÑAR. Explica a un compañero por qué
                el área del círculo es πr² (relación entre radio y circunferencia). Si puedes explicarlo
                con tus palabras, lo dominas. Si no puedes, necesitas repasar el concepto.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box - Errores Comunes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <h3>⚠️ Errores Comunes que Debes Evitar</h3>
            <p className={styles.warningIntro}>
              Estos son los fallos más frecuentes que cometen estudiantes en exámenes de geometría.
              Revisar esta lista antes de entregar puede salvarte puntos valiosos.
            </p>

            <div className={styles.contentGrid}>
              <div className={styles.warningCard}>
                <h4>❌ Confundir Perímetro con Área</h4>
                <p>
                  <strong>Error típico:</strong> Usar la fórmula del área cuando piden perímetro (o viceversa).
                </p>
                <p>
                  <strong>Cómo evitarlo:</strong> Lee QUÉ piden. Perímetro → suma de lados (u). Área → superficie interior (u²).
                  Las UNIDADES te dan la pista: si piden m², es área; si piden m, es perímetro.
                </p>
              </div>

              <div className={styles.warningCard}>
                <h4>❌ Olvidar Elevar al Cuadrado/Cubo</h4>
                <p>
                  <strong>Error típico:</strong> Área del cuadrado = 4 × l (incorrecto). Lo correcto es l².
                  Volumen del cubo = 3 × l (incorrecto). Lo correcto es l³.
                </p>
                <p>
                  <strong>Cómo evitarlo:</strong> Si la fórmula tiene exponente, NO LO OMITAS. Escribe siempre
                  l², r³, etc. Anota en tu formulario los exponentes en GRANDE.
                </p>
              </div>

              <div className={styles.warningCard}>
                <h4>❌ Mezclar Unidades sin Convertir</h4>
                <p>
                  <strong>Error típico:</strong> Base = 2 m, altura = 50 cm → Área = 2 × 50 = 100 (INCORRECTO).
                </p>
                <p>
                  <strong>Cómo evitarlo:</strong> Convierte TODO a la misma unidad ANTES de calcular.
                  50 cm = 0,5 m → Área = 2 × 0,5 = 1 m². Escribe la conversión explícitamente en el examen.
                </p>
              </div>

              <div className={styles.warningCard}>
                <h4>❌ Usar π = 3 (Aproximación Demasiado Burda)</h4>
                <p>
                  <strong>Error típico:</strong> Calcular π como 3 da resultados imprecisos que pueden ser marcados como incorrectos.
                </p>
                <p>
                  <strong>Cómo evitarlo:</strong> Usa π ≈ 3,14 (mínimo) o mejor π ≈ 3,1416. Si tu calculadora
                  tiene botón π, úsalo. Si dejas π simbólico (ej: 25π cm²), aún mejor en Bachillerato.
                </p>
              </div>

              <div className={styles.warningCard}>
                <h4>❌ Confundir Radio con Diámetro</h4>
                <p>
                  <strong>Error típico:</strong> El problema dice "círculo de 10 cm de diámetro" y usas r = 10 (INCORRECTO).
                  El radio es la MITAD del diámetro.
                </p>
                <p>
                  <strong>Cómo evitarlo:</strong> Subraya en el enunciado si hablan de radio o diámetro.
                  Anota: d = 10 → r = 5 ANTES de sustituir en la fórmula. Este error es MUY común.
                </p>
              </div>

              <div className={styles.warningCard}>
                <h4>❌ No Leer Bien el Enunciado</h4>
                <p>
                  <strong>Error típico:</strong> El problema pide "superficie a pintar" (solo paredes, sin techo/suelo)
                  y calculas superficie TOTAL del cubo.
                </p>
                <p>
                  <strong>Cómo evitarlo:</strong> Lee DOS veces el enunciado. Si dice "superficie lateral",
                  NO incluyas las bases. Si dice "volumen de agua", puede que el recipiente no esté lleno al 100%.
                </p>
              </div>

              <div className={styles.warningCard}>
                <h4>❌ Aplicar Fórmula Incorrecta por Prisa</h4>
                <p>
                  <strong>Error típico:</strong> Calcular el área de un triángulo con b × h (sin dividir entre 2).
                  O volumen de cono como πr²h (sin el 1/3).
                </p>
                <p>
                  <strong>Cómo evitarlo:</strong> Escribe la fórmula COMPLETA antes de sustituir valores.
                  No calcules de memoria en tu cabeza. Si hay fracciones (1/2, 1/3, 4/3), escríbelas explícitamente.
                </p>
              </div>

              <div className={styles.warningCard}>
                <h4>❌ Redondear Demasiado Pronto</h4>
                <p>
                  <strong>Error típico:</strong> Calcular √2 = 1,4 y usar ese valor en pasos siguientes (pierde precisión).
                </p>
                <p>
                  <strong>Cómo evitarlo:</strong> Usa TODOS los decimales que te de la calculadora en pasos intermedios.
                  Redondea SOLO en el resultado final (ej: 4 decimales). O deja raíces sin aproximar hasta el final.
                </p>
              </div>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-geometria')} />

      <Footer appName="calculadora-geometria" />
    </div>
  );
}
