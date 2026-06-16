'use client';

import { useState } from 'react';
import styles from './OrientadorMedicamentosMascotas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

type TabType = 'antiparasitarios' | 'frecuencia' | 'sintomas';
type TipoMascota = 'perro' | 'gato';

interface Antiparasitario {
  nombre: string;
  tipo: 'interno' | 'externo' | 'mixto';
  descripcion: string;
  duracion: string;
  notas: string;
}

interface Sintoma {
  nombre: string;
  emoji: string;
  causas: string[];
  urgencia: 'alta' | 'media' | 'baja';
  accion: string;
}

const antiparasitarios: Antiparasitario[] = [
  {
    nombre: 'Pipeta spot-on',
    tipo: 'externo',
    descripcion: 'Se aplica en la nuca. Protege contra pulgas, garrapatas y algunos ácaros.',
    duracion: '1 mes',
    notas: 'No bañar 48h antes ni después. Elegir según peso exacto.',
  },
  {
    nombre: 'Collar antiparasitario',
    tipo: 'externo',
    descripcion: 'Protección continua contra pulgas y garrapatas. Algunas marcas también repelen mosquitos.',
    duracion: '6-8 meses',
    notas: 'Ajustar dejando 2 dedos de holgura. Compatible con baños.',
  },
  {
    nombre: 'Comprimido oral (pulgas/garrapatas)',
    tipo: 'externo',
    descripcion: 'Pastilla masticable que elimina pulgas y garrapatas por vía sistémica.',
    duracion: '1-3 meses',
    notas: 'Dar con comida para mejor absorción. Actúa más rápido que tópicos.',
  },
  {
    nombre: 'Desparasitante interno (pastilla)',
    tipo: 'interno',
    descripcion: 'Elimina parásitos intestinales: lombrices, tenias, gusanos redondos.',
    duracion: 'Dosis única (repetir cada 3 meses)',
    notas: 'Dar en ayunas o con poca comida. Peso exacto es crucial.',
  },
  {
    nombre: 'Antiparasitario mixto',
    tipo: 'mixto',
    descripcion: 'Combina protección interna y externa en un solo producto.',
    duracion: '1 mes',
    notas: 'Consultar compatibilidad si usas otros productos.',
  },
];

const sintomas: Sintoma[] = [
  {
    nombre: 'Rascado excesivo',
    emoji: '🐕',
    causas: ['Pulgas', 'Alergias', 'Ácaros', 'Dermatitis'],
    urgencia: 'media',
    accion: 'Revisar pelaje buscando pulgas o puntos negros. Si persiste, consultar veterinario.',
  },
  {
    nombre: 'Diarrea o vómitos',
    emoji: '🤢',
    causas: ['Parásitos intestinales', 'Indigestión', 'Intoxicación'],
    urgencia: 'media',
    accion: 'Si hay sangre o persiste más de 24h, ir a urgencias. Podría necesitar desparasitación.',
  },
  {
    nombre: 'Pérdida de peso',
    emoji: '⚖️',
    causas: ['Parásitos internos', 'Mala absorción', 'Enfermedad subyacente'],
    urgencia: 'media',
    accion: 'Realizar análisis de heces. Desparasitar si no está al día.',
  },
  {
    nombre: 'Arrastrar el trasero',
    emoji: '🦮',
    causas: ['Gusanos intestinales', 'Glándulas anales llenas', 'Irritación'],
    urgencia: 'baja',
    accion: 'Revisar zona anal. Común en infestación de tenias. Desparasitar.',
  },
  {
    nombre: 'Garrapata visible',
    emoji: '🔍',
    causas: ['Garrapata adherida'],
    urgencia: 'media',
    accion: 'Retirar con pinzas especiales sin apretar. Desinfectar. Vigilar fiebre.',
  },
  {
    nombre: 'Letargo y debilidad',
    emoji: '😴',
    causas: ['Anemia por parásitos', 'Infección', 'Ehrlichiosis'],
    urgencia: 'alta',
    accion: 'Urgente si las encías están pálidas. Puede indicar anemia severa.',
  },
  {
    nombre: 'Tos persistente',
    emoji: '🤧',
    causas: ['Gusano del corazón', 'Gusanos pulmonares', 'Infección respiratoria'],
    urgencia: 'alta',
    accion: 'Ir al veterinario. Los parásitos cardiopulmonares son graves.',
  },
  {
    nombre: 'Pelaje opaco y caída',
    emoji: '✨',
    causas: ['Déficit nutricional por parásitos', 'Alergias', 'Hongos'],
    urgencia: 'baja',
    accion: 'Desparasitar si no está al día. Revisar calidad de alimentación.',
  },
];

