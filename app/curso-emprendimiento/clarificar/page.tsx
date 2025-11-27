'use client';

import Link from 'next/link';
import ChapterPage from '../ChapterPage';
import styles from '../CursoEmprendimiento.module.css';

const sections = [
  {
    title: 'El Concepto de "Fit" Estratégico',
    icon: '🧩',
    content: (
      <>
        <p>Una estrategia es solo un eslogan bonito. Una estrategia que impulse actividades clave específicas crea una empresa sostenible y exitosa. El <strong>"fit"</strong> es la visión integral donde todo lo que tu empresa hace tiene un propósito y se refuerza mutuamente.</p>

        <div className={styles.highlightBox}>
          <p><strong>Ejemplo IKEA:</strong> Salas de exposición → enfoque de moda → muebles modulares → marca global. Cada eslabón es necesario para el éxito total.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Business Model Canvas',
    icon: '🎨',
    content: (
      <>
        <h3>Lado Cliente y Oferta</h3>

        <h4>Propuesta de Valor</h4>
        <p>Lote de productos/servicios que crean valor para segmentos específicos. Incluye: Producto total + aumentos (servicio, diseño, marca, precio).</p>
        <div className={styles.highlightBox}>
          <p><strong>Ejemplo Ryanair:</strong> Vuelos baratos + tarifas claras + puntualidad + rutas directas. <strong>Excluye:</strong> Comidas gratis, asientos premium, entretenimiento.</p>
        </div>

        <h4>Segmentos de Clientes</h4>
        <p>Grupos diferentes si necesitan producto distinto, poder de negociación diferente, o canales diferentes.</p>

        <h4>Canales</h4>
        <p>Funciones: Publicidad, evaluación, adquisición, soporte post-venta.</p>

        <h4>Relaciones con Clientes</h4>
        <p>Tipos: Asistencia personal, autoservicio, servicios automatizados, comunidades.</p>

        <h3>Infraestructura y Finanzas</h3>
        <ul>
          <li><strong>Recursos Clave:</strong> Físicos, financieros, intelectuales, humanos</li>
          <li><strong>Actividades Clave:</strong> Las cosas más importantes que tu empresa debe HACER</li>
          <li><strong>Socios Clave:</strong> Proveedores, alianzas estratégicas, joint ventures</li>
          <li><strong>Estructura de Costes:</strong> Alineados con infraestructura y estrategia</li>
          <li><strong>Fuentes de Ingresos:</strong> ¿Qué están dispuestos a pagar los clientes?</li>
        </ul>

        <p style={{ marginTop: '1rem' }}>
          <Link href="/curso-emprendimiento/herramientas/business-model-canvas" className={styles.ctaButton} style={{ display: 'inline-flex' }}>
            🎨 Crear mi Business Model Canvas
          </Link>
        </p>
      </>
    ),
  },
  {
    title: 'Desarrollando tu Elevator Pitch',
    icon: '🎤',
    content: (
      <>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💉</div>
            <div className={styles.exampleName}>BioNTech</div>
            <div className={styles.exampleDesc}>"Usamos la tecnología que cura el cáncer para crear vacunas rápidas contra pandemias"</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🛵</div>
            <div className={styles.exampleName}>Glovo</div>
            <div className={styles.exampleDesc}>"Tu comprador personal que te trae cualquier cosa de tu ciudad en menos de 30 minutos"</div>
          </div>
        </div>

        <h3>Elementos Clave</h3>
        <ul>
          <li><strong>Historia corta:</strong> Aspectos fundamentales de quién eres</li>
          <li><strong>Comprensible:</strong> Para casi cualquiera</li>
          <li><strong>Identidad estratégica:</strong> Consistencia interna fuerte</li>
          <li><strong>Patrón del modelo:</strong> Freemium, marketplace, suscripción</li>
        </ul>

        <div className={styles.highlightBox}>
          <p><strong>Nunca digas:</strong> "No tenemos competencia" (Error fatal). Entiende tu entorno competitivo y ventaja sostenible.</p>
        </div>

        <p style={{ marginTop: '1rem' }}>
          <Link href="/curso-emprendimiento/herramientas/elevator-pitch" className={styles.ctaButton} style={{ display: 'inline-flex' }}>
            🎤 Crear mi Elevator Pitch
          </Link>
        </p>
      </>
    ),
  },
  {
    title: 'Empezar Hoy',
    icon: '🚀',
    content: (
      <>
        <h3>Próximas 24 horas</h3>
        <ul>
          <li>Dibuja tu modelo de negocio en 1 página (usa el Canvas o hazlo simple)</li>
          <li>Escribe tu elevator pitch y crónometralo: ¿30 segundos?</li>
          <li>Calcula: ¿cuánto cobrarás por cliente? ¿Cuántos necesitas para vivir?</li>
        </ul>

        <h3>Esta semana</h3>
        <ul>
          <li>Presenta tu pitch a 5 personas y apunta sus preguntas</li>
          <li>Refina el modelo: ¿qué no entienden? ¿Qué falta?</li>
          <li>Define tus métricas clave: ¿cómo medirás el éxito?</li>
        </ul>

        <h3>Este mes</h3>
        <ul>
          <li>Crea una versión "presentable" de tu idea (slides, canvas, mockup)</li>
          <li>Testea el pitch con 10 personas diferentes</li>
          <li>Documenta todo: tienes las bases para buscar equipo y dinero</li>
        </ul>
      </>
    ),
  },
];

export default function ClarificarPage() {
  return <ChapterPage slug="clarificar" sections={sections} />;
}
