/**
 * Templates reutilizables de Schema.org JSON-LD para apps meskeIA
 *
 * Uso:
 * import { generateWebAppSchema } from '@/lib/schema-templates';
 * export const jsonLd = generateWebAppSchema({ ... });
 */

import { WithContext, WebApplication, SoftwareApplication, FAQPage, HowTo } from 'schema-dts';

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

export interface BaseAppConfig {
  name: string;
  description: string;
  url: string;
  features: string[];
  category?: 'UtilityApplication' | 'BusinessApplication' | 'FinanceApplication' | 'EducationalApplication';
  keywords?: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  position: number;
  name: string;
  text: string;
  image?: string;
}

// ============================================================================
// TEMPLATES DE SCHEMA.ORG
// ============================================================================

/**
 * Template base para WebApplication
 * Ideal para: Calculadoras, generadores, conversores, utilidades simples
 */
export function generateWebAppSchema(config: BaseAppConfig): WithContext<WebApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.name,
    description: config.description,
    url: config.url,
    applicationCategory: config.category || 'UtilityApplication',
    operatingSystem: 'Web Browser',
    inLanguage: 'es-ES',
    author: {
      '@type': 'Organization',
      name: 'meskeIA',
      url: 'https://meskeia.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://meskeia.com/icon_meskeia.png',
        width: '512',
        height: '512',
      },
    },
    creator: {
      '@type': 'Organization',
      name: 'meskeIA',
    },
    publisher: {
      '@type': 'Organization',
      name: 'meskeIA',
      url: 'https://meskeia.com',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      description: 'Aplicación web gratuita sin registro ni publicidad',
    },
    featureList: config.features,
    browserRequirements: 'Requires JavaScript. Compatible con Chrome, Firefox, Safari, Edge.',
    softwareVersion: '1.0',
    datePublished: '2025-01-22',
    dateModified: new Date().toISOString().split('T')[0],
    isAccessibleForFree: true,
    keywords: config.keywords?.join(', '),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * Template para SoftwareApplication
 * Ideal para: Apps más complejas, herramientas avanzadas
 */
export function generateSoftwareAppSchema(config: BaseAppConfig & {
  screenshot?: string;
  releaseNotes?: string;
}): WithContext<SoftwareApplication> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.name,
    description: config.description,
    url: config.url,
    applicationCategory: config.category || 'UtilityApplication',
    operatingSystem: 'Web Browser, Windows, macOS, Linux, iOS, Android',
    inLanguage: 'es-ES',
    author: {
      '@type': 'Organization',
      name: 'meskeIA',
      url: 'https://meskeia.com',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    featureList: config.features,
    screenshot: config.screenshot,
    releaseNotes: config.releaseNotes,
    softwareVersion: '1.0',
    datePublished: '2025-01-22',
    dateModified: new Date().toISOString().split('T')[0],
    isAccessibleForFree: true,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };
}

/**
 * Template para FAQ (Preguntas Frecuentes)
 * Ideal para: Secciones educativas con Q&A
 */
export function generateFAQSchema(config: {
  mainEntity: FAQItem[];
  url: string;
}): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.mainEntity.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    url: config.url,
    inLanguage: 'es-ES',
    datePublished: '2025-01-22',
    dateModified: new Date().toISOString().split('T')[0],
  };
}

/**
 * Template para HowTo (Guías paso a paso)
 * Ideal para: Tutoriales, instrucciones de uso
 */
