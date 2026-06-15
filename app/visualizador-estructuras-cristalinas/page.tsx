'use client';
// @disclaimer: exempt
import { useState, useRef, useCallback } from 'react';
import styles from './EstructurasCristalinas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Seccion = 'sistemas' | 'metalicas' | 'cristales' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

interface Atomo3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  label?: string;
}

interface Arista3D {
  x1: number; y1: number; z1: number;
  x2: number; y2: number; z2: number;
}

interface Cara3D {
  // 4 vértices en orden (esquina superior-izq, sup-der, inf-der, inf-izq del plano)
  cx: number; cy: number; cz: number; // centro de la cara
  rotX: number; rotY: number; rotZ: number; // rotación para orientar la cara
  w: number; h: number; // ancho y alto de la cara
  color: string;
}

interface Rotation {
  x: number;
  y: number;
}

interface SistemaCristalino {
  nombre: string;
  params: string;
  angulos: string;
  ejemplo: string;
  icono: string;
  color: string;
  atomos: Atomo3D[];
  aristas: Arista3D[];
  caras?: Cara3D[];
}

interface EstructuraMetalica {
  nombre: string;
  siglas: string;
  atomosPorCelda: number;
  coordinacion: number;
  empaquetamiento: number;
  ejemplos: string;
  descripcion: string;
  color: string;
  atomos: Atomo3D[];
  aristas: Arista3D[];
  caras?: Cara3D[];
}

