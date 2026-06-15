'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorSubvencionesRehabilitacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
  NumberInput, RegionBadge
} from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───

type TipoActuacion = 'individual' | 'edificio' | 'proyecto';
type AhorroEnergetico = 'desconocido' | '30' | '45' | '60';

interface MejoraOption {
  id: string;
  label: string;
  icon: string;
}

const MEJORAS: MejoraOption[] = [
  { id: 'fachada', label: 'Aislamiento de fachada', icon: '🧱' },
  { id: 'ventanas', label: 'Ventanas eficientes', icon: '🪟' },
  { id: 'cubierta', label: 'Aislamiento de cubierta', icon: '🏗️' },
  { id: 'caldera', label: 'Caldera / Bomba de calor', icon: '🔥' },
  { id: 'solar', label: 'Placas solares', icon: '☀️' },
];

// ─── Datos de subvenciones ───

interface ProgramaResultado {
  nombre: string;
  descripcion: string;
  porcentaje: number;
  maxImporte: number;
  importeEstimado: number;
  aplica: boolean;
  motivo: string;
}

interface DeduccionIRPF {
  porcentaje: number;
  baseMaxima: number;
  importeEstimado: number;
  aplica: boolean;
  descripcion: string;
}

function calcularPrograma3(presupuesto: number, ahorro: AhorroEnergetico): ProgramaResultado {
  const requiereAhorro30 = ahorro === '30' || ahorro === '45' || ahorro === '60';
  const porcentaje = 0.80;
  const maxImporte = 18800;
  const importeBruto = presupuesto * porcentaje;
  const importeEstimado = Math.min(importeBruto, maxImporte);

  return {
    nombre: 'Programa 3 - Rehabilitación edificio completo',
    descripcion: 'Actuaciones a nivel de edificio completo (comunidad de propietarios). Requiere ahorro energetico >= 30%.',
    porcentaje: porcentaje * 100,
    maxImporte,
    importeEstimado: requiereAhorro30 ? importeEstimado : 0,
    aplica: requiereAhorro30,
    motivo: requiereAhorro30
      ? `Hasta el 80% del coste, con un máximo de ${formatCurrency(maxImporte)} por vivienda`
      : 'Requiere un ahorro energético mínimo del 30%',
  };
}

function calcularPrograma4(presupuesto: number, ahorro: AhorroEnergetico): ProgramaResultado {
  let porcentaje = 0;
  let maxImporte = 0;
  let aplica = false;

  if (ahorro === '60') {
    porcentaje = 0.80;
    maxImporte = 6300;
    aplica = true;
  } else if (ahorro === '45') {
    porcentaje = 0.65;
    maxImporte = 6300;
    aplica = true;
  } else if (ahorro === '30') {
    porcentaje = 0.40;
    maxImporte = 3000;
    aplica = true;
  }

  const importeBruto = presupuesto * porcentaje;
  const importeEstimado = aplica ? Math.min(importeBruto, maxImporte) : 0;

  const descripciones: Record<string, string> = {
    '30': `Ahorro 30%: hasta el 40% del coste, máximo ${formatCurrency(3000)}`,
    '45': `Ahorro 45%: hasta el 65% del coste, máximo ${formatCurrency(6300)}`,
    '60': `Ahorro >= 60%: hasta el 80% del coste, máximo ${formatCurrency(6300)}`,
    'desconocido': 'Selecciona un nivel de ahorro energético para calcular',
  };

  return {
    nombre: 'Programa 4 - Mejora vivienda individual',
    descripcion: 'Actuaciones de mejora de eficiencia en vivienda individual. El porcentaje depende del ahorro energético alcanzado.',
    porcentaje: porcentaje * 100,
    maxImporte,
    importeEstimado,
    aplica,
    motivo: descripciones[ahorro],
  };
}

function calcularPrograma5(): ProgramaResultado {
  const importeEstimado = 700;
  return {
    nombre: 'Programa 5 - Libro del edificio + proyecto técnico',
    descripcion: 'Subvención para la elaboración del libro del edificio existente y el proyecto de rehabilitación.',
    porcentaje: 100,
    maxImporte: 700,
    importeEstimado,
    aplica: true,
    motivo: `Hasta 700 € + 60 €/vivienda (máximo 100% del coste del proyecto)`,
  };
}

