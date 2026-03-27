'use client';

import { useState } from 'react';
import styles from './AsesorVehiculo.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency } from '@/lib';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface Opcion {
  valor: string;
  etiqueta: string;
  desc: string;
}

interface Pregunta {
  id: number;
  categoria: string;
  pregunta: string;
  icon: string;
  opciones: Opcion[];
}

interface CostesMotorizacion {
  combustible: number;
  mantenimiento: number;
  total: number;
}

type TipoMotor = 'gasolina' | 'diesel' | 'hibrido' | 'electrico';

interface Resultado {
  segmento: string;
  iconSegmento: string;
  descripcionSegmento: string;
  motorizacion: string;
  iconMotor: string;
  descripcionMotor: string;
  motorPrincipal: TipoMotor;
  costes: Record<TipoMotor, CostesMotorizacion>;
  kmAnuales: number;
  alertas: string[];
}

// ─────────────────────────────────────────────
// Datos del test
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    categoria: 'Tu uso',
    pregunta: '¿Cuántos kilómetros haces aproximadamente al año?',
    icon: '📍',
    opciones: [
      { valor: 'bajo', etiqueta: 'Menos de 10.000 km', desc: 'Uso muy ocasional' },
      { valor: 'medio', etiqueta: '10.000 – 20.000 km', desc: 'Conductor habitual' },
      { valor: 'alto', etiqueta: '20.000 – 35.000 km', desc: 'Conductor frecuente' },
      { valor: 'mucho', etiqueta: 'Más de 35.000 km', desc: 'Gran viajero' },
    ],
  },
  {
    id: 2,
    categoria: 'Tu uso',
    pregunta: '¿Cómo es principalmente tu conducción?',
    icon: '🛣️',
    opciones: [
      { valor: 'ciudad', etiqueta: 'Ciudad', desc: 'Tráfico urbano, distancias cortas' },
      { valor: 'mixto', etiqueta: 'Mixto', desc: 'Ciudad y carretera a partes iguales' },
      { valor: 'carretera', etiqueta: 'Carretera', desc: 'Principalmente vías rápidas' },
      { valor: 'autopista', etiqueta: 'Autopista / viajes largos', desc: 'Muchos km en autovía' },
    ],
  },
  {
    id: 3,
    categoria: 'Tu situación',
    pregunta: '¿Cuántas personas viajan habitualmente en el coche?',
    icon: '👥',
    opciones: [
      { valor: '1', etiqueta: 'Solo yo (o en pareja)', desc: '1-2 personas' },
      { valor: '3-4', etiqueta: 'Familia pequeña', desc: '3-4 personas' },
      { valor: '5+', etiqueta: 'Familia numerosa', desc: '5 o más personas' },
    ],
  },
  {
    id: 4,
    categoria: 'Tu situación',
    pregunta: '¿Tienes acceso a punto de carga eléctrica?',
    icon: '⚡',
    opciones: [
      { valor: 'casa', etiqueta: 'Sí, en casa (garaje propio)', desc: 'Carga cómoda nocturna' },
      { valor: 'trabajo', etiqueta: 'Sí, en el trabajo', desc: 'Carga durante la jornada' },
      { valor: 'publico', etiqueta: 'Solo en cargadores públicos', desc: 'Dependo de la red pública' },
      { valor: 'no', etiqueta: 'No tengo acceso a carga', desc: 'Sin posibilidad de cargar' },
    ],
  },
  {
    id: 5,
    categoria: 'Tu situación',
    pregunta: '¿Cuál es tu presupuesto orientativo para el coche?',
    icon: '💶',
    opciones: [
      { valor: 'bajo', etiqueta: 'Hasta 15.000 €', desc: 'Entrada / segunda mano' },
      { valor: 'medio', etiqueta: '15.000 – 25.000 €', desc: 'Gama media' },
      { valor: 'alto', etiqueta: '25.000 – 40.000 €', desc: 'Gama media-alta' },
      { valor: 'premium', etiqueta: 'Más de 40.000 €', desc: 'Gama alta / premium' },
    ],
  },
  {
    id: 6,
    categoria: 'Tu situación',
    pregunta: '¿En qué tipo de zona vives principalmente?',
    icon: '🏙️',
    opciones: [
      { valor: 'gran-ciudad', etiqueta: 'Gran ciudad (Madrid, Barcelona…)', desc: 'ZBE, aparcamiento limitado' },
      { valor: 'ciudad', etiqueta: 'Ciudad media', desc: 'Núcleo urbano habitual' },
      { valor: 'pueblo', etiqueta: 'Pueblo o zona rural', desc: 'Carreteras secundarias, naturaleza' },
    ],
  },
  {
    id: 7,
    categoria: 'Tus prioridades',
    pregunta: '¿Necesitas llevar muchos bultos, remolcar o salir a zonas difíciles (nieve, tierra)?',
    icon: '🏔️',
    opciones: [
      { valor: 'frecuente', etiqueta: 'Sí, frecuentemente', desc: 'Es parte habitual de mi uso' },
      { valor: 'ocasional', etiqueta: 'A veces', desc: 'Ocasionalmente lo necesito' },
      { valor: 'nunca', etiqueta: 'Prácticamente nunca', desc: 'No es un requisito' },
    ],
  },
  {
    id: 8,
    categoria: 'Tus prioridades',
    pregunta: '¿Qué priorizas más en tu próximo coche?',
    icon: '🎯',
    opciones: [
      { valor: 'precio', etiqueta: 'Precio inicial bajo', desc: 'Pagar lo menos posible por el coche' },
      { valor: 'ahorro', etiqueta: 'Bajo coste de uso', desc: 'Ahorrar en combustible y mantenimiento' },
      { valor: 'espacio', etiqueta: 'Espacio y practicidad', desc: 'Maletero grande, muchas plazas' },
      { valor: 'planeta', etiqueta: 'Impacto medioambiental', desc: 'Reducir emisiones' },
      { valor: 'tecnologia', etiqueta: 'Tecnología y equipamiento', desc: 'Lo último en conectividad' },
    ],
  },
  {
    id: 9,
    categoria: 'Tus prioridades',
    pregunta: '¿Cuántos años piensas quedarte con este coche?',
    icon: '📅',
    opciones: [
      { valor: 'corto', etiqueta: '1-3 años', desc: 'Cambio frecuente de coche' },
      { valor: 'medio', etiqueta: '3-7 años', desc: 'Uso durante unos años' },
      { valor: 'largo', etiqueta: 'Más de 7 años', desc: 'Lo quiero para mucho tiempo' },
    ],
  },
];

