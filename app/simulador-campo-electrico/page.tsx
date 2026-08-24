'use client';
// @disclaimer: exempt

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumberOr } from '@/lib';
import styles from './SimuladorCampoElectrico.module.css';

// ============================================================
// Tipos
// ============================================================
interface Carga {
  id: string;
  x: number; // metros (mundo)
  y: number; // metros (mundo)
  q: number; // nC (positivo o negativo)
}

interface Punto {
  x: number;
  y: number;
}

type Modo = 'add-pos' | 'add-neg' | 'move' | 'delete';
type Preset = 'puntual' | 'dipolo' | 'cuadrupolo' | 'lineal';

// ============================================================
// Constantes físicas
// ============================================================
const K_COULOMB = 8.99e9; // N·m²/C²
const NC_TO_C = 1e-9; // 1 nC = 1e-9 C

// Geometría del lienzo
const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;
const ORIGIN_X = SVG_WIDTH / 2;
const ORIGIN_Y = SVG_HEIGHT / 2;
const SCALE = 100; // 1 metro = 100 px

// Conversores mundo <-> SVG
/** Mitad del lienzo en metros: 800 px / 2 / 100 px·m⁻¹ = 4,00 m · 500 / 2 / 100 = 2,50 m */
const LIMITE_X = SVG_WIDTH / 2 / SCALE;
const LIMITE_Y = SVG_HEIGHT / 2 / SCALE;
const acotarAlLienzo = (v: number, limite: number) => Math.max(-limite, Math.min(limite, v));

const worldToSvg = (x: number, y: number): Punto => ({
  x: ORIGIN_X + x * SCALE,
  y: ORIGIN_Y - y * SCALE,
});
const svgToWorld = (sx: number, sy: number): Punto => ({
  x: (sx - ORIGIN_X) / SCALE,
  y: (ORIGIN_Y - sy) / SCALE,
});

// ============================================================
// Cálculos del campo
// ============================================================
/**
 * Radio alrededor de cada carga donde E y V divergen y no hay cifra que dar.
 *
 * La guardia estaba —hay que saltarse el término, o sale Infinity— pero no se decía: se
 * presentaba el campo de LAS DEMÁS cargas como si fuese el del punto, con el mismo formato y
 * sin ningún aviso. Sobre una carga de +5 nC de un dipolo, el panel daba «44,95 N/C» y un
 * potencial NEGATIVO, que son los de la otra carga. Y soltar la sonda encima es un gesto
 * natural: mide 10 px de radio y la carga 17.
 */
const RADIO_SINGULARIDAD = 0.05; // m

function calcularCampoEnPunto(
  x: number,
  y: number,
  cargas: Carga[]
): { Ex: number; Ey: number; V: number; singular: boolean } {
  let Ex = 0;
  let Ey = 0;
  let V = 0;
  let singular = false;
  for (const c of cargas) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);
    if (r < RADIO_SINGULARIDAD) {
      singular = true;
      continue;
    }
    const qC = c.q * NC_TO_C;
    const factor = (K_COULOMB * qC) / (r2 * r); // E = kq/r² · r̂
    Ex += factor * dx;
    Ey += factor * dy;
    V += (K_COULOMB * qC) / r;
  }
  return { Ex, Ey, V, singular };
}

function generarId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/** Exponente en superíndices Unicode: -8 → ⁻⁸ */
const SUPERINDICES = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
function aSuperindice(exp: number): string {
  const signo = exp < 0 ? '⁻' : '';
  return signo + String(Math.abs(exp)).split('').map((d) => SUPERINDICES[Number(d)]).join('');
}

// ============================================================
// Configuraciones predefinidas
// ============================================================
function aplicarPreset(preset: Preset): Carga[] {
  switch (preset) {
    case 'puntual':
      return [{ id: generarId(), x: 0, y: 0, q: 5 }];
    case 'dipolo':
      return [
        { id: generarId(), x: -0.5, y: 0, q: 5 },
        { id: generarId(), x: 0.5, y: 0, q: -5 },
      ];
    case 'cuadrupolo':
      return [
        { id: generarId(), x: -0.6, y: -0.6, q: 5 },
        { id: generarId(), x: 0.6, y: 0.6, q: 5 },
        { id: generarId(), x: -0.6, y: 0.6, q: -5 },
        { id: generarId(), x: 0.6, y: -0.6, q: -5 },
      ];
    case 'lineal':
      return [
        { id: generarId(), x: -1, y: 0, q: 4 },
        { id: generarId(), x: 0, y: 0, q: 4 },
        { id: generarId(), x: 1, y: 0, q: 4 },
      ];
  }
}

// ============================================================
// Trazado de líneas de campo
// ============================================================
function trazarLineaCampo(
  inicio: Punto,
  cargas: Carga[],
  direccion: 1 | -1,
  maxPasos: number = 800,
  paso: number = 0.02
): Punto[] {
  const puntos: Punto[] = [inicio];
  let x = inicio.x;
  let y = inicio.y;
  for (let i = 0; i < maxPasos; i++) {
    const { Ex, Ey } = calcularCampoEnPunto(x, y, cargas);
    const mag = Math.sqrt(Ex * Ex + Ey * Ey);
    if (mag === 0 || !isFinite(mag)) break;
    const nx = (direccion * Ex) / mag;
    const ny = (direccion * Ey) / mag;
    x += nx * paso;
    y += ny * paso;
    // detener si entra en una carga (cualquier signo) o sale del lienzo
    let dentroDeCarga = false;
    for (const c of cargas) {
      const dx = x - c.x;
      const dy = y - c.y;
      if (Math.sqrt(dx * dx + dy * dy) < 0.08) {
        dentroDeCarga = true;
        break;
      }
    }
    if (dentroDeCarga) break;
    if (Math.abs(x) > 5 || Math.abs(y) > 3.5) break;
    puntos.push({ x, y });
  }
  return puntos;
}

