'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorClima.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'tiempo' | 'invernadero' | 'corrientes' | 'calentamiento';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'tiempo', titulo: 'Tiempo vs clima', icono: '🌤️', subtitulo: 'Corto plazo vs patrones de 30+ años' },
  { id: 'invernadero', titulo: 'Efecto invernadero', icono: '🌡️', subtitulo: 'La manta térmica de la Tierra' },
  { id: 'corrientes', titulo: 'Las corrientes', icono: '🌊', subtitulo: 'El sistema circulatorio del planeta' },
  { id: 'calentamiento', titulo: '+1°C, +2°C, +4°C', icono: '🔥', subtitulo: 'Cada grado cuenta' },
];

// ─────────────────────────────────────────────
// Datos del CO2 histórico
// ─────────────────────────────────────────────

interface CO2Dato {
  anio: string;
  ppm: number;
  contexto: string;
}

const CO2_HISTORICO: CO2Dato[] = [
  { anio: '1750', ppm: 280, contexto: 'Preindustrial' },
  { anio: '1900', ppm: 296, contexto: 'Revolución industrial' },
  { anio: '1950', ppm: 311, contexto: 'Posguerra' },
  { anio: '1980', ppm: 339, contexto: 'Primeras alertas científicas' },
  { anio: '2000', ppm: 369, contexto: 'Protocolo de Kioto' },
  { anio: '2015', ppm: 400, contexto: 'Acuerdo de París' },
  { anio: '2024', ppm: 425, contexto: 'Hoy' },
];

// ─────────────────────────────────────────────
// Datos de calentamiento por nivel
// ─────────────────────────────────────────────

interface NivelCalentamiento {
  grados: number;
  titulo: string;
  estado: string;
  color: string;
  colorDark: string;
  impactos: { icono: string; titulo: string; descripcion: string }[];
}

const NIVELES_CALENTAMIENTO: NivelCalentamiento[] = [
  {
    grados: 1,
    titulo: '+1°C — Donde estamos ahora',
    estado: 'Realidad actual (2024)',
    color: '#F59E0B',
    colorDark: '#D97706',
    impactos: [
      { icono: '🌊', titulo: 'Nivel del mar +20 cm', descripcion: 'Respecto a 1900. Islas del Pacífico ya pierden territorio.' },
      { icono: '🔥', titulo: 'Olas de calor extremo', descripcion: 'Las olas de calor son 5 veces más frecuentes que hace 50 años.' },
      { icono: '🪸', titulo: 'Blanqueamiento de coral', descripcion: 'El 50% de la Gran Barrera de Coral ha sufrido blanqueamiento.' },
      { icono: '🧊', titulo: 'Hielo ártico -40%', descripcion: 'El Ártico ha perdido el 40% de su hielo marino de verano desde 1979.' },
    ],
  },
  {
    grados: 2,
    titulo: '+2°C — El límite de París',
    estado: 'Objetivo del Acuerdo de París (2015)',
    color: '#EF4444',
    colorDark: '#DC2626',
    impactos: [
      { icono: '🌊', titulo: 'Nivel del mar +0,5 m', descripcion: 'Ciudades costeras como Miami, Shanghái o Bombay en riesgo de inundaciones regulares.' },
      { icono: '⛈️', titulo: 'Eventos extremos x2', descripcion: 'Huracanes, sequías e inundaciones duplican su frecuencia e intensidad.' },
      { icono: '🪸', titulo: '99% del coral muere', descripcion: 'Los arrecifes tropicales prácticamente desaparecen, afectando a 500 millones de personas.' },
      { icono: '🌾', titulo: 'Crisis alimentaria', descripcion: 'Caída del 10-25% en rendimiento de cultivos en regiones tropicales.' },
    ],
  },
  {
    grados: 4,
    titulo: '+4°C — Escenario catastrófico',
    estado: 'Trayectoria si no se actúa',
    color: '#991B1B',
    colorDark: '#7F1D1D',
    impactos: [
      { icono: '🌊', titulo: 'Nivel del mar +1 m o más', descripcion: 'Colapso parcial de Groenlandia y Antártida Occidental. Cientos de millones de desplazados.' },
      { icono: '🏜️', titulo: 'Zonas inhabitables', descripcion: 'Partes del trópico superan los 50°C regularmente. Migraciones masivas.' },
      { icono: '🦤', titulo: 'Extinción masiva', descripcion: 'El 50% de las especies pierden más de la mitad de su hábitat.' },
      { icono: '🌾', titulo: 'Colapso agrícola', descripcion: 'Producción global de alimentos cae drásticamente. Hambrunas generalizadas.' },
    ],
  },
];

