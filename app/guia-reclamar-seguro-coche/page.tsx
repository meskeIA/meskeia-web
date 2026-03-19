'use client';

import { useState } from 'react';
import styles from './GuiaReclamarSeguroCoche.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de situaciones
type SituacionId = 'siniestro-menor' | 'averia-carretera' | 'bateria-garaje' | 'atropello-animal' | 'rotura-luna' | 'robo-vandalismo' | 'meteorologia';

interface Situacion {
  id: SituacionId;
  icon: string;
  titulo: string;
  descripcion: string;
  cobertura: string;
  requiereDenuncia: boolean;
  penalizaPrima: 'si' | 'no' | 'depende';
  pasosASeguir: string[];
  consejosClave: string[];
  preguntasAseguradora: string[];
}

const situaciones: Situacion[] = [
  {
    id: 'siniestro-menor',
    icon: '🚗',
    titulo: 'Siniestro menor (golpe, roce)',
    descripcion: 'Pequeños daños como golpes en parking, roces con otros vehículos o daños menores que no superan los 500-1.000€.',
    cobertura: 'Todo riesgo o Todo riesgo con franquicia',
    requiereDenuncia: false,
    penalizaPrima: 'si',
    pasosASeguir: [
      'Evalúa el coste aproximado de la reparación',
      'Compara con tu franquicia (si la tienes)',
      'Considera tu historial de siniestros reciente',
      'Llama a tu aseguradora para consultar SIN abrir parte',
      'Decide si compensa reclamar o pagar de tu bolsillo'
    ],
    consejosClave: [
      'Si la reparación cuesta menos que tu franquicia, NO reclames',
      'Si has tenido siniestros en los últimos 2 años, considera pagar tú',
      'Pide presupuesto en varios talleres antes de decidir',
      'Recuerda: cada siniestro puede subir tu prima un 10-30% al renovar'
    ],
    preguntasAseguradora: [
      '¿Cuánto me subiría la prima si declaro este siniestro?',
      '¿Puedo consultar sin que se abra parte?',
      '¿Tengo franquicia? ¿De cuánto?'
    ]
  },
  {
    id: 'averia-carretera',
    icon: '🛣️',
    titulo: 'Avería en carretera',
    descripcion: 'El coche se avería durante un viaje y necesitas asistencia: grúa, reparación in situ, vehículo de sustitución.',
    cobertura: 'Asistencia en viaje / Asistencia en carretera',
    requiereDenuncia: false,
    penalizaPrima: 'no',
    pasosASeguir: [
      'Ponte en lugar seguro (fuera de la calzada si es posible)',
      'Coloca los triángulos de emergencia',
      'Llama al teléfono de asistencia de tu seguro (está en la póliza)',
      'Indica tu ubicación exacta (usa el GPS del móvil)',
      'Espera a la grúa en lugar seguro'
    ],
    consejosClave: [
      'La asistencia en carretera NO suele penalizar tu prima',
      'Ten siempre el teléfono de asistencia guardado en el móvil',
      'Algunas pólizas incluyen taxi, hotel o coche de sustitución',
      'Verifica los kilómetros de cobertura de tu póliza'
    ],
    preguntasAseguradora: [
      '¿Hasta cuántos kilómetros me cubren la grúa?',
      '¿Tengo derecho a vehículo de sustitución?',
      '¿Cubre gastos de hotel si no puedo continuar viaje?'
    ]
  },
  {
    id: 'bateria-garaje',
    icon: '🔋',
    titulo: 'Batería agotada o avería en garaje',
    descripcion: 'El coche no arranca en tu garaje, parking de casa o trabajo. Necesitas asistencia sin estar en carretera.',
    cobertura: 'Asistencia kilómetro cero',
    requiereDenuncia: false,
    penalizaPrima: 'no',
    pasosASeguir: [
      'Verifica si tu póliza incluye "kilómetro cero"',
      'Llama al teléfono de asistencia',
      'Explica que estás en tu domicilio/garaje',
      'El mecánico intentará arrancar o llevará el coche al taller'
    ],
    consejosClave: [
      'NO todas las pólizas incluyen asistencia en kilómetro cero',
      'Esta cobertura es opcional en muchos seguros básicos',
      'Si no la tienes, deberás pagar la grúa de tu bolsillo',
      'Es muy útil si vives en ciudad y usas poco el coche'
    ],
    preguntasAseguradora: [
      '¿Mi póliza incluye asistencia en kilómetro cero?',
      '¿Cubre averías en mi domicilio o solo en vía pública?',
      '¿Tiene límite de usos al año?'
    ]
  },
  {
    id: 'atropello-animal',
    icon: '🦌',
    titulo: 'Atropello de animal (accidente cinegético)',
    descripcion: 'Colisión con un animal salvaje (jabalí, ciervo, etc.) que causa daños en el vehículo.',
    cobertura: 'Daños propios / Accidentes cinegéticos',
    requiereDenuncia: true,
    penalizaPrima: 'depende',
    pasosASeguir: [
      'Detente en lugar seguro si es posible',
      'Llama a la Guardia Civil o Policía Local (obligatorio)',
      'Presenta denuncia del atropello (imprescindible para el seguro)',
      'Fotografía los daños y el animal si es seguro hacerlo',
      'Contacta con tu aseguradora con el número de denuncia'
    ],
    consejosClave: [
      'SIN DENUNCIA POLICIAL el seguro NO cubrirá los daños',
      'Muchas pólizas cubren accidentes cinegéticos sin penalización',
      'En zonas con señalización de animales, la cobertura puede variar',
      'Si el animal tiene propietario (ganado), su seguro debe pagar'
    ],
    preguntasAseguradora: [
      '¿Tengo cobertura de accidentes cinegéticos?',
      '¿Este tipo de siniestro penaliza mi prima?',
      '¿Necesito alguna documentación adicional además de la denuncia?'
    ]
  },
  {
    id: 'rotura-luna',
    icon: '🪟',
    titulo: 'Rotura de luna (parabrisas, lateral, trasera)',
    descripcion: 'Rotura o grieta en cualquier cristal del vehículo por impacto de piedra, vandalismo u otras causas.',
    cobertura: 'Lunas / Cristales',
    requiereDenuncia: false,
    penalizaPrima: 'depende',
    pasosASeguir: [
      'Fotografía el daño antes de cualquier reparación',
      'Contacta con tu aseguradora para verificar cobertura',
      'Pregunta si tienen talleres concertados (suele ser más rápido)',
      'Decide entre reparar (si es pequeña grieta) o sustituir'
    ],
    consejosClave: [
      'Muchas pólizas NO penalizan la rotura de lunas',
      'Algunas incluyen lunas sin franquicia, otras con franquicia',
      'Reparar una grieta pequeña es más barato que sustituir',
      'Los talleres concertados suelen gestionar todo con el seguro'
    ],
    preguntasAseguradora: [
      '¿La rotura de lunas penaliza mi renovación?',
      '¿Tengo franquicia en lunas?',
      '¿Qué talleres tienen concertados cerca de mí?'
    ]
  },
  {
    id: 'robo-vandalismo',
    icon: '🔓',
    titulo: 'Robo o vandalismo',
    descripcion: 'Robo del vehículo, robo de objetos del interior, o daños por vandalismo (rayones, espejos rotos, etc.).',
    cobertura: 'Robo / Daños propios',
    requiereDenuncia: true,
    penalizaPrima: 'depende',
    pasosASeguir: [
      'Presenta denuncia en comisaría (obligatorio)',
      'Fotografía todos los daños visibles',
      'Haz inventario de objetos robados (si aplica)',
      'Contacta con la aseguradora con el número de denuncia',
      'Guarda facturas de objetos robados si las tienes'
    ],
    consejosClave: [
      'SIN DENUNCIA no hay cobertura',
      'Los objetos personales suelen tener límites de indemnización',
      'El robo total suele estar cubierto por valor venal o de mercado',
      'El vandalismo puede tener franquicia según la póliza'
    ],
    preguntasAseguradora: [
      '¿Qué límite tengo para objetos robados del interior?',
      '¿El vandalismo tiene franquicia?',
      '¿Cómo se calcula el valor si me roban el coche entero?'
    ]
  },
  {
    id: 'meteorologia',
    icon: '🌧️',
    titulo: 'Daños por fenómenos meteorológicos',
    descripcion: 'Daños causados por granizo, inundación, tormentas, caída de árboles u otros fenómenos atmosféricos.',
    cobertura: 'Fenómenos atmosféricos / Daños propios',
    requiereDenuncia: false,
    penalizaPrima: 'depende',
    pasosASeguir: [
      'Fotografía los daños lo antes posible',
      'No muevas el vehículo si hay daños estructurales graves',
      'Contacta con tu aseguradora',
      'En eventos masivos (DANA, granizadas), las aseguradoras suelen habilitar teléfonos especiales'
    ],
    consejosClave: [
      'El Consorcio de Compensación de Seguros cubre catástrofes extraordinarias',
      'Los daños por granizo NO siempre se consideran extraordinarios',
      'Verifica si tu póliza incluye fenómenos atmosféricos',
      'En inundaciones, no intentes arrancar el coche (daño mayor)'
    ],
    preguntasAseguradora: [
      '¿Mi póliza cubre fenómenos atmosféricos?',
      '¿Este evento está cubierto por el Consorcio?',
      '¿Cómo debo proceder si no puedo mover el coche?'
    ]
  }
];