function lineasDesdeCargas(cargas: Carga[], lineasPorCargaUnitaria: number): Punto[][] {
  const lineas: Punto[][] = [];
  for (const c of cargas) {
    const numLineas = Math.max(8, Math.round(lineasPorCargaUnitaria * Math.abs(c.q) / 5));
    const direccion: 1 | -1 = c.q > 0 ? 1 : -1;
    for (let i = 0; i < numLineas; i++) {
      const angulo = (2 * Math.PI * i) / numLineas;
      const inicio: Punto = {
        x: c.x + 0.1 * Math.cos(angulo),
        y: c.y + 0.1 * Math.sin(angulo),
      };
      lineas.push(trazarLineaCampo(inicio, cargas, direccion));
    }
  }
  return lineas;
}

// ============================================================
// Equipotenciales (marching squares simplificado)
// ============================================================
function generarEquipotenciales(
  cargas: Carga[],
  niveles: number[]
): { nivel: number; segmentos: [Punto, Punto][] }[] {
  const cols = 80;
  const rows = 50;
  const xMin = -4;
  const xMax = 4;
  const yMin = -2.5;
  const yMax = 2.5;
  const dx = (xMax - xMin) / cols;
  const dy = (yMax - yMin) / rows;
  // Calcular V en rejilla
  const V: number[][] = [];
  for (let j = 0; j <= rows; j++) {
    const fila: number[] = [];
    for (let i = 0; i <= cols; i++) {
      const x = xMin + i * dx;
      const y = yMin + j * dy;
      let v = 0;
      let saltar = false;
      for (const c of cargas) {
        const ddx = x - c.x;
        const ddy = y - c.y;
        const r = Math.sqrt(ddx * ddx + ddy * ddy);
        if (r < 0.08) {
          saltar = true;
          break;
        }
        v += (K_COULOMB * c.q * NC_TO_C) / r;
      }
      fila.push(saltar ? Number.NaN : v);
    }
    V.push(fila);
  }

  const resultado: { nivel: number; segmentos: [Punto, Punto][] }[] = [];
  for (const nivel of niveles) {
    const segmentos: [Punto, Punto][] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const v00 = V[j][i];
        const v10 = V[j][i + 1];
        const v01 = V[j + 1][i];
        const v11 = V[j + 1][i + 1];
        if ([v00, v10, v01, v11].some((v) => !isFinite(v))) continue;
        // Marching squares: índice según signos
        const x0 = xMin + i * dx;
        const y0 = yMin + j * dy;
        const x1 = x0 + dx;
        const y1 = y0 + dy;
        const interp = (va: number, vb: number, pa: Punto, pb: Punto): Punto => {
          const t = (nivel - va) / (vb - va);
          return { x: pa.x + t * (pb.x - pa.x), y: pa.y + t * (pb.y - pa.y) };
        };
        const p00: Punto = { x: x0, y: y0 };
        const p10: Punto = { x: x1, y: y0 };
        const p01: Punto = { x: x0, y: y1 };
        const p11: Punto = { x: x1, y: y1 };
        let idx = 0;
        if (v00 > nivel) idx |= 1;
        if (v10 > nivel) idx |= 2;
        if (v11 > nivel) idx |= 4;
        if (v01 > nivel) idx |= 8;
        if (idx === 0 || idx === 15) continue;
        // Aristas: bottom (v00-v10), right (v10-v11), top (v01-v11), left (v00-v01)
        const eb = interp(v00, v10, p00, p10);
        const er = interp(v10, v11, p10, p11);
        const et = interp(v01, v11, p01, p11);
        const el = interp(v00, v01, p00, p01);
        switch (idx) {
          case 1:
          case 14:
            segmentos.push([eb, el]);
            break;
          case 2:
          case 13:
            segmentos.push([eb, er]);
            break;
          case 3:
          case 12:
            segmentos.push([el, er]);
            break;
          case 4:
          case 11:
            segmentos.push([er, et]);
            break;
          case 5:
            segmentos.push([eb, er]);
            segmentos.push([el, et]);
            break;
          case 6:
          case 9:
            segmentos.push([eb, et]);
            break;
          case 7:
          case 8:
            segmentos.push([el, et]);
            break;
          case 10:
            segmentos.push([eb, el]);
            segmentos.push([er, et]);
            break;
        }
      }
    }
    resultado.push({ nivel, segmentos });
  }
  return resultado;
}

// ============================================================
// Mapa de color (intensidad |E|)
// ============================================================
function colorParaIntensidad(E: number, Emax: number): string {
  // Escala logarítmica para no saturar cerca de cargas
  const t = Math.min(1, Math.log10(1 + 9 * (E / Emax)));
  // Azul (cyan) → verde → amarillo → rojo
  if (t < 0.33) {
    const k = t / 0.33;
    const r = Math.round(0 + k * 0);
    const g = Math.round(180 + k * 60);
    const b = Math.round(220 - k * 100);
    return `rgb(${r},${g},${b})`;
  } else if (t < 0.66) {
    const k = (t - 0.33) / 0.33;
    const r = Math.round(0 + k * 240);
    const g = Math.round(240 - k * 40);
    const b = Math.round(120 - k * 120);
    return `rgb(${r},${g},${b})`;
  }
  const k = (t - 0.66) / 0.34;
  const r = Math.round(240 + k * 15);
  const g = Math.round(200 - k * 200);
  const b = Math.round(0);
  return `rgb(${r},${g},${b})`;
}

