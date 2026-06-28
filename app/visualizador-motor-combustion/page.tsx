'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './MotorCombustion.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type TabId = 'ciclo' | 'eficiencia' | 'perdidas' | 'comparativa';

interface TiempoOtto {
  numero: number;
  nombre: string;
  icono: string;
  color: string;
  valvulas: string;
  piston: string;
  quePasa: string;
  detalle: string;
}

interface PerdidasEnergia {
  nombre: string;
  porcentaje: number;
  color: string;
  descripcion: string;
}

interface ComparativaItem {
  aspecto: string;
  combustion: string;
  electrico: string;
  ganador: 'combustion' | 'electrico' | 'empate';
}

const TIEMPOS_OTTO: TiempoOtto[] = [
  {
    numero: 1,
    nombre: 'Admisión',
    icono: '⬇️',
    color: '#2E86AB',
    valvulas: 'Admisión abierta · Escape cerrada',
    piston: 'Desciende (PMI a PMS)',
    quePasa: 'El pistón baja y crea vacío. La mezcla aire+gasolina entra por la válvula de admisión.',
    detalle: 'En motores de inyección directa, el combustible se inyecta directamente en el cilindro, no en el colector de admisión. Esto mejora la eficiencia pero requiere presiones de inyección muy altas (200-350 bar).',
  },
  {
    numero: 2,
    nombre: 'Compresión',
    icono: '⬆️',
    color: '#D97706',
    valvulas: 'Ambas cerradas',
    piston: 'Sube (PMS a PMI)',
    quePasa: 'El pistón sube y comprime la mezcla. La temperatura y presión aumentan drásticamente.',
    detalle: 'La relación de compresión (típicamente 8:1-12:1) determina la eficiencia: más compresión = más eficiencia, pero requiere gasolina de mayor octanaje para evitar la autoignición (detonación o "pinking").',
  },
  {
    numero: 3,
    nombre: 'Expansión (explosión)',
    icono: '💥',
    color: '#DC2626',
    valvulas: 'Ambas cerradas',
    piston: 'Desciende bruscamente',
    quePasa: 'La bujía produce la chispa. La mezcla se inflama y los gases se expanden empujando el pistón con fuerza hacia abajo. Este es el único tiempo motor.',
    detalle: 'La combustión no es instantánea: el frente de llama se propaga a ~20-30 m/s. En un motor a 6.000 rpm, cada tiempo dura solo 5 ms. La sincronización del encendido (avance) es crítica para maximizar la presión en el momento correcto.',
  },
  {
    numero: 4,
    nombre: 'Escape',
    icono: '💨',
    color: '#48A9A6',
    valvulas: 'Escape abierta · Admisión cerrada',
    piston: 'Sube empujando los gases',
    quePasa: 'El pistón sube y expulsa los gases quemados por la válvula de escape. El ciclo se reinicia.',
    detalle: 'Los gases de escape salen a ~500-600°C y contienen energía residual. Los turbocompresores aprovechan esta energía para comprimir el aire de admisión. Los sistemas de recuperación de calor (WHR) son la siguiente frontera de eficiencia.',
  },
];

const PERDIDAS_ENERGIA: PerdidasEnergia[] = [
  { nombre: 'Trabajo útil (ruedas)', porcentaje: 20, color: '#16A34A', descripcion: 'Solo el 20% de la energía del combustible llega realmente a mover las ruedas en conducción urbana. En autopista mejora hasta ~30%.' },
  { nombre: 'Calor del escape', porcentaje: 35, color: '#DC2626', descripcion: 'Los gases de escape salen a 500-600°C. Esta energía se pierde al ambiente. Los turbos recuperan parte, pero no toda.' },
  { nombre: 'Calor al refrigerante', porcentaje: 30, color: '#E67E22', descripcion: 'El bloque del motor absorbe calor para no fundirse. El radiador lo disipa al aire exterior. Este calor es "puro desperdicio".' },
  { nombre: 'Fricción interna', porcentaje: 10, color: '#8B5E3C', descripcion: 'Pistones, cigüeñal, árbol de levas, bomba de aceite... cada pieza móvil roba energía. Más pronunciado en frío (sin lubricación óptima).' },
  { nombre: 'Auxiliares (alternador, A/C...)', porcentaje: 5, color: '#6B7280', descripcion: 'El alternador, la bomba de dirección asistida, el compresor del aire acondicionado y la bomba de agua consumen potencia del motor.' },
];

