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
import styles from './SelectorSeguroVida.module.css';

// ============================================
// Tipos
// ============================================

type RecomendacionKey = 'temporal' | 'ahorro' | 'mixto' | 'ninguno';

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
  paraQuien: string[];
  capitalOrientativo: string;
  consejos: string[];
}

// ============================================
// Datos del test
// ============================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Tienes personas que dependen económicamente de ti?',
    opciones: [
      { texto: 'Sí, pareja e hijos menores', pesos: { temporal: 4, mixto: 3 } },
      { texto: 'Sí, pareja pero sin hijos o ya independientes', pesos: { temporal: 3 } },
      { texto: 'Sí, padres o familiares a mi cargo', pesos: { temporal: 3, mixto: 2 } },
      { texto: 'No, soy totalmente independiente', pesos: { ninguno: 4 } },
    ],
  },
  {
    id: 2,
    texto: '¿Tienes hipoteca u otras deudas importantes?',
    opciones: [
      { texto: 'Sí, hipoteca significativa', pesos: { temporal: 3 } },
      { texto: 'Sí, otras deudas (préstamo, empresa)', pesos: { temporal: 3 } },
      { texto: 'Tengo deudas pequeñas', pesos: { temporal: 1 } },
      { texto: 'No tengo deudas relevantes', pesos: { ninguno: 2, ahorro: 1 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuál es tu situación laboral?',
    opciones: [
      { texto: 'Asalariado con contrato estable', pesos: { temporal: 2 } },
      { texto: 'Autónomo o freelance', pesos: { temporal: 3, mixto: 2 } },
      { texto: 'Funcionario con prestaciones públicas', pesos: { temporal: 1 } },
      { texto: 'Sin ingresos fijos o en transición', pesos: { temporal: 3 } },
    ],
  },
  {
    id: 4,
    texto: 'Si faltaras hoy, ¿cuántos meses de gastos podría cubrir tu familia con ahorros?',
    opciones: [
      { texto: 'Menos de 3 meses', pesos: { temporal: 4 } },
      { texto: 'Entre 3 y 12 meses', pesos: { temporal: 3 } },
      { texto: 'Más de 12 meses', pesos: { temporal: 1, ninguno: 2 } },
      { texto: 'Tienen patrimonio propio suficiente', pesos: { ninguno: 3 } },
    ],
  },
  {
    id: 5,
    texto: '¿Qué edad tienes?',
    opciones: [
      { texto: 'Menos de 30 años', pesos: { ninguno: 2, ahorro: 2 } },
      { texto: 'Entre 30 y 45 años', pesos: { temporal: 3, mixto: 2 } },
      { texto: 'Entre 45 y 55 años', pesos: { temporal: 3, ahorro: 2 } },
      { texto: 'Más de 55 años', pesos: { ahorro: 3, ninguno: 1 } },
    ],
  },
  {
    id: 6,
    texto: '¿Qué buscas principalmente en un seguro de vida?',
    opciones: [
      { texto: 'Solo protección, lo más barato posible', pesos: { temporal: 4 } },
      { texto: 'Solo ahorro, la protección es secundaria', pesos: { ahorro: 4 } },
      { texto: 'Ambas cosas por igual', pesos: { mixto: 4 } },
      { texto: 'Aún no lo tengo claro', pesos: { mixto: 2, temporal: 2 } },
    ],
  },
  {
    id: 7,
    texto: '¿Tienes ya otros productos de ahorro o inversión?',
    opciones: [
      { texto: 'No, este sería el primero', pesos: { ahorro: 2, mixto: 2 } },
      { texto: 'Tengo algo (fondos, depósito)', pesos: { temporal: 2 } },
      { texto: 'Tengo cartera diversificada', pesos: { temporal: 3, ninguno: 1 } },
      { texto: 'Tengo suficiente patrimonio acumulado', pesos: { ninguno: 3 } },
    ],
  },
  {
    id: 8,
    texto: '¿Cuánto podrías pagar mensualmente por un seguro de vida?',
    opciones: [
      { texto: 'Menos de 20 €/mes', pesos: { temporal: 4 } },
      { texto: 'Entre 20 € y 60 €/mes', pesos: { temporal: 2, mixto: 1 } },
      { texto: 'Entre 60 € y 150 €/mes', pesos: { mixto: 3, ahorro: 2 } },
      { texto: 'Más de 150 €/mes', pesos: { ahorro: 3, mixto: 2 } },
    ],
  },
  {
    id: 9,
    texto: '¿Tienes alguna enfermedad o condición de salud preexistente?',
    opciones: [
      { texto: 'No, gozo de buena salud', pesos: { ahorro: 1 } },
      { texto: 'Alguna leve ya resuelta', pesos: { temporal: 2 } },
      { texto: 'Condición crónica controlada', pesos: { temporal: 1, mixto: 1 } },
      { texto: 'Condición grave o en tratamiento', pesos: { temporal: 1 } },
    ],
  },
  {
    id: 10,
    texto: '¿Cuál es tu principal motivación para plantearte un seguro de vida?',
    opciones: [
      { texto: 'Proteger a mi familia si fallezco', pesos: { temporal: 4 } },
      { texto: 'Cubrir la hipoteca si algo me pasa', pesos: { temporal: 4 } },
      { texto: 'Dejar un capital a mis herederos', pesos: { ahorro: 3, mixto: 2 } },
      { texto: 'Tener un ahorro complementario para la jubilación', pesos: { ahorro: 4 } },
      { texto: 'Solo me lo estoy planteando por curiosidad', pesos: { ninguno: 2 } },
    ],
  },
];

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  temporal: {
    key: 'temporal',
    titulo: 'Seguro de Vida Temporal',
    subtitulo: 'Protección pura por fallecimiento durante un período',
    descripcion:
      'El seguro de vida temporal cubre exclusivamente el riesgo de fallecimiento durante la vigencia del contrato. Si el asegurado muere, los beneficiarios reciben el capital pactado. Si sobrevive al plazo, no recupera nada. Es la opción más económica y directa para proteger a tu familia frente a imprevistos.',
    paraQuien: [
      'Personas con hipoteca o deudas importantes que quieren cubrirlas',
      'Familias con hijos menores dependientes económicamente',
      'Autónomos sin prestaciones por desempleo ni colchón de ahorros',
      'Quienes buscan máxima protección al menor coste posible',
    ],
    capitalOrientativo:
      '5-10 veces los ingresos anuales + saldo pendiente de hipoteca y deudas. Ejemplo: si ganas 30.000 €/año y debes 120.000 € de hipoteca, considera un capital entre 270.000 € y 420.000 €.',
    consejos: [
      'Contrata antes de los 45 años para obtener primas más bajas',
      'El plazo debe cubrir al menos hasta que tus hijos sean independientes o finalice la hipoteca',
      'Revisa las exclusiones: algunos contratos excluyen suicidio en los primeros años o deportes de riesgo',
      'Beneficiarios actualizados: indica expresamente quiénes cobrarían en caso de fallecimiento',
      'Pide al menos 3 presupuestos comparativos, los precios varían enormemente entre aseguradoras',
    ],
  },
  ahorro: {
    key: 'ahorro',
    titulo: 'Seguro de Vida Ahorro (Vida Entera / Unit Linked)',
    subtitulo: 'Protección combinada con acumulación de capital a largo plazo',
    descripcion:
      'Los seguros de ahorro o vida entera combinan cobertura por fallecimiento con una componente de acumulación financiera. Existen distintas modalidades: vida entera tradicional (garantiza un capital fijo en cualquier momento), Unit Linked (capital vinculado a fondos de inversión con más rentabilidad potencial pero también más riesgo) y PPA/PIAS para la jubilación.',
    paraQuien: [
      'Personas sin hijos ni deudas que quieren dejar patrimonio a sus herederos',
      'Quienes buscan un vehículo de ahorro complementario a largo plazo',
      'Mayores de 45-50 años que priorizan la transmisión de capital',
      'Quienes no tienen otros productos de ahorro o inversión',
    ],
    capitalOrientativo:
      'El capital varía según prima y plazo. Con una prima mensual de 100 €/mes a 20 años, podrías acumular entre 24.000 € (garantizado) y más, según el producto. Consulta siempre la rentabilidad garantizada vs. proyectada.',
    consejos: [
      'Compara la rentabilidad garantizada con otras alternativas (fondos indexados, depósitos)',
      'En un Unit Linked, el capital no está garantizado si los fondos bajan',
      'Los PIAS tienen ventajas fiscales al convertirse en renta vitalicia, pero requieren más de 10 años',
      'Los gastos de gestión de estos productos suelen ser elevados: exige información transparente',
      'En muchos casos, separar protección (temporal) y ahorro (fondos indexados) resulta más eficiente',
    ],
  },
  mixto: {
    key: 'mixto',
    titulo: 'Seguro Mixto',
    subtitulo: 'Cobertura por fallecimiento Y capital garantizado al vencimiento',
    descripcion:
      'El seguro mixto combina las dos coberturas principales: si el asegurado fallece durante la vigencia, los beneficiarios reciben el capital; si llega al vencimiento con vida, también cobra el capital pactado. Esto lo convierte en una opción intermedia con primas más altas que el temporal pero que garantiza siempre una prestación.',
    paraQuien: [
      'Quienes quieren protección familiar Y un ahorro forzoso garantizado',
      'Autónomos o emprendedores con necesidad de ambas coberturas',
      'Personas en la franja 30-50 años con dependientes y también con objetivos de ahorro',
      'Quienes prefieren la certeza de recuperar algo frente al "todo o nada" del temporal',
    ],
    capitalOrientativo:
      'El capital suele ser el mismo en caso de fallecimiento y al vencimiento (ej. 100.000 €). Las primas son más altas que el temporal: un capital de 100.000 € a 20 años puede costar entre 100 € y 300 €/mes según edad y estado de salud.',
    consejos: [
      'Verifica si el capital al vencimiento pierde poder adquisitivo con la inflación (sin participación en beneficios)',
      'Compara el coste del mixto frente a contratar un temporal + invertir la diferencia',
      'Algunas aseguradoras ofrecen participación en beneficios que mejora la rentabilidad',
      'La rescisión anticipada suele penalizarse significativamente: asegúrate de poder mantener las primas',
      'Lee detenidamente las exclusiones y carencias antes de firmar',
    ],
  },
  ninguno: {
    key: 'ninguno',
    titulo: 'No es prioritario ahora',
    subtitulo: 'Sin dependientes ni deudas relevantes, hay alternativas más eficientes',
    descripcion:
      'Según las respuestas del test, un seguro de vida no parece una prioridad inmediata. Sin dependientes económicos ni deudas significativas, el dinero destinado a primas puede emplearse de forma más eficiente en construir un fondo de emergencia o en inversión diversificada. Esta conclusión puede cambiar si tu situación personal evoluciona.',
    paraQuien: [
      'Personas jóvenes sin cargas familiares ni hipoteca',
      'Quienes ya cuentan con patrimonio suficiente para cubrir necesidades futuras',
      'Personas con pareja que también tiene ingresos independientes y suficientes',
      'Quienes priorizan otros vehículos de ahorro o inversión antes que el seguro',
    ],
    capitalOrientativo:
      'Dedica ese capital mensual a construir primero un fondo de emergencia de 3-6 meses de gastos. Después, considera fondos indexados u otros vehículos de inversión con menor coste de gestión que un seguro mixto.',
    consejos: [
      'Revisa tu situación cada 2-3 años: la llegada de hijos, hipoteca o cambio laboral puede cambiar la necesidad',
      'Si tienes pareja con ingresos, valora si uno de los dos tiene mayor necesidad de cobertura',
      'El seguro de vida temporal es muy barato a edades jóvenes: si anticipas cargas futuras, podrías contratar ahora',
      'No confundas el seguro de vida con el seguro de vida ligado a hipoteca, que puede ser obligatorio según el banco',
      'Los seguros de decesos (gastos de sepelio) son distintos y pueden tener más sentido según tu situación familiar',
    ],
  },
};

// ============================================
// Lógica de puntuación
// ============================================

function calcularRecomendacion(
  respuestas: Record<number, number>
): RecomendacionKey {
  const puntos: Record<RecomendacionKey, number> = {
    temporal: 0,
    ahorro: 0,
    mixto: 0,
    ninguno: 0,
  };

  PREGUNTAS.forEach((pregunta) => {
    const idxOpcion = respuestas[pregunta.id];
    if (idxOpcion !== undefined) {
      const opcion = pregunta.opciones[idxOpcion];
      (Object.keys(opcion.pesos) as RecomendacionKey[]).forEach((key) => {
        puntos[key] += opcion.pesos[key] ?? 0;
      });
    }
  });

  return (Object.keys(puntos) as RecomendacionKey[]).reduce(
    (max, key) => (puntos[key] > puntos[max] ? key : max),
    'temporal' as RecomendacionKey
  );
}

// ============================================
// Componente principal
// ============================================

export default function SelectorSeguroVidaPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const pregunta = PREGUNTAS[preguntaActual];
  const totalPreguntas = PREGUNTAS.length;
  const porcentajeProgreso = ((preguntaActual + 1) / totalPreguntas) * 100;
  const respuestaActual = respuestas[pregunta.id];
  const esUltima = preguntaActual === totalPreguntas - 1;

  const recomendacionKey = mostrarResultado
    ? calcularRecomendacion(respuestas)
    : null;
  const recomendacion = recomendacionKey
    ? RECOMENDACIONES[recomendacionKey]
    : null;

  function seleccionarOpcion(idx: number) {
    setRespuestas((prev) => ({ ...prev, [pregunta.id]: idx }));
  }

  function irAnterior() {
    if (preguntaActual > 0) setPreguntaActual((p) => p - 1);
  }

  function irSiguiente() {
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((p) => p + 1);
    }
  }

  function verResultado() {
    setMostrarResultado(true);
  }

  function reiniciar() {
    setRespuestas({});
    setPreguntaActual(0);
    setMostrarResultado(false);
  }

  const etiquetaTexto: Record<RecomendacionKey, string> = {
    temporal: 'Seguro Temporal',
    ahorro: 'Seguro Ahorro',
    mixto: 'Seguro Mixto',
    ninguno: 'No prioritario',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          ¿Necesitas seguro de vida? ¿Y cuál tipo?
        </h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para saber si te conviene un seguro de vida temporal, de ahorro, mixto o si aún no es prioritario. Análisis según tus cargas familiares, hipoteca y situación económica.
        </p>
      </header>

      <LegalNotice />

      {/* ---- TEST ---- */}
      {!mostrarResultado && (
        <section className={styles.testSection} aria-label="Test selector de seguro de vida">
          {/* Progreso */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={preguntaActual + 1} aria-valuemin={1} aria-valuemax={totalPreguntas} aria-label={`Pregunta ${preguntaActual + 1} de ${totalPreguntas}`}>
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoFill}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'right' }}>
              {preguntaActual + 1} de {totalPreguntas}
            </p>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>Pregunta {pregunta.id}</p>
            <p className={styles.preguntaTexto} id={`pregunta-${pregunta.id}`}>
              {pregunta.texto}
            </p>

            <div
              className={styles.opciones}
              role="group"
              aria-labelledby={`pregunta-${pregunta.id}`}
            >
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcionBtn}${respuestaActual === idx ? ` ${styles.selected}` : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={respuestaActual === idx ? true : false}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            {preguntaActual > 0 && (
              <button
                type="button"
                className={styles.btnAnterior}
                onClick={irAnterior}
                aria-label="Ir a la pregunta anterior"
              >
                ← Anterior
              </button>
            )}

            {!esUltima && (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={respuestaActual === undefined}
                aria-label="Ir a la siguiente pregunta"
              >
                Siguiente →
              </button>
            )}

            {esUltima && (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={verResultado}
                disabled={respuestaActual === undefined}
                aria-label="Ver mi recomendación de seguro de vida"
              >
                Ver mi recomendación →
              </button>
            )}
          </div>
        </section>
      )}

      {/* ---- RESULTADO ---- */}
      {mostrarResultado && recomendacion && (
        <section className={styles.resultadoSection} aria-label="Resultado del test">
          <div
            className={`${styles.resultadoCard} ${styles[`recomendacion_${recomendacion.key}`]}`}
          >
            <span
              className={`${styles.etiquetaResultado} ${styles[`etiqueta_${recomendacion.key}`]}`}
            >
              {etiquetaTexto[recomendacion.key]}
            </span>

            <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
            <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
            <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

            <div className={styles.capitalGrid}>
              <div className={styles.capitalCard}>
                <h4>Capital orientativo</h4>
                <p>{recomendacion.capitalOrientativo}</p>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
              Te puede convenir si…
            </h3>
            <ul className={styles.paraQuienList}>
              {recomendacion.paraQuien.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <div className={styles.consejosSection}>
              <h3>Consejos prácticos</h3>
              <ul>
                {recomendacion.consejos.map((consejo, i) => (
                  <li key={i}>{consejo}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
              aria-label="Repetir el test desde el principio"
            >
              ↺ Repetir el test
            </button>
          </div>
        </section>
      )}

      {/* ---- DISCLAIMER ---- */}
      <DisclaimerCard variant="financial" severity="high" />

      {/* ---- CONTENIDO EDUCATIVO ---- */}
      <EducationalSection
        title="Guía del seguro de vida en España"
        subtitle="Cuándo contratar, qué tipo elegir y cuánto capital asegurar"
      >
        <h3>Tipos de seguros de vida y cuándo usar cada uno</h3>
        <p>
          En España existen cuatro modalidades principales de seguro de vida. El <strong>seguro temporal</strong> cubre el fallecimiento durante un período limitado (normalmente 10-30 años) y es el más económico. El <strong>seguro de vida entera</strong> cubre toda la vida del asegurado con prima constante y valor de rescate creciente. El <strong>Unit Linked</strong> es un seguro de vida vinculado a fondos de inversión, con rentabilidad potencial mayor pero sin capital garantizado. El <strong>seguro mixto</strong> garantiza el capital tanto en caso de fallecimiento como al vencimiento.
        </p>
        <p>
          Para la mayoría de familias con hipoteca e hijos dependientes, el <strong>temporal es la opción más racional</strong>: máxima protección al menor coste. El ahorro puede hacerse de forma más eficiente con fondos indexados u otros instrumentos.
        </p>

        <h3>¿Cuánto capital asegurado necesitas? La regla orientativa</h3>
        <p>
          Una regla ampliamente usada en planificación financiera establece que el capital asegurado debe ser de entre <strong>5 y 10 veces los ingresos anuales</strong> del asegurado, más las <strong>deudas pendientes</strong> (hipoteca, préstamos). Esta fórmula asegura que los beneficiarios puedan mantener su nivel de vida durante años sin depender únicamente del capital.
        </p>
        <p>
          Ejemplo: si ganas 35.000 €/año y tienes una hipoteca con 150.000 € pendientes, el capital orientativo estaría entre <strong>325.000 € y 500.000 €</strong>. Ajusta según si tu pareja también tiene ingresos propios o si hay gastos excepcionales previstos (educación universitaria de los hijos, etc.).
        </p>

        <h3>Deducción fiscal del seguro de vida ligado a hipoteca</h3>
        <p>
          Las primas de seguro de vida vinculados a hipotecas anteriores a 2013 pueden acogerse a la <strong>deducción por inversión en vivienda habitual</strong> (disposición transitoria), siempre que el seguro sea obligatorio para la concesión del préstamo y la prima se incluya en el coste del crédito. Desde 2013, los nuevos contratos de hipoteca no generan este derecho. Consulta con tu asesor fiscal para confirmar si tu caso cumple los requisitos.
        </p>

        <h3>Cómo afectan las preexistencias a la prima y cobertura</h3>
        <p>
          Al contratar un seguro de vida debes cumplimentar un <strong>cuestionario de salud</strong> con sinceridad. Las aseguradoras pueden excluir coberturas por enfermedades preexistentes declaradas, incrementar la prima o incluso rechazar la contratación. Ocultar preexistencias puede hacer que los beneficiarios no cobren la prestación en caso de fallecimiento. Si tienes condiciones crónicas, busca aseguradoras especializadas o pólizas con cuestionarios simplificados, que suelen tener primas más altas pero garantizan la cobertura.
        </p>

        <div className={styles.warningBox} role="note">
          <strong>Importante antes de contratar:</strong> Las condiciones de contratación, exclusiones y primas varían enormemente entre aseguradoras. Solicita siempre al menos 3 presupuestos comparativos y lee detenidamente las <strong>cláusulas de exclusión</strong> (deportes de riesgo, suicidio, actividades laborales peligrosas) antes de firmar. Un corredor de seguros independiente puede ayudarte a comparar sin conflicto de interés.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-seguro-vida')} />
      <ShareCard appName="selector-seguro-vida" />
      <Footer appName="selector-seguro-vida" />
    </div>
  );
}
