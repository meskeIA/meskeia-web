'use client';
// @disclaimer: exempt

import { useState, useRef, useCallback, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorVsepr.module.css';

// ============================================
// TIPOS
// ============================================
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Vertice extends Vec3 {
  tipo: 'enlace' | 'libre';
  indice: number;
}

interface AtomoInfo {
  simbolo: string;
  nombre: string;
  color: string;
  textColor: string;
}

interface MoleculaPreset {
  nombre: string;
  formula: string;
  atomo: string;
  enlaces: number;
  libres: number;
}

interface GeometriaInfo {
  notacion: string;
  geomElectronica: string;
  geomMolecular: string;
  anguloIdeal: string;
  hibridacion: string;
  ejemplos: string;
}

// ============================================
// DATOS
// ============================================
const ATOMOS: AtomoInfo[] = [
  { simbolo: 'C', nombre: 'Carbono', color: '#404040', textColor: '#ffffff' },
  { simbolo: 'N', nombre: 'Nitrógeno', color: '#3050f8', textColor: '#ffffff' },
  { simbolo: 'O', nombre: 'Oxígeno', color: '#ff0d0d', textColor: '#ffffff' },
  { simbolo: 'P', nombre: 'Fósforo', color: '#ff8000', textColor: '#ffffff' },
  { simbolo: 'S', nombre: 'Azufre', color: '#ffd000', textColor: '#1a1a1a' },
  { simbolo: 'Cl', nombre: 'Cloro', color: '#1ff01f', textColor: '#1a1a1a' },
  { simbolo: 'Br', nombre: 'Bromo', color: '#a62929', textColor: '#ffffff' },
  { simbolo: 'Xe', nombre: 'Xenón', color: '#429eb0', textColor: '#ffffff' },
  { simbolo: 'Si', nombre: 'Silicio', color: '#daa520', textColor: '#1a1a1a' },
  { simbolo: 'B', nombre: 'Boro', color: '#ffb5b5', textColor: '#1a1a1a' },
];

const COLOR_LIGANDO = '#7FB3D3'; // azul claro estándar para ligando genérico

const MOLECULAS_PRESET: MoleculaPreset[] = [
  { nombre: 'CO₂', formula: 'CO2', atomo: 'C', enlaces: 2, libres: 0 },
  { nombre: 'BF₃', formula: 'BF3', atomo: 'B', enlaces: 3, libres: 0 },
  { nombre: 'H₂O', formula: 'H2O', atomo: 'O', enlaces: 2, libres: 2 },
  { nombre: 'NH₃', formula: 'NH3', atomo: 'N', enlaces: 3, libres: 1 },
  { nombre: 'CH₄', formula: 'CH4', atomo: 'C', enlaces: 4, libres: 0 },
  { nombre: 'PCl₅', formula: 'PCl5', atomo: 'P', enlaces: 5, libres: 0 },
  { nombre: 'SF₆', formula: 'SF6', atomo: 'S', enlaces: 6, libres: 0 },
  { nombre: 'XeF₄', formula: 'XeF4', atomo: 'Xe', enlaces: 4, libres: 2 },
];

// Tabla VSEPR completa
const TABLA_VSEPR: Record<string, GeometriaInfo> = {
  '2-0': {
    notacion: 'AX₂',
    geomElectronica: 'Lineal',
    geomMolecular: 'Lineal',
    anguloIdeal: '180°',
    hibridacion: 'sp',
    ejemplos: 'CO₂, BeCl₂, HCN',
  },
  '3-0': {
    notacion: 'AX₃',
    geomElectronica: 'Trigonal plana',
    geomMolecular: 'Trigonal plana',
    anguloIdeal: '120°',
    hibridacion: 'sp²',
    ejemplos: 'BF₃, BCl₃, SO₃',
  },
  '2-1': {
    notacion: 'AX₂E',
    geomElectronica: 'Trigonal plana',
    geomMolecular: 'Angular',
    anguloIdeal: '<120°',
    hibridacion: 'sp²',
    ejemplos: 'SO₂, O₃, NO₂⁻',
  },
  '4-0': {
    notacion: 'AX₄',
    geomElectronica: 'Tetraédrica',
    geomMolecular: 'Tetraédrica',
    anguloIdeal: '109,5°',
    hibridacion: 'sp³',
    ejemplos: 'CH₄, NH₄⁺, SiCl₄',
  },
  '3-1': {
    notacion: 'AX₃E',
    geomElectronica: 'Tetraédrica',
    geomMolecular: 'Pirámide trigonal',
    anguloIdeal: '<109,5° (~107°)',
    hibridacion: 'sp³',
    ejemplos: 'NH₃, PCl₃, H₃O⁺',
  },
  '2-2': {
    notacion: 'AX₂E₂',
    geomElectronica: 'Tetraédrica',
    geomMolecular: 'Angular',
    anguloIdeal: '<109,5° (~104,5°)',
    hibridacion: 'sp³',
    ejemplos: 'H₂O, H₂S, OF₂',
  },
  '5-0': {
    notacion: 'AX₅',
    geomElectronica: 'Bipirámide trigonal',
    geomMolecular: 'Bipirámide trigonal',
    anguloIdeal: '90° y 120°',
    hibridacion: 'sp³d',
    ejemplos: 'PCl₅, PF₅, AsF₅',
  },
  '4-1': {
    notacion: 'AX₄E',
    geomElectronica: 'Bipirámide trigonal',
    geomMolecular: 'Balancín (sube y baja)',
    anguloIdeal: '~90° y ~120°',
    hibridacion: 'sp³d',
    ejemplos: 'SF₄, IF₄⁺, IO₂F₂⁻',
  },
  '3-2': {
    notacion: 'AX₃E₂',
    geomElectronica: 'Bipirámide trigonal',
    geomMolecular: 'Forma T',
    anguloIdeal: '~90°',
    hibridacion: 'sp³d',
    ejemplos: 'ClF₃, BrF₃, IF₃',
  },
  '2-3': {
    notacion: 'AX₂E₃',
    geomElectronica: 'Bipirámide trigonal',
    geomMolecular: 'Lineal',
    anguloIdeal: '180°',
    hibridacion: 'sp³d',
    ejemplos: 'XeF₂, I₃⁻, ICl₂⁻',
  },
  '6-0': {
    notacion: 'AX₆',
    geomElectronica: 'Octaédrica',
    geomMolecular: 'Octaédrica',
    anguloIdeal: '90°',
    hibridacion: 'sp³d²',
    ejemplos: 'SF₆, PF₆⁻, [Co(NH₃)₆]³⁺',
  },
  '5-1': {
    notacion: 'AX₅E',
    geomElectronica: 'Octaédrica',
    geomMolecular: 'Pirámide cuadrada',
    anguloIdeal: '<90°',
    hibridacion: 'sp³d²',
    ejemplos: 'BrF₅, IF₅, XeOF₄',
  },
  '4-2': {
    notacion: 'AX₄E₂',
    geomElectronica: 'Octaédrica',
    geomMolecular: 'Cuadrada plana',
    anguloIdeal: '90°',
    hibridacion: 'sp³d²',
    ejemplos: 'XeF₄, ICl₄⁻, BrF₄⁻',
  },
};

// ============================================
// VÉRTICES POR GEOMETRÍA ELECTRÓNICA
// ============================================
function getVerticesElectronicos(total: number): Vec3[] {
  switch (total) {
    case 1:
      return [{ x: 1, y: 0, z: 0 }];
    case 2:
      // Lineal
      return [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
      ];
    case 3: {
      // Trigonal plana — 120° en plano xy
      const verts: Vec3[] = [];
      for (let i = 0; i < 3; i++) {
        const ang = (i * 2 * Math.PI) / 3;
        verts.push({ x: Math.cos(ang), y: Math.sin(ang), z: 0 });
      }
      return verts;
    }
    case 4: {
      // Tetraédrica — 4 vértices del tetraedro normalizados
      const k = 1 / Math.sqrt(3);
      return [
        { x: k, y: k, z: k },
        { x: -k, y: -k, z: k },
        { x: -k, y: k, z: -k },
        { x: k, y: -k, z: -k },
      ];
    }
    case 5: {
      // Bipirámide trigonal: 3 ecuatoriales (120° en xy) + 2 axiales (±z)
      const verts: Vec3[] = [];
      for (let i = 0; i < 3; i++) {
        const ang = (i * 2 * Math.PI) / 3;
        verts.push({ x: Math.cos(ang), y: Math.sin(ang), z: 0 });
      }
      verts.push({ x: 0, y: 0, z: 1 });
      verts.push({ x: 0, y: 0, z: -1 });
      return verts;
    }
    case 6:
      // Octaédrica: ±x, ±y, ±z
      return [
        { x: 1, y: 0, z: 0 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: -1 },
      ];
    default:
      return [];
  }
}

// ============================================
// LÓGICA: asignar pares libres a posiciones óptimas
// ============================================
function asignarVertices(enlaces: number, libres: number): Vertice[] {
  const total = enlaces + libres;
  const posiciones = getVerticesElectronicos(total);
  if (posiciones.length === 0) return [];

  // Estrategia VSEPR: pares libres prefieren posiciones ecuatoriales en bipirámide
  // Para tetraédrica, octaédrica y otras, asignamos los últimos índices a libres
  const vertices: Vertice[] = [];

  if (total === 5) {
    // Bipirámide trigonal: ecuatoriales (índices 0,1,2) primero para libres
    const ordenLibres = [0, 1, 2, 3, 4];
    const indicesLibres = new Set<number>(ordenLibres.slice(0, libres));
    posiciones.forEach((p, i) => {
      vertices.push({
        ...p,
        tipo: indicesLibres.has(i) ? 'libre' : 'enlace',
        indice: i,
      });
    });
  } else if (total === 6) {
    // Octaédrica: pares libres en posiciones opuestas (cuadrada plana AX4E2: ±z)
    let indicesLibres: Set<number>;
    if (libres === 1) {
      indicesLibres = new Set([5]); // un eje z
    } else if (libres === 2) {
      indicesLibres = new Set([4, 5]); // ±z (queda cuadrada plana)
    } else {
      indicesLibres = new Set();
    }
    posiciones.forEach((p, i) => {
      vertices.push({
        ...p,
        tipo: indicesLibres.has(i) ? 'libre' : 'enlace',
        indice: i,
      });
    });
  } else {
    // Caso general: últimos índices son libres
    posiciones.forEach((p, i) => {
      vertices.push({
        ...p,
        tipo: i >= enlaces ? 'libre' : 'enlace',
        indice: i,
      });
    });
  }

  return vertices;
}

// ============================================
// PROYECCIÓN 3D → 2D
// ============================================
function rotateVec(v: Vec3, rotX: number, rotY: number): Vec3 {
  // Rotación en X
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y1 = v.y * cosX - v.z * sinX;
  const z1 = v.y * sinX + v.z * cosX;
  const x1 = v.x;
  // Rotación en Y
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x2 = x1 * cosY + z1 * sinY;
  const z2 = -x1 * sinY + z1 * cosY;
  return { x: x2, y: y1, z: z2 };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorVseprPage() {
  const [atomoCentral, setAtomoCentral] = useState<string>('C');
  const [enlaces, setEnlaces] = useState<number>(4);
  const [libres, setLibres] = useState<number>(0);
  const [mostrarLibres, setMostrarLibres] = useState<boolean>(true);
  const [mostrarEtiquetas, setMostrarEtiquetas] = useState<boolean>(true);
  const [rotX, setRotX] = useState<number>(-0.3);
  const [rotY, setRotY] = useState<number>(0.4);

  const dragRef = useRef<{ x0: number; y0: number; rx0: number; ry0: number; arrastrando: boolean }>({
    x0: 0,
    y0: 0,
    rx0: 0,
    ry0: 0,
    arrastrando: false,
  });

  const atomoInfo = useMemo(() => {
    return ATOMOS.find((a) => a.simbolo === atomoCentral) ?? ATOMOS[0];
  }, [atomoCentral]);

  const totalPares = enlaces + libres;
  const claveVsepr = `${enlaces}-${libres}`;
  const geometriaInfo: GeometriaInfo | null = TABLA_VSEPR[claveVsepr] ?? null;

  const vertices = useMemo(() => asignarVertices(enlaces, libres), [enlaces, libres]);

  // Ordenar por z descendente (los más alejados al fondo, los más cercanos delante)
  const verticesProyectados = useMemo(() => {
    const proyectados = vertices.map((v) => {
      const rot = rotateVec(v, rotX, rotY);
      return { vertice: v, rotado: rot };
    });
    proyectados.sort((a, b) => a.rotado.z - b.rotado.z);
    return proyectados;
  }, [vertices, rotX, rotY]);

  // ============================================
  // DRAG handlers
  // ============================================
  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      dragRef.current = {
        x0: e.clientX,
        y0: e.clientY,
        rx0: rotX,
        ry0: rotY,
        arrastrando: true,
      };
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    },
    [rotX, rotY]
  );

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.arrastrando) return;
    const dx = e.clientX - dragRef.current.x0;
    const dy = e.clientY - dragRef.current.y0;
    setRotY(dragRef.current.ry0 + dx * 0.01);
    setRotX(dragRef.current.rx0 + dy * 0.01);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current.arrastrando = false;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar si ya se ha liberado
    }
  }, []);

  // ============================================
  // SETTERS
  // ============================================
  const handleEnlaces = (n: number) => {
    const enlacesNuevos = Math.max(1, Math.min(6, n));
    setEnlaces(enlacesNuevos);
    // Limitar total a 6 (máximo VSEPR común)
    if (enlacesNuevos + libres > 6) {
      setLibres(Math.max(0, 6 - enlacesNuevos));
    }
  };

  const handleLibres = (n: number) => {
    const libresNuevos = Math.max(0, Math.min(3, n));
    setLibres(libresNuevos);
    if (enlaces + libresNuevos > 6) {
      setEnlaces(Math.max(1, 6 - libresNuevos));
    }
  };

  const handlePreset = (m: MoleculaPreset) => {
    setAtomoCentral(m.atomo);
    setEnlaces(m.enlaces);
    setLibres(m.libres);
  };

  // ============================================
  // RENDERIZADO SVG
  // ============================================
  const SVG_SIZE = 360;
  const CX = SVG_SIZE / 2;
  const CY = SVG_SIZE / 2;
  const SCALE = 110;

  // Tamaños átomos según profundidad
  function tamanoPorZ(z: number, base: number): number {
    // z va de -1 a 1; cuanto mayor z, más cerca del observador → más grande
    const factor = 1 + z * 0.3;
    return base * factor;
  }

  const relatedApps = getRelatedApps('simulador-vsepr');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador VSEPR — Geometría Molecular</h1>
        <p>
          Construye moléculas, ajusta pares enlazantes y libres, y observa la geometría 3D rotable
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* PANEL DE CONFIGURACIÓN */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Configuración del átomo central</h2>

          <div className={styles.atomoSelector} role="group" aria-label="Selector de átomo central">
            {ATOMOS.map((a) => (
              <button
                key={a.simbolo}
                type="button"
                className={`${styles.atomoBtn} ${
                  atomoCentral === a.simbolo ? styles.atomoBtnActive : ''
                }`}
                onClick={() => setAtomoCentral(a.simbolo)}
                style={{
                  borderColor: atomoCentral === a.simbolo ? a.color : undefined,
                }}
                aria-pressed={atomoCentral === a.simbolo}
                title={a.nombre}
              >
                <span
                  className={styles.atomoBtnDot}
                  style={{ background: a.color, color: a.textColor }}
                  aria-hidden="true"
                >
                  {a.simbolo}
                </span>
                <span className={styles.atomoBtnLabel}>{a.nombre}</span>
              </button>
            ))}
          </div>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="slider-enlaces">
                Pares enlazantes (X): <strong>{enlaces}</strong>
              </label>
              <input
                id="slider-enlaces"
                type="range"
                min={1}
                max={6}
                step={1}
                value={enlaces}
                onChange={(e) => handleEnlaces(parseInt(e.target.value, 10))}
                aria-label="Número de pares enlazantes"
              />
              <span className={styles.unitLabel}>1 a 6 ligandos</span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="slider-libres">
                Pares libres (E): <strong>{libres}</strong>
              </label>
              <input
                id="slider-libres"
                type="range"
                min={0}
                max={3}
                step={1}
                value={libres}
                onChange={(e) => handleLibres(parseInt(e.target.value, 10))}
                aria-label="Número de pares libres"
              />
              <span className={styles.unitLabel}>0 a 3 pares no enlazantes</span>
            </div>
          </div>

          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={mostrarLibres}
                onChange={(e) => setMostrarLibres(e.target.checked)}
              />{' '}
              Mostrar pares libres como lóbulos
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={mostrarEtiquetas}
                onChange={(e) => setMostrarEtiquetas(e.target.checked)}
              />{' '}
              Mostrar etiquetas
            </label>
          </div>
        </section>

        {/* SELECTOR DE MOLÉCULAS FAMOSAS */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Moléculas famosas (carga rápida)</h2>
          <div className={styles.moleculaSelector}>
            {MOLECULAS_PRESET.map((m) => (
              <button
                key={m.formula}
                type="button"
                className={styles.moleculaBtn}
                onClick={() => handlePreset(m)}
                aria-label={`Cargar configuración de ${m.formula}`}
              >
                {m.nombre}
              </button>
            ))}
          </div>
        </section>

        {/* VISUALIZACIÓN 3D */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Geometría 3D (arrastra para rotar)</h2>
          <div className={styles.moleculeCanvas}>
            <svg
              className={styles.moleculeSvg}
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              role="img"
              aria-label={`Molécula ${geometriaInfo?.notacion ?? ''}: ${
                geometriaInfo?.geomMolecular ?? ''
              }`}
            >
              {/* Enlaces (líneas detrás del átomo central) */}
              {verticesProyectados.map(({ vertice, rotado }) => {
                if (vertice.tipo === 'libre' && !mostrarLibres) return null;
                if (rotado.z >= 0) return null; // detrás del centro
                const x2 = CX + rotado.x * SCALE;
                const y2 = CY - rotado.y * SCALE;
                if (vertice.tipo === 'libre') return null;
                return (
                  <line
                    key={`bond-back-${vertice.indice}`}
                    x1={CX}
                    y1={CY}
                    x2={x2}
                    y2={y2}
                    className={styles.enlace}
                    strokeWidth={3}
                  />
                );
              })}

              {/* Átomo central */}
              <circle
                cx={CX}
                cy={CY}
                r={28}
                className={styles.atomoCentral}
                fill={atomoInfo.color}
              />
              <text
                x={CX}
                y={CY + 5}
                textAnchor="middle"
                fontSize={16}
                fontWeight={700}
                fill={atomoInfo.textColor}
                pointerEvents="none"
              >
                {atomoInfo.simbolo}
              </text>

              {/* Enlaces y vértices delanteros */}
              {verticesProyectados.map(({ vertice, rotado }) => {
                if (vertice.tipo === 'libre' && !mostrarLibres) return null;
                const x2 = CX + rotado.x * SCALE;
                const y2 = CY - rotado.y * SCALE;
                const opacidad = 0.55 + (rotado.z + 1) * 0.225; // 0.55 a 1
                const radio = tamanoPorZ(rotado.z, 14);

                if (vertice.tipo === 'enlace') {
                  return (
                    <g key={`v-${vertice.indice}`} opacity={opacidad}>
                      {rotado.z >= 0 && (
                        <line
                          x1={CX}
                          y1={CY}
                          x2={x2}
                          y2={y2}
                          className={styles.enlace}
                          strokeWidth={3}
                        />
                      )}
                      <circle
                        cx={x2}
                        cy={y2}
                        r={radio}
                        className={styles.atomoEnlace}
                        fill={COLOR_LIGANDO}
                      />
                      {mostrarEtiquetas && (
                        <text
                          x={x2}
                          y={y2 + 4}
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight={700}
                          fill="#1a1a1a"
                          pointerEvents="none"
                        >
                          X
                        </text>
                      )}
                    </g>
                  );
                }

                // Par libre — lóbulo elíptico
                const angRad = Math.atan2(y2 - CY, x2 - CX);
                const angDeg = (angRad * 180) / Math.PI;
                const cxLobulo = CX + (x2 - CX) * 0.7;
                const cyLobulo = CY + (y2 - CY) * 0.7;

                return (
                  <g key={`l-${vertice.indice}`} opacity={opacidad * 0.85}>
                    <ellipse
                      cx={cxLobulo}
                      cy={cyLobulo}
                      rx={20}
                      ry={11}
                      className={styles.parLibre}
                      transform={`rotate(${angDeg} ${cxLobulo} ${cyLobulo})`}
                    />
                    {mostrarEtiquetas && (
                      <text
                        x={cxLobulo}
                        y={cyLobulo + 3}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight={700}
                        fill="#7a5c00"
                        pointerEvents="none"
                      >
                        ··
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <p className={styles.canvasHint}>
            Arrastra con el ratón o el dedo para rotar la molécula. Los pares libres se muestran
            como lóbulos amarillos.
          </p>
        </section>

        {/* RESULTADOS */}
        {geometriaInfo && (
          <section className={styles.resultBlock}>
            <h2 className={styles.resultTitle}>
              Resultado: {geometriaInfo.notacion} con átomo central {atomoInfo.simbolo}
            </h2>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Notación VSEPR</span>
              <span className={styles.resultValueAccent}>{geometriaInfo.notacion}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Pares totales</span>
              <span className={styles.resultValue}>
                {totalPares} ({enlaces} enlazantes + {libres} libres)
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Geometría electrónica</span>
              <span className={styles.resultValue}>{geometriaInfo.geomElectronica}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Geometría molecular</span>
              <span className={styles.resultValueAccent}>{geometriaInfo.geomMolecular}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Ángulo de enlace ideal</span>
              <span className={styles.resultValue}>{geometriaInfo.anguloIdeal}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Hibridación</span>
              <span className={styles.resultValue}>{geometriaInfo.hibridacion}</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Ejemplos reales</span>
              <span className={styles.resultValue}>{geometriaInfo.ejemplos}</span>
            </div>
          </section>
        )}

        {!geometriaInfo && (
          <section className={styles.mensajePedagogico}>
            <strong>Combinación poco común</strong>
            La combinación X={enlaces} y E={libres} no corresponde a una geometría VSEPR estándar de
            la tabla de referencia. Prueba con otros valores: por ejemplo, X=4 y E=0 (CH₄
            tetraédrico) o X=2 y E=2 (H₂O angular).
          </section>
        )}

        <EducationalSection
          title="Guía de VSEPR y Geometría Molecular"
          subtitle="Pares electrónicos, hibridación y forma molecular"
        >
          <h3>Tabla VSEPR Completa</h3>
          <p>
            La teoría VSEPR (Valence Shell Electron Pair Repulsion, repulsión de pares de electrones
            de la capa de valencia, también llamada TRePEV en español) predice la geometría 3D de
            una molécula contando los pares de electrones (enlazantes y libres) alrededor del átomo
            central. La regla básica: los pares de electrones se repelen entre sí y adoptan la
            disposición que minimiza esa repulsión. Es un contenido clásico de la química de
            Bachillerato y la EBAU en España, y de la preparatoria, la secundaria y la educación
            media en Latinoamérica.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Notación</th>
                  <th>Pares</th>
                  <th>Geometría electrónica</th>
                  <th>Geometría molecular</th>
                  <th>Ángulo</th>
                  <th>Hibridación</th>
                  <th>Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(TABLA_VSEPR).map(([clave, info]) => {
                  const [x, e] = clave.split('-');
                  return (
                    <tr key={clave}>
                      <td>
                        <strong>{info.notacion}</strong>
                      </td>
                      <td>
                        {x}+{e}
                      </td>
                      <td>{info.geomElectronica}</td>
                      <td>{info.geomMolecular}</td>
                      <td>{info.anguloIdeal}</td>
                      <td>{info.hibridacion}</td>
                      <td>{info.ejemplos.split(',')[0]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Agua (H₂O) — Angular</h4>
              <p>
                El oxígeno tiene 2 pares enlazantes (con los H) y 2 pares libres. La geometría
                electrónica es tetraédrica, pero la geometría molecular es angular (ángulo
                ~104,5°). Los pares libres comprimen el ángulo respecto al ideal de 109,5°.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Amoniaco (NH₃) — Pirámide trigonal</h4>
              <p>
                El nitrógeno tiene 3 enlaces y 1 par libre. Geometría electrónica tetraédrica,
                molecular piramidal trigonal. El par libre del N reduce el ángulo H-N-H a ~107°.
                Esta forma asimétrica explica por qué el amoniaco es polar.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Metano (CH₄) — Tetraédrica perfecta</h4>
              <p>
                El carbono con 4 enlaces y sin pares libres adopta la geometría tetraédrica ideal
                con ángulos de 109,5°. Es la molécula prototipo de la hibridación sp³ y la base de
                la estereoquímica orgánica.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Hexafluoruro de azufre (SF₆) — Octaédrica</h4>
              <p>
                El azufre con 6 enlaces y 0 pares libres adopta geometría octaédrica perfecta
                (90°). SF₆ es muy estable e inerte; se usa como gas aislante en transformadores
                eléctricos por su densidad y resistencia dieléctrica.
              </p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué los pares libres comprimen el ángulo de enlace?</strong>
              <p>
                Un par libre está concentrado más cerca del núcleo del átomo central que un par
                enlazante (que se reparte entre dos núcleos). Por tanto ocupa más espacio angular y
                empuja a los pares enlazantes, reduciendo el ángulo entre ellos.
              </p>
              <p className={styles.faqTip}>
                Tip: en H₂O el ángulo es 104,5° (no 109,5°) precisamente por los 2 pares libres.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo cuento pares de electrones en una molécula?</strong>
              <p>
                Dibuja la estructura de Lewis del compuesto. Cuenta los enlaces al átomo central
                (cada enlace simple, doble o triple cuenta como UN par enlazante para VSEPR). Suma
                los pares libres del átomo central (no los de los ligandos).
              </p>
              <p className={styles.faqTip}>
                Tip: en CO₂ hay 2 enlaces dobles, pero VSEPR los trata como 2 pares enlazantes →
                AX₂ → lineal.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la hibridación y cómo se relaciona con VSEPR?</strong>
              <p>
                La hibridación es el modelo orbital que explica VSEPR: los orbitales s, p (y
                eventualmente d) del átomo central se combinan para formar orbitales híbridos que
                apuntan hacia los pares electrónicos. Total de pares 2 = sp, 3 = sp², 4 = sp³, 5 =
                sp³d, 6 = sp³d².
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre geometría electrónica y molecular?</strong>
              <p>
                La geometría electrónica considera TODOS los pares (enlazantes + libres). La
                geometría molecular considera SOLO la disposición de los átomos (ignora los pares
                libres en la forma final, aunque sí afectan los ángulos).
              </p>
              <p className={styles.faqTip}>
                Ejemplo: H₂O tiene geom. electrónica tetraédrica pero molecular angular.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué H₂O es angular y CO₂ lineal si ambos tienen 2 ligandos?</strong>
              <p>
                Porque difieren en pares libres. El oxígeno de H₂O tiene 2 pares libres (AX₂E₂,
                geometría base tetraédrica → angular). El carbono de CO₂ no tiene pares libres
                (AX₂, geometría lineal). VSEPR predice formas distintas según el balance X+E.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Los enlaces dobles y triples cuentan como uno o varios?</strong>
              <p>
                En VSEPR, todo enlace múltiple cuenta como UN solo par enlazante (un dominio
                electrónico). Aunque tenga más electrones, ocupa una sola dirección espacial. Por
                eso CO₂ (2 dobles) es AX₂ y no AX₄.
              </p>
              <p className={styles.faqTip}>
                Tip: enlaces múltiples son ligeramente más voluminosos que simples y comprimen los
                ángulos, pero la geometría base se mantiene.
              </p>
            </div>
          </div>

          <h3>Cómo Predecir la Geometría — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Dibuja la estructura de Lewis</strong>
                <p>
                  Identifica el átomo central (normalmente el menos electronegativo o el único de
                  ese tipo) y dibuja todos los enlaces y pares libres.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Cuenta los dominios electrónicos del átomo central</strong>
                <p>
                  Cada enlace (simple, doble o triple) cuenta como 1. Cada par libre cuenta como 1.
                  Suma X (enlaces) + E (pares libres).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Determina la geometría electrónica</strong>
                <p>
                  Total = 2 → lineal. Total = 3 → trigonal plana. Total = 4 → tetraédrica. Total =
                  5 → bipirámide trigonal. Total = 6 → octaédrica.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Identifica la geometría molecular</strong>
                <p>
                  Quita visualmente los pares libres y observa la forma que dejan los átomos. Esa
                  es la geometría molecular real.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Ajusta los ángulos según pares libres</strong>
                <p>
                  Cada par libre comprime ligeramente los ángulos respecto al valor ideal (efecto
                  típico de 1-3° por par libre).
                </p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">
                ✓
              </div>
              <div>
                <strong>Empieza con Lewis</strong>
                <p>
                  No saltes a la geometría sin dibujar primero la estructura de Lewis. Es la base
                  para contar pares correctamente.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">
                ✓
              </div>
              <div>
                <strong>Cuenta solo el átomo central</strong>
                <p>
                  Los pares libres de los ligandos NO cuentan para VSEPR del centro. Solo importan
                  los del átomo en cuestión.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">
                ✓
              </div>
              <div>
                <strong>Pares libres en bipirámide</strong>
                <p>
                  En geometría AX₅E variantes, los pares libres se sitúan en posiciones
                  ECUATORIALES (no axiales) porque tienen menos repulsión.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">
                ✓
              </div>
              <div>
                <strong>Enlaces múltiples = 1 dominio</strong>
                <p>
                  Para VSEPR, dobles y triples cuentan como un solo par. Solo los simples y los
                  pares libres se cuentan independientemente.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">
                ✓
              </div>
              <div>
                <strong>Memoriza los 5 casos base</strong>
                <p>
                  Lineal, trigonal, tetraédrica, bipirámide trigonal y octaédrica. Todo lo demás
                  son variantes con pares libres.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon} aria-hidden="true">
                ✓
              </div>
              <div>
                <strong>Relaciona con polaridad</strong>
                <p>
                  La geometría molecular determina si una molécula es polar o apolar. Simétricas
                  (CH₄, CO₂) suelen ser apolares; asimétricas (H₂O, NH₃) son polares.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠
              </span>
              Errores Frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                Confundir geometría electrónica con molecular (H₂O no es tetraédrica, es angular).
              </li>
              <li>
                Contar enlaces dobles como 2 pares (en VSEPR siempre cuentan como 1 dominio).
              </li>
              <li>
                Olvidar los pares libres del átomo central al determinar la geometría.
              </li>
              <li>
                Asumir ángulos perfectos siempre (los pares libres siempre comprimen).
              </li>
              <li>
                Aplicar VSEPR a metales de transición sin precaución (ahí entra la teoría del
                campo cristalino).
              </li>
              <li>
                Confundir geometría con polaridad: una molécula simétrica con enlaces polares
                puede ser apolar.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={relatedApps} />
        <ShareCard appName="simulador-vsepr" />
      </main>

      <Footer appName="simulador-vsepr" />
    </div>
  );
}