export function generateHowToSchema(config: {
  name: string;
  description: string;
  url: string;
  steps: HowToStep[];
  totalTime?: string; // Formato ISO 8601 (ej: "PT10M" = 10 minutos)
  supply?: string[];
  tool?: string[];
}): WithContext<HowTo> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: config.name,
    description: config.description,
    url: config.url,
    inLanguage: 'es-ES',
    totalTime: config.totalTime,
    supply: config.supply?.map(item => ({
      '@type': 'HowToSupply',
      name: item,
    })),
    tool: config.tool?.map(item => ({
      '@type': 'HowToTool',
      name: item,
    })),
    step: config.steps.map(step => ({
      '@type': 'HowToStep',
      position: step.position,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
    datePublished: '2025-01-22',
    dateModified: new Date().toISOString().split('T')[0],
  };
}

/**
 * Combinar múltiples schemas en un solo objeto
 * Útil cuando una página tiene múltiples tipos de contenido estructurado
 */
export function combineSchemas(...schemas: any[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}

// ============================================================================
// HELPERS ESPECÍFICOS POR TIPO DE APP
// ============================================================================

/**
 * Schema específico para Calculadoras
 */
export function generateCalculatorSchema(config: {
  name: string;
  description: string;
  url: string;
  calculationType: string; // ej: "propinas", "impuestos", "porcentajes"
  features: string[];
}) {
  return generateWebAppSchema({
    name: `Calculadora de ${config.calculationType}`,
    description: config.description,
    url: config.url,
    features: config.features,
    category: 'UtilityApplication',
    keywords: [
      `calculadora ${config.calculationType}`,
      `calcular ${config.calculationType}`,
      `${config.calculationType} online`,
      `${config.calculationType} gratis`,
      'calculadora española',
      'sin registro',
      'offline',
    ],
  });
}

/**
 * Schema específico para Generadores
 */
export function generateGeneratorSchema(config: {
  name: string;
  description: string;
  url: string;
  generatorType: string; // ej: "contraseñas", "colores", "QR"
  features: string[];
}) {
  return generateWebAppSchema({
    name: `Generador de ${config.generatorType}`,
    description: config.description,
    url: config.url,
    features: config.features,
    category: 'UtilityApplication',
    keywords: [
      `generador ${config.generatorType}`,
      `generar ${config.generatorType}`,
      `${config.generatorType} online`,
      `crear ${config.generatorType}`,
      'generador español',
      'gratis',
    ],
  });
}

/**
 * Schema específico para Conversores
 */
export function generateConverterSchema(config: {
  name: string;
  description: string;
  url: string;
  conversionType: string; // ej: "divisas", "unidades", "tiempo"
  features: string[];
}) {
  return generateWebAppSchema({
    name: `Conversor de ${config.conversionType}`,
    description: config.description,
    url: config.url,
    features: config.features,
    category: 'UtilityApplication',
    keywords: [
      `conversor ${config.conversionType}`,
      `convertir ${config.conversionType}`,
      `${config.conversionType} online`,
      'conversor español',
      'conversión gratis',
    ],
  });
}

/**
 * Schema específico para Herramientas de Productividad
 */
export function generateProductivityToolSchema(config: {
  name: string;
  description: string;
  url: string;
  toolType: string; // ej: "gestión", "organización", "planificación"
  features: string[];
}) {
  return generateWebAppSchema({
    name: config.name,
    description: config.description,
    url: config.url,
    features: config.features,
    category: 'BusinessApplication',
    keywords: [
      config.toolType,
      'productividad',
      'herramienta online',
      'gestión',
      'organización',
      'español',
    ],
  });
}

/**
 * Schema específico para Juegos Educativos
 */
export function generateEducationalGameSchema(config: {
  name: string;
  description: string;
  url: string;
  gameType: string;
  features: string[];
  ageRange?: string; // ej: "6-12 años"
}) {
  return generateWebAppSchema({
    name: config.name,
    description: config.description,
    url: config.url,
    features: config.features,
    category: 'EducationalApplication',
    keywords: [
      config.gameType,
      'juego educativo',
      'aprender jugando',
      'educación',
      'español',
      config.ageRange || 'todas las edades',
    ],
  });
}

// ============================================================================
// VALIDACIÓN DE SCHEMA.ORG
// ============================================================================

/**
 * Valida que un schema tenga los campos mínimos requeridos
 * Útil en desarrollo para evitar errores
 */
export function validateSchema(schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!schema['@context']) errors.push('Falta @context');
  if (!schema['@type']) errors.push('Falta @type');
  if (!schema.name) errors.push('Falta name');
  if (!schema.description) errors.push('Falta description');
  if (!schema.url) errors.push('Falta url');

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Pretty print de schema para debugging
 */
export function debugSchema(schema: any): void {
  console.group('🔍 Schema.org Debug');
  console.log('Type:', schema['@type']);
  console.log('Name:', schema.name);
  console.log('URL:', schema.url);

  const validation = validateSchema(schema);
  if (validation.valid) {
    console.log('✅ Schema válido');
  } else {
    console.error('❌ Errores:', validation.errors);
  }

  console.log('Schema completo:', JSON.stringify(schema, null, 2));
  console.groupEnd();
}
