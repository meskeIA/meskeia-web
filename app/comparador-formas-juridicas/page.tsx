'use client';

import { useState, useMemo } from 'react';
import styles from './ComparadorFormasJuridicas.module.css';
import { MeskeiaLogo, LegalNotice, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard, RegionBadge } from '@/components';
import DataReference from '@/components/DataReference';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { FISCAL_SOCIEDADES_META } from '@/data/fiscal';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  NB,
  IRPF_RANGO,
  IS_GENERAL,
  IS_COOPERATIVAS,
  IS_NUEVA_CREACION,
  IS_MICRO_TRAMO1,
  IS_MICRO_TRAMO2,
  IS_SL_RESUMEN,
  TARIFA_PLANA,
  DISENADORA_BASE,
  DISENADORA_CUOTA,
  DISENADORA_MARGINAL,
  marginalIRPF,
  tramoIRPF,
} from './datos';

// Tipos
type FormaJuridica = 'autonomo' | 'sl' | 'cooperativa' | 'asociacion' | 'cb';

interface CaracteristicaForma {
  id: FormaJuridica;
  nombre: string;
  nombreCorto: string;
  icon: string;
  descripcion: string;
  capitalMinimo: number | null;
  /** Texto en lugar de la cifra cuando la ley no fija un mínimo único (cooperativa, 3054) */
  capitalTexto?: string;
  capitalRecomendado?: string;
  socios: { min: number; max: number | null };
  responsabilidad: 'ilimitada' | 'limitada';
  responsabilidadTexto: string;
  fiscalidad: string;
  tipoImpuesto: string;
  tipoGravamen?: string;
  cotizacionSS: string;
  tramitesAlta: string[];
  costesConstitucion: { min: number; max: number };
  tiempoConstitucion: string;
  contabilidad: string;
  ventajas: string[];
  desventajas: string[];
  idealPara: string[];
  color: string;
}

