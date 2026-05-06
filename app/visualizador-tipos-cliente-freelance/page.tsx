'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorTiposClienteFreelance.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard, RegionBadge
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type TipoClienteId = 'puntual' | 'recurrente' | 'agencia' | 'subcontratacion' | 'marketplace' | 'falso-autonomo';

interface TipoCliente {
  id: TipoClienteId;
  nombre: string;
  icono: string;
  descripcion: string;
  facturacion: string;
  ventajas: string[];
  riesgos: string[];
  alertas: string[];
  estabilidad: number; // 0-5, 0 = ilegal
  ejemplo: string;
  esIlegal?: boolean;
  consecuenciasLegales?: string;
}

const TIPOS_CLIENTE: TipoCliente[] = [
  {
    id: 'puntual',
    nombre: 'Cliente Puntual',
    icono: '🎯',
    descripcion: 'Proyecto único, sin continuidad. Diseño de web, traducción, evento.',
    facturacion: 'Por proyecto o por horas',
    ventajas: [
      'Diversificación de cartera',
      'Variedad de proyectos y sectores',
      'Libertad total para aceptar o rechazar',
    ],
    riesgos: [
      'Inestabilidad de ingresos',
      'Coste de captación alto',
      'Difícil fidelizar sin relación previa',
    ],
    alertas: [
      'Pide "prueba gratis" antes de contratar',
      'No quiere firmar contrato ni presupuesto',
      'Promete "mucho trabajo futuro" a cambio de descuento',
    ],
    estabilidad: 1,
    ejemplo: 'Una startup te contrata para diseñar su landing page por 2.000 €',
  },
  {
    id: 'recurrente',
    nombre: 'Cliente Recurrente',
    icono: '🔄',
    descripcion: 'Relación continuada, proyectos repetitivos. Mantenimiento web, community management.',
    facturacion: 'Retainer mensual o por proyecto recurrente',
    ventajas: [
      'Ingresos predecibles y estables',
      'Menos tiempo dedicado a captación',
      'Relación de confianza mutua',
    ],
    riesgos: [
      'Dependencia de un solo cliente',
      'Precios que no se actualizan con la inflación',
      'Scope creep (tareas extra sin cobrar)',
    ],
    alertas: [
      '"Bájame el precio porque te doy trabajo fijo"',
      'Añade tareas fuera del acuerdo sin renegociar',
      'Amenaza con irse si subes tarifas',
    ],
    estabilidad: 4,
    ejemplo: 'Una pyme te paga 500 €/mes por gestionar sus redes sociales',
  },
  {
    id: 'agencia',
    nombre: 'Agencia Intermediaria',
    icono: '🏢',
    descripcion: 'Trabajas para una agencia que tiene el cliente final. Diseño, desarrollo, marketing.',
    facturacion: 'Por hora o por proyecto (tarifa de agencia, no de mercado)',
    ventajas: [
      'Flujo constante de proyectos',
      'No necesitas buscar clientes directos',
      'Aprendizaje y experiencia con proyectos grandes',
    ],
    riesgos: [
      'Margen reducido: la agencia cobra 2-3x tu tarifa',
      'Sin relación directa con el cliente final',
      'Posible invisibilización de tu trabajo',
    ],
    alertas: [
      'Te piden exclusividad sin contrapartida',
      'Te imponen horarios fijos como si fueras empleado',
      'Retrasan pagos hasta que cobra su cliente final',
    ],
    estabilidad: 3,
    ejemplo: 'Una agencia de marketing te subcontrata para hacer diseños a 25 €/h (ella cobra 65 €/h al cliente)',
  },
  {
    id: 'subcontratacion',
    nombre: 'Subcontratación',
    icono: '🔗',
    descripcion: 'Otro freelance te subcontrata parte de su proyecto. Especialización.',
    facturacion: 'Por entregable o por horas',
    ventajas: [
      'Sin gestión de cliente, trabajo técnico puro',
      'Networking profesional entre freelances',
      'Oportunidad de especializarse en nichos',
    ],
    riesgos: [
      'Sin control del proyecto global',
      'Dependencia del freelance principal',
      'Pagos intermediados y posibles retrasos',
    ],
    alertas: [
      'El freelance principal no paga hasta cobrar él',
      'No te deja firmar NDA ni ver el contrato principal',
      'Te pide cambios constantes sin ajustar presupuesto',
    ],
    estabilidad: 2,
    ejemplo: 'Un diseñador web te subcontrata la maquetación de 3 páginas por 600 €',
  },
  {
    id: 'marketplace',
    nombre: 'Marketplace / Plataforma',
    icono: '🌐',
    descripcion: 'Fiverr, Upwork, Freelancer.com, Malt. La plataforma conecta y cobra comisión.',
    facturacion: 'Por proyecto con comisión de plataforma (5-20%)',
    ventajas: [
      'Acceso a clientes globales sin prospección',
      'Sistema de disputas y protección de pagos',
      'Reputación acumulativa con reseñas',
    ],
    riesgos: [
      'Competencia feroz y "race to bottom" en precios',
      'Comisiones altas (hasta 20%)',
      'Sin relación directa con el cliente',
    ],
    alertas: [
      'Te piden trabajar fuera de la plataforma "para ahorrar comisión"',
      'Ofrecen pago en cripto o por transferencia directa',
      'Proyecto con especificaciones vagas y presupuesto cerrado',
    ],
    estabilidad: 2,
    ejemplo: 'Un cliente de Upwork te contrata para traducir documentos a 0,08 €/palabra (la plataforma se queda el 10%)',
  },
  {
    id: 'falso-autonomo',
    nombre: 'Empleo Encubierto / Falso Autónomo',
    icono: '🚨',
    descripcion: 'Relación que simula autonomía pero es empleo. Horario fijo, exclusividad, dependencia económica.',
    facturacion: 'Factura mensual fija (simula nómina)',
    ventajas: [],
    riesgos: [
      'Situación ilegal que perjudica al trabajador',
      'Sin derechos laborales: ni vacaciones, ni despido, ni antigüedad',
      'El "cliente" ahorra la Seguridad Social a tu costa',
    ],
    alertas: [
      'Horario y lugar de trabajo impuestos',
      'Más del 75% de tus ingresos vienen de un solo cliente',
      'Herramientas de trabajo proporcionadas por el "cliente"',
      'No decides cómo hacer el trabajo, solo qué hacer',
      'No puedes rechazar encargos ni tener otros clientes',
    ],
    estabilidad: 0,
    esIlegal: true,
    consecuenciasLegales: 'La Inspección de Trabajo puede declarar la relación laboral. El "cliente" paga SS retroactiva + multa de 3.126 a 10.000 €. El trabajador adquiere derechos laborales (despido, vacaciones, antigüedad).',
    ejemplo: 'Vas a la oficina todos los días de 9 a 18h, usas su ordenador, no tienes otros clientes y cobras 2.000 €/mes facturando',
  },
];

