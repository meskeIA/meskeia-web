'use client';

import { useState } from 'react';
import styles from './GuiaSeguroViaje.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  DisclaimerCard,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ZonaDestino = 'europa' | 'mundo' | 'riesgo';
type TipoViaje = 'turismo' | 'aventura' | 'negocio' | 'larga';
type NivelCobertura = 'imprescindible' | 'recomendable' | 'opcional';

interface Cobertura {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  nota: string;
  getNivel: (zona: ZonaDestino, tipo: TipoViaje) => NivelCobertura;
}

type CoberturaActiva = Omit<Cobertura, 'getNivel'> & { nivel: NivelCobertura };

interface ItemChecklist {
  id: string;
  texto: string;
  detalle: string;
}

const ORDEN_NIVEL: Record<NivelCobertura, number> = {
  imprescindible: 0,
  recomendable: 1,
  opcional: 2,
};

const NIVEL_LABEL: Record<NivelCobertura, string> = {
  imprescindible: 'Imprescindible',
  recomendable: 'Recomendable',
  opcional: 'Opcional',
};

const COBERTURAS: Cobertura[] = [
  {
    id: 'medicos',
    nombre: 'Gastos médicos',
    icono: '🏥',
    descripcion: 'Hospitalización, urgencias, cirugía y medicación en el destino. Complemento esencial a la TSJE fuera de la UE.',
    nota: 'Mínimos recomendados: UE 30.000 €, resto del mundo 50.000 €, EEUU/Canadá/Japón 150.000 €. Los precios hospitalarios en EEUU pueden superar 10.000 $/día.',
    getNivel: (zona, tipo) => {
      if (zona === 'europa' && tipo === 'turismo') return 'recomendable';
      if (zona === 'europa') return 'recomendable';
      return 'imprescindible';
    },
  },
  {
    id: 'repatriacion',
    nombre: 'Repatriación sanitaria',
    icono: '✈️',
    descripcion: 'Traslado médico en ambulancia aérea al país de origen en caso de enfermedad grave o fallecimiento.',
    nota: 'Sin seguro puede costar 20.000–80.000 €. La TSJE no la cubre. Verifica que incluya "avión medicalizado", no solo "traslado sanitario".',
    getNivel: (zona, tipo) => {
      if (zona === 'europa' && tipo === 'turismo') return 'recomendable';
      return 'imprescindible';
    },
  },
  {
    id: 'deportes',
    nombre: 'Deportes y actividades de riesgo',
    icono: '🏄',
    descripcion: 'Cubre accidentes durante senderismo, esquí, surf, buceo, ciclismo de montaña y actividades similares.',
    nota: 'La mayoría de seguros básicos excluyen deportes de riesgo. Senderismo por encima de 3.000 m, ciclismo de montaña y buceo suelen requerir cobertura específica.',
    getNivel: (zona, tipo) => {
      if (tipo === 'aventura') return 'imprescindible';
      return 'opcional';
    },
  },
  {
    id: 'cancelacion',
    nombre: 'Cancelación del viaje',
    icono: '🚫',
    descripcion: 'Reembolso de gastos no recuperables si cancelas por enfermedad, fallecimiento familiar u otras causas cubiertas.',
    nota: '"Cancelación por cualquier motivo" es más cara pero cubre causas laborales y personales. La básica solo cubre enfermedad grave o fallecimiento de familiar directo.',
    getNivel: (zona, tipo) => {
      if (zona === 'riesgo') return 'imprescindible';
      if (zona === 'mundo' || tipo === 'larga' || tipo === 'negocio') return 'recomendable';
      return 'opcional';
    },
  },
  {
    id: 'equipaje',
    nombre: 'Equipaje y efectos personales',
    icono: '🧳',
    descripcion: 'Cubre pérdida, robo o daño del equipaje facturado y objetos personales durante el viaje.',
    nota: 'Los límites globales suelen ser bajos (600–1.500 €). Electrónica, joyas y dinero tienen sublímites o están excluidos. Comprueba si tu tarjeta de crédito ya lo cubre.',
    getNivel: (zona, tipo) => {
      if (zona === 'europa' && tipo === 'turismo') return 'opcional';
      return 'recomendable';
    },
  },
  {
    id: 'civil',
    nombre: 'Responsabilidad civil',
    icono: '⚖️',
    descripcion: 'Cubre daños accidentales a terceras personas o propiedades que causes durante el viaje.',
    nota: 'Especialmente útil en deportes de riesgo, alquiler de vehículos o estancias largas. Verifica si tu seguro del hogar ya incluye responsabilidad civil fuera de España.',
    getNivel: (zona, tipo) => {
      if (tipo === 'aventura' || tipo === 'larga' || tipo === 'negocio') return 'recomendable';
      if (zona === 'mundo' || zona === 'riesgo') return 'recomendable';
      return 'opcional';
    },
  },
  {
    id: 'accidentes',
    nombre: 'Accidentes personales',
    icono: '🩹',
    descripcion: 'Indemnización por muerte o invalidez permanente a consecuencia de un accidente durante el viaje.',
    nota: 'Especialmente relevante en deportes de aventura y viajes de negocios. Comprueba si tu seguro de vida ya cubre accidentes en el extranjero.',
    getNivel: (zona, tipo) => {
      if (tipo === 'aventura') return 'imprescindible';
      if (tipo === 'negocio' || zona === 'riesgo') return 'recomendable';
      return 'opcional';
    },
  },
  {
    id: 'juridica',
    nombre: 'Asistencia jurídica',
    icono: '📋',
    descripcion: 'Asesoría legal, fianza y gastos judiciales ante conflictos legales, accidentes de tráfico o detención en el extranjero.',
    nota: 'Muy recomendable en estancias largas, viajes de negocios o países con sistemas legales complejos. Puede incluir intérprete.',
    getNivel: (zona, tipo) => {
      if (zona === 'riesgo' || tipo === 'larga' || tipo === 'negocio') return 'recomendable';
      return 'opcional';
    },
  },
];