interface CristalFamoso {
  nombre: string;
  formula: string;
  icono: string;
  descripcion: string;
  dato: string;
  atomos: Atomo3D[];
  aristas: Arista3D[];
  caras?: Cara3D[];
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const SECCIONES: SeccionInfo[] = [
  { id: 'sistemas', titulo: 'Los 7 Sistemas', icono: '🔷', subtitulo: 'Cúbico, tetragonal, hexagonal...' },
  { id: 'metalicas', titulo: 'Metálicas', icono: '⚙️', subtitulo: 'BCC, FCC, HCP' },
  { id: 'cristales', titulo: 'Cristales Famosos', icono: '💎', subtitulo: 'Sal, diamante, grafito' },
  { id: 'datos', titulo: 'Datos y Propiedades', icono: '📊', subtitulo: 'Por qué importa la estructura' },
];

// ─── Helpers para generar geometría ───

const S = 90; // escala: 1 unidad = 90px

function cuboAristas(sx: number, sy: number, sz: number): Arista3D[] {
  const hx = sx / 2, hy = sy / 2, hz = sz / 2;
  const c = [
    [-hx, -hy, -hz], [hx, -hy, -hz], [hx, hy, -hz], [-hx, hy, -hz],
    [-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz],
  ];
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  return edges.map(([a, b]) => ({
    x1: c[a][0], y1: c[a][1], z1: c[a][2],
    x2: c[b][0], y2: c[b][1], z2: c[b][2],
  }));
}

function cuboAtomos(sx: number, sy: number, sz: number, color: string, size: number): Atomo3D[] {
  const hx = sx / 2, hy = sy / 2, hz = sz / 2;
  return [
    [-hx, -hy, -hz], [hx, -hy, -hz], [hx, hy, -hz], [-hx, hy, -hz],
    [-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz],
  ].map(([x, y, z]) => ({ x, y, z, color, size }));
}

function cuboCaras(sx: number, sy: number, sz: number, color: string): Cara3D[] {
  const hx = sx / 2, hy = sy / 2, hz = sz / 2;
  return [
    // Frente (z = hz)
    { cx: 0, cy: 0, cz: hz, rotX: 0, rotY: 0, rotZ: 0, w: sx, h: sy, color },
    // Atrás (z = -hz)
    { cx: 0, cy: 0, cz: -hz, rotX: 0, rotY: 180, rotZ: 0, w: sx, h: sy, color },
    // Arriba (y = -hy)
    { cx: 0, cy: -hy, cz: 0, rotX: 90, rotY: 0, rotZ: 0, w: sx, h: sz, color },
    // Abajo (y = hy)
    { cx: 0, cy: hy, cz: 0, rotX: -90, rotY: 0, rotZ: 0, w: sx, h: sz, color },
    // Izquierda (x = -hx)
    { cx: -hx, cy: 0, cz: 0, rotX: 0, rotY: -90, rotZ: 0, w: sz, h: sy, color },
    // Derecha (x = hx)
    { cx: hx, cy: 0, cz: 0, rotX: 0, rotY: 90, rotZ: 0, w: sz, h: sy, color },
  ];
}

function hexCaras(radio: number, altura: number, color: string): Cara3D[] {
  const caras: Cara3D[] = [];
  const h = altura / 2;
  // 6 caras laterales del prisma hexagonal
  for (let i = 0; i < 6; i++) {
    const ang = (i * 60 + 30) * Math.PI / 180;
    const nextAng = ((i + 1) * 60 + 30) * Math.PI / 180;
    const midX = (Math.cos(ang) + Math.cos(nextAng)) * radio / 2;
    const midZ = (Math.sin(ang) + Math.sin(nextAng)) * radio / 2;
    const faceWidth = radio; // aproximación del ancho de la cara
    const rotY = -(i * 60 + 30);
    caras.push({ cx: midX, cy: 0, cz: midZ, rotX: 0, rotY, rotZ: 0, w: faceWidth, h: altura, color });
  }
  return caras;
}

// ─── 7 Sistemas cristalinos ───

const SISTEMAS: SistemaCristalino[] = [
  {
    nombre: 'Cúbico', params: 'a = b = c', angulos: 'α = β = γ = 90°',
    ejemplo: 'Sal (NaCl), Diamante', icono: '🧊', color: '#2E86AB',
    atomos: cuboAtomos(S, S, S, '#2E86AB', 18),
    aristas: cuboAristas(S, S, S),
    caras: cuboCaras(S, S, S, '#2E86AB'),
  },
  {
    nombre: 'Tetragonal', params: 'a = b ≠ c', angulos: 'α = β = γ = 90°',
    ejemplo: 'Circón, Rutilo (TiO₂)', icono: '📦', color: '#48A9A6',
    atomos: cuboAtomos(S, S, S * 1.4, '#48A9A6', 18),
    aristas: cuboAristas(S, S, S * 1.4),
    caras: cuboCaras(S, S, S * 1.4, '#48A9A6'),
  },
  {
    nombre: 'Ortorrómbico', params: 'a ≠ b ≠ c', angulos: 'α = β = γ = 90°',
    ejemplo: 'Topacio, Olivino', icono: '🧱', color: '#E8A87C',
    atomos: cuboAtomos(S, S * 0.7, S * 1.3, '#E8A87C', 18),
    aristas: cuboAristas(S, S * 0.7, S * 1.3),
    caras: cuboCaras(S, S * 0.7, S * 1.3, '#E8A87C'),
  },
  {
    nombre: 'Hexagonal', params: 'a = b ≠ c', angulos: 'α = β = 90°, γ = 120°',
    ejemplo: 'Cuarzo, Grafito, Hielo', icono: '⬡', color: '#9B59B6',
    caras: hexCaras(S * 0.5, S * 0.8 * 2, '#9B59B6'),
    atomos: (() => {
      const atoms: Atomo3D[] = [];
      const h = S * 0.8;
      // Hexágono base (6 vértices + centro)
      for (let i = 0; i < 6; i++) {
        const ang = (i * 60 - 30) * Math.PI / 180;
        atoms.push({ x: Math.cos(ang) * S * 0.5, y: -h / 2, z: Math.sin(ang) * S * 0.5, color: '#9B59B6', size: 16 });
      }
      atoms.push({ x: 0, y: -h / 2, z: 0, color: '#9B59B6', size: 16 });
      // Tapa superior
      for (let i = 0; i < 6; i++) {
        const ang = (i * 60 - 30) * Math.PI / 180;
        atoms.push({ x: Math.cos(ang) * S * 0.5, y: h / 2, z: Math.sin(ang) * S * 0.5, color: '#9B59B6', size: 16 });
      }
      atoms.push({ x: 0, y: h / 2, z: 0, color: '#9B59B6', size: 16 });
      return atoms;
    })(),
    aristas: (() => {
      const edges: Arista3D[] = [];
      const h = S * 0.8;
      const base: [number, number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const ang = (i * 60 - 30) * Math.PI / 180;
        base.push([Math.cos(ang) * S * 0.5, 0, Math.sin(ang) * S * 0.5]);
      }
      // Base inferior y superior
      for (let i = 0; i < 6; i++) {
        const n = (i + 1) % 6;
        edges.push({ x1: base[i][0], y1: -h / 2, z1: base[i][2], x2: base[n][0], y2: -h / 2, z2: base[n][2] });
        edges.push({ x1: base[i][0], y1: h / 2, z1: base[i][2], x2: base[n][0], y2: h / 2, z2: base[n][2] });
        edges.push({ x1: base[i][0], y1: -h / 2, z1: base[i][2], x2: base[i][0], y2: h / 2, z2: base[i][2] });
      }
      return edges;
    })(),
  },
  {
    nombre: 'Trigonal', params: 'a = b = c', angulos: 'α = β = γ ≠ 90°',
    ejemplo: 'Calcita, Cuarzo', icono: '🔺', color: '#27AE60',
    atomos: (() => {
      // Romboedro: cubo deformado
      const a = S * 0.5;
      const skew = S * 0.2;
      return [
        { x: -a + skew, y: -a, z: -a, color: '#27AE60', size: 18 },
        { x: a + skew, y: -a, z: -a, color: '#27AE60', size: 18 },
        { x: a - skew, y: a, z: -a, color: '#27AE60', size: 18 },
        { x: -a - skew, y: a, z: -a, color: '#27AE60', size: 18 },
        { x: -a + skew + skew, y: -a, z: a, color: '#27AE60', size: 18 },
        { x: a + skew + skew, y: -a, z: a, color: '#27AE60', size: 18 },
        { x: a - skew + skew, y: a, z: a, color: '#27AE60', size: 18 },
        { x: -a - skew + skew, y: a, z: a, color: '#27AE60', size: 18 },
      ];
    })(),
    aristas: (() => {
      const a = S * 0.5;
      const skew = S * 0.2;
      const c = [
        [-a + skew, -a, -a], [a + skew, -a, -a], [a - skew, a, -a], [-a - skew, a, -a],
        [-a + skew + skew, -a, a], [a + skew + skew, -a, a], [a - skew + skew, a, a], [-a - skew + skew, a, a],
      ];
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      return edges.map(([i, j]) => ({
        x1: c[i][0], y1: c[i][1], z1: c[i][2],
        x2: c[j][0], y2: c[j][1], z2: c[j][2],
      }));
    })(),
  },
  {
    nombre: 'Monoclínico', params: 'a ≠ b ≠ c', angulos: 'α = γ = 90°, β ≠ 90°',
    ejemplo: 'Yeso, Ortoclasa', icono: '📐', color: '#F39C12',
    atomos: (() => {
      const a = S * 0.5, b = S * 0.4, c2 = S * 0.6;
      const skew = S * 0.25; // β inclinación
      return [
        { x: -a, y: -b, z: -c2, color: '#F39C12', size: 18 },
        { x: a, y: -b, z: -c2, color: '#F39C12', size: 18 },
        { x: a, y: b, z: -c2, color: '#F39C12', size: 18 },
        { x: -a, y: b, z: -c2, color: '#F39C12', size: 18 },
        { x: -a + skew, y: -b, z: c2, color: '#F39C12', size: 18 },
        { x: a + skew, y: -b, z: c2, color: '#F39C12', size: 18 },
        { x: a + skew, y: b, z: c2, color: '#F39C12', size: 18 },
        { x: -a + skew, y: b, z: c2, color: '#F39C12', size: 18 },
      ];
    })(),
    aristas: (() => {
      const a = S * 0.5, b = S * 0.4, c2 = S * 0.6, skew = S * 0.25;
      const corners = [
        [-a, -b, -c2], [a, -b, -c2], [a, b, -c2], [-a, b, -c2],
        [-a + skew, -b, c2], [a + skew, -b, c2], [a + skew, b, c2], [-a + skew, b, c2],
      ];
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      return edges.map(([i, j]) => ({
        x1: corners[i][0], y1: corners[i][1], z1: corners[i][2],
        x2: corners[j][0], y2: corners[j][1], z2: corners[j][2],
      }));
    })(),
  },
  {
    nombre: 'Triclínico', params: 'a ≠ b ≠ c', angulos: 'α ≠ β ≠ γ ≠ 90°',
    ejemplo: 'Albita, Turquesa', icono: '🔶', color: '#E74C3C',
    atomos: (() => {
      const a = S * 0.5, b = S * 0.4, c2 = S * 0.55;
      const sx = S * 0.15, sz = S * 0.2;
      return [
        { x: -a, y: -b, z: -c2, color: '#E74C3C', size: 18 },
        { x: a, y: -b, z: -c2, color: '#E74C3C', size: 18 },
        { x: a + sx, y: b, z: -c2 + sz, color: '#E74C3C', size: 18 },
        { x: -a + sx, y: b, z: -c2 + sz, color: '#E74C3C', size: 18 },
        { x: -a + sx, y: -b, z: c2, color: '#E74C3C', size: 18 },
        { x: a + sx, y: -b, z: c2, color: '#E74C3C', size: 18 },
        { x: a + sx * 2, y: b, z: c2 + sz, color: '#E74C3C', size: 18 },
        { x: -a + sx * 2, y: b, z: c2 + sz, color: '#E74C3C', size: 18 },
      ];
    })(),
    aristas: (() => {
      const a = S * 0.5, b = S * 0.4, c2 = S * 0.55, sx = S * 0.15, sz = S * 0.2;
      const corners = [
        [-a, -b, -c2], [a, -b, -c2], [a + sx, b, -c2 + sz], [-a + sx, b, -c2 + sz],
        [-a + sx, -b, c2], [a + sx, -b, c2], [a + sx * 2, b, c2 + sz], [-a + sx * 2, b, c2 + sz],
      ];
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      return edges.map(([i, j]) => ({
        x1: corners[i][0], y1: corners[i][1], z1: corners[i][2],
        x2: corners[j][0], y2: corners[j][1], z2: corners[j][2],
      }));
    })(),
  },
];

// ─── Estructuras metálicas ───

function bccAtomos(): Atomo3D[] {
  const h = S * 0.5;
  // 8 esquinas
  const esquinas: Atomo3D[] = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h],
  ].map(([x, y, z]) => ({ x, y, z, color: '#7FB3D3', size: 20 }));
  // 1 centro
  return [...esquinas, { x: 0, y: 0, z: 0, color: '#2E86AB', size: 24 }];
}

