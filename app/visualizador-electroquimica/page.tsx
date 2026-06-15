'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Electroquimica.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'pila' | 'serie' | 'electrolisis' | 'bateria';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'pila', titulo: 'Pila de Daniell', icono: '🔋', subtitulo: 'La primera pila galvánica moderna' },
  { id: 'serie', titulo: 'Serie Electroquímica', icono: '⚡', subtitulo: 'Potenciales estándar y reactividad' },
  { id: 'electrolisis', titulo: 'Electrólisis', icono: '💧', subtitulo: 'Electricidad que rompe moléculas' },
  { id: 'bateria', titulo: 'Batería Li-ion', icono: '📱', subtitulo: 'La tecnología que mueve el mundo' },
];

// ─────────────────────────────────────────────
// Datos: Serie electroquímica
// ─────────────────────────────────────────────

interface ParRedox {
  nombre: string;
  formula: string;
  potencial: number; // V vs SHE
  color: string;
}

const SERIE_REDOX: ParRedox[] = [
  { nombre: 'Li⁺/Li',  formula: 'Li⁺ + e⁻ → Li',           potencial: -3.04, color: '#DC2626' },
  { nombre: 'K⁺/K',   formula: 'K⁺ + e⁻ → K',             potencial: -2.92, color: '#EF4444' },
  { nombre: 'Ca²⁺/Ca', formula: 'Ca²⁺ + 2e⁻ → Ca',        potencial: -2.87, color: '#F97316' },
  { nombre: 'Na⁺/Na',  formula: 'Na⁺ + e⁻ → Na',          potencial: -2.71, color: '#FB923C' },
  { nombre: 'Mg²⁺/Mg', formula: 'Mg²⁺ + 2e⁻ → Mg',       potencial: -2.37, color: '#FBBF24' },
  { nombre: 'Zn²⁺/Zn', formula: 'Zn²⁺ + 2e⁻ → Zn',       potencial: -0.76, color: '#84CC16' },
  { nombre: 'Fe²⁺/Fe', formula: 'Fe²⁺ + 2e⁻ → Fe',       potencial: -0.44, color: '#22C55E' },
  { nombre: 'H⁺/H₂',  formula: '2H⁺ + 2e⁻ → H₂',        potencial:  0.00, color: '#94A3B8' },
  { nombre: 'Cu²⁺/Cu', formula: 'Cu²⁺ + 2e⁻ → Cu',       potencial: +0.34, color: '#06B6D4' },
  { nombre: 'Ag⁺/Ag',  formula: 'Ag⁺ + e⁻ → Ag',         potencial: +0.80, color: '#3B82F6' },
  { nombre: 'Pt²⁺/Pt', formula: 'Pt²⁺ + 2e⁻ → Pt',      potencial: +1.19, color: '#6366F1' },
  { nombre: 'Au³⁺/Au', formula: 'Au³⁺ + 3e⁻ → Au',      potencial: +1.50, color: '#8B5CF6' },
];

// ─────────────────────────────────────────────
// Datos: Comparativa baterías
// ─────────────────────────────────────────────

interface TecnologiaBateria {
  nombre: string;
  voltaje: string;
  densidadE: string;
  ciclos: string;
  seguridad: string;
  uso: string;
}

const TECNOLOGIAS_BATERIA: TecnologiaBateria[] = [
  { nombre: 'Li-ion (LCO)', voltaje: '3,6 V', densidadE: '150-200 Wh/kg', ciclos: '300-500', seguridad: 'Media', uso: 'Móviles, portátiles' },
  { nombre: 'Li-Po',        voltaje: '3,7 V', densidadE: '130-200 Wh/kg', ciclos: '300-500', seguridad: 'Media-Alta', uso: 'Drones, wearables' },
  { nombre: 'LiFePO₄',     voltaje: '3,2 V', densidadE: '90-160 Wh/kg',  ciclos: '2.000+', seguridad: 'Alta',      uso: 'Vehículos eléctricos' },
  { nombre: 'Estado sólido', voltaje: '3,8 V', densidadE: '300-500 Wh/kg', ciclos: '1.000+', seguridad: 'Muy alta', uso: 'Próxima generación' },
];

// ─────────────────────────────────────────────
// Sección 1: Pila galvánica de Daniell (SVG)
// ─────────────────────────────────────────────

