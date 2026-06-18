'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './OrientadorTiposRentaIrpf.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  RegionBadge,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  TRAMOS_IRPF_2025,
  TRAMOS_AHORRO_IRPF_2025,
  FISCAL_IRPF_META,
  type TramoIRPF,
} from '@/data/fiscal';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type BaseFiscal = 'general' | 'ahorro' | 'especial';

interface Categoria {
  id: string;
  nombre: string;
  base: BaseFiscal;
  retencion: string;
  particularidad: string;
  casilla: string;
  baseLegal: string;
}

interface Caso {
  id: string;
  icon: string;
  label: string;
  grupo: string;
  categoriaId: string;
  baseOverride?: BaseFiscal; // p. ej. premios, que son ganancia pero en base general
  tributa: string; // explicación específica del caso
  particularidad?: string; // sobreescribe la de la categoría si procede
  alerta: string;
}

// ─── Categorías de renta (Ley 35/2006) ──────────────────────────────────────────

const CATEGORIAS: Record<string, Categoria> = {
  trabajo: {
    id: 'trabajo',
    nombre: 'Rendimiento del trabajo',
    base: 'general',
    retencion: 'Variable según las tablas de retención: a mayor sueldo, mayor porcentaje.',
    particularidad:
      'Da derecho a un gasto deducible de 2.000 €/año y a la reducción por rendimientos del trabajo en rentas bajas.',
    casilla: 'Casillas 0003 y siguientes del borrador',
    baseLegal: 'Arts. 17-20 Ley 35/2006 del IRPF.',
  },
  actividad: {
    id: 'actividad',
    nombre: 'Rendimiento de actividad económica',
    base: 'general',
    retencion: 'Profesionales: 15 % en factura (7 % los primeros años). Empresarios en estimación directa: sin retención.',
    particularidad: 'Tributa el rendimiento neto (ingresos − gastos deducibles), con pagos fraccionados trimestrales (modelo 130).',
    casilla: 'Modelo 100 (renta) + modelo 130 trimestral',
    baseLegal: 'Arts. 27-32 Ley 35/2006 del IRPF.',
  },
  'capital-inmobiliario': {
    id: 'capital-inmobiliario',
    nombre: 'Rendimiento del capital inmobiliario',
    base: 'general',
    retencion: '19 % si el inquilino es una empresa o profesional; sin retención si alquilas vivienda a un particular.',
    particularidad: 'Tributa el rendimiento neto (renta − gastos deducibles como IBI, comunidad, intereses o amortización).',
    casilla: 'Casillas 0102 y siguientes',
    baseLegal: 'Arts. 22-24 Ley 35/2006 del IRPF.',
  },
  'capital-mobiliario': {
    id: 'capital-mobiliario',
    nombre: 'Rendimiento del capital mobiliario',
    base: 'ahorro',
    retencion: '19 % en origen (dividendos, intereses de cuentas y depósitos).',
    particularidad: 'Incluye dividendos, intereses, rendimientos de seguros y de la cesión de capitales a terceros.',
    casilla: 'Casillas 0027 y siguientes',
    baseLegal: 'Art. 25 Ley 35/2006 del IRPF.',
  },
  ganancia: {
    id: 'ganancia',
    nombre: 'Ganancia o pérdida patrimonial',
    base: 'ahorro',
    retencion: 'Reembolso de fondos: 19 %. Venta directa de acciones, criptos o inmuebles: sin retención (salvo vendedor no residente).',
    particularidad: 'Tributa la diferencia entre el valor de transmisión y el de adquisición. Las pérdidas compensan ganancias.',
    casilla: 'Casillas 0328 y siguientes',
    baseLegal: 'Arts. 33-37 Ley 35/2006 del IRPF.',
  },
  imputacion: {
    id: 'imputacion',
    nombre: 'Imputación de renta inmobiliaria',
    base: 'general',
    retencion: 'Sin retención: no es un ingreso real, sino una renta que la ley te atribuye.',
    particularidad: 'Se imputa el 1,1 % o el 2 % del valor catastral de los inmuebles a tu disposición que no son tu vivienda habitual ni están alquilados.',
    casilla: 'Casillas 0085 y siguientes',
    baseLegal: 'Art. 85 Ley 35/2006 del IRPF.',
  },
  especial: {
    id: 'especial',
    nombre: 'Gravamen especial (premios de lotería)',
    base: 'especial',
    retencion: 'Retención del 20 % sobre el importe del premio que excede de 40.000 € exentos.',
    particularidad: 'No va ni en la base general ni en la del ahorro: tiene un gravamen especial propio del 20 %.',
    casilla: 'Retención en origen (modelo 136 si no se retuvo)',
    baseLegal: 'Disposición adicional 33ª Ley 35/2006 del IRPF.',
  },
};