export default function CalculadoraMedicamentosMascotasPage() {
  const [activeTab, setActiveTab] = useState<TabType>('antiparasitarios');
  const [tipoMascota, setTipoMascota] = useState<TipoMascota>('perro');
  const [peso, setPeso] = useState('');
  const [tipoAntiparasitario, setTipoAntiparasitario] = useState<'interno' | 'externo'>('externo');
  const [resultado, setResultado] = useState<{
    rangoProducto: string;
    frecuencia: string;
    proximaDosis: string;
    notas: string[];
  } | null>(null);

  const calcularRecomendacion = () => {
    const pesoNum = parseFloat(peso.replace(',', '.'));
    if (isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 100) return;

    // Determinar rango de peso del producto
    let rangoProducto = '';
    if (tipoMascota === 'perro') {
      if (pesoNum <= 4) rangoProducto = 'Muy pequeño (2-4 kg)';
      else if (pesoNum <= 10) rangoProducto = 'Pequeño (4-10 kg)';
      else if (pesoNum <= 20) rangoProducto = 'Mediano (10-20 kg)';
      else if (pesoNum <= 40) rangoProducto = 'Grande (20-40 kg)';
      else rangoProducto = 'Muy grande (40-60 kg)';
    } else {
      if (pesoNum <= 4) rangoProducto = 'Gato pequeño (hasta 4 kg)';
      else if (pesoNum <= 8) rangoProducto = 'Gato mediano-grande (4-8 kg)';
      else rangoProducto = 'Gato muy grande (>8 kg)';
    }

    // Frecuencia según tipo
    const frecuencia = tipoAntiparasitario === 'externo'
      ? 'Cada mes (pipeta) o según duración del producto'
      : 'Cada 3 meses (adultos) o mensual (cachorros)';

    // Próxima dosis
    const hoy = new Date();
    const proximaDosisDate = new Date(hoy);
    if (tipoAntiparasitario === 'externo') {
      proximaDosisDate.setMonth(proximaDosisDate.getMonth() + 1);
    } else {
      proximaDosisDate.setMonth(proximaDosisDate.getMonth() + 3);
    }
    const proximaDosis = proximaDosisDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Notas según peso y tipo
    const notas: string[] = [];
    if (pesoNum < 2) {
      notas.push('⚠️ Peso muy bajo. Consultar con veterinario antes de desparasitar.');
    }
    if (tipoAntiparasitario === 'externo') {
      notas.push('No bañar 48 horas antes ni después de aplicar pipeta.');
      notas.push('Aplicar directamente sobre la piel, separando el pelo.');
    } else {
      notas.push('Dar preferiblemente en ayunas o con poca comida.');
      notas.push('Es normal ver parásitos en heces tras la desparasitación.');
    }
    if (tipoMascota === 'perro' && pesoNum > 25) {
      notas.push('Los perros grandes pueden necesitar productos de mayor concentración.');
    }

    setResultado({
      rangoProducto,
      frecuencia,
      proximaDosis,
      notas,
    });
  };

  const tabs: { id: TabType; label: string; emoji: string }[] = [
    { id: 'antiparasitarios', label: 'Antiparasitarios', emoji: '💊' },
    { id: 'frecuencia', label: 'Frecuencia', emoji: '📅' },
    { id: 'sintomas', label: 'Síntomas', emoji: '🔍' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>💊 Orientador Medicamentos Mascotas</h1>
        <p className={styles.subtitle}>
          Guía de antiparasitarios para perros y gatos
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
          >
            <span aria-hidden="true">{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Antiparasitarios */}
      {activeTab === 'antiparasitarios' && (
        <div className={styles.mainContent}>
          <div className={styles.inputPanel}>
            <h3>Encuentra el producto adecuado</h3>

            {/* Selector de mascota */}
            <div className={styles.mascotaSelector}>
              <button
                type="button"
                className={`${styles.mascotaBtn} ${tipoMascota === 'perro' ? styles.active : ''}`}
                onClick={() => { setTipoMascota('perro'); setResultado(null); }}
                aria-pressed={tipoMascota === 'perro'}
              >
                <span aria-hidden="true">🐕</span> Perro
              </button>
              <button
                type="button"
                className={`${styles.mascotaBtn} ${tipoMascota === 'gato' ? styles.active : ''}`}
                onClick={() => { setTipoMascota('gato'); setResultado(null); }}
                aria-pressed={tipoMascota === 'gato'}
              >
                <span aria-hidden="true">🐈</span> Gato
              </button>
            </div>

            {/* Peso */}
            <div className={styles.inputGroup}>
              <label>Peso de tu {tipoMascota}</label>
              <div className={styles.inputConUnidad}>
                <input
                  type="text"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder={tipoMascota === 'perro' ? '15' : '4'}
                  className={styles.input}
                />
                <span className={styles.unidad}>kg</span>
              </div>
            </div>

            {/* Tipo */}
            <div className={styles.inputGroup}>
              <label>Tipo de antiparasitario</label>
              <div className={styles.tipoSelector}>
                <button
                  type="button"
                  className={`${styles.tipoBtn} ${tipoAntiparasitario === 'externo' ? styles.active : ''}`}
                  onClick={() => setTipoAntiparasitario('externo')}
                  aria-pressed={tipoAntiparasitario === 'externo'}
                >
                  <span className={styles.tipoIcon} aria-hidden="true">🦟</span>
                  <span className={styles.tipoLabel}>Externo</span>
                  <span className={styles.tipoDesc}>Pulgas, garrapatas</span>
                </button>
                <button
                  type="button"
                  className={`${styles.tipoBtn} ${tipoAntiparasitario === 'interno' ? styles.active : ''}`}
                  onClick={() => setTipoAntiparasitario('interno')}
                  aria-pressed={tipoAntiparasitario === 'interno'}
                >
                  <span className={styles.tipoIcon} aria-hidden="true">🐛</span>
                  <span className={styles.tipoLabel}>Interno</span>
                  <span className={styles.tipoDesc}>Lombrices, tenias</span>
                </button>
              </div>
            </div>

            <button type="button" onClick={calcularRecomendacion} className={styles.btnPrimary}>
              Ver Recomendación
            </button>

            {resultado && (
              <div className={styles.resultadoBox}>
                <div className={styles.resultadoItem}>
                  <span className={styles.resultadoLabel}>📦 Rango de producto:</span>
                  <span className={styles.resultadoValor}>{resultado.rangoProducto}</span>
                </div>
                <div className={styles.resultadoItem}>
                  <span className={styles.resultadoLabel}>🔄 Frecuencia:</span>
                  <span className={styles.resultadoValor}>{resultado.frecuencia}</span>
                </div>
                <div className={styles.resultadoItem}>
                  <span className={styles.resultadoLabel}>📅 Próxima dosis:</span>
                  <span className={styles.resultadoValor}>{resultado.proximaDosis}</span>
                </div>

                <div className={styles.notasBox}>
                  <h4>📝 Notas importantes:</h4>
                  <ul>
                    {resultado.notas.map((nota, i) => (
                      <li key={i}>{nota}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className={styles.productosPanel}>
            <h3>Tipos de Antiparasitarios</h3>
            <div className={styles.productosList}>
              {antiparasitarios.map((producto, index) => (
                <div key={index} className={styles.productoCard}>
                  <div className={styles.productoHeader}>
                    <span className={styles.productoNombre}>{producto.nombre}</span>
                    <span className={`${styles.productoBadge} ${styles[producto.tipo]}`}>
                      {producto.tipo === 'interno' ? '🐛 Interno' :
                       producto.tipo === 'externo' ? '🦟 Externo' : '🔄 Mixto'}
                    </span>
                  </div>
                  <p className={styles.productoDescripcion}>{producto.descripcion}</p>
                  <div className={styles.productoDuracion}>
                    <strong>⏱️ Duración:</strong> {producto.duracion}
                  </div>
                  <p className={styles.productoNotas}>💡 {producto.notas}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Frecuencia */}
      {activeTab === 'frecuencia' && (
        <div className={styles.frecuenciaContainer}>
          <h2>📅 Calendario de Desparasitación</h2>

          <div className={styles.calendarioGrid}>
            <div className={styles.calendarioCard}>
              <div className={styles.calendarioHeader}>
                <span className={styles.calendarioIcon}>🐕</span>
                <span>Cachorros</span>
              </div>
              <div className={styles.calendarioBody}>
                <div className={styles.frecuenciaItem}>
                  <span className={styles.frecuenciaTipo}>Interna:</span>
                  <span>Cada 2 semanas hasta 12 semanas, luego mensual hasta 6 meses</span>
                </div>
                <div className={styles.frecuenciaItem}>
                  <span className={styles.frecuenciaTipo}>Externa:</span>
                  <span>Desde las 8 semanas, mensual (según producto)</span>
                </div>
              </div>
            </div>

            <div className={styles.calendarioCard}>
              <div className={styles.calendarioHeader}>
                <span className={styles.calendarioIcon}>🐕</span>
                <span>Perros Adultos</span>
              </div>
              <div className={styles.calendarioBody}>
                <div className={styles.frecuenciaItem}>
                  <span className={styles.frecuenciaTipo}>Interna:</span>
                  <span>Cada 3 meses (trimestral)</span>
                </div>
                <div className={styles.frecuenciaItem}>
                  <span className={styles.frecuenciaTipo}>Externa:</span>
                  <span>Mensual (pipeta) o según duración del collar (6-8 meses)</span>
                </div>
              </div>
            </div>

            <div className={styles.calendarioCard}>
              <div className={styles.calendarioHeader}>
                <span className={styles.calendarioIcon}>🐈</span>
                <span>Gatitos</span>
              </div>
              <div className={styles.calendarioBody}>
                <div className={styles.frecuenciaItem}>
                  <span className={styles.frecuenciaTipo}>Interna:</span>
                  <span>A las 3, 5, 7 y 9 semanas, luego mensual hasta 6 meses</span>
                </div>
                <div className={styles.frecuenciaItem}>
                  <span className={styles.frecuenciaTipo}>Externa:</span>
                  <span>Desde las 8 semanas, mensual</span>
                </div>
              </div>
            </div>

            <div className={styles.calendarioCard}>
              <div className={styles.calendarioHeader}>
                <span className={styles.calendarioIcon}>🐈</span>
                <span>Gatos Adultos</span>
              </div>
              <div className={styles.calendarioBody}>
                <div className={styles.frecuenciaItem}>
                  <span className={styles.frecuenciaTipo}>Interna:</span>
                  <span>Cada 3-6 meses (según estilo de vida)</span>
                </div>
                <div className={styles.frecuenciaItem}>
                  <span className={styles.frecuenciaTipo}>Externa:</span>
                  <span>Mensual si tiene acceso al exterior</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.factoresBox}>
            <h3>🔍 Factores que aumentan la frecuencia</h3>
            <div className={styles.factoresGrid}>
              <div className={styles.factorItem}>
                <span className={styles.factorIcon}>🏡</span>
                <span>Acceso al exterior o jardín</span>
              </div>
              <div className={styles.factorItem}>
                <span className={styles.factorIcon}>🐕‍🦺</span>
                <span>Contacto con otros animales</span>
              </div>
              <div className={styles.factorItem}>
                <span className={styles.factorIcon}>🌿</span>
                <span>Paseos por parques o campo</span>
              </div>
              <div className={styles.factorItem}>
                <span className={styles.factorIcon}>👶</span>
                <span>Niños pequeños en casa</span>
              </div>
              <div className={styles.factorItem}>
                <span className={styles.factorIcon}>🥩</span>
                <span>Alimentación cruda (BARF)</span>
              </div>
              <div className={styles.factorItem}>
                <span className={styles.factorIcon}>🐀</span>
                <span>Caza de presas (roedores, pájaros)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Síntomas */}
      {activeTab === 'sintomas' && (
        <div className={styles.sintomasContainer}>
          <h2>🔍 Síntomas de Parasitosis</h2>
          <p className={styles.sintomasIntro}>
            Estos síntomas pueden indicar la presencia de parásitos. Consulta con tu veterinario para un diagnóstico certero.
          </p>

          <div className={styles.sintomasGrid}>
            {sintomas.map((sintoma, index) => (
              <div
                key={index}
                className={`${styles.sintomaCard} ${styles[`urgencia${sintoma.urgencia.charAt(0).toUpperCase() + sintoma.urgencia.slice(1)}`]}`}
              >
                <div className={styles.sintomaHeader}>
                  <span className={styles.sintomaEmoji}>{sintoma.emoji}</span>
                  <span className={styles.sintomaNombre}>{sintoma.nombre}</span>
                  <span className={`${styles.urgenciaBadge} ${styles[sintoma.urgencia]}`}>
                    {sintoma.urgencia === 'alta' ? '🔴 Urgente' :
                     sintoma.urgencia === 'media' ? '🟡 Consultar' : '🟢 Vigilar'}
                  </span>
                </div>

                <div className={styles.sintomaCausas}>
                  <strong>Posibles causas:</strong>
                  <div className={styles.causasTags}>
                    {sintoma.causas.map((causa, i) => (
                      <span key={i} className={styles.causaTag}>{causa}</span>
                    ))}
                  </div>
                </div>

                <p className={styles.sintomaAccion}>
                  <strong>Qué hacer:</strong> {sintoma.accion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      

      <DisclaimerCard variant="medical" severity="critical" collapsible={false} context="orientador-medicamentos-mascotas">
        <p><strong>⚠️ NUNCA administres medicamentos sin consultar a tu veterinario:</strong></p>
        <ul className={styles.disclaimerList}>
          <li><strong>Dosis incorrectas pueden ser tóxicas</strong>: Especialmente en cachorros, gatos o mascotas con enfermedades renales/hepáticas</li>
          <li><strong>Interacciones medicamentosas</strong>: Si tu mascota toma otros medicamentos, pueden haber incompatibilidades</li>
          <li><strong>Resistencias a antiparasitarios</strong>: El uso inadecuado genera resistencias en pulgas/garrapatas</li>
        </ul>
        <p><strong>🚫 PELIGRO: La permetrina (presente en antiparasitarios de perro) es extremadamente tóxica para los gatos — puede causar convulsiones y la muerte. NUNCA uses productos de perro en gatos.</strong></p>
        <p className={styles.highlight}><strong>🐾 Esta calculadora es orientativa. Solo el veterinario puede prescribir tratamientos según el peso exacto, estado de salud e historial de tu mascota.</strong></p>
        <p>meskeIA no asume ninguna responsabilidad por decisiones tomadas en base a los resultados de esta herramienta, ni por un uso inadecuado de la misma.</p>
      </DisclaimerCard>

      <RelatedApps
        apps={getRelatedApps('orientador-medicamentos-mascotas')}
        title="Más herramientas para tu mascota"
        icon="🐾"
      />

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre parásitos en mascotas?"
        subtitle="Información sobre prevención, tratamiento y cuidados"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa de antiparasitarios más usados</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Parásitos que cubre</th>
                  <th>Frecuencia</th>
                  <th>Especie</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>💊 Pastilla antiparasitaria interna</td>
                  <td>Áscaris, tenias, ancilostomas</td>
                  <td>Cada 3 meses (adultos)</td>
                  <td>Perros y gatos</td>
                  <td>Mensual en cachorros hasta 6 meses</td>
                </tr>
                <tr>
                  <td>💧 Pipeta antiparasitaria externa</td>
                  <td>Pulgas, garrapatas, mosquitos (según producto)</td>
                  <td>Mensual o cada 3 meses</td>
                  <td>Perros y gatos</td>
                  <td>No bañar 48h antes/después</td>
                </tr>
                <tr>
                  <td>🔵 Collar antiparasitario</td>
                  <td>Pulgas, garrapatas, mosquitos</td>
                  <td>Cada 4-8 meses (según marca)</td>
                  <td>Perros (algunos gatos)</td>
                  <td>No combinar con pipeta del mismo principio activo</td>
                </tr>
                <tr>
                  <td>💊 Comprimido antipulgas/garrapatas</td>
                  <td>Pulgas y garrapatas sistémico</td>
                  <td>Mensual o cada 3 meses</td>
                  <td>Solo perros (Bravecto, NexGard...)</td>
                  <td>Muy efectivo. Consultar en razas MDR1</td>
                </tr>
                <tr>
                  <td>💉 Vacuna leishmaniasis</td>
                  <td>Leishmania (transmitida por flebotomos)</td>
                  <td>Anual</td>
                  <td>Perros</td>
                  <td>Zonas endémicas mediterráneas especialmente</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.guideSection}>
          <h2>Situaciones frecuentes de desparasitación</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🐕</span>
                <span className={styles.casoTag}>Cachorro recién adoptado</span>
              </div>
              <p>Bruno, 8 semanas, llega de una protectora. Aunque la protectora le haya desparasitado,
              el veterinario recomienda repetir a las 2 semanas. La pauta: antiparasitario interno mensual
              hasta los 6 meses, luego cada 3 meses. Externa: pipeta o collar desde las 8 semanas.</p>
              <div className={styles.casoResultado}>Interno: mensual primeros 6 meses. Externo: desde semana 8</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🌊</span>
                <span className={styles.casoTag}>Perro que va mucho al campo</span>
              </div>
              <p>Toro sale al campo todos los fines de semana. El riesgo de garrapatas y leishmania es alto.
              El veterinario recomienda collar antiparasitario de larga duración más pipeta específica para
              mosquitos, y revisión de cuerpo completo tras cada salida al campo.</p>
              <div className={styles.casoResultado}>Collar + pipeta reforzada + revisión post-campo</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🐈</span>
                <span className={styles.casoTag}>Gato de interior sin contacto exterior</span>
              </div>
              <p>Misty vive en un piso y nunca sale. El riesgo es bajo pero no nulo: las pulgas pueden
              llegar en ropa o calzado del propietario. Se recomienda pipeta cada 3 meses como mínimo
              y antiparasitario interno dos veces al año.</p>
              <div className={styles.casoResultado}>Desparasitación mínima incluso en gatos de interior</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🦠</span>
                <span className={styles.casoTag}>Infestación activa de pulgas en casa</span>
              </div>
              <p>Solo el 5% de las pulgas viven en el animal; el 95% están en el entorno (alfombras, sofás,
              camas). Tratar solo al animal sin desinfectar el hogar es ineficaz. Se necesita: pipeta de
              acción rápida en la mascota + spray ambiental con IGR (regulador de crecimiento de insectos).</p>
              <div className={styles.casoResultado}>Tratar mascota + entorno simultáneamente</div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>🦟 Parásitos Externos Comunes</h2>
          <div className={styles.parasitosGrid}>
            <div className={styles.parasitoCard}>
              <h4>Pulgas</h4>
              <p>Pequeños insectos saltadores que se alimentan de sangre. Causan picazón intensa y pueden transmitir tenias. Una hembra pone hasta 50 huevos/día.</p>
            </div>
            <div className={styles.parasitoCard}>
              <h4>Garrapatas</h4>
              <p>Arácnidos que se fijan a la piel. Pueden transmitir enfermedades graves como Ehrlichiosis, Babesiosis y enfermedad de Lyme.</p>
            </div>
            <div className={styles.parasitoCard}>
              <h4>Ácaros</h4>
              <p>Causan sarna (sarcóptica, demodécica) y otitis. Muy contagiosos. Producen picazón extrema y pérdida de pelo.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>🐛 Parásitos Internos</h2>
          <div className={styles.parasitosGrid}>
            <div className={styles.parasitoCard}>
              <h4>Gusanos Redondos (Áscaris)</h4>
              <p>Los más comunes en cachorros. Se transmiten de madre a crías. Pueden causar vómitos, diarrea y barriga hinchada.</p>
            </div>
            <div className={styles.parasitoCard}>
              <h4>Tenias</h4>
              <p>Gusanos planos que se transmiten al ingerir pulgas. Se ven como &quot;granos de arroz&quot; en heces o zona anal.</p>
            </div>
            <div className={styles.parasitoCard}>
              <h4>Gusano del Corazón</h4>
              <p>Transmitido por mosquitos. Afecta corazón y pulmones. Potencialmente mortal. Prevención mensual en zonas endémicas.</p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo establecer un protocolo de desparasitación: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Consulta con el veterinario el protocolo personalizado</strong>
                <p>No existe un protocolo único. El veterinario valorará: zona geográfica (riesgo de leishmaniasis,
                filariosis), estilo de vida (campo, ciudad, viajes), presencia de niños en casa y estado de salud
                del animal para diseñar el calendario más adecuado.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Elige productos específicos para la especie</strong>
                <p>NUNCA uses productos de perro en gatos. Muchos antiparasitarios de perro (especialmente los
                que contienen permetrina) son letales para los gatos. Lee siempre la etiqueta y confirma con
                el veterinario antes de aplicar cualquier producto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Aplica los antiparasitarios en las fechas correctas</strong>
                <p>Usa este calculador para saber cuándo corresponde la siguiente aplicación. Los antiparasitarios
                externos deben aplicarse en la nuca (zona entre escápulas), donde el animal no puede lamerse.
                Los internos deben darse con el estómago vacío si lo indica el prospecto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>No combines productos sin supervisión veterinaria</strong>
                <p>Usar collar + pipeta + comprimido simultáneamente puede causar sobredosis de principio activo.
                El veterinario decidirá qué combinaciones son seguras y cuáles son complementarias sin riesgo
                de toxicidad.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Mantén un registro de aplicaciones</strong>
                <p>Anota en el carnet de salud o en una app de mascotas cada aplicación: producto, fecha y lote.
                Esto evita duplicaciones accidentales, ayuda al veterinario en caso de reacción adversa y
                es útil en viajes internacionales.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Revisa periódicamente la efectividad</strong>
                <p>Examina la piel del animal regularmente buscando pulgas, garrapatas o signos de rascado.
                Si ves parásitos a pesar del tratamiento, el producto puede haber caducado, haberse aplicado mal
                o el parásito puede tener resistencia. Consulta al veterinario.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>Consejos de prevención antiparasitaria</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🚫</span>
              <strong>Nunca productos de perro en gatos</strong>
              <p>La permetrina, presente en muchos antiparasitarios caninos, es extremadamente tóxica para
              los gatos. Puede causar convulsiones y la muerte. Siempre verifica la especie en la etiqueta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌡️</span>
              <strong>Protección en meses cálidos</strong>
              <p>Las pulgas y garrapatas son más activas de primavera a otoño, pero en climas templados
              pueden estar presentes todo el año. No abandones la protección en invierno en zonas costeras.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏠</span>
              <strong>Trata el entorno en infestaciones</strong>
              <p>El 95% de las pulgas viven en el hogar. Si hay infestación activa, lava ropa de cama,
              aspira a fondo y usa un spray ambiental con IGR (inhibidor de crecimiento de insectos).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <strong>Revisión completa tras salidas al campo</strong>
              <p>Tras cada paseo por zonas de hierba alta, revisa todo el cuerpo del animal: entre los dedos,
              orejas, axilas, ingles y zona del cuello. Extrae las garrapatas con un quitagarrapatas, no con las manos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💉</span>
              <strong>Vacuna antiparasitaria en zonas endémicas</strong>
              <p>En zonas mediterráneas, la vacuna contra la leishmaniasis es muy recomendable. Consulta con
              el veterinario si tu zona tiene riesgo de filariosis cardiaca (gusano del corazón).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🐱</span>
              <strong>Los gatos de interior también necesitan protección</strong>
              <p>Las pulgas pueden entrar en casa en ropa, calzado o mascotas visitantes. Incluso los gatos
              de interior deben tener un mínimo de protección durante los meses de mayor riesgo.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores peligrosos en la desparasitación de mascotas</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Usar productos de perro en gatos:</strong> La permetrina y otros insecticidas presentes en antiparasitarios caninos son letales para los gatos. Este es uno de los errores más frecuentes y más graves. Siempre comprueba la especie en el envase.</li>
            <li><strong>Aplicar el antiparasitario externo donde el animal puede lamerse:</strong> La pipeta debe aplicarse en la nuca o entre las escápulas, donde el animal no alcanza. Si se lame el producto puede intoxicarse con síntomas neurológicos.</li>
            <li><strong>Combinar productos sin consultar:</strong> Collar + pipeta + comprimido con el mismo principio activo puede causar sobredosis. No combines productos sin aprobación veterinaria explícita.</li>
            <li><strong>Tratar solo al animal en una infestación de pulgas:</strong> El 95% de la población de pulgas está en el entorno (alfombras, sofás, camas). Sin tratar el hogar, la reinfestación es inmediata y continua.</li>
            <li><strong>Usar dosis de adulto en cachorros:</strong> Muchos antiparasitarios tienen restricciones de edad y peso mínimo. Usar productos de adulto en cachorros muy jóvenes o de razas pequeñas puede ser tóxico.</li>
            <li><strong>Abandonar la desparasitación en invierno:</strong> En climas templados y zonas costeras, las pulgas y garrapatas pueden estar activas durante todo el año. La "protección estacional" puede dejar al animal desprotegido.</li>
          </ul>
        </div>
      </EducationalSection>

      <ShareCard appName="orientador-medicamentos-mascotas" />
      <Footer appName="orientador-medicamentos-mascotas" />
    </div>
  );
}
