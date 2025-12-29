'use client';

import { useState } from 'react';
import styles from './ComparadorTiposSeguros.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type SeguroCategoria = 'vida' | 'auto' | 'hogar' | 'salud';

interface TipoSeguro {
  nombre: string;
  icon: string;
  descripcion: string;
  coberturas: string[];
  ventajas: string[];
  desventajas: string[];
  idealPara: string[];
  costeOrientativo: string;
}

const segurosData: Record<SeguroCategoria, { titulo: string; icon: string; tipos: TipoSeguro[] }> = {
  vida: {
    titulo: 'Seguros de Vida',
    icon: '❤️',
    tipos: [
      {
        nombre: 'Seguro Temporal (Riesgo)',
        icon: '⏱️',
        descripcion: 'Cobertura durante un período determinado (10, 20, 30 años). Si falleces durante el plazo, tus beneficiarios reciben el capital.',
        coberturas: ['Fallecimiento', 'Invalidez absoluta y permanente (opcional)', 'Enfermedades graves (opcional)'],
        ventajas: ['Prima muy económica', 'Capital elevado por poco dinero', 'Flexible: puedes ajustar duración', 'Ideal si tu necesidad disminuye con el tiempo'],
        desventajas: ['Si sobrevives al plazo, no recuperas nada', 'La prima aumenta si renuevas a mayor edad', 'Sin componente de ahorro'],
        idealPara: ['Familias con hipoteca', 'Padres con hijos pequeños', 'Quien busca máxima protección al mínimo coste'],
        costeOrientativo: '15-40€/mes para 200.000€ (persona 35 años)',
      },
      {
        nombre: 'Seguro de Vida Entera',
        icon: '♾️',
        descripcion: 'Cobertura vitalicia. Independientemente de cuándo fallezcas, tus beneficiarios recibirán el capital asegurado.',
        coberturas: ['Fallecimiento (garantizado)', 'Valor de rescate acumulado', 'Invalidez (opcional)'],
        ventajas: ['Pago garantizado a beneficiarios', 'Acumula valor de rescate', 'Prima fija toda la vida', 'Puede usarse como garantía de préstamo'],
        desventajas: ['Primas muy superiores al temporal', 'Rentabilidad del ahorro baja', 'Menos flexible que otros productos'],
        idealPara: ['Planificación sucesoria', 'Quien quiere dejar herencia garantizada', 'Patrimonio alto que busca ventajas fiscales'],
        costeOrientativo: '80-200€/mes para 100.000€ (persona 35 años)',
      },
      {
        nombre: 'Seguro Vida-Ahorro (Unit Linked)',
        icon: '📈',
        descripcion: 'Combina protección por fallecimiento con un componente de inversión en fondos. El valor fluctúa según mercados.',
        coberturas: ['Fallecimiento (capital variable)', 'Valor de rescate (según inversión)', 'Posibilidad de aportaciones extra'],
        ventajas: ['Potencial de rentabilidad', 'Flexibilidad en aportaciones', 'Ventajas fiscales del seguro', 'Diversificación de inversiones'],
        desventajas: ['Riesgo de pérdida del capital', 'Comisiones de gestión', 'Complejidad del producto', 'Cobertura de fallecimiento puede ser baja'],
        idealPara: ['Inversores con horizonte largo', 'Quien busca ventajas fiscales', 'Perfil de riesgo medio-alto'],
        costeOrientativo: 'Variable según aportación (mínimo 50-100€/mes)',
      },
      {
        nombre: 'PIAS (Plan Individual de Ahorro Sistemático)',
        icon: '🏦',
        descripcion: 'Seguro de ahorro con ventajas fiscales si se mantiene 5+ años y se cobra como renta vitalicia.',
        coberturas: ['Fallecimiento (capital acumulado)', 'Ahorro garantizado o en fondos', 'Renta vitalicia al vencimiento'],
        ventajas: ['Exención fiscal si se cobra como renta', 'Aportación máxima 8.000€/año', 'Liquidez (con penalización fiscal)', 'Puede ser garantizado'],
        desventajas: ['Límite de aportación anual', 'Beneficio fiscal solo como renta', 'Penalización por rescate anticipado'],
        idealPara: ['Complemento a la jubilación', 'Ahorro a largo plazo (10+ años)', 'Quien busca rentas vitalicias'],
        costeOrientativo: 'Aportación libre hasta 8.000€/año',
      },
    ],
  },
  auto: {
    titulo: 'Seguros de Automóvil',
    icon: '🚗',
    tipos: [
      {
        nombre: 'Seguro a Terceros Básico',
        icon: '🛡️',
        descripcion: 'Cobertura mínima obligatoria por ley. Cubre los daños que causes a terceros, pero no los de tu vehículo.',
        coberturas: ['Responsabilidad civil obligatoria', 'Defensa jurídica básica', 'Reclamación de daños'],
        ventajas: ['El más económico', 'Cumple con la ley', 'Suficiente para coches antiguos', 'Sin franquicia'],
        desventajas: ['No cubre daños propios', 'Sin asistencia en carretera', 'Sin cobertura de robo', 'Sin lunas'],
        idealPara: ['Coches de más de 10 años', 'Bajo valor de mercado', 'Presupuesto muy ajustado'],
        costeOrientativo: '200-400€/año',
      },
      {
        nombre: 'Terceros Ampliado',
        icon: '🛡️✨',
        descripcion: 'Añade coberturas adicionales al básico: lunas, robo, incendio y asistencia en carretera.',
        coberturas: ['Todo lo del básico', 'Lunas (con o sin franquicia)', 'Robo e incendio', 'Asistencia en carretera 24h', 'Daños por fenómenos atmosféricos'],
        ventajas: ['Equilibrio precio/cobertura', 'Protege ante imprevistos comunes', 'Asistencia incluida', 'Opción popular'],
        desventajas: ['No cubre daños propios por accidente', 'Franquicias en algunas coberturas', 'No incluye vehículo de sustitución'],
        idealPara: ['Coches de 5-10 años', 'Quien quiere más tranquilidad', 'Valor de mercado medio'],
        costeOrientativo: '350-600€/año',
      },
      {
        nombre: 'Todo Riesgo con Franquicia',
        icon: '🏆',
        descripcion: 'Cobertura completa incluyendo daños propios, pero con una cantidad a tu cargo en cada siniestro (franquicia).',
        coberturas: ['Daños propios por accidente', 'Todo lo del ampliado', 'Vehículo de sustitución (según póliza)', 'Conductor asegurado'],
        ventajas: ['Cobertura muy completa', 'Más barato que sin franquicia', 'Ideal para conductores prudentes', 'Desincentiva siniestros menores'],
        desventajas: ['Pagas franquicia en cada siniestro', 'Franquicia típica: 150-300€', 'Puede salir caro con varios siniestros'],
        idealPara: ['Coches de 3-7 años', 'Buenos conductores', 'Quien quiere ahorro en prima'],
        costeOrientativo: '500-900€/año (franquicia 150-300€)',
      },
      {
        nombre: 'Todo Riesgo sin Franquicia',
        icon: '👑',
        descripcion: 'La cobertura más completa. Cubre todos los daños sin que pagues nada de tu bolsillo.',
        coberturas: ['Daños propios sin franquicia', 'Todas las coberturas anteriores', 'Vehículo de sustitución', 'Accidentes del conductor'],
        ventajas: ['Máxima tranquilidad', 'Sin gastos en siniestros', 'Incluye todo', 'Ideal para coches nuevos'],
        desventajas: ['El más caro', 'Puede no compensar en coches viejos', 'Prima elevada para jóvenes'],
        idealPara: ['Coches nuevos o de alto valor', 'Quien quiere cero preocupaciones', 'Renting/leasing (suele ser obligatorio)'],
        costeOrientativo: '700-1.500€/año',
      },
    ],
  },
  hogar: {
    titulo: 'Seguros de Hogar',
    icon: '🏠',
    tipos: [
      {
        nombre: 'Seguro de Continente',
        icon: '🧱',
        descripcion: 'Cubre la estructura del edificio: paredes, suelos, techos, instalaciones fijas. Obligatorio si tienes hipoteca.',
        coberturas: ['Estructura del edificio', 'Instalaciones fijas (fontanería, electricidad)', 'Incendio, explosión', 'Daños por agua', 'Fenómenos atmosféricos'],
        ventajas: ['Obligatorio para hipotecas', 'Protege tu mayor inversión', 'Cubre reconstrucción total', 'Imprescindible para propietarios'],
        desventajas: ['No cubre muebles ni objetos', 'No incluye responsabilidad civil', 'Debe valorarse correctamente'],
        idealPara: ['Propietarios con hipoteca', 'Comunidades de propietarios', 'Viviendas en zonas de riesgo'],
        costeOrientativo: '100-200€/año (vivienda media)',
      },
      {
        nombre: 'Seguro de Contenido',
        icon: '🛋️',
        descripcion: 'Cubre todo lo que hay dentro de la vivienda: muebles, electrodomésticos, ropa, objetos personales.',
        coberturas: ['Mobiliario y enseres', 'Electrodomésticos', 'Equipos electrónicos', 'Ropa y efectos personales', 'Joyas y objetos de valor (con límites)'],
        ventajas: ['Protege tus pertenencias', 'Flexible: ajustas el capital', 'Cubre robo y daños', 'Ideal para inquilinos'],
        desventajas: ['No cubre la estructura', 'Límites en objetos de valor', 'Requiere inventario actualizado'],
        idealPara: ['Inquilinos', 'Pisos de alquiler', 'Quien tiene objetos de valor'],
        costeOrientativo: '80-150€/año',
      },
      {
        nombre: 'Multirriesgo del Hogar',
        icon: '🏡',
        descripcion: 'El más completo: combina continente + contenido + responsabilidad civil + asistencia. El estándar del mercado.',
        coberturas: ['Continente completo', 'Contenido completo', 'Responsabilidad civil familiar', 'Asistencia 24h (cerrajero, fontanero, electricista)', 'Defensa jurídica'],
        ventajas: ['Cobertura integral', 'RC protege ante demandas', 'Asistencia muy práctica', 'Precio competitivo por todo incluido'],
        desventajas: ['Puedes pagar coberturas que no necesitas', 'Franquicias en algunas garantías', 'Variabilidad entre aseguradoras'],
        idealPara: ['Propietarios que viven en la vivienda', 'Familias', 'Quien quiere tranquilidad total'],
        costeOrientativo: '150-350€/año (vivienda media)',
      },
      {
        nombre: 'Seguro de Alquiler (para propietarios)',
        icon: '🔑',
        descripcion: 'Específico para propietarios que alquilan. Cubre impagos del inquilino, defensa jurídica y daños por vandalismo.',
        coberturas: ['Impago de rentas (6-12 meses)', 'Defensa jurídica desahucio', 'Daños por vandalismo', 'Actos malintencionados del inquilino'],
        ventajas: ['Garantía de cobro del alquiler', 'Incluye abogados para desahucio', 'Tranquilidad para el propietario', 'Complementa al multirriesgo'],
        desventajas: ['No es un multirriesgo completo', 'Requiere selección de inquilino', 'Carencias iniciales'],
        idealPara: ['Propietarios que alquilan', 'Inversores inmobiliarios', 'Quien quiere garantizar rentas'],
        costeOrientativo: '150-300€/año',
      },
    ],
  },
  salud: {
    titulo: 'Seguros de Salud',
    icon: '🏥',
    tipos: [
      {
        nombre: 'Seguro con Cuadro Médico',
        icon: '📋',
        descripcion: 'Acceso a una red de médicos, clínicas y hospitales concertados. El más común en España.',
        coberturas: ['Consultas con especialistas', 'Pruebas diagnósticas', 'Hospitalización', 'Cirugía', 'Urgencias 24h'],
        ventajas: ['Sin desembolso en cada visita', 'Acceso rápido a especialistas', 'Prima competitiva', 'Amplia red de centros'],
        desventajas: ['Limitado a médicos del cuadro', 'Puede no incluir tu médico preferido', 'Autorización previa para algunas pruebas'],
        idealPara: ['Familias', 'Quien busca rapidez de acceso', 'Zonas con buen cuadro médico'],
        costeOrientativo: '40-80€/mes por persona',
      },
      {
        nombre: 'Seguro de Reembolso',
        icon: '💳',
        descripcion: 'Libertad total para elegir médico. Pagas y la aseguradora te devuelve un porcentaje (80-90%).',
        coberturas: ['Libre elección de médico', 'Cualquier hospital', 'Reembolso del 80-90%', 'Sin autorizaciones previas', 'Cobertura internacional'],
        ventajas: ['Máxima libertad de elección', 'Acceso a los mejores especialistas', 'Ideal para expatriados', 'Sin limitaciones de cuadro'],
        desventajas: ['Prima más alta', 'Debes adelantar el dinero', 'Gestión de facturas y reembolsos', '10-20% a tu cargo'],
        idealPara: ['Ejecutivos y directivos', 'Quien tiene médico de confianza', 'Expatriados', 'Zonas rurales con poco cuadro'],
        costeOrientativo: '100-200€/mes por persona',
      },
      {
        nombre: 'Seguro con Copago',
        icon: '🪙',
        descripcion: 'Prima más baja a cambio de pagar una pequeña cantidad en cada acto médico (5-20€ por consulta).',
        coberturas: ['Mismas coberturas que cuadro médico', 'Copago por acto (5-20€)', 'Urgencias sin copago', 'Hospitalización sin copago (según póliza)'],
        ventajas: ['Prima muy económica', 'Desincentiva uso innecesario', 'Copagos moderados', 'Buen equilibrio precio/servicio'],
        desventajas: ['Pago en cada consulta', 'Puede salir caro si usas mucho', 'Menos predecible el gasto anual'],
        idealPara: ['Jóvenes sanos', 'Quien usa poco el seguro', 'Presupuesto ajustado'],
        costeOrientativo: '25-50€/mes por persona',
      },
      {
        nombre: 'Seguro Dental',
        icon: '🦷',
        descripcion: 'Específico para tratamientos dentales. Puede ser independiente o añadido a un seguro de salud.',
        coberturas: ['Revisiones y limpiezas', 'Empastes y extracciones', 'Endodoncias', 'Ortodoncia (con límites)', 'Implantes (con descuentos)'],
        ventajas: ['Cubre lo que la Seguridad Social no', 'Preventivo incluido', 'Descuentos en tratamientos caros', 'Prima asequible'],
        desventajas: ['Carencias iniciales (6-12 meses)', 'Límites en ortodoncia e implantes', 'Cuadro dental limitado'],
        idealPara: ['Familias con niños', 'Quien necesita ortodoncia', 'Mantenimiento dental regular'],
        costeOrientativo: '8-20€/mes por persona',
      },
    ],
  },
};

export default function ComparadorTiposSegurosPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<SeguroCategoria>('vida');
  const [tipoExpandido, setTipoExpandido] = useState<string | null>(null);

  const toggleTipo = (nombre: string) => {
    setTipoExpandido(tipoExpandido === nombre ? null : nombre);
  };

  const categoriaData = segurosData[categoriaActiva];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>📊</span>
        <h1 className={styles.title}>Comparador de Tipos de Seguros</h1>
        <p className={styles.subtitle}>
          Guía educativa para entender las diferencias entre seguros de vida, auto, hogar y salud en España
        </p>
      </header>

      {/* Selector de categoría */}
      <div className={styles.categorySelector}>
        {(Object.keys(segurosData) as SeguroCategoria[]).map((cat) => (
          <button
            key={cat}
            className={`${styles.categoryBtn} ${categoriaActiva === cat ? styles.categoryBtnActive : ''}`}
            onClick={() => {
              setCategoriaActiva(cat);
              setTipoExpandido(null);
            }}
          >
            <span className={styles.categoryIcon}>{segurosData[cat].icon}</span>
            <span className={styles.categoryLabel}>{segurosData[cat].titulo}</span>
          </button>
        ))}
      </div>

      {/* Contenido de la categoría */}
      <div className={styles.mainContent}>
        <h2 className={styles.sectionTitle}>
          {categoriaData.icon} {categoriaData.titulo}
        </h2>

        <div className={styles.tiposGrid}>
          {categoriaData.tipos.map((tipo) => (
            <div
              key={tipo.nombre}
              className={`${styles.tipoCard} ${tipoExpandido === tipo.nombre ? styles.tipoCardExpanded : ''}`}
            >
              <button
                className={styles.tipoHeader}
                onClick={() => toggleTipo(tipo.nombre)}
                aria-expanded={tipoExpandido === tipo.nombre}
              >
                <div className={styles.tipoHeaderLeft}>
                  <span className={styles.tipoIcon}>{tipo.icon}</span>
                  <h3 className={styles.tipoNombre}>{tipo.nombre}</h3>
                </div>
                <span className={styles.tipoToggle}>
                  {tipoExpandido === tipo.nombre ? '−' : '+'}
                </span>
              </button>

              <p className={styles.tipoDescripcion}>{tipo.descripcion}</p>

              <div className={styles.tipoCoste}>
                <span className={styles.costeLabel}>Coste orientativo:</span>
                <span className={styles.costeValue}>{tipo.costeOrientativo}</span>
              </div>

              {tipoExpandido === tipo.nombre && (
                <div className={styles.tipoDetalles}>
                  <div className={styles.detalleBloque}>
                    <h4>✅ Coberturas principales</h4>
                    <ul>
                      {tipo.coberturas.map((cob, i) => (
                        <li key={i}>{cob}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.detalleBloque}>
                    <h4>👍 Ventajas</h4>
                    <ul className={styles.ventajasList}>
                      {tipo.ventajas.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.detalleBloque}>
                    <h4>👎 Desventajas</h4>
                    <ul className={styles.desventajasList}>
                      {tipo.desventajas.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.detalleBloque}>
                    <h4>🎯 Ideal para</h4>
                    <ul className={styles.idealList}>
                      {tipo.idealPara.map((ip, i) => (
                        <li key={i}>{ip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer educativo (ligero) */}
      <div className={styles.disclaimer}>
        <h3>ℹ️ Información Educativa</h3>
        <p>
          Este comparador ofrece <strong>información general</strong> sobre tipos de seguros en España.
          Las características, coberturas y precios pueden variar significativamente según la aseguradora.
          Consulta con un profesional de seguros para elegir el producto adecuado a tu situación personal.
        </p>
      </div>

      {/* Tabla comparativa rápida */}
      <div className={styles.tablaSection}>
        <h2 className={styles.sectionTitle}>📋 Tabla Comparativa Rápida</h2>

        {categoriaActiva === 'vida' && (
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Duración</th>
                  <th>Ahorro</th>
                  <th>Prima</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Temporal</strong></td>
                  <td>10-30 años</td>
                  <td>No</td>
                  <td>Baja</td>
                  <td>Familias con hipoteca</td>
                </tr>
                <tr>
                  <td><strong>Vida Entera</strong></td>
                  <td>Vitalicio</td>
                  <td>Sí (bajo)</td>
                  <td>Alta</td>
                  <td>Herencia/sucesión</td>
                </tr>
                <tr>
                  <td><strong>Unit Linked</strong></td>
                  <td>Variable</td>
                  <td>Sí (variable)</td>
                  <td>Media-Alta</td>
                  <td>Inversores</td>
                </tr>
                <tr>
                  <td><strong>PIAS</strong></td>
                  <td>5+ años</td>
                  <td>Sí</td>
                  <td>Variable</td>
                  <td>Jubilación</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {categoriaActiva === 'auto' && (
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Daños propios</th>
                  <th>Robo</th>
                  <th>Lunas</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Terceros Básico</strong></td>
                  <td>No</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Coches +10 años</td>
                </tr>
                <tr>
                  <td><strong>Terceros Ampliado</strong></td>
                  <td>No</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Coches 5-10 años</td>
                </tr>
                <tr>
                  <td><strong>Todo Riesgo (franq.)</strong></td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Coches 3-7 años</td>
                </tr>
                <tr>
                  <td><strong>Todo Riesgo (sin franq.)</strong></td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Coches nuevos</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {categoriaActiva === 'hogar' && (
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Estructura</th>
                  <th>Muebles</th>
                  <th>RC</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Continente</strong></td>
                  <td>Sí</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Propietarios (hipoteca)</td>
                </tr>
                <tr>
                  <td><strong>Contenido</strong></td>
                  <td>No</td>
                  <td>Sí</td>
                  <td>No</td>
                  <td>Inquilinos</td>
                </tr>
                <tr>
                  <td><strong>Multirriesgo</strong></td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Propietarios residentes</td>
                </tr>
                <tr>
                  <td><strong>Alquiler</strong></td>
                  <td>No</td>
                  <td>No</td>
                  <td>Impagos</td>
                  <td>Propietarios arrendadores</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {categoriaActiva === 'salud' && (
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Libertad elección</th>
                  <th>Pago por uso</th>
                  <th>Prima</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Cuadro médico</strong></td>
                  <td>Red concertada</td>
                  <td>No</td>
                  <td>Media</td>
                  <td>Familias</td>
                </tr>
                <tr>
                  <td><strong>Reembolso</strong></td>
                  <td>Total</td>
                  <td>Adelantas y te devuelven</td>
                  <td>Alta</td>
                  <td>Ejecutivos</td>
                </tr>
                <tr>
                  <td><strong>Copago</strong></td>
                  <td>Red concertada</td>
                  <td>5-20€ por acto</td>
                  <td>Baja</td>
                  <td>Jóvenes sanos</td>
                </tr>
                <tr>
                  <td><strong>Dental</strong></td>
                  <td>Red dental</td>
                  <td>No (con límites)</td>
                  <td>Baja</td>
                  <td>Mantenimiento bucal</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Consejos generales */}
      <div className={styles.consejosSection}>
        <h2 className={styles.sectionTitle}>💡 Consejos para Elegir Seguro</h2>
        <div className={styles.consejosGrid}>
          <div className={styles.consejoCard}>
            <span className={styles.consejoIcon}>🔍</span>
            <h4>Compara varias ofertas</h4>
            <p>Pide presupuesto a 3-4 aseguradoras. Los precios varían mucho para el mismo perfil.</p>
          </div>
          <div className={styles.consejoCard}>
            <span className={styles.consejoIcon}>📖</span>
            <h4>Lee las exclusiones</h4>
            <p>Lo que NO cubre es tan importante como lo que cubre. Revisa la letra pequeña.</p>
          </div>
          <div className={styles.consejoCard}>
            <span className={styles.consejoIcon}>💰</span>
            <h4>No solo mires el precio</h4>
            <p>El seguro más barato puede salirte caro si tiene muchas exclusiones o franquicias altas.</p>
          </div>
          <div className={styles.consejoCard}>
            <span className={styles.consejoIcon}>📅</span>
            <h4>Revisa anualmente</h4>
            <p>Tu situación cambia. Revisa cada año si tu seguro sigue siendo el adecuado.</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('comparador-tipos-seguros')} />
      <Footer appName="comparador-tipos-seguros" />
    </div>
  );
}
