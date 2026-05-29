'use client';
// @disclaimer: exempt

import { useState } from 'react';
import Link from 'next/link';
import { MeskeiaLogo, LegalNotice, ShareCard, Footer } from '@/components';
import styles from './Developers.module.css';

const MCP_URL = 'https://meskeia.com/api/mcp/';

const CLIENTES = [
  {
    id: 'claude',
    label: 'Claude Desktop',
    ruta: '~/Library/Application Support/Claude/claude_desktop_config.json (Mac)\n%APPDATA%\\Claude\\claude_desktop_config.json (Windows)',
    config: `{
  "mcpServers": {
    "meskeia": {
      "url": "${MCP_URL}"
    }
  }
}`,
  },
  {
    id: 'cursor',
    label: 'Cursor',
    ruta: 'Cursor → Settings → MCP → Add Server',
    config: `{
  "mcpServers": {
    "meskeia": {
      "url": "${MCP_URL}"
    }
  }
}`,
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    ruta: 'Windsurf → Preferences → MCP Servers → Add',
    config: `{
  "mcpServers": {
    "meskeia": {
      "url": "${MCP_URL}"
    }
  }
}`,
  },
];

const CATEGORIAS = [
  {
    icon: '🏛️',
    nombre: 'Fiscal y Tributario',
    desc: 'IRPF, Impuesto de Sociedades, IVA, modelos 130/303/111/347 y toda la normativa tributaria española.',
    ejemplos: 'cuota autónomo, sucesiones, donaciones, plusvalías, IIVTNU...',
  },
  {
    icon: '💼',
    nombre: 'Laboral y Nóminas',
    desc: 'Sueldo neto, finiquitos, prestaciones, ERTEs, despidos, excedencias y todo el derecho laboral.',
    ejemplos: 'indemnización, horas extra, reducción jornada, baja médica...',
  },
  {
    icon: '🏘️',
    nombre: 'Inmobiliario',
    desc: 'Hipotecas, compraventa de inmuebles, plusvalías, ITP/AJD por CCAA, alquiler y rendimientos.',
    ejemplos: 'capacidad hipoteca, amortización anticipada, ITP, rentabilidad alquiler...',
  },
  {
    icon: '📈',
    nombre: 'Financiero',
    desc: 'Inversiones, interés compuesto, TIR/VAN, FIRE, estrategia de deuda y objetivos de ahorro.',
    ejemplos: 'regla del 72, reequilibrio cartera, descuento efectos...',
  },
  {
    icon: '🏥',
    nombre: 'Salud',
    desc: 'Calculadoras de IMC y macronutrientes con avisos sanitarios incluidos en cada respuesta.',
    ejemplos: 'IMC, necesidades calóricas, distribución de macros...',
  },
  {
    icon: '🔧',
    nombre: 'Cotidiano y Educativo',
    desc: 'Fechas, porcentajes, unidades, estadísticas, regla de tres y otras utilidades generales.',
    ejemplos: 'diferencia entre fechas, MCD/MCM, conversor de unidades...',
  },
];

const PASOS = [
  {
    n: '1',
    titulo: 'Añade el servidor',
    desc: 'Copia la URL del servidor MCP y añádela a la configuración de tu cliente (Claude Desktop, Cursor, Windsurf...).',
  },
  {
    n: '2',
    titulo: 'La IA descubre las herramientas',
    desc: 'Al conectarse, el cliente recibe automáticamente la lista de las 160+ herramientas disponibles con sus parámetros.',
  },
  {
    n: '3',
    titulo: 'El usuario pregunta, la IA calcula',
    desc: 'Cuando el usuario hace una pregunta relevante, la IA llama silenciosamente al servidor y responde con el cálculo.',
  },
];

