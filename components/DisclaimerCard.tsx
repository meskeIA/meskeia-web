'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import styles from './DisclaimerCard.module.css';

export type DisclaimerVariant = 'financial' | 'general' | 'medical' | 'educational' | 'technical' | 'alcohol';
export type DisclaimerSeverity = 'critical' | 'high' | 'medium' | 'low';

interface DisclaimerCardProps {
  variant: DisclaimerVariant;
  severity?: DisclaimerSeverity;
  title?: string;
  children?: ReactNode;
  showTermsLink?: boolean;
  /**
   * Política de disclaimers meskeIA (_private/DISCLAIMER-POLICY.md):
   * - severity "critical" o "high" → collapsible ignorado, siempre expandido
   * - severity "medium" → si true, usa sessionStorage (se expande en cada sesión)
   * - severity "low" → si true, usa localStorage (persiste entre sesiones)
   */
  collapsible?: boolean;
  context?: string; // Clave de storage (ej: 'planificador-menu')
}

const DEFAULT_TITLES: Record<DisclaimerVariant, string> = {
  financial: 'Información Importante sobre Herramientas Financieras',
  medical: 'Aviso Médico Importante',
  general: 'Información Importante',
  educational: 'Aviso Educativo',
  technical: 'Información Técnica Importante',
  alcohol: 'Aviso importante: bebida alcohólica',
};

const DEFAULT_ICONS: Record<DisclaimerVariant, string> = {
  financial: '⚠️',
  medical: '⚕️',
  general: 'ℹ️',
  educational: '📚',
  technical: '🔧',
  alcohol: '🍷',
};

// Severidades que NUNCA pueden ser colapsadas (Niveles 1 y 2 de la política)
const NON_COLLAPSIBLE_SEVERITIES: DisclaimerSeverity[] = ['critical', 'high'];