// Base de datos de formas jurídicas
const FORMAS_JURIDICAS: CaracteristicaForma[] = [
  {
    id: 'autonomo',
    nombre: 'Trabajador Autónomo',
    nombreCorto: 'Autónomo',
    icon: '💼',
    descripcion: 'Persona física que realiza actividad económica por cuenta propia',
    capitalMinimo: null,
    capitalRecomendado: 'No requiere',
    socios: { min: 1, max: 1 },
    responsabilidad: 'ilimitada',
    responsabilidadTexto: 'Ilimitada con patrimonio personal',
    fiscalidad: 'IRPF (tramos progresivos)',
    tipoImpuesto: 'IRPF',
    tipoGravamen: IRPF_RANGO,
    cotizacionSS: 'RETA (cuota según ingresos)',
    tramitesAlta: [
      'Alta en Hacienda (modelo 036/037)',
      'Alta en RETA (Seguridad Social)',
      'Licencia de apertura (si aplica)',
    ],
    costesConstitucion: { min: 0, max: 100 },
    tiempoConstitucion: '1-3 días',
    contabilidad: 'Libro de ingresos/gastos',
    ventajas: [
      'Alta rápida y económica',
      `Tarifa plana: ${TARIFA_PLANA}`,
      'Sin capital mínimo',
      'Contabilidad simplificada',
      'Total control de decisiones',
      'Deducciones por gastos de actividad',
    ],
    desventajas: [
      'Responsabilidad ilimitada (patrimonio personal)',
      'IRPF puede ser alto con beneficios altos',
      'En contratos con grandes empresas o licitaciones públicas, algunas exigen forma societaria; revisar contrato a contrato',
      'Dificultad para acceder a financiación',
      'No puedes tener socios',
    ],
    idealPara: [
      'Freelancers y consultores',
      'Profesionales liberales',
      'Pequeños comercios',
      'Iniciar un negocio con bajo riesgo',
      'Probar una idea de negocio',
    ],
    color: '#2E86AB',
  },
  {
    id: 'sl',
    nombre: 'Sociedad Limitada (SL / SLU)',
    nombreCorto: 'SL / SLU',
    icon: '🏢',
    descripcion: 'Sociedad mercantil con responsabilidad limitada. Con 1 socio es SLU (Unipersonal)',
    capitalMinimo: 1,
    capitalRecomendado: `3.000${NB}€ recomendado (restricciones hasta alcanzarlo)`,
    socios: { min: 1, max: null },
    responsabilidad: 'limitada',
    responsabilidadTexto: 'Limitada al capital social',
    fiscalidad: 'Impuesto de Sociedades',
    tipoImpuesto: 'IS',
    tipoGravamen: IS_SL_RESUMEN,
    // ⚠️ 07/10/2026 (hallazgo 3053): el RETA no es obligatorio en todos los casos, sino para el
    // administrador que cobra y tiene el control efectivo (art. 305.2.b LGSS)
    cotizacionSS: 'RETA para el administrador que cobra y tiene el control efectivo',
    tramitesAlta: [
      'Certificación negativa de denominación',
      'Apertura cuenta bancaria y depósito capital',
      'Estatutos sociales',
      'Escritura pública ante notario',
      'Liquidación ITP/AJD',
      'Inscripción en Registro Mercantil',
      'Alta en Hacienda (CIF)',
      'Alta en Seguridad Social',
      '(Si SLU: inscribir unipersonalidad)',
    ],
    costesConstitucion: { min: 400, max: 1000 },
    tiempoConstitucion: '2-4 semanas',
    contabilidad: 'Contabilidad completa (Plan General Contable)',
    ventajas: [
      'Responsabilidad limitada al capital',
      'Mayor credibilidad empresarial',
      `IS reducido para sociedades nuevas (${IS_NUEVA_CREACION}) y pequeñas (${IS_MICRO_TRAMO1}/${IS_MICRO_TRAMO2})`,
      'Facilidad para incorporar socios/inversores',
      'Posibilidad de vender participaciones',
      'Acceso a más financiación',
      'Con 1 socio: protege patrimonio personal (SLU)',
    ],
    desventajas: [
      'Mayor coste de constitución',
      'Contabilidad más compleja',
      'Obligaciones formales (juntas, cuentas anuales)',
      'El administrador con control efectivo cotiza en el RETA (art. 305.2.b LGSS)',
      'Trámites más lentos',
      `Con menos de 3.000${NB}€ de capital: reserva legal reforzada y responsabilidad solidaria de los socios en la liquidación`,
    ],
    idealPara: [
      'Negocios con riesgo patrimonial',
      'Proyectos con varios socios',
      'Empresas que buscan inversores',
      'Negocios que contratan empleados',
      'Beneficios altos y estables',
      'Emprendedores solos que quieren proteger patrimonio (SLU)',
    ],
    color: '#48A9A6',
  },
  {
    id: 'cooperativa',
    nombre: 'Cooperativa de Trabajo',
    nombreCorto: 'Cooperativa',
    icon: '🤝',
    // ⚠️ 07/10/2026 (hallazgo 3054): la Ley 27/1999 no la define sin ánimo de lucro (art. 1.1)
    // ni fija un capital mínimo: lo fijan los estatutos (art. 45.2) y varía por ley autonómica
    descripcion: 'Sociedad de personas socias que desarrollan juntas una actividad económica, con gestión democrática',
    capitalMinimo: null,
    capitalTexto: 'Lo fijan los estatutos (según la ley aplicable)',
    capitalRecomendado: 'Lo fijan los estatutos',
    socios: { min: 3, max: null },
    responsabilidad: 'limitada',
    responsabilidadTexto: 'Limitada a las aportaciones',
    fiscalidad: 'Impuesto de Sociedades (régimen especial)',
    tipoImpuesto: 'IS Cooperativas',
    // ⚠️ 07/10/2026 (hallazgo 3045): el 20 % es de TODAS las protegidas (Ley 20/1990, art. 33.2.a);
    // las especialmente protegidas tienen además un 50 % de bonificación de la cuota (art. 34.2)
    tipoGravamen: `${IS_COOPERATIVAS} si es protegida; las especialmente protegidas, además 50${NB}% de bonificación`,
    cotizacionSS: 'Régimen General o RETA (según estatutos)',
    tramitesAlta: [
      'Asamblea constituyente',
      'Redacción de estatutos',
      'Escritura pública ante notario',
      'Inscripción en Registro de Cooperativas',
      'Alta en Hacienda (CIF)',
      'Alta en Seguridad Social',
    ],
    costesConstitucion: { min: 500, max: 1500 },
    tiempoConstitucion: '1-2 meses',
    contabilidad: 'Contabilidad completa + libros sociales',
    ventajas: [
      `Tipo reducido del IS (${IS_COOPERATIVAS}) si es fiscalmente protegida`,
      'Bonificaciones fiscales',
      'Ayudas y subvenciones específicas',
      'Gestión democrática (1 socio = 1 voto)',
      'Responsabilidad limitada',
      'Acceso a programas de fomento',
    ],
    desventajas: [
      'Mínimo 3 socios',
      'Gestión más compleja (asambleas)',
      'Limitaciones en el reparto de beneficios',
      'Trámites de constitución más largos',
      'Normativa específica por CCAA',
    ],
    idealPara: [
      'Proyectos con varios socios igualitarios',
      'Empresas de economía social',
      'Profesionales que quieren unirse',
      'Sectores con apoyo a cooperativismo',
    ],
    color: '#E9C46A',
  },
  {
    id: 'asociacion',
    nombre: 'Asociación sin Ánimo de Lucro',
    nombreCorto: 'Asociación',
    icon: '🎗️',
    descripcion: 'Agrupación de personas para un fin común no lucrativo',
    capitalMinimo: null,
    capitalRecomendado: 'No requiere',
    socios: { min: 3, max: null },
    responsabilidad: 'limitada',
    responsabilidadTexto: 'Limitada al patrimonio asociativo',
    fiscalidad: 'Impuesto de Sociedades (exenciones)',
    tipoImpuesto: 'IS (parcial)',
    tipoGravamen: `${IS_GENERAL}, con exenciones`,
    cotizacionSS: 'Empleados en Régimen General',
    tramitesAlta: [
      'Acta fundacional',
      'Redacción de estatutos',
      'Inscripción en Registro de Asociaciones',
      'Alta en Hacienda (si actividad económica)',
    ],
    costesConstitucion: { min: 50, max: 300 },
    tiempoConstitucion: '1-3 semanas',
    contabilidad: 'Contabilidad simplificada (según tamaño)',
    ventajas: [
      'Coste de constitución muy bajo',
      'Exenciones fiscales',
      'Acceso a subvenciones',
      'No requiere capital',
      'Gestión democrática',
      'Puede recibir donaciones deducibles',
    ],
    desventajas: [
      'No puede repartir beneficios entre socios',
      'Actividad económica limitada',
      'Menos credibilidad comercial',
      'Mínimo 3 personas',
      'Beneficios deben reinvertirse en fines',
    ],
    idealPara: [
      'Actividades culturales, deportivas, sociales',
      'ONGs y proyectos solidarios',
      'Clubs y agrupaciones',
      'Proyectos sin ánimo de lucro',
    ],
    color: '#E76F51',
  },
  {
    id: 'cb',
    nombre: 'Comunidad de Bienes (CB)',
    nombreCorto: 'CB',
    icon: '👥',
    descripcion: 'Contrato entre varias personas que ponen en común bienes o derechos',
    capitalMinimo: null,
    capitalRecomendado: 'No requiere',
    socios: { min: 2, max: null },
    responsabilidad: 'ilimitada',
    responsabilidadTexto: 'Ilimitada y solidaria',
    fiscalidad: 'IRPF (cada comunero tributa su parte)',
    tipoImpuesto: 'IRPF',
    tipoGravamen: `${IRPF_RANGO} (cada comunero)`,
    cotizacionSS: 'Cada comunero en RETA',
    tramitesAlta: [
      'Contrato privado entre comuneros',
      'Alta en Hacienda (modelo 036)',
      'Alta de cada comunero en RETA',
    ],
    costesConstitucion: { min: 0, max: 200 },
    tiempoConstitucion: '1-3 días',
    contabilidad: 'Libro de ingresos/gastos (como autónomo)',
    ventajas: [
      'Constitución rápida y barata',
      'Sin capital mínimo',
      'Contabilidad simple',
      'Flexibilidad en la gestión',
      'Fácil de disolver',
    ],
    desventajas: [
      'Responsabilidad ilimitada y solidaria',
      'Cada comunero tributa por IRPF',
      'Menos credibilidad empresarial',
      'Conflictos potenciales entre comuneros',
      'No tiene personalidad jurídica propia',
    ],
    idealPara: [
      'Pequeños negocios entre familiares/amigos',
      'Explotación conjunta de bienes',
      'Proyectos temporales o de bajo riesgo',
      'Inicio de actividad con socios',
    ],
    color: '#9C89B8',
  },
];