const PilaDaniellSvg = ({ cargaConectada }: { cargaConectada: boolean }) => (
  <svg
    viewBox="0 0 520 300"
    className={styles.pilaSvg}
    aria-label="Pila galvánica de Daniell: ánodo de zinc y cátodo de cobre conectados por puente salino"
  >
    {/* Fondo */}
    <rect x="0" y="0" width="520" height="300" fill="transparent" />

    {/* ── Semielda ÁNODO (Zn / ZnSO₄) ── */}
    <rect x="20" y="80" width="160" height="160" rx="8" fill="#EFF6FF" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Solución ZnSO₄ (azul pálido) */}
    <rect x="25" y="130" width="150" height="105" rx="4" fill="#BFDBFE" opacity="0.6" />
    {/* Electrodo Zn */}
    <rect x="80" y="85" width="18" height="140" rx="4" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
    <text x="89" y="78" fontSize="11" fontWeight="700" fill="#374151" textAnchor="middle">Zn</text>
    {/* Iones Zn²⁺ aparecen */}
    <text x="50" y="170" fontSize="10" fill="#1D4ED8" opacity="0.8">Zn²⁺</text>
    <text x="120" y="200" fontSize="10" fill="#1D4ED8" opacity="0.6">Zn²⁺</text>
    {/* Label ánodo */}
    <text x="100" y="258" fontSize="12" fontWeight="700" fill="#EF4444" textAnchor="middle">ÁNODO (−)</text>
    <text x="100" y="272" fontSize="9" fill="#6B7280" textAnchor="middle">Zn → Zn²⁺ + 2e⁻</text>
    <text x="100" y="284" fontSize="9" fill="#6B7280" textAnchor="middle">E° = −0,76 V</text>

    {/* ── Semicelda CÁTODO (Cu / CuSO₄) ── */}
    <rect x="340" y="80" width="160" height="160" rx="8" fill="#FFF7ED" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Solución CuSO₄ (azul verdoso) */}
    <rect x="345" y="130" width="150" height="105" rx="4" fill="#A5F3FC" opacity="0.5" />
    {/* Electrodo Cu */}
    <rect x="420" y="85" width="18" height="140" rx="4" fill="#B45309" stroke="#92400E" strokeWidth="1" />
    <text x="429" y="78" fontSize="11" fontWeight="700" fill="#374151" textAnchor="middle">Cu</text>
    {/* Iones Cu²⁺ se depositan */}
    <text x="360" y="170" fontSize="10" fill="#0369A1" opacity="0.8">Cu²⁺</text>
    <text x="380" y="205" fontSize="10" fill="#0369A1" opacity="0.6">Cu²⁺</text>
    {/* Label cátodo */}
    <text x="420" y="258" fontSize="12" fontWeight="700" fill="#3B82F6" textAnchor="middle">CÁTODO (+)</text>
    <text x="420" y="272" fontSize="9" fill="#6B7280" textAnchor="middle">Cu²⁺ + 2e⁻ → Cu</text>
    <text x="420" y="284" fontSize="9" fill="#6B7280" textAnchor="middle">E° = +0,34 V</text>

    {/* ── Puente salino (KCl) ── */}
    <rect x="180" y="80" width="160" height="40" rx="8" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5" />
    <text x="260" y="97" fontSize="11" fontWeight="700" fill="#15803D" textAnchor="middle">Puente salino</text>
    <text x="260" y="112" fontSize="9" fill="#16A34A" textAnchor="middle">KCl(aq)</text>
    {/* Iones en puente */}
    <circle className={styles.ionKPlus} cx="220" cy="100" r="8" fill="#FBBF24" opacity="0.9" />
    <text className={styles.ionKPlus} x="220" y="104" fontSize="8" fill="#78350F" textAnchor="middle" fontWeight="700">K⁺</text>
    <circle className={styles.ionClMenos} cx="300" cy="100" r="8" fill="#A78BFA" opacity="0.9" />
    <text className={styles.ionClMenos} x="300" y="104" fontSize="8" fill="#4C1D95" textAnchor="middle" fontWeight="700">Cl⁻</text>

    {/* ── Cable externo ── */}
    {/* Desde ánodo Zn arriba */}
    <line x1="89" y1="85" x2="89" y2="40" stroke="#374151" strokeWidth="2.5" />
    {/* Tramo horizontal izquierdo */}
    <line x1="89" y1="40" x2="200" y2="40" stroke="#374151" strokeWidth="2.5" />
    {/* Bombilla / carga */}
    {cargaConectada ? (
      <>
        {/* Bombilla encendida */}
        <circle cx="260" cy="40" r="16" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
        <text x="260" y="46" fontSize="14" textAnchor="middle">💡</text>
        {/* Línea derecha */}
        <line x1="276" y1="40" x2="429" y2="40" stroke="#374151" strokeWidth="2.5" />
      </>
    ) : (
      <>
        {/* Circuito abierto */}
        <circle cx="260" cy="40" r="14" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
        <text x="260" y="44" fontSize="11" fill="#94A3B8" textAnchor="middle">○</text>
        <line x1="274" y1="40" x2="390" y2="40" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="6 4" />
        <line x1="400" y1="40" x2="429" y2="40" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="6 4" />
      </>
    )}
    {/* Desde cátodo Cu arriba */}
    <line x1="429" y1="85" x2="429" y2="40" stroke="#374151" strokeWidth="2.5" />

    {/* Electrones fluyendo (solo si carga conectada) */}
    {cargaConectada && (
      <>
        {/* Línea animada sobre el cable */}
        <path
          d="M89,40 L260,40 L429,40"
          className={styles.electronesPath}
          strokeLinecap="round"
        />
        <text x="170" y="28" fontSize="9" fill="#F59E0B" fontWeight="700" textAnchor="middle">e⁻ →</text>
        <text x="350" y="28" fontSize="9" fill="#F59E0B" fontWeight="700" textAnchor="middle">e⁻ →</text>
      </>
    )}

    {/* Label soluciones */}
    <text x="100" y="145" fontSize="9" fill="#1D4ED8" textAnchor="middle">ZnSO₄(aq)</text>
    <text x="420" y="145" fontSize="9" fill="#0369A1" textAnchor="middle">CuSO₄(aq)</text>
  </svg>
);

