'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ElectricidadDomestica.module.css';
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

type Seccion = 'cuadro' | 'circuitos' | 'protecciones' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'cuadro', titulo: 'Cuadro Eléctrico', icono: '🔲', subtitulo: 'ICP, diferencial y magnetotérmicos' },
  { id: 'circuitos', titulo: 'Circuitos', icono: '🔌', subtitulo: 'Los 5 circuitos obligatorios REBT' },
  { id: 'protecciones', titulo: 'Protecciones', icono: '🛡️', subtitulo: 'Por qué salta el diferencial' },
  { id: 'datos', titulo: 'Datos y Curiosidades', icono: '💡', subtitulo: 'Consumos, historia y errores comunes' },
];

// ─────────────────────────────────────────────
// Seccion 1: Cuadro Electrico
// ─────────────────────────────────────────────

interface ComponenteElectrico {
  id: string;
  nombre: string;
  icono: string;
  breve: string;
  detalle: string;
}

const COMPONENTES_CUADRO: ComponenteElectrico[] = [
  {
    id: 'icp',
    nombre: 'ICP (Interruptor de Control de Potencia)',
    icono: '🔒',
    breve: 'Limita la potencia máxima contratada.',
    detalle: 'Lo instala la distribuidora y está precintado. Si intentas consumir más potencia de la contratada (por ejemplo, 3,45 kW), este interruptor salta y corta toda la vivienda. Es el "tope" que impone tu contrato. Desde 2021, muchas distribuidoras lo sustituyen por un ICP virtual integrado en el contador inteligente.',
  },
  {
    id: 'diferencial',
    nombre: 'Interruptor Diferencial (ID)',
    icono: '⚡',
    breve: 'Protege a las PERSONAS contra electrocución.',
    detalle: 'Compara la corriente que entra (fase) con la que sale (neutro). Si hay una diferencia de 30 mA o más (alguien tocando un cable o una fuga a tierra), corta en menos de 30 milisegundos. Es obligatorio y puede salvar vidas. Se recomienda probar el botón de test una vez al mes.',
  },
  {
    id: 'magneto',
    nombre: 'Magnetotérmicos (PIAs)',
    icono: '🔧',
    breve: 'Protegen los CABLES contra sobrecarga y cortocircuito.',
    detalle: 'Cada circuito de la casa tiene su propio magnetotérmico. Si un circuito consume más de lo permitido (sobrecarga) o hay un cortocircuito, el magnetotérmico de ESE circuito salta, dejando el resto de la casa con electricidad. Por eso hay uno por cada circuito: C1 iluminación (10A), C2 enchufes (16A), C3 cocina (25A), C4 lavadora (20A), C5 baño (16A).',
  },
  {
    id: 'tierra',
    nombre: 'Toma de Tierra',
    icono: '🌍',
    breve: 'Desvía corrientes de fuga al suelo, lejos de ti.',
    detalle: 'El cable verde-amarillo conecta todas las carcasas metálicas de electrodomésticos con una pica clavada en el suelo del edificio. Si un electrodoméstico tiene un defecto interno y su carcasa se electrifica, la corriente viaja por el cable de tierra en vez de por tu cuerpo. Esto hace que el diferencial detecte la fuga y corte. Sin tierra, el diferencial no puede protegerte.',
  },
  {
    id: 'iga',
    nombre: 'IGA (Interruptor General Automático)',
    icono: '🔴',
    breve: 'Corta toda la vivienda manualmente o por sobrecarga general.',
    detalle: 'Es el interruptor principal después del ICP. Permite cortar toda la electricidad de la vivienda de un solo gesto (útil para emergencias o vacaciones). También protege contra sobrecargas generales. Típicamente es de 25A o 40A según la potencia contratada.',
  },
  {
    id: 'sobretensiones',
    nombre: 'Protector de Sobretensiones',
    icono: '⚠️',
    breve: 'Protege los equipos contra picos de tensión (rayos, maniobras red).',
    detalle: 'Desde la reforma del REBT en 2019, es obligatorio en nuevas instalaciones. Absorbe picos de tensión transitorios (causados por rayos, conexión/desconexión de cargas grandes en la red o maniobras de la compañía). Sin él, un pico puede destruir electrónica sensible: TV, ordenador, router.',
  },
];

