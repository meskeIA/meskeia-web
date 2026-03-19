'use client';

import { useState, useCallback } from 'react';
import styles from './GeneradorNombresEmpresa.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Diccionarios por sector
const diccionarios = {
  tecnologia: {
    prefijos: ['Tech', 'Digi', 'Cyber', 'Smart', 'Net', 'Cloud', 'Data', 'Soft', 'App', 'Web', 'Code', 'Bit', 'Pixel', 'Logic', 'Sync'],
    sufijos: ['Lab', 'Hub', 'Works', 'Systems', 'Solutions', 'Tech', 'Digital', 'Soft', 'Net', 'Cloud', 'AI', 'Dev', 'Core', 'Wave', 'Byte'],
    palabras: ['Nova', 'Pulse', 'Flux', 'Apex', 'Quantum', 'Vector', 'Nexus', 'Vertex', 'Cipher', 'Matrix', 'Atlas', 'Orbit', 'Spark', 'Fusion', 'Prism']
  },
  salud: {
    prefijos: ['Vita', 'Sana', 'Medi', 'Bio', 'Health', 'Care', 'Life', 'Well', 'Pure', 'Natural', 'Zen', 'Heal', 'Nutri', 'Physio', 'Mind'],
    sufijos: ['Salud', 'Vida', 'Care', 'Med', 'Health', 'Clinic', 'Wellness', 'Plus', 'Pro', 'Lab', 'Center', 'Life', 'Balance', 'Fit', 'Vitality'],
    palabras: ['Armonía', 'Equilibrio', 'Vitalidad', 'Serenidad', 'Bienestar', 'Energía', 'Salud', 'Vida', 'Balance', 'Vigor', 'Fuerza', 'Paz', 'Calma', 'Natura', 'Luz']
  },
  finanzas: {
    prefijos: ['Fin', 'Capital', 'Wealth', 'Invest', 'Money', 'Cash', 'Gold', 'Prime', 'Elite', 'Pro', 'Trust', 'Secure', 'Safe', 'Smart', 'Value'],
    sufijos: ['Capital', 'Finance', 'Invest', 'Partners', 'Group', 'Advisors', 'Wealth', 'Assets', 'Fund', 'Trust', 'Bank', 'Holdings', 'Ventures', 'Solutions', 'Pro'],
    palabras: ['Prosperidad', 'Crecimiento', 'Éxito', 'Fortuna', 'Patrimonio', 'Riqueza', 'Ahorro', 'Inversión', 'Capital', 'Valor', 'Confianza', 'Seguridad', 'Futuro', 'Meta', 'Logro']
  },
  creatividad: {
    prefijos: ['Art', 'Crea', 'Design', 'Visual', 'Brand', 'Media', 'Studio', 'Color', 'Image', 'Pixel', 'Dream', 'Idea', 'Vision', 'Craft', 'Canvas'],
    sufijos: ['Studio', 'Creative', 'Design', 'Media', 'Arts', 'Works', 'Lab', 'House', 'Agency', 'Group', 'Collective', 'Factory', 'Makers', 'Vision', 'Hub'],
    palabras: ['Inspiración', 'Creatividad', 'Arte', 'Diseño', 'Visión', 'Imaginación', 'Color', 'Forma', 'Estilo', 'Concepto', 'Idea', 'Sueño', 'Magia', 'Chispa', 'Brillo']
  },
  ecommerce: {
    prefijos: ['Shop', 'Buy', 'Store', 'Market', 'Deal', 'Quick', 'Easy', 'Fast', 'Smart', 'Best', 'Top', 'Prime', 'Super', 'Mega', 'Click'],
    sufijos: ['Store', 'Shop', 'Market', 'Hub', 'Mall', 'Direct', 'Express', 'Online', 'Box', 'Cart', 'Deals', 'Finds', 'Zone', 'Place', 'World'],
    palabras: ['Compra', 'Oferta', 'Ahorro', 'Calidad', 'Precio', 'Variedad', 'Selección', 'Entrega', 'Servicio', 'Confianza', 'Satisfacción', 'Comodidad', 'Rapidez', 'Elección', 'Valor']
  },
  alimentacion: {
    prefijos: ['Fresh', 'Tasty', 'Delish', 'Yummy', 'Gourmet', 'Chef', 'Food', 'Sabor', 'Dulce', 'Rico', 'Organic', 'Natural', 'Farm', 'Home', 'Green'],
    sufijos: ['Foods', 'Kitchen', 'Table', 'Bites', 'Eats', 'Gourmet', 'Delights', 'Treats', 'Feast', 'Flavors', 'Cuisine', 'Chef', 'Farm', 'Garden', 'Harvest'],
    palabras: ['Sabor', 'Delicia', 'Gusto', 'Aroma', 'Receta', 'Tradición', 'Frescura', 'Calidad', 'Natural', 'Casero', 'Artesano', 'Genuino', 'Auténtico', 'Puro', 'Sano']
  },
  educacion: {
    prefijos: ['Edu', 'Learn', 'Study', 'Know', 'Skill', 'Mind', 'Brain', 'Smart', 'Wise', 'Teach', 'Academy', 'School', 'Class', 'Course', 'Master'],
    sufijos: ['Academy', 'Learning', 'Education', 'School', 'Institute', 'Center', 'Hub', 'Lab', 'Campus', 'Class', 'Tutors', 'Minds', 'Skills', 'Knowledge', 'Pro'],
    palabras: ['Conocimiento', 'Aprendizaje', 'Sabiduría', 'Educación', 'Formación', 'Desarrollo', 'Crecimiento', 'Éxito', 'Futuro', 'Carrera', 'Potencial', 'Talento', 'Habilidad', 'Meta', 'Logro']
  },
  servicios: {
    prefijos: ['Pro', 'Expert', 'Prime', 'Elite', 'Top', 'Best', 'Quality', 'Trust', 'Reliable', 'Quick', 'Easy', 'Smart', 'Sure', 'Safe', 'First'],
    sufijos: ['Services', 'Solutions', 'Group', 'Pro', 'Plus', 'Express', 'Direct', 'Partners', 'Team', 'Experts', 'Consultants', 'Agency', 'Company', 'Enterprise', 'Associates'],
    palabras: ['Servicio', 'Calidad', 'Excelencia', 'Confianza', 'Compromiso', 'Profesionalidad', 'Dedicación', 'Eficiencia', 'Solución', 'Atención', 'Cuidado', 'Respuesta', 'Resultado', 'Éxito', 'Garantía']
  }
};

