'use client';

import { useState } from 'react';
import styles from './CalculadoraMedicamentosMascotas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LastUpdated } from '@/components';
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
        <h1 className={styles.title}>💊 Calculadora de Medicamentos</h1>
        <p className={styles.subtitle}>
          Guía de antiparasitarios para perros y gatos
        </p>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.emoji}</span> {tab.label}
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
                className={`${styles.mascotaBtn} ${tipoMascota === 'perro' ? styles.active : ''}`}
                onClick={() => { setTipoMascota('perro'); setResultado(null); }}
              >
                🐕 Perro
              </button>
              <button
                className={`${styles.mascotaBtn} ${tipoMascota === 'gato' ? styles.active : ''}`}
                onClick={() => { setTipoMascota('gato'); setResultado(null); }}
              >
                🐈 Gato
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
                  className={`${styles.tipoBtn} ${tipoAntiparasitario === 'externo' ? styles.active : ''}`}
                  onClick={() => setTipoAntiparasitario('externo')}
                >
                  <span className={styles.tipoIcon}>🦟</span>
                  <span className={styles.tipoLabel}>Externo</span>
                  <span className={styles.tipoDesc}>Pulgas, garrapatas</span>
                </button>
                <button
                  className={`${styles.tipoBtn} ${tipoAntiparasitario === 'interno' ? styles.active : ''}`}
                  onClick={() => setTipoAntiparasitario('interno')}
                >
                  <span className={styles.tipoIcon}>🐛</span>
                  <span className={styles.tipoLabel}>Interno</span>
                  <span className={styles.tipoDesc}>Lombrices, tenias</span>
                </button>
              </div>
            </div>

            <button onClick={calcularRecomendacion} className={styles.btnPrimary}>
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

      <LastUpdated lastUpdate="2 de febrero de 2026" />

      <DisclaimerCard variant="medical" severity="medium" collapsible={true} context="calculadora-medicamentos-mascotas">
        <p><strong>⚠️ NUNCA administres medicamentos sin consultar a tu veterinario:</strong></p>
        <ul className={styles.disclaimerList}>
          <li><strong>Dosis incorrectas pueden ser tóxicas</strong>: Especialmente en cachorros, gatos o mascotas con enfermedades renales/hepáticas</li>
          <li><strong>Interacciones medicamentosas</strong>: Si tu mascota toma otros medicamentos, pueden haber incompatibilidades</li>
          <li><strong>Resistencias a antiparasitarios</strong>: El uso inadecuado genera resistencias en pulgas/garrapatas</li>
        </ul>
        <p className={styles.highlight}><strong>🐾 Esta calculadora es orientativa. Tu veterinario debe prescribir tratamientos según el peso exacto, estado de salud y historial de tu mascota.</strong></p>
      </DisclaimerCard>

      <RelatedApps
        apps={getRelatedApps('calculadora-medicamentos-mascotas')}
        title="Más herramientas para tu mascota"
        icon="🐾"
      />

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre parásitos en mascotas?"
        subtitle="Información sobre prevención, tratamiento y cuidados"
      >
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
      </EducationalSection>

      <Footer appName="calculadora-medicamentos-mascotas" />
    </div>
  );
}
