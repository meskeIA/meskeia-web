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
import styles from './SelectorModeloNegocio.module.css';

// =====================================================
// TIPOS
// =====================================================
type RecomendacionKey = 'fisica' | 'ecommerce' | 'servicios' | 'saas' | 'marketplace';

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
  ventajas: string[];
  desafios: string[];
  primerPaso: string;
}

// =====================================================
// DATOS: PREGUNTAS
// =====================================================
const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Tienes un producto físico o un servicio/conocimiento?',
    opciones: [
      { texto: 'Producto físico que fabrico o compro', pesos: { fisica: 3, ecommerce: 3 } },
      { texto: 'Producto digital que creo una vez y vendo muchas veces', pesos: { saas: 4 } },
      { texto: 'Conocimiento o habilidad que ofrezco directamente', pesos: { servicios: 4 } },
      { texto: 'Quiero conectar oferta y demanda ya existente', pesos: { marketplace: 4 } },
      { texto: 'Aún no lo tengo claro', pesos: { servicios: 2, ecommerce: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cuánto capital inicial puedes invertir?',
    opciones: [
      { texto: 'Menos de 5.000 €', pesos: { servicios: 4, saas: 3 } },
      { texto: 'Entre 5.000 € y 20.000 €', pesos: { ecommerce: 3, servicios: 2 } },
      { texto: 'Entre 20.000 € y 60.000 €', pesos: { fisica: 3, ecommerce: 3 } },
      { texto: 'Más de 60.000 €', pesos: { fisica: 4, marketplace: 3 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuánto tiempo puedes esperar hasta la primera venta o ingreso?',
    opciones: [
      { texto: 'Necesito ingresos en días o semanas', pesos: { servicios: 5 } },
      { texto: 'Puedo esperar entre 1 y 3 meses', pesos: { ecommerce: 3, saas: 2 } },
      { texto: 'Puedo esperar hasta 6 meses', pesos: { ecommerce: 3, saas: 3 } },
      { texto: 'Puedo esperar más de un año', pesos: { fisica: 3, marketplace: 3, saas: 3 } },
    ],
  },
  {
    id: 4,
    texto: '¿Cómo son tus habilidades técnicas digitales?',
    opciones: [
      { texto: 'Básicas, prefiero el trato presencial', pesos: { fisica: 4 } },
      { texto: 'Medias, sé usar herramientas estándar (Shopify, redes...)', pesos: { ecommerce: 3, servicios: 2 } },
      { texto: 'Altas, sé programar o diseñar aplicaciones', pesos: { saas: 4, ecommerce: 2 } },
      { texto: 'Muy altas, desarrollo tecnología propia', pesos: { saas: 5, marketplace: 3 } },
    ],
  },
  {
    id: 5,
    texto: '¿Qué escala quieres alcanzar?',
    opciones: [
      { texto: 'Negocio local y manejable, sin crecer demasiado', pesos: { fisica: 3, servicios: 2 } },
      { texto: 'Crecimiento moderado, equipo pequeño', pesos: { ecommerce: 3, servicios: 3 } },
      { texto: 'Escala nacional o europea', pesos: { ecommerce: 4, saas: 3 } },
      { texto: 'Escala global con posibilidad de inversión externa', pesos: { saas: 4, marketplace: 4 } },
    ],
  },
  {
    id: 6,
    texto: '¿Cómo prefieres relacionarte con tus clientes?',
    opciones: [
      { texto: 'Cara a cara, relación personal cercana', pesos: { fisica: 4, servicios: 3 } },
      { texto: 'Online, pero con contacto directo (email, videollamada)', pesos: { servicios: 3, ecommerce: 2 } },
      { texto: 'Principalmente automatizado, sin intervención manual', pesos: { saas: 4, ecommerce: 3 } },
      { texto: 'Intermediando entre dos grupos distintos de usuarios', pesos: { marketplace: 5 } },
    ],
  },
  {
    id: 7,
    texto: '¿Tienes experiencia o red de contactos en algún sector?',
    opciones: [
      { texto: 'Sí, tengo una red profesional sólida en mi campo', pesos: { servicios: 4 } },
      { texto: 'Sí, conozco bien un mercado local o nicho físico', pesos: { fisica: 3 } },
      { texto: 'Sí, tengo experiencia en tecnología o desarrollo', pesos: { saas: 3 } },
      { texto: 'Tengo experiencia en logística, distribución o retail', pesos: { ecommerce: 3 } },
      { texto: 'Empiezo desde cero sin red específica', pesos: { ecommerce: 2, servicios: 2 } },
    ],
  },
  {
    id: 8,
    texto: '¿Cómo gestionas el inventario o la producción?',
    opciones: [
      { texto: 'Quiero tener stock físico bajo mi control', pesos: { fisica: 3, ecommerce: 2 } },
      { texto: 'Prefiero dropshipping o fabricación bajo pedido', pesos: { ecommerce: 4 } },
      { texto: 'No quiero gestionar ningún inventario físico', pesos: { servicios: 4, saas: 5 } },
      { texto: 'Quiero gestionar el inventario o catálogo de terceros', pesos: { marketplace: 4 } },
    ],
  },
  {
    id: 9,
    texto: '¿Qué tipo de cliente objetivo tienes en mente?',
    opciones: [
      { texto: 'Consumidor final local (B2C local)', pesos: { fisica: 4 } },
      { texto: 'Consumidor final online, sin límite geográfico (B2C online)', pesos: { ecommerce: 4 } },
      { texto: 'Empresas o profesionales (B2B)', pesos: { servicios: 4, saas: 3 } },
      { texto: 'Ambos lados de un mercado (compradores y vendedores)', pesos: { marketplace: 4 } },
    ],
  },
  {
    id: 10,
    texto: '¿Buscas ingresos recurrentes (suscripción) o por transacción?',
    opciones: [
      { texto: 'Ingresos por transacción puntual', pesos: { fisica: 3, ecommerce: 3 } },
      { texto: 'Ingresos recurrentes, cuota mensual o anual', pesos: { saas: 5 } },
      { texto: 'Comisión por transacciones entre terceros', pesos: { marketplace: 4 } },
      { texto: 'Por proyecto o consultoría cerrada', pesos: { servicios: 4 } },
    ],
  },
];

// =====================================================
// DATOS: RECOMENDACIONES
// =====================================================
const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  fisica: {
    key: 'fisica',
    icono: '🏪',
    titulo: 'Tienda o Negocio Físico',
    subtitulo: 'Relación directa, producto tangible, ubicación clave',
    descripcion:
      'Tu perfil encaja con un negocio físico: tienda, taller, restaurante, centro de servicios... La cercanía con el cliente es tu ventaja competitiva. Necesitas una ubicación estratégica y una inversión inicial sólida, pero la rentabilidad en sectores tradicionales está ampliamente probada.',
    ventajas: [
      'Confianza y relación directa con el cliente',
      'Experiencia de compra difícil de replicar online',
      'Ingresos desde el primer día si hay demanda local',
      'Menor dependencia de algoritmos o plataformas',
    ],
    desafios: [
      'Alta inversión inicial (local, reformas, stock)',
      'Escalabilidad limitada por la geografía',
      'Costes fijos elevados (alquiler, personal)',
      'Competencia del comercio online',
    ],
    primerPaso:
      'Valida la demanda local antes de firmar ningún contrato de alquiler. Habla con al menos 20 clientes potenciales de la zona y analiza la competencia existente en un radio de 500 metros.',
  },
  ecommerce: {
    key: 'ecommerce',
    icono: '🛒',
    titulo: 'Tienda Online / E-commerce',
    subtitulo: 'Alcance global, menos costes fijos, escalable',
    descripcion:
      'Tu perfil apunta a una tienda online. El e-commerce te permite llegar a clientes de toda España o el mundo con costes fijos menores que un local físico. La clave está en encontrar un producto diferenciado, dominar la logística y construir visibilidad SEO o en marketplaces como Amazon.',
    ventajas: [
      'Mercado potencial sin límite geográfico',
      'Costes fijos menores que el comercio físico',
      'Posibilidad de automatizar con dropshipping',
      'Escalable con la demanda',
    ],
    desafios: [
      'Alta competencia en la mayoría de categorías',
      'Dependencia de SEO, SEM o marketplaces para captar tráfico',
      'Gestión de devoluciones y logística',
      'Construir confianza online lleva tiempo',
    ],
    primerPaso:
      'Antes de crear la tienda, valida el producto con una campaña de anuncios pequeña (50-100 €) o vendiendo en Wallapop/eBay/Amazon. Comprueba que la demanda existe y que puedes competir en precio y diferenciación.',
  },
  servicios: {
    key: 'servicios',
    icono: '💼',
    titulo: 'Servicios y Consultoría',
    subtitulo: 'Inicio rápido, sin inventario, alta rentabilidad marginal',
    descripcion:
      'Tu perfil encaja con un negocio de servicios o consultoría. Es el modelo que permite generar ingresos más rápido porque no necesitas stock ni desarrollo previo: vendes tu conocimiento, habilidad o tiempo. Ideal para profesionales con experiencia que quieren independizarse.',
    ventajas: [
      'Primeros ingresos posibles en días o semanas',
      'Sin inversión en inventario ni desarrollo de producto',
      'Alta rentabilidad marginal por proyecto',
      'Red de contactos preexistente como ventaja inicial',
    ],
    desafios: [
      'Escalabilidad limitada por las horas disponibles',
      'Dependencia de la captación constante de clientes',
      'Ingresos irregulares sin cartera consolidada',
      'Necesidad de diferenciarte de la competencia',
    ],
    primerPaso:
      'Identifica los 3 problemas concretos que resuelves mejor que nadie en tu sector. Contacta a 10 personas de tu red que podrían necesitar ese servicio y ofrece una sesión gratuita inicial para validar la propuesta de valor.',
  },
  saas: {
    key: 'saas',
    icono: '💻',
    titulo: 'Producto Digital / SaaS',
    subtitulo: 'Altamente escalable, ingresos recurrentes, margen alto',
    descripcion:
      'Tu perfil apunta a un producto digital o SaaS (Software as a Service). Se construye una vez y se vende indefinidamente. Los ingresos recurrentes por suscripción crean previsibilidad financiera y el margen mejora con cada nuevo cliente. Requiere habilidades técnicas o inversión en desarrollo.',
    ventajas: [
      'Ingresos recurrentes y predecibles (MRR)',
      'Escala sin aumentar costes proporcionalmente',
      'Margen muy alto una vez amortizado el desarrollo',
      'Posibilidad de captar inversión externa',
    ],
    desafios: [
      'Desarrollo inicial costoso y largo (3-12 meses)',
      'Requiere habilidades técnicas o equipo de desarrollo',
      'El tiempo hasta los primeros ingresos es elevado',
      'Soporte técnico y actualizaciones continuas',
    ],
    primerPaso:
      'No empieces a programar. Crea primero un MVP no-code (Notion, Airtable, formularios) o incluso un servicio manual que simule el producto. Consigue 10 clientes de pago antes de invertir en desarrollo real.',
  },
  marketplace: {
    key: 'marketplace',
    icono: '🔗',
    titulo: 'Marketplace o Plataforma',
    subtitulo: 'Conecta oferta y demanda, comisiones sin stock',
    descripcion:
      'Tu perfil apunta a crear un marketplace: una plataforma que conecta a compradores y vendedores, o a dos grupos complementarios. No necesitas gestionar inventario ni prestar el servicio directamente. Cobras comisión por cada transacción. Es el modelo más complejo de arrancar (requiere atraer ambos lados), pero el más escalable si funciona.',
    ventajas: [
      'Sin stock ni producción propia',
      'Ingresos crecen con el volumen de transacciones',
      'Efecto red: más usuarios = más valor',
      'Muy escalable a nivel global',
    ],
    desafios: [
      'El problema del huevo y la gallina al arrancar',
      'Alta inversión inicial en tecnología y marketing',
      'Requiere masa crítica de usuarios para ser útil',
      'Largo camino hasta la rentabilidad',
    ],
    primerPaso:
      'Empieza por un único nicho muy específico y una sola ciudad o comunidad. Capta primero la oferta (vendedores, prestadores) manualmente antes de abrir a compradores. La versión 1.0 puede ser un simple grupo de WhatsApp o una hoja de cálculo.',
  },
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================
export default function SelectorModeloNegocioPage() {
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaSeleccionada = respuestas[preguntaActual] ?? -1;
  const progresoPorc = mostrarResultado
    ? 100
    : Math.round((preguntaActual / totalPreguntas) * 100);

  // Calcular puntuaciones
  function calcularRecomendacion(): RecomendacionKey {
    const puntos: Record<RecomendacionKey, number> = {
      fisica: 0,
      ecommerce: 0,
      servicios: 0,
      saas: 0,
      marketplace: 0,
    };

    PREGUNTAS.forEach((p, idx) => {
      const idxRespuesta = respuestas[idx];
      if (idxRespuesta === undefined) return;
      const opcion = p.opciones[idxRespuesta];
      if (!opcion) return;
      (Object.keys(opcion.pesos) as RecomendacionKey[]).forEach((k) => {
        puntos[k] += opcion.pesos[k] ?? 0;
      });
    });

    return (Object.keys(puntos) as RecomendacionKey[]).reduce((a, b) =>
      puntos[a] >= puntos[b] ? a : b
    );
  }

  function seleccionarOpcion(idx: number) {
    setRespuestas((prev) => ({ ...prev, [preguntaActual]: idx }));
  }

  function irAnterior() {
    if (preguntaActual > 0) setPreguntaActual((p) => p - 1);
  }

  function irSiguiente() {
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((p) => p + 1);
    }
  }

  function mostrarResultados() {
    setMostrarResultado(true);
  }

  function reiniciar() {
    setPreguntaActual(0);
    setRespuestas({});
    setMostrarResultado(false);
  }

  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const haRespondidoTodas =
    Object.keys(respuestas).length === totalPreguntas;

  const clave = mostrarResultado ? calcularRecomendacion() : null;
  const resultado = clave ? RECOMENDACIONES[clave] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          ¿Qué modelo de negocio te conviene?
        </h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir si tu perfil encaja mejor con
          una tienda física, e-commerce, servicios, SaaS o marketplace.
        </p>
      </header>

      <LegalNotice />

      {/* ---- TEST ---- */}
      {!mostrarResultado && (
        <main className={styles.testSection} aria-label="Test de modelo de negocio">
          {/* Progreso */}
          <div className={styles.progreso}>
            <div className={styles.progresoLabel}>
              <span>Pregunta {preguntaActual + 1} de {totalPreguntas}</span>
              <span>{progresoPorc}%</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-valuenow={progresoPorc}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso del test"
            >
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoPorc}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>
              Pregunta {pregunta.id}
            </p>
            <p className={styles.preguntaTexto}>{pregunta.texto}</p>

            <div className={styles.opciones} role="group" aria-label={pregunta.texto}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcionBtn}${respuestaSeleccionada === idx ? ` ${styles.selected}` : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={respuestaSeleccionada === idx ? true : false}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-label="Ir a la pregunta anterior"
            >
              ← Anterior
            </button>

            {!esUltimaPregunta && (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={respuestaSeleccionada === -1}
                aria-label="Ir a la siguiente pregunta"
              >
                Siguiente →
              </button>
            )}

            {esUltimaPregunta && (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={mostrarResultados}
                disabled={!haRespondidoTodas}
                aria-label="Ver mi recomendación de modelo de negocio"
              >
                Ver mi resultado
              </button>
            )}
          </div>
        </main>
      )}

      {/* ---- RESULTADO ---- */}
      {mostrarResultado && resultado && (
        <section
          className={styles.resultadoSection}
          aria-label="Tu recomendación de modelo de negocio"
        >
          {/* Tarjeta principal */}
          <div
            className={`${styles.resultadoCard} ${styles[`recomendacion_${resultado.key}`]}`}
          >
            <span className={styles.recomendacionIcono} aria-hidden="true">
              {resultado.icono}
            </span>
            <h2 className={styles.recomendacionTitulo}>{resultado.titulo}</h2>
            <p className={styles.recomendacionSubtitulo}>{resultado.subtitulo}</p>
            <p className={styles.recomendacionDesc}>{resultado.descripcion}</p>
          </div>

          {/* Ventajas y desafíos */}
          <div className={styles.caracteristicasGrid}>
            <div className={styles.caracteristicaCard}>
              <h4>Ventajas clave</h4>
              <ul>
                {resultado.ventajas.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
            <div className={styles.caracteristicaCard}>
              <h4>Desafíos a tener en cuenta</h4>
              <ul>
                {resultado.desafios.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Primer paso */}
          <div className={styles.primerPasoCard}>
            <h4>Tu primer paso concreto</h4>
            <p>{resultado.primerPaso}</p>
          </div>

          {/* Reiniciar */}
          <button
            type="button"
            className={styles.btnReiniciar}
            onClick={reiniciar}
            aria-label="Repetir el test de modelo de negocio"
          >
            Repetir el test
          </button>
        </section>
      )}

      {/* ---- DISCLAIMER ---- */}
      <DisclaimerCard variant="general" severity="medium" />

      {/* ---- SECCIÓN EDUCATIVA ---- */}
      <EducationalSection
        title="Modelos de negocio: claves para elegir el tuyo"
        subtitle="Comparativa de los 5 modelos más comunes para emprendedores"
      >
        <h3>Los 5 modelos en un vistazo</h3>
        <p>
          No existe un modelo de negocio universalmente superior. Cada uno tiene
          ventajas y restricciones que lo hacen más o menos adecuado según tu
          capital, habilidades y tolerancia al riesgo.
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: '#fff' }}>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Modelo</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Capital inicial</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Tiempo al mercado</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Escalabilidad</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['🏪 Tienda física', 'Alto (20k–100k €)', '1–6 meses', 'Limitada (local)'],
              ['🛒 E-commerce', 'Medio (2k–30k €)', '1–3 meses', 'Alta (nacional/global)'],
              ['💼 Servicios', 'Bajo (0–5k €)', 'Días–semanas', 'Media (por horas)'],
              ['💻 SaaS/Digital', 'Alto (desarrollo)', '6–18 meses', 'Muy alta'],
              ['🔗 Marketplace', 'Alto (plataforma)', '6–24 meses', 'Muy alta (efecto red)'],
            ].map(([modelo, capital, tiempo, escala], i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-primary)',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }}>{modelo}</td>
                <td style={{ padding: '0.55rem 0.75rem' }}>{capital}</td>
                <td style={{ padding: '0.55rem 0.75rem' }}>{tiempo}</td>
                <td style={{ padding: '0.55rem 0.75rem' }}>{escala}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Qué es el Product-Market Fit y por qué importa más que el modelo</h3>
        <p>
          El <strong>Product-Market Fit (PMF)</strong> es el momento en que tu oferta
          encaja tan bien con las necesidades del mercado que los propios clientes te
          recomiendan sin que tú se lo pidas. Ningún modelo de negocio por sí solo
          garantiza el éxito: es el PMF el que determina si un negocio prospera o fracasa.
        </p>
        <p>
          Puedes tener la tecnología perfecta (SaaS), la mejor ubicación (tienda física)
          o la red de contactos más amplia (consultoría) y aun así fracasar si no has
          identificado un problema real que los clientes quieran resolver y estén dispuestos
          a pagar por ello.
        </p>

        <div className={styles.warningBox}>
          <strong>Ningún modelo de negocio garantiza el éxito.</strong> La validación con
          clientes reales antes de invertir capital es el paso más importante que cualquier
          emprendedor puede dar. Habla con 10–20 personas que representen a tu cliente ideal
          antes de gastar el primer euro en infraestructura.
        </div>

        <h3>El MVP: cómo probar antes de comprometer recursos</h3>
        <p>
          Un <strong>Producto Mínimo Viable (MVP)</strong> es la versión más simple de tu
          idea que permite aprender si existe demanda real. No es el producto final, ni
          tiene que estar terminado ni ser bonito. Su única función es generar aprendizaje.
        </p>
        <ul>
          <li>
            <strong>Tienda física:</strong> Antes de alquilar local, monta un puesto en un
            mercadillo o feria local para validar demanda y precio.
          </li>
          <li>
            <strong>E-commerce:</strong> Vende primero en Wallapop, Vinted o Amazon para
            probar el producto sin necesidad de crear una tienda propia.
          </li>
          <li>
            <strong>Servicios:</strong> Ofrece tu servicio a precio reducido o gratuito a
            los primeros 3 clientes para construir casos de éxito y referencias.
          </li>
          <li>
            <strong>SaaS:</strong> Crea el flujo con herramientas no-code (Airtable,
            Notion, Typeform) antes de escribir una línea de código.
          </li>
          <li>
            <strong>Marketplace:</strong> Empieza con un grupo de WhatsApp o un Excel
            compartido entre compradores y vendedores de un nicho muy concreto.
          </li>
        </ul>

        <h3>Errores más comunes al elegir un modelo de negocio</h3>
        <ol>
          <li>
            <strong>Copiar el modelo de otro sin entender el contexto:</strong> Muchos
            emprendedores replican modelos de éxito sin considerar que las condiciones
            (capital, equipo, mercado, momento) son distintas.
          </li>
          <li>
            <strong>Elegir el modelo "más cool" en lugar del más adecuado:</strong> El
            SaaS y el marketplace son los modelos que más titulares generan, pero
            requieren capacidades técnicas y financieras que muchos emprendedores no tienen.
          </li>
          <li>
            <strong>No validar antes de invertir:</strong> Invertir en local, web, stock
            o desarrollo antes de confirmar que hay demanda real es el error más costoso
            y frecuente.
          </li>
          <li>
            <strong>Subestimar la captación de clientes:</strong> El modelo de negocio
            define cómo generas valor, pero no cómo llegas al cliente. La adquisición
            de clientes (SEO, publicidad, red comercial) requiere un plan propio.
          </li>
          <li>
            <strong>No considerar el tiempo hasta los primeros ingresos:</strong> Si
            necesitas ingresos en 30 días, un SaaS o un marketplace son caminos
            inadecuados. La sostenibilidad personal es una restricción de diseño.
          </li>
        </ol>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-modelo-negocio')} />
      <ShareCard appName="selector-modelo-negocio" />
      <Footer appName="selector-modelo-negocio" />
    </div>
  );
}
