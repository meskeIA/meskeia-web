'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorMacroeconomia.module.css';
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
// Tipos y datos de los 6 conceptos
// ─────────────────────────────────────────────

type ConceptoId =
  | 'pib'
  | 'inflacion'
  | 'empleo'
  | 'monetaria'
  | 'fiscal'
  | 'ciclo';

interface Concepto {
  id: ConceptoId;
  num: number;
  icono: string;
  titulo: string;
  subtitulo: string;
  ideaCentral: string;
  comoFunciona: string;
  ejemploCotidiano: string;
  ejemploActual: string;
  paraLlevar: string;
  enlace?: { texto: string; url: string };
}

const CONCEPTOS: Concepto[] = [
  {
    id: 'pib',
    num: 1,
    icono: '📦',
    titulo: 'PIB y crecimiento',
    subtitulo: 'La medida del tamaño de una economía',
    ideaCentral:
      'El Producto Interior Bruto (PIB) es el valor de todo lo que produce un país en un año. Si crece, solemos decir que la economía «va bien»; si cae, que hay recesión. Se reparte en cuatro grandes usos: consumo de los hogares, inversión, gasto público y lo que se vende fuera menos lo que se compra.',
    comoFunciona:
      'PIB = Consumo + Inversión + Gasto público + (Exportaciones − Importaciones). El consumo de las familias suele ser la parte más grande. Cuando esa suma crece de un año a otro, hay crecimiento económico; cuando se contrae dos trimestres seguidos, se habla técnicamente de recesión.',
    ejemploCotidiano:
      'Imagina sumar el valor de todos los cafés servidos, casas construidas, coches fabricados y consultas médicas de un país en un año. Ese montón gigante, medido en euros, es básicamente el PIB.',
    ejemploActual:
      'Tras la caída histórica de 2020 por la pandemia, las economías rebotaron con fuerza en 2021-2022 y después moderaron su crecimiento. Cada décima del PIB se sigue en los telediarios porque condiciona empleo, salarios e impuestos.',
    paraLlevar:
      'El PIB mide la actividad económica, pero no el bienestar: no cuenta el trabajo no pagado, la desigualdad ni el daño ambiental.',
  },
  {
    id: 'inflacion',
    num: 2,
    icono: '🛒',
    titulo: 'Inflación y precios',
    subtitulo: 'Por qué tu dinero compra menos cada año',
    ideaCentral:
      'La inflación es la subida generalizada y sostenida de los precios. Cuando hay inflación, el mismo dinero compra menos: pierdes poder adquisitivo aunque tu sueldo no cambie. Un poco de inflación es normal; mucha, o ninguna, suele ser señal de problemas.',
    comoFunciona:
      'Se mide comparando el precio de una «cesta» de bienes y servicios habituales de un año a otro. Si esa cesta cuesta un 3 % más, la inflación es del 3 %. El efecto se acumula: con inflación moderada sostenida, en una década los precios pueden subir notablemente.',
    ejemploCotidiano:
      'El café que hace unos años costaba 1,20 € hoy te cuesta 1,50 €. No es que el café haya cambiado: es que el dinero vale un poco menos. Eso es inflación en estado puro.',
    ejemploActual:
      'En 2022 la inflación se disparó en Europa por la energía y los cuellos de botella tras la pandemia, llegando a niveles no vistos en décadas. Los bancos centrales reaccionaron subiendo los tipos de interés para frenarla.',
    paraLlevar:
      'El dinero guardado «debajo del colchón» pierde valor con la inflación: por eso importa que ahorro e inversión al menos le sigan el ritmo.',
    enlace: { texto: 'Calcula tu poder adquisitivo: Estimador de Inflación', url: '/estimador-inflacion/' },
  },
  {
    id: 'empleo',
    num: 3,
    icono: '👷',
    titulo: 'Empleo y desempleo',
    subtitulo: 'Quién trabaja y quién busca trabajo',
    ideaCentral:
      'La tasa de paro no mide cuánta gente no trabaja, sino cuántos, queriendo y pudiendo trabajar, no encuentran empleo. Se calcula sobre la población activa: los que trabajan más los que buscan trabajo. Quien no busca (estudiantes, jubilados) queda fuera del cálculo.',
    comoFunciona:
      'Tasa de paro = parados ÷ población activa × 100. Hay distintos tipos: el paro friccional (gente cambiando de empleo), el estructural (desajuste entre lo que se busca y lo que se ofrece) y el cíclico (sube en las crisis y baja en las expansiones).',
    ejemploCotidiano:
      'En un grupo de 100 personas que quieren trabajar, si 12 no encuentran empleo, la tasa de paro es del 12 %. Tu abuela jubilada o tu primo estudiante no cuentan: no están buscando trabajo.',
    ejemploActual:
      'El paro juvenil sigue siendo mucho más alto que el general en buena parte del sur de Europa, mientras que algunos sectores (tecnología, sanidad, hostelería) tienen dificultades para cubrir vacantes. Conviven paro y falta de personal.',
    paraLlevar:
      'Una tasa de paro baja no garantiza buenos empleos: también importan los salarios, la estabilidad y las horas.',
  },
  {
    id: 'monetaria',
    num: 4,
    icono: '🏦',
    titulo: 'Política monetaria',
    subtitulo: 'El banco central y los tipos de interés',
    ideaCentral:
      'El banco central (como el BCE en la zona euro o la Reserva Federal en EE. UU.) controla el precio del dinero: los tipos de interés. Subirlos enfría la economía y frena la inflación; bajarlos la estimula. Es como un termostato para la temperatura económica.',
    comoFunciona:
      'Si los tipos suben, pedir prestado cuesta más: familias y empresas piden menos crédito, gastan e invierten menos, y la presión sobre los precios baja. Si los tipos bajan, el crédito se abarata, se gasta más y la economía se acelera. El banco central busca un equilibrio: inflación contenida sin ahogar el crecimiento.',
    ejemploCotidiano:
      'Cuando suben los tipos, la cuota de una hipoteca variable se encarece y te lo piensas dos veces antes de pedir un préstamo para el coche. Esa prudencia de millones de personas, sumada, enfría la economía.',
    ejemploActual:
      'Entre 2022 y 2023 el BCE subió los tipos del 0 % a más del 4 % en poco más de un año para combatir la inflación. Las hipotecas variables se encarecieron de golpe y el mercado inmobiliario se enfrió.',
    paraLlevar:
      'Los tipos de interés que decide un banco central acaban llegando a tu hipoteca, tus ahorros y tu empleo.',
    enlace: { texto: 'Cómo crea dinero un banco: Cómo Funciona un Banco', url: '/visualizador-como-funciona-banco/' },
  },
  {
    id: 'fiscal',
    num: 5,
    icono: '⚖️',
    titulo: 'Política fiscal',
    subtitulo: 'Lo que el Estado ingresa y gasta',
    ideaCentral:
      'La política fiscal es la otra gran palanca, en manos del Gobierno: cuánto recauda en impuestos y cuánto gasta en sanidad, educación, pensiones o infraestructuras. Si gasta más de lo que ingresa, hay déficit y la deuda crece; si ingresa más de lo que gasta, hay superávit.',
    comoFunciona:
      'Saldo público = ingresos − gastos. En una crisis, el Estado puede gastar más (o bajar impuestos) para sostener la economía, asumiendo déficit. En épocas buenas, lo prudente es reducir ese déficit. La deuda pública es la suma de los déficits acumulados que hay que devolver con intereses.',
    ejemploCotidiano:
      'Es como un presupuesto familiar a lo grande: si la familia (el Estado) gasta más de lo que ingresa, tira de tarjeta (deuda). Puntualmente está bien para una emergencia, pero hacerlo siempre acaba pasando factura en intereses.',
    ejemploActual:
      'Durante la pandemia, casi todos los países dispararon el gasto público (ayudas, sanidad, apoyo al empleo) asumiendo grandes déficits. Años después, reducir esa deuda sigue marcando los debates presupuestarios.',
    paraLlevar:
      'Impuestos y gasto público no son solo cuentas: deciden qué servicios tienes y quién paga por ellos.',
  },
  {
    id: 'ciclo',
    num: 6,
    icono: '🌊',
    titulo: 'Ciclo económico',
    subtitulo: 'Por qué la economía sube y baja',
    ideaCentral:
      'Las economías no crecen en línea recta: alternan fases de expansión (crece la actividad, baja el paro) y de recesión (cae la actividad, sube el paro), pasando por picos y valles. Es el ciclo económico, y entender en qué fase estamos ayuda a interpretar las noticias.',
    comoFunciona:
      'En la expansión aumentan el consumo, la inversión y el empleo hasta un pico. Luego llega el enfriamiento o la recesión, que toca fondo en un valle, desde el que arranca una nueva recuperación. Las políticas monetaria y fiscal intentan suavizar estas oscilaciones: estimular en las malas, contener en las buenas.',
    ejemploCotidiano:
      'Es parecido a las estaciones: sabes que tras el invierno llega la primavera, aunque no sepas el día exacto. La economía también encadena fases buenas y malas que se repiten, sin un calendario fijo.',
    ejemploActual:
      'La secuencia reciente es un buen mapa del ciclo: expansión hasta 2019, recesión brusca en 2020, fuerte recuperación en 2021-2022 y posterior desaceleración. Cada fase exige respuestas de política económica distintas.',
    paraLlevar:
      'Ni las expansiones duran para siempre ni las crisis son eternas: pensar en términos de ciclo evita el pánico y la euforia.',
  },
];