// FAQ data
const faqData = [
  {
    pregunta: '¿Puedo consultar a mi aseguradora sin que me abran parte?',
    respuesta: 'Sí, la mayoría de aseguradoras permiten consultas informativas. Especifica claramente que solo quieres información y que NO deseas abrir parte todavía. Así podrás valorar si te compensa reclamar.'
  },
  {
    pregunta: '¿Cuánto puede subir mi prima si declaro un siniestro?',
    respuesta: 'Depende de la aseguradora y tu historial, pero las subidas típicas van del 10% al 30% en la renovación. Algunas compañías tienen sistemas de bonus-malus más agresivos que otras. Por eso es importante preguntar ANTES de decidir.'
  },
  {
    pregunta: '¿La asistencia en carretera cuenta como siniestro?',
    respuesta: 'No. La asistencia en carretera (grúa, batería, etc.) generalmente NO penaliza tu prima ni se considera siniestro a efectos de renovación. Es un servicio incluido en tu póliza.'
  },
  {
    pregunta: '¿Qué pasa si el culpable es otro conductor?',
    respuesta: 'Si NO eres culpable del siniestro, debes reclamar al seguro del otro conductor. En este caso, tu prima NO debería verse afectada. Tu aseguradora puede gestionar la reclamación por ti (convenio CICOS).'
  },
  {
    pregunta: '¿Tengo que aceptar el taller que me diga el seguro?',
    respuesta: 'No necesariamente. Tienes derecho a libre elección de taller, aunque si usas uno no concertado, la aseguradora puede aplicar límites en la indemnización. Consulta las condiciones de tu póliza.'
  }
];

