'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './MotorElectrico.module.css';
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

type Tab = 'campo' | 'interior' | 'regeneracion' | 'ventajas';

interface TabItem {
  id: Tab;
  label: string;
  emoji: string;
}

interface FilaComparativa {
  aspecto: string;
  electrico: string;
  combustion: string;
  ganador: 'electrico' | 'combustion';
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const TABS: TabItem[] = [
  { id: 'campo', label: 'Campo magnético', emoji: '🌀' },
  { id: 'interior', label: 'Por dentro', emoji: '⚙️' },
  { id: 'regeneracion', label: 'Regeneración', emoji: '🔄' },
  { id: 'ventajas', label: 'Ventajas', emoji: '⚡' },
];

const COMPARATIVA: FilaComparativa[] = [
  { aspecto: 'Eficiencia energética', electrico: '85–95%', combustion: '30–40%', ganador: 'electrico' },
  { aspecto: 'Par motor', electrico: 'Máximo desde 0 rpm', combustion: 'Requiere aceleración', ganador: 'electrico' },
  { aspecto: 'Ruido', electrico: 'Casi silencioso', combustion: 'Vibraciones + escape', ganador: 'electrico' },
  { aspecto: 'Emisiones locales', electrico: 'Cero', combustion: 'CO₂, NOₓ, partículas', ganador: 'electrico' },
  { aspecto: 'Mantenimiento', electrico: 'Mínimo (sin aceite, bujías)', combustion: 'Complejo y frecuente', ganador: 'electrico' },
  { aspecto: 'Arranque en frío', electrico: 'Instantáneo, sin penalización', combustion: 'Pérdidas aumentadas', ganador: 'electrico' },
  { aspecto: 'Complejidad mecánica', electrico: '~20 piezas móviles', combustion: '~200 piezas móviles', ganador: 'electrico' },
  { aspecto: 'Densidad energética', electrico: '250–300 Wh/kg (batería)', combustion: '~12.000 Wh/kg (gasolina)', ganador: 'combustion' },
];

// ─────────────────────────────────────────────
// SVG: Campo magnético rotante
// ─────────────────────────────────────────────

function SvgCampoMagnetico(): React.ReactNode {
  // 6 posiciones de bobinas (pares U, V, W) en el estátor
  const bobinas = [
    { angulo: 0,   fase: 'U', color: '#2E86AB' },
    { angulo: 60,  fase: 'V', color: '#48A9A6' },
    { angulo: 120, fase: 'W', color: '#7FB3D3' },
    { angulo: 180, fase: 'U', color: '#2E86AB' },
    { angulo: 240, fase: 'V', color: '#48A9A6' },
    { angulo: 300, fase: 'W', color: '#7FB3D3' },
  ];

  return (
    <svg viewBox="0 0 200 200" className={styles.svgDiagram} aria-label="Campo magnético rotante trifásico">
      {/* Estátor: círculo exterior */}
      <circle cx="100" cy="100" r="85" fill="none" stroke="var(--text-secondary)" strokeWidth="8" opacity="0.25" />
      <circle cx="100" cy="100" r="85" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />

      {/* Rotor: círculo interior */}
      <circle cx="100" cy="100" r="40" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="3" />
      <text x="100" y="96" textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontWeight="600">ROTOR</text>
      <text x="100" y="108" textAnchor="middle" fontSize="7" fill="var(--text-secondary)">imanes</text>

      {/* Bobinas del estátor */}
      {bobinas.map((b) => {
        const rad = (b.angulo * Math.PI) / 180;
        const x = 100 + 72 * Math.sin(rad);
        const y = 100 - 72 * Math.cos(rad);
        return (
          <g key={b.angulo}>
            <rect
              x={x - 7}
              y={y - 5}
              width="14"
              height="10"
              rx="2"
              fill={b.color}
              opacity="0.85"
              transform={`rotate(${b.angulo}, ${x}, ${y})`}
            />
            <text
              x={x}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6"
              fill="#fff"
              fontWeight="bold"
              transform={`rotate(${b.angulo}, ${x}, ${y})`}
            >
              {b.fase}
            </text>
          </g>
        );
      })}

      {/* Flecha del campo rotante */}
      <g className={styles.campoRotante} style={{ transformOrigin: '100px 100px' }}>
        <line x1="100" y1="100" x2="100" y2="62" stroke="#E84855" strokeWidth="3" strokeLinecap="round" />
        <polygon points="100,55 96,65 104,65" fill="#E84855" />
      </g>

      {/* Etiqueta */}
      <text x="100" y="194" textAnchor="middle" fontSize="7" fill="var(--text-muted)">Campo resultante (rotante)</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Inversor trifásico (cadena batería → motor)
// ─────────────────────────────────────────────

function SvgInversor(): React.ReactNode {
  return (
    <svg viewBox="0 0 320 100" className={styles.svgDiagramWide} aria-label="Esquema de inversor trifásico">
      {/* Batería */}
      <rect x="4" y="30" width="60" height="40" rx="6" fill="var(--primary)" opacity="0.9" />
      <text x="34" y="47" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">Batería</text>
      <text x="34" y="58" textAnchor="middle" fontSize="7" fill="#fff">DC 400V</text>
      <text x="34" y="68" textAnchor="middle" fontSize="6" fill="#ddd">▓▓▓░</text>

      {/* Flecha 1 */}
      <line x1="64" y1="50" x2="88" y2="50" stroke="var(--text-secondary)" strokeWidth="2" />
      <polygon points="88,46 96,50 88,54" fill="var(--text-secondary)" />

      {/* Inversor IGBT */}
      <rect x="96" y="20" width="80" height="60" rx="6" fill="var(--secondary)" opacity="0.9" />
      <text x="136" y="39" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">Inversor</text>
      <text x="136" y="50" textAnchor="middle" fontSize="7" fill="#fff">6 IGBT</text>
      <text x="136" y="61" textAnchor="middle" fontSize="6.5" fill="#fff">PWM</text>
      <text x="136" y="72" textAnchor="middle" fontSize="6" fill="#ddd">frecuencia variable</text>

      {/* Flechas 3 fases */}
      <line x1="176" y1="38" x2="200" y2="38" stroke="var(--primary)" strokeWidth="1.5" />
      <polygon points="200,34 208,38 200,42" fill="var(--primary)" />
      <line x1="176" y1="50" x2="200" y2="50" stroke="var(--secondary)" strokeWidth="1.5" />
      <polygon points="200,46 208,50 200,54" fill="var(--secondary)" />
      <line x1="176" y1="62" x2="200" y2="62" stroke="var(--accent)" strokeWidth="1.5" />
      <polygon points="200,58 208,62 200,66" fill="var(--accent)" />

      {/* Etiqueta fases */}
      <text x="202" y="34" fontSize="6" fill="var(--primary)" fontWeight="bold">U</text>
      <text x="202" y="46" fontSize="6" fill="var(--secondary)" fontWeight="bold">V</text>
      <text x="202" y="59" fontSize="6" fill="var(--accent)" fontWeight="bold">W</text>

      {/* Motor */}
      <ellipse cx="260" cy="50" rx="44" ry="38" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="3" />
      <text x="260" y="46" textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontWeight="bold">MOTOR</text>
      <text x="260" y="58" textAnchor="middle" fontSize="7" fill="var(--text-secondary)">AC trifásico</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Frenado regenerativo bidireccional
// ─────────────────────────────────────────────

function SvgRegeneracion(): React.ReactNode {
  return (
    <svg viewBox="0 0 300 120" className={styles.svgDiagramWide} aria-label="Diagrama de frenado regenerativo">
      {/* Caja motor */}
      <rect x="10" y="35" width="90" height="50" rx="8" fill="var(--primary)" opacity="0.9" />
      <text x="55" y="57" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">MOTOR</text>
      <text x="55" y="70" textAnchor="middle" fontSize="7.5" fill="#ddd">/ GENERADOR</text>
      <text x="55" y="80" textAnchor="middle" fontSize="6.5" fill="#ddd">Principio reversible</text>

      {/* Flecha tracción → */}
      <path d="M 100 48 Q 150 30 200 48" fill="none" stroke="#2ECC71" strokeWidth="2.5" strokeDasharray="0" />
      <polygon points="200,44 208,48 200,52" fill="#2ECC71" />
      <text x="150" y="28" textAnchor="middle" fontSize="7.5" fill="#2ECC71" fontWeight="bold">⚡ Tracción</text>
      <text x="150" y="37" textAnchor="middle" fontSize="6.5" fill="#2ECC71">Batería → Motor → Ruedas</text>

      {/* Flecha regeneración ← */}
      <path d="M 200 72 Q 150 90 100 72" fill="none" stroke="#E84855" strokeWidth="2.5" strokeDasharray="5 3" />
      <polygon points="100,68 92,72 100,76" fill="#E84855" />
      <text x="150" y="100" textAnchor="middle" fontSize="7.5" fill="#E84855" fontWeight="bold">🔄 Regeneración</text>
      <text x="150" y="110" textAnchor="middle" fontSize="6.5" fill="#E84855">Ruedas → Generador → Batería</text>

      {/* Caja batería */}
      <rect x="200" y="35" width="90" height="50" rx="8" fill="var(--secondary)" opacity="0.9" />
      <text x="245" y="57" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">BATERÍA</text>
      <text x="245" y="69" textAnchor="middle" fontSize="7" fill="#ddd">400–800V DC</text>
      <text x="245" y="80" textAnchor="middle" fontSize="6.5" fill="#ddd">recarga parcial</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Contenidos por pestaña
// ─────────────────────────────────────────────

function TabCampo(): React.ReactNode {
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Campo magnético rotante trifásico</h2>
      <p className={styles.tabIntro}>
        El secreto del motor eléctrico es crear un campo magnético que <strong>gira</strong> sin mover ninguna pieza del estátor.
        Tres bobinas desfasadas 120° generan corrientes alternas que, sumadas, producen un campo resultante que da vueltas continuamente.
      </p>

      <div className={styles.svgWrapper}>
        <SvgCampoMagnetico />
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValor}>3</span>
          <span className={styles.statLabel}>Fases desfasadas 120°</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValor}>3000</span>
          <span className={styles.statLabel}>rpm del campo a 50 Hz (1 par de polos)</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValor}>f × 60 / p</span>
          <span className={styles.statLabel}>Fórmula velocidad de sincronismo</span>
        </div>
      </div>

      <div className={styles.infoBox}>
        <h3>¿Cómo se mueve el rotor?</h3>
        <p>
          El campo rotante induce corriente en el rotor (ley de Faraday). Esa corriente crea su propio campo magnético
          que interacciona con el del estátor (fuerza de Lorentz) generando el <strong>par motor</strong> que hace girar el eje.
          En motores síncronos, el rotor tiene imanes permanentes que "siguen" al campo sin deslizamiento.
        </p>
      </div>
    </div>
  );
}

function TabInterior(): React.ReactNode {
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Por dentro del motor eléctrico</h2>
      <p className={styles.tabIntro}>
        Un motor eléctrico moderno tiene solo dos partes principales: el <strong>estátor</strong> (fijo) y el <strong>rotor</strong> (móvil).
        La electrónica de potencia — el inversor — es quien transforma la energía de la batería en campo rotante.
      </p>

      <div className={styles.partsGrid}>
        <div className={styles.partCard}>
          <div className={styles.partIcon} style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }} aria-hidden="true">🔵</div>
          <h3>Estátor</h3>
          <p>Parte <strong>fija</strong>. Contiene las bobinas de cobre que crean el campo magnético rotante cuando reciben corriente alterna trifásica.</p>
          <ul>
            <li>Núcleo de láminas de acero silicio</li>
            <li>Bobinas de cobre aisladas</li>
            <li>3 devanados desfasados 120°</li>
          </ul>
        </div>
        <div className={styles.partCard}>
          <div className={styles.partIcon} style={{ background: 'linear-gradient(135deg, var(--secondary), #48A9A6)' }} aria-hidden="true">🔴</div>
          <h3>Rotor</h3>
          <p>Parte <strong>móvil</strong>. En motores síncronos lleva imanes permanentes de neodimio; en asíncronos, barras de aluminio (jaula de ardilla).</p>
          <ul>
            <li>Imanes permanentes (NdFeB)</li>
            <li>Eje de transmisión de par</li>
            <li>Separado del estátor por entrehierro</li>
          </ul>
        </div>
      </div>

      <h3 className={styles.sectionSubtitle}>Inversor trifásico: el cerebro electrónico</h3>
      <p className={styles.tabIntro}>
        La batería entrega <strong>corriente continua (CC)</strong>. El motor necesita <strong>corriente alterna trifásica (CA)</strong>.
        El inversor convierte una en otra usando 6 transistores IGBT que conmutan miles de veces por segundo (PWM).
        Variando la frecuencia de conmutación se controla exactamente la velocidad del motor.
      </p>

      <div className={styles.svgWrapper}>
        <SvgInversor />
      </div>

      <div className={styles.infoBox}>
        <h3>Control vectorial de par</h3>
        <p>
          El microcontrolador calcula en tiempo real los vectores de corriente necesarios para maximizar el par en cada momento.
          Este algoritmo (FOC — <em>Field Oriented Control</em>) es lo que hace que los vehículos eléctricos tengan una respuesta
          tan instantánea al acelerador: el par se puede ajustar en microsegundos.
        </p>
      </div>
    </div>
  );
}

