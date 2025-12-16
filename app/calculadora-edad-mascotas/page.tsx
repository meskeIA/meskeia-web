'use client';

import { useState } from 'react';
import styles from './CalculadoraEdadMascotas.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

type TipoMascota = 'perro' | 'gato';
type TamanoPerro = 'pequeno' | 'mediano' | 'grande' | 'gigante';

export default function CalculadoraEdadMascotasPage() {
  const [tipoMascota, setTipoMascota] = useState<TipoMascota>('perro');
  const [tamanoPerro, setTamanoPerro] = useState<TamanoPerro>('mediano');
  const [edadMascota, setEdadMascota] = useState('');
  const [resultado, setResultado] = useState<{
    edadHumana: number;
    etapaVida: string;
    descripcion: string;
  } | null>(null);

  // Fórmula actualizada basada en estudios recientes
  // Para perros: varía según tamaño (los perros grandes envejecen más rápido)
  // Para gatos: fórmula más simple pero precisa
  const calcularEdadPerro = (edad: number, tamano: TamanoPerro): number => {
    // Factores de envejecimiento por tamaño (años humanos por año de perro después del 2º año)
    const factores: Record<TamanoPerro, number> = {
      pequeno: 4,    // <10kg
      mediano: 5,    // 10-25kg
      grande: 6,     // 25-45kg
      gigante: 7,    // >45kg
    };

    if (edad <= 0) return 0;
    if (edad <= 1) return 15; // Primer año = 15 años humanos
    if (edad <= 2) return 15 + 9; // Segundo año = 9 años más

    const factor = factores[tamano];
    return 24 + (edad - 2) * factor;
  };

  const calcularEdadGato = (edad: number): number => {
    if (edad <= 0) return 0;
    if (edad <= 1) return 15; // Primer año = 15 años humanos
    if (edad <= 2) return 24; // Segundo año = 9 años más

    return 24 + (edad - 2) * 4; // Cada año adicional = 4 años humanos
  };

  const obtenerEtapaVida = (tipo: TipoMascota, edad: number, edadHumana: number): { etapa: string; descripcion: string } => {
    if (tipo === 'gato') {
      if (edad < 0.5) return { etapa: 'Gatito', descripcion: 'Etapa de crecimiento rápido y mucha curiosidad' };
      if (edad < 2) return { etapa: 'Gato joven', descripcion: 'Muy activo y juguetón, aprendiendo sobre su entorno' };
      if (edad < 7) return { etapa: 'Adulto', descripcion: 'En su mejor momento físico y mental' };
      if (edad < 11) return { etapa: 'Maduro', descripcion: 'Más tranquilo pero todavía activo' };
      if (edad < 15) return { etapa: 'Senior', descripcion: 'Necesita más cuidados y revisiones veterinarias' };
      return { etapa: 'Geriátrico', descripcion: 'Requiere atención especial y mucho cariño' };
    } else {
      if (edad < 0.5) return { etapa: 'Cachorro', descripcion: 'Etapa de socialización y aprendizaje' };
      if (edad < 2) return { etapa: 'Perro joven', descripcion: 'Lleno de energía, necesita mucho ejercicio' };
      if (edad < 7) return { etapa: 'Adulto', descripcion: 'Equilibrado y en su mejor momento' };
      if (edad < 10) return { etapa: 'Maduro', descripcion: 'Empieza a necesitar más descanso' };
      return { etapa: 'Senior', descripcion: 'Necesita revisiones veterinarias frecuentes y cuidados especiales' };
    }
  };

  const calcular = () => {
    const edad = parseFloat(edadMascota.replace(',', '.'));
    if (isNaN(edad) || edad < 0 || edad > 30) return;

    let edadHumana: number;
    if (tipoMascota === 'perro') {
      edadHumana = calcularEdadPerro(edad, tamanoPerro);
    } else {
      edadHumana = calcularEdadGato(edad);
    }

    const { etapa, descripcion } = obtenerEtapaVida(tipoMascota, edad, edadHumana);

    setResultado({
      edadHumana,
      etapaVida: etapa,
      descripcion,
    });
  };

  const limpiar = () => {
    setEdadMascota('');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Edad de Mascotas</h1>
        <p className={styles.subtitle}>
          Descubre la edad de tu perro o gato en años humanos
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
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

          {/* Selector de tamaño (solo para perros) */}
          {tipoMascota === 'perro' && (
            <div className={styles.inputGroup}>
              <label>Tamaño del perro</label>
              <div className={styles.tamanoGrid}>
                <button
                  className={`${styles.tamanoBtn} ${tamanoPerro === 'pequeno' ? styles.active : ''}`}
                  onClick={() => setTamanoPerro('pequeno')}
                >
                  <span className={styles.tamanoIcon}>🐕</span>
                  <span className={styles.tamanoNombre}>Pequeño</span>
                  <span className={styles.tamanoPeso}>&lt;10 kg</span>
                </button>
                <button
                  className={`${styles.tamanoBtn} ${tamanoPerro === 'mediano' ? styles.active : ''}`}
                  onClick={() => setTamanoPerro('mediano')}
                >
                  <span className={styles.tamanoIcon}>🐕</span>
                  <span className={styles.tamanoNombre}>Mediano</span>
                  <span className={styles.tamanoPeso}>10-25 kg</span>
                </button>
                <button
                  className={`${styles.tamanoBtn} ${tamanoPerro === 'grande' ? styles.active : ''}`}
                  onClick={() => setTamanoPerro('grande')}
                >
                  <span className={styles.tamanoIcon}>🐕</span>
                  <span className={styles.tamanoNombre}>Grande</span>
                  <span className={styles.tamanoPeso}>25-45 kg</span>
                </button>
                <button
                  className={`${styles.tamanoBtn} ${tamanoPerro === 'gigante' ? styles.active : ''}`}
                  onClick={() => setTamanoPerro('gigante')}
                >
                  <span className={styles.tamanoIcon}>🐕</span>
                  <span className={styles.tamanoNombre}>Gigante</span>
                  <span className={styles.tamanoPeso}>&gt;45 kg</span>
                </button>
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>Edad de tu {tipoMascota === 'perro' ? 'perro' : 'gato'}</label>
            <div className={styles.inputConUnidad}>
              <input
                type="text"
                value={edadMascota}
                onChange={(e) => setEdadMascota(e.target.value)}
                placeholder="5"
                className={styles.input}
              />
              <span className={styles.unidad}>años</span>
            </div>
            <span className={styles.hint}>Puedes usar decimales (ej: 2,5 años)</span>
          </div>

          <div className={styles.botones}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular Edad Humana
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              {/* Edad humana */}
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoIcon}>
                  {tipoMascota === 'perro' ? '🐕' : '🐈'}
                </span>
                <div className={styles.resultadoValor}>
                  {formatNumber(resultado.edadHumana, 0)} años humanos
                </div>
                <div className={styles.resultadoLabel}>
                  Equivalente en edad humana
                </div>
              </div>

              {/* Etapa de vida */}
              <div className={styles.etapaVida}>
                <div className={styles.etapaTitulo}>
                  <span className={styles.etapaEmoji}>
                    {resultado.etapaVida === 'Cachorro' || resultado.etapaVida === 'Gatito' ? '🍼' :
                     resultado.etapaVida.includes('joven') ? '🎾' :
                     resultado.etapaVida === 'Adulto' ? '💪' :
                     resultado.etapaVida === 'Maduro' ? '🛋️' : '🧓'}
                  </span>
                  <span>Etapa: {resultado.etapaVida}</span>
                </div>
                <p className={styles.etapaDescripcion}>{resultado.descripcion}</p>
              </div>

              {/* Comparación visual */}
              <div className={styles.comparacion}>
                <div className={styles.comparacionItem}>
                  <div className={styles.comparacionIcono}>
                    {tipoMascota === 'perro' ? '🐕' : '🐈'}
                  </div>
                  <div className={styles.comparacionEdad}>
                    {edadMascota} años
                  </div>
                  <div className={styles.comparacionLabel}>
                    {tipoMascota === 'perro' ? 'Perro' : 'Gato'}
                  </div>
                </div>
                <div className={styles.comparacionIgual}>=</div>
                <div className={styles.comparacionItem}>
                  <div className={styles.comparacionIcono}>👤</div>
                  <div className={styles.comparacionEdad}>
                    {formatNumber(resultado.edadHumana, 0)} años
                  </div>
                  <div className={styles.comparacionLabel}>Humano</div>
                </div>
              </div>

              {/* Info adicional */}
              <div className={styles.infoAdicional}>
                <h4>💡 ¿Sabías que...?</h4>
                {tipoMascota === 'perro' ? (
                  <p>
                    Los perros de raza pequeña suelen vivir más años que los grandes.
                    Un Chihuahua puede vivir 15-20 años, mientras que un Gran Danés
                    normalmente vive 6-8 años.
                  </p>
                ) : (
                  <p>
                    Los gatos de interior suelen vivir más que los de exterior (15-20 años vs 10-12).
                    El gato más longevo registrado vivió 38 años.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🐾</span>
              <p>Introduce la edad de tu mascota para calcular</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de referencia */}
      <div className={styles.tablaReferencia}>
        <h3>📊 Tabla de Referencia Rápida</h3>
        <div className={styles.tablasGrid}>
          <div className={styles.tablaCard}>
            <h4>🐕 Perros (tamaño mediano)</h4>
            <table>
              <thead>
                <tr>
                  <th>Edad perro</th>
                  <th>Edad humana</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1 año</td><td>15 años</td></tr>
                <tr><td>2 años</td><td>24 años</td></tr>
                <tr><td>5 años</td><td>39 años</td></tr>
                <tr><td>7 años</td><td>49 años</td></tr>
                <tr><td>10 años</td><td>64 años</td></tr>
              </tbody>
            </table>
          </div>
          <div className={styles.tablaCard}>
            <h4>🐈 Gatos</h4>
            <table>
              <thead>
                <tr>
                  <th>Edad gato</th>
                  <th>Edad humana</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1 año</td><td>15 años</td></tr>
                <tr><td>2 años</td><td>24 años</td></tr>
                <tr><td>5 años</td><td>36 años</td></tr>
                <tr><td>10 años</td><td>56 años</td></tr>
                <tr><td>15 años</td><td>76 años</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RelatedApps
        apps={getRelatedApps('calculadora-edad-mascotas')}
        title="Más herramientas para tu mascota"
        icon="🐾"
      />

      <Footer appName="calculadora-edad-mascotas" />
    </div>
  );
}
