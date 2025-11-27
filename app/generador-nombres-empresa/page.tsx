'use client';

import { useState, useCallback } from 'react';
import styles from './GeneradorNombresEmpresa.module.css';
import { MeskeiaLogo, Footer, EducationalSection } from '@/components';

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

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Los nombres generados son <strong>sugerencias algorítmicas</strong>.
          Antes de usar un nombre, verifica que no esté registrado como marca en la <strong>OEPM</strong> (Oficina Española de Patentes y Marcas)
          y que el dominio esté disponible. <strong>meskeIA no garantiza la disponibilidad legal de los nombres.</strong>
        </p>
      </div>

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
      </EducationalSection>

      <Footer appName="generador-nombres-empresa" />
    </div>
  );
}