function calcularDeduccionIRPF(presupuesto: number, ahorro: AhorroEnergetico, tipoActuacion: TipoActuacion, viviendaHabitual: boolean): DeduccionIRPF {
  if (!viviendaHabitual) {
    return {
      porcentaje: 0,
      baseMaxima: 0,
      importeEstimado: 0,
      aplica: false,
      descripcion: 'Las deducciones IRPF solo aplican a vivienda habitual',
    };
  }

  // Deducción edificio completo: 60% de hasta 15.000€ (ahorro >= 30%)
  if (tipoActuacion === 'edificio' && (ahorro === '30' || ahorro === '45' || ahorro === '60')) {
    const baseMaxima = 15000;
    const base = Math.min(presupuesto, baseMaxima);
    return {
      porcentaje: 60,
      baseMaxima,
      importeEstimado: base * 0.60,
      aplica: true,
      descripcion: `60% de hasta ${formatCurrency(baseMaxima)} (rehabilitación energética de edificio, ahorro >= 30%)`,
    };
  }

  // Deducción individual: depende del ahorro
  if (tipoActuacion === 'individual') {
    if (ahorro === '45' || ahorro === '60') {
      const baseMaxima = 7500;
      const base = Math.min(presupuesto, baseMaxima);
      return {
        porcentaje: 40,
        baseMaxima,
        importeEstimado: base * 0.40,
        aplica: true,
        descripcion: `40% de hasta ${formatCurrency(baseMaxima)} (mejora envolvente, ahorro >= 30% demanda calefacción/refrigeración)`,
      };
    }
    if (ahorro === '30') {
      const baseMaxima = 5000;
      const base = Math.min(presupuesto, baseMaxima);
      return {
        porcentaje: 20,
        baseMaxima,
        importeEstimado: base * 0.20,
        aplica: true,
        descripcion: `20% de hasta ${formatCurrency(baseMaxima)} (mejora envolvente, ahorro >= 7% demanda calefacción/refrigeración)`,
      };
    }
  }

  return {
    porcentaje: 0,
    baseMaxima: 0,
    importeEstimado: 0,
    aplica: false,
    descripcion: 'Selecciona un ahorro energético conocido para estimar la deducción',
  };
}

