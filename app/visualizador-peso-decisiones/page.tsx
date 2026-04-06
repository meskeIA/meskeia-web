'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorPesoDecisiones.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Datos: decisiones y su impacto acumulado
// ─────────────────────────────────────────────

type CategoriaDecision = 'salud' | 'dinero' | 'tiempo' | 'bienestar';

interface Impacto {
  metrica: string;
  anio1: string;
  anio5: string;
  anio10: string;
}

interface Decision {
  id: string;
  nombre: string;
  icono: string;
  categoria: CategoriaDecision;
  color: string;
  accion: string;
  impactos: Impacto[];
  explicacion: string;
}

const DECISIONES: Decision[] = [
  {
    id: 'dejar-fumar',
    nombre: 'Dejar de fumar',
    icono: '🚭',
    categoria: 'salud',
    color: '#e74c3c',
    accion: 'Dejas un paquete al día (6,50 €)',
    impactos: [
      { metrica: 'Dinero ahorrado', anio1: '2.373 €', anio5: '11.863 €', anio10: '23.725 €' },
      { metrica: 'Cigarrillos no fumados', anio1: '7.300', anio5: '36.500', anio10: '73.000' },
      { metrica: 'Riesgo cardíaco', anio1: 'Baja un 50%', anio5: 'Igual a no fumador', anio10: 'Riesgo cáncer pulmón: -50%' },
    ],
    explicacion: 'A los 20 minutos baja la presión arterial. A las 12h se normaliza el CO en sangre. Al año el riesgo cardíaco cae a la mitad. A los 10 años el riesgo de cáncer de pulmón se reduce un 50%. Y el ahorro económico es brutal.',
  },
  {
    id: 'caminar-30min',
    nombre: 'Caminar 30 min/día',
    icono: '🚶',
    categoria: 'salud',
    color: '#27ae60',
    accion: 'Sales a caminar 30 minutos cada día',
    impactos: [
      { metrica: 'Kilómetros recorridos', anio1: '1.095 km', anio5: '5.475 km', anio10: '10.950 km' },
      { metrica: 'Calorías quemadas extra', anio1: '36.500 kcal (~5 kg grasa)', anio5: '182.500 kcal', anio10: '365.000 kcal' },
      { metrica: 'Riesgo de mortalidad', anio1: 'Baja un 20%', anio5: 'Baja un 20-30%', anio10: '+2-3 años esperanza vida' },
    ],
    explicacion: 'El ejercicio más subestimado. 30 minutos de caminata diaria reduce el riesgo de diabetes un 30%, de depresión un 25%, y de demencia un 40%. No necesitas gimnasio — necesitas zapatillas.',
  },
  {
    id: 'ahorrar-5-dia',
    nombre: 'Ahorrar 5 €/día',
    icono: '🐷',
    categoria: 'dinero',
    color: '#2E86AB',
    accion: 'Apartas 5 € cada día (un café + bollería)',
    impactos: [
      { metrica: 'Ahorro acumulado', anio1: '1.825 €', anio5: '9.125 €', anio10: '18.250 €' },
      { metrica: 'Si lo inviertes al 7%', anio1: '1.890 €', anio5: '10.900 €', anio10: '26.300 €' },
      { metrica: 'Equivale a', anio1: '1 viaje corto', anio5: 'Un coche', anio10: 'Entrada de un piso' },
    ],
    explicacion: '5 € al día parece poco. Pero el interés compuesto convierte 18.250 € ahorrados en 26.300 € invertidos. La diferencia (8.050 €) es dinero que tu dinero ganó por ti mientras dormías.',
  },
  {
    id: 'dormir-1h-mas',
    nombre: 'Dormir 1 hora más',
    icono: '😴',
    categoria: 'bienestar',
    color: '#5B5EA6',
    accion: 'Pasas de 6h a 7h de sueño',
    impactos: [
      { metrica: 'Horas de sueño extra', anio1: '365 horas', anio5: '1.825 horas', anio10: '3.650 horas (152 días)' },
      { metrica: 'Productividad', anio1: '+15-20%', anio5: 'Sostenida', anio10: 'Reducción riesgo Alzheimer' },
      { metrica: 'Riesgo de accidentes', anio1: 'Baja un 33%', anio5: 'Mantenido', anio10: 'Menos enfermedades crónicas' },
    ],
    explicacion: 'Dormir 6h en vez de 7 reduce la función inmune un 70%, la memoria un 40% y triplica el riesgo de resfriarte. Una hora más de sueño es probablemente la decisión de salud con mejor ratio coste/beneficio.',
  },
  {
    id: 'leer-20min',
    nombre: 'Leer 20 min/día',
    icono: '📖',
    categoria: 'bienestar',
    color: '#9b59b6',
    accion: 'Dedicas 20 minutos diarios a leer',
    impactos: [
      { metrica: 'Páginas leídas', anio1: '~7.300 (24 libros)', anio5: '~120 libros', anio10: '~240 libros' },
      { metrica: 'Vocabulario', anio1: '+1.000 palabras', anio5: '+5.000 palabras', anio10: 'Dominio lingüístico notable' },
      { metrica: 'Reducción estrés', anio1: '-68% (6 min ya reduce)', anio5: 'Hábito consolidado', anio10: 'Menor riesgo deterioro cognitivo' },
    ],
    explicacion: 'Leer 20 minutos al día te pone en el top 5% de lectores en España. La lectura reduce el estrés más rápido que caminar, escuchar música o tomar té (estudio Universidad de Sussex).',
  },
  {
    id: 'sin-redes-1h',
    nombre: 'Reducir 1h de pantallas',
    icono: '📵',
    categoria: 'tiempo',
    color: '#e67e22',
    accion: 'Reduces 1 hora diaria de redes sociales/TV',
    impactos: [
      { metrica: 'Tiempo recuperado', anio1: '365 horas (15 días)', anio5: '1.825 horas (76 días)', anio10: '3.650 horas (152 días)' },
      { metrica: 'Bienestar mental', anio1: 'Menos ansiedad comparativa', anio5: 'Mejora autoestima', anio10: 'Relaciones más profundas' },
      { metrica: 'Podrías usar ese tiempo en', anio1: 'Aprender un idioma básico', anio5: 'Dominar una habilidad', anio10: 'Escribir varios libros' },
    ],
    explicacion: 'Las redes sociales activan los mismos circuitos de recompensa que las tragaperras. Reducir 1h al día no es privación — es recuperar 15 días completos al año para lo que realmente te importa.',
  },
  {
    id: 'cocinar-casa',
    nombre: 'Cocinar en casa (vs comer fuera)',
    icono: '🍳',
    categoria: 'dinero',
    color: '#f39c12',
    accion: 'Cocinas en casa 5 días/semana en vez de menú',
    impactos: [
      { metrica: 'Ahorro (menú 13 € vs casero 4 €)', anio1: '2.340 €', anio5: '11.700 €', anio10: '23.400 €' },
      { metrica: 'Calorías de menos', anio1: '~78.000 kcal (menú > casero)', anio5: '~390.000 kcal', anio10: 'Equivale a ~50 kg de grasa' },
      { metrica: 'Habilidad culinaria', anio1: '~260 recetas practicadas', anio5: 'Cocinero competente', anio10: 'Chef doméstico' },
    ],
    explicacion: 'Un menú del día cuesta ~13 € de media. Cocinar lo mismo en casa cuesta ~4 €. La diferencia (9 €/día × 260 laborables) son 2.340 €/año. Además, controlas ingredientes, cantidades y calidad.',
  },
  {
    id: 'beber-agua',
    nombre: 'Beber 2L de agua al día',
    icono: '💧',
    categoria: 'salud',
    color: '#48A9A6',
    accion: 'Sustituyes refrescos por agua (ahorro + salud)',
    impactos: [
      { metrica: 'Litros de agua', anio1: '730 litros', anio5: '3.650 litros', anio10: '7.300 litros' },
      { metrica: 'Ahorro vs refrescos (1,50 €/día)', anio1: '548 €', anio5: '2.738 €', anio10: '5.475 €' },
      { metrica: 'Azúcar no consumido', anio1: '~36 kg', anio5: '~180 kg', anio10: '~360 kg de azúcar' },
    ],
    explicacion: 'Una lata de refresco tiene ~35g de azúcar. Dos al día son 70g — casi 3 veces el máximo recomendado por la OMS. Cambiar a agua elimina ~25.000 kcal vacías al año y ahorra dinero.',
  },
  {
    id: 'madrugar-30min',
    nombre: 'Madrugar 30 minutos',
    icono: '⏰',
    categoria: 'tiempo',
    color: '#34495e',
    accion: 'Te levantas 30 min antes para ti',
    impactos: [
      { metrica: 'Tiempo extra al año', anio1: '183 horas (7,6 días)', anio5: '913 horas (38 días)', anio10: '1.825 horas (76 días)' },
      { metrica: 'Estrés matinal', anio1: 'Reducción notable', anio5: 'Rutina consolidada', anio10: 'Hábito de vida' },
      { metrica: 'Podrías dedicarlo a', anio1: 'Ejercicio + desayuno tranquilo', anio5: 'Proyecto personal avanzado', anio10: 'Formación equivalente a un máster' },
    ],
    explicacion: '30 minutos de mañana sin prisas transforman el día. Es el momento de menor interrupción: sin notificaciones, sin llamadas, sin demandas. Es tiempo 100% tuyo.',
  },
  {
    id: 'no-compra-impulsiva',
    nombre: 'Regla de las 48 horas',
    icono: '🛒',
    categoria: 'dinero',
    color: '#1abc9c',
    accion: 'Esperas 48h antes de cualquier compra no esencial >30 €',
    impactos: [
      { metrica: 'Compras evitadas (~40% se cancelan)', anio1: '~1.200 € ahorrados', anio5: '~6.000 €', anio10: '~12.000 €' },
      { metrica: 'Espacio físico', anio1: 'Menos acumulación', anio5: 'Casa más ordenada', anio10: 'Consumo consciente' },
      { metrica: 'Satisfacción con compras realizadas', anio1: '+40% (solo compras deseadas)', anio5: 'Hábito consolidado', anio10: 'Relación sana con el consumo' },
    ],
    explicacion: 'El 40% de las compras impulsivas se arrepienten dentro de 48h. Simplemente esperar elimina el impulso emocional y deja actuar la razón. No es no comprar — es comprar mejor.',
  },
];