function fccAtomos(): Atomo3D[] {
  const h = S * 0.5;
  // 8 esquinas
  const esquinas: Atomo3D[] = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h],
  ].map(([x, y, z]) => ({ x, y, z, color: '#7FB3D3', size: 18 }));
  // 6 centros de cara
  const caras: Atomo3D[] = [
    [0, 0, -h], [0, 0, h],   // frontal/trasera
    [0, -h, 0], [0, h, 0],   // arriba/abajo
    [-h, 0, 0], [h, 0, 0],   // izquierda/derecha
  ].map(([x, y, z]) => ({ x, y, z, color: '#F39C12', size: 22 }));
  return [...esquinas, ...caras];
}

function hcpAtomos(): Atomo3D[] {
  const atoms: Atomo3D[] = [];
  const r = S * 0.45;
  const hLayer = S * 0.5;
  // Capa inferior: hexágono + centro
  for (let i = 0; i < 6; i++) {
    const ang = (i * 60) * Math.PI / 180;
    atoms.push({ x: Math.cos(ang) * r, y: -hLayer, z: Math.sin(ang) * r, color: '#7FB3D3', size: 18 });
  }
  atoms.push({ x: 0, y: -hLayer, z: 0, color: '#7FB3D3', size: 18 });
  // Capa intermedia: 3 átomos en huecos
  for (let i = 0; i < 3; i++) {
    const ang = (i * 120 + 30) * Math.PI / 180;
    atoms.push({ x: Math.cos(ang) * r * 0.58, y: 0, z: Math.sin(ang) * r * 0.58, color: '#48A9A6', size: 22 });
  }
  // Capa superior: hexágono + centro
  for (let i = 0; i < 6; i++) {
    const ang = (i * 60) * Math.PI / 180;
    atoms.push({ x: Math.cos(ang) * r, y: hLayer, z: Math.sin(ang) * r, color: '#7FB3D3', size: 18 });
  }
  atoms.push({ x: 0, y: hLayer, z: 0, color: '#7FB3D3', size: 18 });
  return atoms;
}

function hcpAristas(): Arista3D[] {
  const edges: Arista3D[] = [];
  const r = S * 0.45;
  const hLayer = S * 0.5;
  // Hexágonos inferior y superior + verticales
  for (let layer = -1; layer <= 1; layer += 2) {
    const y = layer * hLayer;
    for (let i = 0; i < 6; i++) {
      const a1 = (i * 60) * Math.PI / 180;
      const a2 = ((i + 1) * 60) * Math.PI / 180;
      edges.push({
        x1: Math.cos(a1) * r, y1: y, z1: Math.sin(a1) * r,
        x2: Math.cos(a2) * r, y2: y, z2: Math.sin(a2) * r,
      });
    }
  }
  // Verticales
  for (let i = 0; i < 6; i++) {
    const ang = (i * 60) * Math.PI / 180;
    edges.push({
      x1: Math.cos(ang) * r, y1: -hLayer, z1: Math.sin(ang) * r,
      x2: Math.cos(ang) * r, y2: hLayer, z2: Math.sin(ang) * r,
    });
  }
  return edges;
}