const COMPARATIVA: ComparativaItem[] = [
  { aspecto: 'Eficiencia energética', combustion: '20-35%', electrico: '85-95%', ganador: 'electrico' },
  { aspecto: 'Torque máximo', combustion: 'A media-alta RPM', electrico: 'Desde 0 RPM (instantáneo)', ganador: 'electrico' },
  { aspecto: 'Autonomía real', combustion: '600-1.000 km', electrico: '300-600 km', ganador: 'combustion' },
  { aspecto: 'Tiempo de recarga/repostaje', combustion: '3-5 minutos', electrico: '20-60 min (carga rápida)', ganador: 'combustion' },
  { aspecto: 'Mantenimiento', combustion: 'Complejo (aceite, filtros, bujías, correa...)', electrico: 'Simple (frenos, neumáticos)', ganador: 'electrico' },
  { aspecto: 'Emisiones directas', combustion: 'CO₂, NOx, partículas', electrico: 'Cero en uso', ganador: 'electrico' },
  { aspecto: 'Rendimiento en frío', combustion: 'Muy reducido hasta temperatura', electrico: 'Constante (salvo batería)', ganador: 'electrico' },
  { aspecto: 'Infraestructura actual', combustion: 'Red global madura', electrico: 'En expansión rápida', ganador: 'combustion' },
  { aspecto: 'Coste inicial del vehículo', combustion: 'Menor en general', electrico: 'Mayor (batería)', ganador: 'combustion' },
  { aspecto: 'Sonido y vibración', combustion: 'Presente (requiere aislamiento)', electrico: 'Casi silencioso', ganador: 'electrico' },
];

