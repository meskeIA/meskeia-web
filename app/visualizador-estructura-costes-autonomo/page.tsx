'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './VisualizadorEstructuraCostesAutonomo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Datos de ejemplo simplificados (NO son cálculos fiscales exactos)
// ─────────────────────────────────────────────

/** Cuota RETA mensual aproximada según ingresos netos mensuales (tabla simplificada 2025) */
function estimarCuotaRETA(ingresosNetosMensuales: number): number {
  // Tramos simplificados orientativos
  if (ingresosNetosMensuales <= 670) return 230;
  if (ingresosNetosMensuales <= 900) return 260;
  if (ingresosNetosMensuales <= 1.166) return 275;
  if (ingresosNetosMensuales <= 1.500) return 294;
  if (ingresosNetosMensuales <= 1.700) return 294;
  if (ingresosNetosMensuales <= 1.850) return 310;
  if (ingresosNetosMensuales <= 2.030) return 315;
  if (ingresosNetosMensuales <= 2.330) return 320;
  if (ingresosNetosMensuales <= 2.760) return 340;
  if (ingresosNetosMensuales <= 3.190) return 360;
  if (ingresosNetosMensuales <= 3.620) return 380;
  if (ingresosNetosMensuales <= 4.050) return 400;
  if (ingresosNetosMensuales <= 6.000) return 450;
  return 530;
}

/** IRPF estimado simplificado (tipo efectivo aproximado sobre rendimiento neto) */
function estimarTipoEfectivoIRPF(rendimientoNetoAnual: number): number {
  // Aproximación educativa — NO es un cálculo fiscal real
  if (rendimientoNetoAnual <= 12450) return 10;
  if (rendimientoNetoAnual <= 20200) return 13;
  if (rendimientoNetoAnual <= 35200) return 16;
  if (rendimientoNetoAnual <= 60000) return 20;
  if (rendimientoNetoAnual <= 100000) return 25;
  return 30;
}

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface DesgloseAutonomo {
  facturacionMensual: number;
  facturacionAnual: number;
  // IVA
  ivaRepercutido: number;
  ingresosReales: number;
  // RETA
  cuotaRETAMensual: number;
  cuotaRETAAnual: number;
  // IRPF
  baseIRPF: number;
  tipoEfectivoIRPF: number;
  irpfAnual: number;
  // Gastos
  gastosProfesionales: number;
  gastosPersonales: number;
  // Neto
  netoAnual: number;
  netoMensual: number;
  // Porcentajes sobre facturación bruta
  pctIVA: number;
  pctRETA: number;
  pctIRPF: number;
  pctGastosPro: number;
  pctGastosPers: number;
  pctNeto: number;
  // Ratio resumen
  porCada100: number;
}

