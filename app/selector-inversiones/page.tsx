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
import styles from './SelectorInversiones.module.css';

// ── Tipos ────────────────────────────────────────────────────

type RecomendacionKey = 'indexados' | 'acciones' | 'renta_fija' | 'inmobiliario' | 'pensiones';

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
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  riesgos: string[];
  perfil: string;
}

// ── Datos del test ────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuándo podrías necesitar el dinero que inviertes?',
    opciones: [
      { texto: 'En menos de 2 años', pesos: { renta_fija: 4, pensiones: 1 } },
      { texto: 'Entre 2 y 5 años', pesos: { renta_fija: 3, indexados: 2 } },
      { texto: 'Entre 5 y 15 años', pesos: { indexados: 4, acciones: 2 } },
      { texto: 'En más de 15 años', pesos: { indexados: 4, acciones: 3, pensiones: 3 } },
    ],
  },
  {
    id: 2,
    texto: 'Si tu inversión cae un 40 % en una crisis, ¿qué harías?',
    opciones: [
      { texto: 'Vendo todo, no puedo soportarlo', pesos: { renta_fija: 4 } },
      { texto: 'Me preocupo mucho pero aguanto', pesos: { renta_fija: 2, indexados: 1 } },
      { texto: 'Lo acepto, a largo plazo se recupera', pesos: { indexados: 3, acciones: 2 } },
      { texto: 'Lo veo como oportunidad y compro más', pesos: { acciones: 4 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuánto conocimiento financiero tienes?',
    opciones: [
      { texto: 'Muy básico, nunca he invertido', pesos: { indexados: 3, pensiones: 3 } },
      { texto: 'Conozco conceptos básicos', pesos: { indexados: 2, renta_fija: 2 } },
      { texto: 'Sigo los mercados habitualmente', pesos: { acciones: 3, indexados: 2 } },
      { texto: 'Avanzado, analizo empresas y sectores', pesos: { acciones: 4 } },
    ],
  },
  {
    id: 4,
    texto: '¿Cuánto capital tienes disponible para invertir?',
    opciones: [
      { texto: 'Menos de 5.000 €', pesos: { indexados: 3, pensiones: 2 } },
      { texto: 'Entre 5.000 € y 20.000 €', pesos: { indexados: 3, renta_fija: 2 } },
      { texto: 'Entre 20.000 € y 100.000 €', pesos: { indexados: 3, acciones: 2, inmobiliario: 1 } },
      { texto: 'Más de 100.000 €', pesos: { inmobiliario: 3, acciones: 2, indexados: 2 } },
    ],
  },
  {
    id: 5,
    texto: '¿Qué importancia le das a la liquidez (poder vender rápido)?',
    opciones: [
      { texto: 'Muy alta, necesito poder acceder en días', pesos: { renta_fija: 3, indexados: 2 } },
      { texto: 'Alta, en semanas', pesos: { indexados: 3, acciones: 2 } },
      { texto: 'Media, puedo esperar meses', pesos: { acciones: 2, inmobiliario: 1 } },
      { texto: 'Baja, tengo colchón y no necesito liquidez', pesos: { inmobiliario: 3, pensiones: 3 } },
    ],
  },
  {
    id: 6,
    texto: '¿Tienes ventaja fiscal que aprovechar (IRPF alto, autonomía, empresa)?',
    opciones: [
      { texto: 'Sí, tramo IRPF alto, quiero deducir', pesos: { pensiones: 4 } },
      { texto: 'Soy autónomo con ingresos variables', pesos: { pensiones: 3, renta_fija: 2 } },
      { texto: 'No, situación fiscal normal', pesos: { indexados: 2, acciones: 2 } },
      { texto: 'Tengo empresa o sociedad', pesos: { acciones: 2, inmobiliario: 2 } },
    ],
  },
  {
    id: 7,
    texto: '¿Te interesa gestionar activamente tus inversiones?',
    opciones: [
      { texto: 'No, prefiero automatizar y olvidarme', pesos: { indexados: 4, pensiones: 3 } },
      { texto: 'Algo, revisar una vez al año', pesos: { indexados: 2, acciones: 1 } },
      { texto: 'Sí, seguir el mercado habitualmente', pesos: { acciones: 3 } },
      { texto: 'Sí, de forma intensiva', pesos: { acciones: 4 } },
    ],
  },
  {
    id: 8,
    texto: '¿Tienes o quieres tener una propiedad inmobiliaria como inversión?',
    opciones: [
      { texto: 'Es mi principal objetivo', pesos: { inmobiliario: 5 } },
      { texto: 'Me interesa si tengo capital suficiente', pesos: { inmobiliario: 3 } },
      { texto: 'Prefiero activos financieros más líquidos', pesos: { indexados: 3, acciones: 2 } },
      { texto: 'No, demasiada gestión e iliquidez', pesos: { indexados: 3, renta_fija: 2 } },
    ],
  },
  {
    id: 9,
    texto: '¿Cuánto te preocupa la inflación a largo plazo?',
    opciones: [
      { texto: 'Mucho, quiero activos que la superen', pesos: { acciones: 3, indexados: 3, inmobiliario: 2 } },
      { texto: 'Bastante, quiero al menos preservar el poder adquisitivo', pesos: { indexados: 3, inmobiliario: 2 } },
      { texto: 'Moderado, prefiero seguridad aunque no bata la inflación', pesos: { renta_fija: 3 } },
      { texto: 'Poco, priorizo la certeza sobre la rentabilidad', pesos: { renta_fija: 4, pensiones: 2 } },
    ],
  },
  {
    id: 10,
    texto: '¿Tienes ya cubierto un fondo de emergencia (3–6 meses de gastos)?',
    opciones: [
      { texto: 'No, este sería todo mi ahorro', pesos: { renta_fija: 3, pensiones: 2 } },
      { texto: 'Tengo algo pero no completo', pesos: { renta_fija: 2, indexados: 1 } },
      { texto: 'Sí, tengo el fondo separado', pesos: { indexados: 3, acciones: 2 } },
      { texto: 'Sí, y además tengo otros activos', pesos: { acciones: 3, inmobiliario: 2 } },
    ],
  },
];

// ── Recomendaciones ───────────────────────────────────────────

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  indexados: {
    key: 'indexados',
    titulo: 'Fondos Indexados (Pasivos)',
    subtitulo: 'Diversificación global automática y bajo coste',
    descripcion:
      'Los fondos indexados replican un índice de mercado (como el MSCI World o el S&P 500) sin gestión activa. Son el vehículo más recomendado por académicos y asesores independientes para la mayoría de perfiles de inversores particulares, gracias a sus comisiones reducidas y su capacidad de diversificación global.',
    ventajas: [
      'Comisiones muy bajas (0,1 %–0,3 % anual)',
      'Diversificación global automática',
      'Sin necesidad de analizar empresas',
      'Alta liquidez (se vende en días)',
      'Traspasables sin tributar (fondos)',
    ],
    riesgos: [
      'Volatilidad a corto plazo',
      'Rentabilidad ligada al mercado global',
      'No protegen en caídas bruscas',
    ],
    perfil:
      'Perfil ideal: inversor con horizonte superior a 5 años, tolerancia media al riesgo y preferencia por la automatización.',
  },
  acciones: {
    key: 'acciones',
    titulo: 'Acciones Directas',
    subtitulo: 'Mayor potencial, mayor riesgo y control',
    descripcion:
      'Invertir directamente en acciones de empresas permite obtener mayor rentabilidad potencial, pero exige conocimiento del análisis fundamental o técnico, tiempo para seguir el mercado y alta tolerancia a la volatilidad. Es el vehículo más exigente y el que más errores puede generar en manos de inversores sin experiencia.',
    ventajas: [
      'Potencial de rentabilidad superior al mercado',
      'Control total sobre qué empresas poseer',
      'Dividendos como ingreso recurrente',
      'Transparencia total sobre el activo',
    ],
    riesgos: [
      'Alta concentración si se tienen pocas empresas',
      'Requiere tiempo y conocimiento continuo',
      'Mayor riesgo de pérdidas permanentes',
      'Impacto emocional en mercados bajistas',
    ],
    perfil:
      'Perfil ideal: inversor con conocimiento avanzado, horizonte largo, alta tolerancia al riesgo y disponibilidad para seguir el mercado.',
  },
  renta_fija: {
    key: 'renta_fija',
    titulo: 'Renta Fija (Bonos, Letras)',
    subtitulo: 'Preservación de capital y menor volatilidad',
    descripcion:
      'La renta fija incluye letras del Tesoro, bonos del Estado, bonos corporativos y fondos de renta fija. Ofrece rentabilidades más predecibles y menor volatilidad que la renta variable, pero históricamente no supera a la inflación a largo plazo. Es la opción más adecuada para horizontes cortos o perfiles muy conservadores.',
    ventajas: [
      'Menor volatilidad que la renta variable',
      'Cupones periódicos predecibles',
      'Capital más protegido a corto plazo',
      'Alta liquidez (Letras del Tesoro)',
    ],
    riesgos: [
      'Históricamente no supera a la inflación',
      'Riesgo de tipo de interés (precio cae si suben tipos)',
      'Riesgo de crédito en bonos corporativos',
    ],
    perfil:
      'Perfil ideal: inversor conservador, horizonte corto o medio, que prioriza la seguridad sobre la rentabilidad.',
  },
  inmobiliario: {
    key: 'inmobiliario',
    titulo: 'Inversión Inmobiliaria',
    subtitulo: 'Activo tangible con ingresos por alquiler',
    descripcion:
      'La inversión en inmuebles para alquiler o revalorización ofrece protección frente a la inflación y una fuente de ingresos recurrente. Sin embargo, implica una gestión activa (inquilinos, reparaciones, impuestos), alta iliquidez y necesita un capital inicial elevado. También es posible acceder de forma indirecta a través de SOCIMIs o REITs.',
    ventajas: [
      'Activo tangible con valor intrínseco',
      'Ingresos pasivos por alquiler',
      'Protección histórica frente a la inflación',
      'Apalancamiento con hipoteca',
    ],
    riesgos: [
      'Alta iliquidez (meses para vender)',
      'Gestión activa requerida',
      'Concentración geográfica y de activo',
      'Gastos: IBI, comunidad, mantenimiento',
    ],
    perfil:
      'Perfil ideal: inversor con capital superior a 50.000–100.000 €, horizonte largo, baja necesidad de liquidez y disposición a gestionar el activo.',
  },
  pensiones: {
    key: 'pensiones',
    titulo: 'Plan de Pensiones / PPI',
    subtitulo: 'Ventaja fiscal inmediata, iliquidez hasta la jubilación',
    descripcion:
      'Los planes de pensiones individuales (PPI) ofrecen deducción en el IRPF por las aportaciones (hasta 1.500 € anuales desde 2022), lo que los hace especialmente atractivos para quienes tributan en tramos altos. Sin embargo, el capital está bloqueado hasta la jubilación (salvo supuestos excepcionales: paro larga duración, enfermedad grave, desahucio). No son excluyentes con otros vehículos.',
    ventajas: [
      'Reducción de la base imponible en IRPF',
      'Fiscalmente eficiente para tramos altos',
      'Gestión delegada y diversificada',
      'Compatible con otros vehículos de inversión',
    ],
    riesgos: [
      'Iliquidez hasta la jubilación',
      'Tributación en rescate como renta del trabajo',
      'Límite de aportación deducible (1.500 €/año)',
      'Gestión interna variable según entidad',
    ],
    perfil:
      'Perfil ideal: asalariado o autónomo con IRPF medio-alto, horizonte hasta la jubilación, que busca reducir la factura fiscal anual.',
  },
};

const ETIQUETAS: Record<RecomendacionKey, string> = {
  indexados: 'Fondos Indexados',
  acciones: 'Acciones Directas',
  renta_fija: 'Renta Fija',
  inmobiliario: 'Inmobiliario',
  pensiones: 'Planes de Pensiones',
};

// ── Lógica de puntuación ──────────────────────────────────────

function calcularRecomendacion(
  respuestas: Record<number, number>
): RecomendacionKey {
  const puntos: Record<RecomendacionKey, number> = {
    indexados: 0,
    acciones: 0,
    renta_fija: 0,
    inmobiliario: 0,
    pensiones: 0,
  };

  PREGUNTAS.forEach((pregunta) => {
    const indiceOpcion = respuestas[pregunta.id];
    if (indiceOpcion === undefined) return;
    const opcion = pregunta.opciones[indiceOpcion];
    (Object.keys(opcion.pesos) as RecomendacionKey[]).forEach((key) => {
      const peso = opcion.pesos[key];
      if (peso !== undefined) {
        puntos[key] += peso;
      }
    });
  });

  return (Object.keys(puntos) as RecomendacionKey[]).reduce(
    (mejor, actual) => (puntos[actual] > puntos[mejor] ? actual : mejor),
    'indexados' as RecomendacionKey
  );
}

// ── Componente principal ──────────────────────────────────────

export default function SelectorInversionesPage() {
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const pregunta = PREGUNTAS[preguntaActual];
  const totalPreguntas = PREGUNTAS.length;
  const respuestaActual = respuestas[pregunta.id];
  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const porcentajeProgreso = Math.round(
    (Object.keys(respuestas).length / totalPreguntas) * 100
  );

  const seleccionarOpcion = (indice: number) => {
    setRespuestas((prev) => ({ ...prev, [pregunta.id]: indice }));
  };

  const irAnterior = () => {
    if (preguntaActual > 0) setPreguntaActual((p) => p - 1);
  };

  const irSiguiente = () => {
    if (preguntaActual < totalPreguntas - 1) setPreguntaActual((p) => p + 1);
  };

  const verResultado = () => {
    setMostrarResultado(true);
  };

  const reiniciar = () => {
    setRespuestas({});
    setPreguntaActual(0);
    setMostrarResultado(false);
  };

  const recomendacionKey = mostrarResultado
    ? calcularRecomendacion(respuestas)
    : null;
  const recomendacion = recomendacionKey ? RECOMENDACIONES[recomendacionKey] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué tipo de inversión se adapta a ti?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir si tu perfil encaja mejor con fondos indexados,
          acciones directas, renta fija, inversión inmobiliaria o planes de pensiones.
        </p>
      </header>

      <LegalNotice />

      {/* ── Test ────────────────────────────────────────────── */}
      {!mostrarResultado && (
        <section className={styles.testSection} aria-label="Test de selector de inversiones">
          {/* Barra de progreso */}
          <div className={styles.progreso}>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-valuenow={porcentajeProgreso}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso del test"
            >
              <div
                className={styles.progresoFill}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
            <p className={styles.progresoTexto}>
              Pregunta {preguntaActual + 1} de {totalPreguntas}
            </p>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>Pregunta {pregunta.id}</p>
            <p className={styles.preguntaTexto}>{pregunta.texto}</p>

            <div className={styles.opciones} role="group" aria-label={`Opciones para: ${pregunta.texto}`}>
              {pregunta.opciones.map((opcion, indice) => (
                <button
                  key={indice}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestaActual === indice ? styles.selected : ''}`}
                  aria-pressed={respuestaActual === indice ? true : false}
                  onClick={() => seleccionarOpcion(indice)}
                >
                  {opcion.texto}
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
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>

            {!esUltimaPregunta ? (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={respuestaActual === undefined}
                aria-label="Siguiente pregunta"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={verResultado}
                disabled={respuestaActual === undefined}
                aria-label="Ver resultado del test"
              >
                Ver resultado
              </button>
            )}
          </nav>
        </section>
      )}

      {/* ── Resultado ───────────────────────────────────────── */}
      {mostrarResultado && recomendacion && (
        <section
          className={styles.resultadoSection}
          aria-label="Resultado del test de inversión"
          aria-live="polite"
        >
          <div
            className={`${styles.resultadoCard} ${styles[`recomendacion_${recomendacion.key}`]}`}
          >
            <span
              className={`${styles.resultadoBadge} ${styles[`badge_${recomendacion.key}`]}`}
              aria-hidden="true"
            >
              Tu recomendación
            </span>

            <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
            <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
            <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

            <div className={styles.caracteristicasGrid}>
              <div className={styles.caracteristicaCard}>
                <h4>Ventajas</h4>
                <ul>
                  {recomendacion.ventajas.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.caracteristicaCard}>
                <h4>Riesgos a considerar</h4>
                <ul>
                  {recomendacion.riesgos.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className={styles.perfilTexto}>{recomendacion.perfil}</p>

            <div className={styles.alertasSection} role="note">
              <p>
                <strong>Recuerda:</strong> esta orientación es un punto de partida.
                Los vehículos de inversión no son excluyentes: una cartera bien construida
                puede combinar varios de ellos según tus objetivos y horizonte temporal.
                Consulta con un asesor financiero independiente antes de tomar decisiones.
              </p>
            </div>
          </div>

          {/* Resumen de puntos (todos los tipos) */}
          <div className={styles.resultadoCard}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Afinidad con cada tipo de inversión
            </h3>
            {(Object.keys(RECOMENDACIONES) as RecomendacionKey[]).map((key) => {
              const puntos: Record<RecomendacionKey, number> = {
                indexados: 0,
                acciones: 0,
                renta_fija: 0,
                inmobiliario: 0,
                pensiones: 0,
              };
              PREGUNTAS.forEach((p) => {
                const idx = respuestas[p.id];
                if (idx === undefined) return;
                const op = p.opciones[idx];
                (Object.keys(op.pesos) as RecomendacionKey[]).forEach((k) => {
                  const peso = op.pesos[k];
                  if (peso !== undefined) puntos[k] += peso;
                });
              });
              const maxPuntos = Math.max(...Object.values(puntos));
              const pct = maxPuntos > 0 ? Math.round((puntos[key] / maxPuntos) * 100) : 0;
              return (
                <div key={key} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem', marginBottom: '0.25rem' }}>
                    <span>{ETIQUETAS[key]}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{puntos[key]} pts</span>
                  </div>
                  <div style={{ background: '#e0e0e0', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: '999px',
                        background: key === recomendacionKey ? 'var(--primary)' : 'var(--secondary)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className={styles.btnReiniciar}
            onClick={reiniciar}
            aria-label="Reiniciar el test"
          >
            Repetir test
          </button>
        </section>
      )}

      {/* ── Disclaimer (siempre visible) ────────────────────── */}
      <DisclaimerCard variant="financial" severity="high" />

      {/* ── Sección educativa ───────────────────────────────── */}
      <EducationalSection
        title="Tipos de inversión: guía para elegir"
        subtitle="Comparativa de los principales vehículos de inversión en España"
      >
        <h3>Rentabilidades históricas orientativas</h3>
        <p>
          Los datos históricos sirven como referencia, no como garantía. A modo orientativo:
        </p>
        <ul>
          <li><strong>Fondos indexados (renta variable global):</strong> ~7–10 % anual en horizontes de 10+ años (antes de inflación).</li>
          <li><strong>Acciones directas:</strong> variable según selección; puede superar o quedar muy por debajo de los índices.</li>
          <li><strong>Renta fija (Letras del Tesoro, bonos):</strong> ~2–4 % en el entorno actual (2024–2025), sensible a los tipos del BCE.</li>
          <li><strong>Inmobiliario (alquiler + revalorización):</strong> ~4–7 % anual bruto en grandes ciudades españolas, antes de gastos.</li>
          <li><strong>Planes de pensiones:</strong> rentabilidad variable según categoría; la ventaja es fiscal, no necesariamente financiera.</li>
        </ul>

        <div className={styles.warningBox} role="note">
          <strong>Aviso importante:</strong> Las rentabilidades pasadas no garantizan rentabilidades futuras.
          Invertir conlleva riesgo de pérdida del capital, incluso total en algunos instrumentos.
          Esta herramienta es orientativa y no constituye asesoramiento financiero, fiscal ni legal.
        </div>

        <h3>Diversificación: la única ventaja gratuita</h3>
        <p>
          La diversificación consiste en distribuir el capital entre activos, geografías y sectores que no se muevan
          en la misma dirección al mismo tiempo. Un fondo indexado global ya incorpora miles de empresas de decenas de países,
          ofreciendo diversificación automática. Concentrar el patrimonio en pocas acciones o en un único inmueble
          aumenta el riesgo sin necesariamente aumentar la rentabilidad esperada.
        </p>

        <h3>El horizonte temporal es el factor más importante</h3>
        <p>
          Ningún factor influye más en la decisión de inversión que el tiempo disponible. Con menos de 2 años,
          la renta variable puede sufrir caídas de las que no se recupera a tiempo; la renta fija o el ahorro
          es la opción más prudente. Con más de 10 años, la historia muestra que la renta variable diversificada
          ha compensado prácticamente todas las caídas históricas y ha superado a la inflación con claridad.
        </p>

        <h3>Inversión frente a especulación</h3>
        <p>
          Invertir implica asignar capital a activos con valor intrínseco esperando una rentabilidad a lo largo del tiempo.
          Especular implica apostar a movimientos de precio a corto plazo, asumiendo un riesgo muy superior.
          Criptomonedas individuales, opciones financieras complejas, CFDs o acciones «de moda» sin análisis
          son ejemplos de especulación, no de inversión. Este test cubre únicamente vehículos de inversión
          con base histórica documentada en el contexto español y europeo.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-inversiones')} />
      <ShareCard appName="selector-inversiones" />
      <Footer appName="selector-inversiones" />
    </div>
  );
}
