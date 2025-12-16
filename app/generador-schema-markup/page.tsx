'use client';

import { useState } from 'react';
import styles from './GeneradorSchemaMarkup.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps} from '@/components';
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

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.panelTitle}>Tipo de Schema</h2>

          <div className={styles.schemaTypes}>
            {schemaTypes.map((type) => (
              <button
                key={type.id}
                className={`${styles.schemaTypeBtn} ${schemaType === type.id ? styles.active : ''}`}
                onClick={() => setSchemaType(type.id as SchemaType)}
              >
                <span className={styles.schemaIcon}>{type.icon}</span>
                <span className={styles.schemaName}>{type.name}</span>
                <span className={styles.schemaDesc}>{type.desc}</span>
              </button>
            ))}
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              {schemaTypes.find(t => t.id === schemaType)?.icon} Datos de {schemaTypes.find(t => t.id === schemaType)?.name}
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
                <button className={styles.addFaqBtn} onClick={addFaqItem}>
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
                <span className={styles.benefitIcon}>⭐</span>
                <h4>Rich Snippets</h4>
                <p>Estrellas, precios, disponibilidad directamente en Google</p>
              </div>
              <div className={styles.benefitCard}>
                <span className={styles.benefitIcon}>📈</span>
                <h4>Mayor CTR</h4>
                <p>Los resultados enriquecidos destacan más y reciben más clics</p>
              </div>
              <div className={styles.benefitCard}>
                <span className={styles.benefitIcon}>🔍</span>
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
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-schema-markup')} />

      <Footer appName="generador-schema-markup" />
    </div>
  );
}
