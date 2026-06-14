'use client';

import { useState, useMemo } from 'react';
import styles from './VitaminasMinerales.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  NUTRIENTS,
  TIPOS,
  SUBTIPOS,
  TIPO_EMOJI,
  SUBTIPO_EMOJI,
  type NutrientType,
  type NutrientSubtype
} from '@/data/nutrients';

export default function VitaminasMineralesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NutrientType | 'Todos'>('Todos');
  const [selectedSubtype, setSelectedSubtype] = useState<NutrientSubtype | 'Todos'>('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtrar nutrientes
  const filteredNutrients = useMemo(() => {
    return NUTRIENTS.filter(nutrient => {
      const matchesSearch =
        nutrient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nutrient.nombreCientifico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nutrient.funcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nutrient.fuentes.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'Todos' || nutrient.tipo === selectedType;
      const matchesSubtype = selectedSubtype === 'Todos' || nutrient.subtipo === selectedSubtype;

      return matchesSearch && matchesType && matchesSubtype;
    });
  }, [searchTerm, selectedType, selectedSubtype]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filtrar subtipos según el tipo seleccionado
  const availableSubtypes = useMemo(() => {
    if (selectedType === 'Todos') return SUBTIPOS;
    if (selectedType === 'Vitamina') return ['Hidrosoluble', 'Liposoluble'] as NutrientSubtype[];
    return ['Macromineral', 'Oligoelemento'] as NutrientSubtype[];
  }, [selectedType]);

  // Reset subtipo si no es válido para el tipo seleccionado
  const handleTypeChange = (newType: NutrientType | 'Todos') => {
    setSelectedType(newType);
    if (newType !== 'Todos') {
      const validSubtypes = newType === 'Vitamina'
        ? ['Hidrosoluble', 'Liposoluble']
        : ['Macromineral', 'Oligoelemento'];
      if (selectedSubtype !== 'Todos' && !validSubtypes.includes(selectedSubtype)) {
        setSelectedSubtype('Todos');
      }
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🥗</span>
        <h1 className={styles.title}>Vitaminas y Minerales</h1>
        <p className={styles.subtitle}>
          Guía de 30 nutrientes esenciales: funciones, fuentes alimentarias,
          dosis recomendada y síntomas de deficiencia
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
      />

      {/* Buscador y Filtros */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            type="text"
            aria-label="Buscar nutriente por nombre, función o alimento"
            placeholder="Buscar por nombre, función o alimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="filter-tipo" className={styles.filterLabel}>Tipo:</label>
            <select
              id="filter-tipo"
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value as NutrientType | 'Todos')}
              className={styles.filterSelect}
            >
              <option value="Todos">Todos</option>
              {TIPOS.map(tipo => (
                <option key={tipo} value={tipo}>{TIPO_EMOJI[tipo]} {tipo}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filter-subtipo" className={styles.filterLabel}>Subtipo:</label>
            <select
              id="filter-subtipo"
              value={selectedSubtype}
              onChange={(e) => setSelectedSubtype(e.target.value as NutrientSubtype | 'Todos')}
              className={styles.filterSelect}
            >
              <option value="Todos">Todos</option>
              {availableSubtypes.map(subtipo => (
                <option key={subtipo} value={subtipo}>{SUBTIPO_EMOJI[subtipo]} {subtipo}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.resultsCount} role="status" aria-live="polite" aria-atomic="true">
          Mostrando {filteredNutrients.length} de {NUTRIENTS.length} nutrientes
        </div>
      </div>

      {/* Grid de Nutrientes */}
      <div className={styles.nutrientsGrid}>
        {filteredNutrients.map(nutrient => (
          <article
            key={nutrient.id}
            className={`${styles.nutrientCard} ${expandedId === nutrient.id ? styles.expanded : ''}`}
            role="button"
            tabIndex={0}
            aria-expanded={expandedId === nutrient.id}
            onClick={() => toggleExpand(nutrient.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(nutrient.id); } }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <span className={styles.typeEmoji} aria-hidden="true">{TIPO_EMOJI[nutrient.tipo]}</span>
                <div>
                  <h2 className={styles.nutrientName}>{nutrient.nombre}</h2>
                  <p className={styles.scientificName}>{nutrient.nombreCientifico}</p>
                </div>
              </div>
              <span className={styles.expandIcon} aria-hidden="true">
                {expandedId === nutrient.id ? '−' : '+'}
              </span>
            </div>

            <div className={styles.cardBasicInfo}>
              <span className={styles.badge} data-type={nutrient.tipo.toLowerCase()}>
                {nutrient.tipo}
              </span>
              <span className={styles.badge} data-subtype={nutrient.subtipo.toLowerCase().replace(' ', '')}>
                {SUBTIPO_EMOJI[nutrient.subtipo]} {nutrient.subtipo}
              </span>
              <span className={styles.cdrBadge}>
                CDR: {nutrient.cdrAdultos}
              </span>
            </div>

            <p className={styles.functionPreview}>
              {nutrient.funcion.length > 120
                ? nutrient.funcion.substring(0, 120) + '...'
                : nutrient.funcion}
            </p>

            {/* Contenido expandido */}
            {expandedId === nutrient.id && (
              <div className={styles.cardDetails}>
                <div className={styles.detailSection}>
                  <h3><span aria-hidden="true">⚡</span> Función</h3>
                  <p>{nutrient.funcion}</p>
                </div>

                <div className={styles.detailSection}>
                  <h3><span aria-hidden="true">🥦</span> Fuentes Alimentarias</h3>
                  <div className={styles.sourcesList}>
                    {nutrient.fuentes.map((fuente, index) => (
                      <span key={index} className={styles.sourceTag}>
                        {fuente}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3><span aria-hidden="true">📊</span> Dosis Diaria Recomendada</h3>
                  <p className={styles.cdrValue}>{nutrient.cdrAdultos}</p>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailBox}>
                    <h3><span aria-hidden="true">⚠️</span> Deficiencia</h3>
                    <p>{nutrient.deficiencia}</p>
                  </div>
                  <div className={styles.detailBox}>
                    <h3><span aria-hidden="true">🚫</span> Exceso</h3>
                    <p>{nutrient.exceso}</p>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3><span aria-hidden="true">👥</span> Grupos de Riesgo</h3>
                  <div className={styles.riskGroups}>
                    {nutrient.gruposRiesgo.map((grupo, index) => (
                      <span key={index} className={styles.riskTag}>
                        {grupo}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3><span aria-hidden="true">💡</span> Curiosidad</h3>
                  <p className={styles.curiosity}>{nutrient.curiosidad}</p>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredNutrients.length === 0 && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon} aria-hidden="true">🔬</span>
          <p>No se encontraron nutrientes con esos criterios.</p>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              setSearchTerm('');
              setSelectedType('Todos');
              setSelectedSubtype('Todos');
            }}
          >
            Mostrar todos
          </button>
        </div>
      )}

      {/* Sección Educativa */}
      <EducationalSection
        title="¿Quieres saber más sobre nutrición?"
        subtitle="Aprende sobre los tipos de nutrientes, cómo optimizar su absorción y las necesidades especiales"
        icon="📚"
      >
        {/* Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Nutriente</th>
                <th>Tipo</th>
                <th>CDR adulto</th>
                <th>Síntoma de deficiencia</th>
                <th>Mejores fuentes alimentarias</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Vitamina D</strong></td>
                <td>Liposoluble</td>
                <td>15-20 μg/día</td>
                <td>Debilidad ósea, fatiga, inmunidad baja</td>
                <td>Sol, pescado azul, huevos, leche enriquecida</td>
              </tr>
              <tr>
                <td><strong>Vitamina B12</strong></td>
                <td>Hidrosoluble</td>
                <td>2,4 μg/día</td>
                <td>Anemia megaloblástica, daño neurológico</td>
                <td>Carne, pescado, huevos, lácteos (solo animales)</td>
              </tr>
              <tr>
                <td><strong>Vitamina C</strong></td>
                <td>Hidrosoluble</td>
                <td>75-90 mg/día</td>
                <td>Escorbuto, fatiga, mala cicatrización</td>
                <td>Pimiento, kiwi, naranja, fresas, brócoli</td>
              </tr>
              <tr>
                <td><strong>Hierro</strong></td>
                <td>Oligoelemento</td>
                <td>8-18 mg/día</td>
                <td>Anemia ferropénica, cansancio extremo</td>
                <td>Carne roja, lentejas, espinacas, semillas</td>
              </tr>
              <tr>
                <td><strong>Calcio</strong></td>
                <td>Macromineral</td>
                <td>1.000-1.200 mg/día</td>
                <td>Osteoporosis, calambres, palpitaciones</td>
                <td>Lácteos, tofu, almendras, brócoli, sardinas</td>
              </tr>
              <tr>
                <td><strong>Magnesio</strong></td>
                <td>Macromineral</td>
                <td>310-420 mg/día</td>
                <td>Calambres, ansiedad, insomnio, fatiga</td>
                <td>Frutos secos, legumbres, cacao, cereales integrales</td>
              </tr>
              <tr>
                <td><strong>Zinc</strong></td>
                <td>Oligoelemento</td>
                <td>8-11 mg/día</td>
                <td>Inmunidad débil, pérdida de gusto/olfato</td>
                <td>Ostras, carne, semillas de calabaza, legumbres</td>
              </tr>
              <tr>
                <td><strong>Ácido fólico (B9)</strong></td>
                <td>Hidrosoluble</td>
                <td>400 μg/día</td>
                <td>Anemia, defectos tubo neural (embarazo)</td>
                <td>Legumbres, vegetales de hoja verde, hígado</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escenarios de uso */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>🌱 Dieta vegana</h3>
            <p>Busca vitamina B12 (obligatoria suplementar), vitamina D, zinc, hierro, calcio y omega-3. La B12 solo existe en alimentos de origen animal — la suplementación es indispensable.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🤰 Embarazo y lactancia</h3>
            <p>Ácido fólico desde antes de concebir (previene defectos del tubo neural), hierro, yodo y vitamina D son prioritarios. Muchos médicos recomiendan un suplemento prenatal completo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🏃 Deportistas</h3>
            <p>Mayor demanda de hierro (especialmente en mujeres con entrenamiento de resistencia), magnesio (calambres), vitaminas del grupo B (metabolismo energético) y antioxidantes C y E.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>👴 Mayores de 65 años</h3>
            <p>La absorción de B12 disminuye con la edad. La síntesis de vitamina D por el sol es menos eficiente. El calcio y la vitamina D son críticos para prevenir osteoporosis y caídas.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>💊 Verificar un análisis de sangre</h3>
            <p>Cuando el médico detecta deficiencia de un nutriente específico, usa las fichas de la app para entender qué función cumple, qué alimentos aportarlo y qué síntomas son de exceso.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>🥗 Planificar una dieta saludable</h3>
            <p>Usa los filtros para identificar los nutrientes más importantes de cada grupo (hidrosolubles, liposolubles, macrominerales) y asegurarte de que tu dieta los cubre desde alimentos reales.</p>
          </div>
        </div>

        {/* FAQ */}
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <h3>¿Necesito tomar un multivitamínico a diario?</h3>
            <p>Generalmente no, si llevas una dieta variada y equilibrada. Los multivitamínicos pueden dar una falsa sensación de seguridad y no compensan una mala alimentación. Las excepciones son veganos (B12), embarazadas (ácido fólico), mayores de 65 (D y B12) y personas con dietas muy restrictivas.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cuánto sol necesito para obtener suficiente vitamina D?</h3>
            <p>Aproximadamente 15-30 minutos de exposición solar en cara, brazos y piernas entre las 10:00 y las 15:00, sin protección solar, 3-4 días por semana. En invierno en latitudes como España, la síntesis es insuficiente de noviembre a febrero, por lo que la suplementación puede estar justificada.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Puedo obtener vitamina B12 de algas o levadura de cerveza?</h3>
            <p>No de forma fiable. Las algas contienen análogos de B12 que el cuerpo no puede utilizar (pseudovitamina B12). La levadura de cerveza tampoco contiene B12 a menos que esté específicamente enriquecida. Los veganos deben suplementar con cianocobalamina o metilcobalamina.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cómo obtengo suficiente calcio sin lácteos?</h3>
            <p>El tofu elaborado con sulfato de calcio, las bebidas vegetales enriquecidas, las almendras, el brócoli, el kale, las sardinas con espinas y los higos secos son buenas fuentes. La absorción mejora con vitamina D. Evita tomar calcio junto con café, té o alimentos ricos en hierro.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿El hierro de las plantas absorbe igual que el de la carne?</h3>
            <p>No. El hierro hemo (carne, pescado) se absorbe en un 15-35%. El hierro no hemo (legumbres, espinacas) solo un 2-20%. Combinar hierro vegetal con vitamina C multiplica su absorción. Los taninos del café y té la reducen significativamente.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Puede ser peligroso tomar demasiadas vitaminas?</h3>
            <p>Sí, especialmente las liposolubles (A, D, E, K) que se acumulan en el organismo. El exceso de vitamina A puede causar toxicidad hepática y defectos en el embarazo. El exceso de vitamina D provoca hipercalcemia. Las hidrosolubles (B y C) son más seguras ya que el exceso se elimina por orina, aunque dosis muy altas de B6 pueden causar neuropatía.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Es verdad que el zinc ayuda contra los resfriados?</h3>
            <p>Hay evidencia moderada de que el zinc (en pastillas o jarabe, tomado en las primeras 24h del resfriado) puede reducir su duración ~1 día. No previene el resfriado, pero puede acortar los síntomas. Las dosis altas a largo plazo pueden interferir con la absorción de cobre.</p>
          </li>
          <li className={styles.faqItem}>
            <h3>¿Cuándo debo tomar suplementos con comida?</h3>
            <p>Las vitaminas liposolubles (A, D, E, K) deben tomarse con una comida que contenga grasa para optimizar su absorción. El hierro se absorbe mejor en ayunas o con vitamina C, pero puede irritar el estómago — en ese caso, tómalo con algo de comida. El calcio en dosis altas es mejor dividirlo en dos tomas.</p>
          </li>
        </ul>

        {/* Guía paso a paso */}
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Identifica qué nutrientes te interesan</h3>
              <p>Usa los filtros de la app: puedes filtrar por tipo (vitamina/mineral) y subtipo (hidrosoluble, liposoluble, macromineral, oligoelemento).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Lee la CDR (Cantidad Diaria Recomendada)</h3>
              <p>Cada ficha indica la CDR para adultos. Ten en cuenta que embarazadas, deportistas, veganos y mayores pueden necesitar cantidades diferentes.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Revisa las fuentes alimentarias</h3>
              <p>Identifica qué alimentos de tu dieta habitual aportan cada nutriente. Si no consumes regularmente esas fuentes, considera si estás cubriendo tus necesidades.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Comprueba los síntomas de deficiencia</h3>
              <p>Si reconoces síntomas descritos en la ficha de un nutriente, no te autodiagnostiques — consulta con tu médico para que realice un análisis de sangre confirmatorio.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Aprende las interacciones entre nutrientes</h3>
              <p>Algunos nutrientes se potencian mutuamente (vitamina C + hierro) y otros compiten (calcio vs hierro). Conocer estas interacciones optimiza tu dieta.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Evalúa si tu dieta es completa</h3>
              <p>Repasa los 30 nutrientes de la guía. Si hay grupos completos de alimentos que no consumes (lácteos, carnes, pescados), identifica qué nutrientes pueden estar en riesgo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Consulta a un profesional si tienes dudas</h3>
              <p>Un dietista-nutricionista puede hacer una valoración personalizada de tu dieta y recomendar suplementación específica si es necesario, basándose en analíticas y tu historial.</p>
            </div>
          </div>
        </div>

        {/* Mejores prácticas */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>🥇 Prioriza alimentos reales</h3>
            <p>Los nutrientes de los alimentos vienen con fibra, fitoquímicos y cofactores que potencian su absorción. Los suplementos son un complemento, no un sustituto.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>☀️ Vitamina D y sol</h3>
            <p>La vitamina D del sol es más eficiente que la del suplemento. 15-20 minutos de exposición sin crema solar en cara y brazos al mediodía genera suficiente vitamina D en verano.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🍋 Vitamina C con hierro vegetal</h3>
            <p>Añade limón a las lentejas, pimiento rojo a los garbanzos o kiwi de postre después de un plato con espinacas para triplicar la absorción del hierro no hemo.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>⏰ Timing de los suplementos</h3>
            <p>Liposolubles (A, D, E, K) con comida grasa. Hierro en ayunas o con C. No mezcles calcio e hierro en la misma toma. Magnesio por la noche puede mejorar el sueño.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🎨 Variedad de colores en el plato</h3>
            <p>Cada color de fruta y verdura indica fitoquímicos y vitaminas diferentes. Un plato colorido (verde, naranja, rojo, morado) cubre más vitaminas que uno monocromático.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📋 Analítica anual</h3>
            <p>Una analítica básica anual detecta deficiencias antes de que sean sintomáticas. Pide a tu médico que incluya vitamina D, B12, ferritina y hemograma completo.</p>
          </div>
        </div>

        {/* Aviso importante */}
        <div className={styles.warningBox}>
          <h3>⚠️ Información orientativa, no asesoramiento médico</h3>
          <ul className={styles.warningList}>
            <li>Esta guía de nutrientes es informativa y educativa. No reemplaza la consulta con un médico o dietista-nutricionista.</li>
            <li>Los síntomas de deficiencia o exceso de nutrientes requieren confirmación mediante análisis de sangre realizados por profesionales sanitarios.</li>
            <li>No inicies suplementación de hierro, vitamina A u otros nutrientes con límite de toxicidad sin prescripción médica.</li>
            <li>Las cantidades diarias recomendadas (CDR) son referencias para adultos sanos. Embarazadas, enfermos y niños tienen necesidades diferentes.</li>
          </ul>
        </div>

        <section className={styles.guideSection}>
          <h2>Tipos de Vitaminas</h2>
          <p className={styles.introParagraph}>
            Las vitaminas se clasifican según cómo se disuelven y almacenan en el cuerpo.
            Esta distinción es importante para entender su absorción y posible toxicidad.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>💧 Hidrosolubles (B y C)</h4>
              <p>
                Se disuelven en agua y no se almacenan significativamente.
                El exceso se elimina por orina, por lo que la toxicidad es rara.
                Requieren ingesta regular ya que el cuerpo no las guarda.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🫒 Liposolubles (A, D, E, K)</h4>
              <p>
                Se disuelven en grasa y se almacenan en hígado y tejido adiposo.
                No necesitan ingesta diaria, pero el exceso puede acumularse
                y causar toxicidad. Se absorben mejor con grasas dietéticas.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Tipos de Minerales</h2>
          <p className={styles.introParagraph}>
            Los minerales se clasifican por la cantidad que necesita el cuerpo,
            no por su importancia (todos son esenciales).
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🪨 Macrominerales</h4>
              <p>
                Se necesitan en cantidades de 100+ mg/día: calcio, fósforo,
                magnesio, sodio, potasio, cloro y azufre. Fundamentales
                para estructura ósea, equilibrio de fluidos y función nerviosa.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>✨ Oligoelementos (Traza)</h4>
              <p>
                Se necesitan en cantidades pequeñas (&lt;100 mg/día): hierro,
                zinc, cobre, yodo, selenio, etc. Igual de esenciales,
                actúan como cofactores enzimáticos y antioxidantes.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Optimizar la Absorción</h2>
          <p className={styles.introParagraph}>
            La forma en que combinamos alimentos afecta cuántos nutrientes aprovechamos.
          </p>

          <ul className={styles.tipsList}>
            <li><strong>Vitamina C + Hierro:</strong> La vitamina C mejora la absorción del hierro no hemo (vegetal). Añade limón a las lentejas.</li>
            <li><strong>Vitaminas liposolubles + Grasa:</strong> Come zanahorias (vit. A) con aceite de oliva para mejor absorción.</li>
            <li><strong>Calcio vs Hierro:</strong> Compiten por absorción. Separa lácteos de comidas ricas en hierro.</li>
            <li><strong>Café/Té + Hierro:</strong> Los taninos reducen la absorción de hierro. Espera 1-2 horas después de comer.</li>
            <li><strong>Vitamina D + Calcio:</strong> La D es necesaria para absorber calcio. Tomar el sol ayuda a ambos.</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Grupos con Necesidades Especiales</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🤰 Embarazadas</h4>
              <p>
                Ácido fólico (previene defectos tubo neural), hierro,
                calcio, vitamina D y yodo. Suplementación recomendada.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🌱 Veganos</h4>
              <p>
                B12 (obligatoria), vitamina D, hierro, zinc, calcio,
                omega-3. La B12 solo está en alimentos animales.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>👴 Mayores de 65</h4>
              <p>
                B12 (menor absorción), vitamina D (menor síntesis),
                calcio, proteínas. Mayor riesgo de deficiencias.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🏃 Deportistas</h4>
              <p>
                Hierro (especialmente mujeres), magnesio, zinc,
                vitaminas del grupo B, antioxidantes (C, E).
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Necesito Suplementos?</h2>
          <p className={styles.introParagraph}>
            Una dieta variada suele cubrir las necesidades de la mayoría de personas.
            Los suplementos están indicados en casos específicos.
          </p>

          <ul className={styles.tipsList}>
            <li><strong>Vitamina D:</strong> Probablemente el suplemento más útil, especialmente en invierno y para quien no toma sol.</li>
            <li><strong>B12:</strong> Obligatoria para veganos. Recomendada para mayores de 50.</li>
            <li><strong>Ácido fólico:</strong> Todas las mujeres que planean embarazo deben tomarlo desde antes de concebir.</li>
            <li><strong>Hierro:</strong> Solo con diagnóstico de deficiencia. El exceso es perjudicial.</li>
            <li><strong>Multivitamínicos:</strong> No reemplazan una buena dieta y pueden dar falsa sensación de seguridad.</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('vitaminas-minerales')} />
      <ShareCard appName="vitaminas-minerales" />
      <Footer appName="vitaminas-minerales" />
    </div>
  );
}
