'use client';

import React, { useState } from 'react';
import styles from './SelectorSmartphone.module.css';
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

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type SistemaOS = 'ios' | 'android';
type GamaKey = 'basica' | 'media' | 'alta' | 'pro';

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

interface GamaInfo {
  nombre: string;
  icon: string;
  precioOrientativo: string;
  descripcion: string;
}

interface Resultado {
  os: SistemaOS;
  gama: GamaKey;
  razones: string[];
  consejos: string[];
  caracteristicas: string[];
}

// ─────────────────────────────────────────────
// Datos de gamas
// ─────────────────────────────────────────────

const GAMAS: Record<GamaKey, GamaInfo> = {
  basica: {
    nombre: 'Gama básica',
    icon: '📱',
    precioOrientativo: '100 – 250 €',
    descripcion:
      'Cubre las necesidades del día a día: llamadas, WhatsApp, redes sociales y navegación. Sin grandes alardes de cámara ni rendimiento, pero fiable para un uso sencillo.',
  },
  media: {
    nombre: 'Gama media',
    icon: '📲',
    precioOrientativo: '250 – 500 €',
    descripcion:
      'El punto dulce del mercado. Buena cámara, autonomía sólida y rendimiento fluido para la mayoría de usuarios. La mejor relación calidad-precio en 2025.',
  },
  alta: {
    nombre: 'Gama alta',
    icon: '🌟',
    precioOrientativo: '500 – 900 €',
    descripcion:
      'Procesadores rápidos, cámaras versátiles con teleobjetivo y pantallas AMOLED de alta calidad. Ideal si usas el móvil intensamente o valoras la fotografía.',
  },
  pro: {
    nombre: 'Gama pro / flagship',
    icon: '🏆',
    precioOrientativo: '900 – 1.500+ €',
    descripcion:
      'Lo mejor de la tecnología actual: zoom óptico avanzado, pantallas de 120 Hz, procesadores de última generación y actualizaciones garantizadas durante años.',
  },
};

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    categoria: 'Tu uso',
    pregunta: '¿Para qué usas principalmente el móvil?',
    icon: '📱',
    opciones: [
      { valor: 'basico', etiqueta: 'Uso básico', desc: 'Llamadas, WhatsApp y poco más' },
      { valor: 'redes', etiqueta: 'Redes sociales y contenido', desc: 'Instagram, TikTok, YouTube…' },
      { valor: 'trabajo', etiqueta: 'Trabajo y productividad', desc: 'Email, documentos, videoconferencias' },
      { valor: 'foto', etiqueta: 'Fotografía y vídeo', desc: 'Fotos de calidad, grabación de vídeos' },
    ],
  },
  {
    id: 2,
    categoria: 'Tu uso',
    pregunta: '¿Juegas habitualmente a videojuegos en el móvil?',
    icon: '🎮',
    opciones: [
      { valor: 'no', etiqueta: 'No juego o muy poco', desc: 'El gaming no es algo que valoro' },
      { valor: 'casual', etiqueta: 'Casual (Wordle, Solitario…)', desc: 'Juegos ligeros de vez en cuando' },
      { valor: 'medio', etiqueta: 'Con frecuencia', desc: 'Juego a menudo, varios títulos' },
      { valor: 'intenso', etiqueta: 'Gaming intenso', desc: 'Juegos exigentes, máximo rendimiento' },
    ],
  },
  {
    id: 3,
    categoria: 'Tu uso',
    pregunta: '¿Cuántas horas usas el móvil al día, aproximadamente?',
    icon: '⏱️',
    opciones: [
      { valor: 'poco', etiqueta: 'Menos de 2 horas', desc: 'Uso muy moderado' },
      { valor: 'medio', etiqueta: '2 – 4 horas', desc: 'Uso normal' },
      { valor: 'mucho', etiqueta: '4 – 7 horas', desc: 'Uso intenso' },
      { valor: 'extremo', etiqueta: 'Más de 7 horas', desc: 'El móvil es mi herramienta principal' },
    ],
  },
  {
    id: 4,
    categoria: 'Tu situación',
    pregunta: '¿Tienes ya dispositivos Apple (Mac, iPad, AirPods…)?',
    icon: '🍎',
    opciones: [
      { valor: 'si_muchos', etiqueta: 'Sí, varios', desc: 'Uso el ecosistema Apple a diario' },
      { valor: 'si_alguno', etiqueta: 'Alguno', desc: 'Tengo algún dispositivo Apple' },
      { valor: 'no', etiqueta: 'No, ninguno', desc: 'No uso ningún producto Apple' },
      { valor: 'otro', etiqueta: 'Soy independiente', desc: 'Mezclo marcas según conviene' },
    ],
  },
  {
    id: 5,
    categoria: 'Tu situación',
    pregunta: '¿Qué sistema operativo usas en tu ordenador?',
    icon: '💻',
    opciones: [
      { valor: 'mac', etiqueta: 'macOS', desc: 'Tengo un Mac' },
      { valor: 'windows', etiqueta: 'Windows', desc: 'Tengo un PC con Windows' },
      { valor: 'linux', etiqueta: 'Linux', desc: 'Uso Linux o similar' },
      { valor: 'nopc', etiqueta: 'No tengo ordenador', desc: 'El móvil o tablet es mi principal dispositivo' },
    ],
  },
  {
    id: 6,
    categoria: 'Tus prioridades',
    pregunta: '¿Qué es lo más importante para ti en un smartphone?',
    icon: '⭐',
    opciones: [
      { valor: 'bateria', etiqueta: 'Batería larga', desc: 'Quiero pasar el día sin cargar' },
      { valor: 'camara', etiqueta: 'Cámara de calidad', desc: 'Las fotos son mi prioridad' },
      { valor: 'rendimiento', etiqueta: 'Rendimiento fluido', desc: 'Que no se cuelgue ni vaya lento' },
      { valor: 'precio', etiqueta: 'Precio ajustado', desc: 'Lo básico al mejor precio' },
    ],
  },
  {
    id: 7,
    categoria: 'Tus prioridades',
    pregunta: '¿Cuánto tiempo esperas quedarte con el móvil?',
    icon: '📅',
    opciones: [
      { valor: 'corto', etiqueta: '1 – 2 años', desc: 'Me gusta renovar con frecuencia' },
      { valor: 'medio', etiqueta: '2 – 3 años', desc: 'Lo normal' },
      { valor: 'largo', etiqueta: '4 años o más', desc: 'Busco durabilidad máxima' },
    ],
  },
  {
    id: 8,
    categoria: 'Tus prioridades',
    pregunta: '¿Qué valoras más del diseño?',
    icon: '🎨',
    opciones: [
      { valor: 'pequeno', etiqueta: 'Compacto y ligero', desc: 'Cabe bien en el bolsillo' },
      { valor: 'grande', etiqueta: 'Pantalla grande', desc: 'Más cómodo para ver contenido' },
      { valor: 'resistente', etiqueta: 'Resistente (IP68)', desc: 'Que aguante agua y golpes' },
      { valor: 'indiferente', etiqueta: 'Me da igual', desc: 'El diseño no es prioritario' },
    ],
  },
  {
    id: 9,
    categoria: 'Tu presupuesto',
    pregunta: '¿Cuál es tu presupuesto aproximado?',
    icon: '💶',
    opciones: [
      { valor: 'bajo', etiqueta: 'Hasta 250 €', desc: 'Precio mínimo, sin renuncias clave' },
      { valor: 'medio', etiqueta: '250 – 500 €', desc: 'Relación calidad-precio óptima' },
      { valor: 'alto', etiqueta: '500 – 900 €', desc: 'Dispuesto a pagar por calidad' },
      { valor: 'premium', etiqueta: 'Más de 900 €', desc: 'Quiero lo mejor disponible' },
    ],
  },
  {
    id: 10,
    categoria: 'Tu presupuesto',
    pregunta: '¿Considerarías comprar un móvil de segunda mano certificado?',
    icon: '♻️',
    opciones: [
      { valor: 'si', etiqueta: 'Sí, con garantía', desc: 'Si tiene garantía y buen estado, adelante' },
      { valor: 'quizas', etiqueta: 'Tal vez', desc: 'Dependería de la oferta' },
      { valor: 'no', etiqueta: 'No, prefiero nuevo', desc: 'Quiero comprar nuevo siempre' },
    ],
  },
];