export default function DevelopersPage() {
  const [clienteActivo, setClienteActivo] = useState(0);
  const [copiado, setCopiado] = useState(false);

  const copiarConfig = () => {
    navigator.clipboard.writeText(CLIENTES[clienteActivo].config).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const copiarUrl = () => {
    navigator.clipboard.writeText(MCP_URL).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ─────────────────────────────────────────── */}
      <header className={styles.hero}>
        <span className={styles.heroLabel}>Para desarrolladores</span>
        <h1 className={styles.heroTitle}>Integra meskeIA en tu IA</h1>
        <p className={styles.heroSubtitle}>
          160+ calculadoras fiscales, financieras y de salud disponibles mediante
          el protocolo MCP. Gratuito, sin registro, sin API key.
        </p>

        <div className={styles.heroUrl}>
          <span className={styles.heroUrlLabel}>URL del servidor</span>
          <span>{MCP_URL}</span>
          <button
            onClick={copiarUrl}
            className={styles.badge}
            style={{ cursor: 'pointer', border: 'none' }}
            aria-label="Copiar URL del servidor MCP"
          >
            {copiado ? '✓ Copiado' : '📋 Copiar'}
          </button>
        </div>

        <div className={styles.heroBadges}>
          <span className={styles.badge}>✓ Protocolo MCP estándar</span>
          <span className={styles.badge}>✓ Sin API key</span>
          <span className={styles.badge}>✓ 160+ herramientas</span>
          <span className={styles.badge}>✓ En español</span>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.content}>

        {/* ── Inicio rápido ─────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚡ Inicio rápido</h2>

          <div className={styles.clientTabs}>
            {CLIENTES.map((c, i) => (
              <button
                key={c.id}
                className={`${styles.clientTab} ${i === clienteActivo ? styles.active : ''}`}
                onClick={() => setClienteActivo(i)}
                aria-pressed={i === clienteActivo}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className={styles.codeBlock}>
            <p className={styles.codeLabel}>
              {CLIENTES[clienteActivo].label} — {CLIENTES[clienteActivo].ruta}
            </p>
            <pre>{CLIENTES[clienteActivo].config}</pre>
            <button
              className={`${styles.copyBtn} ${copiado ? styles.copyBtnDone : ''}`}
              onClick={copiarConfig}
              aria-label="Copiar configuración"
            >
              {copiado ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          <p className={styles.configNote}>
            Cualquier cliente compatible con el protocolo MCP estándar puede conectarse
            usando la misma URL. Consulta la documentación de tu cliente para la ubicación
            exacta del archivo de configuración.
          </p>
        </section>

        {/* ── Herramientas disponibles ───────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🗂️ Herramientas disponibles</h2>
          <div className={styles.categoryGrid}>
            {CATEGORIAS.map((cat) => (
              <div key={cat.nombre} className={styles.categoryCard}>
                <span className={styles.categoryIcon} aria-hidden="true">{cat.icon}</span>
                <p className={styles.categoryName}>{cat.nombre}</p>
                <p className={styles.categoryDesc}>{cat.desc}</p>
                <p className={styles.categoryExamples}>{cat.ejemplos}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cómo funciona ─────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔄 Cómo funciona</h2>
          <div className={styles.stepsGrid}>
            {PASOS.map((p) => (
              <div key={p.n} className={styles.stepCard}>
                <div className={styles.stepNumber} aria-hidden="true">{p.n}</div>
                <p className={styles.stepTitle}>{p.titulo}</p>
                <p className={styles.stepDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Avisos y términos ─────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚖️ Uso responsable</h2>
          <div className={styles.termsBox}>
            <p>
              Todos los resultados del servidor MCP son <strong>estimaciones orientativas</strong> generadas
              automáticamente y no constituyen asesoramiento fiscal, financiero, jurídico ni médico.
              Cada respuesta del servidor incluye el aviso legal correspondiente.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Al integrar el servidor MCP en tu aplicación o agente, asumes la responsabilidad
              de informar adecuadamente a tus usuarios finales del carácter orientativo de los resultados.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              <Link href="/developers/terminos">→ Leer los Términos de Uso completos</Link>
              {' · '}
              <a href="mailto:meskeia@proton.me">Contacto</a>
            </p>
          </div>
        </section>

      </main>

      <ShareCard appName="developers" />
      <Footer appName="developers" />
    </div>
  );
}