// ─────────────────────────────────────────────
// Sección 1: Tiempo vs clima
// ─────────────────────────────────────────────

function SeccionTiempo() {
  const factores = [
    { icono: '☀️', nombre: 'Radiación solar', descripcion: 'La energía del Sol calienta la superficie. Varía ligeramente con ciclos de 11 años.' },
    { icono: '🌫️', nombre: 'Atmósfera', descripcion: 'Los gases retienen calor (efecto invernadero) y distribuyen la energía por el planeta.' },
    { icono: '🌊', nombre: 'Océanos', descripcion: 'Almacenan el 90% del calor extra. Las corrientes redistribuyen la temperatura globalmente.' },
    { icono: '🏔️', nombre: 'Superficie terrestre', descripcion: 'Hielo, bosques, desiertos y ciudades reflejan o absorben calor de forma diferente (albedo).' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El <strong>tiempo meteorológico</strong> es lo que pasa mañana. El <strong>clima</strong> es el patrón de lo que pasa durante décadas. Confundirlos es como confundir tu estado de ánimo hoy con tu personalidad.</p>
      </div>

      {/* Comparación visual */}
      <div className={styles.comparacionGrid}>
        <div className={styles.comparacionCard}>
          <div className={styles.comparacionIcono}>
            <span aria-hidden="true">🌧️</span>
          </div>
          <h3 className={styles.comparacionTitulo}>Tiempo meteorológico</h3>
          <ul className={styles.comparacionLista}>
            <li>Horas a días</li>
            <li>&quot;Mañana llueve&quot;</li>
            <li>Local y variable</li>
            <li>Predecible: 7-10 días</li>
          </ul>
          <div className={styles.comparacionEjemplo}>
            Ejemplo: &quot;Ayer nevó en Madrid&quot;
          </div>
        </div>
        <div className={styles.comparacionVs}>
          <span>vs</span>
        </div>
        <div className={styles.comparacionCard}>
          <div className={styles.comparacionIcono}>
            <span aria-hidden="true">🌍</span>
          </div>
          <h3 className={styles.comparacionTitulo}>Clima</h3>
          <ul className={styles.comparacionLista}>
            <li>Décadas a siglos (30+ años)</li>
            <li>&quot;Los inviernos son más cálidos&quot;</li>
            <li>Regional y global</li>
            <li>Tendencias a largo plazo</li>
          </ul>
          <div className={styles.comparacionEjemplo}>
            Ejemplo: &quot;La temperatura media ha subido 1°C en 150 años&quot;
          </div>
        </div>
      </div>

      {/* Balance energético */}
      <div className={styles.balanceCard}>
        <h3 className={styles.balanceTitulo}>Balance energético de la Tierra</h3>
        <p className={styles.balanceSubtitulo}>La Tierra recibe energía del Sol y devuelve la misma cantidad al espacio. Si este balance se rompe, la temperatura cambia.</p>
        <div className={styles.balanceDiagrama}>
          <div className={styles.balanceFlujo}>
            <div className={styles.balanceFlecha} style={{ background: '#F59E0B' }}>
              <span className={styles.balanceFlechaTexto}>Radiación solar entrante</span>
              <span className={styles.balanceFlechaValor}>340 W/m²</span>
            </div>
            <div className={styles.balanceTierra}>
              <span aria-hidden="true">🌍</span>
              <span className={styles.balanceTierraTexto}>Tierra</span>
            </div>
            <div className={styles.balanceFlecha} style={{ background: '#EF4444' }}>
              <span className={styles.balanceFlechaTexto}>Radiación infrarroja saliente</span>
              <span className={styles.balanceFlechaValor}>~340 W/m²</span>
            </div>
          </div>
          <div className={styles.balanceNota}>
            Si entra más energía de la que sale = calentamiento. Eso es exactamente lo que pasa con el exceso de CO2.
          </div>
        </div>
      </div>

      {/* Factores clave */}
      <h3 className={styles.subtituloSeccion}>Factores que determinan el clima</h3>
      <div className={styles.factoresGrid}>
        {factores.map((f, i) => (
          <div key={i} className={styles.factorCard}>
            <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
            <span className={styles.factorNombre}>{f.nombre}</span>
            <span className={styles.factorDesc}>{f.descripcion}</span>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Cuando alguien dice &quot;hoy hace frío, ¿dónde está el calentamiento global?&quot;, confunde <strong>tiempo</strong> con <strong>clima</strong>. Un día frío no contradice una tendencia de décadas, igual que un mal día no cambia tu personalidad.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Efecto invernadero
// ─────────────────────────────────────────────

function SeccionInvernadero() {
  const pasos = [
    { icono: '☀️', titulo: 'Radiación solar entra', descripcion: 'La luz del Sol atraviesa la atmósfera y calienta la superficie terrestre.' },
    { icono: '🔴', titulo: 'Infrarrojo sale', descripcion: 'La Tierra, caliente, emite radiación infrarroja (calor) hacia el espacio.' },
    { icono: '🛡️', titulo: 'Los gases la atrapan', descripcion: 'CO2, metano y otros gases absorben parte de ese infrarrojo y lo reemiten hacia la superficie.' },
    { icono: '🌡️', titulo: 'La Tierra se calienta', descripcion: 'Sin este efecto, la temperatura media sería -18°C en vez de +15°C. El problema: estamos intensificándolo.' },
  ];

  const maxPpm = Math.max(...CO2_HISTORICO.map(d => d.ppm));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El efecto invernadero es <strong>natural y necesario</strong> — sin él, la Tierra sería una bola de hielo. El problema es que hemos añadido tanto CO2 extra que la manta térmica es demasiado gruesa.</p>
      </div>

      {/* Paso a paso del efecto invernadero */}
      <div className={styles.pasosGrid}>
        {pasos.map((p, i) => (
          <div key={i} className={styles.pasoCard}>
            <div className={styles.pasoNumero}>{i + 1}</div>
            <span className={styles.pasoIcono} aria-hidden="true">{p.icono}</span>
            <h3 className={styles.pasoTitulo}>{p.titulo}</h3>
            <p className={styles.pasoDesc}>{p.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Comparación con/sin */}
      <div className={styles.tempComparacion}>
        <div className={styles.tempCard}>
          <span className={styles.tempIcono} aria-hidden="true">❄️</span>
          <span className={styles.tempValor} style={{ color: '#3B82F6' }}>-18°C</span>
          <span className={styles.tempLabel}>Sin efecto invernadero</span>
          <span className={styles.tempDetalle}>Tierra congelada, sin vida</span>
        </div>
        <div className={styles.tempFlecha}>
          <span>Gases invernadero</span>
          <span className={styles.tempFlechaIcono}>→</span>
          <span>+33°C</span>
        </div>
        <div className={styles.tempCard}>
          <span className={styles.tempIcono} aria-hidden="true">🌍</span>
          <span className={styles.tempValor} style={{ color: '#22C55E' }}>+15°C</span>
          <span className={styles.tempLabel}>Con efecto invernadero natural</span>
          <span className={styles.tempDetalle}>Temperatura media actual</span>
        </div>
      </div>

      {/* Barras de CO2 */}
      <div className={styles.co2Card}>
        <h3 className={styles.co2Titulo}>CO2 en la atmósfera: de 280 a 425 ppm</h3>
        <p className={styles.co2Subtitulo}>Partes por millón (ppm) de CO2 atmosférico desde la era preindustrial</p>
        <div className={styles.co2Barras}>
          {CO2_HISTORICO.map((d, i) => (
            <div key={i} className={styles.co2BarraItem}>
              <span className={styles.co2BarraValor}>{formatNumber(d.ppm, 0)}</span>
              <div className={styles.co2BarraContainer}>
                <div
                  className={styles.co2Barra}
                  style={{
                    height: `${(d.ppm / maxPpm) * 100}%`,
                    background: d.ppm > 370 ? '#EF4444' : d.ppm > 310 ? '#F59E0B' : '#22C55E',
                  }}
                />
              </div>
              <span className={styles.co2BarraAnio}>{d.anio}</span>
              <span className={styles.co2BarraContexto}>{d.contexto}</span>
            </div>
          ))}
        </div>
        <div className={styles.co2Nota}>
          En 800.000 años de registros de hielo, el CO2 nunca superó 300 ppm. Hoy estamos en 425 ppm.
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El efecto invernadero no es el villano — es lo que hace habitable la Tierra. El problema es la <strong>velocidad</strong>: hemos aumentado el CO2 un 50% en solo 200 años, algo que en la naturaleza tardaría decenas de miles de años.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Las corrientes
// ─────────────────────────────────────────────

function SeccionCorrientes() {
  const corrientes = [
    {
      nombre: 'Gulf Stream (Corriente del Golfo)',
      icono: '🔴',
      tipo: 'Cálida',
      efecto: 'Calienta Europa occidental. Sin ella, Londres tendría el clima de Calgary (-10°C en invierno en vez de +5°C).',
      dato: 'Transporta 30 veces más agua que todos los ríos del mundo juntos.',
      color: '#EF4444',
    },
    {
      nombre: 'Corriente de Humboldt',
      icono: '🔵',
      tipo: 'Fría',
      efecto: 'Enfría la costa de Perú y Chile. Trae nutrientes del fondo que alimentan una de las pesquerías más ricas del mundo.',
      dato: 'Es la razón de que Lima (12°S) sea más fría que ciudades a la misma latitud en Brasil.',
      color: '#3B82F6',
    },
    {
      nombre: 'Corriente Circumpolar Antártica',
      icono: '🔵',
      tipo: 'Fría',
      efecto: 'Rodea la Antártida y la aísla térmicamente. Es la corriente más potente del planeta.',
      dato: 'Transporta 135 millones de m³ de agua por segundo — 600 veces el Amazonas.',
      color: '#3B82F6',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los océanos cubren el 71% de la Tierra y actúan como un <strong>sistema circulatorio gigante</strong>. Las corrientes redistribuyen el calor del ecuador a los polos, haciendo habitables zonas que de otro modo serían extremas.</p>
      </div>

      {/* Cinta transportadora */}
      <div className={styles.cintaCard}>
        <h3 className={styles.cintaTitulo}>La &ldquo;Cinta Transportadora&rdquo; global</h3>
        <p className={styles.cintaDesc}>
          Un circuito de corrientes conecta todos los océanos. El agua caliente viaja por la superficie hacia los polos, se enfría, se vuelve densa y se hunde. Luego vuelve por el fondo hacia el ecuador. Un ciclo completo tarda <strong>~1.000 años</strong>.
        </p>
        <div className={styles.cintaDiagrama}>
          <div className={styles.cintaPaso}>
            <span className={styles.cintaPasoNum}>1</span>
            <span className={styles.cintaPasoIcono} aria-hidden="true">🌡️</span>
            <span className={styles.cintaPasoTexto}>Agua caliente viaja por superficie hacia el norte</span>
          </div>
          <div className={styles.cintaFlecha}>→</div>
          <div className={styles.cintaPaso}>
            <span className={styles.cintaPasoNum}>2</span>
            <span className={styles.cintaPasoIcono} aria-hidden="true">❄️</span>
            <span className={styles.cintaPasoTexto}>Se enfría cerca del Ártico, se vuelve densa y se hunde</span>
          </div>
          <div className={styles.cintaFlecha}>→</div>
          <div className={styles.cintaPaso}>
            <span className={styles.cintaPasoNum}>3</span>
            <span className={styles.cintaPasoIcono} aria-hidden="true">🌊</span>
            <span className={styles.cintaPasoTexto}>Agua fría vuelve por el fondo hacia el ecuador</span>
          </div>
          <div className={styles.cintaFlecha}>→</div>
          <div className={styles.cintaPaso}>
            <span className={styles.cintaPasoNum}>4</span>
            <span className={styles.cintaPasoIcono} aria-hidden="true">☀️</span>
            <span className={styles.cintaPasoTexto}>Se calienta de nuevo y sube a la superficie</span>
          </div>
        </div>
      </div>

      {/* Corrientes principales */}
      <h3 className={styles.subtituloSeccion}>Corrientes clave</h3>
      <div className={styles.corrientesGrid}>
        {corrientes.map((c, i) => (
          <div key={i} className={styles.corrienteCard} style={{ borderLeftColor: c.color }}>
            <div className={styles.corrienteHeader}>
              <span aria-hidden="true">{c.icono}</span>
              <div>
                <h3 className={styles.corrienteNombre}>{c.nombre}</h3>
                <span className={styles.corrienteTipo} style={{ color: c.color }}>{c.tipo}</span>
              </div>
            </div>
            <p className={styles.corrienteEfecto}>{c.efecto}</p>
            <p className={styles.corrienteDato}>{c.dato}</p>
          </div>
        ))}
      </div>

      {/* Comparación Londres vs Calgary */}
      <div className={styles.comparacionCiudades}>
        <h3 className={styles.comparacionCiudadesTitulo}>El poder de la Gulf Stream</h3>
        <p className={styles.comparacionCiudadesSubtitulo}>Misma latitud (~51°N), clima completamente diferente</p>
        <div className={styles.ciudadesGrid}>
          <div className={styles.ciudadCard}>
            <span className={styles.ciudadIcono} aria-hidden="true">🇬🇧</span>
            <span className={styles.ciudadNombre}>Londres</span>
            <span className={styles.ciudadTemp} style={{ color: '#22C55E' }}>+5°C en invierno</span>
            <span className={styles.ciudadDetalle}>Calentada por la Gulf Stream</span>
          </div>
          <div className={styles.ciudadVs}>
            <span>misma latitud</span>
            <span className={styles.ciudadDelta}>Diferencia: ~15°C</span>
          </div>
          <div className={styles.ciudadCard}>
            <span className={styles.ciudadIcono} aria-hidden="true">🇨🇦</span>
            <span className={styles.ciudadNombre}>Calgary</span>
            <span className={styles.ciudadTemp} style={{ color: '#3B82F6' }}>-10°C en invierno</span>
            <span className={styles.ciudadDetalle}>Sin corriente cálida</span>
          </div>
        </div>
      </div>

      {/* El Niño / La Niña */}
      <div className={styles.ninoCard}>
        <h3 className={styles.ninoTitulo}>El Niño y La Niña</h3>
        <p className={styles.ninoDesc}>Oscilaciones naturales en el Pacífico tropical que alteran el clima mundial cada 2-7 años.</p>
        <div className={styles.ninoGrid}>
          <div className={styles.ninoItem}>
            <span className={styles.ninoItemIcono} aria-hidden="true">🔥</span>
            <h4 className={styles.ninoItemTitulo}>El Niño</h4>
            <p className={styles.ninoItemDesc}>Aguas del Pacífico oriental se calientan. Sequías en Australia e Indonesia, lluvias en América del Sur, aumento temporal de temperatura global.</p>
          </div>
          <div className={styles.ninoItem}>
            <span className={styles.ninoItemIcono} aria-hidden="true">❄️</span>
            <h4 className={styles.ninoItemTitulo}>La Niña</h4>
            <p className={styles.ninoItemDesc}>Efecto opuesto: aguas más frías de lo normal. Más huracanes en el Atlántico, inundaciones en Australia, sequías en el sur de EE.UU.</p>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El calentamiento global amenaza con debilitar la cinta transportadora oceánica. Si la Gulf Stream se frena significativamente, <strong>Europa podría enfriarse varios grados</strong> paradójicamente, mientras el resto del planeta se calienta.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: +1°C, +2°C, +4°C
// ─────────────────────────────────────────────

function SeccionCalentamiento({ nivelIdx, setNivelIdx }: { nivelIdx: number; setNivelIdx: (v: number) => void }) {
  const nivel = NIVELES_CALENTAMIENTO[nivelIdx];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La diferencia entre +1°C y +4°C parece pequeña, pero en términos climáticos es <strong>enorme</strong>. La diferencia entre la última era glacial y hoy son solo ~5°C. Cada grado cuenta.</p>
      </div>

      {/* Slider de temperatura */}
      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Nivel de calentamiento global</label>
          <span className={styles.sliderValor} style={{ color: nivel.color }}>+{nivel.grados}°C</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={2}
          value={nivelIdx}
          onChange={(e) => setNivelIdx(parseInt(e.target.value))}
          aria-label={`Nivel de calentamiento: +${nivel.grados}°C`}
          style={{
            background: `linear-gradient(to right, #F59E0B, #EF4444, #991B1B)`,
          }}
        />
        <div className={styles.sliderExtremos}>
          <span>+1°C (ahora)</span>
          <span>+2°C (París)</span>
          <span>+4°C (catastrófico)</span>
        </div>
      </div>

      {/* Cabecera del nivel */}
      <div className={styles.nivelHeader} style={{ borderColor: nivel.color }}>
        <h3 className={styles.nivelTitulo} style={{ color: nivel.color }}>{nivel.titulo}</h3>
        <span className={styles.nivelEstado}>{nivel.estado}</span>
      </div>

      {/* Termómetro visual */}
      <div className={styles.termometroContainer}>
        <div className={styles.termometro}>
          <div className={styles.termometroRelleno} style={{
            height: `${nivel.grados === 1 ? 25 : nivel.grados === 2 ? 50 : 100}%`,
            background: `linear-gradient(to top, ${nivel.color}, ${nivel.color}CC)`,
          }} />
        </div>
        <div className={styles.termometroEscala}>
          <span style={{ color: '#991B1B' }}>+4°C</span>
          <span style={{ color: '#EF4444' }}>+2°C</span>
          <span style={{ color: '#F59E0B' }}>+1°C</span>
          <span style={{ color: '#22C55E' }}>0°C (preindustrial)</span>
        </div>
      </div>

      {/* Impactos */}
      <div className={styles.impactosGrid}>
        {nivel.impactos.map((imp, i) => (
          <div key={i} className={styles.impactoCard} style={{ borderTopColor: nivel.color }}>
            <span className={styles.impactoIcono} aria-hidden="true">{imp.icono}</span>
            <h4 className={styles.impactoTitulo}>{imp.titulo}</h4>
            <p className={styles.impactoDesc}>{imp.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Referencia: era glacial */}
      <div className={styles.referenciaCard}>
        <span className={styles.referenciaIcono} aria-hidden="true">🧊</span>
        <div className={styles.referenciaTexto}>
          <strong>Perspectiva histórica:</strong> la última era glacial (hace {formatNumber(20000, 0)} años) fue solo ~5°C más fría que hoy.
          Con esos 5°C de diferencia, el hielo cubría toda Escandinavia, el norte de Europa y gran parte de Norteamérica.
          Un cambio de +4°C en dirección opuesta sería igualmente radical.
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          {nivel.grados === 1 && 'Ya estamos viviendo los efectos del +1°C. Las olas de calor récord, los incendios forestales y las inundaciones extremas de los últimos años no son casualidad.'}
          {nivel.grados === 2 && 'El Acuerdo de París fijó +2°C como límite (idealmente +1,5°C). Para lograrlo, las emisiones globales deben reducirse a la mitad antes de 2030 y llegar a cero neto antes de 2050.'}
          {nivel.grados === 4 && 'Un mundo +4°C sería irreconocible. No es el peor escenario posible, pero sería catastrófico para la civilización tal como la conocemos. La buena noticia: aún estamos a tiempo de evitarlo.'}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorClimaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('tiempo');
  const [nivelCalentamiento, setNivelCalentamiento] = useState(0);

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'tiempo': return <SeccionTiempo />;
      case 'invernadero': return <SeccionInvernadero />;
      case 'corrientes': return <SeccionCorrientes />;
      case 'calentamiento': return <SeccionCalentamiento nivelIdx={nivelCalentamiento} setNivelIdx={setNivelCalentamiento} />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo Funciona el Clima</h1>
          <p className={styles.subtitle}>Efecto invernadero, corrientes oceánicas y por qué cada grado importa</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
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
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre la ciencia del clima"
          subtitle="Preguntas frecuentes sobre el cambio climático"
          defaultOpen={false}
        >
          <h3>¿El cambio climático es causado por humanos?</h3>
          <p>
            Sí. El <strong>consenso científico es del 97%+</strong>: el calentamiento observado desde mediados del siglo XX
            se debe principalmente a la emisión de gases de efecto invernadero por actividades humanas (quema de combustibles
            fósiles, deforestación, agricultura industrial). Los ciclos naturales (Sol, volcanes, órbita) no explican
            la velocidad del cambio actual.
          </p>

          <h3>¿Qué son los &quot;puntos de no retorno&quot;?</h3>
          <p>
            Son umbrales a partir de los cuales un cambio se vuelve irreversible: el deshielo de Groenlandia, el colapso
            del Amazonas, la liberación del permafrost. Algunos ya se están acercando. Una vez cruzados, se retroalimentan
            y aceleran el calentamiento aunque dejemos de emitir CO2.
          </p>

          <h3>¿Es demasiado tarde?</h3>
          <p>
            No. Cada décima de grado que evitemos importa. La diferencia entre +1,5°C y +2°C es enorme en términos de
            ecosistemas, vidas humanas y especies salvadas. Las tecnologías para la transición (solar, eólica, baterías,
            eficiencia) ya existen y son cada vez más baratas. Lo que falta es velocidad de implementación.
          </p>

          <h3>¿Qué puedo hacer yo?</h3>
          <p>
            Las acciones individuales importan, pero el cambio sistémico es lo decisivo: votar por políticas climáticas,
            reducir vuelos y consumo de carne, electrificar el hogar y el transporte, y presionar a empresas y gobiernos.
            No se trata de perfección individual sino de <strong>transformación colectiva</strong>.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de climatología con fines educativos. El sistema
            climático es extraordinariamente complejo e involucra retroalimentaciones, ciclos biogeoquímicos y dinámicas
            no lineales que van más allá de lo presentado aquí. Los datos proceden del IPCC (AR6, 2021-2023) y fuentes
            científicas de referencia.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-clima')} />
        <ShareCard appName="visualizador-clima" />
        <Footer appName="visualizador-clima" />
      </div>
    </>
  );
}