// ─────────────────────────────────────────────
// Lógica de recomendación
// ─────────────────────────────────────────────

function calcularResultado(respuestas: Record<number, string>): Resultado {
  let puntosiOS = 0;
  let puntosGamaAlta = 0;
  const razones: string[] = [];
  const consejos: string[] = [];
  const caracteristicas: string[] = [];

  // ─ Sistema operativo ─
  if (respuestas[4] === 'si_muchos') { puntosiOS += 3; }
  if (respuestas[4] === 'si_alguno') { puntosiOS += 1; }
  if (respuestas[5] === 'mac') { puntosiOS += 2; }
  if (respuestas[5] === 'windows') { puntosiOS -= 1; }

  // ─ Gama ─
  if (respuestas[1] === 'foto') { puntosGamaAlta += 2; }
  if (respuestas[1] === 'trabajo') { puntosGamaAlta += 1; }
  if (respuestas[2] === 'intenso') { puntosGamaAlta += 2; }
  if (respuestas[2] === 'medio') { puntosGamaAlta += 1; }
  if (respuestas[3] === 'extremo') { puntosGamaAlta += 2; }
  if (respuestas[3] === 'mucho') { puntosGamaAlta += 1; }
  if (respuestas[6] === 'camara') { puntosGamaAlta += 2; }
  if (respuestas[6] === 'rendimiento') { puntosGamaAlta += 1; }
  if (respuestas[7] === 'largo') { puntosGamaAlta += 2; }
  if (respuestas[9] === 'alto') { puntosGamaAlta += 2; }
  if (respuestas[9] === 'premium') { puntosGamaAlta += 4; }
  if (respuestas[9] === 'bajo') { puntosGamaAlta -= 3; }

  // ─ Determinar OS ─
  const os: SistemaOS = puntosiOS >= 3 ? 'ios' : 'android';

  // ─ Determinar gama ─
  let gama: GamaKey;
  if (puntosGamaAlta >= 7) {
    gama = 'pro';
  } else if (puntosGamaAlta >= 4) {
    gama = 'alta';
  } else if (puntosGamaAlta >= 1) {
    gama = 'media';
  } else {
    gama = 'basica';
  }

  // Ajuste por presupuesto (primario)
  if (respuestas[9] === 'bajo') { gama = 'basica'; }
  if (respuestas[9] === 'premium' && gama !== 'pro') { gama = 'pro'; }

  // ─ Razones ─
  if (os === 'ios') {
    razones.push('Tienes otros dispositivos Apple: el ecosistema integrado (AirDrop, iMessage, Handoff) te aporta valor real.');
    razones.push('iOS recibe actualizaciones durante 6-7 años, lo que protege tu inversión a largo plazo.');
  } else {
    razones.push('Android ofrece más variedad de modelos, marcas y precios que se adaptan a cualquier necesidad.');
    razones.push('Mayor libertad de personalización y compatibilidad con ecosistemas no Apple (Google, Microsoft…).');
  }

  if (gama === 'pro') {
    razones.push('Tu perfil de uso intenso o de fotografía avanzada justifica la inversión en un flagship.');
    razones.push('Los móviles pro reciben soporte extendido (7 años en algunos fabricantes), amortizando el coste.');
  } else if (gama === 'alta') {
    razones.push('La gama alta te ofrece cámaras con teleobjetivo, pantallas de 120 Hz y rendimiento sólido sin llegar al precio máximo.');
  } else if (gama === 'media') {
    razones.push('La gama media actual es notable: procesadores rápidos, cámaras decentes y autonomía de todo el día.');
  } else {
    razones.push('Para un uso básico, la gama de entrada cubre perfectamente llamadas, mensajería y navegación.');
  }

  if (respuestas[7] === 'largo') {
    razones.push('Buscar modelos con varios años de actualizaciones garantizadas prolonga la vida útil del dispositivo.');
  }

  // ─ Consejos ─
  if (respuestas[10] === 'si' || respuestas[10] === 'quizas') {
    consejos.push('💡 Un dispositivo reacondicionado certificado puede ahorrarte un 30-40 % con garantía incluida; comprueba el estado de la batería antes de comprar.');
  }
  if (respuestas[7] === 'largo') {
    consejos.push('📅 Comprueba en la ficha técnica exacta cuántos años de actualizaciones de SO garantiza el fabricante, no solo parches de seguridad.');
  }
  if (respuestas[8] === 'resistente') {
    consejos.push('💧 Verifica que el modelo elegido tenga certificación IP67 o IP68 antes de comprarlo.');
  }
  if (respuestas[9] === 'medio' || respuestas[9] === 'bajo') {
    consejos.push('🛒 Los mejores precios suelen aparecer tras el lanzamiento de la generación siguiente del modelo que te interesa.');
  }
  if (respuestas[6] === 'camara') {
    consejos.push('📷 El tamaño del sensor y la apertura importan más que los megapíxeles; busca comparativas de fotografía independientes.');
  }
  consejos.push('🔋 Comprueba siempre la capacidad de batería (mAh) y si admite carga rápida — muchos modelos de gama media superan a los flagship en autonomía.');

  // ─ Características a buscar ─

  // Actualizaciones (siempre, umbral según duración esperada)
  if (respuestas[7] === 'largo') {
    caracteristicas.push('🔄 Actualizaciones del sistema operativo garantizadas: mínimo 5 años desde la compra');
  } else if (gama === 'pro' || gama === 'alta') {
    caracteristicas.push('🔄 Actualizaciones del sistema operativo garantizadas: mínimo 4 años');
  } else {
    caracteristicas.push('🔄 Actualizaciones del sistema operativo garantizadas: mínimo 3 años');
  }

  // Batería según intensidad de uso y prioridad declarada
  if (respuestas[3] === 'extremo' || respuestas[6] === 'bateria') {
    caracteristicas.push('🔋 Batería ≥ 5.000 mAh con carga rápida ≥ 45 W');
  } else if (respuestas[3] === 'mucho') {
    caracteristicas.push('🔋 Batería ≥ 4.500 mAh con carga rápida ≥ 30 W');
  } else {
    caracteristicas.push('🔋 Batería ≥ 4.000 mAh (suficiente para un día completo de uso moderado)');
  }

  // Cámara según prioridad declarada y uso principal
  if (respuestas[1] === 'foto' || respuestas[6] === 'camara') {
    if (gama === 'pro') {
      caracteristicas.push('📷 Sistema de triple cámara con teleobjetivo óptico (≥ 3×) y sensor principal de gran formato (≥ 1/1,3\'\')');
    } else if (gama === 'alta') {
      caracteristicas.push('📷 Doble o triple cámara con teleobjetivo óptico y modo noche avanzado');
    } else {
      caracteristicas.push('📷 Cámara principal con apertura ≤ f/1,9 y modo noche incluido');
    }
  }

  // Procesador y pantalla según gaming o rendimiento
  if (respuestas[2] === 'intenso' || respuestas[6] === 'rendimiento') {
    caracteristicas.push('⚡ Procesador de gama alta de la generación más reciente disponible');
    caracteristicas.push('🖥️ Pantalla con tasa de refresco ≥ 120 Hz');
    if (gama === 'pro' || gama === 'alta') {
      caracteristicas.push('💾 RAM ≥ 8 GB');
    }
  } else if (respuestas[2] === 'medio') {
    caracteristicas.push('⚡ Procesador de gama media-alta con pantalla a ≥ 90 Hz');
  }

  // Diseño y resistencia
  if (respuestas[8] === 'resistente') {
    caracteristicas.push('💧 Certificación de resistencia al agua y polvo: IP67 como mínimo, IP68 preferible');
  }
  if (respuestas[8] === 'pequeno') {
    caracteristicas.push('📐 Formato compacto: pantalla ≤ 6,2\'\' (evita las variantes "Plus", "XL" o "Ultra")');
  }
  if (respuestas[8] === 'grande') {
    caracteristicas.push('📐 Pantalla ≥ 6,5\'\' con tecnología AMOLED o equivalente');
  }

  // NFC a partir de gama media
  if (gama !== 'basica') {
    caracteristicas.push('📡 NFC para pagos sin contacto (verifica disponibilidad en tu región)');
  }

  // Almacenamiento según gama
  if (gama === 'pro' || gama === 'alta') {
    caracteristicas.push('💾 Almacenamiento interno ≥ 256 GB (o ≥ 128 GB con ranura microSD)');
  } else {
    caracteristicas.push('💾 Almacenamiento interno ≥ 128 GB');
  }

  // 5G a partir de gama media
  if (gama !== 'basica') {
    caracteristicas.push('📶 Conectividad 5G');
  }

  return { os, gama, razones, consejos, caracteristicas };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function SelectorSmartphone() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = ((paso) / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      const res = calcularResultado(respuestas);
      setResultado(res);
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('intro');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  const osInfo = resultado ? (resultado.os === 'ios'
    ? { nombre: 'iPhone (iOS)', icon: '🍎', desc: 'El ecosistema Apple integrado, actualizaciones garantizadas 6-7 años y experiencia fluida desde el primer día.' }
    : { nombre: 'Android', icon: '🤖', desc: 'Mayor variedad de modelos y precios, personalización avanzada y compatibilidad con los servicios de Google.' })
    : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── HERO ── */}
      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}><span aria-hidden="true">📱</span> Asesor de Smartphone</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro'
              ? '10 preguntas para saber qué móvil te conviene de verdad'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu smartphone ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu perfil</p>
        </header>
      )}

      <LegalNotice />
      <DisclaimerCard variant="technical" severity="medium" />

      {/* ── PANTALLA INTRO ── */}
      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>📱</span>
              <span className={styles.introIcon}>🍎</span>
              <span className={styles.introIcon}>🤖</span>
              <span className={styles.introIcon}>📷</span>
            </div>
            <h2 className={styles.introTitulo}>¿Qué móvil te conviene?</h2>
            <p className={styles.introDesc}>
              El mercado de smartphones cambia cada año y elegir puede ser abrumador. Este test analiza tu uso real,
              tus prioridades y tu presupuesto para orientarte hacia el sistema operativo y la gama que mejor se adaptan a ti.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> iOS o Android según tu ecosistema</li>
              <li><span aria-hidden="true">✅</span> Gama recomendada con precio orientativo</li>
              <li><span aria-hidden="true">✅</span> Características técnicas a buscar según tu perfil</li>
              <li><span aria-hidden="true">✅</span> Consejos de compra personalizados</li>
              <li><span aria-hidden="true">✅</span> Sin marcas patrocinadas, solo tu perfil real</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {/* ── PANTALLA TEST ── */}
      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          {/* Barra de progreso */}
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-label={`Pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso + 1}
              aria-valuemin={1}
              aria-valuemax={totalPreguntas}
            >
              <div className={styles.progresoRelleno} data-progreso={progreso} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icon}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.pregunta}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  aria-pressed={respuestas[preguntaActual.id] === op.valor ? true : false}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={retroceder}
              disabled={paso === 0}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={avanzar}
              disabled={!respuestas[preguntaActual.id]}
              aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}
            >
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {/* ── PANTALLA RESULTADO ── */}
      {pantalla === 'resultado' && resultado && osInfo && (
        <div className={styles.resultadosContainer}>

          {/* Recomendaciones principales */}
          <div className={styles.recomendacionGrid}>
            <div className={styles.recomendacionCard}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{osInfo.icon}</span>
              <p className={styles.recomendacionLabel}>Sistema operativo</p>
              <p className={styles.recomendacionValor}>{osInfo.nombre}</p>
              <p className={styles.recomendacionDesc}>{osInfo.desc}</p>
            </div>
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardGama}`}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{GAMAS[resultado.gama].icon}</span>
              <p className={styles.recomendacionLabel}>Gama recomendada</p>
              <p className={styles.recomendacionValor}>{GAMAS[resultado.gama].nombre}</p>
              <p className={styles.recomendacionDesc}>
                {GAMAS[resultado.gama].descripcion}
                <br /><strong>Precio orientativo: {GAMAS[resultado.gama].precioOrientativo}</strong>
              </p>
            </div>
          </div>

          {/* Por qué esta recomendación */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta recomendación</p>
            {resultado.razones.map((r, i) => (
              <p key={i} className={styles.razonItem}>{r}</p>
            ))}
          </div>

          {/* Características a buscar */}
          <div className={styles.caracteristicasSection}>
            <p className={styles.caracteristicasTitulo}>
              Qué buscar en tu próximo smartphone
            </p>
            <div className={styles.caracteristicasGrid}>
              {resultado.caracteristicas.map((c, i) => (
                <div key={i} className={styles.caracteristicaItem}>{c}</div>
              ))}
            </div>
          </div>

          {/* Consejos */}
          {resultado.consejos.length > 0 && (
            <div className={styles.consejosSection}>
              <p className={styles.consejosTitulo}>Consejos antes de comprar</p>
              {resultado.consejos.map((c, i) => (
                <p key={i} className={styles.consejoItem}>{c}</p>
              ))}
            </div>
          )}

          {/* Repetir */}
          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>

          {/* Sección educativa */}
          <EducationalSection
            title="Guía completa: cómo elegir smartphone en 2025"
            subtitle="iOS vs Android, gamas, qué mirar y cuándo comprar"
            defaultOpen={false}
          >
            <h3>iOS vs Android: diferencias clave</h3>
            <p>
              <strong>iOS</strong> es el sistema operativo de Apple, exclusivo de los iPhone. Su mayor ventaja es la
              integración perfecta con el resto de dispositivos Apple (Mac, iPad, AirPods, Apple Watch) y la garantía de
              recibir actualizaciones durante 6-7 años. Es más restrictivo en personalización, pero muy estable.
            </p>
            <p>
              <strong>Android</strong> (desarrollado por Google) lo usan Samsung, Xiaomi, Google, OnePlus y la mayoría
              de fabricantes. Ofrece mayor variedad de modelos y precios, más opciones de personalización y mejor
              integración con servicios de Google (Gmail, Drive, Meet). La duración de las actualizaciones varía
              según fabricante: Google garantiza 7 años, Samsung también 7 años, Xiaomi y otros suelen ofrecer 3-4.
            </p>

            <h3>Las gamas explicadas</h3>
            <p>
              <strong>Gama básica (hasta 250 €):</strong> ideal para llamadas, mensajería y redes sociales. Las cámaras
              son modestas, el rendimiento suficiente para el uso cotidiano y la batería suele ser generosa en capacidad.
            </p>
            <p>
              <strong>Gama media (250-500 €):</strong> el segmento con mejor relación calidad-precio del mercado. Pantallas
              AMOLED de calidad, cámaras con modo noche y teleobjetivo básico, autonomía de todo el día. La mayoría de
              usuarios encuentra aquí su móvil ideal.
            </p>
            <p>
              <strong>Gama alta (500-900 €):</strong> procesadores de primer nivel, cámaras con zoom óptico real,
              pantallas de 120 Hz con brillo máximo elevado y materiales premium. Para quienes usan el móvil de forma
              intensiva o valoran mucho la fotografía.
            </p>
            <p>
              <strong>Flagship / Pro (más de 900 €):</strong> lo más avanzado disponible. Zoom periscópico, sensores
              de cámara grandes, el procesador más potente, funciones de IA avanzadas y soporte garantizado durante
              muchos años. Se justifica para usuarios profesionales o quienes planean conservarlo 5+ años.
            </p>

            <h3>Qué mirar antes de comprar</h3>
            <ul>
              <li><strong>Actualizaciones garantizadas:</strong> cuántos años de soporte ofrece el fabricante. Importante si planeas usar el móvil 3+ años.</li>
              <li><strong>Batería (mAh) y carga rápida:</strong> más mAh no siempre significa más autonomía — el software de optimización importa mucho.</li>
              <li><strong>Cámara:</strong> los megapíxeles no lo dicen todo. El tamaño del sensor, la apertura y el procesado de imagen son más importantes.</li>
              <li><strong>Pantalla:</strong> resolución, tecnología (AMOLED vs LCD), tasa de refresco (60 Hz vs 120 Hz) y brillo máximo para exteriores.</li>
              <li><strong>Conectividad:</strong> 5G ya es estándar en gama media-alta. Comprueba también NFC si usas pagos móviles.</li>
              <li><strong>IP68 o IP67:</strong> resistencia al agua. Cada vez más habitual incluso en gama media.</li>
            </ul>

            <h3>Cuándo y dónde comprar</h3>
            <div className={styles.warningBox}>
              <strong>Mejores momentos para comprar:</strong> el precio de los smartphones baja considerablemente en el
              Black Friday (noviembre), Amazon Prime Day (julio) y cuando se lanza la generación siguiente del modelo
              que te interesa. Comprar el modelo del año anterior tras el lanzamiento del nuevo puede suponer un ahorro
              del 20-30%.
            </div>
            <p>
              Los canales más habituales en España son Amazon, El Corte Inglés, MediaMarkt y las tiendas oficiales de cada
              marca. Para segunda mano certificada, Back Market y Amazon Renewed ofrecen garantía de 12 meses y
              devolución en los mismos plazos que un producto nuevo.
            </p>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-smartphone')} />
      <ShareCard appName="selector-smartphone" />
      <Footer appName="selector-smartphone" />
    </div>
  );
}
