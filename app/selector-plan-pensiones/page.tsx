'use client';

import React, { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import RegionBadge from '@/components/RegionBadge';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SelectorPlanPensiones.module.css';

// ============================================================
// Tipos TypeScript
// ============================================================

type RecomendacionKey = 'individual' | 'empleo' | 'epsv' | 'diversificar' | 'ninguno';

interface Opcion {
  texto: string;
  pesos: Partial<Record<RecomendacionKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface Recomendacion {
  key: RecomendacionKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  inconvenientes: string[];
  alertas: string[];
}

// ============================================================
// Preguntas del test
// ============================================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuántos años te faltan para jubilarte?',
    opciones: [
      {
        texto: 'Más de 30 años',
        pesos: { individual: 3, empleo: 2, epsv: 2, diversificar: 2 },
      },
      {
        texto: 'Entre 15 y 30 años',
        pesos: { individual: 2, empleo: 2, epsv: 2, diversificar: 3 },
      },
      {
        texto: 'Entre 5 y 15 años',
        pesos: { diversificar: 2, ninguno: 1 },
      },
      {
        texto: 'Menos de 5 años',
        pesos: { ninguno: 3 },
      },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es tu tramo de IRPF aproximado?',
    opciones: [
      {
        texto: 'Hasta el 24%',
        pesos: { ninguno: 2, diversificar: 2 },
      },
      {
        texto: 'Entre el 30% y el 37%',
        pesos: { individual: 2, empleo: 2, epsv: 2, diversificar: 1 },
      },
      {
        texto: 'Entre el 45% y el 47%',
        pesos: { individual: 4, empleo: 4, epsv: 4 },
      },
      {
        texto: 'No lo sé o varía mucho',
        pesos: { diversificar: 2, individual: 1 },
      },
    ],
  },
  {
    id: 3,
    texto: '¿Tu empresa ofrece plan de pensiones de empleo con aportación patronal?',
    opciones: [
      {
        texto: 'Sí',
        pesos: { empleo: 5 },
      },
      {
        texto: 'No',
        pesos: { individual: 2, diversificar: 2 },
      },
      {
        texto: 'Soy autónomo o freelance',
        pesos: { individual: 2, epsv: 1, diversificar: 2 },
      },
      {
        texto: 'No lo sé',
        pesos: { empleo: 2, individual: 1 },
      },
    ],
  },
  {
    id: 4,
    texto: '¿Resides en el País Vasco o Navarra?',
    opciones: [
      {
        texto: 'Sí, País Vasco',
        pesos: { epsv: 5 },
      },
      {
        texto: 'Sí, Navarra',
        pesos: { epsv: 4 },
      },
      {
        texto: 'No',
        pesos: { individual: 2, diversificar: 1 },
      },
    ],
  },
  {
    id: 5,
    texto: '¿Qué importancia le das a poder recuperar el dinero antes de jubilarte?',
    opciones: [
      {
        texto: 'Muy alta, necesito liquidez',
        pesos: { ninguno: 3, diversificar: 2 },
      },
      {
        texto: 'Media, solo en caso de urgencia',
        pesos: { diversificar: 2, individual: 1, epsv: 1 },
      },
      {
        texto: 'Baja, es ahorro a largo plazo',
        pesos: { individual: 3, empleo: 2, epsv: 2 },
      },
      {
        texto: 'No me preocupa',
        pesos: { individual: 3, empleo: 3, epsv: 3 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Cuánto puedes ahorrar mensualmente para la jubilación?',
    opciones: [
      {
        texto: 'Menos de 100 €',
        pesos: { ninguno: 2, diversificar: 1 },
      },
      {
        texto: 'Entre 100 € y 300 €',
        pesos: { individual: 2, diversificar: 2 },
      },
      {
        texto: 'Entre 300 € y 600 €',
        pesos: { individual: 2, empleo: 2, epsv: 2, diversificar: 2 },
      },
      {
        texto: 'Más de 600 €',
        pesos: { individual: 3, empleo: 3, epsv: 3, diversificar: 3 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Cómo valoras la complejidad de gestionar tu ahorro?',
    opciones: [
      {
        texto: 'Prefiero algo simple y automático',
        pesos: { individual: 2, empleo: 3 },
      },
      {
        texto: 'Puedo gestionar con ayuda puntual',
        pesos: { individual: 2, diversificar: 2, epsv: 2 },
      },
      {
        texto: 'Me gusta controlar mis inversiones',
        pesos: { diversificar: 4, ninguno: 1 },
      },
    ],
  },
  {
    id: 8,
    texto: '¿Cuál es tu principal objetivo con el ahorro para la jubilación?',
    opciones: [
      {
        texto: 'Reducir mi factura fiscal ahora',
        pesos: { individual: 3, empleo: 3, epsv: 3 },
      },
      {
        texto: 'Maximizar el capital a largo plazo',
        pesos: { diversificar: 3, individual: 1 },
      },
      {
        texto: 'Ambos por igual',
        pesos: { individual: 2, empleo: 2, epsv: 2, diversificar: 2 },
      },
      {
        texto: 'Simplemente no depender de la pensión pública',
        pesos: { individual: 1, empleo: 1, diversificar: 3 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Tienes ya otros productos de ahorro o inversión?',
    opciones: [
      {
        texto: 'No, este sería el primero',
        pesos: { individual: 3, empleo: 3 },
      },
      {
        texto: 'Tengo algo pero quiero complementar',
        pesos: { individual: 2, empleo: 2, epsv: 2, diversificar: 2 },
      },
      {
        texto: 'Sí, tengo cartera diversificada',
        pesos: { diversificar: 3, ninguno: 1 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿Cómo percibes la pensión pública que recibirás?',
    opciones: [
      {
        texto: 'Será suficiente',
        pesos: { ninguno: 2, diversificar: 1 },
      },
      {
        texto: 'Será escasa, necesito complementarla',
        pesos: { individual: 3, empleo: 3, epsv: 3, diversificar: 2 },
      },
      {
        texto: 'No confío en la pensión pública',
        pesos: { individual: 2, diversificar: 3 },
      },
      {
        texto: 'No lo sé',
        pesos: { diversificar: 2, individual: 1 },
      },
    ],
  },
];

// ============================================================
// Definición de recomendaciones
// ============================================================

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  individual: {
    key: 'individual',
    titulo: 'Plan de Pensiones Individual',
    subtitulo: 'La opción más extendida para complementar la pensión pública',
    descripcion:
      'Tu perfil —con un tramo de IRPF medio-alto, horizonte temporal suficiente y sin acceso a plan de empleo— hace que el plan de pensiones individual sea tu mejor aliado fiscal. Reduces base imponible hasta 1.500 € anuales y aplazas la tributación hasta el rescate.',
    ventajas: [
      'Reducción en base imponible IRPF hasta 1.500 €/año',
      'Aplazamiento fiscal del capital acumulado',
      'Amplia oferta de fondos y gestores',
      'Traspasable sin coste fiscal entre entidades',
    ],
    inconvenientes: [
      'Iliquidez: rescate solo en supuestos tasados (jubilación, invalidez, desempleo prolongado, ERTE...)',
      'Al rescatar, tributa como rendimiento del trabajo (hasta el 47%)',
      'Aportaciones máximas limitadas a 1.500 €/año',
      'Rentabilidades históricas inferiores a índices globales',
    ],
    alertas: [
      'Al rescatar en forma de capital, el impacto fiscal puede ser muy alto. Estúdialo con un asesor antes de cobrarlo todo de golpe.',
      'La deducción real depende de tu tramo marginal: a mayor tramo, mayor ahorro fiscal.',
    ],
  },
  empleo: {
    key: 'empleo',
    titulo: 'Plan de Pensiones de Empleo',
    subtitulo: 'Prioritario si tu empresa hace aportaciones patronales',
    descripcion:
      'Si tu empresa aporta al plan de empleo, es rentabilidad inmediata garantizada: es como un aumento de sueldo diferido. El límite combinado (empresa + trabajador) es de 10.000 €/año (hasta 8.500 € patronal + 1.500 € individual). No desaproveches esta ventaja.',
    ventajas: [
      'La aportación patronal es retribución adicional sin coste fiscal inmediato',
      'Límite de aportación mucho más alto (hasta 10.000 €/año)',
      'Misma deducción fiscal que el individual para aportaciones propias',
      'Suele incluir gestión profesional sin comisiones de gestión directas',
    ],
    inconvenientes: [
      'Iliquidez idéntica al plan individual',
      'Dependes del plan ofertado por tu empresa',
      'Si cambias de empresa, puede ser complicado traspasar',
      'Al rescatar tributa como rendimiento del trabajo',
    ],
    alertas: [
      'Si tu empresa ofrece plan de empleo con aportación patronal, es casi siempre la primera opción a maximizar.',
      'Complementa con plan individual o fondos indexados si te sobra capacidad de ahorro.',
    ],
  },
  epsv: {
    key: 'epsv',
    titulo: 'EPSV (Euskadi) o Plan Foral (Navarra)',
    subtitulo: 'Ventajas fiscales muy superiores al plan estatal',
    descripcion:
      'Resides en el País Vasco o Navarra, donde las Entidades de Previsión Social Voluntaria (EPSV) ofrecen deducciones fiscales sensiblemente superiores a las del plan individual estatal. Además, el rescate parcial a los 10 años tributa con bonificaciones especiales. Es tu opción prioritaria.',
    ventajas: [
      'Deducción hasta 5.000 € en Vizcaya, Guipúzcoa y Álava (EPSV individuales)',
      'Posibilidad de rescate a los 10 años (sin necesidad de jubilación)',
      'Bonificación del 40% en la tributación del capital acumulado al rescatar',
      'Marco fiscal foral más favorable que el régimen estatal',
    ],
    inconvenientes: [
      'Exclusivo para residentes fiscales en el País Vasco o Navarra',
      'Oferta de entidades algo más reducida que el mercado estatal',
      'Tributación al rescatar en rendimiento del trabajo (con bonificación)',
    ],
    alertas: [
      'Verifica con la Hacienda Foral los límites exactos y bonificaciones actualizadas, ya que cambian anualmente.',
      'Si trabajas en una empresa con EPSV de empleo, prioriza ese primero.',
    ],
  },
  diversificar: {
    key: 'diversificar',
    titulo: 'Combinar Vehículos de Ahorro',
    subtitulo: 'Fondos indexados para flexibilidad + plan pensiones para deducción',
    descripcion:
      'Tu perfil —ya sea porque valoras la liquidez, tienes cartera propia o quieres maximizar a largo plazo— se beneficia de combinar un plan de pensiones (por la deducción fiscal) con fondos indexados o ETFs (por flexibilidad, rentabilidad histórica superior y liquidez inmediata). No son excluyentes.',
    ventajas: [
      'Liquidez en los fondos indexados y ETFs',
      'Rentabilidades históricas de índices globales (7-10% anual nominal)',
      'Deducción fiscal aprovechada con aportaciones mínimas al plan',
      'Mayor control y personalización de la cartera',
    ],
    inconvenientes: [
      'Requiere mayor implicación y conocimiento financiero',
      'Los fondos y ETFs no ofrecen deducción en IRPF',
      'Necesitas planificar bien la parte de liquidez vs la ilíquida',
    ],
    alertas: [
      'No dejes de maximizar el plan de empleo si tu empresa aporta: es la primera prioridad.',
      'Para fondos indexados, investiga plataformas con bajas comisiones (ej: MyInvestor, Indexa Capital).',
    ],
  },
  ninguno: {
    key: 'ninguno',
    titulo: 'No contratar plan de pensiones ahora',
    subtitulo: 'En tu situación, las desventajas pueden superar a los beneficios',
    descripcion:
      'Tu horizonte temporal es muy corto, tu tramo de IRPF es bajo o necesitas liquidez. En estos casos, la ventaja fiscal del plan de pensiones puede no compensar la iliquidez y la tributación en el rescate. Considera alternativas antes de contratar.',
    ventajas: [
      'Liquidez total: el dinero está siempre disponible',
      'Sin penalizaciones por necesitar el dinero',
      'Puedes invertir en activos con mejor rentabilidad histórica',
      'Horizonte corto: menores riesgos de mercado',
    ],
    inconvenientes: [
      'Pierdes la deducción fiscal en IRPF',
      'Sin disciplina de ahorro automático',
      'Más exposición a la volatilidad a corto plazo si inviertes',
    ],
    alertas: [
      'Si tu empresa ofrece plan de empleo con aportación patronal, reconsidéralo: la aportación patronal es rentabilidad inmediata.',
      'Si tu tramo de IRPF sube en el futuro, vuelve a evaluar esta decisión.',
    ],
  },
};

// ============================================================
// Componente Principal
// ============================================================

export default function SelectorPlanPensiones() {
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaSeleccionada = respuestas[preguntaActual];
  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const progresoPorcentaje = Math.round(
    ((preguntaActual + (respuestaSeleccionada !== null ? 1 : 0)) / totalPreguntas) * 100
  );

  const seleccionarOpcion = (indiceOpcion: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = indiceOpcion;
    setRespuestas(nuevasRespuestas);
  };

  const irAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const irSiguiente = () => {
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const calcularRecomendacion = (): RecomendacionKey => {
    const puntuaciones: Record<RecomendacionKey, number> = {
      individual: 0,
      empleo: 0,
      epsv: 0,
      diversificar: 0,
      ninguno: 0,
    };

    respuestas.forEach((respuestaIdx, preguntaIdx) => {
      if (respuestaIdx === null) return;
      const opcion = PREGUNTAS[preguntaIdx].opciones[respuestaIdx];
      if (!opcion) return;
      (Object.keys(opcion.pesos) as RecomendacionKey[]).forEach((key) => {
        const peso = opcion.pesos[key];
        if (peso !== undefined) {
          puntuaciones[key] += peso;
        }
      });
    });

    let mejorKey: RecomendacionKey = 'individual';
    let mejorPuntuacion = -1;
    (Object.keys(puntuaciones) as RecomendacionKey[]).forEach((key) => {
      if (puntuaciones[key] > mejorPuntuacion) {
        mejorPuntuacion = puntuaciones[key];
        mejorKey = key;
      }
    });

    return mejorKey;
  };

  const verResultado = () => {
    setMostrarResultado(true);
  };

  const reiniciar = () => {
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setMostrarResultado(false);
  };

  const recomendacionKey = mostrarResultado ? calcularRecomendacion() : null;
  const recomendacion = recomendacionKey ? RECOMENDACIONES[recomendacionKey] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Te conviene un plan de pensiones?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para saber si te conviene un plan individual, de empleo,
          EPSV o si es mejor otra estrategia de ahorro para la jubilación.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <div className={styles.legalNoticeWrapper}>
        <LegalNotice />
      </div>

      {/* ---- TEST ---- */}
      {!mostrarResultado && (
        <section className={styles.testSection} aria-label="Test de selección de plan de pensiones">
          {/* Barra de progreso */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={progresoPorcentaje} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del test">
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoPorcentaje}%` }}
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
              {pregunta.opciones.map((opcion, idx) => {
                const esSeleccionada = respuestaSeleccionada === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.opcionBtn}${esSeleccionada ? ` ${styles.selected}` : ''}`}
                    onClick={() => seleccionarOpcion(idx)}
                    aria-pressed={esSeleccionada ? true : false}
                  >
                    {opcion.texto}
                  </button>
                );
              })}
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

              {esUltimaPregunta ? (
                <button
                  type="button"
                  className={styles.btnResultado}
                  onClick={verResultado}
                  disabled={respuestaSeleccionada === null}
                  aria-label="Ver mi recomendación"
                >
                  Ver mi recomendación →
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnSiguiente}
                  onClick={irSiguiente}
                  disabled={respuestaSeleccionada === null}
                  aria-label="Ir a la pregunta siguiente"
                >
                  Siguiente →
                </button>
              )}
            </nav>
          </div>
        </section>
      )}

      {/* ---- RESULTADO ---- */}
      {mostrarResultado && recomendacion && (
        <section className={styles.resultadoSection} aria-label="Tu recomendación personalizada">
          <div
            className={`${styles.resultadoCard} ${styles[`recomendacion_${recomendacion.key}`]}`}
          >
            <p className={styles.recomendacionEtiqueta}>Tu recomendación</p>
            <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
            <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
            <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

            {/* Grid ventajas / inconvenientes */}
            <div className={styles.razonesGrid}>
              <div className={styles.razonCard}>
                <p className={`${styles.razonCardTitulo} ${styles.ventajas}`}>
                  <span aria-hidden="true">✅</span> Ventajas
                </p>
                <ul>
                  {recomendacion.ventajas.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.razonCard}>
                <p className={`${styles.razonCardTitulo} ${styles.inconvenientes}`}>
                  <span aria-hidden="true">⚠️</span> Inconvenientes
                </p>
                <ul>
                  {recomendacion.inconvenientes.map((inc, i) => (
                    <li key={i}>{inc}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Alertas */}
            {recomendacion.alertas.length > 0 && (
              <div className={styles.alertasSection}>
                <p className={styles.alertasTitulo}>
                  <span aria-hidden="true">🔔</span> Ten en cuenta
                </p>
                {recomendacion.alertas.map((alerta, i) => (
                  <div key={i} className={styles.alertaItem} role="note">
                    <span aria-hidden="true">⚡</span>
                    {alerta}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
              aria-label="Reiniciar el test de selección de plan de pensiones"
            >
              Reiniciar test
            </button>
          </div>
        </section>
      )}

      {/* ---- DISCLAIMER (Nivel 2 ALTO — financiero general, visible siempre) ---- */}
      <div className={styles.disclaimerWrapper}>
        <DisclaimerCard variant="financial" severity="critical" />
      </div>

      {/* ---- SECCIÓN EDUCATIVA (Patrón v2.0) ---- */}
      <div className={styles.educationalWrapper}>
        <EducationalSection
          title="¿Qué debes saber antes de contratar un plan de pensiones?"
          subtitle="Ventajas fiscales, desventajas, diferencias entre planes y cuándo no conviene contratar ninguno"
        >
          <h3>Ventajas fiscales reales en 2025</h3>
          <p>
            Los planes de pensiones individuales permiten reducir la base imponible del
            IRPF hasta <strong>1.500 € anuales</strong>. El ahorro real depende de tu
            tramo marginal: si tributas al 37%, cada 1.500 € aportados te suponen
            <strong> 555 € de ahorro fiscal ese año</strong>. Los planes de empleo
            tienen un límite mayor: hasta 8.500 € de aportación patronal más 1.500 € de
            aportación propia (10.000 € totales).
          </p>

          <h3>Desventajas que debes conocer</h3>
          <p>
            La principal desventaja es la <strong>iliquidez</strong>: el dinero solo se
            puede rescatar en supuestos tasados (jubilación, invalidez permanente,
            desempleo de larga duración, enfermedad grave, ERTE en pandemia...). Además,
            al rescatar, el dinero tributa como <strong>rendimiento del trabajo</strong>,
            sumándose a tu pensión pública. Si acumulas mucho capital y lo cobras de
            golpe, el impacto fiscal puede ser muy alto.
          </p>

          <div className={styles.warningBox}>
            <strong>Atención:</strong> Al rescatar el plan de pensiones, el dinero
            tributa como rendimiento del trabajo, lo que puede suponer un impacto fiscal
            significativo si se cobra todo de golpe. Con una pensión pública de 1.500 €/mes
            y un rescate de 100.000 € en el mismo año, podrías tributar por encima del
            37% o incluso el 45% por ese capital. Estudia siempre el rescate escalonado
            o en forma de renta.
          </div>

          <h3>Rentabilidades históricas: planes de pensiones vs fondos indexados</h3>
          <p>
            La rentabilidad media de los planes de pensiones españoles es
            <strong> inferior a la de los índices globales</strong>. Según datos de
            Inverco, la rentabilidad media a 10 años de los planes de pensiones del
            sistema individual ronda el 3-5% anual, mientras que un fondo indexado al
            MSCI World ha rendido históricamente en torno al 7-10% anual nominal.
            Sin embargo, la ventaja fiscal puede compensar esta diferencia si tu tramo
            de IRPF es alto.
          </p>

          <h3>EPSV vs Plan de Pensiones estatal</h3>
          <p>
            Las <strong>EPSV (Entidades de Previsión Social Voluntaria)</strong> son el
            equivalente vasco al plan de pensiones individual, con ventajas fiscales
            significativamente superiores gracias al régimen foral. En los Territorios
            Históricos del País Vasco se pueden deducir hasta 5.000 € anuales en la
            declaración de renta foral (frente a 1.500 € en territorio común). Además,
            permiten el rescate total o parcial a los 10 años desde la primera aportación,
            con una bonificación del 40% sobre el rendimiento generado. En Navarra las
            condiciones son también mejores que en el régimen estatal.
          </p>

          <h3>Cuándo NO conviene un plan de pensiones</h3>
          <ul>
            <li>
              <strong>Horizonte muy corto (menos de 5 años):</strong> La ventaja fiscal se
              diluye y el impacto al rescatar puede ser mayor que el ahorro generado.
            </li>
            <li>
              <strong>Tramo de IRPF bajo (hasta el 24%):</strong> La deducción es menor y
              puede no compensar la iliquidez ni la tributación al rescatar.
            </li>
            <li>
              <strong>Alta necesidad de liquidez:</strong> Si puedes necesitar ese dinero
              antes de jubilarte por cualquier motivo, los fondos de inversión o depósitos
              son más adecuados.
            </li>
            <li>
              <strong>Ya tienes cartera diversificada:</strong> Si maximizas fondos indexados
              y tienes capital suficiente, la ventaja marginal del plan puede ser pequeña
              frente a su inflexibilidad.
            </li>
          </ul>

          <h3>Alternativas al plan de pensiones individual</h3>
          <p>
            <strong>Fondos indexados y ETFs:</strong> No tienen deducción en IRPF pero
            ofrecen liquidez inmediata, menores comisiones y rentabilidades históricas
            superiores. Tributación de las plusvalías como ganancia patrimonial (19-28%),
            generalmente más favorable que rendimiento del trabajo.
          </p>
          <p>
            <strong>Planes de Ahorro Sistemático (PIAS):</strong> Seguro de ahorro con
            ventaja fiscal al rescatar (exención de plusvalías si se cobran como renta
            vitalicia tras 5 años). Aportación máxima 8.000 €/año.
          </p>
          <p>
            <strong>Cuenta de Ahorro a Largo Plazo (CIALP):</strong> Depósito o seguro
            con exención total de rendimientos si se mantiene al menos 5 años y el saldo
            no supera 5.000 €/año.
          </p>
        </EducationalSection>
      </div>

      {/* ---- APPS RELACIONADAS ---- */}
      <div className={styles.relatedWrapper}>
        <RelatedApps apps={getRelatedApps('selector-plan-pensiones')} />
      </div>

      <ShareCard appName="selector-plan-pensiones" />
      <Footer appName="selector-plan-pensiones" />
    </div>
  );
}
