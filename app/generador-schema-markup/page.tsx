'use client';

import { useState } from 'react';
import styles from './GeneradorSchemaMarkup.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type SchemaType = 'article' | 'product' | 'faq' | 'localbusiness' | 'recipe';

interface FAQItem {
  question: string;
  answer: string;
}

export default function GeneradorSchemaMarkupPage() {
  const [schemaType, setSchemaType] = useState<SchemaType>('article');
  const [copied, setCopied] = useState(false);

  // Article state
  const [articleData, setArticleData] = useState({
    headline: '',
    description: '',
    image: '',
    authorName: '',
    publisherName: '',
    publisherLogo: '',
    datePublished: '',
    dateModified: '',
    url: ''
  });

  // Product state
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    image: '',
    brand: '',
    sku: '',
    price: '',
    currency: 'EUR',
    availability: 'InStock',
    url: '',
    ratingValue: '',
    reviewCount: ''
  });

  // FAQ state
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    { question: '', answer: '' }
  ]);

  // LocalBusiness state
  const [businessData, setBusinessData] = useState({
    name: '',
    description: '',
    image: '',
    telephone: '',
    email: '',
    url: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: 'ES',
    priceRange: '€€',
    openingHours: 'Mo-Fr 09:00-18:00'
  });

  // Recipe state
  const [recipeData, setRecipeData] = useState({
    name: '',
    description: '',
    image: '',
    authorName: '',
    prepTime: '15',
    cookTime: '30',
    totalTime: '45',
    servings: '4',
    calories: '',
    ingredients: '',
    instructions: ''
  });

  const generateSchema = (): string => {
    let schema: object;

    switch (schemaType) {
      case 'article':
        schema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": articleData.headline || "Título del artículo",
          "description": articleData.description || "Descripción del artículo",
          "image": articleData.image || "https://ejemplo.com/imagen.jpg",
          "author": {
            "@type": "Person",
            "name": articleData.authorName || "Nombre del autor"
          },
          "publisher": {
            "@type": "Organization",
            "name": articleData.publisherName || "Nombre del sitio",
            "logo": {
              "@type": "ImageObject",
              "url": articleData.publisherLogo || "https://ejemplo.com/logo.png"
            }
          },
          "datePublished": articleData.datePublished || new Date().toISOString().split('T')[0],
          "dateModified": articleData.dateModified || new Date().toISOString().split('T')[0],
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": articleData.url || "https://ejemplo.com/articulo"
          }
        };
        break;

      case 'product':
        schema = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": productData.name || "Nombre del producto",
          "description": productData.description || "Descripción del producto",
          "image": productData.image || "https://ejemplo.com/producto.jpg",
          "brand": {
            "@type": "Brand",
            "name": productData.brand || "Marca"
          },
          "sku": productData.sku || "SKU123",
          "offers": {
            "@type": "Offer",
            "price": productData.price || "29.99",
            "priceCurrency": productData.currency,
            "availability": `https://schema.org/${productData.availability}`,
            "url": productData.url || "https://ejemplo.com/producto"
          },
          ...(productData.ratingValue && productData.reviewCount && {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": productData.ratingValue,
              "reviewCount": productData.reviewCount
            }
          })
        };
        break;

      case 'faq':
        const validFaqs = faqItems.filter(f => f.question && f.answer);
        schema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": validFaqs.length > 0 ? validFaqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          })) : [{
            "@type": "Question",
            "name": "¿Pregunta de ejemplo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Respuesta de ejemplo."
            }
          }]
        };
        break;

      case 'localbusiness':
        schema = {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": businessData.name || "Nombre del negocio",
          "description": businessData.description || "Descripción del negocio",
          "image": businessData.image || "https://ejemplo.com/negocio.jpg",
          "telephone": businessData.telephone || "+34 912 345 678",
          "email": businessData.email || "info@ejemplo.com",
          "url": businessData.url || "https://ejemplo.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": businessData.streetAddress || "Calle Ejemplo 123",
            "addressLocality": businessData.city || "Madrid",
            "postalCode": businessData.postalCode || "28001",
            "addressCountry": businessData.country
          },
          "priceRange": businessData.priceRange,
          "openingHours": businessData.openingHours
        };
        break;

      case 'recipe':
        schema = {
          "@context": "https://schema.org",
          "@type": "Recipe",
          "name": recipeData.name || "Nombre de la receta",
          "description": recipeData.description || "Descripción de la receta",
          "image": recipeData.image || "https://ejemplo.com/receta.jpg",
          "author": {
            "@type": "Person",
            "name": recipeData.authorName || "Chef"
          },
          "prepTime": `PT${recipeData.prepTime}M`,
          "cookTime": `PT${recipeData.cookTime}M`,
          "totalTime": `PT${recipeData.totalTime}M`,
          "recipeYield": `${recipeData.servings} porciones`,
          ...(recipeData.calories && {
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": `${recipeData.calories} calorías`
            }
          }),
          "recipeIngredient": recipeData.ingredients ?
            recipeData.ingredients.split('\n').filter(i => i.trim()) :
            ["Ingrediente 1", "Ingrediente 2"],
          "recipeInstructions": recipeData.instructions ?
            recipeData.instructions.split('\n').filter(i => i.trim()).map((step, idx) => ({
              "@type": "HowToStep",
              "position": idx + 1,
              "text": step
            })) :
            [{ "@type": "HowToStep", "position": 1, "text": "Paso 1" }]
        };
        break;

      default:
        schema = {};
    }

    return JSON.stringify(schema, null, 2);
  };

  const copyToClipboard = () => {
    const scriptTag = `<script type="application/ld+json">\n${generateSchema()}\n</script>`;
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: '', answer: '' }]);
  };

  const removeFaqItem = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqItems];
    updated[index][field] = value;
    setFaqItems(updated);
  };

  const schemaTypes = [
    { id: 'article', name: 'Article', icon: '📰', desc: 'Blog posts y noticias' },
    { id: 'product', name: 'Product', icon: '🛒', desc: 'Productos de ecommerce' },
    { id: 'faq', name: 'FAQ', icon: '❓', desc: 'Preguntas frecuentes' },
    { id: 'localbusiness', name: 'LocalBusiness', icon: '🏪', desc: 'Negocios locales' },
    { id: 'recipe', name: 'Recipe', icon: '🍳', desc: 'Recetas de cocina' }
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Schema Markup</h1>
        <p className={styles.subtitle}>
          Crea datos estructurados JSON-LD para mejorar tu SEO
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible={true}
        context="generador-schema-markup-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.panelTitle}>Tipo de Schema</h2>

          <div className={styles.schemaTypes}>
            {schemaTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`${styles.schemaTypeBtn} ${schemaType === type.id ? styles.active : ''}`}
                onClick={() => setSchemaType(type.id as SchemaType)}
                aria-pressed={schemaType === type.id}
              >
                <span className={styles.schemaIcon} aria-hidden="true">{type.icon}</span>
                <span className={styles.schemaName}>{type.name}</span>
                <span className={styles.schemaDesc}>{type.desc}</span>
              </button>
            ))}
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <span aria-hidden="true">{schemaTypes.find(t => t.id === schemaType)?.icon}</span> Datos de {schemaTypes.find(t => t.id === schemaType)?.name}
            </h3>

            {/* Article Form */}
            {schemaType === 'article' && (
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Título del artículo *</label>
                  <input
                    type="text"
                    value={articleData.headline}
                    onChange={(e) => setArticleData({ ...articleData, headline: e.target.value })}
                    placeholder="Los 10 mejores trucos de SEO"
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>Descripción</label>
                  <textarea
                    value={articleData.description}
                    onChange={(e) => setArticleData({ ...articleData, description: e.target.value })}
                    placeholder="Resumen del artículo..."
                    rows={2}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>URL de la imagen</label>
                  <input
                    type="url"
                    value={articleData.image}
                    onChange={(e) => setArticleData({ ...articleData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Nombre del autor</label>
                  <input
                    type="text"
                    value={articleData.authorName}
                    onChange={(e) => setArticleData({ ...articleData, authorName: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Nombre del sitio</label>
                  <input
                    type="text"
                    value={articleData.publisherName}
                    onChange={(e) => setArticleData({ ...articleData, publisherName: e.target.value })}
                    placeholder="Mi Blog"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Logo del sitio (URL)</label>
                  <input
                    type="url"
                    value={articleData.publisherLogo}
                    onChange={(e) => setArticleData({ ...articleData, publisherLogo: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Fecha publicación</label>
                  <input
                    type="date"
                    value={articleData.datePublished}
                    onChange={(e) => setArticleData({ ...articleData, datePublished: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Fecha modificación</label>
                  <input
                    type="date"
                    value={articleData.dateModified}
                    onChange={(e) => setArticleData({ ...articleData, dateModified: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>URL del artículo</label>
                  <input
                    type="url"
                    value={articleData.url}
                    onChange={(e) => setArticleData({ ...articleData, url: e.target.value })}
                    placeholder="https://miblog.com/articulo"
                  />
                </div>
              </div>
            )}

            {/* Product Form */}
            {schemaType === 'product' && (
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Nombre del producto *</label>
                  <input
                    type="text"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    placeholder="Camiseta Premium"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Marca</label>
                  <input
                    type="text"
                    value={productData.brand}
                    onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                    placeholder="MiMarca"
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>Descripción</label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    placeholder="Descripción del producto..."
                    rows={2}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Precio</label>
                  <input
                    type="text"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    placeholder="29.99"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Moneda</label>
                  <select
                    value={productData.currency}
                    onChange={(e) => setProductData({ ...productData, currency: e.target.value })}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Disponibilidad</label>
                  <select
                    value={productData.availability}
                    onChange={(e) => setProductData({ ...productData, availability: e.target.value })}
                  >
                    <option value="InStock">En stock</option>
                    <option value="OutOfStock">Agotado</option>
                    <option value="PreOrder">Reserva</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>SKU</label>
                  <input
                    type="text"
                    value={productData.sku}
                    onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>URL imagen</label>
                  <input
                    type="url"
                    value={productData.image}
                    onChange={(e) => setProductData({ ...productData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>URL producto</label>
                  <input
                    type="url"
                    value={productData.url}
                    onChange={(e) => setProductData({ ...productData, url: e.target.value })}
                    placeholder="https://tienda.com/producto"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Rating (1-5)</label>
                  <input
                    type="text"
                    value={productData.ratingValue}
                    onChange={(e) => setProductData({ ...productData, ratingValue: e.target.value })}
                    placeholder="4.5"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Nº de reseñas</label>
                  <input
                    type="text"
                    value={productData.reviewCount}
                    onChange={(e) => setProductData({ ...productData, reviewCount: e.target.value })}
                    placeholder="120"
                  />
                </div>
              </div>
            )}

            {/* FAQ Form */}
            {schemaType === 'faq' && (
              <div className={styles.faqForm}>
                {faqItems.map((item, index) => (
                  <div key={index} className={styles.faqItem}>
                    <div className={styles.faqHeader}>
                      <span>Pregunta {index + 1}</span>
                      {faqItems.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeFaqItem(index)}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                      placeholder="¿Cuál es la pregunta?"
                    />
                    <textarea
                      value={item.answer}
                      onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                      placeholder="La respuesta a la pregunta..."
                      rows={3}
                    />
                  </div>
                ))}
                <button type="button" className={styles.addFaqBtn} onClick={addFaqItem}>
                  + Añadir otra pregunta
                </button>
              </div>
            )}

            {/* LocalBusiness Form */}
            {schemaType === 'localbusiness' && (
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Nombre del negocio *</label>
                  <input
                    type="text"
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                    placeholder="Restaurante El Buen Sabor"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={businessData.telephone}
                    onChange={(e) => setBusinessData({ ...businessData, telephone: e.target.value })}
                    placeholder="+34 912 345 678"
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>Descripción</label>
                  <textarea
                    value={businessData.description}
                    onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                    placeholder="Descripción del negocio..."
                    rows={2}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={businessData.streetAddress}
                    onChange={(e) => setBusinessData({ ...businessData, streetAddress: e.target.value })}
                    placeholder="Calle Mayor 123"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Ciudad</label>
                  <input
                    type="text"
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    placeholder="Madrid"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Código postal</label>
                  <input
                    type="text"
                    value={businessData.postalCode}
                    onChange={(e) => setBusinessData({ ...businessData, postalCode: e.target.value })}
                    placeholder="28001"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>País</label>
                  <select
                    value={businessData.country}
                    onChange={(e) => setBusinessData({ ...businessData, country: e.target.value })}
                  >
                    <option value="ES">España</option>
                    <option value="MX">México</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Rango de precios</label>
                  <select
                    value={businessData.priceRange}
                    onChange={(e) => setBusinessData({ ...businessData, priceRange: e.target.value })}
                  >
                    <option value="€">€ - Económico</option>
                    <option value="€€">€€ - Moderado</option>
                    <option value="€€€">€€€ - Caro</option>
                    <option value="€€€€">€€€€ - Muy caro</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    placeholder="info@negocio.com"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Web</label>
                  <input
                    type="url"
                    value={businessData.url}
                    onChange={(e) => setBusinessData({ ...businessData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>Horario de apertura</label>
                  <input
                    type="text"
                    value={businessData.openingHours}
                    onChange={(e) => setBusinessData({ ...businessData, openingHours: e.target.value })}
                    placeholder="Mo-Fr 09:00-18:00, Sa 10:00-14:00"
                  />
                </div>
              </div>
            )}

            {/* Recipe Form */}
            {schemaType === 'recipe' && (
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Nombre de la receta *</label>
                  <input
                    type="text"
                    value={recipeData.name}
                    onChange={(e) => setRecipeData({ ...recipeData, name: e.target.value })}
                    placeholder="Paella Valenciana"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Autor</label>
                  <input
                    type="text"
                    value={recipeData.authorName}
                    onChange={(e) => setRecipeData({ ...recipeData, authorName: e.target.value })}
                    placeholder="Chef María"
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>Descripción</label>
                  <textarea
                    value={recipeData.description}
                    onChange={(e) => setRecipeData({ ...recipeData, description: e.target.value })}
                    placeholder="Descripción de la receta..."
                    rows={2}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Prep. (min)</label>
                  <input
                    type="number"
                    value={recipeData.prepTime}
                    onChange={(e) => setRecipeData({ ...recipeData, prepTime: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Cocción (min)</label>
                  <input
                    type="number"
                    value={recipeData.cookTime}
                    onChange={(e) => setRecipeData({ ...recipeData, cookTime: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Total (min)</label>
                  <input
                    type="number"
                    value={recipeData.totalTime}
                    onChange={(e) => setRecipeData({ ...recipeData, totalTime: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Porciones</label>
                  <input
                    type="number"
                    value={recipeData.servings}
                    onChange={(e) => setRecipeData({ ...recipeData, servings: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Calorías</label>
                  <input
                    type="number"
                    value={recipeData.calories}
                    onChange={(e) => setRecipeData({ ...recipeData, calories: e.target.value })}
                    placeholder="350"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>URL imagen</label>
                  <input
                    type="url"
                    value={recipeData.image}
                    onChange={(e) => setRecipeData({ ...recipeData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>Ingredientes (uno por línea)</label>
                  <textarea
                    value={recipeData.ingredients}
                    onChange={(e) => setRecipeData({ ...recipeData, ingredients: e.target.value })}
                    placeholder="200g de arroz&#10;1 pollo troceado&#10;100g de judías verdes"
                    rows={4}
                  />
                </div>
                <div className={styles.inputGroupFull}>
                  <label>Instrucciones (un paso por línea)</label>
                  <textarea
                    value={recipeData.instructions}
                    onChange={(e) => setRecipeData({ ...recipeData, instructions: e.target.value })}
                    placeholder="Calentar el aceite en la paella&#10;Añadir el pollo y dorar&#10;Agregar las verduras"
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de código */}
        <div className={styles.codePanel}>
          <div className={styles.codePanelHeader}>
            <h2 className={styles.panelTitle}>Código JSON-LD</h2>
            <button
              type="button"
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={copyToClipboard}
            >
              {copied ? '✓ Copiado' : 'Copiar código'}
            </button>
          </div>

          <div className={styles.codeBlock}>
            <pre>
              <code>{`<script type="application/ld+json">\n${generateSchema()}\n</script>`}</code>
            </pre>
          </div>

          <div className={styles.instructions}>
            <h4>Cómo usar este código</h4>
            <ol>
              <li>Copia el código completo (incluyendo las etiquetas script)</li>
              <li>Pégalo en el &lt;head&gt; de tu página HTML</li>
              <li>Valida con la herramienta de Google Rich Results Test</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="Todo sobre Schema Markup y datos estructurados"
        subtitle="Mejora tu visibilidad en Google con rich snippets"
      >
        <div className={styles.educationalContent}>
          {/* Contenido original conservado */}
          <section className={styles.eduSection}>
            <h2>¿Qué es Schema Markup?</h2>
            <p>
              Schema Markup es un vocabulario de datos estructurados que ayuda a los
              motores de búsqueda a entender mejor el contenido de tu página. Cuando
              añades Schema a tu sitio, Google puede mostrar rich snippets mejorados
              en los resultados de búsqueda.
            </p>
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <span className={styles.benefitIcon} aria-hidden="true">⭐</span>
                <h4>Rich Snippets</h4>
                <p>Estrellas, precios, disponibilidad directamente en Google</p>
              </div>
              <div className={styles.benefitCard}>
                <span className={styles.benefitIcon} aria-hidden="true">📈</span>
                <h4>Mayor CTR</h4>
                <p>Los resultados enriquecidos destacan más y reciben más clics</p>
              </div>
              <div className={styles.benefitCard}>
                <span className={styles.benefitIcon} aria-hidden="true">🔍</span>
                <h4>Mejor SEO</h4>
                <p>Google entiende mejor tu contenido y lo posiciona mejor</p>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Tipos de Schema más populares</h2>
            <ul className={styles.schemaList}>
              <li><strong>Article:</strong> Para blogs, noticias y artículos</li>
              <li><strong>Product:</strong> Para tiendas online con precios y disponibilidad</li>
              <li><strong>FAQPage:</strong> Para secciones de preguntas frecuentes</li>
              <li><strong>LocalBusiness:</strong> Para negocios físicos con dirección</li>
              <li><strong>Recipe:</strong> Para recetas con ingredientes y tiempos</li>
              <li><strong>Review:</strong> Para reseñas con puntuaciones</li>
              <li><strong>Event:</strong> Para eventos con fecha y ubicación</li>
              <li><strong>HowTo:</strong> Para tutoriales paso a paso</li>
            </ul>
          </section>

          <section className={styles.eduSection}>
            <h2>Validación y testing</h2>
            <p>
              Después de añadir el Schema a tu página, es importante validarlo:
            </p>
            <ul className={styles.tipsList}>
              <li><strong>Rich Results Test:</strong> Herramienta oficial de Google para validar datos estructurados</li>
              <li><strong>Schema Validator:</strong> Validador de schema.org para sintaxis</li>
              <li><strong>Search Console:</strong> Monitoriza errores de Schema en tu sitio</li>
            </ul>
          </section>

          {/* ── SECCIÓN 1: Tabla Comparativa ── */}
          <section className={styles.eduSection}>
            <h2>Comparativa de tipos de Schema.org más usados</h2>
            <p>
              Elige el tipo de schema más adecuado según tu sitio. Los rich results
              que genera cada tipo influyen directamente en la visibilidad en Google.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Propiedades obligatorias</th>
                    <th>Rich results que genera</th>
                    <th>Tipo de sitio ideal</th>
                    <th>Dificultad</th>
                    <th>Impacto SEO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Article</strong></td>
                    <td>headline, author, datePublished, image</td>
                    <td>Top stories, carrusel de noticias</td>
                    <td>Blog, medio de comunicación</td>
                    <td>Baja</td>
                    <td>Alto en noticias</td>
                  </tr>
                  <tr>
                    <td><strong>Product</strong></td>
                    <td>name, offers (price, priceCurrency)</td>
                    <td>Precio, disponibilidad, reseñas en SERP</td>
                    <td>Tienda e-commerce</td>
                    <td>Media</td>
                    <td>Muy alto</td>
                  </tr>
                  <tr>
                    <td><strong>LocalBusiness</strong></td>
                    <td>name, address, telephone</td>
                    <td>Panel de conocimiento, mapa local</td>
                    <td>Negocio físico, restaurante, clínica</td>
                    <td>Baja</td>
                    <td>Alto en búsqueda local</td>
                  </tr>
                  <tr>
                    <td><strong>FAQPage</strong></td>
                    <td>mainEntity (Question + Answer)</td>
                    <td>FAQs desplegables bajo el resultado</td>
                    <td>Cualquier sitio con preguntas</td>
                    <td>Baja</td>
                    <td>Alto (ocupa más espacio)</td>
                  </tr>
                  <tr>
                    <td><strong>BreadcrumbList</strong></td>
                    <td>item (ListItem con position y name)</td>
                    <td>Breadcrumbs en la URL del resultado</td>
                    <td>Sitios con estructura profunda</td>
                    <td>Muy baja</td>
                    <td>Medio (mejora UX de clic)</td>
                  </tr>
                  <tr>
                    <td><strong>Event</strong></td>
                    <td>name, startDate, location</td>
                    <td>Carrusel de eventos, fecha/lugar visible</td>
                    <td>Agenda cultural, conciertos, talleres</td>
                    <td>Media</td>
                    <td>Alto para búsquedas de eventos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── SECCIÓN 2: Casos de Uso ── */}
          <section className={styles.eduSection}>
            <h2>Casos de uso reales</h2>
            <p>
              Cómo aplican el schema markup cuatro tipos de proyectos web habituales
              en España para maximizar su visibilidad orgánica.
            </p>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
                  <h3>Tienda e-commerce</h3>
                </div>
                <p>Una tienda de moda online con 500 productos usa <strong>Product</strong> en cada ficha con precio, disponibilidad y rating. Las reseñas con <strong>AggregateRating</strong> aparecen como estrellas en Google Shopping y la SERP orgánica.</p>
                <div className={styles.escenarioExample}>
                  <strong>Schema combinado:</strong> Product + AggregateRating + BreadcrumbList
                </div>
                <div className={styles.escenarioTip}>
                  Resultado: estrellas + precio + stock directamente en Google, CTR +25%
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">✍️</span>
                  <h3>Blog con artículos y FAQs</h3>
                </div>
                <p>Un blog de marketing digital usa <strong>Article</strong> en cada post con autor, fecha y imagen. En los artículos con sección de preguntas añade <strong>FAQPage</strong>, consiguiendo hasta 5 preguntas desplegables en los resultados.</p>
                <div className={styles.escenarioExample}>
                  <strong>Schema combinado:</strong> Article + FAQPage + BreadcrumbList
                </div>
                <div className={styles.escenarioTip}>
                  Resultado: acceso a Top Stories + FAQs desplegables bajo el snippet
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🏪</span>
                  <h3>Negocio local</h3>
                </div>
                <p>Un restaurante en Madrid usa <strong>LocalBusiness</strong> (subtipo Restaurant) con dirección, horarios, teléfono y rango de precios. El panel de conocimiento de Google muestra esta información directamente en la búsqueda local.</p>
                <div className={styles.escenarioExample}>
                  <strong>Schema combinado:</strong> Restaurant + AggregateRating + OpeningHoursSpecification
                </div>
                <div className={styles.escenarioTip}>
                  Resultado: panel de conocimiento enriquecido y mayor conversión local
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🎭</span>
                  <h3>Organizador de eventos culturales</h3>
                </div>
                <p>Una sala de conciertos en Barcelona usa <strong>Event</strong> para cada espectáculo con nombre, fecha, lugar y precio de entrada. Google muestra un carrusel de eventos con fechas y precio directamente en la SERP.</p>
                <div className={styles.escenarioExample}>
                  <strong>Schema combinado:</strong> Event + Place + Offer + Performer
                </div>
                <div className={styles.escenarioTip}>
                  Resultado: carrusel de eventos, visibilidad máxima para búsquedas de agenda
                </div>
              </div>
            </div>
          </section>

          {/* ── SECCIÓN 3: FAQ ── */}
          <section className={styles.eduSection}>
            <h2>Preguntas frecuentes sobre Schema Markup</h2>
            <ul className={styles.faqList}>
              <li className={styles.faqItem}>
                <strong className={styles.faqQuestion}>¿Qué es Schema.org y por qué importa para el SEO?</strong>
                <p>
                  Schema.org es un vocabulario colaborativo creado en 2011 por Google, Bing, Yahoo y Yandex
                  para estandarizar los datos estructurados en la web. Al implementarlo, le dices a los
                  buscadores exactamente qué tipo de contenido tiene tu página (un producto, un artículo,
                  una receta…), lo que les permite mostrar rich results: resultados visualmente enriquecidos
                  con estrellas, precios, imágenes o FAQs que aumentan la tasa de clic entre un 20 y un 30%.
                </p>
              </li>

              <li className={styles.faqItem}>
                <strong className={styles.faqQuestion}>¿Cuál es la diferencia entre JSON-LD, Microdata y RDFa?</strong>
                <p>
                  Los tres son formatos para añadir datos estructurados, pero funcionan de manera diferente.
                  <strong> JSON-LD</strong> es un bloque JavaScript en el &lt;head&gt; o &lt;body&gt; separado del HTML visible —
                  Google lo recomienda oficialmente desde 2016 por ser más fácil de mantener y no mezclar
                  lógica con contenido. <strong>Microdata</strong> y <strong>RDFa</strong> se insertan como atributos dentro del
                  propio HTML, lo que los hace más difíciles de gestionar y actualizar. Para proyectos
                  nuevos, usa siempre JSON-LD.
                </p>
                <div className={styles.faqTip}>
                  Google recomienda JSON-LD oficialmente desde 2016. Es el formato más sencillo de implementar y depurar.
                </div>
              </li>

              <li className={styles.faqItem}>
                <strong className={styles.faqQuestion}>¿Cómo valido el schema con Google?</strong>
                <p>
                  Usa la herramienta oficial <strong>Rich Results Test</strong> (search.google.com/test/rich-results):
                  introduce la URL de tu página o pega directamente el código y verás si el schema es
                  válido y qué rich results puede generar. También puedes usar el <strong>Schema Markup Validator</strong>
                  (validator.schema.org) para validar la sintaxis según las especificaciones de schema.org,
                  independientemente de Google. Ambas herramientas son gratuitas.
                </p>
              </li>

              <li className={styles.faqItem}>
                <strong className={styles.faqQuestion}>¿Cuánto tarda en aparecer el rich snippet en Google?</strong>
                <p>
                  Generalmente, Google tarda entre <strong>1 y 2 semanas</strong> en procesar los datos estructurados
                  y empezar a mostrar rich results, aunque puede variar según la frecuencia de rastreo
                  de tu sitio. Después de publicar, puedes solicitar el rastreo manual desde Google
                  Search Console (Inspección de URL → Solicitar indexación) para acelerar el proceso.
                  Los resultados se monitorizan en la sección &quot;Mejoras&quot; de Search Console.
                </p>
              </li>

              <li className={styles.faqItem}>
                <strong className={styles.faqQuestion}>¿Todos los sitios web necesitan schema markup?</strong>
                <p>
                  No es técnicamente obligatorio, pero sí muy recomendable para la mayoría de sitios.
                  El impacto es especialmente alto en <strong>e-commerce</strong> (estrellitas y precio en SERP),
                  <strong> negocios locales</strong> (panel de conocimiento) y <strong>blogs</strong> (Top Stories). Para sitios
                  muy simples tipo landing page de un solo producto o portfolio personal, el beneficio
                  es menor, aunque nunca perjudica implementarlo correctamente.
                </p>
              </li>

              <li className={styles.faqItem}>
                <strong className={styles.faqQuestion}>¿El schema markup afecta a los Core Web Vitals o al rendimiento?</strong>
                <p>
                  El impacto en rendimiento es prácticamente nulo. Un bloque JSON-LD típico pesa entre
                  1 y 5 KB, lo que no afecta al LCP, FID ni CLS. Sin embargo, si generas el schema
                  dinámicamente en el cliente con JavaScript, puede retrasar ligeramente el reconocimiento
                  por parte de Google — es preferible renderizarlo en el servidor (SSR) o como contenido
                  estático para garantizar que Google lo lee en el primer rastreo.
                </p>
              </li>

              <li className={styles.faqItem}>
                <strong className={styles.faqQuestion}>¿Puedo tener schema duplicado en la misma página?</strong>
                <p>
                  Depende del tipo. Está <strong>permitido</strong> tener múltiples schemas del mismo tipo si describen
                  entidades distintas (por ejemplo, varios Product en una página de comparativa). Está
                  <strong> desaconsejado</strong> duplicar el mismo schema para el mismo contenido, ya que puede confundir
                  a Google. Lo más habitual es combinar schemas distintos en la misma página: por ejemplo,
                  Article + FAQPage + BreadcrumbList en un artículo de blog.
                </p>
              </li>

              <li className={styles.faqItem}>
                <strong className={styles.faqQuestion}>¿Cómo implemento schema markup en WordPress o Next.js?</strong>
                <p>
                  En <strong>WordPress</strong>: los plugins Yoast SEO, Rank Math o Schema Pro generan automáticamente
                  el JSON-LD para los tipos más comunes (Article, Product con WooCommerce, LocalBusiness).
                  En <strong>Next.js</strong>: añade el JSON-LD en el componente de metadatos o directamente en el
                  &lt;head&gt; usando el componente Script con strategy=&quot;beforeInteractive&quot;, o mejor aún,
                  renderízalo como texto estático en el servidor para que Google lo lea sin ejecutar JS.
                </p>
                <div className={styles.faqTip}>
                  En Next.js App Router puedes usar next/script con dangerouslySetInnerHTML para inyectar el JSON-LD en el servidor.
                </div>
              </li>
            </ul>
          </section>

          {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
          <section className={styles.eduSection}>
            <h2>Guía paso a paso para implementar schema markup</h2>
            <p>
              Sigue estos 7 pasos para implementar schema markup correctamente
              y maximizar las posibilidades de obtener rich results en Google.
            </p>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div className={styles.stepContent}>
                  <h4>Identifica el tipo de schema adecuado</h4>
                  <p>
                    Analiza qué tipo de contenido tiene cada página: un artículo, un producto, una
                    receta, un negocio local… Consulta la documentación oficial de schema.org para
                    elegir el tipo más específico disponible (por ejemplo, <em>Restaurant</em> en vez de
                    <em> LocalBusiness</em> si es un restaurante). Cuanto más específico, mejor.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}>
                  <h4>Identifica las propiedades obligatorias y recomendadas</h4>
                  <p>
                    Cada tipo tiene propiedades obligatorias (sin ellas Google no generará rich results)
                    y propiedades recomendadas que enriquecen el resultado. Consulta la documentación
                    de Google sobre rich results para saber exactamente qué propiedades necesitas.
                    Por ejemplo, Product requiere <em>name</em> y <em>offers</em> como mínimo.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div className={styles.stepContent}>
                  <h4>Genera el JSON-LD con esta herramienta</h4>
                  <p>
                    Rellena el formulario de arriba con los datos reales de tu página. Usa
                    URLs absolutas (https://tudominio.com/imagen.jpg, no /imagen.jpg).
                    Asegúrate de que todos los datos coinciden exactamente con el contenido
                    visible en la página: Google penaliza el schema que no refleja el contenido real.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <div className={styles.stepContent}>
                  <h4>Valida el schema antes de publicarlo</h4>
                  <p>
                    Copia el código generado y pégalo en el <strong>Rich Results Test</strong> de Google
                    (search.google.com/test/rich-results). La herramienta te indica si el schema
                    es válido, qué rich results puede generar y si hay propiedades que faltan.
                    Corrige todos los errores antes de publicar.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">5</span>
                <div className={styles.stepContent}>
                  <h4>Añádelo al &lt;head&gt; de tu página HTML</h4>
                  <p>
                    Pega el bloque <code>&lt;script type=&quot;application/ld+json&quot;&gt;</code> dentro del
                    &lt;head&gt; de tu página. En WordPress puedes usar un plugin como Yoast SEO o
                    insertar el código manualmente con un child theme. En Next.js, renderízalo
                    en el servidor para que Google lo lea sin necesitar JavaScript.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">6</span>
                <div className={styles.stepContent}>
                  <h4>Solicita el rastreo en Google Search Console</h4>
                  <p>
                    Entra en Search Console, usa la herramienta <strong>Inspección de URL</strong> con
                    la página donde has añadido el schema y pulsa <em>Solicitar indexación</em>.
                    Esto acelera el proceso de reconocimiento por parte de Google. Sin este paso,
                    puede tardar semanas en detectar el cambio.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">7</span>
                <div className={styles.stepContent}>
                  <h4>Monitoriza los resultados en Search Console</h4>
                  <p>
                    En Google Search Console, la sección <strong>Mejoras</strong> muestra el estado de
                    todos los tipos de rich results detectados en tu sitio: elementos válidos,
                    con advertencias o con errores. Revísala cada 2-4 semanas, especialmente
                    tras actualizaciones de contenido o cambios en el schema. Los rich snippets
                    suelen aparecer en la SERP entre 1 y 2 semanas después de la indexación.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* ── SECCIÓN 5: Mejores Prácticas ── */}
          <section className={styles.eduSection}>
            <h2>Mejores prácticas para schema markup</h2>
            <p>
              6 consejos accionables para sacar el máximo rendimiento a tus datos
              estructurados y evitar penalizaciones de Google.
            </p>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">✅</span>
                <h4>Usa siempre JSON-LD</h4>
                <p>
                  Google prefiere JSON-LD oficialmente desde 2016. Es más fácil de mantener,
                  no mezcla lógica con HTML y puedes actualizarlo sin tocar el diseño de la página.
                  Evita Microdata y RDFa en proyectos nuevos.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔑</span>
                <h4>Incluye siempre las propiedades obligatorias</h4>
                <p>
                  Cada tipo de schema tiene propiedades que Google exige para generar rich results.
                  Sin ellas, el schema es válido sintácticamente pero no produce ningún resultado
                  enriquecido. Consulta siempre la documentación de Google Rich Results.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔗</span>
                <h4>URLs absolutas, nunca relativas</h4>
                <p>
                  En propiedades como <code>image</code>, <code>url</code> o <code>logo</code>, usa siempre
                  URLs absolutas: <em>https://tudominio.com/imagen.jpg</em> en lugar de <em>/imagen.jpg</em>.
                  Las URLs relativas pueden confundir a los rastreadores y hacer inválido el schema.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">👁️</span>
                <h4>El schema debe reflejar el contenido visible</h4>
                <p>
                  Google compara el schema con el contenido real de la página. Si marcas un precio
                  en el schema que no aparece en la página, o un rating que el usuario no puede ver,
                  Google puede desactivar los rich results e incluso penalizar el sitio por engañoso.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧪</span>
                <h4>Valida siempre antes de publicar</h4>
                <p>
                  Antes de subir cualquier cambio al servidor, valida el schema en el Rich Results
                  Test de Google y el Schema Markup Validator. Un schema con errores de sintaxis
                  no genera ningún rich result, aunque el contenido sea correcto.
                </p>
              </div>

              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📊</span>
                <h4>Monitoriza en Search Console regularmente</h4>
                <p>
                  Google actualiza periódicamente sus guías de rich results y puede dejar de
                  soportar ciertos tipos o propiedades. Revisa la sección Mejoras de Search Console
                  cada mes para detectar errores nuevos y mantener los rich snippets activos.
                  Los cambios de algoritmo pueden invalidar schemas que antes funcionaban.
                </p>
              </div>
            </div>
          </section>

          {/* ── SECCIÓN 6: Warning Box ── */}
          <section className={styles.eduSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <h3>Errores comunes que invalidan tu schema markup</h3>
              </div>
              <p>
                Estos errores son los más frecuentes en auditorías SEO técnicas en España.
                Cometerlos hace que Google ignore tu schema o, en casos graves, aplique penalizaciones
                manuales por contenido engañoso.
              </p>
              <ul className={styles.warningList}>
                <li>
                  <strong>Schema que no coincide con el contenido visible:</strong> Marcar un precio
                  de 9,99 € en el schema cuando la página muestra 19,99 € es una infracción directa
                  de las directrices de Google y puede resultar en una acción manual.
                </li>
                <li>
                  <strong>Propiedades obligatorias ausentes:</strong> Publicar un Product schema sin
                  la propiedad <code>offers</code> o un Article sin <code>author</code> hace que Google
                  ignore completamente el schema para rich results, aunque no genere errores de sintaxis.
                </li>
                <li>
                  <strong>URLs relativas en lugar de absolutas:</strong> Usar <code>/images/producto.jpg</code>
                  en vez de <code>https://tienda.com/images/producto.jpg</code> provoca que Google no
                  pueda resolver la imagen y la propiedad quede vacía en el procesamiento.
                </li>
                <li>
                  <strong>Schema en páginas sin ese contenido:</strong> Añadir FAQPage schema en una
                  página que no tiene preguntas y respuestas, o Product schema en una página de categoría,
                  va contra las directrices de Google y puede resultar en la desactivación de rich results
                  para todo el dominio.
                </li>
                <li>
                  <strong>Ignorar las actualizaciones de Google:</strong> Google modifica sus requisitos
                  de rich results periódicamente. Un schema que funcionaba perfectamente en 2022 puede
                  necesitar propiedades adicionales en 2024. Suscríbete al blog de Google Search Central
                  para recibir avisos de cambios.
                </li>
                <li>
                  <strong>Marcar toda la web con el mismo tipo genérico:</strong> Aplicar el schema
                  WebPage o Article a todas las páginas del sitio, incluyendo fichas de producto,
                  páginas de contacto y políticas legales, reduce la precisión semántica y puede
                  anular rich results más específicos que Google hubiera generado con el tipo correcto.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-schema-markup')} />

      <ShareCard appName="generador-schema-markup" />
      <Footer appName="generador-schema-markup" />
    </div>
  );
}
