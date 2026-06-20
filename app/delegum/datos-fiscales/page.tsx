import { Metadata } from 'next';
import Link from 'next/link';
import {
  FISCAL_INMUEBLES_META,
  FISCAL_IRPF_META,
  FISCAL_IVA_META,
  FISCAL_SMI_META,
  FISCAL_INTERESES_META,
  FISCAL_AUTONOMOS_META,
  FISCAL_SUCESIONES_META,
  FISCAL_DONACIONES_META,
  FISCAL_PATRIMONIO_META,
  FISCAL_AMORTIZACION_META,
  FISCAL_SOCIEDADES_META,
  FISCAL_IPREM_META,
  FISCAL_PENSIONES_META,
} from '@/data/fiscal';
import { formatDate } from '@/lib';
import styles from './DatosFiscales.module.css';

export const metadata: Metadata = {
  title: 'Datos fiscales verificados de España | Delegum',
  description:
    'Tipos, tramos y coeficientes fiscales de España verificados, con fuente oficial y fecha de actualización. Listos para consultar o citar.',
  alternates: { canonical: 'https://delegum.com/datos-fiscales/' },
};

// Fichas de datos disponibles (crece a medida que se publican)
const FICHAS = [
  {
    icon: '🧾',
    titulo: 'Tramos y mínimos del IRPF',
    desc: 'Escala general por tramos, escala del ahorro y mínimos personales y familiares del IRPF 2025.',
    href: '/datos-fiscales/irpf-tramos-minimos',
    verificado: FISCAL_IRPF_META.verificado,
  },
  {
    icon: '🛒',
    titulo: 'Tipos de IVA en España',
    desc: 'General (21%), reducido (10%) y superreducido (4%) con ejemplos, exenciones y recargo de equivalencia.',
    href: '/datos-fiscales/iva-tipos',
    verificado: FISCAL_IVA_META.verificado,
  },
  {
    icon: '💶',
    titulo: 'Salario Mínimo Interprofesional (SMI)',
    desc: 'Cuantías del SMI 2026 (mensual, anual, diario y por hora) y comparativa con 2025.',
    href: '/datos-fiscales/smi-salario-minimo',
    verificado: FISCAL_SMI_META.verificado,
  },
  {
    icon: '💼',
    titulo: 'Cuota de autónomos (RETA)',
    desc: 'Tabla de cotización por ingresos reales 2026: tramos, base mínima y cuota mensual, más tarifa plana.',
    href: '/datos-fiscales/cuota-autonomos-reta',
    verificado: FISCAL_AUTONOMOS_META.verificado,
  },
  {
    icon: '🏠',
    titulo: 'Tipos de ITP por comunidad autónoma',
    desc: 'Impuesto de Transmisiones Patrimoniales en la compra de vivienda usada, con tipos generales y reducidos por CCAA.',
    href: '/datos-fiscales/itp-ccaa',
    verificado: FISCAL_INMUEBLES_META.verificado,
  },
  {
    icon: '⚖️',
    titulo: 'Interés legal del dinero y de demora',
    desc: 'Interés legal, interés de demora comercial por semestre (Ley 3/2004) e interés de demora tributario.',
    href: '/datos-fiscales/interes-legal-demora',
    verificado: FISCAL_INTERESES_META.verificado,
  },
  {
    icon: '🏛️',
    titulo: 'Impuesto de Sucesiones por comunidad autónoma',
    desc: 'Bonificaciones del ISD por CCAA, grupos de parentesco, tarifa estatal por tramos y reducciones aplicables.',
    href: '/datos-fiscales/sucesiones-isd',
    verificado: FISCAL_SUCESIONES_META.verificado,
  },
  {
    icon: '🎁',
    titulo: 'Impuesto de Donaciones por comunidad autónoma',
    desc: 'Bonificaciones del ISD en donaciones por CCAA, grupos de parentesco, tarifa estatal y requisito de escritura.',
    href: '/datos-fiscales/donaciones-isd',
    verificado: FISCAL_DONACIONES_META.verificado,
  },
  {
    icon: '💎',
    titulo: 'Impuesto sobre el Patrimonio',
    desc: 'Mínimo exento, escala estatal, bonificaciones autonómicas y umbral del Impuesto de Grandes Fortunas (ITSGF).',
    href: '/datos-fiscales/impuesto-patrimonio',
    verificado: FISCAL_PATRIMONIO_META.verificado,
  },
  {
    icon: '🏭',
    titulo: 'Coeficientes de amortización del inmovilizado',
    desc: 'Coeficientes de amortización lineal por tipo de activo (art. 12.1 LIS), período máximo y métodos degresivos.',
    href: '/datos-fiscales/amortizacion-inmovilizado',
    verificado: FISCAL_AMORTIZACION_META.verificado,
  },
  {
    icon: '🏢',
    titulo: 'Tipos del Impuesto de Sociedades',
    desc: 'Tipo general, nueva creación, escala de microempresas (Ley 7/2024), cooperativas y obligaciones (modelos 200 y 202).',
    href: '/datos-fiscales/impuesto-sociedades',
    verificado: FISCAL_SOCIEDADES_META.verificado,
  },
  {
    icon: '📊',
    titulo: 'IPREM',
    desc: 'Cuantías del IPREM (diaria, mensual y anual con 12 y 14 pagas), usos en ayudas y diferencia con el SMI.',
    href: '/datos-fiscales/iprem',
    verificado: FISCAL_IPREM_META.verificado,
  },
  {
    icon: '👴',
    titulo: 'Pensión de jubilación',
    desc: 'Edad de jubilación, años mínimos de cotización, porcentaje por años cotizados y pensión máxima y mínima 2026.',
    href: '/datos-fiscales/pensiones-jubilacion',
    verificado: FISCAL_PENSIONES_META.verificado,
  },
];

export default function DatosFiscalesIndex() {
  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <p className={styles.kicker}>Delegum · Datos fiscales</p>
        <h1 className={styles.title}>Datos fiscales verificados de España</h1>
        <p className={styles.subtitle}>
          Tipos, tramos y coeficientes con <strong>fuente oficial y fecha de verificación</strong>.
          Pensados para consultar de un vistazo o citar como referencia.
        </p>
      </header>

      <section className={styles.fichasGrid}>
        {FICHAS.map((f) => {
          let fecha = f.verificado;
          try {
            fecha = formatDate(new Date(f.verificado));
          } catch {
            /* se mantiene el valor ISO si la fecha no es válida */
          }
          return (
            <Link key={f.href} href={f.href} className={styles.fichaCard}>
              <span className={styles.fichaIcon} aria-hidden="true">{f.icon}</span>
              <h2 className={styles.fichaTitulo}>{f.titulo}</h2>
              <p className={styles.fichaDesc}>{f.desc}</p>
              <span className={styles.fichaMeta}>Verificado el {fecha}</span>
            </Link>
          );
        })}
      </section>

      <p className={styles.foot}>
        Estamos ampliando esta sección con más datos (IRPF, IVA, SMI, intereses…). Cada ficha se
        genera desde la misma fuente que usan las calculadoras de meskeIA, por lo que se mantiene
        siempre actualizada.
      </p>
    </main>
  );
}