const CATEGORIAS_DECISION: { id: CategoriaDecision; nombre: string; color: string }[] = [
  { id: 'salud', nombre: 'Salud', color: '#e74c3c' },
  { id: 'dinero', nombre: 'Dinero', color: '#2E86AB' },
  { id: 'tiempo', nombre: 'Tiempo', color: '#e67e22' },
  { id: 'bienestar', nombre: 'Bienestar', color: '#9b59b6' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorPesoDecisionesPage() {
  const [decisionActiva, setDecisionActiva] = useState<string>(DECISIONES[0].id);
  const [horizonte, setHorizonte] = useState<1 | 5 | 10>(10);

  const decision = DECISIONES.find(d => d.id === decisionActiva)!;
  const horizonteKey = horizonte === 1 ? 'anio1' : horizonte === 5 ? 'anio5' : 'anio10';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cuánto Pesa una Decisión</h1>
          <p className={styles.subtitle}>Pequeñas decisiones diarias con impacto enorme a largo plazo — el poder del efecto acumulado</p>
        </header>

        <LegalNotice />

        {/* Selector de horizonte */}
        <div className={styles.horizonteNav}>
          <span className={styles.horizonteLabel}>Proyección a:</span>
          {([1, 5, 10] as const).map(h => (
            <button
              key={h}
              type="button"
              className={`${styles.horizonteBtn} ${horizonte === h ? styles.horizonteActivo : ''}`}
              onClick={() => setHorizonte(h)}
              aria-pressed={horizonte === h}
            >
              {h} {h === 1 ? 'año' : 'años'}
            </button>
          ))}
        </div>

        {/* Lista de decisiones */}
        <div className={styles.decisionesGrid}>
          {DECISIONES.map(d => {
            const cat = CATEGORIAS_DECISION.find(c => c.id === d.categoria);
            return (
              <button
                key={d.id}
                type="button"
                className={`${styles.decisionCard} ${decisionActiva === d.id ? styles.decisionActiva : ''}`}
                onClick={() => setDecisionActiva(d.id)}
                style={{ borderLeftColor: d.color }}
                aria-pressed={decisionActiva === d.id}
              >
                <span className={styles.decisionIcono} aria-hidden="true">{d.icono}</span>
                <div className={styles.decisionInfo}>
                  <span className={styles.decisionNombre}>{d.nombre}</span>
                  <span className={styles.decisionCat} style={{ color: cat?.color }}>{cat?.nombre}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalle de la decisión activa */}
        <div className={styles.detalleDecision} style={{ borderLeftColor: decision.color }}>
          <div className={styles.detalleHeader}>
            <span className={styles.detalleIcono} aria-hidden="true">{decision.icono}</span>
            <div>
              <h2 className={styles.detalleTitulo}>{decision.nombre}</h2>
              <p className={styles.detalleAccion}>{decision.accion}</p>
            </div>
          </div>

          {/* Impactos */}
          <div className={styles.impactosGrid}>
            {decision.impactos.map((imp, i) => (
              <div key={i} className={styles.impactoCard}>
                <span className={styles.impactoMetrica}>{imp.metrica}</span>
                <span className={styles.impactoValor} style={{ color: decision.color }}>
                  {imp[horizonteKey]}
                </span>
                <span className={styles.impactoPeriodo}>en {horizonte} {horizonte === 1 ? 'año' : 'años'}</span>
              </div>
            ))}
          </div>

          <p className={styles.detalleExplicacion}>{decision.explicacion}</p>
        </div>

        <div className={styles.insight}>
          <p>
            El cerebro humano es terrible calculando efectos acumulados. <strong>Un 1% de mejora diaria,
            sostenido un año, no es un 365% de mejora — es un 3.778%</strong> (efecto compuesto).
            Las decisiones pequeñas pero consistentes superan siempre a los cambios grandes pero esporádicos.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más perspectiva → <a href="/visualizador-mapa-tiempo/">El Mapa de tu Tiempo</a> · <a href="/visualizador-precio-real-cosas/">El Precio Real de las Cosas</a> · <a href="/visualizador-dinero-y-tiempo/">El Dinero y el Tiempo</a>
        </div>

        <EducationalSection
          title="La ciencia del cambio de hábitos"
          subtitle="Por qué los pequeños cambios funcionan mejor que los grandes"
          defaultOpen={false}
        >
          <h3>La regla del 1%: Atomic Habits</h3>
          <p>
            James Clear popularizó la idea de que mejorar un 1% diario produce resultados extraordinarios
            a largo plazo. La clave no es la magnitud del cambio sino la <strong>consistencia</strong>.
            Ir al gimnasio 10 minutos cada día supera a ir 2 horas una vez a la semana.
          </p>

          <h3>El efecto compuesto en la vida real</h3>
          <p>
            Ahorrar 5 € al día parece insignificante. Pero a 10 años, invertido al 7%, son 26.300 €.
            Caminar 30 minutos al día parece poco. Pero a 10 años son 10.950 km — más que la distancia
            Madrid–Tokio. Lo pequeño × tiempo = enorme.
          </p>

          <h3>¿Por qué es tan difícil mantener un hábito?</h3>
          <p>
            El cerebro prioriza la recompensa inmediata sobre el beneficio futuro (descuento hiperbólico).
            Fumar un cigarrillo da placer ahora; el cáncer es abstracto y lejano. La solución: hacer
            el hábito bueno <strong>fácil e inmediato</strong> (dejar las zapatillas al lado de la cama)
            y el malo <strong>difícil e inconveniente</strong> (no tener tabaco en casa).
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de salud son orientativos y provienen de estudios
            epidemiológicos generales (OMS, estudios de cohortes). Los resultados individuales varían.
            Los datos económicos usan precios medios de España 2025.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-peso-decisiones')} />
        <ShareCard appName="visualizador-peso-decisiones" />
        <Footer appName="visualizador-peso-decisiones" />
      </div>
    </>
  );
}
