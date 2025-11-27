'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraGeometria.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';

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
                      value={formatNumber(resultados.area, 4)}
                      unit="u²"
                      variant="highlight"
                      icon="📐"
                    />
                    <ResultCard
                      title="Perímetro"
                      value={formatNumber(resultados.perimetro, 4)}
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
                      value={formatNumber(resultados.volumen, 4)}
                      unit="u³"
                      variant="highlight"
                      icon="📦"
                    />
                    <ResultCard
                      title="Superficie Total"
                      value={formatNumber(resultados.superficieTotal, 4)}
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
        <section className={styles.guideSection}>
          <h2>Geometría: Fundamentos y Aplicaciones</h2>
          <p className={styles.introParagraph}>
            La geometría estudia las propiedades y medidas de las figuras en el plano (2D)
            y en el espacio (3D). Es fundamental en arquitectura, ingeniería, diseño y ciencias.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Figuras Planas (2D)</h4>
              <p>
                Tienen dos dimensiones: longitud y anchura. Se miden por área (superficie)
                y perímetro (contorno). Ejemplos: triángulos, círculos, polígonos.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Sólidos (3D)</h4>
              <p>
                Tienen tres dimensiones: longitud, anchura y altura. Se miden por volumen
                (espacio ocupado) y superficie (área total). Ejemplos: esferas, cilindros.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Polígonos Regulares</h4>
              <p>
                Todos sus lados y ángulos son iguales. El apotema es la distancia del centro
                al punto medio de un lado. Área = (Perímetro × Apotema) / 2.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>El Número π</h4>
              <p>
                π ≈ 3,14159... Es la relación entre la circunferencia y el diámetro de cualquier
                círculo. Fundamental en todos los cálculos con círculos y esferas.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-geometria" />
    </div>
  );
}