// ─── Casos reales ────────────────────────────────────────────────────────────

const CASOS: Caso[] = [
  // Trabajo y prestaciones
  {
    id: 'nomina', icon: '💼', label: 'Nómina o salario', grupo: 'Trabajo y prestaciones',
    categoriaId: 'trabajo',
    tributa: 'Tu sueldo es el caso típico de rendimiento del trabajo: tributa en la base general por la escala progresiva.',
    alerta: 'Con dos o más pagadores, el umbral para estar obligado a declarar baja: revisa si superas los 15.876 €.',
  },
  {
    id: 'pension', icon: '👴', label: 'Pensión de jubilación', grupo: 'Trabajo y prestaciones',
    categoriaId: 'trabajo',
    tributa: 'Las pensiones públicas tributan como rendimiento del trabajo, igual que un salario.',
    particularidad: 'A partir de 65 y 75 años el mínimo personal es mayor, lo que reduce tu tributación.',
    alerta: 'Muchos pensionistas con un solo pagador no declaran, pero con dos pagadores (p. ej. dos pensiones) puede surgir la obligación.',
  },
  {
    id: 'paro', icon: '📋', label: 'Prestación por desempleo', grupo: 'Trabajo y prestaciones',
    categoriaId: 'trabajo',
    tributa: 'El paro tributa como rendimiento del trabajo; no está exento.',
    alerta: 'Error muy común: creer que el paro no tributa. Sí lo hace. Solo el pago único para emprender puede estar exento.',
  },
  {
    id: 'rescate-plan', icon: '🏦', label: 'Rescate de plan de pensiones', grupo: 'Trabajo y prestaciones',
    categoriaId: 'trabajo',
    tributa: 'El dinero rescatado de un plan de pensiones tributa como rendimiento del trabajo, no como ganancia.',
    particularidad: 'Rescatar todo de golpe en forma de capital puede dispararte a un tramo marginal alto. Hacerlo en forma de renta suele ser más eficiente.',
    alerta: 'Confundirlo con una ganancia patrimonial (base del ahorro) es un error frecuente: va a la base general, que tributa más.',
  },
  // Negocio
  {
    id: 'factura-autonomo', icon: '🧾', label: 'Factura como autónomo', grupo: 'Negocio y actividad',
    categoriaId: 'actividad',
    tributa: 'Lo que facturas en tu actividad es rendimiento de actividad económica: tributa el neto en la base general.',
    alerta: 'Tributa el rendimiento neto, no lo que facturas: olvidarte de deducir gastos legítimos te hace pagar de más.',
  },
  {
    id: 'creador', icon: '📹', label: 'Ingresos de YouTube, Twitch o redes', grupo: 'Negocio y actividad',
    categoriaId: 'actividad',
    tributa: 'Si es una actividad habitual y organizada, son rendimientos de actividad económica y exigen alta de autónomo.',
    particularidad: 'Un ingreso totalmente aislado y esporádico podría ser ganancia patrimonial, pero la regularidad lo convierte en actividad económica.',
    alerta: 'Cobrar de plataformas extranjeras no exime de declarar en España si resides aquí. Además puede haber implicaciones de IVA.',
  },
  // Inmuebles
  {
    id: 'alquiler-vivienda', icon: '🏠', label: 'Alquiler de una vivienda', grupo: 'Inmuebles',
    categoriaId: 'capital-inmobiliario',
    tributa: 'El alquiler de una vivienda es rendimiento del capital inmobiliario y tributa en la base general.',
    particularidad: 'El alquiler de vivienda habitual da derecho a una reducción del 50 % al 90 % del rendimiento neto según la zona y el contrato (Ley 12/2023).',
    alerta: 'No declarar el alquiler es fácilmente detectable (el inquilino puede deducirlo o constar en suministros). La reducción solo se aplica si lo declaras.',
  },
  {
    id: 'alquiler-local', icon: '🏢', label: 'Alquiler de local o garaje', grupo: 'Inmuebles',
    categoriaId: 'capital-inmobiliario',
    tributa: 'También es rendimiento del capital inmobiliario, pero sin la reducción que sí tiene la vivienda.',
    particularidad: 'El arrendatario empresa o profesional suele practicarte una retención del 19 %. Lleva IVA (no así la vivienda).',
    alerta: 'A diferencia de la vivienda, el alquiler de local NO tiene reducción y además repercute IVA: dos diferencias clave.',
  },
  {
    id: 'segunda-vivienda', icon: '🏖️', label: 'Segunda vivienda vacía', grupo: 'Inmuebles',
    categoriaId: 'imputacion',
    tributa: 'Una segunda vivienda a tu disposición (ni habitual ni alquilada) genera una renta imputada en la base general.',
    particularidad: 'Se imputa el 1,1 % o el 2 % del valor catastral, aunque no obtengas ningún ingreso real por ella.',
    alerta: 'Mucha gente no sabe que una segunda vivienda vacía "renta" a efectos de IRPF aunque no la use ni la alquile.',
  },
  {
    id: 'venta-vivienda', icon: '🔑', label: 'Venta de una vivienda', grupo: 'Inmuebles',
    categoriaId: 'ganancia',
    tributa: 'La venta genera una ganancia patrimonial (valor de venta − valor de compra) que tributa en la base del ahorro.',
    particularidad: 'Exenta si reinviertes en tu vivienda habitual, o si tienes 65+ años y vendes tu vivienda habitual.',
    alerta: 'No olvides sumar al valor de compra los gastos e impuestos (ITP/IVA, notaría) y las mejoras: reducen la ganancia.',
  },
  // Inversiones
  {
    id: 'dividendos', icon: '💹', label: 'Dividendos de acciones', grupo: 'Inversiones',
    categoriaId: 'capital-mobiliario',
    tributa: 'Los dividendos son rendimientos del capital mobiliario y tributan en la base del ahorro.',
    alerta: 'Te retienen un 19 % en origen, pero el tipo final puede ser mayor: la retención es un anticipo, no el impuesto definitivo.',
  },
  {
    id: 'intereses', icon: '🏦', label: 'Intereses de cuenta o depósito', grupo: 'Inversiones',
    categoriaId: 'capital-mobiliario',
    tributa: 'Los intereses bancarios son rendimientos del capital mobiliario, base del ahorro.',
    alerta: 'Aunque sean pocos euros, se acumulan con el resto de rendimientos del ahorro para fijar tu tramo.',
  },
  {
    id: 'letras', icon: '📜', label: 'Intereses de Letras del Tesoro', grupo: 'Inversiones',
    categoriaId: 'capital-mobiliario',
    tributa: 'El rendimiento de las Letras del Tesoro es capital mobiliario, base del ahorro.',
    particularidad: 'Las Letras NO tienen retención en origen, pero debes declararlas igualmente.',
    alerta: 'Al no haber retención, es fácil olvidarlas: Hacienda sí tiene el dato y puede reclamártelas.',
  },
  {
    id: 'venta-acciones', icon: '📈', label: 'Venta de acciones o fondos', grupo: 'Inversiones',
    categoriaId: 'ganancia',
    tributa: 'La venta genera una ganancia o pérdida patrimonial que tributa en la base del ahorro.',
    particularidad: 'En fondos de inversión puedes traspasar entre fondos sin tributar; en acciones directas, cada venta tributa.',
    alerta: 'Cuidado con la "regla de los dos meses": recomprar el mismo valor en 2 meses impide computar la pérdida.',
  },
  {
    id: 'cripto-venta', icon: '🪙', label: 'Venta de criptomonedas', grupo: 'Inversiones',
    categoriaId: 'ganancia',
    tributa: 'Vender o permutar criptomonedas genera una ganancia o pérdida patrimonial en la base del ahorro.',
    particularidad: 'Permutar una cripto por otra ya es una alteración patrimonial: tributa aunque no pases a euros.',
    alerta: 'Cambiar Bitcoin por otra cripto cuenta como venta. Llevar un registro de fechas y precios es imprescindible.',
  },
  {
    id: 'cripto-staking', icon: '⛏️', label: 'Recompensas de staking de criptos', grupo: 'Inversiones',
    categoriaId: 'capital-mobiliario',
    tributa: 'Las recompensas por staking o por prestar criptoactivos son rendimientos del capital mobiliario, base del ahorro.',
    particularidad: 'Distinto de vender: aquí no transmites, obtienes un rendimiento. Minar de forma habitual sería actividad económica.',
    alerta: 'Confundir staking (rendimiento) con la venta (ganancia) es un error habitual; ambos van a la base del ahorro pero por conceptos distintos.',
  },
  // Otros
  {
    id: 'premio-loteria', icon: '🎰', label: 'Premio de lotería (ONLAE, ONCE…)', grupo: 'Otros',
    categoriaId: 'especial',
    tributa: 'Los premios de loterías y apuestas del Estado, ONCE, Cruz Roja y equivalentes de la UE tienen un gravamen especial del 20 %.',
    particularidad: 'Los primeros 40.000 € de cada premio están exentos; el 20 % se aplica solo sobre el exceso.',
    alerta: 'No se mezcla con el resto de tu renta: ni sube tu tipo general ni se compensa con pérdidas. Suele venir ya retenido.',
  },
  {
    id: 'premio-concurso', icon: '🏆', label: 'Premio de un concurso o sorteo', grupo: 'Otros',
    categoriaId: 'ganancia',
    baseOverride: 'general',
    tributa: 'Un premio de un concurso (no de lotería) es una ganancia patrimonial que NO deriva de una transmisión: va a la base general.',
    particularidad: 'Las ganancias que no proceden de vender algo (premios, subvenciones, ayudas) tributan en la base general, no en la del ahorro.',
    alerta: 'Suele llevar una retención o ingreso a cuenta del 19 %. Los premios en especie se valoran por su valor de mercado más el ingreso a cuenta.',
  },
  {
    id: 'subvencion', icon: '📨', label: 'Subvención o ayuda pública', grupo: 'Otros',
    categoriaId: 'ganancia',
    baseOverride: 'general',
    tributa: 'La mayoría de subvenciones y ayudas son ganancias patrimoniales que tributan en la base general.',
    particularidad: 'Algunas ayudas concretas están exentas por ley; otras (como el Ingreso Mínimo Vital) tributan como trabajo. Revisa la norma de cada ayuda.',
    alerta: 'Cobrar una ayuda obliga, en muchos casos, a presentar la declaración aunque tus demás rentas sean bajas.',
  },
  {
    id: 'wallapop', icon: '📦', label: 'Venta en Wallapop de segunda mano', grupo: 'Otros',
    categoriaId: 'ganancia',
    tributa: 'Vender objetos usados es una alteración patrimonial: ganancia o pérdida patrimonial en la base del ahorro.',
    particularidad: 'Si vendes por debajo de lo que te costó (lo habitual en segunda mano), hay pérdida que no se computa: normalmente no hay que declararlo.',
    alerta: 'Solo tributas si vendes con beneficio (un objeto revalorizado). Vender de forma habitual con ánimo de lucro sería actividad económica.',
  },
];