export default function MotorCombustionPage() {
  const [tabActiva, setTabActiva] = useState<TabId>('ciclo');
  const [tiempoActivo, setTiempoActivo] = useState<number>(1);
  const [relacionCompresion, setRelacionCompresion] = useState<number>(10);

  const tabs: { id: TabId; label: string; icono: string }[] = [
    { id: 'ciclo', label: 'Ciclo Otto (4 tiempos)', icono: '🔄' },
    { id: 'eficiencia', label: 'Eficiencia real', icono: '📊' },
    { id: 'perdidas', label: 'Dónde va la energía', icono: '🔥' },
    { id: 'comparativa', label: 'vs Motor eléctrico', icono: '⚡' },
  ];

  const tiempoActual = TIEMPOS_OTTO.find(t => t.numero === tiempoActivo) ?? TIEMPOS_OTTO[0];
  // Eficiencia Carnot simplificada: η = 1 - 1/r^(γ-1), γ=1.4
  const eficienciaIdeal = Math.round((1 - Math.pow(relacionCompresion, -0.4)) * 100);
  const eficienciaReal = Math.round(eficienciaIdeal * 0.65); // factor pérdidas reales

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon}>🔧</div>
        <h1>Motor de Combustión Interna</h1>
        <p>El ciclo Otto en 4 tiempos y por qué el 65% de la energía de la gasolina nunca mueve tu coche</p>
      </header>

      <LegalNotice />

      <nav className={styles.tabs} aria-label="Secciones">
        {tabs.map(tab => (
          <button key={tab.id}
            type="button"
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-pressed={tabActiva === tab.id}>
            <span aria-hidden="true">{tab.icono}</span> {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB: Ciclo Otto */}
      {tabActiva === 'ciclo' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>El Ciclo Otto: 4 tiempos, 1 solo motor</h2>
          <p className={styles.seccionSubtitulo}>De los 4 tiempos, solo uno genera energía. Los otros 3 son necesarios para prepararlo.</p>

          <div className={styles.tiemposNav} role="group" aria-label="Seleccionar tiempo del ciclo">
            {TIEMPOS_OTTO.map(t => (
              <button key={t.numero}
                type="button"
                className={`${styles.tiempoBtn} ${tiempoActivo === t.numero ? styles.tiempoBtnActivo : ''}`}
                style={tiempoActivo === t.numero ? { borderColor: t.color, backgroundColor: t.color + '18' } : {}}
                onClick={() => setTiempoActivo(t.numero)}
                aria-pressed={tiempoActivo === t.numero}>
                <span className={styles.tiempoNum} style={tiempoActivo === t.numero ? { color: t.color } : {}}>{t.numero}°</span>
                <span aria-hidden="true">{t.icono}</span>
                <span>{t.nombre}</span>
              </button>
            ))}
          </div>

          {/* Diagrama cilindro SVG */}
          <div className={styles.cilindroDiagrama} role="img" aria-label={`Diagrama del ${tiempoActual.numero}° tiempo: ${tiempoActual.nombre}`}>
            <svg viewBox="0 0 200 260" className={styles.cilindroSvg}>
              {/* Cilindro */}
              <rect x="60" y="30" width="80" height="160" rx="4" fill="none" stroke="#374151" strokeWidth="3" />

              {/* Válvula admisión */}
              <rect x="65" y="25" width="15" height="10" rx="2"
                fill={tiempoActual.valvulas.includes('Admisión abierta') ? '#16A34A' : '#6B7280'} />
              <text x="83" y="20" fontSize="8" fill="#6B7280">Admisión</text>

              {/* Válvula escape */}
              <rect x="120" y="25" width="15" height="10" rx="2"
                fill={tiempoActual.valvulas.includes('Escape abierta') ? '#16A34A' : '#6B7280'} />
              <text x="115" y="20" fontSize="8" fill="#6B7280">Escape</text>

              {/* Bujía */}
              <circle cx="100" cy="38" r="6" fill={tiempoActual.numero === 3 ? '#FBBF24' : '#9CA3AF'} />
              {tiempoActual.numero === 3 && (
                <text x="95" y="58" fontSize="14" fill="#FBBF24">⚡</text>
              )}

              {/* Gas en cilindro */}
              {tiempoActual.numero === 1 && (
                <rect x="61" y="100" width="78" height="89" fill="#BFDBFE" opacity="0.5" />
              )}
              {tiempoActual.numero === 2 && (
                <rect x="61" y="130" width="78" height="59" fill="#FDE68A" opacity="0.6" />
              )}
              {tiempoActual.numero === 3 && (
                <rect x="61" y="31" width="78" height="159" fill="#FCA5A5" opacity="0.5" />
              )}
              {tiempoActual.numero === 4 && (
                <rect x="61" y="31" width="78" height="159" fill="#D1FAE5" opacity="0.4" />
              )}

              {/* Pistón */}
              <rect x="62"
                y={tiempoActual.numero === 1 ? 170 : tiempoActual.numero === 2 ? 130 : tiempoActual.numero === 3 ? 170 : 130}
                width="76" height="20" rx="3" fill="#374151" />

              {/* Biela simplificada */}
              <line x1="100"
                y1={tiempoActual.numero === 1 ? 190 : tiempoActual.numero === 2 ? 150 : tiempoActual.numero === 3 ? 190 : 150}
                x2="100" y2="225" stroke="#6B7280" strokeWidth="4" />

              {/* Cigüeñal */}
              <circle cx="100" cy="230" r="15" fill="none" stroke="#374151" strokeWidth="2" />
              <circle cx={tiempoActual.numero === 1 ? 100 : tiempoActual.numero === 2 ? 115 : tiempoActual.numero === 3 ? 100 : 115}
                cy={tiempoActual.numero === 1 ? 245 : tiempoActual.numero === 2 ? 230 : tiempoActual.numero === 3 ? 215 : 230}
                r="5" fill="#2E86AB" />

              {/* Label tiempo */}
              <text x="100" y="258" textAnchor="middle" fontSize="10" fill={tiempoActual.color} fontWeight="bold">
                {tiempoActual.numero}° {tiempoActual.nombre}
              </text>
            </svg>
          </div>

          <div className={styles.tiempoDetalle} style={{ borderLeftColor: tiempoActual.color }}>
            <div className={styles.tiempoMeta}>
              <div className={styles.tiempoMetaItem}>
                <span className={styles.tiempoMetaLabel}>Válvulas</span>
                <span className={styles.tiempoMetaValor}>{tiempoActual.valvulas}</span>
              </div>
              <div className={styles.tiempoMetaItem}>
                <span className={styles.tiempoMetaLabel}>Pistón</span>
                <span className={styles.tiempoMetaValor}>{tiempoActual.piston}</span>
              </div>
            </div>
            <p className={styles.tiempoDesc}>{tiempoActual.quePasa}</p>
            <div className={styles.tiempoExtra}>{tiempoActual.detalle}</div>
          </div>

          {tiempoActivo === 3 && (
            <div className={styles.warningBox}>
              <strong><span aria-hidden="true">💡</span> Solo 1 de 4 tiempos es motor:</strong> En un motor de 4 cilindros, cada cilindro
              produce potencia una vez por cada 2 revoluciones del cigüeñal. Los 4 cilindros se escalonan
              para que siempre haya uno en fase de expansión, dando sensación de funcionamiento continuo.
            </div>
          )}
        </section>
      )}

      {/* TAB: Eficiencia */}
      {tabActiva === 'eficiencia' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Eficiencia térmica: el límite físico</h2>
          <p className={styles.seccionSubtitulo}>
            La termodinámica impone un techo a lo que cualquier motor térmico puede aprovechar.
          </p>

          <div className={styles.eficienciaIntro}>
            <p>
              El <strong>rendimiento del ciclo Otto ideal</strong> depende únicamente de la relación de
              compresión. Cuanto más se comprime la mezcla, más eficiente es el ciclo. Sin embargo,
              comprimir demasiado provoca <strong>autoignición</strong> (detonación), que destruye el motor.
            </p>
          </div>

          <div className={styles.sliderSection}>
            <label htmlFor="compresion-slider" className={styles.sliderLabel}>
              Relación de compresión: <strong>{relacionCompresion}:1</strong>
            </label>
            <input id="compresion-slider" type="range" min={6} max={14} value={relacionCompresion}
              onChange={e => setRelacionCompresion(Number(e.target.value))}
              className={styles.slider} />
            <div className={styles.sliderMarks}>
              <span>6:1 (bajo)</span>
              <span>10:1 (estándar)</span>
              <span>14:1 (diésel)</span>
            </div>

            <div className={styles.eficienciaMetrics}>
              <div className={styles.eficienciaMetric}>
                <span className={styles.eficienciaLabel}>Eficiencia Otto ideal</span>
                <div className={styles.eficienciaBarra}>
                  <div className={styles.eficienciaBarraFill} style={{ width: `${eficienciaIdeal}%`, background: '#2E86AB' }} />
                </div>
                <span className={styles.eficienciaValor} style={{ color: '#2E86AB' }}>{eficienciaIdeal}%</span>
              </div>
              <div className={styles.eficienciaMetric}>
                <span className={styles.eficienciaLabel}>Eficiencia real (con pérdidas)</span>
                <div className={styles.eficienciaBarra}>
                  <div className={styles.eficienciaBarraFill} style={{ width: `${eficienciaReal}%`, background: '#16A34A' }} />
                </div>
                <span className={styles.eficienciaValor} style={{ color: '#16A34A' }}>{eficienciaReal}%</span>
              </div>
            </div>
          </div>

          <div className={styles.eficienciaGrid}>
            <div className={styles.eficienciaCard}>
              <h3>Motor gasolina convencional</h3>
              <div className={styles.bigNumber} style={{ color: '#DC2626' }}>~30%</div>
              <p>Eficiencia típica en conducción real (ciclo WLTP). En ciudad baja al 15-20% por los ciclos cortos y el arranque en frío.</p>
            </div>
            <div className={styles.eficienciaCard}>
              <h3>Motor diésel</h3>
              <div className={styles.bigNumber} style={{ color: '#D97706' }}>~40%</div>
              <p>Mayor relación de compresión (16:1-22:1) y sin bomba de encendido mejora la eficiencia. Mejor en largas distancias.</p>
            </div>
            <div className={styles.eficienciaCard}>
              <h3>Motor Atkinson/Miller</h3>
              <div className={styles.bigNumber} style={{ color: '#16A34A' }}>~38%</div>
              <p>Variante del ciclo Otto que cierra la válvula de admisión tarde, efectivamente reduciendo la fase de compresión. Usado en híbridos (Toyota).</p>
            </div>
            <div className={styles.eficienciaCard}>
              <h3>Motor eléctrico (referencia)</h3>
              <div className={styles.bigNumber} style={{ color: '#2E86AB' }}>~90%</div>
              <p>Sin ciclo termodinámico: la conversión eléctrica→mecánica es directa. No hay límite de Carnot en la misma forma.</p>
            </div>
          </div>
        </section>
      )}

      {/* TAB: Pérdidas */}
      {tabActiva === 'perdidas' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Dónde va la energía de la gasolina</h2>
          <p className={styles.seccionSubtitulo}>Por cada 100 € gastados en gasolina en ciudad, solo ~20 € mueven el coche.</p>

          {/* Diagrama Sankey simplificado */}
          <div className={styles.sankeyWrapper} role="img" aria-label="Diagrama de pérdidas de energía del motor">
            <svg viewBox="0 0 500 220" className={styles.sankeyDiagrama}>
              {/* Entrada: 100% combustible */}
              <rect x="10" y="80" width="60" height="60" rx="6" fill="#2E86AB" />
              <text x="40" y="105" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">100%</text>
              <text x="40" y="118" textAnchor="middle" fontSize="9" fill="#fff">Combustible</text>

              {/* Línea principal */}
              <line x1="70" y1="110" x2="140" y2="110" stroke="#2E86AB" strokeWidth="4" />

              {/* Motor */}
              <rect x="140" y="70" width="80" height="80" rx="6" fill="#374151" />
              <text x="180" y="105" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">Motor</text>
              <text x="180" y="118" textAnchor="middle" fontSize="9" fill="#9CA3AF">Otto 4T</text>

              {/* Salida: trabajo útil */}
              <line x1="220" y1="110" x2="340" y2="110" stroke="#16A34A" strokeWidth="3" />
              <rect x="340" y="87" width="70" height="46" rx="6" fill="#16A34A" />
              <text x="375" y="107" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">~20%</text>
              <text x="375" y="120" textAnchor="middle" fontSize="9" fill="#fff">Ruedas</text>

              {/* Pérdida escape */}
              <line x1="180" y1="70" x2="180" y2="20" stroke="#DC2626" strokeWidth="3" />
              <rect x="145" y="5" width="70" height="22" rx="4" fill="#DC2626" />
              <text x="180" y="19" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">35% escape</text>

              {/* Pérdida refrigeración */}
              <line x1="165" y1="90" x2="80" y2="40" stroke="#E67E22" strokeWidth="2.5" />
              <rect x="20" y="28" width="65" height="20" rx="4" fill="#E67E22" />
              <text x="52" y="41" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">30% calor</text>

              {/* Pérdida fricción */}
              <line x1="165" y1="140" x2="80" y2="185" stroke="#78350F" strokeWidth="2" />
              <rect x="15" y="178" width="65" height="20" rx="4" fill="#78350F" />
              <text x="47" y="191" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">10% fricción</text>

              {/* Pérdida auxiliares */}
              <line x1="180" y1="150" x2="180" y2="195" stroke="#6B7280" strokeWidth="2" />
              <rect x="145" y="195" width="70" height="18" rx="4" fill="#6B7280" />
              <text x="180" y="207" textAnchor="middle" fontSize="9" fill="#fff">5% auxiliares</text>
            </svg>
          </div>

          <div className={styles.perdidasGrid}>
            {PERDIDAS_ENERGIA.map(perdida => (
              <div key={perdida.nombre} className={styles.perdidaCard}>
                <div className={styles.perdidaHeader}>
                  <div className={styles.perdidaBar} style={{ backgroundColor: perdida.color, width: `${perdida.porcentaje * 3}px` }} />
                  <span className={styles.perdidaPorcentaje} style={{ color: perdida.color }}>{perdida.porcentaje}%</span>
                  <span className={styles.perdidaNombre}>{perdida.nombre}</span>
                </div>
                <p className={styles.perdidaDesc}>{perdida.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB: Comparativa */}
      {tabActiva === 'comparativa' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Combustión vs Eléctrico: comparativa honesta</h2>
          <p className={styles.seccionSubtitulo}>Sin sesgos: ventajas e inconvenientes reales de cada tecnología en 2024.</p>

          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComp}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th><span aria-hidden="true">🔧</span> Combustión</th>
                  <th><span aria-hidden="true">⚡</span> Eléctrico</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map(item => (
                  <tr key={item.aspecto} className={styles.filaComp}>
                    <td className={styles.celdaAspecto}>{item.aspecto}</td>
                    <td className={`${styles.celdaValor} ${item.ganador === 'combustion' ? styles.ganador : ''}`}>
                      {item.ganador === 'combustion' && <span className={styles.ganadorMarca} aria-hidden="true">✅ </span>}
                      {item.combustion}
                    </td>
                    <td className={`${styles.celdaValor} ${item.ganador === 'electrico' ? styles.ganador : ''}`}>
                      {item.ganador === 'electrico' && <span className={styles.ganadorMarca} aria-hidden="true">✅ </span>}
                      {item.electrico}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.infoBox}>
            <strong><span aria-hidden="true">💡</span> La emisiones totales importan:</strong> Un vehículo eléctrico cargado con electricidad
            de carbón puede tener más emisiones de CO₂ por km que uno de gasolina moderno. En España (2024,
            mix ~35% renovables), el VE ya es significativamente mejor. A medida que la red se descarboniza,
            la ventaja del eléctrico crece automáticamente sin cambiar el vehículo.
          </div>
        </section>
      )}

      <EducationalSection
        title="Termodinámica del motor de combustión"
        subtitle="Del ciclo de Carnot al motor híbrido: física aplicada a la movilidad"
      >
        <h3>El ciclo de Carnot y el límite teórico</h3>
        <p>
          Ningún motor térmico puede superar la eficiencia del ciclo de Carnot: η_Carnot = 1 − T_fría/T_caliente
          (en Kelvin). Un motor con gases a 2.000K y escape a 800K tiene un límite teórico del 60%.
          El ciclo Otto real queda muy por debajo porque no opera en condiciones ideales.
        </p>

        <h3>¿Por qué los motores turboalimentados son más eficientes?</h3>
        <p>
          El turbocompresor usa la energía de los gases de escape (que de otro modo se pierde) para
          comprimir el aire de admisión. Esto permite meter más mezcla en el cilindro sin aumentar su
          tamaño físico (downsizing). Un motor 1.0T puede dar la potencia de un 1.6 atmosférico con
          menor consumo en uso moderado.
        </p>

        <h3>Motores de hidrógeno y el futuro</h3>
        <p>
          El hidrógeno puede quemarse en un motor de combustión interna con modificaciones relativamente
          menores (válvulas, inyectores). Las emisiones son solo vapor de agua. Toyota y BMW están
          desarrollando esta tecnología. La eficiencia es similar al gasolina (~35%), inferior a la
          pila de combustible (~55%). El debate sobre si es preferible quemarlo o usarlo en pilas sigue abierto.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-motor-combustion')} />
      <ShareCard appName="visualizador-motor-combustion" />
      <Footer appName="visualizador-motor-combustion" />
    </div>
  );
}