const ESTRUCTURAS_METALICAS: EstructuraMetalica[] = [
  {
    nombre: 'Cúbica Centrada en el Cuerpo',
    siglas: 'BCC',
    atomosPorCelda: 2,
    coordinacion: 8,
    empaquetamiento: 68,
    ejemplos: 'Hierro (α-Fe), Cromo, Tungsteno, Molibdeno',
    descripcion: '8 átomos en las esquinas (cada uno compartido entre 8 celdas = 1 átomo) + 1 átomo en el centro del cubo. Total: 2 átomos por celda unitaria.',
    color: '#2E86AB',
    atomos: bccAtomos(),
    aristas: cuboAristas(S, S, S),
    caras: cuboCaras(S, S, S, '#2E86AB'),
  },
  {
    nombre: 'Cúbica Centrada en las Caras',
    siglas: 'FCC',
    atomosPorCelda: 4,
    coordinacion: 12,
    empaquetamiento: 74,
    ejemplos: 'Oro, Cobre, Aluminio, Plata, Níquel',
    descripcion: '8 átomos en esquinas (1 átomo equivalente) + 6 en centros de caras (cada uno compartido entre 2 celdas = 3 átomos). Total: 4 átomos por celda.',
    color: '#F39C12',
    atomos: fccAtomos(),
    aristas: cuboAristas(S, S, S),
    caras: cuboCaras(S, S, S, '#F39C12'),
  },
  {
    nombre: 'Hexagonal Compacta',
    siglas: 'HCP',
    atomosPorCelda: 6,
    coordinacion: 12,
    empaquetamiento: 74,
    ejemplos: 'Zinc, Titanio, Magnesio, Cobalto',
    descripcion: 'Dos capas hexagonales (base y tapa) con 3 átomos intermedios en los huecos tetraédricos. Empaquetamiento máximo igual que FCC.',
    color: '#48A9A6',
    atomos: hcpAtomos(),
    aristas: hcpAristas(),
    caras: hexCaras(S * 0.45, S, '#48A9A6'),
  },
];

// ─── Cristales famosos ───

function naclAtomos(): Atomo3D[] {
  const atoms: Atomo3D[] = [];
  const step = S * 0.4;
  // Red cúbica 3x3x3 alternando Na y Cl
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const isNa = (x + y + z) % 2 === 0;
        atoms.push({
          x: (x - 1) * step,
          y: (y - 1) * step,
          z: (z - 1) * step,
          color: isNa ? '#2E86AB' : '#27AE60',
          size: isNa ? 16 : 20,
          label: isNa ? 'Na⁺' : 'Cl⁻',
        });
      }
    }
  }
  return atoms;
}

function naclAristas(): Arista3D[] {
  const edges: Arista3D[] = [];
  const step = S * 0.4;
  const coords: [number, number, number][] = [];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        coords.push([(x - 1) * step, (y - 1) * step, (z - 1) * step]);
      }
    }
  }
  // Conectar vecinos adyacentes
  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 1; j < coords.length; j++) {
      const dx = Math.abs(coords[i][0] - coords[j][0]);
      const dy = Math.abs(coords[i][1] - coords[j][1]);
      const dz = Math.abs(coords[i][2] - coords[j][2]);
      if ((dx === step && dy === 0 && dz === 0) ||
          (dx === 0 && dy === step && dz === 0) ||
          (dx === 0 && dy === 0 && dz === step)) {
        edges.push({
          x1: coords[i][0], y1: coords[i][1], z1: coords[i][2],
          x2: coords[j][0], y2: coords[j][1], z2: coords[j][2],
        });
      }
    }
  }
  return edges;
}

function diamanteAtomos(): Atomo3D[] {
  const h = S * 0.5;
  // FCC base
  const fcc: [number, number, number][] = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h],
    [0, 0, -h], [0, 0, h], [0, -h, 0], [0, h, 0], [-h, 0, 0], [h, 0, 0],
  ];
  // 4 átomos interiores tetraédricos (posiciones 1/4, 1/4, 1/4 etc.)
  const q = h * 0.5;
  const tetra: [number, number, number][] = [
    [-q, -q, -q], [q, q, -q], [q, -q, q], [-q, q, q],
  ];
  return [
    ...fcc.map(([x, y, z]) => ({ x, y, z, color: '#555555', size: 16 })),
    ...tetra.map(([x, y, z]) => ({ x, y, z, color: '#1A1A1A', size: 18 })),
  ];
}

function diamanteAristas(): Arista3D[] {
  // Simplificación: solo aristas del cubo exterior
  return cuboAristas(S, S, S);
}

function grafitoAtomos(): Atomo3D[] {
  const atoms: Atomo3D[] = [];
  const r = S * 0.35;
  const layerGap = S * 0.55;
  // Dos capas hexagonales
  for (let layer = -1; layer <= 1; layer += 2) {
    const y = layer * layerGap / 2;
    const offset = layer === 1 ? 30 : 0;
    for (let i = 0; i < 6; i++) {
      const ang = (i * 60 + offset) * Math.PI / 180;
      atoms.push({ x: Math.cos(ang) * r, y, z: Math.sin(ang) * r, color: layer === -1 ? '#333333' : '#666666', size: 16 });
    }
    atoms.push({ x: 0, y, z: 0, color: layer === -1 ? '#333333' : '#666666', size: 16 });
  }
  return atoms;
}

function grafitoAristas(): Arista3D[] {
  const edges: Arista3D[] = [];
  const r = S * 0.35;
  const layerGap = S * 0.55;
  // Enlaces dentro de cada capa
  for (let layer = -1; layer <= 1; layer += 2) {
    const y = layer * layerGap / 2;
    const offset = layer === 1 ? 30 : 0;
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const ang = (i * 60 + offset) * Math.PI / 180;
      pts.push([Math.cos(ang) * r, Math.sin(ang) * r]);
    }
    for (let i = 0; i < 6; i++) {
      const n = (i + 1) % 6;
      edges.push({ x1: pts[i][0], y1: y, z1: pts[i][1], x2: pts[n][0], y2: y, z2: pts[n][1] });
    }
  }
  return edges;
}

