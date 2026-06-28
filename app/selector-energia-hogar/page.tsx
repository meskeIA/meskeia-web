'use client';

import React, { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SelectorEnergiaHogar.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type RecomendacionKey = 'gas' | 'electrico' | 'aerotermia' | 'biomasa' | 'solar';

interface OpcionPregunta {
  texto: string;
  pesos: Partial<Record<RecomendacionKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: OpcionPregunta[];
}

interface Recomendacion {
  key: RecomendacionKey;
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  inversionInicial: string;
  costeAnual: string;
  eficiencia: string;
  emisionesCO2: string;
  ventajas: string[];
  consideraciones: string[];
  subvenciones: string;
}

// ─────────────────────────────────────────────
// Datos: 10 preguntas con pesos
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿En qué zona climática está tu vivienda?',
    opciones: [
      { texto: 'Zona fría (norte de España, montaña, meseta)', pesos: { gas: 3, aerotermia: 2, biomasa: 3 } },
      { texto: 'Zona templada (centro, mediterráneo interior)', pesos: { aerotermia: 3, gas: 2, electrico: 2 } },
      { texto: 'Zona cálida (sur, mediterráneo costa, Canarias)', pesos: { electrico: 3, aerotermia: 3, solar: 3 } },
      { texto: 'Clima oceánico (Galicia, Cantábrico)', pesos: { aerotermia: 3, biomasa: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Qué tipo de vivienda tienes?',
    opciones: [
      { texto: 'Piso en bloque de edificio', pesos: { gas: 3, electrico: 2 } },
      { texto: 'Casa unifamiliar', pesos: { aerotermia: 4, biomasa: 3, solar: 3 } },
      { texto: 'Apartamento pequeño (menos de 60 m²)', pesos: { electrico: 3, gas: 2 } },
      { texto: 'Casa con jardín o patio exterior', pesos: { aerotermia: 3, biomasa: 4, solar: 3 } },
    ],
  },
  {
    id: 3,
    texto: '¿Tienes acceso a red de gas natural en tu zona?',
    opciones: [
      { texto: 'Sí, y actualmente ya tengo caldera de gas', pesos: { gas: 4 } },
      { texto: 'Sí, pero no tengo caldera todavía', pesos: { aerotermia: 2, gas: 3 } },
      { texto: 'No hay red de gas en mi zona', pesos: { aerotermia: 4, electrico: 3, biomasa: 3 } },
      { texto: 'No lo sé con seguridad', pesos: { aerotermia: 2, electrico: 2 } },
    ],
  },
  {
    id: 4,
    texto: '¿Cuánto puedes invertir en la instalación inicial?',
    opciones: [
      { texto: 'Menos de 3.000 €', pesos: { gas: 3, electrico: 3 } },
      { texto: 'Entre 3.000 € y 8.000 €', pesos: { aerotermia: 3, gas: 2 } },
      { texto: 'Entre 8.000 € y 15.000 €', pesos: { aerotermia: 4, biomasa: 3 } },
      { texto: 'Más de 15.000 € (si las ayudas lo justifican)', pesos: { aerotermia: 4, solar: 3 } },
    ],
  },
  {
    id: 5,
    texto: '¿Cuál es tu prioridad principal?',
    opciones: [
      { texto: 'Mínimo coste mensual en facturas', pesos: { biomasa: 3, aerotermia: 3 } },
      { texto: 'Mínima inversión inicial', pesos: { gas: 3, electrico: 3 } },
      { texto: 'Máxima eficiencia energética', pesos: { aerotermia: 4, solar: 3 } },
      { texto: 'Independencia de la red energética', pesos: { biomasa: 4, solar: 3 } },
    ],
  },
  {
    id: 6,
    texto: '¿Tienes espacio exterior para instalar equipos?',
    opciones: [
      { texto: 'Sí, jardín o terraza amplia', pesos: { aerotermia: 3, biomasa: 3, solar: 4 } },
      { texto: 'Solo terraza pequeña o balcón', pesos: { aerotermia: 2, solar: 2 } },
      { texto: 'No, solo interior (piso sin terraza)', pesos: { gas: 3, electrico: 3 } },
      { texto: 'Tengo ático o acceso a cubierta del edificio', pesos: { solar: 3, aerotermia: 2 } },
    ],
  },
  {
    id: 7,
    texto: '¿Qué importancia le das a la sostenibilidad ambiental?',
    opciones: [
      { texto: 'Es mi principal criterio de decisión', pesos: { aerotermia: 4, solar: 4, biomasa: 3 } },
      { texto: 'Es importante, pero no el único factor', pesos: { aerotermia: 2, solar: 2 } },
      { texto: 'Me importa moderadamente', pesos: { gas: 1, aerotermia: 2 } },
      { texto: 'Priorizo el coste sobre la sostenibilidad', pesos: { gas: 3, electrico: 2 } },
    ],
  },
  {
    id: 8,
    texto: '¿Planeas renovar tu sistema de distribución de calor o ya tienes suelo radiante?',
    opciones: [
      { texto: 'Sí, tengo o voy a instalar suelo radiante', pesos: { aerotermia: 4 } },
      { texto: 'Tengo radiadores convencionales de alta temperatura', pesos: { gas: 3, biomasa: 2 } },
      { texto: 'Tengo aire acondicionado multisplit', pesos: { electrico: 3 } },
      { texto: 'Estoy construyendo o haciendo reforma integral', pesos: { aerotermia: 4, solar: 3 } },
    ],
  },
  {
    id: 9,
    texto: '¿Puedes almacenar combustible (pellets o leña) en tu vivienda?',
    opciones: [
      { texto: 'Sí, tengo local, garaje o almacén disponible', pesos: { biomasa: 4 } },
      { texto: 'Tengo algo de espacio pero limitado', pesos: { biomasa: 2 } },
      { texto: 'No tengo espacio para almacenaje de combustible', pesos: { gas: 3, electrico: 3, aerotermia: 3 } },
    ],
  },
  {
    id: 10,
    texto: '¿Te interesa acogerte a subvenciones del programa PERRE o PREE 5000?',
    opciones: [
      { texto: 'Sí, quiero maximizar las ayudas disponibles', pesos: { aerotermia: 4, solar: 4 } },
      { texto: 'Me interesan pero no son decisivas', pesos: { aerotermia: 2, solar: 2 } },
      { texto: 'No he investigado las ayudas todavía', pesos: { gas: 2, electrico: 1 } },
      { texto: 'Prefiero la solución más simple aunque no haya ayudas', pesos: { gas: 3, electrico: 2 } },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: Recomendaciones
// ─────────────────────────────────────────────

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  gas: {
    key: 'gas',
    icono: '🔥',
    titulo: 'Caldera de Gas Natural',
    subtitulo: 'Solución consolidada con instalación asequible',
    descripcion:
      'La caldera de gas natural es la solución más extendida en España: instalación económica, alta potencia calorífica y amplia red de técnicos. Su principal limitación es la dependencia de un combustible fósil cuyo precio fluctúa en el mercado y cuya normativa europea apunta a restricciones entre 2030 y 2035 para instalaciones nuevas.',
    inversionInicial: '2.000 – 5.000 €',
    costeAnual: '800 – 1.400 €/año',
    eficiencia: '90 – 109 % (condensación)',
    emisionesCO2: 'Moderadas (~2 kg CO₂/m²/año)',
    ventajas: [
      'Menor inversión inicial del mercado',
      'Alta potencia: calienta rápido en inviernos fríos',
      'Amplia red de servicio técnico',
      'Compatible con radiadores existentes',
      'Tiempo de instalación corto (1-2 días)',
    ],
    consideraciones: [
      'Dependencia del precio del gas en el mercado',
      'Restricciones europeas para instalaciones nuevas previstas 2030-2035',
      'No apto si no hay red de gas natural en la zona',
      'Emisiones de CO₂ y contaminantes locales',
      'Requiere mantenimiento anual obligatorio',
    ],
    subvenciones:
      'Las calderas de gas no acceden a los programas PREE ni PERRE. Pueden beneficiarse de deducciones fiscales si se instalan en combinación con mejoras de eficiencia energética (certificado energético previo y posterior).',
  },
  electrico: {
    key: 'electrico',
    icono: '⚡',
    titulo: 'Calefacción Eléctrica / Bomba de Calor Aire-Aire',
    subtitulo: 'Flexibilidad máxima y coste de instalación bajo',
    descripcion:
      'Los sistemas eléctricos van desde radiadores convencionales hasta bombas de calor aire-aire (splits). Esta última opción es la más eficiente: por cada kWh consumido genera entre 2,5 y 4 kWh de calor. Ideal para zonas con inviernos suaves o como complemento a otro sistema principal.',
    inversionInicial: '1.500 – 6.000 €',
    costeAnual: '600 – 1.200 €/año (con bomba calor)',
    eficiencia: '250 – 400 % COP (bomba calor)',
    emisionesCO2: 'Bajas si mix eléctrico renovable',
    ventajas: [
      'Instalación sencilla, sin obras estructurales',
      'Calienta y refrigera con un mismo equipo',
      'Sin emisiones directas en el hogar',
      'Alta eficiencia con bomba de calor',
      'Control preciso por zonas y habitaciones',
    ],
    consideraciones: [
      'Tarifa eléctrica variable según tramos horarios',
      'Coste por kWh históricamente superior al gas',
      'Rendimiento reducido en temperaturas muy bajas (-5 °C)',
      'No apto como único sistema en zonas muy frías',
      'Requiere buena instalación eléctrica (potencia contratada)',
    ],
    subvenciones:
      'Los sistemas de bomba de calor aire-aire pueden acceder al programa PREE 5000 (hasta 3.000 € por instalación) si sustituyen sistemas convencionales ineficientes. Consultar bases de la convocatoria vigente en tu comunidad autónoma.',
  },
  aerotermia: {
    key: 'aerotermia',
    icono: '🌬️',
    titulo: 'Aerotermia (Bomba de Calor Aire-Agua)',
    subtitulo: 'Máxima eficiencia para calefacción y agua caliente',
    descripcion:
      'La aerotermia extrae calor del aire exterior para climatizar el interior y producir agua caliente sanitaria (ACS). Con un COP entre 3 y 4, genera 3-4 kWh de calor por cada kWh eléctrico consumido. La opción de mayor rendimiento a largo plazo, especialmente combinada con suelo radiante o fancoils de baja temperatura.',
    inversionInicial: '8.000 – 18.000 €',
    costeAnual: '500 – 1.000 €/año',
    eficiencia: '300 – 400 % COP estacional',
    emisionesCO2: 'Muy bajas (depende del mix eléctrico)',
    ventajas: [
      'Calefacción + refrigeración + ACS en un solo sistema',
      'Eficiencia estacional (SCOP) superior a cualquier quemador',
      'Sin emisiones directas ni combustible almacenado',
      'Acceso a las mayores subvenciones disponibles',
      'Vida útil 20-25 años con mantenimiento básico',
    ],
    consideraciones: [
      'Inversión inicial elevada',
      'Rinde mejor con suelo radiante (temperatura baja)',
      'Requiere unidad exterior: espacio y nivel sonoro',
      'En inviernos extremos, el COP se reduce',
      'Instalación por técnicos especializados (gas fluorado)',
    ],
    subvenciones:
      'Principal beneficiaria del programa PERRE (hasta 40 % del coste) y PREE 5000. Además, deducción en IRPF por mejora energética: hasta 40 % en la cuota (máx. 7.500 €/año) si se mejora 2 letras en la calificación energética. Verificar convocatoria activa en tu CCAA.',
  },
  biomasa: {
    key: 'biomasa',
    icono: '🪵',
    titulo: 'Caldera de Biomasa / Pellets',
    subtitulo: 'Combustible renovable económico con alta autonomía',
    descripcion:
      'Las calderas de pellets o biomasa queman material orgánico sólido con rendimientos superiores al 90 %. El coste del combustible es notablemente inferior al gas natural y la electricidad, y los pellets certificados tienen huella de carbono casi neutra. Requieren almacenamiento del combustible y mantenimiento más frecuente.',
    inversionInicial: '8.000 – 16.000 €',
    costeAnual: '400 – 900 €/año',
    eficiencia: '90 – 95 % (caldera condensación)',
    emisionesCO2: 'Neutras (ciclo renovable)',
    ventajas: [
      'Coste de combustible muy bajo vs. gas y electricidad',
      'Combustible renovable y de producción nacional',
      'Alta potencia para superficies grandes',
      'Compatible con radiadores existentes',
      'No depende de la red eléctrica ni del gas',
    ],
    consideraciones: [
      'Requiere local o almacén para los pellets (mín. 2-4 m²)',
      'Mantenimiento más frecuente: limpieza de cenizas',
      'El suministro de pellets puede escasear en épocas de alta demanda',
      'No apto para pisos sin espacio de almacenaje',
      'Emisiones de partículas (PM2.5) si mala combustión',
    ],
    subvenciones:
      'La biomasa con pellets certificados puede acceder al programa PERRE (sustitución de sistemas fósiles) y a deducciones de IRPF por rehabilitación energética si se acredita mejora en certificado energético. Consulta el catálogo de subvenciones de tu comunidad autónoma.',
  },
  solar: {
    key: 'solar',
    icono: '☀️',
    titulo: 'Solar Térmica + Sistema de Apoyo',
    subtitulo: 'Energía del sol para ACS y apoyo a calefacción',
    descripcion:
      'Los captadores solares térmicos pueden cubrir entre el 60 % y el 80 % de las necesidades de agua caliente sanitaria anual, y en zonas muy soleadas complementan la calefacción (suelo radiante de baja temperatura). Siempre requieren un sistema de apoyo eléctrico o de gas para los días sin sol. Es la solución más sostenible con la mayor rentabilidad en el sur de España.',
    inversionInicial: '4.000 – 10.000 €',
    costeAnual: '200 – 600 €/año (sistema apoyo)',
    eficiencia: '60 – 80 % cobertura solar ACS',
    emisionesCO2: 'Mínimas (solo apoyo)',
    ventajas: [
      'Energía gratuita del sol para ACS durante todo el año',
      'Máxima sostenibilidad y menor huella de carbono',
      'Factura energética reducida drásticamente',
      'Vida útil 25-30 años con mantenimiento básico',
      'Aumenta el valor y la calificación energética del inmueble',
    ],
    consideraciones: [
      'Necesita sistema de apoyo para días nublados o alta demanda',
      'Requiere espacio en cubierta o terraza orientada al sur',
      'No apta como único sistema de calefacción',
      'El rendimiento cae en zonas con poca irradiación solar',
      'Instalación y normativa urbanística varía por municipio',
    ],
    subvenciones:
      'Los sistemas solares térmicos acceden al programa PERRE y a las deducciones de IRPF por rehabilitación energética (hasta 60 % de la cuota si la mejora es integral). En Canarias y zonas de alta irradiación, las ayudas autonómicas suelen ser más generosas. Consultar Plan de Recuperación, Transformación y Resiliencia (PRTR).',
  },
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorEnergiaHogarPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(new Array(PREGUNTAS.length).fill(-1));
  const [resultado, setResultado] = useState<RecomendacionKey | null>(null);

  const totalPreguntas = PREGUNTAS.length;
  const progresoPct = resultado
    ? 100
    : Math.round((preguntaActual / totalPreguntas) * 100);

  const opcionSeleccionada = respuestas[preguntaActual];

  // ── Seleccionar opción ──
  function seleccionarOpcion(indice: number) {
    setRespuestas((prev) => {
      const copia = [...prev];
      copia[preguntaActual] = indice;
      return copia;
    });
  }

  // ── Siguiente ──
  function irSiguiente() {
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((p) => p + 1);
    }
  }

  // ── Anterior ──
  function irAnterior() {
    if (preguntaActual > 0) {
      setPreguntaActual((p) => p - 1);
    }
  }

  // ── Calcular resultado ──
  function calcularResultado() {
    const puntuaciones: Record<RecomendacionKey, number> = {
      gas: 0,
      electrico: 0,
      aerotermia: 0,
      biomasa: 0,
      solar: 0,
    };

    PREGUNTAS.forEach((pregunta, idx) => {
      const respIdx = respuestas[idx];
      if (respIdx >= 0) {
        const opcion = pregunta.opciones[respIdx];
        (Object.entries(opcion.pesos) as [RecomendacionKey, number][]).forEach(([key, valor]) => {
          puntuaciones[key] += valor;
        });
      }
    });

    const ganador = (Object.entries(puntuaciones) as [RecomendacionKey, number][]).reduce(
      (mejor, actual) => (actual[1] > mejor[1] ? actual : mejor),
      ['gas', 0] as [RecomendacionKey, number]
    );

    setResultado(ganador[0]);
  }

  // ── Reiniciar ──
  function reiniciar() {
    setPreguntaActual(0);
    setRespuestas(new Array(PREGUNTAS.length).fill(-1));
    setResultado(null);
  }

  const recomendacion = resultado ? RECOMENDACIONES[resultado] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}><span aria-hidden="true">🏠</span> Selector de Energía para el Hogar</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para saber qué sistema de calefacción y agua caliente se adapta
          mejor a tu vivienda, zona y presupuesto: gas natural, aerotermia, bomba de calor,
          biomasa o solar térmica.
        </p>
      </header>

      <LegalNotice />

      {/* Test o Resultado */}
      {!resultado ? (
        <section className={styles.testSection} aria-label="Test de selección de energía">
          {/* Barra de progreso */}
          <div className={styles.progreso}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoLabel}>
                Pregunta {preguntaActual + 1} de {totalPreguntas}
              </span>
              <span>{progresoPct} %</span>
            </div>
            <div className={styles.progresoBar} role="progressbar" aria-valuenow={progresoPct} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.progresoFill} style={{ width: `${progresoPct}%` }} />
            </div>
          </div>

          {/* Pregunta actual */}
          <div className={styles.pregunta}>
            <span className={styles.preguntaNumero} aria-hidden="true">
              Pregunta {PREGUNTAS[preguntaActual].id}
            </span>
            <p className={styles.preguntaTexto} id={`pregunta-${preguntaActual}`}>
              {PREGUNTAS[preguntaActual].texto}
            </p>

            <div
              className={styles.opciones}
              role="group"
              aria-labelledby={`pregunta-${preguntaActual}`}
            >
              {PREGUNTAS[preguntaActual].opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcionBtn}${opcionSeleccionada === idx ? ` ${styles.selected}` : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={opcionSeleccionada === idx ? true : false}
                >
                  <span className={styles.opcionIndicador} aria-hidden="true" />
                  <span className={styles.opcionTexto}>{opcion.texto}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <nav className={styles.navegacion} aria-label="Navegación del test">
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-label="Ir a la pregunta anterior"
            >
              ← Anterior
            </button>

            {preguntaActual < totalPreguntas - 1 ? (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={opcionSeleccionada === -1}
                aria-label="Ir a la siguiente pregunta"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={calcularResultado}
                disabled={opcionSeleccionada === -1}
                aria-label="Ver mi recomendación personalizada"
              >
                Ver mi recomendación ✓
              </button>
            )}
          </nav>
        </section>
      ) : (
        // ── Sección resultado ──
        recomendacion && (
          <section
            className={styles.resultadoSection}
            aria-label="Resultado de la recomendación"
            role="alert"
            aria-live="polite"
          >
            {/* Progreso completado */}
            <div className={styles.progreso}>
              <div className={styles.progresoInfo}>
                <span className={styles.progresoLabel}>Test completado</span>
                <span>100 %</span>
              </div>
              <div className={styles.progresoBar} role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
                <div className={styles.progresoFill} style={{ width: '100%' }} />
              </div>
            </div>

            <div className={`${styles.resultadoCard} ${styles[`recomendacion_${recomendacion.key}`]}`}>
              {/* Cabecera */}
              <div className={styles.resultadoCabecera}>
                <span className={styles.resultadoIcono} aria-hidden="true">{recomendacion.icono}</span>
                <div>
                  <h2 className={styles.resultadoTitulo}>{recomendacion.titulo}</h2>
                  <p className={styles.resultadoSubtitulo}>{recomendacion.subtitulo}</p>
                </div>
              </div>

              {/* Cuerpo */}
              <div className={styles.resultadoCuerpo}>
                <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

                {/* Specs */}
                <div className={styles.especsGrid}>
                  <div className={styles.especCard}>
                    <span className={styles.especLabel}>Inversión inicial</span>
                    <span className={styles.especValor}>{recomendacion.inversionInicial}</span>
                  </div>
                  <div className={styles.especCard}>
                    <span className={styles.especLabel}>Coste anual estimado</span>
                    <span className={styles.especValor}>{recomendacion.costeAnual}</span>
                  </div>
                  <div className={styles.especCard}>
                    <span className={styles.especLabel}>Eficiencia</span>
                    <span className={styles.especValor}>{recomendacion.eficiencia}</span>
                  </div>
                  <div className={styles.especCard}>
                    <span className={styles.especLabel}>Emisiones CO₂</span>
                    <span className={styles.especValor}>{recomendacion.emisionesCO2}</span>
                  </div>
                </div>

                {/* Ventajas y consideraciones */}
                <div className={styles.ventajasSection}>
                  <div className={styles.ventajasBloque}>
                    <h3 className={styles.ventajasTitulo}><span aria-hidden="true">✓</span> Puntos fuertes</h3>
                    <ul className={`${styles.ventajasList} ${styles.ventajasPositivo}`}>
                      {recomendacion.ventajas.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.ventajasBloque}>
                    <h3 className={styles.ventajasTitulo}>! A tener en cuenta</h3>
                    <ul className={`${styles.ventajasList} ${styles.ventajasNegativo}`}>
                      {recomendacion.consideraciones.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Subvenciones */}
                <div className={styles.subvencionesSection}>
                  <h3 className={styles.subvencionesTitulo}><span aria-hidden="true">💰</span> Ayudas y subvenciones disponibles</h3>
                  <p className={styles.subvencionesTexto}>{recomendacion.subvenciones}</p>
                </div>

                {/* Reiniciar */}
                <div className={styles.resultadoAcciones}>
                  <button
                    type="button"
                    className={styles.btnReiniciar}
                    onClick={reiniciar}
                    aria-label="Volver a hacer el test"
                  >
                    ↩ Repetir el test
                  </button>
                </div>
              </div>
            </div>
          </section>
        )
      )}

      {/* Disclaimer — fuera del toggle, siempre visible */}
      <DisclaimerCard variant="financial" severity="critical" />

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Sistemas de calefacción y energía para el hogar"
        subtitle="Comparativa técnica y económica de las principales opciones"
      >
        <div className={styles.educativo}>

          {/* Aviso de precio variable */}
          <div className={styles.warningBox}>
            <strong><span aria-hidden="true">⚠️</span> Nota sobre precios de la energía</strong>
            Los precios del gas natural y la electricidad fluctúan considerablemente según el
            mercado, la tarifa contratada y los impuestos vigentes. Los rangos indicados en esta
            herramienta son orientativos (año 2025). Un estudio de eficiencia energética
            profesional en tu vivienda concreta —realizado por técnico certificado— te dará datos
            más precisos que cualquier orientación genérica.
          </div>

          {/* Tabla comparativa */}
          <section className={styles.educativoSection}>
            <h2>Comparativa de coste anual estimado por sistema</h2>
            <p>
              Los siguientes rangos corresponden a una vivienda media española (90-120 m²) con
              una demanda energética de 7.000-12.000 kWh/año para calefacción y ACS, en condiciones
              normales de uso (año 2025).
            </p>
            <div className={styles.tablaContainer}>
              <table className={styles.tablaComparativa}>
                <thead>
                  <tr>
                    <th>Sistema</th>
                    <th>Inversión inicial</th>
                    <th>Coste anual estimado</th>
                    <th>Amortización aprox.</th>
                    <th>Vida útil</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span aria-hidden="true">🔥</span> Gas natural (condensación)</td>
                    <td>2.000 – 5.000 €</td>
                    <td>800 – 1.400 €</td>
                    <td>Referencia</td>
                    <td>15-20 años</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">⚡</span> Bomba calor aire-aire</td>
                    <td>2.000 – 6.000 €</td>
                    <td>600 – 1.200 €</td>
                    <td>3-7 años vs. gas</td>
                    <td>15-20 años</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">🌬️</span> Aerotermia aire-agua</td>
                    <td>8.000 – 18.000 €</td>
                    <td>500 – 1.000 €</td>
                    <td>8-15 años (sin sub.)</td>
                    <td>20-25 años</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">🪵</span> Biomasa / pellets</td>
                    <td>8.000 – 16.000 €</td>
                    <td>400 – 900 €</td>
                    <td>6-12 años vs. gas</td>
                    <td>20-25 años</td>
                  </tr>
                  <tr>
                    <td><span aria-hidden="true">☀️</span> Solar térmica + apoyo</td>
                    <td>4.000 – 10.000 €</td>
                    <td>200 – 600 €</td>
                    <td>7-12 años</td>
                    <td>25-30 años</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>Nota:</strong> Los costes de instalación incluyen mano de obra estándar.
              Las subvenciones pueden reducir la inversión inicial en un 30-40 %, mejorando
              sensiblemente los plazos de amortización.
            </p>
          </section>

          {/* COP y eficiencia */}
          <section className={styles.educativoSection}>
            <h2>¿Qué es el COP y por qué importa?</h2>
            <p>
              El <strong>Coeficiente de Rendimiento (COP)</strong> es la relación entre la energía
              calorífica entregada y la energía eléctrica consumida para lograrlo. Un COP de 3
              significa que por cada kWh eléctrico invertido se obtienen 3 kWh de calor.
            </p>
            <h3>COP de los principales sistemas</h3>
            <ul className={styles.listaEducativa}>
              <li>
                <strong>Caldera de gas (condensación):</strong> COP efectivo ~1,09 — devuelve el
                109 % de la energía del gas, pero ese gas ya tuvo un coste de extracción y transporte.
              </li>
              <li>
                <strong>Resistencia eléctrica:</strong> COP 1,0 — convierte kWh en calor sin ganancia.
                Es la peor opción en eficiencia.
              </li>
              <li>
                <strong>Bomba de calor aire-aire:</strong> COP 2,5-4,0 — extrae calor del exterior,
                incluso a temperaturas bajo cero.
              </li>
              <li>
                <strong>Aerotermia aire-agua:</strong> SCOP estacional 3,0-4,5 — la más eficiente
                para calefacción centralizada con agua, especialmente con suelo radiante.
              </li>
            </ul>
            <p>
              El <strong>SCOP (Seasonal COP)</strong> es el indicador más representativo: mide la
              eficiencia media a lo largo de toda la temporada de calefacción, considerando
              variaciones de temperatura exterior.
            </p>
          </section>

          {/* Ayudas disponibles */}
          <section className={styles.educativoSection}>
            <h2>Ayudas y subvenciones en España (2025)</h2>
            <h3>PREE 5000 (Programa de Rehabilitación Energética)</h3>
            <p>
              Subvenciona la sustitución de sistemas de calefacción y ACS por tecnologías más
              eficientes: bombas de calor, aerotermia y sistemas de biomasa. Los importes varían
              según el tipo de instalación y la comunidad autónoma. Gestionado a través de los
              organismos autonómicos de energía.
            </p>
            <h3>PERRE (Plan de Recuperación de Rehabilitación Energética)</h3>
            <p>
              Financiado con fondos europeos (PRTR). Cubre hasta el 40 % del coste de instalaciones
              de calefacción renovable (aerotermia, solar térmica, biomasa). Requiere mejora
              acreditada en la calificación energética del edificio.
            </p>
            <h3>Deducción IRPF por rehabilitación energética (2025)</h3>
            <ul className={styles.listaEducativa}>
              <li>
                <strong>Mejora de calefacción o ACS (tramo 1):</strong> Deducción del 20 % sobre
                obras que reduzcan la demanda de calefacción y refrigeración en al menos un 7 %.
                Base máxima: 5.000 €/año.
              </li>
              <li>
                <strong>Mejora integral con certificado energético (tramo 2):</strong> Deducción
                del 40 % si se reduce la demanda en un 30 % o se mejoran 2 letras en energía
                primaria. Base máxima: 7.500 €/año.
              </li>
              <li>
                <strong>Rehabilitación de edificio completo (tramo 3):</strong> Deducción del
                60 % si aplica a toda la comunidad. Base máxima: 5.000 €/año por propietario.
              </li>
            </ul>
            <p>
              Consulta siempre las convocatorias activas en el portal del{' '}
              <strong>IDAE (Instituto para la Diversificación y Ahorro de la Energía)</strong> y
              en la web de energía de tu comunidad autónoma, ya que los plazos y dotaciones
              varían cada año.
            </p>
            <h3>Calificación energética y valor de la vivienda</h3>
            <p>
              La letra energética de tu vivienda (de A a G) afecta directamente a su valor de
              mercado. Estudios del sector inmobiliario español indican que una vivienda con
              calificación A o B puede valer entre un 10 % y un 25 % más que una equivalente con
              calificación E o F. Además, desde 2023 los anuncios de venta y alquiler están
              obligados a incluir la etiqueta energética en toda España.
            </p>
          </section>

        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-energia-hogar')} />
      <ShareCard appName="selector-energia-hogar" />
      <Footer appName="selector-energia-hogar" />
    </div>
  );
}
