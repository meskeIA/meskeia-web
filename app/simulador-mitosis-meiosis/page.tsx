'use client';
// @disclaimer: exempt

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorMitosisMeiosis.module.css';

// ============================================================
// Tipos
// ============================================================
type TipoDivision = 'mitosis' | 'meiosis';
type Membrana = 'completa' | 'disolviendose' | 'ausente' | 'formandose';

interface FaseConfig {
  id: string;
  nombre: string;
  descripcion: string;
  celulas: number;
  nucleos: number;
  membrana: Membrana;
  husillo: boolean;
  crossingOver: boolean;
  // Posición relativa de los cromosomas (0=interfase difuso, 1=condensado, 2=alineado placa, 3=separando, 4=polos)
  estadoCromosomasId: number;
}

// ============================================================
// Datos de fases
// ============================================================
const FASES_MITOSIS: FaseConfig[] = [
  {
    id: 'interfase',
    nombre: 'Interfase',
    descripcion:
      'El ADN se duplica en el núcleo. Los cromosomas no son visibles como estructuras individuales: aparecen como cromatina difusa. La membrana nuclear está intacta. La célula crece y se prepara para dividirse.',
    celulas: 1,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    estadoCromosomasId: 0,
  },
  {
    id: 'profase',
    nombre: 'Profase',
    descripcion:
      'Los cromosomas se condensan y se hacen visibles al microscopio. La membrana nuclear comienza a desintegrarse. El huso acromático empieza a formarse desde los centrosomas en los polos opuestos.',
    celulas: 1,
    nucleos: 1,
    membrana: 'disolviendose',
    husillo: true,
    crossingOver: false,
    estadoCromosomasId: 1,
  },
  {
    id: 'metafase',
    nombre: 'Metafase',
    descripcion:
      'Los cromosomas alcanzan su máxima condensación y se alinean en la placa ecuatorial (plano central de la célula). El huso acromático está completamente formado y los cinetocoros de cada cromátida están unidos a fibras del huso.',
    celulas: 1,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    estadoCromosomasId: 2,
  },
  {
    id: 'anafase',
    nombre: 'Anafase',
    descripcion:
      'Las cromátidas hermanas se separan: las fibras del huso tiran de cada cromátida hacia un polo opuesto de la célula. Cada polo recibe un conjunto completo de cromosomas (2n).',
    celulas: 1,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    estadoCromosomasId: 3,
  },
  {
    id: 'telofase',
    nombre: 'Telofase',
    descripcion:
      'Los cromosomas llegan a los polos y comienzan a descondensar. Se forman dos nuevas membranas nucleares alrededor de cada conjunto de cromosomas. El huso acromático desaparece.',
    celulas: 1,
    nucleos: 2,
    membrana: 'formandose',
    husillo: false,
    crossingOver: false,
    estadoCromosomasId: 4,
  },
  {
    id: 'citocinesis',
    nombre: 'Citocinesis',
    descripcion:
      'El citoplasma se divide y da lugar a dos células hijas idénticas a la célula madre. Cada célula hija tiene 2n cromosomas (diploide). En la mitosis se produce siempre este resultado: 2 células 2n.',
    celulas: 2,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    estadoCromosomasId: 0,
  },
];

