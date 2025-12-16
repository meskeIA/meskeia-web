'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraDonacionesNacional.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, parseSpanishNumber } from '@/lib';

// ===== TIPOS =====
interface TramoTarifa {
  hasta: number;
  cuota: number;
  resto: number;
  tipo: number;
}

interface BonificacionCCAA {
  nombre: string;
  bonificaciones: Record<string, BonificacionGrupo>;
  notas: string;
  requiereEscritura?: boolean;
}

interface BonificacionGrupo {
  porcentaje?: number;
  exencion?: number;
  limite?: number | null;
  escalonado?: { hasta: number; porcentaje: number }[];
}

interface Resultado {
  ccaa: string;
  nombreCcaa: string;
  baseImponible: number;
  cargas: number;
  baseLiquidable: number;
  reduccionParentesco: number;
  reduccionDiscapacidad: number;
  baseNetaReducida: number;
  cuotaIntegra: number;
  coeficienteMultiplicador: number;
  cuotaTributaria: number;
  bonificacionCcaa: number;
  porcentajeBonificacion: number;
  cuotaFinal: number;
  notasCcaa: string;
}

// ===== CONSTANTES FISCALES RÉGIMEN COMÚN 2025 =====

// Tarifa estatal (régimen común)
const TARIFA_ESTATAL: TramoTarifa[] = [
  { hasta: 7993.46, cuota: 0, resto: 7993.46, tipo: 7.65 },
  { hasta: 15980.91, cuota: 611.50, resto: 7987.45, tipo: 8.50 },
  { hasta: 23968.36, cuota: 1290.43, resto: 7987.45, tipo: 9.35 },
  { hasta: 31955.81, cuota: 2037.26, resto: 7987.45, tipo: 10.20 },
  { hasta: 39943.26, cuota: 2851.98, resto: 7987.45, tipo: 11.05 },
  { hasta: 47930.72, cuota: 3734.59, resto: 7987.46, tipo: 11.90 },
  { hasta: 55918.17, cuota: 4685.10, resto: 7987.45, tipo: 12.75 },
  { hasta: 63905.62, cuota: 5703.50, resto: 7987.45, tipo: 13.60 },
  { hasta: 71893.07, cuota: 6789.79, resto: 7987.45, tipo: 14.45 },
  { hasta: 79880.52, cuota: 7943.98, resto: 7987.45, tipo: 15.30 },
  { hasta: 119757.67, cuota: 9166.06, resto: 39877.15, tipo: 16.15 },
  { hasta: 159634.83, cuota: 15606.22, resto: 39877.16, tipo: 18.70 },
  { hasta: 239389.13, cuota: 23063.25, resto: 79754.30, tipo: 21.25 },
  { hasta: 398777.54, cuota: 40011.04, resto: 159388.41, tipo: 25.50 },
  { hasta: 797555.08, cuota: 80655.08, resto: 398777.54, tipo: 29.75 },
  { hasta: Infinity, cuota: 199291.40, resto: Infinity, tipo: 34.00 },
];

// Coeficientes multiplicadores (régimen común)
const COEFICIENTES: Record<string, number[]> = {
  'I': [1.0000, 1.0500, 1.1000, 1.2000],
  'II': [1.0000, 1.0500, 1.1000, 1.2000],
  'III': [1.5882, 1.6676, 1.7471, 1.9059],
  'IV': [2.0000, 2.1000, 2.2000, 2.4000],
};

// Reducciones por parentesco (estatal)
const REDUCCIONES_PARENTESCO: Record<string, number> = {
  'I-conyuge': 15956.87,
  'I-descendiente': 15956.87,
  'II': 15956.87,
  'II-ascendiente': 15956.87,
  'III': 7993.46,
  'IV': 0,
};

