'use client';

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import DataReference from '@/components/DataReference';
import RegionBadge from '@/components/RegionBadge';
import { getRelatedApps } from '@/data/app-relations';
import styles from './OrientadorFacturacionRetencion.module.css';
import { metadata, jsonLd } from './metadata';

// ============================================================================
// Tipos
// ============================================================================

type PerfilTipo =
  | ''
  | 'profesional-general'
  | 'profesional-inicio'
  | 'arrendamiento'
  | 'administrador-grande'
  | 'administrador-pequena'
  | 'agricola-cereales'
  | 'agricola-porcino'
  | 'forestal'
  | 'particular'
  | 'modulos';

interface ResultadoRetencion {
  porcentaje: string;
  titulo: string;
  descripcion: string;
  base: string;
  cuando: string;
  quien: string;
  advertencia?: string;
  color: 'azul' | 'verde' | 'naranja' | 'rojo' | 'gris';
}

// ============================================================================
// Datos normativos de retención
// ============================================================================

const RETENCIONES: Record<Exclude<PerfilTipo, ''>, ResultadoRetencion> = {
  'profesional-general': {
    porcentaje: '15%',
    titulo: 'Retención profesional general',
    descripcion:
      'Autónomo que ejerce una actividad profesional (artículo 95 RIRPF) con más de 2 años de actividad.',
    base: 'Art. 95.1 RIRPF — Reglamento del IRPF',
    cuando: 'Siempre que el cliente sea empresa, sociedad o profesional en el ejercicio de su actividad.',
    quien:
      'Se aplica cuando el pagador es una persona jurídica (empresa, sociedad, organismo) o un autónomo/profesional que presta servicios a otra empresa. NO se aplica si el cliente es un consumidor final (particular).',
    color: 'azul',
  },
  'profesional-inicio': {
    porcentaje: '7%',
    titulo: 'Retención reducida — Inicio de actividad',
    descripcion:
      'Autónomo en el año de inicio de actividad profesional y en los 2 años siguientes (3 años en total). Requiere comunicar esta circunstancia al pagador mediante declaración expresa.',
    base: 'Art. 95.1 RIRPF — Reducción por inicio de actividad',
    cuando:
      'Aplicable el año natural de inicio de actividad en el censo de la AEAT (alta en IAE) y los dos ejercicios siguientes.',
    quien:
      'Solo cuando el pagador es empresa o profesional (mismo criterio que el 15%). El autónomo debe entregar al cliente una declaración escrita indicando que está en período de inicio y que no ha ejercido antes la misma actividad.',
    advertencia:
      'Debes conservar la declaración entregada al cliente. Si anteriormente ejerciste la misma actividad, no puedes aplicar el 7%.',
    color: 'verde',
  },
  arrendamiento: {
    porcentaje: '19%',
    titulo: 'Retención por arrendamiento de inmuebles',
    descripcion:
      'Alquiler de locales comerciales, oficinas, naves industriales o garajes destinados a actividades económicas.',
    base: 'Art. 100 RIRPF — Arrendamientos de inmuebles urbanos',
    cuando: 'Cuando el arrendatario (inquilino) es una empresa o profesional que ejerce actividad económica.',
    quien:
      'El arrendatario (quien paga el alquiler) practica la retención al arrendador. NO se aplica en alquiler de vivienda habitual.',
    advertencia:
      'El alquiler de garajes independientes destinados a vivienda puede estar exento. Consulta con tu asesor.',
    color: 'naranja',
  },
  'administrador-grande': {
    porcentaje: '35%',
    titulo: 'Retención administradores y consejeros — empresa grande',
    descripcion:
      'Retribuciones a miembros de consejos de administración y órganos de gobierno en empresas cuyo importe neto de la cifra de negocios supera los 100.000 € anuales.',
    base: 'Art. 101.2 LIRPF + Art. 80.1.3º RIRPF',
    cuando: 'Cuando la sociedad tiene un importe neto de cifra de negocios (INCN) superior a 100.000 €/año.',
    quien: 'La sociedad pagadora practica la retención sobre las retribuciones al administrador o consejero.',
    color: 'rojo',
  },
  'administrador-pequena': {
    porcentaje: '19%',
    titulo: 'Retención administradores y consejeros — empresa pequeña',
    descripcion:
      'Retribuciones a miembros de consejos de administración y órganos de gobierno en empresas con cifra de negocios inferior o igual a 100.000 € anuales.',
    base: 'Art. 101.2 LIRPF + Art. 80.1.3º RIRPF',
    cuando: 'Cuando la sociedad tiene un importe neto de cifra de negocios (INCN) igual o inferior a 100.000 €/año.',
    quien: 'La sociedad pagadora practica la retención sobre las retribuciones al administrador o consejero.',
    color: 'azul',
  },
  'agricola-cereales': {
    porcentaje: '2%',
    titulo: 'Retención actividades agrícolas, ganaderas y pesqueras generales',
    descripcion:
      'Rendimientos de actividades agrícolas, ganaderas y pesqueras en general: cereales, hortalizas, frutas, cría de ganado bovino, ovino, caprino y cunicultura.',
    base: 'Art. 95.4 RIRPF',
    cuando: 'Cuando el pagador es empresa o empresario y la actividad está encuadrada en este régimen.',
    quien: 'El pagador (empresa compradora o cooperativa) practica la retención al productor agrícola.',
    color: 'verde',
  },
  'agricola-porcino': {
    porcentaje: '1%',
    titulo: 'Retención engorde ganado porcino y avícola',
    descripcion: 'Actividades de engorde de ganado porcino y avícola.',
    base: 'Art. 95.4 RIRPF — excepción para porcino y aviar',
    cuando: 'Específico para actividades de engorde porcino (cerdo) y avícola (pollo, pavo, etc.).',
    quien: 'El pagador (empresa compradora) practica la retención al productor.',
    color: 'verde',
  },
  forestal: {
    porcentaje: '2%',
    titulo: 'Retención actividades forestales',
    descripcion: 'Rendimientos procedentes de actividades forestales (silvicultura, explotación de madera, etc.).',
    base: 'Art. 95.5 RIRPF',
    cuando: 'Cuando el pagador es empresa y la actividad está acogida al régimen de estimación objetiva forestal.',
    quien: 'El pagador (empresa o industria maderera) practica la retención al productor forestal.',
    color: 'verde',
  },
  particular: {
    porcentaje: '0%',
    titulo: 'Sin retención — Cliente particular',
    descripcion:
      'Cuando el cliente es una persona física que actúa como consumidor final (no en el ejercicio de una actividad económica), no se practica retención.',
    base: 'Art. 95 RIRPF — Obligados a retener',
    cuando:
      'Siempre que el pagador sea un particular (consumidor final), aunque el autónomo esté en IRPF y emita factura.',
    quien:
      'Solo están obligados a retener quienes paguen en el ejercicio de actividades económicas: empresas, sociedades, autónomos y profesionales. Los particulares no tienen esa obligación.',
    color: 'gris',
  },
  modulos: {
    porcentaje: '1%',
    titulo: 'Retención especial — Autónomos en módulos',
    descripcion:
      'Autónomos en estimación objetiva (módulos) que emiten facturas a empresas o profesionales. Tipo reducido del 1% con carácter general.',
    base: 'Art. 95.6 RIRPF — Estimación objetiva',
    cuando: 'Cuando el autónomo tributa en el régimen de estimación objetiva (módulos) y factura a empresas.',
    quien:
      'El cliente empresa practica la retención del 1% sobre el importe de la factura. Hay excepciones: actividades agrícolas y forestales tienen sus propios tipos.',
    advertencia:
      'Existen exclusiones y actividades con tipos distintos en módulos. Verifica tu actividad específica con tu asesor.',
    color: 'azul',
  },
};