const SeccionPila = () => {
  const [cargaConectada, setCargaConectada] = useState(true);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La <strong>pila de Daniell (1836)</strong> fue la primera pila eléctrica práctica y fiable.
          Convierte energía química en eléctrica mediante reacciones redox espontáneas en dos semiceldas.
        </p>
      </div>

      <div className={styles.pilaContainer}>
        <h3 className={styles.pilaTitulo}>Celda galvánica de Daniell</h3>
        <p className={styles.pilaFormula}>Zn(s) | ZnSO₄(aq) ‖ CuSO₄(aq) | Cu(s)</p>

        {/* Toggle carga */}
        <div className={styles.bombillaToggle}>
          <span className={styles.toggleLabel}>Carga conectada</span>
          <label className={styles.toggleSwitch} aria-label="Conectar o desconectar la carga">
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={cargaConectada}
              onChange={e => setCargaConectada(e.target.checked)}
            />
            <span className={styles.toggleSlider} />
          </label>
          <span className={styles.toggleLabel}>{cargaConectada ? '💡 Encendido' : '○ Abierto'}</span>
        </div>

        <div className={styles.pilaSvgWrapper}>
          <PilaDaniellSvg cargaConectada={cargaConectada} />
        </div>

        {/* FEM y reacciones */}
        <div className={styles.pilaFem}>
          <p className={styles.pilaFemFormula}>E°celda = E°cátodo − E°ánodo</p>
          <p className={styles.pilaFemValor}>+1,10 V</p>
          <p className={styles.pilaFemNota}>= (+0,34 V) − (−0,76 V) = +1,10 V</p>
        </div>
        <div className={styles.pilaReacciones}>
          <div className={`${styles.pilaReaccion} ${styles.pilaAnodo}`}>
            <p className={styles.pilaReaccionLabel}>Ánodo — Oxidación</p>
            <p className={styles.pilaReaccionFormula}>Zn → Zn²⁺ + 2e⁻</p>
            <p className={styles.pilaReaccionPot}>E° = −0,76 V</p>
          </div>
          <div className={`${styles.pilaReaccion} ${styles.pilaCatodo}`}>
            <p className={styles.pilaReaccionLabel}>Cátodo — Reducción</p>
            <p className={styles.pilaReaccionFormula}>Cu²⁺ + 2e⁻ → Cu</p>
            <p className={styles.pilaReaccionPot}>E° = +0,34 V</p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El <strong>puente salino</strong> (KCl) es clave: mantiene la neutralidad eléctrica de cada solución.
          Los iones K⁺ migran al cátodo y los Cl⁻ al ánodo, cerrando el circuito interno sin mezclar las soluciones.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sección 2: Serie electroquímica
// ─────────────────────────────────────────────

const SeccionSerie = () => {
  const [selA, setSelA] = useState<number | null>(5); // Zn por defecto
  const [selB, setSelB] = useState<number | null>(8); // Cu por defecto

  // Min y max para escala de barras
  const minPot = -3.04;
  const maxPot = +1.50;
  const rango = maxPot - minPot;

  const calcularFem = () => {
    if (selA === null || selB === null) return null;
    const pA = SERIE_REDOX[selA].potencial;
    const pB = SERIE_REDOX[selB].potencial;
    // El de menor potencial es ánodo
    const anodo = pA <= pB ? selA : selB;
    const catodo = pA <= pB ? selB : selA;
    const fem = SERIE_REDOX[catodo].potencial - SERIE_REDOX[anodo].potencial;
    return { anodo, catodo, fem };
  };

  const resultado = calcularFem();

  const handleClick = (idx: number) => {
    if (selA === idx) { setSelA(null); return; }
    if (selB === idx) { setSelB(null); return; }
    if (selA === null) { setSelA(idx); return; }
    if (selB === null) { setSelB(idx); return; }
    // Reemplazar A si ambos están seleccionados
    setSelA(idx);
  };

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La <strong>serie electroquímica</strong> ordena los pares redox por su potencial de reducción estándar (E°)
          respecto al electrodo estándar de hidrógeno (SHE = 0,00 V). Selecciona dos pares para calcular la FEM.
        </p>
      </div>

      <div className={styles.serieContainer}>
        <h3 className={styles.serieTitulo}>Potenciales de reducción estándar (25 °C, 1 M, 1 atm)</h3>
        <p className={styles.serieInstruccion}>Haz clic en dos pares para calcular la pila resultante</p>

        <div className={styles.serieLista}>
          {SERIE_REDOX.map((par, idx) => {
            const porcentajeBarra = ((par.potencial - minPot) / rango) * 100;
            const esSelA = selA === idx;
            const esSelB = selB === idx;
            return (
              <button
                key={idx}
                type="button"
                className={`${styles.serieItem} ${esSelA ? styles.serieItemSelA : ''} ${esSelB ? styles.serieItemSelB : ''}`}
                onClick={() => handleClick(idx)}
                aria-pressed={esSelA || esSelB}
                aria-label={`${par.nombre}, potencial ${par.potencial} V`}
              >
                <span className={styles.serieParNombre}>{par.nombre}</span>
                <div className={styles.serieBarraWrap}>
                  <div
                    className={styles.serieBarra}
                    style={{ width: `${Math.max(porcentajeBarra, 3)}%`, background: par.color }}
                  />
                </div>
                <span className={`${styles.seriePot} ${par.potencial >= 0 ? styles.seriePotPos : styles.seriePotNeg}`}>
                  {par.potencial >= 0 ? '+' : ''}{par.potencial.toFixed(2)} V
                </span>
              </button>
            );
          })}
          <div className={styles.serieItem} style={{ cursor: 'default', opacity: 0.6 }}>
            <span className={styles.serieParNombre}>{SERIE_REDOX[7].nombre}</span>
            <div className={styles.serieBarraWrap}>
              <div className={styles.serieBarra} style={{ width: `${((0 - minPot) / rango) * 100}%`, background: '#94A3B8' }} />
            </div>
            <span className={`${styles.seriePot} ${styles.serieRef}`}>Referencia (0,00 V)</span>
          </div>
        </div>

        {resultado && selA !== null && selB !== null && (
          <div className={styles.serieResultado} role="status" aria-live="polite" aria-atomic="true">
            <p className={styles.serieResultadoTitulo}>Pila resultante</p>
            <div className={styles.serieResultadoGrid}>
              <div className={`${styles.serieResultadoItem} ${styles.serieResultadoAnodo}`}>
                <p className={styles.serieResultadoRol}>Ánodo (−) · Oxidación</p>
                <p className={styles.serieResultadoPar}>{SERIE_REDOX[resultado.anodo].nombre}</p>
                <p className={styles.serieResultadoPot}>E° = {SERIE_REDOX[resultado.anodo].potencial.toFixed(2)} V</p>
              </div>
              <div className={`${styles.serieResultadoItem} ${styles.serieResultadoCatodo}`}>
                <p className={styles.serieResultadoRol}>Cátodo (+) · Reducción</p>
                <p className={styles.serieResultadoPar}>{SERIE_REDOX[resultado.catodo].nombre}</p>
                <p className={styles.serieResultadoPot}>E° = +{SERIE_REDOX[resultado.catodo].potencial.toFixed(2)} V</p>
              </div>
            </div>
            <div className={styles.serieFemFinal}>
              <p className={styles.serieFemFormula}>
                E°celda = {SERIE_REDOX[resultado.catodo].potencial.toFixed(2)} − ({SERIE_REDOX[resultado.anodo].potencial.toFixed(2)}) =
              </p>
              <p className={`${styles.serieFemValor} ${resultado.fem > 0 ? styles.serieFemPos : styles.serieFemNeg}`}>
                {resultado.fem > 0 ? '+' : ''}{resultado.fem.toFixed(2)} V
              </p>
              <p className={`${styles.serieEspontaneo} ${resultado.fem > 0 ? styles.serieFemPos : styles.serieFemNeg}`}>
                {resultado.fem > 0 ? '✅ Reacción espontánea (ΔG < 0)' : '❌ No espontánea (requiere energía externa)'}
              </p>
            </div>
            <p className={styles.serieMnemonico}>
              💡 <strong>Regla:</strong> el metal con E° más negativo se oxida (ánodo). El de E° más positivo se reduce (cátodo). FEM &gt; 0 → reacción espontánea.
            </p>
          </div>
        )}
      </div>

      <div className={styles.insight}>
        <p>
          El <strong>oro (Au)</strong> tiene el potencial más positivo (+1,50 V) — es el metal menos reactivo,
          nunca se oxida espontáneamente. El <strong>litio (Li)</strong> tiene el más negativo (−3,04 V) —
          extremadamente reactivo, por eso es tan energético en baterías.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sección 3: Electrólisis
// ─────────────────────────────────────────────

const ElectrolisisSvg = ({ voltaje }: { voltaje: number }) => {
  const burbujasActivas = voltaje >= 1.23;
  return (
    <svg
      viewBox="0 0 400 260"
      className={styles.electrolisisSvg}
      aria-label="Electrólisis del agua: electrodos sumergidos generando burbujas de H₂ y O₂"
    >
      {/* Fuente de corriente */}
      <rect x="150" y="10" width="100" height="40" rx="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
      <text x="200" y="28" fontSize="10" fontWeight="700" fill="#374151" textAnchor="middle">Fuente CC</text>
      <text x="200" y="42" fontSize="9" fill="#6B7280" textAnchor="middle">{voltaje.toFixed(1)} V</text>
      {/* Cables */}
      <line x1="150" y1="30" x2="100" y2="30" stroke="#374151" strokeWidth="2" />
      <line x1="100" y1="30" x2="100" y2="80" stroke="#374151" strokeWidth="2" />
      <line x1="250" y1="30" x2="300" y2="30" stroke="#374151" strokeWidth="2" />
      <line x1="300" y1="30" x2="300" y2="80" stroke="#374151" strokeWidth="2" />
      {/* Labels +/- */}
      <text x="285" y="27" fontSize="12" fontWeight="900" fill="#3B82F6">+</text>
      <text x="108" y="27" fontSize="12" fontWeight="900" fill="#EF4444">−</text>

      {/* Cubeta con agua */}
      <rect x="50" y="80" width="300" height="150" rx="6" fill="#BFDBFE" opacity="0.5" stroke="#93C5FD" strokeWidth="1.5" />
      {/* Texto agua */}
      <text x="200" y="230" fontSize="10" fill="#1D4ED8" textAnchor="middle">H₂O(l) + H₂SO₄(aq)</text>

      {/* Cátodo (−) — izquierda → H₂ */}
      <rect x="90" y="80" width="16" height="130" rx="4" fill="#6B7280" stroke="#374151" strokeWidth="1" />
      <text x="98" y="76" fontSize="10" fontWeight="700" fill="#EF4444" textAnchor="middle">Cátodo (−)</text>
      <text x="98" y="224" fontSize="9" fill="#374151" textAnchor="middle">H₂</text>
      {/* Burbujas H₂ */}
      {burbujasActivas && (
        <>
          <circle className={styles.burbujaH2}  cx="85"  cy="140" r="5" fill="white" stroke="#93C5FD" strokeWidth="1" opacity="0.9" />
          <circle className={styles.burbujaH2b} cx="108" cy="160" r="4" fill="white" stroke="#93C5FD" strokeWidth="1" opacity="0.8" />
          <circle className={styles.burbujaH2}  cx="92"  cy="180" r="3" fill="white" stroke="#93C5FD" strokeWidth="1" opacity="0.85" />
          <circle className={styles.burbujaH2b} cx="80"  cy="170" r="4" fill="white" stroke="#93C5FD" strokeWidth="1" opacity="0.7" />
        </>
      )}

      {/* Ánodo (+) — derecha → O₂ */}
      <rect x="294" y="80" width="16" height="130" rx="4" fill="#B45309" stroke="#92400E" strokeWidth="1" />
      <text x="302" y="76" fontSize="10" fontWeight="700" fill="#3B82F6" textAnchor="middle">Ánodo (+)</text>
      <text x="302" y="224" fontSize="9" fill="#374151" textAnchor="middle">O₂</text>
      {/* Burbujas O₂ (menos, relación 1:2) */}
      {burbujasActivas && (
        <>
          <circle className={styles.burbujaO2} cx="290" cy="150" r="6" fill="white" stroke="#FCA5A5" strokeWidth="1" opacity="0.9" />
          <circle className={styles.burbujaO2} cx="312" cy="175" r="5" fill="white" stroke="#FCA5A5" strokeWidth="1" opacity="0.75" />
        </>
      )}

      {/* Relación volúmenes */}
      {burbujasActivas && (
        <>
          <text x="98" y="100" fontSize="9" fill="#1D4ED8" textAnchor="middle" fontWeight="700">2 vol H₂</text>
          <text x="302" y="100" fontSize="9" fill="#DC2626" textAnchor="middle" fontWeight="700">1 vol O₂</text>
        </>
      )}
      {!burbujasActivas && (
        <text x="200" y="155" fontSize="11" fill="#EF4444" textAnchor="middle" fontWeight="600">
          Voltaje insuficiente (&lt; 1,23 V teórico)
        </text>
      )}
    </svg>
  );
};

const SeccionElectrolisis = () => {
  const [tab, setTab] = useState<'agua' | 'electroplating'>('agua');
  const [voltaje, setVoltaje] = useState(2.0);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La <strong>electrólisis</strong> usa electricidad para forzar reacciones químicas no espontáneas.
          Es el proceso inverso a la pila galvánica: en vez de producir electricidad, la consume para transformar materia.
        </p>
      </div>

      <div className={styles.electrolisisContainer}>
        <h3 className={styles.electrolisisTitulo}>Electrólisis</h3>

        <div className={styles.electrolisisTabs}>
          {[
            { id: 'agua', label: '💧 Agua → H₂ + O₂' },
            { id: 'electroplating', label: '🔩 Electrodeposición' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              className={`${styles.electroTab} ${tab === t.id ? styles.electroTabActivo : ''}`}
              onClick={() => setTab(t.id as 'agua' | 'electroplating')}
              aria-pressed={tab === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'agua' && (
          <>
            <p className={styles.electrolisisFormula}>2H₂O(l) → 2H₂(g) + O₂(g)</p>
            <div className={styles.electrolisisSvgWrapper}>
              <ElectrolisisSvg voltaje={voltaje} />
            </div>
            <div className={styles.voltajeSliderWrap}>
              <p className={styles.voltajeLabel}>
                <span>Voltaje aplicado</span>
                <span className={styles.voltajeValor}>{voltaje.toFixed(1)} V</span>
              </p>
              <input
                type="range"
                className={styles.voltajeSlider}
                min="0.5"
                max="3.0"
                step="0.1"
                value={voltaje}
                onChange={e => setVoltaje(parseFloat(e.target.value))}
                aria-label="Ajustar voltaje de electrólisis"
              />
              <p className={`${styles.voltajeInfo} ${voltaje >= 1.8 ? styles.voltajeOk : styles.voltajeBajo}`}>
                {voltaje < 1.23
                  ? '❌ Imposible: por debajo del potencial mínimo teórico (1,23 V)'
                  : voltaje < 1.8
                  ? '⚠️ Posible teóricamente, pero ineficiente. La práctica necesita ~1,8-2,0 V'
                  : '✅ Electrólisis activa. Las burbujas de H₂ y O₂ se generan eficientemente.'}
              </p>
            </div>
          </>
        )}

        {tab === 'electroplating' && (
          <div className={styles.electroplatingInfo}>
            <h4 className={styles.electroplatingTitulo}>Electrodeposición (electroplating)</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Proceso para depositar una capa metálica sobre un objeto. El objeto a recubrir es el <strong>cátodo</strong>;
              el metal fuente, el <strong>ánodo</strong>. Los iones metálicos viajan por el electrolito y se depositan en el cátodo.
            </p>
            <div className={styles.electroplatingGrid}>
              {[
                { metal: 'Cromado', uso: 'Parachoques, grifería' },
                { metal: 'Niquelado', uso: 'Monedas, herramientas' },
                { metal: 'Dorado', uso: 'Joyería, electrónica' },
                { metal: 'Plateado', uso: 'Cubiertos, decoración' },
                { metal: 'Galvanizado (Zn)', uso: 'Acero anticorrosión' },
                { metal: 'Cobreado', uso: 'PCBs, conectores' },
              ].map((item, i) => (
                <div key={i} className={styles.electroplatingItem}>
                  <p className={styles.electroplatingMetal}>{item.metal}</p>
                  <p className={styles.electroplatingUso}>{item.uso}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.insight}>
        <p>
          El <strong>hidrógeno verde</strong> se produce por electrólisis del agua usando electricidad renovable.
          El reto: el sobrepotencial (diferencia entre 1,23 V teórico y ~2 V real) reduce la eficiencia al 60-80 %.
          Los electrocatalizadores de platino o iridio reducen esa pérdida.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sección 4: Batería Li-ion
// ─────────────────────────────────────────────

const BateriaLiionSvg = ({ modoDescarga }: { modoDescarga: boolean }) => (
  <svg
    viewBox="0 0 480 240"
    className={styles.bateriaSvg}
    aria-label={`Batería Li-ion en modo ${modoDescarga ? 'descarga' : 'carga'}: iones Li⁺ viajando por el electrolito`}
  >
    {/* Fondo */}
    <rect x="0" y="0" width="480" height="240" fill="transparent" />

    {/* ── Ánodo grafito ── */}
    <rect x="30" y="30" width="120" height="180" rx="8" fill="#374151" opacity="0.85" />
    <text x="90" y="20" fontSize="11" fontWeight="700" fill="#9CA3AF" textAnchor="middle">Ánodo</text>
    <text x="90" y="195" fontSize="9" fill="#D1D5DB" textAnchor="middle">Grafito</text>
    <text x="90" y="207" fontSize="8" fill="#9CA3AF" textAnchor="middle">(C₆LiₓC₆)</text>
    {/* Capas de grafito */}
    {[50, 72, 94, 116, 138, 160].map((y, i) => (
      <line key={i} x1="40" y1={y} x2="140" y2={y} stroke="#6B7280" strokeWidth="1.5" />
    ))}
    {/* Iones Li intercalados en grafito */}
    {modoDescarga && [55, 99, 143].map((y, i) => (
      <circle key={i} cx="90" cy={y} r="6" fill="#EAB308" opacity="0.8" />
    ))}
    {!modoDescarga && [55].map((y, i) => (
      <circle key={i} cx="90" cy={y} r="6" fill="#EAB308" opacity="0.5" />
    ))}

    {/* ── Electrolito ── */}
    <rect x="160" y="30" width="160" height="180" rx="4" fill="#ECFDF5" opacity="0.7" stroke="#86EFAC" strokeWidth="1" />
    <text x="240" y="20" fontSize="11" fontWeight="700" fill="#15803D" textAnchor="middle">Electrolito</text>
    <text x="240" y="207" fontSize="8" fill="#16A34A" textAnchor="middle">LiPF₆ en carbonato</text>
    <text x="240" y="198" fontSize="8" fill="#16A34A" textAnchor="middle">Separador poroso</text>

    {/* Iones Li⁺ moviéndose */}
    {[70, 110, 155].map((y, i) => (
      <g key={i} className={modoDescarga ? styles.ionLi : styles.ionLiCarga}
        style={{ animationDelay: `${i * 0.65}s` }}>
        <circle cx="240" cy={y} r="9" fill="#EAB308" opacity="0.85" />
        <text x="240" y={y + 4} fontSize="8" fill="#78350F" fontWeight="700" textAnchor="middle">Li⁺</text>
      </g>
    ))}

    {/* Flecha dirección iones */}
    <text x="240" y="215" fontSize="9" fill="#16A34A" textAnchor="middle" fontWeight="600">
      {modoDescarga ? 'Li⁺ →' : '← Li⁺'}
    </text>

    {/* ── Cátodo LiCoO₂ ── */}
    <rect x="330" y="30" width="120" height="180" rx="8" fill="#1E3A5F" opacity="0.85" />
    <text x="390" y="20" fontSize="11" fontWeight="700" fill="#93C5FD" textAnchor="middle">Cátodo</text>
    <text x="390" y="195" fontSize="9" fill="#BFDBFE" textAnchor="middle">LiCoO₂</text>
    <text x="390" y="207" fontSize="8" fill="#93C5FD" textAnchor="middle">(Óxido cobalto)</text>
    {/* Capas cátodo */}
    {[50, 72, 94, 116, 138, 160].map((y, i) => (
      <line key={i} x1="340" y1={y} x2="440" y2={y} stroke="#3B82F6" strokeWidth="1.5" />
    ))}
    {/* Iones en cátodo */}
    {modoDescarga && [55].map((y, i) => (
      <circle key={i} cx="390" cy={y} r="6" fill="#EAB308" opacity="0.5" />
    ))}
    {!modoDescarga && [55, 99, 143].map((y, i) => (
      <circle key={i} cx="390" cy={y} r="6" fill="#EAB308" opacity="0.8" />
    ))}

    {/* Circuito externo */}
    <text x="240" y="238" fontSize="9" fill="#6B7280" textAnchor="middle">
      {modoDescarga ? '⚡ Descarga: e⁻ fluyen ánodo → cátodo (circuito externo)' : '🔌 Carga: e⁻ forzados cátodo → ánodo'}
    </text>
  </svg>
);

const SeccionBateria = () => {
  const [modoDescarga, setModoDescarga] = useState(true);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Las baterías de <strong>litio-ion</strong> funcionan por intercalación reversible de iones Li⁺
          entre dos electrodos. Durante la descarga, el Li⁺ va del ánodo al cátodo; al cargar, vuelve.
        </p>
      </div>

      <div className={styles.bateriaContainer}>
        <h3 className={styles.bateriaTitulo}>Mecanismo de batería Li-ion</h3>

        <div className={styles.bateriaToggle}>
          <button
            type="button"
            className={`${styles.bateriaBtn} ${modoDescarga ? styles.bateriaBtnActivo : ''}`}
            onClick={() => setModoDescarga(true)}
            aria-pressed={modoDescarga}
          >
            ⚡ Descarga
          </button>
          <button
            type="button"
            className={`${styles.bateriaBtn} ${!modoDescarga ? styles.bateriaBtnActivo : ''}`}
            onClick={() => setModoDescarga(false)}
            aria-pressed={!modoDescarga}
          >
            🔌 Carga
          </button>
        </div>

        <div className={styles.bateriaSvgWrapper}>
          <BateriaLiionSvg modoDescarga={modoDescarga} />
        </div>

        <div className={styles.bateriaVoltaje}>
          <p className={styles.bateriaVoltajeValor}>~3,7 V</p>
          <p className={styles.bateriaVoltajeLabel}>Tensión nominal de celda Li-ion</p>
        </div>

        <div className={styles.bateriaComparativa}>
          <table className={styles.bateriaTabla}>
            <thead>
              <tr>
                <th>Tecnología</th>
                <th>Voltaje</th>
                <th>Densidad E.</th>
                <th>Ciclos</th>
                <th>Seguridad</th>
                <th>Uso típico</th>
              </tr>
            </thead>
            <tbody>
              {TECNOLOGIAS_BATERIA.map((t, i) => (
                <tr key={i}>
                  <td className={styles.bateriaTecnologia}>{t.nombre}</td>
                  <td>{t.voltaje}</td>
                  <td>{t.densidadE}</td>
                  <td>{t.ciclos}</td>
                  <td>{t.seguridad}</td>
                  <td>{t.uso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El voltaje de ~3,7 V viene del potencial de Li vs carbono grafito.
          La <strong>batería de estado sólido</strong> (próxima generación) sustituye el electrolito líquido por
          un sólido cerámico, duplicando la densidad energética y eliminando el riesgo de inflamación.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorElectroquimicaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('pila');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'pila':        return <SeccionPila />;
      case 'serie':       return <SeccionSerie />;
      case 'electrolisis': return <SeccionElectrolisis />;
      case 'bateria':     return <SeccionBateria />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Electroquímica</h1>
          <p className={styles.subtitle}>Pilas, electrólisis y baterías — cómo la química y la electricidad se convierten mutuamente</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador de electroquímica">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}
          </p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Electroquímica: Cuando la Química Genera Electricidad"
          subtitle="Pilas, electrólisis y baterías — la química que mueve el mundo moderno"
          defaultOpen={false}
        >
          <h3>¿Qué es una reacción redox?</h3>
          <p>
            Las reacciones de <strong>oxidación-reducción</strong> implican transferencia de electrones.
            La oxidación (pérdida de electrones) y la reducción (ganancia de electrones) siempre ocurren juntas:
            lo que uno pierde, otro lo gana. El agente oxidante se reduce; el agente reductor se oxida.
            Mnemotécnica: <em>OIL RIG</em> (Oxidation Is Loss, Reduction Is Gain).
          </p>

          <h3>Alessandro Volta y la primera pila (1800)</h3>
          <p>
            Volta apilando discos de zinc y cobre separados por paños húmedos con salmuera creó la
            primera fuente de corriente continua estable. La unidad de potencial eléctrico (voltio) lleva su nombre.
            Su descubrimiento refutó la teoría de la electricidad animal de Galvani y abrió la era de la electroquímica.
          </p>

          <h3>Pilas de combustible de hidrógeno</h3>
          <p>
            Una celda de combustible combina H₂ y O₂ para producir electricidad, agua y calor.
            Ánodo: H₂ → 2H⁺ + 2e⁻. Cátodo: ½O₂ + 2H⁺ + 2e⁻ → H₂O.
            Eficiencia teórica ~83 %, en la práctica 50-60 %.
            Sin emisiones locales y recarga en minutos, pero el almacenamiento de H₂ sigue siendo el reto principal.
          </p>

          <h3>La ecuación de Nernst: FEM en condiciones no estándar</h3>
          <p>
            El potencial estándar E° se mide a 25 °C, 1 M y 1 atm. En condiciones reales, la FEM depende
            de las concentraciones. La ecuación de Nernst: <em>E = E° − (RT/nF) × ln(Q)</em>.
            A medida que la pila se descarga, las concentraciones cambian y la FEM cae.
            Por eso las pilas pierden potencia con el uso.
          </p>

          <h3>Corrosión electroquímica: por qué se oxida el hierro</h3>
          <p>
            La corrosión es una pila galvánica espontánea. El hierro (E° = −0,44 V) actúa de ánodo:
            Fe → Fe²⁺ + 2e⁻. El oxígeno disuelto en agua actúa de cátodo: O₂ + H₂O + 4e⁻ → 4OH⁻.
            El agua salada acelera la corrosión al mejorar la conductividad del electrolito.
            El oro no se oxida porque su E° (+1,50 V) es demasiado positivo para ceder electrones espontáneamente.
          </p>

          <h3>Baterías de estado sólido: la próxima revolución</h3>
          <p>
            Las baterías de estado sólido reemplazan el electrolito líquido (LiPF₆ en carbonato) por un
            sólido cerámico o vítreo. Ventajas: mayor densidad energética (300-500 Wh/kg), sin inflamabilidad,
            más ciclos y posibilidad de usar ánodo de litio metálico puro.
            El reto: la resistencia de interfaz sólido-sólido y el coste de fabricación.
            Toyota, QuantumScape y CATL están en carrera para comercializarlas en 2026-2030.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota sobre el sobrepotencial:</strong> La electrólisis del agua requiere mínimo 1,23 V
            en teoría, pero en la práctica necesita 1,8-2,0 V por las sobretensiones (overpotential) en
            cada electrodo. Esta diferencia es uno de los mayores retos de la economía del hidrógeno verde:
            reducir el sobrepotencial con mejores electrocatalizadores (platino, iridio, níquel-hierro)
            puede mejorar la eficiencia del proceso en varios puntos porcentuales.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-electroquimica')} />
        <ShareCard appName="visualizador-electroquimica" />
        <Footer appName="visualizador-electroquimica" />
  </div>
  );
}
