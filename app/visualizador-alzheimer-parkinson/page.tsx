'use client';

import { useState } from 'react';
import styles from './AlzheimerParkinson.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Enfermedad = 'alzheimer' | 'parkinson';

// ─────────────────────────────────────────────
// SVG Alzheimer: Procesamiento APP
// ─────────────────────────────────────────────

function SvgProcesamientoAPP() {
  const [viaActiva, setViaActiva] = useState<'normal' | 'amiloidogenica' | null>(null);

  return (
    <div className={styles.svgZona}>
      <div className={styles.svgLeyenda}>
        <button
          type="button"
          className={`${styles.svgLeyendaBtn} ${viaActiva === 'normal' ? styles.svgLeyendaBtnActivo : ''}`}
          style={{ borderColor: '#27ae60', background: viaActiva === 'normal' ? '#27ae60' : undefined, color: viaActiva === 'normal' ? '#fff' : undefined }}
          onClick={() => setViaActiva(viaActiva === 'normal' ? null : 'normal')}
          aria-pressed={viaActiva === 'normal'}
        >
          Vía no amiloidogénica (normal)
        </button>
        <button
          type="button"
          className={`${styles.svgLeyendaBtn} ${viaActiva === 'amiloidogenica' ? styles.svgLeyendaBtnActivo : ''}`}
          style={{ borderColor: '#e74c3c', background: viaActiva === 'amiloidogenica' ? '#e74c3c' : undefined, color: viaActiva === 'amiloidogenica' ? '#fff' : undefined }}
          onClick={() => setViaActiva(viaActiva === 'amiloidogenica' ? null : 'amiloidogenica')}
          aria-pressed={viaActiva === 'amiloidogenica'}
        >
          Vía amiloidogénica (patológica)
        </button>
      </div>

      <svg viewBox="0 0 720 380" className={styles.diagramaSvg} role="img" aria-label="Diagrama del procesamiento de la proteína APP: vía normal (alfa-secretasa) y vía patológica (beta-secretasa/BACE1) que genera péptido amiloide Aβ42">
        {/* Membrana plasmática */}
        <rect x="0" y="140" width="720" height="24" fill="#DDE8F0" rx="4" />
        <text x="10" y="130" fill="#5580A0" fontSize="11" fontWeight="600">Extracelular</text>
        <text x="10" y="190" fill="#5580A0" fontSize="11" fontWeight="600">Intracelular</text>

        {/* Proteína APP atravesando membrana */}
        <rect x="310" y="40" width="28" height="280" rx="6" fill="#7FB3D3" opacity="0.85" />
        <text x="324" y="32" textAnchor="middle" fill="#2E86AB" fontSize="12" fontWeight="700">APP</text>
        <text x="324" y="340" textAnchor="middle" fill="#2E86AB" fontSize="10">Proteína precursora</text>

        {/* Dominio Aβ resaltado dentro de APP */}
        <rect x="312" y="90" width="24" height="70" rx="4" fill="#e74c3c" opacity="0.5" />
        <text x="350" y="108" fill="#e74c3c" fontSize="10" fontWeight="600">Dom. Aβ</text>
        <line x1="344" y1="115" x2="336" y2="120" stroke="#e74c3c" strokeWidth="1.2" />

        {/* VÍA NORMAL (izquierda) */}
        <g opacity={viaActiva === 'amiloidogenica' ? 0.25 : 1}>
          {/* α-secretasa */}
          <ellipse cx="160" cy="126" rx="52" ry="22" fill="#27ae60" opacity="0.15" />
          <ellipse cx="160" cy="126" rx="52" ry="22" fill="none" stroke="#27ae60" strokeWidth="2" />
          <text x="160" y="122" textAnchor="middle" fill="#27ae60" fontSize="11" fontWeight="700">α-secretasa</text>
          <text x="160" y="135" textAnchor="middle" fill="#27ae60" fontSize="9">(dentro del dominio Aβ)</text>
          <line x1="212" y1="126" x2="308" y2="126" stroke="#27ae60" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrowGreen)" />

          {/* Fragmentos normales */}
          <rect x="20" y="50" width="100" height="36" rx="8" fill="#27ae60" opacity="0.15" />
          <rect x="20" y="50" width="100" height="36" rx="8" fill="none" stroke="#27ae60" strokeWidth="1.5" />
          <text x="70" y="65" textAnchor="middle" fill="#27ae60" fontSize="10" fontWeight="600">sAPPα</text>
          <text x="70" y="78" textAnchor="middle" fill="#27ae60" fontSize="9">soluble, no tóxico</text>

          <rect x="20" y="200" width="100" height="36" rx="8" fill="#27ae60" opacity="0.15" />
          <rect x="20" y="200" width="100" height="36" rx="8" fill="none" stroke="#27ae60" strokeWidth="1.5" />
          <text x="70" y="215" textAnchor="middle" fill="#27ae60" fontSize="10" fontWeight="600">CTFα → p3</text>
          <text x="70" y="228" textAnchor="middle" fill="#27ae60" fontSize="9">no forma agregados</text>

          <line x1="120" y1="68" x2="308" y2="100" stroke="#27ae60" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1="120" y1="218" x2="308" y2="188" stroke="#27ae60" strokeWidth="1.5" strokeDasharray="4,3" />

          <text x="145" y="285" textAnchor="middle" fill="#27ae60" fontSize="10" fontWeight="600">Resultado normal</text>
          <text x="145" y="298" textAnchor="middle" fill="#27ae60" fontSize="9">Fragmentos solubles</text>
          <text x="145" y="311" textAnchor="middle" fill="#27ae60" fontSize="9">sin agregación</text>
        </g>

        {/* VÍA PATOLÓGICA (derecha) */}
        <g opacity={viaActiva === 'normal' ? 0.25 : 1}>
          {/* β-secretasa BACE1 */}
          <ellipse cx="560" cy="110" rx="60" ry="22" fill="#e74c3c" opacity="0.12" />
          <ellipse cx="560" cy="110" rx="60" ry="22" fill="none" stroke="#e74c3c" strokeWidth="2" />
          <text x="560" y="106" textAnchor="middle" fill="#e74c3c" fontSize="11" fontWeight="700">β-secretasa (BACE1)</text>
          <text x="560" y="119" textAnchor="middle" fill="#e74c3c" fontSize="9">corta antes del dominio Aβ</text>
          <line x1="500" y1="110" x2="342" y2="110" stroke="#e74c3c" strokeWidth="2" strokeDasharray="5,3" />

          {/* sAPPβ */}
          <rect x="595" y="50" width="100" height="36" rx="8" fill="#e74c3c" opacity="0.12" />
          <rect x="595" y="50" width="100" height="36" rx="8" fill="none" stroke="#e74c3c" strokeWidth="1.5" />
          <text x="645" y="65" textAnchor="middle" fill="#e74c3c" fontSize="10" fontWeight="600">sAPPβ</text>
          <text x="645" y="78" textAnchor="middle" fill="#e74c3c" fontSize="9">fragmento extracel.</text>
          <line x1="620" y1="68" x2="562" y2="88" stroke="#e74c3c" strokeWidth="1.2" strokeDasharray="3,2" />

          {/* CTFβ → γ-secretasa */}
          <rect x="570" y="180" width="110" height="36" rx="8" fill="#e74c3c" opacity="0.12" />
          <rect x="570" y="180" width="110" height="36" rx="8" fill="none" stroke="#e74c3c" strokeWidth="1.5" />
          <text x="625" y="195" textAnchor="middle" fill="#e74c3c" fontSize="10" fontWeight="600">CTFβ</text>
          <text x="625" y="208" textAnchor="middle" fill="#e74c3c" fontSize="9">→ γ-secretasa actúa</text>
          <line x1="570" y1="198" x2="344" y2="170" stroke="#e74c3c" strokeWidth="1.5" strokeDasharray="4,3" />

          {/* Péptido Aβ42 */}
          <rect x="575" y="260" width="120" height="50" rx="8" fill="#e74c3c" opacity="0.18" />
          <rect x="575" y="260" width="120" height="50" rx="8" fill="none" stroke="#e74c3c" strokeWidth="2" />
          <text x="635" y="278" textAnchor="middle" fill="#c0392b" fontSize="11" fontWeight="700">Péptido Aβ42</text>
          <text x="635" y="292" textAnchor="middle" fill="#c0392b" fontSize="9">agrega extracelularmente</text>
          <text x="635" y="305" textAnchor="middle" fill="#c0392b" fontSize="9">→ placas amiloides</text>
          <line x1="635" y1="260" x2="580" y2="216" stroke="#e74c3c" strokeWidth="2" />
        </g>

        {/* Marcador flecha verde */}
        <defs>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#27ae60" />
          </marker>
        </defs>
      </svg>

      {viaActiva && (
        <div className={styles.svgDetalle} style={{ borderLeftColor: viaActiva === 'normal' ? '#27ae60' : '#e74c3c' }}>
          {viaActiva === 'normal' ? (
            <>
              <h4 className={styles.svgDetalleTitle} style={{ color: '#27ae60' }}>Vía no amiloidogénica (normal)</h4>
              <p>La <strong>α-secretasa</strong> corta la APP <em>dentro</em> del dominio Aβ, impidiendo físicamente que se forme el péptido amiloide. Los fragmentos resultantes (sAPPα y p3) son solubles y no tóxicos. Esta es la vía predominante en condiciones fisiológicas normales.</p>
            </>
          ) : (
            <>
              <h4 className={styles.svgDetalleTitle} style={{ color: '#e74c3c' }}>Vía amiloidogénica (patológica)</h4>
              <p>La <strong>β-secretasa (BACE1)</strong> corta la APP antes del dominio Aβ, generando un fragmento CTFβ. La <strong>γ-secretasa</strong> actúa sobre el CTFβ y libera el péptido Aβ42. Este péptido es hidrofóbico y tiende a agregar: monómeros → oligómeros → protofibrillas → <strong>placas amiloides extracelulares</strong>.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SVG Alzheimer: Tau normal vs hiperfosforilada
// ─────────────────────────────────────────────

function SvgTauNormal() {
  return (
    <svg viewBox="0 0 680 260" className={styles.diagramaSvg} role="img" aria-label="Comparación entre neurona normal con microtúbulos estables y Tau unida, frente a neurona con Tau hiperfosforilada, microtúbulos colapsados y ovillos intracelulares">
      {/* NORMAL */}
      <text x="170" y="20" textAnchor="middle" fill="#27ae60" fontSize="13" fontWeight="700">Tau NORMAL</text>
      <text x="170" y="35" textAnchor="middle" fill="#27ae60" fontSize="10">Microtúbulos estables → transporte axonal</text>

      {/* Axón normal */}
      <rect x="20" y="55" width="300" height="50" rx="25" fill="#DDE8F0" />
      {/* Microtúbulos */}
      {[50, 100, 150, 200, 250, 285].map((x) => (
        <rect key={x} x={x} y={60} width="8" height="40" rx="4" fill="#2E86AB" opacity="0.7" />
      ))}
      {/* Proteínas Tau (puentes) */}
      {[60, 110, 160, 210, 260].map((x) => (
        <line key={x} x1={x} y1={80} x2={x + 32} y2={80} stroke="#27ae60" strokeWidth="4" strokeLinecap="round" />
      ))}
      {/* Kinesina (motor) */}
      <ellipse cx="190" cy="63" rx="12" ry="8" fill="#f39c12" />
      <text x="190" y="67" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">K</text>
      <text x="190" y="54" textAnchor="middle" fill="#f39c12" fontSize="8">Kinesina</text>

      <text x="170" y="125" textAnchor="middle" fill="#27ae60" fontSize="10">Tau (verde) estabiliza microtúbulos (azul)</text>

      {/* PATOLÓGICO */}
      <text x="510" y="20" textAnchor="middle" fill="#e74c3c" fontSize="13" fontWeight="700">Tau HIPERFOSFORILADA</text>
      <text x="510" y="35" textAnchor="middle" fill="#e74c3c" fontSize="10">Microtúbulos colapsan → transporte bloqueado</text>

      {/* Axón patológico — microtúbulos desintegrados */}
      <rect x="360" y="55" width="300" height="50" rx="25" fill="#FDECEA" />
      {/* Microtúbulos fragmentados */}
      <rect x="385" y="62" width="8" height="16" rx="3" fill="#e74c3c" opacity="0.5" />
      <rect x="395" y="75" width="8" height="12" rx="3" fill="#e74c3c" opacity="0.4" />
      <rect x="430" y="60" width="8" height="20" rx="3" fill="#e74c3c" opacity="0.5" />
      <rect x="445" y="74" width="8" height="10" rx="3" fill="#e74c3c" opacity="0.4" />
      <rect x="490" y="63" width="8" height="14" rx="3" fill="#e74c3c" opacity="0.5" />
      <rect x="530" y="68" width="8" height="18" rx="3" fill="#e74c3c" opacity="0.5" />
      <rect x="560" y="61" width="8" height="12" rx="3" fill="#e74c3c" opacity="0.4" />
      <rect x="600" y="65" width="8" height="22" rx="3" fill="#e74c3c" opacity="0.5" />
      {/* Tau agrupada en ovillos */}
      <ellipse cx="468" cy="96" rx="30" ry="14" fill="#c0392b" opacity="0.7" />
      <text x="468" y="99" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">Ovillo NFT</text>

      <text x="510" y="125" textAnchor="middle" fill="#e74c3c" fontSize="10">Tau libre agrega en ovillos intracelulares (NFTs)</text>

      {/* Fosforilación */}
      <text x="510" y="160" textAnchor="middle" fill="#8e44ad" fontSize="11" fontWeight="600">Quinasas GSK-3β / CDK5</text>
      <text x="510" y="175" textAnchor="middle" fill="#8e44ad" fontSize="10">hiperfosforilan Tau en múltiples sitios</text>
      <text x="510" y="190" textAnchor="middle" fill="#8e44ad" fontSize="10">→ Tau pierde afinidad por microtúbulos</text>

      {/* Consecuencias */}
      <rect x="360" y="210" width="300" height="40" rx="8" fill="rgba(192,57,43,0.08)" stroke="#e74c3c" strokeWidth="1.5" />
      <text x="510" y="228" textAnchor="middle" fill="#c0392b" fontSize="10" fontWeight="600">Transporte axonal bloqueado</text>
      <text x="510" y="243" textAnchor="middle" fill="#c0392b" fontSize="9">→ neurona pierde conectividad → muerte celular</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG Alzheimer: Cascada amiloide
// ─────────────────────────────────────────────

function SvgCascadaAmiloidea() {
  const pasos = [
    { texto: 'Acumulación de Aβ', color: '#e74c3c', sub: 'Evento desencadenante (Hardy & Higgins, 1992)' },
    { texto: 'Activación de quinasas', color: '#c0392b', sub: 'GSK-3β, CDK5 hiperfosforilan Tau' },
    { texto: 'Ovillos neurofibrilares (NFTs)', color: '#8e44ad', sub: 'Tau agrega intracelularmente' },
    { texto: 'Pérdida sináptica', color: '#7d3c98', sub: 'Los oligómeros Aβ son los más tóxicos sinápticamente' },
    { texto: 'Muerte neuronal', color: '#6c3483', sub: 'Pérdida progresiva de neuronas corticales' },
  ];

  return (
    <svg viewBox="0 0 600 340" className={styles.diagramaSvg} role="img" aria-label="Diagrama de flujo de la hipótesis de la cascada amiloide: Aβ → quinasas → NFTs → pérdida sináptica → muerte neuronal">
      {pasos.map((paso, i) => (
        <g key={i}>
          <rect x="160" y={20 + i * 60} width="280" height="40" rx="10" fill={paso.color} opacity="0.15" />
          <rect x="160" y={20 + i * 60} width="280" height="40" rx="10" fill="none" stroke={paso.color} strokeWidth="2" />
          <text x="300" y={35 + i * 60} textAnchor="middle" fill={paso.color} fontSize="12" fontWeight="700">{paso.texto}</text>
          <text x="300" y={52 + i * 60} textAnchor="middle" fill={paso.color} fontSize="9">{paso.sub}</text>
          {i < pasos.length - 1 && (
            <>
              <line x1="300" y1={60 + i * 60} x2="300" y2={74 + i * 60} stroke={paso.color} strokeWidth="2" markerEnd={`url(#arrowCascade${i})`} />
              <defs>
                <marker id={`arrowCascade${i}`} markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={paso.color} />
                </marker>
              </defs>
            </>
          )}
        </g>
      ))}

      {/* Nota oligómeros */}
      <rect x="10" y="200" width="130" height="56" rx="8" fill="rgba(231,76,60,0.08)" stroke="#e74c3c" strokeWidth="1.5" />
      <text x="75" y="218" textAnchor="middle" fill="#c0392b" fontSize="9" fontWeight="700">Oligómeros Aβ</text>
      <text x="75" y="231" textAnchor="middle" fill="#c0392b" fontSize="8">más tóxicos que</text>
      <text x="75" y="243" textAnchor="middle" fill="#c0392b" fontSize="8">las placas maduras</text>
      <text x="75" y="255" textAnchor="middle" fill="#c0392b" fontSize="8">(debate actual)</text>
      <line x1="140" y1="228" x2="158" y2="225" stroke="#e74c3c" strokeWidth="1.2" strokeDasharray="3,2" />

      {/* Nota ensayos clínicos */}
      <rect x="460" y="200" width="130" height="56" rx="8" fill="rgba(46,134,171,0.08)" stroke="#2E86AB" strokeWidth="1.5" />
      <text x="525" y="218" textAnchor="middle" fill="#2E86AB" fontSize="9" fontWeight="700">Lecanemab/Donanemab</text>
      <text x="525" y="231" textAnchor="middle" fill="#2E86AB" fontSize="8">Anticuerpos anti-Aβ</text>
      <text x="525" y="243" textAnchor="middle" fill="#2E86AB" fontSize="8">Aprobados 2023</text>
      <text x="525" y="255" textAnchor="middle" fill="#2E86AB" fontSize="8">resultados mixtos</text>
      <line x1="460" y1="228" x2="442" y2="225" stroke="#2E86AB" strokeWidth="1.2" strokeDasharray="3,2" />

      <text x="300" y="325" textAnchor="middle" fill="#999" fontSize="9">Hipótesis de la cascada amiloide (dominante, pero en revisión continua)</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG Parkinson: Vía nigroestriada
// ─────────────────────────────────────────────

function SvgNigroestriada() {
  return (
    <svg viewBox="0 0 680 280" className={styles.diagramaSvg} role="img" aria-label="Diagrama de la vía nigroestriada: neuronas dopaminérgicas de la sustancia negra que proyectan al estriado. En Parkinson se pierde el 60-80% de estas neuronas">
      {/* Cerebro simplificado */}
      <ellipse cx="340" cy="110" rx="240" ry="90" fill="#F0F4F8" stroke="#CBD5E0" strokeWidth="1.5" />
      <text x="340" y="30" textAnchor="middle" fill="#4A5568" fontSize="11" fontWeight="600">Sección del cerebro (esquemática)</text>

      {/* Estriado */}
      <ellipse cx="220" cy="90" rx="70" ry="45" fill="#7FB3D3" opacity="0.25" />
      <ellipse cx="220" cy="90" rx="70" ry="45" fill="none" stroke="#2E86AB" strokeWidth="2" />
      <text x="220" y="86" textAnchor="middle" fill="#2E86AB" fontSize="11" fontWeight="700">Estriado</text>
      <text x="220" y="100" textAnchor="middle" fill="#2E86AB" fontSize="9">(caudado + putamen)</text>

      {/* Sustancia negra */}
      <ellipse cx="400" cy="150" rx="65" ry="35" fill="#2d2d2d" opacity="0.15" />
      <ellipse cx="400" cy="150" rx="65" ry="35" fill="none" stroke="#2d2d2d" strokeWidth="2" />
      <text x="400" y="146" textAnchor="middle" fill="#1a1a1a" fontSize="11" fontWeight="700">Sustancia negra</text>
      <text x="400" y="160" textAnchor="middle" fill="#555" fontSize="9">pars compacta (SNc)</text>

      {/* Neuromelanina */}
      {[370, 390, 410, 425, 440].map((x, i) => (
        <circle key={i} cx={x} cy={i % 2 === 0 ? 148 : 155} r="6" fill="#5d4037" opacity="0.6" />
      ))}

      {/* Vía nigroestriada */}
      <path d="M 340 135 Q 300 100 292 100" fill="none" stroke="#f39c12" strokeWidth="4" strokeLinecap="round" />
      <polygon points="292,100 300,95 296,106" fill="#f39c12" />
      <text x="310" y="110" textAnchor="middle" fill="#f39c12" fontSize="10" fontWeight="600">Vía nigroestriada</text>
      <text x="310" y="122" textAnchor="middle" fill="#f39c12" fontSize="9">dopamina (DA)</text>

      {/* Normal estado */}
      <rect x="20" y="170" width="260" height="90" rx="10" fill="rgba(39,174,96,0.06)" stroke="#27ae60" strokeWidth="1.5" />
      <text x="150" y="190" textAnchor="middle" fill="#27ae60" fontSize="11" fontWeight="700">Normal</text>
      <text x="150" y="208" textAnchor="middle" fill="#27ae60" fontSize="9">~100% de neuronas SNc intactas</text>
      <text x="150" y="222" textAnchor="middle" fill="#27ae60" fontSize="9">Dopamina normal en estriado</text>
      <text x="150" y="236" textAnchor="middle" fill="#27ae60" fontSize="9">Circuito motor equilibrado</text>
      <text x="150" y="252" textAnchor="middle" fill="#27ae60" fontSize="9">No hay manifestación de cambios motores</text>

      {/* Parkinson estado */}
      <rect x="400" y="170" width="260" height="90" rx="10" fill="rgba(231,76,60,0.06)" stroke="#e74c3c" strokeWidth="1.5" />
      <text x="530" y="190" textAnchor="middle" fill="#e74c3c" fontSize="11" fontWeight="700">Parkinson molecular</text>
      <text x="530" y="208" textAnchor="middle" fill="#e74c3c" fontSize="9">Pérdida 60-80% de neuronas SNc</text>
      <text x="530" y="222" textAnchor="middle" fill="#e74c3c" fontSize="9">Dopamina marcadamente reducida</text>
      <text x="530" y="236" textAnchor="middle" fill="#e74c3c" fontSize="9">Desequilibrio de circuitos motores</text>
      <text x="530" y="252" textAnchor="middle" fill="#e74c3c" fontSize="9">Neuromelanina: pigmento negro que acumula metales</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG Parkinson: α-sinucleína y Cuerpos de Lewy
// ─────────────────────────────────────────────

function SvgAlfaSinucleina() {
  return (
    <svg viewBox="0 0 680 300" className={styles.diagramaSvg} role="img" aria-label="Diagrama de la agregación de alfa-sinucleína: de monómeros a oligómeros, protofibrillas y cuerpos de Lewy en el soma de la neurona dopaminérgica">
      {/* Proceso de agregación */}
      <text x="340" y="20" textAnchor="middle" fill="#8e44ad" fontSize="13" fontWeight="700">Agregación de α-sinucleína</text>

      {/* Monómeros */}
      <g>
        <circle cx="60" cy="80" r="14" fill="#8e44ad" opacity="0.5" />
        <circle cx="85" cy="65" r="12" fill="#8e44ad" opacity="0.5" />
        <circle cx="45" cy="60" r="13" fill="#8e44ad" opacity="0.5" />
        <circle cx="80" cy="98" r="11" fill="#8e44ad" opacity="0.5" />
        <text x="65" y="125" textAnchor="middle" fill="#8e44ad" fontSize="10" fontWeight="600">Monómeros</text>
        <text x="65" y="138" textAnchor="middle" fill="#8e44ad" fontSize="9">(funcional normal)</text>
      </g>

      {/* Flecha 1 */}
      <line x1="108" y1="78" x2="148" y2="78" stroke="#8e44ad" strokeWidth="2" markerEnd="url(#arrowPurple1)" />
      <text x="128" y="70" textAnchor="middle" fill="#8e44ad" fontSize="8">mal plegado</text>
      <defs>
        <marker id="arrowPurple1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#8e44ad" />
        </marker>
      </defs>

      {/* Oligómeros */}
      <g>
        <circle cx="195" cy="70" r="16" fill="#7d3c98" opacity="0.55" />
        <circle cx="222" cy="82" r="16" fill="#7d3c98" opacity="0.55" />
        <circle cx="208" cy="55" r="14" fill="#7d3c98" opacity="0.55" />
        <text x="208" y="110" textAnchor="middle" fill="#7d3c98" fontSize="10" fontWeight="600">Oligómeros</text>
        <text x="208" y="123" textAnchor="middle" fill="#e74c3c" fontSize="9">⚠ tóxicos para la sinapsis</text>
      </g>

      {/* Flecha 2 */}
      <line x1="248" y1="78" x2="288" y2="78" stroke="#7d3c98" strokeWidth="2" markerEnd="url(#arrowPurple2)" />
      <defs>
        <marker id="arrowPurple2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#7d3c98" />
        </marker>
      </defs>

      {/* Protofibrillas */}
      <g>
        <rect x="295" y="60" width="80" height="18" rx="9" fill="#6c3483" opacity="0.6" />
        <rect x="300" y="80" width="70" height="18" rx="9" fill="#6c3483" opacity="0.55" />
        <rect x="305" y="100" width="65" height="18" rx="9" fill="#6c3483" opacity="0.5" />
        <text x="337" y="135" textAnchor="middle" fill="#6c3483" fontSize="10" fontWeight="600">Protofibrillas</text>
        <text x="337" y="148" textAnchor="middle" fill="#6c3483" fontSize="9">hojas-β apiladas</text>
      </g>

      {/* Flecha 3 */}
      <line x1="390" y1="78" x2="430" y2="78" stroke="#6c3483" strokeWidth="2" markerEnd="url(#arrowPurple3)" />
      <defs>
        <marker id="arrowPurple3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6c3483" />
        </marker>
      </defs>

      {/* Cuerpo de Lewy esquemático */}
      <circle cx="520" cy="78" r="50" fill="#4a235a" opacity="0.12" />
      <circle cx="520" cy="78" r="50" fill="none" stroke="#4a235a" strokeWidth="2.5" />
      {/* Halo */}
      <circle cx="520" cy="78" r="34" fill="#7d3c98" opacity="0.25" />
      <circle cx="520" cy="78" r="34" fill="none" stroke="#7d3c98" strokeWidth="2" strokeDasharray="4,2" />
      {/* Núcleo denso */}
      <circle cx="520" cy="78" r="18" fill="#6c3483" opacity="0.6" />
      <text x="520" y="82" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">core</text>
      <text x="520" y="145" textAnchor="middle" fill="#4a235a" fontSize="11" fontWeight="700">Cuerpo de Lewy</text>
      <text x="520" y="158" textAnchor="middle" fill="#4a235a" fontSize="9">inclusión intracelular</text>
      <text x="520" y="170" textAnchor="middle" fill="#4a235a" fontSize="9">halo claro + núcleo denso</text>

      {/* Neurona dopaminérgica */}
      <ellipse cx="520" cy="230" rx="60" ry="30" fill="#DDE8F0" stroke="#2E86AB" strokeWidth="1.5" />
      <circle cx="520" cy="230" r="16" fill="#7FB3D3" opacity="0.5" />
      <text x="520" y="226" textAnchor="middle" fill="#2E86AB" fontSize="9">soma</text>
      <text x="520" y="238" textAnchor="middle" fill="#2E86AB" fontSize="8">neurona DA</text>
      {/* Cuerpo de Lewy dentro de la neurona */}
      <circle cx="538" cy="222" r="9" fill="#4a235a" opacity="0.5" />
      <circle cx="538" cy="222" r="5" fill="#6c3483" opacity="0.7" />
      <line x1="528" y1="148" x2="530" y2="200" stroke="#4a235a" strokeWidth="1.5" strokeDasharray="3,2" />
      <text x="580" y="230" fill="#4a235a" fontSize="9">Cuerpo de Lewy</text>
      <text x="580" y="242" fill="#4a235a" fontSize="9">dentro del soma</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG Parkinson: Circuito ganglios basales
// ─────────────────────────────────────────────

function SvgGangliosBasales() {
  const [estado, setEstado] = useState<'normal' | 'parkinson'>('normal');

  const esNormal = estado === 'normal';

  return (
    <div className={styles.svgZona}>
      <div className={styles.estadoSwitch}>
        <button
          type="button"
          className={`${styles.switchBtn} ${esNormal ? styles.switchBtnActivo : ''}`}
          style={{ borderColor: '#27ae60', background: esNormal ? '#27ae60' : undefined, color: esNormal ? '#fff' : undefined }}
          onClick={() => setEstado('normal')}
          aria-pressed={esNormal}
        >
          Normal
        </button>
        <button
          type="button"
          className={`${styles.switchBtn} ${!esNormal ? styles.switchBtnActivo : ''}`}
          style={{ borderColor: '#e74c3c', background: !esNormal ? '#e74c3c' : undefined, color: !esNormal ? '#fff' : undefined }}
          onClick={() => setEstado('parkinson')}
          aria-pressed={!esNormal}
        >
          Sin dopamina (Parkinson)
        </button>
      </div>

      <svg viewBox="0 0 720 400" className={styles.diagramaSvg} role="img" aria-label={`Circuito de ganglios basales en estado ${esNormal ? 'normal' : 'Parkinson sin dopamina'}: vía directa e indirecta`}>
        {/* Título estado */}
        <text x="360" y="20" textAnchor="middle" fill={esNormal ? '#27ae60' : '#e74c3c'} fontSize="13" fontWeight="700">
          {esNormal ? 'Estado NORMAL — con dopamina' : 'Estado PARKINSON — sin dopamina'}
        </text>

        {/* Nodos */}
        {/* Corteza */}
        <rect x="280" y="35" width="160" height="40" rx="10" fill="#2E86AB" opacity="0.2" />
        <rect x="280" y="35" width="160" height="40" rx="10" fill="none" stroke="#2E86AB" strokeWidth="2" />
        <text x="360" y="52" textAnchor="middle" fill="#2E86AB" fontSize="12" fontWeight="700">Corteza motora</text>
        <text x="360" y="66" textAnchor="middle" fill="#2E86AB" fontSize="9">activa el movimiento</text>

        {/* Estriado */}
        <rect x="280" y="125" width="160" height="40" rx="10" fill="#48A9A6" opacity="0.2" />
        <rect x="280" y="125" width="160" height="40" rx="10" fill="none" stroke="#48A9A6" strokeWidth="2" />
        <text x="360" y="142" textAnchor="middle" fill="#48A9A6" fontSize="12" fontWeight="700">Estriado</text>
        <text x="360" y="156" textAnchor="middle" fill="#48A9A6" fontSize="9">D1 (vía directa) · D2 (vía indirecta)</text>

        {/* SNc dopamina */}
        <rect x="540" y="125" width="150" height="40" rx="10" fill="#f39c12" opacity="0.2" />
        <rect x="540" y="125" width="150" height="40" rx="10" fill="none" stroke="#f39c12" strokeWidth={esNormal ? 2 : 1} strokeDasharray={esNormal ? '0' : '5,3'} />
        <text x="615" y="142" textAnchor="middle" fill="#f39c12" fontSize="11" fontWeight="700">SNc (dopamina)</text>
        <text x="615" y="156" textAnchor="middle" fill={esNormal ? '#f39c12' : '#e74c3c'} fontSize="9">{esNormal ? 'activa D1, inhibe D2' : 'PERDIDA — sin efecto DA'}</text>

        {/* GPe */}
        <rect x="60" y="215" width="130" height="40" rx="10" fill="#8e44ad" opacity="0.15" />
        <rect x="60" y="215" width="130" height="40" rx="10" fill="none" stroke="#8e44ad" strokeWidth="2" />
        <text x="125" y="232" textAnchor="middle" fill="#8e44ad" fontSize="11" fontWeight="700">GPe</text>
        <text x="125" y="246" textAnchor="middle" fill="#8e44ad" fontSize="9">palio externo</text>

        {/* NST */}
        <rect x="60" y="310" width="130" height="40" rx="10" fill="#c0392b" opacity={esNormal ? 0.12 : 0.25} />
        <rect x="60" y="310" width="130" height="40" rx="10" fill="none" stroke="#c0392b" strokeWidth={esNormal ? 1.5 : 3} />
        <text x="125" y="327" textAnchor="middle" fill="#c0392b" fontSize="11" fontWeight="700">NST</text>
        <text x="125" y="341" textAnchor="middle" fill="#c0392b" fontSize="9">{esNormal ? 'actividad equilibrada' : 'HIPERACTIVO'}</text>

        {/* GPi/SNr */}
        <rect x="280" y="310" width="160" height="40" rx="10" fill="#7d3c98" opacity={esNormal ? 0.15 : 0.3} />
        <rect x="280" y="310" width="160" height="40" rx="10" fill="none" stroke="#7d3c98" strokeWidth={esNormal ? 2 : 3} />
        <text x="360" y="327" textAnchor="middle" fill="#7d3c98" fontSize="11" fontWeight="700">GPi / SNr</text>
        <text x="360" y="341" textAnchor="middle" fill="#7d3c98" fontSize="9">{esNormal ? 'moderadamente activo' : 'HIPERACTIVO'}</text>

        {/* Tálamo */}
        <rect x="490" y="215" width="160" height="40" rx="10" fill={esNormal ? '#27ae60' : '#e74c3c'} opacity="0.15" />
        <rect x="490" y="215" width="160" height="40" rx="10" fill="none" stroke={esNormal ? '#27ae60' : '#e74c3c'} strokeWidth="2" />
        <text x="570" y="232" textAnchor="middle" fill={esNormal ? '#27ae60' : '#e74c3c'} fontSize="11" fontWeight="700">Tálamo</text>
        <text x="570" y="246" textAnchor="middle" fill={esNormal ? '#27ae60' : '#e74c3c'} fontSize="9">{esNormal ? 'desinhibido → activa corteza' : 'INHIBIDO → menos activación'}</text>

        {/* FLECHAS */}

        {/* Corteza → Estriado */}
        <line x1="360" y1="75" x2="360" y2="123" stroke="#2E86AB" strokeWidth={esNormal ? 2.5 : 2.5} markerEnd="url(#arrowBlue)" />
        <defs>
          <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#2E86AB" />
          </marker>
          <marker id="arrowGreen2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#27ae60" />
          </marker>
          <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#e74c3c" />
          </marker>
          <marker id="arrowPurple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#7d3c98" />
          </marker>
        </defs>

        {/* SNc → Estriado */}
        <line x1="540" y1="145" x2="442" y2="145" stroke="#f39c12" strokeWidth={esNormal ? 3 : 1} strokeDasharray={esNormal ? '0' : '5,3'} markerEnd="url(#arrowOrange)" />
        <defs>
          <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f39c12" />
          </marker>
        </defs>
        <text x="490" y="138" textAnchor="middle" fill="#f39c12" fontSize="8">{esNormal ? 'DA ↑' : 'DA ↓↓'}</text>

        {/* Vía directa: Estriado → GPi/SNr (inhibición) */}
        <path d="M 340 165 L 340 308" fill="none" stroke={esNormal ? '#27ae60' : '#999'} strokeWidth={esNormal ? 3 : 1.5} strokeDasharray={esNormal ? '0' : '5,3'} markerEnd={esNormal ? 'url(#arrowGreen2)' : 'url(#arrowGrey)'} />
        <defs>
          <marker id="arrowGrey" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#999" />
          </marker>
        </defs>
        <text x="320" y="240" textAnchor="end" fill={esNormal ? '#27ae60' : '#999'} fontSize="9">{esNormal ? 'Vía directa' : 'Vía directa'}</text>
        <text x="320" y="252" textAnchor="end" fill={esNormal ? '#27ae60' : '#999'} fontSize="8">{esNormal ? 'D1 activo ↑' : 'D1 inactivo ↓'}</text>

        {/* Vía indirecta: Estriado → GPe */}
        <path d="M 280 155 L 193 232" fill="none" stroke={esNormal ? '#999' : '#e74c3c'} strokeWidth={esNormal ? 1.5 : 3} markerEnd={esNormal ? 'url(#arrowGrey)' : 'url(#arrowRed)'} />
        <text x="210" y="185" textAnchor="middle" fill={esNormal ? '#999' : '#e74c3c'} fontSize="8">{esNormal ? 'Indirecta (D2 frena)' : 'Indirecta (D2 sin freno)'}</text>

        {/* GPe → NST */}
        <line x1="125" y1="255" x2="125" y2="308" stroke="#8e44ad" strokeWidth="2" markerEnd="url(#arrowPurple4)" />
        <defs>
          <marker id="arrowPurple4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#8e44ad" />
          </marker>
        </defs>

        {/* NST → GPi/SNr */}
        <line x1="192" y1="330" x2="278" y2="330" stroke="#c0392b" strokeWidth={esNormal ? 1.5 : 4} markerEnd="url(#arrowRed2)" />
        <defs>
          <marker id="arrowRed2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#c0392b" />
          </marker>
        </defs>
        <text x="235" y="323" textAnchor="middle" fill="#c0392b" fontSize="8">{esNormal ? '' : 'EXCITACIÓN EXCESIVA'}</text>

        {/* GPi/SNr → Tálamo (inhibición) */}
        <path d="M 440 330 L 520 257" fill="none" stroke="#7d3c98" strokeWidth={esNormal ? 2 : 4} markerEnd="url(#arrowPurple)" />
        <text x="500" y="300" fill={esNormal ? '#7d3c98' : '#e74c3c'} fontSize="8">{esNormal ? '↓ inhibe' : '↓↓ inhibe más'}</text>

        {/* Tálamo → Corteza */}
        <path d="M 570 215 Q 560 120 440 75" fill="none" stroke={esNormal ? '#27ae60' : '#e74c3c'} strokeWidth={esNormal ? 3 : 1.5} strokeDasharray={esNormal ? '0' : '5,3'} markerEnd={esNormal ? 'url(#arrowGreen2)' : 'url(#arrowRed)'} />
        <text x="600" y="150" fill={esNormal ? '#27ae60' : '#e74c3c'} fontSize="9">{esNormal ? 'activa corteza ✓' : 'activa menos ✗'}</text>

        {/* Resultado final */}
        <text x="360" y="385" textAnchor="middle" fill={esNormal ? '#27ae60' : '#e74c3c'} fontSize="11" fontWeight="700">
          {esNormal ? 'Resultado: movimiento fluido y coordinado' : 'Resultado: circuito frenado — base neurobiológica de la hipocinesia'}
        </text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab Alzheimer
// ─────────────────────────────────────────────

function TabAlzheimer() {
  return (
    <div className={styles.tabContent}>
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>La proteína precursora de amiloide (APP)</h2>
        <p className={styles.seccionTexto}>
          La proteína APP atraviesa la membrana plasmática de las neuronas. Su procesamiento determina si se generan fragmentos benignos o el péptido Aβ, precursor de las placas amiloides.
        </p>
        <SvgProcesamientoAPP />
        <div className={styles.infoGrid}>
          <div className={styles.infoCard} style={{ borderLeftColor: '#27ae60' }}>
            <h4 className={styles.infoCardTitle} style={{ color: '#27ae60' }}>Vía normal — α-secretasa</h4>
            <p>Corta dentro del dominio Aβ → no puede formarse el péptido amiloide. Los fragmentos sAPPα y p3 son solubles y no tóxicos. Esta vía es la predominante en condiciones fisiológicas.</p>
          </div>
          <div className={styles.infoCard} style={{ borderLeftColor: '#e74c3c' }}>
            <h4 className={styles.infoCardTitle} style={{ color: '#e74c3c' }}>Vía patológica — β-secretasa (BACE1)</h4>
            <p>Corta antes del dominio Aβ → genera CTFβ. La γ-secretasa actúa sobre CTFβ y libera el péptido Aβ42. Este péptido es hidrofóbico: agrega en oligómeros → protofibrillas → <strong>placas amiloides extracelulares</strong>.</p>
          </div>
        </div>
      </section>

      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>La proteína Tau y los ovillos neurofibrilares</h2>
        <p className={styles.seccionTexto}>
          Tau es una proteína asociada a microtúbulos que estabiliza el citoesqueleto axonal y permite el transporte de orgánulos y vesículas a lo largo del axón. Cuando está hiperfosforilada, pierde esa función y agrega intracelularmente.
        </p>
        <div className={styles.svgZona}>
          <SvgTauNormal />
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard} style={{ borderLeftColor: '#27ae60' }}>
            <h4 className={styles.infoCardTitle} style={{ color: '#27ae60' }}>Tau normal</h4>
            <ul className={styles.infoLista}>
              <li>Se une a los microtúbulos y los estabiliza</li>
              <li>Permite el transporte axonal (kinesinas deslizan sobre microtúbulos)</li>
              <li>Estado de fosforilación equilibrado</li>
              <li>Neurona mantiene conectividad completa</li>
            </ul>
          </div>
          <div className={styles.infoCard} style={{ borderLeftColor: '#e74c3c' }}>
            <h4 className={styles.infoCardTitle} style={{ color: '#e74c3c' }}>Tau hiperfosforilada (patológica)</h4>
            <ul className={styles.infoLista}>
              <li>Quinasas GSK-3β y CDK5 hiperfosforilan Tau en múltiples sitios</li>
              <li>Tau se desprende de los microtúbulos</li>
              <li>Microtúbulos se desestabilizan → transporte axonal bloqueado</li>
              <li>Tau libre agrega → <strong>ovillos neurofibrilares (NFTs)</strong></li>
              <li>NFTs bloquean el soma → muerte neuronal</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Hipótesis de la cascada amiloide</h2>
        <p className={styles.seccionTexto}>
          Propuesta por Hardy y Higgins en 1992, esta hipótesis postula que la acumulación de Aβ es el evento molecular desencadenante que inicia una cascada que conduce a la patología Tau y a la muerte neuronal.
        </p>
        <div className={styles.svgZona}>
          <SvgCascadaAmiloidea />
        </div>
        <div className={styles.highlightBox}>
          <h4 className={styles.highlightTitle}>Debate actual (2023)</h4>
          <p>
            Los <strong>oligómeros de Aβ</strong> (no las placas maduras) son los agentes más tóxicos sinápticamente. Los ensayos con anticuerpos anti-Aβ (lecanemab, donanemab, aprobados por FDA en 2023) reducen la carga amiloide pero con beneficio clínico modesto, lo que cuestiona si Aβ es condición suficiente o solo necesaria. La hipótesis de la cascada amiloide sigue siendo la más aceptada, pero el campo evoluciona.
          </p>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab Parkinson
// ─────────────────────────────────────────────

function TabParkinson() {
  return (
    <div className={styles.tabContent}>
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>La vía nigroestriada y la dopamina</h2>
        <p className={styles.seccionTexto}>
          Las neuronas dopaminérgicas de la <strong>sustancia negra pars compacta (SNc)</strong> proyectan al estriado (caudado + putamen) a través de la <strong>vía nigroestriada</strong>. La dopamina liberada en el estriado modula los circuitos que controlan el movimiento. En el Parkinson, estas neuronas se pierden progresivamente.
        </p>
        <div className={styles.svgZona}>
          <SvgNigroestriada />
        </div>
        <div className={styles.datoDestacado}>
          <span className={styles.datoDestacadoValor}>60–80%</span>
          <span className={styles.datoDestacadoLabel}>de neuronas SNc se pierden antes de que se manifiesten cambios motores observables. El cerebro compensa durante años mediante neuroplasticidad y aumento de síntesis de dopamina en las neuronas supervivientes.</span>
        </div>
      </section>

      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>La α-sinucleína y los cuerpos de Lewy</h2>
        <p className={styles.seccionTexto}>
          La <strong>α-sinucleína</strong> es una proteína presináptica abundante en las terminales nerviosas cuya función normal es regular el tráfico de vesículas sinápticas. En Parkinson, se mal pliega y agrega progresivamente hasta formar los <strong>cuerpos de Lewy</strong>, el sello patológico de la enfermedad.
        </p>
        <div className={styles.svgZona}>
          <SvgAlfaSinucleina />
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard} style={{ borderLeftColor: '#27ae60' }}>
            <h4 className={styles.infoCardTitle} style={{ color: '#27ae60' }}>α-sinucleína normal</h4>
            <ul className={styles.infoLista}>
              <li>Proteína presináptica, asociada a vesículas</li>
              <li>Regula la liberación de neurotransmisores</li>
              <li>Interactúa con la membrana lipídica de las vesículas</li>
              <li>Estado nativo: parcialmente desestructurado</li>
            </ul>
          </div>
          <div className={styles.infoCard} style={{ borderLeftColor: '#7d3c98' }}>
            <h4 className={styles.infoCardTitle} style={{ color: '#7d3c98' }}>α-sinucleína mal plegada</h4>
            <ul className={styles.infoLista}>
              <li>Adopta conformación en hojas-β → tiende a agregar</li>
              <li>Oligómeros: tóxicos para la función sináptica</li>
              <li>Protofibrillas → fibras → incluidas en cuerpos de Lewy</li>
              <li>Cuerpos de Lewy: inclusión intracelular con halo claro y núcleo denso</li>
              <li>La agregación puede propagarse entre neuronas (hipótesis priónica)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>El circuito de los ganglios basales</h2>
        <p className={styles.seccionTexto}>
          Los ganglios basales modulan el movimiento a través de dos vías en equilibrio: la <strong>vía directa</strong> (facilita el movimiento) y la <strong>vía indirecta</strong> (lo inhibe). La dopamina potencia la primera y suprime la segunda. Cuando falta dopamina, el circuito queda desequilibrado hacia la inhibición.
        </p>
        <SvgGangliosBasales />
        <div className={styles.comparacionGB}>
          <div className={styles.comparacionGBCol} style={{ borderTopColor: '#27ae60' }}>
            <h4 style={{ color: '#27ae60' }}>Vía directa (con DA normal)</h4>
            <p className={styles.circuitoPaso}>Corteza → Estriado (D1 activado por DA) → inhibe GPi/SNr → Tálamo desinhibido → activa Corteza</p>
            <p className={styles.circuitoResultado} style={{ color: '#27ae60' }}>Resultado: el tálamo puede activar la corteza motora libremente → movimiento facilitado</p>
          </div>
          <div className={styles.comparacionGBCol} style={{ borderTopColor: '#8e44ad' }}>
            <h4 style={{ color: '#8e44ad' }}>Vía indirecta (con DA normal)</h4>
            <p className={styles.circuitoPaso}>Corteza → Estriado (D2 suprimido por DA) → inhibe menos GPe → GPe inhibe NST → NST menos activo → GPi/SNr menos activo → menos freno al Tálamo</p>
            <p className={styles.circuitoResultado} style={{ color: '#8e44ad' }}>La DA en D2 frena la vía que frena el movimiento → efecto neto: permite el movimiento</p>
          </div>
          <div className={styles.comparacionGBCol} style={{ borderTopColor: '#e74c3c' }}>
            <h4 style={{ color: '#e74c3c' }}>Sin dopamina (Parkinson)</h4>
            <p className={styles.circuitoPaso}>Vía directa debilitada (menos D1) + vía indirecta reforzada (menos D2) → NST hiperactivo → GPi/SNr hiperactivo → Tálamo fuertemente inhibido → corteza motora recibe menos señal</p>
            <p className={styles.circuitoResultado} style={{ color: '#e74c3c' }}>El circuito queda &ldquo;frenado&rdquo; — base neurobiológica de la hipocinesia (reducción del movimiento voluntario)</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAlzheimerParkinsonPage() {
  const [enfermedadActiva, setEnfermedadActiva] = useState<Enfermedad>('alzheimer');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Alzheimer y Parkinson</h1>
          <p className={styles.subtitle}>Neurobiología molecular — qué ocurre en el cerebro a escala de proteínas</p>
        </header>

        <LegalNotice />

        <DisclaimerCard variant="medical" severity="high" collapsible={false} />

        {/* Tabs de selección de enfermedad */}
        <nav className={styles.tabNav} aria-label="Selección de enfermedad">
          <button
            type="button"
            className={`${styles.tabBtn} ${enfermedadActiva === 'alzheimer' ? styles.tabBtnActivo : ''}`}
            onClick={() => setEnfermedadActiva('alzheimer')}
            aria-pressed={enfermedadActiva === 'alzheimer'}
          >
            <span aria-hidden="true">🧠</span>
            <span>Alzheimer</span>
            <span className={styles.tabBtnSub}>APP · Tau · Cascada amiloide</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${enfermedadActiva === 'parkinson' ? styles.tabBtnActivo : ''}`}
            onClick={() => setEnfermedadActiva('parkinson')}
            aria-pressed={enfermedadActiva === 'parkinson'}
          >
            <span aria-hidden="true">⚡</span>
            <span>Parkinson</span>
            <span className={styles.tabBtnSub}>α-sinucleína · Lewy · Dopamina</span>
          </button>
        </nav>

        {enfermedadActiva === 'alzheimer' ? <TabAlzheimer /> : <TabParkinson />}

        <EducationalSection
          title="Neurobiología de las enfermedades neurodegenerativas"
          subtitle="Proteínas que se plegan mal y circuitos que se desconectan"
          defaultOpen={false}
        >
          <h3>¿Qué tienen en común el Alzheimer y el Parkinson a nivel molecular?</h3>
          <p>
            Ambas son <strong>proteinopatías</strong>: enfermedades causadas por proteínas que adoptan conformaciones anómalas y agregan. En el Alzheimer son Aβ (extracelular) y Tau (intracelular); en el Parkinson es la α-sinucleína (intracelular). Este patrón compartido ha impulsado la investigación sobre mecanismos comunes de control del plegamiento proteico (chaperonas, proteosoma, autofagia).
          </p>

          <h3>¿Por qué el cerebro adulto tiene capacidad limitada de regeneración?</h3>
          <p>
            La <strong>neurogénesis adulta</strong> es real pero muy restringida: ocurre principalmente en el hipocampo (zona dentada) y en el bulbo olfatorio. La mayoría de las neuronas cerebrales no se reemplazan tras la muerte. Esto hace que la pérdida progresiva de neuronas específicas —dopaminérgicas en el Parkinson, corticales y del hipocampo en el Alzheimer— sea especialmente grave.
          </p>

          <h3>¿Qué es la hipótesis priónica de la α-sinucleína?</h3>
          <p>
            Algunas evidencias sugieren que la α-sinucleína mal plegada puede <strong>propagarse de neurona a neurona</strong>, como los priones, actuando como una &ldquo;semilla&rdquo; que induce el mal plegamiento de la α-sinucleína sana en la neurona receptora. Esto explicaría la progresión anatómica característica del Parkinson (estadios de Braak: del tronco encefálico hacia la corteza). Esta hipótesis está activamente investigada pero no está definitivamente establecida.
          </p>

          <h3>Investigación actual: inmunoterapia y terapia génica</h3>
          <p>
            En Alzheimer: el <strong>lecanemab</strong> (aprobado por FDA en 2023) es un anticuerpo monoclonal anti-protofibrillas de Aβ que reduce la carga amiloide en cerebro. El donanemab (en proceso de aprobación) también reduce placas. Ambos muestran un efecto modesto pero estadísticamente significativo en la ralentización de la progresión molecular. En Parkinson, la terapia génica con AAV (virus adeno-asociados) para suministrar GDNF (factor neurotrófico) está en ensayos clínicos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota educativa:</strong> Este visualizador explica mecanismos neurobiológicos con fines educativos. No describe síntomas, estadios ni pronóstico clínico, y no permite diagnosticar ninguna condición. La neurobiología de estas enfermedades es activamente investigada y el conocimiento evoluciona. Cualquier preocupación médica debe consultarse con un neurólogo especialista.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-alzheimer-parkinson')} />
        <ShareCard appName="visualizador-alzheimer-parkinson" />
        <Footer appName="visualizador-alzheimer-parkinson" />
      </div>
    </>
  );
}