export default function GuiaReclamarSeguroCochePage() {
  const [situacionActiva, setSituacionActiva] = useState<SituacionId | null>(null);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  const situacionSeleccionada = situaciones.find(s => s.id === situacionActiva);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🚗</span>
        <h1 className={styles.title}>¿Cuándo Reclamar al Seguro del Coche?</h1>
        <p className={styles.subtitle}>
          Guía completa para tomar decisiones informadas ante siniestros, averías y situaciones imprevistas
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Introducción */}
      <section className={styles.introSection}>
        <div className={styles.introCard}>
          <h2>🤔 El dilema del conductor</h2>
          <p>
            Ante un incidente con tu vehículo, surge la duda: <strong>¿reclamo al seguro o pago de mi bolsillo?</strong>
            La respuesta depende de muchos factores: tipo de incidente, coberturas contratadas, historial de siniestros
            y políticas de tu aseguradora.
          </p>
          <p>
            Esta guía te ayuda a entender <strong>qué preguntas hacerte</strong> y <strong>qué pasos seguir</strong> en cada situación.
            Recuerda: siempre puedes llamar a tu aseguradora para consultar SIN abrir parte.
          </p>
        </div>
      </section>

      {/* Selector de situaciones */}
      <section className={styles.situacionesSection}>
        <h2 className={styles.sectionTitle}>📋 Selecciona tu situación</h2>
        <p className={styles.sectionSubtitle}>Haz clic en la situación que mejor describe tu caso</p>

        <div className={styles.situacionesGrid}>
          {situaciones.map((situacion) => (
            <button
              key={situacion.id}
              className={`${styles.situacionCard} ${situacionActiva === situacion.id ? styles.situacionCardActiva : ''}`}
              onClick={() => setSituacionActiva(situacionActiva === situacion.id ? null : situacion.id)}
            >
              <span className={styles.situacionIcon}>{situacion.icon}</span>
              <h3 className={styles.situacionTitulo}>{situacion.titulo}</h3>
              <p className={styles.situacionDesc}>{situacion.descripcion}</p>
              <div className={styles.situacionBadges}>
                {situacion.requiereDenuncia && (
                  <span className={styles.badgeDenuncia}>Requiere denuncia</span>
                )}
                <span className={`${styles.badgePenaliza} ${styles[`penaliza${situacion.penalizaPrima}`]}`}>
                  {situacion.penalizaPrima === 'si' ? 'Penaliza prima' :
                   situacion.penalizaPrima === 'no' ? 'No penaliza' : 'Depende'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Detalle de situación seleccionada */}
      {situacionSeleccionada && (
        <section className={styles.detalleSection}>
          <div className={styles.detalleHeader}>
            <span className={styles.detalleIcon}>{situacionSeleccionada.icon}</span>
            <div>
              <h2 className={styles.detalleTitulo}>{situacionSeleccionada.titulo}</h2>
              <p className={styles.detalleCobertura}>
                <strong>Cobertura necesaria:</strong> {situacionSeleccionada.cobertura}
              </p>
            </div>
          </div>

          <div className={styles.detalleGrid}>
            {/* Pasos a seguir */}
            <div className={styles.detalleBloque}>
              <h3>📝 Pasos a seguir</h3>
              <ol className={styles.pasosList}>
                {situacionSeleccionada.pasosASeguir.map((paso, index) => (
                  <li key={index}>{paso}</li>
                ))}
              </ol>
            </div>

            {/* Consejos clave */}
            <div className={styles.detalleBloque}>
              <h3>💡 Consejos clave</h3>
              <ul className={styles.consejosList}>
                {situacionSeleccionada.consejosClave.map((consejo, index) => (
                  <li key={index}>{consejo}</li>
                ))}
              </ul>
            </div>

            {/* Preguntas para la aseguradora */}
            <div className={`${styles.detalleBloque} ${styles.preguntasBloque}`}>
              <h3>📞 Pregunta a tu aseguradora</h3>
              <ul className={styles.preguntasList}>
                {situacionSeleccionada.preguntasAseguradora.map((pregunta, index) => (
                  <li key={index}>{pregunta}</li>
                ))}
              </ul>
            </div>
          </div>

          {situacionSeleccionada.requiereDenuncia && (
            <div className={styles.alertaDenuncia}>
              <h4>⚠️ Importante: Denuncia obligatoria</h4>
              <p>
                Para este tipo de siniestro, <strong>es imprescindible presentar denuncia</strong> ante la Guardia Civil
                o Policía Local. Sin el número de denuncia, la aseguradora NO tramitará tu reclamación.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Factores a considerar */}
      <section className={styles.factoresSection}>
        <h2 className={styles.sectionTitle}>⚖️ Factores a considerar antes de reclamar</h2>

        <div className={styles.factoresGrid}>
          <div className={styles.factorCard}>
            <span className={styles.factorIcon}>💶</span>
            <h4>Coste de la reparación</h4>
            <p>¿Supera tu franquicia? Si no, no tiene sentido reclamar.</p>
          </div>
          <div className={styles.factorCard}>
            <span className={styles.factorIcon}>📜</span>
            <h4>Tipo de cobertura</h4>
            <p>¿Tienes todo riesgo, terceros ampliado o básico?</p>
          </div>
          <div className={styles.factorCard}>
            <span className={styles.factorIcon}>📊</span>
            <h4>Historial de siniestros</h4>
            <p>¿Has reclamado en los últimos 2-3 años?</p>
          </div>
          <div className={styles.factorCard}>
            <span className={styles.factorIcon}>⏳</span>
            <h4>Antigüedad de la póliza</h4>
            <p>Clientes fieles suelen tener mejor trato.</p>
          </div>
          <div className={styles.factorCard}>
            <span className={styles.factorIcon}>🚙</span>
            <h4>Valor del vehículo</h4>
            <p>En coches antiguos, la indemnización puede no compensar.</p>
          </div>
          <div className={styles.factorCard}>
            <span className={styles.factorIcon}>👤</span>
            <h4>Culpabilidad</h4>
            <p>Si no eres culpable, reclama al seguro contrario.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>❓ Preguntas frecuentes</h2>

        <div className={styles.faqGrid}>
          {faqData.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button
                className={styles.faqPregunta}
                onClick={() => setFaqAbierta(faqAbierta === index ? null : index)}
              >
                <span>{faq.pregunta}</span>
                <span className={styles.faqToggle}>{faqAbierta === index ? '−' : '+'}</span>
              </button>
              {faqAbierta === index && (
                <div className={styles.faqRespuesta}>
                  <p>{faq.respuesta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Consejo final */}
      <section className={styles.consejoFinal}>
        <div className={styles.consejoFinalCard}>
          <h2>📱 Consejo final</h2>
          <p className={styles.consejoDestacado}>
            <strong>Ante la duda, llama a tu aseguradora y pregunta ANTES de abrir parte.</strong>
          </p>
          <p>
            La mayoría de compañías permiten consultas informativas sin compromiso. Así podrás saber exactamente
            cómo afectaría a tu prima y tomar una decisión informada.
          </p>
          <p>
            Ten siempre guardado en tu móvil el teléfono de asistencia de tu seguro. En caso de emergencia,
            perder tiempo buscando el número puede ser muy estresante.
          </p>
        </div>
      </section>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="financial"
        severity="high"
        context="guia-reclamar-seguro-coche"
        collapsible={false}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor cómo funciona tu seguro de coche?"
        subtitle="Aprende qué coberturas tienes, cuándo reclamar y cómo hacerlo correctamente"
        icon="📚"
      >
        {/* Tabla comparativa */}
        <section className={styles.eduSection}>
          <h2>Comparativa de coberturas del seguro de coche</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Cobertura</th>
                  <th>Terceros básico</th>
                  <th>Terceros ampliado</th>
                  <th>Todo riesgo con franquicia</th>
                  <th>Todo riesgo sin franquicia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Daños a terceros</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Defensa jurídica</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Asistencia en carretera</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Robo del vehículo</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Daños propios (accidente)</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅ (franquicia)</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Fenómenos meteorológicos</td>
                  <td>❌</td>
                  <td>Depende</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Rotura de lunas</td>
                  <td>❌</td>
                  <td>Depende</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.eduSection}>
          <h2>Casos reales: cuándo reclamar y cuándo no</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🅿️</span>
                <span className={styles.casoTag}>Golpe en aparcamiento</span>
              </div>
              <p>Alguien te roza el coche en un parking y no deja nota. Daño estimado: 400 €. Con todo riesgo
              y franquicia de 300 €, solo ahorras 100 € pero pueden subir tu prima el año siguiente.
              Valora pagar de tu bolsillo si el coche es antiguo.</p>
              <div className={styles.casoResultado}>Recomendación: calcular coste total antes de abrir parte</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🌪️</span>
                <span className={styles.casoTag}>Granizo o tormenta</span>
              </div>
              <p>Una granizada destruye el capó y el techo del coche. Daño: 2.500 €. Este tipo de siniestro
              meteorológico generalmente NO penaliza en la prima, ya que no es imputable al conductor.
              Reclamar es claramente la mejor opción.</p>
              <div className={styles.casoResultado}>Reclamar siempre: no penaliza y el daño supera ampliamente la franquicia</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🚧</span>
                <span className={styles.casoTag}>Accidente con otro vehículo</span>
              </div>
              <p>Colisión en intersección con otro conductor que se da a la fuga. Sin testigos ni cámara.
              Si tienes todo riesgo, reclama a tu aseguradora. Con solo terceros, deberás reclamar al
              Consorcio de Compensación de Seguros si el culpable no está localizado.</p>
              <div className={styles.casoResultado}>Consorcio de Seguros cubre accidentes con vehículo sin identificar</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🦌</span>
                <span className={styles.casoTag}>Atropello de animal</span>
              </div>
              <p>Colisión con un jabalí en carretera de noche. Daño: 3.000 €. Requiere denuncia a la Guardia
              Civil de Tráfico para documentar el siniestro. Este tipo de accidente generalmente no penaliza
              en la prima ya que es un caso fortuito.</p>
              <div className={styles.casoResultado}>Imprescindible: atestado de Guardia Civil de Tráfico</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre reclamaciones al seguro</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Abrir parte siempre sube la prima del seguro?</h4>
              <p>Depende del tipo de siniestro y la aseguradora. Los siniestros en los que eres culpable (colisión
              por tu maniobra, golpe en parking) suelen penalizar. Los siniestros no culpables (granizo, robo,
              atropello de animales) generalmente no afectan o afectan menos a la prima.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el parte amistoso y cuándo debo usarlo?</h4>
              <p>El parte amistoso (ADCA) es un documento que ambos conductores rellenan y firman en el lugar del
              accidente para documentar los hechos. Se usa cuando hay daños materiales entre dos vehículos y
              acuerdo sobre lo ocurrido. Si hay heridos, llama al 112 y espera a la policía o guardia civil.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuánto tiempo tengo para comunicar un siniestro?</h4>
              <p>La Ley del Contrato de Seguro establece 7 días para comunicar el siniestro a la aseguradora.
              Algunas pólizas establecen plazos más breves. Notifica siempre lo antes posible, aunque no hayas
              decidido si reclamar, para preservar tu derecho.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué hago si no estoy de acuerdo con la valoración del perito?</h4>
              <p>Tienes derecho a solicitar un segundo peritaje a cargo de tu propio perito. Si las valoraciones
              difieren más de un 20%, se nombra un tercer perito dirimente. También puedes acudir a la Dirección
              General de Seguros (DGSFP) o al defensor del asegurado de la compañía.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué cubre el Consorcio de Compensación de Seguros?</h4>
              <p>El Consorcio cubre daños causados por: vehículos no identificados (daños personales), vehículos
              sin seguro, y fenómenos extraordinarios (inundaciones, terremotos, terrorismo). Es un organismo
              público que actúa cuando el seguro privado no puede hacerse cargo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo reclamar si el accidente fue en el extranjero?</h4>
              <p>Sí. La mayoría de seguros incluyen cobertura en la UE y países del Convenio Multilateral.
              Solicita un informe del accidente a las autoridades locales, guarda todos los documentos,
              y contacta a tu aseguradora desde el extranjero (el número suele estar en el dorso del carné de seguro).</p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo reclamar al seguro de coche: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Asegura la seguridad en el lugar del siniestro</strong>
                <p>Enciende las luces de emergencia, ponte el chaleco reflectante ANTES de salir del coche y
                coloca los triángulos. Si hay heridos, llama al 112 antes de cualquier gestión con el seguro.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Documenta el siniestro con fotos y datos</strong>
                <p>Fotografía los daños, la posición de los vehículos, la señalización del entorno y las matrículas.
                Anota datos del otro conductor, testigos y número de seguro del otro vehículo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Rellena el parte amistoso si procede</strong>
                <p>Si hay acuerdo entre los conductores y no hay heridos, rellena y firma el parte amistoso.
                Cada conductor se queda con una copia. No firmes si no estás de acuerdo con lo que figura.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Comunica el siniestro a tu aseguradora</strong>
                <p>Llama a tu compañía en las primeras horas. Proporciona todos los datos recogidos. La aseguradora
                te indicará si debes llevar el vehículo a un taller concertado o si puede venir un perito.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Espera la valoración del perito y revísala</strong>
                <p>El perito de la aseguradora valorará los daños. Revisa detalladamente el informe. Si hay daños
                no recogidos o la valoración parece baja, tienes derecho a solicitar tu propio perito.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Decide: acepta la oferta o reclama formalmente</strong>
                <p>Si la oferta es razonable, acepta y cierra el siniestro. Si no, presenta reclamación formal
                al Servicio de Atención al Cliente, luego a la DGSFP, y como último recurso, vía judicial
                o arbitraje de consumo.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <section className={styles.eduSection}>
          <h2>Consejos para gestionar mejor tu seguro de coche</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📱</span>
              <strong>Guarda el teléfono de siniestros</strong>
              <p>Ten el número de emergencias de tu aseguradora guardado en el móvil. En un accidente nocturno
              o en el extranjero, perder tiempo buscando el número es muy estresante.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📸</span>
              <strong>Fotografía siempre antes de mover</strong>
              <p>Nunca muevas el vehículo (salvo riesgo) sin documentar la posición. Una foto vale más que
              cualquier declaración verbal posterior en caso de disputa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧮</span>
              <strong>Calcula si compensa reclamar</strong>
              <p>Antes de abrir parte, estima el coste del siniestro, la franquicia y el posible aumento de prima
              el año siguiente. A veces es más barato pagar de bolsillo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📋</span>
              <strong>Guarda el parte amistoso relleno</strong>
              <p>Saca una foto al parte amistoso antes de separarte del otro conductor. Si hay disputa posterior,
              la foto del documento original puede ser determinante.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Notifica aunque no vayas a reclamar</strong>
              <p>Comunica siempre el siniestro en el plazo de 7 días aunque no decidas reclamar de inmediato.
              Preservas tu derecho a hacerlo posteriormente si los daños son mayores de lo esperado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <strong>Revisa tu póliza antes del siniestro</strong>
              <p>Conoce tu franquicia, tus coberturas y los talleres concertados antes de necesitarlos.
              Sorprenderse en el momento del accidente es la peor situación para tomar buenas decisiones.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes al reclamar al seguro de coche</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Mover el vehículo sin documentar:</strong> Si mueves el coche antes de fotografiar la posición de los vehículos, pierdes pruebas cruciales en caso de disputa sobre la culpabilidad.</li>
            <li><strong>Firmar el parte amistoso sin leerlo:</strong> Nunca firmes un parte amistoso si no estás de acuerdo con la descripción de los hechos. Una firma equivale a aceptar lo que figura en él.</li>
            <li><strong>No notificar en el plazo de 7 días:</strong> Aunque no decidas reclamar, notifica el siniestro a tu aseguradora dentro del plazo legal. Pasado ese plazo, puedes perder el derecho a reclamar.</li>
            <li><strong>Aceptar la primera oferta sin revisarla:</strong> La valoración inicial del perito de la aseguradora puede estar incompleta. Revísala detalladamente antes de aceptar y comparar con presupuestos de talleres.</li>
            <li><strong>Confundir tipos de cobertura:</strong> Un seguro de terceros no cubre daños propios, aunque el accidente sea culpa tuya. Verifica exactamente qué cubre tu póliza antes de reclamar para evitar sorpresas.</li>
            <li><strong>No pedir el atestado en accidentes con animales o fenómenos meteorológicos:</strong> Para estos siniestros, el documento de Guardia Civil de Tráfico o certificado de AEMET es indispensable para la reclamación.</li>
          </ul>
        </div>
      </EducationalSection>

      {/* Apps relacionadas */}
      <RelatedApps apps={getRelatedApps('guia-reclamar-seguro-coche')} />
      <ShareCard appName="guia-reclamar-seguro-coche" />
      <Footer appName="guia-reclamar-seguro-coche" />
    </div>
  );
}