const CHECKLIST: ItemChecklist[] = [
  {
    id: 'limite-medico',
    texto: 'El límite de gastos médicos es suficiente para el destino',
    detalle: 'UE: mínimo 30.000 €. Resto del mundo: 50.000 €. EEUU, Canadá, Japón: mínimo 150.000 €.',
  },
  {
    id: 'repatriacion-aerea',
    texto: 'Incluye repatriación en avión medicalizado',
    detalle: 'No basta con "traslado sanitario". Confirma que cubre el vuelo en ambulancia aérea si es necesario.',
  },
  {
    id: 'covid',
    texto: 'Cubre enfermedades infecciosas y pandemias',
    detalle: 'Muchas pólizas antiguas las excluyen. Verifica que COVID-19 y otras enfermedades infecciosas están incluidas.',
  },
  {
    id: 'actividades',
    texto: 'Las actividades que vas a hacer están cubiertas',
    detalle: 'Comprueba el listado exacto. Senderismo, esquí, buceo y ciclismo de montaña suelen requerir cobertura específica.',
  },
  {
    id: 'preexistentes',
    texto: 'Tus condiciones médicas preexistentes están cubiertas',
    detalle: 'La mayoría excluye enfermedades previas salvo declaración expresa. Decláralo al contratar para evitar que rechacen el siniestro.',
  },
  {
    id: 'franquicia',
    texto: 'Conoces la franquicia y puedes asumirla',
    detalle: 'Es el importe que pagas de tu bolsillo antes de que el seguro cubra. A mayor franquicia, menor prima anual.',
  },
  {
    id: 'cancelacion-causas',
    texto: 'Las causas de cancelación cubren tus riesgos reales',
    detalle: '"Cancelación básica" solo cubre enfermedad grave o fallecimiento familiar. "Por cualquier motivo" es más cara pero mucho más flexible.',
  },
  {
    id: 'asistencia-24h',
    texto: 'Tiene central de asistencia 24h en español',
    detalle: 'Apunta el número internacional antes de salir. En urgencias llamas directamente a ellos, no a tu agencia de viajes.',
  },
  {
    id: 'destino',
    texto: 'El destino concreto está incluido en la cobertura',
    detalle: 'Algunos países en conflicto o zonas específicas están excluidos. Verifica el listado de territorios cubiertos en las condiciones generales.',
  },
  {
    id: 'equipaje-limite',
    texto: 'El límite de equipaje cubre lo que llevas',
    detalle: 'Los límites globales suelen ser 600–1.500 €. Si llevas equipamiento electrónico caro, busca pólizas con sublímites más altos.',
  },
  {
    id: 'tarjeta',
    texto: 'Has comprobado si tu tarjeta de crédito ya incluye cobertura',
    detalle: 'Muchas Visa/Mastercard Gold y premium incluyen cobertura básica de equipaje y accidentes. Evita pagar dos veces por lo mismo.',
  },
  {
    id: 'carencias',
    texto: 'No hay periodos de carencia que afecten a tu viaje',
    detalle: 'Los seguros anuales pueden tener carencias para cancelación. Los seguros por viaje puntual normalmente no las tienen.',
  },
];