// Criterios de comparación
const CRITERIOS = [
  { id: 'capital', label: 'Capital mínimo', icon: '💰' },
  { id: 'socios', label: 'Número de socios', icon: '👥' },
  { id: 'responsabilidad', label: 'Responsabilidad', icon: '⚖️' },
  { id: 'fiscalidad', label: 'Fiscalidad', icon: '📊' },
  { id: 'cotizacion', label: 'Cotización SS', icon: '🏥' },
  { id: 'costes', label: 'Costes constitución', icon: '💶' },
  { id: 'tiempo', label: 'Tiempo de alta', icon: '⏱️' },
  { id: 'contabilidad', label: 'Contabilidad', icon: '📚' },
];

export default function ComparadorFormasJuridicasPage() {
  // Estado (5 formas jurídicas disponibles)
  const [formasSeleccionadas, setFormasSeleccionadas] = useState<FormaJuridica[]>(['autonomo', 'sl']);
  const [vistaActiva, setVistaActiva] = useState<'comparador' | 'detalle' | 'test'>('comparador');
  const [formaDetalle, setFormaDetalle] = useState<FormaJuridica | null>(null);

  // Estado para el test
  const [respuestasTest, setRespuestasTest] = useState<{ [key: string]: string }>({});

  // Formas seleccionadas con datos
  const formasConDatos = useMemo(() => {
    return FORMAS_JURIDICAS.filter(f => formasSeleccionadas.includes(f.id));
  }, [formasSeleccionadas]);

  // Toggle forma seleccionada
  const toggleForma = (id: FormaJuridica) => {
    setFormasSeleccionadas(prev => {
      if (prev.includes(id)) {
        // No permitir menos de 1
        if (prev.length <= 1) return prev;
        return prev.filter(f => f !== id);
      } else {
        // Máximo 4 para comparar
        if (prev.length >= 4) return prev;
        return [...prev, id];
      }
    });
  };

  // Ver detalle de una forma
  const verDetalle = (id: FormaJuridica) => {
    setFormaDetalle(id);
    setVistaActiva('detalle');
  };

  // Obtener valor de criterio
  const getValorCriterio = (forma: CaracteristicaForma, criterio: string): string => {
    switch (criterio) {
      case 'capital':
        return forma.capitalTexto ?? (forma.capitalMinimo === null ? 'No requiere' : formatCurrency(forma.capitalMinimo));
      case 'socios':
        return forma.socios.max === null
          ? `${forma.socios.min}+`
          : forma.socios.min === forma.socios.max
          ? `${forma.socios.min}`
          : `${forma.socios.min}-${forma.socios.max}`;
      case 'responsabilidad':
        return forma.responsabilidad === 'limitada' ? '✅ Limitada' : '⚠️ Ilimitada';
      case 'fiscalidad':
        return `${forma.tipoImpuesto} (${forma.tipoGravamen})`;
      case 'cotizacion':
        return forma.cotizacionSS;
      case 'costes':
        return `${formatCurrency(forma.costesConstitucion.min)} - ${formatCurrency(forma.costesConstitucion.max)}`;
      case 'tiempo':
        return forma.tiempoConstitucion;
      case 'contabilidad':
        return forma.contabilidad;
      default:
        return '-';
    }
  };

  // Preguntas del test
  const preguntasTest = [
    {
      id: 'socios',
      pregunta: '¿Cuántas personas vais a emprender?',
      opciones: [
        { valor: '1', texto: 'Solo yo' },
        { valor: '2', texto: '2 personas' },
        { valor: '3+', texto: '3 o más' },
      ],
    },
    {
      id: 'riesgo',
      pregunta: '¿Qué nivel de riesgo patrimonial tiene tu actividad?',
      opciones: [
        { valor: 'bajo', texto: 'Bajo (servicios, consultoría)' },
        { valor: 'medio', texto: 'Medio (pequeño comercio)' },
        { valor: 'alto', texto: 'Alto (empleados, stock, local)' },
      ],
    },
    {
      id: 'ingresos',
      pregunta: '¿Qué facturación anual esperas?',
      opciones: [
        { valor: 'bajo', texto: `Menos de 20.000${NB}€` },
        { valor: 'medio', texto: `20.000${NB}€ - 60.000${NB}€` },
        { valor: 'alto', texto: `Más de 60.000${NB}€` },
      ],
    },
    {
      id: 'inversion',
      pregunta: '¿Necesitas atraer inversores externos?',
      opciones: [
        { valor: 'no', texto: 'No, autofinanciación' },
        { valor: 'quizas', texto: 'Quizás en el futuro' },
        { valor: 'si', texto: 'Sí, busco inversión' },
      ],
    },
    {
      id: 'objetivo',
      pregunta: '¿Cuál es el objetivo principal?',
      opciones: [
        { valor: 'lucro', texto: 'Generar beneficios' },
        { valor: 'social', texto: 'Fin social/sin ánimo de lucro' },
        { valor: 'cooperativo', texto: 'Proyecto cooperativo igualitario' },
      ],
    },
  ];

  // Calcular recomendación del test
  const recomendacionTest = useMemo(() => {
    if (Object.keys(respuestasTest).length < preguntasTest.length) return null;

    let puntos: { [key in FormaJuridica]: number } = {
      autonomo: 0,
      sl: 0,
      cooperativa: 0,
      asociacion: 0,
      cb: 0,
    };

    // Evaluar respuestas
    if (respuestasTest.socios === '1') {
      puntos.autonomo += 3;
      puntos.sl += 2; // SL/SLU también válida para 1 socio
    } else if (respuestasTest.socios === '2') {
      puntos.cb += 2;
      puntos.sl += 2;
    } else {
      puntos.sl += 2;
      puntos.cooperativa += 3;
      puntos.asociacion += 2;
    }

    if (respuestasTest.riesgo === 'bajo') {
      puntos.autonomo += 2;
      puntos.cb += 1;
    } else if (respuestasTest.riesgo === 'medio') {
      puntos.sl += 3;
    } else {
      puntos.sl += 4;
      puntos.cooperativa += 2;
    }

    if (respuestasTest.ingresos === 'bajo') {
      puntos.autonomo += 3;
      puntos.asociacion += 1;
    } else if (respuestasTest.ingresos === 'medio') {
      puntos.autonomo += 1;
      puntos.sl += 3;
    } else {
      puntos.sl += 4;
    }

    if (respuestasTest.inversion === 'si') {
      puntos.sl += 3;
    } else if (respuestasTest.inversion === 'quizas') {
      puntos.sl += 2;
    } else {
      puntos.autonomo += 1;
    }

    if (respuestasTest.objetivo === 'social') {
      puntos.asociacion += 5;
      puntos.cooperativa += 2;
    } else if (respuestasTest.objetivo === 'cooperativo') {
      puntos.cooperativa += 5;
    } else {
      puntos.autonomo += 1;
      puntos.sl += 1;
    }

    // ⚠️ 07/10/2026 (hallazgo 3042): sumaba puntos sin filtrar, y con «2 personas» ponía en el
    // podio, incluso primera, una asociación o una cooperativa que exigen 3 (LO 1/2002 art. 5.1;
    // Ley 27/1999 art. 8), y la asociación a quien quiere repartir beneficios. Ahora lo
    // imposible se descarta, con su motivo, y un empate se dice en vez de resolverlo el array.
    const personas = respuestasTest.socios === '1' ? 1 : respuestasTest.socios === '2' ? 2 : 3;
    const descartadas: { forma: CaracteristicaForma; motivo: string }[] = [];
    const compatibles = FORMAS_JURIDICAS.filter((f) => {
      if (personas < f.socios.min) {
        descartadas.push({ forma: f, motivo: `exige al menos ${f.socios.min} personas` });
        return false;
      }
      if (f.socios.max !== null && personas > f.socios.max) {
        descartadas.push({ forma: f, motivo: `es para ${f.socios.max === 1 ? 'una sola persona' : `un máximo de ${f.socios.max}`}` });
        return false;
      }
      if (f.id === 'asociacion' && respuestasTest.objetivo === 'lucro') {
        descartadas.push({ forma: f, motivo: 'no puede repartir beneficios entre sus miembros' });
        return false;
      }
      return true;
    });

    // Orden estable por puntuación; a igualdad, el array decide el orden pero se avisa
    const ranking = compatibles
      .map((forma) => ({ forma, puntos: puntos[forma.id] }))
      .sort((a, b) => b.puntos - a.puntos);

    return { ranking, descartadas };
  }, [respuestasTest]);

  // Reiniciar test
  const reiniciarTest = () => {
    setRespuestasTest({});
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>Comparador de Formas Jurídicas</h1>
        <p className={styles.subtitle}>
          Descubre qué estructura legal se adapta mejor a tu proyecto: autónomo, sociedad, cooperativa o asociación
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical" />
      <DataReference
        normativa="IRPF e Impuesto sobre Sociedades 2026"
        fuente={FISCAL_SOCIEDADES_META.fuente}
        verificado={FISCAL_SOCIEDADES_META.verificado}
        urlOficial={FISCAL_SOCIEDADES_META.urlOficial}
      />

      {/* Navegación de vistas */}
      <div className={styles.vistas}>
        <button
          type="button"
          className={`${styles.vistaBtn} ${vistaActiva === 'comparador' ? styles.vistaActiva : ''}`}
          onClick={() => setVistaActiva('comparador')}
          aria-pressed={vistaActiva === 'comparador'}
        >
          <span aria-hidden="true">📊</span> Comparador
        </button>
        <button
          type="button"
          className={`${styles.vistaBtn} ${vistaActiva === 'test' ? styles.vistaActiva : ''}`}
          onClick={() => setVistaActiva('test')}
          aria-pressed={vistaActiva === 'test'}
        >
          <span aria-hidden="true">🎯</span> Test Rápido
        </button>
        <button
          type="button"
          className={`${styles.vistaBtn} ${vistaActiva === 'detalle' ? styles.vistaActiva : ''}`}
          onClick={() => {
            if (!formaDetalle) setFormaDetalle('autonomo');
            setVistaActiva('detalle');
          }}
          aria-pressed={vistaActiva === 'detalle'}
        >
          <span aria-hidden="true">📋</span> Ficha Detallada
        </button>
      </div>

      {/* VISTA: COMPARADOR */}
      {vistaActiva === 'comparador' && (
        <div className={styles.comparadorContainer}>
          {/* Selector de formas */}
          <div className={styles.selectorFormas}>
            <h3>Selecciona las formas a comparar (máx. 4)</h3>
            <div className={styles.formasGrid}>
              {FORMAS_JURIDICAS.map(forma => (
                <button
                  key={forma.id}
                  type="button"
                  className={`${styles.formaBtn} ${formasSeleccionadas.includes(forma.id) ? styles.formaSeleccionada : ''}`}
                  onClick={() => toggleForma(forma.id)}
                  style={{ '--forma-color': forma.color } as React.CSSProperties}
                  aria-pressed={formasSeleccionadas.includes(forma.id)}
                >
                  <span className={styles.formaIcon} aria-hidden="true">{forma.icon}</span>
                  <span className={styles.formaNombre}>{forma.nombreCorto}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tabla comparativa */}
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th className={styles.criterioHeader}>Criterio</th>
                  {formasConDatos.map(forma => (
                    <th
                      key={forma.id}
                      className={styles.formaHeader}
                      style={{ borderTopColor: forma.color }}
                    >
                      <span className={styles.headerIcon} aria-hidden="true">{forma.icon}</span>
                      <span>{forma.nombreCorto}</span>
                      <button
                        type="button"
                        className={styles.btnDetalle}
                        onClick={() => verDetalle(forma.id)}
                        title={`Ver ficha completa de ${forma.nombreCorto}`}
                        aria-label={`Ver ficha completa de ${forma.nombreCorto}`}
                      >
                        📋
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRITERIOS.map(criterio => (
                  <tr key={criterio.id}>
                    <td className={styles.criterioCell}>
                      <span className={styles.criterioIcon} aria-hidden="true">{criterio.icon}</span>
                      {criterio.label}
                    </td>
                    {formasConDatos.map(forma => (
                      <td key={forma.id} className={styles.valorCell}>
                        {getValorCriterio(forma, criterio.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen rápido */}
          <div className={styles.resumenRapido}>
            <h3>Resumen rápido</h3>
            <div className={styles.resumenGrid}>
              {formasConDatos.map(forma => (
                <div
                  key={forma.id}
                  className={styles.resumenCard}
                  style={{ borderLeftColor: forma.color }}
                >
                  <div className={styles.resumenHeader}>
                    <span aria-hidden="true">{forma.icon}</span>
                    <strong>{forma.nombreCorto}</strong>
                  </div>
                  <p className={styles.resumenDesc}>{forma.descripcion}</p>
                  <div className={styles.idealPara}>
                    <strong>Ideal para:</strong>
                    <ul>
                      {forma.idealPara.slice(0, 2).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VISTA: TEST RÁPIDO */}
      {vistaActiva === 'test' && (
        <div className={styles.testContainer}>
          <h2 className={styles.testTitulo}><span aria-hidden="true">🎯</span> ¿Qué forma jurídica me conviene?</h2>
          <p className={styles.testIntro}>
            Responde estas 5 preguntas rápidas para obtener una recomendación personalizada
          </p>

          {recomendacionTest === null ? (
            <div className={styles.preguntasGrid}>
              {preguntasTest.map((pregunta, index) => (
                <div key={pregunta.id} className={styles.preguntaCard}>
                  <div className={styles.preguntaNumero}>{index + 1}</div>
                  <h4>{pregunta.pregunta}</h4>
                  <div className={styles.opcionesGrid}>
                    {pregunta.opciones.map(opcion => (
                      <button
                        key={opcion.valor}
                        type="button"
                        className={`${styles.opcionBtn} ${respuestasTest[pregunta.id] === opcion.valor ? styles.opcionSeleccionada : ''}`}
                        onClick={() => setRespuestasTest(prev => ({ ...prev, [pregunta.id]: opcion.valor }))}
                        aria-pressed={respuestasTest[pregunta.id] === opcion.valor}
                      >
                        {opcion.texto}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.resultadoTest}>
              <h3><span aria-hidden="true">📊</span> Tu recomendación</h3>
              <div className={styles.rankingGrid}>
                {recomendacionTest.ranking.slice(0, 3).map(({ forma, puntos }, index, podio) => (
                  <div
                    key={forma.id}
                    className={`${styles.rankingCard} ${index === 0 ? styles.rankingPrimero : ''}`}
                    style={{ borderColor: forma.color }}
                  >
                    <div className={styles.rankingPosicion} aria-hidden="true">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className={styles.rankingInfo}>
                      <span className={styles.rankingIcon} aria-hidden="true">{forma.icon}</span>
                      <strong>{forma.nombre}</strong>
                      <p>{forma.descripcion}</p>
                      {podio.some((o, j) => j !== index && o.puntos === puntos) && (
                        <p className={styles.empate}>
                          Empata a {puntos} puntos con{' '}
                          {podio.filter((o, j) => j !== index && o.puntos === puntos).map((o) => o.forma.nombreCorto).join(' y ')}
                          : el orden entre ellas no lo decide el test.
                        </p>
                      )}
                      <button
                        type="button"
                        className={styles.btnVerDetalle}
                        onClick={() => verDetalle(forma.id)}
                      >
                        Ver ficha completa<span aria-hidden="true"> →</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {recomendacionTest.descartadas.length > 0 && (
                <p className={styles.descartadas}>
                  <strong>Descartadas por tus respuestas:</strong>{' '}
                  {recomendacionTest.descartadas.map((d) => `${d.forma.nombreCorto} (${d.motivo})`).join(' · ')}.
                </p>
              )}
              <button type="button" className={styles.btnReiniciar} onClick={reiniciarTest}>
                <span aria-hidden="true">🔄</span> Repetir test
              </button>
            </div>
          )}
        </div>
      )}

      {/* VISTA: DETALLE */}
      {vistaActiva === 'detalle' && formaDetalle && (
        <div className={styles.detalleContainer}>
          {/* Selector de forma */}
          <div className={styles.selectorDetalle}>
            {FORMAS_JURIDICAS.map(forma => (
              <button
                key={forma.id}
                type="button"
                className={`${styles.detalleBtn} ${formaDetalle === forma.id ? styles.detalleActivo : ''}`}
                onClick={() => setFormaDetalle(forma.id)}
                style={{ '--forma-color': forma.color } as React.CSSProperties}
                aria-pressed={formaDetalle === forma.id}
              >
                <span aria-hidden="true">{forma.icon}</span> {forma.nombreCorto}
              </button>
            ))}
          </div>

          {/* Ficha de la forma seleccionada */}
          {(() => {
            const forma = FORMAS_JURIDICAS.find(f => f.id === formaDetalle)!;
            return (
              <div className={styles.fichaDetalle}>
                <header className={styles.fichaHeader} style={{ backgroundColor: forma.color }}>
                  <span className={styles.fichaIcon} aria-hidden="true">{forma.icon}</span>
                  <div>
                    <h2>{forma.nombre}</h2>
                    <p>{forma.descripcion}</p>
                  </div>
                </header>

                <div className={styles.fichaGrid}>
                  {/* Datos básicos */}
                  <div className={styles.fichaSeccion}>
                    <h3><span aria-hidden="true">📋</span> Datos básicos</h3>
                    <dl className={styles.datosList}>
                      <dt>Capital mínimo</dt>
                      <dd>{forma.capitalTexto ?? (forma.capitalMinimo === null ? 'No requiere' : formatCurrency(forma.capitalMinimo))}</dd>
                      <dt>Número de socios</dt>
                      <dd>{forma.socios.max === null ? `Mínimo ${forma.socios.min}` : `${forma.socios.min}-${forma.socios.max}`}</dd>
                      <dt>Responsabilidad</dt>
                      <dd className={forma.responsabilidad === 'limitada' ? styles.limitada : styles.ilimitada}>
                        {forma.responsabilidadTexto}
                      </dd>
                      <dt>Fiscalidad</dt>
                      <dd>{forma.fiscalidad}</dd>
                      <dt>Tipo de gravamen</dt>
                      <dd>{forma.tipoGravamen}</dd>
                    </dl>
                  </div>

                  {/* Costes y tiempos */}
                  <div className={styles.fichaSeccion}>
                    <h3><span aria-hidden="true">💰</span> Costes y tiempos</h3>
                    <dl className={styles.datosList}>
                      <dt>Costes constitución</dt>
                      <dd>{formatCurrency(forma.costesConstitucion.min)} - {formatCurrency(forma.costesConstitucion.max)}</dd>
                      <dt>Tiempo de alta</dt>
                      <dd>{forma.tiempoConstitucion}</dd>
                      <dt>Cotización SS</dt>
                      <dd>{forma.cotizacionSS}</dd>
                      <dt>Contabilidad</dt>
                      <dd>{forma.contabilidad}</dd>
                    </dl>
                  </div>

                  {/* Trámites */}
                  <div className={styles.fichaSeccion}>
                    <h3><span aria-hidden="true">📝</span> Trámites de alta</h3>
                    <ol className={styles.tramitesList}>
                      {forma.tramitesAlta.map((tramite, i) => (
                        <li key={i}>{tramite}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Ventajas */}
                  <div className={styles.fichaSeccion}>
                    <h3><span aria-hidden="true">✅</span> Ventajas</h3>
                    <ul className={styles.ventajasList}>
                      {forma.ventajas.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Desventajas */}
                  <div className={styles.fichaSeccion}>
                    <h3><span aria-hidden="true">❌</span> Desventajas</h3>
                    <ul className={styles.desventajasList}>
                      {forma.desventajas.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Ideal para */}
                  <div className={styles.fichaSeccion}>
                    <h3><span aria-hidden="true">🎯</span> Ideal para</h3>
                    <ul className={styles.idealList}>
                      {forma.idealPara.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3><span aria-hidden="true">⚠️</span> Aviso Importante</h3>
        <p>
          Esta información es orientativa y educativa. Las condiciones pueden variar según la comunidad autónoma
          y la legislación vigente. Para tomar decisiones sobre tu forma jurídica, consulta con un asesor fiscal
          o un profesional especializado en constitución de empresas.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres profundizar en las formas jurídicas?"
        subtitle="Guía completa sobre cómo elegir la mejor estructura para tu negocio"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Guía para Elegir tu Forma Jurídica</h2>

          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">🤔</span> ¿Cuándo ser Autónomo?</h4>
              <p>
                El trabajo por cuenta propia es ideal cuando:
              </p>
              <ul>
                <li>Empiezas solo y con poco capital</li>
                <li>Tu actividad tiene bajo riesgo patrimonial</li>
                <li>Tus beneficios todavía son modestos</li>
                <li>Quieres probar una idea de negocio</li>
                <li>Priorizas la simplicidad administrativa</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">🏢</span> ¿Cuándo crear una SL?</h4>
              <p>
                La Sociedad Limitada es recomendable cuando:
              </p>
              <ul>
                <li>Necesitas proteger tu patrimonio personal</li>
                <li>Vas a tener empleados</li>
                <li>Tus beneficios son altos y estables</li>
                <li>Buscas inversores o socios</li>
                <li>Tu actividad implica riesgos (stock, local, maquinaria)</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">📊</span> Autónomo vs SL: Fiscalidad</h4>
              <p>
                La diferencia clave está en cómo tributan los beneficios:
              </p>
              <ul>
                <li><strong>Autónomo</strong>: IRPF progresivo ({IRPF_RANGO})</li>
                <li><strong>SL</strong>: Impuesto sobre Sociedades ({IS_SL_RESUMEN})</li>
                <li>Con beneficios altos, la SL puede ser más ventajosa</li>
                <li>No hay un punto de equilibrio universal: depende del sueldo del administrador, los dividendos y los costes fijos</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">🤝</span> Alternativas: Cooperativa y Asociación</h4>
              <ul>
                <li><strong>Cooperativa</strong>: Ideal para grupos que quieren gestión democrática. Mínimo 3 socios. Tipo reducido del IS ({IS_COOPERATIVAS}) si es fiscalmente protegida</li>
                <li><strong>Asociación</strong>: Para fines no lucrativos (cultural, social, deportivo). No puede repartir beneficios</li>
                <li><strong>Comunidad de Bienes</strong>: Simple pero con responsabilidad ilimitada. Para pequeños negocios entre 2+ personas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Tabla Comparativa: Las 5 Formas Jurídicas</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th><span aria-hidden="true">💼</span> Autónomo</th>
                  <th><span aria-hidden="true">🏢</span> SL / SLU</th>
                  <th><span aria-hidden="true">🤝</span> Cooperativa</th>
                  <th><span aria-hidden="true">👥</span> CB</th>
                  <th><span aria-hidden="true">🎗️</span> Asociación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Capital mínimo</strong></td>
                  <td>Sin mínimo</td>
                  <td>1 € (recomendado 3.000 €)</td>
                  <td>Lo fijan los estatutos</td>
                  <td>Sin mínimo</td>
                  <td>Sin mínimo</td>
                </tr>
                <tr>
                  <td><strong>Responsabilidad</strong></td>
                  <td>Ilimitada (patrimonio personal)</td>
                  <td>Limitada al capital social</td>
                  <td>Limitada a las aportaciones</td>
                  <td>Ilimitada y solidaria</td>
                  <td>Limitada al patrimonio asociativo</td>
                </tr>
                <tr>
                  <td><strong>Tipo impositivo</strong></td>
                  <td>IRPF {IRPF_RANGO}</td>
                  <td>IS {IS_GENERAL}; {IS_MICRO_TRAMO1}/{IS_MICRO_TRAMO2} pequeñas; {IS_NUEVA_CREACION} nuevas</td>
                  <td>IS {IS_COOPERATIVAS} (protegida)</td>
                  <td>IRPF {IRPF_RANGO} (cada comunero)</td>
                  <td>IS {IS_GENERAL}, con exenciones</td>
                </tr>
                <tr>
                  <td><strong>Socios mínimos</strong></td>
                  <td>1</td>
                  <td>1</td>
                  <td>3</td>
                  <td>2</td>
                  <td>3</td>
                </tr>
                <tr>
                  <td><strong>Coste anual de gestión (orientativo; pide presupuesto)</strong></td>
                  <td>Bajo</td>
                  <td>Medio-alto</td>
                  <td>Medio-alto</td>
                  <td>Bajo</td>
                  <td>Bajo-medio</td>
                </tr>
                <tr>
                  <td><strong>Complejidad</strong></td>
                  <td>Baja</td>
                  <td>Media-alta</td>
                  <td>Alta</td>
                  <td>Baja</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td><strong>Ideal para</strong></td>
                  <td>Freelancers, profesionales liberales</td>
                  <td>Empresas con riesgo patrimonial o inversores</td>
                  <td>Grupos igualitarios, economía social</td>
                  <td>Pequeños negocios entre 2 personas</td>
                  <td>Proyectos sin ánimo de lucro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso: 4 Perfiles Reales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍🎨</span>
                <h4>Diseñadora independiente · 25.000 €/año</h4>
              </div>
              <p className={styles.escenarioExample}>
                Con {formatCurrency(DISENADORA_BASE)} de base liquidable y solo el mínimo personal, la cuota íntegra de IRPF como
                autónoma rondaría <strong>{formatCurrency(DISENADORA_CUOTA)}</strong> (tipo marginal del {DISENADORA_MARGINAL}{NB}%).
                Constituir una SL añadiría costes fijos anuales de gestoría, cuentas anuales y Registro Mercantil que, a este nivel
                de beneficio, pueden anular el ahorro fiscal.
              </p>
              <p className={styles.escenarioTip}>Recomendación: autónomo. Sencillo, barato y fiscalmente eficiente a este nivel de ingresos.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h4>Dos socios que montan una agencia digital</h4>
              </div>
              <p className={styles.escenarioExample}>
                Dos socios implican responsabilidad compartida. Una <strong>SL</strong> protege el patrimonio personal de cada uno,
                permite definir participaciones y porcentajes de voto de forma clara en los estatutos, y facilita la entrada de un
                tercer inversor en el futuro.
              </p>
              <p className={styles.escenarioTip}>Recomendación: SL con reparto 50/50 de participaciones y pacto de socios complementario.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧵</span>
                <h4>5 artesanos que quieren vender juntos</h4>
              </div>
              <p className={styles.escenarioExample}>
                Con 5 promotores, la <strong>cooperativa de trabajo asociado</strong>, especialmente protegida, tributa al {IS_COOPERATIVAS} por
                sus resultados cooperativos con una bonificación del 50{NB}% de la cuota, gestión
                democrática (1 socio = 1 voto) y acceso preferente a subvenciones de economía social de la CCAA y el
                Ministerio de Trabajo.
              </p>
              <p className={styles.escenarioTip}>Recomendación: cooperativa fiscalmente protegida; revisar normativa autonómica específica.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎭</span>
                <h4>ONG de barrio para actividades culturales</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una <strong>asociación sin ánimo de lucro</strong> permite recibir subvenciones públicas, donaciones
                con deducción para el donante (Ley 49/2002), contratar voluntarios y organizar actividades con exenciones
                fiscales, siempre que los beneficios se reinviertan en los fines estatutarios.
              </p>
              <p className={styles.escenarioTip}>Recomendación: asociación; solicitar la declaración de utilidad pública para maximizar beneficios fiscales.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes (FAQ)</h2>
          <div className={styles.faqList}>
            {/* Del MISMO array que el FAQPage de metadata.ts (hallazgo 3051) */}
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <h4>{f.question}</h4>
                <p>{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Elige la Forma Jurídica Correcta</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Define el número de socios y el reparto de control</h4>
                <p>
                  ¿Emprendes solo o con otros? Si vas solo, la elección se reduce a autónomo vs SLU. Con más personas,
                  es fundamental decidir quién toma decisiones, en qué porcentaje participa cada socio y cómo se
                  resuelven los conflictos antes de constituir nada. Un pacto de socios firmado antes de la escritura
                  ayuda a prevenir muchos de esos conflictos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Estima tus beneficios anuales netos esperados</h4>
                <p>
                  No hay un umbral universal para pasar de autónomo a SL: lo que cuenta es el <strong>beneficio</strong>, no la
                  facturación. Como referencia, el IRPF marginal es del {marginalIRPF(60_000)}{NB}% hasta 60.000 € de base y del{' '}
                  {marginalIRPF(60_001)}{NB}% hasta {tramoIRPF(marginalIRPF(60_001)).hasta.toLocaleString('es-ES')} €; una SL de nueva creación
                  tributa al {IS_NUEVA_CREACION} y una pequeña al {IS_MICRO_TRAMO1}/{IS_MICRO_TRAMO2}. Pero la comparación justa incluye el sueldo del
                  administrador (que tributa en IRPF), los dividendos y los costes fijos de la SL.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Evalúa el riesgo patrimonial de tu actividad</h4>
                <p>
                  ¿Tu actividad puede generar deudas superiores a tu capital inicial? Si gestionas stock, tienes empleados,
                  alquilas un local o contratas proveedores con pagos aplazados, la responsabilidad ilimitada del autónomo
                  o la CB puede poner en riesgo tu casa, coche o ahorros. En ese caso, la SL o la cooperativa protegen tu
                  patrimonio personal independientemente del nivel de ingresos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Calcula los costes fijos anuales de cada opción</h4>
                <p>
                  El coste real de mantenimiento anual varía mucho: el de una SL o una cooperativa es claramente mayor que el
                  de autónomo o CB, y conviene pedir presupuesto. Incluye gestoría mensual, presentación de cuentas anuales, legalización
                  de libros, seguros de responsabilidad civil y posibles minutas notariales. Asegúrate de que el ahorro fiscal
                  cubre holgadamente estos costes antes de elegir la forma más compleja.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Consulta con un asesor fiscal/mercantil los 2-3 mejores escenarios</h4>
                <p>
                  Este comparador es orientativo. Antes de decidir, pide a un asesor que calcule tu carga fiscal real en
                  los 2-3 escenarios que más te convencen, considerando tu CCAA (hay bonificaciones autonómicas en IS,
                  IRPF y cotizaciones), tu situación familiar y tus expectativas de crecimiento. Una sesión de 1-2 horas
                  con un gestor cuesta 100-200 € y puede ahorrarte miles en impuestos o errores de constitución.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Decide y formaliza</h4>
                <p>
                  Para <strong>autónomo</strong>: alta en Hacienda (modelo 036/037) y en el RETA, proceso que dura 1-3 días y
                  tiene coste prácticamente nulo. Para <strong>SL o cooperativa</strong>: certificación de denominación social,
                  estatutos, escritura ante notario, inscripción en Registro Mercantil y alta en Hacienda — proceso de 2-6
                  semanas y coste de 400-1.500 €. El portal <strong>PAE (Punto de Atención al Emprendedor)</strong> permite
                  tramitar la constitución de SL de forma telemática en menos de 48 horas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas al Elegir tu Forma Jurídica</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <div>
                <h4>No constituyas SL solo por imagen</h4>
                <p>
                  Los costes fijos anuales de una SL (gestoría, Registro Mercantil, cuentas anuales) son claramente mayores
                  que los del autónomo: pide presupuesto. Ese gasto debe quedar sobradamente cubierto por el ahorro fiscal
                  respecto al IRPF. Si no es así, el autónomo o la CB son más eficientes.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚀</span>
              <div>
                <h4>Empieza como autónomo si tienes dudas</h4>
                <p>
                  Si no tienes claro que la SL compense con tus números, empieza como autónomo. Puedes transformarlo
                  en SL mediante aportación de rama de actividad cuando superes claramente el umbral de rentabilidad.
                  No hay prisa — el salto en cualquier momento del ejercicio tiene solución fiscal.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <div>
                <h4>Verifica el tipo reducido del IS en cooperativas</h4>
                <p>
                  No todas las cooperativas tributan al {IS_COOPERATIVAS}. Solo las <strong>fiscalmente protegidas</strong> (deben cumplir
                  requisitos de la Ley 20/1990). Las <strong>especialmente protegidas</strong> (trabajo asociado, explotación
                  comunitaria de la tierra, mar y algunas de consumo) aplican además una bonificación del 50 % en la cuota.
                  Comprueba con tu gestor si tu cooperativa cumple los requisitos antes de dar por hecho el ahorro fiscal.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚠️</span>
              <div>
                <h4>Las CB funcionan mejor con acuerdo escrito</h4>
                <p>
                  La Comunidad de Bienes requiere el acuerdo unánime de todos los comuneros para decisiones importantes:
                  contratar empleados, firmar contratos, repartir beneficios. Sin un contrato escrito que regule estos
                  aspectos, el conflicto entre comuneros es la principal causa de disolución prematura. Redacta siempre
                  un acuerdo de comuneros ante notario.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <div>
                <h4>Sociedades profesionales: Ley 2/2007</h4>
                <p>
                  Si eres abogado, médico, arquitecto, economista u otro profesional colegiado y quieres ejercer en
                  sociedad, la <strong>Ley 2/2007 de Sociedades Profesionales</strong> exige inscripción específica en
                  el Registro Mercantil y en el colegio profesional. No basta con constituir una SL ordinaria — la sociedad
                  debe cumplir requisitos especiales de composición y responsabilidad.
                </p>
              </div>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <div>
                <h4>Usa el informe CIRCE antes de decidir</h4>
                <p>
                  El portal <strong>CIRCE</strong> (Centro de Información y Red de Creación de Empresas) del Ministerio
                  de Industria permite identificar todos los trámites necesarios y las ayudas disponibles por CCAA para
                  crear tu empresa. Es gratuito y puede revelarte subvenciones o bonificaciones a las que tienes derecho
                  según tu sector y comunidad autónoma.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">🚨</span>
              <h3>Errores Comunes que Debes Evitar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Constituir SL para ahorrar impuestos sin calcular los costes fijos reales.</strong> Gestoría,
                cuentas anuales y Registro Mercantil son un coste fijo cada año. Si el ahorro fiscal no lo supera, estás
                pagando más, no menos.
              </li>
              <li>
                <strong>Crear Comunidad de Bienes entre familiares sin acuerdo escrito.</strong> La confianza no sustituye
                al contrato. Sin un documento que regule el reparto de beneficios, la toma de decisiones y la salida de
                comuneros, los conflictos son casi inevitables.
              </li>
              <li>
                <strong>Montar una asociación que en realidad tiene ánimo de lucro.</strong> Si la actividad principal
                es económica y los promotores se retribuyen por ella de forma habitual, Hacienda puede recalificar la
                asociación como sociedad mercantil y exigir el IS sin exenciones más intereses de demora.
              </li>
              <li>
                <strong>Ignorar la responsabilidad personal del administrador de la SL.</strong> El administrador puede
                responder con su patrimonio personal por deudas tributarias (artículo 43 LGT), por no convocar junta
                cuando la SL está en causa de disolución, o por negligencia grave en la gestión de la sociedad.
              </li>
              <li>
                <strong>No distinguir entre Sociedad Civil y Comunidad de Bienes.</strong> Desde la reforma fiscal de
                2016, las Sociedades Civiles con objeto mercantil tributan en IS (como una SL), mientras que las CB
                siguen tributando en IRPF a través de sus comuneros. Usar una u otra tiene consecuencias fiscales muy
                distintas que muchos emprendedores desconocen.
              </li>
              <li>
                <strong>Disolver la SL sin liquidar correctamente.</strong> Cerrar sin seguir el proceso legal (disolución,
                liquidación, escritura pública y cancelación registral) genera responsabilidad del administrador por
                deudas pendientes y puede impedir la cancelación de las obligaciones fiscales y de SS ante Hacienda y
                la Tesorería.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-formas-juridicas')} />
      <ShareCard appName="comparador-formas-juridicas" />
      <Footer appName="comparador-formas-juridicas" />
    </div>
  );
}