function cuarzoAtomos(): Atomo3D[] {
  const atoms: Atomo3D[] = [];
  const r = S * 0.4;
  // Tetraedros de SiO₄ apilados helicoidalmente
  for (let layer = -1; layer <= 1; layer++) {
    const y = layer * S * 0.4;
    const ang = layer * 40 * Math.PI / 180;
    // Si central
    atoms.push({ x: Math.cos(ang) * r * 0.3, y, z: Math.sin(ang) * r * 0.3, color: '#F39C12', size: 20, label: 'Si' });
    // 4 O tetraédricos
    const tetraAngles = [0, 109.5, 219, 328.5];
    for (const ta of tetraAngles) {
      const a2 = (ta + layer * 40) * Math.PI / 180;
      atoms.push({
        x: Math.cos(ang) * r * 0.3 + Math.cos(a2) * S * 0.2,
        y: y + Math.sin(a2 * 0.5) * S * 0.15,
        z: Math.sin(ang) * r * 0.3 + Math.sin(a2) * S * 0.2,
        color: '#E74C3C', size: 14, label: 'O',
      });
    }
  }
  return atoms;
}

function cuarzoAristas(): Arista3D[] {
  // Aristas simplificadas del prisma hexagonal
  const edges: Arista3D[] = [];
  const r = S * 0.45;
  const h = S * 0.5;
  for (let i = 0; i < 6; i++) {
    const a1 = (i * 60) * Math.PI / 180;
    const a2 = ((i + 1) * 60) * Math.PI / 180;
    edges.push({ x1: Math.cos(a1) * r, y1: -h, z1: Math.sin(a1) * r, x2: Math.cos(a2) * r, y2: -h, z2: Math.sin(a2) * r });
    edges.push({ x1: Math.cos(a1) * r, y1: h, z1: Math.sin(a1) * r, x2: Math.cos(a2) * r, y2: h, z2: Math.sin(a2) * r });
    edges.push({ x1: Math.cos(a1) * r, y1: -h, z1: Math.sin(a1) * r, x2: Math.cos(a1) * r, y2: h, z2: Math.sin(a1) * r });
  }
  return edges;
}

const CRISTALES_FAMOSOS: CristalFamoso[] = [
  {
    nombre: 'Sal (NaCl)',
    formula: 'NaCl',
    icono: '🧂',
    descripcion: 'Dos redes FCC intercaladas: Na⁺ (azul) y Cl⁻ (verde). Cada ión está rodeado de 6 iones del tipo opuesto formando un octaedro.',
    dato: 'Punto de fusión: 801 °C. Los cristales de sal siempre se rompen en cubos perfectos (fractura cúbica).',
    atomos: naclAtomos(),
    aristas: naclAristas(),
    caras: cuboCaras(S * 0.4 * 2, S * 0.4 * 2, S * 0.4 * 2, '#2E86AB'),
  },
  {
    nombre: 'Diamante',
    formula: 'C (sp³)',
    icono: '💎',
    descripcion: 'Red FCC con 4 átomos adicionales en posiciones tetraédricas internas (1/4, 1/4, 1/4). Cada carbono unido a 4 vecinos con enlace covalente fuerte.',
    dato: 'Dureza 10 (máxima Mohs). Conductividad térmica 5× mayor que el cobre pero aislante eléctrico.',
    atomos: diamanteAtomos(),
    aristas: diamanteAristas(),
    caras: cuboCaras(S, S, S, '#555555'),
  },
  {
    nombre: 'Grafito',
    formula: 'C (sp²)',
    icono: '✏️',
    descripcion: 'Capas hexagonales de carbono (grafeno) unidas por fuerzas de Van der Waals débiles. Las capas se deslizan fácilmente unas sobre otras.',
    dato: 'Dureza 1-2 Mohs. Conductor eléctrico (electrones libres entre capas). Mismo átomo que el diamante, propiedades opuestas.',
    atomos: grafitoAtomos(),
    aristas: grafitoAristas(),
  },
  {
    nombre: 'Cuarzo (SiO₂)',
    formula: 'SiO₂',
    icono: '🔮',
    descripcion: 'Tetraedros de SiO₄ conectados en espiral helicoidal. El silicio (amarillo) está en el centro y 4 oxígenos (rojo) en los vértices.',
    dato: 'Efecto piezoeléctrico: vibra a frecuencia exacta con electricidad. Base de todos los relojes de cuarzo y osciladores electrónicos.',
    atomos: cuarzoAtomos(),
    aristas: cuarzoAristas(),
    caras: hexCaras(S * 0.45, S, '#F39C12'),
  },
];

// ─────────────────────────────────────────────
// Datos sección 4
// ─────────────────────────────────────────────

interface DatoPropiedad {
  titulo: string;
  icono: string;
  contenido: string;
}

const DATOS_PROPIEDADES: DatoPropiedad[] = [
  {
    titulo: 'Empaquetamiento y densidad',
    icono: '📦',
    contenido: 'FCC y HCP empaquetan al 74% (máximo posible para esferas iguales), BCC al 68%. Mayor empaquetamiento = mayor densidad. Por eso el oro (FCC, 19,3 g/cm³) es más denso que el hierro (BCC, 7,87 g/cm³).',
  },
  {
    titulo: 'Dureza y enlace',
    icono: '🔨',
    contenido: 'El diamante (dureza 10) tiene enlaces covalentes sp³ en 3D. El grafito (dureza 1-2) tiene los mismos átomos de C pero con capas que se deslizan. La estructura determina las propiedades, no la composición.',
  },
  {
    titulo: 'Conductividad',
    icono: '⚡',
    contenido: 'Los metales FCC (Cu, Ag, Au) son excelentes conductores: los electrones se mueven libremente entre la red de iones. El grafito conduce en el plano (electrones π deslocalizados) pero no perpendicular a las capas.',
  },
  {
    titulo: 'Defectos cristalinos',
    icono: '🔩',
    contenido: 'Ningún cristal real es perfecto. Las vacantes (átomos faltantes) y dislocaciones (planos desplazados) permiten que los metales se deformen sin romperse. Sin defectos, los metales serían frágiles como la cerámica.',
  },
  {
    titulo: 'Cristales líquidos (LCD)',
    icono: '📱',
    contenido: 'Estado intermedio entre sólido cristalino y líquido. Las moléculas mantienen orden orientacional pero pueden fluir. Cambiando el campo eléctrico, se controla la orientación → cada píxel de tu pantalla LCD.',
  },
  {
    titulo: 'Silicio: la base de la electrónica',
    icono: '💻',
    contenido: 'El silicio tiene estructura de diamante (cada Si unido a 4 vecinos). Es semiconductor: ni conductor ni aislante. Dopando con impurezas (boro, fósforo) se crean los transistores que forman todos los chips.',
  },
  {
    titulo: 'Cristales en tu vida diaria',
    icono: '🏠',
    contenido: 'La sal de mesa (NaCl, cúbico), el azúcar (sacarosa, monoclínico), el hielo (hexagonal, por eso los copos de nieve son hexagonales), las joyas (diamante, rubí, zafiro) y los huesos (apatito, hexagonal).',
  },
  {
    titulo: 'Diamante vs Grafito',
    icono: '🔄',
    contenido: 'Mismo elemento (C), misma composición, propiedades opuestas. Diamante: dureza 10, aislante, transparente, 3D covalente. Grafito: dureza 1-2, conductor, opaco, capas 2D. La estructura cristalina lo cambia todo.',
  },
];