function TabRegeneracion(): React.ReactNode {
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Frenado regenerativo</h2>
      <p className={styles.tabIntro}>
        Cuando el vehículo frena o desacelera, el motor eléctrico invierte su función: se convierte en <strong>generador</strong>.
        La energía cinética de las ruedas genera electricidad que se devuelve a la batería, en lugar de disiparse como calor en los frenos.
      </p>

      <div className={styles.svgWrapper}>
        <SvgRegeneracion />
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValor}>15–25%</span>
          <span className={styles.statLabel}>Energía recuperada en ciudad</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValor}>hasta 40%</span>
          <span className={styles.statLabel}>Recuperación en descensos de montaña</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValor}>ms</span>
          <span className={styles.statLabel}>Tiempo de respuesta del sistema</span>
        </div>
      </div>

      <div className={styles.infoBox}>
        <h3>Curva par-velocidad: la gran ventaja</h3>
        <p>
          El motor eléctrico genera <strong>par máximo desde 0 rpm</strong>, lo que equivale a la máxima fuerza desde el primer momento.
          Un motor de combustión necesita girar a cierta velocidad para alcanzar su par pico. Además, el motor eléctrico mantiene
          potencia constante en un amplio rango de velocidades gracias al control electrónico del inversor.
        </p>
        <div className={styles.curvaPar}>
          <div className={styles.curvaBar} style={{ height: '100%', background: 'var(--primary)' }}>
            <span>Par EV</span>
          </div>
          <div className={styles.curvaBar} style={{ height: '45%', background: 'var(--text-muted)', alignSelf: 'flex-end' }}>
            <span>Par ICE</span>
          </div>
          <div className={styles.curvaAxis}>
            <span>0 rpm</span>
            <span>rpm máx</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabVentajas(): React.ReactNode {
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Ventajas termodinámicas</h2>
      <p className={styles.tabIntro}>
        La eficiencia superior del motor eléctrico no es casual: es una consecuencia directa de la física.
        La conversión <strong>electromagnética directa</strong> evita las limitaciones del ciclo de Carnot que afectan
        irremediablemente a la combustión.
      </p>

      <div className={styles.comparativaWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Aspecto</th>
              <th>Motor eléctrico</th>
              <th>Motor de combustión</th>
            </tr>
          </thead>
          <tbody>
            {COMPARATIVA.map((fila) => (
              <tr key={fila.aspecto}>
                <td className={styles.aspectoCell}>{fila.aspecto}</td>
                <td className={fila.ganador === 'electrico' ? styles.ganadorElectrico : styles.normalCell}>
                  {fila.ganador === 'electrico' && <span className={styles.checkmark} aria-hidden="true">✓ </span>}
                  {fila.electrico}
                </td>
                <td className={fila.ganador === 'combustion' ? styles.ganadorCombustion : styles.normalCell}>
                  {fila.ganador === 'combustion' && <span className={styles.checkmark} aria-hidden="true">✓ </span>}
                  {fila.combustion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.infoBox}>
        <h3>¿Por qué el motor de combustión tiene solo un 30–40% de eficiencia?</h3>
        <p>
          El <strong>ciclo de Carnot</strong> establece el límite teórico máximo de cualquier máquina térmica:
          η = 1 − (T<sub>fría</sub>/T<sub>caliente</sub>). Con T<sub>fría</sub> ≈ 300 K (ambiente) y T<sub>caliente</sub> ≈ 900 K (combustión),
          el límite teórico es ~66%. Pero pérdidas reales (fricción, enfriamiento, escape) reducen la eficiencia real al 30–40%.
          El motor eléctrico <em>no tiene</em> ese límite termodinámico porque no convierte calor en trabajo.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMotorElectrico(): React.ReactNode {
  const [tabActiva, setTabActiva] = useState<Tab>('campo');

  const renderTab = (): React.ReactNode => {
    switch (tabActiva) {
      case 'campo':       return <TabCampo />;
      case 'interior':    return <TabInterior />;
      case 'regeneracion': return <TabRegeneracion />;
      case 'ventajas':    return <TabVentajas />;
      default:            return <TabCampo />;
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Motor Eléctrico</h1>
        <p>Del campo magnético rotante al frenado regenerativo: cómo funciona la tecnología que está transformando el transporte</p>
      </header>

      <LegalNotice />

      {/* Pestañas */}
      <nav className={styles.tabs} aria-label="Secciones del motor eléctrico">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActive : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-current={tabActiva === tab.id ? 'page' : undefined}
            aria-pressed={tabActiva === tab.id}
          >
            <span aria-hidden="true">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Contenido */}
      <main className={styles.content} role="main">
        {renderTab()}
      </main>

      {/* Sección educativa colapsable */}
      <EducationalSection title="Principios físicos del motor eléctrico" subtitle="Faraday, Lorentz, PWM y la termodinámica detrás del motor eléctrico">
        <div className={styles.educationalContent}>
          <h3>Ley de Faraday y fuerza de Lorentz</h3>
          <p>
            El motor eléctrico opera sobre dos leyes fundamentales del electromagnetismo. La <strong>ley de Faraday</strong> (1831)
            establece que un campo magnético variable induce una corriente eléctrica. La <strong>fuerza de Lorentz</strong> establece
            que un conductor con corriente dentro de un campo magnético experimenta una fuerza mecánica: F = I·L × B.
          </p>

          <h3>Motor síncrono vs. asíncrono</h3>
          <p>
            En el <strong>motor síncrono</strong> (Tesla Model 3, la mayoría de VEs modernos) el rotor lleva imanes permanentes y
            gira exactamente a la velocidad del campo rotante. En el <strong>motor asíncrono</strong> (Tesla Model S) el rotor
            tiene barras conductoras; el campo rotante induce corriente en ellas que crea su propio campo, con un pequeño
            "deslizamiento" respecto al campo del estátor.
          </p>

          <h3>PWM y control de velocidad</h3>
          <p>
            La <strong>Modulación por Ancho de Pulso</strong> (PWM) permite al inversor simular una señal CA de cualquier frecuencia
            conmutando los transistores IGBT a 10–20 kHz. Aumentando la frecuencia de salida → el campo gira más rápido → el
            motor va más deprisa. Es la forma más eficiente de controlar velocidad y par sin pérdidas resistivas.
          </p>

          <h3>Densidad de par y refrigeración</h3>
          <p>
            Los motores eléctricos de alto rendimiento usan imanes de neodimio-hierro-boro (NdFeB), los más potentes conocidos.
            La refrigeración es crítica: en motores de automoción se usa refrigeración líquida del estátor. El rotor, al no llevar
            corriente (motores síncronos), genera mucho menos calor.
          </p>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-motor-electrico')} />
      <ShareCard appName="visualizador-motor-electrico" />
      <Footer appName="visualizador-motor-electrico" />
    </div>
  );
}