// Bonificaciones por CCAA
const BONIFICACIONES_CCAA: Record<string, BonificacionCCAA> = {
  'madrid': {
    nombre: 'Comunidad de Madrid',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II. Sin límite de importe.',
  },
  'andalucia': {
    nombre: 'Andalucía',
    bonificaciones: {
      'I-conyuge': { exencion: 1000000, porcentaje: 0.99 },
      'I-descendiente': { exencion: 1000000, porcentaje: 0.99 },
      'II': { exencion: 1000000, porcentaje: 0.99 },
      'II-ascendiente': { exencion: 1000000, porcentaje: 0.99 },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Exención total si base liquidable < 1.000.000€ para Grupos I y II. Bonificación 99% para importes superiores.',
  },
  'galicia': {
    nombre: 'Galicia',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para cónyuges, descendientes y ascendientes.',
  },
  'murcia': {
    nombre: 'Región de Murcia',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0.50, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% Grupos I y II, 50% Grupo III (hermanos, tíos, sobrinos).',
  },
  'valencia': {
    nombre: 'Comunidad Valenciana',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.75, limite: null },
      'I-descendiente': { porcentaje: 0.75, limite: null },
      'II': { porcentaje: 0.75, limite: null },
      'II-ascendiente': { porcentaje: 0.75, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 75% para Grupos I y II en donaciones.',
  },
  'extremadura': {
    nombre: 'Extremadura',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
  'canarias': {
    nombre: 'Canarias',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.999, limite: null },
      'I-descendiente': { porcentaje: 0.999, limite: null },
      'II': { porcentaje: 0.999, limite: null },
      'II-ascendiente': { porcentaje: 0.999, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99,9% para Grupos I y II (prácticamente exención total).',
  },
  'castillaleon': {
    nombre: 'Castilla y León',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
  'larioja': {
    nombre: 'La Rioja',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0.99, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I, II y III.',
  },
  'castillamancha': {
    nombre: 'Castilla-La Mancha',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.95, limite: null },
      'I-descendiente': { porcentaje: 0.95, limite: null },
      'II': { porcentaje: 0.95, limite: null },
      'II-ascendiente': { porcentaje: 0.95, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 95% para Grupos I y II. REQUIERE escritura pública.',
    requiereEscritura: true,
  },
  'cantabria': {
    nombre: 'Cantabria',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
  'aragon': {
    nombre: 'Aragón',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.65, limite: null },
      'I-descendiente': { porcentaje: 0.65, limite: null },
      'II': { porcentaje: 0.65, limite: null },
      'II-ascendiente': { porcentaje: 0.65, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 65% para Grupos I y II.',
  },
  'baleares': {
    nombre: 'Islas Baleares',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.93, limite: null },
      'I-descendiente': { porcentaje: 0.93, limite: null },
      'II': { porcentaje: 0.93, limite: null },
      'II-ascendiente': { porcentaje: 0.93, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 93% para Grupos I y II.',
  },
  'asturias': {
    nombre: 'Asturias',
    bonificaciones: {
      'I-conyuge': { porcentaje: 0.99, limite: null },
      'I-descendiente': { porcentaje: 0.99, limite: null },
      'II': { porcentaje: 0.99, limite: null },
      'II-ascendiente': { porcentaje: 0.99, limite: null },
      'III': { porcentaje: 0, limite: null },
      'IV': { porcentaje: 0, limite: null },
    },
    notas: 'Bonificación 99% para Grupos I y II.',
  },
};

// ===== COMPONENTE INPUT =====
interface InputCampoProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: string;
  helperText?: string;
}

function InputCampo({ label, value, onChange, placeholder = '0,00', icon, helperText }: InputCampoProps) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>
        {icon && <span className={styles.labelIcon}>{icon}</span>}
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        inputMode="decimal"
      />
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export default function CalculadoraDonacionesNacionalPage() {
  // Estados
  const [ccaa, setCcaa] = useState('');
  const [valorDonacion, setValorDonacion] = useState('');
  const [cargas, setCargas] = useState('');
  const [escrituraPublica, setEscrituraPublica] = useState(true);
  const [parentesco, setParentesco] = useState('');
  const [patrimonioPreexistente, setPatrimonioPreexistente] = useState('1');
  const [discapacidad, setDiscapacidad] = useState('0');

  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Obtener grupo base
  const getGrupoBase = (grupo: string): string => {
    if (grupo.startsWith('I-') || grupo === 'I') return 'I';
    if (grupo.startsWith('II-') || grupo === 'II') return 'II';
    if (grupo === 'III') return 'III';
    return 'IV';
  };

  // Info de la CCAA seleccionada
  const ccaaInfo = useMemo(() => {
    if (!ccaa) return null;
    return BONIFICACIONES_CCAA[ccaa];
  }, [ccaa]);

  // Calcular tarifa
  const calcularTarifa = (base: number): number => {
    if (base <= 0) return 0;

    for (const tramo of TARIFA_ESTATAL) {
      if (base <= tramo.hasta) {
        const baseEnTramo = base - (tramo.hasta - tramo.resto);
        return tramo.cuota + (baseEnTramo * tramo.tipo / 100);
      }
    }

    // Si supera todos los tramos
    const ultimoTramo = TARIFA_ESTATAL[TARIFA_ESTATAL.length - 1];
    const baseExceso = base - (ultimoTramo.hasta - ultimoTramo.resto);
    return ultimoTramo.cuota + (baseExceso * ultimoTramo.tipo / 100);
  };

  // Calcular bonificación CCAA
  const calcularBonificacionCcaa = (cuotaTributaria: number, baseLiquidable: number): { bonificacion: number; porcentaje: number } => {
    if (!ccaa || !parentesco) return { bonificacion: 0, porcentaje: 0 };

    const configCcaa = BONIFICACIONES_CCAA[ccaa];
    const configGrupo = configCcaa.bonificaciones[parentesco];

    if (!configGrupo) return { bonificacion: 0, porcentaje: 0 };

    // Caso especial: Andalucía con exención
    if (configGrupo.exencion && baseLiquidable <= configGrupo.exencion) {
      return { bonificacion: cuotaTributaria, porcentaje: 1 }; // 100% exención
    }

    // Caso normal: porcentaje de bonificación
    if (configGrupo.porcentaje) {
      // En Castilla-La Mancha requiere escritura
      if (configCcaa.requiereEscritura && !escrituraPublica) {
        return { bonificacion: 0, porcentaje: 0 };
      }

      const bonificacion = cuotaTributaria * configGrupo.porcentaje;
      return { bonificacion, porcentaje: configGrupo.porcentaje };
    }

    return { bonificacion: 0, porcentaje: 0 };
  };

  // Función principal de cálculo
  const calcular = () => {
    if (!ccaa || !parentesco || !valorDonacion) {
      alert('Por favor, selecciona la comunidad autónoma, el parentesco e introduce el valor de la donación.');
      return;
    }

    const valor = parseSpanishNumber(valorDonacion) || 0;
    const cargasVal = parseSpanishNumber(cargas) || 0;
    const grupoBase = getGrupoBase(parentesco);

    // 1. Base imponible
    const baseImponible = valor;

    // 2. Cargas deducibles
    const baseLiquidable = Math.max(0, baseImponible - cargasVal);

    // 3. Reducciones por parentesco
    const reduccionParentesco = REDUCCIONES_PARENTESCO[parentesco] || 0;

    // 4. Reducción por discapacidad
    let reduccionDiscapacidad = 0;
    const disc = parseInt(discapacidad);
    if (disc >= 33 && disc < 65) {
      reduccionDiscapacidad = 47859.59;
    } else if (disc >= 65) {
      reduccionDiscapacidad = 150253.03;
    }

    // 5. Base neta reducida
    const baseNetaReducida = Math.max(0, baseLiquidable - reduccionParentesco - reduccionDiscapacidad);

    // 6. Cuota íntegra
    const cuotaIntegra = calcularTarifa(baseNetaReducida);

    // 7. Coeficiente multiplicador
    const indicePatrimonio = parseInt(patrimonioPreexistente) - 1;
    const coeficiente = COEFICIENTES[grupoBase][indicePatrimonio];

    // 8. Cuota tributaria
    const cuotaTributaria = cuotaIntegra * coeficiente;

    // 9. Bonificación autonómica
    const { bonificacion: bonificacionCcaa, porcentaje: porcentajeBonificacion } = calcularBonificacionCcaa(cuotaTributaria, baseLiquidable);

    // 10. Cuota final
    const cuotaFinal = Math.max(0, cuotaTributaria - bonificacionCcaa);

    setResultado({
      ccaa,
      nombreCcaa: BONIFICACIONES_CCAA[ccaa].nombre,
      baseImponible,
      cargas: cargasVal,
      baseLiquidable,
      reduccionParentesco,
      reduccionDiscapacidad,
      baseNetaReducida,
      cuotaIntegra,
      coeficienteMultiplicador: coeficiente,
      cuotaTributaria,
      bonificacionCcaa,
      porcentajeBonificacion,
      cuotaFinal,
      notasCcaa: BONIFICACIONES_CCAA[ccaa].notas,
    });
  };

  // Limpiar
  const limpiar = () => {
    setCcaa('');
    setValorDonacion('');
    setCargas('');
    setEscrituraPublica(true);
    setParentesco('');
    setPatrimonioPreexistente('1');
    setDiscapacidad('0');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🇪🇸 Calculadora Donaciones España 2025</h1>
        <p className={styles.subtitle}>
          Calcula el Impuesto de Donaciones en 14 comunidades autónomas con bonificaciones actualizadas
        </p>
      </header>

      {/* Info ámbito */}
      <div className={styles.infoCcaa}>
        <p>
          <strong>Ámbito de aplicación:</strong> Esta calculadora aplica el régimen común para 14 comunidades:
          Madrid, Andalucía, Galicia, Asturias, Cantabria, La Rioja, Aragón, Castilla y León,
          Castilla-La Mancha, Extremadura, Comunidad Valenciana, Murcia, Baleares y Canarias.
          <br /><strong>NO válida para:</strong> Cataluña, País Vasco y Navarra (régimen foral propio).
        </p>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta calculadora es una <strong>herramienta orientativa</strong>. Los resultados son estimaciones
          basadas en la normativa vigente, pero <strong>NO sustituyen el asesoramiento fiscal profesional</strong>.
        </p>
        <ul>
          <li>Casos especiales no incluidos: empresas familiares, explotaciones agrarias</li>
          <li>Verifique los requisitos con la Agencia Tributaria de su CCAA</li>
          <li>Las bonificaciones pueden tener requisitos adicionales</li>
        </ul>
      </div>

      <div className={styles.mainContent}>
        {/* Panel de Inputs */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>📝 Datos de la Donación</h2>

          {/* CCAA */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>🏛️ Comunidad Autónoma</h3>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Residencia del donatario (quien recibe)</label>
              <select
                className={styles.select}
                value={ccaa}
                onChange={(e) => setCcaa(e.target.value)}
              >
                <option value="">-- Selecciona tu comunidad --</option>
                <option value="madrid">Madrid</option>
                <option value="andalucia">Andalucía</option>
                <option value="galicia">Galicia</option>
                <option value="asturias">Asturias</option>
                <option value="cantabria">Cantabria</option>
                <option value="larioja">La Rioja</option>
                <option value="aragon">Aragón</option>
                <option value="castillaleon">Castilla y León</option>
                <option value="castillamancha">Castilla-La Mancha ⚠️</option>
                <option value="extremadura">Extremadura</option>
                <option value="valencia">Comunidad Valenciana</option>
                <option value="murcia">Región de Murcia</option>
                <option value="baleares">Islas Baleares</option>
                <option value="canarias">Canarias</option>
              </select>
            </div>

            {ccaaInfo && (
              <div className={styles.bonificacionCcaa}>
                <h4>📊 {ccaaInfo.nombre}</h4>
                <p>{ccaaInfo.notas}</p>
              </div>
            )}
          </div>

          {/* Valor donación */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>💰 Valor de la Donación</h3>
            <InputCampo
              label="Valor real de los bienes donados"
              value={valorDonacion}
              onChange={setValorDonacion}
              icon="💵"
              helperText="Dinero, inmuebles, acciones, vehículos, etc."
            />
            <InputCampo
              label="Cargas y deudas asociadas"
              value={cargas}
              onChange={setCargas}
              icon="📋"
              helperText="Hipoteca u otras deudas que asume el donatario"
            />
          </div>

          {/* Escritura pública */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>📜 Formalización</h3>
            <div className={styles.inputGroup}>
              <label className={styles.label}>¿Se formalizará en escritura pública?</label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="escrituraSi"
                    checked={escrituraPublica}
                    onChange={() => setEscrituraPublica(true)}
                  />
                  <label htmlFor="escrituraSi">Sí</label>
                </div>
                <div className={styles.radioOption}>
                  <input
                    type="radio"
                    id="escrituraNo"
                    checked={!escrituraPublica}
                    onChange={() => setEscrituraPublica(false)}
                  />
                  <label htmlFor="escrituraNo">No</label>
                </div>
              </div>
              <span className={styles.helperText}>Obligatoria para inmuebles</span>
            </div>

            {ccaa === 'castillamancha' && !escrituraPublica && (
              <div className={styles.warningEscritura}>
                <p>⚠️ En Castilla-La Mancha es <strong>NECESARIA la escritura pública</strong> para aplicar la bonificación autonómica.</p>
              </div>
            )}
          </div>

          {/* Parentesco */}
          <div className={styles.seccionInputs}>
            <h3 className={styles.seccionTitulo}>👥 Datos del Donatario</h3>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Parentesco con el donante</label>
              <select
                className={styles.select}
                value={parentesco}
                onChange={(e) => setParentesco(e.target.value)}
              >
                <option value="">-- Selecciona --</option>
                <option value="I-conyuge">Cónyuge</option>
                <option value="I-descendiente">Descendiente menor de 21 años</option>
                <option value="II">Descendiente de 21 años o más</option>
                <option value="II-ascendiente">Ascendiente (padre, madre, abuelo)</option>
                <option value="III">Hermano, tío, sobrino (2º-3º grado)</option>
                <option value="IV">Primos, otros o sin parentesco (4º grado+)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Patrimonio preexistente</label>
              <select
                className={styles.select}
                value={patrimonioPreexistente}
                onChange={(e) => setPatrimonioPreexistente(e.target.value)}
              >
                <option value="1">Menos de 402.678,11 €</option>
                <option value="2">402.678 € - 2.007.380 €</option>
                <option value="3">2.007.380 € - 4.020.770 €</option>
                <option value="4">Más de 4.020.770,98 €</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Discapacidad reconocida</label>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input type="radio" id="disc0" checked={discapacidad === '0'} onChange={() => setDiscapacidad('0')} />
                  <label htmlFor="disc0">No</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="disc33" checked={discapacidad === '33'} onChange={() => setDiscapacidad('33')} />
                  <label htmlFor="disc33">33%-64%</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="disc65" checked={discapacidad === '65'} onChange={() => setDiscapacidad('65')} />
                  <label htmlFor="disc65">≥65%</label>
                </div>
              </div>
            </div>
          </div>

          <button onClick={calcular} className={styles.btnPrimary}>
            Calcular Impuesto
          </button>
          <button onClick={limpiar} className={styles.btnSecondary}>
            Limpiar Formulario
          </button>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>📊 Resultado del Cálculo</h2>

          {!resultado ? (
            <div className={styles.infoBox}>
              <h4>Selecciona tu comunidad autónoma</h4>
              <p>Cada CCAA tiene bonificaciones diferentes que pueden reducir significativamente el impuesto.</p>
            </div>
          ) : (
            <>
              {/* Resultado destacado */}
              <div className={styles.resultadoDestacado}>
                <span className={styles.resultadoLabel}>Impuesto a Pagar en {resultado.nombreCcaa}</span>
                <span className={styles.resultadoValor}>{formatCurrency(resultado.cuotaFinal)}</span>
                {resultado.porcentajeBonificacion > 0 && (
                  <span className={styles.resultadoNota}>
                    Bonificación autonómica: {(resultado.porcentajeBonificacion * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {/* Desglose */}
              <div className={styles.desglose}>
                <h4 className={styles.desgloseTitle}>Base Imponible</h4>
                <div className={styles.lineaDesglose}>
                  <span>Valor donación</span>
                  <span>{formatCurrency(resultado.baseImponible)}</span>
                </div>
                {resultado.cargas > 0 && (
                  <div className={styles.lineaDesglose}>
                    <span>- Cargas deducibles</span>
                    <span>{formatCurrency(resultado.cargas)}</span>
                  </div>
                )}
                <div className={`${styles.lineaDesglose} ${styles.lineaTotal}`}>
                  <span>Base liquidable</span>
                  <span>{formatCurrency(resultado.baseLiquidable)}</span>
                </div>
              </div>

              {/* Reducciones */}
              {(resultado.reduccionParentesco > 0 || resultado.reduccionDiscapacidad > 0) && (
                <div className={styles.desglose}>
                  <h4 className={styles.desgloseTitle}>Reducciones</h4>
                  {resultado.reduccionParentesco > 0 && (
                    <div className={styles.lineaDesglose}>
                      <span className={styles.lineaBonificacion}>- Por parentesco</span>
                      <span className={styles.lineaBonificacion}>{formatCurrency(resultado.reduccionParentesco)}</span>
                    </div>
                  )}
                  {resultado.reduccionDiscapacidad > 0 && (
                    <div className={styles.lineaDesglose}>
                      <span className={styles.lineaBonificacion}>- Por discapacidad</span>
                      <span className={styles.lineaBonificacion}>{formatCurrency(resultado.reduccionDiscapacidad)}</span>
                    </div>
                  )}
                  <div className={styles.lineaSeparador} />
                  <div className={`${styles.lineaDesglose} ${styles.lineaTotal}`}>
                    <span>Base neta reducida</span>
                    <span>{formatCurrency(resultado.baseNetaReducida)}</span>
                  </div>
                </div>
              )}

              {/* Liquidación */}
              <div className={styles.desglose}>
                <h4 className={styles.desgloseTitle}>Liquidación</h4>
                <div className={styles.lineaDesglose}>
                  <span>Cuota íntegra</span>
                  <span>{formatCurrency(resultado.cuotaIntegra)}</span>
                </div>
                <div className={styles.lineaDesglose}>
                  <span>Coeficiente multiplicador</span>
                  <span>×{resultado.coeficienteMultiplicador.toFixed(4)}</span>
                </div>
                <div className={styles.lineaDesglose}>
                  <span>Cuota tributaria</span>
                  <span>{formatCurrency(resultado.cuotaTributaria)}</span>
                </div>
                {resultado.bonificacionCcaa > 0 && (
                  <div className={styles.lineaDesglose}>
                    <span className={styles.lineaBonificacion}>- Bonificación {resultado.nombreCcaa}</span>
                    <span className={styles.lineaBonificacion}>{formatCurrency(resultado.bonificacionCcaa)}</span>
                  </div>
                )}
                <div className={styles.lineaSeparador} />
                <div className={`${styles.lineaDesglose} ${styles.lineaTotal}`}>
                  <span>CUOTA A PAGAR</span>
                  <span>{formatCurrency(resultado.cuotaFinal)}</span>
                </div>
              </div>

              {/* Info */}
              <div className={styles.infoBox}>
                <h4>ℹ️ {resultado.nombreCcaa}</h4>
                <p>{resultado.notasCcaa}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre el Impuesto de Donaciones?"
        subtitle="Guía completa con bonificaciones por comunidad autónoma"
      >
        <section className={styles.guideSection}>
          <h2>Guía del Impuesto de Donaciones en España</h2>
          <p className={styles.introParagraph}>
            El Impuesto de Donaciones está cedido a las comunidades autónomas, que aplican
            diferentes bonificaciones. Conocer las de tu CCAA puede suponer un ahorro importante.
          </p>

          <h3>Bonificaciones por Comunidad Autónoma (Grupos I y II)</h3>
          <table className={styles.tablaBonificaciones}>
            <thead>
              <tr>
                <th>Comunidad</th>
                <th>Bonificación</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Canarias</td><td><strong>99,9%</strong></td><td>Prácticamente exención total</td></tr>
              <tr><td>Madrid</td><td><strong>99%</strong></td><td>Sin límite de importe</td></tr>
              <tr><td>Andalucía</td><td><strong>100% / 99%</strong></td><td>Exención total hasta 1M€</td></tr>
              <tr><td>La Rioja</td><td><strong>99%</strong></td><td>También Grupo III</td></tr>
              <tr><td>Galicia, Asturias, Cantabria</td><td><strong>99%</strong></td><td>Grupos I y II</td></tr>
              <tr><td>Castilla y León, Extremadura</td><td><strong>99%</strong></td><td>Grupos I y II</td></tr>
              <tr><td>Murcia</td><td><strong>99% / 50%</strong></td><td>99% Gr. I-II, 50% Gr. III</td></tr>
              <tr><td>Castilla-La Mancha</td><td><strong>95%</strong></td><td>Requiere escritura pública</td></tr>
              <tr><td>Baleares</td><td><strong>93%</strong></td><td>Grupos I y II</td></tr>
              <tr><td>Valencia</td><td><strong>75%</strong></td><td>Grupos I y II</td></tr>
              <tr><td>Aragón</td><td><strong>65%</strong></td><td>Grupos I y II</td></tr>
            </tbody>
          </table>

          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>👥 Grupos de Parentesco</h4>
              <ul>
                <li><strong>Grupo I:</strong> Descendientes &lt;21 años, cónyuge</li>
                <li><strong>Grupo II:</strong> Descendientes ≥21, ascendientes</li>
                <li><strong>Grupo III:</strong> Colaterales 2º-3º grado</li>
                <li><strong>Grupo IV:</strong> 4º grado o más, extraños</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>♿ Reducciones por Discapacidad</h4>
              <ul>
                <li>33%-64%: reducción 47.859,59€</li>
                <li>≥65%: reducción 150.253,03€</li>
                <li>Compatibles con otras reducciones</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>📅 Plazos y Modelo</h4>
              <ul>
                <li>Plazo: <strong>1 mes</strong> desde la donación</li>
                <li>Modelo: <strong>651</strong></li>
                <li>Competente: CCAA del donatario</li>
              </ul>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Qué CCAA es competente para la donación?</summary>
              <p>
                La comunidad autónoma donde tenga su <strong>residencia habitual el donatario</strong>
                (quien recibe la donación). Se considera residencia habitual donde haya permanecido
                más días en los últimos 5 años.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Por qué no aparecen Cataluña, País Vasco y Navarra?</summary>
              <p>
                Estas comunidades tienen <strong>régimen foral propio</strong> con normativa diferente
                al régimen común. Cataluña tiene su propia calculadora en meskeIA. País Vasco y Navarra
                tienen regímenes muy distintos.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Es obligatoria la escritura pública?</summary>
              <p>
                Es <strong>obligatoria para inmuebles</strong>. Para dinero no es obligatoria legalmente,
                pero en <strong>Castilla-La Mancha es necesaria</strong> para aplicar la bonificación
                autonómica. En general, se recomienda para mayor seguridad jurídica.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Puedo cambiar de CCAA para pagar menos?</summary>
              <p>
                El impuesto se paga donde reside habitualmente el donatario. Cambiar de residencia
                solo para pagar menos impuestos puede considerarse <strong>fraude fiscal</strong>.
                La Agencia Tributaria puede investigar cambios de residencia sospechosos.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('calculadora-donaciones-nacional')}
        title="Herramientas fiscales"
        icon="⚖️"
      />

      <Footer appName="calculadora-donaciones-nacional" />
    </div>
  );
}
