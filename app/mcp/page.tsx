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
              185 herramientas de cálculo accesibles directamente desde Claude, Mistral,
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
              185 herramientas organizadas en 8 categorías, optimizadas para el público hispanohablante
              con normativa española 2025 donde aplica.
            </p>
            <div className={styles.categoriesGrid}>
              {[
                { icon: '⚖️', name: 'Fiscal España', desc: 'IRPF, IVA, ITP/AJD, IS, Sucesiones, Donaciones, RETA, plusvalías, paro, nóminas, recargo de equivalencia y más de 60 cálculos normativos 2025.' },
                { icon: '💶', name: 'Finanzas personales', desc: 'Hipotecas, préstamos, amortización anticipada, interés compuesto, ETF, dividendos, plan de ahorro y calculadoras de inversión.' },
                { icon: '🏘️', name: 'Inmobiliaria', desc: 'Gastos de compraventa, plusvalía municipal (IIVTNU), rentabilidad de alquiler, tasación simplificada y coeficientes 2025.' },
                { icon: '💼', name: 'Laboral y RRHH', desc: 'Coste de contratar, finiquito, prestación por desempleo, sueldo neto, complemento de pensión y cálculos de autónomos.' },
                { icon: '🏥', name: 'Salud y deporte', desc: 'IMC, zonas de frecuencia cardíaca (Karvonen), calorías, macronutrientes y métricas de rendimiento deportivo.' },
                { icon: '📷', name: 'Fotografía', desc: 'Regla NPF y 500 para astrofotografía, profundidad de campo, focal equivalente, balance de blancos y tiempos de exposición.' },
                { icon: '🎬', name: 'Vídeo y cocina', desc: 'Factor de cámara lenta, velocidad de obturación por regla de los 180°, proporciones de ganache, porcentajes de chef y conversiones culinarias.' },
                { icon: '🔢', name: 'Cotidiano', desc: 'Porcentajes, conversión de divisas, combustible, propinas por país, diferencia entre fechas, IPC histórico y calculadoras de uso diario.' },
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
                { q: '¿Cuánto pagaré de IRPF con 38.000 € brutos en Madrid, soltero, sin hijos?', tag: 'Fiscal' },
                { q: 'Hipoteca de 220.000 € a 25 años al 3,2%. ¿Cuota mensual y total de intereses?', tag: 'Finanzas' },
                { q: 'Tengo 45 años, llevo 22 cotizando y cobro 2.400 €/mes. ¿Qué pensión pública me corresponde?', tag: 'Laboral' },
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
              <li>Los cálculos fiscales incluyen aviso de vigencia normativa (ejercicio 2025) y recomendación de consultar a un asesor colegiado.</li>
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
