'use client';

import { useState, useMemo } from 'react';
import styles from './GeneradorHashtags.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

interface HashtagCategoria {
  nombre: string;
  icono: string;
  hashtags: string[];
}

const HASHTAGS_POR_NICHO: Record<string, HashtagCategoria[]> = {
  fitness: [
    { nombre: 'Generales', icono: '💪', hashtags: ['fitness', 'workout', 'gym', 'fit', 'fitnessmotivation', 'training', 'exercise', 'fitlife', 'healthylifestyle', 'gymlife'] },
    { nombre: 'Entrenamiento', icono: '🏋️', hashtags: ['legday', 'armday', 'chestday', 'backday', 'cardio', 'hiit', 'crossfit', 'bodybuilding', 'powerlifting', 'strengthtraining'] },
    { nombre: 'Nutrición', icono: '🥗', hashtags: ['healthyfood', 'mealprep', 'protein', 'cleaneating', 'nutrition', 'fitfood', 'healthyeating', 'macros', 'dietafitness', 'comidasaludable'] },
    { nombre: 'Motivación', icono: '🔥', hashtags: ['motivation', 'nevergiveup', 'nopainnogain', 'goals', 'fitspiration', 'gymmotivation', 'workoutmotivation', 'fitgoals', 'transformation', 'progress'] },
  ],
  viajes: [
    { nombre: 'Generales', icono: '✈️', hashtags: ['travel', 'wanderlust', 'travelphotography', 'travelgram', 'instatravel', 'traveling', 'travelblogger', 'explore', 'adventure', 'vacation'] },
    { nombre: 'Destinos', icono: '🗺️', hashtags: ['europe', 'asia', 'beach', 'mountains', 'cityscape', 'nature', 'island', 'roadtrip', 'backpacking', 'paradise'] },
    { nombre: 'España', icono: '🇪🇸', hashtags: ['españa', 'spain', 'visitspain', 'madrid', 'barcelona', 'sevilla', 'valencia', 'andalucia', 'mallorca', 'ibiza'] },
    { nombre: 'Fotografía', icono: '📸', hashtags: ['travelpics', 'travelphoto', 'landscapephotography', 'sunsetlovers', 'beautifuldestinations', 'passportready', 'doyoutravel', 'livetotravel', 'travelholic', 'traveladdict'] },
  ],
  comida: [
    { nombre: 'Generales', icono: '🍽️', hashtags: ['food', 'foodie', 'foodporn', 'instafood', 'yummy', 'delicious', 'foodphotography', 'homemade', 'cooking', 'chef'] },
    { nombre: 'Tipos', icono: '🍕', hashtags: ['pizza', 'pasta', 'sushi', 'burger', 'dessert', 'breakfast', 'brunch', 'dinner', 'healthyfood', 'vegan'] },
    { nombre: 'Español', icono: '🥘', hashtags: ['comidaespañola', 'tapas', 'paella', 'tortilla', 'jamón', 'gastronomia', 'cocinaespañola', 'recetas', 'cocinacastera', 'foodieespañol'] },
    { nombre: 'Técnicas', icono: '👨‍🍳', hashtags: ['recipeoftheday', 'homecooking', 'foodblogger', 'cookingathome', 'cheflife', 'foodlover', 'foodstagram', 'instayum', 'tasty', 'eeeeeats'] },
  ],
  moda: [
    { nombre: 'Generales', icono: '👗', hashtags: ['fashion', 'style', 'ootd', 'fashionblogger', 'outfit', 'instafashion', 'fashionista', 'streetstyle', 'fashionstyle', 'lookoftheday'] },
    { nombre: 'Ropa', icono: '👕', hashtags: ['dress', 'shoes', 'accessories', 'jewelry', 'handbag', 'sunglasses', 'sneakers', 'vintage', 'designer', 'luxury'] },
    { nombre: 'Tendencias', icono: '✨', hashtags: ['trending', 'newin', 'musthave', 'fashiontrends', 'styleinspo', 'outfitinspiration', 'whatiwore', 'currentlywearing', 'stylediaries', 'fashiondaily'] },
    { nombre: 'Español', icono: '🇪🇸', hashtags: ['modaespañola', 'estilismo', 'lookdeldia', 'tendencias', 'bloguera', 'influencerspain', 'styleoftheday', 'fashionspain', 'outfithoy', 'compras'] },
  ],
  negocios: [
    { nombre: 'Emprendimiento', icono: '💼', hashtags: ['entrepreneur', 'business', 'startup', 'success', 'motivation', 'hustle', 'mindset', 'goals', 'ambition', 'grind'] },
    { nombre: 'Marketing', icono: '📈', hashtags: ['marketing', 'digitalmarketing', 'socialmediamarketing', 'contentmarketing', 'branding', 'marketingtips', 'seo', 'growthhacking', 'onlinemarketing', 'marketingstrategy'] },
    { nombre: 'Productividad', icono: '⚡', hashtags: ['productivity', 'workfromhome', 'homeoffice', 'remotework', 'freelance', 'worklife', 'entrepreneurlife', 'businessowner', 'selfemployed', 'solopreneur'] },
    { nombre: 'Español', icono: '🇪🇸', hashtags: ['emprendedor', 'emprendimiento', 'negocio', 'pymes', 'autonomos', 'marketingdigital', 'ventas', 'liderazgo', 'exito', 'motivacion'] },
  ],
  tecnologia: [
    { nombre: 'Generales', icono: '💻', hashtags: ['tech', 'technology', 'innovation', 'gadgets', 'programming', 'coding', 'developer', 'software', 'ai', 'machinelearning'] },
    { nombre: 'Desarrollo', icono: '👨‍💻', hashtags: ['webdev', 'webdeveloper', 'frontend', 'backend', 'fullstack', 'javascript', 'python', 'react', 'nodejs', 'devlife'] },
    { nombre: 'Dispositivos', icono: '📱', hashtags: ['smartphone', 'iphone', 'android', 'apple', 'samsung', 'laptop', 'gaming', 'pcgaming', 'setup', 'techreview'] },
    { nombre: 'Español', icono: '🇪🇸', hashtags: ['tecnologia', 'programacion', 'desarrolloweb', 'desarrollador', 'informatica', 'ciberseguridad', 'inteligenciaartificial', 'appsmoviles', 'techspain', 'devspain'] },
  ],
  belleza: [
    { nombre: 'Maquillaje', icono: '💄', hashtags: ['makeup', 'beauty', 'makeupartist', 'mua', 'makeuplover', 'makeuptutorial', 'cosmetics', 'lipstick', 'eyeshadow', 'glam'] },
    { nombre: 'Skincare', icono: '✨', hashtags: ['skincare', 'skin', 'skincareroutine', 'glowingskin', 'selfcare', 'naturalbeauty', 'cleanbeauty', 'skincareproducts', 'healthyskin', 'beautytips'] },
    { nombre: 'Cabello', icono: '💇', hashtags: ['hair', 'hairstyle', 'haircut', 'haircolor', 'balayage', 'blonde', 'brunette', 'curlyhair', 'hairgoals', 'hairtransformation'] },
    { nombre: 'Español', icono: '🇪🇸', hashtags: ['maquillaje', 'belleza', 'cuidadodelapiel', 'cosmetica', 'tutorialmaquillaje', 'peluqueria', 'estetica', 'beautyblogger', 'makeupspain', 'bellezanatural'] },
  ],
  fotografia: [
    { nombre: 'Generales', icono: '📷', hashtags: ['photography', 'photooftheday', 'photographer', 'photo', 'instagood', 'picoftheday', 'photoshoot', 'canon', 'nikon', 'sony'] },
    { nombre: 'Estilos', icono: '🎨', hashtags: ['portrait', 'landscape', 'streetphotography', 'naturephotography', 'blackandwhite', 'minimal', 'architecture', 'sunset', 'golden hour', 'longexposure'] },
    { nombre: 'Técnica', icono: '🔧', hashtags: ['lightroom', 'photoshop', 'editing', 'rawphotography', '50mm', 'bokeh', 'dslr', 'mirrorless', 'composition', 'exposure'] },
    { nombre: 'Español', icono: '🇪🇸', hashtags: ['fotografia', 'fotografo', 'fotodeldia', 'retrato', 'paisaje', 'fotografiaespañola', 'instaspain', 'fotografiaurbana', 'naturaleza', 'atardecer'] },
  ],
};