export default function DisclaimerCard({
  variant,
  severity = 'high',
  title,
  children,
  showTermsLink = false,
  collapsible = false,
  context,
}: DisclaimerCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Determinar si realmente puede ser colapsable según la política
  const isCollapsibleAllowed = collapsible && !NON_COLLAPSIBLE_SEVERITIES.includes(severity);

  // severity "medium" → sessionStorage | severity "low" → localStorage
  const useSessionStorage = severity === 'medium';

  useEffect(() => {
    if (!isCollapsibleAllowed || !context) return;

    const storageKey = `disclaimer_read_${context}`;
    const storage = useSessionStorage ? sessionStorage : localStorage;
    const wasRead = storage.getItem(storageKey) === 'true';

    // Solo colapsar automáticamente en nivel "low" (localStorage persiste)
    // En nivel "medium" (sessionStorage) siempre expandido al iniciar sesión
    if (!useSessionStorage && wasRead) {
      setIsExpanded(false);
    }
  }, [isCollapsibleAllowed, context, useSessionStorage]);

  const handleToggle = () => {
    if (!isCollapsibleAllowed) return;

    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    if (!newExpandedState && context) {
      const storageKey = `disclaimer_read_${context}`;
      const storage = useSessionStorage ? sessionStorage : localStorage;
      storage.setItem(storageKey, 'true');
    }
  };

  const displayTitle = title || DEFAULT_TITLES[variant];
  const icon = DEFAULT_ICONS[variant];

  const cardClasses = [
    styles.disclaimerCard,
    styles[`variant-${variant}`],
    styles[`severity-${severity}`],
    !isExpanded && styles.collapsed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} role={severity === 'critical' ? 'alert' : 'note'}>
      <div
        className={styles.header}
        onClick={isCollapsibleAllowed ? handleToggle : undefined}
        style={isCollapsibleAllowed ? { cursor: 'pointer' } : undefined}
      >
        <div className={styles.titleWrapper}>
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
          <h3 className={styles.title}>{displayTitle}</h3>
        </div>
        {isCollapsibleAllowed && (
          <button
            type="button"
            className={styles.toggleButton}
            aria-label={isExpanded ? 'Ocultar aviso' : 'Mostrar aviso'}
            aria-expanded={isExpanded}
          >
            <span aria-hidden="true">{isExpanded ? '▼' : '▶'}</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={styles.content}>
          {children || <DefaultContent variant={variant} severity={severity} />}

          {showTermsLink && (
            <p className={styles.termsLink}>
              Para más información, consulta nuestros{' '}
              <Link href="/terminos">Términos de Uso</Link> y{' '}
              <Link href="/privacidad">Política de Privacidad</Link>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Contenido estándar según variante y severidad (_private/DISCLAIMER-POLICY.md)
function DefaultContent({
  variant,
  severity,
}: {
  variant: DisclaimerVariant;
  severity: DisclaimerSeverity;
}) {
  const isCriticalOrHigh = severity === 'critical' || severity === 'high';

  switch (variant) {
    case 'financial':
      if (isCriticalOrHigh) {
        return (
          <>
            <p>
              Esta herramienta tiene <strong>carácter exclusivamente orientativo</strong> y no
              constituye asesoramiento financiero, fiscal ni jurídico. Los resultados son
              estimaciones basadas en los datos introducidos y pueden no reflejar tu situación real.
            </p>
            <p>
              <strong>
                La fiscalidad y las decisiones financieras de alto impacto requieren la intervención
                de un profesional cualificado
              </strong>{' '}
              (asesor fiscal, gestor, abogado o entidad financiera regulada).
            </p>
            <p className={styles.responsibility}>
              <strong>TÚ ERES RESPONSABLE</strong> de verificar esta información con un profesional
              antes de tomar cualquier decisión. meskeIA no ejerce actividades reguladas y no se
              responsabiliza de las consecuencias derivadas del uso de esta herramienta.
            </p>
          </>
        );
      }
      return (
        <>
          <p>
            Esta herramienta tiene <strong>carácter orientativo</strong>. Los resultados son
            estimaciones y no constituyen asesoramiento financiero ni fiscal.
          </p>
          <p>
            Te recomendamos contrastar los resultados con un profesional cualificado antes de tomar
            decisiones importantes.
          </p>
          <p className={styles.limitation}>
            meskeIA no se responsabiliza de decisiones basadas en el uso de esta herramienta.
          </p>
        </>
      );

    case 'medical':
      if (isCriticalOrHigh) {
        return (
          <>
            <p>
              Esta herramienta tiene <strong>carácter exclusivamente orientativo</strong> y no
              constituye diagnóstico médico, prescripción ni consejo sanitario. Los resultados son
              estimaciones de referencia y no reemplazan la valoración clínica individualizada.
            </p>
            <p>
              <strong>
                Cualquier decisión relacionada con tu salud debe tomarse siempre bajo la supervisión
                de un médico o profesional sanitario cualificado.
              </strong>
            </p>
            <p className={styles.responsibility}>
              <strong>TÚ ERES RESPONSABLE</strong> de consultar con un profesional antes de actuar
              sobre esta información. meskeIA no ejerce actividades sanitarias reguladas y no se
              responsabiliza de las consecuencias derivadas del uso de esta herramienta.
            </p>
            <p className={styles.emergency}>
              <strong>EMERGENCIAS MÉDICAS:</strong> En caso de síntomas graves, contacta
              inmediatamente con los servicios de emergencia (112 en España).
            </p>
          </>
        );
      }
      return (
        <>
          <p>
            Esta herramienta tiene <strong>carácter orientativo</strong>. Los resultados son
            referencias generales y no sustituyen la valoración de un profesional sanitario.
          </p>
          <p>
            Consulta siempre con tu médico o especialista antes de realizar cambios significativos
            en tu salud o hábitos.
          </p>
          <p className={styles.limitation}>
            meskeIA no se responsabiliza de decisiones basadas en el uso de esta herramienta.
          </p>
        </>
      );

    case 'educational':
      return (
        <>
          <p>
            <strong>Este contenido es educativo y orientativo.</strong>
          </p>
          <ul className={styles.list}>
            <li>Los resultados son estimaciones para fines de aprendizaje</li>
            <li>Verifica la información con fuentes oficiales cuando sea necesario</li>
            <li>Consulta con profesionales para aplicaciones prácticas importantes</li>
          </ul>
        </>
      );

    case 'technical':
      return (
        <>
          <p>
            Esta herramienta tiene <strong>carácter orientativo</strong> y está dirigida a
            profesionales del dominio que conocen sus limitaciones.
          </p>
          <p className={styles.limitation}>
            meskeIA no se responsabiliza de decisiones basadas en el uso de esta herramienta.
          </p>
        </>
      );

    case 'alcohol':
      return (
        <>
          <p>
            Esta herramienta es <strong>educativa e informativa</strong> y describe variedades,
            estilos y maridajes de bebidas alcohólicas. <strong>Solo apta para personas mayores de edad</strong>
            {' '}(18 años en España, edad legal según país de residencia).
          </p>
          <p>
            El consumo de alcohol conlleva <strong>riesgos para la salud</strong>: efectos
            cardiovasculares, hepáticos, neurológicos, riesgo de dependencia y consecuencias
            sobre el embarazo. Ninguna cantidad de alcohol está exenta de riesgo.
          </p>
          <p>
            <strong>Nunca conduzcas, manejes maquinaria peligrosa ni tomes decisiones críticas
            tras consumir alcohol.</strong> Si necesitas ayuda con el consumo problemático,
            contacta con tu médico o con líneas de ayuda especializadas.
          </p>
          <p className={styles.limitation}>
            meskeIA no promueve el consumo de alcohol y no se responsabiliza del uso que se
            haga de esta información. Bebe con moderación y responsabilidad.
          </p>
        </>
      );

    case 'general':
    default:
      if (isCriticalOrHigh) {
        return (
          <>
            <p>
              La información proporcionada por esta herramienta tiene{' '}
              <strong>carácter exclusivamente orientativo</strong> y no constituye asesoramiento
              profesional.
            </p>
            <p className={styles.responsibility}>
              <strong>TÚ ERES RESPONSABLE</strong> de verificar esta información con un profesional
              cualificado antes de tomar decisiones. meskeIA no se responsabiliza de las
              consecuencias derivadas del uso de esta herramienta.
            </p>
          </>
        );
      }
      return (
        <>
          <p>
            La información proporcionada tiene <strong>carácter orientativo</strong>. Los resultados
            pueden variar según tu situación particular.
          </p>
          <p className={styles.limitation}>
            meskeIA no se responsabiliza de decisiones basadas en el uso de esta herramienta.
          </p>
        </>
      );
  }
}