// ─────────────────────────────────────────────
// Componente Escena 3D
// ─────────────────────────────────────────────

interface Escena3DProps {
  atomos: Atomo3D[];
  aristas: Arista3D[];
  caras?: Cara3D[];
  tamano?: number;
  rotacionInicial?: Rotation;
}

function calcularAristaCSS(ar: Arista3D) {
  const dx = ar.x2 - ar.x1;
  const dy = ar.y2 - ar.y1;
  const dz = ar.z2 - ar.z1;
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  // Ángulos de rotación para alinear la arista
  const rotY = Math.atan2(dx, dz) * 180 / Math.PI;
  const rotX = -Math.asin(dy / length) * 180 / Math.PI;
  return {
    width: `${length}px`,
    transform: `translate3d(${ar.x1}px, ${ar.y1}px, ${ar.z1}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
  };
}

function Escena3D({ atomos, aristas, caras, tamano = 320, rotacionInicial }: Escena3DProps) {
  const [rotation, setRotation] = useState<Rotation>(rotacionInicial ?? { x: -20, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (prefersReducedMotion.current) return;
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setRotation(prev => ({ x: prev.x - dy * 0.5, y: prev.y + dx * 0.5 }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const rotar = useCallback((eje: 'x' | 'y', dir: number) => {
    setRotation(prev => ({
      x: eje === 'x' ? prev.x + dir * 30 : prev.x,
      y: eje === 'y' ? prev.y + dir * 30 : prev.y,
    }));
  }, []);

  return (
    <div className={styles.escenaWrapper}>
      <div
        className={styles.scene3d}
        style={{ width: tamano, height: tamano, perspective: '800px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="img"
        aria-label="Estructura cristalina 3D rotable. Arrastra para rotar."
      >
        <div
          className={styles.estructura3d}
          style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
        >
          {/* Caras semitransparentes */}
          {caras?.map((c, i) => (
            <div
              key={`c-${i}`}
              className={styles.cara}
              style={{
                width: c.w,
                height: c.h,
                marginLeft: -c.w / 2,
                marginTop: -c.h / 2,
                transform: `translate3d(${c.cx}px, ${c.cy}px, ${c.cz}px) rotateX(${c.rotX}deg) rotateY(${c.rotY}deg) rotateZ(${c.rotZ}deg)`,
                borderColor: c.color,
                background: `${c.color}20`,
              }}
            />
          ))}
          {aristas.map((ar, i) => {
            const aristaStyle = calcularAristaCSS(ar);
            return (
              <div key={`a-${i}`} className={styles.arista} style={aristaStyle} />
            );
          })}
          {atomos.map((at, i) => (
            <div
              key={`t-${i}`}
              className={styles.atomo}
              style={{
                transform: `translate3d(${at.x}px, ${at.y}px, ${at.z}px)`,
                background: at.color,
                width: at.size,
                height: at.size,
                marginLeft: -at.size / 2,
                marginTop: -at.size / 2,
              }}
            />
          ))}
        </div>
      </div>
      {/* Botones de rotación para accesibilidad / reduced motion */}
      <div className={styles.botonesRotacion}>
        <button type="button" onClick={() => rotar('y', -1)} aria-label="Rotar izquierda" className={styles.btnRotar}>◀</button>
        <button type="button" onClick={() => rotar('x', -1)} aria-label="Rotar arriba" className={styles.btnRotar}>▲</button>
        <button type="button" onClick={() => rotar('x', 1)} aria-label="Rotar abajo" className={styles.btnRotar}>▼</button>
        <button type="button" onClick={() => rotar('y', 1)} aria-label="Rotar derecha" className={styles.btnRotar}>▶</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEstructurasCristalinas() {
  const [seccion, setSeccion] = useState<Seccion>('sistemas');
  const [sistemaActivo, setSistemaActivo] = useState(0);
  const [metalicaActiva, setMetalicaActiva] = useState(0);
  const [cristalActivo, setCristalActivo] = useState(0);

  const secActual = SECCIONES.find(s => s.id === seccion);

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Estructuras Cristalinas 3D</h1>
        <p className={styles.subtitle}>Los 7 sistemas cristalinos, estructuras metálicas y cristales famosos — arrastra para rotar</p>
      </header>

      <LegalNotice />

      {/* Navegación */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {SECCIONES.map(s => (
          <button
            key={s.id}
            type="button"
            className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
            onClick={() => setSeccion(s.id)}
            aria-current={seccion === s.id ? 'true' : undefined}
          >
            <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
            <span className={styles.navTexto}>{s.titulo}</span>
          </button>
        ))}
      </nav>

      {secActual && (
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}><span aria-hidden="true">{secActual.icono}</span> {secActual.titulo}</h2>
          <p className={styles.seccionSubtitulo}>{secActual.subtitulo}</p>
        </div>
      )}

      {/* ─── Sección 1: Los 7 Sistemas ─── */}
      {seccion === 'sistemas' && (
        <section className={styles.seccionContent}>
          <p className={styles.contexto}>
            Todos los cristales pertenecen a uno de 7 sistemas según la geometría de su celda unitaria: las longitudes de sus ejes (a, b, c) y los ángulos entre ellos (α, β, γ).
          </p>

          <div className={styles.sistemasGrid}>
            {SISTEMAS.map((sis, i) => (
              <button
                key={sis.nombre}
                type="button"
                className={`${styles.sistemaCard} ${sistemaActivo === i ? styles.sistemaCardActivo : ''}`}
                onClick={() => setSistemaActivo(i)}
                aria-pressed={sistemaActivo === i}
                style={{ borderColor: sistemaActivo === i ? sis.color : undefined }}
              >
                <span className={styles.sistemaIcono} aria-hidden="true">{sis.icono}</span>
                <span className={styles.sistemaNombre}>{sis.nombre}</span>
              </button>
            ))}
          </div>

          {/* Detalle del sistema seleccionado */}
          <div className={styles.sistemaDetalle} role="status" aria-live="polite" aria-atomic="true" style={{ borderColor: SISTEMAS[sistemaActivo].color }}>
            <h3 className={styles.sistemaDetalleNombre} style={{ color: SISTEMAS[sistemaActivo].color }}>
              <span aria-hidden="true">{SISTEMAS[sistemaActivo].icono}</span> {SISTEMAS[sistemaActivo].nombre}
            </h3>
            <div className={styles.sistemaDetalleInfo}>
              <div className={styles.sistemaParam}>
                <span className={styles.sistemaParamLabel}>Parámetros:</span> {SISTEMAS[sistemaActivo].params}
              </div>
              <div className={styles.sistemaParam}>
                <span className={styles.sistemaParamLabel}>Ángulos:</span> {SISTEMAS[sistemaActivo].angulos}
              </div>
              <div className={styles.sistemaParam}>
                <span className={styles.sistemaParamLabel}>Ejemplo:</span> {SISTEMAS[sistemaActivo].ejemplo}
              </div>
            </div>
            <Escena3D
              atomos={SISTEMAS[sistemaActivo].atomos}
              aristas={SISTEMAS[sistemaActivo].aristas}
              caras={SISTEMAS[sistemaActivo].caras}
              tamano={300}
              rotacionInicial={{ x: -20, y: 30 }}
            />
            <p className={styles.instruccionArrastre}>
              <span aria-hidden="true">👆</span> Arrastra para rotar la celda unitaria
            </p>
          </div>
        </section>
      )}

      {/* ─── Sección 2: Estructuras Metálicas ─── */}
      {seccion === 'metalicas' && (
        <section className={styles.seccionContent}>
          <p className={styles.contexto}>
            Los metales se organizan en tres estructuras principales. El empaquetamiento y la coordinación determinan sus propiedades mecánicas.
          </p>

          <div className={styles.metalicasTabs}>
            {ESTRUCTURAS_METALICAS.map((em, i) => (
              <button
                key={em.siglas}
                type="button"
                className={`${styles.metalicaTab} ${metalicaActiva === i ? styles.metalicaTabActiva : ''}`}
                onClick={() => setMetalicaActiva(i)}
                aria-pressed={metalicaActiva === i}
                style={{ borderColor: metalicaActiva === i ? em.color : undefined }}
              >
                <span className={styles.metalicaSiglas}>{em.siglas}</span>
                <span className={styles.metalicaNombreTab}>{em.nombre}</span>
              </button>
            ))}
          </div>

          {(() => {
            const em = ESTRUCTURAS_METALICAS[metalicaActiva];
            return (
              <div className={styles.metalicaDetalle} role="status" aria-live="polite" aria-atomic="true">
                <h3 className={styles.metalicaDetalleNombre} style={{ color: em.color }}>
                  {em.siglas} — {em.nombre}
                </h3>
                <p className={styles.metalicaDesc}>{em.descripcion}</p>

                <Escena3D
                  atomos={em.atomos}
                  aristas={em.aristas}
                  caras={em.caras}
                  tamano={320}
                  rotacionInicial={{ x: -25, y: 35 }}
                />
                <p className={styles.instruccionArrastre}>
                  <span aria-hidden="true">👆</span> Arrastra para rotar
                </p>

                <div className={styles.metalicaStats}>
                  <div className={styles.metalicaStat}>
                    <span className={styles.metalicaStatValor}>{em.atomosPorCelda}</span>
                    <span className={styles.metalicaStatLabel}>Átomos / celda</span>
                  </div>
                  <div className={styles.metalicaStat}>
                    <span className={styles.metalicaStatValor}>{em.coordinacion}</span>
                    <span className={styles.metalicaStatLabel}>Nº coordinación</span>
                  </div>
                  <div className={styles.metalicaStat}>
                    <span className={styles.metalicaStatValor}>{formatNumber(em.empaquetamiento, 0)}%</span>
                    <span className={styles.metalicaStatLabel}>Empaquetamiento</span>
                  </div>
                </div>

                <div className={styles.metalicaEjemplos}>
                  <span className={styles.metalicaEjemplosLabel}>Metales con esta estructura:</span> {em.ejemplos}
                </div>
              </div>
            );
          })()}

          {/* Comparativa */}
          <div className={styles.comparativaCard}>
            <h3 className={styles.comparativaTitulo}>Comparativa de empaquetamiento</h3>
            <div className={styles.comparativaBarras}>
              {ESTRUCTURAS_METALICAS.map(em => (
                <div key={em.siglas} className={styles.comparativaBarra}>
                  <span className={styles.comparativaLabel}>{em.siglas}</span>
                  <div className={styles.comparativaTrack}>
                    <div
                      className={styles.comparativaFill}
                      style={{ width: `${em.empaquetamiento}%`, background: em.color }}
                    />
                  </div>
                  <span className={styles.comparativaValor}>{formatNumber(em.empaquetamiento, 0)}%</span>
                </div>
              ))}
            </div>
            <p className={styles.comparativaNota}>
              74% es el máximo empaquetamiento posible para esferas iguales (conjetura de Kepler, demostrada en 1998).
            </p>
          </div>
        </section>
      )}

      {/* ─── Sección 3: Cristales Famosos ─── */}
      {seccion === 'cristales' && (
        <section className={styles.seccionContent}>
          <p className={styles.contexto}>
            La estructura cristalina determina todas las propiedades de un material. Mismo elemento, distinta estructura = propiedades completamente diferentes.
          </p>

          <div className={styles.cristalesGrid}>
            {CRISTALES_FAMOSOS.map((cr, i) => (
              <button
                key={cr.nombre}
                type="button"
                className={`${styles.cristalCard} ${cristalActivo === i ? styles.cristalCardActivo : ''}`}
                onClick={() => setCristalActivo(i)}
                aria-pressed={cristalActivo === i}
              >
                <span className={styles.cristalIcono} aria-hidden="true">{cr.icono}</span>
                <span className={styles.cristalNombre}>{cr.nombre}</span>
                <span className={styles.cristalFormula}>{cr.formula}</span>
              </button>
            ))}
          </div>

          {(() => {
            const cr = CRISTALES_FAMOSOS[cristalActivo];
            return (
              <div className={styles.cristalDetalle} role="status" aria-live="polite" aria-atomic="true">
                <h3 className={styles.cristalDetalleTitulo}><span aria-hidden="true">{cr.icono}</span> {cr.nombre} ({cr.formula})</h3>
                <p className={styles.cristalDetalleDesc}>{cr.descripcion}</p>

                <Escena3D
                  atomos={cr.atomos}
                  aristas={cr.aristas}
                  caras={cr.caras}
                  tamano={320}
                  rotacionInicial={{ x: -15, y: 25 }}
                />
                <p className={styles.instruccionArrastre}>
                  <span aria-hidden="true">👆</span> Arrastra para rotar
                </p>

                <div className={styles.cristalDato}>
                  <span className={styles.cristalDatoLabel}>Dato clave:</span> {cr.dato}
                </div>
              </div>
            );
          })()}

          {/* Diamante vs Grafito */}
          <div className={styles.vsCard}>
            <h3 className={styles.vsTitulo}><span aria-hidden="true">💎</span> Diamante vs <span aria-hidden="true">✏️</span> Grafito</h3>
            <p className={styles.vsSubtitulo}>Mismo átomo (C), distinta estructura → propiedades opuestas</p>
            <div className={styles.vsGrid}>
              <div className={styles.vsColumna}>
                <h4 className={styles.vsColumnaTitulo}>Diamante (sp³)</h4>
                <ul className={styles.vsLista}>
                  <li>Dureza: <strong>10</strong> (máxima)</li>
                  <li>Aislante eléctrico</li>
                  <li>Transparente</li>
                  <li>Red 3D covalente</li>
                  <li>Densidad: 3,51 g/cm³</li>
                </ul>
              </div>
              <div className={styles.vsSeparador}>
                <span className={styles.vsVersus}>VS</span>
              </div>
              <div className={styles.vsColumna}>
                <h4 className={styles.vsColumnaTitulo}>Grafito (sp²)</h4>
                <ul className={styles.vsLista}>
                  <li>Dureza: <strong>1-2</strong></li>
                  <li>Conductor eléctrico</li>
                  <li>Opaco, negro</li>
                  <li>Capas 2D apiladas</li>
                  <li>Densidad: 2,26 g/cm³</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Sección 4: Datos y Propiedades ─── */}
      {seccion === 'datos' && (
        <section className={styles.seccionContent}>
          <p className={styles.contexto}>
            La estructura cristalina no es un detalle técnico: determina si un material es duro o blando, conductor o aislante, opaco o transparente.
          </p>

          <div className={styles.datosGrid}>
            {DATOS_PROPIEDADES.map(d => (
              <div key={d.titulo} className={styles.datoCard}>
                <div className={styles.datoHeader}>
                  <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
                  <h3 className={styles.datoTitulo}>{d.titulo}</h3>
                </div>
                <p className={styles.datoContenido}>{d.contenido}</p>
              </div>
            ))}
          </div>

          <div className={styles.warningBox}>
            <strong>Nota importante:</strong> Las representaciones 3D son modelos simplificados de las celdas unitarias. Los cristales reales contienen billones de celdas repetidas y pueden presentar defectos, impurezas y deformaciones que alteran sus propiedades.
          </div>
        </section>
      )}

      {/* Contenido educativo */}
      <EducationalSection title="Cristalografía: conceptos fundamentales" subtitle="Qué es un cristal, por qué solo 7 sistemas y por qué importa">
        <h4>¿Qué es un cristal?</h4>
        <p>
          Un cristal es un sólido cuyos átomos, iones o moléculas están ordenados en un patrón tridimensional repetitivo llamado <strong>red cristalina</strong>. La unidad mínima que se repite es la <strong>celda unitaria</strong>. Conociendo la celda unitaria, puedes reconstruir todo el cristal por repetición.
        </p>

        <h4>¿Por qué solo 7 sistemas?</h4>
        <p>
          La matemática demuestra que solo existen 7 formas fundamentales de paralelepípedo que, al repetirse, llenan todo el espacio sin huecos. Estos 7 sistemas se subdividen en 14 redes de Bravais y 230 grupos espaciales que describen todas las simetrías posibles.
        </p>

        <h4>Cristales amorfos vs cristalinos</h4>
        <p>
          El vidrio parece un cristal pero es amorfo: sus átomos no tienen orden a largo alcance. Un cristal de cuarzo (SiO₂) y el vidrio tienen la misma composición, pero el cuarzo tiene estructura ordenada y el vidrio no. Por eso el cuarzo tiene caras planas y el vidrio se rompe de forma irregular.
        </p>

        <h4>¿Por qué importa esto?</h4>
        <p>
          Los semiconductores (silicio, germanio) funcionan gracias a su estructura cristalina perfecta de tipo diamante. Los cristales líquidos hacen posibles las pantallas LCD. Los superconductores dependen de estructuras cristalinas específicas. La ciencia de materiales es, en gran medida, ingeniería de estructuras cristalinas.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-estructuras-cristalinas')} />
      <ShareCard appName="visualizador-estructuras-cristalinas" />
      <Footer appName="visualizador-estructuras-cristalinas" />
    </div>
  );
}