const PLATAFORMAS = [
  { id: 'instagram', nombre: 'Instagram', icono: '📸', maxHashtags: 30, recomendado: '10-15' },
  { id: 'tiktok', nombre: 'TikTok', icono: '🎵', maxHashtags: 100, recomendado: '3-5' },
  { id: 'twitter', nombre: 'Twitter/X', icono: '🐦', maxHashtags: 280, recomendado: '1-3' },
  { id: 'linkedin', nombre: 'LinkedIn', icono: '💼', maxHashtags: 30, recomendado: '3-5' },
];

export default function GeneradorHashtagsPage() {
  const [nichoSeleccionado, setNichoSeleccionado] = useState('fitness');
  const [hashtagsSeleccionados, setHashtagsSeleccionados] = useState<Set<string>>(new Set());
  const [plataforma, setPlataforma] = useState('instagram');
  const [copiado, setCopiado] = useState(false);
  const [hashtagPersonalizado, setHashtagPersonalizado] = useState('');

  const categorias = HASHTAGS_POR_NICHO[nichoSeleccionado] || [];
  const plataformaActual = PLATAFORMAS.find(p => p.id === plataforma);

  const toggleHashtag = (hashtag: string) => {
    const nuevo = new Set(hashtagsSeleccionados);
    if (nuevo.has(hashtag)) {
      nuevo.delete(hashtag);
    } else {
      nuevo.add(hashtag);
    }
    setHashtagsSeleccionados(nuevo);
  };

  const seleccionarCategoria = (hashtags: string[]) => {
    const nuevo = new Set(hashtagsSeleccionados);
    hashtags.forEach(h => nuevo.add(h));
    setHashtagsSeleccionados(nuevo);
  };

  const limpiarSeleccion = () => {
    setHashtagsSeleccionados(new Set());
  };

  const añadirPersonalizado = () => {
    if (hashtagPersonalizado.trim()) {
      const limpio = hashtagPersonalizado.trim().replace(/^#/, '').replace(/\s+/g, '');
      if (limpio) {
        const nuevo = new Set(hashtagsSeleccionados);
        nuevo.add(limpio);
        setHashtagsSeleccionados(nuevo);
        setHashtagPersonalizado('');
      }
    }
  };

  const hashtagsFormateados = useMemo(() => {
    return Array.from(hashtagsSeleccionados).map(h => `#${h}`).join(' ');
  }, [hashtagsSeleccionados]);

  const copiarHashtags = async () => {
    try {
      await navigator.clipboard.writeText(hashtagsFormateados);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = hashtagsFormateados;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>#️⃣ Generador de Hashtags</h1>
        <p className={styles.subtitle}>
          Encuentra los mejores hashtags para Instagram, TikTok, Twitter y LinkedIn
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="generador-hashtags-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de selección */}
        <div className={styles.selectorPanel}>
          {/* Selector de plataforma */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📱 Plataforma</h3>
            <div className={styles.platformGrid}>
              {PLATAFORMAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlataforma(p.id)}
                  className={`${styles.platformBtn} ${plataforma === p.id ? styles.active : ''}`}
                >
                  <span className={styles.platformIcon}>{p.icono}</span>
                  <span className={styles.platformName}>{p.nombre}</span>
                  <span className={styles.platformTip}>{p.recomendado} hashtags</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de nicho */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🎯 Nicho / Temática</h3>
            <div className={styles.nichoGrid}>
              {Object.keys(HASHTAGS_POR_NICHO).map(nicho => (
                <button
                  key={nicho}
                  onClick={() => setNichoSeleccionado(nicho)}
                  className={`${styles.nichoBtn} ${nichoSeleccionado === nicho ? styles.active : ''}`}
                >
                  {nicho.charAt(0).toUpperCase() + nicho.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Hashtag personalizado */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>✏️ Añadir personalizado</h3>
            <div className={styles.customInput}>
              <input
                type="text"
                value={hashtagPersonalizado}
                onChange={(e) => setHashtagPersonalizado(e.target.value)}
                placeholder="tuhashtag"
                className={styles.input}
                onKeyDown={(e) => e.key === 'Enter' && añadirPersonalizado()}
              />
              <button onClick={añadirPersonalizado} className={styles.addBtn}>
                Añadir
              </button>
            </div>
          </div>
        </div>

        {/* Panel de hashtags */}
        <div className={styles.hashtagsPanel}>
          <div className={styles.categoriesContainer}>
            {categorias.map(cat => (
              <div key={cat.nombre} className={styles.categoryBlock}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryIcon}>{cat.icono}</span>
                  <span className={styles.categoryName}>{cat.nombre}</span>
                  <button
                    onClick={() => seleccionarCategoria(cat.hashtags)}
                    className={styles.selectAllBtn}
                  >
                    + Todos
                  </button>
                </div>
                <div className={styles.hashtagsList}>
                  {cat.hashtags.map(h => (
                    <button
                      key={h}
                      onClick={() => toggleHashtag(h)}
                      className={`${styles.hashtagBtn} ${hashtagsSeleccionados.has(h) ? styles.selected : ''}`}
                    >
                      #{h}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de resultado */}
        <div className={styles.resultPanel}>
          <div className={styles.resultHeader}>
            <h3 className={styles.resultTitle}>
              📋 Tu selección ({hashtagsSeleccionados.size})
            </h3>
            {hashtagsSeleccionados.size > 0 && (
              <button onClick={limpiarSeleccion} className={styles.clearBtn}>
                Limpiar
              </button>
            )}
          </div>

          {hashtagsSeleccionados.size > 0 ? (
            <>
              <div className={styles.selectedHashtags}>
                {Array.from(hashtagsSeleccionados).map(h => (
                  <span
                    key={h}
                    className={styles.selectedTag}
                    onClick={() => toggleHashtag(h)}
                  >
                    #{h} ×
                  </span>
                ))}
              </div>

              <div className={styles.previewBox}>
                <div className={styles.previewText}>{hashtagsFormateados}</div>
              </div>

              <div className={styles.resultActions}>
                <button onClick={copiarHashtags} className={styles.copyBtn}>
                  {copiado ? '✅ ¡Copiados!' : '📋 Copiar todos'}
                </button>
              </div>

              {plataformaActual && hashtagsSeleccionados.size > parseInt(plataformaActual.recomendado.split('-')[1]) && (
                <div className={styles.warning}>
                  ⚠️ Para {plataformaActual.nombre} se recomiendan {plataformaActual.recomendado} hashtags.
                  Tienes {hashtagsSeleccionados.size}.
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>👆</span>
              <p>Selecciona hashtags haciendo clic sobre ellos</p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 Guía de Hashtags para Redes Sociales"
        subtitle="Estrategia por plataforma, casos de uso y errores a evitar"
        defaultOpen={false}
      >
        <div className={styles.eduComparativa}>
          <h2>Estrategia de hashtags por plataforma</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr><th>Plataforma</th><th>Cantidad óptima</th><th>Tamaño ideal</th><th>Dónde ponerlos</th><th>Estrategia recomendada</th></tr>
              </thead>
              <tbody>
                <tr><td>Instagram</td><td>5–15 (máx. 30)</td><td>Mixto: nicho + medio + popular</td><td>Caption o primer comentario</td><td>3 grandes + 5 medianos + 7 nicho</td></tr>
                <tr><td>TikTok</td><td>3–8</td><td>Trending + nicho específico</td><td>Caption (primeras palabras)</td><td>1–2 trending + 2–3 nicho + #FYP</td></tr>
                <tr><td>Twitter / X</td><td>1–3</td><td>Cortos y precisos</td><td>Integrados en el texto</td><td>1 trending + 1 nicho temático</td></tr>
                <tr><td>LinkedIn</td><td>3–7</td><td>Profesionales y específicos</td><td>Al final del post</td><td>Sector + habilidad + tendencia</td></tr>
                <tr><td>YouTube</td><td>3–5 en descripción</td><td>Descriptivos y de búsqueda</td><td>Primeras líneas de descripción</td><td>Coinciden con keywords de SEO del video</td></tr>
                <tr><td>Pinterest</td><td>2–5</td><td>Descriptivos, basados en búsqueda</td><td>Descripción del pin</td><td>Palabras clave de búsqueda, no trending</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.eduEscenarios}>
          <h2>Estrategias reales por tipo de cuenta</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🍕</span><h3>Restaurante local</h3></div>
              <p className={styles.escenarioExample}>Mezcla hashtags geolocalizados (#RestaurantesMadrid, #ComidaMadrid), de nicho (#PizzaArtesanal, #CocinaItaliana) y de descubrimiento (#FoodieSpain). Evita hashtags genéricos como #food (2B+ publicaciones = invisible).</p>
              <span className={styles.escenarioTip}>Geolocalización + nicho = audiencia local cualificada</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>💄</span><h3>Influencer de belleza</h3></div>
              <p className={styles.escenarioExample}>Combina: 3 hashtags de marca propia (#[TuNombre]Beauty), 5 de nicho (#MaquillajeNatural, #SkincareEspaña), 4 de tendencia (#GRWM, #MakeupTutorial) y 2 de comunidad (#BeautyBloggerES). Rota semanalmente.</p>
              <span className={styles.escenarioTip}>Rotación semanal evita penalización por spam</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏋️</span><h3>Entrenador personal</h3></div>
              <p className={styles.escenarioExample}>Hashtags de servicio (#EntrenadorPersonalMadrid), de contenido (#EjerciciosEnCasa, #RutinaFuerza), de comunidad (#FitnessEspaña, #VidaSaludable) y trending de fitness. LinkedIn: #Fitness #Entrenamiento #BienestarLaboral.</p>
              <span className={styles.escenarioTip}>Servicio + ubicación + contenido = captación local</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>💻</span><h3>Freelance / Desarrollador</h3></div>
              <p className={styles.escenarioExample}>LinkedIn es la plataforma clave: #DesarrolloWeb, #JavaScript, #ReactJS, #Freelance, #TechSpain. Twitter/X: hashtags de comunidad (#100DaysOfCode, #DevTwitter). Instagram: menos relevante para B2B tech.</p>
              <span className={styles.escenarioTip}>LinkedIn + Twitter = las plataformas para tech</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🎨</span><h3>Artista / Ilustrador</h3></div>
              <p className={styles.escenarioExample}>Instagram es el escaparate clave. Mezcla: #IlustraciónEspañola, #ArteDigital, #IllustrationArt (inglés para alcance global), #ArtistOnInstagram, #DrawingOfTheDay. Pinterest: keywords de búsqueda visuales (#IlustracionDigital).</p>
              <span className={styles.escenarioTip}>Incluye hashtags en inglés para alcance global</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏠</span><h3>Agencia inmobiliaria</h3></div>
              <p className={styles.escenarioExample}>Geolocalización es esencial: #InmobiliariaBarcelona, #PisosEnVenta[Ciudad], #AlquilerMadrid. Contenido: #TipsInmobiliarios, #ComprarPiso, #InversionInmobiliaria. LinkedIn: #MercadoInmobiliario, #PropTech.</p>
              <span className={styles.escenarioTip}>Sin geolocalización, el inmobiliario no funciona</span>
            </div>
          </div>
        </div>

        <div className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre hashtags</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}><h4>¿Cuántos hashtags debo usar en Instagram?</h4><p>La recomendación actual de Instagram (2024) es usar entre 3 y 5 hashtags muy relevantes. Estudios internos de Instagram sugieren que más hashtags no implica más alcance. Sin embargo, muchas cuentas siguen obteniendo buenos resultados con 10–15. Prueba ambas estrategias con tu audiencia.</p></div>
            <div className={styles.faqItem}><h4>¿Los hashtags funcionan en 2025?</h4><p>Sí, pero de forma diferente. Instagram y TikTok han evolucionado hacia algoritmos de recomendación por contenido (similar a YouTube). Los hashtags ayudan a categorizar el contenido para el algoritmo, pero el alcance depende más del engagement que del volumen de hashtags. Son una señal de contexto, no un motor de alcance.</p></div>
            <div className={styles.faqItem}><h4>¿Debo poner los hashtags en el caption o en los comentarios?</h4><p>Ambas opciones funcionan igual en términos de alcance según Instagram. En el caption son inmediatos; en el primer comentario mantienen el caption más limpio. La elección es estética. En TikTok y LinkedIn, siempre en el caption.</p></div>
            <div className={styles.faqItem}><h4>¿Qué es un hashtag shadowbanned?</h4><p>Algunos hashtags son penalizados por Instagram por haberse usado para contenido inapropiado. Los posts con estos hashtags no aparecen en la página de exploración del hashtag. Puedes verificarlo buscando el hashtag: si el tab &quot;recientes&quot; está oculto, está shadowbanned. Evita usarlos aunque parezcan inocuos.</p></div>
            <div className={styles.faqItem}><h4>¿Hashtags en español o en inglés?</h4><p>Depende de tu audiencia objetivo. Si tu negocio es local (España/LATAM), prioriza español. Si quieres alcance internacional o vendes digitalmente, mezcla ambos. Muchos nichos (fitness, moda, arte) tienen comunidades más grandes en inglés aunque tu audiencia sea hispanohablante.</p></div>
            <div className={styles.faqItem}><h4>¿Debo crear un hashtag de marca propio?</h4><p>Sí, si tienes una comunidad o campaña. Un hashtag de marca (#[TuNegocio] o #[TuCampaña]) permite agrupar contenido generado por usuarios (UGC), hacer seguimiento de menciones y construir comunidad. Empieza a usarlo desde el primer post y anima a tu audiencia a adoptarlo.</p></div>
            <div className={styles.faqItem}><h4>¿Roto o siempre los mismos hashtags?</h4><p>Rotar es mejor. Usar siempre exactamente los mismos hashtags puede ser interpretado como comportamiento spam por los algoritmos. Crea 3–5 grupos de hashtags diferentes y rótarlos. Así también puedes medir qué grupos tienen mejor rendimiento para tu cuenta.</p></div>
            <div className={styles.faqItem}><h4>¿Cómo mido si mis hashtags funcionan?</h4><p>En Instagram: Insights del post → impresiones desde hashtags. Si los hashtags aportan menos del 5% de las impresiones, están sobredimensionados. En TikTok: Analytics de video → fuentes de tráfico. Experimenta cambiando hashtags y compara el alcance entre publicaciones similares.</p></div>
          </div>
        </div>

        <div className={styles.eduGuia}>
          <h2>Cómo crear tu estrategia de hashtags en 7 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.eduStep}><div className={styles.stepNumber}>1</div><div className={styles.stepContent}><strong>Define tu nicho y audiencia objetivo</strong><p>Antes de buscar hashtags, define: ¿a quién le hablas? ¿Qué problema resuelves? Los hashtags deben conectar tu contenido con personas que buscan exactamente lo que ofreces, no con el mayor número posible de personas.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>2</div><div className={styles.stepContent}><strong>Investiga los hashtags de tu competencia</strong><p>Analiza las 5–10 cuentas más exitosas de tu nicho. ¿Qué hashtags usan en sus posts con más engagement? Ese es tu punto de partida. No copies exactamente — adapta a tu especificidad y audiencia local.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>3</div><div className={styles.stepContent}><strong>Clasifica por tamaño de audiencia</strong><p>Divide en tres grupos: grandes (&gt;1M posts) para visibilidad, medianos (100K–1M) para competencia media, pequeños/nicho (&lt;100K) donde puedes destacar más fácilmente. Una buena estrategia mezcla los tres niveles.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>4</div><div className={styles.stepContent}><strong>Crea entre 3 y 5 grupos de hashtags</strong><p>Agrupa hashtags por temática o tipo de contenido. Grupo A para contenido educativo, Grupo B para detrás de cámaras, Grupo C para productos, etc. Rota entre grupos para evitar penalización por spam.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>5</div><div className={styles.stepContent}><strong>Verifica que no estén shadowbanned</strong><p>Busca cada hashtag en la app. Si el tab &quot;recientes&quot; no aparece o muestra muy pocas publicaciones recientes, el hashtag puede estar penalizado. Elimínalo de tu lista antes de usarlo.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>6</div><div className={styles.stepContent}><strong>Publica y mide durante 30 días</strong><p>Usa los mismos grupos de forma consistente durante un mes. Registra las impresiones por hashtag en cada post. Al mes, identifica qué grupos traen más alcance y cuáles no aportan nada.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>7</div><div className={styles.stepContent}><strong>Optimiza y actualiza trimestralmente</strong><p>Los hashtags trending cambian. Lo que funcionaba hace 6 meses puede estar saturado hoy. Revisa y actualiza tu lista cada 3 meses, incorporando nuevos hashtags emergentes en tu nicho y retirando los que han perdido efectividad.</p></div></div>
          </div>
        </div>

        <div className={styles.eduTips}>
          <h2>Trucos para hashtags más efectivos</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🎯</span><strong>Relevancia &gt; volumen</strong><p>Un hashtag de nicho con 50K publicaciones donde puedes aparecer en &quot;recientes&quot; es más valioso que uno con 50M donde te pierdes en segundos.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>📍</span><strong>Geolocaliza siempre si eres local</strong><p>Para negocios locales (restaurantes, clínicas, tiendas), los hashtags geolocalizados (#[Servicio][Ciudad]) atraen audiencia que puede convertirse en cliente real.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🔄</span><strong>Rota tus grupos</strong><p>Guarda 3–5 grupos de hashtags en notas. Alterna entre ellos en cada publicación. Evita usar exactamente los mismos hashtags en todos los posts.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>📊</span><strong>Mide siempre</strong><p>Activa los insights de cada post a las 48h. Si los hashtags aportan menos del 10% de las impresiones, necesitas cambiar de estrategia.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🌍</span><strong>Mezcla idiomas según objetivo</strong><p>Español para audiencia local, inglés para alcance global. En nichos como tecnología, moda o arte, los hashtags en inglés tienen comunidades mucho más grandes.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🏷️</span><strong>Crea tu hashtag de marca</strong><p>Desde el primer post, usa un hashtag propio único (#MiMarca o #MiCampaña). Facilita encontrar UGC, agrupar contenido y construir comunidad propia.</p></div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores que reducen el alcance de tus hashtags</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Usar siempre los mismos 30 hashtags en cada post — puede interpretarse como spam y reduce el alcance orgánico</li>
            <li>Elegir solo hashtags masivos (#love, #photo, #food) — tienen millones de publicaciones y tu contenido desaparece en segundos</li>
            <li>No verificar si el hashtag está shadowbanned — un hashtag penalizado oculta tu post en la página de exploración</li>
            <li>Ignorar la relevancia del hashtag para el contenido — Instagram penaliza cuando el contexto del post no coincide con los hashtags usados</li>
            <li>No usar hashtags geolocalizados en negocios locales — es la forma más directa de llegar a clientes potenciales de tu zona</li>
            <li>Copiar exactamente los hashtags de la competencia sin adaptar — lo que funciona para una cuenta con 100K seguidores no funciona igual para una con 1K</li>
            <li>No medir el rendimiento de los hashtags — sin datos, es imposible saber si tu estrategia funciona o necesita ajustes</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-hashtags')} />

      <ShareCard appName="generador-hashtags" />
      <Footer appName="generador-hashtags" />
    </div>
  );
}
