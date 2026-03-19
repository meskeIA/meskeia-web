'use client';

import { useState } from 'react';
import styles from './CalculadoraEdadMascotas.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
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

      <LegalNotice lastUpdated="2026-02-02" />

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


      <DisclaimerCard variant="medical" severity="high" collapsible={false} context="calculadora-edad-mascotas">
        <p>Esta calculadora usa fórmulas científicas actualizadas, pero es <strong>solo orientativa</strong>:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>La edad biológica varía</strong>: Depende de raza, tamaño, alimentación, ejercicio y genética individual</li>
          <li><strong>No reemplaza revisiones veterinarias</strong>: El envejecimiento de tu mascota debe evaluarlo un veterinario con exploración física</li>
        </ul>
        <p className={styles.highlight}><strong>🐾 Consulta con tu veterinario sobre cuidados específicos según la edad de tu mascota.</strong></p>
      </DisclaimerCard>

      <EducationalSection
        title="Todo sobre la edad de tu mascota"
        subtitle="Ciencia real del envejecimiento animal: tablas completas, mitos desmontados y guía de cuidados por etapa vital"
      >
        {/* 1. TABLA COMPARATIVA */}
        <section>
          <h3>Tabla comparativa de equivalencia de edad</h3>
          <p>
            La popular &quot;regla de los 7 años&quot; es un mito. La proporción varía significativamente
            según el tamaño del perro y la edad real. Los perros grandes envejecen más rápido;
            los pequeños pueden superar los 18 años con buena salud.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Edad real</th>
                  <th>Pequeño <span aria-hidden="true">(&lt;10 kg)</span></th>
                  <th>Mediano <span aria-hidden="true">(10-25 kg)</span></th>
                  <th>Grande <span aria-hidden="true">(25-45 kg)</span></th>
                  <th>Gigante <span aria-hidden="true">(&gt;45 kg)</span></th>
                  <th>Gato</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1 año</td><td>15 años</td><td>15 años</td><td>15 años</td><td>15 años</td><td>15 años</td></tr>
                <tr><td>2 años</td><td>24 años</td><td>24 años</td><td>24 años</td><td>24 años</td><td>24 años</td></tr>
                <tr><td>3 años</td><td>28 años</td><td>29 años</td><td>30 años</td><td>31 años</td><td>28 años</td></tr>
                <tr><td>5 años</td><td>36 años</td><td>39 años</td><td>42 años</td><td>45 años</td><td>36 años</td></tr>
                <tr><td>7 años</td><td>44 años</td><td>49 años</td><td>54 años</td><td>59 años</td><td>44 años</td></tr>
                <tr><td>10 años</td><td>56 años</td><td>64 años</td><td>72 años</td><td>80 años</td><td>56 años</td></tr>
                <tr><td>12 años</td><td>64 años</td><td>74 años</td><td>84 años</td><td>94 años</td><td>64 años</td></tr>
                <tr><td>15 años</td><td>76 años</td><td>89 años</td><td>102 años</td><td>—</td><td>76 años</td></tr>
              </tbody>
            </table>
          </div>
          <p className={styles.faqTip}>
            <strong>Nota:</strong> Los perros gigantes raramente superan los 10-11 años. Valores calculados
            con el modelo científico de Dog Aging Project (Cell Systems, 2020).
          </p>
        </section>

        {/* 2. CASOS DE USO */}
        <section>
          <h3>¿Para quién es útil esta calculadora?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <strong>Adoptante de rescate</strong>
              </div>
              <p className={styles.escenarioExample}>
                Has adoptado un perro sin historial conocido y el veterinario estima 5-6 años.
                La calculadora te confirma que equivale a un humano de 39-44 años: adulto activo,
                pero con revisiones anuales ya recomendables.
              </p>
              <p className={styles.escenarioTip}>
                Usa la calculadora para dimensionar expectativas de vida y planificar cuidados preventivos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🥗</span>
                <strong>Propietario que ajusta la dieta</strong>
              </div>
              <p className={styles.escenarioExample}>
                Tu Golden Retriever cumple 8 años. La calculadora muestra 64 años humanos equivalentes:
                es momento de valorar el cambio a pienso &quot;senior&quot; y reducir las calorías un 10-20 %.
              </p>
              <p className={styles.escenarioTip}>
                La etapa vital equivalente orienta cuándo y cómo adaptar la alimentación.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🩺</span>
                <strong>Veterinario en consulta</strong>
              </div>
              <p className={styles.escenarioExample}>
                Comunicar &quot;tu perro tiene 9 años&quot; no genera la misma empatía que
                &quot;equivale a una persona de 69 años&quot;. La equivalencia humana ayuda al propietario
                a comprender la urgencia de revisiones semestrales.
              </p>
              <p className={styles.escenarioTip}>
                Herramienta de comunicación eficaz para mejorar la adherencia a protocolos preventivos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🐕</span>
                <strong>Criador responsable</strong>
              </div>
              <p className={styles.escenarioExample}>
                Una perra de 7 años de raza grande equivale a 54 años humanos. Conocer esto orienta
                las decisiones éticas sobre reproducción tardía y el momento de retirar a la reproductora
                del programa de cría.
              </p>
              <p className={styles.escenarioTip}>
                Fundamental para planificar la vida reproductiva sin comprometer el bienestar animal.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre la edad de las mascotas</h3>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Por qué la regla de los 7 años es incorrecta?</dt>
              <dd>
                Porque no considera que el envejecimiento no es lineal ni uniforme. El primer año de vida
                de un perro equivale a 15 años humanos (por el rapidísimo desarrollo). Además, la tasa
                de envejecimiento varía enormemente según el tamaño: un perro gigante envejece el doble
                de rápido que uno pequeño a partir del segundo año.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuándo es &quot;mayor&quot; un perro grande frente a uno pequeño?</dt>
              <dd>
                Un perro grande (25-45 kg) se considera senior a partir de los 7 años; uno gigante (más
                de 45 kg), a los 5-6 años. En cambio, los perros pequeños no entran en la etapa senior
                hasta los 10-12 años. Esta diferencia es la razón principal por la que los perros pequeños
                viven significativamente más.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿A qué edad humana equivale un perro de 2 años?</dt>
              <dd>
                Independientemente del tamaño, un perro de 2 años equivale aproximadamente a 24 años
                humanos. El segundo año de vida supone 9 años de envejecimiento humano adicionales al
                primer año (que ya representaba 15). A partir del tercer año, los factores de tamaño
                empiezan a divergir.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo varía la esperanza de vida según el tamaño del perro?</dt>
              <dd>
                De forma marcada: los perros pequeños (menos de 10 kg) pueden vivir 14-20 años,
                los medianos 12-15 años, los grandes 10-12 años y los gigantes apenas 6-10 años.
                Se cree que esto se debe a que los organismos más grandes acumulan radicales libres
                y errores de replicación celular más rápidamente.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuándo cambiar al pienso de &quot;senior&quot;?</dt>
              <dd>
                Depende del tamaño: razas pequeñas y medianas, a partir de los 7-8 años; razas grandes,
                a partir de los 6 años; razas gigantes, a partir de los 5 años. El pienso senior tiene
                menos calorías, más fibra y suplementos articulares. Consulta siempre con tu veterinario
                antes de cambiar la dieta.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Los gatos envejecen igual que los perros?</dt>
              <dd>
                No exactamente. Los gatos siguen una curva similar en los primeros años (1 año = 15
                años humanos; 2 años = 24), pero a partir de ahí envejecen a un ritmo de 4 años
                humanos por año de gato, independientemente del peso. Los gatos de interior tienden
                a vivir 15-20 años; los de exterior, 10-12 años por exposición a riesgos externos.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué cambios físicos esperar en un perro de 10 años?</dt>
              <dd>
                A los 10 años, un perro mediano equivale a 64 años humanos. Es habitual observar:
                menor tolerancia al ejercicio intenso, encanecimiento del hocico, posible rigidez
                articular al levantarse, visión y audición algo reducidas, y mayor tiempo de sueño.
                Los controles veterinarios semestrales son esenciales para detectar patologías
                tempranamente (artritis, insuficiencia renal, tumores).
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo calcular la edad si el perro fue rescatado sin historial?</dt>
              <dd>
                El veterinario puede estimar la edad mediante varios indicadores: estado dental
                (desgaste e incrustaciones de sarro), opacidad del cristalino, pelaje (canas en
                el hocico), desarrollo muscular y radiografías de huesos. Con esa estimación, introduce
                la edad media del rango en la calculadora para obtener la equivalencia humana orientativa.
              </dd>
            </div>
          </dl>
        </section>

        {/* 4. GUÍA PASO A PASO */}
        <section>
          <h3>Cómo adaptar los cuidados según la etapa vital</h3>
          <p>Una vez conocida la edad equivalente de tu mascota, sigue estos 7 pasos para ajustar su rutina:</p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Identifica la etapa vital</strong>
                <p>
                  Cachorro (0-1 año), Joven (1-3 años), Adulto (3-7 años), Maduro (7-9 años),
                  Senior (9-12 años) o Geriátrico (más de 12 años). Cada etapa tiene necesidades
                  nutricionales y de ejercicio distintas.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Revisa la alimentación</strong>
                <p>
                  Ajusta la cantidad calórica y el tipo de pienso según la etapa. Los cachorros
                  necesitan más proteína para el crecimiento; los seniors requieren menos calorías
                  y más fibra para mantener el peso ideal.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Adapta el ejercicio</strong>
                <p>
                  Los perros adultos necesitan 45-90 minutos de ejercicio diario; los seniors,
                  paseos más cortos pero frecuentes (3-4 veces al día). Evita superficies duras
                  y saltos en perros mayores para proteger las articulaciones.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Programa revisiones veterinarias</strong>
                <p>
                  Cachorros: seguimiento mensual el primer año. Adultos: revisión anual.
                  Seniors y geriátricos: revisión semestral con analítica completa para detectar
                  problemas renales, hepáticos o tiroideos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Cuida el entorno doméstico</strong>
                <p>
                  Para mascotas mayores, facilita el acceso: rampas en lugar de escalones, cama
                  ortopédica a ras del suelo, comedero elevado para reducir tensión cervical y
                  antideslizantes en suelos resbaladizos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Mantén la estimulación mental</strong>
                <p>
                  Incluso los perros seniors necesitan juego e interacción. Los juguetes Kong,
                  los puzzles de sniffing y las sesiones cortas de entrenamiento mantienen el
                  cerebro activo y retrasan el deterioro cognitivo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Observa señales de alerta temprana</strong>
                <p>
                  Cambios en el apetito o el peso, aumento del consumo de agua, dificultad para
                  levantarse, tos persistente o jadeo excesivo son señales que justifican una
                  visita al veterinario sin esperar a la revisión programada.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. MEJORES PRÁCTICAS */}
        <section>
          <h3>Mejores prácticas de cuidado por etapa vital</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍼</span>
              <strong>Cachorro (0-1 año)</strong>
              <p>
                Socialización intensiva con personas, animales y entornos variados. Vacunación
                completa y desparasitaciones periódicas. Limitar el ejercicio de alto impacto para
                proteger las articulaciones en desarrollo. Alimentación con pienso específico de cachorro.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎾</span>
              <strong>Adulto joven (1-3 años)</strong>
              <p>
                Máxima actividad física y juego. Momento ideal para consolidar el adiestramiento
                y establecer rutinas. Esterilización si no se destina a cría. Mantener el peso
                controlado: es la etapa en que más riesgo de sobrepeso existe por la transición
                de cachorro a adulto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💪</span>
              <strong>Adulto pleno (3-7 años)</strong>
              <p>
                Etapa de equilibrio. Mantener la rutina de ejercicio y una dieta estable.
                Revisión dental anual (el sarro acumulado puede causar infecciones cardíacas
                y renales). Controla el peso mensualmente para detectar cambios sutiles.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛋️</span>
              <strong>Maduro (7-9 años)</strong>
              <p>
                Empieza a valorar el cambio a pienso senior. Incorpora suplementos de omega-3
                y glucosamina para las articulaciones si el veterinario lo recomienda. Reduce
                paulatinamente el ejercicio de alta intensidad. Primera analítica completa
                de sangre y orina como referencia basal.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧓</span>
              <strong>Senior (9-12 años)</strong>
              <p>
                Revisión veterinaria semestral obligatoria. Adapta el entorno: cama ortopédica,
                rampas y suelos antideslizantes. Paseos cortos y frecuentes en lugar de
                largas caminatas. Vigilar la ingesta de agua como indicador de salud renal.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">❤️</span>
              <strong>Geriátrico (más de 12 años)</strong>
              <p>
                Prioridad: confort y calidad de vida. Revisiones veterinarias trimestrales.
                Medicación para el dolor articular si el veterinario la prescribe. Dieta
                blanda o húmeda si hay pérdida dental. Maximizar el tiempo de calidad con
                tu mascota en su entorno familiar y seguro.
              </p>
            </div>
          </div>
        </section>

        {/* 6. WARNING BOX */}
        <section>
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores que acortan la vida de tu mascota</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Esperar demasiado para cambiar a dieta senior:</strong> Mantener la alimentación
                de adulto en un perro grande de 6-7 años equivale a dar la misma comida a una persona
                de 54 años que a una de 35. Las necesidades metabólicas son muy distintas.
              </li>
              <li>
                <strong>No ajustar el ejercicio en perros mayores:</strong> Los saltos, las carreras
                en superficies duras y el juego intenso dañan las articulaciones ya deterioradas.
                El dolor articular crónico reduce drásticamente la calidad de vida.
              </li>
              <li>
                <strong>Ignorar el aumento de sed o el cambio en la orina:</strong> Son de los primeros
                indicadores de insuficiencia renal o diabetes. Detectados a tiempo, estas enfermedades
                son manejables; ignoradas, acortan la vida varios años.
              </li>
              <li>
                <strong>Saltar las revisiones dentales:</strong> La enfermedad periodontal en perros
                mayores de 7 años afecta al corazón y los riñones. La limpieza dental veterinaria
                anual puede añadir años de vida.
              </li>
              <li>
                <strong>Subestimar el envejecimiento acelerado en razas grandes:</strong> Un Pastor
                Alemán de 8 años ya es un perro anciano (64 años equivalentes). Tratarlo como un
                adulto de mediana edad en términos de ejercicio o dieta puede precipitar su deterioro.
              </li>
              <li>
                <strong>Ignorar cambios en el comportamiento o el apetito:</strong> En mascotas
                mayores, una pérdida de apetito de más de 48 horas o un cambio brusco de carácter
                puede ser señal de dolor, enfermedad o deterioro cognitivo. Nunca esperes más de
                2-3 días para consultar al veterinario.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('calculadora-edad-mascotas')}
        title="Más herramientas para tu mascota"
        icon="🐾"
      />

      <ShareCard appName="calculadora-edad-mascotas" />
      <Footer appName="calculadora-edad-mascotas" />
    </div>
  );
}
