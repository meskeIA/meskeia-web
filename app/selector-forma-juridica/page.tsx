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
import styles from './SelectorFormaJuridica.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type VeredictoKey = 'autonomo' | 'sl' | 'valorar';

interface Opcion {
  texto: string;
  puntos: number;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface Veredicto {
  key: VeredictoKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  inconvenientes: string[];
}

// ─────────────────────────────────────────────
// Datos: preguntas
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuántos ingresos brutos anuales esperas en tu actividad?',
    opciones: [
      { texto: 'Menos de 30.000 €', puntos: -3 },
      { texto: 'Entre 30.000 € y 60.000 €', puntos: 0 },
      { texto: 'Entre 60.000 € y 100.000 €', puntos: 2 },
      { texto: 'Más de 100.000 €', puntos: 4 },
    ],
  },
  {
    id: 2,
    texto: '¿Trabajarás con socios o co-fundadores?',
    opciones: [
      { texto: 'No, seré el único', puntos: -2 },
      { texto: 'Sí, tenemos 2 o más socios', puntos: 3 },
      { texto: 'Quizás en el futuro', puntos: 0 },
    ],
  },
  {
    id: 3,
    texto: '¿Cuánto riesgo patrimonial tiene tu actividad?',
    opciones: [
      { texto: 'Muy bajo, servicios intelectuales', puntos: -3 },
      { texto: 'Bajo, poco riesgo de reclamaciones', puntos: -1 },
      { texto: 'Medio, clientes empresas con contratos', puntos: 1 },
      { texto: 'Alto, productos físicos o responsabilidades grandes', puntos: 3 },
    ],
  },
  {
    id: 4,
    texto: '¿Cuántos clientes esperas tener?',
    opciones: [
      { texto: 'Pocos clientes grandes', puntos: 1 },
      { texto: 'Muchos clientes pequeños', puntos: 0 },
      { texto: 'Un solo cliente principal', puntos: -2 },
      { texto: 'Aún no lo sé', puntos: 0 },
    ],
  },
  {
    id: 5,
    texto: '¿Necesitas separar tu patrimonio personal del empresarial?',
    opciones: [
      { texto: 'No es prioritario', puntos: -2 },
      { texto: 'Sería deseable', puntos: 1 },
      { texto: 'Es imprescindible', puntos: 3 },
    ],
  },
  {
    id: 6,
    texto: '¿Cómo valoras la carga administrativa (contabilidad, impuestos, reuniones de socios)?',
    opciones: [
      { texto: 'Quiero lo más simple posible', puntos: -3 },
      { texto: 'Puedo asumir algo de complejidad', puntos: 0 },
      { texto: 'No me importa, tengo gestor', puntos: 2 },
    ],
  },
  {
    id: 7,
    texto: '¿Cuál es tu proyección a 3-5 años?',
    opciones: [
      { texto: 'Actividad complementaria o temporal', puntos: -3 },
      { texto: 'Actividad principal pero estable', puntos: -1 },
      { texto: 'Crecimiento, contrataciones, inversión', puntos: 3 },
    ],
  },
  {
    id: 8,
    texto: '¿Necesitas captar inversores o financiación externa?',
    opciones: [
      { texto: 'No', puntos: -1 },
      { texto: 'Posiblemente en el futuro', puntos: 1 },
      { texto: 'Sí, es parte del plan', puntos: 3 },
    ],
  },
  {
    id: 9,
    texto: '¿Cuánto capital inicial puedes aportar para constituir la empresa?',
    opciones: [
      { texto: 'Prefiero no inmovilizar capital', puntos: -2 },
      { texto: 'Puedo aportar 1 € simbólico (desde 2023)', puntos: 0 },
      { texto: 'Tengo capital para aportar solidez', puntos: 1 },
    ],
  },
  {
    id: 10,
    texto: '¿Tienes experiencia gestionando una empresa o llevas tiempo como autónomo?',
    opciones: [
      { texto: 'Empiezo desde cero', puntos: -1 },
      { texto: 'Llevo tiempo como autónomo y quiero escalar', puntos: 2 },
      { texto: 'Ya tengo experiencia empresarial', puntos: 1 },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: veredictos
// ─────────────────────────────────────────────

const VEREDICTOS: Record<VeredictoKey, Veredicto> = {
  autonomo: {
    key: 'autonomo',
    titulo: 'Operar como Autónomo',
    subtitulo: 'Tu perfil encaja mejor con el régimen de autónomo',
    descripcion:
      'Según tus respuestas, el alta como autónomo (RETA) es la opción más adecuada para empezar. Es más sencillo, tiene menor coste de constitución y es ideal para freelances y actividades con bajo riesgo patrimonial. Pagarás IRPF progresivo sobre tus beneficios y tu cuota RETA dependerá de tus rendimientos reales.',
    ventajas: [
      'Alta en 24-48 h, sin notario ni registro',
      'Sin capital mínimo obligatorio',
      'Gestión administrativa más simple',
      'Cuota RETA proporcional a ingresos reales',
      'Gastos deducibles directos en el IRPF',
    ],
    inconvenientes: [
      'Responsabilidad ilimitada con tu patrimonio personal',
      'IRPF puede ser más alto que el IS a partir de ~40.000 € de beneficio',
      'Imagen menos corporativa frente a grandes clientes',
      'Dificulta captar socios o inversores',
    ],
  },
  sl: {
    key: 'sl',
    titulo: 'Constituir una Sociedad Limitada',
    subtitulo: 'Tu perfil apunta hacia una Sociedad Limitada (SL)',
    descripcion:
      'Tus respuestas sugieren que la Sociedad Limitada puede ofrecerte ventajas importantes: separación patrimonial, posible ahorro fiscal cuando los beneficios superan los 40.000-50.000 €, e imagen más profesional frente a clientes y entidades financieras. Requiere escritura ante notario, inscripción en el Registro Mercantil y llevar contabilidad formal.',
    ventajas: [
      'Responsabilidad limitada al capital aportado',
      'Tipo IS del 23-25 % (puede ser menor que el IRPF)',
      'Capital mínimo desde 1 € (reforma 2023)',
      'Facilita captar socios, inversores y financiación',
      'Mayor credibilidad ante grandes clientes y proveedores',
    ],
    inconvenientes: [
      'Coste de constitución: notaría + registro (~600-1.000 €)',
      'Obligación de llevar contabilidad mercantil',
      'Gestoría o asesor fiscal imprescindible',
      'Reuniones y actas de socios obligatorias',
    ],
  },
  valorar: {
    key: 'valorar',
    titulo: 'Valorar con un Gestor',
    subtitulo: 'Tu perfil tiene factores mixtos — merece análisis personalizado',
    descripcion:
      'Tu situación presenta tanto factores a favor del régimen de autónomo como de la Sociedad Limitada. Antes de decidir, te recomendamos consultar con un gestor o asesor fiscal que pueda estudiar tu caso concreto: ingresos esperados, tipo marginal del IRPF, posibilidad de retribución como socio-administrador, etc.',
    ventajas: [
      'Un gestor puede simular ambos escenarios con cifras reales',
      'Evitas consecuencias fiscales o legales inesperadas',
      'Puedes empezar como autónomo y dar el salto a SL más adelante',
      'La reforma de 2023 permite constituir SL con 1 € de capital',
    ],
    inconvenientes: [
      'Requiere invertir tiempo en análisis previo',
      'El asesoramiento tiene coste (habitualmente asumible)',
      'La incertidumbre dificulta tomar la decisión sola',
    ],
  },
};

// ─────────────────────────────────────────────
// Lógica: calcular veredicto
// ─────────────────────────────────────────────

function calcularVeredicto(respuestas: (number | null)[]): VeredictoKey {
  const score = respuestas.reduce<number>((acc, r) => acc + (r ?? 0), 0);
  if (score <= -8) return 'autonomo';
  if (score >= 8) return 'sl';
  return 'valorar';
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorFormaJuridica() {
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaActual = respuestas[preguntaActual];
  const esUltima = preguntaActual === PREGUNTAS.length - 1;
  const progresoPct = ((preguntaActual + 1) / PREGUNTAS.length) * 100;

  function seleccionarOpcion(puntos: number) {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = puntos;
    setRespuestas(nuevasRespuestas);
  }

  function irAnterior() {
    if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
  }

  function irSiguiente() {
    if (preguntaActual < PREGUNTAS.length - 1) setPreguntaActual(preguntaActual + 1);
  }

  function verResultado() {
    setMostrarResultado(true);
  }

  function reiniciar() {
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setPreguntaActual(0);
    setMostrarResultado(false);
  }

  const veredictoKey = calcularVeredicto(respuestas);
  const veredicto = VEREDICTOS[veredictoKey];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Autónomo o Sociedad Limitada?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir qué forma jurídica se adapta mejor a tu proyecto
          en España
        </p>
      </header>

      <div className={styles.legalNoticeWrapper}>
        <LegalNotice />
      </div>

      {/* ── TEST ── */}
      {!mostrarResultado && (
        <section className={styles.testSection} aria-label="Test de forma jurídica">
          {/* Barra de progreso */}
          <div className={styles.progreso} aria-label={`Pregunta ${preguntaActual + 1} de ${PREGUNTAS.length}`}>
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoPct}%` }}
                role="progressbar"
                aria-valuenow={preguntaActual + 1}
                aria-valuemin={1}
                aria-valuemax={PREGUNTAS.length}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>
              Pregunta {preguntaActual + 1} de {PREGUNTAS.length}
            </p>
            <p className={styles.preguntaTexto}>{pregunta.texto}</p>

            <div className={styles.opciones} role="group" aria-label="Opciones de respuesta">
              {pregunta.opciones.map((opcion) => {
                const esSeleccionada = respuestaActual === opcion.puntos;
                return (
                  <button
                    key={opcion.texto}
                    type="button"
                    className={`${styles.opcionBtn} ${esSeleccionada ? styles.selected : ''}`}
                    onClick={() => seleccionarOpcion(opcion.puntos)}
                    aria-pressed={esSeleccionada ? true : false}
                  >
                    {opcion.texto}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>

            {esUltima ? (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={verResultado}
                disabled={respuestaActual === null}
                aria-label="Ver mi resultado"
              >
                Ver resultado
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={respuestaActual === null}
                aria-label="Siguiente pregunta"
              >
                Siguiente →
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── RESULTADO ── */}
      {mostrarResultado && (
        <section
          className={styles.resultadoSection}
          aria-label="Resultado del test"
        >
          {/* Veredicto principal */}
          <div className={`${styles.resultadoCard} ${styles[`veredicto_${veredicto.key}`]}`}>
            <p className={styles.preguntaNumero} style={{ textAlign: 'center' }}>
              Nuestra recomendación
            </p>
            <h2 className={styles.veredictoTitulo}>{veredicto.titulo}</h2>
            <p className={styles.veredictoDesc}>{veredicto.descripcion}</p>
          </div>

          {/* Grid: ventajas e inconvenientes */}
          <div className={styles.comparativaGrid}>
            <div className={styles.comparativaCard}>
              <p className={styles.comparativaTitulo}>Ventajas</p>
              <ul className={styles.ventajas} aria-label="Ventajas de esta opción">
                {veredicto.ventajas.map((v) => (
                  <li key={v} className={styles.ventajaItem}>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.comparativaCard}>
              <p className={styles.comparativaTitulo}>Puntos a considerar</p>
              <ul className={styles.inconvenientes} aria-label="Puntos a considerar">
                {veredicto.inconvenientes.map((i) => (
                  <li key={i} className={styles.inconvenienteItem}>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
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

      {/* ── DISCLAIMER (nivel ALTO, siempre visible) ── */}
      <DisclaimerCard variant="financial" severity="high" />

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Autónomo vs Sociedad Limitada: diferencias clave"
        subtitle="Conoce las implicaciones de cada forma jurídica antes de decidir"
      >
        <p>
          Elegir la forma jurídica correcta es una de las decisiones más importantes al emprender.
          Estas son las diferencias fundamentales entre operar como autónomo y constituir una
          Sociedad Limitada (SL):
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.93rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid var(--primary)', color: 'var(--primary)' }}>Aspecto</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid var(--primary)', color: 'var(--primary)' }}>Autónomo</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid var(--primary)', color: 'var(--primary)' }}>Sociedad Limitada</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }}>Responsabilidad</td>
              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0' }}>Ilimitada (patrimonio personal)</td>
              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0' }}>Limitada al capital aportado</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }}>Fiscalidad</td>
              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0' }}>IRPF progresivo (19-47 %)</td>
              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0' }}>Impuesto sobre Sociedades (23-25 %)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }}>Coste de alta</td>
              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0' }}>Gratuito (trámite online)</td>
              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e0e0e0' }}>~600-1.000 € (notaría + registro)</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Administración</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Simple (modelo 130, 303, 100)</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Compleja (contabilidad mercantil, depósito cuentas, actas)</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ marginTop: '1.5rem', color: 'var(--primary)', fontSize: '1rem' }}>
          ¿Cuándo puede el IS ser más favorable que el IRPF?
        </h3>
        <p>
          En términos generales, el Impuesto sobre Sociedades (IS) al tipo del 23-25 % puede
          resultar más ventajoso que el IRPF cuando el beneficio de la actividad supera los{' '}
          <strong>40.000-50.000 € anuales</strong>. A partir de ese umbral, el tipo marginal del
          IRPF escala rápidamente (37-47 %), mientras que el IS se mantiene estable. No obstante,
          el análisis debe incluir también la retribución del socio-administrador, las
          cotizaciones a la Seguridad Social y los gastos de gestión de la SL.
        </p>

        <h3 style={{ marginTop: '1.25rem', color: 'var(--primary)', fontSize: '1rem' }}>
          Capital mínimo desde 2023: 1 €
        </h3>
        <p>
          La Ley de Startups (Ley 28/2022) introdujo la <strong>SL con capital mínimo de 1 €</strong>.
          Anteriormente era obligatorio aportar 3.000 €. Con la nueva regulación, puedes constituir
          una SL con un capital simbólico, aunque los socios deben destinar al menos el 20 % de
          los beneficios a reservas hasta que el capital social alcance los 3.000 €.
        </p>

        <div className={styles.warningBox} role="alert">
          Esta herramienta es orientativa. La elección de forma jurídica tiene implicaciones
          fiscales y legales importantes. Los resultados dependen de múltiples factores
          individuales (actividad, CCAA, situación familiar, proyección de ingresos...).
          Consulta siempre con un asesor fiscal o gestor antes de tomar la decisión definitiva.
        </div>
      </EducationalSection>

      {/* ── APPS RELACIONADAS ── */}
      <RelatedApps apps={getRelatedApps('selector-forma-juridica')} />

      {/* ── SHARE CARD ── */}
      <ShareCard appName="selector-forma-juridica" />

      {/* ── FOOTER ── */}
      <Footer appName="selector-forma-juridica" />
    </div>
  );
}