// ============================================================================
// Opciones del selector
// ============================================================================

const OPCIONES_PERFIL: { valor: PerfilTipo; etiqueta: string; grupo: string }[] = [
  { valor: 'profesional-general', etiqueta: '💼 Profesional con más de 2 años de actividad', grupo: 'Profesionales (Art. 95 RIRPF)' },
  { valor: 'profesional-inicio', etiqueta: '🆕 Profesional en inicio de actividad (primeros 3 años)', grupo: 'Profesionales (Art. 95 RIRPF)' },
  { valor: 'particular', etiqueta: '🏠 Mi cliente es un particular (consumidor final)', grupo: 'Clientes particulares' },
  { valor: 'arrendamiento', etiqueta: '🏢 Alquiler de local, oficina o nave a empresa', grupo: 'Arrendamientos' },
  { valor: 'administrador-grande', etiqueta: '🏦 Administrador/consejero en empresa >100.000 €/año', grupo: 'Administradores y consejeros' },
  { valor: 'administrador-pequena', etiqueta: '🏪 Administrador/consejero en empresa ≤100.000 €/año', grupo: 'Administradores y consejeros' },
  { valor: 'agricola-cereales', etiqueta: '🌾 Actividad agrícola/ganadera/pesquera general', grupo: 'Actividades agrícolas y forestales' },
  { valor: 'agricola-porcino', etiqueta: '🐷 Engorde de ganado porcino o avícola', grupo: 'Actividades agrícolas y forestales' },
  { valor: 'forestal', etiqueta: '🌲 Actividad forestal', grupo: 'Actividades agrícolas y forestales' },
  { valor: 'modulos', etiqueta: '📋 Autónomo en módulos (estimación objetiva)', grupo: 'Regímenes especiales' },
];

