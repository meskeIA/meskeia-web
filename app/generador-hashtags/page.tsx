'use client';

import { useState, useMemo } from 'react';
import styles from './GeneradorHashtags.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice } from '@/components';
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
        subtitle="Maximiza tu alcance con la estrategia correcta de hashtags"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>¿Cuántos hashtags usar?</h2>
            <div className={styles.platformGuide}>
              <div className={styles.platformCard}>
                <h4>📸 Instagram</h4>
                <p><strong>Máximo:</strong> 30 hashtags</p>
                <p><strong>Recomendado:</strong> 10-15 hashtags</p>
                <p>Mezcla populares + nicho + específicos</p>
              </div>
              <div className={styles.platformCard}>
                <h4>🎵 TikTok</h4>
                <p><strong>Máximo:</strong> Sin límite estricto</p>
                <p><strong>Recomendado:</strong> 3-5 hashtags</p>
                <p>Usa trending + relevantes a tu contenido</p>
              </div>
              <div className={styles.platformCard}>
                <h4>🐦 Twitter/X</h4>
                <p><strong>Máximo:</strong> Límite de 280 caracteres</p>
                <p><strong>Recomendado:</strong> 1-3 hashtags</p>
                <p>Menos es más, solo los esenciales</p>
              </div>
              <div className={styles.platformCard}>
                <h4>💼 LinkedIn</h4>
                <p><strong>Máximo:</strong> 30 hashtags</p>
                <p><strong>Recomendado:</strong> 3-5 hashtags</p>
                <p>Profesionales y relevantes al sector</p>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Estrategia de hashtags efectiva</h2>
            <ul className={styles.tipsList}>
              <li><strong>Mezcla tamaños:</strong> Combina hashtags populares (+1M), medianos (10K-1M) y de nicho (-10K)</li>
              <li><strong>Relevancia ante todo:</strong> Usa solo hashtags relacionados con tu contenido real</li>
              <li><strong>Investiga la competencia:</strong> Mira qué hashtags usan cuentas similares exitosas</li>
              <li><strong>Crea el tuyo:</strong> Un hashtag de marca único ayuda a construir comunidad</li>
              <li><strong>Rota hashtags:</strong> No uses siempre los mismos, Instagram puede penalizarte</li>
              <li><strong>Colócalos al final:</strong> Mejor en el primer comentario (Instagram) o al final del caption</li>
            </ul>
          </section>

          <section className={styles.eduSection}>
            <h2>Errores comunes a evitar</h2>
            <div className={styles.errorsGrid}>
              <div className={styles.errorCard}>
                <span className={styles.errorIcon}>❌</span>
                <p>Usar hashtags baneados por la plataforma</p>
              </div>
              <div className={styles.errorCard}>
                <span className={styles.errorIcon}>❌</span>
                <p>Hashtags irrelevantes solo por ser populares</p>
              </div>
              <div className={styles.errorCard}>
                <span className={styles.errorIcon}>❌</span>
                <p>Repetir exactamente los mismos en cada post</p>
              </div>
              <div className={styles.errorCard}>
                <span className={styles.errorIcon}>❌</span>
                <p>Usar solo hashtags muy competidos (+10M)</p>
              </div>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-hashtags')} />

      <Footer appName="generador-hashtags" />
    </div>
  );
}
