import { Metadata } from 'next';
import styles from './Calculadoras.module.css';

export const metadata: Metadata = {
  title: 'Calculadoras de fiscalidad, derecho laboral y finanzas | Delegum',
  description:
    'Selección de calculadoras de fiscalidad, derecho laboral y finanzas para España: sueldo neto, cuota de autónomo, IRPF, IVA, hipoteca, jubilación, herencias y más.',
  alternates: { canonical: 'https://delegum.com/calculadoras/' },
};

// Selección curada — las calculadoras viven en meskeIA y se abren allí
const CALCULADORAS = [
  // Fiscal y laboral
  { icon: '💶', name: 'Sueldo neto', desc: 'Del bruto al neto con IRPF y Seguridad Social.', url: 'https://meskeia.com/estimador-sueldo-neto/', grupo: 'Fiscal y laboral' },
  { icon: '💼', name: 'Cuota de autónomo', desc: 'Cuota RETA mensual por ingresos reales 2025.', url: 'https://meskeia.com/estimador-cuota-autonomo/', grupo: 'Fiscal y laboral' },
  { icon: '🧭', name: 'Tipos de renta IRPF', desc: 'Cómo tributa cada ingreso: base general o del ahorro.', url: 'https://meskeia.com/orientador-tipos-renta-irpf/', grupo: 'Fiscal y laboral' },
  { icon: '🧾', name: 'Orientador del IVA', desc: 'Qué IVA aplicar en cada operación, con simulador.', url: 'https://meskeia.com/orientador-iva-espana/', grupo: 'Fiscal y laboral' },
  { icon: '🏢', name: 'Autónomo o sociedad', desc: 'Compara tributar por IRPF como autónomo o por Sociedades.', url: 'https://meskeia.com/comparador-autonomo-vs-sl/', grupo: 'Fiscal y laboral' },
  // Vivienda
  { icon: '📋', name: 'Gastos de compraventa', desc: 'ITP/IVA, notaría, registro y plusvalía del inmueble.', url: 'https://meskeia.com/estimador-compraventa-inmueble/', grupo: 'Vivienda' },
  { icon: '💰', name: 'Hipoteca', desc: 'Cuota y cuadro de amortización completo.', url: 'https://meskeia.com/estimador-hipoteca/', grupo: 'Vivienda' },
  { icon: '🏘️', name: 'Plusvalía municipal', desc: 'IIVTNU al vender o heredar: método objetivo vs real.', url: 'https://meskeia.com/estimador-plusvalia-municipal/', grupo: 'Vivienda' },
  // Jubilación y herencias
  { icon: '🏤', name: 'Jubilación pública', desc: 'Edad y pensión estimada con el sistema dual 2026.', url: 'https://meskeia.com/simulador-jubilacion-publica/', grupo: 'Jubilación y herencias' },
  { icon: '💍', name: 'Pensión de viudedad', desc: 'Porcentaje, base reguladora y mínimos 2025.', url: 'https://meskeia.com/estimador-pension-viudedad/', grupo: 'Jubilación y herencias' },
  { icon: '⚖️', name: 'Legítimas (herencia)', desc: 'Herencia forzosa según el régimen civil de tu CCAA.', url: 'https://meskeia.com/estimador-legitimas/', grupo: 'Jubilación y herencias' },
  { icon: '🏛️', name: 'Impuesto de Sucesiones', desc: 'Cuota del ISD por herencia según CCAA y parentesco.', url: 'https://meskeia.com/estimador-impuesto-sucesiones/', grupo: 'Jubilación y herencias' },
  { icon: '🎁', name: 'Impuesto de Donaciones', desc: 'Cuota del ISD por donación según CCAA y parentesco.', url: 'https://meskeia.com/estimador-impuesto-donaciones/', grupo: 'Jubilación y herencias' },
  // Familia y dependencia
  { icon: '👶', name: 'Prestación por nacimiento', desc: 'Cuantía y duración de la baja por nacimiento y cuidado.', url: 'https://meskeia.com/estimacion-prestacion-nacimiento/', grupo: 'Familia y dependencia' },
  { icon: '♿', name: 'Prestaciones por dependencia', desc: 'Cuantías del SAAD y copago según tu grado.', url: 'https://meskeia.com/estimacion-prestaciones-dependencia/', grupo: 'Familia y dependencia' },
];

export default function CalculadorasPage() {
  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <p className={styles.kicker}>Delegum · Calculadoras</p>
        <h1 className={styles.title}>Calculadoras de fiscalidad, laboral y finanzas</h1>
        <p className={styles.subtitle}>
          Una selección de las herramientas de meskeIA para hacer el número tú mismo. Se abren
          en meskeia.com, donde está el catálogo completo.
        </p>
      </header>

      <section className={styles.grid}>
        {CALCULADORAS.map((c) => (
          <a key={c.url} href={c.url} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">{c.icon}</span>
            <div className={styles.cardText}>
              <span className={styles.grupo}>{c.grupo}</span>
              <h2 className={styles.name}>{c.name}</h2>
              <p className={styles.desc}>{c.desc}</p>
            </div>
          </a>
        ))}
      </section>

      <p className={styles.foot}>
        ¿Buscas otra herramienta?{' '}
        <a href="https://meskeia.com/apps/" className={styles.link}>Ver el catálogo completo en meskeIA →</a>
      </p>
    </main>
  );
}