// ─────────────────────────────────────────────
// Visual 1 — Composición del PIB (barra apilada)
// ─────────────────────────────────────────────

const COMPONENTES_PIB = [
  { nombre: 'Consumo de los hogares', sigla: 'C', pct: 57, color: '#2E86AB', desc: 'Lo que gastamos las familias' },
  { nombre: 'Inversión', sigla: 'I', pct: 20, color: '#48A9A6', desc: 'Empresas y vivienda nueva' },
  { nombre: 'Gasto público', sigla: 'G', pct: 20, color: '#e67e22', desc: 'Sanidad, educación, infraestructuras' },
  { nombre: 'Exportaciones netas', sigla: 'XN', pct: 3, color: '#9b59b6', desc: 'Lo que vendemos fuera menos lo que compramos' },
];

function VisualPIB() {
  return (
    <div className={styles.visualWrap}>
      <div className={styles.pibBar} role="img" aria-label="Composición típica del PIB: consumo 57%, inversión 20%, gasto público 20%, exportaciones netas 3%">
        {COMPONENTES_PIB.map((c) => (
          <div key={c.sigla} className={styles.pibSeg} style={{ width: `${c.pct}%`, background: c.color }}>
            {c.pct >= 10 ? `${c.sigla} ${c.pct}%` : c.sigla}
          </div>
        ))}
      </div>
      <div className={styles.cardsGrid} style={{ marginTop: '1rem' }}>
        {COMPONENTES_PIB.map((c) => (
          <div key={c.sigla} className={styles.miniCard} style={{ borderLeftColor: c.color }}>
            <div className={styles.miniCardTitulo}>
              <span style={{ color: c.color, fontWeight: 800 }}>{c.sigla}</span> {c.nombre} · {c.pct}%
            </div>
            <p className={styles.miniCardTexto}>{c.desc}</p>
          </div>
        ))}
      </div>
      <p className={styles.visualLeyenda}>
        Reparto <strong>orientativo</strong> de una economía avanzada. El consumo de los hogares suele ser la pieza
        mayor; por eso, cuando las familias se aprietan el cinturón, el PIB lo nota enseguida.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 2 — Inflación y poder adquisitivo (slider)
// ─────────────────────────────────────────────

function VisualInflacion() {
  const [inflacion, setInflacion] = useState(3);
  const anios = 10;
  const valorFinal = 100 / Math.pow(1 + inflacion / 100, anios);
  const perdida = 100 - valorFinal;

  return (
    <div className={styles.visualWrap}>
      <svg viewBox="0 0 100 100" className={styles.visualSvg} role="img" aria-label={`Con inflación del ${inflacion}% anual, 100 euros equivalen a ${valorFinal.toFixed(0)} euros en 10 años`}>
        <line x1="12" y1="88" x2="95" y2="88" stroke="#ccc" strokeWidth="1.5" />
        <line x1="12" y1="88" x2="12" y2="6" stroke="#ccc" strokeWidth="1.5" />
        <text x="94" y="96" fontSize="6" fill="#999" textAnchor="end">Años</text>
        <text x="4" y="10" fontSize="6" fill="#999">Valor</text>
        {/* Curva de pérdida de poder adquisitivo */}
        <path
          d={(() => {
            const pts: string[] = [];
            for (let a = 0; a <= anios; a++) {
              const v = 100 / Math.pow(1 + inflacion / 100, a);
              const x = 12 + (a / anios) * 80;
              const y = 88 - (v / 100) * 76;
              pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return 'M ' + pts.join(' L ');
          })()}
          stroke="#e74c3c" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="2.5" fill="#48A9A6" />
        <text x="16" y="11" fontSize="5" fill="#48A9A6">100 € hoy</text>
      </svg>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>0 %</span>
        <input
          type="range" min={0} max={15} step={0.5} value={inflacion}
          onChange={(e) => setInflacion(Number(e.target.value))}
          className={styles.slider}
          aria-label="Inflación anual en porcentaje"
        />
        <span className={styles.sliderLabel}>15 %</span>
      </div>
      <div className={styles.datosFila}>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Inflación anual</div>
          <div className={styles.datoValor}>{inflacion.toFixed(1)} %</div>
          <div className={styles.datoNota}>durante 10 años</div>
        </div>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Valor de tus 100 €</div>
          <div className={styles.datoValor} style={{ color: perdida > 25 ? '#e74c3c' : '#e67e22' }}>{valorFinal.toFixed(0)} €</div>
          <div className={styles.datoNota}>pierdes {perdida.toFixed(0)} € de poder</div>
        </div>
      </div>
      <p className={styles.visualLeyenda}>
        Con una inflación del <strong>{inflacion.toFixed(1)} %</strong> mantenida, en 10 años tus 100 € guardados sin
        rendir comprarían lo mismo que <strong>{valorFinal.toFixed(0)} €</strong> de hoy. El efecto se acumula año tras año.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 3 — Empleo y desempleo (slider)
// ─────────────────────────────────────────────

function VisualEmpleo() {
  const [paro, setParo] = useState(12);
  const ocupados = 100 - paro;

  return (
    <div className={styles.visualWrap}>
      <div className={styles.pibBar} role="img" aria-label={`De 100 personas activas, ${ocupados} ocupadas y ${paro} en paro`}>
        <div className={styles.pibSeg} style={{ width: `${ocupados}%`, background: '#27ae60' }}>
          {ocupados >= 10 ? `Ocupados ${ocupados}` : ocupados}
        </div>
        <div className={styles.pibSeg} style={{ width: `${paro}%`, background: '#e74c3c' }}>
          {paro >= 8 ? `Paro ${paro}` : paro}
        </div>
      </div>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Pleno empleo</span>
        <input
          type="range" min={2} max={30} value={paro}
          onChange={(e) => setParo(Number(e.target.value))}
          className={styles.slider}
          aria-label="Tasa de paro en porcentaje"
        />
        <span className={styles.sliderLabel}>Paro alto</span>
      </div>
      <div className={styles.datosFila}>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Población activa</div>
          <div className={styles.datoValor}>100</div>
          <div className={styles.datoNota}>trabajan + buscan trabajo</div>
        </div>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Tasa de paro</div>
          <div className={styles.datoValor} style={{ color: paro > 15 ? '#e74c3c' : paro > 8 ? '#e67e22' : '#27ae60' }}>{paro} %</div>
          <div className={styles.datoNota}>{paro} de cada 100 activos</div>
        </div>
      </div>
      <p className={styles.visualLeyenda}>
        La tasa de paro se calcula <strong>solo sobre la población activa</strong> (quienes trabajan o buscan trabajo).
        Jubilados y estudiantes que no buscan empleo no entran en el cálculo.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 4 — Política monetaria (slider de tipos)
// ─────────────────────────────────────────────

function VisualMonetaria() {
  const [tipo, setTipo] = useState(2);
  // Tipos altos → crédito caro → demanda baja → inflación baja (efecto inverso)
  const credito = Math.round(100 - (tipo / 6) * 85); // facilidad de crédito
  const presionPrecios = Math.round(100 - (tipo / 6) * 80); // presión inflacionista

  return (
    <div className={styles.visualWrap}>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Tipos 0 %</span>
        <input
          type="range" min={0} max={6} step={0.25} value={tipo}
          onChange={(e) => setTipo(Number(e.target.value))}
          className={styles.slider}
          aria-label="Tipo de interés del banco central"
        />
        <span className={styles.sliderLabel}>Tipos 6 %</span>
      </div>
      <div className={styles.datoBloque} style={{ marginBottom: '1rem' }}>
        <div className={styles.datoEtiqueta}>Tipo de interés oficial</div>
        <div className={styles.datoValor}>{tipo.toFixed(2)} %</div>
        <div className={styles.datoNota}>{tipo < 1.5 ? 'política expansiva (acelera)' : tipo > 3.5 ? 'política restrictiva (frena)' : 'política neutral'}</div>
      </div>
      <div className={styles.datosFila}>
        <div className={styles.meterBox}>
          <div className={styles.meterTitulo}>Facilidad para pedir crédito</div>
          <div className={styles.meterTrack}>
            <div className={styles.meterFill} style={{ width: `${credito}%`, background: '#2E86AB' }} />
          </div>
          <div className={styles.meterValor}>{credito}/100</div>
        </div>
        <div className={styles.meterBox}>
          <div className={styles.meterTitulo}>Presión sobre los precios</div>
          <div className={styles.meterTrack}>
            <div className={styles.meterFill} style={{ width: `${presionPrecios}%`, background: presionPrecios > 60 ? '#e74c3c' : '#e67e22' }} />
          </div>
          <div className={styles.meterValor} style={{ color: presionPrecios > 60 ? '#e74c3c' : '#e67e22' }}>{presionPrecios}/100</div>
        </div>
      </div>
      <p className={styles.visualLeyenda}>
        Cuando el banco central <strong>sube</strong> los tipos, el crédito se encarece, se gasta menos y la presión
        sobre los precios baja. Al <strong>bajarlos</strong>, ocurre lo contrario: más crédito, más gasto, más actividad.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 5 — Política fiscal (balanza ingresos/gastos)
// ─────────────────────────────────────────────

function VisualFiscal() {
  const [gasto, setGasto] = useState(110);
  const ingresos = 100;
  const saldo = ingresos - gasto;
  const superavit = saldo >= 0;

  return (
    <div className={styles.visualWrap}>
      <div className={styles.datosFila}>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Ingresos (impuestos)</div>
          <div className={styles.datoValor} style={{ color: '#27ae60' }}>{ingresos}</div>
          <div className={styles.datoNota}>fijos en este ejemplo</div>
        </div>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Gasto público</div>
          <div className={styles.datoValor} style={{ color: '#e67e22' }}>{gasto}</div>
          <div className={styles.datoNota}>sanidad, pensiones, etc.</div>
        </div>
      </div>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Austeridad</span>
        <input
          type="range" min={70} max={140} value={gasto}
          onChange={(e) => setGasto(Number(e.target.value))}
          className={styles.slider}
          aria-label="Gasto público"
        />
        <span className={styles.sliderLabel}>Estímulo</span>
      </div>
      <div className={styles.datoBloque} style={{ marginTop: '1rem', borderColor: superavit ? '#27ae60' : '#e74c3c', borderWidth: 2, borderStyle: 'solid' }}>
        <div className={styles.datoEtiqueta}>{superavit ? 'Superávit' : 'Déficit'}</div>
        <div className={styles.datoValor} style={{ color: superavit ? '#27ae60' : '#e74c3c' }}>
          {superavit ? '+' : ''}{saldo}
        </div>
        <div className={styles.datoNota}>{superavit ? 'ingresa más de lo que gasta (reduce deuda)' : 'gasta más de lo que ingresa (aumenta deuda)'}</div>
      </div>
      <p className={styles.visualLeyenda}>
        Si el Estado gasta más de lo que ingresa, hay <strong>déficit</strong> y la deuda crece. En una crisis, ese
        gasto extra puede sostener la economía; mantenerlo siempre acumula deuda e intereses.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 6 — Ciclo económico (onda + enfoques)
// ─────────────────────────────────────────────

function VisualCiclo() {
  const [enfoque, setEnfoque] = useState<'keynesiano' | 'monetarista'>('keynesiano');

  return (
    <div className={styles.visualWrap}>
      <svg viewBox="0 0 100 60" className={styles.visualSvg} role="img" aria-label="Onda del ciclo económico con fases de expansión, pico, recesión y valle">
        {/* Tendencia */}
        <line x1="6" y1="42" x2="96" y2="22" stroke="#ccc" strokeWidth="1" strokeDasharray="3,2" />
        {/* Onda del ciclo */}
        <path d="M 6,42 Q 20,18 34,30 Q 48,42 62,16 Q 76,32 96,22" stroke="#2E86AB" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Marcadores de fases */}
        <circle cx="20" cy="22" r="2" fill="#27ae60" /><text x="20" y="14" fontSize="5" fill="#27ae60" textAnchor="middle">Pico</text>
        <circle cx="34" cy="30" r="2" fill="#e67e22" />
        <circle cx="48" cy="40" r="2" fill="#e74c3c" /><text x="48" y="52" fontSize="5" fill="#e74c3c" textAnchor="middle">Valle</text>
        <circle cx="62" cy="16" r="2" fill="#27ae60" /><text x="62" y="10" fontSize="5" fill="#27ae60" textAnchor="middle">Pico</text>
        <text x="13" y="50" fontSize="4.5" fill="#999">Recuper.</text>
        <text x="40" y="24" fontSize="4.5" fill="#999">Recesión</text>
      </svg>
      <p className={styles.visualLeyenda} style={{ marginBottom: '1rem' }}>
        La actividad <strong>oscila</strong> alrededor de una tendencia de crecimiento: expansión → pico → recesión →
        valle → recuperación, y vuelta a empezar.
      </p>
      <h4 className={styles.seccionTitulo} style={{ fontSize: '0.9rem' }}>¿Qué hacer en una recesión? Dos enfoques</h4>
      <div className={styles.toggleRow} role="group" aria-label="Enfoque económico">
        <button type="button" className={`${styles.toggleBtn} ${enfoque === 'keynesiano' ? styles.toggleActivo : ''}`} aria-pressed={enfoque === 'keynesiano'} onClick={() => setEnfoque('keynesiano')}>
          Enfoque keynesiano
        </button>
        <button type="button" className={`${styles.toggleBtn} ${enfoque === 'monetarista' ? styles.toggleActivo : ''}`} aria-pressed={enfoque === 'monetarista'} onClick={() => setEnfoque('monetarista')}>
          Enfoque monetarista
        </button>
      </div>
      <div className={styles.miniCard}>
        <p className={styles.miniCardTexto}>
          {enfoque === 'keynesiano'
            ? 'Pone el acento en la demanda: en una recesión, el Estado debería gastar más e invertir para sostener la actividad y el empleo, aunque sea a costa de déficit temporal. Asociado a las ideas que popularizó John Maynard Keynes.'
            : 'Pone el acento en el dinero y los precios: desconfía de la intervención fiscal continua y prioriza una política monetaria estable y predecible para controlar la inflación, dejando que los mercados se ajusten. Asociado a autores como Milton Friedman.'}
        </p>
      </div>
      <p className={styles.visualLeyenda} style={{ marginTop: '0.8rem' }}>
        Son <strong>marcos de análisis con supuestos distintos</strong>, no verdades cerradas. La política económica
        real suele combinar elementos de ambos según el contexto.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Render del visual según concepto
// ─────────────────────────────────────────────

function VisualDelConcepto({ id }: { id: ConceptoId }) {
  switch (id) {
    case 'pib': return <VisualPIB />;
    case 'inflacion': return <VisualInflacion />;
    case 'empleo': return <VisualEmpleo />;
    case 'monetaria': return <VisualMonetaria />;
    case 'fiscal': return <VisualFiscal />;
    case 'ciclo': return <VisualCiclo />;
  }
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMacroeconomiaPage() {
  const [activo, setActivo] = useState<ConceptoId>('pib');
  const concepto = CONCEPTOS.find((c) => c.id === activo)!;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Macroeconomía Visual</h1>
        <p className={styles.subtitle}>Un recorrido por cómo funciona la economía de un país, concepto a concepto</p>
      </header>

      <LegalNotice />

      <div className={styles.intro}>
        <p className={styles.introTexto}>
          La <strong>macroeconomía</strong> mira la economía en su conjunto: el crecimiento de un país, los precios, el
          empleo y las grandes palancas que los gobiernos y los bancos centrales usan para influir en ellos. Aquí tienes
          sus <strong>6 ideas fundamentales</strong>, cada una con un ejemplo cotidiano, un caso actual y un visual interactivo.
        </p>
      </div>

      {/* Selector de conceptos */}
      <div className={styles.conceptosGrid} role="list">
        {CONCEPTOS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="listitem"
            className={`${styles.conceptoBtn} ${activo === c.id ? styles.conceptoActivo : ''}`}
            onClick={() => setActivo(c.id)}
            aria-pressed={activo === c.id}
          >
            <span className={styles.conceptoNum}>{c.num}</span>
            <span className={styles.conceptoIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.conceptoTitulo}>{c.titulo}</span>
          </button>
        ))}
      </div>

      {/* Panel del concepto activo */}
      <div className={styles.panel} key={concepto.id}>
        <div className={styles.panelHeader}>
          <span className={styles.panelIcono} aria-hidden="true">{concepto.icono}</span>
          <div>
            <h2 className={styles.panelTitulo}>{concepto.titulo}</h2>
            <p className={styles.panelSubtitulo}>{concepto.subtitulo}</p>
          </div>
        </div>

        <p className={styles.panelDescripcion}>{concepto.ideaCentral}</p>

        {/* Visual interactivo */}
        <h3 className={styles.seccionTitulo}>Pruébalo</h3>
        <VisualDelConcepto id={concepto.id} />

        {/* Cómo funciona */}
        <div className={styles.mecanismoCard}>
          <div className={styles.mecanismoTitulo}>Cómo funciona</div>
          <p className={styles.mecanismoTexto}>{concepto.comoFunciona}</p>
        </div>

        {/* Ejemplos */}
        <div className={styles.ejemplosFila}>
          <div className={`${styles.ejemploCard} ${styles.ejemploCotidiano}`}>
            <div className={styles.ejemploTitulo}><span aria-hidden="true">🏠</span> En tu día a día</div>
            <p className={styles.ejemploTexto}>{concepto.ejemploCotidiano}</p>
          </div>
          <div className={`${styles.ejemploCard} ${styles.ejemploActual}`}>
            <div className={styles.ejemploTitulo}><span aria-hidden="true">📰</span> Caso actual</div>
            <p className={styles.ejemploTexto}>{concepto.ejemploActual}</p>
          </div>
        </div>

        {/* Para llevar */}
        <div className={styles.paraLlevar} role="note">
          <span className={styles.paraLlevarIcono} aria-hidden="true">💡</span>
          <p className={styles.paraLlevarTexto}>{concepto.paraLlevar}</p>
        </div>

        {/* Enlace a app relacionada */}
        {concepto.enlace && (
          <a href={concepto.enlace.url} className={styles.enlaceApp}>
            <span aria-hidden="true">→</span> {concepto.enlace.texto}
          </a>
        )}
      </div>

      {/* Mapa de los 6 conceptos */}
      <div className={styles.resumenCard}>
        <h3 className={styles.resumenTitulo}>El mapa de la macroeconomía</h3>
        <div className={styles.resumenGrid}>
          {CONCEPTOS.map((c) => (
            <button key={c.id} type="button" className={styles.resumenItem} onClick={() => setActivo(c.id)}>
              <span className={styles.resumenIcono} aria-hidden="true">{c.icono}</span>
              <span>
                <span className={styles.resumenNombre}>{c.num}. {c.titulo}</span>
                {' — '}
                <span className={styles.resumenDesc}>{c.subtitulo}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection title="Macroeconomía en profundidad" subtitle="Conceptos, matices y enfoques" defaultOpen={false}>
        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Las dos grandes palancas: monetaria y fiscal</h3>
          <p className={styles.eduTexto}>
            Para influir en la economía hay dos grandes herramientas. La <strong>política monetaria</strong> la maneja
            el banco central a través de los tipos de interés y la cantidad de dinero. La <strong>política fiscal</strong>{' '}
            la maneja el Gobierno mediante impuestos y gasto público. Suelen coordinarse, pero responden a instituciones
            distintas y a veces tiran en direcciones opuestas.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>El PIB mide actividad, no bienestar</h3>
          <p className={styles.eduTexto}>
            El PIB es muy útil para comparar el tamaño y el crecimiento de las economías, pero tiene límites reconocidos:
            no recoge el trabajo doméstico no remunerado, no dice nada sobre cómo se reparte la riqueza y puede subir
            aunque se deteriore el medio ambiente. Por eso conviene mirarlo junto a otros indicadores (empleo,
            desigualdad, salud, sostenibilidad), no de forma aislada.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Inflación: ni mucha ni ninguna</h3>
          <p className={styles.eduTexto}>
            Muchos bancos centrales fijan como objetivo una inflación baja y estable, en torno al 2 % anual. Una
            inflación muy alta desordena la economía y erosiona los ahorros; una inflación negativa sostenida
            (deflación) puede ser igual de dañina, porque la gente aplaza el consumo esperando precios más bajos y la
            actividad se frena. El equilibrio es un objetivo central de la política económica.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Distintas escuelas, distintas recetas</h3>
          <p className={styles.eduTexto}>
            No existe un consenso único sobre cuánto y cómo debe intervenir el Estado en la economía. Enfoques que
            popularizaron autores como Keynes ponen el acento en sostener la demanda en las crisis; otros, como los
            asociados a Friedman, priorizan la estabilidad monetaria y la confianza en los mercados. Conviene tratarlos
            como <em>marcos de análisis con supuestos distintos</em>: la mejor respuesta suele depender del contexto y
            de qué se quiera priorizar.
          </p>
        </div>

        <div className={styles.warningBox} role="note">
          <strong>Nota educativa:</strong> los valores numéricos de los visuales (composición del PIB, tasas, tipos de
          interés, saldos) son ejemplos simplificados y orientativos para ilustrar los mecanismos, no datos
          estadísticos de un país concreto ni en un momento determinado.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-macroeconomia')} />
      <ShareCard appName="visualizador-macroeconomia" />
      <Footer appName="visualizador-macroeconomia" />
    </div>
  );
}
