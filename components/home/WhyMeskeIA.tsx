import styles from './WhyMeskeIA.module.css'

export default function WhyMeskeIA() {
  const benefits = [
    {
      icon: '📱',
      title: '100% Gratuito',
      description: 'Todas las aplicaciones son completamente gratuitas, sin costos ocultos ni suscripciones'
    },
    {
      icon: '🔒',
      title: 'Privacidad Total',
      description: 'Tus datos se procesan localmente en tu navegador. No los almacenamos en servidores'
    },
    {
      icon: '⚡',
      title: 'Rápido y Ligero',
      description: 'Aplicaciones optimizadas para cargar rápido y funcionar sin interrupciones'
    },
    {
      icon: '🌍',
      title: 'En Español',
      description: 'Todas las Apps en español con formato europeo (fechas, moneda, decimales)'
    },
    {
      icon: '📚',
      title: 'Educación',
      description: 'Cada App incluye guías educativas y casos de uso prácticos reales'
    },
    {
      icon: '🎨',
      title: 'Responsive',
      description: 'Diseño adaptado perfectamente a móvil, tablet y escritorio'
    }
  ]

  return (
    <section className={styles.whySection}>
      <h2 className={styles.title}>¿Por qué meskeIA?</h2>
      <div className={styles.benefitsGrid}>
        {benefits.map((benefit, index) => (
          <div key={index} className={styles.benefitCard}>
            <div className={styles.icon}>{benefit.icon}</div>
            <h3 className={styles.benefitTitle}>{benefit.title}</h3>
            <p className={styles.benefitDescription}>{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