// ============================================================
// Componente principal
// ============================================================
export default function SimuladorCampoElectrico() {
  const [cargas, setCargas] = useState<Carga[]>(() => aplicarPreset('dipolo'));
  const [modo, setModo] = useState<Modo>('add-pos');
  const [magnitudNueva, setMagnitudNueva] = useState<number>(5); // nC
  const [verVectores, setVerVectores] = useState<boolean>(true);
  const [verLineas, setVerLineas] = useState<boolean>(true);
  const [verEquipotenciales, setVerEquipotenciales] = useState<boolean>(false);
  const [verMapaColor, setVerMapaColor] = useState<boolean>(false);
  const [pruebaPos, setPruebaPos] = useState<Punto>({ x: 1.5, y: 0.7 });
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);
  const [arrastrandoPrueba, setArrastrandoPrueba] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // ----- Conversión coordenadas pointer → SVG → mundo -----
  const pointerASvg = useCallback((clientX: number, clientY: number): Punto | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }, []);

  // ----- Handlers de interacción -----
  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    if (target.dataset.tipo === 'carga' || target.dataset.tipo === 'prueba' || target.dataset.tipo === 'remove') {
      // delegado por su propio handler
      return;
    }
    const svgPt = pointerASvg(e.clientX, e.clientY);
    if (!svgPt) return;
    const { x, y } = svgToWorld(svgPt.x, svgPt.y);
    if (modo === 'add-pos') {
      setCargas((prev) => [...prev, { id: generarId(), x, y, q: magnitudNueva }]);
    } else if (modo === 'add-neg') {
      setCargas((prev) => [...prev, { id: generarId(), x, y, q: -magnitudNueva }]);
    }
  };

  const handleCargaPointerDown = (e: React.PointerEvent<SVGCircleElement>, id: string) => {
    e.stopPropagation();
    if (modo === 'delete') {
      setCargas((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    setArrastrandoId(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePruebaPointerDown = (e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    setArrastrandoPrueba(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!arrastrandoId && !arrastrandoPrueba) return;
    const svgPt = pointerASvg(e.clientX, e.clientY);
    if (!svgPt) return;
    const { x, y } = svgToWorld(svgPt.x, svgPt.y);
    // Acotado al área visible: `setPointerCapture` mantiene el arrastre más allá del borde
    // del SVG, así que sin esto lo arrastrado se pierde fuera del viewBox. La sonda se acotó
    // al reparar el hallazgo 216, pero las CARGAS se arrastran con el mismo mecanismo y se
    // quedaron fuera: una carga arrastrada al vacío quedaba invisible, seguía contada en
    // «Cargas en el sistema» y seguía alterando el campo que el panel presenta como bueno,
    // sin más salida que «Limpiar todo», que destruye la configuración entera. Es el
    // hallazgo 269 del Inspector: la misma trampa del 216, movida de la sonda a las cargas.
    const xAcotada = acotarAlLienzo(x, LIMITE_X);
    const yAcotada = acotarAlLienzo(y, LIMITE_Y);
    if (arrastrandoId) {
      setCargas((prev) =>
        prev.map((c) => (c.id === arrastrandoId ? { ...c, x: xAcotada, y: yAcotada } : c)),
      );
    } else if (arrastrandoPrueba) {
      setPruebaPos({ x: xAcotada, y: yAcotada });
    }
  };

  const handlePointerUp = () => {
    setArrastrandoId(null);
    setArrastrandoPrueba(false);
  };

  /**
   * El lienzo, manejado con el teclado (hallazgo 270 del Inspector).
   *
   * No había dentro del SVG ni un elemento focalizable, ni tabindex, ni role, ni entrada
   * numérica alternativa: sin ratón, la configuración se limitaba a los cuatro presets y la
   * sonda se quedaba clavada en (1,50; 0,70), de modo que la promesa del subtítulo —«mide la
   * fuerza sobre una carga de prueba»— era inalcanzable para quien navega con teclado o con
   * lector de pantalla, que además solo oía «Lienzo del campo eléctrico» por muchas cargas
   * que hubiera.
   *
   * Las flechas mueven la sonda, `+`/`−` colocan una carga donde está y `Supr` retira la más
   * cercana. El paso es de 10 cm, y de 1 cm con Mayús, para poder acercarse a una carga sin
   * caer en su singularidad (radio 5 cm). Debajo del panel hay además dos campos numéricos
   * con la posición exacta, que sirven igual con ratón.
   */
  const handleCanvasKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const paso = e.shiftKey ? 0.01 : 0.1;
    const mover = (dx: number, dy: number) => {
      e.preventDefault();
      setPruebaPos((p) => ({
        x: acotarAlLienzo(p.x + dx, LIMITE_X),
        y: acotarAlLienzo(p.y + dy, LIMITE_Y),
      }));
    };

    switch (e.key) {
      case 'ArrowLeft':  return mover(-paso, 0);
      case 'ArrowRight': return mover(paso, 0);
      case 'ArrowUp':    return mover(0, paso);
      case 'ArrowDown':  return mover(0, -paso);
      case '+':
      case 'Add':
        e.preventDefault();
        setCargas((prev) => [
          ...prev,
          { id: generarId(), x: pruebaPos.x, y: pruebaPos.y, q: magnitudNueva },
        ]);
        return;
      case '-':
      case '−':
      case 'Subtract':
        e.preventDefault();
        setCargas((prev) => [
          ...prev,
          { id: generarId(), x: pruebaPos.x, y: pruebaPos.y, q: -magnitudNueva },
        ]);
        return;
      case 'Delete':
      case 'Backspace': {
        e.preventDefault();
        setCargas((prev) => {
          if (prev.length === 0) return prev;
          let masCercana = prev[0];
          let menorDistancia = Infinity;
          for (const c of prev) {
            const d = Math.hypot(c.x - pruebaPos.x, c.y - pruebaPos.y);
            if (d < menorDistancia) {
              menorDistancia = d;
              masCercana = c;
            }
          }
          return prev.filter((c) => c.id !== masCercana.id);
        });
        return;
      }
    }
  };

  const handleEliminar = (e: React.MouseEvent<SVGGElement>, id: string) => {
    e.stopPropagation();
    setCargas((prev) => prev.filter((c) => c.id !== id));
  };

  const handlePreset = (p: Preset) => {
    setCargas(aplicarPreset(p));
  };

  const handleLimpiar = () => {
    setCargas([]);
  };

  // Evitar menú contextual en el SVG (clic derecho elimina cargas en modo no-delete)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onContext = (ev: Event) => ev.preventDefault();
    svg.addEventListener('contextmenu', onContext);
    return () => svg.removeEventListener('contextmenu', onContext);
  }, []);

  // ----- Cálculos derivados (memoizados) -----
  const lineas = useMemo<Punto[][]>(() => {
    if (!verLineas || cargas.length === 0) return [];
    return lineasDesdeCargas(cargas, 16);
  }, [cargas, verLineas]);

  const equipot = useMemo(() => {
    if (!verEquipotenciales || cargas.length === 0) return [];
    // Niveles de potencial proporcionales a la magnitud de las cargas
    const sumQ = cargas.reduce((s, c) => s + Math.abs(c.q), 0);
    const ref = (K_COULOMB * sumQ * NC_TO_C) / 1; // V de referencia a 1 m
    const niveles = [-ref, -ref / 2, -ref / 5, ref / 5, ref / 2, ref];
    return generarEquipotenciales(cargas, niveles);
  }, [cargas, verEquipotenciales]);

  const rejillaVectores = useMemo(() => {
    if (!verVectores || cargas.length === 0) return [];
    const stepPx = 50;
    const items: { sx: number; sy: number; Ex: number; Ey: number; mag: number }[] = [];
    let maxMag = 0;
    for (let sx = stepPx / 2; sx < SVG_WIDTH; sx += stepPx) {
      for (let sy = stepPx / 2; sy < SVG_HEIGHT; sy += stepPx) {
        const w = svgToWorld(sx, sy);
        const { Ex, Ey } = calcularCampoEnPunto(w.x, w.y, cargas);
        const mag = Math.sqrt(Ex * Ex + Ey * Ey);
        if (!isFinite(mag) || mag === 0) continue;
        if (mag > maxMag) maxMag = mag;
        items.push({ sx, sy, Ex, Ey, mag });
      }
    }
    return items.map((it) => {
      // Longitud escalada logarítmicamente para visualización
      const len = Math.min(28, 6 + 14 * Math.log10(1 + (9 * it.mag) / Math.max(maxMag, 1e-6)));
      const ang = Math.atan2(-it.Ey, it.Ex); // -Ey porque Y svg invertida
      const x2 = it.sx + len * Math.cos(ang);
      const y2 = it.sy + len * Math.sin(ang);
      return { sx: it.sx, sy: it.sy, x2, y2, ang };
    });
  }, [cargas, verVectores]);

  const mapaColor = useMemo(() => {
    if (!verMapaColor || cargas.length === 0) return [];
    const cols = 40;
    const rows = 25;
    const cellW = SVG_WIDTH / cols;
    const cellH = SVG_HEIGHT / rows;
    const items: { sx: number; sy: number; mag: number }[] = [];
    let maxMag = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const sx = (i + 0.5) * cellW;
        const sy = (j + 0.5) * cellH;
        const w = svgToWorld(sx, sy);
        const { Ex, Ey } = calcularCampoEnPunto(w.x, w.y, cargas);
        const mag = Math.sqrt(Ex * Ex + Ey * Ey);
        if (!isFinite(mag)) continue;
        if (mag > maxMag) maxMag = mag;
        items.push({ sx: i * cellW, sy: j * cellH, mag });
      }
    }
    return items.map((it) => ({
      sx: it.sx,
      sy: it.sy,
      w: cellW,
      h: cellH,
      color: colorParaIntensidad(it.mag, Math.max(maxMag, 1e-6)),
    }));
  }, [cargas, verMapaColor]);

  // Cálculos sobre la carga de prueba (q0 = +1 nC)
  const datosPrueba = useMemo(() => {
    const q0 = 1 * NC_TO_C;
    const { Ex, Ey, V, singular } = calcularCampoEnPunto(pruebaPos.x, pruebaPos.y, cargas);
    const E = Math.sqrt(Ex * Ex + Ey * Ey);
    const Fx = q0 * Ex;
    const Fy = q0 * Ey;
    const F = Math.sqrt(Fx * Fx + Fy * Fy);
    const U = q0 * V;
    return { Ex, Ey, E, V, Fx, Fy, F, U, singular };
  }, [cargas, pruebaPos]);

  const sufijoNotacion = (n: number, decimales: number = 2): string => {
    if (!isFinite(n)) return '∞';
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (abs >= 1e6 || abs < 1e-3) {
      let exp = Math.floor(Math.log10(abs));
      let mant = n / Math.pow(10, exp);
      // Si el redondeo a `decimales` eleva la mantisa a 10, normalizar (ej. 9,995 → 10,00 × 10^n se convierte en 1,00 × 10^(n+1))
      if (Math.abs(Number(mant.toFixed(decimales))) >= 10) {
        mant /= 10;
        exp += 1;
      }
      // Superíndices reales, como los escribe el bloque educativo de la misma página (10⁻⁹,
      // r², C·m). Con el circunflejo ASCII, «1,64 × 10^-8» se lee como texto sin formatear.
      return `${formatNumber(mant, decimales)} × 10${aSuperindice(exp)}`;
    }
    return formatNumber(n, decimales);
  };

  // SVG path para una línea de campo
  const lineaPath = (puntos: Punto[]): string => {
    if (puntos.length === 0) return '';
    return puntos
      .map((p, i) => {
        const sv = worldToSvg(p.x, p.y);
        return `${i === 0 ? 'M' : 'L'} ${sv.x.toFixed(1)} ${sv.y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Posiciones SVG de las cargas y prueba
  const cargasSvg = cargas.map((c) => ({ ...c, svg: worldToSvg(c.x, c.y) }));
  const pruebaSvg = worldToSvg(pruebaPos.x, pruebaPos.y);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Campo Eléctrico</h1>
        <p>Coloca cargas, observa líneas de campo y mide fuerza sobre una carga de prueba</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Panel de controles */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Modo de edición</h2>
          <div className={styles.toolbar} role="group" aria-label="Modo de edición">
            <button
              className={`${styles.toolBtn} ${modo === 'add-pos' ? styles.toolActive : ''}`}
              onClick={() => setModo('add-pos')}
              type="button"
              aria-pressed={modo === 'add-pos'}
            >
              ＋ Añadir +
            </button>
            <button
              className={`${styles.toolBtn} ${modo === 'add-neg' ? styles.toolActive : ''}`}
              onClick={() => setModo('add-neg')}
              type="button"
              aria-pressed={modo === 'add-neg'}
            >
              − Añadir −
            </button>
            <button
              className={`${styles.toolBtn} ${modo === 'move' ? styles.toolActive : ''}`}
              onClick={() => setModo('move')}
              type="button"
              aria-pressed={modo === 'move'}
            >
              ✥ Mover
            </button>
            <button
              className={`${styles.toolBtn} ${modo === 'delete' ? styles.toolActive : ''}`}
              onClick={() => setModo('delete')}
              type="button"
              aria-pressed={modo === 'delete'}
            >
              ✕ Eliminar
            </button>
          </div>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="magnitud">
                Magnitud de la carga nueva
                <span className={styles.valueBadge}>{formatNumber(magnitudNueva, 1)} nC</span>
              </label>
              <input
                id="magnitud"
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={magnitudNueva}
                onChange={(e) => setMagnitudNueva(parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>
                Cargas en el sistema
                <span className={styles.valueBadge}>{cargas.length}</span>
              </label>
              <button
                className={styles.calcBtnGhost}
                onClick={handleLimpiar}
                type="button"
                disabled={cargas.length === 0}
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </section>

        {/* Configuraciones predefinidas */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Configuraciones predefinidas</h2>
          <div className={styles.presetGrid}>
            <button className={styles.presetCard} onClick={() => handlePreset('puntual')} type="button">
              Carga puntual aislada
            </button>
            <button className={styles.presetCard} onClick={() => handlePreset('dipolo')} type="button">
              Dipolo eléctrico (+/−)
            </button>
            <button className={styles.presetCard} onClick={() => handlePreset('cuadrupolo')} type="button">
              Cuadrupolo (++ y −−)
            </button>
            <button className={styles.presetCard} onClick={() => handlePreset('lineal')} type="button">
              3 cargas en línea (+++)
            </button>
          </div>
        </section>

        {/* Visualización */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Visualización</h2>
          <div className={styles.toggleGroup}>
            <label className={styles.toggleItem}>
              <input
                type="checkbox"
                checked={verVectores}
                onChange={(e) => setVerVectores(e.target.checked)}
              />
              Vectores de campo
            </label>
            <label className={styles.toggleItem}>
              <input
                type="checkbox"
                checked={verLineas}
                onChange={(e) => setVerLineas(e.target.checked)}
              />
              Líneas de campo
            </label>
            <label className={styles.toggleItem}>
              <input
                type="checkbox"
                checked={verEquipotenciales}
                onChange={(e) => setVerEquipotenciales(e.target.checked)}
              />
              Equipotenciales
            </label>
            <label className={styles.toggleItem}>
              <input
                type="checkbox"
                checked={verMapaColor}
                onChange={(e) => setVerMapaColor(e.target.checked)}
              />
              Mapa de intensidad
            </label>
          </div>

          <div className={styles.canvasContainer}>
            <div>
              <svg
                ref={svgRef}
                className={styles.canvasSvg}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                onPointerDown={handleSvgPointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onKeyDown={handleCanvasKeyDown}
                tabIndex={0}
                role="application"
                aria-label="Lienzo del campo eléctrico"
                aria-describedby="lienzo-teclado"
              >
                {/* Mapa de color (debajo de todo) */}
                {mapaColor.map((m, i) => (
                  <rect
                    key={`m${i}`}
                    x={m.sx}
                    y={m.sy}
                    width={m.w}
                    height={m.h}
                    fill={m.color}
                    opacity={0.35}
                    pointerEvents="none"
                  />
                ))}

                {/* Rejilla de fondo */}
                <g pointerEvents="none" opacity={0.18}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line
                      key={`vx${i}`}
                      x1={i * 100}
                      y1={0}
                      x2={i * 100}
                      y2={SVG_HEIGHT}
                      stroke="#94a3b8"
                      strokeWidth={0.5}
                    />
                  ))}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <line
                      key={`hy${i}`}
                      x1={0}
                      y1={i * 100}
                      x2={SVG_WIDTH}
                      y2={i * 100}
                      stroke="#94a3b8"
                      strokeWidth={0.5}
                    />
                  ))}
                </g>

                {/* Equipotenciales */}
                {equipot.map((nv, i) => (
                  <g key={`eq${i}`}>
                    {nv.segmentos.map((seg, k) => {
                      const a = worldToSvg(seg[0].x, seg[0].y);
                      const b = worldToSvg(seg[1].x, seg[1].y);
                      return (
                        <line
                          key={`s${k}`}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          className={styles.equipotencial}
                        />
                      );
                    })}
                  </g>
                ))}

                {/* Líneas de campo */}
                {lineas.map((puntos, i) => (
                  <path key={`ln${i}`} d={lineaPath(puntos)} className={styles.fieldLine} />
                ))}

                {/* Vectores de campo */}
                {rejillaVectores.map((v, i) => {
                  const head = 4;
                  const ang = v.ang;
                  const hx1 = v.x2 - head * Math.cos(ang - Math.PI / 6);
                  const hy1 = v.y2 - head * Math.sin(ang - Math.PI / 6);
                  const hx2 = v.x2 - head * Math.cos(ang + Math.PI / 6);
                  const hy2 = v.y2 - head * Math.sin(ang + Math.PI / 6);
                  return (
                    <g key={`v${i}`} pointerEvents="none">
                      <line
                        x1={v.sx}
                        y1={v.sy}
                        x2={v.x2}
                        y2={v.y2}
                        className={styles.fieldVector}
                      />
                      <polygon
                        points={`${v.x2},${v.y2} ${hx1},${hy1} ${hx2},${hy2}`}
                        className={styles.fieldVectorHead}
                      />
                    </g>
                  );
                })}

                {/* Cargas */}
                {cargasSvg.map((c) => {
                  const radio = 14 + Math.min(8, Math.abs(c.q) * 0.6);
                  const claseColor = c.q >= 0 ? styles.cargaPos : styles.cargaNeg;
                  return (
                    <g key={c.id}>
                      <circle
                        cx={c.svg.x}
                        cy={c.svg.y}
                        r={radio}
                        className={`${styles.cargaCircle} ${claseColor}`}
                        data-tipo="carga"
                        onPointerDown={(e) => handleCargaPointerDown(e, c.id)}
                      />
                      <text x={c.svg.x} y={c.svg.y} className={styles.cargaLabel}>
                        {c.q >= 0 ? '+' : '−'}
                        {formatNumber(Math.abs(c.q), 1)}
                      </text>
                      {modo === 'delete' && (
                        <g
                          data-tipo="remove"
                          onClick={(e) => handleEliminar(e, c.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <circle
                            cx={c.svg.x + radio + 4}
                            cy={c.svg.y - radio - 4}
                            r={9}
                            className={styles.removeBtn}
                          />
                          <text
                            x={c.svg.x + radio + 4}
                            y={c.svg.y - radio - 4}
                            className={styles.removeText}
                          >
                            ✕
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Carga de prueba */}
                <g className={styles.testProbe}>
                  <circle
                    cx={pruebaSvg.x}
                    cy={pruebaSvg.y}
                    r={10}
                    className={styles.cargaPrueba}
                    data-tipo="prueba"
                    onPointerDown={handlePruebaPointerDown}
                    style={{ pointerEvents: 'auto' }}
                  />
                  <text
                    x={pruebaSvg.x}
                    y={pruebaSvg.y - 16}
                    fontSize="11"
                    fill="#1f2937"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    q₀
                  </text>
                  {/* Vector fuerza sobre la prueba.
                      Sobre una carga la fuerza no está definida, y el panel lo dice con «—»:
                      la flecha tampoco se dibuja. Su longitud CODIFICA el módulo
                      (lenF = 14 + 30·log₁₀(1 + F·10⁸)), así que seguir pintándola era seguir
                      publicando la misma cifra que la reparación del hallazgo 216 había
                      retirado del panel por engañosa — solo que en píxeles en vez de en
                      números (hallazgo 272 del Inspector). */}
                  {!datosPrueba.singular && datosPrueba.F > 0 && (() => {
                    const fmag = Math.sqrt(datosPrueba.Fx * datosPrueba.Fx + datosPrueba.Fy * datosPrueba.Fy);
                    const lenF = Math.min(50, 14 + 30 * Math.log10(1 + fmag * 1e8));
                    const ang = Math.atan2(-datosPrueba.Fy, datosPrueba.Fx);
                    const x2 = pruebaSvg.x + lenF * Math.cos(ang);
                    const y2 = pruebaSvg.y + lenF * Math.sin(ang);
                    const head = 6;
                    const hx1 = x2 - head * Math.cos(ang - Math.PI / 6);
                    const hy1 = y2 - head * Math.sin(ang - Math.PI / 6);
                    const hx2 = x2 - head * Math.cos(ang + Math.PI / 6);
                    const hy2 = y2 - head * Math.sin(ang + Math.PI / 6);
                    return (
                      <g pointerEvents="none">
                        <line
                          x1={pruebaSvg.x}
                          y1={pruebaSvg.y}
                          x2={x2}
                          y2={y2}
                          stroke="#16a34a"
                          strokeWidth={2.5}
                        />
                        <polygon
                          points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`}
                          fill="#16a34a"
                        />
                      </g>
                    );
                  })()}
                </g>
              </svg>
              <p className={styles.canvasHint}>
                Haz clic en el lienzo para añadir carga · Arrastra cargas y la bola gris (q₀) ·
                Eje X y eje Y en metros
              </p>
              {/* El nombre del lienzo se deja FIJO y el estado se cuenta aquí: un aria-label
                  que cambiara con cada tecla haría que el lector de pantalla renombrase el
                  elemento enfocado en cada pulsación. Las cifras nuevas ya las anuncia el
                  panel de resultados, que es una región viva. */}
              <p className={styles.canvasHint} id="lienzo-teclado">
                <span aria-hidden="true">⌨️</span> Con el lienzo enfocado: las <strong>flechas</strong>{' '}
                mueven la sonda (10 cm, o 1 cm con <kbd>Mayús</kbd>), <kbd>+</kbd> y <kbd>−</kbd>{' '}
                colocan una carga donde está, y <kbd>Supr</kbd> retira la más cercana. También
                puedes escribir su posición exacta bajo el panel de resultados.
              </p>
            </div>

            {/* Panel de resultados */}
            <div className={styles.resultBlock} role="status" aria-live="polite" aria-atomic="true">
              <h3 className={styles.resultTitle}>Carga de prueba q₀ = +1 nC</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Posición x</span>
                <span className={styles.resultValue}>{formatNumber(pruebaPos.x, 2)} m</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Posición y</span>
                <span className={styles.resultValue}>{formatNumber(pruebaPos.y, 2)} m</span>
              </div>
              {/* Sin role propio: el panel entero ya es una región viva (role="status" con
                  aria-live), y anidar otra dentro duplicaría el anuncio. */}
              {datosPrueba.singular && (
                <p className={styles.avisoSingularidad}>
                  La sonda está <strong>sobre una carga</strong>: ahí el campo y el potencial
                  divergen (r → 0) y no hay ninguna cifra que dar, así que el panel las deja en
                  «—» y el lienzo no dibuja la flecha de fuerza. Sepárala unos centímetros para
                  volver a medir.
                </p>
              )}
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>|E| (campo)</span>
                <span className={styles.resultValueAccent}>
                  {datosPrueba.singular ? '—' : `${sufijoNotacion(datosPrueba.E)} N/C`}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Eₓ</span>
                <span className={styles.resultValue}>{datosPrueba.singular ? '—' : `${sufijoNotacion(datosPrueba.Ex)} N/C`}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Eᵧ</span>
                <span className={styles.resultValue}>{datosPrueba.singular ? '—' : `${sufijoNotacion(datosPrueba.Ey)} N/C`}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>V (potencial)</span>
                <span className={styles.resultValueAccent}>{datosPrueba.singular ? '—' : `${sufijoNotacion(datosPrueba.V)} V`}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>|F| sobre q₀</span>
                <span className={styles.resultValueAccent}>{datosPrueba.singular ? '—' : `${sufijoNotacion(datosPrueba.F)} N`}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>U (energía)</span>
                <span className={styles.resultValue}>{datosPrueba.singular ? '—' : `${sufijoNotacion(datosPrueba.U)} J`}</span>
              </div>

              <div className={styles.legendRow}>
                <span className={`${styles.legendDot} ${styles.legendPos}`} aria-hidden="true" />
                Carga positiva
              </div>
              <div className={styles.legendRow}>
                <span className={`${styles.legendDot} ${styles.legendNeg}`} aria-hidden="true" />
                Carga negativa
              </div>
              <div className={styles.legendRow}>
                <span className={`${styles.legendDot} ${styles.legendProbe}`} aria-hidden="true" />
                Carga de prueba q₀ (arrastrable)
              </div>
            </div>

              {/* Posición exacta de la sonda, escribible.
                  Es la vía sin ratón que faltaba (hallazgo 270) y de paso permite colocar q₀
                  en un punto concreto, que arrastrando no se puede. Va FUERA de la región
                  role="status" del panel: un campo de formulario dentro de una zona viva se
                  reanuncia entero con cada tecla. */}
              <div className={styles.sondaExacta}>
                <p className={styles.sondaExactaTitulo} id="sonda-exacta-titulo">
                  Posición exacta de la sonda
                </p>
                <div className={styles.sondaExactaCampos} role="group" aria-labelledby="sonda-exacta-titulo">
                  <label className={styles.sondaExactaCampo} htmlFor="sonda-x">
                    <span>x (m)</span>
                    <input
                      id="sonda-x"
                      type="number"
                      step={0.1}
                      min={-LIMITE_X}
                      max={LIMITE_X}
                      value={pruebaPos.x}
                      onChange={(e) =>
                        setPruebaPos((p) => ({
                          ...p,
                          x: acotarAlLienzo(parseSpanishNumberOr(e.target.value), LIMITE_X),
                        }))
                      }
                    />
                  </label>
                  <label className={styles.sondaExactaCampo} htmlFor="sonda-y">
                    <span>y (m)</span>
                    <input
                      id="sonda-y"
                      type="number"
                      step={0.1}
                      min={-LIMITE_Y}
                      max={LIMITE_Y}
                      value={pruebaPos.y}
                      onChange={(e) =>
                        setPruebaPos((p) => ({
                          ...p,
                          y: acotarAlLienzo(parseSpanishNumberOr(e.target.value), LIMITE_Y),
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

          </div>
        </section>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Guía del Campo Eléctrico"
          subtitle="Ley de Coulomb, líneas de campo y equipotenciales"
        >
          <h3 className={styles.eduSubtitle}>Fórmulas clave</h3>
          {/* El valor de k solo vivía en el FAQPage del JSON-LD, que el usuario no lee, mientras
              la guía de la propia app le manda «aplicar E = kq/r²» y comparar su resultado con
              el panel. Sin la constante a la vista, esa comprobación es imposible. */}
          <p className={styles.eduParrafo}>
            En todas ellas <strong>k</strong> es la constante de Coulomb:{' '}
            <strong>k = 8,99 × 10⁹ N·m²/C²</strong>, que es el valor que aplica este simulador.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Magnitud</th>
                  <th>Fórmula</th>
                  <th>Unidad SI</th>
                  <th>Cuándo se usa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Campo eléctrico (vector)</td>
                  <td>E = k·q·r̂ / r²</td>
                  <td>N/C o V/m</td>
                  <td>Para describir la fuerza por unidad de carga en cada punto del espacio</td>
                </tr>
                <tr>
                  <td>Potencial (escalar)</td>
                  <td>V = k·q / r</td>
                  <td>V (voltio)</td>
                  <td>Energía por unidad de carga; útil porque se suma escalarmente</td>
                </tr>
                <tr>
                  <td>Fuerza sobre carga</td>
                  <td>F = q·E</td>
                  <td>N (newton)</td>
                  <td>Cuando hay una carga real en un campo conocido</td>
                </tr>
                <tr>
                  <td>Energía potencial</td>
                  <td>U = q·V</td>
                  <td>J (julio)</td>
                  <td>Energía almacenada por la carga en el campo</td>
                </tr>
                <tr>
                  <td>Dipolo (momento)</td>
                  <td>p = q·d</td>
                  <td>C·m</td>
                  <td>Caracteriza dos cargas iguales y opuestas separadas por d</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Casos de uso reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de secundaria</h4>
              <p>
                Visualiza el dipolo y comprende por qué las líneas salen de + y entran en −. Ideal
                para preparar el examen de electrostática.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Universitario de ingeniería</h4>
              <p>
                Explora cómo se distribuye el campo en un cuadrupolo o en un hilo cargado: eso es
                lo que aproximan tres cargas del MISMO signo en línea. Un condensador es otra cosa
                —exige dos placas de signo opuesto y da un campo uniforme entre ellas—, y la propia
                app lo desmiente: en el centro del preset «+++» el campo es 0 pero el potencial no.
                Prepárate para electromagnetismo I.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Profesor de física</h4>
              <p>
                Demuestra en clase la relación entre líneas de campo y equipotenciales: las líneas
                cruzan las equipotenciales perpendicularmente.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Investigador / divulgador</h4>
              <p>
                Construye configuraciones complejas para ilustrar artículos de divulgación o
                problemas de electromagnetismo aplicado.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué E es vectorial y V es escalar?</strong>
              <p>
                E mide la fuerza por unidad de carga: tiene dirección (hacia dónde empujaría una
                carga +). V mide la energía por unidad de carga: la energía es un número, no apunta
                en ninguna dirección.
              </p>
              <p className={styles.faqTip}>
                Truco: para sumar campos de varias cargas hay que sumar vectores; para sumar
                potenciales, basta con sumar números.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Pueden cortarse dos líneas de campo?</strong>
              <p>
                No. Si se cortaran, en el punto de cruce el campo tendría dos direcciones distintas
                a la vez, lo cual es imposible. El campo en cada punto del espacio tiene un único
                valor vectorial.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué son las equipotenciales?</strong>
              <p>
                Son curvas (superficies en 3D) donde el potencial V tiene el mismo valor. Mover una
                carga a lo largo de una equipotencial no requiere trabajo. Las líneas de campo son
                siempre perpendiculares a las equipotenciales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo se relaciona E con V?</strong>
              <p>
                E = −∇V (menos el gradiente del potencial). El campo apunta en la dirección en que
                V decrece más rápido. Donde las equipotenciales están muy juntas, el campo es
                intenso.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es un dipolo eléctrico?</strong>
              <p>
                Una pareja de cargas de igual magnitud y signos opuestos separadas por una distancia
                pequeña. Es el modelo básico para describir moléculas polares como el agua y para
                entender antenas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué hay simetría con cargas iguales?</strong>
              <p>
                El campo respeta la simetría de la distribución. En un cuadrupolo simétrico, el
                centro tiene E = 0 y la disposición se mantiene invariante bajo rotaciones de 180°.
                Las simetrías simplifican muchos problemas reales.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>
            Cómo resolver un problema de electrostática — paso a paso
          </h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica las cargas y sus posiciones</strong>
                <p>
                  Anota cada carga con su valor (con signo) y sus coordenadas. Dibuja un esquema.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Elige qué calcular: E, V, F o U</strong>
                <p>
                  Si te piden fuerza sobre una carga, usa E (vectorial). Si te piden energía o
                  trabajo, usa V (escalar, más sencillo).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Calcula la contribución de cada carga</strong>
                <p>
                  Para cada carga, halla su distancia r al punto y aplica E = kq/r² o V = kq/r. Para
                  E, ten en cuenta la dirección.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Suma con cuidado</strong>
                <p>
                  V se suma como números (con signo). E se suma como vectores: descompón en Eₓ y Eᵧ
                  primero y suma componentes.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con el simulador</strong>
                <p>
                  Coloca las cargas en este simulador y arrastra la carga de prueba al punto donde
                  hiciste el cálculo. Compara el módulo de E y V con tu resultado.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Empieza por V cuando puedas</strong>
                <p>
                  Si necesitas energía o trabajo, calcular V primero ahorra mucho álgebra vectorial.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧭</span>
              <div>
                <strong>Descompón en componentes</strong>
                <p>
                  Para sumar varios campos, descompón cada uno en Eₓ y Eᵧ; suma componentes y luego
                  recombina.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <div>
                <strong>Aprovecha la simetría</strong>
                <p>
                  Si la configuración es simétrica respecto a un eje, muchas componentes se anulan.
                  Identifícalo antes de calcular.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <div>
                <strong>Verifica unidades</strong>
                <p>
                  E en N/C (= V/m), V en voltios, F en newtons. Si te sale algo con unidades raras,
                  revisa los factores 10⁻⁹ del nano.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Visualiza líneas y equipotenciales</strong>
                <p>
                  Activar líneas y equipotenciales a la vez te enseña que se cruzan en ángulo recto.
                  Es la mejor intuición geométrica del campo.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Usa una carga de prueba pequeña</strong>
                <p>
                  En problemas reales, q₀ debe ser pequeña para no perturbar el campo que mide.
                  Aquí mantenemos q₀ = 1 nC.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                Confundir E (vector, en N/C) con V (escalar, en voltios). Son magnitudes muy
                distintas, aunque están relacionadas.
              </li>
              <li>
                Olvidar el signo de la carga al calcular V: una carga negativa produce V negativo,
                no positivo.
              </li>
              <li>
                Sumar magnitudes |E₁| + |E₂| en lugar de sumar vectores. El campo total no es la
                suma de módulos.
              </li>
              <li>
                Dibujar líneas de campo que se cortan. Físicamente imposible: el campo en cada punto
                tiene una sola dirección.
              </li>
              <li>
                Aplicar F = qE cuando la carga no es de prueba: una carga grande modifica el campo
                que la rodea y la fórmula deja de ser exacta.
              </li>
              <li>
                Mezclar unidades: 1 nC = 10⁻⁹ C. No usar la conversión correcta da resultados con
                errores de 10⁹.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-campo-electrico')} />
        <ShareCard appName="simulador-campo-electrico" />
      </main>

      <Footer appName="simulador-campo-electrico" />
    </div>
  );
}
