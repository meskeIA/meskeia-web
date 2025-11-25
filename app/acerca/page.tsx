'use client';

import Link from 'next/link';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function AcercaPage() {
  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        <h1 className={styles.title}>Acerca de meskeIA</h1>

        {/* Introducción */}
        <div className={styles.intro}>
          <p>
            <strong>meskeIA</strong> es una plataforma gratuita que ofrece <strong>aplicaciones web especializadas</strong>
            en finanzas, matemáticas, productividad, creatividad y mucho más. Todas las herramientas son
            <strong> 100% gratuitas</strong>, funcionan <strong>sin registro</strong> y están <strong>completamente en español</strong>.
          </p>
          <p>
            Nuestro objetivo es democratizar el acceso a herramientas útiles y profesionales,
            eliminando barreras como el coste, el registro obligatorio o la necesidad de conexión a internet.
          </p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>28</span>
              <span className={styles.statLabel}>Aplicaciones</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>12</span>
              <span className={styles.statLabel}>Categorías</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Gratuito</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>0</span>
              <span className={styles.statLabel}>Anuncios</span>
            </div>
          </div>
        </div>

        {/* Casos de Uso */}
        <h2 className={styles.sectionTitle}>¿Para quién es meskeIA?</h2>
        <div className={styles.section}>
          <div className={styles.casosUso}>
            <div className={styles.caso}>
              <h3>💼 Inversores y Ahorradores</h3>
              <p>Calculadoras de hipotecas, interés compuesto, TAE, IRPF, ratios financieros y análisis de inversiones.</p>
            </div>

            <div className={styles.caso}>
              <h3>🎓 Estudiantes</h3>
              <p>Herramientas matemáticas, calculadoras científicas, conversores de unidades, generadores de estadísticas.</p>
            </div>

            <div className={styles.caso}>
              <h3>💻 Profesionales</h3>
              <p>Gestión de tiempo, temporizadores Pomodoro, generadores de texto, herramientas de productividad.</p>
            </div>

            <div className={styles.caso}>
              <h3>🎨 Creativos y Diseñadores</h3>
              <p>Generadores de paletas de colores, tipografías, gradientes, códigos QR y herramientas visuales.</p>
            </div>

            <div className={styles.caso}>
              <h3>🏢 Emprendedores</h3>
              <p>Calculadoras de ROI, punto de equilibrio, modelos de negocio y análisis de viabilidad.</p>
            </div>

            <div className={styles.caso}>
              <h3>🏥 Salud y Bienestar</h3>
              <p>Calculadoras de IMC, calorías, macronutrientes y herramientas de seguimiento personal.</p>
            </div>
          </div>
        </div>

        {/* Ventajas */}
        <h2 className={styles.sectionTitle}>¿Por qué elegir meskeIA?</h2>
        <div className={styles.section}>
          <ul className={styles.ventajas}>
            <li><strong>100% Gratuito:</strong> Sin costes ocultos, sin suscripciones, sin anuncios molestos.</li>
            <li><strong>Sin Registro:</strong> Accede directamente a cualquier herramienta sin crear cuenta ni proporcionar datos personales.</li>
            <li><strong>Funciona Offline:</strong> Muchas aplicaciones son PWA (Progressive Web Apps) y funcionan sin conexión a internet.</li>
            <li><strong>Optimizado para Móvil:</strong> Todas las aplicaciones están diseñadas para funcionar perfectamente en smartphones y tablets.</li>
            <li><strong>Todo en Español:</strong> Interfaz, textos y ayuda completamente en español de España.</li>
            <li><strong>Privacidad Total:</strong> No recopilamos datos personales. Todo se procesa localmente en tu navegador.</li>
            <li><strong>Código Abierto:</strong> Disponible en GitHub para transparencia y colaboración.</li>
            <li><strong>Actualizaciones Continuas:</strong> Añadimos nuevas aplicaciones y mejoras regularmente.</li>
          </ul>
        </div>

        {/* Categorías */}
        <h2 className={styles.sectionTitle}>Catálogo de Aplicaciones</h2>
        <div className={styles.section}>
          <p>Explora nuestras <strong>aplicaciones</strong> organizadas en <strong>12 categorías</strong>:</p>

          <div className={styles.categorias}>
            <span className={styles.categoriaTag}>💰 Finanzas y Fiscalidad</span>
            <span className={styles.categoriaTag}>🧮 Calculadoras y Utilidades</span>
            <span className={styles.categoriaTag}>📊 Matemáticas y Estadística</span>
            <span className={styles.categoriaTag}>⚗️ Física y Química</span>
            <span className={styles.categoriaTag}>⏱️ Herramientas de Productividad</span>
            <span className={styles.categoriaTag}>🎨 Creatividad y Diseño</span>
            <span className={styles.categoriaTag}>🎮 Juegos y Entretenimiento</span>
            <span className={styles.categoriaTag}>📚 Campus Digital</span>
            <span className={styles.categoriaTag}>🏥 Salud & Bienestar</span>
            <span className={styles.categoriaTag}>🌐 Herramientas Web y Tecnología</span>
            <span className={styles.categoriaTag}>📝 Texto y Documentos</span>
            <span className={styles.categoriaTag}>🚀 Emprendimiento y Negocios</span>
          </div>

          <div className={styles.ctaContainer}>
            <Link href="/" className={styles.ctaButton}>Ver Catálogo Completo</Link>
          </div>
        </div>

        {/* Filosofía */}
        <h2 className={styles.sectionTitle}>Nuestra Filosofía</h2>
        <div className={styles.section}>
          <p>
            En meskeIA creemos que <strong>el acceso a herramientas útiles debe ser universal</strong>.
            Por eso, todas nuestras aplicaciones son:
          </p>
          <ul className={styles.ventajas}>
            <li><strong>Gratuitas para siempre:</strong> Sin freemium, sin versiones "pro", sin trucos.</li>
            <li><strong>Respetuosas con tu privacidad:</strong> Sin cookies de terceros, sin tracking, sin recopilación de datos.</li>
            <li><strong>Simples y efectivas:</strong> Diseñadas para resolver problemas concretos sin complicaciones innecesarias.</li>
            <li><strong>Accesibles desde cualquier dispositivo:</strong> PC, tablet, smartphone... donde tú estés.</li>
          </ul>
          <p className={styles.quote}>
            "La tecnología debe estar al servicio de las personas, no al revés."
          </p>
        </div>

        {/* Preguntas Frecuentes */}
        <h2 className={styles.sectionTitle}>Preguntas Frecuentes</h2>
        <div className={styles.section}>
          <div className={styles.faqItem}>
            <h3>¿Realmente es todo gratuito?</h3>
            <p>
              Sí, todas las aplicaciones son 100% gratuitas y lo serán siempre.
              No hay costes ocultos, versiones premium ni suscripciones.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Necesito registrarme?</h3>
            <p>
              No, ninguna aplicación requiere registro. Simplemente accedes y empiezas a usarlas inmediatamente.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Funcionan sin internet?</h3>
            <p>
              Muchas aplicaciones son PWA (Progressive Web Apps) y funcionan offline una vez cargadas.
              Puedes usarlas en el avión, en el metro o en cualquier lugar sin conexión.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Recopilan mis datos personales?</h3>
            <p>
              No. Todas las aplicaciones procesan la información localmente en tu navegador.
              No enviamos ni guardamos tus datos en ningún servidor.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Puedo usar meskeIA en mi móvil?</h3>
            <p>
              Sí, todas las aplicaciones están optimizadas para dispositivos móviles y tablets.
              El diseño responsive se adapta automáticamente a cualquier tamaño de pantalla.
            </p>
          </div>
        </div>

        {/* Código Abierto */}
        <h2 className={styles.sectionTitle}>Código Abierto</h2>
        <div className={styles.section}>
          <p>
            meskeIA es un proyecto de código abierto disponible en GitHub.
            Puedes revisar el código, reportar errores o contribuir con mejoras.
          </p>
          <p style={{ marginTop: '15px' }}>
            <strong>Repositorio:</strong>{' '}
            <a href="https://github.com/meskeIA/meskeia-web" target="_blank" rel="noopener noreferrer" className={styles.link}>
              github.com/meskeIA/meskeia-web
            </a>
          </p>
        </div>

        <div className={styles.ctaContainer}>
          <Link href="/" className={styles.ctaButton}>Explorar Aplicaciones</Link>
        </div>
      </main>

      <Footer appName="meskeIA" />
    </>
  );
}