const GRUPOS = ['Trabajo y prestaciones', 'Negocio y actividad', 'Inmuebles', 'Inversiones', 'Otros'];

const BASE_LABEL: Record<BaseFiscal, string> = {
  general: 'Base general',
  ahorro: 'Base del ahorro',
  especial: 'Gravamen especial',
};

// ─── Utilidades ────────────────────────────────────────────────────────────────

function tramoMarginal(importe: number, tramos: TramoIRPF[]): number {
  for (const t of tramos) {
    if (importe <= t.hasta) return t.tipo;
  }
  return tramos[tramos.length - 1].tipo;
}

// ─── Componente principal ────────────────────────────────────────────────────────

export default function OrientadorTiposRentaIrpfPage() {
  const [casoId, setCasoId] = useState<string>('nomina');
  const [importeTexto, setImporteTexto] = useState('');

  const caso = CASOS.find((c) => c.id === casoId) ?? CASOS[0];
  const categoria = CATEGORIAS[caso.categoriaId];
  const base: BaseFiscal = caso.baseOverride ?? categoria.base;
  const importe = parseSpanishNumber(importeTexto) || 0;

  const tramos = base === 'ahorro' ? TRAMOS_AHORRO_IRPF_2025 : TRAMOS_IRPF_2025;
  const marginalAhorro = base === 'ahorro' && importe > 0 ? tramoMarginal(importe, TRAMOS_AHORRO_IRPF_2025) : null;

  const particularidad = caso.particularidad ?? categoria.particularidad;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🧭</span> Orientador de tipos de renta en el IRPF
        </h1>
        <p className={styles.subtitle}>
          ¿Cómo tributa ese ingreso? Elige tu caso —nómina, alquiler, dividendos, criptos, venta de acciones…— y descubre
          en qué base tributa, con qué escala y qué retención le corresponde.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical" collapsible={false} />
      <DataReference
        normativa={`IRPF ${FISCAL_IRPF_META.vigencia}`}
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
        nota={FISCAL_IRPF_META.nota}
      />

      {/* ── Selector de caso ── */}
      <section className={styles.selectorSeccion} aria-label="Elige el tipo de ingreso">
        <h2 className={styles.selectorTitulo}>¿Qué ingreso quieres clasificar?</h2>
        {GRUPOS.map((grupo) => (
          <div key={grupo} className={styles.grupoBloque}>
            <span className={styles.grupoLabel}>{grupo}</span>
            <div className={styles.casosGrid}>
              {CASOS.filter((c) => c.grupo === grupo).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.casoBtn} ${casoId === c.id ? styles.casoBtnActivo : ''}`}
                  aria-pressed={casoId === c.id}
                  onClick={() => setCasoId(c.id)}
                >
                  <span className={styles.casoIcon} aria-hidden="true">{c.icon}</span>
                  <span className={styles.casoLabel}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Resultado ── */}
      <section className={styles.resultado} aria-label="Cómo tributa este ingreso">
        <div className={`${styles.resultadoHeader} ${styles[`base_${base}`]}`}>
          <div>
            <span className={styles.resultadoCaso}>
              <span aria-hidden="true">{caso.icon}</span> {caso.label}
            </span>
            <h2 className={styles.resultadoCategoria}>{categoria.nombre}</h2>
          </div>
          <span className={styles.resultadoBadge}>{BASE_LABEL[base]}</span>
        </div>

        <div className={styles.resultadoCuerpo}>
          <p className={styles.tributaTexto}>{caso.tributa}</p>

          <div className={styles.datosGrid}>
            {/* Escala aplicable */}
            <div className={styles.datoCard}>
              <h3 className={styles.datoTitulo}>Escala aplicable</h3>
              {base === 'especial' ? (
                <p className={styles.datoEspecial}>
                  Gravamen especial del <strong>20 %</strong> sobre el exceso de 40.000 € exentos por premio.
                </p>
              ) : (
                <>
                  <table className={styles.escalaTable}>
                    <tbody>
                      {tramos.map((t, i) => {
                        const desde = i === 0 ? 0 : tramos[i - 1].hasta;
                        return (
                          <tr key={i}>
                            <td>
                              {t.hasta === Infinity
                                ? `Más de ${formatNumber(desde, 0)} €`
                                : `${formatNumber(desde, 0)} – ${formatNumber(t.hasta, 0)} €`}
                            </td>
                            <td className={styles.escalaTipo}>{t.tipo} %</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className={styles.datoNota}>
                    {base === 'ahorro'
                      ? 'Escala propia de la base del ahorro (19 % – 28 %).'
                      : 'Escala general progresiva. El tipo final depende del conjunto de tus rentas de base general.'}
                  </p>
                </>
              )}
            </div>

            {/* Retención */}
            <div className={styles.datoCard}>
              <h3 className={styles.datoTitulo}>Retención habitual</h3>
              <p className={styles.datoTexto}>{categoria.retencion}</p>
            </div>

            {/* Particularidades */}
            <div className={styles.datoCard}>
              <h3 className={styles.datoTitulo}>Particularidades</h3>
              <p className={styles.datoTexto}>{particularidad}</p>
            </div>

            {/* Dónde se declara */}
            <div className={styles.datoCard}>
              <h3 className={styles.datoTitulo}>Dónde se declara</h3>
              <p className={styles.datoTexto}>{categoria.casilla}</p>
            </div>
          </div>

          {/* Estimación opcional del tramo marginal (solo base del ahorro) */}
          <div className={styles.importeBloque}>
            <label htmlFor="importe-renta" className={styles.importeLabel}>
              Importe del ingreso (opcional)
            </label>
            <div className={styles.importeInputWrapper}>
              <input
                id="importe-renta"
                type="text"
                inputMode="decimal"
                className={styles.importeInput}
                value={importeTexto}
                onChange={(e) => setImporteTexto(e.target.value)}
                placeholder="0"
              />
              <span className={styles.importeSufijo}>€</span>
            </div>
            {importe > 0 && (
              <p className={styles.importeResultado}>
                {base === 'ahorro' && marginalAhorro !== null ? (
                  <>
                    Para {formatNumber(importe, 0)} € en la base del ahorro, el tramo marginal sería{' '}
                    <strong>{marginalAhorro} %</strong> (de forma aislada; se suma al resto de tus rentas del ahorro).
                  </>
                ) : base === 'especial' ? (
                  <>
                    {importe > 40000
                      ? `Tributarías al 20 % sobre ${formatNumber(importe - 40000, 0)} € = ${formatNumber((importe - 40000) * 0.2, 0)} €.`
                      : 'Por debajo de 40.000 € el premio está totalmente exento.'}
                  </>
                ) : (
                  <>
                    En la base general el tipo depende del total de tus rentas. Usa el{' '}
                    <Link href="/estimador-irpf/" className={styles.enlaceInline}>
                      Estimador de IRPF
                    </Link>{' '}
                    para el cálculo completo.
                  </>
                )}
              </p>
            )}
          </div>

          <div className={styles.alertaBox}>
            <span className={styles.alertaIcon} aria-hidden="true">⚠️</span>
            <div>
              <strong>Error frecuente:</strong> {caso.alerta}
            </div>
          </div>

          <p className={styles.baseLegal}>
            <span aria-hidden="true">⚖️</span> {categoria.baseLegal}
          </p>
        </div>
      </section>

      {/* ── Sección educativa v2.0 ── */}
      <EducationalSection
        title="📚 Guía de los tipos de renta en el IRPF"
        subtitle="Entiende cómo se clasifica y tributa cada ingreso"
      >
        {/* Tabla comparativa de categorías */}
        <section className={styles.guideSection}>
          <h2>Las categorías de renta del IRPF</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Base</th>
                  <th>Escala 2025</th>
                  <th>Ejemplos</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>Trabajo</strong></td><td>General</td><td>19 % – 47 %</td><td>Nómina, pensión, paro, plan de pensiones</td></tr>
                <tr><td><strong>Actividad económica</strong></td><td>General</td><td>19 % – 47 %</td><td>Facturación de autónomos, creadores de contenido</td></tr>
                <tr><td><strong>Capital inmobiliario</strong></td><td>General</td><td>19 % – 47 %</td><td>Alquiler de vivienda, local o garaje</td></tr>
                <tr><td><strong>Capital mobiliario</strong></td><td>Ahorro</td><td>19 % – 28 %</td><td>Dividendos, intereses, staking de criptos</td></tr>
                <tr><td><strong>Ganancia patrimonial</strong></td><td>Ahorro*</td><td>19 % – 28 %</td><td>Venta de acciones, criptos o vivienda</td></tr>
                <tr><td><strong>Imputación inmobiliaria</strong></td><td>General</td><td>19 % – 47 %</td><td>Segunda vivienda vacía</td></tr>
              </tbody>
            </table>
          </div>
          <p className={styles.tablaPie}>
            *Las ganancias que NO derivan de una transmisión (premios de concursos, subvenciones, ayudas) van a la base general, no a la del ahorro.
          </p>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>¿A quién le sirve este orientador?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧾</span>
              <h3>Primera declaración</h3>
              <p>Vas a hacer la renta por primera vez y no sabes en qué casilla encaja cada ingreso que has tenido este año.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
              <h3>Pequeño inversor</h3>
              <p>Tienes acciones, fondos o criptos y quieres entender por qué unos rendimientos tributan más bajo que tu sueldo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
              <h3>Propietario que alquila</h3>
              <p>Quieres saber si el alquiler va a la base general, qué reducción te corresponde y si te retienen.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">💡</span>
              <h3>Ingresos atípicos</h3>
              <p>Has cobrado un premio, una ayuda o ingresos de internet y no tienes claro cómo se declaran.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Por qué los dividendos tributan menos que mi sueldo?</dt>
              <dd>
                Porque van a bases distintas. Tu sueldo está en la <strong>base general</strong>, con una escala que llega al 47 %.
                Los dividendos están en la <strong>base del ahorro</strong>, con una escala propia que va del 19 % al 28 %. Por eso una
                misma cantidad puede tributar muy distinto según de dónde proceda.
                <span className={styles.faqTip}>Esta es justo la idea que muestra el orientador: la categoría de la renta importa más que el importe.</span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo tributan las criptomonedas?</dt>
              <dd>
                Vender o permutar criptos genera una <strong>ganancia o pérdida patrimonial</strong> (base del ahorro). Las recompensas por{' '}
                <strong>staking</strong> o por prestar criptoactivos son <strong>rendimientos del capital mobiliario</strong> (también base del ahorro).
                Y minar de forma habitual sería <strong>actividad económica</strong> (base general). Tres regímenes para una misma "moneda".
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿La venta de mi vivienda tributa siempre?</dt>
              <dd>
                Genera una ganancia patrimonial en la base del ahorro, pero hay exenciones importantes: si <strong>reinviertes</strong> el importe en
                otra vivienda habitual, o si tienes <strong>65 o más años</strong> y vendes tu vivienda habitual. Recuerda sumar al valor de compra los
                gastos, impuestos y mejoras, porque reducen la ganancia.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Una segunda vivienda vacía hay que declararla?</dt>
              <dd>
                Sí. Aunque no la alquiles ni obtengas ingresos, la ley te imputa una renta del <strong>1,1 % o 2 % del valor catastral</strong>
                (imputación de rentas inmobiliarias, base general). Es uno de los conceptos que más sorprende a los contribuyentes.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Tengo que declarar lo que vendo en Wallapop?</dt>
              <dd>
                Normalmente no. Vender objetos usados por debajo de su precio de compra genera una <strong>pérdida que no se computa</strong>. Solo si
                vendes algo por <strong>más</strong> de lo que te costó (un objeto revalorizado) hay ganancia patrimonial. Vender de forma habitual con
                ánimo de lucro, en cambio, sería actividad económica.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿El premio de la lotería tributa en el IRPF normal?</dt>
              <dd>
                No exactamente. Los premios de loterías del Estado, ONCE, Cruz Roja y equivalentes de la UE tienen un <strong>gravamen especial del 20 %</strong>
                sobre el exceso de 40.000 € exentos. No se mezcla con el resto de tu renta. En cambio, los premios de concursos o sorteos privados sí son
                ganancia patrimonial (base general).
              </dd>
            </div>
          </dl>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo clasificar un ingreso paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>¿De dónde viene el dinero?</strong>
                <p>De tu trabajo, de tu actividad, de un inmueble, de un producto financiero o de vender algo. Ese origen marca la categoría.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>¿Es un rendimiento o una transmisión?</strong>
                <p>Un rendimiento (sueldo, alquiler, dividendo) es la "renta" del activo. Una transmisión (venta) genera ganancia o pérdida patrimonial.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Identifica la base: general o del ahorro</strong>
                <p>Trabajo, actividad, alquileres e imputaciones → base general. Dividendos, intereses y ganancias por venta → base del ahorro.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Aplica la escala correspondiente</strong>
                <p>La base general usa la escala progresiva (19 % – 47 %); la del ahorro, su escala propia (19 % – 28 %).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Revisa retenciones, reducciones y exenciones</strong>
                <p>La retención es solo un anticipo. Muchas rentas tienen reducciones (alquiler de vivienda) o exenciones (reinversión en vivienda).</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>Buenas prácticas con el IRPF</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <p><strong>La retención no es el impuesto final.</strong> Es un anticipo: el resultado real se ajusta al hacer la declaración.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📂</span>
              <p><strong>Guarda fechas y precios de compra.</strong> Para acciones, fondos y criptos son imprescindibles para calcular la ganancia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <p><strong>Compensa pérdidas con ganancias.</strong> Las pérdidas patrimoniales reducen las ganancias del mismo ejercicio y de los cuatro siguientes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <p><strong>Revisa los datos fiscales de Hacienda.</strong> Pero no los des por completos: faltan operaciones (criptos, Letras, alquileres) que debes añadir.</p>
            </div>
          </div>
        </section>

        {/* Warning box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Errores frecuentes al clasificar una renta</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Creer que el paro o las pensiones no tributan:</strong> ambos son rendimientos del trabajo y tributan como un salario.</li>
              <li><strong>Confundir el rescate de un plan de pensiones con una ganancia:</strong> tributa como trabajo (base general), no en la base del ahorro.</li>
              <li><strong>Olvidar la segunda vivienda vacía:</strong> genera renta imputada aunque no obtengas ningún ingreso por ella.</li>
              <li><strong>No declarar Letras del Tesoro por no llevar retención:</strong> Hacienda tiene el dato y son rendimiento del capital mobiliario.</li>
              <li><strong>Pensar que permutar una cripto por otra no tributa:</strong> es una alteración patrimonial, aunque no pases a euros.</li>
              <li><strong>Meter los premios de lotería en la renta general:</strong> tienen su propio gravamen especial del 20 %.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-tipos-renta-irpf')} />
      <ShareCard appName="orientador-tipos-renta-irpf" />
      <Footer appName="orientador-tipos-renta-irpf" />
    </div>
  );
}
