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
import { calcularResultado, FORMACIONES, LABELS, CON_ARTICULO, PREGUNTAS } from './motor';

// Las preguntas con sus pesos, las fichas de cada vía y la lógica viven en ./motor.ts.

/** Lista legible: «A, B y C». */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

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

  const calculo = paso === 'resultado' ? calcularResultado(respuestas) : null;
  const resultado = calculo ? FORMACIONES[calculo.tipo] : null;
  const puntuaciones = calculo ? calculo.puntos : null;
  const maxPuntuacion = puntuaciones
    ? Math.max(...(Object.values(puntuaciones) as number[]))
    : 1;

  // La comparativa usa el MISMO orden que elige la ganadora: antes un `sort` estable repetía
  // en la lista el sesgo del objeto (a igualdad de puntos, siempre el máster primero).
  const alternativasOrdenadas = calculo && puntuaciones
    ? calculo.orden.map((tipo) => [tipo, puntuaciones[tipo]] as const)
    : [];

  // Preguntas respondidas: las anteriores y, si ya se ha marcado, la actual.
  const respondidas = preguntaActual + (opcionSeleccionada >= 0 ? 1 : 0);
  const progresoPct = (respondidas / totalPreguntas) * 100;

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
            {/* Lo anunciado y lo pintado van sobre la misma escala: preguntas RESPONDIDAS.
                aria-valuenow era el número de pregunta con mínimo 1 mientras el relleno cuenta
                también la actual en cuanto se marca, así que un lector de pantalla anunciaba
                otra fracción que la que se veía (selector-smartphone, hallazgo 951). */}
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-label={`Pregunta ${preguntaActual + 1} de ${totalPreguntas}`}
              aria-valuenow={respondidas}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${preguntaActual + 1} de ${totalPreguntas}`}
            >
              <div
                className={styles.progresoFill}
                data-progreso={progresoPct}
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
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                  // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                  // radio dentro (selector-smartphone, hallazgo 950).
                  role="radio"
                  aria-checked={opcionSeleccionada === idx}
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
      {paso === 'resultado' && calculo && resultado && puntuaciones && (
        <section className={styles.resultado} aria-label="Tu recomendación de formación">
          <div className={styles.resultadoCard}>
            <div className={styles.resultadoBadge} aria-label="Tu recomendación principal">
              <span aria-hidden="true">✨</span> Tu formación recomendada
            </div>
            <span className={styles.resultadoIcono} aria-hidden="true">{resultado.icono}</span>
            <h2 className={styles.resultadoTitulo}>{resultado.titulo}</h2>
            <p className={styles.resultadoDescripcion}>{resultado.descripcion}</p>

            {/* Un empate no se resuelve en silencio por el orden del objeto: antes lo ganaba
                siempre el máster, que era el primero. */}
            {calculo.empatadas.length > 0 && (
              <p className={styles.avisoEmpate} role="note">
                <span aria-hidden="true">⚖️</span> Empate: con tus respuestas,{' '}
                {enumerar([calculo.tipo, ...calculo.empatadas].map((k) => CON_ARTICULO[k]))}{' '}
                encajan exactamente igual; {calculo.criterioDesempate}.
              </p>
            )}

            {/* Por qué: las respuestas que más han sumado. La descripción de cada vía afirmaba
                cosas del usuario que no dependían de lo que había contestado («Tienes
                experiencia laboral…» a quien había marcado «Sin experiencia»). */}
            <div className={styles.razones}>
              <h3>Por qué esta recomendación</h3>
              <ul>
                {calculo.razones.map((razon) => (
                  <li key={razon}>{razon}</li>
                ))}
              </ul>
            </div>

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
                <span aria-hidden="true">🔄</span> Repetir el test
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Guía completa de formación postgrado en España"
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
                <td><span aria-hidden="true">🎓</span> Máster Universitario</td>
                <td>1-2 años</td>
                <td>3.000 – 30.000 €</td>
                <td>Oficial universitario</td>
              </tr>
              <tr>
                <td><span aria-hidden="true">🔧</span> FP Grado Superior</td>
                <td>1-2 años</td>
                <td>0 – 2.000 €</td>
                <td>Técnico Superior</td>
              </tr>
              <tr>
                <td><span aria-hidden="true">💻</span> Bootcamp / Online</td>
                <td>3-6 meses</td>
                <td>2.000 – 12.000 €</td>
                <td>Certificado propio</td>
              </tr>
              <tr>
                <td><span aria-hidden="true">🏛️</span> Oposiciones</td>
                <td>2-5 años</td>
                <td>500 – 3.000 €</td>
                <td>Funcionario de carrera</td>
              </tr>
              <tr>
                <td><span aria-hidden="true">🏅</span> Certificación Profesional</td>
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
