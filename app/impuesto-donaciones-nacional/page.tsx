'use client';

import { useState } from 'react';
import styles from './ImpuestoDonacionesNacional.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { metadata, jsonLd, faqJsonLd, breadcrumbJsonLd } from './metadata';

// Interfaces
interface TramoTarifa {
  desde: number;
  hasta: number;
  tipo: number;
  cuotaBase: number;
}

interface BonificacionCCAA {
  porcentaje?: number;
  exencion?: number;
  limite?: number | null;
  reduccionBase?: number;
}

interface ConfigBonificacion {
  nombre: string;
  bonificaciones: Record<string, BonificacionCCAA>;
  notas: string;
}

interface DatosFormulario {
  comunidadAutonoma: string;
  valorDonacion: number;
  cargas: number;
  escrituraPublica: boolean;
  parentesco: string;
  edad: number;
  discapacidad: number;
  patrimonioPreexistente: string;
}

interface ResultadoBonificacion {
  bonificacion: number;
  detalle: string;
}

interface Resultado {
  ccaa: string;
  valorDonacion: number;
  baseImponible: number;
  reduccionParentesco: number;
  reduccionEdad: number;
  reduccionDiscapacidad: number;
  reduccionBaseAsturias: number;
  totalReducciones: number;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficiente: number;
  cuotaTributaria: number;
  bonificacionCCAA: ResultadoBonificacion;
  cuotaFinal: number;
  notas: string;
}