const FASES_MEIOSIS: FaseConfig[] = [
  {
    id: 'interfase',
    nombre: 'Interfase',
    descripcion:
      'La célula duplica su ADN antes de iniciar la meiosis. Los cromosomas no son visibles aún. La célula es diploide (2n=4 en nuestro modelo con 2 pares de homólogos).',
    celulas: 1,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    estadoCromosomasId: 0,
  },
  {
    id: 'profase-i',
    nombre: 'Profase I',
    descripcion:
      'Los cromosomas homólogos se aparean formando bivalentes (tétradas). Ocurre el crossing-over: intercambio de segmentos entre cromátidas no hermanas de los homólogos. Este proceso genera variabilidad genética. La membrana nuclear se disuelve.',
    celulas: 1,
    nucleos: 1,
    membrana: 'disolviendose',
    husillo: true,
    crossingOver: true,
    estadoCromosomasId: 1,
  },
  {
    id: 'metafase-i',
    nombre: 'Metafase I',
    descripcion:
      'Los bivalentes (pares de homólogos unidos) se alinean en la placa ecuatorial. Cada bivalente es orientado por el huso de modo que los homólogos quedan en lados opuestos.',
    celulas: 1,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    estadoCromosomasId: 2,
  },
  {
    id: 'anafase-i',
    nombre: 'Anafase I',
    descripcion:
      'Los cromosomas homólogos se separan y migran a polos opuestos. IMPORTANTE: las cromátidas hermanas permanecen unidas. Solo se separan los homólogos. El número de cromosomas en cada polo queda en n (haploide, pero cada cromosoma tiene dos cromátidas).',
    celulas: 1,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    estadoCromosomasId: 3,
  },
  {
    id: 'telofase-i',
    nombre: 'Telofase I / Citocinesis I',
    descripcion:
      'Se forman dos células haploides (n=2). Cada célula tiene la mitad de cromosomas de la original, pero cada cromosoma aún consta de dos cromátidas unidas. Las células resultantes son genéticamente distintas entre sí.',
    celulas: 2,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    estadoCromosomasId: 4,
  },
  {
    id: 'metafase-ii',
    nombre: 'Metafase II',
    descripcion:
      'En cada una de las dos células haploides, los cromosomas se alinean en la placa ecuatorial. No hay apareamiento de homólogos porque ya se separaron en la meiosis I. El huso se forma de nuevo.',
    celulas: 2,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    estadoCromosomasId: 2,
  },
  {
    id: 'anafase-ii',
    nombre: 'Anafase II',
    descripcion:
      'Las cromátidas hermanas se separan y migran a polos opuestos dentro de cada célula. Este paso es equivalente a la anafase de la mitosis, pero en células ya haploides.',
    celulas: 2,
    nucleos: 0,
    membrana: 'ausente',
    husillo: true,
    crossingOver: false,
    estadoCromosomasId: 3,
  },
  {
    id: 'telofase-ii',
    nombre: 'Telofase II / Citocinesis II',
    descripcion:
      'Se forman cuatro células haploides (n=2) genéticamente distintas. Estas son las células que pueden convertirse en gametos (óvulos o espermatozoides) en organismos de reproducción sexual.',
    celulas: 4,
    nucleos: 1,
    membrana: 'completa',
    husillo: false,
    crossingOver: false,
    estadoCromosomasId: 0,
  },
];

// ============================================================
// Funciones de dibujo
// ============================================================

// Colores de los 2 pares de cromosomas
const COLORES_CROMOSOMAS = ['#E07A1F', '#48A9A6'];
const COLOR_MEMBRANA = '#2E86AB';
const COLOR_NUCLEO_FILL = 'rgba(46,134,171,0.15)';
const COLOR_HUSILLO = '#94a3b8';
const COLOR_CROSSING = '#D63384';

interface PuntoCanvas {
  x: number;
  y: number;
}