function SeccionCuadro() {
  const [componenteActivo, setComponenteActivo] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El cuadro eléctrico es el <strong>centro de control</strong> de tu instalación. Contiene todos los dispositivos de protección y distribución de la electricidad.</p>
      </div>

      {/* SVG del cuadro electrico */}
      <div className={styles.cuadroContainer}>
        <svg viewBox="0 0 560 320" className={styles.cuadroSvg} aria-label="Diagrama del cuadro eléctrico doméstico">
          {/* Marco del cuadro */}
          <rect x="10" y="10" width="540" height="300" rx="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <text x="280" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" opacity="0.5">CUADRO GENERAL DE MANDO Y PROTECCION</text>

          {/* Linea de entrada */}
          <line x1="50" y1="55" x2="50" y2="80" stroke="#8B4513" strokeWidth="3" />
          <text x="50" y="52" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">Acometida</text>

          {/* ICP */}
          <rect x="25" y="80" width="50" height="60" rx="4" fill={componenteActivo === 'icp' ? '#2E86AB' : '#f0f0f0'} stroke={componenteActivo === 'icp' ? '#2E86AB' : '#999'} strokeWidth="2" onClick={() => setComponenteActivo(componenteActivo === 'icp' ? null : 'icp')} style={{ cursor: 'pointer' }} />
          <text x="50" y="108" textAnchor="middle" fontSize="9" fontWeight="700" fill={componenteActivo === 'icp' ? 'white' : '#333'}>ICP</text>
          <text x="50" y="120" textAnchor="middle" fontSize="7" fill={componenteActivo === 'icp' ? 'white' : '#666'}>3,45kW</text>

          {/* Linea ICP a IGA */}
          <line x1="75" y1="110" x2="115" y2="110" stroke="#8B4513" strokeWidth="2" />

          {/* IGA */}
          <rect x="115" y="80" width="50" height="60" rx="4" fill={componenteActivo === 'iga' ? '#2E86AB' : '#f0f0f0'} stroke={componenteActivo === 'iga' ? '#2E86AB' : '#999'} strokeWidth="2" onClick={() => setComponenteActivo(componenteActivo === 'iga' ? null : 'iga')} style={{ cursor: 'pointer' }} />
          <text x="140" y="108" textAnchor="middle" fontSize="9" fontWeight="700" fill={componenteActivo === 'iga' ? 'white' : '#333'}>IGA</text>
          <text x="140" y="120" textAnchor="middle" fontSize="7" fill={componenteActivo === 'iga' ? 'white' : '#666'}>25A</text>

          {/* Linea IGA a Sobretensiones */}
          <line x1="165" y1="110" x2="205" y2="110" stroke="#8B4513" strokeWidth="2" />

          {/* Protector sobretensiones */}
          <rect x="205" y="80" width="50" height="60" rx="4" fill={componenteActivo === 'sobretensiones' ? '#2E86AB' : '#f0f0f0'} stroke={componenteActivo === 'sobretensiones' ? '#2E86AB' : '#999'} strokeWidth="2" onClick={() => setComponenteActivo(componenteActivo === 'sobretensiones' ? null : 'sobretensiones')} style={{ cursor: 'pointer' }} />
          <text x="230" y="105" textAnchor="middle" fontSize="8" fontWeight="700" fill={componenteActivo === 'sobretensiones' ? 'white' : '#333'}>Sobre-</text>
          <text x="230" y="118" textAnchor="middle" fontSize="8" fontWeight="700" fill={componenteActivo === 'sobretensiones' ? 'white' : '#333'}>tensiones</text>

          {/* Linea a Diferencial */}
          <line x1="255" y1="110" x2="295" y2="110" stroke="#8B4513" strokeWidth="2" />

          {/* Diferencial */}
          <rect x="295" y="80" width="60" height="60" rx="4" fill={componenteActivo === 'diferencial' ? '#e74c3c' : '#fff0f0'} stroke={componenteActivo === 'diferencial' ? '#e74c3c' : '#cc0000'} strokeWidth="2" onClick={() => setComponenteActivo(componenteActivo === 'diferencial' ? null : 'diferencial')} style={{ cursor: 'pointer' }} />
          <text x="325" y="105" textAnchor="middle" fontSize="9" fontWeight="700" fill={componenteActivo === 'diferencial' ? 'white' : '#cc0000'}>ID</text>
          <text x="325" y="118" textAnchor="middle" fontSize="7" fill={componenteActivo === 'diferencial' ? 'white' : '#cc0000'}>30mA</text>
          <text x="325" y="130" textAnchor="middle" fontSize="7" fill={componenteActivo === 'diferencial' ? 'white' : '#cc0000'}>40A</text>

          {/* Toma de tierra - cable verde-amarillo */}
          <line x1="325" y1="140" x2="325" y2="175" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,2" />
          <rect x="305" y="175" width="40" height="25" rx="3" fill={componenteActivo === 'tierra' ? '#22c55e' : '#f0fff0'} stroke="#22c55e" strokeWidth="1.5" onClick={() => setComponenteActivo(componenteActivo === 'tierra' ? null : 'tierra')} style={{ cursor: 'pointer' }} />
          <text x="325" y="191" textAnchor="middle" fontSize="8" fontWeight="600" fill={componenteActivo === 'tierra' ? 'white' : '#166534'}>Tierra</text>

          {/* Barra de distribucion */}
          <line x1="355" y1="110" x2="540" y2="110" stroke="#8B4513" strokeWidth="3" />
          <line x1="355" y1="115" x2="540" y2="115" stroke="#0066cc" strokeWidth="2" />

          {/* Magnetotermicos */}
          {['C1', 'C2', 'C3', 'C4', 'C5'].map((c, i) => {
            const x = 370 + i * 35;
            const amperios = ['10A', '16A', '25A', '20A', '16A'][i];
            const usos = ['Luz', 'Ench.', 'Cocina', 'Lav.', 'Baño'][i];
            return (
              <g key={c} onClick={() => setComponenteActivo(componenteActivo === 'magneto' ? null : 'magneto')} style={{ cursor: 'pointer' }}>
                <line x1={x} y1="115" x2={x} y2="135" stroke="#8B4513" strokeWidth="2" />
                <rect x={x - 14} y="135" width="28" height="55" rx="3" fill={componenteActivo === 'magneto' ? '#48A9A6' : '#f5f5f5'} stroke={componenteActivo === 'magneto' ? '#48A9A6' : '#888'} strokeWidth="1.5" />
                <text x={x} y="155" textAnchor="middle" fontSize="8" fontWeight="700" fill={componenteActivo === 'magneto' ? 'white' : '#333'}>{c}</text>
                <text x={x} y="167" textAnchor="middle" fontSize="7" fill={componenteActivo === 'magneto' ? 'white' : '#666'}>{amperios}</text>
                <text x={x} y="179" textAnchor="middle" fontSize="6" fill={componenteActivo === 'magneto' ? 'white' : '#999'}>{usos}</text>
                {/* Cable bajante */}
                <line x1={x} y1="190" x2={x} y2="210" stroke="#8B4513" strokeWidth="1.5" />
                <circle cx={x} cy="215" r="5" fill="none" stroke="#8B4513" strokeWidth="1" />
              </g>
            );
          })}

          {/* Leyenda colores cables */}
          <g transform="translate(25, 240)">
            <text x="0" y="0" fontSize="10" fontWeight="700" fill="currentColor" opacity="0.7">Colores de cables:</text>
            <line x1="0" y1="12" x2="20" y2="12" stroke="#8B4513" strokeWidth="3" />
            <text x="25" y="16" fontSize="9" fill="currentColor" opacity="0.6">Fase (marron)</text>
            <line x1="120" y1="12" x2="140" y2="12" stroke="#0066cc" strokeWidth="3" />
            <text x="145" y="16" fontSize="9" fill="currentColor" opacity="0.6">Neutro (azul)</text>
            <line x1="240" y1="12" x2="260" y2="12" stroke="#22c55e" strokeWidth="3" strokeDasharray="4,2" />
            <text x="265" y="16" fontSize="9" fill="currentColor" opacity="0.6">Tierra (verde-amarillo)</text>
          </g>
        </svg>
      </div>

      {/* Grid de componentes clickables */}
      <div className={styles.componentesGrid}>
        {COMPONENTES_CUADRO.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.componenteCard} ${componenteActivo === c.id ? styles.componenteActivo : ''}`}
            onClick={() => setComponenteActivo(componenteActivo === c.id ? null : c.id)}
            aria-expanded={componenteActivo === c.id}
          >
            <span className={styles.componenteIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.componenteNombre}>{c.nombre}</span>
            <span className={styles.componenteBreve}>{c.breve}</span>
            {componenteActivo === c.id && (
              <span className={styles.componenteDetalle}>{c.detalle}</span>
            )}
          </button>
        ))}
      </div>

      {/* Cables */}
      <div className={styles.cablesCard}>
        <h3 className={styles.cablesTitulo}>Colores de cables segun normativa UNE</h3>
        <div className={styles.cablesGrid}>
          <div className={styles.cableItem}>
            <div className={styles.cableColor} style={{ background: '#8B4513' }} />
            <div className={styles.cableTexto}>
              <span className={styles.cableNombre}>Marron (o negro/gris)</span>
              <span className={styles.cableFuncion}>Fase (L) - corriente activa</span>
            </div>
          </div>
          <div className={styles.cableItem}>
            <div className={styles.cableColor} style={{ background: '#0066cc' }} />
            <div className={styles.cableTexto}>
              <span className={styles.cableNombre}>Azul</span>
              <span className={styles.cableFuncion}>Neutro (N) - retorno</span>
            </div>
          </div>
          <div className={styles.cableItem}>
            <div className={styles.cableColor} style={{ background: 'linear-gradient(135deg, #22c55e 50%, #eab308 50%)' }} />
            <div className={styles.cableTexto}>
              <span className={styles.cableNombre}>Verde-amarillo</span>
              <span className={styles.cableFuncion}>Tierra (PE) - proteccion</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Recorrido de la corriente:</strong> entra por la acometida del edificio, pasa por el ICP (que limita tu potencia contratada), luego por el IGA, atraviesa el diferencial (que vigila fugas) y se reparte por los magnetotermicos a cada circuito de la casa. La tierra es una via de escape segura para corrientes perdidas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 2: Circuitos del Hogar
// ─────────────────────────────────────────────

interface CircuitoREBT {
  id: string;
  nombre: string;
  icono: string;
  magnetotermico: string;
  seccion: string;
  potenciaMax: string;
  puntos: string;
  detalle: string;
}

const CIRCUITOS: CircuitoREBT[] = [
  {
    id: 'c1',
    nombre: 'C1 - Iluminacion',
    icono: '💡',
    magnetotermico: '10A',
    seccion: '1,5 mm²',
    potenciaMax: '2.300 W',
    puntos: 'Hasta 30 puntos de luz',
    detalle: 'Circuito dedicado exclusivamente a la iluminacion. Con la llegada del LED, raramente supera los 500 W en un piso medio. El magnetotermico de 10A es mas que suficiente. Cable de 1,5 mm² de seccion (el mas fino de la instalacion).',
  },
  {
    id: 'c2',
    nombre: 'C2 - Enchufes de uso general',
    icono: '🔌',
    magnetotermico: '16A',
    seccion: '2,5 mm²',
    potenciaMax: '3.680 W',
    puntos: 'Hasta 20 tomas',
    detalle: 'Enchufes del salon, dormitorios y pasillo. Para TV, cargadores, lampara de pie, aspiradora, etc. Cable de 2,5 mm². Importante: no conectar electrodomesticos de alta potencia (radiadores, freidoras) en estos enchufes, ya que no estan dimensionados para ello.',
  },
  {
    id: 'c3',
    nombre: 'C3 - Cocina y horno',
    icono: '🍳',
    magnetotermico: '25A',
    seccion: '6 mm²',
    potenciaMax: '5.750 W',
    puntos: 'Hasta 2 tomas',
    detalle: 'Circuito reforzado para cocina electrica/vitroceramica y horno. Cable de 6 mm² (el mas grueso de la vivienda) y magnetotermico de 25A. Una vitroceramica de induccion puede consumir 3.000-7.000 W, por eso necesita su propio circuito. Si tu cocina es de gas, este circuito alimenta igualmente el enchufe de la cocina.',
  },
  {
    id: 'c4',
    nombre: 'C4 - Lavadora, lavavajillas y termo',
    icono: '🫧',
    magnetotermico: '20A',
    seccion: '4 mm²',
    potenciaMax: '4.600 W',
    puntos: 'Hasta 3 tomas',
    detalle: 'Circuito independiente para electrodomesticos con motor y/o resistencia: lavadora (~2.200 W), lavavajillas (~2.100 W) y termo electrico (~1.500 W). Cable de 4 mm². El pico de arranque de un motor puede triplicar el consumo normal durante un segundo.',
  },
  {
    id: 'c5',
    nombre: 'C5 - Enchufes de baño y cocina',
    icono: '🚿',
    magnetotermico: '16A',
    seccion: '2,5 mm²',
    potenciaMax: '3.680 W',
    puntos: 'Hasta 6 tomas',
    detalle: 'Enchufes auxiliares de baño y cocina (secador, afeitadora, batidora, tostadora). Circuito separado del C2 porque el baño y la cocina son zonas de mayor riesgo electrico (presencia de agua). Cable de 2,5 mm². En el baño, los enchufes deben respetar distancias de seguridad a la bañera/ducha.',
  },
];

function SeccionCircuitos() {
  const [circuitoActivo, setCircuitoActivo] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El <strong>REBT</strong> (Reglamento Electrotecnico de Baja Tension) obliga a que toda vivienda tenga al menos 5 circuitos independientes. Cada uno con su propio magnetotermico, seccion de cable y potencia maxima.</p>
      </div>

      {/* Tabla resumen */}
      <div className={styles.tablaContainer}>
        <h3 className={styles.tablaTitulo}>Los 5 circuitos obligatorios (electrificacion basica)</h3>
        <div className={styles.tablaResponsive}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Circuito</th>
                <th>Magn.</th>
                <th>Cable</th>
                <th>Potencia max.</th>
              </tr>
            </thead>
            <tbody>
              {CIRCUITOS.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>{c.magnetotermico}</td>
                  <td>{c.seccion}</td>
                  <td>{c.potenciaMax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards detalle clickables */}
      {CIRCUITOS.map(c => (
        <button
          key={c.id}
          type="button"
          className={`${styles.circuitoCard} ${circuitoActivo === c.id ? styles.circuitoActivo : ''}`}
          onClick={() => setCircuitoActivo(circuitoActivo === c.id ? null : c.id)}
          aria-expanded={circuitoActivo === c.id}
        >
          <div className={styles.circuitoHeader}>
            <span className={styles.circuitoNombre}>
              <span aria-hidden="true">{c.icono}</span> {c.nombre}
            </span>
            <span className={styles.circuitoMagn}>{c.magnetotermico} | {c.seccion}</span>
            <span className={`${styles.circuitoChevron} ${circuitoActivo === c.id ? styles.chevronAbierto : ''}`} aria-hidden="true">▼</span>
          </div>
          {circuitoActivo === c.id && (
            <div className={styles.circuitoDetalle}>
              <p>{c.detalle}</p>
              <p><strong>Puntos de utilizacion:</strong> {c.puntos}</p>
            </div>
          )}
        </button>
      ))}

      <div className={styles.insight}>
        <p>
          <strong>Electrificacion elevada:</strong> viviendas grandes o con aire acondicionado, secadora, coche electrico, etc., necesitan circuitos adicionales (C6 a C12) con potencia contratada de 9,2 kW o mas. El principio es el mismo: cada circuito con su propio magnetotermico y seccion de cable adecuada.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 3: Protecciones
// ─────────────────────────────────────────────

type ModoFlujo = 'normal' | 'fuga' | 'cortocircuito';

function SeccionProtecciones() {
  const [modo, setModo] = useState<ModoFlujo>('normal');

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las protecciones son la razon por la que la electricidad domestica es segura. Cada una actua ante un tipo de fallo diferente y se complementan entre si.</p>
      </div>

      {/* Animacion SVG del flujo */}
      <div className={styles.animacionContainer}>
        <svg viewBox="0 0 500 220" className={styles.animacionSvg} aria-label={`Flujo de corriente: modo ${modo}`}>
          {/* Fuente */}
          <rect x="10" y="70" width="60" height="80" rx="5" fill="#f0f0f0" stroke="#888" strokeWidth="1.5" />
          <text x="40" y="105" textAnchor="middle" fontSize="9" fontWeight="700" fill="#333">Red</text>
          <text x="40" y="118" textAnchor="middle" fontSize="8" fill="#666">230V</text>

          {/* Cable fase (ida) */}
          <line x1="70" y1="90" x2="180" y2="90" stroke="#8B4513" strokeWidth="3" />
          <text x="125" y="82" textAnchor="middle" fontSize="8" fill="#8B4513" fontWeight="600">Fase (L)</text>

          {/* Diferencial */}
          <rect x="180" y="60" width="50" height="100" rx="5" fill={modo === 'fuga' ? '#e74c3c' : '#f5f5f5'} stroke={modo === 'fuga' ? '#e74c3c' : '#999'} strokeWidth="2" />
          <text x="205" y="105" textAnchor="middle" fontSize="9" fontWeight="700" fill={modo === 'fuga' ? 'white' : '#333'}>ID</text>
          <text x="205" y="118" textAnchor="middle" fontSize="7" fill={modo === 'fuga' ? 'white' : '#666'}>30mA</text>
          {modo === 'fuga' && (
            <text x="205" y="50" textAnchor="middle" fontSize="11" fontWeight="800" fill="#e74c3c">SALTA!</text>
          )}

          {/* Cable fase (continua) */}
          <line x1="230" y1="90" x2="320" y2="90" stroke={modo === 'fuga' ? '#ccc' : '#8B4513'} strokeWidth="3" strokeDasharray={modo === 'fuga' ? '5,5' : 'none'} />

          {/* Magnetotermico */}
          <rect x="320" y="70" width="40" height="80" rx="4" fill={modo === 'cortocircuito' ? '#f39c12' : '#f5f5f5'} stroke={modo === 'cortocircuito' ? '#f39c12' : '#999'} strokeWidth="2" />
          <text x="340" y="105" textAnchor="middle" fontSize="8" fontWeight="700" fill={modo === 'cortocircuito' ? 'white' : '#333'}>PIA</text>
          <text x="340" y="118" textAnchor="middle" fontSize="7" fill={modo === 'cortocircuito' ? 'white' : '#666'}>16A</text>
          {modo === 'cortocircuito' && (
            <text x="340" y="60" textAnchor="middle" fontSize="11" fontWeight="800" fill="#f39c12">SALTA!</text>
          )}

          {/* Cable a carga */}
          <line x1="360" y1="110" x2="430" y2="110" stroke={modo !== 'normal' ? '#ccc' : '#8B4513'} strokeWidth="2" strokeDasharray={modo !== 'normal' ? '5,5' : 'none'} />

          {/* Carga (electrodomestico) */}
          <rect x="430" y="80" width="60" height="60" rx="5" fill={modo === 'normal' ? '#e8f5e9' : '#ffebee'} stroke={modo === 'normal' ? '#27ae60' : '#e74c3c'} strokeWidth="1.5" />
          <text x="460" y="108" textAnchor="middle" fontSize="16">{modo === 'cortocircuito' ? '💥' : modo === 'fuga' ? '⚠️' : '🔌'}</text>
          <text x="460" y="130" textAnchor="middle" fontSize="7" fill={modo === 'normal' ? '#27ae60' : '#e74c3c'}>{modo === 'normal' ? 'OK' : modo === 'fuga' ? 'Fuga' : 'Corto'}</text>

          {/* Cable neutro (vuelta) */}
          <line x1="430" y1="140" x2="230" y2="140" stroke={modo !== 'normal' ? '#ccc' : '#0066cc'} strokeWidth="2" />
          <line x1="180" y1="140" x2="70" y2="140" stroke="#0066cc" strokeWidth="2" />
          <text x="125" y="155" textAnchor="middle" fontSize="8" fill="#0066cc" fontWeight="600">Neutro (N)</text>

          {/* Fuga a tierra */}
          {modo === 'fuga' && (
            <>
              <line x1="460" y1="140" x2="460" y2="195" stroke="#22c55e" strokeWidth="2" strokeDasharray="4,2" />
              <text x="460" y="210" textAnchor="middle" fontSize="9" fontWeight="700" fill="#22c55e">Tierra</text>
              {/* Flecha indicando corriente de fuga */}
              <text x="480" y="170" fontSize="8" fill="#e74c3c" fontWeight="600">30mA+</text>
            </>
          )}

          {/* Flujo de corriente normal */}
          {modo === 'normal' && (
            <>
              <text x="125" y="100" textAnchor="middle" fontSize="8" fill="#27ae60" fontWeight="600">10A →</text>
              <text x="125" y="135" textAnchor="middle" fontSize="8" fill="#27ae60" fontWeight="600">← 10A</text>
              <text x="250" y="180" textAnchor="middle" fontSize="9" fill="#27ae60" fontWeight="600">Ida = Vuelta → Sin fuga</text>
            </>
          )}

          {/* Cortocircuito */}
          {modo === 'cortocircuito' && (
            <text x="400" y="100" textAnchor="middle" fontSize="8" fill="#f39c12" fontWeight="700">500A!</text>
          )}
        </svg>

        <div className={styles.animacionBotones}>
          <button
            type="button"
            className={`${styles.animacionBtn} ${modo === 'normal' ? styles.animacionBtnActivo : ''}`}
            onClick={() => setModo('normal')}
            aria-pressed={modo === 'normal'}
          >
            Flujo normal
          </button>
          <button
            type="button"
            className={`${styles.animacionBtn} ${modo === 'fuga' ? styles.animacionBtnActivo : ''}`}
            onClick={() => setModo('fuga')}
            aria-pressed={modo === 'fuga'}
          >
            Fuga a tierra
          </button>
          <button
            type="button"
            className={`${styles.animacionBtn} ${modo === 'cortocircuito' ? styles.animacionBtnActivo : ''}`}
            onClick={() => setModo('cortocircuito')}
            aria-pressed={modo === 'cortocircuito'}
          >
            Cortocircuito
          </button>
        </div>
      </div>

      {/* Explicacion del modo activo */}
      {modo === 'normal' && (
        <div className={styles.insight}>
          <p><strong>Flujo normal:</strong> la corriente entra por la fase (cable marron), recorre el electrodomestico y vuelve por el neutro (cable azul). La corriente de ida es exactamente igual a la de vuelta. El diferencial compara ambas y al ser iguales, no salta.</p>
        </div>
      )}
      {modo === 'fuga' && (
        <div className={styles.insight}>
          <p><strong>Fuga a tierra:</strong> un defecto en el electrodomestico hace que parte de la corriente escape por el cable de tierra (o peor, por tu cuerpo). El diferencial detecta que la corriente de vuelta (neutro) es menor que la de ida (fase) y corta en menos de 30 ms. Una diferencia de 30 mA ya es suficiente para cortarlo.</p>
        </div>
      )}
      {modo === 'cortocircuito' && (
        <div className={styles.insight}>
          <p><strong>Cortocircuito:</strong> la fase toca directamente el neutro sin pasar por ninguna carga (por ejemplo, un cable pelado). La corriente sube instantaneamente a cientos de amperios. El magnetotermico detecta este pico de corriente anormal y corta el circuito para evitar que los cables se derritan y provoquen un incendio.</p>
        </div>
      )}

      {/* Cards de protecciones */}
      <div className={styles.proteccionesGrid}>
        <div className={styles.proteccionCard}>
          <span className={styles.proteccionIcono} aria-hidden="true">⚡</span>
          <h3 className={styles.proteccionTitulo}>Salta el DIFERENCIAL</h3>
          <p className={styles.proteccionDesc}>Causa: fuga de corriente a tierra. Un electrodomestico defectuoso, humedad en un enchufe, o un cable en mal estado.</p>
          <div className={styles.proteccionAccion}>
            <strong>Que hacer:</strong> 1) Baja todos los magnetotermicos. 2) Sube el diferencial. 3) Sube los magnetotermicos uno a uno. 4) El que haga saltar el diferencial es el circuito con la fuga. 5) Desconecta los aparatos de ese circuito y prueba uno a uno.
          </div>
        </div>
        <div className={styles.proteccionCard}>
          <span className={styles.proteccionIcono} aria-hidden="true">🔧</span>
          <h3 className={styles.proteccionTitulo}>Salta un MAGNETOTERMICO</h3>
          <p className={styles.proteccionDesc}>Causa: sobrecarga (demasiados aparatos en ese circuito) o cortocircuito (cables en contacto).</p>
          <div className={styles.proteccionAccion}>
            <strong>Que hacer:</strong> 1) Desconecta algunos aparatos de ese circuito. 2) Intenta subir el magnetotermico. 3) Si salta inmediatamente, hay cortocircuito: llama al electricista. 4) Si aguanta un rato y salta, hay sobrecarga: redistribuye aparatos.
          </div>
        </div>
        <div className={styles.proteccionCard}>
          <span className={styles.proteccionIcono} aria-hidden="true">🔒</span>
          <h3 className={styles.proteccionTitulo}>Salta el ICP</h3>
          <p className={styles.proteccionDesc}>Causa: estas consumiendo mas potencia de la contratada. Encender muchos aparatos a la vez supera tu limite.</p>
          <div className={styles.proteccionAccion}>
            <strong>Que hacer:</strong> 1) Apaga algunos electrodomesticos de alto consumo (horno, vitroceramica, radiador). 2) Vuelve a subir el ICP. 3) Si pasa a menudo, plantea subir la potencia contratada con tu comercializadora.
          </div>
        </div>
        <div className={styles.proteccionCard}>
          <span className={styles.proteccionIcono} aria-hidden="true">🌍</span>
          <h3 className={styles.proteccionTitulo}>Sin toma de tierra</h3>
          <p className={styles.proteccionDesc}>Peligro: sin tierra, las fugas de corriente no tienen via de escape segura. El diferencial tarda mas o no salta.</p>
          <div className={styles.proteccionAccion}>
            <strong>Que hacer:</strong> Si tu vivienda es anterior a 1973 y no tiene toma de tierra, es urgente que un electricista autorizado la instale. Es obligatoria por el REBT y critica para tu seguridad.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Seccion 4: Datos y Curiosidades
// ─────────────────────────────────────────────

function SeccionDatos() {
  const curiosidades = [
    { dato: '3,45 kW', desc: 'Potencia contratada mas comun en pisos espanoles (15A)' },
    { dato: '3.272 kWh', desc: 'Consumo medio anual de un hogar en Espana (IDAE)' },
    { dato: '30 mA', desc: 'Sensibilidad del diferencial domestico (detecta 0,03 amperios de fuga)' },
    { dato: '< 30 ms', desc: 'Tiempo que tarda el diferencial en cortar (mas rapido que un parpadeo)' },
    { dato: '230 V', desc: 'Tension nominal en Espana (antes 220V, armonizada con Europa en 1996)' },
    { dato: '50 Hz', desc: 'Frecuencia de la red electrica espanola (la corriente cambia de sentido 100 veces/s)' },
    { dato: '~80 €/mes', desc: 'Factura media de electricidad de un hogar espanol (2025)' },
    { dato: '1882', desc: 'Primer alumbrado electrico publico en Espana (Comillas, Cantabria, financiado por el Marques)' },
    { dato: '40%', desc: 'Porcentaje de la factura que NO depende de tu consumo (fijo: potencia, peajes, impuestos)' },
    { dato: '8 mm', desc: 'Diametro minimo de la pica de toma de tierra (acero cobrizado de 2 metros, clavada en el suelo)' },
  ];

  const erroresComunes = [
    { icono: '🔌', titulo: 'Regletas en cascada', desc: 'Conectar una regleta en otra multiplica el riesgo de sobrecarga. Cada regleta tiene un limite de potencia (normalmente 3.500 W). En cascada, toda la corriente pasa por la primera.' },
    { icono: '🔥', titulo: 'Cables pelados o empalmes con cinta', desc: 'Los empalmes deben hacerse con clemas o conectores homologados, nunca con cinta aislante que se degrada con el calor.' },
    { icono: '💧', titulo: 'Enchufes cerca del agua sin proteccion', desc: 'En baño y cocina, los enchufes deben estar a minimo 60 cm de la bañera/fregadero y en circuito independiente (C5).' },
    { icono: '🔌', titulo: 'Sobrecargar un solo enchufe', desc: 'Conectar radiador + estufa + secador en el mismo enchufe puede derretir el cable antes de que salte el magnetotermico.' },
    { icono: '⚠️', titulo: 'No probar el diferencial', desc: 'El boton de TEST del diferencial debe pulsarse una vez al mes. Si no salta al pulsarlo, esta averiado y no te protege.' },
    { icono: '🏚️', titulo: 'Instalaciones antiguas sin tierra', desc: 'Viviendas anteriores a 1973 pueden no tener toma de tierra. Sin ella, el diferencial no puede protegerte eficazmente ante una fuga.' },
  ];

  const timelineElectricidad = [
    { anio: '1882', evento: 'Primer alumbrado electrico en Espana (Comillas)', nota: 'Financiado por el Marques de Comillas para su palacio' },
    { anio: '1901', evento: 'Primeras centrales hidroelectricas en Cataluna', nota: 'Inicio de la electrificacion industrial' },
    { anio: '1936', evento: 'Solo el 35% de hogares espanoles tienen luz', nota: 'La electrificacion rural tardaria decadas' },
    { anio: '1944', evento: 'Se crea UNESA (patronal electrica)', nota: 'Coordinacion del sistema electrico nacional' },
    { anio: '1973', evento: 'La toma de tierra se hace obligatoria (REBT)', nota: 'Antes, muchas viviendas no tenian proteccion de tierra' },
    { anio: '1996', evento: 'Tension armonizada: de 220V a 230V', nota: 'Adaptacion al estandar europeo (rango 230V ±10%)' },
    { anio: '2002', evento: 'Nuevo REBT con 5 circuitos obligatorios', nota: 'El reglamento actual de instalaciones domesticas' },
    { anio: '2018', evento: 'Contadores inteligentes en el 99% de hogares', nota: 'Telemedida, ICP virtual y discriminacion horaria' },
    { anio: '2021', evento: 'Nuevas tarifas con 3 tramos horarios', nota: 'Punta, llano y valle — incentivo al consumo nocturno' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Datos reales sobre la electricidad domestica en Espana, errores comunes que pueden ser peligrosos y la historia de como se electrificaron los hogares espanoles.</p>
      </div>

      {/* Consumos */}
      <div className={styles.consumosCard}>
        <h3 className={styles.consumosTitulo}>Consumo tipico de electrodomesticos</h3>
        <div className={styles.consumosGrid}>
          <div className={styles.consumoItem}>
            <span className={styles.consumoNumero}>7.000 W</span>
            <span className={styles.consumoLabel}>Vitroceramica induccion (pico)</span>
          </div>
          <div className={styles.consumoItem}>
            <span className={styles.consumoNumero}>2.200 W</span>
            <span className={styles.consumoLabel}>Lavadora (ciclo caliente)</span>
          </div>
          <div className={styles.consumoItem}>
            <span className={styles.consumoNumero}>2.000 W</span>
            <span className={styles.consumoLabel}>Horno electrico</span>
          </div>
          <div className={styles.consumoItem}>
            <span className={styles.consumoNumero}>1.500 W</span>
            <span className={styles.consumoLabel}>Termo electrico</span>
          </div>
          <div className={styles.consumoItem}>
            <span className={styles.consumoNumero}>1.000 W</span>
            <span className={styles.consumoLabel}>Aire acondicionado (split)</span>
          </div>
          <div className={styles.consumoItem}>
            <span className={styles.consumoNumero}>10 W</span>
            <span className={styles.consumoLabel}>Bombilla LED (equivale a 60W incandescente)</span>
          </div>
        </div>
      </div>

      {/* Curiosidades */}
      <div className={styles.curiosidadesCard}>
        <h3 className={styles.curiosidadesTitulo}>Datos y cifras</h3>
        <div className={styles.curiosidadesGrid}>
          {curiosidades.map((c, i) => (
            <div key={i} className={styles.curiosidadItem}>
              <span className={styles.curiosidadDato}>{c.dato}</span>
              <span className={styles.curiosidadDesc}>{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Errores comunes */}
      <h3 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>Errores comunes (y peligrosos)</h3>
      <div className={styles.erroresGrid}>
        {erroresComunes.map((e, i) => (
          <div key={i} className={styles.errorCard}>
            <span className={styles.errorIcono} aria-hidden="true">{e.icono}</span>
            <div className={styles.errorTexto}>
              <strong>{e.titulo}</strong>
              <span>{e.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className={styles.timelineCard}>
        <h3 className={styles.timelineTitulo}>Historia de la electricidad domestica en Espana</h3>
        <div className={styles.timeline}>
          {timelineElectricidad.map((t, i) => (
            <div key={i} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <span className={styles.timelineAnio}>{t.anio}</span>
                <span className={styles.timelineEvento}>{t.evento}</span>
                <span className={styles.timelineNota}>{t.nota}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Dato sorprendente:</strong> en 1936, solo el 35% de los hogares espanoles tenian electricidad. La electrificacion rural completa no se alcanzo hasta los anos 70. Hoy, la red electrica espanola es una de las mas fiables de Europa, con menos de 1 hora de cortes al ano de media.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorElectricidadDomestica() {
  const [seccion, setSeccion] = useState<Seccion>('cuadro');

  const renderSeccion = () => {
    switch (seccion) {
      case 'cuadro': return <SeccionCuadro />;
      case 'circuitos': return <SeccionCircuitos />;
      case 'protecciones': return <SeccionProtecciones />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Electricidad Domestica</h1>
          <p className={styles.subtitle}>Como funciona la instalacion electrica de tu casa</p>
        </header>

        <LegalNotice />

        {/* Navegacion */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera seccion */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccion)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccion)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccion)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Mas sobre electricidad domestica"
          subtitle="Preguntas frecuentes y conceptos clave"
          defaultOpen={false}
        >
          <h3>Monofasica vs trifasica: cual tiene mi casa?</h3>
          <p>
            La mayoria de viviendas en Espana tienen suministro <strong>monofasico</strong> (230V, un solo cable de fase).
            El trifasico (400V, tres fases) se usa en industria, talleres y viviendas con potencias superiores a
            ~15 kW (motores grandes, talleres de carpinteria, ascensores). Si tu cuadro tiene 3 diferenciales y 3 filas
            de magnetotermicos, probablemente es trifasico.
          </p>

          <h3>Puedo tocar el cuadro electrico?</h3>
          <p>
            Puedes subir y bajar los interruptores (diferenciales y magnetotermicos) sin riesgo, eso es normal
            y esta disenado para ello. Lo que <strong>nunca</strong> debes hacer es abrir las tapas del cuadro,
            manipular cables o puentear interruptores. Eso es trabajo de un electricista autorizado con boletin.
          </p>

          <h3>Que es el boletin electrico?</h3>
          <p>
            El Certificado de Instalacion Electrica (CIE), comunmente llamado &quot;boletin&quot;, es un documento
            firmado por un electricista autorizado que certifica que la instalacion cumple el REBT. Se necesita
            para dar de alta un suministro, cambiar la potencia, o tras una reforma electrica. Caduca a los 20 anos.
          </p>

          <h3>Mi casa es antigua, es segura?</h3>
          <p>
            Las viviendas anteriores a 2002 (fecha del REBT actual) pueden no tener los 5 circuitos independientes.
            Las anteriores a 1973 pueden no tener toma de tierra. Senales de peligro: enchufes de dos clavijas
            (sin tierra), cables de aluminio (rigidos y quebradizos), cuadro con fusibles de porcelana en vez
            de magnetotermicos, o ausencia de diferencial. Si detectas estos signos, consulta un electricista.
          </p>

          <div className={styles.warningBox}>
            <strong>Importante:</strong> Las instalaciones electricas deben ser realizadas por un electricista
            autorizado. No manipules el cuadro electrico mas alla de subir/bajar interruptores. Este explicador
            es educativo y no sustituye el consejo de un profesional cualificado.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-electricidad-domestica')} />
        <ShareCard appName="visualizador-electricidad-domestica" />
        <Footer appName="visualizador-electricidad-domestica" />
    </div>
  );
}