export default function SimuladorSubvencionesRehabilitacionPage() {
  const [tipoActuacion, setTipoActuacion] = useState<TipoActuacion | ''>('');
  const [mejoras, setMejoras] = useState<string[]>([]);
  const [presupuesto, setPresupuesto] = useState('');
  const [ahorro, setAhorro] = useState<AhorroEnergetico | ''>('');
  const [viviendaHabitual, setViviendaHabitual] = useState<boolean | null>(null);
  const [calculado, setCalculado] = useState(false);

  const toggleMejora = (id: string) => {
    setMejoras(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const presupuestoNum = parseSpanishNumber(presupuesto) || 0;
  const puedeCalcular = tipoActuacion !== '' && mejoras.length > 0 && presupuestoNum > 0 && ahorro !== '' && viviendaHabitual !== null;

  const resultados = useMemo(() => {
    if (!calculado || !puedeCalcular) return null;

    const ahorroVal = ahorro as AhorroEnergetico;
    const tipoVal = tipoActuacion as TipoActuacion;

    // Calcular programas según tipo de actuación
    const programas: ProgramaResultado[] = [];

    if (tipoVal === 'edificio') {
      programas.push(calcularPrograma3(presupuestoNum, ahorroVal));
    } else if (tipoVal === 'individual') {
      programas.push(calcularPrograma4(presupuestoNum, ahorroVal));
    } else if (tipoVal === 'proyecto') {
      programas.push(calcularPrograma5());
    }

    // Programa 5 siempre disponible como complemento (excepto si ya es la actuación principal)
    if (tipoVal !== 'proyecto') {
      programas.push(calcularPrograma5());
    }

    const deduccion = calcularDeduccionIRPF(presupuestoNum, ahorroVal, tipoVal, viviendaHabitual === true);

    // IVA reducido
    const ahorroIVA = presupuestoNum * (0.21 - 0.10); // diferencia entre 21% y 10%

    // Total: el programa principal (no acumulable) + deducción IRPF (sí acumulable) + ahorro IVA
    const programaPrincipal = programas.find(p => p.aplica && p.nombre !== 'Programa 5 - Libro del edificio + proyecto técnico');
    const programa5 = programas.find(p => p.nombre === 'Programa 5 - Libro del edificio + proyecto técnico');

    const subvencionPrincipal = programaPrincipal?.importeEstimado ?? 0;
    const subvencionProyecto = programa5?.importeEstimado ?? 0;
    const totalAyudas = subvencionPrincipal + (deduccion.aplica ? deduccion.importeEstimado : 0) + ahorroIVA;
    const costeNeto = Math.max(0, presupuestoNum * 1.10 - totalAyudas - subvencionProyecto);

    return { programas, deduccion, ahorroIVA, totalAyudas, costeNeto, subvencionProyecto };
  }, [calculado, puedeCalcular, ahorro, tipoActuacion, presupuestoNum, viviendaHabitual]);

  const handleCalcular = () => {
    setCalculado(true);
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <div className={styles.heroIcon} aria-hidden="true">🏠</div>
          <h1 className={styles.title}>Simulador de Subvenciones para Rehabilitación Energética</h1>
          <p className={styles.subtitle}>
            Estima las ayudas Next Generation EU, deducciones IRPF e IVA reducido para tu reforma energética
          </p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        <DisclaimerCard
          variant="financial"
          severity="high"
          collapsible={false}
          context="Las subvenciones dependen de la disponibilidad presupuestaria de cada CCAA y de la convocatoria vigente. Los importes y requisitos pueden variar. Esta herramienta es ORIENTATIVA. Consulta siempre con tu CCAA o un agente rehabilitador autorizado para confirmar la disponibilidad."
        />

        {/* 1. Tipo de actuación */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">🏗️</span> Tipo de actuación
          </h2>
          <div className={styles.radioGroup} role="radiogroup" aria-label="Tipo de actuación">
            {([
              { value: 'individual' as TipoActuacion, label: 'Vivienda individual' },
              { value: 'edificio' as TipoActuacion, label: 'Edificio completo' },
              { value: 'proyecto' as TipoActuacion, label: 'Solo proyecto técnico' },
            ]).map(opt => (
              <button
                key={opt.value}
                className={`${styles.radioBtn} ${tipoActuacion === opt.value ? styles.radioBtnActive : ''}`}
                onClick={() => { setTipoActuacion(opt.value); setCalculado(false); }}
                role="radio"
                aria-checked={tipoActuacion === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Tipo de mejora */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">🔧</span> Tipo de mejora
          </h2>
          <p className={styles.helperText}>Selecciona todas las mejoras que planeas realizar</p>
          <div className={styles.checkboxGroup} role="group" aria-label="Tipos de mejora energética">
            {MEJORAS.map(m => (
              <button
                key={m.id}
                className={`${styles.checkboxBtn} ${mejoras.includes(m.id) ? styles.checkboxBtnActive : ''}`}
                onClick={() => { toggleMejora(m.id); setCalculado(false); }}
                aria-pressed={mejoras.includes(m.id)}
              >
                <span className={styles.checkboxIcon} aria-hidden="true">
                  {mejoras.includes(m.id) ? '✅' : '⬜'}
                </span>
                <span aria-hidden="true">{m.icon}</span> {m.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. Presupuesto */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">💶</span> Presupuesto estimado de la obra
          </h2>
          <NumberInput
            value={presupuesto}
            onChange={(v) => { setPresupuesto(v); setCalculado(false); }}
            label="Coste total estimado (sin IVA)"
            placeholder="15.000"
            suffix="€"
            helperText="Introduce el presupuesto de la obra sin incluir el IVA"
          />
        </section>

        {/* 4. Ahorro energético */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">⚡</span> Ahorro energético estimado
          </h2>
          <p className={styles.helperText}>
            El certificado energético antes/después determinará el ahorro real. Si no lo sabes, selecciona &quot;No lo sé&quot;.
          </p>
          <div className={styles.radioGroup} role="radiogroup" aria-label="Ahorro energético estimado">
            {([
              { value: 'desconocido' as AhorroEnergetico, label: 'No lo sé' },
              { value: '30' as AhorroEnergetico, label: '~30%' },
              { value: '45' as AhorroEnergetico, label: '~45%' },
              { value: '60' as AhorroEnergetico, label: '~60% o más' },
            ]).map(opt => (
              <button
                key={opt.value}
                className={`${styles.radioBtn} ${ahorro === opt.value ? styles.radioBtnActive : ''}`}
                onClick={() => { setAhorro(opt.value); setCalculado(false); }}
                role="radio"
                aria-checked={ahorro === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* 5. Vivienda habitual */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">🏡</span> ¿Es tu vivienda habitual?
          </h2>
          <p className={styles.helperText}>Las deducciones IRPF solo aplican a vivienda habitual</p>
          <div className={styles.radioGroup} role="radiogroup" aria-label="¿Vivienda habitual?">
            <button
              className={`${styles.radioBtn} ${viviendaHabitual === true ? styles.radioBtnActive : ''}`}
              onClick={() => { setViviendaHabitual(true); setCalculado(false); }}
              role="radio"
              aria-checked={viviendaHabitual === true}
            >
              Sí
            </button>
            <button
              className={`${styles.radioBtn} ${viviendaHabitual === false ? styles.radioBtnActive : ''}`}
              onClick={() => { setViviendaHabitual(false); setCalculado(false); }}
              role="radio"
              aria-checked={viviendaHabitual === false}
            >
              No
            </button>
          </div>
        </section>

        {/* Botón calcular */}
        <button
          className={styles.btnPrimary}
          onClick={handleCalcular}
          disabled={!puedeCalcular}
          aria-label="Estimar subvenciones disponibles"
        >
          Estimar subvenciones
        </button>

        {/* Resultados */}
        {resultados && (
          <div className={styles.resultsCard} role="region" aria-label="Resultados de la estimación">
            <h2 className={styles.resultsTitle}>Estimación de ayudas disponibles</h2>

            {resultados.programas.map(prog => (
              <div
                key={prog.nombre}
                className={`${styles.programCard} ${!prog.aplica ? styles.programIneligible : ''}`}
              >
                <div className={styles.programHeader}>
                  <h3 className={styles.programName}>
                    {prog.aplica ? '✅' : '❌'} {prog.nombre}
                  </h3>
                  <span className={styles.programAmount}>
                    {prog.aplica ? formatCurrency(prog.importeEstimado) : 'No aplica'}
                  </span>
                </div>
                <p className={styles.programDesc}>{prog.motivo}</p>
              </div>
            ))}

            {/* Deducción IRPF */}
            <div className={`${styles.programCard} ${!resultados.deduccion.aplica ? styles.programIneligible : ''}`}>
              <div className={styles.programHeader}>
                <h3 className={styles.programName}>
                  {resultados.deduccion.aplica ? '✅' : '❌'} Deducción IRPF
                </h3>
                <span className={styles.programAmount}>
                  {resultados.deduccion.aplica ? formatCurrency(resultados.deduccion.importeEstimado) : 'No aplica'}
                </span>
              </div>
              <p className={styles.programDesc}>{resultados.deduccion.descripcion}</p>
            </div>

            {/* IVA reducido */}
            <div className={styles.programCard}>
              <div className={styles.programHeader}>
                <h3 className={styles.programName}>✅ IVA reducido (10% vs 21%)</h3>
                <span className={styles.programAmount}>{formatCurrency(resultados.ahorroIVA)}</span>
              </div>
              <p className={styles.programDesc}>
                Las obras de rehabilitación energética tributan al 10% de IVA en lugar del 21% estándar
              </p>
            </div>

            {/* Totales */}
            <div className={styles.totalsGrid}>
              <div className={styles.totalCard}>
                <span className={`${styles.totalValue} ${styles.totalValueOk}`}>
                  {formatCurrency(resultados.totalAyudas)}
                </span>
                <span className={styles.totalLabel}>Total ayudas estimadas</span>
              </div>
              <div className={styles.totalCard}>
                <span className={`${styles.totalValue} ${styles.totalValueWarn}`}>
                  {formatCurrency(resultados.costeNeto)}
                </span>
                <span className={styles.totalLabel}>Coste neto estimado (con IVA)</span>
              </div>
            </div>

            <div className={styles.infoNote}>
              <span className={styles.infoNoteIcon} aria-hidden="true">ℹ️</span>
              <span>
                Las subvenciones de los programas 3, 4 y 5 <strong>no son acumulables entre sí</strong> (excepto programa 5 como complemento al proyecto técnico),
                pero <strong>sí se acumulan con la deducción IRPF</strong> y el IVA reducido. Los importes son orientativos y dependen de la convocatoria de cada CCAA.
              </span>
            </div>
          </div>
        )}

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="📚 Guía completa de subvenciones para rehabilitación energética"
          subtitle="Todo sobre los fondos Next Generation EU y las ayudas disponibles en España"
        >
          {/* Cómo funciona Next Generation */}
          <section className={styles.guideSection}>
            <h2>¿Cómo funcionan los fondos Next Generation EU?</h2>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Los fondos Next Generation EU son una iniciativa de la Unión Europea dotada con más de 700.000 millones de euros
              para impulsar la recuperación económica y la transición ecológica. En España, el <strong>Plan de Recuperación,
              Transformación y Resiliencia (PRTR)</strong> canaliza estos fondos a través de varios programas, incluyendo
              los dedicados a la rehabilitación energética de edificios y viviendas.
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              El Ministerio de Transportes y Movilidad Sostenible gestiona el Programa de Rehabilitación Residencial,
              que se ejecuta a través de las Comunidades Autónomas. Cada CCAA publica sus propias convocatorias con plazos
              y requisitos específicos, aunque los importes máximos y porcentajes son los establecidos por el Real Decreto 853/2021.
            </p>
          </section>

          {/* Tabla comparativa programas */}
          <section className={styles.guideSection}>
            <h2>Comparativa: Programa 3 vs Programa 4 vs Programa 5</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th>Característica</th>
                    <th>Programa 3</th>
                    <th>Programa 4</th>
                    <th>Programa 5</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Ámbito</strong></td>
                    <td>Edificio completo</td>
                    <td>Vivienda individual</td>
                    <td>Proyecto técnico</td>
                  </tr>
                  <tr>
                    <td><strong>Solicitante</strong></td>
                    <td>Comunidad de propietarios</td>
                    <td>Propietario individual</td>
                    <td>Comunidad o propietario</td>
                  </tr>
                  <tr>
                    <td><strong>Subvención máxima</strong></td>
                    <td>80% (hasta 18.800 €/viv)</td>
                    <td>40-80% (hasta 6.300 €)</td>
                    <td>100% (hasta 700 € + 60 €/viv)</td>
                  </tr>
                  <tr>
                    <td><strong>Ahorro energético mínimo</strong></td>
                    <td>30%</td>
                    <td>30% (para cualquier tramo)</td>
                    <td>No aplica</td>
                  </tr>
                  <tr>
                    <td><strong>Certificado energético</strong></td>
                    <td>Obligatorio antes y después</td>
                    <td>Obligatorio antes y después</td>
                    <td>No necesario</td>
                  </tr>
                  <tr>
                    <td><strong>Plazo de obras</strong></td>
                    <td>26 meses (edificios &gt;8 viv)</td>
                    <td>12 meses</td>
                    <td>No aplica</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Escenarios */}
          <section className={styles.guideSection}>
            <h2>Casos prácticos</h2>
            <div className={styles.scenariosGrid}>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🪟</span>
                <h3>Cambio de ventanas</h3>
                <p>
                  Presupuesto: 4.000 €. Ahorro estimado ~30%. Con Programa 4 podrías obtener hasta 1.600 € de subvención
                  + 800 € de ahorro en IVA + deducción IRPF del 20% (hasta 1.000 €). Coste neto: ~2.000 €.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🏢</span>
                <h3>Rehabilitación integral de comunidad</h3>
                <p>
                  Presupuesto: 200.000 € (20 viviendas, 10.000 €/viv). Con Programa 3 y ahorro del 45%, cada vivienda
                  podría recibir hasta 8.000 € de subvención. Total comunidad: hasta 160.000 €.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">☀️</span>
                <h3>Aerotermia + placas solares</h3>
                <p>
                  Presupuesto: 12.000 €. Ahorro estimado ~60%. Con Programa 4 podrías obtener hasta 6.300 € de subvención
                  + deducción IRPF del 40% (hasta 3.000 €). Coste neto con IVA reducido: ~5.500 €.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">📋</span>
                <h3>Solo proyecto técnico</h3>
                <p>
                  Si quieres planificar antes de ejecutar, el Programa 5 cubre hasta el 100% del coste del libro del edificio
                  y el proyecto de rehabilitación. Hasta 700 € + 60 €/vivienda.
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h3>¿Puedo solicitar la subvención si ya he empezado las obras?</h3>
                <p>
                  Depende de la convocatoria de tu CCAA. Algunas permiten obras iniciadas después de una fecha concreta
                  (generalmente febrero de 2020). Consulta la convocatoria vigente en tu comunidad.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Quién debe solicitar la subvención en un edificio?</h3>
                <p>
                  En el Programa 3 (edificio completo), la solicitud la presenta la comunidad de propietarios, representada
                  por el administrador de fincas. Puede delegarse en un agente rehabilitador autorizado.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Qué es un agente rehabilitador?</h3>
                <p>
                  Es una figura profesional que gestiona todo el proceso: solicitud de la subvención, coordinación de obras,
                  tramitación de certificados energéticos y justificación ante la CCAA. No es obligatorio, pero simplifica mucho el proceso.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Necesito certificado energético para solicitar las ayudas?</h3>
                <p>
                  Los Programas 3 y 4 requieren certificado energético antes (estado actual) y después de las obras (para verificar
                  el ahorro). El coste del certificado puede incluirse en el presupuesto subvencionable.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Son compatibles las subvenciones con las deducciones IRPF?</h3>
                <p>
                  Sí. Las deducciones IRPF se aplican sobre la parte del coste no cubierta por la subvención. Es decir, puedes
                  recibir la subvención del programa correspondiente Y además deducirte en el IRPF la parte que pagues de tu bolsillo.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Hasta cuándo están disponibles estas ayudas?</h3>
                <p>
                  Los fondos Next Generation para rehabilitación están programados hasta 2026, pero la disponibilidad
                  real depende de cada CCAA y del ritmo de ejecución. Algunas comunidades ya han agotado fondos en convocatorias anteriores.
                </p>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className={styles.guideSection}>
            <h2>Consejos para maximizar tus ayudas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📊</span>
                <h3>Obtén el certificado energético primero</h3>
                <p>Conocer tu calificación actual te permite estimar el ahorro real y elegir las mejoras más rentables.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🤝</span>
                <h3>Contrata un agente rehabilitador</h3>
                <p>Gestiona toda la burocracia y maximiza la subvención. Su coste suele incluirse en el presupuesto subvencionable.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🏢</span>
                <h3>Actúa a nivel de edificio si puedes</h3>
                <p>El Programa 3 ofrece porcentajes más altos (hasta 80%) y mayores importes que la actuación individual.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚡</span>
                <h3>No esperes: los fondos se agotan</h3>
                <p>Los fondos Next Generation son limitados. Solicita cuanto antes para no quedarte sin presupuesto disponible.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📋</span>
                <h3>Combina subvención + IRPF</h3>
                <p>La deducción IRPF se aplica sobre lo que pagas de tu bolsillo. Acumular ambas ayudas reduce significativamente el coste.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔍</span>
                <h3>Consulta tu CCAA antes de empezar</h3>
                <p>Cada comunidad tiene convocatorias y plazos diferentes. Verifica la disponibilidad antes de contratar obras.</p>
              </div>
            </div>
          </section>

          {/* Warning Box */}
          <section className={styles.warningBox}>
            <h2>⚠️ Advertencias importantes</h2>
            <div className={styles.warningGrid}>
              <div className={styles.warningItem}>
                <strong>Los importes son orientativos</strong>
                <p>La subvención final depende de la convocatoria, los fondos disponibles y la verificación del ahorro energético real tras las obras.</p>
              </div>
              <div className={styles.warningItem}>
                <strong>Cada CCAA tiene sus propios plazos y requisitos</strong>
                <p>Aunque los programas son nacionales, la gestión es autonómica. Los formularios, documentación adicional y plazos varían por comunidad.</p>
              </div>
              <div className={styles.warningItem}>
                <strong>Las obras deben cumplir normativa técnica</strong>
                <p>Los materiales, instalaciones y empresas deben cumplir el Código Técnico de la Edificación (CTE). Obras sin licencia o sin profesional habilitado no son subvencionables.</p>
              </div>
              <div className={styles.warningItem}>
                <strong>Obligación de justificación posterior</strong>
                <p>Tras recibir la subvención, deberás justificar los gastos con facturas, certificados energéticos y memoria técnica. El incumplimiento puede obligar a devolver la ayuda.</p>
              </div>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-subvenciones-rehabilitacion')} />
        <ShareCard appName="simulador-subvenciones-rehabilitacion" />
        <Footer appName="simulador-subvenciones-rehabilitacion" />
    </div>
  );
}
