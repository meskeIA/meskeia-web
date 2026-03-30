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
import styles from './SelectorContratoTrabajo.module.css';

// ============================================================
// Tipos TypeScript
// ============================================================

type RecomendacionKey = 'indefinido' | 'temporal' | 'autonomo' | 'practicas' | 'funcionario';

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
  consideraciones: string[];
}

// ============================================================
// Preguntas del test
// ============================================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuánto valoras la estabilidad laboral?',
    opciones: [
      { texto: 'Es lo más importante para mí', pesos: { indefinido: 4, funcionario: 5 } },
      { texto: 'Es importante pero no lo único', pesos: { indefinido: 2, temporal: 1 } },
      { texto: 'Prefiero flexibilidad antes que estabilidad', pesos: { autonomo: 3 } },
      { texto: 'Ahora mismo no es prioritaria', pesos: { practicas: 2, temporal: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿En qué etapa profesional te encuentras?',
    opciones: [
      { texto: 'Recién terminados los estudios', pesos: { practicas: 5, temporal: 2 } },
      { texto: 'Primeros años de carrera', pesos: { indefinido: 2, temporal: 3 } },
      { texto: 'Profesional con experiencia', pesos: { autonomo: 3, indefinido: 2 } },
      { texto: 'Buscando reorientación o cambio', pesos: { funcionario: 3, autonomo: 2 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuánto te importa el nivel de ingresos a corto plazo?',
    opciones: [
      { texto: 'Necesito ingresos estables ya', pesos: { indefinido: 3, funcionario: 3 } },
      { texto: 'Me conformo con poco mientras aprendo', pesos: { practicas: 4 } },
      { texto: 'Quiero alto potencial aunque con riesgo', pesos: { autonomo: 4 } },
      { texto: 'Ingresos moderados estables me bastan', pesos: { funcionario: 3, temporal: 2 } },
    ],
  },
  {
    id: 4,
    texto: '¿Cómo valoras la flexibilidad horaria y de lugar de trabajo?',
    opciones: [
      { texto: 'No me importa, prefiero estructura', pesos: { funcionario: 3, indefinido: 2 } },
      { texto: 'Me gustaría algo de flexibilidad', pesos: { indefinido: 2, temporal: 1 } },
      { texto: 'Es muy importante para mí', pesos: { autonomo: 5 } },
      { texto: 'Imprescindible, quiero trabajar cuando y donde quiera', pesos: { autonomo: 5 } },
    ],
  },
  {
    id: 5,
    texto: '¿Cuál es tu tolerancia al riesgo económico?',
    opciones: [
      { texto: 'Muy baja, necesito certeza', pesos: { funcionario: 4, indefinido: 3 } },
      { texto: 'Baja, pero asumo algo de incertidumbre', pesos: { indefinido: 2, temporal: 1 } },
      { texto: 'Media, puedo gestionar altibajos', pesos: { autonomo: 2, temporal: 2 } },
      { texto: 'Alta, me motiva el reto', pesos: { autonomo: 4 } },
    ],
  },
  {
    id: 6,
    texto: '¿Tienes o quieres desarrollar habilidades para captar clientes?',
    opciones: [
      { texto: 'No, prefiero que alguien me contrate', pesos: { indefinido: 3, funcionario: 3 } },
      { texto: 'Tengo algo de red pero no es mi fuerte', pesos: { temporal: 2 } },
      { texto: 'Sí, tengo cartera o sé cómo captarlos', pesos: { autonomo: 4 } },
      { texto: 'Todavía no tengo experiencia suficiente', pesos: { practicas: 3 } },
    ],
  },
  {
    id: 7,
    texto: '¿Qué sector o tipo de empleador prefieres?',
    opciones: [
      { texto: 'Gran empresa o multinacional', pesos: { indefinido: 3 } },
      { texto: 'Administración pública', pesos: { funcionario: 5 } },
      { texto: 'Empresa pequeña o startup', pesos: { temporal: 2, indefinido: 1 } },
      { texto: 'Trabajar para múltiples clientes o proyectos', pesos: { autonomo: 4 } },
      { texto: 'Cualquiera mientras aprenda', pesos: { practicas: 3 } },
    ],
  },
  {
    id: 8,
    texto: '¿Cuánto te importan las prestaciones sociales (vacaciones pagadas, baja, jubilación)?',
    opciones: [
      { texto: 'Son fundamentales', pesos: { funcionario: 4, indefinido: 3 } },
      { texto: 'Importantes pero no decisivas', pesos: { indefinido: 2 } },
      { texto: 'Puedo gestionar las mías como autónomo', pesos: { autonomo: 3 } },
      { texto: 'Ahora mismo no son prioritarias', pesos: { practicas: 3, temporal: 2 } },
    ],
  },
  {
    id: 9,
    texto: '¿Tienes responsabilidades económicas fijas (hipoteca, familia)?',
    opciones: [
      { texto: 'Sí, tengo compromisos importantes', pesos: { indefinido: 4, funcionario: 4 } },
      { texto: 'Algunos compromisos moderados', pesos: { indefinido: 2, funcionario: 2 } },
      { texto: 'Pocos compromisos, vivo con flexibilidad', pesos: { autonomo: 3, temporal: 2 } },
      { texto: 'Sin compromisos fijos', pesos: { autonomo: 3, practicas: 2 } },
    ],
  },
  {
    id: 10,
    texto: '¿Cómo describes tu actitud ante el trabajo?',
    opciones: [
      { texto: 'Quiero crecer en una organización', pesos: { indefinido: 3, funcionario: 2 } },
      { texto: 'Quiero aprender y luego ver', pesos: { practicas: 4, temporal: 2 } },
      { texto: 'Quiero construir algo propio', pesos: { autonomo: 4 } },
      { texto: 'Quiero seguridad y buen equilibrio trabajo-vida', pesos: { funcionario: 4 } },
    ],
  },
];

// ============================================================
// Recomendaciones
// ============================================================

const RECOMENDACIONES: Recomendacion[] = [
  {
    key: 'indefinido',
    titulo: 'Contrato Indefinido',
    subtitulo: 'Estabilidad y protección laboral máxima',
    descripcion:
      'El contrato indefinido te ofrece la máxima protección laboral en el empleo privado. Accedes a todos los derechos del Estatuto de los Trabajadores: vacaciones, baja, finiquito y cotización continua a la Seguridad Social. Es la opción ideal si valoras la seguridad y piensas en el largo plazo dentro de una empresa.',
    ventajas: [
      'Máxima estabilidad: protección ante despidos improcedentes',
      'Todos los derechos laborales completos (vacaciones, pagas extra, baja)',
      'Cotización continua para desempleo y jubilación',
      'Acceso a hipotecas y créditos con mayor facilidad',
      'Posibilidad de desarrollo profesional y promoción interna',
    ],
    consideraciones: [
      'Depende de que la empresa lo ofrezca (cada vez más común)',
      'Menor flexibilidad horaria según el sector',
      'El techo salarial puede estar limitado por convenio',
      'Cambiar de empresa implica pérdidas en condiciones adquiridas',
    ],
  },
  {
    key: 'temporal',
    titulo: 'Contrato Temporal',
    subtitulo: 'Acceso rápido al mercado y experiencia diversa',
    descripcion:
      'El contrato temporal te permite acceder al mercado laboral con rapidez y acumular experiencia en diferentes sectores y empresas. Tras la reforma laboral de 2022, las modalidades temporales están más restringidas, por lo que muchos contratos derivan en indefinidos si se dan las condiciones legales.',
    ventajas: [
      'Acceso inmediato al mercado de trabajo',
      'Experiencia diversa en diferentes empresas y proyectos',
      'Posibilidad de convertirse en indefinido (por ley, tras ciertos supuestos)',
      'Mejor que la economía sumergida en términos de cotización',
      'Menor compromiso inicial si buscas flexibilidad a corto plazo',
    ],
    consideraciones: [
      'Mayor inseguridad: puede no renovarse',
      'Dificultad para acceder a hipotecas o créditos',
      'Limitaciones en el subsidio de desempleo acumulado',
      'La reforma laboral 2022 restringe causas de temporalidad',
    ],
  },
  {
    key: 'autonomo',
    titulo: 'Autónomo / Freelance',
    subtitulo: 'Máxima flexibilidad e independencia profesional',
    descripcion:
      'El trabajo como autónomo te ofrece total libertad para elegir clientes, proyectos y horarios. Tienes el mayor potencial de ingresos a largo plazo, pero también asumes la gestión de cuotas, impuestos, facturación y periodos sin trabajo. Es la opción ideal si tienes habilidades de captación y disfrutas de la autonomía.',
    ventajas: [
      'Libertad total para fijar horarios y elegir proyectos',
      'Potencial de ingresos sin techo, dependiente de tu capacidad',
      'Posibilidad de trabajar para clientes de todo el mundo',
      'Deducción de gastos profesionales en IRPF e IVA',
      'Tarifa plana bonificada para nuevos autónomos (primer año)',
    ],
    consideraciones: [
      'Cuota RETA mensual obligatoria (aunque sea tarifa plana el primer año)',
      'Sin vacaciones pagadas ni baja automática sin seguro adicional',
      'Gestión de impuestos trimestral (IVA, IRPF)',
      'Periodos de sequía de clientes pueden generar inestabilidad',
    ],
  },
  {
    key: 'practicas',
    titulo: 'Contrato en Prácticas / Becario',
    subtitulo: 'Formación práctica y primer acceso al mercado',
    descripcion:
      'El contrato de prácticas es la puerta de entrada ideal cuando acabas de terminar los estudios o deseas cambiar de sector. Te permite aprender en un entorno profesional real, construir red de contactos y demostrar tu valía. Con la nueva regulación (RD 1038/2022), las prácticas deben estar remuneradas y cotizar a la Seguridad Social.',
    ventajas: [
      'Formación práctica en entorno profesional real',
      'Primer empleo oficial con cotización a la SS',
      'Construcción de red profesional desde el inicio',
      'Puede derivar en contrato indefinido si el resultado es bueno',
      'Salario inferior compensado por el aprendizaje obtenido',
    ],
    consideraciones: [
      'Remuneración reducida (mínimo SMI proporcional según convenio)',
      'Temporal por naturaleza (máximo 2 años)',
      'Requiere haber terminado los estudios recientemente (plazo legal)',
      'No siempre disponible en todos los sectores',
    ],
  },
  {
    key: 'funcionario',
    titulo: 'Funcionario / Empleado Público',
    subtitulo: 'Máxima seguridad y condiciones definidas de por vida',
    descripcion:
      'El empleo público como funcionario de carrera ofrece la mayor estabilidad posible en el mercado laboral español. Una vez aprobadas las oposiciones, disfrutas de inamovilidad, salario estable, vacaciones garantizadas y jubilación del sistema público. El proceso de acceso es exigente y largo, pero la recompensa es una carrera laboral predecible y segura.',
    ventajas: [
      'Estabilidad total: prácticamente imposible ser despedido',
      'Condiciones laborales definidas por ley y estables',
      'Jubilación pública con pensión según años cotizados',
      'Vacaciones y permisos garantizados por ley',
      'Compatible con reducción de jornada o excedencias',
    ],
    consideraciones: [
      'Proceso de acceso largo y exigente: oposiciones competitivas',
      'Salario generalmente inferior a empresa privada equivalente',
      'Menor flexibilidad en desarrollo profesional y movilidad',
      'Puede pasar años entre convocatoria y toma de posesión',
    ],
  },
];

// ============================================================
// Componente principal
// ============================================================

export default function SelectorContratoTrabajo() {
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaActual = respuestas[preguntaActual];

  // Calcular puntuaciones
  const calcularPuntuaciones = (): Record<RecomendacionKey, number> => {
    const puntuaciones: Record<RecomendacionKey, number> = {
      indefinido: 0,
      temporal: 0,
      autonomo: 0,
      practicas: 0,
      funcionario: 0,
    };

    respuestas.forEach((opcionIdx, preguntaIdx) => {
      if (opcionIdx === null) return;
      const opcion = PREGUNTAS[preguntaIdx].opciones[opcionIdx];
      (Object.keys(opcion.pesos) as RecomendacionKey[]).forEach((key) => {
        puntuaciones[key] += opcion.pesos[key] ?? 0;
      });
    });

    return puntuaciones;
  };

  const obtenerRecomendacion = (): Recomendacion => {
    const puntuaciones = calcularPuntuaciones();
    const mejorKey = (Object.keys(puntuaciones) as RecomendacionKey[]).reduce((a, b) =>
      puntuaciones[a] >= puntuaciones[b] ? a : b
    );
    return RECOMENDACIONES.find((r) => r.key === mejorKey) ?? RECOMENDACIONES[0];
  };

  // Handlers
  const seleccionarOpcion = (idx: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = idx;
    setRespuestas(nuevasRespuestas);
  };

  const irAnterior = () => {
    if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
  };

  const irSiguiente = () => {
    if (preguntaActual < totalPreguntas - 1) setPreguntaActual(preguntaActual + 1);
  };

  const verResultado = () => {
    setMostrarResultado(true);
  };

  const reiniciar = () => {
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setPreguntaActual(0);
    setMostrarResultado(false);
  };

  const porcentajeProgreso = mostrarResultado
    ? 100
    : Math.round(((preguntaActual + 1) / totalPreguntas) * 100);

  const respuestasCompletadas = respuestas.filter((r) => r !== null).length;
  const todasRespondidas = respuestasCompletadas === totalPreguntas;

  const recomendacion = mostrarResultado ? obtenerRecomendacion() : null;
  const puntuaciones = mostrarResultado ? calcularPuntuaciones() : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué tipo de contrato te conviene?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir qué modalidad laboral se adapta mejor a tu perfil,
          prioridades y momento vital: indefinido, temporal, autónomo, prácticas o funcionario.
        </p>
      </header>

      <LegalNotice />

      {/* ---- Test ---- */}
      {!mostrarResultado && (
        <section className={styles.testSection} aria-label="Test de selección de contrato">
          {/* Progreso */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={porcentajeProgreso} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso: pregunta ${preguntaActual + 1} de ${totalPreguntas}`}>
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoFill}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
            <p className={styles.progresoTexto}>
              Pregunta {preguntaActual + 1} de {totalPreguntas} — {respuestasCompletadas} respondidas
            </p>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>Pregunta {preguntaActual + 1}</p>
            <p className={styles.preguntaTexto} id={`pregunta-${preguntaActual}`}>
              {pregunta.texto}
            </p>

            <div
              className={styles.opciones}
              role="group"
              aria-labelledby={`pregunta-${preguntaActual}`}
            >
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestaActual === idx ? styles.selected : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={respuestaActual === idx ? true : false}
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
              aria-label="Ir a la pregunta anterior"
            >
              ← Anterior
            </button>

            {preguntaActual < totalPreguntas - 1 ? (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={respuestaActual === null}
                aria-label="Ir a la siguiente pregunta"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={verResultado}
                disabled={!todasRespondidas}
                aria-label="Ver mi recomendación"
              >
                Ver mi recomendación →
              </button>
            )}
          </nav>
        </section>
      )}

      {/* ---- Resultado ---- */}
      {mostrarResultado && recomendacion && puntuaciones && (
        <section className={styles.resultadoSection} aria-label="Resultado del test">
          {/* Barra progreso completa */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} aria-label="Test completado">
            <div className={styles.progresoBar}>
              <div className={styles.progresoFill} style={{ width: '100%' }} />
            </div>
            <p className={styles.progresoTexto}>Test completado — {totalPreguntas} preguntas respondidas</p>
          </div>

          {/* Tarjeta de recomendación */}
          <div
            className={`${styles.resultadoCard} ${styles[`recomendacion_${recomendacion.key}`]}`}
            role="region"
            aria-label="Tu recomendación personalizada"
          >
            <p className={styles.resultadoLabel}>Tu modalidad recomendada</p>
            <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
            <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
            <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

            <div className={styles.ventajasSection}>
              <h3>Ventajas principales</h3>
              <ul aria-label="Ventajas de esta modalidad">
                {recomendacion.ventajas.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>

            <div className={styles.consideracionesSection}>
              <h3>A tener en cuenta</h3>
              <ul aria-label="Consideraciones de esta modalidad">
                {recomendacion.consideraciones.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Puntuaciones parciales */}
            <div className={styles.puntuacionesGrid} aria-label="Puntuaciones por modalidad">
              {RECOMENDACIONES.map((r) => (
                <div key={r.key} className={styles.puntuacionItem}>
                  <span className={styles.puntuacionNombre}>{r.titulo.split(' ')[0]}</span>
                  <span className={styles.puntuacionValor}>{puntuaciones[r.key]}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={styles.btnReiniciar}
            onClick={reiniciar}
            aria-label="Reiniciar el test desde el principio"
          >
            ↺ Volver a empezar
          </button>
        </section>
      )}

      {/* ---- Disclaimer ---- */}
      <DisclaimerCard variant="general" severity="high" />

      {/* ---- Sección educativa ---- */}
      <EducationalSection
        title="Modalidades laborales en España"
        subtitle="Ventajas e inconvenientes de cada tipo de contrato"
      >
        <div>
          <h3>Contrato indefinido</h3>
          <p>
            El contrato indefinido no tiene fecha de vencimiento. El trabajador tiene derecho a
            vacaciones anuales retribuidas (mínimo 30 días naturales), cotización plena a la
            Seguridad Social, prestación por desempleo en caso de despido improcedente e
            indemnización mínima de 33 días por año trabajado (despido improcedente). La reforma
            laboral de 2022 ha impulsado su generalización como forma ordinaria de contratación.
          </p>

          <h3>Contrato temporal (causas vigentes desde 2022)</h3>
          <p>
            Tras la reforma laboral de 2022 (RD-ley 32/2021), los contratos temporales solo se
            permiten por dos causas: (1) circunstancias de la producción, con duración máxima de
            6 meses ampliable a 12 por convenio; y (2) sustitución de trabajador, con reserva de
            puesto. El encadenamiento de contratos temporales por más de 18 meses en 24 convierte
            la relación en indefinida.
          </p>

          <h3>Autónomo: cuota RETA y tarifa plana</h3>
          <p>
            Los nuevos autónomos pueden beneficiarse de una tarifa plana de 80 € al mes durante
            los primeros 12 meses de actividad (prorrogable a 24 si los ingresos netos no superan
            el SMI). A partir del segundo año, la cuota RETA se calcula sobre los rendimientos
            netos estimados con un sistema de tramos: desde 225 € al mes para ingresos inferiores
            a 670 € hasta 530 € para ingresos superiores a 6.000 €. Además, los autónomos están
            obligados a presentar liquidaciones trimestrales de IVA (modelo 303) e IRPF (modelo
            130).
          </p>

          <h3>Contrato de formación en alternancia y en prácticas</h3>
          <p>
            Desde la reforma 2022, el antiguo &quot;contrato en prácticas&quot; se denomina
            &quot;contrato de formación en alternancia&quot; o &quot;contrato para la obtención de
            práctica profesional&quot; según el caso. La duración oscila entre 6 meses y 3 años
            para el primero, y entre 6 meses y 1 año para el segundo. Ambos cotizan a la
            Seguridad Social en todas las contingencias (incluido desempleo) y deben tener
            remuneración mínima según convenio.
          </p>

          <h3>Funcionario de carrera y empleado público</h3>
          <p>
            El acceso al empleo público como funcionario de carrera se realiza mediante oposición
            libre (principios de igualdad, mérito y capacidad). El proceso incluye pruebas
            teóricas y/o prácticas, y puede durar entre 1 y 3 años. Los funcionarios tienen
            inamovilidad en su puesto, retribuciones fijadas por ley (sueldo base, complementos),
            pagas extraordinarias, vacaciones de 22 días hábiles anuales y jubilación del sistema
            de clases pasivas o régimen general, según fecha de ingreso.
          </p>

          <h3>Derechos básicos del trabajador en España</h3>
          <ul>
            <li>Vacaciones anuales: mínimo 30 días naturales (22 hábiles)</li>
            <li>Salario Mínimo Interprofesional (SMI): actualizado anualmente</li>
            <li>Jornada máxima: 40 horas semanales ordinarias (reforma prevista en 2025: 37,5 h)</li>
            <li>Baja médica: desde el primer día para accidente laboral; desde el cuarto día para enfermedad común (a cargo de empresa desde el cuarto hasta el decimoquinto)</li>
            <li>Finiquito: liquidación de partes proporcionales de sueldo, vacaciones no disfrutadas y pagas extra pendientes</li>
            <li>Cotización a la Seguridad Social: cubre jubilación, desempleo, incapacidad temporal y permanente</li>
          </ul>

          <div className={styles.warningBox} role="note">
            <strong>Nota orientativa:</strong> Esta herramienta es orientativa sobre perfiles.
            Las condiciones específicas de cada contrato dependen del convenio colectivo aplicable
            y la negociación con el empleador. La normativa laboral puede variar. Consulta con un
            asesor laboral o abogado especializado ante dudas concretas sobre tu situación.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-contrato-trabajo')} />
      <ShareCard appName="selector-contrato-trabajo" />
      <Footer appName="selector-contrato-trabajo" />
    </div>
  );
}
