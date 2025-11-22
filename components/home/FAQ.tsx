'use client'

import { useState } from 'react'
import styles from './FAQ.module.css'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: '¿Son realmente gratuitas todas las aplicaciones?',
      answer: 'Sí, completamente gratuitas sin registro, sin anuncios y sin costos ocultos. Todas las 84 aplicaciones están disponibles para usar libremente.'
    },
    {
      question: '¿Qué datos recogéis de los usuarios?',
      answer: 'Ninguno. Todas las aplicaciones funcionan localmente en tu navegador. No almacenamos tus datos en servidores. Solo usamos analytics anónimas para mejorar el servicio.'
    },
    {
      question: '¿Puedo usar las aplicaciones offline?',
      answer: 'La mayoría funcionan offline después de la primera carga, ya que se procesan en tu navegador. Solo las que requieren datos externos (conversor de divisas, clima) necesitan conexión.'
    },
    {
      question: '¿Por qué todo está en español y formato europeo?',
      answer: 'meskeIA está diseñado específicamente para usuarios hispanohablantes, con formato de fechas DD/MM/YYYY, números con coma decimal (1.234,56 €) y ejemplos locales.'
    },
    {
      question: '¿Cómo puedo sugerir nuevas herramientas?',
      answer: 'Puedes contactarnos en meskeia24@gmail.com con tus sugerencias. Estamos constantemente añadiendo nuevas aplicaciones basadas en las necesidades de nuestros usuarios.'
    },
    {
      question: '¿Las aplicaciones funcionan en móvil?',
      answer: 'Sí, todas las aplicaciones tienen diseño responsive optimizado para móviles, tablets y escritorio. La experiencia es fluida en cualquier dispositivo.'
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className={styles.faqSection}>
      <h2 className={styles.title}>Preguntas Frecuentes</h2>
      <div className={styles.faqContainer}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <button
              className={`${styles.faqQuestion} ${openIndex === index ? styles.active : ''}`}
              onClick={() => toggleFAQ(index)}
              type="button"
            >
              <span>{faq.question}</span>
              <span className={styles.icon}>{openIndex === index ? '−' : '+'}</span>
            </button>
            {openIndex === index && (
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
