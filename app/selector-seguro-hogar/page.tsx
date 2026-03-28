'use client';

import React, { useState } from 'react';
import styles from './SelectorSeguroHogar.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type VeredictoKey = 'basica' | 'estandar' | 'completa';

interface Pregunta {
  id: string;
  categoria: string;
  icono: string;
  texto: string;
  opciones: { valor: string; etiqueta: string; descripcion: string; puntos: number }[];
}

interface Resultado {
  veredicto: VeredictoKey;
  puntuacion: number;
}

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 'regimen',
    categoria: 'Régimen de Tenencia',
    icono: '🏠',
    texto: '¿Eres propietario/a o inquilino/a?',
    opciones: [
      { valor: 'propietario_hipoteca', etiqueta: 'Propietario/a con hipoteca vigente', descripcion: 'El banco suele exigir un seguro mínimo', puntos: 3 },
      { valor: 'propietario_libre', etiqueta: 'Propietario/a sin hipoteca', descripcion: 'Libre de elegir la cobertura', puntos: 2 },
      { valor: 'inquilino', etiqueta: 'Inquilino/a', descripcion: 'Solo necesitas asegurar el contenido y RC', puntos: 0 },
    ],
  },
  {
    id: 'tipo_vivienda',
    categoria: 'Tipo de Vivienda',
    icono: '🏡',
    texto: '¿Qué tipo de vivienda tienes?',
    opciones: [
      { valor: 'piso', etiqueta: 'Piso en edificio de varios vecinos', descripcion: 'Riesgo compartido con comunidad', puntos: 1 },
      { valor: 'unifamiliar', etiqueta: 'Casa unifamiliar o adosado', descripcion: 'Mayor exposición perimetral', puntos: 3 },
      { valor: 'atico_bajo', etiqueta: 'Ático o planta baja', descripcion: 'Más expuesto a filtraciones, robos y clima', puntos: 2 },
      { valor: 'estudio', etiqueta: 'Estudio pequeño o local', descripcion: 'Necesidades más limitadas', puntos: 0 },
    ],
  },
  {
    id: 'antiguedad',
    categoria: 'Antigüedad del Edificio',
    icono: '🏗️',
    texto: '¿Cuántos años tiene aproximadamente el edificio?',
    opciones: [
      { valor: 'nuevo', etiqueta: 'Menos de 10 años', descripcion: 'Instalaciones en buen estado, menos riesgo', puntos: 0 },
      { valor: 'reciente', etiqueta: 'Entre 10 y 30 años', descripcion: 'Buen estado general', puntos: 1 },
      { valor: 'maduro', etiqueta: 'Entre 30 y 50 años', descripcion: 'Puede haber instalaciones antiguas', puntos: 2 },
      { valor: 'antiguo', etiqueta: 'Más de 50 años', descripcion: 'Mayor riesgo de daños estructurales o instalaciones', puntos: 3 },
    ],
  },
  {
    id: 'contenido',
    categoria: 'Valor del Contenido',
    icono: '🛋️',
    texto: '¿Cuánto vale el contenido de tu hogar? (muebles, electrónica, ropa, equipos...)',
    opciones: [
      { valor: 'bajo', etiqueta: 'Menos de 10.000 €', descripcion: 'Contenido básico', puntos: 0 },
      { valor: 'medio', etiqueta: 'Entre 10.000 y 30.000 €', descripcion: 'Hogar equipado con normalidad', puntos: 2 },
      { valor: 'alto', etiqueta: 'Entre 30.000 y 60.000 €', descripcion: 'Buen equipamiento y electrónica', puntos: 3 },
      { valor: 'muy_alto', etiqueta: 'Más de 60.000 €', descripcion: 'Equipamiento premium o colecciones', puntos: 4 },
    ],
  },
  {
    id: 'zona',
    categoria: 'Zona Geográfica',
    icono: '📍',
    texto: '¿En qué tipo de zona está tu vivienda?',
    opciones: [
      { valor: 'urbano', etiqueta: 'Centro urbano consolidado', descripcion: 'Riesgo de robo moderado-alto', puntos: 2 },
      { valor: 'extrarradio', etiqueta: 'Extrarradio o urbanización', descripcion: 'Menor densidad, posible mayor riesgo de robo', puntos: 2 },
      { valor: 'rural_costa', etiqueta: 'Zona rural o costa', descripcion: 'Riesgos climáticos y de aislamiento', puntos: 3 },
      { valor: 'riesgo', etiqueta: 'Zona con riesgo de inundación o incendio forestal', descripcion: 'Riesgo natural significativo', puntos: 4 },
    ],
  },
  {
    id: 'convivientes',
    categoria: 'Unidad Familiar',
    icono: '👨‍👩‍👧',
    texto: '¿Cuántas personas viven habitualmente en la vivienda?',
    opciones: [
      { valor: 'solo', etiqueta: 'Vivo solo/a', descripcion: 'Menor riesgo de daños internos', puntos: 0 },
      { valor: 'pareja', etiqueta: 'Dos personas (pareja, compañeros...)', descripcion: 'Uso normal del hogar', puntos: 1 },
      { valor: 'familia', etiqueta: 'Familia con hijos menores', descripcion: 'Más actividad, más probabilidad de accidentes domésticos', puntos: 2 },
      { valor: 'compartido', etiqueta: 'Piso compartido con varias personas', descripcion: 'Mayor rotación y uso del espacio', puntos: 2 },
    ],
  },
  {
    id: 'objetos_valor',
    categoria: 'Objetos de Alto Valor',
    icono: '💎',
    texto: '¿Tienes objetos de especial valor en casa?',
    opciones: [
      { valor: 'no', etiqueta: 'No, nada especialmente valioso', descripcion: 'Sin artículos fuera de lo habitual', puntos: 0 },
      { valor: 'algo', etiqueta: 'Sí, algunos artículos de valor (joyas, equipo fotográfico...)', descripcion: 'Conviene asegurarlos específicamente', puntos: 2 },
      { valor: 'mucho', etiqueta: 'Sí, bastante valor acumulado (arte, instrumentos, colecciones...)', descripcion: 'Requiere cobertura específica o valoración', puntos: 4 },
    ],
  },
  {
    id: 'preocupacion',
    categoria: 'Principal Preocupación',
    icono: '⚠️',
    texto: '¿Qué te preocupa más respecto a tu vivienda?',
    opciones: [
      { valor: 'agua', etiqueta: 'Daños por agua (tuberías, filtraciones, comunidad)', descripcion: 'El siniestro más frecuente en España', puntos: 1 },
      { valor: 'robo', etiqueta: 'Robo o vandalismo', descripcion: 'Especialmente si sales mucho o es una zona activa', puntos: 2 },
      { valor: 'incendio', etiqueta: 'Incendio, explosión o fenómenos climáticos', descripcion: 'Daños catastróficos que requieren cobertura sólida', puntos: 3 },
      { valor: 'rc', etiqueta: 'Responsabilidad civil (dañar a vecinos)', descripcion: 'Una fuga mía que cause daños al piso de abajo', puntos: 1 },
      { valor: 'todo', etiqueta: 'Todo por igual, quiero estar tranquilo/a', descripcion: 'Cobertura amplia como prioridad', puntos: 3 },
    ],
  },
  {
    id: 'siniestros',
    categoria: 'Historial de Siniestros',
    icono: '📋',
    texto: '¿Has tenido siniestros en tu vivienda en los últimos 5 años?',
    opciones: [
      { valor: 'ninguno', etiqueta: 'No, ninguno', descripcion: 'Historial limpio', puntos: 0 },
      { valor: 'menor', etiqueta: 'Sí, uno menor (pequeña fuga, cristal roto...)', descripcion: 'Incidentes menores son frecuentes', puntos: 1 },
      { valor: 'significativo', etiqueta: 'Sí, uno o más importantes', descripcion: 'La experiencia de siniestro eleva la percepción del riesgo', puntos: 3 },
    ],
  },
  {
    id: 'prioridad',
    categoria: 'Prioridad al Contratar',
    icono: '🎯',
    texto: '¿Qué priorizas al elegir un seguro de hogar?',
    opciones: [
      { valor: 'precio', etiqueta: 'El precio más bajo posible', descripcion: 'Cobertura mínima obligatoria', puntos: 0 },
      { valor: 'equilibrio', etiqueta: 'Equilibrio cobertura-precio', descripcion: 'Bien cubierto sin excesos', puntos: 1 },
      { valor: 'completo', etiqueta: 'La cobertura más amplia posible', descripcion: 'Tranquilidad total aunque cueste más', puntos: 3 },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos de veredictos
// ─────────────────────────────────────────────

const VEREDICTOS: Record<VeredictoKey, {
  icono: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  precioOrientativo: string;
  precioNota: string;
  coberturaIncluida: string[];
  coberturaRecomendada: string[];
  razones: string[];
  consejos: string[];
}> = {
  basica: {
    icono: '🛡️',
    etiqueta: 'Tipo de cobertura recomendada',
    titulo: 'Cobertura Básica',
    descripcion: 'Tu perfil no requiere una cobertura muy amplia. Una póliza básica que cubra los daños más frecuentes y la responsabilidad civil te dará tranquilidad sin gastar de más.',
    precioOrientativo: '100 – 200 €/año',
    precioNota: 'Orientativo para piso medio en España. Precio final depende de la aseguradora y características.',
    coberturaIncluida: [
      'Incendio y explosión',
      'Daños por agua (tuberías propias)',
      'Responsabilidad civil frente a terceros',
      'Robo con fuerza en el inmueble',
      'Fenómenos eléctricos',
    ],
    coberturaRecomendada: [
      'Asistencia en el hogar 24h (reparaciones urgentes)',
      'Defensa jurídica básica',
    ],
    razones: [
      'Tu vivienda tiene bajo riesgo relativo',
      'El valor del contenido no justifica una prima mayor',
      'No tienes factores de riesgo adicionales',
      'La cobertura básica cubre los siniestros más frecuentes',
    ],
    consejos: [
      'Comprueba que el capital del continente está actualizado si eres propietario',
      'La RC a terceros es imprescindible: una fuga tuya puede causar daños cuantiosos',
      'Revisa la póliza anualmente — los precios y necesidades cambian',
      'Aunque el seguro sea básico, lee bien las exclusiones',
    ],
  },
  estandar: {
    icono: '🏠',
    etiqueta: 'Tipo de cobertura recomendada',
    titulo: 'Multirriesgo Estándar',
    descripcion: 'Tu situación aconseja una póliza multirriesgo que va más allá de lo básico. Protección completa contra los riesgos más frecuentes y algunos específicos de tu caso.',
    precioOrientativo: '200 – 400 €/año',
    precioNota: 'Orientativo para hogar medio en España. El precio varía según capitales asegurados y aseguradora.',
    coberturaIncluida: [
      'Todo lo de la cobertura básica',
      'Daños por agua de comunidad y vecinos',
      'Robo y expoliación (también fuera del hogar)',
      'Fenómenos atmosféricos (granizo, viento, nieve)',
      'Asistencia en el hogar 24h',
      'Defensa jurídica',
    ],
    coberturaRecomendada: [
      'Objetos de valor con capital específico',
      'Daños estéticos si el piso es relativamente moderno',
      'Seguro de hogar vacacional si tienes segunda residencia',
    ],
    razones: [
      'Tu vivienda o zona presenta riesgos moderados',
      'El valor del contenido justifica una cobertura más amplia',
      'La asistencia en el hogar te dará mucha tranquilidad',
      'Las coberturas adicionales pueden ahorrarte disgustos',
    ],
    consejos: [
      'Declara correctamente el valor del contenido — el infraseguro te perjudica',
      'Pregunta por el capital de robo: algunos básicos tienen límites muy bajos',
      'La asistencia 24h es de las coberturas más usadas — valórala bien',
      'Compara al menos 3 presupuestos antes de decidir',
    ],
  },
  completa: {
    icono: '⭐',
    etiqueta: 'Tipo de cobertura recomendada',
    titulo: 'Multirriesgo Completa',
    descripcion: 'Tu perfil justifica la cobertura más amplia disponible. Ya sea por el valor de la vivienda, el contenido, la zona de riesgo o tus prioridades, una póliza completa te dará la máxima tranquilidad.',
    precioOrientativo: '400 – 800 €/año',
    precioNota: 'Orientativo para hogar con contenido de valor en España. Puede variar significativamente según el caso.',
    coberturaIncluida: [
      'Todo lo de la cobertura estándar',
      'Daños estéticos y ornamentales',
      'Objetos de especial valor (joyería, obras de arte, colecciones)',
      'Protección jurídica amplia',
      'Responsabilidad civil ampliada',
      'Todo riesgo accidental del contenido',
    ],
    coberturaRecomendada: [
      'Valoración pericial del continente y contenido',
      'Cobertura específica de equipos electrónicos portátiles',
      'Seguro de segunda residencia o de alquiler si procede',
    ],
    razones: [
      'Tu vivienda o contenido tienen valor elevado',
      'Vives en zona con riesgos específicos (inundación, incendio forestal, robo)',
      'Tienes objetos de valor que requieren cobertura específica',
      'Prefieres tranquilidad total a ahorrar en la prima',
    ],
    consejos: [
      'Solicita una valoración profesional del continente para asegurarlo correctamente',
      'Los objetos de valor especial (joyas, arte) suelen necesitar tasación y declaración expresa',
      'Lee las condiciones de indemnización: valor venal vs valor nuevo hace mucha diferencia',
      'Revisa si tu póliza cubre daños durante obras o reformas',
    ],
  },
};

// ─────────────────────────────────────────────
// Lógica de resultado
// ─────────────────────────────────────────────

function calcularResultado(respuestas: Record<string, string>): Resultado {
  let puntuacion = 0;
  PREGUNTAS.forEach(p => {
    const resp = respuestas[p.id];
    const op = p.opciones.find(o => o.valor === resp);
    if (op) puntuacion += op.puntos;
  });

  let veredicto: VeredictoKey;
  if (puntuacion <= 10) veredicto = 'basica';
  else if (puntuacion <= 20) veredicto = 'estandar';
  else veredicto = 'completa';

  return { veredicto, puntuacion };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'inicio' | 'test' | 'resultado';

export default function SelectorSeguroHogar() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      setResultado(calcularResultado(respuestas));
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('inicio');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  const veredictoData = resultado ? VEREDICTOS[resultado.veredicto] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Qué seguro de hogar necesitas?</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'inicio'
              ? 'Descubre la cobertura adecuada para tu vivienda y situación real'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu cobertura recomendada</h1>
          <p className={styles.heroSubtitleSm}>{veredictoData?.titulo ?? ''}</p>
        </header>
      )}

      <LegalNotice />

      {/* ── Pantalla de inicio ── */}
      {pantalla === 'inicio' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🏠</span>
              <span className={styles.introIcon}>🔒</span>
              <span className={styles.introIcon}>💧</span>
              <span className={styles.introIcon}>🛡️</span>
            </div>
            <h2 className={styles.introTitulo}>¿Qué seguro de hogar necesitas?</h2>
            <p className={styles.introDesc}>
              La cobertura adecuada según tu vivienda y situación personal. En 10 preguntas analizamos
              tu régimen de tenencia, el tipo de vivienda, la zona y el valor de lo que quieres proteger
              para orientarte sin sesgos comerciales.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás con este test">
              <li><span aria-hidden="true">✅</span> Veredicto claro: básica, estándar o completa</li>
              <li><span aria-hidden="true">✅</span> Coberturas incluidas y recomendadas por perfil</li>
              <li><span aria-hidden="true">✅</span> Rango de precio orientativo en España</li>
              <li><span aria-hidden="true">✅</span> Consejos para contratar sin errores</li>
            </ul>
            <button
              type="button"
              className={styles.btnStart}
              onClick={() => setPantalla('test')}
            >
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {/* ── Pantalla de test ── */}
      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-label={`Progreso del test: pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso + 1}
              aria-valuemin={1}
              aria-valuemax={totalPreguntas}
            >
              <div className={styles.progresoRelleno} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icono}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.texto}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.texto}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  aria-pressed={respuestas[preguntaActual.id] === op.valor ? true : false}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

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

      {/* ── Pantalla de resultado ── */}
      {pantalla === 'resultado' && resultado && veredictoData && (
        <div className={styles.resultadosContainer}>

          {/* Veredicto principal */}
          <div className={`${styles.veredictoCard} ${styles[`veredicto_${resultado.veredicto}`]}`}>
            <span className={styles.veredictoIcon} aria-hidden="true">{veredictoData.icono}</span>
            <p className={styles.veredictoLabel}>{veredictoData.etiqueta}</p>
            <p className={styles.veredictoValor}>{veredictoData.titulo}</p>
            <p className={styles.veredictoDesc}>{veredictoData.descripcion}</p>
          </div>

          {/* Precio orientativo */}
          <p className={styles.precioRango}>{veredictoData.precioOrientativo}</p>
          <p className={styles.precioNota}>{veredictoData.precioNota}</p>

          {/* Grid de coberturas */}
          <div className={styles.coberturaGrid}>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>Coberturas incluidas</p>
              {veredictoData.coberturaIncluida.map((item, i) => (
                <p key={i} className={styles.coberturaItem}>{item}</p>
              ))}
            </div>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>También recomendamos</p>
              {veredictoData.coberturaRecomendada.map((item, i) => (
                <p key={i} className={styles.coberturaItem}>{item}</p>
              ))}
            </div>
          </div>

          {/* Por qué esta cobertura */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta cobertura</p>
            {veredictoData.razones.map((razon, i) => (
              <p key={i} className={styles.razonItem}>{razon}</p>
            ))}
          </div>

          {/* Antes de contratar */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de contratar</p>
            {veredictoData.consejos.map((consejo, i) => (
              <p key={i} className={styles.consejoItem}>{consejo}</p>
            ))}
          </div>

          {/* Sección educativa */}
          <EducationalSection
            title="Guía completa: seguros de hogar en España"
            subtitle="Continente, contenido, coberturas, infraseguro y cómo comparar sin errores"
            defaultOpen={false}
          >
            <h3>Diferencia entre seguro de continente y contenido</h3>
            <p>
              El <strong>continente</strong> es la estructura del inmueble: paredes, suelos, techo, instalaciones fijas
              (fontanería, electricidad, calefacción). Solo interesa a propietarios. El <strong>contenido</strong>
              son todos los bienes muebles: muebles, electrodomésticos, ropa, electrónica, joyas. Tanto propietarios
              como inquilinos pueden asegurar el contenido. Un error frecuente es solo asegurar el continente y olvidar
              el contenido, o viceversa.
            </p>

            <h3>Qué es el infraseguro y cómo evitarlo</h3>
            <p>
              El infraseguro ocurre cuando el capital asegurado es inferior al valor real de lo que quieres proteger.
              En caso de siniestro, la aseguradora aplica la <em>regla proporcional</em>: si tienes asegurado el 60%
              del valor real, solo te indemnizarán el 60% del daño, aunque el daño sea parcial.
            </p>
            <div className={styles.warningBox}>
              <strong>Ejemplo práctico:</strong> Si tu piso vale 200.000 € pero lo tienes asegurado por 120.000 €,
              en un incendio que cause 40.000 € de daño solo recibirás 24.000 € (60%). Actualiza el capital
              asegurado cada pocos años y cuando hagas reformas importantes.
            </div>

            <h3>Los 5 siniestros más frecuentes en hogares españoles</h3>
            <ul>
              <li><strong>Daños por agua (45%):</strong> Fugas, roturas de tuberías, filtraciones desde pisos superiores y comunidades. Es el siniestro más habitual y una de las coberturas más usadas.</li>
              <li><strong>Robo (20%):</strong> Tanto en el interior como expoliación fuera del hogar. La cobertura varía mucho entre pólizas: revisa el capital máximo y las exclusiones.</li>
              <li><strong>Incendio y explosión (15%):</strong> Menos frecuente pero potencialmente catastrófico. Suele estar incluido en todas las coberturas.</li>
              <li><strong>Fenómenos atmosféricos (12%):</strong> Granizo, viento, nieve, rayos. El Consorcio de Compensación de Seguros cubre algunos fenómenos extraordinarios.</li>
              <li><strong>Responsabilidad civil (8%):</strong> Daños causados a terceros (vecinos, viandantes) por descuidos o accidentes en tu vivienda.</li>
            </ul>

            <h3>Propietario vs inquilino: qué cubre cada uno</h3>
            <p>
              Como <strong>propietario</strong> necesitas asegurar el continente (obligatorio si tienes hipoteca)
              y opcionalmente el contenido y la responsabilidad civil. Como <strong>inquilino</strong>, el
              continente es responsabilidad del propietario; tú solo necesitas asegurar tu contenido y una
              buena responsabilidad civil por daños que puedas causar. Un seguro de inquilino puede costar
              desde 60-100 €/año y te protege de situaciones como una fuga tuya que inunde al vecino de abajo.
            </p>

            <h3>Cómo comparar seguros sin caer en trampas</h3>
            <ul>
              <li><strong>No compares solo el precio:</strong> Una póliza barata con capital de robo de 3.000 € puede ser inútil si tu electrónica vale más. Compara capitales y coberturas, no solo primas.</li>
              <li><strong>Lee las exclusiones:</strong> Los seguros excluyen habitualmente daños por humedad ambiental, desgaste ordinario, obras sin permiso y siniestros por negligencia grave.</li>
              <li><strong>Atención a las franquicias:</strong> Algunas pólizas económicas tienen franquicias (cantidad mínima que asumes tú) de 150-300 €, lo que hace inútil reclamar siniestros pequeños.</li>
              <li><strong>Consorcio de Compensación de Seguros:</strong> Cualquier seguro de hogar en España incluye automáticamente cobertura del Consorcio para catástrofes naturales extraordinarias (terremotos, inundaciones graves, erupciones). No necesitas contratarlo por separado.</li>
              <li><strong>Compara con agregadores:</strong> Mutua Madrileña, Mapfre, Allianz, Generali y AXA son las más grandes, pero comparadores como RACC o Acierto pueden ofrecerte mejores condiciones personalizadas.</li>
            </ul>
          </EducationalSection>

          {/* Botón repetir */}
          <button
            type="button"
            className={styles.btnRepetir}
            onClick={reiniciar}
            aria-label="Repetir el test desde el principio"
          >
            ← Repetir el test
          </button>

          {/* Aviso orientativo */}
          <div className={styles.warningBox}>
            Esta herramienta es orientativa. Las coberturas y precios indicados son aproximados y pueden variar
            significativamente según la aseguradora, la zona y las características específicas de tu vivienda.
            Compara siempre varias pólizas antes de contratar.
          </div>

          <ShareCard appName="selector-seguro-hogar" />
          <RelatedApps apps={getRelatedApps('selector-seguro-hogar')} />
          <Footer appName="selector-seguro-hogar" />
        </div>
      )}

      {pantalla !== 'resultado' && (
        <>
          <RelatedApps apps={getRelatedApps('selector-seguro-hogar')} />
          <ShareCard appName="selector-seguro-hogar" />
          <Footer appName="selector-seguro-hogar" />
        </>
      )}
    </div>
  );
}