const TOTAL = PREGUNTAS.length;

// ─────────────────────────────────────────────
// Lógica de recomendación
// ─────────────────────────────────────────────

function calcularRecomendacion(r: Record<number, string>): Resultado {
  const km = r[1];
  const conduccion = r[2];
  const viajeros = r[3];
  const carga = r[4];
  const presupuesto = r[5];
  const zona = r[6];
  const terreno = r[7];
  const prioridad = r[8];
  const anyos = r[9];

  const tieneCargaComodad = carga === 'casa' || carga === 'trabajo';
  const soloPublico = carga === 'publico';
  const sinCarga = carga === 'no';
  const ciudadOGran = zona === 'gran-ciudad' || zona === 'ciudad';
  const esCarretera = conduccion === 'carretera' || conduccion === 'autopista';
  const esCiudad = conduccion === 'ciudad';
  const kmAltos = km === 'alto' || km === 'mucho';
  const kmBajos = km === 'bajo' || km === 'medio';
  const presupuestoAlto = presupuesto === 'alto' || presupuesto === 'premium';

  // — SEGMENTO —
  let segmento = '';
  let iconSegmento = '';
  let descripcionSegmento = '';

  if (viajeros === '5+') {
    segmento = 'Monovolumen o SUV Grande';
    iconSegmento = '🚌';
    descripcionSegmento =
      'Con familia numerosa necesitas espacio real para todos. Un monovolumen (tipo Scenic, Touran) o un SUV grande de 7 plazas son las opciones más cómodas.';
  } else if (terreno === 'frecuente') {
    segmento = 'SUV Mediano o Todoterreno';
    iconSegmento = '🏔️';
    descripcionSegmento =
      'Tu uso requiere mayor altura libre al suelo, tracción fiable y capacidad para llevar bultos o remolcar. Un SUV mediano con tracción integral es la elección lógica.';
  } else if (viajeros === '3-4' && (esCarretera || conduccion === 'mixto')) {
    segmento = 'SUV Compacto o Familiar';
    iconSegmento = '🚙';
    descripcionSegmento =
      'El equilibrio entre espacio familiar y agilidad en carretera. Un SUV compacto (Seat Ateca, Peugeot 3008) o un familiar (Octavia, Passat SW) te dará comodidad para todos.';
  } else if (viajeros === '3-4' && esCiudad) {
    segmento = 'Compacto tipo C';
    iconSegmento = '🚗';
    descripcionSegmento =
      'Un compacto de tamaño Golf o 308 te da espacio suficiente para 4 personas con un tamaño manejable en ciudad, sin renunciar a un maletero útil.';
  } else if (zona === 'gran-ciudad' && kmBajos && viajeros === '1') {
    segmento = 'Urbano o Compacto B';
    iconSegmento = '🏙️';
    descripcionSegmento =
      'Para la ciudad, un coche pequeño y ágil es lo más práctico: aparca fácil, tiene bajo consumo y resulta más económico en seguro y mantenimiento.';
  } else if (kmAltos && esCarretera) {
    segmento = 'Berlina o Familiar';
    iconSegmento = '🛣️';
    descripcionSegmento =
      'Con muchos kilómetros en carretera, una berlina o un familiar te dará el confort de crucero, eficiencia aerodinámica y maletero amplio para viajes.';
  } else if (terreno === 'ocasional' || (zona === 'pueblo' && conduccion !== 'ciudad')) {
    segmento = 'SUV Compacto';
    iconSegmento = '🚙';
    descripcionSegmento =
      'Un SUV compacto te aporta la versatilidad que buscas: algo más de altura para carreteras secundarias y espacio, sin los inconvenientes de un todoterreno grande.';
  } else {
    segmento = 'Compacto (tipo B/C)';
    iconSegmento = '🚗';
    descripcionSegmento =
      'El tipo de coche más versátil del mercado. Te sirve para todo: ciudad, carretera, 2-4 ocupantes. La gama más amplia y con mejor oferta tanto nuevo como de segunda mano.';
  }

  // — MOTORIZACIÓN —
  let motorizacion = '';
  let iconMotor = '';
  let descripcionMotor = '';
  let motorPrincipal: TipoMotor = 'gasolina';

  if (
    tieneCargaComodad &&
    (esCiudad || conduccion === 'mixto') &&
    kmBajos &&
    presupuesto !== 'bajo' &&
    (prioridad === 'ahorro' || prioridad === 'planeta' || prioridad === 'tecnologia')
  ) {
    motorPrincipal = 'electrico';
    motorizacion = '100% Eléctrico';
    iconMotor = '⚡';
    descripcionMotor =
      'Tu perfil encaja muy bien con un eléctrico: tienes punto de carga cómodo, haces km moderados y conduces en ciudad o mixto. El coste por km es el más bajo (2-4 cts/km) y el mantenimiento el más reducido.';
  } else if (
    tieneCargaComodad &&
    presupuestoAlto &&
    kmAltos
  ) {
    motorPrincipal = 'electrico';
    motorizacion = 'Eléctrico o Híbrido Enchufable (PHEV)';
    iconMotor = '🔋';
    descripcionMotor =
      'Tienes acceso a carga y haces bastantes km: un eléctrico de larga autonomía o un PHEV son las mejores opciones. El PHEV permite viajes largos sin ansiedad de autonomía mientras reduce el consumo en tramos urbanos.';
  } else if (
    kmAltos &&
    esCarretera &&
    anyos !== 'corto' &&
    presupuesto !== 'bajo'
  ) {
    motorPrincipal = 'diesel';
    motorizacion = 'Diésel';
    iconMotor = '🛢️';
    descripcionMotor =
      'Con muchos kilómetros en carretera y un horizonte de varios años, el diésel sigue siendo muy rentable: menor consumo en autovía (4,5-6 L/100km), mayor autonomía y mejor coste real a largo plazo si se amortiza bien.';
  } else if (
    (esCiudad || conduccion === 'mixto') &&
    kmBajos &&
    (sinCarga || soloPublico)
  ) {
    motorPrincipal = 'hibrido';
    motorizacion = 'Híbrido (HEV)';
    iconMotor = '♻️';
    descripcionMotor =
      'Sin necesidad de enchufar, el híbrido convencional es ideal para ciudad y uso mixto con km moderados: recupera energía en frenadas y reduce el consumo hasta un 25-30% respecto a la gasolina pura.';
  } else if (presupuesto === 'bajo' || anyos === 'corto') {
    motorPrincipal = 'gasolina';
    motorizacion = 'Gasolina';
    iconMotor = '⛽';
    descripcionMotor =
      'Para presupuesto ajustado o un uso a corto plazo, la gasolina tiene el menor precio de entrada, la mayor oferta en el mercado de segunda mano y menores costes de adquisición. La opción más flexible.';
  } else {
    motorPrincipal = 'hibrido';
    motorizacion = 'Híbrido (HEV)';
    iconMotor = '♻️';
    descripcionMotor =
      'El híbrido convencional es la opción más equilibrada para un perfil mixto: buena eficiencia, sin infraestructura de carga, fiable a largo plazo y con creciente segunda mano disponible.';
  }

  // — COSTES ANUALES ESTIMADOS —
  const kmAnuales =
    km === 'bajo' ? 8000 : km === 'medio' ? 15000 : km === 'alto' ? 27500 : 42000;

  const consumoGasolina = 7.5;
  const consumoDiesel = 5.5;
  const consumoHibrido = 5.2;
  const consumoElectrico = 16;

  const precioGasolina = 1.65;
  const precioDiesel = 1.55;
  const precioKwh = tieneCargaComodad ? 0.22 : soloPublico ? 0.38 : 0.45;

  const combustibleGasolina = Math.round((kmAnuales / 100) * consumoGasolina * precioGasolina);
  const combustibleDiesel = Math.round((kmAnuales / 100) * consumoDiesel * precioDiesel);
  const combustibleHibrido = Math.round((kmAnuales / 100) * consumoHibrido * precioGasolina);
  const combustibleElectrico = Math.round((kmAnuales / 100) * consumoElectrico * precioKwh);

  const mantGasolina = 400;
  const mantDiesel = 450;
  const mantHibrido = 350;
  const mantElectrico = 200;

  const fijos = 650 + 35 + 120; // seguro medio + ITV amortizado + impuesto circulación

  const costes: Record<TipoMotor, CostesMotorizacion> = {
    gasolina: {
      combustible: combustibleGasolina,
      mantenimiento: mantGasolina,
      total: combustibleGasolina + mantGasolina + fijos,
    },
    diesel: {
      combustible: combustibleDiesel,
      mantenimiento: mantDiesel,
      total: combustibleDiesel + mantDiesel + fijos,
    },
    hibrido: {
      combustible: combustibleHibrido,
      mantenimiento: mantHibrido,
      total: combustibleHibrido + mantHibrido + fijos,
    },
    electrico: {
      combustible: combustibleElectrico,
      mantenimiento: mantElectrico,
      total: combustibleElectrico + mantElectrico + fijos,
    },
  };

  // — ALERTAS CONTEXTUALES —
  const alertas: string[] = [];

  if (zona === 'gran-ciudad') {
    alertas.push(
      '🏙️ Verifica las restricciones de la ZBE de tu ciudad. Los vehículos sin etiqueta CERO o ECO pueden tener limitaciones de acceso o aparcamiento.'
    );
  }
  if (motorPrincipal === 'electrico' && (soloPublico || sinCarga)) {
    alertas.push(
      '⚡ Cargar solo en puntos públicos es más caro y menos conveniente. Valora instalar un wallbox en casa (500-1.200 €) o negociar carga en el trabajo antes de decidirte por un eléctrico.'
    );
  }
  if (presupuesto === 'bajo' && (motorPrincipal === 'electrico')) {
    alertas.push(
      '💶 Los eléctricos nuevos suelen partir de 25.000-30.000 €. Con tu presupuesto, considera un híbrido de segunda mano (Toyota Yaris Hybrid, Honda Jazz) como alternativa eficiente.'
    );
  }
  if (kmAltos && motorPrincipal === 'gasolina') {
    alertas.push(
      '⛽ Con tus km anuales, la diferencia de consumo entre gasolina e híbrido/diésel puede suponer 500-900 € de ahorro al año. Merece la pena comparar el extra de precio inicial con el ahorro acumulado.'
    );
  }
  if (anyos === 'largo' && motorPrincipal === 'diesel' && zona === 'gran-ciudad') {
    alertas.push(
      '⚠️ Si piensas quedarte el coche 7+ años y vives en ciudad, ten en cuenta que las restricciones a diésel en ZBE pueden aumentar. Un híbrido podría tener más vida útil en ciudad a medio plazo.'
    );
  }

  return {
    segmento,
    iconSegmento,
    descripcionSegmento,
    motorizacion,
    iconMotor,
    descripcionMotor,
    motorPrincipal,
    costes,
    kmAnuales,
    alertas,
  };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function AsesorVehiculo() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = paso >= 1 && paso <= TOTAL ? PREGUNTAS[paso - 1] : null;
  const progreso = paso >= 1 && paso <= TOTAL ? ((paso - 1) / TOTAL) * 100 : 0;
  const respuestaActual = paso >= 1 ? respuestas[paso] : undefined;

  function seleccionar(valor: string) {
    setRespuestas((prev) => ({ ...prev, [paso]: valor }));
  }

  function siguiente() {
    if (paso < TOTAL) {
      setPaso((p) => p + 1);
    } else {
      setResultado(calcularRecomendacion(respuestas));
      setPaso(TOTAL + 1);
    }
  }

  function anterior() {
    setPaso((p) => Math.max(0, p - 1));
  }

  function reiniciar() {
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  // ── Pantalla de introducción ──
  if (paso === 0) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Qué coche te conviene?</h1>
          <p className={styles.heroSubtitle}>
            Gasolina o eléctrico. Compacto o SUV. Grande o pequeño.
            <br />9 preguntas para dar con el coche que realmente se adapta a ti.
          </p>
        </header>

        <LegalNotice />

        <main className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid}>
              <span className={styles.introIcon}>🚗</span>
              <span className={styles.introIcon}>🚙</span>
              <span className={styles.introIcon}>⚡</span>
              <span className={styles.introIcon}>🏔️</span>
            </div>
            <h2 className={styles.introTitulo}>El test de orientación de vehículo</h2>
            <p className={styles.introDesc}>
              Con tantas opciones en el mercado, elegir el tipo de coche se ha vuelto complejo.
              Este test analiza tu perfil real (km, uso, familia, zona, presupuesto) y te
              recomienda el segmento y la motorización más adecuados, además de comparar el coste
              anual estimado según cada tipo de motor.
            </p>
            <ul className={styles.introFeatures}>
              <li>
                <span aria-hidden="true">📍</span> 9 preguntas sobre tu uso real
              </li>
              <li>
                <span aria-hidden="true">🎯</span> Recomendación de segmento y motorización
              </li>
              <li>
                <span aria-hidden="true">💶</span> Comparativa de costes anuales estimados
              </li>
              <li>
                <span aria-hidden="true">⏱️</span> Solo 2 minutos
              </li>
            </ul>
            <button className={styles.btnStart} onClick={() => setPaso(1)}>
              Empezar el test
            </button>
          </div>
        </main>

        <RelatedApps apps={getRelatedApps('asesor-vehiculo')} />
        <ShareCard appName="asesor-vehiculo" />
        <Footer appName="asesor-vehiculo" />
      </div>
    );
  }

  // ── Pantalla de preguntas ──
  if (paso >= 1 && paso <= TOTAL && preguntaActual) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <main className={styles.testContainer}>
          {/* Indicador de progreso */}
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>
                Pregunta {paso} de {TOTAL}
              </span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div className={styles.progresoBar} role="progressbar" aria-valuenow={paso} aria-valuemin={1} aria-valuemax={TOTAL}>
              <div className={styles.progresoRelleno} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          {/* Tarjeta de pregunta */}
          <div className={styles.preguntaCard}>
            <div className={styles.preguntaIcon} aria-hidden="true">
              {preguntaActual.icon}
            </div>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>

            <div className={styles.opcionesGrid}>
              {preguntaActual.opciones.map((opcion) => (
                <button
                  key={opcion.valor}
                  className={`${styles.opcionBtn} ${respuestaActual === opcion.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionar(opcion.valor)}
                  aria-pressed={respuestaActual === opcion.valor}
                >
                  <span className={styles.opcionEtiqueta}>{opcion.etiqueta}</span>
                  <span className={styles.opcionDesc}>{opcion.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button className={styles.btnAnterior} onClick={anterior} aria-label="Pregunta anterior">
              ← Anterior
            </button>
            <button
              className={styles.btnSiguiente}
              onClick={siguiente}
              disabled={!respuestaActual}
              aria-label={paso < TOTAL ? 'Siguiente pregunta' : 'Ver mi recomendación'}
            >
              {paso < TOTAL ? 'Siguiente →' : 'Ver mi recomendación ✓'}
            </button>
          </div>
        </main>

        <Footer appName="asesor-vehiculo" />
      </div>
    );
  }

  // ── Pantalla de resultados ──
  if (paso > TOTAL && resultado) {
    const motores: { tipo: TipoMotor; nombre: string; icon: string }[] = [
      { tipo: 'electrico', nombre: 'Eléctrico', icon: '⚡' },
      { tipo: 'hibrido', nombre: 'Híbrido', icon: '♻️' },
      { tipo: 'gasolina', nombre: 'Gasolina', icon: '⛽' },
      { tipo: 'diesel', nombre: 'Diésel', icon: '🛢️' },
    ];

    const minimoTotal = Math.min(...Object.values(resultado.costes).map((c) => c.total));

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu recomendación personalizada</h1>
          <p className={styles.heroSubtitleSm}>
            Basada en tu perfil de {resultado.kmAnuales.toLocaleString('es-ES')} km/año
          </p>
        </header>

        <main className={styles.resultadosContainer}>
          {/* Tarjeta de recomendación principal */}
          <div className={styles.recomendacionGrid}>
            <div className={styles.recomendacionCard}>
              <div className={styles.recomendacionIcon} aria-hidden="true">
                {resultado.iconSegmento}
              </div>
              <div className={styles.recomendacionLabel}>Segmento recomendado</div>
              <div className={styles.recomendacionValor}>{resultado.segmento}</div>
              <p className={styles.recomendacionDesc}>{resultado.descripcionSegmento}</p>
            </div>
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardMotor}`}>
              <div className={styles.recomendacionIcon} aria-hidden="true">
                {resultado.iconMotor}
              </div>
              <div className={styles.recomendacionLabel}>Motorización recomendada</div>
              <div className={styles.recomendacionValor}>{resultado.motorizacion}</div>
              <p className={styles.recomendacionDesc}>{resultado.descripcionMotor}</p>
            </div>
          </div>

          {/* Alertas contextuales */}
          {resultado.alertas.length > 0 && (
            <div className={styles.alertasSection} role="alert" aria-live="polite">
              <h3 className={styles.alertasTitulo}>Ten en cuenta</h3>
              {resultado.alertas.map((alerta, i) => (
                <div key={i} className={styles.alertaItem}>
                  {alerta}
                </div>
              ))}
            </div>
          )}

          {/* Tabla comparativa de costes */}
          <div className={styles.tablaSection}>
            <h3 className={styles.tablaTitulo}>
              Coste anual estimado por tipo de motor
              <span className={styles.tablaSublabel}>
                Para {resultado.kmAnuales.toLocaleString('es-ES')} km/año — Valores orientativos 2025
              </span>
            </h3>
            <div className={styles.tablaResponsive}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Motor</th>
                    <th scope="col">Combustible/Energía</th>
                    <th scope="col">Mantenimiento</th>
                    <th scope="col">Fijos*</th>
                    <th scope="col">Total anual</th>
                  </tr>
                </thead>
                <tbody>
                  {motores.map(({ tipo, nombre, icon }) => {
                    const c = resultado.costes[tipo];
                    const esRecomendado = tipo === resultado.motorPrincipal;
                    const esMasBarato = c.total === minimoTotal;
                    return (
                      <tr
                        key={tipo}
                        className={`${styles.tablaFila} ${styles[`fila_${tipo}`]} ${esRecomendado ? styles.filaRecomendada : ''}`}
                      >
                        <td className={styles.celMotor}>
                          <span aria-hidden="true">{icon}</span> {nombre}
                          {esRecomendado && (
                            <span className={styles.badgeRecomendado}>Recomendado</span>
                          )}
                          {esMasBarato && !esRecomendado && (
                            <span className={styles.badgeMasBarato}>Más barato</span>
                          )}
                        </td>
                        <td>{formatCurrency(c.combustible)}</td>
                        <td>{formatCurrency(c.mantenimiento)}</td>
                        <td className={styles.celFijos}>{formatCurrency(805)}</td>
                        <td className={styles.celTotal}>{formatCurrency(c.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.tablaNota}>
              * Fijos: seguro medio 650 € + ITV amortizada 35 € + impuesto de circulación 120 €.
              El seguro puede variar mucho según perfil, zona y cobertura. Precios de combustible:
              gasolina 1,65 €/L · diésel 1,55 €/L · electricidad 0,22 €/kWh (doméstica). Coste
              por km: eléctrico ~{((resultado.costes.electrico.combustible / resultado.kmAnuales) * 100).toFixed(1)}&nbsp;cts ·
              gasolina ~{((resultado.costes.gasolina.combustible / resultado.kmAnuales) * 100).toFixed(1)}&nbsp;cts.
            </p>
          </div>

          {/* CTA siguiente paso */}
          <div className={styles.siguientePaso}>
            <h3 className={styles.siguientePasoTitulo}>¿Ya sabes qué tipo de coche quieres?</h3>
            <p className={styles.siguientePasoDesc}>
              Ahora compara si te conviene más comprarlo al contado, financiarlo, hacer renting o
              leasing con el coste total real de cada opción.
            </p>
            <a href="/comparador-vehiculos/" className={styles.btnCta}>
              Comparar formas de compra →
            </a>
          </div>

          {/* Botón reiniciar */}
          <div className={styles.reiniciarWrap}>
            <button className={styles.btnReiniciar} onClick={reiniciar}>
              ↺ Repetir el test
            </button>
          </div>

          <DisclaimerCard
            variant="educational"
            severity="medium"
            collapsible
            context="asesor-vehiculo"
          />

          <EducationalSection title="Guía de tipos de coche y motorizaciones" subtitle="Aprende a elegir el segmento y la motorización que realmente te conviene" defaultOpen={false}>
            <h3>¿Cómo elegir el segmento correcto?</h3>
            <p>
              El segmento del vehículo (urbano, compacto, SUV, familiar…) depende principalmente
              de tres factores: el número de ocupantes habitual, el tipo de conducción y las
              necesidades especiales de espacio o terreno. Un vehículo sobredimensionado es más
              caro de comprar, consumir y aparcar; uno pequeño para tus necesidades reales generará
              frustración diaria.
            </p>
            <h3>Gasolina vs. diésel: la regla de los km</h3>
            <p>
              El diésel tiene mayor precio inicial pero menor consumo en carretera (4,5-6
              L/100km vs. 6-9 del gasolina). La regla clásica es que el diésel compensa si
              haces más de 15.000-20.000 km anuales y predominantemente por carretera. Con
              km bajos o conducción urbana, el extra del precio inicial jamás se recupera.
            </p>
            <h3>El híbrido convencional (HEV): el más versátil</h3>
            <p>
              El híbrido convencional no necesita enchufarse: recupera energía frenando y la
              usa para asistir al motor térmico. En ciudad y conducción mixta puede reducir el
              consumo entre un 20-35%. Toyota, Honda y Hyundai tienen modelos HEV con fiabilidad
              contrastada y excelente segunda mano disponible.
            </p>
            <h3>El eléctrico: ¿para quién tiene sentido?</h3>
            <p>
              Un vehículo eléctrico tiene el menor coste por km (2-4 cts/km vs. 8-12 cts del
              gasolina) y el mantenimiento más reducido (sin cambios de aceite, embrague,
              escape…). Sin embargo, el precio inicial es mayor y la infraestructura de carga
              es clave: sin garaje propio, la ecuación cambia significativamente. Tiene más
              sentido cuantos más km hagas y más acceso a carga doméstica tengas.
            </p>
            <h3>¿Nuevo o de segunda mano?</h3>
            <p>
              Un vehículo de 2-4 años suele ser la mejor relación coste-valor: ha perdido el
              30-40% de depreciación (que paga el primer dueño) pero conserva garantía y
              tecnología reciente. Los eléctricos e híbridos enchufables de segunda mano están
              abaratándose notablemente y pueden ser una oportunidad excelente con revisión de
              batería previa.
            </p>
            <div className={styles.warningBox}>
              <strong>Importante:</strong> Los costes de esta herramienta son estimaciones
              orientativas basadas en medias de mercado 2025. El coste real depende del modelo
              concreto, tu forma de conducir, el precio del combustible en tu zona y el seguro
              que contrates. Úsalos como referencia comparativa, no como cifras exactas.
            </div>
          </EducationalSection>

          <RelatedApps apps={getRelatedApps('asesor-vehiculo')} />
          <ShareCard appName="asesor-vehiculo" />
        </main>

        <Footer appName="asesor-vehiculo" />
      </div>
    );
  }

  return null;
}