// ============================================================================
// Componente Principal
// ============================================================================

export default function OrientadorFacturacionRetencionPage() {
  const [perfil, setPerfil] = useState<PerfilTipo>('');
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const resultado = perfil ? RETENCIONES[perfil] : null;

  const handleSeleccionar = (valor: PerfilTipo) => {
    setPerfil(valor);
    setMostrarResultado(true);
  };

  const handleReset = () => {
    setPerfil('');
    setMostrarResultado(false);
  };

  const colorClass = resultado
    ? {
        azul: styles.colorAzul,
        verde: styles.colorVerde,
        naranja: styles.colorNaranja,
        rojo: styles.colorRojo,
        gris: styles.colorGris,
      }[resultado.color]
    : '';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}><span aria-hidden="true">🧾</span> Suite Freelance</span>
            <h1 className={styles.heroTitle}>Orientador de Retenciones IRPF</h1>
            <p className={styles.heroSubtitle}>
              Descubre qué retención aplicar en tus facturas como autónomo o profesional en España
            </p>
          </div>
        </header>

        <RegionBadge variant="es-only" />

        <main className={styles.main}>
          <LegalNotice />

          <DisclaimerCard
            variant="financial"
            severity="critical"
            collapsible={false}
          />

          <DataReference
            normativa="IRPF 2025 — Retenciones profesionales"
            fuente="Real Decreto 439/2007 (RIRPF), arts. 95-101 + LPGE 2025"
            verificado="2025-01-01"
            urlOficial="https://www.agenciatributaria.es/AEAT.internet/Inicio/Ayuda/Modelos__Procedimientos_y_Servicios/Ayuda_Modelo_111/Informacion_general/Retenciones_e_ingresos_a_cuenta/Rendimientos_del_trabajo_y_de_actividades_economicas/Retenciones_e_ingresos_a_cuenta/Rendimientos_del_trabajo_y_de_actividades_economicas.shtml"
          />

          {/* Selector de perfil */}
          <section className={styles.selectorSection}>
            <h2 className={styles.sectionTitle}>¿Cuál es tu situación?</h2>
            <p className={styles.sectionDesc}>
              Selecciona el perfil que mejor describe tu situación para conocer el porcentaje de retención aplicable.
            </p>

            <div className={styles.opciones}>
              {OPCIONES_PERFIL.map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${perfil === opcion.valor ? styles.opcionBtnActiva : ''}`}
                  onClick={() => handleSeleccionar(opcion.valor)}
                  aria-pressed={perfil === opcion.valor}
                >
                  <span className={styles.opcionEtiqueta}>{opcion.etiqueta}</span>
                  <span className={styles.opcionGrupo}>{opcion.grupo}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Resultado */}
          {mostrarResultado && resultado && (
            <section className={`${styles.resultadoSection} ${colorClass}`} role="region" aria-live="polite" aria-label="Resultado de retención">
              <div className={styles.resultadoHeader}>
                <span className={styles.resultadoPorcentaje}>{resultado.porcentaje}</span>
                <div>
                  <h3 className={styles.resultadoTitulo}>{resultado.titulo}</h3>
                  <p className={styles.resultadoBase}>{resultado.base}</p>
                </div>
              </div>

              <p className={styles.resultadoDesc}>{resultado.descripcion}</p>

              <div className={styles.resultadoDetalles}>
                <div className={styles.detalleBloque}>
                  <span className={styles.detalleTitulo}><span aria-hidden="true">📅</span> ¿Cuándo se aplica?</span>
                  <span className={styles.detalleTexto}>{resultado.cuando}</span>
                </div>
                <div className={styles.detalleBloque}>
                  <span className={styles.detalleTitulo}><span aria-hidden="true">👥</span> ¿Quién retiene?</span>
                  <span className={styles.detalleTexto}>{resultado.quien}</span>
                </div>
              </div>

              {resultado.advertencia && (
                <div className={styles.advertenciaBloque} role="alert">
                  <span className={styles.advertenciaIcono} aria-hidden="true">⚠️</span>
                  <span>{resultado.advertencia}</span>
                </div>
              )}

              <button type="button" className={styles.resetBtn} onClick={handleReset}>
                ← Consultar otra situación
              </button>
            </section>
          )}

          {/* Tabla comparativa resumen */}
          <section className={styles.tablaSection}>
            <h2 className={styles.sectionTitle}>Resumen de tipos de retención 2025</h2>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Tipo de rendimiento</th>
                    <th>Retención</th>
                    <th>Base legal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Profesional general (Art. 95 RIRPF)</td>
                    <td className={styles.tablaPorcentaje}>15%</td>
                    <td>Art. 95.1 RIRPF</td>
                  </tr>
                  <tr>
                    <td>Profesional inicio de actividad (primeros 3 años)</td>
                    <td className={styles.tablaPorcentaje}>7%</td>
                    <td>Art. 95.1 RIRPF</td>
                  </tr>
                  <tr>
                    <td>Arrendamiento de locales, oficinas, naves</td>
                    <td className={styles.tablaPorcentaje}>19%</td>
                    <td>Art. 100 RIRPF</td>
                  </tr>
                  <tr>
                    <td>Administradores/consejeros (empresa &gt;100.000 €)</td>
                    <td className={styles.tablaPorcentaje}>35%</td>
                    <td>Art. 80.1.3º RIRPF</td>
                  </tr>
                  <tr>
                    <td>Administradores/consejeros (empresa ≤100.000 €)</td>
                    <td className={styles.tablaPorcentaje}>19%</td>
                    <td>Art. 80.1.3º RIRPF</td>
                  </tr>
                  <tr>
                    <td>Actividades agrícolas/ganaderas generales</td>
                    <td className={styles.tablaPorcentaje}>2%</td>
                    <td>Art. 95.4 RIRPF</td>
                  </tr>
                  <tr>
                    <td>Engorde porcino y avícola</td>
                    <td className={styles.tablaPorcentaje}>1%</td>
                    <td>Art. 95.4 RIRPF</td>
                  </tr>
                  <tr>
                    <td>Actividades forestales</td>
                    <td className={styles.tablaPorcentaje}>2%</td>
                    <td>Art. 95.5 RIRPF</td>
                  </tr>
                  <tr>
                    <td>Autónomos en módulos (estimación objetiva)</td>
                    <td className={styles.tablaPorcentaje}>1%</td>
                    <td>Art. 95.6 RIRPF</td>
                  </tr>
                  <tr>
                    <td>Cliente particular (consumidor final)</td>
                    <td className={styles.tablaPorcentaje}>0%</td>
                    <td>Art. 95 RIRPF</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Declaración trimestral */}
          <section className={styles.declaracionSection}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Cómo declarar las retenciones</h2>
            <div className={styles.declaracionGrid}>
              <div className={styles.declaracionCard}>
                <div className={styles.declaracionIcono} aria-hidden="true">📅</div>
                <h3>Modelo 111 — Trimestral</h3>
                <p>Declaración trimestral de retenciones e ingresos a cuenta del IRPF sobre rendimientos del trabajo y actividades económicas.</p>
                <ul className={styles.declaracionLista}>
                  <li><strong>1T:</strong> 1–20 de abril</li>
                  <li><strong>2T:</strong> 1–20 de julio</li>
                  <li><strong>3T:</strong> 1–20 de octubre</li>
                  <li><strong>4T:</strong> 1–20 de enero (año siguiente)</li>
                </ul>
              </div>
              <div className={styles.declaracionCard}>
                <div className={styles.declaracionIcono} aria-hidden="true">📊</div>
                <h3>Modelo 190 — Resumen anual</h3>
                <p>Resumen anual de retenciones e ingresos a cuenta. Detalla a cada perceptor las retenciones practicadas durante el ejercicio.</p>
                <ul className={styles.declaracionLista}>
                  <li><strong>Plazo:</strong> 1–31 de enero del año siguiente</li>
                  <li>Incluye todos los perceptores</li>
                  <li>Coincide con datos del modelo 111</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección educativa v2.0 */}
          <EducationalSection title="📚 Guía completa de retenciones para autónomos" subtitle="Todo lo que necesitas saber sobre retenciones IRPF en facturas: tipos, cálculo, modelos 111 y 190, y errores frecuentes.">
            <div className={styles.educativo}>

              {/* Intro */}
              <p>
                La retención del IRPF es una cantidad que el pagador descuenta de la factura y la ingresa directamente a Hacienda en nombre del profesional.
                No es un coste adicional: reduce el IRPF que el autónomo tendrá que pagar en su declaración anual. Si se ha retenido demasiado,
                la declaración saldrá a devolver.
              </p>

              {/* Cómo incluir la retención en una factura */}
              <h3>Cómo incluir la retención en una factura — Paso a paso</h3>
              <ol className={styles.pasosList}>
                <li>
                  <strong>Base imponible:</strong> Importe de tus servicios antes de impuestos.
                  <br />Ej: 1.000 €
                </li>
                <li>
                  <strong>IVA:</strong> Suma el IVA correspondiente (21% general).
                  <br />Ej: + 210 € = 1.210 €
                </li>
                <li>
                  <strong>Retención IRPF:</strong> Resta el porcentaje de retención sobre la base imponible.
                  <br />Ej: — 150 € (15% × 1.000 €)
                </li>
                <li>
                  <strong>Total a cobrar:</strong> Base + IVA — Retención.
                  <br />Ej: 1.000 + 210 — 150 = <strong>1.060 €</strong>
                </li>
                <li>
                  <strong>Indicación obligatoria:</strong> La factura debe indicar el porcentaje y el importe de la retención con la mención
                  "Retención IRPF 15%" o el porcentaje que corresponda.
                </li>
              </ol>

              {/* FAQ */}
              <h3>Preguntas frecuentes</h3>

              <details className={styles.faqItem}>
                <summary>¿Qué pasa si no aplico la retención cuando debería?</summary>
                <p>
                  Si emites una factura sin retención a una empresa cuando sí deberías haberla incluido, el cliente puede solicitar
                  que rectifiques la factura o que le devuelvas la parte de la retención. En tu declaración de IRPF, Hacienda
                  calculará el impuesto sobre tu renta total, independientemente de si retuvieron o no. También puedes incurrir
                  en sanción si hay un patrón sistemático de no retención.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Puede el cliente negarse a retenerme?</summary>
                <p>
                  No. Si eres profesional y tu cliente es empresa o autónomo en el ejercicio de su actividad, la retención es
                  obligatoria por ley. El cliente no puede "elegir" no retener. Si se niega, puedes facturar igualmente con
                  la retención incluida y será responsabilidad del cliente no haberla ingresado a Hacienda.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Cómo solicito aplicar el 7% de inicio de actividad?</summary>
                <p>
                  Debes entregar al cliente una <strong>declaración escrita</strong> en la que conste que estás en el período
                  de inicio de actividad (primero o segundo año tras el alta en el IAE/AEAT) y que no has ejercido anteriormente
                  la misma actividad. No existe un modelo oficial obligatorio, pero debe contener: tu nombre, NIF, fecha de inicio
                  de actividad y la declaración de que cumples los requisitos. Guarda una copia firmada por el cliente.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿La retención se aplica sobre el IVA?</summary>
                <p>
                  No. La retención del IRPF se calcula siempre sobre la <strong>base imponible</strong> (el importe del servicio
                  antes de IVA), nunca sobre el importe total con IVA. Esto es una confusión frecuente.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Qué ocurre si el cliente es una empresa extranjera?</summary>
                <p>
                  Si el cliente está establecido fuera de España, en general no está obligado a practicar retención española.
                  Estas operaciones pueden tener implicaciones en convenios para evitar la doble imposición y en el IVA (operaciones
                  intracomunitarias o exportaciones). Consulta con tu asesor fiscal en estos casos.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Los autónomos en módulos tienen alguna particularidad?</summary>
                <p>
                  Sí. Los autónomos en estimación objetiva (módulos) tienen una retención reducida del 1% cuando facturan a empresas.
                  Sin embargo, las actividades agrícolas, forestales y pesqueras tienen sus propios tipos (2% o 1% según el caso).
                  Además, si un autónomo en módulos supera ciertos umbrales de facturación, puede quedar excluido del régimen.
                </p>
              </details>

              {/* Errores frecuentes */}
              <h3>Errores frecuentes y cómo evitarlos</h3>
              <ul className={styles.erroresList}>
                <li>
                  <strong>Error 1 — Retener a particulares:</strong> La retención solo se practica cuando el pagador es empresa
                  o profesional. Nunca cuando el cliente es un consumidor final.
                </li>
                <li>
                  <strong>Error 2 — Calcular la retención sobre el total con IVA:</strong> Siempre se calcula sobre la base imponible.
                </li>
                <li>
                  <strong>Error 3 — Aplicar el 7% sin declaración escrita:</strong> El tipo reducido de inicio de actividad requiere
                  comunicarlo formalmente al cliente con una declaración.
                </li>
                <li>
                  <strong>Error 4 — No presentar el modelo 111:</strong> Aunque en un trimestre no hayas cobrado ninguna factura
                  con retención, puede ser necesario presentar el modelo "sin actividad". Consulta con tu gestoría.
                </li>
                <li>
                  <strong>Error 5 — Confundir modelo 111 con 115:</strong> El modelo 115 es para retenciones de arrendamientos de inmuebles.
                  El 111 es para rendimientos del trabajo y actividades económicas.
                </li>
              </ul>

              {/* Warning box — indicador v2.0 */}
              <div className={styles.warningBox} role="note">
                <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
                <p>
                  Los tipos de retención son establecidos por la normativa fiscal (RIRPF) y pueden modificarse con cada Ley de
                  Presupuestos Generales del Estado. Cualquier cambio en tu situación (inicio de actividad, cambio de régimen,
                  tipo de cliente) puede afectar al porcentaje aplicable. Esta herramienta es orientativa.{' '}
                  <strong>Consulta siempre con tu asesor fiscal antes de tomar decisiones.</strong>
                </p>
              </div>

            </div>
          </EducationalSection>

          <RelatedApps apps={getRelatedApps('orientador-facturacion-retencion')} />
          <ShareCard appName="orientador-facturacion-retencion" />
        </main>

        <Footer appName="orientador-facturacion-retencion" />
      </div>
    </>
  );
}