// Datos para la tabla comparativa
interface ComparativaItem {
  tipo: string;
  estabilidad: string;
  independencia: string;
  riesgoLegal: string;
  ingresoTipico: string;
}

const COMPARATIVA: ComparativaItem[] = [
  { tipo: 'Puntual', estabilidad: '⭐', independencia: 'Máxima', riesgoLegal: 'Bajo', ingresoTipico: 'Variable' },
  { tipo: 'Recurrente', estabilidad: '⭐⭐⭐⭐', independencia: 'Alta', riesgoLegal: 'Bajo', ingresoTipico: 'Estable' },
  { tipo: 'Agencia', estabilidad: '⭐⭐⭐', independencia: 'Media', riesgoLegal: 'Medio', ingresoTipico: 'Moderado' },
  { tipo: 'Subcontratación', estabilidad: '⭐⭐', independencia: 'Media-Alta', riesgoLegal: 'Bajo', ingresoTipico: 'Variable' },
  { tipo: 'Marketplace', estabilidad: '⭐⭐', independencia: 'Alta', riesgoLegal: 'Bajo', ingresoTipico: 'Variable-Bajo' },
  { tipo: 'Falso Autónomo', estabilidad: '❌', independencia: 'Nula', riesgoLegal: 'Muy alto', ingresoTipico: 'Fijo (ilegal)' },
];

