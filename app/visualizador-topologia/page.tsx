'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Topologia.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface Superficie {
  id: string;
  nombre: string;
  genus: number;
  orientable: boolean;
  cerrada: boolean;
  caras: number;
  descripcion: string;
  euler: number;
  svgPath: string;
}

interface Genus {
  valor: number;
  nombre: string;
  ejemplo: string;
  descripcion: string;
  construccion: string;
}

interface Nudo {
  id: string;
  nombre: string;
  notacion: string;
  descripcion: string;
  color: string;
  svgD: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const SUPERFICIES: Superficie[] = [
  {
    id: 'esfera',
    nombre: 'Esfera',
    genus: 0,
    orientable: true,
    cerrada: true,
    caras: 2,
    euler: 2,
    descripcion: 'La superficie más simple: sin agujeros, sin bordes. Una pelota de fútbol o la Tierra son esferas topológicamente. Cualquier poliedro convexo es homeomorfo a la esfera.',
    svgPath: 'M90,90 m-60,0 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',
  },
  {
    id: 'toro',
    nombre: 'Toro',
    genus: 1,
    orientable: true,
    cerrada: true,
    caras: 2,
    euler: 0,
    descripcion: 'La superficie de un donut o rosquilla. Tiene exactamente un agujero. Topológicamente, también equivale a una taza de café con asa: ambos tienen genus 1.',
    svgPath: 'M90,90 m-45,0 a45,20 0 1,0 90,0 a45,20 0 1,0 -90,0 M90,90 m-20,0 a20,8 0 1,0 40,0 a20,8 0 1,0 -40,0',
  },
  {
    id: 'doble-toro',
    nombre: 'Doble toro',
    genus: 2,
    orientable: true,
    cerrada: true,
    caras: 2,
    euler: -2,
    descripcion: 'Una superficie con dos agujeros — como el símbolo ∞ en volumen. Un pretzel de dos brazos es homeomorfo al doble toro.',
    svgPath: 'M55,90 m-28,0 a28,12 0 1,0 56,0 a28,12 0 1,0 -56,0 M55,90 m-13,0 a13,5 0 1,0 26,0 a13,5 0 1,0 -26,0 M125,90 m-28,0 a28,12 0 1,0 56,0 a28,12 0 1,0 -56,0 M125,90 m-13,0 a13,5 0 1,0 26,0 a13,5 0 1,0 -26,0',
  },
  {
    id: 'mobius',
    nombre: 'Banda de Möbius',
    genus: 0,
    orientable: false,
    cerrada: false,
    caras: 1,
    euler: 0,
    descripcion: 'Una tira con media vuelta y los extremos pegados. Tiene una sola cara y un solo borde. Si dibujas una línea por el centro, recorres toda la superficie y vuelves al punto de partida por el otro lado.',
    svgPath: 'M30,70 Q55,40 90,70 Q125,100 150,70 M30,110 Q55,80 90,110 Q125,140 150,110 M30,70 Q20,90 30,110 M150,70 Q160,90 150,110',
  },
  {
    id: 'klein',
    nombre: 'Botella de Klein',
    genus: 0,
    orientable: false,
    cerrada: true,
    caras: 1,
    euler: 0,
    descripcion: 'Una superficie sin interior ni exterior. No puede construirse en 3D sin auto-intersección — necesita la cuarta dimensión. Su interior y exterior son la misma cara.',
    svgPath: 'M90,30 Q120,30 130,60 Q140,90 110,100 Q90,110 90,90 Q90,70 70,80 Q50,90 60,110 Q70,130 90,140 Q110,150 90,160',
  },
];

const GENUS_DATOS: Genus[] = [
  {
    valor: 0,
    nombre: 'Genus 0 — Sin agujeros',
    ejemplo: 'Esfera, poliedro convexo',
    descripcion: 'La superficie más simple: sin agujeros topológicos. Un cubo, una pirámide, una pelota... todos son genus 0 y son homeomorfos entre sí.',
    construccion: 'Partimos de una esfera. No añadimos ningún "asa".',
  },
  {
    valor: 1,
    nombre: 'Genus 1 — Un agujero',
    ejemplo: 'Toro, taza de café',
    descripcion: 'Una sola asa añadida. El "donut" es el representante más conocido. Una taza de café con asa también tiene genus 1.',
    construccion: 'Tomamos la esfera y le añadimos 1 asa (cilindro que conecta dos puntos de la esfera).',
  },
  {
    valor: 2,
    nombre: 'Genus 2 — Dos agujeros',
    ejemplo: 'Pretzel de dos brazos, doble toro',
    descripcion: 'Dos asas. Una superficie que parece la silueta del símbolo "∞" en volumen. Característica de Euler χ = −2.',
    construccion: 'Tomamos la esfera y le añadimos 2 asas.',
  },
  {
    valor: 3,
    nombre: 'Genus 3 — Tres agujeros',
    ejemplo: 'Triple toro',
    descripcion: 'Tres asas. Cada asa adicional reduce la característica de Euler en 2. χ = 2 − 2×3 = −4.',
    construccion: 'Tomamos la esfera y le añadimos 3 asas.',
  },
];

const NUDOS: Nudo[] = [
  {
    id: 'trivial',
    nombre: 'Nudo trivial',
    notacion: '0₁',
    descripcion: 'Un simple círculo cerrado. Se puede desenredar completamente hasta quedar como un círculo plano sin cruzamientos.',
    color: '#2E86AB',
    svgD: 'M50,50 m-35,0 a35,35 0 1,0 70,0 a35,35 0 1,0 -70,0',
  },
  {
    id: 'trebol',
    nombre: 'Nudo trébol',
    notacion: '3₁',
    descripcion: 'El nudo no trivial más simple: 3 cruzamientos. No se puede desenredar sin cortar. Existe en versión levógira y dextrógira (son imágenes especulares).',
    color: '#48A9A6',
    svgD: 'M50,25 C80,25 90,50 70,60 C55,68 45,68 30,60 C10,50 20,25 50,25 M50,25 C50,50 65,72 50,80 M50,25 C50,50 35,72 50,80',
  },
  {
    id: 'figura8',
    nombre: 'Nudo figura-8',
    notacion: '4₁',
    descripcion: '4 cruzamientos. A diferencia del trébol, es anfiquiral: es equivalente a su imagen especular. El segundo nudo no trivial más simple.',
    color: '#7FB3D3',
    svgD: 'M50,50 C30,25 15,35 25,50 C35,65 65,65 75,50 C85,35 70,25 50,50 C30,75 15,65 25,50 C35,35 65,35 75,50 C85,65 70,75 50,50',
  },
];

const TABLA_SUPERFICIES = [
  { nombre: 'Esfera', cerrada: true, orientable: true, genus: 0, euler: 2 },
  { nombre: 'Toro', cerrada: true, orientable: true, genus: 1, euler: 0 },
  { nombre: 'Doble toro', cerrada: true, orientable: true, genus: 2, euler: -2 },
  { nombre: 'Triple toro', cerrada: true, orientable: true, genus: 3, euler: -4 },
  { nombre: 'Plano proyectivo', cerrada: true, orientable: false, genus: 0, euler: 1 },
  { nombre: 'Banda de Möbius', cerrada: false, orientable: false, genus: 0, euler: 0 },
  { nombre: 'Botella de Klein', cerrada: true, orientable: false, genus: 0, euler: 0 },
];

// ─────────────────────────────────────────────
// SVG de superficies (galería)
// ─────────────────────────────────────────────

function SvgEsfera({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 180 180" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="gradEsfera" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#7ecbea" />
          <stop offset="100%" stopColor="#2E86AB" />
        </radialGradient>
      </defs>
      <circle cx="90" cy="90" r="70" fill="url(#gradEsfera)" />
      <ellipse cx="90" cy="90" rx="70" ry="22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <ellipse cx="90" cy="90" rx="22" ry="70" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
    </svg>
  );
}

function SvgToro({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 180 180" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="gradToro" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7ecbea" />
          <stop offset="100%" stopColor="#48A9A6" />
        </radialGradient>
      </defs>
      <ellipse cx="90" cy="100" rx="68" ry="28" fill="url(#gradToro)" />
      <ellipse cx="90" cy="100" rx="68" ry="28" fill="none" stroke="rgba(46,134,171,0.6)" strokeWidth="1" />
      <ellipse cx="90" cy="100" rx="30" ry="12" fill="#FAFAFA" />
      <ellipse cx="90" cy="100" rx="30" ry="12" fill="none" stroke="rgba(46,134,171,0.35)" strokeWidth="1" />
      <ellipse cx="90" cy="72" rx="68" ry="28" fill="none" stroke="rgba(72,169,166,0.5)" strokeWidth="1.5" strokeDasharray="6 3" />
    </svg>
  );
}

function SvgDobleToro({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 220 140" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="gradDT" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9dd4e8" />
          <stop offset="100%" stopColor="#2E86AB" />
        </radialGradient>
      </defs>
      <ellipse cx="65" cy="75" rx="52" ry="22" fill="url(#gradDT)" />
      <ellipse cx="65" cy="75" rx="22" ry="9" fill="#FAFAFA" />
      <ellipse cx="155" cy="75" rx="52" ry="22" fill="url(#gradDT)" />
      <ellipse cx="155" cy="75" rx="22" ry="9" fill="#FAFAFA" />
      <path d="M113,65 Q110,75 113,85" stroke="rgba(46,134,171,0.5)" strokeWidth="2" fill="none" />
    </svg>
  );
}

function SvgMobius({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 180 140" width={size} height={size} aria-hidden="true">
      <path
        d="M30,50 Q60,20 90,50 Q120,80 150,50"
        stroke="#2E86AB" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.35"
      />
      <path
        d="M30,90 Q60,120 90,90 Q120,60 150,90"
        stroke="#48A9A6" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.35"
      />
      <path
        d="M30,50 Q18,70 30,90"
        stroke="#2E86AB" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.45"
      />
      <path
        d="M150,50 Q162,70 150,90"
        stroke="#48A9A6" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.45"
      />
      <path
        d="M30,50 Q60,20 90,50 Q120,80 150,50"
        stroke="#2E86AB" strokeWidth="2.5" fill="none"
      />
      <path
        d="M30,90 Q60,120 90,90 Q120,60 150,90"
        stroke="#48A9A6" strokeWidth="2.5" fill="none"
      />
    </svg>
  );
}

function SvgKlein({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 180 200" width={size} height={size} aria-hidden="true">
      <path
        d="M90,20 C125,20 140,45 135,75 C130,105 105,115 90,110
           C75,105 65,90 65,70 C65,50 75,35 90,30
           Q70,30 60,50 C50,70 55,95 70,115
           C80,130 90,145 90,165"
        stroke="#2E86AB" strokeWidth="3.5" fill="none" strokeLinecap="round"
      />
      <path
        d="M90,165 C105,165 120,150 115,130"
        stroke="#48A9A6" strokeWidth="3" fill="none" strokeLinecap="round"
      />
      <circle cx="90" cy="20" r="6" fill="#2E86AB" />
      <circle cx="90" cy="165" r="6" fill="#48A9A6" />
    </svg>
  );
}

function renderSvg(id: string, size = 120) {
  switch (id) {
    case 'esfera': return <SvgEsfera size={size} />;
    case 'toro': return <SvgToro size={size} />;
    case 'doble-toro': return <SvgDobleToro size={size} />;
    case 'mobius': return <SvgMobius size={size} />;
    case 'klein': return <SvgKlein size={size} />;
    default: return <SvgEsfera size={size} />;
  }
}

// ─────────────────────────────────────────────
// SVG de Genus
// ─────────────────────────────────────────────

function SvgGenus({ valor }: { valor: number }) {
  if (valor === 0) return <SvgEsfera size={180} />;
  if (valor === 1) return <SvgToro size={180} />;
  if (valor === 2) return <SvgDobleToro size={180} />;
  // genus 3: triple toro simplificado
  return (
    <svg viewBox="0 0 300 130" width={240} height={120} aria-hidden="true">
      <defs>
        <radialGradient id="gradG3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#9dd4e8" />
          <stop offset="100%" stopColor="#2E86AB" />
        </radialGradient>
      </defs>
      {[50, 150, 250].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={65} rx={42} ry={18} fill="url(#gradG3)" />
          <ellipse cx={cx} cy={65} rx={17} ry={7} fill="#FAFAFA" />
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorTopologiaPage() {
  const [superficieActiva, setSuperficieActiva] = useState<string>('toro');
  const [genusActivo, setGenusActivo] = useState<number>(1);
  const [nudoActivo, setNudoActivo] = useState<string>('trebol');

  const superficieSeleccionada = SUPERFICIES.find((s) => s.id === superficieActiva) ?? SUPERFICIES[1];
  const genusSeleccionado = GENUS_DATOS.find((g) => g.valor === genusActivo) ?? GENUS_DATOS[1];
  const nudoSeleccionado = NUDOS.find((n) => n.id === nudoActivo) ?? NUDOS[1];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono} aria-hidden="true">∞</div>
        <h1 className={styles.titulo}>Visualizador de Topología</h1>
        <p className={styles.subtitulo}>
          La geometría que estudia propiedades invariantes bajo deformación continua.
          Una taza de café y un donut son el mismo objeto topológico.
        </p>
        <p className={styles.heroNota}>Superficies · Genus · Nudos · Característica de Euler</p>
      </header>

      <LegalNotice />

      {/* ── Galería de superficies ── */}
      <section className={styles.seccion} aria-labelledby="titulo-galeria">
        <h2 className={styles.seccionTitulo} id="titulo-galeria">
          <span aria-hidden="true">🔵</span> Galería de superficies topológicas
        </h2>
        <p className={styles.seccionSubtitulo}>
          Pulsa una superficie para ver sus propiedades topológicas en detalle.
        </p>

        <div className={styles.galeria} role="list">
          {SUPERFICIES.map((s) => (
            <div
              key={s.id}
              role="listitem"
              className={`${styles.superficieCard} ${superficieActiva === s.id ? styles.superficieCardActiva : ''}`}
              onClick={() => setSuperficieActiva(s.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSuperficieActiva(s.id); }}
              tabIndex={0}
              aria-pressed={superficieActiva === s.id}
              aria-label={`Ver ${s.nombre}`}
            >
              <div className={styles.svgWrapper}>{renderSvg(s.id, 100)}</div>
              <div className={styles.superficieNombre}>{s.nombre}</div>
              <div className={styles.superficieGenus}>Genus {s.genus}</div>
            </div>
          ))}
        </div>

        {/* Panel de detalle */}
        <div className={styles.detallePanel} role="region" aria-label={`Detalle de ${superficieSeleccionada.nombre}`}>
          <div className={styles.detalleSvgGrande}>
            {renderSvg(superficieSeleccionada.id, 170)}
          </div>
          <div className={styles.detalleInfo}>
            <h3>{superficieSeleccionada.nombre}</h3>
            <p>{superficieSeleccionada.descripcion}</p>
            <div className={styles.propsBadges}>
              <span className={`${styles.badge} ${styles.badgeAzul}`}>
                Genus {superficieSeleccionada.genus}
              </span>
              <span className={`${styles.badge} ${superficieSeleccionada.orientable ? styles.badgeVerde : styles.badgeRojo}`}>
                {superficieSeleccionada.orientable ? '✓ Orientable' : '✗ No orientable'}
              </span>
              <span className={`${styles.badge} ${superficieSeleccionada.cerrada ? styles.badgeVerde : styles.badgeRojo}`}>
                {superficieSeleccionada.cerrada ? '✓ Cerrada' : '✗ Con borde'}
              </span>
              <span className={`${styles.badge} ${styles.badgeMorado}`}>
                {superficieSeleccionada.caras} cara{superficieSeleccionada.caras > 1 ? 's' : ''}
              </span>
              <span className={`${styles.badge} ${styles.badgeAzul}`}>
                χ = {superficieSeleccionada.euler}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Clasificación por genus ── */}
      <section className={styles.seccion} aria-labelledby="titulo-genus">
        <h2 className={styles.seccionTitulo} id="titulo-genus">
          <span aria-hidden="true">🔗</span> Clasificación por genus
        </h2>
        <p className={styles.seccionSubtitulo}>
          El genus cuenta el número de «asas» de una superficie. Cada asa añade −2 a la característica de Euler.
        </p>

        <div className={styles.genusSelectorWrap}>
          <div className={styles.genusTabs} role="tablist" aria-label="Seleccionar genus">
            {GENUS_DATOS.map((g) => (
              <button
                key={g.valor}
                type="button"
                role="tab"
                aria-selected={genusActivo === g.valor}
                className={`${styles.genusTab} ${genusActivo === g.valor ? styles.genusTabActivo : ''}`}
                onClick={() => setGenusActivo(g.valor)}
              >
                g = {g.valor}
              </button>
            ))}
          </div>

          <div className={styles.genusVisualizacion}>
            <div className={styles.genusSvgArea}>
              <SvgGenus valor={genusActivo} />
            </div>
            <div className={styles.genusDescripcion}>
              <h4>{genusSeleccionado.nombre}</h4>
              <p><strong>Ejemplo:</strong> {genusSeleccionado.ejemplo}</p>
              <p>{genusSeleccionado.descripcion}</p>
              <p>{genusSeleccionado.construccion}</p>
              <span className={styles.genusChi}>
                χ = 2 − 2g = 2 − 2×{genusActivo} = {2 - 2 * genusActivo}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nudos topológicos ── */}
      <section className={styles.seccion} aria-labelledby="titulo-nudos">
        <h2 className={styles.seccionTitulo} id="titulo-nudos">
          <span aria-hidden="true">🪢</span> Nudos topológicos
        </h2>
        <p className={styles.seccionSubtitulo}>
          Un nudo es un círculo cerrado en el espacio 3D. Dos nudos son equivalentes si se puede deformar uno en el otro sin cortar.
        </p>

        <div className={styles.nudosGrid} role="list">
          {NUDOS.map((n) => (
            <div
              key={n.id}
              role="listitem"
              className={`${styles.nudoCard} ${nudoActivo === n.id ? styles.nudoCardActivo : ''}`}
              onClick={() => setNudoActivo(n.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setNudoActivo(n.id); }}
              tabIndex={0}
              aria-pressed={nudoActivo === n.id}
              aria-label={`Ver nudo ${n.nombre}`}
            >
              <div className={styles.nudoSvgWrap}>
                <svg viewBox="0 0 100 100" width={90} height={90} aria-hidden="true">
                  <path d={n.svgD} stroke={n.color} strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div className={styles.nudoNombre}>{n.nombre}</div>
              <div className={styles.nudoNotacion}>{n.notacion}</div>
              <div className={styles.nudoDesc}>{n.descripcion}</div>
            </div>
          ))}
        </div>

        <div className={styles.warningBox}>
          <strong>Dato notable:</strong> El ADN en el interior de las células puede formar nudos topológicos.
          Las topoisomerasas son enzimas que desanudan el ADN para permitir la replicación y la transcripción —
          son una aplicación directa de la teoría de nudos en biología molecular.
          El nudo trébol aparece con frecuencia en moléculas de ADN circular.
        </div>
      </section>

      {/* ── Tabla de propiedades ── */}
      <section className={styles.seccion} aria-labelledby="titulo-tabla">
        <h2 className={styles.seccionTitulo} id="titulo-tabla">
          <span aria-hidden="true">📊</span> Tabla de propiedades topológicas
        </h2>
        <p className={styles.seccionSubtitulo}>
          Comparativa de superficies con su característica de Euler χ = V − E + F.
        </p>

        <div className={styles.tablaWrap}>
          <table className={styles.tabla} aria-label="Tabla de propiedades topológicas">
            <thead>
              <tr>
                <th scope="col">Superficie</th>
                <th scope="col">Cerrada</th>
                <th scope="col">Orientable</th>
                <th scope="col">Genus</th>
                <th scope="col">χ = V − E + F</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_SUPERFICIES.map((fila) => (
                <tr key={fila.nombre}>
                  <td>{fila.nombre}</td>
                  <td className={fila.cerrada ? styles.tablaSi : styles.tablaNo}>
                    {fila.cerrada ? 'Sí' : 'No'}
                  </td>
                  <td className={fila.orientable ? styles.tablaSi : styles.tablaNo}>
                    {fila.orientable ? 'Sí' : 'No'}
                  </td>
                  <td>{fila.genus}</td>
                  <td className={styles.chiDestacado}>{fila.euler}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Sección educativa v2.0 ── */}
      <EducationalSection title="¿Qué es la topología y por qué importa?" subtitle="La geometría de las formas que importan sin medidas exactas">
        <h3>¿Qué estudia la topología?</h3>
        <p>
          La topología es la rama de las matemáticas que estudia las propiedades de los espacios geométricos
          que se conservan bajo deformaciones continuas: estirar, comprimir, doblar... pero <strong>nunca cortar ni pegar</strong>.
          A estas transformaciones se las llama <em>homeomorfismos</em>.
        </p>
        <p>
          Para la topología, un cubo y una esfera son <strong>el mismo objeto</strong>: puedes deformar
          uno hasta obtener el otro. Pero una esfera y un toro (donut) son distintos: no hay forma de
          convertir uno en el otro sin cortar o crear un agujero.
        </p>

        <h3>Homeomorfismo: cuándo dos formas son &quot;lo mismo&quot;</h3>
        <p>
          Dos espacios son <strong>homeomorfos</strong> si existe una función continua biyectiva entre ellos
          cuya inversa también es continua. En la práctica: si puedes deformar uno en el otro sin romper
          ni pegar nada. Ejemplos clásicos:
        </p>
        <ul>
          <li>Esfera ≡ cubo ≡ tetraedro (todos genus 0)</li>
          <li>Toro ≡ taza de café con asa (ambos genus 1)</li>
          <li>Doble toro ≡ pretzel de dos brazos (ambos genus 2)</li>
        </ul>
        <p>
          La equivalencia taza-donut es famosa porque parece absurda: imaginamos que para pasar de un
          donut a una taza necesitas añadir material. Pero topológicamente, basta con ir &quot;empujando&quot;
          la masa del donut para crear la depresión de la taza, conservando el asa.
        </p>

        <h3>Superficies orientables vs no orientables</h3>
        <p>
          Una superficie es <strong>orientable</strong> si un observador que recorra toda la superficie
          vuelve al punto de partida con su orientación original (sin haberse &quot;volteado&quot;). La esfera
          y el toro son orientables. La <strong>banda de Möbius</strong> no lo es: si recorres
          la única cara de la banda, llegas al punto de partida habiendo dado una vuelta completa, pero
          en el lado opuesto.
        </p>
        <p>
          La banda de Möbius también tiene un solo borde (no dos), algo que puedes verificar
          físicamente: coge una tira de papel, dale media vuelta y pega los extremos. Si dibujas
          una línea por el borde sin levantar el lápiz, recorrerás todo el borde y volverás al inicio.
        </p>

        <h3>La botella de Klein: sin interior ni exterior</h3>
        <p>
          La botella de Klein es una superficie cerrada (sin bordes) que no es orientable y no tiene
          interior diferenciado del exterior. No puede existir en tres dimensiones sin
          auto-intersectarse — necesitaría la cuarta dimensión para construirse sin cruzarse.
          Se puede pensar como &quot;dos bandas de Möbius pegadas por su borde&quot;.
        </p>

        <h3>Característica de Euler: χ = V − E + F</h3>
        <p>
          Para cualquier poliedro convexo (genus 0): <strong>V − E + F = 2</strong>, donde V son
          vértices, E aristas y F caras. Este resultado, descubierto por Euler en 1750, es un
          <em> invariante topológico</em>: no cambia si deformas el poliedro.
        </p>
        <p>
          La fórmula general para superficies orientables es <strong>χ = 2 − 2g</strong>, donde g
          es el genus. Por eso la esfera (g=0) tiene χ=2, el toro (g=1) tiene χ=0, y el doble toro
          (g=2) tiene χ=−2.
        </p>

        <h3>Aplicaciones de la topología</h3>
        <ul>
          <li><strong>Redes de datos:</strong> la topología de redes estudia la conectividad sin importar las distancias físicas.</li>
          <li><strong>Biología:</strong> el ADN circular puede formar nudos topológicos; las topoisomerasas los deshacen.</li>
          <li><strong>Física:</strong> la materia topológica (aislantes topológicos, estado de Hall cuántico) usa invariantes topológicos para predecir propiedades eléctricas.</li>
          <li><strong>Ciencia de datos:</strong> el análisis de datos topológico (TDA) extrae la &quot;forma&quot; de conjuntos de datos de alta dimensión.</li>
          <li><strong>Robótica:</strong> el espacio de configuraciones de un robot puede tener topología no trivial.</li>
        </ul>

        <div className={styles.warningBox}>
          <strong>Dato topológico para recordar:</strong>{' '}
          Una taza de café y un donut son topológicamente idénticos: ambos tienen exactamente un agujero.
          Un pretzel de dos brazos es diferente de ambos — tiene genus 2 y no se puede deformar
          continuamente en un donut sin crear un agujero extra o tapar uno.
          El universo podría tener una topología no trivial: algunos cosmólogos estudian si
          tiene la topología de un toro gigante en lugar de un espacio plano infinito.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-topologia')} />
      <ShareCard appName="visualizador-topologia" />
      <Footer appName="visualizador-topologia" />
    </div>
  );
}