function calcularDesglose(
  facturacionMensual: number,
  pctGastosPro: number,
  gastosPersonalesMes: number,
): DesgloseAutonomo {
  const facturacionAnual = facturacionMensual * 12;

  // IVA: 21% repercutido (no es ingreso del autónomo)
  const ivaRepercutido = facturacionAnual * 0.21;
  const ingresosReales = facturacionAnual; // La facturación ya es base imponible sin IVA en este modelo

  // Gastos profesionales
  const gastosProfesionales = ingresosReales * (pctGastosPro / 100);

  // RETA: cuota mensual según ingresos netos estimados
  const ingresosNetosMensuales = (ingresosReales - gastosProfesionales) / 12;
  const cuotaRETAMensual = estimarCuotaRETA(ingresosNetosMensuales);
  const cuotaRETAAnual = cuotaRETAMensual * 12;

  // Rendimiento neto (base para IRPF)
  const baseIRPF = Math.max(0, ingresosReales - gastosProfesionales - cuotaRETAAnual);
  const tipoEfectivoIRPF = estimarTipoEfectivoIRPF(baseIRPF);
  const irpfAnual = baseIRPF * (tipoEfectivoIRPF / 100);

  // Gastos personales
  const gastosPersonales = gastosPersonalesMes * 12;

  // Neto disponible
  const netoAnual = ingresosReales - cuotaRETAAnual - irpfAnual - gastosProfesionales - gastosPersonales;
  const netoMensual = netoAnual / 12;

  // Porcentajes sobre facturación bruta (con IVA)
  const totalConIVA = facturacionAnual + ivaRepercutido;
  const pctIVACalc = totalConIVA > 0 ? (ivaRepercutido / totalConIVA) * 100 : 0;
  const pctRETACalc = totalConIVA > 0 ? (cuotaRETAAnual / totalConIVA) * 100 : 0;
  const pctIRPFCalc = totalConIVA > 0 ? (irpfAnual / totalConIVA) * 100 : 0;
  const pctGastosProCalc = totalConIVA > 0 ? (gastosProfesionales / totalConIVA) * 100 : 0;
  const pctGastosPersCalc = totalConIVA > 0 ? (gastosPersonales / totalConIVA) * 100 : 0;
  const pctNetoCalc = totalConIVA > 0 ? (Math.max(0, netoAnual) / totalConIVA) * 100 : 0;

  // "De cada 100 € que facturas (con IVA), te quedan X €"
  const porCada100 = totalConIVA > 0 ? (Math.max(0, netoAnual) / totalConIVA) * 100 : 0;

  return {
    facturacionMensual,
    facturacionAnual,
    ivaRepercutido,
    ingresosReales,
    cuotaRETAMensual,
    cuotaRETAAnual,
    baseIRPF,
    tipoEfectivoIRPF,
    irpfAnual,
    gastosProfesionales,
    gastosPersonales,
    netoAnual,
    netoMensual,
    pctIVA: pctIVACalc,
    pctRETA: pctRETACalc,
    pctIRPF: pctIRPFCalc,
    pctGastosPro: pctGastosProCalc,
    pctGastosPers: pctGastosPersCalc,
    pctNeto: pctNetoCalc,
    porCada100,
  };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

interface BloqueExpandibleProps {
  icono: string;
  label: string;
  valor: string;
  pct: string;
  color: 'rojo' | 'naranja' | 'amarillo' | 'gris' | 'grisOscuro' | 'verde' | 'azul';
  nota?: string;
  children?: React.ReactNode;
}

function BloqueExpandible({ icono, label, valor, pct, color, nota, children }: BloqueExpandibleProps) {
  const [abierto, setAbierto] = useState(false);

  const colorClass = {
    rojo: styles.bloqueRojo,
    naranja: styles.bloqueNaranja,
    amarillo: styles.bloqueAmarillo,
    gris: styles.bloqueGris,
    grisOscuro: styles.bloqueGrisOscuro,
    verde: styles.bloqueVerde,
    azul: styles.bloqueAzul,
  }[color];

  return (
    <div className={`${styles.bloque} ${colorClass}`}>
      <button
        className={styles.bloqueHeader}
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-label={`${label}: ${valor}. Pulsa para ${abierto ? 'cerrar' : 'ver'} detalles`}
      >
        <span className={styles.bloqueIcono} aria-hidden="true">{icono}</span>
        <div className={styles.bloqueInfo}>
          <span className={styles.bloqueLabel}>{label}</span>
          <span className={styles.bloqueValor}>{valor}</span>
          <span className={styles.bloquePct}>{pct}</span>
          {nota && <span className={styles.bloqueNota}>{nota}</span>}
        </div>
        <span className={`${styles.bloqueChevron} ${abierto ? styles.bloqueChevronAbierto : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {abierto && children && (
        <div className={styles.bloqueDetalle}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function VisualizadorEstructuraCostesAutonomo() {
  const [facturacionMensual, setFacturacionMensual] = useState(3000);
  const [pctGastosPro, setPctGastosPro] = useState(20);
  const [gastosPersonalesMes, setGastosPersonalesMes] = useState(1200);

  const datos = useMemo(
    () => calcularDesglose(facturacionMensual, pctGastosPro, gastosPersonalesMes),
    [facturacionMensual, pctGastosPro, gastosPersonalesMes],
  );

  const totalConIVA = datos.facturacionAnual + datos.ivaRepercutido;

  // Donut CSS puro — segmentos
  const segmentos = [
    { pct: datos.pctIVA, color: '#e74c3c', label: 'IVA' },
    { pct: datos.pctRETA, color: '#e67e22', label: 'RETA' },
    { pct: datos.pctIRPF, color: '#f1c40f', label: 'IRPF' },
    { pct: datos.pctGastosPro, color: '#95a5a6', label: 'G. Prof.' },
    { pct: datos.pctGastosPers, color: '#7f8c8d', label: 'G. Pers.' },
    { pct: datos.pctNeto, color: '#27ae60', label: 'Neto' },
  ];

  let acumulado = 0;
  const gradientParts: string[] = [];
  for (const seg of segmentos) {
    const inicio = acumulado;
    const fin = acumulado + seg.pct;
    gradientParts.push(`${seg.color} ${formatNumber(inicio, 2)}% ${formatNumber(fin, 2)}%`);
    acumulado = fin;
  }
  // Rellenar si no llega al 100% (por neto negativo)
  if (acumulado < 100) {
    gradientParts.push(`#ddd ${formatNumber(acumulado, 2)}% 100%`);
  }
  const donutGradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Estructura de Costes del Autónomo</h1>
        <p className={styles.subtitle}>De lo que facturas a lo que te queda: visualiza cada euro</p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      {/* ─── Sliders ─── */}
      <div className={styles.slidersZona}>
        <div className={styles.sliderBloque}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>Facturación mensual (sin IVA)</label>
            <span className={styles.sliderValor}>{formatCurrency(facturacionMensual)}</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={1000}
            max={10000}
            step={100}
            value={facturacionMensual}
            onChange={(e) => setFacturacionMensual(parseInt(e.target.value))}
            aria-label={`Facturación mensual: ${formatCurrency(facturacionMensual)}`}
          />
          <div className={styles.sliderExtremos}>
            <span>1.000 €</span>
            <span>10.000 €</span>
          </div>
        </div>

        <div className={styles.sliderBloque}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>Gastos profesionales</label>
            <span className={styles.sliderValor}>{formatNumber(pctGastosPro, 0)}%</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={10}
            max={40}
            step={1}
            value={pctGastosPro}
            onChange={(e) => setPctGastosPro(parseInt(e.target.value))}
            aria-label={`Gastos profesionales: ${pctGastosPro}%`}
          />
          <div className={styles.sliderExtremos}>
            <span>10%</span>
            <span>40%</span>
          </div>
        </div>

        <div className={styles.sliderBloque}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>Gastos personales mensuales</label>
            <span className={styles.sliderValor}>{formatCurrency(gastosPersonalesMes)}</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={500}
            max={2000}
            step={50}
            value={gastosPersonalesMes}
            onChange={(e) => setGastosPersonalesMes(parseInt(e.target.value))}
            aria-label={`Gastos personales mensuales: ${formatCurrency(gastosPersonalesMes)}`}
          />
          <div className={styles.sliderExtremos}>
            <span>500 €</span>
            <span>2.000 €</span>
          </div>
        </div>
      </div>

      {/* ─── Cascada waterfall ─── */}
      <h2 className={styles.seccionTitulo}>Cascada de costes</h2>

      <div className={styles.cascada}>
        {/* 1. Facturación bruta (con IVA) */}
        <BloqueExpandible
          icono="💶"
          label="Lo que cobras al cliente (con IVA)"
          valor={formatCurrency(totalConIVA) + '/año'}
          pct="100% — tu factura total"
          color="azul"
        >
          <p>
            Cuando facturas {formatCurrency(facturacionMensual)} al mes, tu cliente paga
            {' '}{formatCurrency(facturacionMensual * 1.21)} (base + 21% IVA).
            Al año son {formatCurrency(totalConIVA)}.
          </p>
        </BloqueExpandible>

        <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

        {/* 2. IVA */}
        <BloqueExpandible
          icono="🏛️"
          label="IVA repercutido (21%)"
          valor={'− ' + formatCurrency(datos.ivaRepercutido) + '/año'}
          pct={formatNumber(datos.pctIVA, 1) + '% del total facturado'}
          color="rojo"
          nota="El IVA que cobras no es tuyo — es de Hacienda"
        >
          <p>
            Cada trimestre declaras el IVA cobrado (repercutido) menos el IVA pagado en tus gastos (soportado).
            La diferencia se ingresa a Hacienda. Si tus gastos deducibles tienen IVA, reduces lo que pagas.
          </p>
          <p className={styles.tip}>
            <strong>Tip:</strong> Guarda TODAS las facturas de gastos profesionales. El IVA soportado reduce lo que pagas trimestralmente.
          </p>
        </BloqueExpandible>

        <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

        {/* 3. Ingresos reales */}
        <div className={styles.bloqueSubtotal}>
          <span className={styles.subtotalLabel}>= Ingresos reales (sin IVA)</span>
          <span className={styles.subtotalValor}>{formatCurrency(datos.ingresosReales)}/año</span>
        </div>

        <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

        {/* 4. Cuota RETA */}
        <BloqueExpandible
          icono="🏥"
          label="Cuota RETA (Seguridad Social)"
          valor={'− ' + formatCurrency(datos.cuotaRETAAnual) + '/año'}
          pct={formatNumber(datos.pctRETA, 1) + '% · ' + formatCurrency(datos.cuotaRETAMensual) + '/mes'}
          color="naranja"
          nota="Obligatoria para todo autónomo dado de alta"
        >
          <p>
            La cuota de autónomos (RETA) cubre asistencia sanitaria, jubilación, incapacidad temporal y cese de actividad.
            Desde 2023 se paga por tramos según ingresos reales.
          </p>
          <p>
            Tu cuota estimada: <strong>{formatCurrency(datos.cuotaRETAMensual)}/mes</strong> para unos ingresos netos
            de ~{formatCurrency((datos.ingresosReales - datos.gastosProfesionales) / 12)}/mes.
          </p>
          <p className={styles.tip}>
            <strong>Tarifa plana:</strong> Si eres nuevo autónomo, los primeros 12 meses pagas solo 80 €/mes.
            Extensible otros 12 meses si tus ingresos son bajos.
          </p>
        </BloqueExpandible>

        <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

        {/* 5. IRPF */}
        <BloqueExpandible
          icono="📋"
          label="IRPF estimado (retención trimestral)"
          valor={'− ' + formatCurrency(datos.irpfAnual) + '/año'}
          pct={formatNumber(datos.pctIRPF, 1) + '% · tipo efectivo ~' + formatNumber(datos.tipoEfectivoIRPF, 0) + '%'}
          color="amarillo"
          nota="Estimación orientativa — el tipo real depende de tu situación"
        >
          <p>
            Como autónomo pagas IRPF trimestralmente (modelo 130) a cuenta de la declaración de la renta.
            La retención habitual es del 20% sobre el rendimiento neto, aunque el tipo efectivo final varía.
          </p>
          <p>
            Tu rendimiento neto estimado: {formatCurrency(datos.baseIRPF)}/año
            (ingresos − gastos − RETA).
          </p>
          <p className={styles.tip}>
            <strong>Tip:</strong> Cuantos más gastos deducibles tengas, menor será tu base imponible y menos IRPF pagarás.
            Deduce coworking, internet, teléfono, formación, seguros profesionales...
          </p>
        </BloqueExpandible>

        <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

        {/* 6. Gastos profesionales */}
        <BloqueExpandible
          icono="💻"
          label="Gastos profesionales"
          valor={'− ' + formatCurrency(datos.gastosProfesionales) + '/año'}
          pct={formatNumber(datos.pctGastosPro, 1) + '% · ' + formatNumber(pctGastosPro, 0) + '% de ingresos'}
          color="gris"
        >
          <p>
            Los gastos necesarios para tu actividad: herramientas, software, coworking,
            formación, material de oficina, seguros profesionales, asesoría fiscal...
          </p>
          <div className={styles.listaGastos}>
            <div className={styles.gastoItem}><span aria-hidden="true">🏢</span> Coworking / oficina</div>
            <div className={styles.gastoItem}><span aria-hidden="true">💻</span> Software y herramientas</div>
            <div className={styles.gastoItem}><span aria-hidden="true">📚</span> Formación profesional</div>
            <div className={styles.gastoItem}><span aria-hidden="true">📱</span> Teléfono e internet</div>
            <div className={styles.gastoItem}><span aria-hidden="true">🛡️</span> Seguros profesionales</div>
            <div className={styles.gastoItem}><span aria-hidden="true">📊</span> Asesoría fiscal</div>
          </div>
          <p className={styles.tip}>
            <strong>Tip:</strong> Si trabajas desde casa, puedes deducir un porcentaje de suministros (agua, luz, gas, internet).
            El criterio general es el 30% de la parte proporcional de metros dedicados a la actividad.
          </p>
        </BloqueExpandible>

        <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

        {/* 7. Gastos personales */}
        <BloqueExpandible
          icono="🏠"
          label="Gastos personales fijos"
          valor={'− ' + formatCurrency(datos.gastosPersonales) + '/año'}
          pct={formatNumber(datos.pctGastosPers, 1) + '% · ' + formatCurrency(gastosPersonalesMes) + '/mes'}
          color="grisOscuro"
        >
          <p>
            Tus gastos de vida: alquiler o hipoteca, alimentación, suministros del hogar,
            transporte, ocio...
          </p>
          <div className={styles.listaGastos}>
            <div className={styles.gastoItem}><span aria-hidden="true">🏠</span> Alquiler / hipoteca</div>
            <div className={styles.gastoItem}><span aria-hidden="true">🛒</span> Alimentación</div>
            <div className={styles.gastoItem}><span aria-hidden="true">💡</span> Suministros (luz, agua, gas)</div>
            <div className={styles.gastoItem}><span aria-hidden="true">🚗</span> Transporte</div>
            <div className={styles.gastoItem}><span aria-hidden="true">🎭</span> Ocio y otros</div>
          </div>
        </BloqueExpandible>

        <div className={styles.cascadaFlecha} aria-hidden="true">▼</div>

        {/* 8. Neto */}
        <BloqueExpandible
          icono="✅"
          label="Lo que te queda"
          valor={formatCurrency(Math.max(0, datos.netoAnual)) + '/año'}
          pct={formatCurrency(Math.max(0, datos.netoMensual)) + '/mes · ' + formatNumber(datos.pctNeto, 1) + '% del total'}
          color="verde"
        >
          <p>
            Después de pagar IVA, RETA, IRPF, gastos profesionales y gastos personales,
            esto es lo que realmente queda disponible para ahorro, inversión o caprichos.
          </p>
          {datos.netoAnual < 0 && (
            <p className={styles.alerta}>
              <strong>Atención:</strong> Con estos parámetros, tus gastos superan tus ingresos netos.
              Revisa tu facturación o ajusta gastos.
            </p>
          )}
        </BloqueExpandible>
      </div>

      {/* ─── Panel de resumen ─── */}
      <div className={styles.resumen}>
        <div className={styles.resumenPrincipal}>
          <div className={styles.resumenFrase}>
            De cada <strong>100 €</strong> que facturas (con IVA),
            te quedan <strong className={styles.resumenNeto}>{formatNumber(datos.porCada100, 0)} €</strong>
          </div>
        </div>

        {/* Donut CSS */}
        <div className={styles.donutContainer}>
          <div
            className={styles.donut}
            style={{ background: donutGradient }}
            role="img"
            aria-label={`Distribución: Neto ${formatNumber(datos.pctNeto, 0)}%, IVA ${formatNumber(datos.pctIVA, 0)}%, RETA ${formatNumber(datos.pctRETA, 0)}%, IRPF ${formatNumber(datos.pctIRPF, 0)}%, Gastos prof. ${formatNumber(datos.pctGastosPro, 0)}%, Gastos pers. ${formatNumber(datos.pctGastosPers, 0)}%`}
          >
            <div className={styles.donutCentro}>
              <span className={styles.donutPct}>{formatNumber(datos.pctNeto, 0)}%</span>
              <span className={styles.donutLabel}>neto</span>
            </div>
          </div>
          <div className={styles.leyenda}>
            {segmentos.map((seg) => (
              <div key={seg.label} className={styles.leyendaItem}>
                <span className={styles.leyendaColor} style={{ backgroundColor: seg.color }} />
                <span>{seg.label} {formatNumber(seg.pct, 0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Barra de reparto visual ─── */}
      <div className={styles.barraReparto}>
        {segmentos.map((seg) => (
          seg.pct > 0 ? (
            <div
              key={seg.label}
              className={styles.barraSegmento}
              style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${formatNumber(seg.pct, 1)}%`}
            >
              {seg.pct > 6 && (
                <span className={styles.barraTexto}>{seg.label}</span>
              )}
            </div>
          ) : null
        ))}
      </div>

      {/* ─── Comparativa asalariado ─── */}
      <div className={styles.comparativa}>
        <h3 className={styles.comparativaTitulo}>
          <span aria-hidden="true">⚖️</span> Autónomo vs asalariado
        </h3>
        <p className={styles.comparativaTexto}>
          Un asalariado con sueldo bruto de {formatCurrency(datos.ingresosReales)}/año se llevaría
          aproximadamente un <strong>~{formatNumber(datos.ingresosReales <= 20000 ? 82 : datos.ingresosReales <= 35000 ? 78 : datos.ingresosReales <= 60000 ? 73 : 67, 0)}%</strong> neto
          (sin contar gastos personales ni profesionales). El autónomo asume más riesgo, paga su propia Seguridad Social
          y tiene gastos profesionales, pero puede deducir más conceptos.
        </p>
      </div>

      {/* ─── Sección educativa ─── */}
      <EducationalSection
        title="Entiende las finanzas del autónomo"
        subtitle="Conceptos clave para gestionar tu dinero como autónomo"
        defaultOpen={false}
      >
        <h3>Autónomo vs asalariado: diferencias clave</h3>
        <p>
          El asalariado recibe una nómina con deducciones ya aplicadas. El autónomo debe gestionar todo:
          facturar, cobrar IVA y devolverlo trimestralmente, pagar su cuota de Seguridad Social y hacer pagos
          fraccionados de IRPF. A cambio, puede deducir gastos profesionales que un asalariado no puede.
        </p>

        <h3>La tarifa plana de autónomos</h3>
        <p>
          Si te das de alta como autónomo por primera vez (o no lo has sido en los últimos 2 años),
          puedes acogerte a la tarifa plana de <strong>80 €/mes durante 12 meses</strong>.
          Si tus ingresos netos no superan el SMI, puede extenderse otros 12 meses.
          Es un ahorro significativo en los primeros pasos.
        </p>

        <h3>¿Qué son los gastos deducibles?</h3>
        <p>
          Son los gastos vinculados a tu actividad profesional que puedes restar de tus ingresos antes de
          calcular impuestos. Incluyen: material de oficina, herramientas y software, formación relacionada,
          cuotas de colegios profesionales, seguros de responsabilidad civil, asesoría fiscal, y un porcentaje
          de suministros si trabajas desde casa.
        </p>

        <h3>Los modelos trimestrales del autónomo</h3>
        <p>
          Cada trimestre (abril, julio, octubre, enero) debes presentar al menos:
        </p>
        <ul>
          <li><strong>Modelo 303</strong> — Declaración de IVA (IVA repercutido − IVA soportado)</li>
          <li><strong>Modelo 130</strong> — Pago fraccionado de IRPF (20% del rendimiento neto acumulado)</li>
        </ul>
        <p>
          Y un resumen anual en enero: modelo 390 (IVA) y modelo 100 (renta).
          Si facturas a empresas con retención del 15%, puedes estar exento del 130.
        </p>

        <h3>El colchón de seguridad</h3>
        <p>
          Como autónomo no tienes nómina fija ni paga extra garantizada. Los expertos recomiendan tener
          un colchón de <strong>3-6 meses de gastos fijos</strong> para cubrir meses flojos, vacaciones o imprevistos.
          Este visualizador te ayuda a calcular cuánto necesitas ahorrar.
        </p>

        <div className={styles.warningBox}>
          <strong>Nota:</strong> Este visualizador usa datos aproximados con fines educativos.
          Los importes de cuota RETA, IRPF y deducciones varían según tu situación real,
          CCAA, antigüedad y tipo de actividad. Consulta con un asesor fiscal para tu caso concreto.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-estructura-costes-autonomo')} />
      <ShareCard appName="visualizador-estructura-costes-autonomo" />
      <Footer appName="visualizador-estructura-costes-autonomo" />
    </div>
  );
}
