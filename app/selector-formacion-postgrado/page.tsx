'use client';

import { useState } from 'react';
import styles from './SelectorFormacionPostgrado.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/* ===================================================
   Tipos
   =================================================== */

type TipoFormacion = 'master' | 'fp_superior' | 'bootcamp' | 'oposiciones' | 'certificacion';

interface Opcion {
  texto: string;
  icono: string;
  pesos: Partial<Record<TipoFormacion, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  icono: string;
  opciones: Opcion[];
}

interface Resultado {
  tipo: TipoFormacion;
  titulo: string;
  descripcion: string;
  icono: string;
  puntos: string[];
  duracion: string;
  coste: string;
}

/* ===================================================
   Datos
   =================================================== */

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuál es tu principal motivación para seguir formándote?',
    icono: '🎯',
    opciones: [
      { texto: 'Conseguir estabilidad laboral y empleo seguro', icono: '🛡️', pesos: { oposiciones: 4, certificacion: 1 } },
      { texto: 'Especializarme académicamente en mi área', icono: '🎓', pesos: { master: 4, fp_superior: 1 } },
      { texto: 'Cambiar de sector rápidamente', icono: '🔄', pesos: { bootcamp: 4, certificacion: 2 } },
      { texto: 'Mejorar mi posición en la empresa actual', icono: '📈', pesos: { certificacion: 4, master: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cuánto tiempo puedes dedicar a la formación?',
    icono: '⏰',
    opciones: [
      { texto: '3-6 meses a tiempo completo', icono: '⚡', pesos: { bootcamp: 4, certificacion: 2 } },
      { texto: '1-2 años compaginando con trabajo', icono: '⚖️', pesos: { master: 3, fp_superior: 3, oposiciones: 2 } },
      { texto: '2-4 años de preparación constante', icono: '📅', pesos: { oposiciones: 4, master: 2 } },
      { texto: 'Unas semanas o meses de aprendizaje flexible', icono: '🗓️', pesos: { certificacion: 4, bootcamp: 2 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuál es tu situación actual?',
    icono: '💼',
    opciones: [
      { texto: 'Recién graduado/a, sin experiencia laboral', icono: '🆕', pesos: { master: 3, fp_superior: 3, oposiciones: 2 } },
      { texto: 'Trabajo en mi sector y quiero avanzar', icono: '📊', pesos: { certificacion: 4, master: 3 } },
      { texto: 'Trabajo en otro sector y quiero cambiar', icono: '🔀', pesos: { bootcamp: 4, fp_superior: 2 } },
      { texto: 'Llevo tiempo desempleado/a y quiero reincorporarme', icono: '🚀', pesos: { fp_superior: 3, bootcamp: 3, oposiciones: 2 } },
    ],
  },
  {
    id: 4,
    texto: '¿Cuál es tu presupuesto estimado para la formación?',
    icono: '💶',
    opciones: [
      { texto: 'Menos de 2.000 €', icono: '💰', pesos: { oposiciones: 3, certificacion: 4, fp_superior: 2 } },
      { texto: 'Entre 2.000 € y 6.000 €', icono: '💳', pesos: { fp_superior: 3, bootcamp: 3, certificacion: 2 } },
      { texto: 'Entre 6.000 € y 15.000 €', icono: '🏦', pesos: { master: 3, bootcamp: 3 } },
      { texto: 'Más de 15.000 € o dispongo de beca', icono: '🎓', pesos: { master: 4 } },
    ],
  },
  {
    id: 5,
    texto: '¿Qué tipo de objetivo profesional tienes?',
    icono: '🏆',
    opciones: [
      { texto: 'Acceder a un puesto en la Administración Pública', icono: '🏛️', pesos: { oposiciones: 5, certificacion: 1 } },
      { texto: 'Especializarme en un área concreta con título oficial', icono: '📜', pesos: { master: 4, fp_superior: 2 } },
      { texto: 'Trabajar en tecnología o startups', icono: '💻', pesos: { bootcamp: 5, certificacion: 3 } },
      { texto: 'Adquirir habilidades prácticas reconocidas en mi sector', icono: '🔧', pesos: { fp_superior: 4, certificacion: 3 } },
    ],
  },
  {
    id: 6,
    texto: '¿Cuánta experiencia laboral previa tienes?',
    icono: '📋',
    opciones: [
      { texto: 'Sin experiencia o menos de 1 año', icono: '🌱', pesos: { master: 3, fp_superior: 3, oposiciones: 2 } },
      { texto: 'Entre 1 y 3 años de experiencia', icono: '🌿', pesos: { fp_superior: 2, bootcamp: 3, oposiciones: 2 } },
      { texto: 'Entre 3 y 7 años de experiencia', icono: '🌳', pesos: { certificacion: 4, master: 2, bootcamp: 2 } },
      { texto: 'Más de 7 años de experiencia profesional', icono: '🏅', pesos: { certificacion: 5, master: 2 } },
    ],
  },
  {
    id: 7,
    texto: '¿Qué modalidad de estudio prefieres?',
    icono: '🏫',
    opciones: [
      { texto: 'Presencial, con contacto directo con docentes y compañeros', icono: '🏛️', pesos: { master: 3, fp_superior: 3, oposiciones: 2 } },
      { texto: 'Online, con flexibilidad total de horario', icono: '💻', pesos: { bootcamp: 3, certificacion: 4 } },
      { texto: 'Híbrido o semipresencial', icono: '🔄', pesos: { master: 3, fp_superior: 2, bootcamp: 2 } },
      { texto: 'Estudio autónomo en casa', icono: '🏠', pesos: { oposiciones: 4, certificacion: 3 } },
    ],
  },
  {
    id: 8,
    texto: '¿A qué sector te interesa orientar tu carrera?',
    icono: '🏢',
    opciones: [
      { texto: 'Tecnología, datos, programación o ciberseguridad', icono: '💻', pesos: { bootcamp: 5, certificacion: 3 } },
      { texto: 'Administración pública, educación o justicia', icono: '🏛️', pesos: { oposiciones: 5, master: 1 } },
      { texto: 'Empresa, finanzas, marketing o gestión', icono: '📊', pesos: { master: 4, certificacion: 3 } },
      { texto: 'Sanidad, industria, comercio o sector técnico', icono: '⚙️', pesos: { fp_superior: 5, certificacion: 2 } },
    ],
  },
  {
    id: 9,
    texto: '¿Con qué urgencia necesitas incorporarte al mercado laboral?',
    icono: '⏱️',
    opciones: [
      { texto: 'Lo antes posible, en meses', icono: '🚀', pesos: { bootcamp: 4, certificacion: 4 } },
      { texto: 'En 1-2 años, puedo esperar', icono: '⏳', pesos: { master: 3, fp_superior: 4 } },
      { texto: 'En 3-5 años, priorizo la preparación profunda', icono: '🎯', pesos: { oposiciones: 5, master: 2 } },
      { texto: 'No tengo urgencia, me importa más la calidad', icono: '🌟', pesos: { master: 4, fp_superior: 2 } },
    ],
  },
  {
    id: 10,
    texto: '¿Qué importancia le das al título o certificado oficial?',
    icono: '🎓',
    opciones: [
      { texto: 'Necesito un título universitario oficial reconocido', icono: '📜', pesos: { master: 5 } },
      { texto: 'Prefiero titulación pública con valor en el mercado', icono: '🏫', pesos: { fp_superior: 5, oposiciones: 2 } },
      { texto: 'Me interesan más las habilidades que el título', icono: '🔧', pesos: { bootcamp: 4, certificacion: 4 } },
      { texto: 'Quiero un certificado reconocido internacionalmente', icono: '🌍', pesos: { certificacion: 5, master: 2 } },
    ],
  },
];

const RESULTADOS: Record<TipoFormacion, Resultado> = {
  master: {
    tipo: 'master',
    titulo: 'Máster Universitario',
    descripcion:
      'Tu perfil encaja con un máster universitario oficial. Buscas especialización académica profunda con un título reconocido, tienes tiempo para una formación de calidad y te orientas hacia sectores como empresa, gestión o áreas técnicas que valoran el prestigio académico.',
    icono: '🎓',
    puntos: ['Título oficial universitario', 'Alta especialización académica', 'Redes de contactos universitarias', 'Acceso a doctorado si lo deseas'],
    duracion: '1-2 años',
    coste: '3.000 – 30.000 €',
  },
  fp_superior: {
    tipo: 'fp_superior',
    titulo: 'FP de Grado Superior',
    descripcion:
      'La Formación Profesional de Grado Superior es tu mejor opción. Ofrece formación práctica con alta empleabilidad, titulación pública reconocida y costes muy inferiores a los de un máster. Ideal si te orientas a sectores industriales, sanitarios, de gestión o servicios.',
    icono: '🔧',
    puntos: ['Titulación pública oficial', 'Alta tasa de inserción laboral', 'Prácticas en empresa incluidas', 'Opción de FP Dual muy valorada'],
    duracion: '1-2 años',
    coste: '0 – 2.000 € (pública/privada)',
  },
  bootcamp: {
    tipo: 'bootcamp',
    titulo: 'Bootcamp / Formación Online Intensiva',
    descripcion:
      'Tu perfil se adapta a un bootcamp o formación online intensiva. Necesitas incorporarte al mercado rápidamente, te interesa la tecnología o el cambio de sector, y valoras las habilidades prácticas por encima del título. El retorno de inversión suele ser muy rápido.',
    icono: '💻',
    puntos: ['Resultados rápidos (3-6 meses)', 'Alta demanda en tecnología', 'Orientado a proyectos reales', 'Comunidad y networking activo'],
    duracion: '3-6 meses',
    coste: '2.000 – 12.000 €',
  },
  oposiciones: {
    tipo: 'oposiciones',
    titulo: 'Preparación de Oposiciones',
    descripcion:
      'Tu prioridad es la estabilidad laboral y el empleo público. Tienes paciencia para una preparación exigente y buscas un puesto en la Administración Pública, la educación o la justicia. Las oposiciones ofrecen empleo de por vida con condiciones muy ventajosas.',
    icono: '🏛️',
    puntos: ['Empleo público estable y vitalicio', 'Sueldo con progresión regulada', 'Conciliación y derechos laborales', 'Posibilidad de estudio autónomo'],
    duracion: '2-5 años de preparación',
    coste: '500 – 3.000 € (academia/materiales)',
  },
  certificacion: {
    tipo: 'certificacion',
    titulo: 'Certificación Profesional',
    descripcion:
      'Tienes experiencia laboral y lo que necesitas es validar y ampliar habilidades concretas. Las certificaciones profesionales (PMP, AWS, CFA, Google, Microsoft...) son reconocidas internacionalmente, se pueden obtener en semanas o meses, y tienen gran valor en el mercado.',
    icono: '🏅',
    puntos: ['Reconocimiento internacional', 'Formato flexible y online', 'Alta valoración por empresas', 'Actualizable y renovable'],
    duracion: 'Semanas a 6 meses',
    coste: '200 – 3.000 €',
  },
};

const LABELS: Record<TipoFormacion, string> = {
  master: '🎓 Máster',
  fp_superior: '🔧 FP Superior',
  bootcamp: '💻 Bootcamp',
  oposiciones: '🏛️ Oposiciones',
  certificacion: '🏅 Certificación',
};

/* ===================================================
   Componente principal
   =================================================== */

export default function SelectorFormacionPostgradoPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [paso, setPaso] = useState<'quiz' | 'resultado'>('quiz');
  const [preguntaActual, setPreguntaActual] = useState(0);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const opcionSeleccionada = respuestas[pregunta.id] ?? -1;

  // Calcular puntuaciones
  const calcularResultado = (): TipoFormacion => {
    const puntuaciones: Record<TipoFormacion, number> = {
      master: 0,
      fp_superior: 0,
      bootcamp: 0,
      oposiciones: 0,
      certificacion: 0,
    };
    PREGUNTAS.forEach((preg) => {
      const idxRespuesta = respuestas[preg.id];
      if (idxRespuesta !== undefined) {
        const opcion = preg.opciones[idxRespuesta];
        if (opcion) {
          (Object.keys(opcion.pesos) as TipoFormacion[]).forEach((tipo) => {
            puntuaciones[tipo] += opcion.pesos[tipo] ?? 0;
          });
        }
      }
    });
    return (Object.keys(puntuaciones) as TipoFormacion[]).reduce((a, b) =>
      puntuaciones[a] >= puntuaciones[b] ? a : b
    );
  };

  const getPuntuaciones = (): Record<TipoFormacion, number> => {
    const puntuaciones: Record<TipoFormacion, number> = {
      master: 0,
      fp_superior: 0,
      bootcamp: 0,
      oposiciones: 0,
      certificacion: 0,
    };
    PREGUNTAS.forEach((preg) => {
      const idxRespuesta = respuestas[preg.id];
      if (idxRespuesta !== undefined) {
        const opcion = preg.opciones[idxRespuesta];
        if (opcion) {
          (Object.keys(opcion.pesos) as TipoFormacion[]).forEach((tipo) => {
            puntuaciones[tipo] += opcion.pesos[tipo] ?? 0;
          });
        }
      }
    });
    return puntuaciones;
  };

  const seleccionarOpcion = (idx: number) => {
    setRespuestas((prev) => ({ ...prev, [pregunta.id]: idx }));
  };

  const irAnterior = () => {
    if (preguntaActual > 0) setPreguntaActual((p) => p - 1);
  };

  const irSiguiente = () => {
    if (opcionSeleccionada === -1) return;
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((p) => p + 1);
    } else {
      setPaso('resultado');
    }
  };

  const reiniciar = () => {
    setRespuestas({});
    setPaso('quiz');
    setPreguntaActual(0);
  };

  const tipoGanador = paso === 'resultado' ? calcularResultado() : null;
  const resultado = tipoGanador ? RESULTADOS[tipoGanador] : null;
  const puntuaciones = paso === 'resultado' ? getPuntuaciones() : null;
  const maxPuntuacion = puntuaciones
    ? Math.max(...(Object.values(puntuaciones) as number[]))
    : 1;

  // Ordenar alternativas por puntuación
  const alternativasOrdenadas: [TipoFormacion, number][] = puntuaciones
    ? (Object.entries(puntuaciones) as [TipoFormacion, number][]).sort(([, a], [, b]) => b - a)
    : [];

  const progresoPct = ((preguntaActual + (opcionSeleccionada >= 0 ? 1 : 0)) / totalPreguntas) * 100;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🎓</span>
        <h1>¿Qué formación postgrado te conviene?</h1>
        <p>
          Responde 10 preguntas y descubre si tu perfil encaja mejor con un máster,
          FP superior, bootcamp, oposiciones o certificación profesional.
        </p>
      </header>

      <LegalNotice />

      {/* Aviso colapsable de nivel medio */}
      <DisclaimerCard variant="educational" severity="medium" />

      {/* Quiz */}
      {paso === 'quiz' && (
        <section className={styles.quiz} aria-label="Test de selección de formación">
          {/* Barra de progreso */}
          <div className={styles.progreso}>
            <span className={styles.progresoTexto}>
              {preguntaActual + 1} / {totalPreguntas}
            </span>
            <div className={styles.progresoBar} role="progressbar" aria-valuenow={preguntaActual + 1} aria-valuemin={1} aria-valuemax={totalPreguntas}>
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoPct}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <div className={styles.preguntaHeader}>
              <span className={styles.preguntaNumero} aria-hidden="true">{pregunta.id}</span>
              <span className={styles.preguntaIcono} aria-hidden="true">{pregunta.icono}</span>
              <p className={styles.preguntaTexto}>{pregunta.texto}</p>
            </div>

            {/* Opciones */}
            <div className={styles.opciones} role="radiogroup" aria-label={pregunta.texto}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${opcionSeleccionada === idx ? styles.seleccionada : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={opcionSeleccionada === idx}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                  <span className={styles.opcionTexto}>{opcion.texto}</span>
                  <span className={styles.indicadorSeleccion} aria-hidden="true">
                    {opcionSeleccionada === idx ? '✓' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <nav className={styles.navegacion} aria-label="Navegación del test">
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-disabled={preguntaActual === 0}
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={irSiguiente}
              disabled={opcionSeleccionada === -1}
              aria-disabled={opcionSeleccionada === -1}
            >
              {preguntaActual < totalPreguntas - 1 ? 'Siguiente →' : 'Ver resultado 🎯'}
            </button>
          </nav>
        </section>
      )}

      {/* Resultado */}
      {paso === 'resultado' && resultado && puntuaciones && (
        <section className={styles.resultado} aria-label="Tu recomendación de formación">
          <div className={styles.resultadoCard}>
            <div className={styles.resultadoBadge} aria-label="Tu recomendación principal">
              ✨ Tu formación recomendada
            </div>
            <span className={styles.resultadoIcono} aria-hidden="true">{resultado.icono}</span>
            <h2 className={styles.resultadoTitulo}>{resultado.titulo}</h2>
            <p className={styles.resultadoDescripcion}>{resultado.descripcion}</p>

            {/* Puntos clave */}
            <div className={styles.resultadoPuntos} role="list" aria-label="Ventajas clave">
              {resultado.puntos.map((punto, i) => (
                <span key={i} className={styles.punto} role="listitem">
                  <span aria-hidden="true">✓</span> {punto}
                </span>
              ))}
            </div>

            {/* Datos prácticos */}
            <div className={styles.warningBox} role="note">
              <span aria-hidden="true">📌</span>
              <span>
                <strong>Duración estimada:</strong> {resultado.duracion} &nbsp;·&nbsp;{' '}
                <strong>Coste orientativo:</strong> {resultado.coste}. Estas cifras son orientativas y pueden variar según institución, CCAA y modalidad.
              </span>
            </div>

            {/* Puntuaciones comparativas */}
            <div className={styles.alternativas}>
              <h3>Comparativa de afinidad con cada vía</h3>
              <div className={styles.alternativasList} role="list" aria-label="Puntuaciones por tipo de formación">
                {alternativasOrdenadas.map(([tipo, pts]) => (
                  <div key={tipo} className={styles.alternativaItem} role="listitem">
                    <span className={styles.alternativaLabel}>{LABELS[tipo]}</span>
                    <div className={styles.alternativaBarWrap}>
                      <div
                        className={styles.alternativaBar}
                        style={{ width: `${maxPuntuacion > 0 ? (pts / maxPuntuacion) * 100 : 0}%` }}
                        role="progressbar"
                        aria-valuenow={pts}
                        aria-valuemin={0}
                        aria-valuemax={maxPuntuacion}
                        aria-label={`${LABELS[tipo]}: ${pts} puntos`}
                      />
                    </div>
                    <span className={styles.alternativaPct}>{pts} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className={styles.accionesResultado}>
              <button type="button" className={styles.btnSecundario} onClick={reiniciar}>
                🔄 Repetir el test
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="📚 Guía completa de formación postgrado en España"
        subtitle="Todo lo que necesitas saber para elegir la mejor vía formativa según tu perfil"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué opciones de formación postgrado existen en España?</h2>
          <p>
            Tras finalizar los estudios de grado o acumular experiencia laboral, el sistema educativo español
            ofrece cinco grandes vías de formación para continuar tu desarrollo profesional. Cada una tiene
            un perfil de candidato ideal, un coste diferente y un tiempo de retorno distinto.
          </p>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>Vía formativa</th>
                <th>Duración</th>
                <th>Coste aprox.</th>
                <th>Título</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🎓 Máster Universitario</td>
                <td>1-2 años</td>
                <td>3.000 – 30.000 €</td>
                <td>Oficial universitario</td>
              </tr>
              <tr>
                <td>🔧 FP Grado Superior</td>
                <td>1-2 años</td>
                <td>0 – 2.000 €</td>
                <td>Técnico Superior</td>
              </tr>
              <tr>
                <td>💻 Bootcamp / Online</td>
                <td>3-6 meses</td>
                <td>2.000 – 12.000 €</td>
                <td>Certificado propio</td>
              </tr>
              <tr>
                <td>🏛️ Oposiciones</td>
                <td>2-5 años</td>
                <td>500 – 3.000 €</td>
                <td>Funcionario de carrera</td>
              </tr>
              <tr>
                <td>🏅 Certificación Profesional</td>
                <td>Semanas-6 meses</td>
                <td>200 – 3.000 €</td>
                <td>Internacional/sectorial</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.guideSection}>
          <h2>Máster Universitario: ¿para quién es?</h2>
          <h3>Cuándo elegirlo</h3>
          <p>
            El máster universitario oficial es la opción más adecuada si tienes un grado universitario,
            buscas especializarte académicamente y el sector al que te diriges valora este tipo de credencial
            (empresa, finanzas, ingeniería, ciencias de la salud, comunicación...).
          </p>
          <h3>Claves a tener en cuenta</h3>
          <ul>
            <li>Acceso a programas de doctorado y carrera investigadora.</li>
            <li>Redes de contactos (networking) universitarias con valor a largo plazo.</li>
            <li>Los másteres habilitantes (arquitectura, medicina, psicología clínica) son requisito legal para ejercer.</li>
            <li>El precio varía enormemente: universidades públicas desde 1.500 €, privadas hasta 30.000 €.</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>FP de Grado Superior: formación práctica con alta empleabilidad</h2>
          <h3>Cuándo elegirla</h3>
          <p>
            La Formación Profesional es una opción infravalorada con una tasa de inserción laboral superior
            al 75 % en muchas familias profesionales. Es ideal si buscas formación práctica orientada
            al empleo, con costes bajos y titulación pública reconocida.
          </p>
          <h3>Ventajas clave</h3>
          <ul>
            <li>Las plazas públicas tienen coste muy reducido o gratuito.</li>
            <li>La FP Dual combina empresa y aula: muy valorada por los empleadores.</li>
            <li>Permite acceso directo a grados universitarios en muchos casos.</li>
            <li>Sectores con mayor demanda: sanidad, informática, energías renovables, logística.</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Bootcamp y formación online intensiva: velocidad al mercado</h2>
          <h3>Cuándo elegirlo</h3>
          <p>
            Los bootcamps son la opción más popular para quienes quieren entrar en tecnología o cambiar
            de sector en el menor tiempo posible. En 3-6 meses puedes aprender programación,
            ciberseguridad, diseño UX o análisis de datos con enfoque 100 % práctico.
          </p>
          <h3>Lo que debes valorar</h3>
          <ul>
            <li>El mercado es muy heterogéneo: investiga la tasa de inserción del bootcamp específico.</li>
            <li>Algunos están subvencionados por el SEPE o tienen financiación ISA (pagas al conseguir empleo).</li>
            <li>Las certificaciones de proveedores (AWS, Google, Microsoft) complementan muy bien el perfil.</li>
            <li>Sin experiencia previa en tech, combina bootcamp + proyecto personal en GitHub.</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Oposiciones: estabilidad a largo plazo</h2>
          <h3>Cuándo elegirlas</h3>
          <p>
            Si tu prioridad es la seguridad laboral, la conciliación y condiciones laborales estables,
            las oposiciones son la vía más sólida. Requieren una preparación exigente y constante
            de 2 a 5 años, pero el resultado es un empleo de por vida en la Administración Pública.
          </p>
          <h3>Tipos principales de oposiciones en España</h3>
          <ul>
            <li><strong>Cuerpos docentes</strong> (Maestros, Secundaria, FP): requieren máster de formación del profesorado.</li>
            <li><strong>Cuerpos de la Administración General del Estado</strong> (Hacienda, Interior, Justicia).</li>
            <li><strong>Administraciones autonómicas y locales</strong>: plazas más numerosas y próximas.</li>
            <li><strong>Cuerpos sanitarios</strong> (MIR, EIR, FIR): vías específicas muy competitivas.</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Certificaciones profesionales: validar habilidades con impacto inmediato</h2>
          <h3>Cuándo elegirlas</h3>
          <p>
            Si ya tienes experiencia laboral y quieres demostrar competencias concretas reconocidas
            internacionalmente, las certificaciones son la opción más eficiente. Son especialmente
            valiosas en tecnología, gestión de proyectos, finanzas y marketing digital.
          </p>
          <h3>Certificaciones más demandadas en España (2025)</h3>
          <ul>
            <li><strong>Tecnología</strong>: AWS Certified, Google Cloud, Microsoft Azure, CompTIA Security+.</li>
            <li><strong>Gestión de proyectos</strong>: PMP (PMI), PRINCE2, Scrum Master (PSM/CSM).</li>
            <li><strong>Finanzas</strong>: CFA, CPA, FRM.</li>
            <li><strong>Marketing digital</strong>: Google Ads, HubSpot, Meta Blueprint.</li>
            <li><strong>Idiomas</strong>: Cambridge, TOEFL, DELE (siempre un plus).</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-formacion-postgrado')} />
      <ShareCard appName="selector-formacion-postgrado" />
      <Footer appName="selector-formacion-postgrado" />
    </div>
  );
}
