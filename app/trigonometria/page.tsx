'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Trigonometria.module.css';
import { metadata } from './metadata';
import Footer from '@/components/Footer';

// Constantes
const PI = Math.PI;

// Utilidades para formato español
function formatNumber(num: number, decimals: number = 4): string {
  // Manejo de valores especiales
  if (isNaN(num)) return 'No definido';
  if (!isFinite(num)) {
    return num > 0 ? '∞' : '-∞';
  }
  // Para valores muy grandes pero finitos
  if (Math.abs(num) > 9999) {
    return num > 0 ? '∞' : '-∞';
  }
  // Para valores muy pequeños (cercanos a cero)
  if (Math.abs(num) < 0.0001 && num !== 0) {
    return '≈0';
  }
  return num.toFixed(decimals).replace('.', ',');
}

// Conversiones
function degreesToRadians(degrees: number): number {
  return degrees * (PI / 180);
}

function radiansToDegrees(radians: number): number {
  return radians * (180 / PI);
}

export default function TrigonometriaPage() {
  // Estados
  const [currentAngleDegrees, setCurrentAngleDegrees] = useState<number>(45);
  const [angleInput, setAngleInput] = useState<string>('45');
  const [angleUnit, setAngleUnit] = useState<'degrees' | 'radians'>('degrees');
  const [degreesinput, setDegreesInput] = useState<string>('');
  const [radiansInput, setRadiansInput] = useState<string>('');
  const [currentFunction, setCurrentFunction] = useState<'sin' | 'cos' | 'tan'>('sin');

  // Estados para resultados trigonométricos
  const [sinResult, setSinResult] = useState<string>('0');
  const [cosResult, setCosResult] = useState<string>('0');
  const [tanResult, setTanResult] = useState<string>('0');
  const [cscResult, setCscResult] = useState<string>('0');
  const [secResult, setSecResult] = useState<string>('0');
  const [cotResult, setCotResult] = useState<string>('0');

  // Estados para triángulo
  const [sideA, setSideA] = useState<string>('');
  const [sideB, setSideB] = useState<string>('');
  const [sideC, setSideC] = useState<string>('');
  const [angleA, setAngleA] = useState<string>('');
  const [angleB, setAngleB] = useState<string>('');
  const [triangleArea, setTriangleArea] = useState<string>('0');
  const [trianglePerimeter, setTrianglePerimeter] = useState<string>('0');

  // Referencias a canvas
  const unitCircleRef = useRef<HTMLCanvasElement>(null);
  const triangleRef = useRef<HTMLCanvasElement>(null);
  const functionRef = useRef<HTMLCanvasElement>(null);

  // Actualizar cálculos trigonométricos
  const updateCalculations = (angleInRadians: number) => {
    const sin = Math.sin(angleInRadians);
    const cos = Math.cos(angleInRadians);
    const tan = Math.tan(angleInRadians);

    // Manejar casos especiales para funciones recíprocas
    const csc = Math.abs(sin) < 0.0001 ? (sin >= 0 ? Infinity : -Infinity) : 1 / sin;
    const sec = Math.abs(cos) < 0.0001 ? (cos >= 0 ? Infinity : -Infinity) : 1 / cos;
    const cot = Math.abs(tan) < 0.0001 ? (tan >= 0 ? Infinity : -Infinity) : 1 / tan;

    // Manejar tangente en ángulos especiales (90°, 270°, etc.)
    const tanValue = Math.abs(cos) < 0.0001 ? (sin >= 0 ? Infinity : -Infinity) : tan;

    setSinResult(formatNumber(sin));
    setCosResult(formatNumber(cos));
    setTanResult(formatNumber(tanValue));
    setCscResult(formatNumber(csc));
    setSecResult(formatNumber(sec));
    setCotResult(formatNumber(cot));
  };

  // Dibujar círculo unitario
  const drawUnitCircle = () => {
    const canvas = unitCircleRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configurar estilos
    ctx.lineWidth = 2;
    ctx.font = '14px Arial';

    // Dibujar ejes
    ctx.strokeStyle = '#e1e8ed';
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    // Dibujar círculo unitario
    ctx.strokeStyle = '#4a90e2';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * PI);
    ctx.stroke();

    // Calcular posición del punto
    const angleRad = degreesToRadians(currentAngleDegrees);
    const x = Math.cos(angleRad);
    const y = Math.sin(angleRad);
    const pointX = centerX + x * radius;
    const pointY = centerY - y * radius; // Invertir Y

    // Dibujar radio
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(pointX, pointY);
    ctx.stroke();

    // Dibujar punto
    ctx.fillStyle = '#2E86AB';
    ctx.beginPath();
    ctx.arc(pointX, pointY, 8, 0, 2 * PI);
    ctx.fill();

    // Dibujar proyecciones (seno y coseno)
    ctx.strokeStyle = '#48A9A6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Proyección horizontal (coseno)
    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(pointX, centerY);
    ctx.stroke();

    // Proyección vertical (seno)
    ctx.beginPath();
    ctx.moveTo(pointX, pointY);
    ctx.lineTo(centerX, pointY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Etiquetas
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText(`cos: ${formatNumber(x)}`, pointX + 10, centerY - 10);
    ctx.fillText(`sen: ${formatNumber(y)}`, centerX + 10, pointY - 10);
    ctx.fillText(`(${formatNumber(x)}, ${formatNumber(y)})`, pointX + 10, pointY + 20);

    // Dibujar ángulo
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, -angleRad, true);
    ctx.stroke();

    // Etiqueta del ángulo
    ctx.fillStyle = '#ff9800';
    const labelX = centerX + Math.cos(-angleRad / 2) * 60;
    const labelY = centerY + Math.sin(-angleRad / 2) * 60;
    ctx.fillText(`${currentAngleDegrees.toFixed(0)}°`, labelX, labelY);
  };

  // Dibujar triángulo
  const drawTriangle = (a?: number | null, b?: number | null, c?: number | null, angleAVal?: number | null, angleBVal?: number | null) => {
    const canvas = triangleRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Si no hay valores, dibujar triángulo ejemplo
    if (!a && !b && !c && !angleAVal && !angleBVal) {
      a = 3;
      b = 4;
      c = 5;
      angleAVal = radiansToDegrees(Math.asin(a / c));
      angleBVal = radiansToDegrees(Math.asin(b / c));
    }

    if (!a || !b || !c) return;

    // Escalar para que quepa en el canvas
    const maxSide = Math.max(a, b, c);
    const scale = 200 / maxSide;
    const margin = 50;

    // Posiciones de los vértices
    const Cx = margin;
    const Cy = canvas.height - margin;
    const Bx = Cx + b * scale;
    const By = Cy;
    const Ax = Cx + (b - a * Math.cos(degreesToRadians(angleAVal || 0))) * scale;
    const Ay = Cy - a * Math.sin(degreesToRadians(angleAVal || 0)) * scale;

    // Dibujar triángulo
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(Cx, Cy);
    ctx.lineTo(Bx, By);
    ctx.lineTo(Ax, Ay);
    ctx.closePath();
    ctx.stroke();

    // Rellenar triángulo
    ctx.fillStyle = 'rgba(46, 134, 171, 0.1)';
    ctx.fill();

    // Dibujar ángulo recto
    const squareSize = 20;
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Cx, Cy - squareSize);
    ctx.lineTo(Cx + squareSize, Cy - squareSize);
    ctx.lineTo(Cx + squareSize, Cy);
    ctx.stroke();

    // Etiquetas
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '16px Arial';

    // Lados
    if (a) ctx.fillText(`a = ${formatNumber(a, 2)}`, (Cx + Ax) / 2 - 30, (Cy + Ay) / 2);
    if (b) ctx.fillText(`b = ${formatNumber(b, 2)}`, (Cx + Bx) / 2, Cy + 25);
    if (c) ctx.fillText(`c = ${formatNumber(c, 2)}`, (Bx + Ax) / 2 + 10, (By + Ay) / 2);

    // Ángulos
    if (angleAVal) ctx.fillText(`A = ${formatNumber(angleAVal, 1)}°`, Ax - 20, Ay - 10);
    if (angleBVal) ctx.fillText(`B = ${formatNumber(angleBVal, 1)}°`, Bx + 10, By - 10);

    // Actualizar información del triángulo
    if (a && b) {
      const area = (a * b) / 2;
      const perimeter = a + b + c;
      setTriangleArea(formatNumber(area, 2));
      setTrianglePerimeter(formatNumber(perimeter, 2));
    }
  };

  // Dibujar gráfica de función
  const drawFunctionGraph = () => {
    const canvas = functionRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Dibujar ejes
    ctx.strokeStyle = '#e1e8ed';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Dibujar función
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const scale = 50;
    const xRange = width / scale;

    for (let px = 0; px <= width; px++) {
      const x = (px / width) * xRange * PI - (xRange * PI) / 2;
      let y;

      switch (currentFunction) {
        case 'sin':
          y = Math.sin(x);
          break;
        case 'cos':
          y = Math.cos(x);
          break;
        case 'tan':
          y = Math.tan(x);
          // Limitar tangente para visualización
          if (Math.abs(y) > 5) continue;
          break;
      }

      const py = centerY - y * scale;

      if (px === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();

    // Etiquetas
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '12px Arial';
    ctx.fillText('−2π', 10, centerY + 20);
    ctx.fillText('−π', width / 4 - 10, centerY + 20);
    ctx.fillText('0', width / 2 - 5, centerY + 20);
    ctx.fillText('π', (3 * width) / 4 - 5, centerY + 20);
    ctx.fillText('2π', width - 25, centerY + 20);
  };

  // Resolver triángulo
  const solveTriangle = () => {
    let a = parseFloat(sideA) || null;
    let b = parseFloat(sideB) || null;
    let c = parseFloat(sideC) || null;
    let angleAVal = parseFloat(angleA) || null;
    let angleBVal = parseFloat(angleB) || null;

    // Contador de valores conocidos
    let knownValues = 0;
    if (a) knownValues++;
    if (b) knownValues++;
    if (c) knownValues++;
    if (angleAVal) knownValues++;
    if (angleBVal) knownValues++;

    if (knownValues < 2) {
      alert('Por favor, ingresa al menos 2 valores para resolver el triángulo');
      return;
    }

    // Resolver el triángulo según los datos disponibles
    if (a && b && c) {
      if (a + b <= c || a + c <= b || b + c <= a) {
        alert('Los lados no forman un triángulo válido');
        return;
      }
      angleAVal = radiansToDegrees(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
      angleBVal = radiansToDegrees(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
    } else if (a && b && !c) {
      c = Math.sqrt(a * a + b * b);
      angleAVal = radiansToDegrees(Math.atan(a / b));
      angleBVal = radiansToDegrees(Math.atan(b / a));
    } else if (a && c && !b) {
      b = Math.sqrt(c * c - a * a);
      if (isNaN(b)) {
        alert('El lado a no puede ser mayor que la hipotenusa c');
        return;
      }
      angleAVal = radiansToDegrees(Math.asin(a / c));
      angleBVal = radiansToDegrees(Math.acos(a / c));
    } else if (b && c && !a) {
      a = Math.sqrt(c * c - b * b);
      if (isNaN(a)) {
        alert('El lado b no puede ser mayor que la hipotenusa c');
        return;
      }
      angleAVal = radiansToDegrees(Math.acos(b / c));
      angleBVal = radiansToDegrees(Math.asin(b / c));
    } else if (c && angleAVal && !a) {
      a = c * Math.sin(degreesToRadians(angleAVal));
      b = c * Math.cos(degreesToRadians(angleAVal));
      angleBVal = 90 - angleAVal;
    } else if (c && angleBVal && !b) {
      b = c * Math.sin(degreesToRadians(angleBVal));
      a = c * Math.cos(degreesToRadians(angleBVal));
      angleAVal = 90 - angleBVal;
    } else if (a && angleAVal && !c) {
      c = a / Math.sin(degreesToRadians(angleAVal));
      b = a / Math.tan(degreesToRadians(angleAVal));
      angleBVal = 90 - angleAVal;
    } else if (b && angleBVal && !c) {
      c = b / Math.sin(degreesToRadians(angleBVal));
      a = b / Math.tan(degreesToRadians(angleBVal));
      angleAVal = 90 - angleBVal;
    }

    // Actualizar los campos
    if (a) setSideA(formatNumber(a, 3).replace(',', '.'));
    if (b) setSideB(formatNumber(b, 3).replace(',', '.'));
    if (c) setSideC(formatNumber(c, 3).replace(',', '.'));
    if (angleAVal) setAngleA(formatNumber(angleAVal, 2).replace(',', '.'));
    if (angleBVal) setAngleB(formatNumber(angleBVal, 2).replace(',', '.'));

    // Dibujar el triángulo
    drawTriangle(a, b, c, angleAVal, angleBVal);
  };

  // Limpiar triángulo
  const clearTriangle = () => {
    setSideA('');
    setSideB('');
    setSideC('');
    setAngleA('');
    setAngleB('');
    setTriangleArea('0');
    setTrianglePerimeter('0');

    const canvas = triangleRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Manejar cambio de ángulo
  const handleAngleChange = (value: string) => {
    setAngleInput(value);
    const numValue = parseFloat(value) || 0;
    const angleInRadians = angleUnit === 'degrees' ? degreesToRadians(numValue) : numValue;
    const angleInDegrees = angleUnit === 'degrees' ? numValue : radiansToDegrees(numValue);

    setCurrentAngleDegrees(angleInDegrees);
    updateCalculations(angleInRadians);
  };

  // Efectos
  useEffect(() => {
    updateCalculations(degreesToRadians(currentAngleDegrees));
    drawUnitCircle();
    drawTriangle();
    drawFunctionGraph();
  }, []);

  useEffect(() => {
    drawUnitCircle();
  }, [currentAngleDegrees]);

  useEffect(() => {
    drawFunctionGraph();
  }, [currentFunction]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📐 Calculadora de Trigonometría</h1>
        <p className={styles.subtitle}>Explora y comprende las funciones trigonométricas de forma visual</p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de Calculadora */}
        <section className={styles.calculatorPanel}>
          <h2>Calculadora Básica</h2>

          {/* Conversión de Ángulos */}
          <div className={styles.calcSection}>
            <h3>Conversión de Ángulos</h3>
            <div className={styles.inputGroup}>
              <label htmlFor="degrees">Grados:</label>
              <input
                type="number"
                id="degrees"
                step="any"
                placeholder="45"
                value={degreesinput}
                onChange={(e) => {
                  setDegreesInput(e.target.value);
                  const degrees = parseFloat(e.target.value) || 0;
                  const radians = degreesToRadians(degrees);
                  setRadiansInput(formatNumber(radians).replace(',', '.'));
                }}
              />
              <span>°</span>
            </div>
            <div className={styles.conversionArrow}>⇅</div>
            <div className={styles.inputGroup}>
              <label htmlFor="radians">Radianes:</label>
              <input
                type="number"
                id="radians"
                step="any"
                placeholder="0.7854"
                value={radiansInput}
                onChange={(e) => {
                  setRadiansInput(e.target.value);
                  const radians = parseFloat(e.target.value.replace(',', '.')) || 0;
                  const degrees = radiansToDegrees(radians);
                  setDegreesInput(formatNumber(degrees, 2).replace(',', '.'));
                }}
              />
              <span>rad</span>
            </div>
          </div>

          {/* Funciones Trigonométricas */}
          <div className={styles.calcSection}>
            <h3>Funciones Trigonométricas</h3>
            <div className={styles.inputGroup}>
              <label htmlFor="angle-input">Ángulo:</label>
              <input
                type="number"
                id="angle-input"
                step="any"
                value={angleInput}
                onChange={(e) => handleAngleChange(e.target.value)}
              />
              <select
                id="angle-unit"
                value={angleUnit}
                onChange={(e) => {
                  setAngleUnit(e.target.value as 'degrees' | 'radians');
                  handleAngleChange(angleInput);
                }}
              >
                <option value="degrees">Grados</option>
                <option value="radians">Radianes</option>
              </select>
            </div>

            <div className={styles.resultsGrid}>
              <div className={styles.resultItem}>
                <span className={styles.label}>sen(θ) =</span>
                <span className={styles.value}>{sinResult}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.label}>cos(θ) =</span>
                <span className={styles.value}>{cosResult}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.label}>tan(θ) =</span>
                <span className={styles.value}>{tanResult}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.label}>csc(θ) =</span>
                <span className={styles.value}>{cscResult}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.label}>sec(θ) =</span>
                <span className={styles.value}>{secResult}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.label}>cot(θ) =</span>
                <span className={styles.value}>{cotResult}</span>
              </div>
            </div>
          </div>

          {/* Resolver Triángulo */}
          <div className={styles.calcSection}>
            <h3>Resolver Triángulo Rectángulo</h3>
            <div className={styles.triangleInputs}>
              <div className={styles.inputGroup}>
                <label htmlFor="side-a">Lado a:</label>
                <input
                  type="number"
                  id="side-a"
                  step="any"
                  placeholder="Opuesto"
                  value={sideA}
                  onChange={(e) => setSideA(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="side-b">Lado b:</label>
                <input
                  type="number"
                  id="side-b"
                  step="any"
                  placeholder="Adyacente"
                  value={sideB}
                  onChange={(e) => setSideB(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="side-c">Hipotenusa c:</label>
                <input
                  type="number"
                  id="side-c"
                  step="any"
                  placeholder="Hipotenusa"
                  value={sideC}
                  onChange={(e) => setSideC(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="angle-A">Ángulo A:</label>
                <input
                  type="number"
                  id="angle-A"
                  step="any"
                  placeholder="Grados"
                  value={angleA}
                  onChange={(e) => setAngleA(e.target.value)}
                />
                <span>°</span>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="angle-B">Ángulo B:</label>
                <input
                  type="number"
                  id="angle-B"
                  step="any"
                  placeholder="Grados"
                  value={angleB}
                  onChange={(e) => setAngleB(e.target.value)}
                />
                <span>°</span>
              </div>
            </div>
            <button type="button" onClick={solveTriangle} className={styles.btnPrimary}>
              Resolver Triángulo
            </button>
            <button type="button" onClick={clearTriangle} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </section>

        {/* Panel de Visualización */}
        <section className={styles.visualizationPanel}>
          <h2>Visualización Interactiva</h2>

          {/* Círculo Unitario */}
          <div className={styles.vizSection}>
            <h3>Círculo Unitario</h3>
            <canvas ref={unitCircleRef} width="400" height="400"></canvas>
            <div className={styles.controls}>
              <input
                type="range"
                id="angle-slider"
                min="0"
                max="360"
                value={currentAngleDegrees}
                step="1"
                onChange={(e) => {
                  const degrees = parseFloat(e.target.value);
                  setCurrentAngleDegrees(degrees);
                  setAngleInput(degrees.toString());
                  setAngleUnit('degrees');
                  updateCalculations(degreesToRadians(degrees));
                }}
              />
              <span id="angle-display">{Math.round(currentAngleDegrees)}°</span>
            </div>
          </div>

          {/* Triángulo Visual */}
          <div className={styles.vizSection}>
            <h3>Triángulo Rectángulo</h3>
            <canvas ref={triangleRef} width="400" height="300"></canvas>
            <div className={styles.triangleInfo}>
              <p>
                Área: <span>{triangleArea}</span>
              </p>
              <p>
                Perímetro: <span>{trianglePerimeter}</span>
              </p>
            </div>
          </div>

          {/* Gráfica de Funciones */}
          <div className={styles.vizSection}>
            <h3>Gráficas de Funciones</h3>
            <div className={styles.functionButtons}>
              <button
                type="button"
                className={`${styles.btnFunction} ${currentFunction === 'sin' ? styles.active : ''}`}
                onClick={() => setCurrentFunction('sin')}
              >
                sen(x)
              </button>
              <button
                type="button"
                className={`${styles.btnFunction} ${currentFunction === 'cos' ? styles.active : ''}`}
                onClick={() => setCurrentFunction('cos')}
              >
                cos(x)
              </button>
              <button
                type="button"
                className={`${styles.btnFunction} ${currentFunction === 'tan' ? styles.active : ''}`}
                onClick={() => setCurrentFunction('tan')}
              >
                tan(x)
              </button>
            </div>
            <canvas ref={functionRef} width="400" height="200"></canvas>
          </div>
        </section>
      </div>

      {/* Panel de Referencia Rápida */}
      <section className={styles.referencePanel}>
        <h2>📚 Referencia Rápida</h2>
        <div className={styles.referenceGrid}>
          <div className={styles.refCard}>
            <h4>Identidades Pitagóricas</h4>
            <p>sen²θ + cos²θ = 1</p>
            <p>1 + tan²θ = sec²θ</p>
            <p>1 + cot²θ = csc²θ</p>
          </div>
          <div className={styles.refCard}>
            <h4>Ángulos Especiales</h4>
            <table className={styles.specialAngles}>
              <thead>
                <tr>
                  <th>°</th>
                  <th>rad</th>
                  <th>sen</th>
                  <th>cos</th>
                  <th>tan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0°</td>
                  <td>0</td>
                  <td>0</td>
                  <td>1</td>
                  <td>0</td>
                </tr>
                <tr>
                  <td>30°</td>
                  <td>π/6</td>
                  <td>1/2</td>
                  <td>√3/2</td>
                  <td>√3/3</td>
                </tr>
                <tr>
                  <td>45°</td>
                  <td>π/4</td>
                  <td>√2/2</td>
                  <td>√2/2</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>60°</td>
                  <td>π/3</td>
                  <td>√3/2</td>
                  <td>1/2</td>
                  <td>√3</td>
                </tr>
                <tr>
                  <td>90°</td>
                  <td>π/2</td>
                  <td>1</td>
                  <td>0</td>
                  <td>∞</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.refCard}>
            <h4>Fórmulas de Triángulos</h4>
            <p>
              <strong>Teorema de Pitágoras:</strong> a² + b² = c²
            </p>
            <p>
              <strong>Área:</strong> ½ × base × altura
            </p>
            <p>
              <strong>sen θ =</strong> opuesto / hipotenusa
            </p>
            <p>
              <strong>cos θ =</strong> adyacente / hipotenusa
            </p>
            <p>
              <strong>tan θ =</strong> opuesto / adyacente
            </p>
          </div>
        </div>
      </section>

      {/* Secciones Educativas */}
      <div className={styles.eduSection}>
        <h2>¿Cómo funciona esta calculadora de trigonometría?</h2>
        <p>
          Herramienta completa para explorar funciones trigonométricas con visualizaciones interactivas del círculo
          unitario, gráficas de funciones y resolución de triángulos rectángulos.
        </p>
        <ul>
          <li>
            <strong>Conversión de ángulos</strong>: Convierte entre grados y radianes instantáneamente
          </li>
          <li>
            <strong>6 funciones trigonométricas</strong>: Calcula seno, coseno, tangente y sus recíprocas
          </li>
          <li>
            <strong>Círculo unitario visual</strong>: Entiende las funciones trigonométricas geométricamente
          </li>
          <li>
            <strong>Resolver triángulos</strong>: Calcula lados y ángulos desconocidos automáticamente
          </li>
          <li>
            <strong>Gráficas interactivas</strong>: Visualiza las funciones sen(x), cos(x) y tan(x)
          </li>
        </ul>
      </div>

      <div className={styles.eduSection}>
        <h2>Casos de uso prácticos</h2>
        <ul>
          <li>
            <strong>Tareas de matemáticas</strong>: Verifica tus cálculos y entiende los conceptos visualmente
          </li>
          <li>
            <strong>Ingeniería</strong>: Resuelve problemas de fuerzas, vectores y ángulos de inclinación
          </li>
          <li>
            <strong>Navegación y GPS</strong>: Calcula distancias y direcciones usando trigonometría
          </li>
          <li>
            <strong>Arquitectura</strong>: Diseña tejados, rampas y estructuras con ángulos precisos
          </li>
          <li>
            <strong>Física</strong>: Analiza movimientos circulares, oscilaciones y ondas
          </li>
        </ul>
      </div>

      <Footer appName="trigonometria" />
    </div>
  );
}
