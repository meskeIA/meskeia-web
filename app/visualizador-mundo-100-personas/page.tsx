'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorMundo100Personas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Datos: el mundo en 100 personas
// Fuentes: ONU, Banco Mundial, UNESCO, OMS, ITU (~2023-2024)
// ─────────────────────────────────────────────

interface Categoria {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  datos: Dato[];
}

interface Dato {
  etiqueta: string;
  valor: number; // de 100
  icono: string;
  detalle: string;
}

const CATEGORIAS: Categoria[] = [
  {
    id: 'geografia',
    nombre: 'Dónde viven',
    icono: '🌍',
    color: '#2E86AB',
    datos: [
      { etiqueta: 'Viven en Asia', valor: 59, icono: '🌏', detalle: 'Asia alberga el 59% de la humanidad. Solo China e India suman 35 de cada 100.' },
      { etiqueta: 'Viven en África', valor: 18, icono: '🌍', detalle: 'África es el continente que más crece: en 2050 serán 25 de cada 100.' },
      { etiqueta: 'Viven en Europa', valor: 9, icono: '🌍', detalle: 'Europa representaba 22 de cada 100 en 1950. Hoy solo 9, y bajando.' },
      { etiqueta: 'Viven en América', valor: 13, icono: '🌎', detalle: '8 en América Latina y Caribe, 5 en Norteamérica.' },
      { etiqueta: 'Viven en Oceanía', valor: 1, icono: '🏝️', detalle: 'Australia, Nueva Zelanda y las islas del Pacífico: solo 1 de 100.' },
    ],
  },
  {
    id: 'agua',
    nombre: 'Agua y saneamiento',
    icono: '💧',
    color: '#48A9A6',
    datos: [
      { etiqueta: 'Tienen agua potable segura', valor: 74, icono: '🚰', detalle: '74 tienen acceso a agua gestionada de forma segura. Los 26 restantes dependen de fuentes no seguras o comparten con animales.' },
      { etiqueta: 'Tienen saneamiento básico', valor: 78, icono: '🚽', detalle: '22 de cada 100 personas no tienen un retrete digno. 6 de ellas defecan al aire libre.' },
      { etiqueta: 'Se lavan las manos con jabón', valor: 71, icono: '🧼', detalle: '29 personas no tienen acceso a un lavamanos con agua y jabón en su hogar.' },
    ],
  },
  {
    id: 'educacion',
    nombre: 'Educación',
    icono: '🎓',
    color: '#9b59b6',
    datos: [
      { etiqueta: 'Saben leer y escribir', valor: 87, icono: '📖', detalle: '13 personas son analfabetas. Dos tercios de ellas son mujeres.' },
      { etiqueta: 'Han completado educación secundaria', valor: 66, icono: '🏫', detalle: '34 nunca terminaron la secundaria. En África subsahariana, solo 30 de cada 100 la completan.' },
      { etiqueta: 'Tienen título universitario', valor: 7, icono: '🎓', detalle: 'Solo 7 de cada 100 personas en el mundo tienen un título universitario.' },
    ],
  },
  {
    id: 'tecnologia',
    nombre: 'Tecnología',
    icono: '📱',
    color: '#e67e22',
    datos: [
      { etiqueta: 'Tienen smartphone', valor: 55, icono: '📱', detalle: '45 personas no tienen un smartphone. Muchos usan móviles básicos (solo llamadas/SMS).' },
      { etiqueta: 'Usan internet', valor: 67, icono: '🌐', detalle: '33 nunca han usado internet. La brecha digital sigue siendo enorme entre países ricos y pobres.' },
      { etiqueta: 'Tienen ordenador en casa', valor: 40, icono: '💻', detalle: '60 personas no tienen ordenador propio. Muchos acceden a internet solo desde el móvil o cibercafés.' },
      { etiqueta: 'Tienen cuenta bancaria', valor: 76, icono: '🏦', detalle: '24 personas están fuera del sistema financiero formal. Cobran y pagan solo en efectivo.' },
    ],
  },
  {
    id: 'riqueza',
    nombre: 'Riqueza',
    icono: '💰',
    color: '#e74c3c',
    datos: [
      { etiqueta: 'Viven con menos de 6,85 $/día', valor: 44, icono: '💸', detalle: '44 personas viven con menos de 6,85 $ al día (umbral de pobreza del Banco Mundial para países de renta media-alta). 10 viven con menos de 2,15 $/día.' },
      { etiqueta: 'La persona más rica posee tanto como las 50 más pobres', valor: 1, icono: '👑', detalle: 'El 1% más rico posee el 46% de la riqueza mundial. Los 50 más pobres, juntos, poseen menos del 1%.' },
      { etiqueta: 'Tienen empleo formal', valor: 55, icono: '💼', detalle: '45 trabajan en la economía informal: sin contrato, sin protección social, sin derechos laborales.' },
    ],
  },
  {
    id: 'salud',
    nombre: 'Salud',
    icono: '🏥',
    color: '#27ae60',
    datos: [
      { etiqueta: 'Tienen acceso a atención médica básica', valor: 55, icono: '👨‍⚕️', detalle: '45 personas no pueden acceder a servicios sanitarios esenciales cuando los necesitan.' },
      { etiqueta: 'Están vacunados (cobertura básica)', valor: 84, icono: '💉', detalle: '16 niños no reciben las vacunas básicas del calendario infantil.' },
      { etiqueta: 'Tienen sobrepeso u obesidad', valor: 39, icono: '⚖️', detalle: 'Paradoja global: 39 tienen sobrepeso mientras 11 están desnutridos. Ambos problemas coexisten.' },
      { etiqueta: 'Padecen depresión o ansiedad', valor: 15, icono: '🧠', detalle: '15 personas sufren algún trastorno de salud mental. Solo 2 de ellas reciben tratamiento adecuado.' },
    ],
  },
  {
    id: 'alimentacion',
    nombre: 'Alimentación',
    icono: '🍽️',
    color: '#f39c12',
    datos: [
      { etiqueta: 'Tienen suficiente comida', valor: 89, icono: '🍎', detalle: '11 personas pasan hambre crónica. 735 millones de personas reales no saben si comerán mañana.' },
      { etiqueta: 'Tienen acceso a agua potable y comida segura', valor: 70, icono: '✅', detalle: '30 personas consumen agua o alimentos contaminados regularmente, causando enfermedades prevenibles.' },
      { etiqueta: 'Son vegetarianos o veganos', valor: 8, icono: '🥬', detalle: 'Principalmente en India (tradición cultural/religiosa). En Occidente la cifra es ~2-3 de cada 100.' },
    ],
  },
  {
    id: 'energia',
    nombre: 'Energía y vivienda',
    icono: '🏠',
    color: '#34495e',
    datos: [
      { etiqueta: 'Tienen electricidad en casa', valor: 91, icono: '💡', detalle: '9 personas viven sin electricidad. La mayoría en África subsahariana y partes de Asia.' },
      { etiqueta: 'Cocinan con combustibles limpios', valor: 68, icono: '🔥', detalle: '32 cocinan con leña, carbón o estiércol. Esto causa 3,2 millones de muertes prematuras al año por contaminación interior.' },
      { etiqueta: 'Viven en ciudades', valor: 57, icono: '🏙️', detalle: 'Por primera vez en la historia, más de la mitad de la humanidad es urbana. En 2050 serán 68.' },
    ],
  },
];