const estilos = {
  moderno: { descripcion: 'Nombres cortos y tech', modificador: (nombre: string) => nombre.replace(/[aeiou]/gi, (v, i) => i === 0 ? v : '').slice(0, 8) },
  clasico: { descripcion: 'Tradicional y profesional', modificador: (nombre: string) => nombre },
  creativo: { descripcion: 'Original y memorable', modificador: (nombre: string) => nombre.split('').reverse().join('').charAt(0).toUpperCase() + nombre.slice(1) },
  minimalista: { descripcion: 'Simple y limpio', modificador: (nombre: string) => nombre.slice(0, 6) }
};

type Sector = keyof typeof diccionarios;
type Estilo = keyof typeof estilos;

interface NombreGenerado {
  nombre: string;
  tipo: string;
  favorito: boolean;
}

export default function GeneradorNombresEmpresaPage() {
  const [sector, setSector] = useState<Sector>('tecnologia');
  const [estilo, setEstilo] = useState<Estilo>('moderno');
  const [palabraClave, setPalabraClave] = useState('');
  const [cantidad, setCantidad] = useState(12);
  const [nombres, setNombres] = useState<NombreGenerado[]>([]);
  const [generando, setGenerando] = useState(false);

  // Generar nombres
  const generarNombres = useCallback(() => {
    setGenerando(true);
    const dic = diccionarios[sector];
    const nuevosNombres: NombreGenerado[] = [];
    const usados = new Set<string>();

    const agregarNombre = (nombre: string, tipo: string) => {
      const nombreLimpio = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
      if (!usados.has(nombreLimpio.toLowerCase()) && nombreLimpio.length >= 3) {
        usados.add(nombreLimpio.toLowerCase());
        nuevosNombres.push({ nombre: nombreLimpio, tipo, favorito: false });
      }
    };

    // Generar combinaciones
    for (let i = 0; i < cantidad * 3 && nuevosNombres.length < cantidad; i++) {
      const random = () => Math.floor(Math.random() * 100);

      // Tipo 1: Prefijo + Sufijo
      if (random() < 40) {
        const prefijo = dic.prefijos[Math.floor(Math.random() * dic.prefijos.length)];
        const sufijo = dic.sufijos[Math.floor(Math.random() * dic.sufijos.length)];
        agregarNombre(`${prefijo}${sufijo}`, 'Combinación');
      }

      // Tipo 2: Palabra sola
      if (random() < 30) {
        const palabra = dic.palabras[Math.floor(Math.random() * dic.palabras.length)];
        agregarNombre(palabra, 'Palabra');
      }

      // Tipo 3: Prefijo + Palabra clave
      if (palabraClave && random() < 50) {
        const prefijo = dic.prefijos[Math.floor(Math.random() * dic.prefijos.length)];
        agregarNombre(`${prefijo}${palabraClave}`, 'Con keyword');
      }

      // Tipo 4: Palabra clave + Sufijo
      if (palabraClave && random() < 50) {
        const sufijo = dic.sufijos[Math.floor(Math.random() * dic.sufijos.length)];
        agregarNombre(`${palabraClave}${sufijo}`, 'Con keyword');
      }

      // Tipo 5: Fusión de palabras
      if (random() < 25) {
        const p1 = dic.palabras[Math.floor(Math.random() * dic.palabras.length)];
        const p2 = dic.palabras[Math.floor(Math.random() * dic.palabras.length)];
        if (p1 !== p2) {
          agregarNombre(`${p1.slice(0, 4)}${p2.slice(-4)}`, 'Fusión');
        }
      }

      // Tipo 6: Acrónimo inventado
      if (random() < 20) {
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const acronimo = Array(3).fill(0).map(() => letras[Math.floor(Math.random() * letras.length)]).join('');
        const palabra = dic.palabras[Math.floor(Math.random() * dic.palabras.length)];
        agregarNombre(`${acronimo} ${palabra}`, 'Acrónimo');
      }
    }

    // Aplicar modificador de estilo
    const nombresConEstilo = nuevosNombres.slice(0, cantidad).map(n => ({
      ...n,
      nombre: estilo === 'clasico' ? n.nombre : estilos[estilo].modificador(n.nombre)
    }));

    setTimeout(() => {
      setNombres(nombresConEstilo);
      setGenerando(false);
    }, 500);
  }, [sector, estilo, palabraClave, cantidad]);

  // Toggle favorito
  const toggleFavorito = (index: number) => {
    setNombres(prev => prev.map((n, i) =>
      i === index ? { ...n, favorito: !n.favorito } : n
    ));
  };

  // Copiar nombre
  const copiarNombre = async (nombre: string) => {
    await navigator.clipboard.writeText(nombre);
  };

  // Verificar dominio (enlace externo)
  const verificarDominio = (nombre: string, extension: string) => {
    const nombreLimpio = nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
    window.open(`https://www.namecheap.com/domains/registration/results/?domain=${nombreLimpio}${extension}`, '_blank');
  };

  const favoritos = nombres.filter(n => n.favorito);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🏢 Generador de Nombres de Empresa</h1>
        <p className={styles.subtitle}>
          Encuentra el nombre perfecto para tu negocio. Genera ideas creativas y verifica dominios disponibles.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Configura tu generador</h2>

          {/* Sector */}
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Sector / Industria</label>
            <div className={styles.sectorGrid}>
              {Object.keys(diccionarios).map((s) => (
                <button
                  key={s}
                  className={`${styles.sectorBtn} ${sector === s ? styles.sectorActivo : ''}`}
                  onClick={() => setSector(s as Sector)}
                >
                  {s === 'tecnologia' && '💻'}
                  {s === 'salud' && '🏥'}
                  {s === 'finanzas' && '💰'}
                  {s === 'creatividad' && '🎨'}
                  {s === 'ecommerce' && '🛒'}
                  {s === 'alimentacion' && '🍽️'}
                  {s === 'educacion' && '📚'}
                  {s === 'servicios' && '🔧'}
                  <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Estilo */}
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Estilo del nombre</label>
            <div className={styles.estiloGrid}>
              {Object.entries(estilos).map(([key, value]) => (
                <button
                  key={key}
                  className={`${styles.estiloBtn} ${estilo === key ? styles.estiloActivo : ''}`}
                  onClick={() => setEstilo(key as Estilo)}
                >
                  <span className={styles.estiloNombre}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className={styles.estiloDesc}>{value.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Palabra clave */}
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Palabra clave (opcional)</label>
            <input
              type="text"
              className={styles.inputTexto}
              value={palabraClave}
              onChange={(e) => setPalabraClave(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              placeholder="Ej: Smart, Eco, Pro..."
              maxLength={10}
            />
            <span className={styles.helperText}>Se incluirá en algunas combinaciones</span>
          </div>

          {/* Cantidad */}
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Cantidad de nombres: {cantidad}</label>
            <input
              type="range"
              className={styles.slider}
              min={6}
              max={24}
              step={6}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
          </div>

          {/* Botón generar */}
          <button
            className={styles.btnGenerar}
            onClick={generarNombres}
            disabled={generando}
          >
            {generando ? '⏳ Generando...' : '✨ Generar Nombres'}
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {nombres.length === 0 ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🏢</span>
              <p>Configura las opciones y pulsa &quot;Generar Nombres&quot;</p>
            </div>
          ) : (
            <>
              <h2 className={styles.sectionTitle}>
                Nombres Generados
                <span className={styles.contador}>{nombres.length} ideas</span>
              </h2>

              <div className={styles.nombresGrid}>
                {nombres.map((n, idx) => (
                  <div key={idx} className={`${styles.nombreCard} ${n.favorito ? styles.nombreFavorito : ''}`}>
                    <div className={styles.nombreHeader}>
                      <span className={styles.nombreTexto}>{n.nombre}</span>
                      <button
                        className={`${styles.btnFavorito} ${n.favorito ? styles.favoritoActivo : ''}`}
                        onClick={() => toggleFavorito(idx)}
                        title={n.favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      >
                        {n.favorito ? '⭐' : '☆'}
                      </button>
                    </div>
                    <span className={styles.nombreTipo}>{n.tipo}</span>
                    <div className={styles.nombreAcciones}>
                      <button
                        className={styles.btnAccion}
                        onClick={() => copiarNombre(n.nombre)}
                        title="Copiar nombre"
                      >
                        📋 Copiar
                      </button>
                      <button
                        className={styles.btnAccion}
                        onClick={() => verificarDominio(n.nombre, '.com')}
                        title="Verificar .com"
                      >
                        🌐 .com
                      </button>
                      <button
                        className={styles.btnAccion}
                        onClick={() => verificarDominio(n.nombre, '.es')}
                        title="Verificar .es"
                      >
                        🇪🇸 .es
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Favoritos */}
              {favoritos.length > 0 && (
                <div className={styles.favoritosSection}>
                  <h3>⭐ Tus Favoritos ({favoritos.length})</h3>
                  <div className={styles.favoritosLista}>
                    {favoritos.map((n, idx) => (
                      <span key={idx} className={styles.favoritoTag}>
                        {n.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="financial"
        severity="high"
        context="generador-nombres-empresa"
        collapsible={false}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Cómo elegir el nombre perfecto para tu empresa?"
        subtitle="Consejos de branding, errores comunes y cómo verificar disponibilidad"
      >
        <section className={styles.guideSection}>
          <h2>Características de un Buen Nombre de Empresa</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📌 Fácil de pronunciar y recordar</h4>
              <p>
                Un buen nombre se pronuncia fácil, se escucha claro y se recuerda sin esfuerzo.
                Evita nombres largos, combinaciones de consonantes difíciles o números.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 Único y diferenciador</h4>
              <p>
                Evita nombres genéricos o muy similares a competidores.
                Un nombre distintivo te ayuda a destacar y evita problemas legales.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 Dominio disponible</h4>
              <p>
                Antes de decidir, verifica que el dominio .com y .es estén disponibles.
                También revisa redes sociales (@nombreempresa).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 Sin connotaciones negativas</h4>
              <p>
                Investiga si el nombre tiene significados negativos en otros idiomas,
                especialmente si planeas internacionalizar.
              </p>
            </div>
          </div>

          <h3>Pasos para Registrar tu Nombre</h3>
          <ul className={styles.tipsList}>
            <li><strong>1. Verificar marca:</strong> Busca en la OEPM si ya existe como marca registrada</li>
            <li><strong>2. Registrar dominio:</strong> Compra el .com y .es antes de publicar nada</li>
            <li><strong>3. Redes sociales:</strong> Reserva los perfiles en las principales plataformas</li>
            <li><strong>4. Registro mercantil:</strong> Verifica que no existe otra empresa con ese nombre</li>
            <li><strong>5. Registrar marca:</strong> Si el negocio es serio, registra la marca (desde 150€)</li>
          </ul>
        </section>

        {/* SECCIÓN 1: Tabla comparativa de tipos de nombre */}
        <section className={styles.guideSection}>
          <h2>Tipos de Nombre Empresarial: Comparativa</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de nombre</th>
                  <th>Ejemplos conocidos</th>
                  <th>Facilidad registro</th>
                  <th>Memorabilidad</th>
                  <th>Escalabilidad int.</th>
                  <th>Posicionamiento</th>
                  <th>SEO inicial</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Nombre fundador</strong></td>
                  <td>Zara, Ford, Ferrero</td>
                  <td>⭐⭐⭐⭐</td>
                  <td>⭐⭐⭐</td>
                  <td>⭐⭐⭐⭐</td>
                  <td>Largo plazo</td>
                  <td>⭐⭐</td>
                </tr>
                <tr>
                  <td><strong>Descriptivo</strong></td>
                  <td>General Electric, Burger King</td>
                  <td>⭐⭐</td>
                  <td>⭐⭐⭐</td>
                  <td>⭐⭐</td>
                  <td>Medio plazo</td>
                  <td>⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td><strong>Acrónimo</strong></td>
                  <td>IBM, SEAT, IKEA</td>
                  <td>⭐⭐⭐⭐⭐</td>
                  <td>⭐⭐</td>
                  <td>⭐⭐⭐⭐⭐</td>
                  <td>Muy largo plazo</td>
                  <td>⭐</td>
                </tr>
                <tr>
                  <td><strong>Inventado / Neologismo</strong></td>
                  <td>Google, Spotify, Kodak</td>
                  <td>⭐⭐⭐⭐⭐</td>
                  <td>⭐⭐⭐⭐⭐</td>
                  <td>⭐⭐⭐⭐⭐</td>
                  <td>Muy largo plazo</td>
                  <td>⭐⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td><strong>Metafórico</strong></td>
                  <td>Apple, Amazon, Oracle</td>
                  <td>⭐⭐⭐⭐</td>
                  <td>⭐⭐⭐⭐⭐</td>
                  <td>⭐⭐⭐⭐</td>
                  <td>Largo plazo</td>
                  <td>⭐⭐⭐</td>
                </tr>
                <tr>
                  <td><strong>Geográfico</strong></td>
                  <td>Banca March, Rioja, Extremadura</td>
                  <td>⭐⭐⭐</td>
                  <td>⭐⭐⭐</td>
                  <td>⭐</td>
                  <td>Corto plazo (local)</td>
                  <td>⭐⭐⭐</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de uso */}
        <section className={styles.guideSection}>
          <h2>¿Para Quién es Cada Estrategia?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👤</span>
                <h4>Autónomo creando su marca personal</h4>
              </div>
              <p>Cuando comienzas como freelance, usar tu nombre y apellido genera confianza inmediata. Sin embargo, si planeas escalar o contratar, una marca independiente te da más flexibilidad futura.</p>
              <p className={styles.escenarioTip}>💡 Consejo: Reserva ambas opciones (dominio con tu nombre y con marca) desde el principio.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
                <h4>Startup tech buscando nombre escalable</h4>
              </div>
              <p>Para una startup tecnológica con vocación internacional, los nombres inventados o metafóricos son la mejor opción. Evita términos que limiten el sector o la geografía desde el principio.</p>
              <p className={styles.escenarioExample}>Ejemplo: en lugar de &quot;MadridApp&quot;, algo como &quot;Nexara&quot; o &quot;Vexio&quot; escala sin fricción.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏪</span>
                <h4>Comercio local con identidad de barrio</h4>
              </div>
              <p>Un negocio local puede beneficiarse de un nombre geográfico o descriptivo. La comunidad lo asocia rápidamente al lugar, lo que genera fidelización y SEO local orgánico.</p>
              <p className={styles.escenarioTip}>💡 Consejo: Incluye el barrio o ciudad en el nombre solo si no planeas abrir más ubicaciones.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <h4>Empresa de servicios profesionales</h4>
              </div>
              <p>Asesorías, consultorías y despachos profesionales suelen optar por el nombre del fundador o un nombre descriptivo para transmitir credibilidad y seriedad desde el primer contacto.</p>
              <p className={styles.escenarioExample}>Ejemplo: &quot;García & Asociados Consultoría&quot; transmite experiencia y solvencia.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Nombres de Empresa</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cómo compruebo si un nombre está disponible en España?</h4>
              <p>Debes verificar en tres registros: la OEPM (Oficina Española de Patentes y Marcas) para marcas, el Registro Mercantil Central para denominaciones sociales, y los registros de dominio web (.es en Red.es, .com en registradores internacionales).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el BORME y cómo afecta al nombre?</h4>
              <p>El BORME (Boletín Oficial del Registro Mercantil) publica todas las denominaciones sociales registradas en España. Antes de constituir una sociedad, el Registro Mercantil Central comprueba que no existe otra empresa con el mismo nombre o uno muy similar.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Debo registrar la marca antes de crear la empresa?</h4>
              <p>No es obligatorio, pero sí muy recomendable. Registrar la marca en la OEPM (desde 150 € por clase) te protege legalmente y evita que terceros usen tu nombre comercial antes de que puedas defenderte. Puedes registrar la empresa y la marca simultáneamente.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre denominación social y nombre comercial?</h4>
              <p>La denominación social es el nombre legal de la empresa (el que aparece en el Registro Mercantil). El nombre comercial es el que usas para hacer negocio y puede ser diferente. Ambos pueden coexistir y se protegen de forma independiente.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puede coincidir el nombre con el dominio web?</h4>
              <p>Idealmente sí, pero no es obligatorio. Lo ideal es que el nombre de empresa, la marca y el dominio web sean idénticos o muy similares para coherencia de marca y facilidad de búsqueda. Sin embargo, a veces el dominio exacto no está disponible y hay que adaptarse.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuánto cuesta registrar una marca en España?</h4>
              <p>El registro de marca ante la OEPM cuesta 143,47 € para la primera clase de productos o servicios (tarifa oficial 2025). Cada clase adicional tiene un coste adicional. El proceso dura aproximadamente 4-6 meses y la protección es válida por 10 años (renovable).</p>
              <p className={styles.faqTip}>Nota: Esta cifra puede variar. Consulta siempre las tarifas oficiales actualizadas en la web de la OEPM (oepm.es).</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa si mi nombre se parece al de otra empresa?</h4>
              <p>Si el nombre es confusamente similar a una marca registrada en la misma clase de actividad, el titular puede interponer una oposición ante la OEPM o una demanda por infracción de marca. Esto puede obligarte a cambiar el nombre y acarrear sanciones económicas.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puede usar el mismo nombre una SL y un autónomo?</h4>
              <p>Un autónomo no tiene denominación social registrada; opera bajo su nombre y apellidos o un nombre comercial. Una SL sí requiere denominación social única. Por tanto, un autónomo puede usar un nombre comercial idéntico al de una SL si no está registrado como marca, aunque esto puede generar conflictos.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso para Elegir tu Nombre</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Define valores y público objetivo</h4>
                <p>Antes de generar nombres, ten claro qué transmite tu empresa y a quién se dirige. Un nombre para un despacho jurídico debe inspirar seriedad; uno para una app de ocio, dinamismo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Haz brainstorming de 20+ nombres</h4>
                <p>Usa este generador, diccionarios, sinónimos y referencias del sector. Cuantas más opciones tengas al inicio, más probabilidad de encontrar un nombre excelente después del filtrado.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Filtra por pronunciabilidad y memorabilidad</h4>
                <p>Di los nombres en voz alta. Díselos a alguien sin contexto y comprueba si los recuerda 10 minutos después. Elimina los que son difíciles de pronunciar o escribir.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Comprueba disponibilidad en OEPM (marcas)</h4>
                <p>Accede al buscador de marcas de la OEPM (oepm.es) y busca en la clase de actividad correspondiente. Descarta los nombres con conflictos o variaciones muy similares ya registradas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h4>Verifica dominio .es y .com disponibles</h4>
                <p>Usa registradores como Namecheap, GoDaddy o IONOS para verificar disponibilidad. Si el .com no está disponible, considera variaciones con guion o sufijos alternativos (.io, .co).</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h4>Busca en el Registro Mercantil Central</h4>
                <p>Si constituirás una sociedad (SL, SA...), consulta el Registro Mercantil Central (rmc.es) para verificar que la denominación no esté ocupada y solicita una certificación negativa de denominación.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <h4>Registra marca y reserva dominio</h4>
                <p>Una vez decidido el nombre, actúa rápido: registra la solicitud de marca en la OEPM y compra el dominio el mismo día. Antes de invertir en branding, asegura estos dos activos fundamentales.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas de Naming Empresarial</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔤</span>
              <h4>Máximo 2-3 sílabas</h4>
              <p>Los nombres cortos se recuerdan mejor, se pronuncian más rápido y funcionan mejor en el branding visual. Nike, Zara, Apple: todos tienen menos de 3 sílabas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌱</span>
              <h4>Evita nombres que limiten tu crecimiento</h4>
              <p>Un nombre como &quot;Pizzería Barrio&quot; te ata a un producto y una zona. Si en el futuro diversificas, el nombre quedará obsoleto. Piensa en la empresa que quieres ser en 10 años.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌍</span>
              <h4>Prueba pronunciación con no-nativos</h4>
              <p>Si planeas internacionalizar, comprueba que el nombre se puede pronunciar con facilidad en inglés, francés y alemán. Muchos negocios han cambiado de nombre por este motivo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>Verifica significado en otros idiomas</h4>
              <p>Algunos nombres tienen connotaciones negativas, ofensivas o ridículas en otros idiomas. Busca siempre el nombre en inglés, francés y el idioma del mercado principal al que te diriges.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌐</span>
              <h4>Asegura coherencia con el dominio web</h4>
              <p>Nombre de empresa, nombre comercial, dominio web y usuario en redes sociales deben ser idénticos o muy similares. La coherencia de marca reduce confusión y refuerza el posicionamiento.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👥</span>
              <h4>Testea con 10 personas de tu público</h4>
              <p>Antes de decidirte, muestra los 3-5 finalistas a personas reales de tu público objetivo. Pregunta qué les transmite, si lo recuerdan y si lo asocian con tu sector. Los datos valen más que la intuición.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Graves al Elegir Nombre de Empresa</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Usar el mismo nombre que una marca registrada:</strong> puede acarrear una sanción económica y la obligación de cambiar toda tu identidad corporativa, con el coste que eso implica.</li>
            <li><strong>No verificar el dominio antes de registrar la empresa:</strong> si el dominio ya está ocupado tendrás que usar un nombre de web diferente al de tu empresa, dañando la coherencia de marca.</li>
            <li><strong>Elegir un nombre demasiado genérico:</strong> palabras como &quot;calidad&quot;, &quot;servicios&quot; o &quot;soluciones&quot; son casi imposibles de posicionar en Google y no te diferencian de la competencia.</li>
            <li><strong>Nombre con caracteres especiales (ñ, acentos):</strong> complican la dirección de correo electrónico, el dominio web y la memorización por parte de clientes internacionales.</li>
            <li><strong>No registrar la marca antes de invertir en branding:</strong> si has gastado en logo, web y materiales antes de proteger el nombre, un tercero podría registrarlo y obligarte a empezar desde cero.</li>
            <li><strong>Nombre que confunde con competidores:</strong> además del riesgo legal por infracción de marca, genera confusión en el mercado y puede redirigir clientes potenciales hacia tu competencia.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-nombres-empresa')} />

      <ShareCard appName="generador-nombres-empresa" />
      <Footer appName="generador-nombres-empresa" />
    </div>
  );
}
