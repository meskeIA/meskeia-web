'use client';
// @disclaimer: exempt

import Image from 'next/image';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import ShareCard from '@/components/ShareCard';
import styles from './Delegum.module.css';

export default function DelegumPage() {
  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        <article className={styles.document}>

          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroLockup}>
              <Image
                src="/delegum/simbolo-blanco.svg"
                alt=""
                aria-hidden="true"
                width={76}
                height={76}
                className={styles.heroSymbol}
                priority
              />
              <h1 className={styles.heroWordmark}>Delegum</h1>
            </div>
            <p className={styles.subtitle}>
              Tu asesoría digital fiscal, laboral y financiera para España.
              Conecta Delegum a tu asistente de IA y resuelve consultas reales —
              autónomos, nóminas, herencias, jubilación, despidos o compra de vivienda —
              con cálculos normativos 2025.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Servidor activo · Sin registro · Sin coste
            </div>
          </div>

          {/* Qué es */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Qué es Delegum</h2>
            <p className={styles.sectionIntro}>
              Delegum no es una calculadora más: es un <strong>servidor MCP</strong> (Model Context Protocol)
              diseñado para comportarse como una gestoría. Cuando le preguntas a tu asistente de IA algo como
              «soy autónomo y facturo 45.000 €, ¿qué me queda?», Delegum no devuelve un número suelto:
              orquesta varios cálculos a la vez (cuota de la Seguridad Social, IRPF, neto disponible y
              comparación autónomo vs sociedad) y entrega un análisis integrado, como haría un asesor.
            </p>
            <p className={styles.sectionIntro}>
              Funciona sobre la biblioteca de cálculo de <a href="/" className={styles.link}>meskeIA</a>,
              con normativa española verificada del ejercicio 2025.
            </p>
          </section>

          {/* Conexión */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cómo conectarse</h2>
            <div className={styles.connectionBox}>
              <div className={styles.connectionRow}>
                <span className={styles.label}>URL del servidor</span>
                <code className={styles.code}>https://delegum.com/api/mcp/</code>
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
              Importante: la URL incluye la <strong>barra final</strong>. En Claude Desktop, añade el servidor
              en Configuración → Desarrollador → Servidores MCP e introduce la URL anterior. No hay que instalar nada.
            </p>
          </section>

          {/* Consultas de escenario */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Consultas de escenario</h2>
            <p className={styles.sectionIntro}>
              El corazón de Delegum: seis consultas que integran varios cálculos en una sola respuesta,
              en lugar de obligarte a encadenar herramientas sueltas.
            </p>
            <div className={styles.scenarioGrid}>
              {[
                { icon: '💼', name: 'Autónomo', tool: 'consulta_autonomo', desc: 'Cuota RETA + IRPF + neto disponible + comparación autónomo vs Sociedad Limitada, con recomendación.' },
                { icon: '🧾', name: 'Nómina', tool: 'consulta_nomina', desc: 'Del bruto al neto: retención de IRPF y cotización a la Seguridad Social según situación familiar.' },
                { icon: '🏘️', name: 'Comprar vivienda', tool: 'consulta_compra_vivienda', desc: 'Impuestos y gastos de compra (ITP/IVA, AJD, notaría, registro), ahorro necesario y cuota de hipoteca.' },
                { icon: '⚖️', name: 'Herencia', tool: 'consulta_herencia', desc: 'Impuesto de Sucesiones del heredero con reducciones y bonificaciones de su comunidad autónoma.' },
                { icon: '🌅', name: 'Jubilación', tool: 'consulta_jubilacion', desc: 'Pensión pública estimada, brecha respecto al sueldo y ahorro mensual necesario para compensarla.' },
                { icon: '📋', name: 'Despido', tool: 'consulta_despido', desc: 'Indemnización + finiquito + prestación por desempleo: lo que recibes en total, de una vez.' },
              ].map(s => (
                <div key={s.tool} className={styles.scenarioCard}>
                  <span className={styles.scenarioIcon} aria-hidden="true">{s.icon}</span>
                  <h3 className={styles.scenarioName}>{s.name}</h3>
                  <code className={styles.scenarioTool}>{s.tool}</code>
                  <p className={styles.scenarioDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Herramientas individuales */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Herramientas individuales</h2>
            <p className={styles.sectionIntro}>
              Para cuando solo necesitas un dato concreto. Conjunto curado de las consultas más habituales:
            </p>
            <div className={styles.toolTags}>
              {[
                'Sueldo neto', 'IRPF', 'Cuota de autónomo', 'Autónomo vs SL', 'IVA',
                'Hipoteca', 'Indemnización por despido', 'Finiquito', 'Prestación por desempleo',
                'Pensión pública', 'Impuesto de Sucesiones', 'Impuesto de Donaciones',
                'Brecha de jubilación', 'Gastos de compraventa',
              ].map(t => (
                <span key={t} className={styles.toolTag}>{t}</span>
              ))}
            </div>
          </section>

          {/* Ejemplos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Ejemplos de uso</h2>
            <div className={styles.examplesGrid}>
              {[
                { q: 'Soy autónomo, facturo 45.000 € y tengo 8.000 € de gastos. ¿Qué me queda y me conviene una SL?', tag: 'Autónomo' },
                { q: 'Me ofrecen 38.000 € brutos en 14 pagas, casado y un hijo. ¿Cuánto cobraré neto al mes?', tag: 'Nómina' },
                { q: 'Quiero comprar un piso de 220.000 € de segunda mano en Valencia. ¿Cuánto necesito ahorrado?', tag: 'Vivienda' },
                { q: 'Heredo 180.000 € de mi padre en Andalucía, incluida su vivienda habitual. ¿Cuánto pago?', tag: 'Herencia' },
                { q: 'Me han despedido (improcedente), llevo 6 años, cobro 30.000 €/año y 900 días cotizados. ¿Qué me corresponde?', tag: 'Despido' },
              ].map(ex => (
                <div key={ex.q} className={styles.exampleCard}>
                  <span className={styles.exampleTag}>{ex.tag}</span>
                  <p className={styles.exampleQ}>&quot;{ex.q}&quot;</p>
                </div>
              ))}
            </div>
          </section>

          {/* Datos y privacidad */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Datos y privacidad</h2>
            <ul className={styles.privacyList}>
              <li>Los parámetros de cada consulta se procesan en memoria y <strong>no se almacenan</strong>.</li>
              <li>Toda la comunicación viaja cifrada por <strong>HTTPS/TLS</strong>.</li>
              <li>No se requiere cuenta, email ni ningún dato personal para usar el servidor.</li>
              <li>Cada respuesta fiscal, laboral o financiera incluye un <strong>aviso legal</strong> de carácter orientativo y la recomendación de consultar a un profesional colegiado.</li>
              <li>Política de privacidad completa: <a href="/privacidad" className={styles.link}>meskeia.com/privacidad</a>.</li>
            </ul>
          </section>

          {/* Aviso */}
          <section className={styles.section}>
            <div className={styles.disclaimer}>
              <strong>Delegum es un asistente orientativo, no un despacho profesional.</strong> Los cálculos se basan
              en normativa española del ejercicio 2025 y pueden no contemplar todas las particularidades de tu caso.
              No constituyen asesoramiento fiscal, laboral ni jurídico vinculante. Para decisiones reales, consulta
              a un asesor colegiado, a un graduado social o a la Agencia Tributaria.{' '}
              Consulta el <a href="aviso-legal" className={styles.link}>Aviso Legal y Términos de Uso</a> completo.
            </div>
          </section>

          {/* Soporte */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Soporte</h2>
            <p>
              Para dudas sobre la conexión, problemas técnicos o sugerencias de nuevas consultas,
              usa el <a href="/contacto" className={styles.link}>formulario de contacto</a>.
            </p>
          </section>

        </article>
      </main>

      <ShareCard appName="meskeIA" />
      <Footer appName="delegum" />
    </>
  );
}
