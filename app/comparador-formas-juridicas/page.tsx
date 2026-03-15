'use client';

import { useState, useMemo } from 'react';
import styles from './ComparadorFormasJuridicas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard } from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
type FormaJuridica = 'autonomo' | 'sl' | 'cooperativa' | 'asociacion' | 'cb';

interface CaracteristicaForma {
  id: FormaJuridica;
  nombre: string;
  nombreCorto: string;
  icon: string;
  descripcion: string;
  capitalMinimo: number | null;
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
    tipoGravamen: '19% - 47%',
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
      'Tarifa plana los primeros 12 meses (80€)',
      'Sin capital mínimo',
      'Contabilidad simplificada',
      'Total control de decisiones',
      'Deducciones por gastos de actividad',
    ],
    desventajas: [
      'Responsabilidad ilimitada (patrimonio personal)',
      'IRPF puede ser alto con beneficios altos',
      'Menos credibilidad ante grandes empresas',
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
    capitalRecomendado: '3.000€ recomendado (restricciones hasta alcanzarlo)',
    socios: { min: 1, max: null },
    responsabilidad: 'limitada',
    responsabilidadTexto: 'Limitada al capital social',
    fiscalidad: 'Impuesto de Sociedades',
    tipoImpuesto: 'IS',
    tipoGravamen: '25% (23% pymes)',
    cotizacionSS: 'Administrador en RETA obligatorio',
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
      'Tipo fijo del IS (25%)',
      'Facilidad para incorporar socios/inversores',
      'Posibilidad de vender participaciones',
      'Acceso a más financiación',
      'Con 1 socio: protege patrimonio personal (SLU)',
    ],
    desventajas: [
      'Mayor coste de constitución',
      'Contabilidad más compleja',
      'Obligaciones formales (juntas, cuentas anuales)',
      'Administrador cotiza en RETA obligatoriamente',
      'Trámites más lentos',
      'Con 1€ capital: restricciones hasta 3.000€',
    ],
    idealPara: [
      'Negocios con riesgo patrimonial',
      'Proyectos con varios socios',
      'Empresas que buscan inversores',
      'Negocios que contratan empleados',
      'Facturación alta (>40.000€/año)',
      'Emprendedores solos que quieren proteger patrimonio (SLU)',
    ],
    color: '#48A9A6',
  },
  {
    id: 'cooperativa',
    nombre: 'Cooperativa de Trabajo',
    nombreCorto: 'Cooperativa',
    icon: '🤝',
    descripcion: 'Asociación de personas con intereses comunes, democrática y sin ánimo de lucro',
    capitalMinimo: 3000,
    capitalRecomendado: '3.000€ mínimo',
    socios: { min: 3, max: null },
    responsabilidad: 'limitada',
    responsabilidadTexto: 'Limitada a las aportaciones',
    fiscalidad: 'Impuesto de Sociedades (régimen especial)',
    tipoImpuesto: 'IS Cooperativas',
    tipoGravamen: '20% (especialmente protegidas)',
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
      'Tipo reducido del IS (20%)',
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
    tipoGravamen: '25% (con exenciones)',
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
    tipoGravamen: '19% - 47% (cada comunero)',
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
        return forma.capitalMinimo === null ? 'No requiere' : formatCurrency(forma.capitalMinimo);
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
        { valor: 'bajo', texto: 'Menos de 20.000€' },
        { valor: 'medio', texto: '20.000€ - 60.000€' },
        { valor: 'alto', texto: 'Más de 60.000€' },
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

    // Ordenar por puntuación
    const ranking = Object.entries(puntos)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => FORMAS_JURIDICAS.find(f => f.id === id)!);

    return ranking;
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
        <span className={styles.heroIcon}>⚖️</span>
        <h1 className={styles.title}>Comparador de Formas Jurídicas</h1>
        <p className={styles.subtitle}>
          Descubre qué estructura legal se adapta mejor a tu proyecto: autónomo, sociedad, cooperativa o asociación
        </p>
      </header>

      {/* Navegación de vistas */}
      <div className={styles.vistas}>
        <button
          className={`${styles.vistaBtn} ${vistaActiva === 'comparador' ? styles.vistaActiva : ''}`}
          onClick={() => setVistaActiva('comparador')}
        >
          📊 Comparador
        </button>
        <button
          className={`${styles.vistaBtn} ${vistaActiva === 'test' ? styles.vistaActiva : ''}`}
          onClick={() => setVistaActiva('test')}
        >
          🎯 Test Rápido
        </button>
        <button
          className={`${styles.vistaBtn} ${vistaActiva === 'detalle' ? styles.vistaActiva : ''}`}
          onClick={() => {
            if (!formaDetalle) setFormaDetalle('autonomo');
            setVistaActiva('detalle');
          }}
        >
          📋 Ficha Detallada
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
                  className={`${styles.formaBtn} ${formasSeleccionadas.includes(forma.id) ? styles.formaSeleccionada : ''}`}
                  onClick={() => toggleForma(forma.id)}
                  style={{ '--forma-color': forma.color } as React.CSSProperties}
                >
                  <span className={styles.formaIcon}>{forma.icon}</span>
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
                      <span className={styles.headerIcon}>{forma.icon}</span>
                      <span>{forma.nombreCorto}</span>
                      <button
                        className={styles.btnDetalle}
                        onClick={() => verDetalle(forma.id)}
                        title="Ver ficha completa"
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
                      <span className={styles.criterioIcon}>{criterio.icon}</span>
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
                    <span>{forma.icon}</span>
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
          <h2 className={styles.testTitulo}>🎯 ¿Qué forma jurídica me conviene?</h2>
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
                        className={`${styles.opcionBtn} ${respuestasTest[pregunta.id] === opcion.valor ? styles.opcionSeleccionada : ''}`}
                        onClick={() => setRespuestasTest(prev => ({ ...prev, [pregunta.id]: opcion.valor }))}
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
              <h3>📊 Tu recomendación</h3>
              <div className={styles.rankingGrid}>
                {recomendacionTest.slice(0, 3).map((forma, index) => (
                  <div
                    key={forma.id}
                    className={`${styles.rankingCard} ${index === 0 ? styles.rankingPrimero : ''}`}
                    style={{ borderColor: forma.color }}
                  >
                    <div className={styles.rankingPosicion}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className={styles.rankingInfo}>
                      <span className={styles.rankingIcon}>{forma.icon}</span>
                      <strong>{forma.nombre}</strong>
                      <p>{forma.descripcion}</p>
                      <button
                        className={styles.btnVerDetalle}
                        onClick={() => verDetalle(forma.id)}
                      >
                        Ver ficha completa →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className={styles.btnReiniciar} onClick={reiniciarTest}>
                🔄 Repetir test
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
                className={`${styles.detalleBtn} ${formaDetalle === forma.id ? styles.detalleActivo : ''}`}
                onClick={() => setFormaDetalle(forma.id)}
                style={{ '--forma-color': forma.color } as React.CSSProperties}
              >
                {forma.icon} {forma.nombreCorto}
              </button>
            ))}
          </div>

          {/* Ficha de la forma seleccionada */}
          {(() => {
            const forma = FORMAS_JURIDICAS.find(f => f.id === formaDetalle)!;
            return (
              <div className={styles.fichaDetalle}>
                <header className={styles.fichaHeader} style={{ backgroundColor: forma.color }}>
                  <span className={styles.fichaIcon}>{forma.icon}</span>
                  <div>
                    <h2>{forma.nombre}</h2>
                    <p>{forma.descripcion}</p>
                  </div>
                </header>

                <div className={styles.fichaGrid}>
                  {/* Datos básicos */}
                  <div className={styles.fichaSeccion}>
                    <h3>📋 Datos básicos</h3>
                    <dl className={styles.datosList}>
                      <dt>Capital mínimo</dt>
                      <dd>{forma.capitalMinimo === null ? 'No requiere' : formatCurrency(forma.capitalMinimo)}</dd>
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
                    <h3>💰 Costes y tiempos</h3>
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
                    <h3>📝 Trámites de alta</h3>
                    <ol className={styles.tramitesList}>
                      {forma.tramitesAlta.map((tramite, i) => (
                        <li key={i}>{tramite}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Ventajas */}
                  <div className={styles.fichaSeccion}>
                    <h3>✅ Ventajas</h3>
                    <ul className={styles.ventajasList}>
                      {forma.ventajas.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Desventajas */}
                  <div className={styles.fichaSeccion}>
                    <h3>❌ Desventajas</h3>
                    <ul className={styles.desventajasList}>
                      {forma.desventajas.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Ideal para */}
                  <div className={styles.fichaSeccion}>
                    <h3>🎯 Ideal para</h3>
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
        <h3>⚠️ Aviso Importante</h3>
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
              <h4>🤔 ¿Cuándo ser Autónomo?</h4>
              <p>
                El trabajo por cuenta propia es ideal cuando:
              </p>
              <ul>
                <li>Empiezas solo y con poco capital</li>
                <li>Tu actividad tiene bajo riesgo patrimonial</li>
                <li>Facturas menos de 40.000€/año</li>
                <li>Quieres probar una idea de negocio</li>
                <li>Priorizas la simplicidad administrativa</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>🏢 ¿Cuándo crear una SL?</h4>
              <p>
                La Sociedad Limitada es recomendable cuando:
              </p>
              <ul>
                <li>Necesitas proteger tu patrimonio personal</li>
                <li>Vas a tener empleados</li>
                <li>Facturas más de 40.000-60.000€/año</li>
                <li>Buscas inversores o socios</li>
                <li>Tu actividad implica riesgos (stock, local, maquinaria)</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>📊 Autónomo vs SL: Fiscalidad</h4>
              <p>
                La diferencia clave está en cómo tributan los beneficios:
              </p>
              <ul>
                <li><strong>Autónomo</strong>: IRPF progresivo (19%-47%)</li>
                <li><strong>SL</strong>: IS fijo (25%, o 23% pymes)</li>
                <li>Con beneficios altos, la SL suele ser más ventajosa</li>
                <li>El punto de equilibrio está en torno a 40.000-60.000€</li>
              </ul>
            </div>

            <div className={styles.guideCard}>
              <h4>🤝 Alternativas: Cooperativa y Asociación</h4>
              <ul>
                <li><strong>Cooperativa</strong>: Ideal para grupos que quieren gestión democrática. Mínimo 3 socios. Tipo reducido IS (20%)</li>
                <li><strong>Asociación</strong>: Para fines no lucrativos (cultural, social, deportivo). No puede repartir beneficios</li>
                <li><strong>Comunidad de Bienes</strong>: Simple pero con responsabilidad ilimitada. Para pequeños negocios entre 2+ personas</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-formas-juridicas')} />
      <ShareCard appName="comparador-formas-juridicas" />
      <Footer appName="comparador-formas-juridicas" />
    </div>
  );
}