// Espectro de independencia
const ESPECTRO = [
  { id: 'puntual' as TipoClienteId, label: 'Puntual', pct: 95 },
  { id: 'marketplace' as TipoClienteId, label: 'Marketplace', pct: 75 },
  { id: 'subcontratacion' as TipoClienteId, label: 'Subcontrat.', pct: 60 },
  { id: 'recurrente' as TipoClienteId, label: 'Recurrente', pct: 50 },
  { id: 'agencia' as TipoClienteId, label: 'Agencia', pct: 30 },
  { id: 'falso-autonomo' as TipoClienteId, label: 'Falso Aut.', pct: 0 },
];

// ─────────────────────────────────────────────
// Componente de estrellas
// ─────────────────────────────────────────────

function Estrellas({ nivel, esIlegal }: { nivel: number; esIlegal?: boolean }) {
  if (esIlegal) {
    return <span className={styles.estrellaIlegal} aria-label="Ilegal">❌ ILEGAL</span>;
  }
  const estrellas = [];
  for (let i = 1; i <= 5; i++) {
    estrellas.push(
      <span key={i} className={i <= nivel ? styles.estrellaActiva : styles.estrellaInactiva} aria-hidden="true">
        ★
      </span>
    );
  }
  return (
    <span className={styles.estrellas} aria-label={`Estabilidad: ${nivel} de 5`}>
      {estrellas}
    </span>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorTiposClienteFreelance() {
  const [activo, setActivo] = useState<TipoClienteId | null>(null);
  const [vistaComparativa, setVistaComparativa] = useState(false);

  const toggleTipo = (id: TipoClienteId) => {
    setActivo(prev => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>
          <span aria-hidden="true">🤝</span> Tipos de Cliente Freelance
        </h1>
        <p>Conoce las 6 relaciones comerciales y sus implicaciones en España</p>
      </header>

      <RegionBadge variant="es-data" />


      <LegalNotice />

      {/* Controles de vista */}
      <div className={styles.vistaControles}>
        <button
          className={`${styles.vistaBtn} ${!vistaComparativa ? styles.vistaBtnActivo : ''}`}
          onClick={() => setVistaComparativa(false)}
        >
          <span aria-hidden="true">📋</span> Tarjetas
        </button>
        <button
          className={`${styles.vistaBtn} ${vistaComparativa ? styles.vistaBtnActivo : ''}`}
          onClick={() => setVistaComparativa(true)}
        >
          <span aria-hidden="true">📊</span> Comparativa
        </button>
      </div>

      {!vistaComparativa ? (
        <>
          {/* Tarjetas de tipos de cliente */}
          <section className={styles.tarjetasGrid} aria-label="Tipos de cliente freelance">
            {TIPOS_CLIENTE.map(tipo => {
              const expandido = activo === tipo.id;
              return (
                <article
                  key={tipo.id}
                  className={`${styles.tarjeta} ${tipo.esIlegal ? styles.tarjetaIlegal : ''} ${expandido ? styles.tarjetaExpandida : ''}`}
                >
                  <button
                    className={styles.tarjetaHeader}
                    onClick={() => toggleTipo(tipo.id)}
                    aria-expanded={expandido}
                    aria-controls={`detalle-${tipo.id}`}
                  >
                    <div className={styles.tarjetaIcono}>
                      <span aria-hidden="true">{tipo.icono}</span>
                    </div>
                    <div className={styles.tarjetaInfo}>
                      <h2 className={styles.tarjetaNombre}>{tipo.nombre}</h2>
                      <div className={styles.tarjetaEstabilidad}>
                        <span className={styles.etiquetaEstabilidad}>Estabilidad:</span>
                        <Estrellas nivel={tipo.estabilidad} esIlegal={tipo.esIlegal} />
                      </div>
                    </div>
                    <span className={`${styles.flecha} ${expandido ? styles.flechaAbierta : ''}`} aria-hidden="true">
                      ▼
                    </span>
                  </button>

                  {expandido && (
                    <div id={`detalle-${tipo.id}`} className={styles.tarjetaDetalle}>
                      <p className={styles.descripcion}>{tipo.descripcion}</p>

                      <div className={styles.facturacion}>
                        <span aria-hidden="true">💶</span>
                        <strong>Facturación:</strong> {tipo.facturacion}
                      </div>

                      {tipo.ventajas.length > 0 && (
                        <div className={styles.bloqueInfo}>
                          <h3 className={styles.bloqueInfoTitulo}>
                            <span aria-hidden="true">✅</span> Ventajas
                          </h3>
                          <ul className={styles.lista}>
                            {tipo.ventajas.map((v, i) => (
                              <li key={i}>{v}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className={styles.bloqueInfo}>
                        <h3 className={styles.bloqueInfoTitulo}>
                          <span aria-hidden="true">⚠️</span> Riesgos
                        </h3>
                        <ul className={styles.lista}>
                          {tipo.riesgos.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={`${styles.bloqueInfo} ${tipo.esIlegal ? styles.bloqueAlertaCritica : styles.bloqueAlerta}`}>
                        <h3 className={styles.bloqueInfoTitulo}>
                          <span aria-hidden="true">{tipo.esIlegal ? '🚨' : '🔍'}</span>
                          {tipo.esIlegal ? ' Señales de ALERTA CRÍTICAS' : ' Señales de alerta'}
                        </h3>
                        <ul className={styles.listaAlerta}>
                          {tipo.alertas.map((a, i) => (
                            <li key={i}>
                              <span aria-hidden="true">{tipo.esIlegal ? '❌' : '⚡'}</span> {a}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {tipo.consecuenciasLegales && (
                        <div className={styles.consecuenciasLegales} role="alert">
                          <h3 className={styles.bloqueInfoTitulo}>
                            <span aria-hidden="true">⚖️</span> Consecuencias legales
                          </h3>
                          <p>{tipo.consecuenciasLegales}</p>
                        </div>
                      )}

                      <div className={styles.ejemplo}>
                        <h3 className={styles.bloqueInfoTitulo}>
                          <span aria-hidden="true">💡</span> Ejemplo
                        </h3>
                        <p className={styles.ejemploTexto}>&ldquo;{tipo.ejemplo}&rdquo;</p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          {/* Espectro de independencia */}
          <section className={styles.espectroSection} aria-label="Espectro de independencia">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">📏</span> Espectro de Independencia
            </h2>
            <p className={styles.seccionSubtitulo}>De más libre a menos libre</p>
            <div className={styles.espectroBarra}>
              <div className={styles.espectroGradiente}>
                <span className={styles.espectroEtiquetaIzq}>Máxima libertad</span>
                <span className={styles.espectroEtiquetaDer}>Sin libertad</span>
              </div>
              <div className={styles.espectroPuntos}>
                {ESPECTRO.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.espectroPunto} ${item.id === 'falso-autonomo' ? styles.espectroPuntoIlegal : ''}`}
                    style={{ left: `${100 - item.pct}%` }}
                    onClick={() => { setVistaComparativa(false); setActivo(item.id); }}
                    aria-label={`${item.label}: ${item.pct}% independencia`}
                  >
                    <span className={styles.espectroPuntoLabel}>{item.label}</span>
                    <span className={styles.espectroPuntoDot} />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Tabla comparativa */
        <section className={styles.comparativaSection} aria-label="Tabla comparativa">
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">📊</span> Comparativa de los 6 Tipos
          </h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Estabilidad</th>
                  <th>Independencia</th>
                  <th>Riesgo Legal</th>
                  <th>Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((row, i) => (
                  <tr key={i} className={i === COMPARATIVA.length - 1 ? styles.filaIlegal : ''}>
                    <td className={styles.celdaTipo}>{row.tipo}</td>
                    <td>{row.estabilidad}</td>
                    <td>{row.independencia}</td>
                    <td>
                      <span className={
                        row.riesgoLegal === 'Muy alto' ? styles.riesgoMuyAlto :
                        row.riesgoLegal === 'Medio' ? styles.riesgoMedio :
                        styles.riesgoBajo
                      }>
                        {row.riesgoLegal}
                      </span>
                    </td>
                    <td>{row.ingresoTipico}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Sección educativa */}
      <EducationalSection title="Aprende sobre relaciones comerciales freelance" subtitle="Marco legal, detección de falso autónomo y derechos del freelance en España">
        <h3>Relación mercantil vs. relación laboral</h3>
        <p>
          En España, la diferencia entre ser freelance (autónomo) y empleado no depende de lo que ponga en el contrato,
          sino de cómo se desarrolla la relación en la práctica. El <strong>Estatuto de los Trabajadores (art. 1.1)</strong> define
          la relación laboral por tres rasgos: <strong>ajenidad</strong> (trabajas para otro), <strong>dependencia</strong> (el
          otro decide cómo, cuándo y dónde) y <strong>retribución</strong> (cobras un salario regular).
        </p>
        <p>
          Cuando un freelance tiene las tres características, la Inspección de Trabajo puede declarar que la relación
          es realmente laboral, independientemente de que exista una factura en lugar de una nómina (art. 8.1 ET:
          presunción de laboralidad).
        </p>

        <h3>Cómo detectar si eres falso autónomo</h3>
        <p>La jurisprudencia del Tribunal Supremo ha consolidado estos indicios:</p>
        <ul>
          <li><strong>Horario impuesto:</strong> Fichajes, control de presencia, obligación de estar en oficina</li>
          <li><strong>Dependencia económica:</strong> Más del 75% de tus ingresos provienen de un solo pagador (TRADE, art. 11 LETA)</li>
          <li><strong>Herramientas ajenas:</strong> Ordenador, software, local, vehículo proporcionados por el cliente</li>
          <li><strong>Inserción en organización:</strong> Asistes a reuniones internas, usas email corporativo, tienes superiores jerárquicos</li>
          <li><strong>Sin capacidad de sustitución:</strong> No puedes enviar a otra persona a hacer tu trabajo</li>
          <li><strong>Sin riesgo empresarial:</strong> Cobras lo mismo independientemente de los resultados</li>
        </ul>

        <h3>Qué hacer si eres falso autónomo</h3>
        <ol>
          <li><strong>Documenta todo:</strong> Correos con horarios, capturas de control de presencia, facturas siempre por el mismo importe</li>
          <li><strong>Consulta con un abogado laboralista:</strong> La primera consulta suele ser gratuita o económica</li>
          <li><strong>Denuncia ante la Inspección de Trabajo:</strong> Es anónima y gratuita. La Inspección investiga de oficio</li>
          <li><strong>Demanda ante el Juzgado de lo Social:</strong> Si la empresa no regulariza, puedes reclamar la relación laboral con efectos retroactivos</li>
        </ol>
        <p>
          <strong>Plazo:</strong> La acción para reclamar la laboralidad prescribe a los 4 años (art. 59 ET). Las
          cotizaciones a la SS se pueden reclamar retroactivamente hasta 4 años.
        </p>

        <h3>Derechos del freelance legítimo</h3>
        <p>
          Un autónomo que trabaja en relación mercantil legítima tiene derecho a:
        </p>
        <ul>
          <li>Fijar sus propias tarifas y negociar condiciones</li>
          <li>Organizar su tiempo y lugar de trabajo libremente</li>
          <li>Trabajar para múltiples clientes simultáneamente</li>
          <li>Rechazar encargos sin consecuencias laborales</li>
          <li>Enviar un sustituto si no puede realizar el trabajo personalmente</li>
          <li>Deducir gastos profesionales en su declaración de IRPF e IVA</li>
        </ul>

        <h3>El TRADE: autónomo económicamente dependiente</h3>
        <p>
          La Ley del Estatuto del Trabajo Autónomo (LETA, art. 11) reconoce la figura del TRADE: autónomo que
          factura al menos el 75% a un solo cliente. Tiene protecciones especiales: contrato obligatorio por escrito,
          derecho a vacaciones (18 días), indemnización por fin de contrato y jurisdicción social. Es la zona gris
          entre freelance puro y falso autónomo.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-tipos-cliente-freelance')} />
      <ShareCard appName="visualizador-tipos-cliente-freelance" />
      <Footer appName="visualizador-tipos-cliente-freelance" />
    </div>
  );
}