const ZONAS: { id: ZonaDestino; label: string; icono: string; detalle: string }[] = [
  { id: 'europa', label: 'Europa / Schengen', icono: '🇪🇺', detalle: 'UE, EEE, Suiza, Reino Unido' },
  { id: 'mundo', label: 'Resto del mundo', icono: '🌍', detalle: 'América, Asia, África, Oceanía' },
  { id: 'riesgo', label: 'Zona de conflicto / alerta', icono: '⚠️', detalle: 'Países con alerta del MAEC' },
];

const TIPOS: { id: TipoViaje; label: string; icono: string }[] = [
  { id: 'turismo', label: 'Turismo / vacaciones', icono: '🏖️' },
  { id: 'aventura', label: 'Aventura / deportes', icono: '🧗' },
  { id: 'negocio', label: 'Viaje de negocios', icono: '💼' },
  { id: 'larga', label: 'Estancia larga (+30 días)', icono: '📅' },
];

export default function GuiaSeguroViaje() {
  const [zona, setZona] = useState<ZonaDestino | null>(null);
  const [tipo, setTipo] = useState<TipoViaje | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notasAbiertas, setNotasAbiertas] = useState<Set<string>>(new Set());

  const coberturasFiltradas: CoberturaActiva[] | null =
    zona !== null && tipo !== null
      ? COBERTURAS
          .map(({ getNivel, ...rest }) => ({ ...rest, nivel: getNivel(zona, tipo) }))
          .sort((a, b) => ORDEN_NIVEL[a.nivel] - ORDEN_NIVEL[b.nivel])
      : null;

  const toggleChecked = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleNota = (id: string) => {
    setNotasAbiertas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const imprescindibles = coberturasFiltradas?.filter(c => c.nivel === 'imprescindible').length ?? 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitulo}>Guía de Seguro de Viaje</h1>
        <p className={styles.heroSubtitulo}>
          ¿Qué cobertura necesitas según tu destino? Selecciona tu viaje y obtén recomendaciones personalizadas
          junto con un checklist completo antes de contratar.
        </p>
      </header>

      <div className={styles.wrapper}>
        <LegalNotice />

        {/* ── Selector ─────────────────────────────────────── */}
        <section className={styles.selectorSection}>
          <div className={styles.selectorBloque}>
            <h2 className={styles.selectorTitulo}>¿A dónde viajas?</h2>
            <div className={styles.opcionesGrid}>
              {ZONAS.map(z => (
                <button
                  key={z.id}
                  onClick={() => setZona(z.id)}
                  className={`${styles.opcionBtn} ${zona === z.id ? styles.opcionActiva : ''}`}
                  aria-pressed={zona === z.id}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{z.icono}</span>
                  <span className={styles.opcionLabel}>{z.label}</span>
                  <span className={styles.opcionDetalle}>{z.detalle}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.selectorBloque}>
            <h2 className={styles.selectorTitulo}>¿Qué tipo de viaje?</h2>
            <div className={styles.opcionesGrid}>
              {TIPOS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTipo(t.id)}
                  className={`${styles.opcionBtn} ${tipo === t.id ? styles.opcionActiva : ''}`}
                  aria-pressed={tipo === t.id}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{t.icono}</span>
                  <span className={styles.opcionLabel}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Resultados ───────────────────────────────────── */}
        {coberturasFiltradas === null ? (
          <div className={styles.placeholder} role="status">
            <span aria-hidden="true">☝️</span>
            <p>Selecciona tu destino y tipo de viaje para ver las coberturas recomendadas.</p>
          </div>
        ) : (
          <section className={styles.resultSection}>
            <div className={styles.resultHeader}>
              <h2 className={styles.seccionTitulo}>Coberturas recomendadas</h2>
              {imprescindibles > 0 && (
                <span className={styles.alertaImprescindible} role="note">
                  {imprescindibles} coberturas imprescindibles para tu viaje
                </span>
              )}
            </div>

            {zona === 'europa' && (
              <div className={styles.tsjeInfo} role="note">
                <span aria-hidden="true">💡</span>
                <div>
                  <strong>Recuerda solicitar tu TSJE gratis</strong> — La Tarjeta Sanitaria Europea cubre
                  urgencias en la sanidad pública de la UE. Solicítala en el INSS o la app{' '}
                  <em>Carpeta Ciudadana</em> antes de salir.
                </div>
              </div>
            )}

            <div className={styles.coberturasGrid}>
              {coberturasFiltradas.map(c => (
                <div
                  key={c.id}
                  className={`${styles.coberturaCard} ${styles[`nivel${c.nivel.charAt(0).toUpperCase() + c.nivel.slice(1)}`]}`}
                >
                  <div className={styles.coberturaHead}>
                    <span className={styles.coberturaIcono} aria-hidden="true">{c.icono}</span>
                    <div>
                      <span className={`${styles.nivelBadge} ${styles[`badge${c.nivel.charAt(0).toUpperCase() + c.nivel.slice(1)}`]}`}>
                        {NIVEL_LABEL[c.nivel]}
                      </span>
                      <h3 className={styles.coberturaNombre}>{c.nombre}</h3>
                    </div>
                  </div>
                  <p className={styles.coberturaDesc}>{c.descripcion}</p>
                  <button
                    className={styles.notaToggle}
                    onClick={() => toggleNota(c.id)}
                    aria-expanded={notasAbiertas.has(c.id)}
                  >
                    {notasAbiertas.has(c.id) ? '▲ Ocultar detalle' : '▼ Ver detalle'}
                  </button>
                  {notasAbiertas.has(c.id) && (
                    <p className={styles.coberturaNota}>{c.nota}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Checklist ────────────────────────────────────── */}
        <section className={styles.checklistSection}>
          <div className={styles.checklistHeader}>
            <h2 className={styles.seccionTitulo}>
              Checklist antes de contratar
            </h2>
            {checked.size > 0 && (
              <span className={styles.checkProgreso} role="status">
                {checked.size}/{CHECKLIST.length} verificados
              </span>
            )}
          </div>
          <p className={styles.checklistIntro}>
            Verifica estos puntos en las condiciones generales de cualquier póliza antes de confirmar la compra.
          </p>

          <div className={styles.checklistItems}>
            {CHECKLIST.map(item => (
              <div
                key={item.id}
                className={`${styles.checkItem} ${checked.has(item.id) ? styles.checkItemDone : ''}`}
              >
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    onChange={() => toggleChecked(item.id)}
                    className={styles.checkInput}
                    aria-describedby={`detalle-${item.id}`}
                  />
                  <span className={`${styles.checkBox} ${checked.has(item.id) ? styles.checkBoxDone : ''}`} aria-hidden="true">
                    {checked.has(item.id) ? '✓' : ''}
                  </span>
                  <span className={styles.checkTexto}>{item.texto}</span>
                </label>
                <p id={`detalle-${item.id}`} className={styles.checkDetalle}>{item.detalle}</p>
              </div>
            ))}
          </div>

          {checked.size === CHECKLIST.length && (
            <p className={styles.checklistCompleto} role="status">
              ✅ ¡Checklist completo! Has verificado todos los puntos clave antes de contratar.
            </p>
          )}
        </section>

        {/* ── Disclaimer ───────────────────────────────────── */}
        <DisclaimerCard variant="general" severity="high">
          <p>
            <strong>Esta guía es orientativa e informativa.</strong> Las recomendaciones se basan
            en criterios generales y pueden no reflejar el contenido exacto de una póliza concreta.
          </p>
          <ul>
            <li><strong>✗ NO es asesoramiento de seguros</strong> personalizado</li>
            <li>Lee siempre las condiciones generales y particulares antes de contratar</li>
            <li>Consulta con un corredor de seguros o compara en plataformas especializadas</li>
          </ul>
          <p>
            meskeIA no asume ninguna responsabilidad por decisiones de contratación de seguros
            tomadas en base a esta guía, ni por un uso inadecuado de la misma.
          </p>
        </DisclaimerCard>

        {/* ── Contenido educativo ──────────────────────────── */}
        <EducationalSection
          title="¿Quieres entender mejor los seguros de viaje?"
          subtitle="TSJE, tipos de pólizas, exclusiones frecuentes y glosario"
          icon="🎓"
        >
          <section>
            <h2>¿Qué es la TSJE y qué cubre realmente?</h2>
            <p>
              La Tarjeta Sanitaria Europea (TSJE) o Tarjeta de Seguro de Enfermedad (TASE) permite
              recibir asistencia sanitaria <strong>pública y de urgencias</strong> en cualquier país
              de la Unión Europea, el Espacio Económico Europeo y Suiza, en las mismas condiciones
              que los ciudadanos del país visitado.
            </p>
            <p><strong>Lo que NO cubre la TSJE:</strong></p>
            <ul>
              <li>Repatriación ni traslado sanitario a España</li>
              <li>Asistencia en clínicas privadas</li>
              <li>Países fuera de la UE/EEE</li>
              <li>Turismo sanitario (no es para tratamientos programados)</li>
              <li>Cancelación del viaje ni pérdida de equipaje</li>
            </ul>
            <p>
              Solicítala gratuitamente en el INSS, en tu mutua de trabajo, o a través de la app
              <em> Carpeta Ciudadana</em>. La fecha de caducidad viene impresa en la propia tarjeta;
              compruébala antes de viajar.
            </p>
          </section>

          <section>
            <h2>Tipos de seguro de viaje</h2>
            <ul>
              <li>
                <strong>Por viaje puntual:</strong> cubre un único viaje con fechas definidas.
                Ideal si viajas 1-2 veces al año.
              </li>
              <li>
                <strong>Anual multiviaje:</strong> cubre todos los viajes en un año hasta X días
                por viaje (normalmente 30-90 días). Rentable si viajas más de 3 veces al año.
              </li>
              <li>
                <strong>Solo cancelación:</strong> sin asistencia médica. Útil si tienes seguro
                médico internacional propio.
              </li>
              <li>
                <strong>Incluido en tarjeta de crédito:</strong> algunas tarjetas Gold y premium
                incluyen cobertura básica de accidentes y equipaje. Revisa las condiciones.
              </li>
              <li>
                <strong>Seguro de estudiante internacional:</strong> para estancias largas de
                estudio. Suele ser más económico que el turístico.
              </li>
            </ul>
          </section>

          <section>
            <h2>Exclusiones más frecuentes</h2>
            <ul>
              <li>Deportes de riesgo no declarados o no incluidos en la póliza</li>
              <li>Enfermedades preexistentes no declaradas al contratar</li>
              <li>Conflictos bélicos o zonas con alerta de viaje del MAEC</li>
              <li>Objetos dejados sin vigilancia (equipaje no supervisado)</li>
              <li>Conducción sin carnet válido o bajo efectos de alcohol/drogas</li>
              <li>Viajes a países sancionados internacionalmente</li>
              <li>Embarazos a partir de la semana 28-32 (varía por póliza)</li>
            </ul>
          </section>

          <section>
            <h2>Glosario básico</h2>
            <ul>
              <li><strong>Franquicia:</strong> importe que pagas tú antes de que el seguro empiece a cubrir.</li>
              <li><strong>Sublímite:</strong> límite específico para una categoría dentro del límite global (ej: máximo 300 € en electrónica dentro de un límite total de equipaje de 1.500 €).</li>
              <li><strong>Carencia:</strong> periodo desde la contratación hasta que una cobertura entra en vigor.</li>
              <li><strong>Prima:</strong> precio que pagas por el seguro.</li>
              <li><strong>Siniestro:</strong> el evento que activa la cobertura (accidente, robo, cancelación...).</li>
              <li><strong>Repatriación:</strong> traslado del asegurado (vivo o fallecido) a su país de origen.</li>
              <li><strong>MAEC:</strong> Ministerio de Asuntos Exteriores. Publica alertas y recomendaciones de viaje por países.</li>
            </ul>
          </section>

          {/* ── Tabla comparativa de coberturas ── */}
          <section>
            <h2>Tabla comparativa de coberturas principales</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Cobertura</th>
                    <th>Qué cubre</th>
                    <th>Límite póliza básica</th>
                    <th>Cuándo es imprescindible</th>
                    <th>Excluido habitualmente</th>
                    <th>Coste añadido aprox.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Cancelación del viaje</strong></td>
                    <td>Reembolso de gastos no recuperables si cancelas por causas cubiertas</td>
                    <td>Hasta el coste total del viaje</td>
                    <td>Viajes caros, destinos de riesgo, estancias largas</td>
                    <td>Cancelación por miedo, cambios laborales voluntarios, pandemias declaradas</td>
                    <td>+15–30 € por viaje</td>
                  </tr>
                  <tr>
                    <td><strong>Asistencia médica en viaje</strong></td>
                    <td>Hospitalización, urgencias, cirugía y medicación en el destino</td>
                    <td>30.000–50.000 €</td>
                    <td>Viajes fuera de la UE, especialmente EE.UU., Canadá o Japón</td>
                    <td>Enfermedades preexistentes no declaradas, tratamientos estéticos</td>
                    <td>Incluida en la mayoría de pólizas básicas</td>
                  </tr>
                  <tr>
                    <td><strong>Equipaje y pertenencias</strong></td>
                    <td>Pérdida, robo o daño del equipaje facturado y objetos personales</td>
                    <td>600–1.500 €</td>
                    <td>Viajes largos, equipamiento tecnológico o deportivo valioso</td>
                    <td>Dinero en efectivo, joyas, objetos dejados sin vigilancia</td>
                    <td>+5–15 € por viaje</td>
                  </tr>
                  <tr>
                    <td><strong>Responsabilidad civil</strong></td>
                    <td>Daños accidentales a terceras personas o propiedades durante el viaje</td>
                    <td>150.000–300.000 €</td>
                    <td>Deportes de riesgo, alquiler de vehículos, estancias largas</td>
                    <td>Daños intencionados, actividades profesionales, vehículos propios</td>
                    <td>+5–10 € por viaje</td>
                  </tr>
                  <tr>
                    <td><strong>Repatriación</strong></td>
                    <td>Traslado médico en ambulancia aérea al país de origen en caso grave</td>
                    <td>Sin límite habitual en pólizas completas</td>
                    <td>Cualquier viaje fuera de la UE; muy recomendable en Europa también</td>
                    <td>Traslados no médicamente necesarios, viajes de regreso normales</td>
                    <td>Incluida en la mayoría de pólizas básicas</td>
                  </tr>
                  <tr>
                    <td><strong>Accidentes personales</strong></td>
                    <td>Indemnización por muerte o invalidez permanente por accidente en viaje</td>
                    <td>6.000–30.000 €</td>
                    <td>Deportes de aventura, viajes de negocios frecuentes</td>
                    <td>Enfermedades (no accidentes), autolesiones, actividades excluidas</td>
                    <td>+5–20 € por viaje</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Casos de uso ── */}
          <section>
            <h2>Casos de uso más habituales</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧‍👦</span>
                  <strong>Familia viajando a EE.UU. o Canadá</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Una visita hospitalaria de urgencias en Estados Unidos puede superar fácilmente los 10.000 $ por noche.
                  Sin seguro médico, una familia puede quedar expuesta a deudas millonarias.
                </p>
                <p className={styles.escenarioTip}>
                  Imprescindible: cobertura médica mínima de 500.000 € por persona, repatriación en avión medicalizado
                  y asistencia 24h en español. No viajes a Norteamérica sin seguro completo.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                  <strong>Mochilero con viaje largo de 3+ meses</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Un viaje de varios meses por Asia, América Latina u Oceanía combina múltiples destinos,
                  actividades de aventura y riesgo de enfermedades tropicales.
                </p>
                <p className={styles.escenarioTip}>
                  Busca pólizas específicas para backpackers con cobertura de actividades de aventura,
                  enfermedades tropicales y posibilidad de ampliar el seguro sin volver a España.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                  <strong>Viajero de negocios con vuelos frecuentes</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Viajes frecuentes a múltiples destinos con equipamiento tecnológico valioso (portátil,
                  cámara, dispositivos) y agenda apretada donde cualquier retraso supone coste económico.
                </p>
                <p className={styles.escenarioTip}>
                  Un seguro anual multiviaje resulta más económico. Prioriza cobertura de equipaje con
                  sublímite alto para electrónica, asistencia jurídica y retrasos de vuelo con indemnización.
                </p>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🇪🇺</span>
                  <strong>Viajero europeo dentro de la UE</strong>
                </div>
                <p className={styles.escenarioExample}>
                  La Tarjeta Sanitaria Europea (TSJE) cubre urgencias en la sanidad pública de cualquier
                  país de la UE y el EEE, lo que reduce significativamente el riesgo médico básico.
                </p>
                <p className={styles.escenarioTip}>
                  Con la TSJE, una póliza básica de cancelación y equipaje puede ser suficiente para
                  turismo europeo estándar. Añade cobertura médica privada si buscas más comodidad o viajas con frecuencia.
                </p>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section>
            <h2>Preguntas frecuentes sobre seguros de viaje</h2>
            <dl className={styles.faqList}>
              <div className={styles.faqItem}>
                <dt><strong>¿La Tarjeta Sanitaria Europea cubre todos los gastos médicos?</strong></dt>
                <dd>
                  No. La TSJE cubre únicamente la asistencia sanitaria pública de urgencias en países de la UE,
                  EEE y Suiza. No cubre clínicas privadas, repatriación, países fuera de la UE ni cancelación
                  del viaje. Es un complemento útil, pero no un sustituto del seguro de viaje.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt><strong>¿Qué seguro necesito para viajar a EE.UU.?</strong></dt>
                <dd>
                  Una cobertura médica mínima recomendada de 250.000 USD por persona (o equivalente en euros),
                  aunque muchos expertos aconsejan 500.000 USD o cobertura ilimitada, además de
                  repatriación en avión medicalizado y asistencia 24h. Los costes hospitalarios en EE.UU.
                  pueden ser devastadores sin seguro: una noche en UCI puede superar los 50.000 $.
                  <span className={styles.faqTip}>Algunas visas de EE.UU. exigen demostrar seguro médico suficiente.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt><strong>¿El seguro del banco o tarjeta de crédito cubre el viaje?</strong></dt>
                <dd>
                  Depende del tipo de tarjeta. Las tarjetas Gold y premium suelen incluir cobertura básica
                  de accidentes y equipaje, pero los límites son bajos y las exclusiones, abundantes.
                  Revisa las condiciones generales de tu tarjeta antes de asumir que estás cubierto.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt><strong>¿Qué pasa si tengo una enfermedad preexistente?</strong></dt>
                <dd>
                  Debes declararla al contratar el seguro. Si no lo haces y sufres una complicación
                  relacionada con esa enfermedad, la aseguradora puede negarse a pagar. Muchas pólizas
                  ofrecen cobertura con declaración previa, aunque el precio puede ser mayor.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt><strong>¿Cuándo debo contratar el seguro de viaje?</strong></dt>
                <dd>
                  Nada más reservar el vuelo o la primera parte del viaje. Si lo contratas en ese momento,
                  la cobertura de cancelación entra en vigor desde el primer día. Si esperas a días antes
                  de salir, no estarás cubierto si surgen imprevistos antes de la salida.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt><strong>¿Cubre el seguro si cancelo por miedo al COVID o una pandemia?</strong></dt>
                <dd>
                  En general, no. El miedo no es una causa de cancelación cubierta. La cancelación por
                  COVID solo está cubierta si tú mismo (o un familiar directo) es diagnosticado y no puede
                  viajar. Los seguros de "cancelación por cualquier motivo" son más caros pero más flexibles.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt><strong>¿Qué documentación necesito para reclamar al seguro?</strong></dt>
                <dd>
                  Guarda todos los tickets y facturas médicas originales, el informe médico en el idioma
                  local (si es posible, con traducción), el número de referencia del siniestro que te
                  facilite la central de asistencia y cualquier denuncia policial en caso de robo o pérdida.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt><strong>¿Merece la pena el seguro para un viaje dentro de España?</strong></dt>
                <dd>
                  Para viajes nacionales la cobertura sanitaria pública española es suficiente para urgencias
                  médicas. Sin embargo, un seguro de cancelación puede ser útil si tienes vuelos y hoteles
                  no reembolsables. Valora el coste del seguro frente al importe no recuperable del viaje.
                </dd>
              </div>
            </dl>
          </section>

          {/* ── Guía paso a paso ── */}
          <section>
            <h2>Cómo elegir tu seguro de viaje: guía paso a paso</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div className={styles.stepContent}>
                  <strong>Identifica el destino y la duración del viaje</strong>
                  <p>El país de destino y el número de días determinan el tipo de póliza y los límites mínimos recomendados. Un fin de semana en Portugal no requiere lo mismo que tres semanas en Japón.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}>
                  <strong>Comprueba si la TSJE cubre el destino</strong>
                  <p>Si viajas dentro de la UE, el EEE o Suiza, solicita tu Tarjeta Sanitaria Europea gratis en el INSS o la app Carpeta Ciudadana. Recuerda que no cubre repatriación ni clínicas privadas.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div className={styles.stepContent}>
                  <strong>Evalúa la cobertura médica necesaria según el destino</strong>
                  <p>Para EE.UU. y Canadá, el mínimo recomendado es 500.000 € por persona. Para el resto del mundo fuera de la UE, 50.000–150.000 €. Para Europa con TSJE, un complemento de 30.000 € puede ser suficiente.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <div className={styles.stepContent}>
                  <strong>Revisa si tu tarjeta de crédito incluye cobertura</strong>
                  <p>Las tarjetas Gold y premium incluyen a veces cobertura básica de equipaje y accidentes. Consulta las condiciones y evita pagar dos veces por coberturas que ya tienes.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">5</span>
                <div className={styles.stepContent}>
                  <strong>Compara al menos 3 pólizas de diferentes aseguradoras</strong>
                  <p>Usa comparadores especializados (Acierto, Rastreator, iSEGURO) y compara no solo el precio, sino los límites de cobertura, la franquicia y la calidad del servicio de asistencia 24h.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">6</span>
                <div className={styles.stepContent}>
                  <strong>Lee las exclusiones detalladamente</strong>
                  <p>Presta especial atención a deportes excluidos, enfermedades preexistentes, zonas geográficas no cubiertas y causas de cancelación. Las exclusiones son donde más difieren las pólizas.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">7</span>
                <div className={styles.stepContent}>
                  <strong>Contrata antes de salir y guarda copia en el móvil</strong>
                  <p>Una vez contratado, guarda el número de asistencia 24h en el móvil y en papel, y envía una copia de la póliza a un familiar. En urgencias, llama a la central de asistencia antes de ir al hospital.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* ── Mejores prácticas ── */}
          <section>
            <h2>Consejos para sacar el máximo partido a tu seguro</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📅</span>
                <div>
                  <strong>Contrata nada más reservar el vuelo</strong>
                  <p>La cobertura de cancelación solo protege eventos ocurridos después de contratar el seguro. Si esperas, quedas expuesto desde el momento de la reserva hasta la contratación.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📱</span>
                <div>
                  <strong>Guarda el número de emergencias en el móvil</strong>
                  <p>El número internacional de asistencia 24h debe estar en tus contactos antes de salir. En una urgencia real no tendrás tiempo de buscar la póliza impresa.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📸</span>
                <div>
                  <strong>Haz fotos del equipaje antes de facturar</strong>
                  <p>Una fotografía del contenido de la maleta y del equipaje cerrado es la mejor prueba documental en caso de reclamación por pérdida o daño. Guárdala en la nube.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📋</span>
                <div>
                  <strong>Declara las enfermedades preexistentes</strong>
                  <p>No declararlas puede anular toda la póliza ante un siniestro relacionado. La mayoría de aseguradoras ofrecen cobertura si se declara al contratar, aunque el precio puede ser algo mayor.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧾</span>
                <div>
                  <strong>Conserva todos los tickets y facturas médicas</strong>
                  <p>Sin documentación no hay reclamación. Guarda todos los justificantes médicos, facturas, informes y denuncias policiales en caso de robo. Solicita copia de todo en el hospital.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
                <div>
                  <strong>Verifica que la cobertura médica sea suficiente</strong>
                  <p>Para destinos lejanos como EE.UU., Asia o África, comprueba que la cobertura médica sea mínimo 300.000 €. Para EE.UU. específicamente, los expertos recomiendan 500.000 € o más.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Warning Box ── */}
          <div className={styles.warningBox} role="note">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores frecuentes que pueden dejarte sin cobertura</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Asumir que la TSJE cubre todos los países:</strong> la Tarjeta Sanitaria Europea solo es válida en la UE y el Espacio Económico Europeo. Fuera de esos territorios no tiene ninguna validez.</li>
              <li><strong>Contratar el seguro después de un incidente:</strong> si ya ha ocurrido el problema (enfermedad, cancelación, accidente), la póliza no cubrirá ese evento aunque lo contrates el mismo día.</li>
              <li><strong>No leer las exclusiones:</strong> las actividades de aventura (esquí, buceo, senderismo de montaña, quad) suelen estar excluidas en las pólizas básicas. Comprueba el listado exacto antes de firmar.</li>
              <li><strong>Confiar solo en el seguro de la tarjeta de crédito:</strong> los seguros incluidos en tarjetas suelen tener límites muy bajos y numerosas exclusiones. Verifica siempre las coberturas reales antes de asumir que estás protegido.</li>
              <li><strong>No declarar enfermedades previas:</strong> ocultar condiciones médicas al contratar no solo puede invalidar esa cobertura concreta, sino anular toda la póliza si la aseguradora acredita mala fe.</li>
              <li><strong>Esperar a llegar al destino para contratar:</strong> si ocurre un incidente en el vuelo de ida (pérdida de equipaje, accidente en tránsito, cancelación de vuelo), no estarás cubierto si aún no habías contratado el seguro.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-seguro-viaje')} />
        <ShareCard appName="guia-seguro-viaje" />
      <Footer appName="guia-seguro-viaje" />
      </div>
    </div>
  );
}