// Configuración de bonificaciones por CCAA para DONACIONES
const BONIFICACIONES_DONACIONES_CCAA: Record<string, ConfigBonificacion> = {
  madrid: {
    nombre: 'Comunidad de Madrid',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas:
      'Bonificación 99% para Grupos I y II. No requiere escritura pública para donaciones hasta 10.000€ (2025).',
  },
  andalucia: {
    nombre: 'Andalucía',
    bonificaciones: {
      'I-conyuge': { exencion: 1000000, porcentaje: 0.99 },
      'I-descendiente': { exencion: 1000000, porcentaje: 0.99 },
      II: { exencion: 1000000, porcentaje: 0.99 },
      'II-ascendiente': { exencion: 1000000, porcentaje: 0.99 },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas:
      'Bonificación 99% para Grupos I y II hasta 1.000.000€. Por encima, bonificación 0%. Requiere convivencia 2 años.',
  },
  galicia: {
    nombre: 'Galicia',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
  murcia: {
    nombre: 'Región de Murcia',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
  valencia: {
    nombre: 'Comunidad Valenciana',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.75, limite: null },
      'I-descendiente': { porcentaje: 0.75, limite: null },
      II: { porcentaje: 0.75, limite: null },
      'II-ascendiente': { porcentaje: 0.75, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 75% para Grupos I y II.',
  },
  extremadura: {
    nombre: 'Extremadura',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.75, limite: null },
      'I-descendiente': { porcentaje: 0.75, limite: null },
      II: { porcentaje: 0.75, limite: null },
      'II-ascendiente': { porcentaje: 0.75, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 75% para Grupos I y II.',
  },
  canarias: {
    nombre: 'Canarias',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.999, limite: null },
      'I-descendiente': { porcentaje: 0.999, limite: null },
      II: { porcentaje: 0.999, limite: null },
      'II-ascendiente': { porcentaje: 0.999, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99,9% para Grupos I y II.',
  },
  castillaleon: {
    nombre: 'Castilla y León',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0, limite: null },
      'I-descendiente': { porcentaje: 0, limite: null },
      II: { porcentaje: 0, limite: null },
      'II-ascendiente': { porcentaje: 0, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Sin bonificación autonómica. Se aplica tarifa estatal completa.',
  },
  larioja: {
    nombre: 'La Rioja',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
  castillamancha: {
    nombre: 'Castilla-La Mancha',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      II: { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas:
      'Bonificación 99% para Grupos I y II. ⚠️ REQUIERE ESCRITURA PÚBLICA (donaciones sin escritura NO tienen bonificación).',
  },
  cantabria: {
    nombre: 'Cantabria',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0, limite: null },
      'I-descendiente': { porcentaje: 0, limite: null },
      II: { porcentaje: 0, limite: null },
      'II-ascendiente': { porcentaje: 0, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Sin bonificación autonómica. Se aplica tarifa estatal completa.',
  },
  aragon: {
    nombre: 'Aragón',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0, limite: null },
      'I-descendiente': { porcentaje: 0, limite: null },
      II: { porcentaje: 0, limite: null },
      'II-ascendiente': { porcentaje: 0, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Sin bonificación autonómica. Se aplica tarifa estatal completa.',
  },
  baleares: {
    nombre: 'Islas Baleares',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0, limite: null },
      'I-descendiente': { porcentaje: 0, limite: null },
      II: { porcentaje: 0, limite: null },
      'II-ascendiente': { porcentaje: 0, limite: null },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas: 'Sin bonificación autonómica. Se aplica tarifa estatal completa.',
  },
  asturias: {
    nombre: 'Principado de Asturias',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0, reduccionBase: 300000 },
      'I-descendiente': { porcentaje: 0, reduccionBase: 300000 },
      II: { porcentaje: 0, reduccionBase: 300000 },
      'II-ascendiente': { porcentaje: 0, reduccionBase: 300000 },
      III: { porcentaje: 0, limite: null },
      IV: { porcentaje: 0, limite: null },
    },
    notas:
      'Sin bonificación autonómica. Reducción de 300.000€ en base imponible para Grupos I y II.',
  },
};

// Reducciones estatales específicas para DONACIONES
const REDUCCIONES_DONACIONES: Record<string, Record<string, number>> = {
  parentesco: {
    'I-conyuge': 15956.87,
    'I-descendiente': 15956.87,
    II: 15956.87,
    'II-ascendiente': 15956.87,
    III: 7993.46,
    IV: 0,
  },
  discapacidad: {
    33: 47858.59,
    65: 150253.03,
  },
};

// Edad adicional (solo si descendiente menor 21 años en Grupo I)
const REDUCCION_EDAD_DONACION = 3990.72;

// Tarifa estatal (igual que sucesiones)
const TARIFA_ESTATAL: TramoTarifa[] = [
  { desde: 0, hasta: 7993.46, tipo: 0.0765, cuotaBase: 0 },
  { desde: 7993.46, hasta: 31956.87, tipo: 0.085, cuotaBase: 611.5 },
  { desde: 31956.87, hasta: 79893.43, tipo: 0.0935, cuotaBase: 2648.4 },
  { desde: 79893.43, hasta: 239389.19, tipo: 0.1035, cuotaBase: 7130.52 },
  { desde: 239389.19, hasta: 398981.96, tipo: 0.1135, cuotaBase: 23643.2 },
  { desde: 398981.96, hasta: 797555.08, tipo: 0.1585, cuotaBase: 41765.48 },
  { desde: 797555.08, hasta: Infinity, tipo: 0.1935, cuotaBase: 104983.3 },
];

// Coeficientes multiplicadores por patrimonio
const COEFICIENTES_MULTIPLICADORES: Record<string, number[]> = {
  'I-conyuge': [1.0, 1.05, 1.1, 1.2],
  'I-descendiente': [1.0, 1.05, 1.1, 1.2],
  II: [1.0, 1.05, 1.1, 1.2],
  'II-ascendiente': [1.0, 1.05, 1.1, 1.2],
  III: [1.5882, 1.6676, 1.7471, 1.9059],
  IV: [2.0, 2.1, 2.2, 2.4],
};

export default function ImpuestoDonacionesNacional() {
  const [formData, setFormData] = useState<DatosFormulario>({
    comunidadAutonoma: '',
    valorDonacion: 0,
    cargas: 0,
    escrituraPublica: true,
    parentesco: '',
    edad: 0,
    discapacidad: 0,
    patrimonioPreexistente: '0-402678',
  });

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [showEducationalContent, setShowEducationalContent] = useState(false);

  // Función formatear moneda
  const formatearMoneda = (numero: number): string => {
    return numero.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calcular tarifa estatal
  const calcularTarifaEstatal = (baseLiquidable: number): number => {
    for (const tramo of TARIFA_ESTATAL) {
      if (baseLiquidable > tramo.desde && baseLiquidable <= tramo.hasta) {
        const exceso = baseLiquidable - tramo.desde;
        return tramo.cuotaBase + exceso * tramo.tipo;
      }
    }
    // Por si acaso, nunca debería llegar aquí
    const ultimoTramo = TARIFA_ESTATAL[TARIFA_ESTATAL.length - 1];
    const exceso = baseLiquidable - ultimoTramo.desde;
    return ultimoTramo.cuotaBase + exceso * ultimoTramo.tipo;
  };

  // Obtener coeficiente multiplicador
  const obtenerCoeficiente = (
    parentesco: string,
    patrimonio: string
  ): number => {
    const coeficientes = COEFICIENTES_MULTIPLICADORES[parentesco] || [1, 1, 1, 1];

    switch (patrimonio) {
      case '0-402678':
        return coeficientes[0];
      case '402678-2007380':
        return coeficientes[1];
      case '2007380-4020770':
        return coeficientes[2];
      case '4020770+':
        return coeficientes[3];
      default:
        return coeficientes[0];
    }
  };

  // Calcular bonificación autonómica
  const calcularBonificacionCCAA = (
    ccaa: string,
    parentesco: string,
    cuotaTributaria: number,
    baseImponible: number,
    escritura: boolean
  ): ResultadoBonificacion => {
    if (!ccaa || !parentesco) {
      return { bonificacion: 0, detalle: 'No se ha seleccionado comunidad o parentesco' };
    }

    // Castilla-La Mancha requiere escritura pública para bonificación
    if (ccaa === 'castillamancha' && !escritura) {
      return {
        bonificacion: 0,
        detalle: 'Castilla-La Mancha requiere escritura pública para bonificación',
      };
    }

    const config = BONIFICACIONES_DONACIONES_CCAA[ccaa];
    if (!config) {
      return { bonificacion: 0, detalle: 'Comunidad no encontrada' };
    }

    const bonif = config.bonificaciones[parentesco];
    if (!bonif) {
      return { bonificacion: 0, detalle: 'Sin bonificación para este parentesco' };
    }

    // Si tiene exención (Andalucía)
    if (bonif.exencion && baseImponible > bonif.exencion) {
      return {
        bonificacion: 0,
        detalle: `Base imponible supera el límite de ${formatearMoneda(bonif.exencion)}`,
      };
    }

    // Calcular bonificación
    const porcentaje = bonif.porcentaje || 0;
    const bonificacion = cuotaTributaria * porcentaje;

    if (bonificacion > 0) {
      return {
        bonificacion,
        detalle: `Bonificación ${(porcentaje * 100).toFixed(porcentaje === 0.999 ? 1 : 0)}% ${config.nombre}`,
      };
    }

    return { bonificacion: 0, detalle: 'Sin bonificación para este grupo' };
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      comunidadAutonoma,
      valorDonacion,
      cargas,
      escrituraPublica,
      parentesco,
      edad,
      discapacidad,
      patrimonioPreexistente,
    } = formData;

    // 1. Base imponible
    let baseImponible = valorDonacion - cargas;

    // 2. Reducciones estatales
    let reduccionParentesco = REDUCCIONES_DONACIONES.parentesco[parentesco] || 0;

    let reduccionEdad = 0;
    if (parentesco === 'I-descendiente' && edad < 21) {
      const anyosHasta21 = 21 - edad;
      reduccionEdad = anyosHasta21 * REDUCCION_EDAD_DONACION;
    }

    let reduccionDiscapacidad = 0;
    if (discapacidad >= 65) {
      reduccionDiscapacidad = REDUCCIONES_DONACIONES.discapacidad[65];
    } else if (discapacidad >= 33) {
      reduccionDiscapacidad = REDUCCIONES_DONACIONES.discapacidad[33];
    }

    // Reducción especial Asturias (en base imponible)
    let reduccionBaseAsturias = 0;
    if (comunidadAutonoma === 'asturias') {
      const bonif = BONIFICACIONES_DONACIONES_CCAA.asturias.bonificaciones[parentesco];
      if (bonif && bonif.reduccionBase) {
        reduccionBaseAsturias = Math.min(baseImponible, bonif.reduccionBase);
      }
    }

    // Aplicar reducción de Asturias en base imponible
    baseImponible = Math.max(0, baseImponible - reduccionBaseAsturias);

    const totalReducciones = reduccionParentesco + reduccionEdad + reduccionDiscapacidad;
    let baseLiquidable = Math.max(0, baseImponible - totalReducciones);

    // 3. Cuota íntegra (tarifa estatal)
    const cuotaIntegra = calcularTarifaEstatal(baseLiquidable);

    // 4. Aplicar coeficiente multiplicador
    const coeficiente = obtenerCoeficiente(parentesco, patrimonioPreexistente);
    const cuotaTributaria = cuotaIntegra * coeficiente;

    // 5. Bonificación autonómica
    const bonificacionCCAA = calcularBonificacionCCAA(
      comunidadAutonoma,
      parentesco,
      cuotaTributaria,
      valorDonacion,
      escrituraPublica
    );

    // 6. Cuota final
    const cuotaFinal = Math.max(0, cuotaTributaria - bonificacionCCAA.bonificacion);

    const config = BONIFICACIONES_DONACIONES_CCAA[comunidadAutonoma];
    const notas = config?.notas || '';

    setResultado({
      ccaa: config?.nombre || comunidadAutonoma,
      valorDonacion,
      baseImponible: valorDonacion - cargas - reduccionBaseAsturias,
      reduccionParentesco,
      reduccionEdad,
      reduccionDiscapacidad,
      reduccionBaseAsturias,
      totalReducciones,
      baseLiquidable,
      cuotaIntegra,
      coeficiente,
      cuotaTributaria,
      bonificacionCCAA,
      cuotaFinal,
      notas,
    });
  };

  // Manejar cambios en inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'radio') {
      const radioValue = (e.target as HTMLInputElement).value === 'si';
      setFormData((prev) => ({ ...prev, [name]: radioValue }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <>
      <MeskeiaLogo />
      <AnalyticsTracker appName="impuesto-donaciones-nacional" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1>🎁 Calculadora Impuesto de Donaciones</h1>
          <p>Régimen Común - España (14 Comunidades Autónomas)</p>
        </div>

        {/* Aviso legal */}
        <div className={styles.disclaimerBox}>
          <div className={styles.disclaimerTitle}>⚠️ IMPORTANTE - AVISO LEGAL</div>
          <div className={styles.disclaimerContent}>
            <p>
              <strong>Esta calculadora es únicamente una herramienta informativa y orientativa.</strong>
            </p>

            <p>
              Los resultados obtenidos son estimaciones basadas en la normativa vigente del Impuesto
              sobre Sucesiones y Donaciones de <strong>régimen común en España</strong> y las
              bonificaciones autonómicas actualizadas a 2025, pero <strong>NO sustituyen el
              asesoramiento profesional</strong>.
            </p>

            <p>
              Cada situación fiscal es única y puede estar sujeta a particularidades no contempladas
              en esta herramienta.
            </p>

            <p>
              <strong>Recomendamos encarecidamente:</strong>
            </p>
            <ul>
              <li>
                Consultar con un <strong>Asesor Fiscal profesional</strong> antes de tomar
                decisiones
              </li>
              <li>
                Verificar los requisitos específicos de cada reducción con la{' '}
                <strong>Agencia Tributaria de su Comunidad Autónoma</strong>
              </li>
              <li>
                Confirmar que cumple todos los requisitos legales para las reducciones y
                bonificaciones aplicables
              </li>
              <li>Comprobar posibles actualizaciones normativas recientes de su comunidad autónoma</li>
            </ul>

            <p>
              <strong>
                meskeIA no se responsabiliza de las decisiones tomadas basándose en estos cálculos.
              </strong>{' '}
              El uso de esta herramienta implica la aceptación de estas condiciones.
            </p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className={styles.content}>
          <div className={styles.warningBox}>
            <strong>⚠️ Importante: Ámbito de Aplicación</strong>
            <br />
            Esta calculadora aplica la normativa de <strong>régimen común</strong> para 14
            comunidades autónomas: Madrid, Andalucía, Galicia, Asturias, Cantabria, La Rioja,
            Aragón, Castilla y León, Castilla-La Mancha, Extremadura, Comunidad Valenciana, Región
            de Murcia, Islas Baleares y Canarias.
            <br />
            <strong>NO es válida para:</strong> Cataluña, País Vasco y Navarra (régimen foral
            propio).
          </div>

          <div className={styles.ccaaSelectorInfo}>
            <h3>🏛️ Selecciona tu Comunidad Autónoma</h3>
            <p>
              <strong>¿Por qué es importante?</strong> Aunque la base de cálculo es estatal, cada
              comunidad autónoma aplica bonificaciones diferentes sobre el impuesto final, lo que
              puede variar significativamente el resultado.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Sección 1: Comunidad Autónoma */}
            <div className={styles.formSection}>
              <h3>🏛️ Comunidad Autónoma</h3>

              <div className={styles.formGroup}>
                <label htmlFor="comunidadAutonoma">
                  Comunidad Autónoma donde reside el donatario (quien recibe)
                  <span className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltiptext}>
                      La comunidad autónoma competente es donde el donatario (quien recibe la
                      donación) tiene su residencia habitual.
                    </span>
                  </span>
                </label>
                <select
                  id="comunidadAutonoma"
                  name="comunidadAutonoma"
                  value={formData.comunidadAutonoma}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selecciona tu comunidad --</option>
                  <option value="madrid">Madrid</option>
                  <option value="andalucia">Andalucía</option>
                  <option value="galicia">Galicia</option>
                  <option value="murcia">Región de Murcia</option>
                  <option value="valencia">Comunidad Valenciana</option>
                  <option value="extremadura">Extremadura</option>
                  <option value="canarias">Canarias</option>
                  <option value="castillaleon">Castilla y León</option>
                  <option value="larioja">La Rioja</option>
                  <option value="castillamancha">
                    Castilla-La Mancha (⚠️ Requiere escritura pública)
                  </option>
                  <option value="cantabria">Cantabria</option>
                  <option value="aragon">Aragón</option>
                  <option value="baleares">Islas Baleares</option>
                  <option value="asturias">Asturias</option>
                </select>
              </div>
            </div>

            {/* Sección 2: Valor de la Donación */}
            <div className={styles.formSection}>
              <h3>💰 Valor de la Donación</h3>

              <div className={styles.formGroup}>
                <label htmlFor="valorDonacion">
                  Valor real de los bienes donados (€)
                  <span className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltiptext}>
                      Valor real de mercado de los bienes donados (dinero, inmuebles, acciones,
                      etc.). Para inmuebles, puede ser el valor de referencia catastral.
                    </span>
                  </span>
                </label>
                <input
                  type="number"
                  id="valorDonacion"
                  name="valorDonacion"
                  min="0"
                  step="0.01"
                  value={formData.valorDonacion}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cargas">Cargas y deudas asociadas a la donación (€)</label>
                <input
                  type="number"
                  id="cargas"
                  name="cargas"
                  min="0"
                  step="0.01"
                  value={formData.cargas}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  ¿Se formalizará en escritura pública?
                  <span className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltiptext}>
                      Obligatorio para inmuebles (viviendas, locales, etc.). Para donaciones de
                      dinero es opcional pero recomendado. En Castilla-La Mancha es NECESARIA
                      escritura pública para aplicar la bonificación autonómica.
                    </span>
                  </span>
                </label>
                <div className={styles.radioGroup}>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="escritura_si"
                      name="escrituraPublica"
                      value="si"
                      checked={formData.escrituraPublica === true}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="escritura_si">Sí</label>
                  </div>
                  <div className={styles.radioOption}>
                    <input
                      type="radio"
                      id="escritura_no"
                      name="escrituraPublica"
                      value="no"
                      checked={formData.escrituraPublica === false}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="escritura_no">No</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Datos del Donatario */}
            <div className={styles.formSection}>
              <h3>👤 Datos del Donatario (Quien Recibe)</h3>

              <div className={styles.formGroup}>
                <label htmlFor="parentesco">
                  Grado de parentesco con el donante
                  <span className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltiptext}>
                      Grupos: I (cónyuge, descendientes &lt;21 años), II (descendientes ≥21,
                      ascendientes), III (colaterales 2º-3º grado: hermanos, tíos, sobrinos), IV
                      (colaterales 4º grado o más lejanos)
                    </span>
                  </span>
                </label>
                <select
                  id="parentesco"
                  name="parentesco"
                  value={formData.parentesco}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Selecciona --</option>
                  <option value="I-conyuge">Cónyuge</option>
                  <option value="I-descendiente">Descendiente menor de 21 años</option>
                  <option value="II">Descendiente de 21 o más años</option>
                  <option value="II-ascendiente">Ascendiente (padre, madre, abuelos)</option>
                  <option value="III">Colaterales 2º y 3º grado (hermanos, tíos, sobrinos)</option>
                  <option value="IV">Colaterales 4º grado o más lejanos</option>
                </select>
              </div>

              <div className={styles.formGroupRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="edad">
                    Edad del donatario (años)
                    <span className={styles.tooltip}>
                      ℹ️
                      <span className={styles.tooltiptext}>
                        Si el donatario es descendiente menor de 21 años, se aplicará una reducción
                        adicional de 3.990,72 € por cada año que le falte para cumplir 21.
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="edad"
                    name="edad"
                    min="0"
                    max="120"
                    value={formData.edad}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="discapacidad">
                    Grado de discapacidad (%)
                    <span className={styles.tooltip}>
                      ℹ️
                      <span className={styles.tooltiptext}>
                        Discapacidad 33%-64%: reducción de 47.858,59 €. Discapacidad ≥65%:
                        reducción de 150.253,03 €.
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="discapacidad"
                    name="discapacidad"
                    min="0"
                    max="100"
                    value={formData.discapacidad}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="patrimonioPreexistente">
                  Patrimonio preexistente del donatario
                  <span className={styles.tooltip}>
                    ℹ️
                    <span className={styles.tooltiptext}>
                      El patrimonio previo del donatario determina el coeficiente multiplicador
                      aplicable. Menor patrimonio = menor coeficiente = menor impuesto.
                    </span>
                  </span>
                </label>
                <select
                  id="patrimonioPreexistente"
                  name="patrimonioPreexistente"
                  value={formData.patrimonioPreexistente}
                  onChange={handleInputChange}
                >
                  <option value="0-402678">Hasta 402.678,11 €</option>
                  <option value="402678-2007380">402.678,12 € - 2.007.380,43 €</option>
                  <option value="2007380-4020770">2.007.380,44 € - 4.020.770,98 €</option>
                  <option value="4020770+">Más de 4.020.770,98 €</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.btnCalculate}>
                💰 Calcular Impuesto
              </button>
              <button
                type="button"
                className={styles.btnReset}
                onClick={() => {
                  setFormData({
                    comunidadAutonoma: '',
                    valorDonacion: 0,
                    cargas: 0,
                    escrituraPublica: true,
                    parentesco: '',
                    edad: 0,
                    discapacidad: 0,
                    patrimonioPreexistente: '0-402678',
                  });
                  setResultado(null);
                }}
              >
                🔄 Limpiar
              </button>
            </div>
          </form>

          {/* Resultados */}
          {resultado && (
            <div className={styles.results}>
              <h3>📊 Resultado del Cálculo</h3>

              <div className={styles.resultContent}>
                <div className={styles.resultHighlight}>
                  <span className={styles.resultLabel}>💶 IMPUESTO A PAGAR:</span>
                  <span className={styles.resultValueFinal}>
                    {formatearMoneda(resultado.cuotaFinal)}
                  </span>
                </div>

                <div className={styles.resultItemSmall}>
                  📍 Comunidad Autónoma: <strong>{resultado.ccaa}</strong>
                </div>

                <div className={styles.divider}></div>

                <h4 style={{ marginTop: '1rem' }}>📝 Desglose del Cálculo</h4>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Valor de la donación:</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.valorDonacion)}
                  </span>
                </div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Base imponible:</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.baseImponible)}
                  </span>
                </div>

                <h4 style={{ marginTop: '1rem' }}>✂️ Reducciones Estatales</h4>

                {resultado.reduccionParentesco > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>• Reducción por parentesco:</span>
                    <span className={styles.resultValue}>
                      -{formatearMoneda(resultado.reduccionParentesco)}
                    </span>
                  </div>
                )}

                {resultado.reduccionEdad > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>• Reducción por edad (menor 21 años):</span>
                    <span className={styles.resultValue}>
                      -{formatearMoneda(resultado.reduccionEdad)}
                    </span>
                  </div>
                )}

                {resultado.reduccionDiscapacidad > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>• Reducción por discapacidad:</span>
                    <span className={styles.resultValue}>
                      -{formatearMoneda(resultado.reduccionDiscapacidad)}
                    </span>
                  </div>
                )}

                {resultado.reduccionBaseAsturias > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>• Reducción base Asturias:</span>
                    <span className={styles.resultValue}>
                      -{formatearMoneda(resultado.reduccionBaseAsturias)}
                    </span>
                  </div>
                )}

                <div
                  className={styles.resultItem}
                  style={{
                    borderTop: '2px solid var(--primary)',
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                  }}
                >
                  <span className={styles.resultLabel}>
                    <strong>Total reducciones:</strong>
                  </span>
                  <span className={styles.resultValue}>
                    <strong>-{formatearMoneda(resultado.totalReducciones)}</strong>
                  </span>
                </div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>
                    <strong>Base liquidable:</strong>
                  </span>
                  <span className={styles.resultValue}>
                    <strong>{formatearMoneda(resultado.baseLiquidable)}</strong>
                  </span>
                </div>

                <h4 style={{ marginTop: '1.5rem' }}>💰 Cálculo del Impuesto</h4>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Cuota íntegra (tarifa estatal):</span>
                  <span className={styles.resultValue}>
                    {formatearMoneda(resultado.cuotaIntegra)}
                  </span>
                </div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>× Coeficiente multiplicador (patrimonio):</span>
                  <span className={styles.resultValue}>×{resultado.coeficiente.toFixed(4)}</span>
                </div>

                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>
                    <strong>Cuota tributaria:</strong>
                  </span>
                  <span className={styles.resultValue}>
                    <strong>{formatearMoneda(resultado.cuotaTributaria)}</strong>
                  </span>
                </div>

                {resultado.bonificacionCCAA.bonificacion > 0 && (
                  <>
                    <h4 style={{ marginTop: '1.5rem' }}>🏛️ Bonificación Autonómica</h4>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>{resultado.bonificacionCCAA.detalle}:</span>
                      <span className={styles.resultValue} style={{ color: '#28a745' }}>
                        -{formatearMoneda(resultado.bonificacionCCAA.bonificacion)}
                      </span>
                    </div>
                  </>
                )}

                {resultado.notas && (
                  <div className={styles.infoBox} style={{ marginTop: '1.5rem' }}>
                    <strong>📌 Notas sobre {resultado.ccaa}:</strong>
                    <br />
                    {resultado.notas}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* REGLA #7: Contenido educativo colapsable */}
        <div className={styles.educationalToggle}>
          <h3>📚 Guía del Impuesto de Donaciones - Régimen Común</h3>
          <p className={styles.educationalSubtitle}>
            Descubre todo sobre el Impuesto de Donaciones: reducciones estatales, bonificaciones
            autonómicas y casos prácticos
          </p>
          <button
            className={styles.btnSecondary}
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            type="button"
          >
            {showEducationalContent ? '▼ Ocultar contenido educativo' : '▶ Mostrar contenido educativo'}
          </button>

          {showEducationalContent && (
            <div className={styles.educationalContent}>
              <div className={styles.eduSection}>
                <h2>¿Qué es el Impuesto sobre Donaciones?</h2>
                <p>
                  El Impuesto sobre Donaciones es un tributo que grava las transmisiones gratuitas de
                  bienes y derechos entre personas vivas. Se aplica cuando alguien (donante) entrega
                  un bien o dinero a otra persona (donatario) sin contraprestación.
                </p>

                <p>
                  <strong>Características principales:</strong>
                </p>
                <ul>
                  <li>El <strong>obligado al pago</strong> es el donatario (quien recibe)</li>
                  <li>
                    Se aplica la normativa de la comunidad autónoma donde <strong>reside el donatario</strong>
                  </li>
                  <li>Plazo de liquidación: 30 días hábiles desde la donación</li>
                  <li>
                    Para inmuebles es <strong>obligatoria la escritura pública</strong> (en Castilla-La
                    Mancha también lo es para la bonificación)
                  </li>
                </ul>

                <h3>🏛️ Comunidades de Régimen Común</h3>
                <p>Esta calculadora aplica para las 14 comunidades autónomas de régimen común:</p>
                <ul>
                  <li>
                    <strong>Bonificación 99%:</strong> Madrid, Andalucía (hasta 1M€), Galicia, Murcia,
                    La Rioja, Castilla-La Mancha (con escritura)
                  </li>
                  <li>
                    <strong>Bonificación 99,9%:</strong> Canarias
                  </li>
                  <li>
                    <strong>Bonificación 75%:</strong> Comunidad Valenciana, Extremadura
                  </li>
                  <li>
                    <strong>Sin bonificación:</strong> Castilla y León, Cantabria, Aragón, Islas Baleares
                  </li>
                  <li>
                    <strong>Reducción especial:</strong> Asturias (300.000€ en base imponible)
                  </li>
                </ul>

                <p>
                  <strong>NO aplica para:</strong> Cataluña, País Vasco y Navarra (tienen régimen
                  foral propio).
                </p>

                <h3>✂️ Reducciones Estatales</h3>
                <p>Todas las comunidades de régimen común aplican las mismas reducciones estatales:</p>

                <h4>Por parentesco:</h4>
                <ul>
                  <li>
                    <strong>Grupo I</strong> (cónyuge, descendientes &lt;21): 15.956,87 €
                  </li>
                  <li>
                    <strong>Grupo II</strong> (descendientes ≥21, ascendientes): 15.956,87 €
                  </li>
                  <li>
                    <strong>Grupo III</strong> (hermanos, tíos, sobrinos): 7.993,46 €
                  </li>
                  <li>
                    <strong>Grupo IV</strong> (colaterales ≥4º grado, extraños): 0 €
                  </li>
                </ul>

                <h4>Por edad (solo descendientes &lt;21 años):</h4>
                <p>
                  Reducción adicional de <strong>3.990,72 € por cada año</strong> que le falte al
                  donatario para cumplir 21 años.
                </p>
                <p>
                  <strong>Ejemplo:</strong> Hijo de 18 años → 3 años × 3.990,72 = 11.972,16 €
                  adicionales
                </p>

                <h4>Por discapacidad:</h4>
                <ul>
                  <li>
                    <strong>Discapacidad 33%-64%:</strong> 47.858,59 €
                  </li>
                  <li>
                    <strong>Discapacidad ≥65%:</strong> 150.253,03 €
                  </li>
                </ul>

                <h3>💰 Tarifa Estatal</h3>
                <p>La tarifa estatal es progresiva (7,65% - 19,35%):</p>
                <ul>
                  <li>Hasta 7.993,46 €: 7,65%</li>
                  <li>7.993,46 - 31.956,87 €: 8,50%</li>
                  <li>31.956,87 - 79.893,43 €: 9,35%</li>
                  <li>79.893,43 - 239.389,19 €: 10,35%</li>
                  <li>239.389,19 - 398.981,96 €: 11,35%</li>
                  <li>398.981,96 - 797.555,08 €: 15,85%</li>
                  <li>Más de 797.555,08 €: 19,35%</li>
                </ul>

                <h3>📊 Coeficientes Multiplicadores</h3>
                <p>
                  El coeficiente depende del <strong>patrimonio previo del donatario</strong> y del
                  grupo de parentesco:
                </p>
                <ul>
                  <li>
                    <strong>Grupos I y II:</strong> 1,0 (hasta 402.678€) → 1,2 (más de 4.020.770€)
                  </li>
                  <li>
                    <strong>Grupo III:</strong> 1,5882 → 1,9059
                  </li>
                  <li>
                    <strong>Grupo IV:</strong> 2,0 → 2,4
                  </li>
                </ul>

                <h3>🏛️ Bonificaciones Autonómicas Especiales</h3>

                <h4>Andalucía:</h4>
                <p>
                  Bonificación 99% para Grupos I y II <strong>hasta 1.000.000€</strong>. Requiere
                  convivencia de 2 años entre donante y donatario. Por encima de 1M€, bonificación
                  0%.
                </p>

                <h4>Asturias:</h4>
                <p>
                  Sin bonificación sobre la cuota, pero <strong>reducción de 300.000€</strong> en
                  base imponible para Grupos I y II. Efecto similar a una bonificación muy alta.
                </p>

                <h4>Castilla-La Mancha:</h4>
                <p>
                  Bonificación 99% para Grupos I y II, pero <strong>REQUIERE ESCRITURA PÚBLICA</strong>.
                  Sin escritura, bonificación 0%.
                </p>

                <h3>💡 Casos Prácticos</h3>

                <h4>Caso 1: Donación padre a hijo (Madrid)</h4>
                <ul>
                  <li>Valor donación: 200.000 €</li>
                  <li>Parentesco: Descendiente ≥21 años (Grupo II)</li>
                  <li>Patrimonio previo: &lt;402.678 €</li>
                  <li>
                    <strong>Resultado:</strong> Base liquidable: 184.043,13 € → Cuota íntegra:
                    19.754,34 € → Coeficiente 1,0 → Cuota tributaria: 19.754,34 € → Bonificación 99%
                    Madrid: 19.556,80 € → <strong>Impuesto final: 197,54 €</strong> (0,1% del valor
                    donado)
                  </li>
                </ul>

                <h4>Caso 2: Donación tío a sobrino (Castilla y León)</h4>
                <ul>
                  <li>Valor donación: 100.000 €</li>
                  <li>Parentesco: Tío-sobrino (Grupo III)</li>
                  <li>Patrimonio previo: &lt;402.678 €</li>
                  <li>
                    <strong>Resultado:</strong> Base liquidable: 92.006,54 € → Cuota íntegra: 9.105,35
                    € → Coeficiente 1,5882 → Cuota tributaria: 14.465,52 € → Sin bonificación →{' '}
                    <strong>Impuesto final: 14.465,52 €</strong> (14,47% del valor donado)
                  </li>
                </ul>

                <h4>Caso 3: Donación padres a hijo &lt;21 años (Canarias)</h4>
                <ul>
                  <li>Valor donación: 150.000 €</li>
                  <li>Parentesco: Descendiente 18 años (Grupo I)</li>
                  <li>Patrimonio previo: 0 €</li>
                  <li>
                    <strong>Resultado:</strong> Reducción parentesco: 15.956,87 € + Reducción edad (3
                    años): 11.972,16 € → Base liquidable: 122.070,97 € → Cuota íntegra: 13.558,51 € →
                    Coeficiente 1,0 → Cuota tributaria: 13.558,51 € → Bonificación 99,9% Canarias:
                    13.544,98 € → <strong>Impuesto final: 13,54 €</strong> (0,009% del valor donado)
                  </li>
                </ul>

                <h3>📌 Consejos Importantes</h3>
                <ul>
                  <li>
                    <strong>Planifica la donación:</strong> En comunidades con bonificación 99%, el
                    impuesto es casi simbólico. Considera la residencia del donatario.
                  </li>
                  <li>
                    <strong>Escritura pública:</strong> Obligatoria para inmuebles. Recomendada para
                    dinero (seguridad jurídica).
                  </li>
                  <li>
                    <strong>Plazo de liquidación:</strong> 30 días hábiles desde la donación. Retrasos
                    generan recargos.
                  </li>
                  <li>
                    <strong>Donaciones fraccionadas:</strong> Donaciones pequeñas repetidas pueden ser
                    más ventajosas que una única grande (aprovechan reducciones varias veces).
                  </li>
                  <li>
                    <strong>Convivencia en Andalucía:</strong> Si donas en Andalucía, asegúrate de
                    cumplir los 2 años de convivencia.
                  </li>
                  <li>
                    <strong>Asesórate:</strong> Consulta con un asesor fiscal profesional antes de
                    realizar donaciones importantes.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