function dibujarCromosoma(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radio: number,
  color: string,
  angulo: number,
  separado: boolean
): void {
  // Cromosoma como dos barras en X unidas en el centrómero
  const largo = radio * 0.9;
  const ancho = radio * 0.22;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angulo);
  // Barra 1 (arriba del centrómero)
  const offset = separado ? largo * 0.7 : 0;
  // Cromátida 1
  ctx.beginPath();
  ctx.roundRect(-ancho / 2, -largo - offset, ancho, largo, ancho / 2);
  ctx.fillStyle = color;
  ctx.fill();
  // Cromátida 2 (ligeramente desplazada)
  ctx.beginPath();
  ctx.roundRect(ancho * 0.3, -largo - offset, ancho, largo, ancho / 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.75;
  ctx.fill();
  ctx.globalAlpha = 1;
  // Barra 2 (abajo del centrómero)
  ctx.beginPath();
  ctx.roundRect(-ancho / 2, offset, ancho, largo, ancho / 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(ancho * 0.3, offset, ancho, largo, ancho / 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.75;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function dibujarHusillo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radioCell: number
): void {
  ctx.save();
  ctx.strokeStyle = COLOR_HUSILLO;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  const numFibras = 5;
  const spread = radioCell * 0.55;
  for (let i = 0; i < numFibras; i++) {
    const xOffset = -spread + (i * spread * 2) / (numFibras - 1);
    ctx.beginPath();
    ctx.moveTo(cx + xOffset * 0.3, cy - radioCell * 0.85);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + xOffset * 0.3, cy + radioCell * 0.85);
    ctx.lineTo(cx, cy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function dibujarCrossingOver(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radio: number
): void {
  // Dibujar líneas en X entre los cromosomas homólogos
  ctx.save();
  ctx.strokeStyle = COLOR_CROSSING;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.85;
  const size = radio * 0.25;
  const offset = radio * 0.35;
  // X entre el par izquierdo
  ctx.beginPath();
  ctx.moveTo(cx - offset - size, cy - size);
  ctx.lineTo(cx - offset + size, cy + size);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - offset - size, cy + size);
  ctx.lineTo(cx - offset + size, cy - size);
  ctx.stroke();
  // X entre el par derecho
  ctx.beginPath();
  ctx.moveTo(cx + offset - size, cy - size);
  ctx.lineTo(cx + offset + size, cy + size);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + offset - size, cy + size);
  ctx.lineTo(cx + offset + size, cy - size);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function dibujarCelula(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radioCell: number,
  fase: FaseConfig,
  isDark: boolean,
  isMeiosis: boolean,
  celIndice: number // 0-3 para meiosis II
): void {
  // Fondo de la célula
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radioCell, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? 'rgba(30,40,55,0.85)' : 'rgba(250,252,255,0.92)';
  ctx.fill();
  ctx.strokeStyle = COLOR_MEMBRANA;
  ctx.lineWidth = fase.membrana === 'completa' ? 3 : fase.membrana === 'disolviendose' ? 1.5 : 0;
  if (fase.membrana === 'disolviendose') {
    ctx.setLineDash([8, 5]);
  } else {
    ctx.setLineDash([]);
  }
  if (fase.membrana !== 'ausente') {
    ctx.stroke();
  }
  ctx.restore();

  // Núcleo
  if (fase.nucleos > 0 && (fase.celulas === 1 || celIndice < fase.celulas)) {
    const radioNucleo = radioCell * 0.55;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radioNucleo, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_NUCLEO_FILL;
    ctx.fill();
    ctx.strokeStyle = COLOR_MEMBRANA;
    ctx.lineWidth = fase.membrana === 'formandose' ? 1.5 : 2;
    if (fase.membrana === 'formandose') ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Huso
  if (fase.husillo) {
    dibujarHusillo(ctx, cx, cy, radioCell);
  }

  // Crossing-over (solo Profase I de meiosis)
  if (fase.crossingOver && isMeiosis) {
    dibujarCrossingOver(ctx, cx, cy, radioCell);
  }

  // Cromosomas según el estado
  const estado = fase.estadoCromosomasId;

  // estadoCromosomasId:
  // 0 = difuso (interfase / citocinesis)
  // 1 = condensado visible
  // 2 = alineado en placa ecuatorial
  // 3 = separando hacia polos
  // 4 = en polos (telofase)

  if (estado === 0) {
    // Cromatina difusa
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let p = 0; p < 8; p++) {
      const ang = (p / 8) * Math.PI * 2;
      const r = radioCell * 0.3 * Math.random() + radioCell * 0.05;
      const px = cx + Math.cos(ang) * r;
      const py = cy + Math.sin(ang) * r;
      ctx.beginPath();
      ctx.arc(px, py, radioCell * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = COLORES_CROMOSOMAS[p % 2];
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    return;
  }

  // Cromosomas condensados
  // En meiosis la célula tiene 2 pares de homólogos = 4 cromosomas visibles
  // En mitosis también 2n=4 = 4 cromosomas
  const numPares = isMeiosis && fase.id.includes('ii') ? 1 : 2; // meiosis II: 1 par en n=2

  if (estado === 1) {
    // Condensados distribuidos por el núcleo
    const radioNucleo = radioCell * 0.42;
    const posiciones: PuntoCanvas[] = [];
    if (numPares === 2) {
      posiciones.push(
        { x: cx - radioNucleo * 0.5, y: cy - radioNucleo * 0.3 },
        { x: cx + radioNucleo * 0.5, y: cy - radioNucleo * 0.3 },
        { x: cx - radioNucleo * 0.5, y: cy + radioNucleo * 0.3 },
        { x: cx + radioNucleo * 0.5, y: cy + radioNucleo * 0.3 }
      );
    } else {
      posiciones.push(
        { x: cx - radioNucleo * 0.4, y: cy },
        { x: cx + radioNucleo * 0.4, y: cy }
      );
    }
    posiciones.forEach((pos, i) => {
      const color = COLORES_CROMOSOMAS[Math.floor(i / 2) % 2];
      dibujarCromosoma(ctx, pos.x, pos.y, radioCell * 0.18, color, i % 2 === 0 ? 0.3 : -0.3, false);
    });
    // En meiosis Profase I: dibujar bivalentes (pares apareados)
    if (isMeiosis && fase.crossingOver) {
      ctx.save();
      ctx.strokeStyle = COLOR_CROSSING;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.6;
      // Línea que une los pares
      if (posiciones.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(posiciones[0].x, posiciones[0].y);
        ctx.lineTo(posiciones[2].x, posiciones[2].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(posiciones[1].x, posiciones[1].y);
        ctx.lineTo(posiciones[3].x, posiciones[3].y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  } else if (estado === 2) {
    // Alineados en la placa ecuatorial
    const espaciado = radioCell * 0.32;
    const nCrom = numPares === 2 ? 4 : 2;
    const totalAncho = (nCrom - 1) * espaciado;
    for (let i = 0; i < nCrom; i++) {
      const px = cx - totalAncho / 2 + i * espaciado;
      const color = COLORES_CROMOSOMAS[Math.floor(i / 2) % 2];
      dibujarCromosoma(ctx, px, cy, radioCell * 0.18, color, 0, false);
    }
    // Línea ecuatorial
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(200,200,220,0.25)' : 'rgba(80,80,100,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(cx - radioCell * 0.9, cy);
    ctx.lineTo(cx + radioCell * 0.9, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  } else if (estado === 3) {
    // Separando hacia los polos
    const nCrom = numPares === 2 ? 4 : 2;
    const poloDist = radioCell * 0.48;
    const espaciado = radioCell * 0.28;
    const totalAncho = ((nCrom / 2) - 1) * espaciado;
    for (let i = 0; i < nCrom / 2; i++) {
      const px = cx - totalAncho / 2 + i * espaciado;
      const color = COLORES_CROMOSOMAS[i % 2];
      // Polo superior
      dibujarCromosoma(ctx, px, cy - poloDist, radioCell * 0.14, color, 0, true);
      // Polo inferior
      dibujarCromosoma(ctx, px, cy + poloDist, radioCell * 0.14, color, Math.PI, true);
    }
    // Fibras del huso tirando
    ctx.save();
    ctx.strokeStyle = COLOR_HUSILLO;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < nCrom / 2; i++) {
      const px = cx - totalAncho / 2 + i * espaciado;
      ctx.beginPath();
      ctx.moveTo(px, cy - poloDist);
      ctx.lineTo(cx, cy - radioCell * 0.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px, cy + poloDist);
      ctx.lineTo(cx, cy + radioCell * 0.85);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  } else if (estado === 4) {
    // En polos (telofase)
    const nCrom = numPares === 2 ? 2 : 1;
    const poloDist = radioCell * 0.45;
    const espaciado = radioCell * 0.28;
    const totalAncho = (nCrom - 1) * espaciado;
    for (let i = 0; i < nCrom; i++) {
      const px = cx - totalAncho / 2 + i * espaciado;
      const color = COLORES_CROMOSOMAS[i % 2];
      dibujarCromosoma(ctx, px, cy - poloDist, radioCell * 0.14, color, 0, false);
      dibujarCromosoma(ctx, px, cy + poloDist, radioCell * 0.14, color, 0, false);
    }
    // Membranas nucleares formándose
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = COLOR_MEMBRANA;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy - poloDist, radioCell * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + poloDist, radioCell * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

// ============================================================
// Componente principal
// ============================================================
export default function SimuladorMitosisMeiosis() {
  const [tipoDivision, setTipoDivision] = useState<TipoDivision>('mitosis');
  const [faseActual, setFaseActual] = useState<number>(0);
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(1500);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fases = tipoDivision === 'mitosis' ? FASES_MITOSIS : FASES_MEIOSIS;
  const fase = fases[faseActual];

  // Resultado textual
  const resultadoTexto =
    tipoDivision === 'mitosis'
      ? faseActual === FASES_MITOSIS.length - 1
        ? 'Resultado: 2 células (2n=4)'
        : 'División: mitosis → 2 células hijas'
      : faseActual >= FASES_MEIOSIS.length - 1
      ? 'Resultado: 4 células (n=2)'
      : faseActual >= 4
      ? 'Intermedio: 2 células (n=2)'
      : 'División: meiosis → 4 gametos';

  // Dibujo del canvas
  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.offsetWidth;
    const cssH = canvas.offsetHeight;
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.scale(dpr, dpr);
    }

    const W = cssW;
    const H = cssH;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const faseData = fases[faseActual];

    // Fondo
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#1a1a1a' : '#f0f4f8';
    ctx.fillRect(0, 0, W, H);

    // Determinar cuántas células dibujar y sus posiciones
    const numCelulas = faseData.celulas;
    const isMeiosis = tipoDivision === 'meiosis';

    if (numCelulas === 1) {
      const radioCell = Math.min(W, H) * 0.38;
      dibujarCelula(ctx, W / 2, H / 2, radioCell, faseData, isDark, isMeiosis, 0);
    } else if (numCelulas === 2) {
      const radioCell = Math.min(W / 2, H) * 0.38;
      const gap = radioCell * 0.25;
      dibujarCelula(ctx, W / 2 - radioCell - gap, H / 2, radioCell, faseData, isDark, isMeiosis, 0);
      dibujarCelula(ctx, W / 2 + radioCell + gap, H / 2, radioCell, faseData, isDark, isMeiosis, 1);
    } else if (numCelulas === 4) {
      const radioCell = Math.min(W / 2, H / 2) * 0.4;
      const gap = radioCell * 0.18;
      dibujarCelula(ctx, W / 2 - radioCell - gap, H / 2 - radioCell - gap, radioCell, faseData, isDark, isMeiosis, 0);
      dibujarCelula(ctx, W / 2 + radioCell + gap, H / 2 - radioCell - gap, radioCell, faseData, isDark, isMeiosis, 1);
      dibujarCelula(ctx, W / 2 - radioCell - gap, H / 2 + radioCell + gap, radioCell, faseData, isDark, isMeiosis, 2);
      dibujarCelula(ctx, W / 2 + radioCell + gap, H / 2 + radioCell + gap, radioCell, faseData, isDark, isMeiosis, 3);
    }
  }, [tipoDivision, faseActual, fases]);

  // Redibujar cuando cambia la fase o el tipo
  useEffect(() => {
    dibujar();
  }, [dibujar]);

  // Redimensionar canvas al cambiar el tamaño del contenedor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      dibujar();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [dibujar]);

  // Autoplay
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoplay) {
      timerRef.current = setInterval(() => {
        setFaseActual((prev) => {
          if (prev >= fases.length - 1) {
            setAutoplay(false);
            return prev;
          }
          return prev + 1;
        });
      }, velocidad);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoplay, velocidad, fases.length]);

  const handleTipo = (tipo: TipoDivision) => {
    setTipoDivision(tipo);
    setFaseActual(0);
    setAutoplay(false);
  };

  const handleAnterior = () => {
    setFaseActual((prev) => Math.max(0, prev - 1));
    setAutoplay(false);
  };

  const handleSiguiente = () => {
    setFaseActual((prev) => Math.min(fases.length - 1, prev + 1));
    setAutoplay(false);
  };

  const handleAutoplay = () => {
    if (faseActual >= fases.length - 1) {
      setFaseActual(0);
    }
    setAutoplay((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🧬 Simulador de Mitosis y Meiosis</h1>
        <p className={styles.subtitle}>
          Visualiza las fases de la división celular con cromosomas, huso acromático y crossing-over
        </p>
      </header>

      <LegalNotice />

      <main>
        {/* Selector de tipo de división */}
        <div className={styles.tipoSelector} role="group" aria-label="Tipo de división celular">
          <button
            className={`${styles.tipoBtn} ${tipoDivision === 'mitosis' ? styles.tipoBtnActive : ''}`}
            onClick={() => handleTipo('mitosis')}
            type="button"
          >
            Mitosis
          </button>
          <button
            className={`${styles.tipoBtn} ${tipoDivision === 'meiosis' ? styles.tipoBtnActive : ''}`}
            onClick={() => handleTipo('meiosis')}
            type="button"
          >
            Meiosis
          </button>
        </div>

        {/* Canvas */}
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            aria-label={`Visualización de ${tipoDivision}: ${fase.nombre}`}
          />
        </div>

        {/* Barra de fases */}
        <div className={styles.fasesBar} role="tablist" aria-label="Fases de la división">
          {fases.map((f, i) => (
            <button
              key={f.id}
              className={`${styles.fasPunto} ${i === faseActual ? styles.fasPuntoActivo : ''}`}
              onClick={() => {
                setFaseActual(i);
                setAutoplay(false);
              }}
              role="tab"
              aria-selected={i === faseActual}
              aria-label={f.nombre}
              type="button"
            >
              <span className={styles.faseNombre}>{f.nombre}</span>
            </button>
          ))}
        </div>

        {/* Descripción de la fase actual */}
        <div className={styles.faseDescripcion} role="region" aria-live="polite">
          <strong>{fase.nombre}</strong>
          <p>{fase.descripcion}</p>
        </div>

        {/* Controles de navegación */}
        <div className={styles.navControls}>
          <div>
            <button
              className={styles.btnNav}
              onClick={handleAnterior}
              disabled={faseActual === 0}
              type="button"
              aria-label="Fase anterior"
            >
              ← Anterior
            </button>
            <button
              className={`${styles.btnAuto} ${autoplay ? styles.btnAutoActivo : ''}`}
              onClick={handleAutoplay}
              type="button"
              aria-pressed={autoplay}
              aria-label={autoplay ? 'Pausar reproducción automática' : 'Iniciar reproducción automática'}
            >
              {autoplay ? '⏸ Pausa' : '▶ Auto'}
            </button>
            <button
              className={styles.btnNav}
              onClick={handleSiguiente}
              disabled={faseActual === fases.length - 1}
              type="button"
              aria-label="Fase siguiente"
            >
              Siguiente →
            </button>
          </div>

          {/* Velocidad */}
          <div className={styles.velocidadBtns} role="group" aria-label="Velocidad de reproducción">
            <span>Velocidad:</span>
            {[
              { label: 'Lenta', ms: 3000 },
              { label: 'Media', ms: 1500 },
              { label: 'Rápida', ms: 800 },
            ].map((v) => (
              <button
                key={v.ms}
                className={`${styles.velocidadBtn} ${velocidad === v.ms ? styles.velocidadBtnActiva : ''}`}
                onClick={() => setVelocidad(v.ms)}
                type="button"
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badge de resultado */}
        <div className={styles.resultadoCell} aria-live="polite">
          <span aria-hidden="true">🔬</span> {resultadoTexto}
        </div>
      </main>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Aprende sobre la División Celular"
        subtitle="Mitosis, meiosis, fases, crossing-over y errores frecuentes"
      >
        {/* Intro */}
        <p>
          La <strong>división celular</strong> es el proceso por el que una célula madre origina
          células hijas. Existen dos tipos fundamentales: la <strong>mitosis</strong>, que produce
          dos células genéticamente idénticas a la madre, y la <strong>meiosis</strong>, que produce
          cuatro células haploides genéticamente únicas destinadas a la reproducción sexual. Conocer
          sus diferencias es clave en biología de Bachillerato y en cualquier carrera de ciencias de
          la salud o biológicas.
        </p>

        {/* Tabla comparativa */}
        <h3 className={styles.eduSubtitle}>Mitosis vs Meiosis</h3>
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>Mitosis</th>
                <th>Meiosis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Finalidad</td>
                <td>Crecimiento y reparación de tejidos</td>
                <td>Producción de gametos (reproducción sexual)</td>
              </tr>
              <tr>
                <td>Células resultado</td>
                <td>2 células hijas idénticas</td>
                <td>4 células hijas genéticamente distintas</td>
              </tr>
              <tr>
                <td>Número de cromosomas</td>
                <td>2n (diploide), igual que la madre</td>
                <td>n (haploide), la mitad que la madre</td>
              </tr>
              <tr>
                <td>Número de divisiones</td>
                <td>1 (6 fases)</td>
                <td>2 (meiosis I + meiosis II, 8 fases)</td>
              </tr>
              <tr>
                <td>Crossing-over</td>
                <td>No ocurre</td>
                <td>Sí, en la Profase I (fuente de variabilidad)</td>
              </tr>
              <tr>
                <td>Dónde ocurre</td>
                <td>Células somáticas (casi todo el cuerpo)</td>
                <td>Órganos reproductores (gónadas)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios */}
        <h3 className={styles.eduSubtitle}>Casos de uso reales</h3>
        <div className={styles.scenariosGrid}>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">🩹</span>
            <div>
              <strong>Regeneración de tejidos (mitosis)</strong>
              <p>
                Cuando te haces una herida, las células de la piel se dividen por mitosis para
                reemplazar las células dañadas. Sin mitosis, ningún organismo pluricelular podría
                crecer o repararse.
              </p>
            </div>
          </div>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">🥚</span>
            <div>
              <strong>Formación de gametos (meiosis)</strong>
              <p>
                Los óvulos y espermatozoides se forman por meiosis. Al ser haploides (n), cuando
                dos gametos se fusionan en la fecundación, el zigoto recupera el número diploide
                (2n) correcto para la especie.
              </p>
            </div>
          </div>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">🦠</span>
            <div>
              <strong>Cáncer: mitosis descontrolada</strong>
              <p>
                El cáncer ocurre cuando los mecanismos de control de la mitosis fallan y las
                células se dividen sin parar. Comprender las fases de la mitosis ayuda a entender
                cómo actúan muchos fármacos antitumorales.
              </p>
            </div>
          </div>
          <div className={styles.scenarioCard}>
            <span className={styles.scenarioIcon} aria-hidden="true">🌱</span>
            <div>
              <strong>Clonación y reproducción asexual</strong>
              <p>
                Organismos como las bacterias y muchas plantas se reproducen únicamente por
                mitosis, generando copias genéticamente idénticas. La reproducción asexual es
                eficiente pero carece de la variabilidad que aporta el crossing-over de la meiosis.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Por qué la meiosis produce 4 células y no 2?</strong>
            <p>
              Porque ocurren dos divisiones consecutivas. En la meiosis I se separan los
              cromosomas homólogos (n pares de hermanas), dando 2 células haploides. En la meiosis
              II cada una de esas células divide sus cromátidas, resultando 4 células haploides.
            </p>
            <p className={styles.faqTip}>
              Truco: piensa en la meiosis como "mitosis con dos rondas". La I separa homólogos;
              la II separa cromátidas.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es el crossing-over y para qué sirve?</strong>
            <p>
              Es el intercambio de segmentos de ADN entre cromátidas no hermanas de cromosomas
              homólogos durante la Profase I. Genera nuevas combinaciones de alelos que no
              existían en los progenitores, aumentando la variabilidad genética de la especie.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué pasa si hay errores en la meiosis?</strong>
            <p>
              La no disyunción ocurre cuando los cromosomas no se separan correctamente. Puede
              resultar en gametos con uno de más o de menos. Tras la fecundación, el zigoto puede
              tener trisomías (ej: trisomía 21 → síndrome de Down) o monosomías, muchas de las
              cuales son incompatibles con la vida.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Puede una célula sin núcleo hacer mitosis?</strong>
            <p>
              No. La mitosis requiere ADN en el núcleo para ser duplicado y distribuido. Los
              glóbulos rojos maduros de los mamíferos, que carecen de núcleo, no se dividen. Las
              plaquetas tampoco son células completas y no se dividen.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre cromátidas y cromosomas?</strong>
            <p>
              Un <strong>cromosoma</strong> es una molécula de ADN compactada. Tras la replicación,
              cada cromosoma consta de dos copias idénticas unidas en el centrómero: esas copias
              se llaman <strong>cromátidas hermanas</strong>. En la anafase se separan y cada
              cromátida pasa a llamarse cromosoma de nuevo.
            </p>
          </div>
        </div>

        {/* Cómo identificar una fase al microscopio */}
        <h3 className={styles.eduSubtitle}>Cómo identificar una fase en el microscopio</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Observa si los cromosomas son visibles</strong>
              <p>
                Si ves cromatina difusa y un núcleo bien delimitado → interfase. Si los cromosomas
                están condensados y definidos → estás en profase o posterior.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Busca la placa ecuatorial</strong>
              <p>
                Si los cromosomas están alineados en el ecuador de la célula → metafase. Aquí son
                más fáciles de contar para determinar el cariotipo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Fíjate en el movimiento hacia los polos</strong>
              <p>
                Si ves dos grupos de cromosomas alejándose → anafase. La forma de "V" de cada
                cromosoma al ser arrastrado por el huso es característica.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Comprueba si aparecen dos núcleos</strong>
              <p>
                En telofase verás dos grupos de cromosomas en los polos rodeados por nuevas
                membranas nucleares en formación. Los cromosomas empiezan a descondensar.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Distingue mitosis de meiosis por el número de cromosomas</strong>
              <p>
                En metafase I de meiosis ves bivalentes (pares de cromosomas homólogos), mientras
                que en metafase de mitosis cada cromosoma está aislado en la placa. Contar el
                número y agrupación de cromosomas es la clave.
              </p>
            </div>
          </div>
        </div>

        {/* Tips mnémicos */}
        <h3 className={styles.eduSubtitle}>Trucos para recordar las fases</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧠</span>
            <div>
              <strong>IPMAT para mitosis</strong>
              <p>
                Interfase, Profase, Metafase, Anafase, Telofase → la inicial de cada fase en orden.
                Añade "C" al final para Citocinesis: IPMATC.
              </p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <div>
              <strong>"Meiosis = dos mitosis incompletas"</strong>
              <p>
                La meiosis I separa homólogos (no cromátidas). La meiosis II sí separa cromátidas,
                como una mitosis normal. Recordar esto evita confusiones en los exámenes.
              </p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✂️</span>
            <div>
              <strong>Crossing = "cruzar" y Over = "encima"</strong>
              <p>
                El crossing-over ocurre cuando dos cromátidas no hermanas se "cruzan" e intercambian
                segmentos. Imagina dos cuerdas que se enredan y cortan intercambiando sus extremos.
              </p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <div>
              <strong>2n → 2n en mitosis; 2n → n en meiosis</strong>
              <p>
                Repite esta regla hasta automatizarla: mitosis conserva la ploidía, meiosis la
                reduce a la mitad. Con 46 cromosomas humanos: mitosis da 2×46, meiosis da 4×23.
              </p>
            </div>
          </div>
        </div>

        {/* Warning box — errores frecuentes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes en exámenes
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir meiosis I con meiosis II</strong>: en la I se separan homólogos;
              en la II se separan cromátidas. Son anafases distintas con resultados distintos.
            </li>
            <li>
              <strong>Creer que la meiosis produce 2 células</strong>: produce 4. Es un error
              muy común al confundir la citocinesis I (2 células) con el resultado final.
            </li>
            <li>
              <strong>No saber qué se separa en cada anafase</strong>: anafase de mitosis y anafase
              II = cromátidas hermanas; anafase I = cromosomas homólogos completos.
            </li>
            <li>
              <strong>Confundir haploide con diploide</strong>: haploide (n) = un juego de
              cromosomas; diploide (2n) = dos juegos. Los gametos son n; el resto de células
              somáticas son 2n.
            </li>
            <li>
              <strong>Olvidar que el crossing-over ocurre en la Profase I</strong>: no ocurre en
              la mitosis ni en ninguna otra fase de la meiosis. Es exclusivo de la Profase I.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-mitosis-meiosis')} />
      <ShareCard appName="simulador-mitosis-meiosis" />
      <Footer appName="simulador-mitosis-meiosis" />
    </div>
  );
}
