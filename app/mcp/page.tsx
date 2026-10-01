'use client';
// @disclaimer: exempt

import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import ShareCard from '@/components/ShareCard';
import styles from './Mcp.module.css';

export default function McpPage() {
  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        <article className={styles.document}>

          <div className={styles.hero}>
            <h1 className={styles.title}>Servidor MCP de meskeIA</h1>
            <p className={styles.subtitle}>
              Calculadoras del día a día accesibles directamente desde Claude, Mistral,
              ChatGPT y cualquier cliente compatible con el Model Context Protocol.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Servidor activo · Sin registro · Sin coste
            </div>
          </div>

          {/* Conexión */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cómo conectarse</h2>
            <div className={styles.connectionBox}>
              <div className={styles.connectionRow}>
                <span className={styles.label}>URL del servidor</span>
                <code className={styles.code}>https://meskeia.com/api/mcp/</code>
              </div>
              <div className={styles.connectionRow}>
                <span className={styles.label}>Autenticación</span>
                <span className={styles.value}>No requerida</span>
              </div>
              <div className={styles.connectionRow}>
                <span className={styles.label}>Transporte</span>
                <span className={styles.value}>Streamable HTTP (POST)</span>
              </div>
              <div className={styles.connectionRow}>
                <span className={styles.label}>Clientes compatibles</span>
                <span className={styles.value}>Claude Desktop · Claude.ai · Mistral · ChatGPT</span>
              </div>
            </div>
            <p className={styles.note}>
              En Claude Desktop, añade el servidor en Configuración → Desarrollador → Servidores MCP
              e introduce la URL anterior. No es necesario instalar nada en tu equipo.
            </p>
          </section>

          {/* Categorías */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Herramientas disponibles</h2>
            <p className={styles.sectionIntro}>
              Calculadoras deterministas del día a día, en español y con formato español.
              Los cálculos fiscales, laborales e inmobiliarios de España están en un servidor aparte,
              el <a href="https://delegum.com/asistente-ia/" className={styles.link}>MCP de Delegum</a>{' '}
              (<code>https://delegum.com/api/mcp/</code>).
            </p>
            <div className={styles.categoriesGrid}>
              {[
                { icon: '🔢', name: 'Cotidiano', desc: 'Porcentajes, propinas, regla de tres, conversión de unidades, estadística básica, MCD/MCM, inflación y edad de una mascota en años humanos.' },
                { icon: '📅', name: 'Fechas', desc: 'Días entre dos fechas, la fecha que resulta de sumar o restar un plazo, día de la semana y edad exacta.' },
                { icon: '🏥', name: 'Salud y deporte', desc: 'IMC, gasto energético, macronutrientes, zonas de frecuencia cardíaca, ritmo y predicción en running, potencia en ciclismo, SWOLF en natación y 1RM de gimnasio.' },
                { icon: '🚗', name: 'Coche y movilidad', desc: 'Consumo y coste de combustible, compensación por kilómetro con vehículo propio, etiqueta ambiental DGT y año en que el coche eléctrico sale más barato.' },
                { icon: '📷', name: 'Fotografía', desc: 'Regla NPF y 500 para astrofotografía, profundidad de campo y exposición equivalente.' },
                { icon: '🎬', name: 'Vídeo', desc: 'Regla de los 180°, factor de cámara lenta, filtro ND, bitrate y tamaño de archivo, y campo de visión.' },
                { icon: '🍞', name: 'Panadería y repostería', desc: 'Porcentaje del panadero, hidratación, sustitución de levadura por masa madre, temperatura de la masa, azúcar, gelatina, ganache y escalado de recetas.' },
              ].map(cat => (
                <div key={cat.name} className={styles.categoryCard}>
                  <span className={styles.categoryIcon} aria-hidden="true">{cat.icon}</span>
                  <div>
                    <h3 className={styles.categoryName}>{cat.name}</h3>
                    <p className={styles.categoryDesc}>{cat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ejemplos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Ejemplos de uso</h2>
            <div className={styles.examplesGrid}>
              {[
                { q: 'Corro 10 km en 52 minutos. ¿A qué ritmo voy y qué tiempo puedo esperar en una media maratón?', tag: 'Deporte' },
                { q: 'Viaje de 620 km con un coche que gasta 6,5 l/100 km y la gasolina a 1,62 €/l. ¿Cuánto me cuesta?', tag: 'Coche' },
                { q: 'Mi receta de pan lleva 7 g de levadura seca. ¿Cuánta masa madre uso en su lugar?', tag: 'Panadería' },
                { q: '¿Cuánto chocolate y nata necesito para 400 g de ganache de trufa firme?', tag: 'Cocina' },
                { q: 'Sony A7III, 24 MP, focal 20 mm, f/2,8. ¿Tiempo máximo de exposición para astrofoto sin rastro de estrella?', tag: 'Fotografía' },
              ].map(ex => (
                <div key={ex.q} className={styles.exampleCard}>
                  <span className={styles.exampleTag}>{ex.tag}</span>
                  <p className={styles.exampleQ}>"{ex.q}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* Datos y privacidad */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Datos y privacidad</h2>
            <ul className={styles.privacyList}>
              <li>Los parámetros de cada llamada se procesan en memoria y <strong>no se almacenan</strong>.</li>
              <li>Toda la comunicación viaja cifrada por <strong>HTTPS/TLS</strong>.</li>
              <li>No se requiere cuenta, email ni ningún dato personal para usar el servidor.</li>
              <li>Cada respuesta incluye el aviso que le corresponde: sanitario en salud y deporte, y de vigencia normativa en la compensación por kilómetro.</li>
              <li>Política de privacidad completa: <a href="/privacidad" className={styles.link}>meskeia.com/privacidad</a>.</li>
            </ul>
          </section>

          {/* Soporte */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Soporte</h2>
            <p>
              Para dudas sobre el servidor MCP, problemas de conexión o sugerencias de nuevas herramientas,
              usa el <a href="/contacto" className={styles.link}>formulario de contacto</a>.
            </p>
          </section>

        </article>
      </main>

      <ShareCard appName="pag:mcp" />
      <Footer appName="pag:mcp" />
    </>
  );
}