// ─────────────────────────────────────────────
// Componente de barras de personas
// ─────────────────────────────────────────────

function BarraPersonas({ valor, color }: { valor: number; color: string }) {
  const personas = Array.from({ length: 100 }, (_, i) => i < valor);
  return (
    <div className={styles.barraPersonas} aria-label={`${valor} de 100 personas`}>
      {personas.map((activa, i) => (
        <div
          key={i}
          className={`${styles.persona} ${activa ? styles.personaActiva : ''}`}
          style={activa ? { backgroundColor: color } : undefined}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMundo100PersonasPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<string>(CATEGORIAS[0].id);
  const [datoActivo, setDatoActivo] = useState<number | null>(null);

  const categoria = CATEGORIAS.find(c => c.id === categoriaActiva)!;

  const cambiarCategoria = (id: string) => {
    setCategoriaActiva(id);
    setDatoActivo(null);
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Mundo en 100 Personas</h1>
          <p className={styles.subtitle}>Si los 8.000 millones de habitantes fueran un pueblo de 100 — ¿cómo sería?</p>
        </header>

        <LegalNotice />

        {/* Navegación categorías */}
        <div className={styles.catNav}>
          {CATEGORIAS.map(c => (
            <button
              key={c.id}
              type="button"
              className={`${styles.catBtn} ${categoriaActiva === c.id ? styles.catActiva : ''}`}
              onClick={() => cambiarCategoria(c.id)}
              style={{ borderColor: categoriaActiva === c.id ? c.color : undefined }}
              aria-pressed={categoriaActiva === c.id}
            >
              <span aria-hidden="true">{c.icono}</span>
              <span className={styles.catBtnTexto}>{c.nombre}</span>
            </button>
          ))}
        </div>

        {/* Datos de la categoría */}
        <div className={styles.datosLista}>
          {categoria.datos.map((d, i) => (
            <div key={i} className={styles.datoWrapper}>
              <button
                type="button"
                className={`${styles.datoBtn} ${datoActivo === i ? styles.datoActivo : ''}`}
                onClick={() => setDatoActivo(prev => prev === i ? null : i)}
                aria-expanded={datoActivo === i}
              >
                <div className={styles.datoHeader}>
                  <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
                  <span className={styles.datoEtiqueta}>{d.etiqueta}</span>
                  <span className={styles.datoValor} style={{ color: categoria.color }}>
                    {d.valor} de 100
                  </span>
                </div>
                <BarraPersonas valor={d.valor} color={categoria.color} />
              </button>
              {datoActivo === i && (
                <div className={styles.datoDetalle} style={{ borderLeftColor: categoria.color }}>
                  <p>{d.detalle}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.insight}>
          <p>
            Cuando los números se cuentan en miles de millones, perdemos la perspectiva. Reducirlos a 100
            personas los hace <strong>humanos y comprensibles</strong>. Ese &quot;11&quot; que pasa hambre
            no es una estadística — son 735 millones de personas reales.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más perspectiva → <a href="/visualizador-peso-numeros/">El Peso de los Números</a> · <a href="/visualizador-escalas-tiempo/">Cuánto Tarda el Mundo</a>
        </div>

        <EducationalSection
          title="Lo que estos números revelan"
          subtitle="Contexto para entender el mundo"
          defaultOpen={false}
        >
          <h3>El progreso es real, pero desigual</h3>
          <p>
            En 1990, 36 de cada 100 personas vivían en pobreza extrema. Hoy son 10. La mortalidad
            infantil se ha reducido a la mitad. La alfabetización ha pasado del 76% al 87%. El mundo
            mejora — pero no para todos al mismo ritmo.
          </p>

          <h3>La brecha digital define el siglo XXI</h3>
          <p>
            33 de cada 100 personas nunca han usado internet. En los países ricos, internet es como
            el aire. En los pobres, es un lujo. Esta brecha no es solo tecnológica — es educativa,
            económica y democrática. Quien no tiene internet, no tiene voz en el mundo digital.
          </p>

          <h3>España en perspectiva</h3>
          <p>
            Si vives en España, tienes agua potable, electricidad, smartphone, educación secundaria
            y acceso a sanidad pública. Eso te sitúa por encima del 60-70% de la humanidad en la
            mayoría de indicadores. No es mérito propio — es el accidente geográfico de nacer aquí.
          </p>

          <div className={styles.warningBox}>
            <strong>Fuentes:</strong> datos aproximados basados en informes de ONU, Banco Mundial,
            UNESCO, OMS, ITU y Our World in Data (2023-2024). Los valores se redondean a números
            enteros para la visualización de 100 personas.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-mundo-100-personas')} />
        <ShareCard appName="visualizador-mundo-100-personas" />
        <Footer appName="visualizador-mundo-100-personas" />
    </div>
  );
}
